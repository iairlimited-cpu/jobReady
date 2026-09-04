import type { Metadata } from "next";
import { Suspense } from "react";

import { Loading } from "@/components/ui/loading";
import { ResumePrintView } from "@/features/resume/components/resume-print-view";

export const metadata: Metadata = {
  title: "Download CV (PDF)",
  description: "Print your CV to PDF at exact page size.",
};

export default function PrintResumePage() {
  return (
    <Suspense fallback={<Loading label="Preparing your CV…" />}>
      <ResumePrintView />
    </Suspense>
  );
}
