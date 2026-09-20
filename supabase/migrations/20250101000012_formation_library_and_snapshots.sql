-- ============================================================================
-- ClubPro — Migration 12 : bibliothèque de formations réutilisables (Phase 1
-- du module 3D) et instantanés tactiques horodatés pour la timeline (Phase 2)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Bibliothèque de formations — indépendante d'un match précis, réutilisable
-- et duplicable. La table `formations` (1 par match, contrainte unique)
-- reste inchangée pour la tactique spécifique à un match.
-- ----------------------------------------------------------------------------
create table public.formation_templates (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete cascade,
  team_id uuid references public.teams (id) on delete cascade,
  name text not null,
  notes text,
  formation_type text not null,
  positions_json jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index formation_templates_club_id_idx on public.formation_templates (club_id);
create index formation_templates_team_id_idx on public.formation_templates (team_id);

alter table public.formation_templates enable row level security;

create policy "formation_templates_select_club"
  on public.formation_templates for select
  to authenticated
  using (club_id = public.current_club_id());

create policy "formation_templates_write_coach_manager"
  on public.formation_templates for all
  to authenticated
  using (club_id = public.current_club_id() and public.is_coach_or_manager())
  with check (club_id = public.current_club_id() and public.is_coach_or_manager());

-- ----------------------------------------------------------------------------
-- Instantanés tactiques d'un match — plusieurs par match, horodatés, pour
-- alimenter la timeline (Phase 2). positions_json contient un FormationData
-- (slots + flèches) ainsi qu'une position de ballon optionnelle. Il s'agit
-- d'instantanés créés manuellement par le staff, pas d'un tracking réel :
-- l'animation entre deux instantanés consécutifs est une interpolation
-- linéaire côté client, pas un replay de mouvements captés.
-- ----------------------------------------------------------------------------
create table public.match_tactical_snapshots (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  label text not null,
  timestamp_seconds integer not null default 0,
  order_index smallint not null default 0,
  positions_json jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index match_tactical_snapshots_match_id_idx on public.match_tactical_snapshots (match_id);

alter table public.match_tactical_snapshots enable row level security;

create policy "match_tactical_snapshots_select_club"
  on public.match_tactical_snapshots for select
  to authenticated
  using (
    exists (
      select 1 from public.matches m
      join public.teams t on t.id = m.team_id
      where m.id = match_tactical_snapshots.match_id and t.club_id = public.current_club_id()
    )
  );

create policy "match_tactical_snapshots_write_coach_manager"
  on public.match_tactical_snapshots for all
  to authenticated
  using (
    public.is_coach_or_manager()
    and exists (
      select 1 from public.matches m
      join public.teams t on t.id = m.team_id
      where m.id = match_tactical_snapshots.match_id and t.club_id = public.current_club_id()
    )
  )
  with check (
    public.is_coach_or_manager()
    and exists (
      select 1 from public.matches m
      join public.teams t on t.id = m.team_id
      where m.id = match_tactical_snapshots.match_id and t.club_id = public.current_club_id()
    )
  );
