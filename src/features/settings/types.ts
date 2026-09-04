/**
 * User profile + preferences domain types (users/{uid}).
 * Text fields default to "" (never null) so Firestore docs stay simple.
 */

export const EXPERIENCE_LEVEL_VALUES = [
  "student",
  "entry",
  "mid",
  "senior",
  "lead",
  "career_changer",
  "freelance",
] as const;

export type ExperienceLevelValue = (typeof EXPERIENCE_LEVEL_VALUES)[number];

export const EXPERIENCE_LEVEL_OPTIONS: { value: ExperienceLevelValue; label: string }[] = [
  { value: "student", label: "Student" },
  { value: "entry", label: "Entry level / graduate" },
  { value: "mid", label: "Mid-level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead / manager" },
  { value: "career_changer", label: "Career changer" },
  { value: "freelance", label: "Freelance / contractor" },
];

export const PLAN_VALUES = ["free", "pro"] as const;
export type Plan = (typeof PLAN_VALUES)[number];

export interface NotificationPrefs {
  /** Browser notification permission is requested later; this is the preference. */
  webNotifications: boolean;
  /** Days before a deadline to surface an in-app reminder (0 = off). */
  deadlineAlertsDays: number;
  followUpReminders: boolean;
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  webNotifications: false,
  deadlineAlertsDays: 3,
  followUpReminders: true,
};

export interface UserProfile {
  email: string;
  name: string;
  professionalTitle: string;
  careerField: string;
  country: string;
  experienceLevel: "" | ExperienceLevelValue;
  timezone: string;
  dateFormat: string;
  currency: string;
  plan: Plan;
  notificationPrefs: NotificationPrefs;
  onboarded: { profile: boolean };
  createdAt?: number;
  updatedAt?: number;
}

/** Editable text/select profile fields (the /settings/profile form). */
export interface ProfileFields {
  name: string;
  professionalTitle: string;
  careerField: string;
  country: string;
  experienceLevel: "" | ExperienceLevelValue;
}

/** Editable locale/preference fields (the /settings/preferences form). */
export interface PreferenceFields {
  timezone: string;
  dateFormat: string;
  currency: string;
}
