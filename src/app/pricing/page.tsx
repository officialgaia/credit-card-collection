import Link from 'next/link';
import { getCurrentProfile } from '@/lib/auth';
import { isPro, PLAN_PRICE_LABEL, FREE_OWNED_LIMIT } from '@/lib/billing';

export const metadata = { title: '料金プラン — Card Collection' };

export default async function PricingPage() {
  const profile = await getCurrentProfile();
  const pro = isPro(profile);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">料金プラン</h1>
        <p className="mt-2 text-sm text-muted">
          無料でも{FREE_OWNED_LIMIT}枚まで集められます。もっと集めるなら PRO へ。
        </p>
      </div>

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
              {pro ? (
                <p className="rounded-md border border-accent/40 bg-accent/10 px-4 py-2.5 text-center text-sm text-accent">
                  {profile?.is_admin ? '管理者として全機能をご利用中です' : 'PRO をご利用中です'}
                </p>
              ) : profile ? (
                <button
                  type="button"
                  disabled
                  className="w-full cursor-not-allowed rounded-md bg-accent/60 px-4 py-2.5 text-sm font-semibold text-black/70"
                  title="決済方法を準備中です"
                >
                  アップグレード（決済準備中）
                </button>
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
