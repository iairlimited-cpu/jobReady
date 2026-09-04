"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";

import { useAuth } from "@/features/auth/auth-context";
import { describeFirestoreError } from "@/lib/errors";
import { getResume, updateResumeRecord } from "@/features/resume/api";
import { createEmptyResumeData } from "@/features/resume/helpers";
import { loadDraft, saveDraft, type StoredDraft } from "@/features/resume/local-draft";
import type { PageSize, ResumeData, ResumeRecord, TemplateId } from "@/features/resume/types";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export interface ResumeMetaState {
  name: string;
  templateId: TemplateId;
  pageSize: PageSize;
}

export const DEFAULT_RESUME_META: ResumeMetaState = {
  name: "",
  templateId: "minimal",
  pageSize: "A4",
};

export interface EditorApi {
  data: ResumeData;
  meta: ResumeMetaState;
  setData: (updater: (previous: ResumeData) => ResumeData) => void;
  setMeta: (patch: Partial<ResumeMetaState>) => void;
  saveStatus: SaveStatus;
  saveMessage: string | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  retry: () => void;
  /** Persists the current workspace immediately (used before export/print). */
  saveNow: () => Promise<void>;
}

function useEmptyData() {
  return useMemo(() => createEmptyResumeData(), []);
}

const AUTOSAVE_DELAY_MS = 900;
const GUEST_DELAY_MS = 500;

interface Workspace {
  data: ResumeData;
  meta: ResumeMetaState;
}

/* ------------------------------------------------------------------ */
/* Cloud (Firestore) editor                                            */
/* ------------------------------------------------------------------ */

export function useCloudResumeEditor(id: string | null): EditorApi {
  const { status, user, configured } = useAuth();
  const targetId = id ?? "";
  const canFetch =
    targetId.length > 0 && status === "authed" && user !== null && configured;

  const emptyData = useEmptyData();

  const {
    data: record,
    error: loadError,
    isLoading: isFetching,
    mutate,
  } = useSWR<ResumeRecord | null, Error>(
    canFetch ? ["resume", targetId] : null,
    () => getResume(targetId),
    { revalidateOnFocus: false },
  );

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [previousRecord, setPreviousRecord] = useState<ResumeRecord | null>(null);

  // Hydrate from the fetched record via render-time adjustment.
  const nextRecord = record ?? null;
  if (nextRecord !== previousRecord) {
    setPreviousRecord(nextRecord);
    if (nextRecord) {
      setWorkspace({
        data: structuredClone(nextRecord.data),
        meta: {
          name: nextRecord.name,
          templateId: nextRecord.templateId,
          pageSize: nextRecord.pageSize,
        },
      });
    }
  }

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Debounced autosave. The closure captures the exact workspace that
  // triggered this run; older timers are always cleared, so no refs needed.
  useEffect(() => {
    if (!workspace || !canFetch) return;
    const timer = window.setTimeout(() => {
      setSaveStatus("saving");
      setSaveMessage(null);
      void updateResumeRecord(targetId, {
        data: workspace.data,
        name: workspace.meta.name,
        templateId: workspace.meta.templateId,
        pageSize: workspace.meta.pageSize,
      })
        .then(() => {
          setSaveStatus("saved");
        })
        .catch((error: unknown) => {
          setSaveStatus("error");
          setSaveMessage(describeFirestoreError(error).message);
        });
    }, AUTOSAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [workspace, canFetch, targetId]);

  const setData = useCallback((updater: (previous: ResumeData) => ResumeData) => {
    setWorkspace((current) =>
      current ? { ...current, data: updater(current.data) } : current,
    );
  }, []);

  const setMeta = useCallback((patch: Partial<ResumeMetaState>) => {
    setWorkspace((current) =>
      current ? { ...current, meta: { ...current.meta, ...patch } } : current,
    );
  }, []);

  const notFound = !isFetching && !loadError && canFetch && nextRecord === null;

  const saveNow = useCallback(async (): Promise<void> => {
    const current = workspace;
    if (!current || !canFetch) return;
    setSaveStatus("saving");
    setSaveMessage(null);
    try {
      await updateResumeRecord(targetId, {
        data: current.data,
        name: current.meta.name,
        templateId: current.meta.templateId,
        pageSize: current.meta.pageSize,
      });
      setSaveStatus("saved");
    } catch (error) {
      setSaveStatus("error");
      setSaveMessage(describeFirestoreError(error).message);
      throw error;
    }
  }, [workspace, canFetch, targetId]);

  return {
    data: workspace?.data ?? emptyData,
    meta: workspace?.meta ?? DEFAULT_RESUME_META,
    setData,
    setMeta,
    saveStatus,
    saveMessage,
    isLoading: isFetching && !workspace,
    isError: Boolean(loadError) || notFound,
    errorMessage: notFound
      ? "This CV couldn’t be found — it may have been deleted."
      : loadError
        ? describeFirestoreError(loadError).message
        : null,
    retry: () => {
      void mutate();
    },
    saveNow,
  };
}

/* ------------------------------------------------------------------ */
/* Guest (localStorage) editor                                         */
/* ------------------------------------------------------------------ */

export function useGuestResumeEditor(): EditorApi {
  const emptyData = useEmptyData();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [ready, setReady] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  // Deferred localStorage read — avoids SSR/hydration mismatch and keeps the
  // read out of the synchronous effect body.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const draft = loadDraft();
      setWorkspace(
        draft
          ? { data: draft.data, meta: draft.meta }
          : { data: createEmptyResumeData(), meta: { ...DEFAULT_RESUME_META } },
      );
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  // Debounced local persistence while the workspace changes.
  useEffect(() => {
    if (!workspace || !ready) return;
    const timer = window.setTimeout(() => {
      const draft: StoredDraft = {
        data: workspace.data,
        meta: workspace.meta,
        updatedAt: Date.now(),
      };
      saveDraft(draft);
      setSaveStatus("saved");
    }, GUEST_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [workspace, ready]);

  const setData = useCallback((updater: (previous: ResumeData) => ResumeData) => {
    setSaveStatus("saving");
    setWorkspace((current) =>
      current ? { ...current, data: updater(current.data) } : current,
    );
  }, []);

  const setMeta = useCallback((patch: Partial<ResumeMetaState>) => {
    setSaveStatus("saving");
    setWorkspace((current) =>
      current ? { ...current, meta: { ...current.meta, ...patch } } : current,
    );
  }, []);

  const saveNow = useCallback(async (): Promise<void> => {
    const current = workspace;
    if (!current) return;
    saveDraft({
      data: current.data,
      meta: current.meta,
      updatedAt: Date.now(),
    });
    setSaveStatus("saved");
  }, [workspace]);

  return {
    data: workspace?.data ?? emptyData,
    meta: workspace?.meta ?? DEFAULT_RESUME_META,
    setData,
    setMeta,
    saveStatus: ready ? saveStatus : "idle",
    saveMessage: null,
    isLoading: !ready,
    isError: false,
    errorMessage: null,
    retry: () => undefined,
    saveNow,
  };
}
