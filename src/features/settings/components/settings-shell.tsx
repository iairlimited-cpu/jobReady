"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { Logo } from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";
import { RequireAuth } from "@/features/auth/guards";
import { cn } from "@/lib/cn";

const settingsNav: { href: string; label: string; exact?: boolean }[] = [
  { href: "/settings", label: "Overview", exact: true },
  { href: "/settings/profile", label: "Profile" },
  { href: "/settings/preferences", label: "Preferences" },
  { href: "/settings/notifications", label: "Notifications" },
  { href: "/settings/account", label: "Account" },
];

export function SettingsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <RequireAuth
      title="Sign in to manage your profile"
      description="Your profile, preferences and account settings are private to you."
    >
      <div className="flex min-h-dvh flex-col bg-muted/30">
        <header className="border-b border-border bg-background/80 backdrop-blur">
          <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
            <Logo />
            <Link href="/" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              Back to site
            </Link>
          </div>
        </header>

        <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>

          <nav
            aria-label="Settings sections"
            className="mt-6 flex gap-1 overflow-x-auto border-b border-border"
          >
            {settingsNav.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </RequireAuth>
  );
}
