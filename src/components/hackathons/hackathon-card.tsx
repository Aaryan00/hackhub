import Link from "next/link";
import { CalendarDays, MapPin, Trophy, Users } from "lucide-react";

import { SaveHackathonButton } from "@/components/hackathons/save-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Hackathon } from "@/lib/database.types";
import { daysUntil, formatDateRange } from "@/lib/format";
import { cn } from "@/lib/utils";

const MODE_STYLES: Record<string, string> = {
  online: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30",
  offline:
    "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/30",
  hybrid:
    "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
};

export function HackathonCard({
  hackathon,
  saved,
}: {
  hackathon: Hackathon;
  saved: boolean;
}) {
  const deadline = daysUntil(hackathon.registration_deadline);

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={cn("capitalize", MODE_STYLES[hackathon.mode])}>
              {hackathon.mode}
            </Badge>
            {hackathon.theme && <Badge variant="secondary">{hackathon.theme}</Badge>}
            <Badge variant="outline" className="capitalize">
              {hackathon.difficulty}
            </Badge>
          </div>
          <SaveHackathonButton hackathonId={hackathon.id} initialSaved={saved} />
        </div>

        <Link href={`/hackathons/${hackathon.id}`} className="mt-3 block">
          <h3 className="text-lg font-semibold tracking-tight hover:underline">
            {hackathon.name}
          </h3>
        </Link>
        {hackathon.organizer && (
          <p className="text-sm text-muted-foreground">by {hackathon.organizer}</p>
        )}

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-4" />
            {formatDateRange(hackathon.start_date, hackathon.end_date)}
          </span>
          {hackathon.prize_pool && (
            <span className="flex items-center gap-1.5">
              <Trophy className="size-4" />
              {hackathon.prize_pool}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Users className="size-4" />
            {hackathon.min_team_size}–{hackathon.max_team_size}
          </span>
          {hackathon.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" />
              {hackathon.location}
            </span>
          )}
        </div>

        {deadline && (
          <p className="mt-3 text-xs font-medium text-muted-foreground">
            Registration deadline {deadline}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
