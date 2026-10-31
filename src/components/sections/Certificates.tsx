"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { m, AnimatePresence } from "motion/react";
import { Certificate, Locale } from "@/types/portfolio";
import { getDictionary } from "@/lib/i18n";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";

interface CertificatesProps {
  locale: Locale;
  certificates: Certificate[];
}

function getIssuerInfo(issuer: string): {
  image?: string;
  icon?: string;
  bgClass: string;
} {
  const normalized = issuer.toLowerCase();
  if (
    normalized.includes("buildwithangga") ||
    normalized.includes("bwa") ||
    normalized.includes("angga")
  ) {
    return {
      image: "/certificates/buildwithangga.png",
      bgClass: "bg-white border-zinc-200/90 shadow-2xs",
    };
  }
  if (normalized.includes("udemy")) {
    return {
      image: "/certificates/udemy.png",
      bgClass: "bg-white border-zinc-200/90 shadow-2xs",
    };
  }
  if (normalized.includes("algoritma")) {
    return {
      image: "/certificates/algoritma.png",
      bgClass: "bg-white border-zinc-200/90 shadow-2xs",
    };
  }
  if (
    normalized.includes("jago flutter") ||
    normalized.includes("jagoflutter") ||
    normalized.includes("fic")
  ) {
    return {
      image: "/certificates/jago-flutter.png",
      bgClass: "bg-white border-zinc-200/90 shadow-2xs",
    };
  }
  if (normalized.includes("aws") || normalized.includes("amazon")) {
    return { icon: "icon-[logos--aws]", bgClass: "bg-white border-zinc-200" };
  }
  if (normalized.includes("meta")) {
    return { icon: "icon-[logos--meta-icon]", bgClass: "bg-white border-zinc-200" };
  }
  if (normalized.includes("google")) {
    return { icon: "icon-[logos--google-icon]", bgClass: "bg-white border-zinc-200" };
  }
  if (
    normalized.includes("linux") ||
    normalized.includes("kubernetes") ||
    normalized.includes("cncf")
  ) {
    return { icon: "icon-[logos--linux-tux]", bgClass: "bg-white border-zinc-200" };
  }
  return {
    icon: "icon-[lucide--award]",
    bgClass: "bg-zinc-50 border-zinc-200 text-zinc-700",
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

interface ProviderGroup {
  id: string;
  name: string;
  issuerInfo: ReturnType<typeof getIssuerInfo>;
  certificates: Certificate[];
  dateRange: string;
}

export function Certificates({ locale, certificates }: CertificatesProps) {
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
      const issuerInfo = getIssuerInfo(name);
      const dateRange = getGroupDateRange(items);
      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      result.push({
        id,
        name,
        issuerInfo,
        certificates: items,
        dateRange,
      });
    });

    // Sort by certificate count (highest first) or recent date
    return result.sort((a, b) => b.certificates.length - a.certificates.length);
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

  return (
    <section id="certifications" className="space-y-6 pt-6">
      <SectionHeader
        number="06"
        title={dict.certificates.title}
        hint={dict.certificates.subtitle}
        delay={0.05}
      />

      {/* Grouped Provider Cards */}
      <div className="space-y-3">
        {groups.map((group, idx) => {
          const isExpanded = !!expandedGroups[group.id];

          return (
            <Reveal key={group.id} delay={0.1 + idx * 0.05} yOffset={10}>
              <m.div
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="group rounded-xl border border-zinc-200/90 bg-white hover:border-zinc-300 hover:shadow-sm p-3.5 sm:p-4 transition-colors shadow-xs cursor-pointer"
                onClick={() => toggleGroup(group.id)}
              >
                {/* Provider Card Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`size-10 sm:size-11 rounded-xl border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs overflow-hidden p-1.5 ${group.issuerInfo.bgClass}`}
                    >
                      {group.issuerInfo.image ? (
                        <div className="relative size-full">
                          <Image
                            src={group.issuerInfo.image}
                            alt={group.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <span
                          className={`${group.issuerInfo.icon} size-5 inline-block shrink-0`}
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm sm:text-base text-zinc-900 truncate">
                          {group.name}
                        </h3>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 text-[11px] font-medium border border-zinc-200/60 shrink-0">
                          {group.certificates.length}{" "}
                          {locale === "id"
                            ? "Sertifikat"
                            : group.certificates.length > 1
                            ? "Certificates"
                            : "Certificate"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Date Range & Chevron */}
                  <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 pl-2">
                    <span className="text-xs text-zinc-500 tabular-nums text-right">
                      {group.dateRange}
                    </span>
                    <m.span
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ type: "spring", stiffness: 350, damping: 22 }}
                      className={`icon-[lucide--chevron-right] size-3.5 sm:size-4 shrink-0 transition-colors ${
                        isExpanded
                          ? "text-zinc-900"
                          : "text-zinc-400 group-hover:text-zinc-900"
                      }`}
                      aria-hidden="true"
                    />
                  </div>
                </div>

                {/* Collapsible Certificate List */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <m.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3.5 pt-2 border-t border-zinc-100 divide-y divide-zinc-100/80">
                        {group.certificates.map((cert) => (
                          <div
                            key={cert.id}
                            className="py-2.5 px-2 -mx-2 rounded-lg hover:bg-zinc-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                          >
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-xs sm:text-sm text-zinc-900 leading-snug">
                                {cert.title}
                              </h4>
                              {cert.credentialId && (
                                <p className="font-mono text-[11px] text-zinc-500 truncate mt-0.5">
                                  ID: {cert.credentialId}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
                              <span className="text-zinc-500 tabular-nums text-[11px] sm:text-xs">
                                {cert.issueDate}
                              </span>

                              {cert.credentialUrl && (
                                <a
                                  href={cert.credentialUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-900 hover:text-zinc-700 bg-zinc-100 hover:bg-zinc-200 px-2 py-0.5 rounded-md transition-colors shrink-0"
                                >
                                  <span>{dict.certificates.verifyLink}</span>
                                  <span className="icon-[lucide--external-link] size-2.5 inline-block text-zinc-500" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </m.div>
                  )}
                </AnimatePresence>
              </m.div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
