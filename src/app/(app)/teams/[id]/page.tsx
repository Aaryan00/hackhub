import Link from "next/link";
import { notFound } from "next/navigation";
import { Crown, Users } from "lucide-react";

import {
  DeleteTeamButton,
  JoinRequestActions,
  LeaveTeamButton,
  RemoveMemberButton,
  RequestToJoinButton,
  TeamStatusControl,
} from "@/components/teams/team-actions";
import { TeamStatusBadge } from "@/components/teams/team-status-badge";
import { VerifiedBadge } from "@/components/trust-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";

type MemberProfile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  linkedin_verified: boolean;
};

type MemberRow = { role: "admin" | "member"; profiles: MemberProfile };
type RequestRow = {
  id: string;
  message: string | null;
  created_at: string;
  profiles: MemberProfile;
};

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: team } = await supabase
    .from("teams")
    .select("*")
    .eq("id", id)
    .single();
  if (!team) notFound();

  const user = await getUser();

  const [{ data: memberData }, { data: requestData }, myRequestRes] =
    await Promise.all([
      supabase
        .from("team_members")
        .select(
          "role, profiles(id, username, full_name, avatar_url, linkedin_verified)",
        )
        .eq("team_id", id)
        .order("role", { ascending: true }),
      supabase
        .from("team_join_requests")
        .select(
          "id, message, created_at, profiles(id, username, full_name, avatar_url, linkedin_verified)",
        )
        .eq("team_id", id)
        .eq("status", "pending")
        .order("created_at", { ascending: true }),
      user
        ? supabase
            .from("team_join_requests")
            .select("status")
            .eq("team_id", id)
            .eq("profile_id", user.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  const members = (memberData ?? []) as unknown as MemberRow[];
  const requests = (requestData ?? []) as unknown as RequestRow[];
  const myRequest = (myRequestRes.data as { status?: string } | null) ?? null;

  const isAdmin = user?.id === team.admin_id;
  const isMember = members.some((m) => m.profiles.id === user?.id);
  const isFull = members.length >= team.max_members;

  const initials = team.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/teams" className="text-sm text-muted-foreground hover:underline">
        ← All teams
      </Link>

      <Card className="mt-4">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <Avatar className="size-16">
              <AvatarImage src={team.logo_url ?? undefined} />
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">{team.name}</h1>
                <TeamStatusBadge status={team.status} />
              </div>
              {team.event_name && (
                <p className="text-sm text-muted-foreground">
                  {team.event_name}
                </p>
              )}
              {team.description && (
                <p className="mt-3 text-sm leading-relaxed">{team.description}</p>
              )}

              {team.skills_needed.length > 0 && (
                <div className="mt-4">
                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                    Looking for
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {team.skills_needed.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Viewer actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {!user || isMember ? null : (
              <RequestToJoinButton
                teamId={team.id}
                disabled={isFull || !!myRequest}
                disabledLabel={
                  myRequest
                    ? myRequest.status === "pending"
                      ? "Request pending"
                      : myRequest.status === "approved"
                        ? "Approved"
                        : "Request declined"
                    : "Team is full"
                }
              />
            )}
            {isMember && !isAdmin && <LeaveTeamButton teamId={team.id} />}
          </div>
        </CardContent>
      </Card>

      {/* Admin: status + delete */}
      {isAdmin && (
        <Card className="mt-6">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
            <div>
              <p className="text-sm font-medium">Team status</p>
              <p className="text-xs text-muted-foreground">
                Update as your team progresses.
              </p>
            </div>
            <TeamStatusControl teamId={team.id} status={team.status} />
            <Separator className="w-full" />
            <DeleteTeamButton teamId={team.id} />
          </CardContent>
        </Card>
      )}

      {/* Admin: pending requests */}
      {isAdmin && requests.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-lg font-semibold tracking-tight">
            Join requests ({requests.length})
          </h2>
          <div className="space-y-3">
            {requests.map((req) => (
              <Card key={req.id}>
                <CardContent className="flex flex-wrap items-center gap-4 pt-6">
                  <MemberIdentity profile={req.profiles} />
                  {req.message && (
                    <p className="w-full text-sm text-muted-foreground sm:w-auto sm:flex-1">
                      “{req.message}”
                    </p>
                  )}
                  <div className="ml-auto">
                    <JoinRequestActions requestId={req.id} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Members */}
      <div className="mt-8">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold tracking-tight">
          <Users className="size-5" />
          Members ({members.length}/{team.max_members})
        </h2>
        <div className="space-y-3">
          {members.map((member) => (
            <Card key={member.profiles.id}>
              <CardContent className="flex items-center gap-4 pt-6">
                <MemberIdentity profile={member.profiles} />
                {member.role === "admin" && (
                  <Badge variant="outline" className="gap-1">
                    <Crown className="size-3.5 text-amber-500" /> Admin
                  </Badge>
                )}
                {isAdmin && member.profiles.id !== team.admin_id && (
                  <div className="ml-auto">
                    <RemoveMemberButton
                      teamId={team.id}
                      profileId={member.profiles.id}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function MemberIdentity({ profile }: { profile: MemberProfile }) {
  const initials = (profile.full_name ?? profile.username ?? "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Link
      href={`/u/${profile.username}`}
      className="flex items-center gap-3 hover:underline"
    >
      <Avatar className="size-10">
        <AvatarImage src={profile.avatar_url ?? undefined} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div>
        <div className="flex items-center gap-2">
          <span className="font-medium">{profile.full_name}</span>
          {profile.linkedin_verified && <VerifiedBadge className="scale-90" />}
        </div>
        <span className="text-xs text-muted-foreground">@{profile.username}</span>
      </div>
    </Link>
  );
}
