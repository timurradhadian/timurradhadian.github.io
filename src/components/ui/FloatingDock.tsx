"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "motion/react";
import { Locale } from "@/types/portfolio";
import { getDictionary } from "@/lib/i18n";

interface FloatingDockProps {
  locale: Locale;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
}

interface DockItemData {
  title: string;
  icon: string;
  href: string;
  external?: boolean;
  color?: string;
}

function DockIcon({
  mouseX,
  item,
}: {
  mouseX: ReturnType<typeof useMotionValue<number>>;
  item: DockItemData;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-120, 0, 120], [38, 52, 38]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 180, damping: 14 });

  const iconScaleSync = useTransform(distance, [-120, 0, 120], [1, 1.35, 1]);
  const iconScale = useSpring(iconScaleSync, { mass: 0.1, stiffness: 180, damping: 14 });

  const content = (
    <motion.div
      ref={ref}
      style={{ width, height: width }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex items-center justify-center rounded-full bg-white border border-zinc-200/90 hover:border-zinc-400 text-zinc-800 shadow-xs transition-colors"
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-9 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-zinc-900 text-white border border-zinc-800 shadow-md whitespace-nowrap pointer-events-none z-50"
          >
            {item.title}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        style={{ scale: iconScale }}
        className="flex items-center justify-center"
      >
        <span
          className={`${item.icon} size-4 sm:size-4.5 inline-block shrink-0`}
          style={item.color ? { color: item.color } : undefined}
        />
      </motion.div>
    </motion.div>
  );

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={item.title}
        className="focus-visible:outline-2 focus-visible:outline-zinc-900 focus-visible:outline-offset-2 rounded-full"
      >
        {content}
      </a>
    );
  }

  return (
    <a
      href={item.href}
      aria-label={item.title}
      className="focus-visible:outline-2 focus-visible:outline-zinc-900 focus-visible:outline-offset-2 rounded-full"
    >
      {content}
    </a>
  );
}

export function FloatingDock({
  locale,
  email,
  githubUrl,
  linkedinUrl,
}: FloatingDockProps) {
  const dict = getDictionary(locale);
  const mouseX = useMotionValue(Infinity);

  const navItems: DockItemData[] = [
    { title: dict.dock.home, icon: "icon-[lucide--home]", href: `#hero` },
    { title: dict.dock.experience, icon: "icon-[lucide--briefcase]", href: `#experience` },
    { title: dict.dock.education, icon: "icon-[lucide--graduation-cap]", href: `#education` },
    { title: dict.dock.skills, icon: "icon-[lucide--code-2]", href: `#skills` },
    { title: dict.dock.projects, icon: "icon-[lucide--folder-git-2]", href: `#projects` },
    { title: dict.dock.certificates, icon: "icon-[lucide--award]", href: `#certifications` },
    { title: dict.dock.contact, icon: "icon-[lucide--mail]", href: `#contact` },
  ];

  const socialItems: DockItemData[] = [
    { title: dict.dock.github, icon: "icon-[simple-icons--github]", href: githubUrl, external: true, color: "#181717" },
    { title: dict.dock.linkedin, icon: "icon-[simple-icons--linkedin]", href: linkedinUrl, external: true, color: "#0A66C2" },
    { title: dict.dock.email, icon: "icon-[lucide--mail]", href: `mailto:${email}`, external: true, color: "#2563EB" },
  ];

  const targetLang = locale === "en" ? "id" : "en";
  const targetHref = `/${targetLang}/`;

  return (
    <nav
      aria-label="Floating Dock Navigation"
      className="fixed bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-full px-2"
    >
      <motion.div
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="flex items-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 rounded-full border border-zinc-200/90 bg-white/90 backdrop-blur-md shadow-lg"
      >
        {/* Navigation Sections */}
        {navItems.map((item) => (
          <DockIcon key={item.title} mouseX={mouseX} item={item} />
        ))}

        {/* Separator */}
        <div className="h-6 w-px bg-zinc-200 mx-0.5 sm:mx-1" aria-hidden="true" />

        {/* Social Links with Brand Colors */}
        {socialItems.map((item) => (
          <DockIcon key={item.title} mouseX={mouseX} item={item} />
        ))}

        {/* Separator */}
        <div className="h-6 w-px bg-zinc-200 mx-0.5 sm:mx-1" aria-hidden="true" />

        {/* Language Switcher */}
        <Link
          href={targetHref}
          aria-label={dict.dock.switchLang}
          className="relative flex size-9.5 sm:size-10 items-center justify-center rounded-full bg-white border border-zinc-200/90 hover:border-zinc-400 text-zinc-900 shadow-xs transition-transform hover:scale-110 active:scale-95 focus-visible:outline-2 focus-visible:outline-zinc-900 focus-visible:outline-offset-2"
        >
          <span className="font-mono text-xs font-bold uppercase tracking-tight text-zinc-900">
            {targetLang}
          </span>
        </Link>
      </motion.div>
    </nav>
  );
}
