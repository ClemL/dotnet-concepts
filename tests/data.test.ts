import { describe, expect, it } from "vitest";
import { CONCEPT_IDS, CONCEPTS, questions } from "@/data/questions";

describe("question data", () => {
  it("has unique ids", () => {
    const ids = questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has exactly 5 questions per concept", () => {
    for (const concept of CONCEPT_IDS) {
      expect(questions.filter((q) => q.concept === concept), concept).toHaveLength(5);
    }
    expect(questions).toHaveLength(CONCEPT_IDS.length * 5);
  });

  it("has metadata for every concept, including the 12 core concepts", () => {
    expect(CONCEPTS.map((c) => c.id)).toEqual([...CONCEPT_IDS]);
    expect(CONCEPTS.filter((c) => c.core)).toHaveLength(12);
  });

  it.each(questions.map((q) => [q.id, q] as const))("%s is well-formed", (_id, q) => {
    expect(q.options).toHaveLength(4);
    // Exact (case-sensitive) comparison: casing questions deliberately offer UserId vs UserID.
    expect(new Set(q.options.map((o) => o.trim())).size).toBe(4);
    q.options.forEach((o) => expect(o.trim()).not.toBe(""));
    expect(Number.isInteger(q.correctIndex)).toBe(true);
    expect(q.correctIndex).toBeGreaterThanOrEqual(0);
    expect(q.correctIndex).toBeLessThan(q.options.length);
    expect(q.prompt.trim()).not.toBe("");
    expect(q.explanation.trim().length).toBeGreaterThan(40);
    expect([1, 2, 3]).toContain(q.difficulty);
    expect(q.id.startsWith(`${q.concept}-`)).toBe(true);
    if (q.kind === "code") expect(q.code?.trim()).toBeTruthy();
    if (q.docsUrl) expect(q.docsUrl).toMatch(/^https:\/\/learn\.microsoft\.com\//);
  });

  it("never uses 'all/none of the above' options", () => {
    for (const q of questions) {
      for (const o of q.options) expect(o.toLowerCase(), q.id).not.toMatch(/(all|none) of the above/);
    }
  });

  it("mixes question kinds: at least 2 code-reading and 1 scenario per concept", () => {
    for (const concept of CONCEPT_IDS) {
      const qs = questions.filter((q) => q.concept === concept);
      expect(qs.filter((q) => q.kind === "code").length, concept).toBeGreaterThanOrEqual(2);
      expect(qs.filter((q) => q.kind === "scenario").length, concept).toBeGreaterThanOrEqual(1);
    }
  });
});
