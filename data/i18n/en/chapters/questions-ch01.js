/* questions ch01 (EN) */
(window.QUESTIONS_EN = window.QUESTIONS_EN || {}).ch01 = [
  {
    "id": "wire-ch01-q01",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "What is Dependency Injection (DI)?",
    "options": [
      "A technique where an object creates its own dependencies inside the constructor",
      "A technique where dependencies are passed in from the outside instead of the object creating them itself",
      "A library for managing configuration in Go applications",
      "A way to embed one struct into another using Go embedding"
    ],
    "correctAnswerIndex": 1,
    "explanation": "<b>DI</b> means passing dependencies into an object from outside rather than having the object create them itself. This keeps components decoupled and makes them easier to test. The first option describes creating dependencies inside the constructor, which is the opposite of DI; the remaining options are unrelated to DI."
  },
  {
    "id": "wire-ch01-q02",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "What is Google Wire?",
    "options": [
      "A runtime dependency injection container for Go, similar to Spring Framework",
      "A code generation tool for compile-time dependency injection in Go",
      "A reflection library that lets a Go app wire dependencies automatically at runtime",
      "A service locator that uses a global registry to store a Go application's dependencies"
    ],
    "correctAnswerIndex": 1,
    "explanation": "<b>Google Wire</b> is a <b>code generator</b> that produces initialization code at compile-time without using reflection at runtime. Unlike Spring or a service locator — which operate at runtime — Wire reads provider functions and emits plain Go code, giving you the same performance as hand-written wiring."
  },
  {
    "id": "wire-ch01-q03",
    "difficulty": "easy",
    "bloomLevel": "understand",
    "question": "What is the main problem with wiring dependencies by hand in a large Go application?",
    "options": [
      "Go does not support interfaces, so you must use concrete types, leading to high coupling",
      "Manual wiring makes the binary larger because of reflection overhead",
      "The main or bootstrap function becomes very large, hard to maintain, and difficult to extend with new dependencies",
      "Go has no garbage collector, so you must manage dependency memory manually"
    ],
    "correctAnswerIndex": 2,
    "explanation": "When an application has dozens or hundreds of components, the hand-written wiring code (usually in <code>main.go</code>) becomes large, brittle, and hard to change. Adding a single new dependency can require edits in multiple places. Go does support interfaces and does have a GC; reflection is not involved in manual wiring."
  },
  {
    "id": "wire-ch01-q04",
    "difficulty": "easy",
    "bloomLevel": "understand",
    "question": "How does constructor injection differ from a service locator?",
    "options": [
      "Constructor injection is faster because it uses less reflection than a service locator",
      "Constructor injection declares dependencies explicitly in the signature, while a service locator pulls dependencies from a global registry inside the function",
      "A service locator is safer because it performs type checking at compile-time",
      "Constructor injection and service locator are different names for the same technique"
    ],
    "correctAnswerIndex": 1,
    "explanation": "<b>Constructor injection</b> makes dependencies visible in the function signature — the caller knows exactly what to provide. A <b>service locator</b> hides dependencies internally; the component fetches what it needs from a global registry, making testing harder and dependencies opaque. A service locator does not offer better compile-time type safety."
  },
  {
    "id": "wire-ch01-q05",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "Why does Wire choose code generation over runtime reflection?",
    "options": [
      "Because Go has no reflection API, so code generation is the only option",
      "So that wiring errors surface at compile-time rather than at runtime, and there is no reflection overhead",
      "Because code generation always produces a smaller binary than reflection",
      "Because Go's reflection does not support structs with more than 10 fields"
    ],
    "correctAnswerIndex": 1,
    "explanation": "The key advantages of compile-time code generation are: (1) errors such as missing providers or type mismatches are caught during <code>go generate</code> before deployment, and (2) the output is plain Go code with no reflection overhead, giving fast startup. Go does have a reflect package; binary size and struct field limits are not valid reasons."
  },
  {
    "id": "wire-ch01-q06",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "How do Uber dig and Uber fx differ from Google Wire in their DI approach?",
    "options": [
      "dig/fx use compile-time code generation like Wire but support more scopes",
      "dig/fx are runtime DI containers that use reflection, while Wire is a compile-time code generator",
      "Wire supports circular dependencies but dig/fx do not",
      "dig/fx are written in C++ and therefore faster than Wire which is written in Go"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Uber's <b>dig and fx</b> are <b>runtime DI containers</b> — they use Go's reflect package to analyze types and wire dependencies when the application starts. Wiring errors appear at runtime. <b>Wire</b> generates plain Go code at compile-time, catching errors earlier and eliminating reflection overhead."
  },
  {
    "id": "wire-ch01-q07",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "Consider this code:\n\nfunc NewServer(db *Database, logger *Logger) *Server {\n    return &Server{db: db, logger: logger}\n}\n\nWhat pattern is this, and what are its benefits?",
    "code": "func NewServer(db *Database, logger *Logger) *Server {\n    return &Server{db: db, logger: logger}\n}",
    "options": [
      "Service locator — lets the component fetch dependencies on demand",
      "Constructor injection — dependencies are explicit, easy to test, and compiler-checked",
      "Singleton pattern — prevents unnecessary creation of multiple Server instances",
      "Factory method — hides object creation details inside"
    ],
    "correctAnswerIndex": 1,
    "explanation": "<code>NewServer</code> receives its dependencies via parameters — this is <b>constructor injection</b>. Benefits: all dependencies are declared explicitly in the signature, the compiler verifies types, and tests can easily pass in mocks. A service locator would pull dependencies from a registry internally, not accept them as parameters."
  },
  {
    "id": "wire-ch01-q08",
    "difficulty": "medium",
    "bloomLevel": "analyze",
    "question": "Does a Go application that uses Wire have a slower startup time than one wired by hand? Why or why not?",
    "options": [
      "Slower, because Wire must scan struct tags when the app starts",
      "Slightly slower, because Wire loads the dependency graph from a config file at startup",
      "Not slower, because Wire generates plain Go code at compile-time with no extra work at runtime",
      "Faster, because Wire uses a built-in lazy initialization mechanism"
    ],
    "correctAnswerIndex": 2,
    "explanation": "Wire has <b>no runtime overhead</b>. Its output, <code>wire_gen.go</code>, is plain Go code — identical in every way to what a developer would write by hand. There is no reflection, no config loading, and no struct tag scanning at startup. Startup time is equivalent to manual wiring."
  },
  {
    "id": "wire-ch01-q09",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "What is the most significant drawback of using the service locator pattern to manage dependencies?",
    "options": [
      "A service locator always performs worse than constructor injection because of additional heap allocations",
      "Dependencies hidden inside a component make testing difficult, because you must set up a global registry before every test",
      "The Go compiler rejects the service locator pattern because it violates the Go specification",
      "A service locator does not support interface types and can only be used with concrete types"
    ],
    "correctAnswerIndex": 1,
    "explanation": "The main problem with <b>service locator</b> is that dependencies are hidden — there is no way to know from the signature what a component needs. This makes testing very painful (you must set up the global registry before each test) and creates tight coupling to the registry. The Go compiler does not prohibit service locators, and performance is not the primary concern."
  },
  {
    "id": "wire-ch01-q10",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "A developer claims: \"Wire makes binaries larger because it bundles the code generator into the binary.\" Is this claim correct or incorrect?",
    "options": [
      "Correct — the Wire tool is linked into the binary, adding roughly 2-5 MB",
      "Partially correct — the Wire tool is not linked in, but the generated code is larger than hand-written wiring",
      "Incorrect — Wire is only a build-time tool that runs during <code>go generate</code>; no part of Wire exists in the binary",
      "Incorrect — Wire uses only the standard library, so the binary is smaller than with manual wiring"
    ],
    "correctAnswerIndex": 2,
    "explanation": "<b>Wire is a build-time tool</b> that runs during <code>go generate</code> and produces <code>wire_gen.go</code>. The tool itself is never included in the binary. What ends up in the binary is only the code in <code>wire_gen.go</code>, which is plain Go code of the same size as the equivalent hand-written wiring."
  },
  {
    "id": "wire-ch01-q11",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "Which of the following is a correct benefit of Dependency Injection?",
    "options": [
      "It makes the application run faster by avoiding garbage collection",
      "It makes individual components loosely coupled and easier to test",
      "It eliminates the need to use goroutines for concurrency in Go applications",
      "It reduces the number of package imports required in a Go application"
    ],
    "correctAnswerIndex": 1,
    "explanation": "DI keeps components <b>loosely coupled</b> — each one works against an interface rather than a concrete type, making it easy to substitute mocks in tests and swap implementations. GC, goroutines, and import counts are unrelated to DI."
  },
  {
    "id": "wire-ch01-q12",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "Why is detecting errors at compile-time better than at runtime in the context of DI?",
    "options": [
      "Because compile-time errors make the program run faster",
      "Because runtime errors in a production system can crash a service and affect real users, whereas compile-time errors are caught before deployment",
      "Because the Go compiler can auto-fix compile-time errors",
      "Because runtime errors in Go are handled by panic/recover and are therefore not serious"
    ],
    "correctAnswerIndex": 1,
    "explanation": "DI errors such as missing dependencies or type mismatches, if caught at <b>compile-time</b>, are found during development or CI before reaching users. If they occur at <b>runtime</b> (as with dig/fx), they can crash a service in production. The compiler does not auto-fix errors, and panic/recover is not a proper strategy for DI problems."
  },
  {
    "id": "wire-ch01-q13",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "Consider these two approaches:\n\n// Approach A: manual wiring\nfunc main() {\n    db := NewDB(cfg)\n    repo := NewRepo(db)\n    svc := NewService(repo)\n    srv := NewServer(svc)\n    srv.Run()\n}\n\n// Approach B: using Wire (generated)\nfunc main() {\n    srv := InitializeServer(cfg)\n    srv.Run()\n}\n\nWhich option correctly describes the most important difference?",
    "code": "// Approach A: manual wiring\nfunc main() {\n    db := NewDB(cfg)\n    repo := NewRepo(db)\n    svc := NewService(repo)\n    srv := NewServer(svc)\n    srv.Run()\n}\n\n// Approach B: using Wire (generated)\nfunc main() {\n    srv := InitializeServer(cfg)\n    srv.Run()\n}",
    "options": [
      "Approach B is faster because Wire uses parallel initialization",
      "Approaches A and B have identical runtime behavior, but B reduces the boilerplate wiring code that must be written and maintained by hand",
      "Approach B is safer because Wire adds error handling automatically",
      "Approach A is better for production because a debugger can follow the stack trace more easily"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Wire generates code that looks exactly like Approach A, so <b>runtime behavior is identical</b>. The advantage of Wire is that developers no longer need to write and maintain boilerplate wiring by hand. When the dependency graph changes, just update the provider and run <code>go generate</code>. Wire does not perform parallel initialization or add error handling automatically."
  },
  {
    "id": "wire-ch01-q14",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "A team is choosing between Uber fx and Google Wire for a new Go microservice. Which option correctly describes a key difference to consider?",
    "options": [
      "fx supports Go modules but Wire does not yet support them",
      "Wire suits apps that need fast startup and compile-time errors; fx suits apps that need dynamic wiring at runtime",
      "Wire only supports Linux while fx supports all operating systems",
      "fx requires CGO but Wire does not"
    ],
    "correctAnswerIndex": 1,
    "explanation": "<b>Wire</b> is the right fit for teams that want a guaranteed dependency graph at compile-time, fast startup, and code that is easy to read and debug. <b>fx</b> is better suited for cases that require dynamic module loading or complex lifecycle hooks. Both support Go modules and all operating systems, and neither requires CGO."
  },
  {
    "id": "wire-ch01-q15",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "Which option best describes \"compile-time dependency injection\"?",
    "options": [
      "The compiler verifying that every dependency has a non-nil value during compilation",
      "Generating correct initialization code during the build process before the application runs",
      "Using build tags to switch dependencies based on the environment",
      "Configuring dependencies through environment variables when the app starts"
    ],
    "correctAnswerIndex": 1,
    "explanation": "<b>Compile-time DI</b> means the dependency graph is analyzed and initialization code is generated during the build, so there is no special work at runtime. Wire does this by generating <code>wire_gen.go</code> during <code>go generate</code>, before the actual compile step."
  },
  {
    "id": "wire-ch01-q16",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "A senior developer says: \"For a small microservice with only a few components, manual wiring is always better than using Wire.\" Which option evaluates this claim most accurately?",
    "options": [
      "Completely correct — Wire has too much overhead for small projects",
      "Partially correct — for a very small project with two or three layers, manual wiring is reasonable, but as the project grows Wire becomes more worthwhile",
      "Incorrect — Wire is suitable for every project of every size without exception",
      "Incorrect — Wire is designed exclusively for large projects"
    ],
    "correctAnswerIndex": 1,
    "explanation": "The claim is partially correct. For a very small microservice with few dependencies, manual wiring works perfectly well. But it is not <b>always</b> better. As the project grows or when the team wants clarity and compile-time safety, Wire pays off. The decision should be based on the project's size and complexity."
  },
  {
    "id": "wire-ch01-q17",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "Consider this code:\n\nvar db *sql.DB\n\nfunc GetDB() *sql.DB {\n    if db == nil {\n        db, _ = sql.Open(\"postgres\", os.Getenv(\"DB_URL\"))\n    }\n    return db\n}\n\nWhat pattern does this use, and what problems does it have compared to constructor injection?",
    "code": "var db *sql.DB\n\nfunc GetDB() *sql.DB {\n    if db == nil {\n        db, _ = sql.Open(\"postgres\", os.Getenv(\"DB_URL\"))\n    }\n    return db\n}",
    "options": [
      "Correct constructor injection — no problems at all",
      "Service locator via global state — hard to test, has a race condition, and hides the dependency",
      "A good factory pattern because it hides database connection details",
      "A thread-safe singleton because Go guarantees atomic access to global variables"
    ],
    "correctAnswerIndex": 1,
    "explanation": "This code uses <b>global mutable state</b> in a service locator style. Problems include: (1) hides the dependency from the caller, (2) has a race condition in concurrent code because there is no mutex, (3) very hard to test because you must mock global state, and (4) the error from <code>sql.Open</code> is silently discarded. Constructor injection would instead accept <code>*sql.DB</code> directly as a parameter."
  },
  {
    "id": "wire-ch01-q18",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "Which advantage does Wire have that a runtime DI framework like dig cannot provide?",
    "options": [
      "Support for dependency graphs with cycles",
      "Wire's generated code can be read and debugged directly, and wiring errors surface at compile-time",
      "Wire supports hot-reloading of dependencies while the application is running",
      "Wire runs 10x faster than dig in all usage scenarios"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Wire has two advantages that runtime frameworks cannot offer: (1) <b>readable code</b> — <code>wire_gen.go</code> is plain Go that developers can read and debug, unlike an invisible reflection graph; (2) <b>compile-time errors</b> — missing providers or type mismatches fail at build time, not at runtime. Neither Wire nor dig supports circular dependencies, and Wire does not provide hot-reload."
  },
  {
    "id": "wire-ch01-q19",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "Why does the Go community prefer constructor injection over field injection (injecting directly into struct fields)?",
    "options": [
      "Because Go does not allow access to struct fields from outside the package",
      "Because constructor injection makes all dependencies explicit at object creation time and enables immutable structs",
      "Because field injection makes the binary larger due to reflection overhead",
      "Because the Go compiler rejects code that uses field injection"
    ],
    "correctAnswerIndex": 1,
    "explanation": "<b>Constructor injection</b> requires all dependencies to be provided at object creation, making it possible to keep fields unexported and immutable after construction. Field injection requires exported fields or reflection, leaving objects potentially in an uninitialized state. Go does allow unexported field access within the same package."
  },
  {
    "id": "wire-ch01-q20",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "Suppose an application has 50 components and you need to add a logging middleware to every service layer. How do manual wiring and Wire compare in this situation?",
    "options": [
      "Both approaches require editing code in 50 places equally, because Wire does not reduce the work",
      "Manual wiring requires updating every spot in the main/bootstrap code that constructs a service, but with Wire you only update the provider function and regenerate",
      "Wire updates dependencies automatically without needing to run go generate again",
      "Manual wiring is better in this case because Wire does not support middleware patterns"
    ],
    "correctAnswerIndex": 1,
    "explanation": "This is one of Wire's primary benefits. When adding a cross-cutting concern like logging middleware, manual wiring requires finding and editing every place that constructs a service. With Wire you only modify the <b>provider function</b> for that service and run <code>go generate</code> — Wire regenerates the updated wiring everywhere. Wire does not update automatically without re-running generate, and it supports middleware patterns normally."
  }
];
