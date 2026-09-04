import type { Metadata } from "next";

import { CreateApplication } from "@/features/application/components/create-application";

export const metadata: Metadata = {
  title: "New application",
  description: "Create a new job application workspace.",
};

export default function NewApplicationPage() {
  return <CreateApplication />;
}
