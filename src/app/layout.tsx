import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Card Collection — 日本のクレジットカード図鑑",
  description:
    "日本で発行できるクレジットカードを集めて可視化するコレクション管理サイト。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
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
            </nav>
            <p className="mt-8 text-xs text-muted">
              Card Collection · 年会費・還元率等は公開情報をもとにした目安です
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
