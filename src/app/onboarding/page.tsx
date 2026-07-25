import Link from "next/link";
import { redirect } from "next/navigation";

import { ProfileForm } from "@/components/profile/profile-form";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Set up your profile · HackHub" };

export default async function OnboardingPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.onboarded) redirect("/dashboard");

  const supabase = await createClient();
  const [{ data: skills }, { data: selected }] = await Promise.all([
    supabase.from("skills").select("*").order("category").order("name"),
    supabase.from("profile_skills").select("skill_id").eq("profile_id", profile.id),
  ]);

  return (
    <main className="mx-auto min-h-dvh max-w-2xl px-4 py-10">
      <Link href="/" className="text-xl font-bold tracking-tight">
        Hack<span className="text-primary">Hub</span>
      </Link>

      <div className="mt-8 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Set up your builder profile
        </h1>
        <p className="mt-2 text-muted-foreground">
          This is how teammates, organizers and recruiters will find you. You
          can refine it anytime in settings.
        </p>
      </div>

      <ProfileForm
        profile={profile}
        skills={skills ?? []}
        selectedSkillIds={(selected ?? []).map((s) => s.skill_id)}
        intent="onboard"
      />
    </main>
  );
}
