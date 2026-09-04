"use client";

import { useState, type FormEvent } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextField } from "@/components/ui/text-field";
import { TextareaField } from "@/components/ui/textarea-field";
import {
  buildGuidedCoverLetter,
  suggestCoverLetterImprovements,
} from "@/features/coverLetter/helpers";
import { coverLetterSchema, DEFAULT_VALUES } from "@/features/coverLetter/schemas";
import type { CoverLetterValues } from "@/features/coverLetter/schemas";
import { LetterDocument } from "@/features/coverLetter/components/letter-document";
import type { CoverLetterData } from "@/features/coverLetter/types";
import { describeFirestoreError } from "@/lib/errors";
import { parseForm } from "@/lib/form";

export function CoverLetterTab({
  applicationId,
  jobTitle,
  company,
  initial,
  onSave,
}: {
  applicationId: string;
  jobTitle: string;
  company: string;
  initial?: CoverLetterData;
  onSave: (letter: CoverLetterData) => Promise<void>;
}) {
  const [values, setValues] = useState<CoverLetterValues>(() => ({
    ...DEFAULT_VALUES,
    ...(initial ?? {}),
  }));
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const tips = suggestCoverLetterImprovements(values);

  function update<K extends keyof CoverLetterValues>(key: K, value: CoverLetterValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setStatus("idle");
    setStatusMessage(null);
  }

  function handleGuidedTemplate() {
    setValues(buildGuidedCoverLetter({ jobTitle, company, applicantName: values.applicantName }));
    setStatus("idle");
    setStatusMessage(null);
  }

  async function handleSave(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const parsed = parseForm(coverLetterSchema, values);
    if (!parsed.ok) {
      setStatus("error");
      setStatusMessage(parsed.message);
      return;
    }
    setStatus("saving");
    setStatusMessage(null);
    try {
      await onSave(parsed.data);
      setStatus("saved");
      setStatusMessage("Cover letter saved.");
    } catch (saveError) {
      setStatus("error");
      setStatusMessage(describeFirestoreError(saveError).message);
    }
  }

  async function handlePrint() {
    await handleSave();
    window.open(`/cover-letter/print?app=${encodeURIComponent(applicationId)}`, "_blank", "noopener");
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-foreground">Cover letter</h2>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleGuidedTemplate}>
              Use guided template
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => void handlePrint()}>
              Print / PDF
            </Button>
          </div>
        </div>

        <form onSubmit={(event) => void handleSave(event)} noValidate className="mt-5 flex flex-col gap-5">
          {status === "error" && statusMessage ? (
            <Alert variant="error">{statusMessage}</Alert>
          ) : null}
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Your name"
              value={values.applicantName}
              onChange={(event) => update("applicantName", event.target.value)}
            />
            <TextField
              label="Recipient"
              value={values.recipient}
              onChange={(event) => update("recipient", event.target.value)}
              hint={`For ${company || "the company"} — use a name if you know it.`}
            />
          </div>
          <TextareaField
            label="Salutation"
            rows={1}
            value={values.salutation}
            onChange={(event) => update("salutation", event.target.value)}
          />
          <TextareaField
            label="Opening"
            rows={4}
            value={values.opening}
            onChange={(event) => update("opening", event.target.value)}
          />
          <TextareaField
            label="Relevant experience"
            rows={8}
            value={values.experience}
            onChange={(event) => update("experience", event.target.value)}
            hint="Real examples only — never invent achievements or numbers."
          />
          <TextareaField
            label="Why this role"
            rows={5}
            value={values.whyRole}
            onChange={(event) => update("whyRole", event.target.value)}
          />
          <TextareaField
            label="Closing"
            rows={1}
            value={values.closingSalutation}
            onChange={(event) => update("closingSalutation", event.target.value)}
          />
          <div className="flex justify-end gap-3 border-t border-border pt-4">
            {status === "saved" && statusMessage ? (
              <p aria-live="polite" role="status" className="text-sm text-success-foreground">
                {statusMessage}
              </p>
            ) : null}
            <Button type="submit" disabled={status === "saving"}>
              {status === "saving" ? "Saving…" : "Save cover letter"}
            </Button>
          </div>
        </form>
      </Card>

      {tips.length > 0 ? (
        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground">Drafting tips</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span aria-hidden="true" className={tip.severity === "warning" ? "text-warning-foreground" : ""}>
                  {tip.severity === "warning" ? "⚠" : "•"}
                </span>
                <span>{tip.text}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card className="p-6">
        <h2 className="text-base font-semibold text-foreground">Preview</h2>
        <div className="mt-4 overflow-hidden rounded-md bg-white p-10 shadow-sm">
          <LetterDocument data={values} jobTitle={jobTitle} company={company} />
        </div>
      </Card>
    </div>
  );
}
