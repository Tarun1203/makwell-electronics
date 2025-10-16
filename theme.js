// theme.js — remembers theme, toggles attribute on <html>
(function () {
  const KEY = 'mw_theme';
  const html = document.documentElement;

  function apply(theme) {
    if (theme === 'dark') html.setAttribute('data-theme', 'dark');
    else html.removeAttribute('data-theme'); // light by default
  }

  // initial theme: stored -> system pref -> light
  const stored = localStorage.getItem(KEY);
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  apply(stored || (prefersDark ? 'dark' : 'light'));

  // button hookup
  function label() {
    const isDark = html.getAttribute('data-theme') === 'dark';
    return isDark ? '🌙 Dark' : '☀️ Light';
  }

  window.toggleTheme = function () {
    const isDark = html.getAttribute('data-theme') === 'dark';
    const next = isDark ? 'light' : 'dark';
    apply(next);
    localStorage.setItem(KEY, next);
    const b = document.getElementById('themeToggle');
    if (b) b.innerText = label();
  };

  // set initial label when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    const b = document.getElementById('themeToggle');
    if (b) b.innerText = label();
  });
})();
