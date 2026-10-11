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

export const LEARN = "https://learn.microsoft.com/en-us";

export const questions: Question[] = [
  // ───────────────────────────── 1. Naming ─────────────────────────────
  {
    id: "naming-1",
    concept: "naming",
    kind: "concept",
    difficulty: 1,
    prompt: "Which name follows the .NET Framework Design Guidelines for a public property that holds a user identifier?",
    options: ["`UserId`", "`UserID`", "`userId`", "`USER_ID`"],
    correctIndex: 0,
    explanation:
      "The capitalization guidelines treat \"Id\" as an abbreviation of \"identifier\", not an acronym, so it is cased `Id` in PascalCase and `id` in camelCase. `UserID` is the most common mistake: only true two-letter acronyms such as `IO` stay fully uppercase.",
    docsUrl: `${LEARN}/dotnet/standard/design-guidelines/capitalization-conventions`,
  },
  {
    id: "naming-2",
    concept: "naming",
    kind: "code",
    difficulty: 1,
    prompt: "Which line violates .NET naming guidelines?",
    code: `public class OrderService
{
    private readonly int _retryCount;              // A
    public const int MAX_RETRIES = 3;              // B
    public string IOStreamName { get; set; } = ""; // C
    public void Process(int orderId) { }           // D
}`,
    options: ["Line A", "Line B", "Line C", "Line D"],
    correctIndex: 1,
    explanation:
      "Constants are PascalCase in .NET (`MaxRetries`); SCREAMING_CASE is a C/Java convention. Line C looks suspicious but is correct: two-letter acronyms such as `IO` keep both letters uppercase, as in `IOStream`. Line A uses the `_camelCase` private-field style from the .NET coding conventions, and Line D uses a camelCase parameter.",
    docsUrl: `${LEARN}/dotnet/csharp/fundamentals/coding-style/identifier-names`,
  },
  {
    id: "naming-3",
    concept: "naming",
    kind: "concept",
    difficulty: 2,
    prompt: "Which type name follows the .NET acronym capitalization rules?",
    options: ["`SQLConnection`", "`IoStream`", "`XmlHTTPRequest`", "`SqlConnection`"],
    correctIndex: 3,
    explanation:
      "Acronyms of three or more letters are treated as words and PascalCased (`Sql`, `Xml`, `Http`), which is why the BCL ships `SqlConnection` and `XmlReader`. `IoStream` is the tempting wrong answer because it looks consistent, but two-letter acronyms are the exception and stay uppercase (`IOStream`).",
    docsUrl: `${LEARN}/dotnet/standard/design-guidelines/capitalization-conventions`,
  },
  {
    id: "naming-4",
    concept: "naming",
    kind: "code",
    difficulty: 2,
    prompt: "In the C# coding conventions used by the .NET runtime team, what do the `s_` and `t_` prefixes signal?",
    code: `public class RequestTracker
{
    private static int s_instanceCount;

    [ThreadStatic]
    private static int t_depth;

    private int _pending;
}`,
    options: [
      "`s_` marks a private static field and `t_` marks a thread-static field",
      "`s_` marks a string field and `t_` marks a type-parameter field",
      "`s_` marks a sealed member and `t_` marks a transient (non-serialized) field",
      "`s_` marks a shared (public static) field and `t_` marks a temporary local",
    ],
    correctIndex: 0,
    explanation:
      "The identifier-naming conventions use `_camelCase` for private instance fields, `s_` for private or internal static fields, and `t_` for thread-static fields. The prefixes encode storage lifetime, not the field's type, so reading `s_` as \"string\" is a Hungarian-notation misreading.",
    docsUrl: `${LEARN}/dotnet/csharp/fundamentals/coding-style/identifier-names`,
  },
  {
    id: "naming-5",
    concept: "naming",
    kind: "scenario",
    difficulty: 1,
    prompt: "You are porting Java code that declares `public static final int MAX_SIZE = 100;`. Which C# declaration should you use?",
    options: [
      "`public const int MAX_SIZE = 100;`",
      "`public const int MaxSize = 100;`",
      "`public static readonly int maxSize = 100;`",
      "`public const int kMaxSize = 100;`",
    ],
    correctIndex: 1,
    explanation:
      "Public constants in .NET use PascalCase, so `MaxSize` is correct. Keeping `MAX_SIZE` is the tempting literal translation, but SCREAMING_CASE is not a .NET convention. If the value might change between library versions, prefer `static readonly` because `const` values are compiled into callers; the name is still PascalCase either way.",
    docsUrl: `${LEARN}/dotnet/csharp/fundamentals/coding-style/identifier-names`,
  },

  // ───────────────────────────── 2. Fields vs properties ─────────────────────────────
  {
    id: "fields-properties-1",
    concept: "fields-properties",
    kind: "code",
    difficulty: 3,
    prompt:
      "Library v1 exposes the field below. Library v2 changes it to `public int Count { get; set; }`. An app compiled against v1 runs against v2 without recompiling. What happens when the app reads `counter.Count`?",
    code: `// Library v1
public class Counter
{
    public int Count;
}

// App (compiled against v1)
var counter = new Counter();
Console.WriteLine(counter.Count);`,
    options: [
      "It works, because the C# syntax `counter.Count` is identical for fields and properties",
      "It throws `MissingFieldException` at runtime",
      "It returns 0, because the runtime falls back to the default value",
      "The runtime silently redirects the field load to `get_Count`",
    ],
    correctIndex: 1,
    explanation:
      "Field access compiles to an `ldfld` instruction while property access compiles to `call get_Count`, so the change is source-compatible but binary-breaking. The old IL still asks for a field named `Count`, which no longer exists, and the runtime throws `MissingFieldException`. Identical C# syntax is exactly why this break is easy to miss.",
  },
  {
    id: "fields-properties-2",
    concept: "fields-properties",
    kind: "code",
    difficulty: 1,
    prompt: "Does this compile?",
    code: `var p = new Person { Name = "Ada" };
p.Name = "Grace";

public class Person
{
    public string Name { get; init; } = "";
}`,
    options: [
      "Yes, and `p.Name` ends up as \"Grace\"",
      "No: the object initializer cannot assign an `init` accessor",
      "No: `p.Name = \"Grace\"` is an error because `init` properties can only be set during object initialization",
      "Yes, but the second assignment throws `InvalidOperationException` at runtime",
    ],
    correctIndex: 2,
    explanation:
      "An `init` accessor can be called only during construction: in a constructor, an object initializer, or a `with` expression. The object initializer is therefore fine, and the later assignment is a compile-time error (CS8852). Nothing is checked at runtime; the restriction is enforced entirely by the compiler.",
    docsUrl: `${LEARN}/dotnet/csharp/language-reference/keywords/init`,
  },
  {
    id: "fields-properties-3",
    concept: "fields-properties",
    kind: "concept",
    difficulty: 2,
    prompt: "An interface needs to expose a count to implementers. Why can't it declare `int Count;`?",
    options: [
      "Interfaces cannot declare instance fields; they declare a property such as `int Count { get; }` instead",
      "It can, as long as the project targets C# 8 or later, because default interface members allow instance fields",
      "It can, but the field must be marked `abstract`",
      "Interfaces can only contain methods, so the count must be exposed as `int GetCount()`",
    ],
    correctIndex: 0,
    explanation:
      "Interfaces describe a contract, and instance state is not part of a contract, so instance fields are not allowed. C# 8 default interface members are the tempting exception, but they permit static fields only, never instance fields. Properties are allowed (and have been since C# 1.0), which is one reason public APIs expose properties rather than fields.",
  },
  {
    id: "fields-properties-4",
    concept: "fields-properties",
    kind: "code",
    difficulty: 2,
    prompt: "With C# 14 (.NET 10), what does this print?",
    code: `var t = new Temperature { Celsius = 21.5 };
Console.WriteLine(t.Celsius);

public class Temperature
{
    public double Celsius
    {
        get;
        set => field = value < -273.15
            ? throw new ArgumentOutOfRangeException(nameof(value))
            : value;
    }
}`,
    options: [
      "21.5",
      "0, because the auto `get;` reads a different backing field than `field`",
      "It does not compile, because `field` is not a C# keyword",
      "It throws `StackOverflowException`, because the setter assigns the property recursively",
    ],
    correctIndex: 0,
    explanation:
      "C# 14 introduced the contextual `field` keyword, which refers to the compiler-generated backing field. Both the auto-implemented `get;` and the custom `set` use that same field, so validation is added without declaring a backing field by hand. Before C# 14 the snippet would not compile; with C# 14 it prints 21.5, and recursion only happens if the setter assigns `Celsius` itself.",
    docsUrl: `${LEARN}/dotnet/csharp/whats-new/csharp-14`,
  },
  {
    id: "fields-properties-5",
    concept: "fields-properties",
    kind: "scenario",
    difficulty: 2,
    prompt:
      "A DTO declares `public string Name;` and `public int Age;` as public fields. Serializing it with `System.Text.Json` default options produces `{}`. Which change should you make?",
    options: [
      "Mark the fields `readonly` so the serializer treats them as data",
      "Add `[Serializable]` to the class",
      "Convert the fields to auto-properties (`public string Name { get; set; }`)",
      "Make the fields `internal` so the serializer can reach them",
    ],
    correctIndex: 2,
    explanation:
      "`System.Text.Json` serializes public properties by default and ignores fields unless `IncludeFields` or `[JsonInclude]` is used; EF Core conventions likewise discover public properties, not public fields. Converting to auto-properties fixes the output and also satisfies analyzer rule CA1051 (do not declare visible instance fields). `[Serializable]` is the tempting answer, but it applies to the legacy binary formatter and has no effect on `System.Text.Json`.",
    docsUrl: `${LEARN}/dotnet/fundamentals/code-analysis/quality-rules/ca1051`,
  },

  // ───────────────────────────── 3. Generics ─────────────────────────────
  {
    id: "generics-1",
    concept: "generics",
    kind: "concept",
    difficulty: 1,
    prompt: "Which declaration follows the .NET naming guidelines for generic type parameters?",
    options: [
      "`class Cache<K, V>`",
      "`class Cache<KeyType, ValueType>`",
      "`class Cache<TKey, TValue>`",
      "`class Cache<tKey, tValue>`",
    ],
    correctIndex: 2,
    explanation:
      "Guidelines call for descriptive names prefixed with `T` (`TKey`, `TValue`, `TResult`, `TSource`, `TEntity`), and a bare `T` only when a single parameter is self-explanatory. `<K, V>` is the tempting answer because it is common in Java, but single letters other than `T` are not the .NET convention.",
    docsUrl: `${LEARN}/dotnet/standard/design-guidelines/names-of-classes-structs-and-interfaces`,
  },
  {
    id: "generics-2",
    concept: "generics",
    kind: "code",
    difficulty: 2,
    prompt: "Does this compile?",
    code: `var w = Create<Widget>();

static T Create<T>() where T : new() => new T();

public class Widget
{
    public Widget(string name) { }
}`,
    options: [
      "Yes, and `w` is a `Widget` with a null name",
      "Yes, but it throws `MissingMethodException` at runtime",
      "No: `Widget` does not satisfy the `new()` constraint because it has no public parameterless constructor",
      "No: local functions cannot declare generic constraints",
    ],
    correctIndex: 2,
    explanation:
      "Declaring any constructor removes the implicit parameterless one, so `Widget` fails the `new()` constraint and the compiler reports CS0310. The constraint exists precisely to move this failure to compile time. A runtime `MissingMethodException` is what you would get from `Activator.CreateInstance` without the constraint, which is why that distractor is tempting.",
    docsUrl: `${LEARN}/dotnet/csharp/language-reference/keywords/where-generic-type-constraint`,
  },
  {
    id: "generics-3",
    concept: "generics",
    kind: "code",
    difficulty: 2,
    prompt: "Which of the marked lines compile?",
    code: `IEnumerable<string> strings = new List<string> { "a" };
IEnumerable<object> objects = strings;   // A
List<object> list = new List<string>();  // B`,
    options: ["A only", "B only", "Both A and B", "Neither"],
    correctIndex: 0,
    explanation:
      "`IEnumerable<out T>` is covariant, so an `IEnumerable<string>` converts to `IEnumerable<object>`. Variance applies only to generic interfaces and delegates, not classes, so `List<T>` is invariant and line B fails. If B were allowed, code could add an `int` to what is really a `List<string>`.",
    docsUrl: `${LEARN}/dotnet/standard/generics/covariance-and-contravariance`,
  },
  {
    id: "generics-4",
    concept: "generics",
    kind: "concept",
    difficulty: 3,
    prompt: "What does the `where T : unmanaged` constraint guarantee?",
    options: [
      "`T` is any struct",
      "`T` is a non-nullable value type that contains no reference-type fields at any level of nesting",
      "Instances of `T` are allocated on the native heap instead of the GC heap",
      "`T` implements `IDisposable` so native resources can be released",
    ],
    correctIndex: 1,
    explanation:
      "An unmanaged type is a value type whose fields, recursively, are also unmanaged, such as primitives, enums, pointers, and structs of those. That lets generic code use `sizeof(T)`, pointers, and `stackalloc`. The tempting answer \"any struct\" is wrong because a struct with a `string` field is a value type but not an unmanaged one.",
    docsUrl: `${LEARN}/dotnet/csharp/programming-guide/generics/constraints-on-type-parameters`,
  },
  {
    id: "generics-5",
    concept: "generics",
    kind: "scenario",
    difficulty: 2,
    prompt:
      "You write `void Index<T>(T key)` that stores `key` in a `Dictionary<T, int>`. It should accept both `int` and `string`, and callers passing a nullable type should get a compiler warning. Which constraint should you use?",
    options: ["`where T : class`", "`where T : struct`", "`where T : notnull`", "`where T : new()`"],
    correctIndex: 2,
    explanation:
      "`notnull` permits both non-nullable value types and non-nullable reference types, and in a nullable-enabled context it warns when a nullable type argument is used; `Dictionary<TKey, TValue>` itself declares `TKey : notnull`. `class` is the tempting choice for \"no nulls\", but it would reject `int`.",
    docsUrl: `${LEARN}/dotnet/csharp/language-reference/keywords/where-generic-type-constraint`,
  },

  // ───────────────────────────── 4. Class vs struct ─────────────────────────────
  {
    id: "class-struct-1",
    concept: "class-struct",
    kind: "code",
    difficulty: 1,
    prompt: "What does this print?",
    code: `var a = new Money { Amount = 10 };
var b = a;
b.Amount = 20;
Console.WriteLine(a.Amount);

public struct Money
{
    public decimal Amount { get; set; }
}`,
    options: ["10", "20", "0", "It does not compile, because struct properties cannot have setters"],
    correctIndex: 0,
    explanation:
      "Assigning a struct copies the whole value, so `b` is an independent copy and changing it leaves `a` unchanged. 20 is what you would get if `Money` were a class, where `a` and `b` would reference the same object. Mutable structs are legal but error-prone for exactly this reason.",
    docsUrl: `${LEARN}/dotnet/csharp/language-reference/builtin-types/struct`,
  },
  {
    id: "class-struct-2",
    concept: "class-struct",
    kind: "code",
    difficulty: 3,
    prompt: "What happens with this code?",
    code: `var points = new List<Point> { new Point { X = 1 } };
points[0].X = 5;

public struct Point
{
    public int X;
}`,
    options: [
      "It compiles and `points[0].X` becomes 5",
      "It compiles, but only a temporary copy is modified, so `points[0].X` stays 1",
      "It does not compile: the indexer returns a copy, which is not a variable that can be modified (CS1612)",
      "It throws `InvalidOperationException` because the list is modified",
    ],
    correctIndex: 2,
    explanation:
      "`List<T>`'s indexer returns the struct by value, and the compiler refuses to modify a field of that temporary copy because the change would be silently lost. The \"modifies a copy\" option describes the bug the compiler is preventing, which makes it tempting. Arrays behave differently: `array[0].X = 5` works because array elements are variables.",
  },
  {
    id: "class-struct-3",
    concept: "class-struct",
    kind: "concept",
    difficulty: 2,
    prompt: "Which statement about where struct values are stored is most accurate?",
    options: [
      "Structs always live on the stack",
      "Structs live on the stack unless they are larger than 16 bytes",
      "A struct is stored wherever its containing variable is stored: locals often go on the stack or in registers, but struct fields of a class and array elements live on the heap inside that object",
      "Structs live on the heap like classes but are copied on assignment",
    ],
    correctIndex: 2,
    explanation:
      "Value types are stored inline in whatever contains them, so the defining difference is copy semantics, not stack allocation. A `Point` field inside a class instance is on the heap with that object, and locals captured by lambdas or used across `await` are hoisted into heap objects. The 16-byte figure is a design guideline for choosing structs, not an allocation rule.",
  },
  {
    id: "class-struct-4",
    concept: "class-struct",
    kind: "concept",
    difficulty: 2,
    prompt: "Which of these is NOT one of Microsoft's guidelines for choosing a struct over a class?",
    options: [
      "It logically represents a single value, similar to primitive types",
      "It has an instance size under 16 bytes",
      "It contains only primitive-type fields",
      "It is immutable and will not have to be boxed frequently",
    ],
    correctIndex: 2,
    explanation:
      "Microsoft's guidance says to consider a struct when the type represents a single value, is under 16 bytes, is immutable, and will not be boxed frequently. Nothing requires the fields to be primitives; a struct may contain other structs or even references. The 16-byte item is genuinely on the list even though many people remember it as folklore.",
    docsUrl: `${LEARN}/dotnet/standard/design-guidelines/choosing-between-class-and-struct`,
  },
  {
    id: "class-struct-5",
    concept: "class-struct",
    kind: "scenario",
    difficulty: 2,
    prompt:
      "You need an immutable API response type with about ten properties (strings and lists), value-based equality, and nondestructive updates via `with`. Which type should you use?",
    options: ["`record` (a record class)", "`readonly record struct`", "`ref struct`", "A mutable `struct` with public fields"],
    correctIndex: 0,
    explanation:
      "A record class provides value equality, `with` expressions, and immutability via positional `init` properties while keeping cheap reference copies. A `readonly record struct` is tempting because it is also immutable with value equality, but at roughly ten fields it is well past the 16-byte guideline and every assignment copies the whole thing. A `ref struct` cannot be boxed, stored in a class field, or serialized as a normal object.",
    docsUrl: `${LEARN}/dotnet/csharp/language-reference/builtin-types/record`,
  },

  // ───────────────────────────── 5. Boxing ─────────────────────────────
  {
    id: "boxing-1",
    concept: "boxing",
    kind: "code",
    difficulty: 1,
    prompt: "Which line boxes?",
    code: `int n = 42;
object o = n;              // A
long l = n;                // B
string s = n.ToString();   // C
int m = (int)o;            // D`,
    options: ["Line A", "Line B", "Line C", "Line D"],
    correctIndex: 0,
    explanation:
      "Assigning a value type to `object` allocates a box on the heap and copies the value into it. Line C is tempting, but `Int32` overrides `ToString`, so the call is made directly on the value without boxing. Line B is a numeric widening conversion, and line D unboxes rather than boxes.",
    docsUrl: `${LEARN}/dotnet/csharp/programming-guide/types/boxing-and-unboxing`,
  },
  {
    id: "boxing-2",
    concept: "boxing",
    kind: "code",
    difficulty: 2,
    prompt: "What happens when this runs?",
    code: `object o = 42;
long l = (long)o;
Console.WriteLine(l);`,
    options: ["Prints 42", "It does not compile", "Throws `InvalidCastException`", "Throws `OverflowException`"],
    correctIndex: 2,
    explanation:
      "Unboxing must target the exact boxed type: the box holds an `int`, so `(long)o` fails at runtime with `InvalidCastException`. It compiles because a cast from `object` to `long` is a legal unboxing conversion in general. The fix is to unbox first and then widen: `(long)(int)o`.",
    docsUrl: `${LEARN}/dotnet/csharp/programming-guide/types/boxing-and-unboxing`,
  },
  {
    id: "boxing-3",
    concept: "boxing",
    kind: "code",
    difficulty: 3,
    prompt: "What does this print?",
    code: `var counter = new Counter();
IIncrement boxed = counter;
boxed.Increment();
Console.WriteLine(counter.Value);

interface IIncrement { void Increment(); }

struct Counter : IIncrement
{
    public int Value;
    public void Increment() => Value++;
}`,
    options: ["0", "1", "It does not compile, because structs cannot implement interfaces", "Throws `NullReferenceException`"],
    correctIndex: 0,
    explanation:
      "Converting a struct to an interface type boxes it, which copies the value into a new heap object. `Increment` mutates the copy inside the box, while the local `counter` is untouched and still has `Value == 0`. Answering 1 assumes the interface reference points at the original variable, which is how a class would behave.",
  },
  {
    id: "boxing-4",
    concept: "boxing",
    kind: "concept",
    difficulty: 2,
    prompt: "On a 64-bit .NET runtime, how much heap memory does a single boxed `int` occupy?",
    options: ["4 bytes", "8 bytes", "16 bytes", "24 bytes"],
    correctIndex: 3,
    explanation:
      "Every heap object carries an 8-byte object header and an 8-byte method-table pointer, and the 4-byte payload is padded to 8 bytes, for 24 bytes in total. Answering 4 bytes confuses the value with the box, and that overhead plus the GC work it causes is why boxing in hot paths shows up in profiles.",
  },
  {
    id: "boxing-5",
    concept: "boxing",
    kind: "scenario",
    difficulty: 2,
    prompt:
      "A metrics hot path stores counters and gauges in a `Dictionary<string, object>` with `int` and `double` values. Profiling shows heavy Gen0 garbage collection. Which change addresses the root cause?",
    options: [
      "Call `GC.Collect()` after each batch so the boxes are freed sooner",
      "Replace the dictionary with a `Hashtable`",
      "Store values in strongly typed collections (for example `Dictionary<string, long>` and `Dictionary<string, double>`) so no boxing occurs",
      "Convert the numbers to strings before storing them",
    ],
    correctIndex: 2,
    explanation:
      "Each `int` or `double` written into an `object`-typed slot is boxed, so every update allocates. Strongly typed generic storage keeps the values unboxed and removes the allocations. `Hashtable` is the tempting fix because it is a different collection, but it stores `object` keys and values and boxes just as much; forcing `GC.Collect()` adds cost without removing the allocations.",
  },

  // ───────────────────────────── 6. The is keyword ─────────────────────────────
  {
    id: "is-patterns-1",
    concept: "is-patterns",
    kind: "concept",
    difficulty: 1,
    prompt: "Which C# version introduced list patterns such as `values is [1, .., 9]`?",
    options: ["C# 8", "C# 9", "C# 10", "C# 11"],
    correctIndex: 3,
    explanation:
      "List patterns, including the slice pattern `..`, arrived in C# 11. The timeline is: declaration/type patterns with `is` in C# 7, property patterns and switch expressions in C# 8, and relational (`>`, `<=`) and logical (`and`, `or`, `not`) patterns in C# 9. C# 9 is the tempting answer because it added several pattern kinds at once, but not list patterns.",
    docsUrl: `${LEARN}/dotnet/csharp/language-reference/operators/patterns`,
  },
  {
    id: "is-patterns-2",
    concept: "is-patterns",
    kind: "code",
    difficulty: 2,
    prompt: "What does this print?",
    code: `object value = 15;

if (value is int n and > 10 and < 20)
    Console.WriteLine(n * 2);
else
    Console.WriteLine("no match");`,
    options: [
      "30",
      "no match",
      "15",
      "It does not compile, because a declaration pattern cannot be combined with relational patterns",
    ],
    correctIndex: 0,
    explanation:
      "Since C# 9, a declaration pattern can be combined with relational patterns using `and`, and `n` is definitely assigned when the whole pattern matches. 15 is an `int` in the range 10–20, so the code prints 30. The compile-error option reflects C# 7/8 habits, where you had to write `value is int n && n > 10`.",
    docsUrl: `${LEARN}/dotnet/csharp/language-reference/operators/patterns`,
  },
  {
    id: "is-patterns-3",
    concept: "is-patterns",
    kind: "code",
    difficulty: 3,
    prompt: "What does this print?",
    code: `var t = new Token();
Console.WriteLine(t == null);
Console.WriteLine(t is null);

class Token
{
    public static bool operator ==(Token? a, Token? b) => true;
    public static bool operator !=(Token? a, Token? b) => false;
}`,
    options: ["True, then False", "False, then False", "True, then True", "False, then True"],
    correctIndex: 0,
    explanation:
      "`==` calls the user-defined operator, which here always returns true. `is null` is a constant pattern that the compiler emits as a plain reference check and never calls an overloaded operator, so it correctly reports False. That is why `is null` is the recommended null check in code that may encounter custom equality operators.",
    docsUrl: `${LEARN}/dotnet/csharp/language-reference/operators/is`,
  },
  {
    id: "is-patterns-4",
    concept: "is-patterns",
    kind: "code",
    difficulty: 2,
    prompt: "What is the value of `freeShipping`?",
    code: `var order = new Order(Total: 250m, Customer: new Customer(IsVip: true));
bool freeShipping = order is { Total: >= 100m, Customer.IsVip: true };

record Customer(bool IsVip);
record Order(decimal Total, Customer Customer);`,
    options: [
      "true",
      "false",
      "It does not compile: nested members must be written as `Customer: { IsVip: true }`",
      "It does not compile: relational patterns cannot be used inside property patterns",
    ],
    correctIndex: 0,
    explanation:
      "Property patterns can contain any nested pattern, including relational ones such as `>= 100m`, and the extended form `Customer.IsVip` is shorthand for `Customer: { IsVip: true }`. Both conditions hold, so the result is true. The nested-braces form still works, which makes the first compile-error option tempting, but it is no longer required.",
    docsUrl: `${LEARN}/dotnet/csharp/language-reference/operators/patterns`,
  },
  {
    id: "is-patterns-5",
    concept: "is-patterns",
    kind: "scenario",
    difficulty: 3,
    prompt:
      "A teammate writes `if (shape is not Circle or Square)` intending to skip both circles and squares. Which condition expresses that intent?",
    options: [
      "`shape is not Circle or Square` (it is already correct)",
      "`shape is not (Circle or Square)`",
      "`shape is not Circle or not Square`",
      "`shape is not Circle and Square`",
    ],
    correctIndex: 1,
    explanation:
      "`not` binds tighter than `or`, so the original parses as `(not Circle) or Square`, which is true for squares and lets them through. Parentheses apply `not` to the whole disjunction: `is not (Circle or Square)`. `is not Circle or not Square` looks like De Morgan's law applied, but it is true for every value because no shape is both a circle and a square.",
    docsUrl: `${LEARN}/dotnet/csharp/language-reference/operators/patterns`,
  },

  // ───────────────────────────── 7. Func / Action / Predicate ─────────────────────────────
  {
    id: "delegates-1",
    concept: "delegates",
    kind: "concept",
    difficulty: 1,
    prompt: "In `Func<int, string, bool>`, what is the return type?",
    options: ["`int`", "`string`", "`bool`", "`void`"],
    correctIndex: 2,
    explanation:
      "For `Func<...>`, the last type argument is always the return type and the preceding ones are parameters, so this delegate takes an `int` and a `string` and returns a `bool`. `int` is the tempting answer for people who read the first type argument as the result. For a delegate that returns nothing, you use `Action<...>` instead.",
    docsUrl: `${LEARN}/dotnet/api/system.func-3`,
  },
  {
    id: "delegates-2",
    concept: "delegates",
    kind: "code",
    difficulty: 2,
    prompt: "Does this compile?",
    code: `Func<int, int> square = x => x * x;
Action<int> print = x => Console.WriteLine(x);
Predicate<int> isEven = x => x % 2 == 0;
Func<int, bool> isEven2 = isEven;`,
    options: [
      "Yes: `Predicate<int>` and `Func<int, bool>` have the same signature, so they convert implicitly",
      "No: the last line fails because `Predicate<int>` and `Func<int, bool>` are distinct delegate types",
      "No: `Action<int>` cannot wrap `Console.WriteLine`, because `WriteLine` has overloads",
      "No: lambdas assigned to delegates need explicit parameter types",
    ],
    correctIndex: 1,
    explanation:
      "Delegate types are nominal: two delegate types with identical signatures are still different types, and there is no implicit conversion between them. You can bridge them with a method group, such as `Func<int, bool> f = isEven.Invoke;`. The identical-signature reasoning is the tempting mistake because a lambda would be accepted by either type.",
  },
  {
    id: "delegates-3",
    concept: "delegates",
    kind: "code",
    difficulty: 3,
    prompt: "In EF Core, what happens when this query runs?",
    code: `Func<Order, bool> isLarge = o => o.Total > 1000;
var large = db.Orders.Where(isLarge).ToList();`,
    options: [
      "EF Core translates the filter into a SQL `WHERE Total > 1000`",
      "EF Core throws because the predicate cannot be translated",
      "It binds to `Enumerable.Where`, so every `Order` row is loaded and filtered in memory",
      "It does not compile, because `DbSet<Order>.Where` requires an expression",
    ],
    correctIndex: 2,
    explanation:
      "`Queryable.Where` takes an `Expression<Func<Order, bool>>`, and a `Func` variable cannot be converted to an expression tree. Overload resolution therefore falls back to `Enumerable.Where`, because `DbSet<T>` is also an `IEnumerable<T>`, and the whole table is streamed to the client. No exception is thrown, which is what makes this bug dangerous; declare the predicate as `Expression<Func<Order, bool>>` to get SQL translation.",
    docsUrl: `${LEARN}/ef/core/querying/client-eval`,
  },
  {
    id: "delegates-4",
    concept: "delegates",
    kind: "concept",
    difficulty: 1,
    prompt: "What are `Func`, `Action`, and `Predicate` in C#?",
    options: [
      "Contextual keywords that the compiler treats specially",
      "Generic delegate types declared in the `System` namespace",
      "Interfaces that lambdas implement",
      "Built-in types that cannot be replaced by user-declared delegates",
    ],
    correctIndex: 1,
    explanation:
      "They are ordinary generic delegate types in the BCL, for example `public delegate TResult Func<in T, out TResult>(T arg);`. You can declare your own delegate with the same shape. They look like keywords because they appear so often, but lambdas convert to any compatible delegate type, not only to these.",
    docsUrl: `${LEARN}/dotnet/csharp/language-reference/operators/lambda-expressions`,
  },
  {
    id: "delegates-5",
    concept: "delegates",
    kind: "scenario",
    difficulty: 2,
    prompt:
      "A repository method accepts a caller-supplied filter that must be translated to SQL by EF Core. What should the parameter type be?",
    options: ["`Func<T, bool>`", "`Predicate<T>`", "`Expression<Func<T, bool>>`", "`Action<T>`"],
    correctIndex: 2,
    explanation:
      "`Expression<Func<T, bool>>` keeps the lambda as an expression tree that the EF Core provider can inspect and translate to SQL. `Func<T, bool>` is the tempting choice because the lambda syntax at the call site is identical, but it compiles to opaque IL and forces in-memory filtering. `Predicate<T>` has the same problem, and `Action<T>` does not return a value at all.",
    docsUrl: `${LEARN}/ef/core/querying/client-eval`,
  },

  // ───────────────────────────── 8. Static vs singleton ─────────────────────────────
  {
    id: "static-singleton-1",
    concept: "static-singleton",
    kind: "code",
    difficulty: 1,
    prompt: "Does this compile?",
    code: `public interface IClock
{
    DateTime Now { get; }
}

public static class SystemClock : IClock
{
    public static DateTime Now => DateTime.Now;
}`,
    options: [
      "Yes, and `SystemClock` can be registered as `IClock` in DI",
      "Yes, but `IClock` cannot be resolved because static classes have no constructor",
      "No: static classes cannot implement interfaces",
      "No: `Now` must be declared `static override`",
    ],
    correctIndex: 2,
    explanation:
      "A static class cannot be instantiated, so it cannot implement an interface (CS0714) or be injected as a dependency. That is the main practical difference from a DI singleton, which is an ordinary instance the container creates once. The usual fix is a normal class implementing `IClock` registered with `AddSingleton`, or the built-in `TimeProvider`.",
    docsUrl: `${LEARN}/dotnet/csharp/programming-guide/classes-and-structs/static-classes-and-static-class-members`,
  },
  {
    id: "static-singleton-2",
    concept: "static-singleton",
    kind: "code",
    difficulty: 3,
    prompt: "What happens when this ASP.NET Core app starts in the Development environment?",
    code: `var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("Default");
builder.Services.AddDbContext<AppDbContext>(o => o.UseSqlServer(connectionString));
builder.Services.AddSingleton<ReportCache>();
var app = builder.Build();
app.Run();

public class ReportCache(AppDbContext db)
{
    public int CountOrders() => db.Orders.Count();
}`,
    options: [
      "It works: `ReportCache` receives a fresh `AppDbContext` for each request",
      "It fails with a scope-validation error, because a singleton cannot consume the scoped `AppDbContext`",
      "It works, but every request after the first throws `ObjectDisposedException`",
      "It does not compile, because primary constructors cannot receive injected services",
    ],
    correctIndex: 1,
    explanation:
      "`AddDbContext` registers the context as scoped, and a singleton that captures a scoped service keeps that one instance for the app's lifetime (a captive dependency). In Development, the default host enables scope validation, so the container throws instead of silently creating the captive dependency. The \"fresh context per request\" option is the misconception the validation exists to catch: a singleton's constructor runs only once.",
    docsUrl: `${LEARN}/dotnet/core/extensions/dependency-injection-guidelines`,
  },
  {
    id: "static-singleton-3",
    concept: "static-singleton",
    kind: "concept",
    difficulty: 2,
    prompt: "Why is the classic GoF singleton (private constructor plus a static `Instance` property) discouraged in modern .NET applications?",
    options: [
      "It cannot be made thread-safe in .NET",
      "It hides a global dependency that callers cannot substitute, which hurts testability; a DI-registered singleton gives one instance without that coupling",
      "The CLR may create one instance per thread for static fields",
      "Static property access is slower than constructor injection",
    ],
    correctIndex: 1,
    explanation:
      "Code that calls `Foo.Instance` is hard-wired to that concrete type, so tests cannot swap it out and the dependency does not appear in any constructor. `services.AddSingleton<IFoo, Foo>()` provides the same single instance through an injectable abstraction. Thread safety is the tempting answer, but a `static readonly` field or `Lazy<T>` gives thread-safe initialization easily.",
  },
  {
    id: "static-singleton-4",
    concept: "static-singleton",
    kind: "concept",
    difficulty: 2,
    prompt: "A service registered with `AddSingleton` has a private `Dictionary<string, int>` that every request updates. Which statement is true?",
    options: [
      "It is safe, because the DI container serializes calls to singleton services",
      "It is safe, because each request receives its own copy of a singleton's fields",
      "It is unsafe: concurrent requests share the instance, and `Dictionary` is not thread-safe for concurrent writes, so use `ConcurrentDictionary` or locking",
      "It is unsafe only in Debug builds",
    ],
    correctIndex: 2,
    explanation:
      "A singleton is one shared object used by all concurrent requests, and the container does no synchronization. Concurrent writes to a `Dictionary` can corrupt its internal state, so shared mutable state needs `ConcurrentDictionary`, `lock`, or an immutable design. Assuming the container serializes access is the tempting but false belief.",
    docsUrl: `${LEARN}/dotnet/core/extensions/dependency-injection-guidelines`,
  },
  {
    id: "static-singleton-5",
    concept: "static-singleton",
    kind: "scenario",
    difficulty: 2,
    prompt:
      "You need `Slugify(string title)`: a pure function with no state, no I/O, and no dependencies. Which approach adds the least ceremony without hurting testability?",
    options: [
      "A static method on a static class",
      "An `ISlugifier` interface registered with `AddSingleton`, injected wherever it is needed",
      "An `ISlugifier` registered with `AddScoped`",
      "A classic GoF singleton with a static `Instance` property",
    ],
    correctIndex: 0,
    explanation:
      "A deterministic function with no dependencies can be unit-tested directly, and callers never need to substitute it, so a static method is appropriate. The injected-interface option is tempting because it looks more testable, but it only adds indirection when there is nothing to fake. Static becomes a problem when the code touches time, I/O, configuration, or other state you need to control in tests.",
  },

  // ───────────────────────────── 9. Shims ─────────────────────────────
  {
    id: "shims-1",
    concept: "shims",
    kind: "concept",
    difficulty: 1,
    prompt: "In general software terms, what is a shim?",
    options: [
      "A thin layer that intercepts or supplies calls so that code works against an API that is different from, or missing in, the environment it runs in",
      "A test double that records calls so a test can verify interactions",
      "The GoF structural pattern that converts one interface into another that clients expect",
      "A compiler intrinsic that inlines small methods",
    ],
    correctIndex: 0,
    explanation:
      "A shim sits between code and an API to provide compatibility: it fills in missing functionality, redirects calls, or smooths over version differences. The Adapter option is tempting because adapters are often called shims informally, but Adapter is a specific design pattern that wraps one object to present a different interface. The record-and-verify option describes a mock.",
  },
  {
    id: "shims-2",
    concept: "shims",
    kind: "concept",
    difficulty: 1,
    prompt: "What do you need to use Microsoft Fakes shims in your unit tests?",
    options: [
      "Visual Studio Enterprise",
      "Any Visual Studio edition with MSTest installed",
      "Only the Microsoft.Fakes NuGet package, in any IDE",
      ".NET 8 or later, where shims are built into the runtime",
    ],
    correctIndex: 0,
    explanation:
      "Microsoft Fakes is a Visual Studio Enterprise feature, which limits it to teams with that license. It is often assumed to be part of MSTest because the samples use MSTest, but the test framework is not the gating factor. That licensing constraint is one reason designs built on injectable abstractions such as `TimeProvider` are preferred.",
    docsUrl: `${LEARN}/visualstudio/test/isolating-code-under-test-with-microsoft-fakes`,
  },
  {
    id: "shims-3",
    concept: "shims",
    kind: "code",
    difficulty: 2,
    prompt: "In this Microsoft Fakes test, what is the role of `ShimsContext.Create()`?",
    code: `[TestMethod]
public void Y2KCheck_ReturnsTrue_OnJan1_2000()
{
    using (ShimsContext.Create())
    {
        System.Fakes.ShimDateTime.NowGet = () => new DateTime(2000, 1, 1);
        Assert.AreEqual(2000, DateTime.Now.Year);
    }
}`,
    options: [
      "It creates a mock object that must be injected into the class under test",
      "It scopes the shim: detours registered inside it are active only until the context is disposed",
      "It generates the Fakes assembly at runtime",
      "It makes `DateTime.Now` virtual so it can be overridden",
    ],
    correctIndex: 1,
    explanation:
      "Shims rewrite calls to the real method at runtime, so they need an explicit lifetime: `ShimsContext.Create()` opens it, and disposing the context removes every detour so other tests see the real `DateTime.Now`. Nothing is injected, which is the point of shims and also why they work on static and non-virtual members. The Fakes assembly is generated at build time from a `.fakes` file, not by this call.",
    docsUrl: `${LEARN}/visualstudio/test/isolating-code-under-test-with-microsoft-fakes`,
  },
  {
    id: "shims-4",
    concept: "shims",
    kind: "code",
    difficulty: 2,
    prompt: "This test uses `FakeTimeProvider` from Microsoft.Extensions.TimeProvider.Testing. What does it print?",
    code: `var fake = new FakeTimeProvider(new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero));
var service = new TokenService(fake);
var expiresAt = fake.GetUtcNow().AddMinutes(30);

fake.Advance(TimeSpan.FromMinutes(31));
Console.WriteLine(service.IsExpired(expiresAt));

public class TokenService(TimeProvider time)
{
    public bool IsExpired(DateTimeOffset expiresAt) => time.GetUtcNow() >= expiresAt;
}`,
    options: [
      "True",
      "False, because a fake clock never moves",
      "It does not compile, because `TimeProvider` is abstract and cannot be a parameter type",
      "It throws, because `FakeTimeProvider` requires a local-time offset",
    ],
    correctIndex: 0,
    explanation:
      "`TimeProvider` (built into .NET 8 and later) is an abstract class you inject; `FakeTimeProvider` lets a test set and advance time explicitly. After `Advance(31 minutes)`, the current time is past the 30-minute expiry, so the method returns True. Abstract classes are valid parameter types, and this injectable design replaces the need to shim `DateTime.Now`.",
    docsUrl: `${LEARN}/dotnet/api/system.timeprovider`,
  },
  {
    id: "shims-5",
    concept: "shims",
    kind: "scenario",
    difficulty: 2,
    prompt:
      "Your `netstandard2.0` library needs `IAsyncEnumerable<T>`, so you reference the Microsoft.Bcl.AsyncInterfaces package. Which term best describes that package?",
    options: [
      "An adapter that converts `IEnumerable<T>` into `IAsyncEnumerable<T>`",
      "A polyfill (compatibility shim) that supplies newer BCL types to older target frameworks",
      "A Microsoft Fakes shim that detours calls to async methods",
      "A wrapper that adds logging around `System.Threading.Tasks`",
    ],
    correctIndex: 1,
    explanation:
      "The Microsoft.Bcl.* packages backport types introduced in newer .NET versions so that libraries targeting older frameworks can use them; that is a polyfill, also called a compatibility shim. The adapter option is tempting because both deal with interfaces, but the package does not convert one interface into another; it supplies the interface definitions themselves.",
  },

  // ───────────────────────────── 10. Extension methods ─────────────────────────────
  {
    id: "extension-methods-1",
    concept: "extension-methods",
    kind: "code",
    difficulty: 2,
    prompt: "Does this compile?",
    code: `public static class StringExtensions<T>
{
    public static bool IsBlank(this string s) => string.IsNullOrWhiteSpace(s);
}`,
    options: [
      "Yes",
      "No: extension methods must be declared in a non-generic static class",
      "No: the `this` parameter must be generic when the class is generic",
      "No: extension methods cannot target `string`, because it is sealed",
    ],
    correctIndex: 1,
    explanation:
      "Classic extension methods must live in a top-level, non-nested, non-generic static class (CS1106). The method itself may be generic, for example `IsBlank<T>(this T value)`, which is why the generic-class version is a tempting mistake. Sealed types such as `string` are a common target for extensions, since you cannot subclass them.",
    docsUrl: `${LEARN}/dotnet/csharp/programming-guide/classes-and-structs/extension-methods`,
  },
  {
    id: "extension-methods-2",
    concept: "extension-methods",
    kind: "code",
    difficulty: 2,
    prompt: "What does this print?",
    code: `string? name = null;
Console.WriteLine(name.IsBlank());

public static class StringExtensions
{
    public static bool IsBlank(this string? s) => string.IsNullOrWhiteSpace(s);
}`,
    options: ["True", "False", "Throws `NullReferenceException`", "It does not compile, because you cannot call a method on a null variable"],
    correctIndex: 0,
    explanation:
      "An extension call is compiled to a static call, `StringExtensions.IsBlank(name)`, so a null receiver is simply passed as the argument and no instance dereference happens. The `NullReferenceException` option is tempting because the syntax looks like an instance call. This behavior is useful for helpers like `IsBlank`, but surprising elsewhere, so extensions that cannot handle null should validate it.",
    docsUrl: `${LEARN}/dotnet/csharp/programming-guide/classes-and-structs/extension-methods`,
  },
  {
    id: "extension-methods-3",
    concept: "extension-methods",
    kind: "code",
    difficulty: 1,
    prompt: "What does this print?",
    code: `var g = new Greeter();
Console.WriteLine(g.Hello());

public class Greeter
{
    public string Hello() => "instance";
}

public static class GreeterExtensions
{
    public static string Hello(this Greeter g) => "extension";
}`,
    options: ["instance", "extension", "It does not compile, because the call is ambiguous", "It prints both strings"],
    correctIndex: 0,
    explanation:
      "The compiler considers extension methods only when no applicable instance method is found, so an instance method with a matching signature always wins. This is not an ambiguity error; the extension is simply never chosen. It also means a library adding an instance method can silently take over calls that used to go to your extension.",
    docsUrl: `${LEARN}/dotnet/csharp/programming-guide/classes-and-structs/extension-methods`,
  },
  {
    id: "extension-methods-4",
    concept: "extension-methods",
    kind: "code",
    difficulty: 3,
    prompt: "What does this print?",
    code: `Animal a = new Dog();
Console.WriteLine(a.Speak());

public class Animal { }
public class Dog : Animal { }

public static class AnimalExtensions
{
    public static string Speak(this Animal a) => "...";
    public static string Speak(this Dog d) => "Woof";
}`,
    options: ["...", "Woof", "It does not compile, because the overloads are ambiguous", "Throws `InvalidCastException`"],
    correctIndex: 0,
    explanation:
      "Extension methods are bound at compile time using the static type of the receiver, and `a` is declared as `Animal`, so `Speak(this Animal)` is chosen. There is no virtual dispatch, so the runtime type `Dog` is irrelevant. \"Woof\" is what you would get from a virtual instance method overridden in `Dog`.",
  },
  {
    id: "extension-methods-5",
    concept: "extension-methods",
    kind: "scenario",
    difficulty: 3,
    prompt:
      "Using C# 14, you want every `IEnumerable<T>` to expose an `IsEmpty` property (not a method). Which approach works?",
    options: [
      "A classic extension method with `this IEnumerable<T> source`, marked with `[Property]`",
      "An `extension<T>(IEnumerable<T> source) { public bool IsEmpty => !source.Any(); }` block inside a static class",
      "A partial declaration of `IEnumerable<T>` that adds the property",
      "A default interface member added to `IEnumerable<T>` from your assembly",
    ],
    correctIndex: 1,
    explanation:
      "C# 14 (.NET 10) introduced extension blocks, which can declare extension properties and static extension members as well as methods. Classic `this`-parameter syntax can only declare methods, and there is no attribute that turns one into a property. Partial declarations and default interface members both require editing the original type, which you cannot do for a BCL interface.",
    docsUrl: `${LEARN}/dotnet/csharp/whats-new/csharp-14`,
  },

  // ───────────────────────────── 11. BCL ─────────────────────────────
  {
    id: "bcl-1",
    concept: "bcl",
    kind: "concept",
    difficulty: 1,
    prompt: "Which statement correctly distinguishes the BCL, the runtime, and the SDK?",
    options: [
      "The BCL and the FCL are two names for the same set of libraries",
      "CoreCLR is the runtime (JIT, GC, type system); the BCL is the foundational class library (`System.*` collections, I/O, threading); the SDK adds the compilers and the `dotnet` CLI used to build apps",
      "The SDK must be installed on production servers to run a framework-dependent app",
      "The BCL is compiled to native code by the SDK at install time, so no runtime is needed",
    ],
    correctIndex: 1,
    explanation:
      "The runtime executes code, the BCL provides the core types every app uses, and the SDK is build tooling. The FCL is the larger umbrella that includes the BCL plus application frameworks such as ASP.NET, WinForms, and WPF, so treating BCL and FCL as synonyms is the tempting but inaccurate answer. Production machines need only the runtime, or nothing at all for self-contained apps.",
    docsUrl: `${LEARN}/dotnet/standard/framework-libraries`,
  },
  {
    id: "bcl-2",
    concept: "bcl",
    kind: "concept",
    difficulty: 2,
    prompt: "What is `System.Private.CoreLib`?",
    options: [
      "A NuGet package that netstandard libraries reference to get `System` types",
      "The assembly that contains the most fundamental types (`Object`, `String`, `Int32`, …), tightly coupled to the runtime; it plays the role `mscorlib` played in .NET Framework",
      "A private assembly used only by the C# compiler at build time",
      "A reference assembly that exposes the public API surface of `System.Runtime`",
    ],
    correctIndex: 1,
    explanation:
      "CoreLib holds the types the runtime itself depends on and ships with the runtime; it is not referenced directly. Apps compile against reference assemblies such as `System.Runtime`, which forward types to CoreLib at runtime, so the reference-assembly option is close but backwards. The \"Private\" in the name means you should never reference it directly.",
  },
  {
    id: "bcl-3",
    concept: "bcl",
    kind: "code",
    difficulty: 2,
    prompt: "On .NET 8 or later, what does this print?",
    code: `Console.WriteLine(typeof(string).Assembly.GetName().Name);`,
    options: ["mscorlib", "System.Runtime", "System.Private.CoreLib", "netstandard"],
    correctIndex: 2,
    explanation:
      "At runtime, `string` lives in `System.Private.CoreLib`. `System.Runtime` is the tempting answer because that is the assembly your project compiles against, but it is a reference/facade assembly that forwards the type. `mscorlib` is what .NET Framework would print.",
  },
  {
    id: "bcl-4",
    concept: "bcl",
    kind: "code",
    difficulty: 2,
    prompt: "Which namespace's types are NOT part of the `Microsoft.NETCore.App` shared framework that every .NET app gets?",
    code: `using System.Text.Json;               // A
using Microsoft.AspNetCore.Mvc;        // B
using System.Collections.Concurrent;   // C
using System.Threading.Channels;       // D`,
    options: ["A", "B", "C", "D"],
    correctIndex: 1,
    explanation:
      "MVC types ship in the `Microsoft.AspNetCore.App` shared framework, which web projects reference in addition to the base framework. `System.Text.Json` and `System.Threading.Channels` are tempting because they were once separate NuGet packages, but both ship in `Microsoft.NETCore.App` in current .NET versions.",
  },
  {
    id: "bcl-5",
    concept: "bcl",
    kind: "scenario",
    difficulty: 2,
    prompt:
      "Your library targets `netstandard2.0` and you want to use `TimeProvider`, which was added to the BCL in .NET 8. What should you do?",
    options: [
      "Reference the Microsoft.Bcl.TimeProvider package",
      "Retarget the library to .NET Framework 4.8.1, which includes `TimeProvider`",
      "Reference `System.Private.CoreLib` from the .NET 8 runtime folder",
      "Wait for a netstandard 2.2 release that will include it",
    ],
    correctIndex: 0,
    explanation:
      "Microsoft publishes backport packages under the Microsoft.Bcl.* prefix so that older targets can use newer BCL types; Microsoft.Bcl.TimeProvider provides `TimeProvider` for netstandard2.0 and .NET Framework. Referencing CoreLib directly is tempting but unsupported, because it is tied to a specific runtime build. .NET Framework 4.8.1 does not include `TimeProvider`.",
  },

  // ───────────────────────────── 12. .NET design patterns ─────────────────────────────
  {
    id: "design-patterns-1",
    concept: "design-patterns",
    kind: "code",
    difficulty: 2,
    prompt: "Which implementation is injected into `AlertService`?",
    code: `builder.Services.AddKeyedSingleton<INotifier, SmsNotifier>("sms");
builder.Services.AddKeyedSingleton<INotifier, EmailNotifier>("email");
builder.Services.AddSingleton<AlertService>();

public class AlertService([FromKeyedServices("sms")] INotifier notifier)
{
    public Task AlertAsync(string text) => notifier.SendAsync(text);
}`,
    options: [
      "`SmsNotifier`",
      "`EmailNotifier`, because the last registration wins",
      "Both, because multiple registrations are injected as a collection",
      "Neither: resolution throws because two `INotifier` services are registered",
    ],
    correctIndex: 0,
    explanation:
      "Keyed services (added in .NET 8) let you register several implementations of one service type under different keys and select one with `[FromKeyedServices(key)]`. \"Last registration wins\" is the rule for unkeyed services resolved without a key, which is why `EmailNotifier` is tempting. Here the key is explicit, so `SmsNotifier` is injected.",
    docsUrl: `${LEARN}/dotnet/core/extensions/dependency-injection`,
  },
  {
    id: "design-patterns-2",
    concept: "design-patterns",
    kind: "code",
    difficulty: 2,
    prompt: "What is written to the console for a single request?",
    code: `app.Use(async (ctx, next) => { Console.Write("A"); await next(ctx); Console.Write("B"); });
app.Use(async (ctx, next) => { Console.Write("C"); await next(ctx); Console.Write("D"); });
app.Run(ctx => { Console.Write("E"); return Task.CompletedTask; });`,
    options: ["ACEDB", "ACEBD", "ABCDE", "ECADB"],
    correctIndex: 0,
    explanation:
      "Middleware is a chain of responsibility: each component runs its \"before\" code, calls `next`, and runs its \"after\" code once the rest of the pipeline returns. The request flows A → C → E, and the responses unwind in reverse, D then B. ACEBD is tempting if you picture the \"after\" code running in registration order, but unwinding is last-in, first-out.",
    docsUrl: `${LEARN}/aspnet/core/fundamentals/middleware/`,
  },
  {
    id: "design-patterns-3",
    concept: "design-patterns",
    kind: "scenario",
    difficulty: 2,
    prompt:
      "A singleton service reads `RateLimitOptions` bound from `appsettings.json` and must see changes without an app restart. Which abstraction should it inject?",
    options: ["`IOptions<RateLimitOptions>`", "`IOptionsSnapshot<RateLimitOptions>`", "`IOptionsMonitor<RateLimitOptions>`", "A static `RateLimitOptions` set once in `Program.cs`"],
    correctIndex: 2,
    explanation:
      "`IOptionsMonitor<T>` is a singleton that always returns the current value and raises `OnChange` when configuration reloads. `IOptionsSnapshot<T>` is tempting because it also reflects changes, but it is scoped (recomputed per request), so injecting it into a singleton is a captive dependency that scope validation rejects. `IOptions<T>` is computed once and never updates.",
    docsUrl: `${LEARN}/dotnet/core/extensions/options`,
  },
  {
    id: "design-patterns-4",
    concept: "design-patterns",
    kind: "concept",
    difficulty: 1,
    prompt: "What changed for MediatR and AutoMapper in 2025?",
    options: [
      "Microsoft acquired both and folded them into .NET 10",
      "Both moved to commercial licensing for new versions; previously released versions remain under their original open-source licenses",
      "Both were deprecated and archived on GitHub",
      "Both were relicensed from Apache 2.0 to MIT",
    ],
    correctIndex: 1,
    explanation:
      "In 2025 their maintainer announced, and then shipped, commercial licensing for new versions of both libraries; existing releases keep the licenses they were published under. That prompted many teams to re-evaluate them, especially since CQRS does not require a mediator and mapping can be written by hand or source-generated. Nothing was folded into .NET, and there is no built-in mediator in ASP.NET Core.",
  },
  {
    id: "design-patterns-5",
    concept: "design-patterns",
    kind: "scenario",
    difficulty: 2,
    prompt:
      "An ASP.NET Core endpoint calls an external API on every request and creates `new HttpClient()` inside a `using` block each time. Under load, it starts failing with socket errors. What should you do?",
    options: [
      "Wrap each call in a retry loop",
      "Register the client with `AddHttpClient` and obtain it from `IHttpClientFactory`, so handlers and connections are pooled and recycled",
      "Raise `ServicePointManager.DefaultConnectionLimit`",
      "Call `Dispose()` explicitly instead of relying on `using`",
    ],
    correctIndex: 1,
    explanation:
      "Disposing an `HttpClient` closes its connections, which then sit in TIME_WAIT, so creating one per call can exhaust sockets. `IHttpClientFactory` pools and periodically recycles the underlying handlers, which fixes both socket exhaustion and stale DNS, and it integrates with resilience handlers. A retry loop is tempting but adds more connections to an already exhausted pool.",
    docsUrl: `${LEARN}/dotnet/core/extensions/httpclient-factory`,
  },

  // ───────────────────────────── 13. async / await ─────────────────────────────
  {
    id: "async-await-1",
    concept: "async-await",
    kind: "code",
    difficulty: 2,
    prompt: "What does this print?",
    code: `Console.Write("1");
var task = DoWorkAsync();
Console.Write("3");
await task;
Console.Write("5");

static async Task DoWorkAsync()
{
    Console.Write("2");
    await Task.Delay(100);
    Console.Write("4");
}`,
    options: ["12345", "13245", "12435", "13524"],
    correctIndex: 0,
    explanation:
      "An async method runs synchronously on the caller's thread until it reaches an `await` on an incomplete task, so \"2\" prints before `DoWorkAsync` returns its task. The caller then prints \"3\", awaits, and the rest of `DoWorkAsync` prints \"4\" before \"5\". 13245 is tempting if you assume calling an async method starts it on another thread, which it does not.",
    docsUrl: `${LEARN}/dotnet/csharp/asynchronous-programming/`,
  },
  {
    id: "async-await-2",
    concept: "async-await",
    kind: "code",
    difficulty: 3,
    prompt: "In a console app, what happens when this runs?",
    code: `try
{
    FireAndForget();
}
catch (InvalidOperationException)
{
    Console.WriteLine("caught");
}
await Task.Delay(1000);

static async void FireAndForget()
{
    await Task.Yield();
    throw new InvalidOperationException();
}`,
    options: [
      "\"caught\" is printed",
      "The exception is silently ignored, as with an unobserved `Task`",
      "\"caught\" is never printed; the exception is raised on a thread-pool thread, where it is unhandled and terminates the process",
      "It does not compile, because `async void` is only allowed for event handlers",
    ],
    correctIndex: 2,
    explanation:
      "An `async void` method has no `Task` for the caller to observe, and `FireAndForget()` returns at its first `await`, before the exception is thrown. With no synchronization context, the exception is rethrown on the thread pool and crashes the process. \"Silently ignored\" is how an unobserved exception in an `async Task` behaves, which is why `async Task` is preferred everywhere except event handlers.",
    docsUrl: `${LEARN}/dotnet/csharp/asynchronous-programming/async-scenarios`,
  },
  {
    id: "async-await-3",
    concept: "async-await",
    kind: "concept",
    difficulty: 2,
    prompt: "What does `await SomethingAsync().ConfigureAwait(false)` change?",
    options: [
      "It runs `SomethingAsync` on a background thread",
      "The continuation after the `await` does not have to resume on the captured synchronization context, so it may run on a thread-pool thread",
      "It turns the call into fire-and-forget",
      "It prevents the awaited task from being cancelled",
    ],
    correctIndex: 1,
    explanation:
      "`ConfigureAwait(false)` affects only where the code after the `await` resumes; it tells the awaiter not to marshal back to the captured context, such as a UI thread. It does not change where `SomethingAsync` itself runs, which is the common misconception. It matters most in library code; ASP.NET Core has no synchronization context, so there it rarely changes behavior.",
  },
  {
    id: "async-await-4",
    concept: "async-await",
    kind: "concept",
    difficulty: 3,
    prompt: "Which rule applies to consuming a `ValueTask<T>`?",
    options: [
      "Always prefer it over `Task<T>`, because it never allocates",
      "Await it once; don't await it multiple times or await it concurrently. Call `.AsTask()` if you need to do either",
      "It cannot be returned from an `async` method",
      "It is a pooled reference type, so it must be disposed after use",
    ],
    correctIndex: 1,
    explanation:
      "A `ValueTask<T>` may be backed by a pooled, reusable object, so consuming it a second time can observe a different operation's result. Convert it with `.AsTask()` if you need to await it more than once or combine it. \"Always prefer it\" is tempting, but it only saves an allocation when results are often available synchronously, and it is a struct, so it is not disposed.",
  },
  {
    id: "async-await-5",
    concept: "async-await",
    kind: "scenario",
    difficulty: 1,
    prompt: "You need results from three independent HTTP calls before rendering a page. Which approach minimizes total latency?",
    options: [
      "Await each call one after another",
      "Start all three tasks, then `await Task.WhenAll(t1, t2, t3)`",
      "Call `.Result` on each task inside `Parallel.ForEach`",
      "Wrap each call in `Task.Run` and call `.Wait()` on each",
    ],
    correctIndex: 1,
    explanation:
      "Starting all three before awaiting lets the I/O overlap, so total time is close to the slowest call rather than the sum of all three. Awaiting each one in turn is correct code but serializes the waits. `.Result` and `.Wait()` block threads and risk deadlocks under a synchronization context, and `Task.Run` adds nothing for I/O-bound work.",
    docsUrl: `${LEARN}/dotnet/csharp/asynchronous-programming/async-scenarios`,
  },

  // ───────────────────────────── 14. LINQ ─────────────────────────────
  {
    id: "linq-1",
    concept: "linq",
    kind: "code",
    difficulty: 1,
    prompt: "What does this print?",
    code: `var numbers = new List<int> { 1, 2, 3 };
var query = numbers.Where(n => n > 1);
numbers.Add(4);
Console.WriteLine(query.Count());`,
    options: ["2", "3", "4", "Throws `InvalidOperationException` because the collection was modified"],
    correctIndex: 1,
    explanation:
      "`Where` uses deferred execution: it stores the source and predicate and does nothing until enumerated. By the time `Count()` enumerates, the list contains 1–4, so three elements match (2, 3, 4). 2 is what you would get if `Where` ran eagerly; the modification exception occurs only when a list changes during enumeration.",
    docsUrl: `${LEARN}/dotnet/csharp/linq/`,
  },
  {
    id: "linq-2",
    concept: "linq",
    kind: "code",
    difficulty: 2,
    prompt: "What does this print?",
    code: `int calls = 0;
var doubled = Enumerable.Range(1, 3).Select(n => { calls++; return n * 2; });

var sum = doubled.Sum();
var max = doubled.Max();
Console.WriteLine(calls);`,
    options: ["0", "3", "6", "9"],
    correctIndex: 2,
    explanation:
      "A deferred query is re-executed every time it is enumerated, so `Sum()` runs the selector three times and `Max()` runs it three more. 3 is tempting if you think the query caches its results after the first enumeration; call `.ToList()` once if you need to reuse results. Code analyzers flag this pattern as possible multiple enumeration.",
  },
  {
    id: "linq-3",
    concept: "linq",
    kind: "concept",
    difficulty: 2,
    prompt: "What is the key difference between `IEnumerable<T>` and `IQueryable<T>` LINQ operators?",
    options: [
      "`IQueryable<T>` is lazy, while `IEnumerable<T>` executes immediately",
      "`IQueryable<T>` operators build an expression tree that a provider (such as EF Core) translates, for example to SQL; `IEnumerable<T>` operators run compiled delegates in memory",
      "`IQueryable<T>` can only be used with databases, while `IEnumerable<T>` can only be used with arrays",
      "`IEnumerable<T>` operators are thread-safe, while `IQueryable<T>` operators are not",
    ],
    correctIndex: 1,
    explanation:
      "`Queryable` operators accept `Expression<Func<...>>` and compose an expression tree for the provider to interpret, while `Enumerable` operators take `Func<...>` delegates and run them in process. The laziness option is the common misconception: both are deferred, and neither runs until enumerated. This difference is why switching to `AsEnumerable()` too early moves filtering out of the database.",
  },
  {
    id: "linq-4",
    concept: "linq",
    kind: "code",
    difficulty: 2,
    prompt: "What happens when this runs?",
    code: `var items = new[] { 5, 7, 9 };
var x = items.SingleOrDefault(i => i > 6);
Console.WriteLine(x);`,
    options: ["Prints 7", "Prints 0", "Prints 9", "Throws `InvalidOperationException`"],
    correctIndex: 3,
    explanation:
      "`SingleOrDefault` returns the default value only when nothing matches; when more than one element matches (7 and 9), it throws `InvalidOperationException`. Printing 0 is tempting because \"OrDefault\" sounds like it never throws. Use `FirstOrDefault` when several matches are acceptable and you want the first.",
  },
  {
    id: "linq-5",
    concept: "linq",
    kind: "scenario",
    difficulty: 1,
    prompt: "With EF Core, you need to know whether any order for a customer exists in a large table. Which query should you use?",
    options: [
      "`db.Orders.Count(o => o.CustomerId == id) > 0`",
      "`db.Orders.Any(o => o.CustomerId == id)`",
      "`db.Orders.Where(o => o.CustomerId == id).ToList().Count > 0`",
      "`db.Orders.Where(o => o.CustomerId == id).ToArray().Length > 0`",
    ],
    correctIndex: 1,
    explanation:
      "`Any` translates to an `EXISTS` check that can stop at the first matching row. `Count() > 0` is the tempting alternative and is also translated to SQL, but it asks the database to count every match. The `ToList` and `ToArray` versions are worse still, because they pull every matching row into memory.",
  },

  // ───────────────────────────── 15. Nullable reference types ─────────────────────────────
  {
    id: "nullable-reference-types-1",
    concept: "nullable-reference-types",
    kind: "concept",
    difficulty: 1,
    prompt: "With `<Nullable>enable</Nullable>`, what happens if you assign `null` to a variable declared as `string name`?",
    options: [
      "A compile-time error",
      "A compiler warning; nothing is enforced at runtime",
      "An `ArgumentNullException` when the assignment runs",
      "Nothing, because nullable annotations only apply to method parameters",
    ],
    correctIndex: 1,
    explanation:
      "Nullable reference types are a static-analysis feature: violations produce warnings (such as CS8600 or CS8625), and the generated IL has no runtime null checks. Teams that want hard failures turn the warnings into errors with `TreatWarningsAsErrors` or `WarningsAsErrors`. The compile-error option is tempting only because many projects configure it that way.",
    docsUrl: `${LEARN}/dotnet/csharp/nullable-references`,
  },
  {
    id: "nullable-reference-types-2",
    concept: "nullable-reference-types",
    kind: "code",
    difficulty: 2,
    prompt: "What happens when this runs?",
    code: `string? input = GetInput();
int length = input!.Length;
Console.WriteLine(length);

static string? GetInput() => null;`,
    options: [
      "Throws `NullReferenceException` when `.Length` is accessed",
      "The `!` operator throws `ArgumentNullException`",
      "Prints 0",
      "It does not compile, because `!` cannot be applied to a nullable variable",
    ],
    correctIndex: 0,
    explanation:
      "The null-forgiving operator `!` only suppresses the compiler warning; it emits no code. At runtime, `input` is null and dereferencing it throws `NullReferenceException`. Treating `!` as an assertion that throws its own exception is the common misconception.",
    docsUrl: `${LEARN}/dotnet/csharp/language-reference/operators/null-forgiving`,
  },
  {
    id: "nullable-reference-types-3",
    concept: "nullable-reference-types",
    kind: "code",
    difficulty: 1,
    prompt: "What does this print?",
    code: `string? s = null;
int? len = s?.Length;
int total = len ?? -1;
Console.WriteLine(total);`,
    options: ["0", "-1", "An empty line", "Throws `NullReferenceException`"],
    correctIndex: 1,
    explanation:
      "`s?.Length` short-circuits to `null` when `s` is null, so `len` is a null `int?`, and `??` substitutes -1. 0 is tempting if you expect the default value of `int`, but the null-conditional operator lifts the result to `int?` rather than defaulting it.",
  },
  {
    id: "nullable-reference-types-4",
    concept: "nullable-reference-types",
    kind: "concept",
    difficulty: 2,
    prompt: "How do `int?` and `string?` differ at runtime?",
    options: [
      "They don't: both compile to `Nullable<T>`",
      "`int?` is a distinct type, `Nullable<int>`; `string?` is the same runtime type as `string`, plus compiler annotations",
      "`string?` compiles to a wrapper type that tracks whether a value is present",
      "`int?` is boxed on the heap, while `string?` is stored on the stack",
    ],
    correctIndex: 1,
    explanation:
      "Nullable value types are a real generic struct, `Nullable<T>`, with `HasValue` and `Value`. Nullable reference types are annotations recorded in metadata attributes; `typeof(string?)` is not even allowed, because there is no separate type. The \"both compile to `Nullable<T>`\" option is tempting because the syntax is identical, but `Nullable<T>` requires `T : struct`.",
    docsUrl: `${LEARN}/dotnet/csharp/language-reference/builtin-types/nullable-value-types`,
  },
  {
    id: "nullable-reference-types-5",
    concept: "nullable-reference-types",
    kind: "scenario",
    difficulty: 3,
    prompt:
      "Callers of `bool TryGetUser(int id, out User? user)` get nullable warnings on `user.Name` even inside `if (TryGetUser(id, out var user))`. What is the best fix?",
    options: [
      "Annotate the parameter: `[NotNullWhen(true)] out User? user`",
      "Change it to `out User user` and assign `null!` when returning false",
      "Have callers write `user!.Name`",
      "Annotate the parameter with `[MaybeNull]`",
    ],
    correctIndex: 0,
    explanation:
      "`[NotNullWhen(true)]` (from `System.Diagnostics.CodeAnalysis`) tells the compiler that `user` is non-null whenever the method returns true, so the warning disappears exactly where it should. Assigning `null!` to a non-nullable `out` silences the warning but makes the signature lie, and callers lose the warning in the false branch. `[MaybeNull]` states the opposite of what you want.",
    docsUrl: `${LEARN}/dotnet/csharp/language-reference/attributes/nullable-analysis`,
  },

  // ───────────────────────────── 16. IDisposable and using ─────────────────────────────
  {
    id: "disposal-1",
    concept: "disposal",
    kind: "code",
    difficulty: 1,
    prompt: "What does this print?",
    code: `using var a = new Resource("A");
using var b = new Resource("B");
Console.WriteLine("body");

class Resource(string name) : IDisposable
{
    public void Dispose() => Console.WriteLine($"dispose {name}");
}`,
    options: [
      "body, dispose B, dispose A",
      "body, dispose A, dispose B",
      "dispose A, dispose B, body",
      "body (Dispose runs later, when the GC collects the objects)",
    ],
    correctIndex: 0,
    explanation:
      "A `using` declaration disposes its variable at the end of the enclosing scope, and multiple declarations are disposed in reverse order, like nested `using` blocks. Reverse order matters because later resources often depend on earlier ones. A-then-B is tempting if you assume declaration order, and the GC never calls `Dispose`.",
    docsUrl: `${LEARN}/dotnet/csharp/language-reference/statements/using`,
  },
  {
    id: "disposal-2",
    concept: "disposal",
    kind: "concept",
    difficulty: 1,
    prompt: "Does the garbage collector call `Dispose()` on an `IDisposable` object that is no longer referenced?",
    options: [
      "Yes, always, before reclaiming the memory",
      "Yes, but only for objects in Gen2",
      "No: the GC may run a finalizer if the type has one, but `Dispose()` must be called by your code, typically via `using`",
      "No, and unreferenced disposable objects are never collected",
    ],
    correctIndex: 2,
    explanation:
      "The GC knows nothing about `IDisposable`; it reclaims memory and, for types that declare a finalizer, eventually runs that finalizer on the finalizer thread. Deterministic cleanup happens only when code calls `Dispose`, usually via `using`. The \"always\" answer is a common belief, and it leads to leaked connections and file handles.",
    docsUrl: `${LEARN}/dotnet/standard/garbage-collection/implementing-dispose`,
  },
  {
    id: "disposal-3",
    concept: "disposal",
    kind: "code",
    difficulty: 2,
    prompt: "What does this print?",
    code: `try
{
    using var r = new Resource("R");
    throw new InvalidOperationException("boom");
}
catch (InvalidOperationException)
{
    Console.WriteLine("caught");
}

class Resource(string name) : IDisposable
{
    public void Dispose() => Console.WriteLine($"dispose {name}");
}`,
    options: ["dispose R, caught", "caught, dispose R", "caught", "dispose R"],
    correctIndex: 0,
    explanation:
      "`using` compiles to a `try/finally` inside the `try` block, so `Dispose` runs as the exception leaves that scope, before the outer `catch` executes. \"caught, dispose R\" is tempting if you picture disposal at the end of the whole statement, and \"caught\" alone assumes an exception skips cleanup, which is exactly what `using` prevents.",
    docsUrl: `${LEARN}/dotnet/csharp/language-reference/statements/using`,
  },
  {
    id: "disposal-4",
    concept: "disposal",
    kind: "scenario",
    difficulty: 2,
    prompt: "Your class owns a `FileStream` field and no raw OS handles. How should it implement cleanup?",
    options: [
      "Implement `IDisposable` and dispose the stream in `Dispose()`; no finalizer is needed",
      "Add a finalizer (`~MyClass()`) that disposes the stream",
      "Do nothing, because `FileStream` closes itself when collected",
      "Call `GC.Collect()` in `Dispose()` to release the file immediately",
    ],
    correctIndex: 0,
    explanation:
      "A type that owns other disposables should implement `IDisposable` and forward the call. The OS handle is already wrapped by a `SafeHandle` inside `FileStream`, which has its own finalizer. Adding your own finalizer is tempting but wrong: finalizers cost GC work, and by the time one runs, the managed objects it would touch may already have been finalized.",
    docsUrl: `${LEARN}/dotnet/standard/garbage-collection/implementing-dispose`,
  },
  {
    id: "disposal-5",
    concept: "disposal",
    kind: "concept",
    difficulty: 2,
    prompt: "What does `await using var conn = new SqlConnection(cs);` do differently from `using var`?",
    options: [
      "It calls `DisposeAsync()` (from `IAsyncDisposable`) at the end of the scope and awaits it",
      "It runs `Dispose()` on a background thread",
      "It opens the connection asynchronously",
      "It defers disposal until the garbage collector runs",
    ],
    correctIndex: 0,
    explanation:
      "`await using` targets `IAsyncDisposable` and awaits `DisposeAsync()`, which lets cleanup that performs I/O, such as flushing or closing a network connection, avoid blocking a thread. It does not open anything; it only changes how disposal happens. \"Background thread\" is tempting, but the cleanup is simply awaited, like any other asynchronous call.",
    docsUrl: `${LEARN}/dotnet/csharp/language-reference/statements/using`,
  },

  // ───────────────────────────── 17. Span<T> and Memory<T> ─────────────────────────────
  {
    id: "span-memory-1",
    concept: "span-memory",
    kind: "code",
    difficulty: 1,
    prompt: "What does this print?",
    code: `int[] data = { 1, 2, 3, 4, 5 };
Span<int> middle = data.AsSpan(1, 3);
middle[0] = 42;
Console.WriteLine(data[1]);`,
    options: ["42", "2", "1", "Throws `IndexOutOfRangeException`"],
    correctIndex: 0,
    explanation:
      "A `Span<T>` is a view over existing memory, not a copy, so `middle[0]` refers to the same storage as `data[1]`. Writing through the span changes the array. 2 is what you would get from `data[1..4]` on an array, because array range syntax allocates a copy.",
    docsUrl: `${LEARN}/dotnet/standard/memory-and-spans/`,
  },
  {
    id: "span-memory-2",
    concept: "span-memory",
    kind: "concept",
    difficulty: 2,
    prompt: "Why can't `Span<T>` be declared as a field of a class?",
    options: [
      "Because it is a `ref struct`, which may point at stack memory and therefore must itself never reach the heap",
      "Because it is a large class that would bloat every instance",
      "Because it is not serializable",
      "It can; only `ReadOnlySpan<T>` has this restriction",
    ],
    correctIndex: 0,
    explanation:
      "`Span<T>` can wrap `stackalloc` memory, so the compiler guarantees it never outlives the stack frame by forbidding it in heap locations: class fields, boxing, and lambda captures. `Memory<T>` is the heap-storable counterpart. Both spans have the same restriction, so the `ReadOnlySpan<T>`-only option is wrong.",
    docsUrl: `${LEARN}/dotnet/standard/memory-and-spans/memory-t-usage-guidelines`,
  },
  {
    id: "span-memory-3",
    concept: "span-memory",
    kind: "code",
    difficulty: 2,
    prompt: "How many new strings does the second line allocate?",
    code: `ReadOnlySpan<char> text = "2026-10-07";
int year = int.Parse(text[..4]);
Console.WriteLine(year + 1);`,
    options: ["0", "1", "2", "It depends on string interning"],
    correctIndex: 0,
    explanation:
      "Slicing a `ReadOnlySpan<char>` creates a new view over the same characters, and `int.Parse` has an overload that accepts `ReadOnlySpan<char>`, so no substring is created. 1 is what `text.Substring(0, 4)` on a `string` would cost. This pattern is why spans are used in parsers and other hot paths.",
  },
  {
    id: "span-memory-4",
    concept: "span-memory",
    kind: "scenario",
    difficulty: 2,
    prompt: "An `async` method must hold a slice of a byte buffer across several `await`s. Which type should it store?",
    options: [
      "`Memory<byte>` (or `ReadOnlyMemory<byte>`), taking `.Span` in synchronous sections",
      "`Span<byte>`",
      "A `ref struct` wrapper around `Span<byte>`",
      "A `stackalloc` buffer",
    ],
    correctIndex: 0,
    explanation:
      "`Memory<T>` is a regular struct that can live on the heap, so it can be stored in the state machine an async method uses across `await`s. Inside each synchronous section, `.Span` gives fast access. `Span<byte>` is tempting, but a ref-struct value cannot be kept alive across an `await`, and a `stackalloc` buffer belongs to a stack frame that no longer exists once the method yields.",
    docsUrl: `${LEARN}/dotnet/standard/memory-and-spans/memory-t-usage-guidelines`,
  },
  {
    id: "span-memory-5",
    concept: "span-memory",
    kind: "concept",
    difficulty: 3,
    prompt: "Which statement about `Span<byte> buffer = stackalloc byte[256];` is true?",
    options: [
      "It requires an `unsafe` context",
      "It allocates on the GC heap, like `new byte[256]`",
      "It allocates on the current stack frame with no GC allocation; the memory is released when the method returns, and large sizes risk stack overflow",
      "The buffer survives after the method returns, as long as the span is referenced",
    ],
    correctIndex: 2,
    explanation:
      "Assigning `stackalloc` to a `Span<T>` is safe code; the span bounds-checks access to stack memory that disappears when the method returns. Keep sizes small and bounded, because thread stacks are small and fixed in size. The `unsafe` option is tempting because `stackalloc` used to require pointers, but it does not when the result is a span.",
  },

  // ───────────────────────────── 18. Exceptions ─────────────────────────────
  {
    id: "exceptions-1",
    concept: "exceptions",
    kind: "code",
    difficulty: 1,
    prompt: "Inside this `catch` block, which statement rethrows the exception while preserving its original stack trace?",
    code: `try
{
    ProcessOrder();
}
catch (Exception ex)
{
    Log(ex);
    // rethrow here
}`,
    options: ["`throw;`", "`throw ex;`", "`throw new Exception(ex.Message);`", "`return ex;`"],
    correctIndex: 0,
    explanation:
      "A bare `throw;` rethrows the current exception object with its original stack trace intact. `throw ex;` is the classic mistake: it rethrows the same object but resets the stack trace to the current line, hiding where the failure actually happened. If you need to wrap the exception, pass it as `innerException` so the original trace survives.",
    docsUrl: `${LEARN}/dotnet/standard/exceptions/best-practices-for-exceptions`,
  },
  {
    id: "exceptions-2",
    concept: "exceptions",
    kind: "code",
    difficulty: 2,
    prompt: "What does this print?",
    code: `Console.WriteLine(GetValue());

static int GetValue()
{
    int x = 1;
    try
    {
        return x;
    }
    finally
    {
        x = 2;
    }
}`,
    options: ["1", "2", "0", "It does not compile, because `finally` cannot modify a returned variable"],
    correctIndex: 0,
    explanation:
      "The `return` expression is evaluated and its value saved before the `finally` block runs, so changing `x` afterwards does not affect the returned `int`. 2 is tempting because `finally` does run before control leaves the method. If `x` were a reference to a mutable object, mutations made in `finally` would be visible, because only the reference was copied.",
  },
  {
    id: "exceptions-3",
    concept: "exceptions",
    kind: "code",
    difficulty: 2,
    prompt: "What does this print?",
    code: `using System.Net;

try
{
    throw new HttpRequestException("unavailable", null, HttpStatusCode.ServiceUnavailable);
}
catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
{
    Console.WriteLine("not found");
}
catch (HttpRequestException)
{
    Console.WriteLine("other http");
}`,
    options: [
      "not found",
      "other http",
      "Nothing; the exception is unhandled",
      "It does not compile, because the same exception type cannot be caught twice",
    ],
    correctIndex: 1,
    explanation:
      "An exception filter (`when`) is evaluated before its handler is chosen; if it returns false, the runtime keeps looking at the next `catch`. The status is 503, so the filter fails and the general handler prints \"other http\". Catching the same type twice is legal when an earlier clause has a filter; it is an error only when an earlier unfiltered clause already catches that type.",
    docsUrl: `${LEARN}/dotnet/csharp/language-reference/statements/exception-handling-statements`,
  },
  {
    id: "exceptions-4",
    concept: "exceptions",
    kind: "scenario",
    difficulty: 2,
    prompt: "A sign-up endpoint validates user input, and invalid submissions are common. How should validation failures be reported to the caller?",
    options: [
      "Throw a custom `ValidationException` and catch it in middleware, because exceptions are nearly free in modern .NET",
      "Return a result object (for example, a validation result or `Result<T>`) that carries the errors",
      "Return `null` and log the errors",
      "Call `Environment.FailFast` so bad input is never processed",
    ],
    correctIndex: 1,
    explanation:
      "Expected, frequent outcomes such as invalid input are part of normal control flow, so returning them as data keeps them explicit in the signature and avoids the cost of throwing. Exceptions are best for unexpected failures. The \"nearly free\" option is tempting because exception handling got faster in recent .NET versions, but throwing still costs far more than returning a value.",
    docsUrl: `${LEARN}/dotnet/standard/exceptions/best-practices-for-exceptions`,
  },
  {
    id: "exceptions-5",
    concept: "exceptions",
    kind: "concept",
    difficulty: 1,
    prompt: "A public method receives `null` for a parameter that must not be null. What should it throw?",
    options: [
      "`NullReferenceException`",
      "`ArgumentNullException`, for example via `ArgumentNullException.ThrowIfNull(arg)`",
      "`InvalidOperationException`",
      "`ApplicationException`",
    ],
    correctIndex: 1,
    explanation:
      "`ArgumentNullException` tells the caller exactly which argument was wrong, and `ThrowIfNull` (added in .NET 6) captures the parameter name automatically. `NullReferenceException` is tempting because it is what would happen anyway, but it should only ever be thrown by the runtime and points at your code rather than the caller's. `InvalidOperationException` is for calls that are invalid because of the object's state, not its arguments.",
    docsUrl: `${LEARN}/dotnet/standard/exceptions/best-practices-for-exceptions`,
  },

  // ───────────────────────────── 19. Equality ─────────────────────────────
  {
    id: "equality-1",
    concept: "equality",
    kind: "code",
    difficulty: 1,
    prompt: "What does this print?",
    code: `var a = new Point(1, 2);
var b = new Point(1, 2);
Console.WriteLine(a == b);
Console.WriteLine(a.Equals(b));

class Point(int x, int y)
{
    public int X { get; } = x;
    public int Y { get; } = y;
}`,
    options: ["False, then False", "True, then True", "False, then True", "True, then False"],
    correctIndex: 0,
    explanation:
      "A class that does not override `Equals` or `==` uses reference equality for both, and `a` and `b` are distinct objects. \"False, then True\" is tempting because people expect `Equals` to compare values by default, but `object.Equals` compares references. Records, or classes with explicit `Equals`/`GetHashCode` overrides, give value equality.",
    docsUrl: `${LEARN}/dotnet/csharp/programming-guide/statements-expressions-operators/equality-comparisons`,
  },
  {
    id: "equality-2",
    concept: "equality",
    kind: "code",
    difficulty: 1,
    prompt: "What does this print?",
    code: `var a = new Point(1, 2);
var b = new Point(1, 2);
Console.WriteLine(a == b);
Console.WriteLine(ReferenceEquals(a, b));

record Point(int X, int Y);`,
    options: ["True, then False", "True, then True", "False, then False", "False, then True"],
    correctIndex: 0,
    explanation:
      "Records synthesize `Equals`, `GetHashCode`, `==`, and `!=` based on their members, so two records with equal values compare equal. They are still separate heap objects, so `ReferenceEquals` returns false. \"True, then True\" is tempting if you assume equal records are interned or shared, which they are not.",
    docsUrl: `${LEARN}/dotnet/csharp/language-reference/builtin-types/record`,
  },
  {
    id: "equality-3",
    concept: "equality",
    kind: "code",
    difficulty: 3,
    prompt: "What does this print?",
    code: `object a = "hello";
object b = new string("hello".ToCharArray());
Console.WriteLine(a == b);
Console.WriteLine(a.Equals(b));`,
    options: ["False, then True", "True, then True", "False, then False", "True, then False"],
    correctIndex: 0,
    explanation:
      "Operators are resolved at compile time from the static types, and with both sides typed as `object`, `==` is reference equality; `b` is a distinct string instance, so it prints False. `Equals` is virtual, so `string.Equals` runs and compares characters, which gives True. \"True, then True\" is tempting because `string` overloads `==`, but that overload is used only when the compiler sees `string` on both sides.",
  },
  {
    id: "equality-4",
    concept: "equality",
    kind: "concept",
    difficulty: 2,
    prompt: "If you override `Equals`, which `GetHashCode` rule must hold?",
    options: [
      "Objects that are equal must return the same hash code",
      "Objects that are not equal must return different hash codes",
      "Every instance must return a unique hash code",
      "The hash code must be the same across process restarts",
    ],
    correctIndex: 0,
    explanation:
      "Hash-based collections first find a bucket by hash code and then call `Equals`, so equal objects with different hash codes would never be found. Unequal objects are allowed to collide; collisions only reduce performance, which is why the \"must differ\" option is a misconception. Hash codes are not stable across processes either; `string` hashing is randomized per process in .NET Core and later.",
    docsUrl: `${LEARN}/dotnet/api/system.object.gethashcode`,
  },
  {
    id: "equality-5",
    concept: "equality",
    kind: "scenario",
    difficulty: 2,
    prompt:
      "You use a mutable `Customer` class as a `Dictionary` key, with `Equals`/`GetHashCode` based on `Email`. After an entry is added, the customer's `Email` changes and lookups start failing. What should you do?",
    options: [
      "Use an immutable key, such as the email string itself or a record with `init`-only properties",
      "Call `dictionary.TrimExcess()` after each change",
      "Override `GetHashCode` to return a constant so lookups always succeed",
      "Switch to `SortedDictionary`, which does not use hash codes",
    ],
    correctIndex: 0,
    explanation:
      "The entry was stored in a bucket chosen by the old hash code, and after the mutation the dictionary looks in a different bucket, so the entry becomes unreachable. Keys must not change in ways that affect equality while they are in a collection, and immutable keys make that guaranteed. A constant hash code \"works\" but degrades every lookup to a linear scan, and `SortedDictionary` breaks the same way once the comparer's ordering of a stored key changes.",
  },

  // ───────────────────────────── 20. Collections ─────────────────────────────
  {
    id: "collections-1",
    concept: "collections",
    kind: "code",
    difficulty: 1,
    prompt: "What does this print?",
    code: `var set = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Apple" };
bool added = set.Add("APPLE");
Console.WriteLine($"{added} {set.Count}");`,
    options: ["False 1", "True 2", "True 1", "Throws `ArgumentException` for a duplicate"],
    correctIndex: 0,
    explanation:
      "The set uses a case-insensitive comparer, so \"APPLE\" equals \"Apple\". `HashSet<T>.Add` returns false for a duplicate instead of throwing, and the count stays 1. The exception option is tempting because `Dictionary.Add` does throw on a duplicate key.",
  },
  {
    id: "collections-2",
    concept: "collections",
    kind: "code",
    difficulty: 1,
    prompt: "What happens on the second line?",
    code: `var stock = new Dictionary<string, int> { ["apples"] = 3 };
int pears = stock["pears"];`,
    options: ["`pears` is 0", "Throws `KeyNotFoundException`", "`pears` is null", "It does not compile"],
    correctIndex: 1,
    explanation:
      "The `Dictionary` indexer getter throws `KeyNotFoundException` when the key is missing. 0 is tempting because `int` defaults to 0, and some other languages' maps return a default value. Use `TryGetValue` or `GetValueOrDefault` when a missing key is expected.",
  },
  {
    id: "collections-3",
    concept: "collections",
    kind: "code",
    difficulty: 2,
    prompt: "What happens when this runs?",
    code: `var list = new List<int> { 1, 2, 3, 4 };
foreach (var n in list)
{
    if (n % 2 == 0)
        list.Remove(n);
}
Console.WriteLine(list.Count);`,
    options: [
      "Prints 2",
      "Prints 3",
      "Throws `InvalidOperationException` because the collection was modified during enumeration",
      "Loops forever",
    ],
    correctIndex: 2,
    explanation:
      "`List<T>`'s enumerator tracks a version number, and the next `MoveNext` after `Remove(2)` detects the change and throws. Printing 2 assumes the loop works as intended, which is the tempting answer. Use `list.RemoveAll(n => n % 2 == 0)`, or iterate backwards with a `for` loop.",
  },
  {
    id: "collections-4",
    concept: "collections",
    kind: "scenario",
    difficulty: 3,
    prompt:
      "A lookup table of country codes is built once at startup, never changes, and is read millions of times by concurrent requests. Which type fits best on .NET 8 or later?",
    options: ["`ConcurrentDictionary<string, Country>`", "`FrozenDictionary<string, Country>`", "`ImmutableDictionary<string, Country>`", "`SortedDictionary<string, Country>`"],
    correctIndex: 1,
    explanation:
      "`FrozenDictionary` (in `System.Collections.Frozen`, added in .NET 8) spends extra time at creation to produce a structure optimized for fast, thread-safe reads, which suits build-once, read-many data. `ConcurrentDictionary` is tempting because of the concurrent readers, but it pays for write support you will never use. `ImmutableDictionary` is designed for cheap modified copies, and its tree structure makes lookups slower.",
  },
  {
    id: "collections-5",
    concept: "collections",
    kind: "concept",
    difficulty: 2,
    prompt: "A class exposes `public IReadOnlyList<Item> Items => _items.AsReadOnly();`. What does this guarantee to callers?",
    options: [
      "Callers cannot modify the list through this reference, but later changes the class makes to `_items` are visible through it",
      "It is a snapshot copy, so later changes to `_items` are never visible",
      "Both the list and the `Item` objects in it are immutable",
      "Nothing; callers can cast it back to `List<Item>` and modify it",
    ],
    correctIndex: 0,
    explanation:
      "`AsReadOnly()` returns a `ReadOnlyCollection<T>` wrapper over the same list without copying, so it blocks modification through the wrapper but reflects the owner's later changes. The snapshot option is a common misconception; use `ToList()` or an immutable collection for a snapshot. The cast-back option would be true if the property returned `_items` directly typed as `IReadOnlyList<Item>`, but the wrapper is not a `List<T>`.",
    docsUrl: `${LEARN}/dotnet/standard/collections/`,
  },

  // ───────────────────────────── 21. Architecture patterns ─────────────────────────────
  {
    id: "architecture-1",
    concept: "architecture",
    kind: "concept",
    difficulty: 2,
    prompt: "Which statement about CQRS is accurate?",
    options: [
      "CQRS requires event sourcing",
      "CQRS requires separate read and write databases",
      "CQRS separates commands (which change state) from queries (which read it), so each side can have its own model; separate stores, event sourcing, and mediator libraries are optional",
      "CQRS requires a mediator library such as MediatR",
    ],
    correctIndex: 2,
    explanation:
      "At its core, CQRS means modeling reads and writes separately. Separate databases, event sourcing, and in-process mediators are often paired with it, which is why each distractor is a widespread misconception. Many teams apply CQRS with plain handler classes injected via DI on a single database.",
  },
  {
    id: "architecture-2",
    concept: "architecture",
    kind: "concept",
    difficulty: 2,
    prompt: "What is the most common argument against wrapping EF Core in a generic `IRepository<T>` plus a Unit of Work?",
    options: [
      "EF Core does not support the Repository pattern",
      "`DbContext` already acts as a Unit of Work and `DbSet<T>` as a repository, so a generic wrapper usually duplicates them and hides `IQueryable` features",
      "Repositories are the only way to unit-test code that uses EF Core",
      "Unit of Work cannot be used with async code",
    ],
    correctIndex: 1,
    explanation:
      "`SaveChanges` commits all tracked changes as one unit, and `DbSet<T>` already offers collection-like querying, so a thin generic layer adds indirection while hiding `Include`, projections, and other EF features. The testing option is tempting but false: EF Core code can be tested against SQLite, containerized databases, or behind query-specific abstractions. Purpose-built repositories for aggregate roots remain a reasonable choice in DDD-style code.",
  },
  {
    id: "architecture-3",
    concept: "architecture",
    kind: "code",
    difficulty: 3,
    prompt: "What is the main reliability problem with this handler?",
    code: `await using var tx = await db.Database.BeginTransactionAsync();
db.Orders.Add(order);
await db.SaveChangesAsync();
await bus.PublishAsync(new OrderPlaced(order.Id)); // external message broker
await tx.CommitAsync();`,
    options: [
      "None; the database transaction also covers the broker publish",
      "It is a dual write: if the commit fails after the event is published, consumers receive an event for an order that was never saved. The Outbox pattern fixes this",
      "`SaveChangesAsync` cannot be called inside an explicit transaction",
      "The order is inserted twice, once by `SaveChangesAsync` and once by `CommitAsync`",
    ],
    correctIndex: 1,
    explanation:
      "The database and the broker are separate systems, so no local transaction makes both writes atomic. The Outbox pattern writes the message to an outbox table in the same database transaction, and a relay publishes it afterwards. Delivery is then at least once, so consumers must be idempotent. Believing the transaction covers the broker is the tempting misconception.",
  },
  {
    id: "architecture-4",
    concept: "architecture",
    kind: "code",
    difficulty: 2,
    prompt: "Which design pattern does this composition illustrate?",
    code: `IPriceCalculator calc = new LoggingCalculator(new TaxCalculator(new BaseCalculator()));
Console.WriteLine(calc.Calculate(100m));

public interface IPriceCalculator { decimal Calculate(decimal price); }

public class BaseCalculator : IPriceCalculator
{
    public decimal Calculate(decimal price) => price;
}

public class TaxCalculator(IPriceCalculator inner) : IPriceCalculator
{
    public decimal Calculate(decimal price) => inner.Calculate(price) * 1.0625m;
}

public class LoggingCalculator(IPriceCalculator inner) : IPriceCalculator
{
    public decimal Calculate(decimal price)
    {
        var result = inner.Calculate(price);
        Console.WriteLine($"Calculated {result}");
        return result;
    }
}`,
    options: ["Decorator", "Adapter", "Strategy", "Composite"],
    correctIndex: 0,
    explanation:
      "Each wrapper implements the same interface as the object it wraps and adds behavior before or after delegating, which is the Decorator pattern. Adapter is tempting because it also wraps an object, but an adapter converts to a different interface, while these keep the same one. In .NET DI, decorators are often registered with a helper library such as Scrutor or by manual factory registration.",
  },
  {
    id: "architecture-5",
    concept: "architecture",
    kind: "scenario",
    difficulty: 2,
    prompt:
      "A small team builds a feature-heavy API in which features rarely share business logic. Their goal is that adding or changing a feature touches one folder. Which structure fits best?",
    options: [
      "Vertical Slice Architecture: organize by feature, with each slice owning its endpoint, handler, validation, and data access",
      "Clean Architecture with separate Domain, Application, Infrastructure, and Web projects",
      "A single `Services` folder of shared service classes used by all controllers",
      "Microservices, one per feature",
    ],
    correctIndex: 0,
    explanation:
      "Vertical slices group code by use case, so a change usually stays inside one feature folder, which fits teams whose features are independent. Clean Architecture is tempting because it is widely recommended, but it organizes by technical layer, so a single feature typically touches several projects; it pays off more when a rich, shared domain model exists. Microservices add distributed-system costs that a small team rarely needs for this goal.",
  },

  // ───────────────────────────── 22. Hosting and resilience ─────────────────────────────
  {
    id: "hosting-resilience-1",
    concept: "hosting-resilience",
    kind: "code",
    difficulty: 3,
    prompt: "This worker needs a fresh `AppDbContext` (registered as scoped) on every iteration. Which change is correct?",
    code: `public class CleanupWorker(AppDbContext db) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await db.Sessions.Where(s => s.Expired).ExecuteDeleteAsync(stoppingToken);
            await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
        }
    }
}`,
    options: [
      "Inject `IServiceScopeFactory` and create a scope per iteration, resolving `AppDbContext` from that scope",
      "Register the worker with `AddScoped` instead of `AddHostedService`",
      "Register `AppDbContext` as a singleton",
      "Store `db` in a static field so it is shared safely",
    ],
    correctIndex: 0,
    explanation:
      "Hosted services are resolved once from the root provider and live as long as the app, so a scoped `DbContext` injected into the constructor becomes a captive dependency. Creating a scope per unit of work gives each iteration its own short-lived context. A singleton `DbContext` is tempting because it removes the lifetime mismatch, but `DbContext` is not thread-safe and its change tracker grows without bound.",
    docsUrl: `${LEARN}/dotnet/core/extensions/workers`,
  },
  {
    id: "hosting-resilience-2",
    concept: "hosting-resilience",
    kind: "code",
    difficulty: 2,
    prompt: "Why is `stoppingToken` passed to `WaitForNextTickAsync`?",
    code: `protected override async Task ExecuteAsync(CancellationToken stoppingToken)
{
    using var timer = new PeriodicTimer(TimeSpan.FromMinutes(5));
    while (await timer.WaitForNextTickAsync(stoppingToken))
    {
        await DoWorkAsync(stoppingToken);
    }
}`,
    options: [
      "So that host shutdown can interrupt the wait, instead of blocking for up to five minutes",
      "Because `PeriodicTimer` throws if no token is supplied",
      "To prevent two executions of `DoWorkAsync` from overlapping",
      "To make the timer's ticks thread-safe",
    ],
    correctIndex: 0,
    explanation:
      "When the host stops, it cancels `stoppingToken`, and passing the token lets the pending wait end immediately instead of sleeping until the next tick. Overlap prevention is tempting, but `PeriodicTimer` already guarantees it: the loop awaits `DoWorkAsync` before asking for the next tick, and ticks that elapse while work is running collapse into a single pending tick. The token parameter is optional.",
    docsUrl: `${LEARN}/dotnet/core/extensions/workers`,
  },
  {
    id: "hosting-resilience-3",
    concept: "hosting-resilience",
    kind: "code",
    difficulty: 2,
    prompt: "Using Polly v8, if the callback always throws `HttpRequestException`, how many times does it execute in total?",
    code: `var pipeline = new ResiliencePipelineBuilder()
    .AddRetry(new RetryStrategyOptions { MaxRetryAttempts = 3 })
    .AddTimeout(TimeSpan.FromSeconds(2))
    .Build();

await pipeline.ExecuteAsync(async ct => await CallApiAsync(ct));`,
    options: ["1", "3", "4", "It retries until the 2-second timeout elapses"],
    correctIndex: 2,
    explanation:
      "`MaxRetryAttempts` counts retries in addition to the initial attempt, so the callback runs 1 + 3 = 4 times before the last exception propagates. 3 is the common misreading. Because the timeout is added after the retry, it is the inner strategy, so it limits each attempt to 2 seconds rather than capping the whole operation.",
    docsUrl: `${LEARN}/dotnet/core/resilience/`,
  },
  {
    id: "hosting-resilience-4",
    concept: "hosting-resilience",
    kind: "concept",
    difficulty: 2,
    prompt: "In Polly v8, what is the central abstraction that replaced v7's `Policy` and `PolicyWrap`?",
    options: [
      "`ResiliencePipeline`, built with `ResiliencePipelineBuilder`, which composes strategies such as retry, timeout, and circuit breaker",
      "`IAsyncPolicy`, which remains the primary API",
      "`HttpClientHandler.MaxRetries`",
      "`IRetryProvider` from Microsoft.Extensions.Retry",
    ],
    correctIndex: 0,
    explanation:
      "Polly v8 reorganized the API around resilience pipelines composed of strategies, and Microsoft.Extensions.Resilience and Microsoft.Extensions.Http.Resilience build on it, for example `AddStandardResilienceHandler()` for `HttpClient`. `IAsyncPolicy` is tempting because it dominated older tutorials, but it belongs to the v7 API. `HttpClientHandler` has no retry setting.",
    docsUrl: `${LEARN}/dotnet/core/resilience/http-resilience`,
  },
  {
    id: "hosting-resilience-5",
    concept: "hosting-resilience",
    kind: "scenario",
    difficulty: 3,
    prompt: "You are adding automatic retries to an `HttpClient` that calls `POST /payments`. What must you account for?",
    options: [
      "Retry only idempotent requests, or send an idempotency key that lets the server deduplicate a retried POST",
      "Nothing; retries are always safe because failed requests have no effect",
      "Disable timeouts so that retries are never needed",
      "Wrap the call in a `TransactionScope` so the remote charge is rolled back on failure",
    ],
    correctIndex: 0,
    explanation:
      "A request can time out after the server has already processed it, so blindly retrying a non-idempotent POST can charge a customer twice. Use an idempotency key, or restrict retries to safe or idempotent methods. A `TransactionScope` is tempting, but it cannot roll back work performed by a remote HTTP service.",
  },
];
