import { ImageResponse } from 'next/og';

// iOS ホーム画面・Safari用のタッチアイコン
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: 132,
            height: 92,
            borderRadius: 16,
            display: 'flex',
            background: 'linear-gradient(135deg, #e7d29a, #c9a86a 55%, #9c7a40)',
          }}
        >
          {/* 磁気ストライプ */}
          <div
            style={{
              position: 'absolute',
              top: 20,
              left: 0,
              width: 132,
              height: 18,
              background: '#1b1b20',
            }}
          />
          {/* ICチップ */}
          <div
            style={{
              position: 'absolute',
              top: 50,
              left: 16,
              width: 30,
              height: 24,
              borderRadius: 6,
              background: '#b08a45',
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
