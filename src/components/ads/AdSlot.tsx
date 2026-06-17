// 表示広告枠。無料/未ログインユーザーにのみ表示する想定（呼び出し側で制御）。
// 現状はプレースホルダー。AdSense等を導入する際はこの中身を差し替える。
export function AdSlot({ label = '広告' }: { label?: string }) {
  return (
    <div className="flex min-h-[90px] w-full items-center justify-center rounded-xl border border-dashed border-border bg-surface/40 text-xs text-muted">
      <div className="text-center">
        <p className="tracking-widest">{label}</p>
        <p className="mt-1 text-[10px] text-muted/70">広告スペース</p>
      </div>
    </div>
  );
}
