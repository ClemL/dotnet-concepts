# C#/.NET Concepts Quiz

A multiple-choice quiz with 110 questions across 22 C#/.NET concepts. The first 12 concepts form the core syllabus (60 questions); the other 10 are additional concepts (50 questions). It has no backend, database, or authentication. The questions live in a typed data file, and progress is stored in the browser's `localStorage`.

**Stack:** Next.js 16 (App Router, static generation) · TypeScript (strict) · Tailwind CSS v4 · shiki (server-side syntax highlighting) · Vitest · pnpm

## Concepts

| # | Core (5 questions each) | # | Additional (5 questions each) |
|---|---|---|---|
| 1 | Naming conventions | 13 | async / await |
| 2 | Fields vs properties | 14 | LINQ |
| 3 | Generic type parameters | 15 | Nullable reference types |
| 4 | Class vs struct | 16 | IDisposable and using |
| 5 | Boxing and unboxing | 17 | Span\<T> and Memory\<T> |
| 6 | The `is` keyword | 18 | Exceptions |
| 7 | Func / Action / Predicate | 19 | Equality |
| 8 | Static vs singleton | 20 | Collections |
| 9 | Shims | 21 | Architecture patterns (CQRS, Outbox, Decorator, Repository, Vertical Slice) |
| 10 | Extension methods | 22 | Hosting and resilience (BackgroundService, PeriodicTimer, Polly v8) |
| 11 | Base Class Library | | |
| 12 | .NET design patterns | | |

The home page offers **Core 12 quiz (60)**, **Full quiz (110)**, **Review missed**, and one quiz per concept.

## Run locally

Requires Node.js 20 or later and pnpm 10 (`corepack enable` provides pnpm).

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

The production build is served the same way it runs on Vercel:

```bash
pnpm build
pnpm start          # http://localhost:3000; use `pnpm start -p 3123` for another port
```

## Test

```bash
pnpm test           # Vitest, single run
pnpm test:watch     # watch mode
pnpm typecheck      # tsc --noEmit (strict)
pnpm lint           # ESLint (next/core-web-vitals)
```

The test suite covers:

- `tests/data.test.ts`: every question has 4 unique options, an in-range `correctIndex`, a non-empty explanation, and a unique id. Each concept has exactly 5 questions, with at least 2 code-reading and at least 1 scenario question. No option says "all/none of the above", and every `docsUrl` points to learn.microsoft.com.
- `tests/quiz.test.ts`: seeded shuffle determinism, the correct-answer mapping surviving option shuffles (fixed seeds), scoring, per-concept aggregation, best-score tracking, and missed-question selection.
- `tests/storage.test.ts`: round-trip under `quiz-progress-v1`, `localStorage` methods that throw, a provider that throws on access, the in-memory fallback, and corrupt or wrong-version data.

## Deploy to Vercel

Every route is statically generated at build time, so no environment variables or server configuration are required.

**Option A: Git import (recommended)**

1. Push this repository to GitHub.
2. In Vercel, select **Add New… → Project** and import the repository.
3. Accept the detected defaults: framework **Next.js**, install command `pnpm install`, build command `pnpm build`. Then select **Deploy**.

Every subsequent push to the default branch deploys to production, and every pull request gets a preview URL.

**Option B: Vercel CLI**

```bash
pnpm add -g vercel   # or: npm i -g vercel
vercel login
vercel               # preview deployment; links the project on first run
vercel --prod        # production deployment
```

## Project structure

```
src/
  app/
    page.tsx               Home: concept grid with best scores, quiz-mode buttons
    quiz/[mode]/page.tsx   Quiz route (mode = concept id | core | all | missed); highlights code server-side
    results/page.tsx       Results of the most recent attempt
    globals.css            Theme tokens (light/dark via prefers-color-scheme), shiki dual-theme CSS
  components/              HomeDashboard, QuizRunner, ResultsView, CodeBlock, RichText, loaders
  data/questions.ts        Concept union type, concept metadata, typed Question[] data
  lib/quiz.ts              Pure logic: seeded shuffle, prepare/answer, scoring, aggregation, progress updates
  lib/storage.ts           Guarded localStorage wrapper (key: quiz-progress-v1) with in-memory fallback
  lib/highlight.ts         shiki highlighter (server-only)
tests/                     Vitest suites
docs/REVIEW.md             Summary of the question review pass
```

### Behavior notes

- **Shuffling:** each attempt picks a random seed, then shuffles both the question order and each question's option order. Answers are recorded against the original option index, so scoring never depends on display order.
- **Review missed:** this mode includes every question whose most recent answer was wrong, across all modes. Answering a question correctly later removes it from the set.
- **Best score per concept:** the score is updated from any mode that includes the concept (single concept, core, full, or missed).
- **Storage unavailable:** when `localStorage` is blocked (private mode, disabled site data, or quota errors), the app switches to in-memory storage. Quizzes and results still work for the session; nothing persists after a reload.
- **Keyboard:** <kbd>1</kbd>–<kbd>4</kbd> select an option. <kbd>Enter</kbd> submits, then advances to the next question. Feedback is announced through an `aria-live` region.

## Adding questions

1. Open `src/data/questions.ts` and add an object to the `questions` array, inside the section for its concept:

   ```ts
   {
     id: "linq-6",                       // `${concept}-${n}`, unique
     concept: "linq",                    // must be a Concept id
     kind: "code",                       // "code" | "scenario" | "concept"
     difficulty: 2,                      // 1 basic · 2 intermediate · 3 advanced
     prompt: "What does this print?",    // `backticks` render as inline code
     code: `var xs = new[] { 1, 2, 3 };
   Console.WriteLine(xs.Skip(1).First());`, // optional C# snippet; required when kind is "code"
     options: ["1", "2", "3", "Throws `InvalidOperationException`"],
     correctIndex: 1,
     explanation:
       "Two to four sentences: why the answer is right, and why the most tempting distractor is wrong.",
     docsUrl: `${LEARN}/dotnet/csharp/linq/`, // optional; learn.microsoft.com only, and only if the page certainly exists
   },
   ```

2. Follow the content rules:
   - Use exactly 4 options with exactly one correct answer. Distractors should be plausible misconceptions, never "all/none of the above".
   - Snippets must be valid C# 12 or later, unless the question is explicitly "Does this compile?". When a snippet mixes top-level statements and type declarations, put the statements first.
   - Don't depend on facts you can't verify, such as exact version numbers, limits, or performance figures; rephrase the question instead.
3. The tests currently require **exactly 5 questions per concept**. To grow a concept beyond 5, update the count assertion in `tests/data.test.ts` and in `tests/quiz.test.ts` (`questionsForMode("core")` expects 60).
4. To add a new concept, add its id to `CONCEPT_IDS` and its metadata to `CONCEPTS` (set `core: false`), then add 5 questions for it. The home grid, routes (`/quiz/<id>`), and results breakdown pick it up automatically.
5. Run `pnpm test && pnpm build`.

## Question review

All questions went through a separate verification pass after they were written. See [`docs/REVIEW.md`](docs/REVIEW.md) for what changed and why.
