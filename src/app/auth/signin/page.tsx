"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextField } from "@/components/ui/text-field";
import { GoogleButton } from "@/features/auth/components/google-button";
import { signIn, signInWithGoogle } from "@/features/auth/api";
import { useAuth } from "@/features/auth/auth-context";
import { AUTH_PATHS, DEFAULT_AUTHED_REDIRECT } from "@/features/auth/config";
import { parseForm, signInSchema } from "@/features/auth/schemas";
import { describeAuthError } from "@/lib/errors";

export default function SignInPage() {
  const router = useRouter();
  const { configured } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"email" | "google" | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const parsed = parseForm(signInSchema, { email, password });
    if (!parsed.ok) {
      setFieldErrors(parsed.fieldErrors);
      setFormError(parsed.message);
      return;
    }
    setFieldErrors({});

    setBusy("email");
    signIn(parsed.data)
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
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to keep your CVs and applications in sync.
        </p>
      </div>

      {!configured ? (
        <Alert variant="info" className="mt-5">
          Accounts activate once Firebase keys are added (copy{" "}
          <code>.env.local.example</code> → <code>.env.local</code>). Everything else
          works without an account.
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
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={fieldErrors.password}
            required
          />
          <div className="flex items-center justify-between">
            <Button type="submit" disabled={busy !== null}>
              {busy === "email" ? "Signing in…" : "Sign in"}
            </Button>
            <Link
              href={AUTH_PATHS.recover}
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to JOBREADY?{" "}
        <Link
          href={AUTH_PATHS.signUp}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </Card>
  );
}
