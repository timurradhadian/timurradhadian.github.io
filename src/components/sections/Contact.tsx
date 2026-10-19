import React from "react";
import { Locale, Profile } from "@/types/portfolio";
import { getDictionary } from "@/lib/i18n";
import { Reveal } from "@/components/motion/Reveal";

interface ContactProps {
  locale: Locale;
  profile: Profile;
}

export function Contact({ locale, profile }: ContactProps) {
  const dict = getDictionary(locale);

  return (
    <section id="contact" className="space-y-6 pt-10 pb-8 text-center">
      <Reveal delay={0.05} yOffset={10}>
        <span className="inline-block rounded-md bg-zinc-900 text-white px-3 py-1 text-xs font-semibold shadow-xs">
          {dict.contact.badge}
        </span>
      </Reveal>

      <Reveal delay={0.1} yOffset={12}>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
          {dict.contact.title}
        </h2>
      </Reveal>

      <Reveal delay={0.15} yOffset={12}>
        <p className="text-sm sm:text-base text-ink-muted max-w-lg mx-auto leading-relaxed">
          {dict.contact.subtitle}
        </p>
      </Reveal>

      <Reveal delay={0.2} yOffset={12}>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href={`mailto:${profile.email}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 text-white font-semibold text-xs sm:text-sm hover:bg-zinc-800 hover:scale-105 active:scale-95 transition-all shadow-xs"
          >
            <span className="icon-[lucide--mail] size-4 inline-block" />
            <span>{dict.contact.chatBtn}</span>
          </a>

          <a
            href={profile.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-white text-ink hover:bg-zinc-50 font-semibold text-xs sm:text-sm hover:scale-105 active:scale-95 transition-all shadow-2xs"
          >
            <span className="icon-[simple-icons--linkedin] size-4 inline-block" />
            <span>LinkedIn</span>
          </a>
        </div>
      </Reveal>
    </section>
  );
}
