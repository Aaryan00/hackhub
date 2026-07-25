const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const dayFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

/** "Aug 15, 2026" — accepts a YYYY-MM-DD string or null. */
export function formatDate(value: string | null): string {
  if (!value) return "—";
  return dateFmt.format(new Date(`${value}T00:00:00`));
}

/** "Aug 15 – Aug 17, 2026" for a start/end pair. */
export function formatDateRange(
  start: string | null,
  end: string | null,
): string {
  if (!start) return "Dates TBA";
  if (!end || end === start) return formatDate(start);
  return `${dayFmt.format(new Date(`${start}T00:00:00`))} – ${formatDate(end)}`;
}

/** "in 5 days" / "2 days ago" relative to today. */
export function daysUntil(value: string | null): string | null {
  if (!value) return null;
  const target = new Date(`${value}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff === 0) return "today";
  if (diff > 0) return `in ${diff} day${diff === 1 ? "" : "s"}`;
  return `${Math.abs(diff)} day${diff === -1 ? "" : "s"} ago`;
}
