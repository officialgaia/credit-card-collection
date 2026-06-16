'use client';

import { useState, useTransition } from 'react';
import { setCardStatus } from '@/app/actions/ownership';
import type { CardStatus } from '@/lib/types';

// 所有 / 欲しい / なし をその場で切り替える。
// 楽観的更新し、失敗時は元に戻す。
export function OwnToggle({
  cardId,
  initialStatus,
}: {
  cardId: string;
  initialStatus: CardStatus | null;
}) {
  const [status, setStatus] = useState<CardStatus | null>(initialStatus);
  const [isPending, startTransition] = useTransition();

  function update(next: CardStatus | null) {
    const prev = status;
    setStatus(next); // 楽観的更新
    startTransition(async () => {
      const res = await setCardStatus(cardId, next);
      if (res?.error) setStatus(prev); // ロールバック
    });
  }

  return (
    <div className="flex gap-1.5" data-pending={isPending}>
      <button
        type="button"
        onClick={() => update(status === 'owned' ? null : 'owned')}
        aria-pressed={status === 'owned'}
        className={`flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition
          ${
            status === 'owned'
              ? 'bg-accent text-black shadow-[0_0_12px_rgba(201,168,106,0.5)]'
              : 'border border-border bg-surface-2 text-muted hover:text-foreground'
          }`}
      >
        {status === 'owned' ? '✓ 所有中' : '所有する'}
      </button>
      <button
        type="button"
        onClick={() => update(status === 'want' ? null : 'want')}
        aria-pressed={status === 'want'}
        className={`rounded-md px-2 py-1.5 text-xs font-medium transition
          ${
            status === 'want'
              ? 'border border-accent/60 text-accent'
              : 'border border-border bg-surface-2 text-muted hover:text-foreground'
          }`}
      >
        欲しい
      </button>
    </div>
  );
}
