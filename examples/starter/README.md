# CourseKit Starter

A minimal, runnable course built on **[CourseKit](../../core/README.md)** — single locale (`en`), 2 chapters, an indigo theme override. It exists to prove the engine is reusable: this folder contains **only data + config + theme, with zero edits to `core/`**.

If you want to build your own course, copy this folder and start editing.

## Run it

Paths point up to the shared engine (`../../../core/…`), so serve the **repo root** and open the starter URL:

```bash
# from the repo root
python3 -m http.server 8000
# then open
http://localhost:8000/examples/starter/en/
```

## What's here

```
course.config.js   CourseKit.init({...}) — courseId, quizSize, chapters list
theme.css          a few token overrides (indigo accent) layered over the editorial theme
data/
  ui-strings.js    window.UI_EN        — UI chrome text
  lessons.js       window.LESSONS_EN   — { chId: { title, sections:[block] } }
  questions.js     window.QUESTIONS_EN — { chId: [ question ] }
en/index.html                    home shell
en/chapter/intro/index.html      lesson shell
en/chapter/basics/index.html     lesson shell
```

> Single-locale courses keep data flat under `data/`. The Wire course at the repo root is multi-locale, so it nests under `data/i18n/<loc>/` instead — same globals, just per-locale files.

## Make your own — 5 steps

1. **Copy this folder** to a new course directory.
2. **List your chapters** in `course.config.js` (`chapters:[{id,num,difficulty}]`) and set `courseId`, `quizSize`, `passThreshold`. Titles live in `lessons.js`, not here.
3. **Write lessons** in `data/lessons.js` — one entry per chapter id, each `{ title, sections:[block] }`. Block types: `heading · paragraph · code · callout · list · image` (see [`core/README.md`](../../core/README.md#content-schema)).
4. **Write the quiz bank** in `data/questions.js` — one array per chapter id; each question has `options:[4 strings]`, `correctAnswerIndex`, `explanation`. The engine adds A/B/C/D and shuffles.
5. **Add a shell** per page (`en/index.html` = home, `en/chapter/<id>/index.html` = lesson). Each shell sets `window.PAGE` and loads engine → theme → data → config, in that order. Copy an existing shell and adjust `PAGE` + relative paths.

Re-skin by editing `theme.css` (token overrides only — never edit `core/css/core.css`). Full reference: [`core/README.md`](../../core/README.md).
