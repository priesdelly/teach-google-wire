/* lessons ch03 (TH) */
(window.LESSONS_TH = window.LESSONS_TH || {}).ch03 = {
  "title": "Provider คืออะไร และ wire.Build",
  "sections": [
    {
      "type": "heading",
      "level": 2,
      "text": "Provider คืออะไร?"
    },
    {
      "type": "paragraph",
      "html": "ใน Google Wire <mark>provider</mark> คือ <strong>Go function ธรรมดา</strong> ที่ทำหน้าที่สร้างและส่งคืน value ของ type หนึ่ง ๆ — เหมือนกับ constructor ที่เราเขียนอยู่ทุกวันนี้เลย ไม่ต้องเรียน API พิเศษใด ๆ เพิ่มเติม Wire อ่าน <strong>return type</strong> ของ function นั้นเป็น \"key\" เพื่อรู้ว่า provider ตัวนี้ให้ value ชนิดอะไร"
    },
    {
      "type": "callout",
      "variant": "observe",
      "title": "จุดสังเกต: Wire ใช้ Type เป็น Key — ไม่ใช่ชื่อ",
      "html": "Wire จับคู่ dependency <strong>ด้วย Go type เท่านั้น</strong> ชื่อของ function, ชื่อ parameter, หรือชื่อตัวแปร <em>ไม่มีความหมาย</em> กับ Wire เลย ถ้า provider สอง function return <code>*sql.DB</code> เหมือนกัน Wire จะ error ทันที แม้จะตั้งชื่อต่างกัน"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Signature ของ Provider"
    },
    {
      "type": "paragraph",
      "html": "Wire รองรับ provider signature สองรูปแบบหลัก และอนุญาตให้ <strong>parameter เป็น dependency</strong> ที่ Wire ต้องหามาให้:"
    },
    {
      "type": "list",
      "ordered": false,
      "items": [
        "<code>func NewFoo(dep1 A, dep2 B) *Foo</code> — return value เดียว (ไม่มี error)",
        "<code>func NewFoo(dep1 A, dep2 B) (*Foo, error)</code> — return value พร้อม error (Wire จะ propagate error ขึ้นไปยัง injector)",
        "parameter แต่ละตัวคือ dependency ที่ Wire ต้องจัดหามาให้จาก provider อื่น",
        "exported (<code>NewFoo</code>) หรือ unexported (<code>newFoo</code>) ก็ได้ — ใช้ตาม package convention ของคุณ"
      ]
    },
    {
      "type": "code",
      "lang": "go",
      "code": "package main\n\nimport \"database/sql\"\n\n// Provider 1: ไม่มี dependency — return *sql.DB\nfunc NewDB() (*sql.DB, error) {\n\treturn sql.Open(\"postgres\", \"host=localhost dbname=myapp\")\n}\n\n// Provider 2: ต้องการ *sql.DB — Wire จะ inject จาก NewDB\nfunc NewUserRepo(db *sql.DB) *UserRepo {\n\treturn &UserRepo{db: db}\n}\n\n// Provider 3: ต้องการ *UserRepo — Wire จะ inject จาก NewUserRepo\nfunc NewUserService(repo *UserRepo) *UserService {\n\treturn &UserService{repo: repo}\n}",
      "highlightLines": [6, 7, 11, 15],
      "annotations": [
        {
          "line": 6,
          "text": "Return type <code>(*sql.DB, error)</code> — Wire รู้ว่า provider นี้ให้ <b>*sql.DB</b> และอาจ fail ได้"
        },
        {
          "line": 7,
          "text": "ไม่มี parameter = ไม่มี dependency — Wire สร้างได้ทันทีโดยไม่ต้องรอ provider อื่น"
        },
        {
          "line": 11,
          "text": "Parameter <code>db *sql.DB</code> คือ dependency — Wire จะหา provider ที่ return <b>*sql.DB</b> มาส่งให้ (ซึ่งก็คือ NewDB)"
        },
        {
          "line": 15,
          "text": "Wire สร้าง dependency chain โดยอัตโนมัติ: NewDB → NewUserRepo → NewUserService"
        }
      ]
    },
    {
      "type": "callout",
      "variant": "warning",
      "title": "*T และ T คือคนละ Type สำหรับ Wire",
      "html": "ถ้า provider return <code>*UserRepo</code> แต่ consumer ต้องการ <code>UserRepo</code> (ไม่มี pointer) Wire จะ<strong>ไม่จับคู่</strong>ให้และ error ทันที ต้องระวังความสอดคล้องของ pointer vs value ระหว่าง provider return type กับ parameter type ให้ตรงกันทุกตัว"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "wire.Build — ลิสต์ Provider ให้ Wire"
    },
    {
      "type": "paragraph",
      "html": "<code>wire.Build(...)</code> คือคำสั่งที่ใช้ภายใน injector stub เพื่อบอก Wire ว่า <strong>มี provider อะไรบ้าง</strong>ที่จะใช้สร้าง dependency graph Wire จะ trace กลับจาก return type ของ injector ไปหา provider ที่จำเป็นทั้งหมด คล้ายกับการทำ topological sort บน dependency graph"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "//go:build wireinject\n\npackage main\n\nimport \"github.com/google/wire\"\n\n// InitializeUserService คือ injector stub\n// Wire จะอ่านไฟล์นี้และสร้าง wire_gen.go แทน\nfunc InitializeUserService() (*UserService, error) {\n\twire.Build(\n\t\tNewDB,          // provides *sql.DB\n\t\tNewUserRepo,    // provides *UserRepo  (needs *sql.DB)\n\t\tNewUserService, // provides *UserService (needs *UserRepo)\n\t)\n\treturn nil, nil // placeholder — Wire จะแทนที่ด้วยโค้ดจริง\n}",
      "highlightLines": [1, 9, 10, 15],
      "annotations": [
        {
          "line": 1,
          "text": "Build tag <code>//go:build wireinject</code> บังคับ — ถ้าขาด tag นี้เมื่อ <code>wire_gen.go</code> มีอยู่ด้วย compiler จะ error <code>InitializeUserService redeclared</code> เพราะ injector function ถูกนิยามซ้ำในสองไฟล์"
        },
        {
          "line": 9,
          "text": "Return type <code>(*UserService, error)</code> คือ \"เป้าหมาย\" ที่ Wire ต้องสร้าง — Wire จะ trace ย้อนหา provider"
        },
        {
          "line": 10,
          "text": "<code>wire.Build(...)</code> รับ provider functions (และ provider sets) — <strong>ลำดับไม่สำคัญ</strong> Wire คิดลำดับเองจาก type"
        },
        {
          "line": 15,
          "text": "<code>return nil, nil</code> คือ placeholder เท่านั้น — Wire สร้าง body จริงใน <code>wire_gen.go</code> ใส่ logic อื่นที่นี่ไม่มีผล"
        }
      ]
    },
    {
      "type": "heading",
      "level": 2,
      "text": "ผลลัพธ์ที่ Wire สร้าง: wire_gen.go"
    },
    {
      "type": "paragraph",
      "html": "เมื่อรัน <code>wire</code> (หรือ <code>go generate</code>) Wire จะอ่าน stub แล้วสร้าง <code>wire_gen.go</code> ซึ่งเป็นโค้ด Go ธรรมดาที่ <strong>เรียก constructor ตามลำดับที่ถูกต้อง</strong> และ propagate error ให้ครบ:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "//go:build !wireinject\n\n// Code generated by Wire. DO NOT EDIT.\n// wire_gen.go\n\npackage main\n\nfunc InitializeUserService() (*UserService, error) {\n\tdb, err := NewDB()\n\tif err != nil {\n\t\treturn nil, err\n\t}\n\tuserRepo := NewUserRepo(db)\n\tuserService := NewUserService(userRepo)\n\treturn userService, nil\n}",
      "highlightLines": [1, 3, 8, 9, 13, 14],
      "annotations": [
        {
          "line": 1,
          "text": "Build tag <code>!wireinject</code> — ไฟล์นี้ถูกใช้ตอน compile จริง (stub ถูก exclude ออก)"
        },
        {
          "line": 3,
          "text": "ไฟล์นี้สร้างโดย Wire — <strong>อย่าแก้ด้วยมือ</strong> จะถูก overwrite ทุกครั้งที่รัน wire"
        },
        {
          "line": 9,
          "text": "Wire จัดการ error จาก NewDB ให้อัตโนมัติ — propagate ขึ้นไปยัง caller"
        },
        {
          "line": 13,
          "text": "Wire คำนวณลำดับที่ถูกต้อง: NewDB → NewUserRepo → NewUserService เสมอ"
        }
      ]
    },
    {
      "type": "callout",
      "variant": "tip",
      "title": "ลำดับใน wire.Build ไม่สำคัญ",
      "html": "คุณไม่จำเป็นต้องเรียง provider ใน <code>wire.Build</code> ตามลำดับ dependency Wire คำนวณลำดับที่ถูกต้องจาก type graph ให้เอง ดังนั้น <code>wire.Build(NewUserService, NewDB, NewUserRepo)</code> และ <code>wire.Build(NewDB, NewUserRepo, NewUserService)</code> ให้ผลเหมือนกันทุกประการ"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "การอ่าน Dependency Graph"
    },
    {
      "type": "paragraph",
      "html": "วิธีที่ง่ายที่สุดในการ trace dependency graph คือเริ่มจาก <strong>return type ของ injector</strong> แล้วถามว่า \"type นี้ต้องการ parameter อะไร?\" ไล่ไปเรื่อย ๆ จนกว่าจะถึง provider ที่ไม่มี dependency (leaf node):"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// Injector ต้องการ *UserService\n//\n// *UserService ← NewUserService(repo *UserRepo)\n//                           ↑\n//               *UserRepo ← NewUserRepo(db *sql.DB)\n//                                       ↑\n//                        *sql.DB ← NewDB()  ← leaf: ไม่มี dependency\n//\n// Wire อ่าน graph นี้แล้วสร้างโค้ดที่ถูกต้องให้\n\nfunc InitializeUserService() (*UserService, error) {\n\twire.Build(NewDB, NewUserRepo, NewUserService)\n\treturn nil, nil\n}",
      "highlightLines": [3, 5, 7, 12],
      "annotations": [
        {
          "line": 3,
          "text": "Wire เริ่มต้นจากที่นี่ — ต้องการ *UserService จึงมองหา provider ที่ return <b>*UserService</b>"
        },
        {
          "line": 5,
          "text": "NewUserService ต้องการ *UserRepo — Wire มองหา provider ที่ return <b>*UserRepo</b>"
        },
        {
          "line": 7,
          "text": "NewDB ไม่มี parameter — นี่คือ leaf node Wire หยุดที่นี่และรู้ว่า graph สมบูรณ์แล้ว"
        },
        {
          "line": 12,
          "text": "ลิสต์แค่สามบรรทัด — Wire คิดลำดับและ wiring ทั้งหมดแทนเรา"
        }
      ]
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Common Pitfalls และ Error Messages"
    },
    {
      "type": "callout",
      "variant": "warning",
      "title": "Pitfall 1: Missing Provider",
      "html": "ถ้าลืมใส่ provider บางตัวใน <code>wire.Build</code> Wire จะ error ทันที เช่น:\n<code>wire: no provider found for *main.UserRepo</code>\nแก้ไขโดยเพิ่ม provider ที่ขาดลงใน <code>wire.Build(...)</code>"
    },
    {
      "type": "callout",
      "variant": "warning",
      "title": "Pitfall 2: Duplicate Provider (Ambiguous Binding)",
      "html": "ถ้ามี provider สองตัว return type เดียวกัน Wire ไม่รู้จะเลือกตัวไหน:\n<code>wire: *main.UserRepo is provided twice</code>\nแก้ไขโดยลบ provider ที่ไม่ต้องการออกจาก <code>wire.Build</code> — Wire ไม่มีกลไก priority สำหรับ provider ที่ return concrete type เดียวกัน (<code>wire.Bind</code> ใช้สำหรับ interface binding เท่านั้น บทที่ 5)"
    },
    {
      "type": "callout",
      "variant": "warning",
      "title": "Pitfall 3: Logic นอก wire.Build ไม่มีผล",
      "html": "Wire อ่านแค่ <code>wire.Build(...)</code> call เดียวใน injector body ทุกอย่างอื่นที่เขียนนอก wire.Build จะถูกละเว้นอย่างสมบูรณ์ตอน code generation:<br><br><code>func Init() *App {<br>&nbsp;&nbsp;x := computeSomething() // ← Wire ไม่อ่านบรรทัดนี้เลย<br>&nbsp;&nbsp;wire.Build(NewApp)<br>&nbsp;&nbsp;return nil<br>}</code>"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "ตัวอย่างสมบูรณ์: Provider Chain 3 ชั้น"
    },
    {
      "type": "paragraph",
      "html": "มาดูตัวอย่างที่ใช้งานได้จริงทั้งหมดในไฟล์เดียว เพื่อเห็นภาพรวมของ provider chain:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// providers.go\npackage main\n\nimport \"database/sql\"\n\ntype Config struct{ DSN string }\ntype UserRepo struct{ db *sql.DB }\ntype UserService struct{ repo *UserRepo }\n\n// Provider: ไม่มี dependency\nfunc NewDB(cfg Config) (*sql.DB, error) {\n\treturn sql.Open(\"postgres\", cfg.DSN)\n}\n\n// Provider: ต้องการ *sql.DB\nfunc NewUserRepo(db *sql.DB) *UserRepo {\n\treturn &UserRepo{db: db}\n}\n\n// Provider: ต้องการ *UserRepo\nfunc NewUserService(repo *UserRepo) *UserService {\n\treturn &UserService{repo: repo}\n}\n\n// wire.go  (//go:build wireinject ต้องอยู่บรรทัดแรก)\nfunc InitApp(cfg Config) (*UserService, error) {\n\twire.Build(NewDB, NewUserRepo, NewUserService)\n\treturn nil, nil\n}",
      "highlightLines": [11, 16, 21, 26, 27],
      "annotations": [
        {
          "line": 11,
          "text": "NewDB รับ Config struct เป็น dependency — Wire ต้องการ provider สำหรับ Config ด้วย หรือ caller ส่งมาเป็น parameter ของ injector"
        },
        {
          "line": 16,
          "text": "NewUserRepo return <code>*UserRepo</code> (pointer) — consumer ทุกตัวต้องรับ <code>*UserRepo</code> ไม่ใช่ <code>UserRepo</code>"
        },
        {
          "line": 21,
          "text": "Chain สมบูรณ์: Config → *sql.DB → *UserRepo → *UserService"
        },
        {
          "line": 26,
          "text": "Injector รับ <code>cfg Config</code> เป็น parameter — Wire ถือว่า caller จัดหา Config มาให้เอง จึงไม่ต้องมี provider สำหรับ Config"
        },
        {
          "line": 27,
          "text": "ลิสต์ provider สามตัว — Wire สร้าง dependency graph และ generated code ให้ครบ"
        }
      ]
    },
    {
      "type": "callout",
      "variant": "note",
      "title": "Injector Parameter คือ \"Provided Value\" ที่ Caller จัดหาให้",
      "html": "ถ้า injector มี parameter เช่น <code>func InitApp(cfg Config)</code> Wire จะถือว่า <code>Config</code> ถูก provide โดย caller แล้ว และจะไม่หา provider สำหรับ <code>Config</code> ใน <code>wire.Build</code> อีก ทำให้ไม่ต้องเขียน provider สำหรับ value ที่รู้จากภายนอก (เช่น config ที่โหลดก่อน wire)"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "สรุปบทที่ 3"
    },
    {
      "type": "paragraph",
      "html": "Provider คือ <strong>Go constructor function ธรรมดา</strong> — Wire ใช้ return type เป็น key และ parameters เป็น dependency <code>wire.Build(...)</code> ลิสต์ provider ทั้งหมดในระบบ และ Wire จะ trace dependency graph ย้อนจาก injector return type แล้วสร้าง <code>wire_gen.go</code> ที่เรียก constructor ตามลำดับที่ถูกต้อง Pitfall หลัก: <mark>Wire match ด้วย type ไม่ใช่ชื่อ</mark>, <code>*T ≠ T</code>, และ logic นอก <code>wire.Build</code> ไม่มีผลใด ๆ"
    }
  ]
};
