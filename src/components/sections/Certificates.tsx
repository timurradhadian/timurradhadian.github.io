import React from "react";
import { Certificate, Locale } from "@/types/portfolio";
import { getDictionary } from "@/lib/i18n";
import { Reveal } from "@/components/motion/Reveal";

interface CertificatesProps {
  locale: Locale;
  certificates: Certificate[];
}

function getIssuerIcon(issuer: string, title: string): string {
  const normalized = `${issuer} ${title}`.toLowerCase();
  if (normalized.includes("aws") || normalized.includes("amazon")) return "icon-[simple-icons--amazonwebservices]";
  if (normalized.includes("meta")) return "icon-[simple-icons--meta]";
  if (normalized.includes("google")) return "icon-[simple-icons--google]";
  if (normalized.includes("linux") || normalized.includes("kubernetes") || normalized.includes("cncf")) return "icon-[simple-icons--linuxfoundation]";
  if (normalized.includes("alibaba")) return "icon-[simple-icons--alibabacloud]";
  return "icon-[lucide--award]";
}

export function Certificates({ locale, certificates }: CertificatesProps) {
  const dict = getDictionary(locale);

  return (
    <section id="certifications" className="space-y-6 pt-6">
      {/* Centered Section Header */}
      <div className="flex flex-col items-center text-center space-y-2">
        <Reveal delay={0.05} yOffset={10}>
          <span className="inline-block rounded-md bg-zinc-900 text-white px-3 py-1 text-xs font-semibold shadow-xs">
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
      <div className="relative pl-6 sm:pl-8 space-y-5 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-zinc-200">
        {certificates.map((cert, idx) => {
          const iconClass = getIssuerIcon(cert.issuer, cert.title);

          return (
            <Reveal key={cert.id} delay={0.1 + idx * 0.04} yOffset={10}>
              <div className="relative group">
                {/* Timeline Node Bullet */}
                <div className="absolute -left-6 sm:-left-8 top-2 size-6 sm:size-7 rounded-full border border-border bg-white flex items-center justify-center text-zinc-900 group-hover:scale-110 transition-transform shadow-xs">
                  <span className={`${iconClass} size-3.5 inline-block shrink-0`} />
                </div>

                <div className="rounded-xl border border-border bg-white hover:border-zinc-400 p-4 transition-all space-y-2 shadow-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base text-ink">
                        {cert.title}
                      </h3>
                      <p className="text-xs text-ink-muted">{cert.issuer}</p>
                    </div>

                    <div className="text-xs text-ink-muted tabular-nums shrink-0 text-right">
                      {cert.issueDate}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50 text-xs">
                    {cert.credentialId ? (
                      <span className="font-mono text-[11px] text-ink-muted">
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
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-900 hover:underline"
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
