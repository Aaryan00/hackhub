import { Badge } from "@/components/ui/badge";
import type { TeamStatus } from "@/lib/database.types";
import { cn } from "@/lib/utils";

export const TEAM_STATUS_META: Record<
  TeamStatus,
  { label: string; className: string }
> = {
  looking_for_members: {
    label: "Looking for members",
    className:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  building: {
    label: "Building",
    className:
      "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  },
  submitted: {
    label: "Submitted",
    className:
      "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400",
  },
  winner: {
    label: "🏆 Winner",
    className:
      "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  closed: {
    label: "Closed",
    className: "border-muted bg-muted text-muted-foreground",
  },
};

export function TeamStatusBadge({ status }: { status: TeamStatus }) {
  const meta = TEAM_STATUS_META[status];
  return (
    <Badge variant="outline" className={cn(meta.className)}>
      {meta.label}
    </Badge>
  );
}
