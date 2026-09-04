"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { RequireAuth } from "@/features/auth/guards";
import { ResumeEditor } from "@/features/resume/components/resume-editor";
import { AppHeader } from "@/components/app-header";
import { useCloudResumeEditor } from "@/features/resume/use-resume-editor";

function EditBody() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const editor = useCloudResumeEditor(id);

  if (!id) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-4 px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Which CV do you want to edit?</h1>
        <p className="text-sm text-muted-foreground">
          Open a CV from your library to continue.
        </p>
        <LinkButton href="/resumes">Go to my CVs</LinkButton>
      </div>
    );
  }

  if (editor.isError) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-4 px-4 py-20 text-center">
        <Alert variant="error">{editor.errorMessage}</Alert>
        <Button type="button" variant="outline" onClick={editor.retry}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
      <div className="mb-4">
        <Link
          href="/resumes"
          className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          ← Back to my CVs
        </Link>
      </div>
      <ResumeEditor
        editor={editor}
        printHref={`/resumes/print?id=${encodeURIComponent(id)}`}
      />
    </main>
  );
}

export function ResumeEditView() {
  return (
    <RequireAuth
      title="Sign in to edit your CV"
      description="Your CVs are private to your account."
    >
      <div className="flex min-h-dvh flex-col bg-muted/30">
        <AppHeader />
        <EditBody />
      </div>
    </RequireAuth>
  );
}
