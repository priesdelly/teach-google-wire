/* lessons ch09 (EN) */
(window.LESSONS_EN = window.LESSONS_EN || {}).ch09 = {
  "title": "Integration with HTTP and gRPC",
  "sections": [
    {
      "type": "heading",
      "level": 2,
      "text": "Overview: Wire in a Real Server"
    },
    {
      "type": "paragraph",
      "html": "This chapter is where Wire \"hits production\". Instead of small struct examples, we wire a complete dependency stack end-to-end: <strong>Config</strong> → <strong>Repository</strong> → <strong>Service</strong> → <strong>Handler/Transport</strong> all the way to a <code>*http.Server</code> or <code>*grpc.Server</code> ready to serve real requests. The goal is a <code>main()</code> that does almost nothing — call the injector, defer cleanup, start the server. That's it."
    },
    {
      "type": "callout",
      "variant": "observe",
      "title": "Note: Recommended Package Layout",
      "html": "For a real project, split packages as follows:<br><code>cmd/server/main.go</code> — entry point<br><code>internal/wire/wire.go</code> — injector stub<br><code>internal/wire/wire_gen.go</code> — generated<br><code>internal/handler/</code> — HTTP/gRPC handlers + provider set<br><code>internal/service/</code> — business logic + provider set<br><code>internal/repo/</code> — database access + provider set<br><code>internal/config/</code> — config loading provider<br>Separating packages by layer keeps each layer's provider set co-located with its own code."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "HTTP Server: Wiring Every Layer"
    },
    {
      "type": "paragraph",
      "html": "We start with HTTP because it is the most familiar. We wire the entire stack with <code>*http.Server</code> as the root type the injector must return. Each layer owns its own provider and groups it into a <code>wire.NewSet</code> scoped to that layer."
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// internal/config/config.go\npackage config\n\ntype Config struct {\n\tAddr   string\n\tDSN    string\n\tDebug  bool\n}\n\n// Provider: accepts a path from the caller, returns a loaded Config\nfunc Load(path string) (Config, error) {\n\t// read file / env vars and unmarshal into Config\n\treturn Config{Addr: \":8080\", DSN: \"postgres://...\"}, nil\n}\n\nvar Set = wire.NewSet(Load)",
      "highlightLines": [11, 16],
      "annotations": [
        {
          "line": 11,
          "text": "Provider returns a <b>value type</b> Config (not a pointer) — Wire matches it directly with any consumer that accepts Config. No pointer required."
        },
        {
          "line": 16,
          "text": "Declare <b>Set</b> in the same package as the provider so injectors can import and use it conveniently."
        }
      ]
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// internal/repo/repo.go\npackage repo\n\nimport (\n\t\"database/sql\"\n\t\"github.com/google/wire\"\n)\n\nfunc NewDB(cfg config.Config) (*sql.DB, func(), error) {\n\tdb, err := sql.Open(\"pgx\", cfg.DSN)\n\tif err != nil {\n\t\treturn nil, nil, err\n\t}\n\tcleanup := func() { db.Close() }\n\treturn db, cleanup, nil\n}\n\ntype UserRepo struct{ db *sql.DB }\n\nfunc NewUserRepo(db *sql.DB) *UserRepo {\n\treturn &UserRepo{db: db}\n}\n\nvar Set = wire.NewSet(NewDB, NewUserRepo)",
      "highlightLines": [9, 14, 24],
      "annotations": [
        {
          "line": 9,
          "text": "The provider for <code>*sql.DB</code> returns a <b>cleanup func</b> as its second return value — Wire automatically collects this into the cleanup chain."
        },
        {
          "line": 14,
          "text": "<code>db.Close</code> is wrapped in a <b>closure</b> and returned. Never call <code>db.Close()</code> directly inside the provider."
        },
        {
          "line": 24,
          "text": "<b>Set</b> groups the DB provider and the UserRepo provider together — both belong to the same layer."
        }
      ]
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// internal/service/service.go\npackage service\n\nimport \"github.com/google/wire\"\n\ntype UserService struct {\n\trepo *repo.UserRepo\n\tcfg  config.Config\n}\n\nfunc NewUserService(r *repo.UserRepo, cfg config.Config) *UserService {\n\treturn &UserService{repo: r, cfg: cfg}\n}\n\nvar Set = wire.NewSet(NewUserService)\n\n// internal/handler/handler.go\npackage handler\n\nimport (\n\t\"net/http\"\n\t\"github.com/google/wire\"\n)\n\ntype UserHandler struct{ svc *service.UserService }\n\nfunc NewUserHandler(svc *service.UserService) *UserHandler {\n\treturn &UserHandler{svc: svc}\n}\n\nfunc NewServeMux(u *UserHandler) *http.ServeMux {\n\tmux := http.NewServeMux()\n\tmux.HandleFunc(\"GET /users\", u.List)\n\treturn mux\n}\n\nfunc NewHTTPServer(mux *http.ServeMux, cfg config.Config) (*http.Server, func()) {\n\tsrv := &http.Server{\n\t\tAddr:    cfg.Addr,\n\t\tHandler: mux,\n\t}\n\tcleanup := func() {\n\t\tctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)\n\t\tdefer cancel()\n\t\tsrv.Shutdown(ctx)\n\t}\n\treturn srv, cleanup\n}\n\nvar Set = wire.NewSet(NewUserHandler, NewServeMux, NewHTTPServer)",
      "highlightLines": [31, 37, 39, 42, 50],
      "annotations": [
        {
          "line": 31,
          "text": "<b>NewServeMux</b> is a provider that accepts handlers and registers all routes — routing logic is cleanly separated from the handler struct."
        },
        {
          "line": 37,
          "text": "<b>NewHTTPServer</b> is the root provider of the HTTP stack. It accepts <code>*http.ServeMux</code> and Config, and returns <code>*http.Server</code>."
        },
        {
          "line": 39,
          "text": "The server is created with <code>cfg.Addr</code> from Config — never hardcode a port inside a provider."
        },
        {
          "line": 42,
          "text": "The cleanup uses <code>srv.Shutdown</code> with a <b>context timeout</b> for graceful shutdown — in-flight requests finish before the server stops."
        },
        {
          "line": 50,
          "text": "<b>Set</b> groups the handler, mux, and server providers together. All three belong to the transport layer."
        }
      ]
    },
    {
      "type": "heading",
      "level": 2,
      "text": "The Injector and a Clean main()"
    },
    {
      "type": "paragraph",
      "html": "Once every layer has a provider set, the injector stub is extremely compact, and <code>main()</code> does not need to know any constructor from any layer."
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// internal/wire/wire.go\n//go:build wireinject\n\npackage wire\n\nimport (\n\t\"github.com/google/wire\"\n\t\"myapp/internal/config\"\n\t\"myapp/internal/handler\"\n\t\"myapp/internal/repo\"\n\t\"myapp/internal/service\"\n)\n\nfunc InitApp(cfgPath string) (*http.Server, func(), error) {\n\twire.Build(\n\t\tconfig.Set,\n\t\trepo.Set,\n\t\tservice.Set,\n\t\thandler.Set,\n\t)\n\treturn nil, nil, nil\n}\n\n// cmd/server/main.go\npackage main\n\nfunc main() {\n\tsrv, cleanup, err := wire.InitApp(\"config.yaml\")\n\tif err != nil {\n\t\tlog.Fatal(err)\n\t}\n\tdefer cleanup()\n\n\tlog.Printf(\"listening on %s\", srv.Addr)\n\tif err := srv.ListenAndServe(); err != http.ErrServerClosed {\n\t\tlog.Fatal(err)\n\t}\n}",
      "highlightLines": [2, 14, 15, 16, 17, 18, 27, 32],
      "annotations": [
        {
          "line": 2,
          "text": "The build tag <code>//go:build wireinject</code> is mandatory — if omitted, the compiler will try to compile the stub body and fail."
        },
        {
          "line": 14,
          "text": "The injector returns <code>(*http.Server, func(), error)</code> — Wire aggregates the cleanup functions from <b>every provider</b> in the graph and delivers them as a single cleanup func."
        },
        {
          "line": 15,
          "text": "Only <b>per-layer Sets</b> go into wire.Build — no need to list individual providers. This keeps the injector readable and easy to maintain."
        },
        {
          "line": 27,
          "text": "<code>main()</code> calls the injector in a single line. There are zero manual constructor calls."
        },
        {
          "line": 32,
          "text": "<code>defer cleanup()</code> must always come after the error check — Wire guarantees that cleanups for successfully created resources are called in LIFO order."
        }
      ]
    },
    {
      "type": "callout",
      "variant": "tip",
      "title": "Best Practice: One Provider Set Per Layer",
      "html": "Keep one <code>wire.NewSet</code> per layer (<code>config.Set</code>, <code>repo.Set</code>, <code>service.Set</code>, <code>handler.Set</code>) declared in that layer's own package. Never mix providers from multiple layers into a single set — doing so makes it hard to reuse or swap a single layer's implementation."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "gRPC Server: Wiring grpc.Server"
    },
    {
      "type": "paragraph",
      "html": "The gRPC pattern closely mirrors HTTP. The difference is that we must create a <code>*grpc.Server</code> and register our service implementation on it — both steps happen inside providers."
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// internal/grpcserver/grpcserver.go\npackage grpcserver\n\nimport (\n\t\"google.golang.org/grpc\"\n\t\"github.com/google/wire\"\n\tpb \"myapp/gen/proto\"\n)\n\n// UserGRPCServer implements pb.UserServiceServer\ntype UserGRPCServer struct {\n\tpb.UnimplementedUserServiceServer\n\tsvc *service.UserService\n}\n\nfunc NewUserGRPCServer(svc *service.UserService) *UserGRPCServer {\n\treturn &UserGRPCServer{svc: svc}\n}\n\n// NewGRPCServer creates a *grpc.Server, registers the implementation, and returns cleanup\nfunc NewGRPCServer(impl *UserGRPCServer, cfg config.Config) (*grpc.Server, func()) {\n\topts := []grpc.ServerOption{\n\t\tgrpc.MaxRecvMsgSize(cfg.GRPCMaxMsgSize),\n\t}\n\tsrv := grpc.NewServer(opts...)\n\tpb.RegisterUserServiceServer(srv, impl)\n\tcleanup := func() { srv.GracefulStop() }\n\treturn srv, cleanup\n}\n\nvar Set = wire.NewSet(\n\tNewUserGRPCServer,\n\tNewGRPCServer,\n\twire.Bind(new(pb.UserServiceServer), new(*UserGRPCServer)),\n)",
      "highlightLines": [16, 21, 26, 27, 34],
      "annotations": [
        {
          "line": 16,
          "text": "The <b>impl provider</b> receives the service from the layer below — the impl knows nothing about grpc.Server and grpc.Server knows nothing about the impl. They are connected only through providers."
        },
        {
          "line": 21,
          "text": "<b>grpc.ServerOption</b> values should come from Config, not be hardcoded in the provider — this makes the server config-driven and testable."
        },
        {
          "line": 26,
          "text": "Calling <code>pb.RegisterUserServiceServer(srv, impl)</code> here is correct — it is server setup, not business logic."
        },
        {
          "line": 27,
          "text": "<code>srv.GracefulStop()</code> is the ideal cleanup — it waits for all in-flight RPC calls to complete before stopping."
        },
        {
          "line": 34,
          "text": "<code>wire.Bind</code> maps the interface <code>pb.UserServiceServer</code> to the concrete type <code>*UserGRPCServer</code> — required when any consumer depends on the interface rather than the concrete struct."
        }
      ]
    },
    {
      "type": "paragraph",
      "html": "The <code>main.go</code> for a gRPC server follows the same pattern, but calls <code>srv.Serve(lis)</code> instead of <code>srv.ListenAndServe()</code>:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// cmd/grpc/main.go\npackage main\n\nfunc main() {\n\tcfg, err := config.Load(\"config.yaml\")\n\tif err != nil {\n\t\tlog.Fatal(err)\n\t}\n\n\tsrv, cleanup, err := wire.InitGRPCApp(cfg)\n\tif err != nil {\n\t\tlog.Fatal(err)\n\t}\n\tdefer cleanup()\n\n\tlis, err := net.Listen(\"tcp\", cfg.GRPCAddr)\n\tif err != nil {\n\t\tlog.Fatal(err)\n\t}\n\n\tlog.Printf(\"gRPC listening on %s\", cfg.GRPCAddr)\n\tif err := srv.Serve(lis); err != nil {\n\t\tlog.Fatal(err)\n\t}\n}",
      "highlightLines": [10, 14, 22],
      "annotations": [
        {
          "line": 10,
          "text": "A separate injector function is used for HTTP and gRPC, but both can share <code>repo.Set</code> and <code>service.Set</code>. Config is passed as a parameter because it was already loaded in main()."
        },
        {
          "line": 14,
          "text": "<code>defer cleanup()</code> calls <code>grpc.GracefulStop()</code> and <code>db.Close()</code> in LIFO order — the server stops first, the DB closes last."
        },
        {
          "line": 22,
          "text": "<code>srv.Serve(lis)</code> blocks until <code>GracefulStop()</code> is called, for example from a signal handler or the cleanup func."
        }
      ]
    },
    {
      "type": "heading",
      "level": 2,
      "text": "HTTP Middleware: A Provider for the Chain"
    },
    {
      "type": "paragraph",
      "html": "Middleware in <code>net/http</code> has the type <code>func(http.Handler) http.Handler</code>. You can create a provider for the middleware and compose it with the server provider."
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// internal/middleware/middleware.go\npackage middleware\n\nimport \"net/http\"\n\n// NewLoggingMiddleware is a provider that returns a middleware function\nfunc NewLoggingMiddleware(logger *slog.Logger) func(http.Handler) http.Handler {\n\treturn func(next http.Handler) http.Handler {\n\t\treturn http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {\n\t\t\tstart := time.Now()\n\t\t\tnext.ServeHTTP(w, r)\n\t\t\tlogger.Info(\"request\", \"method\", r.Method, \"path\", r.URL.Path, \"dur\", time.Since(start))\n\t\t})\n\t}\n}\n\n// In the handler package — compose middleware with the mux\nfunc NewHTTPServerWithMiddleware(\n\tmux *http.ServeMux,\n\tlogging func(http.Handler) http.Handler,\n\tcfg config.Config,\n) (*http.Server, func()) {\n\thandler := logging(mux) // wrap mux with middleware\n\tsrv := &http.Server{Addr: cfg.Addr, Handler: handler}\n\tcleanup := func() {\n\t\tctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)\n\t\tdefer cancel()\n\t\tsrv.Shutdown(ctx)\n\t}\n\treturn srv, cleanup\n}",
      "highlightLines": [7, 20, 23],
      "annotations": [
        {
          "line": 7,
          "text": "The provider returns a <b>function type</b> <code>func(http.Handler) http.Handler</code> — Wire uses the return type as a key, so function types are valid keys too."
        },
        {
          "line": 20,
          "text": "The server provider accepts middleware as a parameter. If you need multiple middleware, use a struct or named types to differentiate them."
        },
        {
          "line": 23,
          "text": "<b>Composition</b> happens inside this provider: <code>logging(mux)</code> makes the handler a middleware-wrapped mux. This logic lives in the provider, not in the injector."
        }
      ]
    },
    {
      "type": "heading",
      "level": 2,
      "text": "wire.Value for a Pre-Loaded Config"
    },
    {
      "type": "paragraph",
      "html": "Sometimes Config is loaded before the injector is called (e.g., flags are already parsed and you have a <code>Config</code> struct in hand). You can pass Config directly as an injector parameter or use <code>wire.Value</code>."
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// Option 1: pass Config as an injector parameter (recommended)\n//go:build wireinject\n\nfunc InitApp(cfg config.Config) (*http.Server, func(), error) {\n\twire.Build(\n\t\t// config.Set is no longer needed — cfg is an injector input\n\t\trepo.Set,\n\t\tservice.Set,\n\t\thandler.Set,\n\t)\n\treturn nil, nil, nil\n}\n\n// main.go\nfunc main() {\n\tcfg, err := config.Load(\"config.yaml\")\n\tif err != nil {\n\t\tlog.Fatal(err)\n\t}\n\t// cfg is passed directly into the injector as an argument\n\tsrv, cleanup, err := InitApp(cfg)\n\tif err != nil {\n\t\tlog.Fatal(err)\n\t}\n\tdefer cleanup()\n\tsrv.ListenAndServe()\n}",
      "highlightLines": [4, 20],
      "annotations": [
        {
          "line": 4,
          "text": "The injector accepts <code>config.Config</code> as a <b>parameter</b> — Wire treats injector parameters as pre-provided values that do not need a provider."
        },
        {
          "line": 20,
          "text": "Load Config in <code>main()</code> first, then pass it into the injector. This cleanly separates config loading from the Wire graph."
        }
      ]
    },
    {
      "type": "callout",
      "variant": "warning",
      "title": "Pitfall: Never Put Business Logic in an Injector",
      "html": "An injector body exists solely for <code>wire.Build(...)</code>. Wire only reads the <code>wire.Build</code> call; any other logic in the body is silently ignored during code generation. <strong>Never</strong> write if/for/switch or any business logic inside an injector outside of <code>wire.Build</code>.<br><br>Example of what not to do:<br><code>func InitApp(env string) *App {<br>&nbsp;&nbsp;if env == \"prod\" { ... } // ← Wire never sees this!<br>&nbsp;&nbsp;wire.Build(...)<br>}</code>"
    },
    {
      "type": "callout",
      "variant": "warning",
      "title": "Pitfall: Never Wire Request-Scoped Values at Startup",
      "html": "Wire runs <strong>once at app startup</strong> — there is no runtime scope like Spring&#39;s @RequestScope. If you need per-request values such as <code>*http.Request</code>, user ID, or trace ID, pass them via <b>function arguments</b> or <b>context.Context</b>, not through the Wire injector."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Summary: HTTP/gRPC Integration Checklist"
    },
    {
      "type": "list",
      "ordered": false,
      "items": [
        "<strong>Separate provider sets by layer</strong> — config, repo, service, handler/transport each have their own <code>wire.NewSet</code>",
        "<strong>The injector root type is the server</strong> — <code>*http.Server</code> or <code>*grpc.Server</code> is what Wire must build to",
        "<strong>Provide a cleanup for every resource</strong> — DB, HTTP server, and gRPC server must all have a cleanup func",
        "<strong>Config as parameter or provider</strong> — load config before calling the injector and pass it in, or provide a <code>config.Load</code> provider",
        "<strong>Middleware as a provider</strong> — return the function type <code>func(http.Handler) http.Handler</code> and compose it inside the server provider",
        "<strong>Keep main() minimal</strong> — call injector, check error, defer cleanup, start server — no manual constructor calls",
        "<strong>No business logic in injectors</strong> — injectors are only for wire.Build"
      ]
    }
  ]
};
