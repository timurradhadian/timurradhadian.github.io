import React from "react";
import { Certificate, Locale } from "@/types/portfolio";
import { getDictionary } from "@/lib/i18n";
import { Reveal } from "@/components/motion/Reveal";

interface CertificatesProps {
  locale: Locale;
  certificates: Certificate[];
}

function getIssuerInfo(issuer: string, title: string): { icon: string; bgClass: string } {
  const normalized = `${issuer} ${title}`.toLowerCase();
  if (normalized.includes("aws") || normalized.includes("amazon")) {
    return { icon: "icon-[logos--aws]", bgClass: "bg-white border-zinc-200" };
  }
  if (normalized.includes("meta")) {
    return { icon: "icon-[logos--meta-icon]", bgClass: "bg-white border-zinc-200" };
  }
  if (normalized.includes("google")) {
    return { icon: "icon-[logos--google-icon]", bgClass: "bg-white border-zinc-200" };
  }
  if (normalized.includes("linux") || normalized.includes("kubernetes") || normalized.includes("cncf")) {
    return { icon: "icon-[logos--linux-tux]", bgClass: "bg-white border-zinc-200" };
  }
  if (normalized.includes("udemy")) {
    return { icon: "icon-[logos--udemy-icon]", bgClass: "bg-white border-zinc-200" };
  }
  return { icon: "icon-[lucide--award]", bgClass: "bg-zinc-50 border-zinc-200 text-zinc-700" };
}

export function Certificates({ locale, certificates }: CertificatesProps) {
  const dict = getDictionary(locale);

  return (
    <section id="certifications" className="space-y-6 pt-6">
      {/* Centered Section Header */}
      <div className="flex flex-col items-center text-center space-y-2">
        <Reveal delay={0.05} yOffset={10}>
          <span className="inline-block rounded-md bg-zinc-100 text-zinc-900 border border-zinc-200 px-3 py-1 text-xs font-semibold shadow-2xs">
            {dict.certificates.badge}
          </span>
        </Reveal>

        <Reveal delay={0.1} yOffset={12}>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
            {dict.certificates.title}
          </h2>
        </Reveal>

        <Reveal delay={0.15} yOffset={12}>
          <p className="text-sm sm:text-base text-ink-muted max-w-xl mx-auto leading-relaxed">
            {dict.certificates.subtitle}
          </p>
        </Reveal>
      </div>

      {/* Timeline List */}
      <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-zinc-200">
        {certificates.map((cert, idx) => {
          const issuerInfo = getIssuerInfo(cert.issuer, cert.title);

          return (
            <Reveal key={cert.id} delay={0.1 + idx * 0.04} yOffset={10}>
              <div className="relative group">
                {/* Timeline Node Bullet */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-2 size-6 sm:size-7 rounded-full border flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs ${issuerInfo.bgClass}`}
                >
                  <span
                    className={`${issuerInfo.icon} size-3.5 inline-block shrink-0`}
                  />
                </div>

                <div className="rounded-xl border border-zinc-200/90 bg-white hover:border-zinc-300 p-4 transition-all space-y-2 shadow-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base text-zinc-900">
                        {cert.title}
                      </h3>
                      <p className="text-xs text-zinc-600">{cert.issuer}</p>
                    </div>

                    <div className="text-xs text-zinc-500 tabular-nums shrink-0 text-right">
                      {cert.issueDate}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100 text-xs">
                    {cert.credentialId ? (
                      <span className="font-mono text-[11px] text-zinc-500">
                        ID: {cert.credentialId}
                      </span>
                    ) : (
                      <span />
                    )}

                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-900 hover:text-blue-600 transition-colors"
                      >
                        <span>{dict.certificates.verifyLink}</span>
                        <span className="icon-[lucide--external-link] size-3 inline-block" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
