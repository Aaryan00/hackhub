-- ============================================================================
-- HackHub — community posts ("looking for a team") + comments
-- Apply via the Supabase SQL Editor.
-- ============================================================================

create table public.posts (
  id            uuid primary key default gen_random_uuid(),
  author_id     uuid not null references public.profiles (id) on delete cascade,
  title         text not null,
  body          text,
  event_name    text,
  skills_needed text[] not null default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index posts_created_at_idx on public.posts (created_at desc);
create index posts_author_idx on public.posts (author_id);

create table public.post_comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts (id) on delete cascade,
  author_id  uuid not null references public.profiles (id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);

create index post_comments_post_idx on public.post_comments (post_id, created_at);

create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.posts         enable row level security;
alter table public.post_comments enable row level security;

create policy "posts_select" on public.posts
  for select to authenticated using (true);
create policy "posts_insert_own" on public.posts
  for insert to authenticated with check (auth.uid() = author_id);
create policy "posts_update_own" on public.posts
  for update to authenticated using (auth.uid() = author_id);
create policy "posts_delete_own" on public.posts
  for delete to authenticated using (auth.uid() = author_id);

create policy "post_comments_select" on public.post_comments
  for select to authenticated using (true);
create policy "post_comments_insert_own" on public.post_comments
  for insert to authenticated with check (auth.uid() = author_id);
-- Comment author OR the post's author may delete a comment.
create policy "post_comments_delete" on public.post_comments
  for delete to authenticated using (
    auth.uid() = author_id
    or auth.uid() = (select author_id from public.posts where id = post_id)
  );
