import Link from "next/link";
import { HomeDashboard, ResetProgressButton } from "@/components/HomeDashboard";
import { CONCEPTS, questions } from "@/data/questions";

const headerLink = "inline-flex min-h-11 items-center text-muted hover:text-fg";

export default function Home() {
  return (
    <>
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 font-mono text-sm sm:px-8">
          <Link href="/" className="inline-flex min-h-14 items-center gap-2">
            <span className="text-accent">~/</span>
            <span className="font-bold">dotnet-concepts</span>
          </Link>
          <nav aria-label="Site" className="flex flex-wrap items-center gap-x-5">
            <a href="#core" className={headerLink}>
              concepts
            </a>
            <Link href="/results" className={headerLink}>
              results
            </Link>
            <ResetProgressButton className={headerLink} />
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-8 sm:py-14">
        <p className="font-mono text-sm text-muted">
          {"// "}
          {questions.length} questions · {CONCEPTS.length} concepts · options reshuffle every attempt
        </p>
        <h1 className="mt-3 font-mono text-3xl font-bold tracking-tight sm:text-[2.75rem] sm:leading-tight">
          C#/.NET Concepts Quiz
          <span aria-hidden="true" className="ml-2 inline-block h-[0.9em] w-[0.5em] translate-y-[0.1em] bg-accent" />
        </h1>
        <p className="mt-4 max-w-2xl text-muted">
          Code reading, judgment calls and fundamentals. Every concept has a study guide with why it matters, usage, an
          ELI5, related topics and interview questions. Progress is saved in this browser only.
        </p>
        <HomeDashboard />
      </main>
    </>
  );
}
