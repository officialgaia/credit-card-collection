'use client';

import { useState } from 'react';

// SNSシェアボタン（X / LINE / リンクコピー）。
// url は指定が無ければ現在のページURLを使う。
export function ShareButtons({ title, url }: { title: string; url?: string }) {
  const [copied, setCopied] = useState(false);

  function currentUrl() {
    if (url) return url;
    if (typeof window !== 'undefined') return window.location.href;
    return '';
  }

  function shareX() {
    const u = currentUrl();
    const link = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(u)}`;
    window.open(link, '_blank', 'noopener,noreferrer');
  }

  function shareLine() {
    const u = currentUrl();
    const link = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(u)}`;
    window.open(link, '_blank', 'noopener,noreferrer');
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(currentUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // クリップボード不可環境は無視
    }
  }

  const btn =
    'inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-2 px-3 py-1.5 text-xs font-medium text-muted transition hover:text-foreground';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted">シェア</span>
      <button type="button" onClick={shareX} className={btn} aria-label="Xでシェア">
        <span className="font-bold text-foreground">X</span> でシェア
      </button>
      <button type="button" onClick={shareLine} className={btn} aria-label="LINEでシェア">
        LINE
      </button>
      <button type="button" onClick={copyLink} className={btn} aria-label="リンクをコピー">
        {copied ? '✓ コピー済' : 'リンクをコピー'}
      </button>
    </div>
  );
}
