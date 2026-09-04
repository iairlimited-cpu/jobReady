import type { Metadata } from "next";
import { Suspense } from "react";

import { Loading } from "@/components/ui/loading";
import { ApplicationWorkspaceLoader } from "@/features/application/components/workspace-loader";

export const metadata: Metadata = {
  title: "Application",
  description: "Your job application workspace.",
};

export default function EditApplicationPage() {
  return (
    <Suspense fallback={<Loading label="Loading application…" />}>
      <ApplicationWorkspaceLoader />
    </Suspense>
  );
}
