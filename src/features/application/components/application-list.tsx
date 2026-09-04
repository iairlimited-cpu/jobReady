"use client";

import Link from "next/link";
import { useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SelectField } from "@/components/ui/select-field";
import { TextField } from "@/components/ui/text-field";
import { LinkButton } from "@/components/ui/link-button";
import { AppHeader } from "@/components/app-header";
import { RequireAuth } from "@/features/auth/guards";
import { useAuth } from "@/features/auth/auth-context";
import { updateApplication } from "@/features/application/api";
import { StatusBadge } from "@/features/application/components/status-badge";
import {
  DEFAULT_APPLICATION_FILTERS,
  filterApplications,
  isOverdue,
} from "@/features/application/helpers";
import { useApplications } from "@/features/application/use-applications";
import { APPLICATION_STATUSES, STATUS_META } from "@/features/application/types";
import type { ApplicationSortKey, ApplicationStatus } from "@/features/application/types";
import { describeFirestoreError } from "@/lib/errors";
import { formatDateForUser } from "@/lib/dates";

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <Card className="p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
    </Card>
  );
}

function ApplicationRow({
  id,
  title,
  company,
  status,
  deadline,
  updatedAt,
  favorite,
  onToggleFavorite,
}: {
  id: string;
  title: string;
  company: string;
  status: ApplicationStatus;
  deadline?: number;
  updatedAt: number;
  favorite: boolean;
  onToggleFavorite: () => void;
}) {
  const overdue = deadline !== undefined && isOverdue({ deadline, status });

  return (
    <Card className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <Link
          href={`/applications/edit?id=${encodeURIComponent(id)}`}
          className="min-w-0 flex-1"
        >
          <p className="truncate font-semibold text-foreground hover:text-primary">
            {title}
          </p>
          <p className="truncate text-sm text-muted-foreground">{company}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <StatusBadge status={status} />
            {deadline ? (
              <span
                className={
                  overdue
                    ? "text-sm font-medium text-destructive"
                    : "text-sm text-muted-foreground"
                }
              >
                {overdue ? "Deadline passed · " : "Deadline "}
                {formatDateForUser(deadline)}
              </span>
            ) : null}
            <span className="text-xs text-muted-foreground">
              Updated {formatDateForUser(updatedAt)}
            </span>
          </div>
        </Link>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 text-warning-foreground"
          onClick={() => void onToggleFavorite()}
          aria-pressed={favorite}
          aria-label={favorite ? "Remove from favourites" : "Add to favourites"}
        >
          {favorite ? "★" : "☆"}
        </Button>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <LinkButton
          href={`/applications/edit?id=${encodeURIComponent(id)}`}
          size="sm"
          variant="outline"
        >
          Open
        </LinkButton>
      </div>
    </Card>
  );
}

export function ApplicationList() {
  const { user } = useAuth();
  const { applications, stats, isLoading, error, mutate } = useApplications();
  const [filters, setFilters] = useState(DEFAULT_APPLICATION_FILTERS);
  const [actionError, setActionError] = useState<string | null>(null);

  const visible = filterApplications(applications, filters);

  async function toggleFavorite(id: string, current: boolean) {
    if (!user) return;
    setActionError(null);
    try {
      await updateApplication(id, { favorite: !current });
      await mutate();
    } catch (toggleError) {
      setActionError(describeFirestoreError(toggleError).message);
    }
  }

  return (
    <RequireAuth
      title="Sign in to track applications"
      description="Your applications and notes are private to your account."
    >
      <div className="flex min-h-dvh flex-col bg-muted/30">
        <AppHeader
          right={
            <LinkButton href="/applications/new" size="sm">
              New application
            </LinkButton>
          }
        />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Applications
          </h1>

          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Active applications" value={stats.active} />
            <StatCard label="Interviews" value={stats.interviews} />
            <StatCard label="Offers" value={stats.offers} />
            <StatCard
              label="Interview rate"
              value={stats.interviewRate === null ? "—" : `${stats.interviewRate}%`}
              hint="Of tracked applications"
            />
          </div>

          {actionError ? <Alert variant="error" className="mt-4">{actionError}</Alert> : null}
          {error ? <Alert variant="error" className="mt-4">Couldn’t load your applications.</Alert> : null}

          <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
            <TextField
              label="Search"
              value={filters.query}
              onChange={(event) =>
                setFilters((current) => ({ ...current, query: event.target.value }))
              }
              placeholder="Search by job title or company"
            />
            <SelectField
              label="Status"
              className="w-full sm:w-44"
              value={filters.status}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  status: event.target.value as ApplicationStatus | "all",
                }))
              }
            >
              <option value="all">All statuses</option>
              {APPLICATION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_META[status].label}
                </option>
              ))}
            </SelectField>
            <SelectField
              label="Sort by"
              className="w-full sm:w-40"
              value={filters.sort}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  sort: event.target.value as ApplicationSortKey,
                }))
              }
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="deadline">Deadline</option>
              <option value="company">Company</option>
            </SelectField>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {isLoading ? (
              <div aria-busy="true" className="h-24 animate-pulse rounded-lg bg-muted" />
            ) : null}
            {!isLoading && applications.length === 0 ? (
              <Card className="flex flex-col items-center gap-3 p-10 text-center">
                <p className="font-semibold text-foreground">
                  You don’t have any applications yet.
                </p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Create an application for the job you found and JOBREADY will help
                  you get it ready step by step.
                </p>
                <LinkButton href="/applications/new">Create your first application</LinkButton>
              </Card>
            ) : null}
            {!isLoading && applications.length > 0 && visible.length === 0 ? (
              <Card className="p-8 text-center text-sm text-muted-foreground">
                No applications match your filters.
              </Card>
            ) : null}
            {visible.map((application) => (
              <ApplicationRow
                key={application.id}
                id={application.id}
                title={application.title}
                company={application.company}
                status={application.status}
                deadline={application.deadline}
                updatedAt={application.updatedAt}
                favorite={application.favorite}
                onToggleFavorite={() => toggleFavorite(application.id, application.favorite)}
              />
            ))}
          </div>
        </main>
      </div>
    </RequireAuth>
  );
}
