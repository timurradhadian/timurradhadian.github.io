export type Locale = "id" | "en";

export interface LocalizedString {
  id?: string;
  en?: string;
  default: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  titleId?: string;
  titleEn?: string;
  category: string;
  categoryId?: string;
  categoryEn?: string;
  summary: string;
  summaryId?: string;
  summaryEn?: string;
  description?: string;
  descriptionId?: string;
  descriptionEn?: string;
  thumbnailUrl?: string;
  techStack: string[];
  projectUrl?: string;
  githubUrl?: string;
  isFeatured?: boolean;
  isNda?: boolean;
  order?: number;
}

export interface Experience {
  id: string;
  position: string;
  positionId?: string;
  positionEn?: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string | null; // null represents "Present" / "Saat Ini"
  isCurrent?: boolean;
  highlights: string[];
  highlightsId?: string[];
  highlightsEn?: string[];
  order?: number;
}

export interface Skill {
  id: string;
  name: string;
  category: string; // e.g. "Frontend", "Backend", "Cloud & DevOps", "Tools"
  categoryId?: string;
  categoryEn?: string;
  level: number; // 0-100
  icon?: string;
  order?: number;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  degreeId?: string;
  degreeEn?: string;
  field?: string;
  fieldId?: string;
  fieldEn?: string;
  startDate: string;
  endDate?: string | null;
  location?: string;
  logo?: string;
  order?: number;
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  credentialUrl?: string;
  credentialId?: string;
  order?: number;
}

export interface Profile {
  name: string;
  role: string;
  roleId?: string;
  roleEn?: string;
  bio: string;
  bioId?: string;
  bioEn?: string;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
  location: string;
  availableForHire?: boolean;
  avatarUrl?: string;
}

export interface PortfolioData {
  profile: Profile;
  featuredProjects: Project[];
  otherProjects: Project[];
  experiences: Experience[];
  educations?: Education[];
  skills: Skill[];
  certificates: Certificate[];
}
