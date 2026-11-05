/**
 * Actions のコミット時、実行中に Webアプリ等からリモートが更新されていた場合に
 * 「今回の実行結果（退避したファイル）」と「リモートの最新」をマージする。
 *   tsx src/cli/mergeData.ts <退避したdataディレクトリ>
 */
import { DATA_DIR } from "../config.js";
import { dedupeCampaigns, loadCampaigns, loadEntries, saveCampaigns, saveEntries } from "../store.js";
import type { Entry } from "../types.js";

const saved = process.argv[2];
if (!saved) {
  console.error("usage: merge-data <saved-data-dir>");
  process.exit(1);
}

const remoteC = loadCampaigns(DATA_DIR);
const localC = loadCampaigns(saved);
remoteC.campaigns = dedupeCampaigns([...remoteC.campaigns, ...localC.campaigns]);
saveCampaigns(remoteC, DATA_DIR);

const remoteE = loadEntries(DATA_DIR);
const localE = loadEntries(saved);
const map = new Map<string, Entry>();
for (const e of [...remoteE.entries, ...localE.entries]) {
  const prev = map.get(e.id);
  if (!prev || (e.lastAttemptAt ?? "") >= (prev.lastAttemptAt ?? "")) map.set(e.id, e);
}
remoteE.entries = [...map.values()];
if (localE.lastRun && (!remoteE.lastRun || localE.lastRun.at > remoteE.lastRun.at)) remoteE.lastRun = localE.lastRun;
saveEntries(remoteE, DATA_DIR);
console.log(`merged: campaigns=${remoteC.campaigns.length} entries=${remoteE.entries.length}`);
