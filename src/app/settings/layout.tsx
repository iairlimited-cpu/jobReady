import type { ReactNode } from "react";

import { SettingsShell } from "@/features/settings/components/settings-shell";

/** Protected settings area: gate + navigation + content. */
export default function SettingsLayout({ children }: { children: ReactNode }) {
  return <SettingsShell>{children}</SettingsShell>;
}
