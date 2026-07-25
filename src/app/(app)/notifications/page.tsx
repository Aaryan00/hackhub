import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { markAllNotificationsRead } from "@/lib/actions/notifications";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Notification } from "@/lib/database.types";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Notifications · HackHub" };

export default async function NotificationsPage() {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const items = (data ?? []) as Notification[];
  const hasUnread = items.some((n) => !n.read);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        {hasUnread && (
          <form action={markAllNotificationsRead}>
            <Button type="submit" variant="outline" size="sm">
              Mark all read
            </Button>
          </form>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
          No notifications yet. You&apos;ll hear about connection requests,
          comments, and posts that match your skills.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <Link key={n.id} href={n.link ?? "/notifications"}>
              <Card
                className={cn(
                  "transition-colors hover:bg-accent/50",
                  !n.read && "border-primary/30 bg-accent/40",
                )}
              >
                <CardContent className="flex items-start gap-3 pt-6">
                  {!n.read && (
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{n.title}</p>
                    {n.body && (
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {n.body}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {relativeTime(n.created_at)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
