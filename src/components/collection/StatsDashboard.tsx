import type { CollectionStats } from '@/lib/cards/stats';
import { BRAND_LABELS } from '@/lib/types';
import { formatYen, formatRate } from '@/lib/cards/style';

export function StatsDashboard({ stats }: { stats: CollectionStats }) {
  return (
    <div className="space-y-6">
      {/* 収集率ヒーロー */}
      <section className="relative overflow-hidden rounded-2xl border border-accent/30 bg-surface p-6">
        <div className="collection-shine pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted">Collection Rate</p>
            <p className="mt-1 text-5xl font-semibold tabular-nums">
              {stats.pct}
              <span className="text-2xl text-accent">%</span>
            </p>
            <p className="mt-1 text-sm text-muted">
              {stats.ownedCount} / {stats.total} 枚を所有
              {stats.topTier && (
                <span className="ml-2 text-accent">最高ランク: {stats.topTier}</span>
              )}
            </p>
          </div>
        </div>
        <div className="relative mt-4 h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent/70 to-accent-soft transition-all"
            style={{ width: `${stats.pct}%` }}
          />
        </div>
      </section>

      {/* 統計カード群 */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Stat label="所有枚数" value={`${stats.ownedCount} 枚`} />
        <Stat label="合計年会費" value={formatYen(stats.totalAnnualFee)} />
        <Stat label="平均還元率" value={formatRate(stats.avgRewardRate)} />
        <Stat label="プライオリティパス" value={`${stats.priorityPassCount} 枚`} />
        <Stat label="空港ラウンジ" value={`${stats.loungeCount} 枚`} />
        <Stat label="欲しいリスト" value={`${stats.wantCount} 枚`} />
        {stats.lockedCount > 0 && <Stat label="🔒 ロック中" value={`${stats.lockedCount} 枚`} />}
      </section>

      {/* ランク別収集状況 */}
      <section className="rounded-2xl border border-border bg-surface/60 p-5">
        <h2 className="mb-4 text-sm font-semibold text-accent">ランク別の収集状況</h2>
        <div className="space-y-3">
          {stats.byTier.map((t) => {
            const p = t.total === 0 ? 0 : Math.round((t.owned / t.total) * 100);
            return (
              <div key={t.tier} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{t.tier}</span>
                  <span className="tabular-nums text-muted">
                    {t.owned} / {t.total}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent/60 to-accent-soft"
                    style={{ width: `${p}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {stats.byBrand.length > 0 && (
          <div className="mt-5 border-t border-border pt-4">
            <p className="mb-2 text-xs text-muted">ブランド別保有</p>
            <div className="flex flex-wrap gap-2">
              {stats.byBrand.map((b) => (
                <span
                  key={b.brand}
                  className="rounded-full border border-border bg-surface-2 px-3 py-1 text-sm"
                >
                  {BRAND_LABELS[b.brand]} <span className="text-accent">{b.count}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 実績バッジ（未達成は沈ませて所有欲を刺激） */}
      <section className="rounded-2xl border border-border bg-surface/60 p-5">
        <h2 className="mb-4 text-sm font-semibold text-accent">実績</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {stats.achievements.map((a) => (
            <div
              key={a.id}
              className={`rounded-xl border p-3 transition ${
                a.unlocked
                  ? 'border-accent/40 bg-accent/5'
                  : 'border-border bg-surface-2/40 opacity-45 grayscale'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={a.unlocked ? 'text-accent' : 'text-muted'}>
                  {a.unlocked ? '★' : '☆'}
                </span>
                <p className="text-sm font-semibold">{a.label}</p>
              </div>
              <p className="mt-1 text-xs text-muted">{a.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface/60 p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}
