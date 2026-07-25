import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2,
  GraduationCap,
  Globe,
  Languages,
  MapPin,
  Trophy,
} from "lucide-react";

import { ProfileBadges } from "@/components/trust-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  GithubIcon,
  LinkedinIcon,
} from "@/components/brand-icons";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const EXPERIENCE_LABEL: Record<string, string> = {
  student: "Student",
  junior: "Junior",
  mid: "Mid-level",
  senior: "Senior",
  lead: "Lead / Staff",
};

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) notFound();

  const [{ data: skillRows }, user] = await Promise.all([
    supabase
      .from("profile_skills")
      .select("skills(id, name, category)")
      .eq("profile_id", profile.id),
    getUser(),
  ]);

  const skills = ((skillRows ?? []) as unknown as {
    skills: { id: string; name: string; category: string } | null;
  }[])
    .map((r) => r.skills)
    .filter(Boolean) as { id: string; name: string; category: string }[];

  const isOwn = user?.id === profile.id;
  const initials = (profile.full_name ?? username)
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <Avatar className="size-24">
              <AvatarImage src={profile.avatar_url ?? undefined} />
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">
                  {profile.full_name}
                </h1>
                <ProfileBadges profile={profile} />
              </div>
              <p className="text-muted-foreground">@{profile.username}</p>

              {profile.bio && <p className="mt-3">{profile.bio}</p>}

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                {profile.experience_level && (
                  <span className="flex items-center gap-1.5">
                    <Trophy className="size-4" />
                    {EXPERIENCE_LABEL[profile.experience_level]}
                  </span>
                )}
                {profile.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-4" />
                    {profile.location}
                  </span>
                )}
                {profile.company && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="size-4" />
                    {profile.company}
                  </span>
                )}
                {profile.college && (
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="size-4" />
                    {profile.college}
                  </span>
                )}
                {profile.languages.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Languages className="size-4" />
                    {profile.languages.join(", ")}
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {profile.linkedin_url && (
                  <SocialLink href={profile.linkedin_url}>
                    <LinkedinIcon className="size-4" /> LinkedIn
                  </SocialLink>
                )}
                {profile.github_url && (
                  <SocialLink href={profile.github_url}>
                    <GithubIcon className="size-4" /> GitHub
                  </SocialLink>
                )}
                {profile.portfolio_url && (
                  <SocialLink href={profile.portfolio_url}>
                    <Globe className="size-4" /> Portfolio
                  </SocialLink>
                )}
                {isOwn && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="ml-auto"
                    render={<Link href="/settings/profile" />}
                  >
                    Edit profile
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Platform score (Phase 2 will compute; shows the scaffold today) */}
          <div className="mt-6 flex items-center gap-2 rounded-lg border bg-muted/30 px-4 py-3">
            <Trophy className="size-4 text-amber-500" />
            <span className="text-sm">
              <span className="font-semibold">
                {profile.platform_score.toLocaleString()} XP
              </span>{" "}
              <span className="text-muted-foreground">Platform Score</span>
            </span>
          </div>

          {skills.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill.id} variant="secondary">
                    {skill.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SocialLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-accent"
    >
      {children}
    </a>
  );
}
