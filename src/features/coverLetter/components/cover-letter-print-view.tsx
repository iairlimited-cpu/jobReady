"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RequireAuth } from "@/features/auth/guards";
import { useAuth } from "@/features/auth/auth-context";
import { getApplication } from "@/features/application/api";
import type { JobApplication } from "@/features/application/types";
import { LetterDocument } from "@/features/coverLetter/components/letter-document";
import { describeFirestoreError } from "@/lib/errors";

function LetterPrintBody() {
  const searchParams = useSearchParams();
  const appId = searchParams.get("app");
  const { status, user, configured } = useAuth();
  const authed = status === "authed" && user !== null && configured;

  const { data, error, isLoading } = useSWR<JobApplication | null, Error>(
    authed && appId ? ["letter-application", appId] : null,
    () => getApplication(appId as string),
  );

  if (isLoading || !authed) {
    return <p className="px-6 py-20 text-center text-sm text-muted-foreground">Loading…</p>;
  }
  if (error || !data) {
    return (
      <div className="mx-auto max-w-md px-6 py-16">
        <Alert variant="error">
          {error ? describeFirestoreError(error).message : "That application couldn’t be found."}
        </Alert>
      </div>
    );
  }
  if (!data.coverLetter) {
    return (
      <div className="mx-auto max-w-md px-6 py-16">
        <Alert variant="info">No cover letter saved for this application yet.</Alert>
      </div>
    );
  }

  return (
    <>
      <style>{`@page { size: A4; margin: 16mm; }`}</style>
      <div className="no-print sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3">
          <Link
            href={`/applications/edit?id=${encodeURIComponent(appId as string)}`}
            className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            ← Back to application
          </Link>
          <Button type="button" onClick={() => window.print()}>
            Download PDF
          </Button>
        </div>
      </div>
      <div className="screen-frame bg-muted/60 px-4 py-10 sm:px-6">
        <div className="print-page mx-auto bg-white px-10 py-12 shadow-sm sm:px-14" style={{ maxWidth: 720 }}>
          <LetterDocument data={data.coverLetter} jobTitle={data.title} company={data.company} />
        </div>
      </div>
    </>
  );
}

export function CoverLetterPrintView() {
  return (
    <RequireAuth title="Sign in to download your cover letter">
      <LetterPrintBody />
    </RequireAuth>
  );
}
