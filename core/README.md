# Course engine (`core/`)

A vanilla **content-driven course engine**, internal to this project — no build step, no framework, runs from `file://` and GitHub Pages. The course supplies **data + config + theme**; the engine renders the home page, lessons, quizzes, scoring, progress, and i18n.

Everything attaches to one global, `window.CourseKit` (so it never collides with the native `window.Storage`).

## Course layout

```
/                           repo root = the course
  course.config.js          CourseKit.init({...})
  data/i18n/<loc>/
    ui-strings.js                window.UI_<LOC>             (chrome strings)
    chapters/lessons-chNN.js     window.LESSONS_<LOC>.chNN   ({ title, sections:[block] })
    chapters/questions-chNN.js   window.QUESTIONS_<LOC>.chNN ([ question ])
  <loc>/index.html                       home shell
  <loc>/chapter/<chId>/index.html        lesson shell
```

Each **shell** is static HTML that (1) declares its page context and (2) loads core + theme + content + config, in this order:

```html
<script>window.PAGE = { locale: "en", view: "lesson", chapterId: "ch01", rel: "../../../" };</script>
...
<link rel="stylesheet" href="…/themes/editorial/theme.css">   <!-- tokens -->
<link rel="stylesheet" href="…/core/css/core.css">             <!-- structure -->
<link rel="stylesheet" href="…/themes/editorial/hljs.css">     <!-- syntax -->
...
<script src="…/core/vendor/highlight.min.js"></script>         <!-- lesson shells only -->
<script src="…/core/js/coursekit.js"></script>
<script src="…/core/js/storage.js"></script>
<script src="…/core/js/i18n.js"></script>
<script src="…/core/js/quiz.js"></script>
<script src="…/core/js/render.js"></script>
<script src="…/data/i18n/<loc>/ui-strings.js"></script>
<script src="…/data/i18n/<loc>/chapters/lessons-chNN.js"></script>
<script src="…/data/i18n/<loc>/chapters/questions-chNN.js"></script> <!-- lesson shells only -->
<script src="…/course.config.js"></script>                     <!-- LAST: calls init, boots -->
```

`PAGE`: `view` is `"home"` or `"lesson"`; `rel` is the relative path back to the site root (so links work on http, GitHub Pages subpaths, and `file://`). Quiz and results are in-page hash views (`#quiz` / `#results`) on the lesson shell — no extra files. The **home** shell loads **all** `lessons-ch*.js` (for chapter titles) and no questions; a **lesson** shell loads only its own chapter's two files.

## `CourseKit.init(config)`

```js
CourseKit.init({
  courseId: 'your-course',   // localStorage prefix — keeps courses on one origin separate
  author: 'You',             // shown in the footer (optional)
  passThreshold: 80,         // % to pass a quiz
  quizSize: 15,              // questions drawn per attempt (bank may hold more)
  locales: ['en'],           // first entry leads the language switch; 1 locale hides it
  defaultLocale: 'en',
  baseLocale: 'en',          // fallback bundle for missing strings/content
  localeLabels: { en: 'EN' },// switch labels (optional)
  mount: '#app',
  chapters: [{ id: 'ch01', num: 1, difficulty: 'beginner' }]  // titles come from lessons, not here
});
```

## Content schema

A **lesson** is `{ title, sections: [block] }`. Block types (`CourseKit.blocks.register(type, fn)` adds more):

- `heading` `{ level, text }`
- `paragraph` `{ html }` — inline `<strong> <code> <mark> <a>`
- `code` `{ lang, code, highlightLines:[n], annotations:[{line,text}] }`
- `callout` `{ variant:'observe'|'tip'|'note'|'warning', title?, html }`
- `list` `{ ordered, items:[html] }`
- `image` `{ src, alt, caption? }`

A **question**: `{ id, question, code?, options:[4 strings], correctAnswerIndex, explanation }`. Options are plain strings — the engine adds A/B/C/D (from `opt.keys`) and shuffles question + option order, remapping the correct index.

The optional **"who is this for"** panel renders only if `ui-strings` defines `audience.heading` (+ `audience.level.*`, `audience.prereq.*`).

## Theming

All design values are CSS custom properties defined in a theme (`themes/editorial/theme.css`): palette, geometry, fonts, and `--code-*` syntax tokens. Re-skin by either swapping that `<link>` or loading a small override file after it. `core/css/core.css` contains only structural rules referencing `var(--*)` — never edit it to restyle.
