import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConceptTabs } from "@/components/ConceptTabs";
import { Eli5Panel, InterviewPanel, RelatedPanel, UsagePanel, WhyPanel } from "@/components/GuidePanels";
import { RichText } from "@/components/RichText";
import { buttonPrimary, buttonSecondary } from "@/components/ui";
import { guideFor } from "@/data/guides";
import { CONCEPTS, questions } from "@/data/questions";
import { highlightCsharp } from "@/lib/highlight";

export const dynamicParams = false;

export function generateStaticParams() {
  return CONCEPTS.map((c) => ({ id: c.id }));
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const concept = CONCEPTS.find((c) => c.id === id);
  if (!concept) return { title: "C#/.NET Concepts" };
  return {
    title: `${concept.title} · C#/.NET Concepts`,
    description: guideFor(concept.id).definition.replaceAll("`", ""),
  };
}

export default async function ConceptPage({ params }: Props) {
  const { id } = await params;
  const index = CONCEPTS.findIndex((c) => c.id === id);
  if (index === -1) notFound();

  const concept = CONCEPTS[index];
  const guide = guideFor(concept.id);
  const quizCount = questions.filter((q) => q.concept === concept.id).length;
  const quizHref = `/quiz/${concept.id}`;
  const examples = await Promise.all(
    guide.examples.map(async (ex) => ({ caption: ex.caption, html: await highlightCsharp(ex.code) })),
  );
  const prev = CONCEPTS[index - 1];
  const next = CONCEPTS[index + 1];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 lg:px-10 lg:py-10">
      <p className="eyebrow">
        # {concept.id}.md · {concept.core ? "core concept" : "additional concept"}
      </p>

      <header className="mt-2">
        <h1 className="text-2xl font-semibold sm:text-3xl">{concept.title}</h1>
        <p className="mt-3 text-lg leading-relaxed">
          <RichText text={guide.definition} />
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href={quizHref} className={buttonPrimary}>
            Take the quiz ({quizCount} questions)
          </Link>
          {guide.docsUrl && (
            <a href={guide.docsUrl} target="_blank" rel="noopener noreferrer" className={buttonSecondary}>
              Microsoft Learn<span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
        </div>
      </header>

      <section aria-label="Study guide" className="mt-8">
        <ConceptTabs
          label={`${concept.title} study guide`}
          tabs={[
            { id: "why", label: "Why it matters", panel: <WhyPanel guide={guide} /> },
            { id: "usage", label: "How it's used", panel: <UsagePanel guide={guide} examples={examples} /> },
            { id: "eli5", label: "ELI5", panel: <Eli5Panel guide={guide} /> },
            { id: "related", label: "Related topics", panel: <RelatedPanel guide={guide} /> },
            {
              id: "interview",
              label: "Interview questions",
              panel: <InterviewPanel guide={guide} quizHref={quizHref} quizCount={quizCount} />,
            },
          ]}
        />
      </section>

      <nav aria-label="Other concepts" className="mt-10 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
        {prev ? (
          <Link
            href={`/concepts/${prev.id}`}
            className="flex flex-col rounded-xl border border-border bg-surface p-4 hover:border-accent"
          >
            <span className="text-sm text-muted">← Previous</span>
            <span className="font-semibold">{prev.title}</span>
          </Link>
        ) : (
          <span className="hidden sm:block" />
        )}
        {next && (
          <Link
            href={`/concepts/${next.id}`}
            className="flex flex-col rounded-xl border border-border bg-surface p-4 hover:border-accent sm:items-end sm:text-right"
          >
            <span className="text-sm text-muted">Next →</span>
            <span className="font-semibold">{next.title}</span>
          </Link>
        )}
      </nav>
    </main>
  );
}
