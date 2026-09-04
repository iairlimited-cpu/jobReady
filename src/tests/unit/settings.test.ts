import { describe, expect, it } from "vitest";

import {
  notificationFormSchema,
  parseForm,
  preferenceFormSchema,
  profileFormSchema,
} from "@/features/settings/schemas";

describe("profileFormSchema", () => {
  it("accepts valid profile values and trims text", () => {
    const result = profileFormSchema.safeParse({
      name: "  Ada Lovelace  ",
      professionalTitle: "Frontend developer",
      careerField: "Software",
      country: "Kenya",
      experienceLevel: "senior",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Ada Lovelace");
      expect(result.data.experienceLevel).toBe("senior");
    }
  });

  it("allows an unset experience level", () => {
    const result = profileFormSchema.safeParse({
      name: "Ada",
      professionalTitle: "",
      careerField: "",
      country: "",
      experienceLevel: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown experience level", () => {
    const result = profileFormSchema.safeParse({
      name: "Ada",
      experienceLevel: "rockstar",
    });
    expect(result.success).toBe(false);
  });

  it("rejects over-long names with an actionable message", () => {
    const parsed = parseForm(profileFormSchema, {
      name: "x".repeat(200),
      experienceLevel: "",
    });
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.fieldErrors.name).toBeTruthy();
    }
  });
});

describe("preferenceFormSchema", () => {
  it("requires a time zone", () => {
    const result = preferenceFormSchema.safeParse({
      timezone: "",
      dateFormat: "d MMM yyyy",
      currency: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a valid set of preferences", () => {
    const result = preferenceFormSchema.safeParse({
      timezone: "Africa/Nairobi",
      dateFormat: "yyyy-MM-dd",
      currency: "KES",
    });
    expect(result.success).toBe(true);
  });
});

describe("notificationFormSchema", () => {
  it("coerces the numeric days field from a string input", () => {
    const result = notificationFormSchema.safeParse({
      webNotifications: false,
      followUpReminders: true,
      deadlineAlertsDays: "5",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.deadlineAlertsDays).toBe(5);
    }
  });

  it("rejects values above the 14 day cap", () => {
    const result = notificationFormSchema.safeParse({
      webNotifications: false,
      followUpReminders: true,
      deadlineAlertsDays: "30",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative values", () => {
    const result = notificationFormSchema.safeParse({
      webNotifications: false,
      followUpReminders: true,
      deadlineAlertsDays: "-2",
    });
    expect(result.success).toBe(false);
  });
});
