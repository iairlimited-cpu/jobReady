import { describe, expect, it } from "vitest";

import {
  DATE_FORMAT_OPTIONS,
  defaultTimeZone,
  formatDateForUser,
  listTimeZones,
} from "@/lib/dates";

describe("DATE_FORMAT_OPTIONS", () => {
  it("shows unambiguous example labels for each format", () => {
    const byValue = new Map(DATE_FORMAT_OPTIONS.map((o) => [o.value, o.example]));
    expect(byValue.get("d MMM yyyy")).toBe("14 Mar 2026");
    expect(byValue.get("yyyy-MM-dd")).toBe("2026-03-14");
  });

  it("never offers an ambiguous numeric month-first format", () => {
    const offered = DATE_FORMAT_OPTIONS.map((o) => o.value);
    expect(offered).not.toContain("MM/dd/yyyy");
  });
});

describe("formatDateForUser", () => {
  it("formats with the default unambiguous style", () => {
    expect(formatDateForUser(new Date(2026, 2, 14))).toBe("14 Mar 2026");
  });
});

describe("time zones", () => {
  it("returns a non-empty list containing a sensible default", () => {
    const zones = listTimeZones();
    expect(zones.length).toBeGreaterThan(0);
    expect(zones).toContain("UTC");
  });

  it("resolves a default time zone", () => {
    const zone = defaultTimeZone();
    expect(zone.length).toBeGreaterThan(0);
  });
});
