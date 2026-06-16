-- =============================================================
-- 0004_business.sql  ビジネスカード区分の追加
--   cards.business (bool) を追加し、既存のビジネスカードに付与する。
-- =============================================================

alter table public.cards
  add column if not exists business boolean not null default false;

comment on column public.cards.business is 'ビジネス/法人・個人事業主向けカードなら true';

-- 既存のビジネスカードに付与（slug指定・冪等）
update public.cards
set business = true
where slug in (
  'saison-cobalt-business-amex',
  'saison-platinum-business-amex',
  'smbc-business-owners',
  'smbc-business-owners-gold'
);
