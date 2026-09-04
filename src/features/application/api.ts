/**
 * applications/* Firestore access (owner-scoped by rules). Timeline events
 * live in the applications/{id}/events subcollection.
 */
import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentSnapshot,
} from "firebase/firestore";

import { getFirestoreDb } from "@/lib/firebase/client";
import type { ExtractedRequirement } from "@/features/analyzer/types";
import type { CoverLetterData } from "@/features/coverLetter/types";
import type { ApplicationDetailsValues } from "@/features/application/schemas";
import {
  APPLICATION_STATUSES,
  type ApplicationNote,
  type ApplicationStatus,
  type JobApplication,
  type TimelineEvent,
} from "@/features/application/types";

function configError(): Error {
  const error = new Error("Firestore is not configured.");
  (error as { code?: string }).code = "FIREBASE_CONFIG_MISSING";
  return error;
}

function applicationsRef() {
  const db = getFirestoreDb();
  if (!db) throw configError();
  return collection(db, "applications");
}

function applicationRef(id: string) {
  const db = getFirestoreDb();
  if (!db) throw configError();
  return doc(db, "applications", id);
}

function eventsRef(id: string) {
  const db = getFirestoreDb();
  if (!db) throw configError();
  return collection(db, "applications", id, "events");
}

function toMillis(value: unknown): number {
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value === "number") return value;
  return 0;
}

function isStatus(value: unknown): value is ApplicationStatus {
  return typeof value === "string" && (APPLICATION_STATUSES as readonly string[]).includes(value);
}

export function applicationFromSnapshot(snapshot: DocumentSnapshot): JobApplication | null {
  const raw = snapshot.data();
  if (!raw) return null;
  const notes: ApplicationNote[] = Array.isArray(raw.notes)
    ? raw.notes.map((note: Record<string, unknown>) => ({
        id: String(note.id ?? ""),
        text: String(note.text ?? ""),
        createdAt: toMillis(note.createdAt),
      }))
    : [];

  const requirements: ExtractedRequirement[] | undefined = Array.isArray(raw.requirements)
    ? (raw.requirements as ExtractedRequirement[]).map((item) => ({
        id: String(item.id ?? ""),
        category: item.category,
        label: String(item.label ?? ""),
        normalized: item.normalized ? String(item.normalized) : undefined,
        evidence: Array.isArray(item.evidence) ? item.evidence.map(String) : [],
        importance: item.importance,
      }))
    : undefined;

  const coverLetter: CoverLetterData | undefined = raw.coverLetter
    ? {
        applicantName: String(raw.coverLetter.applicantName ?? ""),
        recipient: String(raw.coverLetter.recipient ?? ""),
        salutation: String(raw.coverLetter.salutation ?? ""),
        opening: String(raw.coverLetter.opening ?? ""),
        experience: String(raw.coverLetter.experience ?? ""),
        whyRole: String(raw.coverLetter.whyRole ?? ""),
        closingSalutation: String(raw.coverLetter.closingSalutation ?? ""),
      }
    : undefined;

  return {
    id: snapshot.id,
    userId: raw.userId ?? "",
    title: raw.title ?? "",
    company: raw.company ?? "",
    url: raw.url ?? "",
    location: raw.location ?? "",
    employmentType: raw.employmentType ?? undefined,
    salary: raw.salary ?? "",
    jobDescription: raw.jobDescription ?? "",
    status: isStatus(raw.status) ? raw.status : "draft",
    favorite: raw.favorite === true,
    notes,
    requirements,
    coverLetter,
    createdAt: toMillis(raw.createdAt),
    updatedAt: toMillis(raw.updatedAt),
    appliedAt: raw.appliedAt ? toMillis(raw.appliedAt) : undefined,
    deadline: raw.deadline ? toMillis(raw.deadline) : undefined,
  };
}

export async function saveCoverLetter(
  id: string,
  letter: CoverLetterData,
): Promise<void> {
  await updateDoc(applicationRef(id), {
    coverLetter: { ...letter },
    updatedAt: serverTimestamp(),
  });
}

export async function saveRequirements(
  id: string,
  requirements: ExtractedRequirement[],
): Promise<void> {
  await updateDoc(applicationRef(id), {
    requirements: requirements.map((item) => ({ ...item })),
    updatedAt: serverTimestamp(),
  });
}

export async function listApplications(uid: string): Promise<JobApplication[]> {
  const snapshot = await getDocs(
    query(applicationsRef(), where("userId", "==", uid), orderBy("updatedAt", "desc")),
  );
  return snapshot.docs
    .map((docSnapshot) => applicationFromSnapshot(docSnapshot))
    .filter((application): application is JobApplication => application !== null);
}

export async function getApplication(id: string): Promise<JobApplication | null> {
  const snapshot = await getDoc(applicationRef(id));
  if (!snapshot.exists()) return null;
  return applicationFromSnapshot(snapshot);
}

export async function createApplication(
  uid: string,
  values: ApplicationDetailsValues,
): Promise<string> {
  const deadline = values.deadlineDate
    ? new Date(`${values.deadlineDate}T23:59:59`).getTime()
    : undefined;
  const snapshot = await addDoc(applicationsRef(), {
    userId: uid,
    title: values.title,
    company: values.company,
    url: values.url ?? "",
    location: values.location ?? "",
    employmentType: values.employmentType ?? undefined,
    salary: values.salary ?? "",
    jobDescription: values.jobDescription ?? "",
    status: "draft",
    favorite: false,
    notes: [],
    deadline,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return snapshot.id;
}

export interface ApplicationPatch {
  title?: string;
  company?: string;
  url?: string;
  location?: string;
  employmentType?: JobApplication["employmentType"];
  salary?: string;
  jobDescription?: string;
  status?: ApplicationStatus;
  favorite?: boolean;
  appliedAt?: number | null;
  deadline?: number | null;
}

export async function updateApplication(id: string, patch: ApplicationPatch): Promise<void> {
  const payload: Record<string, unknown> = { updatedAt: serverTimestamp() };
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    payload[key] = value === null ? deleteField() : value;
  }
  await updateDoc(applicationRef(id), payload);
}

export async function addNote(id: string, currentNotes: ApplicationNote[], note: ApplicationNote): Promise<void> {
  await updateDoc(applicationRef(id), {
    notes: [...currentNotes, note],
    updatedAt: serverTimestamp(),
  });
}

export async function removeNote(id: string, currentNotes: ApplicationNote[], noteId: string): Promise<void> {
  await updateDoc(applicationRef(id), {
    notes: currentNotes.filter((note) => note.id !== noteId),
    updatedAt: serverTimestamp(),
  });
}

export async function addEvent(id: string, event: TimelineEvent): Promise<void> {
  await addDoc(eventsRef(id), { ...event });
}

export async function listEvents(id: string): Promise<TimelineEvent[]> {
  const snapshot = await getDocs(query(eventsRef(id), orderBy("at", "desc")));
  return snapshot.docs
    .map((docSnapshot) => docSnapshot.data() as TimelineEvent)
    .sort((a, b) => b.at - a.at);
}

export async function deleteApplication(id: string): Promise<void> {
  // Remove timeline events first (subcollection), then the document.
  const snapshot = await getDocs(eventsRef(id));
  await Promise.all(snapshot.docs.map((item) => deleteDoc(item.ref)));
  await deleteDoc(applicationRef(id));
}
