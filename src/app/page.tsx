import { Suspense } from 'react';
import { getCardsWithStatus } from '@/lib/cards/queries';
import { getCurrentProfile } from '@/lib/auth';
import { CardTile } from '@/components/card/CardTile';
import { CollectionProgress } from '@/components/collection/CollectionProgress';
import { FilterBar } from '@/components/filter/FilterBar';
import { SearchBox } from '@/components/filter/SearchBox';
import { AdSlot } from '@/components/ads/AdSlot';
import { parseFilters, applyFilters } from '@/lib/cards/filter';
import { shouldShowAds } from '@/lib/billing';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [cards, profile, sp] = await Promise.all([
    getCardsWithStatus(),
    getCurrentProfile(),
    searchParams,
  ]);
  const isLoggedIn = !!profile;
  const showAds = shouldShowAds(profile);

  const filters = parseFilters(sp);
  const visible = applyFilters(cards, filters);

  // 発行会社の一覧（重複排除・五十音順）
  const allIssuers = [...new Set(cards.map((c) => c.issuer))].sort((a, b) =>
    a.localeCompare(b, 'ja')
  );
  const suggestions = cards.map((c) => ({ name: c.name, slug: c.slug, issuer: c.issuer }));

  // 収集サマリは全カードに対する所有状況（フィルタの影響を受けない）
  const owned = cards.filter((c) => c.ownStatus === 'owned');
  const totalAnnualFee = owned.reduce((sum, c) => sum + c.annual_fee, 0);
  const priorityPassCount = owned.filter((c) => c.priority_pass !== 'なし').length;

  return (
    <div className="space-y-6">
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

      <Suspense fallback={null}>
        <SearchBox suggestions={suggestions} />
      </Suspense>

      <Suspense fallback={null}>
        <FilterBar
          allIssuers={allIssuers}
          showOwnership={isLoggedIn}
          resultCount={visible.length}
        />
      </Suspense>

      {showAds && <AdSlot />}

      {visible.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface/60 p-8 text-center text-muted">
          {cards.length === 0
            ? 'カードがまだありません。シードデータを投入してください（README 参照）。'
            : '条件に合うカードがありません。フィルタを緩めてみてください。'}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((card) => (
            <CardTile key={card.id} card={card} isLoggedIn={isLoggedIn} />
          ))}
        </div>
      )}
    </div>
  );
}
