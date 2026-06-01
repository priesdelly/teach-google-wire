/* questions ch09 (EN) */
(window.QUESTIONS_EN = window.QUESTIONS_EN || {}).ch09 = [
  {
    "id": "wire-ch09-q01",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "When Wire injects *http.Server through an injector, what should the injector return as its root type?",
    "options": [
      "*http.Server fully assembled with its handler and config",
      "*http.ServeMux, which Wire will automatically wrap into *http.Server",
      "http.Handler interface, because Wire can convert it into a server",
      "A string address, because http.ListenAndServe accepts a string"
    ],
    "correctAnswerIndex": 0,
    "explanation": "The injector return type is what Wire must build to — it should return a <b>*http.Server</b> that is ready to serve, with its handler and config fully wired. Wire does not automatically convert types, so returning a ServeMux or an interface is incorrect."
  },
  {
    "id": "wire-ch09-q02",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "In a provider for *grpc.Server, where should grpc.GracefulStop() be called?",
    "options": [
      "Directly inside the provider function after grpc.NewServer()",
      "In main() before defer cleanup()",
      "Inside the cleanup function returned from the provider",
      "Nowhere — Wire handles server shutdown automatically"
    ],
    "correctAnswerIndex": 2,
    "explanation": "You should return a <b>cleanup func</b> that calls <code>srv.GracefulStop()</code> from the provider — Wire collects it into the cleanup chain, and the caller invokes it via <code>defer cleanup()</code> in main(). Calling GracefulStop directly inside the provider would shut down the server before it ever serves any requests."
  },
  {
    "id": "wire-ch09-q03",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "According to best practice, where should a provider set be declared?",
    "options": [
      "Always in the same package as the injector stub (wire.go)",
      "In the same package as the providers for that layer",
      "In the main package so everything can access it",
      "In a global variable inside Google's wire package"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Provider sets should be declared <b>in the same package as their providers</b> — for example, <code>repo.Set</code> lives in <code>internal/repo</code>, <code>service.Set</code> lives in <code>internal/service</code>, and so on. This keeps each set co-located with the code it describes and makes it easy to maintain."
  },
  {
    "id": "wire-ch09-q04",
    "difficulty": "easy",
    "bloomLevel": "understand",
    "question": "Why should provider sets be split by layer (config, repo, service, handler) rather than keeping everything in one set?",
    "options": [
      "So that subsets can be reused in other injectors — for example, a test injector can use repo.Set and service.Set but swap out handler.Set",
      "Because Wire limits each set to a maximum of 10 providers",
      "Because Wire does not support sets that contain providers from multiple packages",
      "So that wire_gen.go is automatically split into multiple files"
    ],
    "correctAnswerIndex": 0,
    "explanation": "Splitting sets by layer enables <b>reuse</b> — a test injector might share <code>repo.Set</code> and <code>service.Set</code> with the production injector but replace <code>handler.Set</code> with a mock set. With a single all-in-one set that reuse becomes very difficult."
  },
  {
    "id": "wire-ch09-q05",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "Given this code:\n\nfunc NewHTTPServer(mux *http.ServeMux, cfg Config) (*http.Server, func()) {\n    srv := &http.Server{Addr: cfg.Addr, Handler: mux}\n    cleanup := func() { srv.Shutdown(context.Background()) }\n    return srv, cleanup\n}\n\nWhy should the cleanup use a context with a timeout instead of context.Background()?",
    "code": "func NewHTTPServer(mux *http.ServeMux, cfg Config) (*http.Server, func()) {\n    srv := &http.Server{Addr: cfg.Addr, Handler: mux}\n    cleanup := func() { srv.Shutdown(context.Background()) }\n    return srv, cleanup\n}",
    "options": [
      "context.Background() prevents Shutdown from working; context.TODO() must be used instead",
      "Wire requires the cleanup to use an already-cancelled context",
      "There is no problem — context.Background() is fine because Shutdown has its own internal timeout",
      "context.Background() has no deadline, so Shutdown may wait indefinitely for long-running requests — context.WithTimeout should be used to bound the graceful shutdown window"
    ],
    "correctAnswerIndex": 3,
    "explanation": "<code>context.Background()</code> has no deadline, which means <code>srv.Shutdown</code> can wait indefinitely if there are long-running requests. Use <b>context.WithTimeout</b> (e.g., 5 seconds) to enforce a maximum graceful shutdown duration."
  },
  {
    "id": "wire-ch09-q06",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "Consider this code:\n\nfunc InitApp(cfgPath string) (*http.Server, func(), error) {\n    cfg, _ := config.Load(cfgPath)\n    wire.Build(repo.Set, service.Set, handler.Set)\n    return nil, nil, nil\n}\n\nWhat is wrong with it?",
    "code": "//go:build wireinject\n\nfunc InitApp(cfgPath string) (*http.Server, func(), error) {\n    cfg, _ := config.Load(cfgPath)\n    wire.Build(repo.Set, service.Set, handler.Set)\n    return nil, nil, nil\n}",
    "options": [
      "There is logic outside wire.Build that Wire will ignore, so cfg is never injected into the dependency graph",
      "config.Set is missing from wire.Build",
      "An injector cannot return an error; the error return must be removed",
      "wire.Value(cfg) should be used instead of wire.Build"
    ],
    "correctAnswerIndex": 0,
    "explanation": "Wire only reads the <code>wire.Build(...)</code> call in the injector body — <b>all other logic is silently ignored</b>, including <code>cfg, _ := config.Load(cfgPath)</code>. The variable <code>cfg</code> never enters the dependency graph. The correct approach is to either pass <code>config.Config</code> as an injector parameter or include <code>config.Set</code> in wire.Build."
  },
  {
    "id": "wire-ch09-q07",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "You want *grpc.Server to have a UnaryInterceptor for logging. What is the best way to write the provider?",
    "options": [
      "Write the interceptor inline inside NewGRPCServer and hardcode it in the grpc.ServerOption slice",
      "Add the interceptor after grpc.NewServer() using srv.AddInterceptor()",
      "Store the interceptor in the Config struct as interface{} and type-assert it inside the provider",
      "Create a separate provider func NewLoggingInterceptor(...) grpc.UnaryServerInterceptor and pass it into NewGRPCServer as a parameter"
    ],
    "correctAnswerIndex": 3,
    "explanation": "Create a <b>dedicated provider</b> for the interceptor and inject it into the server provider as a dependency — this makes the interceptor logic independently testable and replaceable. Hardcoding the interceptor in NewGRPCServer makes it hard to swap in tests; <code>grpc.Server</code> has no <code>AddInterceptor</code> method."
  },
  {
    "id": "wire-ch09-q08",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "How do you wire an HTTP middleware that requires *slog.Logger?",
    "code": "func NewLoggingMiddleware(logger *slog.Logger) func(http.Handler) http.Handler {\n    return func(next http.Handler) http.Handler {\n        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {\n            next.ServeHTTP(w, r)\n        })\n    }\n}",
    "options": [
      "wire.Value() must be used to pass the logger into the middleware because it is not a struct pointer",
      "Add NewLoggingMiddleware and a provider for *slog.Logger to wire.Build or a set — Wire will inject the logger automatically",
      "Create a global logger and use closure capture instead of a parameter",
      "Wire does not support providers that return a function type, so a struct wrapper must be created"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Wire uses the <b>return type as a key</b>, so <code>func(http.Handler) http.Handler</code> is a perfectly valid key. If you add <code>NewLoggingMiddleware</code> and a provider for <code>*slog.Logger</code> to wire.Build, Wire will inject the logger into the middleware automatically. No wire.Value or global variable is needed."
  },
  {
    "id": "wire-ch09-q09",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "Which injector is correct for an app that loads its config before calling Wire?",
    "code": "// Option A\nfunc InitApp(cfgPath string) (*http.Server, func(), error) {\n    wire.Build(config.Set, repo.Set, service.Set, handler.Set)\n    return nil, nil, nil\n}\n\n// Option B\nfunc InitApp(cfg config.Config) (*http.Server, func(), error) {\n    wire.Build(repo.Set, service.Set, handler.Set)\n    return nil, nil, nil\n}",
    "options": [
      "Option A only, because Wire must be responsible for loading config",
      "Both are wrong — config must always use wire.Value()",
      "Both are correct — A lets Wire load config through a provider; B loads config first and passes it in as an injector argument",
      "Option B only, because config.Config is injected as a parameter and needs no provider"
    ],
    "correctAnswerIndex": 2,
    "explanation": "<b>Both approaches are valid</b> but suit different situations — A is appropriate when you want Wire to manage config loading; B is appropriate when you load config and parse flags in main() first and then pass the result into the injector. An injector parameter is a pre-provided value that Wire does not need to find a provider for."
  },
  {
    "id": "wire-ch09-q10",
    "difficulty": "medium",
    "bloomLevel": "analyze",
    "question": "What is the problem with the *http.ServeMux provider below?\n\nfunc NewServeMux(u *UserHandler, cfg Config) *http.ServeMux {\n    if cfg.Debug {\n        log.Println(\"debug mode on\")\n    }\n    mux := http.NewServeMux()\n    mux.HandleFunc(\"/users\", u.List)\n    mux.HandleFunc(\"/debug\", debugHandler) // hardcoded global\n    return mux\n}",
    "code": "func NewServeMux(u *UserHandler, cfg Config) *http.ServeMux {\n    if cfg.Debug {\n        log.Println(\"debug mode on\")\n    }\n    mux := http.NewServeMux()\n    mux.HandleFunc(\"/users\", u.List)\n    mux.HandleFunc(\"/debug\", debugHandler) // hardcoded global\n    return mux\n}",
    "options": [
      "debugHandler is a hardcoded global function inside the provider, making it hard to replace in tests; also, the if cfg.Debug branch belongs in the caller, not the provider",
      "The provider should not accept Config as a parameter; wire.Value must be used instead",
      "http.ServeMux is not a pointer type and therefore cannot be a provider return type",
      "There is no problem; this is the correct pattern"
    ],
    "correctAnswerIndex": 0,
    "explanation": "<b>debugHandler is a hardcoded global function</b> inside the provider, so tests cannot swap it easily. It should be injected as a dependency instead. Additionally, behavior that varies based on config (like the if cfg.Debug branch) makes the provider harder to test — consider injecting that decision rather than branching on it inside the provider."
  },
  {
    "id": "wire-ch09-q11",
    "difficulty": "medium",
    "bloomLevel": "analyze",
    "question": "How can a circular dependency arise between a server provider and a handler provider, and how should it be fixed?",
    "options": [
      "It cannot happen in Wire because Wire detects and resolves cycles automatically",
      "It always occurs when server imports handler; fix it by moving handler into the same package as server",
      "It occurs when wire.Bind is used, causing Wire to create a loop in the dependency graph",
      "It can arise when a handler needs the server address to build a redirect URL; fix it by injecting Config directly into the handler instead of *http.Server"
    ],
    "correctAnswerIndex": 3,
    "explanation": "A common example: <code>UserHandler</code> needs <code>*http.Server</code> to read its Addr for constructing URLs, but <code>*http.Server</code> needs <code>*UserHandler</code> to register routes — a circular dependency. The fix is to <b>inject Config directly into the Handler</b> instead of letting the Handler know about the Server. Wire will detect the cycle and report an error."
  },
  {
    "id": "wire-ch09-q12",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "A team wants an HTTP server and a gRPC server to share a single *service.UserService instance. How should the injector be designed?",
    "options": [
      "Use wire.Value() to pass a pre-created *service.UserService into both injectors",
      "Create two separate injectors, each including service.Set — Wire will create two separate UserService instances, which is acceptable",
      "Create a single injector that returns a struct holding both the HTTP server and the gRPC server, so Wire creates one UserService and shares it with both",
      "Use sync.Once in the UserService provider to guarantee a singleton"
    ],
    "correctAnswerIndex": 2,
    "explanation": "Within a single injector, Wire creates <code>*service.UserService</code> <b>exactly once</b> and passes it to every consumer that needs it — that is singleton behavior scoped to the injector. Using two separate injectors would produce two independent UserService instances, which is likely not what the team wants."
  },
  {
    "id": "wire-ch09-q13",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "A developer tries to inject *http.Request into UserService through a Wire injector that is called at app startup. What will happen?",
    "code": "// wire.go\nfunc InitApp() (*http.Server, func(), error) {\n    wire.Build(\n        repo.Set,\n        NewUserServiceWithRequest, // accepts *http.Request\n        handler.Set,\n    )\n    return nil, nil, nil\n}",
    "options": [
      "Wire will automatically create an empty *http.Request and inject it into UserService",
      "Wire will inject nil for *http.Request without any error",
      "Wire will create a new UserService instance for every incoming request",
      "Wire will error because there is no provider for *http.Request and the injector does not accept *http.Request as a parameter"
    ],
    "correctAnswerIndex": 3,
    "explanation": "Wire will <b>error stating there is no provider for *http.Request</b> because nothing in the graph creates one. This is a critical pitfall — Wire runs <strong>once at startup</strong>, not per request. For request-scoped values, pass them via context or as function arguments inside the handler, not through Wire."
  },
  {
    "id": "wire-ch09-q14",
    "difficulty": "hard",
    "bloomLevel": "evaluate",
    "question": "Compare two approaches:\n\nApproach A: Create a new injector for every request to get a fresh UserHandler\nApproach B: Create UserHandler once at startup and pass *http.Request through method parameters\n\nWhich approach is better and why?",
    "options": [
      "Approach A is always better because it provides stronger per-request isolation",
      "Both approaches are identical; either one works",
      "Approach B is better because the handler is a stateless singleton created once, and request-scoped data is passed through method parameters as normal",
      "Approach A is incorrect because Wire does not support calling an injector multiple times"
    ],
    "correctAnswerIndex": 2,
    "explanation": "<b>Approach B is correct</b> — HTTP handlers should be stateless and created once. Request-scoped data such as the body, headers, and user ID are passed through <code>func ServeHTTP(w http.ResponseWriter, r *http.Request)</code> as normal. Approach A (an injector per request) carries unnecessary overhead and is not needed."
  },
  {
    "id": "wire-ch09-q15",
    "difficulty": "hard",
    "bloomLevel": "evaluate",
    "question": "A project has a production injector and a test injector that share service.Set, but the test injector uses a mock repo instead. What problem occurs if both repo.Set and the mock repo provider are included in the test injector's wire.Build?",
    "code": "// test injector (incorrect)\nfunc InitTestApp(t *testing.T) (*http.Server, func()) {\n    wire.Build(\n        repo.Set,           // has NewUserRepo\n        NewMockUserRepo,    // also has NewUserRepo?\n        service.Set,\n        handler.Set,\n    )\n    return nil, nil\n}",
    "options": [
      "Wire will merge both providers into a multi-value",
      "Wire will always use NewMockUserRepo because it appears after repo.Set",
      "No problem — Wire automatically picks the newer provider",
      "Wire will error with a duplicate provider for the same type, e.g. *repo.UserRepo"
    ],
    "correctAnswerIndex": 3,
    "explanation": "Wire does not allow <b>duplicate providers for the same type</b>. If <code>repo.Set</code> contains <code>NewUserRepo</code> returning <code>*repo.UserRepo</code> and <code>NewMockUserRepo</code> also returns <code>*repo.UserRepo</code>, Wire will report an error. The correct approach is to create a separate test set that does not include <code>repo.Set</code> and uses the mock exclusively."
  },
  {
    "id": "wire-ch09-q16",
    "difficulty": "hard",
    "bloomLevel": "evaluate",
    "question": "Wire runs cleanup in LIFO order. Assuming providers are created in this order: DB → UserRepo → UserService → HTTPServer, what is the correct cleanup order?",
    "options": [
      "DB → UserRepo → UserService → HTTPServer (FIFO — created first, cleaned up first)",
      "Random order determined by the garbage collector",
      "All cleanups run concurrently in parallel",
      "HTTPServer → UserService → UserRepo → DB (LIFO — created last, cleaned up first)"
    ],
    "correctAnswerIndex": 3,
    "explanation": "Wire uses <b>LIFO (Last In, First Out)</b> for cleanup — resources created last are cleaned up first. HTTPServer is shut down first, then UserService, then UserRepo, and finally DB (Close) last, because DB is the foundational resource that everything else depends on."
  },
  {
    "id": "wire-ch09-q17",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "You need to inject multiple grpc.ServerOption values into NewGRPCServer. What is the recommended approach with Wire?",
    "options": [
      "Wire does not support variadic arguments, so all options must be hardcoded inside the provider",
      "Create a struct such as GRPCOptions that holds the options, provide it with its own provider, and have NewGRPCServer accept GRPCOptions",
      "Use wire.Value([]grpc.ServerOption{...}) to pass the slice directly",
      "Create a separate provider for each individual grpc.ServerOption and list all of them in wire.Build"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Wire cannot inject a variadic <code>...grpc.ServerOption</code> directly. The clean solution is to <b>create a struct</b> such as <code>GRPCOptions</code> that bundles the options and provide it with its own provider. <code>NewGRPCServer</code> then accepts <code>GRPCOptions</code> and unpacks it internally. This makes the options easy to inject and test."
  },
  {
    "id": "wire-ch09-q18",
    "difficulty": "hard",
    "bloomLevel": "evaluate",
    "question": "What is wrong with the main() below?\n\nfunc main() {\n    srv, cleanup, err := InitApp(\"config.yaml\")\n    defer cleanup()\n    if err != nil {\n        log.Fatal(err)\n    }\n    srv.ListenAndServe()\n}",
    "code": "func main() {\n    srv, cleanup, err := InitApp(\"config.yaml\")\n    defer cleanup()\n    if err != nil {\n        log.Fatal(err)\n    }\n    srv.ListenAndServe()\n}",
    "options": [
      "Nothing is wrong — defer cleanup() comes before the error check so it always runs",
      "defer cleanup() must come after the error check, because if err != nil the cleanup func may panic since not all resources were successfully created",
      "cleanup() should be called directly instead of with defer so it runs immediately",
      "InitApp should not return an error; log.Fatal should live inside the provider instead"
    ],
    "correctAnswerIndex": 1,
    "explanation": "<b>defer cleanup() must always come after the error check.</b> If <code>InitApp</code> returns an error, initialization failed partway through — Wire guarantees cleanups for resources that were successfully created before the error, but calling the returned cleanup func before checking the error can lead to panics or incorrect behavior. The correct pattern is: <code>if err != nil { log.Fatal(err) }; defer cleanup()</code>"
  },
  {
    "id": "wire-ch09-q19",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "You want NewServeMux to register handlers from multiple handler structs (UserHandler, OrderHandler, ProductHandler). What is the best provider signature?",
    "options": [
      "func NewServeMux(handlers []http.Handler) *http.ServeMux using wire.Value to pass the slice",
      "func NewServeMux() *http.ServeMux with each handler registering itself directly",
      "There should be no NewServeMux; register routes in main() instead",
      "func NewServeMux(u *UserHandler, o *OrderHandler, p *ProductHandler) *http.ServeMux"
    ],
    "correctAnswerIndex": 3,
    "explanation": "<b>Accepting each handler struct as a separate parameter</b> is the approach Wire supports best. Wire will inject each handler by type, keeping dependencies explicit. Wire does not natively support slice injection without special handling, and letting handlers self-register requires a global mux."
  },
  {
    "id": "wire-ch09-q20",
    "difficulty": "hard",
    "bloomLevel": "evaluate",
    "question": "A project needs to run an HTTP server and a gRPC server concurrently in main(), and both must share the same *service.UserService instance. Which Wire approach is correct?",
    "options": [
      "Create two separate injectors, InitHTTPApp and InitGRPCApp, each with their own service.Set",
      "Create a struct such as App with both HTTPServer and GRPCServer as fields, then have a single injector return *App — Wire creates one UserService and shares it with both",
      "Use sync.Once in the UserService provider to guarantee a singleton across injectors",
      "Create *service.UserService manually in main() first and pass it into both injectors as a parameter"
    ],
    "correctAnswerIndex": 1,
    "explanation": "The best approach is to <b>create an App struct that holds both servers and use a single injector</b> — within one injector, Wire creates <code>*service.UserService</code> exactly once and provides it to every consumer, guaranteeing sharing automatically. Two separate injectors would produce two separate UserService instances, and sync.Once is an unnecessary workaround."
  }
];
