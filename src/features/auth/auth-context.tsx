"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getFirebaseAuth } from "@/lib/firebase/client";

export type AuthStatus = "loading" | "guest" | "authed";

export interface AuthState {
  status: AuthStatus;
  /** Present only when status === "authed". */
  user: User | null;
  /** False when Firebase env config is missing (app runs in guest mode). */
  configured: boolean;
}

const AuthContext = createContext<AuthState | null>(null);

const GUEST_STATE: AuthState = { status: "guest", user: null, configured: false };

/**
 * Auth state provider. Initial state is "loading" on both server and client
 * (hydration-safe); the real state arrives asynchronously.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    status: "loading",
    user: null,
    configured: false,
  });

  useEffect(() => {
    const auth = getFirebaseAuth();

    // No Firebase config yet: stay in guest mode. The update is deferred out of
    // the synchronous effect body to avoid cascading-render warnings.
    if (!auth) {
      const timer = window.setTimeout(() => setState(GUEST_STATE), 0);
      return () => window.clearTimeout(timer);
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setState(
        user
          ? { status: "authed", user, configured: true }
          : { status: "guest", user: null, configured: true },
      );
    });

    return () => unsubscribe();
  }, []);

  const value = useMemo(() => state, [state]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>.");
  }
  return context;
}
