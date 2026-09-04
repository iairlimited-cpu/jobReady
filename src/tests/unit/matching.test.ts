import { describe, expect, it } from "vitest";

import type { ExtractedRequirement } from "@/features/analyzer/types";
import {
  buildResumeCorpus,
  matchResumeAgainstRequirements,
  matchSummaryLabel,
  totalExperienceYears,
} from "@/features/matching/matching";
import { createEmptyResumeData } from "@/features/resume/helpers";
import type { ResumeData } from "@/features/resume/types";

function requirement(partial: Partial<ExtractedRequirement> & { label: string }): ExtractedRequirement {
  return {
    id: partial.id ?? `req-${partial.label}`,
    category: "technology",
    evidence: [],
    importance: "unknown",
    ...partial,
  };
}

function buildResume(): ResumeData {
  const resume = createEmptyResumeData();
  resume.personal.fullName = "Ada Lovelace";
  resume.summary = "Collaborative engineer with strong communication skills.";
  resume.skills = ["React", "TypeScript", "Git"];
  resume.experience.push({
    id: "e1",
    role: "Frontend Engineer",
    company: "Acme",
    period: { start: { year: 2020 }, present: true },
    bullets: [
      "Built dashboards with React and TypeScript.",
      "Designed REST API integrations for internal tools.",
    ],
  });
  resume.projects.push({
    id: "p1",
    name: "Pipeline dashboard",
    bullets: ["Deployed containerized services on AWS."],
  });
  resume.languages.push({ id: "l1", name: "English", level: "Fluent" });
  return resume;
}

const REQUIREMENTS = [
  requirement({ label: "React", category: "technology" }),
  requirement({ label: "TypeScript", category: "technology" }),
  requirement({ label: "AWS", category: "technology" }),
  requirement({ label: "Docker", category: "technology" }),
  requirement({ label: "REST APIs", category: "technology" }),
  requirement({ label: "3+ years", category: "experience" }),
  requirement({ label: "Communication", category: "soft_skill" }),
  requirement({ label: "Bachelor's degree", category: "education" }),
  // Duty-type requirements should be excluded from matching.
  requirement({ label: "Build responsive UIs", category: "responsibility" }),
  requirement({ label: "Figma", category: "keyword" }),
];

describe("buildResumeCorpus", () => {
  it("includes text from all major sections", () => {
    const entries = buildResumeCorpus(buildResume());
    const text = entries.map((entry) => entry.lower).join("\n");
    expect(text).toContain("react");
    expect(text).toContain("aws");
    expect(text).toContain("dashboard");
    expect(entries.some((entry) => entry.location === "Work experience")).toBe(true);
  });
});

describe("totalExperienceYears", () => {
  it("sums dated experience up to the current year", () => {
    const resume = buildResume();
    expect(totalExperienceYears(resume)).toBeGreaterThanOrEqual(5);
  });
});

describe("matchResumeAgainstRequirements", () => {
  const report = matchResumeAgainstRequirements(buildResume(), REQUIREMENTS);

  function statusFor(label: string) {
    return report.results.find((result) => result.requirement.label === label)?.status;
  }

  it("marks clearly-present skills as strong with evidence", () => {
    expect(statusFor("React")).toBe("strong");
    const react = report.results.find((r) => r.requirement.label === "React");
    expect(react?.evidence.length).toBeGreaterThan(0);
    expect(react?.evidence[0].location).toBeTruthy();
  });

  it("marks absent skills as not found", () => {
    expect(statusFor("Docker")).toBe("not_found");
  });

  it("treats a plural wording mismatch as partial", () => {
    expect(statusFor("REST APIs")).toBe("partial");
  });

  it("matches numeric experience against dated history", () => {
    expect(statusFor("3+ years")).toBe("strong");
    const years = report.results.find((r) => r.requirement.label === "3+ years");
    expect(years?.note).toContain("years");
  });

  it("marks missing education as not found", () => {
    expect(statusFor("Bachelor's degree")).toBe("not_found");
  });

  it("excludes responsibility and keyword requirements", () => {
    const labels = report.results.map((result) => result.requirement.label);
    expect(labels).not.toContain("Build responsive UIs");
    expect(labels).not.toContain("Figma");
    expect(report.totals.total).toBe(8);
  });

  it("produces an honest summary label", () => {
    expect(matchSummaryLabel(report)).toMatch(/shows \d+ of 8 requirements/);
  });
});
