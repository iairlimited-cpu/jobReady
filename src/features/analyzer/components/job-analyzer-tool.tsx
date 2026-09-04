"use client";

import { useMemo, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextareaField } from "@/components/ui/textarea-field";
import { LinkButton } from "@/components/ui/link-button";
import { analyzeJobDescription } from "@/features/analyzer/analyzer";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type AnalysisResult,
} from "@/features/analyzer/types";
import { formatDateForUser } from "@/lib/dates";

const SAMPLE_JD = `Software Engineer (React, TypeScript)
Acme is hiring a Senior Frontend Engineer.

Requirements
- 3+ years of experience building web applications with React and TypeScript.
- Strong knowledge of AWS, Docker and REST APIs.
- Experience with GraphQL is a plus.
- Must have a Bachelor's degree or equivalent.
- AWS Certified Developer preferred.
- Excellent communication and collaboration skills.

Responsibilities
- Build and maintain responsive user interfaces.
- Write unit tests and participate in code reviews.
- Collaborate with product and design teams.
`;

const IMPORTANCE_META = {
  must: { label: "Must-have", tone: "warning" as const },
  nice: { label: "Good to have", tone: "success" as const },
  unknown: { label: "Mentioned", tone: "neutral" as const },
};

function RequirementGroup({
  category,
  requirements,
}: {
  category: (typeof CATEGORY_ORDER)[number];
  requirements: AnalysisResult["requirements"];
}) {
  if (requirements.length === 0) return null;
  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground">
        {CATEGORY_LABELS[category]}
      </h2>
      <ul className="mt-3 flex flex-col gap-2">
        {requirements.map((req) => {
          const meta = IMPORTANCE_META[req.importance];
          return (
            <li key={req.id} className="flex items-start gap-3 rounded-md border border-border bg-card p-3">
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-foreground">{req.label}</span>
                {req.evidence[0] ? (
                  <span className="mt-0.5 block text-xs italic text-muted-foreground">
                    “{req.evidence[0]}”
                  </span>
                ) : null}
              </span>
              <Badge variant={meta.tone}>{meta.label}</Badge>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function JobAnalyzerTool() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [tooLong, setTooLong] = useState(false);

  const mustCount = useMemo(
    () => result?.requirements.filter((req) => req.importance === "must").length ?? 0,
    [result],
  );

  function handleAnalyze() {
    if (text.trim().length === 0) return;
    if (text.trim().length > 50000) {
      setTooLong(true);
      return;
    }
    setTooLong(false);
    setResult(analyzeJobDescription(text));
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="flex flex-col gap-4">
        <TextareaField
          label="Job description"
          rows={18}
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setResult(null);
            setTooLong(false);
          }}
          placeholder="Paste the full job description here…"
        />
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" onClick={handleAnalyze} disabled={text.trim().length === 0}>
            Analyze this job
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setText(SAMPLE_JD);
              setResult(null);
              setTooLong(false);
            }}
          >
            Use a sample job
          </Button>
        </div>
        {tooLong ? (
          <Alert variant="error">
            That description is longer than we can analyze (max 50,000 characters).
          </Alert>
        ) : null}
        <p className="text-sm text-muted-foreground">
          The analysis runs entirely in your browser — nothing you paste is sent to a
          server or stored.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {result === null ? (
          <Card className="flex flex-col items-center gap-3 p-10 text-center">
            <p className="font-semibold text-foreground">What the job asks for</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Paste a job description and JOBREADY will pull out the skills,
              technologies, experience, qualifications and responsibilities — with
              the exact wording it found them in.
            </p>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Analyzed {formatDateForUser(result.analyzedAt, "d MMM yyyy · HH:mm")} ·
                {result.requirements.length} items found
              </p>
              <Badge variant="warning">{mustCount} must-have</Badge>
            </div>
            <div className="flex flex-col gap-6">
              {CATEGORY_ORDER.map((category) => (
                <RequirementGroup
                  key={category}
                  category={category}
                  requirements={result.requirements.filter(
                    (req) => req.category === category,
                  )}
                />
              ))}
            </div>
            {result.requirements.length === 0 ? (
              <Alert variant="info">
                We didn’t recognize clear requirements in that text. Try the sample
                job to see how it works.
              </Alert>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

export function AnalyzerCta() {
  return (
    <p className="mt-6 text-sm text-muted-foreground">
      Ready to take the next step?{" "}
      <LinkButton href="/auth/signup" variant="link" className="h-auto p-0">
        Create an account
      </LinkButton>{" "}
      to save analyses to each application workspace.
    </p>
  );
}
