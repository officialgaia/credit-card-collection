import { ResetForm } from './ResetForm';

export const metadata = { title: '新しいパスワードの設定 — Card Collection' };

export default function ResetPasswordPage() {
  return (
    <div className="space-y-8 py-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">新しいパスワードの設定</h1>
        <p className="mt-2 text-sm text-muted">
          新しいパスワードを入力してください。
        </p>
      </div>
      <ResetForm />
    </div>
  );
}
