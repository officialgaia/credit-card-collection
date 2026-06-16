// 情報系ページ（FAQ・規約・ポリシー・問い合わせ）の共通体裁
export function InfoPage({
  title,
  lead,
  updatedAt,
  children,
}: {
  title: string;
  lead?: string;
  updatedAt?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {lead && <p className="text-sm text-muted">{lead}</p>}
        {updatedAt && <p className="text-xs text-muted">最終更新日: {updatedAt}</p>}
      </header>
      <div className="space-y-6 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

export function InfoSection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold text-accent">{heading}</h2>
      <div className="space-y-2 text-muted">{children}</div>
    </section>
  );
}
