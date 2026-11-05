import { describe, expect, it } from "vitest";
import { canApply, dedupeCampaigns } from "../src/store.js";
import { parseStatusUrl, parseXCookies } from "../src/x/xModule.js";
import { loadConfig } from "../src/config.js";
import type { Entry } from "../src/types.js";

const entry = (p: Partial<Entry>): Entry => ({
  id: "x", url: "https://e.com", title: "", method: "web", status: "failed", reason: null,
  attempts: 1, submitted: false, lastAttemptAt: "", appliedAt: null, screenshot: null, ...p,
});

describe("重複応募の防止", () => {
  it("success / manual / closed は再応募しない", () => {
    expect(canApply(undefined, 2)).toBe(true);
    expect(canApply(entry({ status: "success" }), 2)).toBe(false);
    expect(canApply(entry({ status: "manual" }), 2)).toBe(false);
    expect(canApply(entry({ status: "closed" }), 2)).toBe(false);
  });
  it("送信前の失敗は上限まで再試行、送信後の失敗は再試行しない", () => {
    expect(canApply(entry({ attempts: 1 }), 2)).toBe(true);
    expect(canApply(entry({ attempts: 2 }), 2)).toBe(false);
    expect(canApply(entry({ attempts: 1, submitted: true }), 2)).toBe(false);
  });
  it("表記ゆれのURLは1件にまとめる（手動追加分のIDも再計算）", () => {
    const list = dedupeCampaigns([
      { id: "", url: "https://www.example.com/cp/?utm_source=a", title: "A", deadline: null, prize: null, method: "web", source: "manual", addedAt: "2026-11-01" },
      { id: "bogus", url: "https://example.com/cp", title: "", deadline: "2026-12-01", prize: null, method: "web", source: "rss", addedAt: "2026-11-02" },
      { id: "", url: "not a url", title: "", deadline: null, prize: null, method: "web", source: "manual", addedAt: "2026-11-02" },
    ]);
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ title: "A", deadline: "2026-12-01", addedAt: "2026-11-01" });
    expect(list[0].id).toMatch(/^[0-9a-f]{16}$/);
  });
});

describe("Xモジュール", () => {
  it("初期設定では無効・上限10件", () => {
    const c = loadConfig();
    expect(c.x.enabled).toBe(false);
    expect(c.x.dailyLimit).toBe(10);
  });
  it("ポストURLの解析", () => {
    expect(parseStatusUrl("https://twitter.com/brand_cp/status/123?s=20")).toEqual({ user: "brand_cp", statusId: "123" });
    expect(parseStatusUrl("https://x.com/brand_cp")).toBeNull();
    expect(parseStatusUrl("https://example.com/a/status/1")).toBeNull();
  });
  it("Cookie: 拡張機能のエクスポート形式と {name: value} 形式", () => {
    const a = parseXCookies(JSON.stringify([{ name: "auth_token", value: "v", domain: ".twitter.com", sameSite: "no_restriction", expirationDate: 2000000000 }]));
    expect(a[0]).toMatchObject({ name: "auth_token", domain: ".x.com", sameSite: "None", expires: 2000000000 });
    const b = parseXCookies(JSON.stringify({ auth_token: "v", ct0: "w" }));
    expect(b.map((c) => c.name)).toEqual(["auth_token", "ct0"]);
  });
});
