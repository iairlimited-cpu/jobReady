"use client";

import { useCallback } from "react";
import useSWR from "swr";

import { useAuth } from "@/features/auth/auth-context";
import { getOrCreateUserProfile, updateUserProfile, type ProfileSave } from "@/features/settings/api";
import type { UserProfile } from "@/features/settings/types";

/**
 * SWR-backed profile accessor for signed-in users.
 * When the user is a guest (or Firebase is unconfigured) this returns
 * isSignedIn:false and never touches Firestore.
 */
export function useUserProfile() {
  const { status, user, configured } = useAuth();
  const uid = status === "authed" && configured ? (user?.uid ?? null) : null;

  const key: [string, string] | null = uid ? ["user-profile", uid] : null;

  const { data, error, isLoading, mutate } = useSWR<UserProfile | null, Error>(
    key,
    () => getOrCreateUserProfile(user as NonNullable<typeof user>),
    { revalidateOnFocus: false, dedupingInterval: 30_000 },
  );

  const save = useCallback(
    async (saveInput: ProfileSave) => {
      if (!uid) throw new Error("Not signed in.");
      await updateUserProfile(uid, saveInput);
      await mutate();
    },
    [uid, mutate],
  );

  return {
    profile: data ?? null,
    error: error ?? null,
    isLoading,
    isSignedIn: uid !== null,
    save,
  };
}
