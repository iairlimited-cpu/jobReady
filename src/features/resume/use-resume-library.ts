"use client";

import { useAuth } from "@/features/auth/auth-context";
import useSWR from "swr";

import { listResumes } from "@/features/resume/api";
import type { ResumeRecord } from "@/features/resume/types";

export function useResumeLibrary() {
  const { status, user, configured } = useAuth();
  const uid = status === "authed" && configured ? (user?.uid ?? null) : null;

  const key: [string, string] | null = uid ? ["resumes", uid] : null;

  const { data, error, isLoading, mutate } = useSWR<ResumeRecord[], Error>(
    key,
    () => listResumes(uid as string),
    { revalidateOnFocus: false },
  );

  return {
    resumes: data ?? [],
    isLoading: Boolean(key) && isLoading,
    isSignedIn: uid !== null,
    error: error ?? null,
    mutate,
  };
}
