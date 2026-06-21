'use client';

import { useState, useTransition } from 'react';
import { setCardBrand } from '@/app/actions/ownership';
import { BRAND_LABELS, type Brand } from '@/lib/types';

// 所有カードで実際に保有する決済ブランドを選ぶ（任意・1つ）。
// 選んだブランドだけが「ブランド別保有」に集計される。
export function BrandSelect({
  cardId,
  brands,
  initial,
}: {
  cardId: string;
  brands: Brand[];
  initial: Brand | null;
}) {
  const [selected, setSelected] = useState<Brand | null>(initial);
  const [, startTransition] = useTransition();

  function choose(b: Brand) {
    const next = selected === b ? null : b; // 同じものを再クリックで解除
    const prev = selected;
    setSelected(next);
    startTransition(async () => {
      const res = await setCardBrand(cardId, next);
      if (res?.error) setSelected(prev);
    });
  }

  return (
    <div className="space-y-1.5">
      <p className="text-xs text-muted">保有している決済ブランドを選択（任意）</p>
      <div className="flex flex-wrap gap-1.5">
        {brands.map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => choose(b)}
            aria-pressed={selected === b}
            className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${
              selected === b
                ? 'border-accent bg-accent text-black'
                : 'border-border bg-surface-2 text-muted hover:text-foreground'
            }`}
          >
            {BRAND_LABELS[b]}
          </button>
        ))}
      </div>
    </div>
  );
}
