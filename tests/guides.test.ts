import { describe, expect, it } from "vitest";
import { GUIDES, type ConceptGuide } from "@/data/guides";
import { CONCEPT_IDS } from "@/data/questions";

const entries = CONCEPT_IDS.map((id) => [id, GUIDES[id]] as const);

/** Every prose string in a guide; each one is rendered by RichText, which pairs up backticks. */
function proseOf(guide: ConceptGuide): string[] {
  return [
    guide.definition,
    ...guide.why,
    ...guide.usage,
    ...guide.examples.map((e) => e.caption),
    ...guide.eli5,
    ...guide.related.flatMap((r) => ("topic" in r ? [r.topic, r.why] : [r.why])),
    ...guide.interview.flatMap((q) => [q.question, q.answer]),
  ];
}

describe("study guides", () => {
  it("has a guide for every concept and no extras", () => {
    expect(Object.keys(GUIDES).sort()).toEqual([...CONCEPT_IDS].sort());
  });

  it.each(entries)("%s has every section filled in", (_id, guide) => {
    expect(guide.definition.trim().length).toBeGreaterThan(40);
    expect(guide.why.length).toBeGreaterThanOrEqual(3);
    expect(guide.usage.length).toBeGreaterThanOrEqual(3);
    expect(guide.examples.length).toBeGreaterThanOrEqual(1);
    expect(guide.eli5.length).toBeGreaterThanOrEqual(1);
    expect(guide.related.length).toBeGreaterThanOrEqual(4);
    expect(guide.interview.length).toBeGreaterThanOrEqual(5);
    for (const ex of guide.examples) {
      expect(ex.caption.trim()).not.toBe("");
      expect(ex.code.trim()).not.toBe("");
    }
  });

  it.each(entries)("%s links only to other, existing concepts, without duplicates", (id, guide) => {
    const linked = guide.related.flatMap((r) => ("concept" in r ? [r.concept] : []));
    expect(linked.length, "at least one in-app link").toBeGreaterThanOrEqual(1);
    expect(linked).not.toContain(id);
    for (const c of linked) expect(CONCEPT_IDS).toContain(c);
    expect(new Set(linked).size).toBe(linked.length);
    const topics = guide.related.flatMap((r) => ("topic" in r ? [r.topic] : []));
    expect(new Set(topics).size).toBe(topics.length);
  });

  it.each(entries)("%s has distinct interview questions with substantive answers at more than one level", (_id, guide) => {
    const asked = guide.interview.map((q) => q.question);
    expect(new Set(asked).size).toBe(asked.length);
    for (const q of guide.interview) {
      // Questions or imperative prompts ("Compare X and Y.").
      expect(q.question.trim(), q.question).toMatch(/[?.]$/);
      expect(q.answer.trim().length, q.question).toBeGreaterThan(120);
      expect([1, 2, 3]).toContain(q.level);
    }
    expect(new Set(guide.interview.map((q) => q.level)).size).toBeGreaterThanOrEqual(2);
  });

  it.each(entries)("%s has balanced inline-code backticks in every prose string", (_id, guide) => {
    for (const text of proseOf(guide)) {
      expect(text.split("`").length % 2, text).toBe(1);
    }
  });

  it.each(entries)("%s cites only learn.microsoft.com", (_id, guide) => {
    if (guide.docsUrl) expect(guide.docsUrl).toMatch(/^https:\/\/learn\.microsoft\.com\//);
  });
});
