-- =============================================================
-- 0008_user_card_brand.sql  所有カードの「実際に持っている決済ブランド」
--   user_cards.brand に、ユーザーが選んだ国際ブランドを保存する（任意）。
--   ブランド別保有の集計は、この選択があるカードのみカウントする。
-- =============================================================

alter table public.user_cards
  add column if not exists brand text
  check (brand is null or brand in ('visa','mastercard','jcb','amex','diners','unionpay'));

comment on column public.user_cards.brand is '所有カードで実際に保有する国際ブランド（任意・1つ）';
