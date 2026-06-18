import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCardsWithStatus } from '@/lib/cards/queries';
import { getCurrentProfile } from '@/lib/auth';
import { WalletStack } from '@/components/wallet/WalletStack';
import { formatYen } from '@/lib/cards/style';
import { isPro } from '@/lib/billing';

export const metadata = { title: 'マイ財布', robots: { index: false } };

export default async function WalletPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/login');

  const cards = await getCardsWithStatus(isPro(profile));
  // 所有カードを年会費の高い順（=見栄えする高ランクが上）に重ねる（ロック分は除外）
  const owned = cards
    .filter((c) => c.ownStatus === 'owned' && !c.locked)
    .sort((a, b) => b.annual_fee - a.annual_fee);

  const totalAnnualFee = owned.reduce((s, c) => s + c.annual_fee, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">マイ財布</h1>
          <p className="mt-1 text-sm text-muted">
            所有カード {owned.length} 枚 · 合計年会費 {formatYen(totalAnnualFee)}
          </p>
        </div>
        <Link
          href="/collection"
          className="text-sm text-muted transition hover:text-foreground"
        >
          コレクション集計を見る →
        </Link>
      </div>

      {owned.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface/60 p-8 text-center text-muted">
          まだ所有カードがありません。
          <Link href="/" className="ml-1 text-accent hover:text-accent-soft">
            一覧から「所有する」を付けてみましょう
          </Link>
        </p>
      ) : (
        <WalletStack cards={owned} />
      )}
    </div>
  );
}
