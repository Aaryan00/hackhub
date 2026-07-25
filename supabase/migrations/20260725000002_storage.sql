-- ============================================================================
-- HackHub — storage buckets for avatars and team logos.
-- Files live under a folder named by the owner's user id, e.g. avatars/<uid>/x.png
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('team-logos', 'team-logos', true)
on conflict (id) do nothing;

-- Public read for both buckets.
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "team_logos_public_read" on storage.objects
  for select using (bucket_id = 'team-logos');

-- Authenticated users may write only inside their own uid folder.
create policy "avatars_write_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "team_logos_write_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'team-logos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "team_logos_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'team-logos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "team_logos_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'team-logos' and (storage.foldername(name))[1] = auth.uid()::text);
