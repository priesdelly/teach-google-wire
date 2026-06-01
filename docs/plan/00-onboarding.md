# Plan 00 — Onboarding: explore & understand before you touch anything

> This is the **first** doc to read when you start working on this repo (after `CLAUDE.md`). This project is **already built and browser-verified** — a complete, bilingual, 10-chapter Google Wire course running on the in-house **CourseKit** engine. Most work here is **extension or maintenance**, not greenfield. **Do not edit content, the engine, or the UI until you understand the current state** — changing this codebase on a shaky mental model is the #1 way to break working, shipped behavior.

## What this repo is (30-second map)

- **The Wire course is the consumer at the repo root** — `/index.html` (locale redirect), `/en/`, `/th/`, `data/`, `course.config.js`. Its public SEO URLs live at the origin root, which is why it is **not** tucked under `examples/`.
- **CourseKit is the engine** — `core/` (theme-agnostic JS + structural CSS) + `themes/editorial/` (all design tokens). Reusable; the Wire course supplies only **data + config + theme**.
- **`examples/starter/`** — a throwaway second course proving the engine is reusable with zero engine edits.
- **`docs/plan/`** — the design docs (this folder). **Everything in `docs/plan/` is about THIS project (the Wire course / CourseKit) and nothing else.**

## Reading order (do this in sequence)

1. **`CLAUDE.md`** (repo root) — the operating manual: MANDATORY rules, architecture, the full UI design language + color tokens, product constraints, i18n. Read it end to end.
2. **`core/README.md`** — the CourseKit authoring reference (shells, `CourseKit.init`, content schema, theming) + Quickstart.
3. **The engine files** — read each and be able to explain what it puts on `window.CourseKit` and how the pieces connect:

   | File | What you must understand |
   |---|---|
   | `core/js/coursekit.js` | `init(config)` boot; `window.PAGE`-driven routing (home / lesson / `#quiz` / `#results`); delegated quiz-submit handler; language switch. |
   | `core/js/render.js` | `render` + `mount`; the **pluggable** block renderer (`CourseKit.blocks.register`) and the built-in block types; nav builds **relative** URLs from `PAGE.rel` (works on http, GitHub Pages subpath, `file://`). |
   | `core/js/quiz.js` | draws `quizSize` (15), **shuffles question + option order and remaps `correctAnswerIndex`**, scores, gates at `passThreshold` (80%). |
   | `core/js/storage.js` | versioned `localStorage` keyed by `courseId` (`wire:`); best score / attempts / passed; `setCurrent`/`getCurrent` resume; `isUnlocked()` always true (**chapters are open — don't re-add gating**). |
   | `core/js/i18n.js` | `t/raw/lesson/questions`; lazy locale resolve (`PAGE.locale` → stored → navigator → `defaultLocale`); reads `UI_<LOC>`/`LESSONS_<LOC>`/`QUESTIONS_<LOC>`, falls back to `baseLocale`. |
   | `core/css/core.css` | **structure only**, references `var(--*)`. Never restyle here. |
   | `themes/editorial/theme.css` · `hljs.css` | the **only** place with literal hex — palette/geometry/font tokens + `--code-*` syntax theme. Reuse tokens; never hardcode hex. |

4. **The other plan docs** — know what each owns before changing related code:
   - `01-vision-scope.md` — why the course exists, target learner, graduate outcomes, scope/non-goals (the `02` curriculum is derived from this).
   - `02-curriculum.md` — the 10-chapter backwards-design outline + Bloom levels.
   - `03-assessment.md` — quiz/question-bank blueprint (≥18 per chapter, 15 drawn, pass ≥80%, open chapters).
   - `04-architecture.md` — as-built architecture: multi-page static + CourseKit, data shapes, storage, routing, SEO.
   - `05-i18n-seo.md` — bilingual model + the SEO multi-page design (real per-page URLs, canonical/hreflang/JSON-LD).
   - `06-coursekit-framework.md` + `07-additions.md` — how the engine was extracted into CourseKit (one namespace, theme split, reuse proof).
   - `08-thai-reference.md` — **canonical Thai values** (UI terms, difficulty labels, "จุดสังเกต"). Consult before changing any Thai-facing string; if it disagrees with `data/i18n/th/ui-strings.js`, **the code wins**.
5. **The actual content** — skim `data/i18n/en/` and `data/i18n/th/`: `ui-strings.js` and a couple of `chapters/lessons-chNN.js` / `questions-chNN.js` so the authored data shape is concrete (each file **augments** its global: `(window.LESSONS_TH ||= {}).chNN = {...}`).

## Run it & verify (prove your mental model)

```bash
python3 -m http.server 8000        # open http://localhost:8000 — must also work from file://
```
Click a chapter → take the quiz → submit → results; switch language in the app bar; resize to **320px** and confirm **zero horizontal overflow** (a hard requirement for any UI change). Then run the data-shape validation `node -e` commands from `CLAUDE.md` against a chapter file to learn the pass/fail check.

## Conventions you must respect (from `CLAUDE.md`)

- **Delegate** decomposable work to subagents; **validate every Go/Wire snippet with `golang-pro`** — never guess Wire behavior.
- **Don't put course-specific text in `core/`** — it goes in `data/i18n/<loc>/ui-strings.js` or the shell. **Don't hardcode hex** outside the theme.
- **English is the default locale**; docs (including this folder) are written in **English**; product UI/content is **Thai + English**.
- **Chapters are open** (no gating). **≥18 questions per chapter.** Keep paths relative (GitHub Pages, `file://`). No build step / framework / bundler.
- The SEO origin placeholder is hardcoded across the 22 shells + `sitemap.xml` + `404.html` — update it everywhere if the deploy URL changes.

## Exit criteria — before you change anything

- [ ] You can state the **exact shape** of a `lesson` and a `question`, and the **six** block types `renderBlock` supports.
- [ ] You can explain how the quiz shuffles options and **remaps `correctAnswerIndex`**.
- [ ] You know what is **off-limits** (`core/` for course text; literal hex outside the theme; re-adding chapter gating) vs. course-specific (`data/`, shells, `course.config.js`, theme tokens).
- [ ] You ran the site locally and verified routing, quiz scoring, language switch, and 320px responsiveness with your own eyes.
- [ ] For any Thai string change, you checked `08-thai-reference.md` and confirmed `data/i18n/th/ui-strings.js` agrees.

## Status

Per `CLAUDE.md`: full engine/UI, all **10 chapters** (207 reviewed questions), fully bilingual (EN default), SEO multi-page, and the CourseKit extraction are **all done and browser-verified**. No pending roadmap item. Treat new requests as extensions to a working system — read the relevant plan doc above first.
