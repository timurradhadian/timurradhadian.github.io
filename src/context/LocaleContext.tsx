"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Locale } from "@/types/portfolio";
import { Dictionary, getDictionary } from "@/lib/i18n";

interface LocaleContextType {
  locale: Locale;
  setLocale: (next: Locale) => void;
  dict: Dictionary;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

interface LocaleProviderProps {
  initialLocale: Locale;
  children: React.ReactNode;
}

export function LocaleProvider({
  initialLocale,
  children,
}: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  // Keep state synced with route params
  useEffect(() => {
    setLocaleState(initialLocale);
  }, [initialLocale]);

  const setLocale = (next: Locale) => {
    if (next === locale) return;
    setLocaleState(next);

    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      const newPath = currentPath.replace(/^\/(id|en)(\/|$)/, `/${next}$2`);
      const target = newPath.startsWith(`/${next}`) ? newPath : `/${next}/`;
      window.history.pushState(null, "", `${target}${window.location.hash}`);
      document.documentElement.lang = next;
    }
  };

  const dict = getDictionary(locale);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, dict }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextType {
  const context = useContext(LocaleContext);
  if (!context) {
    return {
      locale: "id",
      setLocale: () => {},
      dict: getDictionary("id"),
    };
  }
  return context;
}

