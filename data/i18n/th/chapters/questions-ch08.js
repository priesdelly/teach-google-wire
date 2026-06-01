/* questions ch08 (TH) */
(window.QUESTIONS_TH = window.QUESTIONS_TH || {}).ch08 = [
  {
    "id": "wire-ch08-q01",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "Wire มี global singleton registry ที่แชร์ instance ข้าม injectors หรือไม่?",
    "options": [
      "มี — Wire เก็บ instance ที่สร้างแล้วไว้ใน global cache เพื่อ reuse",
      "มีเฉพาะเมื่อใช้ wire.Singleton() annotation",
      "มีแต่ต้องเปิดใช้งานด้วย wire.EnableGlobalScope()",
      "ไม่มี — injector แต่ละตัวสร้าง dependency graph อิสระของตัวเอง"
    ],
    "correctAnswerIndex": 3,
    "explanation": "Wire ไม่มี global runtime registry ใดๆ เลย Wire คือ code generator ล้วนๆ — injector แต่ละตัวที่ Wire สร้างคือ Go function ธรรมดาที่เรียก constructor ตามลำดับ ทุกครั้งที่เรียก injector จะสร้าง dependency ใหม่ทั้งหมดแยกกัน <code>wire.Singleton()</code> และ <code>wire.EnableGlobalScope()</code> ไม่มีอยู่จริงใน Wire API"
  },
  {
    "id": "wire-ch08-q02",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "ใน wire.go เดียวกัน เราสามารถมี injector function กี่ตัวได้?",
    "options": [
      "ได้แค่หนึ่งตัวต่อหนึ่ง wire.go file",
      "ได้สูงสุดสองตัว (production และ test)",
      "ได้มากกว่าหนึ่งตัว แต่ต้องอยู่คนละ package",
      "ได้มากกว่าหนึ่งตัว ไม่จำกัดจำนวน"
    ],
    "correctAnswerIndex": 3,
    "explanation": "Wire ไม่จำกัดจำนวน injector function ใน wire.go เดียวกัน เราสามารถมีได้เช่น <code>InitApp</code>, <code>InitTestApp</code>, <code>InitRequestScope</code> ฯลฯ ในไฟล์เดียวกันได้เลย แต่ละ function จะถูก Wire สร้าง implementation แยกกันใน wire_gen.go"
  },
  {
    "id": "wire-ch08-q03",
    "difficulty": "easy",
    "bloomLevel": "understand",
    "question": "ถ้า InitApp และ InitTestApp ต่างก็ระบุ config.Load เป็น provider ทั้งคู่ เมื่อเรียก InitApp() แล้วเรียก InitTestApp() จะมี Config กี่ instance?",
    "options": [
      "หนึ่ง instance — Wire reuse instance เดิมจาก InitApp",
      "ขึ้นอยู่กับว่า config.Load return pointer หรือ value",
      "สอง instance แยกกัน — แต่ละ injector call สร้าง Config ของตัวเอง",
      "ขึ้นอยู่กับ build tag ที่ใช้"
    ],
    "correctAnswerIndex": 2,
    "explanation": "เนื่องจาก Wire ไม่มี global registry แต่ละ injector call สร้าง dependency graph ใหม่ทั้งหมด ดังนั้น <code>config.Load</code> จะถูกเรียกสองครั้งแยกกัน ได้ Config สองอินสแตนซ์ที่อิสระจากกัน ไม่ขึ้นกับ pointer/value หรือ build tag"
  },
  {
    "id": "wire-ch08-q04",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "ข้อใดคือวิธีที่ถูกต้องในการส่ง request-scoped value เช่น *http.Request ให้ Wire รู้จัก?",
    "options": [
      "ใช้ wire.RequestScope(new(*http.Request))",
      "เรียก wire.InjectRequest() ใน HTTP middleware",
      "ลงทะเบียน *http.Request เป็น global provider ก่อน",
      "ส่ง *http.Request เป็น parameter ของ injector function"
    ],
    "correctAnswerIndex": 3,
    "explanation": "วิธีที่ถูกต้องคือส่ง <code>*http.Request</code> เป็น <strong>parameter ของ injector function</strong> เช่น <code>func InitRequestScope(db *sql.DB, r *http.Request) *UserHandler</code> Wire จะปฏิบัติกับ parameter ราวกับว่ามี provider ที่ return ค่านั้นอยู่แล้ว <code>wire.RequestScope</code>, global provider, และ <code>wire.InjectRequest()</code> ไม่มีอยู่จริงใน Wire"
  },
  {
    "id": "wire-ch08-q05",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "เหตุใดจึงไม่ควรใส่ repo.NewPostgresDB เป็น provider ใน per-request injector โดยตรง?",
    "options": [
      "เพราะ Wire ไม่รองรับ database provider ใน per-request injector",
      "เพราะจะทำให้ Wire เรียก sql.Open() สร้าง connection pool ใหม่ทุก HTTP request",
      "เพราะ *sql.DB ไม่สามารถส่งผ่าน function parameter ได้ใน Go",
      "เพราะ per-request injector ต้องใช้เฉพาะ wire.Value() เท่านั้น"
    ],
    "correctAnswerIndex": 1,
    "explanation": "ถ้าระบุ <code>repo.NewPostgresDB</code> ใน per-request injector Wire จะเรียก <code>sql.Open()</code> ทุกครั้งที่ HTTP request เข้ามา ทำให้สร้าง database connection pool ใหม่ทุก request ซึ่งแพงมาก ทำให้ connection exhausted และ performance ตก วิธีที่ถูกคือสร้าง <code>*sql.DB</code> ครั้งเดียวใน app-level injector แล้วส่งเป็น parameter"
  },
  {
    "id": "wire-ch08-q06",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "Wire parameter ของ injector function แตกต่างจาก provider อย่างไร?",
    "options": [
      "ไม่ต่างกัน — parameter และ provider ทำงานเหมือนกันทุกประการ",
      "Parameter คือ value ที่สร้างมาแล้วจากภายนอก Wire ไม่ต้องหา constructor ให้ ส่วน provider คือ function ที่ Wire เรียกเพื่อสร้าง value",
      "Parameter ใช้ได้เฉพาะกับ primitive types ส่วน provider ใช้กับ struct เท่านั้น",
      "Parameter ถูก inject เพียงครั้งเดียวตลอด lifetime ของ app ส่วน provider ถูกเรียกทุก request"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Injector <strong>parameter</strong> คือ value ที่ caller สร้างมาแล้วและส่งเข้ามา Wire ปฏิบัติกับมันราวกับมี provider ที่ return value นั้นอยู่แล้ว ไม่ต้องหา constructor ส่วน <strong>provider</strong> คือ function ที่ Wire จะเรียกเพื่อสร้าง value ข้อจำกัดเรื่อง primitive types และ per-request vs per-app ไม่ถูกต้อง"
  },
  {
    "id": "wire-ch08-q07",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "ต้องการ injector ที่รับ userID string ต่อ request เพื่อให้ UserService รู้ว่า request นี้มาจากใคร ควรเขียน injector signature แบบใด?",
    "code": "// ตัวเลือกที่เป็นไปได้:\n// A:\nfunc InitRequestScope(db *sql.DB, userID string) *UserHandler\n\n// B:\nfunc InitRequestScope(db *sql.DB) *UserHandler\n\n// C:\nfunc InitRequestScope() *UserHandler",
    "options": [
      "แบบ A — ส่ง userID เป็น parameter ของ injector เพื่อให้ Wire inject ลงไปใน graph",
      "แบบ B — ให้ UserService ดึง userID จาก context เอง",
      "แบบ C — ใช้ global variable เก็บ userID",
      "ทั้ง A และ B ถูกต้อง ขึ้นอยู่กับ preference"
    ],
    "correctAnswerIndex": 0,
    "explanation": "แบบ A ถูกต้องที่สุดในบริบทของ Wire — ส่ง <code>userID</code> เป็น parameter ทำให้ Wire รู้จัก <code>string</code> ในฐานะ available value ใน graph และทุก provider ที่ต้องการ <code>string</code> (หรือ type alias ของมัน) จะได้รับ userID โดยตรง แบบ B เป็นทางเลือก (context propagation) แต่ทำได้ภายนอก Wire เท่านั้น แบบ C เป็น anti-pattern เพราะใช้ global mutable state"
  },
  {
    "id": "wire-ch08-q08",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "พิจารณาโค้ดนี้:\n\nfunc main() {\n    appA, cleanup, _ := InitApp(\"config.yaml\")\n    appB, cleanup2, _ := InitApp(\"config.yaml\")\n    defer cleanup()\n    defer cleanup2()\n    _ = appA\n    _ = appB\n}\n\nถ้า InitApp มี config.Load และ repo.NewPostgresDB เป็น provider จะเกิดอะไรขึ้น?",
    "code": "func main() {\n    appA, cleanup, _ := InitApp(\"config.yaml\")\n    appB, cleanup2, _ := InitApp(\"config.yaml\")\n    defer cleanup()\n    defer cleanup2()\n}",
    "options": [
      "appA และ appB แชร์ *sql.DB pool เดียวกัน เพราะ Wire ทำ singleton โดยอัตโนมัติ",
      "appB จะใช้ *sql.DB ที่แคชไว้จาก appA เพราะมี config path เหมือนกัน",
      "เกิด compile error เพราะไม่สามารถเรียก injector เดียวกันสองครั้งได้",
      "appA และ appB มี *sql.DB pool แยกกันสองตัว เพราะแต่ละ InitApp call สร้าง graph ใหม่"
    ],
    "correctAnswerIndex": 3,
    "explanation": "Wire ไม่มี singleton registry ดังนั้น <code>InitApp</code> สองครั้งจะเรียก <code>config.Load</code> สองครั้งและ <code>repo.NewPostgresDB</code> สองครั้ง ได้ <code>*sql.DB</code> pool สองตัวแยกกัน ไม่มีการ cache หรือ share ใดๆ การเรียก injector หลายครั้งถูกต้องตาม Go และ Wire แต่ต้องระวัง resource ที่สร้างซ้ำ"
  },
  {
    "id": "wire-ch08-q09",
    "difficulty": "medium",
    "bloomLevel": "analyze",
    "question": "ข้อใดอธิบาย trade-off ของ per-request injector เทียบกับ context propagation ได้ถูกต้อง?",
    "options": [
      "Per-request injector เร็วกว่าเสมอเพราะหลีกเลี่ยง context lookup",
      "Per-request injector ทำให้ dependency ชัดเจนใน type system แต่สร้าง struct ต่อ request; context propagation เป็น Go idiomatic แต่ซ่อน key-value ใน untyped bag",
      "Context propagation ปลอดภัยกว่าเสมอเพราะ Go compiler ตรวจสอบ context key ได้",
      "ทั้งสองวิธีมีประสิทธิภาพและความชัดเจนเหมือนกันทุกประการ"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Per-request injector ทำให้ dependency ปรากฏชัดในประเภทของ function parameter — compiler ตรวจสอบได้ แต่สร้าง struct ใหม่ต่อ request (overhead เล็กน้อย) Context propagation เป็น Go idiomatic pattern และไม่สร้าง struct เพิ่ม แต่ context.Context เป็น untyped bag of values ซึ่ง compiler ไม่ตรวจสอบ key หรือ type ที่ถูกต้องให้ทั้งสองวิธีมี trade-off ต่างกัน ไม่มีวิธีใดดีกว่าในทุกกรณี"
  },
  {
    "id": "wire-ch08-q10",
    "difficulty": "medium",
    "bloomLevel": "analyze",
    "question": "ถ้าต้องการให้ test injector ใช้ mock UserRepo แทน production UserRepo โดยที่ UserService ต้องการ UserRepository interface วิธีใดถูกต้อง?",
    "code": "type UserRepository interface {\n    FindByID(id string) (*User, error)\n}\ntype postgresUserRepo struct{ db *sql.DB }\ntype mockUserRepo struct{}\n\nfunc (m *mockUserRepo) FindByID(id string) (*User, error) { return &User{}, nil }",
    "options": [
      "ใส่ mockUserRepo เป็น provider โดยตรง ไม่ต้องมี wire.Bind",
      "ใส่ NewMockUserRepo เป็น provider และเพิ่ม wire.Bind(new(UserRepository), new(*mockUserRepo)) ใน test injector",
      "แก้ไข UserService ให้รับ *mockUserRepo แทน UserRepository interface",
      "ใช้ wire.Override(new(UserRepository), new(*mockUserRepo)) ใน test injector"
    ],
    "correctAnswerIndex": 1,
    "explanation": "เนื่องจาก Wire match types ด้วย return type จาก provider ถ้า UserService ต้องการ <code>UserRepository</code> (interface) ต้องใช้ <code>wire.Bind(new(UserRepository), new(*mockUserRepo))</code> ร่วมกับ provider ของ <code>*mockUserRepo</code> เพื่อบอก Wire ว่า concrete type ใดที่ implement interface นั้น การใส่ provider เฉยๆ โดยไม่มี wire.Bind จะทำให้ Wire หา <code>UserRepository</code> ไม่เจอ <code>wire.Override()</code> ไม่มีอยู่ใน Wire API"
  },
  {
    "id": "wire-ch08-q11",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "ต้องการให้ provider ใน per-request injector ใช้ context.Context จาก *http.Request ได้ วิธีใดถูกต้องใน Wire?",
    "code": "// ตัวเลือกที่เป็นไปได้:\n\n// A: provider function แยกต่างหาก\nfunc requestContext(r *http.Request) context.Context { return r.Context() }\n\nfunc InitRequestScope(r *http.Request) *UserHandler {\n    wire.Build(\n        repo.NewUserRepo,\n        service.NewUserService,\n        NewUserHandler,\n        requestContext, // provider: *http.Request -> context.Context\n    )\n    return nil\n}\n\n// B: wire.Value(r.Context()) ใน wire.Build\nfunc InitRequestScopeB(r *http.Request) *UserHandler {\n    wire.Build(\n        repo.NewUserRepo,\n        service.NewUserService,\n        NewUserHandler,\n        wire.Value(r.Context()),\n    )\n    return nil\n}",
    "options": [
      "แบบ A — ใช้ provider function ที่รับ *http.Request และคืน context.Context",
      "แบบ B — ใช้ wire.Value(r.Context()) เพื่อ inject context.Context โดยตรง",
      "ทั้ง A และ B ถูกต้องเหมือนกัน",
      "ไม่มีวิธีใดถูกต้อง ต้องส่ง context.Context เป็น parameter ของ injector โดยตรงเท่านั้น"
    ],
    "correctAnswerIndex": 0,
    "explanation": "แบบ A ถูกต้อง — ใช้ <strong>provider function</strong> <code>requestContext</code> ที่รับ <code>*http.Request</code> และคืน <code>context.Context</code> Wire จะเรียก <code>requestContext(r)</code> เพื่อให้ได้ <code>context.Context</code> ในทุก provider ที่ต้องการ แบบ B ผิด: <code>wire.Value()</code> ปฏิเสธ <strong>function call expression</strong> (<code>r.Context()</code>) เป็น argument เพราะ Wire ต้องสามารถ copy expression เป็น package-level var ได้ นอกจากนี้ <code>context.Context</code> เป็น interface type ซึ่ง <code>wire.Value()</code> ไม่รองรับโดยตรง (ต้องใช้ <code>wire.InterfaceValue()</code>) ตัวเลือก D ก็ถูกต้องทางเลือก แต่ต้องการให้ caller เรียก <code>r.Context()</code> เอง"
  },
  {
    "id": "wire-ch08-q12",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "พิจารณาโค้ดนี้ — ปัญหาคืออะไร?",
    "code": "// wire.go\n//go:build wireinject\n\n// Per-request injector\nfunc InitRequestScope(r *http.Request) *UserHandler {\n    wire.Build(\n        config.Load,          // func(path string) (Config, error)\n        repo.NewPostgresDB,   // func(Config) (*sql.DB, func(), error)\n        repo.NewUserRepo,\n        service.NewUserService,\n        NewUserHandler,\n    )\n    return nil\n}",
    "options": [
      "ขาด wire.Bind สำหรับ UserRepository interface",
      "Wire ไม่รองรับ injector ที่รับ *http.Request เป็น parameter",
      "ไม่มีปัญหา — โค้ดนี้ถูกต้องและมีประสิทธิภาพดี",
      "config.Load และ repo.NewPostgresDB อยู่ใน per-request injector ทำให้สร้าง Config และ DB pool ใหม่ทุก HTTP request"
    ],
    "correctAnswerIndex": 3,
    "explanation": "ปัญหาสำคัญคือ <code>config.Load</code> และ <code>repo.NewPostgresDB</code> อยู่ใน per-request injector ซึ่งหมายความว่าทุก HTTP request จะ: (1) อ่าน config file ใหม่ และ (2) เรียก <code>sql.Open()</code> สร้าง connection pool ใหม่ นี่คือ performance disaster สิ่งเหล่านี้ควรอยู่ใน app-level injector และส่ง <code>*sql.DB</code> เป็น parameter ของ request injector แทน"
  },
  {
    "id": "wire-ch08-q13",
    "difficulty": "hard",
    "bloomLevel": "evaluate",
    "question": "ทีมต้องการออกแบบระบบที่ HTTP handler แต่ละตัวมี logger ที่ฝัง request ID อยู่ ซึ่งต้องสร้างใหม่ต่อ request แต่ DB pool ต้องแชร์กัน สถาปัตยกรรมแบบใดที่ Wire รองรับได้ถูกต้องที่สุด?",
    "options": [
      "ใช้ injector เดียวสำหรับทุกอย่าง แล้วใช้ wire.Singleton() สำหรับ DB",
      "สร้าง app-level injector คืน *sql.DB พร้อม cleanup; สร้าง per-request injector รับ *sql.DB และ requestID string เป็น parameter แล้วสร้าง request-scoped logger ภายใน",
      "ใช้ global variable เก็บ *sql.DB และ wire.Value() inject request ID",
      "Wire ไม่รองรับ pattern นี้ ต้องใช้ Uber fx แทน"
    ],
    "correctAnswerIndex": 1,
    "explanation": "วิธีที่ถูกต้องคือแบ่งเป็นสอง injectors: (1) <strong>App-level</strong> สร้าง <code>*sql.DB</code> ครั้งเดียว (2) <strong>Per-request</strong> รับ <code>*sql.DB</code> และ <code>requestID string</code> เป็น parameter แล้วสร้าง request-scoped logger ที่ฝัง requestID ภายใน graph <code>wire.Singleton()</code> ไม่มีอยู่ใน Wire API การใช้ global variable เป็น anti-pattern Wire รองรับ pattern นี้ได้โดยตรง"
  },
  {
    "id": "wire-ch08-q14",
    "difficulty": "hard",
    "bloomLevel": "evaluate",
    "question": "นักพัฒนาอ้างว่า 'ใช้ per-request injector ทำให้ app ช้าลงมากเพราะสร้าง struct ใหม่ทุก request' ข้อใดประเมินข้อกล่าวนี้ได้ถูกต้องที่สุด?",
    "options": [
      "ถูกทั้งหมด — ควรหลีกเลี่ยง per-request injector เสมอ",
      "ผิด — Wire optimize การสร้าง struct ให้อัตโนมัติด้วย object pooling",
      "ผิด — per-request injector ไม่สร้าง struct ใหม่เลย เพราะ Wire ใช้ cache",
      "ถูกบางส่วน — สร้าง struct มี overhead เล็กน้อย แต่ถ้าออกแบบถูกต้องโดยส่ง heavy singletons เป็น parameter overhead จะน้อยมาก ไม่ใช่ปัญหาสำหรับ application ส่วนใหญ่"
    ],
    "correctAnswerIndex": 3,
    "explanation": "การสร้าง struct ใน Go มี overhead เล็กน้อยจริง แต่ถ้าออกแบบถูกต้อง — ส่ง <code>*sql.DB</code>, HTTP client, และ logger ที่ initialize แล้วเป็น parameter ไม่ให้ per-request injector สร้างใหม่ — overhead จะมาจากการ allocate struct ขนาดเล็กเท่านั้น ซึ่ง Go GC จัดการได้ดี ไม่ใช่ bottleneck สำหรับ application ส่วนใหญ่ Wire ไม่มี object pooling หรือ cache ในตัว"
  },
  {
    "id": "wire-ch08-q15",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "พิจารณา injector สองตัวนี้ — ต่างกันอย่างไรในแง่ dependency graph?",
    "code": "// Injector A\nfunc InitAppA() (*App, func(), error) {\n    wire.Build(config.Load, repo.NewDB, repo.NewUserRepo, service.NewUserService, NewApp)\n    return nil, nil, nil\n}\n\n// Injector B — รับ *sql.DB เป็น parameter\nfunc InitAppB(db *sql.DB) (*App, error) {\n    wire.Build(repo.NewUserRepo, service.NewUserService, NewApp)\n    return nil, nil\n}",
    "options": [
      "ไม่ต่างกัน — Wire สร้างโค้ดที่มีผลลัพธ์เหมือนกันทุกประการ",
      "InitAppA สร้าง *sql.DB เองภายใน graph พร้อม cleanup; InitAppB รับ *sql.DB ที่สร้างมาแล้วจากภายนอก — ผู้ใช้ต้องรับผิดชอบ lifecycle ของ DB เอง",
      "InitAppB เร็วกว่าเพราะ Wire ใช้ DB pool เดิมจาก InitAppA อัตโนมัติ",
      "InitAppA มีปัญหาเพราะ Wire ไม่รองรับ cleanup function ใน injector"
    ],
    "correctAnswerIndex": 1,
    "explanation": "<strong>InitAppA</strong> ให้ Wire รับผิดชอบสร้าง <code>*sql.DB</code> ด้วย <code>repo.NewDB</code> ซึ่งน่าจะ return cleanup function ด้วย Wire จะ wire cleanup ให้อัตโนมัติ <strong>InitAppB</strong> รับ <code>*sql.DB</code> จากภายนอก — ผู้เรียกต้องสร้างและจัดการ lifecycle ของ DB เอง ทำให้ InitAppB ยืดหยุ่นกว่า (แชร์ DB ได้) แต่ไม่มี cleanup ของ DB ใน injector Wire รองรับ cleanup function ได้ปกติ"
  },
  {
    "id": "wire-ch08-q16",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "ต้องการทดสอบ HTTP handler โดยใช้ in-memory repository แทน PostgreSQL โดยไม่แก้ production code ควรทำอย่างไร?",
    "options": [
      "แก้ provider ของ production injector ให้ check environment variable แล้วเลือก implementation",
      "สร้าง test injector แยกต่างหากที่ใช้ wire.Bind swap implementation ด้วย in-memory mock",
      "ใช้ wire.Override() ใน test file เพื่อ override production provider",
      "สร้าง wire_test.go file ที่มี build tag wireinject และ override ผ่าน global variable"
    ],
    "correctAnswerIndex": 1,
    "explanation": "วิธีที่ถูกต้องใน Wire คือสร้าง <strong>test injector แยกต่างหาก</strong> ใน wire.go เดียวกัน เช่น <code>InitTestApp(t *testing.T) (*App, func())</code> ที่ใช้ provider ของ mock และ <code>wire.Bind</code> ที่ต่างออกไป ไม่ต้องแก้ production code เลย <code>wire.Override()</code> ไม่มีอยู่ใน Wire API และการแก้ production provider ให้ check env var เป็น anti-pattern"
  },
  {
    "id": "wire-ch08-q17",
    "difficulty": "hard",
    "bloomLevel": "evaluate",
    "question": "สมมติ service รับ request สูงมาก (10,000 req/s) และใช้ per-request injector ที่สร้าง handler ใหม่ต่อ request นักพัฒนาเสนอให้ย้าย handler ไปสร้างครั้งเดียวใน app-level injector แทน ควรทำหรือไม่ และเหตุใด?",
    "options": [
      "ควร — ย้าย handler ไป app-level เสมอเพราะ per-request injector ไม่รองรับ high throughput",
      "ไม่ควร — Wire บังคับให้ใช้ per-request injector เสมอ",
      "ขึ้นอยู่กับว่า handler มี request-scoped state หรือไม่ ถ้า handler stateless และไม่ต้องการ request-specific values ควรย้ายไป app-level; ถ้ามี request-scoped state ต้องใช้ per-request",
      "ควร — Wire ทำ caching ให้อัตโนมัติอยู่แล้ว แต่ต้องใช้ wire.Cache() annotation"
    ],
    "correctAnswerIndex": 2,
    "explanation": "คำตอบขึ้นอยู่กับ <strong>stateful vs stateless</strong> ถ้า handler ไม่มี request-scoped state (เช่น ไม่ต้องการ request ID, user context, หรือ per-request logger) สามารถย้ายไป app-level ได้และประหยัด allocation ต่อ request แต่ถ้า handler ต้องการ request-specific values เช่น <code>requestID</code> หรือ request-scoped logger ต้องใช้ per-request injector เพื่อส่งค่าเหล่านั้นเข้าไป <code>wire.Cache()</code> ไม่มีอยู่จริงใน Wire"
  },
  {
    "id": "wire-ch08-q18",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "โค้ดนี้มีปัญหาอะไร?",
    "code": "//go:build wireinject\n\npackage main\n\nvar sharedDB *sql.DB\n\nfunc InitApp(cfgPath string) (*App, func(), error) {\n    wire.Build(\n        config.Load,\n        repo.NewPostgresDB, // stores result in sharedDB inside provider\n        repo.NewUserRepo,\n        service.NewUserService,\n        NewApp,\n    )\n    return nil, nil, nil\n}\n\nfunc InitRequestScope(r *http.Request) *UserHandler {\n    wire.Build(\n        wire.Value(sharedDB), // ใช้ global var แทน parameter\n        repo.NewUserRepo,\n        service.NewUserService,\n        NewUserHandler,\n    )\n    return nil\n}",
    "options": [
      "ไม่มีปัญหา — เป็นวิธีที่ถูกต้องในการแชร์ DB ข้าม injectors",
      "wire.Value(sharedDB) ประเมินค่า sharedDB ตอน Wire codegen ไม่ใช่ตอน runtime ทำให้ได้ nil; ควรส่ง *sql.DB เป็น parameter แทน",
      "ปัญหาคือ Wire ไม่รองรับ wire.Value() ใน per-request injector",
      "ปัญหาคือ global variable ทำให้ binary ขนาดใหญ่ขึ้น"
    ],
    "correctAnswerIndex": 1,
    "explanation": "<code>wire.Value(sharedDB)</code> ใน wire.go stub จะถูก Wire copy expression <code>sharedDB</code> ไปสร้างเป็น <strong>package-level var</strong> ใน wire_gen.go เช่น <code>var _wireSqlDBValue = sharedDB</code> ซึ่งถูกประเมินตอน <strong>package initialization</strong> ขณะนั้น <code>sharedDB</code> ยังเป็น <code>nil</code> (zero value) เพราะยังไม่มีการเรียก <code>InitApp</code> ทำให้ <code>InitRequestScope</code> ได้รับ <code>nil</code> เสมอ นอกจากนี้ global mutable variable เป็น anti-pattern ที่ทำให้ test ยาก วิธีที่ถูกคือส่ง <code>*sql.DB</code> เป็น <strong>parameter</strong> ของ <code>InitRequestScope</code> โดยตรง"
  },
  {
    "id": "wire-ch08-q19",
    "difficulty": "easy",
    "bloomLevel": "understand",
    "question": "ข้อใดอธิบาย per-request scoping ใน Wire ได้ถูกต้องที่สุด?",
    "options": [
      "Per-request scoping ทำได้โดยเรียก injector function ใหม่ต่อ request และส่ง request-scoped values เป็น argument",
      "Wire มี annotation @RequestScope ที่ทำ scoping ให้อัตโนมัติเหมือน Spring",
      "ต้องใช้ wire.RequestScoped(new(T)) เพื่อ mark type ว่าเป็น request-scoped",
      "Wire สร้าง new goroutine ต่อ request และ scope ทุก dependency เข้า goroutine นั้น"
    ],
    "correctAnswerIndex": 0,
    "explanation": "Per-request scoping ใน Wire ทำโดย <strong>design ไม่ใช่ annotation</strong> — เรียก injector function ใหม่ทุก request โดยส่ง request-scoped values (เช่น <code>*http.Request</code>, <code>requestID</code>) เป็น parameter Wire จะสร้าง dependency ทุกตัวใน graph ใหม่ต่อการเรียกแต่ละครั้ง <code>@RequestScope</code>, <code>wire.RequestScoped()</code>, และ goroutine scoping ไม่มีอยู่จริงใน Wire"
  },
  {
    "id": "wire-ch08-q20",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "ต้องการให้ test injector รับ *testing.T เพื่อ register cleanup ผ่าน t.Cleanup() ควรเขียน injector signature แบบใด?",
    "code": "// ต้องการสร้าง in-memory repo และ register cleanup ผ่าน t.Cleanup()\nfunc NewInMemoryRepo(t *testing.T) *InMemoryUserRepo {\n    repo := &InMemoryUserRepo{}\n    t.Cleanup(func() { repo.Reset() })\n    return repo\n}",
    "options": [
      "func InitTestApp() (*App, func())",
      "func InitTestApp(t testing.T) (*App, func())",
      "func InitTestApp(t *testing.T) (*App, func())",
      "func InitTestApp() *App"
    ],
    "correctAnswerIndex": 2,
    "explanation": "ควรใช้ <code>func InitTestApp(t *testing.T) (*App, func())</code> เพราะ (1) <code>*testing.T</code> เป็น pointer ตามแบบ Go idiomatic (2) การส่ง <code>*testing.T</code> เป็น parameter ทำให้ Wire รู้จัก type นี้และ provider เช่น <code>NewInMemoryRepo</code> ที่รับ <code>*testing.T</code> สามารถใช้งานได้ (3) return <code>func()</code> cleanup ด้วยเพื่อ release resources ที่ Wire จัดการ (ถ้ามี) <code>testing.T</code> โดยไม่มี pointer เป็น value type ที่ไม่ถูกต้อง"
  }
];
