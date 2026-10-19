"use client";

import React, { useEffect, useState, useMemo } from "react";
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

interface GalleryItem {
  id: string;
  name: string;
  label: string;
  url: string;
  isCover?: boolean;
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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Sync active project and reset states when project prop changes
  useEffect(() => {
    setActiveProject(project);
    setActiveTab("overview");
    setSelectedImageIndex(0);
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

  // Unified Gallery Items: Project Thumbnail, Banner, and all Document Screenshots
  const galleryItems = useMemo<GalleryItem[]>(() => {
    if (!activeProject) return [];
    const items: GalleryItem[] = [];

    // 1. Project Primary Thumbnail / Cover
    if (activeProject.thumbnailUrl) {
      items.push({
        id: "primary-thumbnail",
        name: "Thumbnail Utama (Cover)",
        label: "Thumbnail",
        url: activeProject.thumbnailUrl,
        isCover: true,
      });
    }

    // 2. Project Banner Image (if distinct from thumbnailUrl)
    if (
      activeProject.bannerImage &&
      activeProject.bannerImage !== activeProject.thumbnailUrl
    ) {
      items.unshift({
        id: "banner-image",
        name: "Banner Image",
        label: "Banner",
        url: activeProject.bannerImage,
        isCover: true,
      });
    }

    // 3. Document Screenshots (if not NDA)
    if (!activeProject.isNda) {
      (activeProject.documents || []).forEach((doc, idx) => {
        if (
          doc.url &&
          doc.url !== activeProject.thumbnailUrl &&
          doc.url !== activeProject.bannerImage &&
          (doc.type?.startsWith("image/") || /\.(webp|png|jpe?g|gif|avif)$/i.test(doc.url))
        ) {
          items.push({
            id: doc.id || `doc-${idx}`,
            name: doc.name || `Screenshot ${idx + 1}`,
            label: `Screen ${idx + 1}`,
            url: doc.url,
          });
        }
      });
    }

    return items;
  }, [activeProject]);

  if (!project || !activeProject) return null;

  const title = getLocalized(activeProject, "title", activeLocale);
  const description = getLocalized(activeProject, "description", activeLocale);
  const clientSummary = getLocalized(activeProject, "clientSummary", activeLocale);
  const category = getLocalized(activeProject, "category", activeLocale);

  const activeShowcase = galleryItems[selectedImageIndex] || galleryItems[0];
  const currentShowcaseUrl =
    activeShowcase?.url || activeProject.bannerImage || activeProject.thumbnailUrl;
  const currentShowcaseName = activeShowcase?.name || title;

  const handlePrevShowcase = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (galleryItems.length === 0) return;
    setSelectedImageIndex((prev) => (prev === 0 ? galleryItems.length - 1 : prev - 1));
  };

  const handleNextShowcase = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (galleryItems.length === 0) return;
    setSelectedImageIndex((prev) => (prev === galleryItems.length - 1 ? 0 : prev + 1));
  };

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
                  {galleryItems.length > 0 && !activeProject.isNda && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
                      {galleryItems.length} foto
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
          <main className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 space-y-6">
            {/* =========================================================================
                PROJECT BANNER & THUMBNAILS SHOWCASE (ALWAYS VISIBLE AT TOP)
            ========================================================================= */}
            <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs space-y-3.5">
              {/* Main Banner Image Display */}
              <div
                onClick={() =>
                  !activeProject.isNda &&
                  galleryItems.length > 0 &&
                  setLightboxIndex(selectedImageIndex)
                }
                className={`group relative aspect-[16/9] sm:aspect-[2.1/1] w-full rounded-xl overflow-hidden border border-zinc-200/90 bg-zinc-950 shadow-xs ${
                  !activeProject.isNda && galleryItems.length > 0 ? "cursor-zoom-in" : ""
                }`}
              >
                {currentShowcaseUrl ? (
                  <Image
                    src={currentShowcaseUrl as string}
                    alt={currentShowcaseName || title}
                    fill
                    sizes="(max-width: 1200px) 100vw, 1024px"
                    className={`object-contain sm:object-cover transition-all duration-300 ${
                      activeProject.isNda && ndaBlurEnabled
                        ? "filter blur-[5px] scale-105"
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

                {/* Top Badges overlay on banner screen */}
                <div className="absolute top-3.5 left-3.5 flex flex-wrap items-center gap-2 z-10 pointer-events-none">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-mono uppercase tracking-wider font-semibold bg-white/95 text-zinc-800 border border-zinc-200/80 backdrop-blur-xs shadow-xs">
                    {category}
                  </span>
                  {activeProject.isNda && (
                    <NdaBadge label={activeDict.projects.ndaBadge} size="sm" />
                  )}
                  {activeProject.status && (
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-mono uppercase tracking-wider font-semibold bg-emerald-50/95 text-emerald-800 border border-emerald-200 shadow-xs">
                      {activeProject.status === "COMPLETE"
                        ? activeDict.projects.statusCompleted
                        : activeProject.status}
                    </span>
                  )}
                </div>

                {/* Next / Previous Screen Controls on Hover */}
                {!activeProject.isNda && galleryItems.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevShowcase}
                      aria-label="Previous Image"
                      className="absolute left-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-zinc-900/75 hover:bg-zinc-900 text-white border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                    >
                      <span className="icon-[lucide--chevron-left] size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextShowcase}
                      aria-label="Next Image"
                      className="absolute right-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-zinc-900/75 hover:bg-zinc-900 text-white border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                    >
                      <span className="icon-[lucide--chevron-right] size-5" />
                    </button>
                  </>
                )}

                {/* Counter & Zoom Indicator in Bottom Right */}
                {!activeProject.isNda && galleryItems.length > 0 && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-2 z-10">
                    <span className="px-2.5 py-1 rounded-md bg-zinc-900/85 backdrop-blur-xs border border-white/20 text-white font-mono text-[11px] font-medium shadow-xs">
                      {selectedImageIndex + 1} / {galleryItems.length}
                    </span>
                    <span className="p-1 rounded-md bg-zinc-900/85 backdrop-blur-xs border border-white/20 text-white shadow-xs">
                      <span className="icon-[lucide--maximize-2] size-3.5 block" />
                    </span>
                  </div>
                )}
              </div>

              {/* =========================================================================
                  THUMBNAILS DI BAWAH BANNER IMAGE
              ========================================================================= */}
              {!activeProject.isNda && galleryItems.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
                    <span className="flex items-center gap-1.5 font-semibold text-zinc-700">
                      <span className="icon-[lucide--image] size-3.5 text-zinc-500" />
                      <span>Thumbnail & Tangkapan Layar ({galleryItems.length})</span>
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      Klik thumbnail untuk beralih tampilan
                    </span>
                  </div>

                  {/* Scrollable Compact Thumbnails Row */}
                  <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin">
                    {galleryItems.map((item, idx) => {
                      const isSelected = idx === selectedImageIndex;
                      return (
                        <button
                          key={item.id || idx}
                          type="button"
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`group relative shrink-0 aspect-[16/10] w-24 sm:w-28 md:w-32 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                            isSelected
                              ? "ring-2 ring-zinc-950 border-zinc-950 shadow-sm scale-102"
                              : "border-zinc-200/90 hover:border-zinc-400 opacity-75 hover:opacity-100"
                          }`}
                        >
                          <Image
                            src={item.url}
                            alt={item.name || `Thumbnail ${idx + 1}`}
                            fill
                            sizes="130px"
                            className="object-cover"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-zinc-950/15 pointer-events-none" />
                          )}
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/60 to-transparent p-1">
                            <span className="text-[9px] text-white font-mono block truncate leading-tight font-medium">
                              {item.label || item.name}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* =========================================================================
                PROJECT TITLE & TECH STACK (DIRECTLY BELOW BANNER & THUMBNAILS)
            ========================================================================= */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-zinc-950">
                  {title}
                </h1>

                {/* Quick External Links for Desktop */}
                <div className="flex items-center gap-2 shrink-0">
                  {!activeProject.isNda && activeProject.projectUrl && (
                    <a
                      href={activeProject.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 text-white font-medium text-xs hover:bg-zinc-800 transition-colors shadow-2xs"
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
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 font-medium text-xs transition-colors shadow-2xs"
                    >
                      <span className="icon-[simple-icons--github] size-3.5" />
                      <span>{activeDict.projects.source}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Tech Stack Badges directly under Title */}
              {activeProject.techStack && activeProject.techStack.length > 0 && (
                <div className="pt-2 border-t border-zinc-100 flex flex-wrap items-center gap-2">
                  <span className="text-zinc-400 font-mono text-[11px] uppercase tracking-wider font-semibold mr-1">
                    Stack:
                  </span>
                  {activeProject.techStack.map((tech) => {
                    const techInfo = getTechIcon(tech);
                    return (
                      <span
                        key={tech}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-50 text-zinc-800 border border-zinc-200/90 shadow-2xs hover:bg-zinc-100 transition-colors"
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
            </div>

            {/* =========================================================================
                TAB CONTENT AREA: RINGKASAN PROYEK vs DETAIL PROYEK
            ========================================================================= */}
            <AnimatePresence mode="wait">
              {/* ===================================================================
                  TAB 1: RINGKASAN PROYEK (EXECUTIVE SUMMARY / NDA NOTICE)
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
                  {/* Executive Client Summary (Clean neutral card - no blue) */}
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
                  <div className="p-6 sm:p-8 md:p-10 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100">
                      <div className="flex items-center gap-2.5 text-zinc-900 font-bold text-base sm:text-lg">
                        <span className="icon-[lucide--cpu] size-5 text-zinc-700" />
                        <span>
                          {activeProject.isNda
                            ? "Spesifikasi Arsitektur Sistem (High-Level)"
                            : activeDict.projects.caseStudyTitle}
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-mono uppercase tracking-wider font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200 self-start sm:self-auto">
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
        {lightboxIndex !== null && galleryItems[lightboxIndex] && (
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
                  {lightboxIndex + 1} / {galleryItems.length}
                </span>
                <span className="text-sm font-medium truncate max-w-md">
                  {galleryItems[lightboxIndex].name}
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
                  src={galleryItems[lightboxIndex].url}
                  alt={galleryItems[lightboxIndex].name || "Screenshot Preview"}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>

              {/* Prev / Next Buttons */}
              {galleryItems.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIndex((prev) =>
                        prev === null || prev === 0
                          ? galleryItems.length - 1
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
                        prev === null || prev === galleryItems.length - 1
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
              {galleryItems[lightboxIndex].name}
            </div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
}
