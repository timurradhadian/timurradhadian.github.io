"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "motion/react";
import { Locale } from "@/types/portfolio";
import { useLocale } from "@/context/LocaleContext";

interface FloatingDockProps {
  locale?: Locale;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
  cvUrl?: string;
}

interface DockItemData {
  title: string;
  icon: string;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  external?: boolean;
  badge?: string;
}

function DesktopDockIcon({
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

  const widthSync = useTransform(distance, [-120, 0, 120], [40, 56, 40]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 180, damping: 14 });

  const iconScaleSync = useTransform(distance, [-120, 0, 120], [1, 1.35, 1]);
  const iconScale = useSpring(iconScaleSync, { mass: 0.1, stiffness: 180, damping: 14 });

  const inner = (
    <motion.div
      ref={ref}
      style={{ width, height: width }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative flex items-center justify-center rounded-full border border-zinc-200/90 bg-white hover:border-zinc-400 text-zinc-700 hover:text-zinc-950 shadow-2xs transition-colors cursor-pointer"
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
          className={`${item.icon} size-4.5 inline-block shrink-0 transition-colors`}
        />
      </motion.div>

      {item.badge && (
        <span className="absolute -bottom-0.5 -right-0.5 text-[8px] font-mono font-semibold leading-none bg-zinc-900 text-white px-1 py-0.5 rounded-full shadow-2xs border border-white select-none">
          {item.badge}
        </span>
      )}
    </motion.div>
  );

  if (item.onClick) {
    return (
      <button
        type="button"
        onClick={item.onClick}
        aria-label={item.title}
        className="focus-visible:outline-2 focus-visible:outline-zinc-900 focus-visible:outline-offset-2 rounded-full cursor-pointer"
      >
        {inner}
      </button>
    );
  }

  return (
    <a
      href={item.href}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noopener noreferrer" : undefined}
      aria-label={item.title}
      className="focus-visible:outline-2 focus-visible:outline-zinc-900 focus-visible:outline-offset-2 rounded-full"
    >
      {inner}
    </a>
  );
}

function MobileDockItem({ item }: { item: DockItemData }) {
  const inner = (
    <div className="relative size-10 flex items-center justify-center rounded-full border border-zinc-200/90 bg-white text-zinc-700 shadow-2xs transition-colors active:bg-zinc-100 cursor-pointer">
      <span
        className={`${item.icon} size-4.5 inline-block shrink-0`}
      />
      {item.badge && (
        <span className="absolute -bottom-0.5 -right-0.5 text-[8px] font-mono font-semibold leading-none bg-zinc-900 text-white px-1 py-0.5 rounded-full shadow-2xs border border-white select-none">
          {item.badge}
        </span>
      )}
    </div>
  );

  if (item.onClick) {
    return (
      <motion.button
        type="button"
        onClick={item.onClick}
        whileTap={{ scale: 0.88 }}
        transition={{ type: "spring", stiffness: 450, damping: 20 }}
        aria-label={item.title}
        className="focus-visible:outline-2 focus-visible:outline-zinc-900 focus-visible:outline-offset-2 rounded-full cursor-pointer"
      >
        {inner}
      </motion.button>
    );
  }

  return (
    <motion.a
      href={item.href}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noopener noreferrer" : undefined}
      whileTap={{ scale: 0.88 }}
      transition={{ type: "spring", stiffness: 450, damping: 20 }}
      aria-label={item.title}
      className="focus-visible:outline-2 focus-visible:outline-zinc-900 focus-visible:outline-offset-2 rounded-full"
    >
      {inner}
    </motion.a>
  );
}

export function FloatingDock({
  locale: fallbackLocale,
  email,
  githubUrl,
  linkedinUrl,
  cvUrl = "https://glio.vercel.app/cv-preview/69b0a3e1b6e1f3f79e6707a4",
}: FloatingDockProps) {
  const { locale, setLocale, dict } = useLocale();
  const activeLocale = locale || fallbackLocale || "id";
  const mouseX = useMotionValue(Infinity);

  const targetLang = activeLocale === "en" ? "id" : "en";

  const dockItems: DockItemData[] = [
    {
      title: dict.dock.github,
      icon: "icon-[simple-icons--github]",
      href: githubUrl,
      external: true,
    },
    {
      title: dict.dock.linkedin,
      icon: "icon-[simple-icons--linkedin]",
      href: linkedinUrl,
      external: true,
    },
    {
      title: dict.dock.email,
      icon: "icon-[lucide--mail]",
      href: `mailto:${email}`,
      external: true,
    },
    {
      title: dict.dock.cv,
      icon: "icon-[lucide--file-text]",
      href: cvUrl,
      external: true,
      badge: "CV",
    },
  ];

  const translateItem: DockItemData = {
    title: dict.dock.translate,
    icon: "icon-[lucide--languages]",
    onClick: () => setLocale(targetLang),
    badge: targetLang.toUpperCase(),
  };

  return (
    <nav
      aria-label="Floating Dock Navigation"
      className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-full px-3 pb-[env(safe-area-inset-bottom)] pointer-events-none"
    >
      <div className="pointer-events-auto">
        {/* Desktop Dock (>= sm / 640px) */}
        <motion.div
          onMouseMove={(e) => mouseX.set(e.pageX)}
          onMouseLeave={() => mouseX.set(Infinity)}
          className="hidden sm:flex items-center gap-1.5 p-2 rounded-full border border-zinc-200/90 bg-white/90 backdrop-blur-md shadow-lg"
        >
          {/* Brand Logo (Static Badge, non-clickable) */}
          <div
            className="relative size-10 rounded-full overflow-hidden border border-zinc-200/90 bg-white shadow-2xs flex items-center justify-center shrink-0 select-none pointer-events-none"
            aria-hidden="true"
          >
            <Image
              src="/icon.webp"
              alt="Logo TD"
              width={40}
              height={40}
              className="size-full object-cover"
              priority
            />
          </div>

          {/* Separator between logo and links */}
          <div className="h-6 w-px bg-zinc-200 mx-0.5" aria-hidden="true" />

          {dockItems.map((item) => (
            <DesktopDockIcon key={item.title} mouseX={mouseX} item={item} />
          ))}

          {/* Separator between links and language switcher */}
          <div className="h-6 w-px bg-zinc-200 mx-1" aria-hidden="true" />

          {/* Translate Button */}
          <DesktopDockIcon mouseX={mouseX} item={translateItem} />
        </motion.div>

        {/* Mobile Dock (< sm / 640px) */}
        <div className="flex sm:hidden items-center gap-1.5 p-1.5 rounded-full border border-zinc-200/90 bg-white/95 backdrop-blur-md shadow-xl">
          {/* Brand Logo (Static Badge, non-clickable) */}
          <div
            className="relative size-9.5 rounded-full overflow-hidden border border-zinc-200/90 bg-white shadow-2xs flex items-center justify-center shrink-0 select-none pointer-events-none"
            aria-hidden="true"
          >
            <Image
              src="/icon.webp"
              alt="Logo TD"
              width={38}
              height={38}
              className="size-full object-cover"
              priority
            />
          </div>

          {/* Separator between logo and links */}
          <div className="h-5 w-px bg-zinc-200/80 mx-0.5" aria-hidden="true" />

          {dockItems.map((item) => (
            <MobileDockItem key={item.title} item={item} />
          ))}

          {/* Separator between links and language switcher */}
          <div className="h-5 w-px bg-zinc-200/80 mx-0.5" aria-hidden="true" />

          {/* Translate Button */}
          <MobileDockItem item={translateItem} />
        </div>
      </div>
    </nav>
  );
}
