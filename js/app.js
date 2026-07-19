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

    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-aria");
      if (!key) return;
      el.setAttribute("aria-label", t(lang, key));
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

    var toggle = document.getElementById("nav-toggle");
    if (toggle) {
      toggle.setAttribute("aria-label", t(lang, "nav.sections"));
    }

    persistLang(lang);
    document.dispatchEvent(new CustomEvent("ilo:langchange", { detail: { lang: lang } }));
  }

  function closeNav() {
    var nav = document.getElementById("site-nav");
    var toggle = document.getElementById("nav-toggle");
    if (!nav) return;
    nav.classList.remove("is-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }

  function initNav() {
    var nav = document.getElementById("site-nav");
    var toggle = document.getElementById("nav-toggle");
    var links = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
    var sections = links
      .map(function (link) {
        var id = (link.getAttribute("href") || "").replace(/^#/, "");
        return id ? document.getElementById(id) : null;
      })
      .filter(Boolean);

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = !nav.classList.contains("is-open");
        nav.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    links.forEach(function (link) {
      link.addEventListener("click", function () {
        closeNav();
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });

    document.addEventListener("click", function (e) {
      if (!nav || !nav.classList.contains("is-open")) return;
      if (nav.contains(e.target)) return;
      closeNav();
    });

    if (!("IntersectionObserver" in window) || !sections.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        var visible = entries
          .filter(function (entry) { return entry.isIntersecting; })
          .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; });

        if (!visible.length) return;
        var id = visible[0].target.id;
        links.forEach(function (link) {
          var active = link.getAttribute("href") === "#" + id;
          link.classList.toggle("active", active);
        });
      },
      {
        rootMargin: "-30% 0px -55% 0px",
        threshold: [0.1, 0.25, 0.5]
      }
    );

    sections.forEach(function (section) { observer.observe(section); });
  }

  function initProjectLinks() {
    var why = document.querySelector("#why .card.why");
    if (!why) return;
    why.addEventListener("click", function (e) {
      var a = e.target.closest("a[href*='portal.ihh.org.tr/crea/project/project/detail/']");
      if (!a || !why.contains(a)) return;
      e.preventDefault();
      e.stopPropagation();
      window.open(a.href, "_blank", "noopener,noreferrer");
    });
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
    initNav();
    initProjectLinks();
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
