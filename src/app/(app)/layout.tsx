import { redirect } from "next/navigation";

import { AppNav } from "@/components/app-nav";
import { getProfile } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (!profile.onboarded) redirect("/onboarding");

  return (
    <div className="min-h-dvh">
      <AppNav profile={profile} />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
