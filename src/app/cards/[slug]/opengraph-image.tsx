import { ImageResponse } from 'next/og';
import { getCardBySlug } from '@/lib/cards/queries';
import { formatYen, formatRate } from '@/lib/cards/style';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'クレジットカード詳細 — Card Collection';

export default async function CardOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = await getCardBySlug(slug);

  const name = card?.name ?? 'Card Collection';
  const issuer = card?.issuer ?? '';
  const meta = card
    ? `${card.tier}・年会費 ${formatYen(card.annual_fee)}・還元率 ${formatRate(card.base_reward_rate)}`
    : '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          background: '#0a0a0a',
          color: '#ededed',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 64,
              height: 40,
              borderRadius: 8,
              display: 'flex',
              background: 'linear-gradient(135deg, #e7d29a, #c9a86a 55%, #9c7a40)',
            }}
          />
          <div style={{ display: 'flex', fontSize: 26, fontWeight: 700, color: '#c9a86a' }}>
            Card Collection
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {issuer ? <div style={{ display: 'flex', fontSize: 28, color: '#a7a7b0' }}>{issuer}</div> : null}
          <div style={{ display: 'flex', marginTop: 12, fontSize: 60, fontWeight: 700, lineHeight: 1.2 }}>
            {name}
          </div>
          {meta ? <div style={{ display: 'flex', marginTop: 20, fontSize: 30, color: '#c9a86a' }}>{meta}</div> : null}
        </div>

        <div style={{ display: 'flex', fontSize: 22, color: '#8a8a92' }}>
          日本のクレジットカード図鑑・比較
        </div>
      </div>
    ),
    { ...size }
  );
}
