import Link from 'next/link';
import { InfoPage } from '@/components/layout/InfoPage';
import { PLAN_PRICE_LABEL } from '@/lib/billing';

export const metadata = {
  title: '特定商取引法に基づく表記',
  alternates: { canonical: '/tokushoho' },
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-border py-3 sm:grid-cols-[200px_1fr] sm:gap-4">
      <dt className="text-sm font-medium text-muted">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

export default function TokushohoPage() {
  return (
    <InfoPage
      title="特定商取引法に基づく表記"
      lead="本ページは、特定商取引法に基づき必要な事項を表示するものです。"
    >
      <dl>
        <Row label="販売事業者">Card Collection</Row>
        <Row label="所在地">
          ご請求があれば遅滞なく開示いたします。
          <span className="block text-xs text-muted">
            お問い合わせフォームよりご連絡いただければ、遅滞なく書面または電子メールにて開示します。
          </span>
        </Row>
        <Row label="電話番号">
          ご請求があれば遅滞なく開示いたします。
          <span className="block text-xs text-muted">
            お問い合わせフォームよりご連絡いただければ、遅滞なく開示します。
          </span>
        </Row>
        <Row label="お問い合わせ">
          <Link href="/contact" className="text-accent hover:text-accent-soft">
            お問い合わせフォーム
          </Link>
          よりご連絡ください。
        </Row>
        <Row label="販売URL">https://credit-card-collection.vercel.app</Row>
        <Row label="販売価格">
          Card Collection PRO：{PLAN_PRICE_LABEL}（税込）
        </Row>
        <Row label="商品代金以外の必要料金">
          なし（インターネット接続料金・通信料金等はお客様のご負担となります）
        </Row>
        <Row label="お支払い方法">クレジットカード決済（Stripe）</Row>
        <Row label="お支払い時期">
          お申し込み時に初回決済。以降、毎月同日に自動更新で課金されます。
        </Row>
        <Row label="サービスの提供時期">決済完了後、ただちにご利用いただけます。</Row>
        <Row label="解約・返金について">
          いつでも解約できます。解約は料金ページの「サブスクを管理・解約」（カスタマーポータル）から行えます。解約後は次回更新日以降、課金されません。デジタルサービスの性質上、決済済み期間の返金は原則行いません。
        </Row>
        <Row label="動作環境">最新版の主要ブラウザ（Chrome / Safari / Edge / Firefox 等）</Row>
      </dl>

      <p className="rounded-lg border border-border bg-surface/60 p-3 text-xs text-muted">
        ※ 所在地・電話番号は、消費者からのご請求があった場合に遅滞なく開示いたします（特定商取引法に基づく運用）。
      </p>
    </InfoPage>
  );
}
