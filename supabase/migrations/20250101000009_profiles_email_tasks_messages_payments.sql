-- ============================================================================
-- ClubPro — Migration 9 : email sur profiles (annuaire), tâches bénévoles,
-- messagerie interne, cotisations
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Email sur profiles — nécessaire pour afficher l'annuaire des membres sans
-- exposer l'API admin auth.users au client. Alimenté par le trigger de
-- création de profil et lors des invitations.
-- ----------------------------------------------------------------------------
alter table public.profiles add column email text;

update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id and p.email is null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, email)
  values (new.id, new.raw_user_meta_data ->> 'full_name', 'coach', new.email);
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- Tâches / assignations bénévoles (matériel, arbitrage, transport...)
-- Assignable à un membre du staff OU à un joueur (jamais les deux).
-- ----------------------------------------------------------------------------
create type public.task_status as enum ('a_faire', 'fait');

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete cascade,
  team_id uuid references public.teams (id) on delete cascade,
  title text not null,
  description text,
  assigned_profile_id uuid references public.profiles (id) on delete set null,
  assigned_player_id uuid references public.players (id) on delete set null,
  due_date date,
  status public.task_status not null default 'a_faire',
  created_at timestamptz not null default now(),
  constraint tasks_single_assignee check (
    assigned_profile_id is null or assigned_player_id is null
  )
);

create index tasks_club_id_idx on public.tasks (club_id);
create index tasks_team_id_idx on public.tasks (team_id);

alter table public.tasks enable row level security;

create policy "tasks_select_club"
  on public.tasks for select
  to authenticated
  using (club_id = public.current_club_id());

create policy "tasks_write_staff"
  on public.tasks for all
  to authenticated
  using (club_id = public.current_club_id() and public.is_staff())
  with check (club_id = public.current_club_id() and public.is_staff());

-- ----------------------------------------------------------------------------
-- Messagerie interne simple — un fil par équipe (ou club entier si team_id
-- est nul), sans accusés de lecture (hors scope MVP).
-- ----------------------------------------------------------------------------
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete cascade,
  team_id uuid references public.teams (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index messages_club_id_idx on public.messages (club_id);
create index messages_team_id_idx on public.messages (team_id);
create index messages_created_at_idx on public.messages (created_at);

alter table public.messages enable row level security;

create policy "messages_select_club"
  on public.messages for select
  to authenticated
  using (club_id = public.current_club_id());

create policy "messages_insert_staff"
  on public.messages for insert
  to authenticated
  with check (
    club_id = public.current_club_id()
    and public.is_staff()
    and sender_id = auth.uid()
  );

-- ----------------------------------------------------------------------------
-- Cotisations — suivi de statut uniquement (paiement réel via Stripe en v2).
-- Données financières : réservées à la direction/admin (pas les coachs).
-- ----------------------------------------------------------------------------
create type public.payment_status as enum ('en_attente', 'paye');

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  amount numeric(10, 2) not null,
  label text not null,
  status public.payment_status not null default 'en_attente',
  due_date date,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index payments_club_id_idx on public.payments (club_id);
create index payments_player_id_idx on public.payments (player_id);

alter table public.payments enable row level security;

create policy "payments_select_managers"
  on public.payments for select
  to authenticated
  using (club_id = public.current_club_id() and public.is_manager());

create policy "payments_write_managers"
  on public.payments for all
  to authenticated
  using (club_id = public.current_club_id() and public.is_manager())
  with check (club_id = public.current_club_id() and public.is_manager());
