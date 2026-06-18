import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';

// Stripe からのイベントを受けて profiles の課金状態を更新する。
// 署名検証のため raw body を使う。
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return new NextResponse('webhook not configured', { status: 500 });

  const sig = req.headers.get('stripe-signature');
  if (!sig) return new NextResponse('missing signature', { status: 400 });

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    return new NextResponse(`invalid signature: ${(err as Error).message}`, { status: 400 });
  }

  const admin = createAdminClient();

  async function setByCustomer(customerId: string, fields: Record<string, unknown>) {
    await admin.from('profiles').update(fields).eq('stripe_customer_id', customerId);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const s = event.data.object as Stripe.Checkout.Session;
        const userId = s.client_reference_id;
        const customerId = typeof s.customer === 'string' ? s.customer : s.customer?.id;
        const subId = typeof s.subscription === 'string' ? s.subscription : s.subscription?.id;
        if (userId) {
          await admin
            .from('profiles')
            .update({
              is_subscribed: true,
              stripe_customer_id: customerId ?? null,
              stripe_subscription_id: subId ?? null,
            })
            .eq('id', userId);
        }
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
        const active = sub.status === 'active' || sub.status === 'trialing';
        await setByCustomer(customerId, {
          is_subscribed: active,
          stripe_subscription_id: sub.id,
          subscribed_until: sub.items.data[0]?.current_period_end
            ? new Date(sub.items.data[0].current_period_end * 1000).toISOString()
            : null,
        });
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
        await setByCustomer(customerId, { is_subscribed: false });
        break;
      }
      default:
        break;
    }
  } catch (err) {
    return new NextResponse(`handler error: ${(err as Error).message}`, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
