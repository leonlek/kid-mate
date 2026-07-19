// Offline-first service worker for the "เกมเด็ก" hub and its mini-games.
// Strategy:
//   - On install, precache the hub + each game's shell.
//   - On fetch, try cache first and fall back to network. Successful network
//     responses are cached opportunistically so fonts (and anything else the
//     user touches) survive the next offline visit.
// Bump CACHE when shell files change so old caches are evicted on activate.
const CACHE = 'kid-games-v80';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon-180.png',
  './train-track/',
  './train-track/index.html',
  './clouds/',
  './clouds/index.html',
  './crayon/',
  './crayon/index.html',
  './dough/',
  './dough/index.html',
  './slime/',
  './slime/index.html',
  './look-draw/',
  './look-draw/index.html',
  './draw-along/',
  './draw-along/index.html',
  './paint/',
  './paint/index.html',
  './shape-sort/',
  './shape-sort/index.html',
  './color-pick/',
  './color-pick/index.html',
  './pet-care/',
  './pet-care/index.html',
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
  './cup-shuffle/',
  './cup-shuffle/index.html',
  './number-pop/',
  './number-pop/index.html',
  './catch-stars/',
  './catch-stars/index.html',
  './coloring/',
  './coloring/index.html',
  './color-letters/',
  './color-letters/index.html',
  './whats-missing/',
  './whats-missing/index.html',
  './whats-different/',
  './whats-different/index.html',
  './find-it/',
  './find-it/index.html',
  './whats-next/',
  './whats-next/index.html',
  './odd-one-out/',
  './odd-one-out/index.html',
  './sequence-it/',
  './sequence-it/index.html',
  './trace-letters/',
  './trace-letters/index.html',
  './tangram/',
  './tangram/index.html',
  './size-order/',
  './size-order/index.html',
  './memory-match/',
  './memory-match/index.html',
  './shadow-match/',
  './shadow-match/index.html',
  './jigsaw/',
  './jigsaw/index.html',
  './arrange-pic/',
  './arrange-pic/index.html',
  './alphabet-pop/',
  './alphabet-pop/index.html',
  './color-mix/',
  './color-mix/index.html',
  './dress-up/',
  './dress-up/index.html',
  './flower-garden/',
  './flower-garden/index.html',
  './animal-piano/',
  './animal-piano/index.html',
  './my-kitchen/',
  './my-kitchen/index.html',
  './push-box/',
  './push-box/index.html',
  './maze/',
  './maze/index.html',
  './pipe-flow/',
  './pipe-flow/index.html',
  './slide-unlock/',
  './slide-unlock/index.html',
  './balance/',
  './balance/index.html',
  './write-cjk/',
  './write-cjk/index.html',
];

self.addEventListener('install', (event) => {
  // Precache the new shells but do NOT skipWaiting — the new version waits until
  // the user taps "update" (the page then posts skipWaiting). Avoids yanking the
  // page out from under a child mid-drawing.
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'skipWaiting') self.skipWaiting();
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
