import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// サーバーコンポーネント / Route Handler / Server Action 用 Supabase クライアント
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component から呼ばれた場合は set 不可。
            // middleware 側でセッション更新するため無視してよい。
          }
        },
      },
    }
  );
}
