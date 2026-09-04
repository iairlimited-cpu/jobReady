/**
 * Client-side Firebase singleton accessors.
 *
 * IMPORTANT:
 * - Only import this module from client code ("use client" components/hooks).
 * - If Firebase env vars are absent the app still runs (guest/public mode):
 *   accessors return null and callers must branch on `isFirebaseConfigured()`.
 * - Firestore Security Rules remain the real authorization gate
 *   (JOBREADY-PLAN.md §A5, §A14).
 */

import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
} as const;

/** True only in the browser with a complete Firebase configuration. */
export function isFirebaseConfigured(): boolean {
  return (
    typeof window !== "undefined" &&
    Object.values(firebaseConfig).every((v) => typeof v === "string" && v.length > 0)
  );
}

function getAppInstance(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  const existing = getApps();
  if (existing.length > 0) return existing[0] as FirebaseApp;
  return initializeApp(firebaseConfig as Record<string, string>);
}

let authInstance: Auth | null | undefined;
let dbInstance: Firestore | null | undefined;

export function getFirebaseAuth(): Auth | null {
  if (authInstance !== undefined) return authInstance;
  const app = getAppInstance();
  authInstance = app ? getAuth(app) : null;
  return authInstance;
}

export function getFirestoreDb(): Firestore | null {
  if (dbInstance !== undefined) return dbInstance;
  const app = getAppInstance();
  dbInstance = app ? getFirestore(app) : null;
  return dbInstance;
}
