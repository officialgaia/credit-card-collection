-- =============================================================
-- 0007_stripe.sql  Stripe連携カラム + 自己昇格防止
-- =============================================================

alter table public.profiles add column if not exists stripe_customer_id text;
alter table public.profiles add column if not exists stripe_subscription_id text;

-- セキュリティ修正:
--   一般ユーザーが自分の profiles 行の is_admin / is_subscribed 等を
--   API経由で勝手に書き換えられないよう、更新可能な列を display_name のみに制限する。
--   is_admin / is_subscribed / stripe_* は service_role（Webhook）または SQL でのみ更新。
revoke update on public.profiles from authenticated;
grant update (display_name) on public.profiles to authenticated;
