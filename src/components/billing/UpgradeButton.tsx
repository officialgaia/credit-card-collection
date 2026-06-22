'use client';

import { useState } from 'react';
import { createCheckout, createPortal } from '@/app/actions/billing';

// mode='checkout' … サブスク開始（Stripe Checkoutへ）
// mode='portal'   … サブスク管理（カスタマーポータルへ）
export function UpgradeButton({
  mode,
  label,
  className,
}: {
  mode: 'checkout' | 'portal';
  label: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setLoading(true);
    setError(null);
    try {
      const res = mode === 'checkout' ? await createCheckout() : await createPortal();
      if (res.url) {
        window.location.href = res.url;
        return;
      }
      setError(res.error ?? 'エラーが発生しました');
    } catch (e) {
      setError(e instanceof Error ? e.message : '通信エラーが発生しました');
    }
    setLoading(false);
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={go}
        disabled={loading}
        className={
          className ??
          'w-full rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-accent-soft disabled:opacity-60'
        }
      >
        {loading ? '処理中…' : label}
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
