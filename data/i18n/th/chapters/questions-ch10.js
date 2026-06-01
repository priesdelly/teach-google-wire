/* questions ch10 (TH) */
(window.QUESTIONS_TH = window.QUESTIONS_TH || {}).ch10 = [
  {
    "id": "wire-ch10-q01",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "ใน Capstone project เราออกแบบ dependency flow ในลำดับใด?",
    "options": [
      "Handler → Service → Repository → DB → Config",
      "Config → DB → Repository → Service → Handler → http.Server",
      "http.Server → Handler → Service → Config → DB",
      "DB → Config → Repository → Handler → Service"
    ],
    "correctAnswerIndex": 1,
    "explanation": "ลำดับที่ถูกต้องของ dependency flow คือ <b>Config → DB → Repository → Service → Handler → http.Server</b> แต่ละชั้นพึ่งพาชั้นก่อนหน้า Config ต้องสร้างก่อนเพราะทุกอย่างต้องการค่าจาก config, DB ต้องการ DSN จาก config, Repository ต้องการ DB เป็นต้น"
  },
  {
    "id": "wire-ch10-q02",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "ใน project structure แบบ Capstone แต่ละ layer ควรมีไฟล์ set.go ที่ประกาศอะไร?",
    "options": [
      "wire.Build ที่รวม providers ของทุก layer เข้าด้วยกัน",
      "injector function สำหรับ layer นั้น",
      "wire.NewSet ที่รวม providers และ wire.Bind ของ layer นั้นเอง",
      "//go:build wireinject build tag สำหรับ layer นั้น"
    ],
    "correctAnswerIndex": 2,
    "explanation": "แต่ละ layer ควรมีไฟล์ set.go ที่ประกาศ <b>wire.NewSet</b> รวม providers และ wire.Bind ของ layer นั้น เช่น RepositorySet = wire.NewSet(NewPostgresTaskRepo, wire.Bind(new(TaskRepository), new(*postgresTaskRepo))) วิธีนี้ทำให้ injector ใน wire.go สั้นและ reuse sets ข้าม injectors ได้"
  },
  {
    "id": "wire-ch10-q03",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "ไฟล์ wire_gen.go ควรจัดการอย่างไรใน version control?",
    "options": [
      "Commit เข้า VCS แต่ห้ามแก้ด้วยมือ",
      "ใส่ใน .gitignore เพราะ generated file ไม่ควร commit",
      "Commit เข้า VCS และแก้ไขได้โดยตรงถ้าจำเป็น",
      "ลบทิ้งหลัง build เสมอ เพราะ regenerate ได้จาก wire.go"
    ],
    "correctAnswerIndex": 0,
    "explanation": "<b>wire_gen.go ควร commit เข้า VCS</b> เพื่อให้ทีมสามารถ build project ได้โดยไม่ต้องรัน wire tool ทุกครั้ง แต่ห้ามแก้ด้วยมือเพราะจะถูก overwrite ทุกครั้งที่รัน wire; ต้องการเปลี่ยนแปลงให้แก้ที่ provider functions หรือ wire.go แล้วรัน wire ใหม่"
  },
  {
    "id": "wire-ch10-q04",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "เหตุใด NewDB provider จึงต้อง return cleanup func() แทนที่จะ defer db.Close() ภายใน provider เอง?",
    "options": [
      "เพราะ Wire ไม่รองรับ defer statement ใน provider functions",
      "เพราะการ return func() ทำให้โค้ดอ่านง่ายกว่าเท่านั้น ผลลัพธ์เหมือนกัน",
      "เพราะ db.Close เป็น method ไม่ใช่ function จึงต้อง wrap ใน closure เสมอ",
      "เพราะ defer ใน provider รันเมื่อ function return ทำให้ DB ถูกปิดทันที แต่การ return cleanup func ให้ Wire จัดการทำให้ปิดเมื่อ application ปิดจริง"
    ],
    "correctAnswerIndex": 3,
    "explanation": "<code>defer db.Close()</code> ใน provider จะรันเมื่อ NewDB function <b>return</b> ซึ่งเกิดขึ้นทันทีหลัง Wire สร้าง DB เสร็จ ทำให้ DB ถูกปิดก่อนที่จะถูกใช้งาน การ <b>return cleanup func</b> ให้ Wire รวมเข้า cleanup chain ทำให้ DB ปิดเมื่อ caller เรียก cleanup() ที่ได้จาก InitApp ซึ่งมักเกิดเมื่อ application กำลังจะ shutdown"
  },
  {
    "id": "wire-ch10-q05",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "ใน Capstone project ทำไม service layer จึงต้อง depend on TaskRepository interface แทน *postgresTaskRepo struct โดยตรง?",
    "options": [
      "เพราะ Wire ไม่สามารถ inject struct pointer ลงใน struct อื่นได้",
      "เพราะ interface ทำให้เขียน unit test ได้โดย inject mock แทน concrete; เปลี่ยน DB implementation ได้โดยไม่แก้ service",
      "เพราะ Go compiler บังคับให้ cross-package dependency ต้องเป็น interface เสมอ",
      "เพราะ wire.Bind ใช้ได้เฉพาะกับ interface ไม่ใช่ struct pointer"
    ],
    "correctAnswerIndex": 1,
    "explanation": "การ depend on <b>interface</b> แทน concrete type ทำให้: (1) เขียน unit test ง่ายโดย inject MockTaskRepository แทน *postgresTaskRepo ไม่ต้องต่อ DB จริง (2) สามารถสลับ implementation เช่น จาก PostgreSQL เป็น MySQL โดยไม่แก้ service layer เลย นี่คือหลัก Dependency Inversion Principle ที่ Wire รองรับด้วย wire.Bind"
  },
  {
    "id": "wire-ch10-q06",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "พิจารณาโค้ด RepositorySet นี้ มีอะไรผิดพลาด?",
    "code": "var RepositorySet = wire.NewSet(\n    wire.Bind(new(TaskRepository), new(*postgresTaskRepo)),\n)",
    "options": [
      "ผิด เพราะขาด NewPostgresTaskRepo provider ที่ Wire ต้องการสร้าง *postgresTaskRepo ก่อนทำ Bind",
      "ถูกต้อง เพียงพอแล้วเพราะ wire.Bind ให้ข้อมูลที่ Wire ต้องการ",
      "ผิด เพราะ wire.Bind ต้องเขียนนอก wire.NewSet ไม่ใช่ภายใน",
      "ถูกต้อง แต่ควรเพิ่ม wire.Value สำหรับ *sql.DB ด้วย"
    ],
    "correctAnswerIndex": 0,
    "explanation": "โค้ดนี้ขาด <b>NewPostgresTaskRepo</b> ใน set; wire.Bind บอกว่า \"ให้ใช้ *postgresTaskRepo แทน TaskRepository\" แต่ Wire ยังต้องการ provider ที่สร้าง *postgresTaskRepo ด้วย ถ้าไม่มี Wire จะ error ว่า \"no provider for *postgresTaskRepo\" ต้องเขียน: wire.NewSet(NewPostgresTaskRepo, wire.Bind(new(TaskRepository), new(*postgresTaskRepo)))"
  },
  {
    "id": "wire-ch10-q07",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "ต้องการให้ TaskHandler ถูก inject ด้วย wire.Struct แต่พบว่า field 'service' เป็น unexported ปัญหาคืออะไรและแก้อย่างไร?",
    "code": "type TaskHandler struct {\n    service TaskService // unexported\n}",
    "options": [
      "ไม่มีปัญหา wire.Struct inject ทั้ง exported และ unexported fields ได้เหมือนกัน",
      "แก้โดยเพิ่ม struct tag `wire:\"inject\"` บน unexported field",
      "Wire ไม่สามารถ inject unexported field ได้; ต้องเปลี่ยนเป็น exported field (Service TaskService) หรือเขียน constructor provider แทน",
      "แก้โดยใช้ wire.Struct(new(TaskHandler), \"service\") แทน \"*\""
    ],
    "correctAnswerIndex": 2,
    "explanation": "<b>wire.Struct inject ได้เฉพาะ exported fields</b> — ถ้า field เป็น unexported (lowercase) Wire จะ error ว่าไม่สามารถ set field นั้นได้ ทางแก้มีสองวิธี: (1) เปลี่ยนเป็น exported field <code>Service TaskService</code> ซึ่งยอมรับ trade-off ด้าน encapsulation หรือ (2) เขียน constructor function <code>NewTaskHandler(svc TaskService) *TaskHandler</code> แล้วใช้เป็น provider แทน wire.Struct"
  },
  {
    "id": "wire-ch10-q08",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "หลังเขียน wire.go เสร็จแล้ว ขั้นตอนต่อไปที่ถูกต้องเพื่อสร้าง wire_gen.go คืออะไร?",
    "options": [
      "รัน go build ./... แล้ว wire_gen.go จะถูกสร้างอัตโนมัติ",
      "รัน wire หรือ go generate ./... ในไดเรกทอรีที่มี wire.go",
      "คัดลอก wire.go ไปเป็น wire_gen.go แล้วแก้ build tag",
      "รัน go test ./... แล้ว Wire จะสร้าง wire_gen.go ให้ก่อน test"
    ],
    "correctAnswerIndex": 1,
    "explanation": "ต้องรัน <b>wire</b> command (หรือ <code>go generate ./...</code> ถ้ามี //go:generate wire directive) ใน package ที่มี wire.go Wire tool จะอ่าน wire.go, วิเคราะห์ dependency graph, แล้วสร้าง wire_gen.go <code>go build</code> และ <code>go test</code> ไม่ได้เรียก wire tool โดยอัตโนมัติ"
  },
  {
    "id": "wire-ch10-q09",
    "difficulty": "medium",
    "bloomLevel": "analyze",
    "question": "ใน wire_gen.go ที่ Wire สร้าง cleanup รันในลำดับ cleanup2() (HTTP server) แล้วจึง cleanup() (DB) ลำดับนี้ถูกต้องหรือไม่ และเพราะอะไร?",
    "options": [
      "ไม่ถูกต้อง ควร close DB ก่อนเสมอเพราะ DB เปิดก่อน HTTP server",
      "ลำดับไม่สำคัญ cleanup แต่ละตัวเป็น independent operation",
      "ถูกต้อง แต่ Wire สุ่มลำดับ cleanup ทุกครั้ง ไม่ได้รับประกัน LIFO",
      "ถูกต้อง เพราะ HTTP server ต้อง shutdown ก่อนเพื่อหยุดรับ request ใหม่และให้ request ที่ pending เสร็จก่อน จากนั้นจึง close DB ได้ปลอดภัย"
    ],
    "correctAnswerIndex": 3,
    "explanation": "ลำดับ <b>LIFO (Last-In, First-Out)</b> ที่ Wire ใช้ถูกต้องและมีเหตุผล: HTTP server ถูกสร้างหลัง DB ดังนั้น HTTP server จึงถูก cleanup ก่อน เหตุผลสำคัญคือ request ที่กำลัง in-flight อาจยังใช้ DB connection อยู่ ถ้า close DB ก่อน HTTP server request เหล่านั้นจะ fail ด้วย error ที่ไม่คาดคิด"
  },
  {
    "id": "wire-ch10-q10",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "ใน Capstone project มี provider set สองชุดสำหรับ production และ test โดย TestSet ใช้ MockTaskRepository แทน *postgresTaskRepo ข้อใดอธิบาย technique นี้ได้ถูกต้องที่สุด?",
    "options": [
      "TestSet เป็น override ที่แก้ไข RepositorySet ของ production โดยตรง",
      "TestSet ใช้ runtime reflection เพื่อ swap implementation ขณะ test รัน",
      "TestSet เป็น injector set แยกที่มี wire.Bind ต่างออกไป ผูก TaskRepository กับ *MockTaskRepository แทน *postgresTaskRepo — ทำให้ไม่ต้องต่อ DB จริงตอน test",
      "TestSet ทำงานเหมือน RepositorySet ทุกประการ แต่ข้ามขั้นตอน db.Ping"
    ],
    "correctAnswerIndex": 2,
    "explanation": "นี่คือ pattern ที่สำคัญของ Wire: สร้าง <b>injector set แยก</b> สำหรับ test ที่มี wire.Bind ต่างออกไป เช่น <code>var TestSet = wire.NewSet(NewMockTaskRepo, wire.Bind(new(repository.TaskRepository), new(*MockTaskRepository)), service.ServiceSet, handler.HandlerSet, ...)</code> ทำให้ test injector ไม่ต้องการ DB จริง รันเร็ว และ isolated Wire ไม่มี override mechanism; ใช้ injector set แยกที่สมบูรณ์แทน"
  },
  {
    "id": "wire-ch10-q11",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "นักพัฒนาเพิ่ม EmailService เป็น dependency ให้ taskService แต่ลืมรัน wire หลังจากแก้ signature ของ NewTaskService จะเกิดอะไรขึ้นเมื่อรัน go build?",
    "code": "// เพิ่ม emailSvc EmailService parameter\nfunc NewTaskService(repo TaskRepository, emailSvc EmailService) *taskService {",
    "options": [
      "Wire จะ detect การเปลี่ยนแปลงอัตโนมัติและ regenerate wire_gen.go ทุกครั้งที่ build",
      "Application จะ compile ผ่านแต่ EmailService จะเป็น nil ตอน runtime",
      "Wire จะ auto-detect และ inject EmailService เพิ่มโดยไม่ต้องรัน wire ใหม่",
      "go build จะ fail เพราะ wire_gen.go เก่าเรียก NewTaskService ด้วย argument เดิม (ขาด emailSvc) ทำให้ type mismatch"
    ],
    "correctAnswerIndex": 3,
    "explanation": "wire_gen.go ที่เก่า generate NewTaskService(taskRepository) โดยส่ง argument แค่ตัวเดียว แต่หลังแก้ signature ต้องการสอง arguments ดังนั้น <b>go build จะ fail</b> ด้วย \"too few arguments in call to NewTaskService\" Wire ไม่ auto-regenerate; ต้องรัน <code>wire</code> หรือ <code>go generate</code> ก่อน build ทุกครั้งที่แก้ provider signature นี่คือเหตุผลที่ควรเพิ่ม wire gen ใน CI pipeline"
  },
  {
    "id": "wire-ch10-q12",
    "difficulty": "hard",
    "bloomLevel": "evaluate",
    "question": "ทีมถกเถียงว่าควรสร้าง provider set ต่อ package หรือสร้าง GlobalSet ขนาดใหญ่เพียงชุดเดียว ข้อใดเป็นการตัดสินใจที่ดีกว่าและเพราะอะไร?",
    "options": [
      "GlobalSet ดีกว่าเสมอ เพราะลด boilerplate และไฟล์ที่ต้องดูแล",
      "Set ต่อ layer/package ดีกว่า เพราะ reuse ข้าม injectors ได้ (เช่น prod vs test), เปลี่ยน implementation ใน layer เดียวโดยไม่กระทบ set อื่น, และอ่านได้ชัดเจนว่า layer นี้มี providers อะไรบ้าง",
      "จำนวน set ไม่มีผลต่อ functionality; เลือกตามความชอบของทีม",
      "GlobalSet ดีกว่าในทุก case ที่ project มีมากกว่า 10 providers"
    ],
    "correctAnswerIndex": 1,
    "explanation": "<b>Set ต่อ layer/package ดีกว่า</b> ด้วยเหตุผลหลักสามข้อ: (1) <b>Reusability</b> — test injector ใช้ ServiceSet และ HandlerSet เดิมได้ แต่ swap RepositorySet เป็น TestRepositorySet; (2) <b>Isolation</b> — เมื่อเปลี่ยน DB driver แก้เฉพาะ RepositorySet ไม่กระทบ set อื่น; (3) <b>Clarity</b> — อ่าน set.go แล้วรู้ทันทีว่า layer นี้ wire อะไรบ้าง GlobalSet ขนาดใหญ่ reuse ได้ยากและแก้ไขแล้วกระทบทุก injector"
  },
  {
    "id": "wire-ch10-q13",
    "difficulty": "hard",
    "bloomLevel": "evaluate",
    "question": "เปรียบเทียบสองวิธีการจัดการ config ใน Wire: (A) ส่ง Config struct เป็น parameter ของ InitApp และ (B) สร้าง provider function NewConfig ที่อ่านค่าจาก env variable เอง ข้อใดอธิบาย trade-off ได้ถูกต้องที่สุด?",
    "options": [
      "วิธี B ดีกว่าเสมอ เพราะ main.go ไม่ต้องรู้เรื่อง config เลย",
      "วิธี A และ B ให้ผลเหมือนกันในทุกกรณี เลือกตามสไตล์โค้ด",
      "วิธี A เหมาะเมื่อต้องการ load config ก่อน Wire (เช่น validate ก่อน inject) หรือต้องการ test ที่ส่ง config ต่างกัน; วิธี B เหมาะเมื่อ config loading เป็นส่วนหนึ่งของ initialization graph",
      "วิธี A ไม่ถูกต้อง เพราะ Wire ไม่รองรับ struct เป็น parameter ของ injector"
    ],
    "correctAnswerIndex": 2,
    "explanation": "ทั้งสองวิธีถูกต้อง แต่มี trade-off: <b>วิธี A (Config เป็น parameter)</b> ทำให้ main.go ควบคุม config loading เอง สามารถ validate หรือ transform ก่อนส่ง Wire และ test injector รับ config ที่ต่างกันได้ง่าย <b>วิธี B (NewConfig provider)</b> ซ่อน loading logic ใน Wire graph เหมาะเมื่อ config loading ง่ายและไม่ต้องการ customization ใน Capstone project ใช้วิธี A เพราะ config มักต้องการ validation ก่อน inject และ test injector ต้องการ config ที่แตกต่างจาก production"
  },
  {
    "id": "wire-ch10-q14",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "ใน main.go ของ Capstone project นักพัฒนาเขียนโค้ดดังนี้ มีปัญหาอะไร?",
    "code": "srv, cleanup, err := InitApp(cfg)\ndefer cleanup()\nif err != nil {\n    log.Fatal(err)\n}",
    "options": [
      "ไม่มีปัญหา โค้ดถูกต้องและ cleanup จะรันหลัง error",
      "defer cleanup() อยู่ก่อน error check; ถ้า InitApp fail cleanup อาจเป็น nil ทำให้ panic เมื่อ defer รัน ต้องย้าย defer cleanup() หลัง error check",
      "ควรใช้ go cleanup() แทน defer cleanup() เพื่อ non-blocking",
      "log.Fatal ไม่ทำให้ defer รัน ควรใช้ os.Exit(1) แทน"
    ],
    "correctAnswerIndex": 1,
    "explanation": "ปัญหาคือ <code>defer cleanup()</code> อยู่ <b>ก่อน</b> error check ถ้า InitApp return error, cleanup อาจเป็น nil function และเมื่อ defer รันจะ panic ลำดับที่ถูกต้อง: ตรวจ error ก่อน แล้วจึง defer cleanup(): <code>srv, cleanup, err := InitApp(cfg); if err != nil { log.Fatal(err) }; defer cleanup()</code>"
  },
  {
    "id": "wire-ch10-q15",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "NewDB และ NewHTTPServer ต่างก็ return cleanup func() Wire รวม cleanup หลายตัวอย่างไรใน wire_gen.go?",
    "options": [
      "Wire รวม cleanup functions ทุกตัวเข้าเป็น single anonymous function ที่รัน cleanup ทั้งหมดตามลำดับ LIFO ใน wire_gen.go",
      "Wire เลือก cleanup ของ resource ตัวสุดท้ายเท่านั้นและทิ้งตัวอื่น",
      "Wire สร้าง injector ที่ return slice ของ func() ให้ caller รันเอง",
      "Wire ไม่สนับสนุน multiple cleanup functions; provider ที่มี cleanup ได้แค่ตัวเดียวต่อ injector"
    ],
    "correctAnswerIndex": 0,
    "explanation": "Wire สร้าง <b>single cleanup function</b> ใน wire_gen.go ที่ wrap cleanup ทุกตัวตาม LIFO order เช่น: <code>return httpServer, func() { cleanup2(); cleanup() }, nil</code> โดย cleanup2 คือ HTTP server shutdown และ cleanup คือ DB close Caller ได้รับ cleanup function ตัวเดียวและเรียก <code>defer cleanup()</code> เพียงครั้งเดียว Wire จัดการลำดับให้ทั้งหมด"
  },
  {
    "id": "wire-ch10-q16",
    "difficulty": "hard",
    "bloomLevel": "create",
    "question": "ต้องการเพิ่ม Redis cache layer โดย RedisCache implement TaskRepository interface ด้วย ต้องแก้ไขอะไรใน Wire setup บ้าง?",
    "options": [
      "ไม่ต้องแก้อะไร Wire detect Redis dependency อัตโนมัติจาก import",
      "ลบ RepositorySet ทั้งหมดแล้วสร้างใหม่; ไม่สามารถ modify set ที่มีอยู่แล้วได้",
      "แก้เฉพาะ service layer โดยเพิ่ม RedisCache dependency; ไม่ต้องแตะ wire.Bind",
      "เพิ่ม NewRedisCache provider และแก้ wire.Bind ใน RepositorySet ให้ผูก TaskRepository กับ *RedisCache แทน *postgresTaskRepo แล้วรัน wire ใหม่"
    ],
    "correctAnswerIndex": 3,
    "explanation": "ขั้นตอน: (1) สร้าง <code>NewRedisCache(client *redis.Client) *RedisCache</code> provider ที่ implement TaskRepository (2) แก้ RepositorySet ให้ include provider ของ Redis และเปลี่ยน wire.Bind: <code>wire.NewSet(NewRedisCache, wire.Bind(new(TaskRepository), new(*RedisCache)))</code> (3) เพิ่ม Redis client provider ด้วย (4) รัน <code>wire</code> เพื่อ regenerate wire_gen.go การ swap implementation ผ่าน wire.Bind คือ <b>exactly the use case</b> ที่ wire.Bind ออกแบบมาสำหรับ"
  },
  {
    "id": "wire-ch10-q17",
    "difficulty": "hard",
    "bloomLevel": "evaluate",
    "question": "ทีมถามว่า ถ้าต้องการ inject request-scoped logger (ที่มี trace ID ของแต่ละ request) เข้าไปใน handler ควรออกแบบอย่างไรกับ Wire?",
    "options": [
      "เพิ่ม *slog.Logger เป็น field ใน TaskHandler แล้ว Wire inject logger singleton เดียวให้",
      "Wire ไม่รองรับ per-request injection; ต้องใช้ global logger แทน",
      "ใช้ context.Context เก็บ logger แล้วส่งผ่าน context ใน handler method แทนการ inject ผ่าน Wire",
      "สร้าง per-request injector function ที่รับ traceID string เป็น parameter แล้ว Wire สร้าง logger ที่มี traceID นั้น แต่ singleton เช่น DB ส่งผ่าน parameter ไม่ใช่สร้างใหม่"
    ],
    "correctAnswerIndex": 2,
    "explanation": "สำหรับ <b>request-scoped logger</b> วิธีที่ดีที่สุดใน Go คือผ่าน <code>context.Context</code> เพราะ (1) per-request injector ที่สร้าง logger ต้องเรียกทุก request ทำให้ allocate objects มากเกินไป (2) Wire per-request injector เหมาะกับกรณีที่ component ทั้งชุดต้อง fresh เท่านั้น (3) Go idiom สำหรับ request-scoped values คือ context ไม่ใช่ DI ตัวเลือก D ก็ถูกแต่ยุ่งยากกว่า; ตัวเลือก A inject singleton logger ไม่มี traceID; ตัวเลือก C คือ idiomatic Go ที่ถูกต้อง"
  },
  {
    "id": "wire-ch10-q18",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "build tag ใดต้องมีใน wire_gen.go ที่ Wire สร้าง เพื่อไม่ให้ conflict กับ wire.go?",
    "options": [
      "//go:build wireinject",
      "//go:build !wireinject",
      "//go:build wire",
      "//go:build production"
    ],
    "correctAnswerIndex": 1,
    "explanation": "<b>wire_gen.go</b> มี build tag <code>//go:build !wireinject</code> ซึ่งตรงข้ามกับ wire.go ที่มี <code>//go:build wireinject</code> ทำให้ทั้งสองไฟล์ไม่ถูก compile พร้อมกัน: ตอนรัน wire tool อ่านเฉพาะ wire.go (wireinject=true), ตอน go build ใช้เฉพาะ wire_gen.go (wireinject=false)"
  },
  {
    "id": "wire-ch10-q19",
    "difficulty": "medium",
    "bloomLevel": "analyze",
    "question": "ใน wire_gen.go ที่ Wire สร้างสำหรับ Capstone project บรรทัด taskHandler := &handler.TaskHandler{Service: taskService} มาจาก Wire directive ใด?",
    "options": [
      "wire.Bind(new(handler.TaskHandler), new(*handler.TaskHandler)) ใน HandlerSet",
      "NewTaskHandler provider ที่เขียนด้วยมือใน handler package",
      "wire.Struct(new(handler.TaskHandler), \"*\") ใน HandlerSet ซึ่งบอก Wire ให้ inject ทุก exported field",
      "wire.Value(&handler.TaskHandler{}) ที่ระบุ value โดยตรง"
    ],
    "correctAnswerIndex": 2,
    "explanation": "<code>&handler.TaskHandler{Service: taskService}</code> ใน wire_gen.go คือ code ที่ Wire สร้างจาก <b>wire.Struct(new(handler.TaskHandler), \"*\")</b> — Wire inject ทุก exported field โดยหา dependency สำหรับแต่ละ field จาก dependency graph; field Service เป็น TaskService interface ซึ่งหาค่าได้จาก wire.Bind ใน ServiceSet นี่คือ output ที่ได้เมื่อไม่มี constructor function แต่ใช้ wire.Struct แทน"
  },
  {
    "id": "wire-ch10-q20",
    "difficulty": "hard",
    "bloomLevel": "create",
    "question": "นักพัฒนาต้องการสร้าง health check endpoint /healthz ที่ต้องการ *sql.DB เพื่อ ping database จะเพิ่มเข้าใน Wire setup อย่างไรจึงถูกต้อง?",
    "options": [
      "เพิ่ม db.Ping() ใน main.go โดยตรง เพราะ health check ไม่ใช่ส่วนของ Wire",
      "สร้าง HealthHandler struct ที่มี field DB *sql.DB, เพิ่ม wire.Struct(new(HealthHandler), \"*\") ใน HandlerSet, และใน NewServeMux เพิ่ม parameter *HealthHandler แล้วลงทะเบียน route /healthz",
      "เพิ่ม /healthz ใน TaskHandler.Register โดยไม่ต้องการ provider เพิ่ม",
      "สร้าง health check provider แยก package และ wire.Bind กับ http.Handler interface"
    ],
    "correctAnswerIndex": 1,
    "explanation": "วิธีที่ถูกต้องคือ: (1) สร้าง <code>HealthHandler struct { DB *sql.DB }</code> (2) เพิ่ม <code>wire.Struct(new(HealthHandler), \"*\")</code> ใน HandlerSet — Wire จะ inject *sql.DB ซึ่งมีอยู่แล้วใน graph (3) แก้ <code>NewServeMux</code> ให้รับ *HealthHandler เพิ่มและลงทะเบียน <code>/healthz</code> (4) รัน wire ใหม่ — Wire จะเชื่อม *sql.DB ที่สร้างจาก db.NewDB เข้า HealthHandler อัตโนมัติ ไม่ต้องสร้าง DB ใหม่เพราะ Wire ใช้ instance เดิมที่มีอยู่แล้วใน graph"
  }
];
