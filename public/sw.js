const CACHE_NAME = 'cf-v8';
const ASSETS = [
  'login.html',
  'index.html',
  'memories.html',
  'anniversary.html',
  'daily-tasks.html',
  'college-assignments.html',
  'goals.html',
  'schedule.html',
  'chat.html',
  'settings.html',
  'manifest.json',
  'css/style.css',
  'css/themes.css',
  'js/main.js',
  'js/particles.js',
  'js/api.js',
  'js/login.js',
  'js/memories.js',
  'js/anniversary.js',
  'js/tasks.js',
  'js/assignments.js',
  'js/goals.js',
  'js/schedule.js',
  'js/chat.js',
  'js/settings.js'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.pathname.startsWith('/api/')) return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request).then(res => {
        const copy = res.clone();
        if (url.origin === self.location.origin) {
          caches.open(CACHE_NAME).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
