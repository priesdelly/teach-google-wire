/* questions ch05 (TH) */
(window.QUESTIONS_TH = window.QUESTIONS_TH || {}).ch05 = [
  {
    "id": "wire-ch05-q01",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "wire.Bind ใน Google Wire ใช้สำหรับทำอะไร?",
    "options": [
      "บอก Wire ว่าเมื่อใครต้องการ interface ให้ใช้ concrete type ใดตอบสนอง",
      "สร้าง concrete type ใหม่จาก interface โดยอัตโนมัติ",
      "ผูก provider เข้ากับ package เพื่อให้ Wire ค้นหาได้เร็วขึ้น",
      "บังคับให้ Wire ใช้ pointer แทน value type เสมอ"
    ],
    "correctAnswerIndex": 0,
    "explanation": "<b>wire.Bind</b> บอก Wire ว่า \"เมื่อ dependency ต้องการ interface X ให้ใช้ concrete type Y แทน\" เพราะ Wire จับคู่ dependency ด้วย exact type — <code>Logger</code> interface และ <code>*ConsoleLogger</code> concrete คือคนละ key สำหรับ Wire จึงต้องประกาศ binding ให้ชัดเจน"
  },
  {
    "id": "wire-ch05-q02",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "รูปแบบที่ถูกต้องของ wire.Bind คืออะไร?",
    "options": [
      "wire.Bind(new(*Concrete), new(Interface))",
      "wire.Bind(Interface, Concrete)",
      "wire.Bind(new(Interface), new(*Concrete))",
      "wire.Bind(*Concrete, Interface)"
    ],
    "correctAnswerIndex": 2,
    "explanation": "<code>wire.Bind(new(Interface), new(*Concrete))</code> คือรูปแบบที่ถูกต้อง: <b>arg แรก</b> คือ interface ที่ต้องการผูก, <b>arg สอง</b> คือ concrete type ที่จะตอบสนอง argument ทั้งสองต้องเป็น <code>new(...)</code> เสมอ ห้ามสลับลำดับ"
  },
  {
    "id": "wire-ch05-q03",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "wire.Bind สามารถวางได้ที่ไหนบ้าง?",
    "options": [
      "วางได้เฉพาะใน wire.Build เท่านั้น",
      "วางได้เฉพาะใน wire.NewSet เท่านั้น",
      "วางได้ทั้งใน wire.Build และใน wire.NewSet",
      "วางได้เฉพาะใน injector function body โดยตรงนอก wire.Build"
    ],
    "correctAnswerIndex": 2,
    "explanation": "<code>wire.Bind</code> วางได้ทั้งสองที่: ใน <code>wire.Build(...)</code> โดยตรงหรือใน <code>wire.NewSet(...)</code> การใส่ใน <code>wire.NewSet</code> แนะนำสำหรับโปรเจกต์จริงเพราะ reuse ข้าม injectors ได้"
  },
  {
    "id": "wire-ch05-q04",
    "difficulty": "easy",
    "bloomLevel": "understand",
    "question": "เพราะเหตุใด Wire จึงไม่แปลง *ConsoleLogger ให้เป็น Logger interface โดยอัตโนมัติ ทั้งที่ *ConsoleLogger implement Logger?",
    "options": [
      "เพราะ Go ไม่อนุญาตให้ใช้ pointer type เป็น interface",
      "เพราะ Wire รองรับเฉพาะ concrete type และไม่รองรับ interface เลย",
      "เพราะ *ConsoleLogger เป็น unexported type จึงไม่สามารถ implement interface ได้",
      "เพราะ Wire จับคู่ dependency ด้วย exact type — Logger และ *ConsoleLogger คือคนละ key สำหรับ Wire"
    ],
    "correctAnswerIndex": 3,
    "explanation": "Wire ใช้ <b>return type ของ provider เป็น key</b> ในการสร้าง dependency graph ดังนั้น <code>*ConsoleLogger</code> และ <code>Logger</code> คือคนละ key กัน Wire ไม่ทำ implicit interface conversion เพราะจะทำให้ graph ไม่ชัดเจน จึงต้องใช้ <code>wire.Bind</code> เพื่อประกาศ mapping ชัดเจน"
  },
  {
    "id": "wire-ch05-q05",
    "difficulty": "easy",
    "bloomLevel": "understand",
    "question": "ถ้าต้องการ bind Logger interface ให้ใช้ *ConsoleLogger และ provider ของ ConsoleLogger return *ConsoleLogger ต้องเขียน wire.Bind ว่าอย่างไร?",
    "options": [
      "wire.Bind(new(ConsoleLogger), new(Logger))",
      "wire.Bind(new(*Logger), new(ConsoleLogger))",
      "wire.Bind(new(Logger), new(*ConsoleLogger))",
      "wire.Bind(new(Logger), new(ConsoleLogger))"
    ],
    "correctAnswerIndex": 2,
    "explanation": "<code>wire.Bind(new(Logger), new(*ConsoleLogger))</code> คือคำตอบที่ถูก: arg แรก = <code>Logger</code> interface, arg สอง = <code>*ConsoleLogger</code> (pointer) ซึ่งตรงกับ return type ของ provider ตัวเลือก D ผิดเพราะใช้ <code>ConsoleLogger</code> แบบ value ซึ่งไม่ตรงกับ provider ที่ return pointer"
  },
  {
    "id": "wire-ch05-q06",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "พิจารณาโค้ดต่อไปนี้แล้วบอกว่ามีอะไรผิด",
    "code": "var Set = wire.NewSet(\n    wire.Bind(new(UserRepository), new(*postgresUserRepo)),\n)",
    "options": [
      "ลำดับ argument ของ wire.Bind ผิด ต้องสลับ",
      "ขาด provider function ที่ return *postgresUserRepo ใน Set",
      "wire.NewSet ไม่รองรับ wire.Bind ต้องใส่ใน wire.Build แทน",
      "ต้องใช้ new(postgresUserRepo) ไม่ใช่ new(*postgresUserRepo)"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Set นี้ขาด <b>provider สำหรับ *postgresUserRepo</b> — <code>wire.Bind</code> ไม่ได้สร้าง provider ให้เอง มันแค่บอก Wire ว่า \"ถ้าต้องการ UserRepository ให้ใช้ *postgresUserRepo\" แต่ Wire ยังต้องรู้วิธีสร้าง *postgresUserRepo ก็คือต้องมี <code>NewPostgresUserRepo</code> หรือ provider อื่นอยู่ใน set ด้วย"
  },
  {
    "id": "wire-ch05-q07",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "นักพัฒนาเขียน wire.Bind ดังนี้ แต่ Wire error — อะไรคือสาเหตุ?",
    "code": "func NewConsoleLogger() *ConsoleLogger {\n    return &ConsoleLogger{}\n}\n\nvar Set = wire.NewSet(\n    NewConsoleLogger,\n    wire.Bind(new(Logger), new(ConsoleLogger)), // ไม่มี *\n)",
    "options": [
      "wire.NewSet ไม่รองรับการใส่ provider และ wire.Bind ในชุดเดียวกัน",
      "ไม่มี error เพราะ Go แปลง ConsoleLogger เป็น *ConsoleLogger ให้อัตโนมัติ",
      "wire.Bind arg สองคือ new(ConsoleLogger) แบบ value ไม่ตรงกับ provider ที่ return *ConsoleLogger",
      "Logger interface ไม่สามารถใช้กับ wire.Bind ได้ ต้องใช้ concrete type เท่านั้น"
    ],
    "correctAnswerIndex": 2,
    "explanation": "Provider <code>NewConsoleLogger</code> return <code>*ConsoleLogger</code> (pointer) แต่ <code>wire.Bind</code> บอกว่า concrete type คือ <code>ConsoleLogger</code> (value ไม่มี *) Wire จะหา provider ที่ return <code>ConsoleLogger</code> แบบ value แต่ไม่เจอ ต้องเขียน <code>wire.Bind(new(Logger), new(*ConsoleLogger))</code> ให้ตรงกับ return type ของ provider"
  },
  {
    "id": "wire-ch05-q08",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "ต้องการสร้าง test injector ที่ใช้ MockRepo แทน real PostgreSQL repo โดย MockRepo implement UserRepository interface ควรเขียนอย่างไร?",
    "code": "// Production set (ใช้แล้ว)\nvar ProdSet = wire.NewSet(\n    NewPostgresRepo,\n    wire.Bind(new(UserRepository), new(*PostgresRepo)),\n)\n\n// Test injector — ต้องการใช้ MockRepo แทน\nfunc InitTestService(mock *MockRepo) *UserService {\n    wire.Build( /* ??? */ )\n    return nil\n}",
    "options": [
      "wire.Build(ProdSet, service.NewUserService) แล้ว Wire จะ auto-detect MockRepo",
      "wire.Build(wire.Bind(new(UserRepository), new(*MockRepo)), service.NewUserService)",
      "wire.Build(MockRepo{}, service.NewUserService)",
      "wire.Build(wire.Bind(new(*MockRepo), new(UserRepository)), service.NewUserService)"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Test injector ต้องประกาศ <code>wire.Bind(new(UserRepository), new(*MockRepo))</code> ใหม่เพื่อ map UserRepository ไปหา MockRepo แทน mock parameter จะถูก Wire ใช้เป็น \"given value\" โดยอัตโนมัติเพราะเป็น parameter ของ injector ไม่ต้องมี provider function แยก ตัวเลือก D ผิดเพราะสลับ argument"
  },
  {
    "id": "wire-ch05-q09",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "ข้อใดอธิบายความสัมพันธ์ระหว่าง wire.Bind และ provider function ได้ถูกต้องที่สุด?",
    "options": [
      "wire.Bind เพิ่ม mapping ใน dependency graph โดยบอกว่า interface ผูกกับ concrete type ใด แต่ยังต้องมี provider สำหรับ concrete type อยู่ด้วย",
      "wire.Bind สร้าง provider function ใหม่ให้อัตโนมัติ ไม่ต้องมี provider แยก",
      "wire.Bind คือ shorthand ของการเขียน provider function ที่ return interface",
      "wire.Bind แทนที่ provider function เดิม ทำให้ไม่ต้องมี provider สำหรับ concrete type อีกต่อไป"
    ],
    "correctAnswerIndex": 0,
    "explanation": "<code>wire.Bind</code> <b>เพิ่ม edge ใน dependency graph</b> บอกว่า \"interface X ใช้ concrete Y\" แต่ Wire ยังต้องรู้วิธีสร้าง Y อยู่ดี ดังนั้นต้องมี provider สำหรับ concrete type อยู่ใน set หรือ wire.Build เสมอ wire.Bind ไม่สร้าง provider และไม่แทนที่ provider"
  },
  {
    "id": "wire-ch05-q10",
    "difficulty": "medium",
    "bloomLevel": "analyze",
    "question": "มีสอง interface คือ Logger และ Metrics และสอง concrete types คือ *ZapLogger (implement Logger) และ *PrometheusMetrics (implement Metrics) ต้องการ bind ทั้งคู่ ควรเขียนอย่างไรใน wire.NewSet?",
    "options": [
      "wire.NewSet(NewZapLogger, NewPrometheusMetrics, wire.Bind(new(Logger), new(Metrics), new(*ZapLogger), new(*PrometheusMetrics)))",
      "wire.NewSet(NewZapLogger, NewPrometheusMetrics, wire.Bind(new(Logger), new(*ZapLogger)), wire.Bind(new(Metrics), new(*PrometheusMetrics)))",
      "wire.NewSet(wire.Bind(new(Logger), new(*ZapLogger), new(Metrics), new(*PrometheusMetrics)))",
      "wire.NewSet(NewZapLogger, NewPrometheusMetrics, wire.Bind(new(*ZapLogger), new(Logger)), wire.Bind(new(*PrometheusMetrics), new(Metrics)))"
    ],
    "correctAnswerIndex": 1,
    "explanation": "แต่ละ binding ต้องเป็น <code>wire.Bind</code> แยกกัน 1 เรียก 1 binding เท่านั้น ดังนั้นต้องเรียกสองครั้ง: <code>wire.Bind(new(Logger), new(*ZapLogger))</code> และ <code>wire.Bind(new(Metrics), new(*PrometheusMetrics))</code> ตัวเลือก D ผิดเพราะสลับ argument order ใน wire.Bind"
  },
  {
    "id": "wire-ch05-q11",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "provider function ต่อไปนี้ return value type (ไม่ใช่ pointer) ต้องเขียน wire.Bind อย่างไร?",
    "code": "type Cache interface {\n    Get(key string) (string, bool)\n}\n\ntype InMemoryCache struct{}\n\nfunc (c InMemoryCache) Get(key string) (string, bool) { return \"\", false }\n\n// Provider return value type ไม่ใช่ pointer\nfunc NewInMemoryCache() InMemoryCache {\n    return InMemoryCache{}\n}",
    "options": [
      "wire.Bind(new(Cache), new(*InMemoryCache))",
      "wire.Bind(new(*Cache), new(InMemoryCache))",
      "wire.Bind(new(Cache), new(InMemoryCache))",
      "wire.Bind(new(InMemoryCache), new(Cache))"
    ],
    "correctAnswerIndex": 2,
    "explanation": "Provider return <code>InMemoryCache</code> (value type ไม่มี *) ดังนั้น arg สองของ <code>wire.Bind</code> ต้องเป็น <code>new(InMemoryCache)</code> ไม่ใช่ <code>new(*InMemoryCache)</code> กฎสำคัญ: <strong>arg สองต้องตรงกับ return type ของ provider ทุกตัวอักษร</strong> รวมถึง pointer/value"
  },
  {
    "id": "wire-ch05-q12",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "Wire gen รายงาน error ว่า 'no provider found for service.UserRepository' ทั้งที่มี NewPostgresRepo ใน wire.Build อยู่แล้ว สาเหตุที่เป็นไปได้มากที่สุดคืออะไร?",
    "code": "func InitApp(db *sql.DB) *UserService {\n    wire.Build(\n        NewPostgresRepo, // return *postgresRepo\n        NewUserService,  // ต้องการ UserRepository interface\n    )\n    return nil\n}",
    "options": [
      "NewPostgresRepo ต้องรับ *sql.DB เป็น parameter จึงใช้ไม่ได้",
      "ลืมประกาศ wire.Bind เพื่อ map UserRepository interface ไปหา *postgresRepo",
      "NewUserService ต้องประกาศก่อน NewPostgresRepo ใน wire.Build",
      "Wire ไม่รองรับ unexported concrete type อย่าง postgresRepo"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Error นี้เกิดเพราะ <code>NewUserService</code> ต้องการ <code>UserRepository</code> (interface) แต่ Wire มีแค่ <code>*postgresRepo</code> (concrete) ใน graph Wire จะไม่ทำ implicit conversion ต้องเพิ่ม <code>wire.Bind(new(UserRepository), new(*postgresRepo))</code> ใน wire.Build ลำดับ provider ใน wire.Build ไม่สำคัญ และ Wire รองรับ unexported concrete type"
  },
  {
    "id": "wire-ch05-q13",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "นักพัฒนาเขียน wire.Bind ผิดลำดับ argument ดังนี้ Wire จะรายงาน error อะไร?",
    "code": "var Set = wire.NewSet(\n    NewConsoleLogger,\n    // ผิด: สลับ argument — concrete อยู่ก่อน interface\n    wire.Bind(new(*ConsoleLogger), new(Logger)),\n)",
    "options": [
      "Wire จะทำงานได้ปกติเพราะ Wire ฉลาดพอที่จะรู้ว่าอันไหนคือ interface",
      "Wire จะ error เพราะ *ConsoleLogger ไม่ใช่ interface type",
      "Wire จะ error เพราะ Logger ไม่ใช่ concrete type ที่มี provider",
      "Wire จะ error เพราะมี duplicate provider สำหรับ Logger"
    ],
    "correctAnswerIndex": 1,
    "explanation": "<code>wire.Bind</code> กำหนดให้ arg แรกต้องเป็น interface type เสมอ เมื่อสลับ argument Wire จะพยายามใช้ <code>*ConsoleLogger</code> (concrete pointer) เป็น interface ซึ่งเป็นไปไม่ได้ Wire จะ error ระหว่าง code generation ว่า arg แรกต้องเป็น interface type"
  },
  {
    "id": "wire-ch05-q14",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "มี two injectors — production และ test — ทั้งคู่อยู่ใน wire.go เดียวกัน production ใช้ ProdSet ที่มี wire.Bind สำหรับ *PostgresRepo และ test ต้องการ bind MockRepo แทน ปัญหาที่อาจเกิดขึ้นหากทำผิดคืออะไร?",
    "code": "func InitProd(db *sql.DB) *App {\n    wire.Build(repo.ProdSet, service.NewApp)\n    return nil\n}\n\nfunc InitTest(mock *MockRepo) *App {\n    wire.Build(\n        repo.ProdSet, // ใส่ ProdSet ด้วย — อาจเกิดปัญหา!\n        wire.Bind(new(repo.UserRepository), new(*MockRepo)),\n        service.NewApp,\n    )\n    return nil\n}",
    "options": [
      "ไม่มีปัญหา Wire จะเลือก binding ล่าสุดโดยอัตโนมัติ",
      "Wire จะ error เพราะมี duplicate binding สำหรับ UserRepository interface — มาจากทั้ง ProdSet และ wire.Bind ใหม่",
      "Wire จะ error เพราะ MockRepo ไม่มี provider อยู่ใน ProdSet",
      "Wire จะรวม binding ทั้งสองเข้าด้วยกันทำให้ App ได้รับทั้ง PostgresRepo และ MockRepo"
    ],
    "correctAnswerIndex": 1,
    "explanation": "เมื่อใส่ <code>ProdSet</code> (ที่มี bind UserRepository → *PostgresRepo) <b>และ</b> wire.Bind ใหม่ (bind UserRepository → *MockRepo) ใน wire.Build เดียวกัน Wire จะ error เรื่อง <b>duplicate provider/binding</b> สำหรับ UserRepository interface ต้องไม่ใส่ ProdSet ใน test injector — ให้ประกาศแค่ provider และ binding ที่ต้องการสำหรับ test เท่านั้น"
  },
  {
    "id": "wire-ch05-q15",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "ข้อใดคือเหตุผลที่ดีที่สุดสำหรับการออกแบบ provider ให้ return concrete type (*ConsoleLogger) แทน interface (Logger)?",
    "options": [
      "เพราะ Wire ไม่รองรับ provider ที่ return interface type",
      "เพราะ interface return type ทำให้ memory allocation สูงกว่า concrete type",
      "เพราะ Wire ต้องการ pointer type เสมอ interface จึงไม่ได้รับอนุญาต",
      "เพราะ concrete return type ทำให้ caller รู้ว่าได้รับ implementation ใด และสามารถ bind interface ที่หลากหลายได้ รวมถึงยังใช้ concrete type โดยตรงได้ถ้าต้องการ"
    ],
    "correctAnswerIndex": 3,
    "explanation": "Go Proverb บอกว่า \"accept interfaces, return structs\" — provider ที่ return concrete type มีประโยชน์: (1) สามารถ bind ไปหา interface <b>หลายตัว</b>ที่ implement ได้ถ้าต้องการ (2) caller ที่รู้ว่าต้องการ concrete สามารถใช้โดยตรงได้ (3) ชัดเจนกว่าว่าได้รับ implementation ใด Wire รองรับ provider ที่ return interface ได้จริง แต่ไม่แนะนำด้วยเหตุผลเหล่านี้"
  },
  {
    "id": "wire-ch05-q16",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "ต้องการให้ทั้ง EmailSender interface และ NotificationSender interface map ไปหา *SMTPSender ตัวเดียว ควรเขียน wire.NewSet อย่างไร?",
    "code": "type EmailSender interface { SendEmail(to, body string) error }\ntype NotificationSender interface { Notify(msg string) error }\n\ntype SMTPSender struct{ host string }\nfunc (s *SMTPSender) SendEmail(to, body string) error { return nil }\nfunc (s *SMTPSender) Notify(msg string) error          { return nil }\n\nfunc NewSMTPSender(host string) *SMTPSender {\n    return &SMTPSender{host: host}\n}",
    "options": [
      "wire.NewSet(NewSMTPSender, wire.Bind(new(EmailSender), new(NotificationSender), new(*SMTPSender)))",
      "wire.NewSet(NewSMTPSender, wire.Bind(new(EmailSender), new(*SMTPSender)), wire.Bind(new(NotificationSender), new(*SMTPSender)))",
      "wire.NewSet(NewSMTPSender, wire.Bind(new(*SMTPSender), new(EmailSender), new(NotificationSender)))",
      "wire.NewSet(NewSMTPSender) สอง interface bind อัตโนมัติเพราะ *SMTPSender implement ทั้งคู่"
    ],
    "correctAnswerIndex": 1,
    "explanation": "ต้องเรียก <code>wire.Bind</code> แยกสองครั้ง หนึ่งครั้งต่อหนึ่ง interface binding: <code>wire.Bind(new(EmailSender), new(*SMTPSender))</code> และ <code>wire.Bind(new(NotificationSender), new(*SMTPSender))</code> การที่ <code>*SMTPSender</code> implement ทั้งสอง interface ไม่ได้ทำให้ Wire รู้ binding โดยอัตโนมัติ ต้องประกาศทุก binding ชัดเจน"
  },
  {
    "id": "wire-ch05-q17",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "นักพัฒนาต้องการตรวจสอบว่า wire.Bind ทำงานถูกต้องหรือไม่ โดยดูจาก wire_gen.go ที่สร้าง ควรเห็นอะไรใน wire_gen.go เมื่อ bind Logger interface กับ *ConsoleLogger?",
    "options": [
      "จะเห็น function wire_bind_Logger_ConsoleLogger() ที่ Wire สร้างให้",
      "จะเห็น var _ Logger = (*ConsoleLogger)(nil) เป็น interface check",
      "wire.Bind ไม่ปรากฏใน wire_gen.go โดยตรง แต่ Wire จะใช้ *ConsoleLogger ตรงที่ต้องการ Logger ทำให้โค้ดใน wire_gen.go assign *ConsoleLogger ให้กับ Logger variable โดยตรง",
      "จะเห็น binding map ของ Wire ที่เก็บ Logger → *ConsoleLogger ไว้เป็น runtime lookup table"
    ],
    "correctAnswerIndex": 2,
    "explanation": "<code>wire.Bind</code> ไม่สร้างโค้ดพิเศษใน wire_gen.go — มันเป็นเพียงข้อมูลสำหรับ Wire ในการสร้าง dependency graph ผลลัพธ์คือ ในที่ที่ต้องการ <code>Logger</code> Wire จะเขียนโค้ดที่ส่ง <code>*ConsoleLogger</code> เข้าไปโดยตรง (implicit interface assignment ของ Go) ไม่มี runtime lookup table เพราะ Wire เป็น compile-time tool"
  },
  {
    "id": "wire-ch05-q18",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "มี provider set สำหรับ production แล้ว ต้องการสร้าง set อีกชุดสำหรับ test ที่ใช้ in-memory implementations ทั้งหมด ควรออกแบบอย่างไร?",
    "options": [
      "แก้ไข ProdSet โดยตรงโดยเพิ่ม condition check เพื่อเลือก implementation ตาม environment variable",
      "สร้าง TestSet แยกที่มี providers สำหรับ in-memory implementations และ wire.Bind ของตัวเอง แล้วใช้ TestSet ใน test injector แทน ProdSet",
      "ใช้ ProdSet เดิมแต่เพิ่ม //go:build test บน file ที่มี in-memory providers",
      "เรียก wire.Bind หลายครั้งใน ProdSet เดียวโดยใช้ build tags เพื่อเลือก binding"
    ],
    "correctAnswerIndex": 1,
    "explanation": "แนวทางที่ถูกต้องคือสร้าง <b>TestSet แยก</b> ที่มี in-memory providers และ <code>wire.Bind</code> ของตัวเองชัดเจน จากนั้น test injector ใช้ TestSet และ production injector ใช้ ProdSet แยกกัน วิธีนี้ทำให้ configurations ไม่ผสมกัน และ provider sets แต่ละชุด reuse ได้อิสระ การแก้ ProdSet โดยตรงหรือใช้ build tags บน providers ทำให้โค้ดซับซ้อนและบำรุงรักษายาก"
  },
  {
    "id": "wire-ch05-q19",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "ข้อใดเป็นสัญญาณว่าควรใช้ interface + wire.Bind แทนที่จะ depend on concrete type โดยตรง?",
    "options": [
      "เมื่อ concrete type มี method มากกว่า 5 method",
      "เมื่อ concrete type อยู่ใน package เดียวกับ consumer เสมอ",
      "เมื่อต้องการ swap implementation ระหว่าง production กับ test หรือมีหลาย implementations ที่ใช้แทนกันได้",
      "เมื่อ concrete type เป็น unexported type เสมอ"
    ],
    "correctAnswerIndex": 2,
    "explanation": "เหตุผลหลักที่ต้องใช้ interface + <code>wire.Bind</code>: (1) <b>Testability</b> — swap mock ใน test injector, (2) <b>Multiple implementations</b> — เช่น SQL vs NoSQL repo, (3) <b>Environment switching</b> — prod vs staging vs test แค่ concrete type มี methods มาก, อยู่ package เดียวกัน, หรือเป็น unexported ไม่ใช่เหตุผลเพียงพอที่จะ introduce interface"
  },
  {
    "id": "wire-ch05-q20",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "ทีมเพิ่งเพิ่ม interface ให้ service layer แต่ลืมเพิ่ม wire.Bind จะเกิดอะไรขึ้นเมื่อรัน wire gen?",
    "options": [
      "wire gen สำเร็จแต่ generated code ไม่ถูกต้อง จะ panic ตอน runtime แทน",
      "wire gen สำเร็จโดย Wire auto-detect ว่า concrete type implement interface และ bind ให้อัตโนมัติ",
      "wire gen จะข้าม interface dependency ไปโดยไม่ error เพื่อให้ compile ได้ก่อน",
      "wire gen จะ error ทันทีว่าไม่มี provider สำหรับ interface type นั้น ก่อนที่จะสร้าง wire_gen.go"
    ],
    "correctAnswerIndex": 3,
    "explanation": "นี่คือหนึ่งในข้อดีของ Wire: error จะปรากฏ<b>ตอน wire gen</b> ก่อน compile จริง Wire จะรายงานว่า <code>no provider found for InterfaceType</code> ซึ่งเป็นสัญญาณชัดเจนว่าลืม <code>wire.Bind</code> ไม่มีทางที่ Wire จะ auto-detect binding หรือสร้าง wire_gen.go ที่ผิดพลาดโดยไม่แจ้ง error"
  },
  {
    "id": "wire-ch05-q21",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "ใน wire.Bind argument ทั้งสองต้องอยู่ในรูปแบบใด?",
    "options": [
      "ชื่อ type โดยตรง เช่น wire.Bind(Logger, ConsoleLogger)",
      "เป็น nil pointer เช่น wire.Bind((*Logger)(nil), (*ConsoleLogger)(nil))",
      "new(...) เสมอ เช่น wire.Bind(new(Logger), new(*ConsoleLogger))",
      "เป็น reflect.TypeOf เช่น wire.Bind(reflect.TypeOf(Logger{}), reflect.TypeOf(ConsoleLogger{}))"
    ],
    "correctAnswerIndex": 2,
    "explanation": "<code>wire.Bind</code> กำหนดให้ใช้ <code>new(...)</code> เสมอสำหรับทั้งสอง argument — <code>new(Interface)</code> สำหรับ interface และ <code>new(*Concrete)</code> สำหรับ concrete type นี่เป็น Wire API ที่กำหนดไว้ ไม่สามารถส่ง type โดยตรงหรือ nil pointer ได้"
  }
];
