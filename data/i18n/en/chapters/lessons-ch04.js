/* lessons ch04 (EN) */
(window.LESSONS_EN = window.LESSONS_EN || {}).ch04 = {
  "title": "Provider Sets and wire.NewSet",
  "sections": [
    {
      "type": "heading",
      "level": 2,
      "text": "Why Do We Need Provider Sets?"
    },
    {
      "type": "paragraph",
      "html": "In chapter 3 we passed providers one by one into <code>wire.Build(...)</code>, which works fine for small projects. But as the dependency graph grows, listing every provider in a single <code>wire.Build</code> call becomes noisy, and <strong>there is no way to reuse a group of providers across injectors</strong>. Wire provides <mark>wire.NewSet</mark> to group related providers together."
    },
    {
      "type": "callout",
      "variant": "observe",
      "title": "Observation: A Set Is a Static Grouping, Not a Runtime Object",
      "html": "<code>wire.NewSet(...)</code> <strong>does not create any object at runtime</strong>. It simply tells Wire that these providers belong together. Wire &ldquo;unfolds&rdquo; every set into a flat list of providers only during codegen. The generated <code>wire_gen.go</code> contains no trace of sets at all."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Creating Your First Provider Set"
    },
    {
      "type": "paragraph",
      "html": "The recommended approach is to declare <code>var XxxSet = wire.NewSet(...)</code> as a <strong>package-level variable</strong> in the same package as the providers, so other packages can import it easily. Here is an example for the repository layer:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// internal/repository/wire.go\npackage repository\n\nimport \"github.com/google/wire\"\n\n// RepositorySet groups all providers in the repository layer\nvar RepositorySet = wire.NewSet(\n\tNewPostgresDB,      // func NewPostgresDB(cfg Config) (*sql.DB, func(), error)\n\tNewUserRepository,  // func NewUserRepository(db *sql.DB) *UserRepository\n\tNewOrderRepository, // func NewOrderRepository(db *sql.DB) *OrderRepository\n)",
      "highlightLines": [7, 8, 9, 10],
      "annotations": [
        {
          "line": 7,
          "text": "<b>Declared as an exported package-level var</b> so other packages can import it and pass it to wire.Build"
        },
        {
          "line": 8,
          "text": "Infrastructure providers like the DB connection live in the same group as the repositories that depend on them"
        },
        {
          "line": 9,
          "text": "NewUserRepository and NewOrderRepository belong in the same set because they are in the same layer"
        },
        {
          "line": 10,
          "text": "Adding a new repository in the future? Change this one place — no need to touch the injector"
        }
      ]
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Grouping by Layer — Service Set and Handler Set"
    },
    {
      "type": "paragraph",
      "html": "The common convention is to split sets by architectural layer: <strong>repository &rarr; service &rarr; handler</strong>. Each layer declares its own set inside its own package:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// internal/service/wire.go\npackage service\n\nimport \"github.com/google/wire\"\n\nvar ServiceSet = wire.NewSet(\n\tNewUserService,  // func NewUserService(repo *repository.UserRepository) *UserService\n\tNewOrderService, // func NewOrderService(repo *repository.OrderRepository, u *UserService) *OrderService\n)\n\n// internal/handler/wire.go\npackage handler\n\nimport \"github.com/google/wire\"\n\nvar HandlerSet = wire.NewSet(\n\tNewUserHandler,  // func NewUserHandler(svc *service.UserService) *UserHandler\n\tNewOrderHandler, // func NewOrderHandler(svc *service.OrderService) *OrderHandler\n\tNewServeMux,     // func NewServeMux(u *UserHandler, o *OrderHandler) *http.ServeMux\n)",
      "highlightLines": [6, 16, 18, 19, 20],
      "annotations": [
        {
          "line": 6,
          "text": "ServiceSet only knows its own providers — it has no knowledge of RepositorySet. This <b>reduces coupling between layers</b>"
        },
        {
          "line": 16,
          "text": "HandlerSet lives separately in the handler package, making it easy to swap the handler suite without affecting the service layer"
        },
        {
          "line": 18,
          "text": "All providers in the same layer belong here — UserHandler, OrderHandler, and ServeMux are all part of the HTTP layer"
        },
        {
          "line": 20,
          "text": "NewServeMux takes *UserHandler and *OrderHandler as dependencies — Wire resolves both from the same HandlerSet"
        }
      ]
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Composing Sets — A Set That Contains Other Sets"
    },
    {
      "type": "paragraph",
      "html": "<mark>Set composition</mark> is the real power of <code>wire.NewSet</code> &mdash; you can build a top-level set that combines sub-sets from multiple layers. Wire unfolds every set recursively until it has a flat list of all providers:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// --- File 1: internal/app/set.go (normal file, NO build tag) ---\npackage app\n\nimport (\n\t\"github.com/google/wire\"\n\t\"github.com/example/app/internal/handler\"\n\t\"github.com/example/app/internal/repository\"\n\t\"github.com/example/app/internal/service\"\n)\n\n// ApplicationSet combines every layer into a single set\nvar ApplicationSet = wire.NewSet(\n\trepository.RepositorySet, // expands to NewPostgresDB, NewUserRepository, NewOrderRepository\n\tservice.ServiceSet,       // expands to NewUserService, NewOrderService\n\thandler.HandlerSet,       // expands to NewUserHandler, NewOrderHandler, NewServeMux\n)\n\n// --- File 2: internal/app/wire.go (injector stub — build tag MUST be first) ---\n//go:build wireinject\n\npackage app\n\nfunc InitializeApp(cfg Config) (*http.Server, func(), error) {\n\twire.Build(ApplicationSet, NewHTTPServer) // use a set instead of listing providers one by one\n\treturn nil, nil, nil\n}",
      "highlightLines": [12, 13, 14, 15, 19, 24],
      "annotations": [
        {
          "line": 12,
          "text": "<b>ApplicationSet</b> does not list providers directly; it references sub-sets from each layer. Declared in a normal file (no build tag)"
        },
        {
          "line": 13,
          "text": "Wire unfolds repository.RepositorySet into all of its contained providers — like inline expansion"
        },
        {
          "line": 14,
          "text": "service.ServiceSet is unfolded the same way — there is no nesting in the generated wire_gen.go"
        },
        {
          "line": 15,
          "text": "handler.HandlerSet covers the final layer — together Wire now has every provider it needs"
        },
        {
          "line": 19,
          "text": "<b>//go:build wireinject must be the very first line of the file</b>, before the package clause — this is a separate file from set.go"
        },
        {
          "line": 24,
          "text": "<b>wire.Build(ApplicationSet, NewHTTPServer)</b> — one line replaces a 7+ line list. Easy to read, easy to maintain"
        }
      ]
    },
    {
      "type": "callout",
      "variant": "tip",
      "title": "Convention: Declare Sets in the Providers' Own Package",
      "html": "Place <code>wire.go</code> (where the set is declared) inside the <strong>same package as the providers</strong>, e.g. <code>internal/repository/wire.go</code> declares <code>RepositorySet</code> &mdash; not at <code>internal/app/wire.go</code>. When providers change (added or removed), the developer edits that package and the set is right there alongside the providers."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Including wire.Bind and wire.Value Inside a Set"
    },
    {
      "type": "paragraph",
      "html": "<code>wire.NewSet</code> does not only accept provider functions. It accepts any <strong>Wire option</strong>, including <code>wire.Bind</code> (for binding an interface to a concrete type) and <code>wire.Value</code> (for injecting a constant value). Here is an example:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// internal/repository/wire.go\npackage repository\n\nimport (\n\t\"github.com/google/wire\"\n)\n\n// UserRepository is the interface consumed by the service layer\ntype UserRepository interface {\n\tFindByID(id int64) (*User, error)\n}\n\nvar RepositorySet = wire.NewSet(\n\tNewPostgresDB,\n\tNewPostgresUserRepo,                                   // returns *postgresUserRepo\n\twire.Bind(new(UserRepository), new(*postgresUserRepo)), // bind interface to concrete type\n)",
      "highlightLines": [13, 15, 16],
      "annotations": [
        {
          "line": 13,
          "text": "RepositorySet bundles both provider functions and wire.Bind together. Callers of this set do not need to know the details"
        },
        {
          "line": 15,
          "text": "NewPostgresUserRepo is the provider for *postgresUserRepo — it must be present before wire.Bind can work"
        },
        {
          "line": 16,
          "text": "<b>wire.Bind inside a set</b> — every injector that uses RepositorySet automatically gets this binding without repeating it"
        }
      ]
    },
    {
      "type": "callout",
      "variant": "note",
      "title": "wire.Value Inside a Set",
      "html": "<code>wire.Value(someValue)</code> can also be placed inside <code>wire.NewSet</code>. Use it when you want a constant (such as a default config or a hardcoded string) to be part of the set without a separate provider function. In practice this is uncommon &mdash; most teams prefer a provider function that returns the config instead."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Pitfall 1: Duplicate Providers Across Composed Sets"
    },
    {
      "type": "paragraph",
      "html": "When composing sets, Wire checks that <strong>no two providers return the same type</strong>. If the sets being composed contain providers with duplicate return types, Wire errors immediately:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// Example: two sets that each have a provider returning *sql.DB\n\nvar SetA = wire.NewSet(\n\tNewPostgresDB, // returns (*sql.DB, func(), error)\n)\n\nvar SetB = wire.NewSet(\n\tNewPostgresDB, // returns (*sql.DB, func(), error) — duplicate of SetA!\n)\n\nvar BrokenSet = wire.NewSet(SetA, SetB) // ERROR: duplicate provider for *sql.DB\n\n// Wire reports:\n// wire: multiple bindings for *sql.DB",
      "highlightLines": [4, 8, 11],
      "annotations": [
        {
          "line": 4,
          "text": "SetA has NewPostgresDB which returns *sql.DB"
        },
        {
          "line": 8,
          "text": "SetB has the same NewPostgresDB — duplicate! Wire uses the return type as a key; duplicates are never allowed"
        },
        {
          "line": 11,
          "text": "<b>wire.NewSet(SetA, SetB)</b> fails when running wire gen — not at compile time. Fix it before generating"
        }
      ]
    },
    {
      "type": "callout",
      "variant": "warning",
      "title": "Pitfall: Provider Duplicated in Both a Set and wire.Build",
      "html": "Another common mistake is <strong>including a provider in a set and then also passing that same provider directly to <code>wire.Build</code></strong>, e.g. <code>wire.Build(ApplicationSet, NewPostgresDB)</code> when ApplicationSet already contains NewPostgresDB. Wire will report a duplicate provider error. Fix it by placing the provider in exactly one location: either inside the set or directly in <code>wire.Build</code>."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Pitfall 2: A Set That Is Too Large to Reuse"
    },
    {
      "type": "paragraph",
      "html": "If you create a single <code>var EverythingSet = wire.NewSet(...all providers...)</code>, you cannot reuse only a portion of it, because Wire must resolve <strong>every type that providers in the set return</strong>. If an injector needs only some types but the set includes providers for types the injector does not need, and those types still have unsatisfied dependencies, Wire will error:"
    },
    {
      "type": "callout",
      "variant": "warning",
      "title": "Good to Know: Wire Skips Unused Providers",
      "html": "Wire only uses providers that are actually needed to resolve the injector&apos;s return type (<em>tree shaking</em> of the dependency graph). Providers with no consumer are ignored. So a large set still works, but the <strong>best practice</strong> is to group by layer/domain for readability and maintainability."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Complete Example: Refactoring a Long wire.Build into Sets"
    },
    {
      "type": "paragraph",
      "html": "A before-and-after comparison to illustrate everything covered in this chapter:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// === BEFORE: wire.go (//go:build wireinject must be the very first line, before package) ===\n//go:build wireinject\n\npackage app\n\nfunc InitApp(cfg Config) (*http.Server, func(), error) {\n\twire.Build(\n\t\trepository.NewPostgresDB,\n\t\trepository.NewUserRepository,\n\t\trepository.NewOrderRepository,\n\t\tservice.NewUserService,\n\t\tservice.NewOrderService,\n\t\thandler.NewUserHandler,\n\t\thandler.NewOrderHandler,\n\t\thandler.NewServeMux,\n\t\tNewHTTPServer,\n\t)\n\treturn nil, nil, nil\n}\n\n// === AFTER: a separate wire.go file (//go:build wireinject must still be the very first line) ===\n//go:build wireinject\n\npackage app\n\nfunc InitApp(cfg Config) (*http.Server, func(), error) {\n\twire.Build(\n\t\trepository.RepositorySet,\n\t\tservice.ServiceSet,\n\t\thandler.HandlerSet,\n\t\tNewHTTPServer,\n\t)\n\treturn nil, nil, nil\n}",
      "highlightLines": [7, 27, 29, 30, 31, 32],
      "annotations": [
        {
          "line": 2,
          "text": "<b>//go:build wireinject must be the very first line of the file</b>, before the package clause — this is a mandatory Go build constraint"
        },
        {
          "line": 7,
          "text": "Before: wire.Build must list every provider. Every new provider means editing this file"
        },
        {
          "line": 27,
          "text": "After: wire.Build has just 4 entries. It is immediately clear which layer each group comes from (this is a separate file from the BEFORE version)"
        },
        {
          "line": 29,
          "text": "repository.RepositorySet replaces the 3 lines above — adding a new repo? Update RepositorySet in one place"
        },
        {
          "line": 30,
          "text": "service.ServiceSet and handler.HandlerSet work the same way — each team owns and maintains its own set independently"
        },
        {
          "line": 32,
          "text": "NewHTTPServer is passed directly because it is a single app-level provider — no need to create a set for a solitary provider"
        }
      ]
    },
    {
      "type": "callout",
      "variant": "tip",
      "title": "Summary: Simple Rules for Designing Provider Sets",
      "html": "<strong>1. One set per layer/package</strong> &mdash; RepositorySet, ServiceSet, HandlerSet are separate<br><strong>2. Declare the set in the providers&apos; own package</strong> &mdash; not at the injector<br><strong>3. Do not create a set for a single provider</strong> &mdash; pass it directly to wire.Build<br><strong>4. A set does not instantiate anything</strong> &mdash; it is only metadata for Wire during codegen"
    }
  ]
};
