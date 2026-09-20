-- ============================================================================
-- ClubPro — Migration 17 : portail joueur — lien profil <-> joueur, et accès
-- en lecture/écriture restreints à ses propres données (disponibilité,
-- cotisations). Le reste (calendrier, effectif, stats, messages) est déjà
-- lisible par tout membre du club via les policies existantes.
-- ============================================================================
alter table public.profiles
  add column player_id uuid references public.players (id) on delete set null;

-- Un joueur ne peut être lié qu'à un seul compte.
create unique index profiles_player_id_unique_idx
  on public.profiles (player_id)
  where player_id is not null;

create function public.current_player_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select player_id from public.profiles where id = auth.uid();
$$;

-- Disponibilité : un joueur peut répondre pour lui-même (le staff garde par
-- ailleurs sa policy d'écriture existante — les deux coexistent).
create policy "availability_write_own"
  on public.availability_responses for all
  to authenticated
  using (player_id = public.current_player_id())
  with check (player_id = public.current_player_id());

-- Cotisations : un joueur voit uniquement ses propres paiements (le staff
-- garde sa policy de lecture club-wide existante).
create policy "payments_select_own"
  on public.payments for select
  to authenticated
  using (player_id = public.current_player_id());
