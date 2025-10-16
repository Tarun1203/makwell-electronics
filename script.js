/* =========================================================
   MakWell site script.js
   - Theme toggle with localStorage + prefers-color-scheme
   - Hero carousel: prev/next, dots sync, autoplay, pause-on-hover
   - No product rendering here (that's app.js)
   ========================================================= */

(function () {
  // -----------------------------
  // THEME TOGGLE
  // -----------------------------
  const THEME_KEY = 'mw-theme';

  function getSystemTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function getStoredTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch { return null; }
  }

  function setStoredTheme(theme) {
    try { localStorage.setItem(THEME_KEY, theme); } catch {}
  }

  function applyTheme(theme) {
    const t = theme || getSystemTheme();
    document.documentElement.setAttribute('data-theme', t);
    // optional: flip the toggle icon text
    const btn = document.getElementById('theme-toggle');
    const icon = btn ? btn.querySelector('.toggle-icon') : null;
    if (icon) icon.textContent = t === 'dark' ? '☀' : '☾';
  }

  // init theme ASAP
  applyTheme(getStoredTheme() || getSystemTheme());

  // respond to OS changes if user hasn't chosen explicitly
  if (window.matchMedia) {
    try {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      media.addEventListener('change', () => {
        if (!getStoredTheme()) applyTheme(getSystemTheme());
      });
    } catch {}
  }

  // wire toggle
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || getSystemTheme();
        const next = current === 'dark' ? 'light' : 'dark';
        setStoredTheme(next);
        applyTheme(next);
      });
    }
  });

  // -----------------------------
  // CAROUSEL
  // -----------------------------
  document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.carousel');
    const track = document.querySelector('.carousel-track');
    const prevBtn = document.getElementById('prev-slide');
    const nextBtn = document.getElementById('next-slide');
    const dotsWrap = document.getElementById('carousel-dots');

    if (!carousel || !track) return; // no carousel on this page

    const slides = Array.from(track.children).filter(el => el.classList.contains('slide'));
    if (!slides.length) return;

    let idx = Math.max(0, slides.findIndex(s => s.classList.contains('active')));
    if (idx < 0) idx = 0;

    // ARIA helpers
    slides.forEach((s, i) => {
      s.setAttribute('role', 'group');
      s.setAttribute('aria-roledescription', 'slide');
      s.setAttribute('aria-label', `Slide ${i + 1} of ${slides.length}`);
    });
    if (dotsWrap) dotsWrap.setAttribute('role', 'tablist');

    function show(i) {
      idx = (i + slides.length) % slides.length;
      slides.forEach((s, n) => {
        const active = n === idx;
        s.classList.toggle('active', active);
        s.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      // notify dots if app.js created them
      if (typeof window.__markDot === 'function') window.__markDot(idx);
    }

    // public hook for dots created in app.js
    window.__gotoSlide = (i) => show(i);

    // local dots if none provided yet
    if (dotsWrap && dotsWrap.children.length === 0) {
      slides.forEach((_, i) => {
        const b = document.createElement('button');
        b.className = 'dot' + (i === idx ? ' active' : '');
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-selected', i === idx ? 'true' : 'false');
        b.addEventListener('click', () => {
          show(i);
          // keep local dots in sync if app.js didn't override
          updateLocalDots();
        });
        dotsWrap.appendChild(b);
      });
    }

    function updateLocalDots() {
      if (!dotsWrap) return;
      const dots = dotsWrap.querySelectorAll('.dot');
      dots.forEach((d, i) => {
        const on = i === idx;
        d.classList.toggle('active', on);
        d.setAttribute('aria-selected', on ? 'true' : 'false');
      });
    }

    // controls
    prevBtn && prevBtn.addEventListener('click', () => { show(idx - 1); updateLocalDots(); });
    nextBtn && nextBtn.addEventListener('click', () => { show(idx + 1); updateLocalDots(); });

    // autoplay with pause on hover / focus
    let timer = null;
    const INTERVAL = 5000;

    function start() {
      stop();
      timer = setInterval(() => { show(idx + 1); updateLocalDots(); }, INTERVAL);
    }
    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    carousel.addEventListener('focusin', stop);
    carousel.addEventListener('focusout', start);

    // initial render
    show(idx);
    updateLocalDots();
    start();

    // also expose markDot for app.js-created dots (if app.js runs after)
    window.__markDot = (i) => {
      idx = i;
      updateLocalDots();
    };
  });

  // -------------------------------------------------------
  // (Legacy guard) If any old product-rendering code exists
  // below in a previous version of this file, bail out here.
  // -------------------------------------------------------
  // return; // Uncomment if you still keep legacy product code here.
})();
