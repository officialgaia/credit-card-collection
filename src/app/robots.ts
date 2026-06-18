import type { MetadataRoute } from 'next';

const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://credit-card-collection.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/reset-password', '/forgot-password'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
