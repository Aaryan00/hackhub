import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/database.types";

/** Returns the authenticated Supabase user, or null. */
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Returns the current user's profile row, or null if unauthenticated. */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data;
}

/**
 * True when the profile still needs the mandatory LinkedIn step:
 * a user who did NOT authenticate via LinkedIn must supply a LinkedIn URL
 * before entering the app.
 */
export function needsLinkedin(profile: Pick<Profile, "linkedin_verified" | "linkedin_url">) {
  return !profile.linkedin_verified && !profile.linkedin_url;
}
