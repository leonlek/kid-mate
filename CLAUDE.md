# คิดส์เล่น (Kid Games Hub) — CLAUDE.md

Hub name is **คิดส์เล่น** ("KidsLen" — a play on คิด/Kids + เล่น). Applied to page
titles, manifest `name`/`short_name`, the OG share card, and the hero. Each
mini-game keeps its own sub-name (e.g. "แข่งความเร็ว", "ปั้นเมฆ").

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
- **No tracking analytics.** Audience is children. The only third-party network calls
  allowed are Google Fonts and the **Cloudflare Web Analytics** beacon
  (`static.cloudflareinsights.com`) — cookieless, no PII, no cross-site identifier,
  pageviews only. Do not add anything that profiles a visitor (GA, Meta pixel, etc.).

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
7. **Copy the Cloudflare Web Analytics beacon `<script>`** from any existing page into the new one, just before `</body>` — without it the game never shows up in the pageview report (see Phase 5 in section 9).
8. **Any game that uses Web Audio must load `../audio-unlock.js` first in `<head>`** (before other scripts). It resumes `suspended`/`interrupted` contexts on every gesture and requests the `playback` audio session so iPad silent mode doesn't mute the game. Add it to every new game; no need to touch the game's own `ensureAudio()`.
9. **Spoken lines use recorded voice clips, not raw `speechSynthesis`.** Load `../voice-clips.js` + `voice/map.js` in `<head>`, route every spoken line through `VoiceClips.say(text, audioCtx|null, deviceFallback, lang)`, list every line the game can say in `VoiceClips.lines(() => [...])` (Thai strings, or `['en'|'zh'|'ja', text]`), then run `python3 tools/gen_voice.py <game-id>` and add `./<game-id>/voice/map.js` to `sw.js` SHELL. Voices: Azure `th-TH-PremwadeeNeural` (Thai), Jenny (en), Xiaoxiao (zh), Nanami (ja); any other locale passes its full tag (`['ko-KR', '안녕하세요']`) and needs an entry in `VOICES` in gen_voice.py. Needs `AZURE_SPEECH_KEY`/`AZURE_SPEECH_REGION` in the git-ignored `tools/.tts-keys` (free F0 tier, 500k chars/month — the whole hub is ~10k). **Whenever spoken text changes, re-run gen_voice for that game** (only new lines are synthesized, stale clips deleted) — an unmapped line silently falls back to the robotic device voice. Any number spoken from a counter must stay inside the range listed in `lines()` (cap the speech, or extend the list), and never speak a fractional value. **Spell what the voice should SAY, not how it's written** when TTS could misread: lone Thai letters (color-letters' `THAI_SAY` = "กอ ไก่", "ถอ ถาน" — the screen still shows `THAI_NAME`), Pali/Sanskrit spellings, romaji, "/". After generating, run `python3 tools/check_voice.py <game>` — Azure speech-to-text listens to every clip and lists the worst matches (STT itself writes digits, drops one-syllable clips and confuses ร/ล, so listen before changing anything). Clips live in the SW's own `kid-voice-v1` cache, which a `CACHE` bump does not wipe (they're content-hashed), so voices keep working offline after an update.
10. **Optionally add a `shortcuts` entry** in `manifest.webmanifest` — gives long-press app-icon shortcuts on Android.

~1500 lines per game is a soft guide, not a limit — the owner OK'd single files growing past it (2026-10-28); keep one file unless splitting genuinely helps. Still no bundler.

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

### แตะเติมสี (`/coloring/`)

Tap-to-fill coloring. **82 pictures** live in `coloring/pictures.js` (data only; `index.html` is the engine). Each picture = `add(id, name, category, anim, level, regions)`; level 1/2/3 = ⭐ age 3-4 / 5-6 / 7-8 (filter chips on the select screen). Regions draw back→front, each with its own outline, so a front shape hides the outline behind it — build animals by overlapping shapes, never as loose floating blobs. Paintable regions should be ≥ ~70 units wide (lv1) / ~40 (lv2-3) on the 800×800 canvas; smaller details (eyes, lines) use `dot()/ln()/ringd()` decor (`noClick`). Adding a picture = one `add(...)` call; bump `CACHE` in `sw.js`.

### สมุดระบายสี (`/crayon/`)

Scribble-with-crayon scenes (portrait 800×1200). 60 scenes: 11 hand-written in `crayon/index.html` + 49 generated into `crayon/scenes.js` from the coloring game's drawings (`node tools/gen_crayon_scenes.js` — edit `coloring/pictures.js` or the LIST in the script, then re-run; never hand-edit scenes.js). Regions under ~46 units don't have to be touched to finish. Size button cycles 3 crayon widths; ⭐ level is derived from the paintable-region count.

### ท่องอวกาศ (`/solar-system/`)

Interactive solar system: planets orbit at true relative speeds (1/period; 1 Earth year = 20 s at ▶), orbit lines are not pre-drawn — each planet traces its own path from page open at true speed (Mercury rings in ~5 s, Neptune ~55 min; 🧽 clears and restarts the trails); tap a body → inline info card with NASA Planetary Fact Sheet figures + Thai TTS; 📏 view draws all diameters to one true scale; 🎯 missions (⭐ find by name, ⭐⭐ find by clue). **Accuracy rule:** every number/clue must match NASA data; orbit distances and orbit-view sizes are compressed and the screen says so. Giant-planet moon counts change often — keep them as "มากกว่า …".
🔊 Every info card (all modes except 🎯 missions) is tap-to-hear: `sayKit()` marks headings / fact boxes / 💡 lines / results — tap one to hear it, 🔊 reads the whole card in order with a gold highlight. Speech text = `sayable()` of the card text (emoji/English stripped, °C/กม./~/- spelled out) or an explicit `data-say` (fact sentences in `FACT_SAY`/`factSay`). `VoiceClips.lines` renders every card state to collect them — after editing any card text, re-run gen_voice.
🚀 นั่งจรวด: travel time = real launch→arrival dates of real spacecraft (Apollo 11, Parker, MESSENGER, Venus Express, Perseverance, Juno, Cassini, Voyager 2) in `TRIPS`. ✨ กลุ่มดาวไทย: connect-the-dots on real J2000 star positions (`STARS`), Thai names per NARIT/สวทช. (ดาวไถ = Orion's belt, ดาวเต่า = Orion, ดาวจระเข้ = Big Dipper, ดาวลูกไก่ = Pleiades, ดาวแมงป่อง = Scorpius).

🌗 กลางวันกลางคืน: Earth from above the North Pole (the real day-map texture re-projected to a polar disc at runtime, edge = 20°S), Sun on the left, drag to turn (15° = 1 h); Thailand + New York pins; the sky strip is split in half — 🇹🇭 Thailand | 🇺🇸 New York — each with its own sun/moon, house, child awake/asleep and clock. NY's clock uses the REAL offset for today (`nyOffset()` via Intl: 12 h, 11 h during US daylight saving); NY's sky follows its longitude (always Thailand's sky − 12 h). 🍂 ฤดูกาล: Earth around the Sun with the axis fixed 23.4° toward Polaris (June = north leans sunward), Thai seasons per the Thai Meteorological Department, Bangkok day length / noon sun height computed (declination formula + −0.833° sunrise).

📍 Real "now": 🔭 explore starts with every planet + the Moon at today's true position (JPL approximate Keplerian elements → heliocentric longitude, ~1°; Moon = main Meeus ch. 47 terms) and the clock shows the simulated date; 🌙 ข้างขึ้นข้างแรม opens at tonight's real elongation and real node (β = 5.14° · sin F, `nodeReal`; ◀ ▶ months go back to the teaching model). Both have a 📍 ตอนนี้ button. Every info card also shows spin speed at the equator and orbit speed in km/h (`SPEED`, NASA fact sheet; Sun = around the galaxy, Moon = around Earth) with a kid comparison (walking / bicycle / city car / × a highway car), all voiced.
📏 เทียบขนาด: one zoomable canvas at ONE true scale in km (`sizeTick`): back 2D canvas (Sun glow, moon orbits) → WebGL spheres (same `GLOBE_FS` shader as the zoom-in globe, real textures; moons/dwarfs get flat colour textures, scissored per body) → front 2D canvas (labels, specks < 1.6 px, Haumea's egg). Opens framing the whole Sun as a spinning sphere; drag a big body to turn it, drag space to pan, pinch/wheel/➕➖ to zoom, ☀️ back to the Sun. Two layouts that animate into each other: 🌙 ดวงจันทร์ (default) spaces the worlds so each moon system fits — the 22 big moons in `MOONS` orbit at TRUE size, TRUE distance and TRUE period (1 s = 1 day; Triton backwards; orbit plane = planet's equator via `TILT2`, the Moon's = ecliptic; tidally locked), behind-the-planet moons hidden; 📏 เรียงชิด packs them side by side (spacing not real, the note says so). Planet spins are slowed to 6–60 s per turn (stated). Tapping a world flies the camera to it (framed out to its 2nd-closest moon); the note gives its real moon count (`MOON_COUNT`, "วาดเฉพาะดวงใหญ่"); tapping a moon speaks its name. Dwarf planets (ซีรีส, ดาวพลูโต, เฮาเมอา, มาคีมาคี, อีริส) are `BODIES` entries with `dwarf: true` (cartoon art, no photo sprite; Haumea drawn as its real egg shape + ring) — they open the normal info card but are NOT in the orbit view / `STRIP_IDS` (setMode clears a dwarf selection outside 📏).
☄️ ดาวหาง: Halley on its real orbit at the planets' true scale (Kepler's equation, perihelia 1986.11 / 2061.57), starts at today's real position; close-up inset shows the gas tail straight away from the Sun + curved dust tail growing within ~4 AU; playback slows near the Sun. 🧊 ไกลออกไป: log-distance strip (each step 10×) — asteroid belt, Ceres, Kuiper belt, Pluto/Haumea/Makemake/Eris, heliopause, Voyager 1, Oort cloud, plus a "moons of other planets" card linking to `../moon/#moons`. Voyager 1's distance is computed from today (1 light-day = 25.9 billion km on 18 Nov 2026, NASA; ~17 km/s) — its spoken distance/light-hours are pre-recorded for a range of values, so it stays in sync for years. 🌠 ดาวตก: tap shooting stars from the chosen shower's radiant; 7 annual showers (IMO peak nights, parent bodies, ZHR) in `SHOWERS`, ⭐ = next one from today; the "อีก N วัน" box is visual only (no voice).

🦘 ไปเยือนดาว: weight on a scale + jump height AND time in the air from real surface gravity (`GRAV`, NASA ratios; same 2.4 m/s take-off everywhere, so both scale as 1/g; Earth = 30 cm / 0.49 s). A faded Earth astronaut hops beside you at Earth's real height and speed; the camera follows tall jumps up a ruler that extends to the peak; a clock shows real seconds (Ceres' 17 s is played faster, marked "เร่ง"). Extra worlds in this mode only (`JUMP_EXTRA`): ซีรีส (~10 m), ดาวพลูโต (~4.8 m), ดาวหาง 67P (escape speed ~1 m/s per ESA → you float away into space).
**Queued ideas (owner asked to keep these for later):** 🛂 astronaut passport stamps (localStorage), ⭐⭐⭐ mission "order the planets", 🛰️ ISS (90-min orbit, 16 sunrises/day). New games after space, in order of preference (🦖 dinosaurs, 🌊 deep sea, 🫀 body, 🐛 life cycles, 🌙 moon, 🧑‍🚀 astronaut and ⛈️ weather are done — see below): 🔬 tiny-to-huge scale zoom.

### โลกไดโนเสาร์ (`/dinosaurs/`)

11 animals in `DINOS` (incl. Thai finds ภูเวียงโกซอรัส สิรินธรเน่ + สยามโมไทรันนัส, and เทอราโนดอน flagged as "not a dinosaur"). Hand-drawn side-view SVGs in `ART` (240×160 box, facing right, feet on y=148, `x0..x1` = nose-to-tail span so drawings scale to true length; `rib` = body ellipse for fossil ribs). Modes: 🦕 explore (scene + fact card + era timeline), 📏 size (dino beside a 1.1 m child, 2.7 m elephant and 12 m bus at one scale, 30 px/m), 🦴 dig (brush sand off a random skeleton on a canvas; 60 % of the body box cleared → reveal). **Accuracy rule:** lengths/weights/ages from the species' Wikipedia articles; where estimates disagree show the range, never a single invented number.

### ดำน้ำทะเลลึก (`/deep-sea/`)

Submarine dive through 18 `STOPS` at real depths (surface → clownfish 5 m → … giant squid 900 m → leatherback 1,280 m → Cuvier's beaked whale 2,992 m → Titanic 3,800 m → dumbo octopus 6,957 m → snailfish 8,336 m → Challenger Deep 10,935 m). ⬇️/⬆️ go stop to stop; tapping the true-scale depth gauge jumps to the nearest stop; at the bottom an Everest (8,849 m) silhouette rises from the trench floor. Zones per NOAA. **Accuracy rule:** each depth is a recorded dive/sighting from the species' Wikipedia article; pressure = 1 atm per 10 m.

### ร่างกายของเรา (`/body/`)

Front-view child SVG (400×780; viewer's left = the child's right, so the heart sits right of centre). Modes: 🫀 organs (tap → card + voice; heart beats, lungs breathe), 🦴 X-ray bones, 🍎 food trip (an apple follows `FOOD_PATH` mouth → oesophagus → stomach → small → large intestine → 💩; `at` = fraction of path length per stop), 🎯 find the organ. Facts in `ORGANS`/`BONES`/`FOOD` (NHS / Cleveland Clinic level; kid heart rate = paediatric range ages 3–5).

### วงจรชีวิต (`/life-cycle/`)

5 cycles in `CYCLES` (ผีเสื้อ, กบ, ไก่, ถั่วเขียว, คน) drawn as a ring of stage nodes; custom SVG in `DRAW` for stages with no emoji (eggs on a leaf, chrysalis, frog spawn, tadpoles, froglet, seed, sprout, flowering plant, pods). 🔄 watch = step through with voice; 🧩 order = tap shuffled cards in sequence. Timings are typical ranges and the card says so.

### ดวงจันทร์ (`/moon/`)

Five modes. 🔭 คืนนี้: the real phase for any date — new/full moon instants from Meeus ch. 49 (checked against NASA to ~2 min), Thai ขึ้น/แรม ค่ำ counted from the true new-moon day in Thai time (the card says the official Thai calendar can be a day off); 34-day strip of mini moons; face = `img/nearside.webp` (real near side, `tools/gen_moon_sprites.sh`), dark part keeps faint earthshine. 🚀 ลงจอด: hold 🔥 to land (gravity 1.62 m/s², ≤2.5 m/s ⭐⭐⭐, ≤4 ⭐⭐, faster bounces), then hop around leaving footprints / plant a flag. 🌑 สุริยุปราคา: drag the Moon over the Sun; near Moon (33.5′) → total with corona + stars, far (29.4′) → annular ring; Wakor 18 Aug 2411. 🌊 น้ำขึ้นน้ำลง: drag Earth/Moon, tidal bulge (exaggerated) + beach water level; Sun adds 46 % → น้ำเกิด/น้ำตาย. 🪐 ดวงจันทร์ดาวอื่น: 10 moons (NASA diameters, drawn art) + true-scale compare with Mercury. Every card is tap-to-hear (same `sayKit` as ท่องอวกาศ).

### นักบินอวกาศ (`/astronaut/`)

Life on the ISS + rocket building. 🎈 ลอยตัว: fling objects in the cabin (they glide and bounce, light drag), tap the crew member to somersault, water floats as a wobbling ball. 🍽️ กินข้าว: drag food to the mouth — tortilla/pouch/water/fruit/liquid salt are fine, 🍞 bread sprays floating crumbs (why bread isn't flown). 😴 นอน: sleeping bag on the wall. 🏃 ออกกำลังกาย: hold to run on the treadmill (bungee straps). 🚽 ห้องน้ำ: air-suction toilet → water recovery (98 %, NASA 2023). 🌍 หน้าต่าง: cupola, real Earth texture scrolling, one orbit = 12 s with ~38 % in Earth's shadow, sunrise counter to 16. 🚀 ประกอบจรวด: pick stage 1 / stage 2 / payload (crew capsule → docks with ISS, satellite → unfolds panels, probe → heads to the Moon), optional side boosters; flight timeline in `flightTick` (stage 1 drops at 70 km, orbit 400 km, "real time ≈ 9 min").

### ฟ้าฝน (`/weather/`)

Wind, rain and storms, all drag/tap. 💨 ลม: sea vs land with a circulating stream of air dots — day = ลมทะเล (land heats faster), night = ลมบก; flag + sailboat follow the wind; Thai monsoon seasons per TMD. 🌧️ ฝน: water cycle — tap the sea for vapour, it feeds a cloud that grows and greys; it rains when full (sooner over the mountain), the river runs back to the sea, a rainbow follows; tap a full cloud to squeeze it. ⚡ ฟ้าแลบ ฟ้าร้อง: drag the cloud up into a cumulonimbus, tap for lightning, the game counts seconds to the thunder (3 s per km, distance chips 1/2/3 km) + safety card. 🌀 พายุไต้ฝุ่น: circle counter-clockwise around the storm over warm sea to strengthen it (TMD scale: ดีเปรสชัน < 63, โซนร้อน 63–117, ไต้ฝุ่น ≥ 118 km/h, eye appears), drag its eye onto land and it weakens.

### ระบายแล้วมีชีวิต (`/color-alive/`)

Tap-to-fill 7 animals (cat, dog, Asian elephant, fish, butterfly, sparrow, tortoise), then they come alive in a meadow saved to localStorage (`colorAlive`, last 12). Animals are part rigs in `ANIMALS` (400×300 box, facing right, feet y≈282): each part has a pivot + paintable regions + fixed decoration; `poseOf` animates a diagonal walking gait, tail/ear/trunk sway, wing flaps, blinking. Anatomy is deliberate — slit cat pupils, Asian elephant (small ears, twin-domed head, arched back), fish with all 5 fin types, butterfly 4 wings + clubbed antennae, sparrow 3+1 toes, tortoise elephant-like feet. World behaviours: walkers wander/rest (tortoise ~7 px/s), bird hops/pecks/flies to the branch, butterfly lands on flowers and slowly opens/closes its wings, fish stays in the pond; taps trigger species reactions (tortoise hides in its shell, elephant raises its trunk…).

### ผู้ดูแลสวนสัตว์ (`/zoo-keeper/`)

8 animals × 8 foods from a wooden cart; tap a food and it flies to the animal. Real diets in `ANIMALS[id].eats` and real eating behaviour drawn per animal (`draw(state)`): monkey peels the banana, Asian elephant curls its trunk (one "finger") to bring sugarcane to its mouth, panda sits holding bamboo, Humboldt penguin swallows the fish head first, giraffe's dark purple tongue wraps leaves on a high feeder, lion lowers its head to tear meat, hippo's huge gape takes grass (eyes/ears/nostrils on top, ears flick), flamingo on one leg feeds head-upside-down filtering shrimp. Wrong food → head shake + thought bubble of the right food. Fed animals get ⭐ (localStorage `zooFed`).

### สร้างระบบสุริยะ (`/orbit-lab/`)

Gravity sandbox: one Sun, real inverse-square gravity (planets don't pull on each other), leapfrog integrator with smaller steps near the Sun. Pick a planet (real sprites from `../solar-system/img/`, sizes NOT to scale — the screen says so), press on empty space and drag: drag vector = launch velocity (`K_LAUNCH`); the arrow turns red when the speed is above escape speed, dots preview the next ~1.5 s. Too slow → falls into the Sun, too fast → escapes, in between → orbits (a ⭐ per lap). Spoken lessons the first time each happens (orbit, ellipse speeds up near the Sun, farther planets take longer = Kepler 3). 🎯 5 missions in `MISSIONS` (1 lap, round e < 0.12, comet-like e > 0.6, escape, 4 orbiting the same way), each ends with a real fact; progress in localStorage `orbitLab`.

### ขับยานดาวอังคาร (`/mars-rover/`)

Side-view drive through Jezero crater as a Perseverance-like rover (3 visible wheels on a rocker-bogie that follows the ground, mast "eyes", arm, MMRTG at the back). Hold ◀ ▶ to drive; ✨ rocks every ~650 units → 🦾 drill (arm reaches down, 🧪 counter; every 7th rock has "leopard spots" like Cheyava Falls), 📸 photo facts, 🚁 Ingenuity flies ahead (72 real flights), 📡 the signal to Earth takes TODAY's real one-way light time (`lightMinutes()`: JPL approximate elements for Earth + Mars, voiced for 3–23 min), 🌅 day (butterscotch sky) / sunset (blue glow round the Sun) / night (Phobos + Deimos, Earth as a blue star). Facts per NASA Mars 2020 pages (top speed 152 m/h, 1,025 kg, 3 m long, 19 rover cameras, landed 18 Feb 2021). Counters in localStorage `marsRover`.

### จิ๋วไปยักษ์ (`/scale-zoom/`)

22 things in `T` from a hydrogen atom to the observable universe, standing in ONE row at ONE true scale (`L` = compared size, `w × h` = drawing box, in metres); one camera number `f` (integer = that thing framed). ◀ ▶ hop, hold ➕ ➖ / drag / pinch / wheel to zoom smoothly; a scale bar rounds to 1-2-5 in the right unit; background goes microscope → sky + grass → space. Each stop speaks its size + "X ใหญ่กว่า Y ราว N เท่า" (computed from `L`). Sizes: Wikipedia / NASA fact sheets; where estimates disagree (Betelgeuse ~764 R☉, hair, red blood cell) the card says so.

### ฟักไข่ (`/hatch/`)

6 eggs with real incubation days and true relative egg sizes on the pick screen (16 px/cm): chicken 21 d/5.7 cm, duck 28/6.5, sea turtle ~55/4.2 (round, leathery, warmed by the sun in sand), Siamese crocodile ~80/7.5 (mound nest, babies chirp, mother carries them to water in her mouth), ostrich 42/15, emperor penguin ~65/12 (egg on dad's feet in a blizzard). 14 taps hatch any species (the day counter maps them to real days). 🔦 candling shows yolk → veins/heart → embryo filling the egg. Hatching follows pip → "zip" crack → cap off → wet chick that dries fluffy; reptiles slit the shell. After: chicks peck scattered feed, the duckling imprints and follows your finger (swims in the pond), turtle hatchlings crawl to the moonlit sea, ostrich chick sprints, penguin dad feeds the chick bill-to-bill. Album in localStorage `hatchAlbum`.

### ตู้ปลาของหนู (`/aquarium/`)

A living 26 °C community tank (saved in localStorage `aquarium`). Species with true behaviour in `SP`/`swim()`: betta (max ONE male — adding a second is refused with the reason; gulps air at the surface and builds a bubble nest; sleeps on its leaf at night; chases a guppy's tail now and then, with a warning to keep them apart), neon tetras school and fade at night, guppies with fan tails, corydoras sift the sand with barbels and dart up for air, bristlenose pleco suckers onto the glass and eats the algae, cherry shrimp. Tools: floating flakes / sinking pellets (overfeeding → food rots → poop + cloudy water, with a spoken warning), 🧽 wipe algae (grows while the light is on), 🧪 siphon the gravel, 🪣 25 % water change, 💡 day/night. Fish drawn at `FS` = 1.7× so they read on phones.

### ฟาร์มน้อย (`/farm/`)

Farm overview → tap an animal for a close-up with 3 jobs. True details: Holstein cow (polled, 4-teat udder, ear tag) with her calf beside her (cows give milk after calving), chews cud; hen lays at most 1 egg per day ("🌅 เช้าแล้ว" resets it) and the rooster (big comb, green sickle tail) crows but never lays; pig has a 2-nostril snout disc and cloven hooves, rolls in mud to cool (pigs barely sweat), shower washes it off; sheep are sheared by dragging the clippers (fleece falls in clumps, sheep looks thin; "1 year later" regrows); goat climbs the rock, beard + backward horns; goats and sheep have horizontal slit pupils (`eyeSlit`); white Pekin duck dabbles bottom-up, and bread is refused (bad for ducks).

### ร้านขนมเพื่อนสัตว์ (`/bakery/`)

An animal customer orders by picture (cream colour, N toppings, M candles — counting 1–5). Real baking order: add flour/egg (shell goes in the bin)/milk/sugar/melted butter → stir ~4 circles until smooth → bake at 180 °C (cake rises and browns, "ding" + toothpick tip) → take out with oven mitts → COOL (thermometer + steam; frosting a hot cake makes the cream melt and slide — the classic mistake) → spread cream by dragging (coverage) → tap toppings/candles → serve; a wrong count gets a gentle "I wanted 3, there are 2". Order speech is chained from short clips (`speakSeq(orderParts(o))`) — never voice a full sentence per combination.

### ผสมสี (`/color-mix/`)

Rewritten (2026-11) as real paint. **Colour model = two-constant Kubelka–Munk** over 10 wavelength bands: each of the 5 tubes (แดง เหลือง น้ำเงิน ขาว ดำ) is a reflectance curve + scattering strength in `CURVE`, fitted so the classic mixes land on real poster-paint colours (yellow+blue = green, red+blue = purple, red+white = pink, all three = brown) and RATIOS matter (3 yellow : 1 blue = เขียวอ่อน). Never go back to RGB averaging (yellow+blue would turn grey). Colour names (`NAMES`) take their reference from the model's own output for each recipe, nearest in Lab. Modes: 🎨 ผสม — tap a tube to squeeze a blob onto a wooden palette, drag the brush to mix (wet-paint grid, the brush is a pick-up/lay-down reservoir so paint is conserved; "mixed" = colour spread small or stirred enough), voice says "แดงผสมเหลือง" + "ได้สีส้ม" as two chained clips; 💾 saves to localStorage `colorMix2`. 🫗 เทสี — hold one of 10 paint buckets (5 tubes + ส้ม เขียว ม่วง ชมพู ฟ้า premixed from `NAME_REF`) to pour it into a big glass; amount = hold time (1.5 ส่วน/s, glass holds 10, a tick per ส่วน on the glass), every drop goes into the same K–M mixture so the glass colour changes live in proportion, swirls show the incoming colour, a ratio bar shows each bucket's share; on release the recipe + name is spoken (2+ buckets); 🫗 เทออก drains it. 🎯 โจทย์ — match a target swatch, closeness bar, hint names the tube that helps most. 🖌️ ระบาย — 5 line-art pictures, strokes clip to the shape they start in (shapes in front are protected), brush runs dry, a dirty brush carries its old colour into the next one (wash in the water cup, which gets murkier), ⭐ when a part gets its real colour. 🔦 แสงสี — drag red/green/blue torches; additive mixing (yellow, cyan, magenta, white).

### เขียนตามรอย (`/trace-letters/`)

Trace dashed strokes with a finger: 0-9, ก-ฮ (44), สระ (15: ะ ั า ำ ิ ี ึ ื ุ ู เ แ โ ใ ไ), เลขไทย ๐-๙, A-Z, a-z. A glyph = ordered strokes (SVG paths, 1000×1000 box) in `G`; the finger only advances forward along the active stroke. Latin letters/digits are hand-written paths in `index.html` (lowercase = ball-and-stick print). **Thai is generated** into `trace-letters/glyphs-th.js` by `python3 tools/gen_trace_glyphs.py [chars…]` (Pillow only): TH Sarabun glyph → thinned skeleton → graph → walked the way Thai is taught (start at the head loop, go round it, follow the line; other loops are gone round as the pen reaches them). Per-glyph corrections live in `tools/trace_fix.json` (`retrace` for ค ฅ ศ ย ๓ ๔ ๕ where the pen doubles back, `stop_t`/`from_end` for ล, a hand `route` for ส, `rev`/`order`) — never hand-edit glyphs-th.js. Above/below vowels are drawn enlarged on a ghost อ (`TH_GHOST`); ื = ี plus a second tick. Thai glyphs use a thinner line and a shorter look-ahead window (220) so head loops can't be skipped. Voice: letter names by sound (`THAI_SAY`, same spellings as color-letters), vowels "สระอา", Thai digits = the number word, a-z = the capital's clip.

### เขียนเอง (`/write-letters/`)

Same letter sets and stroke data as เขียนตามรอย (loads `../trace-letters/glyphs-th.js`; the Latin paths are a copy of `G` — keep both in sync), but **only the dashed line is shown — no start dot, no moving direction hint**. Free order and direction: the ink is a free-hand line; each stroke is sampled every 10 units and a stroke counts when 90 % of its samples are covered (radius 58, Thai 36) — its dashes turn green. Pass on finger-up when every stroke is covered AND ink more than 100 (Thai 64) units from the letter is ≤ 30 % of the ink length; otherwise one spoken "ลบแล้วลองใหม่นะ" and the 🧽 button wiggles. Progress in localStorage `writeLettersProgress`.

### ป๊อปอิท (`/pop-it/`)

A pop-it fidget board. Each 🎲 board is a random silhouette from `SHAPES` (animals + heart/star/flower/cloud/apple/house — no cartoon characters, owner's request) built as a union of primitives; bubbles sit on a hex grid, kept only where the whole bubble fits (`layout()`, 13–20 bubbles, big for small fingers), rainbow rows like the real toy. A pressed bubble STAYS down (real toy behaviour); 🔄 flips the board — it turns over, the silhouette is mirrored and every bubble's state inverts (all-down → all-up). Voice is ENGLISH (owner's request): each pop says the running count ("one"…"sixty") or, with 🎨, the bubble's colour; a new board says the shape's name. Pop sound = filtered noise click + a falling sine thump.

### ธงนานาชาติ (`/flags/`)

Paint 62 national flags (18 ⭐ stripes, 24 ⭐⭐ stars/crosses, 20 ⭐⭐⭐ many parts), each in `FLAGS` as SVG: `vb`, `col` (official colours), `regs` = paintable regions `[colourKey, svg]` drawn back→front with `fill="currentColor"`, fixed `decor` on top. Simple flags are built from their construction sheets; complex layouts copy the Wikimedia Commons SVG geometry, and the big emblems (Angkor Wat, Sun of May, Brazil's 27 stars + lettering, Brunei, Bhutan's dragon, Sri Lanka's lion, Mexico's eagle, Portugal's arms, Egypt's eagle) live in `flags/art.js` (copied from Commons, public domain, numbers rounded to 0.1). Crescents are a circle with a `<mask>` hole (SG, PK, MN). **Names are what Thai people say day to day** (ตุรกี, พม่า, อังกฤษ, อเมริกา, เช็ก, ยูเออี) with the official name in `full`, shown small on the card; a greeting with no Azure voice for its language uses `hiSay`, a Thai spelling read by the Thai voice (Bhutan: กุซุซังโปลา). Colours: `col` holds the official values, but `liven()` lifts dull navy / dark green / dim red at load (hue kept, maroons kept; `f.real` = official), and the painting canvas gets a soft satin gloss. Spain uses the official civil flag (no arms) and the card says so. Engine: each region is rasterised once into a label map → canvas recomposed per pixel (hatch = unpainted, ink outlines), so taps are exact and 🎨 mode is forgiving (nearest unfinished region wanting the chosen colour within ~30 px; a wrong colour flashes and doesn't stick, the right swatch wiggles). Palette = only that flag's colours. Tiny parts (US/AU/CN/NZ/CL stars, SG/PK crescent, MN soyombo, Brazil's globe band + stars, PH sun + stars, MY crescent, NP moon/sun, KR trigrams) carry a 3rd `regs` item = a big hit shape: a tap anywhere inside it paints the tiny part, and the part pulses gold while the colour in hand is its colour (🖌️ free: the zone paints the tiny part once the area under it is painted). Finish → the real flag waves, voice chains "ธงชาติX" → English name (Jenny) → hello in the country's own language (native Azure voice per locale, keyed `"ko-kr|안녕하세요"` — see `VOICES` in gen_voice.py) → one fact. Modes: 🎨 follow (reference flag shown), 🖌️ free (compare at the end), 🌏 map (Natural Earth 1:110m land in `flags/world.js`, flags stand on their capitals, zoom chips; unpainted = "?" pin that opens the flag), 👆 รู้จักธง (tap any flag → it flutters in a sticky panel and says name/English/hello, region chips, 🎨 opens it to paint), 🎯 quiz (3 choices); the map's 🚩 ทุกธง chip shows every flag (tap = hear it). Progress in localStorage `flagsDone`. Deep links: `#jp`, `#map`, `#quiz`, `#free`, `#know`.

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
±5 % is the current tuning. After cube-root compression, two racers' order is guaranteed when their speed ratio exceeds **(1.05/0.95)³ ≈ 1.35** — so cheetah (120) vs lion (80) at ratio 1.5 always resolves the right way, but ferrari (340) vs lambo (355) at ratio 1.04 stays uncertain. Earlier values up to ±12 % flipped clearly-different pairs and the "fastest wins" intuition broke down; don't go above ±8 %.

The `targetMs = 4000` / `hardCap = 15000` numbers are load-bearing. Changing any affects race feel significantly.

### Same-frame finish ordering
Within a single requestAnimationFrame, multiple racers can cross the line. The engine computes each finisher's **exact sub-frame crossover time** (`targetMs × maxEff / r.effSpeed`) and sorts those crossings before appending to the leaderboard, so finish order reflects real timing rather than array iteration order. If you refactor the loop, keep this — otherwise close finishes will rank by data-structure order, not physics.

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
- ✅ Pick a real Thai name for the hub — **คิดส์เล่น** (updated manifest `name`, page titles, OG card)
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
- ✅ Simple no-cookie pageview counter — **Cloudflare Web Analytics** (see below)
- Cross-game "ชนะแล้วกี่ครั้ง" badge in localStorage

**Analytics setup (Cloudflare Web Analytics)**: a one-line beacon `<script>` sits right
before `</body>` in the hub and **every** game page. Because each game is its own URL,
the per-path pageview report doubles as "which game gets played most". Rules:
- **A new game must get the beacon snippet too** — copy it from any existing page,
  otherwise that game is invisible in the report.
- The SW skips any `cloudflareinsights.com` request (see the guard in `sw.js`'s fetch
  handler) — cache-first would pin a stale beacon forever.
- Offline / installed-PWA sessions can't send a beacon, so counts read slightly low.
- Hostname registered: `leonlek.github.io`. **Moving to a custom domain means adding
  that hostname in the Cloudflare dashboard** — the token stays the same.

Still no accounts, still no sync, still no backend.

---

## 10. Decisions Still Open

1. ~~**Hub name.**~~ **DECIDED: คิดส์เล่น** (KidsLen). Applied across titles, manifest, OG card, hero.
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
