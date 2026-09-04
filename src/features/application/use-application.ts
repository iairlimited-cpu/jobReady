"use client";

import { useCallback } from "react";
import useSWR from "swr";

import { useAuth } from "@/features/auth/auth-context";
import type { ExtractedRequirement } from "@/features/analyzer/types";
import type { CoverLetterData } from "@/features/coverLetter/types";
import {
  addEvent,
  addNote,
  createApplication,
  deleteApplication,
  getApplication,
  listEvents,
  removeNote,
  saveCoverLetter as apiSaveCoverLetter,
  saveRequirements as apiSaveRequirements,
  updateApplication,
  type ApplicationPatch,
} from "@/features/application/api";
import { createId } from "@/lib/ids";
import { createTimelineEvent } from "@/features/application/helpers";
import { STATUS_META } from "@/features/application/types";
import type {
  ApplicationNote,
  ApplicationStatus,
  JobApplication,
  TimelineEvent,
} from "@/features/application/types";
import type { ApplicationDetailsValues } from "@/features/application/schemas";

/** Converts form values (with a deadline date string) into an api patch. */
export function detailsToPatch(values: ApplicationDetailsValues): ApplicationPatch {
  const deadline =
    values.deadlineDate && values.deadlineDate.length > 0
      ? new Date(`${values.deadlineDate}T23:59:59`).getTime()
      : null;
  return {
    title: values.title,
    company: values.company,
    url: values.url ?? "",
    location: values.location ?? "",
    employmentType: values.employmentType,
    salary: values.salary ?? "",
    jobDescription: values.jobDescription ?? "",
    deadline,
  };
}

export function useApplication(id: string | null) {
  const { status, user, configured } = useAuth();
  const targetId = id ?? "";
  const canFetch =
    targetId.length > 0 && status === "authed" && user !== null && configured;

  const { data: application, error, isLoading, mutate } = useSWR<
    JobApplication | null,
    Error
  >(canFetch ? ["application", targetId] : null, () => getApplication(targetId), {
    revalidateOnFocus: false,
  });

  const { data: events = [], mutate: mutateEvents } = useSWR<TimelineEvent[], Error>(
    canFetch ? ["events", targetId] : null,
    () => listEvents(targetId),
    { revalidateOnFocus: false },
  );

  const refreshAll = useCallback(async () => {
    await Promise.all([mutate(), mutateEvents()]);
  }, [mutate, mutateEvents]);

  const updateStatus = useCallback(
    async (next: ApplicationStatus) => {
      if (!application) return;
      const previous = application.status;
      await updateApplication(targetId, { status: next });
      const label =
        previous === next
          ? `Status set to ${STATUS_META[next].label}`
          : `${STATUS_META[previous].label} → ${STATUS_META[next].label}`;
      await addEvent(targetId, createTimelineEvent("status_changed", label));
      await refreshAll();
    },
    [application, targetId, refreshAll],
  );

  const setFavorite = useCallback(
    async (favorite: boolean) => {
      await updateApplication(targetId, { favorite });
      await mutate();
    },
    [targetId, mutate],
  );

  const markApplied = useCallback(
    async (appliedAtMs: number, method: string) => {
      await updateApplication(targetId, { status: "applied", appliedAt: appliedAtMs });
      await addEvent(
        targetId,
        createTimelineEvent("submitted", `Application submitted via ${method}`),
      );
      await refreshAll();
    },
    [targetId, refreshAll],
  );

  const saveDetails = useCallback(
    async (values: ApplicationDetailsValues, eventLabel?: string) => {
      await updateApplication(targetId, detailsToPatch(values));
      if (eventLabel) {
        await addEvent(targetId, createTimelineEvent("custom", eventLabel));
      }
      await refreshAll();
    },
    [targetId, refreshAll],
  );

  const addNoteText = useCallback(
    async (text: string) => {
      if (!application) return;
      const note: ApplicationNote = { id: createId("note"), text, createdAt: Date.now() };
      await addNote(targetId, application.notes, note);
      await mutate();
    },
    [application, targetId, mutate],
  );

  const removeNoteById = useCallback(
    async (noteId: string) => {
      if (!application) return;
      await removeNote(targetId, application.notes, noteId);
      await mutate();
    },
    [application, targetId, mutate],
  );

  const addCustomEvent = useCallback(
    async (label: string) => {
      await addEvent(targetId, createTimelineEvent("custom", label));
      await mutateEvents();
    },
    [targetId, mutateEvents],
  );

  const remove = useCallback(async () => {
    await deleteApplication(targetId);
  }, [targetId]);

  const saveAnalysis = useCallback(
    async (requirements: ExtractedRequirement[]) => {
      await apiSaveRequirements(targetId, requirements);
      await addEvent(
        targetId,
        createTimelineEvent("analyzed", "Job requirements analyzed"),
      );
      await refreshAll();
    },
    [targetId, refreshAll],
  );

  const saveLetter = useCallback(
    async (letter: CoverLetterData) => {
      await apiSaveCoverLetter(targetId, letter);
      await addEvent(targetId, createTimelineEvent("custom", "Cover letter saved"));
      await refreshAll();
    },
    [targetId, refreshAll],
  );

  const createNew = useCallback(
    async (uid: string, values: ApplicationDetailsValues) =>
      createApplication(uid, values),
    [],
  );

  return {
    application: application ?? null,
    events,
    isLoading,
    isSignedIn: canFetch,
    error: error ?? null,
    updateStatus,
    setFavorite,
    markApplied,
    saveDetails,
    addNoteText,
    removeNoteById,
    addCustomEvent,
    remove,
    createNew,
    saveAnalysis,
    saveLetter,
    refresh: refreshAll,
  };
}
