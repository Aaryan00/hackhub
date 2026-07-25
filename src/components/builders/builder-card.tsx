import Link from "next/link";
import { Building2, GraduationCap, MapPin } from "lucide-react";

import { VerifiedBadge } from "@/components/trust-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Profile } from "@/lib/database.types";

const EXPERIENCE_LABEL: Record<string, string> = {
  student: "Student",
  junior: "Junior",
  mid: "Mid-level",
  senior: "Senior",
  lead: "Lead / Staff",
};

export function BuilderCard({
  profile,
  skills,
}: {
  profile: Profile;
  skills: string[];
}) {
  const initials = (profile.full_name ?? profile.username ?? "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Link href={`/u/${profile.username}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Avatar className="size-12">
              <AvatarImage src={profile.avatar_url ?? undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-semibold tracking-tight">
                  {profile.full_name}
                </h3>
                {profile.linkedin_verified && (
                  <VerifiedBadge className="scale-90" />
                )}
              </div>
              <p className="truncate text-sm text-muted-foreground">
                @{profile.username}
                {profile.experience_level &&
                  ` · ${EXPERIENCE_LABEL[profile.experience_level]}`}
              </p>
            </div>
          </div>

          {profile.bio && (
            <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
              {profile.bio}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {profile.location && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                {profile.location}
              </span>
            )}
            {profile.company && (
              <span className="flex items-center gap-1">
                <Building2 className="size-3.5" />
                {profile.company}
              </span>
            )}
            {profile.college && (
              <span className="flex items-center gap-1">
                <GraduationCap className="size-3.5" />
                {profile.college}
              </span>
            )}
          </div>

          {skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {skills.slice(0, 5).map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {skills.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{skills.length - 5}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
