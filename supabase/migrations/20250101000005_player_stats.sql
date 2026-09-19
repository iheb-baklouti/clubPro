-- ============================================================================
-- ClubPro — Migration 5 : statistiques joueurs par match
-- ============================================================================

create table public.player_stats (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete cascade,
  match_id uuid not null references public.matches (id) on delete cascade,
  goals smallint not null default 0,
  assists smallint not null default 0,
  yellow_cards smallint not null default 0,
  red_cards smallint not null default 0,
  minutes_played smallint not null default 0,
  created_at timestamptz not null default now(),
  unique (player_id, match_id)
);

create index player_stats_match_id_idx on public.player_stats (match_id);
create index player_stats_player_id_idx on public.player_stats (player_id);

alter table public.player_stats enable row level security;

create policy "player_stats_select_club"
  on public.player_stats for select
  to authenticated
  using (
    exists (
      select 1 from public.players p
      join public.teams t on t.id = p.team_id
      where p.id = player_stats.player_id and t.club_id = public.current_club_id()
    )
  );

create policy "player_stats_write_staff"
  on public.player_stats for all
  to authenticated
  using (
    public.is_staff()
    and exists (
      select 1 from public.players p
      join public.teams t on t.id = p.team_id
      where p.id = player_stats.player_id and t.club_id = public.current_club_id()
    )
  )
  with check (
    public.is_staff()
    and exists (
      select 1 from public.players p
      join public.teams t on t.id = p.team_id
      where p.id = player_stats.player_id and t.club_id = public.current_club_id()
    )
  );
