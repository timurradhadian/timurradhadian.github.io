"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Experience, Locale } from "@/types/portfolio";
import { getDictionary, getLocalized, getLocalizedArray } from "@/lib/i18n";
import { Reveal } from "@/components/motion/Reveal";

interface ExperiencesProps {
  locale: Locale;
  experiences: Experience[];
}

export function Experiences({ locale, experiences }: ExperiencesProps) {
  const dict = getDictionary(locale);
  const [expandedId, setExpandedId] = useState<string | null>(experiences[0]?.id || null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="experience" className="space-y-4 pt-4">
      <Reveal delay={0.1} yOffset={14}>
        <h2 className="text-xl font-bold tracking-tight text-ink">
          {dict.experience.title}
        </h2>
      </Reveal>

      <div className="space-y-3">
        {experiences.map((exp, idx) => {
          const position = getLocalized(exp, "position", locale);
          const highlights = getLocalizedArray(exp, "highlights", locale);
          const isExpanded = expandedId === exp.id;

          const dateDisplay = `${exp.startDate} - ${
            exp.endDate ? exp.endDate : dict.experience.present
          }`;

          // Stylized monogram
          const monogram = exp.company
            .split(" ")
            .map((w) => w[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

          return (
            <Reveal key={exp.id} delay={0.1 + idx * 0.05} yOffset={12}>
              <div
                onClick={() => toggleExpand(exp.id)}
                className="group rounded-xl border border-border/60 bg-surface/40 hover:bg-surface/80 p-3.5 sm:p-4 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 sm:size-11 rounded-full border border-border bg-canvas flex items-center justify-center font-bold text-xs text-ink shrink-0 group-hover:scale-105 transition-transform">
                      {monogram}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold text-sm sm:text-base text-ink truncate group-hover:text-ink">
                          {exp.company}
                        </h3>
                        <span
                          className={`icon-[lucide--chevron-right] size-3.5 text-ink-muted transition-transform duration-200 ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                          aria-hidden="true"
                        />
                      </div>
                      <p className="text-xs sm:text-sm text-ink-muted truncate">
                        {position}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-ink-muted tabular-nums shrink-0 text-right">
                    {dateDisplay}
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isExpanded && highlights.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <ul className="mt-3.5 pt-3 border-t border-border/50 space-y-1.5 text-xs text-ink-muted leading-relaxed pl-4 list-disc marker:text-ink/60">
                        {highlights.map((item, hIdx) => (
                          <li key={hIdx}>{item}</li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
