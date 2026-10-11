import { HomeDashboard } from "@/components/HomeDashboard";
import { CONCEPTS, questions } from "@/data/questions";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-12">
      <header className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">C#/.NET Concepts Quiz</h1>
        <p className="mt-2 max-w-2xl text-muted">
          {questions.length} multiple-choice questions across {CONCEPTS.length} concepts: code reading, judgment calls
          and fundamentals. Options are reshuffled every attempt. Progress is saved in this browser only.
        </p>
        <p className="mt-2 max-w-2xl text-muted">
          Each concept also has a study guide: why it matters, how it&apos;s used, an ELI5 explanation, related topics
          and common interview questions.
        </p>
      </header>
      <HomeDashboard />
    </main>
  );
}
