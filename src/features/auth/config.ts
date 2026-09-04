/**
 * Auth routing constants. When the dashboard ships (Phase 13) change
 * DEFAULT_AUTHED_REDIRECT to "/dashboard".
 */
export const DEFAULT_AUTHED_REDIRECT = "/";

export const AUTH_PATHS = {
  signIn: "/auth/signin",
  signUp: "/auth/signup",
  recover: "/auth/recover",
} as const;
