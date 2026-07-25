"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const MODES = [
  { value: "all", label: "All" },
  { value: "online", label: "Online" },
  { value: "offline", label: "Offline" },
  { value: "hybrid", label: "Hybrid" },
];

const DIFFICULTIES = [
  { value: "all", label: "All levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export function HackathonFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const mode = params.get("mode") ?? "all";
  const difficulty = params.get("difficulty") ?? "all";
  const weekend = params.get("weekend") === "1";

  const [query, setQuery] = useState(params.get("q") ?? "");
  const first = useRef(true);

  function apply(next: URLSearchParams) {
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
    apply(next);
  }

  // Debounced search.
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
          placeholder="Search hackathons by name…"
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-center gap-1">
          {MODES.map((m) => (
            <Button
              key={m.value}
              size="sm"
              variant={mode === m.value ? "default" : "ghost"}
              onClick={() => setParam("mode", m.value)}
            >
              {m.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          {DIFFICULTIES.map((d) => (
            <Button
              key={d.value}
              size="sm"
              variant={difficulty === d.value ? "default" : "ghost"}
              className={cn(d.value === "all" && "hidden sm:inline-flex")}
              onClick={() => setParam("difficulty", d.value)}
            >
              {d.label}
            </Button>
          ))}
        </div>

        <Label className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox
            checked={weekend}
            onCheckedChange={(v) => setParam("weekend", v ? "1" : null)}
          />
          Weekend only
        </Label>
      </div>
    </div>
  );
}
