import type { TemplateId } from "@/features/resume/types";

export interface ResumeTemplateMeta {
  id: TemplateId;
  name: string;
  category: string;
  description: string;
  /** Reserved for Phase 15 — never affects Phase 5 rendering. */
  premium: boolean;
}

export const RESUME_TEMPLATES: ResumeTemplateMeta[] = [
  {
    id: "minimal",
    name: "Minimal",
    category: "Minimal",
    description: "Clean single column with restrained typography — lets your content speak.",
    premium: false,
  },
  {
    id: "modern",
    name: "Modern",
    category: "Modern",
    description: "Two-column layout with a calm accent sidebar for contact, skills and tools.",
    premium: false,
  },
  {
    id: "professional",
    name: "Professional",
    category: "Professional",
    description: "Classic serif layout that suits most corporate and formal applications.",
    premium: false,
  },
  {
    id: "academic",
    name: "Academic",
    category: "Academic",
    description: "Detail-first layout for research, teaching and academic applications.",
    premium: false,
  },
  {
    id: "entry",
    name: "Entry-level",
    category: "Entry-level",
    description: "Friendly, clear layout for students and first applications.",
    premium: false,
  },
];

export function getTemplateMeta(id: TemplateId): ResumeTemplateMeta {
  return (
    RESUME_TEMPLATES.find((template) => template.id === id) ?? RESUME_TEMPLATES[0]
  );
}

export function isKnownTemplateId(id: string): id is TemplateId {
  return RESUME_TEMPLATES.some((template) => template.id === id);
}
