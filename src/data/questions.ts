/**
 * Quiz content. Every question is plain data; nothing in this file depends on React.
 * See README.md ("Adding questions") for the authoring rules enforced by tests/data.test.ts.
 */

export const CONCEPT_IDS = [
  // Core 12
  "naming",
  "fields-properties",
  "generics",
  "class-struct",
  "boxing",
  "is-patterns",
  "delegates",
  "static-singleton",
  "shims",
  "extension-methods",
  "bcl",
  "design-patterns",
  // Additional concepts
  "async-await",
  "linq",
  "nullable-reference-types",
  "disposal",
  "span-memory",
  "exceptions",
  "equality",
  "collections",
  "architecture",
  "hosting-resilience",
] as const;

export type Concept = (typeof CONCEPT_IDS)[number];

export type Difficulty = 1 | 2 | 3;

/** code = reads a snippet; scenario = judgment call; concept = definitional knowledge. */
export type QuestionKind = "code" | "scenario" | "concept";

export interface ConceptInfo {
  id: Concept;
  title: string;
  summary: string;
  /** True for the 12 concepts in the original syllabus. */
  core: boolean;
}

export interface Question {
  id: string;
  concept: Concept;
  kind: QuestionKind;
  difficulty: Difficulty;
  prompt: string;
  /** C# snippet, rendered with syntax highlighting. */
  code?: string;
  options: readonly [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  /** 2–4 sentences: why the answer is right and why the most tempting distractor is wrong. */
  explanation: string;
  /** learn.microsoft.com only. */
  docsUrl?: string;
}

export const CONCEPTS: readonly ConceptInfo[] = [
  { id: "naming", title: "Naming conventions", summary: "PascalCase, camelCase, _camelCase, acronyms, constants", core: true },
  { id: "fields-properties", title: "Fields vs properties", summary: "Binary compatibility, init, serializers, the field keyword", core: true },
  { id: "generics", title: "Generic type parameters", summary: "Naming, constraints, in/out variance", core: true },
  { id: "class-struct", title: "Class vs struct", summary: "Value vs reference semantics, records, ref struct", core: true },
  { id: "boxing", title: "Boxing and unboxing", summary: "Heap copies, exact-type unboxing, hidden boxing", core: true },
  { id: "is-patterns", title: "The is keyword", summary: "Type, property, relational, logical and list patterns", core: true },
  { id: "delegates", title: "Func, Action, Predicate", summary: "Delegate types and Expression<Func<>> in EF Core", core: true },
  { id: "static-singleton", title: "Static vs singleton", summary: "Static classes, DI lifetimes, captive dependencies", core: true },
  { id: "shims", title: "Shims", summary: "Polyfills, Microsoft Fakes, TimeProvider", core: true },
  { id: "extension-methods", title: "Extension methods", summary: "Static binding, null receivers, C# 14 extension blocks", core: true },
  { id: "bcl", title: "Base Class Library", summary: "BCL vs FCL vs runtime vs SDK, CoreLib, Microsoft.Bcl.*", core: true },
  { id: "design-patterns", title: ".NET design patterns", summary: "Keyed DI, Options, middleware, HttpClientFactory, licensing", core: true },
  { id: "async-await", title: "async / await", summary: "Continuations, async void, ConfigureAwait, ValueTask", core: false },
  { id: "linq", title: "LINQ", summary: "Deferred execution, IQueryable, Single vs First", core: false },
  { id: "nullable-reference-types", title: "Nullable reference types", summary: "Annotations, null-forgiving, attributes", core: false },
  { id: "disposal", title: "IDisposable and using", summary: "Disposal order, finalizers, IAsyncDisposable", core: false },
  { id: "span-memory", title: "Span<T> and Memory<T>", summary: "Slicing without copies, ref struct limits, stackalloc", core: false },
  { id: "exceptions", title: "Exceptions", summary: "throw vs throw ex, filters, finally, guard clauses", core: false },
  { id: "equality", title: "Equality", summary: "== vs Equals, records, GetHashCode contracts", core: false },
  { id: "collections", title: "Collections", summary: "HashSet, Dictionary, read-only views, FrozenDictionary", core: false },
  { id: "architecture", title: "Architecture patterns", summary: "CQRS, Outbox, Decorator, Repository, Vertical Slice", core: false },
  { id: "hosting-resilience", title: "Hosting and resilience", summary: "BackgroundService, PeriodicTimer, Polly v8", core: false },
];

export const questions: Question[] = [];
