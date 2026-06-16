'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { CardStatus } from '@/lib/types';

// カードの所有状態を設定する。
//   status = 'owned' | 'want' → upsert
//   status = null            → 行を削除（未所有に戻す）
// RLS により本人の行しか操作できない。
export async function setCardStatus(cardId: string, status: CardStatus | null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'ログインが必要です' };
  }

  if (status === null) {
    const { error } = await supabase
      .from('user_cards')
      .delete()
      .eq('user_id', user.id)
      .eq('card_id', cardId);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from('user_cards')
      .upsert(
        { user_id: user.id, card_id: cardId, status },
        { onConflict: 'user_id,card_id' }
      );
    if (error) return { error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/collection');
  return { error: null };
}
