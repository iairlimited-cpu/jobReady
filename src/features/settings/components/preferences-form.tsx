"use client";

import { useMemo, useState, type FormEvent } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { SelectField } from "@/components/ui/select-field";
import { DATE_FORMAT_OPTIONS, DEFAULT_DATE_FORMAT, listTimeZones } from "@/lib/dates";
import type { UserProfile } from "@/features/settings/types";
import { SectionCard } from "@/features/settings/components/section-card";
import {
  parseForm,
  preferenceFormSchema,
  type PreferenceFormValues,
} from "@/features/settings/schemas";
import { useUserProfile } from "@/features/settings/use-user-profile";
import { describeFirestoreError } from "@/lib/errors";

function toFormValues(profile: UserProfile): PreferenceFormValues {
  return {
    timezone: profile.timezone,
    dateFormat: profile.dateFormat || DEFAULT_DATE_FORMAT,
    currency: profile.currency,
  };
}

export function PreferencesForm() {
  const { profile, isLoading, isSignedIn, save } = useUserProfile();
  const timeZones = useMemo(() => listTimeZones(), []);

  const [values, setValues] = useState<PreferenceFormValues>({
    timezone: "UTC",
    dateFormat: DEFAULT_DATE_FORMAT,
    currency: "",
  });
  const [lastProfile, setLastProfile] = useState<UserProfile | null>(profile);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Re-hydrate when the profile first arrives or changes (render-time adjustment).
  if (profile !== lastProfile) {
    setLastProfile(profile);
    if (profile) setValues(toFormValues(profile));
  }

  if (!isSignedIn) return null;
  if (isLoading || !profile) {
    return (
      <SectionCard title="Preferences" description="Loading your preferences…">
        <div aria-busy="true" className="h-40 animate-pulse rounded-md bg-muted" />
      </SectionCard>
    );
  }

  function handleChange(field: keyof PreferenceFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setStatus("idle");
    setStatusMessage(null);
    if (fieldErrors[field]) {
      setFieldErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = parseForm(preferenceFormSchema, values);
    if (!parsed.ok) {
      setFieldErrors(parsed.fieldErrors);
      setStatusMessage(parsed.message);
      setStatus("error");
      return;
    }
    setFieldErrors({});
    setStatus("saving");
    setStatusMessage(null);
    try {
      await save({ fields: parsed.data });
      setStatus("saved");
      setStatusMessage("Preferences saved.");
    } catch (saveError) {
      setStatus("error");
      setStatusMessage(describeFirestoreError(saveError).message);
    }
  }

  const selectedFormat = DATE_FORMAT_OPTIONS.find((o) => o.value === values.dateFormat);

  return (
    <form onSubmit={handleSubmit} noValidate>
      <SectionCard
        title="Preferences"
        description="Dates, times and currency are shown according to these settings — we never guess from ambiguous formats."
        footer={
          <>
            {status === "saved" && statusMessage ? (
              <p aria-live="polite" role="status" className="text-sm text-success-foreground">
                {statusMessage}
              </p>
            ) : (
              <span aria-hidden="true" />
            )}
            <Button type="submit" disabled={status === "saving"}>
              {status === "saving" ? "Saving…" : "Save changes"}
            </Button>
          </>
        }
      >
        {status === "error" && statusMessage ? (
          <Alert variant="error">{statusMessage}</Alert>
        ) : null}

        <div className="flex flex-col gap-5">
          <SelectField
            label="Time zone"
            name="timezone"
            value={values.timezone}
            onChange={(event) => handleChange("timezone", event.target.value)}
            error={fieldErrors.timezone}
          >
            {timeZones.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Date format"
            name="dateFormat"
            value={values.dateFormat}
            onChange={(event) => handleChange("dateFormat", event.target.value)}
            error={fieldErrors.dateFormat}
          >
            {DATE_FORMAT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.value} — e.g. {option.example}
              </option>
            ))}
          </SelectField>

          {selectedFormat ? (
            <Alert variant="info">
              Deadlines and CV dates will look like:{" "}
              <strong>{selectedFormat.example}</strong>
            </Alert>
          ) : null}

          <TextField
            label="Currency (optional)"
            name="currency"
            placeholder="e.g. USD, EUR, KES"
            value={values.currency}
            onChange={(event) => handleChange("currency", event.target.value)}
            hint="Used when you record salaries in applications."
            error={fieldErrors.currency}
          />
        </div>
      </SectionCard>
    </form>
  );
}
