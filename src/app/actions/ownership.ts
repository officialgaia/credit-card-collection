'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { CardStatus, Profile, Brand } from '@/lib/types';
import { isPro, FREE_OWNED_LIMIT, FREE_OWNED_NUDGE_AT } from '@/lib/billing';

// 所有カードで実際に保有する国際ブランドを設定（null で解除）。本人のみ。
export async function setCardBrand(cardId: string, brand: Brand | null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'ログインが必要です' };

  const { error } = await supabase
    .from('user_cards')
    .update({ brand })
    .eq('user_id', user.id)
    .eq('card_id', cardId);
  if (error) return { error: error.message };

  revalidatePath('/');
  revalidatePath('/collection');
  return { error: null };
}

type Result = {
  error: string | null;
  // nudge = 告知ポップアップ（所有は成功）/ limit_reached = 上限でブロック（未追加）
  code?: 'nudge' | 'limit_reached';
};

// カードの所有状態を設定する。
//   owned は無料プランの上限（FREE_OWNED_LIMIT 枚）でブロック、
//   FREE_OWNED_NUDGE_AT 枚を超える所有から課金ポップアップを促す。
//   管理者・有料会員は無制限。want と解除は常に可。
export async function setCardStatus(
  cardId: string,
  status: CardStatus | null
): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'ログインが必要です' };

  // 解除
  if (status === null) {
    const { error } = await supabase
      .from('user_cards')
      .delete()
      .eq('user_id', user.id)
      .eq('card_id', cardId);
    if (error) return { error: error.message };
    revalidatePath('/');
    revalidatePath('/collection');
    return { error: null };
  }

  // 「欲しい」は上限の対象外
  if (status === 'want') {
    const { error } = await supabase
      .from('user_cards')
      .upsert({ user_id: user.id, card_id: cardId, status }, { onConflict: 'user_id,card_id' });
    if (error) return { error: error.message };
    revalidatePath('/');
    revalidatePath('/collection');
    return { error: null };
  }

  // ここから status === 'owned'
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const pro = isPro(profile as Profile | null);

  if (!pro) {
    // 既にこのカードを所有済みでなければ、現在の所有枚数で判定
    const { data: existing } = await supabase
      .from('user_cards')
      .select('status')
      .eq('user_id', user.id)
      .eq('card_id', cardId)
      .maybeSingle();
    const alreadyOwned = existing?.status === 'owned';

    if (!alreadyOwned) {
      const { count } = await supabase
        .from('user_cards')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'owned');
      const owned = count ?? 0;

      // 11枚目以降はブロック（追加しない）
      if (owned >= FREE_OWNED_LIMIT) {
        return { error: null, code: 'limit_reached' };
      }

      const { error } = await supabase
        .from('user_cards')
        .upsert({ user_id: user.id, card_id: cardId, status }, { onConflict: 'user_id,card_id' });
      if (error) return { error: error.message };

      revalidatePath('/');
      revalidatePath('/collection');

      // 6枚目以降（所有後の枚数が告知閾値を超える）は告知ポップアップ
      const newCount = owned + 1;
      return { error: null, code: newCount > FREE_OWNED_NUDGE_AT ? 'nudge' : undefined };
    }
  }

  // Pro/管理者、または既に所有済みの再設定
  const { error } = await supabase
    .from('user_cards')
    .upsert({ user_id: user.id, card_id: cardId, status }, { onConflict: 'user_id,card_id' });
  if (error) return { error: error.message };
  revalidatePath('/');
  revalidatePath('/collection');
  return { error: null };
}
