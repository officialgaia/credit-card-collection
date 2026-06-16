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
        <footer className="border-t border-border py-6 text-center text-xs text-muted">
          <nav className="mb-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <a href="/faq" className="transition hover:text-foreground">よくある質問</a>
            <a href="/terms" className="transition hover:text-foreground">利用規約</a>
            <a href="/privacy" className="transition hover:text-foreground">個人情報保護方針</a>
            <a href="/contact" className="transition hover:text-foreground">お問い合わせ</a>
          </nav>
          Card Collection · 年会費・還元率等は公開情報をもとにした目安です
        </footer>
      </body>
    </html>
  );
}
