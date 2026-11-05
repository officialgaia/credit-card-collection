import { loadConfig } from "../config.js";
import { collectFromSource, loadSources } from "../collect/collector.js";
import { loadCampaigns, loadSettings, saveCampaigns } from "../store.js";

async function main() {
  const config = loadConfig();
  if (!config.collect.enabled) {
    console.log("収集は無効です（config.yaml の collect.enabled）");
    return;
  }
  const settings = loadSettings();
  const sources = loadSources().filter((s) => settings.sources[s.id] ?? s.enabled ?? true);
  const file = loadCampaigns();
  const knownIds = new Set(file.campaigns.map((c) => c.id));
  const knownVia = new Set(file.campaigns.map((c) => c.via).filter((v): v is string => !!v));
  console.log(`収集元 ${sources.length} 件（登録済み ${file.campaigns.length} 件）`);
  let added = 0;
  for (const src of sources) {
    console.log(`[${src.id}] ${src.name ?? ""} ${src.url}`);
    try {
      const found = await collectFromSource(src, {
        maxNew: config.collect.maxNewPerSource,
        intervalMs: config.collect.requestIntervalSec * 1000,
        knownIds,
        knownVia,
        log: (m) => console.log(m),
      });
      for (const c of found) console.log(`  + ${c.method} ${c.deadline ?? "締切不明"} ${c.title}`);
      file.campaigns.push(...found);
      added += found.length;
      saveCampaigns(file);
    } catch (e) {
      console.error(`  失敗: ${e instanceof Error ? e.message : e}`);
    }
  }
  console.log(`新規 ${added} 件を追加しました`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
