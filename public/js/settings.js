import { initProtected, setTheme, logout } from './main.js';
function init() {
  initProtected();
  const current = localStorage.getItem('theme') || 'dark';
  const select = document.querySelector('#theme-select');
  select.value = current;
  select.addEventListener('change', e => setTheme(e.target.value));
  document.querySelector('#logout-btn').addEventListener('click', logout);

  // Install Button Logic
  const installBtn = document.getElementById('install-btn');
  
  const showInstallBtn = () => {
    if (window.deferredPrompt) {
      installBtn.style.display = 'block';
    }
  };

  showInstallBtn();
  document.addEventListener('pwa-installable', showInstallBtn);

  installBtn.addEventListener('click', async () => {
    if (!window.deferredPrompt) return;
    window.deferredPrompt.prompt();
    const { outcome } = await window.deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      installBtn.style.display = 'none';
    }
    window.deferredPrompt = null;
  });
}
document.addEventListener('DOMContentLoaded', init);
