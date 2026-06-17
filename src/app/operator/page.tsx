import Link from 'next/link';
import { InfoPage, InfoSection } from '@/components/layout/InfoPage';

export const metadata = { title: '運営者情報 — Card Collection' };

export default function OperatorPage() {
  return (
    <InfoPage title="運営者情報" lead="本サイトの運営者および広告・免責に関する情報です。">
      <InfoSection heading="運営者">
        <p>内藤良明</p>
      </InfoSection>

      <InfoSection heading="お問い合わせ">
        <p>
          ご連絡は
          <Link href="/contact" className="text-accent hover:text-accent-soft">
            お問い合わせページ
          </Link>
          よりお願いいたします。
        </p>
      </InfoSection>

      <InfoSection heading="広告について（アフィリエイトの表示）">
        <p>
          当サイトは、A8.net 等のアフィリエイトプログラムをはじめとする第三者の広告サービスを利用しており、掲載するカードの紹介・申込により運営者が紹介料等の収益を得る場合があります。
        </p>
        <p>
          各カードの「申し込む」ボタンには、広告（アフィリエイト）リンクである旨を「広告」表示で明示しています。なお、報酬の有無や金額が、当サイトの評価・掲載順位・表現に影響を与えないよう努めますが、掲載の有無や並び順が広告の影響を受ける場合があります。
        </p>
      </InfoSection>

      <InfoSection heading="掲載情報の免責">
        <p>
          掲載している年会費・還元率・特典等は公開情報をもとにした参考値であり、最新性・正確性・完全性を保証するものではありません。お申し込みやご利用の際は、必ず各カード発行会社の公式情報をご確認ください。当サイトの情報により生じた損害について、運営者は責任を負いかねます。
        </p>
      </InfoSection>

      <p className="rounded-lg border border-border bg-surface/60 p-3 text-xs text-muted">
        ※ 物販等で特定商取引法に基づく表記が必要になる場合は、住所・連絡先等の追加記載が必要です。ご自身の状況に合わせてご確認ください。
      </p>
    </InfoPage>
  );
}
