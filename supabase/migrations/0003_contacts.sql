-- =============================================================
-- 0003_contacts.sql  お問い合わせ保存テーブル
--   - 投稿: 誰でも可（未ログインでもOK）
--   - 閲覧: 管理者のみ
-- =============================================================

create table if not exists public.contacts (
  id         uuid primary key default gen_random_uuid(),
  name       text,
  email      text,
  category   text,
  message    text not null,
  created_at timestamptz not null default now()
);

comment on table public.contacts is 'お問い合わせフォームの投稿。閲覧は管理者のみ。';

alter table public.contacts enable row level security;

-- 投稿は誰でも可能（anon 含む）。空メッセージは拒否。
drop policy if exists "contacts_insert_anyone" on public.contacts;
create policy "contacts_insert_anyone"
  on public.contacts for insert
  with check (char_length(message) between 1 and 5000);

-- 閲覧は管理者のみ
drop policy if exists "contacts_select_admin" on public.contacts;
create policy "contacts_select_admin"
  on public.contacts for select
  using (public.is_admin());
