/* questions ch10 (EN) */
(window.QUESTIONS_EN = window.QUESTIONS_EN || {}).ch10 = [
  {
    "id": "wire-ch10-q01",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "In the Capstone project, what is the correct dependency flow order?",
    "options": [
      "Handler → Service → Repository → DB → Config",
      "Config → DB → Repository → Service → Handler → http.Server",
      "http.Server → Handler → Service → Config → DB",
      "DB → Config → Repository → Handler → Service"
    ],
    "correctAnswerIndex": 1,
    "explanation": "The correct dependency flow order is <b>Config → DB → Repository → Service → Handler → http.Server</b>. Each layer depends on the one before it: Config must be created first because everything else needs its values, DB needs the DSN from Config, Repository needs DB, and so on."
  },
  {
    "id": "wire-ch10-q02",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "In the Capstone project structure, what should each layer's set.go file declare?",
    "options": [
      "A wire.Build that combines providers from all layers",
      "An injector function for that layer",
      "A wire.NewSet grouping the layer's own providers and wire.Bind calls",
      "A //go:build wireinject build tag for that layer"
    ],
    "correctAnswerIndex": 2,
    "explanation": "Each layer should have a set.go that declares a <b>wire.NewSet</b> grouping its own providers and wire.Bind calls — for example, RepositorySet = wire.NewSet(NewPostgresTaskRepo, wire.Bind(new(TaskRepository), new(*postgresTaskRepo))). This keeps the injector in wire.go short and allows sets to be reused across multiple injectors."
  },
  {
    "id": "wire-ch10-q03",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "How should wire_gen.go be managed in version control?",
    "options": [
      "Commit it to VCS but never edit it by hand",
      "Add it to .gitignore because generated files should not be committed",
      "Commit it to VCS and edit it directly when necessary",
      "Always delete it after building because it can be regenerated from wire.go"
    ],
    "correctAnswerIndex": 0,
    "explanation": "<b>wire_gen.go should be committed to VCS</b> so the team can build the project without running the wire tool every time. However, it must never be edited by hand because it will be overwritten the next time wire is run; any changes should be made to the provider functions or wire.go, then wire should be run again."
  },
  {
    "id": "wire-ch10-q04",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "Why must the NewDB provider return a cleanup func() instead of using defer db.Close() inside the provider itself?",
    "options": [
      "Because Wire does not support defer statements inside provider functions",
      "Because returning func() is just a style preference — both approaches have the same effect",
      "Because db.Close is a method rather than a function, so it must always be wrapped in a closure",
      "Because defer inside a provider fires when the function returns, closing DB immediately, whereas returning a cleanup func lets Wire call it when the application actually shuts down"
    ],
    "correctAnswerIndex": 3,
    "explanation": "<code>defer db.Close()</code> inside a provider fires when NewDB <b>returns</b> — which happens the moment Wire finishes constructing the DB, closing it before anything can use it. <b>Returning a cleanup func</b> lets Wire add it to the cleanup chain and call it when the caller invokes cleanup(), which typically happens during application shutdown."
  },
  {
    "id": "wire-ch10-q05",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "In the Capstone project, why should the service layer depend on the TaskRepository interface rather than *postgresTaskRepo directly?",
    "options": [
      "Because Wire cannot inject a struct pointer into another struct",
      "Because depending on an interface allows unit tests to inject a mock instead of the concrete type, and lets you swap DB implementations without changing the service",
      "Because the Go compiler requires cross-package dependencies to always be interfaces",
      "Because wire.Bind only works with interfaces, not struct pointers"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Depending on an <b>interface</b> rather than a concrete type enables two key benefits: (1) unit tests are easy to write by injecting a MockTaskRepository instead of *postgresTaskRepo, requiring no real DB connection; (2) the implementation can be swapped — for example from PostgreSQL to MySQL — without touching the service layer at all. This is the Dependency Inversion Principle, which Wire supports via wire.Bind."
  },
  {
    "id": "wire-ch10-q06",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "Consider this RepositorySet. What is wrong with it?",
    "code": "var RepositorySet = wire.NewSet(\n    wire.Bind(new(TaskRepository), new(*postgresTaskRepo)),\n)",
    "options": [
      "Wrong — it is missing the NewPostgresTaskRepo provider that Wire needs to construct *postgresTaskRepo before the Bind can work",
      "Correct — this is sufficient because wire.Bind gives Wire all the information it needs",
      "Wrong — wire.Bind must be written outside wire.NewSet, not inside it",
      "Correct, but a wire.Value for *sql.DB should also be added"
    ],
    "correctAnswerIndex": 0,
    "explanation": "This code is missing <b>NewPostgresTaskRepo</b> in the set. wire.Bind says \"use *postgresTaskRepo for TaskRepository,\" but Wire still needs a provider that constructs *postgresTaskRepo. Without it, Wire will error with \"no provider for *postgresTaskRepo\". The correct form is: wire.NewSet(NewPostgresTaskRepo, wire.Bind(new(TaskRepository), new(*postgresTaskRepo)))"
  },
  {
    "id": "wire-ch10-q07",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "You want TaskHandler to be injected by wire.Struct, but the field 'service' is unexported. What is the problem and how do you fix it?",
    "code": "type TaskHandler struct {\n    service TaskService // unexported\n}",
    "options": [
      "No problem — wire.Struct can inject both exported and unexported fields equally",
      "Fix it by adding a `wire:\"inject\"` struct tag on the unexported field",
      "Wire cannot inject unexported fields; change it to an exported field (Service TaskService) or write a constructor provider instead",
      "Fix it by using wire.Struct(new(TaskHandler), \"service\") instead of \"*\""
    ],
    "correctAnswerIndex": 2,
    "explanation": "<b>wire.Struct can only inject exported fields</b> — if a field is unexported (lowercase), Wire will error saying it cannot set that field. There are two fixes: (1) change it to an exported field <code>Service TaskService</code>, accepting the encapsulation trade-off; or (2) write a constructor function <code>NewTaskHandler(svc TaskService) *TaskHandler</code> and use it as a provider instead of wire.Struct."
  },
  {
    "id": "wire-ch10-q08",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "After finishing wire.go, what is the correct next step to generate wire_gen.go?",
    "options": [
      "Run go build ./... and wire_gen.go will be generated automatically",
      "Run wire or go generate ./... in the directory containing wire.go",
      "Copy wire.go to wire_gen.go and change the build tag",
      "Run go test ./... and Wire will generate wire_gen.go before the tests run"
    ],
    "correctAnswerIndex": 1,
    "explanation": "You must run the <b>wire</b> command (or <code>go generate ./...</code> if a //go:generate wire directive is present) in the package containing wire.go. The wire tool reads wire.go, analyzes the dependency graph, and generates wire_gen.go. Neither <code>go build</code> nor <code>go test</code> invokes the wire tool automatically."
  },
  {
    "id": "wire-ch10-q09",
    "difficulty": "medium",
    "bloomLevel": "analyze",
    "question": "In the Wire-generated wire_gen.go, cleanup runs in the order cleanup2() (HTTP server) then cleanup() (DB). Is this order correct, and why?",
    "options": [
      "Incorrect — DB should always be closed first because it was opened before the HTTP server",
      "The order does not matter; each cleanup is an independent operation",
      "Correct, but Wire randomizes cleanup order each time — LIFO is not guaranteed",
      "Correct — the HTTP server must shut down first to stop accepting new requests and let pending ones finish, then it is safe to close DB"
    ],
    "correctAnswerIndex": 3,
    "explanation": "The <b>LIFO (Last-In, First-Out)</b> order Wire uses is correct and intentional: the HTTP server was created after DB, so it is cleaned up first. The critical reason is that in-flight requests may still be using DB connections. If DB were closed before the HTTP server, those requests would fail with unexpected errors."
  },
  {
    "id": "wire-ch10-q10",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "The Capstone project has two provider sets — one for production and one for tests — where TestSet uses MockTaskRepository instead of *postgresTaskRepo. Which option best describes this technique?",
    "options": [
      "TestSet is an override that directly modifies the production RepositorySet",
      "TestSet uses runtime reflection to swap implementations while tests run",
      "TestSet is a separate injector set with a different wire.Bind that binds TaskRepository to *MockTaskRepository instead of *postgresTaskRepo — so no real DB is needed during testing",
      "TestSet behaves identically to RepositorySet but skips the db.Ping step"
    ],
    "correctAnswerIndex": 2,
    "explanation": "This is an important Wire pattern: create a <b>separate injector set</b> for tests with a different wire.Bind, for example <code>var TestSet = wire.NewSet(NewMockTaskRepo, wire.Bind(new(repository.TaskRepository), new(*MockTaskRepository)), service.ServiceSet, handler.HandlerSet, ...)</code>. The test injector needs no real DB, runs fast, and is fully isolated. Wire has no override mechanism; use a completely separate injector set instead."
  },
  {
    "id": "wire-ch10-q11",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "A developer adds EmailService as a dependency to taskService but forgets to run wire after changing the signature of NewTaskService. What happens when go build is run?",
    "code": "// added emailSvc EmailService parameter\nfunc NewTaskService(repo TaskRepository, emailSvc EmailService) *taskService {",
    "options": [
      "Wire will automatically detect the change and regenerate wire_gen.go on every build",
      "The application will compile but EmailService will be nil at runtime",
      "Wire will auto-detect and inject EmailService without needing to run wire again",
      "go build will fail because the old wire_gen.go calls NewTaskService with the original arguments (missing emailSvc), causing a type mismatch"
    ],
    "correctAnswerIndex": 3,
    "explanation": "The old wire_gen.go calls NewTaskService(taskRepository) with only one argument, but after the signature change it requires two. Therefore <b>go build will fail</b> with \"too few arguments in call to NewTaskService\". Wire does not auto-regenerate; you must run <code>wire</code> or <code>go generate</code> before building whenever a provider signature changes. This is why adding wire gen to your CI pipeline is important."
  },
  {
    "id": "wire-ch10-q12",
    "difficulty": "hard",
    "bloomLevel": "evaluate",
    "question": "The team debates whether to create one provider set per package or a single large GlobalSet. Which is the better decision and why?",
    "options": [
      "GlobalSet is always better because it reduces boilerplate and the number of files to maintain",
      "A set per layer/package is better because it can be reused across injectors (e.g. prod vs test), lets you swap a single layer's implementation without affecting other sets, and makes it clear what providers each layer contains",
      "The number of sets does not affect functionality; choose based on team preference",
      "GlobalSet is better in every case where a project has more than 10 providers"
    ],
    "correctAnswerIndex": 1,
    "explanation": "<b>A set per layer/package is better</b> for three main reasons: (1) <b>Reusability</b> — a test injector can reuse ServiceSet and HandlerSet while swapping RepositorySet for TestRepositorySet; (2) <b>Isolation</b> — changing the DB driver requires editing only RepositorySet without touching any other set; (3) <b>Clarity</b> — reading set.go immediately shows what a layer wires. A large GlobalSet is hard to reuse and any change to it affects every injector."
  },
  {
    "id": "wire-ch10-q13",
    "difficulty": "hard",
    "bloomLevel": "evaluate",
    "question": "The team debates two approaches for handling config in Wire: (A) pass the Config struct as a parameter to InitApp, or (B) create a NewConfig provider that reads environment variables itself. Which option best describes the trade-off?",
    "options": [
      "Option B is always better because main.go does not need to know anything about config",
      "Options A and B are identical in all cases; choose based on coding style",
      "Option A is preferable when you need to load and validate config before Wire runs, or when tests need to pass different configs; Option B is preferable when config loading is itself part of the initialization graph",
      "Option A is incorrect because Wire does not support structs as injector parameters"
    ],
    "correctAnswerIndex": 2,
    "explanation": "Both approaches are valid but have trade-offs. <b>Option A (Config as parameter)</b> lets main.go control config loading, allows validation or transformation before passing to Wire, and makes it easy for test injectors to receive a different config. <b>Option B (NewConfig provider)</b> hides loading logic inside the Wire graph and is suitable when config loading is simple and requires no customization. The Capstone project uses Option A because config typically needs validation before injection and test injectors need configs that differ from production."
  },
  {
    "id": "wire-ch10-q14",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "In the Capstone project's main.go, a developer writes the following code. What is the problem?",
    "code": "srv, cleanup, err := InitApp(cfg)\ndefer cleanup()\nif err != nil {\n    log.Fatal(err)\n}",
    "options": [
      "No problem — the code is correct and cleanup will run after the error",
      "defer cleanup() is placed before the error check; if InitApp fails, cleanup may be nil, causing a panic when defer fires — defer cleanup() must be moved after the error check",
      "go cleanup() should be used instead of defer cleanup() for non-blocking execution",
      "log.Fatal does not run deferred functions — use os.Exit(1) instead"
    ],
    "correctAnswerIndex": 1,
    "explanation": "The problem is that <code>defer cleanup()</code> is placed <b>before</b> the error check. If InitApp returns an error, cleanup may be a nil function, and when defer fires it will panic. The correct order is to check the error first, then defer cleanup(): <code>srv, cleanup, err := InitApp(cfg); if err != nil { log.Fatal(err) }; defer cleanup()</code>"
  },
  {
    "id": "wire-ch10-q15",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "Both NewDB and NewHTTPServer return a cleanup func(). How does Wire combine multiple cleanup functions in wire_gen.go?",
    "options": [
      "Wire wraps all cleanup functions into a single anonymous function that runs all cleanups in LIFO order in wire_gen.go",
      "Wire picks only the last resource's cleanup and discards the rest",
      "Wire generates an injector that returns a []func() slice for the caller to run manually",
      "Wire does not support multiple cleanup functions; only one provider per injector may have a cleanup"
    ],
    "correctAnswerIndex": 0,
    "explanation": "Wire generates a <b>single cleanup function</b> in wire_gen.go that wraps all individual cleanups in LIFO order, for example: <code>return httpServer, func() { cleanup2(); cleanup() }, nil</code> — where cleanup2 is the HTTP server shutdown and cleanup is the DB close. The caller receives a single function and calls <code>defer cleanup()</code> once; Wire manages the ordering entirely."
  },
  {
    "id": "wire-ch10-q16",
    "difficulty": "hard",
    "bloomLevel": "create",
    "question": "You want to add a Redis cache layer where RedisCache also implements the TaskRepository interface. What changes are needed in the Wire setup?",
    "options": [
      "No changes needed — Wire detects Redis dependencies automatically from imports",
      "Delete the entire RepositorySet and recreate it; existing sets cannot be modified",
      "Only update the service layer by adding a RedisCache dependency; wire.Bind does not need to change",
      "Add a NewRedisCache provider, update wire.Bind in RepositorySet to bind TaskRepository to *RedisCache instead of *postgresTaskRepo, then run wire again"
    ],
    "correctAnswerIndex": 3,
    "explanation": "The steps are: (1) create a <code>NewRedisCache(client *redis.Client) *RedisCache</code> provider that implements TaskRepository; (2) update RepositorySet to include the Redis provider and change wire.Bind: <code>wire.NewSet(NewRedisCache, wire.Bind(new(TaskRepository), new(*RedisCache)))</code>; (3) also add a Redis client provider; (4) run <code>wire</code> to regenerate wire_gen.go. Swapping implementations via wire.Bind is <b>exactly the use case</b> wire.Bind was designed for."
  },
  {
    "id": "wire-ch10-q17",
    "difficulty": "hard",
    "bloomLevel": "evaluate",
    "question": "The team asks: if we need to inject a request-scoped logger (carrying a trace ID per request) into handlers, how should we design this with Wire?",
    "options": [
      "Add *slog.Logger as a field on TaskHandler and have Wire inject a single logger singleton",
      "Wire does not support per-request injection; use a global logger instead",
      "Store the logger in context.Context and pass it through the context in handler methods rather than injecting via Wire",
      "Create a per-request injector function that accepts a traceID string as a parameter; Wire creates a logger with that traceID while singletons such as DB are passed as parameters rather than recreated"
    ],
    "correctAnswerIndex": 2,
    "explanation": "For a <b>request-scoped logger</b>, the idiomatic Go approach is to use <code>context.Context</code> because: (1) a per-request injector that creates a new logger would allocate objects on every request; (2) Wire per-request injectors are appropriate only when an entire component graph needs to be fresh; (3) the Go idiom for request-scoped values is context, not DI. Option D is also workable but more complicated; Option A injects a singleton logger without a trace ID; Option C is the correct idiomatic Go approach."
  },
  {
    "id": "wire-ch10-q18",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "Which build tag must be present in Wire-generated wire_gen.go to avoid conflicting with wire.go?",
    "options": [
      "//go:build wireinject",
      "//go:build !wireinject",
      "//go:build wire",
      "//go:build production"
    ],
    "correctAnswerIndex": 1,
    "explanation": "<b>wire_gen.go</b> carries the build tag <code>//go:build !wireinject</code>, which is the opposite of wire.go's <code>//go:build wireinject</code>. This ensures the two files are never compiled together: when the wire tool runs it reads only wire.go (wireinject=true), and when go build runs it uses only wire_gen.go (wireinject=false)."
  },
  {
    "id": "wire-ch10-q19",
    "difficulty": "medium",
    "bloomLevel": "analyze",
    "question": "In the Wire-generated wire_gen.go for the Capstone project, the line taskHandler := &handler.TaskHandler{Service: taskService} comes from which Wire directive?",
    "options": [
      "wire.Bind(new(handler.TaskHandler), new(*handler.TaskHandler)) in HandlerSet",
      "A hand-written NewTaskHandler provider in the handler package",
      "wire.Struct(new(handler.TaskHandler), \"*\") in HandlerSet, which tells Wire to inject all exported fields",
      "wire.Value(&handler.TaskHandler{}) specifying the value directly"
    ],
    "correctAnswerIndex": 2,
    "explanation": "<code>&handler.TaskHandler{Service: taskService}</code> in wire_gen.go is the code Wire generates from <b>wire.Struct(new(handler.TaskHandler), \"*\")</b>. Wire injects every exported field by finding the dependency for each one from the dependency graph; the Service field is a TaskService interface whose value comes from the wire.Bind in ServiceSet. This is the output when there is no constructor function and wire.Struct is used instead."
  },
  {
    "id": "wire-ch10-q20",
    "difficulty": "hard",
    "bloomLevel": "create",
    "question": "A developer wants to add a /healthz endpoint that needs *sql.DB to ping the database. How should this be added to the Wire setup correctly?",
    "options": [
      "Call db.Ping() directly in main.go because health checks are not part of Wire",
      "Create a HealthHandler struct with a field DB *sql.DB, add wire.Struct(new(HealthHandler), \"*\") to HandlerSet, and update NewServeMux to accept *HealthHandler as a parameter and register the /healthz route",
      "Add /healthz to TaskHandler.Register without needing any additional provider",
      "Create a health check provider in a separate package and wire.Bind it to the http.Handler interface"
    ],
    "correctAnswerIndex": 1,
    "explanation": "The correct approach is: (1) create <code>HealthHandler struct { DB *sql.DB }</code>; (2) add <code>wire.Struct(new(HealthHandler), \"*\")</code> to HandlerSet — Wire will inject *sql.DB which already exists in the graph; (3) update <code>NewServeMux</code> to accept *HealthHandler and register <code>/healthz</code>; (4) run wire again. Wire will automatically connect the *sql.DB from db.NewDB into HealthHandler without creating a new DB instance — Wire reuses the existing instance already in the graph."
  }
];
