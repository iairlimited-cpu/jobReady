import { describe, expect, it } from "vitest";

import { describeAuthError } from "@/lib/errors";
import {
  parseForm,
  recoverSchema,
  signInSchema,
  signUpSchema,
} from "@/features/auth/schemas";

describe("signInSchema", () => {
  it("accepts valid credentials and normalizes the email", () => {
    const result = signInSchema.safeParse({
      email: "  Ada@Example.COM ",
      password: "correct-horse",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("ada@example.com");
    }
  });

  it("rejects an invalid email with a field error", () => {
    const result = signInSchema.safeParse({ email: "not-an-email", password: "x" });
    expect(result.success).toBe(false);
  });

  it("requires a password", () => {
    const result = signInSchema.safeParse({ email: "ada@example.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("signUpSchema", () => {
  it("accepts valid details", () => {
    const result = signUpSchema.safeParse({
      name: "Ada",
      email: "Ada@Example.com",
      password: "a-strong-password",
    });
    expect(result.success).toBe(true);
  });

  it("turns a blank name into undefined", () => {
    const result = signUpSchema.safeParse({
      name: "   ",
      email: "ada@example.com",
      password: "a-strong-password",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBeUndefined();
  });

  it("rejects short passwords with an actionable message", () => {
    const result = signUpSchema.safeParse({
      email: "ada@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });
});

describe("recoverSchema", () => {
  it("accepts a valid email", () => {
    expect(recoverSchema.safeParse({ email: "ada@example.com" }).success).toBe(true);
  });
});

describe("parseForm", () => {
  it("returns field errors keyed by path", () => {
    const parsed = parseForm(signInSchema, { email: "nope", password: "" });
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.fieldErrors.email).toBeTruthy();
      expect(parsed.fieldErrors.password).toBeTruthy();
    }
  });

  it("returns data on success", () => {
    const parsed = parseForm(signInSchema, {
      email: "ada@example.com",
      password: "pw",
    });
    expect(parsed.ok).toBe(true);
  });
});

describe("describeAuthError", () => {
  it("maps known Firebase codes to human copy", () => {
    expect(
      describeAuthError({ code: "auth/email-already-in-use" }).message,
    ).toContain("already exists");
  });

  it("avoids account enumeration for wrong credentials", () => {
    const a = describeAuthError({ code: "auth/user-not-found" });
    const b = describeAuthError({ code: "auth/wrong-password" });
    expect(a.message).toBe(b.message);
  });

  it("flags user-cancelled popups so the UI can stay silent", () => {
    const described = describeAuthError({ code: "auth/popup-closed-by-user" });
    expect(described.isCancelled).toBe(true);
  });

  it("explains when Firebase is not configured", () => {
    const described = describeAuthError({ code: "AUTH_CONFIG_MISSING" });
    expect(described.message).toContain("Firebase");
  });

  it("has a friendly fallback for unknown errors", () => {
    const described = describeAuthError(new Error("boom"));
    expect(described.message).toContain("try again");
  });
});
