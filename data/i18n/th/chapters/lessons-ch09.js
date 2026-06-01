/* lessons ch09 (TH) */
(window.LESSONS_TH = window.LESSONS_TH || {}).ch09 = {
  "title": "Integration กับ HTTP และ gRPC",
  "sections": [
    {
      "type": "heading",
      "level": 2,
      "text": "ภาพรวม: Wire ใน Real Server"
    },
    {
      "type": "paragraph",
      "html": "บทนี้คือจุดที่ Wire \"ออกสนามจริง\" แทนที่จะเป็นแค่ตัวอย่าง struct เล็ก ๆ เราจะเอา Wire มาใช้ wire dependency stack ครบวงจร ตั้งแต่ <strong>Config</strong> → <strong>Repository</strong> → <strong>Service</strong> → <strong>Handler/Transport</strong> จนถึง <code>*http.Server</code> หรือ <code>*grpc.Server</code> ที่พร้อม serve request จริง เป้าหมายคือ <code>main()</code> ที่สั้นมาก — เรียก injector, defer cleanup, start server แค่นั้น"
    },
    {
      "type": "callout",
      "variant": "observe",
      "title": "จุดสังเกต: โครงสร้าง Package ที่แนะนำ",
      "html": "สำหรับ project จริง ควรแบ่ง package ดังนี้:<br><code>cmd/server/main.go</code> — entry point<br><code>internal/wire/wire.go</code> — injector stub<br><code>internal/wire/wire_gen.go</code> — generated<br><code>internal/handler/</code> — HTTP/gRPC handler + provider set<br><code>internal/service/</code> — business logic + provider set<br><code>internal/repo/</code> — database access + provider set<br><code>internal/config/</code> — config loading provider<br>การแยก package ตาม layer ทำให้ provider set ของแต่ละชั้นอยู่ใกล้กับ code ที่เกี่ยวข้อง"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "HTTP Server: Wire ทุก Layer"
    },
    {
      "type": "paragraph",
      "html": "เริ่มจาก HTTP เพราะคุ้นเคยที่สุด เราจะ wire stack ทั้งหมดโดยมี <code>*http.Server</code> เป็น root type ที่ injector ต้อง return ให้ได้ แต่ละ layer มี provider ของตัวเองและถูกจัดกลุ่มไว้ใน <code>wire.NewSet</code> ตาม layer"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// internal/config/config.go\npackage config\n\ntype Config struct {\n\tAddr   string\n\tDSN    string\n\tDebug  bool\n}\n\n// Provider: รับ path จาก caller, return Config ที่โหลดแล้ว\nfunc Load(path string) (Config, error) {\n\t// อ่านไฟล์ / env vars แล้ว unmarshal ลง Config\n\treturn Config{Addr: \":8080\", DSN: \"postgres://...\"}, nil\n}\n\nvar Set = wire.NewSet(Load)",
      "highlightLines": [11, 16],
      "annotations": [
        {
          "line": 11,
          "text": "Provider return <b>value type</b> Config (ไม่ใช่ pointer) — Wire จะ match กับ consumer ที่รับ Config ได้ทันที ไม่ต้อง pointer"
        },
        {
          "line": 16,
          "text": "ประกาศ <b>Set</b> ไว้ในแพ็กเกจเดียวกับ provider เพื่อให้ injector import และใช้งานได้สะดวก"
        }
      ]
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// internal/repo/repo.go\npackage repo\n\nimport (\n\t\"database/sql\"\n\t\"github.com/google/wire\"\n)\n\nfunc NewDB(cfg config.Config) (*sql.DB, func(), error) {\n\tdb, err := sql.Open(\"pgx\", cfg.DSN)\n\tif err != nil {\n\t\treturn nil, nil, err\n\t}\n\tcleanup := func() { db.Close() }\n\treturn db, cleanup, nil\n}\n\ntype UserRepo struct{ db *sql.DB }\n\nfunc NewUserRepo(db *sql.DB) *UserRepo {\n\treturn &UserRepo{db: db}\n}\n\nvar Set = wire.NewSet(NewDB, NewUserRepo)",
      "highlightLines": [9, 14, 24],
      "annotations": [
        {
          "line": 9,
          "text": "Provider สำหรับ <code>*sql.DB</code> return <b>cleanup func</b> เป็น return ค่าที่สอง — Wire จะรวบรวม cleanup นี้ไว้ใน cleanup chain อัตโนมัติ"
        },
        {
          "line": 14,
          "text": "<code>db.Close</code> ถูก wrap เป็น <b>closure</b> แล้ว return ออกไป ห้ามเรียก <code>db.Close()</code> ใน provider โดยตรง"
        },
        {
          "line": 24,
          "text": "<b>RepoSet</b> รวม DB provider และ UserRepo provider ไว้ด้วยกัน — ทั้งสองอยู่ใน layer เดียวกัน"
        }
      ]
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// internal/service/service.go\npackage service\n\nimport \"github.com/google/wire\"\n\ntype UserService struct {\n\trepo *repo.UserRepo\n\tcfg  config.Config\n}\n\nfunc NewUserService(r *repo.UserRepo, cfg config.Config) *UserService {\n\treturn &UserService{repo: r, cfg: cfg}\n}\n\nvar Set = wire.NewSet(NewUserService)\n\n// internal/handler/handler.go\npackage handler\n\nimport (\n\t\"net/http\"\n\t\"github.com/google/wire\"\n)\n\ntype UserHandler struct{ svc *service.UserService }\n\nfunc NewUserHandler(svc *service.UserService) *UserHandler {\n\treturn &UserHandler{svc: svc}\n}\n\nfunc NewServeMux(u *UserHandler) *http.ServeMux {\n\tmux := http.NewServeMux()\n\tmux.HandleFunc(\"GET /users\", u.List)\n\treturn mux\n}\n\nfunc NewHTTPServer(mux *http.ServeMux, cfg config.Config) (*http.Server, func()) {\n\tsrv := &http.Server{\n\t\tAddr:    cfg.Addr,\n\t\tHandler: mux,\n\t}\n\tcleanup := func() {\n\t\tctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)\n\t\tdefer cancel()\n\t\tsrv.Shutdown(ctx)\n\t}\n\treturn srv, cleanup\n}\n\nvar Set = wire.NewSet(NewUserHandler, NewServeMux, NewHTTPServer)",
      "highlightLines": [31, 37, 39, 42, 50],
      "annotations": [
        {
          "line": 31,
          "text": "<b>NewServeMux</b> เป็น provider ที่รับ handler แล้ว register routes ทั้งหมด — แยก routing logic ออกจาก handler struct ได้สะอาด"
        },
        {
          "line": 37,
          "text": "<b>NewHTTPServer</b> คือ root provider ของ HTTP stack รับ <code>*http.ServeMux</code> + Config และ return <code>*http.Server</code>"
        },
        {
          "line": 39,
          "text": "สร้าง server โดยใส่ <code>cfg.Addr</code> ที่ได้มาจาก Config — ไม่ hardcode port ใน provider เด็ดขาด"
        },
        {
          "line": 42,
          "text": "cleanup ใช้ <code>srv.Shutdown</code> พร้อม <b>context timeout</b> เพื่อ graceful shutdown — request ที่กำลังทำงานอยู่จะได้จบก่อน"
        },
        {
          "line": 50,
          "text": "<b>HandlerSet</b> รวม handler, mux และ server provider ไว้ด้วยกัน ทั้งสามอยู่ใน transport layer"
        }
      ]
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Injector และ main() ที่สะอาด"
    },
    {
      "type": "paragraph",
      "html": "เมื่อทุก layer มี provider set แล้ว injector stub จะกระชับมาก และ <code>main()</code> ก็ไม่ต้องรู้จัก constructor ของ layer ใดเลย"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// internal/wire/wire.go\n//go:build wireinject\n\npackage wire\n\nimport (\n\t\"github.com/google/wire\"\n\t\"myapp/internal/config\"\n\t\"myapp/internal/handler\"\n\t\"myapp/internal/repo\"\n\t\"myapp/internal/service\"\n)\n\nfunc InitApp(cfgPath string) (*http.Server, func(), error) {\n\twire.Build(\n\t\tconfig.Set,\n\t\trepo.Set,\n\t\tservice.Set,\n\t\thandler.Set,\n\t)\n\treturn nil, nil, nil\n}\n\n// cmd/server/main.go\npackage main\n\nfunc main() {\n\tsrv, cleanup, err := wire.InitApp(\"config.yaml\")\n\tif err != nil {\n\t\tlog.Fatal(err)\n\t}\n\tdefer cleanup()\n\n\tlog.Printf(\"listening on %s\", srv.Addr)\n\tif err := srv.ListenAndServe(); err != http.ErrServerClosed {\n\t\tlog.Fatal(err)\n\t}\n}",
      "highlightLines": [2, 14, 15, 16, 17, 18, 27, 32],
      "annotations": [
        {
          "line": 2,
          "text": "Build tag <code>//go:build wireinject</code> บังคับ — ถ้าลืม compiler จะพยายาม compile body ที่ไม่ถูกต้อง"
        },
        {
          "line": 14,
          "text": "Injector return <code>(*http.Server, func(), error)</code> — Wire รวบรวม cleanup จาก <b>ทุก provider</b> ในกราฟแล้วส่งกลับเป็น cleanup func เดียว"
        },
        {
          "line": 15,
          "text": "ใส่แค่ <b>Set ของแต่ละ layer</b> ใน wire.Build — ไม่ต้อง list provider ทีละตัว ทำให้อ่านง่ายและ maintain ง่าย"
        },
        {
          "line": 27,
          "text": "<code>main()</code> เรียก injector แค่บรรทัดเดียว ไม่มี manual constructor call ใด ๆ ทั้งสิ้น"
        },
        {
          "line": 32,
          "text": "<code>defer cleanup()</code> ต้องอยู่หลัง error check เสมอ — Wire รับประกันว่า cleanup ของ resource ที่สร้างสำเร็จจะถูกเรียกใน LIFO order"
        }
      ]
    },
    {
      "type": "callout",
      "variant": "tip",
      "title": "Best Practice: Provider Set ต่อ Layer",
      "html": "จัด <code>wire.NewSet</code> หนึ่งชุดต่อหนึ่ง layer (<code>config.Set</code>, <code>repo.Set</code>, <code>service.Set</code>, <code>handler.Set</code>) แล้วประกาศไว้ในแพ็กเกจของ layer นั้นเอง ไม่ควรรวม provider ของหลาย layer ไว้ใน set เดียว เพราะจะ reuse ได้ยากและเปลี่ยน implementation แค่ layer เดียวทำได้ยาก"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "gRPC Server: Wire กับ grpc.Server"
    },
    {
      "type": "paragraph",
      "html": "Pattern ของ gRPC ใกล้เคียงกับ HTTP มาก ต่างกันตรงที่เราต้องสร้าง <code>*grpc.Server</code> และ register service implementation เข้าไป ซึ่งทั้งสองขั้นตอนนี้ทำได้ผ่าน provider"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// internal/grpcserver/grpcserver.go\npackage grpcserver\n\nimport (\n\t\"google.golang.org/grpc\"\n\t\"github.com/google/wire\"\n\tpb \"myapp/gen/proto\"\n)\n\n// UserGRPCServer implement pb.UserServiceServer\ntype UserGRPCServer struct {\n\tpb.UnimplementedUserServiceServer\n\tsvc *service.UserService\n}\n\nfunc NewUserGRPCServer(svc *service.UserService) *UserGRPCServer {\n\treturn &UserGRPCServer{svc: svc}\n}\n\n// NewGRPCServer สร้าง *grpc.Server, register implementation, และ return cleanup\nfunc NewGRPCServer(impl *UserGRPCServer, cfg config.Config) (*grpc.Server, func()) {\n\topts := []grpc.ServerOption{\n\t\tgrpc.MaxRecvMsgSize(cfg.GRPCMaxMsgSize),\n\t}\n\tsrv := grpc.NewServer(opts...)\n\tpb.RegisterUserServiceServer(srv, impl)\n\tcleanup := func() { srv.GracefulStop() }\n\treturn srv, cleanup\n}\n\nvar Set = wire.NewSet(\n\tNewUserGRPCServer,\n\tNewGRPCServer,\n\twire.Bind(new(pb.UserServiceServer), new(*UserGRPCServer)),\n)",
      "highlightLines": [16, 21, 26, 27, 34],
      "annotations": [
        {
          "line": 16,
          "text": "<b>Provider ของ impl</b> รับ service จาก layer ด้านล่าง — impl ไม่รู้จัก grpc.Server และ grpc.Server ไม่รู้จัก impl โดยตรง เชื่อมกันผ่าน provider เท่านั้น"
        },
        {
          "line": 21,
          "text": "<b>grpc.ServerOption</b> ควรมาจาก Config ไม่ควร hardcode ใน provider — ทำให้ config-driven และ testable"
        },
        {
          "line": 26,
          "text": "<code>pb.RegisterUserServiceServer(srv, impl)</code> ทำใน provider นี้ได้เลย — เป็นขั้นตอน setup ของ server ไม่ใช่ business logic"
        },
        {
          "line": 27,
          "text": "<code>srv.GracefulStop()</code> เป็น cleanup ที่สมบูรณ์แบบ — รอให้ RPC calls ที่กำลังทำงานอยู่เสร็จก่อน แล้วจึง stop"
        },
        {
          "line": 34,
          "text": "<code>wire.Bind</code> ผูก interface <code>pb.UserServiceServer</code> เข้ากับ concrete type <code>*UserGRPCServer</code> — จำเป็นถ้ามี consumer ต้องการ interface ไม่ใช่ concrete struct"
        }
      ]
    },
    {
      "type": "paragraph",
      "html": "สำหรับ <code>main.go</code> ของ gRPC server ก็ใช้ pattern เดียวกัน แต่เรียก <code>srv.Serve(lis)</code> แทน <code>srv.ListenAndServe()</code>:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// cmd/grpc/main.go\npackage main\n\nfunc main() {\n\tcfg, err := config.Load(\"config.yaml\")\n\tif err != nil {\n\t\tlog.Fatal(err)\n\t}\n\n\tsrv, cleanup, err := wire.InitGRPCApp(cfg)\n\tif err != nil {\n\t\tlog.Fatal(err)\n\t}\n\tdefer cleanup()\n\n\tlis, err := net.Listen(\"tcp\", cfg.GRPCAddr)\n\tif err != nil {\n\t\tlog.Fatal(err)\n\t}\n\n\tlog.Printf(\"gRPC listening on %s\", cfg.GRPCAddr)\n\tif err := srv.Serve(lis); err != nil {\n\t\tlog.Fatal(err)\n\t}\n}",
      "highlightLines": [10, 14, 22],
      "annotations": [
        {
          "line": 10,
          "text": "Injector คนละ function สำหรับ HTTP และ gRPC — แต่ share <code>repo.Set</code> และ <code>service.Set</code> ร่วมกันได้ รับ cfg เป็น parameter เพราะโหลดไว้แล้วจาก main()"
        },
        {
          "line": 14,
          "text": "<code>defer cleanup()</code> จะเรียก <code>grpc.GracefulStop()</code> และ <code>db.Close()</code> ใน LIFO order — server stop ก่อน, DB close หลังสุด"
        },
        {
          "line": 22,
          "text": "<code>srv.Serve(lis)</code> block จนกว่า <code>GracefulStop()</code> จะถูกเรียก เช่น จาก signal handler หรือ cleanup"
        }
      ]
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Middleware ใน HTTP: Provider สำหรับ Chain"
    },
    {
      "type": "paragraph",
      "html": "Middleware ใน <code>net/http</code> มี type เป็น <code>func(http.Handler) http.Handler</code> เราสามารถสร้าง provider สำหรับ middleware chain และ compose เข้ากับ server provider ได้"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// internal/middleware/middleware.go\npackage middleware\n\nimport \"net/http\"\n\n// LoggingMiddleware เป็น provider ที่ return middleware function\nfunc NewLoggingMiddleware(logger *slog.Logger) func(http.Handler) http.Handler {\n\treturn func(next http.Handler) http.Handler {\n\t\treturn http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {\n\t\t\tstart := time.Now()\n\t\t\tnext.ServeHTTP(w, r)\n\t\t\tlogger.Info(\"request\", \"method\", r.Method, \"path\", r.URL.Path, \"dur\", time.Since(start))\n\t\t})\n\t}\n}\n\n// ใน handler package — compose middleware เข้ากับ mux\nfunc NewHTTPServerWithMiddleware(\n\tmux *http.ServeMux,\n\tlogging func(http.Handler) http.Handler,\n\tcfg config.Config,\n) (*http.Server, func()) {\n\thandler := logging(mux) // wrap mux ด้วย middleware\n\tsrv := &http.Server{Addr: cfg.Addr, Handler: handler}\n\tcleanup := func() {\n\t\tctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)\n\t\tdefer cancel()\n\t\tsrv.Shutdown(ctx)\n\t}\n\treturn srv, cleanup\n}",
      "highlightLines": [7, 20, 23],
      "annotations": [
        {
          "line": 7,
          "text": "Provider return <b>function type</b> <code>func(http.Handler) http.Handler</code> — Wire ใช้ return type เป็น key ดังนั้น function type ก็เป็น key ได้เช่นกัน"
        },
        {
          "line": 20,
          "text": "Server provider รับ middleware เป็น parameter — ถ้าต้องการ middleware หลายตัว สร้าง struct หรือใช้ named type เพื่อ differentiate"
        },
        {
          "line": 23,
          "text": "<b>Compose</b> ใน provider นี้: <code>logging(mux)</code> ทำให้ handler = middleware wrapped mux — logic นี้อยู่ใน provider ไม่ใช่ใน injector"
        }
      ]
    },
    {
      "type": "heading",
      "level": 2,
      "text": "wire.Value สำหรับ Config ที่โหลดแล้ว"
    },
    {
      "type": "paragraph",
      "html": "บางครั้ง Config ถูกโหลดก่อนที่จะเรียก injector (เช่น parse flags แล้วได้ <code>Config</code> struct มาแล้ว) เราสามารถส่ง Config เข้า injector โดยตรงเป็น parameter หรือใช้ <code>wire.Value</code> ได้"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// วิธีที่ 1: ส่ง Config เป็น parameter ของ injector (แนะนำ)\n//go:build wireinject\n\nfunc InitApp(cfg config.Config) (*http.Server, func(), error) {\n\twire.Build(\n\t\t// config.Set ไม่จำเป็นแล้ว เพราะ cfg คือ input ของ injector\n\t\trepo.Set,\n\t\tservice.Set,\n\t\thandler.Set,\n\t)\n\treturn nil, nil, nil\n}\n\n// main.go\nfunc main() {\n\tcfg, err := config.Load(\"config.yaml\")\n\tif err != nil {\n\t\tlog.Fatal(err)\n\t}\n\t// cfg ถูกส่งเข้า injector เป็น argument โดยตรง\n\tsrv, cleanup, err := InitApp(cfg)\n\tif err != nil {\n\t\tlog.Fatal(err)\n\t}\n\tdefer cleanup()\n\tsrv.ListenAndServe()\n}",
      "highlightLines": [4, 20],
      "annotations": [
        {
          "line": 4,
          "text": "Injector รับ <code>config.Config</code> เป็น <b>parameter</b> — Wire จะ treat parameter เหมือน pre-provided value ที่ไม่ต้องมี provider สร้าง"
        },
        {
          "line": 20,
          "text": "โหลด Config ใน <code>main()</code> ก่อน แล้วส่งเข้า injector — ทำให้แยก config loading ออกจาก Wire graph ได้ชัดเจน"
        }
      ]
    },
    {
      "type": "callout",
      "variant": "warning",
      "title": "Pitfall: อย่าใส่ Business Logic ใน Injector",
      "html": "Injector body มีไว้สำหรับ <code>wire.Build(...)</code> เท่านั้น Wire อ่านแค่ <code>wire.Build</code> call ใน body ส่วน logic อื่นจะถูกละเว้นในการ codegen <strong>ห้าม</strong>เขียน if/for/switch หรือ business logic ใด ๆ ใน injector นอก <code>wire.Build</code><br><br>ตัวอย่างที่ผิด:<br><code>func InitApp(env string) *App {<br>&nbsp;&nbsp;if env == \"prod\" { ... } // ← Wire ไม่เห็น logic นี้!<br>&nbsp;&nbsp;wire.Build(...)<br>}</code>"
    },
    {
      "type": "callout",
      "variant": "warning",
      "title": "Pitfall: อย่า Wire Request-Scoped Values ตอน Startup",
      "html": "Wire ทำงาน <strong>ครั้งเดียวตอน app start</strong> — ไม่มี runtime scope เหมือน Spring @RequestScope ถ้าต้องการค่าที่เปลี่ยนต่อ request เช่น <code>*http.Request</code>, user ID, trace ID ให้ส่งผ่าน <b>function argument</b> หรือ <b>context.Context</b> แทน ไม่ใช่ผ่าน Wire injector"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "สรุป: Checklist สำหรับ HTTP/gRPC Integration"
    },
    {
      "type": "list",
      "ordered": false,
      "items": [
        "<strong>แบ่ง provider set ตาม layer</strong> — config, repo, service, handler/transport แต่ละ layer มี <code>wire.NewSet</code> ของตัวเอง",
        "<strong>Root type ของ injector คือ server</strong> — <code>*http.Server</code> หรือ <code>*grpc.Server</code> ที่ Wire ต้อง build ถึง",
        "<strong>Cleanup ทุก resource</strong> — DB, HTTP server, gRPC server ต้องมี cleanup func เสมอ",
        "<strong>Config เป็น parameter หรือ provider</strong> — โหลด config ก่อนแล้วส่งเข้า injector หรือมี <code>config.Load</code> เป็น provider",
        "<strong>Middleware เป็น provider</strong> — return function type <code>func(http.Handler) http.Handler</code> และ compose ใน server provider",
        "<strong>main() สั้นมาก</strong> — เรียก injector, check error, defer cleanup, start server — ไม่มี constructor call ใด ๆ",
        "<strong>ห้าม business logic ใน injector</strong> — injector มีไว้สำหรับ wire.Build เท่านั้น"
      ]
    }
  ]
};
