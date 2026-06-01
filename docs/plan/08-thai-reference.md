# Thai language reference (canonical values — keep these exact)

The plan docs are written in **English**, but the product ships **Thai + English**. This file freezes the **Thai-specific values** so they survive doc translation and stay consistent. When something must appear in Thai, it must match what is recorded here.

**Source of truth:** `data/i18n/th/ui-strings.js` (`UI_TH`). If that file and this doc ever disagree, the code wins — update this doc to match, never the reverse silently. Lesson/question Thai content lives in `data/i18n/th/chapters/*`.

> Convention: keep words that are natural in English **in English even inside Thai text** — e.g. `Go`, `provider`, `injector`, `build tag`, `dependency injection`, `interface`, `pointer`, `package`, `module`, `expert`, `wire.Build`. Do **not** transliterate these.

## Domain terminology (Thai ↔ English)

| Concept | Thai (canonical) | English |
|---|---|---|
| The amber "look here" cue | **จุดสังเกต** | Key point / observe |
| Tip / best practice | เคล็ดลับ | Tip |
| Note / aside | หมายเหตุ | Note |
| Warning / pitfall | ระวัง | Warning |
| Difficulty: beginner | เริ่มต้น | Beginner |
| Difficulty: intermediate | ระดับกลาง | Intermediate |
| Difficulty: advanced | ขั้นสูง | Advanced |
| Chapter | บท / บทที่ {n} | Chapter {n} |
| Lesson | บทเรียน | Lesson |
| Quiz | แบบทดสอบ | Quiz |
| Question (counter) | ข้อ | Q / Question |
| Pass | ผ่าน | Pass / Passed |
| Pass mark / threshold | เกณฑ์ผ่าน | Pass mark |
| Answer key + explanation | เฉลยและคำอธิบาย / เฉลย | Answers & explanations / Answer |

**Multiple-choice option keys** — Thai uses Thai consonants, not A/B/C/D:

| Index | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| Thai (`opt.keys`) | ก | ข | ค | ง | จ | ฉ |
| English | A | B | C | D | E | F |

## UI strings (`UI_TH` ↔ `UI_EN`)

`{...}` placeholders are interpolated by the engine and **must be preserved verbatim** in both languages.

| Key | Thai | English |
|---|---|---|
| `appbar.sub` | เรียนให้เป็น expert | learn it like an expert |
| `appbar.progress` | ผ่าน {p}/{t} บท | Passed {p}/{t} chapters |
| `footer` | สร้างเพื่อการเรียนรู้ · เนื้อหา Google Wire | Made for learning · Google Wire content |
| `footer.author` | พัฒนาโดย | Built by |
| `footer.license` | CC BY-NC-ND 4.0 · ใช้เพื่อการศึกษาฟรี ห้ามใช้เชิงพาณิชย์/ดัดแปลงโดยไม่ได้รับอนุญาต · พัฒนาจาก vibe code 100% | CC BY-NC-ND 4.0 · free for educational use · no commercial use or derivatives without permission · 100% vibe-coded |
| `nav.home` | หน้าหลัก | Home |
| `audience.heading` | คอร์สนี้เหมาะกับใคร | Who is this course for? |
| `audience.level.label` | ระดับผู้เรียน (Go) | Your Go level |
| `audience.prereq.label` | พื้นฐานที่ควรมีมาก่อน | What you should already know |
| `home.eyebrow` | Go · Dependency Injection | Go · Dependency Injection |
| `home.title` | เข้าใจ Google Wire ตั้งแต่ศูนย์จนเป็น expert | Understand Google Wire from zero to expert |
| `home.continue` | เรียนต่อ บทที่ | Continue learning — Chapter |
| `home.stat.chapters` | บทเรียน | Chapters |
| `home.stat.passed` | ผ่านแล้ว | Passed |
| `home.stat.threshold` | เกณฑ์ผ่าน | Pass mark |
| `chapter.n` | บทที่ {n} | Chapter {n} |
| `chapter.passed` | ผ่าน | Passed |
| `chapter.best` | คะแนนดีที่สุด {n}% | Best score {n}% |
| `diff.beginner` | เริ่มต้น | Beginner |
| `diff.intermediate` | ระดับกลาง | Intermediate |
| `diff.advanced` | ขั้นสูง | Advanced |
| `lesson.kicker` | บทที่ {n} · {diff} | Chapter {n} · {diff} |
| `lesson.takeQuiz` | ทำแบบทดสอบ | Take the quiz |
| `lesson.reviewQuiz` | ทบทวนแบบทดสอบ | Review the quiz |
| `quiz.title` | แบบทดสอบ · บทที่ {n} | Quiz · Chapter {n} |
| `quiz.count` | ข้อ {n}/{total} | Q {n}/{total} |
| `quiz.submit` | ส่งคำตอบ | Submit |
| `quiz.next` | ถัดไป | Next |
| `quiz.prev` | ก่อนหน้า | Back |
| `result.pass` | ยอดเยี่ยม! คุณผ่านบทนี้แล้ว | Excellent! You passed this chapter |
| `result.fail` | ยังไม่ผ่าน ลองอีกครั้งนะ | Not yet — give it another try |
| `result.detail` | ตอบถูก {c}/{t} ข้อ · เกณฑ์ผ่าน {threshold}% | Correct {c}/{t} · pass mark {threshold}% |
| `result.answerKey` | เฉลยและคำอธิบาย | Answers & explanations |
| `result.explainLabel` | เฉลย: | Answer: |
| `result.next` | ไปบทที่ {n} | Go to Chapter {n} |
| `result.finish` | จบคอร์ส 🎉 | Finish course 🎉 |
| `result.retry` | ทำใหม่อีกครั้ง | Try again |
| `result.reviewLesson` | ทบทวนบทเรียน | Review the lesson |
| `result.passedShort` | ผ่านแล้ว | Passed |
| `result.notPassed` | ยังไม่ผ่าน | Not passed |
| `result.bestDetail` | คะแนนดีที่สุด · พยายาม {n} ครั้ง | Best score · {n} attempts |
| `result.retake` | ทำแบบทดสอบอีกครั้ง | Retake the quiz |
| `callout.observe` | จุดสังเกต | Key point |
| `callout.tip` | เคล็ดลับ | Tip |
| `callout.note` | หมายเหตุ | Note |
| `callout.warning` | ระวัง | Warning |
| `soon.title` | กำลังจัดทำ | Coming soon |
| `soon.body` | เนื้อหาบทนี้กำลังถูกเขียน จะเปิดให้เรียนเร็ว ๆ นี้ | This chapter is being written and will be available soon. |

### `audience.prereq.items` (array — order matters; `<code>` HTML preserved)

| # | Thai | English |
|---|---|---|
| 1 | ไวยากรณ์ Go พื้นฐาน — `var`, `func`, `struct`, method | Basic Go syntax — `var`, `func`, `struct`, methods |
| 2 | interface และ type system ของ Go | Interfaces and Go's type system |
| 3 | pointer (`*T`, `&`) และความต่างของ value กับ pointer | Pointers (`*T`, `&`) and value vs pointer |
| 4 | การจัดการ error แบบ Go — รูปแบบ `(T, error)` | Go-style error handling — the `(T, error)` pattern |
| 5 | Go modules และคำสั่งพื้นฐาน — `go build`, `go run`, `go install` | Go modules and basic commands — `go build`, `go run`, `go install` |
| 6 | การแบ่ง package และวางโครงสร้างโปรเจกต์ Go | Splitting packages and structuring a Go project |

## Invariants when adding a Thai locale or editing content

- **Code snippets are identical across locales** — only comments (English), prose, annotations, options, and explanations are translated. Never translate Go identifiers or keywords.
- `opt.keys` length must cover the max options per question (currently 4 used; ก–ฉ provided).
- Preserve every `{placeholder}` and any inline HTML (`<code>`, `<strong>`, `<mark>`, `&amp;`) exactly.
- "จุดสังเกต" is tied to the **amber** observe callout + highlighted code line — it is the signature "look here" cue; keep the word consistent everywhere.
