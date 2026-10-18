import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QuizLoader } from "@/components/QuizLoader";
import { CONCEPTS, questions } from "@/data/questions";
import { highlightQuestions } from "@/lib/highlight";
import { isQuizMode, modeLabel, questionsForMode, emptyProgress, type QuizMode } from "@/lib/quiz";

const MODES: QuizMode[] = ["core", "all", "missed", ...CONCEPTS.map((c) => c.id)];

export const dynamicParams = false;

export function generateStaticParams() {
  return MODES.map((mode) => ({ mode }));
}

type Props = { params: Promise<{ mode: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { mode } = await params;
  return { title: isQuizMode(mode) ? `${modeLabel(mode)} · C#/.NET Quiz` : "C#/.NET Quiz" };
}

export default async function QuizPage({ params }: Props) {
  const { mode } = await params;
  if (!isQuizMode(mode)) notFound();

  // "missed" depends on browser-only progress, so it receives every question and filters client-side.
  const pool = mode === "missed" ? questions : questionsForMode(mode, questions, emptyProgress());
  const highlighted = await highlightQuestions(pool);

  return (
    <main>
      <QuizLoader mode={mode} questions={pool} highlighted={highlighted} />
    </main>
  );
}
