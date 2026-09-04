import type { Metadata } from "next";

import { NotificationsForm } from "@/features/settings/components/notifications-form";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Choose your JOBREADY reminder preferences.",
};

export default function NotificationsSettingsPage() {
  return <NotificationsForm />;
}
