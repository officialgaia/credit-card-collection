-- =============================================================
-- 0002_storage.sql
-- カード画像用 Storage バケット + ポリシー
--  - 読み取り: 公開
--  - 書き込み: 管理者のみ
-- =============================================================

insert into storage.buckets (id, name, public)
values ('card-images', 'card-images', true)
on conflict (id) do nothing;

-- 読み取りは全員に公開
drop policy if exists "card_images_select_public" on storage.objects;
create policy "card_images_select_public"
  on storage.objects for select
  using (bucket_id = 'card-images');

-- アップロード・更新・削除は管理者のみ
drop policy if exists "card_images_insert_admin" on storage.objects;
create policy "card_images_insert_admin"
  on storage.objects for insert
  with check (bucket_id = 'card-images' and public.is_admin());

drop policy if exists "card_images_update_admin" on storage.objects;
create policy "card_images_update_admin"
  on storage.objects for update
  using (bucket_id = 'card-images' and public.is_admin())
  with check (bucket_id = 'card-images' and public.is_admin());

drop policy if exists "card_images_delete_admin" on storage.objects;
create policy "card_images_delete_admin"
  on storage.objects for delete
  using (bucket_id = 'card-images' and public.is_admin());
