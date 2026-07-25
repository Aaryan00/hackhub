# HackHub

**Find teammates. Join hackathons. Build reputation.**

HackHub is a platform for hackathon builders — discover hackathons, find trusted
teammates, form teams, and grow a verified builder reputation. This repo is the
**Phase 1 MVP** (vertical slice).

## Tech stack

| Layer            | Choice                                              |
| ---------------- | --------------------------------------------------- |
| Framework        | Next.js 16 (App Router, TypeScript, Server Actions) |
| UI               | Tailwind CSS v4 + shadcn/ui (Base UI + Lucide)      |
| Database         | Supabase Postgres                                   |
| Auth             | Supabase Auth (Google · GitHub · LinkedIn OIDC)     |
| Storage          | Supabase Storage (avatars, team logos)              |
| Authorization    | Postgres Row-Level Security                         |
| Deployment       | Vercel (app) + Supabase Cloud (data)                |

## What's in this MVP

- **Auth** — Google / GitHub / LinkedIn login.
  - Sign in with **LinkedIn** → instant `✅ Verified` badge.
  - Sign in with Google/GitHub → a **LinkedIn profile URL is required** during
    onboarding before you can enter the app.
- **Profiles** — full builder profile (bio, skills, experience, links, avatar).
- **Hackathon directory** — browse, filter (mode / difficulty / weekend /
  search), view details, save.
- **Teams** — create teams, request to join, admin approve/reject, member
  management, team status.

Reputation/XP, challenges, leaderboards, community feed and AI features are
**Phase 2/3** — the database already has columns/room for them.

## Prerequisites

- **Node.js 20+** (Node 22 recommended — Supabase logs a deprecation warning on 20)
- **pnpm** (`npm i -g pnpm`)
- A free **Supabase** account: <https://supabase.com>

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Create a Supabase project

Create a project at <https://supabase.com/dashboard>. Then, from **Project
Settings → API**, copy the **Project URL**, the **anon** key and the
**service_role** key.

### 3. Apply the schema and seed data

In the Supabase dashboard, open **SQL Editor** and run, in order:

1. `supabase/migrations/20260725000001_init.sql` — tables, RLS, triggers
2. `supabase/migrations/20260725000002_storage.sql` — avatar / logo buckets
3. `supabase/seed.sql` — skills catalogue + sample hackathons

> Or, with the [Supabase CLI](https://supabase.com/docs/guides/cli):
> `supabase link --project-ref <ref> && supabase db push`, then run `seed.sql`.

### 4. Configure OAuth providers

In **Authentication → Providers**, enable and configure:

- **Google** — create an OAuth client in Google Cloud Console.
- **GitHub** — create an OAuth App in GitHub Developer settings.
- **LinkedIn (OIDC)** — create an app in the LinkedIn Developer Portal and add
  the "Sign In with LinkedIn using OpenID Connect" product.

For each provider set the **Authorized redirect URL** to the value Supabase
shows (it looks like `https://<ref>.supabase.co/auth/v1/callback`).

> **Note on verification:** LinkedIn's public API only returns name, email and
> photo. "LinkedIn Verified" here means *"authenticated a real LinkedIn
> account"* — not experience/education/connections, which aren't accessible to
> non-partner apps.

### 5. Environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 6. Run

```bash
pnpm dev
```

Open <http://localhost:3000>.

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import it at <https://vercel.com/new>.
3. Add the same env vars in the Vercel project settings (set
   `NEXT_PUBLIC_SITE_URL` to your production URL).
4. Add your production domain to the Supabase Auth **Redirect URLs** and to each
   OAuth provider's authorized redirect list.

## Project structure

```
src/
  app/
    (app)/            # authed routes (nav shell + onboarding guard)
      dashboard/
      hackathons/
      teams/
      settings/
      u/[username]/   # public profile
    auth/callback/    # OAuth code exchange
    login/
    onboarding/       # profile setup + mandatory-LinkedIn gate
  components/         # UI, profile, hackathon and team components
  lib/
    actions/          # server actions (auth, profile, hackathons, teams)
    supabase/         # browser / server clients + session proxy
  proxy.ts            # session refresh + route guard (Next 16 "proxy")
supabase/
  migrations/         # schema, RLS, storage
  seed.sql            # skills + sample hackathons
```

## Roadmap

- **Phase 1 (this MVP)** — auth, profiles, hackathon directory, teams.
- **Phase 2** — daily challenges, XP/streaks/badges, reputation & team ratings,
  leaderboards, AI teammate/idea suggestions, community feed.
- **Phase 3** — organizer & recruiter dashboards, team chat, AI team analyzer,
  premium subscriptions.