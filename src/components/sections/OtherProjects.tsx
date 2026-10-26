import React from "react";
import { Locale, Project } from "@/types/portfolio";
import { getDictionary, getLocalized } from "@/lib/i18n";
import { Reveal } from "@/components/motion/Reveal";
import { NdaBadge } from "@/components/ui/NdaBadge";
import { getTechIcon } from "@/lib/tech-icons";

interface OtherProjectsProps {
  locale: Locale;
  projects: Project[];
}

export function OtherProjects({ locale, projects }: OtherProjectsProps) {
  const dict = getDictionary(locale);

  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <section className="py-20 border-t border-border/60">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="max-w-2xl">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-ink">
              {dict.projects.otherTitle}
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              {dict.projects.otherSubtitle}
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, idx) => {
            const localizedTitle = getLocalized(project, "title", locale);
            const localizedCategory = getLocalized(project, "category", locale);
            const localizedSummary = getLocalized(project, "summary", locale);

            return (
              <Reveal key={project.id || project.slug} delay={0.05 * (idx % 4)}>
                <div className="h-full rounded-xl border border-border/70 bg-surface/60 p-6 flex flex-col justify-between hover:border-cobalt/40 transition-colors">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-mono uppercase tracking-wider text-cobalt font-medium">
                        {localizedCategory}
                      </span>
                      {project.isNda && <NdaBadge label={dict.projects.ndaBadge} />}
                    </div>

                    <h3 className="font-serif text-lg font-bold text-ink">
                      {localizedTitle}
                    </h3>

                    <p className="mt-2 text-xs text-ink-muted leading-relaxed">
                      {localizedSummary}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {project.techStack.slice(0, 3).map((tech) => {
                        const techInfo = getTechIcon(tech);
                        return (
                          <span
                            key={tech}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-canvas-subtle text-ink-muted border border-border/40"
                          >
                            <span
                              className={`${techInfo.iconClass} size-3 inline-block shrink-0`}
                              style={techInfo.color ? { color: techInfo.color } : undefined}
                              aria-hidden="true"
                            />
                            <span>{tech}</span>
                          </span>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-3 text-ink hover:text-cobalt">
                      {!project.isNda && project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`View ${localizedTitle} source code`}
                          className="hover:text-cobalt transition-colors focus-visible:outline-2 focus-visible:outline-cobalt"
                        >
                          <span className="icon-[lucide--github] size-4 inline-block" />
                        </a>
                      )}
                      {!project.isNda && project.projectUrl && (
                        <a
                          href={project.projectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open ${localizedTitle} demo`}
                          className="hover:text-cobalt transition-colors focus-visible:outline-2 focus-visible:outline-cobalt"
                        >
                          <span className="icon-[lucide--external-link] size-4 inline-block" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
