"use client";

import dynamic from "next/dynamic";

/** Loads the quiz only in the browser: shuffling and localStorage must not run during prerendering. */
export const QuizLoader = dynamic(() => import("./QuizRunner"), {
  ssr: false,
  loading: () => <p className="px-4 py-8 font-mono text-sm text-muted lg:px-10">Loading quiz…</p>,
});
