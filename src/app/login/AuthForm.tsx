'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { login, signup } from '@/app/auth/actions';
import { createClient } from '@/lib/supabase/client';
import { PASSWORD_HINT } from '@/lib/validation';

type Mode = 'login' | 'signup';
type State = { error: string | null; message?: string } | null;

const initialState: State = null;

export function AuthForm() {
  const [mode, setMode] = useState<Mode>('login');
  const [oauthError, setOauthError] = useState<string | null>(null);
  const action = mode === 'login' ? login : signup;
  const [state, formAction, pending] = useActionState<State, FormData>(
    action as (prev: State, fd: FormData) => Promise<State>,
    initialState
  );

  async function signInWithGoogle() {
    setOauthError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback?next=/` },
    });
    if (error) setOauthError('Googleログインを開始できませんでした。設定を確認してください。');
  }

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

      {/* Google でログイン / 登録 */}
      <button
        type="button"
        onClick={signInWithGoogle}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-surface-2 py-2 text-sm font-medium transition hover:text-accent-soft"
      >
        <GoogleIcon />
        Google で続ける
      </button>
      {oauthError && <p className="text-sm text-red-400">{oauthError}</p>}

      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-border" />
        またはメールアドレスで
        <span className="h-px flex-1 bg-border" />
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
            minLength={8}
            pattern={mode === 'signup' ? '(?=.*[A-Za-z])(?=.*\\d).{8,}' : undefined}
            title={mode === 'signup' ? PASSWORD_HINT : undefined}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
          />
          {mode === 'signup' && <p className="text-[11px] text-muted">{PASSWORD_HINT}</p>}
          {mode === 'login' && (
            <div className="pt-0.5 text-right">
              <Link
                href="/forgot-password"
                className="text-xs text-muted underline-offset-2 transition hover:text-foreground hover:underline"
              >
                パスワードをお忘れですか？
              </Link>
            </div>
          )}
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

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22 22-9.8 22-22c0-1.2-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 4.1 29.6 2 24 2 16.3 2 9.7 6.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 46c5.5 0 10.4-2.1 14.1-5.5l-6.5-5.5C29.6 36.9 26.9 38 24 38c-5.2 0-9.6-3.3-11.2-8l-6.6 5.1C9.6 41.6 16.2 46 24 46z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.5 5.5C40.9 36.3 46 31 46 24c0-1.2-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}
