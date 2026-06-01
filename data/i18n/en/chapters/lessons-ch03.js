/* lessons ch03 (EN) */
(window.LESSONS_EN = window.LESSONS_EN || {}).ch03 = {
  "title": "What Is a Provider and wire.Build",
  "sections": [
    {
      "type": "heading",
      "level": 2,
      "text": "What Is a Provider?"
    },
    {
      "type": "paragraph",
      "html": "In Google Wire, a <mark>provider</mark> is simply a <strong>plain Go function</strong> that constructs and returns a value of a particular type — exactly like the constructors you write every day. No special API to learn. Wire reads the <strong>return type</strong> of that function as the \"key\" to know what kind of value this provider supplies."
    },
    {
      "type": "callout",
      "variant": "observe",
      "title": "Key Insight: Wire Uses Type as the Key — Not the Name",
      "html": "Wire matches dependencies <strong>by Go type alone</strong>. The function name, parameter names, or variable names <em>mean nothing</em> to Wire. If two provider functions both return <code>*sql.DB</code>, Wire will error immediately — even if they have different names."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Provider Signatures"
    },
    {
      "type": "paragraph",
      "html": "Wire supports two main provider signature forms and allows <strong>parameters to be dependencies</strong> that Wire must resolve:"
    },
    {
      "type": "list",
      "ordered": false,
      "items": [
        "<code>func NewFoo(dep1 A, dep2 B) *Foo</code> — single return value (no error)",
        "<code>func NewFoo(dep1 A, dep2 B) (*Foo, error)</code> — return value with error (Wire will propagate the error up to the injector)",
        "Each parameter is a dependency that Wire must obtain from another provider",
        "exported (<code>NewFoo</code>) or unexported (<code>newFoo</code>) — follow your package conventions"
      ]
    },
    {
      "type": "code",
      "lang": "go",
      "code": "package main\n\nimport \"database/sql\"\n\n// Provider 1: no dependencies — returns *sql.DB\nfunc NewDB() (*sql.DB, error) {\n\treturn sql.Open(\"postgres\", \"host=localhost dbname=myapp\")\n}\n\n// Provider 2: requires *sql.DB — Wire injects it from NewDB\nfunc NewUserRepo(db *sql.DB) *UserRepo {\n\treturn &UserRepo{db: db}\n}\n\n// Provider 3: requires *UserRepo — Wire injects it from NewUserRepo\nfunc NewUserService(repo *UserRepo) *UserService {\n\treturn &UserService{repo: repo}\n}",
      "highlightLines": [6, 7, 11, 15],
      "annotations": [
        {
          "line": 6,
          "text": "Return type <code>(*sql.DB, error)</code> — Wire knows this provider supplies <b>*sql.DB</b> and may fail"
        },
        {
          "line": 7,
          "text": "No parameters = no dependencies — Wire can call this immediately without waiting for any other provider"
        },
        {
          "line": 11,
          "text": "Parameter <code>db *sql.DB</code> is a dependency — Wire finds the provider that returns <b>*sql.DB</b> and passes it here (which is NewDB)"
        },
        {
          "line": 15,
          "text": "Wire builds the dependency chain automatically: NewDB → NewUserRepo → NewUserService"
        }
      ]
    },
    {
      "type": "callout",
      "variant": "warning",
      "title": "*T and T Are Different Types to Wire",
      "html": "If a provider returns <code>*UserRepo</code> but a consumer expects <code>UserRepo</code> (no pointer), Wire will <strong>not match them</strong> and will error immediately. Keep pointer vs. value consistent between provider return types and parameter types at every point."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "wire.Build — Listing Providers for Wire"
    },
    {
      "type": "paragraph",
      "html": "<code>wire.Build(...)</code> is the call used inside an injector stub to tell Wire <strong>which providers are available</strong> for building the dependency graph. Wire traces back from the injector's return type to find all required providers — essentially performing a topological sort on the dependency graph."
    },
    {
      "type": "code",
      "lang": "go",
      "code": "//go:build wireinject\n\npackage main\n\nimport \"github.com/google/wire\"\n\n// InitializeUserService is the injector stub\n// Wire reads this file and generates wire_gen.go in its place\nfunc InitializeUserService() (*UserService, error) {\n\twire.Build(\n\t\tNewDB,          // provides *sql.DB\n\t\tNewUserRepo,    // provides *UserRepo  (needs *sql.DB)\n\t\tNewUserService, // provides *UserService (needs *UserRepo)\n\t)\n\treturn nil, nil // placeholder — Wire replaces this with the real code\n}",
      "highlightLines": [1, 9, 10, 15],
      "annotations": [
        {
          "line": 1,
          "text": "Build tag <code>//go:build wireinject</code> is required — without it, when <code>wire_gen.go</code> also exists, the compiler will error with <code>InitializeUserService redeclared</code> because the injector function is defined in two files"
        },
        {
          "line": 9,
          "text": "Return type <code>(*UserService, error)</code> is the \"target\" Wire must build — Wire traces back to find the necessary providers"
        },
        {
          "line": 10,
          "text": "<code>wire.Build(...)</code> accepts provider functions (and provider sets) — <strong>order does not matter</strong>; Wire figures out the correct order from types"
        },
        {
          "line": 15,
          "text": "<code>return nil, nil</code> is only a placeholder — Wire generates the real body in <code>wire_gen.go</code>; any other logic placed here has no effect"
        }
      ]
    },
    {
      "type": "heading",
      "level": 2,
      "text": "What Wire Generates: wire_gen.go"
    },
    {
      "type": "paragraph",
      "html": "When you run <code>wire</code> (or <code>go generate</code>), Wire reads the stub and produces <code>wire_gen.go</code> — plain Go code that <strong>calls constructors in the correct order</strong> and fully propagates errors:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "//go:build !wireinject\n\n// Code generated by Wire. DO NOT EDIT.\n// wire_gen.go\n\npackage main\n\nfunc InitializeUserService() (*UserService, error) {\n\tdb, err := NewDB()\n\tif err != nil {\n\t\treturn nil, err\n\t}\n\tuserRepo := NewUserRepo(db)\n\tuserService := NewUserService(userRepo)\n\treturn userService, nil\n}",
      "highlightLines": [1, 3, 8, 9, 13, 14],
      "annotations": [
        {
          "line": 1,
          "text": "Build tag <code>!wireinject</code> — this file is used during the real compile (the stub is excluded)"
        },
        {
          "line": 3,
          "text": "This file is generated by Wire — <strong>do not edit by hand</strong>; it will be overwritten every time you run wire"
        },
        {
          "line": 9,
          "text": "Wire handles errors from NewDB automatically — propagating them up to the caller"
        },
        {
          "line": 13,
          "text": "Wire always computes the correct call order: NewDB → NewUserRepo → NewUserService"
        }
      ]
    },
    {
      "type": "callout",
      "variant": "tip",
      "title": "Order Inside wire.Build Does Not Matter",
      "html": "You do not need to list providers in <code>wire.Build</code> in dependency order. Wire calculates the correct order from the type graph itself. Therefore <code>wire.Build(NewUserService, NewDB, NewUserRepo)</code> and <code>wire.Build(NewDB, NewUserRepo, NewUserService)</code> produce identical results."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Reading the Dependency Graph"
    },
    {
      "type": "paragraph",
      "html": "The easiest way to trace a dependency graph is to start from the <strong>injector's return type</strong> and ask \"what parameters does this type require?\" — then repeat for each dependency until you reach providers with no parameters (leaf nodes):"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// Injector needs *UserService\n//\n// *UserService ← NewUserService(repo *UserRepo)\n//                           ↑\n//               *UserRepo ← NewUserRepo(db *sql.DB)\n//                                       ↑\n//                        *sql.DB ← NewDB()  ← leaf: no dependencies\n//\n// Wire reads this graph and generates the correct code\n\nfunc InitializeUserService() (*UserService, error) {\n\twire.Build(NewDB, NewUserRepo, NewUserService)\n\treturn nil, nil\n}",
      "highlightLines": [3, 5, 7, 12],
      "annotations": [
        {
          "line": 3,
          "text": "Wire starts here — needs *UserService so it looks for a provider that returns <b>*UserService</b>"
        },
        {
          "line": 5,
          "text": "NewUserService needs *UserRepo — Wire looks for a provider that returns <b>*UserRepo</b>"
        },
        {
          "line": 7,
          "text": "NewDB has no parameters — this is a leaf node; Wire stops here and knows the graph is complete"
        },
        {
          "line": 12,
          "text": "Just three lines to list — Wire figures out all the ordering and wiring for us"
        }
      ]
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Common Pitfalls and Error Messages"
    },
    {
      "type": "callout",
      "variant": "warning",
      "title": "Pitfall 1: Missing Provider",
      "html": "If you forget to include a provider in <code>wire.Build</code>, Wire errors immediately, e.g.:\n<code>wire: no provider found for *main.UserRepo</code>\nFix it by adding the missing provider to <code>wire.Build(...)</code>."
    },
    {
      "type": "callout",
      "variant": "warning",
      "title": "Pitfall 2: Duplicate Provider (Ambiguous Binding)",
      "html": "If two providers return the same type, Wire does not know which to choose:\n<code>wire: *main.UserRepo is provided twice</code>\nFix it by removing the unwanted provider from <code>wire.Build</code> — Wire has no priority mechanism for providers that return the same concrete type (<code>wire.Bind</code> is only for interface binding, covered in Chapter 5)."
    },
    {
      "type": "callout",
      "variant": "warning",
      "title": "Pitfall 3: Logic Outside wire.Build Has No Effect",
      "html": "Wire only reads the single <code>wire.Build(...)</code> call in the injector body. Everything else written outside wire.Build is completely ignored during code generation:<br><br><code>func Init() *App {<br>&nbsp;&nbsp;x := computeSomething() // ← Wire never reads this line<br>&nbsp;&nbsp;wire.Build(NewApp)<br>&nbsp;&nbsp;return nil<br>}</code>"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Complete Example: 3-Level Provider Chain"
    },
    {
      "type": "paragraph",
      "html": "Here is a fully working example in a single file to give you an overview of the provider chain:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// providers.go\npackage main\n\nimport \"database/sql\"\n\ntype Config struct{ DSN string }\ntype UserRepo struct{ db *sql.DB }\ntype UserService struct{ repo *UserRepo }\n\n// Provider: no dependencies\nfunc NewDB(cfg Config) (*sql.DB, error) {\n\treturn sql.Open(\"postgres\", cfg.DSN)\n}\n\n// Provider: requires *sql.DB\nfunc NewUserRepo(db *sql.DB) *UserRepo {\n\treturn &UserRepo{db: db}\n}\n\n// Provider: requires *UserRepo\nfunc NewUserService(repo *UserRepo) *UserService {\n\treturn &UserService{repo: repo}\n}\n\n// wire.go  (//go:build wireinject must be on the first line)\nfunc InitApp(cfg Config) (*UserService, error) {\n\twire.Build(NewDB, NewUserRepo, NewUserService)\n\treturn nil, nil\n}",
      "highlightLines": [11, 16, 21, 26, 27],
      "annotations": [
        {
          "line": 11,
          "text": "NewDB takes a Config struct as a dependency — Wire needs either a provider for Config or for the caller to pass it as an injector parameter"
        },
        {
          "line": 16,
          "text": "NewUserRepo returns <code>*UserRepo</code> (pointer) — every consumer must accept <code>*UserRepo</code>, not <code>UserRepo</code>"
        },
        {
          "line": 21,
          "text": "Complete chain: Config → *sql.DB → *UserRepo → *UserService"
        },
        {
          "line": 26,
          "text": "The injector accepts <code>cfg Config</code> as a parameter — Wire treats the caller as the provider of Config, so no Config provider is needed in wire.Build"
        },
        {
          "line": 27,
          "text": "Three providers listed — Wire builds the full dependency graph and generates the complete code"
        }
      ]
    },
    {
      "type": "callout",
      "variant": "note",
      "title": "Injector Parameters Are \"Provided Values\" Supplied by the Caller",
      "html": "When an injector has a parameter such as <code>func InitApp(cfg Config)</code>, Wire treats <code>Config</code> as already provided by the caller and will not look for a provider for <code>Config</code> in <code>wire.Build</code>. This means you do not need to write a provider for values that come from outside (e.g. config loaded before wire runs)."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Chapter 3 Summary"
    },
    {
      "type": "paragraph",
      "html": "A provider is a <strong>plain Go constructor function</strong> — Wire uses its return type as the key and its parameters as dependencies. <code>wire.Build(...)</code> lists all providers in the system, and Wire traces the dependency graph backward from the injector's return type to generate <code>wire_gen.go</code> that calls constructors in the correct order. Key pitfalls: <mark>Wire matches by type, not by name</mark>, <code>*T ≠ T</code>, and logic outside <code>wire.Build</code> has absolutely no effect."
    }
  ]
};
