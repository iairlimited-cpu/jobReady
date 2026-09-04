import type { Metadata } from "next";

import { GuestResumeView } from "@/features/resume/components/guest-resume-view";

export const metadata: Metadata = {
  title: "CV builder",
  description: "Build a structured CV with a live preview — no account needed.",
};

export default function DraftResumePage() {
  return <GuestResumeView />;
}
