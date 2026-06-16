import Link from 'next/link';
import { getCurrentProfile } from '@/lib/auth';
import { signout } from '@/app/auth/actions';

export async function SiteHeader() {
  const profile = await getCurrentProfile();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight">
            Card<span className="text-accent">Collection</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/"
            className="rounded-md px-3 py-1.5 text-muted transition hover:text-foreground"
          >
            一覧
          </Link>
          {profile && (
            <Link
              href="/collection"
              className="rounded-md px-3 py-1.5 text-muted transition hover:text-foreground"
            >
              マイコレクション
            </Link>
          )}
          {profile?.is_admin && (
            <Link
              href="/admin"
              className="rounded-md px-3 py-1.5 text-accent transition hover:text-accent-soft"
            >
              管理
            </Link>
          )}

          {profile ? (
            <form action={signout}>
              <button
                type="submit"
                className="ml-1 rounded-md border border-border px-3 py-1.5 text-muted transition hover:text-foreground"
              >
                ログアウト
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="ml-1 rounded-md bg-accent px-3 py-1.5 font-medium text-black transition hover:bg-accent-soft"
            >
              ログイン
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
