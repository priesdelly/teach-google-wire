/* lessons ch02 (TH) */
(window.LESSONS_TH = window.LESSONS_TH || {}).ch02 = {
  "title": "รู้จัก Google Wire และการติดตั้ง",
  "sections": [
    {
      "type": "heading",
      "level": 2,
      "text": "Wire CLI คืออะไร และอยู่ที่ไหนใน Workflow"
    },
    {
      "type": "paragraph",
      "html": "<mark>Wire</mark> คือ <strong>command-line tool</strong> ที่ทำหน้าที่เดียวและทำได้ดีมาก: อ่าน injector stub ที่นักพัฒนาเขียนไว้ วิเคราะห์ dependency graph แล้ว <strong>สร้าง Go source code</strong> ที่ wire dependency ให้ครบถ้วน Wire ไม่ได้เป็น library ที่รันใน production binary — มันทำงานในช่วง <code>go generate</code> ก่อน compile จริง และผลลัพธ์คือไฟล์ <code>wire_gen.go</code> ที่เป็นโค้ด Go ธรรมดาอ่านได้"
    },
    {
      "type": "callout",
      "variant": "note",
      "title": "Wire อยู่ที่ไหนใน Build Pipeline",
      "html": "<strong>1. นักพัฒนาเขียน</strong> provider functions และ injector stub (<code>wire.go</code>)<br><strong>2. รัน <code>wire</code></strong> (หรือ <code>go generate</code>) → Wire สร้าง <code>wire_gen.go</code><br><strong>3. รัน <code>go build</code></strong> → compiler รวม <code>wire_gen.go</code> เข้า binary ตามปกติ<br>Wire tool ไม่มีอยู่ใน binary เลย — มีแค่โค้ดที่มันสร้างไว้เท่านั้น"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "ติดตั้ง Wire CLI"
    },
    {
      "type": "paragraph",
      "html": "Wire CLI ติดตั้งด้วยคำสั่ง <code>go install</code> เดียว ไม่ต้องการ dependency พิเศษใด ๆ ขอแค่มี Go 1.19+ และ <code>$GOPATH/bin</code> (หรือ <code>$GOBIN</code>) อยู่ใน <code>$PATH</code> เท่านั้น:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// รันใน terminal (ไม่ใช่ใน Go file)\ngo install github.com/google/wire/cmd/wire@latest\n\n// ตรวจสอบว่าติดตั้งสำเร็จ\nwire --version\n// ควรแสดง: wire: version vX.X.X",
      "highlightLines": [2, 5],
      "annotations": [
        {
          "line": 2,
          "text": "<code>@latest</code> ดึง version ล่าสุดเสมอ — เปลี่ยนเป็น <code>@v0.6.0</code> (หรือ version ที่ต้องการ) เพื่อ pin version"
        },
        {
          "line": 5,
          "text": "ถ้ารัน <code>wire</code> แล้ว shell บอก \"command not found\" ให้ตรวจว่า <code>$(go env GOPATH)/bin</code> อยู่ใน PATH หรือยัง"
        }
      ]
    },
    {
      "type": "callout",
      "variant": "tip",
      "title": "Pin Version ใน Team Project",
      "html": "สำหรับ project ที่มีทีมหลายคน ควร pin version ของ Wire เพื่อให้ทุกคน generate code ที่เหมือนกัน เช่น <code>go install github.com/google/wire/cmd/wire@v0.6.0</code> และกำหนด version เดียวกันใน CI pipeline ด้วย"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "โมเดลสองไฟล์: wire.go และ wire_gen.go"
    },
    {
      "type": "paragraph",
      "html": "หัวใจของการทำงานกับ Wire คือการแยกไฟล์ออกเป็นสองส่วนที่ชัดเจน: <mark>wire.go</mark> ที่นักพัฒนาเขียนเอง (stub) กับ <mark>wire_gen.go</mark> ที่ Wire สร้างให้ (generated) สองไฟล์นี้อยู่ใน package เดียวกัน แต่ตัวเลือกว่าไฟล์ไหนจะถูก compile ในแต่ละสถานการณ์นั้นถูกควบคุมด้วย <strong>build tag</strong>"
    },
    {
      "type": "list",
      "ordered": false,
      "items": [
        "<strong>wire.go</strong> — เขียนด้วยมือ, มี build tag <code>//go:build wireinject</code>, เป็น input ให้ Wire อ่าน, <em>ไม่</em>ถูก compile ตอน <code>go build</code>",
        "<strong>wire_gen.go</strong> — สร้างโดย Wire อัตโนมัติ, มี build tag <code>//go:build !wireinject</code>, ถูก compile ตอน <code>go build</code>, <em>ห้าม</em>แก้ด้วยมือ"
      ]
    },
    {
      "type": "heading",
      "level": 3,
      "text": "ไฟล์ wire.go — Injector Stub ที่เขียนด้วยมือ"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "//go:build wireinject\n// +build wireinject\n\npackage main\n\nimport (\n\t\"github.com/google/wire\"\n)\n\n//go:generate wire\n\n// InitializeApp คือ injector function\n// Wire จะอ่าน wire.Build ใน body แล้วสร้าง wire_gen.go\nfunc InitializeApp(cfg Config) (*App, error) {\n\twire.Build(\n\t\tNewDatabase,\n\t\tNewRepository,\n\t\tNewService,\n\t\tNewApp,\n\t)\n\treturn nil, nil // throwaway: Wire แทนที่ body ทั้งหมด\n}",
      "highlightLines": [1, 2, 10, 15, 21],
      "annotations": [
        {
          "line": 1,
          "text": "<b>จำเป็นมาก</b>: build tag นี้บอก Go compiler ว่า \"อย่า compile ไฟล์นี้ตอน go build\" — Wire เป็นเครื่องมือเดียวที่อ่านไฟล์นี้"
        },
        {
          "line": 2,
          "text": "บรรทัด <code>// +build wireinject</code> คือรูปแบบเก่า (Go 1.16 ลงไป) — ใส่ทั้งคู่เพื่อ compatibility หรือใส่แค่บรรทัดแรกถ้าใช้ Go 1.17+"
        },
        {
          "line": 10,
          "text": "<code>//go:generate wire</code> บอก <code>go generate</code> ว่าให้รัน <code>wire</code> ใน directory นี้ — รัน <code>go generate ./...</code> จาก root project ได้เลย"
        },
        {
          "line": 15,
          "text": "<code>wire.Build(...)</code> คือจุดที่สำคัญที่สุด — list ของ provider functions ทั้งหมดที่ Wire จะใช้สร้าง dependency graph"
        },
        {
          "line": 21,
          "text": "<code>return nil, nil</code> คือ throwaway value — Wire ไม่สนค่านี้เลย มีไว้แค่เพื่อให้ stub compile ได้เมื่อรัน Wire tool"
        }
      ]
    },
    {
      "type": "callout",
      "variant": "warning",
      "title": "Pitfall: ลืม Build Tag บน wire.go",
      "html": "ถ้าลืม <code>//go:build wireinject</code> บน <code>wire.go</code> ผลที่ตามมาคือ Go compiler จะพยายาม compile stub body (<code>wire.Build(...); return nil, nil</code>) พร้อมกัน <em>กับ</em> <code>wire_gen.go</code> ทำให้เกิด <strong>duplicate function definition error</strong> เพราะ function เดียวกันถูกประกาศสองครั้ง"
    },
    {
      "type": "heading",
      "level": 3,
      "text": "ไฟล์ wire_gen.go — โค้ดที่ Wire สร้างให้"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// Code generated by Wire. DO NOT EDIT.\n\n//go:build !wireinject\n// +build !wireinject\n\npackage main\n\n// Injectors from wire.go:\n\n// InitializeApp คือ injector function ที่ Wire สร้างให้\nfunc InitializeApp(cfg Config) (*App, error) {\n\tdb, err := NewDatabase(cfg)\n\tif err != nil {\n\t\treturn nil, err\n\t}\n\trepo := NewRepository(db)\n\tsvc := NewService(repo)\n\tapp := NewApp(svc)\n\treturn app, nil\n}",
      "highlightLines": [1, 3, 12, 16, 17, 18],
      "annotations": [
        {
          "line": 1,
          "text": "<b>อย่าแก้ไฟล์นี้ด้วยมือ</b> — comment \"DO NOT EDIT\" ไม่ใช่แค่คำแนะนำ แต่เป็นกฎเหล็ก ทุกครั้งที่รัน <code>wire</code> ไฟล์นี้จะถูก overwrite ทั้งหมด"
        },
        {
          "line": 3,
          "text": "<code>!wireinject</code> (logical NOT) หมายความว่าไฟล์นี้ถูก compile <em>ทุกครั้งยกเว้น</em>ตอนที่รัน Wire tool — กลไกตรงข้ามกับ wire.go"
        },
        {
          "line": 12,
          "text": "Wire เรียง constructor calls ตาม topological order อัตโนมัติ — <code>NewDatabase</code> ต้องรันก่อน <code>NewRepository</code> และ Wire รู้เองโดยดูจาก parameter types"
        },
        {
          "line": 16,
          "text": "นี่คือโค้ด Go <b>ธรรมดา 100%</b> — ไม่มี magic, ไม่มี reflection, อ่านได้และ debug ได้เหมือน code ที่เขียนมือ"
        }
      ]
    },
    {
      "type": "callout",
      "variant": "warning",
      "title": "Pitfall: แก้ wire_gen.go ด้วยมือ",
      "html": "นักพัฒนาบางคนแก้ <code>wire_gen.go</code> โดยตรงเพราะมันเป็น Go ธรรมดาและดูแก้ง่าย แต่ <strong>การเปลี่ยนแปลงทั้งหมดจะหายไป</strong> ทันทีที่รัน <code>wire</code> ครั้งถัดไป ถ้าต้องการเปลี่ยนพฤติกรรม ให้แก้ที่ <strong>provider function</strong> หรือ <strong>wire.go stub</strong> เสมอ"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "วิธีที่ Wire วิเคราะห์ Dependency Graph"
    },
    {
      "type": "paragraph",
      "html": "เมื่อรัน <code>wire</code> ใน directory ที่มี <code>wire.go</code> Wire จะทำขั้นตอนเหล่านี้โดยอัตโนมัติ:"
    },
    {
      "type": "list",
      "ordered": true,
      "items": [
        "<strong>อ่าน stub</strong> — Wire สแกน package หา function ที่มี body เป็น <code>wire.Build(...)</code> และมี build tag <code>wireinject</code>",
        "<strong>เก็บ provider list</strong> — รวบรวม provider functions ทั้งหมดจาก <code>wire.Build(...)</code>",
        "<strong>วิเคราะห์ return type</strong> — แต่ละ provider function ถูกจับคู่โดย return type ของมัน (Wire ใช้ type เป็น \"key\")",
        "<strong>สร้าง dependency graph</strong> — Wire ดู parameter ของแต่ละ provider เพื่อรู้ว่า provider ไหนต้องรันก่อน",
        "<strong>Topological sort</strong> — เรียงลำดับ constructor calls ที่ถูกต้องจาก graph",
        "<strong>สร้าง wire_gen.go</strong> — emit Go source code ที่เรียก constructor ตามลำดับที่ถูกต้อง พร้อม error handling"
      ]
    },
    {
      "type": "callout",
      "variant": "observe",
      "title": "จุดสังเกต: Wire Match ด้วย Type ไม่ใช่ชื่อ",
      "html": "Wire จับคู่ provider กับ dependency โดยใช้ <strong>Go type</strong> เป็น key — ถ้ามี provider สอง function ที่ return <code>*sql.DB</code> ทั้งคู่ Wire จะฟ้อง <em>\"duplicate provider\"</em> error ทันที และถ้าไม่มี provider ที่ return type ที่ต้องการ Wire จะฟ้อง <em>\"missing provider\"</em> — ทั้งสองกรณีเกิดตอน run <code>wire</code> ก่อน <code>go build</code>"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "go:generate Wire — Automation ใน One Line"
    },
    {
      "type": "paragraph",
      "html": "แทนที่จะรัน <code>wire</code> ด้วยมือทุกครั้ง ให้ใส่ <code>//go:generate wire</code> ไว้ใน package เพื่อให้ <code>go generate ./...</code> จาก root project รัน wire ให้ทุก package พร้อมกัน:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "//go:build wireinject\n\npackage main\n\n//go:generate wire\n\nimport \"github.com/google/wire\"\n\nfunc InitializeApp(cfg Config) (*App, error) {\n\twire.Build(NewDatabase, NewRepository, NewService, NewApp)\n\treturn nil, nil\n}",
      "highlightLines": [5],
      "annotations": [
        {
          "line": 5,
          "text": "<code>//go:generate wire</code> บรรทัดเดียวนี้ทำให้ <code>go generate ./...</code> รัน <code>wire</code> ใน directory นี้โดยอัตโนมัติ — ใส่ใน CI เพื่อให้ wire_gen.go ไม่ outdate"
        }
      ]
    },
    {
      "type": "callout",
      "variant": "tip",
      "title": "Commit wire_gen.go เข้า VCS เสมอ",
      "html": "ต่างจาก build artifact ทั่วไป <code>wire_gen.go</code> ควร commit เข้า Git เพราะ:<br>1. ทำให้ <code>go build</code> ทำงานได้โดยไม่ต้องมี wire CLI ในเครื่อง (เช่น production build server)<br>2. Code reviewer เห็น diff ของ generated code เมื่อ dependency เปลี่ยน<br>3. ป้องกัน build fail หาก wire version ต่างกันใน team"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Build Tag wireinject: กลไกที่ทำให้ทุกอย่างทำงาน"
    },
    {
      "type": "paragraph",
      "html": "Build tag คือคำสั่งให้ Go compiler รู้ว่าจะ compile ไฟล์ไหนในสถานการณ์ใด Wire ใช้ build tag <code>wireinject</code> เป็น switch ควบคุมว่าไฟล์ไหนถูก compile ในแต่ละ mode:"
    },
    {
      "type": "code",
      "lang": "go",
      "code": "// === wire.go — ถูก compile เฉพาะตอน Wire tool อ่าน ===\n//go:build wireinject\n\n// สถานะ: excluded จาก go build ปกติ\n// Wire tool จะตั้งค่า wireinject tag เองตอนวิเคราะห์ package\n\n// === wire_gen.go — ถูก compile ตอน go build ===\n//go:build !wireinject\n\n// !wireinject = ทุก build ที่ไม่ใช่ Wire tool\n// ดังนั้น go build, go test, go run จะใช้ไฟล์นี้เสมอ",
      "highlightLines": [2, 8],
      "annotations": [
        {
          "line": 2,
          "text": "เมื่อ Go compiler เห็น <code>//go:build wireinject</code> และ build ปกติไม่ได้ set tag <code>wireinject</code> ไว้ → ไฟล์นี้ถูกข้ามโดยสมบูรณ์"
        },
        {
          "line": 8,
          "text": "<code>!wireinject</code> เป็น true สำหรับ build ทุกชนิดที่ไม่ใช่ Wire tool — ดังนั้น <code>go build</code>, <code>go test</code>, <code>go run</code> ล้วน compile wire_gen.go"
        }
      ]
    },
    {
      "type": "callout",
      "variant": "observe",
      "title": "จุดสังเกต: ทำไม wire.go ต้องมีทั้งสองบรรทัด",
      "html": "ใน Go 1.17+ build tag ใช้รูปแบบใหม่: <code>//go:build wireinject</code><br>ใน Go 1.16 ลงไปใช้: <code>// +build wireinject</code><br>เพื่อ backward compatibility หลาย project ใส่ทั้งสองบรรทัดในไฟล์ wire.go ต้องมีบรรทัดว่างคั่นระหว่าง build tag กับ <code>package</code> declaration มิฉะนั้น Go จะ treat comment นั้นเป็น doc comment ไม่ใช่ build constraint"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "สรุปบทที่ 2: Mental Model ที่ถูกต้อง"
    },
    {
      "type": "paragraph",
      "html": "หลังจากบทนี้ให้จดจำ mental model สำคัญ: <mark>wire.go</mark> คือ <strong>spec</strong> ที่บอกว่าต้องการ wire อะไร — <mark>wire_gen.go</mark> คือ <strong>implementation</strong> ที่ Wire สร้างจาก spec นั้น เมื่อ dependency เปลี่ยน ให้แก้ <code>wire.go</code> หรือ provider แล้วรัน <code>wire</code> ใหม่เสมอ ไม่ต้องแตะ <code>wire_gen.go</code> เลย ในบทถัดไปเราจะเรียนรู้เรื่อง provider function อย่างละเอียด รวมถึง <code>wire.Build</code> และการ trace dependency graph"
    }
  ]
};
