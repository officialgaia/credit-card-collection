import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/auth';

// フェーズ3でカードCRUD・画像アップロードを実装予定。
// ここでは管理者ゲートのみ用意する（一般ユーザー・未ログインは弾く）。
export default async function AdminPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/login');
  if (!profile.is_admin) redirect('/');

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">管理者ダッシュボード</h1>
      <p className="rounded-xl border border-border bg-surface/60 p-6 text-sm text-muted">
        カードの追加・編集・削除と画像アップロードはフェーズ3で実装します。
        現在は管理者としてログインできていることのみ確認できます。
      </p>
    </div>
  );
}
