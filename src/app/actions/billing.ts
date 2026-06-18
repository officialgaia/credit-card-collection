'use server';

import { getStripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}

type LinkResult = { url?: string; error?: string };

// Stripe Checkout（サブスク）を開始し、決済ページのURLを返す。
export async function createCheckout(): Promise<LinkResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'ログインが必要です' };

  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) return { error: '決済の設定が未完了です（STRIPE_PRICE_ID）' };

  let stripe;
  try {
    stripe = getStripe();
  } catch {
    return { error: '決済の設定が未完了です（STRIPE_SECRET_KEY）' };
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();

  let customerId = profile?.stripe_customer_id as string | undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await admin.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id);
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: user.id,
    success_url: `${siteUrl()}/pricing?success=1`,
    cancel_url: `${siteUrl()}/pricing?canceled=1`,
    allow_promotion_codes: true,
  });

  return { url: session.url ?? undefined };
}

// サブスク管理（解約・支払い方法変更）用のカスタマーポータルURLを返す。
export async function createPortal(): Promise<LinkResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'ログインが必要です' };

  let stripe;
  try {
    stripe = getStripe();
  } catch {
    return { error: '決済の設定が未完了です' };
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();

  const customerId = profile?.stripe_customer_id as string | undefined;
  if (!customerId) return { error: '顧客情報が見つかりません' };

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${siteUrl()}/pricing`,
  });

  return { url: session.url };
}
