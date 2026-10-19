"use client";

import React from "react";
import { useLocale } from "@/context/LocaleContext";
import { Locale } from "@/types/portfolio";

interface LanguageSwitcherProps {
  currentLocale?: Locale;
}

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const { locale, setLocale } = useLocale();
  const activeLocale = locale || currentLocale || "id";

  return (
    <div className="flex items-center gap-1 p-0.5 rounded-full border border-border bg-surface text-xs font-medium">
      <button
        type="button"
        onClick={() => setLocale("id")}
        className={`px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
          activeLocale === "id"
            ? "bg-cobalt text-white font-semibold shadow-xs"
            : "text-ink-muted hover:text-ink"
        }`}
        aria-label="Bahasa Indonesia"
      >
        ID
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
          activeLocale === "en"
            ? "bg-cobalt text-white font-semibold shadow-xs"
            : "text-ink-muted hover:text-ink"
        }`}
        aria-label="English"
      >
        EN
      </button>
    </div>
  );
}
