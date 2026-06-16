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
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();

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

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
