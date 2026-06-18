import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCardsWithStatus } from '@/lib/cards/queries';
import { getCurrentProfile } from '@/lib/auth';
import { isPro, shouldShowAds } from '@/lib/billing';
import { CardTile } from '@/components/card/CardTile';
import { AdSlot } from '@/components/ads/AdSlot';
import { GUIDES, getGuide } from '@/lib/guides';
import { cardBadges } from '@/lib/cards/review';
import { formatYen, formatRate } from '@/lib/cards/style';

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
  const showAds = shouldShowAds(profile);
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

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guide.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: '特集', item: `${siteUrl}/guides` },
      { '@type': 'ListItem', position: 3, name: guide.heading, item: `${siteUrl}/guides/${guide.slug}` },
    ],
  };

  return (
    <div className="space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
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
        {guide.listHref && (
          <p className="text-sm">
            <Link href={guide.listHref} className="text-accent hover:text-accent-soft">
              条件を絞り込んで一覧で見る →
            </Link>
          </p>
        )}
      </header>

      <section className="rounded-2xl border border-border bg-surface/50 p-5">
        <h2 className="text-sm font-semibold text-accent">選び方のチェックポイント</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {guide.points.map((p, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-accent">✓</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </section>

      {matched.length >= 3 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">おすすめTOP3</h2>
          <ol className="space-y-3">
            {matched.slice(0, 3).map((card, i) => (
              <li
                key={card.id}
                className="flex gap-4 rounded-2xl border border-border bg-surface/60 p-4"
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    i === 0 ? 'bg-accent text-black' : 'bg-surface-2 text-accent'
                  }`}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/cards/${card.slug}`}
                    className="font-semibold hover:text-accent-soft"
                  >
                    {card.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted">
                    {card.issuer} · 年会費 {formatYen(card.annual_fee)} · 還元 {formatRate(card.base_reward_rate)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {cardBadges(card).slice(0, 4).map((b) => (
                      <span
                        key={b}
                        className="rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[11px] text-muted"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {showAds && <AdSlot slot={2} />}

      <p className="text-sm text-muted">すべての該当カード（{matched.length} 枚）</p>

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

      {/* 解説本文 */}
      <div className="space-y-5">
        {guide.sections.map((s, i) => (
          <section key={i} className="space-y-2">
            <h2 className="text-lg font-semibold">{s.heading}</h2>
            <p className="text-sm leading-relaxed text-muted">{s.body}</p>
          </section>
        ))}
      </div>

      {/* よくある質問 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">よくある質問</h2>
        <div className="space-y-3">
          {guide.faqs.map((f, i) => (
            <details
              key={i}
              className="group rounded-xl border border-border bg-surface/60 p-4 [&_summary]:cursor-pointer"
            >
              <summary className="flex items-center justify-between font-medium marker:content-['']">
                {f.q}
                <span className="text-muted transition group-open:rotate-180">▾</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

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
