import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { PageHeader } from "@/app/(marketing)/_components/page-header";
import { JobAnalyzerTool } from "@/features/analyzer/components/job-analyzer-tool";

export const metadata: Metadata = {
  title: "Job description analyzer",
  description:
    "Paste any job description and see the skills, technologies, qualifications and responsibilities it asks for — free, private, in your browser.",
};

export default function JobAnalyzerToolPage() {
  return (
    <>
      <PageHeader
        eyebrow="Free tool"
        title="Job description analyzer"
        description="Paste any job description and instantly see what the employer is asking for — grouped, prioritized, and backed by the exact wording it found."
      />
      <Container className="py-12">
        <JobAnalyzerTool />
      </Container>
    </>
  );
}
