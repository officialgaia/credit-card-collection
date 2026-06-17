import type { Profile } from '@/lib/types';

// 無料プランの所有上限（これを超える＝11枚目はブロック）
export const FREE_OWNED_LIMIT = 10;
// この枚数を所有した次（6枚目）から課金ポップアップで告知する
export const FREE_OWNED_NUDGE_AT = 5;

export const PLAN_PRICE = 499;
export const PLAN_PRICE_LABEL = '月499円';

// 有料相当（管理者は常に全機能・広告非表示）
export function isPro(profile: Profile | null | undefined): boolean {
  return !!profile && (profile.is_admin || profile.is_subscribed);
}

// 広告を表示するか（未ログイン・無料ユーザーには表示、Pro/管理者は非表示）
export function shouldShowAds(profile: Profile | null | undefined): boolean {
  return !isPro(profile);
}
