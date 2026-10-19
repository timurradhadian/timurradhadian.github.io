import React from "react";
import { Education as EducationType, Locale } from "@/types/portfolio";
import { getDictionary, getLocalized } from "@/lib/i18n";
import { Reveal } from "@/components/motion/Reveal";

interface EducationProps {
  locale: Locale;
  educations?: EducationType[];
}

export function Education({ locale, educations = [] }: EducationProps) {
  const dict = getDictionary(locale);

  if (!educations || educations.length === 0) return null;

  return (
    <section id="education" className="space-y-4 pt-4">
      <Reveal delay={0.1} yOffset={14}>
        <h2 className="text-xl font-bold tracking-tight text-ink">
          {dict.education.title}
        </h2>
      </Reveal>

      <div className="space-y-3">
        {educations.map((edu, idx) => {
          const degree = getLocalized(edu, "degree", locale);
          const field = getLocalized(edu, "field", locale);

          const dateDisplay = `${edu.startDate} - ${
            edu.endDate ? edu.endDate : dict.experience.present
          }`;

          const monogram = edu.school
            .split(" ")
            .map((w) => w[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

          return (
            <Reveal key={edu.id} delay={0.1 + idx * 0.05} yOffset={12}>
              <div className="group rounded-xl border border-border/60 bg-surface/40 hover:bg-surface/80 p-3.5 sm:p-4 transition-all">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 sm:size-11 rounded-full border border-border bg-canvas flex items-center justify-center font-bold text-xs text-ink shrink-0 group-hover:scale-105 transition-transform">
                      {monogram}
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base text-ink truncate">
                        {edu.school}
                      </h3>
                      <p className="text-xs sm:text-sm text-ink-muted truncate">
                        {degree} {field ? `• ${field}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-ink-muted tabular-nums shrink-0 text-right">
                    {dateDisplay}
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
