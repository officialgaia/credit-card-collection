// 検索の一致判定。日本語入力（かな）をローマ字にも変換して、
// 「あ」と打つと "a" を含むカード（Amex等）もヒットするようにする。

const YOUON: Record<string, string> = {
  きゃ: 'kya', きゅ: 'kyu', きょ: 'kyo',
  しゃ: 'sha', しゅ: 'shu', しょ: 'sho',
  ちゃ: 'cha', ちゅ: 'chu', ちょ: 'cho',
  にゃ: 'nya', にゅ: 'nyu', にょ: 'nyo',
  ひゃ: 'hya', ひゅ: 'hyu', ひょ: 'hyo',
  みゃ: 'mya', みゅ: 'myu', みょ: 'myo',
  りゃ: 'rya', りゅ: 'ryu', りょ: 'ryo',
  ぎゃ: 'gya', ぎゅ: 'gyu', ぎょ: 'gyo',
  じゃ: 'ja', じゅ: 'ju', じょ: 'jo',
  びゃ: 'bya', びゅ: 'byu', びょ: 'byo',
  ぴゃ: 'pya', ぴゅ: 'pyu', ぴょ: 'pyo',
};

const KANA: Record<string, string> = {
  あ: 'a', い: 'i', う: 'u', え: 'e', お: 'o',
  か: 'ka', き: 'ki', く: 'ku', け: 'ke', こ: 'ko',
  さ: 'sa', し: 'shi', す: 'su', せ: 'se', そ: 'so',
  た: 'ta', ち: 'chi', つ: 'tsu', て: 'te', と: 'to',
  な: 'na', に: 'ni', ぬ: 'nu', ね: 'ne', の: 'no',
  は: 'ha', ひ: 'hi', ふ: 'fu', へ: 'he', ほ: 'ho',
  ま: 'ma', み: 'mi', む: 'mu', め: 'me', も: 'mo',
  や: 'ya', ゆ: 'yu', よ: 'yo',
  ら: 'ra', り: 'ri', る: 'ru', れ: 're', ろ: 'ro',
  わ: 'wa', を: 'wo', ん: 'n',
  が: 'ga', ぎ: 'gi', ぐ: 'gu', げ: 'ge', ご: 'go',
  ざ: 'za', じ: 'ji', ず: 'zu', ぜ: 'ze', ぞ: 'zo',
  だ: 'da', ぢ: 'ji', づ: 'zu', で: 'de', ど: 'do',
  ば: 'ba', び: 'bi', ぶ: 'bu', べ: 'be', ぼ: 'bo',
  ぱ: 'pa', ぴ: 'pi', ぷ: 'pu', ぺ: 'pe', ぽ: 'po',
  ぁ: 'a', ぃ: 'i', ぅ: 'u', ぇ: 'e', ぉ: 'o',
};

// カタカナをひらがなに寄せる
function kataToHira(s: string): string {
  return s.replace(/[ァ-ヶ]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

// かな（ひら/カタ）を含む文字列をローマ字に変換する。
// かな以外（英数字・記号）はそのまま通す。
export function kanaToRomaji(input: string): string {
  const s = kataToHira(input.toLowerCase());
  let out = '';
  let i = 0;
  while (i < s.length) {
    const two = s.slice(i, i + 2);
    if (YOUON[two]) {
      out += YOUON[two];
      i += 2;
      continue;
    }
    const ch = s[i];
    if (ch === 'っ') {
      // 促音: 次の子音を重ねる
      const nextTwo = s.slice(i + 1, i + 3);
      const nextRom = YOUON[nextTwo] || KANA[s[i + 1]] || '';
      if (nextRom) out += nextRom[0];
      i += 1;
      continue;
    }
    if (ch === 'ー' || ch === '・') {
      i += 1;
      continue;
    }
    if (KANA[ch]) {
      out += KANA[ch];
      i += 1;
      continue;
    }
    out += ch;
    i += 1;
  }
  return out;
}

// カード名・発行会社が検索語に一致するか（ローマ字変換も考慮）
export function cardMatchesQuery(name: string, issuer: string, query: string): boolean {
  const t = query.trim().toLowerCase();
  if (!t) return true;
  const hay = `${name} ${issuer}`.toLowerCase();
  if (hay.includes(t)) return true;
  const rom = kanaToRomaji(t);
  if (rom && rom !== t && hay.includes(rom)) return true;
  return false;
}
