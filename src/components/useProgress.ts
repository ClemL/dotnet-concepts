"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { Progress } from "@/lib/quiz";
import { parseRawProgress, readRawProgress, subscribeProgress } from "@/lib/storage";

const getServerSnapshot = () => null;

/** Reads saved progress; renders empty progress on the server and during hydration. */
export function useProgress(): { progress: Progress; hydrated: boolean } {
  const raw = useSyncExternalStore(subscribeProgress, () => readRawProgress(), getServerSnapshot);
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const progress = useMemo(() => parseRawProgress(raw), [raw]);
  return { progress, hydrated };
}

function noopSubscribe(): () => void {
  return () => {};
}
