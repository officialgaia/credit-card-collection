'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { requestPasswordReset } from '@/app/auth/actions';

type State = { error: string | null; message?: string } | null;

export function ForgotForm() {
  const [state, formAction, pending] = useActionState<State, FormData>(
    requestPasswordReset as (prev: State, fd: FormData) => Promise<State>,
    null
  );

  return (
    <form action={formAction} className="mx-auto max-w-sm space-y-4">
      <div className="space-y-1">
        <label className="text-xs text-muted" htmlFor="email">
          登録済みのメールアドレス
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state?.message && <p className="text-sm text-accent">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-accent py-2 text-sm font-semibold text-black transition hover:bg-accent-soft disabled:opacity-60"
      >
        {pending ? '送信中…' : '再設定メールを送る'}
      </button>

      <p className="text-center text-xs text-muted">
        <Link href="/login" className="underline-offset-2 hover:text-foreground hover:underline">
          ログインに戻る
        </Link>
      </p>
    </form>
  );
}
