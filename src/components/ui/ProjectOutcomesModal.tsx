"use client";

import React, { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Locale, Project } from "@/types/portfolio";
import { getDictionary, getLocalized, getLocalizedArray } from "@/lib/i18n";
import { getTechIcon } from "@/lib/tech-icons";
import { NdaBadge } from "@/components/ui/NdaBadge";

interface ProjectOutcomesModalProps {
  project: Project | null;
  onClose: () => void;
  locale: Locale;
  onOpenFullDetail?: (project: Project) => void;
}

export function ProjectOutcomesModal({
  project,
  onClose,
  locale,
  onOpenFullDetail,
}: ProjectOutcomesModalProps) {
  const dict = getDictionary(locale);

  // Lock body scroll and listen for ESC key
  useEffect(() => {
    if (!project) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [project, onClose]);

  const title = useMemo(() => {
    if (!project) return "";
    return getLocalized(project, "title", locale);
  }, [project, locale]);

  const summary = useMemo(() => {
    if (!project) return "";
    return getLocalized(project, "summary", locale);
  }, [project, locale]);

  const category = useMemo(() => {
    if (!project) return "";
    return getLocalized(project, "category", locale);
  }, [project, locale]);

  const keyOutcomes = useMemo(() => {
    if (!project) return [];
    return getLocalizedArray(project, "keyOutcomes", locale);
  }, [project, locale]);

  const techStack = useMemo(() => {
    if (!project || !Array.isArray(project.techStack)) return [];
    return project.techStack;
  }, [project]);

  const isOpen = Boolean(project);

  return (
    <AnimatePresence>
      {isOpen && project && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            key="outcomes-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs cursor-pointer"
            aria-hidden="true"
          />

          {/* Centered Modal Dialog (Enlarged max-w-4xl) */}
          <motion.div
            key={`outcomes-modal-dialog-${project.id || project.slug}`}
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-4xl max-h-[88vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-zinc-200/90 overflow-hidden flex flex-col font-sans my-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="outcomes-dialog-title"
          >
            {/* Header */}
            <div className="p-6 sm:p-8 pb-5 border-b border-zinc-200/80 flex items-start justify-between gap-4 bg-zinc-50/70">
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  {category && (
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      {category}
                    </span>
                  )}
                  {project.isNda && (
                    <NdaBadge label={dict.projects.ndaBadge} size="sm" />
                  )}
                </div>
                <h3
                  id="outcomes-dialog-title"
                  className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 leading-tight"
                >
                  {title}
                </h3>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                aria-label={dict.projects.closeModal || "Tutup"}
                className="size-9 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 text-zinc-600 hover:text-zinc-950 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
              >
                <span className="icon-[lucide--x] size-4.5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 sm:space-y-7 flex-1">
              {/* 1. Ringkasan Proyek */}
              {summary && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="icon-[lucide--file-text] size-4.5 text-zinc-500" />
                    <h4 className="text-sm font-semibold text-zinc-900">
                      {locale === "id" ? "Ringkasan Proyek" : "Project Summary"}
                    </h4>
                  </div>
                  <p className="text-sm sm:text-base text-zinc-600 leading-relaxed pl-6.5">
                    {summary}
                  </p>
                </div>
              )}

              {/* 2. Hasil & Dampak Utama (Outcomes) - Flat Divided Rows (Work Experience Style) */}
              {keyOutcomes.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-zinc-100">
                  <div className="flex items-center gap-2">
                    <span className="icon-[lucide--target] size-4.5 text-emerald-600" />
                    <h4 className="text-sm font-semibold text-zinc-900">
                      {dict.projects.outcomesTitle ||
                        (locale === "id"
                          ? "Hasil & Dampak Utama"
                          : "Key Outcomes & Impact")}
                    </h4>
                  </div>

                  {/* Clean Borderless List matching Work Experience */}
                  <div className="border-t border-zinc-200/70 divide-y divide-zinc-200/70 mt-2">
                    {keyOutcomes.map((point, idx) => (
                      <div
                        key={idx}
                        className="py-3 sm:py-3.5 flex items-start gap-3 px-1"
                      >
                        <span className="icon-[lucide--check] size-4 text-emerald-600 shrink-0 mt-0.5" />
                        <p className="text-sm sm:text-base text-zinc-700 leading-relaxed flex-1">
                          {point}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Tech Stack */}
              {techStack.length > 0 && (
                <div className="space-y-2.5 pt-4 border-t border-zinc-100">
                  <div className="flex items-center gap-2">
                    <span className="icon-[lucide--layers] size-4.5 text-zinc-500" />
                    <h4 className="text-sm font-semibold text-zinc-900">
                      {dict.projects.techUsed ||
                        (locale === "id" ? "Teknologi yang Digunakan" : "Technologies Used")}
                    </h4>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pl-6.5 pt-0.5">
                    {techStack.map((tech) => {
                      const techInfo = getTechIcon(tech);
                      return (
                        <span
                          key={tech}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-50 text-zinc-700 border border-zinc-200/80 shadow-2xs"
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
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 px-6 sm:px-8 border-t border-zinc-200/80 bg-zinc-50/70 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-xs sm:text-sm flex-wrap">
                {onOpenFullDetail && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenFullDetail(project);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-white font-medium text-xs sm:text-sm hover:bg-zinc-800 transition-colors shadow-2xs cursor-pointer"
                  >
                    <span className="icon-[lucide--file-text] size-4" />
                    <span>
                      {locale === "id"
                        ? "Buka Detail Lengkap / Studi Kasus"
                        : "Open Full Details & Case Study"}
                    </span>
                    <span className="icon-[lucide--arrow-right] size-3.5" />
                  </button>
                )}

                {project.projectUrl && !project.isNda && (
                  <a
                    href={project.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 font-medium text-zinc-700 hover:text-zinc-950 transition-colors"
                  >
                    <span className="icon-[lucide--globe] size-4 text-zinc-500" />
                    <span>{dict.projects.website}</span>
                  </a>
                )}
                {project.githubUrl && !project.isNda && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 font-medium text-zinc-700 hover:text-zinc-950 transition-colors"
                  >
                    <span className="icon-[simple-icons--github] size-4 text-zinc-500" />
                    <span>{dict.projects.source}</span>
                  </a>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-800 text-xs sm:text-sm font-medium transition-colors cursor-pointer shadow-2xs"
              >
                {dict.projects.closeModal || (locale === "id" ? "Tutup" : "Close")}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
