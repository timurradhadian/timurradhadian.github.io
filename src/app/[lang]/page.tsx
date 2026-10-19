import React from "react";
import type { Metadata } from "next";
import { Locale } from "@/types/portfolio";
import { LOCALES, getLocalized } from "@/lib/i18n";
import { getPortfolioData } from "@/lib/api";
import { Hero } from "@/components/sections/Hero";
import { Experiences } from "@/components/sections/Experiences";
import { Education } from "@/components/sections/Education";
import { Skills } from "@/components/sections/Skills";
import { FeaturedProjects } from "@/components/sections/FeaturedProjects";
import { Certificates } from "@/components/sections/Certificates";
import { Contact } from "@/components/sections/Contact";

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
  const locale: Locale = lang === "en" ? "en" : "id";
  const data = await getPortfolioData();

  const allProjects = [...data.featuredProjects, ...data.otherProjects];

  return (
    <>
      <Hero locale={locale} profile={data.profile} />
      <Experiences
        locale={locale}
        experiences={data.experiences}
        allProjects={allProjects}
      />
      <Education locale={locale} educations={data.educations} />
      <Skills locale={locale} skills={data.skills} />
      <FeaturedProjects
        locale={locale}
        projects={data.featuredProjects}
        allProjects={allProjects}
      />
      <Certificates locale={locale} certificates={data.certificates} />
      <Contact locale={locale} profile={data.profile} />
    </>
  );
}
