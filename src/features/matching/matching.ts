/**
 * Deterministic CV ↔ requirements matching engine (JOBREADY-PLAN.md §A11, §99).
 * Pure TypeScript. UI-independent so a future AI layer can replace it behind
 * the same inputs/outputs.
 *
 * Honesty rules:
 *  - We report what the CV SHOWS, never a hire prediction.
 *  - "Not found" means "not visible in the CV", never "you lack the skill".
 */
import type { ExtractedRequirement } from "@/features/analyzer/types";
import type { ResumeData } from "@/features/resume/types";
import type { MatchEvidence, MatchReport, MatchResult } from "@/features/matching/types";

/** Requirement categories that are meaningful to match against a CV. */
const MATCHABLE_CATEGORIES = new Set([
  "technology",
  "skill",
  "soft_skill",
  "language",
  "education",
  "certification",
  "experience",
]);

/** Words too generic to prove anything when matched alone. */
const STOP_WORDS = new Set([
  "experience",
  "with",
  "using",
  "and",
  "for",
  "the",
  "strong",
  "ability",
  "skills",
  "level",
]);

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function tokenize(value: string): string[] {
  return normalize(value)
    .split(/[^a-z0-9+#.]+/)
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));
}

/* ------------------------------------------------------------------ */
/* Resume corpus                                                       */
/* ------------------------------------------------------------------ */

export interface CorpusEntry {
  location: string;
  original: string;
  lower: string;
}

function pushEntry(entries: CorpusEntry[], location: string, raw: string): void {
  const text = raw.replace(/\s+/g, " ").trim();
  if (text.length > 0) entries.push({ location, original: text, lower: text.toLowerCase() });
}

export function buildResumeCorpus(resume: ResumeData): CorpusEntry[] {
  const entries: CorpusEntry[] = [];

  pushEntry(entries, "Summary", resume.summary);
  if (resume.skills.length > 0) pushEntry(entries, "Skills", resume.skills.join(", "));

  for (const item of resume.experience) {
    pushEntry(entries, "Work experience", [item.role, item.company, item.location].filter(Boolean).join(" · "));
    pushEntry(entries, "Work experience", item.bullets.join(". "));
  }
  for (const item of resume.education) {
    pushEntry(entries, "Education", [item.school, item.degree, item.field, item.location].filter(Boolean).join(" · "));
  }
  for (const item of resume.projects) {
    pushEntry(entries, "Projects", item.name);
    pushEntry(entries, "Projects", item.bullets.join(". "));
  }
  for (const item of resume.certifications) {
    pushEntry(entries, "Certifications", [item.name, item.issuer].filter(Boolean).join(" · "));
  }
  for (const item of resume.languages) {
    pushEntry(entries, "Languages", [item.name, item.level].filter(Boolean).join(" · "));
  }
  for (const item of resume.volunteer) {
    pushEntry(entries, "Volunteer", item.role);
    pushEntry(entries, "Volunteer", item.bullets.join(". "));
  }
  for (const item of resume.awards) {
    pushEntry(entries, "Awards", [item.title, item.issuer].filter(Boolean).join(" · "));
  }
  for (const section of resume.customSections) {
    const title = section.title || "Additional";
    pushEntry(entries, title, section.entries.join(". "));
  }

  return entries;
}

/* ------------------------------------------------------------------ */
/* Text evidence                                                       */
/* ------------------------------------------------------------------ */

function findEvidence(
  entries: CorpusEntry[],
  phrase: string,
): MatchEvidence[] {
  const needle = normalize(phrase);
  const found: MatchEvidence[] = [];
  for (const entry of entries) {
    const index = entry.lower.indexOf(needle);
    if (index < 0) continue;
    const start = Math.max(0, index - 50);
    const end = Math.min(entry.original.length, index + needle.length + 60);
    const snippet =
      (start > 0 ? "…" : "") +
      entry.original.slice(start, end).trim() +
      (end < entry.original.length ? "…" : "");
    found.push({ location: entry.location, snippet });
    if (found.length >= 3) break;
  }
  return found;
}

function containsWord(entry: CorpusEntry, word: string): boolean {
  const variants = [word];
  // Simple plural tolerance: "apis" also matches "api".
  if (word.length > 3 && word.endsWith("s")) {
    variants.push(word.slice(0, -1));
  }
  return variants.some((variant) => {
    const pattern = new RegExp(`\\b${escapeRegExp(variant)}\\b`);
    return pattern.test(entry.lower);
  });
}

function matchesAllWords(entries: CorpusEntry[], words: string[]): boolean {
  return words.every((word) => entries.some((entry) => containsWord(entry, word)));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/* ------------------------------------------------------------------ */
/* Experience years                                                    */
/* ------------------------------------------------------------------ */

const CURRENT_YEAR = new Date().getFullYear();

function monthsBetween(startYear: number | undefined, endYear: number | undefined, present?: boolean): number {
  if (!startYear) return 0;
  const end = present || !endYear ? CURRENT_YEAR : endYear;
  return Math.max(0, end - startYear) * 12;
}

export function totalExperienceYears(resume: ResumeData): number {
  const entries = [...resume.experience, ...resume.volunteer];
  const totalMonths = entries.reduce(
    (sum, item) => sum + monthsBetween(item.period?.start?.year, item.period?.end?.year, item.period?.present),
    0,
  );
  return Math.round((totalMonths / 12) * 10) / 10;
}

function yearsFromLabel(label: string): number | null {
  const match = label.match(/(\d{1,2})\s*\+?\s*years?/i);
  return match ? Number(match[1]) : null;
}

/* ------------------------------------------------------------------ */
/* Main matcher                                                        */
/* ------------------------------------------------------------------ */

function matchOne(
  requirement: ExtractedRequirement,
  corpus: CorpusEntry[],
  resume: ResumeData,
): MatchResult {
  const base = {
    requirement: {
      id: requirement.id,
      label: requirement.label,
      category: requirement.category,
    },
  };

  // Numeric experience requirement: compare against the resume's total.
  if (requirement.category === "experience") {
    const needed = yearsFromLabel(requirement.label);
    if (needed !== null) {
      const total = totalExperienceYears(resume);
      if (total >= needed) {
        return { ...base, status: "strong", evidence: [], note: `CV shows about ${total} years of experience.` };
      }
      if (total > 0) {
        return { ...base, status: "partial", evidence: [], note: `CV shows about ${total} years — the posting asks for ${needed}+.` };
      }
      return { ...base, status: "not_found", evidence: [], note: "No dated experience is visible in the CV." };
    }
  }

  const phrase = normalize(requirement.label);
  const words = tokenize(requirement.label);

  // Full phrase present somewhere → strong.
  const exactEvidence = findEvidence(corpus, phrase);
  if (exactEvidence.length > 0) {
    return { ...base, status: "strong", evidence: exactEvidence };
  }

  // Every significant word present (phrase-level wording differs) → partial.
  if (words.length > 0 && matchesAllWords(corpus, words)) {
    const firstEvidence = findEvidence(corpus, words[0]);
    return {
      ...base,
      status: "partial",
      evidence: firstEvidence,
      note: "Found as individual words — check the exact wording matches.",
    };
  }

  return { ...base, status: "not_found", evidence: [] };
}

export function matchResumeAgainstRequirements(
  resume: ResumeData,
  requirements: ExtractedRequirement[],
): MatchReport {
  const corpus = buildResumeCorpus(resume);
  const matchable = requirements.filter((requirement) =>
    MATCHABLE_CATEGORIES.has(requirement.category),
  );

  const results: MatchResult[] = matchable.map((requirement) =>
    matchOne(requirement, corpus, resume),
  );

  const totals = {
    strong: results.filter((result) => result.status === "strong").length,
    partial: results.filter((result) => result.status === "partial").length,
    notFound: results.filter((result) => result.status === "not_found").length,
    total: results.length,
  };

  return { results, totals };
}

export function matchSummaryLabel(report: MatchReport): string {
  const { strong, partial, total } = report.totals;
  const shown = strong + partial;
  return `Your CV shows ${shown} of ${total} requirements the job lists`;
}
