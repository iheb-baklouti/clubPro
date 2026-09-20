-- ============================================================================
-- ClubPro — Migration 15 : bucket de stockage pour le logo du club.
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('club-logos', 'club-logos', true)
on conflict (id) do nothing;

create policy "club_logos_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'club-logos');

create policy "club_logos_write_managers"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'club-logos' and public.is_manager())
  with check (bucket_id = 'club-logos' and public.is_manager());
