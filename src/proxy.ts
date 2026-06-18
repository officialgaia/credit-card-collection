import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Next.js 16 以降、旧 middleware は proxy にリネームされた（機能は同一）。
// 全リクエストで Supabase セッション Cookie を更新する。
// 併せて、管理画面(/admin)にはベーシック認証を課す（カード決済のセキュリティ要件）。
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const user = process.env.ADMIN_BASIC_USER;
    const pass = process.env.ADMIN_BASIC_PASS;
    // 環境変数が設定されている場合のみベーシック認証を有効化
    if (user && pass) {
      const auth = request.headers.get('authorization');
      const expected = 'Basic ' + btoa(`${user}:${pass}`);
      if (auth !== expected) {
        return new NextResponse('Authentication required', {
          status: 401,
          headers: { 'WWW-Authenticate': 'Basic realm="Admin", charset="UTF-8"' },
        });
      }
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    // _next や静的アセット・画像以外の全パスでセッションを更新
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
