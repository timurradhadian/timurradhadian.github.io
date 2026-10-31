"use client";

import React from "react";
import { Locale, Skill } from "@/types/portfolio";
import { getDictionary } from "@/lib/i18n";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getTechIcon } from "@/lib/tech-icons";

interface SkillsProps {
  locale: Locale;
  skills: Skill[];
}

const CATEGORY_ORDER = [
  "Frontend",
  "Backend",
  "Database",
  "DevOps & Tools",
  "AI & Automation",
];

const CATEGORY_LABELS: Record<string, { id: string; en: string }> = {
  Frontend: { id: "FRONTEND", en: "FRONTEND" },
  Backend: { id: "BACKEND", en: "BACKEND" },
  Database: { id: "DATABASE", en: "DATABASE" },
  "DevOps & Tools": { id: "DEVOPS & TOOLS", en: "DEVOPS & TOOLS" },
  "AI & Automation": { id: "AI & AUTOMATION", en: "AI & AUTOMATION" },
};

function normalizeCategory(category: string): string {
  const norm = category.toLowerCase().trim();
  if (norm.includes("front") || norm.includes("ui") || norm.includes("client")) {
    return "Frontend";
  }
  if (norm.includes("back") || norm.includes("system") || norm.includes("server")) {
    return "Backend";
  }
  if (norm.includes("data") || norm.includes("db") || norm.includes("sql") || norm.includes("mongo")) {
    return "Database";
  }
  if (
    norm.includes("ai") ||
    norm.includes("llm") ||
    norm.includes("automation") ||
    norm.includes("machine learning")
  ) {
    return "AI & Automation";
  }
  if (
    norm.includes("devops") ||
    norm.includes("cloud") ||
    norm.includes("tool") ||
    norm.includes("infra")
  ) {
    return "DevOps & Tools";
  }
  return category;
}

export function Skills({ locale, skills }: SkillsProps) {
  const dict = getDictionary(locale);

  // Group skills by their normalized category
  const groupedSkills = React.useMemo(() => {
    const groups = new Map<string, Skill[]>();

    skills.forEach((skill) => {
      const category = normalizeCategory(skill.category || "Frontend");
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
      title: CATEGORY_LABELS[cat]?.[locale] || cat.toUpperCase(),
      items: groups.get(cat)!,
    }));
  }, [skills, locale]);

  return (
    <section id="skills" className="space-y-4 pt-4 scroll-mt-6 sm:scroll-mt-8">
      <SectionHeader
        number="04"
        title={dict.skills.title}
        hint={dict.skills.subtitle}
        delay={0.1}
      />

      {/* Open Bordered Grid without Left/Right Outer Borders or Rounded Corners */}
      <Reveal delay={0.08} yOffset={8}>
        <div className="border-t border-zinc-200/80">
          <div className="grid grid-cols-1 sm:grid-cols-2">
            {groupedSkills.map((group, idx) => {
              const isLast = idx === groupedSkills.length - 1;
              const isOddTotal = groupedSkills.length % 2 !== 0;
              const spansFull = isLast && isOddTotal;
              const isLeftCol = idx % 2 === 0;

              let cellClasses = "border-b border-zinc-200/80";
              if (spansFull) {
                cellClasses += " sm:col-span-2 py-4 sm:py-5 px-0";
              } else if (isLeftCol) {
                cellClasses +=
                  " sm:border-r sm:border-zinc-200/80 py-4 sm:py-5 pl-0 pr-0 sm:pr-6";
              } else {
                cellClasses += " py-4 sm:py-5 pl-0 sm:pl-6 pr-0";
              }

              return (
                <div
                  key={group.category}
                  className={cellClasses}
                >
                  {/* Category Header with Black Square Bullet */}
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="size-2 bg-zinc-900 rounded-[2px] inline-block shrink-0 select-none"
                      aria-hidden="true"
                    />
                    <h3 className="text-xs font-bold tracking-wider uppercase text-zinc-900 font-mono">
                      {group.title}
                    </h3>
                  </div>

                  {/* Skills Pills with Icons & Polished Spacing */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {group.items.map((skill) => {
                      const techInfo = getTechIcon(skill.name);

                      return (
                        <span
                          key={skill.id}
                          className="group/skill inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-zinc-200/90 text-xs font-medium text-zinc-800 shadow-2xs hover:border-zinc-400 hover:bg-zinc-50/90 transition-all select-none cursor-default"
                        >
                          <span
                            className={`${techInfo.iconClass} size-3.5 inline-block shrink-0 transition-transform duration-200 group-hover/skill:scale-110`}
                            aria-hidden="true"
                          />
                          <span className="font-medium text-zinc-800 group-hover/skill:text-zinc-950">
                            {skill.name}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
