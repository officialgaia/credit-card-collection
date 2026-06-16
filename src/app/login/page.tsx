import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { AuthForm } from './AuthForm';

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect('/');

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
      <AuthForm />
    </div>
  );
}
