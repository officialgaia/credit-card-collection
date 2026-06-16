'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import { BRANDS, TIERS, PRIORITY_PASS, TRAVEL_INSURANCE } from '@/lib/types';

export type FormState = { error: string | null } | null;

// 管理者であることを保証する（RLSが最終防壁だがUX向上のため事前チェック）
async function assertAdmin(): Promise<string | null> {
  const profile = await getCurrentProfile();
  if (!profile) return 'ログインが必要です';
  if (!profile.is_admin) return '管理者権限が必要です';
  return null;
}

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || `card-${Math.random().toString(36).slice(2, 8)}`;
}

const num = z
  .union([z.string(), z.null()])
  .transform((v) => (v == null || v === '' ? null : Number(v)))
  .pipe(z.number().nullable());

const cardSchema = z.object({
  slug: z.string().trim().min(1),
  name: z.string().trim().min(1, 'カード名は必須です'),
  issuer: z.string().trim().min(1, '発行会社は必須です'),
  brands: z.array(z.enum(BRANDS)),
  tier: z.enum(TIERS),
  annual_fee: z.coerce.number().int().min(0),
  annual_fee_note: z.string().nullable(),
  family_card_fee: num,
  etc_card_fee: num,
  base_reward_rate: num,
  reward_note: z.string().nullable(),
  point_program: z.string().nullable(),
  priority_pass: z.enum(PRIORITY_PASS),
  priority_pass_note: z.string().nullable(),
  airport_lounge: z.boolean(),
  travel_insurance: z.enum(TRAVEL_INSURANCE),
  travel_insurance_amount: z.string().nullable(),
  shopping_insurance: z.boolean(),
  concierge: z.boolean(),
  touch_payment: z.boolean(),
  numberless: z.boolean(),
  eligibility: z.string().nullable(),
  official_url: z.string().nullable(),
});

// FormData → 検証済みのカードデータ
function parseCardForm(formData: FormData, fallbackName = '') {
  const str = (k: string) => {
    const v = formData.get(k);
    const s = v == null ? '' : String(v).trim();
    return s === '' ? null : s;
  };
  const bool = (k: string) => formData.get(k) === 'on' || formData.get(k) === 'true';

  const name = str('name') ?? '';
  const slugInput = str('slug');

  return cardSchema.safeParse({
    slug: slugInput ?? slugify(name || fallbackName),
    name,
    issuer: str('issuer') ?? '',
    brands: formData.getAll('brands').map(String),
    tier: str('tier') ?? '一般',
    annual_fee: str('annual_fee') ?? '0',
    annual_fee_note: str('annual_fee_note'),
    family_card_fee: str('family_card_fee'),
    etc_card_fee: str('etc_card_fee'),
    base_reward_rate: str('base_reward_rate'),
    reward_note: str('reward_note'),
    point_program: str('point_program'),
    priority_pass: str('priority_pass') ?? 'なし',
    priority_pass_note: str('priority_pass_note'),
    airport_lounge: bool('airport_lounge'),
    travel_insurance: str('travel_insurance') ?? 'なし',
    travel_insurance_amount: str('travel_insurance_amount'),
    shopping_insurance: bool('shopping_insurance'),
    concierge: bool('concierge'),
    touch_payment: bool('touch_payment'),
    numberless: bool('numberless'),
    eligibility: str('eligibility'),
    official_url: str('official_url'),
  });
}

export async function createCard(_prev: FormState, formData: FormData): Promise<FormState> {
  const adminErr = await assertAdmin();
  if (adminErr) return { error: adminErr };

  const parsed = parseCardForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? '入力内容を確認してください' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('cards')
    .insert(parsed.data)
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') return { error: 'そのスラッグは既に使われています' };
    return { error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/admin');
  // 作成後は編集画面へ（画像アップロードのため）
  redirect(`/admin/cards/${data.id}/edit?created=1`);
}

export async function updateCard(
  cardId: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const adminErr = await assertAdmin();
  if (adminErr) return { error: adminErr };

  const parsed = parseCardForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? '入力内容を確認してください' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('cards').update(parsed.data).eq('id', cardId);

  if (error) {
    if (error.code === '23505') return { error: 'そのスラッグは既に使われています' };
    return { error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath(`/cards/${parsed.data.slug}`);
  return { error: null };
}

export async function deleteCard(cardId: string) {
  const adminErr = await assertAdmin();
  if (adminErr) return;

  const supabase = await createClient();
  await supabase.from('cards').delete().eq('id', cardId);

  revalidatePath('/');
  revalidatePath('/admin');
  redirect('/admin');
}

// 画像アップロード後、公開URLを cards.image_url に保存する
export async function setCardImage(cardId: string, imageUrl: string | null) {
  const adminErr = await assertAdmin();
  if (adminErr) return { error: adminErr };

  const supabase = await createClient();
  const { error } = await supabase
    .from('cards')
    .update({ image_url: imageUrl })
    .eq('id', cardId);

  if (error) return { error: error.message };

  revalidatePath('/');
  revalidatePath('/admin');
  return { error: null };
}
