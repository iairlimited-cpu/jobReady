import { describe, expect, it } from "vitest";

import {
  buildGuidedCoverLetter,
  hasPlaceholders,
  suggestCoverLetterImprovements,
} from "@/features/coverLetter/helpers";
import { coverLetterSchema, DEFAULT_VALUES } from "@/features/coverLetter/schemas";

describe("coverLetterSchema", () => {
  it("accepts the default structure", () => {
    expect(coverLetterSchema.safeParse(DEFAULT_VALUES).success).toBe(true);
  });

  it("rejects over-long paragraphs", () => {
    const tooLong = {
      ...DEFAULT_VALUES,
      opening: "x".repeat(5000),
    };
    expect(coverLetterSchema.safeParse(tooLong).success).toBe(false);
  });
});

describe("buildGuidedCoverLetter", () => {
  it("fills the role and company into the scaffold", () => {
    const letter = buildGuidedCoverLetter({
      jobTitle: "Frontend Engineer",
      company: "Acme",
      applicantName: "Ada",
    });
    expect(letter.opening).toContain("Frontend Engineer");
    expect(letter.opening).toContain("Acme");
    expect(letter.applicantName).toBe("Ada");
  });

  it("leaves honest placeholders for the user to fill", () => {
    const letter = buildGuidedCoverLetter({ jobTitle: "X", company: "Y", applicantName: "" });
    expect(hasPlaceholders(letter)).toBe(true);
  });
});

describe("suggestCoverLetterImprovements", () => {
  it("warns about a missing name", () => {
    const tips = suggestCoverLetterImprovements(DEFAULT_VALUES);
    expect(tips.some((tip) => tip.text.includes("name"))).toBe(true);
  });

  it("flags weak cliché openers", () => {
    const tips = suggestCoverLetterImprovements({
      ...DEFAULT_VALUES,
      applicantName: "Ada",
      opening: "I am writing to apply for this job.",
      experience: "I built dashboards with React and TypeScript for two years at Acme, improving load times for thousands of daily users and cutting report time from an hour to minutes.",
      whyRole: "I admire your product.",
    });
    expect(tips.some((tip) => tip.text.includes("cliché"))).toBe(true);
  });

  it("does not nag for metrics when a real number is present", () => {
    const tips = suggestCoverLetterImprovements({
      ...DEFAULT_VALUES,
      applicantName: "Ada",
      opening: "Your job caught my attention.",
      experience: "Cut page load time by 40% for a site with 50k monthly visitors.",
      whyRole: "The mission resonates with my background.",
    });
    expect(tips.some((tip) => tip.text.includes("measurable result"))).toBe(false);
  });
});
