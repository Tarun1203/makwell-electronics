<!-- /theme.js -->
<script>
// MakWell global theme controller
(function () {
  const KEY = 'mw_theme';
  const root = document.documentElement;

  // Apply theme to <html data-theme="dark" | remove attr>
  function apply(theme) {
    if (theme === 'dark') root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
    syncButtonLabel();
  }

  // Preferred from OS (used only on first visit when no saved value)
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');

  // Initialize from storage or OS
  const stored = localStorage.getItem(KEY);
  apply(stored || (prefersDark && prefersDark.matches ? 'dark' : 'light'));

  // Public toggle (available to inline onclick handlers)
  window.toggleTheme = function () {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    localStorage.setItem(KEY, next);
    apply(next);
  };

  // Keep button label in sync everywhere
  function syncButtonLabel() {
    // if you have multiple header instances (mobile menu), update all
    document.querySelectorAll('#themeToggle').forEach(btn => {
      const isDark = root.getAttribute('data-theme') === 'dark';
      btn.textContent = isDark ? '🌙 Dark' : '☀️ Light';
      btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      btn.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    });
  }

  // If the OS theme changes and the user hasn't chosen manually, follow it
  try {
    prefersDark && prefersDark.addEventListener('change', (e) => {
      const saved = localStorage.getItem(KEY);
      if (!saved) apply(e.matches ? 'dark' : 'light');
    });
  } catch {}

  // On DOM ready, ensure labels are correct
  document.addEventListener('DOMContentLoaded', syncButtonLabel);
})();
</script>
