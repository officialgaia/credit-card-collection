import Link from 'next/link';
import { InfoPage } from '@/components/layout/InfoPage';

export const metadata = { title: 'よくある質問 — Card Collection' };

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: 'このサイトは何ができますか？',
    a: '日本で発行できるクレジットカードを一覧で見られます。ログインすると「所有しているカード」にチェックを付けてコレクションとして可視化でき、収集率や合計年会費などの集計も確認できます。',
  },
  {
    q: '利用は無料ですか？',
    a: '本サイトの閲覧・利用は無料です。各カードの年会費等はそれぞれのカード発行会社が定めるものです。',
  },
  {
    q: 'ログインしなくても使えますか？',
    a: 'カードの一覧・詳細・フィルタはログインなしで閲覧できます。所有チェックやマイコレクション・財布ビューのご利用にはログインが必要です。',
  },
  {
    q: 'アカウントはどうやって作りますか？',
    a: (
      <>
        <Link href="/login" className="text-accent hover:text-accent-soft">
          ログインページ
        </Link>
        からメールアドレスとパスワード、または Google アカウントで登録できます。パスワードは英字と数字を含む8文字以上で設定してください。
      </>
    ),
  },
  {
    q: 'パスワードを忘れました。',
    a: (
      <>
        ログインページの「パスワードをお忘れですか？」から
        <Link href="/forgot-password" className="text-accent hover:text-accent-soft">
          再設定
        </Link>
        できます。登録メールアドレス宛に再設定用リンクをお送りします。
      </>
    ),
  },
  {
    q: '掲載されている年会費や還元率は正確ですか？',
    a: '掲載情報は公開情報をもとにした目安であり、最新・正確な条件を保証するものではありません。お申し込みの際は必ず各カード発行会社の公式サイトをご確認ください。',
  },
  {
    q: '欲しいカードが一覧にありません。',
    a: (
      <>
        随時追加しています。掲載のご要望は
        <Link href="/contact" className="text-accent hover:text-accent-soft">
          お問い合わせ
        </Link>
        からお寄せください。
      </>
    ),
  },
  {
    q: '「財布」と「コレクション」の違いは？',
    a: '「財布」は所有カードを実物のように重ねて眺めるビュー、「コレクション」は収集率やランク別の集計・実績バッジを確認するダッシュボードです。',
  },
];

export default function FaqPage() {
  return (
    <InfoPage title="よくある質問" lead="ご利用にあたってよくいただく質問をまとめました。">
      <div className="space-y-3">
        {FAQS.map((item, i) => (
          <details
            key={i}
            className="group rounded-xl border border-border bg-surface/60 p-4 [&_summary]:cursor-pointer"
          >
            <summary className="flex items-center justify-between font-medium marker:content-['']">
              {item.q}
              <span className="text-muted transition group-open:rotate-180">▾</span>
            </summary>
            <div className="mt-3 text-muted">{item.a}</div>
          </details>
        ))}
      </div>
    </InfoPage>
  );
}
