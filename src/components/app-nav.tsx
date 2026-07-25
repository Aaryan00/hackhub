"use client";

import { useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BadgeCheck, LogOut, Settings, User, Users } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { NotificationBell } from "@/components/notifications/notification-bell";
import { signOut } from "@/lib/actions/auth";
import type { Profile } from "@/lib/database.types";
import type { NotificationSummary } from "@/lib/notifications";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/posts", label: "Posts" },
  { href: "/builders", label: "Builders" },
  { href: "/teams", label: "Teams" },
];

export function AppNav({
  profile,
  notifications,
}: {
  profile: Profile;
  notifications: NotificationSummary;
}) {
  const pathname = usePathname();
  const [, startLogout] = useTransition();
  const initials = (profile.full_name ?? profile.username ?? "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
        <Link href="/dashboard" className="text-lg font-bold tracking-tight">
          Hack<span className="text-primary">Hub</span>
        </Link>

        <nav className="flex items-center gap-1">
          {LINKS.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <NotificationBell
            items={notifications.items}
            unread={notifications.unread}
          />
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" className="relative gap-2 px-2" />
              }
            >
              <Avatar className="size-8">
                <AvatarImage src={profile.avatar_url ?? undefined} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              {profile.linkedin_verified && (
                <BadgeCheck className="size-4 text-emerald-500" />
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="flex flex-col">
                  <span>{profile.full_name}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    @{profile.username}
                  </span>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href={`/u/${profile.username}`} />}>
                <User className="size-4" /> My profile
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/network" />}>
                <Users className="size-4" /> My network
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/settings/profile" />}>
                <Settings className="size-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => startLogout(async () => void (await signOut()))}
              >
                <LogOut className="size-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
