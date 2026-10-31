"use client";

import React from "react";
import Image from "next/image";
import { Education as EducationType, Locale } from "@/types/portfolio";
import { getDictionary, getLocalized } from "@/lib/i18n";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";

interface EducationProps {
  locale: Locale;
  educations?: EducationType[];
}

function getSchoolBadge(school: string, logo?: string): {
  icon?: string;
  image?: string;
  className: string;
} {
  if (logo) {
    return {
      image: logo,
      className: "bg-white border-zinc-200/90 shadow-2xs",
    };
  }
  const normalized = school.toLowerCase();
  if (normalized.includes("amikom")) {
    return {
      image: "/education/amikom.png",
      className: "bg-white border-zinc-200/90 shadow-2xs",
    };
  }
  if (
    normalized.includes("sma") ||
    normalized.includes("sman 6") ||
    normalized.includes("balikpapan")
  ) {
    return {
      image: "/education/sman6-balikpapan.png",
      className: "bg-white border-zinc-200/90 shadow-2xs",
    };
  }
  if (normalized.includes("google") || normalized.includes("bangkit")) {
    return {
      icon: "icon-[logos--google-icon]",
      className: "bg-white border-zinc-200/90 shadow-2xs",
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
    <section id="education" className="space-y-4 pt-4 scroll-mt-6 sm:scroll-mt-8">
      <SectionHeader
        number="03"
        title={dict.education.title}
        hint={locale === "en" ? "academic background" : "latar belakang akademik"}
        delay={0.1}
      />

      <div className="divide-y divide-zinc-200/80">
        {educations.map((edu, idx) => {
          const school = getLocalized(edu, "school", locale) || edu.school;
          const degree = getLocalized(edu, "degree", locale) || edu.degree;

          const dateDisplay =
            !edu.endDate || edu.startDate === edu.endDate
              ? edu.startDate
              : `${edu.startDate} – ${edu.endDate}`;

          const badge = getSchoolBadge(edu.school, edu.logo);

          return (
            <Reveal key={edu.id} delay={0.08 + idx * 0.04} yOffset={8}>
              <div className="group py-3.5 sm:py-4 flex items-center gap-3.5 sm:gap-4 -mx-2 px-2 rounded-xl transition-colors hover:bg-zinc-50/70">
                {/* Logo Badge */}
                <div
                  className={`size-10 sm:size-11 rounded-xl border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs overflow-hidden p-1.5 ${badge.className}`}
                >
                  {badge.image ? (
                    <div className="relative size-full">
                      <Image
                        src={badge.image}
                        alt={school}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <span
                      className={`${badge.icon} size-5 inline-block shrink-0`}
                    />
                  )}
                </div>

                {/* Education Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-semibold text-sm sm:text-base text-zinc-900 truncate">
                      {degree}
                    </h3>
                    <span className="text-xs sm:text-sm text-zinc-500 tabular-nums shrink-0 font-normal">
                      {dateDisplay}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-500 truncate mt-0.5">
                    {school}
                  </p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
