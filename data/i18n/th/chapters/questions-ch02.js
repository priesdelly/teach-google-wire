/* questions ch02 (TH) */
(window.QUESTIONS_TH = window.QUESTIONS_TH || {}).ch02 = [
  {
    "id": "wire-ch02-q01",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "คำสั่งใดใช้ติดตั้ง Wire CLI เวอร์ชันล่าสุด?",
    "options": [
      "go get github.com/google/wire",
      "go install github.com/google/wire@latest",
      "go download github.com/google/wire/cmd/wire",
      "go install github.com/google/wire/cmd/wire@latest"
    ],
    "correctAnswerIndex": 3,
    "explanation": "คำสั่งที่ถูกต้องคือ <code>go install github.com/google/wire/cmd/wire@latest</code> สังเกตว่า path ลงไปถึง <code>/cmd/wire</code> เพราะนั่นคือ directory ของ CLI tool ใน repository <code>go get</code> ใช้สำหรับ add dependency ใน go.mod ไม่ใช่ install tool และ <code>go download</code> ไม่มีใน Go toolchain"
  },
  {
    "id": "wire-ch02-q02",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "ไฟล์ wire_gen.go มีบทบาทอะไรใน Wire workflow?",
    "options": [
      "เป็นไฟล์ที่นักพัฒนาเขียนเพื่อประกาศ provider functions",
      "เป็นไฟล์ที่ Wire สร้างให้อัตโนมัติและถูก compile ตอน go build",
      "เป็นไฟล์ configuration สำหรับกำหนด dependency graph",
      "เป็นไฟล์ที่เก็บ interface definitions ที่ Wire ต้องการ"
    ],
    "correctAnswerIndex": 1,
    "explanation": "<code>wire_gen.go</code> คือไฟล์ที่ <strong>Wire สร้างให้อัตโนมัติ</strong> — ห้ามแก้ด้วยมือเพราะจะถูก overwrite ทุกครั้งที่รัน <code>wire</code> ไฟล์นี้มี build tag <code>//go:build !wireinject</code> ทำให้ถูก compile ตอน <code>go build</code> ปกติ ส่วน provider functions นักพัฒนาเขียนเองในไฟล์อื่น"
  },
  {
    "id": "wire-ch02-q03",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "build tag ใดที่ต้องใส่ที่บรรทัดแรกของไฟล์ wire.go (stub)?",
    "options": [
      "//go:build wireinject",
      "//go:build wire",
      "//go:build nowire",
      "//go:build !wireinject"
    ],
    "correctAnswerIndex": 0,
    "explanation": "<code>//go:build wireinject</code> คือ build tag ที่ต้องใส่บน stub file (<code>wire.go</code>) เพื่อบอก Go compiler ว่าไฟล์นี้ <em>ไม่ควรถูก compile</em> ในระหว่าง <code>go build</code> ปกติ — Wire tool เป็นตัวเดียวที่อ่านไฟล์นี้ ส่วน <code>!wireinject</code> ใช้กับ <code>wire_gen.go</code> ซึ่งตรงกันข้าม"
  },
  {
    "id": "wire-ch02-q04",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "//go:generate directive ใดที่ถูกต้องสำหรับให้ go generate รัน Wire?",
    "options": [
      "//go:generate wire",
      "//go:generate go run wire",
      "//go:generate wire gen",
      "//go:generate go wire"
    ],
    "correctAnswerIndex": 0,
    "explanation": "<code>//go:generate wire</code> คือ directive ที่ถูกต้อง — เมื่อรัน <code>go generate ./...</code> Go จะรัน <code>wire</code> ใน directory ที่มี directive นี้ ไม่ต้องระบุ subcommand เพิ่มเติม Wire CLI รู้เองว่าต้องทำอะไรเมื่อถูกรันใน directory ที่มี package ที่มี wireinject tag"
  },
  {
    "id": "wire-ch02-q05",
    "difficulty": "easy",
    "bloomLevel": "understand",
    "question": "เหตุใดจึงต้องมีบรรทัด return ใน injector stub แม้ว่า Wire จะไม่ใช้ค่านั้น?",
    "options": [
      "เพราะ Wire ใช้ค่าที่ return เพื่อตรวจสอบว่า type ถูกต้อง",
      "เพราะ Wire tool ต้องการ body ที่ valid Go syntax เพื่อ parse — return ทำให้ function signature สมบูรณ์ตาม Go grammar",
      "เพราะค่าที่ return จะถูก copy ลงใน wire_gen.go โดยตรง",
      "เพราะ Go compiler บังคับให้ function ที่ return type ไม่ใช่ void ต้องมี return ที่ return ค่าจริงเสมอ"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Wire อ่าน stub ในฐานะ Go source code ดังนั้น stub ต้องเป็น <strong>valid Go syntax</strong> — function ที่มี return type ต้องมี <code>return</code> statement มิฉะนั้น Go parser จะ reject ก่อนที่ Wire จะวิเคราะห์ได้ ค่าที่ return เช่น <code>return nil, nil</code> หรือ <code>panic(\"wire\")</code> ไม่มีความหมายใด ๆ Wire จะแทนที่ทั้ง body ด้วย code จริงใน <code>wire_gen.go</code>"
  },
  {
    "id": "wire-ch02-q06",
    "difficulty": "easy",
    "bloomLevel": "understand",
    "question": "เหตุใดจึงควร commit wire_gen.go เข้า version control?",
    "options": [
      "เพราะ Wire tool จะ fail หาก wire_gen.go ไม่มีอยู่ก่อนรันครั้งแรก",
      "เพราะ wire_gen.go เป็นไฟล์ที่นักพัฒนาเขียน จึงต้อง track ตามปกติ",
      "เพราะ Go modules บังคับให้ทุกไฟล์ .go ต้อง commit เข้า repository",
      "เพราะ go build ต้องการไฟล์นี้และหากไม่มี wire CLI ในเครื่อง build ก็ยังทำงานได้"
    ],
    "correctAnswerIndex": 3,
    "explanation": "<code>wire_gen.go</code> ควร commit เพราะมันคือ <strong>source code จริงที่ go build ใช้</strong> — ถ้าไม่ commit และ CI server หรือ teammate ไม่มี Wire CLI ติดตั้งไว้ <code>go build</code> จะ fail ทันทีเพราะขาด injector implementation นอกจากนี้ยังช่วยให้ reviewer เห็น diff เมื่อ dependency graph เปลี่ยน"
  },
  {
    "id": "wire-ch02-q07",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "อะไรจะเกิดขึ้นถ้าลืม build tag //go:build wireinject บน wire.go?",
    "options": [
      "go build จะ fail เพราะมี function เดียวกันนิยามซ้ำกันใน wire.go และ wire_gen.go",
      "Wire จะยังทำงานได้ปกติ แต่ generate code ช้าลง",
      "go build จะข้ามทั้งสองไฟล์และ link ล้มเหลวด้วย undefined symbol",
      "Wire จะ overwrite wire.go แทน wire_gen.go"
    ],
    "correctAnswerIndex": 0,
    "explanation": "เมื่อไม่มี build tag บน <code>wire.go</code> compiler จะ compile ทั้ง <code>wire.go</code> และ <code>wire_gen.go</code> พร้อมกัน ทั้งสองไฟล์มี function ที่ชื่อเหมือนกัน (injector function) ทำให้เกิด <strong>\"function redeclared\"</strong> error ทันที นี่คือเหตุผลหลักที่ build tag มีความสำคัญมาก"
  },
  {
    "id": "wire-ch02-q08",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "พิจารณา wire_gen.go ที่ Wire สร้าง ข้อใดอธิบายลักษณะของโค้ดนั้นได้ถูกต้องที่สุด?",
    "code": "// Code generated by Wire. DO NOT EDIT.\n\n//go:build !wireinject\n\npackage main\n\nfunc InitializeApp(cfg Config) (*App, error) {\n\tdb, err := NewDatabase(cfg)\n\tif err != nil {\n\t\treturn nil, err\n\t}\n\trepo := NewRepository(db)\n\tsvc := NewService(repo)\n\treturn NewApp(svc), nil\n}",
    "options": [
      "โค้ดใช้ reflection เพื่อ wire dependency ตอน runtime",
      "โค้ดต้องการ wire package ที่ runtime เพื่อ resolve dependency",
      "โค้ดสร้าง dependency แบบ lazy initialization เพื่อประหยัดเวลา",
      "โค้ดเป็น Go ธรรมดาที่อ่านได้ ไม่ต่างจากเขียนมือ และเรียงลำดับ constructor ถูกต้อง"
    ],
    "correctAnswerIndex": 3,
    "explanation": "<code>wire_gen.go</code> เป็น <strong>โค้ด Go ธรรมดา 100%</strong> ไม่มี reflection ไม่มี magic ไม่ต้องการ Wire package ตอน runtime Wire เพียงแค่คำนวณ topological order ของ constructor calls แล้ว emit เป็น Go source ลำดับที่เห็นคือ <code>NewDatabase</code> → <code>NewRepository</code> → <code>NewService</code> → <code>NewApp</code> ซึ่งถูกต้องตาม dependency graph"
  },
  {
    "id": "wire-ch02-q09",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "นักพัฒนาต้องการเพิ่ม Logger เข้าไปใน App ซึ่งต้องการ *zap.Logger เพิ่มเติม ควรทำอะไรก่อน?",
    "options": [
      "สร้าง wire_gen.go ใหม่ด้วยมือโดยเพิ่ม NewLogger call เข้าไป",
      "แก้ wire_gen.go โดยตรงเพื่อเพิ่ม NewLogger เข้าไปในลำดับ constructor calls",
      "เพิ่ม NewLogger เป็น provider ใน wire.Build ของ wire.go แล้วรัน wire ใหม่",
      "แก้ go.mod เพื่อ add zap dependency แล้ว go build จะ update wire_gen.go อัตโนมัติ"
    ],
    "correctAnswerIndex": 2,
    "explanation": "workflow ที่ถูกต้องคือ: (1) เขียน <code>NewLogger</code> provider function, (2) เพิ่ม <code>NewLogger</code> เข้าใน <code>wire.Build(...)</code> ใน <code>wire.go</code>, (3) รัน <code>wire</code> หรือ <code>go generate</code> เพื่อให้ Wire regenerate <code>wire_gen.go</code> ห้ามแก้ <code>wire_gen.go</code> โดยตรงเด็ดขาด เพราะจะถูก overwrite"
  },
  {
    "id": "wire-ch02-q10",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "ต้องการให้ go generate ./... รัน wire อัตโนมัติใน package main ควรเขียนอย่างไร?",
    "code": "//go:build wireinject\n\npackage main\n\n// ??? directive ไปที่นี่ ???\n\nimport \"github.com/google/wire\"\n\nfunc InitApp() *App {\n\twire.Build(NewConfig, NewDB, NewApp)\n\treturn nil\n}",
    "options": [
      "// generate: wire",
      "//go:generate wire",
      "// go:generate wire",
      "//generate wire"
    ],
    "correctAnswerIndex": 1,
    "explanation": "syntax ที่ถูกต้องคือ <code>//go:generate wire</code> — ต้องไม่มีช่องว่างระหว่าง <code>//</code> กับ <code>go:generate</code> และต้องมีช่องว่างหนึ่งช่องก่อนคำสั่ง (<code>wire</code>) ตัวเลือก <code>// generate: wire</code> และ <code>//generate wire</code> ไม่ใช่ valid directive ส่วน <code>// go:generate wire</code> ที่มีช่องว่างหน้า <code>go</code> ก็ไม่ถูกรับรองเช่นกัน"
  },
  {
    "id": "wire-ch02-q11",
    "difficulty": "medium",
    "bloomLevel": "understand",
    "question": "build tag //go:build !wireinject บน wire_gen.go มีความหมายว่าอย่างไร?",
    "options": [
      "ไฟล์นี้จะไม่ถูก compile เลยในทุกกรณี",
      "ไฟล์นี้จะถูก compile เฉพาะตอนที่รัน wire tool เท่านั้น",
      "ไฟล์นี้จะถูก compile ทุกสถานการณ์ยกเว้นตอนที่ wire tool อ่าน package",
      "ไฟล์นี้จะถูก compile เฉพาะใน test environment เท่านั้น"
    ],
    "correctAnswerIndex": 2,
    "explanation": "<code>!wireinject</code> คือ logical NOT ของ <code>wireinject</code> tag ซึ่งหมายความว่าไฟล์นี้ถูก compile ในทุก build ที่ไม่ได้ set tag <code>wireinject</code> ไว้ — นั่นคือ <code>go build</code>, <code>go test</code>, <code>go run</code> ทั้งหมด กลไกนี้ตรงข้ามกับ <code>wire.go</code> ที่มีแค่ <code>wireinject</code> (ไม่มี <code>!</code>) และจะถูก exclude ออกในทุก build ปกติ"
  },
  {
    "id": "wire-ch02-q12",
    "difficulty": "medium",
    "bloomLevel": "analyze",
    "question": "นักพัฒนาแก้ไข wire_gen.go เพื่อ optimize การสร้าง database connection และ push ขึ้น Git จากนั้นหนึ่งสัปดาห์ต่อมาทีมรัน go generate ./... อะไรจะเกิดขึ้นกับการแก้ไขนั้น?",
    "options": [
      "Wire จะสร้างไฟล์ใหม่ชื่อ wire_gen_v2.go แทนที่จะ overwrite",
      "Wire จะ overwrite wire_gen.go ทั้งไฟล์และการแก้ไขทั้งหมดจะหายไป",
      "Wire จะ fail พร้อม error ว่าไฟล์ถูกแก้ไขด้วยมือ",
      "การแก้ไขจะถูกเก็บรักษาเพราะ Wire merge กับโค้ดที่มีอยู่"
    ],
    "correctAnswerIndex": 1,
    "explanation": "<code>wire</code> จะ <strong>overwrite wire_gen.go ทั้งไฟล์</strong> ทุกครั้งที่รัน ไม่มีกลไก merge หรือ preserve manual changes Wire generate ไฟล์ใหม่จาก stub เสมอ ดังนั้นการ optimize หรือแก้ใด ๆ ใน <code>wire_gen.go</code> จะหายทันที ถ้าต้องการ optimize ให้ทำที่ provider function ใน stub ไม่ใช่ generated file"
  },
  {
    "id": "wire-ch02-q13",
    "difficulty": "medium",
    "bloomLevel": "analyze",
    "question": "พิจารณา wire.go ต่อไปนี้: อะไรผิดในโค้ดนี้?",
    "code": "package main\n\nimport \"github.com/google/wire\"\n\nfunc InitializeApp() *App {\n\twire.Build(NewConfig, NewDB, NewApp)\n\treturn nil\n}",
    "options": [
      "wire.Build ต้องมีอย่างน้อย 5 provider จึงจะทำงานได้",
      "injector function ต้องเป็น exported เสมอจึงจะใช้กับ Wire ได้",
      "ไม่มีอะไรผิด โค้ดนี้ถูกต้องสมบูรณ์",
      "ขาด build tag //go:build wireinject ที่ต้องอยู่บนสุดของไฟล์"
    ],
    "correctAnswerIndex": 3,
    "explanation": "โค้ดนี้ <strong>ขาด build tag</strong> <code>//go:build wireinject</code> บนสุดของไฟล์ ผลที่ตามมาคือ <code>go build</code> จะ compile ไฟล์นี้พร้อมกับ <code>wire_gen.go</code> ทำให้เกิด \"function redeclared\" error เพราะ <code>InitializeApp</code> ถูกประกาศสองครั้ง Wire ไม่ได้กำหนดจำนวน provider ขั้นต่ำและ injector function ไม่จำเป็นต้อง exported"
  },
  {
    "id": "wire-ch02-q14",
    "difficulty": "medium",
    "bloomLevel": "apply",
    "question": "project มีหลาย package ที่ใช้ Wire ควรรัน wire อย่างไรให้ครอบคลุมทุก package พร้อมกัน?",
    "options": [
      "Wire รองรับแค่ package เดียวต่อ project จึงต้อง merge providers ทั้งหมดไว้ที่เดียว",
      "รัน wire ใน root directory และ Wire จะ scan ทุก subdirectory อัตโนมัติ",
      "สร้าง Makefile แล้วรัน wire ใน directory แต่ละ package ทีละตัว",
      "ใส่ //go:generate wire ในทุก package แล้วรัน go generate ./... จาก root"
    ],
    "correctAnswerIndex": 3,
    "explanation": "วิธีที่ถูกต้องและ idiomatic คือใส่ <code>//go:generate wire</code> ในแต่ละ package ที่ใช้ Wire แล้วรัน <code>go generate ./...</code> จาก root — Go toolchain จะ recursively รัน generate directive ทุกอันใน project <code>wire</code> CLI จะไม่ scan subdirectory เองโดยอัตโนมัติ ต้องอาศัย go generate เพื่อ dispatch"
  },
  {
    "id": "wire-ch02-q15",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "ทีมมี wire.go ที่ถูกต้องและ wire_gen.go ที่ถูก commit แล้ว แต่ CI server ไม่ได้ติดตั้ง wire CLI ผลลัพธ์เมื่อรัน go build บน CI จะเป็นอย่างไร?",
    "options": [
      "Build สำเร็จ แต่ wire_gen.go จะถูก regenerate อัตโนมัติโดย go build",
      "Build fail เพราะ build tag wireinject ต้องการ wire CLI เพื่อ resolve",
      "Build สำเร็จ เพราะ go build ใช้ wire_gen.go ที่ commit ไว้โดยไม่ต้องการ wire CLI",
      "Build fail เพราะ go build ต้องการ wire CLI อยู่ใน PATH เสมอ"
    ],
    "correctAnswerIndex": 2,
    "explanation": "<code>go build</code> ทำงานกับ Go source files เท่านั้น ไม่ต้องการ Wire CLI เลย <code>wire_gen.go</code> ที่ commit ไว้มี build tag <code>//go:build !wireinject</code> ซึ่งทำให้ถูก compile ปกติ ส่วน <code>wire.go</code> ที่มี <code>//go:build wireinject</code> จะถูกข้ามไป ดังนั้น <code>go build</code> บน CI สำเร็จโดยไม่ต้องมี wire CLI — นี่คือเหตุผลหนึ่งที่ต้อง commit <code>wire_gen.go</code>"
  },
  {
    "id": "wire-ch02-q16",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "นักพัฒนาเพิ่ม provider ใหม่ใน wire.Build แต่ลืมรัน wire หลังจากนั้น เมื่อรัน go build ผลจะเป็นอย่างไร?",
    "options": [
      "go build สำเร็จและใช้ wire_gen.go เก่าที่ไม่มี provider ใหม่นั้น",
      "Wire จะ detect ความไม่ตรงกันและ error พร้อม hint ให้รัน wire ใหม่",
      "go build จะรัน wire อัตโนมัติก่อน compile เพื่อ update wire_gen.go",
      "go build fail ทันทีเพราะ wire.go และ wire_gen.go ไม่ sync กันเสมอ"
    ],
    "correctAnswerIndex": 0,
    "explanation": "<code>go build</code> ไม่รัน <code>wire</code> อัตโนมัติ มันเพียง compile source files ที่มีอยู่เท่านั้น ผลคือ <code>wire_gen.go</code> เก่าที่ไม่มี provider ใหม่จะถูก compile แทน ถ้า provider ใหม่นั้นสำคัญต่อ dependency chain อาจเกิด compile error จาก missing type หรือแย่กว่านั้นคือ compile สำเร็จแต่พฤติกรรม runtime ไม่ถูกต้อง ควรใส่ <code>go generate ./...</code> ในขั้นตอน CI เพื่อป้องกัน"
  },
  {
    "id": "wire-ch02-q17",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "พิจารณา wire.go ต่อไปนี้ ข้อใดอธิบาย throwaway return ที่ถูกต้องที่สุด?",
    "code": "//go:build wireinject\n\npackage main\n\nimport \"github.com/google/wire\"\n\nfunc InitApp(cfg Config) (*App, error) {\n\twire.Build(NewConfig, NewDB, NewApp)\n\treturn nil, nil\n}",
    "options": [
      "nil, nil บอก Wire ว่า function สามารถ return error ได้ Wire จะ add error handling",
      "Wire จะ copy return nil, nil ลงใน wire_gen.go เป็น fallback เมื่อ error",
      "Wire ใช้ nil ตัวแรกเพื่อกำหนด default value ของ *App และ nil ตัวสองเพื่อบอกว่าไม่มี cleanup",
      "return nil, nil เป็นแค่ placeholder เพื่อให้ stub เป็น valid Go syntax — Wire แทนที่ body ทั้งหมดใน wire_gen.go"
    ],
    "correctAnswerIndex": 3,
    "explanation": "<code>return nil, nil</code> (หรือ <code>panic(\"wire\")</code> หรือค่าใด ๆ ที่ type-correct) เป็นเพียง <strong>placeholder</strong> ที่ทำให้ <code>wire.go</code> เป็น valid Go syntax ที่ compiler และ Wire tool parse ได้ Wire <em>ไม่สนใจ</em>ค่าที่ return เลย เมื่อ Wire สร้าง <code>wire_gen.go</code> มันจะเขียน body ทั้งหมดใหม่จาก dependency graph โดยไม่ reference ค่า placeholder ใด ๆ"
  },
  {
    "id": "wire-ch02-q18",
    "difficulty": "hard",
    "bloomLevel": "apply",
    "question": "ทีมต้องการ pin Wire เป็น version v0.6.0 สำหรับทุกเครื่องใน team ควรทำอย่างไร?",
    "options": [
      "สร้างไฟล์ wire.version ใน root project ที่ระบุ v0.6.0",
      "ระบุ go install github.com/google/wire/cmd/wire@v0.6.0 ใน onboarding docs และ CI config",
      "ใส่ //go:build wire:v0.6.0 ใน wire.go เพื่อกำหนด version constraint",
      "เพิ่ม github.com/google/wire v0.6.0 เข้า go.mod และ go build จะติดตั้ง wire CLI อัตโนมัติ"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Wire CLI เป็น <strong>external tool</strong> ไม่ใช่ module dependency ใน <code>go.mod</code> ดังนั้นจึงต้อง pin version ผ่านคำสั่ง install โดยตรง: <code>go install github.com/google/wire/cmd/wire@v0.6.0</code> ควรระบุคำสั่งนี้ใน onboarding docs, Makefile, และ CI configuration เพื่อให้ทุกคนใช้ version เดียวกัน <code>go.mod</code> ไม่ควบคุม tool versions และไม่มี syntax version constraint ใน build tag"
  },
  {
    "id": "wire-ch02-q19",
    "difficulty": "hard",
    "bloomLevel": "apply",
    "question": "นักพัฒนาต้องการให้ wire.go รองรับทั้ง Go 1.17+ (ที่ใช้ //go:build) และ Go 1.16 ลงไป (ที่ใช้ // +build) ควรเขียนอย่างไรที่ถูกต้อง?",
    "code": "// ตัวเลือก A:\n//go:build wireinject\npackage main\n\n// ตัวเลือก B:\n// +build wireinject\n//go:build wireinject\npackage main\n\n// ตัวเลือก C:\n//go:build wireinject\n// +build wireinject\n\npackage main\n\n// ตัวเลือก D:\n//go:build wireinject\n\n// +build wireinject\npackage main",
    "options": [
      "ตัวเลือก A — ใช้แค่รูปแบบใหม่เพียงพอ",
      "ตัวเลือก B — รูปแบบเก่าต้องมาก่อนเสมอ",
      "ตัวเลือก C — รูปแบบใหม่ก่อน จากนั้นรูปแบบเก่า แล้วมีบรรทัดว่างก่อน package",
      "ตัวเลือก D — สองรูปแบบอยู่คนละกลุ่มโดยมีบรรทัดว่างคั่น"
    ],
    "correctAnswerIndex": 2,
    "explanation": "Go specification กำหนดว่าถ้าใส่ทั้งสองรูปแบบ ต้องมีรูปแบบใหม่ (<code>//go:build</code>) ก่อน ตามด้วยรูปแบบเก่า (<code>// +build</code>) แล้วต้องมี <strong>บรรทัดว่างหนึ่งบรรทัด</strong> คั่นก่อน <code>package</code> declaration เสมอ — ถ้าไม่มีบรรทัดว่าง Go parser จะ treat comment นั้นเป็น package doc comment ไม่ใช่ build constraint ตัวเลือก C เป็นรูปแบบที่ถูกต้อง"
  },
  {
    "id": "wire-ch02-q20",
    "difficulty": "hard",
    "bloomLevel": "analyze",
    "question": "Wire ใช้หลักการใดในการกำหนดลำดับ constructor calls ใน wire_gen.go?",
    "options": [
      "Wire เรียงตามลำดับที่นักพัฒนาระบุใน wire.Build — ลำดับนั้นสำคัญมาก",
      "Wire เรียงตาม alphabetical order ของ function name เพื่อ reproducibility",
      "Wire วิเคราะห์ parameter types ของแต่ละ provider แล้ว topological sort เพื่อให้ dependency ถูกสร้างก่อนเสมอ",
      "Wire เรียงตาม file modification timestamp ของแต่ละ provider"
    ],
    "correctAnswerIndex": 2,
    "explanation": "Wire ใช้ <strong>topological sort</strong> บน dependency graph ที่สร้างจาก return types และ parameter types ของ provider functions — ถ้า <code>NewRepository</code> ต้องการ <code>*sql.DB</code> Wire รู้ว่า <code>NewDatabase</code> (ที่ return <code>*sql.DB</code>) ต้องรันก่อน ลำดับใน <code>wire.Build</code> ไม่มีผลต่อ generated code เลย Wire จัดการลำดับให้เองทั้งหมด"
  },
  {
    "id": "wire-ch02-q21",
    "difficulty": "medium",
    "bloomLevel": "remember",
    "question": "wire_gen.go ที่ Wire สร้างมีบรรทัดใดอยู่ที่บรรทัดแรกเสมอ?",
    "options": [
      "package main",
      "import \"github.com/google/wire\"",
      "// Code generated by Wire. DO NOT EDIT.",
      "//go:generate wire"
    ],
    "correctAnswerIndex": 2,
    "explanation": "Wire จะ emit <code>// Code generated by Wire. DO NOT EDIT.</code> เป็นบรรทัดแรกเสมอ นี่เป็น convention ของ Go generated files ที่ช่วยบอก developer, linter, และ code review tools ว่าไฟล์นี้ไม่ควรแก้ด้วยมือ และ <code>golangci-lint</code> จะ skip ไฟล์ที่มี comment นี้โดยอัตโนมัติ"
  },
  {
    "id": "wire-ch02-q22",
    "difficulty": "easy",
    "bloomLevel": "remember",
    "question": "ข้อใดอธิบายบทบาทของ Wire CLI ในระหว่าง go build ได้ถูกต้อง?",
    "options": [
      "Wire CLI ถูกเรียกโดย go build เพื่อ resolve dependency graph ก่อน compile",
      "Wire CLI ทำงานเป็น background process ระหว่าง go build เพื่อตรวจสอบ type",
      "Wire CLI ถูก embed ไว้ใน go binary เพื่อ validate wire_gen.go ตอน link",
      "Wire CLI ไม่ได้ทำงานระหว่าง go build เลย — ต้องรันแยกก่อนด้วย go generate หรือโดยตรง"
    ],
    "correctAnswerIndex": 3,
    "explanation": "<code>wire</code> CLI <strong>ไม่ได้ทำงานระหว่าง <code>go build</code></strong> เลย มันต้องถูกรันแยกก่อนด้วย <code>wire</code> หรือ <code>go generate</code> เพื่อสร้าง <code>wire_gen.go</code> จากนั้น <code>go build</code> จึง compile <code>wire_gen.go</code> ตามปกติ Wire tool ไม่มีอยู่ใน binary และไม่ถูก embed ใด ๆ"
  }
];
