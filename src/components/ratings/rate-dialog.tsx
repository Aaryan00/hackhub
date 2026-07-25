"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { submitRating } from "@/lib/actions/ratings";
import { RATING_CATEGORIES, type RatingCategory } from "@/lib/database.types";
import { cn } from "@/lib/utils";

const LABELS: Record<RatingCategory, string> = {
  communication: "Communication",
  coding: "Coding",
  reliability: "Reliability",
  collaboration: "Collaboration",
  ownership: "Ownership",
  technical_skills: "Technical skills",
};

function StarRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => onChange(n)} aria-label={`${n} stars`}>
            <Star
              className={cn(
                "size-5 transition-colors",
                n <= value
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/40 hover:text-amber-300",
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export function RateTeammateButton({
  teamId,
  rateeId,
  rateeName,
}: {
  teamId: string;
  rateeId: string;
  rateeName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [scores, setScores] = useState<Record<RatingCategory, number>>({
    communication: 0,
    coding: 0,
    reliability: 0,
    collaboration: 0,
    ownership: 0,
    technical_skills: 0,
  });
  const [comment, setComment] = useState("");

  function submit() {
    startTransition(async () => {
      const res = await submitRating({
        teamId,
        rateeId,
        comment,
        ...scores,
      });
      if (res?.error) toast.error(res.error);
      else {
        toast.success(`Rated ${rateeName}.`);
        setOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <Star className="size-4" /> Rate
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rate {rateeName}</DialogTitle>
          <DialogDescription>
            Only teammates can rate each other. Your rating is combined into
            their public average.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {RATING_CATEGORIES.map((cat) => (
            <StarRow
              key={cat}
              label={LABELS[cat]}
              value={scores[cat]}
              onChange={(v) => setScores((s) => ({ ...s, [cat]: v }))}
            />
          ))}
        </div>

        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          placeholder="Optional note about working with them…"
        />

        <DialogFooter>
          <Button disabled={pending} onClick={submit}>
            {pending ? "Saving…" : "Submit rating"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
