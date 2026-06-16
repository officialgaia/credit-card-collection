import type { CardWithStatus, Brand, Tier } from '@/lib/types';
import { BRANDS, TIERS } from '@/lib/types';
import { cardMatchesQuery } from '@/lib/cards/search';

// 特典系のチェックボックス群
export const FEATURES = [
  'lounge',
  'travel',
  'concierge',
  'shopping',
  'touch',
  'numberless',
] as const;
export type Feature = (typeof FEATURES)[number];

export const FEATURE_LABELS: Record<Feature, string> = {
  lounge: '空港ラウンジ',
  travel: '海外旅行保険',
  concierge: 'コンシェルジュ',
  shopping: 'ショッピング保険',
  touch: 'タッチ決済',
  numberless: 'ナンバーレス',
};

export type PPFilter = 'has' | 'prestige';
export type OwnFilter = 'owned' | 'want' | 'none';
export type SortKey = 'fee_asc' | 'fee_desc' | 'rate_desc' | 'name' | 'newest';

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'fee_asc', label: '年会費が安い順' },
  { value: 'fee_desc', label: '年会費が高い順' },
  { value: 'rate_desc', label: '還元率が高い順' },
  { value: 'name', label: '名前順' },
  { value: 'newest', label: '追加が新しい順' },
];

export const DEFAULT_SORT: SortKey = 'fee_asc';

// スライダーの上限（シードの最高年会費に余裕を持たせた値）
export const FEE_MAX = 165000;
export const RATE_MAX = 2;

export interface CardFilters {
  q: string;
  brands: Brand[];
  issuers: string[];
  tiers: Tier[];
  freeOnly: boolean;
  feeMax: number | null;
  rateMin: number | null;
  pp: PPFilter | null;
  features: Feature[];
  business: boolean;
  own: OwnFilter | null;
  sort: SortKey;
}

export const EMPTY_FILTERS: CardFilters = {
  q: '',
  brands: [],
  issuers: [],
  tiers: [],
  freeOnly: false,
  feeMax: null,
  rateMin: null,
  pp: null,
  features: [],
  business: false,
  own: null,
  sort: DEFAULT_SORT,
};

type SP = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function splitList(v: string | string[] | undefined): string[] {
  const s = first(v);
  if (!s) return [];
  return s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
}

// URLSearchParams 由来の値を CardFilters に変換する。
export function parseFilters(sp: SP): CardFilters {
  const brands = splitList(sp.brand).filter((b): b is Brand =>
    (BRANDS as readonly string[]).includes(b)
  );
  const tiers = splitList(sp.tier).filter((t): t is Tier =>
    (TIERS as readonly string[]).includes(t)
  );
  const features = splitList(sp.feat).filter((f): f is Feature =>
    (FEATURES as readonly string[]).includes(f)
  );

  const feeMaxRaw = first(sp.feeMax);
  const rateMinRaw = first(sp.rateMin);
  const ppRaw = first(sp.pp);
  const ownRaw = first(sp.own);
  const sortRaw = first(sp.sort) as SortKey | undefined;

  return {
    q: (first(sp.q) ?? '').trim(),
    brands,
    issuers: splitList(sp.issuer),
    tiers,
    freeOnly: first(sp.free) === '1',
    feeMax: feeMaxRaw != null && feeMaxRaw !== '' ? Number(feeMaxRaw) : null,
    rateMin: rateMinRaw != null && rateMinRaw !== '' ? Number(rateMinRaw) : null,
    pp: ppRaw === 'has' || ppRaw === 'prestige' ? ppRaw : null,
    features,
    business: first(sp.business) === '1',
    own:
      ownRaw === 'owned' || ownRaw === 'want' || ownRaw === 'none' ? ownRaw : null,
    sort: SORT_OPTIONS.some((o) => o.value === sortRaw) ? (sortRaw as SortKey) : DEFAULT_SORT,
  };
}

function featureMatches(card: CardWithStatus, feat: Feature): boolean {
  switch (feat) {
    case 'lounge':
      return card.airport_lounge;
    case 'travel':
      return card.travel_insurance !== 'なし';
    case 'concierge':
      return card.concierge;
    case 'shopping':
      return card.shopping_insurance;
    case 'touch':
      return card.touch_payment;
    case 'numberless':
      return card.numberless;
  }
}

// フィルタを適用し、並び替えて返す純関数。
export function applyFilters(
  cards: CardWithStatus[],
  f: CardFilters
): CardWithStatus[] {
  const filtered = cards.filter((card) => {
    // カード名・発行会社での部分一致検索（かな→ローマ字も考慮）
    if (f.q && !cardMatchesQuery(card.name, card.issuer, f.q)) return false;
    // ブランド: いずれか1つでも含めばOK
    if (f.brands.length > 0 && !f.brands.some((b) => card.brands.includes(b))) {
      return false;
    }
    if (f.issuers.length > 0 && !f.issuers.includes(card.issuer)) return false;
    if (f.tiers.length > 0 && !f.tiers.includes(card.tier)) return false;

    if (f.freeOnly && card.annual_fee !== 0) return false;
    if (!f.freeOnly && f.feeMax != null && card.annual_fee > f.feeMax) return false;

    if (f.rateMin != null && (card.base_reward_rate ?? 0) < f.rateMin) return false;

    if (f.pp === 'has' && card.priority_pass === 'なし') return false;
    if (f.pp === 'prestige' && card.priority_pass !== 'プレステージ') return false;

    if (f.features.length > 0 && !f.features.every((ft) => featureMatches(card, ft))) {
      return false;
    }

    if (f.business && !card.business) return false;

    if (f.own === 'owned' && card.ownStatus !== 'owned') return false;
    if (f.own === 'want' && card.ownStatus !== 'want') return false;
    if (f.own === 'none' && card.ownStatus !== null) return false;

    return true;
  });

  const sorted = [...filtered];
  switch (f.sort) {
    case 'fee_asc':
      sorted.sort((a, b) => a.annual_fee - b.annual_fee || a.name.localeCompare(b.name, 'ja'));
      break;
    case 'fee_desc':
      sorted.sort((a, b) => b.annual_fee - a.annual_fee || a.name.localeCompare(b.name, 'ja'));
      break;
    case 'rate_desc':
      sorted.sort(
        (a, b) => (b.base_reward_rate ?? 0) - (a.base_reward_rate ?? 0) || a.annual_fee - b.annual_fee
      );
      break;
    case 'name':
      sorted.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
      break;
    case 'newest':
      sorted.sort((a, b) => b.created_at.localeCompare(a.created_at));
      break;
  }
  return sorted;
}

// フィルタが1つでもかかっているか（並び替えは除く）
export function hasActiveFilters(f: CardFilters): boolean {
  return (
    f.q.length > 0 ||
    f.brands.length > 0 ||
    f.issuers.length > 0 ||
    f.tiers.length > 0 ||
    f.freeOnly ||
    f.feeMax != null ||
    f.rateMin != null ||
    f.pp != null ||
    f.features.length > 0 ||
    f.business ||
    f.own != null
  );
}
