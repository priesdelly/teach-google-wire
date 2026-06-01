/* questions ch04 (TH) */
(window.QUESTIONS_TH = window.QUESTIONS_TH || {}).ch04 = [
  {
    "id": "wire-ch04-q01",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "wire.NewSet(...) ใน Google Wire ใช้ทำอะไร?",
    "options": [
      "สร้าง runtime container สำหรับเก็บ dependency ที่สร้างแล้ว",
      "เรียกใช้ provider functions ทุกตัวพร้อมกันแบบ parallel",
      "จัดกลุ่ม providers ที่เกี่ยวข้องกันให้เป็น ProviderSet เพื่อใช้ซ้ำได้",
      "สร้าง interface binding ระหว่าง concrete type กับ interface"
    ],
    "correctAnswerIndex": 2,
    "explanation": "<b>wire.NewSet(...)</b> ใช้จัดกลุ่ม providers ที่เกี่ยวข้องกันไว้ด้วยกัน เพื่อให้ reuse ข้าม injector ได้และลด noise ใน <code>wire.Build</code> มันไม่ได้สร้าง runtime object หรือเรียก provider functions ใด ๆ — ทำงานเฉพาะตอน codegen เท่านั้น"
  },
  {
    "id": "wire-ch04-q02",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "ProviderSet ที่สร้างด้วย wire.NewSet ควรประกาศเป็นอะไร?",
    "options": [
      "package-level var ที่ exported",
      "ฟังก์ชันที่ return wire.ProviderSet",
      "const ภายใน init() function",
      "type alias ของ []wire.Provider"
    ],
    "correctAnswerIndex": 0,
    "explanation": "แนวปฏิบัติที่ถูกต้องคือประกาศเป็น <b>package-level exported var</b> เช่น <code>var RepositorySet = wire.NewSet(...)</code> เพื่อให้ package อื่นสามารถ import มาใส่ใน <code>wire.Build</code> หรือ <code>wire.NewSet</code> อื่นได้"
  },
  {
    "id": "wire-ch04-q03",
    "difficulty": "easy",
    "bloomLevel": "understand",
    "question": "เมื่อ Wire ประมวลผล set ที่ซ้อนกัน เช่น wire.NewSet(SetA, SetB) สิ่งที่เกิดขึ้นใน wire_gen.go คืออะไร?",
    "options": [
      "wire_gen.go จะมีโครงสร้าง nested ของ set เหมือนที่ประกาศไว้",
      "Wire สร้าง struct พิเศษสำหรับแต่ละ set เพื่อ encapsulate providers",
      "Wire ใช้ reflection เพื่อ resolve set ตอน runtime",
      "Wire unfold ทุก set เป็น flat list ของ providers ไม่มี set ปรากฏใน wire_gen.go"
    ],
    "correctAnswerIndex": 3,
    "explanation": "Wire <b>unfold</b> (คลาย) ทุก set ออกเป็น flat list ของ providers ตอน codegen ดังนั้นใน <code>wire_gen.go</code> จะมีแค่ Go code ธรรมดาที่เรียก constructors ตามลำดับที่ถูกต้อง ไม่มี set, ไม่มี nesting, ไม่มี runtime structure ใด ๆ ทั้งสิ้น"
  },
  {
    "id": "wire-ch04-q04",
    "difficulty": "easy",
    "bloomLevel": "understand",
    "question": "ข้อใดกล่าวถูกต้องเกี่ยวกับ wire.NewSet?",
    "options": [
      "การเรียก wire.NewSet จะ instantiate (สร้าง object) ของทุก provider ที่อยู่ใน set ทันที",
      "wire.NewSet บังคับให้ providers ทุกตัวใน set ถูกเรียกแบบ lazy เมื่อถูกขอใช้ครั้งแรก",
      "wire.NewSet เป็นการจัดกลุ่ม static ที่ Wire ใช้ตอน codegen เท่านั้น ไม่มีผลใด ๆ ตอน runtime",
      "wire.NewSet สร้าง singleton ที่ cache ผลลัพธ์ของ providers ให้อัตโนมัติ"
    ],
    "correctAnswerIndex": 2,
    "explanation": "<code>wire.NewSet</code> เป็น <b>static grouping</b> — ใช้เพื่อบอก Wire tool ตอน <code>go generate</code> ว่า providers กลุ่มนี้อยู่ด้วยกัน ไม่มีผลใด ๆ ต่อ runtime behavior ไม่มี instantiation, ไม่มี lazy loading, ไม่มี caching"
  },
  {
    "id": "wire-ch04-q05",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "ต้องการสร้าง RepositorySet ที่รวม NewPostgresDB และ NewUserRepository เข้าด้วยกัน โค้ดใดถูกต้อง?",
    "options": [
      "var RepositorySet = wire.NewSet(NewPostgresDB, NewUserRepository)",
      "var RepositorySet = wire.Build(NewPostgresDB, NewUserRepository)",
      "func RepositorySet() wire.ProviderSet { return wire.NewSet(NewPostgresDB, NewUserRepository) }",
      "const RepositorySet = wire.NewSet(NewPostgresDB, NewUserRepository)"
    ],
    "correctAnswerIndex": 0,
    "explanation": "โค้ดที่ถูกต้องคือ <code>var RepositorySet = wire.NewSet(NewPostgresDB, NewUserRepository)</code> ใช้ <b>var</b> (ไม่ใช่ const หรือ func) และใช้ <b>wire.NewSet</b> (ไม่ใช่ wire.Build ซึ่งใช้ได้เฉพาะภายใน injector stub เท่านั้น)"
  },
  {
    "id": "wire-ch04-q06",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "จะส่ง RepositorySet เข้า injector stub ได้อย่างไร?",
    "code": "var RepositorySet = wire.NewSet(NewPostgresDB, NewUserRepository)\n\n// injector stub\n//go:build wireinject\n\nfunc InitApp(cfg Config) (*App, error) {\n\t// ??? ใส่อะไรตรงนี้\n\treturn nil, nil\n}",
    "options": [
      "wire.Inject(RepositorySet)",
      "wire.Use(RepositorySet)",
      "wire.Build(RepositorySet.Providers()...)",
      "wire.Build(RepositorySet)"
    ],
    "correctAnswerIndex": 3,
    "explanation": "ใช้ <code>wire.Build(RepositorySet)</code> โดยส่ง set เข้าไปโดยตรง Wire รู้จักทั้ง provider functions และ provider sets ที่ส่งเข้า <code>wire.Build</code> โดยไม่ต้องขยาย หรือเรียก method ใด ๆ บน set"
  },
  {
    "id": "wire-ch04-q07",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "ต้องการ compose ApplicationSet จาก RepositorySet, ServiceSet และ HandlerSet โค้ดใดถูกต้อง?",
    "options": [
      "var ApplicationSet = wire.Compose(RepositorySet, ServiceSet, HandlerSet)",
      "var ApplicationSet = wire.Build(RepositorySet, ServiceSet, HandlerSet)",
      "var ApplicationSet = wire.NewSet(RepositorySet, ServiceSet, HandlerSet)",
      "var ApplicationSet = wire.Merge(RepositorySet, ServiceSet, HandlerSet)"
    ],
    "correctAnswerIndex": 2,
    "explanation": "<code>wire.NewSet</code> รับทั้ง provider functions และ provider sets อื่นเป็น argument ได้ การเขียน <code>var ApplicationSet = wire.NewSet(RepositorySet, ServiceSet, HandlerSet)</code> คือการ compose sets เข้าด้วยกัน ไม่มี <code>wire.Compose</code> หรือ <code>wire.Merge</code> ใน Wire API"
  },
  {
    "id": "wire-ch04-q08",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "ทำไมจึงควรประกาศ ProviderSet ไว้ใน package เดียวกับ providers แทนที่จะรวมไว้ที่ injector?",
    "options": [
      "เพราะ Wire บังคับให้ set และ providers อยู่ใน package เดียวกัน ไม่เช่นนั้น Wire จะ error",
      "เพราะเมื่อ providers เปลี่ยน (เพิ่ม/ลด) ผู้แก้ไขจะแก้ set ที่อยู่ใกล้ providers ได้ทันที โดยไม่ต้องแตะ injector",
      "เพราะ Go compiler ไม่อนุญาตให้ import package ที่มี wire.NewSet จากต่าง package",
      "เพราะ wire.NewSet ใช้ reflection ที่ทำงานได้เฉพาะใน package ที่ประกาศ providers"
    ],
    "correctAnswerIndex": 1,
    "explanation": "นี่เป็นเรื่องของ <b>maintainability</b> — ถ้า set อยู่ใกล้ providers เมื่อเพิ่ม provider ใหม่ใน package ก็แก้ set ในไฟล์ใกล้เคียงได้เลย Wire ไม่บังคับเรื่อง location ของ set แต่ convention ที่ดีช่วยลดโอกาสลืมอัปเดต"
  },
  {
    "id": "wire-ch04-q09",
    "difficulty": "medium",
    "bloomLevel": "analyze",
    "question": "พิจารณาโค้ดนี้ มีปัญหาอะไร?",
    "code": "var SetA = wire.NewSet(NewPostgresDB, NewUserRepo)\nvar SetB = wire.NewSet(NewPostgresDB, NewOrderRepo)\n\nvar AppSet = wire.NewSet(SetA, SetB)",
    "options": [
      "Wire จะฟ้อง duplicate provider error เพราะ NewPostgresDB ปรากฏสองครั้งใน AppSet (ผ่าน SetA และ SetB)",
      "ไม่มีปัญหา Wire จะใช้ NewPostgresDB ที่อยู่ใน SetA และเพิกเฉย NewPostgresDB ใน SetB",
      "ปัญหาคือ SetA และ SetB ไม่ได้ export ดังนั้น AppSet ไม่สามารถ reference ได้",
      "ปัญหาคือ wire.NewSet ไม่รองรับการ nest set เกิน 2 ระดับ"
    ],
    "correctAnswerIndex": 0,
    "explanation": "เมื่อ Wire unfold <code>AppSet</code> จะเห็น <code>NewPostgresDB</code> สองครั้ง (จาก SetA และ SetB) Wire ใช้ <b>return type เป็น key</b> — <code>NewPostgresDB</code> สองตัว return <code>*sql.DB</code> เหมือนกัน จึงฟ้อง <b>duplicate provider error</b> แก้ไขโดยย้าย <code>NewPostgresDB</code> ออกมาเป็น set แยก หรือใส่ใน AppSet โดยตรงครั้งเดียว"
  },
  {
    "id": "wire-ch04-q10",
    "difficulty": "medium",
    "bloomLevel": "analyze",
    "question": "พิจารณา injector นี้ มีปัญหาอะไร?",
    "code": "var RepoSet = wire.NewSet(NewPostgresDB, NewUserRepo)\n\n//go:build wireinject\n\nfunc InitApp(cfg Config) (*App, error) {\n\twire.Build(RepoSet, NewPostgresDB, NewAppService, NewApp)\n\treturn nil, nil\n}",
    "options": [
      "ปัญหาคือ RepoSet ต้องถูก unwrap ก่อนด้วย RepoSet.Providers() ก่อนส่งเข้า wire.Build",
      "ไม่มีปัญหา wire.Build สามารถรับทั้ง set และ individual provider ได้พร้อมกัน",
      "ปัญหาคือ wire.Build ไม่รองรับการผสม set กับ provider function",
      "Wire จะฟ้อง duplicate provider เพราะ NewPostgresDB อยู่ทั้งใน RepoSet และถูกส่งเข้า wire.Build โดยตรง"
    ],
    "correctAnswerIndex": 3,
    "explanation": "<code>NewPostgresDB</code> อยู่ใน <code>RepoSet</code> แล้ว การส่ง <code>NewPostgresDB</code> เข้า <code>wire.Build</code> โดยตรงอีกครั้งทำให้เกิด <b>duplicate provider</b> Wire นับจาก flat list ทั้งหมด — ไม่ว่า provider จะมาจาก set หรือ inline ก็ตาม ต้องลบ <code>NewPostgresDB</code> ออกจาก <code>wire.Build</code>"
  },
  {
    "id": "wire-ch04-q11",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "ต้องการใส่ wire.Bind ลงใน RepositorySet เพื่อผูก UserRepository interface กับ *postgresUserRepo โค้ดใดถูกต้อง?",
    "options": [
      "var RepositorySet = wire.NewSet(NewPostgresDB, NewPostgresUserRepo, wire.Bind(UserRepository{}, postgresUserRepo{}))",
      "var RepositorySet = wire.NewSet(NewPostgresDB, NewPostgresUserRepo).Bind(UserRepository, postgresUserRepo)",
      "var RepositorySet = wire.NewSet(NewPostgresDB, NewPostgresUserRepo, wire.Interface(UserRepository, postgresUserRepo))",
      "var RepositorySet = wire.NewSet(NewPostgresDB, NewPostgresUserRepo, wire.Bind(new(UserRepository), new(*postgresUserRepo)))"
    ],
    "correctAnswerIndex": 3,
    "explanation": "<code>wire.Bind</code> ต้องรับ argument เป็น <code>new(Type)</code> เสมอ: argument แรกคือ interface, argument ที่สองคือ concrete type เขียนเป็น <code>wire.Bind(new(UserRepository), new(*postgresUserRepo))</code> และสามารถใส่ใน <code>wire.NewSet</code> ได้โดยตรงร่วมกับ provider functions"
  },
  {
    "id": "wire-ch04-q12",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "ทีมออกแบบ provider sets ดังนี้ มีปัญหาเรื่อง reusability อะไร?",
    "code": "// มี set เดียวขนาดใหญ่\nvar EverythingSet = wire.NewSet(\n\tNewPostgresDB,\n\tNewRedisCache,\n\tNewUserRepo,\n\tNewOrderRepo,\n\tNewUserService,\n\tNewOrderService,\n\tNewUserHandler,\n\tNewOrderHandler,\n\tNewHTTPServer,\n)",
    "options": [
      "ไม่มีปัญหา Wire รองรับ set ขนาดใหญ่ได้ไม่จำกัดและ skip providers ที่ไม่ใช้อัตโนมัติ",
      "เมื่อต้องการ injector หลายตัวที่ต้องการ subset ต่างกัน (เช่น prod ต้องการทั้งหมด แต่ test ต้องการ mock DB แทน real DB) ก็ไม่สามารถ swap provider ใน EverythingSet ได้โดยไม่ conflict เพราะต้องนำ set ทั้งก้อนมาพร้อมกับ real DB provider",
      "Wire จะสร้าง provider ทุกตัวใน set โดยไม่สนใจว่า injector ต้องการหรือเปล่า ทำให้ slow",
      "wire.NewSet ไม่รองรับมากกว่า 5 providers ใน set เดียว"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Wire ทำ tree-shaking และ skip providers ที่ไม่ถูกใช้โดย injector ดังนั้น EverythingSet ยังทำงานได้ในแง่ technical แต่ปัญหา <b>reusability</b> คือ: เมื่อ injector หลายตัวต้องการ provider ต่างกัน เช่น prod ใช้ real DB แต่ test ต้องการ mock DB หาก EverythingSet รวม NewRealDB ไว้แล้ว ก็ไม่สามารถ compose EverythingSet กับ NewMockDB ได้เพราะจะ error duplicate provider ต้องแยกเป็น RepositorySet, ServiceSet, HandlerSet เพื่อ compose เฉพาะที่ต้องการในแต่ละ injector"
  },
  {
    "id": "wire-ch04-q13",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "มี provider สองตัวที่ return type ต่างกันแต่มี dependency ร่วมกัน และอยู่ใน sets ต่างกัน Wire จะทำงานอย่างไร?",
    "code": "// SetA มี:\n// NewPostgresDB() *sql.DB\n// NewUserRepo(db *sql.DB) *UserRepo\n\n// SetB มี:\n// NewOrderRepo(db *sql.DB) *OrderRepo\n\nvar AppSet = wire.NewSet(SetA, SetB)\n\n// injector:\n// func Init(cfg Config) (*Service, error) { wire.Build(AppSet, NewService); ... }",
    "options": [
      "Wire จะ error เพราะ *sql.DB ถูกใช้จากสอง sets ทำให้เกิด conflict",
      "Wire จะ create *sql.DB สองครั้ง หนึ่งครั้งสำหรับแต่ละ set",
      "Wire จะสุ่มเลือกว่า NewUserRepo หรือ NewOrderRepo จะได้รับ *sql.DB",
      "Wire จะ resolve *sql.DB จาก NewPostgresDB (ใน SetA) เพียงครั้งเดียว และแชร์ให้ทั้ง NewUserRepo และ NewOrderRepo"
    ],
    "correctAnswerIndex": 3,
    "explanation": "Wire สร้าง dependency graph โดยใช้ return type เป็น key — <code>*sql.DB</code> มี provider เดียวคือ <code>NewPostgresDB</code> Wire จะเรียก <code>NewPostgresDB</code> <b>เพียงครั้งเดียว</b> และส่ง <code>*sql.DB</code> ที่ได้ไปให้ทั้ง <code>NewUserRepo</code> และ <code>NewOrderRepo</code> ไม่มี duplication ไม่มี conflict — เพราะมี provider เดียวสำหรับ type นั้น"
  },
  {
    "id": "wire-ch04-q14",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "นักพัฒนากล่าวว่า \"ถ้าใส่ provider ที่ไม่จำเป็นใน set Wire จะ error เพราะไม่สามารถ resolve dependency ของมันได้\" ข้อนี้ถูกหรือผิด?",
    "options": [
      "ถูก — Wire บังคับให้ทุก provider ใน set ต้องมีทุก dependency ครบ ไม่เช่นนั้นจะ error",
      "ผิด — Wire ใช้เฉพาะ providers ที่จำเป็นสำหรับ return type ของ injector providers ที่ไม่มี consumer จะถูกละเว้น",
      "ถูกบางส่วน — Wire จะ warn แต่ไม่ error หากมี provider ที่ไม่ถูกใช้",
      "ผิด — Wire เรียกทุก provider ใน set โดยอัตโนมัติโดยไม่สนใจว่าจำเป็นหรือเปล่า"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Wire ทำ <b>tree shaking</b> ของ dependency graph — เริ่มจาก return type ของ injector แล้ว trace ย้อนกลับไปหา providers ที่จำเป็น provider ที่ไม่มี consumer จะ<b>ถูกละเว้น</b>โดยไม่ error อย่างไรก็ตาม ถ้า provider ที่ถูกใช้มี dependency ที่ไม่มี provider ให้ Wire จะ error"
  },
  {
    "id": "wire-ch04-q15",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "มี injector สองตัว: InitProd ใช้ ApplicationSet ที่มี NewRealDB และ InitTest ต้องการ NewMockDB แทน จะออกแบบ sets อย่างไรจึงถูกต้อง?",
    "options": [
      "สร้าง ApplicationSet เดียว แล้วใช้ build tag เพื่อสลับ implementation ใน NewRealDB",
      "สร้าง ApplicationSet เดียวที่มีทั้ง NewRealDB และ NewMockDB แล้วให้ Wire เลือกให้อัตโนมัติ",
      "สร้าง ProdSet = wire.NewSet(ApplicationSet, NewRealDB) และ TestSet = wire.NewSet(ApplicationSet, NewMockDB) โดย ApplicationSet ไม่รวม DB provider",
      "Wire ไม่รองรับ injectors หลายตัวที่ใช้ sets ต่างกัน ต้องใช้ provider functions โดยตรงเสมอ"
    ],
    "correctAnswerIndex": 2,
    "explanation": "วิธีที่ถูกต้องคือแยก DB provider ออกจาก ApplicationSet แล้วสร้าง <b>ProdSet</b> และ <b>TestSet</b> แยกกัน โดยแต่ละตัว compose ApplicationSet เข้ากับ DB provider ของตัวเอง: <code>var ProdSet = wire.NewSet(ApplicationSet, NewRealDB)</code> Wire ไม่มีกลไก auto-select และไม่สามารถมี provider สองตัวที่ return type เดียวกันใน set เดียว"
  },
  {
    "id": "wire-ch04-q16",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "ข้อใดคือแนวทาง (convention) ที่ถูกต้องสำหรับการตั้งชื่อและ location ของ ProviderSet?",
    "options": [
      "ตั้งชื่อขึ้นต้นด้วย set เช่น setRepository และเก็บไว้ใน cmd/wire.go",
      "ตั้งชื่อ exported เช่น RepositorySet เก็บไว้ใน package เดียวกับ providers เช่น internal/repository/wire.go",
      "ตั้งชื่อขึ้นต้นด้วย _ เช่น _RepositorySet เพื่อบอกว่าเป็น internal",
      "เก็บทุก set รวมกันใน main.go เพื่อให้ injector เข้าถึงง่าย"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Convention ที่ดีคือตั้งชื่อ <b>exported</b> (ตัวใหญ่) เช่น <code>RepositorySet</code>, <code>ServiceSet</code> และวางไว้ใน <b>package ของ providers</b> เช่น <code>internal/repository/wire.go</code> เพื่อให้ set อยู่ใกล้กับ providers ที่มันจัดกลุ่ม ง่ายต่อการ maintain"
  },
  {
    "id": "wire-ch04-q17",
    "difficulty": "hard",
    "bloomLevel": "apply",
    "question": "ต้องการ refactor จาก wire.Build ที่ list providers ทีละตัว ให้ใช้ sets แบบ layer-based รูปแบบใดดีที่สุด?",
    "code": "// wire.Build แบบเดิม\nwire.Build(\n\tNewPostgresDB,\n\tNewUserRepo,\n\tNewUserService,\n\twire.Bind(new(UserRepository), new(*UserRepo)),\n\tNewUserHandler,\n)",
    "options": [
      "สร้าง InfraSet = wire.NewSet(NewPostgresDB, NewUserRepo, wire.Bind(new(UserRepository), new(*UserRepo))) และ AppSet = wire.NewSet(NewUserService, NewUserHandler) แล้วใช้ wire.Build(InfraSet, AppSet)",
      "สร้าง set เดียว: var AllSet = wire.NewSet(NewPostgresDB, NewUserRepo, NewUserService, wire.Bind(new(UserRepository), new(*UserRepo)), NewUserHandler)",
      "ไม่ต้อง refactor เพราะ wire.Build แบบ list ยาวดีอยู่แล้วและอ่านได้ชัดกว่า",
      "สร้าง set แยกสำหรับทุก provider เช่น DBSet, UserRepoSet, UserServiceSet, UserHandlerSet"
    ],
    "correctAnswerIndex": 0,
    "explanation": "การแบ่งตาม layer เป็นแนวทางที่ดีที่สุด: <b>InfraSet</b> รวม DB, repo และ binding interface; <b>AppSet</b> รวม service และ handler จากนั้น <code>wire.Build(InfraSet, AppSet)</code> อ่านชัดเจน เพิ่ม repo ใหม่แก้แค่ InfraSet การสร้าง set สำหรับทุก provider เดี่ยวนั้น over-engineer เกินไป"
  },
  {
    "id": "wire-ch04-q18",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "ถ้า SetA มี provider NewCache ที่ต้องการ *redis.Client แต่ injector ไม่มี provider สำหรับ *redis.Client และ injector ก็ไม่ได้ใช้ *Cache ใน return type เลย Wire จะทำอย่างไร?",
    "options": [
      "Wire จะ error เพราะ NewCache มี dependency ที่ขาดหายไป",
      "Wire จะ inject nil ให้ *redis.Client อัตโนมัติ",
      "Wire จะ skip NewCache เพราะไม่มี consumer ของ *Cache ใน dependency graph",
      "Wire จะ warn แต่ยัง generate wire_gen.go ออกมา"
    ],
    "correctAnswerIndex": 2,
    "explanation": "Wire ทำ <b>reachability analysis</b> จาก return type ของ injector ถ้า <code>*Cache</code> ไม่มี consumer ใน graph Wire จะ<b>ไม่รวม NewCache</b> เข้าไปใน wire_gen.go เลย dependency ที่ขาดของ NewCache (คือ *redis.Client) ก็ไม่เกิดปัญหา เพราะ Wire ไม่เคยพยายาม resolve มัน"
  },
  {
    "id": "wire-ch04-q19",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "wire.NewSet รับ argument ประเภทใดได้บ้าง? (เลือกข้อที่ครบที่สุด)",
    "options": [
      "รับได้เฉพาะ provider functions เท่านั้น",
      "รับได้เฉพาะ provider functions และ wire.ProviderSet อื่นเท่านั้น",
      "รับ provider functions, wire.ProviderSet อื่น, wire.Bind, wire.Value และ struct literals ได้",
      "รับ provider functions, wire.ProviderSet อื่น, wire.Bind และ wire.Value ได้"
    ],
    "correctAnswerIndex": 2,
    "explanation": "<code>wire.NewSet</code> รับได้หลายประเภท: <b>provider functions</b> (constructor functions), <b>wire.ProviderSet</b> อื่น (composition), <b>wire.Bind</b> (interface binding), <b>wire.Value</b> (ค่าคงที่) และ <b>struct literals</b> (รูปแบบเดิมที่ deprecated แล้ว เช่น <code>wire.NewSet(MyStruct{})</code>) Wire ยังรับ wire.Struct, wire.InterfaceValue และ wire.FieldsOf ด้วยแต่ไม่ได้กล่าวถึงในตัวเลือกนี้ ในบรรดาตัวเลือกที่ให้มา ข้อนี้ครบที่สุด"
  },
  {
    "id": "wire-ch04-q20",
    "difficulty": "hard",
    "bloomLevel": "apply",
    "question": "ทีมมี service สองตัวที่ต้องการ *sql.DB เหมือนกัน แต่อยู่คนละ set การออกแบบใดถูกต้อง?",
    "code": "// UserService ต้องการ *sql.DB\n// OrderService ต้องการ *sql.DB\n// มี NewPostgresDB() *sql.DB เพียงตัวเดียว",
    "options": [
      "ใส่ NewPostgresDB ใน UserSet และ OrderSet ทั้งสองชุด แล้ว Wire จะ deduplicate ให้",
      "ใส่ NewPostgresDB ใน set แยกต่างหาก (เช่น InfraSet) แล้ว compose ทั้ง UserSet และ OrderSet เข้ากับ InfraSet",
      "สร้าง NewPostgresDB สองฟังก์ชัน NewPostgresDBForUser และ NewPostgresDBForOrder แยกกัน",
      "ใช้ wire.Value(*sql.DB) แทน provider function เพื่อให้ทั้งสอง set ใช้ร่วมกันได้"
    ],
    "correctAnswerIndex": 1,
    "explanation": "วิธีที่ถูกต้องคือวาง <code>NewPostgresDB</code> ไว้ใน <b>InfraSet</b> (หรือ DBSet) แยกต่างหาก แล้วทั้ง UserSet และ OrderSet ไม่รวม DB provider ไว้ ให้ AppSet compose InfraSet + UserSet + OrderSet เข้าด้วยกัน Wire จะเห็น NewPostgresDB เพียงครั้งเดียวและแชร์ *sql.DB ให้ทั้งสองบริการโดยอัตโนมัติ การใส่ NewPostgresDB ซ้ำสองชุดจะ error"
  }
];
