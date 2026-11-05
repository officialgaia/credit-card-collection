import { describe, expect, it } from "vitest";
import { campaignId, normalizeUrl } from "../src/lib/url.js";
import { parseJapaneseDate } from "../src/lib/text.js";
import { buildProfile, DUMMY_PROFILE, splitPhone } from "../src/profile.js";
import { isClosed, isComplete } from "../src/engine/detect.js";
import { pickSafeOption } from "../src/engine/classify.js";

describe("URL正規化と重複判定", () => {
  it("トラッキング・www・末尾スラッシュ・フラグメント・クエリ順を無視", () => {
    const a = "https://www.Example.com/campaign/?b=2&a=1&utm_source=x#form";
    const b = "http://example.com/campaign?a=1&b=2";
    expect(normalizeUrl(a)).toBe("https://example.com/campaign?a=1&b=2");
    expect(campaignId(a)).toBe(campaignId(b));
  });
  it("twitter.com と x.com は同一", () => {
    expect(campaignId("https://twitter.com/foo/status/1")).toBe(campaignId("https://x.com/foo/status/1"));
  });
  it("違うページは別ID", () => {
    expect(campaignId("https://example.com/a")).not.toBe(campaignId("https://example.com/b"));
  });
});

describe("日付", () => {
  const now = new Date("2026-11-05T00:00:00+09:00");
  it.each([
    ["締切：2026年11月30日(月)23:59", "2026-11-30"],
    ["2026/12/1まで", "2026-12-01"],
    ["応募締切 １２月２５日", "2026-12-25"],
    ["1/15まで", "2027-01-15"],
    ["期限なし", null],
  ])("%s", (t, expected) => {
    expect(parseJapaneseDate(t, now)).toBe(expected);
  });
});

describe("プロフィール", () => {
  it("派生値", () => {
    const p = buildProfile({ ...DUMMY_PROFILE, lastNameKana: "けんしょう" }, new Date("2026-04-14T12:00:00+09:00"));
    expect(p.lastNameKana).toBe("ケンショウ");
    expect(p.lastNameHira).toBe("けんしょう");
    expect(p.zip1 + p.zip2).toBe("1000001");
    expect(p.age).toBe(35);
  });
  it("電話番号分割", () => {
    expect(splitPhone("09012345678")).toEqual(["090", "1234", "5678"]);
    expect(splitPhone("0312345678")).toEqual(["03", "1234", "5678"]);
    expect(splitPhone("0451234567")).toEqual(["045", "123", "4567"]);
  });
  it("必須項目が無ければエラー（値はメッセージに含めない）", () => {
    expect(() => buildProfile({ ...DUMMY_PROFILE, email: "" })).toThrow(/email/);
  });
});

describe("判定キーワード", () => {
  it.each(["ご応募ありがとうございました", "応募を受け付けました", "応募が完了しました", "エントリー完了"])("完了: %s", (t) =>
    expect(isComplete(t)).toBe(true),
  );
  it.each(["本キャンペーンは終了しました", "応募受付は終了いたしました", "応募期間は終了しました"])("締切: %s", (t) =>
    expect(isClosed(t)).toBe(true),
  );
  it("キャンペーン終了後の発送の案内は締切扱いしない", () => {
    expect(isClosed("賞品はキャンペーン終了後、順次発送いたします")).toBe(false);
  });
  it("無難な選択肢", () => {
    expect(pickSafeOption([{ text: "とても好き" }, { text: "どちらでもない" }])?.text).toBe("どちらでもない");
    expect(pickSafeOption([{ text: "その他" }, { text: "テレビ" }])?.text).toBe("テレビ");
  });
});
