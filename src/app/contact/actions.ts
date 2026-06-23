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

  // 管理者宛にメール通知（失敗してもユーザーには成功を返す＝DB保存済みのため）
  await notifyByEmail({ name, email, category, message });

  return {
    error: null,
    message: 'お問い合わせを受け付けました。ありがとうございます。',
  };
}

// Resend でお問い合わせ内容を管理者にメール送信する。
async function notifyByEmail(p: {
  name: string | null;
  email: string | null;
  category: string;
  message: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL ?? 'naitoworld@gmail.com';
  const from = process.env.CONTACT_FROM_EMAIL ?? 'onboarding@resend.dev';
  if (!apiKey) return; // 未設定ならスキップ（DB保存は完了している）

  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const html = `
    <h2>お問い合わせが届きました</h2>
    <p><strong>種別:</strong> ${esc(p.category)}</p>
    <p><strong>お名前:</strong> ${esc(p.name ?? '（未記入）')}</p>
    <p><strong>返信用メール:</strong> ${esc(p.email ?? '（未記入）')}</p>
    <hr />
    <p style="white-space:pre-wrap">${esc(p.message)}</p>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Card Collection <${from}>`,
        to: [to],
        subject: `【お問い合わせ】${p.category}`,
        html,
        ...(p.email ? { reply_to: p.email } : {}),
      }),
    });
    if (!res.ok) console.error('contact email failed:', await res.text());
  } catch (e) {
    console.error('contact email error:', e);
  }
}
