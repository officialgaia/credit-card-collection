'use client';

import { useState } from 'react';
import Link from 'next/link';

type SimCard = {
  id: string;
  slug: string;
  name: string;
  issuer: string;
  tier: string;
  annual_fee: number;
  base_reward_rate: number | null;
};

const PRESETS = [30000, 50000, 100000, 200000];
const yen = (n: number) => `${Math.round(n).toLocaleString('ja-JP')}円`;

export function SimulatorClient({ cards }: { cards: SimCard[] }) {
  const [monthly, setMonthly] = useState(50000);
  const [considerFee, setConsiderFee] = useState(true);

  const annualSpend = monthly * 12;
  const results = cards
    .map((c) => {
      const rate = c.base_reward_rate ?? 0;
      const reward = annualSpend * (rate / 100);
      const net = reward - c.annual_fee;
      return { ...c, rate, reward, net };
    })
    .sort((a, b) => (considerFee ? b.net - a.net : b.reward - a.reward))
    .slice(0, 20);

  return (
    <div className="space-y-6">
      {/* 入力 */}
      <section className="space-y-4 rounded-2xl border border-border bg-surface/60 p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted">毎月のカード利用額</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums">
              {yen(monthly)}
              <span className="ml-2 text-sm text-muted">／月（年間 {yen(annualSpend)}）</span>
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

        <input
          type="range"
          min={0}
          max={300000}
          step={5000}
          value={monthly}
          onChange={(e) => setMonthly(Number(e.target.value))}
          className="w-full accent-[var(--accent)]"
        />

        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setMonthly(p)}
              className={`rounded-full border px-3 py-1 text-sm transition ${
                monthly === p
                  ? 'border-accent bg-accent text-black'
                  : 'border-border bg-surface-2 text-muted hover:text-foreground'
              }`}
            >
              {yen(p)}
            </button>
          ))}
        </div>
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
                  {c.issuer} · 還元率 {c.rate}% · 年会費 {yen(c.annual_fee)}
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
        ※ 基本還元率（1ポイント＝1円換算）での概算です。特約店での上乗せ還元やボーナス、年会費が利用額で無料になる条件などは含みません。実際の還元は各カードの公式情報をご確認ください。
      </p>
    </div>
  );
}
