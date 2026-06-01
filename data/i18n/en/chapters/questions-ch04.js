/* questions ch04 (EN) */
(window.QUESTIONS_EN = window.QUESTIONS_EN || {}).ch04 = [
  {
    "id": "wire-ch04-q01",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "What does wire.NewSet(...) do in Google Wire?",
    "options": [
      "Creates a runtime container that stores already-built dependencies",
      "Calls all provider functions in parallel",
      "Groups related providers into a ProviderSet for reuse",
      "Creates an interface binding between a concrete type and an interface"
    ],
    "correctAnswerIndex": 2,
    "explanation": "<b>wire.NewSet(...)</b> groups related providers together so they can be reused across injectors and reduce noise in <code>wire.Build</code>. It does not create runtime objects or call any provider functions — it only operates during codegen."
  },
  {
    "id": "wire-ch04-q02",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "How should a ProviderSet created with wire.NewSet be declared?",
    "options": [
      "As an exported package-level var",
      "As a function that returns wire.ProviderSet",
      "As a const inside an init() function",
      "As a type alias for []wire.Provider"
    ],
    "correctAnswerIndex": 0,
    "explanation": "The correct convention is to declare it as an <b>exported package-level var</b>, e.g. <code>var RepositorySet = wire.NewSet(...)</code>, so other packages can import it and pass it to <code>wire.Build</code> or another <code>wire.NewSet</code>."
  },
  {
    "id": "wire-ch04-q03",
    "difficulty": "easy",
    "bloomLevel": "understand",
    "question": "When Wire processes nested sets such as wire.NewSet(SetA, SetB), what appears in wire_gen.go?",
    "options": [
      "wire_gen.go contains a nested structure mirroring the set declarations",
      "Wire creates a special struct for each set to encapsulate its providers",
      "Wire uses reflection to resolve sets at runtime",
      "Wire unfolds every set into a flat list of providers; no sets appear in wire_gen.go"
    ],
    "correctAnswerIndex": 3,
    "explanation": "Wire <b>unfolds</b> every set into a flat list of providers during codegen. The generated <code>wire_gen.go</code> contains only plain Go code that calls constructors in the correct order. There are no sets, no nesting, and no runtime structures whatsoever."
  },
  {
    "id": "wire-ch04-q04",
    "difficulty": "easy",
    "bloomLevel": "understand",
    "question": "Which statement about wire.NewSet is correct?",
    "options": [
      "Calling wire.NewSet immediately instantiates every provider in the set",
      "wire.NewSet forces all providers in the set to be called lazily on first use",
      "wire.NewSet is a static grouping used by Wire only during codegen and has no effect at runtime",
      "wire.NewSet creates a singleton that automatically caches provider results"
    ],
    "correctAnswerIndex": 2,
    "explanation": "<code>wire.NewSet</code> is a <b>static grouping</b> — it tells the Wire tool during <code>go generate</code> that these providers belong together. It has no effect on runtime behavior: no instantiation, no lazy loading, no caching."
  },
  {
    "id": "wire-ch04-q05",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "You want to create a RepositorySet that groups NewPostgresDB and NewUserRepository. Which code is correct?",
    "options": [
      "var RepositorySet = wire.NewSet(NewPostgresDB, NewUserRepository)",
      "var RepositorySet = wire.Build(NewPostgresDB, NewUserRepository)",
      "func RepositorySet() wire.ProviderSet { return wire.NewSet(NewPostgresDB, NewUserRepository) }",
      "const RepositorySet = wire.NewSet(NewPostgresDB, NewUserRepository)"
    ],
    "correctAnswerIndex": 0,
    "explanation": "The correct code is <code>var RepositorySet = wire.NewSet(NewPostgresDB, NewUserRepository)</code>. Use <b>var</b> (not const or a function) and use <b>wire.NewSet</b> (not wire.Build, which is only valid inside an injector stub)."
  },
  {
    "id": "wire-ch04-q06",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "How do you pass RepositorySet into an injector stub?",
    "code": "var RepositorySet = wire.NewSet(NewPostgresDB, NewUserRepository)\n\n// injector stub\n//go:build wireinject\n\nfunc InitApp(cfg Config) (*App, error) {\n\t// ??? what goes here\n\treturn nil, nil\n}",
    "options": [
      "wire.Inject(RepositorySet)",
      "wire.Use(RepositorySet)",
      "wire.Build(RepositorySet.Providers()...)",
      "wire.Build(RepositorySet)"
    ],
    "correctAnswerIndex": 3,
    "explanation": "Use <code>wire.Build(RepositorySet)</code>, passing the set directly. Wire accepts both provider functions and provider sets in <code>wire.Build</code> without needing to expand them or call any method on the set."
  },
  {
    "id": "wire-ch04-q07",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "You want to compose ApplicationSet from RepositorySet, ServiceSet, and HandlerSet. Which code is correct?",
    "options": [
      "var ApplicationSet = wire.Compose(RepositorySet, ServiceSet, HandlerSet)",
      "var ApplicationSet = wire.Build(RepositorySet, ServiceSet, HandlerSet)",
      "var ApplicationSet = wire.NewSet(RepositorySet, ServiceSet, HandlerSet)",
      "var ApplicationSet = wire.Merge(RepositorySet, ServiceSet, HandlerSet)"
    ],
    "correctAnswerIndex": 2,
    "explanation": "<code>wire.NewSet</code> accepts both provider functions and other provider sets as arguments. Writing <code>var ApplicationSet = wire.NewSet(RepositorySet, ServiceSet, HandlerSet)</code> composes those sets together. There is no <code>wire.Compose</code> or <code>wire.Merge</code> in the Wire API."
  },
  {
    "id": "wire-ch04-q08",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "Why should a ProviderSet be declared in the same package as its providers rather than at the injector?",
    "options": [
      "Because Wire requires sets and providers to be in the same package; otherwise Wire errors",
      "Because when providers change (added or removed), the developer can update the nearby set immediately without touching the injector",
      "Because Go does not allow importing a package that contains wire.NewSet from another package",
      "Because wire.NewSet uses reflection that only works within the package where providers are declared"
    ],
    "correctAnswerIndex": 1,
    "explanation": "This is about <b>maintainability</b>. When the set lives next to the providers, adding a new provider in that package means updating the set in a nearby file. Wire does not enforce set location, but good convention reduces the chance of forgetting to update it."
  },
  {
    "id": "wire-ch04-q09",
    "difficulty": "medium",
    "bloomLevel": "analyze",
    "question": "Consider this code. What is the problem?",
    "code": "var SetA = wire.NewSet(NewPostgresDB, NewUserRepo)\nvar SetB = wire.NewSet(NewPostgresDB, NewOrderRepo)\n\nvar AppSet = wire.NewSet(SetA, SetB)",
    "options": [
      "Wire will report a duplicate provider error because NewPostgresDB appears twice in AppSet (via SetA and SetB)",
      "No problem — Wire will use NewPostgresDB from SetA and silently ignore the one in SetB",
      "The problem is that SetA and SetB are not exported, so AppSet cannot reference them",
      "The problem is that wire.NewSet does not support nesting more than 2 levels deep"
    ],
    "correctAnswerIndex": 0,
    "explanation": "When Wire unfolds <code>AppSet</code> it sees <code>NewPostgresDB</code> twice (from SetA and SetB). Wire uses <b>return type as the key</b> — both <code>NewPostgresDB</code> calls return <code>*sql.DB</code>, so Wire reports a <b>duplicate provider error</b>. Fix it by moving <code>NewPostgresDB</code> into a separate shared set or passing it directly to AppSet just once."
  },
  {
    "id": "wire-ch04-q10",
    "difficulty": "medium",
    "bloomLevel": "analyze",
    "question": "Consider this injector. What is the problem?",
    "code": "var RepoSet = wire.NewSet(NewPostgresDB, NewUserRepo)\n\n//go:build wireinject\n\nfunc InitApp(cfg Config) (*App, error) {\n\twire.Build(RepoSet, NewPostgresDB, NewAppService, NewApp)\n\treturn nil, nil\n}",
    "options": [
      "The problem is that RepoSet must first be unwrapped with RepoSet.Providers() before passing it to wire.Build",
      "No problem — wire.Build can accept both sets and individual providers at the same time",
      "The problem is that wire.Build does not support mixing sets with provider functions",
      "Wire will report a duplicate provider error because NewPostgresDB is inside RepoSet and also passed directly to wire.Build"
    ],
    "correctAnswerIndex": 3,
    "explanation": "<code>NewPostgresDB</code> is already inside <code>RepoSet</code>. Passing <code>NewPostgresDB</code> directly to <code>wire.Build</code> again causes a <b>duplicate provider</b> error. Wire works from a flat list of all providers regardless of whether they came from a set or were listed inline. Remove <code>NewPostgresDB</code> from the <code>wire.Build</code> call."
  },
  {
    "id": "wire-ch04-q11",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "You want to add a wire.Bind to RepositorySet that binds the UserRepository interface to *postgresUserRepo. Which code is correct?",
    "options": [
      "var RepositorySet = wire.NewSet(NewPostgresDB, NewPostgresUserRepo, wire.Bind(UserRepository{}, postgresUserRepo{}))",
      "var RepositorySet = wire.NewSet(NewPostgresDB, NewPostgresUserRepo).Bind(UserRepository, postgresUserRepo)",
      "var RepositorySet = wire.NewSet(NewPostgresDB, NewPostgresUserRepo, wire.Interface(UserRepository, postgresUserRepo))",
      "var RepositorySet = wire.NewSet(NewPostgresDB, NewPostgresUserRepo, wire.Bind(new(UserRepository), new(*postgresUserRepo)))"
    ],
    "correctAnswerIndex": 3,
    "explanation": "<code>wire.Bind</code> always takes <code>new(Type)</code> arguments: the first is the interface, the second is the concrete type. Write it as <code>wire.Bind(new(UserRepository), new(*postgresUserRepo))</code>. It can be placed directly inside <code>wire.NewSet</code> alongside provider functions."
  },
  {
    "id": "wire-ch04-q12",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "A team designs their provider sets as shown. What reusability problem does this create?",
    "code": "// A single large set\nvar EverythingSet = wire.NewSet(\n\tNewPostgresDB,\n\tNewRedisCache,\n\tNewUserRepo,\n\tNewOrderRepo,\n\tNewUserService,\n\tNewOrderService,\n\tNewUserHandler,\n\tNewOrderHandler,\n\tNewHTTPServer,\n)",
    "options": [
      "No problem — Wire supports sets of any size and automatically skips unused providers",
      "When multiple injectors need different subsets (e.g. prod needs everything but a test needs a mock DB instead of a real DB), you cannot swap the provider in EverythingSet without a conflict because you must bring the whole set including the real DB provider",
      "Wire will instantiate every provider in the set regardless of whether the injector needs it, causing slowdowns",
      "wire.NewSet does not support more than 5 providers in a single set"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Wire does tree-shaking and skips unused providers, so EverythingSet technically works. The <b>reusability problem</b> is: when different injectors need different providers — e.g. prod uses the real DB but tests need a mock DB — you cannot compose EverythingSet with NewMockDB because EverythingSet already includes NewRealDB, which would cause a duplicate provider error. The solution is to split into RepositorySet, ServiceSet, and HandlerSet so each injector can compose only what it needs."
  },
  {
    "id": "wire-ch04-q13",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "Two providers return different types but share a common dependency, and they live in different sets. How does Wire handle this?",
    "code": "// SetA contains:\n// NewPostgresDB() *sql.DB\n// NewUserRepo(db *sql.DB) *UserRepo\n\n// SetB contains:\n// NewOrderRepo(db *sql.DB) *OrderRepo\n\nvar AppSet = wire.NewSet(SetA, SetB)\n\n// injector:\n// func Init(cfg Config) (*Service, error) { wire.Build(AppSet, NewService); ... }",
    "options": [
      "Wire errors because *sql.DB is used by two sets, causing a conflict",
      "Wire creates *sql.DB twice, once for each set",
      "Wire randomly picks whether NewUserRepo or NewOrderRepo receives *sql.DB",
      "Wire resolves *sql.DB from NewPostgresDB (in SetA) exactly once and shares the result with both NewUserRepo and NewOrderRepo"
    ],
    "correctAnswerIndex": 3,
    "explanation": "Wire builds a dependency graph using return types as keys. <code>*sql.DB</code> has exactly one provider: <code>NewPostgresDB</code>. Wire calls <code>NewPostgresDB</code> <b>exactly once</b> and passes the resulting <code>*sql.DB</code> to both <code>NewUserRepo</code> and <code>NewOrderRepo</code>. No duplication, no conflict — there is only one provider for that type."
  },
  {
    "id": "wire-ch04-q14",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "A developer claims: \"If you include an unnecessary provider in a set, Wire will error because it cannot resolve that provider's dependencies.\" Is this true or false?",
    "options": [
      "True — Wire requires every provider in a set to have all its dependencies satisfied; otherwise it errors",
      "False — Wire only uses providers needed for the injector's return type; providers with no consumer are ignored",
      "Partially true — Wire will warn but not error if there is an unused provider",
      "False — Wire calls every provider in the set automatically regardless of whether it is needed"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Wire performs <b>tree shaking</b> of the dependency graph — starting from the injector's return type, it traces back to only the required providers. Providers with no consumer are <b>ignored without error</b>. However, if a provider that is actually used has an unsatisfied dependency, Wire will error."
  },
  {
    "id": "wire-ch04-q15",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "There are two injectors: InitProd uses ApplicationSet which includes NewRealDB, and InitTest needs NewMockDB instead. How should the sets be designed?",
    "options": [
      "Create a single ApplicationSet and use build tags to switch the implementation inside NewRealDB",
      "Create a single ApplicationSet containing both NewRealDB and NewMockDB and let Wire choose automatically",
      "Create ProdSet = wire.NewSet(ApplicationSet, NewRealDB) and TestSet = wire.NewSet(ApplicationSet, NewMockDB), where ApplicationSet does not include any DB provider",
      "Wire does not support multiple injectors using different sets; provider functions must always be listed directly"
    ],
    "correctAnswerIndex": 2,
    "explanation": "The correct approach is to remove the DB provider from ApplicationSet and create separate <b>ProdSet</b> and <b>TestSet</b>, each composing ApplicationSet with its own DB provider: <code>var ProdSet = wire.NewSet(ApplicationSet, NewRealDB)</code>. Wire has no auto-select mechanism, and a set cannot contain two providers that return the same type."
  },
  {
    "id": "wire-ch04-q16",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "Which option represents the correct naming convention and location for a ProviderSet?",
    "options": [
      "Name it with a lowercase prefix such as setRepository and store it in cmd/wire.go",
      "Name it with an exported identifier such as RepositorySet and store it in the same package as the providers, e.g. internal/repository/wire.go",
      "Name it with a leading underscore such as _RepositorySet to signal that it is internal",
      "Store all sets together in main.go so the injector can access them easily"
    ],
    "correctAnswerIndex": 1,
    "explanation": "The good convention is an <b>exported</b> name (capitalized) such as <code>RepositorySet</code> or <code>ServiceSet</code>, placed in the <b>providers&apos; own package</b>, e.g. <code>internal/repository/wire.go</code>. This keeps the set close to the providers it groups, making it easy to maintain."
  },
  {
    "id": "wire-ch04-q17",
    "difficulty": "hard",
    "bloomLevel": "apply",
    "question": "You want to refactor a wire.Build that lists providers one by one into a layer-based set structure. Which approach is best?",
    "code": "// Original wire.Build\nwire.Build(\n\tNewPostgresDB,\n\tNewUserRepo,\n\tNewUserService,\n\twire.Bind(new(UserRepository), new(*UserRepo)),\n\tNewUserHandler,\n)",
    "options": [
      "Create InfraSet = wire.NewSet(NewPostgresDB, NewUserRepo, wire.Bind(new(UserRepository), new(*UserRepo))) and AppSet = wire.NewSet(NewUserService, NewUserHandler), then use wire.Build(InfraSet, AppSet)",
      "Create a single set: var AllSet = wire.NewSet(NewPostgresDB, NewUserRepo, NewUserService, wire.Bind(new(UserRepository), new(*UserRepo)), NewUserHandler)",
      "No refactoring needed — a long flat wire.Build list is already clear and readable",
      "Create a separate set for every provider, e.g. DBSet, UserRepoSet, UserServiceSet, UserHandlerSet"
    ],
    "correctAnswerIndex": 0,
    "explanation": "Splitting by layer is the best approach: <b>InfraSet</b> holds the DB, repo, and interface binding; <b>AppSet</b> holds the service and handler. Then <code>wire.Build(InfraSet, AppSet)</code> reads clearly. Adding a new repo only requires editing InfraSet. Creating a separate set for every single provider is over-engineering."
  },
  {
    "id": "wire-ch04-q18",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "SetA contains provider NewCache which requires *redis.Client, but the injector has no provider for *redis.Client and does not use *Cache in its return type at all. What does Wire do?",
    "options": [
      "Wire errors because NewCache has an unsatisfied dependency",
      "Wire automatically injects nil for *redis.Client",
      "Wire skips NewCache because *Cache has no consumer in the dependency graph",
      "Wire warns but still generates wire_gen.go"
    ],
    "correctAnswerIndex": 2,
    "explanation": "Wire performs <b>reachability analysis</b> starting from the injector's return type. If <code>*Cache</code> has no consumer in the graph, Wire <b>never includes NewCache</b> in wire_gen.go. The missing dependency for NewCache (<code>*redis.Client</code>) causes no problem because Wire never tries to resolve it."
  },
  {
    "id": "wire-ch04-q19",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "What types of arguments can wire.NewSet accept? (Choose the most complete answer.)",
    "options": [
      "Provider functions only",
      "Provider functions and other wire.ProviderSets only",
      "Provider functions, other wire.ProviderSets, wire.Bind, wire.Value, and struct literals",
      "Provider functions, other wire.ProviderSets, wire.Bind, and wire.Value"
    ],
    "correctAnswerIndex": 2,
    "explanation": "<code>wire.NewSet</code> accepts multiple argument types: <b>provider functions</b> (constructor functions), other <b>wire.ProviderSet</b>s (composition), <b>wire.Bind</b> (interface binding), <b>wire.Value</b> (constant values), and <b>struct literals</b> (a legacy form that is now deprecated, e.g. <code>wire.NewSet(MyStruct{})</code>). Wire also accepts wire.Struct, wire.InterfaceValue, and wire.FieldsOf, but they are not listed in the options. Among the choices given, this option is the most complete."
  },
  {
    "id": "wire-ch04-q20",
    "difficulty": "hard",
    "bloomLevel": "apply",
    "question": "A team has two services that both need *sql.DB but live in separate sets. There is only one NewPostgresDB() *sql.DB. Which design is correct?",
    "code": "// UserService needs *sql.DB\n// OrderService needs *sql.DB\n// There is only one NewPostgresDB() *sql.DB",
    "options": [
      "Put NewPostgresDB in both UserSet and OrderSet; Wire will deduplicate automatically",
      "Put NewPostgresDB in a separate shared set (e.g. InfraSet) and compose both UserSet and OrderSet with InfraSet",
      "Create two separate functions NewPostgresDBForUser and NewPostgresDBForOrder",
      "Use wire.Value(*sql.DB) instead of a provider function so both sets can share it"
    ],
    "correctAnswerIndex": 1,
    "explanation": "The correct approach is to place <code>NewPostgresDB</code> in a dedicated <b>InfraSet</b> (or DBSet). Neither UserSet nor OrderSet should include a DB provider. AppSet then composes InfraSet + UserSet + OrderSet. Wire sees NewPostgresDB exactly once and automatically shares the resulting <code>*sql.DB</code> with both services. Placing NewPostgresDB in both sets would cause a duplicate provider error."
  }
];
