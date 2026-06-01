/* questions ch05 (EN) */
(window.QUESTIONS_EN = window.QUESTIONS_EN || {}).ch05 = [
  {
    "id": "wire-ch05-q01",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "What is wire.Bind used for in Google Wire?",
    "options": [
      "Telling Wire which concrete type to use when a dependency requires a given interface",
      "Automatically generating a concrete type from an interface",
      "Binding a provider to a package so Wire can locate it faster",
      "Forcing Wire to always use pointer types instead of value types"
    ],
    "correctAnswerIndex": 0,
    "explanation": "<b>wire.Bind</b> tells Wire: \"when a dependency needs interface X, use concrete type Y\". Because Wire matches dependencies by exact type, <code>Logger</code> (interface) and <code>*ConsoleLogger</code> (concrete) are different keys for Wire, so the binding must be declared explicitly."
  },
  {
    "id": "wire-ch05-q02",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "What is the correct syntax for wire.Bind?",
    "options": [
      "wire.Bind(new(*Concrete), new(Interface))",
      "wire.Bind(Interface, Concrete)",
      "wire.Bind(new(Interface), new(*Concrete))",
      "wire.Bind(*Concrete, Interface)"
    ],
    "correctAnswerIndex": 2,
    "explanation": "<code>wire.Bind(new(Interface), new(*Concrete))</code> is the correct form: <b>arg 1</b> is the interface to bind, <b>arg 2</b> is the concrete type that satisfies it. Both arguments must always be <code>new(...)</code>, and the order must not be swapped."
  },
  {
    "id": "wire-ch05-q03",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "Where can wire.Bind be placed?",
    "options": [
      "Only inside wire.Build",
      "Only inside wire.NewSet",
      "Either inside wire.Build or inside wire.NewSet",
      "Only directly in the injector function body, outside wire.Build"
    ],
    "correctAnswerIndex": 2,
    "explanation": "<code>wire.Bind</code> can be placed in either location: directly inside <code>wire.Build(...)</code> or inside <code>wire.NewSet(...)</code>. Placing it in <code>wire.NewSet</code> is recommended for real projects because the binding can then be reused across injectors."
  },
  {
    "id": "wire-ch05-q04",
    "difficulty": "easy",
    "bloomLevel": "understand",
    "question": "Why does Wire not automatically convert *ConsoleLogger to the Logger interface, even though *ConsoleLogger implements Logger?",
    "options": [
      "Because Go does not allow pointer types to implement interfaces",
      "Because Wire only supports concrete types and does not support interfaces at all",
      "Because *ConsoleLogger is an unexported type and cannot implement an interface",
      "Because Wire matches dependencies by exact type — Logger and *ConsoleLogger are different keys for Wire"
    ],
    "correctAnswerIndex": 3,
    "explanation": "Wire uses the <b>provider&#39;s return type as the key</b> when building the dependency graph, so <code>*ConsoleLogger</code> and <code>Logger</code> are distinct keys. Wire performs no implicit interface conversion because doing so would make the graph ambiguous — that is exactly why <code>wire.Bind</code> must be used to declare the mapping explicitly."
  },
  {
    "id": "wire-ch05-q05",
    "difficulty": "easy",
    "bloomLevel": "understand",
    "question": "You want to bind the Logger interface to *ConsoleLogger, and the provider returns *ConsoleLogger. How should you write the wire.Bind call?",
    "options": [
      "wire.Bind(new(ConsoleLogger), new(Logger))",
      "wire.Bind(new(*Logger), new(ConsoleLogger))",
      "wire.Bind(new(Logger), new(*ConsoleLogger))",
      "wire.Bind(new(Logger), new(ConsoleLogger))"
    ],
    "correctAnswerIndex": 2,
    "explanation": "<code>wire.Bind(new(Logger), new(*ConsoleLogger))</code> is correct: arg 1 = <code>Logger</code> interface, arg 2 = <code>*ConsoleLogger</code> (pointer), matching the provider&#39;s return type. Option D is wrong because it uses the value type <code>ConsoleLogger</code>, which does not match the provider that returns a pointer."
  },
  {
    "id": "wire-ch05-q06",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "Review the following code and identify what is wrong.",
    "code": "var Set = wire.NewSet(\n    wire.Bind(new(UserRepository), new(*postgresUserRepo)),\n)",
    "options": [
      "The argument order of wire.Bind is reversed and must be swapped",
      "The set is missing a provider function that returns *postgresUserRepo",
      "wire.NewSet does not support wire.Bind; it must be placed in wire.Build instead",
      "new(postgresUserRepo) should be used instead of new(*postgresUserRepo)"
    ],
    "correctAnswerIndex": 1,
    "explanation": "This set is missing a <b>provider for *postgresUserRepo</b>. <code>wire.Bind</code> does not create a provider — it only tells Wire \"if UserRepository is needed, use *postgresUserRepo\". Wire still needs to know how to construct *postgresUserRepo, meaning <code>NewPostgresUserRepo</code> or another provider must also be in the set."
  },
  {
    "id": "wire-ch05-q07",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "A developer wrote the following wire.Bind call but Wire errors. What is the cause?",
    "code": "func NewConsoleLogger() *ConsoleLogger {\n    return &ConsoleLogger{}\n}\n\nvar Set = wire.NewSet(\n    NewConsoleLogger,\n    wire.Bind(new(Logger), new(ConsoleLogger)), // no *\n)",
    "options": [
      "wire.NewSet does not support mixing providers and wire.Bind in the same set",
      "There is no error because Go automatically converts ConsoleLogger to *ConsoleLogger",
      "wire.Bind arg 2 is new(ConsoleLogger) (value type), which does not match the provider that returns *ConsoleLogger",
      "Logger interface cannot be used with wire.Bind; only concrete types are allowed"
    ],
    "correctAnswerIndex": 2,
    "explanation": "Provider <code>NewConsoleLogger</code> returns <code>*ConsoleLogger</code> (pointer), but <code>wire.Bind</code> specifies <code>ConsoleLogger</code> (value type, no *). Wire will look for a provider returning <code>ConsoleLogger</code> as a value but find none. The fix is to write <code>wire.Bind(new(Logger), new(*ConsoleLogger))</code> to match the provider&#39;s exact return type."
  },
  {
    "id": "wire-ch05-q08",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "You want to create a test injector that uses MockRepo instead of the real PostgreSQL repo, where MockRepo implements the UserRepository interface. How should you write it?",
    "code": "// Production set (already in use)\nvar ProdSet = wire.NewSet(\n    NewPostgresRepo,\n    wire.Bind(new(UserRepository), new(*PostgresRepo)),\n)\n\n// Test injector — wants to use MockRepo instead\nfunc InitTestService(mock *MockRepo) *UserService {\n    wire.Build( /* ??? */ )\n    return nil\n}",
    "options": [
      "wire.Build(ProdSet, service.NewUserService) and Wire will auto-detect MockRepo",
      "wire.Build(wire.Bind(new(UserRepository), new(*MockRepo)), service.NewUserService)",
      "wire.Build(MockRepo{}, service.NewUserService)",
      "wire.Build(wire.Bind(new(*MockRepo), new(UserRepository)), service.NewUserService)"
    ],
    "correctAnswerIndex": 1,
    "explanation": "The test injector must declare <code>wire.Bind(new(UserRepository), new(*MockRepo))</code> to map UserRepository to MockRepo. The mock parameter is automatically treated as a \"given value\" by Wire because it is a parameter of the injector — no separate provider function is needed. Option D is wrong because the arguments are swapped."
  },
  {
    "id": "wire-ch05-q09",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "Which statement best describes the relationship between wire.Bind and a provider function?",
    "options": [
      "wire.Bind adds a mapping edge in the dependency graph declaring which concrete type satisfies an interface, but a provider for the concrete type must still be present",
      "wire.Bind automatically generates a new provider function, so no separate provider is needed",
      "wire.Bind is shorthand for writing a provider function that returns an interface",
      "wire.Bind replaces the original provider function, so no provider for the concrete type is needed afterward"
    ],
    "correctAnswerIndex": 0,
    "explanation": "<code>wire.Bind</code> <b>adds an edge in the dependency graph</b> declaring \"interface X is satisfied by concrete Y\", but Wire still needs to know how to construct Y. Therefore a provider for the concrete type must always exist in the set or wire.Build. wire.Bind neither creates nor replaces a provider."
  },
  {
    "id": "wire-ch05-q10",
    "difficulty": "medium",
    "bloomLevel": "analyze",
    "question": "You have two interfaces, Logger and Metrics, and two concrete types, *ZapLogger (implementing Logger) and *PrometheusMetrics (implementing Metrics). You need to bind both. How should you write the wire.NewSet?",
    "options": [
      "wire.NewSet(NewZapLogger, NewPrometheusMetrics, wire.Bind(new(Logger), new(Metrics), new(*ZapLogger), new(*PrometheusMetrics)))",
      "wire.NewSet(NewZapLogger, NewPrometheusMetrics, wire.Bind(new(Logger), new(*ZapLogger)), wire.Bind(new(Metrics), new(*PrometheusMetrics)))",
      "wire.NewSet(wire.Bind(new(Logger), new(*ZapLogger), new(Metrics), new(*PrometheusMetrics)))",
      "wire.NewSet(NewZapLogger, NewPrometheusMetrics, wire.Bind(new(*ZapLogger), new(Logger)), wire.Bind(new(*PrometheusMetrics), new(Metrics)))"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Each binding requires its own <code>wire.Bind</code> call — one call, one binding. So two calls are needed: <code>wire.Bind(new(Logger), new(*ZapLogger))</code> and <code>wire.Bind(new(Metrics), new(*PrometheusMetrics))</code>. Option D is wrong because the argument order inside each wire.Bind is swapped."
  },
  {
    "id": "wire-ch05-q11",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "The following provider function returns a value type (not a pointer). How should wire.Bind be written?",
    "code": "type Cache interface {\n    Get(key string) (string, bool)\n}\n\ntype InMemoryCache struct{}\n\nfunc (c InMemoryCache) Get(key string) (string, bool) { return \"\", false }\n\n// Provider returns a value type, not a pointer\nfunc NewInMemoryCache() InMemoryCache {\n    return InMemoryCache{}\n}",
    "options": [
      "wire.Bind(new(Cache), new(*InMemoryCache))",
      "wire.Bind(new(*Cache), new(InMemoryCache))",
      "wire.Bind(new(Cache), new(InMemoryCache))",
      "wire.Bind(new(InMemoryCache), new(Cache))"
    ],
    "correctAnswerIndex": 2,
    "explanation": "The provider returns <code>InMemoryCache</code> (value type, no *), so arg 2 of <code>wire.Bind</code> must be <code>new(InMemoryCache)</code>, not <code>new(*InMemoryCache)</code>. Key rule: <strong>arg 2 must match the provider&#39;s return type exactly</strong>, including pointer vs value."
  },
  {
    "id": "wire-ch05-q12",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "wire gen reports 'no provider found for service.UserRepository' even though NewPostgresRepo is already in wire.Build. What is the most likely cause?",
    "code": "func InitApp(db *sql.DB) *UserService {\n    wire.Build(\n        NewPostgresRepo, // returns *postgresRepo\n        NewUserService,  // requires UserRepository interface\n    )\n    return nil\n}",
    "options": [
      "NewPostgresRepo must accept *sql.DB as a parameter, so it cannot be used",
      "wire.Bind to map the UserRepository interface to *postgresRepo was not declared",
      "NewUserService must be declared before NewPostgresRepo in wire.Build",
      "Wire does not support unexported concrete types like postgresRepo"
    ],
    "correctAnswerIndex": 1,
    "explanation": "The error occurs because <code>NewUserService</code> requires <code>UserRepository</code> (interface) but Wire&#39;s graph only contains <code>*postgresRepo</code> (concrete). Wire does not perform implicit conversion — you must add <code>wire.Bind(new(UserRepository), new(*postgresRepo))</code> to wire.Build. Provider order in wire.Build is irrelevant, and Wire does support unexported concrete types."
  },
  {
    "id": "wire-ch05-q13",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "A developer wrote wire.Bind with the arguments in the wrong order as shown. What error will Wire report?",
    "code": "var Set = wire.NewSet(\n    NewConsoleLogger,\n    // wrong: concrete before interface\n    wire.Bind(new(*ConsoleLogger), new(Logger)),\n)",
    "options": [
      "Wire works fine because Wire is smart enough to figure out which one is the interface",
      "Wire errors because *ConsoleLogger is not an interface type",
      "Wire errors because Logger is not a concrete type with a provider",
      "Wire errors because there is a duplicate provider for Logger"
    ],
    "correctAnswerIndex": 1,
    "explanation": "<code>wire.Bind</code> requires the first arg to always be an interface type. When the arguments are swapped, Wire tries to treat <code>*ConsoleLogger</code> (a concrete pointer) as an interface, which is impossible. Wire will error during code generation, reporting that the first argument must be an interface type."
  },
  {
    "id": "wire-ch05-q14",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "Two injectors — production and test — live in the same wire.go file. Production uses ProdSet which contains a wire.Bind for *PostgresRepo, and the test injector wants to bind MockRepo instead. What problem can occur if done incorrectly?",
    "code": "func InitProd(db *sql.DB) *App {\n    wire.Build(repo.ProdSet, service.NewApp)\n    return nil\n}\n\nfunc InitTest(mock *MockRepo) *App {\n    wire.Build(\n        repo.ProdSet, // including ProdSet here — potential problem!\n        wire.Bind(new(repo.UserRepository), new(*MockRepo)),\n        service.NewApp,\n    )\n    return nil\n}",
    "options": [
      "No problem — Wire automatically picks the most recent binding",
      "Wire errors because there is a duplicate binding for the UserRepository interface — one from ProdSet and one from the new wire.Bind",
      "Wire errors because MockRepo has no provider inside ProdSet",
      "Wire merges both bindings, causing App to receive both PostgresRepo and MockRepo"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Including <code>ProdSet</code> (which binds UserRepository → *PostgresRepo) <b>and</b> a new wire.Bind (binding UserRepository → *MockRepo) inside the same wire.Build results in a <b>duplicate provider/binding</b> error for the UserRepository interface. The test injector should not include ProdSet — declare only the providers and bindings needed for the test."
  },
  {
    "id": "wire-ch05-q15",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "What is the best reason for designing a provider to return a concrete type (*ConsoleLogger) rather than an interface (Logger)?",
    "options": [
      "Because Wire does not support providers that return interface types",
      "Because an interface return type causes higher memory allocation than a concrete type",
      "Because Wire always requires pointer types, so interfaces are not permitted",
      "Because a concrete return type lets the caller know exactly which implementation they receive, allows binding to multiple interfaces, and allows direct use of the concrete type when needed"
    ],
    "correctAnswerIndex": 3,
    "explanation": "The Go Proverb \"accept interfaces, return structs\" applies here — a provider that returns a concrete type: (1) can be bound to <b>multiple interfaces</b> that the type implements, (2) allows callers that know they need the concrete type to use it directly, and (3) makes it clear which implementation is provided. Wire does technically support providers that return interfaces, but this is not recommended for the reasons above."
  },
  {
    "id": "wire-ch05-q16",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "You want both the EmailSender interface and the NotificationSender interface to map to the same *SMTPSender. How should you write the wire.NewSet?",
    "code": "type EmailSender interface { SendEmail(to, body string) error }\ntype NotificationSender interface { Notify(msg string) error }\n\ntype SMTPSender struct{ host string }\nfunc (s *SMTPSender) SendEmail(to, body string) error { return nil }\nfunc (s *SMTPSender) Notify(msg string) error          { return nil }\n\nfunc NewSMTPSender(host string) *SMTPSender {\n    return &SMTPSender{host: host}\n}",
    "options": [
      "wire.NewSet(NewSMTPSender, wire.Bind(new(EmailSender), new(NotificationSender), new(*SMTPSender)))",
      "wire.NewSet(NewSMTPSender, wire.Bind(new(EmailSender), new(*SMTPSender)), wire.Bind(new(NotificationSender), new(*SMTPSender)))",
      "wire.NewSet(NewSMTPSender, wire.Bind(new(*SMTPSender), new(EmailSender), new(NotificationSender)))",
      "wire.NewSet(NewSMTPSender) — both interfaces bind automatically because *SMTPSender implements both"
    ],
    "correctAnswerIndex": 1,
    "explanation": "You must call <code>wire.Bind</code> separately for each interface binding — one call per binding: <code>wire.Bind(new(EmailSender), new(*SMTPSender))</code> and <code>wire.Bind(new(NotificationSender), new(*SMTPSender))</code>. The fact that <code>*SMTPSender</code> implements both interfaces does not cause Wire to infer the bindings automatically — every binding must be declared explicitly."
  },
  {
    "id": "wire-ch05-q17",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "A developer wants to verify that wire.Bind worked correctly by inspecting the generated wire_gen.go. What should they expect to see when Logger is bound to *ConsoleLogger?",
    "options": [
      "A function wire_bind_Logger_ConsoleLogger() generated by Wire",
      "A var _ Logger = (*ConsoleLogger)(nil) interface check",
      "wire.Bind does not appear directly in wire_gen.go; instead Wire uses *ConsoleLogger wherever Logger is needed, so the generated code assigns *ConsoleLogger directly to a Logger variable",
      "A runtime binding map storing Logger → *ConsoleLogger as a lookup table"
    ],
    "correctAnswerIndex": 2,
    "explanation": "<code>wire.Bind</code> generates no special code in wire_gen.go — it is information used solely by Wire to build the dependency graph at generation time. The result is that wherever <code>Logger</code> is required, Wire writes code that passes <code>*ConsoleLogger</code> directly (a normal Go implicit interface assignment). There is no runtime lookup table because Wire is a compile-time tool."
  },
  {
    "id": "wire-ch05-q18",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "You already have a production provider set and want to create a separate set for tests that uses in-memory implementations throughout. What is the best approach?",
    "options": [
      "Edit ProdSet directly by adding a condition that selects the implementation based on an environment variable",
      "Create a separate TestSet with providers for the in-memory implementations and its own wire.Bind calls, then use TestSet in the test injector instead of ProdSet",
      "Reuse ProdSet but add //go:build test to the file containing the in-memory providers",
      "Call wire.Bind multiple times inside a single ProdSet using build tags to select bindings"
    ],
    "correctAnswerIndex": 1,
    "explanation": "The correct approach is to create a <b>separate TestSet</b> with in-memory providers and its own explicit <code>wire.Bind</code> calls. The test injector uses TestSet and the production injector uses ProdSet, kept fully separate. This prevents configurations from mixing and keeps each provider set independently reusable. Editing ProdSet directly or using build tags on providers adds complexity and makes the code harder to maintain."
  },
  {
    "id": "wire-ch05-q19",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "Which scenario is a clear signal that you should use interface + wire.Bind rather than depending on a concrete type directly?",
    "options": [
      "When the concrete type has more than 5 methods",
      "When the concrete type is always in the same package as the consumer",
      "When you need to swap implementations between production and test, or when multiple interchangeable implementations exist",
      "When the concrete type is always unexported"
    ],
    "correctAnswerIndex": 2,
    "explanation": "The primary reasons to reach for interface + <code>wire.Bind</code>: (1) <b>Testability</b> — swap in a mock in the test injector, (2) <b>Multiple implementations</b> — e.g., SQL vs NoSQL repository, (3) <b>Environment switching</b> — prod vs staging vs test. Having many methods, being in the same package, or being unexported are not sufficient reasons on their own to introduce an interface."
  },
  {
    "id": "wire-ch05-q20",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "A team added an interface to the service layer but forgot to add wire.Bind. What happens when wire gen runs?",
    "options": [
      "wire gen succeeds but the generated code is incorrect and will panic at runtime",
      "wire gen succeeds because Wire auto-detects that the concrete type implements the interface and binds them automatically",
      "wire gen silently skips the interface dependency without erroring, allowing compilation to proceed",
      "wire gen errors immediately reporting no provider for the interface type, before generating wire_gen.go"
    ],
    "correctAnswerIndex": 3,
    "explanation": "This is one of Wire&#39;s strengths: the error surfaces <b>at wire gen time</b>, before actual compilation. Wire reports <code>no provider found for InterfaceType</code>, which is a clear signal that <code>wire.Bind</code> is missing. Wire will never auto-detect bindings or silently produce an incorrect wire_gen.go."
  },
  {
    "id": "wire-ch05-q21",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "What form must both arguments to wire.Bind take?",
    "options": [
      "The type name directly, e.g. wire.Bind(Logger, ConsoleLogger)",
      "A nil pointer, e.g. wire.Bind((*Logger)(nil), (*ConsoleLogger)(nil))",
      "new(...) always, e.g. wire.Bind(new(Logger), new(*ConsoleLogger))",
      "reflect.TypeOf, e.g. wire.Bind(reflect.TypeOf(Logger{}), reflect.TypeOf(ConsoleLogger{}))"
    ],
    "correctAnswerIndex": 2,
    "explanation": "<code>wire.Bind</code> always requires <code>new(...)</code> for both arguments — <code>new(Interface)</code> for the interface and <code>new(*Concrete)</code> for the concrete type. This is a fixed Wire API requirement; you cannot pass bare type names or nil pointers."
  }
];
