import { describe, expect, it, vi } from "vitest";
import { applyAttempt, emptyProgress } from "@/lib/quiz";
import { clearProgress, loadProgress, saveProgress, STORAGE_KEY, type StorageLike } from "@/lib/storage";

function memoryStorage(): StorageLike & { data: Map<string, string> } {
  // Separate from createMemoryStorage so tests can inspect the raw map.
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

const throwing: StorageLike = {
  getItem: () => {
    throw new Error("SecurityError");
  },
  setItem: () => {
    throw new Error("QuotaExceededError");
  },
  removeItem: () => {
    throw new Error("SecurityError");
  },
};

const sample = applyAttempt(emptyProgress(), {
  mode: "boxing",
  finishedAt: 123,
  answers: [{ questionId: "boxing-1", concept: "boxing", selectedIndex: 2, correct: false }],
});

describe("storage", () => {
  it("round-trips progress under the versioned key", () => {
    const store = memoryStorage();
    expect(saveProgress(sample, () => store)).toBe(true);
    expect([...store.data.keys()]).toEqual([STORAGE_KEY]);
    expect(STORAGE_KEY).toBe("quiz-progress-v1");
    expect(loadProgress(() => store)).toEqual(sample);
    expect(clearProgress(() => store)).toBe(true);
    expect(loadProgress(() => store)).toEqual(emptyProgress());
  });

  it("survives a localStorage whose methods throw", () => {
    expect(loadProgress(() => throwing)).toEqual(emptyProgress());
    expect(saveProgress(sample, () => throwing)).toBe(false);
    expect(clearProgress(() => throwing)).toBe(false);
  });

  it("survives a provider that throws when localStorage is accessed", () => {
    const provider = () => {
      throw new Error("SecurityError: access denied");
    };
    expect(loadProgress(provider)).toEqual(emptyProgress());
    expect(saveProgress(sample, provider)).toBe(false);
  });

  it("works when storage is unavailable (server render)", () => {
    expect(loadProgress(() => undefined)).toEqual(emptyProgress());
    expect(saveProgress(sample, () => undefined)).toBe(false);
    expect(loadProgress()).toEqual(emptyProgress()); // default provider, no window in Node
  });

  it("ignores corrupt or wrong-version data", () => {
    const store = memoryStorage();
    store.data.set(STORAGE_KEY, "{not json");
    expect(loadProgress(() => store)).toEqual(emptyProgress());
    store.data.set(STORAGE_KEY, JSON.stringify({ version: 2, questionResults: {}, bestByConcept: {} }));
    expect(loadProgress(() => store)).toEqual(emptyProgress());
    store.data.set(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        questionResults: { "naming-1": { correct: "yes" }, "naming-2": { correct: false, answeredAt: 5 } },
        bestByConcept: { naming: { correct: 1, total: 5 }, bogus: { correct: 1, total: 1 } },
        lastAttempt: null,
      }),
    );
    const loaded = loadProgress(() => store);
    expect(loaded.questionResults).toEqual({ "naming-2": { correct: false, answeredAt: 5 } });
    expect(loaded.bestByConcept).toEqual({ naming: { correct: 1, total: 5 } });
  });
});

describe("browserStorage", () => {
  it("falls back to in-memory storage when window.localStorage throws on access", async () => {
    vi.resetModules();
    const fakeWindow = {
      get localStorage(): Storage {
        throw new DOMException("denied", "SecurityError");
      },
      dispatchEvent: () => true,
    };
    vi.stubGlobal("window", fakeWindow);
    try {
      const storage = await import("@/lib/storage");
      expect(storage.saveProgress(sample)).toBe(true); // persisted to the memory fallback
      expect(storage.loadProgress()).toEqual(sample);
    } finally {
      vi.unstubAllGlobals();
      vi.resetModules();
    }
  });
});
