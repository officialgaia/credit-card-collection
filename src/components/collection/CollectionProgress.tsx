import { formatYen } from '@/lib/cards/style';

// 収集率プログレス + 主要ステータスの集計表示。所有欲を煽る常設バー。
export function CollectionProgress({
  ownedCount,
  totalCount,
  totalAnnualFee,
  priorityPassCount,
}: {
  ownedCount: number;
  totalCount: number;
  totalAnnualFee: number;
  priorityPassCount: number;
}) {
  const pct = totalCount === 0 ? 0 : Math.round((ownedCount / totalCount) * 100);

  return (
    <section className="rounded-2xl border border-border bg-surface/70 p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">収集率</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">
            {ownedCount}
            <span className="text-muted"> / {totalCount}</span>
            <span className="ml-3 text-accent">{pct}%</span>
          </p>
        </div>
        <div className="flex gap-6 text-right">
          <div>
            <p className="text-xs text-muted">所有合計年会費</p>
            <p className="text-lg font-semibold tabular-nums">{formatYen(totalAnnualFee)}</p>
          </div>
          <div>
            <p className="text-xs text-muted">プライオリティパス</p>
            <p className="text-lg font-semibold tabular-nums">{priorityPassCount} 枚</p>
          </div>
        </div>
      </div>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent/70 to-accent-soft transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </section>
  );
}
