/* lessons ch02 (EN) */
(window.LESSONS_EN = window.LESSONS_EN || {}).ch02 = {
  "title": "Getting to Know Google Wire and Installation",
  "sections": [
    {
      "type": "heading",
      "level": 2,
      "text": "What Is the Wire CLI and Where Does It Fit in the Workflow"
    },
    {
      "type": "paragraph",
      "html": "<mark>Wire</mark> is a <strong>command-line tool</strong> that does one thing and does it well: it reads the injector stubs a developer writes, analyzes the dependency graph, and <strong>generates Go source code</strong> that fully wires up those dependencies. Wire is not a library that runs in your production binary — it runs during <code>go generate</code>, before the actual compile, and the output is a <code>wire_gen.go</code> file containing plain, readable Go code."
    },
    {
      "type": "callout",
      "variant": "note",
      "title": "Where Wire Fits in the Build Pipeline",
      "html": "<strong>1. Developer writes</strong> provider functions and an injector stub (<code>wire.go</code>)<br><strong>2. Run <code>wire</code></strong> (or <code>go generate</code>) → Wire produces <code>wire_gen.go</code><br><strong>3. Run <code>go build</code></strong> → the compiler includes <code>wire_gen.go</code> in the binary as normal<br>The Wire tool itself is not present in the binary — only the code it generated is."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Installing the Wire CLI"
    },
    {
      "type": "paragraph",
      "html": "The Wire CLI is installed with a single <code>go install</code> command and has no special dependencies — just Go 1.19+ and <code>$GOPATH/bin</code> (or <code>$GOBIN</code>) on your <code>$PATH</code>:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// Run in a terminal (not inside a Go file)\ngo install github.com/google/wire/cmd/wire@latest\n\n// Verify the installation succeeded\nwire --version\n// Should print: wire: version vX.X.X",
      "highlightLines": [2, 5],
      "annotations": [
        {
          "line": 2,
          "text": "<code>@latest</code> always pulls the newest version — swap it for <code>@v0.6.0</code> (or whichever version you need) to pin a specific release."
        },
        {
          "line": 5,
          "text": "If running <code>wire</code> gives a \"command not found\" error, check that <code>$(go env GOPATH)/bin</code> is on your PATH."
        }
      ]
    },
    {
      "type": "callout",
      "variant": "tip",
      "title": "Pin the Version in Team Projects",
      "html": "For projects with multiple contributors, pin the Wire version so everyone generates identical code. For example: <code>go install github.com/google/wire/cmd/wire@v0.6.0</code>. Document and enforce the same version in your CI pipeline."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "The Two-File Model: wire.go and wire_gen.go"
    },
    {
      "type": "paragraph",
      "html": "The heart of working with Wire is a clear split between two files: <mark>wire.go</mark>, which the developer writes by hand (the stub), and <mark>wire_gen.go</mark>, which Wire generates automatically. Both files live in the same package, but which one gets compiled in a given context is controlled by <strong>build tags</strong>."
    },
    {
      "type": "list",
      "ordered": false,
      "items": [
        "<strong>wire.go</strong> — written by hand, carries the build tag <code>//go:build wireinject</code>, serves as input for Wire to read, is <em>not</em> compiled during <code>go build</code>",
        "<strong>wire_gen.go</strong> — generated automatically by Wire, carries the build tag <code>//go:build !wireinject</code>, is compiled during <code>go build</code>, must <em>never</em> be edited by hand"
      ]
    },
    {
      "type": "heading",
      "level": 3,
      "text": "wire.go — The Hand-Written Injector Stub"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "//go:build wireinject\n// +build wireinject\n\npackage main\n\nimport (\n\t\"github.com/google/wire\"\n)\n\n//go:generate wire\n\n// InitializeApp is the injector function.\n// Wire reads the wire.Build call in the body and generates wire_gen.go.\nfunc InitializeApp(cfg Config) (*App, error) {\n\twire.Build(\n\t\tNewDatabase,\n\t\tNewRepository,\n\t\tNewService,\n\t\tNewApp,\n\t)\n\treturn nil, nil // throwaway: Wire replaces the entire body\n}",
      "highlightLines": [1, 2, 10, 15, 21],
      "annotations": [
        {
          "line": 1,
          "text": "<b>Critical</b>: this build tag tells the Go compiler \"do not compile this file during go build\" — Wire is the only tool that reads this file."
        },
        {
          "line": 2,
          "text": "The <code>// +build wireinject</code> line is the old format (Go 1.16 and below) — include both for compatibility, or just the first line if you target Go 1.17+."
        },
        {
          "line": 10,
          "text": "<code>//go:generate wire</code> tells <code>go generate</code> to run <code>wire</code> in this directory — you can run <code>go generate ./...</code> from the project root."
        },
        {
          "line": 15,
          "text": "<code>wire.Build(...)</code> is the most important part — the list of all provider functions Wire will use to build the dependency graph."
        },
        {
          "line": 21,
          "text": "<code>return nil, nil</code> is a throwaway value — Wire ignores it entirely. It exists only to make the stub valid Go syntax when the Wire tool parses it."
        }
      ]
    },
    {
      "type": "callout",
      "variant": "warning",
      "title": "Pitfall: Forgetting the Build Tag on wire.go",
      "html": "If you omit <code>//go:build wireinject</code> from <code>wire.go</code>, the Go compiler will try to compile the stub body (<code>wire.Build(...); return nil, nil</code>) at the same time <em>as</em> <code>wire_gen.go</code>, producing a <strong>duplicate function definition error</strong> because the same function is declared twice."
    },
    {
      "type": "heading",
      "level": 3,
      "text": "wire_gen.go — The Code Wire Generates for You"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// Code generated by Wire. DO NOT EDIT.\n\n//go:build !wireinject\n// +build !wireinject\n\npackage main\n\n// Injectors from wire.go:\n\n// InitializeApp is the injector function generated by Wire.\nfunc InitializeApp(cfg Config) (*App, error) {\n\tdb, err := NewDatabase(cfg)\n\tif err != nil {\n\t\treturn nil, err\n\t}\n\trepo := NewRepository(db)\n\tsvc := NewService(repo)\n\tapp := NewApp(svc)\n\treturn app, nil\n}",
      "highlightLines": [1, 3, 12, 16, 17, 18],
      "annotations": [
        {
          "line": 1,
          "text": "<b>Never edit this file by hand</b> — \"DO NOT EDIT\" is not just a suggestion, it is a hard rule. Every time you run <code>wire</code>, this entire file is overwritten."
        },
        {
          "line": 3,
          "text": "<code>!wireinject</code> (logical NOT) means this file is compiled <em>in every context except</em> when the Wire tool is analyzing the package — the exact opposite of wire.go."
        },
        {
          "line": 12,
          "text": "Wire orders constructor calls in topological order automatically — <code>NewDatabase</code> must run before <code>NewRepository</code>, and Wire determines this by inspecting parameter types."
        },
        {
          "line": 16,
          "text": "This is <b>100% plain Go code</b> — no magic, no reflection; it is as readable and debuggable as anything written by hand."
        }
      ]
    },
    {
      "type": "callout",
      "variant": "warning",
      "title": "Pitfall: Editing wire_gen.go by Hand",
      "html": "Some developers edit <code>wire_gen.go</code> directly because it looks like ordinary Go code that is easy to tweak, but <strong>all changes will be lost</strong> the moment <code>wire</code> runs next. If you need to change behavior, always modify the <strong>provider function</strong> or the <strong>wire.go stub</strong>."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "How Wire Analyzes the Dependency Graph"
    },
    {
      "type": "paragraph",
      "html": "When you run <code>wire</code> in a directory containing <code>wire.go</code>, Wire performs these steps automatically:"
    },
    {
      "type": "list",
      "ordered": true,
      "items": [
        "<strong>Read the stub</strong> — Wire scans the package for functions whose body is a <code>wire.Build(...)</code> call and that carry the <code>wireinject</code> build tag",
        "<strong>Collect the provider list</strong> — gather all provider functions listed in <code>wire.Build(...)</code>",
        "<strong>Analyze return types</strong> — each provider function is keyed by its return type (Wire uses the type as the \"key\")",
        "<strong>Build the dependency graph</strong> — Wire inspects each provider&#39;s parameters to determine which provider must run first",
        "<strong>Topological sort</strong> — derive the correct constructor call order from the graph",
        "<strong>Generate wire_gen.go</strong> — emit Go source code that calls constructors in the correct order, including error handling"
      ]
    },
    {
      "type": "callout",
      "variant": "observe",
      "title": "Key Observation: Wire Matches by Type, Not by Name",
      "html": "Wire matches providers to dependencies using the <strong>Go type</strong> as the key — if two provider functions both return <code>*sql.DB</code>, Wire immediately reports a <em>\"duplicate provider\"</em> error. And if no provider returns the required type, Wire reports a <em>\"missing provider\"</em> error. Both are caught at <code>wire</code> run time, before <code>go build</code>."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "go:generate Wire — Automation in One Line"
    },
    {
      "type": "paragraph",
      "html": "Instead of running <code>wire</code> manually every time, add <code>//go:generate wire</code> to your package so that <code>go generate ./...</code> from the project root runs Wire for every package at once:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "//go:build wireinject\n\npackage main\n\n//go:generate wire\n\nimport \"github.com/google/wire\"\n\nfunc InitializeApp(cfg Config) (*App, error) {\n\twire.Build(NewDatabase, NewRepository, NewService, NewApp)\n\treturn nil, nil\n}",
      "highlightLines": [5],
      "annotations": [
        {
          "line": 5,
          "text": "This single <code>//go:generate wire</code> line causes <code>go generate ./...</code> to run <code>wire</code> in this directory automatically — add it to CI to keep wire_gen.go from going stale."
        }
      ]
    },
    {
      "type": "callout",
      "variant": "tip",
      "title": "Always Commit wire_gen.go to VCS",
      "html": "Unlike typical build artifacts, <code>wire_gen.go</code> should be committed to Git because:<br>1. <code>go build</code> works without the wire CLI on the machine (e.g., a production build server)<br>2. Code reviewers can see the generated code diff when dependencies change<br>3. It prevents build failures if team members have different Wire versions installed"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "The wireinject Build Tag: The Mechanism That Makes It All Work"
    },
    {
      "type": "paragraph",
      "html": "Build tags tell the Go compiler which files to compile in which context. Wire uses the <code>wireinject</code> build tag as a switch to control which file is compiled in each mode:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// === wire.go — compiled only when the Wire tool reads the package ===\n//go:build wireinject\n\n// Status: excluded from a normal go build\n// The Wire tool sets the wireinject tag itself when analyzing the package\n\n// === wire_gen.go — compiled during go build ===\n//go:build !wireinject\n\n// !wireinject = every build that is NOT the Wire tool\n// So go build, go test, and go run always use this file",
      "highlightLines": [2, 8],
      "annotations": [
        {
          "line": 2,
          "text": "When the Go compiler sees <code>//go:build wireinject</code> and a normal build has not set the <code>wireinject</code> tag → this file is skipped entirely."
        },
        {
          "line": 8,
          "text": "<code>!wireinject</code> is true for every build type that is not the Wire tool — so <code>go build</code>, <code>go test</code>, and <code>go run</code> all compile wire_gen.go."
        }
      ]
    },
    {
      "type": "callout",
      "variant": "observe",
      "title": "Key Observation: Why wire.go Needs Both Lines",
      "html": "In Go 1.17+, build tags use the new syntax: <code>//go:build wireinject</code><br>In Go 1.16 and below, they use: <code>// +build wireinject</code><br>For backward compatibility, many projects include both lines in wire.go. There must also be a blank line between the build tag block and the <code>package</code> declaration — without it, Go treats the comment as a package doc comment rather than a build constraint."
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Chapter 2 Summary: The Right Mental Model"
    },
    {
      "type": "paragraph",
      "html": "After this chapter, hold onto this mental model: <mark>wire.go</mark> is the <strong>spec</strong> — it declares what needs to be wired. <mark>wire_gen.go</mark> is the <strong>implementation</strong> that Wire generates from that spec. When dependencies change, edit <code>wire.go</code> or the relevant provider and re-run <code>wire</code>. Never touch <code>wire_gen.go</code> directly. In the next chapter we will explore provider functions in depth, including <code>wire.Build</code> and tracing the dependency graph."
    }
  ]
};
