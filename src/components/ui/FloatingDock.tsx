"use client";

import React, { useRef, useState, useEffect } from "react";
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
}

interface DockItemData {
  title: string;
  icon: string;
  href: string;
  external?: boolean;
  color?: string;
  sectionId?: string;
}

function DesktopDockIcon({
  mouseX,
  item,
  isActive,
}: {
  mouseX: ReturnType<typeof useMotionValue<number>>;
  item: DockItemData;
  isActive?: boolean;
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
      className={`relative flex items-center justify-center rounded-full border shadow-xs transition-colors ${
        isActive
          ? "bg-zinc-900 border-zinc-900 text-white shadow-sm"
          : "bg-white border-zinc-200/90 hover:border-zinc-400 text-zinc-800"
      }`}
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
          style={!isActive && item.color ? { color: item.color } : undefined}
        />
      </motion.div>
    </motion.div>
  );

  return (
    <a
      href={item.href}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noopener noreferrer" : undefined}
      aria-label={item.title}
      className="focus-visible:outline-2 focus-visible:outline-zinc-900 focus-visible:outline-offset-2 rounded-full"
    >
      {content}
    </a>
  );
}

function MobileDockItem({
  item,
  isActive,
  onClick,
}: {
  item: DockItemData;
  isActive?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.a
      href={item.href}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noopener noreferrer" : undefined}
      onClick={onClick}
      whileTap={{ scale: 0.88 }}
      transition={{ type: "spring", stiffness: 450, damping: 20 }}
      aria-label={item.title}
      className={`relative size-9 flex items-center justify-center rounded-full border transition-colors shadow-2xs focus-visible:outline-2 focus-visible:outline-zinc-900 ${
        isActive
          ? "bg-zinc-900 border-zinc-900 text-white shadow-xs"
          : "bg-white border-zinc-200/90 text-zinc-700 active:bg-zinc-100"
      }`}
    >
      <span
        className={`${item.icon} size-4 inline-block shrink-0`}
        style={!isActive && item.color ? { color: item.color } : undefined}
      />
    </motion.a>
  );
}

export function FloatingDock({
  locale: fallbackLocale,
  email,
  githubUrl,
  linkedinUrl,
}: FloatingDockProps) {
  const { locale, setLocale, dict } = useLocale();
  const activeLocale = locale || fallbackLocale || "id";
  const mouseX = useMotionValue(Infinity);
  const [socialsOpen, setSocialsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("hero");

  // Track active section on scroll
  useEffect(() => {
    const sectionIds = ["hero", "experience", "education", "skills", "contact"];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 220;
      for (const id of [...sectionIds].reverse()) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(id);
          return;
        }
      }
      setActiveSection("hero");
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems: DockItemData[] = [
    { title: dict.dock.home, icon: "icon-[lucide--home]", href: `#hero`, sectionId: "hero" },
    { title: dict.dock.experience, icon: "icon-[lucide--briefcase]", href: `#experience`, sectionId: "experience" },
    { title: dict.dock.education, icon: "icon-[lucide--graduation-cap]", href: `#education`, sectionId: "education" },
    { title: dict.dock.skills, icon: "icon-[lucide--code-2]", href: `#skills`, sectionId: "skills" },
    { title: dict.dock.contact, icon: "icon-[lucide--message-square]", href: `#contact`, sectionId: "contact" },
  ];

  const socialItems: DockItemData[] = [
    { title: dict.dock.github, icon: "icon-[simple-icons--github]", href: githubUrl, external: true, color: "#181717" },
    { title: dict.dock.linkedin, icon: "icon-[simple-icons--linkedin]", href: linkedinUrl, external: true, color: "#0A66C2" },
    { title: dict.dock.email, icon: "icon-[lucide--mail]", href: `mailto:${email}`, external: true, color: "#2563EB" },
  ];

  const targetLang = activeLocale === "en" ? "id" : "en";
  const targetHref = `/${targetLang}/`;

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
          {/* Navigation Sections */}
          {navItems.map((item) => (
            <DesktopDockIcon
              key={item.title}
              mouseX={mouseX}
              item={item}
              isActive={activeSection === item.sectionId}
            />
          ))}

          {/* Separator */}
          <div className="h-6 w-px bg-zinc-200 mx-1" aria-hidden="true" />

          {/* Social Links with Brand Colors */}
          {socialItems.map((item) => (
            <DesktopDockIcon key={item.title} mouseX={mouseX} item={item} />
          ))}

          {/* Separator */}
          <div className="h-6 w-px bg-zinc-200 mx-1" aria-hidden="true" />

          {/* Bilingual Language Switcher (Zero-Reload In-Place Toggle) */}
          <a
            href={targetHref}
            onClick={(e) => {
              e.preventDefault();
              setLocale(targetLang);
            }}
            aria-label={dict.dock.switchLang}
            className="relative flex size-10 items-center justify-center rounded-full bg-white border border-zinc-200/90 hover:border-zinc-400 text-zinc-900 shadow-xs transition-transform hover:scale-110 active:scale-95 focus-visible:outline-2 focus-visible:outline-zinc-900 focus-visible:outline-offset-2 cursor-pointer"
          >
            <span className="font-mono text-xs font-bold uppercase tracking-tight text-zinc-900">
              {targetLang}
            </span>
          </a>
        </motion.div>

        {/* Mobile Dock (< sm / 640px) */}
        <div className="flex sm:hidden items-center gap-1 p-1.5 rounded-full border border-zinc-200/90 bg-white/95 backdrop-blur-md shadow-xl">
          {/* Navigation Sections */}
          {navItems.map((item) => (
            <MobileDockItem
              key={item.title}
              item={item}
              isActive={activeSection === item.sectionId}
            />
          ))}

          {/* Separator */}
          <div className="h-5 w-px bg-zinc-200/80 mx-0.5" aria-hidden="true" />

          {/* Socials Popover Trigger on Mobile */}
          <div className="relative">
            <motion.button
              type="button"
              onClick={() => setSocialsOpen((prev) => !prev)}
              whileTap={{ scale: 0.88 }}
              aria-label="Social Links"
              aria-expanded={socialsOpen}
              className={`size-9 flex items-center justify-center rounded-full border transition-colors shadow-2xs ${
                socialsOpen
                  ? "bg-zinc-900 border-zinc-900 text-white shadow-xs"
                  : "bg-white border-zinc-200/90 text-zinc-700 active:bg-zinc-100"
              }`}
            >
              <span className="icon-[lucide--share-2] size-4 inline-block shrink-0" />
            </motion.button>

            <AnimatePresence>
              {socialsOpen && (
                <>
                  {/* Backdrop for outside click */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setSocialsOpen(false)}
                    aria-hidden="true"
                  />

                  {/* Floating popover */}
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-zinc-200/90 shadow-xl"
                  >
                    {socialItems.map((s) => (
                      <a
                        key={s.title}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setSocialsOpen(false)}
                        aria-label={s.title}
                        className="size-9.5 flex items-center justify-center rounded-xl bg-white border border-zinc-200/80 hover:border-zinc-400 active:scale-90 transition-all shadow-2xs"
                      >
                        <span
                          className={`${s.icon} size-4.5 inline-block shrink-0`}
                          style={s.color ? { color: s.color } : undefined}
                        />
                      </a>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Separator */}
          <div className="h-5 w-px bg-zinc-200/80 mx-0.5" aria-hidden="true" />

          {/* Bilingual Language Switcher (Zero-Reload In-Place Toggle) */}
          <motion.a
            href={targetHref}
            onClick={(e) => {
              e.preventDefault();
              setLocale(targetLang);
            }}
            whileTap={{ scale: 0.88 }}
            aria-label={dict.dock.switchLang}
            className="size-9 flex items-center justify-center rounded-full bg-white border border-zinc-200/90 text-zinc-900 shadow-2xs font-mono text-xs font-bold uppercase cursor-pointer active:bg-zinc-100"
          >
            {targetLang}
          </motion.a>
        </div>
      </div>
    </nav>
  );
}
