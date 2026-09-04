import { describe, expect, it } from "vitest";

import {
  addArrayItem,
  createEmptyResumeData,
  createId,
  moveArrayItem,
  moveSection,
  removeArrayItem,
  sectionHasContent,
  toggleInList,
  toggleSectionIncluded,
  updateArrayItem,
  visibleSections,
} from "@/features/resume/helpers";
import { resumeDataSchema, resumeMetaSchema } from "@/features/resume/schemas";
import type { ResumeData } from "@/features/resume/types";

describe("createEmptyResumeData", () => {
  it("returns a blank but structurally valid document", () => {
    const data = createEmptyResumeData();
    expect(data.personal.fullName).toBe("");
    expect(data.experience).toEqual([]);
    expect(data.preferences.includedSections).toContain("experience");
    expect(resumeDataSchema.safeParse(data).success).toBe(true);
  });
});

describe("createId", () => {
  it("produces ids with the requested prefix", () => {
    expect(createId("exp").startsWith("exp-")).toBe(true);
  });
});

describe("section visibility", () => {
  it("treats empty sections as having no content", () => {
    const data = createEmptyResumeData();
    expect(sectionHasContent(data, "summary")).toBe(false);
    expect(visibleSections(data)).toEqual([]);
  });

  it("treats a filled name as personal content", () => {
    const data = { ...createEmptyResumeData() };
    data.personal.fullName = "Ada";
    expect(sectionHasContent(data, "personal")).toBe(true);
    expect(visibleSections(data)).toContain("personal");
  });

  it("can hide and restore a section", () => {
    const data = { ...createEmptyResumeData() };
    data.experience.push({
      id: "e1",
      role: "Engineer",
      company: "Acme",
      period: undefined,
      bullets: [],
    });
    const hidden = toggleSectionIncluded(data, "experience");
    expect(hidden.preferences.includedSections).not.toContain("experience");
    const restored = toggleSectionIncluded(hidden, "experience");
    expect(restored.preferences.includedSections).toContain("experience");
  });

  it("moves sections within bounds only", () => {
    const data = { ...createEmptyResumeData() };
    const sections = data.preferences.includedSections;
    const first = sections[0];
    const movedDown = moveSection(data, first, 1);
    expect(movedDown.preferences.includedSections[0]).not.toBe(first);
    const atBottom = moveSection(movedDown, sections[sections.length - 1], 1);
    expect(atBottom).toEqual(movedDown);
  });
});

describe("array helpers", () => {
  interface Item {
    id: string;
    name: string;
  }
  const base: Item[] = [
    { id: "a", name: "A" },
    { id: "b", name: "B" },
  ];

  it("adds, updates and removes by id", () => {
    const added = addArrayItem(base, () => ({ id: "c", name: "C" }));
    expect(added).toHaveLength(3);
    const updated = updateArrayItem(added, "b", (item) => ({ ...item, name: "B2" }));
    expect(updated.find((item) => item.id === "b")?.name).toBe("B2");
    const removed = removeArrayItem(updated, "a");
    expect(removed.map((item) => item.id)).toEqual(["b", "c"]);
  });

  it("moves items only within bounds", () => {
    expect(moveArrayItem(base, 0, -1)).toEqual(base);
    expect(moveArrayItem(base, 1, 1)).toEqual(base);
    expect(moveArrayItem(base, 0, 1).map((item) => item.id)).toEqual(["b", "a"]);
  });

  it("toggles membership", () => {
    expect(toggleInList(["a"], "b")).toEqual(["a", "b"]);
    expect(toggleInList(["a", "b"], "a")).toEqual(["b"]);
  });
});

describe("resume schemas", () => {
  it("accepts a realistically filled document", () => {
    const data: ResumeData = {
      ...createEmptyResumeData(),
      personal: {
        fullName: "Ada Lovelace",
        professionalTitle: "Analytical engineer",
        email: "ada@example.com",
        phone: "+1 555 0100",
        location: "London",
        website: "https://example.com",
        linkedin: "https://linkedin.com/in/ada",
      },
      summary: "Mathematician and writer.",
      experience: [
        {
          id: "e1",
          role: "Engineer",
          company: "Analytical Engines Ltd",
          location: "London",
          period: { start: { year: 1842 }, end: { year: 1843 }, present: false },
          bullets: ["Translated and annotated a key paper.", "Designed an algorithm."],
        },
      ],
      skills: ["Mathematics", "Logic"],
    };
    expect(resumeDataSchema.safeParse(data).success).toBe(true);
  });

  it("rejects invalid URLs in personal details", () => {
    const data = createEmptyResumeData();
    data.personal.website = "not-a-url";
    expect(resumeDataSchema.safeParse(data).success).toBe(false);
  });

  it("validates resume metadata", () => {
    expect(
      resumeMetaSchema.safeParse({ name: "Main CV", templateId: "modern", pageSize: "A4" })
        .success,
    ).toBe(true);
    expect(resumeMetaSchema.safeParse({ name: "", templateId: "nope" }).success).toBe(
      false,
    );
  });
});
