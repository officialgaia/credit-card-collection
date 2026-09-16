import type { Metadata } from "next";
import { Noto_Sans_JP, Shippori_Mincho } from "next/font/google";
import "./magazine.css";
import { MagazineAuthProvider } from "@/lib/magazine/auth-context";
import { MagazineHeader } from "@/components/magazine/MagazineHeader";

const magSans = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mag-sans",
});

const magSerif = Shippori_Mincho({
  subsets: ["latin"],
  weight: ["600", "800"],
  variable: "--font-mag-serif",
});

export const metadata: Metadata = {
  title: {
    // 親レイアウト(クレジットカードサイト側)のタイトルテンプレートを継承しない
    absolute: "サークル機関誌",
    template: "%s | サークル機関誌",
  },
  robots: { index: false, follow: false },
};

export default function MagazineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`magazine-scope ${magSans.variable} ${magSerif.variable}`}>
      <MagazineAuthProvider>
        <MagazineHeader />
        <main className="mag-container py-8">{children}</main>
        <footer className="mag-container py-10">
          <p className="mag-muted" style={{ fontSize: "0.75rem" }}>
            サークル機関誌 管理アプリ — メンバー限定
          </p>
        </footer>
      </MagazineAuthProvider>
    </div>
  );
}
