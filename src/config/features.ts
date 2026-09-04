/**
 * Feature flags — single source of truth (JOBREADY-PLAN.md §101).
 * V1 keeps these as compile-time constants; a future phase may read
 * remote config. Do not scatter hard-coded feature checks through the app.
 */
export const FEATURES = {
  /** Deterministic job-description analysis. On in V1. */
  JOB_ANALYZER: true,
  /** Deterministic CV <-> job matching. On in V1. */
  CV_MATCHING: true,
  /** Print-pipeline PDF export. On in V1. */
  PDF_EXPORT: true,

  /** Reserved (not in V1): DOCX export, future AI layer, premium, ads. */
  DOCX_EXPORT: false,
  AI_FEATURES: false,
  ADVANCED_ANALYSIS: false,
  PREMIUM_FEATURES: false,
  ADS_ENABLED: false,
} as const;

export type FeatureKey = keyof typeof FEATURES;

export function isFeatureEnabled(key: FeatureKey): boolean {
  return FEATURES[key];
}
