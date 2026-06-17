'use client';

import Link from 'next/link';
import { PLAN_PRICE_LABEL, FREE_OWNED_LIMIT } from '@/lib/billing';

// 課金を促すポップアップ（広告風）。
//   kind='nudge'        … 6枚目以降の告知（所有はできている）
//   kind='limit_reached'… 上限到達でブロック
export function PaywallModal({
  kind,
  onClose,
}: {
  kind: 'nudge' | 'limit_reached';
  onClose: () => void;
}) {
  const blocked = kind === 'limit_reached';

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="wallet-pop relative w-full max-w-sm overflow-hidden rounded-2xl border border-accent/40 bg-surface p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="absolute right-3 top-3 text-[10px] tracking-widest text-muted">AD</span>

        <div className="collection-shine pointer-events-none absolute inset-0 opacity-50" />

        <div className="relative space-y-3">
          <p className="text-xs uppercase tracking-[0.25em] text-accent">Card Collection PRO</p>
          <h2 className="text-xl font-semibold">
            {blocked ? `無料プランは${FREE_OWNED_LIMIT}枚まで` : 'もっと集めませんか？'}
          </h2>
          <p className="text-sm text-muted">
            {blocked
              ? `これ以上のコレクションには PRO プランが必要です。`
              : `無料プランは${FREE_OWNED_LIMIT}枚まで。PRO なら無制限に集められます。`}
          </p>

          <ul className="mx-auto max-w-[16rem] space-y-1.5 py-1 text-left text-sm">
            <li className="flex items-center gap-2"><span className="text-accent">✓</span> カードを無制限にコレクション</li>
            <li className="flex items-center gap-2"><span className="text-accent">✓</span> 広告を非表示</li>
            <li className="flex items-center gap-2"><span className="text-accent">✓</span> いつでも解約OK</li>
          </ul>

          <p className="text-2xl font-semibold">
            {PLAN_PRICE_LABEL}
            <span className="ml-1 text-xs font-normal text-muted">（税込）</span>
          </p>

          <div className="flex flex-col gap-2 pt-1">
            <Link
              href="/pricing"
              onClick={onClose}
              className="rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-accent-soft"
            >
              PRO にアップグレード
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-muted transition hover:text-foreground"
            >
              {blocked ? '閉じる' : 'あとで'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
