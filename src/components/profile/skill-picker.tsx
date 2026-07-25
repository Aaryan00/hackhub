"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import type { Skill } from "@/lib/database.types";
import { cn } from "@/lib/utils";

/**
 * Toggleable grid of skill badges grouped by category. Selected skill ids are
 * emitted as hidden <input name="skills"> so a plain form submit picks them up.
 */
export function SkillPicker({
  skills,
  defaultSelected,
}: {
  skills: Skill[];
  defaultSelected: string[];
}) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(defaultSelected),
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const byCategory = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    (acc[skill.category] ??= []).push(skill);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {[...selected].map((id) => (
        <input key={id} type="hidden" name="skills" value={id} />
      ))}
      {Object.entries(byCategory).map(([category, list]) => (
        <div key={category}>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {category}
          </p>
          <div className="flex flex-wrap gap-2">
            {list.map((skill) => {
              const isOn = selected.has(skill.id);
              return (
                <button key={skill.id} type="button" onClick={() => toggle(skill.id)}>
                  <Badge
                    variant={isOn ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer select-none px-3 py-1 text-sm transition-colors",
                      !isOn && "hover:bg-accent",
                    )}
                  >
                    {skill.name}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
