-- ============================================================================
-- ClubPro — Migration 2 : équipes et joueurs
-- ============================================================================

create type public.player_status as enum ('actif', 'blesse', 'suspendu');

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete cascade,
  name text not null,
  category text not null,
  created_at timestamptz not null default now()
);

create index teams_club_id_idx on public.teams (club_id);

create table public.players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  full_name text not null,
  birth_date date,
  position text,
  jersey_number smallint,
  photo_url text,
  status public.player_status not null default 'actif',
  created_at timestamptz not null default now()
);

create index players_team_id_idx on public.players (team_id);

-- ----------------------------------------------------------------------------
-- RLS — teams
-- ----------------------------------------------------------------------------
alter table public.teams enable row level security;

create policy "teams_select_club"
  on public.teams for select
  to authenticated
  using (club_id = public.current_club_id());

create policy "teams_write_staff"
  on public.teams for all
  to authenticated
  using (club_id = public.current_club_id() and public.is_staff())
  with check (club_id = public.current_club_id() and public.is_staff());

-- ----------------------------------------------------------------------------
-- RLS — players (isolation via l'équipe -> club)
-- ----------------------------------------------------------------------------
alter table public.players enable row level security;

create policy "players_select_club"
  on public.players for select
  to authenticated
  using (
    exists (
      select 1 from public.teams t
      where t.id = players.team_id and t.club_id = public.current_club_id()
    )
  );

create policy "players_write_staff"
  on public.players for all
  to authenticated
  using (
    public.is_staff()
    and exists (
      select 1 from public.teams t
      where t.id = players.team_id and t.club_id = public.current_club_id()
    )
  )
  with check (
    public.is_staff()
    and exists (
      select 1 from public.teams t
      where t.id = players.team_id and t.club_id = public.current_club_id()
    )
  );
