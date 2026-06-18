// 還元シミュレーターのカテゴリと、主要カードの「特約店上乗せ還元」定義（概算）。
// データに無いカードは基本還元率を全カテゴリに適用する。

export type CatKey = 'conv' | 'online' | 'other';

export const CATEGORIES: { key: CatKey; label: string; def: number }[] = [
  { key: 'conv', label: 'コンビニ・飲食（タッチ決済）', def: 30000 },
  { key: 'online', label: 'ネット通販（Amazon・楽天市場 等）', def: 20000 },
  { key: 'other', label: 'その他（一般のお店）', def: 50000 },
];

// slug → カテゴリ別の上乗せ還元率(%)。記載のないカテゴリは基本還元率を使う。
// ※ 公開情報をもとにした概算（対象店・上限・条件あり）。
const CARD_BONUS: Record<string, Partial<Record<CatKey, number>>> = {
  'smcc-nl': { conv: 7 },
  'smcc-gold-nl': { conv: 7 },
  'smcc-gold': { conv: 7 },
  'olive-flexible': { conv: 7 },
  'olive-gold': { conv: 7 },
  'smcc-platinum-preferred': { conv: 7 },
  'olive-platinum-preferred': { conv: 7 },
  'jcb-card-w': { online: 2 },
  'jcb-card-w-plus-l': { online: 2 },
  'rakuten-card': { online: 3 },
  'rakuten-pink': { online: 3 },
  'rakuten-gold': { online: 3 },
  'rakuten-premium': { online: 5 },
  'amazon-mastercard': { online: 2 },
  'paypay-card': { online: 1.5 },
  'paypay-gold': { online: 2 },
  'au-pay-card': { online: 1.5 },
  'dcard': { online: 2 },
  'mercard': { online: 4 },
};

// 指定カード・カテゴリの実効還元率(%)
export function effectiveRate(slug: string, base: number, cat: CatKey): number {
  if (cat === 'other') return base;
  const bonus = CARD_BONUS[slug]?.[cat];
  return bonus != null ? Math.max(bonus, base) : base;
}
