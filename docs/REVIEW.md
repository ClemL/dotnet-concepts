# Question review pass

After all 110 questions were written (60 for the 12 core concepts and 50 for 10 additional concepts), a separate pass re-derived every correct answer from scratch. It checked that no distractor is also defensibly correct and verified every factual claim in the explanations against the pinned facts or well-established documentation. Claims that could not be confirmed with confidence were removed, not hedged.

## Result

- **Questions reviewed:** 110
- **Questions changed:** 8
- **Questions whose correct answer changed:** 0
- **Questions replaced:** 0

## Changes

1. **`static-singleton-2` (code snippet).** The snippet used `connectionString` without declaring it. A `GetConnectionString("Default")` line was added so the snippet reads as valid C#.
2. **`fields-properties-5` (explanation).** The original said that EF Core model building "is property-based", which overstated the case: EF Core can map fields. It now says that EF Core *conventions* discover public properties, not public fields.
3. **`design-patterns-5` (scenario and correct option).** The scenario was a long-lived background worker, and the correct option suggested a typed client. Injecting a typed client into a singleton captures one `HttpClient` for the worker's lifetime, which is a known pitfall in its own right, so the original option was not cleanly correct. The scenario is now a per-request ASP.NET Core endpoint, and the option names `IHttpClientFactory` without the typed-client example.
4. **`architecture-3` (correct option).** A parenthetical described a failure mode ("a crash loses consistency the other way") that this code ordering cannot produce. If the publish fails, the transaction rolls back. The parenthetical was removed.
5. **`hosting-resilience-2` (explanation).** It claimed that "a missed tick is not queued". In fact, `PeriodicTimer` remembers one elapsed tick, so ticks that occur during work collapse into a single pending tick. The wording was corrected.
6. **`span-memory-5` (explanation).** It cited a specific default thread-stack size, which varies by OS and thread type. The explanation now says only that thread stacks are small and fixed in size.
7. **`bcl-4` (explanation).** It asserted the exact release in which `System.Threading.Channels` joined `Microsoft.NETCore.App`. The answer does not depend on that version, so the explanation now refers only to current .NET versions.
8. **`linq-2` (explanation).** It cited a specific analyzer rule ID from memory. The explanation now describes what the analyzers flag without naming the ID.

A ninth question (`nullable-reference-types-3`) was flagged by the automated sentence-count check. It was re-verified and left unchanged, because the counter had miscounted a sentence that starts with the digit "0".

## Accuracy constraints applied

- The pinned facts are used verbatim: pattern versions (C# 7 / 8 / 9 / 11), a boxed `int` at 24 bytes on 64-bit, Fakes requiring Visual Studio Enterprise, C# 14 / .NET 10 for extension blocks and `field`, and the 16-byte struct guideline.
- No question depends on performance figures. Where speed is mentioned, the claim is relative ("slower", "costs more") and the mechanism is explained.
- `docsUrl` is set only for learn.microsoft.com pages whose paths I am confident exist. 70 of the 110 questions have one; the rest omit it.
- Code snippets assume normal surrounding context (implicit usings, an `app`/`builder`/`db` in scope where clearly implied). Snippets that mix top-level statements and type declarations put the statements first, as C# requires.
- The correct option position is skewed toward A in the source data. This does not affect quiz-takers, because options are reshuffled on every attempt.

## Concepts 23–26

Twenty questions were later added for four concepts: dependency injection, configuration and Options, EF Core and Dapper on Azure SQL, and money, rounding, and dates. They were written to avoid repeating ground the earlier concepts already cover: captive dependencies (`static-singleton`), keyed services and `IOptionsMonitor` (`design-patterns`), `TimeProvider` (`shims`), and `IQueryable` and `Any` vs `Count` (`linq`).

Every code snippet in these questions and their study guides was compiled against the .NET 8 SDK (8.0.131), with EF Core 8, Dapper, Azure.Identity, and the Key Vault configuration provider. Stub types were used for anything a snippet or caption marks as assumed. Snippets with a definite output were run, and the output matched the correct option or the `// comments`:

- **Run and matched:** `dependency-injection-1` to `-3`, `configuration-1` to `-3` (with real `appsettings` files and environment variables), `data-access-1` (SQLite), `money-dates-1` to `-3`, and the guide examples for configuration and money and dates.
- **Verified indirectly:** `data-access-2` cannot run without SQL Server. The same behavior was reproduced with a custom retrying `ExecutionStrategy` on SQLite: `SaveChangesAsync` threw `InvalidOperationException` ("does not support user-initiated transactions"). The `decimal(18,2)` default in `money-dates-5` was read from the SQL Server provider's model.
- **Compiled only:** `data-access-3` (the compiler's EF1002 analyzer flags query 1, which agrees with the answer), `data-access-5`, and the EF Core and Dapper guide examples. SQLite completes queries synchronously, so it cannot reproduce the concurrent-operation exception in `data-access-5`; the question says the detection is best-effort for that reason.

The `docsUrl` links for these concepts could not be fetched from the authoring environment, so they rely on the same "confident the page exists" rule as the original set.
