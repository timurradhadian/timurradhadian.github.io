"use client";

import React from "react";
import { m } from "motion/react";
import { Locale, Skill } from "@/types/portfolio";
import { getDictionary } from "@/lib/i18n";
import { Reveal } from "@/components/motion/Reveal";
import { getTechIcon } from "@/lib/tech-icons";

interface SkillsProps {
  locale: Locale;
  skills: Skill[];
}

const CATEGORY_ORDER = [
  "Programming Languages",
  "Frameworks & Libraries",
  "Database",
  "AI & LLM Engineering",
  "Software Architecture",
  "DevOps",
  "API & Integration",
  "Other Tools",
];

const CATEGORY_LABELS: Record<string, { id: string; en: string }> = {
  "Programming Languages": {
    id: "Bahasa Pemrograman",
    en: "Programming Languages",
  },
  "Frameworks & Libraries": {
    id: "Framework & Library",
    en: "Frameworks & Libraries",
  },
  "Database": {
    id: "Database & Penyimpanan",
    en: "Database & Storage",
  },
  "AI & LLM Engineering": {
    id: "AI & LLM Engineering",
    en: "AI & LLM Engineering",
  },
  "Software Architecture": {
    id: "Arsitektur Software",
    en: "Software Architecture",
  },
  "DevOps": {
    id: "DevOps & Cloud",
    en: "DevOps & Cloud",
  },
  "API & Integration": {
    id: "API & Integrasi",
    en: "API & Integration",
  },
  "Other Tools": {
    id: "Tools & Produktivitas",
    en: "Tools & Productivity",
  },
};

export function Skills({ locale, skills }: SkillsProps) {
  const dict = getDictionary(locale);

  // Group skills by their category from the API
  const groupedSkills = React.useMemo(() => {
    const groups = new Map<string, Skill[]>();

    skills.forEach((skill) => {
      const category = skill.category || "General";
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(skill);
    });

    // Sort skills within each group by their order
    groups.forEach((items) => {
      items.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
    });

    // Sort category keys according to CATEGORY_ORDER
    const sortedCategories = Array.from(groups.keys()).sort((a, b) => {
      const idxA = CATEGORY_ORDER.indexOf(a);
      const idxB = CATEGORY_ORDER.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

    return sortedCategories.map((cat) => ({
      category: cat,
      title:
        CATEGORY_LABELS[cat]?.[locale] ||
        (locale === "id" ? cat : cat),
      items: groups.get(cat)!,
    }));
  }, [skills, locale]);

  return (
    <section id="skills" className="space-y-6 pt-4 scroll-mt-6 sm:scroll-mt-8">
      <Reveal delay={0.1} yOffset={12}>
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-ink">
            {dict.skills.title}
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted">
            {dict.skills.subtitle}
          </p>
        </div>
      </Reveal>

      {/* Grouped Skills by API Category */}
      <div className="space-y-5">
        {groupedSkills.map((group, groupIdx) => (
          <Reveal key={group.category} delay={0.12 + groupIdx * 0.04} yOffset={10}>
            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold tracking-wider uppercase text-zinc-500 font-mono flex items-center gap-2">
                <span>{group.title}</span>
                <span className="h-px flex-1 bg-zinc-200/80" />
              </h3>

              <div className="flex flex-wrap gap-2">
                {group.items.map((skill) => {
                  const techInfo = getTechIcon(skill.name);

                  return (
                    <m.span
                      key={skill.id}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 450, damping: 20 }}
                      className="group/skill inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium bg-white text-zinc-800 border border-zinc-200/90 shadow-2xs hover:border-zinc-350 hover:shadow-xs hover:bg-zinc-50/90 transition-colors cursor-default select-none"
                    >
                      <span
                        className={`${techInfo.iconClass} size-4 inline-block shrink-0 transition-transform duration-200 group-hover/skill:scale-110 group-hover/skill:rotate-3`}
                        aria-hidden="true"
                      />
                      <span className="font-medium text-zinc-800 group-hover/skill:text-zinc-950">
                        {skill.name}
                      </span>
                    </m.span>
                  );
                })}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
