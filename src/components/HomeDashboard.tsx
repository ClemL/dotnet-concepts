"use client";

import Link from "next/link";
import { CONCEPTS, questions, type ConceptInfo } from "@/data/questions";
import { CORE_CONCEPTS, selectMissed, toScore } from "@/lib/quiz";
import { clearProgress } from "@/lib/storage";
import { buttonPrimary, buttonSecondary } from "./ui";
import { useProgress } from "./useProgress";

const coreCount = questions.filter((q) => CORE_CONCEPTS.includes(q.concept)).length;

export function HomeDashboard() {
  const { progress, hydrated } = useProgress();
  const missedCount = selectMissed(questions, progress).length;
  const answeredCount = Object.keys(progress.questionResults).length;

  return (
    <>
      <nav aria-label="Quiz modes" className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link href="/quiz/core" className={buttonPrimary}>
          Core 12 quiz ({coreCount})
        </Link>
        <Link href="/quiz/all" className={buttonSecondary}>
          Full quiz ({questions.length})
        </Link>
        {hydrated && missedCount > 0 ? (
          <Link href="/quiz/missed" className={buttonSecondary}>
            Review missed ({missedCount})
          </Link>
        ) : (
          <span
            className={`${buttonSecondary} cursor-not-allowed opacity-60 hover:bg-surface`}
            aria-disabled="true"
            title="Answer some questions first"
          >
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
        <div className="mt-10 border-t border-border pt-6">
          <button
            type="button"
            className={buttonSecondary}
            onClick={() => {
              if (window.confirm("Clear all saved scores and missed-question history?")) clearProgress();
            }}
          >
            Reset progress
          </button>
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
      <h2 id={headingId} className="text-lg font-semibold">
        {title}
      </h2>
      <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {concepts.map((c) => {
          const b = best[c.id];
          const score = b ? toScore(b.correct, b.total) : null;
          const n = CONCEPTS.findIndex((x) => x.id === c.id) + 1;
          return (
            <li key={c.id} className="flex h-full flex-col gap-2 rounded-xl border border-border bg-surface p-4">
              <span className="text-sm text-muted">{String(n).padStart(2, "0")}</span>
              <h3 className="font-semibold">{c.title}</h3>
              <span className="text-sm text-muted">{c.summary}</span>
              <span id={`${c.id}-best`} className="mt-auto pt-2 text-sm">
                {!hydrated ? (
                  <span className="text-muted">Best: …</span>
                ) : score ? (
                  <BestBadge percent={score.percent} correct={score.correct} total={score.total} />
                ) : (
                  <span className="text-muted">Not attempted</span>
                )}
              </span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link href={`/concepts/${c.id}`} className={`${buttonSecondary} text-sm`}>
                  Study<span className="sr-only"> {c.title}</span>
                </Link>
                <Link href={`/quiz/${c.id}`} className={`${buttonSecondary} text-sm`} aria-describedby={`${c.id}-best`}>
                  Quiz<span className="sr-only"> on {c.title}</span>
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function BestBadge({ percent, correct, total }: { percent: number; correct: number; total: number }) {
  const tone =
    percent >= 80 ? "bg-success-bg text-success" : percent >= 50 ? "bg-surface-2 text-fg" : "bg-danger-bg text-danger";
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 font-medium ${tone}`}>
      Best: {percent}% ({correct}/{total})
    </span>
  );
}
