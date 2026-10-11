/**
 * Study guides: one per concept, shown on /concepts/[id] next to the quiz.
 * Plain data like questions.ts; `backticks` in prose render as inline code.
 * See README.md ("Study guides") for the authoring rules enforced by tests/guides.test.ts.
 */
import { LEARN, type Concept, type Difficulty } from "./questions";

export interface CodeExample {
  /** One sentence shown above the snippet. */
  caption: string;
  /** C# that compiles, given the types the caption says are assumed. */
  code: string;
}

/** A link to another concept in the app, or a named topic outside it. */
export type RelatedTopic = { concept: Concept; why: string } | { topic: string; why: string };

export interface InterviewQuestion {
  question: string;
  /** 2–4 sentences: what a strong answer covers. */
  answer: string;
  level: Difficulty;
}

export interface ConceptGuide {
  /** One- or two-sentence definition, shown under the page title. */
  definition: string;
  /** Why the concept matters in real code. */
  why: string[];
  /** How the concept is commonly used. */
  usage: string[];
  examples: CodeExample[];
  /** Explain like I'm five: a deliberately simplified analogy, one paragraph per entry. */
  eli5: string[];
  related: RelatedTopic[];
  interview: InterviewQuestion[];
  /** learn.microsoft.com only. */
  docsUrl?: string;
}

export const GUIDES: Record<Concept, ConceptGuide> = {
  // ───────────────────────────── 1. Naming ─────────────────────────────
  naming: {
    definition:
      ".NET naming conventions are the casing and prefix rules from the Framework Design Guidelines and the C# coding conventions. They make every .NET codebase, including the BCL itself, read the same way.",
    why: [
      "Public names are part of an API's contract. Renaming a public member later breaks every caller, so it pays to get names right the first time.",
      "Consistent casing tells a reader what an identifier is (a type, a member, a parameter, a private field) without jumping to its declaration.",
      "A library that follows BCL conventions feels native to its consumers: `GetOrderAsync` and `IOrderRepository` need no explanation.",
      "Agreeing on published rules and enforcing them with tooling removes style debates from code review.",
    ],
    usage: [
      "PascalCase for namespaces, types, methods, properties, events, and constants; camelCase for parameters and local variables.",
      "`_camelCase` for private instance fields. The .NET runtime team also uses `s_` for private static fields and `t_` for thread-static fields.",
      "Prefixes and suffixes that signal a role: `I` for interfaces (`IDisposable`), `T` for type parameters (`TKey`), and `Async`, `Exception`, `Attribute`, and `EventArgs` suffixes.",
      "Two-letter acronyms stay uppercase (`IOStream`); longer acronyms are cased as words (`XmlReader`, `HttpClient`). `Id` is an abbreviation, not an acronym, so it is `UserId`.",
      "Enforcement through `.editorconfig` naming rules (`dotnet_naming_rule.*`), which surface violations as IDE1006 warnings in the IDE and, if configured, in the build.",
    ],
    examples: [
      {
        caption: "Each identifier's shape tells you what it is. `Order` is assumed to be defined elsewhere.",
        code: `public interface IOrderRepository
{
    Task<Order?> FindAsync(int orderId, CancellationToken cancellationToken);
}

public sealed class OrderService(IOrderRepository repository)
{
    public const int MaxRetries = 3;                     // constant: PascalCase
    private static readonly TimeSpan s_timeout = TimeSpan.FromSeconds(30);
    private readonly IOrderRepository _repository = repository; // _camelCase

    // Method: PascalCase with the Async suffix. Parameters: camelCase.
    public Task<Order?> GetOrderAsync(
        int orderId, CancellationToken cancellationToken = default)
        => _repository.FindAsync(orderId, cancellationToken);
}`,
      },
    ],
    eli5: [
      "Imagine a classroom where everyone labels their lunchbox the same way: first name, capital letter first. Anyone can grab the right box without asking.",
      "Naming conventions are that agreement for code. The shape of a name tells you what it is. `OrderService`, with a capital letter, is something other parts of the program can use. `orderId`, in lowercase, is a small value that lives inside one method. `_total`, with an underscore, is a private note a class keeps for itself.",
    ],
    related: [
      { concept: "fields-properties", why: "Public data is exposed as PascalCase properties, while private state lives in `_camelCase` fields." },
      { concept: "generics", why: "Type parameters use the `T` prefix: `T` alone, or descriptive names such as `TKey` and `TResult`." },
      { concept: "async-await", why: "Methods that return awaitable types carry the `Async` suffix by convention." },
      { topic: "Framework Design Guidelines", why: "The Microsoft Learn section (and book of the same name) that defines these rules alongside broader API design guidance." },
      { topic: ".editorconfig code-style rules", why: "Where a team encodes its naming rules so the IDE and build enforce them automatically." },
    ],
    interview: [
      {
        level: 1,
        question: "How should constants be cased in C#, and why not `SCREAMING_CASE`?",
        answer:
          "Constants use PascalCase, for example `MaxRetries`, like any other member. `SCREAMING_CASE` comes from C and Java and reads as foreign in .NET code. A strong answer adds that a `public const` is compiled into callers, so a value that may change between releases should be `static readonly` instead.",
      },
      {
        level: 1,
        question: "How are acronyms capitalized in .NET identifiers?",
        answer:
          "Two-letter acronyms keep both letters uppercase in PascalCase (`IOStream`) and become lowercase at the start of a camelCase name (`ioStream`). Acronyms of three or more letters are treated as words: `XmlReader`, `HttpClient`, `SqlConnection`. `Id` is an abbreviation of \"identifier\", not an acronym, so it is written `UserId`.",
      },
      {
        level: 2,
        question: "Which prefix do you use for private fields, and how do you enforce it?",
        answer:
          "`_camelCase` is the most common choice and matches the .NET runtime's own style, which also uses `s_` for statics and `t_` for thread-statics. The Framework Design Guidelines govern public API surface, so private-field style is a team decision. The important part is to pick one style and encode it in `.editorconfig` naming rules so violations appear as warnings or build errors.",
      },
      {
        level: 2,
        question: "Why do asynchronous methods end in `Async`, and when might you omit the suffix?",
        answer:
          "The suffix signals that a method returns an awaitable type such as `Task` or `ValueTask` and should be awaited, and it distinguishes pairs such as `Read` and `ReadAsync`. Teams commonly omit it where the name is dictated by something else, such as an event handler or an interface member whose name is fixed. Whatever the rule, it should be applied consistently.",
      },
      {
        level: 3,
        question: "Is renaming a public method a breaking change? What about renaming one of its parameters?",
        answer:
          "Renaming a public method breaks both source and binary compatibility: callers fail to compile, and already-compiled callers throw `MissingMethodException` at runtime. Renaming a parameter is binary-compatible, but it is source-breaking for any caller that uses named arguments, such as `Retry(count: 3)`. Library authors therefore treat parameter names as part of the public contract.",
      },
    ],
    docsUrl: `${LEARN}/dotnet/standard/design-guidelines/capitalization-conventions`,
  },

  // ───────────────────────────── 2. Fields vs properties ─────────────────────────────
  "fields-properties": {
    definition:
      "A field is a variable stored directly in an object. A property is a pair of accessor methods (`get` with `set` or `init`) that callers use with field-like syntax but that can run code.",
    why: [
      "Changing a public field to a property is a binary-breaking change: the compiled IL switches from a field load to a call to `get_Name`. Public APIs therefore start with properties.",
      "Properties let you add validation, lazy loading, change notification, or computed values later without changing callers.",
      "Most of the ecosystem is built around properties: interfaces can declare them, data binding uses them, EF Core conventions discover them, and `System.Text.Json` ignores public fields by default.",
      "Accessors control mutability precisely, through get-only, `init`, `private set`, and `required` members.",
    ],
    usage: [
      "Auto-properties such as `public string Name { get; set; }` for plain data; the compiler generates the backing field.",
      "`init` accessors and `required` members (C# 11) for immutable DTOs that must be fully populated by an object initializer.",
      "Private `readonly` fields for injected dependencies and internal state.",
      "Expression-bodied computed properties, such as `public int Count => _items.Count;`, for derived values.",
      "The C# 14 `field` keyword, which adds validation to an auto-property without a hand-written backing field.",
    ],
    examples: [
      {
        caption: "Fields hold private state; properties form the public surface. `Order` is assumed to be defined elsewhere.",
        code: `public class Customer
{
    private readonly List<Order> _orders = [];   // field: private state

    public required string Email { get; init; }  // set once, at initialization
    public string? Nickname { get; set; }        // plain auto-property
    public int OrderCount => _orders.Count;      // computed and read-only

    // C# 14: field refers to the compiler-generated backing field.
    public decimal CreditLimit
    {
        get;
        set => field = value >= 0
            ? value
            : throw new ArgumentOutOfRangeException(nameof(value));
    }
}`,
      },
    ],
    eli5: [
      "Think of a bank. The vault in the back is a field: it is where the money actually sits, and only staff go inside. The teller window is a property: you ask for money, and the teller checks your ID and balance before handing anything over.",
      "Customers only ever use the window. If the bank adds a new rule later, it retrains the teller, and customers keep using the same window as before. That is why public data in C# goes through properties rather than fields.",
    ],
    related: [
      { concept: "naming", why: "Properties are PascalCase, while private backing fields usually carry an `_` prefix." },
      { concept: "nullable-reference-types", why: "`required` members satisfy the compiler's warnings about uninitialized non-nullable properties." },
      { concept: "class-struct", why: "Positional records generate `init`-only properties, and structs sometimes expose public fields for performance." },
      { topic: "INotifyPropertyChanged", why: "Property setters are where WPF and .NET MAUI view models raise change notifications for data binding." },
      { topic: "Source vs binary compatibility", why: "The field-to-property change is the standard example of a change that compiles but breaks existing binaries." },
    ],
    interview: [
      {
        level: 1,
        question: "What is the difference between a field and a property?",
        answer:
          "A field is storage. A property is a member with accessor methods, usually backed by a field. Callers use the same syntax for both, but property access compiles to a method call, so a property can validate, compute, or raise notifications, and it can be declared in an interface.",
      },
      {
        level: 2,
        question: "Why is changing a public field to a property a breaking change?",
        answer:
          "It is binary-breaking: callers compiled against the field still emit a field-load instruction, so at runtime they throw `MissingFieldException`. It can also be source-breaking, because a field can be passed as a `ref` or `out` argument and a property cannot. That is why public types expose properties from the start.",
      },
      {
        level: 2,
        question: "What do `init` and `required` do, and how do they differ?",
        answer:
          "`init` allows a property to be set only during construction: in a constructor, an object initializer, or a `with` expression. `required` (C# 11) forces callers to set the member in the object initializer, and omitting it is a compile error. They are often combined, as in `public required string Email { get; init; }`, which must be set exactly once.",
      },
      {
        level: 2,
        question: "Is it ever acceptable to expose a public field?",
        answer:
          "Yes, in narrow cases: constants, `static readonly` values, and small performance-oriented structs. `ValueTuple`, for example, exposes `Item1` and `Item2` as public fields. For ordinary public classes, the design guidelines and analyzer CA1051 recommend properties instead.",
      },
      {
        level: 3,
        question: "When should a member be a method rather than a property?",
        answer:
          "The design guidelines favor a method when the operation is much slower than a field access, performs I/O, has observable side effects, is a conversion, returns a new copy of internal state, or returns a different value on each call. Callers assume property access is cheap and safe to repeat, and debuggers evaluate properties automatically while you inspect objects, so expensive or side-effecting getters cause confusing behavior.",
      },
    ],
    docsUrl: `${LEARN}/dotnet/csharp/programming-guide/classes-and-structs/properties`,
  },

  // ───────────────────────────── 3. Generics ─────────────────────────────
  generics: {
    definition:
      "Generics let you write a type or method once with type parameters, such as `List<T>` or `TResult Map<TSource, TResult>(…)`, and use it type-safely with many different type arguments.",
    why: [
      "Type safety without casts: mistakes that would be runtime `InvalidCastException`s with `object`-based code become compile errors.",
      "Performance: generic collections store value types without boxing, because the JIT generates specialized code for each value-type argument.",
      "Reuse: a single implementation of `List<T>`, `Dictionary<TKey, TValue>`, `Task<T>`, or a result type serves every element type.",
      "Constraints document and enforce assumptions (`notnull`, `IComparable<T>`, `new()`), and variance (`in`/`out`) lets generic interfaces and delegates compose naturally.",
    ],
    usage: [
      "BCL collections and LINQ: `List<T>`, `Dictionary<TKey, TValue>`, `IEnumerable<T>`, `Func<T, TResult>`.",
      "Generic methods with type inference, such as `T Max<T>(T a, T b) where T : IComparable<T>`, called as `Max(3, 7)`.",
      "Constraints: `class`, `struct`, `notnull`, `unmanaged`, `new()`, a base class, an interface, or another type parameter.",
      "Dependency injection: `ILogger<T>`, `IOptions<T>`, and open-generic registrations such as `services.AddScoped(typeof(IRepository<>), typeof(Repository<>))`.",
      "Generic math (C# 11 and .NET 7): interfaces such as `INumber<T>` let one method work across `int`, `double`, and `decimal`.",
    ],
    examples: [
      {
        caption: "A constrained generic method and a generic-math method, each written once for many types.",
        code: `using System.Numerics;

Console.WriteLine(Generic.Max(3, 7));                // 7 (T inferred as int)
Console.WriteLine(Generic.Max("pear", "apple"));     // pear
Console.WriteLine(Generic.Sum(new[] { 1.5, 2.5 }));  // 4

public static class Generic
{
    public static T Max<T>(T a, T b) where T : IComparable<T>
        => a.CompareTo(b) >= 0 ? a : b;

    public static T Sum<T>(IEnumerable<T> values) where T : INumber<T>
    {
        T total = T.Zero;
        foreach (var value in values) total += value;
        return total;
    }
}`,
      },
    ],
    eli5: [
      "A generic is like a storage box with a blank label: \"Box of ____\". Before you use it, you write \"Box of crayons\" on the label, and from then on only crayons fit.",
      "You didn't have to build a separate crayon box, marble box, and sticker box. You designed one box and filled in the blank. And if someone tries to drop a marble into the crayon box, the label stops them before the program even runs, instead of letting it break later.",
    ],
    related: [
      { concept: "boxing", why: "Generic collections of value types avoid the boxing that `object`-based collections such as `ArrayList` cause." },
      { concept: "delegates", why: "`Func<T, TResult>` and `Action<T>` are generic delegates, and their `in`/`out` annotations enable variance." },
      { concept: "collections", why: "Every modern collection type is generic, and choosing one means choosing its type parameters and constraints." },
      { concept: "naming", why: "Type parameters are named `T` or `T`-prefixed descriptive names such as `TKey`." },
      { topic: "Covariance and contravariance", why: "`out T` lets an `IEnumerable<string>` be used as `IEnumerable<object>`; `in T` does the reverse for consumers such as `IComparer<T>`." },
      { topic: "Generic math", why: "C# 11 static abstract interface members let generic code use operators such as `+` and members such as `T.Zero`." },
    ],
    interview: [
      {
        level: 1,
        question: "What problem do generics solve compared with using `object`?",
        answer:
          "They provide type safety and performance. With `object`-based collections such as `ArrayList`, every read needs a cast that can fail at runtime, and value types are boxed on the way in. Generics move type checks to compile time and store value types without boxing.",
      },
      {
        level: 2,
        question: "Explain covariance and contravariance with an example.",
        answer:
          "A covariant parameter (`out T`) only produces values, so `IEnumerable<string>` can be used where `IEnumerable<object>` is expected. A contravariant parameter (`in T`) only consumes values, so an `IComparer<object>` can serve as an `IComparer<string>`. Variance applies only to generic interfaces and delegates, and only for reference-type arguments; `List<T>` is invariant because it both accepts and returns `T`.",
      },
      {
        level: 2,
        question: "Which generic constraints exist, and when would you use them?",
        answer:
          "`class` and `struct` restrict to reference or non-nullable value types; `notnull` excludes nullable types; `unmanaged` allows pointers, `sizeof`, and `stackalloc`; `new()` requires a public parameterless constructor; a base class or interface constraint gives access to its members; and `where TDerived : TBase` relates two type parameters. Use constraints to state exactly what the generic code relies on, so violations are caught at compile time.",
      },
      {
        level: 3,
        question: "How does the CLR implement generics for value types compared with reference types?",
        answer:
          "Generics in .NET are reified: type arguments exist at runtime, so `typeof(List<int>)` and `typeof(List<string>)` are different types, unlike Java's type erasure. The JIT shares one compiled implementation across all reference-type arguments, which are all pointer-sized, and generates specialized code for each value-type argument. That specialization is why `List<int>` needs no boxing.",
      },
      {
        level: 3,
        question: "What is generic math, and which language feature makes it possible?",
        answer:
          "C# 11 added static abstract interface members, which let an interface declare operators and static members. .NET 7 used them to define interfaces such as `INumber<T>`, so a single method can use `+`, comparison operators, and `T.Zero` for `int`, `double`, `decimal`, and other numeric types. Before that, numeric code needed an overload per type or slower dynamic techniques.",
      },
    ],
    docsUrl: `${LEARN}/dotnet/csharp/programming-guide/generics/constraints-on-type-parameters`,
  },

  // ───────────────────────────── 4. Class vs struct ─────────────────────────────
  "class-struct": {
    definition:
      "A class is a reference type: variables hold references to a shared object. A struct is a value type: variables hold the data itself, and assignment copies it.",
    why: [
      "The choice changes behavior. Changing a copied struct leaves the original untouched, while changing an object through one reference is visible through every other reference.",
      "It affects performance. Small structs avoid heap allocations and garbage-collection work in hot paths and large arrays, but large structs are expensive to copy on every assignment and call.",
      "Default equality differs: structs compare field values, while classes compare references unless they override equality.",
      "Modern variants (records, `readonly struct`, `record struct`, and `ref struct`) let you state immutability, value equality, and stack-only lifetimes explicitly.",
    ],
    usage: [
      "Classes for entities, services, and anything with identity, inheritance, or large or mutable state.",
      "Small immutable structs for single values such as `DateTime`, `TimeSpan`, `Guid`, coordinates, or money amounts.",
      "`record` (a record class) for immutable DTOs and messages that need value equality and `with` expressions; `readonly record struct` for small value objects.",
      "`ref struct` types such as `Span<T>`, which must never escape to the heap.",
      "Arrays of structs for data-oriented code that processes many small values in sequence.",
    ],
    examples: [
      {
        caption: "The same operations on a struct and a class give different results.",
        code: `var a = new PointStruct(1, 2);
var b = a;                  // copies the value
b.X = 10;
Console.WriteLine(a.X);     // 1

var c = new PointClass(1, 2);
var d = c;                  // copies the reference
d.X = 10;
Console.WriteLine(c.X);     // 10

public struct PointStruct(int x, int y) { public int X = x; public int Y = y; }
public class PointClass(int x, int y) { public int X = x; public int Y = y; }

// A small immutable value with value equality
public readonly record struct Money(decimal Amount, string Currency);`,
      },
    ],
    eli5: [
      "If I give you a photocopy of my drawing and you scribble on it, my drawing stays clean. That is a struct: you get your own copy.",
      "If instead I give you my home address and you paint the front door red, I come home to a red door. That is a class: we both point to the same house. Small things you pass around a lot, like a date or an amount of money, work well as photocopies. Big things with an identity, like a customer or a shopping cart, are houses that everyone visits by address.",
    ],
    related: [
      { concept: "boxing", why: "Treating a struct as `object` or an interface boxes it into a heap copy." },
      { concept: "equality", why: "Structs, classes, and records each have different default equality semantics." },
      { concept: "span-memory", why: "`Span<T>` is a `ref struct`, the stack-only kind of struct." },
      { concept: "fields-properties", why: "Immutable structs and records expose get-only or `init` properties." },
      { topic: "`in` parameters and defensive copies", why: "Passing large structs by reference avoids copies, but calling a non-readonly member on a readonly struct value can trigger hidden copies." },
    ],
    interview: [
      {
        level: 1,
        question: "What is the difference between a class and a struct?",
        answer:
          "A class is a reference type and a struct is a value type, so assigning a struct copies its data while assigning a class copies a reference. Structs cannot inherit from other types (they can implement interfaces), cannot declare finalizers, and default to an all-zero value rather than `null`. Classes support inheritance, and every variable of a class type refers to a shared instance.",
      },
      {
        level: 2,
        question: "Are structs always stored on the stack?",
        answer:
          "No. A struct is stored wherever its containing variable lives: a local may be on the stack or in a register, but a struct field of a class, an array element, a boxed struct, and a local captured by a lambda or used across `await` all live on the heap. The defining property of a struct is copy semantics, not stack allocation.",
      },
      {
        level: 2,
        question: "When would you choose a struct over a class?",
        answer:
          "Microsoft's guidelines suggest a struct when the type represents a single value, is under about 16 bytes, is immutable, and will not be boxed frequently. Structs also help in hot paths that create many short-lived values or store them in large arrays. Otherwise, a class is the safer default.",
      },
      {
        level: 2,
        question: "Why are mutable structs considered dangerous?",
        answer:
          "Because it is easy to modify a copy by accident. Indexers and property getters return copies (the compiler rejects `list[0].X = 5` for that reason), boxing copies the value, and calling a mutating method on a `readonly` field operates on a defensive copy. Making structs `readonly` removes the whole class of bugs.",
      },
      {
        level: 3,
        question: "What is a `ref struct`, and why does the language have it?",
        answer:
          "A `ref struct` is a value type that may only live on the stack: it cannot be boxed, stored in a class field or array, captured by a lambda, or kept alive across an `await`. Those rules let types such as `Span<T>` safely refer to stack memory or to the interior of other objects. The compiler enforces them, so the safety comes without `unsafe` code.",
      },
    ],
    docsUrl: `${LEARN}/dotnet/standard/design-guidelines/choosing-between-class-and-struct`,
  },

  // ───────────────────────────── 5. Boxing ─────────────────────────────
  boxing: {
    definition:
      "Boxing wraps a value-type value in a new heap object so it can be treated as `object` or an interface. Unboxing copies the value back out, and it must target the exact boxed type.",
    why: [
      "A box is normally a heap allocation (24 bytes for a boxed `int` on a 64-bit runtime), so boxing inside loops and hot paths drives frequent Gen0 garbage collections.",
      "Boxing copies the value. Mutating a boxed struct through an interface changes the copy in the box, not your original variable.",
      "Unboxing to a different type throws `InvalidCastException` at runtime, even when the numeric conversion would otherwise be legal.",
      "Boxing is easy to miss: it hides in `object` parameters, non-generic collections, and interface-typed variables that hold structs.",
    ],
    usage: [
      "Prefer generic collections and methods (`List<int>`, `Dictionary<string, long>`) over `ArrayList`, `Hashtable`, or `object` storage.",
      "Use constrained generics (`where T : IComparable<T>`) instead of interface-typed parameters, so interface methods are called on structs without boxing.",
      "Implement `IEquatable<T>` on structs used as dictionary keys or in `Contains`, so equality checks don't fall back to `Equals(object)`.",
      "Rely on interpolated string handlers (C# 10), which format value types such as `int` without boxing them.",
      "Find boxing with allocation profilers, `[MemoryDiagnoser]` in BenchmarkDotNet, or by looking for `box` instructions in the IL.",
    ],
    examples: [
      {
        caption: "Boxing, unboxing, and the generic alternative.",
        code: `int count = 42;
object boxed = count;           // box: allocates a new object on the heap
int back = (int)boxed;          // unbox: must name the exact boxed type
// long wrong = (long)boxed;    // compiles, but throws InvalidCastException
long right = (long)(int)boxed;  // unbox first, then widen

var slow = new System.Collections.ArrayList { 1, 2, 3 }; // each int is boxed
var fast = new List<int> { 1, 2, 3 };                    // no boxing
Console.WriteLine($"{back} {right} {slow.Count} {fast.Count}");`,
      },
    ],
    eli5: [
      "Imagine you have a marble, but the rule on the toy shelf is \"only boxes go on the shelf\". To put the marble there, you find a box, put the marble in, and tape it shut. That is boxing. To get the marble back, you open the box, and it only opens for someone asking for a marble, not for a bead.",
      "Boxing a few marbles is fine. But if you box thousands every second, you spend all day folding boxes, and someone has to keep throwing the empty ones away. In .NET, that someone is the garbage collector.",
    ],
    related: [
      { concept: "class-struct", why: "Only value types are boxed; reference types are already heap objects." },
      { concept: "generics", why: "Generics are the main tool for avoiding boxing, because the JIT specializes code for value types." },
      { concept: "equality", why: "Structs without `IEquatable<T>` are boxed when compared through `Equals(object)`." },
      { concept: "collections", why: "Non-generic collections such as `ArrayList` and `Hashtable` box every value-type element." },
      { topic: "Allocation profiling", why: "`dotnet-counters` shows the allocation rate, and allocation profilers show which call sites create boxes." },
    ],
    interview: [
      {
        level: 1,
        question: "What are boxing and unboxing?",
        answer:
          "Boxing converts a value type to `object` or to an interface it implements by allocating a heap object and copying the value into it. Unboxing extracts the value from that object, with a type check. Both cost time, and boxing also creates garbage for the GC to collect.",
      },
      {
        level: 2,
        question: "Why does `(long)obj` throw when `obj` holds a boxed `int`?",
        answer:
          "Unboxing must target the exact type that was boxed (or its nullable form), because the runtime only checks the box's type; it does not run numeric conversions. The cast compiles because unboxing from `object` to `long` is valid in general. The fix is `(long)(int)obj`, or `Convert.ToInt64(obj)` when the boxed type is unknown.",
      },
      {
        level: 2,
        question: "Where does boxing happen implicitly that developers often miss?",
        answer:
          "Common cases are assigning a struct to an `object` or interface variable, passing value types to `object` parameters such as `string.Format(string, object)`, storing them in non-generic collections, comparing structs that don't implement `IEquatable<T>`, and calling `GetType()` on a struct. Each of these allocates a box.",
      },
      {
        level: 2,
        question: "How do generics avoid boxing when you call an interface method on a struct?",
        answer:
          "With a constraint such as `where T : IComparable<T>`, the JIT generates specialized code for each value-type `T` and calls `CompareTo` directly on the value. If the parameter were typed as the interface `IComparable<T>` instead, the struct would be boxed at the call site. The constraint keeps both the type safety and the performance.",
      },
      {
        level: 3,
        question: "How would you find and confirm boxing in a hot path?",
        answer:
          "Start with measurements: `dotnet-counters` for the allocation rate, then an allocation profiler to see which types are allocated where; many boxed `System.Int32` or struct instances are a strong signal. Confirm by inspecting the IL for `box` instructions (for example with ILSpy) and by benchmarking with BenchmarkDotNet's `[MemoryDiagnoser]`, which reports bytes allocated per operation before and after the fix.",
      },
    ],
    docsUrl: `${LEARN}/dotnet/csharp/programming-guide/types/boxing-and-unboxing`,
  },

  // ───────────────────────────── 6. The is keyword ─────────────────────────────
  "is-patterns": {
    definition:
      "The `is` operator tests a value against a pattern (a type, a constant, a property shape, a range, or a list layout) and can declare variables for the parts that match. The same patterns power `switch` expressions.",
    why: [
      "It replaces two-step code, such as `as` followed by a null check, with one type-safe expression that also declares a correctly typed variable.",
      "`is null` and `is not null` always perform a plain reference check and are never affected by an overloaded `==` operator.",
      "Patterns state the shape of data declaratively, so complex conditions with ranges, nested properties, and list shapes stay readable.",
      "In `switch` expressions, the compiler warns when the arms do not cover every possible input.",
    ],
    usage: [
      "Type patterns with a declaration: `if (shape is Circle c) { … }`.",
      "Null checks: `if (user is null) return;` and `if (user is not null) …`.",
      "Property patterns: `order is { Status: OrderStatus.Paid, Total: > 100m }`.",
      "Relational and logical patterns: `statusCode is >= 200 and < 300`, `c is 'a' or 'e' or 'i'`.",
      "List patterns (C# 11): `args is [var command, .. var rest]`.",
      "`switch` expressions that map inputs to results using the same pattern syntax.",
    ],
    examples: [
      {
        caption: "One switch expression using constant, relational, logical, property, type, and list patterns.",
        code: `Console.WriteLine(Describe(150));               // out-of-range number 150
Console.WriteLine(Describe(""));                // empty string
Console.WriteLine(Describe(new[] { 3, 5, 8 })); // array from 3 to 8

static string Describe(object? value) => value switch
{
    null => "nothing",
    int n and (< 0 or > 100) => $"out-of-range number {n}",
    int n => $"number {n}",
    string { Length: 0 } => "empty string",
    string s => $"text '{s}'",
    int[] and [var first, .., var last] => $"array from {first} to {last}",
    _ => value.GetType().Name,
};`,
      },
    ],
    eli5: [
      "Think of a shape-sorting toy, where the star block only fits through the star-shaped hole. Pattern matching asks \"does this thing fit this hole?\" and, if it does, hands you the block already turned the right way.",
      "You can make fancier holes, too: \"a box that is red and heavier than 2 kilos\", or \"a train whose first car is the engine\". Instead of opening the thing up and checking each part by hand, you hold up the hole and see whether it fits.",
    ],
    related: [
      { concept: "equality", why: "`is null` bypasses user-defined `==` operators, which matters for types with custom equality." },
      { concept: "nullable-reference-types", why: "Null patterns feed the compiler's null-state analysis, which removes warnings after the check." },
      { concept: "exceptions", why: "Exception filters often use patterns: `catch (HttpRequestException e) when (e.StatusCode is HttpStatusCode.NotFound)`." },
      { concept: "class-struct", why: "Records support positional patterns, such as `point is (0, 0)`, through their generated `Deconstruct` method." },
      { topic: "Switch expressions and exhaustiveness", why: "The compiler checks whether a `switch` expression covers every input and warns when it does not." },
    ],
    interview: [
      {
        level: 1,
        question: "What is the difference between `is`, `as`, and a cast?",
        answer:
          "A cast throws `InvalidCastException` when the conversion fails. `as` returns `null` instead and works only with reference and nullable types. `is` returns a `bool`, and with a declaration pattern such as `if (o is Customer c)` it also gives you a typed variable, which makes it the preferred modern form.",
      },
      {
        level: 1,
        question: "Why prefer `x is null` over `x == null`?",
        answer:
          "`==` can be overloaded, so a type with a custom equality operator might return the wrong answer for a null check. `is null` is compiled to a plain reference comparison and cannot be overridden. `is not null` is the negated form.",
      },
      {
        level: 2,
        question: "Which C# versions introduced which kinds of patterns?",
        answer:
          "C# 7 added type, declaration, and constant patterns in `is` and `switch` statements. C# 8 added property, positional, and tuple patterns, plus `switch` expressions. C# 9 added relational patterns (`>`, `<=`) and logical patterns (`and`, `or`, `not`); C# 10 added extended property patterns such as `Customer.IsVip: true`; and C# 11 added list patterns with slices (`..`).",
      },
      {
        level: 2,
        question: "What precedence pitfalls exist with `not`, `and`, and `or`?",
        answer:
          "`not` binds most tightly, then `and`, then `or`. So `x is not A or B` means `(not A) or B`, which is true for every `B`. Use parentheses, as in `x is not (A or B)`, whenever you combine `not` with `or`.",
      },
      {
        level: 3,
        question: "How do `switch` expressions handle exhaustiveness, and what happens if no arm matches at runtime?",
        answer:
          "The compiler warns when the arms do not cover every possible input value. If an unmatched value arrives at runtime, the expression throws `SwitchExpressionException`. Enums are a common trap: they can hold undefined numeric values, so even a switch that lists every named member still needs a discard (`_`) arm to be exhaustive.",
      },
    ],
    docsUrl: `${LEARN}/dotnet/csharp/language-reference/operators/patterns`,
  },

  // ───────────────────────────── 7. Func / Action / Predicate ─────────────────────────────
  delegates: {
    definition:
      "A delegate is a type-safe reference to a method. `Func<…, TResult>` returns a value, `Action<…>` returns nothing, and `Predicate<T>` takes one argument and returns a `bool`.",
    why: [
      "Delegates are how .NET passes behavior as data. LINQ, callbacks, events, middleware, retry pipelines, and DI factory registrations all take them.",
      "A lambda compiles either to a delegate (code to run) or to an `Expression<Func<…>>` (code to inspect). That difference decides whether EF Core filters rows in SQL or in memory.",
      "Lambdas capture variables, not values, which explains a classic family of bugs involving loop variables and lifetimes.",
      "Events are built on multicast delegates, and handlers that are never removed are a common source of memory leaks.",
    ],
    usage: [
      "LINQ operators: `orders.Where(o => o.Total > 100).Select(o => o.Id)`.",
      "Callbacks and configuration: `Func<CancellationToken, Task>` for retryable work, and `Action<TOptions>` in calls such as `services.Configure<MyOptions>(o => o.Retries = 3)`.",
      "DI factory registrations: `services.AddSingleton<IClock>(sp => new SystemClock())`.",
      "Minimal API endpoints, which are lambdas: `app.MapGet(\"/orders/{id}\", (int id, AppDb db) => …)`.",
      "`Expression<Func<T, bool>>` for filters that a provider such as EF Core must translate.",
      "Events: `public event EventHandler<OrderPlacedEventArgs>? OrderPlaced;`.",
    ],
    examples: [
      {
        caption: "The three common delegate shapes, and the same lambda compiled two different ways.",
        code: `using System.Linq.Expressions;

Func<int, int, int> add = (a, b) => a + b; // last type argument = return type
Action<string> log = message => Console.WriteLine(message);
Predicate<int> isEven = n => n % 2 == 0;

log($"2 + 3 = {add(2, 3)}"); // 2 + 3 = 5
Console.WriteLine(new List<int> { 1, 2, 3, 4 }.FindAll(isEven).Count); // 2

// The same lambda, compiled two different ways:
Func<Order, bool> inMemory = o => o.Total > 1000;           // IL that runs here
Expression<Func<Order, bool>> forSql = o => o.Total > 1000; // data to translate
Console.WriteLine(forSql); // o => (o.Total > 1000)

public record Order(decimal Total);`,
      },
    ],
    eli5: [
      "A delegate is like writing instructions on a card and handing it to someone to use later. \"When the cake is done, call me\" is an Action: do something, no answer needed. \"Tell me how many candles we need\" is a Func: do something and give an answer back. \"Is this cookie chocolate chip? Yes or no?\" is a Predicate.",
      "The person holding the card doesn't need to know who wrote it; they just follow it when the time comes. There is one twist: sometimes you hand over the card so someone can read it and redo it in their own language. That is an expression tree, and it is how a database gets to run your filter itself.",
    ],
    related: [
      { concept: "linq", why: "LINQ operators take delegates for in-memory queries and expression trees for providers such as EF Core." },
      { concept: "generics", why: "`Func<in T, out TResult>` declares variance, so delegates convert along inheritance lines." },
      { concept: "design-patterns", why: "ASP.NET Core middleware is a chain of `RequestDelegate` instances." },
      { concept: "async-await", why: "Asynchronous callbacks are usually `Func<Task>` or `Func<CancellationToken, Task>`." },
      { topic: "Expression trees", why: "The data-structure form of a lambda that query providers translate to SQL or other languages." },
      { topic: "Events and multicast delegates", why: "`event` restricts a delegate field so outside code can only subscribe and unsubscribe." },
    ],
    interview: [
      {
        level: 1,
        question: "What is the difference between `Func`, `Action`, and `Predicate`?",
        answer:
          "All three are generic delegate types in the `System` namespace. `Func<…, TResult>` returns a value, and its last type argument is the return type. `Action<…>` returns `void`, and `Predicate<T>` takes one argument and returns a `bool`; modern APIs such as LINQ generally use `Func<T, bool>` instead.",
      },
      {
        level: 2,
        question: "Why can passing a `Func<T, bool>` to `Where` on an EF Core `DbSet` load the whole table?",
        answer:
          "`Queryable.Where` takes an `Expression<Func<T, bool>>`, and a `Func` variable cannot be converted to an expression tree. Overload resolution therefore picks `Enumerable.Where`, because `DbSet<T>` also implements `IEnumerable<T>`, and every row is streamed to the client and filtered in memory. Declaring the filter as `Expression<Func<T, bool>>` keeps it translatable to SQL.",
      },
      {
        level: 2,
        question: "What is a closure, and what is the classic loop-capture bug?",
        answer:
          "A closure is a lambda that captures variables from its enclosing scope; it captures the variable itself, not a snapshot of its value. If lambdas created in a `for` loop capture the loop variable `i`, they all see its final value when they run later. `foreach` has declared a fresh variable per iteration since C# 5, but `for` has not, so copy `i` to a local inside the loop.",
      },
      {
        level: 2,
        question: "How do events relate to delegates, and how can they leak memory?",
        answer:
          "An event wraps a multicast delegate so that outside code can only `+=` and `-=` handlers, while only the declaring type can raise it. The publisher holds strong references to every subscriber's handler. If a long-lived publisher, such as a static event or a singleton, is never unsubscribed from, it keeps short-lived subscribers alive indefinitely.",
      },
      {
        level: 3,
        question: "Are two delegate types with the same signature interchangeable?",
        answer:
          "No. Delegate types are nominal, so a `Predicate<int>` does not convert to a `Func<int, bool>` even though the signatures match. You can bridge them with a method group such as `isEven.Invoke`. Variance is the exception that does apply: a `Func<string>` can be assigned to a `Func<object>` because `TResult` is covariant.",
      },
    ],
    docsUrl: `${LEARN}/dotnet/csharp/language-reference/operators/lambda-expressions`,
  },

  // ───────────────────────────── 8. Static vs singleton ─────────────────────────────
  "static-singleton": {
    definition:
      "A static class is a container for members that has no instances. A singleton is one shared instance of an ordinary class, which in modern .NET is usually created and owned by the DI container through `AddSingleton`.",
    why: [
      "The choice decides testability. Code that calls static members or a global `Instance` property cannot substitute a fake, while an injected singleton can be replaced in tests.",
      "Lifetimes cause real bugs: a singleton that captures a scoped service (a captive dependency) holds one `DbContext` or one request's data for the whole application lifetime.",
      "Singletons and static state are shared by every request and thread, so any mutable state in them must be thread-safe.",
      "Static state persists across tests in the same process, which leads to failures that depend on test order.",
    ],
    usage: [
      "Static classes for pure, stateless helpers and extension methods, such as `Math`, `Path`, or a `Slug.From(title)` function.",
      "`AddSingleton` for expensive or shared thread-safe services: caches, `TimeProvider.System`, and clients configured once.",
      "`AddScoped` for per-request state such as `DbContext`, and `AddTransient` for lightweight stateless services.",
      "A `static readonly` field or `Lazy<T>` when a non-DI singleton is genuinely needed, as in `StringComparer.Ordinal`.",
      "Scope validation (on by default in the Development environment) to catch captive dependencies at startup.",
    ],
    examples: [
      {
        caption: "DI-owned lifetimes next to a static helper. `IRateCache`, `RateCache`, and `OrderService` are assumed to be defined elsewhere.",
        code: `var builder = WebApplication.CreateBuilder(args);

// One shared, thread-safe instance for the whole app
builder.Services.AddSingleton(TimeProvider.System);
// DI-owned singleton: injectable, and replaceable in tests
builder.Services.AddSingleton<IRateCache, RateCache>();
// One instance per request
builder.Services.AddScoped<OrderService>();

var app = builder.Build();
app.Run();

// Static: pure and stateless, so there is nothing to fake
public static class Slug
{
    public static string From(string title)
    {
        var words = title.ToLowerInvariant()
            .Split(' ', StringSplitOptions.RemoveEmptyEntries);
        return string.Join('-', words);
    }
}`,
      },
    ],
    eli5: [
      "A static class is like the clock built into the classroom wall. There is only one, everybody reads the same one, and you can't take it down to test it.",
      "A singleton is more like the class's one shared pencil sharpener. There is still only one, but the teacher hands it out, so for a test she can swap in a different sharpener without anyone changing how they ask for it. The risk with anything shared is that everyone uses it at the same time, so it has to cope with a crowd.",
    ],
    related: [
      { concept: "design-patterns", why: "DI lifetimes (singleton, scoped, transient) are the core of how ASP.NET Core composes services." },
      { concept: "hosting-resilience", why: "Hosted services are singletons, so they need `IServiceScopeFactory` to use scoped services." },
      { concept: "extension-methods", why: "Extension methods must be declared in static classes." },
      { concept: "shims", why: "Hard-coded static calls such as `DateTime.Now` are what shims and `TimeProvider` exist to work around." },
      { topic: "Thread safety", why: "Shared singletons need `ConcurrentDictionary`, `Interlocked`, locks, or immutable state." },
    ],
    interview: [
      {
        level: 1,
        question: "What is the difference between a static class and a singleton?",
        answer:
          "A static class has no instance, so it cannot implement an interface, be passed as an argument, or be injected. A singleton is a normal object that happens to exist once: it can implement interfaces, be injected and replaced in tests, be created lazily, and be disposed by the container. Static classes suit pure functions; singletons suit shared services.",
      },
      {
        level: 2,
        question: "What are the three DI lifetimes in ASP.NET Core, and what is a captive dependency?",
        answer:
          "Singleton creates one instance for the application, scoped creates one per scope (typically per HTTP request), and transient creates a new instance every time one is resolved. A captive dependency is a longer-lived service holding a shorter-lived one, such as a singleton that receives a scoped `DbContext` and keeps it forever. Scope validation detects this and throws at startup in the Development environment.",
      },
      {
        level: 2,
        question: "How do you implement a thread-safe singleton without a DI container?",
        answer:
          "Use a `static readonly` field initialized inline, which the runtime initializes exactly once in a thread-safe way, or a `Lazy<T>`, whose default mode is thread-safe. Avoid hand-written double-checked locking. In application code, prefer registering the type with `AddSingleton` so it stays injectable.",
      },
      {
        level: 2,
        question: "How do you use a scoped service from inside a singleton?",
        answer:
          "Inject `IServiceScopeFactory`, create a scope for each unit of work, resolve the scoped service from that scope, and dispose the scope when the work finishes. Alternatively, reconsider the lifetimes: the consumer may not need to be a singleton at all.",
      },
      {
        level: 3,
        question: "When is static state acceptable, and what problems does it cause in tests?",
        answer:
          "Static state is fine when it is immutable or deterministic, such as constants, lookup tables, and pure helper functions. Mutable static state is shared by every test running in the same process, so tests can pass or fail depending on execution order and cannot run safely in parallel. It also hides dependencies: nothing in a constructor signature reveals that a class reads global state.",
      },
    ],
    docsUrl: `${LEARN}/dotnet/core/extensions/dependency-injection-guidelines`,
  },

  // ───────────────────────────── 9. Shims ─────────────────────────────
  shims: {
    definition:
      "A shim is a thin compatibility layer that supplies or intercepts an API. In .NET the term covers polyfill packages that backport newer types to older frameworks and Microsoft Fakes shims that redirect calls to static or non-virtual methods during tests.",
    why: [
      "Libraries often target `netstandard2.0` or .NET Framework but still want newer types such as `IAsyncEnumerable<T>` or `TimeProvider`. Polyfills make that possible without dropping older consumers.",
      "Legacy code often calls statics such as `DateTime.Now` or `File.ReadAllText` directly; shims let you put tests around it before refactoring.",
      "Shims have costs: Microsoft Fakes requires Visual Studio Enterprise, and redirecting calls at runtime is more brittle than designing for injection.",
      "Knowing the alternatives, such as injecting `TimeProvider` and testing with `FakeTimeProvider`, is how new code avoids needing shims at all.",
    ],
    usage: [
      "Polyfill packages such as Microsoft.Bcl.AsyncInterfaces, Microsoft.Bcl.TimeProvider, and System.Memory (which backports `Span<T>` to netstandard2.0).",
      "Microsoft Fakes: generate a Fakes assembly from a `.fakes` file, then assign `ShimDateTime.NowGet` inside a `ShimsContext.Create()` scope.",
      "Characterization tests for legacy code: shim the hard-coded dependencies, capture current behavior, then refactor toward injected abstractions.",
      "Multi-targeted libraries that reference a polyfill only for older target frameworks.",
      "Commercial tools such as Typemock Isolator and Telerik JustMock, which offer similar call redirection.",
    ],
    examples: [
      {
        caption:
          "A Microsoft Fakes shim (Visual Studio Enterprise only) puts a test around legacy code that reads the static clock.",
        code: `using Microsoft.QualityTools.Testing.Fakes;
using Microsoft.VisualStudio.TestTools.UnitTesting;

public static class LegacyCalendar
{
    // Hard-coded static dependency: nothing can be injected
    public static bool IsMillennium() => DateTime.Now.Year == 2000;
}

[TestClass]
public class LegacyCalendarTests
{
    [TestMethod]
    public void IsMillennium_OnJanuary1st2000_ReturnsTrue()
    {
        using (ShimsContext.Create()) // detours apply only inside this scope
        {
            System.Fakes.ShimDateTime.NowGet = () => new DateTime(2000, 1, 1);
            Assert.IsTrue(LegacyCalendar.IsMillennium());
        }
    }
}`,
      },
      {
        caption:
          "The design that avoids shims: inject `TimeProvider` and use `FakeTimeProvider` from the Microsoft.Extensions.TimeProvider.Testing package.",
        code: `using Microsoft.Extensions.Time.Testing;
using Microsoft.VisualStudio.TestTools.UnitTesting;

public class TrialService(TimeProvider time)
{
    public bool IsExpired(DateTimeOffset startedAt) =>
        time.GetUtcNow() - startedAt > TimeSpan.FromDays(14);
}

[TestClass]
public class TrialServiceTests
{
    [TestMethod]
    public void IsExpired_AfterFifteenDays_ReturnsTrue()
    {
        var start = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero);
        var clock = new FakeTimeProvider(start);
        var service = new TrialService(clock);

        clock.Advance(TimeSpan.FromDays(15));

        Assert.IsTrue(service.IsExpired(start));
    }
}`,
      },
    ],
    eli5: [
      "Imagine your toy only takes AA batteries, but you only have AAA batteries. A little plastic sleeve that makes the AAA battery fit is a shim: it sits in between so two things that don't quite match can work together.",
      "In programming, shims do two jobs. Some fill in pieces an older system is missing, like giving an old toy a part from the new model. Others are a testing trick: when a program asks \"what time is it?\", the shim quietly answers \"midnight on New Year's Day, 2000\", so you can check what happens then without waiting for that date.",
    ],
    related: [
      { concept: "bcl", why: "The Microsoft.Bcl.* packages are polyfills that backport newer BCL types." },
      { concept: "static-singleton", why: "Hard-coded static calls are the reason shims are needed; injected dependencies make them unnecessary." },
      { concept: "design-patterns", why: "Dependency injection is the design-time alternative to runtime call redirection." },
      { topic: "Test doubles", why: "Stubs, mocks, fakes, and spies are the injection-based relatives of shims." },
      { topic: "Seams", why: "Michael Feathers' term (from Working Effectively with Legacy Code) for places where behavior can be changed without editing the code under test." },
      { topic: "Multi-targeting", why: "`<TargetFrameworks>net8.0;netstandard2.0</TargetFrameworks>` with conditional package references and `#if NET8_0_OR_GREATER`." },
    ],
    interview: [
      {
        level: 1,
        question: "What is a shim, and how does it differ from an adapter?",
        answer:
          "A shim is a compatibility layer that supplies missing functionality or intercepts calls so code can run against an API that differs from what it expects. An adapter is a specific design pattern: a class that wraps one object to present a different interface to its clients. Adapters are sometimes informally called shims, but a shim does not have to wrap an object at all.",
      },
      {
        level: 2,
        question: "How would you test code that calls `DateTime.Now` directly?",
        answer:
          "The best fix is to refactor the code to depend on `TimeProvider` (built into .NET 8 and later) and use `FakeTimeProvider` in tests, which also makes timers and delays controllable. When you cannot change the code yet, a runtime shim such as Microsoft Fakes or a commercial isolation tool can redirect the call. Wrapping the clock in your own `IClock` interface is the older equivalent of `TimeProvider`.",
      },
      {
        level: 2,
        question: "What is a polyfill package, and when would a library use one?",
        answer:
          "A polyfill package provides types that newer frameworks include natively, so code targeting an older framework can use the same API. A library targeting both `netstandard2.0` and `net8.0` might reference Microsoft.Bcl.AsyncInterfaces only for the `netstandard2.0` target, using a conditional `PackageReference`. On the newer framework, the built-in types are used instead.",
      },
      {
        level: 2,
        question: "What are the downsides of Microsoft Fakes shims?",
        answer:
          "They require Visual Studio Enterprise, which limits who can run the tests. They couple tests to implementation details, such as exactly which static method the code calls, so refactoring breaks tests. They also make it easy to postpone fixing the design problem, the hard-coded dependency, that made shims necessary.",
      },
      {
        level: 3,
        question: "Define a stub, a mock, a fake, a spy, and a shim.",
        answer:
          "A stub returns canned answers. A mock is set up with expectations and verifies that specific calls were made. A fake is a working lightweight implementation, such as an in-memory repository or `FakeTimeProvider`, and a spy records calls for later assertions. A shim redirects calls to existing code at runtime, without the code under test accepting any injected dependency.",
      },
    ],
    docsUrl: `${LEARN}/visualstudio/test/isolating-code-under-test-with-microsoft-fakes`,
  },

  // ───────────────────────────── 10. Extension methods ─────────────────────────────
  "extension-methods": {
    definition:
      "Extension methods are static methods that the compiler lets you call with instance syntax, such as `text.IsBlank()`. They add behavior to types you don't own without inheritance or modification.",
    why: [
      "LINQ is built from them: `Where`, `Select`, and the other operators are extension methods on `IEnumerable<T>` and `IQueryable<T>`.",
      "ASP.NET Core setup is written with them (`services.AddDbContext`, `app.UseExceptionHandler`), so you read and write them constantly.",
      "They bind statically at compile time: no polymorphism, instance methods always win, and the receiver can be `null`. Misunderstanding this causes surprises.",
      "C# 14 extension blocks add extension properties and static extension members, which widens what libraries can offer.",
    ],
    usage: [
      "`IServiceCollection` helpers such as `services.AddOrdering()` that group one feature's DI registrations.",
      "Convenience methods on sealed or BCL types: `value.IsBlank()`, `date.ToIsoString()`.",
      "Shared behavior for every implementation of an interface, without a common base class.",
      "Mapping helpers such as `order.ToDto()` as a lightweight alternative to mapping libraries.",
      "C# 14 extension blocks for extension properties: `extension<T>(IEnumerable<T> source) { public bool IsEmpty => !source.Any(); }`.",
    ],
    examples: [
      {
        caption: "A DI registration helper and a null-tolerant string helper. `IOrderService` and `OrderService` are assumed to be defined elsewhere.",
        code: `using Microsoft.Extensions.DependencyInjection;

public static class OrderingServiceCollectionExtensions
{
    // Called as builder.Services.AddOrdering();
    public static IServiceCollection AddOrdering(this IServiceCollection services)
    {
        services.AddScoped<IOrderService, OrderService>();
        services.AddSingleton(TimeProvider.System);
        return services;   // returning the receiver enables chaining
    }
}

public static class StringExtensions
{
    public static bool IsBlank(this string? value) =>
        string.IsNullOrWhiteSpace(value);
}`,
      },
      {
        caption: "C# 14 (.NET 10) extension blocks can declare extension properties.",
        code: `public static class EnumerableExtensions
{
    extension<T>(IEnumerable<T> source)
    {
        public bool IsEmpty => !source.Any();   // used as items.IsEmpty
    }
}`,
      },
    ],
    eli5: [
      "Imagine you love your bike but wish it had a bell. You can't redesign the bike, so you clip a bell onto the handlebar. Now you ring it as if it came with the bike.",
      "Extension methods are clip-on bells for code: you add handy abilities to types you didn't build, like teaching every piece of text to answer \"are you blank?\". The bell is still a separate part, though. If the bike maker later adds a built-in bell, everyone starts ringing that one instead of yours.",
    ],
    related: [
      { concept: "linq", why: "LINQ's query operators are implemented as extension methods." },
      { concept: "static-singleton", why: "Extension methods live in static classes and share their trade-offs: no state to inject or replace." },
      { concept: "design-patterns", why: "The `Add*` and `Use*` registration style for DI and middleware is a convention built on extension methods." },
      { concept: "nullable-reference-types", why: "Annotating the receiver as `string?` documents that an extension accepts `null`." },
      { topic: "Default interface methods", why: "Another way to add behavior to interfaces, but they require owning the interface and are virtual." },
    ],
    interview: [
      {
        level: 1,
        question: "How do extension methods work under the hood?",
        answer:
          "An extension method is a static method in a static, non-generic, top-level class whose first parameter has the `this` modifier. The compiler rewrites `x.M()` as `Extensions.M(x)` when no applicable instance method exists and the extension's namespace is in scope. Nothing about the extended type changes at runtime.",
      },
      {
        level: 2,
        question: "What happens if a type later adds an instance method with the same signature as your extension?",
        answer:
          "The instance method wins as soon as callers recompile, because the compiler only considers extension methods when no applicable instance method is found. There is no error or warning; calls silently switch to the new method. This is a real risk when extending types from libraries you upgrade.",
      },
      {
        level: 2,
        question: "Can you call an extension method on a `null` reference? Should you?",
        answer:
          "Yes. The call compiles to a static call with `null` as the first argument, so no `NullReferenceException` occurs at the call site. That is useful for helpers whose meaning includes `null`, such as `IsBlank()`. Other extensions should validate the receiver, for example with `ArgumentNullException.ThrowIfNull`.",
      },
      {
        level: 2,
        question: "Are extension methods polymorphic?",
        answer:
          "No. The overload is chosen at compile time from the receiver's static type, so an `Animal` variable holding a `Dog` calls the `Animal` extension. For runtime dispatch, use virtual methods or interfaces, or use pattern matching inside the extension.",
      },
      {
        level: 3,
        question: "What do C# 14 extension blocks add over classic extension methods?",
        answer:
          "Extension blocks (`extension(Receiver r) { … }` inside a static class) can declare extension properties and static extension members, not only instance-style methods. They also group all members for one receiver type in one place. Classic `this`-parameter methods remain supported, so existing code does not need to change.",
      },
    ],
    docsUrl: `${LEARN}/dotnet/csharp/programming-guide/classes-and-structs/extension-methods`,
  },

  // ───────────────────────────── 11. BCL ─────────────────────────────
  bcl: {
    definition:
      "The Base Class Library is the core set of `System.*` types that every .NET app gets: primitives, collections, I/O, threading, text, and networking. It ships with the runtime as part of the `Microsoft.NETCore.App` shared framework.",
    why: [
      "Knowing what the BCL already provides avoids unnecessary dependencies; `System.Text.Json`, `Channel<T>`, `PeriodicTimer`, `FrozenDictionary`, and `TimeProvider` are all built in.",
      "The distinctions between the runtime, the BCL, the SDK, and the ASP.NET Core shared framework explain deployment: what to install on servers and what a self-contained app bundles.",
      "Library authors choose target frameworks (`netstandard2.0`, `net8.0`) based on which APIs exist where, and use polyfills to fill gaps.",
      "Upgrades, support lifecycles, and breaking changes are managed at the framework level, so teams plan them around .NET releases.",
    ],
    usage: [
      "Collections and queries: `System.Collections.Generic`, `.Concurrent`, `.Frozen`, `.Immutable`, and `System.Linq`.",
      "I/O and text: `File`, `Stream`, `Path`, `System.Text.Json`, `StringBuilder`, and `Regex`.",
      "Concurrency: `Task`, `Parallel`, `Channel<T>`, `SemaphoreSlim`, and `PeriodicTimer`.",
      "Networking and diagnostics: `HttpClient`, `System.Net.Sockets`, `Stopwatch`, `Activity`, and `System.Diagnostics.Metrics`.",
      "Target framework selection in the project file, for example `<TargetFramework>net10.0</TargetFramework>` or multi-targeting with `<TargetFrameworks>`.",
    ],
    examples: [
      {
        caption: "Everything here ships in the base framework; no NuGet packages are required.",
        code: `using System.Collections.Frozen;
using System.Text.Json;
using System.Threading.Channels;

// Read-optimized lookup table
var countries = new Dictionary<string, string>
{
    ["US"] = "United States",
    ["FR"] = "France",
}.ToFrozenDictionary();

// Async producer/consumer queue
var channel = Channel.CreateBounded<string>(capacity: 100);
await channel.Writer.WriteAsync("FR");
channel.Writer.Complete();

await foreach (var code in channel.Reader.ReadAllAsync())
{
    var json = JsonSerializer.Serialize(new { code, name = countries[code] });
    Console.WriteLine(json); // {"code":"FR","name":"France"}
}

// Prints System.Private.CoreLib: where string lives at runtime
Console.WriteLine(typeof(string).Assembly.GetName().Name);`,
      },
    ],
    eli5: [
      "Think of the BCL as the toolbox that comes free with every new house: hammers, screwdrivers, a measuring tape, the basics everyone needs, already in the garage.",
      "The runtime is the house's electricity and plumbing, which make everything work. The SDK is the builder's workshop: you need it to build the house, but not to live in it. Before buying a fancy new tool, check the garage first; the free toolbox has grown a lot over the years.",
    ],
    related: [
      { concept: "shims", why: "Microsoft.Bcl.* packages backport newer BCL types to older target frameworks." },
      { concept: "collections", why: "The collection namespaces are among the most used parts of the BCL." },
      { concept: "span-memory", why: "`Span<T>` is a BCL type, and many BCL APIs have span-based overloads." },
      { concept: "hosting-resilience", why: "The Generic Host comes from Microsoft.Extensions.*, which is not part of the BCL." },
      { topic: "Target framework monikers and .NET Standard", why: "How a project declares which runtimes and API sets it supports." },
      { topic: "Deployment models", why: "Framework-dependent, self-contained, and Native AOT deployments differ in what they bundle." },
    ],
    interview: [
      {
        level: 1,
        question: "What is the difference between the runtime, the BCL, and the SDK?",
        answer:
          "The runtime (CoreCLR) executes code: it provides the JIT compiler, the garbage collector, and the type system. The BCL is the foundational class library that every app uses. The SDK adds build tooling such as the compilers, MSBuild, and the `dotnet` CLI, and it is needed only on machines that build code, not on production servers.",
      },
      {
        level: 1,
        question: "What is .NET Standard, and is it still relevant?",
        answer:
          ".NET Standard is a specification of APIs that every compatible .NET implementation provides. `netstandard2.0` remains relevant for libraries that must also run on .NET Framework, which does not support later versions. Microsoft has said no new .NET Standard versions will follow 2.1, so new code that targets only modern .NET should target versions such as `net8.0` directly.",
      },
      {
        level: 2,
        question: "Are `Microsoft.Extensions.*` libraries (DI, logging, configuration) part of the BCL?",
        answer:
          "No. They are separate packages. ASP.NET Core apps receive them through the `Microsoft.AspNetCore.App` shared framework, while console and worker apps reference them as NuGet packages, such as Microsoft.Extensions.Hosting. The BCL itself is the `System.*` core in `Microsoft.NETCore.App`.",
      },
      {
        level: 2,
        question: "Compare framework-dependent, self-contained, and Native AOT deployment.",
        answer:
          "A framework-dependent app is small but requires a compatible runtime installed on the target machine. A self-contained app bundles the runtime and libraries, so nothing needs to be installed, at the cost of a larger output. Native AOT compiles the app ahead of time to native code for fast startup and lower memory use, but it restricts dynamic features such as unrestricted reflection and runtime code generation.",
      },
      {
        level: 3,
        question: "Why does `typeof(string).Assembly` report `System.Private.CoreLib` when your project compiled against `System.Runtime`?",
        answer:
          "Projects compile against reference assemblies such as `System.Runtime`, which describe the public API without implementations. At runtime, type forwarding sends those types to their real implementation, and the most fundamental types live in `System.Private.CoreLib`, which is tightly coupled to the runtime. This separation lets the implementation change without breaking compiled code.",
      },
    ],
    docsUrl: `${LEARN}/dotnet/standard/framework-libraries`,
  },

  // ───────────────────────────── 12. .NET design patterns ─────────────────────────────
  "design-patterns": {
    definition:
      "Modern .NET builds several design patterns into the framework itself: dependency injection, the Options pattern, the middleware pipeline, `IHttpClientFactory`, and keyed services. Knowing them means knowing how ASP.NET Core applications are wired together.",
    why: [
      "Every ASP.NET Core and worker app is composed through DI and middleware. Misunderstood lifetimes or ordering cause bugs that often appear only under load or in production.",
      "The Options pattern separates configuration from code and supports validation at startup and reloading at runtime.",
      "`IHttpClientFactory` exists because the obvious approach, creating `new HttpClient()` per call, exhausts sockets under load.",
      "MediatR and AutoMapper moved to commercial licensing for new versions in 2025, prompting teams to reassess what the built-in patterns already cover.",
    ],
    usage: [
      "Constructor injection with a deliberately chosen lifetime for each service, plus `[FromKeyedServices(\"sms\")]` to pick among implementations (keyed services, .NET 8).",
      "Options with validation: `services.AddOptions<SmtpOptions>().BindConfiguration(\"Smtp\").ValidateDataAnnotations().ValidateOnStart();`.",
      "Middleware ordering: exception handling first, authentication before authorization, endpoints last.",
      "Typed clients via `AddHttpClient<WeatherClient>()`, combined with `AddStandardResilienceHandler()` from Microsoft.Extensions.Http.Resilience.",
      "Decorators, strategies, and factories expressed as DI registrations instead of hand-wired object graphs.",
    ],
    examples: [
      {
        caption:
          "Options, typed HTTP clients, keyed services, and middleware in one Program.cs. `SmtpOptions`, `WeatherClient`, `INotifier`, and the notifier classes are assumed to be defined elsewhere.",
        code: `var builder = WebApplication.CreateBuilder(args);

// Options pattern: an appsettings.json section becomes a validated, typed class
builder.Services.AddOptions<SmtpOptions>()
    .BindConfiguration("Smtp")
    .ValidateDataAnnotations()
    .ValidateOnStart(); // fail fast on invalid configuration

// Typed client: pooled handlers plus retries, timeouts, and a circuit breaker
var weatherApi = new Uri("https://api.example.com/");
builder.Services.AddHttpClient<WeatherClient>(c => c.BaseAddress = weatherApi)
    .AddStandardResilienceHandler();

// Keyed services: two implementations of one interface
builder.Services.AddKeyedSingleton<INotifier, SmsNotifier>("sms");
builder.Services.AddKeyedSingleton<INotifier, EmailNotifier>("email");

var app = builder.Build();
app.UseExceptionHandler("/error"); // middleware runs in registration order
app.UseHttpsRedirection();
app.MapPost("/alerts", ([FromKeyedServices("sms")] INotifier notifier) =>
    notifier.SendAsync("Disk almost full"));
app.Run();`,
      },
    ],
    eli5: [
      "Building a big app is like running a restaurant kitchen. Dependency injection is the supply room: cooks don't buy their own knives; they ask for \"a knife\" and get one that is ready to use. The Options pattern is the recipe card pinned on the wall, so changing the amount of salt doesn't mean retraining the cook.",
      "Middleware is the line every plate travels down (prep, cook, garnish, inspect) in a fixed order. And the HTTP client factory is the delivery van pool: instead of buying a new van for every delivery and abandoning it at the curb, you borrow one and bring it back.",
    ],
    related: [
      { concept: "static-singleton", why: "DI lifetimes and captive dependencies are the most common source of DI bugs." },
      { concept: "architecture", why: "CQRS, Decorator, and Repository are usually implemented through DI registrations." },
      { concept: "hosting-resilience", why: "The resilience handler on `IHttpClientFactory` clients is built on Polly v8." },
      { concept: "delegates", why: "Middleware components are delegates that receive the next delegate in the chain." },
      { topic: "Composition root", why: "The single place, usually Program.cs, where the application's object graph is assembled." },
      { topic: "Dependency inversion principle", why: "The SOLID principle that dependency injection puts into practice." },
    ],
    interview: [
      {
        level: 1,
        question: "What problem does dependency injection solve?",
        answer:
          "It separates using a dependency from creating it. Classes declare what they need in their constructors, and a composition root decides which implementations to provide. That makes code testable with fakes, lets the container manage lifetimes and disposal, and makes dependencies visible in signatures instead of hidden in global state.",
      },
      {
        level: 2,
        question: "Compare `IOptions<T>`, `IOptionsSnapshot<T>`, and `IOptionsMonitor<T>`.",
        answer:
          "`IOptions<T>` is a singleton computed once, so it never reflects configuration changes. `IOptionsSnapshot<T>` is scoped and recomputed per request, so it reflects reloads but cannot be injected into singletons. `IOptionsMonitor<T>` is a singleton that always returns the current value and raises `OnChange` when configuration reloads.",
      },
      {
        level: 2,
        question: "Why is creating `new HttpClient()` per request a problem, and why is one static `HttpClient` not a complete fix?",
        answer:
          "Disposing a client closes its connections, which then linger in the TIME_WAIT state, so creating one per request can exhaust sockets under load. A single long-lived client avoids that, but by default it keeps connections open indefinitely and can miss DNS changes. `IHttpClientFactory` pools and periodically recycles handlers to fix both; a static client with `SocketsHttpHandler.PooledConnectionLifetime` set is the other accepted solution.",
      },
      {
        level: 2,
        question: "How does the middleware pipeline execute, and why does order matter?",
        answer:
          "Each middleware runs its code before calling `next`, the rest of the pipeline executes, and then control returns through each middleware in reverse order. Any component can short-circuit by not calling `next`. Order matters because a component only sees what earlier components did: the exception handler must come first to catch everything, and authentication must run before authorization.",
      },
      {
        level: 3,
        question: "When would you use keyed services instead of `IEnumerable<T>` injection or a factory?",
        answer:
          "Use keyed services when the consumer knows which implementation it needs, from code or configuration. Inject `IEnumerable<T>` when the consumer needs all implementations, such as a chain of validators. Use a factory or strategy selector when the choice depends on runtime data such as the tenant or request; you can still resolve keyed services by key at runtime inside it.",
      },
    ],
    docsUrl: `${LEARN}/dotnet/core/extensions/dependency-injection`,
  },

  // ───────────────────────────── 13. async / await ─────────────────────────────
  "async-await": {
    definition:
      "`async` and `await` let you write non-blocking code that reads like sequential code. The compiler turns the method into a state machine that pauses at each `await` on an incomplete task and resumes when that task completes.",
    why: [
      "Scalability: while a request waits on a database, an HTTP call, or the disk, no thread is blocked, so a server handles far more concurrent requests with the same thread pool.",
      "Responsiveness: desktop and mobile apps keep the UI thread free during long operations.",
      "Misuse causes serious production incidents: deadlocks and thread-pool starvation from blocking on tasks, crashes from `async void`, and lost exceptions from forgotten awaits.",
      "Nearly every modern .NET API, including EF Core, `HttpClient`, ASP.NET Core, and the Azure SDKs, is asynchronous first.",
    ],
    usage: [
      "Async all the way down: endpoint → service → EF Core or `HttpClient` call, each returning `Task` or `Task<T>` and awaited.",
      "Pass a `CancellationToken` through every layer, starting from `HttpContext.RequestAborted` or the hosted service's stopping token, so abandoned work stops.",
      "Start independent operations first and await them together with `Task.WhenAll`; use `Task.WhenAny` for first-wins or timeout logic.",
      "Use `ConfigureAwait(false)` in general-purpose library code; ASP.NET Core application code has no synchronization context, so it rarely needs it.",
      "Stream results with `IAsyncEnumerable<T>` and `await foreach`; consider `ValueTask<T>` for hot paths that usually complete synchronously.",
    ],
    examples: [
      {
        caption: "Independent calls run concurrently, so latency is close to the slowest call rather than the sum. The API interfaces and records are assumed to be defined elsewhere.",
        code: `public class DashboardService(
    IUserApi users, IOrderApi orders, IBillingApi billing)
{
    public async Task<Dashboard> GetAsync(int userId, CancellationToken ct)
    {
        // Start all three before awaiting any of them.
        Task<User> userTask = users.GetAsync(userId, ct);
        Task<IReadOnlyList<Order>> ordersTask = orders.GetRecentAsync(userId, ct);
        Task<decimal> balanceTask = billing.GetBalanceAsync(userId, ct);

        await Task.WhenAll(userTask, ordersTask, balanceTask);

        return new Dashboard(await userTask, await ordersTask, await balanceTask);
    }
}`,
      },
    ],
    eli5: [
      "Imagine you put cookies in the oven. You could stand and stare at the oven for twelve minutes; that is blocking. Or you could set a timer, go wash the dishes, and come back when it rings; that is `await`.",
      "You are still doing things in order: the cookies come out only after they bake. But while you wait, your hands are free for other work. A web server is a kitchen with a few cooks and lots of orders. If every cook stood staring at an oven, the orders would pile up at the door.",
    ],
    related: [
      { concept: "disposal", why: "`await using` and `IAsyncDisposable` make cleanup asynchronous too." },
      { concept: "hosting-resilience", why: "Background services run async loops that must honor their stopping token." },
      { concept: "span-memory", why: "`Span<T>` cannot be kept across an `await`, so async code stores `Memory<T>` instead." },
      { concept: "exceptions", why: "Exceptions in tasks surface when awaited, and `Task.WhenAll` can collect several." },
      { topic: "Synchronization context", why: "Explains why blocking on tasks deadlocks UI apps and why `ConfigureAwait(false)` exists." },
      { topic: "Thread-pool starvation", why: "What happens when synchronous blocking on async code ties up pool threads under load." },
    ],
    interview: [
      {
        level: 1,
        question: "What does `await` actually do?",
        answer:
          "If the awaited task has already completed, execution simply continues. Otherwise, the method registers the rest of itself as a continuation, returns an incomplete task to its caller, and frees the thread. When the task completes, the continuation runs, on the captured synchronization context if there is one.",
      },
      {
        level: 2,
        question: "Why is `async void` dangerous, and when is it acceptable?",
        answer:
          "An `async void` method returns nothing the caller can await, so the caller cannot know when it finishes or observe its exceptions. An exception thrown inside it is raised on the synchronization context or the thread pool, where it typically crashes the process. It is acceptable only for event handlers, whose signatures require `void`.",
      },
      {
        level: 2,
        question: "What causes the classic `.Result` or `.Wait()` deadlock?",
        answer:
          "Under a single-threaded synchronization context, such as a UI thread or classic ASP.NET, the calling thread blocks while waiting for the task. The task's continuation needs that same thread to resume, so neither can proceed. ASP.NET Core has no synchronization context, so it does not deadlock this way, but blocking still wastes threads and can starve the pool under load.",
      },
      {
        level: 2,
        question: "Is asynchronous code the same as multithreaded or parallel code?",
        answer:
          "No. Asynchrony is about not blocking while waiting; a pending I/O operation occupies no thread at all, a point Stephen Cleary's post \"There Is No Thread\" explains well. Parallelism is about using several threads at once for CPU-bound work, with tools such as `Parallel.ForEachAsync` or `Task.Run`. The two can be combined, but they solve different problems.",
      },
      {
        level: 3,
        question: "When would you return `ValueTask<T>` instead of `Task<T>`?",
        answer:
          "When a method is on a hot path and often completes synchronously, for example by returning a cached value, so avoiding a `Task<T>` allocation matters. `ValueTask<T>` comes with rules: await it only once, and never await it concurrently; call `.AsTask()` if you need either. For most code, `Task<T>` remains the right default.",
      },
    ],
    docsUrl: `${LEARN}/dotnet/csharp/asynchronous-programming/`,
  },

  // ───────────────────────────── 14. LINQ ─────────────────────────────
  linq: {
    definition:
      "Language Integrated Query (LINQ) is a set of composable query operators (`Where`, `Select`, `GroupBy`, `OrderBy`, and others) that work over in-memory sequences (`IEnumerable<T>`) and, through providers such as EF Core, over remote data (`IQueryable<T>`).",
    why: [
      "It is the default way to filter, project, group, and aggregate data in C#, so it appears in nearly every codebase.",
      "Deferred execution is powerful but surprising: a query runs only when enumerated, runs again each time it is enumerated, and sees later changes to its source.",
      "With EF Core, whether a query stays `IQueryable` (translated to SQL) or becomes `IEnumerable` (run in memory) decides whether you fetch ten rows or ten million.",
      "Declarative queries remove whole classes of loop bugs, but careless chains in hot paths allocate and re-enumerate more than a plain loop would.",
    ],
    usage: [
      "Filtering and projection: `orders.Where(o => o.IsPaid).Select(o => new OrderDto(o.Id, o.Total))`.",
      "Grouping and aggregation: `GroupBy`, `Sum`, `Count`, `Max`, `ToDictionary`.",
      "EF Core: compose filters on `IQueryable`, project to DTOs with `Select`, and execute once with `ToListAsync()`.",
      "Choosing operators by intent: `Any` for existence, `FirstOrDefault` for the first match, `SingleOrDefault` when more than one match is a bug.",
      "Materializing with `ToList()` or `ToArray()` when results are reused or the source may change.",
    ],
    examples: [
      {
        caption: "An EF Core query is translated to one SQL statement; an in-memory query is materialized once for reuse. `db`, `since`, `ct`, and `customers` are assumed to be in scope.",
        code: `// EF Core: everything up to ToListAsync becomes a single SQL query.
var topCustomers = await db.Orders
    .Where(o => o.PlacedAt >= since)                         // WHERE
    .GroupBy(o => o.CustomerId)                              // GROUP BY
    .Select(g => new { CustomerId = g.Key, Total = g.Sum(o => o.Total) })
    .OrderByDescending(x => x.Total)                         // ORDER BY
    .Take(10)                                                // TOP / LIMIT
    .ToListAsync(ct);                                        // runs here, once

// In memory: deferred until enumerated, so materialize a result you reuse.
var activeNames = customers.Where(c => c.IsActive).Select(c => c.Name).ToList();`,
      },
    ],
    eli5: [
      "LINQ is like handing a librarian a note: \"Find books about dinosaurs, only the ones with pictures, sorted by title, and just the first five.\" Writing the note doesn't fetch any books. The librarian only starts looking when you say \"go\", and if you say \"go\" twice, they search twice.",
      "Some librarians, like databases, are especially clever: they read the whole note and walk straight to the right shelf, instead of carrying every book in the building to your table for you to sort through yourself.",
    ],
    related: [
      { concept: "delegates", why: "In-memory LINQ takes `Func` delegates; `IQueryable` LINQ takes expression trees." },
      { concept: "extension-methods", why: "The LINQ operators are extension methods on `IEnumerable<T>` and `IQueryable<T>`." },
      { concept: "collections", why: "LINQ queries run over collections and often end by creating one (`ToList`, `ToDictionary`)." },
      { concept: "async-await", why: "EF Core executes queries asynchronously with `ToListAsync`, and `IAsyncEnumerable<T>` streams results." },
      { topic: "Iterators and `yield return`", why: "The mechanism behind deferred execution in LINQ to Objects." },
      { topic: "The N+1 query problem", why: "A classic ORM performance bug that careful projection and `Include` avoid." },
    ],
    interview: [
      {
        level: 1,
        question: "What is deferred execution in LINQ?",
        answer:
          "Most operators, such as `Where` and `Select`, only describe the query; nothing runs until the result is enumerated by `foreach`, `ToList`, `Count`, `First`, and similar calls. The query runs again on every enumeration and sees the source's current contents. Operators that return a single value or a materialized collection execute immediately.",
      },
      {
        level: 1,
        question: "What is the difference between `First`, `FirstOrDefault`, `Single`, and `SingleOrDefault`?",
        answer:
          "`First` returns the first match and throws if there is none; `FirstOrDefault` returns the default value instead. `Single` requires exactly one match and throws if there are zero or several; `SingleOrDefault` returns the default when there are zero but still throws when there are several. Use `Single` when a duplicate would indicate a data bug you want to detect.",
      },
      {
        level: 2,
        question: "What is the difference between `IEnumerable<T>` and `IQueryable<T>`?",
        answer:
          "`Enumerable` operators take `Func` delegates and run in your process. `Queryable` operators take `Expression<Func<…>>` trees that a provider, such as EF Core, translates into another language like SQL. Both are deferred; the difference is where the query runs, which is why calling `AsEnumerable()` too early moves filtering out of the database.",
      },
      {
        level: 2,
        question: "What is the N+1 query problem, and how do you avoid it with EF Core?",
        answer:
          "It occurs when code loads a list with one query and then issues an additional query per item to load related data, for example through lazy loading inside a loop. Avoid it by projecting exactly what you need with `Select`, by eager loading with `Include`, or, for large object graphs, with `AsSplitQuery()`. Logging the generated SQL makes the problem easy to spot.",
      },
      {
        level: 3,
        question: "When would you avoid LINQ?",
        answer:
          "In hot paths where per-call allocations of delegates and enumerators matter, a plain loop or span-based code can be measurably faster, although recent .NET versions have optimized many LINQ operators. Avoid LINQ for logic with side effects, which reads poorly in a declarative chain. Decide with a profiler or BenchmarkDotNet rather than by habit.",
      },
    ],
    docsUrl: `${LEARN}/dotnet/csharp/linq/`,
  },

  // ───────────────────────────── 15. Nullable reference types ─────────────────────────────
  "nullable-reference-types": {
    definition:
      "Nullable reference types (C# 8) are a compile-time annotation system: `string` means \"should never be null\", `string?` means \"may be null\", and the compiler warns when code might dereference or assign `null` incorrectly.",
    why: [
      "`NullReferenceException` is one of the most common runtime failures, and nullable analysis catches many of its causes at compile time.",
      "Signatures document intent: callers know whether they must handle `null` without reading the implementation.",
      "It is static analysis only, with no runtime checks, so public APIs still need guard clauses, and the `!` operator can hide real bugs.",
      "New .NET project templates have enabled it by default since .NET 6, so it is the norm in modern code.",
    ],
    usage: [
      "Enable it project-wide with `<Nullable>enable</Nullable>`, or file by file with `#nullable enable` while migrating.",
      "Annotate return types and parameters honestly, such as `User? Find(int id)`, and resolve warnings with checks (`is null`, `??`, `?.`) rather than `!`.",
      "Use attributes for patterns the compiler cannot infer: `[NotNullWhen(true)]`, `[MaybeNullWhen(false)]`, `[MemberNotNull]`, and `[NotNullIfNotNull]`.",
      "Use `required` members or constructors to initialize non-nullable properties.",
      "Once the codebase is clean, turn nullable warnings into errors with `<WarningsAsErrors>nullable</WarningsAsErrors>`.",
    ],
    examples: [
      {
        caption: "Honest annotations, and an attribute that teaches the compiler about the Try pattern.",
        code: `#nullable enable
using System.Diagnostics.CodeAnalysis;

var directory = new UserDirectory(new() { [1] = new User("Ada") });

if (directory.TryGet(1, out var user))
    Console.WriteLine(user.Name.Length); // no warning: user is non-null here

Console.WriteLine(directory.Find(2)?.Name ?? "unknown"); // Find may return null

public record User(string Name);

public class UserDirectory(Dictionary<int, User> users)
{
    public User? Find(int id) => users.GetValueOrDefault(id);

    public bool TryGet(int id, [NotNullWhen(true)] out User? user) =>
        users.TryGetValue(id, out user);
}`,
      },
    ],
    eli5: [
      "Imagine labeling every box in the house either \"always has something inside\" or \"might be empty\". Before you reach into a \"might be empty\" box, a helpful voice says, \"Check first!\" With nullable reference types, the compiler is that voice.",
      "But it is only a label and a voice. Nothing physically stops someone from putting an empty box on the \"always full\" shelf while the program runs. And if you tell the voice \"trust me, it's full\" with `!` when it isn't, your hand still comes out empty.",
    ],
    related: [
      { concept: "is-patterns", why: "`is null` and `is not null` checks update the compiler's null-state tracking." },
      { concept: "exceptions", why: "Annotations don't validate at runtime, so public methods still use `ArgumentNullException.ThrowIfNull`." },
      { concept: "fields-properties", why: "`required` and `init` are the usual way to initialize non-nullable properties." },
      { concept: "generics", why: "The `notnull` constraint and unconstrained `T?` interact with nullable analysis." },
      { topic: "Nullable value types (`Nullable<T>`)", why: "`int?` is a real runtime type, unlike `string?`, despite the identical syntax." },
    ],
    interview: [
      {
        level: 1,
        question: "What does enabling nullable reference types change at runtime?",
        answer:
          "Nothing. The annotations are recorded in metadata attributes and used only by the compiler, which reports warnings; the generated IL contains no new null checks. Teams that want enforcement turn the warnings into compile errors, and public APIs still validate arguments at runtime.",
      },
      {
        level: 1,
        question: "What does the null-forgiving operator `!` do?",
        answer:
          "It tells the compiler to stop warning that an expression might be null, and it has no effect at runtime. If the value really is null, the program still throws `NullReferenceException` when it is dereferenced. Use it sparingly, for cases where you know something the compiler cannot prove, and prefer restructuring code or adding attributes.",
      },
      {
        level: 2,
        question: "How does `int?` differ from `string?`?",
        answer:
          "`int?` is shorthand for `Nullable<int>`, a real struct with `HasValue` and `Value` members. `string?` is the same runtime type as `string`, plus an annotation that only the compiler sees. The shared syntax hides two completely different mechanisms.",
      },
      {
        level: 2,
        question: "How would you migrate a large existing codebase to nullable reference types?",
        answer:
          "Enable the feature incrementally: per file with `#nullable enable`, or project-wide with `<Nullable>warnings</Nullable>` or `annotations` first. Start with leaf libraries and public APIs so annotations flow to callers, fix real issues rather than sprinkling `!`, and turn warnings into errors once a project is clean. Track the remaining warning count so progress is visible.",
      },
      {
        level: 3,
        question: "When do you need nullable attributes such as `[NotNullWhen]` or `[MemberNotNull]`?",
        answer:
          "When a method's null behavior depends on something the compiler can't see in the signature. `[NotNullWhen(true)]` covers Try-pattern `out` parameters, `[MemberNotNull]` marks helper methods that initialize fields called from constructors, `[NotNullIfNotNull]` covers methods that return null only for null input, and `[DoesNotReturn]` marks throw helpers. They remove false warnings without resorting to `!`.",
      },
    ],
    docsUrl: `${LEARN}/dotnet/csharp/nullable-references`,
  },

  // ───────────────────────────── 16. IDisposable and using ─────────────────────────────
  disposal: {
    definition:
      "`IDisposable` gives a type a `Dispose()` method for promptly releasing resources the garbage collector does not manage, such as connections, file handles, and sockets. `using` guarantees that `Dispose` runs when a scope ends, even if an exception is thrown.",
    why: [
      "The garbage collector reclaims memory, not resources. Undisposed connections and handles stay open until a finalizer runs, if one ever does, which exhausts connection pools and locks files.",
      "`using` compiles to `try`/`finally`, which makes cleanup exception-safe without boilerplate.",
      "Ownership (who creates an object and who disposes it) is an API design decision; getting it wrong causes leaks or use of already-disposed objects.",
      "`IAsyncDisposable` and `await using` let cleanup that performs I/O, such as flushing a stream, avoid blocking a thread.",
    ],
    usage: [
      "`using var connection = new SqlConnection(connectionString);` for synchronous resources, and `await using` for asynchronous ones.",
      "Don't dispose what you don't own: services injected by the DI container are disposed by the container when their scope ends.",
      "Implement `IDisposable` on classes that own disposable fields, and forward `Dispose` to those fields.",
      "Reserve finalizers for types that directly own unmanaged handles, and prefer wrapping those handles in a `SafeHandle`.",
      "Common disposables to watch for: streams, `DbContext`, `CancellationTokenSource`, timers, and `SemaphoreSlim`.",
    ],
    examples: [
      {
        caption: "A class that owns a disposable resource forwards both synchronous and asynchronous disposal.",
        code: `// Disposed at the end of the block, even if an exception is thrown
await using (var report = new ReportWriter("report.csv"))
{
    report.Write("id,total");
}

public sealed class ReportWriter(string path) : IDisposable, IAsyncDisposable
{
    // Owns the StreamWriter, which in turn owns the FileStream
    private readonly StreamWriter _writer = new(File.Create(path));

    public void Write(string line) => _writer.WriteLine(line);

    public void Dispose() => _writer.Dispose();

    // Flushes and closes without blocking a thread
    public ValueTask DisposeAsync() => _writer.DisposeAsync();
}`,
      },
    ],
    eli5: [
      "When you borrow a library book, you have to bring it back; the library won't come to your house to get it. Calling `Dispose` is bringing the book back. `using` is a note on the fridge that says \"return the book when you're done reading, even if something interrupts you\".",
      "The garbage collector is more like the person who eventually tidies your room. They throw away wrappers, but they don't know the book has to go back to the library, and by the time they get to it, someone else may have been waiting for that book for weeks.",
    ],
    related: [
      { concept: "async-await", why: "`await using` calls `DisposeAsync` and awaits it." },
      { concept: "exceptions", why: "`using` is built on `try`/`finally`, which runs cleanup during exception propagation." },
      { concept: "static-singleton", why: "The DI container disposes the services it creates according to their lifetime." },
      { concept: "hosting-resilience", why: "Hosted services create and dispose a DI scope per unit of work." },
      { topic: "Finalizers and `SafeHandle`", why: "The safety net for unmanaged resources when `Dispose` is never called." },
      { topic: "Garbage collection generations", why: "Explains why objects with finalizers live longer and cost more to collect." },
    ],
    interview: [
      {
        level: 1,
        question: "What is the difference between `Dispose` and a finalizer?",
        answer:
          "`Dispose` is called explicitly by your code, usually through `using`, and releases resources deterministically. A finalizer (`~MyType()`) is called by the garbage collector at some unpredictable time after the object becomes unreachable, and only if the type declares one. Finalizers are a safety net for unmanaged resources, not a replacement for `Dispose`.",
      },
      {
        level: 1,
        question: "What does a `using` statement compile to?",
        answer:
          "A `try`/`finally` block: the body goes in `try`, and `finally` calls `Dispose`, with a null check for reference types. A `using` declaration (`using var x = …;`) does the same, with the scope ending at the end of the enclosing block. Multiple resources are disposed in reverse order of declaration.",
      },
      {
        level: 2,
        question: "Explain the `Dispose(bool disposing)` pattern and `GC.SuppressFinalize`.",
        answer:
          "The pattern exists for unsealed types and types with finalizers. `Dispose()` calls `Dispose(true)`, which releases managed and unmanaged resources, and then calls `GC.SuppressFinalize(this)` so the finalizer is skipped. The finalizer calls `Dispose(false)`, which releases only unmanaged resources, because other managed objects may already have been finalized. A sealed class that only owns other disposables can implement a simple `Dispose()` instead.",
      },
      {
        level: 2,
        question: "Who disposes services resolved from the DI container?",
        answer:
          "The container disposes the instances it creates: scoped and transient services when their scope ends, and singletons when the application shuts down. It does not dispose an instance you created yourself and registered, such as `AddSingleton(instance)`. Disposable transients resolved from the root provider are held until the application ends, which is a common memory leak.",
      },
      {
        level: 3,
        question: "When should a type implement `IAsyncDisposable`, and what if it implements both interfaces?",
        answer:
          "Implement `IAsyncDisposable` when cleanup performs I/O, such as flushing buffers or closing a network connection. Implement both interfaces if consumers might dispose synchronously; `await using` prefers `DisposeAsync`. A DI scope disposed synchronously throws if it holds a service that implements only `IAsyncDisposable`, so such scopes must be disposed with `DisposeAsync`.",
      },
    ],
    docsUrl: `${LEARN}/dotnet/standard/garbage-collection/implementing-dispose`,
  },

  // ───────────────────────────── 17. Span<T> and Memory<T> ─────────────────────────────
  "span-memory": {
    definition:
      "`Span<T>` and `ReadOnlySpan<T>` are stack-only views over contiguous memory, such as arrays, strings, `stackalloc` buffers, or native memory, that let you slice and parse data without copying it. `Memory<T>` is the heap-storable counterpart used in asynchronous code.",
    why: [
      "Slicing without allocating: parsing part of a string, a header, or a CSV field does not create new strings or arrays.",
      "One API for many kinds of memory: the same method accepts arrays, strings, stack buffers, and native memory.",
      "Fewer allocations mean less garbage-collection work and lower latency in hot paths. Much of the modern BCL, including `System.Text.Json` and the Kestrel web server, is built on spans.",
      "Spans are bounds-checked, and `ref struct` rules prevent dangling references, so you get this performance without `unsafe` code.",
    ],
    usage: [
      "Parsing with `ReadOnlySpan<char>`: slice with ranges and pass the slices to span-based overloads such as `int.Parse(ReadOnlySpan<char>)`.",
      "`stackalloc` for small, bounded temporary buffers: `Span<byte> buffer = stackalloc byte[256];`.",
      "`ArrayPool<T>.Shared.Rent` for larger temporary buffers, used through spans and returned when finished.",
      "`Memory<T>` and `ReadOnlyMemory<T>` in async APIs such as `Stream.ReadAsync(Memory<byte>)`, taking `.Span` inside synchronous sections.",
      "`TryFormat` methods that write numbers and dates into a caller-provided span instead of allocating strings.",
    ],
    examples: [
      {
        caption: "Parsing and formatting without intermediate strings.",
        code: `// Parse "2026-10-07" without allocating any substrings.
static DateOnly ParseIsoDate(ReadOnlySpan<char> text) => new(
    int.Parse(text[..4]),
    int.Parse(text.Slice(5, 2)),
    int.Parse(text.Slice(8, 2)));

// A string converts implicitly to ReadOnlySpan<char>.
DateOnly date = ParseIsoDate("2026-10-07");
Console.WriteLine(date.ToString("O")); // 2026-10-07

// A small temporary buffer on the stack; formatting the number allocates nothing.
Span<char> buffer = stackalloc char[16];
if (12345.TryFormat(buffer, out int written))
    Console.WriteLine(buffer[..written].ToString()); // 12345; ToString allocates`,
      },
    ],
    eli5: [
      "Imagine a long train with numbered seats. Copying part of the train to give to a friend means building new train cars, which is slow and wasteful. A span is like handing your friend a window frame that says \"look at seats 5 through 9\". Nothing is copied: they see the real seats, and if they put a hat on seat 5, it is on the real train.",
      "The catch is that some window frames only work while you're standing in one particular room, so you can't mail them to someone to use later. `Memory<T>` is the version you are allowed to mail.",
    ],
    related: [
      { concept: "class-struct", why: "`Span<T>` is a `ref struct`, the stack-only kind of value type." },
      { concept: "async-await", why: "Async methods keep `Memory<T>` across `await`s and take `.Span` only between them." },
      { concept: "boxing", why: "Spans are part of the same effort to remove allocations from hot paths." },
      { concept: "bcl", why: "Many BCL APIs (`int.Parse`, `Stream`, `Encoding`, `System.Text.Json`) have span-based overloads." },
      { topic: "`ArrayPool<T>` and `MemoryPool<T>`", why: "Pooled buffers for sizes too large for `stackalloc`." },
      { topic: "System.IO.Pipelines", why: "A high-performance I/O library built on `Memory<T>` and spans." },
    ],
    interview: [
      {
        level: 1,
        question: "What is `Span<T>`, and what problem does it solve?",
        answer:
          "`Span<T>` is a type-safe, bounds-checked view over a contiguous region of memory: part of an array, a string, a stack buffer, or native memory. It lets code slice and process data without copying it into new arrays or strings. That removes allocations from parsing, formatting, and I/O hot paths.",
      },
      {
        level: 2,
        question: "Why can't a `Span<T>` be stored in a class field or kept across an `await`?",
        answer:
          "`Span<T>` is a `ref struct` that may point at stack memory, so it must never end up on the heap, where it could outlive that stack frame. Class fields, boxing, lambda captures, and the state an async method keeps across an `await` are all heap locations. Since C# 13, a span can be used inside an async method as long as it is not alive across an `await`; to hold data across one, use `Memory<T>`.",
      },
      {
        level: 2,
        question: "When is `stackalloc` appropriate?",
        answer:
          "For small temporary buffers whose maximum size is known and bounded, because thread stacks are small and fixed in size and overflowing one crashes the process. A common pattern uses `stackalloc` below a size threshold and rents from `ArrayPool<T>.Shared` above it. Assigning `stackalloc` to a `Span<T>` does not require `unsafe` code.",
      },
      {
        level: 2,
        question: "Compare `Span<T>`, `Memory<T>`, and `ArraySegment<T>`.",
        answer:
          "`Span<T>` is the fastest and most flexible, but it is stack-only. `Memory<T>` is an ordinary struct that can be stored on the heap and in async methods, and it provides a `Span<T>` through its `.Span` property when you need to work with the data. `ArraySegment<T>` is an older struct that only wraps arrays; new APIs generally use spans and memory instead.",
      },
      {
        level: 3,
        question: "How does `Span<T>` stay memory-safe without `unsafe` code?",
        answer:
          "Every access is bounds-checked, and the compiler enforces escape rules for `ref struct` values. It tracks how far each span can safely escape, so returning a span over a local `stackalloc` buffer is a compile error. The C# 11 `scoped` keyword lets you restrict a parameter's escape scope explicitly when the default rules are too strict.",
      },
    ],
    docsUrl: `${LEARN}/dotnet/standard/memory-and-spans/`,
  },

  // ───────────────────────────── 18. Exceptions ─────────────────────────────
  exceptions: {
    definition:
      "Exceptions are .NET's mechanism for reporting failures that a method cannot handle itself. `throw` unwinds the call stack until a matching `catch` (optionally filtered with `when`) handles the exception, and `finally` blocks run cleanup either way.",
    why: [
      "How you throw and catch decides whether production failures can be diagnosed: `throw ex;` discards the original stack trace, and swallowed exceptions hide bugs.",
      "Throwing is expensive compared with returning a value, so using exceptions for expected outcomes, such as invalid input, hurts both throughput and clarity.",
      "The exception type tells callers who made the mistake: `ArgumentException` means the caller passed something wrong, while `InvalidOperationException` means the object was in the wrong state.",
      "Centralized handling (the ASP.NET Core exception handler and `ProblemDetails`) turns failures into consistent API responses and useful logs.",
    ],
    usage: [
      "Guard clauses with throw helpers: `ArgumentNullException.ThrowIfNull(order)` and `ArgumentOutOfRangeException.ThrowIfNegative(quantity)`.",
      "Catch specific exception types only where you can recover or add context; let the rest reach a global handler.",
      "Exception filters for conditional handling: `catch (HttpRequestException e) when (e.StatusCode == HttpStatusCode.NotFound)`.",
      "Wrap low-level exceptions with context by passing the original as `innerException`.",
      "In ASP.NET Core, `app.UseExceptionHandler()` with `IExceptionHandler` (.NET 8) and `AddProblemDetails()` for consistent error responses.",
    ],
    examples: [
      {
        caption: "Validate arguments up front, add context to expected low-level failures, and let everything else propagate. `Order` is assumed to be defined elsewhere.",
        code: `using System.Text.Json;

public class OrderImporter
{
    public async Task<Order> ImportAsync(string path, CancellationToken ct)
    {
        // The caller's mistake: fail fast with an ArgumentException.
        ArgumentException.ThrowIfNullOrEmpty(path);

        try
        {
            var json = await File.ReadAllTextAsync(path, ct);
            return JsonSerializer.Deserialize<Order>(json)
                ?? throw new InvalidDataException($"'{path}' contains no order.");
        }
        catch (JsonException ex)
        {
            // Add context, and keep the original exception as InnerException.
            throw new InvalidDataException($"'{path}' is not a valid order.", ex);
        }
        // IOException and unexpected exceptions propagate to the global handler.
    }
}`,
      },
    ],
    eli5: [
      "An exception is like pulling the fire alarm. You don't pull it because you're out of milk; you just go buy more milk. That is an ordinary \"no\" answer. You pull it when something has gone wrong that you can't fix where you are, and the alarm travels up through the building until someone whose job is handling fires responds.",
      "`finally` is the rule that the oven gets switched off on the way out, alarm or no alarm. And when you report a fire, you say where it started. Writing `throw ex;` is like telling the firefighters it started in the lobby when it really started in the kitchen.",
    ],
    related: [
      { concept: "disposal", why: "`using` relies on `finally` to release resources while an exception propagates." },
      { concept: "async-await", why: "Exceptions in tasks surface when awaited, while `async void` exceptions can crash the process." },
      { concept: "hosting-resilience", why: "Retry strategies decide which exceptions are transient and worth retrying." },
      { concept: "nullable-reference-types", why: "Nullable annotations don't check anything at runtime, so guard clauses still throw." },
      { topic: "The Result pattern", why: "Returning success-or-error values for expected failures instead of throwing." },
      { topic: "ProblemDetails (RFC 9457)", why: "The standard JSON shape for HTTP API error responses that ASP.NET Core produces." },
    ],
    interview: [
      {
        level: 1,
        question: "What is the difference between `throw;` and `throw ex;`?",
        answer:
          "`throw;` rethrows the current exception with its original stack trace intact. `throw ex;` throws the same object but resets the stack trace to the current line, so the logs point at the `catch` block instead of the real failure. If you need to add context, throw a new exception and pass the original as its inner exception.",
      },
      {
        level: 1,
        question: "When should you throw an exception, and when should you return an error value instead?",
        answer:
          "Throw for unexpected failures and broken contracts: invalid arguments, violated invariants, and unavailable infrastructure. Return a value, such as a `bool` from a Try method or a result object, for outcomes that are expected and frequent, such as failed validation or a missing record. Expected outcomes are part of normal control flow and should be visible in the method signature.",
      },
      {
        level: 2,
        question: "What are exception filters, and why are they better than catching and rethrowing?",
        answer:
          "A filter (`catch (X e) when (condition)`) is evaluated before the stack unwinds; if it returns false, the runtime keeps searching for another handler as if that `catch` did not exist. The original stack stays intact for debuggers and crash dumps, and there is no catch-and-rethrow cost. A filter that logs and returns false can record an exception without handling it.",
      },
      {
        level: 2,
        question: "How should an ASP.NET Core API handle unhandled exceptions?",
        answer:
          "Register a global handler with `UseExceptionHandler`, typically with `IExceptionHandler` implementations and `AddProblemDetails()`, so every error becomes a consistent `ProblemDetails` response. Log the exception with a correlation or trace identifier, and never return stack traces to clients in production. The developer exception page belongs in the Development environment only.",
      },
      {
        level: 3,
        question: "What happens to exceptions from `Task.WhenAll` and from fire-and-forget tasks?",
        answer:
          "Awaiting `Task.WhenAll` rethrows the first exception, but all of them are available through the returned task's `Exception.InnerExceptions`. An exception in a task that is never awaited is unobserved: it raises `TaskScheduler.UnobservedTaskException` and has not crashed the process since .NET Framework 4.5. An exception escaping an `async void` method, by contrast, typically does crash the process.",
      },
    ],
    docsUrl: `${LEARN}/dotnet/standard/exceptions/best-practices-for-exceptions`,
  },

  // ───────────────────────────── 19. Equality ─────────────────────────────
  equality: {
    definition:
      "Equality in .NET comes in two kinds: reference equality (the same object) and value equality (the same data). Which one you get depends on the type, whether it overrides `Equals` and `GetHashCode`, and whether it overloads `==`.",
    why: [
      "`Dictionary`, `HashSet`, `Distinct`, `Contains`, and `GroupBy` all rely on `Equals` and `GetHashCode`; breaking their contract makes items silently disappear.",
      "`==` is chosen at compile time from the variables' static types, while `Equals` is virtual, so the same two objects can compare differently depending on how variables are declared.",
      "Records provide value equality automatically, which suits DTOs, messages, and value objects.",
      "String comparison choices (ordinal or culture-sensitive, case-sensitive or not) cause real bugs in security checks, file paths, and dictionary keys.",
    ],
    usage: [
      "`record` and `record struct` for value objects and DTOs instead of hand-written equality members.",
      "When writing equality by hand: override `Equals(object)`, implement `IEquatable<T>`, and override `GetHashCode` together, adding `==` and `!=` where appropriate.",
      "Explicit comparers and comparison types: `new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase)` and `string.Equals(a, b, StringComparison.Ordinal)`.",
      "`ReferenceEquals` or `is null` when you need identity or a null check that no operator overload can affect.",
      "Custom `IEqualityComparer<T>` implementations to compare by a key without changing the type itself.",
    ],
    examples: [
      {
        caption: "Records compare by value, comparers define equality for collections, and hand-written equality keeps `Equals` and `GetHashCode` consistent.",
        code: `var a = new Money(10m, "USD");
var b = new Money(10m, "USD");
Console.WriteLine(a == b);                 // True: records compare values
Console.WriteLine(ReferenceEquals(a, b));  // False: still two objects

var tags = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Urgent" };
Console.WriteLine(tags.Contains("URGENT")); // True: the comparer decides

Console.WriteLine(new Sku("ab-1").Equals(new Sku("AB-1"))); // True

public record Money(decimal Amount, string Currency);

public sealed class Sku(string code) : IEquatable<Sku>
{
    public string Code { get; } = code.ToUpperInvariant();

    public bool Equals(Sku? other) => other is not null && Code == other.Code;
    public override bool Equals(object? obj) => Equals(obj as Sku);

    // Equal objects must return equal hash codes.
    public override int GetHashCode() => Code.GetHashCode();
}`,
      },
    ],
    eli5: [
      "Two kids each have a red ball that looks exactly the same. Are they the same ball? If you mean \"is it literally the one ball\", no: there are two. If you mean \"are they the same kind of ball\", yes. Code has to decide which question `==` answers.",
      "Now imagine sorting balls into bins by color so you can find them quickly. Two balls that count as \"the same\" must always go in the same bin; that bin number is the hash code. If a ball changes color after you've put it away, you'll look in the wrong bin and decide it is gone.",
    ],
    related: [
      { concept: "class-struct", why: "Classes, structs, and records each come with different default equality." },
      { concept: "collections", why: "Hash-based collections are where equality bugs surface." },
      { concept: "is-patterns", why: "`is null` checks identity without calling user-defined operators." },
      { concept: "boxing", why: "Implementing `IEquatable<T>` on structs avoids boxing during comparisons." },
      { topic: "String comparison and culture", why: "Ordinal versus culture-sensitive comparison, and the Turkish \"i\" problem." },
      { topic: "Value objects", why: "The domain-driven design idea that records model naturally." },
    ],
    interview: [
      {
        level: 1,
        question: "What is the difference between `==` and `Equals()`?",
        answer:
          "`==` is an operator selected at compile time from the static types of its operands, and types can overload it. `Equals` is a virtual method, so the runtime type's override is called. For classes that override neither, both compare references; `string` and records override both to compare values.",
      },
      {
        level: 2,
        question: "What is the contract between `Equals` and `GetHashCode`?",
        answer:
          "Objects that are equal must return the same hash code. Unequal objects may share a hash code; collisions only slow lookups down. The hash code should also not change while the object is stored in a hash-based collection, and hash codes are not stable across processes, so they must never be persisted.",
      },
      {
        level: 2,
        question: "How do records implement equality?",
        answer:
          "The compiler generates `Equals`, `GetHashCode`, `==`, `!=`, and `IEquatable<T>`. Two records are equal when they have the same runtime type and all of their instance fields are equal according to `EqualityComparer<T>.Default`. A common gotcha is that a collection field, such as a `List<T>`, is compared by reference, not by contents.",
      },
      {
        level: 2,
        question: "Which string comparison should you use by default?",
        answer:
          "Use ordinal comparisons (`StringComparison.Ordinal` or `OrdinalIgnoreCase`) for identifiers, dictionary keys, file paths, and protocol values, because they are fast and do not change with the user's culture. Use culture-sensitive comparisons only for text shown to and sorted for users. Passing the comparison type explicitly also documents the intent.",
      },
      {
        level: 3,
        question: "Why is it dangerous to use mutable objects as dictionary keys?",
        answer:
          "A dictionary stores each entry in a bucket chosen by the key's hash code when the entry is added. If a property that participates in the hash later changes, lookups compute a different hash, search the wrong bucket, and fail, even though the entry is still in the dictionary. Keys should be immutable, or at least never mutated while they are stored.",
      },
    ],
    docsUrl: `${LEARN}/dotnet/csharp/programming-guide/statements-expressions-operators/equality-comparisons`,
  },

  // ───────────────────────────── 20. Collections ─────────────────────────────
  collections: {
    definition:
      "The .NET collection types (`List<T>`, `Dictionary<TKey, TValue>`, `HashSet<T>`, queues, and the concurrent, immutable, and frozen collections) trade off lookup speed, ordering, mutability, and thread safety. Choosing one is a design decision, not a detail.",
    why: [
      "Algorithmic cost: `List<T>.Contains` scans every element, while `HashSet<T>.Contains` is constant time on average, so the wrong choice can turn a fast loop into a quadratic one.",
      "Thread safety: the standard collections are not safe for concurrent writes, and corrupted state under load is a classic production bug.",
      "API design: exposing a `List<T>` lets callers change internal state, while returning `IReadOnlyList<T>` communicates intent.",
      "Specialized types such as `FrozenDictionary`, `ImmutableArray`, `PriorityQueue`, and `Channel<T>` solve common problems without custom code.",
    ],
    usage: [
      "`List<T>` for ordered, index-based data; `Dictionary<TKey, TValue>` for lookup by key; `HashSet<T>` for uniqueness and membership tests.",
      "`Queue<T>`, `Stack<T>`, and `PriorityQueue<TElement, TPriority>` for processing order.",
      "`ConcurrentDictionary`, `ConcurrentQueue`, or `Channel<T>` for data shared between threads.",
      "`FrozenDictionary` and `FrozenSet` (.NET 8) for build-once, read-heavy lookups; immutable collections for cheap modified copies.",
      "Returning `IReadOnlyList<T>` or `IReadOnlyDictionary<TKey, TValue>` from APIs, and pre-sizing collections when the count is known.",
    ],
    examples: [
      {
        caption: "Picking a collection by the operation you need most.",
        code: `using System.Collections.Concurrent;
using System.Collections.Frozen;

// HashSet: fast membership checks; Add returns false for a duplicate
var seen = new HashSet<int>();
foreach (var id in new[] { 3, 1, 3, 2 })
    if (!seen.Add(id)) Console.WriteLine($"duplicate {id}"); // duplicate 3

// Dictionary with a case-insensitive comparer and a lookup that cannot throw
var stock = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase)
{
    ["apples"] = 3,
};
Console.WriteLine(stock.GetValueOrDefault("PEARS")); // 0, no exception

// Safe for concurrent writers
var hits = new ConcurrentDictionary<string, int>();
hits.AddOrUpdate("/home", 1, (_, n) => n + 1);

// Built once, then optimized for fast reads
FrozenSet<string> currencies = new[] { "USD", "EUR", "GBP" }.ToFrozenSet();
Console.WriteLine(currencies.Contains("EUR")); // True`,
      },
    ],
    eli5: [
      "Collections are different kinds of containers. A list is a line of kids holding hands: easy to count from the front, but to find Sam you walk down the line asking everyone. A dictionary is a coat check: you hand over ticket 42 and get your coat right away.",
      "A set is a guest list that refuses to write the same name twice. A queue is the line for the slide: first in, first out. Picking the wrong container is like using the line-of-kids method to find one coat among a thousand.",
    ],
    related: [
      { concept: "equality", why: "Hash-based collections depend on correct `Equals` and `GetHashCode` or a custom comparer." },
      { concept: "linq", why: "LINQ queries consume collections and often produce new ones." },
      { concept: "generics", why: "All modern collections are generic, which avoids casts and boxing." },
      { concept: "static-singleton", why: "Collections held by singletons are shared between threads and need concurrent types or locking." },
      { topic: "Big-O complexity", why: "The vocabulary for comparing collection operations: O(1) lookups versus O(n) scans." },
      { topic: "Read-only, immutable, and frozen collections", why: "Three different guarantees that are easy to confuse." },
    ],
    interview: [
      {
        level: 1,
        question: "When would you use `List<T>`, `Dictionary<TKey, TValue>`, or `HashSet<T>`?",
        answer:
          "Use `List<T>` for ordered data accessed by index or iterated in sequence. Use `Dictionary<TKey, TValue>` to look up values by a key, and `HashSet<T>` to track unique items and test membership quickly. The deciding question is which operation the code performs most often.",
      },
      {
        level: 2,
        question: "What is the difference between read-only, immutable, and frozen collections?",
        answer:
          "A read-only collection, such as the wrapper from `AsReadOnly()`, only prevents changes through that reference; the owner can still change the underlying data. An immutable collection never changes, and its \"modifying\" methods return new instances that share structure with the old one. A frozen collection is also unchangeable, but it spends extra time at creation to optimize reads and has no cheap modification methods.",
      },
      {
        level: 2,
        question: "How does `Dictionary<TKey, TValue>` work internally, and what affects its performance?",
        answer:
          "It computes the key's hash code to choose a bucket, then calls `Equals` to find the exact entry within that bucket. Performance depends on hash quality, because many collisions degrade lookups toward a linear scan, and on resizing, which rehashes every entry when capacity runs out. Pre-sizing with a capacity avoids repeated resizes.",
      },
      {
        level: 2,
        question: "Why does modifying a `List<T>` inside a `foreach` loop throw?",
        answer:
          "The list keeps a version number that changes on every modification, and its enumerator checks that number on each `MoveNext`. A mismatch throws `InvalidOperationException`, because continuing could skip or repeat elements. Use `RemoveAll`, iterate backwards with a `for` loop, or collect the changes and apply them after the loop.",
      },
      {
        level: 3,
        question: "How do you choose between `ConcurrentDictionary`, a `lock` around a `Dictionary`, and a `Channel<T>`?",
        answer:
          "`ConcurrentDictionary` suits many threads reading and writing individual keys, but note that the factory passed to `GetOrAdd` can run more than once under contention. A `lock` is better when an operation must update several keys or maintain an invariant atomically. `Channel<T>` fits producer-consumer pipelines, where data flows from one stage to another, optionally with backpressure.",
      },
    ],
    docsUrl: `${LEARN}/dotnet/standard/collections/`,
  },

  // ───────────────────────────── 21. Architecture patterns ─────────────────────────────
  architecture: {
    definition:
      "Architecture patterns organize an application above the level of individual classes. CQRS separates reads from writes, the Outbox keeps database changes and messages consistent, Decorators layer behavior around services, Repositories abstract persistence, and Vertical Slices organize code by feature.",
    why: [
      "These patterns dominate system-design discussions and real .NET codebases, and they are often over-applied; knowing what each one actually costs and buys is a mark of senior judgment.",
      "The Outbox pattern solves the dual-write problem, a common source of lost or phantom messages in distributed systems.",
      "Decorators add logging, caching, retries, or authorization without editing business code.",
      "Code structure (layers or slices) determines how many files a change touches and how easily a team can work in parallel.",
    ],
    usage: [
      "CQRS: command handlers that validate and change state through the domain model, and query handlers that project directly to DTOs, often with `AsNoTracking()`.",
      "Outbox: save domain changes and an outbox message in one transaction; a background relay publishes the message later, and consumers are idempotent. MassTransit, NServiceBus, and Wolverine provide outbox implementations.",
      "Decorator: wrap `IOrderService` in a `CachingOrderService` or `LoggingOrderService`, registered with Scrutor's `Decorate` or a factory registration.",
      "Repository: purpose-built repositories for aggregate roots in domain-driven code; many teams use `DbContext` directly in handlers instead of a generic repository.",
      "Vertical Slice: a feature folder such as `Features/Orders/PlaceOrder` that holds the endpoint, request, handler, and validation together.",
    ],
    examples: [
      {
        caption:
          "A vertical slice whose handler writes the order and its outbox message in the same transaction. `AppDbContext`, `Order`, `OutboxMessage`, and `OrderPlaced` are assumed to be defined elsewhere.",
        code: `// Features/Orders/PlaceOrder.cs: endpoint, command, and handler in one place
public static class PlaceOrder
{
    public record Command(int CustomerId, decimal Total);

    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPost("/orders", Handle);

    private static async Task<IResult> Handle(
        Command cmd, AppDbContext db, CancellationToken ct)
    {
        var order = new Order(Guid.NewGuid(), cmd.CustomerId, cmd.Total);
        db.Orders.Add(order);

        // Outbox: the message row is committed atomically with the order.
        db.OutboxMessages.Add(OutboxMessage.From(new OrderPlaced(order.Id)));
        await db.SaveChangesAsync(ct);

        return Results.Created($"/orders/{order.Id}", order.Id);
    }
}`,
      },
    ],
    eli5: [
      "Think of a big school. CQRS is having one office for changing things, like enrolling or transferring students, and a separate noticeboard for reading things, like schedules, each designed for its own job. The Outbox is writing the letter home in the same notebook where you record the grade, so a grade and its letter are always recorded together; a mail runner later sends every letter in the notebook.",
      "A decorator is gift wrap: the present inside doesn't change, but now it has a bow. Vertical slices mean each club keeps all its gear in its own room, instead of one room for every club's balls and another for every club's uniforms.",
    ],
    related: [
      { concept: "design-patterns", why: "These patterns are wired together through DI registrations." },
      { concept: "hosting-resilience", why: "An outbox relay is a background service, and its retries require idempotent consumers." },
      { concept: "linq", why: "Repositories that return `IQueryable<T>` leak query concerns to their callers." },
      { concept: "equality", why: "Value objects in domain-driven design rely on value equality, often through records." },
      { topic: "Domain-driven design aggregates", why: "The consistency boundaries that repositories and commands are usually designed around." },
      { topic: "Idempotent consumers", why: "At-least-once delivery from an outbox means every handler must tolerate duplicates." },
      { topic: "Clean Architecture", why: "The layered alternative to vertical slices, organized by technical concern." },
    ],
    interview: [
      {
        level: 2,
        question: "What is CQRS, and does it require event sourcing or separate databases?",
        answer:
          "CQRS (Command Query Responsibility Segregation) means modeling writes and reads separately: commands change state and return little or nothing, while queries return data without side effects. It requires neither event sourcing, separate databases, nor a mediator library, although each is often paired with it. Many teams apply it with plain handler classes over a single database.",
      },
      {
        level: 2,
        question: "What problem does the Outbox pattern solve, and what are its trade-offs?",
        answer:
          "It solves the dual write: a database and a message broker cannot share one local transaction, so saving data and publishing an event can partially fail. The outbox stores the message in the same database transaction, and a relay publishes it afterward. The trade-offs are at-least-once delivery, which requires idempotent consumers, plus an extra table to clean up, publishing latency, and ordering concerns.",
      },
      {
        level: 2,
        question: "Should you wrap EF Core in a generic repository?",
        answer:
          "Usually not. `DbContext` already acts as a unit of work and `DbSet<T>` as a repository, so a generic wrapper adds indirection while hiding features such as `Include`, projections, and query tuning. Purpose-built repositories for aggregate roots can still make sense in domain-driven code, and testing can rely on SQLite or containerized databases rather than a repository abstraction.",
      },
      {
        level: 2,
        question: "How do you add caching or logging to a service without modifying it?",
        answer:
          "Use the Decorator pattern: a class that implements the same interface, wraps the original instance, and adds behavior before or after delegating to it. Register it in DI with a helper such as Scrutor's `Decorate`, or with a factory registration that builds the chain. Because callers depend only on the interface, they do not change.",
      },
      {
        level: 3,
        question: "How do you choose between Vertical Slice Architecture and Clean Architecture?",
        answer:
          "Vertical slices suit applications whose features are largely independent, because each change stays within one feature folder. Clean Architecture pays off when a rich domain model is shared by many features and you want the domain isolated from infrastructure. The two can be combined, with slices for application features and a shared domain core where real shared rules exist.",
      },
    ],
    docsUrl: "https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs",
  },

  // ───────────────────────────── 22. Hosting and resilience ─────────────────────────────
  "hosting-resilience": {
    definition:
      "The .NET Generic Host runs long-lived work (`BackgroundService` and other `IHostedService` implementations) with dependency injection, configuration, logging, and graceful shutdown. Resilience libraries (Polly v8 and Microsoft.Extensions.Resilience) help calls to unreliable dependencies survive transient failures.",
    why: [
      "Most production systems have background work, such as queue consumers, scheduled cleanup, and outbox relays, and depend on networks that fail transiently.",
      "The mistakes are subtle: captive scoped services inside hosted services, ignored cancellation tokens that delay shutdown, and unhandled exceptions that stop the whole host (the default behavior since .NET 6).",
      "Retries without backoff, jitter, idempotency, or circuit breakers amplify an outage into a retry storm instead of absorbing it.",
      "`AddStandardResilienceHandler()` gives an `HttpClient` a sensible default pipeline (rate limiter, total timeout, retry, circuit breaker, and per-attempt timeout) in one line.",
    ],
    usage: [
      "`BackgroundService` with `PeriodicTimer` for scheduled work, creating a DI scope per iteration to use scoped services such as `DbContext`.",
      "Passing `stoppingToken` to every awaited call so shutdown is fast and clean.",
      "`services.AddHttpClient<T>().AddStandardResilienceHandler()` for outbound HTTP, and a custom `ResiliencePipeline` for databases, queues, or SDK calls.",
      "Retrying only transient failures of idempotent operations, with exponential backoff and jitter; adding a circuit breaker to fail fast while a dependency is down.",
      "Health checks (`AddHealthChecks()`) and graceful shutdown handling for containers and orchestrators.",
    ],
    examples: [
      {
        caption: "A background worker that creates a fresh DI scope per tick and survives failed iterations. `IOutboxPublisher` is assumed to be defined elsewhere.",
        code: `public sealed class OutboxRelay(
    IServiceScopeFactory scopes, ILogger<OutboxRelay> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(10));

        // The loop ends promptly when the host cancels stoppingToken.
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                // A fresh scope, and so fresh scoped services, for every tick
                await using var scope = scopes.CreateAsyncScope();
                var publisher = scope.ServiceProvider
                    .GetRequiredService<IOutboxPublisher>();
                await publisher.PublishPendingAsync(stoppingToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                logger.LogError(ex, "Outbox relay failed; retrying next tick");
            }
        }
    }
}`,
      },
      {
        caption: "Registering the worker, a resilient typed `HttpClient`, and a custom Polly v8 pipeline in Program.cs. `builder` and `PaymentsClient` are assumed to be defined elsewhere.",
        code: `using Polly;
using Polly.Retry;

builder.Services.AddHostedService<OutboxRelay>();

// Standard pipeline: rate limiter, timeouts, retry, and circuit breaker
builder.Services.AddHttpClient<PaymentsClient>()
    .AddStandardResilienceHandler();

// A custom pipeline for non-HTTP calls. Strategies added first are outermost.
ResiliencePipeline pipeline = new ResiliencePipelineBuilder()
    .AddRetry(new RetryStrategyOptions
    {
        MaxRetryAttempts = 3,            // 1 initial attempt + 3 retries
        BackoffType = DelayBackoffType.Exponential,
        UseJitter = true,
    })
    .AddTimeout(TimeSpan.FromSeconds(2)) // inside the retry: limits each attempt
    .Build();`,
      },
    ],
    eli5: [
      "A background service is the night janitor. They keep working while the shop runs, and when the owner says \"we're closing\", they finish the current room and go home instead of mopping until morning.",
      "Resilience is about phoning a friend who doesn't always pick up. If the line is busy, you try again in one minute, then two, then four, instead of redialing a hundred times a second. If they haven't answered all day, you stop calling for a while; that is a circuit breaker. And you never call back to say \"please send $20\" unless you both agree the second call is the same request, not a new one.",
    ],
    related: [
      { concept: "async-await", why: "Background loops are async and must pass their cancellation token through." },
      { concept: "static-singleton", why: "Hosted services are singletons, which is why they need explicit scopes for scoped services." },
      { concept: "design-patterns", why: "The standard resilience handler plugs into `IHttpClientFactory` typed clients." },
      { concept: "architecture", why: "Outbox relays run as background services, and retries require idempotent operations." },
      { concept: "disposal", why: "Each unit of work creates and disposes its own DI scope." },
      { topic: "Circuit breaker pattern", why: "Stops calling a failing dependency for a while so it can recover." },
      { topic: "Health checks and graceful shutdown", why: "How orchestrators such as Kubernetes decide when to route traffic to, or stop, an instance." },
    ],
    interview: [
      {
        level: 1,
        question: "What is the difference between `IHostedService` and `BackgroundService`?",
        answer:
          "`IHostedService` is the interface the host calls at startup and shutdown, through `StartAsync` and `StopAsync`. `BackgroundService` is an abstract base class that implements it for long-running work: you override `ExecuteAsync`, and the base class supplies a stopping token and handles shutdown. Use `BackgroundService` for loops and consumers, and implement `IHostedService` directly for short startup or shutdown tasks.",
      },
      {
        level: 2,
        question: "How do you use a scoped service such as `DbContext` in a hosted service?",
        answer:
          "Hosted services are effectively singletons, so injecting a scoped service into the constructor creates a captive dependency. Inject `IServiceScopeFactory` instead, create a scope per unit of work, resolve the service from that scope, and dispose the scope afterward. Each iteration then gets a fresh `DbContext` with its own change tracker.",
      },
      {
        level: 2,
        question: "What happens if `ExecuteAsync` throws an unhandled exception?",
        answer:
          "Since .NET 6, the default `BackgroundServiceExceptionBehavior` is `StopHost`: the exception is logged and the host shuts down. You can configure `Ignore` to restore the older behavior, in which the service stops silently and the app keeps running. For workers that should survive transient errors, catch exceptions inside each iteration and log them.",
      },
      {
        level: 2,
        question: "What makes a retry policy safe?",
        answer:
          "Retry only transient failures, such as timeouts, HTTP 5xx or 429 responses, and dropped connections, and only for idempotent operations or requests with idempotency keys. Use exponential backoff with jitter, cap both the number of attempts and the total time, and honor `Retry-After` headers. Add a circuit breaker so a dependency that is down fails fast instead of being hammered.",
      },
      {
        level: 3,
        question: "How does strategy order work in a Polly v8 resilience pipeline?",
        answer:
          "Strategies added first are the outermost. A timeout added after a retry sits inside it, so it limits each attempt; a timeout added before the retry limits the whole operation, including every retry. The standard HTTP resilience handler uses both: a total request timeout outside the retry and an attempt timeout inside it.",
      },
    ],
    docsUrl: `${LEARN}/dotnet/core/extensions/workers`,
  },
};

/** The study guide for a concept. Every concept has one; the `Record` type enforces it at compile time. */
export function guideFor(concept: Concept): ConceptGuide {
  return GUIDES[concept];
}
