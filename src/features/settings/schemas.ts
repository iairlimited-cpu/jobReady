import { z } from "zod";

import { EXPERIENCE_LEVEL_VALUES } from "@/features/settings/types";

const text = (max: number) =>
  z.string().trim().max(max, `Keep this under ${max} characters.`);

export const profileFormSchema = z.object({
  name: text(80),
  professionalTitle: text(120),
  careerField: text(120),
  country: text(60),
  experienceLevel: z
    .enum([...EXPERIENCE_LEVEL_VALUES])
    .or(z.literal(""))
    .default(""),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const preferenceFormSchema = z.object({
  timezone: z.string().min(1, "Choose a time zone."),
  dateFormat: z.string().min(1, "Choose a date format."),
  currency: text(10),
});

export type PreferenceFormValues = z.infer<typeof preferenceFormSchema>;

export const notificationFormSchema = z.object({
  webNotifications: z.boolean(),
  followUpReminders: z.boolean(),
  deadlineAlertsDays: z.coerce
    .number({ message: "Enter a number between 0 and 14." })
    .int()
    .min(0, "Use a number between 0 and 14.")
    .max(14, "Use a number between 0 and 14."),
});

export type NotificationFormValues = z.infer<typeof notificationFormSchema>;

/* Shared parse helper (see src/lib/form.ts). */
export { parseForm } from "@/lib/form";
export type { ParseFailure, ParseSuccess } from "@/lib/form";
