import Stripe from 'stripe';

// 遅延初期化（ビルド時に環境変数が無くてもクラッシュさせない）
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY が設定されていません');
    _stripe = new Stripe(key);
  }
  return _stripe;
}
