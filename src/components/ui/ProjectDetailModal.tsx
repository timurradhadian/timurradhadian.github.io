"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Locale, Project, ProjectDocument } from "@/types/portfolio";
import { Dictionary, getDictionary, getLocalized } from "@/lib/i18n";
import { getTechIcon } from "@/lib/tech-icons";
import { NdaBadge } from "@/components/ui/NdaBadge";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
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

function isValidImageUrl(url: unknown): url is string {
  return typeof url === "string" && url.trim().length > 0;
}

function checkIsNda(p: Project | null | undefined): boolean {
  if (!p) return false;
  if (p.isNda) return true;
  if (typeof p.slug === "string") {
    const s = p.slug.toLowerCase();
    return (
      s.includes("industry-manufaktur") ||
      s.includes("manufacturing") ||
      s.includes("tanjung-kreasi")
    );
  }
  return false;
}

function normalizeTechStack(techs: unknown): string[] {
  if (!Array.isArray(techs)) return [];
  return techs
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (item && typeof item === "object") {
        const obj = item as Record<string, unknown>;
        const val = obj.name || obj.label || obj.title || obj.id || "";
        return typeof val === "string" ? val.trim() : String(val);
      }
      return item != null ? String(item).trim() : "";
    })
    .filter((s) => s.length > 0);
}

function formatProjectTimeline(
  startDate?: string,
  endDate?: string | null,
  locale: Locale = "id"
): string {
  if (!startDate && !endDate) {
    return locale === "id" ? "Selesai (Produksi)" : "Completed (Production)";
  }

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  const startFormatted = startDate ? formatDate(startDate) : "";
  const endFormatted = endDate ? formatDate(endDate) : "";

  if (startFormatted && endFormatted) {
    return `${startFormatted} – ${endFormatted}`;
  }
  if (startFormatted && !endDate) {
    return `${startFormatted} – ${locale === "id" ? "Sekarang" : "Present"}`;
  }
  if (!startDate && endFormatted) {
    return endFormatted;
  }
  return startFormatted;
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
  const activeDict = contextDict || fallbackDict || getDictionary(activeLocale);

  const [activeProject, setActiveProject] = useState<Project | null>(project);
  const [prevProject, setPrevProject] = useState<Project | null>(project);
  const [activeTab, setActiveTab] = useState<"overview" | "details">("overview");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Sync active project state immediately when project prop updates
  if (project && project !== prevProject) {
    setPrevProject(project);
    setActiveProject(project);
    const hasSum = Boolean(
      (project.clientSummary && project.clientSummary.trim().length > 0) ||
      (project.clientSummaryId && project.clientSummaryId.trim().length > 0) ||
      (project.clientSummaryEn && project.clientSummaryEn.trim().length > 0)
    );
    setActiveTab(hasSum ? "overview" : "details");
    setSelectedImageIndex(0);
    setLightboxIndex(null);
  } else if (!project && prevProject !== null) {
    setPrevProject(null);
    setLightboxIndex(null);
  }

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
  const isNda = checkIsNda(activeProject);

  const galleryItems = useMemo<GalleryItem[]>(() => {
    if (!activeProject) return [];
    const items: GalleryItem[] = [];

    // 1. Project Primary Thumbnail / Cover
    if (isValidImageUrl(activeProject.thumbnailUrl)) {
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
      isValidImageUrl(activeProject.bannerImage) &&
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

    // 3. Document Screenshots / Media
    if (Array.isArray(activeProject.documents)) {
      activeProject.documents.forEach((doc, idx) => {
        if (
          doc &&
          typeof doc === "object" &&
          isValidImageUrl(doc.url) &&
          doc.url !== activeProject.thumbnailUrl &&
          doc.url !== activeProject.bannerImage &&
          ((typeof doc.type === "string" && doc.type.startsWith("image/")) ||
            /\.(webp|png|jpe?g|gif|avif)($|\?)/i.test(doc.url))
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

  const normalizedTechStack = useMemo(() => {
    if (!activeProject) return [];
    return normalizeTechStack(activeProject.techStack);
  }, [activeProject]);

  const title = useMemo(() => {
    if (!activeProject) return "";
    return getLocalized(activeProject, "title", activeLocale);
  }, [activeProject, activeLocale]);

  const description = useMemo(() => {
    if (!activeProject) return "";
    return getLocalized(activeProject, "description", activeLocale);
  }, [activeProject, activeLocale]);

  const clientSummary = useMemo(() => {
    if (!activeProject) return "";
    return getLocalized(activeProject, "clientSummary", activeLocale);
  }, [activeProject, activeLocale]);

  const category = useMemo(() => {
    if (!activeProject) return "";
    return getLocalized(activeProject, "category", activeLocale);
  }, [activeProject, activeLocale]);

  const summary = useMemo(() => {
    if (!activeProject) return "";
    return getLocalized(activeProject, "summary", activeLocale);
  }, [activeProject, activeLocale]);

  const summaryContent = useMemo(() => {
    if (!activeProject) return "";
    return clientSummary && clientSummary.trim().length > 0
      ? clientSummary.trim()
      : "";
  }, [activeProject, clientSummary]);

  const hasDistinctSummary = useMemo(() => {
    if (!activeProject || !summaryContent || summaryContent.trim().length === 0) return false;
    const desc = getLocalized(activeProject, "description", activeLocale)?.trim() || "";
    if (desc && summaryContent === desc) return false;
    return true;
  }, [activeProject, summaryContent, activeLocale]);

  const currentTab = hasDistinctSummary ? activeTab : "details";

  const formattedTimeline = useMemo(() => {
    if (!activeProject) return "";
    return formatProjectTimeline(
      activeProject.startDate,
      activeProject.endDate,
      activeLocale
    );
  }, [activeProject?.startDate, activeProject?.endDate, activeLocale]);

  const displayStatus = useMemo(() => {
    if (!activeProject) return "";
    let rawStatus = "";
    if (typeof activeProject.status === "string") {
      rawStatus = activeProject.status;
    } else if (activeProject.status && typeof activeProject.status === "object") {
      const obj = activeProject.status as Record<string, unknown>;
      rawStatus = String(obj.label || obj.name || obj.id || obj.status || "");
    }
    const upper = rawStatus.toUpperCase().trim();
    if (!upper || upper === "COMPLETE" || upper === "COMPLETED") {
      return activeDict?.projects?.statusCompleted || (activeLocale === "id" ? "Selesai" : "Completed");
    }
    if (upper === "IN_PROGRESS" || upper === "PROGRESS") {
      return activeLocale === "id" ? "Dalam Pengerjaan" : "In Progress";
    }
    return rawStatus;
  }, [activeProject?.status, activeDict, activeLocale]);

  const whatsAppMessage = useMemo(() => {
    if (!activeProject) return "";
    if (isNda) {
      return activeLocale === "id"
        ? `Halo Timur, saya melihat portofolio proyek enterprise Anda (${title}) dan tertarik untuk konsultasi arsitektur sistem serupa.`
        : `Hello Timur, I saw your enterprise project (${title}) in your portfolio and would like to consult about building a similar system architecture.`;
    }
    return activeLocale === "id"
      ? `Halo Timur, saya melihat proyek "${title}" di portfolio Anda dan tertarik untuk konsultasi sistem software serupa.`
      : `Hello Timur, I saw your project "${title}" in your portfolio and would like to consult about building a similar software system.`;
  }, [activeProject, isNda, activeLocale, title]);

  const isOpen = Boolean(project && activeProject);

  const activeShowcase = activeProject
    ? galleryItems[selectedImageIndex] || galleryItems[0]
    : null;
  const rawShowcaseUrl =
    activeShowcase?.url || activeProject?.bannerImage || activeProject?.thumbnailUrl;
  const currentShowcaseUrl = isValidImageUrl(rawShowcaseUrl) ? rawShowcaseUrl : "";
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

  const whatsAppUrl = `https://wa.me/6289508436275?text=${encodeURIComponent(whatsAppMessage)}`;

  return (
    <AnimatePresence>
      {isOpen && activeProject && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          {/* Animated Dim Backdrop with Blur */}
          <motion.div
            key="project-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs z-0 cursor-pointer"
          />

          {/* Animated Fullscreen Sheet Modal */}
          <motion.div
            key={`project-modal-sheet-${activeProject.id || activeProject.slug}`}
            initial={{ opacity: 0, y: 36, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{
              opacity: 0,
              y: 28,
              scale: 0.985,
              transition: { duration: 0.22, ease: [0.32, 0, 0.67, 0] },
            }}
            transition={{
              duration: 0.35,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative z-10 size-full bg-white flex flex-col h-screen w-screen overflow-hidden shadow-2xl font-sans"
          >
            {/* =========================================================================
                STICKY FULL-WIDTH TOP NAVIGATION BAR
            ========================================================================= */}
            <motion.header
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.06, ease: "easeOut" }}
              className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-zinc-200/90 shadow-2xs"
            >
              <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-3 sm:gap-4">
                {/* Left: Back / Close Action */}
                <div className="flex items-center gap-3 min-w-0">
                  <motion.button
                    type="button"
                    onClick={onClose}
                    whileHover={{ scale: 1.02, x: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="group inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 hover:text-zinc-950 font-medium text-xs sm:text-sm shadow-2xs transition-colors cursor-pointer shrink-0"
                  >
                    <span className="icon-[lucide--arrow-left] size-4 text-zinc-500 group-hover:text-zinc-900 group-hover:-translate-x-0.5 transition-transform" />
                    <span className="hidden xs:inline">{activeDict.projects.backButton}</span>
                    <span className="hidden sm:inline-block font-sans text-[10px] font-medium text-zinc-400 border border-zinc-200 rounded px-1 ml-0.5">
                      Esc
                    </span>
                  </motion.button>

              <div className="h-4 w-px bg-zinc-200 hidden sm:block shrink-0" />

              {/* Title & Category Breadcrumb */}
              <div className="min-w-0 flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-zinc-900 truncate">
                  {title}
                </h2>
              </div>
            </div>

            {/* Right: Quick Action Buttons & Close Icon */}
            <div className="flex items-center gap-2 shrink-0">
              {!isNda && activeProject.projectUrl && (
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

              {!isNda && activeProject.githubUrl && (
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

              <motion.button
                type="button"
                onClick={onClose}
                whileHover={{ scale: 1.08, rotate: 90 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                aria-label={activeDict.projects.closeModal}
                className="size-8 sm:size-9 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 hover:text-zinc-950 flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="icon-[lucide--x] size-4" />
              </motion.button>
            </div>
          </div>

          {/* =========================================================================
              SEGMENTED TAB CONTROLS (ONLY DISPLAYED IF DISTINCT SUMMARY EXISTS)
          ========================================================================= */}
          {hasDistinctSummary && (
            <div className="border-t border-zinc-200/80 bg-white">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 py-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab("overview")}
                    className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                      currentTab === "overview"
                        ? "text-zinc-950 bg-zinc-100 font-semibold shadow-2xs"
                        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                    }`}
                  >
                    <span
                      className={`icon-[lucide--layout-grid] size-4 ${
                        currentTab === "overview" ? "text-zinc-950" : "text-zinc-400"
                      }`}
                    />
                    <span>{activeDict.projects.tabOverview}</span>
                    {galleryItems.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-sans font-medium bg-zinc-200/80 text-zinc-700">
                        {galleryItems.length} {isNda ? "media" : "foto"}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("details")}
                    className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                      currentTab === "details"
                        ? "text-zinc-950 bg-zinc-100 font-semibold shadow-2xs"
                        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                    }`}
                  >
                    <span
                      className={`icon-[lucide--file-code-2] size-4 ${
                        currentTab === "details" ? "text-zinc-950" : "text-zinc-400"
                      }`}
                    />
                    <span>{activeDict.projects.tabDetails}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.header>

        {/* =========================================================================
            MAIN SCROLLABLE CONTENT AREA
        ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
          className="flex-1 overflow-y-auto overscroll-contain bg-white"
        >
          <main className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 space-y-8">
            {/* =========================================================================
                PROJECT HEADER (MATCHING HOME SECTION/HERO TITLE STYLE)
            ========================================================================= */}
            <header className="border-b border-zinc-200/80 pb-4 sm:pb-6 space-y-2.5">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="text-xs sm:text-sm font-mono font-semibold text-zinc-400 select-none">
                  01
                </span>
                {category && (
                  <span className="text-xs sm:text-sm font-semibold text-zinc-600">
                    {category}
                  </span>
                )}
                {isNda && (
                  <NdaBadge label={activeDict.projects.ndaBadge} size="sm" />
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-ink leading-tight">
                {title}
              </h1>

              {summary && (
                <p className="text-sm sm:text-base text-zinc-600 leading-relaxed max-w-3xl pt-0.5">
                  {summary}
                </p>
              )}
            </header>

            {/* =========================================================================
                PROJECT BANNER & THUMBNAILS SHOWCASE (ALWAYS VISIBLE AT TOP)
            ========================================================================= */}
            <div className="space-y-3.5">
              {/* Main Banner Image Display */}
              <div
                onClick={() =>
                  !isNda &&
                  galleryItems.length > 0 &&
                  setLightboxIndex(selectedImageIndex)
                }
                className={`group relative aspect-[16/9] sm:aspect-[2.1/1] w-full rounded-2xl overflow-hidden border border-zinc-200/90 bg-zinc-950 shadow-2xs ${
                  !isNda && galleryItems.length > 0 ? "cursor-zoom-in" : ""
                }`}
              >
                {isValidImageUrl(currentShowcaseUrl) ? (
                  <Image
                    src={currentShowcaseUrl}
                    alt={currentShowcaseName || title || "Preview"}
                    fill
                    sizes="(max-width: 1200px) 100vw, 1024px"
                    className={`object-contain sm:object-cover transition-all duration-300 ${isNda && ndaBlurEnabled
                      ? "filter blur-[5px] scale-105"
                      : ""
                      }`}
                    priority
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-zinc-100 text-zinc-400 font-sans text-sm font-medium uppercase tracking-wider">
                    {category || title || "Preview"}
                  </div>
                )}

                {/* Watermark Overlay for NDA Projects */}
                {isNda && (
                  <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[2px] flex items-center justify-center p-4">
                    <div className="px-4 py-2.5 rounded-xl bg-zinc-900/95 border border-white/20 backdrop-blur-md shadow-2xl flex items-center gap-3 text-white text-center">
                      <span className="icon-[lucide--shield-lock] size-5 text-amber-400 shrink-0" />
                      <div className="text-left">
                        <span className="font-sans text-xs uppercase tracking-wider font-bold block text-amber-300">
                          {activeDict.projects.confidentialStamp}
                        </span>
                        <span className="text-[10px] text-zinc-300 font-sans font-medium block">
                          PROTECTED ENTERPRISE SYSTEM // REDACTED DATA
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Next / Previous Screen Controls on Hover */}
                {galleryItems.length > 1 && (
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
                {galleryItems.length > 0 && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-2 z-10">
                    <span className="px-2.5 py-1 rounded-md bg-zinc-900/85 backdrop-blur-xs border border-white/20 text-white font-sans text-[11px] font-semibold tabular-nums shadow-xs">
                      {selectedImageIndex + 1} / {galleryItems.length}
                    </span>
                    {!isNda && (
                      <span className="p-1 rounded-md bg-zinc-900/85 backdrop-blur-xs border border-white/20 text-white shadow-xs">
                        <span className="icon-[lucide--maximize-2] size-3.5 block" />
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* =========================================================================
                  THUMBNAILS DI BAWAH BANNER IMAGE (WITH BLUR FOR NDA)
              ========================================================================= */}
              {galleryItems.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs text-zinc-500 font-sans">
                    <span className="flex items-center gap-1.5 font-semibold text-zinc-700">
                      <span className="icon-[lucide--image] size-3.5 text-zinc-500" />
                      <span>Thumbnail & Tangkapan Layar ({galleryItems.length})</span>
                    </span>
                    {isNda ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-sans font-medium">
                        <span className="icon-[lucide--shield-alert] size-3" />
                        <span>Disensor (NDA Blur)</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-zinc-400">
                        Klik thumbnail untuk beralih tampilan
                      </span>
                    )}
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
                          className={`group relative shrink-0 aspect-[16/10] w-24 sm:w-28 md:w-32 rounded-lg overflow-hidden border transition-all cursor-pointer ${isSelected
                            ? isNda
                              ? "ring-2 ring-amber-500 border-amber-500 shadow-sm scale-102"
                              : "ring-2 ring-zinc-950 border-zinc-950 shadow-sm scale-102"
                            : isNda
                              ? "border-amber-200/90 hover:border-amber-400 opacity-80 hover:opacity-100"
                              : "border-zinc-200/90 hover:border-zinc-400 opacity-75 hover:opacity-100"
                            }`}
                        >
                          {isValidImageUrl(item.url) && (
                            <Image
                              src={item.url}
                              alt={item.name || `Thumbnail ${idx + 1}`}
                              fill
                              sizes="130px"
                              className={`object-cover transition-all duration-300 ${isNda && ndaBlurEnabled
                                ? "filter blur-[3.5px] scale-110"
                                : ""
                                }`}
                            />
                          )}
                          {isNda && (
                            <div className="absolute inset-0 bg-zinc-950/25 backdrop-blur-[0.5px] flex items-center justify-center pointer-events-none">
                              <span className="icon-[lucide--lock] size-3.5 text-amber-300 drop-shadow-xs" />
                            </div>
                          )}
                          {isSelected && (
                            <div
                              className={`absolute inset-0 pointer-events-none ${isNda ? "bg-amber-500/10" : "bg-zinc-950/15"
                                }`}
                            />
                          )}
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/60 to-transparent p-1">
                            <span className="text-[9px] text-white font-sans block truncate leading-tight font-medium">
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
                SPESIFIKASI PROYEK (STATUS, TIMELINE, TECH STACK - PERSISTENT DI SEMUA TAB)
            ========================================================================= */}
            <div className="py-6 border-b border-zinc-200/80 space-y-5">
              {/* Header with Title matching Home SectionHeader Style */}
              <div className="border-b border-zinc-200/80 pb-3 flex items-baseline justify-between gap-3 flex-wrap">
                <div className="flex items-baseline gap-2 sm:gap-3">
                  <span className="text-xs sm:text-sm font-mono font-semibold text-zinc-400 select-none">
                    02
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">
                    {activeDict.projects.projectSpecsTitle}
                  </h2>
                </div>
                {isNda && (
                  <NdaBadge label={activeDict.projects.ndaBadge} size="sm" />
                )}
              </div>

              {/* Status, Timeline & Specifications (Clean Editorial Definition List with Icons) */}
              <dl className="flex flex-wrap items-start gap-y-4 gap-x-8 sm:gap-x-12 py-1">
                <div className="shrink-0">
                  <dt className="text-xs font-medium text-zinc-400">
                    {activeDict.projects.status}
                  </dt>
                  <dd className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-zinc-900 whitespace-nowrap">
                    <span className="icon-[lucide--circle-check] size-4 text-emerald-600 shrink-0" />
                    <span>{displayStatus}</span>
                  </dd>
                </div>

                <div className="shrink-0">
                  <dt className="text-xs font-medium text-zinc-400">
                    {activeDict.projects.timeline}
                  </dt>
                  <dd className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-zinc-900 tabular-nums whitespace-nowrap">
                    <span className="icon-[lucide--calendar] size-4 text-zinc-500 shrink-0" />
                    <span className="whitespace-nowrap">{formattedTimeline}</span>
                  </dd>
                </div>

                {category && (
                  <div className="shrink-0">
                    <dt className="text-xs font-medium text-zinc-400">
                      {activeLocale === "id" ? "Kategori" : "Category"}
                    </dt>
                    <dd className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-zinc-900 whitespace-nowrap">
                      <span className="icon-[lucide--layers] size-4 text-zinc-500 shrink-0" />
                      <span>{category}</span>
                    </dd>
                  </div>
                )}

                {activeProject.projectUrl && !isNda && (
                  <div className="shrink-0">
                    <dt className="text-xs font-medium text-zinc-400">
                      {activeLocale === "id" ? "Akses Langsung" : "Live Access"}
                    </dt>
                    <dd className="mt-1">
                      <a
                        href={activeProject.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-900 hover:text-zinc-600 transition-colors group whitespace-nowrap"
                      >
                        <span className="icon-[lucide--globe] size-4 text-zinc-500 group-hover:text-zinc-900 transition-colors" />
                        <span>{activeDict.projects.website}</span>
                        <span className="icon-[lucide--arrow-up-right] size-3.5 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                      </a>
                    </dd>
                  </div>
                )}
              </dl>

              {/* Row: Teknologi yang Digunakan */}
              {normalizedTechStack.length > 0 && (
                <div className="space-y-2.5 pt-1">
                  <h3 className="text-xs sm:text-sm font-semibold text-zinc-700">
                    {activeDict.projects.techUsed}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    {normalizedTechStack.map((tech, idx) => {
                      const techInfo = getTechIcon(tech);
                      return (
                        <span
                          key={`${tech}-${idx}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-50 text-zinc-800 border border-zinc-200/90 shadow-2xs hover:bg-zinc-100 transition-colors"
                        >
                          <span
                            className={`${techInfo.iconClass} size-3.5 shrink-0`}
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

            {/* =========================================================================
                TAB CONTENT AREA: HANYA KONTEN YANG BERUBAH SAAT PERPINDAHAN TAB
            ========================================================================= */}
            <AnimatePresence mode="wait">
              {currentTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Compact NDA notice at top */}
                  {isNda && (
                    <div className="flex items-start sm:items-center gap-3.5 p-4 rounded-xl border border-amber-200 bg-amber-50/80 text-amber-900 shadow-2xs">
                      <div className="size-8 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 text-amber-800 mt-0.5 sm:mt-0">
                        <span className="icon-[lucide--shield-alert] size-4.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 font-sans">
                            {activeDict.projects.confidentialStamp}
                          </h4>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-900 font-sans font-semibold">
                            REDACTED
                          </span>
                        </div>
                        <p className="text-xs text-amber-800/90 leading-relaxed mt-0.5">
                          {activeDict.projects.confidentialNotice}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Executive Client Summary */}
                  {summaryContent ? (
                    <div className="space-y-4 pt-1">
                      <div className="border-b border-zinc-200/80 pb-3 flex items-baseline justify-between gap-3 flex-wrap">
                        <div className="flex items-baseline gap-2 sm:gap-3">
                          <span className="text-xs sm:text-sm font-mono font-semibold text-zinc-400 select-none">
                            03
                          </span>
                          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">
                            {activeDict.projects.clientSummaryTitle}
                          </h2>
                        </div>
                        {isNda && (
                          <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-md font-medium">
                            Ringkasan Arsitektur
                          </span>
                        )}
                      </div>
                      <MarkdownContent
                        content={summaryContent}
                        className="text-sm sm:text-base text-zinc-700 leading-relaxed"
                      />
                    </div>
                  ) : null}
                </motion.div>
              )}

              {currentTab === "details" && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="space-y-6 pt-1">
                    <div className="border-b border-zinc-200/80 pb-3 flex items-baseline justify-between gap-3 flex-wrap">
                      <div className="flex items-baseline gap-2 sm:gap-3">
                        <span className="text-xs sm:text-sm font-mono font-semibold text-zinc-400 select-none">
                          03
                        </span>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">
                          {isNda
                            ? "Spesifikasi Arsitektur Sistem (High-Level)"
                            : activeDict.projects.caseStudyTitle}
                        </h2>
                      </div>
                    </div>

                    {/* NDA Banner inside Details */}
                    {isNda && (
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
                      <div className="text-center py-12 text-zinc-400 font-sans text-sm">
                        Dokumentasi studi kasus teknis belum dipublikasikan.
                      </div>
                    )}
                  </div>

                  {/* Back to Overview Tab (Only if distinct summary exists) */}
                  {hasDistinctSummary && (
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
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </motion.div>

        {/* =========================================================================
            SCREENSHOT LIGHTBOX OVERLAY
        ========================================================================= */}
        {lightboxIndex !== null &&
          galleryItems[lightboxIndex] &&
          isValidImageUrl(galleryItems[lightboxIndex].url) && (
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
                  <span className="text-xs font-sans font-semibold tabular-nums bg-zinc-800/90 px-3 py-1 rounded-md border border-zinc-700">
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
