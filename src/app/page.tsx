import { getCardsWithStatus } from '@/lib/cards/queries';
import { getCurrentUser } from '@/lib/auth';
import { CardTile } from '@/components/card/CardTile';
import { CollectionProgress } from '@/components/collection/CollectionProgress';

export default async function HomePage() {
  const [cards, user] = await Promise.all([getCardsWithStatus(), getCurrentUser()]);
  const isLoggedIn = !!user;

  const owned = cards.filter((c) => c.ownStatus === 'owned');
  const totalAnnualFee = owned.reduce((sum, c) => sum + c.annual_fee, 0);
  const priorityPassCount = owned.filter((c) => c.priority_pass !== 'なし').length;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          クレジットカード コレクション
        </h1>
        <p className="text-sm text-muted">
          日本で発行できるカードを集めよう。持っているカードにチェックを付けると鮮やかに浮かび上がります。
        </p>
      </div>

      {isLoggedIn && (
        <CollectionProgress
          ownedCount={owned.length}
          totalCount={cards.length}
          totalAnnualFee={totalAnnualFee}
          priorityPassCount={priorityPassCount}
        />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((card) => (
          <CardTile key={card.id} card={card} isLoggedIn={isLoggedIn} />
        ))}
      </div>

      {cards.length === 0 && (
        <p className="rounded-xl border border-border bg-surface/60 p-8 text-center text-muted">
          カードがまだありません。シードデータを投入してください（README 参照）。
        </p>
      )}
    </div>
  );
}
