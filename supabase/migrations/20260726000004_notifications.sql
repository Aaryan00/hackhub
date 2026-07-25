-- ============================================================================
-- HackHub — notifications + auto-generating triggers (incl. skill matching)
-- Notifications are created by SECURITY DEFINER triggers (which bypass RLS),
-- so users never insert them directly.
-- Apply via the Supabase SQL Editor.
-- ============================================================================

create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  actor_id   uuid references public.profiles (id) on delete set null,
  type       text not null,
  title      text not null,
  body       text,
  link       text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_idx
  on public.notifications (user_id, read, created_at desc);

alter table public.notifications enable row level security;

create policy "notifications_select_own" on public.notifications
  for select to authenticated using (auth.uid() = user_id);
create policy "notifications_update_own" on public.notifications
  for update to authenticated using (auth.uid() = user_id);
create policy "notifications_delete_own" on public.notifications
  for delete to authenticated using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Helper: a friendly display name for a profile.
-- ---------------------------------------------------------------------------
create or replace function public.display_name(uid uuid)
returns text language sql stable security definer set search_path = public as $$
  select coalesce(full_name, '@' || username, 'Someone')
  from public.profiles where id = uid;
$$;

-- ---------------------------------------------------------------------------
-- Connection request / accepted
-- ---------------------------------------------------------------------------
create or replace function public.tg_notify_connection_request()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (user_id, actor_id, type, title, body, link)
  values (
    new.addressee_id, new.requester_id, 'connection_request',
    public.display_name(new.requester_id) || ' sent you a connection request',
    new.note, '/network'
  );
  return new;
end; $$;

create trigger notify_connection_request
  after insert on public.connections
  for each row execute function public.tg_notify_connection_request();

create or replace function public.tg_notify_connection_accepted()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'accepted' and old.status is distinct from 'accepted' then
    insert into public.notifications (user_id, actor_id, type, title, link)
    values (
      new.requester_id, new.addressee_id, 'connection_accepted',
      public.display_name(new.addressee_id) || ' accepted your connection request',
      '/u/' || (select username from public.profiles where id = new.addressee_id)
    );
  end if;
  return new;
end; $$;

create trigger notify_connection_accepted
  after update on public.connections
  for each row execute function public.tg_notify_connection_accepted();

-- ---------------------------------------------------------------------------
-- Comment on your post
-- ---------------------------------------------------------------------------
create or replace function public.tg_notify_post_comment()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_author uuid; v_title text;
begin
  select author_id, title into v_author, v_title
  from public.posts where id = new.post_id;
  if v_author is not null and v_author <> new.author_id then
    insert into public.notifications (user_id, actor_id, type, title, body, link)
    values (
      v_author, new.author_id, 'post_comment',
      public.display_name(new.author_id) || ' commented on your post',
      v_title, '/posts/' || new.post_id
    );
  end if;
  return new;
end; $$;

create trigger notify_post_comment
  after insert on public.post_comments
  for each row execute function public.tg_notify_post_comment();

-- ---------------------------------------------------------------------------
-- Join request to a team you admin
-- ---------------------------------------------------------------------------
create or replace function public.tg_notify_join_request()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_admin uuid; v_team text;
begin
  select admin_id, name into v_admin, v_team
  from public.teams where id = new.team_id;
  if v_admin is not null and v_admin <> new.profile_id then
    insert into public.notifications (user_id, actor_id, type, title, body, link)
    values (
      v_admin, new.profile_id, 'join_request',
      public.display_name(new.profile_id) || ' asked to join ' || v_team,
      new.message, '/teams/' || new.team_id
    );
  end if;
  return new;
end; $$;

create trigger notify_join_request
  after insert on public.team_join_requests
  for each row execute function public.tg_notify_join_request();

-- ---------------------------------------------------------------------------
-- Skill matching: a new post / team asks for a skill you have
-- ---------------------------------------------------------------------------
create or replace function public.tg_notify_post_skill_match()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if array_length(new.skills_needed, 1) is null then return new; end if;
  insert into public.notifications (user_id, actor_id, type, title, body, link)
  select distinct ps.profile_id, new.author_id, 'post_skill_match',
    'A new post is looking for your skills', new.title, '/posts/' || new.id
  from public.profile_skills ps
  join public.skills s on s.id = ps.skill_id
  where ps.profile_id <> new.author_id
    and exists (
      select 1 from unnest(new.skills_needed) needed
      where lower(needed) = lower(s.name)
    );
  return new;
end; $$;

create trigger notify_post_skill_match
  after insert on public.posts
  for each row execute function public.tg_notify_post_skill_match();

create or replace function public.tg_notify_team_skill_match()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if array_length(new.skills_needed, 1) is null then return new; end if;
  insert into public.notifications (user_id, actor_id, type, title, body, link)
  select distinct ps.profile_id, new.admin_id, 'team_skill_match',
    'A new team is looking for your skills', new.name, '/teams/' || new.id
  from public.profile_skills ps
  join public.skills s on s.id = ps.skill_id
  where ps.profile_id <> new.admin_id
    and exists (
      select 1 from unnest(new.skills_needed) needed
      where lower(needed) = lower(s.name)
    );
  return new;
end; $$;

create trigger notify_team_skill_match
  after insert on public.teams
  for each row execute function public.tg_notify_team_skill_match();
