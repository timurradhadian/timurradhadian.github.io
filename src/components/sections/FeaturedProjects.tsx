"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Locale, Project } from "@/types/portfolio";
import { getDictionary, getLocalized } from "@/lib/i18n";
import { Reveal } from "@/components/motion/Reveal";
import { NdaBadge } from "@/components/ui/NdaBadge";
import { getTechIcon } from "@/lib/tech-icons";
import { ProjectDetailModal } from "@/components/ui/ProjectDetailModal";

interface FeaturedProjectsProps {
  locale: Locale;
  projects: Project[];
  allProjects?: Project[];
  ndaBlurEnabled?: boolean;
}

export function FeaturedProjects({
  locale,
  projects,
  allProjects = [],
  ndaBlurEnabled = true,
}: FeaturedProjectsProps) {
  const dict = getDictionary(locale);
  const [filter, setFilter] = useState<"featured" | "all">("featured");
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
    return combinedProjects;
  }, [filter, validProjects, combinedProjects]);

  return (
    <section id="projects" className="space-y-6 pt-6">
      {/* Centered Section Header */}
      <div className="flex flex-col items-center text-center space-y-2">
        <Reveal delay={0.05} yOffset={10}>
          <span className="inline-block rounded-md bg-zinc-100 text-zinc-900 border border-zinc-200 px-3 py-1 text-xs font-semibold shadow-2xs">
            {dict.projects.badge}
          </span>
        </Reveal>

        <Reveal delay={0.1} yOffset={12}>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
            {dict.projects.featuredTitle}
          </h2>
        </Reveal>

        <Reveal delay={0.15} yOffset={12}>
          <p className="text-sm sm:text-base text-ink-muted max-w-xl mx-auto leading-relaxed">
            {dict.projects.featuredSubtitle}
          </p>
        </Reveal>

        {/* Filter Pills */}
        <Reveal delay={0.2} yOffset={10}>
          <div className="inline-flex items-center gap-1 p-1 rounded-xl border border-zinc-200 bg-white mt-4 text-xs font-medium shadow-2xs">
            <button
              type="button"
              onClick={() => setFilter("featured")}
              className={`relative px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer select-none ${
                filter === "featured"
                  ? "text-white font-semibold"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              {filter === "featured" && (
                <motion.span
                  layoutId="activeFilterPill"
                  className="absolute inset-0 rounded-lg bg-zinc-900 shadow-xs"
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                />
              )}
              <span className="relative z-10">
                {dict.projects.filterFeatured} ({projects.length || 6})
              </span>
            </button>
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`relative px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer select-none ${
                filter === "all"
                  ? "text-white font-semibold"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              {filter === "all" && (
                <motion.span
                  layoutId="activeFilterPill"
                  className="absolute inset-0 rounded-lg bg-zinc-900 shadow-xs"
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                />
              )}
              <span className="relative z-10">
                {dict.projects.filterAll} ({combinedProjects.length})
              </span>
            </button>
          </div>
        </Reveal>
      </div>

      {/* 2-Column Responsive Card Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2"
      >
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project) => {
            const title = getLocalized(project, "title", locale);
            const summary = getLocalized(project, "summary", locale);
            const category = getLocalized(project, "category", locale);

            return (
              <motion.article
                layout
                key={project.id || project.slug}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
                onClick={() => setSelectedProject(project)}
                className="group relative rounded-xl border border-zinc-200/90 bg-white flex flex-col justify-between overflow-hidden hover:border-zinc-350 hover:shadow-md transition-shadow shadow-xs cursor-pointer"
              >
                <div>
                  {/* Thumbnail / Media Container */}
                  <div className="relative aspect-video w-full overflow-hidden bg-zinc-50">
                    {project.thumbnailUrl ? (
                      <Image
                        src={project.thumbnailUrl}
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className={`object-cover transition-all duration-300 ease-out group-hover:scale-103 ${project.isNda && ndaBlurEnabled
                            ? "filter blur-[2px] group-hover:blur-none"
                            : ""
                          }`}
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center p-4 text-center bg-zinc-100">
                        <span className="font-mono text-xs uppercase tracking-wider text-zinc-500">
                          {category}
                        </span>
                      </div>
                    )}

                    {project.isNda && (
                      <div className="absolute top-2.5 right-2.5 z-10">
                        <NdaBadge label={dict.projects.ndaBadge} size="sm" />
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-sm sm:text-base text-zinc-900 line-clamp-1 group-hover:text-zinc-950">
                        {title}
                      </h3>
                      {project.projectUrl && (
                        <a
                          href={project.projectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Open ${title}`}
                          className="text-zinc-400 hover:text-zinc-800 shrink-0 transition-colors"
                        >
                          <span className="icon-[lucide--external-link] size-3.5 inline-block" />
                        </a>
                      )}
                    </div>

                    <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                      {category}
                    </p>

                    <p className="text-xs text-zinc-600 leading-relaxed line-clamp-3">
                      {summary}
                    </p>
                  </div>
                </div>

                {/* Card Footer: Tech Stack with Colorful Iconify Icons & Links */}
                <div className="p-4 pt-0 space-y-3">
                  {project.techStack && project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {project.techStack.map((tech) => {
                        const techInfo = getTechIcon(tech);

                        return (
                          <span
                            key={tech}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-zinc-50 text-zinc-700 border border-zinc-200/80 shadow-2xs"
                          >
                            <span
                              className={`${techInfo.iconClass} size-3 inline-block shrink-0`}
                              aria-hidden="true"
                            />
                            <span>{tech}</span>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">

                    {project.projectUrl && (
                      <motion.a
                        href={project.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-white font-medium text-xs hover:bg-zinc-800 transition-colors shadow-2xs"
                      >
                        <span className="icon-[lucide--globe] size-3 inline-block" />
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 font-medium text-xs transition-colors shadow-2xs"
                      >
                        <span className="icon-[simple-icons--github] size-3 inline-block" />
                        <span>{dict.projects.source}</span>
                      </motion.a>
                    )}

                    {project.isNda && (
                      <span className="text-[11px] text-amber-800 italic flex items-center gap-1 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <span className="icon-[lucide--lock] size-3 inline-block" />
                        <span>{dict.projects.ndaBadge}</span>
                      </span>
                    )}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </motion.div>

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
