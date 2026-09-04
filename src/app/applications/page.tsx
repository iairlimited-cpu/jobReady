import type { Metadata } from "next";

import { ApplicationList } from "@/features/application/components/application-list";

export const metadata: Metadata = {
  title: "Applications",
  description: "Track your job applications, deadlines and interviews.",
};

export default function ApplicationsPage() {
  return <ApplicationList />;
}
