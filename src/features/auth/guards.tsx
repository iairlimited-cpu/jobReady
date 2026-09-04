"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { Loading } from "@/components/ui/loading";
import { LinkButton } from "@/components/ui/link-button";
import { useAuth } from "@/features/auth/auth-context";
import { AUTH_PATHS, DEFAULT_AUTHED_REDIRECT } from "@/features/auth/config";

/**
 * PublicOnly — for guest pages (auth screens): redirects signed-in users
 * away and shows a loading state while auth state is being resolved so
 * there is never a flash of the wrong UI.
 */
export function PublicOnly({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authed") {
      router.replace(DEFAULT_AUTHED_REDIRECT);
    }
  }, [status, router]);

  if (status === "loading") return <Loading label="Checking your session…" />;
  if (status === "authed") return null;
  return <>{children}</>;
}

/**
 * RequireAuth — for protected pages: shows a friendly sign-in gate for
 * guests. (Applied from Phase 4 onwards; Firestore rules are the real gate.)
 */
export function RequireAuth({
  children,
  title = "Sign in to continue",
  description = "Your CVs, applications and documents are private to your account.",
}: {
  children: ReactNode;
  title?: string;
  description?: string;
}) {
  const { status } = useAuth();

  if (status === "loading") return <Loading label="Checking your session…" />;

  if (status === "guest") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="flex max-w-md flex-col items-center gap-4 rounded-lg border border-border bg-card p-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
          <LinkButton href={AUTH_PATHS.signIn}>Sign in</LinkButton>
          <p className="text-sm text-muted-foreground">
            New here?{" "}
            <Link
              href={AUTH_PATHS.signUp}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
