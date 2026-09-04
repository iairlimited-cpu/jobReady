"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextField } from "@/components/ui/text-field";
import { GoogleButton } from "@/features/auth/components/google-button";
import { signInWithGoogle, signUp } from "@/features/auth/api";
import { useAuth } from "@/features/auth/auth-context";
import { AUTH_PATHS, DEFAULT_AUTHED_REDIRECT } from "@/features/auth/config";
import { parseForm, signUpSchema } from "@/features/auth/schemas";
import { describeAuthError } from "@/lib/errors";

export default function SignUpPage() {
  const router = useRouter();
  const { configured } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"email" | "google" | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const parsed = parseForm(signUpSchema, { name, email, password });
    if (!parsed.ok) {
      setFieldErrors(parsed.fieldErrors);
      setFormError(parsed.message);
      return;
    }
    setFieldErrors({});

    setBusy("email");
    signUp(parsed.data)
      .then(() => router.replace(DEFAULT_AUTHED_REDIRECT))
      .catch((error: unknown) => {
        const described = describeAuthError(error);
        if (!described.isCancelled) setFormError(described.message);
      })
      .finally(() => setBusy(null));
  }

  function handleGoogle() {
    setFormError(null);
    setBusy("google");
    signInWithGoogle()
      .then(() => router.replace(DEFAULT_AUTHED_REDIRECT))
      .catch((error: unknown) => {
        const described = describeAuthError(error);
        if (!described.isCancelled) setFormError(described.message);
      })
      .finally(() => setBusy(null));
  }

  return (
    <Card className="p-6 sm:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          No account needed to try the tools — but with one, your work is saved and
          synced across devices.
        </p>
      </div>

      {!configured ? (
        <Alert variant="info" className="mt-5">
          Accounts activate once Firebase keys are added (copy{" "}
          <code>.env.local.example</code> → <code>.env.local</code>).
        </Alert>
      ) : null}
      {formError ? <Alert variant="error" className="mt-5">{formError}</Alert> : null}

      <div className="mt-6 flex flex-col gap-3">
        <GoogleButton onClick={handleGoogle} busy={busy === "google"} />

        <div className="flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <TextField
            label="Name"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            hint="Optional — used to personalize your workspace."
            error={fieldErrors.name}
          />
          <TextField
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={fieldErrors.email}
            required
          />
          <TextField
            label="Password"
            type="password"
            name="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            hint="At least 8 characters."
            error={fieldErrors.password}
            required
          />
          <Button type="submit" disabled={busy !== null} className="w-full">
            {busy === "email" ? "Creating account…" : "Create account"}
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={AUTH_PATHS.signIn}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </Card>
  );
}
