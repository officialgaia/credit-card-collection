-- =============================================================
-- 0006_subscription.sql  サブスク(有料プラン)状態
--   is_subscribed = 有料会員。管理者(is_admin)は課金不要で全機能+広告非表示。
--   実際の課金/解約は決済プロバイダ確定後に Webhook 等で更新する。
-- =============================================================

alter table public.profiles
  add column if not exists is_subscribed boolean not null default false;

comment on column public.profiles.is_subscribed is '有料プラン加入中なら true（決済連携で更新）';

-- 任意: 有効期限（将来の自動失効用。未使用でも可）
alter table public.profiles
  add column if not exists subscribed_until timestamptz;
