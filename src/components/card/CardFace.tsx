import Image from 'next/image';
import type { Card } from '@/lib/types';
import { BRAND_LABELS } from '@/lib/types';
import { TIER_MATERIAL, TIER_TEXT } from '@/lib/cards/style';

// 実物カードのアスペクト比でカード面を描画する。
// image_url があれば実画像、なければランク/ブランドを反映したプレースホルダー。
export function CardFace({ card }: { card: Card }) {
  const textColor = TIER_TEXT[card.tier];

  return (
    <div className="relative aspect-[1.586/1] w-full overflow-hidden rounded-xl border border-white/10 shadow-lg">
      {card.image_url ? (
        <Image
          src={card.image_url}
          alt={card.name}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 22vw"
          className="card-material object-cover"
        />
      ) : (
        <div className={`card-material ${TIER_MATERIAL[card.tier]} absolute inset-0`}>
          {/* プレースホルダー: ランク + ブランド + カード名 */}
          <div className={`flex h-full flex-col justify-between p-4 ${textColor}`}>
            <div className="flex items-start justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-80">
                {card.tier}
              </span>
              {/* ICチップ風 */}
              <span className="h-5 w-7 rounded-[3px] bg-gradient-to-br from-yellow-200/80 to-yellow-600/60 ring-1 ring-black/20" />
            </div>

            <div className="space-y-1.5">
              <p className="text-[10px] opacity-75">{card.issuer}</p>
              <p className="text-sm font-semibold leading-tight line-clamp-2">
                {card.name}
              </p>
              <div className="flex flex-wrap gap-1 pt-0.5">
                {card.brands.map((b) => (
                  <span
                    key={b}
                    className="rounded bg-black/25 px-1.5 py-0.5 text-[9px] font-medium tracking-wide backdrop-blur-sm"
                  >
                    {BRAND_LABELS[b]}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
