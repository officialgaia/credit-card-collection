import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCardsWithStatus } from '@/lib/cards/queries';
import { getCurrentProfile } from '@/lib/auth';
import { isPro } from '@/lib/billing';
import { CardTile } from '@/components/card/CardTile';
import { GUIDES, getGuide } from '@/lib/guides';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://credit-card-collection.vercel.app';

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return { title: '特集が見つかりません' };
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: { type: 'article', title: guide.title, description: guide.description },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const profile = await getCurrentProfile();
  const isLoggedIn = !!profile;
  const cards = await getCardsWithStatus(isPro(profile));

  const matched = cards.filter(guide.filter);
  if (guide.sort) matched.sort(guide.sort);

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: guide.title,
    description: guide.description,
    numberOfItems: matched.length,
    itemListElement: matched.slice(0, 30).map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      url: `${siteUrl}/cards/${c.slug}`,
    })),
  };

  return (
    <div className="space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <nav className="text-sm text-muted">
        <Link href="/guides" className="transition hover:text-foreground">
          特集
        </Link>
        <span className="mx-1">/</span>
        <span>{guide.heading}</span>
      </nav>

      <header className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">{guide.heading}</h1>
        <p className="text-sm leading-relaxed text-muted">{guide.intro}</p>
        <p className="text-sm">
          <Link href={guide.listHref} className="text-accent hover:text-accent-soft">
            条件を絞り込んで一覧で見る →
          </Link>
        </p>
      </header>

      <p className="text-sm text-muted">{matched.length} 枚</p>

      {matched.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface/60 p-8 text-center text-muted">
          該当するカードがありません。
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {matched.map((card) => (
            <CardTile key={card.id} card={card} isLoggedIn={isLoggedIn} />
          ))}
        </div>
      )}

      <section className="space-y-3 rounded-2xl border border-border bg-surface/50 p-5">
        <h2 className="text-sm font-semibold text-accent">他の特集</h2>
        <div className="flex flex-wrap gap-2">
          {GUIDES.filter((g) => g.slug !== guide.slug).map((g) => (
            <Link
              key={g.slug}
              href={`/guides/${g.slug}`}
              className="rounded-full border border-border bg-surface-2 px-3 py-1 text-sm text-muted transition hover:text-foreground"
            >
              {g.heading}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
