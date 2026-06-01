# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Write all instructions in this file in **English**, even though the product UI and lesson content are in **Thai**.

## What this project is

An interactive, Thai-language website that teaches **Google Wire** (Go's compile-time DI tool) chapter by chapter. Each chapter ends with a multiple-choice quiz; scoring ≥80% marks it passed. Goal: a graduate genuinely understands and can apply Wire at an expert level. **Before non-trivial work, read `docs/plan/00-onboarding.md`** — it is the entry point to the design docs in `docs/plan/` (written in **English**), a numbered series `00`→`08`: `01` vision/scope, `02` curriculum, `03` assessment, `04` architecture, `05` i18n+SEO, `06`/`07` CourseKit, `08` Thai reference. **Canonical Thai values** (UI terms, difficulty labels, "จุดสังเกต", etc.) are frozen in `docs/plan/08-thai-reference.md` — consult it before changing any Thai-facing string so translations stay consistent; if it disagrees with `data/i18n/th/ui-strings.js`, the code wins.

## Commands

```bash
# Run locally (must work from a static server AND file://)
python3 -m http.server 8000        # then open http://localhost:8000

# End-to-end browser test (Playwright via the webapp-testing skill)
# server must be served from the PROJECT root:
python3 ~/.claude/skills/webapp-testing/scripts/with_server.py \
  --server "python3 -m http.server 8000 --directory $(pwd)" --port 8000 \
  -- python3 /tmp/wire_test.py
```
There is no build step, bundler, linter, or package manager — files are served as-is.

## MANDATORY rules (do not skip)

1. **Always delegate to subagents.** Decomposable work (authoring each chapter's lessons, each question bank, building components) MUST be fanned out to subagents in parallel. Authoring Chapters 2–10 = one `golang-pro` subagent per chapter for content and one per question bank.
2. **Always use the relevant skills:** `golang-pro` (validate every Go/Wire snippet, answer, explanation — never guess), `frontend-design` (any UI work), `webapp-testing` (verify in a real browser), `karpathy-guidelines` (minimal, surgical edits).
3. Do **not** use `web-artifacts-builder` — it targets React/Tailwind and conflicts with the vanilla/no-build constraint.

## Architecture

**Multi-page static** (for SEO — no build step) on top of the **CourseKit framework** (the engine, extracted for reuse — `06-coursekit-framework.md`, `07-additions.md` §10). Each indexable page is a real file with a static SEO `<head>`; the shared vanilla JS renders the body. No modules/imports — every engine file attaches to the **single namespace `window.CourseKit`** (`.config/.storage/.i18n/.quiz/.render/.blocks`, state in `._state`). Authoring guide: `core/README.md`. See `docs/plan/05-i18n-seo.md` Part B + `06`/`07`.

- **Framework vs course:** `core/` (engine, theme-agnostic) + `themes/editorial/` (all design tokens) are reusable; the **Wire course is the consumer at the repo root** (its shells, `data/`, `course.config.js`) so its SEO URLs stay at origin root. `examples/starter/` is a second, throwaway course proving reuse with zero engine edits. **Don't put course-specific text in `core/`** — it goes in `data/i18n/<loc>/ui-strings.js` or the shell.
- **Pages (real URLs):** `/index.html` = locale redirect (stored choice → navigator detect → `/en/` or `/th/`). `/<loc>/index.html` = home. `/<loc>/chapter/<chId>/index.html` = lesson (10 × 2 locales). Quiz & results are **in-page hash views** on the chapter page (`#quiz`/`#results`/`#lesson`) — not separate URLs. `sitemap.xml`, `robots.txt`, `404.html` at root.
- **Each shell** sets `window.PAGE = { locale, view:'home'|'lesson', chapterId, rel }` (`rel` = relative path to site root) and loads, in order: theme css → `core/css/core.css` → hljs css; then `core/vendor/*` (lesson only) → `core/js/{coursekit,storage,i18n,quiz,render}.js` → that-locale ui-strings + that page's lesson/question data → **`course.config.js` last** (it calls `CourseKit.init` and boots). Static head carries `<title>`/description/**canonical**/**hreflang**(en,th,x-default)/OG/**JSON-LD**. SEO URLs are absolute under the origin placeholder `https://priesdelly.github.io/teach-google-wire` — **update this if the deploy URL differs** (it's hardcoded across the 22 shells + sitemap + 404 because there's no build step).
- `core/js/coursekit.js` — `CourseKit.init(config)` stores config + boots on DOMContentLoaded: localized chrome, language switch (navigates to the sibling-locale URL), delegated quiz click handler (`q-submit` → `#results`), and host-driven routing — reads `window.PAGE`: home → render home; lesson → render driven by the hash (`#quiz`/`#results`/else lesson). A submitted quiz (`q.submitted`) forces a fresh draw on retry.
- `core/js/render.js` — `CourseKit.render` via template literals + `mount(html)`; **pluggable** block renderer (`CourseKit.blocks.register(type, fn)`; core registers heading/paragraph/code/callout/list/image); nav uses real relative URLs via `homeUrl()/chapterUrl()` (built from `PAGE.rel` + locale, ending in `index.html` so they work on http, GitHub Pages subpath, and `file://`). Chapter cards are crawlable `<a>` links. The home "who is this for" panel renders only if `audience.heading` exists (optional).
- `core/js/quiz.js` — `CourseKit.quiz.create(bank)` draws `config.quizSize` (15), **shuffles question + option order** (remapping the correct index), scores, gates at `config.passThreshold` (80%).
- `core/js/storage.js` — versioned `localStorage`, **keys prefixed `config.courseId`** (Wire = `wire:` — unchanged, preserves existing data); best score/attempts/passed per chapter; `setCurrent/getCurrent` for resume. `isUnlocked()` returns `true` for all — **chapters are open; learners may skip ahead** (don't re-add gating without being asked).
- `core/js/i18n.js` — `CourseKit.i18n.t/raw/lesson/questions`; locale resolved lazily (`_resolve`): `PAGE.locale` (URL) → stored → navigator detect (first `navigator.languages` entry in `config.locales`, else `defaultLocale`); reads `UI_<LOC>`/`LESSONS_<LOC>`/`QUESTIONS_<LOC>` globals, falling back to `config.baseLocale`.
- `course.config.js` (repo root) — `CourseKit.init({ courseId:'wire', author, passThreshold, quizSize, locales (EN first), defaultLocale/baseLocale ('en'), localeLabels, mount, chapters:[{id,num,difficulty}] })`. **Titles live in lesson bundles, not here.**
- **file:// caveat:** pretty directory URLs need a server; opening a specific `index.html` works, and inter-page links (`…/index.html`) work on `file://`. Test via `python3 -m http.server`.

### Data authoring (must match the renderer exactly)

Content and questions are plain JS globals, **one file per chapter** under `data/i18n/<locale>/chapters/`: `lessons-ch0X.js` and `questions-ch0X.js`. Each file **augments** the shared global rather than replacing it — `(window.LESSONS_TH = window.LESSONS_TH || {}).ch0X = {...}` / `(window.QUESTIONS_TH ||= {}).ch0X = [...]`. The lesson shell loads only its own chapter's two files; the home shell loads **all** `lessons-ch*.js` (for titles) and no questions. Author Chapters 2–10 in the same shapes:

**`lessons-ch0X.js` → `window.LESSONS_TH.ch0X = { title, sections:[block...] }`.** Block `type`s (the ONLY ones `renderBlock` supports):
- `heading` `{level,text}` · `paragraph` `{html}` (inline `<strong> <code> <mark> <a>`)
- `code` `{lang:'go', code, highlightLines:[n], annotations:[{line,text}]}` — highlighted lines + a "จุดสังเกต" note under that line; **use generously**
- `callout` `{variant:'observe'|'tip'|'note'|'warning', title?, html}` — `observe` = "จุดสังเกต" (amber)
- `list` `{ordered,items:[html]}` · `image` `{src,alt,caption?}`

**`questions-ch0X.js` → `window.QUESTIONS_TH.ch0X = [ {...} ]`.** Each: `id, difficulty, bloomLevel, question, code?(go), options:[4 plain strings — NO ก/ข/ค/ง prefix, UI adds them], correctAnswerIndex:0-3, explanation`. **≥18 per chapter** (15 drawn). Vary `correctAnswerIndex`; distractors must encode real misconceptions.

After authoring, validate the JS loads and conforms before trusting subagent output — load it under a fake `window` and check the shape:

```bash
node -e 'globalThis.window={}; require("./data/i18n/th/chapters/lessons-ch04.js");
  const l=window.LESSONS_TH.ch04; if(!l.title||!Array.isArray(l.sections)) throw "bad lesson";
  console.log(l.title, l.sections.length, "blocks");'
node -e 'globalThis.window={}; require("./data/i18n/th/chapters/questions-ch04.js");
  const q=window.QUESTIONS_TH.ch04; if(q.length<18) throw "need >=18";
  q.forEach(x=>{if(x.options.length!==4||x.correctAnswerIndex<0||x.correctAnswerIndex>3) throw "bad q "+x.id});
  console.log(q.length, "questions ok");'
```

## UI design language (the established look — keep it consistent)

"Technical editorial manual": **minimal, clean, calm, lots of whitespace.** All values live as CSS variables in `themes/editorial/theme.css` `:root` (the only place with literal hex; `core/css/core.css` is structure-only and references `var(--*)`) — **reuse the tokens, never hardcode new hex or invent a second palette.**

### Color palette (exact tokens)

| Token | Hex | Role |
|-------|-----|------|
| `--paper` | `#FBFAF7` | page background (warm paper; body also has faint teal+amber radial grain) |
| `--paper-2` | `#F3F1EB` | sunken surfaces: code top-bar, chips, progress tracks, ghost buttons |
| `--card` | `#FFFFFF` | cards, panels, code surface |
| `--ink` | `#1B1E22` | primary text |
| `--ink-soft` | `#4C555D` | secondary text, body of callouts |
| `--ink-faint` | `#8A9299` | meta, line numbers, captions |
| `--line` | `#E5E1D8` | hairline borders |
| `--line-strong` | `#D2CCBE` | stronger borders, code border, code dots |
| `--teal` / `--teal-deep` | `#00A6B8` / `#007A88` | **Go accent** — buttons, links, current ring; deep = hover/links/code function names |
| `--teal-wash` | `#E6F6F8` | teal tint — tip callout, selected/correct option, pass hero |
| `--amber` / `--amber-wash` | `#E0962A` / `#FBF1DD` | **reserved for "จุดสังเกต"** — observe callout, highlighted code line + its annotation |
| `--coral` / `--coral-wash` | `#DD5A3F` / `#FBEAE5` | warnings/errors — warning callout, fail hero, wrong option |
| `--slate` / `--slate-wash` | `#5B7799` / `#EBF0F6` | notes — note callout |

Geometry tokens: spacing scale `--s-1..--s-9` (4/8/12/16/24/32/48/64/96px); radii `--radius 14px` (cards), `--radius-sm 9px` (code/options/chips), `--radius-lg 22px` (result hero); `--shadow-sm/-md/-lg`; reading column `--maxw-read 720px`, wide `--maxw-wide 1040px`.

### Type
`--font-sans` = IBM Plex Sans Thai → Noto Sans Thai → Thonburi → system; `--font-mono` = IBM Plex Mono → SF Mono → system. Loaded via Google Fonts `<link>`; the fallback stack must keep it readable offline (`file://`).

### Info panel / callout recipe (`.callout`, see `core/css/core.css`)
Two-column grid (icon | title+body), `border-left: 4px` in the variant color, background = the variant's `*-wash`, title in the variant color. Four variants — pick by intent:
| Variant | Icon | Color | Use for |
|---------|------|-------|---------|
| `observe` | 💡 | amber | **"จุดสังเกต"** — the key thing to notice |
| `tip` | ✅ | teal | best practice / do-this |
| `note` | ℹ️ | slate | neutral aside / extra info |
| `warning` | ⚠️ | coral | pitfall / common mistake |

### Code block anatomy (`.code`, see `core/css/core.css` + `themes/editorial/hljs.css`; syntax colors are `--code-*` tokens)
White surface, `--line-strong` border, `--radius-sm`, `--shadow-sm`. Top `.code__bar` (`--paper-2`) has three `--line-strong` dots + an uppercase mono language label on the right. Body is per-line: `.cline` with a right-aligned faint `.cline__no` line number.
- **Highlighted line** `.cline.is-hl`: `--amber-wash` background + a 3px `--amber` left bar + amber-bold line number — this is the primary "จุดสังเกต" cue in code.
- **Annotation** `.cnote`: an amber note row rendered directly beneath a highlighted line, prefixed with `↑`, indented to align under the code; `<b>` inside it turns ink-colored.
- **Syntax theme** (light, hand-tuned to the palette): keyword `#B3503E`, string `#2E8B6B`, function/title `#007A88`, type/built-in `#8A5BC2`, number `#B3503E`, comment `#9AA3A0` italic, attr `#0E6E9E`, meta (`//go:build`, struct tags) `#9AA3A0`.

### Motion & layout
Sticky translucent app bar with overall progress; home = chapter-card grid with big mono numerals + difficulty tag; staggered fade-in on load (`.stagger`), gentle hover lifts. Respect `prefers-reduced-motion`; responsive at the 640px breakpoint.

### Responsive (MANDATORY — verify every new UI)
Every screen MUST work down to **320px (iPhone SE)** with **zero horizontal overflow**. After any UI change, verify with `webapp-testing` by asserting `document.documentElement.scrollWidth <= clientWidth` at **320 and 375** on home, lesson, quiz, and results — and scan for offenders (`getBoundingClientRect().right > clientWidth`). Hard-won gotchas:
- Grid/flex children default to `min-width: auto` and **won't shrink below their content's min-content** → add `min-width: 0` (or restructure). This is the #1 cause of mobile overflow here.
- Avoid grid `auto` / `minmax(Npx, …)` tracks that can't shrink on small screens. For lists like the prerequisites checklist, use **block items with an absolutely-positioned icon** (or flex-column), not a grid — so each row takes container width and text wraps.
- Long code/Latin tokens: keep inline `<code>` chips on one line (`white-space: nowrap`) but let surrounding text wrap; never apply `overflow-wrap: anywhere` to mixed text (it shreds code tokens character-by-character).
- Code blocks scroll **inside** `.code__scroll` (`overflow-x: auto`) — they must never widen the page.
- Drop non-essential app-bar chrome (the progress bar) on phones (`@media (max-width: 640px)`).

## Product constraints (fixed)

- Plain **HTML + JS + CSS only** — no backend, framework, bundler, or build step; runs from `file://` and GitHub Pages.
- Quizzes are **multiple-choice only** ("กากบาท"); **≥18-question bank per chapter, 15 drawn, pass ≥80% (12/15)**.
- State in `localStorage`. **Bilingual TH + EN** — **English is the default locale** (`CONFIG.defaultLocale`); switchable in the app bar. Content lives per-locale under `data/i18n/<loc>/`. (`Storage.getLocale()` returns `null` when unset so `CONFIG.defaultLocale` wins — don't reintroduce a hardcoded locale default there.)
- Deploy target: **GitHub Pages** — keep paths relative.

## Content style

Teach like an excellent, easy-to-follow instructor in Thai; keep technical terms in English where natural (provider, injector, build tag). Google Wire content must be technically accurate — never fabricate.

## i18n (engine is fully localized)

UI chrome is **not** hardcoded — every string lives in `data/i18n/<loc>/ui-strings.js` (`UI_TH`, `UI_EN`) and the engine reads it via `CourseKit.i18n.t(key, vars)` / `.raw(key)` (arrays like `opt.keys`). `core/js/i18n.js` falls back to `config.baseLocale` when a bundle/string is missing. Chapter **titles** come from the lesson bundle (`CourseKit.i18n.lesson(id).title`), not config. The app-bar language switch lists `config.locales` in order (**EN first**) and reloads on change (`core/js/coursekit.js`).

**Initial locale** (`core/js/i18n.js`): a stored choice wins; otherwise auto-detect from `navigator.languages` — a Thai device → `th`, anything else → `config.defaultLocale` (`en`). The choice persists in `localStorage`.

**Lesson resume** (per browser, no server): opening a chapter saves it via `CourseKit.storage.setCurrent` (`core/js/coursekit.js`); the home hero shows a **Continue** button (`home.continue`) linking to `CourseKit.storage.getCurrent()`. Progress/scores already persist in `localStorage`, so returning learners pick up where they left off. To add a language: add its `ui-strings.js` + `data/i18n/<loc>/chapters/*` (registering `LESSONS_<LOC>`/`QUESTIONS_<LOC>`); until content exists, that locale shows localized chrome with **content falling back to the base locale**.

## Status

Browser-verified (incl. responsive 320–414px). **Done:** full engine/UI; all **10 chapters** authored (207 questions), adversarial **Wire-accuracy reviewed** (41 fixes); **fully bilingual** — TH + EN content complete (both `data/i18n/th` and `data/i18n/en`), **English default**, app-bar language switch; home "who is this for / prerequisites" panel; footer license + author credit; AI-no-train meta + `robots.txt`.
Also done: **SEO multi-page** (`05-i18n-seo.md` Part B) — real per-page URLs, static head (canonical/hreflang/OG/JSON-LD), `sitemap.xml`/`robots.txt`/`404.html`, locale redirect; in-page quiz/results; all verified.
Also done: **CourseKit framework** (`06`, `07` §10) — engine extracted in-place under one namespace `window.CourseKit` (`core/` engine + `themes/editorial/` tokens; Wire course = consumer at root; `examples/starter/` proves reuse). Verified 35/35, 0 console errors.
**Next:** all standing designs shipped — no pending roadmap item.
