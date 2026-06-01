# Curriculum Plan — Google Wire

**Backwards Design approach:** End goal = learner graduates able to apply Wire in production Go services (providers, injectors, cleanup, binding, per-request scoping, HTTP/gRPC integration). Chapters are derived backward from that goal, building from conceptual foundation through mechanical mastery to integrated practice.

---

## Chapter Overview Table

| # | Chapter Title | Difficulty | Bloom Levels |
|---|---|---|---|
| 1 | Why Dependency Injection Matters | Beginner | Remember, Understand, Analyze |
| 2 | Getting to Know Google Wire and Installation | Beginner | Remember, Understand, Apply |
| 3 | What Is a Provider, and wire.Build | Beginner–Intermediate | Remember, Apply, Analyze |
| 4 | Provider Sets and wire.NewSet | Intermediate | Understand, Apply, Analyze |
| 5 | wire.Bind — Binding Interfaces to Concrete Types | Intermediate | Remember, Apply, Analyze |
| 6 | wire.Struct — Field Injection | Intermediate | Understand, Apply |
| 7 | Cleanup Functions and Error Handling | Intermediate–Advanced | Understand, Apply, Evaluate |
| 8 | Multiple Injectors and Per-Request Scoping | Advanced | Apply, Analyze, Evaluate |
| 9 | Integration with HTTP and gRPC | Advanced | Apply, Analyze, Evaluate |
| 10 | Capstone Project | Advanced | Create, Evaluate |

---

## Chapter 1: Why Dependency Injection Matters

**Bloom levels:** Remember, Understand, Analyze

**Learning Objectives:**
1. (Remember) Explain what Dependency Injection is and what problem it solves
2. (Understand) Compare manual wiring with a DI framework
3. (Understand) Explain the difference between compile-time DI (Wire) and runtime DI (Uber fx/dig)
4. (Analyze) Identify which kinds of codebases benefit from DI and which do not need it

**Key Topics:**
- The problem of manual constructor chaining: a long, fragile `main.go`
- Constructor injection vs field injection vs service locator
- Runtime DI (reflection-based, errors at runtime) vs compile-time DI (code-gen, errors at `wire` run / compile time)
- Why Wire chose code generation: zero reflection overhead, errors surface early, generated code readable

**Code Snippet Ideas:**
- "Before" example: a `main.go` that builds a dependency chain with 5 layers of manual constructor calls
- "After" preview: a 3-line injector function that Wire generates for you (just to look at — no need to understand it yet)
- Error message comparison: runtime DI panic vs Wire compile error

**Common Pitfalls:**
1. Misunderstanding Wire as a "service locator" — Wire has no runtime container; it generates plain code before compilation
2. Thinking every DI scenario requires a framework — small projects may still be better off with manual wiring

**Hands-on Deliverable:** Write a manual-wiring `main.go` for a simple service (3 dependencies), then annotate which parts would "disappear" if Wire were used

---

## Chapter 2: Getting to Know Google Wire and Installation

**Bloom levels:** Remember, Understand, Apply

**Learning Objectives:**
1. (Remember) State what the `wire` CLI does and where it fits in the workflow
2. (Understand) Explain the roles of `wire.go` (stub) and `wire_gen.go` (generated)
3. (Apply) Install the `wire` CLI and create a basic project structure
4. (Apply) Set up a `go:generate` directive to run `wire`
5. (Understand) Explain the build tags `//go:build wireinject` and `//go:build !wireinject`

**Key Topics:**
- `go install github.com/google/wire/cmd/wire@latest`
- Project layout: `wire.go` (hand-written stub) + `wire_gen.go` (generated, commit to VCS)
- `//go:build wireinject` on the stub file — tells Wire this file is the input; the compiler skips it
- `//go:build !wireinject` on `wire_gen.go` — used during the real compile; do not edit by hand
- The `//go:generate wire` directive in the package
- The `wire` command: reads the stub → analyzes the dependency graph → generates `wire_gen.go`

**Code Snippet Ideas:**
- Structure of the stub file: package declaration, build tag, `import "github.com/google/wire"`, injector signature, `wire.Build(...)`, throwaway return
- The `wire_gen.go` output that Wire generates (showing it is plain Go code)
- A single `//go:generate wire` line

**Common Pitfalls:**
1. Forgetting the `//go:build wireinject` build tag — the compiler will try to compile the stub and fail because the body is invalid
2. Editing `wire_gen.go` by hand — it gets overwritten every time `wire` runs; always edit the stub or the providers instead

**Hands-on Deliverable:** Create a Go module, write a stub injector for a simple struct, run `wire` successfully, and verify that `wire_gen.go` was generated

---

## Chapter 3: What Is a Provider, and wire.Build

**Bloom levels:** Remember, Apply, Analyze

**Learning Objectives:**
1. (Remember) Define "provider" in the context of Wire
2. (Apply) Write a correct provider function (signature rules)
3. (Apply) Use `wire.Build` in an injector stub
4. (Analyze) Read Wire's error messages to find a missing or duplicate provider
5. (Analyze) Trace the dependency graph from the injector's return type back to the providers

**Key Topics:**
- Provider: a function returning type `T` (or `(T, error)`) — Wire uses the return type as the "key"
- Signature rules: may be exported or unexported; args are dependencies; the return may be a value or a pointer
- `wire.Build(providerA, providerB, ...)` — the list of providers (and provider sets) Wire uses to build the graph
- Injector body: `wire.Build(...)` + a throwaway return such as `return App{}, nil` or `panic("wire")`
- Wire resolves the dependency graph: matching return types to parameter types via topological sort
- Duplicate provider error: two providers return the same type
- Missing provider error: there is no provider for a required type

**Code Snippet Ideas:**
- Provider chain: `NewDB() *sql.DB`, `NewUserRepo(db *sql.DB) *UserRepo`, `NewUserService(repo *UserRepo) *UserService`
- Injector stub: `func InitializeApp() *UserService { wire.Build(NewDB, NewUserRepo, NewUserService); return nil }`
- Wire error output when a provider is missing

**Common Pitfalls:**
1. A provider returns a pointer but the dependency expects a value (or vice versa) — Wire treats `*T` and `T` as different types
2. Writing logic in the injector body other than `wire.Build` — Wire reads only the `wire.Build` call; other logic is ignored

**Hands-on Deliverable:** Build a 4-layer provider chain, write an injector, run `wire`, and fix errors until it passes

---

## Chapter 4: Provider Sets and wire.NewSet

**Bloom levels:** Understand, Apply, Analyze

**Learning Objectives:**
1. (Understand) Explain the benefit of `wire.NewSet` for grouping providers
2. (Apply) Create a provider set for a layer (repository, service, handler)
3. (Apply) Compose nested provider sets (a set within a set)
4. (Analyze) Design provider set boundaries to align with the package/layer structure

**Key Topics:**
- `var RepoSet = wire.NewSet(NewDB, NewUserRepo, NewProductRepo)`
- Set composition: `wire.NewSet(RepoSet, ServiceSet)` — sets can reference other sets
- Benefits: reuse sets across injectors, group by domain/layer, reduce noise in `wire.Build`
- Guideline: declare the set in the same package as the providers; expose it as an exported var
- A set is not a runtime object — Wire "unfolds" every set into a flat list at codegen time

**Code Snippet Ideas:**
- `var RepositorySet = wire.NewSet(NewPostgresDB, NewUserRepository, NewOrderRepository)`
- `var ApplicationSet = wire.NewSet(RepositorySet, ServiceSet, HandlerSet)`
- Injector: `wire.Build(ApplicationSet)` instead of listing providers one by one

**Common Pitfalls:**
1. Including a provider both in a set and directly in `wire.Build` — Wire reports a duplicate provider error
2. Creating a set so large it cannot be reused — prefer a set per layer/domain, not "one global set"

**Hands-on Deliverable:** Refactor the injector from Chapter 3 by organizing providers into 2 sets (infra, domain); verify that `wire_gen.go` stays the same

---

## Chapter 5: wire.Bind — Binding Interfaces to Concrete Types

**Bloom levels:** Remember, Apply, Analyze

**Learning Objectives:**
1. (Remember) Explain why Wire needs `wire.Bind` when a dependency is an interface
2. (Apply) Write `wire.Bind(new(MyInterface), new(*MyConcrete))` correctly
3. (Apply) Incorporate `wire.Bind` into a provider set
4. (Analyze) Diagnose when to use an interface (testability, multiple implementations) vs a struct directly

**Key Topics:**
- Wire matches dependencies by type — if a consumer needs `UserRepository` (an interface) but only a `*postgresUserRepo` provider exists, it will fail
- `wire.Bind(new(UserRepository), new(*postgresUserRepo))` — both args must always be `new(...)`
- The concrete type (`*postgresUserRepo`) must already have a provider in the set/`wire.Build`
- `wire.Bind` can go directly inside `wire.NewSet(...)` or `wire.Build(...)`
- Main use cases: testing (swap in a mock), multiple environments (prod vs stub)

**Code Snippet Ideas:**
- Interface + concrete: `type UserRepository interface { ... }` / `type postgresUserRepo struct { ... }`
- Provider for the concrete: `func NewPostgresUserRepo(db *sql.DB) *postgresUserRepo`
- Bind in a set: `wire.NewSet(NewPostgresUserRepo, wire.Bind(new(UserRepository), new(*postgresUserRepo)))`

**Common Pitfalls:**
1. Using `wire.Bind(new(Iface), new(Concrete))` without a provider for `*Concrete` — Wire reports a missing provider
2. Swapping the argument order: `wire.Bind(new(*Concrete), new(Iface))` — wrong; the first arg is the interface, the second is the concrete

**Hands-on Deliverable:** Replace a struct dependency with an interface, add `wire.Bind`, run `wire` successfully; write a second injector for tests that binds a mock instead

---

## Chapter 6: wire.Struct — Field Injection

**Bloom levels:** Understand, Apply

**Learning Objectives:**
1. (Understand) Explain the difference between constructor injection and `wire.Struct` field injection
2. (Apply) Use `wire.Struct(new(T), "*")` to inject every exported field
3. (Apply) Use `wire.Struct(new(T), "FieldA", "FieldB")` to inject only selected fields
4. (Understand) Know that unexported fields cannot be injected with `wire.Struct`

**Key Topics:**
- `wire.Struct(new(MyHandler), "*")` — inject every exported field of `MyHandler`
- `wire.Struct(new(MyHandler), "DB", "Logger")` — inject only the specified fields
- Wire generates code equivalent to `&MyHandler{DB: db, Logger: logger}`
- Unexported fields are ignored; if you try to inject a field that has no provider, Wire errors
- Comparison: `wire.Struct` is a good fit when a struct has many fields and you do not want to write a constructor
- Downside: fields must be exported; this slightly reduces encapsulation

**Code Snippet Ideas:**
- A struct with 4 exported fields: `DB`, `Cache`, `Logger`, `Config`
- `wire.Struct(new(AppHandler), "*")` inside wire.Build
- Comparison with `NewAppHandler(db, cache, logger, cfg) *AppHandler`

**Common Pitfalls:**
1. Expecting Wire to inject an unexported field — it is silently ignored; you must export it or use a constructor
2. Using `wire.Struct` for a type that needs initialization logic — use a constructor provider instead

**Hands-on Deliverable:** Convert a handler struct that has a constructor to use `wire.Struct` instead; inspect the generated `wire_gen.go`

---

## Chapter 7: Cleanup Functions and Error Handling

**Bloom levels:** Understand, Apply, Evaluate

**Learning Objectives:**
1. (Understand) Explain the return signature of a provider with cleanup: `(T, func())` or `(T, func(), error)`
2. (Apply) Write a provider that returns a cleanup function for a resource such as a DB connection or file handle
3. (Understand) Explain LIFO cleanup order and the reason for using LIFO
4. (Evaluate) Analyze how an error during initialization triggers cleanup of resources created earlier
5. (Apply) Correctly handle an error from an injector that has a provider error

**Key Topics:**
- Provider signatures Wire supports: `(T)`, `(T, error)`, `(T, func())`, `(T, func(), error)`
- Wire aggregates cleanup functions: the injector's return signature becomes `(T, func(), error)` or `(T, func())`
- **LIFO order:** cleanup runs back to front — resources created later are cleaned up first (e.g., close the HTTP server before closing the DB)
- **Error mid-initialization:** if provider B fails after provider A succeeds, Wire runs A's cleanup before returning the error
- The caller must `defer cleanup()` after calling the injector
- A provider should not call cleanup directly — return the func and let Wire manage it

**Code Snippet Ideas:**
- `func NewDB(cfg Config) (*sql.DB, func(), error)` — open the DB, return `db.Close` as cleanup
- `func NewServer(handler http.Handler) (*http.Server, func())` — return a shutdown func
- Caller pattern: `app, cleanup, err := InitApp(); if err != nil { ... }; defer cleanup()`
- Diagram: creation call order A→B→C, cleanup order C→B→A

**Common Pitfalls:**
1. Forgetting `defer cleanup()` in the caller — resource leak; Wire generates cleanup but does not run it automatically
2. A provider closing the resource itself instead of returning a cleanup func — the cleanup will not be folded into the LIFO chain

**Hands-on Deliverable:** Add cleanup funcs to the DB and HTTP server providers; write a `main.go` that correctly `defer cleanup()`; test graceful shutdown with Ctrl+C

---

## Chapter 8: Multiple Injectors and Per-Request Scoping

**Bloom levels:** Apply, Analyze, Evaluate

**Learning Objectives:**
1. (Apply) Create multiple injectors in one package for different contexts (production, test, integration)
2. (Analyze) Explain that Wire has no runtime scope — "scoping" is done by designing an injector that takes parameters
3. (Apply) Create a per-request injector that takes request-scoped values as parameters
4. (Evaluate) Compare the trade-offs between one-injector-per-request and passing values through context

**Key Topics:**
- Multiple injectors: two functions in the same `wire.go`, e.g. `InitAppProd()` and `InitAppTest()`
- Injector parameters: `func InitRequestHandler(r *http.Request, db *sql.DB) *RequestHandler` — Wire cannot inject at the parameter layer
- **Per-request scoping — critical concept:** Wire has no Spring-style `@RequestScope`. The correct approach is to call the injector function for every request, or to pass request-scoped data as an argument to the injector
- A provider that takes `*http.Request` as an arg: Wire will require the caller to pass the request at inject time
- Recommendation: use a request-scoped injector for handler factories only — do not inject everything per request
- Test injector: swap implementations with a different `wire.Bind` in the test injector

**Code Snippet Ideas:**
- Production injector: `func InitApp(cfg Config) (*App, func(), error)`
- Test injector: `func InitTestApp(t *testing.T) (*App, func())`  
- Per-request: `func InitRequestScope(db *sql.DB, logger *slog.Logger, userID string) *RequestHandler`
- Caller in HTTP middleware: call `InitRequestScope(db, logger, r.Header.Get("X-User-ID"))` at the start of the request

**Common Pitfalls:**
1. Expecting runtime scope from Wire — Wire is a code generator; generate an injector and call it anew per request instead
2. Building a per-request injector that includes heavy singletons (DB pool) — this recreates them on every request; pass singletons as parameters instead

**Hands-on Deliverable:** Create 2 injectors (prod + test); create a per-request injector that takes `*http.Request`; write an integration test that uses the test injector

---

## Chapter 9: Integration with HTTP and gRPC

**Bloom levels:** Apply, Analyze, Evaluate

**Learning Objectives:**
1. (Apply) Wire a service stack for a net/http server (handler → service → repo → DB)
2. (Apply) Wire a gRPC server (server impl → service → repo → DB + grpc.Server)
3. (Analyze) Design a provider for an HTTP middleware chain
4. (Evaluate) Analyze the boundary between Wire-managed components and manually-wired config

**Key Topics:**
- HTTP pattern: a provider for `*http.ServeMux` or a router; a provider for each handler group; an injector that builds `*http.Server`
- gRPC pattern: a provider for `*grpc.Server`; a provider that registers the service implementation; cleanup = `server.GracefulStop`
- Middleware: a provider returning `func(http.Handler) http.Handler`; composed in the server provider
- Config injection: `wire.Value(cfg)` or a provider function that returns the config struct
- Package layout for a real project: `cmd/`, `internal/wire/`, `internal/handler/`, `internal/service/`, `internal/repo/`
- The `wire.Value` vs provider function question for config
- A gRPC interceptor can be a provider

**Code Snippet Ideas:**
- HTTP: `func NewHTTPServer(mux *http.ServeMux, cfg Config) (*http.Server, func())` 
- gRPC: `func NewGRPCServer(svc UserServiceServer, opts ...grpc.ServerOption) (*grpc.Server, func())`
- Provider set layout: `var HTTPSet = wire.NewSet(NewHTTPServer, NewServeMux, handler.Set)`
- A very short `main.go`: `app, cleanup, err := wire.InitApp(cfg); defer cleanup(); app.Run()`

**Common Pitfalls:**
1. Hardcoding `grpc.ServerOption` or middleware config inside a provider — inject it through a Config struct instead
2. Creating a circular dependency between the server provider and the handler provider — check the graph first; the handler must depend on the server one way only

**Hands-on Deliverable:** Build a minimal HTTP CRUD service (or gRPC service) wiring every layer; `main.go` must have no manual constructor calls

---

## Chapter 10 (Capstone): Final Project — Wire in a Production Service

**Bloom levels:** Create, Evaluate

**Learning Objectives:**
1. (Create) Design and build a complete service that uses every Wire concept learned
2. (Create) Organize provider sets according to layer architecture correctly
3. (Evaluate) Inspect the generated `wire_gen.go` and explain its dependency resolution
4. (Evaluate) Compare the architecture with alternative DI approaches and justify the choice of Wire

**Capstone Spec:**
Build a "Task Manager" service with:
- PostgreSQL repo layer (with cleanup)
- Service layer with interface + `wire.Bind`
- HTTP handlers with `wire.Struct`
- Config via provider function
- Prod injector + Test injector (with mock repo)
- Per-request logger injection
- Graceful shutdown (LIFO cleanup order demonstrated)

**Key Topics:**
- Integrate: Chapter 3 (providers) + 4 (sets) + 5 (bind) + 6 (struct) + 7 (cleanup) + 8 (scoping) + 9 (HTTP)
- Code review checklist: `wire_gen.go` readable, no manual constructors in `main.go`, cleanup chain correct
- Common production patterns: config loading before Wire, structured logging provider, health check endpoint wiring

**Common Pitfalls:**
1. Over-engineering provider sets — you don't need a set per package; group by what changes together
2. Forgetting to run `wire` after changing provider signatures — `wire_gen.go` outdated; add `go generate` to CI

**Hands-on Deliverable:** Submit complete repository; `wire_gen.go` committed; `go build ./...` passes; reviewer reads `wire_gen.go` and traces the full dependency graph

---

## Quiz density

Quiz format, bank sizes, scoring, and the authoring bar are owned by **`03-assessment.md`** — not duplicated here. In brief (as shipped): **every chapter ships a ≥18-question bank, draws 15 shuffled questions per attempt, and passes at ≥80% (≥12/15)**. High-stakes mechanical chapters (build tags, provider signatures, cleanup LIFO, `wire.Bind` argument order) lean toward the deeper, scenario-heavy end of their banks because a single misconception there causes silent production bugs.

Quizzes are a per-chapter **mastery checkpoint, not a gate** — chapters are open and may be taken in any order (see `01-vision-scope.md`).
