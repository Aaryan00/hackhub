"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { TeamStatus } from "@/lib/database.types";

export type TeamFormState = { error?: string };

const STATUSES: TeamStatus[] = [
  "looking_for_members",
  "building",
  "submitted",
  "winner",
  "closed",
];

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------
export async function createTeam(
  _prev: TeamFormState,
  formData: FormData,
): Promise<TeamFormState> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "You are not signed in." };

  const name = formData.get("name")?.toString().trim();
  if (!name) return { error: "Team name is required." };

  const description = formData.get("description")?.toString().trim() || null;
  const eventName = formData.get("event_name")?.toString().trim() || null;
  const maxMembers = Number(formData.get("max_members") ?? 4) || 4;
  const skillsNeeded = (formData.get("skills_needed")?.toString() ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const { data: team, error } = await supabase
    .from("teams")
    .insert({
      name,
      description,
      event_name: eventName,
      admin_id: user.id,
      skills_needed: skillsNeeded,
      max_members: Math.min(Math.max(maxMembers, 1), 10),
    })
    .select("id")
    .single();

  if (error || !team) return { error: error?.message ?? "Could not create team." };

  // Add the creator as the admin member.
  await supabase
    .from("team_members")
    .insert({ team_id: team.id, profile_id: user.id, role: "admin" });

  revalidatePath("/teams");
  redirect(`/teams/${team.id}`);
}

// ---------------------------------------------------------------------------
// Join requests
// ---------------------------------------------------------------------------
export async function requestToJoin(
  teamId: string,
  message: string,
): Promise<TeamFormState> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "You are not signed in." };

  const { error } = await supabase.from("team_join_requests").insert({
    team_id: teamId,
    profile_id: user.id,
    message: message.trim() || null,
  });

  if (error) {
    if (error.code === "23505") return { error: "You already requested to join." };
    return { error: error.message };
  }

  revalidatePath(`/teams/${teamId}`);
  return {};
}

export async function decideRequest(
  requestId: string,
  approve: boolean,
): Promise<TeamFormState> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "You are not signed in." };

  const { data: request } = await supabase
    .from("team_join_requests")
    .select("id, team_id, profile_id, status")
    .eq("id", requestId)
    .single();
  if (!request) return { error: "Request not found." };

  if (approve) {
    // Enforce capacity.
    const [{ count }, { data: team }] = await Promise.all([
      supabase
        .from("team_members")
        .select("*", { count: "exact", head: true })
        .eq("team_id", request.team_id),
      supabase.from("teams").select("max_members").eq("id", request.team_id).single(),
    ]);
    if (team && count !== null && count >= team.max_members) {
      return { error: "Team is already full." };
    }

    const { error: memberError } = await supabase
      .from("team_members")
      .insert({ team_id: request.team_id, profile_id: request.profile_id });
    if (memberError && memberError.code !== "23505") {
      return { error: memberError.message };
    }
  }

  const { error } = await supabase
    .from("team_join_requests")
    .update({ status: approve ? "approved" : "rejected" })
    .eq("id", requestId);
  if (error) return { error: error.message };

  revalidatePath(`/teams/${request.team_id}`);
  return {};
}

// ---------------------------------------------------------------------------
// Membership
// ---------------------------------------------------------------------------
export async function leaveTeam(teamId: string): Promise<TeamFormState> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "You are not signed in." };

  const { data: team } = await supabase
    .from("teams")
    .select("admin_id")
    .eq("id", teamId)
    .single();
  if (team?.admin_id === user.id) {
    return {
      error: "Transfer ownership or delete the team before leaving.",
    };
  }

  await supabase
    .from("team_members")
    .delete()
    .eq("team_id", teamId)
    .eq("profile_id", user.id);

  revalidatePath(`/teams/${teamId}`);
  redirect("/teams");
}

export async function removeMember(
  teamId: string,
  profileId: string,
): Promise<TeamFormState> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "You are not signed in." };

  const { data: team } = await supabase
    .from("teams")
    .select("admin_id")
    .eq("id", teamId)
    .single();
  if (team?.admin_id === profileId) {
    return { error: "You can't remove the team owner." };
  }

  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("team_id", teamId)
    .eq("profile_id", profileId);
  if (error) return { error: error.message };

  revalidatePath(`/teams/${teamId}`);
  return {};
}

export async function updateTeamStatus(
  teamId: string,
  status: string,
): Promise<TeamFormState> {
  if (!STATUSES.includes(status as TeamStatus)) {
    return { error: "Invalid status." };
  }
  const { supabase, user } = await requireUser();
  if (!user) return { error: "You are not signed in." };

  const { error } = await supabase
    .from("teams")
    .update({ status: status as TeamStatus })
    .eq("id", teamId);
  if (error) return { error: error.message };

  revalidatePath(`/teams/${teamId}`);
  return {};
}

export async function deleteTeam(teamId: string): Promise<TeamFormState> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "You are not signed in." };

  const { error } = await supabase.from("teams").delete().eq("id", teamId);
  if (error) return { error: error.message };

  revalidatePath("/teams");
  redirect("/teams");
}
