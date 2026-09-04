"use client";

import type { ReactNode } from "react";

import { AuthProvider } from "@/features/auth/auth-context";

/** Client providers mounted once in the root layout. */
export function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
