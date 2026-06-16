'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { validatePassword } from '@/lib/validation';

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}

export async function login(_prevState: unknown, formData: FormData) {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: 'メールアドレスまたはパスワードが正しくありません。' };
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signup(_prevState: unknown, formData: FormData) {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const displayName = String(formData.get('display_name') ?? '');

  const pwError = validatePassword(password);
  if (pwError) {
    return { error: pwError };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName || undefined },
      emailRedirectTo: `${siteUrl()}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // メール確認が有効な環境ではセッションが張られない
  if (!data.session) {
    return {
      error: null,
      message: '確認メールを送信しました。メール内のリンクから登録を完了してください。',
    };
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

// パスワード再設定メールを送る。メール存在の有無は返さない（列挙攻撃対策）。
export async function requestPasswordReset(_prevState: unknown, formData: FormData) {
  const email = String(formData.get('email') ?? '');
  if (!email) return { error: 'メールアドレスを入力してください。' };

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl()}/auth/callback?next=/reset-password`,
  });

  return {
    error: null,
    message:
      'パスワード再設定用のメールを送信しました（ご登録がある場合）。メール内のリンクから手続きを続けてください。',
  };
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}
