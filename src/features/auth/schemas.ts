import { z } from "zod";

/**
 * Auth form schemas (Zod v4). Field messages are user-facing copy.
 * NOTE: emails are normalized (trimmed + lowercased) so stored data is
 * consistent and lookups are unambiguous.
 */
const emailSchema = z
  .string()
  .transform((value) => value.trim().toLowerCase())
  .pipe(z.email("Enter a valid email address."));

const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(200, "That password is too long.");

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
});

export const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .max(80, "That name is too long.")
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  email: emailSchema,
  password: passwordSchema,
});

export const recoverSchema = z.object({
  email: emailSchema,
});

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type RecoverValues = z.infer<typeof recoverSchema>;

/* ------------------------------------------------------------------ */
/* Parse helper — shared in src/lib/form.ts                            */
/* ------------------------------------------------------------------ */

export { parseForm } from "@/lib/form";
export type { ParseFailure, ParseSuccess } from "@/lib/form";
