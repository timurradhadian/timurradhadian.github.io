"use client";

import React from "react";
import Image from "next/image";
import { m } from "motion/react";
import { Locale, Profile } from "@/types/portfolio";
import { getDictionary } from "@/lib/i18n";
import { Reveal } from "@/components/motion/Reveal";

interface HeroProps {
  locale: Locale;
  profile: Profile;
}

export function Hero({ locale, profile }: HeroProps) {
  const dict = getDictionary(locale);
  const localizedAbout =
    (locale === "en" ? profile.aboutEn : profile.aboutId) ||
    profile.about ||
    dict.hero.aboutBio;

  const tagline = dict.hero.description;
  const avatarSrc = profile.avatarUrl || "/avatar.png";

  return (
    <section id="hero" className="space-y-8 pt-4 sm:pt-8">
      {/* Hero Header with Avatar */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-6 sm:gap-8">
        <div className="space-y-3 flex-1">
          <Reveal delay={0.05} yOffset={12}>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-ink">
              {dict.hero.title}
            </h1>
          </Reveal>

          <Reveal delay={0.1} yOffset={12}>
            <p className="text-base sm:text-lg text-ink-muted leading-relaxed max-w-xl">
              {tagline}
            </p>
          </Reveal>
        </div>

        <div className="relative shrink-0">
          <m.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05, rotate: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 20, delay: 0.1 }}
            className="relative size-24 sm:size-28 md:size-32 rounded-full overflow-hidden border border-border shadow-xs bg-surface cursor-pointer ring-4 ring-transparent hover:ring-zinc-200/60 transition-all duration-300"
          >
            <Image
              src={avatarSrc}
              alt={profile.name}
              width={128}
              height={128}
              priority
              className="size-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </m.div>

          {/* Active status pulse badge */}
          <span
            className="absolute bottom-1 right-1 flex size-3.5 sm:size-4 items-center justify-center pointer-events-none"
            title="Available"
          >
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2.5 sm:size-3 rounded-full bg-emerald-500 ring-2 ring-white" />
          </span>
        </div>
      </div>

      {/* About Section */}
      <div id="about" className="space-y-3 pt-2">
        <Reveal delay={0.15} yOffset={12}>
          <h2 className="text-xl font-bold tracking-tight text-ink">
            {dict.hero.aboutTitle}
          </h2>
        </Reveal>

        <Reveal delay={0.2} yOffset={12}>
          <p className="text-sm sm:text-base text-ink-muted leading-relaxed whitespace-pre-line">
            {localizedAbout}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
