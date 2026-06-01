/* questions ch09 (TH) */
(window.QUESTIONS_TH = window.QUESTIONS_TH || {}).ch09 = [
  {
    "id": "wire-ch09-q01",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "เมื่อ Wire inject *http.Server ผ่าน injector สิ่งใดควรเป็น root type ที่ injector return ออกมา?",
    "options": [
      "*http.Server ที่ประกอบด้วย handler และ config ครบแล้ว",
      "*http.ServeMux ซึ่ง Wire จะ wrap ให้เป็น *http.Server อัตโนมัติ",
      "http.Handler interface เพราะ Wire สามารถ convert ให้เป็น server ได้",
      "string ของ address เพราะ http.ListenAndServe รับ string"
    ],
    "correctAnswerIndex": 0,
    "explanation": "Injector return type คือสิ่งที่ Wire ต้องสร้างถึง — ควร return <b>*http.Server</b> ที่พร้อม serve แล้ว รวม handler และ config เรียบร้อย ไม่ใช่ ServeMux หรือ interface เพราะ Wire ไม่มีการ convert type ให้อัตโนมัติ"
  },
  {
    "id": "wire-ch09-q02",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "ใน provider สำหรับ *grpc.Server ควรเรียก grpc.GracefulStop() ที่ไหน?",
    "options": [
      "เรียกโดยตรงใน provider function หลังจาก grpc.NewServer()",
      "เรียกใน main() ก่อน defer cleanup()",
      "เรียกใน cleanup function ที่ return ออกมาจาก provider",
      "ไม่ต้องเรียกเลย Wire จัดการ stop server ให้อัตโนมัติ"
    ],
    "correctAnswerIndex": 2,
    "explanation": "ควร return <b>cleanup func</b> ที่เรียก <code>srv.GracefulStop()</code> ออกไปจาก provider — Wire รวบรวม cleanup นี้ไว้ใน chain และ caller เรียกผ่าน <code>defer cleanup()</code> ใน main() ห้ามเรียก GracefulStop โดยตรงใน provider เพราะ resource จะถูก cleanup ก่อนที่ server จะ serve"
  },
  {
    "id": "wire-ch09-q03",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "provider set ควรประกาศไว้ที่ไหนตามแนวทางที่ดี?",
    "options": [
      "รวมไว้ใน package เดียวกับ injector stub (wire.go) เสมอ",
      "ประกาศไว้ใน package เดียวกับ providers ของ layer นั้น ๆ",
      "ประกาศใน main package เพื่อให้ทุกที่ access ได้",
      "ประกาศใน global variable ของ package wire ของ Google"
    ],
    "correctAnswerIndex": 1,
    "explanation": "ควรประกาศ <b>provider set ไว้ใน package เดียวกับ providers</b> เช่น <code>repo.Set</code> อยู่ใน <code>internal/repo</code>, <code>service.Set</code> อยู่ใน <code>internal/service</code> เป็นต้น ทำให้ set อยู่ใกล้กับ code ที่เกี่ยวข้องและ maintain ง่าย"
  },
  {
    "id": "wire-ch09-q04",
    "difficulty": "easy",
    "bloomLevel": "understand",
    "question": "ทำไมจึงควรแบ่ง provider set ตาม layer (config, repo, service, handler) แทนที่จะมี set เดียวรวมทุกอย่าง?",
    "options": [
      "เพื่อให้สามารถ reuse set บางส่วนใน injector อื่นได้ เช่น test injector ใช้ repo.Set และ service.Set แต่ swap handler.Set",
      "เพราะ Wire มีข้อจำกัดว่าแต่ละ set มีได้ไม่เกิน 10 providers",
      "เพราะ Wire ไม่รองรับ set ที่มี providers จากหลาย package",
      "เพื่อให้ wire_gen.go ถูก split เป็นหลายไฟล์อัตโนมัติ"
    ],
    "correctAnswerIndex": 0,
    "explanation": "การแบ่ง set ตาม layer ทำให้ <b>reuse ได้</b> — เช่น test injector อาจใช้ <code>repo.Set</code> และ <code>service.Set</code> เหมือนกัน แต่ swap <code>handler.Set</code> ด้วย mock set แทน ถ้ามี set เดียวรวมทุกอย่างจะ reuse ได้ยากมาก"
  },
  {
    "id": "wire-ch09-q05",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "ดูโค้ดนี้:\n\nfunc NewHTTPServer(mux *http.ServeMux, cfg Config) (*http.Server, func()) {\n    srv := &http.Server{Addr: cfg.Addr, Handler: mux}\n    cleanup := func() { srv.Shutdown(context.Background()) }\n    return srv, cleanup\n}\n\nทำไม cleanup ถึงควรใช้ context ที่มี timeout แทน context.Background()?",
    "code": "func NewHTTPServer(mux *http.ServeMux, cfg Config) (*http.Server, func()) {\n    srv := &http.Server{Addr: cfg.Addr, Handler: mux}\n    cleanup := func() { srv.Shutdown(context.Background()) }\n    return srv, cleanup\n}",
    "options": [
      "context.Background() ทำให้ Shutdown ไม่ทำงาน ต้องใช้ context.TODO() แทน",
      "Wire ต้องการให้ cleanup ใช้ context ที่ cancelled แล้วเท่านั้น",
      "ไม่มีปัญหา context.Background() เหมาะสมเพราะ Shutdown มี timeout ของตัวเองอยู่แล้ว",
      "context.Background() ไม่มี deadline ทำให้ Shutdown รอ request เก่าแบบ infinite — ควรใช้ context.WithTimeout เพื่อกำหนดเวลา graceful shutdown"
    ],
    "correctAnswerIndex": 3,
    "explanation": "<code>context.Background()</code> ไม่มี deadline ทำให้ <code>srv.Shutdown</code> อาจรอนาน infinite ถ้ามี long-running requests ควรใช้ <b>context.WithTimeout</b> เช่น 5 วินาที เพื่อบังคับให้ graceful shutdown เสร็จภายในเวลาที่กำหนด"
  },
  {
    "id": "wire-ch09-q06",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "พิจารณาโค้ดนี้:\n\nfunc InitApp(cfgPath string) (*http.Server, func(), error) {\n    cfg, _ := config.Load(cfgPath)\n    wire.Build(repo.Set, service.Set, handler.Set)\n    return nil, nil, nil\n}\n\nอะไรผิดในโค้ดนี้?",
    "code": "//go:build wireinject\n\nfunc InitApp(cfgPath string) (*http.Server, func(), error) {\n    cfg, _ := config.Load(cfgPath)\n    wire.Build(repo.Set, service.Set, handler.Set)\n    return nil, nil, nil\n}",
    "options": [
      "มี logic นอก wire.Build ซึ่ง Wire จะละเว้น ทำให้ cfg ไม่ถูก inject เข้า graph",
      "ขาด config.Set ใน wire.Build",
      "injector ไม่สามารถ return error ได้ ต้องตัด error ออก",
      "ควรใช้ wire.Value(cfg) แทน wire.Build"
    ],
    "correctAnswerIndex": 0,
    "explanation": "Wire อ่านแค่ <code>wire.Build(...)</code> ใน injector body — <b>logic อื่นทั้งหมดถูกละเว้น</b> รวมถึง <code>cfg, _ := config.Load(cfgPath)</code> ด้วย ตัวแปร <code>cfg</code> จะไม่ถูกส่งเข้า dependency graph ทางที่ถูกคือส่ง <code>config.Config</code> เป็น parameter ของ injector หรือใส่ <code>config.Set</code> ใน wire.Build"
  },
  {
    "id": "wire-ch09-q07",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "ต้องการให้ *grpc.Server มี UnaryInterceptor สำหรับ logging จะเขียน provider อย่างไรที่ถูกต้องที่สุด?",
    "options": [
      "เขียน interceptor โดยตรงใน NewGRPCServer และ hardcode ไว้ใน grpc.ServerOption slice",
      "เพิ่ม interceptor หลังจาก grpc.NewServer() ด้วย srv.AddInterceptor()",
      "ใส่ interceptor ใน Config struct แบบ interface{} แล้ว type assert ใน provider",
      "สร้าง provider แยก func NewLoggingInterceptor(...) grpc.UnaryServerInterceptor แล้วส่งเข้า NewGRPCServer เป็น parameter"
    ],
    "correctAnswerIndex": 3,
    "explanation": "ควรสร้าง <b>provider แยก</b> สำหรับ interceptor แล้วส่งเข้า server provider เป็น dependency — ทำให้ intercept logic testable และ replaceable แยกต่างหาก การ hardcode interceptor ใน NewGRPCServer ทำให้ยาก swap ใน test; <code>grpc.Server</code> ไม่มี method <code>AddInterceptor</code>"
  },
  {
    "id": "wire-ch09-q08",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "จะ wire middleware ของ HTTP ที่ต้องการ *slog.Logger อย่างไร?",
    "code": "func NewLoggingMiddleware(logger *slog.Logger) func(http.Handler) http.Handler {\n    return func(next http.Handler) http.Handler {\n        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {\n            next.ServeHTTP(w, r)\n        })\n    }\n}",
    "options": [
      "ต้องใช้ wire.Value() เพื่อส่ง logger เข้า middleware เพราะ logger ไม่ใช่ struct pointer",
      "ใส่ NewLoggingMiddleware และ provider สำหรับ *slog.Logger ไว้ใน wire.Build หรือ set — Wire จะ inject logger ให้อัตโนมัติ",
      "สร้าง global logger ก่อนแล้วใช้ closure capture แทน parameter",
      "Wire ไม่รองรับ provider ที่ return function type จึงต้องสร้าง struct wrapper"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Wire ใช้ <b>return type เป็น key</b> ดังนั้น <code>func(http.Handler) http.Handler</code> ก็เป็น key ได้ ถ้าใส่ <code>NewLoggingMiddleware</code> และ provider สำหรับ <code>*slog.Logger</code> ใน wire.Build Wire จะ inject <code>*slog.Logger</code> ให้ middleware อัตโนมัติ ไม่จำเป็นต้องใช้ wire.Value หรือ global"
  },
  {
    "id": "wire-ch09-q09",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "injector ใดถูกต้องสำหรับ app ที่โหลด config ก่อนแล้วส่งเข้า Wire?",
    "code": "// ตัวเลือก A\nfunc InitApp(cfgPath string) (*http.Server, func(), error) {\n    wire.Build(config.Set, repo.Set, service.Set, handler.Set)\n    return nil, nil, nil\n}\n\n// ตัวเลือก B\nfunc InitApp(cfg config.Config) (*http.Server, func(), error) {\n    wire.Build(repo.Set, service.Set, handler.Set)\n    return nil, nil, nil\n}",
    "options": [
      "ตัวเลือก A เท่านั้น เพราะต้องให้ Wire รับผิดชอบโหลด config เองทั้งหมด",
      "ทั้งสองผิด เพราะ config ต้องใช้ wire.Value() เสมอ",
      "ทั้งสองถูกต้อง — A ให้ Wire โหลด config ผ่าน provider; B โหลดก่อนและส่งเข้า injector เป็น argument",
      "ตัวเลือก B เท่านั้น เพราะ config.Config ถูก inject เป็น parameter ไม่ต้องมี provider"
    ],
    "correctAnswerIndex": 2,
    "explanation": "<b>ทั้งสองแบบถูกต้อง</b> แต่ใช้ต่างสถานการณ์ — A เหมาะเมื่อต้องการให้ Wire จัดการ config loading; B เหมาะเมื่อโหลด config และ parse flags ใน main() ก่อนแล้วส่งเข้า injector เป็น argument parameter ของ injector คือ pre-provided value ที่ Wire ไม่ต้องหา provider ให้"
  },
  {
    "id": "wire-ch09-q10",
    "difficulty": "medium",
    "bloomLevel": "analyze",
    "question": "provider สำหรับ *http.ServeMux ด้านล่างมีปัญหาอะไร?\n\nfunc NewServeMux(u *UserHandler, cfg Config) *http.ServeMux {\n    if cfg.Debug {\n        log.Println(\"debug mode on\")\n    }\n    mux := http.NewServeMux()\n    mux.HandleFunc(\"/users\", u.List)\n    mux.HandleFunc(\"/debug\", debugHandler) // hardcoded global\n    return mux\n}",
    "code": "func NewServeMux(u *UserHandler, cfg Config) *http.ServeMux {\n    if cfg.Debug {\n        log.Println(\"debug mode on\")\n    }\n    mux := http.NewServeMux()\n    mux.HandleFunc(\"/users\", u.List)\n    mux.HandleFunc(\"/debug\", debugHandler) // hardcoded global\n    return mux\n}",
    "options": [
      "debugHandler เป็น global function ที่ hardcode อยู่ใน provider ทำให้ replace ใน test ได้ยาก และ if cfg.Debug ควรอยู่ใน caller ไม่ใช่ provider",
      "provider ไม่ควรรับ Config เป็น parameter ต้องใช้ wire.Value แทน",
      "http.ServeMux ไม่ใช่ pointer type จึงไม่สามารถเป็น return type ของ provider ได้",
      "ไม่มีปัญหา นี่คือ pattern ที่ถูกต้อง"
    ],
    "correctAnswerIndex": 0,
    "explanation": "<b>debugHandler เป็น global function</b> ที่ hardcode อยู่ใน provider ทำให้ test ไม่สามารถ swap ได้ง่าย ควร inject debug handler เป็น dependency แทน นอกจากนี้ logic เช่น if cfg.Debug อาจทำให้ behavior ของ provider ต่างกันตาม config ซึ่งยาก test — ควร inject ตัดสินใจนี้ออกไป"
  },
  {
    "id": "wire-ch09-q11",
    "difficulty": "medium",
    "bloomLevel": "analyze",
    "question": "ทำไม circular dependency ระหว่าง server provider กับ handler provider จึงเกิดขึ้นได้และควรแก้อย่างไร?",
    "options": [
      "ไม่สามารถเกิด circular dependency ใน Wire ได้เพราะ Wire ตรวจสอบให้อัตโนมัติ",
      "เกิดเมื่อ server import handler เสมอ แก้โดยย้าย handler ไปอยู่ใน package เดียวกับ server",
      "เกิดเมื่อใช้ wire.Bind ทำให้ Wire สร้าง loop ใน dependency graph",
      "เกิดได้เมื่อ handler ต้องการ server address เพื่อสร้าง redirect URL; แก้โดยส่ง Config เข้า handler โดยตรงแทน *http.Server"
    ],
    "correctAnswerIndex": 3,
    "explanation": "ตัวอย่างที่พบบ่อย: <code>UserHandler</code> ต้องการ <code>*http.Server</code> เพื่อดึง Addr สำหรับสร้าง URL แต่ <code>*http.Server</code> ต้องการ <code>*UserHandler</code> เพื่อ register route — นี่คือ circular dependency แก้โดย <b>inject Config เข้า Handler โดยตรง</b> แทนที่จะให้ Handler รู้จัก Server Wire จะ detect circular dependency และ error ให้"
  },
  {
    "id": "wire-ch09-q12",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "ทีมต้องการให้ HTTP server และ gRPC server share *service.UserService เดียวกัน ควรออกแบบ injector อย่างไร?",
    "options": [
      "ใช้ wire.Value() ส่ง *service.UserService ที่สร้างไว้ล่วงหน้าเข้าทั้งสอง injector",
      "สร้าง injector แยกสองตัว แต่ละตัว include service.Set — Wire จะสร้าง UserService สองตัวแยกกัน ซึ่งเป็นเรื่องปกติ",
      "สร้าง injector เดียวที่ return struct ที่มีทั้ง HTTP server และ gRPC server ทำให้ Wire สร้าง UserService ตัวเดียวและ share ให้ทั้งสอง",
      "ใช้ sync.Once ใน provider ของ UserService เพื่อ guarantee singleton"
    ],
    "correctAnswerIndex": 2,
    "explanation": "ใน injector เดียว Wire จะสร้าง <code>*service.UserService</code> <b>ตัวเดียว</b> และส่งให้ทุก consumer ที่ต้องการ — นี่คือ singleton ใน scope ของ injector การสร้าง injector แยกสองตัวจะได้ UserService สองตัวแยกกัน ซึ่งอาจไม่ต้องการ"
  },
  {
    "id": "wire-ch09-q13",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "นักพัฒนาพยายาม inject *http.Request เข้า UserService ผ่าน Wire injector ที่เรียกตอน app start สิ่งที่จะเกิดขึ้นคืออะไร?",
    "code": "// wire.go\nfunc InitApp() (*http.Server, func(), error) {\n    wire.Build(\n        repo.Set,\n        NewUserServiceWithRequest, // รับ *http.Request\n        handler.Set,\n    )\n    return nil, nil, nil\n}",
    "options": [
      "Wire จะสร้าง *http.Request ว่างให้อัตโนมัติและ inject เข้า UserService",
      "Wire จะ inject nil สำหรับ *http.Request โดยไม่มี error",
      "Wire จะสร้าง UserService ใหม่ทุกครั้งที่มี request เข้ามา",
      "Wire จะ error เพราะไม่มี provider สำหรับ *http.Request และ injector ไม่รับ *http.Request เป็น parameter"
    ],
    "correctAnswerIndex": 3,
    "explanation": "Wire จะ <b>error ว่าไม่มี provider สำหรับ *http.Request</b> เพราะไม่มีใครสร้างให้ใน graph นี่คือ pitfall สำคัญ — Wire ทำงาน <strong>ครั้งเดียวตอน startup</strong> ไม่ใช่ต่อ request ถ้าต้องการ request-scoped values ให้ส่งผ่าน context หรือ function argument ใน handler"
  },
  {
    "id": "wire-ch09-q14",
    "difficulty": "hard",
    "bloomLevel": "evaluate",
    "question": "เปรียบเทียบสองแนวทาง:\n\nแนวทาง A: สร้าง injector ใหม่ทุก request สำหรับ UserHandler\nแนวทาง B: สร้าง UserHandler ครั้งเดียวตอน startup และ inject *http.Request ผ่าน method parameter\n\nแนวทางใดเหมาะสมกว่าและเพราะอะไร?",
    "options": [
      "แนวทาง A ดีกว่าเสมอเพราะ isolation ต่อ request สูงกว่า",
      "ทั้งสองแนวทางเหมือนกันทุกประการ ใช้แนวทางใดก็ได้",
      "แนวทาง B เหมาะสมกว่า เพราะ handler เป็น stateless singleton ที่สร้างครั้งเดียว และ request-scoped data ส่งผ่าน method parameter ตามปกติ",
      "แนวทาง A ผิดเพราะ Wire ไม่รองรับการเรียก injector ซ้ำหลายครั้ง"
    ],
    "correctAnswerIndex": 2,
    "explanation": "<b>แนวทาง B ถูกต้อง</b> — HTTP handler ควรเป็น stateless และสร้างครั้งเดียว ข้อมูล request-scoped เช่น body, headers, user ID ส่งผ่าน <code>func ServeHTTP(w http.ResponseWriter, r *http.Request)</code> ตามปกติ ไม่ผ่าน Wire แนวทาง A (injector ต่อ request) มี overhead สูงและไม่จำเป็น"
  },
  {
    "id": "wire-ch09-q15",
    "difficulty": "hard",
    "bloomLevel": "evaluate",
    "question": "project มีทั้ง production injector และ test injector ที่ share service.Set แต่ test injector ใช้ mock repo แทน ปัญหาใดจะเกิดขึ้นถ้าใส่ repo.Set และ mock repo provider ใน wire.Build ของ test injector พร้อมกัน?",
    "code": "// test injector (ผิด)\nfunc InitTestApp(t *testing.T) (*http.Server, func()) {\n    wire.Build(\n        repo.Set,           // มี NewUserRepo\n        NewMockUserRepo,    // ก็มี NewUserRepo เหมือนกัน?\n        service.Set,\n        handler.Set,\n    )\n    return nil, nil\n}",
    "options": [
      "Wire จะ merge ทั้งสอง provider เป็น multi-value",
      "Wire จะใช้ NewMockUserRepo เสมอเพราะอยู่หลัง repo.Set",
      "ไม่มีปัญหา Wire จะเลือก provider ที่ใหม่กว่าให้อัตโนมัติ",
      "Wire จะ error ว่า duplicate provider สำหรับ type เดียวกัน เช่น *repo.UserRepo"
    ],
    "correctAnswerIndex": 3,
    "explanation": "Wire ไม่ยอมให้มี <b>duplicate provider สำหรับ type เดียวกัน</b> ถ้า <code>repo.Set</code> มี <code>NewUserRepo</code> ที่ return <code>*repo.UserRepo</code> และ <code>NewMockUserRepo</code> ก็ return <code>*repo.UserRepo</code> เช่นกัน Wire จะ error ทางที่ถูกคือสร้าง test set แยกที่ไม่ include <code>repo.Set</code> แต่ใช้ mock แทนทั้งหมด"
  },
  {
    "id": "wire-ch09-q16",
    "difficulty": "hard",
    "bloomLevel": "evaluate",
    "question": "cleanup ของ Wire ทำงานใน LIFO order สมมติ providers ถูกสร้างตามลำดับ: DB → UserRepo → UserService → HTTPServer ลำดับ cleanup ที่ถูกต้องคืออะไร?",
    "options": [
      "DB → UserRepo → UserService → HTTPServer (FIFO — สร้างก่อน cleanup ก่อน)",
      "ลำดับสุ่มขึ้นอยู่กับ garbage collector",
      "ทุก cleanup รันพร้อมกัน (parallel)",
      "HTTPServer → UserService → UserRepo → DB (LIFO — สร้างทีหลัง cleanup ก่อน)"
    ],
    "correctAnswerIndex": 3,
    "explanation": "Wire ใช้ <b>LIFO (Last In, First Out)</b> สำหรับ cleanup — resource ที่สร้างทีหลังจะถูก cleanup ก่อน ดังนั้น HTTPServer ถูก cleanup ก่อน (Shutdown) จากนั้น UserService, UserRepo ตามลำดับ และ DB (Close) เป็นสุดท้าย เพราะ DB คือ resource พื้นฐานที่ component อื่นพึ่งพาอยู่"
  },
  {
    "id": "wire-ch09-q17",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "ต้องการ inject grpc.ServerOption หลายตัวเข้า NewGRPCServer ควรทำอย่างไรใน Wire?",
    "options": [
      "Wire ไม่รองรับ variadic argument จึงต้อง hardcode options ทั้งหมดใน provider",
      "สร้าง struct เช่น GRPCOptions ที่รวบรวม options ไว้ แล้วมี provider สร้าง GRPCOptions และ NewGRPCServer รับ GRPCOptions",
      "ใช้ wire.Value([]grpc.ServerOption{...}) เพื่อส่ง slice ของ options เข้าโดยตรง",
      "สร้าง provider แยกต่างหากสำหรับแต่ละ grpc.ServerOption แล้วใส่ใน wire.Build ทั้งหมด"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Wire ไม่สามารถ inject variadic <code>...grpc.ServerOption</code> ได้โดยตรง วิธีที่ดีคือ<b>สร้าง struct</b> เช่น <code>GRPCOptions</code> ที่รวบรวม options และมี provider สร้าง struct นั้น จากนั้น <code>NewGRPCServer</code> รับ <code>GRPCOptions</code> และ unpack เป็น options ภายใน ทำให้ inject และ test ได้ง่าย"
  },
  {
    "id": "wire-ch09-q18",
    "difficulty": "hard",
    "bloomLevel": "evaluate",
    "question": "main() ด้านล่างมีปัญหาอะไร?\n\nfunc main() {\n    srv, cleanup, err := InitApp(\"config.yaml\")\n    defer cleanup()\n    if err != nil {\n        log.Fatal(err)\n    }\n    srv.ListenAndServe()\n}",
    "code": "func main() {\n    srv, cleanup, err := InitApp(\"config.yaml\")\n    defer cleanup()\n    if err != nil {\n        log.Fatal(err)\n    }\n    srv.ListenAndServe()\n}",
    "options": [
      "ไม่มีปัญหา defer cleanup() อยู่ก่อน error check เพื่อให้รันเสมอ",
      "defer cleanup() ต้องอยู่หลัง error check เพราะถ้า err != nil cleanup อาจ panic เนื่องจาก resource ไม่ได้ถูกสร้างครบ",
      "ควรใช้ cleanup() โดยตรงแทน defer เพื่อให้รันทันที",
      "InitApp ไม่ควร return error ควรให้ log.Fatal อยู่ใน provider แทน"
    ],
    "correctAnswerIndex": 1,
    "explanation": "<b>defer cleanup() ต้องอยู่หลัง error check</b> เสมอ ถ้า <code>InitApp</code> return error หมายความว่า initialization ล้มเหลวระหว่างทาง — Wire รับประกัน cleanup สำหรับ resource ที่สร้างสำเร็จก่อน error แต่ cleanup func ที่ return มาอาจเป็น nil หรือทำงานไม่ถูกต้องถ้าเรียกก่อนตรวจ error pattern ที่ถูก: <code>if err != nil { log.Fatal(err) }; defer cleanup()</code>"
  },
  {
    "id": "wire-ch09-q19",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "ต้องการให้ NewServeMux register handler จากหลาย handler struct (UserHandler, OrderHandler, ProductHandler) จะออกแบบ provider signature อย่างไรที่ดีที่สุด?",
    "options": [
      "func NewServeMux(handlers []http.Handler) *http.ServeMux โดยใช้ wire.Value ส่ง slice",
      "func NewServeMux() *http.ServeMux แล้วให้แต่ละ handler register ตัวเองโดยตรง",
      "ไม่ควรมี NewServeMux ให้ register routes ใน main() แทน",
      "func NewServeMux(u *UserHandler, o *OrderHandler, p *ProductHandler) *http.ServeMux"
    ],
    "correctAnswerIndex": 3,
    "explanation": "<b>รับ handler struct แต่ละตัวเป็น parameter แยก</b> คือแนวทางที่ Wire รองรับได้ดีที่สุด Wire จะ inject แต่ละ handler ให้ตาม type ทำให้ dependency ชัดเจน Wire ไม่รองรับ slice injection โดยตรงโดยไม่มี special handling และการให้ handler register ตัวเองทำให้ provider ต้อง global mux"
  },
  {
    "id": "wire-ch09-q20",
    "difficulty": "hard",
    "bloomLevel": "evaluate",
    "question": "project ต้องการ run HTTP server และ gRPC server พร้อมกันใน main() และทั้งคู่ share *service.UserService เดียวกัน วิธีใดถูกต้องที่สุดสำหรับ Wire?",
    "options": [
      "สร้าง injector สองตัวแยกกัน InitHTTPApp และ InitGRPCApp แต่ละตัวมี service.Set ของตัวเอง",
      "สร้าง struct เช่น App ที่มีทั้ง HTTPServer และ GRPCServer เป็น field จากนั้นมี injector เดียว return *App — Wire สร้าง UserService ตัวเดียวและ share ให้ทั้งสอง",
      "ใช้ sync.Once ใน UserService provider เพื่อ guarantee singleton ข้าม injector",
      "สร้าง *service.UserService ใน main() ก่อนด้วยมือ แล้วส่งเข้าทั้งสอง injector เป็น parameter"
    ],
    "correctAnswerIndex": 1,
    "explanation": "ทางที่ดีที่สุดคือ<b>สร้าง App struct ที่รวมทั้งสองไว้และมี injector เดียว</b> — ภายใน injector เดียว Wire จะสร้าง <code>*service.UserService</code> ตัวเดียวและส่งให้ทุก consumer ที่ต้องการ ซึ่ง guarantee sharing โดยอัตโนมัติ การสร้าง injectorสองตัวแยกกันจะได้ UserService คนละตัว และ sync.Once เป็น workaround ที่ไม่จำเป็น"
  }
];
