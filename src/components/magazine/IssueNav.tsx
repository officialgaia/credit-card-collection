"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMagazineAuth } from "@/lib/magazine/auth-context";
import { useIssue } from "@/lib/magazine/issue-context";

export function IssueNav({ issueId }: { issueId: string }) {
  const { issue } = useIssue();
  const { isAdmin } = useMagazineAuth();
  const pathname = usePathname();
  const base = `/magazine/issues/${issueId}`;

  const tabs = [
    { href: base, label: "冊子ビューア" },
    { href: `${base}/submit`, label: "投稿" },
    { href: `${base}/roster`, label: "名簿" },
    ...(isAdmin ? [{ href: `${base}/admin`, label: "管理" }] : []),
  ];

  return (
    <div style={{ marginBottom: "1.75rem" }}>
      <p style={{ fontFamily: "var(--font-mag-serif)", fontSize: "1.2rem" }}>
        {issue ? `${issue.year}年号` : ""}
        {issue && (
          <span className="mag-muted" style={{ fontSize: "0.9rem", marginLeft: "0.6rem" }}>
            {issue.title}
          </span>
        )}
      </p>
      <nav className="mag-nav" style={{ marginTop: "0.6rem" }}>
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            data-active={pathname === tab.href}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
