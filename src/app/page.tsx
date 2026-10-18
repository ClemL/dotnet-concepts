import { HomeDashboard } from "@/components/HomeDashboard";
import { CONCEPTS, questions } from "@/data/questions";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 lg:px-10 lg:py-10">
      <p className="eyebrow"># README.md</p>
      <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">C#/.NET Concepts Quiz</h1>
      <p className="mt-3 max-w-2xl text-muted">
        {questions.length} multiple-choice questions across {CONCEPTS.length} concepts: code reading, judgment calls
        and fundamentals. Questions and options are reshuffled every run. Progress is saved in this browser only.
      </p>
      <HomeDashboard />
    </main>
  );
}
