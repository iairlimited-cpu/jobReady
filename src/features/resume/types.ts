/**
 * Resume (CV) domain model (JOBREADY-PLAN.md §A8).
 * Data is fully separate from visual templates: one structured `ResumeData`
 * object is rendered by any template.
 */

export const SECTION_KEYS = [
  "personal",
  "summary",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "languages",
  "awards",
  "volunteer",
  "custom",
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

/** Year/month are stored as numbers so they can be localized at render time. */
export interface MonthYear {
  month?: number;
  year?: number;
}

export interface Period {
  start?: MonthYear;
  end?: MonthYear;
  /** True when this is the current role/study ("Present"). */
  present?: boolean;
}

export interface ResumeExperience {
  id: string;
  role: string;
  company: string;
  location?: string;
  period?: Period;
  bullets: string[];
}

export interface ResumeEducation {
  id: string;
  school: string;
  degree: string;
  field?: string;
  location?: string;
  period?: Period;
}

export interface ResumeProject {
  id: string;
  name: string;
  link?: string;
  bullets: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer?: string;
  year?: number;
}

export interface Language {
  id: string;
  name: string;
  level?: string;
}

export interface Award {
  id: string;
  title: string;
  issuer?: string;
  year?: number;
}

export interface Volunteer {
  id: string;
  role: string;
  organization: string;
  period?: Period;
  bullets: string[];
}

export interface CustomSection {
  id: string;
  title: string;
  entries: string[];
}

export interface PersonalDetails {
  fullName: string;
  professionalTitle: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
}

export interface ResumeData {
  personal: PersonalDetails;
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: string[];
  projects: ResumeProject[];
  certifications: Certification[];
  languages: Language[];
  awards: Award[];
  volunteer: Volunteer[];
  customSections: CustomSection[];
  preferences: {
    /** Ordered list of visible sections. Anything omitted is hidden. */
    includedSections: SectionKey[];
  };
}

/* ------------------------------------------------------------------ */
/* Record stored in Firestore / local draft                            */
/* ------------------------------------------------------------------ */

export const TEMPLATE_IDS = [
  "minimal",
  "modern",
  "professional",
  "academic",
  "entry",
] as const;

export type TemplateId = (typeof TEMPLATE_IDS)[number];

export const PAGE_SIZES = ["A4", "LETTER"] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

export interface ResumeRecord {
  id: string;
  userId: string;
  name: string;
  templateId: TemplateId;
  pageSize: PageSize;
  data: ResumeData;
  createdAt: number;
  updatedAt: number;
}
