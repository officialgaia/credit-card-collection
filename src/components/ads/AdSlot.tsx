// 表示広告枠（無料/未ログインユーザーにのみ表示する想定。呼び出し側で制御）。
// 2系統の広告（例: slot1=A8バナー / slot2=忍者AdMax）を併用できる。
//   slot1: NEXT_PUBLIC_AD_HTML   / NEXT_PUBLIC_AD_WIDTH   / NEXT_PUBLIC_AD_HEIGHT
//   slot2: NEXT_PUBLIC_AD_HTML_2 / NEXT_PUBLIC_AD_WIDTH_2 / NEXT_PUBLIC_AD_HEIGHT_2
// 各 HTML はそのネットワークのタグ。<script> を含むものは同一オリジンの iframe で実行。
// 未設定の枠は何も表示しない（null）。
import { ScriptAdFrame } from '@/components/ads/ScriptAdFrame';

function getConfig(slot: 1 | 2) {
  if (slot === 2) {
    return {
      html: process.env.NEXT_PUBLIC_AD_HTML_2,
      width: Number(process.env.NEXT_PUBLIC_AD_WIDTH_2) || 300,
      height: Number(process.env.NEXT_PUBLIC_AD_HEIGHT_2) || 250,
    };
  }
  return {
    html: process.env.NEXT_PUBLIC_AD_HTML,
    width: Number(process.env.NEXT_PUBLIC_AD_WIDTH) || 300,
    height: Number(process.env.NEXT_PUBLIC_AD_HEIGHT) || 250,
  };
}

export function AdSlot({ slot = 1 }: { slot?: 1 | 2 }) {
  const { html, width, height } = getConfig(slot);

  // 未設定の枠は表示しない
  if (!html) return null;

  const hasScript = /<script/i.test(html);

  // 画像バナー（スクリプトなし）は直接表示。クリックは新規タブで開く。
  if (!hasScript) {
    const safe = html.replace(/<a\s/i, '<a target="_blank" ');
    return (
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] tracking-widest text-muted/70">広告</span>
        <div
          className="[&_img]:mx-auto [&_img]:h-auto [&_img]:max-w-full"
          dangerouslySetInnerHTML={{ __html: safe }}
        />
      </div>
    );
  }

  // スクリプト型広告（忍者AdMax等）は同一オリジンのフレンドリーiframeで実行
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] tracking-widest text-muted/70">広告</span>
      <ScriptAdFrame html={html} width={width} height={height} />
    </div>
  );
}
