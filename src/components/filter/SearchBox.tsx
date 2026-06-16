'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type Suggestion = { name: string; slug: string; issuer: string };

// カード名の検索ボックス。入力に応じて候補（サジェスト）を表示し、
// 検索語は URL クエリ ?q= に反映してグリッドを絞り込む。
// 候補クリックでそのカードの詳細へ遷移する。
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
  // URL の q が外部要因で変わったら入力欄へ同期（レンダー中に前回値と比較）
  const [prevQ, setPrevQ] = useState(qParam);
  if (qParam !== prevQ) {
    setPrevQ(qParam);
    setValue(qParam);
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

  const term = value.trim().toLowerCase();
  const matches = term
    ? suggestions
        .filter(
          (s) =>
            s.name.toLowerCase().includes(term) || s.issuer.toLowerCase().includes(term)
        )
        .slice(0, 8)
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
    <div ref={boxRef} className="relative">
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
          🔍
        </span>
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
          className="w-full rounded-xl border border-border bg-surface-2 py-2.5 pl-9 pr-9 text-sm outline-none focus:border-accent"
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
        <ul className="absolute z-40 mt-1 max-h-80 w-full overflow-auto rounded-xl border border-border bg-surface shadow-xl">
          {matches.map((m, i) => (
            <li key={m.slug}>
              <button
                type="button"
                onMouseEnter={() => setHighlight(i)}
                onClick={() => go(m.slug)}
                className={`flex w-full items-baseline justify-between gap-3 px-3 py-2 text-left text-sm transition ${
                  i === highlight ? 'bg-surface-2 text-foreground' : 'text-muted hover:text-foreground'
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
