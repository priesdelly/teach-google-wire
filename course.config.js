/* Google Wire course — CourseKit configuration.
   Loaded last (after core + content); boots the engine via CourseKit.init.
   courseId 'wire' keeps the existing `wire:*` localStorage keys. */
CourseKit.init({
  courseId: 'wire',
  author: 'Priesdelly',
  authorUrl: 'https://github.com/priesdelly',
  passThreshold: 80,        // percent required to pass a quiz
  quizSize: 15,             // questions drawn per attempt (bank holds more)
  locales: ['en', 'th'],
  defaultLocale: 'en',      // English by default for new visitors
  baseLocale: 'en',         // fallback bundle when a locale is missing strings/content
  localeLabels: { th: 'ไทย', en: 'EN' },
  mount: '#app',
  chapters: [
    { id: 'ch01', num: 1,  difficulty: 'beginner' },
    { id: 'ch02', num: 2,  difficulty: 'beginner' },
    { id: 'ch03', num: 3,  difficulty: 'intermediate' },
    { id: 'ch04', num: 4,  difficulty: 'intermediate' },
    { id: 'ch05', num: 5,  difficulty: 'intermediate' },
    { id: 'ch06', num: 6,  difficulty: 'intermediate' },
    { id: 'ch07', num: 7,  difficulty: 'advanced' },
    { id: 'ch08', num: 8,  difficulty: 'advanced' },
    { id: 'ch09', num: 9,  difficulty: 'advanced' },
    { id: 'ch10', num: 10, difficulty: 'advanced' }
  ]
});
