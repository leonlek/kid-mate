// Offline-first service worker for the "เกมเด็ก" hub and its mini-games.
// Strategy:
//   - On install, precache the hub + each game's shell.
//   - On fetch, try cache first and fall back to network. Successful network
//     responses are cached opportunistically so fonts (and anything else the
//     user touches) survive the next offline visit.
// Bump CACHE when shell files change so old caches are evicted on activate.
const CACHE = 'kid-games-v25';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon.svg',
  './animal-race/',
  './animal-race/index.html',
  './quick-tap/',
  './quick-tap/index.html',
  './sort-rule/',
  './sort-rule/index.html',
  './follow-me/',
  './follow-me/index.html',
  './finger-maze/',
  './finger-maze/index.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => cached);
    })
  );
});
