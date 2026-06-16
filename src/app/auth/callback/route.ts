import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// OAuth（Google）やパスワード再設定メールのリンクから戻ってくる場所。
// URL の code をセッションに交換し、next で指定されたパスへ遷移する。
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
