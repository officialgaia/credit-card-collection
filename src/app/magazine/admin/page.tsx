"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { RequireAuth } from "@/components/magazine/RequireAuth";
import { createIssue, listIssues, updateIssueStatus } from "@/lib/magazine/data";
import type { Issue, IssueStatus } from "@/lib/magazine/types";

const STATUSES: IssueStatus[] = ["受付中", "編集中", "公開"];

function AdminOverviewInner() {
  const [issues, setIssues] = useState<Issue[] | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function refresh() {
    listIssues().then(setIssues).catch(() => setError("号の一覧を取得できませんでした。"));
  }
  useEffect(refresh, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!title) return;
    setSubmitting(true);
    setError(null);
    try {
      await createIssue({ year, title, status: "受付中" });
      setTitle("");
      refresh();
    } catch {
      setError("号の作成に失敗しました。");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(issue: Issue, status: IssueStatus) {
    try {
      await updateIssueStatus(issue.id, status);
      refresh();
    } catch {
      setError("状態の更新に失敗しました。");
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: "1.4rem", marginBottom: "1.5rem" }}>管理者画面</h1>
      {error && <p style={{ color: "#8a3a2f", fontSize: "0.9rem" }}>{error}</p>}

      <section className="mag-card" style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>新年度号の作成</h2>
        <form onSubmit={handleCreate} style={{ display: "flex", gap: "0.6rem", alignItems: "flex-end", flexWrap: "wrap" }}>
          <div>
            <label className="mag-label" htmlFor="mag-issue-year">年</label>
            <input
              id="mag-issue-year"
              className="mag-input"
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              style={{ width: "7rem" }}
            />
          </div>
          <div>
            <label className="mag-label" htmlFor="mag-issue-title">タイトル</label>
            <input
              id="mag-issue-title"
              className="mag-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <button type="submit" className="mag-button" disabled={!title || submitting}>
            {submitting ? "作成中…" : "作成"}
          </button>
        </form>
      </section>

      <section>
        <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>既存の号</h2>
        <ul style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {issues?.map((issue) => (
            <li
              key={issue.id}
              className="mag-card"
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}
            >
              <Link href={`/magazine/issues/${issue.id}/admin`} style={{ color: "inherit", textDecoration: "none" }}>
                <span style={{ fontFamily: "var(--font-mag-serif)" }}>{issue.year}年号</span>
                <span className="mag-muted" style={{ marginLeft: "0.6rem", fontSize: "0.9rem" }}>{issue.title}</span>
              </Link>
              <select
                className="mag-input"
                style={{ width: "auto" }}
                value={issue.status}
                onChange={(e) => handleStatusChange(issue, e.target.value as IssueStatus)}
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default function MagazineAdminOverviewPage() {
  return (
    <RequireAuth requireAdmin>
      <AdminOverviewInner />
    </RequireAuth>
  );
}
