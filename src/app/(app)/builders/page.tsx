import { BuilderCard } from "@/components/builders/builder-card";
import { BuilderFilters } from "@/components/builders/builder-filters";
import { createClient } from "@/lib/supabase/server";
import type { ExperienceLevel, Profile } from "@/lib/database.types";

export const metadata = { title: "Builders · HackHub" };

// UUID that never matches, used to force an empty result set.
const NO_MATCH = "00000000-0000-0000-0000-000000000000";

export default async function BuildersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    skill?: string;
    experience?: string;
    verified?: string;
  }>;
}) {
  const { q, skill, experience, verified } = await searchParams;
  const supabase = await createClient();

  const { data: skillCatalogue } = await supabase
    .from("skills")
    .select("*")
    .order("category")
    .order("name");

  let query = supabase
    .from("profiles")
    .select("*")
    .eq("onboarded", true)
    .order("platform_score", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(60);

  if (q) {
    // Strip characters that would break the PostgREST or() filter.
    const safe = q.replace(/[,()]/g, " ").trim();
    if (safe) {
      query = query.or(
        [
          `full_name.ilike.%${safe}%`,
          `username.ilike.%${safe}%`,
          `company.ilike.%${safe}%`,
          `college.ilike.%${safe}%`,
          `location.ilike.%${safe}%`,
        ].join(","),
      );
    }
  }

  if (experience && experience !== "all") {
    query = query.eq("experience_level", experience as ExperienceLevel);
  }
  if (verified === "1") {
    query = query.eq("linkedin_verified", true);
  }

  // Skill filter: resolve slug → profile ids via profile_skills.
  if (skill && skill !== "all") {
    const { data: skillRow } = await supabase
      .from("skills")
      .select("id")
      .eq("slug", skill)
      .maybeSingle();
    if (skillRow) {
      const { data: ps } = await supabase
        .from("profile_skills")
        .select("profile_id")
        .eq("skill_id", skillRow.id);
      const ids = (ps ?? []).map((r) => r.profile_id);
      query = query.in("id", ids.length ? ids : [NO_MATCH]);
    } else {
      query = query.in("id", [NO_MATCH]);
    }
  }

  const { data: profileData } = await query;
  const profiles = (profileData ?? []) as Profile[];

  // Batch-load each profile's skills for the cards.
  const ids = profiles.map((p) => p.id);
  const { data: skillRows } = ids.length
    ? await supabase
        .from("profile_skills")
        .select("profile_id, skills(name)")
        .in("profile_id", ids)
    : { data: [] };

  const skillsByProfile = new Map<string, string[]>();
  for (const row of (skillRows ?? []) as unknown as {
    profile_id: string;
    skills: { name: string } | null;
  }[]) {
    if (!row.skills) continue;
    const arr = skillsByProfile.get(row.profile_id) ?? [];
    arr.push(row.skills.name);
    skillsByProfile.set(row.profile_id, arr);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Builders</h1>
        <p className="text-muted-foreground">
          Find teammates by skill, experience and location.
        </p>
      </div>

      <BuilderFilters skills={skillCatalogue ?? []} />

      <p className="mb-4 mt-6 text-sm text-muted-foreground">
        {profiles.length} {profiles.length === 1 ? "builder" : "builders"}
      </p>

      {profiles.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
          No builders match your filters.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <BuilderCard
              key={profile.id}
              profile={profile}
              skills={skillsByProfile.get(profile.id) ?? []}
            />
          ))}
        </div>
      )}
    </div>
  );
}
