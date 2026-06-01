/* lessons ch07 (TH) */
(window.LESSONS_TH = window.LESSONS_TH || {}).ch07 = {
  "title": "Cleanup Functions และ Error Handling",
  "sections": [
    {
      "type": "heading",
      "level": 2,
      "text": "ทำไม Provider ถึงต้องคืน Cleanup Function?"
    },
    {
      "type": "paragraph",
      "html": "Provider หลายตัวสร้าง resource ที่ต้อง <mark>ปิดหรือปล่อยคืนเมื่อ application หยุดทำงาน</mark> เช่น database connection pool, file handle, HTTP server, หรือ message queue consumer ถ้า provider แค่สร้าง resource แล้วไม่มีทางบอก Wire ว่าจะปิดอย่างไร resource เหล่านั้นก็จะ <strong>รั่ว (leak)</strong> ไปตลอด Wire แก้ปัญหานี้ด้วยการให้ provider ส่ง <code>func()</code> กลับมาเป็น cleanup function"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Provider Signatures ที่ Wire รองรับ"
    },
    {
      "type": "paragraph",
      "html": "Wire รองรับ provider signature ทั้งหมด 4 แบบ ขึ้นอยู่กับว่า provider นั้นมีโอกาส error ไหม และต้องการ cleanup ไหม:"
    },
    {
      "type": "list",
      "ordered": false,
      "items": [
        "<code>func(...) T</code> — ไม่มี error, ไม่มี cleanup (เช่น NewConfig)",
        "<code>func(...) (T, error)</code> — มี error แต่ไม่ต้องการ cleanup",
        "<code>func(...) (T, func())</code> — ไม่มี error แต่ต้องการ cleanup",
        "<code>func(...) (T, func(), error)</code> — มีทั้ง cleanup และ error (รูปแบบสมบูรณ์ที่สุด)"
      ]
    },
    {
      "type": "callout",
      "variant": "observe",
      "title": "จุดสังเกต: ลำดับของ return values",
      "html": "ลำดับใน signature <strong>สำคัญมาก</strong>: ค่าที่ return ต้องเรียงตามลำดับ <code>(T, func(), error)</code> เสมอ — type ก่อน, cleanup ตรงกลาง, error สุดท้าย Wire จะ error ทันทีถ้าลำดับไม่ถูกต้อง"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "เขียน Provider ที่มี Cleanup Function"
    },
    {
      "type": "paragraph",
      "html": "ดูตัวอย่างคลาสสิก: provider ที่เปิด database connection และ return cleanup สำหรับปิด connection นั้น"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "package infra\n\nimport (\n\t\"database/sql\"\n\t\"fmt\"\n\n\t_ \"github.com/lib/pq\"\n)\n\ntype DBConfig struct {\n\tDSN string\n}\n\n// NewDB เปิด connection pool และ return cleanup func สำหรับปิด\nfunc NewDB(cfg DBConfig) (*sql.DB, func(), error) {\n\tdb, err := sql.Open(\"postgres\", cfg.DSN)\n\tif err != nil {\n\t\treturn nil, nil, fmt.Errorf(\"open db: %w\", err)\n\t}\n\tif err := db.Ping(); err != nil {\n\t\tdb.Close()\n\t\treturn nil, nil, fmt.Errorf(\"ping db: %w\", err)\n\t}\n\tcleanup := func() {\n\t\tdb.Close()\n\t}\n\treturn db, cleanup, nil\n}",
      "highlightLines": [15, 18, 20, 21, 24, 25, 27],
      "annotations": [
        {
          "line": 15,
          "text": "Signature <code>(T, func(), error)</code> — นี่คือรูปแบบที่ครบที่สุด บอก Wire ว่า provider นี้ต้องการ cleanup และอาจ fail"
        },
        {
          "line": 18,
          "text": "ถ้า Open fail ส่ง <code>nil, nil, err</code> กลับไป — cleanup เป็น nil เพราะยังไม่มี resource ที่ต้องปิด"
        },
        {
          "line": 20,
          "text": "Ping ตรวจสอบการเชื่อมต่อจริง ถ้า fail ต้อง <code>db.Close()</code> ก่อนที่จะ return error เพราะ sql.Open สำเร็จแล้ว"
        },
        {
          "line": 24,
          "text": "สร้าง cleanup func เป็น closure ที่ capture <code>db</code> ไว้ — เมื่อเรียกจะปิด connection pool"
        },
        {
          "line": 27,
          "text": "Return <code>db, cleanup, nil</code> ตามลำดับที่ถูกต้อง — Wire จะเก็บ cleanup ไว้เรียกทีหลัง"
        }
      ]
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Cleanup Order: LIFO (Last In, First Out)"
    },
    {
      "type": "paragraph",
      "html": "เมื่อ Wire สร้าง injector ที่มี providers หลายตัวซึ่งมี cleanup functions <mark>Wire จะรัน cleanup ในลำดับ LIFO</mark> — resource ที่สร้าง <strong>ทีหลังสุดจะถูก cleanup ก่อน</strong> เหตุผลคือ resource ที่สร้างทีหลังมักพึ่งพา resource ที่สร้างก่อน ดังนั้นต้องปิด dependent ก่อน แล้วค่อยปิด dependency"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// สมมติว่า Wire resolve dependency ในลำดับนี้:\n// 1. NewDB        -> สร้าง *sql.DB       (cleanup: db.Close)\n// 2. NewUserRepo  -> สร้าง *UserRepo     (cleanup: repo.Close)\n// 3. NewServer    -> สร้าง *http.Server  (cleanup: server.Shutdown)\n\n// Wire รวม cleanup ทั้งหมดและสร้าง injector ประมาณนี้:\nfunc InitApp(cfg Config) (*App, func(), error) {\n\tdb, dbCleanup, err := infra.NewDB(cfg.DB)\n\tif err != nil {\n\t\treturn nil, nil, err\n\t}\n\trepo, repoCleanup, err := repo.NewUserRepo(db)\n\tif err != nil {\n\t\tdbCleanup() // A สร้างสำเร็จแล้ว ต้อง cleanup ก่อน return\n\t\treturn nil, nil, err\n\t}\n\tsrv, srvCleanup := server.NewServer(repo)\n\n\t// Wire สร้าง aggregated cleanup ในลำดับ LIFO:\n\tcleanup := func() {\n\t\tsrvCleanup()  // ปิด Server ก่อน  (สร้างทีหลังสุด)\n\t\trepoCleanup() // ปิด Repo ต่อไป\n\t\tdbCleanup()   // ปิด DB สุดท้าย (สร้างแรก)\n\t}\n\treturn NewApp(srv), cleanup, nil\n}",
      "highlightLines": [8, 14, 20, 21, 22, 23],
      "annotations": [
        {
          "line": 8,
          "text": "Wire เรียก providers ตามลำดับ dependency graph — DB ต้องสร้างก่อนเสมอเพราะ Repo ต้องการมัน"
        },
        {
          "line": 14,
          "text": "<strong>จุดสำคัญ:</strong> ถ้า NewUserRepo fail Wire จะรัน <code>dbCleanup()</code> ทันที ก่อน return error — ป้องกัน resource leak"
        },
        {
          "line": 20,
          "text": "Aggregated cleanup ที่ Wire สร้าง — เรียก cleanup ในลำดับย้อนกลับจากที่สร้าง"
        },
        {
          "line": 21,
          "text": "Server ถูกปิดก่อน เพราะถ้าปิด DB ก่อนและ Server ยังรับ request อยู่ จะ panic หรือ error ทันที"
        },
        {
          "line": 23,
          "text": "DB ถูกปิดเป็นลำดับสุดท้าย หลังจากทุก component ที่ใช้มันได้ปิดตัวแล้ว — นี่คือเหตุผลของ LIFO"
        }
      ]
    },
    {
      "type": "callout",
      "variant": "observe",
      "title": "จุดสังเกต: LIFO = Reverse of Creation Order",
      "html": "ถ้าสร้างในลำดับ <strong>A → B → C</strong> cleanup จะรันในลำดับ <strong>C → B → A</strong> เสมอ นึกภาพ stack: push A แล้ว B แล้ว C ตอน cleanup ก็ pop C ออกก่อน แล้ว B แล้ว A เหมือน <code>defer</code> ใน Go ที่รันในลำดับ LIFO เช่นกัน"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Injector ที่มี Cleanup: Signature และการใช้งาน"
    },
    {
      "type": "paragraph",
      "html": "เมื่อมี provider ตัวใดตัวหนึ่งใน dependency graph return <code>func()</code> cleanup <mark>injector ที่ Wire สร้างจะมี <code>func()</code> ใน return signature ด้วย</mark> และถ้า provider ตัวใดตัวหนึ่ง return error injector ก็จะ return error เช่นกัน"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "//go:build wireinject\n\npackage main\n\nimport \"github.com/google/wire\"\n\n// Stub injector — Wire จะสร้าง wire_gen.go ที่มี implementation จริง\nfunc InitApp(cfg Config) (*App, func(), error) {\n\twire.Build(\n\t\tinfra.NewDB,      // return (*sql.DB, func(), error)\n\t\trepo.NewUserRepo, // return (*UserRepo, func(), error)\n\t\tserver.NewServer, // return (*http.Server, func())\n\t\tNewApp,\n\t)\n\treturn nil, nil, nil // placeholder เท่านั้น\n}\n\n// === การเรียกใช้ใน main.go ===\nfunc main() {\n\tcfg := loadConfig()\n\n\tapp, cleanup, err := InitApp(cfg)\n\tif err != nil {\n\t\tlog.Fatalf(\"init failed: %v\", err)\n\t}\n\tdefer cleanup() // สำคัญมาก: ต้อง defer cleanup ทุกครั้ง\n\n\tapp.Run()\n}",
      "highlightLines": [8, 22, 23, 24, 26],
      "annotations": [
        {
          "line": 8,
          "text": "Stub signature <code>(*App, func(), error)</code> — Wire จะ generate implementation ที่ aggregate cleanup ทุกตัวในลำดับ LIFO"
        },
        {
          "line": 22,
          "text": "Injector return values: <code>app</code> คือ result, <code>cleanup</code> คือ aggregated cleanup func, <code>err</code> คือ error จาก provider ใดก็ตามที่ fail"
        },
        {
          "line": 23,
          "text": "ตรวจ error ก่อนเสมอ — ถ้า init fail และเราไม่ check error จะใช้ nil app แล้ว panic"
        },
        {
          "line": 26,
          "text": "<strong>defer cleanup()</strong> ต้องเรียกทุกครั้ง ไม่ว่า app จะหยุดด้วยสาเหตุใด (normal exit, signal, panic) cleanup จะถูก run เสมอ"
        }
      ]
    },
    {
      "type": "callout",
      "variant": "warning",
      "title": "Pitfall: ลืม defer cleanup()",
      "html": "Wire <strong>ไม่รัน cleanup ให้อัตโนมัติ</strong> เมื่อ program จบ cleanup function เป็นแค่ <code>func()</code> ธรรมดา — caller ต้องรับผิดชอบเรียกมันเอง ถ้าลืม <code>defer cleanup()</code> จะเกิด resource leak: connection pool ไม่ถูกปิด, goroutine ค้างอยู่, file handle ไม่ถูก flush ข้อผิดพลาดนี้มองเห็นได้ยากในระหว่าง development แต่จะส่งผลรุนแรงใน production"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Error Handling ระหว่าง Initialization"
    },
    {
      "type": "paragraph",
      "html": "สถานการณ์ที่ละเอียดอ่อนที่สุดคือเมื่อ provider ตัวหนึ่ง fail <strong>หลังจาก</strong> provider ตัวก่อนหน้าสร้าง resource สำเร็จแล้ว Wire จัดการสถานการณ์นี้โดยอัตโนมัติ: รัน cleanup ของ resource ที่สร้างไปแล้วก่อน แล้วค่อย return error"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// สมมติว่า Wire generate code แบบนี้ (simplified):\nfunc InitApp(cfg Config) (*App, func(), error) {\n\t// ขั้นที่ 1: สร้าง DB สำเร็จ\n\tdb, dbCleanup, err := infra.NewDB(cfg.DB)\n\tif err != nil {\n\t\treturn nil, nil, err // ยังไม่มี resource ใดต้อง cleanup\n\t}\n\n\t// ขั้นที่ 2: สร้าง Cache — แต่ FAIL!\n\tcache, cacheCleanup, err := infra.NewRedisCache(cfg.Redis)\n\tif err != nil {\n\t\tdbCleanup() // DB สร้างสำเร็จแล้ว ต้องปิดก่อน return error\n\t\treturn nil, nil, err\n\t}\n\n\t// ขั้นที่ 3: สร้าง Server\n\tsrv, srvCleanup := server.NewServer(db, cache)\n\n\tcleanup := func() {\n\t\tsrvCleanup()\n\t\tcacheCleanup()\n\t\tdbCleanup()\n\t}\n\treturn NewApp(srv), cleanup, nil\n}",
      "highlightLines": [4, 10, 12, 19, 20, 21, 22],
      "annotations": [
        {
          "line": 4,
          "text": "ขั้นที่ 1 สำเร็จ: <code>db</code> และ <code>dbCleanup</code> พร้อมใช้งาน"
        },
        {
          "line": 10,
          "text": "ขั้นที่ 2 fail: Wire-generated code จะต้องไม่ทิ้ง DB connection ที่เปิดไปแล้ว"
        },
        {
          "line": 12,
          "text": "<strong>Wire เรียก dbCleanup() ก่อน return error</strong> — นี่คือพฤติกรรมที่ Wire guarantee: resource ที่สร้างสำเร็จจะถูก cleanup เสมอแม้ initialization จะล้มเหลวภายหลัง"
        },
        {
          "line": 19,
          "text": "Aggregated cleanup เรียง LIFO: Server → Cache → DB"
        }
      ]
    },
    {
      "type": "callout",
      "variant": "tip",
      "title": "Tip: Wire จัดการ mid-init error cleanup ให้อัตโนมัติ",
      "html": "คุณ<strong>ไม่ต้องเขียน error-cleanup logic</strong> นี้ด้วยมือ นั่นคือสาเหตุที่ต้องใช้ cleanup function pattern แทนการปิด resource ในตัว provider เอง Wire จะ generate code ที่ถูกต้องให้ทั้งหมด รวมถึงการ cleanup resource ที่สร้างไปแล้วเมื่อ later provider fail"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "ตัวอย่างจริง: HTTP Server Provider ที่มี Cleanup"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "package server\n\nimport (\n\t\"context\"\n\t\"net/http\"\n\t\"time\"\n)\n\n// NewHTTPServer สร้าง HTTP server และ return cleanup สำหรับ graceful shutdown\nfunc NewHTTPServer(mux *http.ServeMux, cfg Config) (*http.Server, func()) {\n\tsrv := &http.Server{\n\t\tAddr:    cfg.Addr,\n\t\tHandler: mux,\n\t}\n\n\tcleanup := func() {\n\t\tctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)\n\t\tdefer cancel()\n\t\tsrv.Shutdown(ctx) // graceful: รอให้ request ที่ค้างอยู่เสร็จก่อน\n\t}\n\n\treturn srv, cleanup\n}\n\n// NewServeMux สร้าง mux และ register routes\nfunc NewServeMux(userH *UserHandler, orderH *OrderHandler) *http.ServeMux {\n\tmux := http.NewServeMux()\n\tmux.HandleFunc(\"/users\", userH.ServeHTTP)\n\tmux.HandleFunc(\"/orders\", orderH.ServeHTTP)\n\treturn mux\n}",
      "highlightLines": [10, 16, 19, 22],
      "annotations": [
        {
          "line": 10,
          "text": "Signature <code>(*http.Server, func())</code> — ไม่มี error เพราะการสร้าง Server struct ไม่มีทางล้มเหลว (การ Bind port เกิดตอน ListenAndServe ไม่ใช่ตรงนี้)"
        },
        {
          "line": 16,
          "text": "Cleanup เป็น closure ที่ capture <code>srv</code> — จะถูกเรียกเมื่อ injector cleanup ถูกเรียก"
        },
        {
          "line": 19,
          "text": "<code>Shutdown</code> แทน <code>Close</code> เพื่อ graceful shutdown: รอให้ active connections จบก่อนใน timeout ที่กำหนด"
        },
        {
          "line": 22,
          "text": "Wire จะรัน cleanup นี้ <strong>ก่อน</strong> dbCleanup ตาม LIFO order — Server หยุดรับ request ก่อน แล้ว DB ถึงปิด"
        }
      ]
    },
    {
      "type": "callout",
      "variant": "warning",
      "title": "Pitfall: Provider ปิด Resource ด้วยตัวเองแทนที่จะ Return Cleanup",
      "html": "ถ้า provider เรียก <code>db.Close()</code> ด้วยตัวเองใน defer หรือ goroutine <strong>Wire จะไม่รู้ว่ามี cleanup ที่ต้องทำ</strong> และจะไม่รวม resource นั้นเข้า LIFO chain ปัญหาคือ resource อาจถูกปิดในลำดับที่ผิด (เช่น DB ปิดก่อนที่ Server จะหยุด) หรือถูกปิดสองครั้ง ให้ <strong>ส่ง cleanup function กลับเสมอ</strong> และให้ Wire จัดการลำดับ"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "สรุป: Cleanup และ Error Handling ใน Wire"
    },
    {
      "type": "list",
      "ordered": true,
      "items": [
        "Provider ที่ต้องการ cleanup ให้ return <code>(T, func())</code> หรือ <code>(T, func(), error)</code>",
        "Wire รวม cleanup ทั้งหมดเป็น cleanup function เดียวในลำดับ <strong>LIFO</strong> (reverse of creation)",
        "ถ้า provider ตัวหลัง fail Wire จะรัน cleanup ของ resource ที่สร้างไปแล้วก่อน return error",
        "Injector ที่มี cleanup provider จะมี <code>func()</code> ใน return signature",
        "Caller <strong>ต้อง</strong> <code>defer cleanup()</code> ทุกครั้งหลังเรียก injector — Wire ไม่รัน cleanup ให้อัตโนมัติ",
        "ห้าม provider ปิด resource ด้วยตัวเอง — ส่ง cleanup function กลับให้ Wire จัดการลำดับแทน"
      ]
    }
  ]
};
