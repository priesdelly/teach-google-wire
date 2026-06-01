/* lessons ch10 (TH) */
(window.LESSONS_TH = window.LESSONS_TH || {}).ch10 = {
  "title": "Capstone Project — Wire ใน Production Service",
  "sections": [
    {
      "type": "heading",
      "level": 2,
      "text": "ภาพรวม: สร้าง Service จริงจากศูนย์ถึง Production"
    },
    {
      "type": "paragraph",
      "html": "บทนี้คือบทสรุปของทุกสิ่งที่เรียนมา เราจะสร้าง <mark>Task Manager Service</mark> ขนาดเล็กที่ครบถ้วนสมบูรณ์ โดยนำ Wire concept ทุกอย่างมาใช้ร่วมกัน ตั้งแต่ <strong>Config → DB (with cleanup) → Repository (wire.Bind) → Service → Handler → http.Server</strong> — ทุก layer ถูก wire ด้วย Wire โดยไม่มี manual constructor call ใน <code>main.go</code> เลย"
    },
    {
      "type": "list",
      "ordered": false,
      "items": [
        "<strong>Chapter 3</strong> — Provider functions และ wire.Build",
        "<strong>Chapter 4</strong> — wire.NewSet ต่อ layer (infra, repo, service, handler)",
        "<strong>Chapter 5</strong> — wire.Bind ผูก TaskRepository interface กับ postgresTaskRepo",
        "<strong>Chapter 6</strong> — wire.Struct inject fields ของ Handler",
        "<strong>Chapter 7</strong> — Cleanup function สำหรับ DB และ http.Server (LIFO order)",
        "<strong>Chapter 8</strong> — Injector หลักสำหรับ production และ injector แยกสำหรับ test",
        "<strong>Chapter 9</strong> — wire *http.Server พร้อม ServeMux และ middleware"
      ]
    },
    {
      "type": "heading",
      "level": 2,
      "text": "โครงสร้าง Project"
    },
    {
      "type": "paragraph",
      "html": "ก่อนเขียน provider บรรทัดแรก ต้องออกแบบ <mark>package layout</mark> ให้ชัดเจน แต่ละ layer อยู่ใน package ของตัวเอง และแต่ละ package ประกาศ <code>wire.NewSet</code> ของตัวเอง:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "task-manager/\n├── cmd/\n│   └── server/\n│       ├── main.go          // เรียก InitApp เท่านั้น\n│       ├── wire.go          // //go:build wireinject — injector stub\n│       └── wire_gen.go      // generated — อย่าแก้ด้วยมือ\n├── internal/\n│   ├── config/\n│   │   └── config.go        // Config struct + NewConfig provider\n│   ├── db/\n│   │   └── db.go            // NewDB provider (returns *sql.DB, func(), error)\n│   ├── repository/\n│   │   ├── repository.go    // TaskRepository interface\n│   │   ├── postgres.go      // postgresTaskRepo concrete + NewPostgresTaskRepo\n│   │   └── set.go           // var RepositorySet = wire.NewSet(...)\n│   ├── service/\n│   │   ├── service.go       // TaskService interface + taskService concrete\n│   │   └── set.go           // var ServiceSet = wire.NewSet(...)\n│   └── handler/\n│       ├── handler.go       // TaskHandler struct + Register method\n│       └── set.go           // var HandlerSet = wire.NewSet(...)\n└── go.mod",
      "highlightLines": [4, 5, 6, 16, 20, 24],
      "annotations": [
        {
          "line": 4,
          "text": "<b>main.go</b> มีเพียง: app, cleanup, err := InitApp(cfg); defer cleanup(); app.Run() — ไม่มี constructor call ใดๆ"
        },
        {
          "line": 5,
          "text": "<b>wire.go</b> มี build tag wireinject — เป็น input ให้ wire tool; compiler ข้ามไฟล์นี้ตอน build จริง"
        },
        {
          "line": 6,
          "text": "<b>wire_gen.go</b> ถูกสร้างโดย wire tool — commit เข้า VCS แต่ไม่แก้ด้วยมือ"
        },
        {
          "line": 16,
          "text": "แต่ละ layer มีไฟล์ <b>set.go</b> ประกาศ wire.NewSet ของตัวเอง ทำให้ injector ใน wire.go สั้นและอ่านง่าย"
        },
        {
          "line": 20,
          "text": "service layer ประกาศทั้ง interface (TaskService) และ concrete (taskService) ไว้ด้วยกัน พร้อม wire.Bind ใน set"
        },
        {
          "line": 24,
          "text": "handler layer ใช้ wire.Struct เพื่อ inject fields — ไม่จำเป็นต้องเขียน constructor function"
        }
      ]
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Layer 1: Config และ DB (Infrastructure)"
    },
    {
      "type": "paragraph",
      "html": "เริ่มจาก layer ล่างสุด — <code>Config</code> และ <code>*sql.DB</code> ทั้งคู่เป็น <mark>singleton</mark> ที่สร้างครั้งเดียวและ cleanup เมื่อ application ปิด provider ของ DB ต้อง return <code>func()</code> cleanup เพื่อให้ Wire รวมเข้า LIFO cleanup chain:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// internal/config/config.go\npackage config\n\ntype Config struct {\n\tDSN      string\n\tAddr     string\n\tLogLevel string\n}\n\n// NewConfig คือ provider — รับ path แล้ว return Config struct\nfunc NewConfig(path string) (Config, error) {\n\t// อ่าน YAML/ENV จริงๆ ใน production\n\treturn Config{\n\t\tDSN:  \"postgres://localhost/tasks\",\n\t\tAddr: \":8080\",\n\t}, nil\n}\n\n// internal/db/db.go\npackage db\n\nimport (\n\t\"database/sql\"\n\t\"fmt\"\n\n\t\"github.com/example/task-manager/internal/config\"\n\t_ \"github.com/lib/pq\"\n)\n\n// NewDB เปิด connection pool และ return cleanup function\nfunc NewDB(cfg config.Config) (*sql.DB, func(), error) {\n\tdb, err := sql.Open(\"postgres\", cfg.DSN)\n\tif err != nil {\n\t\treturn nil, nil, fmt.Errorf(\"open db: %w\", err)\n\t}\n\tif err := db.Ping(); err != nil {\n\t\tdb.Close()\n\t\treturn nil, nil, fmt.Errorf(\"ping db: %w\", err)\n\t}\n\tcleanup := func() { db.Close() }\n\treturn db, cleanup, nil\n}",
      "highlightLines": [11, 30, 38, 39],
      "annotations": [
        {
          "line": 11,
          "text": "<b>NewConfig</b> return value type (ไม่ใช่ pointer) — Wire match ด้วย type ดังนั้น Config (value) และ *Config (pointer) คือคนละ type"
        },
        {
          "line": 30,
          "text": "<b>signature (Config) (*sql.DB, func(), error)</b> — Wire รองรับ signature นี้ตาม Ch7; cleanup จะถูกรวมเข้า LIFO chain อัตโนมัติ"
        },
        {
          "line": 38,
          "text": "<b>cleanup := func() { db.Close() }</b> — ส่ง cleanup กลับไปให้ Wire จัดการ; อย่า defer db.Close() ใน provider เอง"
        },
        {
          "line": 39,
          "text": "return ทั้งสามค่าพร้อมกัน: resource, cleanup, error — Wire จะแยก error handling และเรียก cleanup ก่อน return error ให้เอง"
        }
      ]
    },
    {
      "type": "callout",
      "variant": "warning",
      "title": "อย่า defer ใน Provider",
      "html": "ถ้าเขียน <code>defer db.Close()</code> ใน <code>NewDB</code> provider ตัว DB จะถูกปิดทันทีที่ <code>NewDB</code> return — เพราะ <code>defer</code> รันเมื่อ function scope จบ ไม่ใช่เมื่อ application ปิด <strong>วิธีที่ถูกต้องคือ return cleanup function</strong> ให้ Wire รวมเข้า LIFO chain และรัน cleanup เมื่อ caller เรียก <code>cleanup()</code>"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Layer 2: Repository — wire.Bind กับ Interface"
    },
    {
      "type": "paragraph",
      "html": "Repository layer คือจุดที่ใช้ <mark>wire.Bind</mark> — เรา expose <code>TaskRepository</code> เป็น interface เพื่อให้ service layer ไม่ต้องรู้จัก PostgreSQL implementation โดยตรง ทำให้ test สามารถ swap เป็น mock ได้:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// internal/repository/repository.go\npackage repository\n\nimport \"context\"\n\n// TaskRepository คือ interface ที่ service layer รู้จัก\ntype TaskRepository interface {\n\tFindAll(ctx context.Context) ([]Task, error)\n\tFindByID(ctx context.Context, id int64) (*Task, error)\n\tCreate(ctx context.Context, t *Task) error\n\tDelete(ctx context.Context, id int64) error\n}\n\n// internal/repository/postgres.go\npackage repository\n\nimport \"database/sql\"\n\n// postgresTaskRepo คือ concrete type — unexported เจตนา\ntype postgresTaskRepo struct {\n\tdb *sql.DB\n}\n\n// NewPostgresTaskRepo คือ provider ของ concrete type\nfunc NewPostgresTaskRepo(db *sql.DB) *postgresTaskRepo {\n\treturn &postgresTaskRepo{db: db}\n}\n\n// internal/repository/set.go\npackage repository\n\nimport \"github.com/google/wire\"\n\n// RepositorySet จัดกลุ่ม provider + wire.Bind ไว้ด้วยกัน\nvar RepositorySet = wire.NewSet(\n\tNewPostgresTaskRepo,\n\twire.Bind(new(TaskRepository), new(*postgresTaskRepo)),\n)",
      "highlightLines": [7, 20, 24, 34, 35, 36],
      "annotations": [
        {
          "line": 7,
          "text": "<b>TaskRepository</b> เป็น interface — service layer depend on นี้เท่านั้น ไม่รู้จัก *postgresTaskRepo โดยตรง"
        },
        {
          "line": 20,
          "text": "<b>postgresTaskRepo unexported</b> — ซ่อน implementation detail ไว้ใน package; Wire สามารถใช้ unexported type เป็น provider ได้"
        },
        {
          "line": 24,
          "text": "Provider return <b>*postgresTaskRepo</b> (pointer ของ concrete) — Wire ต้องการ provider สำหรับ concrete type ก่อนจึงจะทำ wire.Bind ได้"
        },
        {
          "line": 34,
          "text": "<b>NewPostgresTaskRepo</b> ต้องอยู่ใน set ก่อน wire.Bind เสมอ — Bind บอกเพียงว่า \"ให้ใช้ concrete นี้แทน interface นี้\" แต่ยัง depend on provider ของ concrete"
        },
        {
          "line": 35,
          "text": "<b>wire.Bind(new(TaskRepository), new(*postgresTaskRepo))</b> — arg แรกคือ interface, arg สองคือ concrete; สลับกันไม่ได้"
        },
        {
          "line": 36,
          "text": "การปิด set.go ไว้ใน package เดียวกับ providers ทำให้เมื่อ provider signature เปลี่ยน เห็น impact ได้ทันที"
        }
      ]
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Layer 3: Service และ Layer 4: Handler"
    },
    {
      "type": "paragraph",
      "html": "Service layer depend on <code>TaskRepository</code> interface (ไม่ใช่ concrete) และ Handler ใช้ <mark>wire.Struct</mark> เพื่อ inject fields โดยไม่ต้องเขียน constructor:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// internal/service/service.go\npackage service\n\nimport (\n\t\"context\"\n\t\"github.com/example/task-manager/internal/repository\"\n)\n\ntype TaskService interface {\n\tListTasks(ctx context.Context) ([]repository.Task, error)\n\tCreateTask(ctx context.Context, title string) error\n}\n\ntype taskService struct {\n\trepo repository.TaskRepository // depend on interface ไม่ใช่ concrete\n}\n\nfunc NewTaskService(repo repository.TaskRepository) *taskService {\n\treturn &taskService{repo: repo}\n}\n\n// internal/service/set.go\npackage service\n\nimport \"github.com/google/wire\"\n\nvar ServiceSet = wire.NewSet(\n\tNewTaskService,\n\twire.Bind(new(TaskService), new(*taskService)),\n)\n\n// internal/handler/handler.go\npackage handler\n\nimport \"net/http\"\n\n// TaskHandler มี exported fields เพื่อให้ wire.Struct inject ได้\ntype TaskHandler struct {\n\tService service.TaskService // exported field\n}\n\nfunc (h *TaskHandler) Register(mux *http.ServeMux) {\n\tmux.HandleFunc(\"GET /tasks\", h.handleList)\n\tmux.HandleFunc(\"POST /tasks\", h.handleCreate)\n}\n\n// internal/handler/set.go\npackage handler\n\nimport \"github.com/google/wire\"\n\nvar HandlerSet = wire.NewSet(\n\twire.Struct(new(TaskHandler), \"*\"), // inject ทุก exported field\n)",
      "highlightLines": [15, 18, 28, 37, 49],
      "annotations": [
        {
          "line": 15,
          "text": "<b>repo repository.TaskRepository</b> — service depend on interface, ไม่รู้จัก *postgresTaskRepo; ทดสอบได้ง่ายโดย inject mock"
        },
        {
          "line": 18,
          "text": "Provider ของ service รับ <b>interface</b> เป็น parameter — Wire จะหาค่านี้จาก wire.Bind ใน RepositorySet"
        },
        {
          "line": 28,
          "text": "service layer ก็มี <b>wire.Bind</b> เช่นกัน ผูก TaskService interface กับ *taskService เพื่อให้ handler layer ใช้งานผ่าน interface"
        },
        {
          "line": 37,
          "text": "<b>exported field Service</b> จำเป็นสำหรับ wire.Struct — Wire inject เฉพาะ exported fields; unexported fields ถูกละเว้น"
        },
        {
          "line": 49,
          "text": "<b>wire.Struct(new(TaskHandler), \"*\")</b> — inject ทุก exported field อัตโนมัติ เทียบเท่ากับ NewTaskHandler(svc) แต่ไม่ต้องเขียน constructor"
        }
      ]
    },
    {
      "type": "callout",
      "variant": "observe",
      "title": "จุดสังเกต: ลำดับ Dependency Graph",
      "html": "Wire แก้ dependency graph โดย topological sort อัตโนมัติ:<br><code>Config → DB → postgresTaskRepo → TaskRepository (via Bind) → taskService → TaskService (via Bind) → TaskHandler → http.ServeMux → http.Server</code><br>ไม่ต้องเรียงลำดับ providers ใน wire.Build เอง Wire หาลำดับที่ถูกต้องให้"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "HTTP Server Provider และ ServeMux"
    },
    {
      "type": "paragraph",
      "html": "Server layer รับ <code>*http.ServeMux</code> และ <code>Config</code> แล้ว return <code>*http.Server</code> พร้อม cleanup function สำหรับ graceful shutdown Provider ของ ServeMux รับ handler แล้วลงทะเบียน routes:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// cmd/server/server.go\npackage main\n\nimport (\n\t\"context\"\n\t\"net/http\"\n\t\"time\"\n\n\t\"github.com/example/task-manager/internal/config\"\n\t\"github.com/example/task-manager/internal/handler\"\n)\n\n// NewServeMux สร้าง mux และลงทะเบียน routes ของทุก handler\nfunc NewServeMux(taskHandler *handler.TaskHandler) *http.ServeMux {\n\tmux := http.NewServeMux()\n\ttaskHandler.Register(mux)\n\treturn mux\n}\n\n// NewHTTPServer สร้าง *http.Server และ return cleanup สำหรับ graceful shutdown\nfunc NewHTTPServer(mux *http.ServeMux, cfg config.Config) (*http.Server, func(), error) {\n\tsrv := &http.Server{\n\t\tAddr:    cfg.Addr,\n\t\tHandler: mux,\n\t}\n\tcleanup := func() {\n\t\tctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)\n\t\tdefer cancel()\n\t\tsrv.Shutdown(ctx)\n\t}\n\treturn srv, cleanup, nil\n}",
      "highlightLines": [14, 21, 26, 27, 28, 29],
      "annotations": [
        {
          "line": 14,
          "text": "<b>NewServeMux</b> รับ *TaskHandler จาก Wire (inject ด้วย wire.Struct) แล้วเรียก Register ซึ่งเพิ่ม routes ให้ mux"
        },
        {
          "line": 21,
          "text": "signature <b>(*http.ServeMux, config.Config) (*http.Server, func(), error)</b> — รูปแบบ provider พร้อม cleanup จาก Ch7"
        },
        {
          "line": 26,
          "text": "<b>cleanup function</b> สำหรับ HTTP server ทำ graceful shutdown ด้วย context timeout 5 วินาที"
        },
        {
          "line": 27,
          "text": "context.WithTimeout + defer cancel() เพื่อไม่ให้ resource leak เมื่อ Shutdown รันสำเร็จก่อน timeout"
        },
        {
          "line": 29,
          "text": "srv.Shutdown(ctx) ส่ง signal ให้ server หยุดรับ request ใหม่ และรอให้ request ที่กำลัง process เสร็จก่อนปิด"
        }
      ]
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Injector: wire.go และ wire_gen.go"
    },
    {
      "type": "paragraph",
      "html": "ขั้นตอนสุดท้ายคือการเขียน <mark>injector stub</mark> ใน <code>wire.go</code> ซึ่งรวม provider sets ทุก layer เข้าด้วยกัน Wire จะอ่านไฟล์นี้และสร้าง <code>wire_gen.go</code> ที่ประกอบร่างทุกอย่างให้:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// cmd/server/wire.go\n//go:build wireinject\n\npackage main\n\nimport (\n\t\"github.com/google/wire\"\n\t\"github.com/example/task-manager/internal/config\"\n\t\"github.com/example/task-manager/internal/db\"\n\t\"github.com/example/task-manager/internal/repository\"\n\t\"github.com/example/task-manager/internal/service\"\n\t\"github.com/example/task-manager/internal/handler\"\n)\n\n// AppSet รวม provider sets ของทุก layer\nvar AppSet = wire.NewSet(\n\tdb.NewDB,\n\trepository.RepositorySet,\n\tservice.ServiceSet,\n\thandler.HandlerSet,\n\tNewServeMux,\n\tNewHTTPServer,\n)\n\n// InitApp คือ injector function เดียวของ production\n// รับ configPath แล้ว return *http.Server พร้อม cleanup chain\nfunc InitApp(cfg config.Config) (*http.Server, func(), error) {\n\twire.Build(AppSet)\n\treturn nil, nil, nil // placeholder — Wire จะแทนที่ body นี้\n}\n\n// --- ตัวอย่างที่ Wire สร้างใน wire_gen.go (อย่าแก้ด้วยมือ) ---\n\n// Code generated by Wire. DO NOT EDIT.\n//go:build !wireinject\n\nfunc InitApp(cfg config.Config) (*http.Server, func(), error) {\n\tsqlDB, cleanup, err := db.NewDB(cfg)\n\tif err != nil {\n\t\treturn nil, nil, err\n\t}\n\tpostgresTaskRepo := repository.NewPostgresTaskRepo(sqlDB)\n\ttaskRepository := repository.TaskRepository(postgresTaskRepo)\n\ttaskServiceImpl := service.NewTaskService(taskRepository)\n\ttaskService := service.TaskService(taskServiceImpl)\n\ttaskHandler := &handler.TaskHandler{Service: taskService}\n\tserveMux := NewServeMux(taskHandler)\n\thttpServer, cleanup2, err := NewHTTPServer(serveMux, cfg)\n\tif err != nil {\n\t\tcleanup()\n\t\treturn nil, nil, err\n\t}\n\treturn httpServer, func() {\n\t\tcleanup2()\n\t\tcleanup()\n\t}, nil\n}",
      "highlightLines": [2, 27, 28, 34, 37, 38, 39, 42, 45, 50, 51, 52, 53],
      "annotations": [
        {
          "line": 2,
          "text": "<b>//go:build wireinject</b> — บังคับ; ขาดบรรทัดนี้ compiler จะ fail เพราะ body ของ InitApp ไม่ถูกต้อง"
        },
        {
          "line": 27,
          "text": "<b>wire.Build(AppSet)</b> — Wire อ่านบรรทัดนี้เพียงบรรทัดเดียว; โค้ดอื่นใน body จะถูกละเว้นทั้งหมด"
        },
        {
          "line": 28,
          "text": "<b>return nil, nil, nil</b> คือ placeholder; Wire สร้าง wire_gen.go แทนที่ไม่ได้แก้ไฟล์นี้"
        },
        {
          "line": 34,
          "text": "<b>//go:build !wireinject</b> — wire_gen.go ใช้ build tag ตรงข้าม ทำให้ทั้งสองไฟล์ไม่ conflict กัน"
        },
        {
          "line": 37,
          "text": "Wire สร้าง DB ก่อนเสมอ (ลำดับตาม dependency graph) และเก็บ cleanup function ไว้"
        },
        {
          "line": 38,
          "text": "ถ้า db.NewDB return error, Wire return error ทันทีโดยไม่ต้อง continue — fail-fast behavior"
        },
        {
          "line": 45,
          "text": "<b>&handler.TaskHandler{Service: taskService}</b> — นี่คือ code ที่ wire.Struct สร้างให้; เทียบเท่ากับ NewTaskHandler ที่เขียนมือ"
        },
        {
          "line": 50,
          "text": "ถ้า NewHTTPServer fail หลัง DB สำเร็จ Wire เรียก <b>cleanup()</b> ของ DB ก่อน return error — LIFO: resource ที่สร้างก่อน (DB) ถูก cleanup หลังสุด แต่ในกรณี error ระหว่าง construction Wire เรียก cleanups ที่สะสมไว้ทั้งหมดก่อน return error"
        },
        {
          "line": 51,
          "text": "<b>LIFO cleanup order</b>: cleanup2 (HTTP server shutdown) รันก่อน cleanup (DB close) — ลำดับย้อนกลับจากลำดับการสร้าง"
        },
        {
          "line": 52,
          "text": "cleanup chain ถูก combine เป็น single anonymous function — caller เรียก cleanup() ตัวเดียวได้"
        },
        {
          "line": 53,
          "text": "ทั้งหมดนี้คือ Go code ธรรมดา — ไม่มี reflection, ไม่มี Wire runtime; อ่านได้เหมือน code ที่เขียนมือ"
        }
      ]
    },
    {
      "type": "callout",
      "variant": "observe",
      "title": "จุดสังเกต: LIFO Cleanup Order ใน wire_gen.go",
      "html": "สังเกต cleanup order ที่ Wire สร้าง: <code>cleanup2()</code> (HTTP server) รันก่อน <code>cleanup()</code> (DB) นั่นคือ <strong>Last-In, First-Out</strong> — resource ที่สร้างทีหลัง (HTTP server) ถูก cleanup ก่อน เหตุผลคือ HTTP server อาจยังมี in-flight request ที่ query database อยู่ ถ้า close DB ก่อน HTTP server request เหล่านั้นจะ fail ด้วย error ที่ไม่ชัดเจน"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "main.go ที่สั้นและชัดเจน"
    },
    {
      "type": "paragraph",
      "html": "เมื่อ Wire จัดการ wiring ทั้งหมด <code>main.go</code> เหลือเพียงสิ่งที่ <strong>ต้องทำก่อน Wire</strong> (โหลด config) และ <strong>ต้องทำหลัง Wire</strong> (เริ่ม server, handle signal):"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// cmd/server/main.go\npackage main\n\nimport (\n\t\"log/slog\"\n\t\"os\"\n\t\"os/signal\"\n\t\"syscall\"\n\n\t\"github.com/example/task-manager/internal/config\"\n)\n\nfunc main() {\n\t// Config โหลดก่อน Wire เพราะ InitApp ต้องการ\n\tcfg, err := config.NewConfig(\"config.yaml\")\n\tif err != nil {\n\t\tslog.Error(\"load config\", \"error\", err)\n\t\tos.Exit(1)\n\t}\n\n\t// InitApp คือ function เดียวที่ main รู้จัก\n\t// Wire generate implementation ให้ใน wire_gen.go\n\tsrv, cleanup, err := InitApp(cfg)\n\tif err != nil {\n\t\tslog.Error(\"init app\", \"error\", err)\n\t\tos.Exit(1)\n\t}\n\tdefer cleanup() // LIFO cleanup chain รันเมื่อ main return\n\n\tgo func() {\n\t\tif err := srv.ListenAndServe(); err != nil {\n\t\t\tslog.Info(\"server stopped\", \"error\", err)\n\t\t}\n\t}()\n\n\t// รอ signal สำหรับ graceful shutdown\n\tquit := make(chan os.Signal, 1)\n\tsignal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)\n\t<-quit\n\tslog.Info(\"shutting down...\")\n\t// defer cleanup() จะรันที่นี่ — HTTP server shutdown ก่อน DB close\n}",
      "highlightLines": [15, 23, 27, 29, 37, 38],
      "annotations": [
        {
          "line": 15,
          "text": "Config โหลดก่อน Wire เพราะ InitApp ต้องการ cfg เป็น input — นี่คือ boundary ระหว่าง manual bootstrap กับ Wire"
        },
        {
          "line": 23,
          "text": "<b>InitApp(cfg)</b> คือบรรทัดเดียวที่ main รู้จัก Wire-generated function; ไม่มี NewDB, NewRepo, NewService ใดๆ"
        },
        {
          "line": 27,
          "text": "<b>defer cleanup()</b> — บรรทัดสำคัญที่สุด; ลืมบรรทัดนี้ = resource leak; Wire สร้าง cleanup แต่ไม่รันให้อัตโนมัติ"
        },
        {
          "line": 29,
          "text": "รัน srv.ListenAndServe ใน goroutine แยกเพื่อให้ main goroutine รอรับ signal ได้"
        },
        {
          "line": 37,
          "text": "signal.Notify รับ SIGINT (Ctrl+C) และ SIGTERM (kill) — เมื่อรับ signal main จะ return"
        },
        {
          "line": 38,
          "text": "<-quit บล็อกจนกว่าจะรับ signal; หลังจากนี้ defer cleanup() จะรัน LIFO: HTTP shutdown → DB close"
        }
      ]
    },
    {
      "type": "callout",
      "variant": "tip",
      "title": "Test Injector: สลับ Mock Repository ได้ทันที",
      "html": "สร้าง <code>wire_test.go</code> ใน package เดียวกับ test file โดยใช้ build tag <code>//go:build wireinject</code> แล้วเขียน injector ที่ bind <code>MockTaskRepository</code> แทน <code>*postgresTaskRepo</code>:<br><code>var TestSet = wire.NewSet(NewMockTaskRepository, service.ServiceSet, handler.HandlerSet, NewServeMux, NewHTTPServer, wire.Bind(new(repository.TaskRepository), new(*MockTaskRepository)))</code><br>Test injector ไม่ต้องการ DB จริง ทำให้ test รันเร็วและไม่มี external dependency"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Checklist ก่อน Commit"
    },
    {
      "type": "paragraph",
      "html": "ก่อน push code ให้ตรวจสอบ checklist นี้เพื่อให้แน่ใจว่า Wire setup ถูกต้องสมบูรณ์:"
    },
    {
      "type": "list",
      "ordered": true,
      "items": [
        "<code>wire.go</code> มี <code>//go:build wireinject</code> บรรทัดแรก",
        "<code>wire_gen.go</code> ถูก commit เข้า VCS (ไม่อยู่ใน .gitignore)",
        "<code>main.go</code> ไม่มี constructor call ใดๆ นอกจาก <code>config.NewConfig</code> และ <code>InitApp</code>",
        "<code>defer cleanup()</code> อยู่หลัง error check ของ <code>InitApp</code> ทันที",
        "ทุก provider ที่ return resource มี cleanup function คืนให้ Wire",
        "แต่ละ layer มี <code>wire.NewSet</code> ของตัวเอง ไม่มี provider ซ้ำกันใน sets",
        "รัน <code>go build ./...</code> ผ่านก่อน commit",
        "เพิ่ม <code>//go:generate wire</code> directive ใน package เพื่อให้ CI รันได้"
      ]
    },
    {
      "type": "callout",
      "variant": "warning",
      "title": "Common Pitfall: ลืมรัน wire หลังแก้ Provider Signature",
      "html": "เมื่อแก้ signature ของ provider function เช่นเพิ่ม parameter หรือเปลี่ยน return type <code>wire_gen.go</code> ที่มีอยู่จะ <strong>outdated ทันที</strong> และ <code>go build</code> อาจ fail ด้วย error ที่งงว่ามาจากไหน แก้ได้โดยรัน <code>go generate ./...</code> เสมอหลังแก้ provider และเพิ่มขั้นตอนนี้ใน CI pipeline"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "สรุปบทที่ 10 — ครบวงจร Wire"
    },
    {
      "type": "paragraph",
      "html": "เราได้สร้าง Task Manager Service ที่ครบถ้วนโดยใช้ทุก Wire concept: <strong>provider functions</strong> (Ch3) → <strong>wire.NewSet per layer</strong> (Ch4) → <strong>wire.Bind สำหรับ interface</strong> (Ch5) → <strong>wire.Struct สำหรับ handler</strong> (Ch6) → <strong>cleanup functions LIFO</strong> (Ch7) → <strong>production + test injectors</strong> (Ch8) → <strong>HTTP server wiring</strong> (Ch9) ผลลัพธ์คือ <code>main.go</code> ที่เรียบง่าย <code>wire_gen.go</code> ที่อ่านได้ และ dependency graph ที่ถูกต้องโดย compiler รับประกัน"
    }
  ]
};
