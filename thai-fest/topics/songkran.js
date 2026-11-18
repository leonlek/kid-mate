/* ประเพณีไทย — 💦 สงกรานต์ (13–15 April, the traditional Thai New Year; UNESCO inscribed
   "Songkran in Thailand" as Intangible Cultural Heritage in December 2023 = พ.ศ. 2566).
   1) รดน้ำดำหัว: jasmine in scented water, pour gently over an elder's hands → a blessing.
   2) สาดน้ำ: splash friends gently — clean water, not in the face, never at someone on a motorbike.
   3) ก่อเจดีย์ทราย: build a sand chedi at the temple (returning the sand carried out on our feet
      over the year) and plant little flags (ธงทิว). */
(function () {
  const L = {
    d0: 'สงกรานต์ วันที่ 13 ถึง 15 เมษายน คือวันขึ้นปีใหม่ไทยแบบดั้งเดิม',
    d1: 'แตะดอกมะลิ ใส่ลงในขันน้ำอบ ให้หอมๆ',
    d2: 'ลากขันน้ำไปที่มือคุณยาย แล้วค้างไว้ รดน้ำเบาๆ',
    d3: 'คุณยายให้พรว่า ขอให้หลานเป็นเด็กดี แข็งแรง เรียนเก่งนะจ๊ะ',
    d4: 'รดน้ำดำหัว คือการรดน้ำที่มือผู้ใหญ่ เพื่อแสดงความเคารพ และขอพร',
    d5: 'ปี 2566 ยูเนสโกประกาศให้สงกรานต์ในประเทศไทย เป็นมรดกทางวัฒนธรรมของโลก',
    swarn: 'สาดน้ำเบาๆ ใช้น้ำสะอาด ไม่สาดใส่หน้า และไม่สาดคนขี่มอเตอร์ไซค์',
    s0: 'แตะเพื่อนที่เดินผ่าน สาดน้ำเย็นๆ ให้ชื่นใจ',
    s1: 'ไม่สาดคนขี่มอเตอร์ไซค์นะ เดี๋ยวล้ม อันตราย',
    s2: 'เดือนเมษายนเป็นช่วงที่ร้อนที่สุดของปี สาดน้ำแล้วเย็นสบาย',
    s3: 'สุขสันต์วันสงกรานต์!',
    c0: 'แตะกองทราย ขนทรายมาก่อเจดีย์',
    c1: 'ปักธงทิวหลากสีบนเจดีย์ทรายให้สวยงาม',
    c2: 'คนสมัยก่อนก่อเจดีย์ทรายในวัด เพื่อคืนทรายที่ติดเท้าออกไปจากวัดตลอดทั้งปี',
    win: 'เก่งมาก!',
  };
  const rnd = (a, b) => a + Math.random() * (b - a);

  function person(c, x, y, s, o) {         // simple figure: feet at (x, y)
    c.save(); c.translate(x, y); c.scale(s, s);
    c.fillStyle = o.pants || '#2e86de'; c.fillRect(-16, -70, 14, 70); c.fillRect(2, -70, 14, 70);
    c.fillStyle = o.shirt; c.beginPath(); c.roundRect(-26, -150, 52, 86, 16); c.fill();
    if (o.flowers) { c.fillStyle = 'rgba(255,255,255,0.8)'; for (const [dx, dy] of [[-12, -130], [10, -110], [-8, -88], [14, -140]]) { c.beginPath(); c.arc(dx, dy, 6, 0, 7); c.fill(); } }
    c.fillStyle = '#f2c29b'; c.beginPath(); c.arc(0, -180, 30, 0, 7); c.fill();
    c.fillStyle = o.hair || '#2d3436'; c.beginPath(); c.arc(0, -188, 31, Math.PI, 0); c.fill();
    c.fillStyle = '#2d3436'; c.beginPath(); c.arc(-10, -180, 3.5, 0, 7); c.arc(10, -180, 3.5, 0, 7); c.fill();
    c.strokeStyle = '#2d3436'; c.lineWidth = 3; c.beginPath(); c.arc(0, -172, 10, 0.2, Math.PI - 0.2); c.stroke();
    if (o.wet > 0) { c.fillStyle = `rgba(78,168,222,${0.7 * o.wet})`; for (let k = 0; k < 8; k++) { c.beginPath(); c.arc(-24 + (k * 37) % 50, -200 + (k * 53) % 180, 5, 0, 7); c.fill(); } }
    c.restore();
  }
  function bowl(c, x, y, s, water) {        // silver ขัน
    c.save(); c.translate(x, y); c.scale(s, s);
    c.fillStyle = '#c9ced6'; c.strokeStyle = '#8f989f'; c.lineWidth = 4;
    c.beginPath(); c.moveTo(-70, -30); c.quadraticCurveTo(-64, 40, 0, 44); c.quadraticCurveTo(64, 40, 70, -30); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = water || '#7fc8f0'; c.beginPath(); c.ellipse(0, -30, 66, 14, 0, 0, 7); c.fill();
    c.strokeStyle = '#8f989f'; c.beginPath(); c.ellipse(0, -30, 70, 16, 0, 0, 7); c.stroke();
    c.restore();
  }

  // =====================================================================
  // 1) รดน้ำดำหัว
  // =====================================================================
  function dam(api) {
    const S = { step: 0, jas: [{ x: 120, y: 560 }, { x: 190, y: 590 }, { x: 260, y: 560 }].map(j => ({ ...j, in: false })), b: { x: 240, y: 430 }, drag: false, pour: 0, drops: [] };
    const HANDS = { x: 640, y: 400 };
    api.steps(0, 3); api.caption(L.d0, true); api.sayChain([L.d0, L.d1]); setTimeout(() => { if (S.step === 0) api.caption(L.d1, true); }, 6000);
    api.buttons([]);
    const overHands = () => Math.abs(S.b.x - (HANDS.x - 60)) < 90 && Math.abs(S.b.y - (HANDS.y - 90)) < 90;
    function down(p) {
      if (S.step === 0) {
        for (const j of S.jas) if (!j.in && Math.hypot(p.x - j.x, p.y - j.y) < 50) {
          j.in = true; api.tone(1000, 0.1, 'sine', 0.1); api.buzz(8);
          if (S.jas.every(q => q.in)) { S.step = 1; api.steps(1, 3); api.caption(L.d2); }
          return;
        }
      } else if (S.step === 1 && Math.hypot(p.x - S.b.x, p.y - S.b.y) < 110) S.drag = true;
    }
    function move(p) { if (S.drag) { S.b.x = Math.max(80, Math.min(820, p.x)); S.b.y = Math.max(160, Math.min(560, p.y)); } }
    function up() { S.drag = false; }
    function tick(dt) {
      const pouring = S.step === 1 && S.drag && overHands();
      if (pouring) {
        S.pour = Math.min(1, S.pour + dt / 3);
        if (Math.random() < dt * 40) S.drops.push({ x: S.b.x + 66 + rnd(-6, 6), y: S.b.y - 20, v: 60 });
        if (S.pour >= 1) {
          S.step = 2; S.drag = false; api.steps(2, 3); api.tone(880, 0.2, 'triangle', 0.12);
          api.caption(L.d3, true); api.sayChain([L.d3, L.d4, L.d5, L.win]);
          setTimeout(() => { S.step = 3; api.steps(3, 3); api.win(); }, 5000);
        }
      }
      for (const d of S.drops) { d.v += 900 * dt; d.y += d.v * dt; }
      S.drops = S.drops.filter(d => d.y < HANDS.y + 120);
    }
    function draw(c, now) {
      c.fillStyle = '#fff3d6'; c.fillRect(-1000, -1500, 3000, 3200);
      c.fillStyle = '#d9a066'; c.fillRect(-1000, 520, 3000, 1200);           // wooden floor
      c.strokeStyle = 'rgba(0,0,0,0.08)'; c.lineWidth = 3; for (let x = -1000; x < 2000; x += 120) { c.beginPath(); c.moveTo(x, 520); c.lineTo(x, 1700); c.stroke(); }
      // grandma sitting, hands cupped over a basin
      c.fillStyle = '#8e6fb5'; c.beginPath(); c.ellipse(760, 500, 150, 60, 0, 0, 7); c.fill();          // lap / pha sin
      c.fillStyle = '#f6f1e7'; c.beginPath(); c.roundRect(700, 260, 120, 200, 40); c.fill();             // blouse
      c.fillStyle = '#f2c29b'; c.beginPath(); c.arc(760, 220, 52, 0, 7); c.fill();
      c.fillStyle = '#d0d0d0'; c.beginPath(); c.arc(760, 205, 54, Math.PI, 0); c.fill(); c.beginPath(); c.arc(760, 150, 24, 0, 7); c.fill();
      c.fillStyle = '#2d3436'; c.beginPath(); c.arc(742, 222, 4, 0, 7); c.arc(778, 222, 4, 0, 7); c.fill();
      c.strokeStyle = '#2d3436'; c.lineWidth = 3; c.beginPath(); c.arc(760, 236, 14, 0.2, Math.PI - 0.2); c.stroke();
      c.strokeStyle = '#f2c29b'; c.lineWidth = 26; c.lineCap = 'round'; c.beginPath(); c.moveTo(720, 320); c.quadraticCurveTo(680, 380, HANDS.x, HANDS.y); c.stroke();
      c.fillStyle = '#f2c29b'; c.beginPath(); c.ellipse(HANDS.x, HANDS.y, 40, 18, -0.2, 0, 7); c.fill();
      bowl(c, HANDS.x - 10, HANDS.y + 110, 0.75, `rgba(127,200,240,${0.3 + S.pour * 0.7})`);
      // jasmine tray
      c.fillStyle = '#7ed957'; c.beginPath(); c.ellipse(190, 590, 130, 34, 0, 0, 7); c.fill();
      for (const j of S.jas) if (!j.in) {
        c.fillStyle = '#fff'; for (let k = 0; k < 5; k++) { const a = k * 1.2566; c.beginPath(); c.arc(j.x + Math.cos(a) * 12, j.y + Math.sin(a) * 12, 10, 0, 7); c.fill(); }
        c.fillStyle = '#ffe9a8'; c.beginPath(); c.arc(j.x, j.y, 6, 0, 7); c.fill();
        if (S.step === 0) { c.strokeStyle = `rgba(255,107,157,${0.5 + 0.5 * Math.sin(now / 200)})`; c.lineWidth = 3; c.beginPath(); c.arc(j.x, j.y, 32, 0, 7); c.stroke(); }
      }
      // the bowl (tilted when pouring)
      c.save(); c.translate(S.b.x, S.b.y);
      if (S.drag && overHands()) c.rotate(0.5);
      bowl(c, 0, 0, 1, '#b9e4ff');
      for (const j of S.jas) if (j.in) { c.fillStyle = '#fff'; c.beginPath(); c.arc((j.x - 190) * 0.4, -32, 9, 0, 7); c.fill(); }
      c.restore();
      c.fillStyle = 'rgba(127,200,240,0.9)'; for (const d of S.drops) { c.beginPath(); c.arc(d.x, d.y, 4, 0, 7); c.fill(); }
      if (S.step === 1) {
        c.fillStyle = 'rgba(255,255,255,0.9)'; c.beginPath(); c.roundRect(380, 40, 240, 28, 14); c.fill();
        c.fillStyle = '#4ea8de'; c.beginPath(); c.roundRect(384, 44, 232 * S.pour, 20, 10); c.fill();
        if (!S.drag) { c.fillStyle = '#e54b82'; c.font = '700 40px Mitr'; c.textAlign = 'center'; c.fillText('➜', S.b.x + 120 + Math.sin(now / 200) * 8, S.b.y - 40); }
      }
      if (S.step >= 2) { c.font = '50px serif'; c.textAlign = 'center'; c.fillText('💖', 760 + Math.sin(now / 300) * 10, 110); }
    }
    return { bg: '#fff3d6', focus: [80, 900], tick, draw, down, move, up, action() {} };
  }

  // =====================================================================
  // 2) สาดน้ำ
  // =====================================================================
  function splash(api) {
    const SHIRTS = ['#ff9ff3', '#feca57', '#48dbfb', '#ff6b6b', '#1dd1a1', '#5f27cd'];
    const S = { ppl: [], bike: null, arcs: [], back: 0, n: 0, need: 8, t: 0, done: false, nextBike: 6 };
    const add = (x) => S.ppl.push({ x, v: rnd(50, 80), s: rnd(0.9, 1.1), shirt: SHIRTS[S.ppl.length % 6], wet: 0, flowers: true });
    for (let i = 0; i < 3; i++) add(-100 - i * 380);
    api.steps(0, S.need); api.buttons([]); api.caption(L.s0);
    function down(p) {
      if (S.bike && Math.abs(p.x - S.bike.x) < 120 && p.y > 300 && p.y < 560) { api.caption(L.s1); api.tone(300, 0.2, 'square', 0.06); return; }
      for (const q of S.ppl) {
        if (Math.abs(p.x - q.x) < 60 && p.y > 330 && p.y < 560) {
          S.arcs.push({ x0: 500, y0: 640, x1: q.x, y1: 420, t: 0, who: q });
          api.noise(0.35, 1400, 0.18, 'bandpass'); api.buzz(15);
          return;
        }
      }
    }
    function tick(dt) {
      S.t += dt;
      for (const q of S.ppl) { q.x += q.v * dt; q.wet = Math.max(0, q.wet - dt * 0.15); if (q.x > 1150) { q.x = -150; q.wet = 0; q.shirt = SHIRTS[Math.floor(rnd(0, 6))]; } }
      S.nextBike -= dt;
      if (!S.bike && S.nextBike <= 0) S.bike = { x: 1200, v: -260 };
      if (S.bike) { S.bike.x += S.bike.v * dt; if (S.bike.x < -200) { S.bike = null; S.nextBike = rnd(8, 14); } }
      for (const a of S.arcs) {
        a.t += dt * 2.2;
        if (a.t >= 1 && !a.hit) {
          a.hit = true; a.who.wet = 1; S.n++; api.steps(Math.min(S.n, S.need), S.need);
          api.tone(700 + Math.random() * 300, 0.12, 'triangle', 0.1); setTimeout(() => api.tone(950, 0.1, 'triangle', 0.08), 90);
          if (Math.random() < 0.3) S.back = 1;
          if (S.n === 3) api.caption(L.s2);
          if (S.n >= S.need && !S.done) { S.done = true; api.caption(L.s3, true); api.sayChain([L.s3, L.win]); api.win(); }
        }
      }
      S.arcs = S.arcs.filter(a => a.t < 1.3);
      S.back = Math.max(0, S.back - dt * 0.8);
    }
    function draw(c, now) {
      c.fillStyle = '#8fd3ff'; c.fillRect(-1000, -1500, 3000, 1800);
      c.fillStyle = '#ffd93d'; c.beginPath(); c.arc(850, 90, 50, 0, 7); c.fill();
      // shophouses + a banner
      for (let i = -3; i < 12; i++) { c.fillStyle = ['#f6d1a8', '#f9e4c8', '#e8c39e'][(i + 3) % 3]; c.fillRect(i * 130, 120, 128, 230); c.fillStyle = '#7fb4d9'; c.fillRect(i * 130 + 24, 160, 34, 46); c.fillRect(i * 130 + 72, 160, 34, 46); }
      c.fillStyle = '#e54b82'; c.fillRect(250, 210, 500, 44); c.fillStyle = '#fff'; c.font = '700 28px Mitr'; c.textAlign = 'center'; c.fillText('สุขสันต์วันสงกรานต์', 500, 242);
      c.fillStyle = '#9aa7b3'; c.fillRect(-1000, 350, 3000, 1400);
      c.fillStyle = '#cfd6dd'; c.fillRect(-1000, 350, 3000, 24);
      for (const q of S.ppl) person(c, q.x, 540, q.s, q);
      if (S.bike) { c.save(); c.translate(S.bike.x, 520); c.font = '110px serif'; c.textAlign = 'center'; c.fillText('🛵', 0, 0); c.restore(); }
      for (const a of S.arcs) {
        const u = Math.min(1, a.t);
        c.strokeStyle = 'rgba(78,168,222,0.8)'; c.lineWidth = 14; c.lineCap = 'round'; c.beginPath();
        for (let k = 0; k <= 20; k++) { const v = k / 20 * u, x = a.x0 + (a.x1 - a.x0) * v, y = a.y0 + (a.y1 - a.y0) * v - Math.sin(v * Math.PI) * 180; k ? c.lineTo(x, y) : c.moveTo(x, y); }
        c.stroke();
        if (a.t > 1) { c.fillStyle = 'rgba(127,200,240,0.8)'; for (let k = 0; k < 10; k++) { const r = (a.t - 1) * 300; c.beginPath(); c.arc(a.x1 + Math.cos(k) * r * 0.6, 420 + Math.sin(k * 1.7) * r * 0.4, 6, 0, 7); c.fill(); } }
      }
      bowl(c, 500, 660, 1.2, '#7fc8f0');
      if (S.back > 0) { c.fillStyle = `rgba(127,200,240,${S.back * 0.5})`; c.fillRect(-1000, -1500, 3000, 3200); c.font = '60px serif'; c.textAlign = 'center'; c.globalAlpha = S.back; c.fillText('💦😆', 500, 300); c.globalAlpha = 1; }
    }
    return { bg: '#8fd3ff', focus: [120, 880], tick, draw, down, action() {} };
  }

  // =====================================================================
  // 3) ก่อเจดีย์ทราย
  // =====================================================================
  function chedi(api) {
    const FLAGS = ['#e8322b', '#ffd21f', '#2e6fd8', '#3fb34f', '#ff6b9d', '#f7891e'];
    const S = { sand: 0, flags: [], step: 0, poof: [] };
    const NEED = 12;
    api.steps(0, 2); api.buttons([]); api.caption(L.c0);
    const X = 500, GY = 560;
    function shape() {                        // tiers grow with the sand
      const k = S.sand / NEED, out = [];
      out.push({ w: 360 * Math.min(1, k * 2.4), h: 80 * Math.min(1, k * 2.4), y: GY });
      if (k > 0.4) out.push({ w: 250 * Math.min(1, (k - 0.4) * 4), h: 70 * Math.min(1, (k - 0.4) * 4), y: GY - 80 });
      if (k > 0.65) out.push({ w: 160 * Math.min(1, (k - 0.65) * 5), h: 60 * Math.min(1, (k - 0.65) * 5), y: GY - 150 });
      return out;
    }
    function down(p) {
      if (S.step === 0 && Math.abs(p.x - X) < 260 && p.y > 200 && p.y < 640) {
        S.sand++; api.noise(0.25, 900, 0.15, 'lowpass'); api.buzz(10);
        for (let i = 0; i < 12; i++) S.poof.push({ x: X + rnd(-120, 120), y: GY - 40, vx: rnd(-80, 80), vy: rnd(-200, -80), a: 1 });
        if (S.sand >= NEED) { S.step = 1; api.steps(1, 2); api.caption(L.c1); }
      } else if (S.step === 1 && S.flags.length < 8 && Math.abs(p.x - X) < 200 && p.y > 220 && p.y < GY) {
        const n = S.flags.length, spots = [[-150, GY - 30], [150, GY - 30], [-100, GY - 110], [100, GY - 110], [-60, GY - 180], [60, GY - 180], [-170, GY - 60], [170, GY - 60]];
        S.flags.push({ dx: spots[n][0], y: spots[n][1], col: FLAGS[n % FLAGS.length] });
        api.tone(800 + n * 60, 0.1, 'triangle', 0.1); api.buzz(8);
        if (S.flags.length === 6 && S.step === 1) { S.step = 2; api.steps(2, 2); api.caption(L.c2, true); api.sayChain([L.c2, L.win]); api.win(); }
      }
    }
    function tick(dt) { for (const q of S.poof) { q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 600 * dt; q.a -= dt * 1.5; } S.poof = S.poof.filter(q => q.a > 0); }
    function draw(c, now) {
      c.fillStyle = '#9fdcff'; c.fillRect(-1000, -1500, 3000, 2100);
      // temple roof in the background
      c.fillStyle = '#c0392b'; c.beginPath(); c.moveTo(-60, 300); c.lineTo(160, 120); c.lineTo(380, 300); c.fill();
      c.fillStyle = '#f1c40f'; c.beginPath(); c.moveTo(150, 120); c.quadraticCurveTo(160, 70, 185, 60); c.lineTo(170, 120); c.fill();
      c.fillStyle = '#fbeee0'; c.fillRect(0, 300, 320, 260);
      c.fillStyle = '#e9d8b0'; c.fillRect(-1000, GY, 3000, 1200);
      const t = shape(), sandC = '#d9b77a';
      for (const s of t) { c.fillStyle = sandC; c.strokeStyle = '#b8955a'; c.lineWidth = 3; c.beginPath(); c.moveTo(X - s.w / 2, s.y); c.quadraticCurveTo(X - s.w / 2 + 10, s.y - s.h, X, s.y - s.h); c.quadraticCurveTo(X + s.w / 2 - 10, s.y - s.h, X + s.w / 2, s.y); c.closePath(); c.fill(); c.stroke(); }
      if (S.sand >= NEED) { c.fillStyle = sandC; c.beginPath(); c.moveTo(X - 30, GY - 205); c.lineTo(X, GY - 320); c.lineTo(X + 30, GY - 205); c.fill(); c.stroke(); }
      for (const q of S.poof) { c.fillStyle = `rgba(217,183,122,${q.a})`; c.beginPath(); c.arc(q.x, q.y, 6, 0, 7); c.fill(); }
      for (const f of S.flags) {
        const wv = Math.sin(now / 200 + f.dx) * 6;
        c.strokeStyle = '#6b4a2b'; c.lineWidth = 4; c.beginPath(); c.moveTo(X + f.dx, f.y); c.lineTo(X + f.dx, f.y - 90); c.stroke();
        c.fillStyle = f.col; c.beginPath(); c.moveTo(X + f.dx, f.y - 90); c.lineTo(X + f.dx + 46, f.y - 78 + wv); c.lineTo(X + f.dx, f.y - 60); c.fill();
      }
      // bucket of sand
      c.font = '70px serif'; c.textAlign = 'center'; c.fillText('🪣', 830, 620);
      if (S.step === 0) { c.fillStyle = '#e54b82'; c.font = '700 26px Mitr'; c.fillText('แตะ ' + S.sand + ' / ' + NEED, X, 160); }
    }
    return { bg: '#9fdcff', focus: [140, 880], tick, draw, down, action() {} };
  }

  window.TOPICS.push({
    id: 'songkran', emoji: '💦', title: 'สงกรานต์', desc: 'ปีใหม่ไทย 13 เมษายน รดน้ำดำหัว สาดน้ำ ก่อเจดีย์ทราย',
    items: [
      { id: 'dam', emoji: '🙏', title: 'รดน้ำดำหัว' },
      { id: 'splash', emoji: '💦', title: 'สาดน้ำ', warn: L.swarn },
      { id: 'chedi', emoji: '🏯', title: 'ก่อเจดีย์ทราย' },
    ],
    lines: () => Object.values(L),
    create(api, itemId) { return itemId === 'splash' ? splash(api) : itemId === 'chedi' ? chedi(api) : dam(api); },
  });
})();
