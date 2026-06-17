import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCardBySlug } from '@/lib/cards/queries';
import { getCurrentUser } from '@/lib/auth';
import { CardFace } from '@/components/card/CardFace';
import { OwnToggle } from '@/components/ownership/OwnToggle';
import { formatYen, formatRate } from '@/lib/cards/style';
import { BRAND_LABELS } from '@/lib/types';

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
  const [card, user] = await Promise.all([getCardBySlug(slug), getCurrentUser()]);
  if (!card) notFound();

  const owned = card.ownStatus === 'owned';

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-muted transition hover:text-foreground">
        ← 一覧へ戻る
      </Link>

      <div className="grid gap-8 md:grid-cols-[minmax(0,360px)_1fr]">
        <div className="space-y-4">
          <div className={`relative ${owned ? 'owned-sheen' : 'is-unowned'}`}>
            <CardFace card={card} />
          </div>
          {user ? (
            <OwnToggle cardId={card.id} initialStatus={card.ownStatus} />
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
        </div>

        <div>
          <p className="text-sm text-muted">{card.issuer}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{card.name}</h1>
          <p className="mt-1 text-sm text-accent">{card.tier}</p>

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
