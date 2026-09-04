/**
 * Job application domain (JOBREADY-PLAN.md §A3, §A9).
 * Timeline events live in applications/{id}/events (subcollection);
 * notes are embedded and bounded.
 */

import type { ExtractedRequirement } from "@/features/analyzer/types";
import type { CoverLetterData } from "@/features/coverLetter/types";

export const APPLICATION_STATUSES = [
  "draft",
  "preparing",
  "ready",
  "applied",
  "interview",
  "second_interview",
  "offer",
  "accepted",
  "rejected",
  "withdrawn",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const EMPLOYMENT_TYPES = [
  "full_time",
  "part_time",
  "contract",
  "internship",
  "temporary",
  "other",
] as const;

export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

export type BadgeTone = "neutral" | "primary" | "success" | "warning" | "destructive";

export interface StatusMeta {
  value: ApplicationStatus;
  label: string;
  /** Badge tone used across the UI. */
  tone: BadgeTone;
  /** Active = still in play (counted toward "Active applications"). */
  active: boolean;
}

export const STATUS_META: Record<ApplicationStatus, StatusMeta> = {
  draft: { value: "draft", label: "Draft", tone: "neutral", active: false },
  preparing: { value: "preparing", label: "Preparing", tone: "primary", active: true },
  ready: { value: "ready", label: "Ready to apply", tone: "success", active: true },
  applied: { value: "applied", label: "Applied", tone: "primary", active: true },
  interview: { value: "interview", label: "Interview", tone: "warning", active: true },
  second_interview: {
    value: "second_interview",
    label: "Second interview",
    tone: "warning",
    active: true,
  },
  offer: { value: "offer", label: "Offer", tone: "success", active: true },
  accepted: { value: "accepted", label: "Accepted", tone: "success", active: false },
  rejected: { value: "rejected", label: "Rejected", tone: "destructive", active: false },
  withdrawn: { value: "withdrawn", label: "Withdrawn", tone: "neutral", active: false },
};

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  internship: "Internship",
  temporary: "Temporary",
  other: "Other",
};

export interface ApplicationNote {
  id: string;
  text: string;
  createdAt: number;
}

export interface TimelineEvent {
  id: string;
  type:
    | "created"
    | "analyzed"
    | "tailored"
    | "submitted"
    | "status_changed"
    | "interview_scheduled"
    | "interview_completed"
    | "note"
    | "custom";
  label: string;
  at: number;
}

export interface JobApplication {
  id: string;
  userId: string;
  title: string;
  company: string;
  url?: string;
  location?: string;
  employmentType?: EmploymentType;
  salary?: string;
  jobDescription?: string;
  status: ApplicationStatus;
  favorite: boolean;
  notes: ApplicationNote[];
  /** Saved output of the job analyzer (Phase 8). Plain serializable data. */
  requirements?: ExtractedRequirement[];
  /** Cover letter written for this application (Phase 10). */
  coverLetter?: CoverLetterData;
  createdAt: number;
  updatedAt: number;
  appliedAt?: number;
  deadline?: number;
}

export type ApplicationSortKey = "newest" | "oldest" | "deadline" | "company";

export interface ApplicationFilters {
  query: string;
  status: ApplicationStatus | "all";
  sort: ApplicationSortKey;
}
