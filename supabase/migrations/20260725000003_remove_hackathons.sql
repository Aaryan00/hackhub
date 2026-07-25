-- ============================================================================
-- HackHub — remove the hackathon feature and decouple teams.
-- Teams keep an optional free-text `event_name` instead of a hackathon link.
-- Apply via the Supabase SQL Editor.
-- ============================================================================

-- Decouple teams from hackathons.
alter table public.teams add column if not exists event_name text;
alter table public.teams drop column if exists hackathon_id;

-- Drop hackathon tables (RLS policies drop with them).
drop table if exists public.hackathon_saves;
drop table if exists public.hackathons cascade;

-- Drop enums that were only used by hackathons.
drop type if exists hackathon_mode;
drop type if exists difficulty;
