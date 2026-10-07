"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CONCEPTS, type Question } from "@/data/questions";
import {
  answerQuestion,
  applyAttempt,
  modeLabel,
  prepareQuiz,
  questionsForMode,
  type AnswerRecord,
  type PreparedQuestion,
  type QuizMode,
} from "@/lib/quiz";
import { loadProgress, saveProgress } from "@/lib/storage";
import { CodeBlock } from "./CodeBlock";
import { RichText } from "./RichText";
import { buttonPrimary, buttonSecondary, textLink } from "./ui";

interface QuizRunnerProps {
  mode: QuizMode;
  /** Candidate questions; the final pool is filtered by mode (e.g. missed) on the client. */
  questions: Question[];
  highlighted: Record<string, string>;
}

const DIFFICULTY_LABEL = { 1: "Basic", 2: "Intermediate", 3: "Advanced" } as const;

/** Client-only (rendered with ssr: false): shuffling and saved progress are browser concerns. */
export default function QuizRunner({ mode, questions, highlighted }: QuizRunnerProps) {
  const router = useRouter();
  const [prepared] = useState<PreparedQuestion[]>(() =>
    prepareQuiz(questionsForMode(mode, questions, loadProgress()), Math.floor(Math.random() * 2 ** 32)),
  );
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const current = prepared[index];
  const isLast = index === prepared.length - 1;
  const lastAnswer = submitted ? answers[answers.length - 1] : undefined;

  useEffect(() => {
    headingRef.current?.focus();
  }, [index]);

  const submit = useCallback(() => {
    if (!current || submitted || selected === null) return;
    setAnswers((prev) => [...prev, answerQuestion(current, selected)]);
    setSubmitted(true);
  }, [current, submitted, selected]);

  const advance = useCallback(() => {
    if (!submitted) return;
    if (isLast) {
      const attempt = { mode, finishedAt: Date.now(), answers };
      saveProgress(applyAttempt(loadProgress(), attempt));
      router.push("/results");
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setSubmitted(false);
  }, [submitted, isLast, mode, answers, router]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("a, input, textarea, select, [contenteditable='true']")) return;

      if (/^[1-4]$/.test(e.key)) {
        const i = Number(e.key) - 1;
        if (!submitted && current && i < current.options.length) {
          e.preventDefault();
          setSelected(i);
        }
      } else if (e.key === "Enter") {
        if (!submitted && selected !== null) {
          e.preventDefault();
          submit();
        } else if (submitted) {
          e.preventDefault();
          advance();
        }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [current, submitted, selected, submit, advance]);

  if (prepared.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6">
        <h1 className="text-xl font-semibold">Nothing to review</h1>
        <p className="mt-2 text-muted">
          {mode === "missed"
            ? "You have no questions whose most recent answer was wrong."
            : "This quiz has no questions."}
        </p>
        <Link href="/" className={`${buttonPrimary} mt-4`}>
          Back to concepts
        </Link>
      </div>
    );
  }

  const q = current.question;
  const conceptTitle = CONCEPTS.find((c) => c.id === q.concept)?.title ?? q.concept;
  const correctSoFar = answers.filter((a) => a.correct).length;
  const progressPct = Math.round(((index + (submitted ? 1 : 0)) / prepared.length) * 100);

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-muted">
          {modeLabel(mode)} · Question {index + 1} of {prepared.length}
        </p>
        <p className="text-sm text-muted">
          Score: {correctSoFar}/{answers.length}
        </p>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
        <div className="h-full rounded-full bg-accent transition-[width]" style={{ width: `${progressPct}%` }} />
      </div>

      <article className="mt-6 rounded-xl border border-border bg-surface p-4 sm:p-6">
        <p className="flex flex-wrap gap-2 text-xs font-medium">
          <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-fg">{conceptTitle}</span>
          <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-fg">{DIFFICULTY_LABEL[q.difficulty]}</span>
        </p>
        <h1 ref={headingRef} tabIndex={-1} id="question-prompt" className="mt-3 text-lg font-semibold leading-snug focus:outline-none">
          <RichText text={q.prompt} />
        </h1>

        {highlighted[q.id] && <CodeBlock html={highlighted[q.id]} />}

        <div role="group" aria-labelledby="question-prompt" className="mt-4 flex flex-col gap-2">
          {current.options.map((option, i) => {
            const isSelected = selected === i;
            const isCorrect = i === current.correctIndex;
            let tone = "border-border bg-surface hover:bg-surface-2";
            let marker: string | null = null;
            if (submitted && isCorrect) {
              tone = "border-success bg-success-bg";
              marker = isSelected ? "✓ Your answer — correct" : "✓ Correct answer";
            } else if (submitted && isSelected) {
              tone = "border-danger bg-danger-bg";
              marker = "✗ Your answer";
            } else if (isSelected) {
              tone = "border-accent bg-accent-soft";
            }
            return (
              <button
                key={i}
                type="button"
                aria-pressed={isSelected}
                aria-disabled={submitted}
                onClick={() => !submitted && setSelected(i)}
                className={`flex w-full items-start gap-3 rounded-lg border-2 p-3 text-left ${tone} ${
                  submitted ? "cursor-default" : "cursor-pointer"
                }`}
              >
                <kbd
                  className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded border border-border bg-surface-2 font-mono text-xs"
                  aria-hidden="true"
                >
                  {i + 1}
                </kbd>
                <span className="min-w-0 flex-1 break-words">
                  <span className="sr-only">Option {i + 1}: </span>
                  <RichText text={option} />
                  {marker && (
                    <span
                      className={`mt-1 block text-sm font-semibold ${isCorrect ? "text-success" : "text-danger"}`}
                    >
                      {marker}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <div role="status" aria-live="polite" className="mt-4">
          {lastAnswer && (
            <div
              className={`rounded-lg border p-4 ${
                lastAnswer.correct ? "border-success bg-success-bg" : "border-danger bg-danger-bg"
              }`}
            >
              <p className={`font-semibold ${lastAnswer.correct ? "text-success" : "text-danger"}`}>
                {lastAnswer.correct ? "Correct." : "Incorrect."}
                {!lastAnswer.correct && (
                  <span className="font-normal text-fg">
                    {" "}
                    The correct answer is option {current.correctIndex + 1}.
                  </span>
                )}
              </p>
              <p className="mt-2 text-fg">
                <RichText text={q.explanation} />
              </p>
              {q.docsUrl && (
                <p className="mt-2">
                  <a href={q.docsUrl} target="_blank" rel="noopener noreferrer" className={textLink}>
                    Read the docs on Microsoft Learn<span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">
            Keys: <kbd className="font-mono">1</kbd>–<kbd className="font-mono">4</kbd> select ·{" "}
            <kbd className="font-mono">Enter</kbd> {submitted ? (isLast ? "finish" : "next") : "submit"}
          </p>
          {submitted ? (
            <button type="button" className={buttonPrimary} onClick={advance}>
              {isLast ? "See results" : "Next question"}
            </button>
          ) : (
            <button type="button" className={buttonPrimary} onClick={submit} disabled={selected === null}>
              Submit answer
            </button>
          )}
        </div>
      </article>

      <p className="mt-6">
        <Link href="/" className={buttonSecondary}>
          Quit to concepts
        </Link>
      </p>
    </div>
  );
}
