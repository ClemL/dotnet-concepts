/** Server-rendered tab panels for a concept's study guide (see ConceptTabs for the tab behavior). */
import Link from "next/link";
import type { ReactNode } from "react";
import type { ConceptGuide, RelatedTopic } from "@/data/guides";
import { CONCEPTS, type Concept } from "@/data/questions";
import { CodeBlock } from "./CodeBlock";
import { RichText } from "./RichText";
import { textLink } from "./ui";

const LEVEL_LABEL = { 1: "Basic", 2: "Intermediate", 3: "Advanced" } as const;

/** The selected tab already shows the panel's name, so the heading is for screen readers' outline only. */
function PanelHeading({ children }: { children: ReactNode }) {
  return <h2 className="sr-only">{children}</h2>;
}

function BulletList({ items }: { items: string[] }) {
  return (
    // role="list" keeps list semantics in Safari, which drops them when list-style is removed.
    <ul role="list" className="flex flex-col gap-3">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
          <span className="min-w-0 leading-relaxed">
            <RichText text={item} />
          </span>
        </li>
      ))}
    </ul>
  );
}

export function WhyPanel({ guide }: { guide: ConceptGuide }) {
  return (
    <>
      <PanelHeading>Why it matters</PanelHeading>
      <BulletList items={guide.why} />
    </>
  );
}

export function UsagePanel({ guide, examples }: { guide: ConceptGuide; examples: { caption: string; html: string }[] }) {
  return (
    <>
      <PanelHeading>How it&apos;s commonly used</PanelHeading>
      <BulletList items={guide.usage} />
      {examples.map((ex, i) => (
        <section key={i} className="mt-8 min-w-0" aria-labelledby={`example-${i}`}>
          <h3 id={`example-${i}`} className="font-semibold">
            {examples.length > 1 ? `Example ${i + 1}` : "Example"}
          </h3>
          <p className="mt-1 text-sm text-muted">
            <RichText text={ex.caption} />
          </p>
          <CodeBlock html={ex.html} label={`C# example ${i + 1}`} />
        </section>
      ))}
    </>
  );
}

export function Eli5Panel({ guide }: { guide: ConceptGuide }) {
  return (
    <>
      <PanelHeading>Explain like I&apos;m five</PanelHeading>
      <p className="text-sm text-muted">
        A deliberately simplified analogy. The other tabs give the precise version.
      </p>
      <div className="mt-4 flex flex-col gap-4 text-lg leading-relaxed">
        {guide.eli5.map((paragraph, i) => (
          <p key={i}>
            <RichText text={paragraph} />
          </p>
        ))}
      </div>
    </>
  );
}

const conceptTitle = (id: Concept) => CONCEPTS.find((c) => c.id === id)?.title ?? id;

export function RelatedPanel({ guide }: { guide: ConceptGuide }) {
  const inApp = guide.related.filter((r): r is Extract<RelatedTopic, { concept: Concept }> => "concept" in r);
  const beyond = guide.related.filter((r): r is Extract<RelatedTopic, { topic: string }> => "topic" in r);
  return (
    <>
      <PanelHeading>Related topics</PanelHeading>
      {inApp.length > 0 && (
        <section aria-labelledby="related-in-app">
          <h3 id="related-in-app" className="font-semibold">
            Concepts in this app
          </h3>
          <ul role="list" className="mt-3 flex flex-col gap-3">
            {inApp.map((r) => (
              <li key={r.concept} className="rounded-lg border border-border p-3">
                <Link href={`/concepts/${r.concept}`} className={textLink}>
                  {conceptTitle(r.concept)}
                </Link>
                <p className="mt-1 text-sm leading-relaxed">
                  <RichText text={r.why} />
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
      {beyond.length > 0 && (
        <section aria-labelledby="related-beyond" className={inApp.length > 0 ? "mt-8" : undefined}>
          <h3 id="related-beyond" className="font-semibold">
            Further topics
          </h3>
          <ul role="list" className="mt-3 flex flex-col gap-3">
            {beyond.map((r) => (
              <li key={r.topic} className="rounded-lg bg-surface-2 p-3">
                <p className="font-medium">
                  <RichText text={r.topic} />
                </p>
                <p className="mt-1 text-sm leading-relaxed">
                  <RichText text={r.why} />
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

export function InterviewPanel({
  guide,
  quizHref,
  quizCount,
}: {
  guide: ConceptGuide;
  quizHref: string;
  quizCount: number;
}) {
  return (
    <>
      <PanelHeading>Common interview questions</PanelHeading>
      <p className="text-sm text-muted">
        Answer out loud first, then open the question to compare with a model answer.
      </p>
      <ol className="mt-4 flex flex-col gap-3">
        {guide.interview.map((q, i) => (
          <li key={i}>
            <details className="group rounded-lg border border-border">
              <summary className="flex cursor-pointer list-none items-start gap-3 rounded-lg p-4 hover:bg-surface-2 [&::-webkit-details-marker]:hidden">
                <span
                  aria-hidden="true"
                  className="mt-0.5 inline-block shrink-0 text-muted transition-transform group-open:rotate-90"
                >
                  ▸
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-semibold">
                    <span className="sr-only">Question {i + 1}: </span>
                    <RichText text={q.question} />
                  </span>
                  <span className="mt-2 block">
                    <span className="inline-block rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-medium text-fg">
                      {LEVEL_LABEL[q.level]}
                    </span>
                  </span>
                </span>
              </summary>
              <div className="border-t border-border px-4 pb-4 pt-3 leading-relaxed">
                <RichText text={q.answer} />
              </div>
            </details>
          </li>
        ))}
      </ol>
      <p className="mt-6">
        <Link href={quizHref} className={textLink}>
          Test yourself with the {quizCount}-question quiz
        </Link>
      </p>
    </>
  );
}
