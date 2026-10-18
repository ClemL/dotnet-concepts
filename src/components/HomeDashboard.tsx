"use client";

import Link from "next/link";
import { CONCEPTS, questions, type ConceptInfo } from "@/data/questions";
import { CORE_CONCEPTS, selectMissed, toScore } from "@/lib/quiz";
import { clearProgress } from "@/lib/storage";
import { useState } from "react";
import { buttonPrimary, buttonSecondary, scoreTone } from "./ui";
import { useProgress } from "./useProgress";

const coreCount = questions.filter((q) => CORE_CONCEPTS.includes(q.concept)).length;

export function HomeDashboard() {
  const { progress, hydrated } = useProgress();
  const [confirmingReset, setConfirmingReset] = useState(false);
  const missedCount = selectMissed(questions, progress).length;
  const answeredCount = Object.keys(progress.questionResults).length;

  return (
    <>
      <nav aria-label="Quiz modes" className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link href="/quiz/core" className={buttonPrimary}>
          Run core 12 ({coreCount})
        </Link>
        <Link href="/quiz/all" className={buttonSecondary}>
          Run all ({questions.length})
        </Link>
        {hydrated && missedCount > 0 ? (
          <Link href="/quiz/missed" className={`${buttonSecondary} border-danger text-danger`}>
            Review missed ({missedCount})
          </Link>
        ) : (
          <span className={`${buttonSecondary} cursor-not-allowed text-faint hover:bg-surface`} aria-disabled="true">
            Review missed (0)
          </span>
        )}
      </nav>

      <ConceptSection
        title="Core concepts"
        concepts={CONCEPTS.filter((c) => c.core)}
        best={progress.bestByConcept}
        hydrated={hydrated}
      />
      <ConceptSection
        title="Additional concepts"
        concepts={CONCEPTS.filter((c) => !c.core)}
        best={progress.bestByConcept}
        hydrated={hydrated}
      />

      {hydrated && answeredCount > 0 && (
        <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-border pt-6">
          {confirmingReset ? (
            <>
              <span className="text-sm text-muted">Clear all scores and missed-question history?</span>
              <button
                type="button"
                className={`${buttonSecondary} border-danger text-danger`}
                onClick={() => {
                  clearProgress();
                  setConfirmingReset(false);
                }}
              >
                Clear progress
              </button>
              <button type="button" className={buttonSecondary} onClick={() => setConfirmingReset(false)}>
                Cancel
              </button>
            </>
          ) : (
            <button type="button" className={buttonSecondary} onClick={() => setConfirmingReset(true)}>
              Reset progress
            </button>
          )}
        </div>
      )}
    </>
  );
}

function ConceptSection({
  title,
  concepts,
  best,
  hydrated,
}: {
  title: string;
  concepts: ConceptInfo[];
  best: ReturnType<typeof useProgress>["progress"]["bestByConcept"];
  hydrated: boolean;
}) {
  const headingId = `${title.toLowerCase().replace(/\s+/g, "-")}-heading`;
  return (
    <section aria-labelledby={headingId} className="mt-10">
      <h2 id={headingId} className="eyebrow">
        ## {title}
      </h2>
      <ul className="mt-3 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
        {concepts.map((c) => {
          const b = best[c.id];
          const score = hydrated && b ? toScore(b.correct, b.total) : null;
          return (
            <li key={c.id} className="flex flex-col gap-3 bg-surface px-4 py-3">
              <div className="flex items-start gap-3">
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-[0.8125rem] text-accent">{c.id}.cs</span>
                  <span className="mt-0.5 block font-medium">{c.title}</span>
                  <span className="mt-0.5 block text-sm text-muted">{c.summary}</span>
                </span>
                <span id={`${c.id}-best`} className="shrink-0 pt-0.5 text-right font-mono text-sm tabular-nums">
                  {!hydrated ? (
                    <span className="text-faint">…</span>
                  ) : score ? (
                    <>
                      <span className={scoreTone(score.percent)}>{score.percent}%</span>
                      <span className="block text-xs text-muted">
                        best {score.correct}/{score.total}
                      </span>
                    </>
                  ) : (
                    <span className="text-faint">
                      —<span className="sr-only"> not attempted</span>
                    </span>
                  )}
                </span>
              </div>
              <div className="mt-auto flex gap-2 font-mono text-[0.8125rem]">
                <Link
                  href={`/quiz/${c.id}`}
                  aria-describedby={`${c.id}-best`}
                  className="inline-flex min-h-10 items-center rounded-md border border-border-strong px-3 hover:border-accent hover:text-accent"
                >
                  quiz<span className="sr-only"> on {c.title}</span>
                </Link>
                <Link
                  href={`/concepts/${c.id}`}
                  className="inline-flex min-h-10 items-center rounded-md border border-border px-3 text-muted hover:border-border-strong hover:text-fg"
                >
                  study<span className="sr-only"> {c.title}</span>
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
