/* questions ch01 (TH) */
(window.QUESTIONS_TH = window.QUESTIONS_TH || {}).ch01 = [
  {
    "id": "wire-ch01-q01",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "Dependency Injection (DI) คืออะไร?",
    "options": [
      "เทคนิคที่ให้ object สร้าง dependency ของตัวเองภายใน constructor",
      "เทคนิคที่ส่ง dependency เข้ามาจากภายนอก แทนที่จะให้ object สร้างเอง",
      "ไลบรารีสำหรับจัดการ configuration ของ Go application",
      "วิธีการฝัง struct เข้าไปใน struct อื่นโดยใช้ Go embedding"
    ],
    "correctAnswerIndex": 1,
    "explanation": "<b>DI</b> คือการส่ง dependency จากภายนอกเข้าไปหา object แทนที่จะให้ object สร้าง dependency ขึ้นมาเอง ทำให้ component แต่ละตัวแยกออกจากกัน (decoupled) และทดสอบได้ง่ายขึ้น ตัวเลือกแรกคือการสร้าง dependency ภายใน constructor ซึ่งตรงข้ามกับ DI และตัวเลือกที่เหลือไม่เกี่ยวกับ DI"
  },
  {
    "id": "wire-ch01-q02",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "Google Wire คืออะไร?",
    "options": [
      "Runtime dependency injection container สำหรับ Go เหมือน Spring Framework",
      "เครื่องมือ code generation สำหรับ compile-time dependency injection ใน Go",
      "ไลบรารี reflection ที่ช่วยให้ Go app สามารถ wire dependency ได้อัตโนมัติตอน runtime",
      "Service locator ที่ใช้ global registry เก็บ dependency ของ Go application"
    ],
    "correctAnswerIndex": 1,
    "explanation": "<b>Google Wire</b> เป็น <b>code generator</b> ที่สร้าง initialization code ตอน compile-time โดยไม่ใช้ reflection ตอน runtime ต่างจาก Spring หรือ service locator ที่ทำงานตอน runtime Wire อ่าน provider functions แล้วสร้างโค้ด Go ธรรมดาออกมา ทำให้ได้ประสิทธิภาพเทียบเท่ากับการ wire ด้วยมือ"
  },
  {
    "id": "wire-ch01-q03",
    "difficulty": "easy",
    "bloomLevel": "understand",
    "question": "ปัญหาหลักของการ wire dependency ด้วยมือใน Go application ขนาดใหญ่คืออะไร?",
    "options": [
      "Go ไม่รองรับ interface จึงต้องใช้ concrete type ทำให้ coupling สูง",
      "การ wire ด้วยมือทำให้ binary มีขนาดใหญ่ขึ้นเนื่องจาก overhead ของ reflection",
      "โค้ดใน main หรือ bootstrap function มีขนาดใหญ่ขึ้นมาก ดูแลรักษายาก และเพิ่ม dependency ใหม่ได้ยาก",
      "Go ไม่มี garbage collector จึงต้องจัดการ memory ของ dependency ด้วยตนเอง"
    ],
    "correctAnswerIndex": 2,
    "explanation": "เมื่อ application มี component หลายสิบหรือหลายร้อยตัว โค้ดที่ wire dependency ด้วยมือ (มักอยู่ใน <code>main.go</code>) จะมีขนาดใหญ่ บอบบาง และแก้ไขยาก การเพิ่ม dependency ตัวเดียวอาจต้องแก้หลายจุด Go รองรับ interface และมี GC อยู่แล้ว ส่วน reflection ไม่เกี่ยวกับการ wire ด้วยมือ"
  },
  {
    "id": "wire-ch01-q04",
    "difficulty": "easy",
    "bloomLevel": "understand",
    "question": "Constructor injection แตกต่างจาก service locator อย่างไร?",
    "options": [
      "Constructor injection เร็วกว่าเพราะใช้ reflection น้อยกว่า service locator",
      "Constructor injection ประกาศ dependency อย่างชัดเจนใน signature ขณะที่ service locator ดึง dependency จาก global registry ภายใน function",
      "Service locator ปลอดภัยกว่าเพราะตรวจสอบ type ได้ตอน compile-time",
      "Constructor injection และ service locator เป็นชื่อต่างกันของเทคนิคเดียวกัน"
    ],
    "correctAnswerIndex": 1,
    "explanation": "<b>Constructor injection</b> ทำให้ dependency มองเห็นได้ชัดเจนใน function signature — caller รู้ว่าต้องส่งอะไรให้ ส่วน <b>service locator</b> ซ่อน dependency ไว้ภายใน โดย component ดึงสิ่งที่ต้องการจาก global registry เอง ทำให้ทดสอบยากและ dependency ไม่ชัดเจน Service locator ไม่ได้ตรวจสอบ type ตอน compile-time ดีกว่า"
  },
  {
    "id": "wire-ch01-q05",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "เหตุใด Wire จึงเลือกใช้ code generation แทน reflection ตอน runtime?",
    "options": [
      "เพราะ Go ไม่มี reflection API จึงบังคับต้องใช้ code generation",
      "เพื่อให้ error ของการ wire ที่ผิดพลาดปรากฏตอน compile-time ไม่ใช่ runtime และไม่มี overhead จาก reflection",
      "เพราะ code generation ทำให้ binary ขนาดเล็กลงเสมอเมื่อเทียบกับ reflection",
      "เพราะ reflection ใน Go ไม่รองรับ struct ที่มีมากกว่า 10 fields"
    ],
    "correctAnswerIndex": 1,
    "explanation": "ข้อดีหลักของ compile-time code generation คือ (1) ข้อผิดพลาดเช่น dependency หายไปหรือ type ไม่ตรงกัน จะถูกพบตอน <code>go generate</code> ก่อน deploy และ (2) โค้ดที่ได้คือ Go ธรรมดาไม่มี reflection overhead ทำให้ startup เร็ว Go มี reflect package อยู่แล้ว ส่วนขนาด binary และข้อจำกัด struct fields ไม่ใช่เหตุผลที่ถูกต้อง"
  },
  {
    "id": "wire-ch01-q06",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "Uber dig และ Uber fx แตกต่างจาก Google Wire อย่างไรในแง่ของ DI approach?",
    "options": [
      "dig/fx ใช้ compile-time code generation เหมือน Wire แต่รองรับ scope มากกว่า",
      "dig/fx เป็น runtime DI container ที่ใช้ reflection ขณะที่ Wire เป็น compile-time code generator",
      "Wire รองรับ circular dependency แต่ dig/fx ไม่รองรับ",
      "dig/fx เขียนด้วย C++ จึงเร็วกว่า Wire ที่เขียนด้วย Go"
    ],
    "correctAnswerIndex": 1,
    "explanation": "<b>dig และ fx</b> ของ Uber เป็น <b>runtime DI container</b> — ใช้ reflect package ของ Go ในการวิเคราะห์ type และ wire dependency ตอนที่ application start ข้อผิดพลาดด้านการ wire จะปรากฏตอน runtime ส่วน <b>Wire</b> สร้างโค้ด Go ธรรมดาตอน compile-time ทำให้ตรวจสอบความถูกต้องได้เร็วกว่าและไม่มี reflection overhead"
  },
  {
    "id": "wire-ch01-q07",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "พิจารณาโค้ดนี้:\n\nfunc NewServer(db *Database, logger *Logger) *Server {\n    return &Server{db: db, logger: logger}\n}\n\nรูปแบบนี้เรียกว่าอะไรและมีข้อดีอะไรบ้าง?",
    "code": "func NewServer(db *Database, logger *Logger) *Server {\n    return &Server{db: db, logger: logger}\n}",
    "options": [
      "Service locator — ทำให้ component สามารถดึง dependency ได้เองตามต้องการ",
      "Constructor injection — dependency ชัดเจน ทดสอบได้ง่าย และ compiler ช่วยตรวจสอบ type",
      "Singleton pattern — ป้องกันการสร้าง Server หลายตัวโดยไม่จำเป็น",
      "Factory method — ซ่อนรายละเอียดการสร้าง object ไว้ภายใน"
    ],
    "correctAnswerIndex": 1,
    "explanation": "ฟังก์ชัน <code>NewServer</code> รับ dependency ผ่าน parameter นี่คือ <b>constructor injection</b> ข้อดีคือ dependency ทั้งหมดประกาศอย่างชัดเจนใน signature, compiler ตรวจ type ให้, และในการเทสสามารถส่ง mock ได้ง่าย Service locator จะดึง dependency จาก registry ภายใน ไม่ใช่รับมาจาก parameter"
  },
  {
    "id": "wire-ch01-q08",
    "difficulty": "medium",
    "bloomLevel": "analyze",
    "question": "แอปพลิเคชัน Go ที่ใช้ Wire จะมี startup time ช้ากว่าแอปที่ wire dependency ด้วยมือหรือไม่? เพราะอะไร?",
    "options": [
      "ช้ากว่า เพราะ Wire ต้องสแกน struct tags ตอนที่ app เริ่มทำงาน",
      "ช้ากว่าเล็กน้อย เพราะ Wire ต้องโหลด dependency graph จากไฟล์ config ตอน startup",
      "ไม่ช้ากว่า เพราะ Wire สร้างโค้ด Go ธรรมดาตอน compile-time ไม่มีการทำงานพิเศษเพิ่มตอน runtime",
      "เร็วกว่า เพราะ Wire ใช้ lazy initialization ที่ built-in อยู่แล้ว"
    ],
    "correctAnswerIndex": 2,
    "explanation": "Wire <b>ไม่มี runtime overhead</b> เพราะ output ของ Wire คือไฟล์ <code>wire_gen.go</code> ที่เป็น Go code ธรรมดา — เหมือนกับที่ developer เขียนด้วยมือทุกประการ ไม่มี reflection, ไม่มีการอ่าน config, ไม่มี struct tag scanning ตอน startup ดังนั้น startup time เทียบเท่ากับการ wire ด้วยมือ"
  },
  {
    "id": "wire-ch01-q09",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "ข้อใดคือข้อเสียสำคัญของการใช้ service locator pattern ในการจัดการ dependency?",
    "options": [
      "Service locator มีประสิทธิภาพต่ำกว่า constructor injection เสมอเนื่องจากต้องทำ heap allocation เพิ่ม",
      "Dependency ที่ซ่อนอยู่ภายใน component ทำให้ทดสอบยาก เพราะต้อง setup global registry ก่อนทุกครั้ง",
      "Go compiler ปฏิเสธ service locator pattern เนื่องจากขัดกับ Go specification",
      "Service locator ไม่รองรับ interface type จึงใช้ได้เฉพาะกับ concrete type"
    ],
    "correctAnswerIndex": 1,
    "explanation": "ปัญหาหลักของ <b>service locator</b> คือ dependency ถูกซ่อนไว้ภายใน — ไม่มีทางรู้จาก signature ว่า component ต้องการอะไร ทำให้การเทสยากมาก (ต้อง setup global registry ก่อนแต่ละ test) และเกิด coupling กับ registry Go compiler ไม่มีกฎห้ามใช้ service locator และ performance ไม่ใช่ปัญหาหลัก"
  },
  {
    "id": "wire-ch01-q10",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "นักพัฒนากล่าวว่า \"Wire ทำให้ binary ขนาดใหญ่ขึ้นเพราะต้องรวม code generator ไว้ใน binary\" ข้อกล่าวอ้างนี้ถูกหรือผิด?",
    "options": [
      "ถูก — Wire tool ถูก link เข้าไปใน binary ทำให้ขนาดใหญ่ขึ้นประมาณ 2-5 MB",
      "ถูกบางส่วน — Wire tool ไม่ถูก link เข้า binary แต่ generated code มีขนาดใหญ่กว่าการ wire ด้วยมือ",
      "ผิด — Wire เป็นเพียง build-time tool ที่รัน <code>go generate</code> เท่านั้น ไม่มีส่วนใดของ Wire อยู่ใน binary",
      "ผิด — Wire ใช้เฉพาะ standard library จึง binary ขนาดเล็กกว่าการ wire ด้วยมือ"
    ],
    "correctAnswerIndex": 2,
    "explanation": "<b>Wire เป็น build-time tool</b> ที่ทำงานตอน <code>go generate</code> และสร้าง <code>wire_gen.go</code> จากนั้น tool ตัวนี้ไม่ได้ถูก include ใน binary เลย สิ่งที่อยู่ใน binary คือเฉพาะโค้ดใน <code>wire_gen.go</code> ซึ่งเป็น Go code ธรรมดาที่มีขนาดเทียบเท่ากับการ wire ด้วยมือ"
  },
  {
    "id": "wire-ch01-q11",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "ข้อใดคือประโยชน์ของ Dependency Injection ที่ถูกต้อง?",
    "options": [
      "ทำให้ application ทำงานเร็วขึ้นเพราะหลีกเลี่ยง garbage collection",
      "ทำให้ component แต่ละตัว loosely coupled และทดสอบได้ง่ายขึ้น",
      "ทำให้ Go application ไม่ต้องใช้ goroutine เพื่อ handle concurrency",
      "ลดจำนวน package import ที่จำเป็นใน Go application"
    ],
    "correctAnswerIndex": 1,
    "explanation": "DI ช่วยให้ component <b>loosely coupled</b> กัน แต่ละตัวทำงานกับ interface แทน concrete type ทำให้แทนที่ด้วย mock ได้ในการเทส และสลับ implementation ได้ง่าย GC, goroutine, และ import count ไม่เกี่ยวกับ DI"
  },
  {
    "id": "wire-ch01-q12",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "เหตุใดการตรวจพบข้อผิดพลาดตอน compile-time จึงดีกว่าตอน runtime ในบริบทของ DI?",
    "options": [
      "เพราะ compile-time error ทำให้โปรแกรมทำงานเร็วขึ้น",
      "เพราะ runtime error ในระบบ production อาจทำให้ service ล่มและส่งผลต่อ user จริง ขณะที่ compile-time error พบได้ก่อน deploy",
      "เพราะ Go compiler สามารถ auto-fix compile-time error ได้อัตโนมัติ",
      "เพราะ runtime error ใน Go ถูกจัดการโดย panic/recover ทำให้ไม่รุนแรง"
    ],
    "correctAnswerIndex": 1,
    "explanation": "ข้อผิดพลาดด้าน DI เช่น dependency หายไปหรือ type ไม่ตรงกัน หากเกิดตอน <b>compile-time</b> จะถูกพบในระหว่าง development หรือ CI ก่อนที่โค้ดจะถึงมือ user แต่ถ้าเกิดตอน <b>runtime</b> (เช่นใน dig/fx) อาจทำให้ service crash ใน production compiler ไม่ได้ auto-fix error และ panic/recover ไม่ใช่วิธีจัดการปัญหา DI ที่ดี"
  },
  {
    "id": "wire-ch01-q13",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "พิจารณาสองแนวทาง:\n\n// แนวทาง A: manual wiring\nfunc main() {\n    db := NewDB(cfg)\n    repo := NewRepo(db)\n    svc := NewService(repo)\n    srv := NewServer(svc)\n    srv.Run()\n}\n\n// แนวทาง B: ใช้ Wire (generated)\nfunc main() {\n    srv := InitializeServer(cfg)\n    srv.Run()\n}\n\nข้อใดอธิบายความแตกต่างที่สำคัญที่สุดได้ถูกต้อง?",
    "code": "// แนวทาง A: manual wiring\nfunc main() {\n    db := NewDB(cfg)\n    repo := NewRepo(db)\n    svc := NewService(repo)\n    srv := NewServer(svc)\n    srv.Run()\n}\n\n// แนวทาง B: ใช้ Wire (generated)\nfunc main() {\n    srv := InitializeServer(cfg)\n    srv.Run()\n}",
    "options": [
      "แนวทาง B เร็วกว่าเพราะ Wire ใช้ parallel initialization",
      "แนวทาง A และ B มี runtime behavior เหมือนกันทุกประการ แต่ B ช่วยลดโค้ด boilerplate ที่ต้องเขียนและดูแลรักษาด้วยมือ",
      "แนวทาง B ปลอดภัยกว่าเพราะ Wire ใส่ error handling ให้อัตโนมัติ",
      "แนวทาง A ดีกว่าสำหรับ production เพราะ debugger ตาม stack trace ได้ง่ายกว่า"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Wire สร้างโค้ดที่มีลักษณะเหมือนแนวทาง A ทุกประการ ดังนั้น <b>runtime behavior เหมือนกัน</b> ข้อดีของ Wire คือ developer ไม่ต้องเขียนและดูแล boilerplate wiring code ด้วยมือ เมื่อ dependency graph เปลี่ยน แค่ update provider แล้วรัน <code>go generate</code> ก็พอ Wire ไม่ได้ทำ parallel init หรือเพิ่ม error handling โดยอัตโนมัติ"
  },
  {
    "id": "wire-ch01-q14",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "ทีมกำลังพิจารณาระหว่าง Uber fx กับ Google Wire สำหรับ Go microservice ใหม่ ข้อใดคือความแตกต่างที่ควรนำมาพิจารณา?",
    "options": [
      "fx รองรับ Go modules แต่ Wire ยังไม่รองรับ",
      "Wire เหมาะกับ app ที่ต้องการ startup เร็วและ error ตอน compile-time ส่วน fx เหมาะกับ app ที่ต้องการ dynamic wiring ตอน runtime",
      "Wire รองรับเฉพาะ Linux ส่วน fx รองรับทุก OS",
      "fx ต้องใช้ CGO แต่ Wire ไม่ต้องใช้"
    ],
    "correctAnswerIndex": 1,
    "explanation": "<b>Wire</b> เหมาะกับทีมที่ต้องการความแน่นอนของ dependency graph ตอน compile-time, startup ที่เร็ว, และโค้ดที่อ่านและ debug ได้ง่าย ส่วน <b>fx</b> เหมาะกับกรณีที่ต้องการ dynamic module loading หรือ lifecycle hooks ที่ซับซ้อน ทั้งคู่รองรับ Go modules และทุก OS และไม่ต้องใช้ CGO"
  },
  {
    "id": "wire-ch01-q15",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "ข้อใดอธิบาย \"compile-time dependency injection\" ได้ถูกต้องที่สุด?",
    "options": [
      "การที่ compiler ตรวจสอบว่า dependency ทุกตัวมีค่า non-nil ขณะ compile",
      "การสร้างโค้ด initialization ที่ถูกต้องระหว่าง build process ก่อนที่ application จะรัน",
      "การใช้ build tags เพื่อเปลี่ยน dependency ตาม environment",
      "การกำหนดค่า dependency ผ่าน environment variable ตอนที่ app เริ่มทำงาน"
    ],
    "correctAnswerIndex": 1,
    "explanation": "<b>Compile-time DI</b> หมายถึงการที่ dependency graph ถูกวิเคราะห์และโค้ด initialization ถูกสร้างขึ้นระหว่าง build โดยที่ตอน runtime ไม่มีการทำงานพิเศษใดๆ Wire ทำแบบนี้โดยการ generate <code>wire_gen.go</code> ตอน <code>go generate</code> ก่อน compile จริง"
  },
  {
    "id": "wire-ch01-q16",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "นักพัฒนา senior กล่าวว่า \"สำหรับ microservice ขนาดเล็กที่มี component ไม่กี่ตัว การ wire ด้วยมือดีกว่าใช้ Wire เสมอ\" ข้อใดประเมินข้อกล่าวนี้ได้ถูกต้องที่สุด?",
    "options": [
      "ถูกทั้งหมด — Wire มี overhead สูงเกินไปสำหรับ project ขนาดเล็ก",
      "ถูกบางส่วน — สำหรับ project เล็กมากที่มีสองถึงสามชั้น การ wire ด้วยมือสมเหตุสมผล แต่เมื่อ project เติบโต Wire ให้ผลคุ้มค่ากว่า",
      "ผิด — Wire เหมาะกับทุก project ทุกขนาดโดยไม่มีข้อยกเว้น",
      "ผิด — Wire ออกแบบมาเฉพาะสำหรับ project ขนาดใหญ่เท่านั้น"
    ],
    "correctAnswerIndex": 1,
    "explanation": "ข้อกล่าวนี้ถูกบางส่วน สำหรับ microservice ขนาดเล็กมากที่มี dependency น้อย การ wire ด้วยมือก็ใช้งานได้ดี แต่ไม่ใช่ <b>เสมอ</b> เมื่อ project เติบโตหรือเมื่อทีมต้องการความชัดเจนและ compile-time safety Wire จะให้ประโยชน์ที่คุ้มค่ากว่า การตัดสินใจควรพิจารณาจากขนาดและความซับซ้อนของ project"
  },
  {
    "id": "wire-ch01-q17",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "พิจารณาโค้ดนี้:\n\nvar db *sql.DB\n\nfunc GetDB() *sql.DB {\n    if db == nil {\n        db, _ = sql.Open(\"postgres\", os.Getenv(\"DB_URL\"))\n    }\n    return db\n}\n\nโค้ดนี้ใช้รูปแบบใดและมีปัญหาอะไรบ้างเมื่อเทียบกับ constructor injection?",
    "code": "var db *sql.DB\n\nfunc GetDB() *sql.DB {\n    if db == nil {\n        db, _ = sql.Open(\"postgres\", os.Getenv(\"DB_URL\"))\n    }\n    return db\n}",
    "options": [
      "Constructor injection ที่ถูกต้อง ไม่มีปัญหาใดๆ",
      "Service locator ผ่าน global state ทำให้ทดสอบยาก มี race condition และซ่อน dependency",
      "Factory pattern ที่ดี เพราะซ่อนรายละเอียดการสร้าง database connection",
      "Singleton pattern ที่ thread-safe เพราะ Go รับประกัน atomic access ของ global variable"
    ],
    "correctAnswerIndex": 1,
    "explanation": "โค้ดนี้ใช้ <b>global mutable state</b> แบบ service locator มีปัญหาหลายอย่าง: (1) ซ่อน dependency จาก caller, (2) มี race condition ใน concurrent code เพราะไม่มี mutex, (3) ทดสอบยากมากเพราะต้อง mock global state, (4) ละเลย error จาก <code>sql.Open</code> การใช้ constructor injection จะส่ง <code>*sql.DB</code> เข้า function โดยตรงแทน"
  },
  {
    "id": "wire-ch01-q18",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "ข้อใดคือข้อดีของ Wire ที่ runtime DI framework เช่น dig ไม่สามารถให้ได้?",
    "options": [
      "รองรับ dependency graph ที่มี cycle",
      "โค้ดที่ Wire สร้างสามารถอ่านและ debug ได้โดยตรง และข้อผิดพลาดด้าน wiring ปรากฏตอน compile-time",
      "Wire สนับสนุน hot-reload ของ dependency ขณะที่ application กำลังทำงาน",
      "Wire ทำงานได้เร็วกว่า dig ถึง 10 เท่าในทุกกรณีการใช้งาน"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Wire มีข้อดีสองข้อที่ runtime framework ให้ไม่ได้: (1) <b>โค้ดที่อ่านได้</b> — <code>wire_gen.go</code> เป็น Go code ธรรมดาที่ developer อ่านและ debug ได้ ต่างจาก reflection graph ที่มองไม่เห็น (2) <b>Compile-time error</b> — ถ้า dependency หายไปหรือ type ไม่ตรง จะ fail ตอน build ไม่ใช่ตอน runtime ทั้ง Wire และ dig ไม่รองรับ circular dependency และ Wire ไม่มี hot-reload"
  },
  {
    "id": "wire-ch01-q19",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "เหตุใด Go community จึงนิยม constructor injection มากกว่า field injection (การ inject ผ่าน struct field โดยตรง)?",
    "options": [
      "เพราะ Go ไม่อนุญาตให้ access struct field จากภายนอก package",
      "เพราะ constructor injection ทำให้ dependency ทั้งหมดชัดเจนตอนสร้าง object และสามารถสร้าง immutable struct ได้",
      "เพราะ field injection ทำให้ binary มีขนาดใหญ่ขึ้นเนื่องจาก reflection overhead",
      "เพราะ Go compiler ปฏิเสธโค้ดที่ใช้ field injection"
    ],
    "correctAnswerIndex": 1,
    "explanation": "<b>Constructor injection</b> บังคับให้ dependency ทุกตัวถูกส่งมาตอนสร้าง object ทำให้สร้าง struct ที่มี field เป็น unexported และไม่สามารถเปลี่ยนแปลงได้หลังจากสร้างแล้ว (immutable) ส่วน field injection ต้องใช้ exported fields หรือ reflect ทำให้ object อาจอยู่ในสถานะที่ยังไม่ถูก initialize Go export ผ่าน unexported fields ได้ภายใน package เดียวกัน"
  },
  {
    "id": "wire-ch01-q20",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "สมมติว่า application มี 50 components และต้องการเพิ่ม logging middleware เข้าไปทุก service layer หากใช้การ wire ด้วยมือเทียบกับการใช้ Wire ข้อใดอธิบายได้ถูกต้อง?",
    "options": [
      "ทั้งสองวิธีต้องแก้ไขโค้ด 50 จุดเหมือนกัน เพราะ Wire ไม่ได้ช่วยลดงาน",
      "การ wire ด้วยมือต้องแก้ไข main/bootstrap code ทุกจุดที่สร้าง service แต่ด้วย Wire แค่ update provider function และ regenerate",
      "Wire อัปเดต dependency ได้อัตโนมัติโดยไม่ต้องรัน go generate อีกครั้ง",
      "การ wire ด้วยมือดีกว่าในกรณีนี้เพราะ Wire ไม่รองรับ middleware pattern"
    ],
    "correctAnswerIndex": 1,
    "explanation": "นี่คือหนึ่งในประโยชน์หลักของ Wire เมื่อต้องการเพิ่ม cross-cutting concern เช่น logging middleware ด้วยการ wire ด้วยมือต้องค้นหาและแก้ทุกจุดที่สร้าง service แต่ด้วย Wire แค่แก้ <b>provider function</b> ของ service แล้วรัน <code>go generate</code> Wire จะสร้างโค้ด wiring ที่อัปเดตแล้วให้ทุกจุดโดยอัตโนมัติ Wire ไม่ได้ update อัตโนมัติโดยไม่รัน generate และรองรับ middleware pattern ได้ปกติ"
  }
];
