/* questions ch07 (EN) */
(window.QUESTIONS_EN = window.QUESTIONS_EN || {}).ch07 = [
  {
    "id": "wire-ch07-q01",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "What return signature must a Wire provider have when it needs a cleanup function?",
    "options": [
      "(T, error)",
      "(T, cleanup func(), error)",
      "(func(), T, error)",
      "(T, func(), error)"
    ],
    "correctAnswerIndex": 3,
    "explanation": "Wire supports the signature <code>(T, func(), error)</code> for providers that need cleanup and may fail. The order must always be: type first, cleanup in the middle, error last. The first option has no cleanup. The second uses a named parameter <code>cleanup func()</code>, which Wire does not support — cleanup must be an anonymous <code>func()</code> type. The third option has the wrong order (func() before T)."
  },
  {
    "id": "wire-ch07-q02",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "In what order does Wire run cleanup functions?",
    "options": [
      "LIFO — cleanup runs the most recently created resource first",
      "FIFO — cleanup runs the earliest created resource first",
      "Random — Wire does not guarantee cleanup order",
      "Parallel — all cleanups run concurrently"
    ],
    "correctAnswerIndex": 0,
    "explanation": "Wire runs cleanup functions in <b>LIFO (Last In, First Out)</b> order — the resource created last is cleaned up first. This is because resources created later often depend on those created earlier, so dependents must be closed before their dependencies."
  },
  {
    "id": "wire-ch07-q03",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "If a provider successfully creates a DB but the next provider creating a Cache fails, what does Wire do?",
    "options": [
      "Wire panics because it cannot complete initialization",
      "Wire retries creating the Cache before returning an error",
      "Wire ignores the error and returns an app without a cache",
      "Wire runs the DB cleanup first, then returns the error"
    ],
    "correctAnswerIndex": 3,
    "explanation": "When a later provider fails, Wire-generated code <b>runs the cleanup of already-successfully-created resources</b> before returning the error, preventing resource leaks. This is the behavior Wire guarantees, following LIFO order."
  },
  {
    "id": "wire-ch07-q04",
    "difficulty": "easy",
    "bloomLevel": "understand",
    "question": "Why must cleanup functions run in LIFO order rather than FIFO?",
    "options": [
      "Because Wire is designed to behave like a garbage collector, which uses LIFO",
      "Because the Go runtime forces defer stacks to operate in LIFO only",
      "Because resources created later often depend on earlier ones — closing a dependency before its dependent can cause panics or errors",
      "Because LIFO is faster than FIFO on modern hardware"
    ],
    "correctAnswerIndex": 2,
    "explanation": "The primary reason for LIFO is <b>dependency ordering</b>: if a Server depends on a DB, closing the DB before the Server has stopped accepting requests will cause errors. So the Server (dependent) must be closed first, then the DB (dependency)."
  },
  {
    "id": "wire-ch07-q05",
    "difficulty": "easy",
    "bloomLevel": "understand",
    "question": "Which option correctly describes the caller's responsibility after calling an injector that returns a cleanup func?",
    "options": [
      "Wire manages cleanup automatically on program exit — nothing to do",
      "Cleanup will be called by the Go garbage collector when the object is freed",
      "The caller must invoke cleanup() itself, typically with defer cleanup()",
      "The caller must register cleanup with an os.Exit handler"
    ],
    "correctAnswerIndex": 2,
    "explanation": "Wire <b>does not run cleanup automatically</b>. The cleanup function returned by the injector is just a plain <code>func()</code> — the caller is responsible for calling it. The correct and safest approach is <code>defer cleanup()</code> immediately after the error check."
  },
  {
    "id": "wire-ch07-q06",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "Consider this code:",
    "code": "func NewDB(cfg Config) (*sql.DB, func(), error) {\n    db, err := sql.Open(\"postgres\", cfg.DSN)\n    if err != nil {\n        return nil, nil, err\n    }\n    cleanup := func() { db.Close() }\n    return db, cleanup, nil\n}",
    "options": [
      "This code is wrong — when Open fails it should return a no-op cleanup func instead of nil",
      "This code is correct — returning nil cleanup when Open fails is fine because no resource was acquired yet",
      "This code is wrong — the cleanup func must be an exported function, not an anonymous func",
      "This code is wrong — Wire does not support closures as cleanup functions"
    ],
    "correctAnswerIndex": 1,
    "explanation": "This code is <b>correct</b>. When <code>sql.Open</code> fails there is no DB connection to close, so returning <code>nil</code> as the cleanup is perfectly reasonable. Wire accepts a <code>nil</code> cleanup in this case. Wire also fully supports anonymous functions as cleanup."
  },
  {
    "id": "wire-ch07-q07",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "If the dependency graph has providers A → B → C (A created first, C created last), in what order will cleanup run?",
    "options": [
      "C, B, A",
      "A, B, C",
      "B, A, C",
      "A, C, B"
    ],
    "correctAnswerIndex": 0,
    "explanation": "LIFO means reverse of creation order. If creation order is <b>A → B → C</b>, cleanup always runs as <b>C → B → A</b>. C is closed first because it was created last and may depend on both A and B."
  },
  {
    "id": "wire-ch07-q08",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "What is wrong with the following provider?",
    "code": "func NewDB(cfg Config) (*sql.DB, func(), error) {\n    db, err := sql.Open(\"postgres\", cfg.DSN)\n    if err != nil {\n        return nil, nil, err\n    }\n    if err := db.Ping(); err != nil {\n        // forgot to close db here\n        return nil, nil, fmt.Errorf(\"ping: %w\", err)\n    }\n    return db, func() { db.Close() }, nil\n}",
    "options": [
      "Nothing — the code is completely correct",
      "Ping fails and returns nil cleanup, but db.Close() was never called, causing a connection leak",
      "Should use db.Close() directly instead of a cleanup func so Wire knows to close the resource",
      "sql.Open must always run in a separate goroutine"
    ],
    "correctAnswerIndex": 1,
    "explanation": "<code>sql.Open</code> succeeded (a db object exists), but <code>db.Ping()</code> fails before the cleanup func is created — so db is open but nothing will ever close it. Fix it by adding <code>db.Close()</code> before returning the error in the Ping failure case: <code>db.Close(); return nil, nil, fmt.Errorf(...)</code>"
  },
  {
    "id": "wire-ch07-q09",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "What is wrong with the following main.go code?",
    "code": "func main() {\n    cfg := loadConfig()\n    app, cleanup, err := InitApp(cfg)\n    if err != nil {\n        log.Fatalf(\"init: %v\", err)\n    }\n    // no defer cleanup()\n    app.Run()\n}",
    "options": [
      "cleanup() should be called before app.Run(), not after",
      "Nothing — Wire handles cleanup automatically when main() returns",
      "app.Run() will call cleanup() automatically when it finishes",
      "Missing defer cleanup() means every resource with a cleanup function will not be closed when the app stops"
    ],
    "correctAnswerIndex": 3,
    "explanation": "This code is <b>missing <code>defer cleanup()</code></b>. Wire returns the cleanup func but never calls it automatically. When <code>app.Run()</code> returns or the program exits for any reason, all resources (DB, server, cache) will not be properly closed. Add <code>defer cleanup()</code> immediately after the error check."
  },
  {
    "id": "wire-ch07-q10",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "Which of the following providers is written correctly according to Wire conventions?",
    "options": [
      "func NewCache(cfg Config) *Cache { c := newRedis(cfg); defer c.Close(); return c }",
      "func NewCache(cfg Config) (*Cache, func(), error) { c, err := newRedis(cfg); if err != nil { return nil, nil, err }; return c, c.Close, nil }",
      "func NewCache(cfg Config) (*Cache, error, func()) { c, err := newRedis(cfg); if err != nil { return nil, err, nil }; return c, nil, c.Close }",
      "func NewCache(cfg Config) (*Cache, func() error) { c, _ := newRedis(cfg); return c, c.Close }"
    ],
    "correctAnswerIndex": 1,
    "explanation": "The second option is correct: signature <code>(*Cache, func(), error)</code> has the right order (T, cleanup, error), handles the error, and returns <code>c.Close</code> as the cleanup func. The first option defers inside the provider, closing the resource immediately rather than deferring it. The third option has error and cleanup swapped. The fourth option has a cleanup func that returns an error, which Wire does not support — cleanup must be <code>func()</code> only."
  },
  {
    "id": "wire-ch07-q11",
    "difficulty": "medium",
    "bloomLevel": "analyze",
    "question": "Why should a provider not call db.Close() inside its own body instead of returning a cleanup func?",
    "options": [
      "Because Wire forbids providers from calling methods on the resources they create",
      "Because db.Close() is a blocking call that will cause Wire to time out",
      "Because Wire needs the cleanup func only to calculate the dependency graph",
      "Because if a provider closes its own resource without returning a cleanup func, Wire has no knowledge of that cleanup and cannot include it in the LIFO chain, which may result in resources being closed in the wrong order"
    ],
    "correctAnswerIndex": 3,
    "explanation": "If a provider closes its own resource without returning a cleanup func, <b>Wire has no knowledge of that resource&#39;s cleanup to coordinate</b>. As a result, Wire cannot include it in the LIFO chain, which may cause the resource to be closed before its dependents have stopped (breaking LIFO order), and potentially closed twice."
  },
  {
    "id": "wire-ch07-q12",
    "difficulty": "medium",
    "bloomLevel": "analyze",
    "question": "Is the following injector stub correct?",
    "code": "//go:build wireinject\n\nfunc InitApp(cfg Config) (*App, func(), error) {\n    wire.Build(\n        NewDB,     // return (*sql.DB, func(), error)\n        NewServer, // return (*http.Server, func())\n        NewApp,    // return *App\n    )\n    return nil, nil, nil\n}",
    "options": [
      "Not correct — an injector with cleanup must have signature (*App, func()) only, without error",
      "Not correct — the placeholder return must be return nil, func(){}, nil, not return nil, nil, nil",
      "Correct — Wire will generate an implementation that aggregates both cleanups in LIFO order",
      "Not correct — providers with cleanup must be placed in a separate provider set"
    ],
    "correctAnswerIndex": 2,
    "explanation": "This stub is <b>completely correct</b>. The signature <code>(*App, func(), error)</code> is appropriate because the graph has providers that return both cleanup and error. The placeholder return <code>nil, nil, nil</code> is the boilerplate Wire requires. Wire will generate an implementation that aggregates both NewDB and NewServer cleanups in LIFO order and handles mid-init errors automatically."
  },
  {
    "id": "wire-ch07-q13",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "An application has providers in this dependency order: NewConfig → NewDB → NewCache → NewServer. If NewCache fails, in what order will cleanups run?",
    "options": [
      "NewCache cleanup, NewDB cleanup, NewConfig cleanup",
      "NewServer cleanup, NewCache cleanup, NewDB cleanup, NewConfig cleanup",
      "NewConfig cleanup, NewDB cleanup",
      "NewDB cleanup, NewConfig cleanup"
    ],
    "correctAnswerIndex": 3,
    "explanation": "When NewCache fails, the resources successfully created are Config and DB (assuming both have cleanup). Wire runs their cleanups in LIFO order: <b>DB cleanup first (created later), then Config cleanup (created first)</b>. NewServer was never created, so it has no cleanup."
  },
  {
    "id": "wire-ch07-q14",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "Why does returning `func() error` instead of `func()` from a provider not work with Wire?",
    "options": [
      "Because Wire only supports exported functions as cleanup",
      "Wire requires cleanup functions to have the signature func() exactly — func() error is a different type that Wire does not recognize",
      "Because func() error would cause Wire to generate multiple nested errors",
      "Wire supports func() error but it must be declared as a named type first"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Wire is designed to accept only <code>func()</code> as the cleanup signature. In Go, <code>func()</code> and <code>func() error</code> are entirely different types. Wire will not recognize <code>func() error</code> as a cleanup function and will error during code generation. To handle cleanup errors, log them inside a closure and return <code>func()</code> instead."
  },
  {
    "id": "wire-ch07-q15",
    "difficulty": "hard",
    "bloomLevel": "evaluate",
    "question": "A developer says: \"I'll call cleanup() directly instead of using defer because defer has overhead.\" Which option best evaluates this claim?",
    "options": [
      "Correct — defer does have real overhead and should be avoided in all cases",
      "Wrong — cleanup() called directly will not run if app.Run() panics or an early return occurs before the cleanup() line; and defer's overhead is negligible compared to the cost of correct resource management",
      "Partially correct — cleanup() should be called before app.Run() instead of using defer",
      "Irrelevant — Wire guarantees cleanup always runs regardless of whether defer is used"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Using <code>defer cleanup()</code> is critical because <b>defer runs even on panic or early return</b>. If you call <code>cleanup()</code> directly at the end of main and <code>app.Run()</code> panics or returns early for an unexpected reason, cleanup will not execute. The overhead of defer is negligible (nanoseconds) and has no significance in the context of application initialization and shutdown."
  },
  {
    "id": "wire-ch07-q16",
    "difficulty": "hard",
    "bloomLevel": "evaluate",
    "question": "An application has the following injector, but DB connections are found to linger after the program exits. What is the most likely cause?",
    "code": "func main() {\n    cfg := loadConfig()\n    app, cleanup, err := InitApp(cfg)\n    if err != nil {\n        log.Fatal(err)\n    }\n    defer cleanup()\n    app.Run() // blocks until signal\n}",
    "options": [
      "log.Fatal calls os.Exit which skips all defers, but in this case err is nil so that is not the issue",
      "Wire has a bug in its LIFO implementation that causes DB cleanup to be skipped",
      "NewDB does not return a cleanup function, so Wire does not know it needs to close the DB when cleanup is called",
      "defer cleanup() is called before app.Run(), so it closes the DB before the app starts"
    ],
    "correctAnswerIndex": 2,
    "explanation": "If DB connections linger after the program exits, the most likely cause is that <b>NewDB does not return a cleanup function</b> — for example, its signature is <code>(*sql.DB, error)</code> instead of <code>(*sql.DB, func(), error)</code>. Wire therefore has no knowledge of any DB cleanup, so even though <code>defer cleanup()</code> is present in main, the aggregated cleanup does not contain <code>db.Close()</code>."
  },
  {
    "id": "wire-ch07-q17",
    "difficulty": "hard",
    "bloomLevel": "evaluate",
    "question": "A developer wants DB cleanup to run with a 30-second timeout, but the cleanup signature must be func(). Which approach is correct?",
    "options": [
      "Wire does not support timeouts in cleanup — use a separate goroutine instead",
      "Use a closure inside the provider that captures the timeout value, e.g. cleanup := func() { _, cancel := context.WithTimeout(context.Background(), 30*time.Second); defer cancel(); db.Close() }",
      "Change the cleanup signature to func(timeout time.Duration) and pass 30*time.Second from the caller",
      "Add the timeout as a global variable and reference it from the cleanup func"
    ],
    "correctAnswerIndex": 1,
    "explanation": "The correct approach is to use a <b>closure</b> that captures the timeout value inside the cleanup func, keeping its signature as <code>func()</code> as Wire requires. Example: <code>cleanup := func() { _, cancel := context.WithTimeout(context.Background(), 30*time.Second); defer cancel(); db.Close() }</code> (using <code>_</code> because context.Background() is already captured in cancel). The benefit of a closure is that it can capture any needed values without changing the signature."
  },
  {
    "id": "wire-ch07-q18",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "What signature does the following provider have, and what scenario is it appropriate for?",
    "code": "func NewServeMux(userH *UserHandler, orderH *OrderHandler) *http.ServeMux {\n    mux := http.NewServeMux()\n    mux.HandleFunc(\"/users\", userH.ServeHTTP)\n    mux.HandleFunc(\"/orders\", orderH.ServeHTTP)\n    return mux\n}",
    "options": [
      "Signature (T) — no error, no cleanup; appropriate for resources that cannot fail to create and need no teardown",
      "Signature (T, error) — should add error in case a handler is nil",
      "Signature (T, func()) — should always return cleanup even if there is nothing to close",
      "Signature (T, func(), error) — the complete form should always be used for consistency"
    ],
    "correctAnswerIndex": 0,
    "explanation": "The signature <code>*http.ServeMux</code> alone is the most appropriate choice. Creating a ServeMux and registering routes cannot fail (no I/O or external calls) and requires no cleanup. Wire fully supports the <code>(T)</code> signature. Adding an unnecessary error or cleanup would be over-engineering."
  },
  {
    "id": "wire-ch07-q19",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "If you want the injector to return only (*App, func()) with no error, what must be true about every provider in the graph?",
    "options": [
      "At least one provider must return (T, func(), error)",
      "Every provider must have a signature of (T) or (T, func()) only — none of them may return an error",
      "The injector can always return (*App, func()) regardless of provider signatures",
      "You must add wire.Value((*error)(nil)) to wire.Build to suppress errors"
    ],
    "correctAnswerIndex": 1,
    "explanation": "An injector returns an error only when at least one provider in the graph returns an error. If <b>every</b> provider has a signature of <code>(T)</code> or <code>(T, func())</code> (none return an error), the injector Wire generates will have the signature <code>(*App, func())</code> with no error."
  },
  {
    "id": "wire-ch07-q20",
    "difficulty": "hard",
    "bloomLevel": "evaluate",
    "question": "A developer designs the following provider claiming it is \"simpler than Wire cleanup\". Which option best identifies the drawbacks of this approach?",
    "code": "var globalDB *sql.DB\n\nfunc NewDB(cfg Config) *sql.DB {\n    db, _ := sql.Open(\"postgres\", cfg.DSN)\n    globalDB = db\n    return db\n}\n\nfunc CloseAll() {\n    if globalDB != nil {\n        globalDB.Close()\n    }\n}",
    "options": [
      "This approach is better than Wire cleanup because CloseAll can be called from anywhere",
      "The problem is that Wire does not support providers that set global variables",
      "This approach has multiple problems: it is not thread-safe, LIFO order is not guaranteed, testability is reduced due to global state, and the error from sql.Open is silently ignored",
      "The only problem is that CloseAll does not accept a context for graceful shutdown"
    ],
    "correctAnswerIndex": 2,
    "explanation": "The global state approach has several simultaneous problems: (1) <b>Not thread-safe</b> — multiple goroutines can access globalDB concurrently; (2) <b>LIFO order not guaranteed</b> — CloseAll runs cleanup in whatever order the developer chooses, not Wire&#39;s LIFO; (3) <b>Poor testability</b> — tests must manage global state; (4) <b>Error silently ignored</b> — <code>_</code> discards the error from Open."
  }
];
