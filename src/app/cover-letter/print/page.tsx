import type { Metadata } from "next";
import { Suspense } from "react";

import { Loading } from "@/components/ui/loading";
import { CoverLetterPrintView } from "@/features/coverLetter/components/cover-letter-print-view";

export const metadata: Metadata = {
  title: "Cover letter (PDF)",
  description: "Download your cover letter as a PDF.",
};

export default function CoverLetterPrintPage() {
  return (
    <Suspense fallback={<Loading label="Preparing your cover letter…" />}>
      <CoverLetterPrintView />
    </Suspense>
  );
}
