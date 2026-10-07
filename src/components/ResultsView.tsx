"use client";

import Link from "next/link";
import { CONCEPTS, questions } from "@/data/questions";
import { aggregateByConcept, modeLabel, scoreAnswers, selectMissed } from "@/lib/quiz";
import { loadProgress } from "@/lib/storage";
import { CodeBlock } from "./CodeBlock";
import { RichText } from "./RichText";
import { buttonPrimary, buttonSecondary, textLink } from "./ui";

const byId = new Map(questions.map((q) => [q.id, q]));
const conceptTitle = (id: string) => CONCEPTS.find((c) => c.id === id)?.title ?? id;

/** Client-only (rendered with ssr: false): reads the most recent attempt from storage. */
export default function ResultsView({ highlighted }: { highlighted: Record<string, string> }) {
  const progress = loadProgress();
  const attempt = progress.lastAttempt;

  if (!attempt || attempt.answers.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6">
        <h1 className="text-xl font-semibold">No results yet</h1>
        <p className="mt-2 text-muted">Finish a quiz to see your results here.</p>
        <Link href="/" className={`${buttonPrimary} mt-4`}>
          Choose a quiz
        </Link>
      </div>
    );
  }

  const answers = attempt.answers.filter((a) => byId.has(a.questionId));
  const overall = scoreAnswers(answers);
  const perConcept = aggregateByConcept(answers);
  const missed = answers.filter((a) => !a.correct);
  const totalMissedNow = selectMissed(questions, progress).length;

  return (
    <div>
      <p className="text-sm font-medium text-muted">{modeLabel(attempt.mode)} · Results</p>
      <h1 className="mt-1 text-3xl font-bold">
        {overall.percent}%{" "}
        <span className="text-lg font-medium text-muted">
          ({overall.correct} of {overall.total} correct)
        </span>
      </h1>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link href={`/quiz/${attempt.mode}`} className={buttonPrimary}>
          Retake {modeLabel(attempt.mode)}
        </Link>
        {totalMissedNow > 0 && (
          <Link href="/quiz/missed" className={buttonSecondary}>
            Review missed ({totalMissedNow})
          </Link>
        )}
        <Link href="/" className={buttonSecondary}>
          All concepts
        </Link>
      </div>

      <section aria-labelledby="breakdown-heading" className="mt-10">
        <h2 id="breakdown-heading" className="text-lg font-semibold">
          By concept
        </h2>
        <ul className="mt-4 flex flex-col gap-2">
          {perConcept.map(({ concept, score }) => (
            <li key={concept} className="rounded-lg border border-border bg-surface p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-medium">{conceptTitle(concept)}</span>
                <span className="text-sm text-muted">
                  {score.correct}/{score.total} · {score.percent}%
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
                <div
                  className={`h-full rounded-full ${score.percent >= 80 ? "bg-success" : score.percent >= 50 ? "bg-accent" : "bg-danger"}`}
                  style={{ width: `${score.percent}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="missed-heading" className="mt-10">
        <h2 id="missed-heading" className="text-lg font-semibold">
          Missed questions ({missed.length})
        </h2>
        {missed.length === 0 ? (
          <p className="mt-2 text-muted">None — every answer was correct.</p>
        ) : (
          <ol className="mt-4 flex flex-col gap-4">
            {missed.map((a) => {
              const q = byId.get(a.questionId)!;
              return (
                <li key={q.id} className="min-w-0 rounded-xl border border-border bg-surface p-4 sm:p-6">
                  <p className="text-xs font-medium text-muted">{conceptTitle(q.concept)}</p>
                  <h3 className="mt-1 font-semibold">
                    <RichText text={q.prompt} />
                  </h3>
                  {highlighted[q.id] && <CodeBlock html={highlighted[q.id]} />}
                  <dl className="mt-3 grid gap-2 text-sm">
                    <div>
                      <dt className="font-semibold text-danger">✗ Your answer</dt>
                      <dd className="break-words">
                        <RichText text={q.options[a.selectedIndex] ?? "—"} />
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-success">✓ Correct answer</dt>
                      <dd className="break-words">
                        <RichText text={q.options[q.correctIndex]} />
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-3">
                    <RichText text={q.explanation} />
                  </p>
                  {q.docsUrl && (
                    <p className="mt-2">
                      <a href={q.docsUrl} target="_blank" rel="noopener noreferrer" className={textLink}>
                        Read the docs on Microsoft Learn<span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
