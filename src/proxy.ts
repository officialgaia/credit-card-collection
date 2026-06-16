import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Next.js 16 以降、旧 middleware は proxy にリネームされた（機能は同一）。
// 全リクエストで Supabase セッション Cookie を更新する。
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // _next や静的アセット・画像以外の全パスでセッションを更新
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
