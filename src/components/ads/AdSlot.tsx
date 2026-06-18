// 表示広告枠（無料/未ログインユーザーにのみ表示する想定。呼び出し側で制御）。
// 環境変数に広告タグHTMLがあれば、それを iframe 内で安全に表示する。
// どの広告ネットワークでも対応可能（A8.netバナー / 忍者AdMax / Adsterra 等）。
//   NEXT_PUBLIC_AD_HTML   = 広告タグのHTML（<a><img>… や <script>… をそのまま）
//   NEXT_PUBLIC_AD_HEIGHT = 高さpx（任意・既定 250）
const AD_HTML = process.env.NEXT_PUBLIC_AD_HTML;
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

  // 広告タグは iframe 内（独立ドキュメント）で実行し、サイト本体に干渉させない
  const srcDoc = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;padding:0;display:flex;align-items:center;justify-content:center;background:transparent;font-family:sans-serif}</style></head><body>${AD_HTML}</body></html>`;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface/40">
      <iframe
        title="広告"
        srcDoc={srcDoc}
        loading="lazy"
        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
        style={{ width: '100%', height: AD_HEIGHT, border: 0, display: 'block' }}
      />
    </div>
  );
}
