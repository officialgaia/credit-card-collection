import { createClient } from '@/lib/supabase/server';
import type { Card, CardWithStatus, CardStatus } from '@/lib/types';
import { FREE_OWNED_LIMIT } from '@/lib/billing';

// 非PROで上限を超える所有カードの id 集合を返す（古い順に上限まで有効、それ以降ロック）。
function computeLockedIds(
  owned: { card_id: string; created_at: string }[],
  isPro: boolean
): Set<string> {
  if (isPro) return new Set();
  const sorted = [...owned].sort((a, b) => a.created_at.localeCompare(b.created_at));
  return new Set(sorted.slice(FREE_OWNED_LIMIT).map((o) => o.card_id));
}

// 全カードを取得し、ログイン中ならユーザーの所有状態とロック状態を結合する。
export async function getCardsWithStatus(isPro = false): Promise<CardWithStatus[]> {
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
  let lockedIds = new Set<string>();
  if (user) {
    const { data: userCards } = await supabase
      .from('user_cards')
      .select('card_id, status, created_at')
      .eq('user_id', user.id);

    const rows = userCards ?? [];
    statusByCard = new Map(rows.map((uc) => [uc.card_id as string, uc.status as CardStatus]));
    const owned = rows
      .filter((uc) => uc.status === 'owned')
      .map((uc) => ({ card_id: uc.card_id as string, created_at: uc.created_at as string }));
    lockedIds = computeLockedIds(owned, isPro);
  }

  return cardList.map((card) => ({
    ...card,
    ownStatus: statusByCard.get(card.id) ?? null,
    locked: lockedIds.has(card.id),
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
export async function getCardBySlug(slug: string, isPro = false): Promise<CardWithStatus | null> {
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
  let locked = false;
  if (user) {
    const { data: uc } = await supabase
      .from('user_cards')
      .select('status')
      .eq('user_id', user.id)
      .eq('card_id', (card as Card).id)
      .maybeSingle();
    ownStatus = (uc?.status as CardStatus) ?? null;

    if (ownStatus === 'owned' && !isPro) {
      // この所有カードがロック対象（上限超過の新しい側）かを判定
      const { data: owned } = await supabase
        .from('user_cards')
        .select('card_id, created_at')
        .eq('user_id', user.id)
        .eq('status', 'owned');
      locked = computeLockedIds(
        (owned ?? []).map((o) => ({ card_id: o.card_id as string, created_at: o.created_at as string })),
        isPro
      ).has((card as Card).id);
    }
  }

  return { ...(card as Card), ownStatus, locked };
}
