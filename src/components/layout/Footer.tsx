import React from "react";
import { Locale, Profile } from "@/types/portfolio";
import { getDictionary } from "@/lib/i18n";

interface FooterProps {
  locale: Locale;
  profile: Profile;
}

export function Footer({ locale, profile }: FooterProps) {
  const dict = getDictionary(locale);

  return (
    <footer className="border-t border-border/50 py-10 pb-28 text-center text-xs text-ink-muted transition-colors">
      <div className="max-w-2xl mx-auto px-6 space-y-2">
        <p>
          &copy; {new Date().getFullYear()} {profile.name}. {dict.footer.allRightsReserved}
        </p>
        <p className="text-[11px] opacity-75">
          {dict.footer.builtWith}
        </p>
      </div>
    </footer>
  );
}
