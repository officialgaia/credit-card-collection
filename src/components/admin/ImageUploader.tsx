'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { setCardImage } from '@/app/admin/actions';

const BUCKET = 'card-images';

export function ImageUploader({
  cardId,
  initialUrl,
}: {
  cardId: string;
  initialUrl: string | null;
}) {
  const [url, setUrl] = useState<string | null>(initialUrl);
  const [urlInput, setUrlInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();

  function onSetUrl() {
    const value = urlInput.trim();
    if (!value) return;
    if (!/^https?:\/\//i.test(value)) {
      setError('http(s) で始まる画像URLを入力してください');
      return;
    }
    setError(null);
    setBusy(true);
    startTransition(async () => {
      const res = await setCardImage(cardId, value);
      if (res?.error) setError(res.error);
      else {
        setUrl(value);
        setUrlInput('');
      }
      setBusy(false);
    });
  }

  async function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setBusy(true);

    const supabase = createClient();
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${cardId}/${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: true, cacheControl: '3600' });

    if (upErr) {
      setError(`アップロード失敗: ${upErr.message}`);
      setBusy(false);
      return;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    const publicUrl = data.publicUrl;

    const res = await setCardImage(cardId, publicUrl);
    if (res?.error) {
      setError(res.error);
    } else {
      setUrl(publicUrl);
    }
    setBusy(false);
  }

  function onRemove() {
    setBusy(true);
    startTransition(async () => {
      const res = await setCardImage(cardId, null);
      if (res?.error) setError(res.error);
      else setUrl(null);
      setBusy(false);
    });
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[1.586/1] w-full max-w-xs overflow-hidden rounded-xl border border-border bg-surface-2">
        {url ? (
          <Image src={url} alt="カード画像" fill sizes="320px" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted">
            画像未登録（プレースホルダー表示）
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <label className="cursor-pointer rounded-md border border-border bg-surface-2 px-3 py-1.5 text-sm transition hover:text-accent-soft">
          {busy ? 'アップロード中…' : url ? '画像を差し替え' : '画像をアップロード'}
          <input
            type="file"
            accept="image/*"
            onChange={onSelect}
            disabled={busy}
            className="hidden"
          />
        </label>
        {url && (
          <button
            type="button"
            onClick={onRemove}
            disabled={busy}
            className="text-sm text-muted underline-offset-2 transition hover:text-red-400 hover:underline"
          >
            画像を削除
          </button>
        )}
      </div>

      {/* 画像URLを直接指定して設定する */}
      <div className="space-y-1.5 border-t border-border pt-3">
        <p className="text-xs text-muted">または画像URLを貼り付けて設定</p>
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/card.png"
            className="flex-1 rounded-md border border-border bg-surface-2 px-3 py-1.5 text-sm outline-none focus:border-accent"
          />
          <button
            type="button"
            onClick={onSetUrl}
            disabled={busy || !urlInput.trim()}
            className="rounded-md border border-border bg-surface-2 px-3 py-1.5 text-sm transition hover:text-accent-soft disabled:opacity-50"
          >
            設定
          </button>
        </div>
        <p className="text-[11px] text-muted">
          ※ 外部URLを使う場合は next.config の画像ドメイン許可が必要なことがあります（Storageアップロード推奨）。
        </p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
