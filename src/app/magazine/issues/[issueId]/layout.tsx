import { RequireAuth } from "@/components/magazine/RequireAuth";
import { IssueProvider } from "@/lib/magazine/issue-context";
import { IssueNav } from "@/components/magazine/IssueNav";

export default async function IssueLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ issueId: string }>;
}) {
  const { issueId } = await params;

  return (
    <RequireAuth>
      <IssueProvider issueId={issueId}>
        <IssueNav issueId={issueId} />
        {children}
      </IssueProvider>
    </RequireAuth>
  );
}
