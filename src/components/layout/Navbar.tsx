"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Locale } from "@/types/portfolio";
import { getDictionary } from "@/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface NavbarProps {
  locale: Locale;
}

export function Navbar({ locale }: NavbarProps) {
  const dict = getDictionary(locale);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: `#experience`, label: dict.nav.experience },
    { href: `#skills`, label: dict.nav.skills },
  ];

  return (
    <>
      <a href="#main-content" className="skip-link">
        {dict.common.skipToContent}
      </a>

      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-canvas/85 backdrop-blur-md transition-colors">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 text-ink hover:text-cobalt transition-colors focus-visible:outline-2 focus-visible:outline-cobalt focus-visible:outline-offset-2 rounded-sm"
          >
            <span className="font-serif text-lg font-bold tracking-tight">
              Timur Dian
            </span>
            <span className="hidden sm:inline-block text-xs font-mono uppercase px-2 py-0.5 rounded-full bg-border/40 text-ink-muted">
              SE
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-ink-muted hover:text-ink transition-colors focus-visible:outline-2 focus-visible:outline-cobalt focus-visible:outline-offset-2 rounded-sm"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher currentLocale={locale} />

            <a
              href="#contact"
              className="hidden sm:inline-flex items-center justify-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-cobalt text-white hover:bg-cobalt-hover transition-colors shadow-xs focus-visible:outline-2 focus-visible:outline-cobalt focus-visible:outline-offset-2"
            >
              {dict.nav.contact}
            </a>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-ink-muted hover:text-ink hover:bg-surface focus-visible:outline-2 focus-visible:outline-cobalt"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <span
                className={`${
                  mobileMenuOpen ? "icon-[lucide--x]" : "icon-[lucide--menu]"
                } size-5 inline-block`}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-surface px-4 py-4 space-y-3">
            <nav className="flex flex-col space-y-2" aria-label="Mobile Navigation">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-md text-sm font-medium text-ink-muted hover:text-ink hover:bg-canvas transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md text-sm font-medium text-cobalt hover:bg-canvas transition-colors"
              >
                {dict.nav.contact}
              </a>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
