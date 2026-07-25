import Link from "next/link";

import { CreateTeamForm } from "@/components/teams/create-team-form";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Create a team · HackHub" };

export default async function NewTeamPage({
  searchParams,
}: {
  searchParams: Promise<{ hackathon?: string }>;
}) {
  const { hackathon } = await searchParams;
  const supabase = await createClient();

  const { data: hackathons } = await supabase
    .from("hackathons")
    .select("id, name")
    .order("start_date", { ascending: true });

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/teams" className="text-sm text-muted-foreground hover:underline">
        ← All teams
      </Link>
      <h1 className="mb-1 mt-4 text-2xl font-bold tracking-tight">
        Create a team
      </h1>
      <p className="mb-8 text-muted-foreground">
        Start a team and let builders request to join.
      </p>
      <CreateTeamForm
        hackathons={hackathons ?? []}
        defaultHackathonId={hackathon}
      />
    </div>
  );
}
