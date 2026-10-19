import React from "react";
import { Locale, Skill } from "@/types/portfolio";
import { getDictionary } from "@/lib/i18n";
import { Reveal } from "@/components/motion/Reveal";

interface SkillsProps {
  locale: Locale;
  skills: Skill[];
}

export function Skills({ locale, skills }: SkillsProps) {
  const dict = getDictionary(locale);

  return (
    <section id="skills" className="space-y-4 pt-4">
      <Reveal delay={0.1} yOffset={14}>
        <h2 className="text-xl font-bold tracking-tight text-ink">
          {dict.skills.title}
        </h2>
      </Reveal>

      <Reveal delay={0.15} yOffset={14}>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {skills.map((skill) => (
            <span
              key={skill.id}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 hover:scale-105 active:scale-95 transition-all shadow-xs cursor-default"
            >
              {skill.name}
            </span>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
