import { createClient } from "@/lib/supabase/server";
import type { Notification } from "@/lib/database.types";

export type NotificationSummary = {
  items: Notification[];
  unread: number;
};

/** Recent notifications + unread count for the current user. */
export async function getNotificationSummary(): Promise<NotificationSummary> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { items: [], unread: 0 };

  const [{ data: items }, { count }] = await Promise.all([
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("read", false),
  ]);

  return { items: (items ?? []) as Notification[], unread: count ?? 0 };
}
