"use client";

import dynamic from "next/dynamic";

export const ResultsLoader = dynamic(() => import("./ResultsView"), {
  ssr: false,
  loading: () => <p className="font-mono text-sm text-muted">Loading results…</p>,
});
