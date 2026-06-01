/* CourseKit.render — rendering layer (vanilla DOM via template literals), i18n-driven.
   Block renderers are pluggable: CourseKit.blocks.register(type, fn). */
(function (global) {
  'use strict';
  var CK = global.CourseKit || (global.CourseKit = {});
  function cfg() { return CK.config || {}; }
  function i18n() { return CK.i18n; }
  function store() { return CK.storage; }
  function state() { return CK._state; }

  var ICON = { observe: '💡', tip: '✅', note: 'ℹ️', warning: '⚠️' };
  function t(k, v) { return i18n().t(k, v); }
  function optKey(i) { var a = i18n().raw('opt.keys') || ['A', 'B', 'C', 'D']; return a[i] || ''; }
  function diffLabel(d) { return t('diff.' + d); }
  function chapterTitle(c) { var l = i18n().lesson(c.id); return (l && l.title) ? l.title : t('chapter.n', { n: c.num }); }

  /* real relative URLs (work on http, GitHub Pages subpath, and file://) */
  function rel() { return (global.PAGE && global.PAGE.rel) || ''; }
  function homeUrl() { return rel() + i18n().getLocale() + '/index.html'; }
  function chapterUrl(id) { return rel() + i18n().getLocale() + '/chapter/' + id + '/index.html'; }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function hl(code, lang) {
    if (typeof cfg().highlight === 'function') { try { return cfg().highlight(code, lang); } catch (e) {} }
    try { if (global.hljs && hljs.getLanguage(lang)) return hljs.highlight(code, { language: lang, ignoreIllegals: true }).value; }
    catch (e) {}
    return esc(code);
  }

  /* ---------- block registry ---------- */
  var BLOCKS = {};
  CK.blocks = { register: function (type, fn) { BLOCKS[type] = fn; } };

  function renderCode(b) {
    var lang = b.lang || 'go';
    var hlSet = {}; (b.highlightLines || []).forEach(function (n) { hlSet[n] = 1; });
    var notes = {}; (b.annotations || []).forEach(function (a) { notes[a.line] = a.text; });
    var lines = String(b.code).replace(/\n$/, '').split('\n');
    var rows = lines.map(function (line, i) {
      var n = i + 1;
      var row = '<div class="cline' + (hlSet[n] ? ' is-hl' : '') + '">' +
        '<span class="cline__no">' + n + '</span>' +
        '<span class="cline__code">' + (hl(line, lang) || ' ') + '</span></div>';
      if (notes[n]) row += '<div class="cnote">' + notes[n] + '</div>';
      return row;
    }).join('');
    return '<div class="code"><div class="code__bar">' +
      '<span class="code__dot"></span><span class="code__dot"></span><span class="code__dot"></span>' +
      '<span class="code__lang">' + esc(lang) + '</span></div>' +
      '<div class="code__scroll"><div class="code__body">' + rows + '</div></div></div>';
  }

  CK.blocks.register('heading', function (b) { var l = b.level || 2; return '<h' + l + '>' + esc(b.text) + '</h' + l + '>'; });
  CK.blocks.register('paragraph', function (b) { return '<p>' + b.html + '</p>'; });
  CK.blocks.register('code', renderCode);
  CK.blocks.register('list', function (b) {
    var tag = b.ordered ? 'ol' : 'ul';
    return '<' + tag + '>' + b.items.map(function (it) { return '<li>' + it + '</li>'; }).join('') + '</' + tag + '>';
  });
  CK.blocks.register('image', function (b) {
    return '<figure class="figure"><img src="' + esc(b.src) + '" alt="' + esc(b.alt || '') + '">' +
      (b.caption ? '<figcaption>' + esc(b.caption) + '</figcaption>' : '') + '</figure>';
  });
  CK.blocks.register('callout', function (b) {
    var variant = b.variant || 'note';
    return '<div class="callout callout--' + variant + '">' +
      '<div class="callout__icon">' + (ICON[variant] || ICON.note) + '</div>' +
      '<div class="callout__title">' + esc(b.title || t('callout.' + variant)) + '</div>' +
      '<div class="callout__body">' + b.html + '</div></div>';
  });

  function renderBlock(b) { var fn = BLOCKS[b.type]; return fn ? fn(b) : ''; }

  /* ---------- mount ---------- */
  function mount(html, keepScroll) {
    var el = document.querySelector(cfg().mount || '#app');
    el.innerHTML = html;
    if (!keepScroll) window.scrollTo({ top: 0, behavior: 'auto' });
    updateAppbar();
  }
  function updateAppbar() {
    var bar = document.getElementById('appbar-progress');
    if (!bar) return;
    var total = cfg().chapters.length, passed = store().passedCount();
    bar.hidden = false;
    document.getElementById('appbar-progress-label').textContent = t('appbar.progress', { p: passed, t: total });
    document.getElementById('appbar-progress-fill').style.width = Math.round((passed / total) * 100) + '%';
  }

  /* ---------- pages ---------- */
  function chapterMeta(id) { return cfg().chapters.find(function (c) { return c.id === id; }); }
  function currentChapterId() {
    var found = cfg().chapters.find(function (c) { return !store().isPassed(c.id); });
    return found ? found.id : cfg().chapters[cfg().chapters.length - 1].id;
  }

  // Optional "who is this course for" panel — rendered only if the course supplies its strings.
  function audiencePanel() {
    if (i18n().raw('audience.heading') == null) return '';
    var levelOn = { beginner: 1, intermediate: 1 };
    var meter = ['beginner', 'intermediate', 'advanced'].map(function (s) {
      return '<span class="levelmeter__step' + (levelOn[s] ? ' is-on' : '') + '">' + esc(diffLabel(s)) + '</span>';
    }).join('');
    var prereqs = (i18n().raw('audience.prereq.items') || []).map(function (it) { return '<li>' + it + '</li>'; }).join('');
    return '<section class="audience read stagger">' +
        '<div class="audience__head"><span class="audience__icon">🎯</span><h2>' + esc(t('audience.heading')) + '</h2></div>' +
        '<div class="audience__grid">' +
          '<div><span class="audience__label">' + esc(t('audience.level.label')) + '</span>' +
            '<div class="levelmeter">' + meter + '</div>' +
            '<p class="audience__desc">' + esc(t('audience.level.desc')) + '</p></div>' +
          '<div><span class="audience__label">' + esc(t('audience.prereq.label')) + '</span>' +
            '<ul class="checklist">' + prereqs + '</ul></div>' +
        '</div>' +
      '</section>';
  }

  function renderHome() {
    var total = cfg().chapters.length, passed = store().passedCount();
    var current = currentChapterId();
    var cards = cfg().chapters.map(function (c) {
      var done = store().isPassed(c.id);
      var res = store().getResult(c.id);
      var cls = 'chapter' + (c.id === current && !done ? ' is-current' : '');
      var status = done ? '<span class="chapter__status is-done">✓ ' + t('chapter.passed') + '</span>' : '';
      var tag = '<span class="tag tag--' + c.difficulty + '">' + diffLabel(c.difficulty) + '</span>';
      var score = res ? '<div class="chapter__score">' + t('chapter.best', { n: res.best }) + '</div>' : '';
      return '<a class="' + cls + '" href="' + chapterUrl(c.id) + '">' +
        '<span class="chapter__num">' + String(c.num).padStart(2, '0') + '</span>' +
        '<span class="chapter__body"><span class="chapter__title">' + esc(chapterTitle(c)) + '</span>' +
        '<span class="chapter__meta">' + tag + status + '</span>' + score + '</span></a>';
    }).join('');

    mount(
      '<div class="page">' +
        '<section class="hero read stagger">' +
          '<span class="hero__eyebrow">' + esc(t('home.eyebrow')) + '</span>' +
          '<h1 class="hero__title">' + esc(t('home.title')) + '</h1>' +
          '<p class="hero__lead">' + esc(t('home.lead', { threshold: cfg().passThreshold })) + '</p>' +
          '<div class="hero__stats">' +
            '<div class="hero__stat"><b>' + total + '</b><span>' + esc(t('home.stat.chapters')) + '</span></div>' +
            '<div class="hero__stat"><b>' + passed + '</b><span>' + esc(t('home.stat.passed')) + '</span></div>' +
            '<div class="hero__stat"><b>' + cfg().passThreshold + '%</b><span>' + esc(t('home.stat.threshold')) + '</span></div>' +
          '</div>' +
          (function () {
            var contId = store().getCurrent();
            var contMeta = chapterMeta(contId);
            var contNum = contMeta ? contMeta.num : '';
            return '<a class="btn btn--primary btn--lg hero__continue" href="' + chapterUrl(contId) + '">' +
              esc(t('home.continue')) + (contNum ? ' ' + contNum : '') + '</a>';
          })() +
        '</section>' +
        audiencePanel() +
        '<section class="chapters stagger">' + cards + '</section>' +
      '</div>'
    );
  }

  function renderLesson(chapterId) {
    var c = chapterMeta(chapterId);
    var lesson = i18n().lesson(chapterId);
    if (!c) { location.href = homeUrl(); return; }
    if (!lesson) { return renderComingSoon(c); }

    var body = (lesson.sections || []).map(renderBlock).join('');
    var passed = store().isPassed(chapterId);
    mount(
      '<div class="page read">' +
        '<div class="lesson__kicker">' + esc(t('lesson.kicker', { n: c.num, diff: diffLabel(c.difficulty) })) + '</div>' +
        '<h1 class="lesson__title">' + esc(lesson.title) + '</h1>' +
        '<div class="prose">' + body + '</div>' +
        '<div class="lessonnav">' +
          '<a class="btn btn--ghost" href="' + homeUrl() + '">← ' + esc(t('nav.home')) + '</a>' +
          '<a class="btn btn--primary btn--lg" href="#quiz">' +
            esc(passed ? t('lesson.reviewQuiz') : t('lesson.takeQuiz')) + ' →</a>' +
        '</div>' +
      '</div>'
    );
  }

  function renderQuiz(keepScroll) {
    var q = state().currentQuiz;
    var c = chapterMeta(state().currentChapter);
    if (!q) { location.hash = '#lesson'; return; }
    var item = q.questions[q.index];
    var total = q.questions.length, n = q.index + 1;
    var selected = q.answers[q.index];

    var opts = item.options.map(function (text, i) {
      return '<button class="opt' + (selected === i ? ' is-selected' : '') + '" data-action="select-opt" data-opt="' + i + '">' +
        '<span class="opt__key">' + optKey(i) + '</span><span class="opt__text">' + esc(text) + '</span></button>';
    }).join('');

    var isLast = q.index === total - 1;
    var nextBtn = isLast
      ? '<button class="btn btn--primary" data-action="q-submit"' + (q.allAnswered() ? '' : ' disabled') + '>' + esc(t('quiz.submit')) + ' ✓</button>'
      : '<button class="btn btn--primary" data-action="q-next"' + (selected == null ? ' disabled' : '') + '>' + esc(t('quiz.next')) + ' →</button>';

    mount(
      '<div class="page read">' +
        '<div class="quiz__head">' +
          '<h1>' + esc(t('quiz.title', { n: c.num })) + '</h1>' +
          '<span class="quiz__count">' + esc(t('quiz.count', { n: n, total: total })) + '</span>' +
        '</div>' +
        '<div class="quiz__bar"><span class="quiz__bar-fill" style="width:' + Math.round((n / total) * 100) + '%"></span></div>' +
        '<div class="qcard">' +
          '<div class="qcard__stem">' + esc(item.question) + '</div>' +
          (item.code ? renderCode({ lang: 'go', code: item.code }) : '') +
          '<div class="options">' + opts + '</div>' +
        '</div>' +
        '<div class="quiz__actions">' +
          '<button class="btn btn--ghost" data-action="q-prev"' + (q.index === 0 ? ' disabled' : '') + '>← ' + esc(t('quiz.prev')) + '</button>' +
          nextBtn +
        '</div>' +
      '</div>',
      keepScroll
    );
  }

  function renderResults(chapterId) {
    var c = chapterMeta(chapterId);
    var q = state().currentQuiz;
    if (!q) {
      var r = store().getResult(chapterId);
      if (!r) { location.hash = '#lesson'; return; }
      return renderStoredSummary(c, r);
    }
    var res = q.result();
    var idx = cfg().chapters.findIndex(function (x) { return x.id === chapterId; });
    var next = cfg().chapters[idx + 1];

    var review = q.questions.map(function (item, i) {
      var your = q.answers[i];
      var ok = your === item.correctIndex;
      var opts = item.options.map(function (text, oi) {
        var cls = 'opt';
        if (oi === item.correctIndex) cls += ' is-correct';
        else if (oi === your) cls += ' is-wrong';
        var mark = oi === item.correctIndex ? '<span class="opt__mark">✓</span>'
          : (oi === your ? '<span class="opt__mark">✗</span>' : '');
        return '<div class="' + cls + '"><span class="opt__key">' + optKey(oi) + '</span>' +
          '<span class="opt__text">' + esc(text) + '</span>' + mark + '</div>';
      }).join('');
      return '<div class="review__item">' +
        '<div class="review__q"><span class="review__badge ' + (ok ? 'ok' : 'no') + '">' + (ok ? '✓' : '✗') + '</span>' +
          '<span>' + esc(item.question) + '</span></div>' +
        (item.code ? renderCode({ lang: 'go', code: item.code }) : '') +
        '<div class="options">' + opts + '</div>' +
        (item.explanation ? '<div class="review__explain"><b>' + esc(t('result.explainLabel')) + '</b> ' + item.explanation + '</div>' : '') +
        '</div>';
    }).join('');

    var actions = '';
    if (res.passed) {
      if (next) actions += '<a class="btn btn--primary btn--lg" href="' + chapterUrl(next.id) + '">' + esc(t('result.next', { n: next.num })) + ' →</a>';
      else actions += '<a class="btn btn--primary btn--lg" href="' + homeUrl() + '">' + esc(t('result.finish')) + '</a>';
    } else {
      actions += '<a class="btn btn--primary btn--lg" href="#quiz">' + esc(t('result.retry')) + ' ↻</a>';
      actions += '<a class="btn btn--ghost" href="#lesson">' + esc(t('result.reviewLesson')) + '</a>';
    }
    actions += '<a class="btn btn--ghost" href="' + homeUrl() + '">' + esc(t('nav.home')) + '</a>';

    mount(
      '<div class="page read">' +
        '<div class="result__hero ' + (res.passed ? 'is-pass' : 'is-fail') + '">' +
          '<div class="result__score">' + res.percent + '%</div>' +
          '<div class="result__verdict">' + esc(res.passed ? t('result.pass') : t('result.fail')) + '</div>' +
          '<div class="result__detail">' + esc(t('result.detail', { c: res.correct, t: res.total, threshold: cfg().passThreshold })) + '</div>' +
        '</div>' +
        '<div class="result__actions">' + actions + '</div>' +
        '<h2>' + esc(t('result.answerKey')) + '</h2>' +
        '<div class="stagger">' + review + '</div>' +
      '</div>'
    );
  }

  function renderStoredSummary(c, r) {
    mount('<div class="page read"><div class="result__hero ' + (r.passed ? 'is-pass' : 'is-fail') + '">' +
      '<div class="result__score">' + r.best + '%</div>' +
      '<div class="result__verdict">' + esc(r.passed ? t('result.passedShort') : t('result.notPassed')) + '</div>' +
      '<div class="result__detail">' + esc(t('result.bestDetail', { n: r.attempts })) + '</div></div>' +
      '<div class="result__actions">' +
        '<a class="btn btn--primary btn--lg" href="#quiz">' + esc(t('result.retake')) + '</a>' +
        '<a class="btn btn--ghost" href="' + homeUrl() + '">' + esc(t('nav.home')) + '</a>' +
      '</div></div>');
  }

  function renderComingSoon(c) {
    mount('<div class="page read"><div class="lesson__kicker">' + esc(t('chapter.n', { n: c.num })) + '</div>' +
      '<h1 class="lesson__title">' + esc(chapterTitle(c)) + '</h1>' +
      '<div class="callout callout--note"><div class="callout__icon">🛠️</div>' +
      '<div class="callout__title">' + esc(t('soon.title')) + '</div>' +
      '<div class="callout__body">' + esc(t('soon.body')) + '</div></div>' +
      '<div class="lessonnav"><a class="btn btn--ghost" href="' + homeUrl() + '">← ' + esc(t('nav.home')) + '</a></div></div>');
  }

  CK.render = {
    home: renderHome,
    lesson: renderLesson,
    quiz: renderQuiz,
    results: renderResults,
    block: renderBlock,
    esc: esc,
    chapterMeta: chapterMeta,
    homeUrl: homeUrl,
    chapterUrl: chapterUrl
  };
})(window);
