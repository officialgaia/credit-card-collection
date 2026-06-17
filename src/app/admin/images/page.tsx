import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/auth';
import { getAllCards } from '@/lib/cards/queries';
import { BulkImageUploader } from '@/components/admin/BulkImageUploader';

export default async function AdminImagesPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/login');
  if (!profile.is_admin) redirect('/');

  const cards = await getAllCards();
  const lite = cards.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    image_url: c.image_url,
  }));

  return (
    <div className="space-y-6">
      <Link href="/admin" className="text-sm text-muted transition hover:text-foreground">
        ← ダッシュボードへ戻る
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">画像の一括アップロード</h1>
      <BulkImageUploader cards={lite} />
    </div>
  );
}
