'use server';

import { createClient } from '@/lib/supabase/server';

export type ContactState = { error: string | null; message?: string } | null;

const CATEGORIES = ['カードの内容について', '不具合の報告', 'ご要望', 'その他'];

export async function submitContact(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  const name = String(formData.get('name') ?? '').trim() || null;
  const email = String(formData.get('email') ?? '').trim() || null;
  const categoryRaw = String(formData.get('category') ?? '').trim();
  const category = CATEGORIES.includes(categoryRaw) ? categoryRaw : 'その他';
  const message = String(formData.get('message') ?? '').trim();

  if (message.length < 1) return { error: 'お問い合わせ内容を入力してください。' };
  if (message.length > 5000) return { error: 'お問い合わせ内容が長すぎます（5000文字以内）。' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('contacts')
    .insert({ name, email, category, message });

  if (error) return { error: '送信に失敗しました。時間をおいて再度お試しください。' };

  return {
    error: null,
    message: 'お問い合わせを受け付けました。ありがとうございます。',
  };
}
