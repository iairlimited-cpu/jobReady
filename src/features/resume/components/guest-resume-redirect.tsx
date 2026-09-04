"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { LinkButton } from "@/components/ui/link-button";

/** Marketing entry for the guest CV builder — routes to the builder. */
export function GuestResumeRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/resumes/draft");
  }, [router]);

  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <p className="text-sm text-muted-foreground">Opening the CV builder…</p>
      <LinkButton href="/resumes/draft" variant="outline">
        Open the CV builder
      </LinkButton>
    </div>
  );
}
