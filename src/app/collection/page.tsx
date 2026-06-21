import Link from 'next/link';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCardsWithStatus } from '@/lib/cards/queries';
import { getCurrentProfile } from '@/lib/auth';
import { CardTile } from '@/components/card/CardTile';
import { StatsDashboard } from '@/components/collection/StatsDashboard';
import { SearchBox } from '@/components/filter/SearchBox';
import { computeCollectionStats } from '@/lib/cards/stats';
import { cardMatchesQuery } from '@/lib/cards/search';
import { isPro, shouldShowAds } from '@/lib/billing';
import { AdSlot } from '@/components/ads/AdSlot';
import type { CardWithStatus } from '@/lib/types';

export const metadata = { title: 'マイコレクション', robots: { index: false } };

function matchesQuery(card: CardWithStatus, q: string): boolean {
  return cardMatchesQuery(card.name, card.issuer, q);
}

export default async function CollectionPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/login');

  const [cards, sp] = await Promise.all([
    getCardsWithStatus(isPro(profile)),
    searchParams,
  ]);
  const q = (sp.q ?? '').trim();
  const stats = computeCollectionStats(cards);

  // 集計は全コレクション基準。表示グリッドのみ検索語で絞り込む。
  const ownedAll = cards.filter((c) => c.ownStatus === 'owned' && !c.locked);
  const wantAll = cards.filter((c) => c.ownStatus === 'want');
  const lockedAll = cards.filter((c) => c.locked);
  const owned = ownedAll.filter((c) => matchesQuery(c, q));
  const want = wantAll.filter((c) => matchesQuery(c, q));
  const locked = lockedAll.filter((c) => matchesQuery(c, q));

  const suggestions = [...ownedAll, ...wantAll].map((c) => ({
    name: c.name,
    slug: c.slug,
    issuer: c.issuer,
  }));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">マイコレクション</h1>

      <StatsDashboard stats={stats} />

      {shouldShowAds(profile) && <AdSlot slot={2} />}

      {(ownedAll.length > 0 || wantAll.length > 0) && (
        <Suspense fallback={null}>
          <SearchBox suggestions={suggestions} placeholder="コレクション内をカード名で検索" />
        </Suspense>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          所有カード <span className="text-muted">{owned.length}</span>
          {q && <span className="ml-1 text-xs text-muted">/ 全{ownedAll.length}</span>}
        </h2>
        {ownedAll.length === 0 ? (
          <p className="rounded-xl border border-border bg-surface/60 p-8 text-center text-muted">
            まだ所有カードがありません。
            <Link href="/" className="ml-1 text-accent hover:text-accent-soft">
              一覧から追加
            </Link>
          </p>
        ) : owned.length === 0 ? (
          <p className="rounded-xl border border-border bg-surface/60 p-6 text-center text-sm text-muted">
            「{q}」に一致する所有カードはありません。
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {owned.map((card) => (
              <CardTile key={card.id} card={card} isLoggedIn />
            ))}
          </div>
        )}
      </section>

      {lockedAll.length > 0 && (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">
              🔒 ロック中 <span className="text-muted">{locked.length}</span>
              {q && <span className="ml-1 text-xs text-muted">/ 全{lockedAll.length}</span>}
            </h2>
            <Link
              href="/pricing"
              className="rounded-md border border-accent/50 px-3 py-1.5 text-sm font-medium text-accent transition hover:bg-accent/10"
            >
              PROで全部解放
            </Link>
          </div>
          <p className="text-sm text-muted">
            無料プランの上限（10枚）を超えた分です。PROに加入すると再び表示・カウントされます。
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {locked.map((card) => (
              <CardTile key={card.id} card={card} isLoggedIn />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          欲しいリスト <span className="text-muted">{want.length}</span>
          {q && <span className="ml-1 text-xs text-muted">/ 全{wantAll.length}</span>}
        </h2>
        {wantAll.length === 0 ? (
          <p className="rounded-xl border border-border bg-surface/60 p-8 text-center text-muted">
            気になるカードは
            <Link href="/" className="mx-1 text-accent hover:text-accent-soft">
              一覧
            </Link>
            で「欲しい」を付けるとここに集まります。
          </p>
        ) : want.length === 0 ? (
          <p className="rounded-xl border border-border bg-surface/60 p-6 text-center text-sm text-muted">
            「{q}」に一致する欲しいカードはありません。
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {want.map((card) => (
              <CardTile key={card.id} card={card} isLoggedIn />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
