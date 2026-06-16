'use client';

import { useState } from 'react';

// 削除は誤操作防止のため確認ステップを挟む。
// action は deleteCard を cardId で bind 済みのサーバーアクション。
export function DeleteCardButton({
  action,
  cardName,
}: {
  action: () => void;
  cardName: string;
}) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-md border border-red-500/50 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
      >
        このカードを削除
      </button>
    );
  }

  return (
    <form action={action} className="flex flex-wrap items-center gap-3">
      <span className="text-sm">「{cardName}」を削除します。よろしいですか？</span>
      <button
        type="submit"
        className="rounded-md bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
      >
        削除する
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="text-sm text-muted transition hover:text-foreground"
      >
        キャンセル
      </button>
    </form>
  );
}
