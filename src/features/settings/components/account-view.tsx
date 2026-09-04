"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { signOutCurrentUser } from "@/features/auth/api";
import { useAuth } from "@/features/auth/auth-context";
import { SectionCard } from "@/features/settings/components/section-card";
import { useUserProfile } from "@/features/settings/use-user-profile";

export function AccountView() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, isLoading } = useUserProfile();
  const [signingOut, setSigningOut] = useState(false);

  if (!user) return null;

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOutCurrentUser();
    } catch {
      // Ignore — the provider refresh will surface guest state.
    }
    router.push("/");
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionCard
        title="Account"
        description="Your sign-in details are managed by your authentication provider."
      >
        <dl className="flex flex-col gap-4 rounded-md border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <dt className="text-sm text-muted-foreground">Signed in as</dt>
            <dd className="text-sm font-medium text-foreground">{user.email}</dd>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={isLoading ? "neutral" : "primary"}>
              {isLoading ? "Loading plan…" : `${profile?.plan ?? "free"} plan`}
            </Badge>
            <Button variant="outline" size="sm" onClick={handleSignOut} disabled={signingOut}>
              {signingOut ? "Signing out…" : "Sign out"}
            </Button>
          </div>
        </dl>
      </SectionCard>

      <SectionCard
        title="Your data"
        description="Everything you create — CVs, applications, cover letters and notes — belongs to you and stays private."
      >
        <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
          <li>
            • Export of your data for portability is planned (see the privacy policy).
          </li>
          <li>
            • Deleting an account removes your account and your content from our
            systems.
          </li>
        </ul>
        <div>
          <Link
            href="/privacy"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Read the privacy policy
          </Link>
        </div>
      </SectionCard>

      <Card className="border-destructive/40 p-6 sm:p-8">
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-foreground">Delete account</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We make deletion safe and complete: it removes your profile, CVs,
            applications, cover letters, notes and any uploaded documents — and we
            never keep copies for other purposes. Account deletion is performed by
            our secure server process, which is activated when the full service
            launches. Until then, you can delete any individual item at any time.
          </p>
          <Alert variant="info">
            No dark-pattern tricks here: when deletion is available, it’s one clear
            confirmation away — and reversible only by signing up again.
          </Alert>
        </div>
      </Card>
    </div>
  );
}
