import Link from "next/link";
import { Plus } from "lucide-react";

import { TeamCard } from "@/components/teams/team-card";
import { TeamFilters } from "@/components/teams/team-filters";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Teams · HackHub" };

type TeamWithJoins = {
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

export default async function TeamsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("teams")
    .select("*, team_members(count)")
    .order("created_at", { ascending: false });

  if (q) query = query.ilike("name", `%${q}%`);
  if (status) query = query.eq("status", status as TeamWithJoins["status"]);

  const { data } = await query;
  const teams = (data ?? []) as unknown as TeamWithJoins[];

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Teams</h1>
          <p className="text-muted-foreground">
            Find a team to join, or start your own.
          </p>
        </div>
        <Button render={<Link href="/teams/new" />}>
          <Plus className="size-4" /> New team
        </Button>
      </div>

      <TeamFilters />

      <p className="mb-4 mt-6 text-sm text-muted-foreground">
        {teams.length} {teams.length === 1 ? "team" : "teams"}
      </p>

      {teams.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
          No teams match your filters.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              memberCount={team.team_members[0]?.count ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
