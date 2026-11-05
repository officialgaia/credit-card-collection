import { mkdirSync } from "node:fs";
import { join } from "node:path";
import type { Browser, BrowserContext, Locator, Page } from "playwright";
import type { Profile } from "../profile.js";
import type { ApplyResult } from "../types.js";
import { planFill } from "./classify.js";
import { detectBlocker, isClosed, isComplete, VALIDATION_ERROR_RE } from "./detect.js";
import { applyActions, bodyText, collectFields, reapplyIfChanged } from "./page.js";

export interface ApplyOptions {
  dryRun: boolean;
  screenshotDir: string;
  /** スクショのファイル名に使う（個人情報を含まないID） */
  id: string;
  navigationTimeoutMs?: number;
  log?: (msg: string) => void;
}

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36";

export async function newContext(browser: Browser): Promise<BrowserContext> {
  const ctx = await browser.newContext({
    locale: "ja-JP",
    timezoneId: "Asia/Tokyo",
    userAgent: UA,
    viewport: { width: 1280, height: 900 },
  });
  // tsx/esbuild が関数に挿入する __name ヘルパーを page.evaluate 内でも使えるように
  await ctx.addInitScript("window.__name = window.__name || ((f) => f);");
  return ctx;
}

/** 応募ページへのリンク／ボタン（ランディングページ用） */
const ENTRY_LINK_RE = /今すぐ応募|応募(する|はこちら|フォーム|ページ|画面|に進む|へ進む)|エントリー(する|はこちら|フォーム)|応募$|^応募|apply now|enter now/i;
const NEXT_BUTTON_RE = /確認|次へ|進む|送信|応募|エントリー|申し?込|submit|confirm|next|send|apply|enter|この内容で|確定|登録/i;
const FINAL_BUTTON_RE = /送信|応募(する|を確定|を完了)?|この内容で|確定|完了|申し?込|登録|submit|send|apply/i;
const NEGATIVE_BUTTON_RE = /戻る|修正|訂正|キャンセル|リセット|クリア|やり直|back|reset|cancel|clear|ログイン|検索/i;

async function screenshot(page: Page, opts: ApplyOptions, suffix: string): Promise<string | null> {
  try {
    mkdirSync(opts.screenshotDir, { recursive: true });
    const file = `${opts.id}-${suffix}.png`;
    await page.screenshot({ path: join(opts.screenshotDir, file), fullPage: true, timeout: 15_000 });
    return file;
  } catch {
    return null;
  }
}

async function findButton(page: Page, re: RegExp): Promise<Locator | null> {
  const candidates = page.locator(
    'button, input[type="submit"], input[type="image"], input[type="button"], a[role="button"], [role="button"], a.btn, a.button, a[href^="javascript"]',
  );
  const n = await candidates.count();
  let best: { loc: Locator; score: number } | null = null;
  for (let i = 0; i < Math.min(n, 60); i++) {
    const loc = candidates.nth(i);
    if (!(await loc.isVisible().catch(() => false))) continue;
    const text = await loc
      .evaluate((el) => {
        const e = el as HTMLInputElement;
        return `${e.innerText ?? ""} ${e.value ?? ""} ${e.getAttribute("alt") ?? ""} ${e.getAttribute("aria-label") ?? ""} ${e.getAttribute("title") ?? ""}`;
      })
      .catch(() => "");
    const t = text.replace(/\s+/g, "");
    if (!t || NEGATIVE_BUTTON_RE.test(t)) continue;
    if (!re.test(t)) continue;
    const isSubmit = await loc.evaluate((el) => (el as HTMLButtonElement).type === "submit").catch(() => false);
    const inForm = await loc.evaluate((el) => !!el.closest("form")).catch(() => false);
    const score = (isSubmit ? 2 : 0) + (inForm ? 2 : 0) + (t.length < 20 ? 1 : 0);
    if (!best || score > best.score) best = { loc, score };
  }
  return best?.loc ?? null;
}

async function findEntryLink(page: Page): Promise<Locator | null> {
  const links = page.locator("a, button");
  const n = await links.count();
  for (let i = 0; i < Math.min(n, 300); i++) {
    const loc = links.nth(i);
    const t = ((await loc.innerText({ timeout: 1000 }).catch(() => "")) || (await loc.getAttribute("title", { timeout: 1000 }).catch(() => "")) || "")
      .replace(/\s+/g, "");
    const img = loc.locator("img");
    const alt = (await img.count()) ? await img.first().getAttribute("alt", { timeout: 1000 }).catch(() => null) : null;
    const label = t || alt || "";
    if (label && label.length < 30 && ENTRY_LINK_RE.test(label) && !NEGATIVE_BUTTON_RE.test(label)) {
      if (await loc.isVisible().catch(() => false)) return loc;
    }
  }
  return null;
}

/** クリックして遷移（新しいタブが開いた場合はそちらに切り替える） */
async function clickAndSettle(page: Page, loc: Locator): Promise<Page> {
  const ctx = page.context();
  const popup = ctx.waitForEvent("page", { timeout: 5000 }).catch(() => null);
  await Promise.all([
    page.waitForLoadState("domcontentloaded").catch(() => {}),
    loc.click({ timeout: 10_000 }).catch(async () => {
      await loc.evaluate((el) => (el as HTMLElement).click());
    }),
  ]);
  const newPage = await Promise.race([popup, new Promise<null>((r) => setTimeout(() => r(null), 1500))]);
  const target = newPage ?? page;
  await target.waitForLoadState("domcontentloaded", { timeout: 20_000 }).catch(() => {});
  await target.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => {});
  return target;
}

async function visibleTextInputCount(page: Page): Promise<number> {
  return page
    .evaluate(() => {
      return [...document.querySelectorAll("input, textarea, select")].filter((el) => {
        const t = (el as HTMLInputElement).type;
        if (["hidden", "submit", "button", "image", "reset", "checkbox", "radio"].includes(t)) return false;
        if ((el as HTMLInputElement).readOnly) return false;
        const s = getComputedStyle(el as HTMLElement);
        return s.display !== "none" && s.visibility !== "hidden" && (el as HTMLElement).getClientRects().length > 0;
      }).length;
    })
    .catch(() => 0);
}

/**
 * 1件の懸賞に応募する。
 * ページ遷移 → ブロッカー検出 → 入力 → （dry-runならここで停止）→ 確認画面 → 送信 → 完了判定
 */
export async function applyToCampaign(
  browser: Browser,
  url: string,
  profile: Profile,
  opts: ApplyOptions,
): Promise<ApplyResult> {
  const log = opts.log ?? (() => {});
  const ctx = await newContext(browser);
  let page = await ctx.newPage();
  page.setDefaultTimeout(15_000);
  let submitted = false;
  try {
    const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: opts.navigationTimeoutMs ?? 30_000 });
    await page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => {});
    if (res && (res.status() === 404 || res.status() === 410)) {
      return { status: "closed", reason: `ページが存在しません (HTTP ${res.status()})`, submitted, screenshot: null };
    }
    if (res && res.status() >= 400) {
      return { status: "failed", reason: `HTTP ${res.status()}`, submitted, screenshot: null };
    }

    // フォームが無ければ「応募する」リンクをたどる（最大2回）
    let fields = await collectFields(page);
    for (let hop = 0; hop < 2 && fields.filter((f) => f.type !== "checkbox").length < 2; hop++) {
      if (isClosed(await bodyText(page))) {
        return { status: "closed", reason: "応募受付終了の表示あり", submitted, screenshot: null };
      }
      const blocker = await detectBlocker(page, { formFieldCount: fields.length });
      if (blocker) return { status: "manual", reason: blocker.reason, submitted, screenshot: null };
      const link = await findEntryLink(page);
      if (!link) break;
      log("  応募リンクをたどります");
      page = await clickAndSettle(page, link);
      fields = await collectFields(page);
    }

    const text = await bodyText(page);
    if (fields.length < 2) {
      if (isClosed(text)) return { status: "closed", reason: "応募受付終了の表示あり", submitted, screenshot: null };
      const blocker = await detectBlocker(page, { formFieldCount: fields.length });
      if (blocker) return { status: "manual", reason: blocker.reason, submitted, screenshot: null };
      return { status: "manual", reason: "応募フォームが見つからない", submitted, screenshot: null };
    }
    if (isClosed(text) && !/必須/.test(text)) {
      return { status: "closed", reason: "応募受付終了の表示あり", submitted, screenshot: null };
    }
    const blocker = await detectBlocker(page, { formFieldCount: fields.length });
    if (blocker) return { status: "manual", reason: blocker.reason, submitted, screenshot: null };

    const plan = planFill(fields, profile);
    log(`  項目 ${fields.length} 件 / 入力 ${plan.actions.length} 件`);
    if (plan.manualReasons.length) {
      return { status: "manual", reason: plan.manualReasons.slice(0, 3).join(" / "), submitted, screenshot: null };
    }
    await applyActions(page, plan.actions);
    await page.waitForTimeout(800);
    await reapplyIfChanged(page, plan.actions);

    if (opts.dryRun) {
      const shot = await screenshot(page, opts, "dryrun");
      return { status: "success", reason: "dry-run: 送信直前で停止", submitted: false, screenshot: shot, dryRunStopped: true };
    }

    // 確認画面 → 送信 の最大3段階
    for (let step = 0; step < 3; step++) {
      const re = step === 0 ? NEXT_BUTTON_RE : FINAL_BUTTON_RE;
      const btn = (await findButton(page, re)) ?? (step > 0 ? await findButton(page, NEXT_BUTTON_RE) : null);
      if (!btn) {
        const shot = await screenshot(page, opts, `step${step}`);
        return { status: "failed", reason: step === 0 ? "送信ボタンが見つからない" : "確認画面の送信ボタンが見つからない", submitted, screenshot: shot };
      }
      const beforeUrl = page.url();
      const beforeText = await bodyText(page);
      page = await clickAndSettle(page, btn);
      submitted = true;
      await page.waitForTimeout(1000);
      const after = await bodyText(page);
      if (isComplete(after) && !isComplete(beforeText)) {
        const shot = await screenshot(page, opts, "done");
        return { status: "success", reason: null, submitted, screenshot: shot };
      }
      const inputs = await visibleTextInputCount(page);
      const unchanged = page.url() === beforeUrl && after === beforeText;
      if (unchanged || (inputs >= 2 && VALIDATION_ERROR_RE.test(after) && after !== beforeText && step === 0 && page.url() === beforeUrl)) {
        // ページが変わらない＝入力エラー等で先に進めていない
        const shot = await screenshot(page, opts, "error");
        return { status: "failed", reason: "送信できない（入力エラーの可能性）", submitted: false, screenshot: shot };
      }
      const blocker2 = await detectBlocker(page, { formFieldCount: inputs });
      if (blocker2) {
        const shot = await screenshot(page, opts, "blocked");
        return { status: "manual", reason: `確認画面以降で${blocker2.reason}`, submitted, screenshot: shot };
      }
      // 入力欄が残っている＝次のステップ（アンケート等）の可能性
      if (inputs >= 2) {
        const more = await collectFields(page);
        const plan2 = planFill(more, profile);
        if (plan2.manualReasons.length) {
          const shot = await screenshot(page, opts, "manual");
          return { status: "manual", reason: plan2.manualReasons.slice(0, 3).join(" / "), submitted, screenshot: shot };
        }
        await applyActions(page, plan2.actions);
      }
    }
    const shot = await screenshot(page, opts, "unknown");
    return { status: "failed", reason: "完了ページを確認できない", submitted, screenshot: shot };
  } catch (e) {
    const shot = await screenshot(page, opts, "exception");
    const msg = e instanceof Error ? e.message.split("\n")[0].slice(0, 200) : String(e);
    return { status: "failed", reason: `例外: ${msg}`, submitted, screenshot: shot };
  } finally {
    await ctx.close().catch(() => {});
  }
}
