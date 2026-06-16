'use client';

import { useActionState } from 'react';
import { submitContact, type ContactState } from './actions';

const CATEGORIES = ['カードの内容について', '不具合の報告', 'ご要望', 'その他'];

const input =
  'w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent';

export function ContactForm() {
  const [state, formAction, pending] = useActionState<ContactState, FormData>(
    submitContact,
    null
  );

  if (state?.message) {
    return (
      <div className="rounded-xl border border-accent/40 bg-accent/10 p-6 text-center text-sm text-accent">
        {state.message}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-xs text-muted">お名前（任意）</span>
          <input name="name" className={input} />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-muted">返信用メールアドレス（任意）</span>
          <input name="email" type="email" className={input} />
        </label>
      </div>
      <label className="block space-y-1">
        <span className="text-xs text-muted">種別</span>
        <select name="category" defaultValue={CATEGORIES[0]} className={input}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-1">
        <span className="text-xs text-muted">
          お問い合わせ内容 <span className="text-accent">*</span>
        </span>
        <textarea name="message" required rows={6} className={input} />
      </label>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-accent px-5 py-2 text-sm font-semibold text-black transition hover:bg-accent-soft disabled:opacity-60"
      >
        {pending ? '送信中…' : '送信する'}
      </button>
    </form>
  );
}
