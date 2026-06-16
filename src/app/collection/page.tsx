import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCardsWithStatus } from '@/lib/cards/queries';
import { getCurrentUser } from '@/lib/auth';
import { CardTile } from '@/components/card/CardTile';
import { StatsDashboard } from '@/components/collection/StatsDashboard';
import { computeCollectionStats } from '@/lib/cards/stats';

export default async function CollectionPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const cards = await getCardsWithStatus();
  const stats = computeCollectionStats(cards);

  const owned = cards.filter((c) => c.ownStatus === 'owned');
  const want = cards.filter((c) => c.ownStatus === 'want');

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">マイコレクション</h1>

      <StatsDashboard stats={stats} />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          所有カード <span className="text-muted">{owned.length}</span>
        </h2>
        {owned.length === 0 ? (
          <p className="rounded-xl border border-border bg-surface/60 p-8 text-center text-muted">
            まだ所有カードがありません。
            <Link href="/" className="ml-1 text-accent hover:text-accent-soft">
              一覧から追加
            </Link>
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {owned.map((card) => (
              <CardTile key={card.id} card={card} isLoggedIn />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          欲しいリスト <span className="text-muted">{want.length}</span>
        </h2>
        {want.length === 0 ? (
          <p className="rounded-xl border border-border bg-surface/60 p-8 text-center text-muted">
            気になるカードは
            <Link href="/" className="mx-1 text-accent hover:text-accent-soft">
              一覧
            </Link>
            で「欲しい」を付けるとここに集まります。
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
