# Learn Google Wire — interactive course

An interactive, **bilingual (English · ไทย)** website that teaches [Google Wire](https://github.com/google/wire), Go's compile-time dependency-injection tool — chapter by chapter, from zero to expert. Each chapter ends with a multiple-choice quiz; score ≥ 80% to clear it.

- **10 chapters**, 207 reviewed questions (15 drawn per attempt, shuffled).
- Progress, scores, language, and "continue where you left off" persist in `localStorage` (per browser, no account).
- **No backend, no framework, no build step** — plain HTML + JS + CSS. Runs from a static host, GitHub Pages, or `file://`.
- Built on **[CourseKit](core/README.md)**, a small reusable course engine extracted from this project.

## Structure

```
index.html            locale redirect → /en/ or /th/ (stored choice / browser language)
en/  th/              per-locale home + chapter pages (real URLs, static SEO <head>)
data/i18n/<loc>/      content: ui-strings, lessons, question banks
course.config.js      CourseKit.init({...}) for this course
core/                 CourseKit engine — namespaced (window.CourseKit), theme-agnostic
themes/editorial/     design tokens (theme.css) + syntax theme (hljs.css)
examples/starter/     a minimal second course proving the engine is reusable
sitemap.xml  robots.txt  404.html
docs/plan/            design docs
```

The Wire course **is** the primary CourseKit consumer and lives at the repo root so its SEO URLs stay at the origin root. To build a different course on the same engine, see [`core/README.md`](core/README.md).

## Deploying to GitHub Pages

Enable Pages on the default branch (root). The site is static and needs no workflow.

> SEO URLs (`canonical`, `hreflang`, sitemap) are hardcoded to a single origin placeholder
> across the page shells, `sitemap.xml`, and `404.html` (there's no build step to template them).
> **Set it to your actual deploy URL** — search the repo for the placeholder and replace it everywhere.

## License

Licensed under **[CC BY-NC-ND 4.0](LICENSE)** — free to share for educational, non-commercial use with attribution; no derivatives or commercial use without prior written permission. Built by **Priesdelly**.
