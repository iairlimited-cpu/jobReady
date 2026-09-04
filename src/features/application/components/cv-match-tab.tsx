"use client";

import { useMemo, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SelectField } from "@/components/ui/select-field";
import { LinkButton } from "@/components/ui/link-button";
import type { ExtractedRequirement } from "@/features/analyzer/types";
import {
  matchResumeAgainstRequirements,
  matchSummaryLabel,
} from "@/features/matching/matching";
import type { MatchStatus } from "@/features/matching/types";
import { useResumeLibrary } from "@/features/resume/use-resume-library";

const STATUS_META: Record<MatchStatus, { label: string; variant: "success" | "warning" | "destructive" }> = {
  strong: { label: "✓ Found", variant: "success" },
  partial: { label: "⚠ Partially shown", variant: "warning" },
  not_found: { label: "✕ Not found in CV", variant: "destructive" },
};

export function CvMatchTab({
  requirements,
  onOpenRequirements,
}: {
  requirements: ExtractedRequirement[] | undefined;
  onOpenRequirements: () => void;
}) {
  const { resumes, isLoading: loadingResumes } = useResumeLibrary();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Select the most recently used CV by default once the list arrives.
  if (!selectedId && resumes.length > 0) {
    setSelectedId(resumes[0].id);
  }

  const selected = resumes.find((resume) => resume.id === selectedId) ?? null;
  const hasRequirements = Boolean(requirements && requirements.length > 0);

  const report = useMemo(() => {
    if (!hasRequirements || !selected) return null;
    return matchResumeAgainstRequirements(selected.data, requirements as ExtractedRequirement[]);
  }, [hasRequirements, selected, requirements]);

  if (!hasRequirements) {
    return (
      <Card className="flex flex-col items-start gap-4 p-8">
        <h2 className="text-base font-semibold text-foreground">CV matching</h2>
        <p className="text-sm text-muted-foreground">
          First analyze this job so there are requirements to compare against.
        </p>
        <Button type="button" onClick={onOpenRequirements}>
          Open the Requirements tab
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-base font-semibold text-foreground">CV matching</h2>

      {resumes.length === 0 ? (
        <div className="mt-4 flex flex-col items-start gap-3">
          <Alert variant="info">
            You don’t have a CV yet — create one to compare it against this job.
          </Alert>
          <LinkButton href="/resumes/new" size="sm">
            Create a CV
          </LinkButton>
        </div>
      ) : (
        <div className="mt-4 w-full sm:w-80">
          <SelectField
            label="Compare against CV"
            value={selectedId ?? ""}
            onChange={(event) => setSelectedId(event.target.value)}
            disabled={loadingResumes}
          >
            {resumes.map((resume) => (
              <option key={resume.id} value={resume.id}>
                {resume.name || "Untitled CV"}
              </option>
            ))}
          </SelectField>
        </div>
      )}

      {report ? (
        <div className="mt-6 flex flex-col gap-5">
          <div className="rounded-md border border-border bg-muted/40 p-4">
            <p className="font-semibold text-foreground">{matchSummaryLabel(report)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              A missing item simply may not be visible in your CV yet — it does not
              mean you lack the skill. We never predict whether you’ll get the job.
            </p>
          </div>

          {report.totals.notFound > 0 ? (
            <p className="text-sm text-muted-foreground">
              {report.totals.notFound} not shown — if they’re true of you, add them
              to your CV (only what’s honest).
            </p>
          ) : null}

          <ul className="flex flex-col gap-2">
            {report.results.map((result) => {
              const meta = STATUS_META[result.status];
              return (
                <li
                  key={result.requirement.id}
                  className="flex items-start gap-3 rounded-md border border-border bg-card p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {result.requirement.label}
                    </p>
                    {result.note ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">{result.note}</p>
                    ) : null}
                    {result.evidence.length > 0 ? (
                      <p className="mt-1 text-xs italic text-muted-foreground">
                        {result.evidence[0].location}: “{result.evidence[0].snippet}”
                      </p>
                    ) : null}
                  </div>
                  <Badge variant={meta.variant}>{meta.label}</Badge>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}
