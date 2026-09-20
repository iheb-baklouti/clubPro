-- ============================================================================
-- ClubPro — Migration 18 : parité fonctionnelle avec SportEasy (étude
-- comparative) — fiche joueur enrichie, messagerie bidirectionnelle, vote
-- MVP, galerie photo, covoiturage, sponsors.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Fiche joueur enrichie : contact d'urgence + notes médicales.
-- ----------------------------------------------------------------------------
alter table public.players
  add column emergency_contact_name text,
  add column emergency_contact_phone text,
  add column medical_notes text;

-- ----------------------------------------------------------------------------
-- Messagerie bidirectionnelle : un joueur peut poster dans les fils de SA
-- propre équipe (pas les messages "club" tous publics, réservés au staff).
-- ----------------------------------------------------------------------------
create policy "messages_insert_own_team_players"
  on public.messages for insert
  to authenticated
  with check (
    club_id = public.current_club_id()
    and team_id is not null
    and exists (
      select 1 from public.players p
      where p.id = public.current_player_id() and p.team_id = messages.team_id
    )
  );

-- ----------------------------------------------------------------------------
-- Vote MVP par match — un vote par profil et par match.
-- ----------------------------------------------------------------------------
create table public.match_mvp_votes (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  voter_profile_id uuid not null references public.profiles (id) on delete cascade,
  voted_player_id uuid not null references public.players (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (match_id, voter_profile_id)
);

create index match_mvp_votes_match_id_idx on public.match_mvp_votes (match_id);

alter table public.match_mvp_votes enable row level security;

create policy "match_mvp_votes_select_club"
  on public.match_mvp_votes for select
  to authenticated
  using (
    exists (
      select 1 from public.matches m
      join public.teams t on t.id = m.team_id
      where m.id = match_mvp_votes.match_id and t.club_id = public.current_club_id()
    )
  );

create policy "match_mvp_votes_write_own"
  on public.match_mvp_votes for all
  to authenticated
  using (voter_profile_id = auth.uid())
  with check (
    voter_profile_id = auth.uid()
    and exists (
      select 1 from public.matches m
      join public.teams t on t.id = m.team_id
      where m.id = match_mvp_votes.match_id and t.club_id = public.current_club_id()
    )
  );

-- ----------------------------------------------------------------------------
-- Galerie photo par match (bucket de stockage + métadonnées).
-- ----------------------------------------------------------------------------
create table public.match_photos (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  storage_path text not null,
  caption text,
  uploaded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index match_photos_match_id_idx on public.match_photos (match_id);

alter table public.match_photos enable row level security;

create policy "match_photos_select_club"
  on public.match_photos for select
  to authenticated
  using (
    exists (
      select 1 from public.matches m
      join public.teams t on t.id = m.team_id
      where m.id = match_photos.match_id and t.club_id = public.current_club_id()
    )
  );

create policy "match_photos_write_club"
  on public.match_photos for all
  to authenticated
  using (
    (uploaded_by = auth.uid() or public.is_staff())
    and exists (
      select 1 from public.matches m
      join public.teams t on t.id = m.team_id
      where m.id = match_photos.match_id and t.club_id = public.current_club_id()
    )
  )
  with check (
    uploaded_by = auth.uid()
    and exists (
      select 1 from public.matches m
      join public.teams t on t.id = m.team_id
      where m.id = match_photos.match_id and t.club_id = public.current_club_id()
    )
  );

insert into storage.buckets (id, name, public)
values ('match-photos', 'match-photos', true)
on conflict (id) do nothing;

create policy "match_photos_storage_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'match-photos');

create policy "match_photos_storage_write_club"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'match-photos')
  with check (bucket_id = 'match-photos');

-- ----------------------------------------------------------------------------
-- Covoiturage par match.
-- ----------------------------------------------------------------------------
create table public.carpool_offers (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  driver_player_id uuid not null references public.players (id) on delete cascade,
  seats_total smallint not null default 3,
  departure_location text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.carpool_passengers (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.carpool_offers (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (offer_id, player_id)
);

create index carpool_offers_match_id_idx on public.carpool_offers (match_id);
create index carpool_passengers_offer_id_idx on public.carpool_passengers (offer_id);

alter table public.carpool_offers enable row level security;
alter table public.carpool_passengers enable row level security;

create policy "carpool_offers_select_club"
  on public.carpool_offers for select
  to authenticated
  using (
    exists (
      select 1 from public.matches m
      join public.teams t on t.id = m.team_id
      where m.id = carpool_offers.match_id and t.club_id = public.current_club_id()
    )
  );

create policy "carpool_offers_write_own"
  on public.carpool_offers for all
  to authenticated
  using (driver_player_id = public.current_player_id() or public.is_staff())
  with check (
    (driver_player_id = public.current_player_id() or public.is_staff())
    and exists (
      select 1 from public.matches m
      join public.teams t on t.id = m.team_id
      where m.id = carpool_offers.match_id and t.club_id = public.current_club_id()
    )
  );

create policy "carpool_passengers_select_club"
  on public.carpool_passengers for select
  to authenticated
  using (
    exists (
      select 1 from public.carpool_offers o
      join public.matches m on m.id = o.match_id
      join public.teams t on t.id = m.team_id
      where o.id = carpool_passengers.offer_id and t.club_id = public.current_club_id()
    )
  );

create policy "carpool_passengers_write_own"
  on public.carpool_passengers for all
  to authenticated
  using (player_id = public.current_player_id())
  with check (player_id = public.current_player_id());

-- ----------------------------------------------------------------------------
-- Sponsors du club.
-- ----------------------------------------------------------------------------
create table public.sponsors (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete cascade,
  name text not null,
  logo_url text,
  website_url text,
  order_index smallint not null default 0,
  created_at timestamptz not null default now()
);

create index sponsors_club_id_idx on public.sponsors (club_id);

alter table public.sponsors enable row level security;

create policy "sponsors_select_club"
  on public.sponsors for select
  to authenticated
  using (club_id = public.current_club_id());

create policy "sponsors_write_managers"
  on public.sponsors for all
  to authenticated
  using (club_id = public.current_club_id() and public.is_manager())
  with check (club_id = public.current_club_id() and public.is_manager());

insert into storage.buckets (id, name, public)
values ('sponsor-logos', 'sponsor-logos', true)
on conflict (id) do nothing;

create policy "sponsor_logos_storage_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'sponsor-logos');

create policy "sponsor_logos_storage_write_managers"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'sponsor-logos' and public.is_manager())
  with check (bucket_id = 'sponsor-logos' and public.is_manager());
