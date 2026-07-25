import Link from "next/link";
import { ArrowRight, Plus, Search, Users2 } from "lucide-react";

import { TeamCard } from "@/components/teams/team-card";
import { VerifiedBadge } from "@/components/trust-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Dashboard · HackHub" };

type TeamRow = {
  id: string;
  name: string;
  logo_url: string | null;
  description: string | null;
  skills_needed: string[];
  event_name: string | null;
  admin_id: string;
  status: "looking_for_members" | "building" | "submitted" | "winner" | "closed";
  max_members: number;
  created_at: string;
  updated_at: string;
  team_members: { count: number }[];
};

export default async function DashboardPage() {
  const profile = await getProfile();
  if (!profile) return null;

  const supabase = await createClient();

  const { data: memberRows } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("profile_id", profile.id);
  const teamIds = (memberRows ?? []).map((r) => r.team_id);

  const { data: myTeamsData } = teamIds.length
    ? await supabase
        .from("teams")
        .select("*, team_members(count)")
        .in("id", teamIds)
    : { data: [] };

  const myTeams = (myTeamsData ?? []) as unknown as TeamRow[];

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

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <ActionCard
          href="/builders"
          icon={Search}
          title="Find teammates"
          description="Search builders by skill, experience and location."
        />
        <ActionCard
          href="/teams"
          icon={Users2}
          title="Browse teams"
          description="Join a team that's looking for members, or start your own."
        />
      </div>

      {/* My teams */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">My teams</h2>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              render={<Link href="/teams/new" />}
            >
              <Plus className="size-4" /> New team
            </Button>
            <Button size="sm" variant="ghost" render={<Link href="/teams" />}>
              View all <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>

        {myTeams.length === 0 ? (
          <div className="rounded-lg border border-dashed py-12 text-center text-muted-foreground">
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
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myTeams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                memberCount={team.team_members[0]?.count ?? 0}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ActionCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <Link href={href}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex items-start gap-4 pt-6">
          <div className="rounded-lg bg-primary/10 p-2.5">
            <Icon className="size-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
