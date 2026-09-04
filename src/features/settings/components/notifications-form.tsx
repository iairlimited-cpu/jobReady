"use client";

import { useState, type FormEvent } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TextField } from "@/components/ui/text-field";
import { DEFAULT_NOTIFICATION_PREFS, type UserProfile } from "@/features/settings/types";
import { SectionCard } from "@/features/settings/components/section-card";
import {
  notificationFormSchema,
  parseForm,
  type NotificationFormValues,
} from "@/features/settings/schemas";
import { useUserProfile } from "@/features/settings/use-user-profile";
import { describeFirestoreError } from "@/lib/errors";

interface FormState {
  webNotifications: boolean;
  followUpReminders: boolean;
  /** Kept as a string while editing; coerced to a number by the schema. */
  deadlineAlertsDays: string;
}

const EMPTY_VALUES: FormState = {
  webNotifications: false,
  followUpReminders: true,
  deadlineAlertsDays: String(DEFAULT_NOTIFICATION_PREFS.deadlineAlertsDays),
};

function toFormState(profile: UserProfile): FormState {
  const prefs = { ...DEFAULT_NOTIFICATION_PREFS, ...profile.notificationPrefs };
  return {
    webNotifications: prefs.webNotifications,
    followUpReminders: prefs.followUpReminders,
    deadlineAlertsDays: String(prefs.deadlineAlertsDays),
  };
}

export function NotificationsForm() {
  const { profile, isLoading, isSignedIn, save } = useUserProfile();
  const [values, setValues] = useState<FormState>(EMPTY_VALUES);
  const [lastProfile, setLastProfile] = useState<UserProfile | null>(profile);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Re-hydrate when the profile first arrives or changes (render-time adjustment).
  if (profile !== lastProfile) {
    setLastProfile(profile);
    if (profile) setValues(toFormState(profile));
  }

  if (!isSignedIn) return null;
  if (isLoading || !profile) {
    return (
      <SectionCard title="Notifications" description="Loading your preferences…">
        <div aria-busy="true" className="h-40 animate-pulse rounded-md bg-muted" />
      </SectionCard>
    );
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setStatus("idle");
    setStatusMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = parseForm(notificationFormSchema, {
      webNotifications: values.webNotifications,
      followUpReminders: values.followUpReminders,
      deadlineAlertsDays: values.deadlineAlertsDays,
    });
    if (!parsed.ok) {
      setFieldErrors(parsed.fieldErrors);
      setStatusMessage(parsed.message);
      setStatus("error");
      return;
    }
    const data: NotificationFormValues = parsed.data;
    setFieldErrors({});
    setStatus("saving");
    setStatusMessage(null);
    try {
      await save({
        notificationPrefs: {
          webNotifications: data.webNotifications,
          followUpReminders: data.followUpReminders,
          deadlineAlertsDays: data.deadlineAlertsDays,
        },
      });
      setStatus("saved");
      setStatusMessage("Notification preferences saved.");
    } catch (saveError) {
      setStatus("error");
      setStatusMessage(describeFirestoreError(saveError).message);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <SectionCard
        title="Notifications"
        description="Reminders are gentle and never spammy. In-app reminders always work; browser notifications are optional extras."
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
              {status === "saving" ? "Saving…" : "Save preferences"}
            </Button>
          </>
        }
      >
        {status === "error" && statusMessage ? (
          <Alert variant="error">{statusMessage}</Alert>
        ) : null}

        <ul className="flex flex-col divide-y divide-border rounded-md border border-border bg-card">
          <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-medium text-foreground">
                Application deadline reminders
              </p>
              <p className="text-sm text-muted-foreground">
                Remind me this many days before a deadline (0 turns reminders off).
              </p>
            </div>
            <div className="w-full sm:w-24">
              <TextField
                label="Days before deadline"
                type="number"
                min={0}
                max={14}
                inputMode="numeric"
                value={values.deadlineAlertsDays}
                onChange={(event) => update("deadlineAlertsDays", event.target.value)}
                error={fieldErrors.deadlineAlertsDays}
              />
            </div>
          </li>
          <li className="flex items-center justify-between gap-4 p-4">
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-medium text-foreground">Follow-up reminders</p>
              <p className="text-sm text-muted-foreground">
                Suggest a follow-up when an application goes quiet.
              </p>
            </div>
            <Switch
              checked={values.followUpReminders}
              onCheckedChange={(checked) => update("followUpReminders", checked)}
              label="Follow-up reminders"
            />
          </li>
          <li className="flex items-center justify-between gap-4 p-4">
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-medium text-foreground">Browser notifications</p>
              <p className="text-sm text-muted-foreground">
                Opt-in extra alerts in this browser when deadlines or interviews are near.
              </p>
            </div>
            <Switch
              checked={values.webNotifications}
              onCheckedChange={(checked) => update("webNotifications", checked)}
              label="Browser notifications"
            />
          </li>
        </ul>
      </SectionCard>
    </form>
  );
}
