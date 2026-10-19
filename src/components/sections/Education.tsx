import React from "react";
import { Education as EducationType, Locale } from "@/types/portfolio";
import { getDictionary, getLocalized } from "@/lib/i18n";
import { Reveal } from "@/components/motion/Reveal";

interface EducationProps {
  locale: Locale;
  educations?: EducationType[];
}

function getSchoolBadge(school: string): { icon: string; className: string } {
  const normalized = school.toLowerCase();
  if (normalized.includes("google") || normalized.includes("bangkit")) {
    return {
      icon: "icon-[logos--google-icon]",
      className: "bg-white border-zinc-200/90 shadow-2xs",
    };
  }
  if (normalized.includes("amikom")) {
    return {
      icon: "icon-[lucide--graduation-cap]",
      className: "bg-purple-50 border-purple-200 text-purple-700 shadow-2xs",
    };
  }
  return {
    icon: "icon-[lucide--graduation-cap]",
    className: "bg-zinc-50 border-zinc-200 text-zinc-700 shadow-2xs",
  };
}

export function Education({ locale, educations = [] }: EducationProps) {
  const dict = getDictionary(locale);

  if (!educations || educations.length === 0) return null;

  return (
    <section id="education" className="space-y-4 pt-4">
      <Reveal delay={0.1} yOffset={12}>
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

          const badge = getSchoolBadge(edu.school);

          return (
            <Reveal key={edu.id} delay={0.1 + idx * 0.05} yOffset={10}>
              <div className="group rounded-xl border border-zinc-200/90 bg-white hover:border-zinc-300 p-3.5 sm:p-4 transition-all shadow-xs">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`size-10 sm:size-11 rounded-xl border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs ${badge.className}`}
                    >
                      <span
                        className={`${badge.icon} size-5 inline-block shrink-0`}
                      />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base text-zinc-900 truncate">
                        {edu.school}
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-600 truncate">
                        {degree} {field ? `• ${field}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-zinc-500 tabular-nums shrink-0 text-right">
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
