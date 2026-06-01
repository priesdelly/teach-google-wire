/* lessons ch06 (TH) */
(window.LESSONS_TH = window.LESSONS_TH || {}).ch06 = {
  "title": "wire.Struct — Field Injection",
  "sections": [
    {
      "type": "heading",
      "level": 2,
      "text": "Constructor Injection vs Field Injection"
    },
    {
      "type": "paragraph",
      "html": "ในบทที่ผ่านมาเราสร้าง provider ด้วย <strong>constructor function</strong> เช่น <code>func NewAppHandler(db *sql.DB, logger *slog.Logger) *AppHandler</code> ซึ่งได้ผลดีเสมอ แต่ Wire มีอีกวิธีหนึ่งที่ช่วยลด boilerplate เมื่อ struct ของเรา <mark>แค่รวบรวม dependency เข้าด้วยกัน</mark> โดยไม่ต้องการ initialization logic พิเศษ นั่นคือ <strong>wire.Struct</strong>"
    },
    {
      "type": "paragraph",
      "html": "แทนที่จะเขียน constructor function ด้วยมือ เราบอก Wire ว่า <em>\"จงสร้าง struct นี้โดยเอา dependency มา inject เข้า field เหล่านี้เลย\"</em> Wire จะสร้างโค้ดเทียบเท่ากับ <code>&amp;AppHandler{DB: db, Logger: logger}</code> ให้โดยอัตโนมัติ"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "syntax ของ wire.Struct"
    },
    {
      "type": "paragraph",
      "html": "<code>wire.Struct</code> รับ argument สองแบบ:"
    },
    {
      "type": "list",
      "ordered": false,
      "items": [
        "<code>wire.Struct(new(T), \"*\")</code> — inject <strong>ทุก exported field</strong> ของ <code>T</code>",
        "<code>wire.Struct(new(T), \"FieldA\", \"FieldB\")</code> — inject <strong>เฉพาะ field ที่ระบุชื่อ</strong>"
      ]
    },
    {
      "type": "callout",
      "variant": "note",
      "title": "หลักการของ wire.Struct",
      "html": "<code>wire.Struct</code> ไม่ได้เรียกใช้ constructor — มันบอก Wire ให้สร้าง struct literal โดยตรง เช่น <code>&amp;T{FieldA: a, FieldB: b}</code> ซึ่ง Wire จะ resolve <code>a</code> และ <code>b</code> จาก dependency graph เหมือนกับที่ทำกับ constructor parameters ทั่วไป"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "ตัวอย่างที่ 1: inject ทุก exported field ด้วย \"*\""
    },
    {
      "type": "paragraph",
      "html": "สมมติเรามี <code>AppHandler</code> struct ที่รวบรวม dependency สี่ตัว:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// handler/app_handler.go\npackage handler\n\nimport (\n\t\"database/sql\"\n\t\"log/slog\"\n\n\t\"github.com/example/app/config\"\n\t\"github.com/example/app/cache\"\n)\n\ntype AppHandler struct {\n\tDB     *sql.DB\n\tCache  *cache.Client\n\tLogger *slog.Logger\n\tConfig *config.App\n}",
      "highlightLines": [12, 13, 14, 15, 16],
      "annotations": [
        {
          "line": 12,
          "text": "struct นี้มีแค่ fields ไม่มี logic ใดใน constructor — เหมาะมากกับ wire.Struct"
        },
        {
          "line": 13,
          "text": "<b>DB</b> ต้องเป็น exported (ขึ้นต้นด้วยตัวพิมพ์ใหญ่) Wire จึงจะ inject ได้"
        },
        {
          "line": 16,
          "text": "field ทุกตัวเป็น exported — ใช้ \"*\" ได้อย่างปลอดภัย"
        }
      ]
    },
    {
      "type": "paragraph",
      "html": "แทนที่จะเขียน <code>func NewAppHandler(db *sql.DB, c *cache.Client, l *slog.Logger, cfg *config.App) *AppHandler</code> เราใช้ <code>wire.Struct</code> ใน injector แทน:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// wire.go\n//go:build wireinject\n\npackage main\n\nimport (\n\t\"github.com/google/wire\"\n\t\"github.com/example/app/handler\"\n)\n\nfunc InitApp() *handler.AppHandler {\n\twire.Build(\n\t\tprovideDB,\n\t\tprovideCache,\n\t\tprovideLogger,\n\t\tprovideConfig,\n\t\twire.Struct(new(handler.AppHandler), \"*\"), // inject ทุก exported field\n\t)\n\treturn nil\n}",
      "highlightLines": [17],
      "annotations": [
        {
          "line": 17,
          "text": "<b>wire.Struct(new(handler.AppHandler), \"*\")</b> บอก Wire ให้สร้าง AppHandler โดย inject DB, Cache, Logger, Config ทุกตัวจาก graph — ไม่ต้องเขียน constructor เลย"
        }
      ]
    },
    {
      "type": "paragraph",
      "html": "Wire จะสร้าง <code>wire_gen.go</code> ที่มีเนื้อหาเทียบเท่ากับ:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// wire_gen.go (สร้างโดย Wire อัตโนมัติ)\n//go:build !wireinject\n\nfunc InitApp() *handler.AppHandler {\n\tdb := provideDB()\n\tclient := provideCache()\n\tlogger := provideLogger()\n\tcfg := provideConfig()\n\tappHandler := &handler.AppHandler{\n\t\tDB:     db,\n\t\tCache:  client,\n\t\tLogger: logger,\n\t\tConfig: cfg,\n\t}\n\treturn appHandler\n}",
      "highlightLines": [9, 10, 11, 12, 13],
      "annotations": [
        {
          "line": 9,
          "text": "Wire สร้าง struct literal <code>&handler.AppHandler{...}</code> แทน constructor call — นี่คือสิ่งที่ wire.Struct ทำ"
        },
        {
          "line": 10,
          "text": "Wire ใส่ชื่อ field ชัดเจน ไม่ใช่ positional argument เหมือน constructor — อ่านง่าย ไม่สับสนลำดับ"
        }
      ]
    },
    {
      "type": "callout",
      "variant": "observe",
      "title": "จุดสังเกต: wire.Struct เทียบกับ constructor",
      "html": "เมื่อใช้ <code>wire.Struct(new(T), \"*\")</code> Wire จะ resolve dependency ของทุก exported field จาก graph เหมือนกับที่ทำกับ parameter ของ constructor function ทุกประการ — ผลลัพธ์ใน <code>wire_gen.go</code> คือ <code>&amp;T{FieldA: a, FieldB: b}</code> ไม่ใช่การเรียก constructor"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "ตัวอย่างที่ 2: inject เฉพาะ field ที่เลือก"
    },
    {
      "type": "paragraph",
      "html": "บางครั้ง struct มีทั้ง field ที่ต้องการ inject และ field ที่ตั้งค่าเองภายใน เราระบุชื่อ field ที่ต้องการ inject โดยตรงได้:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "type ReportService struct {\n\tDB      *sql.DB      // ต้องการ inject\n\tLogger  *slog.Logger // ต้องการ inject\n\tcounter int          // unexported — Wire ข้ามให้เอง; ตั้งค่าในโค้ด service เอง\n\tversion string       // unexported — ไม่ inject\n}\n\n// ใน wire.Build หรือ wire.NewSet:\nwire.Struct(new(ReportService), \"DB\", \"Logger\")",
      "highlightLines": [4, 5, 9],
      "annotations": [
        {
          "line": 4,
          "text": "<b>unexported field</b> (counter, version) — Wire ไม่สามารถ inject ได้เลย ต้องตั้งค่าด้วยวิธีอื่น"
        },
        {
          "line": 5,
          "text": "ถ้าพยายามระบุ <code>\"counter\"</code> ใน wire.Struct Wire จะ error ทันที เพราะ unexported field ไม่ accessible"
        },
        {
          "line": 9,
          "text": "ระบุแค่ <code>\"DB\"</code> และ <code>\"Logger\"</code> — Wire inject เฉพาะสองตัวนี้ ไม่แตะ counter และ version"
        }
      ]
    },
    {
      "type": "callout",
      "variant": "tip",
      "title": "เมื่อไหรควรระบุชื่อ field แทน \"*\"",
      "html": "ใช้ <code>\"*\"</code> เมื่อต้องการ inject <em>ทุก</em> exported field และทุก field นั้นมี provider ใน graph แล้ว ใช้ชื่อ field เฉพาะเมื่อ struct มี exported field บางตัวที่ <strong>ไม่ต้องการ inject</strong> เช่น field ที่ตั้งค่าใน method หรือ field ที่ใช้ sync primitive"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Pitfall 1: unexported field ถูกละเว้นอย่างเงียบเมื่อใช้ \"*\""
    },
    {
      "type": "paragraph",
      "html": "เมื่อใช้ <code>\"*\"</code> Wire จะ inject เฉพาะ <strong>exported field</strong> เท่านั้น — unexported field ถูกข้ามไปโดยไม่มี error แต่ถ้าเราพยายาม<em>ระบุชื่อ</em> unexported field โดยตรง Wire จะ error:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "type Server struct {\n\tDB      *sql.DB      // exported — inject ได้\n\tLogger  *slog.Logger // exported — inject ได้\n\tmu      sync.Mutex   // unexported — Wire ข้ามเงียบ ๆ เมื่อใช้ \"*\"\n}\n\n// ✅ ใช้ได้: Wire inject DB และ Logger, ข้าม mu\nwire.Struct(new(Server), \"*\")\n\n// ❌ Error: cannot use unexported field \"mu\"\nwire.Struct(new(Server), \"mu\")",
      "highlightLines": [4, 8, 11],
      "annotations": [
        {
          "line": 4,
          "text": "<b>mu</b> เป็น unexported field — เมื่อใช้ \"*\" Wire จะข้ามไปเงียบ ๆ ไม่มี warning"
        },
        {
          "line": 8,
          "text": "ปลอดภัย: Wire inject เฉพาะ DB และ Logger ตาม exported fields ที่มีอยู่"
        },
        {
          "line": 11,
          "text": "Wire error ทันที: ไม่สามารถ inject unexported field ไม่ว่ากรณีใด"
        }
      ]
    },
    {
      "type": "callout",
      "variant": "warning",
      "title": "Pitfall: unexported field ที่ต้องการ init",
      "html": "ถ้า struct มี unexported field ที่ต้องการ initialize เช่น <code>mu sync.Mutex</code> หรือ <code>done chan struct{}</code> <strong>wire.Struct ทำไม่ได้</strong> ต้องเขียน constructor function เพื่อ initialize field เหล่านั้น แล้วใช้ constructor นั้นเป็น provider ตามปกติ"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Pitfall 2: ใช้ \"*\" แต่ field บางตัวไม่มี provider"
    },
    {
      "type": "paragraph",
      "html": "เมื่อใช้ <code>\"*\"</code> Wire จะพยายาม inject <strong>ทุก</strong> exported field ถ้า field ใดไม่มี provider ใน graph Wire จะ error ตอน codegen:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "type AdminHandler struct {\n\tDB       *sql.DB\n\tLogger   *slog.Logger\n\tAuditSvc *audit.Service // ไม่มี provider สำหรับ *audit.Service ใน wire.Build\n}\n\n// wire.go\nfunc InitAdmin() *AdminHandler {\n\twire.Build(\n\t\tprovideDB,\n\t\tprovideLogger,\n\t\t// ลืมใส่ provideAuditSvc!\n\t\twire.Struct(new(AdminHandler), \"*\"),\n\t)\n\treturn nil\n}\n// ❌ Wire error: no provider for *audit.Service",
      "highlightLines": [4, 12, 17],
      "annotations": [
        {
          "line": 4,
          "text": "<b>AuditSvc</b> เป็น exported field — เมื่อใช้ \"*\" Wire จะพยายาม inject ตัวนี้ด้วย"
        },
        {
          "line": 12,
          "text": "ลืมเพิ่ม <code>provideAuditSvc</code> ใน wire.Build — Wire จะ error เพราะหา provider ไม่เจอ"
        },
        {
          "line": 17,
          "text": "Wire error ชัดเจน: บอก type ที่หา provider ไม่เจอ ง่ายต่อการ debug"
        }
      ]
    },
    {
      "type": "callout",
      "variant": "observe",
      "title": "จุดสังเกต: error message ของ Wire ช่วยได้มาก",
      "html": "เมื่อ Wire หา provider ไม่พบสำหรับ field ที่ต้องการ inject มันจะบอก type ที่ขาดชัดเจน เช่น <code>no provider for *audit.Service</code> ทำให้ debug ง่าย แก้แค่เพิ่ม provider ที่ขาดเข้าไปใน <code>wire.Build</code> หรือ provider set ก็พอ"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Pitfall 3: conflict เมื่อมีทั้ง wire.Struct และ constructor provider สำหรับ type เดียวกัน"
    },
    {
      "type": "paragraph",
      "html": "Wire ถือว่า <strong>ต้องมี provider เพียงหนึ่งเดียว</strong> สำหรับแต่ละ type ถ้ามีทั้ง <code>wire.Struct(new(T), ...)</code> และ constructor function ที่ return <code>*T</code> อยู่พร้อมกันใน <code>wire.Build</code> Wire จะ error:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "func NewAppHandler(db *sql.DB, l *slog.Logger) *AppHandler {\n\treturn &AppHandler{DB: db, Logger: l}\n}\n\n// ❌ CONFLICT: สอง provider สำหรับ *AppHandler\nfunc InitApp() *AppHandler {\n\twire.Build(\n\t\tprovideDB,\n\t\tprovideLogger,\n\t\tNewAppHandler,                          // provider 1\n\t\twire.Struct(new(AppHandler), \"*\"),       // provider 2 — conflict!\n\t)\n\treturn nil\n}\n// Wire error: multiple bindings for *AppHandler",
      "highlightLines": [10, 11, 15],
      "annotations": [
        {
          "line": 10,
          "text": "<b>NewAppHandler</b> เป็น provider สำหรับ <code>*AppHandler</code> ตัวที่ 1"
        },
        {
          "line": 11,
          "text": "<b>wire.Struct(new(AppHandler), \"*\")</b> เป็น provider สำหรับ <code>*AppHandler</code> ตัวที่ 2 — ซ้ำกัน!"
        },
        {
          "line": 15,
          "text": "Wire ไม่รู้จะใช้ตัวไหน จึง error ทันที — เลือกแค่วิธีเดียว: constructor หรือ wire.Struct"
        }
      ]
    },
    {
      "type": "heading",
      "level": 2,
      "text": "wire.Struct ใน wire.NewSet"
    },
    {
      "type": "paragraph",
      "html": "เราสามารถใส่ <code>wire.Struct</code> เข้าไปใน <code>wire.NewSet</code> เพื่อ bundle กับ provider อื่น ๆ ใน layer เดียวกันได้:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// handler/wire_set.go\npackage handler\n\nimport \"github.com/google/wire\"\n\nvar HandlerSet = wire.NewSet(\n\twire.Struct(new(AppHandler), \"*\"),\n\twire.Struct(new(AdminHandler), \"DB\", \"Logger\"),\n)",
      "highlightLines": [6, 7, 8],
      "annotations": [
        {
          "line": 6,
          "text": "<b>wire.NewSet</b> รับ wire.Struct ได้โดยตรง — จัดกลุ่ม handler ทั้งหมดไว้ใน set เดียว"
        },
        {
          "line": 7,
          "text": "AppHandler ใช้ \"*\" — inject ทุก exported field"
        },
        {
          "line": 8,
          "text": "AdminHandler ระบุชื่อ field \"DB\" และ \"Logger\" เท่านั้น"
        }
      ]
    },
    {
      "type": "heading",
      "level": 2,
      "text": "เมื่อไหรควรใช้ wire.Struct และเมื่อไหรควรใช้ constructor"
    },
    {
      "type": "list",
      "ordered": false,
      "items": [
        "<strong>ใช้ wire.Struct</strong> เมื่อ struct เป็นแค่ \"กล่อง\" รวม dependency หลายตัว ไม่มี initialization logic พิเศษ เช่น HTTP handler, gRPC service impl, หรือ use case struct",
        "<strong>ใช้ constructor function</strong> เมื่อต้องการ initialize unexported field, validate input, เปิด connection, สร้าง channel, หรือมี logic ใด ๆ ใน constructor",
        "<strong>ข้อแลกเปลี่ยนของ wire.Struct</strong>: fields ต้อง exported ซึ่งลด encapsulation เล็กน้อย — package อื่นสามารถ access หรือแก้ไข field ได้โดยตรง"
      ]
    },
    {
      "type": "callout",
      "variant": "tip",
      "title": "Best Practice: ใช้ wire.Struct อย่างมีเหตุผล",
      "html": "ใน Go การที่ fields เป็น exported ไม่ได้แปลว่า bad design เสมอไป โดยเฉพาะใน HTTP handler หรือ gRPC server impl ที่เป็น <em>leaf node</em> ของ dependency graph ไม่มีใคร depend บน struct เหล่านี้อีก <code>wire.Struct</code> ประหยัด boilerplate ได้มากในกรณีนี้ แต่สำหรับ core domain object หรือ repository ที่ต้องการ encapsulation ให้ใช้ constructor แทน"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "สรุปบทที่ 6"
    },
    {
      "type": "paragraph",
      "html": "<code>wire.Struct</code> เป็นทางเลือกแทน constructor function เมื่อ struct ทำหน้าที่รวบรวม dependency เท่านั้น <code>wire.Struct(new(T), \"*\")</code> inject ทุก exported field ส่วน <code>wire.Struct(new(T), \"F1\", \"F2\")</code> inject เฉพาะ field ที่ระบุ ข้อจำกัดหลักคือ <strong>unexported field ไม่สามารถ inject ได้</strong> และเมื่อใช้ <code>\"*\"</code> ทุก exported field ต้องมี provider ใน graph จึงจะไม่ error นอกจากนี้ห้ามมีทั้ง <code>wire.Struct</code> และ constructor provider สำหรับ type เดียวกันพร้อมกัน"
    }
  ]
};
