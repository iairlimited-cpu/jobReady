import { format } from "date-fns";

import { visibleSections } from "@/features/resume/helpers";
import type {
  MonthYear,
  Period,
  PersonalDetails,
  ResumeData,
  SectionKey,
} from "@/features/resume/types";

/* ------------------------------------------------------------------ */
/* Date helpers                                                        */
/* ------------------------------------------------------------------ */

export function monthYearToString(value?: MonthYear): string {
  if (!value) return "";
  if (value.year && value.month) {
    return format(new Date(value.year, value.month - 1, 1), "MMM yyyy");
  }
  if (value.year) return String(value.year);
  return "";
}

export function formatPeriod(period?: Period): string {
  if (!period) return "";
  const start = monthYearToString(period.start);
  const end = period.present
    ? "Present"
    : monthYearToString(period.end);
  return [start, end].filter(Boolean).join(" – ");
}

/* ------------------------------------------------------------------ */
/* Contact parts                                                       */
/* ------------------------------------------------------------------ */

export interface ContactPart {
  value: string;
  href?: string;
}

export function contactParts(personal: PersonalDetails): ContactPart[] {
  const parts: ContactPart[] = [];
  if (personal.email) parts.push({ value: personal.email, href: `mailto:${personal.email}` });
  if (personal.phone) parts.push({ value: personal.phone, href: `tel:${personal.phone.replace(/[^\d+]/g, "")}` });
  if (personal.location) parts.push({ value: personal.location });
  if (personal.website) parts.push({ value: personal.website.replace(/^https?:\/\//i, ""), href: personal.website });
  if (personal.linkedin) parts.push({ value: personal.linkedin.replace(/^https?:\/\/(www\.)?/i, ""), href: personal.linkedin });
  return parts;
}

/* ------------------------------------------------------------------ */
/* Bullets                                                             */
/* ------------------------------------------------------------------ */

export function Bullets({ items, className }: { items: string[]; className?: string }) {
  const filtered = items.map((item) => item.trim()).filter(Boolean);
  if (filtered.length === 0) return null;
  return (
    <ul className={className ?? "mt-1 list-disc space-y-0.5 pl-4 text-[0.8rem] leading-snug text-slate-700 marker:text-slate-400"}>
      {filtered.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Ordered content sections for a document                             */
/* ------------------------------------------------------------------ */

export function documentSections(data: ResumeData): SectionKey[] {
  return visibleSections(data).filter((key) => key !== "personal");
}
