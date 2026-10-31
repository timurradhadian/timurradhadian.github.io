"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Certificate, Locale } from "@/types/portfolio";
import { getDictionary } from "@/lib/i18n";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";

interface CertificatesProps {
  locale: Locale;
  certificates: Certificate[];
}

function getIssuerBadge(issuer: string, logo?: string): {
  image?: string;
  icon?: string;
  className: string;
} {
  if (logo) {
    return {
      image: logo,
      className: "bg-white border-zinc-200/90 shadow-2xs",
    };
  }
  const clean = issuer.toLowerCase();
  if (
    clean.includes("buildwithangga") ||
    clean.includes("bwa") ||
    clean.includes("angga")
  ) {
    return {
      image: "/certificates/buildwithangga.png",
      className: "bg-white border-zinc-200/90 shadow-2xs",
    };
  }
  if (clean.includes("udemy")) {
    return {
      image: "/certificates/udemy.png",
      className: "bg-white border-zinc-200/90 shadow-2xs",
    };
  }
  if (clean.includes("algoritma")) {
    return {
      image: "/certificates/algoritma.png",
      className: "bg-white border-zinc-200/90 shadow-2xs",
    };
  }
  if (
    clean.includes("jago flutter") ||
    clean.includes("jagoflutter") ||
    clean.includes("fic")
  ) {
    return {
      image: "/certificates/jago-flutter.png",
      className: "bg-white border-zinc-200/90 shadow-2xs",
    };
  }
  if (clean.includes("aws") || clean.includes("amazon")) {
    return {
      icon: "icon-[logos--aws]",
      className: "bg-white border-zinc-200/90 shadow-2xs",
    };
  }
  if (clean.includes("meta") || clean.includes("coursera")) {
    return {
      icon: "icon-[logos--meta-icon]",
      className: "bg-white border-zinc-200/90 shadow-2xs",
    };
  }
  if (clean.includes("google")) {
    return {
      icon: "icon-[logos--google-icon]",
      className: "bg-white border-zinc-200/90 shadow-2xs",
    };
  }
  if (clean.includes("linux") || clean.includes("kubernetes") || clean.includes("cncf")) {
    return {
      icon: "icon-[logos--linux-tux]",
      className: "bg-white border-zinc-200/90 shadow-2xs",
    };
  }
  return {
    icon: "icon-[lucide--award]",
    className: "bg-zinc-50 border-zinc-200 text-zinc-700 shadow-2xs",
  };
}

function getProviderKey(issuer: string): string {
  const clean = issuer.trim().toLowerCase();
  if (clean.includes("buildwithangga") || clean.includes("bwa") || clean.includes("angga")) {
    return "BuildWithAngga";
  }
  if (clean.includes("udemy")) {
    return "Udemy";
  }
  if (clean.includes("algoritma")) {
    return "Algoritma";
  }
  if (
    clean.includes("jago flutter") ||
    clean.includes("jagoflutter") ||
    clean.includes("fic")
  ) {
    return "Jago Flutter";
  }
  if (clean.includes("aws") || clean.includes("amazon")) {
    return "Amazon Web Services (AWS)";
  }
  if (clean.includes("meta") || clean.includes("coursera")) {
    return "Meta";
  }
  if (clean.includes("linux") || clean.includes("kubernetes") || clean.includes("cncf")) {
    return "The Linux Foundation";
  }
  if (clean.includes("google")) {
    return "Google";
  }
  return issuer.trim();
}

function getGroupDateRange(certs: Certificate[]): string {
  const years = certs
    .map((c) => {
      const match = c.issueDate.match(/\b(20\d\d)\b/);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((y): y is number => y !== null);

  if (years.length === 0) return certs[0]?.issueDate || "";
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  return minYear === maxYear ? `${minYear}` : `${minYear} – ${maxYear}`;
}

function formatCertificateDate(dateStr: string, locale: Locale): string {
  if (locale === "id") {
    return dateStr
      .replace(/\bJanuary\b/gi, "Januari")
      .replace(/\bFebruary\b/gi, "Februari")
      .replace(/\bMarch\b/gi, "Maret")
      .replace(/\bMay\b/gi, "Mei")
      .replace(/\bJune\b/gi, "Juni")
      .replace(/\bJuly\b/gi, "Juli")
      .replace(/\bAugust\b/gi, "Agustus")
      .replace(/\bOctober\b/gi, "Oktober")
      .replace(/\bDecember\b/gi, "Desember");
  }
  return dateStr
    .replace(/\bJanuari\b/gi, "January")
    .replace(/\bFebruari\b/gi, "February")
    .replace(/\bMaret\b/gi, "March")
    .replace(/\bMei\b/gi, "May")
    .replace(/\bJuni\b/gi, "June")
    .replace(/\bJuli\b/gi, "July")
    .replace(/\bAgustus\b/gi, "August")
    .replace(/\bOktober\b/gi, "October")
    .replace(/\bDesember\b/gi, "December");
}

interface ProviderGroup {
  id: string;
  name: string;
  badge: ReturnType<typeof getIssuerBadge>;
  certificates: Certificate[];
  dateRange: string;
}

export function Certificates({ locale, certificates = [] }: CertificatesProps) {
  const dict = getDictionary(locale);

  // Group certificates by normalized Provider
  const groups = useMemo<ProviderGroup[]>(() => {
    const map = new Map<string, Certificate[]>();
    for (const cert of certificates) {
      const provider = getProviderKey(cert.issuer);
      if (!map.has(provider)) {
        map.set(provider, []);
      }
      map.get(provider)!.push(cert);
    }

    const result: ProviderGroup[] = [];
    map.forEach((items, name) => {
      // Sort individual certificates within group by date descending
      const sortedItems = [...items].sort((a, b) => {
        const getYear = (d: string) => {
          const m = d.match(/\b(20\d\d)\b/);
          return m ? parseInt(m[1], 10) : 0;
        };
        const yA = getYear(a.issueDate);
        const yB = getYear(b.issueDate);
        if (yB !== yA) return yB - yA;
        return (a.order ?? 0) - (b.order ?? 0);
      });

      const badge = getIssuerBadge(name, items[0]?.logo);
      const dateRange = getGroupDateRange(sortedItems);
      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      result.push({
        id,
        name,
        badge,
        certificates: sortedItems,
        dateRange,
      });
    });

    // Sort provider groups by latest certificate year descending
    return result.sort((a, b) => {
      const getYear = (group: ProviderGroup) => {
        const years = group.certificates
          .map((c) => {
            const match = c.issueDate.match(/\b(20\d\d)\b/);
            return match ? parseInt(match[1], 10) : null;
          })
          .filter((y): y is number => y !== null);
        return years.length > 0 ? Math.max(...years) : 0;
      };
      const yearDiff = getYear(b) - getYear(a);
      if (yearDiff !== 0) return yearDiff;
      return b.certificates.length - a.certificates.length;
    });
  }, [certificates]);

  // Default: first provider open
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    return groups.length > 0 ? { [groups[0].id]: true } : {};
  });

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (!certificates || certificates.length === 0) return null;

  return (
    <section id="certifications" className="space-y-4 pt-4 scroll-mt-6 sm:scroll-mt-8">
      <SectionHeader
        number="06"
        title={dict.certificates.title}
        hint={dict.certificates.subtitle}
        delay={0.05}
      />

      <div className="divide-y divide-zinc-200/80">
        {groups.map((group, idx) => {
          const isExpanded = Boolean(expandedGroups[group.id]);

          return (
            <Reveal key={group.id} delay={0.08 + idx * 0.04} yOffset={8}>
              <div
                onClick={() => toggleGroup(group.id)}
                className="group py-3.5 sm:py-4 -mx-2 px-2 rounded-xl transition-colors hover:bg-zinc-50/70 cursor-pointer"
              >
                <div className="flex items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
                    {/* Logo Badge matching Education */}
                    <div
                      className={`size-10 sm:size-11 rounded-xl border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs overflow-hidden p-1.5 ${group.badge.className}`}
                    >
                      {group.badge.image ? (
                        <div className="relative size-full">
                          <Image
                            src={group.badge.image}
                            alt={group.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <span
                          className={`${group.badge.icon} size-5 inline-block shrink-0`}
                        />
                      )}
                    </div>

                    {/* Provider Details matching Education hierarchy */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="font-semibold text-sm sm:text-base text-zinc-900 truncate">
                          {group.name}
                        </h3>
                        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                          <span className="text-xs sm:text-sm text-zinc-500 tabular-nums font-normal">
                            {group.dateRange}
                          </span>
                          <motion.span
                            animate={{ rotate: isExpanded ? 90 : 0 }}
                            transition={{ type: "spring", stiffness: 350, damping: 22 }}
                            className={`icon-[lucide--chevron-right] size-3.5 sm:size-4 shrink-0 transition-colors ${
                              isExpanded
                                ? "text-zinc-900"
                                : "text-zinc-400 group-hover:text-zinc-800"
                            }`}
                            aria-hidden="true"
                          />
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-zinc-500 truncate mt-0.5">
                        {group.certificates.length}{" "}
                        {locale === "id"
                          ? "Sertifikat"
                          : group.certificates.length > 1
                          ? "Certificates"
                          : "Certificate"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Collapsible Certificate List */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      className="overflow-hidden pl-0 sm:pl-14.5 pt-2"
                    >
                      <div className="mt-3 pt-2 border-t border-zinc-100 divide-y divide-zinc-100/90">
                        {group.certificates.map((cert) => {
                          const certDate = formatCertificateDate(cert.issueDate, locale);
                          return (
                            <div
                              key={cert.id}
                              className="py-2.5 px-2 -mx-2 rounded-lg hover:bg-zinc-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                            >
                              <div className="min-w-0 flex-1">
                                <h4 className="font-semibold text-xs sm:text-sm text-zinc-900 leading-snug">
                                  {cert.title}
                                </h4>
                                {cert.credentialId && (
                                  <p className="font-mono text-[11px] text-zinc-400 truncate mt-0.5">
                                    ID: {cert.credentialId}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
                                <span className="text-zinc-500 tabular-nums text-[11px] sm:text-xs">
                                  {certDate}
                                </span>

                                {cert.credentialUrl && (
                                  <a
                                    href={cert.credentialUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-800 hover:text-zinc-950 bg-zinc-100 hover:bg-zinc-200 px-2 py-0.5 rounded-md transition-colors shrink-0"
                                    title={dict.certificates.verifyLink}
                                  >
                                    <span>{dict.certificates.verifyLink}</span>
                                    <span className="icon-[lucide--external-link] size-2.5 inline-block text-zinc-500" />
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
