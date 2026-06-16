-- =============================================================
-- 0001_init.sql
-- テーブル定義 / トリガー / RLS ポリシー
-- =============================================================

-- ---------- profiles ----------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  is_admin     boolean not null default false,
  created_at   timestamptz not null default now()
);

comment on table public.profiles is 'ユーザープロフィール。is_admin で管理者を判定する。';

-- ---------- cards ----------
create table if not exists public.cards (
  id                     uuid primary key default gen_random_uuid(),
  slug                   text not null unique,
  name                   text not null,
  issuer                 text not null,
  -- 国際ブランド（複数可）: visa / mastercard / jcb / amex / diners / unionpay
  brands                 text[] not null default '{}',
  -- ランク: 一般 / ゴールド / プラチナ / ブラック
  tier                   text not null default '一般'
                           check (tier in ('一般', 'ゴールド', 'プラチナ', 'ブラック')),
  annual_fee             integer not null default 0,
  annual_fee_note        text,
  family_card_fee        integer,
  etc_card_fee           integer,
  base_reward_rate       numeric(4, 2),
  reward_note            text,
  point_program          text,
  -- プライオリティパス: なし / スタンダード / プレステージ
  priority_pass          text not null default 'なし'
                           check (priority_pass in ('なし', 'スタンダード', 'プレステージ')),
  priority_pass_note     text,
  airport_lounge         boolean not null default false,
  -- 海外旅行保険: なし / 利用付帯 / 自動付帯
  travel_insurance       text not null default 'なし'
                           check (travel_insurance in ('なし', '利用付帯', '自動付帯')),
  travel_insurance_amount text,
  shopping_insurance     boolean not null default false,
  concierge              boolean not null default false,
  touch_payment          boolean not null default false,
  numberless             boolean not null default false,
  eligibility            text,
  official_url           text,
  image_url              text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

comment on table public.cards is 'クレジットカードのマスタ。書き込みは管理者のみ。';

-- ブランド配列での絞り込みを高速化
create index if not exists cards_brands_idx on public.cards using gin (brands);
create index if not exists cards_tier_idx   on public.cards (tier);
create index if not exists cards_issuer_idx on public.cards (issuer);

-- ---------- user_cards（所有チェック / 欲しいリスト） ----------
create table if not exists public.user_cards (
  user_id    uuid not null references auth.users (id) on delete cascade,
  card_id    uuid not null references public.cards (id) on delete cascade,
  -- owned = 所有 / want = 欲しい。行が存在しない = 未所有
  status     text not null default 'owned'
               check (status in ('owned', 'want')),
  created_at timestamptz not null default now(),
  primary key (user_id, card_id)
);

comment on table public.user_cards is '各ユーザーの所有 / 欲しいカード。行の存在が所有を表す。';

-- =============================================================
-- updated_at 自動更新トリガー
-- =============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists cards_set_updated_at on public.cards;
create trigger cards_set_updated_at
  before update on public.cards
  for each row execute function public.set_updated_at();

-- =============================================================
-- auth.users 作成時に profiles を自動生成
-- =============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================
-- 管理者判定ヘルパー（RLS から参照。SECURITY DEFINER で profiles の
-- RLS を回避し、再帰参照を防ぐ）
-- =============================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin
  );
$$;

-- =============================================================
-- RLS
-- =============================================================
alter table public.profiles   enable row level security;
alter table public.cards      enable row level security;
alter table public.user_cards enable row level security;

-- ---------- profiles ----------
-- 自分のプロフィールのみ参照・更新できる
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------- cards ----------
-- 読み取りは全員（未ログイン含む）に公開
drop policy if exists "cards_select_public" on public.cards;
create policy "cards_select_public"
  on public.cards for select
  using (true);

-- 書き込み（追加・更新・削除）は管理者のみ
drop policy if exists "cards_insert_admin" on public.cards;
create policy "cards_insert_admin"
  on public.cards for insert
  with check (public.is_admin());

drop policy if exists "cards_update_admin" on public.cards;
create policy "cards_update_admin"
  on public.cards for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "cards_delete_admin" on public.cards;
create policy "cards_delete_admin"
  on public.cards for delete
  using (public.is_admin());

-- ---------- user_cards ----------
-- 本人の行のみ読み書きできる
drop policy if exists "user_cards_select_own" on public.user_cards;
create policy "user_cards_select_own"
  on public.user_cards for select
  using (auth.uid() = user_id);

drop policy if exists "user_cards_insert_own" on public.user_cards;
create policy "user_cards_insert_own"
  on public.user_cards for insert
  with check (auth.uid() = user_id);

drop policy if exists "user_cards_update_own" on public.user_cards;
create policy "user_cards_update_own"
  on public.user_cards for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "user_cards_delete_own" on public.user_cards;
create policy "user_cards_delete_own"
  on public.user_cards for delete
  using (auth.uid() = user_id);
