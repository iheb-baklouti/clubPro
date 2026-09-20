-- ============================================================================
-- ClubPro — Migration 8 : éditeur de formation tactique
-- ============================================================================

-- positions_json — voir lib/formations.ts pour le type TypeScript FormationData :
-- { formationType: string, slots: {id,label,x,y,playerId}[], arrows: {id,x1,y1,x2,y2}[] }
-- x/y en pourcentage (0-100) du terrain, indépendants de la résolution d'écran.
create table public.formations (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null unique references public.matches (id) on delete cascade,
  formation_type text not null,
  positions_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.formations enable row level security;

create policy "formations_select_club"
  on public.formations for select
  to authenticated
  using (
    exists (
      select 1 from public.matches m
      join public.teams t on t.id = m.team_id
      where m.id = formations.match_id and t.club_id = public.current_club_id()
    )
  );

create policy "formations_write_staff"
  on public.formations for all
  to authenticated
  using (
    public.is_staff()
    and exists (
      select 1 from public.matches m
      join public.teams t on t.id = m.team_id
      where m.id = formations.match_id and t.club_id = public.current_club_id()
    )
  )
  with check (
    public.is_staff()
    and exists (
      select 1 from public.matches m
      join public.teams t on t.id = m.team_id
      where m.id = formations.match_id and t.club_id = public.current_club_id()
    )
  );
