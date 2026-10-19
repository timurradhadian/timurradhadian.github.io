import React from "react";
import { Locale } from "@/types/portfolio";
import { LOCALES, getDictionary } from "@/lib/i18n";
import { getPortfolioData } from "@/lib/api";
import { LocaleProvider } from "@/context/LocaleContext";
import { FloatingDock } from "@/components/ui/FloatingDock";
import { Particles } from "@/components/ui/Particles";
import { DotPattern } from "@/components/ui/DotPattern";

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
    <LocaleProvider initialLocale={locale}>
      <div className="flex min-h-screen flex-col bg-canvas text-ink transition-colors selection:bg-zinc-900 selection:text-white relative overflow-x-hidden">
        {/* Top Ambient Particle & Dot Pattern Banner */}
        <div
          className="absolute top-0 left-0 right-0 h-52 sm:h-72 w-full overflow-hidden pointer-events-none z-0"
          style={{
            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0) 100%)",
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0) 100%)",
          }}
        >
          <DotPattern
            width={16}
            height={16}
            cx={1}
            cy={1}
            cr={1.2}
            className="fill-zinc-900/15"
          />
          <Particles
            className="absolute inset-0 size-full"
            quantity={140}
            ease={60}
            size={1.2}
            color="#18181b"
            refresh
          />
        </div>

        <a href="#main-content" className="skip-link">
          {dict.common.skipToContent}
        </a>

        <main
          id="main-content"
          className="relative z-10 flex-1 max-w-2xl mx-auto px-6 pt-12 md:pt-20 pb-28 sm:pb-32 w-full space-y-12 md:space-y-16"
        >
          {children}
        </main>

        <FloatingDock
          locale={locale}
          email={data.profile.email}
          githubUrl={data.profile.githubUrl}
          linkedinUrl={data.profile.linkedinUrl}
        />
      </div>
    </LocaleProvider>
  );
}
