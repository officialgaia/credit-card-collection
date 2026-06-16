import Link from 'next/link';
import { InfoPage, InfoSection } from '@/components/layout/InfoPage';

export const metadata = { title: '利用規約 — Card Collection' };

export default function TermsPage() {
  return (
    <InfoPage
      title="利用規約"
      lead="本利用規約（以下「本規約」）は、本サイト（以下「当サイト」）の利用条件を定めるものです。"
      updatedAt="2026年6月16日"
    >
      <InfoSection heading="第1条（適用）">
        <p>
          本規約は、利用者と当サイト運営者との間の当サイトの利用に関わる一切の関係に適用されます。利用者は、当サイトを利用することにより本規約に同意したものとみなされます。
        </p>
      </InfoSection>

      <InfoSection heading="第2条（アカウント登録）">
        <p>
          一部機能の利用にはアカウント登録が必要です。利用者は、登録情報を正確かつ最新の状態に保つものとします。パスワード等の認証情報は利用者自身の責任で管理し、第三者に利用させてはなりません。
        </p>
      </InfoSection>

      <InfoSection heading="第3条（掲載情報の正確性）">
        <p>
          当サイトに掲載するクレジットカードの年会費・還元率・付帯特典等は、公開情報をもとにした目安であり、その正確性・最新性・完全性を保証するものではありません。実際の申込条件・特典内容は、必ず各カード発行会社の公式情報をご確認ください。当サイトは金融商品の勧誘・媒介を行うものではありません。
        </p>
      </InfoSection>

      <InfoSection heading="第4条（禁止事項）">
        <p>利用者は、当サイトの利用にあたり、次の行為をしてはなりません。</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>法令または公序良俗に違反する行為</li>
          <li>当サイトの運営を妨害する行為、不正アクセス行為</li>
          <li>他の利用者または第三者の権利・利益を侵害する行為</li>
          <li>API等への過度なアクセスや自動化された大量取得</li>
        </ul>
      </InfoSection>

      <InfoSection heading="第5条（免責事項）">
        <p>
          当サイトの利用または利用できないことによって利用者に生じた損害について、当サイト運営者は、法令で許容される範囲において一切の責任を負いません。当サイトは予告なく内容の変更・中断・終了を行うことがあります。
        </p>
      </InfoSection>

      <InfoSection heading="第6条（知的財産権）">
        <p>
          当サイトに関する著作権その他の知的財産権は、当サイト運営者または正当な権利者に帰属します。各カードの名称・ロゴ・ブランド名は各社の商標または登録商標です。
        </p>
      </InfoSection>

      <InfoSection heading="第7条（規約の変更）">
        <p>
          当サイト運営者は、必要と判断した場合、利用者に通知することなく本規約を変更できるものとします。変更後の規約は当サイトに掲載した時点から効力を生じます。
        </p>
      </InfoSection>

      <InfoSection heading="第8条（お問い合わせ）">
        <p>
          本規約に関するお問い合わせは
          <Link href="/contact" className="text-accent hover:text-accent-soft">
            お問い合わせページ
          </Link>
          よりお願いいたします。
        </p>
      </InfoSection>

      <p className="rounded-lg border border-border bg-surface/60 p-3 text-xs text-muted">
        ※ 本規約はテンプレートです。実際に公開・運用する際は、運営者情報の記載や内容の妥当性を専門家にご確認のうえご利用ください。
      </p>
    </InfoPage>
  );
}
