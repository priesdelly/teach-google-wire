/* lessons ch04 (TH) */
(window.LESSONS_TH = window.LESSONS_TH || {}).ch04 = {
  "title": "Provider Sets และ wire.NewSet",
  "sections": [
    {
      "type": "heading",
      "level": 2,
      "text": "ทำไมต้องมี Provider Set?"
    },
    {
      "type": "paragraph",
      "html": "ในบทที่ 3 เราส่ง provider ทีละตัวเข้า <code>wire.Build(...)</code> ซึ่งใช้งานได้ดีกับโปรเจกต์เล็ก ๆ แต่เมื่อ dependency graph โตขึ้น การ list providers ทั้งหมดใน <code>wire.Build</code> เพียงจุดเดียวจะทำให้โค้ดดูรก และ <strong>ไม่สามารถ reuse กลุ่ม providers ข้าม injector ได้</strong> Wire จึงมี <mark>wire.NewSet</mark> ให้จัดกลุ่ม providers ที่เกี่ยวข้องกันไว้ด้วยกัน"
    },
    {
      "type": "callout",
      "variant": "observe",
      "title": "จุดสังเกต: Set คือ static grouping ไม่ใช่ runtime object",
      "html": "<code>wire.NewSet(...)</code> <strong>ไม่ได้สร้าง object ใด ๆ ตอน runtime</strong> มันเป็นเพียงการบอก Wire ว่า providers กลุ่มนี้ควรอยู่ด้วยกัน Wire จะ \"คลาย\" (unfold) ทุก set ออกเป็น flat list ของ providers ตอน codegen เท่านั้น ใน <code>wire_gen.go</code> ที่สร้างออกมาจะไม่มี set ปรากฏอยู่เลย"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "สร้าง Provider Set แรก"
    },
    {
      "type": "paragraph",
      "html": "แนวทางที่ดีคือประกาศ <code>var XxxSet = wire.NewSet(...)</code> เป็น <strong>package-level variable</strong> ไว้ในแพ็กเกจเดียวกับ providers เพื่อให้ผู้ใช้แพ็กเกจ import ได้สะดวก ดูตัวอย่างชั้น repository:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// internal/repository/wire.go\npackage repository\n\nimport \"github.com/google/wire\"\n\n// RepositorySet รวม providers ทุกตัวในชั้น repository\nvar RepositorySet = wire.NewSet(\n\tNewPostgresDB,      // func NewPostgresDB(cfg Config) (*sql.DB, func(), error)\n\tNewUserRepository,  // func NewUserRepository(db *sql.DB) *UserRepository\n\tNewOrderRepository, // func NewOrderRepository(db *sql.DB) *OrderRepository\n)",
      "highlightLines": [7, 8, 9, 10],
      "annotations": [
        {
          "line": 7,
          "text": "<b>ประกาศเป็น exported var</b> ระดับ package เพื่อให้ package อื่น import และนำไปใช้ใน wire.Build ได้"
        },
        {
          "line": 8,
          "text": "ใส่ provider ที่เป็น infrastructure เช่น DB connection ไว้ในกลุ่มเดียวกับ repository ที่ใช้มัน"
        },
        {
          "line": 9,
          "text": "repository.NewUserRepository และ NewOrderRepository อยู่ใน set เดียวกัน เพราะทั้งคู่อยู่ใน layer เดียวกัน"
        },
        {
          "line": 10,
          "text": "เพิ่ม repository ใหม่ในอนาคต? แก้ที่นี่จุดเดียว ไม่ต้องแตะ injector"
        }
      ]
    },
    {
      "type": "heading",
      "level": 2,
      "text": "จัดกลุ่มตาม Layer — Service Set และ Handler Set"
    },
    {
      "type": "paragraph",
      "html": "แนวทางที่นิยมคือแบ่ง set ตาม layer ของสถาปัตยกรรม ได้แก่ <strong>repository → service → handler</strong> แต่ละ layer ประกาศ set ของตัวเองใน package ของตัวเอง:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// internal/service/wire.go\npackage service\n\nimport \"github.com/google/wire\"\n\nvar ServiceSet = wire.NewSet(\n\tNewUserService,  // func NewUserService(repo *repository.UserRepository) *UserService\n\tNewOrderService, // func NewOrderService(repo *repository.OrderRepository, u *UserService) *OrderService\n)\n\n// internal/handler/wire.go\npackage handler\n\nimport \"github.com/google/wire\"\n\nvar HandlerSet = wire.NewSet(\n\tNewUserHandler,  // func NewUserHandler(svc *service.UserService) *UserHandler\n\tNewOrderHandler, // func NewOrderHandler(svc *service.OrderService) *OrderHandler\n\tNewServeMux,     // func NewServeMux(u *UserHandler, o *OrderHandler) *http.ServeMux\n)",
      "highlightLines": [6, 16, 18, 19, 20],
      "annotations": [
        {
          "line": 6,
          "text": "ServiceSet รู้จักเฉพาะ providers ของตัวเอง ไม่รู้จัก RepositorySet — <b>ลด coupling ระหว่าง layer</b>"
        },
        {
          "line": 16,
          "text": "HandlerSet แยกต่างหากใน package handler ทำให้ swap ชุด handler ได้โดยไม่กระทบ service layer"
        },
        {
          "line": 18,
          "text": "ใส่ providers ทุกตัวใน layer เดียวกัน — UserHandler, OrderHandler และ ServeMux ล้วนเป็นส่วนของ HTTP layer"
        },
        {
          "line": 20,
          "text": "NewServeMux รับ *UserHandler และ *OrderHandler เป็น dependency — Wire จะ resolve จาก HandlerSet เดียวกัน"
        }
      ]
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Compose Sets — Set ที่รวม Sets อื่น"
    },
    {
      "type": "paragraph",
      "html": "<mark>Set composition</mark> คือพลังที่แท้จริงของ <code>wire.NewSet</code> — เราสามารถสร้าง set ระดับบนที่รวม sets ย่อยจากหลาย layer เข้าด้วยกันได้ Wire จะ unfold ทุก set แบบ recursive จนได้ flat list ของ providers ทั้งหมด:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// --- File 1: internal/app/set.go (normal file, NO build tag) ---\npackage app\n\nimport (\n\t\"github.com/google/wire\"\n\t\"github.com/example/app/internal/handler\"\n\t\"github.com/example/app/internal/repository\"\n\t\"github.com/example/app/internal/service\"\n)\n\n// ApplicationSet รวมทุก layer ไว้ใน set เดียว\nvar ApplicationSet = wire.NewSet(\n\trepository.RepositorySet, // ขยายออกเป็น NewPostgresDB, NewUserRepository, NewOrderRepository\n\tservice.ServiceSet,       // ขยายออกเป็น NewUserService, NewOrderService\n\thandler.HandlerSet,       // ขยายออกเป็น NewUserHandler, NewOrderHandler, NewServeMux\n)\n\n// --- File 2: internal/app/wire.go (injector stub — build tag MUST be first) ---\n//go:build wireinject\n\npackage app\n\nfunc InitializeApp(cfg Config) (*http.Server, func(), error) {\n\twire.Build(ApplicationSet, NewHTTPServer) // ใช้ set แทนที่จะ list provider ทีละตัว\n\treturn nil, nil, nil\n}",
      "highlightLines": [12, 13, 14, 15, 19, 24],
      "annotations": [
        {
          "line": 12,
          "text": "<b>ApplicationSet</b> ไม่ได้ list provider โดยตรง แต่ reference set ย่อยจากแต่ละ layer — ประกาศในไฟล์ปกติ (ไม่มี build tag)"
        },
        {
          "line": 13,
          "text": "Wire จะ unfold repository.RepositorySet ออกเป็น providers ทุกตัวที่อยู่ข้างใน — เหมือน inline expansion"
        },
        {
          "line": 14,
          "text": "service.ServiceSet ถูก unfold เช่นกัน — ไม่มี nesting ใน wire_gen.go ที่สร้างออกมา"
        },
        {
          "line": 15,
          "text": "handler.HandlerSet ครบทุก layer — รวมกัน Wire มีครบทุก provider ที่ต้องการแล้ว"
        },
        {
          "line": 19,
          "text": "<b>//go:build wireinject ต้องอยู่บรรทัดแรกสุดของไฟล์</b> ก่อน package clause เสมอ — นี่คือไฟล์แยกต่างหากจาก set.go"
        },
        {
          "line": 24,
          "text": "<b>wire.Build(ApplicationSet, NewHTTPServer)</b> — แค่บรรทัดเดียวแทน list ยาว 7+ บรรทัด อ่านง่าย ดูแลง่าย"
        }
      ]
    },
    {
      "type": "callout",
      "variant": "tip",
      "title": "แนวทาง: ประกาศ Set ใน Package ของ Providers",
      "html": "วางไฟล์ <code>wire.go</code> (ที่ประกาศ set) ไว้ใน <strong>package เดียวกับ providers</strong> เช่น <code>internal/repository/wire.go</code> ประกาศ <code>RepositorySet</code> ไม่ใช่ประกาศรวมกันที่ <code>internal/app/wire.go</code> เพราะถ้า providers เปลี่ยน (เพิ่ม/ลด) คนแก้จะแก้ที่ package เดิม set ก็อยู่ใกล้ provider เสมอ"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "ใส่ wire.Bind และ wire.Value ใน Set ได้ด้วย"
    },
    {
      "type": "paragraph",
      "html": "<code>wire.NewSet</code> ไม่ได้รับเฉพาะ provider functions เท่านั้น มันรับ <strong>Wire options</strong> ทุกประเภทได้ด้วย เช่น <code>wire.Bind</code> (สำหรับผูก interface กับ concrete type) และ <code>wire.Value</code> (สำหรับใส่ค่าคงที่) ดูตัวอย่าง:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// internal/repository/wire.go\npackage repository\n\nimport (\n\t\"github.com/google/wire\"\n)\n\n// UserRepository เป็น interface ที่ service layer ใช้\ntype UserRepository interface {\n\tFindByID(id int64) (*User, error)\n}\n\nvar RepositorySet = wire.NewSet(\n\tNewPostgresDB,\n\tNewPostgresUserRepo,                                   // return *postgresUserRepo\n\twire.Bind(new(UserRepository), new(*postgresUserRepo)), // ผูก interface กับ concrete\n)",
      "highlightLines": [13, 15, 16],
      "annotations": [
        {
          "line": 13,
          "text": "RepositorySet รวมทั้ง provider function และ wire.Bind ไว้ด้วยกัน ผู้ใช้ set ไม่ต้องรู้รายละเอียด"
        },
        {
          "line": 15,
          "text": "NewPostgresUserRepo คือ provider สำหรับ *postgresUserRepo — ต้องมีก่อน wire.Bind จึงจะทำงานได้"
        },
        {
          "line": 16,
          "text": "<b>wire.Bind ใน set</b> — ทำให้ทุก injector ที่ใช้ RepositorySet ได้รับ binding นี้โดยอัตโนมัติ ไม่ต้อง repeat"
        }
      ]
    },
    {
      "type": "callout",
      "variant": "note",
      "title": "wire.Value ใน Set",
      "html": "<code>wire.Value(someValue)</code> ใส่ใน <code>wire.NewSet</code> ได้เช่นกัน ใช้เมื่อต้องการให้ค่าคงที่ (เช่น default config หรือ hardcoded string) เป็นส่วนหนึ่งของ set โดยไม่ต้องมี provider function แยก แต่ใช้น้อย — ส่วนใหญ่ใช้ provider function ที่ return config แทน"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Pitfall 1: Provider ซ้ำระหว่าง Composed Sets"
    },
    {
      "type": "paragraph",
      "html": "เมื่อ compose sets เข้าด้วยกัน Wire จะตรวจสอบว่า <strong>ไม่มี provider สองตัวที่ return type เดียวกัน</strong> ถ้า sets ที่นำมา compose มี provider ที่ return type ซ้ำกัน Wire จะ error ทันที:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// ตัวอย่าง: สองชุดที่มี provider return *sql.DB ซ้ำกัน\n\nvar SetA = wire.NewSet(\n\tNewPostgresDB, // return (*sql.DB, func(), error)\n)\n\nvar SetB = wire.NewSet(\n\tNewPostgresDB, // return (*sql.DB, func(), error) — ซ้ำกับ SetA!\n)\n\nvar BrokenSet = wire.NewSet(SetA, SetB) // ERROR: duplicate provider for *sql.DB\n\n// Wire จะฟ้อง:\n// wire: multiple bindings for *sql.DB",
      "highlightLines": [4, 8, 11],
      "annotations": [
        {
          "line": 4,
          "text": "SetA มี NewPostgresDB ที่ return *sql.DB"
        },
        {
          "line": 8,
          "text": "SetB มี NewPostgresDB เดียวกัน — ซ้ำกัน! Wire ใช้ return type เป็น key ซ้ำกันไม่ได้เด็ดขาด"
        },
        {
          "line": 11,
          "text": "<b>wire.NewSet(SetA, SetB)</b> จะ fail ตอนรัน wire gen — ไม่ใช่ตอน compile — ต้องแก้ก่อนที่จะ generate ได้"
        }
      ]
    },
    {
      "type": "callout",
      "variant": "warning",
      "title": "Pitfall: Provider ซ้ำใน Set และใน wire.Build พร้อมกัน",
      "html": "อีกกรณีที่พบบ่อยคือ <strong>ใส่ provider ใน set แล้ว ยังส่ง provider ตัวเดียวกันเข้า <code>wire.Build</code> โดยตรงอีกครั้ง</strong> เช่น <code>wire.Build(ApplicationSet, NewPostgresDB)</code> ทั้งที่ ApplicationSet มี NewPostgresDB อยู่แล้ว — Wire จะฟ้อง duplicate provider เช่นกัน แก้ไขโดยเลือกใส่ที่เดียว: ใน set หรือใน <code>wire.Build</code> เท่านั้น"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Pitfall 2: Set ใหญ่เกินไป ทำให้ Reuse ไม่ได้"
    },
    {
      "type": "paragraph",
      "html": "ถ้าสร้าง <code>var EverythingSet = wire.NewSet(...providers ทุกตัว...)</code> เพียง set เดียว จะ reuse เฉพาะส่วนไม่ได้เลย เพราะ Wire ต้อง resolve <strong>ทุก type ที่ providers ใน set return</strong> ให้ครบ ถ้า injector ต้องการ type บางส่วน แต่ set มี provider ที่ return type ที่ injector ไม่ต้องการ และ type นั้นยังขาด dependency อยู่ Wire จะ error:"
    },
    {
      "type": "callout",
      "variant": "warning",
      "title": "ข้อควรรู้: Wire ไม่ใช้ provider ที่ไม่จำเป็น",
      "html": "จริง ๆ แล้ว Wire จะใช้เฉพาะ provider ที่จำเป็นต่อการ resolve return type ของ injector เท่านั้น (<em>tree shaking</em> ของ dependency graph) provider ที่ไม่มี consumer จะถูกละเว้น ดังนั้น set ใหญ่ยังทำงานได้ แต่ <strong>แนวปฏิบัติที่ดี</strong> คือจัดกลุ่มตาม layer/domain เพื่อให้โค้ดอ่านง่ายและ maintain ได้ดีกว่า"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "ตัวอย่างสมบูรณ์: Refactor จาก wire.Build ยาว เป็น Sets"
    },
    {
      "type": "paragraph",
      "html": "ดูการเปรียบเทียบก่อนและหลังการจัดกลุ่มด้วย <code>wire.NewSet</code> เพื่อให้เห็นภาพรวมของบทนี้:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// === BEFORE: ไฟล์ wire.go (//go:build wireinject ต้องอยู่บรรทัดแรกสุดของไฟล์ ก่อน package) ===\n//go:build wireinject\n\npackage app\n\nfunc InitApp(cfg Config) (*http.Server, func(), error) {\n\twire.Build(\n\t\trepository.NewPostgresDB,\n\t\trepository.NewUserRepository,\n\t\trepository.NewOrderRepository,\n\t\tservice.NewUserService,\n\t\tservice.NewOrderService,\n\t\thandler.NewUserHandler,\n\t\thandler.NewOrderHandler,\n\t\thandler.NewServeMux,\n\t\tNewHTTPServer,\n\t)\n\treturn nil, nil, nil\n}\n\n// === AFTER: ไฟล์ wire.go แยกต่างหาก (//go:build wireinject ก็ยังต้องอยู่บรรทัดแรกสุดเช่นกัน) ===\n//go:build wireinject\n\npackage app\n\nfunc InitApp(cfg Config) (*http.Server, func(), error) {\n\twire.Build(\n\t\trepository.RepositorySet,\n\t\tservice.ServiceSet,\n\t\thandler.HandlerSet,\n\t\tNewHTTPServer,\n\t)\n\treturn nil, nil, nil\n}",
      "highlightLines": [7, 27, 29, 30, 31, 32],
      "annotations": [
        {
          "line": 2,
          "text": "<b>//go:build wireinject ต้องอยู่บรรทัดแรกสุดของไฟล์</b> ก่อน package clause เสมอ — นี่เป็นข้อบังคับของ Go build constraints"
        },
        {
          "line": 7,
          "text": "Before: wire.Build ต้อง list providers ทุกตัว — ถ้าเพิ่ม provider ต้องมาแก้ตรงนี้ทุกครั้ง"
        },
        {
          "line": 27,
          "text": "After: wire.Build เห็นแค่ 4 รายการ ชัดเจนว่าแต่ละกลุ่มมาจาก layer ไหน (นี่คือไฟล์ wire.go แยกต่างหาก ไม่ใช่ไฟล์เดียวกับ BEFORE)"
        },
        {
          "line": 29,
          "text": "repository.RepositorySet แทน 3 บรรทัดข้างบน — เพิ่ม repo ใหม่? แก้ที่ RepositorySet จุดเดียว"
        },
        {
          "line": 30,
          "text": "service.ServiceSet และ handler.HandlerSet ก็เช่นกัน — แต่ละ team ดูแล set ของตัวเองได้อิสระ"
        },
        {
          "line": 32,
          "text": "NewHTTPServer ยังส่งตรงเพราะเป็น provider เดี่ยวระดับ app — ไม่จำเป็นต้องสร้าง set สำหรับ provider เดี่ยว"
        }
      ]
    },
    {
      "type": "callout",
      "variant": "tip",
      "title": "สรุป: กฎง่าย ๆ สำหรับการออกแบบ Provider Sets",
      "html": "<strong>1. One set per layer/package</strong> — RepositorySet, ServiceSet, HandlerSet แยกกัน<br><strong>2. Declare set ใน package ของ providers</strong> — ไม่ใช่ที่ injector<br><strong>3. ไม่ต้องสร้าง set สำหรับ provider เดี่ยว</strong> — ส่งตรงใน wire.Build ได้เลย<br><strong>4. Set ไม่ instantiate อะไร</strong> — เป็นแค่ metadata สำหรับ Wire ตอน codegen"
    }
  ]
};
