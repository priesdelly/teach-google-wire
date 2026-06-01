/* questions ch02 (EN) */
(window.QUESTIONS_EN = window.QUESTIONS_EN || {}).ch02 = [
  {
    "id": "wire-ch02-q01",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "Which command installs the latest version of the Wire CLI?",
    "options": [
      "go get github.com/google/wire",
      "go install github.com/google/wire@latest",
      "go download github.com/google/wire/cmd/wire",
      "go install github.com/google/wire/cmd/wire@latest"
    ],
    "correctAnswerIndex": 3,
    "explanation": "The correct command is <code>go install github.com/google/wire/cmd/wire@latest</code>. Notice the path goes all the way to <code>/cmd/wire</code> — that is the directory of the CLI tool within the repository. <code>go get</code> is for adding dependencies to go.mod, not for installing tools, and <code>go download</code> does not exist in the Go toolchain."
  },
  {
    "id": "wire-ch02-q02",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "What is the role of wire_gen.go in the Wire workflow?",
    "options": [
      "It is the file developers write to declare provider functions",
      "It is the file Wire generates automatically and that gets compiled during go build",
      "It is a configuration file that defines the dependency graph",
      "It is the file that holds interface definitions Wire requires"
    ],
    "correctAnswerIndex": 1,
    "explanation": "<code>wire_gen.go</code> is the file <strong>Wire generates automatically</strong> — never edit it by hand, because it will be overwritten every time <code>wire</code> runs. It carries the build tag <code>//go:build !wireinject</code>, which ensures it is compiled during a normal <code>go build</code>. Provider functions are written by the developer in separate files."
  },
  {
    "id": "wire-ch02-q03",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "Which build tag must appear at the top of the wire.go stub file?",
    "options": [
      "//go:build wireinject",
      "//go:build wire",
      "//go:build nowire",
      "//go:build !wireinject"
    ],
    "correctAnswerIndex": 0,
    "explanation": "<code>//go:build wireinject</code> is the build tag that must appear on the stub file (<code>wire.go</code>) to tell the Go compiler that this file <em>should not be compiled</em> during a normal <code>go build</code> — Wire is the only tool that reads it. <code>!wireinject</code> is the tag used on <code>wire_gen.go</code>, which is the opposite."
  },
  {
    "id": "wire-ch02-q04",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "Which //go:generate directive is correct for having go generate run Wire?",
    "options": [
      "//go:generate wire",
      "//go:generate go run wire",
      "//go:generate wire gen",
      "//go:generate go wire"
    ],
    "correctAnswerIndex": 0,
    "explanation": "<code>//go:generate wire</code> is the correct directive — when you run <code>go generate ./...</code>, Go will execute <code>wire</code> in the directory containing this directive. No subcommand is needed; the Wire CLI knows what to do when run inside a package that has the wireinject tag."
  },
  {
    "id": "wire-ch02-q05",
    "difficulty": "easy",
    "bloomLevel": "understand",
    "question": "Why does an injector stub need a return statement even though Wire never uses that value?",
    "options": [
      "Because Wire uses the returned value to verify the type is correct",
      "Because the Wire tool needs a body with valid Go syntax in order to parse it — the return statement makes the function signature complete according to Go grammar",
      "Because the returned value is copied directly into wire_gen.go",
      "Because the Go compiler requires that any function with a non-void return type always returns a real value"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Wire reads the stub as Go source code, so the stub must be <strong>valid Go syntax</strong> — a function with a return type must have a <code>return</code> statement, or the Go parser will reject the file before Wire can analyze it. The actual value returned, such as <code>return nil, nil</code> or <code>panic(\"wire\")</code>, is meaningless. Wire replaces the entire body with real code in <code>wire_gen.go</code>."
  },
  {
    "id": "wire-ch02-q06",
    "difficulty": "easy",
    "bloomLevel": "understand",
    "question": "Why should wire_gen.go be committed to version control?",
    "options": [
      "Because the Wire tool will fail if wire_gen.go does not exist before its first run",
      "Because wire_gen.go is a file written by developers and should be tracked normally",
      "Because Go modules require every .go file to be committed to the repository",
      "Because go build needs this file, and the build still works even when the wire CLI is not installed on the machine"
    ],
    "correctAnswerIndex": 3,
    "explanation": "<code>wire_gen.go</code> should be committed because it is the <strong>actual source code that go build uses</strong> — if it is absent and a CI server or teammate does not have Wire CLI installed, <code>go build</code> will fail immediately due to the missing injector implementation. Committing it also lets reviewers see the diff when the dependency graph changes."
  },
  {
    "id": "wire-ch02-q07",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "What happens if you forget the //go:build wireinject build tag on wire.go?",
    "options": [
      "go build will fail because the same function is defined in both wire.go and wire_gen.go",
      "Wire will still work correctly but will generate code more slowly",
      "go build will skip both files and the link step will fail with an undefined symbol",
      "Wire will overwrite wire.go instead of wire_gen.go"
    ],
    "correctAnswerIndex": 0,
    "explanation": "Without the build tag on <code>wire.go</code>, the compiler will compile both <code>wire.go</code> and <code>wire_gen.go</code> together. Both files contain a function with the same name (the injector function), causing an immediate <strong>\"function redeclared\"</strong> error. This is exactly why the build tag is so important."
  },
  {
    "id": "wire-ch02-q08",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "Consider the wire_gen.go code that Wire produces. Which statement best describes it?",
    "code": "// Code generated by Wire. DO NOT EDIT.\n\n//go:build !wireinject\n\npackage main\n\nfunc InitializeApp(cfg Config) (*App, error) {\n\tdb, err := NewDatabase(cfg)\n\tif err != nil {\n\t\treturn nil, err\n\t}\n\trepo := NewRepository(db)\n\tsvc := NewService(repo)\n\treturn NewApp(svc), nil\n}",
    "options": [
      "The code uses reflection to wire dependencies at runtime",
      "The code requires the wire package at runtime to resolve dependencies",
      "The code creates dependencies via lazy initialization to save time",
      "The code is plain, readable Go with constructors called in the correct order — no different from hand-written code"
    ],
    "correctAnswerIndex": 3,
    "explanation": "<code>wire_gen.go</code> is <strong>100% plain Go code</strong> — no reflection, no magic, no Wire package dependency at runtime. Wire simply computes the topological order of constructor calls and emits them as Go source. The order shown is <code>NewDatabase</code> → <code>NewRepository</code> → <code>NewService</code> → <code>NewApp</code>, which is correct per the dependency graph."
  },
  {
    "id": "wire-ch02-q09",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "A developer wants to add a Logger to the App, which requires an additional *zap.Logger. What should be done first?",
    "options": [
      "Create a new wire_gen.go by hand and add the NewLogger call manually",
      "Edit wire_gen.go directly to insert NewLogger into the constructor call sequence",
      "Add NewLogger as a provider in wire.Build inside wire.go, then re-run wire",
      "Update go.mod to add the zap dependency; go build will update wire_gen.go automatically"
    ],
    "correctAnswerIndex": 2,
    "explanation": "The correct workflow is: (1) write a <code>NewLogger</code> provider function, (2) add <code>NewLogger</code> to <code>wire.Build(...)</code> in <code>wire.go</code>, (3) run <code>wire</code> or <code>go generate</code> so Wire regenerates <code>wire_gen.go</code>. Never edit <code>wire_gen.go</code> directly — it will be overwritten."
  },
  {
    "id": "wire-ch02-q10",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "You want go generate ./... to run wire automatically in package main. How should you write it?",
    "code": "//go:build wireinject\n\npackage main\n\n// ??? directive goes here ???\n\nimport \"github.com/google/wire\"\n\nfunc InitApp() *App {\n\twire.Build(NewConfig, NewDB, NewApp)\n\treturn nil\n}",
    "options": [
      "// generate: wire",
      "//go:generate wire",
      "// go:generate wire",
      "//generate wire"
    ],
    "correctAnswerIndex": 1,
    "explanation": "The correct syntax is <code>//go:generate wire</code> — there must be no space between <code>//</code> and <code>go:generate</code>, and exactly one space before the command (<code>wire</code>). <code>// generate: wire</code> and <code>//generate wire</code> are not valid directives. <code>// go:generate wire</code> with a space before <code>go</code> is also not recognized."
  },
  {
    "id": "wire-ch02-q11",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "What does the build tag //go:build !wireinject on wire_gen.go mean?",
    "options": [
      "This file will never be compiled under any circumstances",
      "This file will only be compiled when the wire tool is running",
      "This file will be compiled in every context except when the wire tool is reading the package",
      "This file will only be compiled in a test environment"
    ],
    "correctAnswerIndex": 2,
    "explanation": "<code>!wireinject</code> is the logical NOT of the <code>wireinject</code> tag, meaning this file is compiled in every build that has not set the <code>wireinject</code> tag — that is, <code>go build</code>, <code>go test</code>, and <code>go run</code>. This is the exact inverse of <code>wire.go</code>, which has only <code>wireinject</code> (no <code>!</code>) and is excluded from all normal builds."
  },
  {
    "id": "wire-ch02-q12",
    "difficulty": "medium",
    "bloomLevel": "analyze",
    "question": "A developer edits wire_gen.go to optimize database connection creation and pushes the change to Git. One week later the team runs go generate ./.... What happens to that edit?",
    "options": [
      "Wire creates a new file named wire_gen_v2.go instead of overwriting the existing one",
      "Wire overwrites wire_gen.go entirely and all manual edits are lost",
      "Wire fails with an error saying the file was modified by hand",
      "The edits are preserved because Wire merges with existing code"
    ],
    "correctAnswerIndex": 1,
    "explanation": "<code>wire</code> <strong>overwrites wire_gen.go completely</strong> every time it runs. There is no merge mechanism or way to preserve manual changes — Wire always generates the file fresh from the stub. Any optimization or edit made directly to <code>wire_gen.go</code> is immediately lost. If you need to optimize something, do it in the provider function, not in the generated file."
  },
  {
    "id": "wire-ch02-q13",
    "difficulty": "medium",
    "bloomLevel": "analyze",
    "question": "Consider the following wire.go. What is wrong with this code?",
    "code": "package main\n\nimport \"github.com/google/wire\"\n\nfunc InitializeApp() *App {\n\twire.Build(NewConfig, NewDB, NewApp)\n\treturn nil\n}",
    "options": [
      "wire.Build requires at least 5 providers to work",
      "Injector functions must always be exported to be used with Wire",
      "Nothing is wrong — this code is completely valid",
      "The build tag //go:build wireinject is missing from the top of the file"
    ],
    "correctAnswerIndex": 3,
    "explanation": "This code is <strong>missing the build tag</strong> <code>//go:build wireinject</code> at the top of the file. As a result, <code>go build</code> will compile this file alongside <code>wire_gen.go</code>, causing a \"function redeclared\" error because <code>InitializeApp</code> is declared twice. Wire does not require a minimum number of providers, and injector functions do not need to be exported."
  },
  {
    "id": "wire-ch02-q14",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "A project has multiple packages that use Wire. How should you run wire to cover all packages at once?",
    "options": [
      "Wire only supports one package per project, so all providers must be merged into one place",
      "Run wire in the root directory and Wire will scan all subdirectories automatically",
      "Create a Makefile and run wire in each package directory one by one",
      "Add //go:generate wire to every package that uses Wire, then run go generate ./... from the root"
    ],
    "correctAnswerIndex": 3,
    "explanation": "The correct, idiomatic approach is to add <code>//go:generate wire</code> to each package that uses Wire, then run <code>go generate ./...</code> from the root — the Go toolchain recursively executes every generate directive in the project. The <code>wire</code> CLI does not scan subdirectories on its own; it relies on <code>go generate</code> to dispatch to each package."
  },
  {
    "id": "wire-ch02-q15",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "A team has a valid wire.go and a committed wire_gen.go, but the CI server does not have the wire CLI installed. What happens when go build runs on CI?",
    "options": [
      "Build succeeds, but wire_gen.go is regenerated automatically by go build",
      "Build fails because the wireinject build tag requires the wire CLI to resolve",
      "Build succeeds because go build uses the committed wire_gen.go without needing the wire CLI",
      "Build fails because go build always requires the wire CLI to be on the PATH"
    ],
    "correctAnswerIndex": 2,
    "explanation": "<code>go build</code> only works with Go source files — it does not need the Wire CLI at all. The committed <code>wire_gen.go</code> carries the build tag <code>//go:build !wireinject</code>, so it is compiled normally. Meanwhile, <code>wire.go</code> with <code>//go:build wireinject</code> is skipped. Therefore, <code>go build</code> on CI succeeds without any Wire CLI installation — this is one key reason to commit <code>wire_gen.go</code>."
  },
  {
    "id": "wire-ch02-q16",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "A developer adds a new provider to wire.Build but forgets to run wire afterward. What happens when go build is run?",
    "options": [
      "go build succeeds and uses the old wire_gen.go, which does not include the new provider",
      "Wire detects the mismatch and errors with a hint to re-run wire",
      "go build runs wire automatically before compiling to update wire_gen.go",
      "go build fails immediately because wire.go and wire_gen.go are out of sync"
    ],
    "correctAnswerIndex": 0,
    "explanation": "<code>go build</code> does not run <code>wire</code> automatically — it simply compiles the source files as they are. The old <code>wire_gen.go</code> without the new provider is compiled instead. If the new provider is important to the dependency chain, this may produce a compile error due to a missing type, or worse, the build succeeds but runtime behavior is incorrect. Add <code>go generate ./...</code> as a CI step to prevent this."
  },
  {
    "id": "wire-ch02-q17",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "Consider the following wire.go. Which statement best explains the throwaway return?",
    "code": "//go:build wireinject\n\npackage main\n\nimport \"github.com/google/wire\"\n\nfunc InitApp(cfg Config) (*App, error) {\n\twire.Build(NewConfig, NewDB, NewApp)\n\treturn nil, nil\n}",
    "options": [
      "nil, nil tells Wire the function can return an error, so Wire will add error handling",
      "Wire copies return nil, nil into wire_gen.go as a fallback when an error occurs",
      "Wire uses the first nil to set the default value of *App and the second nil to indicate no cleanup",
      "return nil, nil is just a placeholder to make the stub valid Go syntax — Wire replaces the entire body in wire_gen.go"
    ],
    "correctAnswerIndex": 3,
    "explanation": "<code>return nil, nil</code> (or <code>panic(\"wire\")</code> or any type-correct value) is purely a <strong>placeholder</strong> that makes <code>wire.go</code> valid Go syntax so the compiler and Wire tool can parse it. Wire <em>ignores</em> the returned values entirely. When Wire generates <code>wire_gen.go</code>, it writes a completely new body derived from the dependency graph, with no reference to any placeholder values."
  },
  {
    "id": "wire-ch02-q18",
    "difficulty": "hard",
    "bloomLevel": "apply",
    "question": "A team wants to pin Wire at version v0.6.0 across all team members' machines. What is the correct approach?",
    "options": [
      "Create a wire.version file in the project root specifying v0.6.0",
      "Specify go install github.com/google/wire/cmd/wire@v0.6.0 in onboarding docs and CI config",
      "Add //go:build wire:v0.6.0 to wire.go to set a version constraint",
      "Add github.com/google/wire v0.6.0 to go.mod and go build will install the wire CLI automatically"
    ],
    "correctAnswerIndex": 1,
    "explanation": "The Wire CLI is an <strong>external tool</strong>, not a module dependency in <code>go.mod</code>, so its version must be pinned via the install command directly: <code>go install github.com/google/wire/cmd/wire@v0.6.0</code>. Document this command in your onboarding docs, Makefile, and CI configuration so everyone uses the same version. <code>go.mod</code> does not control tool versions and build tags have no version constraint syntax."
  },
  {
    "id": "wire-ch02-q19",
    "difficulty": "hard",
    "bloomLevel": "apply",
    "question": "A developer wants wire.go to support both Go 1.17+ (using //go:build) and Go 1.16 and below (using // +build). Which option is written correctly?",
    "code": "// Option A:\n//go:build wireinject\npackage main\n\n// Option B:\n// +build wireinject\n//go:build wireinject\npackage main\n\n// Option C:\n//go:build wireinject\n// +build wireinject\n\npackage main\n\n// Option D:\n//go:build wireinject\n\n// +build wireinject\npackage main",
    "options": [
      "Option A — using only the new format is sufficient",
      "Option B — the old format must always come first",
      "Option C — new format first, then old format, with a blank line before package",
      "Option D — the two formats are in separate groups separated by a blank line"
    ],
    "correctAnswerIndex": 2,
    "explanation": "The Go specification requires that when both formats are used, the new format (<code>//go:build</code>) must come first, followed by the old format (<code>// +build</code>), and there must be exactly <strong>one blank line</strong> before the <code>package</code> declaration — without the blank line, Go parses the comment as a package doc comment rather than a build constraint. Option C is the correct form."
  },
  {
    "id": "wire-ch02-q20",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "What principle does Wire use to determine the order of constructor calls in wire_gen.go?",
    "options": [
      "Wire follows the order in which the developer listed providers in wire.Build — that order matters",
      "Wire sorts by alphabetical order of function names for reproducibility",
      "Wire analyzes the parameter types of each provider and performs a topological sort so dependencies are always created first",
      "Wire sorts by the file modification timestamp of each provider"
    ],
    "correctAnswerIndex": 2,
    "explanation": "Wire uses <strong>topological sort</strong> on the dependency graph built from provider return types and parameter types — if <code>NewRepository</code> requires a <code>*sql.DB</code>, Wire knows that <code>NewDatabase</code> (which returns <code>*sql.DB</code>) must run first. The order of providers listed in <code>wire.Build</code> has no effect on the generated code; Wire determines the correct order entirely on its own."
  },
  {
    "id": "wire-ch02-q21",
    "difficulty": "medium",
    "bloomLevel": "remember",
    "question": "What line always appears first in a wire_gen.go file that Wire generates?",
    "options": [
      "package main",
      "import \"github.com/google/wire\"",
      "// Code generated by Wire. DO NOT EDIT.",
      "//go:generate wire"
    ],
    "correctAnswerIndex": 2,
    "explanation": "Wire always emits <code>// Code generated by Wire. DO NOT EDIT.</code> as the very first line. This follows the Go convention for generated files, signaling to developers, linters, and code review tools that the file should not be edited by hand. <code>golangci-lint</code> also automatically skips files that contain this comment."
  },
  {
    "id": "wire-ch02-q22",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "Which statement correctly describes the role of the Wire CLI during go build?",
    "options": [
      "The Wire CLI is invoked by go build to resolve the dependency graph before compilation",
      "The Wire CLI runs as a background process during go build to check types",
      "The Wire CLI is embedded in the go binary to validate wire_gen.go at link time",
      "The Wire CLI does not run during go build at all — it must be run separately beforehand via go generate or directly"
    ],
    "correctAnswerIndex": 3,
    "explanation": "The <code>wire</code> CLI <strong>does not run during <code>go build</code></strong> at all. It must be run separately — either as <code>wire</code> or via <code>go generate</code> — to produce <code>wire_gen.go</code>. Only then does <code>go build</code> compile <code>wire_gen.go</code> as normal Go source. The Wire tool is not embedded in the binary and has no presence there whatsoever."
  }
];
