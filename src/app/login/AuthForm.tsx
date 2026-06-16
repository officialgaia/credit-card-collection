'use client';

import { useActionState, useState } from 'react';
import { login, signup } from '@/app/auth/actions';

type Mode = 'login' | 'signup';
type State = { error: string | null; message?: string } | null;

const initialState: State = null;

export function AuthForm() {
  const [mode, setMode] = useState<Mode>('login');
  const action = mode === 'login' ? login : signup;
  const [state, formAction, pending] = useActionState<State, FormData>(
    action as (prev: State, fd: FormData) => Promise<State>,
    initialState
  );

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <div className="flex rounded-lg border border-border bg-surface p-1 text-sm">
        {(['login', 'signup'] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`flex-1 rounded-md py-1.5 font-medium transition ${
              mode === m ? 'bg-accent text-black' : 'text-muted hover:text-foreground'
            }`}
          >
            {m === 'login' ? 'ログイン' : '新規登録'}
          </button>
        ))}
      </div>

      <form action={formAction} className="space-y-4">
        {mode === 'signup' && (
          <div className="space-y-1">
            <label className="text-xs text-muted" htmlFor="display_name">
              表示名（任意）
            </label>
            <input
              id="display_name"
              name="display_name"
              type="text"
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
        )}
        <div className="space-y-1">
          <label className="text-xs text-muted" htmlFor="email">
            メールアドレス
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
        <div className="space-y-1">
          <label className="text-xs text-muted" htmlFor="password">
            パスワード
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
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
          {pending ? '処理中…' : mode === 'login' ? 'ログイン' : '登録する'}
        </button>
      </form>
    </div>
  );
}
