import Link from "next/link";
import type { ReactNode } from "react";

import { Logo } from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";

/** Slim app-style header used across the account workspace pages. */
export function AppHeader({ right }: { right?: ReactNode }) {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Logo />
        <div className="flex items-center gap-2">
          {right}
          <Link href="/" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Back to site
          </Link>
        </div>
      </div>
    </header>
  );
}
