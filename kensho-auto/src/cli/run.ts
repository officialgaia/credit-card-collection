import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { chromium } from "playwright";
import { ARTIFACT_DIR, loadConfig } from "../config.js";
import { applyToCampaign } from "../engine/apply.js";
import { randomBetween, sleep, todayJst } from "../lib/text.js";
import { campaignId, isXUrl } from "../lib/url.js";
import { loadProfile } from "../profile.js";
import { canApply, loadCampaigns, loadEntries, saveEntries, upsertEntry } from "../store.js";
import type { Campaign, Entry } from "../types.js";
import { runXModule } from "../x/xModule.js";

const { values: args } = parseArgs({
  options: {
    "dry-run": { type: "boolean", default: false },
    max: { type: "string" },
    url: { type: "string" },
  },
});

const envTrue = (v?: string) => v === "true" || v === "1";

async function main() {
  const config = loadConfig();
  if (!args.url && process.env.TARGET_URL) args.url = process.env.TARGET_URL.trim();
  const dryRun = args["dry-run"] || envTrue(process.env.DRY_RUN);
  const maxPerRun = Number(args.max ?? process.env.MAX_PER_RUN ?? config.apply.maxPerRun) || config.apply.maxPerRun;
  const { profile, dummy } = loadProfile({ allowDummy: dryRun });
  if (dummy) console.log("PROFILE_JSON 未設定のため、ダミープロフィールで dry-run します");

  const campaignsFile = loadCampaigns();
  const entriesFile = loadEntries();
  const entryById = new Map(entriesFile.entries.map((e) => [e.id, e]));
  const today = todayJst();

  let targets: Campaign[];
  if (args.url) {
    const id = campaignId(args.url);
    const known = campaignsFile.campaigns.find((c) => c.id === id);
    targets = [
      known ?? { id, url: args.url, title: args.url, deadline: null, prize: null, method: isXUrl(args.url) ? "x" : "web", source: "manual", addedAt: new Date().toISOString() },
    ];
    if (!dryRun && !canApply(entryById.get(id), config.apply.maxAttempts)) {
      console.log(`応募済み・対象外のためスキップ: ${entryById.get(id)?.status}`);
      return;
    }
  } else {
    targets = campaignsFile.campaigns
      .filter((c) => c.method === "web")
      .filter((c) => !c.deadline || c.deadline >= today)
      .filter((c) => canApply(entryById.get(c.id), config.apply.maxAttempts))
      .sort((a, b) => (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999") || a.addedAt.localeCompare(b.addedAt))
      .slice(0, maxPerRun);
  }

  // 締切を過ぎた未応募の懸賞は closed として記録
  if (!dryRun) {
    for (const c of campaignsFile.campaigns) {
      if (c.deadline && c.deadline < today && !entryById.has(c.id)) {
        const e: Entry = {
          id: c.id, url: c.url, title: c.title, method: c.method, status: "closed", reason: "締切超過",
          attempts: 0, submitted: false, lastAttemptAt: new Date().toISOString(), appliedAt: null, screenshot: null,
        };
        upsertEntry(entriesFile, e);
        entryById.set(c.id, e);
      }
    }
  }

  console.log(`対象 ${targets.length} 件（上限 ${maxPerRun}、dry-run: ${dryRun}）`);
  const summary: Record<string, number> = {};
  const report: { id: string; title: string; status: string; reason: string | null; screenshot: string | null }[] = [];
  const screenshotDir = join(ARTIFACT_DIR, "screenshots");
  mkdirSync(screenshotDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  try {
    for (let i = 0; i < targets.length; i++) {
      const c = targets[i];
      if (i > 0) {
        const wait = randomBetween(config.apply.minIntervalSec * 1000, config.apply.maxIntervalSec * 1000);
        console.log(`  ${Math.round(wait / 1000)} 秒待機`);
        await sleep(wait);
      }
      console.log(`[${i + 1}/${targets.length}] ${c.title || c.url}`);
      const r = await applyToCampaign(browser, c.url, profile, {
        dryRun,
        screenshotDir,
        id: c.id,
        navigationTimeoutMs: config.apply.navigationTimeoutSec * 1000,
        log: (m) => console.log(m),
      });
      const label = r.dryRunStopped ? "dryrun" : r.status;
      summary[label] = (summary[label] ?? 0) + 1;
      console.log(`  → ${label}${r.reason ? `（${r.reason}）` : ""}`);
      report.push({ id: c.id, title: c.title, status: label, reason: r.reason, screenshot: r.screenshot });
      if (dryRun) continue;
      const prev = entryById.get(c.id);
      const at = new Date().toISOString();
      const e: Entry = {
        id: c.id,
        url: c.url,
        title: c.title,
        method: c.method,
        status: r.status,
        reason: r.reason,
        attempts: (prev?.attempts ?? 0) + 1,
        submitted: r.submitted || !!prev?.submitted,
        lastAttemptAt: at,
        appliedAt: r.status === "success" ? at : null,
        screenshot: r.screenshot,
      };
      upsertEntry(entriesFile, e);
      entryById.set(c.id, e);
      // 途中で落ちても結果が残るよう1件ごとに保存
      saveEntries(entriesFile);
    }

    if (!args.url) {
      const xr = await runXModule(browser, config, campaignsFile.campaigns, entriesFile, { dryRun, screenshotDir });
      for (const [k, v] of Object.entries(xr)) summary[`x_${k}`] = v;
    }
  } finally {
    await browser.close();
  }

  if (!dryRun) {
    entriesFile.lastRun = { at: new Date().toISOString(), dryRun, processed: targets.length, summary };
    saveEntries(entriesFile);
  }
  mkdirSync(ARTIFACT_DIR, { recursive: true });
  writeFileSync(join(ARTIFACT_DIR, "report.json"), JSON.stringify({ dryRun, summary, results: report }, null, 2));
  console.log("集計:", JSON.stringify(summary));

  if (process.env.GITHUB_STEP_SUMMARY) {
    const lines = [
      `## kensho-auto ${dryRun ? "(dry-run)" : ""}`,
      "",
      "| 結果 | 件数 |",
      "|---|---|",
      ...Object.entries(summary).map(([k, v]) => `| ${k} | ${v} |`),
      "",
      "| 懸賞 | 結果 | 理由 |",
      "|---|---|---|",
      ...report.map((r) => `| ${r.title.replace(/\|/g, "／").slice(0, 50)} | ${r.status} | ${(r.reason ?? "").replace(/\|/g, "／")} |`),
    ];
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join("\n") + "\n");
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
