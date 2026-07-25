"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { markAllNotificationsRead } from "@/lib/actions/notifications";
import type { Notification } from "@/lib/database.types";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export function NotificationBell({
  items,
  unread,
}: {
  items: Notification[];
  unread: number;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function markAllRead() {
    startTransition(async () => {
      await markAllNotificationsRead();
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" className="relative" />}
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Notifications</span>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-normal text-primary hover:underline"
              >
                Mark all read
              </button>
            )}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        {items.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            No notifications yet.
          </p>
        ) : (
          items.map((n) => (
            <DropdownMenuItem
              key={n.id}
              render={<Link href={n.link ?? "/notifications"} />}
              className={cn(
                "flex flex-col items-start gap-0.5 whitespace-normal",
                !n.read && "bg-accent/50",
              )}
            >
              <span className="text-sm font-medium">{n.title}</span>
              {n.body && (
                <span className="line-clamp-1 text-xs text-muted-foreground">
                  {n.body}
                </span>
              )}
              <span className="text-[10px] text-muted-foreground">
                {relativeTime(n.created_at)}
              </span>
            </DropdownMenuItem>
          ))
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/notifications" />} className="justify-center">
          See all
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
