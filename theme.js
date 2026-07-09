// ===== THEME.JS — Toggle Mode Terang / Gelap =====
// Preferensi disimpan di localStorage supaya tetap konsisten antar halaman.

(function () {
  const THEME_KEY = 'eujianTheme';
  const saved = localStorage.getItem(THEME_KEY) || 'light';
  document.documentElement.setAttribute('data-theme', saved);
})();

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('eujianTheme', next);
  updateThemeButton();
}

function updateThemeButton() {
  const btn = document.getElementById('theme-toggle-btn');
  if (!btn) return;
  const theme = document.documentElement.getAttribute('data-theme') || 'light';
  btn.innerHTML = theme === 'dark' ? '☀️ Terang' : '🌙 Gelap';
}

document.addEventListener('DOMContentLoaded', updateThemeButton);
