import { BadgeCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { Profile } from "@/lib/database.types";
import { cn } from "@/lib/utils";

/** Small "LinkedIn Verified" pill shown next to a name. */
export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        className,
      )}
    >
      <BadgeCheck className="size-3.5" />
      Verified
    </Badge>
  );
}

/** GitHub-verified pill (Phase 2 will actually verify; column exists today). */
export function GithubVerifiedBadge() {
  return (
    <Badge variant="outline" className="gap-1">
      <BadgeCheck className="size-3.5" />
      GitHub
    </Badge>
  );
}

export function ProfileBadges({ profile }: { profile: Profile }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {profile.linkedin_verified && <VerifiedBadge />}
      {profile.github_verified && <GithubVerifiedBadge />}
    </div>
  );
}
