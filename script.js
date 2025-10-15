document.addEventListener('DOMContentLoaded', () => {
  // ===== Theme toggle with localStorage persistence =====
  const root = document.documentElement;
  const themeKey = 'makwell-theme';
  const toggleBtn = document.getElementById('theme-toggle');
  const toggleIcon = toggleBtn?.querySelector('.toggle-icon');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (toggleIcon) toggleIcon.textContent = theme === 'dark' ? '☀︎' : '☾';
  }

  // Initial theme: saved -> system -> light
  const saved = localStorage.getItem(themeKey);
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved || (prefersDark ? 'dark' : 'light'));

  toggleBtn?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    localStorage.setItem(themeKey, next);
    applyTheme(next);
  });

  // ===== Minimal, dependency-free carousel =====
  const track = document.getElementById('carousel-track');
  const prev = document.getElementById('prev-slide');
  const next = document.getElementById('next-slide');
  const dotsWrap = document.getElementById('carousel-dots');

  if (track) {
    const slides = Array.from(track.querySelectorAll('.slide'));
    let index = 0;
    let autoTimer = null;
    const AUTO_MS = 6000;

    // Build dots
    slides.forEach((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', `Go to slide ${i + 1}`);
      b.addEventListener('click', () => goTo(i, true));
      dotsWrap?.appendChild(b);
    });

    function setDots(i) {
      const dots = dotsWrap ? Array.from(dotsWrap.children) : [];
      dots.forEach((d, di) => d.setAttribute('aria-selected', di === i ? 'true' : 'false'));
    }

    function goTo(i, user = false) {
      index = (i + slides.length) % slides.length;
      const offset = index * track.clientWidth;
      track.scrollTo({ left: offset, behavior: user ? 'smooth' : 'instant' });
      slides.forEach((s, si) => s.classList.toggle('is-active', si === index));
      setDots(index);
      resetAuto();
    }

    function nextSlide() { goTo(index + 1, true); }
    function prevSlide() { goTo(index - 1, true); }

    next?.addEventListener('click', nextSlide);
    prev?.addEventListener('click', prevSlide);

    // Keyboard support
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    });

    // Resize handler keeps slide in view on viewport changes
    window.addEventListener('resize', () => goTo(index));

    // Touch/drag swipe (simple)
    let startX = 0, isDown = false;
    track.addEventListener('pointerdown', (e) => { isDown = true; startX = e.clientX; track.setPointerCapture(e.pointerId); });
    track.addEventListener('pointerup',   (e) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      if (dx > 50) prevSlide();
      else if (dx < -50) nextSlide();
      isDown = false;
      track.releasePointerCapture(e.pointerId);
    });

    // Auto-advance (pause on hover/focus)
    function resetAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(() => goTo(index + 1), AUTO_MS);
    }
    track.addEventListener('mouseenter', () => clearInterval(autoTimer));
    track.addEventListener('mouseleave', resetAuto);
    track.addEventListener('focusin', () => clearInterval(autoTimer));
    track.addEventListener('focusout', resetAuto);

    // Init
    goTo(0);
    resetAuto();
  }
});
