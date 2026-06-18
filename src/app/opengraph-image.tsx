import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Card Collection — 日本のクレジットカード図鑑・比較';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: '#0a0a0a',
          color: '#ededed',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div
            style={{
              width: 120,
              height: 76,
              borderRadius: 12,
              display: 'flex',
              flexDirection: 'column',
              background: 'linear-gradient(135deg, #e7d29a, #c9a86a 55%, #9c7a40)',
            }}
          >
            <div style={{ marginTop: 18, width: 120, height: 14, background: '#1b1b20', display: 'flex' }} />
          </div>
          <div style={{ display: 'flex', fontSize: 40, fontWeight: 700 }}>
            <span>Card</span>
            <span style={{ color: '#c9a86a' }}>Collection</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 40, fontSize: 64, fontWeight: 700, lineHeight: 1.25 }}>
          <span>日本のクレジットカード</span>
          <span>図鑑・比較</span>
        </div>

        <div style={{ display: 'flex', marginTop: 28, fontSize: 30, color: '#a7a7b0' }}>
          年会費・還元率・特典で検索 ／ 所有カードをコレクション
        </div>
      </div>
    ),
    { ...size }
  );
}
