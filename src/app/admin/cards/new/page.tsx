import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/auth';
import { createCard } from '@/app/admin/actions';
import { CardForm } from '@/components/admin/CardForm';

export default async function NewCardPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/login');
  if (!profile.is_admin) redirect('/');

  return (
    <div className="space-y-6">
      <Link href="/admin" className="text-sm text-muted transition hover:text-foreground">
        ← ダッシュボードへ戻る
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">カードを追加</h1>
      <p className="text-sm text-muted">
        保存後に編集画面へ移動し、カード画像をアップロードできます。
      </p>
      <CardForm action={createCard} submitLabel="作成する" />
    </div>
  );
}
