import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { collectFromSource, detectMethod, extractDeadline, findApplyLink, parseFeed } from "../src/collect/collector.js";
import { startFixtureServer } from "./server.js";

let server: Awaited<ReturnType<typeof startFixtureServer>>;
beforeAll(async () => {
  server = await startFixtureServer();
});
afterAll(async () => {
  await server?.close();
});

const now = new Date("2026-11-05T00:00:00+09:00");
const base = () => ({ maxNew: 30, intervalMs: 0, now, knownIds: new Set<string>(), knownVia: new Set<string>() });

describe("抽出", () => {
  it.each([
    ["締切：2026年11月30日", "2026-11-30"],
    ["応募期間：2026年11月1日〜2026年12月15日", "2026-12-15"],
    ["2026/12/10(水)23:59まで", "2026-12-10"],
    ["キャンペーン期間 11/1～11/20", "2026-11-20"],
    ["毎日抽選", null],
  ])("締切 %s", (t, d) => expect(extractDeadline(t, now)).toBe(d));

  it("応募方式", () => {
    expect(detectMethod("https://x.com/a/status/1", "")).toBe("x");
    expect(detectMethod("https://example.com", "フォロー＆リポストで応募")).toBe("x");
    expect(detectMethod("https://example.com", "レシートを撮影して応募")).toBe("other");
    expect(detectMethod("https://example.com", "応募フォームから")).toBe("web");
  });

  it("Atom", () => {
    const items = parseFeed(`<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom"><entry><title>A</title><link rel="alternate" href="https://e.com/a"/><summary>締切 12/1</summary></entry></feed>`);
    expect(items).toEqual([{ title: "A", link: "https://e.com/a", text: "締切 12/1" }]);
  });

  it("シェアボタンを除外して応募リンクを選ぶ", () => {
    const html = `<article><a href="https://twitter.com/intent/tweet">ポスト</a><a href="https://line.me/R/msg">LINE</a><a href="/other">関連記事</a><a href="https://brand.jp/cp/2026">公式キャンペーンページ</a></article>`;
    expect(findApplyLink(html, "https://matome.example.com/post/1")?.url).toBe("https://brand.jp/cp/2026");
  });
});

describe("収集", () => {
  it("RSS → 記事 → 応募ページ。締切切れは除外、X は method=x", async () => {
    const list = await collectFromSource({ id: "t", type: "rss", url: `${server.url}/collect/feed.xml` }, base());
    expect(list.map((c) => [c.title, c.method, c.deadline])).toEqual([
      ["【100名】最新ゲーム機が当たる！", "web", "2099-12-31"],
      ["フォロー＆リポストでギフト券1000円分", "x", "2026-12-31"],
    ]);
    expect(list[0].url).toBe(`${server.url}/basic/form.html`);
    expect(list[0].prize).toBe("最新ゲーム機");
    expect(list[0].via).toMatch(/article1\.html$/);
    expect(list[1].url).toBe("https://x.com/example_cp/status/1234567890");
  });

  it("登録済みはスキップ", async () => {
    const opts = base();
    await collectFromSource({ id: "t", type: "rss", url: `${server.url}/collect/feed.xml` }, opts);
    const again = await collectFromSource({ id: "t", type: "rss", url: `${server.url}/collect/feed.xml` }, opts);
    expect(again).toEqual([]);
  });

  it("一覧ページ（CSSセレクタ）", async () => {
    const list = await collectFromSource(
      { id: "l", type: "html", url: `${server.url}/collect/list.html`, follow: false, itemSelector: "li.cp", titleSelector: ".t", deadlineSelector: ".d", prizeSelector: ".p" },
      base(),
    );
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ title: "冬のプレゼント", url: "https://brand.example.jp/cp/winter", deadline: "2099-01-15", prize: "旅行券", source: "l" });
  });
});
