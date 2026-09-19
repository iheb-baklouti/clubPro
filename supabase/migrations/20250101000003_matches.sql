-- ============================================================================
-- ClubPro — Migration 3 : calendrier des matchs
-- ============================================================================

create type public.match_home_away as enum ('domicile', 'exterieur');
create type public.match_status as enum ('a_venir', 'joue');

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  opponent_name text not null,
  match_date timestamptz not null,
  location text,
  competition_type text,
  home_or_away public.match_home_away not null default 'domicile',
  score_home smallint,
  score_away smallint,
  status public.match_status not null default 'a_venir',
  created_at timestamptz not null default now()
);

create index matches_team_id_idx on public.matches (team_id);
create index matches_match_date_idx on public.matches (match_date);

alter table public.matches enable row level security;

create policy "matches_select_club"
  on public.matches for select
  to authenticated
  using (
    exists (
      select 1 from public.teams t
      where t.id = matches.team_id and t.club_id = public.current_club_id()
    )
  );

create policy "matches_write_staff"
  on public.matches for all
  to authenticated
  using (
    public.is_staff()
    and exists (
      select 1 from public.teams t
      where t.id = matches.team_id and t.club_id = public.current_club_id()
    )
  )
  with check (
    public.is_staff()
    and exists (
      select 1 from public.teams t
      where t.id = matches.team_id and t.club_id = public.current_club_id()
    )
  );
