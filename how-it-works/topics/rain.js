/* ทำไมนะ? — 🌧️ ฝนตกได้ยังไง
   1) the cycle step by step, each with how long it really takes:
      puddle dries in sunshine (hours) → warm air rises and cools ~10 °C per km (10–20 min to
      cloud base ~1.5 km at 1–3 m/s) → vapour condenses on dust/salt (seconds) → droplets
      collide and merge, ~1 million cloud droplets per raindrop (warm rain: ~20 min – 1 h) →
      drops fall (big drops ~9 m/s: 2–5 min) → back to the sea (days to months);
      vapour stays in the air ~9 days on average (USGS).
   2) Thai seasons per the Thai Meteorological Department (rainy mid-May – mid-Oct with the
      SW monsoon; cool mid-Oct – mid-Feb with the NE monsoon, still rain on the south-east
      coast; hot mid-Feb – mid-May) + why rainy-season storms come in the afternoon.
   3) a cold-plate-over-warm-water "rain" to try at home (hot water → adult). */
(function () {
  const L = {
    c1: 'ลากดวงอาทิตย์ไปส่องแอ่งน้ำ',
    c1done: 'น้ำระเหยกลายเป็นไอน้ำ ลอยขึ้นไปในอากาศ เรามองไม่เห็นไอน้ำ วันที่แดดจัด แอ่งน้ำจะแห้งในเวลาหลายชั่วโมง',
    c2: 'ลากฟองอากาศอุ่นขึ้นไปบนฟ้า ดูเทอร์โมมิเตอร์ด้วยนะ',
    c2done: 'ยิ่งสูงยิ่งเย็น อากาศที่ลอยขึ้นจะเย็นลงราว 10 องศา ทุก 1 กิโลเมตร ลอยขึ้นมาถึงตรงนี้ใช้เวลาราว 10 ถึง 20 นาที',
    c3: 'อากาศเย็นลงแล้ว แตะเม็ดฝุ่นเล็กๆ ให้ไอน้ำมาเกาะ',
    c3done: 'ไอน้ำเกาะฝุ่นกลายเป็นหยดน้ำจิ๋ว เกิดเร็วมาก แค่ไม่กี่วินาที หยดน้ำจิ๋วมากมายรวมกันเป็นเมฆ',
    c3fact: 'หยดน้ำในเมฆเล็กมาก เล็กกว่าเส้นผมหลายเท่า เลยลอยอยู่ได้',
    c4: 'แตะเมฆหลายๆ ครั้ง ให้หยดน้ำชนกันจนโตขึ้น',
    c4grey: 'เมฆหนาขึ้นจนเป็นสีเทา เพราะแสงแดดส่องทะลุไม่ได้',
    c4done: 'ได้เม็ดฝนแล้ว! ฝนหนึ่งเม็ดเกิดจากหยดน้ำในเมฆราวหนึ่งล้านหยด ขั้นนี้ใช้เวลาราว 20 นาทีถึง 1 ชั่วโมง',
    c5: 'เม็ดฝนหนักพอแล้ว ตกลงมา! จากเมฆถึงพื้นใช้เวลาราว 2 ถึง 5 นาที',
    c5shape: 'เม็ดฝนไม่ได้เป็นหยดแหลมๆ เม็ดเล็กกลม เม็ดใหญ่แบนข้างล่าง เหมือนขนมปังแฮมเบอร์เกอร์',
    c5river: 'น้ำฝนไหลลงแม่น้ำ กลับสู่ทะเล ใช้เวลาหลายวันถึงหลายเดือน แล้ววนรอบใหม่',
    c5avg: 'โดยเฉลี่ย ไอน้ำอยู่ในอากาศราว 9 วัน แล้วก็ตกกลับลงมาเป็นฝน',
    t0: 'แตะปุ่มฤดู ดูว่าลมพัดมาจากไหน',
    rainy: 'กลางเดือนพฤษภาคมถึงกลางเดือนตุลาคม เป็นฤดูฝน ลมมรสุมตะวันตกเฉียงใต้พัดความชื้นจากทะเลเข้ามา ฝนจึงตกมาก',
    cool: 'กลางเดือนตุลาคมถึงกลางเดือนกุมภาพันธ์ เป็นฤดูหนาว ลมมรสุมตะวันออกเฉียงเหนือพัดอากาศเย็นและแห้งมา แต่ภาคใต้ฝั่งตะวันออกยังมีฝนตก',
    hot: 'กลางเดือนกุมภาพันธ์ถึงกลางเดือนพฤษภาคม เป็นฤดูร้อน อากาศร้อนและฝนตกน้อย',
    pm: 'ตอนเช้าแดดทำให้พื้นร้อน อากาศอุ่นลอยขึ้นเป็นเมฆ เมฆโตขึ้นเรื่อยๆ พอตอนบ่ายหรือตอนเย็น ก็กลายเป็นฝน',
    tdone: 'รู้แล้วว่าฝนบ้านเรามาจากไหน เก่งมาก!',
    h1: 'ขอให้ผู้ใหญ่เทน้ำอุ่นใส่ชาม',
    h2: 'วางจานใส่น้ำแข็งปิดไว้ข้างบน',
    h3: 'ไอน้ำจากน้ำอุ่นลอยขึ้น พอโดนจานเย็นๆ ก็กลายเป็นหยดน้ำเกาะใต้จาน เหมือนเมฆ',
    h4: 'หยดน้ำโตขึ้นจนหนัก แล้วหยดลงมา นี่คือฝนจำลอง ใช้เวลาไม่กี่นาที',
    hwarn: 'น้ำร้อนลวกมือได้ ต้องให้ผู้ใหญ่ทำให้นะ',
    win: 'เก่งมาก!',
  };
  const TL = [['☀️', 'หลายชั่วโมง'], ['⬆️', '10–20 นาที'], ['☁️', 'ไม่กี่วินาที'], ['💧', '20 นาที–1 ชม.'], ['🌧️', '2–5 นาที']];
  const GY = 600, KM = 200;                     // ground line; 1 km of height = 200 units
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rnd = (a, b) => a + Math.random() * (b - a);

  // ---------------- shared drawing ----------------
  function sky(c, grey) {
    const g = c.createLinearGradient(0, 0, 0, GY);
    g.addColorStop(0, grey ? '#9fb2c4' : '#8fd3ff'); g.addColorStop(1, grey ? '#d7e0e8' : '#e3f6ff');
    c.fillStyle = g; c.fillRect(-600, -1500, 2200, GY + 1500);
  }
  function cloud(c, x, y, s, shade) {
    const v = Math.round(255 - shade * 120);
    c.fillStyle = `rgb(${v},${v},${Math.min(255, v + 8)})`;
    for (const [dx, dy, r] of [[-70, 10, 42], [-30, -14, 52], [20, -24, 58], [70, 0, 46], [0, 18, 50], [-110, 22, 30], [110, 20, 32]]) {
      c.beginPath(); c.arc(x + dx * s, y + dy * s, r * s, 0, 7); c.fill();
    }
  }
  function sunDisc(c, x, y, r, now) {
    c.strokeStyle = '#ffb703'; c.lineWidth = 6;
    for (let k = 0; k < 12; k++) { const a = k / 12 * 6.283 + now / 3000; c.beginPath(); c.moveTo(x + Math.cos(a) * r * 1.25, y + Math.sin(a) * r * 1.25); c.lineTo(x + Math.cos(a) * r * 1.6, y + Math.sin(a) * r * 1.6); c.stroke(); }
    c.fillStyle = '#ffd93d'; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
  }
  function bun(c, x, y, r) {          // a falling raindrop: round when small, flat-bottomed when big
    c.fillStyle = '#4ea8de';
    c.beginPath();
    if (r < 5) c.arc(x, y, r, 0, 7);
    else { c.ellipse(x, y, r * 1.15, r, 0, Math.PI, 0); c.quadraticCurveTo(x, y + r * 0.25, x - r * 1.15, y); }
    c.fill();
  }


  // =====================================================================
  // 1) THE CYCLE
  // =====================================================================
  function cycle(api) {
    const S = {
      step: 0, sun: { x: 170, y: 190 }, puddle: 1, vapour: [], bubble: { x: 600, y: GY - 50 },
      specks: [], cloudS: 0, shade: 0, taps: 0, inset: [], drops: [], river: 0, done: false, drag: null, said: {},
    };
    for (let i = 0; i < 6; i++) S.specks.push({ x: 470 + i * 52 + rnd(-10, 10), y: 290 + rnd(-30, 30), hit: false, r: 0 });
    for (let i = 0; i < 32; i++) S.inset.push({ a: rnd(0, 6.28), d: rnd(0, 46), r: 3, sp: rnd(0.5, 1.5) });
    api.steps(0, 5); api.buttons([]); api.caption(L.c1); api.timeline(TL, 0);
    const next = (n, line, extra) => { S.step = n; api.steps(n, 5); api.timeline(TL, n); api.tone(700 + n * 90, 0.15, 'triangle', 0.1); api.buzz(15); api.sayChain([line, ...(extra || [])]); };
    const pt = (p, q, r) => Math.hypot(p.x - q.x, p.y - q.y) < r;

    function down(p) {
      if (S.step === 0 && pt(p, S.sun, 90)) S.drag = 'sun';
      else if (S.step === 1 && pt(p, S.bubble, 100)) S.drag = 'bubble';
      else if (S.step === 2) {
        for (const s of S.specks) if (!s.hit && pt(p, s, 50)) {
          s.hit = true; api.tone(900 + S.specks.filter(x => x.hit).length * 80, 0.1, 'sine', 0.1);
          S.cloudS = S.specks.filter(x => x.hit).length / 6;
          if (S.specks.every(x => x.hit)) { api.caption(L.c3done, true); next(3, L.c3done, [L.c3fact, L.c4]); setTimeout(() => { if (S.step === 3) api.caption(L.c4, true); }, 9000); }
          return;
        }
      } else if (S.step === 3 && (pt(p, { x: 600, y: 230 }, 170) || pt(p, { x: 840, y: 220 }, 90))) {
        S.taps++; S.shake = 0.4; S.shade = Math.min(0.75, S.taps * 0.12);
        api.noise(0.15, 500, 0.15, 'lowpass');
        // merge pairs of droplets in the zoomed view
        for (let k = 0; k < 3 && S.inset.length > 1; k++) { const a = S.inset.pop(); const b = S.inset[Math.floor(Math.random() * S.inset.length)]; b.r = Math.cbrt(a.r ** 3 + b.r ** 3); }
        if (S.taps === 3) api.caption(L.c4grey);
        if (S.inset.length <= 2 || S.taps >= 11) {
          S.inset = [{ a: 0, d: 0, r: 26, sp: 0 }];
          api.caption(L.c4done, true); next(4, L.c4done, [L.c5, L.c5shape]);
          setTimeout(() => { if (S.step === 4) { S.raining = 5; api.caption(L.c5, true); } }, 6500);
        }
      }
    }
    function move(p) {
      if (S.drag === 'sun') { S.sun.x = clamp(p.x, 80, 920); S.sun.y = clamp(p.y, 120, 420); }
      if (S.drag === 'bubble') {
        S.bubble.y = clamp(p.y, 290, GY - 50);
        if (S.bubble.y <= 300) {
          S.drag = null; S.bubble.y = 300;
          api.caption(L.c2done, true); next(2, L.c2done, [L.c3]);
          setTimeout(() => { if (S.step === 2) api.caption(L.c3, true); }, 8000);
        }
      }
    }
    function up() { S.drag = null; }
    function tick(dt, now) {
      if (S.step === 0) {
        const over = Math.abs(S.sun.x - 600) < 140 && S.sun.y < 460;
        if (over) {
          S.puddle = Math.max(0, S.puddle - dt * 0.22);
          if (Math.random() < dt * 25) S.vapour.push({ x: 600 + rnd(-60, 60), y: GY + 2, a: 0.6 });
          if (S.puddle <= 0) { api.caption(L.c1done, true); next(1, L.c1done, [L.c2]); setTimeout(() => { if (S.step === 1) api.caption(L.c2, true); }, 9000); }
        }
      }
      for (const v of S.vapour) { v.y -= dt * 60; v.x += Math.sin(v.y / 30) * dt * 20; v.a -= dt * 0.12; }
      S.vapour = S.vapour.filter(v => v.a > 0 && v.y > 280);
      for (const s of S.specks) if (s.hit) s.r = Math.min(14, s.r + dt * 40);
      if (S.shake > 0) S.shake -= dt;
      for (const d of S.inset) d.a += dt * d.sp;
      if (S.raining > 0) {
        S.raining -= dt;
        if (Math.random() < dt * 40) S.drops.push({ x: 600 + rnd(-140, 140), y: 270, r: Math.random() < 0.3 ? rnd(6, 9) : rnd(2.5, 4.5) });
        S.puddle = Math.min(1, S.puddle + dt * 0.25);
        S.river = Math.min(1, S.river + dt * 0.3);
        if (S.raining <= 0 && !S.done) {
          S.done = true; S.shade = 0.1; S.cloudS = 0.5;
          api.steps(5, 5); api.timeline(TL, 5); api.caption(L.c5river, true);
          api.sayChain([L.c5river, L.c5avg, L.win]);
          api.win();
          api.buttons([{ id: 'redo', label: '🔄 ทำอีกครั้ง', alt: true }]);
        }
      }
      for (const d of S.drops) d.y += dt * (d.r > 5 ? 520 : 330);
      S.drops = S.drops.filter(d => d.y < GY);
      S.now = now;
    }
    function draw(c, now) {
      sky(c, S.shade > 0.4);
      // sea | land, mountain, river
      c.fillStyle = '#4ea8de'; c.fillRect(-600, GY - 10, 950, 1600);
      c.fillStyle = '#9bd36a'; c.beginPath(); c.moveTo(330, GY - 10); c.lineTo(1600, GY - 10); c.lineTo(1600, 2200); c.lineTo(330, 2200); c.fill();
      c.fillStyle = '#7d9b6a'; c.beginPath(); c.moveTo(760, GY - 10); c.lineTo(900, 380); c.lineTo(1060, GY - 10); c.fill();
      c.strokeStyle = S.river > 0 ? `rgba(78,168,222,${0.4 + S.river * 0.6})` : 'rgba(78,168,222,0.3)'; c.lineWidth = 12; c.lineCap = 'round';
      c.setLineDash(S.river > 0 ? [20, 14] : []); c.lineDashOffset = -now / 30;
      c.beginPath(); c.moveTo(880, 470); c.quadraticCurveTo(760, GY + 30, 330, GY + 20); c.stroke(); c.setLineDash([]);
      // puddle
      c.fillStyle = '#4ea8de'; c.beginPath(); c.ellipse(600, GY + 8, 80 * S.puddle + 2, 14 * S.puddle + 1, 0, 0, 7); c.fill();
      if (S.puddle < 0.05) { c.fillStyle = '#c9a26b'; c.beginPath(); c.ellipse(600, GY + 8, 70, 10, 0, 0, 7); c.fill(); }
      // altitude ruler + thermometer
      c.strokeStyle = '#fff'; c.lineWidth = 4; c.beginPath(); c.moveTo(60, GY); c.lineTo(60, GY - 2 * KM); c.stroke();
      c.fillStyle = '#fff'; c.font = '600 20px Mitr'; c.textAlign = 'left';
      for (let k = 0; k <= 2; k++) { c.fillRect(52, GY - k * KM - 2, 18, 4); c.fillText(k + ' กม.', 76, GY - k * KM + 7); }
      // vapour (faint: invisible in real life)
      for (const v of S.vapour) { c.fillStyle = `rgba(255,255,255,${v.a * 0.6})`; c.beginPath(); c.arc(v.x, v.y, 4, 0, 7); c.fill(); }
      // the cloud grows from the specks
      const sh = S.shake > 0 ? Math.sin(now / 20) * 6 : 0;
      if (S.cloudS > 0 && S.step >= 2) cloud(c, 600 + sh, 240, 0.5 + S.cloudS * 0.9, S.shade);
      if (S.step === 2) for (const s of S.specks) {
        if (s.hit) { c.fillStyle = 'rgba(160,210,255,0.9)'; c.beginPath(); c.arc(s.x, s.y, s.r, 0, 7); c.fill(); }
        c.fillStyle = '#8a6a4a'; c.beginPath(); c.arc(s.x, s.y, 5, 0, 7); c.fill();
        if (!s.hit) { c.strokeStyle = `rgba(255,107,157,${0.5 + 0.5 * Math.sin(now / 200)})`; c.lineWidth = 3; c.beginPath(); c.arc(s.x, s.y, 22, 0, 7); c.stroke(); }
      }
      // warm-air bubble with its thermometer
      if (S.step === 1 || S.step === 2) {
        const b = S.bubble, km = (GY - 50 - b.y) / KM + 0.0;
        if (S.step === 1) {
          c.fillStyle = 'rgba(255,170,120,0.35)'; c.strokeStyle = 'rgba(255,120,80,0.8)'; c.lineWidth = 3;
          c.beginPath(); c.arc(b.x, b.y, 48, 0, 7); c.fill(); c.stroke();
          for (let k = 0; k < 7; k++) { c.fillStyle = 'rgba(255,255,255,0.8)'; c.beginPath(); c.arc(b.x + Math.cos(k + now / 600) * 26, b.y + Math.sin(k * 2 + now / 500) * 22, 3.5, 0, 7); c.fill(); }
          c.fillStyle = '#e54b82'; c.font = '700 40px Mitr'; c.textAlign = 'center'; c.fillText('⬆', b.x, b.y - 70 + Math.sin(now / 200) * 6);
        }
        const T = Math.round(32 - 10 * (km + 0.25));
        c.fillStyle = 'rgba(255,255,255,0.92)'; c.beginPath(); c.roundRect(b.x + 64, b.y - 22, 110, 44, 22); c.fill();
        c.fillStyle = T > 24 ? '#e1552a' : '#2e86de'; c.font = '700 24px Mitr'; c.textAlign = 'center';
        c.fillText('🌡️ ' + T + '°C', b.x + 119, b.y + 9);
      }
      // zoom into the cloud: droplets bump together
      if (S.step === 3 || (S.step === 4 && !S.done)) {
        const X = 850, Y = 220;
        c.fillStyle = 'rgba(255,255,255,0.95)'; c.strokeStyle = '#2d3436'; c.lineWidth = 3;
        c.beginPath(); c.arc(X, Y, 70, 0, 7); c.fill(); c.stroke();
        c.save(); c.beginPath(); c.arc(X, Y, 66, 0, 7); c.clip();
        for (const d of S.inset) { c.fillStyle = '#4ea8de'; c.beginPath(); c.arc(X + Math.cos(d.a) * d.d, Y + Math.sin(d.a * 1.3) * d.d, d.r, 0, 7); c.fill(); }
        c.restore();
        c.fillStyle = '#2d3436'; c.font = '600 16px Mitr'; c.textAlign = 'center'; c.fillText('🔍 ข้างในเมฆ', X, Y + 92);
      }
      // the Sun (draggable in step 1, then it stays in the sky)
      sunDisc(c, S.sun.x, S.sun.y, 40, now);
      if (S.step === 0 && !S.drag) { c.fillStyle = '#e54b82'; c.font = '700 40px Mitr'; c.textAlign = 'center'; c.fillText('➜', (S.sun.x + 600) / 2, S.sun.y + 10 + Math.sin(now / 200) * 6); }
      for (const d of S.drops) bun(c, d.x, d.y, d.r);
    }
    const scene = { bg: '#8fd3ff', focus: [40, 980], tick, draw, down, move, up };
    scene.action = (id) => { if (id === 'redo') Object.assign(scene, cycle(api)); };   // a fresh run in the same scene object
    return scene;
  }

  // =====================================================================
  // 2) RAIN IN THAILAND
  // =====================================================================
  function thai(api) {
    const S = { season: null, seen: {}, t: 0, pm: -1, drops: [] };
    api.steps(0, 4); api.caption(L.t0);
    api.buttons([{ id: 'rainy', label: '🌧️ ฤดูฝน' }, { id: 'cool', label: '❄️ ฤดูหนาว' }, { id: 'hot', label: '☀️ ฤดูร้อน' }, { id: 'pm', label: '⛈️ ฝนตอนบ่าย' }]);
    function action(id) {
      if (id === 'pm') { S.season = 'rainy'; S.pm = 0; } else { S.season = id; S.pm = -1; }
      S.seen[id] = 1;
      api.caption(L[id]);
      const n = Object.keys(S.seen).length;
      api.steps(n, 4);
      if (n === 4 && !S.won) { S.won = true; setTimeout(() => { api.win(); api.say(L.tdone); }, id === 'pm' ? 9000 : 6000); }
    }
    function tick(dt) {
      S.t += dt;
      if (S.pm >= 0) S.pm = Math.min(1, S.pm + dt / 8);       // morning → evening in 8 s
      const raining = (S.season === 'rainy' && S.pm < 0) || (S.pm > 0.65);
      if (raining && Math.random() < dt * 50) S.drops.push({ x: rnd(420, 960), y: 200 });
      if (S.season === 'cool' && Math.random() < dt * 12) S.drops.push({ x: rnd(860, 980), y: 220 });   // south-east coast still gets rain
      for (const d of S.drops) d.y += dt * 420;
      S.drops = S.drops.filter(d => d.y < GY);
    }
    function arrows(c, x0, y0, x1, y1, col, now) {
      for (let k = 0; k < 4; k++) {
        const u = ((now / 2500) + k / 4) % 1, x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u + k * 30 - 45;
        const a = Math.atan2(y1 - y0, x1 - x0);
        c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 8; c.globalAlpha = Math.sin(u * Math.PI);
        c.beginPath(); c.moveTo(x - Math.cos(a) * 60, y - Math.sin(a) * 60); c.lineTo(x, y); c.stroke();
        c.beginPath(); c.moveTo(x + Math.cos(a) * 18, y + Math.sin(a) * 18); c.lineTo(x + Math.cos(a + 2.5) * 18, y + Math.sin(a + 2.5) * 18); c.lineTo(x + Math.cos(a - 2.5) * 18, y + Math.sin(a - 2.5) * 18); c.fill();
        c.globalAlpha = 1;
      }
    }
    function draw(c, now) {
      const s = S.season, pm = S.pm;
      const grey = (s === 'rainy' && pm < 0) || pm > 0.6;
      sky(c, grey);
      if (pm >= 0) {   // the sun runs across the day
        const a = Math.PI * (1 - pm);
        sunDisc(c, 500 + Math.cos(a) * 420, 420 - Math.sin(a) * 300, 34, now);
        c.fillStyle = '#2d3436'; c.font = '700 26px Mitr'; c.textAlign = 'center';
        c.fillText(pm < 0.3 ? '🌅 เช้า' : pm < 0.6 ? '☀️ เที่ยง' : '⛈️ บ่าย–เย็น', 500, 130);
      } else if (s === 'hot' || s === 'cool') sunDisc(c, 820, 160, 40, now);
      // sea on the left (Andaman side), land with a Thai house on stilts
      c.fillStyle = '#4ea8de'; c.fillRect(-600, GY - 10, 920, 1600);
      c.fillStyle = '#9bd36a'; c.fillRect(320, GY - 10, 1300, 1600);
      c.fillStyle = '#fff'; c.font = '600 22px Mitr'; c.textAlign = 'center'; c.fillText('ทะเล', 150, GY + 50); c.fillText('แผ่นดิน', 700, GY + 50);
      c.fillStyle = '#8a5a2b'; for (const x of [600, 640, 680, 720]) c.fillRect(x, GY - 70, 8, 60);
      c.fillStyle = '#c8955a'; c.fillRect(590, GY - 130, 140, 62);
      c.fillStyle = '#a0522d'; c.beginPath(); c.moveTo(570, GY - 128); c.lineTo(660, GY - 200); c.lineTo(750, GY - 128); c.fill();
      // clouds
      if (s === 'rainy' && pm < 0) { cloud(c, 560, 200, 1, 0.55); cloud(c, 820, 230, 0.9, 0.6); }
      if (pm >= 0) { const g = clamp((pm - 0.15) / 0.5, 0, 1); if (g > 0) cloud(c, 700, 260 - g * 40, 0.4 + g * 0.8, g * 0.65); }
      if (s === 'cool') cloud(c, 920, 230, 0.6, 0.45);
      // monsoon winds
      if (s === 'rainy' && pm < 0) arrows(c, 40, 520, 600, 260, 'rgba(46,134,222,0.9)', now);
      if (s === 'cool') arrows(c, 960, 140, 380, 420, 'rgba(255,255,255,0.95)', now);
      if (s) {
        c.fillStyle = 'rgba(255,255,255,0.9)'; c.beginPath(); c.roundRect(80, 20, 330, 56, 20); c.fill();
        c.fillStyle = '#2d3436'; c.font = '700 22px Mitr'; c.textAlign = 'left';
        c.fillText(s === 'rainy' ? (pm >= 0 ? '⛈️ วันหนึ่งในหน้าฝน' : '🌧️ ลมมรสุมตะวันตกเฉียงใต้') : s === 'cool' ? '❄️ ลมมรสุมตะวันออกเฉียงเหนือ' : '☀️ ฤดูร้อน', 96, 56);
      }
      for (const d of S.drops) bun(c, d.x, d.y, 3.5);
    }
    return { bg: '#8fd3ff', focus: [60, 980], tick, draw, action };
  }

  // =====================================================================
  // 3) TRY AT HOME: warm water + a cold plate
  // =====================================================================
  function home(api) {
    const S = { step: 0, water: 0, plate: 0, beads: [], drips: [], steam: [], t: 0 };
    api.steps(0, 3); api.caption(L.h1);
    api.buttons([{ id: 'pour', label: '🫖 ผู้ใหญ่เทน้ำอุ่น' }]);
    function action(id) {
      if (id === 'pour' && S.step === 0) { S.step = 1; api.steps(1, 3); api.noise(1.2, 700, 0.2, 'lowpass'); api.caption(L.h2); api.buttons([{ id: 'plate', label: '🍽️ วางจาน + น้ำแข็ง' }]); }
      else if (id === 'plate' && S.step === 1) { S.step = 2; api.steps(2, 3); api.buttons([]); api.caption(L.h3); S.t = 0; }
      else if (id === 'redo') { S.step = 0; S.water = 0; S.plate = 0; S.beads = []; S.drips = []; api.steps(0, 3); api.caption(L.h1); api.buttons([{ id: 'pour', label: '🫖 ผู้ใหญ่เทน้ำอุ่น' }]); }
    }
    function tick(dt) {
      if (S.step >= 1) S.water = Math.min(1, S.water + dt * 0.8);
      if (S.step >= 2) S.plate = Math.min(1, S.plate + dt * 2);
      if (S.water > 0.5 && Math.random() < dt * 20) S.steam.push({ x: rnd(380, 620), y: 470, a: 0.5 });
      for (const s of S.steam) { s.y -= dt * 50; s.a -= dt * 0.35; }
      S.steam = S.steam.filter(s => s.a > 0 && (S.plate < 1 || s.y > 330));
      if (S.step === 2 && S.plate >= 1) {
        S.t += dt;
        if (S.beads.length < 24 && Math.random() < dt * 8) S.beads.push({ x: rnd(370, 630), r: 2 });
        for (const b of S.beads) {
          b.r = Math.min(9, b.r + dt * rnd(0.5, 2.2));
          if (b.r >= 9) { S.drips.push({ x: b.x, y: 336 }); b.r = 2; api.tone(1400 + Math.random() * 400, 0.06, 'sine', 0.06); }
        }
        if (S.drips.length && !S.said) { S.said = true; api.caption(L.h4); setTimeout(() => { if (S.step === 2) { S.step = 3; api.steps(3, 3); api.win(); api.buttons([{ id: 'redo', label: '🔄 ทำอีกครั้ง', alt: true }]); } }, 5000); }
      }
      for (const d of S.drips) d.y += dt * 260;
      S.drips = S.drips.filter(d => d.y < 470);
    }
    function draw(c) {
      c.fillStyle = '#fdf1dc'; c.fillRect(-600, -1500, 2200, 3000);
      c.fillStyle = '#c8955a'; c.fillRect(-600, 560, 2200, 1600);                       // table
      // bowl (glass, so we can see inside)
      c.fillStyle = 'rgba(200,230,255,0.45)'; c.strokeStyle = '#7fa8c9'; c.lineWidth = 5;
      c.beginPath(); c.moveTo(340, 340); c.lineTo(660, 340); c.quadraticCurveTo(650, 560, 500, 560); c.quadraticCurveTo(350, 560, 340, 340); c.fill(); c.stroke();
      if (S.water > 0) {
        const top = 540 - 70 * S.water;
        c.fillStyle = 'rgba(78,168,222,0.7)'; c.beginPath(); c.moveTo(352, top); c.lineTo(648, top); c.quadraticCurveTo(640, 556, 500, 556); c.quadraticCurveTo(360, 556, 352, top); c.fill();
      }
      for (const s of S.steam) { c.fillStyle = `rgba(255,255,255,${s.a})`; c.beginPath(); c.arc(s.x, s.y, 10, 0, 7); c.fill(); }
      // plate with ice
      if (S.plate > 0) {
        const y = 330 - (1 - S.plate) * 200;
        c.fillStyle = '#fff'; c.strokeStyle = '#9aa7b3'; c.lineWidth = 4;
        c.beginPath(); c.ellipse(500, y, 190, 18, 0, 0, 7); c.fill(); c.stroke();
        c.fillStyle = 'rgba(210,240,255,0.95)'; c.strokeStyle = '#8ec5e8';
        for (const [x, w] of [[430, 50], [490, 56], [550, 48]]) { c.beginPath(); c.roundRect(x - w / 2, y - 54, w, 44, 8); c.fill(); c.stroke(); }
        for (const b of S.beads) { c.fillStyle = '#4ea8de'; c.beginPath(); c.arc(b.x, y + 18 + b.r * 0.6, b.r, 0, 7); c.fill(); }
      }
      for (const d of S.drips) bun(c, d.x, d.y, 4);
      c.fillStyle = '#2d3436'; c.font = '600 22px Mitr'; c.textAlign = 'center';
      if (S.water > 0) c.fillText('น้ำอุ่น', 500, 600);
      if (S.plate >= 1) c.fillText('จานเย็นๆ = เหมือนอากาศเย็นบนฟ้า', 500, 260);
    }
    return { bg: '#fdf1dc', focus: [300, 700], tick, draw, action };
  }

  window.TOPICS.push({
    id: 'rain', emoji: '🌧️', title: 'ฝนตกได้ยังไง', desc: 'ตั้งแต่น้ำระเหย เป็นเมฆ จนเป็นเม็ดฝน แต่ละขั้นใช้เวลาเท่าไหร่',
    items: [
      { id: 'cycle', emoji: '🌧️', title: 'ฝนเกิดยังไง' },
      { id: 'thai', emoji: '🇹🇭', title: 'ฝนบ้านเรา' },
      { id: 'home', emoji: '🧪', title: 'ลองที่บ้าน', warn: L.hwarn },
    ],
    lines: () => Object.values(L),
    create(api, itemId) { return itemId === 'thai' ? thai(api) : itemId === 'home' ? home(api) : cycle(api); },
  });
})();
