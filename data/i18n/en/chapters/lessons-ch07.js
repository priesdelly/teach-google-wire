/* lessons ch07 (EN) */
(window.LESSONS_EN = window.LESSONS_EN || {}).ch07 = {
  "title": "Cleanup Functions and Error Handling",
  "sections": [
    {
      "type": "heading",
      "level": 2,
      "text": "Why Do Providers Need to Return a Cleanup Function?"
    },
    {
      "type": "paragraph",
      "html": "Many providers create resources that must be <mark>closed or released when the application shuts down</mark> — such as database connection pools, file handles, HTTP servers, or message queue consumers. If a provider merely creates a resource with no way to tell Wire how to close it, those resources will <strong>leak</strong> indefinitely. Wire solves this by letting providers return a <code>func()</code> as a cleanup function."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Provider Signatures Supported by Wire"
    },
    {
      "type": "paragraph",
      "html": "Wire supports all four provider signature forms, depending on whether the provider can error and whether it needs cleanup:"
    },
    {
      "type": "list",
      "ordered": false,
      "items": [
        "<code>func(...) T</code> — no error, no cleanup (e.g. NewConfig)",
        "<code>func(...) (T, error)</code> — can error, no cleanup needed",
        "<code>func(...) (T, func())</code> — no error, but cleanup is required",
        "<code>func(...) (T, func(), error)</code> — both cleanup and error (the most complete form)"
      ]
    },
    {
      "type": "callout",
      "variant": "observe",
      "title": "Note: Order of Return Values Matters",
      "html": "The order in the signature <strong>is critical</strong>: return values must always follow <code>(T, func(), error)</code> — the type first, cleanup in the middle, error last. Wire will immediately error if the order is wrong."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Writing a Provider with a Cleanup Function"
    },
    {
      "type": "paragraph",
      "html": "Here is the classic example: a provider that opens a database connection and returns a cleanup function to close it."
    },
    {
      "type": "code",
      "lang": "go",
      "code": "package infra\n\nimport (\n\t\"database/sql\"\n\t\"fmt\"\n\n\t_ \"github.com/lib/pq\"\n)\n\ntype DBConfig struct {\n\tDSN string\n}\n\n// NewDB opens a connection pool and returns a cleanup func to close it\nfunc NewDB(cfg DBConfig) (*sql.DB, func(), error) {\n\tdb, err := sql.Open(\"postgres\", cfg.DSN)\n\tif err != nil {\n\t\treturn nil, nil, fmt.Errorf(\"open db: %w\", err)\n\t}\n\tif err := db.Ping(); err != nil {\n\t\tdb.Close()\n\t\treturn nil, nil, fmt.Errorf(\"ping db: %w\", err)\n\t}\n\tcleanup := func() {\n\t\tdb.Close()\n\t}\n\treturn db, cleanup, nil\n}",
      "highlightLines": [15, 18, 20, 21, 24, 25, 27],
      "annotations": [
        {
          "line": 15,
          "text": "Signature <code>(T, func(), error)</code> — this is the most complete form, telling Wire that this provider requires cleanup and may fail."
        },
        {
          "line": 18,
          "text": "If Open fails, return <code>nil, nil, err</code> — cleanup is nil because no resource has been acquired yet."
        },
        {
          "line": 20,
          "text": "Ping verifies the actual connection. If it fails, call <code>db.Close()</code> before returning the error, because sql.Open already succeeded."
        },
        {
          "line": 24,
          "text": "Create the cleanup func as a closure that captures <code>db</code> — when called, it will close the connection pool."
        },
        {
          "line": 27,
          "text": "Return <code>db, cleanup, nil</code> in the correct order — Wire stores the cleanup to call later."
        }
      ]
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Cleanup Order: LIFO (Last In, First Out)"
    },
    {
      "type": "paragraph",
      "html": "When Wire generates an injector that has multiple providers with cleanup functions, <mark>Wire runs cleanups in LIFO order</mark> — the resource created <strong>last is cleaned up first</strong>. The reason is that resources created later often depend on resources created earlier, so dependents must be closed before their dependencies."
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// Assume Wire resolves dependencies in this order:\n// 1. NewDB        -> creates *sql.DB       (cleanup: db.Close)\n// 2. NewUserRepo  -> creates *UserRepo     (cleanup: repo.Close)\n// 3. NewServer    -> creates *http.Server  (cleanup: server.Shutdown)\n\n// Wire combines all cleanups and generates an injector roughly like this:\nfunc InitApp(cfg Config) (*App, func(), error) {\n\tdb, dbCleanup, err := infra.NewDB(cfg.DB)\n\tif err != nil {\n\t\treturn nil, nil, err\n\t}\n\trepo, repoCleanup, err := repo.NewUserRepo(db)\n\tif err != nil {\n\t\tdbCleanup() // A succeeded, must clean up before returning\n\t\treturn nil, nil, err\n\t}\n\tsrv, srvCleanup := server.NewServer(repo)\n\n\t// Wire builds an aggregated cleanup in LIFO order:\n\tcleanup := func() {\n\t\tsrvCleanup()  // close Server first  (created last)\n\t\trepoCleanup() // close Repo next\n\t\tdbCleanup()   // close DB last       (created first)\n\t}\n\treturn NewApp(srv), cleanup, nil\n}",
      "highlightLines": [8, 14, 20, 21, 22, 23],
      "annotations": [
        {
          "line": 8,
          "text": "Wire calls providers in dependency-graph order — DB must be created first because Repo depends on it."
        },
        {
          "line": 14,
          "text": "<strong>Key point:</strong> if NewUserRepo fails, Wire runs <code>dbCleanup()</code> immediately before returning the error — preventing a resource leak."
        },
        {
          "line": 20,
          "text": "The aggregated cleanup Wire generates — calls each cleanup in reverse creation order."
        },
        {
          "line": 21,
          "text": "Server is closed first, because closing DB first while the Server is still handling requests would cause a panic or error immediately."
        },
        {
          "line": 23,
          "text": "DB is closed last, after every component that uses it has already shut down — this is the reasoning behind LIFO."
        }
      ]
    },
    {
      "type": "callout",
      "variant": "observe",
      "title": "Note: LIFO = Reverse of Creation Order",
      "html": "If creation order is <strong>A → B → C</strong>, cleanup always runs in <strong>C → B → A</strong>. Think of a stack: push A, then B, then C — on cleanup, pop C first, then B, then A. This mirrors Go&#39;s <code>defer</code>, which also runs in LIFO order."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Injectors with Cleanup: Signature and Usage"
    },
    {
      "type": "paragraph",
      "html": "Whenever any provider in the dependency graph returns a <code>func()</code> cleanup, <mark>the injector Wire generates will include a <code>func()</code> in its return signature as well</mark>. Likewise, if any provider returns an error, the injector will return an error too."
    },
    {
      "type": "code",
      "lang": "go",
      "code": "//go:build wireinject\n\npackage main\n\nimport \"github.com/google/wire\"\n\n// Stub injector — Wire will generate wire_gen.go with the real implementation\nfunc InitApp(cfg Config) (*App, func(), error) {\n\twire.Build(\n\t\tinfra.NewDB,      // return (*sql.DB, func(), error)\n\t\trepo.NewUserRepo, // return (*UserRepo, func(), error)\n\t\tserver.NewServer, // return (*http.Server, func())\n\t\tNewApp,\n\t)\n\treturn nil, nil, nil // placeholder only\n}\n\n// === Usage in main.go ===\nfunc main() {\n\tcfg := loadConfig()\n\n\tapp, cleanup, err := InitApp(cfg)\n\tif err != nil {\n\t\tlog.Fatalf(\"init failed: %v\", err)\n\t}\n\tdefer cleanup() // critical: always defer cleanup\n\n\tapp.Run()\n}",
      "highlightLines": [8, 22, 23, 24, 26],
      "annotations": [
        {
          "line": 8,
          "text": "Stub signature <code>(*App, func(), error)</code> — Wire will generate an implementation that aggregates all cleanups in LIFO order."
        },
        {
          "line": 22,
          "text": "Injector return values: <code>app</code> is the result, <code>cleanup</code> is the aggregated cleanup func, <code>err</code> is the error from whichever provider failed."
        },
        {
          "line": 23,
          "text": "Always check the error first — if init fails and you skip the check, you will use a nil app and panic."
        },
        {
          "line": 26,
          "text": "<strong>defer cleanup()</strong> must be called every time, regardless of how the app stops (normal exit, signal, panic) — cleanup will always run."
        }
      ]
    },
    {
      "type": "callout",
      "variant": "warning",
      "title": "Pitfall: Forgetting defer cleanup()",
      "html": "Wire <strong>does not run cleanup automatically</strong> when the program exits. The cleanup function is just a plain <code>func()</code> — the caller is responsible for calling it. Forgetting <code>defer cleanup()</code> causes resource leaks: connection pools are not closed, goroutines remain stuck, and file handles are not flushed. This mistake is hard to spot during development but can have serious consequences in production."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Error Handling During Initialization"
    },
    {
      "type": "paragraph",
      "html": "The most subtle scenario is when one provider fails <strong>after</strong> a previous provider has already successfully created its resource. Wire handles this automatically: it runs the cleanup of already-created resources first, then returns the error."
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// Assume Wire generates code like this (simplified):\nfunc InitApp(cfg Config) (*App, func(), error) {\n\t// Step 1: DB created successfully\n\tdb, dbCleanup, err := infra.NewDB(cfg.DB)\n\tif err != nil {\n\t\treturn nil, nil, err // no resources to clean up yet\n\t}\n\n\t// Step 2: Create Cache — but it FAILS!\n\tcache, cacheCleanup, err := infra.NewRedisCache(cfg.Redis)\n\tif err != nil {\n\t\tdbCleanup() // DB was created successfully, must close before returning error\n\t\treturn nil, nil, err\n\t}\n\n\t// Step 3: Create Server\n\tsrv, srvCleanup := server.NewServer(db, cache)\n\n\tcleanup := func() {\n\t\tsrvCleanup()\n\t\tcacheCleanup()\n\t\tdbCleanup()\n\t}\n\treturn NewApp(srv), cleanup, nil\n}",
      "highlightLines": [4, 10, 12, 19, 20, 21, 22],
      "annotations": [
        {
          "line": 4,
          "text": "Step 1 succeeded: <code>db</code> and <code>dbCleanup</code> are ready."
        },
        {
          "line": 10,
          "text": "Step 2 fails: Wire-generated code must not abandon the DB connection that was already opened."
        },
        {
          "line": 12,
          "text": "<strong>Wire calls dbCleanup() before returning the error</strong> — this is Wire&#39;s guarantee: resources that were successfully created will always be cleaned up even if initialization fails later."
        },
        {
          "line": 19,
          "text": "Aggregated cleanup in LIFO order: Server → Cache → DB."
        }
      ]
    },
    {
      "type": "callout",
      "variant": "tip",
      "title": "Tip: Wire Handles Mid-Init Error Cleanup Automatically",
      "html": "You <strong>do not need to write this error-cleanup logic by hand</strong>. That is exactly why you should use the cleanup function pattern instead of closing resources inside the provider itself. Wire generates all the correct code for you, including cleaning up already-created resources when a later provider fails."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Real-World Example: HTTP Server Provider with Cleanup"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "package server\n\nimport (\n\t\"context\"\n\t\"net/http\"\n\t\"time\"\n)\n\n// NewHTTPServer creates an HTTP server and returns a cleanup for graceful shutdown\nfunc NewHTTPServer(mux *http.ServeMux, cfg Config) (*http.Server, func()) {\n\tsrv := &http.Server{\n\t\tAddr:    cfg.Addr,\n\t\tHandler: mux,\n\t}\n\n\tcleanup := func() {\n\t\tctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)\n\t\tdefer cancel()\n\t\tsrv.Shutdown(ctx) // graceful: wait for in-flight requests to finish\n\t}\n\n\treturn srv, cleanup\n}\n\n// NewServeMux creates a mux and registers routes\nfunc NewServeMux(userH *UserHandler, orderH *OrderHandler) *http.ServeMux {\n\tmux := http.NewServeMux()\n\tmux.HandleFunc(\"/users\", userH.ServeHTTP)\n\tmux.HandleFunc(\"/orders\", orderH.ServeHTTP)\n\treturn mux\n}",
      "highlightLines": [10, 16, 19, 22],
      "annotations": [
        {
          "line": 10,
          "text": "Signature <code>(*http.Server, func())</code> — no error, because creating the Server struct cannot fail. (Port binding happens at ListenAndServe, not here.)"
        },
        {
          "line": 16,
          "text": "Cleanup is a closure that captures <code>srv</code> — it will be called when the injector&#39;s cleanup is invoked."
        },
        {
          "line": 19,
          "text": "<code>Shutdown</code> instead of <code>Close</code> for graceful shutdown: waits for active connections to finish within the given timeout."
        },
        {
          "line": 22,
          "text": "Wire will run this cleanup <strong>before</strong> dbCleanup per LIFO order — the Server stops accepting requests before the DB is closed."
        }
      ]
    },
    {
      "type": "callout",
      "variant": "warning",
      "title": "Pitfall: Provider Closes Its Own Resource Instead of Returning Cleanup",
      "html": "If a provider calls <code>db.Close()</code> itself via defer or a goroutine, <strong>Wire has no idea there is a cleanup to coordinate</strong> and will not include that resource in the LIFO chain. The problem is that the resource may be closed in the wrong order (e.g., DB closed before the Server stops) or closed twice. Always <strong>return a cleanup function</strong> and let Wire manage the ordering."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Summary: Cleanup and Error Handling in Wire"
    },
    {
      "type": "list",
      "ordered": true,
      "items": [
        "Providers that need cleanup should return <code>(T, func())</code> or <code>(T, func(), error)</code>.",
        "Wire combines all cleanups into a single cleanup function in <strong>LIFO</strong> order (reverse of creation).",
        "If a later provider fails, Wire runs the cleanups of already-created resources before returning the error.",
        "An injector that has cleanup providers will include <code>func()</code> in its return signature.",
        "The caller <strong>must</strong> <code>defer cleanup()</code> after calling the injector — Wire does not run cleanup automatically.",
        "Never close resources inside the provider itself — return a cleanup function and let Wire manage the ordering."
      ]
    }
  ]
};
