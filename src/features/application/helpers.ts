/**
 * Pure application helpers — no React, no Firestore. Unit-testable.
 */
import type {
  ApplicationFilters,
  ApplicationSortKey,
  ApplicationStatus,
  JobApplication,
  TimelineEvent,
} from "@/features/application/types";

export function createTimelineEvent(
  type: TimelineEvent["type"],
  label: string,
  at = Date.now(),
): TimelineEvent {
  return { id: `evt-${at}-${Math.random().toString(36).slice(2, 8)}`, type, label, at };
}

/** Statuses that count as "still in play" after submission decisions. */
export function isActiveStatus(status: ApplicationStatus): boolean {
  return !["accepted", "rejected", "withdrawn", "draft"].includes(status);
}

/** True when a deadline has passed and the application is still active. */
export function isOverdue(
  application: Pick<JobApplication, "deadline" | "status">,
  now = Date.now(),
): boolean {
  if (!application.deadline) return false;
  if (!isActiveStatus(application.status)) return false;
  return application.deadline < now;
}

export interface ApplicationStats {
  total: number;
  active: number;
  interviews: number;
  offers: number;
  applied: number;
  /** Percent of applications that reached an interview (0 when none). */
  interviewRate: number | null;
  /** Percent of applications that reached an offer (0 when none). */
  offerRate: number | null;
}

export function deriveStatistics(applications: JobApplication[]): ApplicationStats {
  const total = applications.length;
  const active = applications.filter((a) => a.status !== "draft" && isActiveStatus(a.status))
    .length;
  const interviews = applications.filter((a) =>
    ["interview", "second_interview", "offer", "accepted"].includes(a.status),
  ).length;
  const offers = applications.filter((a) => ["offer", "accepted"].includes(a.status))
    .length;
  const applied = applications.filter(
    (a) => a.appliedAt !== undefined || isActiveStatus(a.status),
  ).length;
  const rate = (count: number) => (total > 0 ? Math.round((count / total) * 100) : null);

  return {
    total,
    active,
    interviews,
    offers,
    applied,
    interviewRate: rate(interviews),
    offerRate: rate(offers),
  };
}

export function filterApplications(
  applications: JobApplication[],
  filters: ApplicationFilters,
): JobApplication[] {
  const query = filters.query.trim().toLowerCase();
  const filtered = applications.filter((application) => {
    const matchesStatus =
      filters.status === "all" || application.status === filters.status;
    const matchesQuery =
      query.length === 0 ||
      application.title.toLowerCase().includes(query) ||
      application.company.toLowerCase().includes(query);
    return matchesStatus && matchesQuery;
  });

  return sortApplications(filtered, filters.sort);
}

export function sortApplications(
  applications: JobApplication[],
  sort: ApplicationSortKey,
): JobApplication[] {
  const copy = [...applications];
  switch (sort) {
    case "oldest":
      return copy.sort((a, b) => a.createdAt - b.createdAt);
    case "deadline":
      return copy.sort((a, b) => {
        const aDeadline = a.deadline ?? Number.MAX_SAFE_INTEGER;
        const bDeadline = b.deadline ?? Number.MAX_SAFE_INTEGER;
        return aDeadline - bDeadline;
      });
    case "company":
      return copy.sort((a, b) => a.company.localeCompare(b.company));
    case "newest":
    default:
      return copy.sort((a, b) => b.updatedAt - a.updatedAt);
  }
}

export const DEFAULT_APPLICATION_FILTERS: ApplicationFilters = {
  query: "",
  status: "all",
  sort: "newest",
};

export function statusOf(value: string): ApplicationStatus | "all" {
  const known = [
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
  ];
  return known.includes(value) ? (value as ApplicationStatus) : value === "all" ? "all" : "all";
}
