"use client";

import Link from "next/link";
import { CONCEPTS, questions } from "@/data/questions";
import { aggregateByConcept, modeLabel, scoreAnswers, selectMissed } from "@/lib/quiz";
import { loadProgress } from "@/lib/storage";
import { CodeBlock } from "./CodeBlock";
import { RichText } from "./RichText";
import { buttonPrimary, buttonSecondary, scoreTone, textLink } from "./ui";

const byId = new Map(questions.map((q) => [q.id, q]));
const conceptTitle = (id: string) => CONCEPTS.find((c) => c.id === id)?.title ?? id;

/** Client-only (rendered with ssr: false): reads the most recent attempt from storage. */
export default function ResultsView({ highlighted }: { highlighted: Record<string, string> }) {
  const progress = loadProgress();
  const attempt = progress.lastAttempt;

  if (!attempt || attempt.answers.length === 0) {
    return (
      <div>
        <p className="eyebrow">{"// results.log"}</p>
        <h1 className="mt-2 text-xl font-semibold">No results yet</h1>
        <p className="mt-2 text-muted">Finish a quiz to see your results here.</p>
        <Link href="/" className={`${buttonPrimary} mt-5`}>
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
  const finished = new Date(attempt.finishedAt);

  return (
    <div>
      <p className="eyebrow">
        {"// results.log · "}{modeLabel(attempt.mode).toLowerCase()} ·{" "}
        {finished.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
      </p>
      <h1 className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className={`font-mono text-4xl font-semibold tabular-nums ${scoreTone(overall.percent)}`}>
          {overall.percent}%
        </span>
        <span className="font-mono text-base text-muted">
          <span className="text-success">{overall.correct} passed</span> ·{" "}
          <span className={missed.length ? "text-danger" : ""}>{missed.length} failed</span> · {overall.total} total
        </span>
      </h1>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link href={`/quiz/${attempt.mode}`} className={buttonPrimary}>
          Run again
        </Link>
        {totalMissedNow > 0 && (
          <Link href="/quiz/missed" className={`${buttonSecondary} border-danger text-danger`}>
            Review missed ({totalMissedNow})
          </Link>
        )}
        <Link href="/" className={buttonSecondary}>
          All concepts
        </Link>
      </div>

      <section aria-labelledby="breakdown-heading" className="mt-10">
        <h2 id="breakdown-heading" className="eyebrow">
          ## By concept
        </h2>
        <ul className="mt-3 overflow-hidden rounded-lg border border-border font-mono text-[0.8125rem]">
          {perConcept.map(({ concept, score }) => (
            <li
              key={concept}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 border-b border-border bg-surface px-4 py-2.5 last:border-b-0 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_auto]"
            >
              <Link href={`/concepts/${concept}`} className="truncate text-fg underline-offset-2 hover:text-accent hover:underline">
                {concept}.cs<span className="sr-only"> study guide</span>
              </Link>
              <span className="col-span-2 row-start-2 h-1.5 overflow-hidden rounded bg-border sm:col-span-1 sm:row-start-1 sm:col-start-2" aria-hidden="true">
                <span
                  className={`block h-full ${score.percent >= 80 ? "bg-success" : score.percent < 50 ? "bg-danger" : "bg-accent"}`}
                  style={{ width: `${score.percent}%` }}
                />
              </span>
              <span className={`text-right tabular-nums ${scoreTone(score.percent)}`}>
                {score.correct}/{score.total} · {score.percent}%
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="missed-heading" className="mt-10">
        <h2 id="missed-heading" className="eyebrow">
          ## Failed ({missed.length})
        </h2>
        {missed.length === 0 ? (
          <p className="mt-3 font-mono text-sm text-success">✓ All answers passed.</p>
        ) : (
          <ol className="mt-3 flex flex-col gap-4">
            {missed.map((a) => {
              const q = byId.get(a.questionId)!;
              return (
                <li key={q.id} className="min-w-0 rounded-lg border border-border bg-surface p-4 sm:p-5">
                  <p className="font-mono text-xs text-muted">
                    {q.concept}.cs · {conceptTitle(q.concept)}
                  </p>
                  <h3 className="mt-1 font-semibold">
                    <RichText text={q.prompt} />
                  </h3>
                  {highlighted[q.id] && <CodeBlock html={highlighted[q.id]} />}
                  <dl className="mt-3 grid gap-2.5 text-sm">
                    <div className="rounded-md border border-danger bg-danger-bg px-3 py-2">
                      <dt className="font-mono text-xs font-medium text-danger">✗ your answer</dt>
                      <dd className="mt-0.5 break-words">
                        <RichText text={q.options[a.selectedIndex] ?? "—"} />
                      </dd>
                    </div>
                    <div className="rounded-md border border-success bg-success-bg px-3 py-2">
                      <dt className="font-mono text-xs font-medium text-success">✓ expected</dt>
                      <dd className="mt-0.5 break-words">
                        <RichText text={q.options[q.correctIndex]} />
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-3 leading-relaxed">
                    <RichText text={q.explanation} />
                  </p>
                  <p className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                    <Link href={`/concepts/${q.concept}`} className={textLink}>
                      Study guide: {conceptTitle(q.concept)}
                    </Link>
                    {q.docsUrl && (
                      <a href={q.docsUrl} target="_blank" rel="noopener noreferrer" className={textLink}>
                        Microsoft Learn docs ↗<span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    )}
                  </p>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
