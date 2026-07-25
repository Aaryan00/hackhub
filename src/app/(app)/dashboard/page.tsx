import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";

import { HackathonCard } from "@/components/hackathons/hackathon-card";
import { TeamCard } from "@/components/teams/team-card";
import { VerifiedBadge } from "@/components/trust-badge";
import { Button } from "@/components/ui/button";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Hackathon } from "@/lib/database.types";

export const metadata = { title: "Dashboard · HackHub" };

type TeamRow = {
  id: string;
  name: string;
  logo_url: string | null;
  description: string | null;
  skills_needed: string[];
  hackathon_id: string | null;
  admin_id: string;
  status: "looking_for_members" | "building" | "submitted" | "winner" | "closed";
  max_members: number;
  created_at: string;
  updated_at: string;
  hackathons: { name: string } | null;
  team_members: { count: number }[];
};

export default async function DashboardPage() {
  const profile = await getProfile();
  if (!profile) return null;

  const supabase = await createClient();

  // Teams I'm on.
  const { data: memberRows } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("profile_id", profile.id);
  const teamIds = (memberRows ?? []).map((r) => r.team_id);

  const [{ data: myTeamsData }, { data: savedRows }, { data: upcomingData }] =
    await Promise.all([
      teamIds.length
        ? supabase
            .from("teams")
            .select("*, hackathons(name), team_members(count)")
            .in("id", teamIds)
        : Promise.resolve({ data: [] }),
      supabase
        .from("hackathon_saves")
        .select("hackathon_id, hackathons(*)")
        .eq("profile_id", profile.id),
      supabase
        .from("hackathons")
        .select("*")
        .order("start_date", { ascending: true })
        .limit(4),
    ]);

  const myTeams = (myTeamsData ?? []) as unknown as TeamRow[];
  const savedHackathons = (savedRows ?? [])
    .map((r) => r.hackathons as unknown as Hackathon)
    .filter(Boolean);
  const savedIds = new Set(savedHackathons.map((h) => h.id));
  const upcoming = (upcomingData ?? []) as Hackathon[];

  return (
    <div className="space-y-10">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, {profile.full_name?.split(" ")[0] ?? "builder"} 👋
          </h1>
          {profile.linkedin_verified && <VerifiedBadge />}
        </div>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s what&apos;s happening. Ready to build something?
        </p>
      </div>

      {/* My teams */}
      <Section
        title="My teams"
        href="/teams"
        action={
          <Button
            size="sm"
            variant="outline"
            render={<Link href="/teams/new" />}
          >
            <Plus className="size-4" /> New team
          </Button>
        }
      >
        {myTeams.length === 0 ? (
          <EmptyState>
            You&apos;re not on a team yet.{" "}
            <Link href="/teams" className="font-medium text-primary hover:underline">
              Find one
            </Link>{" "}
            or{" "}
            <Link
              href="/teams/new"
              className="font-medium text-primary hover:underline"
            >
              create your own
            </Link>
            .
          </EmptyState>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myTeams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                memberCount={team.team_members[0]?.count ?? 0}
                hackathonName={team.hackathons?.name}
              />
            ))}
          </div>
        )}
      </Section>

      {/* Saved hackathons */}
      {savedHackathons.length > 0 && (
        <Section title="Saved hackathons" href="/hackathons">
          <div className="grid gap-4 md:grid-cols-2">
            {savedHackathons.map((h) => (
              <HackathonCard key={h.id} hackathon={h} saved />
            ))}
          </div>
        </Section>
      )}

      {/* Upcoming hackathons */}
      <Section title="Upcoming hackathons" href="/hackathons">
        {upcoming.length === 0 ? (
          <EmptyState>No hackathons yet — check back soon.</EmptyState>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {upcoming.map((h) => (
              <HackathonCard
                key={h.id}
                hackathon={h}
                saved={savedIds.has(h.id)}
              />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({
  title,
  href,
  action,
  children,
}: {
  title: string;
  href: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <div className="flex items-center gap-2">
          {action}
          <Button size="sm" variant="ghost" render={<Link href={href} />}>
            View all <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
      {children}
    </section>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed py-12 text-center text-muted-foreground">
      {children}
    </div>
  );
}
