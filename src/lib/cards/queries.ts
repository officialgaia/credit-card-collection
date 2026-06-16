import { createClient } from '@/lib/supabase/server';
import type { Card, CardWithStatus, CardStatus } from '@/lib/types';

// 全カードを取得し、ログイン中ならユーザーの所有状態を結合する。
// フェーズ2でフィルタ・並び替えを追加予定。現状は名前順（追加日）で取得。
export async function getCardsWithStatus(): Promise<CardWithStatus[]> {
  const supabase = await createClient();

  const { data: cards, error } = await supabase
    .from('cards')
    .select('*')
    .order('annual_fee', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;
  const cardList = (cards ?? []) as Card[];

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let statusByCard = new Map<string, CardStatus>();
  if (user) {
    const { data: userCards } = await supabase
      .from('user_cards')
      .select('card_id, status')
      .eq('user_id', user.id);

    statusByCard = new Map(
      (userCards ?? []).map((uc) => [uc.card_id as string, uc.status as CardStatus])
    );
  }

  return cardList.map((card) => ({
    ...card,
    ownStatus: statusByCard.get(card.id) ?? null,
  }));
}

// 管理画面用: 全カードを取得（所有状態は不要）
export async function getAllCards(): Promise<Card[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Card[];
}

// 管理画面用: id で1枚取得
export async function getCardById(id: string): Promise<Card | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('cards').select('*').eq('id', id).maybeSingle();
  return (data as Card) ?? null;
}

// slug で1枚取得（詳細ページ用）
export async function getCardBySlug(slug: string): Promise<CardWithStatus | null> {
  const supabase = await createClient();

  const { data: card } = await supabase
    .from('cards')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!card) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let ownStatus: CardStatus | null = null;
  if (user) {
    const { data: uc } = await supabase
      .from('user_cards')
      .select('status')
      .eq('user_id', user.id)
      .eq('card_id', (card as Card).id)
      .maybeSingle();
    ownStatus = (uc?.status as CardStatus) ?? null;
  }

  return { ...(card as Card), ownStatus };
}
