# Technical Architecture

## 1. Folder Structure

```
teach-google-wire/
├── index.html                 # Single entry point
├── css/
│   ├── base.css              # Resets, typography, spacing scales
│   ├── layout.css            # Grid, flexbox, responsive utilities
│   ├── components.css        # Buttons, cards, modals, nav
│   └── themes.css            # Light/dark modes (future)
├── js/
│   ├── app.js                # Bootstrap, router, lifecycle
│   ├── ui.js                 # DOM rendering, template helpers
│   ├── storage.js            # localStorage CRUD + migrations
│   ├── i18n.js               # Locale switcher, translation lookup
│   ├── quiz.js               # Quiz logic, scoring, state
│   ├── router.js             # Hash-based routing, page dispatcher
│   └── vendor/               # Polyfills if needed (optional)
├── data/
│   ├── i18n/
│   │   ├── th/
│   │   │   ├── lessons.js    # Thai lesson content objects
│   │   │   ├── questions.js  # Thai quiz questions + answers
│   │   │   └── ui-strings.js # Thai UI labels, buttons, tooltips
│   │   └── en/
│   │       ├── lessons.js    # English lessons (added later)
│   │       ├── questions.js
│   │       └── ui-strings.js
│   └── config.js             # Feature flags, versioning, defaults
├── assets/
│   ├── images/               # PNG, SVG, favicons
│   ├── fonts/                # If self-hosted (optional)
│   └── icons/                # SVG symbol library or icon font
└── README.md
```

## 2. Page Structure Decision: Single-Page App with Hash Routing

**Choice:** Hash-based SPA (not multi-page HTML files)

**Why:**
- **File:// protocol compatible** — no HTTP server needed for local dev. Users can open `index.html` directly.
- **GitHub Pages friendly** — hash URLs work without server rewrites. No 404 fallback needed.
- **Persistent state across navigation** — localStorage and JS variables survive without page reload.
- **Instant transitions** — no full page reload overhead; smoother UX.
- **Simplified deployment** — single HTML file, no routing config on server.

**URL scheme:**
```
index.html#/           → Home/dashboard
index.html#/chapter/1  → Chapter 1 lessons
index.html#/quiz/1     → Quiz for chapter 1
index.html#/results/1  → Results for quiz 1
index.html#/settings   → Language & progress settings
```

**Implementation:**
- `router.js` listens to `hashchange` event.
- Routes map to page-render functions (e.g., `renderChapterPage(chapterId)`).
- All page content lives in `<div id="app">`, replaced on navigation.

## 3. Embedding Lessons & Questions

**Approach:** JavaScript export objects, NOT fetched JSON files.

**Why avoid JSON:**
- `fetch()` fails on `file://` protocol (breaks offline/local dev).
- HTTP server required for JSON loading (adds friction).

**Why use JS objects:**
- Import/require syntax works on file:// (via `<script>` tags).
- Version control friendly; diffs are readable.
- No runtime parsing errors; syntax errors caught at load.
- Can inline small content; scales to external JS file imports if needed.

**Structure:**

**`data/i18n/th/lessons.js`:**
```javascript
const LESSONS = {
  1: {
    id: 1,
    title: 'Chapter 1: Meet Google Wire',
    sections: [
      {
        heading: 'Introduction',
        content: 'Google Wire is...',
        mediaUrl: 'assets/images/wire-intro.svg', // local asset, no fetch
      },
      // ... more sections
    ],
  },
  2: { /* ... */ },
};
export default LESSONS;
// or: window.LESSONS = LESSONS; (if not using modules)
```

**`data/i18n/th/questions.js`:**
```javascript
const QUESTIONS = {
  1: [ // Quiz 1 (chapter 1)
    {
      id: 1,
      question: 'What is Google Wire?',
      options: ['A) ...', 'B) ...', 'C) ...', 'D) ...'],
      correctAnswer: 1, // index (0-based)
      explanation: 'Because...',
    },
    // ... more questions
  ],
};
export default QUESTIONS;
```

**Loading strategy:**
- Load all lesson & question JS files at app bootstrap (in `<script>` tags before app.js).
- OR use dynamic `import()` in modules (requires http-server for file://, use at own risk).
- Recommend: static `<script>` tags in HTML for guaranteed file:// compatibility.

```html
<!-- index.html -->
<script src="data/i18n/th/lessons.js"></script>
<script src="data/i18n/th/questions.js"></script>
<script src="data/i18n/th/ui-strings.js"></script>
<script src="js/app.js"></script> <!-- app.js uses LESSONS, QUESTIONS globals -->
```

## 4. i18n Strategy

**Folder layout:**
```
data/i18n/
├── th/
│   ├── lessons.js       # const LESSONS_TH = { ... }
│   ├── questions.js     # const QUESTIONS_TH = { ... }
│   └── ui-strings.js    # const UI_TH = { "btn.start": "เริ่ม", ... }
└── en/
    ├── lessons.js       # const LESSONS_EN = { ... }
    ├── questions.js     # const QUESTIONS_EN = { ... }
    └── ui-strings.js    # const UI_EN = { "btn.start": "Start", ... }
```

**Locale switching:**

1. **Detect current locale:**
   - Check localStorage: `localStorage.getItem('locale')`
   - Fallback: browser language (`navigator.language`), default to 'th'.

2. **Load correct language files dynamically:**
   ```javascript
   // i18n.js
   let currentLocale = localStorage.getItem('locale') || 'th';
   
   function t(key) {
     // Lookup: UI[key] returns translated string
     // e.g., t('btn.start') → 'เริ่ม' (Thai) or 'Start' (English)
     const ui = currentLocale === 'th' ? UI_TH : UI_EN;
     return ui[key] || key; // fallback: return key if missing
   }
   
   function getContent() {
     // Return lessons, questions for current locale
     return currentLocale === 'th' 
       ? { lessons: LESSONS_TH, questions: QUESTIONS_TH }
       : { lessons: LESSONS_EN, questions: QUESTIONS_EN };
   }
   
   function switchLocale(locale) {
     if (['th', 'en'].includes(locale)) {
       currentLocale = locale;
       localStorage.setItem('locale', locale);
       location.reload(); // or emit event to re-render app
     }
   }
   ```

3. **In HTML:**
   - Load both language files at boot (no performance penalty for small content):
   ```html
   <script src="data/i18n/th/lessons.js"></script>
   <script src="data/i18n/th/questions.js"></script>
   <script src="data/i18n/th/ui-strings.js"></script>
   <script src="data/i18n/en/lessons.js"></script>
   <script src="data/i18n/en/questions.js"></script>
   <script src="data/i18n/en/ui-strings.js"></script>
   ```
   - OR: lazy-load second language via dynamic `<script>` insertion when user switches locales.

4. **Render:**
   - Use `t()` for all UI strings.
   - Use `getContent()` for lessons/questions.
   - No hardcoded English/Thai in templates.

## 5. localStorage Schema

**Key design:**
- Flat namespace with prefixes (`app:`, `progress:`, `settings:`).
- Version key for safe migrations.
- Minimal data (only user state, no computed/cached values).

**Schema:**

```javascript
{
  "app:version": "1",          // For schema migrations
  "app:createdAt": "2025-06-01T10:00:00Z",
  
  "settings:locale": "th",     // 'th' or 'en'
  "settings:theme": "light",   // 'light' or 'dark' (future)
  
  "progress:chapter": "1",     // Current chapter being viewed
  "progress:lesson": "0",      // Current lesson index in chapter
  
  "progress:quiz-1": {         // Per-quiz state (stored as JSON)
    "answers": [0, 2, null, 1], // User's selected answers (index or null)
    "submitted": false,
    "startedAt": "2025-06-01T10:15:00Z"
  },
  
  "results:quiz-1": {          // Quiz results (persisted after submit)
    "score": 3,
    "total": 4,
    "percent": 75,
    "completedAt": "2025-06-01T10:20:00Z",
    "answers": [0, 2, null, 1],
    "correct": [true, true, false, true]
  }
}
```

**Migration pattern (storage.js):**
```javascript
const STORAGE_VERSION = 1;

function migrate() {
  const saved = localStorage.getItem('app:version');
  const version = parseInt(saved) || 0;
  
  if (version < 1) {
    // v0 → v1: flatten nested keys, etc.
    // ... migration logic
  }
  
  localStorage.setItem('app:version', STORAGE_VERSION);
}
```

## 6. Module Structure & Responsibilities

**`js/app.js` (Bootstrap & Lifecycle)**
- Init storage (load, migrate).
- Init i18n (detect locale, load strings).
- Setup router.
- Render initial page.
- Listen to global events (hashchange, storage changes).

**`js/router.js` (Hash-based Navigation)**
- Parse URL hash (`#/chapter/1`).
- Dispatch to page renderers (`renderChapterPage()`, `renderQuizPage()`, etc.).
- Handle 404 (redirect to home).

**`js/ui.js` (Rendering & Templates)**
- DOM query helpers.
- Template functions (return HTML strings via template literals).
- Event delegation (bind listeners to `#app` root).
- Utilities: `element()`, `on()`, `off()`, `html()`, `text()`.

**`js/storage.js` (Persistence)**
- `getProgress(key)`, `setProgress(key, value)`.
- `getQuizResult(quizId)`, `saveQuizResult()`.
- `migrate()` — schema version checks.
- `clear()` — wipe data (for testing/reset).

**`js/i18n.js` (Localization)**
- `t(key)` — lookup UI string.
- `getContent()` — return lessons/questions for current locale.
- `getCurrentLocale()`, `switchLocale()`.
- `formatDate(date, locale)` — i18n number/date formatting (future).

**`js/quiz.js` (Quiz State & Scoring)**
- `Quiz` class: manage answers, validate, score.
- Methods: `setAnswer(qIdx, answerIdx)`, `submit()`, `reset()`, `getResults()`.
- No DOM manipulation; pure logic (tested independently).

**`data/config.js` (Metadata)**
```javascript
const CONFIG = {
  version: '1.0.0',
  chapters: [
    { id: 1, title: 'Chapter 1', lessonCount: 5, quizCount: 10 },
    { id: 2, title: 'Chapter 2', lessonCount: 6, quizCount: 12 },
  ],
  locales: ['th', 'en'],
  defaultLocale: 'th',
};
```

## 7. Rendering Approach

**Principle:** Vanilla JS DOM manipulation, template literals, minimal re-renders.

**Pattern:**

```javascript
// js/ui.js

function renderLessonPage(chapterId, lessonIdx) {
  const { lessons } = getContent(); // from i18n.js
  const lesson = lessons[chapterId];
  
  const html = `
    <div class="page page--lesson">
      <header class="lesson__header">
        <h1>${escapeHtml(lesson.title)}</h1>
      </header>
      <main class="lesson__content">
        ${lesson.sections.map(section => `
          <section class="lesson__section">
            <h2>${escapeHtml(section.heading)}</h2>
            <p>${escapeHtml(section.content)}</p>
            ${section.mediaUrl ? `<img src="${section.mediaUrl}" alt="">` : ''}
          </section>
        `).join('')}
      </main>
      <footer class="lesson__nav">
        <button class="btn btn--prev" data-action="prev-lesson">← ${t('btn.prev')}</button>
        <button class="btn btn--next" data-action="next-lesson">→ ${t('btn.next')}</button>
      </footer>
    </div>
  `;
  
  document.getElementById('app').innerHTML = html;
  
  // Event delegation: bind at root
  document.getElementById('app').addEventListener('click', (e) => {
    if (e.target.dataset.action === 'next-lesson') {
      navigate(`#/chapter/${chapterId}/lesson/${lessonIdx + 1}`);
    }
  });
}
```

**Key practices:**
- **No virtual DOM:** direct DOM updates via `innerHTML`.
- **Template literals:** readable multi-line strings, embedded expressions.
- **Event delegation:** single listener on `#app`, check `data-action` or classes.
- **Escape HTML:** prevent XSS in user-generated content (if any).
- **Minimal dependencies:** no jQuery, no DOM libraries.

## 8. GitHub Pages Deployment Checklist

**Prerequisites:**
- Repository: `teach-google-wire` on GitHub.
- Enable GitHub Pages: Settings → Pages → Source: `main` branch, root directory.
- Base URL: `https://priesdelly.github.io/teach-google-wire/` (if private repo) or `/` (if username repo).

**File structure for deployment:**
```
// Option A: Deploy from root
teach-google-wire/
├── index.html
├── css/
├── js/
├── data/
├── assets/
└── (rest of project files hidden or in /docs for docs site)

// Option B: Deploy from /docs folder (if preferred)
teach-google-wire/
├── docs/
│   ├── index.html
│   ├── css/
│   ├── js/
│   ├── data/
│   └── assets/
└── (source files elsewhere)
```

**Critical: Base path handling**

GitHub Pages base path is `/teach-google-wire/`. All asset paths must be relative or use base path:

**In `index.html`:**
```html
<!-- Relative paths (preferred, works everywhere) -->
<link rel="stylesheet" href="css/base.css">
<script src="data/i18n/th/lessons.js"></script>
<img src="assets/images/logo.svg" alt="Logo">

<!-- OR: use <base> tag (optional, cleaner) -->
<head>
  <base href="/teach-google-wire/">
</head>
```

**In `js/` files:**
```javascript
// Use relative asset URLs only
const imageUrl = 'assets/images/diagram.svg'; // Not /teach-google-wire/assets/...
```

**In `css/`:**
```css
/* Relative paths work fine in CSS */
@font-face {
  font-family: 'Custom';
  src: url('assets/fonts/custom.woff2') format('woff2');
}

.logo {
  background: url('assets/images/logo.svg');
}
```

**Deployment workflow:**
1. All HTML, CSS, JS, data, assets in `teach-google-wire/` (or `teach-google-wire/docs/` if using /docs).
2. Push to GitHub `main` branch.
3. GitHub Pages auto-builds from specified source.
4. Visit: `https://priesdelly.github.io/teach-google-wire/`

**Testing before deploy:**
- Test locally: `python3 -m http.server 8000`, visit `http://localhost:8000`.
- Or open `file:///path/to/teach-google-wire/index.html` directly (tests file:// compat).
- Verify all assets load, i18n switches, localStorage persists, quiz scoring works.

**No build step:** `.js` files are loaded directly. No bundling, transpiling, minification (keep simple; optimize if performance becomes issue).

---

## Summary

- **Single-page app:** Hash routing, works on file://, GitHub Pages ready.
- **Embedded content:** JavaScript export objects (no JSON fetch).
- **i18n:** Parallel language files, localStorage locale preference, `t()` for translations.
- **Storage:** Flat localStorage schema with version key for migrations.
- **Modules:** Clear separation (app, router, ui, storage, i18n, quiz).
- **Rendering:** Vanilla JS, template literals, event delegation.
- **Deployment:** Relative asset paths, push to GitHub, Pages auto-builds.
