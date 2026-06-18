import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types';

// 現在ログイン中のユーザー（未ログインなら null）。
// cache() で同一リクエスト内の重複呼び出しを1回にまとめる。
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

// 現在ユーザーのプロフィール（is_admin / is_subscribed 含む）。未ログインなら null。
export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (data as Profile) ?? null;
});
