import Link from 'next/link';
import type { Metadata } from 'next';
import { ARTICLES } from '@/lib/articles';

export const metadata: Metadata = {
  title: 'コラム｜クレジットカードの選び方・お得情報',
  description:
    'クレジットカードの選び方、還元率の仕組み、2枚持ちのコツなど、カード選びに役立つコラムをまとめています。',
  alternates: { canonical: '/articles' },
};

export default function ArticlesPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">コラム</h1>
        <p className="text-sm text-muted">クレジットカード選びに役立つ知識・お得情報をまとめています。</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {ARTICLES.map((a) => (
          <Link
            key={a.slug}
            href={`/articles/${a.slug}`}
            className="rounded-2xl border border-border bg-surface/60 p-5 transition hover:border-accent/40 hover:bg-surface"
          >
            <h2 className="text-base font-semibold text-accent-soft">{a.title}</h2>
            <p className="mt-2 line-clamp-3 text-sm text-muted">{a.description}</p>
            <p className="mt-3 text-xs text-muted">{a.date}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
