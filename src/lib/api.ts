import {
  Certificate,
  Education,
  Experience,
  PortfolioData,
  Profile,
  Project,
  Skill,
} from "@/types/portfolio";
import { mockPortfolioData } from "./mock-data";

function getGlioBaseUrl(): string {
  const raw = (process.env.GLIO_API_URL || "https://glio.vercel.app/api/public")
    .trim()
    .replace(/\/+$/, "");
  return raw.endsWith("/api/public") ? raw : `${raw}/api/public`;
}

const GLIO_API_KEY = process.env.GLIO_API_KEY;
const SEJATIDIMEDIA_API_URL =
  process.env.SEJATIDIMEDIA_API_URL || "https://www.sejatidimedia.web.id";

interface FetchOptions {
  timeoutMs?: number;
}

async function fetchWithTimeout(url: string, options: RequestInit & FetchOptions = {}) {
  const { timeoutMs = 8000, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchFromGlio<T>(endpoint: string): Promise<T> {
  if (!GLIO_API_KEY) {
    throw new Error(
      `[Glio API] Missing GLIO_API_KEY. Required for build-time data synchronization.`
    );
  }

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const targetUrl = `${getGlioBaseUrl()}${cleanEndpoint}`;

  const res = await fetchWithTimeout(targetUrl, {
    headers: {
      "x-api-key": GLIO_API_KEY,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(
      `[Glio API] Request failed for ${cleanEndpoint}: ${res.status} ${res.statusText}`
    );
  }

  return (await res.json()) as T;
}

interface SejatiPortfolioResponse {
  success?: boolean;
  count?: number;
  featuredSlugs?: string[];
  featuredProjects?: Record<string, unknown>[];
  ndaCount?: number;
  ndaSlugs?: string[];
  ndaBlurEnabled?: boolean;
  ndaProjects?: Record<string, unknown>[];
}

async function fetchSejatiPortfolioData(): Promise<{
  featuredSlugs: string[];
  featuredProjects: Project[];
  ndaSlugs: string[];
  ndaProjects: Project[];
  ndaBlurEnabled: boolean;
} | null> {
  try {
    const cleanBase = SEJATIDIMEDIA_API_URL.trim().replace(/\/+$/, "");
    const targetUrl = cleanBase.endsWith("/api/public/portfolio")
      ? cleanBase
      : `${cleanBase}/api/public/portfolio`;

    const res = await fetchWithTimeout(targetUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Portfolio-Static-Builder/1.0",
      },
    });

    if (!res.ok) {
      console.warn(
        `[SejatiDimedia API] Status ${res.status} from ${targetUrl}. Falling back to default featured & NDA slugs.`
      );
      return null;
    }

    const json = (await res.json()) as SejatiPortfolioResponse;
    const featuredSlugs = Array.isArray(json.featuredSlugs)
      ? json.featuredSlugs
      : [];
    const ndaSlugs = Array.isArray(json.ndaSlugs) ? json.ndaSlugs : [];
    const ndaBlurEnabled =
      typeof json.ndaBlurEnabled === "boolean" ? json.ndaBlurEnabled : true;

    const rawFeatured = Array.isArray(json.featuredProjects)
      ? json.featuredProjects
      : [];
    const featuredProjects = rawFeatured.map((p, idx) => ({
      ...normalizeGlioProject(p, idx),
      isFeatured: true,
      isNda: false,
    }));

    const rawNda = Array.isArray(json.ndaProjects) ? json.ndaProjects : [];
    const ndaProjects = rawNda.map((p, idx) => ({
      ...normalizeGlioProject(p, idx),
      isFeatured: false,
      isNda: true,
      isProfessional: true,
    }));

    return {
      featuredSlugs,
      featuredProjects,
      ndaSlugs,
      ndaProjects,
      ndaBlurEnabled,
    };
  } catch (err) {
    console.warn(
      `[SejatiDimedia API] Connection failed (${(err as Error).message}). Falling back to default featured & NDA slugs.`
    );
    return null;
  }
}

/**
 * Parses bullet point text strings (e.g. starting with ● or - or tabs) into clean array of lines
 */
function parseBulletPoints(text?: string | null): string[] {
  if (!text) return [];
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^[●•\-\*]\s*/, "").trim())
    .filter((line) => line.length > 0);
}

/**
 * Normalizes raw Glio project payload into our standard Project type
 */
function normalizeGlioProject(
  raw: Record<string, unknown>,
  idx: number,
  detail?: Record<string, unknown> | null
): Project {
  const merged = { ...raw, ...(detail || {}) };
  const title = (merged.title as string) || (merged.name as string) || "Untitled Project";
  const slug = (merged.slug as string) || `project-${idx}`;
  const id = (merged.id as string) || slug;
  const techStack =
    Array.isArray(merged.technologies) && merged.technologies.length > 0
      ? (merged.technologies as string[])
      : Array.isArray(merged.techStack) && merged.techStack.length > 0
      ? (merged.techStack as string[])
      : [];

  const thumbnailUrl =
    (merged.thumbnail as string) ||
    (merged.thumbnailUrl as string) ||
    (merged.bannerImage as string) ||
    "";

  const bannerImage =
    (merged.bannerImage as string) || (merged.thumbnail as string) || undefined;

  const documents = Array.isArray(merged.documents)
    ? (merged.documents as Array<Record<string, unknown>>).map((doc, dIdx) => ({
        id: (doc.id as string) || `doc-${dIdx}`,
        name: (doc.name as string) || `Screenshot ${dIdx + 1}`,
        type: (doc.type as string) || "image/webp",
        url: (doc.url as string) || "",
        size: typeof doc.size === "number" ? doc.size : undefined,
        order: typeof doc.order === "number" ? doc.order : dIdx,
      }))
    : undefined;

  const links = Array.isArray(merged.links)
    ? (merged.links as Array<Record<string, unknown>>).map((lnk) => ({
        label: (lnk.label as string) || undefined,
        url: (lnk.url as string) || "",
        type: (lnk.type as string) || undefined,
      }))
    : undefined;

  return {
    id,
    slug,
    title,
    titleId: (merged.titleId as string) || (merged.nameId as string) || title,
    titleEn: (merged.titleEn as string) || (merged.nameEn as string) || title,
    category:
      Array.isArray(merged.categories) && merged.categories.length > 0
        ? typeof merged.categories[0] === "string"
          ? "Fullstack Application"
          : ((merged.categories[0] as Record<string, unknown>).name as string) || "Fullstack Application"
        : (merged.category as string) || "Fullstack Application",
    summary: (merged.summary as string) || "",
    summaryId: (merged.summaryId as string) || (merged.summary as string) || "",
    summaryEn: (merged.summaryEn as string) || (merged.summary as string) || "",
    clientSummary: (merged.clientSummary as string) || undefined,
    clientSummaryId: (merged.clientSummaryId as string) || (merged.clientSummary as string) || undefined,
    clientSummaryEn: (merged.clientSummaryEn as string) || (merged.clientSummary as string) || undefined,
    description: (merged.description as string) || undefined,
    descriptionId: (merged.descriptionId as string) || (merged.description as string) || undefined,
    descriptionEn: (merged.descriptionEn as string) || (merged.description as string) || undefined,
    thumbnailUrl,
    bannerImage,
    techStack,
    projectUrl:
      (merged.projectUrl as string) ||
      (merged.demoUrl as string) ||
      (merged.liveUrl as string) ||
      "",
    githubUrl:
      (merged.githubUrl as string) ||
      (merged.repoUrl as string) ||
      "",
    links,
    documents,
    isFeatured: false,
    isPublic: typeof merged.isPublic === "boolean" ? merged.isPublic : true,
    isNda: Boolean(merged.isNda),
    isProfessional: Boolean(merged.isProfessional),
    startDate: (merged.startDate as string) || undefined,
    endDate: (merged.endDate as string) || undefined,
    status: (merged.status as string) || undefined,
    order: typeof merged.order === "number" ? merged.order : idx,
  };
}

/**
 * Normalizes raw Glio experience payload
 */
function normalizeGlioExperience(
  raw: Record<string, unknown>,
  idx: number
): Experience {
  const highlightsId = parseBulletPoints(raw.descriptionId as string | undefined);
  const highlightsEn = parseBulletPoints(raw.descriptionEn as string | undefined);
  const generalHighlights = parseBulletPoints(raw.description as string | undefined);

  const fallbackHighlights =
    highlightsId.length > 0
      ? highlightsId
      : highlightsEn.length > 0
      ? highlightsEn
      : generalHighlights;

  const endDateStr = raw.endDate as string | undefined;

  return {
    id: (raw.id as string) || `exp-${idx}`,
    position: (raw.position as string) || "Software Engineer",
    positionId: (raw.positionId as string) || (raw.position as string) || "Software Engineer",
    positionEn: (raw.positionEn as string) || (raw.position as string) || "Software Engineer",
    company: (raw.company as string) || "Independent",
    location: (raw.location as string) || "Indonesia",
    startDate: (raw.startDate as string) || "",
    endDate: endDateStr && endDateStr.trim() !== "" ? endDateStr : null,
    isCurrent: !endDateStr || endDateStr.trim() === "",
    highlights: fallbackHighlights,
    highlightsId: highlightsId.length > 0 ? highlightsId : fallbackHighlights,
    highlightsEn: highlightsEn.length > 0 ? highlightsEn : fallbackHighlights,
    order: typeof raw.order === "number" ? raw.order : idx,
  };
}

/**
 * Normalizes raw Glio certificate payload
 */
function normalizeGlioCertificate(
  raw: Record<string, unknown>,
  idx: number
): Certificate {
  const fileName = raw.fileName as string | undefined;
  return {
    id: (raw.id as string) || `cert-${idx}`,
    title: (raw.title as string) || "Certificate",
    issuer: (raw.issuer as string) || "",
    issueDate: (raw.issueDate as string) || "",
    credentialUrl:
      (raw.credentialUrl as string) || (raw.fileUrl as string) || "",
    credentialId:
      (raw.credentialId as string) ||
      (fileName ? fileName.replace(/\.pdf$/i, "") : ""),
    order: typeof raw.order === "number" ? raw.order : idx,
  };
}

/**
 * Normalizes raw Glio skill payload
 */
/**
 * Normalizes raw Glio about/profile payload
 */
function normalizeGlioProfile(raw: Record<string, unknown>): Profile {
  const socials = (raw.socials as Record<string, string>) || {};

  const formatGithub = (gh?: string) => {
    if (!gh || gh === "#") return mockPortfolioData.profile.githubUrl;
    return gh.startsWith("http") ? gh : `https://github.com/${gh}`;
  };

  const formatLinkedin = (li?: string) => {
    if (!li || li === "#") return mockPortfolioData.profile.linkedinUrl;
    return li.startsWith("http") ? li : `https://linkedin.com/in/${li}`;
  };

  const formatInstagram = (ig?: string) => {
    if (!ig || ig === "#") return undefined;
    return ig.startsWith("http") ? ig : `https://instagram.com/${ig}`;
  };

  const formatWebsite = (w?: string) => {
    if (!w || w === "#") return undefined;
    return w;
  };

  const aboutId =
    (raw.aboutId as string) ||
    (raw.about as string) ||
    (raw.summaryId as string) ||
    (raw.descriptionId as string) ||
    mockPortfolioData.profile.bioId ||
    "";

  const aboutEn =
    (raw.aboutEn as string) ||
    (raw.summaryEn as string) ||
    (raw.descriptionEn as string) ||
    aboutId;

  const bioId = (raw.summaryId as string) || (raw.summary as string) || aboutId;
  const bioEn = (raw.summaryEn as string) || aboutEn;

  const role = (raw.title as string) || mockPortfolioData.profile.role;

  return {
    name: (raw.name as string) || mockPortfolioData.profile.name,
    role,
    roleId: role,
    roleEn: role,
    bio: bioId,
    bioId,
    bioEn,
    about: (raw.about as string) || aboutId,
    aboutId,
    aboutEn,
    description: (raw.description as string) || undefined,
    descriptionId: (raw.descriptionId as string) || undefined,
    descriptionEn: (raw.descriptionEn as string) || undefined,
    expertiseId: (raw.expertiseId as string) || undefined,
    expertiseEn: (raw.expertiseEn as string) || undefined,
    summary: (raw.summary as string) || undefined,
    summaryId: (raw.summaryId as string) || undefined,
    summaryEn: (raw.summaryEn as string) || undefined,
    email: (raw.email as string) || mockPortfolioData.profile.email,
    phone: (raw.phone as string) || undefined,
    bookingLink: (raw.bookingLink as string) || undefined,
    githubUrl: formatGithub(socials.github),
    linkedinUrl: formatLinkedin(socials.linkedin),
    websiteUrl: formatWebsite(socials.website),
    instagramUrl: formatInstagram(socials.instagram),
    twitterUrl: socials.twitter && socials.twitter !== "#" ? socials.twitter : undefined,
    youtubeUrl: socials.youtube && socials.youtube !== "#" ? socials.youtube : undefined,
    location: (raw.location as string) || mockPortfolioData.profile.location,
    workExperience: typeof raw.workExperience === "number" ? raw.workExperience : 5,
    availableForHire: true,
    avatarUrl: (raw.profileImage as string) || mockPortfolioData.profile.avatarUrl || "/avatar.png",
  };
}

function translateEducationDegree(rawDegree: string): { id: string; en: string } {
  const clean = (rawDegree || "").trim();
  const lower = clean.toLowerCase();
  if (lower.includes("s1 informatika") || lower.includes("s1 teknik informatika")) {
    return { id: clean, en: "Bachelor of Informatics" };
  }
  if (lower.includes("s1 sistem informasi")) {
    return { id: clean, en: "Bachelor of Information Systems" };
  }
  if (lower.startsWith("s1 ")) {
    return { id: clean, en: clean.replace(/^s1\s+/i, "Bachelor of ") };
  }
  if (lower.startsWith("d3 ")) {
    return { id: clean, en: clean.replace(/^d3\s+/i, "Associate Degree in ") };
  }
  return { id: clean, en: clean };
}

function translateEducationDesc(rawDesc: string): { id: string; en: string } {
  const clean = (rawDesc || "").trim();
  const lower = clean.toLowerCase();
  if (
    lower.includes("fokus pada programming") ||
    lower.includes("pengembangan sistem informasi")
  ) {
    return {
      id: clean,
      en: "Focus on programming and information systems development.",
    };
  }
  return { id: clean, en: clean };
}

function translateEducationSchool(rawSchool: string): { id: string; en: string } {
  const clean = (rawSchool || "").trim();
  const en = clean.replace(/\(IPK\s*/i, "(GPA ").replace(/IPK\s*/i, "GPA ");
  return { id: clean, en };
}

/**
 * Normalizes raw Glio education payload
 */
function normalizeGlioEducation(raw: Record<string, unknown>, idx: number): Education {
  const rawSchool = (raw.school as string) || "University";
  const rawDegree = (raw.degree as string) || "Bachelor Degree";
  const rawDesc = (raw.description as string) || "";
  const rawDescId = (raw.descriptionId as string) || "";
  const rawDescEn = (raw.descriptionEn as string) || "";
  const rawDegreeId = (raw.degreeId as string) || "";
  const rawDegreeEn = (raw.degreeEn as string) || "";
  const rawSchoolEn = (raw.schoolEn as string) || "";

  const transDegree = translateEducationDegree(rawDegree);
  const transDesc = translateEducationDesc(rawDesc);
  const transSchool = translateEducationSchool(rawSchool);

  const school = rawSchool;
  const schoolId = rawSchool;
  const schoolEn = rawSchoolEn && rawSchoolEn.trim() !== "" ? rawSchoolEn : transSchool.en;

  const degree = rawDegree;
  const degreeId = rawDegreeId && rawDegreeId.trim() !== "" ? rawDegreeId : transDegree.id;
  const degreeEn = rawDegreeEn && rawDegreeEn.trim() !== "" ? rawDegreeEn : transDegree.en;

  const descId = rawDescId && rawDescId.trim() !== "" ? rawDescId : transDesc.id;
  const descEn = rawDescEn && rawDescEn.trim() !== "" ? rawDescEn : transDesc.en;

  const startDate = (raw.startDate as string) || "";
  const endDate = (raw.endDate as string) || null;

  return {
    id: (raw.id as string) || `edu-${idx}`,
    school,
    schoolId,
    schoolEn,
    degree,
    degreeId,
    degreeEn,
    field: descId,
    fieldId: descId,
    fieldEn: descEn,
    description: descId,
    descriptionId: descId,
    descriptionEn: descEn,
    startDate,
    endDate,
    order: typeof raw.order === "number" ? raw.order : idx,
  };
}

/**
 * Normalizes raw Glio skill payload
 */
function normalizeGlioSkill(raw: Record<string, unknown>, idx: number): Skill {
  return {
    id: (raw.id as string) || `skill-${idx}`,
    name: (raw.name as string) || "",
    category: (raw.category as string) || "General",
    level: typeof raw.level === "number" ? raw.level : 85,
    order: typeof raw.order === "number" ? raw.order : idx,
  };
}

const DEFAULT_FEATURED_SLUGS = [
  "absensi-hris-app-face-recognition--gps",
  "supportsense-ai",
  "routeforce",
  "flash-sale--event-ticketing-platform",
  "telemedhub---telemedicine--smart-pharmacy",
  "katsira-point-of-sales",
];

const DEFAULT_NDA_SLUGS = [
  "wood-tracebility-system-industry-manufaktur",
  "digitalisasi-sistem-bongkar-muat-material-logistik-kayu-industry-manufaktur",
  "warehouse-management-system-industry-manufaktur",
  "digitalisasi-import-monitoring-system-industry-manufaktur",
  "digitalisasi-sistem-surat-jalan-industry-manufaktur",
  "erp-digitalisasi-produksi-industry-manufaktur",
  "report--dashboard-industry-manufaktur",
];

/**
 * Merges SejatiDimedia featured and NDA projects with comprehensive Glio project data.
 */
function mergePortfolioProjects(
  sejatiResult: {
    featuredSlugs: string[];
    featuredProjects: Project[];
    ndaSlugs: string[];
    ndaProjects: Project[];
    ndaBlurEnabled: boolean;
  } | null,
  allGlioProjects: Project[]
): {
  featuredProjects: Project[];
  ndaProjects: Project[];
  otherProjects: Project[];
  ndaBlurEnabled: boolean;
} {
  const glioMap = new Map<string, Project>();
  allGlioProjects.forEach((p) => glioMap.set(p.slug, p));

  const targetFeaturedSlugs =
    sejatiResult?.featuredSlugs && sejatiResult.featuredSlugs.length > 0
      ? sejatiResult.featuredSlugs
      : DEFAULT_FEATURED_SLUGS;

  const targetNdaSlugs =
    sejatiResult?.ndaSlugs && sejatiResult.ndaSlugs.length > 0
      ? sejatiResult.ndaSlugs
      : DEFAULT_NDA_SLUGS;

  const sejatiNdaMap = new Map<string, Project>();
  (sejatiResult?.ndaProjects || []).forEach((p) => sejatiNdaMap.set(p.slug, p));

  // 1. Process & mark NDA projects with rich redacted data
  const ndaList: Project[] = [];
  for (const slug of targetNdaSlugs) {
    const glioProject = glioMap.get(slug);
    const sejatiNda = sejatiNdaMap.get(slug);

    if (glioProject || sejatiNda) {
      const base = glioProject || sejatiNda!;
      if (base.isPublic === false) continue;

      const mergedNda: Project = {
        ...base,
        description: sejatiNda?.description || base.description,
        descriptionId: sejatiNda?.descriptionId || base.descriptionId,
        descriptionEn: sejatiNda?.descriptionEn || base.descriptionEn,
        summary: sejatiNda?.summary || base.summary,
        summaryId: sejatiNda?.summaryId || base.summaryId,
        clientSummary: sejatiNda?.clientSummary || base.clientSummary,
        clientSummaryId: sejatiNda?.clientSummaryId || base.clientSummaryId,
        clientSummaryEn: sejatiNda?.clientSummaryEn || base.clientSummaryEn,
        documents:
          base.documents && base.documents.length > 0
            ? base.documents
            : sejatiNda?.documents || [],
        links: [],
        projectUrl: "",
        githubUrl: "",
        techStack:
          base.techStack && base.techStack.length > 0
            ? base.techStack
            : sejatiNda?.techStack || [],
        thumbnailUrl: base.thumbnailUrl || sejatiNda?.thumbnailUrl || "",
        startDate: sejatiNda?.startDate || base.startDate,
        endDate: sejatiNda?.endDate || base.endDate,
        status: sejatiNda?.status || base.status,
        isFeatured: false,
        isPublic: base.isPublic ?? true,
        isNda: true,
        isProfessional: true,
      };
      ndaList.push(mergedNda);
      // Update entry in glioMap so that otherProjects and allProjects also have isNda: true
      glioMap.set(slug, mergedNda);
    }
  }

  // 2. Resolve featured projects in exact priority order from SejatiDimedia
  let featuredList: Project[] = [];
  for (const slug of targetFeaturedSlugs) {
    const glioProject = glioMap.get(slug);
    if (glioProject && glioProject.isPublic !== false) {
      featuredList.push({
        ...glioProject,
        isFeatured: true,
      });
    }
  }

  // If any slug was not in Glio, fallback to Sejati featuredProjects
  if (sejatiResult?.featuredProjects && sejatiResult.featuredProjects.length > 0) {
    const currentSlugs = new Set(featuredList.map((p) => p.slug));
    for (const sp of sejatiResult.featuredProjects) {
      if (!currentSlugs.has(sp.slug) && featuredList.length < 6 && sp.isPublic !== false) {
        featuredList.push({ ...sp, isFeatured: true });
        currentSlugs.add(sp.slug);
      }
    }
  }

  // If still empty, take first 6 from allGlioProjects
  if (featuredList.length === 0) {
    const sorted = [...allGlioProjects]
      .filter((p) => p.isPublic !== false)
      .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
    featuredList = sorted.slice(0, 6).map((p) => ({ ...p, isFeatured: true }));
  }

  const featuredSlugsSet = new Set(featuredList.map((p) => p.slug));
  const otherProjects = Array.from(glioMap.values())
    .filter((p) => !featuredSlugsSet.has(p.slug) && p.isPublic !== false)
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

  return {
    featuredProjects: featuredList,
    ndaProjects: ndaList,
    otherProjects,
    ndaBlurEnabled: sejatiResult?.ndaBlurEnabled ?? true,
  };
}

/**
 * Fetches all portfolio data for static page generation at build time.
 */
export async function getPortfolioData(): Promise<PortfolioData> {
  const isCI = Boolean(process.env.CI);
  const hasKey = Boolean(GLIO_API_KEY);

  if (!hasKey) {
    if (isCI) {
      console.warn(
        "[Notice] GLIO_API_KEY is not yet configured in GitHub Secrets. Building with high-fidelity fallback data so the site deploys on github.io immediately. Add GLIO_API_KEY in Repository Secrets to sync live CMS data."
      );
    } else {
      console.info(
        "[Info] No GLIO_API_KEY found in local environment. Using high-fidelity mock data."
      );
    }
    return mockPortfolioData;
  }

  try {
    const [
      rawAbout,
      rawEducations,
      rawExperiences,
      rawCertificates,
      rawSkills,
      rawProjects,
      sejatiPortfolio,
    ] = await Promise.all([
      fetchFromGlio<Record<string, unknown>>("/about").catch((err) => {
        console.warn("[Glio API] /about fallback to mock:", (err as Error).message);
        return null;
      }),
      fetchFromGlio<Record<string, unknown>[]>("/educations").catch((err) => {
        console.warn("[Glio API] /educations fallback to mock:", (err as Error).message);
        return null;
      }),
      fetchFromGlio<Record<string, unknown>[]>("/experiences").catch((err) => {
        console.warn("[Glio API] /experiences fallback to mock:", (err as Error).message);
        return null;
      }),
      fetchFromGlio<Record<string, unknown>[]>("/certificates").catch((err) => {
        console.warn("[Glio API] /certificates fallback to mock:", (err as Error).message);
        return null;
      }),
      fetchFromGlio<Record<string, unknown>[]>("/skills").catch((err) => {
        console.warn("[Glio API] /skills fallback to mock:", (err as Error).message);
        return null;
      }),
      fetchFromGlio<Record<string, unknown>[]>("/projects").catch((err) => {
        console.warn("[Glio API] /projects fallback to mock:", (err as Error).message);
        return null;
      }),
      fetchSejatiPortfolioData(),
    ]);

    const profile = rawAbout
      ? normalizeGlioProfile(rawAbout)
      : mockPortfolioData.profile;

    const glioEducations = (rawEducations || []).map(normalizeGlioEducation);
    const educations =
      glioEducations.length > 0
        ? [...glioEducations].sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
        : mockPortfolioData.educations;

    const glioExperiences = (rawExperiences || []).map(normalizeGlioExperience);
    const experiences =
      glioExperiences.length > 0
        ? [...glioExperiences].sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
        : mockPortfolioData.experiences;

    const glioCertificates = (rawCertificates || []).map(normalizeGlioCertificate);
    const certificates =
      glioCertificates.length > 0
        ? [...glioCertificates].sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
        : mockPortfolioData.certificates;

    const glioSkills = (rawSkills || []).map(normalizeGlioSkill);
    const skills =
      glioSkills.length > 0
        ? [...glioSkills].sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
        : mockPortfolioData.skills;

    // Fetch comprehensive project details only for public projects
    const detailMap = new Map<string, Record<string, unknown>>();
    const publicRawProjects = (rawProjects || []).filter(
      (p) => p.isPublic !== false
    );
    const projectSlugs = publicRawProjects
      .map((p) => p.slug as string)
      .filter(Boolean);

    const BATCH_SIZE = 8;
    for (let i = 0; i < projectSlugs.length; i += BATCH_SIZE) {
      const batch = projectSlugs.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map((slug) =>
          fetchFromGlio<Record<string, unknown>>(`/projects/${slug}`).catch(() => null)
        )
      );
      batchResults.forEach((detail) => {
        if (detail && detail.slug) {
          detailMap.set(detail.slug as string, detail);
        }
      });
    }

    const allProjects = publicRawProjects
      .map((raw, idx) => {
        const slug = raw.slug as string;
        const detail = detailMap.get(slug);
        return normalizeGlioProject(raw, idx, detail);
      })
      .filter((p) => p.isPublic !== false);

    const { featuredProjects, ndaProjects, otherProjects, ndaBlurEnabled } =
      mergePortfolioProjects(sejatiPortfolio, allProjects);

    return {
      profile,
      featuredProjects,
      otherProjects,
      ndaProjects,
      ndaSlugs: sejatiPortfolio?.ndaSlugs || DEFAULT_NDA_SLUGS,
      ndaBlurEnabled,
      experiences: [...experiences].sort((a, b) => (a.order ?? 99) - (b.order ?? 99)),
      educations,
      skills: [...skills].sort((a, b) => (a.order ?? 99) - (b.order ?? 99)),
      certificates: [...certificates].sort((a, b) => (a.order ?? 99) - (b.order ?? 99)),
    };
  } catch (error) {
    if (isCI) {
      console.error("[CI Build Failure] Error fetching content from Glio:", error);
      throw error;
    }

    console.warn(
      `[Warning] Failed to fetch live Glio data (${(error as Error).message}). Falling back to mock data.`
    );
    return mockPortfolioData;
  }
}
