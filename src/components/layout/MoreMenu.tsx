'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

// サブコンテンツ（特集・試算・コラム）をまとめるドロップダウン。
export function MoreMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const item =
    'block rounded-md px-3 py-2 text-sm text-muted transition hover:bg-surface-2 hover:text-foreground';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="rounded-md px-3 py-1.5 text-sm text-muted transition hover:text-foreground"
      >
        もっと ▾
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1 w-36 rounded-xl border border-border bg-surface p-1 shadow-xl">
          <Link href="/guides" className={item} onClick={() => setOpen(false)}>
            特集
          </Link>
          <Link href="/simulator" className={item} onClick={() => setOpen(false)}>
            還元シミュレーター
          </Link>
          <Link href="/articles" className={item} onClick={() => setOpen(false)}>
            コラム
          </Link>
        </div>
      )}
    </div>
  );
}
