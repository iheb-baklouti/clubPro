-- ============================================================================
-- ClubPro — Migration 14 (Phase 4) : notes de scouting adverse. Aucune vraie
-- source de données n'existe pour des clubs amateurs adverses — saisie
-- manuelle par le staff avant un match, une note par match (comme la table
-- `formations`).
-- ============================================================================
create table public.match_scouting_notes (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null unique references public.matches (id) on delete cascade,
  strengths text,
  weaknesses text,
  key_players text,
  notes text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.match_scouting_notes enable row level security;

create policy "match_scouting_notes_select_club"
  on public.match_scouting_notes for select
  to authenticated
  using (
    exists (
      select 1 from public.matches m
      join public.teams t on t.id = m.team_id
      where m.id = match_scouting_notes.match_id and t.club_id = public.current_club_id()
    )
  );

create policy "match_scouting_notes_write_coach_manager"
  on public.match_scouting_notes for all
  to authenticated
  using (
    public.is_coach_or_manager()
    and exists (
      select 1 from public.matches m
      join public.teams t on t.id = m.team_id
      where m.id = match_scouting_notes.match_id and t.club_id = public.current_club_id()
    )
  )
  with check (
    public.is_coach_or_manager()
    and exists (
      select 1 from public.matches m
      join public.teams t on t.id = m.team_id
      where m.id = match_scouting_notes.match_id and t.club_id = public.current_club_id()
    )
  );
