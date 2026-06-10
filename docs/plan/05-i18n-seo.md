# Design — Multi-language (i18n) + SEO with NO build step

## Context

The course site is currently a single-page app: hash routing (`#/chapter/ch01`), all content rendered client-side from JS data, UI chrome **hardcoded in Thai** inside `js/ui.js`. We want to (1) support multiple languages (Thai now, English next, more later) and (2) get **good SEO** — while keeping the **hard constraints**: plain HTML/JS/CSS, **no backend, no framework, and NO build step** (this is now fixed and non-negotiable), deployable to GitHub Pages, runnable from `file://`.

The tension: real SSR is impossible on GitHub Pages (static host), and SSG would need a generator = a build step (disallowed). So the design achieves the best SEO reachable **without any generation**: real per-page URLs + fully static, hand-authored `<head>` SEO metadata per page, with the body rendered by the existing shared JS (which Google indexes). Locked decisions from discussion: **no build step (fixed)**; **Go code snippets stay identical across languages — only comments are English, only prose/annotations/options/explanations get translated**; **TH + EN first** (broader script/RTL scope deferred to a later discussion).

## Approach

Two independent parts. Part A (i18n core) is needed regardless. Part B converts routing to multi-page static for SEO.

### Part A — i18n core (de-hardcode Thai)

> **STATUS: DONE & browser-verified**, plus extras beyond this plan — full EN translation of all chapters, **English default**, navigator-based auto-detect (Thai device → th, else en), EN-first switcher, and lesson resume. Part B (SEO multi-page) below is also done.

1. **Extract every hardcoded Thai string from `js/ui.js` into `UI_<LOC>` bundles** (`data/i18n/<loc>/ui-strings.js`) and render via the existing `I18n.t(key, vars)` (it already supports `{var}` interpolation — `js/i18n.js`). ~35 strings across: appbar progress (`'ผ่าน {p}/{t} บท'`), home hero (title/lead/stats), chapter status (done/locked/best-score), lesson kicker `'บทที่ {n}'` + nav + quiz CTA, quiz title/`'ข้อ {n}/{total}'`/prev-next-submit, results verdict (pass/fail)/`'ตอบถูก {c}/{t}'`/explanation label/action buttons/stored summary, coming-soon, locked.
2. **Locale-ize the constant maps in `js/ui.js`** — move into the `UI_<LOC>` bundle and read through `I18n`: `OPT_KEYS` (ก/ข/ค/ง ↔ A/B/C/D), `DIFF` (เริ่มต้น/กลาง/ขั้นสูง ↔ Beginner/…), `CALLOUT` default titles (จุดสังเกต/เคล็ดลับ/หมายเหตุ/ระวัง). Icons (emoji) stay shared.
3. **Move chapter display titles out of `data/config.js`** — `CONFIG.chapters` keeps only `{id, num, difficulty}`. Titles come from the active-locale lesson bundle (`I18n.lesson(id).title`, already per-locale). Update the three reads in `js/ui.js` (home card, lesson `<h1>`, coming-soon) to use the bundle title with a `num`-only fallback.
4. **Language switcher** in the app bar, populated from `CONFIG.locales`; selecting a locale persists via `Storage.setLocale` (exists) and navigates to the same page in the target locale (real link — Part B). Add `CONFIG.baseLocale` (default `'th'`) as the fallback bundle (generalize `bundle()` fallback in `js/i18n.js`, currently hardwired to `_TH`).
5. **Per-locale `<html lang>` + `dir`** set from a small per-locale entry (`dir` defaults `ltr`; reserved for future RTL).

### Part B — Multi-page static for SEO (no generation)

> **STATUS: DONE & verified.** 22 real page URLs (`/<loc>/`, `/<loc>/chapter/<chId>/`) + root locale redirect + `sitemap.xml` + `robots.txt` (with Sitemap + AI blocks) + `404.html`. Each shell carries static `<title>`/canonical/hreflang/OG/JSON-LD and `window.PAGE`; engine is page-driven; quiz/results are in-page hash views; nav uses real relative URLs (work on http / GitHub Pages subpath / file://). SEO origin is hardcoded as `https://teach-google-wire.priesdelly.com` — change it across the shells + sitemap + 404 if the deploy URL differs.

Replace hash routing with **real directory URLs**, one hand-authored static HTML shell per indexable page. Only SEO-valuable pages become real files; quiz/results stay client-side views (they don't need indexing) to keep file count down.

**URL / file layout (source files, committed — not generated):**
```
/index.html                       → language picker / redirect to /<baseLocale>/
/<loc>/index.html                 → home (chapter list)            [SEO page]
/<loc>/chapter/<chId>/index.html  → lesson (10 per locale)         [SEO page]
sitemap.xml  robots.txt           → static, list all real URLs
404.html                          → SPA-style fallback for unknown paths
```
Quiz + results render as **in-page client views** layered on the chapter page (e.g. a `?quiz` query or in-page state toggle), reusing existing `UI.renderQuiz/renderResults` + `js/quiz.js` — no separate URL.

**Each shell is thin (~25 lines) and carries the SEO-critical static head:**
- unique `<title>` + `<meta name=description>`, `<link rel=canonical>`
- `<link rel=alternate hreflang=…>` for every locale of that page (+ `x-default`)
- Open Graph / Twitter tags; **JSON-LD** (`Course` / `LearningResource` + `BreadcrumbList`)
- correct `<html lang>`/`dir`; a `<main id=app>` mount + `<noscript>` summary
- an inline `window.PAGE = { locale, view, chapterId }` so the shared JS knows what to render **from the path** (no hash router needed — delete/replace `js/router.js` with a tiny path-context bootstrap in `js/app.js`)
- `<script>` tags load only what the page needs: `config.js`, that locale's `ui-strings.js`, **only this chapter's** lesson+question files, vendor highlight.js, app modules. (This also retires the earlier "runtime loader" question — each static page hard-includes its own scripts, so per-page payload is lean and there is no dynamic loader.)

**Navigation** between pages is plain `<a href="/<loc>/chapter/<chId>/">` → real, crawlable. Cross-page state (progress, results, locale, unlock) already lives in `localStorage` (`js/storage.js`), shared across same-origin pages — so progress survives full navigations unchanged.

**GitHub Pages base path:** project pages serve under `/teach-google-wire/`. Use root-relative URLs computed against a single `<base href>` (or a `CONFIG.basePath`) so the same files work locally (`file://` → relative) and on Pages. Document the one gotcha (absolute `/` paths break under the project subpath).

### Honest SEO ceiling (no build step)
Fully optimized: real indexable URLs, per-page static `<head>` (title/description/canonical/**hreflang**/OG/**JSON-LD**), sitemap/robots, semantic HTML, fast first paint. **Body text is JS-rendered** — Googlebot renders JS and will index it, so this is "good SEO". The only ways to also guarantee body text in the initial HTML are (a) author lessons as static HTML (changes the JS-data model) or (b) a generator (= build step, disallowed) — both **out of scope**; noted as the residual limit if a future requirement demands text-in-HTML for non-JS crawlers.

### Authoring the shells
The ~ (2 + 10×N_locales) shells are near-identical; author once via a subagent fan-out (one per locale, generating its home + 10 chapter shells from a template + the chapter list). Adding a new language later = author its shells + translate its content/ui-strings (manual, since no build step) — call this cost out in docs.

## Critical files
- `js/ui.js` — replace hardcoded Thai with `I18n.t(...)`; locale-ize `OPT_KEYS`/`DIFF`/`CALLOUT`; titles from bundle; add language switcher render.
- `js/i18n.js` — generalize fallback to `CONFIG.baseLocale`; add `dir`/locale-meta helpers.
- `js/app.js` — replace hash bootstrap with `window.PAGE`-driven, path-aware rendering; render quiz/results as in-page views.
- `js/router.js` — removed (superseded by per-page context) or reduced to in-page quiz/results view switching.
- `data/config.js` — `chapters` lose `title`; add `locales`, `baseLocale`, `basePath`, per-locale `dir`.
- `data/i18n/<loc>/ui-strings.js` — full UI string set per locale (TH exists, add EN).
- `data/i18n/<loc>/chapters/*` — per-locale content (TH done; EN translated later, code identical/English comments).
- NEW: per-page `index.html` shells under `/<loc>/...`, `sitemap.xml`, `robots.txt`, `404.html`.

## Verification
- `curl`/view-source each `/<loc>/chapter/<chId>/index.html`: correct static `<title>`, description, canonical, `hreflang` set, JSON-LD present, `<html lang>` right — **without running JS**.
- Playwright (`webapp-testing`): every real URL returns 200 and renders its lesson; in-page quiz still draws 15 / scores / gates 80%; language switcher navigates to the matching `/<otherLoc>/…` page; progress persists across full navigations; 0 console/404 errors; run from both `http://` and `file://`.
- Lighthouse SEO pass on a lesson page (target ~100): titles, meta, crawlable links, valid hreflang.
- Confirm `localStorage` keys/unlock still work across multi-page navigation.

## Deferred
- RTL + non-Latin script support (Arabic / CJK): per-locale `dir` + font stacks — revisit when those languages are scheduled.
