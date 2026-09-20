-- ============================================================================
-- ClubPro — Migration 6 : entraînements, présence
-- ============================================================================

create type public.training_type as enum ('physique', 'technique', 'tactique', 'recuperation');

create table public.trainings (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  date timestamptz not null,
  type public.training_type not null default 'technique',
  description text,
  created_at timestamptz not null default now()
);

create index trainings_team_id_idx on public.trainings (team_id);
create index trainings_date_idx on public.trainings (date);

-- Présence effective (registre post-séance, alimente le futur bilan d'assiduité).
-- Distinct de availability_responses (event_type='entrainement'), qui est le
-- sondage de disponibilité en amont, comme pour les matchs.
create table public.training_attendance (
  id uuid primary key default gen_random_uuid(),
  training_id uuid not null references public.trainings (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  present boolean not null default true,
  created_at timestamptz not null default now(),
  unique (training_id, player_id)
);

create index training_attendance_training_id_idx on public.training_attendance (training_id);
create index training_attendance_player_id_idx on public.training_attendance (player_id);

-- ----------------------------------------------------------------------------
-- RLS — trainings
-- ----------------------------------------------------------------------------
alter table public.trainings enable row level security;

create policy "trainings_select_club"
  on public.trainings for select
  to authenticated
  using (
    exists (
      select 1 from public.teams t
      where t.id = trainings.team_id and t.club_id = public.current_club_id()
    )
  );

create policy "trainings_write_staff"
  on public.trainings for all
  to authenticated
  using (
    public.is_staff()
    and exists (
      select 1 from public.teams t
      where t.id = trainings.team_id and t.club_id = public.current_club_id()
    )
  )
  with check (
    public.is_staff()
    and exists (
      select 1 from public.teams t
      where t.id = trainings.team_id and t.club_id = public.current_club_id()
    )
  );

-- ----------------------------------------------------------------------------
-- RLS — training_attendance
-- ----------------------------------------------------------------------------
alter table public.training_attendance enable row level security;

create policy "training_attendance_select_club"
  on public.training_attendance for select
  to authenticated
  using (
    exists (
      select 1 from public.trainings tr
      join public.teams t on t.id = tr.team_id
      where tr.id = training_attendance.training_id and t.club_id = public.current_club_id()
    )
  );

create policy "training_attendance_write_staff"
  on public.training_attendance for all
  to authenticated
  using (
    public.is_staff()
    and exists (
      select 1 from public.trainings tr
      join public.teams t on t.id = tr.team_id
      where tr.id = training_attendance.training_id and t.club_id = public.current_club_id()
    )
  )
  with check (
    public.is_staff()
    and exists (
      select 1 from public.trainings tr
      join public.teams t on t.id = tr.team_id
      where tr.id = training_attendance.training_id and t.club_id = public.current_club_id()
    )
  );
