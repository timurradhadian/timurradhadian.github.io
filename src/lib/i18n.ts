import { Locale } from "@/types/portfolio";

export const LOCALES: Locale[] = ["id", "en"];
export const DEFAULT_LOCALE: Locale = "id";

export interface Dictionary {
  nav: {
    about: string;
    projects: string;
    experience: string;
    education: string;
    skills: string;
    certificates: string;
    contact: string;
  };
  hero: {
    title: string;
    description: string;
    aboutTitle: string;
    aboutBio: string;
    availableBadge: string;
  };
  education: {
    title: string;
  };
  projects: {
    badge: string;
    featuredTitle: string;
    featuredSubtitle: string;
    otherTitle: string;
    otherSubtitle: string;
    filterAll: string;
    filterFeatured: string;
    filterNda: string;
    website: string;
    source: string;
    viewCode: string;
    liveDemo: string;
    ndaBadge: string;
    ndaExplanation: string;
    stackLabel: string;
  };
  experience: {
    title: string;
    subtitle: string;
    present: string;
  };
  skills: {
    title: string;
    subtitle: string;
  };
  certificates: {
    badge: string;
    title: string;
    subtitle: string;
    issuedOn: string;
    credentialId: string;
    verifyLink: string;
  };
  contact: {
    badge: string;
    title: string;
    subtitle: string;
    chatBtn: string;
  };
  dock: {
    home: string;
    about: string;
    experience: string;
    education: string;
    skills: string;
    projects: string;
    certificates: string;
    contact: string;
    github: string;
    linkedin: string;
    email: string;
    toggleTheme: string;
    switchLang: string;
  };
  footer: {
    builtWith: string;
    allRightsReserved: string;
    backToTop: string;
  };
  common: {
    switchLanguage: string;
    skipToContent: string;
  };
}

export const dictionaries: Record<Locale, Dictionary> = {
  id: {
    nav: {
      about: "Tentang",
      projects: "Proyek",
      experience: "Pengalaman",
      education: "Pendidikan",
      skills: "Keahlian",
      certificates: "Sertifikat",
      contact: "Kontak",
    },
    hero: {
      title: "Halo, saya Timur Dian 👋",
      description:
        "Software Engineer Fullstack & Arsitek Web. Berfokus pada sistem web performa tinggi, arsitektur headless, dan aplikasi skala enterprise yang terukur.",
      aboutTitle: "Tentang",
      aboutBio:
        "Software Engineer Fullstack dan Arsitek Web dengan pengalaman merancang sistem web performa tinggi, arsitektur headless modern, serta aplikasi terdistribusi. Saat ini memimpin rekayasa platform digital di SejatiDimedia, mengembangkan produk web skala produksi dengan Next.js, Go, TypeScript, Node.js, dan arsitektur cloud teruji.",
      availableBadge: "Tersedia untuk proyek & peluang baru",
    },
    education: {
      title: "Pendidikan",
    },
    projects: {
      badge: "Proyek",
      featuredTitle: "Karya & Proyek Terpilih",
      featuredSubtitle:
        "Koleksi proyek mulai dari web aplikasi modern, sistem enterprise, hingga arsitektur headless berkinerja tinggi.",
      otherTitle: "Eksplorasi & Proyek Lainnya",
      otherSubtitle:
        "Kumpulan proyek open-source, alat pengembang, dan microservices mandiri.",
      filterAll: "Semua Proyek",
      filterFeatured: "Unggulan",
      filterNda: "Terikat NDA",
      website: "Website",
      source: "Source",
      viewCode: "Sumber Kode",
      liveDemo: "Lihat Demo",
      ndaBadge: "Terikat NDA",
      ndaExplanation:
        "Detail teknis dan repositori dibatasi untuk mematuhi perjanjian kerahasiaan klien.",
      stackLabel: "Teknologi",
    },
    experience: {
      title: "Pengalaman Kerja",
      subtitle:
        "Perjalanan profesional merancang, membangun, dan mengoptimalkan sistem digital berskala tinggi.",
      present: "Saat Ini",
    },
    skills: {
      title: "Keahlian",
      subtitle:
        "Kombinasi teknologi frontend, backend berkinerja tinggi, dan otomatisasi infrastruktur cloud.",
    },
    certificates: {
      badge: "Sertifikasi",
      title: "Sertifikasi & Kredensial",
      subtitle:
        "Pembelajaran berkelanjutan, kredensial terverifikasi, dan sertifikasi spesialisasi arsitektur cloud.",
      issuedOn: "Diterbitkan",
      credentialId: "ID Kredensial",
      verifyLink: "Verifikasi",
    },
    contact: {
      badge: "Kontak",
      title: "Mari Terhubung",
      subtitle:
        "Tertarik berkolaborasi, mendiskusikan arsitektur web modern, atau peluang proyek baru? Jangan ragu mengirim email langsung.",
      chatBtn: "Kirim Email",
    },
    dock: {
      home: "Beranda",
      about: "Tentang",
      experience: "Pengalaman Kerja",
      education: "Pendidikan",
      skills: "Keahlian",
      projects: "Proyek",
      certificates: "Sertifikat",
      contact: "Kontak",
      github: "GitHub",
      linkedin: "LinkedIn",
      email: "Email",
      toggleTheme: "Ganti Tema",
      switchLang: "Ganti Bahasa (Switch to EN)",
    },
    footer: {
      builtWith: "Dibangun dengan Next.js statis, Tailwind CSS, & Framer Motion.",
      allRightsReserved: "Hak cipta dilindungi undang-undang.",
      backToTop: "Kembali ke Atas",
    },
    common: {
      switchLanguage: "Ganti ke Bahasa Inggris (Switch to English)",
      skipToContent: "Langsung ke konten utama",
    },
  },
  en: {
    nav: {
      about: "About",
      projects: "Projects",
      experience: "Experience",
      education: "Education",
      skills: "Skills",
      certificates: "Certificates",
      contact: "Contact",
    },
    hero: {
      title: "Hi, I'm Timur Dian 👋",
      description:
        "Fullstack Software Engineer & Web Architect. Focused on high-performance web systems, headless architectures, and scalable enterprise applications.",
      aboutTitle: "About",
      aboutBio:
        "Fullstack Software Engineer and Web Architect with a passion for high-performance web systems, headless architectures, and clean code. Currently leading digital platforms and software architecture at SejatiDimedia, building production web systems across Next.js, Go, TypeScript, Node.js, and modern cloud infrastructure.",
      availableBadge: "Available for new projects & opportunities",
    },
    education: {
      title: "Education",
    },
    projects: {
      badge: "Projects",
      featuredTitle: "Check out my latest work",
      featuredSubtitle:
        "I've worked on a variety of projects, from simple websites to complex web applications. Here are a few of my favorites.",
      otherTitle: "Selected Other Work",
      otherSubtitle:
        "A collection of open-source utilities, developer tooling, and standalone microservices.",
      filterAll: "All Projects",
      filterFeatured: "Featured",
      filterNda: "NDA Protected",
      website: "Website",
      source: "Source",
      viewCode: "Source Code",
      liveDemo: "Live Preview",
      ndaBadge: "NDA Protected",
      ndaExplanation:
        "Technical details and code repositories are restricted to comply with client confidentiality agreements.",
      stackLabel: "Technologies",
    },
    experience: {
      title: "Work Experience",
      subtitle:
        "Professional career building, scaling, and architecting resilient digital applications.",
      present: "Present",
    },
    skills: {
      title: "Skills",
      subtitle:
        "Proficiency across modern frontend ecosystems, robust backend systems, and automated cloud workflows.",
    },
    certificates: {
      badge: "Certifications",
      title: "I like building & learning",
      subtitle:
        "Lifelong learning, verified credentials, and specialized engineering certifications.",
      issuedOn: "Issued",
      credentialId: "Credential ID",
      verifyLink: "Verify",
    },
    contact: {
      badge: "Contact",
      title: "Get in Touch",
      subtitle:
        "Want to chat? Just shoot me an email directly or connect on LinkedIn and I'll respond as soon as I can.",
      chatBtn: "Send Email",
    },
    dock: {
      home: "Home",
      about: "About",
      experience: "Work Experience",
      education: "Education",
      skills: "Skills",
      projects: "Projects",
      certificates: "Certifications",
      contact: "Contact",
      github: "GitHub",
      linkedin: "LinkedIn",
      email: "Email",
      toggleTheme: "Toggle Theme",
      switchLang: "Switch Language (Ganti ke ID)",
    },
    footer: {
      builtWith: "Crafted with static Next.js, Tailwind CSS, & Framer Motion.",
      allRightsReserved: "All rights reserved.",
      backToTop: "Back to Top",
    },
    common: {
      switchLanguage: "Beralih ke Bahasa Indonesia",
      skipToContent: "Skip to main content",
    },
  },
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] || dictionaries[DEFAULT_LOCALE];
}

/**
 * Returns localized string based on active locale with graceful fallbacks:
 * 1. Active locale field (e.g., summaryId or summaryEn)
 * 2. Alternate locale field
 * 3. Default generic field (e.g., summary)
 */
export function getLocalized<T extends object>(
  item: T,
  field: string,
  locale: Locale
): string {
  const idKey = `${field}Id`;
  const enKey = `${field}En`;

  const itemRecord = item as Record<string, unknown>;

  if (locale === "id") {
    return (
      (itemRecord[idKey] as string) ||
      (itemRecord[enKey] as string) ||
      (itemRecord[field] as string) ||
      ""
    );
  } else {
    return (
      (itemRecord[enKey] as string) ||
      (itemRecord[idKey] as string) ||
      (itemRecord[field] as string) ||
      ""
    );
  }
}

/**
 * Returns localized array of strings (e.g. highlights)
 */
export function getLocalizedArray<T extends object>(
  item: T,
  field: string,
  locale: Locale
): string[] {
  const idKey = `${field}Id`;
  const enKey = `${field}En`;

  const itemRecord = item as Record<string, unknown>;

  if (locale === "id") {
    return (
      (itemRecord[idKey] as string[]) ||
      (itemRecord[enKey] as string[]) ||
      (itemRecord[field] as string[]) ||
      []
    );
  } else {
    return (
      (itemRecord[enKey] as string[]) ||
      (itemRecord[idKey] as string[]) ||
      (itemRecord[field] as string[]) ||
      []
    );
  }
}
