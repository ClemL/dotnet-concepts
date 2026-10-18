"use client";

import Link from "next/link";
import { CONCEPTS, questions, type ConceptInfo } from "@/data/questions";
import { CORE_CONCEPTS, selectMissed, toScore } from "@/lib/quiz";
import { STORAGE_KEY, clearProgress } from "@/lib/storage";
import { buttonPrimary, buttonSecondary } from "./ui";
import { useProgress } from "./useProgress";

const coreCount = questions.filter((q) => CORE_CONCEPTS.includes(q.concept)).length;

const rowLink =
  "inline-flex min-h-11 items-center rounded-md border border-border-strong px-3.5 hover:bg-surface-2";

export function HomeDashboard() {
  const { progress, hydrated } = useProgress();
  const missedCount = selectMissed(questions, progress).length;
  const answeredCount = Object.keys(progress.questionResults).length;
  const attemptedCount = CONCEPTS.filter((c) => progress.bestByConcept[c.id]).length;
  const core = CONCEPTS.filter((c) => c.core);
  const additional = CONCEPTS.filter((c) => !c.core);

  return (
    <>
      <nav aria-label="Quiz modes" className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link href="/quiz/core" className={`${buttonPrimary} min-h-12 gap-3 px-5`}>
          $ quiz --core<span className="font-medium">{coreCount}</span>
        </Link>
        <Link href="/quiz/all" className={`${buttonSecondary} min-h-12 gap-3 px-5`}>
          $ quiz --all<span className="font-medium text-muted">{questions.length}</span>
        </Link>
        {hydrated && missedCount > 0 ? (
          <Link href="/quiz/missed" className={`${buttonSecondary} min-h-12 gap-3 px-5`}>
            $ quiz --missed<span className="font-medium text-danger">{missedCount}</span>
          </Link>
        ) : (
          <span
            className={`${buttonSecondary} min-h-12 cursor-not-allowed gap-3 px-5 opacity-60 hover:bg-surface`}
            aria-disabled="true"
            title="Answer some questions first"
          >
            $ quiz --missed<span className="font-medium text-muted">0</span>
          </span>
        )}
      </nav>

      <dl className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(12.5rem,1fr))] gap-px overflow-hidden rounded-lg border border-border bg-border">
        <Stat label="concepts.attempted" value={attemptedCount} of={CONCEPTS.length} hydrated={hydrated} />
        <Stat label="questions.answered" value={answeredCount} of={questions.length} hydrated={hydrated} />
        <Stat label="questions.missed" value={missedCount} hydrated={hydrated} tone="text-danger" />
      </dl>

      <ConceptSection id="core" title="core" concepts={core} best={progress.bestByConcept} hydrated={hydrated} />
      <ConceptSection
        id="additional"
        title="additional"
        concepts={additional}
        best={progress.bestByConcept}
        hydrated={hydrated}
      />

      <p className="mt-12 font-mono text-[0.8125rem] text-muted">
        keys: 1–4 select · enter submit · progress: localStorage ({STORAGE_KEY})
      </p>
    </>
  );
}

/** Header action; renders only once there is saved progress to clear. */
export function ResetProgressButton({ className }: { className?: string }) {
  const { progress, hydrated } = useProgress();
  if (!hydrated || Object.keys(progress.questionResults).length === 0) return null;
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        if (window.confirm("Clear all saved scores and missed-question history?")) clearProgress();
      }}
    >
      reset --progress
    </button>
  );
}

function Stat({
  label,
  value,
  of,
  hydrated,
  tone = "",
}: {
  label: string;
  value: number;
  of?: number;
  hydrated: boolean;
  tone?: string;
}) {
  return (
    <div className="bg-surface px-5 py-4 font-mono">
      <dt className="text-[0.8125rem] text-muted">{label}</dt>
      <dd className={`mt-1 text-[1.75rem] font-bold ${tone}`}>
        {hydrated ? value : "…"}
        {of !== undefined && <span className="text-base font-normal text-muted"> / {of}</span>}
      </dd>
    </div>
  );
}

function ConceptSection({
  id,
  title,
  concepts,
  best,
  hydrated,
}: {
  id: string;
  title: string;
  concepts: ConceptInfo[];
  best: ReturnType<typeof useProgress>["progress"]["bestByConcept"];
  hydrated: boolean;
}) {
  const headingId = `${id}-heading`;
  const questionCount = questions.filter((q) => concepts.some((c) => c.id === q.concept)).length;
  return (
    <section id={id} aria-labelledby={headingId} className="mt-14 scroll-mt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 font-mono">
        <h2 id={headingId} className="text-lg font-bold">
          <span className="text-accent">{"// "}</span>
          {title}
        </h2>
        <span className="text-[0.8125rem] text-muted">
          {concepts.length} concepts · {questionCount} questions
        </span>
      </div>
      <ul className="mt-4 overflow-hidden rounded-lg border border-border bg-surface">
        {concepts.map((c) => {
          const b = best[c.id];
          const score = b ? toScore(b.correct, b.total) : null;
          const n = CONCEPTS.findIndex((x) => x.id === c.id) + 1;
          const tone = !score
            ? { bar: "bg-muted", text: "text-muted" }
            : score.percent >= 80
              ? { bar: "bg-success", text: "text-success" }
              : score.percent >= 50
                ? { bar: "bg-accent", text: "text-accent" }
                : { bar: "bg-danger", text: "text-danger" };
          return (
            <li
              key={c.id}
              className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border px-5 py-3.5 first:border-t-0"
            >
              <span className="w-7 font-mono text-[0.8125rem] text-muted">{String(n).padStart(2, "0")}</span>
              <div className="min-w-0 flex-[999_1_20rem]">
                <h3 className="font-semibold">{c.title}</h3>
                <p className="mt-0.5 text-sm text-muted">{c.summary}</p>
              </div>
              <div className="flex flex-[1_0_14rem] items-center gap-3">
                <div aria-hidden="true" className="h-1.5 w-22 overflow-hidden rounded-full bg-surface-2">
                  <div className={`h-full ${tone.bar}`} style={{ width: `${score?.percent ?? 0}%` }} />
                </div>
                <span id={`${c.id}-best`} className={`whitespace-nowrap font-mono text-[0.8125rem] ${tone.text}`}>
                  {!hydrated
                    ? "best: …"
                    : score
                      ? `best ${score.percent}% · ${score.correct}/${score.total}`
                      : "not attempted"}
                </span>
              </div>
              <div className="flex gap-2 font-mono text-[0.8125rem]">
                <Link href={`/concepts/${c.id}`} className={rowLink}>
                  study<span className="sr-only"> {c.title}</span>
                </Link>
                <Link href={`/quiz/${c.id}`} className={rowLink} aria-describedby={`${c.id}-best`}>
                  quiz<span className="sr-only"> on {c.title}</span>
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
