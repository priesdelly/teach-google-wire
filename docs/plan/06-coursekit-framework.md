# Design — Extract the UI/engine into a reusable course framework ("CourseKit")

> **STATUS: DONE & browser-verified** (35/35 checks, 0 console errors). Built **in-place** rather than moving the Wire course under `examples/google-wire/`: the SEO multi-page work (`05` Part B) had already put the live URLs at the repo root, so the Wire course **stays at root** (`/en/`, `/th/`, `data/`, `course.config.js`) to keep its canonical URLs, and the framework lives alongside in `core/` + `themes/editorial/`. A `examples/starter/` proves reuse (2 chapters, single locale, indigo theme override, **no engine edits**). Engine now under one namespace `window.CourseKit` (native `window.Storage` intact). Details in `07-additions.md` §10. The `examples/google-wire/` directory in the structure below is therefore conceptual — the consumer is the root.

## Context

The Google Wire site's UI + interaction engine turned out well and should be reused across future courses. We will refactor it into a **content-driven course framework** (working name **CourseKit** — changeable): the engine (block renderer, quiz, progress/storage, i18n, routing, theming) becomes reusable; a project supplies only **data + config + theme** and gets a working course site. The Wire course becomes the first example/consumer.

Locked decisions: **full framework** (engine + design system, not just CSS); **monorepo** with `core/` + `themes/` + `examples/`; **no build step** (vanilla JS/CSS via `<script>`/`<link>`, `file://` + GitHub Pages friendly). This pairs with the separate i18n+SEO design (`docs/plan/05-i18n-seo.md`): i18n and the host-driven (multi-page) routing become first-class framework features.

## Problems in today's code that block reuse (found in exploration)
- **Raw globals collide**: `window.Storage` (clashed with the native browser `Storage`!), plus `UI/Quiz/Router/App/CONFIG`. A library must live under one namespace.
- **Course-specific hardcoding** in the engine: hero copy "เข้าใจ Google Wire…", "บทเรียน", brand/title/footer in `index.html`, chapter titles in `CONFIG` (`js/ui.js:110`, `index.html:6,24,36`).
- **Theme values not fully tokenized**: literal colors outside `base.css` — `.code{background:#FFFFFF}` and `rgba(0,0,0,.05)` (`css/content.css:28,41`) and all of `css/vendor/hljs-theme.css`.
- **Hardwired content access**: engine reads `LESSONS_TH`/`QUESTIONS_TH` and a Wire-shaped `CONFIG` directly; storage prefix is hardcoded `wire:` (`js/storage.js`), so two courses on one origin would collide.

## Target structure (monorepo, no build)
```
/                         repo root = the CourseKit framework
  core/
    css/core.css          structure + components + content blocks — variables only, theme-agnostic
    js/coursekit.js       namespace + CourseKit.init() + render() + shared state
    js/storage.js         CourseKit.storage — localStorage, prefix = courseId
    js/i18n.js            CourseKit.i18n — t()/lessons()/questions(), baseLocale fallback
    js/quiz.js            CourseKit.quiz — draw/shuffle/score (MCQ built-in)
    js/render.js          CourseKit.render(view) + block registry (CourseKit.blocks.register)
    js/router-hash.js     optional default hash router (router:'none' lets host drive — used by the SEO multi-page mode)
    vendor/               highlight.js (optional; see below)
  themes/
    editorial/theme.css   the current palette + geometry + fonts (the DEFAULT look) as :root tokens
    editorial/hljs.css    syntax colors as theme tokens
  examples/
    google-wire/
      index.html          loads core + theme + its config + content; mounts CourseKit
      course.config.js    brand, courseId, passThreshold, quizSize, locales, chapters[{id,num,difficulty}]
      data/i18n/<loc>/...  the Wire content (moved here unchanged)
  docs/                   authoring-guide.md, content-schema.md, theming-guide.md
  README.md
```

## Core refactors

1. **Single namespace (fixes the global clash).** Every module becomes `(window.CourseKit = window.CourseKit || {})` and attaches there: `CourseKit.storage/i18n/quiz/render/router`. No more bare `Storage/UI/Quiz/Router/App`. App state moves to `CourseKit._state`.

2. **`CourseKit.init(config)` entry point.** Config carries everything course-specific:
   ```js
   CourseKit.init({
     courseId: 'google-wire',                 // storage prefix + sitemap id
     brand: { title, tagline, mark },          // app bar + <title> via i18n
     theme: 'editorial',
     passThreshold: 80, quizSize: 15,
     locales: ['th','en'], baseLocale: 'th',
     chapters: [{ id, num, difficulty }],      // titles come from content, not here
     mount: '#app', router: 'hash'             // 'none' = host-driven (SEO multi-page)
   })
   ```
   `js/app.js`'s bootstrap + delegated click handler move into `coursekit.js`, parameterized by config.

3. **Content contract (decouple from Wire data).** Define `CourseKit.content.register(locale, { ui, lessons, questions })`; per-locale data files call it instead of assigning `LESSONS_TH` etc. `i18n.js` reads through the registry with `baseLocale` fallback (generalize today's hardwired `_TH`). Chapter **titles** read from `lessons[chId].title` (drop `title` from `CONFIG.chapters`).

4. **Config-driven branding + i18n chrome.** Move hero/app-bar/footer/`<title>` text out of `index.html`/`ui.js` into `brand` config + per-locale `ui-strings` keys (the string-extraction work from `05-i18n-seo.md` is shared here). Engine has zero literal course text.

5. **Pluggable block renderers.** Turn `renderBlock`'s switch (`js/ui.js`) into a registry: core registers the defaults (`heading/paragraph/code/callout/list/image`); a project adds types via `CourseKit.blocks.register('quizinline', fn)` without editing core.

6. **Theme split + full tokenization.** `core.css` keeps only structural rules using `var(--*)`. Move every literal color (incl. `.code` bg, callout-code bg, and the whole `hljs-theme.css`) into `themes/editorial/`. Theming = swap the `<link>` to a different theme file or override tokens. Add syntax-color tokens (`--code-keyword`, `--code-string`, …) so hljs is themeable.

7. **Routing as a swappable concern.** Keep the hash router as the default (`router:'hash'`), but expose `CourseKit.render(view, params)` so a host can drive views directly (`router:'none'`) — this is exactly what the multi-page SEO mode in `05-i18n-seo.md` needs (each static shell sets context and calls render). One engine serves both SPA and SEO modes.

8. **Highlight.js optional.** Treat syntax highlighting as a pluggable hook (`CourseKit.config.highlight = fn`); default uses vendored hljs if present, else escapes. Keeps core lean for courses that don't show code.

## Migrate the Wire course to `examples/google-wire/`
Move current `data/`, `index.html` into the example; replace its `index.html` to load `core/` + `themes/editorial/` + `course.config.js` + content, then `CourseKit.init(...)`. **Acceptance: the existing Playwright suite (home, lesson highlights/callouts, 15-question quiz, 80% gate, unlock, persistence, 0 console errors) passes unchanged** — behavior identical, only the wiring differs.

## Naming
Use `CourseKit` for the namespace/repo (changeable before implementation). Storage keys become `${courseId}:*`.

## Verification
- **Wire example unchanged:** rerun the existing `webapp-testing` Playwright flow against `examples/google-wire/` — must pass 1:1 (this is the regression gate proving the extraction didn't change behavior).
- **Reusability proof:** scaffold a tiny second example (`examples/starter/`: 2 chapters, a couple MCQs, a re-skinned theme via token overrides) and confirm it runs from `core/` + a new theme with **no engine edits** and no build step — this is the real test that it's a framework, not a fork.
- **Namespace/global hygiene:** assert `window.CourseKit` is the only added global and the native `window.Storage` is intact.
- **Theming:** swapping the theme `<link>` restyles without touching `core/`.
- Runs from `http://` and `file://`; 0 console errors.

## Sequencing (not part of this plan's edits)
Recommend doing this **after** the in-flight Wire-accuracy review lands, and ideally fold in the `05-i18n-seo.md` i18n string-extraction (shared work) so branding/i18n are generalized once. The framework's `router:'none'` mode is the hook the SEO multi-page approach plugs into.
