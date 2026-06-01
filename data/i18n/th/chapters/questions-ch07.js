/* questions ch07 (TH) */
(window.QUESTIONS_TH = window.QUESTIONS_TH || {}).ch07 = [
  {
    "id": "wire-ch07-q01",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "Provider ที่ต้องการ cleanup function ใน Wire ต้องมี return signature แบบใด?",
    "options": [
      "(T, error)",
      "(T, cleanup func(), error)",
      "(func(), T, error)",
      "(T, func(), error)"
    ],
    "correctAnswerIndex": 3,
    "explanation": "Wire รองรับ signature <code>(T, func(), error)</code> สำหรับ provider ที่ต้องการ cleanup และอาจ fail ลำดับต้องเป็น type ก่อน cleanup ตรงกลาง error สุดท้ายเสมอ ตัวเลือกแรกไม่มี cleanup ตัวเลือกที่สองใช้ชื่อ parameter <code>cleanup func()</code> ซึ่ง Wire ไม่รองรับ — cleanup ต้องเป็น anonymous <code>func()</code> type เท่านั้น ตัวเลือกที่สามลำดับผิด (func() อยู่ก่อน T)"
  },
  {
    "id": "wire-ch07-q02",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "Wire รัน cleanup functions ในลำดับใด?",
    "options": [
      "LIFO — cleanup รัน resource ที่สร้างทีหลังก่อน",
      "FIFO — cleanup รัน resource ที่สร้างแรกก่อน",
      "Random — Wire ไม่รับประกันลำดับ cleanup",
      "Parallel — cleanup ทุกตัวรันพร้อมกัน"
    ],
    "correctAnswerIndex": 0,
    "explanation": "Wire รัน cleanup functions ในลำดับ <b>LIFO (Last In, First Out)</b> — resource ที่สร้างทีหลังสุดจะถูก cleanup ก่อน เหตุผลคือ resource ที่สร้างทีหลังมักพึ่งพา resource ที่สร้างก่อน ดังนั้นต้องปิด dependent ก่อนแล้วค่อยปิด dependency"
  },
  {
    "id": "wire-ch07-q03",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "ถ้า provider สร้าง DB สำเร็จ แต่ provider ถัดไปที่สร้าง Cache fail Wire จะทำอะไร?",
    "options": [
      "Wire panic เพราะไม่สามารถ initialize ครบได้",
      "Wire retry การสร้าง Cache อีกครั้งก่อนจะ return error",
      "Wire ละเว้น error และ return app ที่ไม่มี cache",
      "Wire รัน cleanup ของ DB ก่อน แล้วค่อย return error"
    ],
    "correctAnswerIndex": 3,
    "explanation": "เมื่อ provider ตัวหลัง fail Wire-generated code จะ<b>รัน cleanup ของ resource ที่สร้างสำเร็จไปก่อนหน้า</b> ก่อน return error เพื่อป้องกัน resource leak นี่คือพฤติกรรมที่ Wire guarantee ตาม LIFO order"
  },
  {
    "id": "wire-ch07-q04",
    "difficulty": "easy",
    "bloomLevel": "understand",
    "question": "เพราะเหตุใด cleanup functions จึงต้องรันใน LIFO order แทนที่จะเป็น FIFO?",
    "options": [
      "เพราะ Wire ถูกออกแบบมาให้ทำงานคล้าย garbage collector ซึ่งใช้ LIFO",
      "เพราะ Go runtime บังคับให้ defer stack ทำงานแบบ LIFO เท่านั้น",
      "เพราะ resource ที่สร้างทีหลังมักพึ่งพา resource ที่สร้างก่อน หากปิด dependency ก่อน dependent อาจ panic หรือ error",
      "เพราะ LIFO เร็วกว่า FIFO บน modern hardware"
    ],
    "correctAnswerIndex": 2,
    "explanation": "เหตุผลหลักของ LIFO คือ <b>dependency ordering</b>: ถ้า Server ต้องการ DB ในการทำงาน การปิด DB ก่อนที่ Server จะหยุดรับ request จะทำให้ Server error ดังนั้นต้องปิด Server ก่อน (dependent ก่อน) แล้วค่อยปิด DB (dependency ทีหลัง)"
  },
  {
    "id": "wire-ch07-q05",
    "difficulty": "easy",
    "bloomLevel": "understand",
    "question": "ข้อใดอธิบายความรับผิดชอบของ caller หลังจากเรียก injector ที่ return cleanup func ได้ถูกต้อง?",
    "options": [
      "Wire จัดการ cleanup อัตโนมัติเมื่อ program exit ไม่ต้องทำอะไร",
      "Cleanup จะถูกเรียกโดย Go garbage collector เมื่อ object ถูก free",
      "Caller ต้องเรียก cleanup() ด้วยตัวเอง โดยปกติใช้ defer cleanup()",
      "Caller ต้อง register cleanup กับ os.Exit handler"
    ],
    "correctAnswerIndex": 2,
    "explanation": "Wire <b>ไม่รัน cleanup อัตโนมัติ</b> cleanup function ที่ injector return เป็นแค่ <code>func()</code> ธรรมดา — caller ต้องรับผิดชอบเรียกมันเอง วิธีที่ถูกต้องและปลอดภัยที่สุดคือ <code>defer cleanup()</code> ทันทีหลังตรวจ error"
  },
  {
    "id": "wire-ch07-q06",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "พิจารณา code นี้:",
    "code": "func NewDB(cfg Config) (*sql.DB, func(), error) {\n    db, err := sql.Open(\"postgres\", cfg.DSN)\n    if err != nil {\n        return nil, nil, err\n    }\n    cleanup := func() { db.Close() }\n    return db, cleanup, nil\n}",
    "options": [
      "Code นี้ผิด เพราะถ้า Open fail ควร return cleanup func ที่ไม่ทำอะไรแทน nil",
      "Code นี้ถูกต้อง เมื่อ Open fail ส่ง nil cleanup กลับเป็นเรื่องปกติ เพราะยังไม่มี resource ที่ต้องปิด",
      "Code นี้ผิด เพราะ cleanup func ต้องเป็น exported function ไม่ใช่ anonymous func",
      "Code นี้ผิด เพราะ Wire ไม่รองรับ closure เป็น cleanup function"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Code นี้<b>ถูกต้อง</b> เมื่อ <code>sql.Open</code> fail ยังไม่มี DB connection ที่ต้องปิด ดังนั้นการ return <code>nil</code> เป็น cleanup นั้นสมเหตุสมผล Wire รองรับ <code>nil</code> cleanup ในกรณีนี้ นอกจากนี้ Wire รองรับ anonymous func เป็น cleanup ได้ปกติ"
  },
  {
    "id": "wire-ch07-q07",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "ถ้า dependency graph มี providers A → B → C (A สร้างก่อน C สร้างหลังสุด) cleanup จะรันในลำดับใด?",
    "options": [
      "C, B, A",
      "A, B, C",
      "B, A, C",
      "A, C, B"
    ],
    "correctAnswerIndex": 0,
    "explanation": "LIFO หมายถึง reverse of creation order ถ้าสร้างในลำดับ <b>A → B → C</b> cleanup จะรันใน <b>C → B → A</b> เสมอ C ถูกปิดก่อนเพราะสร้างทีหลังสุดและอาจพึ่งพา A และ B"
  },
  {
    "id": "wire-ch07-q08",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "Provider ต่อไปนี้มีปัญหาอะไร?",
    "code": "func NewDB(cfg Config) (*sql.DB, func(), error) {\n    db, err := sql.Open(\"postgres\", cfg.DSN)\n    if err != nil {\n        return nil, nil, err\n    }\n    if err := db.Ping(); err != nil {\n        // ลืมปิด db ตรงนี้\n        return nil, nil, fmt.Errorf(\"ping: %w\", err)\n    }\n    return db, func() { db.Close() }, nil\n}",
    "options": [
      "ไม่มีปัญหา code ถูกต้องทุกประการ",
      "Ping fail แล้ว return nil cleanup แต่ยังไม่ได้เรียก db.Close() ทำให้ connection leak",
      "ควรใช้ db.Close() แทน cleanup func เพื่อให้ Wire รู้ว่าต้องปิด resource",
      "sql.Open ต้องอยู่ใน goroutine แยกเสมอ"
    ],
    "correctAnswerIndex": 1,
    "explanation": "<code>sql.Open</code> สำเร็จแล้ว (มี db object) แต่ <code>db.Ping()</code> fail ก่อน return cleanup func จะถูกสร้าง — ดังนั้น db ถูกเปิดแต่จะไม่มีใครปิด แก้ไขโดยเพิ่ม <code>db.Close()</code> ก่อน return error ในกรณี Ping fail: <code>db.Close(); return nil, nil, fmt.Errorf(...)</code>"
  },
  {
    "id": "wire-ch07-q09",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "Code ใน main.go ต่อไปนี้มีปัญหาอะไร?",
    "code": "func main() {\n    cfg := loadConfig()\n    app, cleanup, err := InitApp(cfg)\n    if err != nil {\n        log.Fatalf(\"init: %v\", err)\n    }\n    // ไม่มี defer cleanup()\n    app.Run()\n}",
    "options": [
      "ควรเรียก cleanup() ก่อน app.Run() ไม่ใช่หลัง",
      "ไม่มีปัญหา Wire จัดการ cleanup ให้อัตโนมัติเมื่อ main() return",
      "app.Run() จะเรียก cleanup() โดยอัตโนมัติเมื่อจบการทำงาน",
      "ขาด defer cleanup() ทำให้ resource ทุกตัวที่มี cleanup function จะไม่ถูกปิดเมื่อ app หยุดทำงาน"
    ],
    "correctAnswerIndex": 3,
    "explanation": "Code นี้<b>ขาด <code>defer cleanup()</code></b> Wire return cleanup func มาให้แต่ไม่เรียกให้อัตโนมัติ เมื่อ <code>app.Run()</code> return หรือ program จบด้วยสาเหตุใดก็ตาม resource ทุกตัว (DB, server, cache) จะไม่ถูกปิดอย่างถูกต้อง ควรเพิ่ม <code>defer cleanup()</code> ทันทีหลังบรรทัด error check"
  },
  {
    "id": "wire-ch07-q10",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "Provider ใดต่อไปนี้เขียนได้ถูกต้องตาม Wire conventions?",
    "options": [
      "func NewCache(cfg Config) *Cache { c := newRedis(cfg); defer c.Close(); return c }",
      "func NewCache(cfg Config) (*Cache, func(), error) { c, err := newRedis(cfg); if err != nil { return nil, nil, err }; return c, c.Close, nil }",
      "func NewCache(cfg Config) (*Cache, error, func()) { c, err := newRedis(cfg); if err != nil { return nil, err, nil }; return c, nil, c.Close }",
      "func NewCache(cfg Config) (*Cache, func() error) { c, _ := newRedis(cfg); return c, c.Close }"
    ],
    "correctAnswerIndex": 1,
    "explanation": "ตัวเลือกที่สองถูกต้อง: signature <code>(*Cache, func(), error)</code> ลำดับถูก (T, cleanup, error), จัดการ error, return <code>c.Close</code> เป็น cleanup func ตัวเลือกแรก defer ใน provider เองทำให้ resource ปิดทันทีแทนที่จะ defer ไว้ ตัวเลือกสาม error และ cleanup สลับลำดับกัน ตัวเลือกสี่ cleanup func return error ซึ่ง Wire ไม่รองรับ — cleanup ต้องเป็น <code>func()</code> เท่านั้น"
  },
  {
    "id": "wire-ch07-q11",
    "difficulty": "medium",
    "bloomLevel": "analyze",
    "question": "เหตุใด provider จึงไม่ควรเรียก db.Close() ด้วยตัวเองภายใน provider body แทนที่จะ return cleanup func?",
    "options": [
      "เพราะ Wire ห้าม provider เรียก method ของ resource ที่สร้าง",
      "เพราะ db.Close() เป็น blocking call ที่จะทำให้ Wire timeout",
      "เพราะ Wire ต้องการ cleanup func เพื่อ calculate dependency graph เท่านั้น",
      "เพราะถ้า provider ปิด resource เองโดยไม่ return cleanup func Wire จะไม่รู้ว่ามี cleanup และไม่สามารถรวมเข้า LIFO chain ได้ ทำให้ resource อาจถูกปิดในลำดับผิด"
    ],
    "correctAnswerIndex": 3,
    "explanation": "ถ้า provider ปิด resource เองโดยไม่ return cleanup func <b>Wire จะไม่รู้ว่า resource นั้นมี cleanup ที่ต้องประสาน</b> ผลคือ Wire ไม่สามารถรวม resource นั้นเข้า LIFO chain ได้ อาจทำให้ resource ถูกปิดก่อนที่ dependent ของมันจะหยุดทำงาน (LIFO order ถูกทำลาย) และอาจถูกปิดสองครั้งด้วย"
  },
  {
    "id": "wire-ch07-q12",
    "difficulty": "medium",
    "bloomLevel": "analyze",
    "question": "Injector stub ต่อไปนี้ถูกต้องหรือไม่?",
    "code": "//go:build wireinject\n\nfunc InitApp(cfg Config) (*App, func(), error) {\n    wire.Build(\n        NewDB,     // return (*sql.DB, func(), error)\n        NewServer, // return (*http.Server, func())\n        NewApp,    // return *App\n    )\n    return nil, nil, nil\n}",
    "options": [
      "ไม่ถูกต้อง เพราะ injector ที่มี cleanup ต้องมี signature เป็น (*App, func()) เท่านั้น ไม่มี error",
      "ไม่ถูกต้อง เพราะ placeholder return ต้องเป็น return nil, func(){}, nil ไม่ใช่ return nil, nil, nil",
      "ถูกต้อง Wire จะ generate implementation ที่ aggregate cleanup ทั้งสองตัวใน LIFO order",
      "ไม่ถูกต้อง เพราะ provider ที่มี cleanup ต้องอยู่ใน provider set แยกต่างหาก"
    ],
    "correctAnswerIndex": 2,
    "explanation": "Stub นี้<b>ถูกต้องทุกประการ</b> Signature <code>(*App, func(), error)</code> เหมาะสมเพราะมี provider ที่ return cleanup และ error อยู่ใน graph placeholder return <code>nil, nil, nil</code> เป็น boilerplate ที่ Wire กำหนด Wire จะ generate implementation ที่ aggregate cleanup ทั้ง NewDB และ NewServer ใน LIFO order และจัดการ mid-init error ให้อัตโนมัติ"
  },
  {
    "id": "wire-ch07-q13",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "Application มี providers ต่อไปนี้ตามลำดับ dependency: NewConfig → NewDB → NewCache → NewServer ถ้า NewCache fail cleanup จะรันในลำดับใด?",
    "options": [
      "NewCache cleanup, NewDB cleanup, NewConfig cleanup",
      "NewServer cleanup, NewCache cleanup, NewDB cleanup, NewConfig cleanup",
      "NewConfig cleanup, NewDB cleanup",
      "NewDB cleanup, NewConfig cleanup"
    ],
    "correctAnswerIndex": 3,
    "explanation": "เมื่อ NewCache fail, resource ที่สร้างสำเร็จแล้วคือ Config และ DB (สมมติว่ามี cleanup) Wire จะรัน cleanup ใน LIFO order ของสิ่งที่สร้างสำเร็จ: <b>DB cleanup ก่อน (สร้างทีหลัง) แล้ว Config cleanup (สร้างก่อน)</b> NewServer ยังไม่ได้สร้างจึงไม่มี cleanup ของมัน"
  },
  {
    "id": "wire-ch07-q14",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "ทำไมการ return `func() error` แทน `func()` จาก provider จึงไม่ทำงานกับ Wire?",
    "options": [
      "เพราะ Wire รองรับเฉพาะ exported function เป็น cleanup",
      "Wire กำหนดว่า cleanup function ต้องมี signature เป็น func() เท่านั้น func() error เป็น type ต่างกันที่ Wire ไม่รู้จัก",
      "เพราะ func() error จะทำให้ Wire สร้าง error หลายตัวซ้อนกัน",
      "Wire รองรับ func() error แต่ต้องประกาศเป็น named type ก่อน"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Wire ออกแบบให้ cleanup signature คือ <code>func()</code> เท่านั้น ใน Go <code>func()</code> และ <code>func() error</code> เป็น type ที่ต่างกันโดยสิ้นเชิง Wire จะไม่รู้จัก <code>func() error</code> ว่าเป็น cleanup function และจะ error ตอน codegen ถ้าต้องการ handle cleanup error ให้ log error ภายใน closure และ return <code>func()</code> แทน"
  },
  {
    "id": "wire-ch07-q15",
    "difficulty": "hard",
    "bloomLevel": "evaluate",
    "question": "นักพัฒนากล่าวว่า \"ฉันจะเรียก cleanup() โดยตรง ไม่ใช้ defer เพราะ defer มี overhead\" ข้อใดประเมินข้อกล่าวนี้ได้ถูกต้องที่สุด?",
    "options": [
      "ถูกต้อง — defer มี overhead จริงและควรหลีกเลี่ยงในทุกกรณี",
      "ผิด — cleanup() ที่เรียกโดยตรงจะไม่รันถ้า app.Run() panic หรือมี early return ก่อนถึงบรรทัด cleanup() ส่วน overhead ของ defer นั้นน้อยมากเมื่อเทียบกับ resource management ที่ถูกต้อง",
      "ถูกบางส่วน — ควรเรียก cleanup() ก่อน app.Run() แทนที่จะ defer",
      "ไม่สำคัญ — Wire จะ guarantee ว่า cleanup รันเสมอไม่ว่าจะ defer หรือเปล่า"
    ],
    "correctAnswerIndex": 1,
    "explanation": "การใช้ <code>defer cleanup()</code> สำคัญมากเพราะ <b>defer รันแม้จะมี panic หรือ early return</b> ถ้าเรียก <code>cleanup()</code> โดยตรงในตอนท้าย main และ <code>app.Run()</code> panic หรือ return early จากเหตุการณ์ที่ไม่คาดคิด cleanup จะไม่รัน overhead ของ defer นั้นน้อยมาก (nanoseconds) ไม่มีนัยสำคัญในบริบทของ app initialization และ shutdown"
  },
  {
    "id": "wire-ch07-q16",
    "difficulty": "hard",
    "bloomLevel": "evaluate",
    "question": "Application มี injector ดังนี้ แต่พบว่า DB connections ยังค้างอยู่หลัง program จบ สาเหตุที่เป็นไปได้มากที่สุดคืออะไร?",
    "code": "func main() {\n    cfg := loadConfig()\n    app, cleanup, err := InitApp(cfg)\n    if err != nil {\n        log.Fatal(err)\n    }\n    defer cleanup()\n    app.Run() // blocks until signal\n}",
    "options": [
      "log.Fatal เรียก os.Exit ซึ่ง skip defer ทุกตัว แต่ในกรณีนี้ err เป็น nil จึงไม่ใช่ปัญหา",
      "Wire มี bug ใน LIFO implementation ทำให้ DB cleanup ถูกข้าม",
      "NewDB ไม่ได้ return cleanup function ทำให้ Wire ไม่รู้ว่าต้องปิด DB เมื่อ cleanup ถูกเรียก",
      "defer cleanup() ถูกเรียกก่อน app.Run() จึงปิด DB ก่อนที่ app จะเริ่มทำงาน"
    ],
    "correctAnswerIndex": 2,
    "explanation": "ถ้า DB connections ยังค้างอยู่หลัง program จบ สาเหตุที่เป็นไปได้มากที่สุดคือ <b>NewDB ไม่ได้ return cleanup function</b> เช่น signature เป็น <code>(*sql.DB, error)</code> แทน <code>(*sql.DB, func(), error)</code> ทำให้ Wire ไม่รู้ว่าต้องปิด DB แม้จะมี <code>defer cleanup()</code> ใน main แต่ aggregated cleanup ไม่มี db.Close() อยู่ข้างใน"
  },
  {
    "id": "wire-ch07-q17",
    "difficulty": "hard",
    "bloomLevel": "evaluate",
    "question": "นักพัฒนาต้องการให้ cleanup ของ DB รัน timeout ที่ 30 วินาที แต่ cleanup signature ต้องเป็น func() วิธีใดถูกต้อง?",
    "options": [
      "Wire ไม่รองรับ timeout ใน cleanup ต้องใช้ goroutine แยกแทน",
      "ใช้ closure ใน provider ที่ capture timeout value ไว้ เช่น cleanup := func() { _, cancel := context.WithTimeout(context.Background(), 30*time.Second); defer cancel(); db.Close() }",
      "เปลี่ยน cleanup signature เป็น func(timeout time.Duration) และส่ง 30*time.Second จาก caller",
      "เพิ่ม timeout เป็น global variable แล้วอ้างอิงจาก cleanup func"
    ],
    "correctAnswerIndex": 1,
    "explanation": "วิธีที่ถูกต้องคือใช้ <b>closure</b> ที่ capture ค่า timeout ไว้ภายใน cleanup func ซึ่ง signature ยังคงเป็น <code>func()</code> ตามที่ Wire กำหนด ตัวอย่าง: <code>cleanup := func() { _, cancel := context.WithTimeout(context.Background(), 30*time.Second); defer cancel(); db.Close() }</code> (ใช้ <code>_</code> เพราะ context.Background() ถูก capture ใน cancel แล้ว ไม่ต้องอ้างอิง ctx โดยตรง) ข้อดีของ closure คือ capture ค่าที่ต้องการได้โดยไม่ต้องเปลี่ยน signature"
  },
  {
    "id": "wire-ch07-q18",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "Provider ต่อไปนี้มี signature แบบใดและเหมาะสมกับกรณีใด?",
    "code": "func NewServeMux(userH *UserHandler, orderH *OrderHandler) *http.ServeMux {\n    mux := http.NewServeMux()\n    mux.HandleFunc(\"/users\", userH.ServeHTTP)\n    mux.HandleFunc(\"/orders\", orderH.ServeHTTP)\n    return mux\n}",
    "options": [
      "Signature (T) — ไม่มี error ไม่มี cleanup เหมาะกับ resource ที่สร้างไม่มีทางล้มเหลวและไม่ต้องปิด",
      "Signature (T, error) — ควรเพิ่ม error เผื่อกรณี handler เป็น nil",
      "Signature (T, func()) — ควร return cleanup เสมอแม้จะไม่มีอะไรต้องปิด",
      "Signature (T, func(), error) — ควรใช้รูปแบบสมบูรณ์ทุกครั้งเพื่อ consistency"
    ],
    "correctAnswerIndex": 0,
    "explanation": "Signature <code>*http.ServeMux</code> (เพียงอย่างเดียว) เหมาะสมที่สุด การสร้าง ServeMux และ register routes ไม่มีทางล้มเหลว (ไม่มี I/O หรือ external call) และ ServeMux ไม่ต้องการ cleanup ใด ๆ Wire รองรับ signature <code>(T)</code> อย่างสมบูรณ์ การเพิ่ม error หรือ cleanup ที่ไม่จำเป็นถือเป็น over-engineering"
  },
  {
    "id": "wire-ch07-q19",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "ถ้าต้องการให้ injector return เพียง (*App, func()) โดยไม่มี error providers ทุกตัวในกราฟต้องเป็นอย่างไร?",
    "options": [
      "ต้องมี provider อย่างน้อยหนึ่งตัวที่ return (T, func(), error)",
      "Providers ทุกตัวต้องมี signature เป็น (T) หรือ (T, func()) เท่านั้น ไม่มีตัวใด return error",
      "Injector สามารถ return (*App, func()) ได้เสมอโดยไม่สนใจ signature ของ providers",
      "ต้องเพิ่ม wire.Value((*error)(nil)) ใน wire.Build เพื่อ suppress error"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Injector จะ return error ก็ต่อเมื่อมี provider ในกราฟที่ return error ถ้า providers <b>ทุกตัว</b>มี signature เป็น <code>(T)</code> หรือ <code>(T, func())</code> (ไม่มีใด return error) injector ที่ Wire generate จะมี signature เป็น <code>(*App, func())</code> โดยไม่มี error"
  },
  {
    "id": "wire-ch07-q20",
    "difficulty": "hard",
    "bloomLevel": "evaluate",
    "question": "นักพัฒนาออกแบบ provider แบบนี้โดยอ้างว่า \"ง่ายกว่า Wire cleanup\" ข้อใดวิจารณ์ข้อเสียของแนวทางนี้ได้ถูกต้องที่สุด?",
    "code": "var globalDB *sql.DB\n\nfunc NewDB(cfg Config) *sql.DB {\n    db, _ := sql.Open(\"postgres\", cfg.DSN)\n    globalDB = db\n    return db\n}\n\nfunc CloseAll() {\n    if globalDB != nil {\n        globalDB.Close()\n    }\n}",
    "options": [
      "แนวทางนี้ดีกว่า Wire cleanup เพราะ CloseAll เรียกได้ทุกที่",
      "ปัญหาคือ Wire ไม่รองรับ provider ที่ set global variable",
      "แนวทางนี้มีปัญหาหลายอย่าง: ไม่ thread-safe, LIFO order ไม่ถูกรับประกัน, testability แย่ลงเพราะ global state, และ error จาก sql.Open ถูกละเว้น",
      "ปัญหาเดียวคือ CloseAll ไม่ได้รับ context สำหรับ graceful shutdown"
    ],
    "correctAnswerIndex": 2,
    "explanation": "แนวทาง global state นี้มีปัญหาหลายอย่างพร้อมกัน: (1) <b>ไม่ thread-safe</b> — หลาย goroutine เข้าถึง globalDB พร้อมกันได้, (2) <b>LIFO order ไม่ถูกรับประกัน</b> — CloseAll เรียก cleanup ในลำดับที่ developer เลือก ไม่ใช่ Wire's LIFO, (3) <b>Testability แย่</b> — test ต้องจัดการ global state, (4) <b>Error ถูกละเว้น</b> — <code>_</code> ทิ้ง error จาก Open ไป"
  }
];
