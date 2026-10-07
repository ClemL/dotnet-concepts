import { describe, expect, it } from "vitest";
import { questions, type Question } from "@/data/questions";
import {
  aggregateByConcept,
  answerQuestion,
  applyAttempt,
  createRng,
  emptyProgress,
  prepareQuiz,
  questionsForMode,
  scoreAnswers,
  selectMissed,
  shuffle,
  type AnswerRecord,
} from "@/lib/quiz";

const answer = (questionId: string, concept: Question["concept"], correct: boolean): AnswerRecord => ({
  questionId,
  concept,
  selectedIndex: 0,
  correct,
});

describe("shuffle", () => {
  it("is deterministic for a fixed seed and preserves the elements", () => {
    const items = Array.from({ length: 20 }, (_, i) => i);
    const a = shuffle(items, 42);
    expect(shuffle(items, 42)).toEqual(a);
    expect([...a].sort((x, y) => x - y)).toEqual(items);
    expect(a).not.toEqual(items);
    expect(items).toEqual(Array.from({ length: 20 }, (_, i) => i)); // input untouched
  });

  it("produces different orders for different seeds", () => {
    const items = Array.from({ length: 20 }, (_, i) => i);
    expect(shuffle(items, 1)).not.toEqual(shuffle(items, 2));
  });

  it("rng stays within [0, 1)", () => {
    const rng = createRng(7);
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("prepareQuiz", () => {
  it.each([1, 42, 2026, 123456789])("keeps the correct-answer mapping after shuffling (seed %i)", (seed) => {
    const prepared = prepareQuiz(questions, seed);
    expect(prepared).toHaveLength(questions.length);
    for (const p of prepared) {
      expect(p.options[p.correctIndex]).toBe(p.question.options[p.question.correctIndex]);
      expect([...p.options].sort()).toEqual([...p.question.options].sort());
      expect(answerQuestion(p, p.correctIndex).correct).toBe(true);
      for (let i = 0; i < 4; i++) {
        const record = answerQuestion(p, i);
        expect(record.correct).toBe(i === p.correctIndex);
        expect(p.question.options[record.selectedIndex]).toBe(p.options[i]);
      }
    }
  });

  it("actually moves correct answers around", () => {
    const positions = new Set(prepareQuiz(questions, 99).map((p) => p.correctIndex));
    expect(positions.size).toBe(4);
  });

  it("rejects out-of-range answers", () => {
    const [p] = prepareQuiz(questions.slice(0, 1), 1);
    expect(() => answerQuestion(p, 4)).toThrow(RangeError);
  });
});

describe("scoring", () => {
  const answers = [
    answer("naming-1", "naming", true),
    answer("naming-2", "naming", false),
    answer("boxing-1", "boxing", true),
    answer("boxing-2", "boxing", true),
    answer("linq-1", "linq", false),
  ];

  it("scores overall", () => {
    expect(scoreAnswers(answers)).toEqual({ correct: 3, total: 5, percent: 60 });
    expect(scoreAnswers([])).toEqual({ correct: 0, total: 0, percent: 0 });
  });

  it("aggregates per concept in syllabus order", () => {
    expect(aggregateByConcept(answers)).toEqual([
      { concept: "naming", score: { correct: 1, total: 2, percent: 50 } },
      { concept: "boxing", score: { correct: 2, total: 2, percent: 100 } },
      { concept: "linq", score: { correct: 0, total: 1, percent: 0 } },
    ]);
  });
});

describe("progress", () => {
  it("records results, keeps the best concept score and returns a new object", () => {
    const start = emptyProgress();
    const p1 = applyAttempt(start, {
      mode: "naming",
      finishedAt: 1,
      answers: [answer("naming-1", "naming", true), answer("naming-2", "naming", false)],
    });
    expect(start.questionResults).toEqual({});
    expect(p1.bestByConcept.naming).toEqual({ correct: 1, total: 2 });

    const p2 = applyAttempt(p1, {
      mode: "naming",
      finishedAt: 2,
      answers: [answer("naming-1", "naming", false), answer("naming-2", "naming", false)],
    });
    expect(p2.bestByConcept.naming).toEqual({ correct: 1, total: 2 }); // worse attempt does not overwrite
    expect(p2.questionResults["naming-1"]).toEqual({ correct: false, answeredAt: 2 });
    expect(p2.lastAttempt?.finishedAt).toBe(2);
  });

  it("selects only questions whose most recent answer was wrong", () => {
    let p = applyAttempt(emptyProgress(), {
      mode: "naming",
      finishedAt: 1,
      answers: [answer("naming-1", "naming", false), answer("naming-2", "naming", false)],
    });
    p = applyAttempt(p, { mode: "naming", finishedAt: 2, answers: [answer("naming-1", "naming", true)] });
    expect(selectMissed(questions, p).map((q) => q.id)).toEqual(["naming-2"]);
    expect(questionsForMode("missed", questions, p).map((q) => q.id)).toEqual(["naming-2"]);
  });

  it("builds pools for each mode", () => {
    const empty = emptyProgress();
    expect(questionsForMode("all", questions, empty)).toHaveLength(questions.length);
    expect(questionsForMode("core", questions, empty)).toHaveLength(60);
    expect(questionsForMode("generics", questions, empty)).toHaveLength(5);
    expect(questionsForMode("missed", questions, empty)).toHaveLength(0);
  });
});
