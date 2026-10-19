"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Locale, Project } from "@/types/portfolio";
import { Dictionary, getLocalized } from "@/lib/i18n";
import { getTechIcon } from "@/lib/tech-icons";
import { NdaBadge } from "@/components/ui/NdaBadge";

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
  locale: Locale;
  dict: Dictionary;
  ndaBlurEnabled?: boolean;
}

export function ProjectDetailModal({
  project,
  onClose,
  locale,
  dict,
  ndaBlurEnabled = true,
}: ProjectDetailModalProps) {
  useEffect(() => {
    if (!project) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  const title = getLocalized(project, "title", locale);
  const summary = getLocalized(project, "summary", locale);
  const description = getLocalized(project, "description", locale);
  const category = getLocalized(project, "category", locale);

  const formatTimeline = () => {
    if (project.startDate && project.endDate) {
      const start = new Date(project.startDate).getFullYear();
      const end = new Date(project.endDate).getFullYear();
      return start === end ? `${start}` : `${start} – ${end}`;
    }
    return null;
  };

  const timelineStr = formatTimeline();

  // Helper to render markdown-like NDA description blocks
  const renderDescription = (text: string) => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
    return (
      <div className="space-y-2.5 text-xs sm:text-sm text-zinc-600 leading-relaxed">
        {lines.map((line, idx) => {
          if (line.startsWith("###")) {
            return (
              <h4
                key={idx}
                className="font-semibold text-zinc-900 pt-2 text-sm sm:text-base flex items-center gap-2"
              >
                <span>{line.replace(/^###\s*/, "")}</span>
              </h4>
            );
          }
          if (line.startsWith("-") || line.startsWith("•") || line.startsWith("*")) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="size-1.5 rounded-full bg-zinc-400 mt-2 shrink-0" />
                <span>{line.replace(/^[\-\•\*]\s*/, "")}</span>
              </div>
            );
          }
          return (
            <p key={idx} className="text-zinc-600">
              {line}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm cursor-pointer"
          aria-hidden="true"
        />

        {/* Modal Window */}
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-modal-title"
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl border border-zinc-200 shadow-2xl flex flex-col overflow-hidden z-10"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label={dict.projects.closeModal}
            className="absolute top-3.5 right-3.5 z-20 size-8 sm:size-9 rounded-full bg-white/90 hover:bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200/90 flex items-center justify-center shadow-xs backdrop-blur-xs transition-colors cursor-pointer"
          >
            <span className="icon-[lucide--x] size-4" />
          </button>

          {/* Scrollable Container */}
          <div className="overflow-y-auto overscroll-contain">
            {/* Hero / Cover Image */}
            <div className="relative aspect-[16/9] w-full bg-zinc-100 overflow-hidden">
              {project.thumbnailUrl ? (
                <Image
                  src={project.thumbnailUrl}
                  alt={title}
                  fill
                  sizes="(max-width: 768px) 100vw, 680px"
                  className={`object-cover ${
                    project.isNda && ndaBlurEnabled
                      ? "filter blur-[3px] scale-102"
                      : ""
                  }`}
                  priority
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-zinc-100 text-zinc-400 font-mono text-sm uppercase tracking-wider">
                  {category}
                </div>
              )}

              {/* Watermark Overlay for NDA Projects */}
              {project.isNda && (
                <div className="absolute inset-0 bg-zinc-950/30 flex items-center justify-center p-4">
                  <div className="px-3.5 py-1.5 rounded-lg bg-zinc-900/85 border border-white/20 backdrop-blur-md shadow-lg flex items-center gap-2 text-white">
                    <span className="icon-[lucide--shield-lock] size-4 text-amber-400 shrink-0" />
                    <span className="font-mono text-xs uppercase tracking-widest font-semibold">
                      {dict.projects.confidentialStamp}
                    </span>
                  </div>
                </div>
              )}

              {/* Badge on Top-Left */}
              <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 z-10">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-mono uppercase tracking-wider font-semibold bg-white/90 text-zinc-800 border border-zinc-200/80 backdrop-blur-xs shadow-2xs">
                  {category}
                </span>
                {project.isNda && (
                  <NdaBadge label={dict.projects.ndaBadge} size="sm" />
                )}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-6">
              {/* Header Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                  {timelineStr && (
                    <span className="flex items-center gap-1">
                      <span className="icon-[lucide--calendar] size-3.5" />
                      <span>{timelineStr}</span>
                    </span>
                  )}
                  {project.status && (
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {project.status === "COMPLETE"
                        ? dict.projects.statusCompleted
                        : project.status}
                    </span>
                  )}
                </div>

                <h3
                  id="project-modal-title"
                  className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight"
                >
                  {title}
                </h3>

                <p className="text-sm text-zinc-600 leading-relaxed">
                  {summary}
                </p>
              </div>

              {/* NDA Censored Notice & Redacted Spec Box */}
              {project.isNda && (
                <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-4 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <span className="icon-[lucide--lock] size-4 text-amber-700 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                        {dict.projects.confidentialStamp}
                      </h4>
                      <p className="text-xs text-amber-800 leading-relaxed">
                        {dict.projects.confidentialNotice}
                      </p>
                    </div>
                  </div>

                  {/* Redacted Data Fields Simulation */}
                  <div className="pt-2 border-t border-amber-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/80 border border-amber-200/60">
                      <span className="text-zinc-500">Klien / Enterprise:</span>
                      <span className="bg-zinc-800 text-transparent select-none rounded px-2 py-0.5 font-mono text-[11px] tracking-wider">
                        ████████████
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/80 border border-amber-200/60">
                      <span className="text-zinc-500">Server Endpoint:</span>
                      <span className="bg-zinc-800 text-transparent select-none rounded px-2 py-0.5 font-mono text-[11px] tracking-wider">
                        api.internal.████
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/80 border border-amber-200/60">
                      <span className="text-zinc-500">Database Engine:</span>
                      <span className="bg-zinc-800 text-transparent select-none rounded px-2 py-0.5 font-mono text-[11px] tracking-wider">
                        cluster-db-████
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/80 border border-amber-200/60">
                      <span className="text-zinc-500">Source Repository:</span>
                      <span className="bg-zinc-800 text-transparent select-none rounded px-2 py-0.5 font-mono text-[11px] tracking-wider">
                        git@gitlab.████
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Description Section */}
              {description && description.trim().length > 0 && (
                <div className="space-y-2 pt-2 border-t border-zinc-100">
                  <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-500">
                    {dict.projects.overview}
                  </h4>
                  {renderDescription(description)}
                </div>
              )}

              {/* Tech Stack */}
              {project.techStack && project.techStack.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-zinc-100">
                  <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-500">
                    {dict.projects.techStackTitle}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech) => {
                      const techInfo = getTechIcon(tech);
                      return (
                        <span
                          key={tech}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-50 text-zinc-800 border border-zinc-200/90 shadow-2xs"
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

              {/* Action Buttons */}
              <div className="pt-4 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  {!project.isNda && project.projectUrl && (
                    <a
                      href={project.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-white font-medium text-xs sm:text-sm hover:bg-zinc-800 transition-colors shadow-xs"
                    >
                      <span className="icon-[lucide--globe] size-4" />
                      <span>{dict.projects.website}</span>
                    </a>
                  )}

                  {!project.isNda && project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 font-medium text-xs sm:text-sm transition-colors shadow-xs"
                    >
                      <span className="icon-[simple-icons--github] size-4" />
                      <span>{dict.projects.source}</span>
                    </a>
                  )}

                  {project.isNda && (
                    <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-100 text-zinc-600 border border-zinc-200 text-xs font-medium">
                      <span className="icon-[lucide--lock] size-3.5 text-amber-600" />
                      <span>{dict.projects.proprietaryNotice}</span>
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                >
                  {dict.projects.closeModal}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
