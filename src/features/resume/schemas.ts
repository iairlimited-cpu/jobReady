import { z } from "zod";

import { PAGE_SIZES, TEMPLATE_IDS, type ResumeData } from "@/features/resume/types";

/**
 * Resume validation (Zod v4). Keeps docs bounded and inputs clean.
 * Optional text/urls accept empty strings.
 */

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters.`);

const optionalUrl = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `That link is too long (max ${max} characters).`)
    .refine(
      (value) => value === "" || /^https?:\/\/.+/i.test(value),
      "Enter a full link starting with http:// or https://",
    );

const optionalEmail = (max: number) =>
  z
    .string()
    .trim()
    .max(max, "That email is too long.")
    .refine(
      (value) => value === "" || /.+@.+\..+/i.test(value),
      "Enter a valid email address.",
    );

const monthYear = z
  .object({
    month: z.number().int().min(1).max(12).optional(),
    year: z.number().int().min(1800).max(2100).optional(),
  })
  .optional();

const period = z
  .object({
    start: monthYear,
    end: monthYear,
    present: z.boolean().optional(),
  })
  .optional();

const bulletList = z.array(z.string().trim().max(500, "Keep bullet points under 500 characters.")).max(30);

export const resumeDataSchema = z.object({
  personal: z.object({
    fullName: optionalText(120),
    professionalTitle: optionalText(120),
    email: optionalEmail(120),
    phone: optionalText(40),
    location: optionalText(120),
    website: optionalUrl(200),
    linkedin: optionalUrl(200),
  }),
  summary: optionalText(2000),
  experience: z
    .array(
      z.object({
        id: z.string().min(1),
        role: optionalText(120),
        company: optionalText(120),
        location: optionalText(120).optional(),
        period,
        bullets: bulletList,
      }),
    )
    .max(40),
  education: z
    .array(
      z.object({
        id: z.string().min(1),
        school: optionalText(160),
        degree: optionalText(160),
        field: optionalText(160).optional(),
        location: optionalText(120).optional(),
        period,
      }),
    )
    .max(40),
  skills: z.array(z.string().trim().max(60)).max(100),
  projects: z
    .array(
      z.object({
        id: z.string().min(1),
        name: optionalText(160),
        link: optionalUrl(300).optional(),
        bullets: bulletList,
      }),
    )
    .max(30),
  certifications: z
    .array(
      z.object({
        id: z.string().min(1),
        name: optionalText(200),
        issuer: optionalText(160).optional(),
        year: z.number().int().min(1900).max(2100).optional(),
      }),
    )
    .max(40),
  languages: z
    .array(
      z.object({
        id: z.string().min(1),
        name: optionalText(60),
        level: optionalText(60).optional(),
      }),
    )
    .max(30),
  awards: z
    .array(
      z.object({
        id: z.string().min(1),
        title: optionalText(200),
        issuer: optionalText(160).optional(),
        year: z.number().int().min(1900).max(2100).optional(),
      }),
    )
    .max(30),
  volunteer: z
    .array(
      z.object({
        id: z.string().min(1),
        role: optionalText(120),
        organization: optionalText(120),
        period,
        bullets: bulletList,
      }),
    )
    .max(30),
  customSections: z
    .array(
      z.object({
        id: z.string().min(1),
        title: optionalText(120),
        entries: z.array(z.string().trim().max(800)).max(40),
      }),
    )
    .max(10),
  preferences: z.object({
    includedSections: z.array(z.string()),
  }),
});

export type ResumeDataInput = z.infer<typeof resumeDataSchema>;

export function validateResumeData(data: ResumeData): boolean {
  return resumeDataSchema.safeParse(data).success;
}

/** Client-safe, strict parse used before persisting an editor document. */
export function parseResumeData(data: ResumeData) {
  return resumeDataSchema.safeParse(data);
}

export const resumeMetaSchema = z.object({
  name: z.string().trim().min(1, "Give your CV a name.").max(120),
  templateId: z.enum(TEMPLATE_IDS),
  pageSize: z.enum(PAGE_SIZES).default("A4"),
});
