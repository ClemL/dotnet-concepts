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
import { buttonPrimary, textLink } from "./ui";

interface QuizRunnerProps {
  mode: QuizMode;
  /** Candidate questions; the final pool is filtered by mode (e.g. missed) on the client. */
  questions: Question[];
  highlighted: Record<string, string>;
}

const DIFFICULTY_LABEL = { 1: "basic", 2: "intermediate", 3: "advanced" } as const;
const KIND_LABEL = { code: "code reading", scenario: "scenario", concept: "concept" } as const;
/** Above this many questions the per-question segments get too thin; use a continuous bar. */
const MAX_SEGMENTS = 20;
/** Options at or under this length fit two per row on wider screens. */
const SHORT_OPTION = 48;

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
  const outputRef = useRef<HTMLElement>(null);

  const current = prepared[index];
  const isLast = index === prepared.length - 1;
  const lastAnswer = submitted ? answers[answers.length - 1] : undefined;
  const conceptIndex = CONCEPTS.findIndex((c) => c.id === mode);

  useEffect(() => {
    headingRef.current?.focus();
  }, [index]);

  // Below the xl breakpoint the output panel sits under the options; bring it into view after answering.
  useEffect(() => {
    if (!submitted || window.matchMedia("(min-width: 80rem)").matches) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    outputRef.current?.scrollIntoView({ block: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
  }, [submitted]);

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

  const goToConcept = useCallback(
    (offset: number) => {
      if (conceptIndex < 0) return;
      const next = CONCEPTS[(conceptIndex + offset + CONCEPTS.length) % CONCEPTS.length];
      router.push(`/quiz/${next.id}`);
    },
    [conceptIndex, router],
  );

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
      } else if ((e.key === "[" || e.key === "]") && conceptIndex >= 0) {
        e.preventDefault();
        goToConcept(e.key === "]" ? 1 : -1);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [current, submitted, selected, submit, advance, conceptIndex, goToConcept]);

  if (prepared.length === 0) {
    return (
      <div className="px-4 py-8 lg:px-10">
        <p className="eyebrow">{"// output"}</p>
        <h1 className="mt-2 text-xl font-semibold">Nothing to review</h1>
        <p className="mt-2 text-muted">
          {mode === "missed"
            ? "You have no questions whose most recent answer was wrong."
            : "This quiz has no questions."}
        </p>
        <Link href="/" className={`${buttonPrimary} mt-5`}>
          Back to concepts
        </Link>
      </div>
    );
  }

  const q = current.question;
  const conceptTitle = CONCEPTS.find((c) => c.id === q.concept)?.title ?? q.concept;
  const correctSoFar = answers.filter((a) => a.correct).length;
  const shortOptions = current.options.every((o) => o.length <= SHORT_OPTION);
  const fileName = conceptIndex >= 0 ? `${mode}.cs` : `${mode}.sln`;

  const actionButton = submitted ? (
    <button type="button" className={`${buttonPrimary} w-full sm:w-auto xl:w-full`} onClick={advance}>
      {isLast ? "See results ⏎" : "Next question ⏎"}
    </button>
  ) : (
    <button
      type="button"
      className={`${buttonPrimary} w-full sm:w-auto xl:w-full`}
      onClick={submit}
      disabled={selected === null}
    >
      Run answer ⏎
    </button>
  );

  return (
    <div className="flex flex-col xl:grid xl:min-h-[calc(100vh-5.25rem)] xl:grid-cols-[minmax(0,1fr)_22rem] xl:grid-rows-[1fr_auto]">
      {/* Editor pane */}
      <section className="min-w-0 px-4 pt-4 pb-6 lg:px-10 lg:pt-6 xl:row-span-2">
        <div className="flex items-end gap-3 border-b border-border font-mono text-[0.8125rem]">
          <span className="-mb-px rounded-t-md border border-b-2 border-border border-b-accent bg-surface px-3 py-1.5">
            <span className="text-accent">C#</span> {fileName}
          </span>
          <span className="ml-auto pb-1.5 text-muted tabular-nums">
            {index + 1} / {prepared.length}
          </span>
        </div>

        <ProgressSegments total={prepared.length} index={index} answers={answers} submitted={submitted} />

        <p className="eyebrow mt-5">
          {"// "}
          {conceptIndex >= 0 ? "" : `${modeLabel(mode).toLowerCase()} · `}
          {conceptTitle.toLowerCase()} · {KIND_LABEL[q.kind]} · {DIFFICULTY_LABEL[q.difficulty]}
        </p>
        <h1
          ref={headingRef}
          tabIndex={-1}
          id="question-prompt"
          className="mt-2 text-xl leading-snug font-semibold lg:text-2xl"
        >
          <RichText text={q.prompt} />
        </h1>

        {highlighted[q.id] && <CodeBlock html={highlighted[q.id]} />}

        <div
          role="group"
          aria-labelledby="question-prompt"
          className={`mt-4 grid grid-cols-1 gap-2.5 ${shortOptions ? "sm:grid-cols-2" : ""}`}
        >
          {current.options.map((option, i) => (
            <OptionButton
              key={i}
              index={i}
              text={option}
              selected={selected === i}
              correct={i === current.correctIndex}
              submitted={submitted}
              onSelect={() => !submitted && setSelected(i)}
            />
          ))}
        </div>
      </section>

      {/* Output panel: beside the editor on wide screens, below the options otherwise */}
      <aside
        ref={outputRef}
        aria-label="Output"
        className={`${submitted ? "flex" : "hidden xl:flex"} min-w-0 scroll-mb-24 flex-col gap-3 border-t border-border bg-surface px-4 py-5 lg:px-10 xl:border-t-0 xl:border-l xl:px-5`}
      >
        <p className="eyebrow">Output</p>
        {lastAnswer ? (
          <>
            <p
              className={`font-mono text-[0.9375rem] font-medium ${lastAnswer.correct ? "text-success" : "text-danger"}`}
            >
              {lastAnswer.correct ? "✓ Passed" : `✗ Failed · expected option ${current.correctIndex + 1}`}
            </p>
            <p className="leading-relaxed text-fg">
              <RichText text={q.explanation} />
            </p>
            {q.docsUrl && (
              <p>
                <a href={q.docsUrl} target="_blank" rel="noopener noreferrer" className={textLink}>
                  Microsoft Learn docs ↗<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </p>
            )}
          </>
        ) : (
          <p className="font-mono text-sm text-muted">Waiting for an answer…</p>
        )}
      </aside>

      {/* Action bar: pinned to the bottom of the screen on phones/tablets, bottom of the output panel on wide screens */}
      <div className="sticky bottom-0 z-10 flex items-center gap-4 border-t border-border bg-bg px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:px-10 xl:static xl:flex-col xl:items-stretch xl:border-l xl:bg-surface xl:px-5 xl:pb-5">
        <span className="shrink-0 font-mono text-xs text-muted tabular-nums xl:order-2">
          score {correctSoFar}/{answers.length}
        </span>
        <div className="ml-auto w-full max-w-60 sm:max-w-none sm:w-auto xl:ml-0 xl:w-full xl:max-w-none">{actionButton}</div>
      </div>

      <div className="sr-only" role="status" aria-live="polite">
        {lastAnswer
          ? lastAnswer.correct
            ? "Correct."
            : `Incorrect. The correct answer is option ${current.correctIndex + 1}.`
          : ""}
      </div>
    </div>
  );
}

function ProgressSegments({
  total,
  index,
  answers,
  submitted,
}: {
  total: number;
  index: number;
  answers: AnswerRecord[];
  submitted: boolean;
}) {
  if (total > MAX_SEGMENTS) {
    const pct = Math.round(((index + (submitted ? 1 : 0)) / total) * 100);
    return (
      <div className="mt-3 h-[3px] w-full overflow-hidden rounded bg-border" aria-hidden="true">
        <div className="h-full bg-accent transition-[width]" style={{ width: `${pct}%` }} />
      </div>
    );
  }
  return (
    <div
      className="mt-3 grid max-w-sm gap-1"
      style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
      aria-hidden="true"
    >
      {Array.from({ length: total }, (_, i) => {
        const answer = answers[i];
        const tone = answer ? (answer.correct ? "bg-success" : "bg-danger") : i === index ? "bg-accent" : "bg-border";
        return <div key={i} className={`h-[3px] rounded ${tone}`} />;
      })}
    </div>
  );
}

function OptionButton({
  index,
  text,
  selected,
  correct,
  submitted,
  onSelect,
}: {
  index: number;
  text: string;
  selected: boolean;
  correct: boolean;
  submitted: boolean;
  onSelect: () => void;
}) {
  let tone = "border-border bg-surface hover:border-border-strong";
  let badge = "border border-border-strong text-muted";
  let marker: string | null = null;
  if (submitted && correct) {
    tone = "border-success bg-success-bg";
    badge = "bg-success text-bg";
    marker = selected ? "✓ your answer" : "✓ correct answer";
  } else if (submitted && selected) {
    tone = "border-danger bg-danger-bg";
    badge = "bg-danger text-bg";
    marker = "✗ your answer";
  } else if (selected) {
    tone = "border-accent bg-accent-soft";
    badge = "bg-accent text-accent-fg";
  }
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-disabled={submitted}
      onClick={onSelect}
      className={`flex min-h-12 w-full items-start gap-3 rounded-lg border p-3 text-left ${tone} ${
        submitted ? "cursor-default" : "cursor-pointer"
      }`}
    >
      <kbd
        aria-hidden="true"
        className={`mt-px inline-flex h-6 w-6 shrink-0 items-center justify-center rounded font-mono text-xs ${badge}`}
      >
        {index + 1}
      </kbd>
      <span className="min-w-0 flex-1 break-words">
        <span className="sr-only">Option {index + 1}: </span>
        <RichText text={text} />
        {marker && (
          <span className={`mt-1 block font-mono text-xs font-medium ${correct ? "text-success" : "text-danger"}`}>
            {marker}
          </span>
        )}
      </span>
    </button>
  );
}
