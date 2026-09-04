"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { useAuth } from "@/features/auth/auth-context";
import { RequireAuth } from "@/features/auth/guards";
import { getResume } from "@/features/resume/api";
import {
  ResumeDocument,
  pageDimensions,
} from "@/features/resume/templates/preview";
import { loadDraft, saveDraft } from "@/features/resume/local-draft";
import type { PageSize, ResumeData, ResumeRecord, TemplateId } from "@/features/resume/types";
import { describeFirestoreError } from "@/lib/errors";

const PRINT_MARGIN_PX = 91;

function PrintActionBar({
  pageSize,
  onPageSizeChange,
  backHref,
}: {
  pageSize: PageSize;
  onPageSizeChange?: (size: PageSize) => void;
  backHref: string;
}) {
  return (
    <div className="no-print sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href={backHref}
          className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          ← Back
        </Link>
        <div className="flex items-center gap-3">
          {onPageSizeChange ? (
            <div className="w-36">
              <SelectField
                label="Page size"
                value={pageSize}
                onChange={(event) =>
                  onPageSizeChange(event.target.value as PageSize)
                }
              >
                <option value="A4">A4</option>
                <option value="LETTER">US Letter</option>
              </SelectField>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">
              Page size: {pageSize === "LETTER" ? "US Letter" : "A4"}
            </span>
          )}
          <Button type="button" onClick={() => window.print()}>
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
}

function PrintContent({
  data,
  templateId,
  pageSize,
}: {
  data: ResumeData;
  templateId: TemplateId;
  pageSize: PageSize;
}) {
  const dimensions = pageDimensions(pageSize);
  const contentWidth = dimensions.width - PRINT_MARGIN_PX;
  return (
    <>
      <style>{`@page { size: ${pageSize}; margin: 12mm; }`}</style>
      <div className="print-page" style={{ width: contentWidth }}>
        <ResumeDocument data={data} templateId={templateId} />
      </div>
    </>
  );
}

function CloudPrint({ id }: { id: string }) {
  const { status, user, configured } = useAuth();
  const authed = status === "authed" && user !== null && configured;

  const { data: record, error, isLoading } = useSWR<ResumeRecord | null, Error>(
    authed ? ["print-resume", id] : null,
    () => getResume(id),
  );

  if (isLoading || !authed) {
    return (
      <div className="px-6 py-20 text-center text-sm text-muted-foreground">
        Loading your CV…
      </div>
    );
  }
  if (error || !record) {
    return (
      <div className="mx-auto max-w-md px-6 py-16">
        <Alert variant="error">
          {error ? describeFirestoreError(error).message : "This CV couldn’t be found."}
        </Alert>
      </div>
    );
  }

  return (
    <>
      <PrintActionBar pageSize={record.pageSize} backHref="/resumes" />
      <div className="screen-frame bg-muted/60">
        <PrintContent
          data={record.data}
          templateId={record.templateId}
          pageSize={record.pageSize}
        />
      </div>
    </>
  );
}

function GuestPrint() {
  const [workspace, setWorkspace] = useState<{
    data: ResumeData;
    templateId: TemplateId;
    pageSize: PageSize;
  } | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const draft = loadDraft();
      setWorkspace(
        draft
          ? {
              data: draft.data,
              templateId: draft.meta.templateId,
              pageSize: draft.meta.pageSize,
            }
          : null,
      );
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (workspace === null) {
    return (
      <div className="px-6 py-20 text-center text-sm text-muted-foreground">
        Loading your draft…
      </div>
    );
  }

  function changePageSize(pageSize: PageSize) {
    setWorkspace((current) => (current ? { ...current, pageSize } : current));
    const draft = loadDraft();
    if (draft) {
      saveDraft({ ...draft, meta: { ...draft.meta, pageSize } });
    }
  }

  return (
    <>
      <PrintActionBar
        pageSize={workspace.pageSize}
        onPageSizeChange={changePageSize}
        backHref="/resumes/draft"
      />
      <div className="screen-frame bg-muted/60">
        <PrintContent
          data={workspace.data}
          templateId={workspace.templateId}
          pageSize={workspace.pageSize}
        />
      </div>
    </>
  );
}

export function ResumePrintView() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  if (id) {
    return (
      <RequireAuth title="Sign in to download your CV">
        <CloudPrint id={id} />
      </RequireAuth>
    );
  }
  return <GuestPrint />;
}
