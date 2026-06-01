/* Starter lessons — same block shapes the engine renders. */
window.LESSONS_EN = {
  intro: {
    title: 'What is CourseKit?',
    sections: [
      { type: 'heading', level: 2, text: 'A content-driven course engine' },
      { type: 'paragraph', html: 'CourseKit renders lessons and quizzes from plain data. A course supplies <strong>data + config + theme</strong> and gets a working site — no build step.' },
      { type: 'callout', variant: 'tip', html: 'This whole page is rendered by <code>core/</code> with an indigo theme override.' },
      { type: 'code', lang: 'js', code: 'CourseKit.init({\n  courseId: "starter",\n  chapters: [{ id: "intro", num: 1, difficulty: "beginner" }]\n});', highlightLines: [2], annotations: [{ line: 2, text: 'the <b>courseId</b> namespaces localStorage' }] }
    ]
  },
  basics: {
    title: 'Authoring content',
    sections: [
      { type: 'heading', level: 2, text: 'Blocks and questions' },
      { type: 'paragraph', html: 'Lessons are arrays of <mark>blocks</mark>: headings, paragraphs, code, callouts, lists, and images.' },
      { type: 'list', ordered: true, items: ['Write lessons in <code>lessons.js</code>', 'Write a question bank in <code>questions.js</code>', 'Point a shell at <code>core/</code> and a theme'] }
    ]
  }
};
