/* lessons ch05 (TH) */
(window.LESSONS_TH = window.LESSONS_TH || {}).ch05 = {
  "title": "wire.Bind — ผูก Interface กับ Concrete Type",
  "sections": [
    {
      "type": "heading",
      "level": 2,
      "text": "ปัญหา: Wire ไม่แปลง Interface ให้อัตโนมัติ"
    },
    {
      "type": "paragraph",
      "html": "ใน Go เราออกแบบ component ให้ <mark>depend on interface ไม่ใช่ concrete type</mark> เพื่อให้ทดสอบได้ง่ายและเปลี่ยน implementation ได้โดยไม่กระทบ consumer แต่เมื่อใช้ Wire มีสิ่งสำคัญที่ต้องเข้าใจ: <strong>Wire จับคู่ dependency ด้วย type ที่ตรงกันทุกตัวอักษร</strong> — ถ้า consumer ต้องการ <code>Logger</code> (interface) แต่ provider return <code>*ConsoleLogger</code> (concrete pointer) Wire จะ <em>ไม่</em> แปลงให้อัตโนมัติและจะ error ทันที"
    },
    {
      "type": "callout",
      "variant": "observe",
      "title": "จุดสังเกต: Wire ใช้ type เป็น key ในการจับคู่",
      "html": "Wire สร้าง dependency graph โดยใช้ <strong>return type ของ provider เป็น key</strong> ดังนั้น <code>*ConsoleLogger</code> และ <code>Logger</code> คือคนละ key กันสำหรับ Wire แม้ว่า <code>*ConsoleLogger</code> จะ implement <code>Logger</code> ก็ตาม นี่คือเหตุผลที่ต้องมี <code>wire.Bind</code>"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "ตัวอย่างที่ทำให้เกิด Error"
    },
    {
      "type": "paragraph",
      "html": "ลองดูสถานการณ์ที่พบบ่อย: มี <code>Logger</code> interface และ <code>*ConsoleLogger</code> ที่ implement มัน แต่ <code>NewApp</code> ต้องการ <code>Logger</code> (interface)"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "package app\n\n// Logger คือ interface ที่ consumer ทุกตัวใช้\ntype Logger interface {\n\tLog(msg string)\n}\n\n// ConsoleLogger คือ concrete implementation\ntype ConsoleLogger struct{}\n\nfunc (c *ConsoleLogger) Log(msg string) {\n\tfmt.Println(msg)\n}\n\n// Provider: return *ConsoleLogger (concrete pointer)\nfunc NewConsoleLogger() *ConsoleLogger {\n\treturn &ConsoleLogger{}\n}\n\n// App ต้องการ Logger (interface) ไม่ใช่ *ConsoleLogger\ntype App struct {\n\tlogger Logger\n}\n\nfunc NewApp(logger Logger) *App {\n\treturn &App{logger: logger}\n}",
      "highlightLines": [4, 17, 25],
      "annotations": [
        {
          "line": 4,
          "text": "Consumer ต้องการ <b>Logger interface</b> — นี่คือ type ที่ Wire จะหาใน dependency graph"
        },
        {
          "line": 17,
          "text": "Provider return <b>*ConsoleLogger</b> (concrete type) — Wire จะลงทะเบียน key นี้ ไม่ใช่ Logger"
        },
        {
          "line": 25,
          "text": "<b>Wire จะ error</b> ตรงนี้: ต้องการ Logger แต่ graph มีแค่ *ConsoleLogger — ต้องใช้ wire.Bind เพื่อบอก Wire ว่าให้ใช้ *ConsoleLogger แทน Logger"
        }
      ]
    },
    {
      "type": "callout",
      "variant": "warning",
      "title": "Error ที่จะเกิดขึ้น",
      "html": "เมื่อรัน <code>wire gen</code> จะได้ error ประมาณนี้:<br><code>app/wire.go:10:2: no provider found for app.Logger</code><br>Wire บอกว่าไม่มี provider สำหรับ type <code>app.Logger</code> แม้ว่าจะมี <code>NewConsoleLogger</code> ก็ตาม เพราะมันให้ <code>*ConsoleLogger</code> ไม่ใช่ <code>Logger</code>"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "wire.Bind: วิธีแก้ปัญหา"
    },
    {
      "type": "paragraph",
      "html": "<code>wire.Bind</code> คือวิธีบอก Wire ว่า <strong>\"เมื่อใครต้องการ interface X ให้ใช้ concrete type Y แทน\"</strong> รูปแบบคือ <code>wire.Bind(new(Interface), new(*Concrete))</code> โดย argument ทั้งสองต้องเป็น <code>new(...)</code> เสมอ และ argument แรกคือ interface, argument ที่สองคือ concrete type"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "//go:build wireinject\n\npackage app\n\nimport \"github.com/google/wire\"\n\n// Injector stub\nfunc InitializeApp() *App {\n\twire.Build(\n\t\tNewConsoleLogger,\n\t\twire.Bind(new(Logger), new(*ConsoleLogger)),\n\t\tNewApp,\n\t)\n\treturn nil\n}",
      "highlightLines": [10, 11],
      "annotations": [
        {
          "line": 10,
          "text": "ต้องมี provider สำหรับ <b>*ConsoleLogger</b> ก่อน — wire.Bind ไม่สร้าง provider ให้เอง แค่บอกว่าให้ map interface ไปหา concrete type นี้"
        },
        {
          "line": 11,
          "text": "<b>wire.Bind(new(Logger), new(*ConsoleLogger))</b>: arg แรก = interface ที่ต้องการ, arg สอง = concrete type ที่จะใช้ตอบสนอง — ลำดับสำคัญมาก ห้ามสลับ"
        }
      ]
    },
    {
      "type": "callout",
      "variant": "tip",
      "title": "กฎจำง่ายสำหรับ wire.Bind",
      "html": "<code>wire.Bind(new(<b>Interface</b>), new(<b>*Concrete</b>))</code><br><strong>arg1</strong> = interface ที่ consumer ต้องการ (สิ่งที่ต้อง \"ผูก\")<br><strong>arg2</strong> = concrete type ที่ provider ผลิต (สิ่งที่จะ \"ถูกผูก\")<br>รูป pointer/value ของ arg2 ต้องตรงกับ return type ของ provider <em>ทุกตัวอักษร</em><br><strong>หมายเหตุ:</strong> ใช้ <code>new(*Concrete)</code> เมื่อ provider return pointer (<code>*Concrete</code>) แต่ใช้ <code>new(Concrete)</code> เมื่อ provider return value type (<code>Concrete</code>) — ไม่มีรูปแบบ universal"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "ใส่ wire.Bind ใน wire.NewSet"
    },
    {
      "type": "paragraph",
      "html": "ในโปรเจกต์จริง เราควรรวม <code>wire.Bind</code> เข้ากับ provider set เพื่อให้ reuse ได้ข้าม injectors การใส่ <code>wire.Bind</code> ใน <code>wire.NewSet</code> ทำให้ทุก injector ที่ใช้ set นี้ได้รับ binding โดยอัตโนมัติ"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "package logger\n\nimport (\n\t\"fmt\"\n\t\"github.com/google/wire\"\n)\n\n// Logger interface ที่ consumer ทุกตัวใช้\ntype Logger interface {\n\tLog(msg string)\n}\n\n// ConsoleLogger implementation\ntype ConsoleLogger struct{}\n\nfunc (c *ConsoleLogger) Log(msg string) {\n\tfmt.Println(msg)\n}\n\nfunc NewConsoleLogger() *ConsoleLogger {\n\treturn &ConsoleLogger{}\n}\n\n// LoggerSet รวม provider และ binding ไว้ด้วยกัน\n// ทุก injector ที่ใช้ LoggerSet จะได้ Logger interface ที่ map ไปหา *ConsoleLogger\nvar LoggerSet = wire.NewSet(\n\tNewConsoleLogger,\n\twire.Bind(new(Logger), new(*ConsoleLogger)),\n)",
      "highlightLines": [26, 27, 28],
      "annotations": [
        {
          "line": 26,
          "text": "<b>wire.NewSet</b> รับ providers และ wire.Bind ได้ในชุดเดียวกัน — แนะนำให้ประกาศ set ในไฟล์เดียวกับ providers เสมอ"
        },
        {
          "line": 27,
          "text": "<code>NewConsoleLogger</code> ต้องอยู่ใน set ก่อน wire.Bind — ลำดับใน NewSet ไม่สำคัญ แต่ต้องมีครบ"
        },
        {
          "line": 28,
          "text": "<code>wire.Bind</code> บอกว่า: \"ใครต้องการ Logger ให้ใช้ *ConsoleLogger ที่ NewConsoleLogger สร้างให้\" — เหมือน alias ใน dependency graph"
        }
      ]
    },
    {
      "type": "heading",
      "level": 2,
      "text": "ตัวอย่างเต็ม: Repository Interface + Concrete Type"
    },
    {
      "type": "paragraph",
      "html": "มาดูตัวอย่างที่สมจริงกว่า: <code>UserRepository</code> interface, <code>postgresUserRepo</code> concrete type, และการ bind ใน provider set — พร้อม test injector ที่ใช้ mock แทน"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "package repo\n\nimport (\n\t\"database/sql\"\n\t\"github.com/google/wire\"\n)\n\n// UserRepository คือ interface ที่ service layer ใช้\ntype UserRepository interface {\n\tFindByID(id int) (*User, error)\n\tSave(u *User) error\n}\n\n// postgresUserRepo คือ concrete implementation (unexported)\ntype postgresUserRepo struct {\n\tdb *sql.DB\n}\n\nfunc (r *postgresUserRepo) FindByID(id int) (*User, error) { /* ... */ return nil, nil }\nfunc (r *postgresUserRepo) Save(u *User) error             { /* ... */ return nil }\n\n// NewPostgresUserRepo คือ provider: return *postgresUserRepo (concrete pointer)\nfunc NewPostgresUserRepo(db *sql.DB) *postgresUserRepo {\n\treturn &postgresUserRepo{db: db}\n}\n\n// RepositorySet: รวม provider + bind ไว้ด้วยกัน\nvar RepositorySet = wire.NewSet(\n\tNewPostgresUserRepo,\n\twire.Bind(new(UserRepository), new(*postgresUserRepo)),\n)",
      "highlightLines": [9, 23, 28, 29, 30],
      "annotations": [
        {
          "line": 9,
          "text": "Service layer depend on <b>UserRepository interface</b> — ทำให้สลับ implementation ได้โดยไม่แตะ service"
        },
        {
          "line": 23,
          "text": "Provider return <b>*postgresUserRepo</b> (concrete pointer) — arg สองของ wire.Bind ต้องตรงกับ return type นี้ทุกตัวอักษร รวมถึง pointer <code>*</code>"
        },
        {
          "line": 28,
          "text": "<b>RepositorySet</b> expose เป็น exported var — injector อื่นสามารถ reuse set นี้ได้"
        },
        {
          "line": 29,
          "text": "<code>NewPostgresUserRepo</code> ต้องอยู่ใน set — wire.Bind ต้องมี provider รองรับ *postgresUserRepo"
        },
        {
          "line": 30,
          "text": "<code>wire.Bind(new(UserRepository), new(*postgresUserRepo))</code> — บอก Wire ว่าให้ใช้ *postgresUserRepo ตอบสนอง UserRepository interface"
        }
      ]
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Test Injector: สลับ Mock ด้วย wire.Bind"
    },
    {
      "type": "paragraph",
      "html": "หนึ่งในประโยชน์สำคัญที่สุดของ <code>wire.Bind</code> คือการ <mark>สร้าง test injector ที่ swap mock แทน real implementation</mark> โดยแค่เปลี่ยน binding ในอีก injector หนึ่ง"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "//go:build wireinject\n\npackage main\n\nimport (\n\t\"github.com/google/wire\"\n\t\"myapp/repo\"\n\t\"myapp/service\"\n)\n\n// Production injector: ใช้ PostgreSQL จริง\nfunc InitApp(db *sql.DB) *service.UserService {\n\twire.Build(\n\t\trepo.RepositorySet, // มี wire.Bind สำหรับ production แล้ว\n\t\tservice.NewUserService,\n\t)\n\treturn nil\n}\n\n// Test injector: ใช้ MockUserRepo แทน\nfunc InitTestApp(mock *repo.MockUserRepo) *service.UserService {\n\twire.Build(\n\t\twire.Bind(new(repo.UserRepository), new(*repo.MockUserRepo)),\n\t\tservice.NewUserService,\n\t)\n\treturn nil\n}",
      "highlightLines": [14, 22, 23],
      "annotations": [
        {
          "line": 14,
          "text": "Production injector ใช้ <b>RepositorySet</b> ที่มี binding สำหรับ PostgreSQL อยู่แล้ว — ไม่ต้องประกาศ wire.Bind ซ้ำ"
        },
        {
          "line": 22,
          "text": "Test injector bind <b>MockUserRepo</b> แทน — แค่เปลี่ยน arg สองของ wire.Bind และให้ mock เป็น parameter ของ injector"
        },
        {
          "line": 23,
          "text": "<code>service.NewUserService</code> ต้องการ <code>repo.UserRepository</code> — Wire จะหาจาก binding ที่ประกาศใน wire.Build ของ injector นั้น"
        }
      ]
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Pitfall ที่พบบ่อย"
    },
    {
      "type": "list",
      "ordered": false,
      "items": [
        "<strong>Pitfall 1: ใช้ wire.Bind โดยไม่มี provider สำหรับ concrete type</strong> — <code>wire.Bind</code> ไม่ได้สร้าง provider ให้เอง ต้องมี function ที่ return <code>*Concrete</code> อยู่ใน set หรือ <code>wire.Build</code> ด้วย ไม่เช่นนั้น Wire จะ error: <code>no provider found for *Concrete</code>",
        "<strong>Pitfall 2: สลับ argument order</strong> — <code>wire.Bind(new(*Concrete), new(Interface))</code> ผิด arg แรกต้องเป็น interface เสมอ arg สองต้องเป็น concrete type",
        "<strong>Pitfall 3: pointer vs value ไม่ตรงกับ provider</strong> — ถ้า provider return <code>*ConsoleLogger</code> ต้องใช้ <code>new(*ConsoleLogger)</code> ไม่ใช่ <code>new(ConsoleLogger)</code> Wire ถือว่า <code>*T</code> และ <code>T</code> คนละ type กัน"
      ]
    },
    {
      "type": "callout",
      "variant": "warning",
      "title": "Pitfall: ลืม wire.Bind และ Wire บ่น missing provider",
      "html": "ถ้าลืม <code>wire.Bind</code> แล้ว consumer ต้องการ interface Wire จะรายงาน <code>no provider found for Logger</code> หรือ interface type นั้น ๆ ไม่ใช่ error เรื่อง concrete type นี่คือสัญญาณว่าต้องเพิ่ม <code>wire.Bind</code> เพื่อเชื่อม interface กับ concrete provider"
    },
    {
      "type": "callout",
      "variant": "warning",
      "title": "Pitfall: pointer/value mismatch",
      "html": "ถ้า provider return <code>*ConsoleLogger</code> แต่เขียน <code>wire.Bind(new(Logger), new(ConsoleLogger))</code> (ไม่มี <code>*</code>) Wire จะ error: <code>no provider found for ConsoleLogger</code> เพราะ Wire หา provider ที่ return <code>ConsoleLogger</code> (value) ไม่เจอ ต้องใช้ <code>new(*ConsoleLogger)</code> ให้ตรงกับ return type ของ provider ทุกตัวอักษร"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "เมื่อไหรควรใช้ Interface vs Struct โดยตรง"
    },
    {
      "type": "paragraph",
      "html": "ไม่จำเป็นต้องใช้ interface ทุกที่ <code>wire.Bind</code> มีความหมายเมื่อมีเหตุผลที่ชัดเจน:"
    },
    {
      "type": "list",
      "ordered": false,
      "items": [
        "<strong>ใช้ interface + wire.Bind เมื่อ</strong>: ต้องการ swap implementation ระหว่าง environments (prod vs test, real DB vs in-memory), มีหลาย implementation ที่เป็นไปได้ (SQL vs NoSQL), หรือต้องการ mock ใน unit test",
        "<strong>ใช้ struct โดยตรงเมื่อ</strong>: มี implementation เดียวและไม่มีแผนเปลี่ยน, struct นั้นเป็น internal implementation detail ที่ไม่ expose ข้าม package, หรือ team ต้องการ simplicity ก่อน"
      ]
    },
    {
      "type": "callout",
      "variant": "note",
      "title": "Go Proverb ที่เกี่ยวข้อง",
      "html": "\"Accept interfaces, return structs\" — ในบริบท Wire หมายความว่า: <strong>consumer (parameter) ควรรับ interface</strong> แต่ <strong>provider (return type) ควร return concrete type</strong> แล้วใช้ <code>wire.Bind</code> เชื่อมทั้งสอง pattern นี้ทำให้ได้ความยืดหยุ่นสูงสุด"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "สรุปบทที่ 5"
    },
    {
      "type": "paragraph",
      "html": "เราได้เรียนรู้ว่า <mark>Wire จับคู่ dependency ด้วย exact type</mark> จึงต้องใช้ <code>wire.Bind(new(Interface), new(*Concrete))</code> เพื่อบอกว่า interface ใดควร map ไปหา concrete type ใด กฎสำคัญ: (1) arg แรกคือ interface เสมอ, (2) arg สองต้องตรง pointer/value กับ return type ของ provider, (3) ต้องมี provider สำหรับ concrete type อยู่ใน set หรือ <code>wire.Build</code> ด้วย เราสามารถใส่ <code>wire.Bind</code> ใน <code>wire.NewSet</code> เพื่อ reuse ข้าม injectors และสร้าง test injector ที่ swap mock ได้โดยแค่เปลี่ยน binding"
    }
  ]
};
