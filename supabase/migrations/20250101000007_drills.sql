-- ============================================================================
-- ClubPro — Migration 7 : bibliothèque d'exercices (drills) et composition
-- de séances d'entraînement
-- ============================================================================

create type public.drill_category as enum ('physique', 'technique', 'tactique');

create table public.drills (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete cascade,
  title text not null,
  category public.drill_category not null default 'technique',
  description text,
  diagram_url text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index drills_club_id_idx on public.drills (club_id);

create table public.training_exercises (
  id uuid primary key default gen_random_uuid(),
  training_id uuid not null references public.trainings (id) on delete cascade,
  drill_id uuid not null references public.drills (id) on delete cascade,
  duration_minutes smallint not null default 10,
  order_index smallint not null default 0,
  created_at timestamptz not null default now()
);

create index training_exercises_training_id_idx on public.training_exercises (training_id);
create index training_exercises_drill_id_idx on public.training_exercises (drill_id);

-- ----------------------------------------------------------------------------
-- RLS — drills (isolation directe par club_id)
-- ----------------------------------------------------------------------------
alter table public.drills enable row level security;

create policy "drills_select_club"
  on public.drills for select
  to authenticated
  using (club_id = public.current_club_id());

create policy "drills_write_staff"
  on public.drills for all
  to authenticated
  using (club_id = public.current_club_id() and public.is_staff())
  with check (club_id = public.current_club_id() and public.is_staff());

-- ----------------------------------------------------------------------------
-- RLS — training_exercises (via training -> team -> club)
-- ----------------------------------------------------------------------------
alter table public.training_exercises enable row level security;

create policy "training_exercises_select_club"
  on public.training_exercises for select
  to authenticated
  using (
    exists (
      select 1 from public.trainings tr
      join public.teams t on t.id = tr.team_id
      where tr.id = training_exercises.training_id and t.club_id = public.current_club_id()
    )
  );

create policy "training_exercises_write_staff"
  on public.training_exercises for all
  to authenticated
  using (
    public.is_staff()
    and exists (
      select 1 from public.trainings tr
      join public.teams t on t.id = tr.team_id
      where tr.id = training_exercises.training_id and t.club_id = public.current_club_id()
    )
  )
  with check (
    public.is_staff()
    and exists (
      select 1 from public.trainings tr
      join public.teams t on t.id = tr.team_id
      where tr.id = training_exercises.training_id and t.club_id = public.current_club_id()
    )
  );
