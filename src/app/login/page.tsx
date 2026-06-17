import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { AuthForm } from './AuthForm';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect('/');

  const { error } = await searchParams;

  return (
    <div className="space-y-8 py-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Card<span className="text-accent">Collection</span> へようこそ
        </h1>
        <p className="mt-2 text-sm text-muted">
          ログインすると、所有カードのチェックとコレクション集計が使えます。
        </p>
      </div>

      {error && (
        <p className="mx-auto max-w-sm rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-center text-sm text-red-300">
          ログインに失敗しました: {error}
        </p>
      )}

      <AuthForm />
    </div>
  );
}
