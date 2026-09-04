import { z } from "zod";

/** Shared form parsing helper — returns field-keyed errors for UI forms. */

export interface ParseSuccess<T> {
  ok: true;
  data: T;
}

export interface ParseFailure {
  ok: false;
  /** Keyed by field path; "_" holds a form-level message when no field matches. */
  fieldErrors: Record<string, string>;
  message: string;
}

export function parseForm<T>(
  schema: z.ZodType<T>,
  values: unknown,
): ParseSuccess<T> | ParseFailure {
  const result = schema.safeParse(values);

  if (result.success) {
    return { ok: true, data: result.data };
  }

  const fieldErrors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.length > 0 ? issue.path.join(".") : "_";
    if (!(key in fieldErrors)) fieldErrors[key] = issue.message;
  }

  return {
    ok: false,
    fieldErrors,
    message:
      Object.values(fieldErrors)[0] ?? "Please fix the highlighted fields and try again.",
  };
}
