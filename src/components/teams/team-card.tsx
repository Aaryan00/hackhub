import Link from "next/link";
import { Users } from "lucide-react";

import { TeamStatusBadge } from "@/components/teams/team-status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Team } from "@/lib/database.types";

export function TeamCard({
  team,
  memberCount,
  hackathonName,
}: {
  team: Team;
  memberCount: number;
  hackathonName?: string | null;
}) {
  const initials = team.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <Avatar className="size-11">
            <AvatarImage src={team.logo_url ?? undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <Link href={`/teams/${team.id}`}>
                <h3 className="truncate font-semibold tracking-tight hover:underline">
                  {team.name}
                </h3>
              </Link>
              <TeamStatusBadge status={team.status} />
            </div>
            {hackathonName && (
              <p className="truncate text-sm text-muted-foreground">
                {hackathonName}
              </p>
            )}
          </div>
        </div>

        {team.description && (
          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
            {team.description}
          </p>
        )}

        {team.skills_needed.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {team.skills_needed.slice(0, 5).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        )}

        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="size-3.5" />
          {memberCount} / {team.max_members} members
        </p>
      </CardContent>
    </Card>
  );
}
