import React from "react";
import { Locale, Skill } from "@/types/portfolio";
import { getDictionary } from "@/lib/i18n";
import { Reveal } from "@/components/motion/Reveal";
import { getTechIcon } from "@/lib/tech-icons";

interface SkillsProps {
  locale: Locale;
  skills: Skill[];
}

export function Skills({ locale, skills }: SkillsProps) {
  const dict = getDictionary(locale);

  return (
    <section id="skills" className="space-y-4 pt-4">
      <Reveal delay={0.1} yOffset={12}>
        <h2 className="text-xl font-bold tracking-tight text-ink">
          {dict.skills.title}
        </h2>
      </Reveal>

      <Reveal delay={0.15} yOffset={12}>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {skills.map((skill) => {
            const iconClass = getTechIcon(skill.name);

            return (
              <span
                key={skill.id}
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium bg-zinc-900 text-white hover:scale-105 active:scale-95 transition-all shadow-xs cursor-default"
              >
                <span className={`${iconClass} size-3.5 inline-block shrink-0`} aria-hidden="true" />
                <span>{skill.name}</span>
              </span>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}
