import type { Card } from '@/lib/types';
import { BRAND_LABELS } from '@/lib/types';
import { formatYen, formatRate } from '@/lib/cards/style';

// カードの実データから「特徴バッジ（短い強み）」を抽出する。
export function cardBadges(card: Card): string[] {
  const b: string[] = [];
  if (card.annual_fee === 0) b.push('年会費無料');
  if ((card.base_reward_rate ?? 0) >= 1) b.push(`高還元 ${formatRate(card.base_reward_rate)}`);
  if (card.priority_pass === 'プレステージ') b.push('プライオリティ・パス');
  else if (card.priority_pass !== 'なし') b.push('プライオリティ・パス');
  if (card.airport_lounge) b.push('空港ラウンジ');
  if (card.travel_insurance === '自動付帯') b.push('旅行保険 自動付帯');
  if (card.concierge) b.push('コンシェルジュ');
  if (card.numberless) b.push('ナンバーレス');
  if (card.business) b.push('ビジネス向け');
  if (card.touch_payment) b.push('タッチ決済');
  return b;
}

// カード固有のリード文（このカードのポイント）。フィールドから動的に生成。
export function cardLead(card: Card): string {
  const fee = card.annual_fee === 0 ? '年会費は永年無料' : `年会費は${formatYen(card.annual_fee)}`;
  const reward =
    card.base_reward_rate != null
      ? `基本還元率は${formatRate(card.base_reward_rate)}${card.base_reward_rate >= 1 ? 'と高め' : ''}`
      : 'ポイントが貯まります';

  const highlights: string[] = [];
  if (card.priority_pass !== 'なし') highlights.push('プライオリティ・パスの付帯');
  if (card.airport_lounge && card.priority_pass === 'なし') highlights.push('国内空港ラウンジの利用');
  if (card.travel_insurance === '自動付帯') highlights.push('海外旅行保険の自動付帯');
  if (card.concierge) highlights.push('コンシェルジュサービス');
  if (card.numberless) highlights.push('ナンバーレス仕様');
  if (card.business) highlights.push('法人・個人事業主向けの経費管理');

  const brands = card.brands.map((b) => BRAND_LABELS[b]).join('・');

  let s = `${card.issuer}が発行する${card.tier}ランクのクレジットカードです。${fee}で、${reward}。`;
  if (highlights.length > 0) s += `${highlights.slice(0, 3).join('、')}が魅力です。`;
  if (card.point_program) s += `貯まるポイントは${card.point_program}。`;
  if (brands) s += `国際ブランドは${brands}に対応しています。`;
  return s;
}

// 「向いている人」を1文で。優先度の高い属性から判定。
export function cardForWhom(card: Card): string {
  if (card.business) return '法人・個人事業主で、事業の支払いと経費管理を1枚にまとめたい方に向いています。';
  if (card.tier === 'ブラック' || card.tier === 'プラチナ')
    return 'コンシェルジュや上質な特典など、ステータスとサービスを重視する方に向いています。';
  if (card.priority_pass !== 'なし' || card.airport_lounge || card.travel_insurance === '自動付帯')
    return '出張や旅行が多く、空港ラウンジや旅行保険を活用したい方に向いています。';
  if ((card.base_reward_rate ?? 0) >= 1)
    return '日常の支払いをまとめて、効率よくポイントを貯めたい方に向いています。';
  if (card.annual_fee === 0 && card.tier === '一般')
    return 'はじめての1枚や、コストをかけずに持てるサブカードを探している方に向いています。';
  return '日常使いの1枚として、無理なく使えるカードを探している方に向いています。';
}
