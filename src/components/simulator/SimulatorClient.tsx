'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CATEGORIES, effectiveRate, type CatKey } from '@/lib/simulator';

type SimCard = {
  id: string;
  slug: string;
  name: string;
  issuer: string;
  tier: string;
  annual_fee: number;
  base_reward_rate: number | null;
};

const yen = (n: number) => `${Math.round(n).toLocaleString('ja-JP')}円`;
const CAT_MAX = 500000;

export function SimulatorClient({ cards }: { cards: SimCard[] }) {
  const [spend, setSpend] = useState<Record<CatKey, number>>(() =>
    Object.fromEntries(CATEGORIES.map((c) => [c.key, c.def])) as Record<CatKey, number>
  );
  const [considerFee, setConsiderFee] = useState(true);

  const monthlyTotal = CATEGORIES.reduce((s, c) => s + spend[c.key], 0);
  const annualTotal = monthlyTotal * 12;

  const results = cards
    .map((c) => {
      const base = c.base_reward_rate ?? 0;
      const reward = CATEGORIES.reduce(
        (sum, cat) => sum + spend[cat.key] * 12 * (effectiveRate(c.slug, base, cat.key) / 100),
        0
      );
      const net = reward - c.annual_fee;
      const effRate = annualTotal > 0 ? (reward / annualTotal) * 100 : base;
      return { ...c, reward, net, effRate };
    })
    .sort((a, b) => (considerFee ? b.net - a.net : b.reward - a.reward))
    .slice(0, 20);

  return (
    <div className="space-y-6">
      {/* 入力 */}
      <section className="space-y-5 rounded-2xl border border-border bg-surface/60 p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted">毎月の利用額（合計）</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums">
              {yen(monthlyTotal)}
              <span className="ml-2 text-sm text-muted">／月（年間 {yen(annualTotal)}）</span>
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={considerFee}
              onChange={(e) => setConsiderFee(e.target.checked)}
              className="accent-[var(--accent)]"
            />
            年会費を差し引いて比較
          </label>
        </div>

        <div className="space-y-4">
          {CATEGORIES.map((cat) => (
            <div key={cat.key} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>{cat.label}</span>
                <span className="tabular-nums text-muted">{yen(spend[cat.key])}／月</span>
              </div>
              <input
                type="range"
                min={0}
                max={CAT_MAX}
                step={5000}
                value={spend[cat.key]}
                onChange={(e) => setSpend((s) => ({ ...s, [cat.key]: Number(e.target.value) }))}
                className="w-full accent-[var(--accent)]"
              />
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted">
          各カテゴリは月額0〜{yen(CAT_MAX)}まで設定できます。高額利用ほど高還元・上位カードが有利になります。
        </p>
      </section>

      {/* 結果 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          {considerFee ? '実質お得額' : '年間ポイント'}ランキング
        </h2>
        <ol className="space-y-2">
          {results.map((c, i) => (
            <li
              key={c.id}
              className="flex items-center gap-4 rounded-2xl border border-border bg-surface/60 p-4"
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  i === 0 ? 'bg-accent text-black' : 'bg-surface-2 text-accent'
                }`}
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <Link href={`/cards/${c.slug}`} className="font-semibold hover:text-accent-soft">
                  {c.name}
                </Link>
                <p className="text-xs text-muted">
                  {c.issuer} · {c.tier} · 実効還元 {c.effRate.toFixed(2)}% · 年会費 {yen(c.annual_fee)}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-lg font-semibold tabular-nums text-accent">
                  {considerFee ? yen(c.net) : yen(c.reward)}
                </p>
                <p className="text-[11px] text-muted">
                  {considerFee ? `ポイント ${yen(c.reward)}` : '／年'}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <p className="rounded-lg border border-border bg-surface/60 p-3 text-xs text-muted">
        ※ 1ポイント＝1円換算の概算です。コンビニ・飲食やネット通販の上乗せ還元は主要カードの代表的な条件をもとにした目安で、対象店・上限・付与条件により実際と異なります。年会費が利用額で無料になる条件等も含みません。正確な内容は各カードの公式情報をご確認ください。
      </p>
    </div>
  );
}
