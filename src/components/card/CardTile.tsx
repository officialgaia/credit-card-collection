import Link from 'next/link';
import type { CardWithStatus } from '@/lib/types';
import { formatYen, formatRate } from '@/lib/cards/style';
import { CardFace } from '@/components/card/CardFace';
import { OwnToggle } from '@/components/ownership/OwnToggle';

// 一覧グリッドの1枚。所有/未所有で見た目が明確に変わる。
export function CardTile({
  card,
  isLoggedIn,
}: {
  card: CardWithStatus;
  isLoggedIn: boolean;
}) {
  const owned = card.ownStatus === 'owned';

  return (
    <div
      className={`group rounded-2xl border p-3 transition
        ${
          owned
            ? 'border-accent/40 bg-surface shadow-[0_0_24px_rgba(201,168,106,0.12)]'
            : 'border-border bg-surface/60'
        }`}
    >
      <Link href={`/cards/${card.slug}`} className="block">
        <div
          className={`relative ${owned ? 'owned-sheen' : 'is-unowned'}`}
          aria-hidden={false}
        >
          <CardFace card={card} />
          {card.ownStatus === 'want' && (
            <span className="absolute right-2 top-2 z-10 rounded-full border border-accent/60 bg-black/70 px-2 py-0.5 text-[10px] font-medium text-accent">
              欲しい
            </span>
          )}
        </div>
      </Link>

      <div className="mt-3 space-y-2 px-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <Link
            href={`/cards/${card.slug}`}
            className="line-clamp-1 text-sm font-semibold hover:text-accent-soft"
          >
            {card.name}
          </Link>
        </div>
        <div className="flex items-center justify-between text-xs text-muted">
          <span>年会費 {formatYen(card.annual_fee)}</span>
          <span>還元 {formatRate(card.base_reward_rate)}</span>
        </div>

        {isLoggedIn ? (
          <OwnToggle cardId={card.id} initialStatus={card.ownStatus} />
        ) : (
          <Link
            href="/login"
            className="block rounded-md border border-border bg-surface-2 px-2 py-1.5 text-center text-xs text-muted transition hover:text-foreground"
          >
            ログインして所有チェック
          </Link>
        )}
      </div>
    </div>
  );
}
