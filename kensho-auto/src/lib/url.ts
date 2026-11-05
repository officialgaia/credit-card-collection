import { createHash } from "node:crypto";

const TRACKING_PARAMS = [/^utm_/i, /^fbclid$/i, /^gclid$/i, /^yclid$/i, /^mc_(cid|eid)$/i, /^ref$/i, /^ref_src$/i, /^_ga$/i, /^s$/i, /^t$/i];

/** 重複判定用にURLを正規化する（同じ懸賞が別のURL表記で来ても同一とみなす） */
export function normalizeUrl(input: string): string {
  const u = new URL(input.trim());
  u.protocol = "https:";
  u.hostname = u.hostname.toLowerCase().replace(/^www\./, "").replace(/^mobile\./, "");
  if (u.hostname === "twitter.com") u.hostname = "x.com";
  u.hash = "";
  u.port = "";
  const params = [...u.searchParams.entries()]
    .filter(([k]) => !TRACKING_PARAMS.some((re) => re.test(k)))
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  u.search = "";
  for (const [k, v] of params) u.searchParams.append(k, v);
  let path = u.pathname.replace(/\/{2,}/g, "/");
  path = path.replace(/\/(index\.(html?|php))$/i, "/");
  if (path.length > 1) path = path.replace(/\/$/, "");
  u.pathname = path;
  return u.toString();
}

export function campaignId(url: string): string {
  return createHash("sha256").update(normalizeUrl(url)).digest("hex").slice(0, 16);
}

export function isXUrl(url: string): boolean {
  try {
    const h = new URL(url).hostname.replace(/^www\.|^mobile\./, "");
    return h === "x.com" || h === "twitter.com";
  } catch {
    return false;
  }
}
