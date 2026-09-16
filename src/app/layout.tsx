import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PopupAd } from "@/components/ads/PopupAd";
import { getCurrentProfile } from "@/lib/auth";
import { shouldShowAds } from "@/lib/billing";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://credit-card-collection.vercel.app";
const siteName = "Card Collection";
const siteDescription =
  "日本で発行できるクレジットカードを年会費・還元率・国際ブランド・特典で検索・比較。所有カードを記録してコレクションとして可視化できます。";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Card Collection — 日本のクレジットカード図鑑・比較",
    template: "%s | Card Collection",
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    "クレジットカード", "クレカ", "クレジットカード 比較", "年会費", "還元率",
    "ゴールドカード", "プラチナカード", "国際ブランド", "クレジットカード コレクション",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: siteUrl,
    siteName,
    title: "Card Collection — 日本のクレジットカード図鑑・比較",
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: "Card Collection — 日本のクレジットカード図鑑・比較",
    description: siteDescription,
  },
  robots: { index: true, follow: true },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

// 運営組織の構造化データ
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteName,
  url: siteUrl,
  logo: `${siteUrl}/apple-icon`,
};

// サイト全体の構造化データ（検索ボックス対応）
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName,
  url: siteUrl,
  description: siteDescription,
  inLanguage: "ja",
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getCurrentProfile();
  const showAds = shouldShowAds(profile);

  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
        <footer className="mt-10 border-t border-border">
          <div className="mx-auto max-w-6xl px-4 py-10 text-center">
            <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 text-sm">
              <a href="/faq" className="text-muted transition hover:text-foreground">
                よくある質問
              </a>
              <span className="text-border" aria-hidden="true">/</span>
              <a href="/terms" className="text-muted transition hover:text-foreground">
                利用規約
              </a>
              <span className="text-border" aria-hidden="true">/</span>
              <a href="/privacy" className="text-muted transition hover:text-foreground">
                個人情報保護方針
              </a>
              <span className="text-border" aria-hidden="true">/</span>
              <a href="/contact" className="text-muted transition hover:text-foreground">
                お問い合わせ
              </a>
              <span className="text-border" aria-hidden="true">/</span>
              <a href="/operator" className="text-muted transition hover:text-foreground">
                運営者情報
              </a>
              <span className="text-border" aria-hidden="true">/</span>
              <a href="/tokushoho" className="text-muted transition hover:text-foreground">
                特定商取引法に基づく表記
              </a>
            </nav>
            <p className="mt-6 text-xs text-muted">
              当サイトはアフィリエイト広告を利用しています。
            </p>
            <p className="mt-2 text-xs text-muted">
              Card Collection · 掲載情報は2026年6月時点の参考値です。最新・正確な条件は各公式サイトでご確認ください
            </p>
          </div>
        </footer>
        {showAds && <PopupAd />}
        <Analytics />
      </body>
    </html>
  );
}
