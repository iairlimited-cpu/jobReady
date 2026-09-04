/**
 * Error handling helpers (JOBREADY-PLAN.md §A16).
 * Raw provider codes are NEVER shown to users — map them to human copy.
 */

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-email": "Enter a valid email address.",
  "auth/user-not-found": "We couldn’t find an account with that email and password.",
  "auth/wrong-password": "We couldn’t find an account with that email and password.",
  "auth/invalid-credential": "We couldn’t find an account with that email and password.",
  "auth/email-already-in-use":
    "An account with that email already exists. Try signing in instead.",
  "auth/weak-password": "That password is too weak — use at least 8 characters.",
  "auth/too-many-requests":
    "Too many attempts. Please wait a moment and try again.",
  "auth/network-request-failed":
    "We couldn’t reach the server. Check your connection and try again.",
  "auth/operation-not-allowed": "This sign-in method isn’t available right now.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/requires-recent-login":
    "For security, please sign in again before making this change.",
  "auth/internal-error": "Something went wrong on our side. Please try again.",
};

const DEFAULT_MESSAGE = "Something went wrong. Please try again.";

export interface DescribedError {
  message: string;
  code: string;
  /** True when the user cancelled a popup flow — usually not worth showing. */
  isCancelled: boolean;
}

const CANCELLED_CODES = new Set([
  "auth/popup-closed-by-user",
  "auth/cancelled-popup-request",
]);

export function describeAuthError(error: unknown): DescribedError {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : "unknown";

  if (code === "AUTH_CONFIG_MISSING" || code === "auth/configuration-not-found") {
    return {
      code,
      message:
        "Accounts aren’t enabled in this environment yet — add your Firebase project keys to get started.",
      isCancelled: false,
    };
  }

  return {
    code,
    message: AUTH_ERROR_MESSAGES[code] ?? DEFAULT_MESSAGE,
    isCancelled: CANCELLED_CODES.has(code),
  };
}

const FIRESTORE_ERROR_MESSAGES: Record<string, string> = {
  "permission-denied":
    "You don’t have access to that. Try signing in again, or refresh the page.",
  unavailable: "We couldn’t reach the server. Check your connection and try again.",
  "not-found": "We couldn’t find that item — it may have been deleted.",
  "deadline-exceeded": "The request took too long. Please try again.",
  "invalid-argument": "Something in that request didn’t look right. Please try again.",
  "resource-exhausted": "Too many requests. Please wait a moment and try again.",
  "failed-precondition": "The change couldn’t be applied. Please refresh and try again.",
};

function extractErrorCode(error: unknown): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : "unknown";
  // Some SDKs prefix codes (e.g. "firestore/permission-denied").
  return code.startsWith("firestore/") || code.startsWith("functions/")
    ? code.slice(code.indexOf("/") + 1)
    : code;
}

export function describeFirestoreError(error: unknown): DescribedError {
  const code = extractErrorCode(error);

  if (code === "FIREBASE_CONFIG_MISSING") {
    return {
      code,
      message:
        "Saving isn’t enabled in this environment yet — add your Firebase project keys to get started.",
      isCancelled: false,
    };
  }

  return {
    code,
    message: FIRESTORE_ERROR_MESSAGES[code] ?? DEFAULT_MESSAGE,
    isCancelled: false,
  };
}
