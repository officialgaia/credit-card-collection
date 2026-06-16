import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCardsWithStatus } from '@/lib/cards/queries';
import { getCurrentUser } from '@/lib/auth';
import { CardTile } from '@/components/card/CardTile';
import { CollectionProgress } from '@/components/collection/CollectionProgress';

export default async function CollectionPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const cards = await getCardsWithStatus();
  const owned = cards.filter((c) => c.ownStatus === 'owned');
  const want = cards.filter((c) => c.ownStatus === 'want');

  const totalAnnualFee = owned.reduce((sum, c) => sum + c.annual_fee, 0);
  const priorityPassCount = owned.filter((c) => c.priority_pass !== 'なし').length;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">マイコレクション</h1>

      <CollectionProgress
        ownedCount={owned.length}
        totalCount={cards.length}
        totalAnnualFee={totalAnnualFee}
        priorityPassCount={priorityPassCount}
      />

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

      {want.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            欲しいリスト <span className="text-muted">{want.length}</span>
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {want.map((card) => (
              <CardTile key={card.id} card={card} isLoggedIn />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
