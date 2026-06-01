/* questions ch06 (TH) */
(window.QUESTIONS_TH = window.QUESTIONS_TH || {}).ch06 = [
  {
    "id": "wire-ch06-q01",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "wire.Struct(new(T), \"*\") หมายความว่าอะไร?",
    "options": [
      "สร้าง pointer ของ T โดยไม่ inject field ใดเลย",
      "บอก Wire ให้ inject ทุก exported field ของ T จาก dependency graph",
      "บอก Wire ให้เรียก constructor function ที่ชื่อ NewT โดยอัตโนมัติ",
      "สร้าง T และ inject ทุก field รวมถึง unexported field ด้วย"
    ],
    "correctAnswerIndex": 1,
    "explanation": "<code>wire.Struct(new(T), \"*\")</code> บอก Wire ให้สร้าง <code>T</code> โดยกำหนดค่าให้ <strong>ทุก exported field</strong> จาก dependency graph โดยอัตโนมัติ Wire จะสร้างโค้ดเทียบเท่ากับ <code>&amp;T{FieldA: a, FieldB: b, ...}</code> ไม่มีการเรียก constructor และ unexported field จะถูกข้ามไป"
  },
  {
    "id": "wire-ch06-q02",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "โค้ดใดใช้ wire.Struct เพื่อ inject เฉพาะ field DB และ Logger ของ ReportHandler ได้ถูกต้อง?",
    "options": [
      "wire.Struct(new(ReportHandler), \"DB\", \"Logger\")",
      "wire.Struct(ReportHandler{}, \"DB\", \"Logger\")",
      "wire.Struct(new(ReportHandler), \"*DB\", \"*Logger\")",
      "wire.Struct(&ReportHandler{}, \"DB\", \"Logger\")"
    ],
    "correctAnswerIndex": 0,
    "explanation": "syntax ที่ถูกต้องคือ <code>wire.Struct(new(T), \"FieldName\", ...)</code> argument แรกต้องเป็น <code>new(T)</code> เสมอ ไม่ใช่ <code>T{}</code> หรือ <code>&amp;T{}</code> ส่วนชื่อ field ระบุเป็น string ธรรมดา ไม่มี <code>*</code> นำหน้า"
  },
  {
    "id": "wire-ch06-q03",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "Wire จะสร้างโค้ดอะไรเมื่อพบ wire.Struct(new(AppHandler), \"DB\", \"Logger\") ใน wire.Build?",
    "options": [
      "เรียก NewAppHandler(db, logger) ถ้า function นั้นมีอยู่",
      "สร้าง var h AppHandler แล้ว set h.DB = db และ h.Logger = logger แยกบรรทัด",
      "ไม่สร้างโค้ดใดเพิ่ม แค่ validate ว่า field มีอยู่จริง",
      "สร้าง struct literal &AppHandler{DB: db, Logger: logger}"
    ],
    "correctAnswerIndex": 3,
    "explanation": "Wire สร้าง struct literal <code>&amp;AppHandler{DB: db, Logger: logger}</code> โดยตรง โดย resolve ค่าของ <code>db</code> และ <code>logger</code> จาก dependency graph เหมือนกับที่ทำกับ constructor parameter ทั่วไป"
  },
  {
    "id": "wire-ch06-q04",
    "difficulty": "easy",
    "bloomLevel": "understand",
    "question": "เหตุใด unexported field จึงไม่สามารถ inject ด้วย wire.Struct ได้?",
    "options": [
      "เพราะ wire.Struct ทำงานได้เฉพาะใน package เดียวกับที่ประกาศ struct จึงไม่เห็น unexported field ของ package อื่น",
      "เพราะ unexported field ไม่ accessible จาก package อื่น Wire จึงไม่สามารถสร้างโค้ดที่ set ค่า field เหล่านั้นได้",
      "เพราะ Wire บังคับให้ทุก field ต้องมี type ที่เป็น pointer เท่านั้น",
      "เพราะ unexported field ถูก Go runtime กำหนดเป็น zero value โดยอัตโนมัติเสมอ"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Wire สร้างโค้ด Go ธรรมดาใน package อื่น (หรือ package เดียวกันของ injector) ดังนั้น <strong>unexported field ของ struct ใน package อื่นไม่ accessible</strong> Wire จึงไม่มีทางสร้างโค้ดที่ set ค่า unexported field ได้ ต้องใช้ constructor function ที่อยู่ใน package เดียวกันแทน"
  },
  {
    "id": "wire-ch06-q05",
    "difficulty": "easy",
    "bloomLevel": "understand",
    "question": "พิจารณาโค้ดนี้: wire.Struct(new(Server), \"*\") และ Server มี field: DB *sql.DB, Logger *slog.Logger, mu sync.Mutex — Wire จะ inject field อะไรบ้าง?",
    "code": "type Server struct {\n\tDB     *sql.DB\n\tLogger *slog.Logger\n\tmu     sync.Mutex\n}",
    "options": [
      "inject DB, Logger และ mu ทั้งสามตัว",
      "inject เฉพาะ DB เพราะ Logger และ mu ไม่ใช่ pointer type",
      "error ทันที เพราะ struct มี unexported field อยู่",
      "inject เฉพาะ DB และ Logger เพราะ mu เป็น unexported field"
    ],
    "correctAnswerIndex": 3,
    "explanation": "เมื่อใช้ <code>\"*\"</code> Wire จะ inject เฉพาะ <strong>exported field</strong> เท่านั้น คือ <code>DB</code> และ <code>Logger</code> ส่วน <code>mu</code> เป็น unexported field จะถูกข้ามไปอย่างเงียบ ๆ ไม่มี error Wire ไม่ error จากการมี unexported field อยู่ใน struct"
  },
  {
    "id": "wire-ch06-q06",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "ความแตกต่างหลักระหว่าง wire.Struct กับ constructor function ในฐานะ provider คืออะไร?",
    "options": [
      "wire.Struct เร็วกว่า constructor function เพราะ Wire ใช้ reflection inject field โดยตรง",
      "wire.Struct สร้าง struct literal โดยตรงและไม่มี initialization logic ส่วน constructor function สามารถมี logic เช่น validation หรือ การเปิด connection ได้",
      "wire.Struct รองรับ error return แต่ constructor function ไม่รองรับ",
      "wire.Struct และ constructor function ให้ผลเหมือนกันทุกประการ เลือกใช้อันไหนก็ได้เสมอ"
    ],
    "correctAnswerIndex": 1,
    "explanation": "<code>wire.Struct</code> สร้างแค่ struct literal <code>&amp;T{Field: val, ...}</code> ไม่มีโค้ดอื่นใดทำงาน เหมาะเมื่อ struct แค่รวม dependency ส่วน <strong>constructor function</strong> สามารถมี logic เช่น validate config, เปิด connection, initialize channel, หรือ return error ได้ เมื่อต้องการ logic เหล่านี้ต้องใช้ constructor"
  },
  {
    "id": "wire-ch06-q07",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "พิจารณาโค้ดนี้ — Wire จะ error หรือไม่? เพราะอะไร?",
    "code": "type NotifHandler struct {\n\tDB      *sql.DB\n\tMailer  *mailer.Client\n\tVersion string\n}\n\nwire.Build(\n\tprovideDB,\n\tprovideMailer,\n\twire.Struct(new(NotifHandler), \"*\"),\n)",
    "options": [
      "ไม่ error เพราะ Version เป็น string ซึ่ง Wire ตั้งเป็น empty string ให้อัตโนมัติ",
      "Error เพราะไม่มี provider สำหรับ string ใน wire.Build",
      "Error เพราะ Version เป็น unexported field",
      "ไม่ error เพราะ wire.Struct ข้าม field ที่ไม่มี provider ให้อัตโนมัติ"
    ],
    "correctAnswerIndex": 1,
    "explanation": "<code>Version string</code> เป็น exported field ดังนั้นเมื่อใช้ <code>\"*\"</code> Wire จะพยายาม inject ค่า <code>string</code> จาก graph แต่ไม่มี provider สำหรับ <code>string</code> ใน <code>wire.Build</code> Wire จึง error: <code>no provider for string</code> แก้ได้โดยระบุชื่อ field เฉพาะ: <code>wire.Struct(new(NotifHandler), \"DB\", \"Mailer\")</code> หรือเพิ่ม provider สำหรับ string (เช่น <code>wire.Value(\"v1.0.0\")</code>)"
  },
  {
    "id": "wire-ch06-q08",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "วิธีใดถูกต้องในการแก้ไข wire.Struct เพื่อไม่ให้ inject field Version ที่เป็น string?",
    "code": "type NotifHandler struct {\n\tDB      *sql.DB\n\tMailer  *mailer.Client\n\tVersion string // ไม่ต้องการ inject\n}",
    "options": [
      "wire.Struct(new(NotifHandler), \"*\") และเพิ่ม wire.Ignore(\"Version\") ใน wire.Build",
      "เปลี่ยน Version เป็น version (lowercase) เพื่อให้เป็น unexported แล้วใช้ wire.Struct(new(NotifHandler), \"*\")",
      "wire.Struct(new(NotifHandler), \"DB\", \"Mailer\") — ระบุเฉพาะ field ที่ต้องการ inject",
      "wire.Struct(new(NotifHandler), \"DB\", \"Mailer\", \"-Version\") — ใส่ \"-\" นำหน้าเพื่อ exclude"
    ],
    "correctAnswerIndex": 2,
    "explanation": "วิธีที่ถูกต้องและชัดเจนที่สุดคือ <strong>ระบุชื่อ field ที่ต้องการ inject เฉพาะตัว</strong>: <code>wire.Struct(new(NotifHandler), \"DB\", \"Mailer\")</code> Wire ไม่มี <code>wire.Ignore</code> และไม่รู้จัก syntax <code>\"-FieldName\"</code> การเปลี่ยนเป็น unexported ก็ได้ผล แต่เปลี่ยน API ของ struct ซึ่งอาจไม่เหมาะ"
  },
  {
    "id": "wire-ch06-q09",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "โค้ดนี้จะเกิดอะไรขึ้นเมื่อรัน wire?",
    "code": "func NewAppHandler(db *sql.DB, l *slog.Logger) *AppHandler {\n\treturn &AppHandler{DB: db, Logger: l}\n}\n\nfunc InitApp() *AppHandler {\n\twire.Build(\n\t\tprovideDB,\n\t\tprovideLogger,\n\t\tNewAppHandler,\n\t\twire.Struct(new(AppHandler), \"*\"),\n\t)\n\treturn nil\n}",
    "options": [
      "Wire ใช้ wire.Struct ก่อนเพราะ listed ทีหลัง",
      "Wire ใช้ NewAppHandler ก่อนเพราะเป็น function provider",
      "Wire error: multiple bindings for *AppHandler",
      "Wire สร้างสอง instance ของ *AppHandler หนึ่งตัวต่อหนึ่ง provider"
    ],
    "correctAnswerIndex": 2,
    "explanation": "Wire ถือว่าต้องมี provider <strong>เพียงหนึ่งเดียว</strong> สำหรับแต่ละ type ทั้ง <code>NewAppHandler</code> และ <code>wire.Struct(new(AppHandler), \"*\")</code> ล้วนเป็น provider สำหรับ <code>*AppHandler</code> การมีสอง provider สำหรับ type เดียวกันทำให้ Wire error: <code>multiple bindings for *AppHandler</code> ต้องเลือกแค่วิธีเดียว"
  },
  {
    "id": "wire-ch06-q10",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "wire.Struct สามารถใส่ไว้ใน wire.NewSet ได้หรือไม่?",
    "code": "var HandlerSet = wire.NewSet(\n\twire.Struct(new(AppHandler), \"*\"),\n)",
    "options": [
      "ไม่ได้ wire.Struct ใส่ได้เฉพาะใน wire.Build โดยตรงเท่านั้น",
      "ได้ wire.Struct สามารถเป็น element ใน wire.NewSet ได้เหมือนกับ provider function",
      "ได้ แต่ต้องใช้ wire.NewSet(wire.Struct(new(T))) โดยไม่มี field argument",
      "ไม่ได้ ต้องเขียน wire.StructSet(new(AppHandler), \"*\") แทน"
    ],
    "correctAnswerIndex": 1,
    "explanation": "<code>wire.Struct(...)</code> สามารถเป็น element ใน <code>wire.NewSet</code> ได้โดยตรง เหมือนกับ provider function ทั่วไป ทำให้สามารถ bundle <code>wire.Struct</code> เข้ากับ provider อื่น ๆ ในชั้นเดียวกันได้"
  },
  {
    "id": "wire-ch06-q11",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "เมื่อไหรควรใช้ constructor function แทน wire.Struct?",
    "options": [
      "เมื่อ struct มีมากกว่า 5 fields เพราะ wire.Struct รองรับสูงสุด 5 fields",
      "เมื่อต้องการ initialize unexported field หรือมี logic เช่น validation หรือ การเปิด connection ใน constructor",
      "เมื่อ struct อยู่ใน package อื่นนอกเหนือจาก injector package",
      "เมื่อ struct มีมากกว่า 10 exported fields เพราะ wire.Struct รองรับการ inject ได้สูงสุด 10 fields เท่านั้น"
    ],
    "correctAnswerIndex": 1,
    "explanation": "<code>wire.Struct</code> เหมาะเมื่อ struct แค่รวม dependency โดยไม่มี logic พิเศษ แต่เมื่อต้องการ <strong>initialize unexported field</strong>, validate input, เปิด connection, สร้าง channel, หรือมี initialization logic ใดก็ตาม ต้องใช้ constructor function ที่สามารถมีโค้ดทำงานได้ wire.Struct ไม่มีข้อจำกัดด้านจำนวน field และไม่มีข้อจำกัดด้านจำนวนสูงสุด"
  },
  {
    "id": "wire-ch06-q12",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "พิจารณาโค้ดนี้ — มีปัญหาอะไร?",
    "code": "// package service\ntype OrderService struct {\n\trepo    OrderRepository  // unexported\n\tmailer  MailSender       // unexported\n\tLogger  *slog.Logger     // exported\n}\n\n// wire.go\nwire.Build(\n\tprovideRepo,\n\tprovideMailer,\n\tprovideLogger,\n\twire.Struct(new(service.OrderService), \"*\"),\n)",
    "options": [
      "ไม่มีปัญหา Wire inject Logger ได้และข้าม repo, mailer อย่างเงียบ ๆ",
      "Wire inject ได้เฉพาะ Logger แต่ repo และ mailer ไม่ได้รับค่า ทำให้ OrderService ทำงานไม่ถูกต้องตอน runtime",
      "Wire error เพราะ repo และ mailer เป็น unexported field ที่ระบุใน \"*\"",
      "Wire inject ทุก field รวม unexported field ด้วยเพราะ provideRepo และ provideMailer มีอยู่ใน wire.Build"
    ],
    "correctAnswerIndex": 1,
    "explanation": "เมื่อใช้ <code>\"*\"</code> Wire inject เฉพาะ <strong>exported field</strong> คือ <code>Logger</code> เท่านั้น ส่วน <code>repo</code> และ <code>mailer</code> ที่เป็น unexported field ถูกข้ามไปเงียบ ๆ ไม่มี error แต่ <code>OrderService</code> จะมี <code>repo</code> และ <code>mailer</code> เป็น <code>nil</code> ตอน runtime ซึ่งอาจ panic เมื่อใช้งาน ต้องเขียน constructor function แทนเพื่อ initialize unexported field"
  },
  {
    "id": "wire-ch06-q13",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "นักพัฒนากล่าวว่า \"wire.Struct ลด encapsulation เพราะบังคับให้ field เป็น exported\" ข้อใดประเมินข้อกล่าวนี้ได้ถูกต้องที่สุด?",
    "options": [
      "ผิดทั้งหมด — wire.Struct ไม่จำเป็นต้องให้ field เป็น exported เลย",
      "ถูกต้อง และเป็นปัญหาร้ายแรงที่ทำให้ struct ไม่ thread-safe โดยอัตโนมัติ",
      "ถูกบางส่วน — field ต้อง exported จริง ทำให้ package อื่น access ได้ แต่สำหรับ leaf node เช่น handler นี่มักยอมรับได้; ถ้า encapsulation สำคัญกว่า ให้ใช้ constructor แทน",
      "ถูกต้อง และเป็นเหตุผลที่ Go community แนะนำให้ไม่ใช้ wire.Struct เลย"
    ],
    "correctAnswerIndex": 2,
    "explanation": "ข้อกล่าวนี้ <strong>ถูกบางส่วน</strong>: <code>wire.Struct</code> inject ได้เฉพาะ exported field จริง ซึ่งหมายความว่า package อื่นสามารถ read หรือ set field เหล่านั้นได้โดยตรง แต่สำหรับ <em>leaf component</em> เช่น HTTP handler ที่ไม่มีใคร depend on อีก การ trade-off นี้มักยอมรับได้ในทางปฏิบัติ สำหรับ domain object หรือ repository ที่ต้องการ encapsulation เข้มข้นกว่า ควรใช้ constructor"
  },
  {
    "id": "wire-ch06-q14",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "พิจารณาโค้ดนี้ — ผลลัพธ์คืออะไร?",
    "code": "type CacheService struct {\n\tClient  *redis.Client\n\tLogger  *slog.Logger\n\tTTL     time.Duration\n}\n\nvar CacheSet = wire.NewSet(\n\tprovideRedis,\n\tprovideLogger,\n\tprovideTTL, // return type: time.Duration\n\twire.Struct(new(CacheService), \"*\"),\n)",
    "options": [
      "Wire error เพราะ time.Duration ไม่ใช่ pointer type จึงใช้เป็น provider ไม่ได้",
      "Wire สร้างโค้ดที่ inject Client, Logger และ TTL ทั้งหมดจาก provider ใน set",
      "Wire inject เฉพาะ Client และ Logger เพราะ TTL เป็น value type ไม่ใช่ pointer",
      "Wire error เพราะ wire.Struct ไม่รองรับ field ที่เป็น non-pointer type"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Wire ไม่ได้จำกัดว่า provider ต้องคืน pointer เท่านั้น สามารถคืน value type เช่น <code>time.Duration</code>, <code>int</code>, หรือ struct ก็ได้ ตราบใดที่ <code>provideTTL</code> คืน <code>time.Duration</code> และ <code>CacheService.TTL</code> เป็น <code>time.Duration</code> Wire จะ match type และ inject ได้ถูกต้อง ทำให้ทั้งสามตัวถูก inject"
  },
  {
    "id": "wire-ch06-q15",
    "difficulty": "hard",
    "bloomLevel": "apply",
    "question": "ทีมต้องการ refactor AppHandler จาก constructor function เป็น wire.Struct — ขั้นตอนใดถูกต้อง?",
    "code": "// ก่อน refactor\nfunc NewAppHandler(db *sql.DB, l *slog.Logger, cfg *config.App) *AppHandler {\n\treturn &AppHandler{DB: db, Logger: l, Config: cfg}\n}",
    "options": [
      "ลบ NewAppHandler ออก, เปลี่ยน db, logger, config fields ให้เป็น exported ถ้ายังไม่ใช่, แล้วแทนที่ NewAppHandler ใน wire.Build ด้วย wire.Struct(new(AppHandler), \"*\")",
      "คง NewAppHandler ไว้และเพิ่ม wire.Struct(new(AppHandler), \"*\") เข้าไปใน wire.Build ด้วย",
      "เปลี่ยน NewAppHandler ให้ return interface แทน *AppHandler แล้วใช้ wire.Struct",
      "ลบ NewAppHandler ออกและใช้ wire.Struct(new(AppHandler), \"NewAppHandler\") เพื่ออ้างอิง constructor เดิม"
    ],
    "correctAnswerIndex": 0,
    "explanation": "ขั้นตอนที่ถูกต้องในการ refactor: (1) <strong>ลบ</strong> constructor function ออก เพราะถ้าคงไว้จะเกิด duplicate provider, (2) ตรวจสอบให้แน่ใจว่าทุก field ที่ต้องการ inject เป็น <strong>exported</strong>, (3) <strong>แทนที่</strong> ชื่อ constructor ด้วย <code>wire.Struct(new(AppHandler), \"*\")</code> ใน wire.Build หรือ provider set"
  },
  {
    "id": "wire-ch06-q16",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "พิจารณา struct นี้ — ควรใช้ wire.Struct หรือ constructor function?",
    "code": "type DBPool struct {\n\tHost     string\n\tPort     int\n\tMaxConns int\n\tconn     *sql.DB // unexported, ต้องเปิด connection จาก Host และ Port\n}",
    "options": [
      "ใช้ wire.Struct(new(DBPool), \"*\") เพราะ exported fields มีอยู่ครบ",
      "ใช้ wire.Struct(new(DBPool), \"Host\", \"Port\", \"MaxConns\") แล้ว Wire จะจัดการ conn ให้เอง",
      "ใช้ constructor function เพราะต้องการ logic เพื่อเปิด connection และ initialize unexported field conn",
      "ใช้ wire.Struct ร่วมกับ wire.Value สำหรับ conn field"
    ],
    "correctAnswerIndex": 2,
    "explanation": "<code>DBPool</code> มี <code>conn *sql.DB</code> ที่เป็น unexported field และต้องเปิด connection ด้วย logic พิเศษ (ใช้ Host และ Port) นี่คือกรณีที่ชัดเจนที่ต้องใช้ <strong>constructor function</strong> เช่น <code>NewDBPool(host string, port int, max int) (*DBPool, error)</code> เพราะมีทั้ง initialization logic และ unexported field ที่ต้อง set <code>wire.Struct</code> ไม่เหมาะในกรณีนี้"
  },
  {
    "id": "wire-ch06-q17",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "wire.Struct(new(T), \"*\") กับ wire.Struct(new(T), \"FieldA\") ต่างกันอย่างไรเมื่อ T มีแค่ FieldA เป็น exported field เพียงตัวเดียว?",
    "options": [
      "ไม่ต่างกัน ทั้งสองให้ผลเหมือนกันทุกประการ",
      "wire.Struct(new(T), \"*\") inject ทุก field รวม unexported ด้วย ส่วน wire.Struct(new(T), \"FieldA\") inject เฉพาะ FieldA",
      "ให้ผลเหมือนกัน แต่ wire.Struct(new(T), \"FieldA\") ชัดเจนกว่าในด้าน intention และป้องกัน breakage เมื่อ struct เพิ่ม exported field ใหม่",
      "wire.Struct(new(T), \"*\") จะ error เพราะ \"*\" ต้องใช้กับ struct ที่มีมากกว่า 1 exported field"
    ],
    "correctAnswerIndex": 2,
    "explanation": "เมื่อ T มี exported field เพียงตัวเดียว ทั้งสองให้ผลเหมือนกัน <em>ตอนนี้</em> แต่เมื่อเวลาผ่านไปและ struct เพิ่ม exported field ใหม่ที่ไม่มี provider ในภายหลัง การใช้ <code>\"*\"</code> จะทำให้ Wire error โดยอัตโนมัติ ขณะที่การระบุชื่อ field เฉพาะจะยังทำงานได้ ทั้งสองไม่ inject unexported field"
  },
  {
    "id": "wire-ch06-q18",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "พิจารณาสถานการณ์: ทีมมี GatewayHandler ที่ใช้ wire.Struct กับ \"*\" แล้วเพิ่ม exported field ใหม่ MetricsSvc *metrics.Service โดยไม่ได้เพิ่ม provider ใน wire.Build — จะเกิดอะไรขึ้น?",
    "code": "type GatewayHandler struct {\n\tDB         *sql.DB\n\tLogger     *slog.Logger\n\tMetricsSvc *metrics.Service // เพิ่งเพิ่ม\n}",
    "options": [
      "Wire inject DB และ Logger ได้ตามปกติ MetricsSvc จะเป็น nil และ app ทำงานต่อไป",
      "Wire error ตอนรัน wire gen: no provider for *metrics.Service — ตรวจพบก่อน compile",
      "Wire สร้าง metrics.Service ให้เองโดยอัตโนมัติเพราะเป็น struct type",
      "App compile ผ่านแต่ panic ตอน runtime เมื่อเรียก MetricsSvc method"
    ],
    "correctAnswerIndex": 1,
    "explanation": "นี่คือ <strong>ข้อดีของ Wire</strong>: เมื่อ exported field ใหม่ถูกเพิ่มใน struct ที่ใช้ <code>\"*\"</code> และไม่มี provider สำหรับ type นั้นใน graph Wire จะ <strong>error ทันทีตอนรัน wire gen</strong> ก่อนที่โค้ดจะ compile ได้เลย นักพัฒนาจะได้รับข้อความเช่น <code>no provider for *metrics.Service</code> ทันที ไม่ใช่ nil pointer panic ตอน runtime"
  },
  {
    "id": "wire-ch06-q19",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "โค้ดใดใช้ wire.Struct ใน wire.NewSet ได้ถูกต้อง?",
    "options": [
      "var Set = wire.NewSet(wire.Struct(new(MyHandler), \"DB\", \"Logger\"))",
      "var Set = wire.NewSet(wire.Struct{Type: MyHandler{}, Fields: []string{\"DB\", \"Logger\"}})",
      "var Set = wire.NewSet().AddStruct(new(MyHandler), \"DB\", \"Logger\")",
      "var Set = wire.StructSet(new(MyHandler), \"DB\", \"Logger\")"
    ],
    "correctAnswerIndex": 0,
    "explanation": "<code>wire.Struct(new(T), \"F1\", \"F2\")</code> คืนค่าที่สามารถใส่ใน <code>wire.NewSet(...)</code> ได้โดยตรงเหมือนกับ provider function ทั่วไป ดังนั้น <code>var Set = wire.NewSet(wire.Struct(new(MyHandler), \"DB\", \"Logger\"))</code> คือ syntax ที่ถูกต้อง ตัวเลือกอื่นเป็น syntax ที่ไม่มีอยู่ใน Wire API"
  },
  {
    "id": "wire-ch06-q20",
    "difficulty": "hard",
    "bloomLevel": "apply",
    "question": "ทีมมีสอง struct: UserHandler (ต้องการ inject DB, Logger) และ AdminHandler (ต้องการ inject DB, Logger, AuditLog) โดยทั้งคู่ใช้ wire.Struct วิธีจัด provider set ที่ดีที่สุดคืออะไร?",
    "code": "type UserHandler struct {\n\tDB     *sql.DB\n\tLogger *slog.Logger\n}\n\ntype AdminHandler struct {\n\tDB       *sql.DB\n\tLogger   *slog.Logger\n\tAuditLog *audit.Logger\n}",
    "options": [
      "var HandlerSet = wire.NewSet(wire.Struct(new(UserHandler), \"*\"), wire.Struct(new(AdminHandler), \"*\"))",
      "สร้าง HandlerSet แยกสองตัว: UserSet และ AdminSet แต่ห้าม compose เข้าด้วยกัน",
      "ใช้ wire.Struct(new(UserHandler), \"DB\", \"Logger\") และ wire.Struct(new(AdminHandler), \"DB\", \"Logger\", \"AuditLog\") แล้วใส่ทั้งคู่ใน wire.NewSet เดียวกัน",
      "ทั้งตัวเลือกที่ 1 และ 3 ถูกต้องและให้ผลเหมือนกัน"
    ],
    "correctAnswerIndex": 3,
    "explanation": "ทั้งสองวิธีให้ผลเหมือนกัน: (1) ใช้ <code>\"*\"</code> กับทั้งคู่ — Wire inject ทุก exported field ซึ่งก็คือ field ที่ต้องการทั้งหมดพอดี (2) ระบุชื่อ field ชัดเจน — ชัดเจนและป้องกัน breakage เมื่อ struct เพิ่ม field ใหม่ ทั้งสองสามารถอยู่ใน <code>wire.NewSet</code> เดียวกันได้ การเลือกระหว่างสองวิธีขึ้นอยู่กับ preference ของทีม"
  },
  {
    "id": "wire-ch06-q21",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "argument แรกของ wire.Struct ต้องเป็นอะไร?",
    "options": [
      "ชื่อ type เช่น AppHandler",
      "&AppHandler{} หรือ AppHandler{}",
      "reflect.TypeOf(AppHandler{})",
      "new(T) เสมอ เช่น new(AppHandler)"
    ],
    "correctAnswerIndex": 3,
    "explanation": "argument แรกของ <code>wire.Struct</code> ต้องเป็น <code>new(T)</code> เสมอ เช่น <code>new(AppHandler)</code> ซึ่งคืน <code>*AppHandler</code> ที่ Wire ใช้ดึง type information ไม่สามารถใช้ <code>AppHandler{}</code>, <code>&amp;AppHandler{}</code>, หรือ reflect ได้"
  },
  {
    "id": "wire-ch06-q22",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "ข้อใดอธิบาย trade-off ของ wire.Struct ได้ครบถ้วนที่สุด?",
    "options": [
      "wire.Struct ลด boilerplate แต่ fields ต้องเป็น exported ซึ่งทำให้ encapsulation ลดลง",
      "wire.Struct เร็วกว่า constructor และรองรับ unexported field ได้มากกว่า",
      "wire.Struct เหมาะกับทุก struct ใน Go project โดยไม่มีข้อเสีย",
      "wire.Struct ลด binary size แต่ทำให้ startup time ช้าลงเล็กน้อย"
    ],
    "correctAnswerIndex": 0,
    "explanation": "trade-off หลักของ <code>wire.Struct</code> คือ <strong>ลด boilerplate</strong> (ไม่ต้องเขียน constructor) แต่ต้องแลกด้วยการที่ fields ต้องเป็น <strong>exported</strong> ซึ่งทำให้ package อื่นสามารถ access field ได้โดยตรง (encapsulation ลดลงเล็กน้อย) และไม่สามารถมี initialization logic ใน constructor ได้ ไม่มีผลต่อ binary size หรือ startup time"
  }
];
