"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { CONCEPTS, questions, type ConceptInfo } from "@/data/questions";
import { CORE_CONCEPTS, selectMissed, toScore } from "@/lib/quiz";
import { scoreTone } from "./ui";
import { useProgress } from "./useProgress";

const coreCount = questions.filter((q) => CORE_CONCEPTS.includes(q.concept)).length;

/** Path shown in the header breadcrumb, like an editor's open file. */
function breadcrumb(pathname: string): string {
  if (pathname.startsWith("/quiz/")) {
    const mode = pathname.slice("/quiz/".length);
    if (mode === "core") return "quiz / core.sln";
    if (mode === "all") return "quiz / all.sln";
    if (mode === "missed") return "quiz / missed.cs";
    return `quiz / ${mode}.cs`;
  }
  if (pathname.startsWith("/results")) return "results.log";
  return "README.md";
}

/** IDE-style workspace: top bar, concept explorer (desktop), content, status bar (desktop). */
export function EditorShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { progress, hydrated } = useProgress();
  const missedCount = hydrated ? selectMissed(questions, progress).length : 0;
  const activeMode = pathname.startsWith("/quiz/") ? pathname.slice("/quiz/".length) : null;

  const modeLink = (href: string, label: string, mode: string, tone = "") => (
    <Link
      href={href}
      aria-current={activeMode === mode ? "page" : undefined}
      className={`inline-flex min-h-9 items-center rounded-md border px-2 text-xs sm:px-2.5 sm:text-[0.8125rem] ${
        activeMode === mode ? "border-accent text-accent" : `border-border hover:bg-surface-2 ${tone || "text-fg"}`
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-border bg-bg/95 backdrop-blur">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2 font-mono text-[0.8125rem] sm:gap-x-4">
          <Link href="/" className="font-semibold text-fg hover:text-accent">
            <span className="sm:hidden">dotnet</span>
            <span className="hidden sm:inline">dotnet-concepts</span>
          </Link>
          <span className="hidden truncate text-muted sm:inline">/ {breadcrumb(pathname)}</span>
          <nav aria-label="Quiz modes" className="ml-auto flex gap-1.5 sm:gap-2">
            {modeLink("/quiz/core", `core ${coreCount}`, "core")}
            {modeLink("/quiz/all", `all ${questions.length}`, "all")}
            {missedCount > 0 ? (
              modeLink("/quiz/missed", `missed ${missedCount}`, "missed", "text-danger")
            ) : (
              <span
                aria-disabled="true"
                title="Answer some questions first"
                className="inline-flex min-h-9 items-center rounded-md border border-border px-2 text-xs text-faint sm:px-2.5 sm:text-[0.8125rem]"
              >
                missed 0
              </span>
            )}
          </nav>
        </div>
      </header>

      <div className="flex flex-1 flex-col lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside
          aria-label="Concepts"
          className="hidden border-r border-border lg:block"
        >
          <div className="sticky top-[3.25rem] max-h-[calc(100vh-3.25rem-2rem)] overflow-y-auto py-4 font-mono text-[0.8125rem]">
            <ExplorerGroup
              label={`explorer · core`}
              concepts={CONCEPTS.filter((c) => c.core)}
              activeMode={activeMode}
              best={progress.bestByConcept}
              hydrated={hydrated}
            />
            <ExplorerGroup
              label={`explorer · extra`}
              concepts={CONCEPTS.filter((c) => !c.core)}
              activeMode={activeMode}
              best={progress.bestByConcept}
              hydrated={hydrated}
            />
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>

      <footer className="sticky bottom-0 z-10 hidden items-center gap-6 border-t border-border bg-surface px-4 py-1.5 font-mono text-xs text-muted lg:flex">
        <span>1–4 select · ⏎ submit/next · [ ] prev/next concept</span>
        <span className="ml-auto">C# 14 · .NET 10</span>
      </footer>
    </div>
  );
}

function ExplorerGroup({
  label,
  concepts,
  activeMode,
  best,
  hydrated,
}: {
  label: string;
  concepts: ConceptInfo[];
  activeMode: string | null;
  best: ReturnType<typeof useProgress>["progress"]["bestByConcept"];
  hydrated: boolean;
}) {
  return (
    <div className="mb-4">
      <p className="eyebrow px-4 pb-2">{label}</p>
      <ul>
        {concepts.map((c) => {
          const b = best[c.id];
          const score = hydrated && b ? toScore(b.correct, b.total) : null;
          const active = activeMode === c.id;
          return (
            <li key={c.id}>
              <Link
                href={`/quiz/${c.id}`}
                aria-current={active ? "page" : undefined}
                title={c.title}
                className={`flex items-center justify-between gap-3 px-4 py-1.5 ${
                  active ? "bg-surface-2 text-fg shadow-[inset_2px_0_0_var(--accent)]" : "text-fg hover:bg-surface-2"
                }`}
              >
                <span className="truncate">{c.id}.cs</span>
                <span className={`tabular-nums ${score ? scoreTone(score.percent) : "text-faint"}`}>
                  {score ? score.percent : "—"}
                  {score && <span className="sr-only">% best score</span>}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
