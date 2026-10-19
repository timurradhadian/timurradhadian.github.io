import React from "react";
import { Locale } from "@/types/portfolio";
import { LOCALES, getDictionary } from "@/lib/i18n";
import { getPortfolioData } from "@/lib/api";
import { FloatingDock } from "@/components/ui/FloatingDock";
import { Footer } from "@/components/layout/Footer";

export async function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { lang } = await params;
  const locale: Locale = lang === "en" ? "en" : "id";
  const data = await getPortfolioData();
  const dict = getDictionary(locale);

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink transition-colors selection:bg-zinc-900 selection:text-white">
      <a href="#main-content" className="skip-link">
        {dict.common.skipToContent}
      </a>

      <main
        id="main-content"
        className="flex-1 max-w-2xl mx-auto px-6 py-12 md:py-20 w-full space-y-12 md:space-y-16"
      >
        {children}
      </main>

      <Footer locale={locale} profile={data.profile} />

      <FloatingDock
        locale={locale}
        email={data.profile.email}
        githubUrl={data.profile.githubUrl}
        linkedinUrl={data.profile.linkedinUrl}
      />
    </div>
  );
}
