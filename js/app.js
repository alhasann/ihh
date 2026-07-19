(function () {
  "use strict";

  var STORAGE_KEY = "ilo-dossier-lang";
  var cfg = window.ILO_I18N;
  if (!cfg) return;

  function getStoredLang() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored && cfg.langs[stored]) return stored;
    } catch (e) { /* private mode */ }
    return cfg.defaultLang || "ar";
  }

  function persistLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) { /* ignore */ }
  }

  function t(lang, key) {
    var pack = cfg.strings[lang] || cfg.strings[cfg.defaultLang] || {};
    if (pack[key] != null) return pack[key];
    var fallback = cfg.strings[cfg.defaultLang] || {};
    return fallback[key] != null ? fallback[key] : key;
  }

  function applyLanguage(lang) {
    if (!cfg.langs[lang]) lang = cfg.defaultLang;
    var meta = cfg.langs[lang];
    var root = document.documentElement;

    root.setAttribute("lang", meta.htmlLang);
    root.setAttribute("dir", meta.dir);
    document.title = t(lang, "meta.title");

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (!key) return;
      el.textContent = t(lang, key);
    });

    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-html");
      if (!key) return;
      el.innerHTML = t(lang, key);
    });

    document.querySelectorAll("[data-i18n-tip]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-tip");
      if (!key) return;
      el.setAttribute("data-tip", t(lang, key));
    });

    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      var btnLang = btn.getAttribute("data-lang");
      var active = btnLang === lang;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

    var switcher = document.querySelector("[data-lang-switch]");
    if (switcher) {
      switcher.setAttribute("aria-label", t(lang, "lang.aria"));
    }

    persistLang(lang);
    document.dispatchEvent(new CustomEvent("ilo:langchange", { detail: { lang: lang } }));
  }

  function init() {
    var switcher = document.querySelector("[data-lang-switch]");
    if (switcher) {
      switcher.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-lang]");
        if (!btn || !switcher.contains(btn)) return;
        applyLanguage(btn.getAttribute("data-lang"));
      });
    }

    applyLanguage(getStoredLang());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.ILOLang = {
    set: applyLanguage,
    get: getStoredLang,
    t: function (key) { return t(getStoredLang(), key); }
  };
})();
