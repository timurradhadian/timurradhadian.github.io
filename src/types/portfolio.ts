export type Locale = "id" | "en";

export interface LocalizedString {
  id?: string;
  en?: string;
  default: string;
}

export interface ProjectDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  size?: number;
  order?: number;
}

export interface ProjectLink {
  label?: string;
  url: string;
  type?: string;
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
  clientSummary?: string;
  clientSummaryId?: string;
  clientSummaryEn?: string;
  description?: string;
  descriptionId?: string;
  descriptionEn?: string;
  thumbnailUrl?: string;
  bannerImage?: string;
  techStack: string[];
  projectUrl?: string;
  githubUrl?: string;
  links?: ProjectLink[];
  documents?: ProjectDocument[];
  isFeatured?: boolean;
  isPublic?: boolean;
  isNda?: boolean;
  isProfessional?: boolean;
  startDate?: string;
  endDate?: string | null;
  status?: string;
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
  schoolId?: string;
  schoolEn?: string;
  degree: string;
  degreeId?: string;
  degreeEn?: string;
  field?: string;
  fieldId?: string;
  fieldEn?: string;
  description?: string;
  descriptionId?: string;
  descriptionEn?: string;
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
  about?: string;
  aboutId?: string;
  aboutEn?: string;
  description?: string;
  descriptionId?: string;
  descriptionEn?: string;
  expertiseId?: string;
  expertiseEn?: string;
  summary?: string;
  summaryId?: string;
  summaryEn?: string;
  email: string;
  phone?: string;
  bookingLink?: string;
  githubUrl: string;
  linkedinUrl: string;
  websiteUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  location: string;
  workExperience?: number;
  availableForHire?: boolean;
  avatarUrl?: string;
}

export interface PortfolioData {
  profile: Profile;
  featuredProjects: Project[];
  otherProjects: Project[];
  ndaProjects?: Project[];
  ndaSlugs?: string[];
  ndaBlurEnabled?: boolean;
  experiences: Experience[];
  educations?: Education[];
  skills: Skill[];
  certificates: Certificate[];
}
