/* questions ch03 (EN) */
(window.QUESTIONS_EN = window.QUESTIONS_EN || {}).ch03 = [
  {
    "id": "wire-ch03-q01",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "What is a \"provider\" in the context of Google Wire?",
    "options": [
      "A special interface that must be implemented so Wire recognizes a component",
      "A struct tag placed on a field to tell Wire that field needs injection",
      "A configuration file that tells Wire which dependency to wire first",
      "A plain Go function that returns a value of a particular type, which Wire uses to build dependencies"
    ],
    "correctAnswerIndex": 3,
    "explanation": "A <b>provider</b> in Wire is simply a plain Go constructor function — no special interfaces, no struct tags. Wire reads the function's return type to know what kind of value that provider supplies."
  },
  {
    "id": "wire-ch03-q02",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "What does Wire use as the \"key\" when matching dependencies between providers?",
    "options": [
      "The function name, such as NewDB or NewUserRepo",
      "The parameter name, such as db or repo",
      "The Go type of the return value and parameters",
      "The order in which providers are listed in wire.Build"
    ],
    "correctAnswerIndex": 2,
    "explanation": "Wire matches dependencies <b>by Go type alone</b>. Function names and parameter names are irrelevant. If provider A returns <code>*sql.DB</code> and provider B accepts a <code>*sql.DB</code> parameter, Wire connects them automatically."
  },
  {
    "id": "wire-ch03-q03",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "Which return forms does a provider function support (as covered in Chapter 3)?",
    "options": [
      "Two forms: a single value, or (value, error)",
      "Only a single value — returning an error is not allowed",
      "Only pointers — returning a value type is not allowed",
      "Three forms: a single value, (value, error), or (value, func(), error)"
    ],
    "correctAnswerIndex": 0,
    "explanation": "In this chapter, Wire supports two main forms: <code>func New() T</code> and <code>func New() (T, error)</code>. The third form <code>(T, func(), error)</code> is the cleanup function pattern, covered in Chapter 7."
  },
  {
    "id": "wire-ch03-q04",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "What does wire.Build(…) do inside an injector stub?",
    "options": [
      "Immediately runs all provider functions and returns the results",
      "Specifies the constructor call order for Wire to follow",
      "Tells Wire which providers are available for building the dependency graph",
      "Automatically imports the packages required by every provider"
    ],
    "correctAnswerIndex": 2,
    "explanation": "<code>wire.Build(...)</code> tells Wire (at code generation time) which providers are in the \"pool\". Wire then traces the dependency graph itself and decides the correct order. No functions are actually called at compile time."
  },
  {
    "id": "wire-ch03-q05",
    "difficulty": "easy",
    "bloomLevel": "understand",
    "question": "Consider this function:\n\nfunc NewCache(cfg Config) *Cache\n\nIn the context of Wire, what does the parameter cfg Config mean?",
    "code": "func NewCache(cfg Config) *Cache",
    "options": [
      "Wire will create an empty Config automatically without needing a provider",
      "Config is a dependency that Wire must find a provider for, or the caller must pass it as an injector parameter",
      "Wire will skip this parameter because it is a struct, not a pointer",
      "Wire will error because Config does not implement the Wire interface"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Every parameter of a provider is a <b>dependency</b> that Wire must supply. Wire will look for a provider that returns <code>Config</code> in wire.Build, or if the injector function has <code>cfg Config</code> as a parameter, the caller is considered to have supplied it already."
  },
  {
    "id": "wire-ch03-q06",
    "difficulty": "easy",
    "bloomLevel": "understand",
    "question": "What does return nil, nil at the end of an injector stub mean?",
    "code": "func InitApp() (*App, error) {\n    wire.Build(NewDB, NewRepo, NewApp)\n    return nil, nil\n}",
    "options": [
      "It tells Wire that injection failed and should return an error",
      "It is real code that runs, and Wire uses these nil values in wire_gen.go",
      "It tells Wire that this injector is optional and may never be called",
      "It is only a placeholder for the compiler — Wire generates the real body in wire_gen.go"
    ],
    "correctAnswerIndex": 3,
    "explanation": "<code>return nil, nil</code> in the stub is simply a placeholder so the compiler does not complain about a missing return statement. Wire generates the real code in <code>wire_gen.go</code> replacing the entire stub. The return values in the stub have no effect on the generated code."
  },
  {
    "id": "wire-ch03-q07",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "Given these three providers, which wire.Build call correctly constructs a *Server?",
    "code": "func NewDB() *sql.DB\nfunc NewRepo(db *sql.DB) *Repo\nfunc NewServer(repo *Repo) *Server",
    "options": [
      "wire.Build(NewServer) alone is enough because Wire can find dependencies on its own",
      "Both wire.Build(NewDB, NewRepo, NewServer) and wire.Build(NewServer, NewRepo, NewDB) are correct because order in wire.Build does not matter",
      "wire.Build(NewDB, NewRepo) alone is enough because Wire already knows from the return types",
      "wire.Build must always be ordered from leaf to root: wire.Build(NewDB, NewRepo, NewServer)"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Wire calculates constructor call order from the type graph. <strong>The order written in wire.Build has no effect.</strong> Therefore <code>wire.Build(NewDB, NewRepo, NewServer)</code> and <code>wire.Build(NewServer, NewRepo, NewDB)</code> produce identical results. Option A is wrong because NewDB and NewRepo are missing."
  },
  {
    "id": "wire-ch03-q08",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "Will Wire error when run against this injector? Why?",
    "code": "func NewLogger() *Logger\nfunc NewService(repo *Repo) *Service\n\nfunc InitService() *Service {\n    wire.Build(NewLogger, NewService)\n    return nil\n}",
    "options": [
      "No error — Wire has all the providers it needs",
      "Error — NewLogger is not used in the dependency graph of *Service",
      "Error — the injector does not return an error so wire.Build cannot be used",
      "Error — there is no provider for *Repo, which NewService requires"
    ],
    "correctAnswerIndex": 3,
    "explanation": "NewService requires <code>*Repo</code> as a parameter, but wire.Build has no provider that returns <code>*Repo</code>. Wire will error: <code>wire: no provider found for *main.Repo</code>. Although NewLogger is also unused in the path to *Service, Wire will report the missing *Repo provider first."
  },
  {
    "id": "wire-ch03-q09",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "What problem will occur when wire is run against this code?",
    "code": "func NewPostgresDB() *sql.DB {\n    // connect to Postgres\n}\n\nfunc NewMySQLDB() *sql.DB {\n    // connect to MySQL\n}\n\nfunc InitApp() (*App, error) {\n    wire.Build(NewPostgresDB, NewMySQLDB, NewRepo, NewApp)\n    return nil, nil\n}",
    "options": [
      "Wire will error because two providers return *sql.DB, which is a duplicate binding",
      "No problem — Wire will choose the faster provider",
      "Wire will always use the provider listed first in wire.Build, which is NewPostgresDB",
      "Wire will create two *sql.DB instances and pass the more suitable one to NewRepo"
    ],
    "correctAnswerIndex": 0,
    "explanation": "Wire cannot choose between two providers that return the same type. Wire will error: <code>*sql.DB is provided twice</code>. You must decide which one to use and remove the other from wire.Build."
  },
  {
    "id": "wire-ch03-q10",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "Is this provider function valid for Wire?",
    "code": "func newConfig() Config {\n    return Config{DSN: \"postgres://localhost/mydb\"}\n}",
    "options": [
      "Not valid — a provider must be an exported function (starting with an uppercase letter)",
      "Not valid — a provider must have at least one parameter",
      "Not valid — a provider must always return a pointer; returning a value type is not allowed",
      "Valid — Wire supports both exported and unexported providers, and returning a value type is fine"
    ],
    "correctAnswerIndex": 3,
    "explanation": "Wire supports unexported functions as providers as long as they are used within the same package. The return type can be a value type (<code>Config</code>) or a pointer (<code>*Config</code>) — Wire treats them as distinct types."
  },
  {
    "id": "wire-ch03-q11",
    "difficulty": "medium",
    "bloomLevel": "analyze",
    "question": "Consider these providers:\n\nfunc NewRepo(db *sql.DB) *Repo\nfunc NewService(repo Repo) *Service\n\nIf NewRepo returns *Repo but NewService accepts Repo (no pointer), what happens?",
    "code": "func NewRepo(db *sql.DB) *Repo       // returns *Repo\nfunc NewService(repo Repo) *Service  // accepts Repo (value, not pointer)",
    "options": [
      "Wire will automatically dereference the pointer — no problem",
      "The Go compiler will handle it at compile time because pointers and values are interchangeable in Go",
      "Wire will error because *Repo and Repo are different types to Wire",
      "Wire will warn but still generate wire_gen.go"
    ],
    "correctAnswerIndex": 2,
    "explanation": "Wire matches dependencies <b>by exact type</b>. <code>*Repo</code> and <code>Repo</code> are different types. Wire will error: <code>no provider found for main.Repo</code> because there is a provider for <code>*Repo</code> but not for <code>Repo</code>. The signatures must be made consistent."
  },
  {
    "id": "wire-ch03-q12",
    "difficulty": "medium",
    "bloomLevel": "analyze",
    "question": "A developer added this code to an injector stub and wonders why the generated code does not use the value x:",
    "code": "func InitApp() *App {\n    x := computeDefault()\n    wire.Build(NewApp)\n    return nil\n}",
    "options": [
      "Because x must be passed directly into wire.Build for Wire to use it",
      "Wire only reads the wire.Build call; all other code in the injector body is completely ignored during code generation",
      "Because computeDefault is not a valid provider function",
      "Wire does not support local variables in injectors; they must be moved into a provider"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Wire's parser reads only the <code>wire.Build(...)</code> call in the injector body. Everything else there is completely ignored during code generation. To pass the result of <code>computeDefault()</code> into the dependency graph, it must be added as a provider or as an injector parameter."
  },
  {
    "id": "wire-ch03-q13",
    "difficulty": "medium",
    "bloomLevel": "analyze",
    "question": "What is the correct way to trace a dependency graph to verify all providers are present?",
    "options": [
      "Read the provider order in wire.Build top-to-bottom — they must be sorted from leaf to root",
      "Count the number of providers in wire.Build and check that it exceeds the number of required types",
      "Look at provider function names — matching names mean Wire will pair them correctly",
      "Start from the injector's return type, then follow each provider's parameters recursively until reaching leaf nodes"
    ],
    "correctAnswerIndex": 3,
    "explanation": "The correct approach is to start from the <b>injector's return type</b>, ask which parameters (dependencies) the provider for that type needs, then repeat for each dependency until reaching leaf nodes with no parameters. The order in wire.Build and function names are irrelevant."
  },
  {
    "id": "wire-ch03-q14",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "Will Wire error on this code? Why?",
    "code": "type DB struct{}\ntype DBConn struct{}\n\nfunc NewDB() *DB         { return &DB{} }\nfunc NewDBConn() *DBConn { return &DBConn{} }\nfunc NewRepo(db *DB) *Repo { return &Repo{db: db} }\n\nfunc InitRepo() *Repo {\n    wire.Build(NewDB, NewDBConn, NewRepo)\n    return nil\n}",
    "options": [
      "Error — Wire does not allow a provider that is unused in the dependency graph",
      "No error — Wire will use NewDB for NewRepo and silently ignore NewDBConn",
      "Error — *DB and *DBConn have names that are too similar, causing Wire to be confused",
      "Uncertain — depends on the Wire version"
    ],
    "correctAnswerIndex": 0,
    "explanation": "Wire will error because <code>NewDBConn</code> is a provider that is never used anywhere in the dependency graph for <code>*Repo</code>. Wire treats an unused provider as an error. You must either remove NewDBConn from wire.Build or add a consumer for *DBConn."
  },
  {
    "id": "wire-ch03-q15",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "Consider this code and choose the correct explanation:",
    "code": "type Logger struct{}\ntype App struct{ l *Logger }\n\nfunc NewLogger() *Logger     { return &Logger{} }\nfunc NewLoggerV2() *Logger   { return &Logger{} }\nfunc NewApp(l *Logger) *App  { return &App{l: l} }\n\nfunc Init() *App {\n    wire.Build(NewLogger, NewLoggerV2, NewApp)\n    return nil\n}",
    "options": [
      "Wire will choose NewLoggerV2 because it is listed later in wire.Build",
      "Wire will error because both NewLogger and NewLoggerV2 return *Logger, which is a duplicate provider",
      "Wire will create two *Logger instances and pass the more suitable one to NewApp",
      "Wire will use NewLogger because its name is shorter"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Wire has no priority or override mechanism for providers that return the same type. If two providers both return <code>*Logger</code>, Wire errors immediately: <code>*Logger is provided twice (by NewLogger and NewLoggerV2)</code>. You must use exactly one of them."
  },
  {
    "id": "wire-ch03-q16",
    "difficulty": "hard",
    "bloomLevel": "apply",
    "question": "Is this injector valid for Wire?",
    "code": "//go:build wireinject\n\npackage main\n\nimport \"github.com/google/wire\"\n\nfunc InitApp(cfg Config) (*App, error) {\n    wire.Build(NewDB, NewRepo, NewApp)\n    return nil, nil\n}",
    "options": [
      "Not valid — Wire does not support injectors that accept parameters",
      "Not valid — there must be a provider for Config inside wire.Build",
      "Valid — the injector parameter Config is considered provided by the caller; Wire does not need a provider for Config",
      "Valid, but wire.Value(cfg) must be added to wire.Build to tell Wire where Config comes from"
    ],
    "correctAnswerIndex": 2,
    "explanation": "Injector parameters are a supported feature. Wire treats <code>cfg Config</code> as already provided by the caller and will use that value when injecting into providers that need <code>Config</code> further down the graph — no Config provider in wire.Build is required."
  },
  {
    "id": "wire-ch03-q17",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "A developer named their parameter database but Wire still errors saying it cannot find a provider for *sql.DB. Which explanation is correct?",
    "code": "func NewRepo(database *sql.DB) *Repo {\n    return &Repo{db: database}\n}\n\nfunc InitRepo() *Repo {\n    wire.Build(NewRepo)  // forgot to add NewDB\n    return nil\n}",
    "options": [
      "Because the parameter must be named db, not database — Wire uses names for matching",
      "Because *sql.DB is from the standard library, which Wire does not support",
      "Because NewRepo must be renamed to NewRepository before Wire will recognize it",
      "Because Wire matches by type (*sql.DB), not by parameter name — there is no provider returning *sql.DB in wire.Build"
    ],
    "correctAnswerIndex": 3,
    "explanation": "The parameter name (<code>database</code> or <code>db</code>) has no effect on Wire at all. Wire only cares about the <b>type of the parameter</b>, which is <code>*sql.DB</code>. Without a provider that returns <code>*sql.DB</code> in wire.Build, Wire errors regardless of the parameter name."
  },
  {
    "id": "wire-ch03-q18",
    "difficulty": "hard",
    "bloomLevel": "apply",
    "question": "What will the wire_gen.go generated from these providers look like?",
    "code": "func NewDB() (*sql.DB, error)\nfunc NewRepo(db *sql.DB) *Repo\nfunc NewApp(repo *Repo) *App\n\n// Injector:\nfunc InitApp() (*App, error) {\n    wire.Build(NewDB, NewRepo, NewApp)\n    return nil, nil\n}",
    "options": [
      "Calls all constructors concurrently with goroutines and waits with sync.WaitGroup",
      "Calls NewApp first, then resolves dependencies lazily in reverse",
      "Creates all dependencies in parallel, then combines the results",
      "Calls NewDB first, checks its error, then calls NewRepo and NewApp in order, propagating errors up"
    ],
    "correctAnswerIndex": 3,
    "explanation": "Wire generates plain Go code that calls constructors in topological sort order: NewDB first (leaf), then NewRepo, finally NewApp. If NewDB returns an error, Wire propagates it immediately. There are no goroutines and no lazy initialization in generated code."
  },
  {
    "id": "wire-ch03-q19",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "Why does wire_gen.go have the build tag //go:build !wireinject at the top?",
    "options": [
      "So the compiler uses this file during the real build and excludes the stub file that has the wireinject tag, preventing a duplicate function declaration",
      "So this file is excluded only when the wire tool is run",
      "To tell the Go test runner not to run this file during testing",
      "To prevent linters from checking Wire-generated code"
    ],
    "correctAnswerIndex": 0,
    "explanation": "The stub file (<code>wire.go</code>) has <code>//go:build wireinject</code>, causing the compiler to <em>skip</em> it during a real build. The <code>wire_gen.go</code> file has <code>//go:build !wireinject</code>, causing the compiler to <em>use</em> it instead. The result is that the injector function is always defined exactly once — no duplicate declaration."
  },
  {
    "id": "wire-ch03-q20",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "A team finds that wire_gen.go contains old code that does not match the current provider signatures. What is the most likely cause?",
    "options": [
      "Both forgetting to run wire after changing a provider and manually editing wire_gen.go are possible causes",
      "Only forgetting to run wire (or go generate) after changing provider signatures",
      "Only a team member manually editing wire_gen.go",
      "A newer Wire version is incompatible with wire_gen.go generated by an older version"
    ],
    "correctAnswerIndex": 0,
    "explanation": "The most common causes are (1) <b>forgetting to run wire</b> after changing a provider — wire_gen.go goes stale immediately — and (2) <b>manually editing wire_gen.go</b>, which will be overwritten the next time wire runs. Prevention: add <code>go generate ./...</code> to the CI pipeline and never edit wire_gen.go by hand."
  },
  {
    "id": "wire-ch03-q21",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "Which of these is a complete, valid injector stub for Wire?",
    "options": [
      "func InitApp() *App { return NewApp(NewDB()) }",
      "func InitApp() *App { wire.Build(NewDB, NewApp) }",
      "//go:build wireinject\n\nfunc InitApp() *App { wire.Build(NewDB, NewApp); return nil }",
      "//go:build wireinject\n\nfunc InitApp() *App { return wire.Build(NewDB, NewApp) }"
    ],
    "correctAnswerIndex": 2,
    "explanation": "A valid injector stub requires: (1) <code>//go:build wireinject</code> at the top, (2) a <code>wire.Build(...)</code> call, and (3) a placeholder return statement with the correct type. Option A is manual wiring, not a stub. Option B is missing the build tag and return statement. Option D is wrong because <code>wire.Build</code> returns <code>string</code>, not <code>*App</code>, causing a type mismatch and compile failure."
  },
  {
    "id": "wire-ch03-q22",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "What should you do with the wire_gen.go file that Wire generates?",
    "options": [
      "Commit it to version control and never edit it by hand — it will be overwritten every time wire runs",
      "Delete it after each build because it is a temporary file",
      "Edit it manually whenever you want to optimize the wiring",
      "Add it to .gitignore because it can always be regenerated"
    ],
    "correctAnswerIndex": 0,
    "explanation": "<code>wire_gen.go</code> should be committed to VCS because (1) it makes builds straightforward without requiring the wire CLI on every machine, and (2) reviewers can see the generated code in PRs. However, <strong>never edit it by hand</strong> — it will be overwritten every time wire runs. Make changes in the provider or stub instead."
  }
];
