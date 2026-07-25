"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function toggleSaveHackathon(
  hackathonId: string,
): Promise<{ saved: boolean } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You are not signed in." };

  const { data: existing } = await supabase
    .from("hackathon_saves")
    .select("hackathon_id")
    .eq("profile_id", user.id)
    .eq("hackathon_id", hackathonId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("hackathon_saves")
      .delete()
      .eq("profile_id", user.id)
      .eq("hackathon_id", hackathonId);
  } else {
    const { error } = await supabase
      .from("hackathon_saves")
      .insert({ profile_id: user.id, hackathon_id: hackathonId });
    if (error) return { error: error.message };
  }

  revalidatePath("/hackathons");
  revalidatePath(`/hackathons/${hackathonId}`);
  revalidatePath("/dashboard");
  return { saved: !existing };
}
