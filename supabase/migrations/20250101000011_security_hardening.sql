-- ============================================================================
-- ClubPro — Migration 11 : durcissement sécurité (revue de code)
--
-- 1. profiles.email protégé par le même déclencheur anti-escalade que
--    role/club_id (un utilisateur ne pouvait auparavant pas changer son
--    role/club_id lui-même, mais POUVAIT réécrire son email affiché dans
--    l'annuaire "Utilisateurs & rôles").
-- 2. Nouveau rôle fonctionnel is_coach_or_manager() (coach/direction/admin,
--    à l'exclusion de staff_medical) : le staff médical n'a plus de droit
--    d'écriture sur les équipes, joueurs, matchs, convocations, disponibilité,
--    stats, entraînements, présence, exercices, séances et vidéos — son rôle
--    reste "vue globale" (lecture) + futur module blessures (v2).
-- 3. La suppression d'une tâche est réservée à la direction/admin (la mise à
--    jour de statut reste ouverte à tout le staff, usage collaboratif normal).
-- ============================================================================

create or replace function public.prevent_self_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;

  if (
    new.role is distinct from old.role
    or new.club_id is distinct from old.club_id
    or new.email is distinct from old.email
  ) and not public.is_manager() then
    raise exception 'Seuls la direction ou un administrateur peuvent modifier le rôle, le club ou l''email.';
  end if;

  return new;
end;
$$;

create function public.is_coach_or_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role() in ('coach', 'direction', 'admin');
$$;

-- ----------------------------------------------------------------------------
-- teams / players
-- ----------------------------------------------------------------------------
drop policy "teams_write_staff" on public.teams;
create policy "teams_write_coach_manager"
  on public.teams for all
  to authenticated
  using (club_id = public.current_club_id() and public.is_coach_or_manager())
  with check (club_id = public.current_club_id() and public.is_coach_or_manager());

drop policy "players_write_staff" on public.players;
create policy "players_write_coach_manager"
  on public.players for all
  to authenticated
  using (
    public.is_coach_or_manager()
    and exists (
      select 1 from public.teams t
      where t.id = players.team_id and t.club_id = public.current_club_id()
    )
  )
  with check (
    public.is_coach_or_manager()
    and exists (
      select 1 from public.teams t
      where t.id = players.team_id and t.club_id = public.current_club_id()
    )
  );

-- ----------------------------------------------------------------------------
-- matches / match_call_ups / availability_responses / player_stats
-- ----------------------------------------------------------------------------
drop policy "matches_write_staff" on public.matches;
create policy "matches_write_coach_manager"
  on public.matches for all
  to authenticated
  using (
    public.is_coach_or_manager()
    and exists (
      select 1 from public.teams t
      where t.id = matches.team_id and t.club_id = public.current_club_id()
    )
  )
  with check (
    public.is_coach_or_manager()
    and exists (
      select 1 from public.teams t
      where t.id = matches.team_id and t.club_id = public.current_club_id()
    )
  );

drop policy "match_call_ups_write_staff" on public.match_call_ups;
create policy "match_call_ups_write_coach_manager"
  on public.match_call_ups for all
  to authenticated
  using (
    public.is_coach_or_manager()
    and exists (
      select 1 from public.matches m
      join public.teams t on t.id = m.team_id
      where m.id = match_call_ups.match_id and t.club_id = public.current_club_id()
    )
  )
  with check (
    public.is_coach_or_manager()
    and exists (
      select 1 from public.matches m
      join public.teams t on t.id = m.team_id
      where m.id = match_call_ups.match_id and t.club_id = public.current_club_id()
    )
  );

drop policy "availability_write_staff" on public.availability_responses;
create policy "availability_write_coach_manager"
  on public.availability_responses for all
  to authenticated
  using (
    public.is_coach_or_manager()
    and exists (
      select 1 from public.players p
      join public.teams t on t.id = p.team_id
      where p.id = availability_responses.player_id and t.club_id = public.current_club_id()
    )
  )
  with check (
    public.is_coach_or_manager()
    and exists (
      select 1 from public.players p
      join public.teams t on t.id = p.team_id
      where p.id = availability_responses.player_id and t.club_id = public.current_club_id()
    )
  );

drop policy "player_stats_write_staff" on public.player_stats;
create policy "player_stats_write_coach_manager"
  on public.player_stats for all
  to authenticated
  using (
    public.is_coach_or_manager()
    and exists (
      select 1 from public.players p
      join public.teams t on t.id = p.team_id
      where p.id = player_stats.player_id and t.club_id = public.current_club_id()
    )
  )
  with check (
    public.is_coach_or_manager()
    and exists (
      select 1 from public.players p
      join public.teams t on t.id = p.team_id
      where p.id = player_stats.player_id and t.club_id = public.current_club_id()
    )
  );

-- ----------------------------------------------------------------------------
-- trainings / training_attendance / drills / training_exercises
-- ----------------------------------------------------------------------------
drop policy "trainings_write_staff" on public.trainings;
create policy "trainings_write_coach_manager"
  on public.trainings for all
  to authenticated
  using (
    public.is_coach_or_manager()
    and exists (
      select 1 from public.teams t
      where t.id = trainings.team_id and t.club_id = public.current_club_id()
    )
  )
  with check (
    public.is_coach_or_manager()
    and exists (
      select 1 from public.teams t
      where t.id = trainings.team_id and t.club_id = public.current_club_id()
    )
  );

drop policy "training_attendance_write_staff" on public.training_attendance;
create policy "training_attendance_write_coach_manager"
  on public.training_attendance for all
  to authenticated
  using (
    public.is_coach_or_manager()
    and exists (
      select 1 from public.trainings tr
      join public.teams t on t.id = tr.team_id
      where tr.id = training_attendance.training_id and t.club_id = public.current_club_id()
    )
  )
  with check (
    public.is_coach_or_manager()
    and exists (
      select 1 from public.trainings tr
      join public.teams t on t.id = tr.team_id
      where tr.id = training_attendance.training_id and t.club_id = public.current_club_id()
    )
  );

drop policy "drills_write_staff" on public.drills;
create policy "drills_write_coach_manager"
  on public.drills for all
  to authenticated
  using (club_id = public.current_club_id() and public.is_coach_or_manager())
  with check (club_id = public.current_club_id() and public.is_coach_or_manager());

drop policy "training_exercises_write_staff" on public.training_exercises;
create policy "training_exercises_write_coach_manager"
  on public.training_exercises for all
  to authenticated
  using (
    public.is_coach_or_manager()
    and exists (
      select 1 from public.trainings tr
      join public.teams t on t.id = tr.team_id
      where tr.id = training_exercises.training_id and t.club_id = public.current_club_id()
    )
  )
  with check (
    public.is_coach_or_manager()
    and exists (
      select 1 from public.trainings tr
      join public.teams t on t.id = tr.team_id
      where tr.id = training_exercises.training_id and t.club_id = public.current_club_id()
    )
  );

-- ----------------------------------------------------------------------------
-- video_clips
-- ----------------------------------------------------------------------------
drop policy "video_clips_write_staff" on public.video_clips;
create policy "video_clips_write_coach_manager"
  on public.video_clips for all
  to authenticated
  using (
    public.is_coach_or_manager()
    and exists (
      select 1 from public.matches m
      join public.teams t on t.id = m.team_id
      where m.id = video_clips.match_id and t.club_id = public.current_club_id()
    )
  )
  with check (
    public.is_coach_or_manager()
    and exists (
      select 1 from public.matches m
      join public.teams t on t.id = m.team_id
      where m.id = video_clips.match_id and t.club_id = public.current_club_id()
    )
  );

-- ----------------------------------------------------------------------------
-- tasks — la suppression est réservée à la direction/admin ; la création et
-- la mise à jour de statut restent ouvertes à tout le staff (usage collectif).
-- ----------------------------------------------------------------------------
drop policy "tasks_write_staff" on public.tasks;

create policy "tasks_insert_staff"
  on public.tasks for insert
  to authenticated
  with check (club_id = public.current_club_id() and public.is_staff());

create policy "tasks_update_staff"
  on public.tasks for update
  to authenticated
  using (club_id = public.current_club_id() and public.is_staff())
  with check (club_id = public.current_club_id() and public.is_staff());

create policy "tasks_delete_managers"
  on public.tasks for delete
  to authenticated
  using (club_id = public.current_club_id() and public.is_manager());
