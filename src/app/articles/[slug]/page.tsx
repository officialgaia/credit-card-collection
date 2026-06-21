import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ARTICLES, getArticle } from '@/lib/articles';
import { ShareButtons } from '@/components/share/ShareButtons';
import { AdSlot } from '@/components/ads/AdSlot';
import { getCurrentProfile } from '@/lib/auth';
import { shouldShowAds } from '@/lib/billing';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://credit-card-collection.vercel.app';

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) return { title: '記事が見つかりません' };
  return {
    title: a.title,
    description: a.description,
    alternates: { canonical: `/articles/${a.slug}` },
    openGraph: { type: 'article', title: a.title, description: a.description },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) notFound();

  const profile = await getCurrentProfile();
  const showAds = shouldShowAds(profile);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.description,
    datePublished: a.date,
    dateModified: a.date,
    author: { '@type': 'Organization', name: 'Card Collection' },
    publisher: { '@type': 'Organization', name: 'Card Collection' },
    mainEntityOfPage: `${siteUrl}/articles/${a.slug}`,
  };

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="text-sm text-muted">
        <Link href="/articles" className="transition hover:text-foreground">コラム</Link>
        <span className="mx-1">/</span>
        <span>{a.title}</span>
      </nav>

      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{a.title}</h1>
        <p className="text-xs text-muted">公開日: {a.date}</p>
        <p className="text-sm leading-relaxed text-muted">{a.lead}</p>
        <ShareButtons title={`${a.title}｜Card Collection`} />
      </header>

      {showAds && <AdSlot slot={2} />}

      <div className="space-y-6">
        {a.sections.map((s, i) => (
          <section key={i} className="space-y-2">
            <h2 className="text-lg font-semibold">{s.heading}</h2>
            {s.body.map((p, j) => (
              <p key={j} className="text-sm leading-relaxed text-muted">{p}</p>
            ))}
          </section>
        ))}
      </div>

      <section className="space-y-3 rounded-2xl border border-accent/40 bg-surface p-5">
        <h2 className="text-sm font-semibold text-accent">関連リンク</h2>
        <ul className="space-y-1.5 text-sm">
          {a.related.map((r) => (
            <li key={r.href}>
              <Link href={r.href} className="text-accent hover:text-accent-soft">
                {r.label} →
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted">ほかのコラム</h2>
        <div className="flex flex-wrap gap-2">
          {ARTICLES.filter((x) => x.slug !== a.slug).map((x) => (
            <Link
              key={x.slug}
              href={`/articles/${x.slug}`}
              className="rounded-full border border-border bg-surface-2 px-3 py-1 text-sm text-muted transition hover:text-foreground"
            >
              {x.title.length > 24 ? x.title.slice(0, 24) + '…' : x.title}
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
