/* CourseKit.i18n — locale resolution + content access.
   Content lives in window globals UI_<LOC> / LESSONS_<LOC> / QUESTIONS_<LOC>
   (course-agnostic convention). Missing bundles fall back to config.baseLocale. */
(function (global) {
  'use strict';
  var CK = global.CourseKit || (global.CourseKit = {});
  var locale = null;

  function cfg() { return CK.config || {}; }
  function base() { return cfg().baseLocale || 'en'; }

  function detect() {
    var langs = (global.navigator && navigator.languages) ? Array.from(navigator.languages) : [];
    if (global.navigator && navigator.language) langs.unshift(navigator.language);
    var locs = cfg().locales || [];
    for (var i = 0; i < langs.length; i++) {
      var p = (langs[i] || '').toLowerCase().slice(0, 2);
      if (locs.indexOf(p) >= 0) return p;
    }
    return cfg().defaultLocale || base();
  }

  function bundle(name) {
    var up = locale.toUpperCase();
    return global[name + '_' + up] || global[name + '_' + base().toUpperCase()] || {};
  }

  CK.i18n = {
    // Resolve the active locale: URL (PAGE.locale) wins, then stored choice, then auto-detect.
    _resolve: function () {
      locale = (global.PAGE && global.PAGE.locale) || (CK.storage && CK.storage.getLocale()) || detect();
      return locale;
    },
    getLocale: function () { return locale || this._resolve(); },
    setLocale: function (loc) { locale = loc; CK.storage.setLocale(loc); },

    raw: function (key) { var ui = bundle('UI'); return ui ? ui[key] : undefined; },

    t: function (key, vars) {
      var s = this.raw(key);
      if (s == null) return key;
      s = String(s);
      if (vars) Object.keys(vars).forEach(function (k) { s = s.replace('{' + k + '}', vars[k]); });
      return s;
    },

    lessons: function () { return bundle('LESSONS'); },
    lesson: function (chapterId) { return this.lessons()[chapterId] || null; },
    questions: function (chapterId) { return (bundle('QUESTIONS')[chapterId]) || []; }
  };
})(window);
