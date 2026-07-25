-- ============================================================================
-- HackHub — teammate ratings (only teammates can rate each other)
-- Six categories, each 1–5. Apply via the Supabase SQL Editor.
-- ============================================================================

create table public.team_ratings (
  id               uuid primary key default gen_random_uuid(),
  rater_id         uuid not null references public.profiles (id) on delete cascade,
  ratee_id         uuid not null references public.profiles (id) on delete cascade,
  team_id          uuid not null references public.teams (id) on delete cascade,
  communication    smallint not null check (communication between 1 and 5),
  coding           smallint not null check (coding between 1 and 5),
  reliability      smallint not null check (reliability between 1 and 5),
  collaboration    smallint not null check (collaboration between 1 and 5),
  ownership        smallint not null check (ownership between 1 and 5),
  technical_skills smallint not null check (technical_skills between 1 and 5),
  comment          text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (rater_id, ratee_id, team_id),
  check (rater_id <> ratee_id)
);

create index team_ratings_ratee_idx on public.team_ratings (ratee_id);

create trigger team_ratings_set_updated_at
  before update on public.team_ratings
  for each row execute function public.set_updated_at();

alter table public.team_ratings enable row level security;

-- Ratings are public (needed to compute a builder's average).
create policy "team_ratings_select" on public.team_ratings
  for select to authenticated using (true);

-- You can only rate someone in a team you belong to.
create policy "team_ratings_insert" on public.team_ratings
  for insert to authenticated
  with check (auth.uid() = rater_id and public.is_team_member(team_id));

create policy "team_ratings_update_own" on public.team_ratings
  for update to authenticated using (auth.uid() = rater_id);

create policy "team_ratings_delete_own" on public.team_ratings
  for delete to authenticated using (auth.uid() = rater_id);
