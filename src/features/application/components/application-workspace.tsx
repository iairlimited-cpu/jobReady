"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SelectField } from "@/components/ui/select-field";
import { TextareaField } from "@/components/ui/textarea-field";
import { AppHeader } from "@/components/app-header";
import { RequireAuth } from "@/features/auth/guards";
import { analyzeJobDescription } from "@/features/analyzer/analyzer";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type AnalysisResult,
  type ExtractedRequirement,
  type Importance,
} from "@/features/analyzer/types";
import { StatusBadge } from "@/features/application/components/status-badge";
import { CoverLetterTab } from "@/features/coverLetter/components/cover-letter-tab";
import { CvMatchTab } from "@/features/application/components/cv-match-tab";
import {
  ApplicationFormFields,
  msToDateInput,
} from "@/features/application/components/application-form-fields";
import { isOverdue } from "@/features/application/helpers";
import { applicationDetailsSchema, type ApplicationDetailsValues } from "@/features/application/schemas";
import { useApplication } from "@/features/application/use-application";
import {
  APPLICATION_STATUSES,
  EMPLOYMENT_TYPE_LABELS,
  STATUS_META,
  type EmploymentType,
  type JobApplication,
} from "@/features/application/types";
import { parseForm } from "@/lib/form";
import { describeFirestoreError } from "@/lib/errors";
import { formatDateForUser } from "@/lib/dates";

type Tab = "overview" | "requirements" | "cv" | "cover" | "notes" | "timeline";

const IMPORTANCE_BADGES: Record<Importance, { label: string; variant: "warning" | "success" | "neutral" }> = {
  must: { label: "Must-have", variant: "warning" },
  nice: { label: "Good to have", variant: "success" },
  unknown: { label: "Mentioned", variant: "neutral" },
};

const METHODS = ["Online application", "Email", "In person", "Recruiter", "Referral", "Other"] as const;

function applicationToValues(application: JobApplication): ApplicationDetailsValues {
  return {
    title: application.title,
    company: application.company,
    url: application.url ?? "",
    location: application.location ?? "",
    employmentType: application.employmentType,
    salary: application.salary ?? "",
    deadlineDate: msToDateInput(application.deadline),
    jobDescription: application.jobDescription ?? "",
  };
}

function OverviewTab({
  application,
  onSaveDetails,
  onUpdateStatus,
  onMarkApplied,
  onToggleFavorite,
  onDelete,
  deleting,
}: {
  application: JobApplication;
  onSaveDetails: (values: ApplicationDetailsValues) => Promise<void>;
  onUpdateStatus: (status: JobApplication["status"]) => Promise<void>;
  onMarkApplied: (dateMs: number, method: string) => Promise<void>;
  onToggleFavorite: () => Promise<void>;
  onDelete: () => Promise<void>;
  deleting: boolean;
}) {
  const [showEdit, setShowEdit] = useState(false);
  const [editing, setEditing] = useState(false);
  const [applying, setApplying] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [values, setValues] = useState<ApplicationDetailsValues>(() =>
    applicationToValues(application),
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [appliedDate, setAppliedDate] = useState(() =>
    msToDateInput(Date.now()),
  );
  const [method, setMethod] = useState<string>(METHODS[0]);

  const overdue = isOverdue(application);

  async function handleSaveDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = parseForm(applicationDetailsSchema, values);
    if (!parsed.ok) {
      setFieldErrors(parsed.fieldErrors);
      setSaveError(parsed.message);
      return;
    }
    setFieldErrors({});
    setSaveError(null);
    setEditing(true);
    try {
      await onSaveDetails(parsed.data);
      setShowEdit(false);
    } catch (error) {
      setSaveError(describeFirestoreError(error).message);
    } finally {
      setEditing(false);
    }
  }

  async function handleStatusChange(next: JobApplication["status"]) {
    setSaveError(null);
    if (next === "applied") {
      setApplying(true);
      return;
    }
    try {
      await onUpdateStatus(next);
    } catch (error) {
      setSaveError(describeFirestoreError(error).message);
    }
  }

  async function handleConfirmApplied() {
    if (!appliedDate) {
      setSaveError("Choose the date you applied.");
      return;
    }
    setSaveError(null);
    try {
      await onMarkApplied(new Date(`${appliedDate}T09:00:00`).getTime(), method);
      setApplying(false);
    } catch (error) {
      setSaveError(describeFirestoreError(error).message);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {saveError ? <Alert variant="error">{saveError}</Alert> : null}

      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <StatusBadge status={application.status} />
            {application.deadline ? (
              <span className={overdue ? "text-sm font-medium text-destructive" : "text-sm text-muted-foreground"}>
                {overdue ? "Deadline passed · " : "Deadline "}
                {formatDateForUser(application.deadline)}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => void onToggleFavorite()}
              aria-pressed={application.favorite}
            >
              {application.favorite ? "★ Favourite" : "☆ Favourite"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowEdit((value) => !value)}>
              {showEdit ? "Hide details" : "Edit details"}
            </Button>
          </div>
        </div>

        <dl className="mt-5 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          {application.location ? (
            <div><dt className="text-muted-foreground">Location</dt><dd className="font-medium">{application.location}</dd></div>
          ) : null}
          {application.employmentType ? (
            <div><dt className="text-muted-foreground">Employment type</dt><dd className="font-medium">{EMPLOYMENT_TYPE_LABELS[application.employmentType as EmploymentType]}</dd></div>
          ) : null}
          {application.salary ? (
            <div><dt className="text-muted-foreground">Salary</dt><dd className="font-medium">{application.salary}</dd></div>
          ) : null}
          {application.appliedAt ? (
            <div><dt className="text-muted-foreground">Date applied</dt><dd className="font-medium">{formatDateForUser(application.appliedAt)}</dd></div>
          ) : null}
          {application.url ? (
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Job posting</dt>
              <dd>
                <a href={application.url} target="_blank" rel="noopener noreferrer" className="break-all font-medium text-primary underline-offset-4 hover:underline">
                  {application.url}
                </a>
              </dd>
            </div>
          ) : null}
        </dl>

        {application.jobDescription ? (
          <div className="mt-5 border-t border-border pt-4">
            <p className="text-sm font-medium text-foreground">Job description</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {application.jobDescription}
            </p>
          </div>
        ) : null}

        {showEdit ? (
          <form onSubmit={handleSaveDetails} noValidate className="mt-6 border-t border-border pt-5">
            <ApplicationFormFields
              values={values}
              errors={fieldErrors}
              onChange={(patch) => setValues((current) => ({ ...current, ...patch }))}
            />
            <div className="mt-5 flex justify-end gap-3">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowEdit(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={editing}>
                {editing ? "Saving…" : "Save details"}
              </Button>
            </div>
          </form>
        ) : null}
      </Card>

      {/* Status flow */}
      <Card className="p-6">
        <h2 className="text-base font-semibold text-foreground">Application status</h2>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div className="w-56">
            <SelectField
              label="Move application to"
              value={application.status}
              onChange={(event) =>
                void handleStatusChange(event.target.value as JobApplication["status"])
              }
            >
              {APPLICATION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_META[status].label}
                </option>
              ))}
            </SelectField>
          </div>
          {applying ? (
            <div className="flex flex-wrap items-end gap-3 rounded-md border border-border bg-muted/40 p-3">
              <div className="w-44">
                <SelectField
                  label="Applied on"
                  value={method}
                  onChange={(event) => setMethod(event.target.value)}
                >
                  {METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </SelectField>
              </div>
              <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
                Date
                <input
                  type="date"
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={appliedDate}
                  onChange={(event) => setAppliedDate(event.target.value)}
                />
              </label>
              <div className="flex gap-2">
                <Button type="button" size="sm" onClick={() => void handleConfirmApplied()}>
                  Mark as applied
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setApplying(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : null}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Status changes are recorded in the timeline automatically.
        </p>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/40 p-6">
        <h2 className="text-base font-semibold text-foreground">Delete application</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Removes this application and its timeline from your account.
        </p>
        {confirmDelete ? (
          <div className="mt-4 flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-destructive"
              disabled={deleting}
              onClick={() => {
                setConfirmDelete(false);
                void onDelete();
              }}
            >
              {deleting ? "Deleting…" : "Yes, delete it"}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
              Keep it
            </Button>
          </div>
        ) : (
          <Button type="button" variant="ghost" size="sm" className="mt-4 text-destructive" onClick={() => setConfirmDelete(true)}>
            Delete application
          </Button>
        )}
      </Card>
    </div>
  );
}

function RequirementsTab({
  description,
  saved,
  onSave,
}: {
  description: string;
  saved: ExtractedRequirement[] | undefined;
  onSave: (requirements: ExtractedRequirement[]) => Promise<void>;
}) {
  const [fresh, setFresh] = useState<AnalysisResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedNote, setSavedNote] = useState(false);

  const current = fresh ?? (saved && saved.length > 0 ? { requirements: saved } : null);

  async function handleSave() {
    if (!fresh) return;
    setBusy(true);
    setError(null);
    try {
      await onSave(fresh.requirements);
      setSavedNote(true);
      setFresh(null);
    } catch (saveError) {
      setError(describeFirestoreError(saveError).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-base font-semibold text-foreground">Job requirements</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        What does this employer ask for? The analysis runs in your browser using
        the job description on the Overview tab.
      </p>

      {!description.trim() ? (
        <Alert variant="info" className="mt-4">
          No job description yet — paste one via “Edit details” on the Overview tab,
          then analyze this job here.
        </Alert>
      ) : (
        <div className="mt-4 flex items-center gap-3">
          <Button
            type="button"
            onClick={() => {
              setFresh(analyzeJobDescription(description));
              setSavedNote(false);
            }}
          >
            Analyze this job
          </Button>
          {fresh ? (
            <Button type="button" variant="ghost" onClick={() => setFresh(null)}>
              Cancel preview
            </Button>
          ) : null}
        </div>
      )}

      {error ? <Alert variant="error" className="mt-4">{error}</Alert> : null}

      {current && current.requirements.length > 0 ? (
        <div className="mt-6 flex flex-col gap-5">
          {savedNote ? (
            <Alert variant="success">Analysis saved to this application.</Alert>
          ) : null}
          {CATEGORY_ORDER.map((category) => {
            const items = current!.requirements.filter(
              (req) => req.category === category,
            );
            if (items.length === 0) return null;
            return (
              <section key={category}>
                <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
                  {CATEGORY_LABELS[category]}
                </h3>
                <ul className="mt-2 flex flex-col gap-2">
                  {items.map((req) => (
                    <li key={req.id} className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{req.label}</p>
                        {req.evidence[0] ? (
                          <p className="text-xs italic text-muted-foreground">
                            “{req.evidence[0]}”
                          </p>
                        ) : null}
                      </div>
                      <Badge variant={IMPORTANCE_BADGES[req.importance].variant}>
                        {IMPORTANCE_BADGES[req.importance].label}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
          {fresh ? (
            <div className="flex justify-end border-t border-border pt-4">
              <Button type="button" onClick={() => void handleSave()} disabled={busy}>
                {busy ? "Saving…" : "Save analysis to this application"}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      {current && current.requirements.length === 0 ? (
        <Alert variant="info" className="mt-4">
          We didn’t recognize clear requirements in this description.
        </Alert>
      ) : null}
    </Card>
  );
}

function NotesTab({
  notes,
  onAdd,
  onRemove,
}: {
  notes: JobApplication["notes"];
  onAdd: (text: string) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const clean = text.trim();
    if (!clean) return;
    setBusy(true);
    setError(null);
    try {
      await onAdd(clean);
      setText("");
    } catch (addError) {
      setError(describeFirestoreError(addError).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-base font-semibold text-foreground">Private notes</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Recruiter said they’ll reply next week? Interviewer’s name? Only you can see this.
      </p>
      {error ? <Alert variant="error" className="mt-4">{error}</Alert> : null}
      <form onSubmit={handleAdd} className="mt-4 flex flex-col gap-3">
        <TextareaField
          label="New note"
          rows={3}
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={busy}>
            {busy ? "Adding…" : "Add note"}
          </Button>
        </div>
      </form>
      <ul className="mt-6 flex flex-col gap-3">
        {notes.length === 0 ? (
          <li className="text-sm text-muted-foreground">No notes yet.</li>
        ) : (
          [...notes]
            .sort((a, b) => b.createdAt - a.createdAt)
            .map((note) => (
              <li key={note.id} className="flex items-start justify-between gap-3 rounded-md border border-border bg-muted/30 p-4">
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="whitespace-pre-wrap text-sm text-foreground">{note.text}</p>
                  <p className="text-xs text-muted-foreground">{formatDateForUser(note.createdAt, "d MMM yyyy · HH:mm")}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void onRemove(note.id)}
                  className="shrink-0 text-sm text-destructive hover:underline"
                  aria-label="Delete note"
                >
                  ✕
                </button>
              </li>
            ))
        )}
      </ul>
    </Card>
  );
}

function TimelineTab({
  events,
  onAddEvent,
}: {
  events: { id: string; label: string; at: number }[];
  onAddEvent: (label: string) => Promise<void>;
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const clean = text.trim();
    if (!clean) return;
    setBusy(true);
    try {
      await onAddEvent(clean);
      setText("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-base font-semibold text-foreground">Timeline</h2>
      <ol className="mt-5 flex flex-col gap-4">
        {events.length === 0 ? (
          <li className="text-sm text-muted-foreground">Nothing recorded yet — status changes appear here automatically.</li>
        ) : (
          events.map((event) => (
            <li key={event.id} className="relative flex gap-4 pl-4 before:absolute before:left-0 before:top-1.5 before:size-2 before:rounded-full before:bg-primary/60">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium text-foreground">{event.label}</p>
                <p className="text-xs text-muted-foreground">{formatDateForUser(event.at, "d MMM yyyy · HH:mm")}</p>
              </div>
            </li>
          ))
        )}
      </ol>
      <form onSubmit={handleAdd} className="mt-6 flex items-end gap-2 border-t border-border pt-4">
        <div className="flex-1">
          <TextareaField
            label="Add a timeline event"
            rows={1}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="e.g. Followed up with recruiter"
          />
        </div>
        <Button type="submit" size="sm" disabled={busy}>
          Add
        </Button>
      </form>
    </Card>
  );
}

export function ApplicationWorkspace({ id }: { id: string }) {
  const router = useRouter();
  const api = useApplication(id);
  const [tab, setTab] = useState<Tab>("overview");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (api.isLoading) {
    return (
      <div className="px-6 py-20 text-center text-sm text-muted-foreground">Loading application…</div>
    );
  }
  if (api.error || !api.application) {
    return (
      <div className="mx-auto max-w-md px-6 py-16">
        <Alert variant="error">
          {api.error ? describeFirestoreError(api.error).message : "This application couldn’t be found."}
        </Alert>
      </div>
    );
  }

  const application = api.application;

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "requirements", label: "Requirements" },
    { id: "cv", label: "CV match" },
    { id: "cover", label: "Cover letter" },
    { id: "notes", label: "Notes" },
    { id: "timeline", label: "Timeline" },
  ];

  return (
    <RequireAuth title="Sign in to open this application">
      <div className="flex min-h-dvh flex-col bg-muted/30">
        <AppHeader
          right={
            <Link href="/applications" className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
              All applications
            </Link>
          }
        />
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
          {deleteError ? <Alert variant="error" className="mb-4">{deleteError}</Alert> : null}
          <h1 className="truncate text-2xl font-bold tracking-tight text-foreground">
            {application.title}
          </h1>
          <p className="text-muted-foreground">{application.company}</p>

          <nav aria-label="Application sections" className="mt-6 flex gap-1 overflow-x-auto border-b border-border">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                aria-current={tab === item.id ? "page" : undefined}
                className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium ${
                  tab === item.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-6">
            {tab === "overview" ? (
              <OverviewTab
                application={application}
                onSaveDetails={async (values) => {
                  await api.saveDetails(values, "Application details updated");
                }}
                onUpdateStatus={api.updateStatus}
                onMarkApplied={api.markApplied}
                onToggleFavorite={async () => api.setFavorite(!application.favorite)}
                onDelete={async () => {
                  setDeleting(true);
                  setDeleteError(null);
                  try {
                    await api.remove();
                    router.push("/applications");
                  } catch (deleteErr) {
                    setDeleteError(describeFirestoreError(deleteErr).message);
                    setDeleting(false);
                  }
                }}
                deleting={deleting}
              />
            ) : null}
            {tab === "requirements" ? (
              <RequirementsTab
                description={application.jobDescription ?? ""}
                saved={application.requirements}
                onSave={api.saveAnalysis}
              />
            ) : null}
            {tab === "cv" ? (
              <CvMatchTab
                requirements={application.requirements}
                onOpenRequirements={() => setTab("requirements")}
              />
            ) : null}
            {tab === "cover" ? (
              <CoverLetterTab
                applicationId={application.id}
                jobTitle={application.title}
                company={application.company}
                initial={application.coverLetter}
                onSave={api.saveLetter}
              />
            ) : null}
            {tab === "notes" ? (
              <NotesTab
                notes={application.notes}
                onAdd={api.addNoteText}
                onRemove={api.removeNoteById}
              />
            ) : null}
            {tab === "timeline" ? (
              <TimelineTab events={api.events} onAddEvent={api.addCustomEvent} />
            ) : null}
          </div>

          <p className="mt-8 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
            Checklist and interview tools join this workspace in the next builds.
          </p>
        </main>
      </div>
    </RequireAuth>
  );
}
