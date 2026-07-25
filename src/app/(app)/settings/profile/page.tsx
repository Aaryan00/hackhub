import { redirect } from "next/navigation";

import { ProfileForm } from "@/components/profile/profile-form";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Edit profile · HackHub" };

export default async function EditProfilePage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const [{ data: skills }, { data: selected }] = await Promise.all([
    supabase.from("skills").select("*").order("category").order("name"),
    supabase.from("profile_skills").select("skill_id").eq("profile_id", profile.id),
  ]);

  return (
    <div className="max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold tracking-tight">Edit profile</h1>
      <p className="mb-8 text-muted-foreground">
        Keep your builder profile sharp.
      </p>
      <ProfileForm
        profile={profile}
        skills={skills ?? []}
        selectedSkillIds={(selected ?? []).map((s) => s.skill_id)}
        intent="save"
      />
    </div>
  );
}
