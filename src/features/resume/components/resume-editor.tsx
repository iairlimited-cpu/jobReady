"use client";

import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SelectField } from "@/components/ui/select-field";
import { TextField } from "@/components/ui/text-field";
import { RESUME_TEMPLATES } from "@/config/resume-templates";
import {
  AwardsEditor,
  CertificationsEditor,
  CustomSectionsEditor,
  EducationEditor,
  ExperienceEditor,
  LanguagesEditor,
  PersonalFieldsEditor,
  ProjectsEditor,
  SkillsEditor,
  SummaryEditor,
  VolunteerEditor,
} from "@/features/resume/components/editors";
import { EstimatedPages } from "@/features/resume/components/estimated-pages";
import { ScaleToFit } from "@/features/resume/components/preview-pane";
import {
  moveSection,
  orderedSectionKeys,
  toggleSectionIncluded,
} from "@/features/resume/helpers";
import { ResumeSheet } from "@/features/resume/templates/preview";
import { cn } from "@/lib/cn";
import type { SectionKey } from "@/features/resume/types";
import type { EditorApi } from "@/features/resume/use-resume-editor";

const SECTION_LABELS: Record<SectionKey, string> = {
  personal: "Personal information",
  summary: "Summary",
  experience: "Work experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  languages: "Languages",
  awards: "Awards",
  volunteer: "Volunteer",
  custom: "Custom sections",
};

const SECTION_ORDER = orderedSectionKeys();

function SaveIndicator({ editor }: { editor: EditorApi }) {
  if (editor.isError) {
    return (
      <span className="text-sm font-medium text-destructive" role="alert">
        {editor.errorMessage ?? "Couldn’t load this CV."}
      </span>
    );
  }
  if (editor.saveStatus === "error") {
    return (
      <span className="text-sm font-medium text-destructive" role="alert">
        {editor.saveMessage ?? "Couldn’t save. You can keep editing — we’ll retry."}
      </span>
    );
  }
  if (editor.saveStatus === "saving") {
    return (
      <span aria-live="polite" className="text-sm text-muted-foreground">
        Saving…
      </span>
    );
  }
  if (editor.saveStatus === "saved") {
    return (
      <span aria-live="polite" className="text-sm text-success-foreground">
        Saved
      </span>
    );
  }
  return <span className="text-sm text-muted-foreground">Autosaves as you type</span>;
}

function Rail({
  editor,
  activeSection,
  onSelect,
}: {
  editor: EditorApi;
  activeSection: SectionKey;
  onSelect: (section: SectionKey) => void;
}) {
  const { data, setData } = editor;
  const included = data.preferences.includedSections;

  return (
    <nav aria-label="CV sections" className="flex flex-col gap-1">
      {SECTION_ORDER.map((section) => {
        const isIncluded = included.includes(section);
        const isActive = activeSection === section;
        return (
          <div
            key={section}
            className={cn(
              "flex items-center gap-1 rounded-md border border-transparent",
              isActive && "border-primary/30 bg-primary-soft/70",
            )}
          >
            <button
              type="button"
              onClick={() => onSelect(section)}
              className={cn(
                "min-w-0 flex-1 px-2 py-1.5 text-left text-sm",
                isActive
                  ? "font-semibold text-primary-soft-foreground"
                  : "text-foreground hover:bg-muted",
              )}
            >
              <span className="block truncate">{SECTION_LABELS[section]}</span>
            </button>
            {section !== "personal" ? (
              <span className="flex items-center">
                <button
                  type="button"
                  aria-label={`Show or hide ${SECTION_LABELS[section]} on the CV`}
                  aria-pressed={isIncluded}
                  title={isIncluded ? "Shown on CV" : "Hidden on CV"}
                  onClick={() => setData((previous) => toggleSectionIncluded(previous, section))}
                  className={cn(
                    "grid size-6 place-items-center rounded text-xs",
                    isIncluded
                      ? "text-success-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {isIncluded ? "✓" : "–"}
                </button>
              </span>
            ) : (
              <span className="w-6" />
            )}
          </div>
        );
      })}
      <div className="mt-2 flex flex-col gap-1 border-t border-border pt-2 text-xs text-muted-foreground">
        {included.map((section, index) => (
          <div key={section} className="flex items-center justify-between gap-1">
            <span className="truncate">{SECTION_LABELS[section]}</span>
            <span className="flex gap-0.5">
              <button
                type="button"
                aria-label={`Move ${SECTION_LABELS[section]} up`}
                disabled={index === 0}
                onClick={() => setData((previous) => moveSection(previous, section, -1))}
                className="grid size-6 place-items-center rounded hover:bg-muted disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                aria-label={`Move ${SECTION_LABELS[section]} down`}
                disabled={index === included.length - 1}
                onClick={() => setData((previous) => moveSection(previous, section, 1))}
                className="grid size-6 place-items-center rounded hover:bg-muted disabled:opacity-30"
              >
                ↓
              </button>
            </span>
          </div>
        ))}
      </div>
    </nav>
  );
}

function ActiveSectionEditor({
  editor,
  section,
}: {
  editor: EditorApi;
  section: SectionKey;
}) {
  const { data, setData } = editor;

  switch (section) {
    case "personal":
      return (
        <PersonalFieldsEditor
          value={data.personal}
          onChange={(personal) => setData((previous) => ({ ...previous, personal }))}
        />
      );
    case "summary":
      return (
        <SummaryEditor
          value={data.summary}
          onChange={(summary) => setData((previous) => ({ ...previous, summary }))}
        />
      );
    case "experience":
      return (
        <ExperienceEditor
          value={data.experience}
          onChange={(experience) => setData((previous) => ({ ...previous, experience }))}
        />
      );
    case "education":
      return (
        <EducationEditor
          value={data.education}
          onChange={(education) => setData((previous) => ({ ...previous, education }))}
        />
      );
    case "skills":
      return (
        <SkillsEditor
          value={data.skills}
          onChange={(skills) => setData((previous) => ({ ...previous, skills }))}
        />
      );
    case "projects":
      return (
        <ProjectsEditor
          value={data.projects}
          onChange={(projects) => setData((previous) => ({ ...previous, projects }))}
        />
      );
    case "certifications":
      return (
        <CertificationsEditor
          value={data.certifications}
          onChange={(certifications) =>
            setData((previous) => ({ ...previous, certifications }))
          }
        />
      );
    case "languages":
      return (
        <LanguagesEditor
          value={data.languages}
          onChange={(languages) => setData((previous) => ({ ...previous, languages }))}
        />
      );
    case "awards":
      return (
        <AwardsEditor
          value={data.awards}
          onChange={(awards) => setData((previous) => ({ ...previous, awards }))}
        />
      );
    case "volunteer":
      return (
        <VolunteerEditor
          value={data.volunteer}
          onChange={(volunteer) => setData((previous) => ({ ...previous, volunteer }))}
        />
      );
    case "custom":
      return (
        <CustomSectionsEditor
          value={data.customSections}
          onChange={(customSections) =>
            setData((previous) => ({ ...previous, customSections }))
          }
        />
      );
    default:
      return null;
  }
}

export function ResumeEditor({
  editor,
  notice,
  printHref,
}: {
  editor: EditorApi;
  notice?: ReactNode;
  printHref?: string;
}) {
  const [activeSection, setActiveSection] = useState<SectionKey>("personal");
  const [showPreview, setShowPreview] = useState(true);
  const [printing, setPrinting] = useState(false);

  async function handlePrint() {
    if (!printHref) return;
    setPrinting(true);
    try {
      await editor.saveNow();
    } catch {
      // Save errors are surfaced by the indicator; still open print (old data).
    }
    window.open(printHref, "_blank", "noopener");
    setPrinting(false);
  }

  if (editor.isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div aria-busy="true" className="h-12 animate-pulse rounded-md bg-muted" />
        <div aria-busy="true" className="h-[28rem] animate-pulse rounded-md bg-muted" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {notice ? notice : null}

      {/* Control bar */}
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <TextField
            label="CV name"
            value={editor.meta.name}
            onChange={(event) => editor.setMeta({ name: event.target.value })}
            placeholder="e.g. Software Engineer CV"
          />
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <SelectField
            label="Template"
            className="w-40"
            value={editor.meta.templateId}
            onChange={(event) =>
              editor.setMeta({ templateId: event.target.value as EditorApi["meta"]["templateId"] })
            }
          >
            {RESUME_TEMPLATES.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Page size"
            className="w-32"
            value={editor.meta.pageSize}
            onChange={(event) =>
              editor.setMeta({ pageSize: event.target.value as "A4" | "LETTER" })
            }
          >
            <option value="A4">A4</option>
            <option value="LETTER">US Letter</option>
          </SelectField>
          <div className="pb-2">
            <SaveIndicator editor={editor} />
          </div>
          {printHref ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void handlePrint()}
              disabled={printing}
            >
              {printing ? "Preparing…" : "Print / PDF"}
            </Button>
          ) : null}
          <div className="pb-1 xl:hidden">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPreview((value) => !value)}
              aria-expanded={showPreview}
            >
              {showPreview ? "Hide preview" : "Show preview"}
            </Button>
          </div>
        </div>
      </div>
      <p className="-mt-2 text-sm">
        <EstimatedPages
          data={editor.data}
          templateId={editor.meta.templateId}
          pageSize={editor.meta.pageSize}
        />
      </p>

      {/* Mobile section picker */}
      <div className="md:hidden">
        <SelectField
          label="Edit section"
          value={activeSection}
          onChange={(event) => setActiveSection(event.target.value as SectionKey)}
        >
          {SECTION_ORDER.map((section) => (
            <option key={section} value={section}>
              {SECTION_LABELS[section]}
            </option>
          ))}
        </SelectField>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[13rem_minmax(0,1fr)_minmax(0,32rem)]">
        {/* Left rail */}
        <aside className="sticky top-4 hidden rounded-lg border border-border bg-card p-2 md:block">
          <Rail editor={editor} activeSection={activeSection} onSelect={setActiveSection} />
        </aside>

        {/* Center editor */}
        <section className="min-w-0">
          <Card className="p-4 sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              {SECTION_LABELS[activeSection]}
            </h2>
            <ActiveSectionEditor editor={editor} section={activeSection} />
          </Card>
        </section>

        {/* Desktop preview column */}
        <aside className="hidden xl:block">
          <div className="sticky top-4 rounded-lg border border-border bg-muted/40 p-3">
            <ScaleToFit pageSize={editor.meta.pageSize}>
              <ResumeSheet
                data={editor.data}
                templateId={editor.meta.templateId}
                pageSize={editor.meta.pageSize}
              />
            </ScaleToFit>
          </div>
        </aside>
      </div>

      {/* Below-desktop preview toggle */}
      {showPreview ? (
        <div className="xl:hidden">
          <p className="mb-2 text-sm font-medium text-muted-foreground">Live preview</p>
          <div className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-3">
            <ScaleToFit pageSize={editor.meta.pageSize}>
              <ResumeSheet
                data={editor.data}
                templateId={editor.meta.templateId}
                pageSize={editor.meta.pageSize}
              />
            </ScaleToFit>
          </div>
        </div>
      ) : null}
    </div>
  );
}
