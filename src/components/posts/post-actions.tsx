"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
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
import { addComment, deleteComment, deletePost } from "@/lib/actions/posts";

export function CommentForm({ postId }: { postId: string }) {
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const res = await addComment(postId, body);
      if (res?.error) toast.error(res.error);
      else setBody("");
    });
  }

  return (
    <div className="space-y-2">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder="Add a comment…"
      />
      <div className="flex justify-end">
        <Button disabled={pending || !body.trim()} onClick={submit}>
          {pending ? "Posting…" : "Comment"}
        </Button>
      </div>
    </div>
  );
}

export function DeleteCommentButton({
  commentId,
  postId,
}: {
  commentId: string;
  postId: string;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="icon-sm"
      variant="ghost"
      disabled={pending}
      aria-label="Delete comment"
      onClick={() =>
        startTransition(async () => {
          const res = await deleteComment(commentId, postId);
          if (res?.error) toast.error(res.error);
        })
      }
    >
      <Trash2 className="size-4" />
    </Button>
  );
}

export function DeletePostButton({ postId }: { postId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
          />
        }
      >
        <Trash2 className="size-4" /> Delete
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this post?</DialogTitle>
          <DialogDescription>
            The post and its comments will be permanently removed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const res = await deletePost(postId);
                if (res?.error) toast.error(res.error);
              })
            }
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
