'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Card } from '@/lib/types';
import { CardFace } from '@/components/card/CardFace';
import { formatYen } from '@/lib/cards/style';

// 所有カードを財布のように重ねて表示する。
// 各カードは自身の高さの PEEK ぶんずつ下にずらして覗かせ、
// ホバー/フォーカスで前面に持ち上がる。
const PEEK = 0.42; // カード高さに対する見え幅の割合

export function WalletStack({ cards }: { cards: Card[] }) {
  const [active, setActive] = useState<number | null>(null);

  const n = cards.length;
  // コンテナの縦横比 = 幅 : 全体高さ（カードのアスペクト1.586:1を基準に算出）
  const factor = 1 + Math.max(0, n - 1) * PEEK;
  const aspectRatio = 1.586 / factor;

  const activeCard = active != null ? cards[active] : null;

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="grid w-full" style={{ aspectRatio }}>
        {cards.map((card, i) => {
          const lifted = active === i;
          const shift = i * PEEK * 100 - (lifted ? 8 : 0);
          return (
            <div
              key={card.id}
              className="[grid-area:1/1] transition-transform duration-200 ease-out"
              style={{ transform: `translateY(${shift}%)`, zIndex: lifted ? 100 : i + 1 }}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive((cur) => (cur === i ? null : cur))}
            >
              <Link
                href={`/cards/${card.slug}`}
                onFocus={() => setActive(i)}
                onBlur={() => setActive((cur) => (cur === i ? null : cur))}
                className={`block rounded-xl outline-none ${
                  lifted ? 'drop-shadow-[0_18px_30px_rgba(0,0,0,0.55)]' : ''
                }`}
              >
                <div className="owned-sheen relative">
                  <CardFace card={card} />
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* 選択中カードの情報 / 操作ヒント */}
      <div className="mt-4 min-h-[3rem] text-center">
        {activeCard ? (
          <div>
            <p className="text-sm font-semibold">{activeCard.name}</p>
            <p className="text-xs text-muted">
              {activeCard.issuer} · 年会費 {formatYen(activeCard.annual_fee)} ·{' '}
              <span className="text-accent">タップで詳細</span>
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted">
            カードにマウスを乗せる（スマホはタップ）と前面に出ます
          </p>
        )}
      </div>
    </div>
  );
}
