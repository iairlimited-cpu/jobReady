import type { Metadata } from "next";

import { AccountView } from "@/features/settings/components/account-view";

export const metadata: Metadata = {
  title: "Account",
  description: "Sign-in details, data controls and account deletion.",
};

export default function AccountSettingsPage() {
  return <AccountView />;
}
