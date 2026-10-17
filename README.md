# C#/.NET Concepts Quiz

A multiple-choice quiz with 130 questions across 26 C#/.NET concepts. The first 12 concepts form the core syllabus (60 questions); the other 14 are additional concepts (70 questions). Every concept also has a study page covering why it matters, how it is used, an ELI5 explanation, related topics, and common interview questions. It has no backend, database, or authentication. The questions and study guides live in typed data files, and progress is stored in the browser's `localStorage`.

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
| 11 | Base Class Library | 23 | Dependency injection (registration rules, TryAdd, forwarding, disposal ownership, validation) |
| 12 | .NET design patterns | 24 | Configuration and Options (source precedence, environment variables, ValidateOnStart, Key Vault) |
| | | 25 | EF Core and Dapper on Azure SQL (tracking, execution strategies, SQL injection, bulk loads) |
| | | 26 | Money, rounding, and dates (decimal vs double, MidpointRounding, DateTimeOffset, DateOnly) |

The home page offers **Core 12 quiz (60)**, **Full quiz (130)**, **Review missed**, and, for each concept, a **Study** page and a 5-question **Quiz**.

### Study pages

Each concept has a statically generated study page at `/concepts/<id>` with five tabs:

1. **Why it matters**: the practical consequences of getting the concept right or wrong.
2. **How it's used**: common usage patterns plus one or two C# examples, highlighted server-side with shiki.
3. **ELI5**: a deliberately simplified analogy.
4. **Related topics**: links to related concepts in this app, plus named topics outside it.
5. **Interview questions**: five common questions per concept, labeled Basic, Intermediate, or Advanced, each with a collapsible model answer.

The selected tab is stored in the URL fragment (for example `/concepts/linq#eli5`), so tabs can be linked to and survive a reload. The tabs follow the WAI-ARIA tabs pattern: <kbd>←</kbd>/<kbd>→</kbd> move between tabs, and <kbd>Home</kbd>/<kbd>End</kbd> jump to the first or last tab. The results page links each concept and each missed question to its study page.

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
- `tests/guides.test.ts`: every concept has a study guide with every section filled in (at least 3 "why" and 3 usage points, an example, 4 related topics including at least one in-app link, and 5 interview questions spanning at least two levels). Related-concept links must point to other existing concepts without duplicates, inline-code backticks must be balanced, and `docsUrl` must point to learn.microsoft.com.

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
    concepts/[id]/page.tsx Study page per concept: tabs for why, usage, ELI5, related topics, interview questions
    quiz/[mode]/page.tsx   Quiz route (mode = concept id | core | all | missed); highlights code server-side
    results/page.tsx       Results of the most recent attempt
    globals.css            Theme tokens (light/dark via prefers-color-scheme), shiki dual-theme CSS
  components/              HomeDashboard, QuizRunner, ResultsView, ConceptTabs, GuidePanels, CodeBlock, RichText, loaders
  data/questions.ts        Concept union type, concept metadata, typed Question[] data
  data/guides.ts           Study guide per concept (Record<Concept, ConceptGuide>)
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
4. To add a new concept, add its id to `CONCEPT_IDS` and its metadata to `CONCEPTS` (set `core: false`), add 5 questions for it, and add its study guide to `GUIDES` in `src/data/guides.ts` (TypeScript reports an error until the guide exists). The home grid, routes (`/quiz/<id>` and `/concepts/<id>`), and results breakdown pick it up automatically.
5. Run `pnpm test && pnpm build`.

## Study guides

Guides live in `src/data/guides.ts`, one `ConceptGuide` per concept. Prose fields use the same `backtick` convention as questions.

- **Definition:** one or two sentences, shown under the page title and used as the page's meta description.
- **Why / usage:** short, concrete bullet points. Prefer consequences ("throws at runtime", "loads every row") to adjectives.
- **Examples:** C# that compiles as written, given the types the caption says are assumed. Keep lines at 82 characters or fewer so the code block doesn't scroll on desktop. Don't use backticks, `${`, or backslashes in snippets, because they are stored in template literals.
- **ELI5:** an everyday analogy with no jargon; the page labels it as a simplification.
- **Related topics:** `{ concept, why }` links to another concept in this app, or `{ topic, why }` for a named topic outside it.
- **Interview questions:** five per concept, each with a `level` (1 basic, 2 intermediate, 3 advanced) and a 2–4 sentence model answer.
- The same accuracy rules as questions apply: no unverifiable version numbers, limits, or performance figures.

When the guides were written, every example was compiled against the .NET 10 SDK (10.0.112), with stub types for anything the caption marks as assumed. Examples with top-level statements were also run, and their output matched the `// comments`. The examples for concepts 23–26 were compiled against the .NET 8 SDK (8.0.131), with EF Core 8, Dapper, and Azure.Identity, and the same stub approach. The Microsoft Fakes example was compiled against stub `ShimsContext` and `ShimDateTime` types, because Fakes requires Visual Studio Enterprise. This check is not part of `pnpm test`.

## Question review

All questions went through a separate verification pass after they were written. See [`docs/REVIEW.md`](docs/REVIEW.md) for what changed and why.
