/* CourseKit.storage — localStorage persistence, versioned. Keys are prefixed
   with config.courseId so multiple courses on one origin never collide. */
(function (global) {
  'use strict';
  var CK = global.CourseKit || (global.CourseKit = {});

  var VERSION = 1;
  function cfg() { return CK.config || {}; }
  function key(suffix) { return cfg().courseId + ':' + suffix; }

  function read(k, fallback) {
    try { var v = localStorage.getItem(k); return v == null ? fallback : JSON.parse(v); }
    catch (e) { return fallback; }
  }
  function write(k, val) {
    try { localStorage.setItem(k, JSON.stringify(val)); } catch (e) {}
  }

  function migrate() {
    var v = read(key('version'), 0);
    if (v < 1) { /* fresh install or pre-v1: nothing to migrate yet */ }
    write(key('version'), VERSION);
  }

  CK.storage = {
    migrate: migrate,

    getLocale: function () { return read(key('settings:locale'), null); },   // null → i18n falls back to defaultLocale
    setLocale: function (loc) { write(key('settings:locale'), loc); },

    getResults: function () { return read(key('results'), {}); },
    getResult: function (chapterId) { return this.getResults()[chapterId] || null; },

    saveResult: function (chapterId, percent, correct, total) {
      var all = this.getResults();
      var prev = all[chapterId] || { best: 0, attempts: 0, passed: false };
      var rec = {
        best: Math.max(prev.best || 0, percent),
        last: percent,
        correct: correct,
        total: total,
        passed: prev.passed || percent >= cfg().passThreshold,
        attempts: (prev.attempts || 0) + 1,
        at: new Date().toISOString()
      };
      all[chapterId] = rec;
      write(key('results'), all);
      return rec;
    },

    isPassed: function (chapterId) { var r = this.getResult(chapterId); return !!(r && r.passed); },

    // All chapters are open — learners may skip ahead freely.
    isUnlocked: function (chapterId) { return true; },

    passedCount: function () {
      var all = this.getResults(), n = 0;
      cfg().chapters.forEach(function (c) { if (all[c.id] && all[c.id].passed) n++; });
      return n;
    },

    setCurrent: function (chapterId) { write(key('progress:current'), chapterId); },
    getCurrent: function () { return read(key('progress:current'), cfg().chapters[0].id); },

    reset: function () { [key('results'), key('progress:current')].forEach(function (k) { localStorage.removeItem(k); }); }
  };
})(window);
