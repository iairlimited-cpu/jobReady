import type { ComponentType } from "react";

import type { PageSize, ResumeData, TemplateId } from "@/features/resume/types";
import { AcademicTemplate } from "@/features/resume/templates/academic";
import { EntryTemplate } from "@/features/resume/templates/entry";
import { MinimalTemplate } from "@/features/resume/templates/minimal";
import { ModernTemplate } from "@/features/resume/templates/modern";
import { ProfessionalTemplate } from "@/features/resume/templates/professional";

export const RESUME_TEMPLATE_COMPONENTS: Record<
  TemplateId,
  ComponentType<{ data: ResumeData }>
> = {
  minimal: MinimalTemplate,
  modern: ModernTemplate,
  professional: ProfessionalTemplate,
  academic: AcademicTemplate,
  entry: EntryTemplate,
};

/** Page geometry at 96 dpi. */
export interface PageDimensions {
  width: number;
  height: number;
  /** Horizontal sheet padding (acts as the visual margin). */
  paddingX: number;
  paddingY: number;
}

export const PAGE_DIMENSIONS: Record<PageSize, PageDimensions> = {
  // A4 = 210 × 297 mm
  A4: { width: 794, height: 1123, paddingX: 56, paddingY: 52 },
  // US Letter = 8.5 × 11 in
  LETTER: { width: 816, height: 1056, paddingX: 56, paddingY: 52 },
};

export function pageDimensions(pageSize: PageSize): PageDimensions {
  return PAGE_DIMENSIONS[pageSize];
}

/** Renders just the template content (no sheet chrome). */
export function ResumeDocument({
  data,
  templateId,
}: {
  data: ResumeData;
  templateId: TemplateId;
}) {
  const Template = RESUME_TEMPLATE_COMPONENTS[templateId] ?? MinimalTemplate;
  return <Template data={data} />;
}

/**
 * Full A4/US-Letter sheet used by the live preview. The same template DOM is
 * used by the Phase 6 print route (via ResumeDocument), so preview ≈ export.
 */
export function ResumeSheet({
  data,
  templateId,
  pageSize = "A4",
  className,
}: {
  data: ResumeData;
  templateId: TemplateId;
  pageSize?: PageSize;
  className?: string;
}) {
  const dimensions = PAGE_DIMENSIONS[pageSize];
  return (
    <div
      className={`bg-white text-slate-900 ${className ?? ""}`}
      style={{
        width: dimensions.width,
        minHeight: dimensions.height,
        padding: `${dimensions.paddingY}px ${dimensions.paddingX}px`,
      }}
    >
      <ResumeDocument data={data} templateId={templateId} />
    </div>
  );
}
