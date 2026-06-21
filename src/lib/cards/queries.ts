import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';
import type { Card, CardWithStatus, CardStatus, Brand } from '@/lib/types';
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

  const user = await getCurrentUser();

  let statusByCard = new Map<string, CardStatus>();
  let brandByCard = new Map<string, Brand>();
  let lockedIds = new Set<string>();
  if (user) {
    const { data: userCards } = await supabase
      .from('user_cards')
      .select('card_id, status, created_at, brand')
      .eq('user_id', user.id);

    const rows = userCards ?? [];
    statusByCard = new Map(rows.map((uc) => [uc.card_id as string, uc.status as CardStatus]));
    brandByCard = new Map(
      rows.filter((uc) => uc.brand).map((uc) => [uc.card_id as string, uc.brand as Brand])
    );
    const owned = rows
      .filter((uc) => uc.status === 'owned')
      .map((uc) => ({ card_id: uc.card_id as string, created_at: uc.created_at as string }));
    lockedIds = computeLockedIds(owned, isPro);
  }

  return cardList.map((card) => ({
    ...card,
    ownStatus: statusByCard.get(card.id) ?? null,
    locked: lockedIds.has(card.id),
    ownBrand: brandByCard.get(card.id) ?? null,
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

// 公開シェア用: slug の配列でカードを取得し、入力順を保つ
export async function getCardsBySlugs(slugs: string[]): Promise<Card[]> {
  if (slugs.length === 0) return [];
  const supabase = await createClient();
  const { data } = await supabase.from('cards').select('*').in('slug', slugs);
  const list = (data ?? []) as Card[];
  const order = new Map(slugs.map((s, i) => [s, i]));
  return list.sort((a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0));
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

  const user = await getCurrentUser();

  let ownStatus: CardStatus | null = null;
  let locked = false;
  let ownBrand: Brand | null = null;
  if (user) {
    const { data: uc } = await supabase
      .from('user_cards')
      .select('status, brand')
      .eq('user_id', user.id)
      .eq('card_id', (card as Card).id)
      .maybeSingle();
    ownStatus = (uc?.status as CardStatus) ?? null;
    ownBrand = (uc?.brand as Brand) ?? null;

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

  return { ...(card as Card), ownStatus, locked, ownBrand };
}
