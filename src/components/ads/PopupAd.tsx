'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdSlot } from '@/components/ads/AdSlot';

const HAS_AD = !!process.env.NEXT_PUBLIC_AD_HTML;
// 表示確率（毎回ではなくランダムに。0〜1）
const PROBABILITY = 0.5;

// ランダムに1回だけ表示するポップアップ広告（無料/未ログインのみ・呼び出し側で制御）。
// しつこさ回避のため「1セッションにつき最大1回」かつ確率表示。
export function PopupAd() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!HAS_AD) return;
    try {
      if (sessionStorage.getItem('cc_popup_seen')) return;
      sessionStorage.setItem('cc_popup_seen', '1');
      if (Math.random() < PROBABILITY) {
        const t = setTimeout(() => setOpen(true), 1500); // 少し遅らせて表示
        return () => clearTimeout(t);
      }
    } catch {
      // sessionStorage 不可環境では何もしない
    }
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="wallet-pop relative w-full max-w-sm rounded-2xl border border-border bg-surface p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="閉じる"
          className="absolute right-2 top-2 rounded px-2 py-1 text-sm text-muted transition hover:text-foreground"
        >
          ✕
        </button>
        <AdSlot />
        <div className="mt-3 text-center">
          <Link
            href="/pricing"
            onClick={() => setOpen(false)}
            className="text-xs text-muted underline-offset-2 transition hover:text-foreground hover:underline"
          >
            広告を消す（PRO）
          </Link>
        </div>
      </div>
    </div>
  );
}
