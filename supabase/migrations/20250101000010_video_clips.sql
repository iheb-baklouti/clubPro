-- ============================================================================
-- ClubPro — Migration 10 : tagging vidéo simplifié (Étape 5)
-- ============================================================================

create type public.video_tag_type as enum ('but', 'occasion', 'faute', 'carton');

create table public.video_clips (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  video_url text not null,
  timestamp_seconds integer not null default 0,
  tag_type public.video_tag_type not null default 'occasion',
  description text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index video_clips_match_id_idx on public.video_clips (match_id);

alter table public.video_clips enable row level security;

create policy "video_clips_select_club"
  on public.video_clips for select
  to authenticated
  using (
    exists (
      select 1 from public.matches m
      join public.teams t on t.id = m.team_id
      where m.id = video_clips.match_id and t.club_id = public.current_club_id()
    )
  );

create policy "video_clips_write_staff"
  on public.video_clips for all
  to authenticated
  using (
    public.is_staff()
    and exists (
      select 1 from public.matches m
      join public.teams t on t.id = m.team_id
      where m.id = video_clips.match_id and t.club_id = public.current_club_id()
    )
  )
  with check (
    public.is_staff()
    and exists (
      select 1 from public.matches m
      join public.teams t on t.id = m.team_id
      where m.id = video_clips.match_id and t.club_id = public.current_club_id()
    )
  );
