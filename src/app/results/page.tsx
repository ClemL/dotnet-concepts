import type { Metadata } from "next";
import { ResultsLoader } from "@/components/ResultsLoader";
import { questions } from "@/data/questions";
import { highlightQuestions } from "@/lib/highlight";

export const metadata: Metadata = { title: "Results · C#/.NET Quiz" };

export default async function ResultsPage() {
  const highlighted = await highlightQuestions(questions);
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-10">
      <ResultsLoader highlighted={highlighted} />
    </main>
  );
}
