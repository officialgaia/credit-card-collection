/** 全角英数→半角、空白の正規化 */
export function toHalfWidth(s: string): string {
  return s
    .replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/　/g, " ");
}

export function norm(s: string | null | undefined): string {
  return toHalfWidth(s ?? "").replace(/\s+/g, " ").trim().toLowerCase();
}

export function kataToHira(s: string): string {
  return s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
}

export function hiraToKata(s: string): string {
  return s.replace(/[ぁ-ゖ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60));
}

export function digits(s: string): string {
  return toHalfWidth(s).replace(/\D/g, "");
}

/** 日付文字列（2026年11月30日 / 2026/11/30 / 11月30日 / 11/30）を YYYY-MM-DD に。年なしは now 基準で直近の未来 */
export function parseJapaneseDate(text: string, now = new Date()): string | null {
  const t = toHalfWidth(text);
  let m = t.match(/(20\d{2})\s*[年/.\-]\s*(\d{1,2})\s*[月/.\-]\s*(\d{1,2})/);
  let y: number, mo: number, d: number;
  if (m) {
    [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  } else {
    m = t.match(/(\d{1,2})\s*[月/]\s*(\d{1,2})\s*日?/);
    if (!m) return null;
    mo = Number(m[1]);
    d = Number(m[2]);
    y = now.getFullYear();
    const candidate = new Date(Date.UTC(y, mo - 1, d));
    // 年をまたぐ締切（12月に「1/15まで」など）
    if (candidate.getTime() < now.getTime() - 60 * 86400_000) y += 1;
  }
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** 日本時間の今日 YYYY-MM-DD */
export function todayJst(now = new Date()): string {
  return new Date(now.getTime() + 9 * 3600_000).toISOString().slice(0, 10);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function randomBetween(min: number, max: number): number {
  return Math.floor(min + Math.random() * Math.max(0, max - min));
}
