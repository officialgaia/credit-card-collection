import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { GUIDES } from '@/lib/guides';

const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://credit-card-collection.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ['', '/guides', '/simulator', '/login', '/pricing', '/faq', '/terms', '/privacy', '/contact', '/operator', '/tokushoho'];
  const staticUrls: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${base}${p}`,
    changeFrequency: p === '' ? 'daily' : 'weekly',
    priority: p === '' ? 1 : 0.5,
  }));

  const guideUrls: MetadataRoute.Sitemap = GUIDES.map((g) => ({
    url: `${base}/guides/${g.slug}`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  let cardUrls: MetadataRoute.Sitemap = [];
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    );
    const { data } = await sb.from('cards').select('slug, updated_at');
    cardUrls = (data ?? []).map((c) => ({
      url: `${base}/cards/${c.slug}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : undefined,
      changeFrequency: 'monthly',
      priority: 0.7,
    }));
  } catch {
    // 取得失敗時は静的URLのみ
  }

  return [...staticUrls, ...guideUrls, ...cardUrls];
}
