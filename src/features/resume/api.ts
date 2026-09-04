/**
 * resumes/{id} Firestore access (owner-scoped by rules).
 */
import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
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
import { createEmptyResumeData } from "@/features/resume/helpers";
import type {
  PageSize,
  ResumeData,
  ResumeRecord,
  TemplateId,
} from "@/features/resume/types";
import { isKnownTemplateId } from "@/config/resume-templates";

function collectionRef() {
  const db = getFirestoreDb();
  if (!db) throw new Error("Firestore is not configured.");
  return collection(db, "resumes");
}

function docRef(id: string) {
  const db = getFirestoreDb();
  if (!db) throw new Error("Firestore is not configured.");
  return doc(db, "resumes", id);
}

function toMillis(value: unknown): number {
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value === "number") return value;
  return Date.now();
}

function fromSnapshot(snapshot: DocumentSnapshot): ResumeRecord | null {
  const raw = snapshot.data();
  if (!raw) return null;
  const templateId: TemplateId = isKnownTemplateId(raw.templateId)
    ? raw.templateId
    : "minimal";
  const pageSize: PageSize = raw.pageSize === "LETTER" ? "LETTER" : "A4";
  return {
    id: snapshot.id,
    userId: raw.userId ?? "",
    name: raw.name ?? "",
    templateId,
    pageSize,
    data: (raw.data as ResumeData | undefined) ?? createEmptyResumeData(),
    createdAt: toMillis(raw.createdAt),
    updatedAt: toMillis(raw.updatedAt),
  };
}

export async function listResumes(uid: string): Promise<ResumeRecord[]> {
  const items = await getDocs(
    query(collectionRef(), where("userId", "==", uid), orderBy("updatedAt", "desc")),
  );
  const records = items.docs
    .map((snapshot) => fromSnapshot(snapshot))
    .filter((record): record is ResumeRecord => record !== null);
  return records;
}

export async function getResume(id: string): Promise<ResumeRecord | null> {
  const snapshot = await getDoc(docRef(id));
  if (!snapshot.exists()) return null;
  return fromSnapshot(snapshot);
}

export async function createResume(input: {
  uid: string;
  name: string;
  templateId: TemplateId;
  pageSize?: PageSize;
}): Promise<string> {
  const snapshot = await addDoc(collectionRef(), {
    userId: input.uid,
    name: input.name,
    templateId: input.templateId,
    pageSize: input.pageSize ?? "A4",
    data: createEmptyResumeData(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return snapshot.id;
}

export async function updateResumeRecord(
  id: string,
  patch: {
    data?: ResumeData;
    name?: string;
    templateId?: TemplateId;
    pageSize?: PageSize;
  },
): Promise<void> {
  await updateDoc(docRef(id), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export async function duplicateResume(input: {
  uid: string;
  source: ResumeRecord;
  name?: string;
}): Promise<string> {
  const snapshot = await addDoc(collectionRef(), {
    userId: input.uid,
    name: input.name ?? `${input.source.name} (copy)`,
    templateId: input.source.templateId,
    pageSize: input.source.pageSize,
    data: structuredClone(input.source.data),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return snapshot.id;
}

export async function deleteResume(id: string): Promise<void> {
  await deleteDoc(docRef(id));
}
