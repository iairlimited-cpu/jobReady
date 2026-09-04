import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { PageHeader } from "@/app/(marketing)/_components/page-header";
import { GuestResumeRedirect } from "@/features/resume/components/guest-resume-redirect";

export const metadata: Metadata = {
  title: "CV / Resume builder",
  description:
    "Build a structured CV with professional templates and a live preview — free, no account needed to start.",
};

export default function ResumeBuilderToolPage() {
  return (
    <>
      <PageHeader
        eyebrow="Free tool"
        title="CV / Resume builder"
        description="Structured sections, professional templates, live preview — and it’s free to start, no account required."
      />
      <Container>
        <GuestResumeRedirect />
      </Container>
    </>
  );
}
