"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextField } from "@/components/ui/text-field";
import { sendPasswordReset } from "@/features/auth/api";
import { useAuth } from "@/features/auth/auth-context";
import { AUTH_PATHS } from "@/features/auth/config";
import { parseForm, recoverSchema } from "@/features/auth/schemas";
import { describeAuthError } from "@/lib/errors";

export default function RecoverPage() {
  const { configured } = useAuth();

  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const parsed = parseForm(recoverSchema, { email });
    if (!parsed.ok) {
      setFieldErrors(parsed.fieldErrors);
      setFormError(parsed.message);
      return;
    }
    setFieldErrors({});
    setBusy(true);
    sendPasswordReset(parsed.data)
      .then(() => setSent(true))
      .catch((error: unknown) => {
        const described = describeAuthError(error);
        // Deliberately generic even if the account doesn't exist (no enumeration).
        if (!described.isCancelled) setFormError(described.message);
      })
      .finally(() => setBusy(false));
  }

  if (sent) {
    return (
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Check your inbox
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            If an account exists for that email, we’ve sent a reset link. It can take
            a few minutes to arrive — check your spam folder too.
          </p>
          <div className="mt-2">
            <Link
              href={AUTH_PATHS.signIn}
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Reset your password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter the email on your account and we’ll send you a reset link.
        </p>
      </div>

      {!configured ? (
        <Alert variant="info" className="mt-5">
          Accounts activate once Firebase keys are added (copy{" "}
          <code>.env.local.example</code> → <code>.env.local</code>).
        </Alert>
      ) : null}
      {formError ? <Alert variant="error" className="mt-5">{formError}</Alert> : null}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-6 flex flex-col gap-4"
      >
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
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "Sending…" : "Send reset link"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remembered it?{" "}
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
