/* questions ch08 (EN) */
(window.QUESTIONS_EN = window.QUESTIONS_EN || {}).ch08 = [
  {
    "id": "wire-ch08-q01",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "Does Wire have a global singleton registry that shares instances across injectors?",
    "options": [
      "Yes — Wire stores already-created instances in a global cache for reuse.",
      "Yes, but only when the wire.Singleton() annotation is used.",
      "Yes, but it must be enabled with wire.EnableGlobalScope().",
      "No — each injector builds its own independent dependency graph."
    ],
    "correctAnswerIndex": 3,
    "explanation": "Wire has no global runtime registry whatsoever. Wire is a pure code generator — each injector it produces is a plain Go function that calls constructors in sequence. Every time you invoke an injector, a fresh set of dependencies is created. <code>wire.Singleton()</code> and <code>wire.EnableGlobalScope()</code> do not exist in the Wire API."
  },
  {
    "id": "wire-ch08-q02",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "How many injector functions can a single wire.go file contain?",
    "options": [
      "Only one per wire.go file.",
      "At most two (one production and one test).",
      "More than one, but they must be in separate packages.",
      "More than one — there is no limit."
    ],
    "correctAnswerIndex": 3,
    "explanation": "Wire does not limit the number of injector functions in a single wire.go file. You can have <code>InitApp</code>, <code>InitTestApp</code>, <code>InitRequestScope</code>, and others all in the same file. Wire generates a separate implementation for each function in wire_gen.go."
  },
  {
    "id": "wire-ch08-q03",
    "difficulty": "easy",
    "bloomLevel": "understand",
    "question": "If both InitApp and InitTestApp list config.Load as a provider, how many Config instances exist after calling InitApp() and then InitTestApp()?",
    "options": [
      "One instance — Wire reuses the instance created by InitApp.",
      "It depends on whether config.Load returns a pointer or a value.",
      "Two separate instances — each injector call creates its own Config.",
      "It depends on which build tag is active."
    ],
    "correctAnswerIndex": 2,
    "explanation": "Because Wire has no global registry, each injector call builds a completely new dependency graph. Therefore <code>config.Load</code> is called twice independently, producing two separate Config instances. This is unaffected by pointer-vs-value or build tags."
  },
  {
    "id": "wire-ch08-q04",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "What is the correct way to make a request-scoped value such as *http.Request available to Wire?",
    "options": [
      "Use wire.RequestScope(new(*http.Request)).",
      "Call wire.InjectRequest() inside HTTP middleware.",
      "Register *http.Request as a global provider beforehand.",
      "Pass *http.Request as a parameter of the injector function."
    ],
    "correctAnswerIndex": 3,
    "explanation": "The correct approach is to pass <code>*http.Request</code> as a <strong>parameter of the injector function</strong>, for example <code>func InitRequestScope(db *sql.DB, r *http.Request) *UserHandler</code>. Wire treats parameters as values whose providers have already run. <code>wire.RequestScope</code>, global providers, and <code>wire.InjectRequest()</code> do not exist in Wire."
  },
  {
    "id": "wire-ch08-q05",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "Why should you not include repo.NewPostgresDB as a provider directly inside a per-request injector?",
    "options": [
      "Because Wire does not support database providers in per-request injectors.",
      "Because Wire will call sql.Open() on every HTTP request, creating a new connection pool each time.",
      "Because *sql.DB cannot be passed through function parameters in Go.",
      "Because per-request injectors must use only wire.Value()."
    ],
    "correctAnswerIndex": 1,
    "explanation": "If <code>repo.NewPostgresDB</code> is listed in a per-request injector, Wire will call <code>sql.Open()</code> on every incoming HTTP request, creating a new database connection pool each time. This is extremely costly, exhausts connections, and degrades performance. The correct approach is to create <code>*sql.DB</code> once in an app-level injector and pass it as a parameter."
  },
  {
    "id": "wire-ch08-q06",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "How does an injector function parameter differ from a provider?",
    "options": [
      "They are identical — parameters and providers behave in exactly the same way.",
      "A parameter is an already-built value supplied from outside; Wire needs no constructor for it. A provider is a function Wire calls to build a value.",
      "Parameters can only be used with primitive types; providers are for structs.",
      "A parameter is injected once for the lifetime of the app; a provider is called on every request."
    ],
    "correctAnswerIndex": 1,
    "explanation": "An injector <strong>parameter</strong> is a value the caller has already created and passes in. Wire treats it as though a provider returning that value already exists — no constructor is needed. A <strong>provider</strong> is a function Wire calls to construct a value. The claims about primitive-only parameters and per-request vs per-app behavior are incorrect."
  },
  {
    "id": "wire-ch08-q07",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "You need an injector that receives a userID string per request so UserService knows which user the request belongs to. Which injector signature should you use?",
    "code": "// Possible options:\n// A:\nfunc InitRequestScope(db *sql.DB, userID string) *UserHandler\n\n// B:\nfunc InitRequestScope(db *sql.DB) *UserHandler\n\n// C:\nfunc InitRequestScope() *UserHandler",
    "options": [
      "Option A — pass userID as an injector parameter so Wire can inject it into the graph.",
      "Option B — let UserService pull the userID from context itself.",
      "Option C — store userID in a global variable.",
      "Both A and B are correct; it depends on preference."
    ],
    "correctAnswerIndex": 0,
    "explanation": "Option A is most correct in the Wire context — passing <code>userID</code> as a parameter tells Wire to treat <code>string</code> as an available value in the graph, so any provider that needs a <code>string</code> (or its type alias) receives the userID directly. Option B is a valid alternative (context propagation) but works entirely outside Wire. Option C is an anti-pattern because it relies on global mutable state."
  },
  {
    "id": "wire-ch08-q08",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "Consider this code:\n\nfunc main() {\n    appA, cleanup, _ := InitApp(\"config.yaml\")\n    appB, cleanup2, _ := InitApp(\"config.yaml\")\n    defer cleanup()\n    defer cleanup2()\n    _ = appA\n    _ = appB\n}\n\nIf InitApp has config.Load and repo.NewPostgresDB as providers, what happens?",
    "code": "func main() {\n    appA, cleanup, _ := InitApp(\"config.yaml\")\n    appB, cleanup2, _ := InitApp(\"config.yaml\")\n    defer cleanup()\n    defer cleanup2()\n}",
    "options": [
      "appA and appB share the same *sql.DB pool because Wire handles singletons automatically.",
      "appB reuses the *sql.DB cached from appA because they use the same config path.",
      "A compile error occurs because you cannot call the same injector twice.",
      "appA and appB each have a separate *sql.DB pool because each InitApp call builds a new graph."
    ],
    "correctAnswerIndex": 3,
    "explanation": "Wire has no singleton registry, so calling <code>InitApp</code> twice invokes <code>config.Load</code> twice and <code>repo.NewPostgresDB</code> twice, yielding two independent <code>*sql.DB</code> pools. There is no caching or sharing. Calling an injector multiple times is valid Go and Wire, but you must be aware of the resources being recreated each time."
  },
  {
    "id": "wire-ch08-q09",
    "difficulty": "medium",
    "bloomLevel": "analyze",
    "question": "Which statement correctly describes the trade-off between a per-request injector and context propagation?",
    "options": [
      "Per-request injectors are always faster because they avoid context lookups.",
      "Per-request injectors make dependencies explicit in the type system but allocate structs per request; context propagation is idiomatic Go but hides key-value pairs in an untyped bag.",
      "Context propagation is always safer because the Go compiler validates context keys.",
      "Both approaches have identical performance and clarity."
    ],
    "correctAnswerIndex": 1,
    "explanation": "Per-request injectors surface dependencies as explicit function-parameter types — the compiler can verify them — but they allocate new structs per request (minor overhead). Context propagation is an idiomatic Go pattern that avoids extra allocations, but <code>context.Context</code> is an untyped bag of values and the compiler cannot verify that the right keys or types are used. Both approaches have distinct trade-offs; neither is universally better."
  },
  {
    "id": "wire-ch08-q10",
    "difficulty": "medium",
    "bloomLevel": "analyze",
    "question": "You want a test injector to use a mock UserRepo instead of the production one. UserService depends on the UserRepository interface. Which approach is correct?",
    "code": "type UserRepository interface {\n    FindByID(id string) (*User, error)\n}\ntype postgresUserRepo struct{ db *sql.DB }\ntype mockUserRepo struct{}\n\nfunc (m *mockUserRepo) FindByID(id string) (*User, error) { return &User{}, nil }",
    "options": [
      "Add mockUserRepo as a provider directly, without wire.Bind.",
      "Add NewMockUserRepo as a provider and include wire.Bind(new(UserRepository), new(*mockUserRepo)) in the test injector.",
      "Modify UserService to accept *mockUserRepo directly instead of the UserRepository interface.",
      "Use wire.Override(new(UserRepository), new(*mockUserRepo)) in the test injector."
    ],
    "correctAnswerIndex": 1,
    "explanation": "Wire matches types by the return type of a provider. Because UserService requires <code>UserRepository</code> (an interface), you must pair the <code>*mockUserRepo</code> provider with <code>wire.Bind(new(UserRepository), new(*mockUserRepo))</code> to tell Wire which concrete type satisfies that interface. Adding a provider alone without <code>wire.Bind</code> leaves Wire unable to find a <code>UserRepository</code>. <code>wire.Override()</code> does not exist in the Wire API."
  },
  {
    "id": "wire-ch08-q11",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "You want providers in a per-request injector to receive the context.Context from *http.Request. Which approach is correct in Wire?",
    "code": "// Possible options:\n\n// A: a separate provider function\nfunc requestContext(r *http.Request) context.Context { return r.Context() }\n\nfunc InitRequestScope(r *http.Request) *UserHandler {\n    wire.Build(\n        repo.NewUserRepo,\n        service.NewUserService,\n        NewUserHandler,\n        requestContext, // provider: *http.Request -> context.Context\n    )\n    return nil\n}\n\n// B: wire.Value(r.Context()) inside wire.Build\nfunc InitRequestScopeB(r *http.Request) *UserHandler {\n    wire.Build(\n        repo.NewUserRepo,\n        service.NewUserService,\n        NewUserHandler,\n        wire.Value(r.Context()),\n    )\n    return nil\n}",
    "options": [
      "Option A — use a provider function that takes *http.Request and returns context.Context.",
      "Option B — use wire.Value(r.Context()) to inject context.Context directly.",
      "Both A and B are equally correct.",
      "Neither is correct; context.Context must be passed as a direct injector parameter."
    ],
    "correctAnswerIndex": 0,
    "explanation": "Option A is correct — use a <strong>provider function</strong> <code>requestContext</code> that accepts <code>*http.Request</code> and returns <code>context.Context</code>. Wire calls <code>requestContext(r)</code> to satisfy any provider that needs <code>context.Context</code>. Option B is wrong: <code>wire.Value()</code> rejects <strong>function-call expressions</strong> (<code>r.Context()</code>) as arguments because Wire must be able to copy the expression into a package-level var. Additionally, <code>context.Context</code> is an interface type, which <code>wire.Value()</code> does not support directly (you would need <code>wire.InterfaceValue()</code>). Option D is also a valid alternative but requires the caller to invoke <code>r.Context()</code> themselves."
  },
  {
    "id": "wire-ch08-q12",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "Consider this code — what is the problem?",
    "code": "// wire.go\n//go:build wireinject\n\n// Per-request injector\nfunc InitRequestScope(r *http.Request) *UserHandler {\n    wire.Build(\n        config.Load,          // func(path string) (Config, error)\n        repo.NewPostgresDB,   // func(Config) (*sql.DB, func(), error)\n        repo.NewUserRepo,\n        service.NewUserService,\n        NewUserHandler,\n    )\n    return nil\n}",
    "options": [
      "A wire.Bind for the UserRepository interface is missing.",
      "Wire does not support injectors that take *http.Request as a parameter.",
      "There is no problem — this code is correct and efficient.",
      "config.Load and repo.NewPostgresDB are inside the per-request injector, causing a new Config and DB pool to be created on every HTTP request."
    ],
    "correctAnswerIndex": 3,
    "explanation": "The critical problem is that <code>config.Load</code> and <code>repo.NewPostgresDB</code> live inside the per-request injector, which means every HTTP request will: (1) re-read the config file, and (2) call <code>sql.Open()</code> to create a new connection pool. This is a performance disaster. These should live in an app-level injector, with <code>*sql.DB</code> passed as a parameter to the request injector."
  },
  {
    "id": "wire-ch08-q13",
    "difficulty": "hard",
    "bloomLevel": "evaluate",
    "question": "A team needs an architecture where each HTTP handler has a logger that embeds a request ID (created fresh per request), while the DB pool is shared. Which architecture does Wire support correctly?",
    "options": [
      "Use a single injector for everything and apply wire.Singleton() to the DB.",
      "Build an app-level injector that returns *sql.DB with a cleanup function; build a per-request injector that accepts *sql.DB and a requestID string as parameters, then constructs the request-scoped logger internally.",
      "Store *sql.DB in a global variable and use wire.Value() to inject the request ID.",
      "Wire does not support this pattern; use Uber fx instead."
    ],
    "correctAnswerIndex": 1,
    "explanation": "The correct approach is to split into two injectors: (1) <strong>App-level</strong> creates <code>*sql.DB</code> once. (2) <strong>Per-request</strong> accepts <code>*sql.DB</code> and <code>requestID string</code> as parameters, then builds a request-scoped logger embedding the requestID within the graph. <code>wire.Singleton()</code> does not exist in Wire. Global variables are an anti-pattern. Wire supports this pattern natively."
  },
  {
    "id": "wire-ch08-q14",
    "difficulty": "hard",
    "bloomLevel": "evaluate",
    "question": "A developer claims: \"Using per-request injectors slows the app down significantly because new structs are allocated every request.\" Which response best evaluates this claim?",
    "options": [
      "Completely correct — per-request injectors should always be avoided.",
      "Wrong — Wire automatically optimizes struct creation with object pooling.",
      "Wrong — per-request injectors allocate nothing because Wire uses a cache.",
      "Partially correct — allocating structs has a small overhead, but if heavy singletons are passed as parameters rather than recreated, the overhead is negligible and not a bottleneck for most applications."
    ],
    "correctAnswerIndex": 3,
    "explanation": "Allocating structs in Go does carry a small overhead, but if the design is correct — passing already-initialized <code>*sql.DB</code>, HTTP clients, and loggers as parameters instead of recreating them in the per-request injector — the only cost is allocating small structs, which the Go GC handles efficiently. This is not a bottleneck for most applications. Wire has no built-in object pooling or caching."
  },
  {
    "id": "wire-ch08-q15",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "Consider these two injectors — how do their dependency graphs differ?",
    "code": "// Injector A\nfunc InitAppA() (*App, func(), error) {\n    wire.Build(config.Load, repo.NewDB, repo.NewUserRepo, service.NewUserService, NewApp)\n    return nil, nil, nil\n}\n\n// Injector B — receives *sql.DB as a parameter\nfunc InitAppB(db *sql.DB) (*App, error) {\n    wire.Build(repo.NewUserRepo, service.NewUserService, NewApp)\n    return nil, nil\n}",
    "options": [
      "They are identical — Wire generates code with exactly the same outcome.",
      "InitAppA builds *sql.DB inside the graph with a cleanup function; InitAppB accepts an externally-created *sql.DB — the caller is responsible for managing the DB lifecycle.",
      "InitAppB is faster because Wire reuses the DB pool from InitAppA automatically.",
      "InitAppA has a problem because Wire does not support cleanup functions in injectors."
    ],
    "correctAnswerIndex": 1,
    "explanation": "<strong>InitAppA</strong> lets Wire own <code>*sql.DB</code> construction via <code>repo.NewDB</code>, which likely returns a cleanup function that Wire wires up automatically. <strong>InitAppB</strong> receives <code>*sql.DB</code> from outside — the caller must create and manage the DB lifecycle. This makes InitAppB more flexible (DB can be shared) but the injector itself carries no DB cleanup. Wire fully supports cleanup functions in injectors."
  },
  {
    "id": "wire-ch08-q16",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "You want to test an HTTP handler using an in-memory repository instead of PostgreSQL without touching production code. What should you do?",
    "options": [
      "Modify the production injector to check an environment variable and select the implementation.",
      "Create a separate test injector that uses wire.Bind to swap in the in-memory mock implementation.",
      "Use wire.Override() in the test file to override the production provider.",
      "Create a wire_test.go file with the wireinject build tag and override through a global variable."
    ],
    "correctAnswerIndex": 1,
    "explanation": "The correct Wire approach is to create a <strong>separate test injector</strong> in the same wire.go file — for example <code>InitTestApp(t *testing.T) (*App, func())</code> — that uses mock providers and a different <code>wire.Bind</code>, without touching production code at all. <code>wire.Override()</code> does not exist in Wire. Modifying production providers to check env vars is an anti-pattern."
  },
  {
    "id": "wire-ch08-q17",
    "difficulty": "hard",
    "bloomLevel": "evaluate",
    "question": "Suppose a service handles very high traffic (10,000 req/s) and uses a per-request injector that builds a fresh handler on every request. A developer proposes moving the handler to an app-level injector built once at startup. Should you do this, and why?",
    "options": [
      "Yes — always move handlers to app-level because per-request injectors cannot handle high throughput.",
      "No — Wire mandates per-request injectors at all times.",
      "It depends on whether the handler has request-scoped state. If the handler is stateless and needs no request-specific values, move it to app-level; if it has request-scoped state, per-request is required.",
      "Yes — Wire performs automatic caching anyway, but you need the wire.Cache() annotation."
    ],
    "correctAnswerIndex": 2,
    "explanation": "The answer depends on <strong>stateful vs stateless</strong>. If the handler holds no request-scoped state (no request ID, no per-request logger, no user context), it can safely be moved to app-level, saving per-request allocations. But if the handler requires request-specific values such as <code>requestID</code> or a request-scoped logger, a per-request injector is necessary to supply those values. <code>wire.Cache()</code> does not exist in Wire."
  },
  {
    "id": "wire-ch08-q18",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "What is wrong with this code?",
    "code": "//go:build wireinject\n\npackage main\n\nvar sharedDB *sql.DB\n\nfunc InitApp(cfgPath string) (*App, func(), error) {\n    wire.Build(\n        config.Load,\n        repo.NewPostgresDB, // stores result in sharedDB inside provider\n        repo.NewUserRepo,\n        service.NewUserService,\n        NewApp,\n    )\n    return nil, nil, nil\n}\n\nfunc InitRequestScope(r *http.Request) *UserHandler {\n    wire.Build(\n        wire.Value(sharedDB), // uses global var instead of parameter\n        repo.NewUserRepo,\n        service.NewUserService,\n        NewUserHandler,\n    )\n    return nil\n}",
    "options": [
      "Nothing — this is the correct way to share a DB across injectors.",
      "wire.Value(sharedDB) evaluates sharedDB at Wire codegen time, not at runtime, so it is always nil; the *sql.DB should be passed as a parameter instead.",
      "The problem is that Wire does not support wire.Value() in per-request injectors.",
      "The problem is that a global variable increases binary size."
    ],
    "correctAnswerIndex": 1,
    "explanation": "<code>wire.Value(sharedDB)</code> in the wire.go stub causes Wire to copy the expression <code>sharedDB</code> into a <strong>package-level var</strong> in wire_gen.go — for example <code>var _wireSqlDBValue = sharedDB</code>. This is evaluated at <strong>package initialization</strong> time, when <code>sharedDB</code> is still <code>nil</code> (its zero value) because <code>InitApp</code> has not been called yet. As a result, <code>InitRequestScope</code> always receives <code>nil</code>. On top of that, global mutable variables are an anti-pattern that makes testing hard. The correct fix is to pass <code>*sql.DB</code> as a <strong>parameter</strong> of <code>InitRequestScope</code> directly."
  },
  {
    "id": "wire-ch08-q19",
    "difficulty": "easy",
    "bloomLevel": "understand",
    "question": "Which statement best describes per-request scoping in Wire?",
    "options": [
      "Per-request scoping is achieved by calling the injector function anew for each request and passing request-scoped values as arguments.",
      "Wire provides a @RequestScope annotation that handles scoping automatically, just like Spring.",
      "You must use wire.RequestScoped(new(T)) to mark a type as request-scoped.",
      "Wire spawns a new goroutine per request and scopes all dependencies to that goroutine."
    ],
    "correctAnswerIndex": 0,
    "explanation": "Per-request scoping in Wire is achieved by <strong>design, not annotations</strong> — call the injector function fresh on every request, passing request-scoped values (such as <code>*http.Request</code> or a <code>requestID</code>) as parameters. Wire rebuilds every dependency in the graph for each call. <code>@RequestScope</code>, <code>wire.RequestScoped()</code>, and goroutine scoping do not exist in Wire."
  },
  {
    "id": "wire-ch08-q20",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "You want a test injector that accepts *testing.T so providers can register cleanup via t.Cleanup(). Which injector signature should you use?",
    "code": "// Goal: create an in-memory repo and register cleanup via t.Cleanup()\nfunc NewInMemoryRepo(t *testing.T) *InMemoryUserRepo {\n    repo := &InMemoryUserRepo{}\n    t.Cleanup(func() { repo.Reset() })\n    return repo\n}",
    "options": [
      "func InitTestApp() (*App, func())",
      "func InitTestApp(t testing.T) (*App, func())",
      "func InitTestApp(t *testing.T) (*App, func())",
      "func InitTestApp() *App"
    ],
    "correctAnswerIndex": 2,
    "explanation": "Use <code>func InitTestApp(t *testing.T) (*App, func())</code> because: (1) <code>*testing.T</code> is a pointer, which is the idiomatic Go convention. (2) Passing <code>*testing.T</code> as a parameter makes Wire aware of the type, so providers such as <code>NewInMemoryRepo</code> that require <code>*testing.T</code> work correctly. (3) Returning a <code>func()</code> cleanup allows Wire-managed resources to be released. Using <code>testing.T</code> without a pointer is incorrect — it is a value type that must not be copied."
  }
];
