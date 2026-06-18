// 表示広告枠（無料/未ログインユーザーにのみ表示する想定。呼び出し側で制御）。
//   NEXT_PUBLIC_AD_HTML   = 広告タグのHTML（A8.netバナー / 忍者AdMax 等）
//   NEXT_PUBLIC_AD_WIDTH  = スクリプト型広告のiframe幅px（任意・既定 300）
//   NEXT_PUBLIC_AD_HEIGHT = スクリプト型広告のiframe高さpx（任意・既定 250）
const AD_HTML = process.env.NEXT_PUBLIC_AD_HTML;
const AD_WIDTH = Number(process.env.NEXT_PUBLIC_AD_WIDTH) || 300;
const AD_HEIGHT = Number(process.env.NEXT_PUBLIC_AD_HEIGHT) || 250;

export function AdSlot({ label = '広告' }: { label?: string }) {
  // 未設定時はプレースホルダー
  if (!AD_HTML) {
    return (
      <div className="flex min-h-[90px] w-full items-center justify-center rounded-xl border border-dashed border-border bg-surface/40 text-xs text-muted">
        <div className="text-center">
          <p className="tracking-widest">{label}</p>
          <p className="mt-1 text-[10px] text-muted/70">広告スペース</p>
        </div>
      </div>
    );
  }

  const hasScript = /<script/i.test(AD_HTML);

  // 画像バナー（スクリプトなし）は直接表示。
  // クリックは新規タブで開くよう <a> に target を付与。画像は自然サイズで全体表示。
  if (!hasScript) {
    const html = AD_HTML.replace(/<a\s/i, '<a target="_blank" ');
    return (
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] tracking-widest text-muted/70">広告</span>
        <div
          className="[&_img]:mx-auto [&_img]:h-auto [&_img]:max-w-full"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    );
  }

  // スクリプト型広告は iframe 内（独立ドキュメント）で安全に実行
  const srcDoc = `<!doctype html><html><head><meta charset="utf-8"><base target="_blank"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;padding:0;height:100%;display:flex;align-items:center;justify-content:center;background:transparent;overflow:hidden}img{max-width:100%;height:auto}</style></head><body>${AD_HTML}</body></html>`;

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] tracking-widest text-muted/70">広告</span>
      <iframe
        title="広告"
        srcDoc={srcDoc}
        loading="lazy"
        scrolling="no"
        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
        style={{ width: AD_WIDTH, maxWidth: '100%', height: AD_HEIGHT, border: 0, display: 'block' }}
        className="rounded-xl"
      />
    </div>
  );
}
