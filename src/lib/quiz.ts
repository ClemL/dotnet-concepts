/**
 * Pure quiz logic: shuffling, scoring, aggregation and progress updates.
 * No React, no DOM, no storage access — everything here is deterministic given its inputs.
 */
import { CONCEPTS, type Concept, type Question } from "@/data/questions";

// ───────────── Random numbers ─────────────

export type Rng = () => number;

/** Mulberry32: small, fast, seedable PRNG returning floats in [0, 1). */
export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher–Yates shuffle. Returns a new array; the input is not modified. */
export function shuffle<T>(items: readonly T[], rngOrSeed: Rng | number = Math.random): T[] {
  const rng = typeof rngOrSeed === "number" ? createRng(rngOrSeed) : rngOrSeed;
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ───────────── Prepared (shuffled) questions ─────────────

export interface PreparedQuestion {
  question: Question;
  /** Options in display order. */
  options: string[];
  /** displayToOriginal[displayIndex] = index in question.options. */
  displayToOriginal: number[];
  /** Index of the correct option in display order. */
  correctIndex: number;
}

export function prepareQuestion(question: Question, rng: Rng): PreparedQuestion {
  const displayToOriginal = shuffle(
    question.options.map((_, i) => i),
    rng,
  );
  return {
    question,
    options: displayToOriginal.map((i) => question.options[i]),
    displayToOriginal,
    correctIndex: displayToOriginal.indexOf(question.correctIndex),
  };
}

/** Shuffles question order and each question's option order. */
export function prepareQuiz(questions: readonly Question[], seed: number): PreparedQuestion[] {
  const rng = createRng(seed);
  return shuffle(questions, rng).map((q) => prepareQuestion(q, rng));
}

// ───────────── Answers and scoring ─────────────

export interface AnswerRecord {
  questionId: string;
  concept: Concept;
  /** Index into the question's original (unshuffled) options. */
  selectedIndex: number;
  correct: boolean;
}

export function answerQuestion(prepared: PreparedQuestion, displayIndex: number): AnswerRecord {
  const selectedIndex = prepared.displayToOriginal[displayIndex];
  if (selectedIndex === undefined) {
    throw new RangeError(`Option ${displayIndex} does not exist`);
  }
  return {
    questionId: prepared.question.id,
    concept: prepared.question.concept,
    selectedIndex,
    correct: selectedIndex === prepared.question.correctIndex,
  };
}

export interface Score {
  correct: number;
  total: number;
  /** 0–100, rounded to the nearest integer; 0 when total is 0. */
  percent: number;
}

export function toScore(correct: number, total: number): Score {
  return { correct, total, percent: total === 0 ? 0 : Math.round((correct / total) * 100) };
}

export function scoreAnswers(answers: readonly AnswerRecord[]): Score {
  return toScore(answers.filter((a) => a.correct).length, answers.length);
}

/** Per-concept scores, in syllabus order, for concepts that appear in the answers. */
export function aggregateByConcept(answers: readonly AnswerRecord[]): { concept: Concept; score: Score }[] {
  const tally = new Map<Concept, { correct: number; total: number }>();
  for (const a of answers) {
    const t = tally.get(a.concept) ?? { correct: 0, total: 0 };
    t.total += 1;
    if (a.correct) t.correct += 1;
    tally.set(a.concept, t);
  }
  return CONCEPTS.filter((c) => tally.has(c.id)).map((c) => {
    const t = tally.get(c.id)!;
    return { concept: c.id, score: toScore(t.correct, t.total) };
  });
}

// ───────────── Progress ─────────────

export type QuizMode = Concept | "core" | "all" | "missed";

export interface AttemptRecord {
  mode: QuizMode;
  finishedAt: number;
  answers: AnswerRecord[];
}

export interface Progress {
  version: 1;
  /** Most recent result for each question ever answered. */
  questionResults: Record<string, { correct: boolean; answeredAt: number }>;
  /** Best score seen for each concept, across any mode that included it. */
  bestByConcept: Partial<Record<Concept, { correct: number; total: number }>>;
  lastAttempt: AttemptRecord | null;
}

export function emptyProgress(): Progress {
  return { version: 1, questionResults: {}, bestByConcept: {}, lastAttempt: null };
}

function isBetter(candidate: Score, current: { correct: number; total: number } | undefined): boolean {
  if (!current) return true;
  const currentPct = current.total === 0 ? 0 : current.correct / current.total;
  const candidatePct = candidate.total === 0 ? 0 : candidate.correct / candidate.total;
  if (candidatePct !== currentPct) return candidatePct > currentPct;
  return candidate.total > current.total;
}

/** Returns a new Progress with the attempt applied; the input is not modified. */
export function applyAttempt(progress: Progress, attempt: AttemptRecord): Progress {
  const questionResults = { ...progress.questionResults };
  for (const a of attempt.answers) {
    questionResults[a.questionId] = { correct: a.correct, answeredAt: attempt.finishedAt };
  }

  const bestByConcept = { ...progress.bestByConcept };
  for (const { concept, score } of aggregateByConcept(attempt.answers)) {
    if (isBetter(score, bestByConcept[concept])) {
      bestByConcept[concept] = { correct: score.correct, total: score.total };
    }
  }

  return { version: 1, questionResults, bestByConcept, lastAttempt: attempt };
}

/** Questions whose most recent answer was wrong. */
export function selectMissed(questions: readonly Question[], progress: Progress): Question[] {
  return questions.filter((q) => progress.questionResults[q.id]?.correct === false);
}

export const CORE_CONCEPTS: readonly Concept[] = CONCEPTS.filter((c) => c.core).map((c) => c.id);

export function isQuizMode(value: string): value is QuizMode {
  return value === "core" || value === "all" || value === "missed" || CONCEPTS.some((c) => c.id === value);
}

/** The question pool for a mode, before shuffling. */
export function questionsForMode(mode: QuizMode, questions: readonly Question[], progress: Progress): Question[] {
  switch (mode) {
    case "all":
      return [...questions];
    case "core":
      return questions.filter((q) => CORE_CONCEPTS.includes(q.concept));
    case "missed":
      return selectMissed(questions, progress);
    default:
      return questions.filter((q) => q.concept === mode);
  }
}

export function modeLabel(mode: QuizMode): string {
  switch (mode) {
    case "all":
      return "Full quiz";
    case "core":
      return "Core 12 quiz";
    case "missed":
      return "Review missed";
    default:
      return CONCEPTS.find((c) => c.id === mode)?.title ?? mode;
  }
}
