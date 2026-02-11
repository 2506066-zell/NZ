import { initProtected, setTheme, logout } from './main.js';
function init() {
  initProtected();
  const current = localStorage.getItem('theme') || 'dark';
  const select = document.querySelector('#theme-select');
  select.value = current;
  select.addEventListener('change', e => setTheme(e.target.value));
  document.querySelector('#logout-btn').addEventListener('click', logout);
}
document.addEventListener('DOMContentLoaded', init);
