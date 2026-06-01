/* lessons ch01 (TH) */
(window.LESSONS_TH = window.LESSONS_TH || {}).ch01 = {
  "title": "ทำไม Dependency Injection ถึงสำคัญ",
  "sections": [
    {
      "type": "heading",
      "level": 2,
      "text": "Dependency Injection คืออะไร และแก้ปัญหาอะไร"
    },
    {
      "type": "paragraph",
      "html": "ในการพัฒนาซอฟต์แวร์ <mark>Dependency Injection (DI)</mark> คือเทคนิคที่ทำให้ component หนึ่ง ๆ <strong>ไม่ต้องสร้าง dependency ของตัวเองขึ้นมาเอง</strong> แต่รับ dependency เหล่านั้นมาจากภายนอก (เช่น ผ่าน constructor หรือ function parameter) แทน แนวคิดนี้ฟังดูเรียบง่าย แต่มีผลลัพธ์สำคัญสามด้าน:"
    },
    {
      "type": "list",
      "ordered": false,
      "items": [
        "<strong>Coupling ลดลง</strong> — component ไม่ผูกติดกับ implementation จริง แค่รู้ว่าต้องการ interface แบบไหน เปลี่ยน implementation ได้โดยไม่ต้องแตะ component",
        "<strong>Testability สูงขึ้น</strong> — ใน unit test เราส่ง mock หรือ stub เข้าไปแทน dependency จริงได้ทันที ไม่ต้องเชื่อมต่อ database หรือ external service",
        "<strong>เปลี่ยน implementation ได้ง่าย</strong> — อยากสลับจาก PostgreSQL เป็น MySQL? เปลี่ยนแค่ตอน wire-up ไม่ต้องแก้ไฟล์ service เลย"
      ]
    },
    {
      "type": "heading",
      "level": 2,
      "text": "ปัญหาของ Manual Constructor Wiring"
    },
    {
      "type": "paragraph",
      "html": "ก่อนจะเข้าใจว่า Wire ช่วยอะไร ต้องเห็น <mark>ความเจ็บปวดของการ wire dependency ด้วยมือ</mark> ก่อน ลองดู <code>main.go</code> ของแอปพลิเคชันทั่วไปที่มี dependency หลายชั้น:"
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
          "text": "ต้องสร้าง <b>cfg</b> ก่อนเสมอ เพราะทุกอย่างพึ่งพา config"
        },
        {
          "line": 21,
          "text": "ต้องสร้าง <b>database</b> โดยส่ง cfg เข้าไป — ลำดับสำคัญมาก ผิดลำดับ = compile error หรือ nil panic"
        },
        {
          "line": 24,
          "text": "repository ทั้งสองต้องการ database — ถ้าเพิ่ม repository ใหม่ต้องมาแก้ตรงนี้ทุกครั้ง"
        },
        {
          "line": 27,
          "text": "service ต้องการ repository <b>และ</b> config — ถ้า signature ของ NewUserService เปลี่ยน ต้องมาแก้ main.go"
        },
        {
          "line": 30,
          "text": "handler สร้างได้ก็ต่อเมื่อ service พร้อมแล้ว — dependency graph ถูก encode ไว้ใน <b>ลำดับโค้ด</b> ซึ่งเปราะบางมาก"
        }
      ]
    },
    {
      "type": "callout",
      "variant": "observe",
      "title": "จุดสังเกต: ทำไม manual wiring ถึงเปราะบาง",
      "html": "เมื่อโปรเจกต์โตขึ้น <code>main.go</code> จะกลายเป็น \"God file\" ที่รู้จัก implementation ของทุกชั้น ถ้าเพิ่ม dependency ใหม่ใน <code>NewOrderService</code> (เช่น <code>EmailClient</code>) ต้องสร้าง <code>EmailClient</code> ใน main.go ก่อน แล้วส่งให้ถูกต้อง ทำผิดตรงไหนก็ runtime panic ตรวจสอบได้ยาก"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Constructor Injection vs Service Locator"
    },
    {
      "type": "paragraph",
      "html": "DI มีหลายรูปแบบ แต่รูปแบบที่ดีที่สุดและ Go community แนะนำคือ <mark>Constructor Injection</mark> — ส่ง dependency ผ่าน constructor function โดยตรง เปรียบเทียบกับ <strong>Service Locator</strong> ซึ่งเป็น anti-pattern ที่ควรหลีกเลี่ยง:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// BAD: Service Locator pattern — anti-pattern\ntype ServiceLocator struct {\n\tservices map[string]interface{}\n}\n\nfunc (sl *ServiceLocator) Get(name string) interface{} {\n\treturn sl.services[name]\n}\n\nfunc NewOrderService(locator *ServiceLocator) *OrderService {\n\t// dependency ซ่อนอยู่ใน locator ไม่รู้ว่าต้องการอะไรบ้างจาก signature\n\tuserSvc := locator.Get(\"userService\").(*UserService)\n\treturn &OrderService{userSvc: userSvc}\n}\n\n// GOOD: Constructor Injection — dependency ชัดเจนจาก signature\nfunc NewOrderServiceGood(orderRepo OrderRepository, userSvc *UserService, cfg *Config) *OrderService {\n\treturn &OrderService{\n\t\torderRepo: orderRepo,\n\t\tuserSvc:   userSvc,\n\t\tcfg:       cfg,\n\t}\n}",
      "highlightLines": [
        11,
        12,
        17
      ],
      "annotations": [
        {
          "line": 11,
          "text": "<b>ปัญหาหลัก</b> ของ Service Locator: ดู signature แล้วไม่รู้ว่า function ต้องการ dependency อะไรบ้าง ต้องอ่านทั้ง body"
        },
        {
          "line": 12,
          "text": "type assertion <code>.(*UserService)</code> เกิดขึ้น runtime — ถ้า register ผิดประเภทจะ panic ตอน runtime"
        },
        {
          "line": 17,
          "text": "<b>Constructor Injection ที่ดี</b>: dependency ทุกตัวปรากฏใน signature ชัดเจน compiler ตรวจสอบประเภทได้ทันที"
        }
      ]
    },
    {
      "type": "callout",
      "variant": "warning",
      "title": "ทำไม Service Locator ถือเป็น Anti-Pattern",
      "html": "Service Locator ซ่อน dependency ไว้ใน global registry ทำให้ <strong>ไม่สามารถรู้ dependency ของ component จาก signature เพียงอย่างเดียว</strong> ต้องอ่านโค้ดทั้งหมด การเขียน unit test ทำได้ยากเพราะต้อง setup locator ก่อน และ error มักเกิดตอน runtime เมื่อ key ใน registry ไม่มีหรือผิด type"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Runtime DI vs Compile-time DI"
    },
    {
      "type": "paragraph",
      "html": "เมื่อโปรเจกต์โตขึ้น การ wire ด้วยมือยิ่งน่าเบื่อ นักพัฒนาจึงหันมาใช้ <mark>DI framework</mark> แต่ framework เหล่านั้นแบ่งออกเป็นสองกลุ่มใหญ่ ที่มีข้อแลกเปลี่ยนต่างกันมาก:"
    },
    {
      "type": "list",
      "ordered": false,
      "items": [
        "<strong>Runtime DI (Reflection-based)</strong> เช่น <code>uber-go/dig</code>, <code>uber-go/fx</code> ใน Go หรือ Spring Framework ใน Java — framework อ่าน type ของ constructor ผ่าน reflection ตอน runtime แล้วสร้าง dependency graph โดยอัตโนมัติ",
        "<strong>Compile-time DI (Code Generation)</strong> เช่น <code>google/wire</code> ใน Go — tool อ่าน \"provider\" ที่นักพัฒนาเขียน แล้ว <strong>สร้าง Go source code</strong> ที่ wire dependency ให้ ก่อน compile จริง"
      ]
    },
    {
      "type": "callout",
      "variant": "note",
      "title": "ข้อเสียของ Runtime DI (เช่น dig/fx)",
      "html": "<strong>Error ตอน runtime</strong> — ถ้า provider ขาด หรือ type ไม่ตรง จะรู้ตอนรันโปรแกรมเท่านั้น ไม่ใช่ตอน build<br><strong>Reflection overhead</strong> — ทุก startup ต้องใช้ reflection สร้าง dependency graph ใหม่ (เล็กน้อยแต่มีอยู่)<br><strong>Debug ยากกว่า</strong> — stack trace ผ่าน reflection อ่านยาก ไม่ชัดเจนว่าโค้ดส่วนไหนทำให้เกิด error"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Google Wire: Compile-time DI สำหรับ Go"
    },
    {
      "type": "paragraph",
      "html": "<mark>Google Wire</mark> แก้ปัญหาทั้งหมดด้วยแนวทางที่เรียบง่ายมาก: <strong>Wire ไม่ใช่ library ที่รันอยู่ใน program ของคุณ</strong> แต่เป็น <em>code generation tool</em> ที่อ่าน \"provider\" (constructor functions) ที่คุณเขียน แล้วสร้าง <code>wire_gen.go</code> ซึ่งเป็นโค้ด Go ธรรมดาที่ wire dependency ให้ครบก่อนที่จะ compile จริง ผลลัพธ์:"
    },
    {
      "type": "list",
      "ordered": false,
      "items": [
        "<strong>Error ตอน build</strong> — ถ้า provider ขาดหาย Wire จะ error ทันทีตอนรัน <code>wire gen</code> ก่อน compile",
        "<strong>Zero reflection / zero runtime overhead</strong> — <code>wire_gen.go</code> คือโค้ด Go ปกติ ไม่มี magic ใด ๆ ตอน runtime",
        "<strong>Generated code อ่านได้</strong> — เปิด <code>wire_gen.go</code> แล้วอ่านได้เลย เหมือนเขียน manual wiring แต่ Wire เขียนให้",
        "<strong>Compiler ตรวจสอบทุกอย่าง</strong> — type safety ครบถ้วน เพราะมันคือ Go code ธรรมดา"
      ]
    },
    {
      "type": "heading",
      "level": 3,
      "text": "ตัวอย่างเปรียบเทียบ: Before vs After Wire"
    },
    {
      "type": "paragraph",
      "html": "ดูตัวอย่างสั้น ๆ เพื่อให้เห็นภาพ (รายละเอียด Wire API จะอยู่ในบทถัดไป) — ฝั่งซ้ายคือ manual wiring ที่เราต้องเขียนเอง ฝั่งขวาคือสิ่งที่ Wire จะ<strong>สร้างให้อัตโนมัติ</strong>:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// === ที่นักพัฒนาเขียน: wire.go (ไม่ใช่ main.go) ===\n//go:build wireinject\n\npackage main\n\nimport \"github.com/google/wire\"\n\n// InitializeApp บอก Wire ว่าต้องการ *App\n// Wire จะหา providers ที่จำเป็นเองทั้งหมด\nfunc InitializeApp(configPath string) (*App, error) {\n\twire.Build(\n\t\tconfig.Load,\n\t\tdb.NewPostgres,\n\t\trepository.NewUserRepository,\n\t\trepository.NewOrderRepository,\n\t\tservice.NewUserService,\n\t\tservice.NewOrderService,\n\t\thandler.NewUserHandler,\n\t\thandler.NewOrderHandler,\n\t\tNewApp,\n\t)\n\treturn nil, nil // Wire จะแทนที่ body นี้ด้วยโค้ดจริง\n}\n\n// === Wire สร้างให้ใน wire_gen.go ===\n//go:build !wireinject\n\nfunc InitializeApp(configPath string) (*App, error) {\n\tcfg, err := config.Load(configPath)\n\tif err != nil {\n\t\treturn nil, err\n\t}\n\tdatabase, err := db.NewPostgres(cfg.DSN)\n\tif err != nil {\n\t\treturn nil, err\n\t}\n\tuserRepo := repository.NewUserRepository(database)\n\torderRepo := repository.NewOrderRepository(database)\n\tuserSvc := service.NewUserService(userRepo, cfg)\n\torderSvc := service.NewOrderService(orderRepo, userSvc, cfg)\n\tuserHandler := handler.NewUserHandler(userSvc)\n\torderHandler := handler.NewOrderHandler(orderSvc, userSvc)\n\treturn NewApp(userHandler, orderHandler, cfg), nil\n}",
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
          "text": "Build tag <code>//go:build wireinject</code> ทำให้ไฟล์นี้ถูก <b>exclude ออกจาก build จริง</b> — มีแค่ตอนรัน wire gen เท่านั้น"
        },
        {
          "line": 11,
          "text": "นักพัฒนาแค่ <b>ระบุ providers</b> (constructor functions) ใน wire.Build — ไม่ต้องสนใจลำดับ"
        },
        {
          "line": 22,
          "text": "<code>return nil, nil</code> คือ placeholder — Wire จะแทนที่ด้วยโค้ดจริงใน wire_gen.go ไม่ต้องเขียนเอง"
        },
        {
          "line": 26,
          "text": "Build tag <code>//go:build !wireinject</code> ทำให้ไฟล์ wire_gen.go ถูก <b>include ใน build จริง</b> แทนที่ wire.go — ต้องมีเสมอ ไม่งั้น compiler จะพบ InitializeApp สองตัว"
        },
        {
          "line": 28,
          "text": "Wire สร้าง <b>โค้ด Go ธรรมดา</b> ที่อ่านได้ เหมือนกับที่เราเขียนมือใน main.go เลย แต่ถูกต้องทุกครั้ง"
        },
        {
          "line": 29,
          "text": "Wire คำนวณ <b>ลำดับที่ถูกต้อง</b> ของ constructor calls จาก dependency graph โดยอัตโนมัติ ไม่มีทางผิดลำดับ"
        }
      ]
    },
    {
      "type": "callout",
      "variant": "tip",
      "title": "Best Practice: Provider คือ Constructor ธรรมดา",
      "html": "สังเกตว่า <code>config.Load</code>, <code>db.NewPostgres</code> ฯลฯ คือ Go function ธรรมดาที่คุณเขียนอยู่แล้ว <strong>ไม่ต้องเปลี่ยนแปลง signature ใด ๆ</strong> เพื่อใช้กับ Wire โค้ดทุกชิ้นยังคง testable และ usable โดยไม่ผ่าน Wire ได้ตามปกติ"
    },
    {
      "type": "callout",
      "variant": "warning",
      "title": "Wire ไม่ใช่ Service Locator และไม่มี Runtime Container",
      "html": "Wire <strong>ไม่มี global registry</strong>, ไม่มี <code>container.Get(\"serviceName\")</code>, และ <strong>ไม่มี code ของ Wire รันอยู่ใน production binary</strong> เลย สิ่งที่รันคือ <code>wire_gen.go</code> ที่ Wire สร้างให้ ซึ่งก็คือโค้ด Go ปกติธรรมดา — ไม่ต่างจากที่คุณเขียนมือเลย"
    },
    {
      "type": "callout",
      "variant": "note",
      "title": "ไม่ใช่ทุกโปรเจกต์ต้องใช้ DI Framework",
      "html": "สำหรับ microservice เล็ก ๆ หรือ CLI tool ที่มี dependency ไม่กี่ชั้น <strong>manual wiring ใน main.go อาจเพียงพอแล้ว</strong> Wire คุ้มค่าที่สุดเมื่อ dependency graph ซับซ้อน มีหลาย environment (prod/staging/test) ที่ต้องสลับ implementation หรือทีมขนาดกลาง-ใหญ่ที่ต้องการความชัดเจนของ wiring"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "สรุปบทที่ 1"
    },
    {
      "type": "paragraph",
      "html": "เราได้เห็นแล้วว่า <mark>Dependency Injection</mark> แก้ปัญหา coupling, testability และการเปลี่ยน implementation ได้อย่างไร เราเห็นว่า <strong>manual wiring เปราะบาง</strong> เมื่อโปรเจกต์โต และเข้าใจความแตกต่างระหว่าง Constructor Injection (ดี) กับ Service Locator (anti-pattern) จากนั้นเปรียบเทียบ Runtime DI (error ตอน runtime, มี overhead) กับ <strong>Compile-time DI อย่าง Google Wire</strong> (error ตอน build, zero overhead, generated code อ่านได้) ในบทถัดไปเราจะลงมือติดตั้ง Wire และเขียน provider แรกกัน"
    }
  ]
};
