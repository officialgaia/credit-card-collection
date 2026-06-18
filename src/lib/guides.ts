import type { Card } from '@/lib/types';

// 比較・特集ページ（SEOランディング）の定義。
export type Guide = {
  slug: string;
  title: string; // <title>用
  heading: string; // 画面見出し
  description: string; // メタ説明
  intro: string; // 導入文（本文・SEO）
  listHref: string; // 関連する絞り込み一覧へのリンク
  filter: (c: Card) => boolean;
  sort?: (a: Card, b: Card) => number;
};

const byRewardDesc = (a: Card, b: Card) =>
  (b.base_reward_rate ?? 0) - (a.base_reward_rate ?? 0) || a.annual_fee - b.annual_fee;
const byFeeAsc = (a: Card, b: Card) =>
  a.annual_fee - b.annual_fee || (b.base_reward_rate ?? 0) - (a.base_reward_rate ?? 0);

export const GUIDES: Guide[] = [
  {
    slug: 'annual-fee-free',
    title: '年会費無料のおすすめクレジットカード',
    heading: '年会費無料のおすすめクレジットカード',
    description:
      '年会費が永年無料のクレジットカードを厳選。維持コスト0円で持てる高還元・人気カードを還元率順に比較できます。',
    intro:
      '「とりあえず1枚」「コストをかけずに持ちたい」という方に向けて、年会費が永年無料（条件付き無料を除く）のクレジットカードをまとめました。維持費0円でもポイント還元やタッチ決済に対応した実用的なカードが多数あります。還元率の高い順に並べています。',
    listHref: '/?free=1',
    filter: (c) => c.annual_fee === 0,
    sort: byRewardDesc,
  },
  {
    slug: 'high-reward',
    title: '高還元率クレジットカード（還元率1%以上）',
    heading: '高還元率のクレジットカード（1%以上）',
    description:
      '基本還元率1%以上の高還元クレジットカードを比較。日常の支払いで効率よくポイントを貯めたい方におすすめのカードを紹介します。',
    intro:
      '基本還元率が1.0%以上のクレジットカードを集めました。一般的なカードの還元率は0.5%前後ですが、ここで紹介するカードは常時1%以上。普段の買い物や固定費の支払いをまとめるほど差がつきます。',
    listHref: '/?rateMin=1',
    filter: (c) => (c.base_reward_rate ?? 0) >= 1.0,
    sort: byRewardDesc,
  },
  {
    slug: 'gold',
    title: 'ゴールドカード比較',
    heading: 'ゴールドカードの比較',
    description:
      'ゴールドランクのクレジットカードを年会費・空港ラウンジ・旅行保険などで比較。ワンランク上の特典を求める方へ。',
    intro:
      '空港ラウンジや手厚い旅行保険など、一般カードより上質な特典が付くゴールドカードをまとめました。年会費が条件付きで無料になるカードもあります。年会費の安い順に並べています。',
    listHref: '/?tier=' + encodeURIComponent('ゴールド'),
    filter: (c) => c.tier === 'ゴールド',
    sort: byFeeAsc,
  },
  {
    slug: 'platinum-black',
    title: 'プラチナ・ブラックカード一覧',
    heading: 'プラチナ・ブラックカード',
    description:
      'プラチナ・ブラックランクの最上級クレジットカードを比較。コンシェルジュやプライオリティパスなどステータス特典が充実。',
    intro:
      'コンシェルジュサービスやプライオリティ・パス、上級ホテル特典など、最上級のサービスを備えたプラチナ・ブラックカードをまとめました。年会費は高めですが、それに見合う体験と特典が魅力です。',
    listHref: '/?tier=' + encodeURIComponent('プラチナ,ブラック'),
    filter: (c) => c.tier === 'プラチナ' || c.tier === 'ブラック',
    sort: byFeeAsc,
  },
  {
    slug: 'priority-pass',
    title: 'プライオリティ・パスが付くクレジットカード',
    heading: 'プライオリティ・パス付きカード',
    description:
      '世界の空港ラウンジが使えるプライオリティ・パスが付帯するクレジットカードを比較。海外・国内出張や旅行が多い方へ。',
    intro:
      '世界1,300カ所以上の空港ラウンジを利用できる「プライオリティ・パス」が付帯するクレジットカードをまとめました。旅行・出張が多い方には、ラウンジ利用だけで年会費の元が取れることもあります。',
    listHref: '/?pp=has',
    filter: (c) => c.priority_pass !== 'なし',
    sort: byFeeAsc,
  },
  {
    slug: 'travel-insurance',
    title: '海外旅行保険が自動付帯のクレジットカード',
    heading: '海外旅行保険が自動付帯のカード',
    description:
      '持っているだけで補償される「自動付帯」の海外旅行保険が付くクレジットカードを比較。旅行前の備えにおすすめ。',
    intro:
      'カードで旅費を支払わなくても補償される「自動付帯」の海外旅行保険が付くクレジットカードをまとめました。複数枚持つと補償額を合算できる場合もあり、旅行好きの方に人気です。',
    listHref: '/?feat=travel',
    filter: (c) => c.travel_insurance === '自動付帯',
    sort: byFeeAsc,
  },
  {
    slug: 'business',
    title: '法人・個人事業主向けビジネスカード',
    heading: 'ビジネスカード（法人・個人事業主向け）',
    description:
      '法人代表者・個人事業主向けのビジネスクレジットカードを比較。経費管理や会計連携に役立つカードを紹介します。',
    intro:
      '法人代表者や個人事業主・フリーランス向けのビジネスカードをまとめました。経費の一元管理や会計ソフト連携、追加カード発行など、事業の支払いを効率化できる機能が特徴です。',
    listHref: '/?business=1',
    filter: (c) => c.business,
    sort: byFeeAsc,
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
