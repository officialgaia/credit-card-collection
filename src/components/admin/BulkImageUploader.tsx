'use client';

import { useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { setCardImage } from '@/app/admin/actions';

const BUCKET = 'card-images';

type CardLite = { id: string; slug: string; name: string; image_url: string | null };
type Result = {
  file: string;
  slug: string;
  status: 'done' | 'error' | 'unmatched';
  cardName?: string;
  message?: string;
};

// ファイル名（拡張子を除く）をスラッグとして扱い、複数画像を一括で各カードに割り当てる。
// 例: rakuten-card.png → slug "rakuten-card" のカードに設定。
export function BulkImageUploader({ cards }: { cards: CardLite[] }) {
  const bySlug = useMemo(() => new Map(cards.map((c) => [c.slug, c])), [cards]);
  const [results, setResults] = useState<Result[]>([]);
  const [busy, setBusy] = useState(false);
  const [haveImage, setHaveImage] = useState<Set<string>>(
    () => new Set(cards.filter((c) => c.image_url).map((c) => c.id))
  );

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setBusy(true);
    setResults([]);
    const supabase = createClient();
    const out: Result[] = [];

    for (const file of files) {
      const dot = file.name.lastIndexOf('.');
      const base = (dot >= 0 ? file.name.slice(0, dot) : file.name).trim().toLowerCase();
      const ext = dot >= 0 ? file.name.slice(dot + 1) : 'png';
      const card = bySlug.get(base);

      if (!card) {
        out.push({ file: file.name, slug: base, status: 'unmatched' });
        setResults([...out]);
        continue;
      }

      const path = `${card.slug}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true, cacheControl: '3600' });

      if (upErr) {
        out.push({ file: file.name, slug: base, status: 'error', cardName: card.name, message: upErr.message });
        setResults([...out]);
        continue;
      }

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const res = await setCardImage(card.id, data.publicUrl);
      if (res?.error) {
        out.push({ file: file.name, slug: base, status: 'error', cardName: card.name, message: res.error });
      } else {
        out.push({ file: file.name, slug: base, status: 'done', cardName: card.name });
        setHaveImage((prev) => new Set(prev).add(card.id));
      }
      setResults([...out]);
    }

    setBusy(false);
    e.target.value = '';
  }

  const missing = cards.filter((c) => !haveImage.has(c.id));
  const doneCount = results.filter((r) => r.status === 'done').length;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-surface/60 p-5">
        <p className="text-sm">
          画像あり <span className="text-accent">{haveImage.size}</span> / {cards.length} 枚
        </p>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent/70 to-accent-soft"
            style={{ width: `${cards.length ? (haveImage.size / cards.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface/60 p-5">
        <h2 className="text-sm font-semibold text-accent">一括アップロード</h2>
        <p className="mt-1 text-xs text-muted">
          画像ファイル名を「スラッグ.png（またはjpg）」にして、複数まとめて選択してください。
          ファイル名がスラッグと一致したカードに自動で設定されます。
        </p>
        <label className="mt-3 inline-block cursor-pointer rounded-md bg-accent px-4 py-2 text-sm font-semibold text-black transition hover:bg-accent-soft">
          {busy ? 'アップロード中…' : '画像ファイルを選択（複数可）'}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onFiles}
            disabled={busy}
            className="hidden"
          />
        </label>

        {results.length > 0 && (
          <div className="mt-4 space-y-1 text-sm">
            <p className="text-xs text-muted">
              完了 {doneCount} / {results.length} 件
            </p>
            <ul className="max-h-64 space-y-1 overflow-auto">
              {results.map((r, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span>
                    {r.status === 'done' ? '✅' : r.status === 'unmatched' ? '⚠️' : '❌'}
                  </span>
                  <span className="truncate">
                    {r.file}
                    {r.status === 'done' && <span className="text-muted"> → {r.cardName}</span>}
                    {r.status === 'unmatched' && (
                      <span className="text-muted"> → 一致するカードなし（slug: {r.slug}）</span>
                    )}
                    {r.status === 'error' && <span className="text-red-400"> → {r.message}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-surface/60 p-5">
        <h2 className="text-sm font-semibold text-accent">
          画像が未設定のカード（{missing.length}）
        </h2>
        <p className="mt-1 text-xs text-muted">
          下のスラッグをファイル名にして画像を用意すると一括設定できます。
        </p>
        <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
          {missing.map((c) => (
            <li key={c.id} className="flex justify-between gap-3">
              <span className="truncate text-muted">{c.name}</span>
              <code className="shrink-0 text-xs text-accent">{c.slug}</code>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
