# Learn Google Wire — interactive course

An interactive, **bilingual (English · ไทย)** website that teaches [Google Wire](https://github.com/google/wire), Go's compile-time dependency-injection tool — chapter by chapter, from zero to expert. Each chapter ends with a multiple-choice quiz; score ≥ 80% to clear it.

- **10 chapters**, 207 reviewed questions (15 drawn per attempt, shuffled).
- Progress, scores, language, and "continue where you left off" persist in `localStorage` (per browser, no account).
- **No backend, no framework, no build step** — plain HTML + JS + CSS. Runs from a static host, GitHub Pages, or `file://`.

## Structure

```
index.html            locale redirect → /en/ or /th/ (stored choice / browser language)
en/  th/              per-locale home + chapter pages (real URLs, static SEO <head>)
data/i18n/<loc>/      content: ui-strings, lessons, question banks
course.config.js      engine config + boot for this course
core/                 the course engine — namespaced (window.CourseKit), theme-agnostic
themes/editorial/     design tokens (theme.css) + syntax theme (hljs.css)
sitemap.xml  robots.txt  404.html
docs/plan/            design docs
```

The course pages live at the repo root so their SEO URLs stay at the origin root.

## Engine (`core/`)

The interaction engine is a small, build-free vanilla JS layer. The course supplies **data + config + theme**:

- **One namespace** — everything lives on `window.CourseKit`; no global collisions.
- **Content-driven** — lessons and quizzes render from plain JS data; block renderers are pluggable.
- **Themeable** — all design values are CSS tokens in `themes/`.
- **i18n + SEO built in** — per-locale bundles with fallback, real per-page URLs, multiple-choice quizzes with scoring/progress in `localStorage`.

`core/README.md` is the full authoring reference (shells, config, content schema, theming).

## Deploying to GitHub Pages

Enable Pages on the default branch (root). The site is static and needs no workflow.

> SEO URLs (`canonical`, `hreflang`, sitemap) are hardcoded to a single origin placeholder
> across the page shells, `sitemap.xml`, and `404.html` (there's no build step to template them).
> **Set it to your actual deploy URL** — search the repo for the placeholder and replace it everywhere.

## License

Licensed under **[CC BY-NC-ND 4.0](LICENSE)** — free to share for educational, non-commercial use with attribution; no derivatives or commercial use without prior written permission. Built by **Priesdelly**.
