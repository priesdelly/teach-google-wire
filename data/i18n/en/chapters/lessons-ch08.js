/* lessons ch08 (EN) */
(window.LESSONS_EN = window.LESSONS_EN || {}).ch08 = {
  "title": "Multiple Injectors and Per-Request Scoping",
  "sections": [
    {
      "type": "heading",
      "level": 2,
      "text": "One Project — Multiple Injectors"
    },
    {
      "type": "paragraph",
      "html": "Wire does not limit a package to a single injector function. In practice, a project often needs <mark>multiple injectors</mark> — one for production, one for integration tests, and another as a per-request handler factory. Each injector is a completely separate function, and <strong>Wire has no global singleton registry</strong> linking those injectors together."
    },
    {
      "type": "callout",
      "variant": "observe",
      "title": "Observation: Wire Has No Global Registry",
      "html": "Unlike Spring Framework or Uber fx, which have a central container, Wire is a <strong>pure code generator</strong> — no runtime objects, no singleton registry, no shared state between injectors at all. Each injector builds its own <em>independent</em> dependency graph."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Defining Multiple Injectors in the Same wire.go"
    },
    {
      "type": "paragraph",
      "html": "Consider a <code>wire.go</code> with two injectors: <code>InitApp</code> for production and <code>InitTestApp</code> for tests. Both live in the same file under the same build tag, yet each produces a fully independent dependency graph:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "//go:build wireinject\n\npackage main\n\nimport (\n\t\"testing\"\n\n\t\"github.com/google/wire\"\n\t\"github.com/example/app/config\"\n\t\"github.com/example/app/repo\"\n\t\"github.com/example/app/service\"\n)\n\n// Production injector — takes a Config path as a parameter\nfunc InitApp(cfgPath string) (*App, func(), error) {\n\twire.Build(\n\t\tconfig.Load,       // func(path string) (Config, error)\n\t\trepo.NewPostgres,  // func(Config) (*sql.DB, func(), error)\n\t\trepo.NewUserRepo,  // func(*sql.DB) *UserRepo\n\t\tservice.NewUserService,\n\t\tNewApp,\n\t)\n\treturn nil, nil, nil\n}\n\n// Test injector — takes *testing.T and swaps UserRepo with a mock\nfunc InitTestApp(t *testing.T) (*App, func()) {\n\twire.Build(\n\t\trepo.NewInMemoryUserRepo, // mock implementation\n\t\tservice.NewUserService,\n\t\tNewApp,\n\t\twire.Bind(new(repo.UserRepository), new(*repo.InMemoryUserRepo)),\n\t)\n\treturn nil, nil\n}",
      "highlightLines": [14, 26, 29, 32],
      "annotations": [
        {
          "line": 14,
          "text": "A regular injector function — every provider listed in wire.Build constructs its own fresh set of dependencies."
        },
        {
          "line": 26,
          "text": "A second injector in the same file — its graph shares nothing with InitApp, not even Config."
        },
        {
          "line": 29,
          "text": "Uses a mock provider instead of the production provider — this is how Wire swaps implementations across environments."
        },
        {
          "line": 32,
          "text": "wire.Bind tells Wire that InMemoryUserRepo is the concrete type fulfilling the UserRepository interface in the test graph."
        }
      ]
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Two Injectors Does Not Mean a Shared Instance"
    },
    {
      "type": "paragraph",
      "html": "This is the point that <mark>trips up many developers</mark>. Consider: if both <code>InitApp</code> and <code>InitTestApp</code> list <code>config.Load</code> as a provider — <strong>Wire will call <code>config.Load</code> separately, twice</strong>, producing two independent Config instances. There is no singleton shared across injectors."
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// Assume config.Load prints a message every time it is called\nfunc Load(path string) (Config, error) {\n\tfmt.Println(\"Loading config...\")\n\t// ...\n}\n\n// Call two injectors separately\nappA, cleanupA, _ := InitApp(\"prod.yaml\")   // prints \"Loading config...\"\nappB, cleanupB, _ := InitApp(\"prod.yaml\")   // prints \"Loading config...\" again\n\n// appA and appB each hold a distinct Config — they are not the same singleton",
      "highlightLines": [9, 10, 12],
      "annotations": [
        {
          "line": 9,
          "text": "First InitApp call — Wire calls config.Load and creates Config instance #1."
        },
        {
          "line": 10,
          "text": "Second InitApp call — Wire calls config.Load again and creates Config instance #2, fully independent."
        },
        {
          "line": 12,
          "text": "Wire remembers nothing between calls — every injector invocation builds a brand-new graph."
        }
      ]
    },
    {
      "type": "callout",
      "variant": "warning",
      "title": "Pitfall: Expecting a Singleton Across Injectors",
      "html": "If you need to <strong>share the same instance</strong> across injectors (for example, a single database pool) you must create that instance manually first, then <strong>pass it as a parameter</strong> to each injector — or build a parent injector and forward its results to a child injector. Wire will not do this automatically."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "How to Share an Instance: Pass It as an Injector Parameter"
    },
    {
      "type": "paragraph",
      "html": "When you need to share the same <code>*sql.DB</code> pool between injectors, <mark>create the DB pool manually first</mark> and pass it in as an injector parameter. Wire treats those parameters as values whose providers have already run — it will not look for a constructor for them:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "//go:build wireinject\n\npackage main\n\nimport (\n\t\"database/sql\"\n\t\"log/slog\"\n\n\t\"github.com/google/wire\"\n\t\"github.com/example/app/repo\"\n\t\"github.com/example/app/service\"\n)\n\n// Injector accepts an externally-created *sql.DB.\n// Wire injects db directly into the graph without calling a DB constructor.\nfunc InitHandlerScope(db *sql.DB, logger *slog.Logger) *RequestHandler {\n\twire.Build(\n\t\trepo.NewUserRepo,       // func(*sql.DB) *UserRepo — receives the passed-in db\n\t\tservice.NewUserService, // func(*UserRepo) *UserService\n\t\tNewRequestHandler,      // func(*UserService, *slog.Logger) *RequestHandler\n\t)\n\treturn nil\n}\n\n// Caller side in main.go:\n// db := setupDB()     // created once\n// logger := setupLogger()\n//\n// handler1 := InitHandlerScope(db, logger)  // shares db pool\n// handler2 := InitHandlerScope(db, logger)  // shares the same db pool",
      "highlightLines": [15, 17, 25, 27, 28],
      "annotations": [
        {
          "line": 15,
          "text": "Injector function parameters are 'already-built values' — Wire does not look for a constructor for *sql.DB."
        },
        {
          "line": 17,
          "text": "repo.NewUserRepo receives the *sql.DB passed in as a parameter directly."
        },
        {
          "line": 25,
          "text": "db is created once by hand before any injector is called."
        },
        {
          "line": 27,
          "text": "Both handler1 and handler2 use the same db pool — but UserRepo and UserService are freshly constructed each time."
        }
      ]
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Per-Request Scoping — The Core Concept"
    },
    {
      "type": "paragraph",
      "html": "Wire <strong>has no <code>@RequestScope</code></strong> like Spring and no per-request container like Guice. The correct approach is: <mark>call the injector function on every incoming request</mark>, passing request-scoped values such as <code>*http.Request</code>, <code>context.Context</code>, or a request ID as arguments. Wire will make those values available to every provider in the graph that needs them."
    },
    {
      "type": "callout",
      "variant": "note",
      "title": "Per-Request Scoping in Wire Is About Injector Design, Not Annotations",
      "html": "Wire does not scope automatically, but you get the same outcome by: (1) separating the app-scoped injector (called once at startup) from the request-scoped injector (called per request), (2) passing app-level singletons such as a DB pool as <strong>parameters</strong> to the request injector, and (3) passing request-specific values such as <code>*http.Request</code> as parameters as well."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Per-Request Injector: A Complete Example"
    },
    {
      "type": "paragraph",
      "html": "The following HTTP server uses Wire to build a handler per request, sharing the DB pool and logger while constructing a fresh service layer each time so that the request context is properly propagated:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// wire.go\n//go:build wireinject\n\npackage main\n\nimport (\n\t\"context\"\n\t\"database/sql\"\n\t\"log/slog\"\n\t\"net/http\"\n\n\t\"github.com/google/wire\"\n\t\"github.com/example/app/repo\"\n\t\"github.com/example/app/service\"\n)\n\n// App-level injector — called once at startup\nfunc InitApp(cfgPath string) (*sql.DB, *slog.Logger, func(), error) {\n\twire.Build(\n\t\tconfig.Load,\n\t\trepo.NewPostgresDB, // return (*sql.DB, func(), error)\n\t\tnewLogger,\n\t)\n\treturn nil, nil, nil, nil\n}\n\n// requestContext extracts context.Context from *http.Request for injection.\nfunc requestContext(r *http.Request) context.Context { return r.Context() }\n\n// Per-request injector — called on every HTTP request.\n// Receives app-scoped singletons and request-scoped values as parameters.\nfunc InitRequestScope(\n\tdb *sql.DB,\n\tlogger *slog.Logger,\n\tr *http.Request,\n) *UserHandler {\n\twire.Build(\n\t\trepo.NewUserRepo,       // func(*sql.DB) *UserRepo\n\t\tservice.NewUserService, // func(*UserRepo, context.Context) *UserService\n\t\tNewUserHandler,         // func(*UserService, *slog.Logger) *UserHandler\n\t\trequestContext,         // func(*http.Request) context.Context\n\t)\n\treturn nil\n}",
      "highlightLines": [18, 27, 31, 33, 34, 35, 41],
      "annotations": [
        {
          "line": 18,
          "text": "App-level injector creates the DB pool and logger once — called in main() before ListenAndServe."
        },
        {
          "line": 27,
          "text": "A provider function that extracts context.Context from *http.Request — wire.Value() cannot be used with function-call expressions or interface types, so a provider function is required instead."
        },
        {
          "line": 31,
          "text": "Per-request injector receives the already-created *sql.DB and *slog.Logger as parameters."
        },
        {
          "line": 33,
          "text": "*http.Request is a parameter — this lets the requestContext provider inside the graph request *http.Request."
        },
        {
          "line": 35,
          "text": "Wire will construct UserRepo, UserService, and UserHandler fresh for every request — but reuses the same DB pool."
        },
        {
          "line": 41,
          "text": "requestContext is a provider that takes *http.Request and returns context.Context — Wire calls it to satisfy any provider that needs context.Context."
        }
      ]
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Caller Pattern in an HTTP Handler"
    },
    {
      "type": "paragraph",
      "html": "Here is how <code>main.go</code> and HTTP middleware use both injectors together. Notice that the DB pool is created once and forwarded into the request injector on every call:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// main.go\nfunc main() {\n\t// 1. Build app-level dependencies once\n\tdb, logger, cleanup, err := InitApp(\"config.yaml\")\n\tif err != nil {\n\t\tlog.Fatal(err)\n\t}\n\tdefer cleanup()\n\n\t// 2. Build the HTTP server\n\tmux := http.NewServeMux()\n\tmux.HandleFunc(\"/users\", func(w http.ResponseWriter, r *http.Request) {\n\t\t// 3. Call the per-request injector on every request.\n\t\t//    db and logger are app-scoped — passed in every time.\n\t\t//    r is request-scoped — different for each request.\n\t\thandler := InitRequestScope(db, logger, r)\n\t\thandler.ServeHTTP(w, r)\n\t})\n\n\tlog.Fatal(http.ListenAndServe(\":8080\", mux))\n}",
      "highlightLines": [4, 8, 16],
      "annotations": [
        {
          "line": 4,
          "text": "InitApp is called once — the DB pool, logger, and cleanup function are created at startup."
        },
        {
          "line": 8,
          "text": "defer cleanup() handles LIFO cleanup of app-level resources when the server shuts down."
        },
        {
          "line": 16,
          "text": "InitRequestScope is called on every request — it creates a fresh UserRepo, UserService, and UserHandler while reusing the existing db pool."
        }
      ]
    },
    {
      "type": "callout",
      "variant": "warning",
      "title": "Pitfall: Putting Heavy Singletons Inside the Per-Request Injector",
      "html": "If the per-request injector lists <code>repo.NewPostgresDB</code> as a provider directly, Wire will call <code>sql.Open()</code> on every request — <strong>creating a new connection pool for each HTTP request</strong>. This is extremely expensive and will exhaust connections. The correct approach is to <strong>always pass *sql.DB as a parameter</strong> rather than letting the per-request injector create it."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Trade-off: Per-Request Injector vs Context Propagation"
    },
    {
      "type": "paragraph",
      "html": "There are two main approaches for delivering request-scoped data to deep layers of an application, each with its own trade-offs:"
    },
    {
      "type": "list",
      "ordered": false,
      "items": [
        "<strong>Per-request injector (Wire pattern)</strong> — constructs fresh service/handler objects per request by passing request values as injector parameters. Pros: dependencies are explicit in the type system, easy to test. Cons: slight overhead of allocating structs per request, requires careful injector design.",
        "<strong>Context propagation</strong> — passes a <code>context.Context</code> carrying request data through every function call. Pros: idiomatic Go, no new structs needed. Cons: context is an untyped bag of values, easy to misuse, hard to know which keys a function expects.",
        "<strong>Hybrid approach (recommended)</strong> — use per-request injectors for <em>factory</em> or <em>handler-level</em> objects, and use <code>context.Context</code> for request IDs, trace IDs, or deadlines that need to travel deep into the call stack."
      ]
    },
    {
      "type": "callout",
      "variant": "tip",
      "title": "Best Practice: Draw a Clear Line Between App Scope and Request Scope",
      "html": "Define the boundary clearly: <strong>App-scoped</strong> = created once in <code>InitApp</code> — DB pool, HTTP client, logger configuration, config — passed as parameters to the request injector. <strong>Request-scoped</strong> = created fresh per request — request handler, request-specific service instance, trace context — let Wire construct these in <code>InitRequestScope</code>."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Chapter 8 Summary"
    },
    {
      "type": "paragraph",
      "html": "In this chapter we learned that <mark>Wire has no runtime scopes or global singleton registry</mark> — each injector builds its own independent dependency graph. <strong>Sharing an instance</strong> is done by creating it manually and passing it as an injector parameter. <strong>Per-request scoping</strong> is achieved by designing an injector that accepts request-scoped values as arguments and calling it on each request. Most importantly: <strong>never put heavy app-scoped dependencies</strong> such as a DB pool inside the per-request injector, because Wire will recreate them on every request."
    }
  ]
};
