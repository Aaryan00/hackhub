-- ============================================================================
-- HackHub — connections ("add friend with a note") + accept/reject
-- Apply via the Supabase SQL Editor.
-- ============================================================================

create type connection_status as enum ('pending', 'accepted', 'rejected');

create table public.connections (
  id           uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  addressee_id uuid not null references public.profiles (id) on delete cascade,
  note         text,
  status       connection_status not null default 'pending',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);

create index connections_requester_idx on public.connections (requester_id);
create index connections_addressee_idx on public.connections (addressee_id);

create trigger connections_set_updated_at
  before update on public.connections
  for each row execute function public.set_updated_at();

alter table public.connections enable row level security;

-- Either party can see the connection.
create policy "connections_select" on public.connections
  for select to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- Only the requester creates the request.
create policy "connections_insert_own" on public.connections
  for insert to authenticated with check (auth.uid() = requester_id);

-- The addressee accepts/rejects; either party may otherwise update.
create policy "connections_update" on public.connections
  for update to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- Either party can remove the connection / cancel the request.
create policy "connections_delete" on public.connections
  for delete to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);
