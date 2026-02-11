function requireAuth() {
  const t = localStorage.getItem('token');
  if (!t) location.href = '/login.html';
}
function registerSW() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
}
function loadTheme() {
  const t = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', t);
}
export function setTheme(t) {
  localStorage.setItem('theme', t);
  document.documentElement.setAttribute('data-theme', t);
}
function ensureToastRoot() {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    document.body.appendChild(el);
  }
  return el;
}
export function showToast(text, type = 'info', timeout = 2500) {
  const root = ensureToastRoot();
  const item = document.createElement('div');
  item.className = 'toast-item';
  if (type === 'error') item.style.background = 'rgba(225,29,72,0.9)';
  if (type === 'success') item.style.background = 'rgba(34,197,94,0.9)';
  item.textContent = text;
  root.appendChild(item);
  setTimeout(() => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(6px)';
    setTimeout(() => item.remove(), 220);
  }, timeout);
}
export function initProtected() {
  requireAuth();
  registerSW();
  loadTheme();
  startHeroTimer();
}

function startHeroTimer() {
  const heroTimer = document.getElementById('hero-timer');
  if (!heroTimer) return;

  const startDate = new Date('2025-11-23T00:00:00').getTime();
  const elDays = document.getElementById('t-days');
  const elHours = document.getElementById('t-hours');
  const elMinutes = document.getElementById('t-minutes');
  const elSeconds = document.getElementById('t-seconds');

  function updateHero() {
    const now = Date.now();
    let diff = now - startDate;
    
    // Always use absolute difference for display
    diff = Math.abs(diff);
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    const pad = (n) => n.toString().padStart(2, '0');
    
    if (elDays) elDays.textContent = pad(days);
    if (elHours) elHours.textContent = pad(hours);
    if (elMinutes) elMinutes.textContent = pad(minutes);
    if (elSeconds) elSeconds.textContent = pad(seconds);
    
    requestAnimationFrame(updateHero);
  }
  
  updateHero();
}
export function logout() {
  localStorage.removeItem('token');
  location.href = '/login.html';
}

// Global listener for Demo Mode
document.addEventListener('demo-mode-active', () => {
  showToast('Backend offline. Demo Mode aktif (data lokal).', 'error', 5000);
});
