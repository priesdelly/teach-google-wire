/* lessons ch08 (TH) */
(window.LESSONS_TH = window.LESSONS_TH || {}).ch08 = {
  "title": "Multiple Injectors และ Per-Request Scoping",
  "sections": [
    {
      "type": "heading",
      "level": 2,
      "text": "หนึ่ง Project — หลาย Injectors"
    },
    {
      "type": "paragraph",
      "html": "Wire ไม่จำกัดว่าในหนึ่ง package จะมี injector function ได้แค่ตัวเดียว ในทางปฏิบัติ project มักต้องการ <mark>injector หลายตัว</mark> เช่น หนึ่งสำหรับ production, หนึ่งสำหรับ integration test, และอีกหนึ่งสำหรับ per-request handler factory แต่ละ injector คือ function แยกกันโดยสิ้นเชิง และ <strong>Wire ไม่มี global singleton registry</strong> เชื่อมโยง injectors เหล่านั้นเข้าหากัน"
    },
    {
      "type": "callout",
      "variant": "observe",
      "title": "จุดสังเกต: Wire ไม่มี Global Registry",
      "html": "ต่างจาก Spring Framework หรือ Uber fx ที่มี container กลาง Wire คือ <strong>code generator ล้วนๆ</strong> — ไม่มี runtime object, ไม่มี singleton registry, ไม่มี shared state ระหว่าง injectors เลย injector แต่ละตัวสร้าง dependency graph <em>อิสระ</em> ของตัวเอง"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "สร้าง Multiple Injectors ใน wire.go เดียวกัน"
    },
    {
      "type": "paragraph",
      "html": "ดูตัวอย่าง <code>wire.go</code> ที่มีสอง injector: <code>InitApp</code> สำหรับ production และ <code>InitTestApp</code> สำหรับ test ทั้งสองอยู่ในไฟล์เดียวกัน build tag เดียวกัน แต่สร้าง dependency graph ที่แยกจากกันโดยสิ้นเชิง:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "//go:build wireinject\n\npackage main\n\nimport (\n\t\"testing\"\n\n\t\"github.com/google/wire\"\n\t\"github.com/example/app/config\"\n\t\"github.com/example/app/repo\"\n\t\"github.com/example/app/service\"\n)\n\n// Production injector — รับ Config path เป็น parameter\nfunc InitApp(cfgPath string) (*App, func(), error) {\n\twire.Build(\n\t\tconfig.Load,       // func(path string) (Config, error)\n\t\trepo.NewPostgres,  // func(Config) (*sql.DB, func(), error)\n\t\trepo.NewUserRepo,  // func(*sql.DB) *UserRepo\n\t\tservice.NewUserService,\n\t\tNewApp,\n\t)\n\treturn nil, nil, nil\n}\n\n// Test injector — รับ *testing.T และ swap UserRepo ด้วย mock\nfunc InitTestApp(t *testing.T) (*App, func()) {\n\twire.Build(\n\t\trepo.NewInMemoryUserRepo, // mock implementation\n\t\tservice.NewUserService,\n\t\tNewApp,\n\t\twire.Bind(new(repo.UserRepository), new(*repo.InMemoryUserRepo)),\n\t)\n\treturn nil, nil\n}",
      "highlightLines": [14, 26, 29, 32],
      "annotations": [
        {
          "line": 14,
          "text": "Injector function ปกติ — ทุก provider ที่ระบุใน wire.Build จะสร้าง dependency ใหม่ทั้งหมดแยกกัน"
        },
        {
          "line": 26,
          "text": "Injector ที่สองในไฟล์เดียวกัน — graph ของมันไม่แชร์อะไรกับ InitApp เลย แม้แต่ Config"
        },
        {
          "line": 29,
          "text": "ใช้ mock provider แทน production provider — นี่คือวิธีที่ Wire swap implementation ระหว่าง environments"
        },
        {
          "line": 32,
          "text": "wire.Bind บอก Wire ว่า InMemoryUserRepo คือ concrete type ที่ fulfill UserRepository interface ใน test graph"
        }
      ]
    },
    {
      "type": "heading",
      "level": 2,
      "text": "สองงาม Injectors ≠ Shared Instance"
    },
    {
      "type": "paragraph",
      "html": "นี่คือจุดที่นักพัฒนาหลายคน <mark>เข้าใจผิดบ่อยที่สุด</mark> ลองพิจารณา: ถ้า <code>InitApp</code> และ <code>InitTestApp</code> ต่างก็ระบุ <code>config.Load</code> เป็น provider ทั้งคู่ — <strong>Wire จะเรียก <code>config.Load</code> แยกกันสองครั้ง</strong> เกิด Config สองอินสแตนซ์ที่ต่างกัน ไม่มีการแชร์ singleton ข้าม injectors"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// สมมติว่า config.Load พิมพ์ข้อความทุกครั้งที่ถูกเรียก\nfunc Load(path string) (Config, error) {\n\tfmt.Println(\"Loading config...\")\n\t// ...\n}\n\n// เรียก injector สองตัวแยกกัน\nappA, cleanupA, _ := InitApp(\"prod.yaml\")   // พิมพ์ \"Loading config...\"\nappB, cleanupB, _ := InitApp(\"prod.yaml\")   // พิมพ์ \"Loading config...\" อีกครั้ง\n\n// appA และ appB มี Config คนละตัวกัน — ไม่ใช่ singleton เดียวกัน",
      "highlightLines": [9, 10, 12],
      "annotations": [
        {
          "line": 9,
          "text": "เรียก InitApp ครั้งแรก — Wire เรียก config.Load สร้าง Config ตัวที่ 1"
        },
        {
          "line": 10,
          "text": "เรียก InitApp ครั้งที่สอง — Wire เรียก config.Load สร้าง Config ตัวที่ 2 แยกอิสระ"
        },
        {
          "line": 12,
          "text": "Wire ไม่จำ instance เก่า — ทุก injector call สร้าง graph ใหม่ทั้งหมด"
        }
      ]
    },
    {
      "type": "callout",
      "variant": "warning",
      "title": "Pitfall: คาดหวัง Singleton ข้าม Injectors",
      "html": "ถ้าต้องการ <strong>แชร์ instance เดิม</strong> ข้าม injectors (เช่น database pool เดียวกัน) ต้องสร้าง instance นั้นด้วยมือก่อน แล้ว <strong>ส่งเป็น parameter</strong> ให้ injector หรือสร้าง parent injector แล้วส่งผลลัพธ์ไปยัง child injector แทน Wire จะไม่ทำให้อัตโนมัติ"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "วิธีแชร์ Instance: ส่งเป็น Injector Parameter"
    },
    {
      "type": "paragraph",
      "html": "เมื่อต้องการแชร์ <code>*sql.DB</code> pool เดิมระหว่าง injectors ให้ <mark>สร้าง DB pool ด้วยมือก่อน</mark> แล้วส่งเข้าเป็น parameter ของ injector Wire จะปฏิบัติกับ parameter เหล่านั้นเหมือน provider ที่ return value พร้อมแล้ว ไม่ต้องหา constructor สำหรับมันอีก:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "//go:build wireinject\n\npackage main\n\nimport (\n\t\"database/sql\"\n\t\"log/slog\"\n\n\t\"github.com/google/wire\"\n\t\"github.com/example/app/repo\"\n\t\"github.com/example/app/service\"\n)\n\n// Injector รับ *sql.DB ที่สร้างมาแล้วจากภายนอก\n// Wire จะ inject db ลงไปใน graph โดยตรง ไม่เรียก constructor ของ DB\nfunc InitHandlerScope(db *sql.DB, logger *slog.Logger) *RequestHandler {\n\twire.Build(\n\t\trepo.NewUserRepo,       // func(*sql.DB) *UserRepo — รับ db ที่ส่งมา\n\t\tservice.NewUserService, // func(*UserRepo) *UserService\n\t\tNewRequestHandler,      // func(*UserService, *slog.Logger) *RequestHandler\n\t)\n\treturn nil\n}\n\n// ฝั่ง caller ใน main.go:\n// db := setupDB()     // สร้างครั้งเดียว\n// logger := setupLogger()\n//\n// handler1 := InitHandlerScope(db, logger)  // แชร์ db pool\n// handler2 := InitHandlerScope(db, logger)  // แชร์ db pool เดิม",
      "highlightLines": [15, 17, 25, 27, 28],
      "annotations": [
        {
          "line": 15,
          "text": "Parameter ของ injector function คือ 'already-built values' — Wire ไม่หา constructor สำหรับ *sql.DB"
        },
        {
          "line": 17,
          "text": "repo.NewUserRepo รับ *sql.DB ที่ส่งมาจาก parameter ได้โดยตรง"
        },
        {
          "line": 25,
          "text": "db สร้างครั้งเดียวด้วยมือ ก่อนเรียก injector"
        },
        {
          "line": 27,
          "text": "ทั้ง handler1 และ handler2 ใช้ db pool เดิม — แต่ UserRepo และ UserService ถูกสร้างใหม่แต่ละครั้ง"
        }
      ]
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Per-Request Scoping — แนวคิดสำคัญ"
    },
    {
      "type": "paragraph",
      "html": "Wire <strong>ไม่มี <code>@RequestScope</code></strong> แบบ Spring หรือ per-request container แบบ Guice วิธีที่ถูกต้องคือ: <mark>เรียก injector function ทุกครั้งที่ request เข้ามา</mark> โดยส่ง request-scoped values เช่น <code>*http.Request</code>, <code>context.Context</code>, หรือ request ID เป็น argument ของ injector Wire จะทำให้ค่าเหล่านั้นพร้อมใช้ในทุก provider ที่ต้องการ"
    },
    {
      "type": "callout",
      "variant": "note",
      "title": "Per-Request Scoping ใน Wire คือการ Design Injector ที่รับ Request Values",
      "html": "Wire ไม่ทำ scoping ให้อัตโนมัติ แต่เราสร้างผลลัพธ์เดียวกันได้โดย: (1) แยก app-scoped injector (เรียกครั้งเดียวตอน startup) กับ request-scoped injector (เรียกต่อ request) ออกจากกัน (2) ส่ง app-level singletons เช่น DB pool เป็น <strong>parameter</strong> ของ request injector และ (3) ส่ง request-specific values เช่น <code>*http.Request</code> เป็น parameter ด้วยเช่นกัน"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Per-Request Injector: ตัวอย่างสมบูรณ์"
    },
    {
      "type": "paragraph",
      "html": "ดูตัวอย่าง HTTP server ที่ใช้ Wire สร้าง handler ต่อ request โดยแชร์ DB pool และ logger แต่สร้าง service layer ใหม่ต่อ request เพื่อให้ request context ถูก propagate ได้:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// wire.go\n//go:build wireinject\n\npackage main\n\nimport (\n\t\"context\"\n\t\"database/sql\"\n\t\"log/slog\"\n\t\"net/http\"\n\n\t\"github.com/google/wire\"\n\t\"github.com/example/app/repo\"\n\t\"github.com/example/app/service\"\n)\n\n// App-level injector — เรียกครั้งเดียวตอน startup\nfunc InitApp(cfgPath string) (*sql.DB, *slog.Logger, func(), error) {\n\twire.Build(\n\t\tconfig.Load,\n\t\trepo.NewPostgresDB, // return (*sql.DB, func(), error)\n\t\tnewLogger,\n\t)\n\treturn nil, nil, nil, nil\n}\n\n// requestContext extracts context.Context from *http.Request for injection.\nfunc requestContext(r *http.Request) context.Context { return r.Context() }\n\n// Per-request injector — เรียกทุก HTTP request\n// รับ app-scoped singletons และ request-scoped values เป็น parameters\nfunc InitRequestScope(\n\tdb *sql.DB,\n\tlogger *slog.Logger,\n\tr *http.Request,\n) *UserHandler {\n\twire.Build(\n\t\trepo.NewUserRepo,       // func(*sql.DB) *UserRepo\n\t\tservice.NewUserService, // func(*UserRepo, context.Context) *UserService\n\t\tNewUserHandler,         // func(*UserService, *slog.Logger) *UserHandler\n\t\trequestContext,         // func(*http.Request) context.Context\n\t)\n\treturn nil\n}",
      "highlightLines": [18, 27, 31, 33, 34, 35, 41],
      "annotations": [
        {
          "line": 18,
          "text": "App-level injector สร้าง DB pool และ logger ครั้งเดียว — เรียกใน main() ก่อน ListenAndServe"
        },
        {
          "line": 27,
          "text": "Provider function ที่ดึง context.Context จาก *http.Request — wire.Value() ใช้กับ expression ไม่ได้สำหรับ function call หรือ interface type ต้องใช้ provider function แทน"
        },
        {
          "line": 31,
          "text": "Per-request injector รับ *sql.DB และ *slog.Logger ที่สร้างมาแล้วเป็น parameter"
        },
        {
          "line": 33,
          "text": "*http.Request เป็น parameter — ทำให้ provider requestContext ใน graph สามารถขอ *http.Request ได้"
        },
        {
          "line": 35,
          "text": "Wire จะสร้าง UserRepo, UserService, UserHandler ใหม่ต่อทุก request — แต่ DB pool เดิม"
        },
        {
          "line": 41,
          "text": "requestContext เป็น provider ที่รับ *http.Request และคืน context.Context — Wire เรียกมันเพื่อให้ provider ที่ต้องการ context.Context ใช้งานได้"
        }
      ]
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Caller Pattern ใน HTTP Handler"
    },
    {
      "type": "paragraph",
      "html": "ดูวิธีที่ <code>main.go</code> และ HTTP middleware เรียกใช้ทั้งสอง injector ร่วมกัน สังเกตว่า DB pool ถูกสร้างครั้งเดียวและส่งต่อเข้า request injector ทุกครั้ง:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// main.go\nfunc main() {\n\t// 1. สร้าง app-level dependencies ครั้งเดียว\n\tdb, logger, cleanup, err := InitApp(\"config.yaml\")\n\tif err != nil {\n\t\tlog.Fatal(err)\n\t}\n\tdefer cleanup()\n\n\t// 2. สร้าง HTTP server\n\tmux := http.NewServeMux()\n\tmux.HandleFunc(\"/users\", func(w http.ResponseWriter, r *http.Request) {\n\t\t// 3. เรียก per-request injector ทุก request\n\t\t//    db และ logger เป็น app-scope — ส่งเข้ามาทุกครั้ง\n\t\t//    r เป็น request-scope — ต่างกันทุก request\n\t\thandler := InitRequestScope(db, logger, r)\n\t\thandler.ServeHTTP(w, r)\n\t})\n\n\tlog.Fatal(http.ListenAndServe(\":8080\", mux))\n}",
      "highlightLines": [4, 8, 16],
      "annotations": [
        {
          "line": 4,
          "text": "InitApp เรียกครั้งเดียว — DB pool, logger, และ cleanup function ถูกสร้างตอน startup"
        },
        {
          "line": 8,
          "text": "defer cleanup() จัดการ LIFO cleanup ของ app-level resources เมื่อ server ปิด"
        },
        {
          "line": 16,
          "text": "InitRequestScope เรียกทุก request — สร้าง UserRepo, UserService, UserHandler ใหม่โดยใช้ db pool เดิม"
        }
      ]
    },
    {
      "type": "callout",
      "variant": "warning",
      "title": "Pitfall: ใส่ Heavy Singletons เข้า Per-Request Injector",
      "html": "ถ้า per-request injector ระบุ <code>repo.NewPostgresDB</code> เป็น provider โดยตรง Wire จะเรียก <code>sql.Open()</code> ทุก request — ทำให้ <strong>สร้าง connection pool ใหม่ทุก HTTP request</strong> ซึ่งแพงมากและทำให้ connection exhausted ได้ แนวทางที่ถูกต้องคือ <strong>ส่ง *sql.DB เป็น parameter</strong> เสมอ ไม่ใช่ให้ per-request injector สร้างใหม่"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Trade-off: Per-Request Injector vs Context Propagation"
    },
    {
      "type": "paragraph",
      "html": "มีสองแนวทางหลักในการส่ง request-scoped data ไปยัง deep layers ของ application แต่ละแนวทางมีข้อดีข้อเสียต่างกัน:"
    },
    {
      "type": "list",
      "ordered": false,
      "items": [
        "<strong>Per-request injector (Wire pattern)</strong> — สร้าง service/handler ใหม่ต่อ request โดยส่ง request values เป็น parameter ของ injector ข้อดี: dependency ชัดเจนใน type system, ง่ายต่อ testing ข้อเสีย: overhead ของการสร้าง struct ต่อ request (เล็กน้อย), ต้องออกแบบ injector อย่างระมัดระวัง",
        "<strong>Context propagation</strong> — ส่ง <code>context.Context</code> ที่มี request data ผ่านทุก function call ข้อดี: Go idiomatic, ไม่ต้องสร้าง struct ใหม่ ข้อเสีย: context เป็น untyped bag of values, ง่ายต่อการ misuse, ยากต่อการรู้ว่า function ต้องการ key อะไร",
        "<strong>Hybrid approach (แนะนำ)</strong> — ใช้ per-request injector สำหรับ <em>factory</em> หรือ <em>handler-level</em> objects และใช้ <code>context.Context</code> สำหรับ request ID, trace ID, หรือ deadline ที่ต้องการส่งลึกมาก"
      ]
    },
    {
      "type": "callout",
      "variant": "tip",
      "title": "Best Practice: แยก App Scope กับ Request Scope ให้ชัดเจน",
      "html": "วาดเส้นแบ่งให้ชัดเจน: <strong>App-scoped</strong> = สร้างครั้งเดียวใน <code>InitApp</code> เช่น DB pool, HTTP client, logger configuration, config — ส่งเป็น parameter ให้ request injector <strong>Request-scoped</strong> = สร้างใหม่ต่อ request เช่น request handler, request-specific service instance, trace context — ให้ Wire สร้างใน <code>InitRequestScope</code>"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "สรุปบทที่ 8"
    },
    {
      "type": "paragraph",
      "html": "บทนี้เราเรียนรู้ว่า <mark>Wire ไม่มี runtime scope หรือ global singleton registry</mark> — injector แต่ละตัวสร้าง dependency graph อิสระของตัวเอง การ <strong>แชร์ instance</strong> ทำได้โดยสร้าง instance ด้วยมือแล้วส่งเป็น parameter ของ injector <strong>Per-request scoping</strong> ทำโดยออกแบบ injector ที่รับ request-scoped values เป็น argument แล้วเรียก injector นั้นต่อ request และที่สำคัญที่สุด: <strong>อย่าใส่ heavy app-scoped dependencies</strong> เช่น DB pool เข้า per-request injector เพราะจะสร้างใหม่ทุก request"
    }
  ]
};
