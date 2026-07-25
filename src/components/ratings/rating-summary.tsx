import { Star } from "lucide-react";

import { RATING_CATEGORIES, type RatingCategory } from "@/lib/database.types";
import { cn } from "@/lib/utils";

const LABELS: Record<RatingCategory, string> = {
  communication: "Communication",
  coding: "Coding",
  reliability: "Reliability",
  collaboration: "Collaboration",
  ownership: "Ownership",
  technical_skills: "Technical skills",
};

type RatingRow = Record<RatingCategory, number>;

export function RatingSummary({ ratings }: { ratings: RatingRow[] }) {
  if (ratings.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No teammate ratings yet. Ratings appear once teammates rate each other.
      </p>
    );
  }

  const avg = (cat: RatingCategory) =>
    ratings.reduce((sum, r) => sum + r[cat], 0) / ratings.length;

  const categoryAverages = RATING_CATEGORIES.map((cat) => ({
    cat,
    value: avg(cat),
  }));
  const overall =
    categoryAverages.reduce((s, c) => s + c.value, 0) /
    categoryAverages.length;

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <span className="text-3xl font-bold">{overall.toFixed(1)}</span>
        <div>
          <Stars value={overall} />
          <p className="text-xs text-muted-foreground">
            from {ratings.length}{" "}
            {ratings.length === 1 ? "teammate" : "teammates"}
          </p>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {categoryAverages.map(({ cat, value }) => (
          <div key={cat} className="flex items-center gap-3">
            <span className="w-28 shrink-0 text-sm text-muted-foreground">
              {LABELS[cat]}
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-amber-400"
                style={{ width: `${(value / 5) * 100}%` }}
              />
            </div>
            <span className="w-8 text-right text-sm font-medium">
              {value.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            "size-4",
            n <= Math.round(value)
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/30",
          )}
        />
      ))}
    </div>
  );
}
