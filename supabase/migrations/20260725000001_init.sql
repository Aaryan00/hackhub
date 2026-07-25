-- ============================================================================
-- HackHub — initial schema, functions, triggers and RLS policies
-- Apply via the Supabase SQL Editor or `supabase db push`.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type experience_level as enum ('student', 'junior', 'mid', 'senior', 'lead');
create type trust_tier       as enum ('bronze', 'silver', 'gold');
create type hackathon_mode    as enum ('online', 'offline', 'hybrid');
create type difficulty        as enum ('beginner', 'intermediate', 'advanced');
create type team_status       as enum ('looking_for_members', 'building', 'submitted', 'winner', 'closed');
create type team_member_role  as enum ('admin', 'member');
create type join_request_status as enum ('pending', 'approved', 'rejected');

-- ---------------------------------------------------------------------------
-- profiles  (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  username          text unique,
  full_name         text,
  avatar_url        text,
  bio               text,
  location          text,
  timezone          text,
  company           text,
  college           text,
  experience_level  experience_level,
  github_url        text,
  linkedin_url      text,
  portfolio_url     text,
  resume_url        text,
  languages         text[] not null default '{}',
  -- Trust / reputation (Phase 2 computes these; columns exist now so we
  -- never need a migration rewrite later).
  linkedin_verified boolean not null default false,
  github_verified   boolean not null default false,
  trust_tier        trust_tier,
  platform_score    integer not null default 0,
  onboarded         boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- skills  (seeded catalogue) + profile_skills (M:N)
-- ---------------------------------------------------------------------------
create table public.skills (
  id       uuid primary key default gen_random_uuid(),
  name     text not null unique,
  slug     text not null unique,
  category text not null default 'Other'
);

create table public.profile_skills (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  skill_id   uuid not null references public.skills (id) on delete cascade,
  primary key (profile_id, skill_id)
);

-- ---------------------------------------------------------------------------
-- hackathons + hackathon_saves
-- ---------------------------------------------------------------------------
create table public.hackathons (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null,
  organizer            text,
  description          text,
  prize_pool           text,
  registration_deadline date,
  start_date           date,
  end_date             date,
  theme                text,
  mode                 hackathon_mode not null default 'online',
  min_team_size        integer not null default 1,
  max_team_size        integer not null default 4,
  technologies         text[] not null default '{}',
  difficulty           difficulty not null default 'beginner',
  registration_link    text,
  banner_url           text,
  location             text,
  is_weekend           boolean not null default false,
  created_by           uuid references public.profiles (id) on delete set null,
  created_at           timestamptz not null default now()
);

create index hackathons_start_date_idx on public.hackathons (start_date);
create index hackathons_mode_idx on public.hackathons (mode);

create table public.hackathon_saves (
  profile_id   uuid not null references public.profiles (id) on delete cascade,
  hackathon_id uuid not null references public.hackathons (id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (profile_id, hackathon_id)
);

-- ---------------------------------------------------------------------------
-- teams + team_members + team_join_requests
-- ---------------------------------------------------------------------------
create table public.teams (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  logo_url      text,
  description   text,
  skills_needed text[] not null default '{}',
  hackathon_id  uuid references public.hackathons (id) on delete set null,
  admin_id      uuid not null references public.profiles (id) on delete cascade,
  status        team_status not null default 'looking_for_members',
  max_members   integer not null default 4,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index teams_hackathon_idx on public.teams (hackathon_id);
create index teams_status_idx on public.teams (status);

create table public.team_members (
  team_id    uuid not null references public.teams (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role       team_member_role not null default 'member',
  joined_at  timestamptz not null default now(),
  primary key (team_id, profile_id)
);

create table public.team_join_requests (
  id         uuid primary key default gen_random_uuid(),
  team_id    uuid not null references public.teams (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  message    text,
  status     join_request_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique (team_id, profile_id)
);

-- ---------------------------------------------------------------------------
-- Helper functions (SECURITY DEFINER to avoid RLS recursion on team_members)
-- ---------------------------------------------------------------------------
create or replace function public.is_team_member(_team_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.team_members
    where team_id = _team_id and profile_id = auth.uid()
  );
$$;

create or replace function public.is_team_admin(_team_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.teams
    where id = _team_id and admin_id = auth.uid()
  ) or exists (
    select 1 from public.team_members
    where team_id = _team_id and profile_id = auth.uid() and role = 'admin'
  );
$$;

-- Keep updated_at fresh.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger teams_set_updated_at
  before update on public.teams
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auto-create a profile row when a new auth user signs up.
-- Sets linkedin_verified / github_verified from the OAuth provider.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  provider text := new.raw_app_meta_data ->> 'provider';
begin
  insert into public.profiles (id, full_name, avatar_url, linkedin_verified, github_verified)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    ),
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture'
    ),
    provider = 'linkedin_oidc',
    provider = 'github'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row-Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles           enable row level security;
alter table public.skills             enable row level security;
alter table public.profile_skills     enable row level security;
alter table public.hackathons         enable row level security;
alter table public.hackathon_saves    enable row level security;
alter table public.teams              enable row level security;
alter table public.team_members       enable row level security;
alter table public.team_join_requests enable row level security;

-- profiles: readable by any signed-in user; editable only by owner.
create policy "profiles_select" on public.profiles
  for select to authenticated using (true);
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- skills: read-only catalogue (writes via service role / admin only).
create policy "skills_select" on public.skills
  for select to authenticated using (true);

-- profile_skills: public read; each user manages only their own rows.
create policy "profile_skills_select" on public.profile_skills
  for select to authenticated using (true);
create policy "profile_skills_insert_own" on public.profile_skills
  for insert to authenticated with check (auth.uid() = profile_id);
create policy "profile_skills_delete_own" on public.profile_skills
  for delete to authenticated using (auth.uid() = profile_id);

-- hackathons: public read; any authed user may add one and manage their own.
create policy "hackathons_select" on public.hackathons
  for select to authenticated using (true);
create policy "hackathons_insert" on public.hackathons
  for insert to authenticated with check (auth.uid() = created_by);
create policy "hackathons_update_own" on public.hackathons
  for update to authenticated using (auth.uid() = created_by);
create policy "hackathons_delete_own" on public.hackathons
  for delete to authenticated using (auth.uid() = created_by);

-- hackathon_saves: private to the owner.
create policy "hackathon_saves_select_own" on public.hackathon_saves
  for select to authenticated using (auth.uid() = profile_id);
create policy "hackathon_saves_insert_own" on public.hackathon_saves
  for insert to authenticated with check (auth.uid() = profile_id);
create policy "hackathon_saves_delete_own" on public.hackathon_saves
  for delete to authenticated using (auth.uid() = profile_id);

-- teams: public read; creator inserts; admins update/delete.
create policy "teams_select" on public.teams
  for select to authenticated using (true);
create policy "teams_insert" on public.teams
  for insert to authenticated with check (auth.uid() = admin_id);
create policy "teams_update_admin" on public.teams
  for update to authenticated using (public.is_team_admin(id));
create policy "teams_delete_admin" on public.teams
  for delete to authenticated using (public.is_team_admin(id));

-- team_members: public read; admin adds/updates; admin or self removes.
create policy "team_members_select" on public.team_members
  for select to authenticated using (true);
create policy "team_members_insert_admin" on public.team_members
  for insert to authenticated with check (public.is_team_admin(team_id));
create policy "team_members_update_admin" on public.team_members
  for update to authenticated using (public.is_team_admin(team_id));
create policy "team_members_delete" on public.team_members
  for delete to authenticated using (public.is_team_admin(team_id) or auth.uid() = profile_id);

-- team_join_requests: requester or admin reads; requester creates; admin decides.
create policy "join_requests_select" on public.team_join_requests
  for select to authenticated using (auth.uid() = profile_id or public.is_team_admin(team_id));
create policy "join_requests_insert_own" on public.team_join_requests
  for insert to authenticated with check (auth.uid() = profile_id);
create policy "join_requests_update_admin" on public.team_join_requests
  for update to authenticated using (public.is_team_admin(team_id));
create policy "join_requests_delete" on public.team_join_requests
  for delete to authenticated using (auth.uid() = profile_id or public.is_team_admin(team_id));
