import type { Metadata } from "next";

import { ResumeLibrary } from "@/features/resume/components/resume-library";

export const metadata: Metadata = {
  title: "My CVs",
  description: "Create, edit, duplicate and manage your CVs.",
};

export default function ResumesPage() {
  return <ResumeLibrary />;
}
