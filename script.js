(function () {
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("siteNav");
  var header = document.getElementById("header");
  var themeToggle = document.getElementById("themeToggle");
  var backToTop = document.getElementById("backToTop");
  var root = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Theme toggle
  function effectiveIsDark() {
    var attr = root.getAttribute("data-theme");
    if (attr === "dark") return true;
    if (attr === "light") return false;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function updateToggleState() {
    if (!themeToggle) return;
    var isDark = effectiveIsDark();
    themeToggle.classList.toggle("is-dark", isDark);
    themeToggle.setAttribute("aria-pressed", String(isDark));
  }

  function applyTheme(theme) {
    if (theme === "dark" || theme === "light") {
      root.setAttribute("data-theme", theme);
    } else {
      root.removeAttribute("data-theme");
    }
    updateToggleState();
  }

  var storedTheme = null;
  try {
    storedTheme = localStorage.getItem("theme");
  } catch (e) {}
  applyTheme(storedTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = effectiveIsDark() ? "light" : "dark";
      try {
        localStorage.setItem("theme", next);
      } catch (e) {}
      applyTheme(next);
    });
  }

  // Header shadow + back-to-top visibility on scroll
  var ticking = false;
  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 8);
    if (backToTop) backToTop.classList.toggle("visible", window.scrollY > 400);
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  // Scrollspy
  var navLinks = nav ? Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]')) : [];
  var sections = navLinks
    .map(function (link) {
      return document.getElementById(link.getAttribute("href").slice(1));
    })
    .filter(Boolean);

  function updateActiveLink() {
    var headerHeight = header ? header.offsetHeight : 0;
    var pos = window.scrollY + headerHeight + 24;
    var current = sections[0];
    sections.forEach(function (section) {
      if (section.offsetTop <= pos) current = section;
    });
    navLinks.forEach(function (link) {
      var isActive = current && link.getAttribute("href") === "#" + current.id;
      link.classList.toggle("active", isActive);
    });
  }
  if (sections.length) {
    window.addEventListener("scroll", function () {
      window.requestAnimationFrame(updateActiveLink);
    });
    updateActiveLink();
  }

  // Reveal on scroll, staggered per parent group
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  var parentCounters = new Map();
  revealEls.forEach(function (el) {
    var count = parentCounters.get(el.parentElement) || 0;
    el.style.transitionDelay = Math.min(count * 70, 350) + "ms";
    parentCounters.set(el.parentElement, count + 1);
  });

  var statsAnimated = false;
  function animateStats(container) {
    if (statsAnimated || reduceMotion) return;
    statsAnimated = true;
    container.querySelectorAll(".stat-num").forEach(function (el) {
      var match = el.textContent.match(/^(\d+)(.*)$/);
      if (!match) return;
      var target = parseInt(match[1], 10);
      var suffix = match[2];
      var start = performance.now();
      var duration = 1000;
      function step(now) {
        var progress = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (progress < 1) window.requestAnimationFrame(step);
      }
      window.requestAnimationFrame(step);
    });
  }

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            if (entry.target.classList.contains("hero-stats")) {
              animateStats(entry.target);
            }
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }
})();
