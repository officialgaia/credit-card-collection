"use client";

import Link from "next/link";
import { useMagazineAuth } from "@/lib/magazine/auth-context";

export function MagazineHeader() {
  const { user, isAdmin, signOut } = useMagazineAuth();

  return (
    <header className="mag-header">
      <div className="mag-header-inner">
        <Link href="/magazine" className="mag-title">
          サークル機関誌
        </Link>
        {user && (
          <nav className="mag-nav items-center">
            <Link href="/magazine">年度一覧</Link>
            {isAdmin && <Link href="/magazine/admin">管理</Link>}
            <span className="mag-muted">{user.displayName ?? user.email}</span>
            <button
              type="button"
              onClick={() => void signOut()}
              className="mag-nav-signout"
              style={{
                color: "var(--mag-muted)",
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                fontSize: "0.85rem",
                textDecoration: "underline",
                textUnderlineOffset: "2px",
              }}
            >
              ログアウト
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
