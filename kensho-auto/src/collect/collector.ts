import * as cheerio from "cheerio";
import { XMLParser } from "fast-xml-parser";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import YAML from "yaml";
import { ROOT } from "../config.js";
import { parseJapaneseDate, sleep, toHalfWidth, todayJst } from "../lib/text.js";
import { campaignId, isXUrl } from "../lib/url.js";
import type { Campaign, Method } from "../types.js";

export interface Source {
  id: string;
  name?: string;
  type: "rss" | "html";
  url: string;
  enabled?: boolean;
  /** 記事ページをたどって懸賞元の応募ページURLを探すか（既定 true） */
  follow?: boolean;
  /** 記事ページ内の応募ページへのリンク（省略時は自動推定） */
  applyLinkSelector?: string;
  /** web / x / other / auto（既定 auto） */
  method?: Method | "auto";
  // type: html 用
  itemSelector?: string;
  titleSelector?: string;
  linkSelector?: string;
  deadlineSelector?: string;
  prizeSelector?: string;
}

export interface RawItem {
  title: string;
  link: string;
  text: string;
  deadline?: string | null;
  prize?: string | null;
}

export function loadSources(path = join(ROOT, "sources.yaml")): Source[] {
  try {
    const y = YAML.parse(readFileSync(path, "utf8")) as { sources?: Source[] } | null;
    return (y?.sources ?? []).filter((s) => s && s.id && s.url && s.type);
  } catch (e) {
    console.error(`sources.yaml を読めません: ${e instanceof Error ? e.message : e}`);
    return [];
  }
}

const UA = "Mozilla/5.0 (compatible; kensho-auto/0.1; personal sweepstakes collector)";

export async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml,application/xml,application/rss+xml;q=0.9,*/*;q=0.8", "Accept-Language": "ja" },
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  const buf = new Uint8Array(await res.arrayBuffer());
  // Shift_JIS / EUC-JP のサイトにも対応
  const ct = res.headers.get("content-type") ?? "";
  let charset = ct.match(/charset=([\w-]+)/i)?.[1];
  if (!charset) {
    const head = new TextDecoder("latin1").decode(buf.slice(0, 2048));
    charset = head.match(/<meta[^>]+charset=["']?([\w-]+)/i)?.[1] ?? head.match(/encoding=["']([\w-]+)["']/i)?.[1];
  }
  try {
    return new TextDecoder(charset?.toLowerCase() === "shift_jis" ? "shift_jis" : charset ?? "utf-8").decode(buf);
  } catch {
    return new TextDecoder("utf-8").decode(buf);
  }
}

/* ---------- robots.txt（簡易） ---------- */
const robotsCache = new Map<string, string[]>();
export async function allowedByRobots(url: string): Promise<boolean> {
  const u = new URL(url);
  let rules = robotsCache.get(u.origin);
  if (!rules) {
    rules = [];
    try {
      const txt = await fetchText(`${u.origin}/robots.txt`);
      let applies = false;
      for (const line of txt.split(/\r?\n/)) {
        const [k, ...rest] = line.replace(/#.*/, "").split(":");
        const v = rest.join(":").trim();
        if (/^user-agent$/i.test(k.trim())) applies = v === "*" || /kensho/i.test(v);
        else if (applies && /^disallow$/i.test(k.trim()) && v) rules.push(v);
      }
    } catch {
      /* robots.txt なし */
    }
    robotsCache.set(u.origin, rules);
  }
  return !rules.some((r) => u.pathname.startsWith(r.replace(/\*.*$/, "")));
}

/* ---------- テキストからの抽出 ---------- */
export function extractDeadline(text: string, now = new Date()): string | null {
  const t = toHalfWidth(text).replace(/\s+/g, " ");
  const DATE = String.raw`((?:20\d{2}\s*[年/.\-]\s*)?\d{1,2}\s*[月/.\-]\s*\d{1,2}\s*日?)`;
  const patterns = [
    new RegExp(String.raw`(?:締切|締め切り|〆切|しめきり|応募期限|応募締切|受付期限|期限)\s*[:：]?\s*(?:日)?\s*[:：]?\s*${DATE}`),
    new RegExp(String.raw`(?:応募期間|キャンペーン期間|募集期間|受付期間|実施期間|期間)\s*[:：]?[^。\n]{0,40}?[〜~～\-－ー至]\s*${DATE}`),
    new RegExp(String.raw`${DATE}[^。\n]{0,12}?(?:まで|締切|締め切り|〆切)`),
  ];
  for (const re of patterns) {
    const m = t.match(re);
    if (m) {
      const d = parseJapaneseDate(m[1], now);
      if (d) return d;
    }
  }
  return null;
}

export function extractPrize(text: string): string | null {
  const m = toHalfWidth(text).match(/(?:賞品|景品|プレゼント内容|プレゼント|賞)\s*[:：]\s*([^\n。]{1,80})/);
  if (!m) return null;
  // 同じ行に続く「締切：」等は切り落とす
  return m[1].split(/\s*(?:締切|締め切り|〆切|応募期間|期間|当選者?数|応募方法)\s*[:：]?/)[0].trim() || null;
}

export function detectMethod(url: string, text: string): Method {
  if (isXUrl(url)) return "x";
  if (/フォロー[&＆・]?(リポスト|RT|リツイート)|フォロー&RT|Xで応募|Twitterで応募|X\(旧Twitter\)で応募|ツイッターで応募/i.test(text)) return "x";
  if (/(ハガキ|はがき|官製|郵送|レシート|Instagram|インスタ|LINE(で|から)応募|TikTok)/i.test(text)) return "other";
  return "web";
}

/* ---------- RSS / Atom ---------- */
export function parseFeed(xml: string): RawItem[] {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@", textNodeName: "#text", processEntities: true });
  const doc = parser.parse(xml);
  const str = (v: unknown): string => {
    if (v == null) return "";
    if (typeof v === "string" || typeof v === "number") return String(v);
    if (typeof v === "object" && "#text" in (v as object)) return String((v as Record<string, unknown>)["#text"]);
    return "";
  };
  const stripHtml = (s: string) =>
    cheerio.load(`<div>${s.replace(/<br\s*\/?>|<\/(p|div|li|tr|h\d)>/gi, "\n$&")}</div>`)("div").text();
  const arr = <T>(v: T | T[] | undefined): T[] => (v == null ? [] : Array.isArray(v) ? v : [v]);
  const items: RawItem[] = [];
  const channel = doc?.rss?.channel ?? doc?.["rdf:RDF"];
  if (channel) {
    for (const it of arr(channel.item ?? doc?.["rdf:RDF"]?.item)) {
      const html = str(it["content:encoded"]) || str(it.description);
      items.push({ title: stripHtml(str(it.title)).trim(), link: str(it.link).trim(), text: stripHtml(html) });
    }
  } else if (doc?.feed) {
    for (const e of arr(doc.feed.entry)) {
      const links = arr(e.link) as Record<string, string>[];
      const link = links.find((l) => !l["@rel"] || l["@rel"] === "alternate")?.["@href"] ?? links[0]?.["@href"] ?? "";
      items.push({ title: stripHtml(str(e.title)).trim(), link, text: stripHtml(str(e.content) || str(e.summary)) });
    }
  }
  return items.filter((i) => i.link);
}

/* ---------- 一覧ページ ---------- */
export function parseListPage(html: string, src: Source): RawItem[] {
  const $ = cheerio.load(html);
  if (!src.itemSelector) return [];
  const items: RawItem[] = [];
  $(src.itemSelector).each((_, el) => {
    const item = $(el);
    const linkEl = src.linkSelector ? item.find(src.linkSelector).first() : item.is("a") ? item : item.find("a").first();
    const href = linkEl.attr("href");
    if (!href) return;
    let link: string;
    try {
      link = new URL(href, src.url).href;
    } catch {
      return;
    }
    const title = (src.titleSelector ? item.find(src.titleSelector).first().text() : linkEl.text()).replace(/\s+/g, " ").trim();
    const text = item.text().replace(/\s+/g, " ");
    items.push({
      title,
      link,
      text,
      deadline: src.deadlineSelector ? extractDeadline(`締切:${item.find(src.deadlineSelector).first().text()}`) : null,
      prize: src.prizeSelector ? item.find(src.prizeSelector).first().text().replace(/\s+/g, " ").trim() || null : null,
    });
  });
  return items;
}

/* ---------- 記事ページ → 懸賞元の応募ページ ---------- */
const SHARE_HOSTS = /(^|\.)(facebook\.com|line\.me|b\.hatena\.ne\.jp|pinterest\.|pocket|getpocket\.com|t\.co|google\.(com|co\.jp)|doubleclick\.net|amazon-adsystem|a8\.net|valuecommerce|moshimo|feedly\.com|instagram\.com|youtube\.com|tiktok\.com)$/i;
const APPLY_TEXT = /応募|公式|キャンペーン|詳細|特設|サイト|こちら|エントリー|ページ/;

export function findApplyLink(html: string, pageUrl: string, selector?: string): { url: string; text: string } | null {
  const $ = cheerio.load(html);
  const base = new URL(pageUrl);
  const resolve = (href?: string) => {
    if (!href) return null;
    try {
      const u = new URL(href, pageUrl);
      return u.protocol.startsWith("http") ? u : null;
    } catch {
      return null;
    }
  };
  if (selector) {
    const a = $(selector).first();
    const href = a.is("a") ? a.attr("href") : a.find("a").first().attr("href");
    const u = resolve(href);
    return u ? { url: u.href, text: a.text().trim() } : null;
  }
  const scope = $("article, main, .entry-content, .post-content, .entry, #content").first();
  const anchors = (scope.length ? scope : $("body")).find("a").toArray();
  let best: { url: string; text: string; score: number } | null = null;
  for (const el of anchors) {
    const a = $(el);
    const u = resolve(a.attr("href"));
    if (!u) continue;
    const host = u.hostname.replace(/^www\./, "");
    if (host === base.hostname.replace(/^www\./, "")) continue;
    if (SHARE_HOSTS.test(host)) continue;
    if (/(twitter|x)\.com$/.test(host) && !/\/status\//.test(u.pathname)) continue; // シェアボタン・プロフィール
    if (/\/intent\/|share|sharer/i.test(u.href)) continue;
    const text = `${a.text()} ${a.attr("title") ?? ""} ${a.find("img").attr("alt") ?? ""}`.replace(/\s+/g, " ").trim();
    const around = a.parent().text().slice(0, 120);
    let score = 0;
    if (APPLY_TEXT.test(text)) score += 3;
    if (APPLY_TEXT.test(around)) score += 1;
    if (/\/status\//.test(u.pathname)) score += 2;
    if (/campaign|cp|present|entry|apply|form/i.test(u.href)) score += 2;
    if (score > 0 && (!best || score > best.score)) best = { url: u.href, text, score };
  }
  return best ? { url: best.url, text: best.text } : null;
}

export interface CollectOptions {
  maxNew: number;
  intervalMs: number;
  now?: Date;
  /** 既に登録済みの懸賞ID・記事URL（再取得しない） */
  knownIds: Set<string>;
  knownVia: Set<string>;
  log?: (m: string) => void;
}

/** 1つの収集元から新しい懸賞を集める */
export async function collectFromSource(src: Source, opts: CollectOptions): Promise<Campaign[]> {
  const log = opts.log ?? (() => {});
  const now = opts.now ?? new Date();
  const today = todayJst(now);
  if (!(await allowedByRobots(src.url))) {
    log(`  robots.txt で禁止されているためスキップ: ${src.url}`);
    return [];
  }
  const body = await fetchText(src.url);
  const items = src.type === "rss" ? parseFeed(body) : parseListPage(body, src);
  log(`  ${items.length} 件の項目`);
  const out: Campaign[] = [];
  for (const item of items) {
    if (out.length >= opts.maxNew) break;
    if (opts.knownVia.has(item.link)) continue;
    try {
      if (opts.knownIds.has(campaignId(item.link))) continue;
    } catch {
      continue;
    }
    let applyUrl = item.link;
    let text = `${item.title} ${item.text}`;
    let deadline = item.deadline ?? extractDeadline(text, now);
    let prize = item.prize ?? extractPrize(text);
    if (deadline && deadline < today) continue;

    const follow = src.follow ?? true;
    if (follow && !isXUrl(item.link)) {
      try {
        if (await allowedByRobots(item.link)) {
          await sleep(opts.intervalMs);
          const html = await fetchText(item.link);
          const pageText = cheerio.load(html)("body").text().replace(/\s+/g, " ");
          text += ` ${pageText.slice(0, 5000)}`;
          deadline = deadline ?? extractDeadline(pageText, now);
          prize = prize ?? extractPrize(pageText);
          const found = findApplyLink(html, item.link, src.applyLinkSelector);
          if (found) applyUrl = found.url;
        }
      } catch (e) {
        log(`  記事ページを取得できません: ${e instanceof Error ? e.message : e}`);
      }
    }
    if (deadline && deadline < today) continue;
    let id: string;
    try {
      id = campaignId(applyUrl);
    } catch {
      continue;
    }
    if (opts.knownIds.has(id)) continue;
    opts.knownIds.add(id);
    const method = src.method && src.method !== "auto" ? src.method : detectMethod(applyUrl, text);
    out.push({
      id,
      url: applyUrl,
      title: item.title || applyUrl,
      deadline,
      prize: prize ? prize.slice(0, 80) : null,
      method,
      source: src.id,
      addedAt: new Date().toISOString(),
      via: item.link !== applyUrl ? item.link : undefined,
    });
  }
  return out;
}
