import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { DATA_DIR } from "./config.js";
import { campaignId } from "./lib/url.js";
import type { Campaign, CampaignsFile, EntriesFile, Entry, SettingsFile } from "./types.js";

function readJson<T>(file: string, fallback: T): T {
  if (!existsSync(file)) return fallback;
  return JSON.parse(readFileSync(file, "utf8")) as T;
}

function writeJson(file: string, data: unknown): void {
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

const now = () => new Date().toISOString();
const campaignsPath = (dir = DATA_DIR) => join(dir, "campaigns.json");
const entriesPath = (dir = DATA_DIR) => join(dir, "entries.json");
const settingsPath = (dir = DATA_DIR) => join(dir, "settings.json");

/** ID を URL から再計算し、重複を除去する（Webアプリから手動追加された分もここで正規化） */
export function dedupeCampaigns(list: Campaign[]): Campaign[] {
  const map = new Map<string, Campaign>();
  for (const c of list) {
    let id: string;
    try {
      id = campaignId(c.url);
    } catch {
      continue; // 不正なURL
    }
    const prev = map.get(id);
    const merged: Campaign = {
      title: "",
      deadline: null,
      prize: null,
      method: "web",
      source: "manual",
      addedAt: now(),
      ...prev,
      ...Object.fromEntries(Object.entries(c).filter(([, v]) => v !== null && v !== "" && v !== undefined)),
      id,
    } as Campaign;
    if (prev) merged.addedAt = prev.addedAt < (c.addedAt ?? "~") ? prev.addedAt : c.addedAt;
    map.set(id, merged);
  }
  return [...map.values()];
}

export function loadCampaigns(dir = DATA_DIR): CampaignsFile {
  const f = readJson<CampaignsFile>(campaignsPath(dir), { version: 1, updatedAt: now(), campaigns: [] });
  f.campaigns = dedupeCampaigns(f.campaigns ?? []);
  return f;
}

export function saveCampaigns(f: CampaignsFile, dir = DATA_DIR): void {
  f.updatedAt = now();
  f.campaigns = dedupeCampaigns(f.campaigns);
  writeJson(campaignsPath(dir), f);
}

export function loadEntries(dir = DATA_DIR): EntriesFile {
  return readJson<EntriesFile>(entriesPath(dir), { version: 1, updatedAt: now(), lastRun: null, entries: [] });
}

export function saveEntries(f: EntriesFile, dir = DATA_DIR): void {
  f.updatedAt = now();
  writeJson(entriesPath(dir), f);
}

export function loadSettings(dir = DATA_DIR): SettingsFile {
  return readJson<SettingsFile>(settingsPath(dir), { version: 1, sources: {} });
}

export function upsertEntry(f: EntriesFile, e: Entry): void {
  const i = f.entries.findIndex((x) => x.id === e.id);
  if (i >= 0) f.entries[i] = e;
  else f.entries.push(e);
}

/** 同じ懸賞に二度応募しないための判定 */
export function canApply(entry: Entry | undefined, maxAttempts: number): boolean {
  if (!entry) return true;
  if (entry.status !== "failed") return false; // success / manual / closed は再応募しない
  if (entry.submitted) return false; // 送信済みの可能性があるものは再試行しない
  return entry.attempts < maxAttempts;
}
