import { format } from "date-fns";

/**
 * Date & timezone helpers (JOBREADY-PLAN.md §72).
 * We store structured values and format per the user's saved preference —
 * never display ambiguous formats like "03/04/2026" without context.
 */

export interface DateFormatOption {
  /** date-fns format string, stored in the user profile. */
  value: string;
  /** Example rendered from a fixed date so labels never change. */
  example: string;
}

const EXAMPLE_DATE = new Date(2026, 2, 14); // 14 March 2026

export const DATE_FORMAT_OPTIONS: DateFormatOption[] = [
  { value: "d MMM yyyy", example: "" },
  { value: "MMM d, yyyy", example: "" },
  { value: "dd/MM/yyyy", example: "" },
  { value: "yyyy-MM-dd", example: "" },
].map((option) => ({ ...option, example: format(EXAMPLE_DATE, option.value) }));

export const DEFAULT_DATE_FORMAT = "d MMM yyyy";

export function formatDateForUser(
  date: Date | number,
  formatString: string = DEFAULT_DATE_FORMAT,
): string {
  return format(date, formatString);
}

const FALLBACK_TIME_ZONES = [
  "UTC",
  "Africa/Nairobi",
  "Africa/Lagos",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Australia/Sydney",
  "Europe/London",
  "Europe/Paris",
];

/** All IANA time zones the runtime supports, plus UTC (with a fallback list). */
export function listTimeZones(): string[] {
  const runtime = Intl as unknown as {
    supportedValuesOf?: (key: "timeZone") => string[];
  };
  try {
    if (typeof runtime.supportedValuesOf === "function") {
      const zones = runtime.supportedValuesOf("timeZone");
      if (Array.isArray(zones) && zones.length > 0) {
        // Note: supportedValuesOf intentionally excludes "UTC" — add it back.
        return zones.includes("UTC") ? zones : ["UTC", ...zones];
      }
    }
  } catch {
    // Fall through to the fallback list.
  }
  return FALLBACK_TIME_ZONES;
}

/** The browser's current time zone, or UTC when unavailable. */
export function defaultTimeZone(): string {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return timeZone && timeZone.length > 0 ? timeZone : "UTC";
  } catch {
    return "UTC";
  }
}
