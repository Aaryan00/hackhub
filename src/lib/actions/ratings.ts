"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type RatingInput = {
  teamId: string;
  rateeId: string;
  communication: number;
  coding: number;
  reliability: number;
  collaboration: number;
  ownership: number;
  technical_skills: number;
  comment?: string;
};

const inRange = (n: number) => Number.isInteger(n) && n >= 1 && n <= 5;

export async function submitRating(
  input: RatingInput,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You are not signed in." };
  if (user.id === input.rateeId)
    return { error: "You can't rate yourself." };

  const scores = [
    input.communication,
    input.coding,
    input.reliability,
    input.collaboration,
    input.ownership,
    input.technical_skills,
  ];
  if (!scores.every(inRange)) {
    return { error: "Please give every category a rating from 1 to 5." };
  }

  // The ratee must be a member of the same team.
  const { data: rateeMembership } = await supabase
    .from("team_members")
    .select("profile_id")
    .eq("team_id", input.teamId)
    .eq("profile_id", input.rateeId)
    .maybeSingle();
  if (!rateeMembership) {
    return { error: "You can only rate members of your own team." };
  }

  const { error } = await supabase.from("team_ratings").upsert(
    {
      rater_id: user.id,
      ratee_id: input.rateeId,
      team_id: input.teamId,
      communication: input.communication,
      coding: input.coding,
      reliability: input.reliability,
      collaboration: input.collaboration,
      ownership: input.ownership,
      technical_skills: input.technical_skills,
      comment: input.comment?.trim() || null,
    },
    { onConflict: "rater_id,ratee_id,team_id" },
  );
  if (error) return { error: error.message };

  revalidatePath(`/teams/${input.teamId}`);
  return {};
}
