# CourseKit

A vanilla **content-driven course engine** — no build step, no framework, runs from `file://` and GitHub Pages. A course supplies **data + config + theme**; CourseKit renders the home page, lessons, quizzes, scoring, progress, and i18n.

Everything attaches to one global, `window.CourseKit` (so it never collides with the native `window.Storage`).

## Make a new course

```
your-course/
  course.config.js          CourseKit.init({...})
  theme.css                 (optional) token overrides
  data/
    ui-strings.js           window.UI_<LOC>        (chrome strings)
    lessons.js              window.LESSONS_<LOC>   ({ chId: { title, sections:[block] } })
    questions.js            window.QUESTIONS_<LOC> ({ chId: [ question ] })
  <loc>/index.html                       home shell
  <loc>/chapter/<chId>/index.html        lesson shell
```

Each **shell** is static HTML that (1) declares its page context and (2) loads core + theme + content + config, in this order:

```html
<script>window.PAGE = { locale: "en", view: "lesson", chapterId: "ch01", rel: "../../../" };</script>
...
<link rel="stylesheet" href="…/themes/editorial/theme.css">   <!-- tokens -->
<link rel="stylesheet" href="…/your-course/theme.css">         <!-- optional overrides -->
<link rel="stylesheet" href="…/core/css/core.css">             <!-- structure -->
<link rel="stylesheet" href="…/themes/editorial/hljs.css">     <!-- syntax (code courses) -->
...
<script src="…/core/vendor/highlight.min.js"></script>         <!-- code courses only -->
<script src="…/core/js/coursekit.js"></script>
<script src="…/core/js/storage.js"></script>
<script src="…/core/js/i18n.js"></script>
<script src="…/core/js/quiz.js"></script>
<script src="…/core/js/render.js"></script>
<script src="…/your-course/data/ui-strings.js"></script>
<script src="…/your-course/data/lessons.js"></script>
<script src="…/your-course/data/questions.js"></script>       <!-- lesson shells only -->
<script src="…/your-course/course.config.js"></script>         <!-- LAST: calls init, boots -->
```

`PAGE`: `view` is `"home"` or `"lesson"`; `rel` is the relative path back to the course root (so links work on http, GitHub Pages subpaths, and `file://`). Quiz and results are in-page hash views (`#quiz` / `#results`) on the lesson shell — no extra files.

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

All design values are CSS custom properties defined in a theme (`themes/editorial/theme.css`): palette, geometry, fonts, and `--code-*` syntax tokens. Re-skin by either swapping that `<link>` or loading a small override file after it (see `examples/starter/theme.css`). `core/css/core.css` contains only structural rules referencing `var(--*)` — never edit it to restyle.

## Examples

- `examples/google-wire/` → the Wire course **lives at the repo root** (`/en/`, `/th/`, `data/`, `course.config.js`) so its public SEO URLs stay at the origin root.
- `examples/starter/` → a minimal 2-chapter, single-locale course with an indigo theme override — proof that a new course runs on `core/` with **zero engine edits**.
