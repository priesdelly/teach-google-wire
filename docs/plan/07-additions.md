# Implemented additions (beyond the original plans)

Record of features built after `04-architecture.md` / `05-i18n-seo.md`. All items below are **implemented and browser-verified** (Playwright via the `webapp-testing` skill, 0 console errors). Files are relative to repo root.

---

## 1. Home — "Who is this course for?" panel
A panel between the hero and the chapter grid that states the target audience and prerequisites.
- **Level meter**: 3 steps (Beginner · Intermediate · Advanced) with Beginner + Intermediate highlighted → course targets basic-to-intermediate Go.
- **Prerequisites checklist** (6 items with ✓ icons + inline `<code>` chips): Go syntax, interfaces/type system, pointers & value-vs-pointer, `(T, error)` error handling, Go modules/commands, package structure.
- i18n-driven: keys `audience.*` in `data/i18n/<loc>/ui-strings.js` (`audience.prereq.items` is an array via `I18n.raw`). Rendered in `renderHome` (`js/ui.js`). Styles `.audience` / `.levelmeter` / `.checklist` in `css/components.css`.

## 2. Footer — license + author
Three centered lines, i18n-driven (`js/app.js` sets them on boot):
- brand line (`footer`),
- **author**: "Built by **Priesdelly**" (`footer.author` + styled `<strong>`),
- **license**: "© No copying or reuse without permission · 100% vibe-coded" (`footer.license`).
Markup in `index.html` (`#appfoot-text/-author/-license`), styles in `css/layout.css`.

## 3. AI-no-training signals
Good-faith opt-out (not technical enforcement):
- `<head>` meta in `index.html`: `robots="noai, noimageai"`, `googlebot="noai, noimageai"`, `tdm-reservation="1"`.
- `robots.txt` blocking known AI crawlers (GPTBot, ClaudeBot, Google-Extended, CCBot, PerplexityBot, Bytespider, …) while allowing normal indexing.
- **Caveat**: only crawlers that choose to honor these are affected; doesn't prevent scraping. On GitHub Pages *project* paths `robots.txt` may not be read (must sit at domain root); the meta tags work per-page regardless. True enforcement would need a backend (out of scope).

## 4. Responsive (now MANDATORY)
Every screen must work down to **320px (iPhone SE)** with zero horizontal overflow; verify at 320 & 375 on home/lesson/quiz/results. Rule + hard-won gotchas recorded in `CLAUDE.md` ("Responsive (MANDATORY)").
- Fixes applied: grid/flex children need `min-width: 0`; the prerequisites checklist uses **block items + absolute ✓ icon** (not grid); inline `<code>` chips stay `white-space: nowrap` while surrounding text wraps; never `overflow-wrap: anywhere` on mixed text; code blocks scroll inside `.code__scroll`; the app-bar progress bar is hidden ≤640px.

## 5. i18n core — engine fully de-hardcoded (was `05` Part A)
- All UI chrome moved out of `js/ui.js` into `UI_TH` / `UI_EN`; read via `I18n.t(key, vars)` / `I18n.raw(key)`.
- Locale-ized constants: option keys (ก/ข/ค/ง ↔ A/B/C/D), difficulty labels, callout titles.
- Chapter **titles** now come from the lesson bundle (`I18n.lesson(id).title`), removed from `CONFIG.chapters`.
- `js/i18n.js` falls back to `CONFIG.baseLocale` for any missing bundle/string.
- App-bar **language switch** lists `CONFIG.locales` (reloads on change).

## 6. Bilingual content + English default
- Full **EN translation** of all 10 chapters under `data/i18n/en/chapters/` (`LESSONS_EN` / `QUESTIONS_EN`, 207 questions). Code kept identical (English comments); structure/ids/`correctAnswerIndex`/`highlightLines` preserved 1:1 with Thai.
- `index.html` loads both locales' chapter scripts (per-page lean loading deferred to `05` multi-page).
- `CONFIG.defaultLocale = 'en'`, `baseLocale = 'en'`, `<html lang="en">`, English `<title>`/description.
- **Bug fixed**: `Storage.getLocale()` hardcoded `'th'`, which masked `defaultLocale`; now returns `null` so `CONFIG.defaultLocale` wins. (Noted in `CLAUDE.md` — do not reintroduce a hardcoded default.)

## 7. Locale auto-detection + EN-first switch
- `CONFIG.locales = ['en','th']` → **EN appears first** in the switcher.
- Initial locale (`js/i18n.js` `detect()`): a stored choice wins; otherwise read `navigator.languages` — a **Thai device → `th`**, anything else → `CONFIG.defaultLocale` (`en`). Choice persists in `localStorage`.

## 8. Lesson resume (per browser, no server)
- Opening a chapter saves it via `Storage.setCurrent` (`js/app.js` `open-chapter`).
- Home hero shows a **Continue** button (`home.continue`, `.hero__continue`) linking to `Storage.getCurrent()` — returning learners resume their last chapter.
- All state (locale, progress/scores, last chapter) lives in `localStorage` → per-browser only, no cross-device (no backend by design).

---

## 9. SEO multi-page (was `05` Part B)
Converted the hash-SPA into a **multi-page static site** (no build step), browser-verified:
- **Real URLs**: `/index.html` (locale redirect → stored choice / navigator detect), `/<loc>/index.html` (home), `/<loc>/chapter/<chId>/index.html` (lessons) — 22 page shells (EN+TH). Quiz & results are **in-page hash views** (`#quiz`/`#results`/`#lesson`), not separate URLs.
- **Static SEO head** per page (pre-JS): `<title>`, description, `canonical`, `hreflang` (en/th/x-default), Open Graph, **JSON-LD** (Course / LearningResource). Plus `sitemap.xml` (22 URLs w/ hreflang), `robots.txt` (Sitemap + AI blocks), `404.html`.
- **Engine**: page-driven via `window.PAGE = {locale, view, chapterId, rel}`; `js/router.js` renders by view + in-chapter hash; `js/ui.js` builds **real relative URLs** (`homeUrl()/chapterUrl()`, ending `index.html`) that work on http, GitHub Pages subpath, and `file://`; chapter cards are crawlable `<a>`. Language switch navigates to the sibling-locale URL. Locale from `PAGE.locale` (URL is source of truth).
- **Caveats**: SEO origin is the hardcoded placeholder `https://priesdelly.github.io/teach-google-wire` across all shells + sitemap + 404 (no build step to template it — update if the deploy URL differs); pretty directory URLs need a static server / GitHub Pages (file:// requires opening an explicit `index.html`).

## 10. CourseKit framework extraction (was `06`)
Extracted the engine into a reusable, namespaced framework **in place** (no build step), browser-verified (35/35, 0 console errors):
- **Single namespace** `window.CourseKit` (`.config/.storage/.i18n/.quiz/.render/.blocks`, state in `._state`). Fixes the old `window.Storage` clash with the native browser global and removes the bare `UI/Quiz/Router/App/CONFIG/I18n` globals.
- **`core/`** — `css/core.css` (structure only, all `var(--*)`), `js/{coursekit,storage,i18n,quiz,render}.js`, `vendor/` (highlight.js). `coursekit.js` = `CourseKit.init(config)` + boot + delegated clicks + host-driven routing (merges old `app.js` + `router.js`). Block renderers are a registry (`CourseKit.blocks.register`); syntax highlighting is pluggable (`config.highlight`).
- **`themes/editorial/`** — `theme.css` (all tokens: palette, geometry, fonts, `--on-accent`, `--code-bg`, grain, and `--code-*` syntax tokens) + `hljs.css` (syntax via those tokens). Re-skin by swapping the link or overriding tokens.
- **Config-driven**: `course.config.js` calls `CourseKit.init({ courseId, author, passThreshold, quizSize, locales, defaultLocale, baseLocale, localeLabels, mount, chapters })`. `courseId` prefixes localStorage (Wire uses `'wire'` → existing keys preserved). Content stays in the course-agnostic `UI_<LOC>` / `LESSONS_<LOC>` / `QUESTIONS_<LOC>` global convention; the audience panel is optional (renders only if `audience.heading` exists).
- **Wire course** = the consumer at repo root (shells now load `core/` + `themes/editorial/` + `course.config.js`; old `js/` + `css/` + `data/config.js` deleted). **`examples/starter/`** = reuse proof: 2 chapters, single locale, indigo token-override theme, zero engine edits.
- Minor framework fix found by the starter: `.appbar__lang[hidden] { display:none }` so single-locale courses hide the switch (the `display:flex` rule was overriding the `hidden` attribute). Authoring guide: `core/README.md`.

### Status of the standing designs
- `05-i18n-seo.md` — **Part A DONE** (§5–8) and **Part B DONE** (§9). Fully shipped.
- `06-coursekit-framework.md` — **DONE** (§10), built in-place. Fully shipped.
