export type Method = "web" | "x" | "other";
export type EntryStatus = "success" | "failed" | "manual" | "closed";

export interface Campaign {
  /** 正規化URLのハッシュ（読み込み時に必ず再計算される） */
  id: string;
  url: string;
  title: string;
  /** YYYY-MM-DD（不明なら null） */
  deadline: string | null;
  prize: string | null;
  method: Method;
  /** 収集元ID、または "manual" */
  source: string;
  addedAt: string;
  /** 収集元の記事ページURL（応募ページと異なる場合） */
  via?: string;
}

export interface Entry {
  id: string;
  url: string;
  title: string;
  method: Method;
  status: EntryStatus;
  reason: string | null;
  attempts: number;
  /** 送信ボタンを押したか（押した後の失敗は再試行しない） */
  submitted: boolean;
  lastAttemptAt: string;
  appliedAt: string | null;
  /** Actions artifact 内のスクショファイル名（画像自体はコミットしない） */
  screenshot: string | null;
}

export interface CampaignsFile {
  version: 1;
  updatedAt: string;
  campaigns: Campaign[];
}

export interface EntriesFile {
  version: 1;
  updatedAt: string;
  lastRun: { at: string; dryRun: boolean; processed: number; summary: Record<string, number> } | null;
  entries: Entry[];
}

export interface SettingsFile {
  version: 1;
  /** 収集元のオン／オフ（sources.yaml の enabled を上書き） */
  sources: Record<string, boolean>;
}

export interface ApplyResult {
  status: EntryStatus;
  reason: string | null;
  submitted: boolean;
  screenshot: string | null;
  /** dry-run で送信直前に止めた */
  dryRunStopped?: boolean;
}
