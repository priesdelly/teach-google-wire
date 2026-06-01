/* Starter example — minimal CourseKit course (single locale, 2 chapters).
   Demonstrates reuse: only data + config + theme; no engine edits. */
CourseKit.init({
  courseId: 'starter',
  author: 'CourseKit',
  passThreshold: 50,
  quizSize: 2,
  locales: ['en'],
  defaultLocale: 'en',
  baseLocale: 'en',
  mount: '#app',
  chapters: [
    { id: 'intro',  num: 1, difficulty: 'beginner' },
    { id: 'basics', num: 2, difficulty: 'intermediate' }
  ]
});
