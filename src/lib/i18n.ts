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
    kicker: string;
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
    loadMore: string;
    showLess: string;
    website: string;
    source: string;
    viewCode: string;
    liveDemo: string;
    ndaBadge: string;
    ndaExplanation: string;
    stackLabel: string;
    viewDetails: string;
    closeModal: string;
    confidentialStamp: string;
    confidentialNotice: string;
    redactedLabel: string;
    overview: string;
    techStackTitle: string;
    proprietaryNotice: string;
    timeline: string;
    status: string;
    statusCompleted: string;
    projectSpecsTitle: string;
    techUsed: string;
    similarProjectTitle: string;
    similarProjectSubtitle: string;
    consultNow: string;
    clientSummaryTitle: string;
    galleryTitle: string;
    caseStudyTitle: string;
    ndaRestrictedGallery: string;
    tabOverview: string;
    tabDetails: string;
    backButton: string;
    quickStats: string;
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
    cv: string;
    translate: string;
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
      kicker: "SOFTWARE ENGINEER · AI INTEGRATION",
      title: "Timur Dian Radha Sejati",
      description:
        "Software Engineer Fullstack yang berfokus pada sistem performa tinggi, arsitektur headless, dan aplikasi skala enterprise",
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
      featuredSubtitle: "Karya pilihan",
      otherTitle: "Eksplorasi & Proyek Lainnya",
      otherSubtitle:
        "Kumpulan proyek open-source, alat pengembang, dan microservices mandiri.",
      filterAll: "Semua Proyek",
      filterFeatured: "Unggulan",
      filterNda: "Terikat NDA",
      loadMore: "Muat Lebih Banyak",
      showLess: "Tampilkan Lebih Sedikit",
      website: "Website",
      source: "Source",
      viewCode: "Sumber Kode",
      liveDemo: "Lihat Demo",
      ndaBadge: "Terikat NDA",
      ndaExplanation:
        "Detail teknis dan repositori dibatasi untuk mematuhi perjanjian kerahasiaan klien.",
      stackLabel: "Teknologi",
      viewDetails: "Lihat Detail",
      closeModal: "Tutup Detail",
      confidentialStamp: "DOKUMEN RAHASIA // TERIKAT NDA",
      confidentialNotice:
        "Informasi arsitektur internal, repositori kode, dan data proprietary disensor untuk mematuhi regulasi kerahasiaan perusahaan (Non-Disclosure Agreement).",
      redactedLabel: "Disensor di Bawah NDA",
      overview: "Ringkasan Proyek",
      techStackTitle: "Teknologi yang Digunakan",
      proprietaryNotice: "Repositori & Kode Sumber Terkunci (Proprietary)",
      timeline: "Timeline",
      status: "Status",
      statusCompleted: "Selesai",
      projectSpecsTitle: "Spesifikasi Proyek",
      techUsed: "Teknologi yang Digunakan",
      similarProjectTitle: "Ingin Proyek Serupa?",
      similarProjectSubtitle:
        "Tim ahli kami siap membantu Anda merealisasikan inovasi sistem software terbaik.",
      consultNow: "Konsultasi Sekarang",
      clientSummaryTitle: "Ringkasan Eksekutif Klien",
      galleryTitle: "Galeri & Tangkapan Layar",
      caseStudyTitle: "Studi Kasus & Detail Teknis",
      ndaRestrictedGallery:
        "Arsip tangkapan layar antarmuka dan skema sistem internal dilindungi oleh NDA dan tidak dipublikasikan.",
      tabOverview: "Ringkasan Proyek",
      tabDetails: "Detail & Studi Kasus",
      backButton: "Kembali",
      quickStats: "Informasi Proyek",
    },
    experience: {
      title: "Pengalaman Kerja",
      subtitle: "Riwayat karir",
      present: "Saat Ini",
    },
    skills: {
      title: "Keahlian",
      subtitle: "Alat & teknologi",
    },
    certificates: {
      badge: "Sertifikasi",
      title: "Sertifikasi & Kredensial",
      subtitle: "Kredensial terverifikasi",
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
      cv: "Curriculum Vitae (CV)",
      translate: "Ganti Bahasa (Switch to EN)",
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
      kicker: "SOFTWARE ENGINEER · AI INTEGRATION",
      title: "Timur Dian Radha Sejati",
      description:
        "Fullstack Software Engineer focused on high-performance systems, headless architectures, and enterprise-scale applications",
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
      featuredSubtitle: "Selected works",
      otherTitle: "Selected Other Work",
      otherSubtitle:
        "A collection of open-source utilities, developer tooling, and standalone microservices.",
      filterAll: "All Projects",
      filterFeatured: "Featured",
      filterNda: "NDA Protected",
      loadMore: "Load More",
      showLess: "Show Less",
      website: "Website",
      source: "Source",
      viewCode: "Source Code",
      liveDemo: "Live Preview",
      ndaBadge: "NDA Protected",
      ndaExplanation:
        "Technical details and code repositories are restricted to comply with client confidentiality agreements.",
      stackLabel: "Technologies",
      viewDetails: "View Details",
      closeModal: "Close Details",
      confidentialStamp: "CONFIDENTIAL // NDA PROTECTED",
      confidentialNotice:
        "Internal system architecture, source repositories, and proprietary metrics are redacted to comply with corporate Non-Disclosure Agreements.",
      redactedLabel: "Redacted under NDA",
      overview: "Project Overview",
      techStackTitle: "Technologies Used",
      proprietaryNotice: "Proprietary Source Code Locked",
      timeline: "Timeline",
      status: "Status",
      statusCompleted: "Completed",
      projectSpecsTitle: "Project Specifications",
      techUsed: "Technologies Used",
      similarProjectTitle: "Interested in a Similar Project?",
      similarProjectSubtitle:
        "Our engineering team is ready to help you realize the best software and web architecture.",
      consultNow: "Consult Now",
      clientSummaryTitle: "Executive Client Summary",
      galleryTitle: "Screenshots & Gallery",
      caseStudyTitle: "Technical Case Study & Architecture",
      ndaRestrictedGallery:
        "UI screenshots and internal system architecture are restricted by NDA and not publicly disclosed.",
      tabOverview: "Project Overview",
      tabDetails: "Details & Case Study",
      backButton: "Back",
      quickStats: "Project Information",
    },
    experience: {
      title: "Work Experience",
      subtitle: "Career journey",
      present: "Present",
    },
    skills: {
      title: "Skills",
      subtitle: "Tech stack & tools",
    },
    certificates: {
      badge: "Certifications",
      title: "I like building & learning",
      subtitle: "Verified credentials",
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
      cv: "Curriculum Vitae (CV)",
      translate: "Switch Language (Ganti ke ID)",
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
function extractStringValue(val: unknown): string {
  if (typeof val === "string") return val;
  if (val && typeof val === "object") {
    const obj = val as Record<string, unknown>;
    return (
      (obj.name as string) ||
      (obj.label as string) ||
      (obj.title as string) ||
      (obj.value as string) ||
      ""
    );
  }
  return "";
}

export function getLocalized<T extends object>(
  item: T,
  field: string,
  locale: Locale
): string {
  if (!item || typeof item !== "object") return "";
  const idKey = `${field}Id`;
  const enKey = `${field}En`;

  const itemRecord = item as Record<string, unknown>;

  if (locale === "id") {
    const val = itemRecord[idKey] ?? itemRecord[enKey] ?? itemRecord[field];
    return extractStringValue(val);
  } else {
    const val = itemRecord[enKey] ?? itemRecord[idKey] ?? itemRecord[field];
    return extractStringValue(val);
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
