"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextField } from "@/components/ui/text-field";
import { RequireAuth } from "@/features/auth/guards";
import { useAuth } from "@/features/auth/auth-context";
import { createResume } from "@/features/resume/api";
import { AppHeader } from "@/components/app-header";
import { describeFirestoreError } from "@/lib/errors";
import { RESUME_TEMPLATES } from "@/config/resume-templates";
import type { TemplateId } from "@/features/resume/types";
import { cn } from "@/lib/cn";

export function CreateResume() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState<TemplateId>("minimal");
  const [nameError, setNameError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    const cleanName = name.trim();
    if (!cleanName) {
      setNameError("Give your CV a name so you can tell versions apart.");
      return;
    }
    setNameError(null);
    setError(null);
    setBusy(true);
    try {
      const id = await createResume({
        uid: user.uid,
        name: cleanName,
        templateId,
      });
      router.push(`/resumes/edit?id=${encodeURIComponent(id)}`);
    } catch (createError) {
      setError(describeFirestoreError(createError).message);
      setBusy(false);
    }
  }

  return (
    <RequireAuth title="Sign in to save a CV">
      <div className="flex min-h-dvh flex-col bg-muted/30">
        <AppHeader />
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Create your CV
          </h1>
          <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-6">
            {error ? <Alert variant="error">{error}</Alert> : null}
            <Card className="p-6">
              <TextField
                label="CV name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  if (nameError) setNameError(null);
                }}
                error={nameError ?? undefined}
                placeholder="e.g. Software Engineer CV"
                autoFocus
                required
              />
            </Card>

            <fieldset>
              <legend className="text-sm font-medium text-foreground">
                Choose a template
              </legend>
              <p className="mt-1 text-sm text-muted-foreground">
                You can switch templates any time — your content is never lost.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {RESUME_TEMPLATES.map((template) => (
                  <button
                    type="button"
                    key={template.id}
                    onClick={() => setTemplateId(template.id)}
                    aria-pressed={templateId === template.id}
                    className={cn(
                      "rounded-lg border bg-card p-4 text-left transition-colors",
                      templateId === template.id
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border hover:border-primary/40",
                    )}
                  >
                    <span className="block font-semibold text-foreground">
                      {template.name}
                    </span>
                    <span className="mt-0.5 block text-xs font-medium text-primary-soft-foreground/70">
                      {template.category}
                    </span>
                    <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">
                      {template.description}
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.push("/resumes")}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? "Creating…" : "Create CV"}
              </Button>
            </div>
          </form>
        </main>
      </div>
    </RequireAuth>
  );
}
