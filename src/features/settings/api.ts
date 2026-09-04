/**
 * users/{uid} data access — the only place that reads/writes the profile
 * document. Firestore Security Rules enforce owner-only access.
 */
import type { User } from "firebase/auth";
import {
  Timestamp,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentSnapshot,
} from "firebase/firestore";

import { DEFAULT_DATE_FORMAT, defaultTimeZone } from "@/lib/dates";
import { getFirestoreDb } from "@/lib/firebase/client";
import {
  DEFAULT_NOTIFICATION_PREFS,
  type NotificationPrefs,
  type UserProfile,
} from "@/features/settings/types";

function profileRef(uid: string) {
  const db = getFirestoreDb();
  if (!db) return null;
  return doc(db, "users", uid);
}

function configError(): Error {
  const error = new Error("Firestore is not configured.");
  (error as { code?: string }).code = "FIREBASE_CONFIG_MISSING";
  return error;
}

function toMillis(value: unknown): number | undefined {
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value === "number") return value;
  return undefined;
}

function profileFromSnapshot(snapshot: DocumentSnapshot): UserProfile {
  const data = snapshot.data();
  if (!data) throw new Error("Profile document is empty.");

  return {
    email: data.email ?? "",
    name: data.name ?? "",
    professionalTitle: data.professionalTitle ?? "",
    careerField: data.careerField ?? "",
    country: data.country ?? "",
    experienceLevel: data.experienceLevel ?? "",
    timezone: data.timezone ?? defaultTimeZone(),
    dateFormat: data.dateFormat ?? DEFAULT_DATE_FORMAT,
    currency: data.currency ?? "",
    plan: data.plan === "pro" ? "pro" : "free",
    notificationPrefs: {
      ...DEFAULT_NOTIFICATION_PREFS,
      ...(data.notificationPrefs ?? {}),
    },
    onboarded: { profile: data.onboarded?.profile === true },
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
  };
}

function defaultProfile(
  user: Pick<User, "uid" | "email" | "displayName">,
): Omit<UserProfile, "createdAt" | "updatedAt"> {
  return {
    email: user.email ?? "",
    name: user.displayName ?? "",
    professionalTitle: "",
    careerField: "",
    country: "",
    experienceLevel: "",
    timezone: defaultTimeZone(),
    dateFormat: DEFAULT_DATE_FORMAT,
    currency: "",
    plan: "free" as const,
    notificationPrefs: DEFAULT_NOTIFICATION_PREFS,
    onboarded: { profile: false },
  };
}

/**
 * Returns the user's profile, creating it on first access (owner-scoped write,
 * allowed by rules). Returns null only when Firebase is not configured.
 */
export async function getOrCreateUserProfile(
  user: Pick<User, "uid" | "email" | "displayName">,
): Promise<UserProfile | null> {
  const ref = profileRef(user.uid);
  if (!ref) throw configError();

  const snapshot = await getDoc(ref);
  if (snapshot.exists()) return profileFromSnapshot(snapshot);

  const profile = defaultProfile(user);
  await setDoc(ref, {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return profile;
}

export type ProfilePatch = Partial<
  Pick<
    UserProfile,
    | "name"
    | "professionalTitle"
    | "careerField"
    | "country"
    | "experienceLevel"
    | "timezone"
    | "dateFormat"
    | "currency"
  >
>;

export interface ProfileSave {
  fields?: ProfilePatch;
  notificationPrefs?: NotificationPrefs;
}

export async function updateUserProfile(uid: string, save: ProfileSave): Promise<void> {
  const ref = profileRef(uid);
  if (!ref) throw configError();

  const payload: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (save.fields) {
    Object.assign(payload, save.fields);
    // First real profile edit counts as onboarding.
    payload["onboarded.profile"] = true;
  }
  if (save.notificationPrefs) {
    payload.notificationPrefs = { ...save.notificationPrefs };
  }
  await updateDoc(ref, payload);
}
