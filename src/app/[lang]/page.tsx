import React from "react";
import type { Metadata } from "next";
import { Locale } from "@/types/portfolio";
import { LOCALES, getLocalized } from "@/lib/i18n";
import { getPortfolioData } from "@/lib/api";
import { PortfolioApp } from "@/components/layout/PortfolioApp";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = lang === "en" ? "en" : "id";
  const data = await getPortfolioData();
  const localizedRole = getLocalized(data.profile, "role", locale);
  const localizedBio = getLocalized(data.profile, "bio", locale);

  const title = `${data.profile.name} — ${localizedRole}`;
  const description = localizedBio;

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        id: "/id",
        en: "/en",
      },
    },
    openGraph: {
      title,
      description,
      locale: locale === "id" ? "id_ID" : "en_US",
      type: "website",
    },
  };
}

export default async function PortfolioPage({ params }: PageProps) {
  const { lang } = await params;
  const data = await getPortfolioData();

  const allProjects = [...data.featuredProjects, ...data.otherProjects];

  return (
    <PortfolioApp
      profile={data.profile}
      experiences={data.experiences}
      educations={data.educations}
      skills={data.skills}
      featuredProjects={data.featuredProjects}
      allProjects={allProjects}
      certificates={data.certificates}
      ndaBlurEnabled={data.ndaBlurEnabled}
    />
  );
}
