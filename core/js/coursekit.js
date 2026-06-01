/* CourseKit — namespace, init(), boot, delegated interactions, host-driven routing.
   A course calls CourseKit.init(config) after its content scripts have loaded;
   each static page declares window.PAGE = { locale, view, chapterId, rel }. */
(function (global) {
  'use strict';
  var CK = global.CourseKit || (global.CourseKit = {});
  CK._state = { currentQuiz: null, currentChapter: null };

  function cfg() { return CK.config; }
  function esc(s) { return CK.render.esc(s); }
  function setText(id, str) { var el = document.getElementById(id); if (el) el.textContent = str; }

  function localeUrl(loc) {
    var p = global.PAGE || {}, rel = p.rel || '';
    if (p.view === 'lesson') return rel + loc + '/chapter/' + p.chapterId + '/index.html';
    return rel + loc + '/index.html';
  }

  function onClick(e) {
    var target = e.target.closest('[data-action]');
    if (!target) return;
    var q = CK._state.currentQuiz;
    if (!q) return;
    var action = target.dataset.action;

    if (action === 'select-opt') { q.setAnswer(parseInt(target.dataset.opt, 10)); CK.render.quiz(true); return; }
    if (action === 'q-next') { if (q.index < q.questions.length - 1) q.index++; CK.render.quiz(); return; }
    if (action === 'q-prev') { if (q.index > 0) q.index--; CK.render.quiz(); return; }
    if (action === 'q-submit') {
      if (!q.allAnswered()) return;
      var res = q.result();
      q.submitted = true;
      CK.storage.saveResult(CK._state.currentChapter, res.percent, res.correct, res.total);
      location.hash = '#results';
    }
  }

  function renderLangSwitch() {
    var el = document.getElementById('lang-switch');
    if (!el) return;
    var locales = cfg().locales || [];
    if (locales.length < 2) { el.hidden = true; return; }
    el.hidden = false;
    var cur = CK.i18n.getLocale();
    var labels = cfg().localeLabels || {};
    el.innerHTML = locales.map(function (loc) {
      var label = labels[loc] || loc.toUpperCase();
      return '<button type="button" data-loc="' + loc + '"' + (loc === cur ? ' class="is-active"' : '') + '>' + esc(label) + '</button>';
    }).join('');
    el.onclick = function (e) {
      var b = e.target.closest('button[data-loc]');
      if (!b) return;
      var loc = b.dataset.loc;
      if (loc !== CK.i18n.getLocale()) { CK.storage.setLocale(loc); location.href = localeUrl(loc); }
    };
  }

  /* ---------- host-driven routing (window.PAGE) ---------- */
  function renderChapterView() {
    var id = global.PAGE.chapterId;
    CK._state.currentChapter = id;
    var h = location.hash;
    if (h === '#quiz') {
      if (!CK._state.currentQuiz || CK._state.currentQuiz.submitted) {
        var bank = CK.i18n.questions(id);
        if (!bank.length) { location.hash = '#lesson'; return; }
        CK._state.currentQuiz = CK.quiz.create(bank);
      }
      CK.render.quiz();
    } else if (h === '#results') {
      CK.render.results(id);
    } else {
      CK._state.currentQuiz = null;
      CK.render.lesson(id);
    }
  }

  function start() {
    var p = global.PAGE || {};
    if (p.view === 'lesson') {
      CK.storage.setCurrent(p.chapterId);            // remember last chapter for "Continue"
      window.addEventListener('hashchange', renderChapterView);
      renderChapterView();
      return;
    }
    CK.render.home();
  }

  CK.init = function (config) {
    CK.config = config;
    function boot() {
      CK.storage.migrate();
      CK.i18n._resolve();
      document.documentElement.lang = CK.i18n.getLocale();
      setText('appbar-sub', CK.i18n.t('appbar.sub'));
      setText('appfoot-text', CK.i18n.t('footer'));
      var author = document.getElementById('appfoot-author');
      if (author && config.author) author.innerHTML = CK.i18n.t('footer.author') + ' <strong>' + esc(config.author) + '</strong>';
      setText('appfoot-license', CK.i18n.t('footer.license'));
      renderLangSwitch();
      var mountEl = document.querySelector(config.mount || '#app');
      if (mountEl) mountEl.addEventListener('click', onClick);
      start();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
  };
})(window);
