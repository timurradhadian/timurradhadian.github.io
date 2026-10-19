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

interface SejatiFeaturedPayload {
  featuredSlugs?: string[];
  featuredProjects?: Record<string, unknown>[];
}

async function fetchFeaturedFromSejatiDimedia(): Promise<{
  featuredSlugs: string[];
  featuredProjects: Project[];
} | null> {
  try {
    const cleanBase = SEJATIDIMEDIA_API_URL.trim().replace(/\/+$/, "");
    const targetUrl = cleanBase.endsWith("/api/public/featured-projects")
      ? cleanBase
      : `${cleanBase}/api/public/featured-projects`;

    const res = await fetchWithTimeout(targetUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Portfolio-Static-Builder/1.0",
      },
    });

    if (!res.ok) {
      console.warn(
        `[SejatiDimedia API] Status ${res.status} from ${targetUrl}. Falling back to default featured slugs.`
      );
      return null;
    }

    const json = (await res.json()) as SejatiFeaturedPayload;
    const featuredSlugs = Array.isArray(json.featuredSlugs)
      ? json.featuredSlugs
      : [];

    const rawProjects = Array.isArray(json.featuredProjects)
      ? json.featuredProjects
      : Array.isArray(json)
      ? (json as Record<string, unknown>[])
      : [];

    const featuredProjects = rawProjects.map((p, idx) => ({
      ...normalizeGlioProject(p, idx),
      isFeatured: true,
    }));

    return {
      featuredSlugs,
      featuredProjects,
    };
  } catch (err) {
    console.warn(
      `[SejatiDimedia API] Connection failed (${(err as Error).message}). Falling back to default featured slugs.`
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
function normalizeGlioProject(raw: Record<string, unknown>, idx: number): Project {
  const title = (raw.title as string) || (raw.name as string) || "Untitled Project";
  const slug = (raw.slug as string) || `project-${idx}`;
  const id = (raw.id as string) || slug;
  const techStack =
    Array.isArray(raw.technologies) && raw.technologies.length > 0
      ? (raw.technologies as string[])
      : Array.isArray(raw.techStack) && raw.techStack.length > 0
      ? (raw.techStack as string[])
      : [];

  const thumbnailUrl =
    (raw.thumbnail as string) ||
    (raw.thumbnailUrl as string) ||
    (raw.bannerImage as string) ||
    "";

  return {
    id,
    slug,
    title,
    titleId: (raw.titleId as string) || (raw.nameId as string) || title,
    titleEn: (raw.titleEn as string) || (raw.nameEn as string) || title,
    category:
      Array.isArray(raw.categories) && raw.categories.length > 0
        ? typeof raw.categories[0] === "string"
          ? "Fullstack Application"
          : ((raw.categories[0] as Record<string, unknown>).name as string) || "Fullstack Application"
        : (raw.category as string) || "Fullstack Application",
    summary: (raw.summary as string) || "",
    summaryId: (raw.summaryId as string) || (raw.summary as string) || "",
    summaryEn: (raw.summaryEn as string) || (raw.summary as string) || "",
    thumbnailUrl,
    techStack,
    projectUrl:
      (raw.projectUrl as string) ||
      (raw.demoUrl as string) ||
      (raw.liveUrl as string) ||
      "",
    githubUrl:
      (raw.githubUrl as string) ||
      (raw.repoUrl as string) ||
      "",
    isFeatured: false,
    isNda: Boolean(raw.isNda || raw.clientSummary),
    order: typeof raw.order === "number" ? raw.order : idx,
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

/**
 * Normalizes raw Glio education payload
 */
function normalizeGlioEducation(raw: Record<string, unknown>, idx: number): Education {
  const school = (raw.school as string) || "University";
  const degree = (raw.degree as string) || "Bachelor Degree";
  const desc = (raw.description as string) || "";
  const descId = (raw.descriptionId as string) || desc;
  const descEn = (raw.descriptionEn as string) || desc;
  const startDate = (raw.startDate as string) || "";
  const endDate = (raw.endDate as string) || null;

  return {
    id: (raw.id as string) || `edu-${idx}`,
    school,
    degree,
    degreeId: (raw.degreeId as string) || degree,
    degreeEn: (raw.degreeEn as string) || degree,
    field: desc,
    fieldId: descId,
    fieldEn: descEn,
    description: desc,
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

/**
 * Merges SejatiDimedia featured projects with comprehensive Glio project data.
 */
function mergeFeaturedProjects(
  sejatiResult: { featuredSlugs: string[]; featuredProjects: Project[] } | null,
  allGlioProjects: Project[]
): { featuredProjects: Project[]; otherProjects: Project[] } {
  const glioMap = new Map<string, Project>();
  allGlioProjects.forEach((p) => glioMap.set(p.slug, p));

  const targetSlugs =
    sejatiResult?.featuredSlugs && sejatiResult.featuredSlugs.length > 0
      ? sejatiResult.featuredSlugs
      : DEFAULT_FEATURED_SLUGS;

  // 1. Resolve featured projects in exact priority order from SejatiDimedia
  let featuredList: Project[] = [];
  for (const slug of targetSlugs) {
    const glioProject = glioMap.get(slug);
    if (glioProject) {
      featuredList.push({
        ...glioProject,
        isFeatured: true,
      });
    }
  }

  // 2. If any slug was not in Glio, check if SejatiDimedia returned it directly in featuredProjects
  if (sejatiResult?.featuredProjects && sejatiResult.featuredProjects.length > 0) {
    const currentSlugs = new Set(featuredList.map((p) => p.slug));
    for (const sp of sejatiResult.featuredProjects) {
      if (!currentSlugs.has(sp.slug) && featuredList.length < 6) {
        featuredList.push({ ...sp, isFeatured: true });
        currentSlugs.add(sp.slug);
      }
    }
  }

  // 3. Fallback: If still empty, take first 6 from allGlioProjects
  if (featuredList.length === 0) {
    const sorted = [...allGlioProjects].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
    featuredList = sorted.slice(0, 6).map((p) => ({ ...p, isFeatured: true }));
  }

  const featuredSlugsSet = new Set(featuredList.map((p) => p.slug));
  const otherProjects = allGlioProjects
    .filter((p) => !featuredSlugsSet.has(p.slug))
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

  return { featuredProjects: featuredList, otherProjects };
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
      sejatiFeatured,
    ] = await Promise.all([
      fetchFromGlio<Record<string, unknown>>("/about").catch((err) => {
        console.warn("[Glio API] /about fallback to mock:", (err as Error).message);
        return null;
      }),
      fetchFromGlio<Record<string, unknown>[]>("/educations").catch((err) => {
        console.warn("[Glio API] /educations fallback to mock:", (err as Error).message);
        return null;
      }),
      fetchFromGlio<Record<string, unknown>[]>("/experiences"),
      fetchFromGlio<Record<string, unknown>[]>("/certificates"),
      fetchFromGlio<Record<string, unknown>[]>("/skills"),
      fetchFromGlio<Record<string, unknown>[]>("/projects"),
      fetchFeaturedFromSejatiDimedia(),
    ]);

    const profile = rawAbout
      ? normalizeGlioProfile(rawAbout)
      : mockPortfolioData.profile;

    const glioEducations = (rawEducations || []).map(normalizeGlioEducation);
    const educations =
      glioEducations.length > 0
        ? [...glioEducations].sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
        : mockPortfolioData.educations;

    const experiences = (rawExperiences || []).map(normalizeGlioExperience);
    const certificates = (rawCertificates || []).map(normalizeGlioCertificate);
    const skills = (rawSkills || []).map(normalizeGlioSkill);
    const allProjects = (rawProjects || []).map(normalizeGlioProject);

    const { featuredProjects, otherProjects } = mergeFeaturedProjects(
      sejatiFeatured,
      allProjects
    );

    return {
      profile,
      featuredProjects,
      otherProjects,
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
