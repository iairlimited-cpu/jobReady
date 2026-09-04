"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { TextareaField } from "@/components/ui/textarea-field";
import {
  addArrayItem,
  createId,
  moveArrayItem,
  removeArrayItem,
  toggleInList,
  updateArrayItem,
} from "@/features/resume/helpers";
import type {
  Award,
  Certification,
  CustomSection,
  Language,
  MonthYear,
  Period,
  PersonalDetails,
  ResumeExperience,
  ResumeEducation,
  ResumeProject,
  Volunteer,
} from "@/features/resume/types";

/* ------------------------------------------------------------------ */
/* Small shared controls                                               */
/* ------------------------------------------------------------------ */

function ItemToolbar({
  index,
  total,
  onMove,
  onRemove,
  removeLabel,
}: {
  index: number;
  total: number;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  removeLabel: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="size-8 px-0"
        disabled={index === 0}
        onClick={() => onMove(-1)}
        aria-label="Move up"
      >
        ↑
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="size-8 px-0"
        disabled={index === total - 1}
        onClick={() => onMove(1)}
        aria-label="Move down"
      >
        ↓
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="size-8 px-0 text-destructive"
        onClick={onRemove}
        aria-label={removeLabel}
      >
        ✕
      </Button>
    </div>
  );
}

function ItemCard({
  title,
  index,
  total,
  onMove,
  onRemove,
  children,
}: {
  title: string;
  index: number;
  total: number;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-muted/30 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <ItemToolbar
          index={index}
          total={total}
          onMove={onMove}
          onRemove={onRemove}
          removeLabel={`Remove ${title}`}
        />
      </div>
      {children}
    </div>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button type="button" variant="secondary" size="sm" onClick={onClick}>
      + {label}
    </Button>
  );
}

/** Bullet-point editor shared by experience/projects/volunteer. */
function BulletEditor({
  bullets,
  onChange,
}: {
  bullets: string[];
  onChange: (bullets: string[]) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-foreground">Bullet points</p>
      {bullets.map((bullet, index) => (
        <div key={index} className="flex items-start gap-2">
          <TextField
            label={`Bullet ${index + 1}`}
            className="flex-1"
            value={bullet}
            onChange={(event) =>
              onChange(
                bullets.map((item, i) => (i === index ? event.target.value : item)),
              )
            }
            placeholder="What you did and the result"
          />
          <button
            type="button"
            onClick={() => onChange(bullets.filter((_, i) => i !== index))}
            className="mt-7 grid size-8 shrink-0 place-items-center rounded-md text-sm text-destructive hover:bg-destructive-soft"
            aria-label={`Remove bullet ${index + 1}`}
          >
            ✕
          </button>
        </div>
      ))}
      <div>
        <AddButton
          label="Add bullet"
          onClick={() => onChange([...bullets, ""])}
        />
      </div>
    </div>
  );
}

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);
const YEAR_START = new Date().getFullYear() - 50;
const YEAR_OPTIONS = Array.from({ length: 60 }, (_, i) => YEAR_START + i);

function YearMonthSelect({
  value,
  onChange,
  ariaLabel,
}: {
  value?: MonthYear;
  onChange: (value: MonthYear | undefined) => void;
  ariaLabel: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="sr-only">{ariaLabel} month</label>
      <select
        className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        value={value?.month ?? ""}
        onChange={(event) => {
          const month = event.target.value === "" ? undefined : Number(event.target.value);
          onChange({ month, year: value?.year });
        }}
      >
        <option value="">Month</option>
        {MONTH_OPTIONS.map((month) => (
          <option key={month} value={month}>
            {month}
          </option>
        ))}
      </select>
      <label className="sr-only">{ariaLabel} year</label>
      <select
        className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        value={value?.year ?? ""}
        onChange={(event) => {
          const year = event.target.value === "" ? undefined : Number(event.target.value);
          onChange({ month: value?.month, year });
        }}
      >
        <option value="">Year</option>
        {YEAR_OPTIONS.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Date range editor (From / To or Present). */
function PeriodEditor({
  period,
  onChange,
}: {
  period: Period | undefined;
  onChange: (period: Period | undefined) => void;
}) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-md border border-border bg-background p-3">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">From</span>
        <YearMonthSelect
          ariaLabel="Start"
          value={period?.start}
          onChange={(start) => onChange({ ...period, start })}
        />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">To</span>
        {period?.present ? (
          <span className="flex h-9 items-center text-sm text-muted-foreground">
            Present
          </span>
        ) : (
          <YearMonthSelect
            ariaLabel="End"
            value={period?.end}
            onChange={(end) => onChange({ ...period, end, present: false })}
          />
        )}
      </div>
      <label className="flex items-center gap-2 pb-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          className="size-4 accent-[var(--primary)]"
          checked={period?.present ?? false}
          onChange={(event) =>
            onChange({
              ...period,
              present: event.target.checked,
              end: event.target.checked ? undefined : period?.end,
            })
          }
        />
        Current
      </label>
    </div>
  );
}

function clearEmpty(period: Period | undefined): Period | undefined {
  if (!period) return undefined;
  const hasData =
    period.start?.month || period.start?.year || period.end?.month || period.end?.year || period.present;
  return hasData ? period : undefined;
}

/* ------------------------------------------------------------------ */
/* Section editors                                                     */
/* ------------------------------------------------------------------ */

export function PersonalFieldsEditor({
  value,
  onChange,
}: {
  value: PersonalDetails;
  onChange: (value: PersonalDetails) => void;
}) {
  const set = (field: keyof PersonalDetails) => (text: string) =>
    onChange({ ...value, [field]: text });
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Full name" value={value.fullName} onChange={(e) => set("fullName")(e.target.value)} />
        <TextField label="Professional title" value={value.professionalTitle} onChange={(e) => set("professionalTitle")(e.target.value)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Email" type="email" value={value.email} onChange={(e) => set("email")(e.target.value)} />
        <TextField label="Phone" value={value.phone} onChange={(e) => set("phone")(e.target.value)} />
      </div>
      <TextField label="Location" value={value.location} onChange={(e) => set("location")(e.target.value)} placeholder="City, Country" />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Website" value={value.website} onChange={(e) => set("website")(e.target.value)} placeholder="https://…" />
        <TextField label="LinkedIn" value={value.linkedin} onChange={(e) => set("linkedin")(e.target.value)} placeholder="https://linkedin.com/in/…" />
      </div>
    </div>
  );
}

export function SummaryEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <TextareaField
      label="Professional summary"
      rows={7}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      hint="2–4 sentences about who you are and what you bring. Only include what is true."
    />
  );
}

export function SkillsEditor({
  value,
  onChange,
}: {
  value: string[];
  onChange: (value: string[]) => void;
}) {
  function add(raw: string) {
    const skill = raw.trim();
    if (!skill) return;
    onChange(toggleInList(value, skill));
  }
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Type a skill and press Enter to add it. Click ✕ to remove.
      </p>
      <TextField
        label="Add a skill"
        placeholder="e.g. React — press Enter"
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            const input = event.currentTarget;
            add(input.value);
            input.value = "";
          }
        }}
      />
      {value.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {value.map((skill, index) => (
            <span
              key={`${skill}-${index}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-sm text-primary-soft-foreground"
            >
              {skill}
              <button
                type="button"
                onClick={() => onChange(value.filter((_, i) => i !== index))}
                aria-label={`Remove ${skill}`}
                className="grid size-4 place-items-center rounded-full text-xs hover:bg-primary-soft/70"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ExperienceEditor({
  value,
  onChange,
}: {
  value: ResumeExperience[];
  onChange: (value: ResumeExperience[]) => void;
}) {
  const factory = (): ResumeExperience => ({
    id: createId("exp"),
    role: "",
    company: "",
    period: undefined,
    bullets: [],
  });
  return (
    <div className="flex flex-col gap-4">
      {value.map((item, index) => (
        <ItemCard
          key={item.id}
          title={item.role || item.company || `Position ${index + 1}`}
          index={index}
          total={value.length}
          onMove={(direction) => onChange(moveArrayItem(value, index, direction))}
          onRemove={() => onChange(removeArrayItem(value, item.id))}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Job title" value={item.role} onChange={(e) => onChange(updateArrayItem(value, item.id, (it) => ({ ...it, role: e.target.value })))} />
            <TextField label="Company" value={item.company} onChange={(e) => onChange(updateArrayItem(value, item.id, (it) => ({ ...it, company: e.target.value })))} />
          </div>
          <TextField label="Location (optional)" value={item.location ?? ""} onChange={(e) => onChange(updateArrayItem(value, item.id, (it) => ({ ...it, location: e.target.value })))} />
          <PeriodEditor period={item.period} onChange={(period) => onChange(updateArrayItem(value, item.id, (it) => ({ ...it, period: clearEmpty(period) })))} />
          <BulletEditor bullets={item.bullets} onChange={(bullets) => onChange(updateArrayItem(value, item.id, (it) => ({ ...it, bullets })))} />
        </ItemCard>
      ))}
      <div>
        <AddButton label="Add position" onClick={() => onChange(addArrayItem(value, factory))} />
      </div>
    </div>
  );
}

export function EducationEditor({
  value,
  onChange,
}: {
  value: ResumeEducation[];
  onChange: (value: ResumeEducation[]) => void;
}) {
  const factory = (): ResumeEducation => ({
    id: createId("edu"),
    school: "",
    degree: "",
    field: undefined,
    location: undefined,
    period: undefined,
  });
  return (
    <div className="flex flex-col gap-4">
      {value.map((item, index) => (
        <ItemCard
          key={item.id}
          title={item.school || item.degree || `Education ${index + 1}`}
          index={index}
          total={value.length}
          onMove={(direction) => onChange(moveArrayItem(value, index, direction))}
          onRemove={() => onChange(removeArrayItem(value, item.id))}
        >
          <TextField label="School / institution" value={item.school} onChange={(e) => onChange(updateArrayItem(value, item.id, (it) => ({ ...it, school: e.target.value })))} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Degree" value={item.degree} onChange={(e) => onChange(updateArrayItem(value, item.id, (it) => ({ ...it, degree: e.target.value })))} />
            <TextField label="Field of study" value={item.field ?? ""} onChange={(e) => onChange(updateArrayItem(value, item.id, (it) => ({ ...it, field: e.target.value })))} />
          </div>
          <TextField label="Location (optional)" value={item.location ?? ""} onChange={(e) => onChange(updateArrayItem(value, item.id, (it) => ({ ...it, location: e.target.value })))} />
          <PeriodEditor period={item.period} onChange={(period) => onChange(updateArrayItem(value, item.id, (it) => ({ ...it, period: clearEmpty(period) })))} />
        </ItemCard>
      ))}
      <div>
        <AddButton label="Add education" onClick={() => onChange(addArrayItem(value, factory))} />
      </div>
    </div>
  );
}

export function ProjectsEditor({
  value,
  onChange,
}: {
  value: ResumeProject[];
  onChange: (value: ResumeProject[]) => void;
}) {
  const factory = (): ResumeProject => ({ id: createId("proj"), name: "", link: undefined, bullets: [] });
  return (
    <div className="flex flex-col gap-4">
      {value.map((item, index) => (
        <ItemCard
          key={item.id}
          title={item.name || `Project ${index + 1}`}
          index={index}
          total={value.length}
          onMove={(direction) => onChange(moveArrayItem(value, index, direction))}
          onRemove={() => onChange(removeArrayItem(value, item.id))}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Project name" value={item.name} onChange={(e) => onChange(updateArrayItem(value, item.id, (it) => ({ ...it, name: e.target.value })))} />
            <TextField label="Link (optional)" value={item.link ?? ""} onChange={(e) => onChange(updateArrayItem(value, item.id, (it) => ({ ...it, link: e.target.value })))} placeholder="https://…" />
          </div>
          <BulletEditor bullets={item.bullets} onChange={(bullets) => onChange(updateArrayItem(value, item.id, (it) => ({ ...it, bullets })))} />
        </ItemCard>
      ))}
      <div>
        <AddButton label="Add project" onClick={() => onChange(addArrayItem(value, factory))} />
      </div>
    </div>
  );
}

function YearField({
  value,
  onChange,
  label,
}: {
  value?: number;
  onChange: (value?: number) => void;
  label: string;
}) {
  return (
    <TextField
      label={label}
      type="number"
      min={1900}
      max={2100}
      value={value ?? ""}
      onChange={(event) =>
        onChange(event.target.value === "" ? undefined : Number(event.target.value))
      }
      className="w-32"
    />
  );
}

export function CertificationsEditor({
  value,
  onChange,
}: {
  value: Certification[];
  onChange: (value: Certification[]) => void;
}) {
  const factory = (): Certification => ({ id: createId("cert"), name: "", issuer: undefined, year: undefined });
  return (
    <div className="flex flex-col gap-4">
      {value.map((item, index) => (
        <ItemCard
          key={item.id}
          title={item.name || `Certification ${index + 1}`}
          index={index}
          total={value.length}
          onMove={(direction) => onChange(moveArrayItem(value, index, direction))}
          onRemove={() => onChange(removeArrayItem(value, item.id))}
        >
          <TextField label="Certification" value={item.name} onChange={(e) => onChange(updateArrayItem(value, item.id, (it) => ({ ...it, name: e.target.value })))} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Issuer (optional)" value={item.issuer ?? ""} onChange={(e) => onChange(updateArrayItem(value, item.id, (it) => ({ ...it, issuer: e.target.value })))} />
            <YearField label="Year (optional)" value={item.year} onChange={(year) => onChange(updateArrayItem(value, item.id, (it) => ({ ...it, year })))} />
          </div>
        </ItemCard>
      ))}
      <div>
        <AddButton label="Add certification" onClick={() => onChange(addArrayItem(value, factory))} />
      </div>
    </div>
  );
}

export function LanguagesEditor({
  value,
  onChange,
}: {
  value: Language[];
  onChange: (value: Language[]) => void;
}) {
  const factory = (): Language => ({ id: createId("lang"), name: "", level: undefined });
  return (
    <div className="flex flex-col gap-4">
      {value.map((item, index) => (
        <ItemCard
          key={item.id}
          title={item.name || `Language ${index + 1}`}
          index={index}
          total={value.length}
          onMove={(direction) => onChange(moveArrayItem(value, index, direction))}
          onRemove={() => onChange(removeArrayItem(value, item.id))}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Language" value={item.name} onChange={(e) => onChange(updateArrayItem(value, item.id, (it) => ({ ...it, name: e.target.value })))} />
            <TextField label="Level (optional)" value={item.level ?? ""} placeholder="e.g. Fluent, Native, B2" onChange={(e) => onChange(updateArrayItem(value, item.id, (it) => ({ ...it, level: e.target.value })))} />
          </div>
        </ItemCard>
      ))}
      <div>
        <AddButton label="Add language" onClick={() => onChange(addArrayItem(value, factory))} />
      </div>
    </div>
  );
}

export function AwardsEditor({
  value,
  onChange,
}: {
  value: Award[];
  onChange: (value: Award[]) => void;
}) {
  const factory = (): Award => ({ id: createId("award"), title: "", issuer: undefined, year: undefined });
  return (
    <div className="flex flex-col gap-4">
      {value.map((item, index) => (
        <ItemCard
          key={item.id}
          title={item.title || `Award ${index + 1}`}
          index={index}
          total={value.length}
          onMove={(direction) => onChange(moveArrayItem(value, index, direction))}
          onRemove={() => onChange(removeArrayItem(value, item.id))}
        >
          <TextField label="Award" value={item.title} onChange={(e) => onChange(updateArrayItem(value, item.id, (it) => ({ ...it, title: e.target.value })))} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Issuer (optional)" value={item.issuer ?? ""} onChange={(e) => onChange(updateArrayItem(value, item.id, (it) => ({ ...it, issuer: e.target.value })))} />
            <YearField label="Year (optional)" value={item.year} onChange={(year) => onChange(updateArrayItem(value, item.id, (it) => ({ ...it, year })))} />
          </div>
        </ItemCard>
      ))}
      <div>
        <AddButton label="Add award" onClick={() => onChange(addArrayItem(value, factory))} />
      </div>
    </div>
  );
}

export function VolunteerEditor({
  value,
  onChange,
}: {
  value: Volunteer[];
  onChange: (value: Volunteer[]) => void;
}) {
  const factory = (): Volunteer => ({
    id: createId("vol"),
    role: "",
    organization: "",
    period: undefined,
    bullets: [],
  });
  return (
    <div className="flex flex-col gap-4">
      {value.map((item, index) => (
        <ItemCard
          key={item.id}
          title={item.role || item.organization || `Volunteer ${index + 1}`}
          index={index}
          total={value.length}
          onMove={(direction) => onChange(moveArrayItem(value, index, direction))}
          onRemove={() => onChange(removeArrayItem(value, item.id))}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Role" value={item.role} onChange={(e) => onChange(updateArrayItem(value, item.id, (it) => ({ ...it, role: e.target.value })))} />
            <TextField label="Organization" value={item.organization} onChange={(e) => onChange(updateArrayItem(value, item.id, (it) => ({ ...it, organization: e.target.value })))} />
          </div>
          <PeriodEditor period={item.period} onChange={(period) => onChange(updateArrayItem(value, item.id, (it) => ({ ...it, period: clearEmpty(period) })))} />
          <BulletEditor bullets={item.bullets} onChange={(bullets) => onChange(updateArrayItem(value, item.id, (it) => ({ ...it, bullets })))} />
        </ItemCard>
      ))}
      <div>
        <AddButton label="Add volunteer role" onClick={() => onChange(addArrayItem(value, factory))} />
      </div>
    </div>
  );
}

export function CustomSectionsEditor({
  value,
  onChange,
}: {
  value: CustomSection[];
  onChange: (value: CustomSection[]) => void;
}) {
  const factory = (): CustomSection => ({ id: createId("custom"), title: "", entries: [] });
  return (
    <div className="flex flex-col gap-4">
      {value.map((item, index) => (
        <ItemCard
          key={item.id}
          title={item.title || `Custom section ${index + 1}`}
          index={index}
          total={value.length}
          onMove={(direction) => onChange(moveArrayItem(value, index, direction))}
          onRemove={() => onChange(removeArrayItem(value, item.id))}
        >
          <TextField label="Section title" value={item.title} onChange={(e) => onChange(updateArrayItem(value, item.id, (it) => ({ ...it, title: e.target.value })))} placeholder="e.g. Publications" />
          <BulletEditor bullets={item.entries} onChange={(entries) => onChange(updateArrayItem(value, item.id, (it) => ({ ...it, entries })))} />
        </ItemCard>
      ))}
      <div>
        <AddButton label="Add custom section" onClick={() => onChange(addArrayItem(value, factory))} />
      </div>
    </div>
  );
}
