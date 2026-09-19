-- ============================================================================
-- ClubPro — Migration 4 : convocations & disponibilités (SportEasy/Spond)
-- ============================================================================

create type public.call_up_status as enum ('convoque', 'absent', 'blesse');

create table public.match_call_ups (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  status public.call_up_status not null default 'convoque',
  created_at timestamptz not null default now(),
  unique (match_id, player_id)
);

create index match_call_ups_match_id_idx on public.match_call_ups (match_id);
create index match_call_ups_player_id_idx on public.match_call_ups (player_id);

-- event_type/event_id : polymorphique (match aujourd'hui, entrainement à
-- l'étape 3). Pas de FK directe sur event_id tant que "trainings" n'existe
-- pas ; l'intégrité est garantie côté application (Server Actions + zod).
create type public.event_type as enum ('match', 'entrainement');
create type public.availability_status as enum ('present', 'absent', 'incertain');

create table public.availability_responses (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null,
  event_type public.event_type not null,
  player_id uuid not null references public.players (id) on delete cascade,
  status public.availability_status not null default 'incertain',
  responded_at timestamptz not null default now(),
  unique (event_id, event_type, player_id)
);

create index availability_responses_event_idx on public.availability_responses (event_id, event_type);
create index availability_responses_player_id_idx on public.availability_responses (player_id);

-- ----------------------------------------------------------------------------
-- RLS — match_call_ups (via match -> team -> club)
-- ----------------------------------------------------------------------------
alter table public.match_call_ups enable row level security;

create policy "match_call_ups_select_club"
  on public.match_call_ups for select
  to authenticated
  using (
    exists (
      select 1 from public.matches m
      join public.teams t on t.id = m.team_id
      where m.id = match_call_ups.match_id and t.club_id = public.current_club_id()
    )
  );

create policy "match_call_ups_write_staff"
  on public.match_call_ups for all
  to authenticated
  using (
    public.is_staff()
    and exists (
      select 1 from public.matches m
      join public.teams t on t.id = m.team_id
      where m.id = match_call_ups.match_id and t.club_id = public.current_club_id()
    )
  )
  with check (
    public.is_staff()
    and exists (
      select 1 from public.matches m
      join public.teams t on t.id = m.team_id
      where m.id = match_call_ups.match_id and t.club_id = public.current_club_id()
    )
  );

-- ----------------------------------------------------------------------------
-- RLS — availability_responses (via player -> team -> club)
-- Saisie par le staff au nom du joueur (v1, cf. décision produit).
-- ----------------------------------------------------------------------------
alter table public.availability_responses enable row level security;

create policy "availability_select_club"
  on public.availability_responses for select
  to authenticated
  using (
    exists (
      select 1 from public.players p
      join public.teams t on t.id = p.team_id
      where p.id = availability_responses.player_id and t.club_id = public.current_club_id()
    )
  );

create policy "availability_write_staff"
  on public.availability_responses for all
  to authenticated
  using (
    public.is_staff()
    and exists (
      select 1 from public.players p
      join public.teams t on t.id = p.team_id
      where p.id = availability_responses.player_id and t.club_id = public.current_club_id()
    )
  )
  with check (
    public.is_staff()
    and exists (
      select 1 from public.players p
      join public.teams t on t.id = p.team_id
      where p.id = availability_responses.player_id and t.club_id = public.current_club_id()
    )
  );
