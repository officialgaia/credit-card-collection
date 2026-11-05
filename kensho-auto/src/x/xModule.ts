import { mkdirSync } from "node:fs";
import { join } from "node:path";
import type { Browser, BrowserContext, Page } from "playwright";
import type { Config } from "../config.js";
import { newContext } from "../engine/apply.js";
import { randomBetween, sleep, todayJst } from "../lib/text.js";
import { canApply, saveEntries, upsertEntry } from "../store.js";
import type { Campaign, EntriesFile, Entry, EntryStatus } from "../types.js";

/**
 * X（旧Twitter）のフォロー＆リポスト型キャンペーンを処理する。
 * - 初期設定では無効（config.yaml の x.enabled: false）
 * - 認証はユーザーが自分のブラウザから取り出した Cookie（Secrets: X_COOKIES_JSON）
 * - ログイン画面・本人確認・ロックが出たら即停止して manual にする（回避はしない）
 */

interface CookieLike {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: string | null;
  expirationDate?: number;
  expires?: number;
}

export function parseXCookies(json: string): Parameters<BrowserContext["addCookies"]>[0] {
  const data = JSON.parse(json) as CookieLike[] | Record<string, string>;
  const list: CookieLike[] = Array.isArray(data)
    ? data
    : Object.entries(data).map(([name, value]) => ({ name, value }));
  const sameSite = (s?: string | null): "Strict" | "Lax" | "None" => {
    const v = (s ?? "").toLowerCase();
    if (v === "strict") return "Strict";
    if (v === "lax") return "Lax";
    return "None";
  };
  return list
    .filter((c) => c.name && c.value)
    .map((c) => ({
      name: c.name,
      value: c.value,
      domain: (c.domain ?? ".x.com").replace("twitter.com", "x.com"),
      path: c.path ?? "/",
      secure: c.secure ?? true,
      httpOnly: c.httpOnly ?? false,
      sameSite: sameSite(c.sameSite),
      expires: c.expires ?? c.expirationDate ?? -1,
    }));
}

/** x.com/<user>/status/<id> から投稿者とIDを取り出す */
export function parseStatusUrl(url: string): { user: string; statusId: string } | null {
  try {
    const u = new URL(url);
    if (!/^(www\.|mobile\.)?(x|twitter)\.com$/.test(u.hostname)) return null;
    const m = u.pathname.match(/^\/([A-Za-z0-9_]{1,15})\/status(?:es)?\/(\d+)/);
    return m ? { user: m[1], statusId: m[2] } : null;
  } catch {
    return null;
  }
}

class StopX extends Error {}

async function guard(page: Page): Promise<void> {
  const url = page.url();
  if (/\/(login|i\/flow|account\/access|i\/flow\/login|i\/flow\/consent)/.test(url)) {
    throw new StopX(`Xのログイン／本人確認画面に遷移しました (${new URL(url).pathname})`);
  }
  const wall = await page
    .locator('[data-testid="loginButton"], [data-testid="LoginForm_Login_Button"], input[name="text"][autocomplete="username"], iframe[src*="arkose"], iframe[src*="funcaptcha"]')
    .first()
    .isVisible()
    .catch(() => false);
  if (wall) throw new StopX("Xのログイン／本人確認が求められました");
  const text = await page.evaluate(() => document.body?.innerText ?? "").catch(() => "");
  if (/アカウントがロックされています|本人確認|Verify your identity|Your account has been locked|unusual activity|不審なアクティビティ|ロボットではない/i.test(text)) {
    throw new StopX("Xで本人確認・ロックの表示が出ました");
  }
}

async function open(page: Page, url: string): Promise<void> {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.waitForTimeout(randomBetween(2500, 5000));
  await guard(page);
}

async function followAndRepost(page: Page, user: string, statusUrl: string): Promise<{ status: EntryStatus; reason: string | null }> {
  // フォロー
  await open(page, `https://x.com/${user}`);
  const unfollow = page.locator('[data-testid$="-unfollow"]').first();
  if (!(await unfollow.isVisible().catch(() => false))) {
    const follow = page.locator('[data-testid$="-follow"]').first();
    if (!(await follow.isVisible({ timeout: 10_000 }).catch(() => false))) {
      return { status: "manual", reason: `@${user} のフォローボタンが見つからない` };
    }
    await follow.click();
    await page.waitForTimeout(randomBetween(2000, 4000));
    await guard(page);
  }
  // リポスト
  await open(page, statusUrl);
  const article = page.locator("article").first();
  if (await article.locator('[data-testid="unretweet"]').first().isVisible().catch(() => false)) {
    return { status: "success", reason: "フォロー＆リポスト（リポスト済み）" };
  }
  const rt = article.locator('[data-testid="retweet"]').first();
  if (!(await rt.isVisible({ timeout: 10_000 }).catch(() => false))) {
    return { status: "manual", reason: "リポストボタンが見つからない（削除・非公開の可能性）" };
  }
  await rt.click();
  const confirm = page.locator('[data-testid="retweetConfirm"]').first();
  await confirm.click({ timeout: 10_000 });
  await page.waitForTimeout(randomBetween(2000, 4000));
  await guard(page);
  return { status: "success", reason: "フォロー＆リポスト" };
}

export async function runXModule(
  browser: Browser,
  config: Config,
  campaigns: Campaign[],
  entriesFile: EntriesFile,
  opts: { dryRun: boolean; screenshotDir: string },
): Promise<Record<string, number>> {
  const summary: Record<string, number> = {};
  if (!config.x.enabled) return summary;
  if (opts.dryRun) {
    console.log("[X] dry-run のため X モジュールはスキップします");
    return summary;
  }
  const cookieJson = process.env.X_COOKIES_JSON;
  if (!cookieJson) {
    console.log("[X] X_COOKIES_JSON が未設定のためスキップします");
    return summary;
  }
  const today = todayJst();
  const doneToday = entriesFile.entries.filter(
    (e) => e.method === "x" && e.lastAttemptAt && todayJst(new Date(e.lastAttemptAt)) === today && e.attempts > 0,
  ).length;
  const remaining = Math.max(0, config.x.dailyLimit - doneToday);
  const byId = new Map(entriesFile.entries.map((e) => [e.id, e]));
  const targets = campaigns
    .filter((c) => c.method === "x" && parseStatusUrl(c.url))
    .filter((c) => !c.deadline || c.deadline >= today)
    .filter((c) => canApply(byId.get(c.id), 1))
    .slice(0, remaining);
  console.log(`[X] 本日の処理済み ${doneToday} 件 / 上限 ${config.x.dailyLimit} 件 / 今回の対象 ${targets.length} 件`);
  if (!targets.length) return summary;

  const ctx = await newContext(browser);
  try {
    await ctx.addCookies(parseXCookies(cookieJson));
  } catch {
    console.log("[X] X_COOKIES_JSON を読み込めませんでした");
    await ctx.close();
    return summary;
  }
  const page = await ctx.newPage();
  mkdirSync(opts.screenshotDir, { recursive: true });
  try {
    for (let i = 0; i < targets.length; i++) {
      const c = targets[i];
      if (i > 0) await sleep(randomBetween(config.x.minIntervalSec * 1000, config.x.maxIntervalSec * 1000));
      const s = parseStatusUrl(c.url)!;
      let result: { status: EntryStatus; reason: string | null };
      let stop = false;
      try {
        result = await followAndRepost(page, s.user, c.url);
      } catch (e) {
        if (e instanceof StopX) {
          result = { status: "manual", reason: e.message };
          stop = true;
        } else {
          result = { status: "failed", reason: `例外: ${e instanceof Error ? e.message.split("\n")[0].slice(0, 150) : e}` };
        }
      }
      const at = new Date().toISOString();
      let shot: string | null = `${c.id}-x.png`;
      await page.screenshot({ path: join(opts.screenshotDir, shot) }).catch(() => (shot = null));
      const entry: Entry = {
        id: c.id, url: c.url, title: c.title, method: "x", status: result.status, reason: result.reason,
        attempts: (byId.get(c.id)?.attempts ?? 0) + 1, submitted: result.status === "success",
        lastAttemptAt: at, appliedAt: result.status === "success" ? at : null, screenshot: shot,
      };
      upsertEntry(entriesFile, entry);
      saveEntries(entriesFile);
      summary[result.status] = (summary[result.status] ?? 0) + 1;
      console.log(`[X] ${c.title || c.url} → ${result.status}${result.reason ? `（${result.reason}）` : ""}`);
      if (stop) {
        console.log("[X] ログイン／本人確認が出たため、X の処理を中止します。Cookie を取り直してください");
        break;
      }
    }
  } finally {
    await ctx.close();
  }
  return summary;
}
