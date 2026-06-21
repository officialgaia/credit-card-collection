// ドメイン型・定数

export const BRANDS = ['visa', 'mastercard', 'jcb', 'amex', 'diners', 'unionpay'] as const;
export type Brand = (typeof BRANDS)[number];

export const BRAND_LABELS: Record<Brand, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  jcb: 'JCB',
  amex: 'American Express',
  diners: 'Diners Club',
  unionpay: 'UnionPay',
};

export const TIERS = ['一般', 'ゴールド', 'プラチナ', 'ブラック'] as const;
export type Tier = (typeof TIERS)[number];

export const PRIORITY_PASS = ['なし', 'スタンダード', 'プレステージ'] as const;
export type PriorityPass = (typeof PRIORITY_PASS)[number];

export const TRAVEL_INSURANCE = ['なし', '利用付帯', '自動付帯'] as const;
export type TravelInsurance = (typeof TRAVEL_INSURANCE)[number];

export const CARD_STATUS = ['owned', 'want'] as const;
export type CardStatus = (typeof CARD_STATUS)[number];

export interface Card {
  id: string;
  slug: string;
  name: string;
  issuer: string;
  brands: Brand[];
  tier: Tier;
  annual_fee: number;
  annual_fee_note: string | null;
  family_card_fee: number | null;
  etc_card_fee: number | null;
  base_reward_rate: number | null;
  reward_note: string | null;
  point_program: string | null;
  priority_pass: PriorityPass;
  priority_pass_note: string | null;
  airport_lounge: boolean;
  travel_insurance: TravelInsurance;
  travel_insurance_amount: string | null;
  shopping_insurance: boolean;
  concierge: boolean;
  touch_payment: boolean;
  numberless: boolean;
  business: boolean;
  eligibility: string | null;
  official_url: string | null;
  affiliate_url: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  display_name: string | null;
  is_admin: boolean;
  is_subscribed: boolean;
  subscribed_until: string | null;
  created_at: string;
}

export interface UserCard {
  user_id: string;
  card_id: string;
  status: CardStatus;
  created_at: string;
}

// 一覧で扱う「カード + ログインユーザーの所有状態」
export interface CardWithStatus extends Card {
  ownStatus: CardStatus | null; // null = 未所有
  // 無料プランで上限を超えてロック中の所有カード（PROで解放）。
  // locked=true のときは ownStatus は 'owned' だが「有効な所有」には数えない。
  locked: boolean;
  // 所有カードで実際に保有している国際ブランド（ユーザー選択・任意）
  ownBrand: Brand | null;
}
