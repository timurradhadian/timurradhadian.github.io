"use client";

import React from "react";
import Image from "next/image";
import { m } from "motion/react";
import { Locale, Profile } from "@/types/portfolio";
import { getDictionary } from "@/lib/i18n";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";

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
    <section id="hero" className="space-y-8 pt-4 sm:pt-8 scroll-mt-6 sm:scroll-mt-8">
      {/* Hero Header with Avatar */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-start justify-between gap-6 sm:gap-8">
        <div className="space-y-3.5 flex-1">
          {dict.hero.kicker && (
            <Reveal delay={0.03} yOffset={8}>
              <p className="text-xs sm:text-[13px] font-sans font-bold uppercase tracking-wider text-zinc-700">
                {dict.hero.kicker}
              </p>
            </Reveal>
          )}

          <Reveal delay={0.06} yOffset={12}>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-ink leading-[1.08] text-balance">
              {dict.hero.title}
              <span className="text-zinc-400">.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.1} yOffset={12}>
            <p className="text-base sm:text-lg text-ink-muted leading-relaxed max-w-2xl">
              {tagline}
            </p>
          </Reveal>
        </div>

        <div className="relative shrink-0 self-start sm:self-center">
          <m.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.03, rotate: 0.5 }}
            transition={{ type: "spring", stiffness: 280, damping: 20, delay: 0.1 }}
            className="relative size-28 sm:size-36 md:size-40 rounded-2xl sm:rounded-3xl overflow-hidden border border-zinc-200/90 shadow-sm bg-surface cursor-pointer ring-4 ring-transparent hover:ring-zinc-200/60 transition-all duration-300"
          >
            <Image
              src={avatarSrc}
              alt={profile.name}
              width={160}
              height={160}
              priority
              className="size-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </m.div>
        </div>
      </div>

      {/* About Section */}
      <div id="about" className="pt-4 sm:pt-6">
        <SectionHeader
          number="01"
          title={dict.hero.aboutTitle}
          hint={locale === "en" ? "a quick read" : "ringkasan singkat"}
          delay={0.15}
        />

        <Reveal delay={0.2} yOffset={12}>
          <p className="text-sm sm:text-base text-ink-muted leading-relaxed whitespace-pre-line">
            {localizedAbout}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
