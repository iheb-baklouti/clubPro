-- ============================================================================
-- ClubPro — Migration 13 (Phase 3 du module 3D) : séquences tactiques
-- réutilisables ("simulations", indépendantes d'un match précis) et schémas
-- 3D pour les exercices d'entraînement.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Séquences tactiques — une suite ordonnée d'instantanés (FormationData),
-- rattachée à une équipe (pour résoudre les joueurs des slots) mais pas à un
-- match précis : réutilisable comme scénario d'entraînement (corner, sortie
-- de pressing...). steps_json est un tableau de
-- { id, label, timestampSeconds, data: FormationData }.
-- ----------------------------------------------------------------------------
create table public.tactical_sequences (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete cascade,
  team_id uuid not null references public.teams (id) on delete cascade,
  name text not null,
  notes text,
  steps_json jsonb not null default '[]'::jsonb,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tactical_sequences_club_id_idx on public.tactical_sequences (club_id);
create index tactical_sequences_team_id_idx on public.tactical_sequences (team_id);

alter table public.tactical_sequences enable row level security;

create policy "tactical_sequences_select_club"
  on public.tactical_sequences for select
  to authenticated
  using (club_id = public.current_club_id());

create policy "tactical_sequences_write_coach_manager"
  on public.tactical_sequences for all
  to authenticated
  using (club_id = public.current_club_id() and public.is_coach_or_manager())
  with check (club_id = public.current_club_id() and public.is_coach_or_manager());

-- ----------------------------------------------------------------------------
-- Schéma 3D optionnel d'un exercice (plots, mannequins, flèches de
-- mouvement) — même structure FormationData que les formations, réutilisée
-- ici sans notion de match ni d'équipe. Le champ diagram_url existant reste
-- disponible pour un schéma image externe.
-- ----------------------------------------------------------------------------
alter table public.drills add column diagram_json jsonb;
