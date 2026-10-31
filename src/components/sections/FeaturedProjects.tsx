"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Locale, Project } from "@/types/portfolio";
import { getDictionary, getLocalized } from "@/lib/i18n";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { NdaBadge } from "@/components/ui/NdaBadge";
import { getTechIcon } from "@/lib/tech-icons";
import { ProjectDetailModal } from "@/components/ui/ProjectDetailModal";

interface FeaturedProjectsProps {
  locale: Locale;
  projects: Project[];
  allProjects?: Project[];
  ndaBlurEnabled?: boolean;
}

const INITIAL_ALL_COUNT = 4;
const PAGE_SIZE = 4;

export function FeaturedProjects({
  locale,
  projects,
  allProjects = [],
  ndaBlurEnabled = true,
}: FeaturedProjectsProps) {
  const dict = getDictionary(locale);
  const [filter, setFilter] = useState<"featured" | "all">("featured");
  const [visibleAllCount, setVisibleAllCount] = useState<number>(INITIAL_ALL_COUNT);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const validProjects = React.useMemo(
    () => projects.filter((p) => p.isPublic !== false),
    [projects]
  );
  const validAllProjects = React.useMemo(
    () => allProjects.filter((p) => p.isPublic !== false),
    [allProjects]
  );
  const combinedProjects =
    validAllProjects.length > 0 ? validAllProjects : validProjects;

  const filteredProjects = React.useMemo(() => {
    if (filter === "featured") {
      return validProjects.length > 0
        ? validProjects
        : combinedProjects.slice(0, 6);
    }
    return combinedProjects.slice(0, visibleAllCount);
  }, [filter, validProjects, combinedProjects, visibleAllCount]);

  return (
    <section id="projects" className="space-y-4 pt-4 scroll-mt-6 sm:scroll-mt-8">
      <SectionHeader
        number="05"
        title={dict.projects.featuredTitle}
        hint={dict.projects.featuredSubtitle}
        delay={0.05}
      />

      {/* Filter Badges */}
      <Reveal delay={0.08} yOffset={6}>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setFilter("featured")}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              filter === "featured"
                ? "bg-zinc-900 text-white shadow-2xs"
                : "bg-zinc-100/80 hover:bg-zinc-200/80 text-zinc-600 hover:text-zinc-900 border border-zinc-200/60"
            }`}
          >
            <span>{dict.projects.filterFeatured}</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono leading-none ${
                filter === "featured"
                  ? "bg-zinc-800 text-zinc-200"
                  : "bg-zinc-200/90 text-zinc-600"
              }`}
            >
              {projects.length || 6}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              filter === "all"
                ? "bg-zinc-900 text-white shadow-2xs"
                : "bg-zinc-100/80 hover:bg-zinc-200/80 text-zinc-600 hover:text-zinc-900 border border-zinc-200/60"
            }`}
          >
            <span>{dict.projects.filterAll}</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono leading-none ${
                filter === "all"
                  ? "bg-zinc-800 text-zinc-200"
                  : "bg-zinc-200/90 text-zinc-600"
              }`}
            >
              {combinedProjects.length}
            </span>
          </button>
        </div>
      </Reveal>

      {/* Editorial Split Projects List */}
      <motion.div
        layout
        className="divide-y divide-zinc-200/80 pt-1"
      >
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project, index) => {
            const title = getLocalized(project, "title", locale);
            const summary = getLocalized(project, "summary", locale);
            const thumbnail = project.thumbnailUrl || project.bannerImage;
            const isEven = index % 2 === 0;

            return (
              <motion.article
                layout
                key={project.id || project.slug}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
                onClick={() => setSelectedProject(project)}
                className={`group relative py-7 sm:py-9 lg:py-10 cursor-pointer flex flex-col ${
                  isEven ? "md:flex-row" : "md:flex-row-reverse"
                } items-center gap-6 sm:gap-8 lg:gap-12`}
              >
                {/* Text Content Column */}
                <div className="w-full md:w-1/2 flex flex-col justify-center space-y-3.5 sm:space-y-4">
                  {/* Project Title & NDA indicator */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-zinc-900 group-hover:text-zinc-700 transition-colors leading-tight">
                      {title}
                    </h3>
                    {project.isNda && (
                      <span className="text-[10px] font-mono uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80 shrink-0">
                        NDA
                      </span>
                    )}
                  </div>

                  {/* Summary / Description */}
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                    {summary}
                  </p>

                  {/* Tech Stack Badges with colorful Icons */}
                  {project.techStack && project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {project.techStack.map((tech) => {
                        const techInfo = getTechIcon(tech);
                        return (
                          <span
                            key={tech}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-50 text-zinc-700 border border-zinc-200/80 shadow-2xs hover:bg-zinc-100 transition-colors"
                          >
                            <span
                              className={`${techInfo.iconClass} size-3.5 inline-block shrink-0`}
                              aria-hidden="true"
                            />
                            <span>{tech}</span>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Action Buttons & Links */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
                    {project.projectUrl && (
                      <motion.a
                        href={project.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-900 text-white font-medium text-xs hover:bg-zinc-800 transition-colors shadow-2xs"
                      >
                        <span className="icon-[lucide--globe] size-3.5 inline-block" />
                        <span>{dict.projects.website}</span>
                      </motion.a>
                    )}

                    {project.githubUrl && (
                      <motion.a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 font-medium text-xs transition-colors shadow-2xs"
                      >
                        <span className="icon-[simple-icons--github] size-3.5 inline-block" />
                        <span>{dict.projects.source}</span>
                      </motion.a>
                    )}
                  </div>
                </div>

                {/* Single Thumbnail Image Column */}
                <div className="w-full md:w-1/2 order-first md:order-none relative">
                  <div className="relative aspect-16/10 w-full rounded-xl sm:rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200/80 shadow-2xs group-hover:border-zinc-350 transition-all">
                    {thumbnail ? (
                      <Image
                        src={thumbnail}
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className={`object-cover transition-transform duration-500 ease-out group-hover:scale-104 ${
                          project.isNda && ndaBlurEnabled
                            ? "filter blur-[2.5px] group-hover:blur-none"
                            : ""
                        }`}
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center p-6 text-center bg-zinc-100">
                        <span className="font-mono text-xs uppercase tracking-wider text-zinc-400 line-clamp-1">
                          {title}
                        </span>
                      </div>
                    )}

                    {project.isNda && (
                      <div className="absolute top-3 right-3 z-10 pointer-events-none">
                        <NdaBadge label={dict.projects.ndaBadge} size="sm" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Load More Controls for "All Projects" */}
      {filter === "all" && combinedProjects.length > INITIAL_ALL_COUNT && (
        <Reveal delay={0.08} yOffset={6}>
          <div className="pt-6 sm:pt-8 flex flex-col items-center justify-center gap-3">
            {visibleAllCount < combinedProjects.length ? (
              <motion.button
                type="button"
                onClick={() =>
                  setVisibleAllCount((prev) =>
                    Math.min(prev + PAGE_SIZE, combinedProjects.length)
                  )
                }
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200/90 bg-white hover:bg-zinc-50 text-zinc-800 text-xs sm:text-sm font-medium shadow-2xs hover:shadow-xs hover:border-zinc-350 transition-all cursor-pointer"
              >
                <span className="icon-[lucide--chevron-down] size-4 inline-block text-zinc-500" />
                <span>{dict.projects.loadMore}</span>
                <span className="ml-1 px-1.5 py-0.5 rounded-md text-[11px] font-mono bg-zinc-100 text-zinc-600">
                  +{Math.min(PAGE_SIZE, combinedProjects.length - visibleAllCount)}
                </span>
              </motion.button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-zinc-400">
                  {locale === "id"
                    ? `Semua ${combinedProjects.length} proyek telah ditampilkan`
                    : `All ${combinedProjects.length} projects displayed`}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setVisibleAllCount(INITIAL_ALL_COUNT);
                    const section = document.getElementById("projects");
                    if (section) section.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="text-xs font-medium text-zinc-500 hover:text-zinc-900 underline underline-offset-4 cursor-pointer"
                >
                  {dict.projects.showLess}
                </button>
              </div>
            )}
          </div>
        </Reveal>
      )}

      {/* Full Modal Project Detail */}
      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        locale={locale}
        dict={dict}
        ndaBlurEnabled={ndaBlurEnabled}
      />
    </section>
  );
}
