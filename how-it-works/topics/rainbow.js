/* ทำไมนะ? — 🌈 รุ้งกินน้ำ
   1) when you see one: the Sun BEHIND you, raindrops IN FRONT, Sun no higher than ~42° (so
      mornings/evenings, not noon). The bow is a circle round the antisolar point at 42°
      (red outside, violet inside); the ground hides the lower half (full circles can be seen
      from planes). A fainter secondary bow at ~51° has its colours reversed.
   2) inside one raindrop: a real ray trace (Snell's law, one internal reflection) through a
      spherical drop — white light splits because each colour bends a different amount
      (water n ≈ 1.331 red … 1.343 violet); the spread is exaggerated on screen and the
      screen says so. Light leaves ~42° from the way it came in (red 42°, violet 40°).
   3) make one: a fine hose spray with your back to the Sun. */
(function () {
  const L = {
    r0: 'แตะเมฆให้ฝนตก',
    r1: 'ดวงอาทิตย์อยู่ข้างหน้าเรา ไม่เห็นรุ้ง ลากดวงอาทิตย์ไปไว้ข้างหลังเรา ให้ต่ำๆ',
    r2: 'เห็นรุ้งแล้ว! รุ้งเกิดเมื่อดวงอาทิตย์อยู่ข้างหลังเรา และมีเม็ดฝนอยู่ข้างหน้า',
    r3: 'ดวงอาทิตย์ต้องสูงไม่เกินสี่สิบสององศา เราจึงเห็นรุ้งตอนเช้าหรือตอนเย็น ไม่ค่อยเห็นตอนเที่ยง',
    r4: 'ลองลากดวงอาทิตย์ขึ้นไปสูงๆ ดูสิ',
    r5: 'ดวงอาทิตย์สูงเกินไป รุ้งจมลงไปใต้ขอบฟ้าแล้ว',
    r6: 'ที่จริงรุ้งเป็นวงกลม แต่พื้นดินบังไว้ครึ่งหนึ่ง ถ้าอยู่บนเครื่องบิน บางทีจะเห็นรุ้งเป็นวงกลมเต็มวง',
    r7: 'บางวันเห็นรุ้งสองตัว ตัวนอกจางกว่า และเรียงสีกลับกัน',
    d0: 'แตะปุ่มดวงอาทิตย์ ส่องแสงเข้าไปในเม็ดฝน',
    d1: 'แสงสีขาวมีหลายสีผสมกันอยู่ พอเข้าไปในเม็ดฝน แต่ละสีหักเหไม่เท่ากัน จึงแยกออกจากกัน',
    d2: 'แสงสะท้อนผนังด้านหลังของเม็ดฝน แล้วย้อนออกมาทางเดิม เราจึงต้องหันหลังให้ดวงอาทิตย์',
    d3: 'แสงที่ออกมาเอียงราวสี่สิบสององศา สีแดงอยู่ด้านนอก สีม่วงอยู่ด้านใน',
    d4: 'เม็ดฝนเป็นล้านๆ เม็ด ช่วยกันส่งแสงคนละสีมาที่ตาเรา จึงเห็นเป็นรุ้งโค้งใหญ่',
    h0: 'แตะค้างปุ่มฉีดน้ำ ให้เป็นฝอยๆ',
    h1: 'ไม่เห็นรุ้งเลย เพราะเราหันหน้าเข้าหาดวงอาทิตย์ ลองหันหลังดู',
    h2: 'ฉีดน้ำอีกทีสิ',
    h3: 'เห็นรุ้งในละอองน้ำแล้ว! ลองทำที่บ้านตอนเช้าหรือตอนเย็นที่แดดออก หันหลังให้ดวงอาทิตย์ แล้วฉีดน้ำเป็นฝอย',
    h4: 'อย่ามองดวงอาทิตย์ตรงๆ นะ แสบตา',
    win: 'เก่งมาก!',
  };
  const BOW = ['#e8322b', '#f7891e', '#ffd21f', '#3fb34f', '#2e6fd8', '#7a3fb8'];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rnd = (a, b) => a + Math.random() * (b - a);
  const D = Math.PI / 180;

  function skyGrad(c, top, bot, gy) {
    const g = c.createLinearGradient(0, -200, 0, gy); g.addColorStop(0, top); g.addColorStop(1, bot);
    c.fillStyle = g; c.fillRect(-1000, -1500, 3000, gy + 1500);
  }
  function sun(c, x, y, r, now) {
    c.strokeStyle = '#ffb703'; c.lineWidth = 6;
    for (let k = 0; k < 12; k++) { const a = k / 12 * 6.283 + now / 3000; c.beginPath(); c.moveTo(x + Math.cos(a) * r * 1.25, y + Math.sin(a) * r * 1.25); c.lineTo(x + Math.cos(a) * r * 1.6, y + Math.sin(a) * r * 1.6); c.stroke(); }
    c.fillStyle = '#ffd93d'; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
  }
  function cloud(c, x, y, s, shade) {
    const v = Math.round(255 - shade * 110);
    c.fillStyle = `rgb(${v},${v},${Math.min(255, v + 8)})`;
    for (const [dx, dy, r] of [[-70, 10, 42], [-30, -14, 52], [20, -24, 58], [70, 0, 46], [0, 18, 50], [-110, 22, 30], [110, 20, 32]]) { c.beginPath(); c.arc(x + dx * s, y + dy * s, r * s, 0, 7); c.fill(); }
  }
  function kid(c, x, y, face) {            // a child standing, facing +1 (right) or −1 (left); feet at y
    c.save(); c.translate(x, y); c.scale(face, 1);
    c.fillStyle = '#2e86de'; c.fillRect(-14, -60, 12, 60); c.fillRect(4, -60, 12, 60);
    c.fillStyle = '#ff6b9d'; c.beginPath(); c.roundRect(-22, -130, 46, 76, 14); c.fill();
    c.fillStyle = '#f2c29b'; c.beginPath(); c.arc(4, -156, 28, 0, 7); c.fill();
    c.fillStyle = '#2d3436'; c.beginPath(); c.arc(0, -166, 29, Math.PI * 0.95, Math.PI * 2.05); c.fill();
    c.beginPath(); c.arc(18, -158, 4, 0, 7); c.fill();
    c.restore();
  }
  function arcBow(c, cx, cy, R, w, alpha, reverse) {
    c.save(); c.globalAlpha = alpha; c.lineWidth = w;
    BOW.forEach((col, i) => { const k = reverse ? BOW.length - 1 - i : i; c.strokeStyle = col; c.beginPath(); c.arc(cx, cy, R - k * w, Math.PI, 0); c.stroke(); });
    c.restore();
  }

  // =====================================================================
  // 1) WHEN DO WE SEE ONE?
  // =====================================================================
  function when(api) {
    const GY = 560, KX = 360, ORB = 420;
    const S = { step: 0, rain: 0, th: 70, drag: false, drops: [], bow: 0, sec: 0, said: {} };
    api.steps(0, 3); api.buttons([]); api.caption(L.r0);
    const sunPos = () => ({ x: KX + Math.cos(S.th * D) * ORB, y: GY - Math.sin(S.th * D) * ORB });
    const behind = () => S.th > 90;
    const alt = () => behind() ? 180 - S.th : S.th;
    function down(p) {
      const s = sunPos();
      if (S.step >= 1 && Math.hypot(p.x - s.x, p.y - s.y) < 90) { S.drag = true; return; }
      if (S.step === 0 && p.x > 540 && p.y < 360) {
        S.rain = 1; S.step = 1; api.steps(1, 3); api.noise(0.6, 1800, 0.12, 'highpass'); api.caption(L.r1);
      }
    }
    function move(p) {
      if (!S.drag) return;
      S.th = clamp(Math.atan2(GY - p.y, p.x - KX) / D, 4, 176);
    }
    function up() { S.drag = false; }
    function tick(dt) {
      const want = S.rain && behind() && alt() < 42 ? 1 : 0;
      S.bow += (want - S.bow) * Math.min(1, dt * 3);
      const wantSec = S.rain && behind() && alt() < 51 ? 1 : 0;
      S.sec += (wantSec - S.sec) * Math.min(1, dt * 3);
      if (S.rain && Math.random() < dt * 70) S.drops.push({ x: rnd(560, 980), y: 290 });
      for (const d of S.drops) d.y += dt * 560;
      S.drops = S.drops.filter(d => d.y < GY);
      if (S.step === 1 && S.bow > 0.6 && !S.drag) {
        S.step = 2; api.steps(2, 3); api.tone(880, 0.2, 'triangle', 0.12); api.caption(L.r2, true);
        const extra = S.sec > 0.3 ? [L.r7] : [];
        api.sayChain([L.r2, L.r3, ...extra, L.r4]);
        setTimeout(() => { if (S.step === 2) api.caption(L.r4, true); }, 14000);
      }
      if (S.step === 2 && behind() && alt() >= 42 && !S.drag) {
        S.step = 3; api.steps(3, 3); api.caption(L.r5, true); api.sayChain([L.r5, L.r6, L.win]); api.win();
      }
    }
    function draw(c, now) {
      const a = alt(), low = clamp(1 - a / 25, 0, 1) * (behind() ? 1 : 0.4);
      skyGrad(c, '#6fc3ff', low > 0.3 ? `rgb(255,${210 - low * 40 | 0},${170 - low * 60 | 0})` : '#e3f6ff', GY);
      // rainbow(s) round the antisolar point, which sits as far below the horizon as the Sun is above it
      if (S.bow > 0.01 || S.sec > 0.01) {
        c.save(); c.beginPath(); c.rect(-1000, -1500, 3000, GY + 1500); c.clip();
        const R = 330, cy = GY + Math.sin(a * D) / Math.sin(42 * D) * R * (behind() ? 1 : 3);
        if (S.sec > 0.01) arcBow(c, 790, cy, R * 51 / 42 + 40, 12, S.sec * 0.35, true);
        if (S.bow > 0.01) arcBow(c, 790, cy, R, 18, S.bow * 0.85, false);
        c.restore();
      }
      if (S.rain) {
        cloud(c, 780, 250, 1.35, 0.6);
        c.strokeStyle = 'rgba(78,168,222,0.7)'; c.lineWidth = 3;
        for (const d of S.drops) { c.beginPath(); c.moveTo(d.x, d.y); c.lineTo(d.x - 4, d.y + 16); c.stroke(); }
      } else {
        cloud(c, 780, 250, 1.35, 0.3);
        c.fillStyle = '#e54b82'; c.font = '700 40px Mitr'; c.textAlign = 'center'; c.fillText('👆', 780, 380 + Math.sin(now / 200) * 8);
      }
      // ground
      c.fillStyle = '#7ed957'; c.fillRect(-1000, GY, 3000, 1500);
      kid(c, KX, GY + 4, 1);
      c.fillStyle = 'rgba(255,255,255,0.9)'; c.font = '600 20px Mitr'; c.textAlign = 'center';
      c.fillText('← ข้างหลัง', 160, GY + 34); c.fillText('ข้างหน้า →', 700, GY + 34);
      // sun on its arc + its height
      const s = sunPos();
      c.strokeStyle = 'rgba(255,255,255,0.45)'; c.setLineDash([8, 10]); c.lineWidth = 3;
      c.beginPath(); c.arc(KX, GY, ORB, Math.PI, 0); c.stroke(); c.setLineDash([]);
      sun(c, s.x, s.y, 38, now);
      c.fillStyle = 'rgba(255,255,255,0.92)'; c.beginPath(); c.roundRect(s.x - 62, s.y + 50, 124, 40, 20); c.fill();
      c.fillStyle = '#2d3436'; c.font = '700 22px Mitr'; c.fillText('สูง ' + Math.round(a) + '°', s.x, s.y + 78);
      if (S.step === 1 && !S.drag) { c.fillStyle = '#e54b82'; c.font = '700 40px Mitr'; c.fillText('⬅', s.x - 70 + Math.sin(now / 200) * 8, s.y + 12); }
    }
    return { bg: '#6fc3ff', focus: [-80, 1000], tick, draw, down, move, up, action() {} };
  }

  // =====================================================================
  // 2) INSIDE A RAINDROP — a real ray trace
  // =====================================================================
  function drop(api) {
    const C = { x: 600, y: 240 }, R = 190, B = 0.86;
    const N = [1.331, 1.332, 1.333, 1.335, 1.338, 1.343];          // water: red … violet
    const EXAG = 6;                                                // colour spread × 6 so it can be seen
    const dot = (a, b) => a.x * b.x + a.y * b.y;
    const norm = (v) => { const l = Math.hypot(v.x, v.y); return { x: v.x / l, y: v.y / l }; };
    function refract(d, n, eta) { const ci = -dot(n, d), k = 1 - eta * eta * (1 - ci * ci); const f = eta * ci - Math.sqrt(Math.max(0, k)); return norm({ x: eta * d.x + f * n.x, y: eta * d.y + f * n.y }); }
    const hitFar = (p, d) => { const t = -2 * dot({ x: p.x - C.x, y: p.y - C.y }, d); return { x: p.x + d.x * t, y: p.y + d.y * t }; };
    const P1 = { x: C.x - R * Math.sqrt(1 - B * B), y: C.y - R * B };
    const rays = N.map((n0) => {
      const n = 1.333 + (n0 - 1.333) * EXAG;
      const n1 = norm({ x: P1.x - C.x, y: P1.y - C.y });
      const d1 = refract({ x: 1, y: 0 }, n1, 1 / n);
      const P2 = hitFar(P1, d1);
      const m2 = norm({ x: P2.x - C.x, y: P2.y - C.y });
      const k = 2 * dot(d1, m2), d2 = { x: d1.x - k * m2.x, y: d1.y - k * m2.y };
      const P3 = hitFar(P2, d2);
      const m3 = norm({ x: P3.x - C.x, y: P3.y - C.y });
      const d3 = refract(d2, { x: -m3.x, y: -m3.y }, n);
      return [P1, P2, P3, { x: P3.x + d3.x * 520, y: P3.y + d3.y * 520 }];
    });
    const S = { t: 0, run: false, step: 0 };
    api.steps(0, 3); api.caption(L.d0);
    api.buttons([{ id: 'shine', label: '☀️ ส่องแสง' }]);
    function action(id) {
      if (id !== 'shine' || S.run) return;
      S.run = true; S.t = 0; api.buttons([]);
      api.tone(660, 0.3, 'sine', 0.1);
    }
    function tick(dt) {
      if (!S.run) return;
      const was = S.t; S.t = Math.min(4, S.t + dt);
      if (was < 1.6 && S.t >= 1.6 && S.step === 0) { S.step = 1; api.steps(1, 3); api.caption(L.d1); }
      if (S.t >= 4 && S.step === 1) {
        S.step = 2; api.steps(2, 3); api.caption(L.d2, true);
        api.sayChain([L.d2, L.d3, L.d4, L.win]);
        setTimeout(() => { S.step = 3; api.steps(3, 3); api.win(); api.buttons([{ id: 'again', label: '☀️ ส่องอีกครั้ง', alt: true }]); }, 3000);
      }
    }
    const scene = { bg: '#cfeeff', focus: [0, 1000], tick, draw, action };
    scene.action = (id) => { if (id === 'again') { S.run = false; S.t = 0; action('shine'); } else action(id); };
    function poly(c, pts, upto) {               // draw a polyline up to a fraction of its length
      const seg = []; let tot = 0;
      for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); seg.push(l); tot += l; }
      let left = tot * upto; c.beginPath(); c.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length && left > 0; i++) {
        const f = Math.min(1, left / seg[i - 1]); left -= seg[i - 1];
        c.lineTo(pts[i - 1].x + (pts[i].x - pts[i - 1].x) * f, pts[i - 1].y + (pts[i].y - pts[i - 1].y) * f);
      }
      c.stroke();
    }
    function draw(c, now) {
      c.fillStyle = '#cfeeff'; c.fillRect(-1000, -1500, 3000, 3200);
      // drop
      const g = c.createRadialGradient(C.x - 60, C.y - 70, 20, C.x, C.y, R);
      g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(1, 'rgba(120,190,240,0.55)');
      c.fillStyle = g; c.strokeStyle = '#4ea8de'; c.lineWidth = 5;
      c.beginPath(); c.arc(C.x, C.y, R, 0, 7); c.fill(); c.stroke();
      c.fillStyle = '#2d3436'; c.font = '600 20px Mitr'; c.textAlign = 'center'; c.fillText('💧 เม็ดฝน 1 เม็ด (ขยายใหญ่)', C.x + 260, C.y - R + 10);
      // sun + incoming white light
      sun(c, 70, P1.y, 34, now);
      if (S.run || S.t > 0) {
        const w = clamp(S.t / 0.8, 0, 1);
        c.strokeStyle = '#fff'; c.lineWidth = 12; c.lineCap = 'round';
        c.shadowColor = '#fff7c2'; c.shadowBlur = 16;
        c.beginPath(); c.moveTo(120, P1.y); c.lineTo(120 + (P1.x - 120) * w, P1.y); c.stroke(); c.shadowBlur = 0;
        const u = clamp((S.t - 0.8) / 3, 0, 1);
        if (u > 0) { c.lineWidth = 5; rays.forEach((r, i) => { c.strokeStyle = BOW[i]; poly(c, r, u); }); }
        if (S.t >= 4) {
          // angle between the light going in and the light coming out ≈ 42°
          const r0 = rays[0], o = r0[2], e = r0[3], ang = Math.atan2(e.y - o.y, e.x - o.x);
          c.strokeStyle = '#2d3436'; c.lineWidth = 3; c.setLineDash([8, 8]);
          c.beginPath(); c.moveTo(o.x, o.y); c.lineTo(o.x - 300, o.y); c.stroke(); c.setLineDash([]);
          c.beginPath(); c.arc(o.x, o.y, 120, Math.PI, ang, ang < Math.PI && ang > 0); c.stroke();
          c.fillStyle = '#2d3436'; c.font = '700 26px Mitr'; c.fillText('≈ 42°', o.x - 170, o.y + 44);
        }
      }
      c.fillStyle = 'rgba(45,52,54,0.6)'; c.font = '500 16px Mitr'; c.textAlign = 'right';
      c.fillText('แยกสีให้เห็นชัดกว่าของจริง', 990, 40);
    }
    return scene;
  }

  // =====================================================================
  // 3) MAKE ONE WITH A HOSE
  // =====================================================================
  function hose(api) {
    const GY = 560;
    const S = { face: 1, spray: false, mist: [], bow: 0, step: 0, sprayed: 0 };
    api.steps(0, 2); api.caption(L.h0);
    const btns = () => api.buttons([{ id: 'spray', label: '💦 ฉีดน้ำ (แตะค้าง)', hold: true }, ...(S.step >= 1 ? [{ id: 'turn', label: '🔄 หันกลับ' }] : [])]);
    btns();
    let hiss = null;
    function action(id, holding) {
      if (id === 'spray') {
        S.spray = !!holding;
        if (holding && !hiss) hiss = api.noiseLoop(3000, 'highpass', 0.7);
        if (!holding && hiss) { hiss.stop(); hiss = null; }
        return;
      }
      if (id === 'turn') { S.face = -S.face; S.mist = []; S.sprayed = 0; if (S.step === 1 && S.face === -1) api.caption(L.h2); }
    }
    function tick(dt) {
      if (hiss) hiss.set(0.06, 3000);
      if (S.spray) {
        S.sprayed += dt;
        for (let k = 0; k < 6; k++) { const a = rnd(-0.35, 0.15), v = rnd(380, 560); S.mist.push({ x: 470 + S.face * 70, y: GY - 130, vx: Math.cos(a) * v * S.face, vy: Math.sin(a) * v, life: rnd(0.8, 1.4) }); }
      }
      for (const m of S.mist) { m.x += m.vx * dt; m.y += m.vy * dt; m.vy += 420 * dt; m.life -= dt; }
      S.mist = S.mist.filter(m => m.life > 0 && m.y < GY);
      const sunBehind = S.face === -1;          // the sun stays on the right
      const want = sunBehind && S.mist.length > 80 ? 1 : 0;
      S.bow += (want - S.bow) * Math.min(1, dt * 2.5);
      if (S.step === 0 && S.sprayed > 2 && !S.spray) { S.step = 1; api.steps(1, 2); api.caption(L.h1); btns(); }
      if (S.step === 1 && S.bow > 0.6) {
        S.step = 2; api.steps(2, 2); api.caption(L.h3, true); api.sayChain([L.h3, L.h4, L.win]); api.win();
      }
    }
    function draw(c, now) {
      skyGrad(c, '#7fcfff', '#ffe3b8', GY);
      sun(c, 900, 230, 40, now);
      c.fillStyle = '#7ed957'; c.fillRect(-1000, GY, 3000, 1500);
      // the mist and, with the sun behind, a small bow in it
      if (S.bow > 0.01) { c.save(); c.beginPath(); c.rect(-1000, -1500, 3000, GY + 1500); c.clip(); arcBow(c, 470 - 330, GY + 40, 200, 11, S.bow * 0.75, false); c.restore(); }
      c.fillStyle = 'rgba(255,255,255,0.75)';
      for (const m of S.mist) { c.beginPath(); c.arc(m.x, m.y, 3, 0, 7); c.fill(); }
      // hose
      c.strokeStyle = '#2e9d4a'; c.lineWidth = 12; c.lineCap = 'round';
      c.beginPath(); c.moveTo(470 + S.face * 70, GY - 128); c.quadraticCurveTo(470 - S.face * 40, GY - 40, 470 - S.face * 250, GY + 10); c.stroke();
      kid(c, 470, GY + 4, S.face);
      c.fillStyle = 'rgba(45,52,54,0.75)'; c.font = '600 20px Mitr'; c.textAlign = 'center';
      c.fillText(S.face === 1 ? 'หันหน้าเข้าหาดวงอาทิตย์' : 'หันหลังให้ดวงอาทิตย์', 470, GY + 36);
    }
    return { bg: '#7fcfff', focus: [80, 960], tick, draw, action, destroy() { if (hiss) hiss.stop(); } };
  }

  window.TOPICS.push({
    id: 'rainbow', emoji: '🌈', title: 'รุ้งกินน้ำ', desc: 'รุ้งเกิดตอนไหน แสงในเม็ดฝนแยกเป็นสีได้ยังไง และทำรุ้งเอง',
    items: [
      { id: 'when', emoji: '🌦️', title: 'เห็นรุ้งตอนไหน' },
      { id: 'drop', emoji: '💧', title: 'ในเม็ดฝน' },
      { id: 'hose', emoji: '💦', title: 'ทำรุ้งเอง' },
    ],
    lines: () => Object.values(L),
    create(api, itemId) { return itemId === 'drop' ? drop(api) : itemId === 'hose' ? hose(api) : when(api); },
  });
})();
