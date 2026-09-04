/**
 * Auth operations — the only place that talks to Firebase Auth directly.
 * UI code must go through these functions (never raw Firebase calls).
 */
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth";

import { getFirebaseAuth } from "@/lib/firebase/client";
import type { RecoverValues, SignInValues, SignUpValues } from "@/features/auth/schemas";

function authOrThrow() {
  const auth = getFirebaseAuth();
  if (!auth) {
    // Matched by describeAuthError (AUTH_CONFIG_MISSING).
    const error = new Error("Firebase Auth is not configured.");
    (error as { code?: string }).code = "AUTH_CONFIG_MISSING";
    throw error;
  }
  return auth;
}

export async function signIn(values: SignInValues): Promise<User> {
  const auth = authOrThrow();
  const credentials = await signInWithEmailAndPassword(
    auth,
    values.email,
    values.password,
  );
  return credentials.user;
}

export async function signUp(values: SignUpValues): Promise<User> {
  const auth = authOrThrow();
  const credentials = await createUserWithEmailAndPassword(
    auth,
    values.email,
    values.password,
  );
  const name = values.name?.trim();
  if (name) {
    await updateProfile(credentials.user, { displayName: name });
  }
  return credentials.user;
}

export async function signInWithGoogle(): Promise<User> {
  const auth = authOrThrow();
  const provider = new GoogleAuthProvider();
  const credentials = await signInWithPopup(auth, provider);
  return credentials.user;
}

export async function sendPasswordReset(values: RecoverValues): Promise<void> {
  const auth = authOrThrow();
  await sendPasswordResetEmail(auth, values.email);
}

export async function signOutCurrentUser(): Promise<void> {
  const auth = authOrThrow();
  await firebaseSignOut(auth);
}
