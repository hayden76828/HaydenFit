const CACHE = 'haydenfit-v4';
const BASE = self.location.pathname.replace('/sw.js', '');
const ASSETS = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

// Network-first: always try the live version so code updates reach the phone.
// Falls back to cache only when offline. This replaces the old cache-first
// handler, which served a stale index.html forever — meaning fixes never shipped.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match(BASE + '/index.html')))
  );
});
