import Link from 'next/link';
import { getCurrentProfile } from '@/lib/auth';
import { PLAN_PRICE_LABEL, FREE_OWNED_LIMIT } from '@/lib/billing';
import { UpgradeButton } from '@/components/billing/UpgradeButton';

export const metadata = { title: '料金プラン', alternates: { canonical: '/pricing' } };

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const [profile, sp] = await Promise.all([getCurrentProfile(), searchParams]);
  const subscribed = !!profile?.is_subscribed;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">料金プラン</h1>
        <p className="mt-2 text-sm text-muted">
          無料でも{FREE_OWNED_LIMIT}枚まで集められます。もっと集めるなら PRO へ。
        </p>
      </div>

      {sp.success && (
        <p className="rounded-lg border border-accent/40 bg-accent/10 px-4 py-2 text-center text-sm text-accent">
          ご登録ありがとうございます！反映まで数秒かかる場合があります。
        </p>
      )}
      {sp.canceled && (
        <p className="rounded-lg border border-border bg-surface/60 px-4 py-2 text-center text-sm text-muted">
          お手続きはキャンセルされました。
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {/* 無料プラン */}
        <div className="rounded-2xl border border-border bg-surface/60 p-6">
          <h2 className="text-lg font-semibold">無料</h2>
          <p className="mt-1 text-2xl font-semibold">0円</p>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li>・カードの閲覧・検索・フィルタ</li>
            <li>・コレクション {FREE_OWNED_LIMIT}枚まで</li>
            <li>・広告あり</li>
          </ul>
        </div>

        {/* PROプラン */}
        <div className="relative overflow-hidden rounded-2xl border border-accent/40 bg-surface p-6">
          <div className="collection-shine pointer-events-none absolute inset-0 opacity-50" />
          <div className="relative">
            <h2 className="text-lg font-semibold text-accent">PRO</h2>
            <p className="mt-1 text-2xl font-semibold">
              {PLAN_PRICE_LABEL}
              <span className="ml-1 text-xs font-normal text-muted">（税込）</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex gap-2"><span className="text-accent">✓</span> コレクション無制限</li>
              <li className="flex gap-2"><span className="text-accent">✓</span> 広告非表示</li>
              <li className="flex gap-2"><span className="text-accent">✓</span> いつでも解約OK</li>
            </ul>

            <div className="mt-6">
              {profile?.is_admin ? (
                <p className="rounded-md border border-accent/40 bg-accent/10 px-4 py-2.5 text-center text-sm text-accent">
                  管理者として全機能をご利用中です
                </p>
              ) : subscribed ? (
                <div className="space-y-2">
                  <p className="rounded-md border border-accent/40 bg-accent/10 px-4 py-2.5 text-center text-sm text-accent">
                    PRO をご利用中です
                  </p>
                  <UpgradeButton
                    mode="portal"
                    label="サブスクを管理・解約"
                    className="w-full rounded-md border border-border px-4 py-2 text-sm text-muted transition hover:text-foreground disabled:opacity-60"
                  />
                </div>
              ) : profile ? (
                <UpgradeButton mode="checkout" label="PRO にアップグレード" />
              ) : (
                <Link
                  href="/login"
                  className="block rounded-md bg-accent px-4 py-2.5 text-center text-sm font-semibold text-black transition hover:bg-accent-soft"
                >
                  ログインして始める
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <p className="rounded-lg border border-border bg-surface/60 p-3 text-center text-xs text-muted">
        ※ クレジットカード決済を準備中です。導入後、このページからご登録いただけます。
      </p>
    </div>
  );
}
