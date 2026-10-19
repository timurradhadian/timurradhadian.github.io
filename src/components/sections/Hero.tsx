import React from "react";
import Image from "next/image";
import { Locale, Profile } from "@/types/portfolio";
import { getDictionary, getLocalized } from "@/lib/i18n";
import { Reveal } from "@/components/motion/Reveal";

interface HeroProps {
  locale: Locale;
  profile: Profile;
}

export function Hero({ locale, profile }: HeroProps) {
  const dict = getDictionary(locale);
  const localizedRole = getLocalized(profile, "role", locale);
  const localizedBio = getLocalized(profile, "bio", locale);

  const avatarSrc = profile.avatarUrl || "/avatar.png";

  return (
    <section id="hero" className="space-y-8 pt-6 sm:pt-10">
      {/* Hero Header with Avatar */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-6 sm:gap-8">
        <div className="space-y-3 flex-1">
          <Reveal delay={0.05} yOffset={14}>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-ink">
              {dict.hero.title}
            </h1>
          </Reveal>

          <Reveal delay={0.1} yOffset={14}>
            <p className="text-base sm:text-lg text-ink-muted leading-relaxed max-w-xl">
              {localizedRole}. {dict.hero.description}
            </p>
          </Reveal>

          {profile.availableForHire && (
            <Reveal delay={0.15} yOffset={10}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 mt-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>{dict.hero.availableBadge}</span>
              </div>
            </Reveal>
          )}
        </div>

        <Reveal delay={0.1} yOffset={0}>
          <div className="relative size-24 sm:size-28 md:size-32 rounded-full overflow-hidden border border-border shadow-xs shrink-0 bg-surface">
            <Image
              src={avatarSrc}
              alt={profile.name}
              width={128}
              height={128}
              priority
              className="size-full object-cover"
            />
          </div>
        </Reveal>
      </div>

      {/* About Section */}
      <div id="about" className="space-y-3 pt-2">
        <Reveal delay={0.2} yOffset={14}>
          <h2 className="text-xl font-bold tracking-tight text-ink">
            {dict.hero.aboutTitle}
          </h2>
        </Reveal>

        <Reveal delay={0.25} yOffset={14}>
          <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
            {dict.hero.aboutBio}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
