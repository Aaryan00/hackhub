"use client";

import { useState, useTransition } from "react";
import { Check, LogOut, Trash2, X } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TEAM_STATUS_META } from "@/components/teams/team-status-badge";
import {
  decideRequest,
  deleteTeam,
  leaveTeam,
  removeMember,
  requestToJoin,
  updateTeamStatus,
} from "@/lib/actions/teams";
import type { TeamStatus } from "@/lib/database.types";

function useAction() {
  const [pending, startTransition] = useTransition();
  function run(fn: () => Promise<{ error?: string }>, onOk?: () => void) {
    startTransition(async () => {
      const res = await fn();
      if (res?.error) toast.error(res.error);
      else onOk?.();
    });
  }
  return { pending, run };
}

export function TeamStatusControl({
  teamId,
  status,
}: {
  teamId: string;
  status: TeamStatus;
}) {
  const { pending, run } = useAction();
  return (
    <Select
      defaultValue={status}
      disabled={pending}
      onValueChange={(value) =>
        run(
          () => updateTeamStatus(teamId, String(value)),
          () => toast.success("Status updated."),
        )
      }
    >
      <SelectTrigger className="w-52">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(TEAM_STATUS_META) as TeamStatus[]).map((key) => (
          <SelectItem key={key} value={key}>
            {TEAM_STATUS_META[key].label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function JoinRequestActions({ requestId }: { requestId: string }) {
  const { pending, run } = useAction();
  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        disabled={pending}
        onClick={() =>
          run(() => decideRequest(requestId, true), () => toast.success("Approved."))
        }
      >
        <Check className="size-4" /> Approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() =>
          run(() => decideRequest(requestId, false), () => toast.success("Rejected."))
        }
      >
        <X className="size-4" /> Reject
      </Button>
    </div>
  );
}

export function RemoveMemberButton({
  teamId,
  profileId,
}: {
  teamId: string;
  profileId: string;
}) {
  const { pending, run } = useAction();
  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={pending}
      onClick={() =>
        run(() => removeMember(teamId, profileId), () => toast.success("Member removed."))
      }
    >
      <X className="size-4" /> Remove
    </Button>
  );
}

export function LeaveTeamButton({ teamId }: { teamId: string }) {
  const { pending, run } = useAction();
  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={() => run(() => leaveTeam(teamId))}
    >
      <LogOut className="size-4" /> Leave team
    </Button>
  );
}

export function DeleteTeamButton({ teamId }: { teamId: string }) {
  const { pending, run } = useAction();
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            className="text-destructive hover:text-destructive"
          />
        }
      >
        <Trash2 className="size-4" /> Delete team
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this team?</DialogTitle>
          <DialogDescription>
            This permanently removes the team, its members and all join
            requests. This can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={pending}
            onClick={() => run(() => deleteTeam(teamId))}
          >
            Delete team
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RequestToJoinButton({
  teamId,
  disabled,
  disabledLabel,
}: {
  teamId: string;
  disabled?: boolean;
  disabledLabel?: string;
}) {
  const { pending, run } = useAction();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  if (disabled) {
    return (
      <Button disabled variant="secondary">
        {disabledLabel}
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>Request to join</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request to join</DialogTitle>
          <DialogDescription>
            Add a short note so the team admin knows what you bring.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="Hi! I'm a frontend dev with 3 hackathon wins. I'd love to join."
        />
        <DialogFooter>
          <Button
            disabled={pending}
            onClick={() =>
              run(
                () => requestToJoin(teamId, message),
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
