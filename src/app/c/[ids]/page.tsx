import type { Metadata } from 'next';
import Link from 'next/link';
import { getCardsBySlugs } from '@/lib/cards/queries';
import { CardFace } from '@/components/card/CardFace';

function parseIds(raw: string): string[] {
  return decodeURIComponent(raw)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 60);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ids: string }>;
}): Promise<Metadata> {
  const { ids } = await params;
  const cards = await getCardsBySlugs(parseIds(ids));
  const title = `クレジットカードコレクション（${cards.length}枚）`;
  const description = `${cards.length}枚のクレジットカードコレクションを公開中。あなたも持っているカードを集めて可視化しよう。`;
  return {
    title,
    description,
    openGraph: { title, description, type: 'article' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function SharedCollectionPage({
  params,
}: {
  params: Promise<{ ids: string }>;
}) {
  const { ids } = await params;
  const cards = await getCardsBySlugs(parseIds(ids));

  return (
    <div className="space-y-6">
      <header className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-accent">Card Collection</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          クレジットカードコレクション
          <span className="ml-2 text-accent">{cards.length}枚</span>
        </h1>
        <p className="text-sm text-muted">所有しているカードのコレクションです。</p>
      </header>

      {cards.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface/60 p-8 text-center text-muted">
          表示できるカードがありません。
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {cards.map((card) => (
            <Link key={card.id} href={`/cards/${card.slug}`} className="block">
              <div className="owned-sheen relative">
                <CardFace card={card} />
              </div>
              <p className="mt-2 line-clamp-1 text-xs text-muted">{card.name}</p>
            </Link>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-accent/40 bg-surface p-6 text-center">
        <p className="text-sm">あなたも持っているクレジットカードを集めて可視化しよう。</p>
        <Link
          href="/"
          className="mt-3 inline-block rounded-md bg-accent px-5 py-2 text-sm font-semibold text-black transition hover:bg-accent-soft"
        >
          Card Collection を見る
        </Link>
      </div>
    </div>
  );
}
