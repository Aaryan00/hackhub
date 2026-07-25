"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { AvatarUpload } from "@/components/profile/avatar-upload";
import { SkillPicker } from "@/components/profile/skill-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveProfile, type ProfileFormState } from "@/lib/actions/profile";
import type { Profile, Skill } from "@/lib/database.types";

function SubmitButton({ intent }: { intent: "onboard" | "save" }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending
        ? "Saving…"
        : intent === "onboard"
          ? "Complete profile"
          : "Save changes"}
    </Button>
  );
}

export function ProfileForm({
  profile,
  skills,
  selectedSkillIds,
  intent,
}: {
  profile: Profile;
  skills: Skill[];
  selectedSkillIds: string[];
  intent: "onboard" | "save";
}) {
  const [state, formAction] = useActionState<ProfileFormState, FormData>(
    saveProfile,
    {},
  );

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) toast.success("Profile saved.");
  }, [state]);

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="intent" value={intent} />

      {/* Verification status */}
      {profile.linkedin_verified ? (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm">
          <CheckCircle2 className="size-4 text-emerald-600" />
          <span>
            <span className="font-medium">LinkedIn Verified.</span> You signed in
            with LinkedIn — you carry the verified badge.
          </span>
        </div>
      ) : (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
          You signed in without LinkedIn, so a{" "}
          <span className="font-medium">LinkedIn profile URL is required</span>{" "}
          below to continue.
        </div>
      )}

      {/* Avatar */}
      <AvatarUpload
        userId={profile.id}
        name={profile.full_name}
        defaultUrl={profile.avatar_url}
      />

      {/* Basics */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="full_name" required>
          <Input
            id="full_name"
            name="full_name"
            defaultValue={profile.full_name ?? ""}
            placeholder="Ada Lovelace"
            required
          />
        </Field>
        <Field label="Username" htmlFor="username" required>
          <Input
            id="username"
            name="username"
            defaultValue={profile.username ?? ""}
            placeholder="ada_l"
            required
          />
        </Field>
      </div>

      <Field label="Bio" htmlFor="bio">
        <Textarea
          id="bio"
          name="bio"
          defaultValue={profile.bio ?? ""}
          placeholder="Full-stack builder. Love shipping AI side-projects on weekends."
          rows={3}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Location" htmlFor="location">
          <Input
            id="location"
            name="location"
            defaultValue={profile.location ?? ""}
            placeholder="Bengaluru, India"
          />
        </Field>
        <Field label="Timezone" htmlFor="timezone">
          <Input
            id="timezone"
            name="timezone"
            defaultValue={profile.timezone ?? ""}
            placeholder="GMT+5:30 (IST)"
          />
        </Field>
        <Field label="Company" htmlFor="company">
          <Input
            id="company"
            name="company"
            defaultValue={profile.company ?? ""}
            placeholder="Acme Inc."
          />
        </Field>
        <Field label="College" htmlFor="college">
          <Input
            id="college"
            name="college"
            defaultValue={profile.college ?? ""}
            placeholder="IIT Bombay"
          />
        </Field>
        <Field label="Experience" htmlFor="experience_level">
          <Select
            name="experience_level"
            defaultValue={profile.experience_level ?? undefined}
          >
            <SelectTrigger id="experience_level">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="junior">Junior (0–2 yrs)</SelectItem>
              <SelectItem value="mid">Mid (2–5 yrs)</SelectItem>
              <SelectItem value="senior">Senior (5–8 yrs)</SelectItem>
              <SelectItem value="lead">Lead / Staff (8+ yrs)</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Spoken languages" htmlFor="languages">
          <Input
            id="languages"
            name="languages"
            defaultValue={profile.languages.join(", ")}
            placeholder="English, Hindi"
          />
        </Field>
      </div>

      {/* Skills */}
      <div>
        <Label className="mb-3 block text-base">Skills</Label>
        <SkillPicker skills={skills} defaultSelected={selectedSkillIds} />
      </div>

      {/* Links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={`LinkedIn URL${profile.linkedin_verified ? "" : " (required)"}`}
          htmlFor="linkedin_url"
          required={!profile.linkedin_verified}
        >
          <Input
            id="linkedin_url"
            name="linkedin_url"
            type="url"
            defaultValue={profile.linkedin_url ?? ""}
            placeholder="https://linkedin.com/in/ada"
            required={!profile.linkedin_verified}
          />
        </Field>
        <Field label="GitHub URL" htmlFor="github_url">
          <Input
            id="github_url"
            name="github_url"
            type="url"
            defaultValue={profile.github_url ?? ""}
            placeholder="https://github.com/ada"
          />
        </Field>
        <Field label="Portfolio URL" htmlFor="portfolio_url">
          <Input
            id="portfolio_url"
            name="portfolio_url"
            type="url"
            defaultValue={profile.portfolio_url ?? ""}
            placeholder="https://ada.dev"
          />
        </Field>
        <Field label="Resume URL (optional)" htmlFor="resume_url">
          <Input
            id="resume_url"
            name="resume_url"
            type="url"
            defaultValue={profile.resume_url ?? ""}
            placeholder="https://…/resume.pdf"
          />
        </Field>
      </div>

      <SubmitButton intent={intent} />
    </form>
  );
}

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
    </div>
  );
}
