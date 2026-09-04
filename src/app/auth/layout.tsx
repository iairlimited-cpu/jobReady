"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { Logo } from "@/components/logo";
import { PublicOnly } from "@/features/auth/guards";

/**
 * Auth screens: centered card, no marketing header/footer.
 * PublicOnly ensures signed-in users are redirected away.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <PublicOnly>
      <div className="flex min-h-dvh flex-col bg-muted/40">
        <header className="border-b border-border bg-background/80 backdrop-blur">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Logo />
            <Link
              href="/"
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Back to home
            </Link>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">{children}</div>
        </main>

        <footer className="border-t border-border bg-background/60">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
            <p>© {new Date().getFullYear()} JOBREADY</p>
            <div className="flex gap-4">
              <Link href="/privacy" className="hover:text-foreground">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-foreground">
                Terms
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </PublicOnly>
  );
}
