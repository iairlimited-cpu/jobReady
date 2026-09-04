import type { Metadata } from "next";

import { PreferencesForm } from "@/features/settings/components/preferences-form";

export const metadata: Metadata = {
  title: "Preferences",
  description: "Time zone, date format and currency preferences.",
};

export default function PreferencesSettingsPage() {
  return <PreferencesForm />;
}
