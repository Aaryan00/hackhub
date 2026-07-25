-- ============================================================================
-- HackHub — activity-based platform score + daily-login streak
-- Score reflects how active/collaborative a builder is; it is recomputed by
-- triggers whenever the underlying activity changes, and on daily activity.
-- Apply via the Supabase SQL Editor.
-- ============================================================================

alter table public.profiles add column if not exists last_active_on date;
alter table public.profiles add column if not exists login_streak integer not null default 0;
alter table public.profiles add column if not exists longest_streak integer not null default 0;

-- ---------------------------------------------------------------------------
-- Recompute a profile's platform score from their activity.
--   post            +10     accepted connection  +5
--   comment         +3      rating received      +4
--   team created    +20     login-streak day     +5
--   team joined     +10
-- ---------------------------------------------------------------------------
create or replace function public.recompute_platform_score(uid uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_posts int; v_comments int; v_admin int; v_member int;
  v_conns int; v_ratings int; v_streak int;
begin
  select count(*) into v_posts    from public.posts where author_id = uid;
  select count(*) into v_comments from public.post_comments where author_id = uid;
  select count(*) into v_admin    from public.teams where admin_id = uid;
  select count(*) into v_member   from public.team_members where profile_id = uid;
  select count(*) into v_conns    from public.connections
    where status = 'accepted' and (requester_id = uid or addressee_id = uid);
  select count(*) into v_ratings  from public.team_ratings where ratee_id = uid;
  select coalesce(login_streak, 0) into v_streak from public.profiles where id = uid;

  update public.profiles set platform_score =
    v_posts * 10 + v_comments * 3 + v_admin * 20 + v_member * 10
    + v_conns * 5 + v_ratings * 4 + v_streak * 5
  where id = uid;
end; $$;

-- ---------------------------------------------------------------------------
-- Record daily activity for the current user (updates streak, then score).
-- Idempotent within a day.
-- ---------------------------------------------------------------------------
create or replace function public.record_activity()
returns void language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  v_last date; v_streak int; v_longest int;
begin
  if uid is null then return; end if;

  select last_active_on, login_streak, longest_streak
    into v_last, v_streak, v_longest
  from public.profiles where id = uid;

  if v_last = current_date then
    return; -- already counted today
  elsif v_last = current_date - 1 then
    v_streak := coalesce(v_streak, 0) + 1;
  else
    v_streak := 1; -- first day or streak broken
  end if;

  update public.profiles set
    last_active_on = current_date,
    login_streak   = v_streak,
    longest_streak = greatest(coalesce(v_longest, 0), v_streak)
  where id = uid;

  perform public.recompute_platform_score(uid);
end; $$;

-- ---------------------------------------------------------------------------
-- Keep scores fresh as activity changes.
-- ---------------------------------------------------------------------------
create or replace function public.tg_score_post()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.recompute_platform_score(coalesce(new.author_id, old.author_id));
  return null;
end; $$;
create trigger score_post after insert or delete on public.posts
  for each row execute function public.tg_score_post();

create or replace function public.tg_score_comment()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.recompute_platform_score(coalesce(new.author_id, old.author_id));
  return null;
end; $$;
create trigger score_comment after insert or delete on public.post_comments
  for each row execute function public.tg_score_comment();

create or replace function public.tg_score_team()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.recompute_platform_score(coalesce(new.admin_id, old.admin_id));
  return null;
end; $$;
create trigger score_team after insert or delete on public.teams
  for each row execute function public.tg_score_team();

create or replace function public.tg_score_member()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.recompute_platform_score(coalesce(new.profile_id, old.profile_id));
  return null;
end; $$;
create trigger score_member after insert or delete on public.team_members
  for each row execute function public.tg_score_member();

create or replace function public.tg_score_connection()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.recompute_platform_score(coalesce(new.requester_id, old.requester_id));
  perform public.recompute_platform_score(coalesce(new.addressee_id, old.addressee_id));
  return null;
end; $$;
create trigger score_connection after insert or update or delete on public.connections
  for each row execute function public.tg_score_connection();

create or replace function public.tg_score_rating()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.recompute_platform_score(coalesce(new.ratee_id, old.ratee_id));
  return null;
end; $$;
create trigger score_rating after insert or delete on public.team_ratings
  for each row execute function public.tg_score_rating();
