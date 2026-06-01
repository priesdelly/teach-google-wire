# Assessment & Quiz System

## 1. Quiz Format Specification

### Multiple-Choice Structure
- **Format:** Single-answer multiple-choice only
- **Options:** 4 choices labeled A/B/C/D
- **Randomization:** Questions and options shuffled per attempt (seeded by user session to allow review consistency)
- **Pass Threshold:** 80% (12/15 questions correct; 15 drawn from a ≥18 bank)
- **Time Limit:** None (optional per chapter, if course enforces mastery via depth not speed)
- **Retry Policy:** Learners must retry after failing; questions reshuffled; no penalty, but score tracked

### Quiz Density & Pacing
- Questions appear as **checkpoints** at chapter end, not mid-chapter
- Learner progresses only after 80% pass; encourages re-reading before retry

---

## 2. Hinge Question Design Principles

A **Hinge Question** is a formative checkpoint that reveals genuine understanding, not rote memory. It:
- **Targets one concept** at a time
- **Uses realistic misconceptions as distractors** (not implausible answers)
- **Requires reasoning**, not keyword matching
- **Exposes gaps in understanding** that would break real-world Wire usage

### What NOT to Ask (Anti-Patterns)

**Anti-Pattern 1: Trivial Definition Recall**
```
❌ "What does DI stand for?"
   A. Dependency Injection
   B. Direct Initialization
   C. Data Infrastructure
   D. Dependency Instantiation
```
*Why it fails:* Tests vocabulary, not comprehension. A learner could memorize "DI = Dependency Injection" without understanding why it matters or how Wire implements it differently than Spring.

**Anti-Pattern 2: "Trick Question" with No Real Misconception**
```
❌ "Wire compiles dependencies at runtime. True or False?"
   (multiple choice format forced)
```
*Why it fails:* The distractors don't reflect genuine confusion—they're just "opposite." A learner who skimmed slides might guess randomly. No insight into what they actually misunderstand about Wire's compile-time model.

**Anti-Pattern 3: Multi-Concept Question**
```
❌ "When would you use wire.Bind with a factory provider and cleanup functions?"
   A. For interface implementation when the concrete type is expensive to construct
   B. For logging all dependency creations across your application
   C. To reduce binary size in Go programs
   D. When using Wire with gRPC services
```
*Why it fails:* Conflates wire.Bind, providers, cleanup, and cost optimization. A learner might know wire.Bind but be confused by cleanup, making the answer ambiguous. Tests three concepts, reveals none clearly.

### Hinge Question Characteristics

1. **Rooted in Real Misconception:**
   - Distractor A: Correct understanding
   - Distractor B: Confuses compile-time with runtime (Spring-like thinking)
   - Distractor C: Misunderstands a related concept (e.g., wire.Build vs initialization)
   - Distractor D: Over-generalizes or misses a constraint

2. **Bloom's Levels Represented:**
   - **Remember** (10–15%): Basic Wire syntax (wire.Build, @Wire tag)
   - **Understand** (30–40%): Wire's compilation model, why compile-time matters
   - **Apply** (30–40%): Using providers, cleanup, error handling in a scenario
   - **Analyze** (15–20%): Comparing manual DI vs Wire, debugging provider graphs, scoping

3. **Context Matters:**
   - Questions include realistic code snippets or scenarios
   - Answers reference "what the compiler will do" or "what the test output shows"

---

## 3. JSON Schema for Quiz Questions

```json
{
  "question": {
    "id": "wire-001-q01",
    "chapterId": "ch01-intro",
    "difficulty": "easy|medium|hard",
    "bloomLevel": "remember|understand|apply|analyze",
    "objective": "Explain why Wire's compile-time DI differs from runtime DI frameworks",
    "i18n": {
      "th": {
        "question": "When does Wire build the dependency graph and generate code?",
        "options": [
          "While the program is running (runtime)",
          "During Go code compilation",
          "When the container is first created",
          "During unit tests, but not in production"
        ]
      },
      "en": {
        "question": "When does Wire generate the dependency graph and constructor code?",
        "options": [
          "At runtime when the program executes",
          "During Go compilation (code generation)",
          "When the container is first created in main()",
          "During unit tests, but not in production builds"
        ]
      }
    },
    "correctAnswerIndex": 1,
    "misconceptions": [
      {
        "index": 0,
        "description": "Confuses Wire with runtime DI frameworks like Spring (Java) or runtime reflection"
      },
      {
        "index": 2,
        "description": "Misunderstands lazy initialization—Wire generates code once, not on first use"
      },
      {
        "index": 3,
        "description": "Thinks compile-time benefits only apply to tests; misses production safety"
      }
    ],
    "explanation": {
      "th": "Wire is a code generator that runs during the `go generate` step, which is part of compiling Go code. It generates the Go source code for the dependency graph—it does not execute at runtime or do lazy initialization.\n\nAdvantages:\n- No runtime overhead (no reflection needed)\n- Errors are caught at compile-time\n- Saves binary size (only the dependencies you need)",
      "en": "Wire is a code generator that runs during `go generate` as part of the Go compilation pipeline. It generates Go source code representing your dependency graph—not executed at runtime or lazily. This gives Wire its key advantages: zero runtime overhead, compile-time error checking, and minimal binary size."
    },
    "codeExample": {
      "scenario": "You have a wire.Build() call in your injector. When does Wire create the wiring code?",
      "code": "// injector.go\nfunc InitApp() (*App, error) {\n  wire.Build(\n    NewConfig,\n    NewDB,\n    NewService,\n    wire.Bind(new(Logger), new(*ConsoleLogger)),\n  )\n  return nil, nil\n}\n\n// This function body is replaced during `go generate`"
    },
    "relatedConcepts": ["compile-time-di", "wire-build", "no-reflection"],
    "tags": ["core", "foundational"]
  }
}
```

### Field Descriptions

| Field | Type | Purpose |
|-------|------|---------|
| `id` | string | Unique ID: `{chapter}-q{number}` |
| `chapterId` | string | Links question to course chapter |
| `difficulty` | enum | Difficulty level for filtering/analysis |
| `bloomLevel` | enum | Cognitive level: remember/understand/apply/analyze |
| `objective` | string | Learning outcome this question targets |
| `i18n.th` / `i18n.en` | object | Thai & English question + options |
| `correctAnswerIndex` | int | 0–3, index into options array |
| `misconceptions` | array | Map each distractor to the misconception it reflects |
| `explanation` | object | Thai + English explanation, 2–4 sentences + context |
| `codeExample` | object | Optional: scenario + code snippet |
| `relatedConcepts` | array | Tags for adaptive quiz routing |
| `tags` | array | Meta: "core", "edge-case", "common-bug", etc. |

---

## 4. Exemplar Quiz Questions

### Question 1: Compile-Time vs Runtime (Easy, Remember/Understand)

```json
{
  "id": "wire-ch01-q01",
  "chapterId": "ch01-intro",
  "difficulty": "easy",
  "bloomLevel": "understand",
  "objective": "Distinguish Wire's compile-time model from runtime DI frameworks",
  "i18n": {
    "th": {
      "question": "Which statement correctly describes how Wire works?",
      "options": [
        "A. Wire uses reflection to build the dependency graph while the program runs",
        "B. Wire generates the constructor's Go code at compile-time, with no runtime overhead",
        "C. Wire is a library that must be added to the binary's dependencies",
        "D. Wire increases binary size because it must store dependency metadata"
      ]
    },
    "en": {
      "question": "Which statement correctly describes how Wire works?",
      "options": [
        "A. Wire uses reflection to build dependency graphs at runtime",
        "B. Wire generates Go constructor code at compile-time with zero runtime cost",
        "C. Wire is a library included in the binary to resolve dependencies",
        "D. Wire increases binary size by storing dependency metadata"
      ]
    }
  },
  "correctAnswerIndex": 1,
  "misconceptions": [
    {
      "index": 0,
      "description": "Confuses Wire with Spring or other JVM DI frameworks that use runtime reflection"
    },
    {
      "index": 2,
      "description": "Misunderstands code generation—thinks Wire is a linked library, not a build tool"
    },
    {
      "index": 3,
      "description": "Thinks compile-time code generation adds runtime/binary overhead"
    }
  ],
  "explanation": {
    "th": "Wire is a code generator that runs as part of the build process (via `go generate`). It is not a reflection framework like Spring that operates at runtime. Wire generates plain Go constructor code at compile-time, so there is no runtime overhead, no metadata to store, and the binary does not grow larger.",
    "en": "Wire is a code generator that runs as part of the build process (via `go generate`), not a reflection framework like Spring. It generates plain Go constructor code at compile-time, so there is zero runtime overhead, no metadata storage needed, and no binary bloat."
  },
  "tags": ["core", "foundational"]
}
```

### Question 2: wire.Build() and Code Generation (Easy, Remember)

```json
{
  "id": "wire-ch02-q01",
  "chapterId": "ch02-basics",
  "difficulty": "easy",
  "bloomLevel": "remember",
  "objective": "Recognize the role of wire.Build() in the code generation process",
  "i18n": {
    "th": {
      "question": "What does the wire.Build() function do in the wire_gen.go file?",
      "options": [
        "A. Loads dependencies from a configuration file at runtime",
        "B. Resolves the dependencies that Wire generates automatically at compile-time",
        "C. Declares providers for Wire that can be used in the program",
        "D. Manages resource cleanup during graceful shutdown"
      ]
    },
    "en": {
      "question": "What is the purpose of wire.Build() in the wire_gen.go file?",
      "options": [
        "A. Load dependencies from a config file at runtime",
        "B. Declare which dependencies Wire should wire together (Wire generates the actual constructor)",
        "C. Define providers available to the program at runtime",
        "D. Manage resource cleanup during graceful shutdown"
      ]
    }
  },
  "correctAnswerIndex": 1,
  "misconceptions": [
    {
      "index": 0,
      "description": "Confuses wire.Build() with configuration loading (external, not code generation)"
    },
    {
      "index": 2,
      "description": "Misunderstands that wire.Build() is a declaration for the code generator, not a runtime provider resolver"
    },
    {
      "index": 3,
      "description": "Conflates cleanup functions (separate) with wire.Build()"
    }
  ],
  "explanation": {
    "th": "wire.Build() is a declaration telling Wire what constructor we want it to generate. You pass provider functions and wire.Bind calls to wire.Build(). The Wire code generator reads this and produces the actual constructor Go code that injects the dependencies correctly. The wire.Build() function itself does nothing at runtime.",
    "en": "wire.Build() is a declaration telling Wire what constructor to generate. You pass provider functions and wire.Bind calls to wire.Build(). The Wire code generator reads this and generates the actual Go constructor code. wire.Build() itself does nothing at runtime—it's a compile-time instruction."
  },
  "codeExample": {
    "scenario": "When you call go generate, Wire reads this wire.Build() declaration:",
    "code": "func InitApp() (*App, error) {\n  wire.Build(\n    NewConfig,\n    NewDatabase,\n    NewService,\n  )\n  return nil, nil  // Wire replaces this with actual wiring code\n}"
  },
  "tags": ["core", "foundational"]
}
```

### Question 3: Misconception—Forget wire.Bind for Interfaces (Medium, Apply)

```json
{
  "id": "wire-ch03-q02",
  "chapterId": "ch03-providers",
  "difficulty": "medium",
  "bloomLevel": "apply",
  "objective": "Recognize when wire.Bind() is required for interface implementation",
  "i18n": {
    "th": {
      "question": "You have the following interface Logger and concrete type ConsoleLogger:\n\ntype Logger interface {\n  Log(msg string)\n}\n\ntype ConsoleLogger struct {}\n\nfunc (c *ConsoleLogger) Log(msg string) { ... }\n\nThe function NewConsoleLogger() (*ConsoleLogger, error) creates the ConsoleLogger.\n\nIf you want to inject the Logger interface (not ConsoleLogger) into another service, what should wire.Build() contain?",
      "options": [
        "A. wire.Build(NewConsoleLogger) alone will automatically bind ConsoleLogger to Logger",
        "B. wire.Build(NewConsoleLogger, wire.Bind(new(Logger), new(*ConsoleLogger)))",
        "C. wire.Build(NewConsoleLogger, NewLogger) where NewLogger returns the Logger interface",
        "D. wire.Build(NewConsoleLogger) and change the service's parameter to *ConsoleLogger instead of Logger"
      ]
    },
    "en": {
      "question": "You have an interface Logger and concrete type ConsoleLogger:\n\ntype Logger interface {\n  Log(msg string)\n}\n\ntype ConsoleLogger struct {}\n\nfunc (c *ConsoleLogger) Log(msg string) { ... }\n\nNewConsoleLogger() (*ConsoleLogger, error) creates the ConsoleLogger.\n\nIf you want to inject the Logger interface (not ConsoleLogger) into another service, what should wire.Build() contain?",
      "options": [
        "A. wire.Build(NewConsoleLogger) alone—Wire auto-converts to Logger",
        "B. wire.Build(NewConsoleLogger, wire.Bind(new(Logger), new(*ConsoleLogger)))",
        "C. wire.Build(NewConsoleLogger, NewLogger) where NewLogger returns Logger",
        "D. wire.Build(NewConsoleLogger) and change service params to *ConsoleLogger instead"
      ]
    }
  },
  "correctAnswerIndex": 1,
  "misconceptions": [
    {
      "index": 0,
      "description": "Expects Wire to automatically convert *ConsoleLogger to Logger; Wire requires explicit wire.Bind() for interface bindings"
    },
    {
      "index": 2,
      "description": "Tries to wrap the provider in another provider, which adds unnecessary indirection; wire.Bind() is the correct idiom"
    },
    {
      "index": 3,
      "description": "Avoids the interface entirely, breaking abstraction and making refactoring harder"
    }
  ],
  "explanation": {
    "th": "Wire cannot create an implicit type conversion from *ConsoleLogger to the Logger interface automatically. You must declare it explicitly with wire.Bind(new(Logger), new(*ConsoleLogger)), which tells Wire: \"when someone needs the Logger interface, use the *ConsoleLogger provider.\" This is a common problem—forgetting wire.Bind() leads to a compile-time error during go generate.",
    "en": "Wire cannot implicitly convert *ConsoleLogger to Logger. You must explicitly declare wire.Bind(new(Logger), new(*ConsoleLogger)), which tells Wire: \"when someone requests the Logger interface, use the *ConsoleLogger provider.\" This is a common mistake—forgetting wire.Bind() causes `go generate` to fail with a type mismatch error."
  },
  "codeExample": {
    "scenario": "Correct usage with wire.Bind():",
    "code": "func InitApp() (*App, error) {\n  wire.Build(\n    NewConsoleLogger,\n    wire.Bind(new(Logger), new(*ConsoleLogger)),\n    NewService, // Service needs Logger interface\n  )\n  return nil, nil\n}\n\n// Without wire.Bind(), Wire cannot inject Logger into Service."
  },
  "relatedConcepts": ["wire-bind", "interface-binding"],
  "tags": ["core", "common-bug"]
}
```

### Question 4: Cleanup Functions & Execution Order (Medium, Apply)

```json
{
  "id": "wire-ch04-q01",
  "chapterId": "ch04-cleanup",
  "difficulty": "medium",
  "bloomLevel": "apply",
  "objective": "Understand cleanup function order and resource lifecycle",
  "i18n": {
    "th": {
      "question": "If you have the following cleanup functions:\n\nfunc NewDB() (*DB, func(), error) {\n  db := &DB{...}\n  return db, func() { db.Close() }, nil\n}\n\nfunc NewService(db *DB) (*Service, func(), error) {\n  svc := &Service{DB: db}\n  return svc, func() { svc.Shutdown() }, nil\n}\n\nand you run cleanup for both, what should the execution order be?",
      "options": [
        "A. Shutdown the service, then close the database (FIFO)",
        "B. Close the database, then shutdown the service (LIFO)",
        "C. Order doesn't matter because both are independent resources",
        "D. Shutdown the service and close the database at the same time (parallel)"
      ]
    },
    "en": {
      "question": "Given cleanup functions:\n\nfunc NewDB() (*DB, func(), error) {\n  return db, func() { db.Close() }, nil\n}\n\nfunc NewService(db *DB) (*Service, func(), error) {\n  return svc, func() { svc.Shutdown() }, nil\n}\n\nWhen cleanup runs, what order should the functions execute?",
      "options": [
        "A. Shutdown service, then close database (FIFO)",
        "B. Close database, then shutdown service (LIFO—reverse creation order)",
        "C. Order doesn't matter; they're independent resources",
        "D. Both shutdown and close execute in parallel"
      ]
    }
  },
  "correctAnswerIndex": 1,
  "misconceptions": [
    {
      "index": 0,
      "description": "Assumes FIFO (first in, first out) cleanup; Wire uses LIFO (stack unwinding) to respect dependencies"
    },
    {
      "index": 2,
      "description": "Overlooks that Service depends on DB; closing DB before shutting down Service risks use-after-close"
    },
    {
      "index": 3,
      "description": "Doesn't realize cleanup order matters; parallel cleanup can cause race conditions"
    }
  ],
  "explanation": {
    "th": "Wire runs cleanups in reverse order (LIFO—last in, first out) of resource creation. Service was created after DB, so you must shutdown the service first and then close the database. This follows the order of the dependency tree—anything that depends on DB must be cleaned up before DB is closed. If you close DB first, Service might try to use a DB that is already closed, causing an error.",
    "en": "Wire executes cleanup functions in LIFO order (reverse of creation). Service was created after DB, so Service.Shutdown() must run before DB.Close(). This respects dependency order—anything that depends on DB must clean up first. Reversing this order risks \"use-after-close\" bugs."
  },
  "codeExample": {
    "scenario": "Wire-generated cleanup function (conceptually):",
    "code": "// Generated by Wire:\nfunc cleanup() error {\n  // Cleanup in reverse order of creation:\n  serviceCleanup()  // Service shutdown first\n  dbCleanup()       // Then close DB\n  return nil\n}"
  },
  "relatedConcepts": ["cleanup-functions", "resource-lifecycle"],
  "tags": ["core", "common-bug"]
}
```

### Question 5: Multiple Injectors & Scope (Hard, Analyze)

```json
{
  "id": "wire-ch05-q02",
  "chapterId": "ch05-advanced",
  "difficulty": "hard",
  "bloomLevel": "analyze",
  "objective": "Compare singleton vs per-call provider scope across multiple injectors",
  "i18n": {
    "th": {
      "question": "You have two injectors for an application:\n\nfunc InitAPIServer() (*http.Server, error) {\n  wire.Build(NewConfig, NewAPIHandler)\n  return nil, nil\n}\n\nfunc InitWorkerPool() (*WorkerPool, error) {\n  wire.Build(NewConfig, NewWorkerTask)\n  return nil, nil\n}\n\nBoth APIHandler and WorkerTask need *Config.\nNewConfig() creates a new Config instance each time it is called.\n\nIn which situation do API Server and Worker Pool use the same Config instance?",
      "options": [
        "A. Always—Wire shares singleton instances across all injectors",
        "B. Never—each injector creates a new Config instance independently",
        "C. When NewConfig is a global variable instead of a function provider",
        "D. When InitAPIServer() and InitWorkerPool() are called from the same injector (a single wire.Build call)"
      ]
    },
    "en": {
      "question": "You have two injectors:\n\nfunc InitAPIServer() (*http.Server, error) {\n  wire.Build(NewConfig, NewAPIHandler)\n  return nil, nil\n}\n\nfunc InitWorkerPool() (*WorkerPool, error) {\n  wire.Build(NewConfig, NewWorkerTask)\n  return nil, nil\n}\n\nBoth APIHandler and WorkerTask need *Config.\nNewConfig() creates a new instance each time.\n\nWhen do API Server and Worker Pool share the same Config instance?",
      "options": [
        "A. Always—Wire shares singletons across all injectors",
        "B. Never—each injector creates independent Config instances",
        "C. When NewConfig is a global variable, not a provider function",
        "D. When InitAPIServer() and InitWorkerPool() are called from the same injector (one wire.Build)"
      ]
    }
  },
  "correctAnswerIndex": 1,
  "misconceptions": [
    {
      "index": 0,
      "description": "Assumes Wire manages global singletons; Wire scopes are per-injector, not global"
    },
    {
      "index": 2,
      "description": "Thinks global variables are the solution; Wire providers are cleaner and more testable"
    },
    {
      "index": 3,
      "description": "Confuses \"same injector\" with \"share instance\"—correct that both must come from same wire.Build, but mis-states the reason"
    }
  ],
  "explanation": {
    "th": "Wire has no global singleton registry. Each injector builds its own separate dependency graph. If InitAPIServer() and InitWorkerPool() are different injectors and both call NewConfig(), they each get a different Config instance. If you want to share Config, create a higher-level injector (a parent injector) that builds Config only once, and make both API Server and Worker Pool depend on this injector.",
    "en": "Wire has no global singleton registry. Each injector builds its own independent dependency graph. If InitAPIServer() and InitWorkerPool() are separate injectors, each calls NewConfig() independently—two instances. To share a Config, create a parent injector that builds Config once, and make both APIServer and WorkerPool depend on it."
  },
  "codeExample": {
    "scenario": "Sharing Config across injectors (parent injector pattern):",
    "code": "// Parent injector:\nfunc InitApp() (*App, error) {\n  wire.Build(\n    NewConfig,\n    InitAPIServer,  // Receives Config as param\n    InitWorkerPool, // Receives Config as param\n    NewApp,\n  )\n  return nil, nil\n}\n\nfunc InitAPIServer(cfg *Config) (*http.Server, error) {\n  wire.Build(NewAPIHandler)\n  return nil, nil\n}\n\nfunc InitWorkerPool(cfg *Config) (*WorkerPool, error) {\n  wire.Build(NewWorkerTask)\n  return nil, nil\n}"
  },
  "relatedConcepts": ["multiple-injectors", "scoping", "parent-injectors"],
  "tags": ["advanced", "scoping"]
}
```

### Question 6: Error Handling in Providers (Medium, Apply)

```json
{
  "id": "wire-ch03-q03",
  "chapterId": "ch03-providers",
  "difficulty": "medium",
  "bloomLevel": "apply",
  "objective": "Understand error handling in provider function signatures",
  "i18n": {
    "th": {
      "question": "Your provider function NewDatabase() needs to handle errors in case the database connection fails. Which is the correct signature?",
      "options": [
        "A. func NewDatabase() *Database { ... }",
        "B. func NewDatabase() (*Database, error) { ... }",
        "C. func NewDatabase() (error, *Database) { ... }",
        "D. func NewDatabase() *Database { return nil } // does not handle errors"
      ]
    },
    "en": {
      "question": "Your NewDatabase() provider needs to handle errors if the connection fails. What is the correct signature?",
      "options": [
        "A. func NewDatabase() *Database { ... }",
        "B. func NewDatabase() (*Database, error) { ... }",
        "C. func NewDatabase() (error, *Database) { ... }",
        "D. func NewDatabase() *Database { return nil } // no error handling"
      ]
    }
  },
  "correctAnswerIndex": 1,
  "misconceptions": [
    {
      "index": 0,
      "description": "Ignores error handling; Wire providers that can fail must return error"
    },
    {
      "index": 2,
      "description": "Uses wrong return order; Go idiom is (value, error), not (error, value)"
    },
    {
      "index": 3,
      "description": "Tries to hide errors by returning nil; Wire needs explicit error signals"
    }
  ],
  "explanation": {
    "th": "The Go convention is that a function that may fail returns (value, error), not (error, value). Wire supports providers that return an error—if NewDatabase() fails, Wire propagates the resulting error as the return value of InitApp() (the injector function). This lets you handle initialization errors appropriately.",
    "en": "Go convention is (value, error) return order, not (error, value). Wire supports providers that return errors. If NewDatabase() fails, Wire propagates the error as the return value of your injector function (e.g., InitApp()). This allows proper error handling during initialization."
  },
  "codeExample": {
    "scenario": "Correct provider with error handling:",
    "code": "func NewDatabase() (*Database, error) {\n  db, err := sql.Open(\"postgres\", dsn)\n  if err != nil {\n    return nil, fmt.Errorf(\"failed to connect: %w\", err)\n  }\n  return &Database{conn: db}, nil\n}\n\nfunc InitApp() (*App, error) {\n  wire.Build(NewDatabase, NewService)\n  return nil, nil\n}\n\n// Caller:\napp, err := InitApp()\nif err != nil {\n  log.Fatal(err)\n}"
  },
  "relatedConcepts": ["provider-functions", "error-handling"],
  "tags": ["core", "error-handling"]
}
```

### Question 7: wire.Build vs Manual Constructor (Hard, Analyze)

```json
{
  "id": "wire-ch02-q04",
  "chapterId": "ch02-basics",
  "difficulty": "hard",
  "bloomLevel": "analyze",
  "objective": "Evaluate tradeoffs between Wire and manual dependency construction",
  "i18n": {
    "th": {
      "question": "You're writing a Go service with 8 dependencies and 3 cleanup functions. What benefit does using the Wire generator provide compared to writing the constructor manually?",
      "options": [
        "A. Wire makes the code run faster via compile-time dependency resolution",
        "B. Wire validates the dependency graph at compile-time, reduces binary size, and removes boilerplate",
        "C. Wire can reload dependencies without restarting the application",
        "D. Wire reduces the number of packages that must be imported"
      ]
    },
    "en": {
      "question": "You're writing a Go service with 8 dependencies and 3 cleanup functions. What benefits does Wire bring vs a manual constructor?",
      "options": [
        "A. Wire makes code run faster via compile-time resolution",
        "B. Wire validates the dependency graph at compile-time, reduces binary size, eliminates boilerplate",
        "C. Wire allows reloading dependencies without restarting the app",
        "D. Wire reduces the number of imports needed"
      ]
    }
  },
  "correctAnswerIndex": 1,
  "misconceptions": [
    {
      "index": 0,
      "description": "Confuses code generation with runtime performance; Wire's benefit is compile-time correctness, not speed"
    },
    {
      "index": 2,
      "description": "Thinks Wire enables runtime reconfiguration; Wire is static, no hot reload"
    },
    {
      "index": 3,
      "description": "Underestimates Wire's main benefit: dependency graph validation and eliminating manual wiring errors"
    }
  ],
  "explanation": {
    "th": "Wire provides three benefits:\n\n1. **Compile-time verification:** No typos or missing dependencies—everything is checked at compile time.\n\n2. **Eliminate boilerplate:** A manual constructor would be 50+ lines (nil checks, repetitive error handling). Wire generates only the minimal code needed.\n\n3. **Binary efficiency:** Wire adds only the necessary code, with no reflection metadata overhead.\n\nFor 8 dependencies, a manual constructor is error-prone (forgetting a binding, wrong cleanup order, missing nil checks). Wire checks at compile time—reducing initialization bugs by around 30%.",
    "en": "Wire provides three key benefits:\n\n1. **Compile-time verification:** No typos or missing dependencies—all caught at build time.\n2. **Eliminate boilerplate:** A manual constructor for 8 dependencies is 50+ lines of repetitive code. Wire generates only what's needed.\n3. **Binary efficiency:** Wire adds only necessary code; zero reflection overhead.\n\nFor 8 dependencies, manual construction is error-prone (forgotten bindings, wrong cleanup order, missing nil checks). Wire catches these at compile-time."
  },
  "relatedConcepts": ["wire-benefits", "code-generation", "boilerplate"],
  "tags": ["core", "foundational"]
}
```

### Question 8: Struct Field Injection vs Constructor Injection (Hard, Analyze)

```json
{
  "id": "wire-ch06-q01",
  "chapterId": "ch06-patterns",
  "difficulty": "hard",
  "bloomLevel": "analyze",
  "objective": "Understand Wire's use of struct field injection and its implications",
  "i18n": {
    "th": {
      "question": "Wire chooses to use struct field injection (passing dependencies as struct fields) instead of constructor parameters. Why is this approach used in the context of code generation?",
      "options": [
        "A. Because struct fields use less memory than parameters",
        "B. Because a code generator can handle struct fields more easily with reflection",
        "C. Because a code generator can have field tags (such as `wire:\"\"`) to pass hints and reduce confusion",
        "D. Because struct fields make testing easier"
      ]
    },
    "en": {
      "question": "Why does Wire use struct field injection (populating struct fields) instead of constructor parameters?",
      "options": [
        "A. Struct fields use less memory than parameters",
        "B. A code generator can handle struct fields via reflection more easily",
        "C. A code generator can use field tags (like `wire:\"\"`) for hints and clarity",
        "D. Struct fields make testing easier"
      ]
    }
  },
  "correctAnswerIndex": 2,
  "misconceptions": [
    {
      "index": 0,
      "description": "Misunderstands performance; field vs parameter overhead is negligible"
    },
    {
      "index": 1,
      "description": "Incorrectly thinks Wire uses reflection; Wire uses struct tags as metadata, not runtime reflection"
    },
    {
      "index": 3,
      "description": "Conflates testability with injection style; manual mocks work equally well with both"
    }
  ],
  "explanation": {
    "th": "Wire uses struct fields (with struct tags) because:\n\n1. **Code clarity:** Field tags give explicit hints about which field needs injection (e.g., `wire:\"\"` or `inject:\"true\"`).\n\n2. **No constructor explosion:** With 10+ dependencies, the constructor function would have a long list of parameters—hard to read and hard to edit. Struct fields are clear—you can see which field will be injected.\n\n3. **Flexibility:** The code generator can use field tags to instruct Wire (e.g., \"inject this optional field\" or \"this field is populated elsewhere\").\n\nIn every case, Wire still generates plain Go code—no runtime reflection.",
    "en": "Wire uses struct fields (with struct tags) because:\n\n1. **Code clarity:** Struct tags provide explicit hints about which fields are injected (e.g., `wire:\"\"`).\n2. **No constructor bloat:** 10+ dependencies as constructor params becomes unwieldy. Struct fields are self-documenting.\n3. **Flexibility:** Field tags allow the code generator to express hints like \"optional,\" \"exclude,\" or custom directives.\n\nWire still generates plain Go code—no runtime reflection."
  },
  "codeExample": {
    "scenario": "Wire struct field injection pattern:",
    "code": "type Service struct {\n  DB     *Database `wire:\"\"`\n  Logger Logger    `wire:\"\"`\n  Config *Config   `wire:\"\"`\n}\n\n// Wire code generator fills these fields via generated constructor,\n// not reflection. Generated code is plain Go assignment."
  },
  "relatedConcepts": ["struct-tags", "injection-styles"],
  "tags": ["advanced"]
}
```

---

## 5. Scoring Logic

### Calculation
```
score = (correct_answers / total_questions) × 100
```

### Thresholds
| Score | Status | Action |
|-------|--------|--------|
| ≥ 80% | **PASS** | Unlock next chapter; record in localStorage |
| < 80% | **FAIL** | Offer retry; show performance breakdown by concept |

### Retry Rules
- **Unlimited retries:** No penalty; encourages mastery
- **Question shuffling:** Each retry reshuffles both questions and options (seeded by `userId + attemptNumber` for consistency review)
- **Score tracking:** Track all attempts; final score is the highest pass (or latest attempt if never passed)

### Cumulative Score Tracking

```json
{
  "quizScores": {
    "user-id-123": {
      "ch01-intro": {
        "attempts": [
          {
            "timestamp": "2025-06-01T10:30:00Z",
            "score": 75,
            "answers": [0, 2, 1, 3, 1],
            "passed": false
          },
          {
            "timestamp": "2025-06-01T11:15:00Z",
            "score": 90,
            "answers": [1, 2, 1, 1, 1],
            "passed": true
          }
        ],
        "finalScore": 90,
        "unlocked": true
      },
      "ch02-basics": {
        "attempts": [],
        "finalScore": null,
        "unlocked": false
      }
    }
  }
}
```

### localStorage Keys
```javascript
// Quiz attempts by chapter
key: `quiz:${userId}:${chapterId}:attempts` (JSON array)

// Final score per chapter
key: `quiz:${userId}:${chapterId}:finalScore` (number)

// Chapter unlock status
key: `quiz:${userId}:${chapterId}:unlocked` (boolean)

// Session: current quiz state (for in-progress quizzes)
key: `quiz:${userId}:${chapterId}:current` 
value: { questionIds, userAnswers, startTime, endTime }
```

### Example Score Storage
```javascript
// User completes ch01 quiz with 8/10 (80%)
localStorage.setItem(
  'quiz:user-123:ch01-intro:attempts',
  JSON.stringify([{
    timestamp: '2025-06-01T10:30:00Z',
    score: 80,
    answers: [1, 0, 1, 3, 1, 2, 1, 0, 1, 3],
    passed: true
  }])
);

localStorage.setItem('quiz:user-123:ch01-intro:finalScore', '80');
localStorage.setItem('quiz:user-123:ch01-intro:unlocked', 'true');
```

---

## 6. Quiz Density & Rigor per Chapter

### Goal
Ensure 80% pass threshold is genuinely earned (not lucky), and quizzes reinforce all learning objectives.

### Density rule (REVISED — implemented)
- **Each chapter ships a question bank of ≥18 questions.**
- **Each attempt draws 15 questions** from that bank (`CONFIG.quizSize = 15`), with **question order and option order shuffled** every attempt.
- **Pass = 80% = ≥12/15 correct.** Drawing a fresh 15 from a larger pool on each retry means re-takes can't be memorized by position, and option shuffling neutralizes any "always pick the same letter" exploit even if a bank's correct-answer positions are skewed.
- Across all 10 chapters this is **180+ questions** total (vs. the original ~40).

| Chapter | Bank size (min) | Drawn per attempt | Pass |
|---------|-----------------|-------------------|------|
| Every chapter (Ch01–Ch10) | ≥18 | 15 | ≥12/15 (80%) |

### Distribution by Bloom Level (per ≥18-question bank)
- **Remember (10–15%):** 2–3 questions
- **Understand (30–40%):** 6–7
- **Apply (25–35%):** 5–6
- **Analyze (15–20%):** 3–4

### Quality Checks

Before publishing a quiz question:

1. **Misconception authenticity:** Does the wrong answer reflect a real mistake learners make, or is it arbitrary?
2. **One concept focus:** Does this question test exactly one learning objective, or does it mix multiple?
3. **Code accuracy:** Is all example code correct and runnable (or at least correct pseudocode)?
4. **Explanation completeness:** Does the explanation answer not just "why this is correct" but "why each wrong answer is wrong"?
5. **80% rigor:** Would a learner who truly understood this chapter's learning outcomes pass this question reliably?

### Example Rigor Calculation

**Ch03 Providers (8 questions):**
- Easy (Remember/Understand): 3 questions → must get ≥2 correct (67%)
- Medium (Apply): 3 questions → must get ≥2 correct (67%)
- Hard (Analyze): 2 questions → must get ≥1 correct (50%)

**Minimum to pass 80%:** 5/8 correct. This requires:
- Understanding basic provider syntax
- Knowing wire.Bind rules + error handling
- Ability to analyze a scenario (at least 1/2 hard questions)

A learner who skimmed the chapter or memorized definitions would likely fail (getting only 4–5 by guessing on hard questions).

---

## 7. Implementation Roadmap (Sketch)

### Phase 1: Frontend (React component)
- Quiz display: question, options (A/B/C/D), radio buttons
- Timer (optional)
- Submit & see results page (score, explanation, retry button)
- localStorage integration

### Phase 2: Quiz data
- Load questions JSON (can embed in app or fetch from API)
- Support multiple languages (i18n)
- Filter by chapter, difficulty for adaptive quizzes (future)

### Phase 3: Analytics & UX
- Dashboard: chapter progress, scores, weak areas
- Adaptive quiz routing: if learner fails on "wire.Bind" questions, show more practice
- Spaced repetition: flag difficult questions for review before next chapter

---

## Appendix: JSON Schema (Complete)

See Section 3 for detailed schema. Key validation rules:

```
- id: must be unique within course
- correctAnswerIndex: must be 0–3
- options (i18n.th.options, i18n.en.options): must have exactly 4 items
- bloomLevel: enum ["remember", "understand", "apply", "analyze"]
- difficulty: enum ["easy", "medium", "hard"]
- misconceptions: array length == 4 (one per option/distractor)
```

---

## Summary

This quiz system balances **pedagogical rigor** (Hinge Questions, Bloom's levels, authentic misconceptions) with **Wire expertise** (compile-time, wire.Bind, cleanup order, scoping) and **practical implementation** (JSON schema, localStorage, scoring). The 80% threshold is earned only by learners who truly understand core Wire concepts—not through lucky guessing or keyword matching.
