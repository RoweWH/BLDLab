import { db } from "./bldlabDb";

function createId() {
  return crypto.randomUUID();
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeAlgorithm(algorithm) {
  const currentDate = nowIso();

  return {
    id: algorithm.id || createId(),

    userId: null,

    caseId: algorithm.caseId,
    caseType: algorithm.caseType,
    algorithm: algorithm.algorithm,

    status: algorithm.status ?? "private",

    BLDLabId: algorithm.BLDLabId ?? null,

    /*
     * These connect an IndexedDB algorithm to its optional
     * MongoDB guest submission.
     */
    submissionId: algorithm.submissionId ?? null,
    submissionKey: algorithm.submissionKey ?? null,

    createdDate: algorithm.createdDate ?? currentDate,
    updatedDate: currentDate,
    reviewedDate: algorithm.reviewedDate ?? null,
  };
}

export async function saveAlgorithm(algorithm) {
  const normalizedAlgorithm = normalizeAlgorithm(algorithm);

  await db.algorithms.put(normalizedAlgorithm);

  return normalizedAlgorithm;
}

export async function updateAlgorithm(id, updates) {
  const existingAlgorithm = await db.algorithms.get(id);

  if (!existingAlgorithm) {
    throw new Error(
      `Algorithm with id "${id}" was not found.`,
    );
  }

  const updatedAlgorithm = {
    ...existingAlgorithm,
    ...updates,
    id,
    updatedDate: nowIso(),
  };

  await db.algorithms.put(updatedAlgorithm);

  return updatedAlgorithm;
}

export async function deleteAlgorithm(id) {
  await db.algorithms.delete(id);
}

export async function getAlgorithm(id) {
  return db.algorithms.get(id);
}

export async function getAlgorithms() {
  return db.algorithms
    .orderBy("updatedDate")
    .reverse()
    .toArray();
}

export async function getAlgorithmsByCase(caseType, caseId) {
  return db.algorithms
    .where("[caseType+caseId]")
    .equals([caseType, caseId])
    .toArray();
}

export async function getPendingAlgorithmsWithSubmissions() {
  return db.algorithms
    .where("status")
    .equals("pending")
    .filter(
      (algorithm) =>
        Boolean(algorithm.submissionId) &&
        Boolean(algorithm.submissionKey),
    )
    .toArray();
}

export async function updateAlgorithmSubmission(
  id,
  submission,
) {
  const updates = {
    submissionId:
      submission.submissionId ?? submission._id ?? null,

    status: submission.status,
    BLDLabId: submission.BLDLabId ?? null,
    reviewedDate: submission.reviewedDate ?? null,
  };

  if (submission.submissionKey !== undefined) {
    updates.submissionKey = submission.submissionKey;
  }

  return updateAlgorithm(id, updates);
}

export async function clearAlgorithms() {
  await db.algorithms.clear();
}