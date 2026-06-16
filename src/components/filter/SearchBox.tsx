'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cardMatchesQuery } from '@/lib/cards/search';

type Suggestion = { name: string; slug: string; issuer: string };

// カード名の検索ボックス。入力に応じて候補（サジェスト）を表示し、
// 検索語は URL クエリ ?q= に反映してグリッドを絞り込む。
// 「あ」と打つと "a" を含むカードも候補に出す（かな→ローマ字対応）。
export function SearchBox({
  suggestions,
  placeholder = 'カード名・発行会社で検索',
}: {
  suggestions: Suggestion[];
  placeholder?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const qParam = params.get('q') ?? '';
  const [value, setValue] = useState(qParam);

  // 自分でURLへ反映した値を覚えておき、その反映による q の変化では
  // 入力欄を上書きしない（入力中に文字が消える不具合を防ぐ）。
  const [committed, setCommitted] = useState(qParam);
  const [prevQ, setPrevQ] = useState(qParam);
  if (qParam !== prevQ) {
    setPrevQ(qParam);
    if (qParam !== committed) {
      // 戻る/進む等の外部要因による変化のときだけ同期する
      setCommitted(qParam);
      setValue(qParam);
    }
  }

  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  // 入力をデバウンスして ?q= を更新
  useEffect(() => {
    const cur = params.get('q') ?? '';
    const target = value.trim();
    if (cur === target) return;
    const t = setTimeout(() => {
      setCommitted(target);
      const next = new URLSearchParams(params.toString());
      if (target) next.set('q', target);
      else next.delete('q');
      const qs = next.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // 外側クリックで候補を閉じる
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const matches = value.trim()
    ? suggestions.filter((s) => cardMatchesQuery(s.name, s.issuer, value)).slice(0, 8)
    : [];

  function go(slug: string) {
    setOpen(false);
    router.push(`/cards/${slug}`);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open || matches.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => (h + 1) % matches.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => (h - 1 + matches.length) % matches.length);
    } else if (e.key === 'Enter') {
      const m = matches[highlight];
      if (m) {
        e.preventDefault();
        go(m.slug);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div ref={boxRef} className="relative z-30">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
            setHighlight(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="w-full rounded-xl border border-border bg-surface-2 py-2.5 pl-4 pr-9 text-sm outline-none focus:border-accent"
          aria-label="カード名で検索"
          autoComplete="off"
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              setValue('');
              setOpen(false);
            }}
            aria-label="検索をクリア"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-1.5 text-muted transition hover:text-foreground"
          >
            ✕
          </button>
        )}
      </div>

      {open && matches.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-80 w-full overflow-auto rounded-xl border border-border bg-surface shadow-xl">
          {matches.map((m, i) => (
            <li key={m.slug}>
              <button
                type="button"
                onMouseEnter={() => setHighlight(i)}
                onClick={() => go(m.slug)}
                className={`flex w-full items-baseline justify-between gap-3 px-3 py-2 text-left text-sm transition ${
                  i === highlight
                    ? 'bg-surface-2 text-foreground'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                <span className="truncate">{m.name}</span>
                <span className="shrink-0 text-xs text-muted">{m.issuer}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
