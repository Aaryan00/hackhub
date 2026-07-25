"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createTeam, type TeamFormState } from "@/lib/actions/teams";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Creating…" : "Create team"}
    </Button>
  );
}

export function CreateTeamForm() {
  const [state, formAction] = useActionState<TeamFormState, FormData>(
    createTeam,
    {},
  );

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">
          Team name <span className="text-destructive">*</span>
        </Label>
        <Input id="name" name="name" placeholder="Neural Ninjas" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          placeholder="What are you building, and who are you looking for?"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="event_name">Event / hackathon (optional)</Label>
        <Input
          id="event_name"
          name="event_name"
          placeholder="e.g. Smart India Hackathon 2026"
        />
        <p className="text-xs text-muted-foreground">
          The hackathon or event this team is for, if any.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="skills_needed">Skills needed</Label>
          <Input
            id="skills_needed"
            name="skills_needed"
            placeholder="Frontend, LLM, Design"
          />
          <p className="text-xs text-muted-foreground">Comma-separated.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="max_members">Max members</Label>
          <Input
            id="max_members"
            name="max_members"
            type="number"
            min={1}
            max={10}
            defaultValue={4}
          />
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}
