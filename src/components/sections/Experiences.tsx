"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Experience, Locale, Project } from "@/types/portfolio";
import { getDictionary, getLocalized, getLocalizedArray } from "@/lib/i18n";
import { Reveal } from "@/components/motion/Reveal";
import { ProjectDetailModal } from "@/components/ui/ProjectDetailModal";

interface ExperiencesProps {
  locale: Locale;
  experiences: Experience[];
  allProjects?: Project[];
}

function getCompanyBadge(company: string): { icon?: string; image?: string; className: string } {
  const normalized = company.toLowerCase();
  if (normalized.includes("sejati")) {
    return {
      image: "/companies/sejatidimedia.png",
      className: "bg-white border-zinc-200/90 shadow-2xs",
    };
  }
  if (
    normalized.includes("tanjung") ||
    normalized.includes("kreasi") ||
    normalized.includes("dsn") ||
    normalized.includes("teka") ||
    normalized.includes("parquet")
  ) {
    return {
      image: "/companies/tanjung-kreasi.png",
      className: "bg-white border-zinc-200/90 shadow-2xs",
    };
  }
  if (normalized.includes("tech") || normalized.includes("digital")) {
    return {
      icon: "icon-[lucide--cpu]",
      className: "bg-purple-50 text-purple-600 border-purple-200",
    };
  }
  return {
    icon: "icon-[lucide--briefcase]",
    className: "bg-zinc-50 text-zinc-700 border-zinc-200",
  };
}

// Fallback high-fidelity manufacturing projects list developed at Tanjung Kreasi Parquet Industry
const DEFAULT_MANUFACTURING_PROJECTS: Array<{
  id: string;
  slug: string;
  title: string;
  titleId?: string;
  titleEn?: string;
  summary: string;
  summaryId: string;
  summaryEn: string;
  category: string;
  categoryId?: string;
  categoryEn?: string;
  isNda: boolean;
  techStack: string[];
}> = [
    {
      id: "mfg-1",
      slug: "erp-digitalisasi-produksi-industry-manufaktur",
      title: "ERP Digitalisasi Produksi (Industry Manufaktur)",
      titleId: "ERP Digitalisasi Produksi (Industry Manufaktur)",
      titleEn: "Production Digitalization ERP (Manufacturing Industry)",
      summary:
        "Sistem ERP produksi berbasis barcode & data staging engine untuk sinkronisasi data transaksi lantai pabrik dengan sistem SAP.",
      summaryId:
        "Sistem ERP produksi berbasis barcode & data staging engine untuk sinkronisasi data transaksi lantai pabrik dengan sistem SAP.",
      summaryEn:
        "Barcode-based production ERP with data staging architecture for SAP data ingestion and real-time shop floor validation.",
      category: "Manufacturing ERP",
      categoryId: "ERP Manufaktur",
      categoryEn: "Manufacturing ERP",
      isNda: true,
      techStack: ["Angular", "Laravel", "Javascript", "Mysql"],
    },
    {
      id: "mfg-2",
      slug: "warehouse-management-system-industry-manufaktur",
      title: "Warehouse Management System (Industry Manufaktur)",
      titleId: "Warehouse Management System (Industry Manufaktur)",
      titleEn: "Warehouse Management System (Manufacturing Industry)",
      summary:
        "WMS multi-gudang berbasis barcode terintegrasi SAP API. Otomasi mutasi fisik Bahan Baku hingga Jadi serta mempercepat stock opname digital real-time.",
      summaryId:
        "WMS multi-gudang berbasis barcode terintegrasi SAP API. Otomasi mutasi fisik Bahan Baku hingga Jadi serta mempercepat stock opname digital real-time.",
      summaryEn:
        "Multi-warehouse barcode-driven WMS integrated with SAP API for automated material movements and digital stock reconciliation.",
      category: "Supply Chain & Logistics",
      categoryId: "Logistik & Supply Chain",
      categoryEn: "Supply Chain & Logistics",
      isNda: true,
      techStack: ["Angular", "Laravel", "Javascript", "Mysql"],
    },
    {
      id: "mfg-3",
      slug: "report--dashboard-industry-manufaktur",
      title: "Report & Dashboard (Industry Manufaktur)",
      titleId: "Report & Dashboard (Industry Manufaktur)",
      titleEn: "Report & Dashboard (Manufacturing Industry)",
      summary:
        "Dashboard untuk monitoring produksi, grade, komposisi material, dan kualitas — menyatukan laporan yang sebelumnya tersebar di banyak file Excel.",
      summaryId:
        "Dashboard untuk monitoring produksi, grade, komposisi material, dan kualitas — menyatukan laporan yang sebelumnya tersebar di banyak file Excel.",
      summaryEn:
        "Analytics dashboard for monitoring production output, product grading, material composition, and quality control metrics.",
      category: "Analytics & Reporting",
      categoryId: "Analisis & Laporan",
      categoryEn: "Analytics & Reporting",
      isNda: true,
      techStack: ["Laravel", "Angular", "Mysql"],
    },
    {
      id: "mfg-4",
      slug: "digitalisasi-sistem-surat-jalan-industry-manufaktur",
      title: "Digitalisasi Sistem Surat Jalan (Industry Manufaktur)",
      titleId: "Digitalisasi Sistem Surat Jalan (Industry Manufaktur)",
      titleEn: "Delivery Note Digitalization System (Manufacturing Industry)",
      summary:
        "Sistem digitalisasi surat jalan & tally material untuk pabrik manufaktur kayu — dari portal vendor hingga STTM otomatis yang siap audit Bea Cukai.",
      summaryId:
        "Sistem digitalisasi surat jalan & tally material untuk pabrik manufaktur kayu — dari portal vendor hingga STTM otomatis yang siap audit Bea Cukai.",
      summaryEn:
        "Digital delivery note & material tally platform for wood manufacturing — bridging vendor input to automated Customs-compliant receipts.",
      category: "Enterprise System",
      categoryId: "Sistem Enterprise",
      categoryEn: "Enterprise System",
      isNda: true,
      techStack: ["Laravel", "Angular", "Javascript", "Mysql"],
    },
    {
      id: "mfg-5",
      slug: "digitalisasi-import-monitoring-system-industry-manufaktur",
      title: "Digitalisasi Import Monitoring System (Industry Manufaktur)",
      titleId: "Digitalisasi Import Monitoring System (Industry Manufaktur)",
      titleEn: "Import Monitoring Digitalization System (Manufacturing Industry)",
      summary:
        "Sistem monitoring impor dengan pelacakan kapal real-time dan validasi dokumen PR-PO-Packing List terkunci untuk kepatuhan Bea Cukai.",
      summaryId:
        "Sistem monitoring impor dengan pelacakan kapal real-time dan validasi dokumen PR-PO-Packing List terkunci untuk kepatuhan Bea Cukai.",
      summaryEn:
        "An import monitoring platform featuring real-time vessel tracking and locked PR-PO-Packing List document validation for Customs compliance.",
      category: "Compliance & Logistics",
      categoryId: "Kepatuhan & Logistik",
      categoryEn: "Compliance & Logistics",
      isNda: true,
      techStack: ["Laravel", "Angular", "Javascript", "Mysql"],
    },
    {
      id: "mfg-6",
      slug: "digitalisasi-sistem-bongkar-muat-material-logistik-kayu-industry-manufaktur",
      title: "Digitalisasi Sistem Bongkar Muat Material Logistik Kayu (Industry Manufaktur)",
      titleId: "Digitalisasi Sistem Bongkar Muat Material Logistik Kayu (Industry Manufaktur)",
      titleEn: "Timber Logistics Loading & Unloading Digitalization (Manufacturing Industry)",
      summary:
        "Modul digitalisasi area bongkar muat dengan kalkulator tally otomatis, approval workflow, dan broadcast data real-time ke Vendor, PPIC, dan Accounting.",
      summaryId:
        "Modul digitalisasi area bongkar muat dengan kalkulator tally otomatis, approval workflow, dan broadcast data real-time ke Vendor, PPIC, dan Accounting.",
      summaryEn:
        "Material unloading digitalization module featuring automated tally calculators, approval workflows, and real-time data broadcasting to Vendor, PPIC, and Accounting.",
      category: "Logistics Automation",
      categoryId: "Otomasi Logistik",
      categoryEn: "Logistics Automation",
      isNda: true,
      techStack: ["Angular", "Javascript", "Laravel"],
    },
    {
      id: "mfg-7",
      slug: "wood-tracebility-system-industry-manufaktur",
      title: "Wood Tracebility System (Industry Manufaktur)",
      titleId: "Wood Tracebility System (Industry Manufaktur)",
      titleEn: "Wood Traceability System (Manufacturing Industry)",
      summary:
        "Sistem traceability kayu berbasis GIS untuk kepatuhan SVLK & EUDR — memvalidasi titik tebang terhadap batas lahan dan mengunci identitas legalitas dari hulu hingga produk jadi.",
      summaryId:
        "Sistem traceability kayu berbasis GIS untuk kepatuhan SVLK & EUDR — memvalidasi titik tebang terhadap batas lahan dan mengunci identitas legalitas dari hulu hingga produk jadi.",
      summaryEn:
        "Google Maps-driven timber traceability platform for SVLK & EUDR compliance — validating harvest coordinates against land boundaries and securing chain of custody barcodes.",
      category: "GIS & Traceability",
      categoryId: "GIS & Penelusuran",
      categoryEn: "GIS & Traceability",
      isNda: true,
      techStack: ["Angular", "Javascript", "GMaps API", "Laravel", "Mysql"],
    },
  ];

export function Experiences({
  locale,
  experiences,
  allProjects = [],
}: ExperiencesProps) {
  const dict = getDictionary(locale);
  const [expandedId, setExpandedId] = useState<string | null>(
    experiences[0]?.id || null
  );
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Find manufacturing projects from allProjects, or fallback to DEFAULT_MANUFACTURING_PROJECTS
  const manufacturingProjects = React.useMemo(() => {
    const fromApi = allProjects.filter((p) => {
      const slug = (p.slug || "").toLowerCase();
      const title = (p.title || "").toLowerCase();
      return (
        slug.includes("industry-manufaktur") ||
        title.includes("industry manufaktur") ||
        title.includes("(industry manufaktur)")
      );
    });

    if (fromApi.length >= 7) {
      return fromApi;
    }

    // Merge API projects with defaults to guarantee all 7 projects are available
    const existingSlugs = new Set(fromApi.map((p) => p.slug));
    const merged = [...fromApi];
    for (const def of DEFAULT_MANUFACTURING_PROJECTS) {
      if (!existingSlugs.has(def.slug)) {
        merged.push(def as unknown as Project);
      }
    }
    return merged;
  }, [allProjects]);

  return (
    <section id="experience" className="space-y-4 pt-4">
      <Reveal delay={0.1} yOffset={12}>
        <h2 className="text-xl font-bold tracking-tight text-ink">
          {dict.experience.title}
        </h2>
      </Reveal>

      <div className="space-y-3">
        {experiences.map((exp, idx) => {
          const position = getLocalized(exp, "position", locale);
          const highlights = getLocalizedArray(exp, "highlights", locale);
          const isExpanded = expandedId === exp.id;

          const dateDisplay = `${exp.startDate} - ${exp.endDate ? exp.endDate : dict.experience.present
            }`;

          const badge = getCompanyBadge(exp.company);
          const isSejati = exp.company.toLowerCase().includes("sejati");
          const isTanjungKreasi =
            exp.company.toLowerCase().includes("tanjung") ||
            exp.company.toLowerCase().includes("parquet") ||
            exp.company.toLowerCase().includes("kreasi");

          return (
            <Reveal key={exp.id} delay={0.1 + idx * 0.05} yOffset={10}>
              <div
                onClick={() => toggleExpand(exp.id)}
                className="group rounded-xl border border-zinc-200/90 bg-white hover:border-zinc-300 p-3.5 sm:p-4 transition-all shadow-xs cursor-pointer"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`size-10 sm:size-11 rounded-xl border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs overflow-hidden p-1.5 ${badge.className}`}
                    >
                      {badge.image ? (
                        <div className="relative size-full">
                          <Image
                            src={badge.image}
                            alt={exp.company}
                            fill
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <span className={`${badge.icon} size-5 inline-block shrink-0`} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm sm:text-base text-zinc-900 truncate">
                          {exp.company}
                        </h3>

                        {isSejati && (
                          <a
                            href="https://sejatidimedia.web.id/"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[11px] font-medium transition-all group/link shrink-0"
                            title="https://sejatidimedia.web.id/"
                          >
                            <span>sejatidimedia.web.id</span>
                            <span className="icon-[lucide--external-link] size-2.5 inline-block text-zinc-500 group-hover/link:text-zinc-800" />
                          </a>
                        )}

                        <span
                          className={`icon-[lucide--chevron-right] size-3.5 text-zinc-400 transition-transform duration-200 ml-auto shrink-0 ${isExpanded ? "rotate-90 text-zinc-700" : ""
                            }`}
                          aria-hidden="true"
                        />
                      </div>
                      <p className="text-xs sm:text-sm text-zinc-600 truncate">
                        {position}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-zinc-500 tabular-nums shrink-0 text-right">
                    {dateDisplay}
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      {/* Highlights */}
                      {highlights.length > 0 && (
                        <ul className="mt-3.5 pt-3 border-t border-zinc-100 space-y-1.5 text-xs text-zinc-600 leading-relaxed pl-4 list-disc marker:text-zinc-400">
                          {highlights.map((item, hIdx) => (
                            <li key={hIdx}>{item}</li>
                          ))}
                        </ul>
                      )}

                      {/* Tanjung Kreasi Manufacturing Projects List */}
                      {isTanjungKreasi && manufacturingProjects.length > 0 && (
                        <div className="mt-4 pt-3.5 border-t border-zinc-100 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
                              <span className="icon-[lucide--layers] size-3.5 text-zinc-500" />
                              <span>
                                {locale === "en"
                                  ? "Industrial Manufacturing Projects"
                                  : "Proyek Manufaktur Industri"}
                              </span>
                              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 text-zinc-700">
                                {manufacturingProjects.length}
                              </span>
                            </span>
                          </div>

                          <div className="grid grid-cols-1 gap-2">
                            {manufacturingProjects.map((proj) => {
                              const pTitle =
                                (locale === "en" ? proj.titleEn : proj.titleId) ||
                                proj.title;
                              const pSummary =
                                (locale === "en" ? proj.summaryEn : proj.summaryId) ||
                                proj.summary;

                              return (
                                <div
                                  key={proj.id || proj.slug}
                                  onClick={() => setSelectedProject(proj)}
                                  className="group rounded-lg border border-zinc-200/90 bg-zinc-50/60 p-3 space-y-1.5 hover:bg-zinc-100/90 hover:border-zinc-300 transition-all cursor-pointer shadow-2xs"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className="font-semibold text-xs sm:text-sm text-zinc-900 group-hover:text-zinc-950 leading-snug flex items-center gap-1.5">
                                      <span>{pTitle}</span>
                                      <span className="icon-[lucide--info] size-3.5 text-zinc-400 group-hover:text-zinc-700 shrink-0 inline-block" />
                                    </h4>
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                                      NDA
                                    </span>
                                  </div>

                                  {pSummary && (
                                    <p className="text-xs text-zinc-600 leading-relaxed">
                                      {pSummary}
                                    </p>
                                  )}

                                  {proj.techStack && proj.techStack.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-1 pt-1">
                                      {proj.techStack.map((tech: string) => (
                                        <span
                                          key={tech}
                                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-white border border-zinc-200/80 text-zinc-700 shadow-2xs"
                                        >
                                          {tech}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* Project Detail Modal */}
      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        locale={locale}
        dict={dict}
        ndaBlurEnabled={true}
      />
    </section>
  );
}
