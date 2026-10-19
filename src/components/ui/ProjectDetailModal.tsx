"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Locale, Project, ProjectDocument } from "@/types/portfolio";
import { Dictionary, getLocalized } from "@/lib/i18n";
import { getTechIcon } from "@/lib/tech-icons";
import { NdaBadge } from "@/components/ui/NdaBadge";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { getProjectDetailFromGlio } from "@/services/portfolioService";

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
  const [activeProject, setActiveProject] = useState<Project | null>(project);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Sync active project when prop changes
  useEffect(() => {
    setActiveProject(project);
    setLightboxIndex(null);

    if (!project) return;

    // If non-NDA project and missing full description or documents, fetch fresh from Glio
    const isNda =
      project.isNda ||
      project.slug.includes("industry-manufaktur");

    if (!isNda && (!project.description || !project.documents || project.documents.length === 0)) {
      setIsLoadingDetail(true);
      getProjectDetailFromGlio(project.slug)
        .then((detail) => {
          if (detail) {
            setActiveProject((prev) => {
              if (!prev || prev.slug !== project.slug) return prev;
              const documents: ProjectDocument[] = Array.isArray(detail.documents)
                ? detail.documents.map((d: Record<string, unknown>, idx: number) => ({
                    id: (d.id as string) || `doc-${idx}`,
                    name: (d.name as string) || `Screenshot ${idx + 1}`,
                    type: (d.type as string) || "image/webp",
                    url: (d.url as string) || "",
                    size: typeof d.size === "number" ? d.size : undefined,
                    order: typeof d.order === "number" ? d.order : idx,
                  }))
                : prev.documents || [];

              return {
                ...prev,
                description: (detail.description as string) || prev.description,
                descriptionId: (detail.descriptionId as string) || prev.descriptionId,
                descriptionEn: (detail.descriptionEn as string) || prev.descriptionEn,
                clientSummary: (detail.clientSummary as string) || prev.clientSummary,
                clientSummaryId: (detail.clientSummaryId as string) || prev.clientSummaryId,
                clientSummaryEn: (detail.clientSummaryEn as string) || prev.clientSummaryEn,
                bannerImage: (detail.bannerImage as string) || prev.bannerImage,
                documents,
              };
            });
          }
        })
        .finally(() => {
          setIsLoadingDetail(false);
        });
    }
  }, [project]);

  // Handle body overflow lock & keyboard Escape key
  useEffect(() => {
    if (!project) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (lightboxIndex !== null) {
          setLightboxIndex(null);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [project, onClose, lightboxIndex]);

  if (!project || !activeProject) return null;

  const title = getLocalized(activeProject, "title", locale);
  const summary = getLocalized(activeProject, "summary", locale);
  const description = getLocalized(activeProject, "description", locale);
  const clientSummary = getLocalized(activeProject, "clientSummary", locale);
  const category = getLocalized(activeProject, "category", locale);

  const formatTimeline = () => {
    if (activeProject.startDate && activeProject.endDate) {
      const start = new Date(activeProject.startDate).getFullYear();
      const end = new Date(activeProject.endDate).getFullYear();
      return start === end ? `${start}` : `${start} – ${end}`;
    }
    return null;
  };

  const timelineStr = formatTimeline();

  // Filter image documents for screenshot gallery
  const imageDocs = (activeProject.documents || []).filter(
    (doc) =>
      doc.url &&
      (doc.type?.startsWith("image/") ||
        /\.(webp|png|jpe?g|gif|avif)$/i.test(doc.url))
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm cursor-pointer"
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
          className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl border border-zinc-200/90 shadow-2xl flex flex-col overflow-hidden z-10"
        >
          {/* Header Bar with Action Buttons */}
          <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              aria-label={dict.projects.closeModal}
              className="size-8 sm:size-9 rounded-full bg-white/90 hover:bg-white text-zinc-700 hover:text-zinc-950 border border-zinc-200/90 flex items-center justify-center shadow-xs backdrop-blur-xs transition-colors cursor-pointer"
            >
              <span className="icon-[lucide--x] size-4" />
            </button>
          </div>

          {/* Scrollable Container */}
          <div className="overflow-y-auto overscroll-contain">
            {/* Hero / Cover Banner */}
            <div className="relative aspect-[21/9] sm:aspect-[2.2/1] w-full bg-zinc-100 overflow-hidden">
              {(activeProject.bannerImage || activeProject.thumbnailUrl) ? (
                <Image
                  src={(activeProject.bannerImage || activeProject.thumbnailUrl) as string}
                  alt={title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 896px"
                  className={`object-cover ${
                    activeProject.isNda && ndaBlurEnabled
                      ? "filter blur-[4px] scale-105"
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
              {activeProject.isNda && (
                <div className="absolute inset-0 bg-zinc-950/40 flex items-center justify-center p-4">
                  <div className="px-4 py-2 rounded-xl bg-zinc-900/90 border border-white/20 backdrop-blur-md shadow-xl flex items-center gap-2.5 text-white">
                    <span className="icon-[lucide--shield-lock] size-5 text-amber-400 shrink-0" />
                    <div>
                      <span className="font-mono text-xs uppercase tracking-widest font-bold block">
                        {dict.projects.confidentialStamp}
                      </span>
                      <span className="text-[10px] text-zinc-300 font-mono">
                        PROTECTED REPOSITORY & ARCHITECTURE
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Top-Left Badges */}
              <div className="absolute top-3.5 left-3.5 flex flex-wrap items-center gap-1.5 z-10">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-mono uppercase tracking-wider font-semibold bg-white/95 text-zinc-800 border border-zinc-200/80 backdrop-blur-xs shadow-2xs">
                  {category}
                </span>
                {activeProject.isNda && (
                  <NdaBadge label={dict.projects.ndaBadge} size="sm" />
                )}
                {activeProject.status && (
                  <span className="px-2 py-1 rounded-md text-[11px] font-mono uppercase tracking-wider font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                    {activeProject.status === "COMPLETE"
                      ? dict.projects.statusCompleted
                      : activeProject.status}
                  </span>
                )}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-7 md:p-8 space-y-7">
              {/* Header Title, Timeline & Quick Actions */}
              <div className="space-y-3 pb-2 border-b border-zinc-100">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                    {timelineStr && (
                      <span className="flex items-center gap-1 bg-zinc-100 px-2 py-0.5 rounded-md font-mono text-[11px]">
                        <span className="icon-[lucide--calendar] size-3.5" />
                        <span>{timelineStr}</span>
                      </span>
                    )}
                    {isLoadingDetail && (
                      <span className="flex items-center gap-1.5 text-zinc-400 text-xs">
                        <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Memuat data detail terbaru...</span>
                      </span>
                    )}
                  </div>

                  {/* External Links */}
                  <div className="flex flex-wrap items-center gap-2">
                    {!activeProject.isNda && activeProject.projectUrl && (
                      <a
                        href={activeProject.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-900 text-white font-medium text-xs hover:bg-zinc-800 transition-colors shadow-2xs"
                      >
                        <span className="icon-[lucide--globe] size-3.5" />
                        <span>{dict.projects.website}</span>
                      </a>
                    )}
                    {!activeProject.isNda && activeProject.githubUrl && (
                      <a
                        href={activeProject.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 font-medium text-xs transition-colors shadow-2xs"
                      >
                        <span className="icon-[simple-icons--github] size-3.5" />
                        <span>{dict.projects.source}</span>
                      </a>
                    )}
                    {activeProject.isNda && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium">
                        <span className="icon-[lucide--lock] size-3.5 text-amber-600" />
                        <span>{dict.projects.proprietaryNotice}</span>
                      </span>
                    )}
                  </div>
                </div>

                <h3
                  id="project-modal-title"
                  className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight"
                >
                  {title}
                </h3>

                <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                  {summary}
                </p>
              </div>

              {/* NDA Censored Notice & Redacted Architecture Box */}
              {activeProject.isNda && (
                <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-4 sm:p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="size-8 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0 text-amber-800 mt-0.5">
                      <span className="icon-[lucide--shield-alert] size-4" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-900">
                        {dict.projects.confidentialStamp}
                      </h4>
                      <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                        {dict.projects.confidentialNotice}
                      </p>
                    </div>
                  </div>

                  {/* Redacted Data Fields Simulation */}
                  <div className="pt-2 border-t border-amber-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/90 border border-amber-200/60 shadow-2xs">
                      <span className="text-zinc-500 font-medium">Klien / Enterprise:</span>
                      <span className="bg-zinc-900 text-transparent select-none rounded px-2.5 py-0.5 font-mono text-[11px] tracking-wider">
                        ████████████
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/90 border border-amber-200/60 shadow-2xs">
                      <span className="text-zinc-500 font-medium">Server Endpoint:</span>
                      <span className="bg-zinc-900 text-transparent select-none rounded px-2.5 py-0.5 font-mono text-[11px] tracking-wider">
                        api.internal.████
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/90 border border-amber-200/60 shadow-2xs">
                      <span className="text-zinc-500 font-medium">Database Cluster:</span>
                      <span className="bg-zinc-900 text-transparent select-none rounded px-2.5 py-0.5 font-mono text-[11px] tracking-wider">
                        cluster-db-████
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/90 border border-amber-200/60 shadow-2xs">
                      <span className="text-zinc-500 font-medium">Source Repository:</span>
                      <span className="bg-zinc-900 text-transparent select-none rounded px-2.5 py-0.5 font-mono text-[11px] tracking-wider">
                        git@gitlab.████
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-amber-700 italic flex items-center gap-1.5 pt-1">
                    <span className="icon-[lucide--info] size-3.5 shrink-0" />
                    <span>{dict.projects.ndaRestrictedGallery}</span>
                  </div>
                </div>
              )}

              {/* Executive Client Summary (If Available & Not NDA) */}
              {!activeProject.isNda && clientSummary && clientSummary.trim().length > 0 && (
                <div className="rounded-xl border border-blue-200/90 bg-blue-50/40 p-4 sm:p-5 space-y-3">
                  <div className="flex items-center gap-2 text-blue-900 font-semibold text-xs sm:text-sm uppercase tracking-wider">
                    <span className="icon-[lucide--briefcase] size-4 text-blue-700" />
                    <span>{dict.projects.clientSummaryTitle}</span>
                  </div>
                  <MarkdownContent
                    content={clientSummary}
                    className="text-xs sm:text-sm text-zinc-700"
                  />
                </div>
              )}

              {/* Screenshots Gallery (If Available & Not NDA) */}
              {!activeProject.isNda && imageDocs.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-zinc-100">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-700 flex items-center gap-2">
                      <span className="icon-[lucide--image] size-4 text-zinc-500" />
                      <span>{dict.projects.galleryTitle}</span>
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-xs font-mono font-medium">
                      {imageDocs.length} Foto
                    </span>
                  </div>

                  {/* Horizontal Scroll / Grid of Thumbnails */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {imageDocs.map((doc, idx) => (
                      <button
                        key={doc.id || idx}
                        type="button"
                        onClick={() => setLightboxIndex(idx)}
                        className="group relative aspect-video w-full rounded-xl overflow-hidden border border-zinc-200/90 bg-zinc-100 hover:border-zinc-400 transition-all shadow-2xs hover:shadow-md cursor-pointer text-left"
                      >
                        <Image
                          src={doc.url}
                          alt={doc.name || `Screenshot ${idx + 1}`}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
                          className="object-cover group-hover:scale-104 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                          <span className="text-[11px] text-white font-medium line-clamp-1">
                            {doc.name || `Screenshot ${idx + 1}`}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Case Study / Description */}
              {description && description.trim().length > 0 && (
                <div className="space-y-3 pt-2 border-t border-zinc-100">
                  <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-700 flex items-center gap-2">
                    <span className="icon-[lucide--file-text] size-4 text-zinc-500" />
                    <span>
                      {activeProject.isNda
                        ? dict.projects.overview
                        : dict.projects.caseStudyTitle}
                    </span>
                  </h4>
                  <MarkdownContent content={description} />
                </div>
              )}

              {/* Tech Stack */}
              {activeProject.techStack && activeProject.techStack.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-zinc-100">
                  <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-700 flex items-center gap-2">
                    <span className="icon-[lucide--layers] size-4 text-zinc-500" />
                    <span>{dict.projects.techStackTitle}</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activeProject.techStack.map((tech) => {
                      const techInfo = getTechIcon(tech);
                      return (
                        <span
                          key={tech}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-50 text-zinc-800 border border-zinc-200/90 shadow-2xs hover:bg-zinc-100 transition-colors"
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

              {/* Bottom Action Footer */}
              <div className="pt-4 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  {!activeProject.isNda && activeProject.projectUrl && (
                    <a
                      href={activeProject.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-white font-medium text-xs sm:text-sm hover:bg-zinc-800 transition-colors shadow-xs"
                    >
                      <span className="icon-[lucide--globe] size-4" />
                      <span>{dict.projects.website}</span>
                    </a>
                  )}

                  {!activeProject.isNda && activeProject.githubUrl && (
                    <a
                      href={activeProject.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 font-medium text-xs sm:text-sm transition-colors shadow-xs"
                    >
                      <span className="icon-[simple-icons--github] size-4" />
                      <span>{dict.projects.source}</span>
                    </a>
                  )}

                  {activeProject.isNda && (
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

        {/* Screenshot Lightbox Overlay */}
        {lightboxIndex !== null && imageDocs[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6"
            onClick={() => setLightboxIndex(null)}
          >
            {/* Lightbox Top Bar */}
            <div
              className="w-full max-w-5xl flex items-center justify-between text-white pb-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono bg-zinc-800/80 px-2.5 py-1 rounded-md border border-zinc-700">
                  {lightboxIndex + 1} / {imageDocs.length}
                </span>
                <span className="text-sm font-medium truncate max-w-md">
                  {imageDocs[lightboxIndex].name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                aria-label="Close Preview"
                className="size-9 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <span className="icon-[lucide--x] size-4" />
              </button>
            </div>

            {/* Lightbox Image Container */}
            <div
              className="relative w-full max-w-5xl flex-1 flex items-center justify-center min-h-0"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative size-full max-h-[75vh]">
                <Image
                  src={imageDocs[lightboxIndex].url}
                  alt={imageDocs[lightboxIndex].name || "Screenshot Preview"}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>

              {/* Prev / Next Buttons */}
              {imageDocs.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIndex((prev) =>
                        prev === null || prev === 0
                          ? imageDocs.length - 1
                          : prev - 1
                      )
                    }
                    aria-label="Previous Screenshot"
                    className="absolute left-2 sm:-left-12 size-10 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white border border-zinc-700 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <span className="icon-[lucide--chevron-left] size-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIndex((prev) =>
                        prev === null || prev === imageDocs.length - 1
                          ? 0
                          : prev + 1
                      )
                    }
                    aria-label="Next Screenshot"
                    className="absolute right-2 sm:-right-12 size-10 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white border border-zinc-700 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <span className="icon-[lucide--chevron-right] size-5" />
                  </button>
                </>
              )}
            </div>

            {/* Lightbox Bottom Caption */}
            <div
              className="w-full max-w-5xl text-center text-xs text-zinc-400 pt-3"
              onClick={(e) => e.stopPropagation()}
            >
              {imageDocs[lightboxIndex].name}
            </div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
}
