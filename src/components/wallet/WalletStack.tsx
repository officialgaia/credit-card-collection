'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Card } from '@/lib/types';
import { BRAND_LABELS } from '@/lib/types';
import { CardFace } from '@/components/card/CardFace';
import { formatYen, formatRate } from '@/lib/cards/style';

// 所有カードを Apple Pay のウォレットのように重ねて表示する。
// カードをクリックすると拡大表示（モーダル）になる。
const PEEK = 0.34; // カード高さに対する見え幅の割合（小さいほど密に重なる）

export function WalletStack({ cards }: { cards: Card[] }) {
  const [active, setActive] = useState<number | null>(null); // ホバー中
  const [expanded, setExpanded] = useState<number | null>(null); // 拡大中

  const n = cards.length;
  const factor = 1 + Math.max(0, n - 1) * PEEK;
  const aspectRatio = 1.586 / factor;

  // Esc で拡大を閉じる
  useEffect(() => {
    if (expanded == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expanded]);

  const card = expanded != null ? cards[expanded] : null;

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="grid w-full" style={{ aspectRatio }}>
        {cards.map((c, i) => {
          const lifted = active === i;
          const shift = i * PEEK * 100 - (lifted ? 6 : 0);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setExpanded(i)}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive((cur) => (cur === i ? null : cur))}
              aria-label={`${c.name} を拡大`}
              className="[grid-area:1/1] block w-full cursor-pointer rounded-xl outline-none transition-transform duration-200 ease-out focus-visible:ring-2 focus-visible:ring-accent"
              style={{ transform: `translateY(${shift}%)`, zIndex: lifted ? 100 : i + 1 }}
            >
              <div
                className={`owned-sheen relative ${
                  lifted ? 'drop-shadow-[0_18px_30px_rgba(0,0,0,0.55)]' : ''
                }`}
              >
                <CardFace card={c} />
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-center text-xs text-muted">
        カードをタップすると拡大表示します
      </p>

      {/* 拡大モーダル */}
      {card && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setExpanded(null)}
        >
          <div
            className="wallet-pop w-full max-w-md space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="owned-sheen relative">
              <CardFace card={card} />
            </div>

            <div className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-xs text-muted">{card.issuer}</p>
              <h2 className="text-lg font-semibold">{card.name}</h2>
              <div className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-muted">ランク</span>
                <span className="text-right">{card.tier}</span>
                <span className="text-muted">年会費</span>
                <span className="text-right">{formatYen(card.annual_fee)}</span>
                <span className="text-muted">還元率</span>
                <span className="text-right">{formatRate(card.base_reward_rate)}</span>
                <span className="text-muted">ブランド</span>
                <span className="text-right">
                  {card.brands.map((b) => BRAND_LABELS[b]).join(' / ') || '—'}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <Link
                  href={`/cards/${card.slug}`}
                  className="text-sm text-accent hover:text-accent-soft"
                >
                  詳細を見る →
                </Link>
                <button
                  type="button"
                  onClick={() => setExpanded(null)}
                  className="rounded-md border border-border px-3 py-1.5 text-sm text-muted transition hover:text-foreground"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
