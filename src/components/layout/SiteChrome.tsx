"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// /magazine 配下はサークル機関誌アプリの独立した画面なので、
// クレジットカードサイト側のヘッダー・フッター・広告・幅制約は適用しない。
export function SiteChrome({
  header,
  footer,
  popupAd,
  children,
}: {
  header: ReactNode;
  footer: ReactNode;
  popupAd: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isMagazine = pathname?.startsWith("/magazine") ?? false;

  if (isMagazine) {
    return <>{children}</>;
  }

  return (
    <>
      {header}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
      {footer}
      {popupAd}
    </>
  );
}
