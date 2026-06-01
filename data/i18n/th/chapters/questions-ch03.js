/* questions ch03 (TH) */
(window.QUESTIONS_TH = window.QUESTIONS_TH || {}).ch03 = [
  {
    "id": "wire-ch03-q01",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "\"Provider\" ในบริบทของ Google Wire คืออะไร?",
    "options": [
      "Interface พิเศษที่ต้อง implement เพื่อให้ Wire รู้จัก component",
      "Struct tag ที่ใส่บน field เพื่อบอก Wire ว่า field นั้นต้องการ inject",
      "Configuration file ที่บอก Wire ว่าต้อง wire dependency ลำดับใดก่อน",
      "Go function ธรรมดาที่ return value ของ type หนึ่ง ๆ ซึ่ง Wire ใช้สร้าง dependency"
    ],
    "correctAnswerIndex": 3,
    "explanation": "<b>Provider</b> ใน Wire คือ Go constructor function ธรรมดา — ไม่ต้องใช้ interface พิเศษ ไม่ต้องใส่ struct tag Wire อ่าน return type ของ function เพื่อรู้ว่า provider นั้นให้ value ชนิดใด"
  },
  {
    "id": "wire-ch03-q02",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "Wire ใช้อะไรเป็น \"key\" ในการจับคู่ dependency ระหว่าง providers?",
    "options": [
      "ชื่อของ function เช่น NewDB หรือ NewUserRepo",
      "ชื่อของ parameter เช่น db หรือ repo",
      "Go type ของ return value และ parameter",
      "ลำดับที่ provider ถูกเขียนใน wire.Build"
    ],
    "correctAnswerIndex": 2,
    "explanation": "Wire จับคู่ dependency <b>ด้วย Go type เท่านั้น</b> ชื่อ function หรือชื่อ parameter ไม่มีความสำคัญใด ๆ ถ้า provider A return <code>*sql.DB</code> และ provider B รับ parameter <code>*sql.DB</code> Wire จะเชื่อมทั้งสองเข้าหากันโดยอัตโนมัติ"
  },
  {
    "id": "wire-ch03-q03",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "Provider function สามารถ return ค่าในรูปแบบใดได้บ้าง (เฉพาะที่ Chapter 3 ครอบคลุม)?",
    "options": [
      "Return ได้สองรูปแบบ: value เดียว หรือ (value, error)",
      "Return ได้แค่ value เดียว ห้าม return error",
      "Return ได้เฉพาะ pointer ห้าม return value type",
      "Return ได้สามรูปแบบ: value เดียว, (value, error), หรือ (value, func(), error)"
    ],
    "correctAnswerIndex": 0,
    "explanation": "ใน Chapter 3 นี้ Wire รองรับสองรูปแบบหลัก: <code>func New() T</code> และ <code>func New() (T, error)</code> (รูปแบบที่สาม <code>(T, func(), error)</code> เป็น cleanup function ซึ่งอยู่ใน Chapter 7)"
  },
  {
    "id": "wire-ch03-q04",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "wire.Build(…) ใช้ทำอะไรใน injector stub?",
    "options": [
      "รัน provider functions ทั้งหมดและ return ผลลัพธ์ทันที",
      "กำหนดลำดับการเรียก constructor ให้ Wire ทำตาม",
      "บอก Wire ว่ามี provider อะไรบ้างที่จะใช้สร้าง dependency graph",
      "Import package ที่จำเป็นสำหรับ providers ทุกตัวโดยอัตโนมัติ"
    ],
    "correctAnswerIndex": 2,
    "explanation": "<code>wire.Build(...)</code> เป็นการบอก Wire (ตอน code generation) ว่ามี providers อะไรบ้างที่อยู่ใน \"pool\" โดย Wire จะ trace dependency graph เองและตัดสินใจลำดับที่ถูกต้อง ไม่ได้รัน function จริงตอน compile-time"
  },
  {
    "id": "wire-ch03-q05",
    "difficulty": "easy",
    "bloomLevel": "understand",
    "question": "พิจารณา function นี้:\n\nfunc NewCache(cfg Config) *Cache\n\nในบริบทของ Wire parameter cfg Config มีความหมายว่าอะไร?",
    "code": "func NewCache(cfg Config) *Cache",
    "options": [
      "Wire จะสร้าง Config ใหม่เปล่า ๆ โดยไม่ต้องมี provider",
      "Config คือ dependency ที่ Wire ต้องหา provider มาส่งให้ หรือ caller ส่งมาเป็น injector parameter",
      "Wire จะ skip parameter นี้เพราะเป็น struct ไม่ใช่ pointer",
      "Wire จะ error เพราะ Config ไม่ได้ implement Wire interface"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Parameter แต่ละตัวของ provider คือ <b>dependency</b> ที่ Wire ต้องจัดหามาให้ Wire จะมองหา provider ที่ return <code>Config</code> ใน wire.Build หรือถ้า injector function มี <code>cfg Config</code> เป็น parameter ก็ถือว่า caller จัดหาให้แล้ว"
  },
  {
    "id": "wire-ch03-q06",
    "difficulty": "easy",
    "bloomLevel": "understand",
    "question": "return nil, nil ท้าย injector stub มีความหมายว่าอะไร?",
    "code": "func InitApp() (*App, error) {\n    wire.Build(NewDB, NewRepo, NewApp)\n    return nil, nil\n}",
    "options": [
      "บอก Wire ว่า injection ล้มเหลวและควร return error",
      "เป็นโค้ดที่รันจริงและ Wire จะใช้ค่า nil เหล่านี้ใน wire_gen.go",
      "ทำให้ Wire รู้ว่า injector นี้ optional และอาจไม่ถูกเรียกก็ได้",
      "เป็นเพียง placeholder สำหรับ compiler — Wire จะสร้าง body จริงใน wire_gen.go แทน"
    ],
    "correctAnswerIndex": 3,
    "explanation": "<code>return nil, nil</code> ใน stub เป็นแค่ placeholder เพื่อให้ compiler ไม่ error เกี่ยวกับ missing return statement Wire จะสร้างโค้ดจริงใน <code>wire_gen.go</code> แทนที่ stub ทั้งหมด ค่าที่ return ใน stub ไม่มีผลใด ๆ ต่อ generated code"
  },
  {
    "id": "wire-ch03-q07",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "จาก provider ทั้งสามตัวนี้ ข้อใดคือ wire.Build ที่ถูกต้องเพื่อสร้าง *Server?",
    "code": "func NewDB() *sql.DB\nfunc NewRepo(db *sql.DB) *Repo\nfunc NewServer(repo *Repo) *Server",
    "options": [
      "wire.Build(NewServer) เพียงตัวเดียวพอ เพราะ Wire หา dependencies เองได้",
      "ทั้ง wire.Build(NewDB, NewRepo, NewServer) และ wire.Build(NewServer, NewRepo, NewDB) ถูกต้อง เพราะลำดับใน wire.Build ไม่สำคัญ",
      "wire.Build(NewDB, NewRepo) เพียงสองตัวพอ เพราะ Wire รู้จาก return type แล้ว",
      "wire.Build ต้องเรียงจาก leaf ไป root เสมอ คือ wire.Build(NewDB, NewRepo, NewServer)"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Wire คำนวณลำดับ constructor calls จาก type graph เอง <strong>ลำดับที่เขียนใน wire.Build ไม่มีผล</strong> ดังนั้น <code>wire.Build(NewDB, NewRepo, NewServer)</code> และ <code>wire.Build(NewServer, NewRepo, NewDB)</code> ให้ผลเหมือนกันทุกประการ ตัวเลือก A ผิดเพราะขาด NewDB และ NewRepo"
  },
  {
    "id": "wire-ch03-q08",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "Wire จะ error เมื่อรันกับ injector นี้หรือไม่? เพราะอะไร?",
    "code": "func NewLogger() *Logger\nfunc NewService(repo *Repo) *Service\n\nfunc InitService() *Service {\n    wire.Build(NewLogger, NewService)\n    return nil\n}",
    "options": [
      "ไม่ error — Wire หา provider ทุกตัวที่จำเป็นครบแล้ว",
      "Error — NewLogger ไม่ถูกใช้งานใน dependency graph ของ *Service",
      "Error — injector ไม่ได้ return error จึงใช้ wire.Build ไม่ได้",
      "Error — ขาด provider สำหรับ *Repo ซึ่ง NewService ต้องการ"
    ],
    "correctAnswerIndex": 3,
    "explanation": "NewService ต้องการ <code>*Repo</code> เป็น parameter แต่ใน wire.Build ไม่มี provider ที่ return <code>*Repo</code> Wire จะ error: <code>wire: no provider found for *main.Repo</code> ส่วน NewLogger แม้จะไม่ถูกใช้ใน path ไปยัง *Service Wire จะ error ด้านขาด provider สำหรับ *Repo ก่อน"
  },
  {
    "id": "wire-ch03-q09",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "โค้ดนี้จะเกิดปัญหาอะไรเมื่อรัน wire?",
    "code": "func NewPostgresDB() *sql.DB {\n    // connect to Postgres\n}\n\nfunc NewMySQLDB() *sql.DB {\n    // connect to MySQL\n}\n\nfunc InitApp() (*App, error) {\n    wire.Build(NewPostgresDB, NewMySQLDB, NewRepo, NewApp)\n    return nil, nil\n}",
    "options": [
      "Wire จะ error เพราะมี provider สองตัว return *sql.DB ซึ่งเป็น duplicate binding",
      "ไม่มีปัญหา — Wire จะเลือก provider ที่เร็วกว่า",
      "Wire จะใช้ provider ที่เขียนก่อนใน wire.Build เสมอ คือ NewPostgresDB",
      "Wire จะสร้าง *sql.DB สองตัวและส่งให้ NewRepo ตัวที่เหมาะสมกว่า"
    ],
    "correctAnswerIndex": 0,
    "explanation": "Wire ไม่สามารถเลือก provider ได้เองเมื่อมีสองตัว return type เดียวกัน Wire จะ error: <code>*sql.DB is provided twice</code> ต้องเลือกว่าจะใช้ตัวไหน และลบตัวที่ไม่ใช้ออกจาก wire.Build"
  },
  {
    "id": "wire-ch03-q10",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "Provider function นี้ถูกต้องสำหรับ Wire หรือไม่?",
    "code": "func newConfig() Config {\n    return Config{DSN: \"postgres://localhost/mydb\"}\n}",
    "options": [
      "ไม่ถูกต้อง — provider ต้องเป็น exported function (ขึ้นต้นด้วยตัวพิมพ์ใหญ่)",
      "ไม่ถูกต้อง — provider ต้องมี parameter อย่างน้อยหนึ่งตัว",
      "ไม่ถูกต้อง — provider ต้อง return pointer เสมอ ห้าม return value type",
      "ถูกต้อง — Wire รองรับทั้ง exported และ unexported provider และ return value type ก็ได้"
    ],
    "correctAnswerIndex": 3,
    "explanation": "Wire รองรับ unexported function เป็น provider ได้ตราบที่ใช้ภายใน package เดียวกัน และ return type สามารถเป็น value type (<code>Config</code>) หรือ pointer (<code>*Config</code>) ก็ได้ — Wire ถือว่าเป็นคนละ type กัน"
  },
  {
    "id": "wire-ch03-q11",
    "difficulty": "medium",
    "bloomLevel": "analyze",
    "question": "พิจารณา providers เหล่านี้:\n\nfunc NewRepo(db *sql.DB) *Repo\nfunc NewService(repo Repo) *Service\n\nถ้า NewRepo return *Repo แต่ NewService รับ parameter เป็น Repo (ไม่มี *) จะเกิดอะไรขึ้น?",
    "code": "func NewRepo(db *sql.DB) *Repo       // return *Repo\nfunc NewService(repo Repo) *Service  // รับ Repo (value, ไม่ใช่ pointer)",
    "options": [
      "Wire จะ auto-dereference pointer ให้อัตโนมัติ ไม่มีปัญหา",
      "Go compiler จะจัดการให้เองตอน compile เพราะ pointer กับ value ใน Go แปลงกันได้",
      "Wire จะ error เพราะ *Repo และ Repo เป็นคนละ type สำหรับ Wire",
      "Wire จะ warn แต่ยังสร้าง wire_gen.go ได้"
    ],
    "correctAnswerIndex": 2,
    "explanation": "Wire match dependency <b>ด้วย type แบบตรงทั้งหมด</b> <code>*Repo</code> และ <code>Repo</code> เป็นคนละ type Wire จะ error: <code>no provider found for main.Repo</code> เพราะมีแค่ provider สำหรับ <code>*Repo</code> แต่ไม่มีสำหรับ <code>Repo</code> ต้องแก้ให้ signature ตรงกัน"
  },
  {
    "id": "wire-ch03-q12",
    "difficulty": "medium",
    "bloomLevel": "analyze",
    "question": "นักพัฒนาเพิ่มโค้ดนี้ใน injector stub แล้วสงสัยว่าทำไม generated code ไม่ใช้ค่า x:",
    "code": "func InitApp() *App {\n    x := computeDefault()\n    wire.Build(NewApp)\n    return nil\n}",
    "options": [
      "เพราะ x ต้องถูก pass เข้า wire.Build โดยตรงเพื่อให้ Wire ใช้ได้",
      "Wire อ่านแค่ wire.Build call เท่านั้น โค้ดอื่นทั้งหมดใน injector body ถูกละเว้นตอน code generation",
      "เพราะ computeDefault ไม่ใช่ provider function ที่ถูกต้อง",
      "Wire ไม่รองรับตัวแปร local ใน injector ต้องย้ายไปไว้ใน provider แทน"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Wire parser อ่านแค่ <code>wire.Build(...)</code> call ใน injector body เท่านั้น ทุกโค้ดอื่นในนั้นถูกละเว้นอย่างสมบูรณ์ตอน code generation ถ้าต้องการส่งค่าจาก <code>computeDefault()</code> เข้าสู่ dependency graph ต้องเพิ่มเป็น provider หรือ injector parameter แทน"
  },
  {
    "id": "wire-ch03-q13",
    "difficulty": "medium",
    "bloomLevel": "analyze",
    "question": "ข้อใดคือวิธีที่ถูกต้องในการ trace dependency graph เพื่อตรวจสอบว่า providers ครบหรือไม่?",
    "options": [
      "ดูลำดับของ providers ใน wire.Build จากบนลงล่าง — ต้องเรียงจาก leaf ไป root",
      "นับจำนวน providers ใน wire.Build ว่ามีมากกว่าจำนวน types ที่ต้องการหรือไม่",
      "ดูที่ชื่อ provider functions — ถ้าชื่อตรงกันแสดงว่า Wire จะจับคู่ได้",
      "เริ่มจาก return type ของ injector แล้วไล่หา parameter ของแต่ละ provider ไปเรื่อย ๆ จนถึง leaf"
    ],
    "correctAnswerIndex": 3,
    "explanation": "วิธีที่ถูกต้องคือเริ่มจาก <b>return type ของ injector</b> แล้วถามว่า provider ที่ return type นั้นต้องการ parameter (dependency) อะไร จากนั้นทำซ้ำกับแต่ละ dependency จนถึง leaf node ที่ไม่มี parameter ลำดับใน wire.Build และชื่อ function ไม่เกี่ยวข้อง"
  },
  {
    "id": "wire-ch03-q14",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "Wire จะ error กับโค้ดชุดนี้หรือไม่? เพราะอะไร?",
    "code": "type DB struct{}\ntype DBConn struct{}\n\nfunc NewDB() *DB         { return &DB{} }\nfunc NewDBConn() *DBConn { return &DBConn{} }\nfunc NewRepo(db *DB) *Repo { return &Repo{db: db} }\n\nfunc InitRepo() *Repo {\n    wire.Build(NewDB, NewDBConn, NewRepo)\n    return nil\n}",
    "options": [
      "Error — Wire ไม่อนุญาตให้มี provider ที่ไม่ได้ถูกใช้ใน dependency graph",
      "ไม่ error — Wire จะใช้ NewDB สำหรับ NewRepo และ NewDBConn จะถูก ignore อย่างเงียบ",
      "Error — *DB และ *DBConn return type คล้ายกันเกินไปทำให้ Wire สับสน",
      "ไม่แน่ใจ — ขึ้นอยู่กับ Wire version"
    ],
    "correctAnswerIndex": 0,
    "explanation": "Wire จะ error เพราะ <code>NewDBConn</code> เป็น provider ที่ไม่ได้ถูกใช้ใน dependency graph ของ <code>*Repo</code> เลย Wire ถือว่า provider ที่ไม่มีใครต้องการเป็น error (unused provider) ต้องลบ NewDBConn ออกจาก wire.Build หรือเพิ่ม consumer สำหรับ *DBConn"
  },
  {
    "id": "wire-ch03-q15",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "พิจารณาโค้ดนี้และเลือกคำอธิบายที่ถูกต้อง:",
    "code": "type Logger struct{}\ntype App struct{ l *Logger }\n\nfunc NewLogger() *Logger     { return &Logger{} }\nfunc NewLoggerV2() *Logger   { return &Logger{} }\nfunc NewApp(l *Logger) *App  { return &App{l: l} }\n\nfunc Init() *App {\n    wire.Build(NewLogger, NewLoggerV2, NewApp)\n    return nil\n}",
    "options": [
      "Wire จะเลือก NewLoggerV2 เพราะเขียนทีหลังใน wire.Build",
      "Wire จะ error เพราะ NewLogger และ NewLoggerV2 ทั้งคู่ return *Logger ซึ่งเป็น duplicate provider",
      "Wire จะสร้าง *Logger สองตัวและส่งให้ NewApp ตัวที่เหมาะสมกว่า",
      "Wire จะใช้ NewLogger เพราะขึ้นต้นด้วยชื่อสั้นกว่า"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Wire ไม่มีกลไก priority หรือ override สำหรับ provider ที่ return type เดียวกัน ถ้ามี providers สองตัว return <code>*Logger</code> Wire จะ error ทันที: <code>*Logger is provided twice (by NewLogger and NewLoggerV2)</code> ต้องเลือกใช้ตัวใดตัวหนึ่งเท่านั้น"
  },
  {
    "id": "wire-ch03-q16",
    "difficulty": "hard",
    "bloomLevel": "apply",
    "question": "injector นี้ถูกต้องสำหรับ Wire หรือไม่?",
    "code": "//go:build wireinject\n\npackage main\n\nimport \"github.com/google/wire\"\n\nfunc InitApp(cfg Config) (*App, error) {\n    wire.Build(NewDB, NewRepo, NewApp)\n    return nil, nil\n}",
    "options": [
      "ไม่ถูกต้อง — injector ที่รับ parameter ไม่รองรับใน Wire",
      "ไม่ถูกต้อง — ต้องมี provider สำหรับ Config ใน wire.Build ด้วย",
      "ถูกต้อง — injector parameter Config ถือว่า caller จัดหาให้แล้ว Wire ไม่ต้องหา provider สำหรับ Config",
      "ถูกต้อง แต่ต้องเพิ่ม wire.Value(cfg) ใน wire.Build เพื่อบอก Wire ว่า Config มาจากไหน"
    ],
    "correctAnswerIndex": 2,
    "explanation": "Injector parameter เป็น feature ที่รองรับ Wire จะถือว่า <code>cfg Config</code> ถูก provide โดย caller แล้ว และจะใช้ค่านั้น inject ลงไปยัง providers ที่ต้องการ <code>Config</code> ต่อไปใน graph โดยไม่ต้องมี provider สำหรับ Config ใน wire.Build"
  },
  {
    "id": "wire-ch03-q17",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "นักพัฒนาตั้งชื่อ parameter ว่า database แต่ Wire ยังคง error ว่าหา provider สำหรับ *sql.DB ไม่เจอ ข้อใดอธิบายได้ถูกต้อง?",
    "code": "func NewRepo(database *sql.DB) *Repo {\n    return &Repo{db: database}\n}\n\nfunc InitRepo() *Repo {\n    wire.Build(NewRepo)  // ลืมใส่ NewDB\n    return nil\n}",
    "options": [
      "เพราะ parameter ต้องชื่อ db ไม่ใช่ database — Wire ใช้ชื่อในการจับคู่",
      "เพราะ *sql.DB เป็น type จาก standard library ซึ่ง Wire ไม่รองรับ",
      "เพราะ NewRepo ต้องการ export เป็น NewRepository ก่อน Wire จึงจะรู้จัก",
      "เพราะ Wire จับคู่ด้วย type (*sql.DB) ไม่ใช่ชื่อ parameter — ขาด provider ที่ return *sql.DB ใน wire.Build"
    ],
    "correctAnswerIndex": 3,
    "explanation": "ชื่อ parameter (<code>database</code> หรือ <code>db</code>) ไม่มีผลต่อ Wire เลย Wire สนใจแค่ <b>type ของ parameter</b> ซึ่งก็คือ <code>*sql.DB</code> เมื่อไม่มี provider ที่ return <code>*sql.DB</code> ใน wire.Build Wire จะ error โดยไม่คำนึงถึงชื่อ parameter"
  },
  {
    "id": "wire-ch03-q18",
    "difficulty": "hard",
    "bloomLevel": "apply",
    "question": "wire_gen.go ที่ถูกสร้างจาก providers เหล่านี้จะมีลักษณะอย่างไร?",
    "code": "func NewDB() (*sql.DB, error)\nfunc NewRepo(db *sql.DB) *Repo\nfunc NewApp(repo *Repo) *App\n\n// Injector:\nfunc InitApp() (*App, error) {\n    wire.Build(NewDB, NewRepo, NewApp)\n    return nil, nil\n}",
    "options": [
      "เรียก constructors ทั้งหมดพร้อมกันด้วย goroutine แล้วรอผลด้วย sync.WaitGroup",
      "เรียก NewApp ก่อน แล้วค่อย resolve dependencies ย้อนหลัง (lazy)",
      "สร้าง dependencies ทั้งหมดพร้อมกัน (parallel) แล้ว combine ผลลัพธ์",
      "เรียก NewDB ก่อน ตรวจ error จากนั้นเรียก NewRepo และ NewApp ตามลำดับ propagate error ขึ้นมา"
    ],
    "correctAnswerIndex": 3,
    "explanation": "Wire สร้าง Go code ธรรมดาที่เรียก constructors ตามลำดับ topological sort: NewDB ก่อน (leaf), จากนั้น NewRepo, สุดท้าย NewApp ถ้า NewDB return error Wire จะ propagate ขึ้นทันที ไม่มี goroutine, ไม่มี lazy init ใน generated code"
  },
  {
    "id": "wire-ch03-q19",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "เพราะอะไร wire_gen.go จึงมี build tag //go:build !wireinject ที่ด้านบน?",
    "options": [
      "เพื่อให้ compiler ใช้ไฟล์นี้ตอน build จริง และ exclude stub file ที่มี wireinject tag ออก ทำให้ไม่มีฟังก์ชัน duplicate",
      "เพื่อให้ไฟล์นี้ถูก exclude เวลารัน wire tool เท่านั้น",
      "เพื่อบอก Go test runner ว่าไม่ต้อง run ไฟล์นี้ในการทดสอบ",
      "เพื่อกันไม่ให้ linter ตรวจสอบโค้ดที่ Wire สร้างขึ้น"
    ],
    "correctAnswerIndex": 0,
    "explanation": "Stub file (<code>wire.go</code>) มี <code>//go:build wireinject</code> ทำให้ compiler <em>ข้าม</em> ไฟล์นั้นตอน build จริง ส่วน <code>wire_gen.go</code> มี <code>//go:build !wireinject</code> ทำให้ compiler <em>ใช้</em> ไฟล์นี้แทน ผลคือ injector function มีนิยามครั้งเดียวเสมอ ไม่เกิด duplicate declaration"
  },
  {
    "id": "wire-ch03-q20",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "ทีมพบว่า wire_gen.go มีโค้ดเก่าที่ไม่ตรงกับ provider signatures ปัจจุบัน สาเหตุที่เป็นไปได้มากที่สุดคืออะไร?",
    "options": [
      "ทั้งการลืมรัน wire หลังเปลี่ยน provider และการแก้ wire_gen.go ด้วยมือเป็นสาเหตุที่เป็นไปได้",
      "ลืมรัน wire (หรือ go generate) หลังจากเปลี่ยน provider signatures เท่านั้น",
      "wire_gen.go ถูกแก้ด้วยมือโดยสมาชิกในทีมเท่านั้น",
      "Wire version ใหม่ไม่ compatible กับ wire_gen.go ที่สร้างจาก version เก่า"
    ],
    "correctAnswerIndex": 0,
    "explanation": "สาเหตุที่พบบ่อยที่สุดคือ (1) <b>ลืมรัน wire</b> หลังเปลี่ยน provider — wire_gen.go จะล้าสมัยทันที และ (2) <b>แก้ wire_gen.go ด้วยมือ</b> ซึ่งจะถูก overwrite ครั้งถัดไปที่รัน wire แนวทางป้องกัน: เพิ่ม <code>go generate ./...</code> ใน CI pipeline และห้ามแก้ wire_gen.go"
  },
  {
    "id": "wire-ch03-q21",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "ข้อใดคือ injector stub ที่ถูกต้องสมบูรณ์สำหรับ Wire?",
    "options": [
      "func InitApp() *App { return NewApp(NewDB()) }",
      "func InitApp() *App { wire.Build(NewDB, NewApp) }",
      "//go:build wireinject\n\nfunc InitApp() *App { wire.Build(NewDB, NewApp); return nil }",
      "//go:build wireinject\n\nfunc InitApp() *App { return wire.Build(NewDB, NewApp) }"
    ],
    "correctAnswerIndex": 2,
    "explanation": "Injector stub ที่ถูกต้องต้องมี: (1) <code>//go:build wireinject</code> ที่ด้านบน (2) เรียก <code>wire.Build(...)</code> (3) มี placeholder return statement ที่ type ตรงกัน ตัวเลือก A คือ manual wiring ไม่ใช่ stub, ตัวเลือก B ขาด build tag และ return statement, ตัวเลือก D ผิดเพราะ <code>wire.Build</code> return <code>string</code> ไม่ใช่ <code>*App</code> จึง type mismatch และ compile ไม่ผ่าน"
  },
  {
    "id": "wire-ch03-q22",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "ไฟล์ wire_gen.go ที่ Wire สร้างขึ้นมาควรทำอย่างไร?",
    "options": [
      "commit เข้า version control และอย่าแก้ด้วยมือ เพราะจะถูก overwrite ทุกครั้งที่รัน wire",
      "ลบทิ้งหลังจาก build เสร็จ เพราะเป็นไฟล์ชั่วคราว",
      "แก้ไขด้วยมือทุกครั้งที่ต้องการ optimize การ wire",
      "เก็บไว้ใน .gitignore เพราะ generate ใหม่ได้เสมอ"
    ],
    "correctAnswerIndex": 0,
    "explanation": "<code>wire_gen.go</code> ควร commit เข้า VCS เพราะ (1) ทำให้ build ง่ายโดยไม่ต้องมี wire CLI ทุกเครื่อง (2) reviewer เห็น generated code ได้ใน PR แต่<strong>อย่าแก้ด้วยมือ</strong>เพราะจะถูก overwrite ทุกครั้งที่รัน wire ให้แก้ที่ provider หรือ stub แทน"
  }
];
