import type { Tier, Brand } from '@/lib/types';

// ランク → マテリアルCSSクラス
export const TIER_MATERIAL: Record<Tier, string> = {
  一般: 'material-ippan',
  ゴールド: 'material-gold',
  プラチナ: 'material-platinum',
  ブラック: 'material-black',
};

// ランク → 文字色（プレースホルダー上のテキスト）
export const TIER_TEXT: Record<Tier, string> = {
  一般: 'text-zinc-100',
  ゴールド: 'text-amber-950',
  プラチナ: 'text-zinc-900',
  ブラック: 'text-zinc-100',
};

// ブランドのアクセント色（小さなバッジ用）
export const BRAND_COLOR: Record<Brand, string> = {
  visa: '#1a1f71',
  mastercard: '#eb001b',
  jcb: '#0b4ea2',
  amex: '#2e77bb',
  diners: '#0079be',
  unionpay: '#e21836',
};

// 円のフォーマット
export function formatYen(value: number | null | undefined): string {
  if (value == null) return '—';
  if (value === 0) return '無料';
  return `${value.toLocaleString('ja-JP')}円`;
}

// 還元率のフォーマット
export function formatRate(rate: number | null | undefined): string {
  if (rate == null) return '—';
  return `${rate}%`;
}
