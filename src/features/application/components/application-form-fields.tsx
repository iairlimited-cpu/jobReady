"use client";

import { TextField } from "@/components/ui/text-field";
import { SelectField } from "@/components/ui/select-field";
import { TextareaField } from "@/components/ui/textarea-field";
import { EMPLOYMENT_TYPE_LABELS, EMPLOYMENT_TYPES } from "@/features/application/types";
import type { ApplicationDetailsValues } from "@/features/application/schemas";

/** Shared application detail fields used by create + edit screens. */
export function ApplicationFormFields({
  values,
  onChange,
  errors = {},
}: {
  values: ApplicationDetailsValues;
  onChange: (patch: Partial<ApplicationDetailsValues>) => void;
  errors?: Record<string, string>;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Job title"
          value={values.title}
          onChange={(event) => onChange({ title: event.target.value })}
          error={errors.title}
          required
        />
        <TextField
          label="Company"
          value={values.company}
          onChange={(event) => onChange({ company: event.target.value })}
          error={errors.company}
          required
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Job URL (optional)"
          type="url"
          value={values.url ?? ""}
          onChange={(event) => onChange({ url: event.target.value })}
          placeholder="https://…"
          error={errors.url}
        />
        <TextField
          label="Location (optional)"
          value={values.location ?? ""}
          onChange={(event) => onChange({ location: event.target.value })}
          placeholder="City, Country, Remote"
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <SelectField
          label="Employment type"
          value={values.employmentType ?? ""}
          onChange={(event) =>
            onChange({
              employmentType:
                event.target.value === "" ? undefined : (event.target.value as typeof values.employmentType),
            })
          }
        >
          <option value="">Not specified</option>
          {EMPLOYMENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {EMPLOYMENT_TYPE_LABELS[type]}
            </option>
          ))}
        </SelectField>
        <TextField
          label="Salary (optional)"
          value={values.salary ?? ""}
          onChange={(event) => onChange({ salary: event.target.value })}
          placeholder="e.g. 60k–80k"
        />
        <TextField
          label="Application deadline"
          type="date"
          value={values.deadlineDate ?? ""}
          onChange={(event) => onChange({ deadlineDate: event.target.value })}
        />
      </div>
      <TextareaField
        label="Job description"
        rows={9}
        value={values.jobDescription ?? ""}
        onChange={(event) => onChange({ jobDescription: event.target.value })}
        hint="Paste the full description. In the next build, JOBREADY will analyze it into requirements for you."
      />
    </div>
  );
}

/** ms → yyyy-mm-dd (local) for <input type="date">. */
export function msToDateInput(ms?: number): string {
  if (!ms) return "";
  const date = new Date(ms);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
