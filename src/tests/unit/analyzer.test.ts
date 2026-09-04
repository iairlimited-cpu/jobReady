import { describe, expect, it } from "vitest";

import { analyzeJobDescription } from "@/features/analyzer/analyzer";

const SAMPLE_JD = `
Software Engineer (React, TypeScript)
Acme is hiring a Senior Frontend Engineer.

Requirements
- 3+ years of experience building web applications with React and TypeScript.
- Strong knowledge of AWS, Docker and REST APIs.
- Experience with GraphQL is a plus.
- Must have a Bachelor's degree or equivalent.
- AWS Certified Developer preferred.
- Excellent communication skills.

Responsibilities
- Build and maintain responsive user interfaces.
- Collaborate with product and design teams.
- Write unit tests and participate in code reviews.

Nice to have: familiarity with Next.js and Playwright. Fluent in English.
`;

function analyze() {
  return analyzeJobDescription(SAMPLE_JD);
}

function byLabel(result: ReturnType<typeof analyzeJobDescription>) {
  const map = new Map<string, string>();
  for (const req of result.requirements) {
    map.set(req.normalized ?? req.label.toLowerCase(), req.category);
  }
  return map;
}

describe("analyzeJobDescription", () => {
  it("returns nothing for empty input", () => {
    expect(analyzeJobDescription("   ").requirements).toEqual([]);
  });

  it("detects core technologies with aliases", () => {
    const categories = byLabel(analyze());
    expect(categories.get("react")).toBe("technology");
    expect(categories.get("typescript")).toBe("technology");
    expect(categories.get("aws")).toBe("technology");
    expect(categories.get("docker")).toBe("technology");
    expect(categories.get("graphql")).toBe("technology");
  });

  it("detects soft skills", () => {
    const categories = byLabel(analyze());
    expect(categories.get("communication")).toBe("soft_skill");
  });

  it("detects experience years and seniority", () => {
    const result = analyze();
    const labels = result.requirements
      .filter((req) => req.category === "experience")
      .map((req) => req.label.toLowerCase());
    expect(labels.some((label) => label.includes("years"))).toBe(true);
    expect(labels).toContain("senior");
  });

  it("detects education", () => {
    const labels = analyze().requirements
      .filter((req) => req.category === "education")
      .map((req) => req.label.toLowerCase());
    expect(labels.some((label) => label.includes("bachelor"))).toBe(true);
  });

  it("detects certifications", () => {
    const labels = analyze().requirements
      .filter((req) => req.category === "certification")
      .map((req) => req.label);
    expect(labels.some((label) => label.includes("AWS Certified"))).toBe(true);
  });

  it("extracts bullet responsibilities with evidence", () => {
    const labels = analyze().requirements
      .filter((req) => req.category === "responsibility")
      .map((req) => req.label.toLowerCase());
    expect(labels.some((label) => label.includes("responsive user interfaces"))).toBe(true);
  });

  it("marks must-have requirements as must", () => {
    const mustCount = analyze().requirements.filter(
      (req) => req.importance === "must",
    ).length;
    expect(mustCount).toBeGreaterThan(0);
  });

  it("adds evidence snippets to every requirement", () => {
    const result = analyze();
    expect(result.requirements.length).toBeGreaterThan(0);
    for (const req of result.requirements) {
      expect(req.evidence.length).toBeGreaterThan(0);
    }
  });

  it("does not duplicate the same technology", () => {
    const result = analyze();
    const reactCount = result.requirements.filter(
      (req) => (req.normalized ?? req.label.toLowerCase()) === "react",
    ).length;
    expect(reactCount).toBe(1);
  });
});
