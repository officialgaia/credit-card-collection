import { InfoPage } from '@/components/layout/InfoPage';
import { ContactForm } from './ContactForm';

export const metadata = { title: 'お問い合わせ — Card Collection' };

export default function ContactPage() {
  return (
    <InfoPage
      title="お問い合わせ"
      lead="カード情報の誤り・ご要望・不具合などをお知らせください。返信が必要な場合はメールアドレスをご記入ください。"
    >
      <ContactForm />
    </InfoPage>
  );
}
