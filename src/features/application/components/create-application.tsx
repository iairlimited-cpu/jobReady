"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AppHeader } from "@/components/app-header";
import { RequireAuth } from "@/features/auth/guards";
import { useAuth } from "@/features/auth/auth-context";
import { createApplication } from "@/features/application/api";
import { ApplicationFormFields } from "@/features/application/components/application-form-fields";
import { applicationDetailsSchema } from "@/features/application/schemas";
import type { ApplicationDetailsValues } from "@/features/application/schemas";
import { parseForm } from "@/lib/form";
import { describeFirestoreError } from "@/lib/errors";

const EMPTY_VALUES: ApplicationDetailsValues = {
  title: "",
  company: "",
  url: "",
  location: "",
  employmentType: undefined,
  salary: "",
  deadlineDate: "",
  jobDescription: "",
};

export function CreateApplication() {
  const router = useRouter();
  const { user } = useAuth();
  const [values, setValues] = useState<ApplicationDetailsValues>(EMPTY_VALUES);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    const parsed = parseForm(applicationDetailsSchema, values);
    if (!parsed.ok) {
      setFieldErrors(parsed.fieldErrors);
      setFormError(parsed.message);
      return;
    }
    setFieldErrors({});
    setFormError(null);
    setBusy(true);
    try {
      const id = await createApplication(user.uid, parsed.data);
      router.push(`/applications/edit?id=${encodeURIComponent(id)}`);
    } catch (createError) {
      setFormError(describeFirestoreError(createError).message);
      setBusy(false);
    }
  }

  return (
    <RequireAuth title="Sign in to create an application">
      <div className="flex min-h-dvh flex-col bg-muted/30">
        <AppHeader />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            New application
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add the job you found. You can paste the whole description — later builds
            will analyze it for you.
          </p>
          <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-6">
            {formError ? <Alert variant="error">{formError}</Alert> : null}
            <Card className="p-6">
              <ApplicationFormFields
                values={values}
                errors={fieldErrors}
                onChange={(patch) => {
                  setValues((current) => ({ ...current, ...patch }));
                  setFormError(null);
                }}
              />
            </Card>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/applications")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? "Creating…" : "Create application"}
              </Button>
            </div>
          </form>
        </main>
      </div>
    </RequireAuth>
  );
}
