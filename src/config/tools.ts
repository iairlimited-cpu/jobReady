/**
 * The JOBREADY toolkit (JOBREADY-PLAN.md §54).
 * `href` is the route the tool will live at when it ships (later phases).
 * `status: "planned"` means the tool page does not exist yet — the tools hub
 * must NOT render it as a link until its phase lands (no dead links).
 */
export type ToolStatus = "live" | "planned";

export interface ToolDef {
  slug: string;
  name: string;
  short: string;
  description: string;
  href: string;
  status: ToolStatus;
  /** Build phase that delivers the tool (for the hub's honest roadmap). */
  phase: number;
}

export const tools: ToolDef[] = [
  {
    slug: "resume-builder",
    name: "CV / Resume builder",
    short: "Structured, section-by-section CV builder.",
    description:
      "Add, remove and reorder sections, choose a professional template, and preview a page-accurate A4/Letter layout before you export.",
    href: "/tools/resume-builder",
    status: "planned",
    phase: 5,
  },
  {
    slug: "job-analyzer",
    name: "Job description analyzer",
    short: "Turn any job post into structured requirements.",
    description:
      "Paste a job description and get skills, qualifications, responsibilities and keywords — clearly grouped and explained.",
    href: "/tools/job-analyzer",
    status: "planned",
    phase: 8,
  },
  {
    slug: "cover-letter",
    name: "Cover letter builder",
    short: "Write a focused letter connected to your application.",
    description:
      "Scaffolded sections, honest drafting guidance and clean PDF export — without inventing experience you don't have.",
    href: "/tools/cover-letter",
    status: "planned",
    phase: 10,
  },
  {
    slug: "checklist",
    name: "Application checklist",
    short: "Never forget a required document again.",
    description:
      "A default checklist per application plus custom items, with clear readiness so you know when you're really ready to apply.",
    href: "/tools/checklist",
    status: "planned",
    phase: 11,
  },
  {
    slug: "interview-questions",
    name: "Interview question library",
    short: "Curated questions by role, level and category.",
    description:
      "General, behavioral, technical, role-specific and leadership questions — with a place to save your own STAR answers.",
    href: "/tools/interview-questions",
    status: "planned",
    phase: 12,
  },
  {
    slug: "resume-checker",
    name: "Resume quality checker",
    short: "A deterministic review of your CV's structure.",
    description:
      "Catches missing contact details, gaps, inconsistent dates and common formatting issues. Honest checks — not a fake 'ATS score'.",
    href: "/tools/resume-checker",
    status: "planned",
    phase: 14,
  },
  {
    slug: "keyword-checker",
    name: "Resume keyword checker",
    short: "See which job keywords your CV actually shows.",
    description:
      "Compare a job description against your CV and see, in plain language, what is clearly shown and what isn't.",
    href: "/tools/keyword-checker",
    status: "planned",
    phase: 14,
  },
  {
    slug: "star-method",
    name: "STAR method builder",
    short: "Structure your interview stories.",
    description:
      "Guided Situation → Task → Action → Result fields that help you prepare real, honest examples — without fabricating results.",
    href: "/tools/star-method",
    status: "planned",
    phase: 12,
  },
] as const;

export function isToolLive(slug: string): boolean {
  return tools.some((t) => t.slug === slug && t.status === "live");
}
