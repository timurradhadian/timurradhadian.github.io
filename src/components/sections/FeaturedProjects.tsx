"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Locale, Project } from "@/types/portfolio";
import { getDictionary, getLocalized } from "@/lib/i18n";
import { Reveal } from "@/components/motion/Reveal";
import { NdaBadge } from "@/components/ui/NdaBadge";

interface FeaturedProjectsProps {
  locale: Locale;
  projects: Project[];
  allProjects?: Project[];
}

export function FeaturedProjects({
  locale,
  projects,
  allProjects = [],
}: FeaturedProjectsProps) {
  const dict = getDictionary(locale);
  const [filter, setFilter] = useState<"featured" | "all" | "nda">("featured");

  const combinedProjects = allProjects.length > 0 ? allProjects : projects;

  const filteredProjects = React.useMemo(() => {
    if (filter === "featured") {
      return projects.length > 0 ? projects : combinedProjects.slice(0, 6);
    }
    if (filter === "nda") {
      return combinedProjects.filter((p) => p.isNda);
    }
    return combinedProjects;
  }, [filter, projects, combinedProjects]);

  return (
    <section id="projects" className="space-y-6 pt-6">
      {/* Centered Section Header */}
      <div className="flex flex-col items-center text-center space-y-2">
        <Reveal delay={0.05} yOffset={10}>
          <span className="inline-block rounded-md bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 px-3 py-1 text-xs font-semibold shadow-xs">
            {dict.projects.badge}
          </span>
        </Reveal>

        <Reveal delay={0.1} yOffset={14}>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
            {dict.projects.featuredTitle}
          </h2>
        </Reveal>

        <Reveal delay={0.15} yOffset={14}>
          <p className="text-sm sm:text-base text-ink-muted max-w-xl mx-auto leading-relaxed">
            {dict.projects.featuredSubtitle}
          </p>
        </Reveal>

        {/* Filter Pills */}
        <Reveal delay={0.2} yOffset={10}>
          <div className="inline-flex items-center gap-1.5 p-1 rounded-xl border border-border bg-surface/60 mt-4 text-xs font-medium">
            <button
              type="button"
              onClick={() => setFilter("featured")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filter === "featured"
                  ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-xs"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {dict.projects.filterFeatured} ({projects.length || 6})
            </button>
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filter === "all"
                  ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-xs"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {dict.projects.filterAll} ({combinedProjects.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("nda")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filter === "nda"
                  ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-xs"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {dict.projects.filterNda}
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
          {filteredProjects.map((project, idx) => {
            const title = getLocalized(project, "title", locale);
            const summary = getLocalized(project, "summary", locale);
            const category = getLocalized(project, "category", locale);

            return (
              <motion.article
                layout
                key={project.id || project.slug}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, delay: idx * 0.03 }}
                className="group relative rounded-xl border border-border/80 bg-surface/40 hover:bg-surface/80 flex flex-col justify-between overflow-hidden hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-md transition-all"
              >
                <div>
                  {/* Thumbnail / Media Container */}
                  <div className="relative aspect-video w-full overflow-hidden bg-canvas border-b border-border/60">
                    {project.thumbnailUrl ? (
                      <Image
                        src={project.thumbnailUrl}
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="object-cover transition-transform duration-300 ease-out group-hover:scale-104"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center p-4 text-center bg-canvas-subtle">
                        <span className="font-mono text-xs uppercase tracking-wider text-ink-muted">
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
                      <h3 className="font-semibold text-sm sm:text-base text-ink line-clamp-1 group-hover:text-ink">
                        {title}
                      </h3>
                      {project.projectUrl && (
                        <a
                          href={project.projectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open ${title}`}
                          className="text-ink-muted hover:text-ink shrink-0"
                        >
                          <span className="icon-[lucide--external-link] size-3.5 inline-block" />
                        </a>
                      )}
                    </div>

                    <p className="text-[11px] font-mono text-ink-muted uppercase tracking-wider">
                      {category}
                    </p>

                    <p className="text-xs text-ink-muted leading-relaxed line-clamp-3">
                      {summary}
                    </p>
                  </div>
                </div>

                {/* Card Footer: Tech Stack & Links */}
                <div className="p-4 pt-0 space-y-3">
                  {project.techStack && project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.techStack.slice(0, 5).map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-canvas text-ink-muted border border-border/60"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.techStack.length > 5 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-canvas text-ink-muted border border-border/60">
                          +{project.techStack.length - 5}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border/50 text-xs">
                    {project.projectUrl && (
                      <a
                        href={project.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 font-medium text-[11px] hover:opacity-90 transition-opacity"
                      >
                        <span className="icon-[lucide--globe] size-3 inline-block" />
                        <span>{dict.projects.website}</span>
                      </a>
                    )}

                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-canvas text-ink hover:bg-surface font-medium text-[11px] transition-colors"
                      >
                        <span className="icon-[lucide--github] size-3 inline-block" />
                        <span>{dict.projects.source}</span>
                      </a>
                    )}

                    {project.isNda && (
                      <span className="text-[11px] text-amber-600 dark:text-amber-400 italic flex items-center gap-1">
                        <span className="icon-[lucide--lock] size-3 inline-block" />
                        <span>NDA</span>
                      </span>
                    )}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
