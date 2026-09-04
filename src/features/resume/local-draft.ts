/**
 * Guest-mode resume persistence — localStorage draft (JOBREADY-PLAN.md §47).
 * Callers must only invoke these from the client (effects/handlers).
 */
import { createEmptyResumeData } from "@/features/resume/helpers";
import type { PageSize, ResumeData, TemplateId } from "@/features/resume/types";

export interface StoredDraft {
  data: ResumeData;
  meta: { name: string; templateId: TemplateId; pageSize: PageSize };
  updatedAt: number;
}

const STORAGE_KEY = "jobready:guest-resume:v1";

export function loadDraft(): StoredDraft | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredDraft>;
    if (!parsed || typeof parsed !== "object") return null;
    return {
      data: parsed.data ?? createEmptyResumeData(),
      meta: {
        name: parsed.meta?.name ?? "",
        templateId: parsed.meta?.templateId ?? "minimal",
        pageSize: parsed.meta?.pageSize ?? "A4",
      },
      updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

export function saveDraft(draft: StoredDraft): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Storage can be unavailable (private mode / quota). Editor keeps state in
    // memory; nothing crashes.
  }
}

export function clearDraft(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore.
  }
}
