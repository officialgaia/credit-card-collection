import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/auth';
import { getAllCards } from '@/lib/cards/queries';
import { formatYen, formatRate } from '@/lib/cards/style';

export default async function AdminPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/login');
  if (!profile.is_admin) redirect('/');

  const cards = await getAllCards();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">管理者ダッシュボード</h1>
          <p className="mt-1 text-sm text-muted">登録カード {cards.length} 枚</p>
        </div>
        <Link
          href="/admin/cards/new"
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-black transition hover:bg-accent-soft"
        >
          ＋ カードを追加
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-xs text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">カード名</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">発行会社</th>
              <th className="px-4 py-3 font-medium">ランク</th>
              <th className="px-4 py-3 text-right font-medium">年会費</th>
              <th className="hidden px-4 py-3 text-right font-medium md:table-cell">還元率</th>
              <th className="hidden px-4 py-3 text-center font-medium md:table-cell">画像</th>
              <th className="px-4 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {cards.map((card) => (
              <tr key={card.id} className="border-t border-border hover:bg-surface/50">
                <td className="px-4 py-3 font-medium">{card.name}</td>
                <td className="hidden px-4 py-3 text-muted sm:table-cell">{card.issuer}</td>
                <td className="px-4 py-3">{card.tier}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatYen(card.annual_fee)}</td>
                <td className="hidden px-4 py-3 text-right tabular-nums md:table-cell">
                  {formatRate(card.base_reward_rate)}
                </td>
                <td className="hidden px-4 py-3 text-center md:table-cell">
                  {card.image_url ? '🖼️' : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/cards/${card.id}/edit`}
                    className="text-accent transition hover:text-accent-soft"
                  >
                    編集
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {cards.length === 0 && (
          <p className="p-8 text-center text-sm text-muted">
            カードがありません。「カードを追加」から登録してください。
          </p>
        )}
      </div>
    </div>
  );
}
