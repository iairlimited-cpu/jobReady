/** Matching engine types (JOBREADY-PLAN.md §A11). */

export type MatchStatus = "strong" | "partial" | "not_found";

export interface MatchEvidence {
  /** Where in the resume the match was found (e.g. "Work experience"). */
  location: string;
  /** Short surrounding snippet from the resume. */
  snippet: string;
}

export interface MatchResult {
  requirement: { id: string; label: string; category: string };
  status: MatchStatus;
  evidence: MatchEvidence[];
  /** Human explanation when status isn't obvious (e.g. experience length). */
  note?: string;
}

export interface MatchTotals {
  strong: number;
  partial: number;
  notFound: number;
  /** Requirements considered for matching (excludes duty/keyword types). */
  total: number;
}

export interface MatchReport {
  results: MatchResult[];
  totals: MatchTotals;
}
