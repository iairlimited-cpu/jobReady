import type { Metadata } from "next";

import { CreateResume } from "@/features/resume/components/create-resume";

export const metadata: Metadata = {
  title: "Create a CV",
  description: "Create a new CV — pick a template and start building.",
};

export default function NewResumePage() {
  return <CreateResume />;
}
