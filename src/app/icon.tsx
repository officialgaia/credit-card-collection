import { ImageResponse } from 'next/og';

// クレジットカード風のファビコン（PNGとして生成。全ブラウザ対応）
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
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
            width: 26,
            height: 18,
            borderRadius: 4,
            display: 'flex',
            background: 'linear-gradient(135deg, #e7d29a, #c9a86a 55%, #9c7a40)',
          }}
        >
          {/* 磁気ストライプ */}
          <div
            style={{
              position: 'absolute',
              top: 4,
              left: 0,
              width: 26,
              height: 3.5,
              background: '#1b1b20',
            }}
          />
          {/* ICチップ */}
          <div
            style={{
              position: 'absolute',
              top: 10,
              left: 3,
              width: 6,
              height: 5,
              borderRadius: 1.5,
              background: '#b08a45',
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
