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

/** In-memory stand-in used when localStorage is blocked, so a session still works end to end. */
export function createMemoryStorage(): StorageLike {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  };
}

let resolvedBrowserStorage: StorageLike | undefined;

/**
 * window.localStorage when it is usable, otherwise an in-memory fallback (private mode,
 * disabled cookies, quota 0). Accessing window.localStorage can itself throw, so it is probed
 * inside try/catch. Returns undefined on the server.
 */
export const browserStorage: StorageProvider = () => {
  if (typeof window === "undefined") return undefined;
  if (resolvedBrowserStorage) return resolvedBrowserStorage;
  try {
    const ls = window.localStorage;
    const probe = "__quiz_probe__";
    ls.setItem(probe, probe);
    ls.removeItem(probe);
    resolvedBrowserStorage = ls;
  } catch {
    resolvedBrowserStorage = createMemoryStorage();
  }
  return resolvedBrowserStorage;
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

/** Raw serialized progress (or null). Strings compare by value, so this is a stable snapshot. */
export function readRawProgress(provider: StorageProvider = browserStorage): string | null {
  try {
    return provider()?.getItem(STORAGE_KEY) ?? null;
  } catch {
    return null;
  }
}

export function parseRawProgress(raw: string | null): Progress {
  if (!raw) return emptyProgress();
  try {
    return parseProgress(raw) ?? emptyProgress();
  } catch {
    return emptyProgress();
  }
}

const CHANGE_EVENT = "quiz-progress-change";

function notifyChange(): void {
  try {
    if (typeof window !== "undefined") window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // Notifications are best-effort.
  }
}

/** Subscribes to progress changes from this tab and other tabs. Safe to call during SSR. */
export function subscribeProgress(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === STORAGE_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export function loadProgress(provider: StorageProvider = browserStorage): Progress {
  return parseRawProgress(readRawProgress(provider));
}

/** Returns true when the progress was persisted. */
export function saveProgress(progress: Progress, provider: StorageProvider = browserStorage): boolean {
  try {
    const storage = provider();
    if (!storage) return false;
    storage.setItem(STORAGE_KEY, JSON.stringify(progress));
    notifyChange();
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
    notifyChange();
    return true;
  } catch {
    return false;
  }
}
