import { z } from "zod";

import { EMPTY_COVER_LETTER } from "@/features/coverLetter/types";

const paragraph = (max: number) => z.string().trim().max(max, `Keep this under ${max} characters.`);

export const coverLetterSchema = z.object({
  applicantName: z.string().trim().max(120),
  recipient: z.string().trim().max(200),
  salutation: z.string().trim().max(200),
  opening: paragraph(4000),
  experience: paragraph(6000),
  whyRole: paragraph(4000),
  closingSalutation: z.string().trim().max(200),
});

export type CoverLetterValues = z.infer<typeof coverLetterSchema>;

export const DEFAULT_VALUES: CoverLetterValues = { ...EMPTY_COVER_LETTER };
