import { ImageResponse } from 'next/og';
import { getCardsBySlugs } from '@/lib/cards/queries';
import type { Tier } from '@/lib/types';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'クレジットカードコレクション — Card Collection';

const TIER_BG: Record<Tier, string> = {
  一般: 'linear-gradient(135deg, #2b2b30, #1a1a1d 60%, #232327)',
  ゴールド: 'linear-gradient(135deg, #6e5a2a, #d8b56e 50%, #6e5a2a)',
  プラチナ: 'linear-gradient(135deg, #8d9097, #eef1f4 50%, #888d94)',
  ブラック: 'linear-gradient(135deg, #161616, #2c2c2e 50%, #0b0b0b)',
};
const TIER_TEXT: Record<Tier, string> = {
  一般: '#ededed',
  ゴールド: '#3a2e10',
  プラチナ: '#1b1b20',
  ブラック: '#ededed',
};

export default async function ShareOgImage({ params }: { params: Promise<{ ids: string }> }) {
  const { ids } = await params;
  const slugs = decodeURIComponent(ids).split(',').map((s) => s.trim()).filter(Boolean);
  const all = await getCardsBySlugs(slugs);
  const cards = all.slice(0, 12);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '48px',
          background: '#0a0a0a',
          color: '#ededed',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
          <div style={{ display: 'flex', fontSize: 34, fontWeight: 700 }}>
            <span>Card</span>
            <span style={{ color: '#c9a86a' }}>Collection</span>
          </div>
          <div style={{ display: 'flex', fontSize: 26, color: '#a7a7b0' }}>
            私のコレクション {all.length}枚
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 28 }}>
          {cards.map((c) =>
            c.image_url ? (
              // 実際のカード画像を表示
              <img
                key={c.id}
                src={c.image_url}
                alt=""
                width={256}
                height={161}
                style={{ width: 256, height: 161, objectFit: 'cover', borderRadius: 12 }}
              />
            ) : (
              // 画像未登録はランク色のプレースホルダー
              <div
                key={c.id}
                style={{
                  width: 256,
                  height: 161,
                  borderRadius: 12,
                  padding: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: TIER_BG[c.tier],
                  color: TIER_TEXT[c.tier],
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span>{c.tier}</span>
                  <div style={{ width: 28, height: 20, borderRadius: 4, background: 'rgba(220,190,110,0.9)', display: 'flex' }} />
                </div>
                <div style={{ display: 'flex', fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>
                  {c.name.length > 22 ? c.name.slice(0, 22) + '…' : c.name}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
