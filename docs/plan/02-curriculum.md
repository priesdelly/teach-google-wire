# Curriculum Plan — Google Wire

**Backwards Design approach:** End goal = learner graduates able to apply Wire in production Go services (providers, injectors, cleanup, binding, per-request scoping, HTTP/gRPC integration). Chapters are derived backward from that goal, building from conceptual foundation through mechanical mastery to integrated practice.

---

## Chapter Overview Table

| # | Chapter Title (Thai) | Difficulty | Bloom Levels |
|---|---|---|---|
| 1 | ทำไม Dependency Injection ถึงสำคัญ | Beginner | Remember, Understand, Analyze |
| 2 | รู้จัก Google Wire และการติดตั้ง | Beginner | Remember, Understand, Apply |
| 3 | Provider คืออะไร และ wire.Build | Beginner–Intermediate | Remember, Apply, Analyze |
| 4 | Provider Sets และ wire.NewSet | Intermediate | Understand, Apply, Analyze |
| 5 | wire.Bind — ผูก Interface กับ Concrete Type | Intermediate | Remember, Apply, Analyze |
| 6 | wire.Struct — Field Injection | Intermediate | Understand, Apply |
| 7 | Cleanup Functions และ Error Handling | Intermediate–Advanced | Understand, Apply, Evaluate |
| 8 | Multiple Injectors และ Per-Request Scoping | Advanced | Apply, Analyze, Evaluate |
| 9 | Integration กับ HTTP และ gRPC | Advanced | Apply, Analyze, Evaluate |
| 10 | Capstone Project | Advanced | Create, Evaluate |

---

## Chapter 1: ทำไม Dependency Injection ถึงสำคัญ

**Bloom levels:** Remember, Understand, Analyze

**Learning Objectives:**
1. (Remember) อธิบายได้ว่า Dependency Injection คืออะไร และแก้ปัญหาอะไร
2. (Understand) เปรียบเทียบ manual wiring กับ DI framework ได้
3. (Understand) อธิบายความแตกต่างระหว่าง compile-time DI (Wire) กับ runtime DI (Uber fx/dig) ได้
4. (Analyze) ระบุได้ว่า codebase แบบใดได้ประโยชน์จาก DI และแบบใดไม่ต้องการ

**Key Topics:**
- ปัญหาของ manual constructor chaining: `main.go` ที่ยาวและเปราะบาง
- Constructor injection vs field injection vs service locator
- Runtime DI (reflection-based, errors at runtime) vs compile-time DI (code-gen, errors at `wire` run / compile time)
- ทำไม Wire เลือก code generation: zero reflection overhead, errors surface early, generated code readable

**Code Snippet Ideas:**
- "Before" example: `main.go` สร้าง dependency chain ด้วย manual constructor calls 5 ชั้น
- "After" preview: injector function 3 บรรทัดที่ Wire สร้างให้ (แค่ดู ยังไม่ต้องเข้าใจ)
- เปรียบเทียบ error message: runtime DI panic vs Wire compile error

**Common Pitfalls:**
1. เข้าใจผิดว่า Wire เป็น "service locator" — Wire ไม่มี runtime container; มันสร้าง code ธรรมดาก่อน compile
2. คิดว่า DI ทุกอย่างต้องใช้ framework — small projects อาจยังใช้ manual wiring ได้ดีกว่า

**Hands-on Deliverable:** เขียน `main.go` แบบ manual wiring สำหรับ service ง่าย ๆ (3 dependency) แล้ว annotate ว่าส่วนไหนจะ "หาย" หากใช้ Wire

---

## Chapter 2: รู้จัก Google Wire และการติดตั้ง

**Bloom levels:** Remember, Understand, Apply

**Learning Objectives:**
1. (Remember) บอกได้ว่า `wire` CLI ทำหน้าที่อะไร และอยู่ที่ไหนใน workflow
2. (Understand) อธิบายบทบาทของ `wire.go` (stub) และ `wire_gen.go` (generated) ได้
3. (Apply) ติดตั้ง `wire` CLI และสร้าง project โครงสร้างเบื้องต้นได้
4. (Apply) ตั้งค่า `go:generate` directive เพื่อรัน `wire` ได้
5. (Understand) อธิบาย build tag `//go:build wireinject` และ `//go:build !wireinject` ได้

**Key Topics:**
- `go install github.com/google/wire/cmd/wire@latest`
- Project layout: `wire.go` (hand-written stub) + `wire_gen.go` (generated, commit to VCS)
- `//go:build wireinject` บน stub file — บอก Wire ว่าไฟล์นี้คือ input; compiler จะข้าม
- `//go:build !wireinject` บน `wire_gen.go` — ใช้ตอน compile จริง; อย่าแก้ด้วยมือ
- `//go:generate wire` directive ใน package
- `wire` command: อ่าน stub → วิเคราะห์ dependency graph → สร้าง `wire_gen.go`

**Code Snippet Ideas:**
- Structure ของ stub file: package declaration, build tag, import `"github.com/google/wire"`, injector signature, `wire.Build(...)`, throwaway return
- Output `wire_gen.go` ที่ Wire สร้าง (แสดงว่าเป็น Go code ธรรมดา)
- `//go:generate wire` บรรทัดเดียว

**Common Pitfalls:**
1. ลืม build tag `//go:build wireinject` — compiler จะพยายาม compile stub และ fail เพราะ body ไม่ถูกต้อง
2. แก้ไข `wire_gen.go` ด้วยมือ — จะถูก overwrite ทุกครั้งที่รัน `wire`; ให้แก้ที่ stub หรือ providers เสมอ

**Hands-on Deliverable:** สร้าง Go module, เขียน stub injector สำหรับ struct ง่าย ๆ, รัน `wire` สำเร็จ, ตรวจสอบว่า `wire_gen.go` ถูกสร้าง

---

## Chapter 3: Provider คืออะไร และ wire.Build

**Bloom levels:** Remember, Apply, Analyze

**Learning Objectives:**
1. (Remember) นิยาม "provider" ในบริบท Wire ได้
2. (Apply) เขียน provider function ที่ถูกต้องได้ (signature rules)
3. (Apply) ใช้ `wire.Build` ใน injector stub ได้
4. (Analyze) อ่าน error message ของ Wire เพื่อหา missing หรือ duplicate provider ได้
5. (Analyze) trace dependency graph จาก injector return type ย้อนกลับไปหา providers ได้

**Key Topics:**
- Provider: function ที่ return type `T` (หรือ `(T, error)`) — Wire ใช้ return type เป็น "key"
- Signature rules: exported หรือ unexported ได้; args คือ dependencies; return เป็น value หรือ pointer
- `wire.Build(providerA, providerB, ...)` — list ของ provider (และ provider sets) ที่ Wire ใช้สร้าง graph
- Injector body: `wire.Build(...)` + throwaway return เช่น `return App{}, nil` หรือ `panic("wire")`
- Wire resolve dependency graph: match return types กับ parameter types แบบ topological sort
- Duplicate provider error: สอง providers return type เดียวกัน
- Missing provider error: ไม่มี provider สำหรับ type ที่ต้องการ

**Code Snippet Ideas:**
- Provider chain: `NewDB() *sql.DB`, `NewUserRepo(db *sql.DB) *UserRepo`, `NewUserService(repo *UserRepo) *UserService`
- Injector stub: `func InitializeApp() *UserService { wire.Build(NewDB, NewUserRepo, NewUserService); return nil }`
- Wire error output เมื่อ provider ขาด

**Common Pitfalls:**
1. Provider return pointer แต่ dependency expect value (หรือกลับกัน) — Wire ถือว่า `*T` และ `T` คนละ type
2. เขียน logic ใน injector body นอกจาก `wire.Build` — Wire อ่านแค่ `wire.Build` call; logic อื่นถูกละเว้น

**Hands-on Deliverable:** สร้าง provider chain 4 ชั้น, เขียน injector, รัน `wire`, แก้ error จนผ่าน

---

## Chapter 4: Provider Sets และ wire.NewSet

**Bloom levels:** Understand, Apply, Analyze

**Learning Objectives:**
1. (Understand) อธิบายประโยชน์ของ `wire.NewSet` ในการจัดกลุ่ม providers ได้
2. (Apply) สร้าง provider set สำหรับ layer (repository, service, handler) ได้
3. (Apply) compose provider sets ที่ซ้อนกันได้ (set ภายใน set)
4. (Analyze) ออกแบบ provider set boundaries ให้สอดคล้องกับ package/layer structure ได้

**Key Topics:**
- `var RepoSet = wire.NewSet(NewDB, NewUserRepo, NewProductRepo)`
- Set composition: `wire.NewSet(RepoSet, ServiceSet)` — sets สามารถ reference sets อื่น
- ประโยชน์: reuse sets ข้าม injectors, จัดกลุ่มตาม domain/layer, ลด noise ใน `wire.Build`
- แนวทาง: ประกาศ set ใน package เดียวกับ providers; expose เป็น exported var
- Set ไม่ใช่ runtime object — Wire "unfolds" ทุก set เป็น flat list ตอน codegen

**Code Snippet Ideas:**
- `var RepositorySet = wire.NewSet(NewPostgresDB, NewUserRepository, NewOrderRepository)`
- `var ApplicationSet = wire.NewSet(RepositorySet, ServiceSet, HandlerSet)`
- Injector: `wire.Build(ApplicationSet)` แทนที่จะ list providers ทีละตัว

**Common Pitfalls:**
1. ใส่ provider ซ้ำใน set และใน `wire.Build` โดยตรง — Wire ฟ้อง duplicate provider error
2. สร้าง set ที่ใหญ่เกินไปจนไม่สามารถ reuse ได้ — ควร set ต่อ layer/domain ไม่ใช่ "one global set"

**Hands-on Deliverable:** Refactor injector จาก Chapter 3 โดยจัด providers เป็น 2 sets (infra, domain); ตรวจสอบว่า `wire_gen.go` เหมือนเดิม

---

## Chapter 5: wire.Bind — ผูก Interface กับ Concrete Type

**Bloom levels:** Remember, Apply, Analyze

**Learning Objectives:**
1. (Remember) อธิบายว่าทำไม Wire ต้องการ `wire.Bind` เมื่อ dependency เป็น interface ได้
2. (Apply) เขียน `wire.Bind(new(MyInterface), new(*MyConcrete))` ได้ถูกต้อง
3. (Apply) รวม `wire.Bind` เข้ากับ provider set ได้
4. (Analyze) วินิจฉัยได้ว่าเมื่อไหรควรใช้ interface (testability, multiple implementations) vs struct โดยตรง

**Key Topics:**
- Wire match dependencies ด้วย type — ถ้า consumer ต้องการ `UserRepository` (interface) แต่มีแค่ `*postgresUserRepo` provider จะ fail
- `wire.Bind(new(UserRepository), new(*postgresUserRepo))` — สอง args ต้องเป็น `new(...)` เสมอ
- Concrete type (`*postgresUserRepo`) ต้องมี provider อยู่แล้วใน set/`wire.Build`
- `wire.Bind` ใส่ใน `wire.NewSet(...)` หรือ `wire.Build(...)` ได้โดยตรง
- Use case หลัก: testing (swap mock), multiple environments (prod vs stub)

**Code Snippet Ideas:**
- Interface + concrete: `type UserRepository interface { ... }` / `type postgresUserRepo struct { ... }`
- Provider for concrete: `func NewPostgresUserRepo(db *sql.DB) *postgresUserRepo`
- Bind in set: `wire.NewSet(NewPostgresUserRepo, wire.Bind(new(UserRepository), new(*postgresUserRepo)))`

**Common Pitfalls:**
1. ใช้ `wire.Bind(new(Iface), new(Concrete))` โดยไม่มี provider สำหรับ `*Concrete` — Wire ฟ้อง missing provider
2. สลับ argument order: `wire.Bind(new(*Concrete), new(Iface))` — ผิด; arg แรกคือ interface, arg สองคือ concrete

**Hands-on Deliverable:** แทนที่ struct dependency ด้วย interface, เพิ่ม `wire.Bind`, รัน `wire` สำเร็จ; เขียน second injector สำหรับ test ที่ bind mock แทน

---

## Chapter 6: wire.Struct — Field Injection

**Bloom levels:** Understand, Apply

**Learning Objectives:**
1. (Understand) อธิบายความแตกต่างระหว่าง constructor injection กับ `wire.Struct` field injection ได้
2. (Apply) ใช้ `wire.Struct(new(T), "*")` เพื่อ inject ทุก exported field ได้
3. (Apply) ใช้ `wire.Struct(new(T), "FieldA", "FieldB")` เพื่อ inject เฉพาะ field ที่เลือกได้
4. (Understand) รู้ว่า unexported fields ไม่สามารถ inject ด้วย `wire.Struct` ได้

**Key Topics:**
- `wire.Struct(new(MyHandler), "*")` — inject ทุก exported field ของ `MyHandler`
- `wire.Struct(new(MyHandler), "DB", "Logger")` — inject เฉพาะ field ที่ระบุ
- Wire สร้าง code เทียบเท่า `&MyHandler{DB: db, Logger: logger}`
- Unexported fields ถูกละเว้น; ถ้า inject field ที่ไม่มี provider Wire จะ error
- เปรียบเทียบ: `wire.Struct` เหมาะเมื่อ struct มี fields มากและไม่ต้องการเขียน constructor
- ข้อเสีย: fields ต้อง exported; ลด encapsulation เล็กน้อย

**Code Snippet Ideas:**
- Struct ที่มี 4 exported fields: `DB`, `Cache`, `Logger`, `Config`
- `wire.Struct(new(AppHandler), "*")` ใน wire.Build
- เปรียบเทียบกับ `NewAppHandler(db, cache, logger, cfg) *AppHandler`

**Common Pitfalls:**
1. คาดหวังว่า Wire จะ inject unexported field — จะถูกละเว้นอย่างเงียบ; ต้องทำให้เป็น exported หรือใช้ constructor
2. ใช้ `wire.Struct` กับ type ที่ต้องการ initialization logic — ควรใช้ constructor provider แทน

**Hands-on Deliverable:** แปลง handler struct ที่มี constructor ให้ใช้ `wire.Struct` แทน; ตรวจสอบ `wire_gen.go` ที่สร้าง

---

## Chapter 7: Cleanup Functions และ Error Handling

**Bloom levels:** Understand, Apply, Evaluate

**Learning Objectives:**
1. (Understand) อธิบาย return signature ของ provider ที่มี cleanup ได้: `(T, func())` หรือ `(T, func(), error)`
2. (Apply) เขียน provider ที่ return cleanup function สำหรับ resource เช่น DB connection, file handle ได้
3. (Understand) อธิบาย LIFO cleanup order ได้ และเหตุผลที่ใช้ LIFO
4. (Evaluate) วิเคราะห์ได้ว่า error ระหว่าง initialization จะ trigger cleanup ของ resource ที่สร้างไปก่อนหน้าอย่างไร
5. (Apply) จัดการ error จาก injector ที่มี provider error ได้ถูกต้อง

**Key Topics:**
- Provider signatures ที่ Wire รองรับ: `(T)`, `(T, error)`, `(T, func())`, `(T, func(), error)`
- Wire aggregate cleanup functions: injector return signature จะเป็น `(T, func(), error)` หรือ `(T, func())`
- **LIFO order:** cleanup รันจากหลังไปหน้า — resource ที่สร้างทีหลังถูก cleanup ก่อน (เช่น close HTTP server ก่อน close DB)
- **Error mid-initialization:** ถ้า provider B fail หลังจาก provider A สำเร็จ Wire จะรัน cleanup ของ A ก่อน return error
- Caller ต้อง `defer cleanup()` หลังเรียก injector
- ไม่ควรเรียก cleanup โดยตรงใน provider — ส่ง func กลับให้ Wire จัดการ

**Code Snippet Ideas:**
- `func NewDB(cfg Config) (*sql.DB, func(), error)` — เปิด DB, return `db.Close` เป็น cleanup
- `func NewServer(handler http.Handler) (*http.Server, func())` — return shutdown func
- Caller pattern: `app, cleanup, err := InitApp(); if err != nil { ... }; defer cleanup()`
- Diagram: cleanup call order A→B→C สร้าง, C→B→A cleanup

**Common Pitfalls:**
1. ลืม `defer cleanup()` ใน caller — resource leak; Wire สร้าง cleanup แต่ไม่รันให้อัตโนมัติ
2. Provider close resource ด้วยตัวเองแทนที่จะ return cleanup func — cleanup จะไม่ถูกรวมเข้า LIFO chain

**Hands-on Deliverable:** เพิ่ม cleanup func ให้ DB และ HTTP server provider; เขียน `main.go` ที่ `defer cleanup()` ถูกต้อง; ทดสอบ graceful shutdown ด้วย Ctrl+C

---

## Chapter 8: Multiple Injectors และ Per-Request Scoping

**Bloom levels:** Apply, Analyze, Evaluate

**Learning Objectives:**
1. (Apply) สร้าง injectors หลายตัวในหนึ่ง package สำหรับ context ต่างกัน (production, test, integration) ได้
2. (Analyze) อธิบายได้ว่า Wire ไม่มี runtime scope — "scoping" ทำด้วยการออกแบบ injector ที่รับ parameter
3. (Apply) สร้าง per-request injector ที่รับ request-scoped values เป็น parameter ได้
4. (Evaluate) เปรียบเทียบ trade-off ระหว่าง one-injector-per-request กับ passing values ผ่าน context ได้

**Key Topics:**
- Multiple injectors: สอง functions ใน `wire.go` เดียวกัน เช่น `InitAppProd()` และ `InitAppTest()`
- Injector parameters: `func InitRequestHandler(r *http.Request, db *sql.DB) *RequestHandler` — Wire inject ที่ชั้น param ไม่ได้
- **Per-request scoping — critical concept:** Wire ไม่มี `@RequestScope` แบบ Spring. วิธีที่ถูกต้องคือ เรียก injector function ทุก request, หรือ pass request-scoped data เป็น argument ให้ injector
- Provider ที่รับ `*http.Request` เป็น arg: Wire จะ require caller ส่ง request มาตอน inject
- แนะนำ: ใช้ request-scoped injector สำหรับ handler factories เท่านั้น — อย่า inject ทุกอย่าง per-request
- Test injector: swap implementations ด้วย `wire.Bind` ต่างกันใน test injector

**Code Snippet Ideas:**
- Production injector: `func InitApp(cfg Config) (*App, func(), error)`
- Test injector: `func InitTestApp(t *testing.T) (*App, func())`  
- Per-request: `func InitRequestScope(db *sql.DB, logger *slog.Logger, userID string) *RequestHandler`
- Caller ใน HTTP middleware: เรียก `InitRequestScope(db, logger, r.Header.Get("X-User-ID"))` ต้น request

**Common Pitfalls:**
1. คาดหวัง runtime scope จาก Wire — Wire เป็น code generator; สร้าง injector ให้เรียกใหม่ต่อ request แทน
2. สร้าง per-request injector ที่ include heavy singletons (DB pool) — ทำให้ recreate ทุก request; ควร pass singletons เป็น parameter

**Hands-on Deliverable:** สร้าง 2 injectors (prod + test); สร้าง per-request injector ที่รับ `*http.Request`; เขียน integration test ที่ใช้ test injector

---

## Chapter 9: Integration กับ HTTP และ gRPC

**Bloom levels:** Apply, Analyze, Evaluate

**Learning Objectives:**
1. (Apply) wire service stack สำหรับ net/http server ได้ (handler → service → repo → DB)
2. (Apply) wire gRPC server ได้ (server impl → service → repo → DB + grpc.Server)
3. (Analyze) ออกแบบ provider สำหรับ middleware chain ใน HTTP ได้
4. (Evaluate) วิเคราะห์ boundary ระหว่าง Wire-managed components กับ manually-wired config ได้

**Key Topics:**
- HTTP pattern: provider สำหรับ `*http.ServeMux` หรือ router; provider สำหรับแต่ละ handler group; injector สร้าง `*http.Server`
- gRPC pattern: provider สำหรับ `*grpc.Server`; provider register service implementation; cleanup = `server.GracefulStop`
- Middleware: provider return `func(http.Handler) http.Handler`; compose ใน server provider
- Config injection: `wire.Value(cfg)` หรือ provider function ที่ return config struct
- Package layout สำหรับ real project: `cmd/`, `internal/wire/`, `internal/handler/`, `internal/service/`, `internal/repo/`
- ประเด็น `wire.Value` vs provider function สำหรับ config
- gRPC interceptor เป็น provider ได้

**Code Snippet Ideas:**
- HTTP: `func NewHTTPServer(mux *http.ServeMux, cfg Config) (*http.Server, func())` 
- gRPC: `func NewGRPCServer(svc UserServiceServer, opts ...grpc.ServerOption) (*grpc.Server, func())`
- Provider set layout: `var HTTPSet = wire.NewSet(NewHTTPServer, NewServeMux, handler.Set)`
- `main.go` ที่สั้นมาก: `app, cleanup, err := wire.InitApp(cfg); defer cleanup(); app.Run()`

**Common Pitfalls:**
1. ใส่ `grpc.ServerOption` หรือ middleware config เป็น hardcode ใน provider — ควร inject ผ่าน Config struct
2. สร้าง circular dependency ระหว่าง server provider กับ handler provider — ตรวจ graph ก่อน; handler ต้อง depend on server ทางเดียว

**Hands-on Deliverable:** สร้าง minimal HTTP CRUD service (หรือ gRPC service) โดย wire ทุก layer; `main.go` ต้องไม่มี manual constructor calls

---

## Chapter 10 (Capstone): โปรเจกต์สุดท้าย — Wire ใน Production Service

**Bloom levels:** Create, Evaluate

**Learning Objectives:**
1. (Create) ออกแบบและสร้าง complete service ที่ใช้ทุก Wire concept ที่เรียนมาได้
2. (Create) จัด provider sets ตาม layer architecture ได้อย่างถูกต้อง
3. (Evaluate) ตรวจสอบ `wire_gen.go` ที่สร้างและอธิบาย dependency resolution ได้
4. (Evaluate) เปรียบเทียบ architecture กับ alternative DI approaches และ justify การเลือก Wire ได้

**Capstone Spec:**
Build a "Task Manager" service with:
- PostgreSQL repo layer (with cleanup)
- Service layer with interface + `wire.Bind`
- HTTP handlers with `wire.Struct`
- Config via provider function
- Prod injector + Test injector (with mock repo)
- Per-request logger injection
- Graceful shutdown (LIFO cleanup order demonstrated)

**Key Topics:**
- Integrate: Chapter 3 (providers) + 4 (sets) + 5 (bind) + 6 (struct) + 7 (cleanup) + 8 (scoping) + 9 (HTTP)
- Code review checklist: `wire_gen.go` readable, no manual constructors in `main.go`, cleanup chain correct
- Common production patterns: config loading before Wire, structured logging provider, health check endpoint wiring

**Common Pitfalls:**
1. Over-engineering provider sets — ไม่ต้องมี set ทุก package; group by what changes together
2. Forgetting to run `wire` after changing provider signatures — `wire_gen.go` outdated; add `go generate` to CI

**Hands-on Deliverable:** Submit complete repository; `wire_gen.go` committed; `go build ./...` passes; reviewer reads `wire_gen.go` and traces full dependency graph

---

## Recommended Quiz Density

**Rationale for counts:** 80% on 5 questions means one miss = fail (luck-sensitive). At 10 four-option MCQs, random guessing yields ~10% chance of passing — the threshold is genuinely earned. High-stakes mechanical chapters (build tags, provider signatures, cleanup LIFO, bind argument order) warrant more questions because a single misconception causes silent bugs in production.

| Chapter | Questions | Rationale |
|---|---|---|
| 1 | 8 | Conceptual; broader range of understanding questions |
| 2 | 12 | Mechanical: build tags, file roles, CLI workflow — high mistake surface |
| 3 | 12 | Core: provider rules, wire.Build, error diagnosis |
| 4 | 10 | Set composition, duplicate pitfalls |
| 5 | 12 | wire.Bind arg order, missing provider — critical correctness |
| 6 | 8 | wire.Struct field rules, encapsulation trade-offs |
| 7 | 14 | Cleanup LIFO order, mid-init error behavior — most complex semantics |
| 8 | 12 | Scoping misconceptions, multiple injectors |
| 9 | 10 | Integration patterns, circular dependency detection |
| 10 (Capstone) | 15 | Synthesis; scenario-based questions across all chapters |
| **Total** | **113** | Average ~11/chapter; density matches concept complexity |

**Pass threshold enforcement:** Each chapter quiz must be passed at ≥80% before unlocking the next. Capstone quiz (15 questions) requires ≥80% (12/15 correct) and is the final graduation gate.
