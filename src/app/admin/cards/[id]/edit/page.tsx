import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/auth';
import { getCardById } from '@/lib/cards/queries';
import { updateCard, deleteCard } from '@/app/admin/actions';
import { CardForm } from '@/components/admin/CardForm';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { DeleteCardButton } from '@/components/admin/DeleteCardButton';

export default async function EditCardPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/login');
  if (!profile.is_admin) redirect('/');

  const { id } = await params;
  const { created } = await searchParams;
  const card = await getCardById(id);
  if (!card) notFound();

  const boundUpdate = updateCard.bind(null, card.id);
  const boundDelete = deleteCard.bind(null, card.id);

  return (
    <div className="space-y-6">
      <Link href="/admin" className="text-sm text-muted transition hover:text-foreground">
        ← ダッシュボードへ戻る
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">カードを編集</h1>
        <Link
          href={`/cards/${card.slug}`}
          className="text-sm text-muted transition hover:text-foreground"
        >
          公開ページを見る ↗
        </Link>
      </div>

      {created && (
        <p className="rounded-lg border border-accent/40 bg-accent/10 px-4 py-2 text-sm text-accent">
          カードを作成しました。下から画像をアップロードできます。
        </p>
      )}

      <section className="space-y-3 rounded-2xl border border-border bg-surface/50 p-5">
        <h2 className="text-sm font-semibold text-accent">カード画像</h2>
        <ImageUploader cardId={card.id} initialUrl={card.image_url} />
      </section>

      <CardForm action={boundUpdate} card={card} submitLabel="変更を保存" />

      <section className="space-y-3 rounded-2xl border border-red-500/30 bg-red-500/5 p-5">
        <h2 className="text-sm font-semibold text-red-400">危険な操作</h2>
        <p className="text-sm text-muted">このカードを完全に削除します。元に戻せません。</p>
        <DeleteCardButton action={boundDelete} cardName={card.name} />
      </section>
    </div>
  );
}
