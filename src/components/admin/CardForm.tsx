'use client';

import { useActionState } from 'react';
import type { Card } from '@/lib/types';
import { BRANDS, BRAND_LABELS, TIERS, PRIORITY_PASS, TRAVEL_INSURANCE } from '@/lib/types';
import type { FormState } from '@/app/admin/actions';

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

export function CardForm({
  action,
  card,
  submitLabel,
}: {
  action: Action;
  card?: Card;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, null);

  return (
    <form action={formAction} className="space-y-8">
      {/* 基本情報 */}
      <Section title="基本情報">
        <Field label="カード名" required>
          <input name="name" defaultValue={card?.name ?? ''} required className={input} />
        </Field>
        <Field label="スラッグ（URL用・空欄なら自動生成）">
          <input
            name="slug"
            defaultValue={card?.slug ?? ''}
            placeholder="例: rakuten-card"
            className={input}
          />
        </Field>
        <Field label="発行会社" required>
          <input name="issuer" defaultValue={card?.issuer ?? ''} required className={input} />
        </Field>
        <Field label="ランク">
          <select name="tier" defaultValue={card?.tier ?? '一般'} className={input}>
            {TIERS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field label="国際ブランド（複数選択可）">
          <div className="flex flex-wrap gap-3 pt-1">
            {BRANDS.map((b) => (
              <label key={b} className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  name="brands"
                  value={b}
                  defaultChecked={card?.brands.includes(b)}
                  className="accent-[var(--accent)]"
                />
                {BRAND_LABELS[b]}
              </label>
            ))}
          </div>
        </Field>
      </Section>

      {/* 費用・還元 */}
      <Section title="費用・還元">
        <Field label="年会費（円）">
          <input
            type="number"
            name="annual_fee"
            min={0}
            defaultValue={card?.annual_fee ?? 0}
            className={input}
          />
        </Field>
        <Field label="年会費の注記">
          <input name="annual_fee_note" defaultValue={card?.annual_fee_note ?? ''} className={input} />
        </Field>
        <Field label="家族カード年会費（円）">
          <input
            type="number"
            name="family_card_fee"
            defaultValue={card?.family_card_fee ?? ''}
            className={input}
          />
        </Field>
        <Field label="ETCカード年会費（円）">
          <input
            type="number"
            name="etc_card_fee"
            defaultValue={card?.etc_card_fee ?? ''}
            className={input}
          />
        </Field>
        <Field label="基本還元率（%）">
          <input
            type="number"
            step="0.01"
            name="base_reward_rate"
            defaultValue={card?.base_reward_rate ?? ''}
            className={input}
          />
        </Field>
        <Field label="還元の注記">
          <input name="reward_note" defaultValue={card?.reward_note ?? ''} className={input} />
        </Field>
        <Field label="ポイントプログラム">
          <input name="point_program" defaultValue={card?.point_program ?? ''} className={input} />
        </Field>
      </Section>

      {/* 特典・保険 */}
      <Section title="特典・保険">
        <Field label="プライオリティパス">
          <select name="priority_pass" defaultValue={card?.priority_pass ?? 'なし'} className={input}>
            {PRIORITY_PASS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Field>
        <Field label="プライオリティパスの注記">
          <input
            name="priority_pass_note"
            defaultValue={card?.priority_pass_note ?? ''}
            className={input}
          />
        </Field>
        <Field label="海外旅行保険">
          <select
            name="travel_insurance"
            defaultValue={card?.travel_insurance ?? 'なし'}
            className={input}
          >
            {TRAVEL_INSURANCE.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field label="海外旅行保険の補償額">
          <input
            name="travel_insurance_amount"
            defaultValue={card?.travel_insurance_amount ?? ''}
            className={input}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3 pt-1 sm:grid-cols-3">
          <Toggle name="airport_lounge" label="空港ラウンジ" checked={card?.airport_lounge} />
          <Toggle name="shopping_insurance" label="ショッピング保険" checked={card?.shopping_insurance} />
          <Toggle name="concierge" label="コンシェルジュ" checked={card?.concierge} />
          <Toggle name="touch_payment" label="タッチ決済" checked={card?.touch_payment} />
          <Toggle name="numberless" label="ナンバーレス" checked={card?.numberless} />
          <Toggle name="business" label="ビジネスカード" checked={card?.business} />
        </div>
      </Section>

      {/* その他 */}
      <Section title="その他">
        <Field label="申込条件">
          <textarea
            name="eligibility"
            defaultValue={card?.eligibility ?? ''}
            rows={2}
            className={input}
          />
        </Field>
        <Field label="公式サイトURL">
          <input
            type="url"
            name="official_url"
            defaultValue={card?.official_url ?? ''}
            placeholder="https://..."
            className={input}
          />
        </Field>
        <Field label="アフィリエイトURL（設定すると申込ボタンに「広告」表記で優先使用）">
          <input
            type="url"
            name="affiliate_url"
            defaultValue={card?.affiliate_url ?? ''}
            placeholder="https://（ASPの計測リンク）"
            className={input}
          />
        </Field>
      </Section>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-accent px-5 py-2 text-sm font-semibold text-black transition hover:bg-accent-soft disabled:opacity-60"
        >
          {pending ? '保存中…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

const input =
  'w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4 rounded-2xl border border-border bg-surface/50 p-5">
      <legend className="px-1 text-sm font-semibold text-accent">{title}</legend>
      {children}
    </fieldset>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs text-muted">
        {label}
        {required && <span className="ml-1 text-accent">*</span>}
      </span>
      {children}
    </label>
  );
}

function Toggle({ name, label, checked }: { name: string; label: string; checked?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" name={name} defaultChecked={checked} className="accent-[var(--accent)]" />
      {label}
    </label>
  );
}
