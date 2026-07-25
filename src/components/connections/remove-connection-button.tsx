"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { removeConnection } from "@/lib/actions/connections";

export function RemoveConnectionButton({
  connectionId,
  label = "Remove",
}: {
  connectionId: string;
  label?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await removeConnection(connectionId);
          if (res?.error) toast.error(res.error);
          else router.refresh();
        })
      }
    >
      {label}
    </Button>
  );
}
