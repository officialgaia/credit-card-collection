import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCardBySlug } from '@/lib/cards/queries';
import { getCurrentProfile } from '@/lib/auth';
import { CardFace } from '@/components/card/CardFace';
import { OwnToggle } from '@/components/ownership/OwnToggle';
import { BrandSelect } from '@/components/ownership/BrandSelect';
import { AdSlot } from '@/components/ads/AdSlot';
import { ShareButtons } from '@/components/share/ShareButtons';
import { formatYen, formatRate } from '@/lib/cards/style';
import { BRAND_LABELS } from '@/lib/types';
import { shouldShowAds, isPro } from '@/lib/billing';
import { cardLead, cardForWhom } from '@/lib/cards/review';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://credit-card-collection.vercel.app';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const card = await getCardBySlug(slug);
  if (!card) return { title: 'カードが見つかりません' };

  const desc = `${card.issuer}の「${card.name}」（${card.tier}）。年会費${formatYen(card.annual_fee)}、基本還元率${formatRate(card.base_reward_rate)}、国際ブランド${card.brands.map((b) => BRAND_LABELS[b]).join('・') || '—'}。特典・スペックを比較できます。`;
  return {
    title: card.name,
    description: desc,
    alternates: { canonical: `/cards/${card.slug}` },
    openGraph: { type: 'article', title: card.name, description: desc },
    twitter: { card: 'summary_large_image', title: card.name, description: desc },
  };
}

function Spec({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-2.5 text-sm">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

function bool(v: boolean) {
  return v ? 'あり' : 'なし';
}

export default async function CardDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await getCurrentProfile();
  const card = await getCardBySlug(slug, isPro(profile));
  if (!card) notFound();

  const user = profile;
  const owned = card.ownStatus === 'owned' && !card.locked;
  const showAds = shouldShowAds(profile);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: card.name, item: `${siteUrl}/cards/${card.slug}` },
    ],
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: card.name,
    category: `クレジットカード（${card.tier}）`,
    description: `${card.issuer}の${card.name}。年会費${formatYen(card.annual_fee)}、還元率${formatRate(card.base_reward_rate)}。`,
    provider: { '@type': 'Organization', name: card.issuer },
    ...(card.official_url ? { url: card.official_url } : {}),
  };

  return (
    <div className="space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Link href="/" className="text-sm text-muted transition hover:text-foreground">
        ← 一覧へ戻る
      </Link>

      <div className="grid gap-8 md:grid-cols-[minmax(0,360px)_1fr]">
        <div className="space-y-4">
          <div className={`relative ${owned ? 'owned-sheen' : 'is-unowned'}`}>
            <CardFace card={card} />
          </div>
          {card.locked ? (
            <Link
              href="/pricing"
              className="block rounded-md border border-accent/50 px-2 py-2 text-center text-sm font-medium text-accent transition hover:bg-accent/10"
            >
              🔒 ロック中 — PROで解放
            </Link>
          ) : user ? (
            <>
              <OwnToggle cardId={card.id} initialStatus={card.ownStatus} />
              {owned && (
                <BrandSelect cardId={card.id} brands={card.brands} initial={card.ownBrand} />
              )}
            </>
          ) : (
            <Link
              href="/login"
              className="block rounded-md border border-border bg-surface-2 px-2 py-2 text-center text-sm text-muted transition hover:text-foreground"
            >
              ログインして所有チェック
            </Link>
          )}
          {(card.affiliate_url || card.official_url) && (
            <div className="space-y-1.5">
              <a
                href={card.affiliate_url || card.official_url || '#'}
                target="_blank"
                rel={card.affiliate_url ? 'sponsored noopener noreferrer' : 'noopener noreferrer'}
                className="block rounded-md bg-accent px-2 py-2 text-center text-sm font-semibold text-black transition hover:bg-accent-soft"
              >
                {card.affiliate_url ? '公式サイトで申し込む ↗' : '公式サイトを見る ↗'}
                {card.affiliate_url && (
                  <span className="ml-2 rounded bg-black/20 px-1.5 py-0.5 text-[10px] align-middle">
                    広告
                  </span>
                )}
              </a>
              {card.affiliate_url && (
                <p className="text-[11px] text-muted">
                  ※ 当リンクは広告（アフィリエイト）を含みます。
                </p>
              )}
            </div>
          )}
          <ShareButtons title={`${card.name}｜Card Collection`} />
          {showAds && <AdSlot slot={2} />}
        </div>

        <div>
          <p className="text-sm text-muted">{card.issuer}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{card.name}</h1>
          <p className="mt-1 text-sm text-accent">{card.tier}</p>

          <section className="mt-5 space-y-3 rounded-2xl border border-border bg-surface/50 p-5">
            <h2 className="text-sm font-semibold text-accent">このカードのポイント</h2>
            <p className="text-sm leading-relaxed text-muted">{cardLead(card)}</p>
            <p className="text-sm leading-relaxed">
              <span className="font-medium">向いている人：</span>
              <span className="text-muted">{cardForWhom(card)}</span>
            </p>
          </section>

          <dl className="mt-6">
            <Spec label="国際ブランド" value={card.brands.map((b) => BRAND_LABELS[b]).join(' / ') || '—'} />
            <Spec
              label="年会費"
              value={
                <span>
                  {formatYen(card.annual_fee)}
                  {card.annual_fee_note && (
                    <span className="ml-1 text-xs text-muted">（{card.annual_fee_note}）</span>
                  )}
                </span>
              }
            />
            <Spec label="家族カード年会費" value={formatYen(card.family_card_fee)} />
            <Spec label="ETCカード年会費" value={formatYen(card.etc_card_fee)} />
            <Spec
              label="基本還元率"
              value={
                <span>
                  {formatRate(card.base_reward_rate)}
                  {card.reward_note && (
                    <span className="ml-1 text-xs text-muted">（{card.reward_note}）</span>
                  )}
                </span>
              }
            />
            <Spec label="ポイント" value={card.point_program ?? '—'} />
            <Spec
              label="プライオリティパス"
              value={
                <span>
                  {card.priority_pass}
                  {card.priority_pass_note && (
                    <span className="ml-1 text-xs text-muted">（{card.priority_pass_note}）</span>
                  )}
                </span>
              }
            />
            <Spec label="空港ラウンジ" value={bool(card.airport_lounge)} />
            <Spec
              label="海外旅行保険"
              value={
                <span>
                  {card.travel_insurance}
                  {card.travel_insurance_amount && (
                    <span className="ml-1 text-xs text-muted">（{card.travel_insurance_amount}）</span>
                  )}
                </span>
              }
            />
            <Spec label="ショッピング保険" value={bool(card.shopping_insurance)} />
            <Spec label="コンシェルジュ" value={bool(card.concierge)} />
            <Spec label="タッチ決済" value={bool(card.touch_payment)} />
            <Spec label="ナンバーレス" value={bool(card.numberless)} />
            <Spec label="申込条件" value={card.eligibility ?? '—'} />
          </dl>
        </div>
      </div>
    </div>
  );
}
