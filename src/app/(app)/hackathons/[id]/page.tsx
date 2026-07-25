import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  ExternalLink,
  MapPin,
  Trophy,
  Users,
} from "lucide-react";

import { SaveHackathonButton } from "@/components/hackathons/save-button";
import { TeamCard } from "@/components/teams/team-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { daysUntil, formatDate, formatDateRange } from "@/lib/format";

export default async function HackathonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: hackathon } = await supabase
    .from("hackathons")
    .select("*")
    .eq("id", id)
    .single();

  if (!hackathon) notFound();

  const user = await getUser();

  const [{ data: saveRow }, { data: teams }] = await Promise.all([
    user
      ? supabase
          .from("hackathon_saves")
          .select("hackathon_id")
          .eq("profile_id", user.id)
          .eq("hackathon_id", id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("teams")
      .select("*, team_members(count)")
      .eq("hackathon_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const deadline = daysUntil(hackathon.registration_deadline);

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/hackathons"
        className="text-sm text-muted-foreground hover:underline"
      >
        ← All hackathons
      </Link>

      <Card className="mt-4">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {hackathon.mode}
            </Badge>
            {hackathon.theme && <Badge variant="secondary">{hackathon.theme}</Badge>}
            <Badge variant="outline" className="capitalize">
              {hackathon.difficulty}
            </Badge>
            {hackathon.is_weekend && <Badge variant="secondary">Weekend</Badge>}
          </div>

          <div className="mt-3 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {hackathon.name}
              </h1>
              {hackathon.organizer && (
                <p className="text-muted-foreground">by {hackathon.organizer}</p>
              )}
            </div>
            <SaveHackathonButton
              hackathonId={hackathon.id}
              initialSaved={!!saveRow}
              variant="full"
            />
          </div>

          {hackathon.description && (
            <p className="mt-4 text-sm leading-relaxed">{hackathon.description}</p>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Detail icon={CalendarDays} label="Dates">
              {formatDateRange(hackathon.start_date, hackathon.end_date)}
            </Detail>
            <Detail icon={CalendarDays} label="Registration deadline">
              {formatDate(hackathon.registration_deadline)}
              {deadline && (
                <span className="text-muted-foreground"> ({deadline})</span>
              )}
            </Detail>
            {hackathon.prize_pool && (
              <Detail icon={Trophy} label="Prize pool">
                {hackathon.prize_pool}
              </Detail>
            )}
            <Detail icon={Users} label="Team size">
              {hackathon.min_team_size}–{hackathon.max_team_size} members
            </Detail>
            {hackathon.location && (
              <Detail icon={MapPin} label="Location">
                {hackathon.location}
              </Detail>
            )}
          </div>

          {hackathon.technologies.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-medium text-muted-foreground">
                Technologies
              </p>
              <div className="flex flex-wrap gap-2">
                {hackathon.technologies.map((t) => (
                  <Badge key={t} variant="secondary">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            {hackathon.registration_link && (
              <Button
                render={
                  <a
                    href={hackathon.registration_link}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                Register <ExternalLink className="size-4" />
              </Button>
            )}
            <Button
              variant="outline"
              render={<Link href={`/teams/new?hackathon=${hackathon.id}`} />}
            >
              Create a team
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">
            Teams looking for members
          </h2>
        </div>
        {!teams || teams.length === 0 ? (
          <div className="rounded-lg border border-dashed py-12 text-center text-muted-foreground">
            No teams yet. Be the first to{" "}
            <Link
              href={`/teams/new?hackathon=${hackathon.id}`}
              className="font-medium text-primary hover:underline"
            >
              create one
            </Link>
            .
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                memberCount={
                  (team.team_members as unknown as { count: number }[])[0]
                    ?.count ?? 0
                }
                hackathonName={hackathon.name}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-4 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{children}</p>
      </div>
    </div>
  );
}
