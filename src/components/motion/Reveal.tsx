"use client";

import React from "react";
import { m } from "motion/react";
import { useIsMounted } from "@/lib/useIsMounted";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  yOffset?: number;
  scale?: number;
  duration?: number;
}

export function Reveal({
  children,
  className,
  delay = 0,
  yOffset = 16,
  scale = 1,
  duration = 0.45,
}: RevealProps) {
  const mounted = useIsMounted();

  if (!mounted) {
    return <div className={className}>{children}</div>;
  }

  return (
    <m.div
      initial={{ opacity: 0, y: yOffset, scale }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{
        duration,
        ease: [0.21, 0.47, 0.32, 0.98],
        delay,
      }}
      className={className}
    >
      {children}
    </m.div>
  );
}
