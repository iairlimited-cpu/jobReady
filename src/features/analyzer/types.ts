/** Analyzer domain types (JOBREADY-PLAN.md §A10). */

export const REQUIREMENT_CATEGORIES = [
  "technology",
  "skill",
  "soft_skill",
  "language",
  "qualification",
  "education",
  "experience",
  "certification",
  "responsibility",
  "keyword",
] as const;

export type RequirementCategory = (typeof REQUIREMENT_CATEGORIES)[number];

export type Importance = "must" | "nice" | "unknown";

export interface ExtractedRequirement {
  id: string;
  category: RequirementCategory;
  label: string;
  normalized?: string;
  /** Short source phrases showing where the match came from. */
  evidence: string[];
  importance: Importance;
}

export interface AnalysisResult {
  requirements: ExtractedRequirement[];
  analyzedAt: number;
}

export const CATEGORY_LABELS: Record<RequirementCategory, string> = {
  technology: "Technical skills",
  skill: "Skills",
  soft_skill: "Soft skills",
  language: "Languages",
  qualification: "Qualifications",
  education: "Education",
  experience: "Experience",
  certification: "Certifications",
  responsibility: "Responsibilities",
  keyword: "Other keywords",
};

export const CATEGORY_ORDER: RequirementCategory[] = [
  "experience",
  "technology",
  "skill",
  "soft_skill",
  "language",
  "education",
  "qualification",
  "certification",
  "responsibility",
  "keyword",
];
