import { describe, expect, it } from "vitest";

import {
  DEFAULT_APPLICATION_FILTERS,
  deriveStatistics,
  filterApplications,
  isActiveStatus,
  isOverdue,
  sortApplications,
} from "@/features/application/helpers";
import {
  applicationDetailsSchema,
  appliedFlowSchema,
  noteSchema,
} from "@/features/application/schemas";
import { STATUS_META } from "@/features/application/types";
import type { JobApplication } from "@/features/application/types";

function makeApplication(overrides: Partial<JobApplication> = {}): JobApplication {
  return {
    id: "a1",
    userId: "u1",
    title: "Software Engineer",
    company: "Acme",
    status: "preparing",
    favorite: false,
    notes: [],
    createdAt: 1000,
    updatedAt: 2000,
    ...overrides,
  };
}

describe("status meta", () => {
  it("covers every status with a label and tone", () => {
    expect(STATUS_META.draft.label).toBe("Draft");
    expect(STATUS_META.second_interview.label).toBe("Second interview");
  });
});

describe("activity helpers", () => {
  it("treats terminal/draft statuses as inactive", () => {
    expect(isActiveStatus("preparing")).toBe(true);
    expect(isActiveStatus("interview")).toBe(true);
    expect(isActiveStatus("rejected")).toBe(false);
    expect(isActiveStatus("accepted")).toBe(false);
    expect(isActiveStatus("draft")).toBe(false);
  });

  it("flags passed deadlines only for active applications", () => {
    const active = makeApplication({ deadline: 100 });
    const withdrawn = makeApplication({ status: "withdrawn", deadline: 100 });
    expect(isOverdue(active, 200)).toBe(true);
    expect(isOverdue(withdrawn, 200)).toBe(false);
    expect(isOverdue(makeApplication({}), 200)).toBe(false);
  });
});

describe("deriveStatistics", () => {
  it("computes counts and rates from the data", () => {
    const stats = deriveStatistics([
      makeApplication({ status: "interview" }),
      makeApplication({ status: "offer" }),
      makeApplication({ status: "applied" }),
      makeApplication({ status: "draft" }),
    ]);
    expect(stats.total).toBe(4);
    expect(stats.active).toBe(3);
    expect(stats.interviews).toBe(2);
    expect(stats.offers).toBe(1);
    expect(stats.interviewRate).toBe(50);
  });

  it("returns null rates when there is no data", () => {
    const stats = deriveStatistics([]);
    expect(stats.interviewRate).toBeNull();
    expect(stats.offerRate).toBeNull();
  });
});

describe("filter + sort", () => {
  const items = [
    makeApplication({ id: "a", title: "Frontend Engineer", company: "Zeta", updatedAt: 300 }),
    makeApplication({ id: "b", title: "Backend Engineer", company: "Alpha", status: "interview", updatedAt: 500 }),
    makeApplication({ id: "c", title: "Designer", company: "Beta", status: "rejected", updatedAt: 100 }),
  ];

  it("searches title and company", () => {
    const found = filterApplications(items, {
      ...DEFAULT_APPLICATION_FILTERS,
      query: "alpha",
    });
    expect(found.map((item) => item.id)).toEqual(["b"]);
  });

  it("filters by status", () => {
    const found = filterApplications(items, {
      ...DEFAULT_APPLICATION_FILTERS,
      status: "rejected",
    });
    expect(found.map((item) => item.id)).toEqual(["c"]);
  });

  it("sorts by company and deadline", () => {
    expect(sortApplications(items, "company").map((item) => item.id)).toEqual([
      "b",
      "c",
      "a",
    ]);
    const withDeadlines = [
      makeApplication({ id: "x", deadline: 300 }),
      makeApplication({ id: "y", deadline: 100 }),
      makeApplication({ id: "z" }),
    ];
    expect(sortApplications(withDeadlines, "deadline").map((item) => item.id)).toEqual([
      "y",
      "x",
      "z",
    ]);
  });
});

describe("application schemas", () => {
  it("requires title and company", () => {
    expect(
      applicationDetailsSchema.safeParse({ title: "", company: "" }).success,
    ).toBe(false);
  });

  it("accepts a full valid application", () => {
    const result = applicationDetailsSchema.safeParse({
      title: "Engineer",
      company: "Acme",
      url: "https://jobs.example.com/123",
      location: "Remote",
      employmentType: "full_time",
      salary: "60k",
      deadlineDate: "2026-10-01",
      jobDescription: "Build great software.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid urls", () => {
    expect(
      applicationDetailsSchema.safeParse({ title: "x", company: "y", url: "nope" })
        .success,
    ).toBe(false);
  });

  it("validates the applied-flow form", () => {
    expect(
      appliedFlowSchema.safeParse({ appliedDate: "2026-09-01", method: "Online" })
        .success,
    ).toBe(true);
    expect(appliedFlowSchema.safeParse({ appliedDate: "", method: "" }).success).toBe(
      false,
    );
  });

  it("validates notes", () => {
    expect(noteSchema.safeParse({ text: "   " }).success).toBe(false);
    expect(noteSchema.safeParse({ text: "Reply next week" }).success).toBe(true);
  });
});
