import {
  Certificate,
  Experience,
  PortfolioData,
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
  process.env.SEJATIDIMEDIA_API_URL || "https://api.sejatidimedia.com";

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

async function fetchFeaturedFromSejatiDimedia(): Promise<Project[] | null> {
  try {
    const cleanUrl = SEJATIDIMEDIA_API_URL.trim().replace(/\/+$/, "");
    const res = await fetchWithTimeout(`${cleanUrl}/api/public/featured-projects`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      console.warn(
        `[SejatiDimedia API] Status ${res.status}. Falling back to Glio featured projects.`
      );
      return null;
    }
    const data = await res.json();
    return Array.isArray(data) ? data : data.data || null;
  } catch (err) {
    console.warn(
      `[SejatiDimedia API] Connection failed (${(err as Error).message}). Falling back to Glio featured projects.`
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
function normalizeGlioSkill(raw: Record<string, unknown>, idx: number): Skill {
  return {
    id: (raw.id as string) || `skill-${idx}`,
    name: (raw.name as string) || "",
    category: (raw.category as string) || "General",
    level: typeof raw.level === "number" ? raw.level : 85,
    order: typeof raw.order === "number" ? raw.order : idx,
  };
}

/**
 * Merges SejatiDimedia featured projects with comprehensive Glio project data.
 */
function mergeFeaturedProjects(
  sejatiFeatured: Project[] | null,
  allGlioProjects: Project[]
): { featuredProjects: Project[]; otherProjects: Project[] } {
  const glioMap = new Map<string, Project>();
  allGlioProjects.forEach((p) => glioMap.set(p.slug, p));

  let featuredList: Project[] = [];

  if (sejatiFeatured && sejatiFeatured.length > 0) {
    featuredList = sejatiFeatured.slice(0, 6).map((sejatiProject) => {
      const glioProject = glioMap.get(sejatiProject.slug);
      if (glioProject) {
        return {
          ...sejatiProject,
          ...glioProject,
          isFeatured: true,
        };
      }
      return {
        ...sejatiProject,
        isFeatured: true,
      };
    });
  }

  // Fallback: If SejatiDimedia had no results, take first 6 from Glio
  if (featuredList.length === 0) {
    const sorted = [...allGlioProjects].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
    featuredList = sorted.slice(0, 6).map((p) => ({ ...p, isFeatured: true }));
  }

  const featuredSlugs = new Set(featuredList.map((p) => p.slug));
  const otherProjects = allGlioProjects
    .filter((p) => !featuredSlugs.has(p.slug))
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
    const [rawExperiences, rawCertificates, rawSkills, rawProjects, sejatiFeatured] =
      await Promise.all([
        fetchFromGlio<Record<string, unknown>[]>("/experiences"),
        fetchFromGlio<Record<string, unknown>[]>("/certificates"),
        fetchFromGlio<Record<string, unknown>[]>("/skills"),
        fetchFromGlio<Record<string, unknown>[]>("/projects"),
        fetchFeaturedFromSejatiDimedia(),
      ]);

    const experiences = (rawExperiences || []).map(normalizeGlioExperience);
    const certificates = (rawCertificates || []).map(normalizeGlioCertificate);
    const skills = (rawSkills || []).map(normalizeGlioSkill);
    const allProjects = (rawProjects || []).map(normalizeGlioProject);

    const { featuredProjects, otherProjects } = mergeFeaturedProjects(
      sejatiFeatured,
      allProjects
    );

    return {
      profile: mockPortfolioData.profile,
      featuredProjects,
      otherProjects,
      experiences: [...experiences].sort((a, b) => (a.order ?? 99) - (b.order ?? 99)),
      educations: mockPortfolioData.educations,
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
