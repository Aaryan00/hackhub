import Link from "next/link";

import { VerifiedBadge } from "@/components/trust-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type InlineProfile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  linkedin_verified: boolean;
};

export function ProfileInline({
  profile,
  size = "md",
  subtitle,
}: {
  profile: InlineProfile;
  size?: "sm" | "md";
  subtitle?: string;
}) {
  const initials = (profile.full_name ?? profile.username ?? "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const avatarSize = size === "sm" ? "size-8" : "size-10";

  return (
    <Link
      href={`/u/${profile.username}`}
      className="flex items-center gap-3 hover:opacity-90"
    >
      <Avatar className={avatarSize}>
        <AvatarImage src={profile.avatar_url ?? undefined} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="truncate font-medium">{profile.full_name}</span>
          {profile.linkedin_verified && <VerifiedBadge className="scale-90" />}
        </div>
        <span className="text-xs text-muted-foreground">
          {subtitle ?? `@${profile.username}`}
        </span>
      </div>
    </Link>
  );
}
