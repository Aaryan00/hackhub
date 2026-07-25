"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, UserCheck, UserPlus, X } from "lucide-react";
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
import {
  respondToRequest,
  sendConnectionRequest,
} from "@/lib/actions/connections";

export type ConnectState =
  | "none"
  | "outgoing_pending"
  | "incoming_pending"
  | "connected";

export function ConnectButton({
  targetId,
  targetName,
  state,
  connectionId,
  size = "default",
}: {
  targetId: string;
  targetName: string;
  state: ConnectState;
  connectionId?: string;
  size?: "sm" | "default";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  function run(fn: () => Promise<{ error?: string }>, ok?: () => void) {
    startTransition(async () => {
      const res = await fn();
      if (res?.error) toast.error(res.error);
      else {
        ok?.();
        router.refresh();
      }
    });
  }

  if (state === "connected") {
    return (
      <Button size={size} variant="secondary" disabled>
        <UserCheck className="size-4" /> Connected
      </Button>
    );
  }

  if (state === "outgoing_pending") {
    return (
      <Button size={size} variant="secondary" disabled>
        Request sent
      </Button>
    );
  }

  if (state === "incoming_pending") {
    return (
      <div className="flex gap-2">
        <Button
          size={size}
          disabled={pending}
          onClick={() =>
            run(
              () => respondToRequest(connectionId!, true),
              () => toast.success(`You're now connected with ${targetName}.`),
            )
          }
        >
          <Check className="size-4" /> Accept
        </Button>
        <Button
          size={size}
          variant="outline"
          disabled={pending}
          onClick={() => run(() => respondToRequest(connectionId!, false))}
        >
          <X className="size-4" /> Ignore
        </Button>
      </div>
    );
  }

  // state === "none"
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size={size} />}>
        <UserPlus className="size-4" /> Connect
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect with {targetName}</DialogTitle>
          <DialogDescription>
            Add a note so they know why you&apos;d like to connect.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Hi! I saw your post about the AI hackathon — I'm a backend dev and would love to team up."
        />
        <DialogFooter>
          <Button
            disabled={pending}
            onClick={() =>
              run(
                () => sendConnectionRequest(targetId, note),
                () => {
                  toast.success("Request sent.");
                  setOpen(false);
                },
              )
            }
          >
            Send request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
