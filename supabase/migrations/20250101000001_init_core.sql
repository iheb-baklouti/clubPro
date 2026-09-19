-- ============================================================================
-- ClubPro — Migration 1 : coeur multi-tenant (clubs, profils, rôles, RLS)
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
create type public.user_role as enum ('direction', 'coach', 'staff_medical', 'admin');

-- ----------------------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------------------
create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  club_id uuid references public.clubs (id) on delete set null,
  full_name text,
  role public.user_role not null default 'coach',
  avatar_url text,
  created_at timestamptz not null default now()
);

create index profiles_club_id_idx on public.profiles (club_id);

-- ----------------------------------------------------------------------------
-- Création automatique du profil à l'inscription (auth.users -> profiles)
-- Le rôle/club définitifs sont attribués ensuite via une Server Action
-- privilégiée (création de club) ou une invitation par la direction.
-- ----------------------------------------------------------------------------
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data ->> 'full_name', 'coach');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Fonctions utilitaires pour les policies RLS (security definer pour éviter
-- toute récursion sur profiles lors de leur évaluation)
-- ----------------------------------------------------------------------------
create function public.current_club_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select club_id from public.profiles where id = auth.uid();
$$;

create function public.current_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role() in ('direction', 'coach', 'staff_medical', 'admin');
$$;

create function public.is_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role() in ('direction', 'admin');
$$;

-- ----------------------------------------------------------------------------
-- Anti-escalade de privilèges : un utilisateur ne peut pas changer lui-même
-- son role ou son club_id. Seuls direction/admin ou le service_role (Server
-- Action serveur) le peuvent.
-- ----------------------------------------------------------------------------
create function public.prevent_self_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;

  if (new.role is distinct from old.role or new.club_id is distinct from old.club_id)
     and not public.is_manager() then
    raise exception 'Seuls la direction ou un administrateur peuvent modifier le rôle ou le club.';
  end if;

  return new;
end;
$$;

create trigger trg_prevent_self_privilege_escalation
  before update on public.profiles
  for each row execute function public.prevent_self_privilege_escalation();

-- ----------------------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------------------
alter table public.clubs enable row level security;
alter table public.profiles enable row level security;

create policy "clubs_select_own"
  on public.clubs for select
  to authenticated
  using (id = public.current_club_id());

create policy "clubs_insert_onboarding"
  on public.clubs for insert
  to authenticated
  with check (true);

create policy "clubs_update_managers"
  on public.clubs for update
  to authenticated
  using (id = public.current_club_id() and public.is_manager());

create policy "profiles_select_self_or_club"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or club_id = public.current_club_id());

create policy "profiles_update_self"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_update_managers"
  on public.profiles for update
  to authenticated
  using (club_id = public.current_club_id() and public.is_manager());
