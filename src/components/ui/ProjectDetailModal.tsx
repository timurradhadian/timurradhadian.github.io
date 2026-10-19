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
import { useLocale } from "@/context/LocaleContext";

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
  locale?: Locale;
  dict?: Dictionary;
  ndaBlurEnabled?: boolean;
}

export function ProjectDetailModal({
  project,
  onClose,
  locale: fallbackLocale = "id",
  dict: fallbackDict,
  ndaBlurEnabled = true,
}: ProjectDetailModalProps) {
  const { locale: contextLocale, dict: contextDict } = useLocale();
  const activeLocale = contextLocale || fallbackLocale;
  const activeDict = contextDict || fallbackDict;

  const [activeProject, setActiveProject] = useState<Project | null>(project);
  const [activeTab, setActiveTab] = useState<"overview" | "details">("overview");
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Sync active project and reset tab when project prop changes
  useEffect(() => {
    setActiveProject(project);
    setActiveTab("overview");
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

  const title = getLocalized(activeProject, "title", activeLocale);
  const summary = getLocalized(activeProject, "summary", activeLocale);
  const description = getLocalized(activeProject, "description", activeLocale);
  const clientSummary = getLocalized(activeProject, "clientSummary", activeLocale);
  const category = getLocalized(activeProject, "category", activeLocale);

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

  const heroImage = activeProject.bannerImage || activeProject.thumbnailUrl;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-white flex flex-col h-screen w-screen overflow-hidden">
        {/* =========================================================================
            STICKY FULL-WIDTH TOP NAVIGATION BAR
        ========================================================================= */}
        <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-zinc-200/90 shadow-2xs">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-3 sm:gap-4">
            {/* Left: Back / Close Action */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={onClose}
                className="group inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 hover:text-zinc-950 font-medium text-xs sm:text-sm shadow-2xs transition-all cursor-pointer shrink-0"
              >
                <span className="icon-[lucide--arrow-left] size-4 text-zinc-500 group-hover:text-zinc-900 group-hover:-translate-x-0.5 transition-transform" />
                <span className="hidden xs:inline">{activeDict.projects.backButton}</span>
                <span className="hidden sm:inline-block font-mono text-[10px] text-zinc-400 border border-zinc-200 rounded px-1 ml-0.5">
                  Esc
                </span>
              </button>

              <div className="h-4 w-px bg-zinc-200 hidden sm:block shrink-0" />

              {/* Title & Category Breadcrumb */}
              <div className="min-w-0 flex items-center gap-2">
                <span className="hidden md:inline-block px-2.5 py-0.5 rounded-md text-[11px] font-mono uppercase tracking-wider font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200/80 shrink-0">
                  {category}
                </span>
                {activeProject.isNda && (
                  <NdaBadge label={activeDict.projects.ndaBadge} size="sm" />
                )}
                <h2 className="text-sm sm:text-base font-bold text-zinc-900 truncate">
                  {title}
                </h2>
              </div>
            </div>

            {/* Right: Quick Action Buttons & Close Icon */}
            <div className="flex items-center gap-2 shrink-0">
              {!activeProject.isNda && activeProject.projectUrl && (
                <a
                  href={activeProject.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 text-white font-medium text-xs hover:bg-zinc-800 transition-colors shadow-2xs"
                >
                  <span className="icon-[lucide--globe] size-3.5" />
                  <span>{activeDict.projects.website}</span>
                </a>
              )}

              {!activeProject.isNda && activeProject.githubUrl && (
                <a
                  href={activeProject.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 font-medium text-xs transition-colors shadow-2xs"
                >
                  <span className="icon-[simple-icons--github] size-3.5" />
                  <span>{activeDict.projects.source}</span>
                </a>
              )}

              {activeProject.isNda && (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium">
                  <span className="icon-[lucide--lock] size-3.5 text-amber-600" />
                  <span>{activeDict.projects.proprietaryNotice}</span>
                </span>
              )}

              <button
                type="button"
                onClick={onClose}
                aria-label={activeDict.projects.closeModal}
                className="size-8 sm:size-9 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 hover:text-zinc-950 flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="icon-[lucide--x] size-4" />
              </button>
            </div>
          </div>

          {/* =========================================================================
              SEGMENTED TAB CONTROLS (RINGKASAN PROYEK vs DETAIL PROYEK)
          ========================================================================= */}
          <div className="border-t border-zinc-100 bg-zinc-50/70">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-1 sm:gap-2 py-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === "overview"
                      ? "text-zinc-950 bg-white shadow-xs border border-zinc-200/90"
                      : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/80"
                  }`}
                >
                  <span
                    className={`icon-[lucide--layout-grid] size-4 ${
                      activeTab === "overview" ? "text-zinc-950" : "text-zinc-400"
                    }`}
                  />
                  <span>{activeDict.projects.tabOverview}</span>
                  {imageDocs.length > 0 && !activeProject.isNda && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
                      {imageDocs.length} foto
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("details")}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === "details"
                      ? "text-zinc-950 bg-white shadow-xs border border-zinc-200/90"
                      : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/80"
                  }`}
                >
                  <span
                    className={`icon-[lucide--file-code-2] size-4 ${
                      activeTab === "details" ? "text-zinc-950" : "text-zinc-400"
                    }`}
                  />
                  <span>{activeDict.projects.tabDetails}</span>
                </button>
              </div>

              {isLoadingDetail && (
                <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-500 font-medium">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Sinkronisasi data Glio...</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* =========================================================================
            MAIN SCROLLABLE CONTENT AREA
        ========================================================================= */}
        <div className="flex-1 overflow-y-auto overscroll-contain bg-zinc-50/40">
          <main className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-10">
            <AnimatePresence mode="wait">
              {/* ===================================================================
                  TAB 1: RINGKASAN PROYEK (OVERVIEW, TECHSTACK UNDER HERO, COMPACT GALLERY)
              =================================================================== */}
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Hero Showcase Banner */}
                  <div className="relative aspect-[21/9] sm:aspect-[2.2/1] w-full rounded-2xl overflow-hidden border border-zinc-200/90 bg-zinc-100 shadow-sm">
                    {heroImage ? (
                      <Image
                        src={heroImage as string}
                        alt={title}
                        fill
                        sizes="(max-width: 1200px) 100vw, 1024px"
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
                      <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[2px] flex items-center justify-center p-4">
                        <div className="px-4 py-2.5 rounded-xl bg-zinc-900/95 border border-white/20 backdrop-blur-md shadow-2xl flex items-center gap-3 text-white text-center">
                          <span className="icon-[lucide--shield-lock] size-5 text-amber-400 shrink-0" />
                          <div className="text-left">
                            <span className="font-mono text-xs uppercase tracking-widest font-bold block text-amber-300">
                              {activeDict.projects.confidentialStamp}
                            </span>
                            <span className="text-[10px] text-zinc-300 font-mono block">
                              PROTECTED ENTERPRISE SYSTEM // REDACTED DATA
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Top Floating Badges */}
                    <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 z-10">
                      <span className="px-3 py-1 rounded-lg text-xs font-mono uppercase tracking-wider font-semibold bg-white/95 text-zinc-800 border border-zinc-200/80 backdrop-blur-xs shadow-xs">
                        {category}
                      </span>
                      {activeProject.isNda && (
                        <NdaBadge label={activeDict.projects.ndaBadge} size="sm" />
                      )}
                      {activeProject.status && (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-mono uppercase tracking-wider font-semibold bg-emerald-50/95 text-emerald-800 border border-emerald-200 shadow-xs">
                          {activeProject.status === "COMPLETE"
                            ? activeDict.projects.statusCompleted
                            : activeProject.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* =========================================================================
                      TECH STACK (DISPLAYED DIRECTLY BELOW HERO BANNER)
                  ========================================================================= */}
                  {activeProject.techStack && activeProject.techStack.length > 0 && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs space-y-2.5">
                      <div className="flex items-center gap-2 text-zinc-500 font-mono text-xs uppercase tracking-wider font-semibold">
                        <span className="icon-[lucide--layers] size-4 text-zinc-500" />
                        <span>{activeDict.projects.techStackTitle}</span>
                      </div>
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

                  {/* At-a-Glance Metadata Cards Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-white border border-zinc-200/80 shadow-2xs space-y-1">
                      <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-mono uppercase tracking-wider">
                        <span className="icon-[lucide--folder] size-3.5" />
                        <span>Kategori</span>
                      </div>
                      <p className="font-semibold text-xs sm:text-sm text-zinc-900 truncate">
                        {category}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-zinc-200/80 shadow-2xs space-y-1">
                      <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-mono uppercase tracking-wider">
                        <span className="icon-[lucide--calendar] size-3.5" />
                        <span>Periode</span>
                      </div>
                      <p className="font-semibold text-xs sm:text-sm text-zinc-900">
                        {timelineStr || "2024 – 2025"}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-zinc-200/80 shadow-2xs space-y-1">
                      <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-mono uppercase tracking-wider">
                        <span className="icon-[lucide--check-circle-2] size-3.5 text-emerald-600" />
                        <span>Status</span>
                      </div>
                      <p className="font-semibold text-xs sm:text-sm text-emerald-700">
                        {activeProject.status === "COMPLETE"
                          ? activeDict.projects.statusCompleted
                          : activeProject.status || "Completed"}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-zinc-200/80 shadow-2xs space-y-1">
                      <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-mono uppercase tracking-wider">
                        {activeProject.isNda ? (
                          <span className="icon-[lucide--lock] size-3.5 text-amber-600" />
                        ) : (
                          <span className="icon-[lucide--globe] size-3.5 text-blue-600" />
                        )}
                        <span>Aksesibilitas</span>
                      </div>
                      <p className="font-semibold text-xs sm:text-sm text-zinc-900 truncate">
                        {activeProject.isNda ? "Terikat NDA (Redacted)" : "Publik / Live"}
                      </p>
                    </div>
                  </div>

                  {/* Project Title & Summary Card */}
                  <div className="p-6 sm:p-7 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs space-y-3">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-zinc-950">
                      {title}
                    </h1>
                    <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
                      {summary}
                    </p>
                  </div>

                  {/* =========================================================================
                      EXECUTIVE CLIENT SUMMARY (CLEAN NEUTRAL STYLING - NO BLUE COLOR)
                  ========================================================================= */}
                  {!activeProject.isNda && clientSummary && clientSummary.trim().length > 0 && (
                    <div className="p-6 sm:p-8 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs space-y-4">
                      <div className="flex items-center gap-2.5 text-zinc-900 font-bold text-sm uppercase tracking-wider pb-3 border-b border-zinc-100">
                        <span className="icon-[lucide--briefcase] size-4.5 text-zinc-700" />
                        <span>{activeDict.projects.clientSummaryTitle}</span>
                      </div>
                      <MarkdownContent
                        content={clientSummary}
                        className="text-sm sm:text-base text-zinc-700 leading-relaxed"
                      />
                    </div>
                  )}

                  {/* NDA Censored Notice & Redacted Architecture Box */}
                  {activeProject.isNda && (
                    <div className="p-6 sm:p-7 rounded-2xl border border-amber-300 bg-amber-50/60 shadow-2xs space-y-5">
                      <div className="flex items-start gap-3.5">
                        <div className="size-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0 text-amber-800 mt-0.5">
                          <span className="icon-[lucide--shield-alert] size-5" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold uppercase tracking-wider text-amber-900">
                            {activeDict.projects.confidentialStamp}
                          </h4>
                          <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                            {activeDict.projects.confidentialNotice}
                          </p>
                        </div>
                      </div>

                      {/* Redacted Data Fields Simulation */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/95 border border-amber-200/70 shadow-2xs">
                          <span className="text-zinc-500 font-medium">Klien / Enterprise:</span>
                          <span className="bg-zinc-950 text-transparent select-none rounded px-3 py-1 font-mono text-xs tracking-wider">
                            ████████████
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/95 border border-amber-200/70 shadow-2xs">
                          <span className="text-zinc-500 font-medium">Server Endpoint:</span>
                          <span className="bg-zinc-950 text-transparent select-none rounded px-3 py-1 font-mono text-xs tracking-wider">
                            api.internal.████
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/95 border border-amber-200/70 shadow-2xs">
                          <span className="text-zinc-500 font-medium">Database Cluster:</span>
                          <span className="bg-zinc-950 text-transparent select-none rounded px-3 py-1 font-mono text-xs tracking-wider">
                            cluster-db-████
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/95 border border-amber-200/70 shadow-2xs">
                          <span className="text-zinc-500 font-medium">Source Repository:</span>
                          <span className="bg-zinc-950 text-transparent select-none rounded px-3 py-1 font-mono text-xs tracking-wider">
                            git@gitlab.████
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-amber-800/90 italic flex items-center gap-2 pt-1 border-t border-amber-200/60">
                        <span className="icon-[lucide--info] size-4 shrink-0 text-amber-700" />
                        <span>{activeDict.projects.ndaRestrictedGallery}</span>
                      </div>
                    </div>
                  )}

                  {/* =========================================================================
                      COMPACT SCREENSHOTS GALLERY (NEAT THUMBNAILS - NOT TOO LARGE)
                  ========================================================================= */}
                  {!activeProject.isNda && imageDocs.length > 0 && (
                    <div className="p-5 sm:p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs space-y-3.5">
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                        <div className="flex items-center gap-2 text-zinc-900 font-bold text-xs sm:text-sm uppercase tracking-wider">
                          <span className="icon-[lucide--image] size-4 text-zinc-600" />
                          <span>{activeDict.projects.galleryTitle}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-[11px] font-mono font-semibold border border-zinc-200">
                          {imageDocs.length} Foto
                        </span>
                      </div>

                      {/* Compact Multi-Column Grid of Thumbnails */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                        {imageDocs.map((doc, idx) => (
                          <button
                            key={doc.id || idx}
                            type="button"
                            onClick={() => setLightboxIndex(idx)}
                            className="group relative aspect-[16/10] w-full rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100 hover:border-zinc-400 transition-all shadow-2xs hover:shadow-xs cursor-pointer text-left"
                          >
                            <Image
                              src={doc.url}
                              alt={doc.name || `Screenshot ${idx + 1}`}
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 180px"
                              className="object-cover group-hover:scale-104 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-1.5 sm:p-2">
                              <span className="text-[10px] text-white font-medium truncate max-w-[85%] leading-tight">
                                {doc.name || `Screenshot ${idx + 1}`}
                              </span>
                              <span className="size-4.5 rounded bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
                                <span className="icon-[lucide--maximize-2] size-2.5" />
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Call-to-action banner to switch to Tab 2 (Detail & Studi Kasus) */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                    <div className="space-y-1 text-center sm:text-left">
                      <h4 className="font-bold text-sm sm:text-base">
                        Tertarik dengan arsitektur & implementasi teknis?
                      </h4>
                      <p className="text-xs sm:text-sm text-zinc-400">
                        Pelajari studi kasus arsitektur, tantangan rekayasa, dan solusi mendalam.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("details")}
                      className="px-4 py-2.5 rounded-xl bg-white text-zinc-950 font-semibold text-xs sm:text-sm hover:bg-zinc-100 transition-colors shadow-xs cursor-pointer shrink-0 flex items-center gap-2"
                    >
                      <span>Buka Tab Detail Proyek</span>
                      <span className="icon-[lucide--arrow-right] size-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ===================================================================
                  TAB 2: DETAIL PROYEK (CASE STUDY, ARCHITECTURE, ENGINEERING SPEC)
              =================================================================== */}
              {activeTab === "details" && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Tech Stack Pills in Details Tab as well */}
                  {activeProject.techStack && activeProject.techStack.length > 0 && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs space-y-2.5">
                      <div className="flex items-center gap-2 text-zinc-500 font-mono text-xs uppercase tracking-wider font-semibold">
                        <span className="icon-[lucide--layers] size-4 text-zinc-500" />
                        <span>{activeDict.projects.techStackTitle}</span>
                      </div>
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

                  <div className="p-6 sm:p-8 md:p-10 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                      <div className="flex items-center gap-2.5 text-zinc-900 font-bold text-base sm:text-lg">
                        <span className="icon-[lucide--cpu] size-5 text-zinc-700" />
                        <span>
                          {activeProject.isNda
                            ? "Spesifikasi Arsitektur Sistem (High-Level)"
                            : activeDict.projects.caseStudyTitle}
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-mono uppercase tracking-wider font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
                        {category}
                      </span>
                    </div>

                    {/* NDA Banner inside Details */}
                    {activeProject.isNda && (
                      <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-4 flex items-start gap-3">
                        <span className="icon-[lucide--lock] size-4 text-amber-700 mt-0.5 shrink-0" />
                        <div className="text-xs text-amber-900 leading-relaxed">
                          <strong>Pemberitahuan Sensor NDA:</strong> Seluruh skema database produksi, kontrak API microservice privat, dan baris source code repositori internal disensor secara resmi sesuai regulasi kerahasiaan perusahaan klien.
                        </div>
                      </div>
                    )}

                    {/* Rich Markdown Technical Description */}
                    {description && description.trim().length > 0 ? (
                      <MarkdownContent
                        content={description}
                        className="text-sm sm:text-base text-zinc-700"
                      />
                    ) : (
                      <div className="text-center py-12 text-zinc-400 font-mono text-sm">
                        Dokumentasi studi kasus teknis belum dipublikasikan.
                      </div>
                    )}
                  </div>

                  {/* Back to Overview Tab */}
                  <div className="flex justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("overview")}
                      className="px-5 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 font-semibold text-xs sm:text-sm transition-colors shadow-2xs flex items-center gap-2 cursor-pointer"
                    >
                      <span className="icon-[lucide--arrow-left] size-4" />
                      <span>Kembali ke Ringkasan Proyek</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>

        {/* =========================================================================
            SCREENSHOT LIGHTBOX OVERLAY
        ========================================================================= */}
        {lightboxIndex !== null && imageDocs[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 bg-zinc-950/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6"
            onClick={() => setLightboxIndex(null)}
          >
            {/* Lightbox Top Bar */}
            <div
              className="w-full max-w-5xl flex items-center justify-between text-white pb-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono bg-zinc-800/90 px-3 py-1 rounded-md border border-zinc-700">
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
