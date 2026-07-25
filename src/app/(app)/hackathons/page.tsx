import { HackathonCard } from "@/components/hackathons/hackathon-card";
import { HackathonFilters } from "@/components/hackathons/hackathon-filters";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Difficulty, HackathonMode } from "@/lib/database.types";

export const metadata = { title: "Hackathons · HackHub" };

export default async function HackathonsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    mode?: string;
    difficulty?: string;
    weekend?: string;
  }>;
}) {
  const { q, mode, difficulty, weekend } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("hackathons")
    .select("*")
    .order("start_date", { ascending: true });

  if (q) query = query.ilike("name", `%${q}%`);
  if (mode && mode !== "all")
    query = query.eq("mode", mode as HackathonMode);
  if (difficulty && difficulty !== "all")
    query = query.eq("difficulty", difficulty as Difficulty);
  if (weekend === "1") query = query.eq("is_weekend", true);

  const [{ data: hackathons }, user] = await Promise.all([query, getUser()]);

  let savedIds = new Set<string>();
  if (user) {
    const { data: saves } = await supabase
      .from("hackathon_saves")
      .select("hackathon_id")
      .eq("profile_id", user.id);
    savedIds = new Set((saves ?? []).map((s) => s.hackathon_id));
  }

  const list = hackathons ?? [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Hackathons</h1>
        <p className="text-muted-foreground">
          Discover hackathons, save the ones you like, and build a team.
        </p>
      </div>

      <HackathonFilters />

      <p className="mb-4 mt-6 text-sm text-muted-foreground">
        {list.length} {list.length === 1 ? "hackathon" : "hackathons"}
      </p>

      {list.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
          No hackathons match your filters.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((hackathon) => (
            <HackathonCard
              key={hackathon.id}
              hackathon={hackathon}
              saved={savedIds.has(hackathon.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
