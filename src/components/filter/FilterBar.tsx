'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { BRANDS, BRAND_LABELS, TIERS } from '@/lib/types';
import {
  FEATURES,
  FEATURE_LABELS,
  SORT_OPTIONS,
  DEFAULT_SORT,
  FEE_MAX,
  RATE_MAX,
} from '@/lib/cards/filter';
import { formatYen } from '@/lib/cards/style';

export function FilterBar({
  allIssuers,
  showOwnership,
  resultCount,
}: {
  allIssuers: string[];
  showOwnership: boolean;
  resultCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  // 現在のURLからパラメータを反映してURLを置き換える
  const apply = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '') next.delete(key);
        else next.set(key, value);
      }
      const qs = next.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [params, pathname, router]
  );

  // カンマ区切りリスト型パラメータの値をトグル
  const toggleInList = useCallback(
    (key: string, value: string) => {
      const current = (params.get(key) ?? '').split(',').filter(Boolean);
      const nextList = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      apply({ [key]: nextList.length ? nextList.join(',') : null });
    },
    [params, apply]
  );

  const inList = (key: string, value: string) =>
    (params.get(key) ?? '').split(',').filter(Boolean).includes(value);

  const get = (key: string) => params.get(key);

  // ---- スライダー（ローカル状態 + デバウンス） ----
  const freeOnly = get('free') === '1';
  const feeParam = Number(get('feeMax') ?? FEE_MAX);
  const rateParam = Number(get('rateMin') ?? 0);
  const [feeMax, setFeeMax] = useState<number>(feeParam);
  const [rateMin, setRateMin] = useState<number>(rateParam);

  // URL が外部要因（クリア等）で変わったらスライダー表示を同期する。
  // effect ではなくレンダー中に前回値と比較して調整する（React推奨パターン）。
  const [prevFeeParam, setPrevFeeParam] = useState(feeParam);
  if (feeParam !== prevFeeParam) {
    setPrevFeeParam(feeParam);
    setFeeMax(feeParam);
  }
  const [prevRateParam, setPrevRateParam] = useState(rateParam);
  if (rateParam !== prevRateParam) {
    setPrevRateParam(rateParam);
    setRateMin(rateParam);
  }

  // 年会費スライダーのデバウンス反映
  useEffect(() => {
    const cur = params.get('feeMax');
    const target = feeMax >= FEE_MAX ? null : String(feeMax);
    if ((cur ?? null) === target) return;
    const t = setTimeout(() => apply({ feeMax: target }), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feeMax]);

  // 還元率スライダーのデバウンス反映
  useEffect(() => {
    const cur = params.get('rateMin');
    const target = rateMin <= 0 ? null : String(rateMin);
    if ((cur ?? null) === target) return;
    const t = setTimeout(() => apply({ rateMin: target }), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rateMin]);

  const clearAll = () => {
    const sort = get('sort');
    startTransition(() => {
      router.replace(sort ? `${pathname}?sort=${sort}` : pathname, { scroll: false });
    });
  };

  const sort = get('sort') ?? DEFAULT_SORT;
  const pp = get('pp');
  const own = get('own');

  return (
    <section className="rounded-2xl border border-border bg-surface/60">
      {/* ヘッダー行: 結果数・並び替え・フィルタ開閉 */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="rounded-md border border-border bg-surface-2 px-3 py-1.5 text-sm font-medium transition hover:text-accent-soft"
            aria-expanded={open}
          >
            フィルタ {open ? '▲' : '▼'}
          </button>
          <span className="text-sm text-muted">{resultCount} 枚</span>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">並び替え</span>
          <select
            value={sort}
            onChange={(e) => apply({ sort: e.target.value === DEFAULT_SORT ? null : e.target.value })}
            className="rounded-md border border-border bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-accent"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {open && (
        <div className="space-y-5 border-t border-border p-4">
          {/* ブランド */}
          <FilterGroup title="国際ブランド">
            {BRANDS.map((b) => (
              <Chip key={b} active={inList('brand', b)} onClick={() => toggleInList('brand', b)}>
                {BRAND_LABELS[b]}
              </Chip>
            ))}
          </FilterGroup>

          {/* ランク */}
          <FilterGroup title="ランク">
            {TIERS.map((t) => (
              <Chip key={t} active={inList('tier', t)} onClick={() => toggleInList('tier', t)}>
                {t}
              </Chip>
            ))}
          </FilterGroup>

          {/* 発行会社 */}
          <FilterGroup title="発行会社">
            {allIssuers.map((iss) => (
              <Chip key={iss} active={inList('issuer', iss)} onClick={() => toggleInList('issuer', iss)}>
                {iss}
              </Chip>
            ))}
          </FilterGroup>

          {/* 年会費 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">年会費</p>
              <label className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={freeOnly}
                  onChange={(e) => apply({ free: e.target.checked ? '1' : null, feeMax: null })}
                  className="accent-[var(--accent)]"
                />
                無料のみ
              </label>
            </div>
            <div className={freeOnly ? 'pointer-events-none opacity-40' : ''}>
              <input
                type="range"
                min={0}
                max={FEE_MAX}
                step={1000}
                value={feeMax}
                onChange={(e) => setFeeMax(Number(e.target.value))}
                className="w-full accent-[var(--accent)]"
              />
              <p className="text-sm text-muted">
                {feeMax >= FEE_MAX ? '上限なし' : `${formatYen(feeMax)} 以下`}
              </p>
            </div>
          </div>

          {/* 還元率 */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">還元率</p>
            <input
              type="range"
              min={0}
              max={RATE_MAX}
              step={0.1}
              value={rateMin}
              onChange={(e) => setRateMin(Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
            <p className="text-sm text-muted">
              {rateMin <= 0 ? '指定なし' : `${rateMin.toFixed(1)}% 以上`}
            </p>
          </div>

          {/* プライオリティパス */}
          <FilterGroup title="プライオリティパス">
            <Chip active={pp === 'has'} onClick={() => apply({ pp: pp === 'has' ? null : 'has' })}>
              あり
            </Chip>
            <Chip
              active={pp === 'prestige'}
              onClick={() => apply({ pp: pp === 'prestige' ? null : 'prestige' })}
            >
              プレステージのみ
            </Chip>
          </FilterGroup>

          {/* 特典 */}
          <FilterGroup title="特典・付帯">
            {FEATURES.map((ft) => (
              <Chip key={ft} active={inList('feat', ft)} onClick={() => toggleInList('feat', ft)}>
                {FEATURE_LABELS[ft]}
              </Chip>
            ))}
          </FilterGroup>

          {/* 所有状態（ログイン時のみ） */}
          {showOwnership && (
            <FilterGroup title="所有状態">
              {([
                ['owned', '持っている'],
                ['none', '持っていない'],
                ['want', '欲しい'],
              ] as const).map(([val, label]) => (
                <Chip
                  key={val}
                  active={own === val}
                  onClick={() => apply({ own: own === val ? null : val })}
                >
                  {label}
                </Chip>
              ))}
            </FilterGroup>
          )}

          <div className="pt-1">
            <button
              type="button"
              onClick={clearAll}
              className="text-sm text-muted underline-offset-2 transition hover:text-foreground hover:underline"
            >
              フィルタをクリア
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1 text-sm transition ${
        active
          ? 'border-accent bg-accent text-black'
          : 'border-border bg-surface-2 text-muted hover:text-foreground'
      }`}
    >
      {children}
    </button>
  );
}
