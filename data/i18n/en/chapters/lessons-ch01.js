/* lessons ch01 (EN) */
(window.LESSONS_EN = window.LESSONS_EN || {}).ch01 = {
  "title": "Why Dependency Injection Matters",
  "sections": [
    {
      "type": "heading",
      "level": 2,
      "text": "What Is Dependency Injection and What Problem Does It Solve?"
    },
    {
      "type": "paragraph",
      "html": "In software development, <mark>Dependency Injection (DI)</mark> is a technique that lets a component <strong>avoid creating its own dependencies</strong> and instead receive them from the outside (for example, via a constructor or function parameter). The concept sounds simple, but it has three important consequences:"
    },
    {
      "type": "list",
      "ordered": false,
      "items": [
        "<strong>Reduced coupling</strong> — a component is not tied to a concrete implementation; it only needs to know what kind of interface it requires. You can swap implementations without touching the component.",
        "<strong>Higher testability</strong> — in a unit test you can pass in a mock or stub instead of the real dependency immediately, without connecting to a database or external service.",
        "<strong>Easy implementation swaps</strong> — want to switch from PostgreSQL to MySQL? Change it at the wire-up site only; no edits to the service file required."
      ]
    },
    {
      "type": "heading",
      "level": 2,
      "text": "The Problem with Manual Constructor Wiring"
    },
    {
      "type": "paragraph",
      "html": "Before understanding what Wire helps with, you need to feel <mark>the pain of wiring dependencies by hand</mark>. Take a look at the <code>main.go</code> of a typical application with several layers of dependencies:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "package main\n\nimport (\n\t\"log\"\n\t\"net/http\"\n\n\t\"github.com/example/app/config\"\n\t\"github.com/example/app/db\"\n\t\"github.com/example/app/repository\"\n\t\"github.com/example/app/service\"\n\t\"github.com/example/app/handler\"\n)\n\nfunc main() {\n\tcfg, err := config.Load()\n\tif err != nil {\n\t\tlog.Fatal(err)\n\t}\n\n\tdatabase, err := db.NewPostgres(cfg.DSN)\n\tif err != nil {\n\t\tlog.Fatal(err)\n\t}\n\n\tuserRepo := repository.NewUserRepository(database)\n\torderRepo := repository.NewOrderRepository(database)\n\n\tuserSvc := service.NewUserService(userRepo, cfg)\n\torderSvc := service.NewOrderService(orderRepo, userSvc, cfg)\n\n\tuserHandler := handler.NewUserHandler(userSvc)\n\torderHandler := handler.NewOrderHandler(orderSvc, userSvc)\n\n\tmux := http.NewServeMux()\n\tmux.HandleFunc(\"/users\", userHandler.ServeHTTP)\n\tmux.HandleFunc(\"/orders\", orderHandler.ServeHTTP)\n\n\tlog.Fatal(http.ListenAndServe(cfg.Addr, mux))\n}",
      "highlightLines": [
        16,
        21,
        24,
        25,
        27,
        28,
        30,
        31
      ],
      "annotations": [
        {
          "line": 16,
          "text": "<b>cfg</b> must always be created first because everything depends on config."
        },
        {
          "line": 21,
          "text": "<b>database</b> must be created by passing in cfg — order matters a lot here. Wrong order = compile error or nil panic."
        },
        {
          "line": 24,
          "text": "Both repositories need database — every time you add a new repository you have to come back and edit this spot."
        },
        {
          "line": 27,
          "text": "The service needs the repository <b>and</b> config — if NewUserService's signature changes, you must update main.go."
        },
        {
          "line": 30,
          "text": "A handler can only be created once its service is ready — the dependency graph is <b>encoded in code order</b>, which is fragile."
        }
      ]
    },
    {
      "type": "callout",
      "variant": "observe",
      "title": "Observation: Why Manual Wiring Is Fragile",
      "html": "As the project grows, <code>main.go</code> becomes a \"God file\" that knows the implementation details of every layer. If you add a new dependency to <code>NewOrderService</code> (say, an <code>EmailClient</code>), you must construct the <code>EmailClient</code> in main.go first and pass it in correctly. One mistake anywhere leads to a runtime panic that is hard to track down."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Constructor Injection vs Service Locator"
    },
    {
      "type": "paragraph",
      "html": "DI comes in several flavors, but the best one — and the one the Go community recommends — is <mark>Constructor Injection</mark>: pass dependencies directly through the constructor function. Compare it with the <strong>Service Locator</strong>, which is an anti-pattern to avoid:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// BAD: Service Locator pattern — anti-pattern\ntype ServiceLocator struct {\n\tservices map[string]interface{}\n}\n\nfunc (sl *ServiceLocator) Get(name string) interface{} {\n\treturn sl.services[name]\n}\n\nfunc NewOrderService(locator *ServiceLocator) *OrderService {\n\t// dependencies are hidden inside locator; the signature tells you nothing\n\tuserSvc := locator.Get(\"userService\").(*UserService)\n\treturn &OrderService{userSvc: userSvc}\n}\n\n// GOOD: Constructor Injection — dependencies are explicit in the signature\nfunc NewOrderServiceGood(orderRepo OrderRepository, userSvc *UserService, cfg *Config) *OrderService {\n\treturn &OrderService{\n\t\torderRepo: orderRepo,\n\t\tuserSvc:   userSvc,\n\t\tcfg:       cfg,\n\t}\n}",
      "highlightLines": [
        11,
        12,
        17
      ],
      "annotations": [
        {
          "line": 11,
          "text": "<b>The core problem</b> with Service Locator: looking at the signature alone tells you nothing about what dependencies the function needs — you must read the entire body."
        },
        {
          "line": 12,
          "text": "The type assertion <code>.(*UserService)</code> happens at runtime — if the wrong type was registered, it will panic at runtime."
        },
        {
          "line": 17,
          "text": "<b>Good Constructor Injection</b>: every dependency appears clearly in the signature, and the compiler checks types immediately."
        }
      ]
    },
    {
      "type": "callout",
      "variant": "warning",
      "title": "Why Service Locator Is an Anti-Pattern",
      "html": "Service Locator hides dependencies inside a global registry, making it <strong>impossible to know a component's dependencies from its signature alone</strong> — you have to read all the code. Unit testing is painful because you must set up the locator before each test, and errors usually surface at runtime when a key is missing or has the wrong type."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Runtime DI vs Compile-time DI"
    },
    {
      "type": "paragraph",
      "html": "As projects grow, manual wiring becomes increasingly tedious, so developers turn to <mark>DI frameworks</mark>. Those frameworks fall into two broad camps with very different trade-offs:"
    },
    {
      "type": "list",
      "ordered": false,
      "items": [
        "<strong>Runtime DI (Reflection-based)</strong> — e.g. <code>uber-go/dig</code>, <code>uber-go/fx</code> in Go or Spring Framework in Java. The framework reads constructor types via reflection at runtime and builds the dependency graph automatically.",
        "<strong>Compile-time DI (Code Generation)</strong> — e.g. <code>google/wire</code> in Go. The tool reads the \"providers\" you write and <strong>generates Go source code</strong> that wires dependencies before the actual compile step."
      ]
    },
    {
      "type": "callout",
      "variant": "note",
      "title": "Downsides of Runtime DI (e.g. dig/fx)",
      "html": "<strong>Errors at runtime</strong> — if a provider is missing or types don't match, you only find out when you run the program, not at build time.<br><strong>Reflection overhead</strong> — every startup must use reflection to reconstruct the dependency graph (small but present).<br><strong>Harder to debug</strong> — stack traces through reflection are difficult to read; it's not clear which part of the code triggered the error."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Google Wire: Compile-time DI for Go"
    },
    {
      "type": "paragraph",
      "html": "<mark>Google Wire</mark> solves all of this with a remarkably simple approach: <strong>Wire is not a library that runs inside your program</strong>. It is a <em>code generation tool</em> that reads the \"providers\" (constructor functions) you write and produces <code>wire_gen.go</code> — ordinary Go code that fully wires dependencies before the real compile step. The result:"
    },
    {
      "type": "list",
      "ordered": false,
      "items": [
        "<strong>Errors at build time</strong> — if a provider is missing, Wire errors immediately when you run <code>wire gen</code>, before compilation.",
        "<strong>Zero reflection / zero runtime overhead</strong> — <code>wire_gen.go</code> is plain Go code with no runtime magic whatsoever.",
        "<strong>Generated code is readable</strong> — open <code>wire_gen.go</code> and read it directly; it looks like manual wiring that Wire wrote for you.",
        "<strong>The compiler checks everything</strong> — full type safety, because it is just ordinary Go code."
      ]
    },
    {
      "type": "heading",
      "level": 3,
      "text": "Comparison Example: Before vs After Wire"
    },
    {
      "type": "paragraph",
      "html": "A short example to make it concrete (Wire API details are covered in the next chapter) — the left side is manual wiring you would write yourself; the right side is what Wire <strong>generates automatically</strong>:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// === What the developer writes: wire.go (not main.go) ===\n//go:build wireinject\n\npackage main\n\nimport \"github.com/google/wire\"\n\n// InitializeApp tells Wire we need a *App.\n// Wire will find all necessary providers on its own.\nfunc InitializeApp(configPath string) (*App, error) {\n\twire.Build(\n\t\tconfig.Load,\n\t\tdb.NewPostgres,\n\t\trepository.NewUserRepository,\n\t\trepository.NewOrderRepository,\n\t\tservice.NewUserService,\n\t\tservice.NewOrderService,\n\t\thandler.NewUserHandler,\n\t\thandler.NewOrderHandler,\n\t\tNewApp,\n\t)\n\treturn nil, nil // Wire will replace this body with real code\n}\n\n// === Wire generates this in wire_gen.go ===\n//go:build !wireinject\n\nfunc InitializeApp(configPath string) (*App, error) {\n\tcfg, err := config.Load(configPath)\n\tif err != nil {\n\t\treturn nil, err\n\t}\n\tdatabase, err := db.NewPostgres(cfg.DSN)\n\tif err != nil {\n\t\treturn nil, err\n\t}\n\tuserRepo := repository.NewUserRepository(database)\n\torderRepo := repository.NewOrderRepository(database)\n\tuserSvc := service.NewUserService(userRepo, cfg)\n\torderSvc := service.NewOrderService(orderRepo, userSvc, cfg)\n\tuserHandler := handler.NewUserHandler(userSvc)\n\torderHandler := handler.NewOrderHandler(orderSvc, userSvc)\n\treturn NewApp(userHandler, orderHandler, cfg), nil\n}",
      "highlightLines": [
        2,
        11,
        22,
        26,
        28,
        29
      ],
      "annotations": [
        {
          "line": 2,
          "text": "The build tag <code>//go:build wireinject</code> <b>excludes this file from the real build</b> — it is only present when running wire gen."
        },
        {
          "line": 11,
          "text": "The developer only <b>lists the providers</b> (constructor functions) in wire.Build — no need to worry about order."
        },
        {
          "line": 22,
          "text": "<code>return nil, nil</code> is a placeholder — Wire replaces it with real code in wire_gen.go; you never write it yourself."
        },
        {
          "line": 26,
          "text": "The build tag <code>//go:build !wireinject</code> ensures wire_gen.go is <b>included in the real build</b> instead of wire.go — this is always required, otherwise the compiler sees two definitions of InitializeApp."
        },
        {
          "line": 28,
          "text": "Wire generates <b>plain, readable Go code</b> — identical to what you would write by hand in main.go, but always correct."
        },
        {
          "line": 29,
          "text": "Wire computes the <b>correct order</b> of constructor calls from the dependency graph automatically — ordering mistakes are impossible."
        }
      ]
    },
    {
      "type": "callout",
      "variant": "tip",
      "title": "Best Practice: Providers Are Ordinary Constructors",
      "html": "Notice that <code>config.Load</code>, <code>db.NewPostgres</code>, etc. are plain Go functions you already write. <strong>No signature changes are needed</strong> to use them with Wire. Every piece of code remains testable and usable without going through Wire."
    },
    {
      "type": "callout",
      "variant": "warning",
      "title": "Wire Is Not a Service Locator and Has No Runtime Container",
      "html": "Wire has <strong>no global registry</strong>, no <code>container.Get(\"serviceName\")</code>, and <strong>no Wire code runs inside the production binary</strong> at all. What runs is <code>wire_gen.go</code> — ordinary Go code — no different from what you would write by hand."
    },
    {
      "type": "callout",
      "variant": "note",
      "title": "Not Every Project Needs a DI Framework",
      "html": "For a small microservice or CLI tool with only a few dependency layers, <strong>manual wiring in main.go may be perfectly sufficient</strong>. Wire pays off most when the dependency graph is complex, you have multiple environments (prod/staging/test) that need different implementations, or a medium-to-large team that wants wiring to be explicit and auditable."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Chapter 1 Summary"
    },
    {
      "type": "paragraph",
      "html": "We have seen how <mark>Dependency Injection</mark> addresses coupling, testability, and implementation swaps. We saw that <strong>manual wiring becomes fragile</strong> as projects grow, and we understood the difference between Constructor Injection (good) and Service Locator (anti-pattern). We then compared Runtime DI (errors at runtime, reflection overhead) with <strong>Compile-time DI such as Google Wire</strong> (errors at build time, zero overhead, readable generated code). In the next chapter we will install Wire and write our first provider."
    }
  ]
};
