'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { validatePassword, PASSWORD_HINT } from '@/lib/validation';

export function ResetForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const pwError = validatePassword(password);
    if (pwError) return setError(pwError);
    if (password !== confirm) return setError('確認用パスワードが一致しません。');

    setPending(true);
    const supabase = createClient();
    const { error: upErr } = await supabase.auth.updateUser({ password });
    setPending(false);

    if (upErr) {
      setError(
        'パスワードを更新できませんでした。リンクの有効期限が切れている可能性があります。お手数ですが再度お試しください。'
      );
      return;
    }
    setDone(true);
    setTimeout(() => router.push('/'), 1500);
  }

  if (done) {
    return (
      <p className="mx-auto max-w-sm text-center text-sm text-accent">
        パスワードを更新しました。トップページへ移動します…
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-sm space-y-4">
      <div className="space-y-1">
        <label className="text-xs text-muted" htmlFor="password">
          新しいパスワード
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <p className="text-[11px] text-muted">{PASSWORD_HINT}</p>
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted" htmlFor="confirm">
          新しいパスワード（確認）
        </label>
        <input
          id="confirm"
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-accent py-2 text-sm font-semibold text-black transition hover:bg-accent-soft disabled:opacity-60"
      >
        {pending ? '更新中…' : 'パスワードを更新'}
      </button>
    </form>
  );
}
