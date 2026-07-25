"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STATUS_TABS = [
  { value: "all", label: "All teams" },
  { value: "looking_for_members", label: "Looking for members" },
  { value: "building", label: "Building" },
  { value: "winner", label: "Winners" },
];

export function TeamFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const status = params.get("status") ?? "all";

  const [query, setQuery] = useState(params.get("q") ?? "");
  const first = useRef(true);

  function apply(next: URLSearchParams) {
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (query.trim()) next.set("q", query.trim());
      else next.delete("q");
      apply(next);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search teams by name…"
          className="pl-9"
        />
      </div>
      <div className="flex flex-wrap items-center gap-1">
        {STATUS_TABS.map((tab) => (
          <Button
            key={tab.value}
            size="sm"
            variant={status === tab.value ? "default" : "ghost"}
            onClick={() => {
              const next = new URLSearchParams(params.toString());
              if (tab.value === "all") next.delete("status");
              else next.set("status", tab.value);
              apply(next);
            }}
          >
            {tab.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
