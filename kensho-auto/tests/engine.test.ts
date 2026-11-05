import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { chromium, type Browser } from "playwright";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { applyToCampaign, newContext } from "../src/engine/apply.js";
import { planFill } from "../src/engine/classify.js";
import { applyActions, collectFields } from "../src/engine/page.js";
import { buildProfile, DUMMY_PROFILE } from "../src/profile.js";
import { startFixtureServer } from "./server.js";

const profile = buildProfile(DUMMY_PROFILE, new Date("2026-11-05T00:00:00+09:00"));
let browser: Browser;
let server: Awaited<ReturnType<typeof startFixtureServer>>;
const shots = mkdtempSync(join(tmpdir(), "kensho-shots-"));

beforeAll(async () => {
  browser = await chromium.launch();
  server = await startFixtureServer();
});
afterAll(async () => {
  await browser?.close();
  await server?.close();
});

/** フォームを読み込んで入力し、各項目の値を name => value で返す */
async function fillAndRead(path: string) {
  const ctx = await newContext(browser);
  const page = await ctx.newPage();
  await page.goto(`${server.url}/${path}`);
  const fields = await collectFields(page);
  const plan = planFill(fields, profile);
  await applyActions(page, plan.actions);
  const values = await page.evaluate(() => {
    const out: Record<string, string | boolean> = {};
    document.querySelectorAll<HTMLInputElement>("input, select, textarea").forEach((el) => {
      if (el.type === "radio") {
        if (el.checked) out[el.name] = el.value;
      } else if (el.type === "checkbox") {
        out[`${el.name}:${el.value}`] = el.checked;
      } else if (el.name) out[el.name] = el.value;
    });
    return out;
  });
  await ctx.close();
  return { values, plan };
}

const opts = (id: string, dryRun = false) => ({ dryRun, screenshotDir: shots, id });

describe("フォーム入力", () => {
  it("姓名分割・カナ・郵便番号分割・電話3分割・生年月日セレクト・性別ラジオ", async () => {
    const { values, plan } = await fillAndRead("basic/form.html");
    expect(plan.manualReasons).toEqual([]);
    expect(values).toMatchObject({
      sei: "懸賞",
      mei: "太郎",
      sei_kana: "ケンショウ",
      mei_kana: "タロウ",
      zip1: "100",
      zip2: "0001",
      pref: "13",
      city: "千代田区",
      address2: "千代田1-1",
      building: "テストハイツ101",
      tel1: "090",
      tel2: "0000",
      tel3: "0000",
      email: "dummy@example.com",
      email_confirm: "dummy@example.com",
      birth_year: "1990",
      birth_month: "04",
      birth_day: "15",
      gender: "1",
      q1: "tv",
      "agree:1": true,
      "mailmag:1": false,
    });
  });

  it("テーブルレイアウト・ひらがな・単一欄・date型・年代・非表示チェックボックス", async () => {
    const { values, plan } = await fillAndRead("table/form.html");
    expect(plan.manualReasons).toEqual([]);
    expect(values).toMatchObject({
      q: "",
      f001: "懸賞　太郎",
      f002: "けんしょう　たろう",
      f003: "100-0001",
      f004: "東京都",
      f005: "千代田区千代田1-1 テストハイツ101",
      f006: "09000000000",
      f007: "dummy@example.com",
      f008: "1990-04-15",
      f009: "30代",
      f010: "お茶",
      f011: "3",
      f012: "",
      "f013:yes": true,
    });
  });

  it("dl レイアウト・位置で判定する分割欄・和暦付き年・性別セレクト・必須チェック群", async () => {
    const { values, plan } = await fillAndRead("dlsplit/form.html");
    expect(plan.manualReasons).toEqual([]);
    expect(values).toMatchObject({
      name1: "懸賞",
      name2: "太郎",
      kana1: "ケンショウ",
      kana2: "タロウ",
      postcode1: "100",
      postcode2: "0001",
      todofuken: "pref13",
      jusho: "千代田区千代田1-1 テストハイツ101",
      phone_a: "090",
      phone_b: "0000",
      phone_c: "0000",
      mail: "dummy@example.com",
      b1: "1990",
      b2: "4",
      b3: "15",
      gender: "m",
      "season[]:spring": true,
      "news:1": false,
      "policy:1": true,
    });
  });
});

describe("応募フロー", () => {
  it("確認画面 → 送信 → 完了 を success と判定", async () => {
    const r = await applyToCampaign(browser, `${server.url}/basic/form.html`, profile, opts("basic"));
    expect(r.status).toBe("success");
    expect(r.submitted).toBe(true);
    expect(r.screenshot).toBeTruthy();
  });

  it("1段階送信（POST）で完了", async () => {
    const r = await applyToCampaign(browser, `${server.url}/table/form.html`, profile, opts("table"));
    expect(r.status).toBe("success");
  });

  it("同一ページ内で完了表示に切り替わるフォーム", async () => {
    const r = await applyToCampaign(browser, `${server.url}/dlsplit/form.html`, profile, opts("dl"));
    expect(r.status).toBe("success");
  });

  it("ランディングページから応募リンクをたどる", async () => {
    const r = await applyToCampaign(browser, `${server.url}/landing.html`, profile, opts("landing"));
    expect(r.status).toBe("success");
  });

  it("dry-run は送信せずスクショのみ", async () => {
    const r = await applyToCampaign(browser, `${server.url}/basic/form.html`, profile, opts("dry", true));
    expect(r.dryRunStopped).toBe(true);
    expect(r.submitted).toBe(false);
    expect(r.screenshot).toBe("dry-dryrun.png");
  });

  it.each([
    ["captcha.html", "manual", /CAPTCHA/],
    ["login.html", "manual", /ログイン/],
    ["sms.html", "manual", /SMS|認証/],
    ["freetext.html", "manual", /記述式/],
    ["closed.html", "closed", /終了/],
    ["not-found.html", "closed", /404/],
  ])("%s → %s", async (path, status, reason) => {
    const r = await applyToCampaign(browser, `${server.url}/${path}`, profile, opts(path));
    expect(r.status).toBe(status);
    expect(r.reason).toMatch(reason);
    expect(r.submitted).toBe(false);
  });
});
