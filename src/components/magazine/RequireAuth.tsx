"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMagazineAuth } from "@/lib/magazine/auth-context";

export function RequireAuth({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  const { user, loading, isAdmin } = useMagazineAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/magazine/login");
      return;
    }
    if (requireAdmin && !isAdmin) {
      router.replace("/magazine");
    }
  }, [loading, user, isAdmin, requireAdmin, router]);

  if (loading || !user || (requireAdmin && !isAdmin)) {
    return (
      <div className="mag-container py-16">
        <p className="mag-muted text-sm">読み込み中…</p>
      </div>
    );
  }

  return <>{children}</>;
}
