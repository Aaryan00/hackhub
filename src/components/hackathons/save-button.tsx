"use client";

import { useState, useTransition } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { toggleSaveHackathon } from "@/lib/actions/hackathons";
import { cn } from "@/lib/utils";

export function SaveHackathonButton({
  hackathonId,
  initialSaved,
  variant = "icon",
}: {
  hackathonId: string;
  initialSaved: boolean;
  variant?: "icon" | "full";
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      const res = await toggleSaveHackathon(hackathonId);
      if ("saved" in res) setSaved(res.saved);
      else toast.error(res.error);
    });
  }

  if (variant === "full") {
    return (
      <Button variant={saved ? "secondary" : "outline"} disabled={pending} onClick={onClick}>
        {saved ? (
          <BookmarkCheck className="size-4" />
        ) : (
          <Bookmark className="size-4" />
        )}
        {saved ? "Saved" : "Save"}
      </Button>
    );
  }

  return (
    <Button
      size="icon"
      variant="ghost"
      disabled={pending}
      onClick={onClick}
      aria-label={saved ? "Unsave" : "Save"}
    >
      {saved ? (
        <BookmarkCheck className={cn("size-5 text-primary")} />
      ) : (
        <Bookmark className="size-5" />
      )}
    </Button>
  );
}
