"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Skill } from "@/lib/database.types";

const EXPERIENCE = [
  { value: "all", label: "Any experience" },
  { value: "student", label: "Student" },
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid-level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead / Staff" },
];

export function BuilderFilters({ skills }: { skills: Skill[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const skill = params.get("skill") ?? "all";
  const experience = params.get("experience") ?? "all";
  const verified = params.get("verified") === "1";

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
          placeholder="Search by name, username, company, college or location…"
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={skill}
          onValueChange={(v) => setParam("skill", String(v))}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Any skill" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any skill</SelectItem>
            {skills.map((s) => (
              <SelectItem key={s.id} value={s.slug}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={experience}
          onValueChange={(v) => setParam("experience", String(v))}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Any experience" />
          </SelectTrigger>
          <SelectContent>
            {EXPERIENCE.map((e) => (
              <SelectItem key={e.value} value={e.value}>
                {e.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Label className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox
            checked={verified}
            onCheckedChange={(v) => setParam("verified", v ? "1" : null)}
          />
          Verified only
        </Label>

        {(skill !== "all" || experience !== "all" || verified || query) && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setQuery("");
              router.push(pathname);
            }}
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
