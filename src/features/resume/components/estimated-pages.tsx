"use client";

import { Fragment, useEffect, useRef, useState } from "react";

import {
  ResumeDocument,
  pageDimensions,
} from "@/features/resume/templates/preview";
import type { PageSize, ResumeData, TemplateId } from "@/features/resume/types";
import { cn } from "@/lib/cn";

const PRINT_MARGIN_PX = 91; // ~12mm each side + vertical at 96dpi

/**
 * Estimates the printed page count by measuring the rendered document at the
 * same width/fonts the print route uses. Advisory only — print preview is
 * always the source of truth (never silently truncates content).
 */
export function EstimatedPages({
  data,
  templateId,
  pageSize,
}: {
  data: ResumeData;
  templateId: TemplateId;
  pageSize: PageSize;
}) {
  const dimensions = pageDimensions(pageSize);
  const measureRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<number | null>(null);

  useEffect(() => {
    const node = measureRef.current;
    if (!node) return;
    const frame = requestAnimationFrame(() => {
      const usableHeight = dimensions.height - PRINT_MARGIN_PX;
      const height = node.scrollHeight;
      setPages(Math.max(1, Math.ceil(height / usableHeight)));
    });
    return () => cancelAnimationFrame(frame);
  }, [data, templateId, pageSize, dimensions.height]);

  const label =
    pages === null
      ? "Measuring pages…"
      : pages <= 1
        ? "About 1 page"
        : `About ${pages} pages`;

  return (
    <Fragment>
      {/* Hidden full-size measurement of the same document. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-10000px] top-0"
        style={{ width: dimensions.width - PRINT_MARGIN_PX }}
      >
        <div ref={measureRef}>
          <ResumeDocument data={data} templateId={templateId} />
        </div>
      </div>
      <span
        className={cn(
          "text-xs",
          pages !== null && pages >= 3
            ? "font-medium text-warning-foreground"
            : "text-muted-foreground",
        )}
      >
        {label}
      </span>
    </Fragment>
  );
}
