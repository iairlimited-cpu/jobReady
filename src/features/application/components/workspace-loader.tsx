"use client";

import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { ApplicationWorkspace } from "@/features/application/components/application-workspace";

/** Reads the ?id= query param (static-export friendly) and mounts the workspace. */
export function ApplicationWorkspaceLoader() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  if (!id) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-6 py-20 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Which application?</h1>
        <p className="text-sm text-muted-foreground">
          Open an application from your tracker to continue.
        </p>
        <div className="flex gap-3">
          <LinkButton href="/applications">Go to applications</LinkButton>
          <Button type="button" variant="outline" onClick={() => history.back()}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  return <ApplicationWorkspace id={id} />;
}
