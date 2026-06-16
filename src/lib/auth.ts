import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types';

// 現在ログイン中のユーザー（未ログインなら null）
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// 現在ユーザーのプロフィール（is_admin 含む）。未ログインなら null。
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (data as Profile) ?? null;
}
