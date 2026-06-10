# Technical Architecture

> As-built. This describes the system that shipped: a **multi-page static site** running on the in-house engine. (It replaces an earlier single-page hash-router design; the move to real per-page URLs is covered in `05-i18n-seo.md`.) `CLAUDE.md` is the canonical quick reference; this doc is the deeper "why it's shaped this way".

## 1. Big picture

**Multi-page static** (for SEO, no build step) on top of a theme-agnostic engine that everything attaches to via the single global `window.CourseKit`. The course supplies only **data + config + theme**; the engine renders the home page, lessons, quizzes, scoring, progress, and i18n. The course pages live **at the repo root** (so the public URLs stay at the origin root); the engine lives in `core/` + `themes/editorial/`.

```
/                              repo root = the Wire course
  index.html                   locale redirect → /en/ or /th/
  course.config.js             CourseKit.init({...}) — boots the engine
  en/  th/                     per-locale page shells (real URLs)
    index.html                 home
    chapter/<chId>/index.html  lesson (10 per locale)
  data/i18n/<loc>/
    ui-strings.js              UI_<LOC>           (chrome strings)
    chapters/lessons-chNN.js   LESSONS_<LOC>.chNN ({ title, sections:[block] })
    chapters/questions-chNN.js QUESTIONS_<LOC>.chNN ([ question ])
  sitemap.xml  robots.txt  404.html
  core/                        the engine (theme-agnostic)
    css/core.css               structure only — all values via var(--*)
    js/coursekit.js            init + boot + routing + delegated clicks
    js/render.js               render(view) + pluggable block registry
    js/quiz.js                 draw / shuffle / score
    js/storage.js              versioned localStorage, keyed by courseId
    js/i18n.js                 t / raw / lesson / questions + locale resolve
    vendor/                    highlight.min.js + go.min.js (lesson pages only)
  themes/editorial/
    theme.css                  all design tokens (the only literal hex)
    hljs.css                   syntax colors as --code-* tokens
```

There is **no build step, bundler, linter, or package manager** — files are served as-is and must work from `file://`, a static server, and GitHub Pages project subpaths.

## 2. Page model: multi-page static + in-page views

Every **indexable** page is a real file with a static SEO `<head>`; the shared JS renders the body. Quiz and results are **not** separate URLs — they are in-page hash views layered on the lesson page (keeps the file count and sitemap small).

| URL | File | View |
|-----|------|------|
| `/` | `index.html` | locale redirect (stored choice → navigator detect → `/en/` or `/th/`) |
| `/<loc>/` | `<loc>/index.html` | home (chapter grid) |
| `/<loc>/chapter/<chId>/` | `<loc>/chapter/<chId>/index.html` | lesson; `#quiz` / `#results` / `#lesson` switch the in-page view |

22 page shells total (2 locales × (1 home + 10 lessons)) + the root redirect.

**Why multi-page (not a hash SPA):** real crawlable URLs are required for SEO on a static host, and SSR/SSG would need a build step (disallowed). Hand-authored static `<head>`s per page give "good SEO" while the JS-rendered body is still indexed by Googlebot. Full rationale + the honest SEO ceiling: `05-i18n-seo.md`.

## 3. The shell contract

Each shell is thin HTML that (1) declares page context and (2) loads engine + theme + content + config in a fixed order. It sets:

```html
<script>window.PAGE = { locale: "en", view: "lesson", chapterId: "ch01", rel: "../../../" };</script>
```

`view` is `"home"` or `"lesson"`; `rel` is the relative path back to the site root so links work on `http`, GitHub Pages subpaths, and `file://`.

**Load order (must not change):** theme `theme.css` → `core/css/core.css` → `hljs.css`; then (lesson pages) `core/vendor/*` → `core/js/{coursekit,storage,i18n,quiz,render}.js` → that locale's `ui-strings.js` → that page's lesson/question data → **`course.config.js` last** (it calls `CourseKit.init` and boots on `DOMContentLoaded`). The **home** shell loads **all** `lessons-ch*.js` (for chapter titles) and **no** questions; a **lesson** shell loads only **its own** chapter's lesson + question files.

The static `<head>` carries `<title>`, description, `canonical`, `hreflang` (en/th/x-default), Open Graph, and **JSON-LD** (`Course` / `LearningResource` + `BreadcrumbList`) — see §7.

## 4. Content model (data the renderer consumes)

Content and questions are plain JS globals, **one file per chapter**, each **augmenting** the shared global rather than replacing it:

```js
(window.LESSONS_TH = window.LESSONS_TH || {}).ch04 = { title, sections: [ /* blocks */ ] };
(window.QUESTIONS_TH ||= {}).ch04 = [ /* questions */ ];
```

**Lesson:** `{ title, sections: [block] }`. Block `type`s (the only ones `render.js` supports; extend via `CourseKit.blocks.register(type, fn)`):

- `heading` `{ level, text }`
- `paragraph` `{ html }` — inline `<strong> <code> <mark> <a>`
- `code` `{ lang:'go', code, highlightLines:[n], annotations:[{line,text}] }` — highlighted line + a "จุดสังเกต" note beneath it
- `callout` `{ variant:'observe'|'tip'|'note'|'warning', title?, html }`
- `list` `{ ordered, items:[html] }` · `image` `{ src, alt, caption? }`

**Question:** `{ id, difficulty, bloomLevel, question, code?(go), options:[4 plain strings], correctAnswerIndex:0-3, explanation }`. Options are plain strings — the UI prepends A/B/C/D (or ก/ข/ค/ง) and the quiz shuffles order. Full assessment design: `03-assessment.md`.

**Why JS globals, not fetched JSON:** `fetch()` fails on `file://`; `<script>` includes work everywhere, are diff-friendly, and surface syntax errors at load. Chapter **titles** come from the lesson bundle (`CourseKit.i18n.lesson(id).title`), not from config.

## 5. State & storage (`core/js/storage.js`)

Versioned `localStorage`, **all keys prefixed with `config.courseId`** (`wire:`) so multiple courses on one origin never collide. Per chapter it tracks best score, attempts, and passed; `setCurrent`/`getCurrent` drive lesson resume. The schema is intentionally minimal (only user state, plus a `version` key for migrations).

- `isUnlocked()` returns **`true` for everything** — **chapters are open; learners may take them in any order**. There is no gating; do not re-add it (see `01-vision-scope.md` pedagogy).
- State is per-browser, no account, no cross-device (no backend by design).

## 6. i18n (`core/js/i18n.js`)

`CourseKit.i18n.t(key, vars)` / `.raw(key)` / `.lesson(id)` / `.questions(id)` read from `UI_<LOC>` / `LESSONS_<LOC>` / `QUESTIONS_<LOC>`, falling back to `config.baseLocale` for any missing bundle or string. Locale is resolved lazily: **`PAGE.locale` (URL is source of truth) → stored choice → navigator detect → `config.defaultLocale`**. A Thai device auto-detects `th`; everything else gets `en` (the default). The app-bar switch lists `config.locales` (EN first) and navigates to the sibling-locale URL, persisting the choice. Details: `05-i18n-seo.md`.

## 7. Rendering, routing & SEO head

- **Rendering (`core/js/render.js`):** `CourseKit.render(view)` builds HTML via template literals and `mount(html)` into `#app`. The block renderer is a registry; nav builds **real relative URLs** with `homeUrl()` / `chapterUrl()` from `PAGE.rel` + locale (ending in `index.html` so they work on `http`, the Pages subpath, and `file://`). Chapter cards are crawlable `<a>` links.
- **Routing (`core/js/coursekit.js`):** host-driven — it reads `window.PAGE` (no hash router). Home → render home; lesson → render by the hash (`#quiz` / `#results` / else lesson). A submitted quiz forces a fresh draw on retry. A single delegated click handler on `#app` handles quiz submit (`q-submit` → `#results`) and chapter open.
- **SEO `<head>`:** static and hand-authored per shell. Absolute SEO URLs use the origin placeholder `https://priesdelly.github.io/teach-google-wire`, **hardcoded across the 22 shells + `sitemap.xml` + `404.html`** (no build step to template it) — change it everywhere if the deploy URL differs.

## 8. Deployment (GitHub Pages)

Enable Pages on the default branch (root); the site is static and needs no workflow. Keep **all paths relative** (or `rel`-derived) — absolute `/` paths break under the project subpath `/teach-google-wire/`. Verify before deploy: `python3 -m http.server 8000` (and open an explicit `index.html` from `file://`); confirm assets load, language switch navigates to the sibling URL, `localStorage` persists across full navigations, the quiz draws 15 / scores / gates at 80%, and there are zero console/404 errors.

---

## Summary

- **Multi-page static** with real per-page URLs; quiz/results are in-page hash views.
- **One engine namespace** (`window.CourseKit`); the course supplies only data + config + theme.
- **Content** = per-chapter JS globals (`LESSONS_<LOC>` / `QUESTIONS_<LOC>`) augmented one file at a time; typed lesson blocks; flat per-locale questions.
- **State** = versioned `localStorage` keyed by `courseId`; chapters open (no gating).
- **i18n** = URL-driven locale with `baseLocale` fallback; EN default.
- **No build step**; relative paths; runs on `file://`, a static server, and GitHub Pages.
