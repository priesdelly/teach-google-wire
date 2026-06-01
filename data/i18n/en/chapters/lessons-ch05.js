/* lessons ch05 (EN) */
(window.LESSONS_EN = window.LESSONS_EN || {}).ch05 = {
  "title": "wire.Bind — Binding an Interface to a Concrete Type",
  "sections": [
    {
      "type": "heading",
      "level": 2,
      "text": "The Problem: Wire Does Not Convert Interfaces Automatically"
    },
    {
      "type": "paragraph",
      "html": "In Go, we design components to <mark>depend on interfaces, not concrete types</mark>, making them easy to test and swap implementations without affecting consumers. But when using Wire there is one critical thing to understand: <strong>Wire matches dependencies by exact type</strong> — if a consumer needs <code>Logger</code> (an interface) but the provider returns <code>*ConsoleLogger</code> (a concrete pointer), Wire will <em>not</em> convert them automatically and will error immediately."
    },
    {
      "type": "callout",
      "variant": "observe",
      "title": "Note: Wire uses the type as the key for matching",
      "html": "Wire builds the dependency graph using the <strong>provider&#39;s return type as the key</strong>, so <code>*ConsoleLogger</code> and <code>Logger</code> are different keys for Wire, even though <code>*ConsoleLogger</code> implements <code>Logger</code>. This is exactly why <code>wire.Bind</code> exists."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "An Example That Causes an Error"
    },
    {
      "type": "paragraph",
      "html": "Consider a common situation: a <code>Logger</code> interface, a <code>*ConsoleLogger</code> that implements it, but <code>NewApp</code> requires <code>Logger</code> (the interface)."
    },
    {
      "type": "code",
      "lang": "go",
      "code": "package app\n\n// Logger is the interface every consumer depends on\ntype Logger interface {\n\tLog(msg string)\n}\n\n// ConsoleLogger is the concrete implementation\ntype ConsoleLogger struct{}\n\nfunc (c *ConsoleLogger) Log(msg string) {\n\tfmt.Println(msg)\n}\n\n// Provider: returns *ConsoleLogger (concrete pointer)\nfunc NewConsoleLogger() *ConsoleLogger {\n\treturn &ConsoleLogger{}\n}\n\n// App requires Logger (interface), not *ConsoleLogger\ntype App struct {\n\tlogger Logger\n}\n\nfunc NewApp(logger Logger) *App {\n\treturn &App{logger: logger}\n}",
      "highlightLines": [4, 17, 25],
      "annotations": [
        {
          "line": 4,
          "text": "The consumer requires the <b>Logger interface</b> — this is the type Wire will look for in the dependency graph."
        },
        {
          "line": 17,
          "text": "The provider returns <b>*ConsoleLogger</b> (concrete type) — Wire registers this key, not Logger."
        },
        {
          "line": 25,
          "text": "<b>Wire will error</b> here: it needs Logger but the graph only has *ConsoleLogger — use wire.Bind to tell Wire to satisfy Logger with *ConsoleLogger."
        }
      ]
    },
    {
      "type": "callout",
      "variant": "warning",
      "title": "The Error You Will See",
      "html": "Running <code>wire gen</code> produces an error like:<br><code>app/wire.go:10:2: no provider found for app.Logger</code><br>Wire says there is no provider for type <code>app.Logger</code>, even though <code>NewConsoleLogger</code> exists, because it provides <code>*ConsoleLogger</code>, not <code>Logger</code>."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "wire.Bind: The Solution"
    },
    {
      "type": "paragraph",
      "html": "<code>wire.Bind</code> is how you tell Wire: <strong>\"whenever anyone needs interface X, use concrete type Y\"</strong>. The syntax is <code>wire.Bind(new(Interface), new(*Concrete))</code>. Both arguments must always be <code>new(...)</code>; the first argument is the interface and the second is the concrete type."
    },
    {
      "type": "code",
      "lang": "go",
      "code": "//go:build wireinject\n\npackage app\n\nimport \"github.com/google/wire\"\n\n// Injector stub\nfunc InitializeApp() *App {\n\twire.Build(\n\t\tNewConsoleLogger,\n\t\twire.Bind(new(Logger), new(*ConsoleLogger)),\n\t\tNewApp,\n\t)\n\treturn nil\n}",
      "highlightLines": [10, 11],
      "annotations": [
        {
          "line": 10,
          "text": "A provider for <b>*ConsoleLogger</b> must be present first — wire.Bind does not create a provider itself; it only tells Wire to map the interface to this concrete type."
        },
        {
          "line": 11,
          "text": "<b>wire.Bind(new(Logger), new(*ConsoleLogger))</b>: arg 1 = the interface to satisfy, arg 2 = the concrete type that satisfies it — order matters, do not swap them."
        }
      ]
    },
    {
      "type": "callout",
      "variant": "tip",
      "title": "Easy Rule for wire.Bind",
      "html": "<code>wire.Bind(new(<b>Interface</b>), new(<b>*Concrete</b>))</code><br><strong>arg1</strong> = the interface the consumer needs (what is being \"bound to\")<br><strong>arg2</strong> = the concrete type the provider produces (what is \"bound\")<br>The pointer/value form of arg2 must match the provider&#39;s return type <em>exactly</em><br><strong>Note:</strong> use <code>new(*Concrete)</code> when the provider returns a pointer (<code>*Concrete</code>), but use <code>new(Concrete)</code> when the provider returns a value type (<code>Concrete</code>) — there is no universal form."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Placing wire.Bind Inside wire.NewSet"
    },
    {
      "type": "paragraph",
      "html": "In real projects, combine <code>wire.Bind</code> with a provider set so it can be reused across injectors. Placing <code>wire.Bind</code> inside <code>wire.NewSet</code> means every injector that uses the set automatically gets the binding."
    },
    {
      "type": "code",
      "lang": "go",
      "code": "package logger\n\nimport (\n\t\"fmt\"\n\t\"github.com/google/wire\"\n)\n\n// Logger is the interface every consumer depends on\ntype Logger interface {\n\tLog(msg string)\n}\n\n// ConsoleLogger implementation\ntype ConsoleLogger struct{}\n\nfunc (c *ConsoleLogger) Log(msg string) {\n\tfmt.Println(msg)\n}\n\nfunc NewConsoleLogger() *ConsoleLogger {\n\treturn &ConsoleLogger{}\n}\n\n// LoggerSet bundles the provider and binding together\n// Every injector that uses LoggerSet gets a Logger interface mapped to *ConsoleLogger\nvar LoggerSet = wire.NewSet(\n\tNewConsoleLogger,\n\twire.Bind(new(Logger), new(*ConsoleLogger)),\n)",
      "highlightLines": [26, 27, 28],
      "annotations": [
        {
          "line": 26,
          "text": "<b>wire.NewSet</b> accepts both providers and wire.Bind calls in the same set — always declare the set in the same file as its providers."
        },
        {
          "line": 27,
          "text": "<code>NewConsoleLogger</code> must be in the set alongside wire.Bind — order inside NewSet does not matter, but all pieces must be present."
        },
        {
          "line": 28,
          "text": "<code>wire.Bind</code> says: \"anyone needing Logger should use the *ConsoleLogger that NewConsoleLogger creates\" — it acts as an alias in the dependency graph."
        }
      ]
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Full Example: Repository Interface + Concrete Type"
    },
    {
      "type": "paragraph",
      "html": "A more realistic example: a <code>UserRepository</code> interface, a <code>postgresUserRepo</code> concrete type, binding them in a provider set, and a test injector that swaps in a mock."
    },
    {
      "type": "code",
      "lang": "go",
      "code": "package repo\n\nimport (\n\t\"database/sql\"\n\t\"github.com/google/wire\"\n)\n\n// UserRepository is the interface the service layer depends on\ntype UserRepository interface {\n\tFindByID(id int) (*User, error)\n\tSave(u *User) error\n}\n\n// postgresUserRepo is the concrete implementation (unexported)\ntype postgresUserRepo struct {\n\tdb *sql.DB\n}\n\nfunc (r *postgresUserRepo) FindByID(id int) (*User, error) { /* ... */ return nil, nil }\nfunc (r *postgresUserRepo) Save(u *User) error             { /* ... */ return nil }\n\n// NewPostgresUserRepo is the provider: returns *postgresUserRepo (concrete pointer)\nfunc NewPostgresUserRepo(db *sql.DB) *postgresUserRepo {\n\treturn &postgresUserRepo{db: db}\n}\n\n// RepositorySet bundles the provider and binding together\nvar RepositorySet = wire.NewSet(\n\tNewPostgresUserRepo,\n\twire.Bind(new(UserRepository), new(*postgresUserRepo)),\n)",
      "highlightLines": [9, 23, 28, 29, 30],
      "annotations": [
        {
          "line": 9,
          "text": "The service layer depends on the <b>UserRepository interface</b> — this lets you swap implementations without touching the service."
        },
        {
          "line": 23,
          "text": "The provider returns <b>*postgresUserRepo</b> (concrete pointer) — the second arg of wire.Bind must match this return type exactly, including the pointer <code>*</code>."
        },
        {
          "line": 28,
          "text": "<b>RepositorySet</b> is an exported var — other injectors can reuse this set."
        },
        {
          "line": 29,
          "text": "<code>NewPostgresUserRepo</code> must be in the set — wire.Bind requires a provider that produces *postgresUserRepo."
        },
        {
          "line": 30,
          "text": "<code>wire.Bind(new(UserRepository), new(*postgresUserRepo))</code> — tells Wire to use *postgresUserRepo to satisfy the UserRepository interface."
        }
      ]
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Test Injector: Swapping a Mock with wire.Bind"
    },
    {
      "type": "paragraph",
      "html": "One of the most valuable uses of <code>wire.Bind</code> is <mark>creating a test injector that swaps in a mock instead of the real implementation</mark> — simply change the binding in a separate injector."
    },
    {
      "type": "code",
      "lang": "go",
      "code": "//go:build wireinject\n\npackage main\n\nimport (\n\t\"github.com/google/wire\"\n\t\"myapp/repo\"\n\t\"myapp/service\"\n)\n\n// Production injector: uses real PostgreSQL\nfunc InitApp(db *sql.DB) *service.UserService {\n\twire.Build(\n\t\trepo.RepositorySet, // already contains wire.Bind for production\n\t\tservice.NewUserService,\n\t)\n\treturn nil\n}\n\n// Test injector: uses MockUserRepo instead\nfunc InitTestApp(mock *repo.MockUserRepo) *service.UserService {\n\twire.Build(\n\t\twire.Bind(new(repo.UserRepository), new(*repo.MockUserRepo)),\n\t\tservice.NewUserService,\n\t)\n\treturn nil\n}",
      "highlightLines": [14, 22, 23],
      "annotations": [
        {
          "line": 14,
          "text": "The production injector uses <b>RepositorySet</b>, which already contains the PostgreSQL binding — no need to redeclare wire.Bind."
        },
        {
          "line": 22,
          "text": "The test injector binds <b>MockUserRepo</b> instead — just change the second arg of wire.Bind and pass the mock as a parameter to the injector."
        },
        {
          "line": 23,
          "text": "<code>service.NewUserService</code> requires <code>repo.UserRepository</code> — Wire resolves it from the binding declared in that injector&#39;s wire.Build."
        }
      ]
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Common Pitfalls"
    },
    {
      "type": "list",
      "ordered": false,
      "items": [
        "<strong>Pitfall 1: Using wire.Bind without a provider for the concrete type</strong> — <code>wire.Bind</code> does not create a provider; it only maps the interface. You must have a function returning <code>*Concrete</code> in the set or <code>wire.Build</code>, otherwise Wire errors with: <code>no provider found for *Concrete</code>",
        "<strong>Pitfall 2: Swapping the argument order</strong> — <code>wire.Bind(new(*Concrete), new(Interface))</code> is wrong. The first arg must always be the interface; the second must always be the concrete type.",
        "<strong>Pitfall 3: Pointer vs value mismatch with the provider</strong> — if the provider returns <code>*ConsoleLogger</code>, you must use <code>new(*ConsoleLogger)</code>, not <code>new(ConsoleLogger)</code>. Wire treats <code>*T</code> and <code>T</code> as distinct types."
      ]
    },
    {
      "type": "callout",
      "variant": "warning",
      "title": "Pitfall: Forgetting wire.Bind and Wire Complaining About a Missing Provider",
      "html": "If you forget <code>wire.Bind</code> and a consumer requires an interface, Wire will report <code>no provider found for Logger</code> (or whichever interface type). This is the signal that you need to add <code>wire.Bind</code> to connect the interface to the concrete provider."
    },
    {
      "type": "callout",
      "variant": "warning",
      "title": "Pitfall: Pointer/Value Mismatch",
      "html": "If the provider returns <code>*ConsoleLogger</code> but you write <code>wire.Bind(new(Logger), new(ConsoleLogger))</code> (no <code>*</code>), Wire will error: <code>no provider found for ConsoleLogger</code>, because it is looking for a provider that returns the value type <code>ConsoleLogger</code> and finds none. Always use <code>new(*ConsoleLogger)</code> to match the provider&#39;s return type exactly."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "When to Use an Interface vs a Struct Directly"
    },
    {
      "type": "paragraph",
      "html": "You do not need interfaces everywhere. <code>wire.Bind</code> makes sense when there is a clear reason:"
    },
    {
      "type": "list",
      "ordered": false,
      "items": [
        "<strong>Use interface + wire.Bind when</strong>: you need to swap implementations between environments (prod vs test, real DB vs in-memory), there are multiple possible implementations (SQL vs NoSQL), or you need mocks in unit tests.",
        "<strong>Use a struct directly when</strong>: there is only one implementation and no plans to change it, the struct is an internal implementation detail not exposed across packages, or the team values simplicity first."
      ]
    },
    {
      "type": "callout",
      "variant": "note",
      "title": "Related Go Proverb",
      "html": "\"Accept interfaces, return structs\" — in the Wire context this means: <strong>consumers (parameters) should accept interfaces</strong>, while <strong>providers (return types) should return concrete types</strong>, then use <code>wire.Bind</code> to bridge the two. This pattern gives you maximum flexibility."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Chapter 5 Summary"
    },
    {
      "type": "paragraph",
      "html": "We learned that <mark>Wire matches dependencies by exact type</mark>, so you must use <code>wire.Bind(new(Interface), new(*Concrete))</code> to tell Wire which interface maps to which concrete type. Key rules: (1) the first arg is always the interface, (2) the second arg must match the provider&#39;s pointer/value return type exactly, (3) a provider for the concrete type must exist in the set or <code>wire.Build</code>. You can place <code>wire.Bind</code> inside <code>wire.NewSet</code> to reuse it across injectors, and create test injectors that swap mocks simply by changing the binding."
    }
  ]
};
