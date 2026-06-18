import { ForgotForm } from './ForgotForm';

export const metadata = { title: 'パスワード再設定 — Card Collection', robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-8 py-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">パスワードの再設定</h1>
        <p className="mt-2 text-sm text-muted">
          登録メールアドレスに、再設定用のリンクをお送りします。
        </p>
      </div>
      <ForgotForm />
    </div>
  );
}
