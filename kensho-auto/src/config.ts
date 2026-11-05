import { readFileSync } from "node:fs";
import { join } from "node:path";
import YAML from "yaml";

export const ROOT = join(import.meta.dirname, "..");
export const DATA_DIR = process.env.KENSHO_DATA_DIR ?? join(ROOT, "data");
export const ARTIFACT_DIR = process.env.KENSHO_ARTIFACT_DIR ?? join(ROOT, "artifacts");

export interface Config {
  apply: { maxPerRun: number; minIntervalSec: number; maxIntervalSec: number; maxAttempts: number; navigationTimeoutSec: number };
  collect: { enabled: boolean; maxNewPerSource: number; requestIntervalSec: number };
  x: { enabled: boolean; dailyLimit: number; minIntervalSec: number; maxIntervalSec: number };
}

const DEFAULTS: Config = {
  apply: { maxPerRun: 10, minIntervalSec: 5, maxIntervalSec: 30, maxAttempts: 2, navigationTimeoutSec: 30 },
  collect: { enabled: true, maxNewPerSource: 30, requestIntervalSec: 2 },
  x: { enabled: false, dailyLimit: 10, minIntervalSec: 90, maxIntervalSec: 240 },
};

export function loadConfig(path = join(ROOT, "config.yaml")): Config {
  let raw: Partial<Config> = {};
  try {
    raw = YAML.parse(readFileSync(path, "utf8")) ?? {};
  } catch {
    /* デフォルトで動く */
  }
  return {
    apply: { ...DEFAULTS.apply, ...raw.apply },
    collect: { ...DEFAULTS.collect, ...raw.collect },
    x: { ...DEFAULTS.x, ...raw.x },
  };
}
