/* questions ch06 (EN) */
(window.QUESTIONS_EN = window.QUESTIONS_EN || {}).ch06 = [
  {
    "id": "wire-ch06-q01",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "What does wire.Struct(new(T), \"*\") mean?",
    "options": [
      "Creates a pointer to T without injecting any fields",
      "Tells Wire to inject all exported fields of T from the dependency graph",
      "Tells Wire to automatically call a constructor function named NewT",
      "Creates T and injects every field including unexported fields"
    ],
    "correctAnswerIndex": 1,
    "explanation": "<code>wire.Struct(new(T), \"*\")</code> tells Wire to create <code>T</code> by automatically populating <strong>all exported fields</strong> from the dependency graph. Wire generates code equivalent to <code>&amp;T{FieldA: a, FieldB: b, ...}</code>. No constructor is called, and unexported fields are skipped."
  },
  {
    "id": "wire-ch06-q02",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "Which code correctly uses wire.Struct to inject only the DB and Logger fields of ReportHandler?",
    "options": [
      "wire.Struct(new(ReportHandler), \"DB\", \"Logger\")",
      "wire.Struct(ReportHandler{}, \"DB\", \"Logger\")",
      "wire.Struct(new(ReportHandler), \"*DB\", \"*Logger\")",
      "wire.Struct(&ReportHandler{}, \"DB\", \"Logger\")"
    ],
    "correctAnswerIndex": 0,
    "explanation": "The correct syntax is <code>wire.Struct(new(T), \"FieldName\", ...)</code>. The first argument must always be <code>new(T)</code>, not <code>T{}</code> or <code>&amp;T{}</code>. Field names are plain strings with no leading <code>*</code>."
  },
  {
    "id": "wire-ch06-q03",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "What code does Wire generate when it encounters wire.Struct(new(AppHandler), \"DB\", \"Logger\") in wire.Build?",
    "options": [
      "Calls NewAppHandler(db, logger) if that function exists",
      "Declares var h AppHandler then sets h.DB = db and h.Logger = logger on separate lines",
      "Generates no additional code — it only validates that the fields exist",
      "Creates the struct literal &AppHandler{DB: db, Logger: logger}"
    ],
    "correctAnswerIndex": 3,
    "explanation": "Wire generates the struct literal <code>&amp;AppHandler{DB: db, Logger: logger}</code> directly, resolving the values of <code>db</code> and <code>logger</code> from the dependency graph just as it would for ordinary constructor parameters."
  },
  {
    "id": "wire-ch06-q04",
    "difficulty": "easy",
    "bloomLevel": "understand",
    "question": "Why can unexported fields not be injected by wire.Struct?",
    "options": [
      "Because wire.Struct only works within the same package where the struct is declared, so it cannot see unexported fields from other packages",
      "Because unexported fields are not accessible from other packages, so Wire cannot generate code that sets those fields",
      "Because Wire requires every field to have a pointer type",
      "Because the Go runtime always sets unexported fields to their zero value automatically"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Wire generates ordinary Go code in a separate package (or the injector package). <strong>Unexported fields of a struct in another package are not accessible</strong>, so Wire has no way to generate code that sets them. A constructor function living in the same package must be used instead."
  },
  {
    "id": "wire-ch06-q05",
    "difficulty": "easy",
    "bloomLevel": "understand",
    "question": "Given wire.Struct(new(Server), \"*\") and Server has fields DB *sql.DB, Logger *slog.Logger, mu sync.Mutex — which fields will Wire inject?",
    "code": "type Server struct {\n\tDB     *sql.DB\n\tLogger *slog.Logger\n\tmu     sync.Mutex\n}",
    "options": [
      "Injects DB, Logger, and mu — all three",
      "Injects only DB because Logger and mu are not pointer types",
      "Errors immediately because the struct contains an unexported field",
      "Injects only DB and Logger because mu is an unexported field"
    ],
    "correctAnswerIndex": 3,
    "explanation": "When using <code>\"*\"</code>, Wire injects only <strong>exported fields</strong>: <code>DB</code> and <code>Logger</code>. <code>mu</code> is an unexported field and is silently skipped — no error is raised. Wire does not error simply because a struct contains unexported fields."
  },
  {
    "id": "wire-ch06-q06",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "What is the main difference between wire.Struct and a constructor function as a provider?",
    "options": [
      "wire.Struct is faster than a constructor because Wire uses reflection to inject fields directly",
      "wire.Struct creates a struct literal directly and has no initialization logic, while a constructor function can contain logic such as validation or opening connections",
      "wire.Struct supports error returns but constructor functions do not",
      "wire.Struct and constructor functions are completely equivalent — either can always be used interchangeably"
    ],
    "correctAnswerIndex": 1,
    "explanation": "<code>wire.Struct</code> generates only a struct literal <code>&amp;T{Field: val, ...}</code> with no other code executing. It is appropriate when a struct simply bundles dependencies. A <strong>constructor function</strong> can contain logic such as validating config, opening connections, initializing channels, or returning an error. When you need that logic, a constructor is required."
  },
  {
    "id": "wire-ch06-q07",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "Consider this code — will Wire error? Why?",
    "code": "type NotifHandler struct {\n\tDB      *sql.DB\n\tMailer  *mailer.Client\n\tVersion string\n}\n\nwire.Build(\n\tprovideDB,\n\tprovideMailer,\n\twire.Struct(new(NotifHandler), \"*\"),\n)",
    "options": [
      "No error — Version is a string so Wire sets it to empty string automatically",
      "Error because there is no provider for string in wire.Build",
      "Error because Version is an unexported field",
      "No error — wire.Struct automatically skips fields that have no provider"
    ],
    "correctAnswerIndex": 1,
    "explanation": "<code>Version string</code> is an exported field, so when using <code>\"*\"</code> Wire will attempt to inject a <code>string</code> value from the graph. There is no provider for <code>string</code> in <code>wire.Build</code>, so Wire errors: <code>no provider for string</code>. Fix it by naming only the fields to inject: <code>wire.Struct(new(NotifHandler), \"DB\", \"Mailer\")</code>, or add a provider for string (e.g. <code>wire.Value(\"v1.0.0\")</code>)."
  },
  {
    "id": "wire-ch06-q08",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "Which approach correctly fixes wire.Struct so that the Version field is not injected?",
    "code": "type NotifHandler struct {\n\tDB      *sql.DB\n\tMailer  *mailer.Client\n\tVersion string // should not be injected\n}",
    "options": [
      "wire.Struct(new(NotifHandler), \"*\") and add wire.Ignore(\"Version\") to wire.Build",
      "Change Version to version (lowercase) to make it unexported, then use wire.Struct(new(NotifHandler), \"*\")",
      "wire.Struct(new(NotifHandler), \"DB\", \"Mailer\") — name only the fields to inject",
      "wire.Struct(new(NotifHandler), \"DB\", \"Mailer\", \"-Version\") — prefix with \"-\" to exclude"
    ],
    "correctAnswerIndex": 2,
    "explanation": "The correct and clearest approach is to <strong>name only the fields to inject</strong>: <code>wire.Struct(new(NotifHandler), \"DB\", \"Mailer\")</code>. Wire has no <code>wire.Ignore</code> and does not recognize a <code>\"-FieldName\"</code> syntax. Lowercasing the field would also work but changes the struct's API, which may not be appropriate."
  },
  {
    "id": "wire-ch06-q09",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "What happens when wire is run against this code?",
    "code": "func NewAppHandler(db *sql.DB, l *slog.Logger) *AppHandler {\n\treturn &AppHandler{DB: db, Logger: l}\n}\n\nfunc InitApp() *AppHandler {\n\twire.Build(\n\t\tprovideDB,\n\t\tprovideLogger,\n\t\tNewAppHandler,\n\t\twire.Struct(new(AppHandler), \"*\"),\n\t)\n\treturn nil\n}",
    "options": [
      "Wire uses wire.Struct because it is listed last",
      "Wire uses NewAppHandler because it is a function provider",
      "Wire error: multiple bindings for *AppHandler",
      "Wire creates two instances of *AppHandler, one per provider"
    ],
    "correctAnswerIndex": 2,
    "explanation": "Wire requires <strong>exactly one provider</strong> per type. Both <code>NewAppHandler</code> and <code>wire.Struct(new(AppHandler), \"*\")</code> are providers for <code>*AppHandler</code>. Having two providers for the same type causes Wire to error: <code>multiple bindings for *AppHandler</code>. You must choose one approach."
  },
  {
    "id": "wire-ch06-q10",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "Can wire.Struct be placed inside wire.NewSet?",
    "code": "var HandlerSet = wire.NewSet(\n\twire.Struct(new(AppHandler), \"*\"),\n)",
    "options": [
      "No — wire.Struct can only be used directly inside wire.Build",
      "Yes — wire.Struct can be an element of wire.NewSet just like a provider function",
      "Yes, but you must use wire.NewSet(wire.Struct(new(T))) with no field arguments",
      "No — you must write wire.StructSet(new(AppHandler), \"*\") instead"
    ],
    "correctAnswerIndex": 1,
    "explanation": "<code>wire.Struct(...)</code> can be an element of <code>wire.NewSet</code> directly, just like any provider function. This lets you bundle <code>wire.Struct</code> with other providers in the same layer."
  },
  {
    "id": "wire-ch06-q11",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "When should you use a constructor function instead of wire.Struct?",
    "options": [
      "When a struct has more than 5 fields because wire.Struct supports at most 5 fields",
      "When you need to initialize unexported fields or have logic such as validation or opening a connection in the constructor",
      "When the struct is in a different package from the injector package",
      "When a struct has more than 10 exported fields because wire.Struct supports at most 10 fields"
    ],
    "correctAnswerIndex": 1,
    "explanation": "<code>wire.Struct</code> is appropriate when a struct simply bundles dependencies with no special logic. When you need to <strong>initialize unexported fields</strong>, validate input, open connections, create channels, or perform any initialization logic, a constructor function is required. wire.Struct has no field count limit."
  },
  {
    "id": "wire-ch06-q12",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "Consider this code — what is the problem?",
    "code": "// package service\ntype OrderService struct {\n\trepo    OrderRepository  // unexported\n\tmailer  MailSender       // unexported\n\tLogger  *slog.Logger     // exported\n}\n\n// wire.go\nwire.Build(\n\tprovideRepo,\n\tprovideMailer,\n\tprovideLogger,\n\twire.Struct(new(service.OrderService), \"*\"),\n)",
    "options": [
      "No problem — Wire injects Logger and silently skips repo and mailer",
      "Wire injects only Logger, but repo and mailer receive no value, so OrderService will malfunction at runtime",
      "Wire errors because repo and mailer are unexported fields named by \"*\"",
      "Wire injects all fields including unexported ones because provideRepo and provideMailer are present in wire.Build"
    ],
    "correctAnswerIndex": 1,
    "explanation": "When using <code>\"*\"</code>, Wire injects only <strong>exported fields</strong> — only <code>Logger</code>. <code>repo</code> and <code>mailer</code> are unexported and are silently skipped with no error. However, <code>OrderService</code> will have <code>repo</code> and <code>mailer</code> as <code>nil</code> at runtime, which will likely cause a panic when they are used. A constructor function must be used instead to initialize unexported fields."
  },
  {
    "id": "wire-ch06-q13",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "A developer says \"wire.Struct reduces encapsulation because it forces fields to be exported.\" Which response evaluates this claim most accurately?",
    "options": [
      "Completely wrong — wire.Struct does not require fields to be exported at all",
      "Correct, and it is a serious problem that makes structs automatically non-thread-safe",
      "Partially correct — fields must indeed be exported, letting other packages access them, but for leaf nodes such as handlers this trade-off is usually acceptable; if encapsulation matters more, use a constructor instead",
      "Correct, and this is why the Go community recommends never using wire.Struct"
    ],
    "correctAnswerIndex": 2,
    "explanation": "The claim is <strong>partially correct</strong>: <code>wire.Struct</code> can only inject exported fields, meaning other packages can read or set those fields directly. However, for <em>leaf components</em> such as HTTP handlers that nothing else depends on, this trade-off is usually acceptable in practice. For domain objects or repositories requiring stronger encapsulation, a constructor should be used."
  },
  {
    "id": "wire-ch06-q14",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "Consider this code — what is the result?",
    "code": "type CacheService struct {\n\tClient  *redis.Client\n\tLogger  *slog.Logger\n\tTTL     time.Duration\n}\n\nvar CacheSet = wire.NewSet(\n\tprovideRedis,\n\tprovideLogger,\n\tprovideTTL, // return type: time.Duration\n\twire.Struct(new(CacheService), \"*\"),\n)",
    "options": [
      "Wire error because time.Duration is not a pointer type and cannot be used as a provider",
      "Wire generates code that injects Client, Logger, and TTL from the providers in the set",
      "Wire injects only Client and Logger because TTL is a value type, not a pointer",
      "Wire error because wire.Struct does not support non-pointer field types"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Wire does not require providers to return pointers — they can return value types such as <code>time.Duration</code>, <code>int</code>, or plain structs. As long as <code>provideTTL</code> returns <code>time.Duration</code> and <code>CacheService.TTL</code> is <code>time.Duration</code>, Wire will match the types and inject correctly. All three fields are injected."
  },
  {
    "id": "wire-ch06-q15",
    "difficulty": "hard",
    "bloomLevel": "apply",
    "question": "A team wants to refactor AppHandler from a constructor function to wire.Struct — what is the correct sequence of steps?",
    "code": "// before refactor\nfunc NewAppHandler(db *sql.DB, l *slog.Logger, cfg *config.App) *AppHandler {\n\treturn &AppHandler{DB: db, Logger: l, Config: cfg}\n}",
    "options": [
      "Delete NewAppHandler, ensure the db, logger, and config fields are exported if they are not already, then replace NewAppHandler in wire.Build with wire.Struct(new(AppHandler), \"*\")",
      "Keep NewAppHandler and also add wire.Struct(new(AppHandler), \"*\") to wire.Build",
      "Change NewAppHandler to return an interface instead of *AppHandler, then use wire.Struct",
      "Delete NewAppHandler and use wire.Struct(new(AppHandler), \"NewAppHandler\") to reference the old constructor"
    ],
    "correctAnswerIndex": 0,
    "explanation": "The correct refactor steps are: (1) <strong>Delete</strong> the constructor function — keeping it would create a duplicate provider; (2) Ensure every field that needs injection is <strong>exported</strong>; (3) <strong>Replace</strong> the constructor name with <code>wire.Struct(new(AppHandler), \"*\")</code> in wire.Build or the provider set."
  },
  {
    "id": "wire-ch06-q16",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "Given this struct — should you use wire.Struct or a constructor function?",
    "code": "type DBPool struct {\n\tHost     string\n\tPort     int\n\tMaxConns int\n\tconn     *sql.DB // unexported, must open connection using Host and Port\n}",
    "options": [
      "Use wire.Struct(new(DBPool), \"*\") because all exported fields are present",
      "Use wire.Struct(new(DBPool), \"Host\", \"Port\", \"MaxConns\") and Wire will handle conn automatically",
      "Use a constructor function because initialization logic is needed to open the connection and set the unexported field conn",
      "Use wire.Struct together with wire.Value for the conn field"
    ],
    "correctAnswerIndex": 2,
    "explanation": "<code>DBPool</code> has an unexported field <code>conn *sql.DB</code> that must be initialized with special logic (using Host and Port to open a connection). This is a clear case for a <strong>constructor function</strong> such as <code>NewDBPool(host string, port int, max int) (*DBPool, error)</code>, because it involves both initialization logic and an unexported field that must be set. <code>wire.Struct</code> is not appropriate here."
  },
  {
    "id": "wire-ch06-q17",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "How do wire.Struct(new(T), \"*\") and wire.Struct(new(T), \"FieldA\") differ when T has only one exported field, FieldA?",
    "options": [
      "They are identical — both produce exactly the same result",
      "wire.Struct(new(T), \"*\") injects all fields including unexported ones, while wire.Struct(new(T), \"FieldA\") injects only FieldA",
      "They produce the same result now, but wire.Struct(new(T), \"FieldA\") is more explicit in intent and prevents breakage if the struct gains a new exported field later",
      "wire.Struct(new(T), \"*\") will error because \"*\" requires more than one exported field"
    ],
    "correctAnswerIndex": 2,
    "explanation": "When T has only one exported field the two produce identical results <em>right now</em>. However, if the struct gains a new exported field with no provider later on, using <code>\"*\"</code> will cause Wire to error automatically, whereas naming the field explicitly will continue to work. Neither form injects unexported fields."
  },
  {
    "id": "wire-ch06-q18",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "A team uses GatewayHandler with wire.Struct and \"*\", then adds a new exported field MetricsSvc *metrics.Service without adding a provider to wire.Build — what happens?",
    "code": "type GatewayHandler struct {\n\tDB         *sql.DB\n\tLogger     *slog.Logger\n\tMetricsSvc *metrics.Service // newly added\n}",
    "options": [
      "Wire injects DB and Logger normally; MetricsSvc is nil and the app continues to run",
      "Wire errors at wire gen time: no provider for *metrics.Service — caught before compilation",
      "Wire automatically creates a metrics.Service because it is a struct type",
      "The app compiles but panics at runtime when a MetricsSvc method is called"
    ],
    "correctAnswerIndex": 1,
    "explanation": "This is a <strong>strength of Wire</strong>: when a new exported field is added to a struct using <code>\"*\"</code> and no provider exists for that type in the graph, Wire <strong>errors immediately at wire gen time</strong> before the code can compile. The developer receives a message such as <code>no provider for *metrics.Service</code> right away — not a nil pointer panic at runtime."
  },
  {
    "id": "wire-ch06-q19",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "Which code correctly uses wire.Struct inside wire.NewSet?",
    "options": [
      "var Set = wire.NewSet(wire.Struct(new(MyHandler), \"DB\", \"Logger\"))",
      "var Set = wire.NewSet(wire.Struct{Type: MyHandler{}, Fields: []string{\"DB\", \"Logger\"}})",
      "var Set = wire.NewSet().AddStruct(new(MyHandler), \"DB\", \"Logger\")",
      "var Set = wire.StructSet(new(MyHandler), \"DB\", \"Logger\")"
    ],
    "correctAnswerIndex": 0,
    "explanation": "<code>wire.Struct(new(T), \"F1\", \"F2\")</code> returns a value that can be passed directly to <code>wire.NewSet(...)</code>, just like any provider function. Therefore <code>var Set = wire.NewSet(wire.Struct(new(MyHandler), \"DB\", \"Logger\"))</code> is the correct syntax. The other options use Wire API calls that do not exist."
  },
  {
    "id": "wire-ch06-q20",
    "difficulty": "hard",
    "bloomLevel": "apply",
    "question": "A team has two structs: UserHandler (needs DB, Logger injected) and AdminHandler (needs DB, Logger, AuditLog injected), both using wire.Struct. What is the best way to organize the provider sets?",
    "code": "type UserHandler struct {\n\tDB     *sql.DB\n\tLogger *slog.Logger\n}\n\ntype AdminHandler struct {\n\tDB       *sql.DB\n\tLogger   *slog.Logger\n\tAuditLog *audit.Logger\n}",
    "options": [
      "var HandlerSet = wire.NewSet(wire.Struct(new(UserHandler), \"*\"), wire.Struct(new(AdminHandler), \"*\"))",
      "Create two separate sets, UserSet and AdminSet, but do not compose them together",
      "Use wire.Struct(new(UserHandler), \"DB\", \"Logger\") and wire.Struct(new(AdminHandler), \"DB\", \"Logger\", \"AuditLog\") and place both in the same wire.NewSet",
      "Both option 1 and option 3 are correct and produce identical results"
    ],
    "correctAnswerIndex": 3,
    "explanation": "Both approaches produce identical results: (1) using <code>\"*\"</code> for both — Wire injects all exported fields, which are exactly the fields needed; (2) naming fields explicitly — more explicit and prevents breakage if a struct gains new fields. Both can coexist in the same <code>wire.NewSet</code>. The choice between them comes down to team preference."
  },
  {
    "id": "wire-ch06-q21",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "What must the first argument of wire.Struct be?",
    "options": [
      "The type name, e.g. AppHandler",
      "&AppHandler{} or AppHandler{}",
      "reflect.TypeOf(AppHandler{})",
      "new(T) always, e.g. new(AppHandler)"
    ],
    "correctAnswerIndex": 3,
    "explanation": "The first argument of <code>wire.Struct</code> must always be <code>new(T)</code>, e.g. <code>new(AppHandler)</code>, which returns <code>*AppHandler</code> that Wire uses to extract type information. You cannot use <code>AppHandler{}</code>, <code>&amp;AppHandler{}</code>, or reflection."
  },
  {
    "id": "wire-ch06-q22",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "Which option most completely describes the trade-off of wire.Struct?",
    "options": [
      "wire.Struct reduces boilerplate but fields must be exported, which reduces encapsulation",
      "wire.Struct is faster than a constructor and supports unexported fields better",
      "wire.Struct suits every struct in a Go project with no downsides",
      "wire.Struct reduces binary size but slightly increases startup time"
    ],
    "correctAnswerIndex": 0,
    "explanation": "The primary trade-off of <code>wire.Struct</code> is that it <strong>reduces boilerplate</strong> (no constructor needed) at the cost of requiring <strong>exported fields</strong>, which allows other packages to access those fields directly (slightly reduced encapsulation). It also cannot contain initialization logic. There is no effect on binary size or startup time."
  }
];
