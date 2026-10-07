/**
 * localStorage wrapper. Every access is guarded: private browsing, disabled storage,
 * quota errors, or corrupt JSON all degrade to "no saved progress" instead of throwing.
 */
import { CONCEPT_IDS } from "@/data/questions";
import { emptyProgress, type Progress } from "@/lib/quiz";

export const STORAGE_KEY = "quiz-progress-v1";

/** The subset of the Storage API this module uses. */
export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type StorageProvider = () => StorageLike | undefined;

/** Reading window.localStorage itself can throw (e.g. SecurityError), so it is wrapped too. */
export const browserStorage: StorageProvider = () => {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Validates the parsed shape just enough to keep the UI from crashing on bad data. */
function parseProgress(raw: string): Progress | null {
  const data: unknown = JSON.parse(raw);
  if (!isRecord(data) || data.version !== 1) return null;
  if (!isRecord(data.questionResults) || !isRecord(data.bestByConcept)) return null;

  const progress = emptyProgress();
  for (const [id, result] of Object.entries(data.questionResults)) {
    if (isRecord(result) && typeof result.correct === "boolean" && typeof result.answeredAt === "number") {
      progress.questionResults[id] = { correct: result.correct, answeredAt: result.answeredAt };
    }
  }
  for (const concept of CONCEPT_IDS) {
    const best = data.bestByConcept[concept];
    if (isRecord(best) && typeof best.correct === "number" && typeof best.total === "number") {
      progress.bestByConcept[concept] = { correct: best.correct, total: best.total };
    }
  }
  if (isRecord(data.lastAttempt) && Array.isArray(data.lastAttempt.answers)) {
    progress.lastAttempt = data.lastAttempt as unknown as Progress["lastAttempt"];
  }
  return progress;
}

export function loadProgress(provider: StorageProvider = browserStorage): Progress {
  try {
    const raw = provider()?.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    return parseProgress(raw) ?? emptyProgress();
  } catch {
    return emptyProgress();
  }
}

/** Returns true when the progress was persisted. */
export function saveProgress(progress: Progress, provider: StorageProvider = browserStorage): boolean {
  try {
    const storage = provider();
    if (!storage) return false;
    storage.setItem(STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}

export function clearProgress(provider: StorageProvider = browserStorage): boolean {
  try {
    const storage = provider();
    if (!storage) return false;
    storage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
