"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { RequireAuth } from "@/features/auth/guards";
import { useAuth } from "@/features/auth/auth-context";
import { deleteResume, duplicateResume } from "@/features/resume/api";
import { AppHeader } from "@/components/app-header";
import { useResumeLibrary } from "@/features/resume/use-resume-library";
import { formatDateForUser } from "@/lib/dates";
import { describeFirestoreError } from "@/lib/errors";
import { getTemplateMeta } from "@/config/resume-templates";

function LibraryRow({
  id,
  name,
  templateId,
  updatedAt,
  onDuplicate,
  onDelete,
}: {
  id: string;
  name: string;
  templateId: ReturnType<typeof getTemplateMeta>["id"];
  updatedAt: number;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <Card className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        <p className="truncate font-semibold text-foreground">{name || "Untitled CV"}</p>
        <p className="text-sm text-muted-foreground">
          {getTemplateMeta(templateId).name} · Updated{" "}
          {formatDateForUser(updatedAt)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <LinkButton href={`/resumes/edit?id=${encodeURIComponent(id)}`} size="sm">
          Open
        </LinkButton>
        <LinkButton
          href={`/resumes/print?id=${encodeURIComponent(id)}`}
          target="_blank"
          rel="noopener"
          variant="outline"
          size="sm"
        >
          PDF
        </LinkButton>
        <Button type="button" variant="outline" size="sm" onClick={onDuplicate}>
          Duplicate
        </Button>
        {confirming ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-destructive"
            onClick={() => {
              setConfirming(false);
              onDelete();
            }}
          >
            Confirm delete
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive"
            onClick={() => setConfirming(true)}
            onBlur={() => setConfirming(false)}
          >
            Delete
          </Button>
        )}
      </div>
    </Card>
  );
}

export function ResumeLibrary() {
  const router = useRouter();
  const { user } = useAuth();
  const { resumes, isLoading, error, mutate } = useResumeLibrary();
  const [actionError, setActionError] = useState<string | null>(null);

  const uid = user?.uid;

  async function handleDuplicate(id: string) {
    if (!uid) return;
    setActionError(null);
    const source = resumes.find((resume) => resume.id === id);
    if (!source) return;
    try {
      await duplicateResume({ uid, source });
      await mutate();
    } catch (duplicateError) {
      setActionError(describeFirestoreError(duplicateError).message);
    }
  }

  async function handleDelete(id: string) {
    if (!uid) return;
    setActionError(null);
    try {
      await deleteResume(id);
      await mutate();
    } catch (deleteError) {
      setActionError(describeFirestoreError(deleteError).message);
    }
  }

  return (
    <RequireAuth
      title="Sign in to see your CVs"
      description="Your CVs are private to your account."
    >
      <div className="flex min-h-dvh flex-col bg-muted/30">
        <AppHeader
          right={
            <>
              <LinkButton href="/resumes/draft" variant="ghost" size="sm">
                Guest builder
              </LinkButton>
              <LinkButton href="/resumes/new" size="sm">
                Create CV
              </LinkButton>
            </>
          }
        />
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Your CVs
            </h1>
            <Button type="button" variant="outline" size="sm" onClick={() => router.push("/settings")}>
              Settings
            </Button>
          </div>

          {actionError ? <Alert variant="error" className="mt-4">{actionError}</Alert> : null}
          {error ? <Alert variant="error" className="mt-4">Couldn’t load your CVs.</Alert> : null}

          <div className="mt-6 flex flex-col gap-3">
            {isLoading ? (
              <div aria-busy="true" className="h-24 animate-pulse rounded-lg bg-muted" />
            ) : null}
            {!isLoading && resumes.length === 0 ? (
              <Card className="flex flex-col items-center gap-3 p-10 text-center">
                <p className="font-semibold text-foreground">You don’t have a CV yet.</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Create your first CV, pick a template and build it section by
                  section with a live preview.
                </p>
                <LinkButton href="/resumes/new">Create a CV</LinkButton>
              </Card>
            ) : null}
            {resumes.map((resume) => (
              <LibraryRow
                key={resume.id}
                id={resume.id}
                name={resume.name}
                templateId={resume.templateId}
                updatedAt={resume.updatedAt}
                onDuplicate={() => handleDuplicate(resume.id)}
                onDelete={() => handleDelete(resume.id)}
              />
            ))}
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Want to try without an account?{" "}
            <Link href="/resumes/draft" className="font-medium text-primary underline-offset-4 hover:underline">
              Open the guest CV builder
            </Link>{" "}
            (saved in this browser).
          </p>
        </main>
      </div>
    </RequireAuth>
  );
}
