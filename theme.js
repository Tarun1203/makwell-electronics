/* Single dark/light toggle used by ALL pages */
(function () {
  const KEY = 'mw_theme';
  const html = document.documentElement;

  function set(t) {
    t === 'dark' ? html.setAttribute('data-theme', 'dark')
                 : html.removeAttribute('data-theme');
  }

  const stored = localStorage.getItem(KEY);
  const prefers = window.matchMedia &&
                  window.matchMedia('(prefers-color-scheme: dark)').matches;
  set(stored || (prefers ? 'dark' : 'light'));

  function label() {
    const b = document.getElementById('themeToggle');
    if (b) b.textContent = html.getAttribute('data-theme') === 'dark'
      ? '🌙 Dark' : '☀️ Light';
  }

  window.toggleTheme = function () {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    set(next);
    localStorage.setItem(KEY, next);
    label();
  };

  document.addEventListener('DOMContentLoaded', label);
})();
