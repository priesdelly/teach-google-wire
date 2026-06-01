/* Starter question banks (plain strings; engine adds A/B/C/D and shuffles). */
window.QUESTIONS_EN = {
  intro: [
    { id: 's-intro-1', difficulty: 'easy', question: 'What does a course supply to CourseKit?', options: ['A compiled bundle', 'Data, config, and a theme', 'A backend server', 'A database schema'], correctAnswerIndex: 1, explanation: 'Just data + config + theme — the engine does the rest.' },
    { id: 's-intro-2', difficulty: 'easy', question: 'Does CourseKit need a build step?', options: ['Yes, webpack', 'Yes, a bundler', 'No — plain HTML/JS/CSS', 'Only for production'], correctAnswerIndex: 2, explanation: 'It runs from file:// and static hosts with no build.' },
    { id: 's-intro-3', difficulty: 'easy', question: 'What namespaces a course’s localStorage?', options: ['courseId', 'the page URL', 'the theme name', 'the locale'], correctAnswerIndex: 0, explanation: 'Keys are prefixed with config.courseId so courses never collide.' }
  ],
  basics: [
    { id: 's-basics-1', difficulty: 'easy', question: 'What is a lesson made of?', options: ['HTML strings only', 'An array of blocks', 'Markdown files', 'A single template'], correctAnswerIndex: 1, explanation: 'Lessons are arrays of typed blocks.' },
    { id: 's-basics-2', difficulty: 'easy', question: 'How do you add a new block type?', options: ['Edit core/render.js', 'CourseKit.blocks.register(type, fn)', 'You cannot', 'Recompile the engine'], correctAnswerIndex: 1, explanation: 'The block renderer is a pluggable registry.' },
    { id: 's-basics-3', difficulty: 'easy', question: 'Where do quiz options get their A/B/C/D labels?', options: ['In the data', 'From the engine via opt.keys', 'From the theme', 'They are hardcoded'], correctAnswerIndex: 1, explanation: 'Options are plain strings; the UI adds keys from opt.keys.' }
  ]
};
