"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPost, type PostFormState } from "@/lib/actions/posts";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Posting…" : "Post"}
    </Button>
  );
}

export function CreatePostForm() {
  const [state, formAction] = useActionState<PostFormState, FormData>(
    createPost,
    {},
  );

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          placeholder="Looking for a team for Smart India Hackathon 2026"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">Details</Label>
        <Textarea
          id="body"
          name="body"
          rows={4}
          placeholder="What are you building, what's the plan, and what kind of teammates are you after?"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="event_name">Event / hackathon</Label>
          <Input
            id="event_name"
            name="event_name"
            placeholder="Smart India Hackathon 2026"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="skills_needed">Skills you need</Label>
          <Input
            id="skills_needed"
            name="skills_needed"
            placeholder="React, ML, Design"
          />
          <p className="text-xs text-muted-foreground">Comma-separated.</p>
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}
