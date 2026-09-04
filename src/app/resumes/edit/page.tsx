import type { Metadata } from "next";
import { Suspense } from "react";

import { Loading } from "@/components/ui/loading";
import { ResumeEditView } from "@/features/resume/components/resume-edit-view";

export const metadata: Metadata = {
  title: "Edit CV",
  description: "Edit your CV with a live preview.",
};

export default function EditResumePage() {
  return (
    <Suspense fallback={<Loading label="Loading your CV…" />}>
      <ResumeEditView />
    </Suspense>
  );
}
