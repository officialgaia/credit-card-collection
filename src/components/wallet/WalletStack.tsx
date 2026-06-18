'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Card } from '@/lib/types';
import { BRAND_LABELS } from '@/lib/types';
import { CardFace } from '@/components/card/CardFace';
import { formatYen, formatRate } from '@/lib/cards/style';

// 所有カードを Apple Pay のウォレットのように重ねて表示する。
// カードをクリックすると拡大モーダルで表示する。
// 重なり量はコンテナ幅に対する割合（%）で指定するため、画面幅に追従する。
const OVERLAP = 42; // 直前のカードに重ねる量（幅に対する%）

export function WalletStack({ cards }: { cards: Card[] }) {
  const [active, setActive] = useState<number | null>(null); // ホバー中
  const [expanded, setExpanded] = useState<number | null>(null); // 拡大中

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
      <div className="flex flex-col">
        {cards.map((c, i) => {
          const lifted = active === i;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setActive(null); // 持ち上げ状態を解除してモーダルだけ見せる
                setExpanded(i);
              }}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive((cur) => (cur === i ? null : cur))}
              aria-label={`${c.name} を拡大`}
              className="block w-full rounded-xl outline-none transition-transform duration-200 ease-out focus-visible:ring-2 focus-visible:ring-accent"
              style={{
                position: 'relative',
                marginTop: i === 0 ? 0 : `-${OVERLAP}%`,
                zIndex: lifted ? 100 : i + 1,
                transform: lifted ? 'translateY(-5%)' : undefined,
              }}
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
          className="fixed inset-0 z-[200] overflow-y-auto bg-black/90 backdrop-blur-sm"
          onClick={() => setExpanded(null)}
        >
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="wallet-pop w-full max-w-sm space-y-4"
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
        </div>
      )}
    </div>
  );
}
