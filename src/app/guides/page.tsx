import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllCards } from '@/lib/cards/queries';
import { GUIDES } from '@/lib/guides';

export const metadata: Metadata = {
  title: '特集・クレジットカード比較',
  description:
    '年会費無料・高還元・ゴールド比較・プライオリティパス付きなど、目的別のクレジットカード比較特集。あなたに合う1枚を見つけられます。',
  alternates: { canonical: '/guides' },
};

export default async function GuidesPage() {
  const cards = await getAllCards();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">特集・カード比較</h1>
        <p className="text-sm text-muted">
          目的別におすすめのクレジットカードをまとめました。気になるテーマから比較できます。
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {GUIDES.map((g) => {
          const count = cards.filter(g.filter).length;
          return (
            <Link
              key={g.slug}
              href={`/guides/${g.slug}`}
              className="rounded-2xl border border-border bg-surface/60 p-5 transition hover:border-accent/40 hover:bg-surface"
            >
              <h2 className="text-base font-semibold text-accent-soft">{g.heading}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-muted">{g.description}</p>
              <p className="mt-3 text-xs text-muted">{count} 枚を掲載</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
