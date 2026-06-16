import Link from 'next/link';
import { InfoPage, InfoSection } from '@/components/layout/InfoPage';

export const metadata = { title: '個人情報保護方針 — Card Collection' };

export default function PrivacyPage() {
  return (
    <InfoPage
      title="個人情報保護方針（プライバシーポリシー）"
      lead="当サイトは、利用者の個人情報の保護を重要と考え、以下の方針に基づき適切に取り扱います。"
      updatedAt="2026年6月16日"
    >
      <InfoSection heading="1. 取得する情報">
        <ul className="list-disc space-y-1 pl-5">
          <li>アカウント登録時のメールアドレス、表示名</li>
          <li>Google 等の外部サービスでログインする場合、当該サービスから提供される基本的なプロフィール情報（メールアドレス等）</li>
          <li>所有・欲しいカードの登録内容</li>
          <li>お問い合わせ時にご入力いただいた氏名・メールアドレス・内容</li>
          <li>アクセスに伴う技術情報（Cookie、ログ等）</li>
        </ul>
      </InfoSection>

      <InfoSection heading="2. 利用目的">
        <ul className="list-disc space-y-1 pl-5">
          <li>本サービスの提供・本人認証・コレクション情報の保存のため</li>
          <li>お問い合わせへの対応のため</li>
          <li>不正利用の防止およびサービスの改善のため</li>
        </ul>
      </InfoSection>

      <InfoSection heading="3. 認証・データ保管について">
        <p>
          認証およびデータ保管には Supabase（Supabase Inc. が提供するクラウドサービス）を利用しています。パスワードは当サイト運営者が直接保持せず、認証基盤において安全に管理されます。アクセス制御（Row Level Security）により、利用者のコレクション情報は本人のみが参照・編集できるように制限しています。
        </p>
      </InfoSection>

      <InfoSection heading="4. 第三者提供">
        <p>
          法令に基づく場合を除き、利用者本人の同意なく個人情報を第三者に提供することはありません。サービス提供に必要な範囲で、上記のクラウドサービス等の委託先に取り扱いを委託することがあります。
        </p>
      </InfoSection>

      <InfoSection heading="5. Cookie の利用">
        <p>
          ログイン状態の維持等のために Cookie を使用します。ブラウザの設定で Cookie を無効化できますが、その場合、一部機能がご利用いただけないことがあります。
        </p>
      </InfoSection>

      <InfoSection heading="6. 開示・訂正・削除の請求">
        <p>
          利用者は、自己の個人情報の開示・訂正・削除を請求できます。アカウントおよび関連データの削除をご希望の場合は
          <Link href="/contact" className="text-accent hover:text-accent-soft">
            お問い合わせ
          </Link>
          よりご連絡ください。
        </p>
      </InfoSection>

      <InfoSection heading="7. 方針の変更">
        <p>
          本方針は、必要に応じて変更されることがあります。変更後の内容は当サイトに掲載した時点から適用されます。
        </p>
      </InfoSection>

      <p className="rounded-lg border border-border bg-surface/60 p-3 text-xs text-muted">
        ※ 本ポリシーはテンプレートです。実際の運営者名・連絡先の明記や、適用される法令（個人情報保護法等）への適合を専門家にご確認のうえご利用ください。
      </p>
    </InfoPage>
  );
}
