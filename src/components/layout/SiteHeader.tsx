import Link from 'next/link';
import { getCurrentProfile } from '@/lib/auth';
import { signout } from '@/app/auth/actions';
import { isPro } from '@/lib/billing';

export async function SiteHeader() {
  const profile = await getCurrentProfile();
  const pro = isPro(profile);

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
            <>
              <Link
                href="/wallet"
                className="rounded-md px-3 py-1.5 text-muted transition hover:text-foreground"
              >
                財布
              </Link>
              <Link
                href="/collection"
                className="rounded-md px-3 py-1.5 text-muted transition hover:text-foreground"
              >
                コレクション
              </Link>
            </>
          )}
          {profile && !pro && (
            <Link
              href="/pricing"
              className="rounded-md border border-accent/50 px-3 py-1.5 text-accent transition hover:bg-accent/10"
            >
              PROにする
            </Link>
          )}
          {pro && !profile?.is_admin && (
            <span className="rounded-md px-2 py-1.5 text-xs font-semibold text-accent">PRO</span>
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
