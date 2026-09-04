"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Logo } from "@/components/logo";
import { Container } from "@/components/ui/container";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { signOutCurrentUser } from "@/features/auth/api";
import { useAuth } from "@/features/auth/auth-context";
import { AUTH_PATHS } from "@/features/auth/config";

function MenuIcon({ open }: { open: boolean }) {
  return open ? (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="size-6"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="size-6"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function displayInitial(user: {
  displayName?: string | null;
  email?: string | null;
}): string {
  const source = user.displayName || user.email || "?";
  return source.charAt(0).toUpperCase();
}

export function SiteHeader() {
  const router = useRouter();
  const { status, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const isGuest = status === "guest";
  const isAuthed = status === "authed" && user !== null;

  async function handleSignOut() {
    setAccountOpen(false);
    try {
      await signOutCurrentUser();
    } catch {
      // Sign-out is best-effort in the UI; state refresh handles the rest.
    }
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />

        {/* Desktop navigation */}
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-1.5 md:flex">
          {isGuest ? (
            <Link
              href={AUTH_PATHS.signIn}
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Sign in
            </Link>
          ) : null}

          {isAuthed ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen((value) => !value)}
                aria-haspopup="menu"
                aria-expanded={accountOpen}
                className="grid size-9 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
              >
                {displayInitial(user)}
                <span className="sr-only">Account menu</span>
              </button>

              {accountOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-border bg-card p-2 shadow-lg"
                >
                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-medium text-foreground">
                      {user.displayName || "Account"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <Link
                    href="/settings"
                    role="menuitem"
                    onClick={() => setAccountOpen(false)}
                    className="block w-full rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    Settings
                  </Link>
                  <div className="my-1 h-px bg-border" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleSignOut}
                    className="w-full rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    Sign out
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          <Link href={siteConfig.cta.href} className={buttonVariants({ size: "sm" })}>
            {siteConfig.cta.label}
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="grid size-10 place-items-center rounded-md text-foreground transition-colors hover:bg-muted md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <MenuIcon open={open} />
        </button>
      </Container>

      {/* Mobile navigation panel */}
      {open ? (
        <div id="mobile-nav" className="border-t border-border bg-background md:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {siteConfig.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-muted"
              >
                {item.label}
              </Link>
            ))}
            {isGuest ? (
              <Link
                href={AUTH_PATHS.signIn}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-muted"
              >
                Sign in
              </Link>
            ) : null}
            <Link
              href={siteConfig.cta.href}
              onClick={() => setOpen(false)}
              className={buttonVariants({ className: "mt-2" })}
            >
              {siteConfig.cta.label}
            </Link>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
