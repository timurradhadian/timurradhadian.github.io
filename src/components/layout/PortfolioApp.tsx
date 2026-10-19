"use client";

import React from "react";
import { useLocale } from "@/context/LocaleContext";
import {
  Profile,
  Experience,
  Education as EducationType,
  Skill,
  Project,
  Certificate,
} from "@/types/portfolio";
import { Hero } from "@/components/sections/Hero";
import { Experiences } from "@/components/sections/Experiences";
import { Education } from "@/components/sections/Education";
import { Skills } from "@/components/sections/Skills";
import { FeaturedProjects } from "@/components/sections/FeaturedProjects";
import { Certificates } from "@/components/sections/Certificates";
import { Contact } from "@/components/sections/Contact";

interface PortfolioAppProps {
  profile: Profile;
  experiences: Experience[];
  educations?: EducationType[];
  skills: Skill[];
  featuredProjects: Project[];
  allProjects: Project[];
  certificates: Certificate[];
  ndaBlurEnabled?: boolean;
}

export function PortfolioApp({
  profile,
  experiences,
  educations = [],
  skills,
  featuredProjects,
  allProjects,
  certificates,
  ndaBlurEnabled = true,
}: PortfolioAppProps) {
  const { locale } = useLocale();

  return (
    <>
      <Hero locale={locale} profile={profile} />
      <Experiences
        locale={locale}
        experiences={experiences}
        allProjects={allProjects}
      />
      <Education locale={locale} educations={educations} />
      <Skills locale={locale} skills={skills} />
      <FeaturedProjects
        locale={locale}
        projects={featuredProjects}
        allProjects={allProjects}
        ndaBlurEnabled={ndaBlurEnabled}
      />
      <Certificates locale={locale} certificates={certificates} />
      <Contact locale={locale} profile={profile} />
    </>
  );
}
