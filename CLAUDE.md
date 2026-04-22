# เกมเด็ก (Kid Games Hub) — CLAUDE.md

Working name. Pick a real Thai name for the hub before the first public deploy. Each mini-game keeps its own sub-name (e.g. "แข่งความเร็ว").

---

## 1. Project Overview

**What**: A free-to-play **hub of mini-games for Thai children aged 3–8**. The hub is a landing page at the root URL; each game lives in its own subfolder. Kids tap a game card, play, tap the home button, pick another game. Parents can "Add to Home Screen" so the hub launches fullscreen like an app.

**Who**: Thai children aged 3–8, often with a parent nearby. Primary use is 2–5 minute sessions on a parent's phone.

**Why**: Educational toys disguised as games, with a Thai-first feel. Free, no accounts, no ads, no IAP. Distributed as a single URL — share anywhere, opens instantly.

**Current games** (see `/games` section below):
- **แข่งความเร็ว** (`/animal-race/`) — speed race between animals, vehicles, aircraft, mythical creatures. Fully working.

**Planned games**: open — deliberately not listed yet. The hub is built to accept more cards without re-architecture.

**Non-goals**:
- Not a native app. **Do not port to Expo/React Native.** The web reach + zero-friction sharing beats native features for this audience.
- No accounts, no server, no sync, no backend of any kind for MVP.
- No ads, no IAP, no analytics that collect PII.
- No social features, no multiplayer.

---

## 2. Tech Stack — and what to avoid

| Layer | Choice | Notes |
|---|---|---|
| Markup | Plain HTML5 | One file per page |
| Styles | Plain CSS with custom properties | Design tokens in `:root` — shared across hub and games |
| Scripts | Vanilla ES2020 JS, no modules, no bundler | Inline `<script>` |
| Animation | `requestAnimationFrame` + CSS keyframes | |
| Fonts | `Mitr` + `Itim` via Google Fonts CDN | Cached by service worker after first load |
| Icons | Unicode emoji + one SVG app icon | No icon library |
| Haptics | `navigator.vibrate()` | Silent no-op where unsupported (iOS Safari) |
| Offline | Service worker (`sw.js`, root scope) | Cache-first for shells, opportunistic for fonts |
| Install | `manifest.webmanifest` (root) | "Add to Home Screen" on iOS & Android; `shortcuts` surface each game |
| Hosting | GitHub Pages / Cloudflare Pages / Netlify | Any static host works — zero-config |

**Deliberate non-choices — do not reintroduce:**
- **No React / Vue / Svelte / framework.** Each page is small enough that a framework would cost more bytes than it saves lines.
- **No TypeScript, no build step, no bundler** (Vite, webpack, Parcel, esbuild). Everything runs straight from the filesystem / static host.
- **No Expo / React Native.** The earlier plan to port to native is cancelled.
- **No npm / package.json.** If you think you need one, stop and reconsider.
- **No analytics or tracking.** Audience is children; zero third-party network calls beyond Google Fonts.

If a feature request seems to need any of the above, push back — almost always there's a 20-line vanilla alternative.

---

## 3. File Structure

```
/
  index.html              # Hub landing page (game grid)
  manifest.webmanifest    # PWA manifest (hub-level, shortcuts to games)
  sw.js                   # Service worker, root scope — caches hub + every game shell
  icons/
    icon.svg              # Hub app icon (maskable-safe, 🎮 glyph)
  animal-race/
    index.html            # Speed-race mini-game (self-contained)
  CLAUDE.md               # this file
```

**Invariant**: the hub at `/` is the entry point and the PWA root. Games are subfolders with their own `index.html`. Games link back to `../` via a 🏠 button.

**Service worker scope**: the SW at `/sw.js` has scope `/`, so it controls the hub and every game. Only the hub registers it (see section 4) to avoid `Service-Worker-Allowed` header issues from sub-paths.

---

## 4. Adding a New Mini-Game

When you add a game (e.g. `memory-match`):

1. **Create `/<game-id>/index.html`** — self-contained page. Copy the visual tokens from section 7 so it feels like part of the same family.
2. **Reference hub assets from the game page** with `../` paths:
   - `<link rel="manifest" href="../manifest.webmanifest">`
   - `<link rel="icon" href="../icons/icon.svg">`
   - `<link rel="apple-touch-icon" href="../icons/icon.svg">`
3. **Do NOT register a service worker from the game page.** The hub already registers it; its scope covers the whole origin. Registering from a sub-path requires the `Service-Worker-Allowed: /` header, which most static hosts don't set.
4. **Add the 🏠 home button** linking to `../` (see `animal-race/index.html` for the pattern — fixed top-left, 52 px, pink border).
5. **Add a card in the hub `index.html`** (`.games` grid) — big emoji, Thai title, one-sentence description.
6. **Update `sw.js`'s `SHELL` array** — add `./<game-id>/` and `./<game-id>/index.html`. Bump the `CACHE` constant (e.g. `kid-games-v2`) so old caches evict.
7. **Optionally add a `shortcuts` entry** in `manifest.webmanifest` — gives long-press app-icon shortcuts on Android.

Keep each game under ~1500 lines of HTML. If a game grows beyond that, split it into `<game-id>/index.html` + `<game-id>/game.js` + `<game-id>/styles.css`. Still no bundler.

---

## 5. Games

### แข่งความเร็ว (`/animal-race/`)

Single-file HTML, ~900 lines. Three screens (Select → Race → Results). Implements:

- **64 racers** across 9 categories in the `ANIMALS` array, sorted fastest→slowest
- **Race engine** with ±12 % variance, cube-root speed compression, 15 s hard cap — see section 6
- Full Thai UI strings, 3-column grid on phones, auto-fit on larger screens
- Haptic feedback on start tap, finish-line crossing, and winner (Android)
- Back-to-hub 🏠 button, fixed top-left

**Data shape** (defined inline):
```js
// Racer
{ id: 'cheetah', emoji: '🐆', name: 'เสือชีตาห์', speed: 120, cat: 'wild' }
// Category
{ id: 'wild', label: '🦁 สัตว์ป่า' }
```

Valid `cat`: `wild`, `farm`, `bird`, `water`, `dino`, `fantasy`, `vehicle`, `aircraft`, `other`. Speed range 0.05 (snail) → 28,000 km/h (space shuttle). When adding racers, use real top speeds (Wikipedia max reliable value), preserve the fastest→slowest sort order.

### (Planned)

None yet. Open ideas — add cards to the hub's "เร็วๆ นี้" slot when designs are ready.

---

## 6. Race Engine (in `animal-race/`)

### Goal
All races feel like "races" regardless of whether the spread is 20→100 km/h (lion vs zebra) or 0.05→28,000 km/h (snail vs shuttle). Fastest always wins (modulo tiny variance). Slowest always gets some visible movement.

### Algorithm

```js
// 1. Per-racer variance for fun (±12%)
const variance = 0.88 + Math.random() * 0.24;

// 2. Effective speed — cube root compresses the 560,000× range
const effSpeed = Math.cbrt(speed) * variance;

// 3. Normalize so fastest hits finish line at targetMs
const maxEff = Math.max(...racers.map(r => r.effSpeed));
const TARGET_MS = 4000;    // fastest finishes in 4 s
const HARD_CAP_MS = 15000; // race ends at 15 s regardless

// 4. Position at time `elapsed`
const progress = (r.effSpeed / maxEff) * (elapsed / TARGET_MS); // 0..1
```

At hard cap, unfinished racers are force-finished and ranked by current `progress`; `finishTime` is set to the cap.

### Why cube root
| racer | speed | sqrt | cbrt |
|---|---|---|---|
| snail | 0.05 | 0.22 | 0.37 |
| cheetah | 120 | 10.95 | 4.93 |
| Bugatti | 490 | 22.1 | 7.88 |
| airliner | 920 | 30.3 | 9.73 |
| shuttle | 28,000 | 167 | 30.4 |

`cbrt` keeps shuttle-vs-snail visible (shuttle takes 4 s, snail reaches ~4.5 % of track in 15 s) while keeping supercar-vs-supercar close. `sqrt` made shuttle too dominant; `log1p` made same-category races too equal.

### Variance tuning
±12 % is deliberate: tight enough that cheetah (120) always beats lion (80), but loose enough that ferrari (340) vs lambo (355) is genuinely uncertain. Don't raise above 20 % or the "education" aspect breaks down.

The `targetMs = 4000` / `hardCap = 15000` numbers are load-bearing. Changing any affects race feel significantly.

---

## 7. UX Rules for Ages 3–8

These apply across the hub and every game. Every change should be reviewed against them.

1. **Tap targets ≥ 64 px.** A 3-year-old's finger covers ~20 mm.
2. **No reading required to navigate.** A non-reader should be able to pick a game and start playing. Emoji + color + animation are the primary signals.
3. **Every tap gives feedback in ≤ 100 ms.** Scale-down on press, haptic (where supported), selection badge animates in — always.
4. **No dead ends.** Every screen has a visible way forward AND back. Games always have the 🏠 home button.
5. **No modals, no popups, no "are you sure" dialogs.** Kids don't read them.
6. **Errors don't exist.** If something goes wrong, recover silently (log it, continue the flow). No error UI.
7. **Thai first.** Never ship English-only strings.
8. **No data entry.** Zero keyboards, zero forms, zero authentication.
9. **Forgiving selection.** Tapping a selected thing deselects it — never make a kid "find the X button".
10. **Consistent visual language across games.** Every mini-game uses the same font pair, pink brand, hard-shadow style, pill buttons, rounded cards. The hub is the baseline.

---

## 8. Visual System (shared)

Design tokens live in `:root` in each HTML file. Keep them identical across hub and games:

| Token | Value |
|---|---|
| Primary pink | `--brand: #ff6b9d` / `--brand-dark: #e54b82` |
| Gold / silver / bronze | `--gold: #ffd93d` / `--silver: #c8d6e5` / `--bronze: #e17055` |
| Sky gradient (body background) | `#b5e8ff` → `#d9f3c9` → `#7ed957` (top→bottom) |
| Ink | `--ink: #2d3436` |
| Paper / card | `--paper: #fffef9` / `--card: #ffffff` / `--card-border: #ffd6e4` |

Fonts:
- Display: **Itim** (h1, countdown, medals, game titles)
- Body: **Mitr** (weights 400/500/600/700)

Shadow language: **hard 2D shadows**, no blur, 4–6 px offset downward. Never use iOS-style soft shadows — they look out of place.

Border radius: 18–28 px on cards; 999 px (fully pill-shaped) on buttons and filter chips.

The drifting `☁️ ☁️     ☁️` cloud strip is part of the brand — keep it on every page.

---

## 9. Roadmap

### Phase 1 — Ship the hub (done/near-done)
- ✅ Hub landing page with game grid
- ✅ แข่งความเร็ว mini-game wired in
- ✅ PWA manifest + service worker (offline, "Add to Home Screen")
- ✅ Hub-level app icon
- ⏳ Deploy to a static host (GitHub Pages / Cloudflare Pages / Netlify)
- ⏳ Pick a real Thai name for the hub (updates manifest `name` + page titles)
- ⏳ Pick a domain

### Phase 2 — Sensory polish
- Sound effects via Web Audio API or `<audio>` (first unlock on user gesture)
- Extra haptic patterns
- Custom-drawn app icons (replace emoji-SVG placeholders)
- iOS splash screens (`apple-touch-startup-image`)

### Phase 3 — Second game
- Design + ship one more mini-game. Good candidates for 3–8 year olds:
  - **จับคู่ภาพ** (memory match — flip pairs)
  - **เรียงจากใหญ่ไปเล็ก** (size-ordering — sort 3–5 things)
  - **นับให้ครบ** (count-and-tap up to 10)
  - **สีอะไร** (color identification)
- Re-use the visual system; follow the "Adding a New Mini-Game" checklist in section 4.

### Phase 4 — Content expansion for existing games
- แข่งความเร็ว: more racers, long-press-for-fact, championship bracket
- Whatever Phase 3 game ships: more levels / variations

### Phase 5 — Only if usage justifies it
- Simple no-cookie pageview counter (Plausible/Umami) to see what's getting played
- Cross-game "ชนะแล้วกี่ครั้ง" badge in localStorage

Still no accounts, still no sync, still no backend.

---

## 10. Decisions Still Open

1. **Hub name.** Placeholder is "เกมเด็ก". Apiwat's past projects use short Thai names (TongPang, BaanJam, PanGee, LinkPang, KepKrob). Candidates for this: `SanookKids`, `LenKhaewKan`, `NgenLen`, or something punchy. Needed before domain / manifest `name` field.
2. **Domain.** Cloudflare Pages + a custom `.in.th`/`.com` is ~200 THB/yr.
3. **Hub icon artwork.** Current SVG is a 🎮 emoji on pink — placeholder. A commissioned flat vector icon would help brand recognition on home screens once kids start installing.
4. **Second game pick.** See Phase 3 list — which one is a parent / child most excited about?
5. **Sound library.** Freesound.org CC0 samples are fine; curate ~8 in Phase 2 (countdown tick, go whistle, cheer, medal ding, oh-no, confetti pop, card flip, correct/wrong).

---

## 11. Working With Claude Code on This

Tips specific to this codebase:

- **Touch the hub when you touch a game.** New game = new card in `index.html` + new entry in `sw.js` SHELL + (optional) `shortcuts` in manifest. Forgetting any of these is easy.
- **Bump the `CACHE` constant in `sw.js`** whenever you change a shell file, or users will see stale caches until a hard refresh.
- **Animation timings** in existing games (`0.3s bob`, `0.6s wiggle`, `0.5s celebrate`, `1s bounce`, `3s float` on hub cards) were tuned by eye. Don't round them to tidier numbers without A/B-checking the feel.
- **Preserve the `ANIMALS` sort order** (fastest→slowest) in the race game. It makes top-of-grid = fastest, which helps kids build intuition.
- **Don't unify the 🦖 emoji** across raptor/T-rex or 🐊 across croc/supercroc — Unicode has no better option, and the names differentiate enough.
- **Resist "modernizing"** (adding a framework, build tools, TypeScript). The whole point is one-file-per-game simplicity that a kid can't break.
- **Test on a phone.** Desktop testing misses tap-target and text-size problems on 6" screens.

### Testing locally

```bash
# any static server — pick one
python3 -m http.server 8000
# or:  npx serve
# or:  npx http-server -p 8000
```

Open http://localhost:8000. Service workers do **not** register from `file://` — you need a real server to test PWA/offline behavior.

**Test matrix before deploy**:
1. Load hub, tap the game card → game loads
2. Play one race through → winners + confetti appear
3. Tap 🏠 → back to hub
4. Go offline, reload hub → still loads (service worker cache)
5. "Add to Home Screen" → launches fullscreen, no browser chrome
6. On Android: long-press app icon → "แข่งความเร็ว" shortcut appears (from manifest `shortcuts`)

### Deploying

Any static host, just push the repo root. Zero build config.

- **Cloudflare Pages**: connect repo, build command = (empty), output dir = `/`. Fastest CDN for Thailand.
- **GitHub Pages**: enable Pages, source = `main`, `/root`. Free with GitHub.
- **Netlify**: drag-and-drop the folder, or connect repo. Build = (empty), publish = `/`.

### Quick start for a fresh clone

```bash
git clone <repo>
cd <repo>
python3 -m http.server 8000
# open http://localhost:8000
```

No install step. No dependencies. That's the point.
