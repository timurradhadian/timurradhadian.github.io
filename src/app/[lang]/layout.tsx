import React from "react";
import { Locale } from "@/types/portfolio";
import { LOCALES, getDictionary } from "@/lib/i18n";
import { getPortfolioData } from "@/lib/api";
import { FloatingDock } from "@/components/ui/FloatingDock";
import { Footer } from "@/components/layout/Footer";
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
    <div className="flex min-h-screen flex-col bg-canvas text-ink transition-colors selection:bg-zinc-900 selection:text-white relative overflow-x-hidden">
      {/* Top Ambient Particle & Dot Pattern Banner */}
      <div className="absolute top-0 left-0 right-0 h-48 sm:h-64 w-full overflow-hidden pointer-events-none -z-10 [mask-image:linear-gradient(to_bottom,white_35%,transparent_100%)]">
        <DotPattern
          width={15}
          height={15}
          cx={1}
          cy={1}
          cr={1}
          className="fill-zinc-400/35"
        />
        <Particles
          className="absolute inset-0 size-full"
          quantity={130}
          ease={70}
          size={0.6}
          color="#18181b"
          refresh
        />
      </div>

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
