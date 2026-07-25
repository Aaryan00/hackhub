"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { ExperienceLevel } from "@/lib/database.types";

export type ProfileFormState = { error?: string; success?: boolean };

const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  "student",
  "junior",
  "mid",
  "senior",
  "lead",
];

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key)?.toString().trim();
  return v && v.length ? v : null;
}

export async function saveProfile(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You are not signed in." };

  const { data: current } = await supabase
    .from("profiles")
    .select("linkedin_verified")
    .eq("id", user.id)
    .single();

  const full_name = str(formData, "full_name");
  const username = str(formData, "username")?.toLowerCase() ?? null;
  const linkedin_url = str(formData, "linkedin_url");
  const experienceRaw = str(formData, "experience_level");
  const experience_level = EXPERIENCE_LEVELS.includes(
    experienceRaw as ExperienceLevel,
  )
    ? (experienceRaw as ExperienceLevel)
    : null;

  const languages = (str(formData, "languages") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const skillIds = formData.getAll("skills").map(String).filter(Boolean);
  const intent = formData.get("intent")?.toString() ?? "save";

  // ---- validation ----
  if (!full_name) return { error: "Your name is required." };
  if (!username || !/^[a-z0-9_]{3,20}$/.test(username)) {
    return { error: "Username must be 3–20 characters: a–z, 0–9 or underscore." };
  }
  if (!current?.linkedin_verified && !linkedin_url) {
    return {
      error:
        "A LinkedIn profile URL is required (you didn't sign in with LinkedIn).",
    };
  }
  if (linkedin_url && !/linkedin\.com\//i.test(linkedin_url)) {
    return { error: "Enter a valid LinkedIn profile URL." };
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      full_name,
      username,
      bio: str(formData, "bio"),
      location: str(formData, "location"),
      timezone: str(formData, "timezone"),
      company: str(formData, "company"),
      college: str(formData, "college"),
      experience_level,
      github_url: str(formData, "github_url"),
      linkedin_url,
      portfolio_url: str(formData, "portfolio_url"),
      resume_url: str(formData, "resume_url"),
      avatar_url: str(formData, "avatar_url"),
      languages,
      onboarded: true,
    })
    .eq("id", user.id);

  if (updateError) {
    if (updateError.code === "23505") {
      return { error: "That username is already taken." };
    }
    return { error: updateError.message };
  }

  // Replace the skill set.
  await supabase.from("profile_skills").delete().eq("profile_id", user.id);
  if (skillIds.length) {
    const { error: skillError } = await supabase
      .from("profile_skills")
      .insert(skillIds.map((skill_id) => ({ profile_id: user.id, skill_id })));
    if (skillError) return { error: skillError.message };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/u/${username}`);

  if (intent === "onboard") redirect("/dashboard");
  return { success: true };
}
