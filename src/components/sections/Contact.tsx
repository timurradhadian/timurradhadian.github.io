"use client";

import React from "react";
import { m } from "motion/react";
import { Locale, Profile } from "@/types/portfolio";
import { getDictionary } from "@/lib/i18n";
import { Reveal } from "@/components/motion/Reveal";
import { HalftoneShader } from "@/components/ui/HalftoneShader";

interface ContactProps {
  locale: Locale;
  profile: Profile;
}

export function Contact({ locale, profile }: ContactProps) {
  const dict = getDictionary(locale);

  return (
    <section id="contact" className="relative pt-6 sm:pt-8 pb-4">
      <div className="relative">
        {/* Floating Top Pill Badge (centered on card top border) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <Reveal delay={0.05} yOffset={4}>
            <span className="inline-block rounded-full bg-zinc-950 text-white border border-zinc-800 px-4 py-1 text-xs font-semibold shadow-xs">
              {dict.contact.badge}
            </span>
          </Reveal>
        </div>

        {/* Contained Framed Card */}
        <div className="relative rounded-2xl sm:rounded-3xl border border-zinc-200/90 bg-white overflow-hidden px-6 py-12 sm:px-10 sm:py-16 text-center shadow-xs">
          {/* Ambient Interactive Halftone Shader Banner */}
          <div className="absolute top-0 left-0 right-0 h-48 sm:h-64 w-full overflow-hidden pointer-events-none z-0">
            <HalftoneShader
              dotSpacing={14}
              dotColor="#18181b"
              alpha={0.24}
              angleDeg={45}
              minRadius={0.06}
              maxRadius={0.42}
              speed={0.8}
              interactive={true}
              fadeBottom={true}
            />
          </div>

          {/* Foreground Card Content */}
          <div className="relative z-10 space-y-4 max-w-lg mx-auto">
            <Reveal delay={0.1} yOffset={10}>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
                {dict.contact.title}
              </h2>
            </Reveal>

            <Reveal delay={0.15} yOffset={10}>
              <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
                {dict.contact.subtitle}
              </p>
            </Reveal>

            <Reveal delay={0.2} yOffset={10}>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                <m.a
                  href={`mailto:${profile.email}`}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 text-white font-semibold text-xs sm:text-sm hover:bg-zinc-800 transition-colors shadow-xs"
                >
                  <span className="icon-[lucide--mail] size-4 inline-block" />
                  <span>{dict.contact.chatBtn}</span>
                </m.a>

                {profile.linkedinUrl && (
                  <m.a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 font-semibold text-xs sm:text-sm transition-colors shadow-2xs"
                  >
                    <span className="icon-[simple-icons--linkedin] size-4 inline-block text-[#0A66C2]" />
                    <span>LinkedIn</span>
                  </m.a>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

