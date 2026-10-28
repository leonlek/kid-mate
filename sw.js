// Offline-first service worker for the "เกมเด็ก" hub and its mini-games.
// Strategy:
//   - On install, precache the hub + each game's shell.
//   - On fetch, try cache first and fall back to network. Successful network
//     responses are cached opportunistically so fonts (and anything else the
//     user touches) survive the next offline visit.
// Bump CACHE when shell files change so old caches are evicted on activate.
const CACHE = 'kid-games-v116';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './audio-unlock.js',
  './voice-clips.js',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon-180.png',
  './train-track/',
  './train-track/index.html',
  './road/',
  './road/index.html',
  './clouds/',
  './clouds/index.html',
  './crayon/',
  './crayon/index.html',
  './crayon/scenes.js',
  './dough/',
  './dough/index.html',
  './slime/',
  './slime/index.html',
  './look-draw/',
  './look-draw/index.html',
  './draw-along/',
  './draw-along/index.html',
  './draw-along/voice/map.js',
  './paint/',
  './paint/index.html',
  './shape-sort/',
  './shape-sort/index.html',
  './shape-sort/voice/map.js',
  './color-pick/',
  './color-pick/index.html',
  './color-pick/voice/map.js',
  './pet-care/',
  './pet-care/index.html',
  './pet-care/voice/map.js',
  './animal-race/',
  './animal-race/index.html',
  './animal-race/voice/map.js',
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
  './coloring/pictures.js',
  './body/',
  './body/index.html',
  './body/voice/map.js',
  './life-cycle/',
  './life-cycle/index.html',
  './life-cycle/voice/map.js',
  './deep-sea/',
  './deep-sea/index.html',
  './deep-sea/voice/map.js',
  './dinosaurs/',
  './dinosaurs/index.html',
  './dinosaurs/voice/map.js',
  './solar-system/',
  './solar-system/index.html',
  './solar-system/voice/map.js',
  './solar-system/img/sun.webp',
  './solar-system/img/mercury.webp',
  './solar-system/img/venus.webp',
  './solar-system/img/earth.webp',
  './solar-system/img/moon.webp',
  './solar-system/img/mars.webp',
  './solar-system/img/jupiter.webp',
  './solar-system/img/saturn.webp',
  './solar-system/img/uranus.webp',
  './solar-system/img/neptune.webp',
  './color-letters/',
  './color-letters/index.html',
  './color-letters/voice/map.js',
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
  './trace-letters/voice/map.js',
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
  './write-cjk/voice/map.js',
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

  // Analytics beacon: never cache, never intercept. Cache-first would pin an old
  // beacon.min.js forever, and an offline miss must fail silently (no counts) —
  // not poison the cache with an error response.
  if (req.url.indexOf('cloudflareinsights.com') !== -1) return;

  // HTML navigations (the hub + each game shell) are NETWORK-FIRST so a fresh
  // deploy shows up on the next online launch — WITHOUT waiting for the SW
  // version dance to activate. iOS standalone PWAs update the SW unreliably, so
  // we can't hinge "the new version" on activation alone. Offline / a stalled
  // network falls back to the cached shell, so it still works with no signal.
  const isHTML = req.mode === 'navigate'
    || (req.headers.get('accept') || '').includes('text/html');
  if (isHTML) {
    event.respondWith(new Promise((resolve) => {
      var settled = false;
      var done = function (r) { if (!settled && r) { settled = true; resolve(r); } };
      // Don't let a slow phone network hang the page: after 3.5s serve cache.
      var timer = setTimeout(function () {
        caches.match(req).then(done);
      }, 3500);
      fetch(req).then(function (res) {
        clearTimeout(timer);
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); }).catch(function () {});
        done(res);
      }).catch(function () {
        clearTimeout(timer);
        caches.match(req).then(function (c) {
          done(c || caches.match('./index.html'));
        });
      });
    }));
    return;
  }

  // voice/map.js lists the clips for the page's CURRENT lines, so it must stay in
  // step with the network-first HTML above — a cached old map makes every new
  // line fall back to the robotic device voice. The mp3s themselves are named by
  // content hash, so they can stay cache-first.
  if (/\/voice\/map\.js$/.test(new URL(req.url).pathname)) {
    event.respondWith(
      fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {}); }
        return res.ok ? res : caches.match(req).then((c) => c || res);
      }).catch(() => caches.match(req))
    );
    return;
  }

  // Everything else (fonts, icons, manifest, clips) stays cache-first for speed.
  // Only good responses are kept — a 404 mid-deploy must not be pinned forever.
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {}); }
        return res;
      }).catch(() => cached);
    })
  );
});
