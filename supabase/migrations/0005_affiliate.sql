-- =============================================================
-- 0005_affiliate.sql  アフィリエイトリンク用カラム
--   affiliate_url があれば申込ボタンの遷移先に優先使用し「広告」表記する。
-- =============================================================

alter table public.cards
  add column if not exists affiliate_url text;

comment on column public.cards.affiliate_url is 'アフィリエイト申込リンク。設定時は広告(PR)として遷移先に優先使用する。';
