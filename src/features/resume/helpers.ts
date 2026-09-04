/**
 * Pure resume helpers — no React, no Firestore. Fully unit-testable.
 */
import {
  SECTION_KEYS,
  type ResumeData,
  type SectionKey,
} from "@/features/resume/types";

export const DEFAULT_INCLUDED_SECTIONS: SectionKey[] = [
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
];

/** Stable id generator (crypto.randomUUID with a fallback). */
export function createId(prefix = "id"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createEmptyResumeData(): ResumeData {
  return {
    personal: {
      fullName: "",
      professionalTitle: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      linkedin: "",
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    awards: [],
    volunteer: [],
    customSections: [],
    preferences: { includedSections: [...DEFAULT_INCLUDED_SECTIONS] },
  };
}

/** True when an array-backed section has no usable content to show. */
export function sectionHasContent(data: ResumeData, section: SectionKey): boolean {
  switch (section) {
    case "personal":
      return data.personal.fullName.trim().length > 0;
    case "summary":
      return data.summary.trim().length > 0;
    case "experience":
      return data.experience.length > 0;
    case "education":
      return data.education.length > 0;
    case "skills":
      return data.skills.length > 0;
    case "projects":
      return data.projects.length > 0;
    case "certifications":
      return data.certifications.length > 0;
    case "languages":
      return data.languages.length > 0;
    case "awards":
      return data.awards.length > 0;
    case "volunteer":
      return data.volunteer.length > 0;
    case "custom":
      return data.customSections.some(
        (sectionEntry) =>
          sectionEntry.title.trim().length > 0 &&
          sectionEntry.entries.some((entry) => entry.trim().length > 0),
      );
    default:
      return false;
  }
}

/** Ordered, content-bearing sections currently included in the document. */
export function visibleSections(data: ResumeData): SectionKey[] {
  return data.preferences.includedSections.filter((key) =>
    sectionHasContent(data, key),
  );
}

export function isSectionIncluded(data: ResumeData, section: SectionKey): boolean {
  return data.preferences.includedSections.includes(section);
}

export function toggleSectionIncluded(data: ResumeData, section: SectionKey): ResumeData {
  const currentlyIncluded = isSectionIncluded(data, section);
  const includedSections = currentlyIncluded
    ? data.preferences.includedSections.filter((key) => key !== section)
    : [...data.preferences.includedSections, section];
  return {
    ...data,
    preferences: { ...data.preferences, includedSections },
  };
}

export function moveSection(
  data: ResumeData,
  section: SectionKey,
  direction: -1 | 1,
): ResumeData {
  const sections = [...data.preferences.includedSections];
  const index = sections.indexOf(section);
  if (index < 0) return data;
  const target = index + direction;
  if (target < 0 || target >= sections.length) return data;
  const [removed] = sections.splice(index, 1);
  sections.splice(target, 0, removed);
  return { ...data, preferences: { ...data.preferences, includedSections: sections } };
}

/** Every known section key, in canonical order, used by editors/rail UI. */
export function orderedSectionKeys(): SectionKey[] {
  return [...SECTION_KEYS];
}

/* ------------------------------------------------------------------ */
/* Generic list-item helpers (typed safe)                              */
/* ------------------------------------------------------------------ */

export function addArrayItem<T extends { id: string }>(
  items: T[],
  factory: () => T,
): T[] {
  return [...items, factory()];
}

export function updateArrayItem<T extends { id: string }>(
  items: T[],
  id: string,
  updater: (item: T) => T,
): T[] {
  return items.map((item) => (item.id === id ? updater(item) : item));
}

export function removeArrayItem<T extends { id: string }>(
  items: T[],
  id: string,
): T[] {
  return items.filter((item) => item.id !== id);
}

export function moveArrayItem<T>(
  items: T[],
  index: number,
  direction: -1 | 1,
): T[] {
  const target = index + direction;
  if (index < 0 || target < 0 || target >= items.length) return items;
  const next = [...items];
  const [removed] = next.splice(index, 1);
  next.splice(target, 0, removed);
  return next;
}

export function toggleInList<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}
