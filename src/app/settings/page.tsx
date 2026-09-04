import type { Metadata } from "next";

import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your JOBREADY profile, preferences, notifications and account.",
};

const sections = [
  {
    href: "/settings/profile",
    title: "Profile",
    text: "Your name, title, experience level and country — used to personalize your workspace and pre-fill CVs.",
  },
  {
    href: "/settings/preferences",
    title: "Preferences",
    text: "Time zone, date format and currency. Dates are never shown in ambiguous formats.",
  },
  {
    href: "/settings/notifications",
    title: "Notifications",
    text: "Choose which reminders you see and how far ahead of deadlines they appear.",
  },
  {
    href: "/settings/account",
    title: "Account",
    text: "Your sign-in details, plan, data controls and account deletion.",
  },
];

export default function SettingsOverviewPage() {
  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Everything here is private to your account and only ever used to make your
        workspace clearer — never sold, never published.
      </p>
      <div className="grid gap-6 sm:grid-cols-2">
        {sections.map((section) => (
          <LinkButton
            key={section.href}
            href={section.href}
            variant="ghost"
            className="h-auto w-full flex-col items-start gap-3 whitespace-normal rounded-lg border border-border bg-card p-6 text-left hover:border-primary/40 hover:bg-card"
          >
            <span className="text-lg font-semibold text-foreground">{section.title}</span>
            <span className="text-sm leading-relaxed text-muted-foreground">
              {section.text}
            </span>
          </LinkButton>
        ))}
      </div>
      <Card className="p-6">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Need the quick tour? Visit{" "}
          <LinkButton href="/#workflow" variant="link" className="h-auto p-0">
            how the JOBREADY workflow works
          </LinkButton>{" "}
          to see where profiles, CVs and applications fit together.
        </p>
      </Card>
    </div>
  );
}
