import React from "react";
import { Reveal } from "@/components/motion/Reveal";

interface SectionHeaderProps {
  number: string;
  title: string;
  hint?: string;
  className?: string;
  delay?: number;
}

export function SectionHeader({
  number,
  title,
  hint,
  className = "",
  delay = 0.08,
}: SectionHeaderProps) {
  return (
    <Reveal delay={delay} yOffset={10}>
      <div
        className={`border-b border-zinc-200/80 pb-3 sm:pb-3.5 mb-4 sm:mb-6 ${className}`}
      >
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <div className="flex items-baseline gap-2 sm:gap-3">
            <span className="text-xs sm:text-sm font-mono font-semibold text-zinc-400 select-none">
              {number}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-ink">
              {title}
            </h2>
          </div>

          {hint && (
            <span className="text-xs sm:text-sm text-zinc-400 font-normal">
              {hint}
            </span>
          )}
        </div>
      </div>
    </Reveal>
  );
}
