"use client";

import { useAuth } from "@/features/auth/auth-context";
import useSWR from "swr";

import { listApplications } from "@/features/application/api";
import { deriveStatistics } from "@/features/application/helpers";
import type { JobApplication } from "@/features/application/types";

export function useApplications() {
  const { status, user, configured } = useAuth();
  const uid = status === "authed" && configured ? (user?.uid ?? null) : null;

  const key: [string, string] | null = uid ? ["applications", uid] : null;

  const { data, error, isLoading, mutate } = useSWR<JobApplication[], Error>(
    key,
    () => listApplications(uid as string),
    { revalidateOnFocus: false },
  );

  const applications = data ?? [];
  return {
    applications,
    stats: deriveStatistics(applications),
    isLoading: Boolean(key) && isLoading,
    isSignedIn: uid !== null,
    error: error ?? null,
    mutate,
  };
}
