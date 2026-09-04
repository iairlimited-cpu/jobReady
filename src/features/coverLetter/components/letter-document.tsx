"use client";

import { useEffect, useState } from "react";

import { formatDateForUser } from "@/lib/dates";
import type { CoverLetterData } from "@/features/coverLetter/types";

/** Renders today’s date, set once after mount (keeps rendering pure). */
function TodayLabel() {
  const [label, setLabel] = useState<string>("");
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLabel(formatDateForUser(Date.now(), "d MMMM yyyy"));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  if (!label) return null;
  return <p className="mt-6">{label}</p>;
}

/**
 * Shared letter layout — used by the workspace preview and the print route,
 * so on-screen ≈ exported PDF (same DOM + CSS).
 */
export function LetterDocument({
  data,
  jobTitle,
  company,
}: {
  data: CoverLetterData;
  jobTitle: string;
  company: string;
}) {
  return (
    <div className="font-serif text-[0.92rem] leading-relaxed text-slate-900">
      {data.applicantName ? (
        <p className="font-semibold">{data.applicantName}</p>
      ) : null}
      <TodayLabel />

      <div className="mt-6">
        <p>{data.recipient || "Hiring Manager"}</p>
        {company ? <p>{company}</p> : null}
        {jobTitle ? <p>Re: {jobTitle}</p> : null}
      </div>

      {data.salutation ? <p className="mt-6">{data.salutation}</p> : null}
      {data.opening.trim() ? (
        <p className="mt-4 whitespace-pre-wrap">{data.opening}</p>
      ) : null}
      {data.experience.trim() ? (
        <p className="mt-4 whitespace-pre-wrap">{data.experience}</p>
      ) : null}
      {data.whyRole.trim() ? (
        <p className="mt-4 whitespace-pre-wrap">{data.whyRole}</p>
      ) : null}

      {data.closingSalutation ? <p className="mt-6">{data.closingSalutation}</p> : null}
      {data.applicantName ? <p className="mt-1">{data.applicantName}</p> : null}
    </div>
  );
}
