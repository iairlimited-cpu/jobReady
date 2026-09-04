"use client";

import Link from "next/link";

import { Alert } from "@/components/ui/alert";
import { useAuth } from "@/features/auth/auth-context";
import { ResumeEditor } from "@/features/resume/components/resume-editor";
import { AppHeader } from "@/components/app-header";
import { useGuestResumeEditor } from "@/features/resume/use-resume-editor";

/** Guest CV builder — fully functional, persisted to this browser. */
export function GuestResumeView() {
  const editor = useGuestResumeEditor();
  const { status } = useAuth();
  const isGuest = status !== "authed";

  return (
    <div className="flex min-h-dvh flex-col bg-muted/30">
      <AppHeader
        right={
          isGuest ? (
            <Link
              href="/auth/signup"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Save to an account
            </Link>
          ) : (
            <Link
              href="/resumes"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Go to my CVs
            </Link>
          )
        }
      />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        <Alert variant="info" className="mb-4">
          {isGuest
            ? "You’re using the guest CV builder — your work is saved automatically in this browser. Creating an account (coming soon) will let you keep it across devices."
            : "This is the guest builder (saved in this browser). Your account CVs live in “My CVs”."}
        </Alert>
        <ResumeEditor editor={editor} printHref="/resumes/print" />
      </main>
    </div>
  );
}
