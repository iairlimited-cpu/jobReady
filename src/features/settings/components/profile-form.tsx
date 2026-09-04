"use client";

import { useState, type FormEvent } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { SelectField } from "@/components/ui/select-field";
import {
  EXPERIENCE_LEVEL_OPTIONS,
  type UserProfile,
} from "@/features/settings/types";
import { SectionCard } from "@/features/settings/components/section-card";
import {
  parseForm,
  profileFormSchema,
  type ProfileFormValues,
} from "@/features/settings/schemas";
import { useUserProfile } from "@/features/settings/use-user-profile";
import { describeFirestoreError } from "@/lib/errors";

const EMPTY_VALUES: ProfileFormValues = {
  name: "",
  professionalTitle: "",
  careerField: "",
  country: "",
  experienceLevel: "",
};

function toFormValues(profile: UserProfile): ProfileFormValues {
  return {
    name: profile.name,
    professionalTitle: profile.professionalTitle,
    careerField: profile.careerField,
    country: profile.country,
    experienceLevel: profile.experienceLevel || "",
  };
}

export function ProfileForm() {
  const { profile, isLoading, error, isSignedIn, save } = useUserProfile();
  const [values, setValues] = useState<ProfileFormValues>(EMPTY_VALUES);
  const [lastProfile, setLastProfile] = useState<UserProfile | null>(profile);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Re-hydrate when the profile first arrives or changes — a render-time
  // adjustment (recommended pattern; avoids setState-in-effect cascades).
  if (profile !== lastProfile) {
    setLastProfile(profile);
    if (profile) setValues(toFormValues(profile));
  }

  if (!isSignedIn) return null;
  if (isLoading || !profile) {
    return (
      <SectionCard title="Profile" description="Loading your profile…">
        <div aria-busy="true" className="h-40 animate-pulse rounded-md bg-muted" />
      </SectionCard>
    );
  }

  function handleChange(field: keyof ProfileFormValues, value: string) {
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
    const parsed = parseForm(profileFormSchema, values);
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
      setStatusMessage("Profile saved.");
    } catch (saveError) {
      setStatus("error");
      setStatusMessage(describeFirestoreError(saveError).message);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <SectionCard
        title="Profile"
        description="Used to personalize your workspace and to pre-fill new CVs. Your email is managed by your sign-in provider."
        footer={
          <>
            {status === "saved" && statusMessage ? (
              <p
                aria-live="polite"
                role="status"
                className="text-sm text-success-foreground"
              >
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
        {error ? <Alert variant="error">Couldn’t load your profile yet.</Alert> : null}

        <div className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Full name"
              name="name"
              autoComplete="name"
              value={values.name}
              onChange={(event) => handleChange("name", event.target.value)}
              error={fieldErrors.name}
            />
            <TextField
              label="Professional title"
              name="professionalTitle"
              placeholder="e.g. Frontend developer"
              value={values.professionalTitle}
              onChange={(event) =>
                handleChange("professionalTitle", event.target.value)
              }
              error={fieldErrors.professionalTitle}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Career field"
              name="careerField"
              placeholder="e.g. Software, design, healthcare"
              value={values.careerField}
              onChange={(event) => handleChange("careerField", event.target.value)}
              error={fieldErrors.careerField}
            />
            <SelectField
              label="Experience level"
              name="experienceLevel"
              value={values.experienceLevel}
              onChange={(event) => handleChange("experienceLevel", event.target.value)}
              error={fieldErrors.experienceLevel}
            >
              <option value="">Prefer not to say</option>
              {EXPERIENCE_LEVEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>
          </div>
          <TextField
            label="Country / region"
            name="country"
            placeholder="e.g. Kenya"
            value={values.country}
            onChange={(event) => handleChange("country", event.target.value)}
            error={fieldErrors.country}
          />
        </div>
      </SectionCard>
    </form>
  );
}
