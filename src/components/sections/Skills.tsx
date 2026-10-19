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
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => {
            const techInfo = getTechIcon(skill.name);

            return (
              <span
                key={skill.id}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium bg-white text-zinc-800 border border-zinc-200/90 shadow-2xs hover:border-zinc-300 hover:shadow-xs hover:bg-zinc-50/70 transition-all cursor-default"
              >
                <span
                  className={`${techInfo.iconClass} size-4 inline-block shrink-0`}
                  style={{ color: techInfo.color }}
                  aria-hidden="true"
                />
                <span className="font-medium text-zinc-800">{skill.name}</span>
              </span>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}
