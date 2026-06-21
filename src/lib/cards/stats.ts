import type { CardWithStatus, Tier, Brand } from '@/lib/types';
import { TIERS, BRANDS } from '@/lib/types';

// ランクの序列（高い順の判定に使う）
const TIER_RANK: Record<Tier, number> = {
  一般: 0,
  ゴールド: 1,
  プラチナ: 2,
  ブラック: 3,
};

export interface Achievement {
  id: string;
  label: string;
  description: string;
  unlocked: boolean;
}

export interface CollectionStats {
  total: number;
  ownedCount: number;
  lockedCount: number;
  wantCount: number;
  pct: number;
  totalAnnualFee: number;
  priorityPassCount: number;
  prestigeCount: number;
  loungeCount: number;
  conciergeCount: number;
  avgRewardRate: number | null;
  highestFeeCard: CardWithStatus | null;
  topTier: Tier | null;
  byTier: { tier: Tier; owned: number; total: number }[];
  byBrand: { brand: Brand; count: number }[];
  achievements: Achievement[];
}

export function computeCollectionStats(cards: CardWithStatus[]): CollectionStats {
  // ロック中（上限超過）は「有効な所有」に数えない
  const owned = cards.filter((c) => c.ownStatus === 'owned' && !c.locked);
  const lockedCount = cards.filter((c) => c.locked).length;
  const want = cards.filter((c) => c.ownStatus === 'want');

  const total = cards.length;
  const ownedCount = owned.length;
  const pct = total === 0 ? 0 : Math.round((ownedCount / total) * 100);

  const totalAnnualFee = owned.reduce((s, c) => s + c.annual_fee, 0);
  const priorityPassCount = owned.filter((c) => c.priority_pass !== 'なし').length;
  const prestigeCount = owned.filter((c) => c.priority_pass === 'プレステージ').length;
  const loungeCount = owned.filter((c) => c.airport_lounge).length;
  const conciergeCount = owned.filter((c) => c.concierge).length;

  const rates = owned
    .map((c) => c.base_reward_rate)
    .filter((r): r is number => r != null);
  const avgRewardRate =
    rates.length > 0
      ? Math.round((rates.reduce((s, r) => s + r, 0) / rates.length) * 100) / 100
      : null;

  const highestFeeCard =
    owned.length > 0
      ? owned.reduce((max, c) => (c.annual_fee > max.annual_fee ? c : max), owned[0])
      : null;

  const topTier =
    owned.length > 0
      ? owned.reduce<Tier>(
          (top, c) => (TIER_RANK[c.tier] > TIER_RANK[top] ? c.tier : top),
          owned[0].tier
        )
      : null;

  const byTier = TIERS.map((tier) => ({
    tier,
    owned: owned.filter((c) => c.tier === tier).length,
    total: cards.filter((c) => c.tier === tier).length,
  }));

  // ブランド別保有は「ユーザーが選択した決済ブランド」のみ集計する
  const byBrand = BRANDS.map((brand) => ({
    brand,
    count: owned.filter((c) => c.ownBrand === brand).length,
  })).filter((b) => b.count > 0);

  const ownedBrandSet = new Set(
    owned.map((c) => c.ownBrand).filter((b): b is Brand => b != null)
  );
  const majorBrands: Brand[] = ['visa', 'mastercard', 'jcb', 'amex'];

  const achievements: Achievement[] = [
    {
      id: 'first',
      label: 'コレクター誕生',
      description: '初めての1枚を登録',
      unlocked: ownedCount >= 1,
    },
    {
      id: 'ten',
      label: '二桁コレクター',
      description: '10枚以上を所有',
      unlocked: ownedCount >= 10,
    },
    {
      id: 'gold',
      label: 'ゴールドメンバー',
      description: 'ゴールド以上を1枚所有',
      unlocked: owned.some((c) => TIER_RANK[c.tier] >= 1),
    },
    {
      id: 'platinum',
      label: 'プラチナクラス',
      description: 'プラチナ以上を1枚所有',
      unlocked: owned.some((c) => TIER_RANK[c.tier] >= 2),
    },
    {
      id: 'black',
      label: 'ブラック到達',
      description: 'ブラックを1枚所有',
      unlocked: owned.some((c) => c.tier === 'ブラック'),
    },
    {
      id: 'prestige',
      label: 'プレステージ',
      description: 'プライオリティパス（プレステージ）を所有',
      unlocked: prestigeCount >= 1,
    },
    {
      id: 'all-major-brands',
      label: '4大ブランド制覇',
      description: 'Visa / Mastercard / JCB / Amex を網羅',
      unlocked: majorBrands.every((b) => ownedBrandSet.has(b)),
    },
    {
      id: 'half',
      label: 'ハーフコンプ',
      description: '収集率50%を突破',
      unlocked: pct >= 50,
    },
    {
      id: 'complete',
      label: 'コンプリート',
      description: '全カードを制覇',
      unlocked: total > 0 && ownedCount === total,
    },
  ];

  return {
    total,
    ownedCount,
    lockedCount,
    wantCount: want.length,
    pct,
    totalAnnualFee,
    priorityPassCount,
    prestigeCount,
    loungeCount,
    conciergeCount,
    avgRewardRate,
    highestFeeCard,
    topTier,
    byTier,
    byBrand,
    achievements,
  };
}
