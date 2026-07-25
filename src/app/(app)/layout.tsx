import { redirect } from "next/navigation";

import { AppNav } from "@/components/app-nav";
import { getProfile } from "@/lib/auth";
import { getNotificationSummary } from "@/lib/notifications";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (!profile.onboarded) redirect("/onboarding");

  // Record a daily "login" for the streak (idempotent per day; only calls the
  // DB when we haven't already recorded today).
  const today = new Date().toISOString().slice(0, 10);
  if (profile.last_active_on !== today) {
    const supabase = await createClient();
    await supabase.rpc("record_activity");
  }

  const notifications = await getNotificationSummary();

  return (
    <div className="min-h-dvh">
      <AppNav profile={profile} notifications={notifications} />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
