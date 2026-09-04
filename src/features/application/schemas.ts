import { z } from "zod";

import { EMPLOYMENT_TYPES } from "@/features/application/types";

const optionalText = (max: number) => z.string().trim().max(max, `Keep this under ${max} characters.`);
const optionalUrl = (max: number) =>
  z
    .string()
    .trim()
    .max(max, "That link is too long.")
    .refine(
      (value) => value === "" || /^https?:\/\/.+/i.test(value),
      "Enter a full link starting with http:// or https://",
    );

/** Form used when creating an application (and editing basic details). */
export const applicationDetailsSchema = z.object({
  title: z.string().trim().min(1, "Enter the job title.").max(200),
  company: z.string().trim().min(1, "Enter the company name.").max(200),
  url: optionalUrl(2000),
  location: optionalText(200),
  employmentType: z.enum(EMPLOYMENT_TYPES).optional(),
  salary: optionalText(80),
  deadlineDate: z.string().optional(),
  jobDescription: optionalText(20000),
});

export type ApplicationDetailsValues = z.infer<typeof applicationDetailsSchema>;

export const noteSchema = z.object({
  text: z.string().trim().min(1, "Write something first.").max(2000),
});

export type NoteValues = z.infer<typeof noteSchema>;

export const appliedFlowSchema = z.object({
  appliedDate: z.string().min(1, "Enter the date you applied."),
  method: z.string().trim().min(1, "Choose how you applied."),
});

export type AppliedFlowValues = z.infer<typeof appliedFlowSchema>;
