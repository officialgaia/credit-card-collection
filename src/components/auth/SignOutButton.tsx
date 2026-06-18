'use client';

import { useFormStatus } from 'react-dom';

export function SignOutButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="ml-1 rounded-md border border-border px-3 py-1.5 text-muted transition hover:text-foreground disabled:opacity-60"
    >
      {pending ? '…' : 'ログアウト'}
    </button>
  );
}
