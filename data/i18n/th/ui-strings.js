/* ui-strings.js (TH) — UI chrome strings (engine reads these via CourseKit i18n) */
window.UI_TH = {
  'appbar.sub': 'เรียนให้เป็น expert',
  'appbar.progress': 'ผ่าน {p}/{t} บท',
  'footer': 'สร้างเพื่อการเรียนรู้ · เนื้อหา Google Wire',
  'footer.author': 'พัฒนาโดย',
  'footer.license': '© ห้ามคัดลอกหรือดัดแปลงโดยไม่ได้รับอนุญาต · พัฒนาจาก vibe code 100%',

  'nav.home': 'หน้าหลัก',

  'audience.heading': 'คอร์สนี้เหมาะกับใคร',
  'audience.level.label': 'ระดับผู้เรียน (Go)',
  'audience.level.desc': 'เหมาะกับผู้ที่เขียน Go เป็นแล้วในระดับพื้นฐานถึงกลาง และอยากเข้าใจ dependency injection ด้วย Google Wire อย่างลึกซึ้ง — ยังไม่ต้องรู้จัก Wire มาก่อน เริ่มจากศูนย์ได้เลย',
  'audience.prereq.label': 'พื้นฐานที่ควรมีมาก่อน',
  'audience.prereq.items': [
    'ไวยากรณ์ Go พื้นฐาน — <code>var</code>, <code>func</code>, <code>struct</code>, method',
    'interface และ type system ของ Go',
    'pointer (<code>*T</code>, <code>&amp;</code>) และความต่างของ value กับ pointer',
    'การจัดการ error แบบ Go — รูปแบบ <code>(T, error)</code>',
    'Go modules และคำสั่งพื้นฐาน — <code>go build</code>, <code>go run</code>, <code>go install</code>',
    'การแบ่ง package และวางโครงสร้างโปรเจกต์ Go'
  ],

  'home.eyebrow': 'Go · Dependency Injection',
  'home.title': 'เข้าใจ Google Wire ตั้งแต่ศูนย์จนเป็น expert',
  'home.lead': 'เรียนเป็นบท ทีละแนวคิด พร้อมโค้ดตัวอย่างจริงและจุดสังเกตที่เน้นชัด จบแต่ละบทมีแบบทดสอบ ต้องได้ {threshold}% ถึงถือว่าผ่าน — เลือกเรียนบทไหนก่อนก็ได้',
  'home.continue': 'เรียนต่อ บทที่',
  'home.stat.chapters': 'บทเรียน',
  'home.stat.passed': 'ผ่านแล้ว',
  'home.stat.threshold': 'เกณฑ์ผ่าน',

  'chapter.n': 'บทที่ {n}',
  'chapter.passed': 'ผ่าน',
  'chapter.best': 'คะแนนดีที่สุด {n}%',

  'diff.beginner': 'เริ่มต้น',
  'diff.intermediate': 'ระดับกลาง',
  'diff.advanced': 'ขั้นสูง',

  'lesson.kicker': 'บทที่ {n} · {diff}',
  'lesson.takeQuiz': 'ทำแบบทดสอบ',
  'lesson.reviewQuiz': 'ทบทวนแบบทดสอบ',

  'quiz.title': 'แบบทดสอบ · บทที่ {n}',
  'quiz.count': 'ข้อ {n}/{total}',
  'quiz.submit': 'ส่งคำตอบ',
  'quiz.next': 'ถัดไป',
  'quiz.prev': 'ก่อนหน้า',

  'result.pass': 'ยอดเยี่ยม! คุณผ่านบทนี้แล้ว',
  'result.fail': 'ยังไม่ผ่าน ลองอีกครั้งนะ',
  'result.detail': 'ตอบถูก {c}/{t} ข้อ · เกณฑ์ผ่าน {threshold}%',
  'result.answerKey': 'เฉลยและคำอธิบาย',
  'result.explainLabel': 'เฉลย:',
  'result.next': 'ไปบทที่ {n}',
  'result.finish': 'จบคอร์ส 🎉',
  'result.retry': 'ทำใหม่อีกครั้ง',
  'result.reviewLesson': 'ทบทวนบทเรียน',
  'result.passedShort': 'ผ่านแล้ว',
  'result.notPassed': 'ยังไม่ผ่าน',
  'result.bestDetail': 'คะแนนดีที่สุด · พยายาม {n} ครั้ง',
  'result.retake': 'ทำแบบทดสอบอีกครั้ง',

  'callout.observe': 'จุดสังเกต',
  'callout.tip': 'เคล็ดลับ',
  'callout.note': 'หมายเหตุ',
  'callout.warning': 'ระวัง',

  'soon.title': 'กำลังจัดทำ',
  'soon.body': 'เนื้อหาบทนี้กำลังถูกเขียน จะเปิดให้เรียนเร็ว ๆ นี้',

  'opt.keys': ['ก', 'ข', 'ค', 'ง', 'จ', 'ฉ']
};
