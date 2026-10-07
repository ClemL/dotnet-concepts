"use client";

import dynamic from "next/dynamic";

/** Loads the quiz only in the browser: shuffling and localStorage must not run during prerendering. */
export const QuizLoader = dynamic(() => import("./QuizRunner"), {
  ssr: false,
  loading: () => <p className="text-muted">Loading quiz…</p>,
});
