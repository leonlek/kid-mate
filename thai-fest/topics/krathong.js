/* ประเพณีไทย — 🪷 ลอยกระทง
   1) make a krathong the traditional way: a slice of banana trunk as the float, folded banana
      leaf (ใบตอง) round the side, flowers on top, 1 candle + 3 incense sticks → light it (with an
      adult) → float it on the river under the full moon (Loy Krathong = the full-moon night of
      the 12th Thai lunar month; a way to thank / ask forgiveness of the water goddess
      พระแม่คงคา for the water we use and dirty).
   2) which krathong is kind to the river: bread (fish eat it within a day — too many and the
      water goes bad), banana trunk + leaf (rots away in a few weeks), foam (doesn't rot; floats
      as rubbish for hundreds of years). One family, one small krathong. */
(function () {
  const L = {
    warn: 'จุดเทียนและลงไปริมน้ำ ต้องมีผู้ใหญ่อยู่ด้วยนะ',
    m0: 'ฐานกระทงทำจากต้นกล้วย หั่นเป็นแว่นกลมๆ ลอยน้ำได้ดี แตะรอบๆ เพื่อติดกลีบใบตอง',
    m1: 'สวยมาก เลือกดอกไม้ แล้วแตะบนกระทง แต่งให้สวยเลย',
    m2: 'ปักเทียนหนึ่งเล่ม กับธูปสามดอก',
    m3: 'ขอให้ผู้ใหญ่ช่วยจุดเทียนนะ',
    m4: 'กระทงเสร็จแล้ว! ไปลอยกระทงกัน',
    n0: 'คืนนี้พระจันทร์เต็มดวง แตะค้างที่ปุ่มพนมมือ แล้วอธิษฐานในใจ',
    n1: 'ลอยกระทงตรงกับคืนวันเพ็ญ เดือนสิบสอง พระจันทร์เต็มดวง',
    n2: 'คนไทยลอยกระทง เพื่อขอบคุณและขอขมาพระแม่คงคา ที่เราได้ใช้น้ำ',
    e0: 'กระทงสามแบบนี้ ลอยไปในแม่น้ำ แตะปุ่มดูว่าผ่านไปแล้วเป็นยังไง',
    e1: 'ผ่านไปหนึ่งวัน ปลามากินกระทงขนมปังจนหมด แต่ถ้าขนมปังเยอะเกินไป ปลากินไม่หมด น้ำก็เน่าได้',
    e2: 'ผ่านไปสองสัปดาห์ กระทงต้นกล้วยกับใบตองค่อยๆ เปื่อย ย่อยสลายไปเอง',
    e3: 'ผ่านไปตั้งร้อยปี กระทงโฟมก็ยังอยู่ โฟมไม่ย่อยสลาย กลายเป็นขยะในน้ำนานหลายร้อยปี',
    e4: 'เลือกกระทงจากธรรมชาติ ทำกระทงเล็กๆ และครอบครัวเดียวกันลอยกระทงใบเดียวก็ได้',
    win: 'เก่งมาก!',
  };
  const FLOWERS = [['🌼', 'ดาวเรือง'], ['🌸', 'กล้วยไม้'], ['🪷', 'ดอกบัว'], ['🌺', 'ชบา']];
  const rnd = (a, b) => a + Math.random() * (b - a);
  const RX = 170, RY = 52, NF = 10;          // krathong top ellipse; number of leaf folds

  // a krathong centred at (x, y) = middle of the top surface, scale s
  function krathong(c, x, y, s, K, now) {
    c.save(); c.translate(x, y); c.scale(s, s);
    const fold = (k) => {
      const a = k / NF * Math.PI * 2 + Math.PI / NF, fx = Math.cos(a) * RX, fy = Math.sin(a) * RY;
      c.fillStyle = Math.sin(a) > 0 ? '#3f9b4b' : '#2f7d3b'; c.strokeStyle = '#1f5c2a'; c.lineWidth = 3;
      c.beginPath(); c.moveTo(fx - 26, fy + 26); c.quadraticCurveTo(fx - 18, fy - 30, fx * 1.04, fy - 62); c.quadraticCurveTo(fx + 18, fy - 30, fx + 26, fy + 26); c.closePath(); c.fill(); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 2; c.beginPath(); c.moveTo(fx, fy + 20); c.lineTo(fx * 1.02, fy - 50); c.stroke();
    };
    // banana-trunk float: side then the top with its rings
    c.fillStyle = '#d9e8b8'; c.strokeStyle = '#8aa65a'; c.lineWidth = 4;
    c.beginPath(); c.ellipse(0, 40, RX, RY, 0, 0, Math.PI); c.lineTo(-RX, 0); c.ellipse(0, 0, RX, RY, 0, Math.PI, 0, true); c.closePath(); c.fill(); c.stroke();
    for (let k = 0; k < NF; k++) if (K.folds[k] && Math.sin(k / NF * Math.PI * 2 + Math.PI / NF) <= 0) fold(k);
    c.fillStyle = '#f1f6dc'; c.beginPath(); c.ellipse(0, 0, RX, RY, 0, 0, 7); c.fill(); c.stroke();
    c.strokeStyle = 'rgba(138,166,90,0.5)'; c.lineWidth = 2;
    for (const f of [0.75, 0.5, 0.25]) { c.beginPath(); c.ellipse(0, 0, RX * f, RY * f, 0, 0, 7); c.stroke(); }
    // incense (behind) + candle
    if (K.incense) {
      for (const dx of [-26, 0, 26]) {
        c.strokeStyle = '#a0522d'; c.lineWidth = 5; c.beginPath(); c.moveTo(dx * 0.6, -6); c.lineTo(dx, -120); c.stroke();
        if (K.lit) {
          c.fillStyle = '#ff5a1f'; c.beginPath(); c.arc(dx, -122, 4, 0, 7); c.fill();
          c.fillStyle = 'rgba(220,220,220,0.35)';
          for (let j = 0; j < 4; j++) { const t = ((now / 1600) + j / 4 + dx / 100) % 1; c.beginPath(); c.arc(dx + Math.sin(t * 9 + dx) * 10, -126 - t * 90, 5 + t * 8, 0, 7); c.fill(); }
        }
      }
    }
    if (K.candle) {
      c.fillStyle = '#fffbe8'; c.strokeStyle = '#d8cfae'; c.lineWidth = 3;
      c.beginPath(); c.roundRect(-14, -78, 28, 76, 6); c.fill(); c.stroke();
      c.strokeStyle = '#333'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -78); c.lineTo(0, -88); c.stroke();
      if (K.lit) {
        const fl = 1 + Math.sin(now / 70) * 0.08 + Math.sin(now / 43) * 0.05;
        const g = c.createRadialGradient(0, -100, 2, 0, -100, 70); g.addColorStop(0, 'rgba(255,220,120,0.6)'); g.addColorStop(1, 'rgba(255,220,120,0)');
        c.fillStyle = g; c.beginPath(); c.arc(0, -100, 70, 0, 7); c.fill();
        c.fillStyle = '#ffb703'; c.beginPath(); c.moveTo(0, -126 * fl); c.quadraticCurveTo(13, -96, 0, -86); c.quadraticCurveTo(-13, -96, 0, -126 * fl); c.fill();
        c.fillStyle = '#fff3b0'; c.beginPath(); c.ellipse(0, -96, 4, 8, 0, 0, 7); c.fill();
      }
    }
    c.font = '46px serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    for (const f of K.flowers) c.fillText(f.e, f.x, f.y);
    c.textBaseline = 'alphabetic';
    for (let k = 0; k < NF; k++) if (K.folds[k] && Math.sin(k / NF * Math.PI * 2 + Math.PI / NF) > 0) fold(k);
    c.restore();
  }
  const foldPos = (k, x, y) => { const a = k / NF * Math.PI * 2 + Math.PI / NF; return { x: x + Math.cos(a) * RX, y: y + Math.sin(a) * RY - 20 }; };

  // =====================================================================
  // 1) MAKE IT, THEN FLOAT IT
  // =====================================================================
  function make(api) {
    const X = 500, Y = 380;
    const K = { folds: Array(NF).fill(false), flowers: [], candle: false, incense: false, lit: false };
    const S = { phase: 'fold', flower: 0, t: 0, drift: 0, pray: 0, praying: false, others: [], ripple: 0 };
    api.steps(0, 5); api.caption(L.m0); api.buttons([]);
    const flowerBtns = () => api.buttons(FLOWERS.map(([e, th], i) => ({ id: 'f' + i, label: e + ' ' + th, alt: i !== S.flower })));
    function action(id, holding) {
      if (id[0] === 'f' && S.phase === 'flower') { S.flower = +id.slice(1); flowerBtns(); api.say(FLOWERS[S.flower][1]); return; }
      if (id === 'candle' && !K.candle) { K.candle = true; api.tone(700, 0.1, 'triangle', 0.1); nextStick(); return; }
      if (id === 'incense' && !K.incense) { K.incense = true; api.tone(820, 0.1, 'triangle', 0.1); nextStick(); return; }
      if (id === 'light' && S.phase === 'light') {
        K.lit = true; api.noise(0.25, 2400, 0.15, 'highpass'); api.tone(1200, 0.15, 'sine', 0.08);
        S.phase = 'done'; api.steps(4, 5); api.caption(L.m4);
        api.buttons([{ id: 'go', label: '🌕 ไปลอยกระทง' }]); return;
      }
      if (id === 'go' && S.phase === 'done') {
        S.phase = 'night'; scene.bg = '#0d1b3a'; scene.focus = [100, 900]; window.dispatchEvent(new Event('resize'));
        for (let i = 0; i < 6; i++) S.others.push({ x: rnd(-200, 1200), y: rnd(330, 470), v: rnd(8, 18), s: rnd(0.16, 0.26) });
        api.caption(L.n0); api.buttons([{ id: 'pray', label: '🙏 อธิษฐาน (แตะค้าง)', hold: true }]); return;
      }
      if (id === 'pray' && S.phase === 'night') { S.praying = !!holding; return; }
      if (id === 'redo') { Object.assign(scene, make(api)); window.dispatchEvent(new Event('resize')); }
    }
    function nextStick() {
      if (K.candle && K.incense) { S.phase = 'light'; api.steps(3, 5); api.caption(L.m3); api.buttons([{ id: 'light', label: '🔥 ผู้ใหญ่จุดเทียน' }]); }
      else api.buttons([...(K.candle ? [] : [{ id: 'candle', label: '🕯️ เทียน 1 เล่ม' }]), ...(K.incense ? [] : [{ id: 'incense', label: '🥢 ธูป 3 ดอก' }])]);
    }
    function down(p) {
      if (S.phase === 'fold') {
        for (let k = 0; k < NF; k++) {
          const q = foldPos(k, X, Y);
          if (!K.folds[k] && Math.hypot(p.x - q.x, p.y - q.y) < 60) {
            K.folds[k] = true; api.tone(500 + k * 40, 0.08, 'triangle', 0.1); api.buzz(8);
            if (K.folds.every(Boolean)) { S.phase = 'flower'; api.steps(1, 5); api.caption(L.m1); flowerBtns(); }
            return;
          }
        }
      } else if (S.phase === 'flower') {
        const dx = (p.x - X) / (RX * 0.85), dy = (p.y - Y) / (RY * 1.6);
        if (dx * dx + dy * dy <= 1 && K.flowers.length < 14) {
          K.flowers.push({ e: FLOWERS[S.flower][0], x: p.x - X, y: Math.max(-RY * 0.8, Math.min(RY * 0.8, p.y - Y)) });
          K.flowers.sort((a, b) => a.y - b.y);
          api.tone(900 + K.flowers.length * 30, 0.08, 'sine', 0.1); api.buzz(8);
          if (K.flowers.length === 6) { S.phase = 'sticks'; api.steps(2, 5); api.caption(L.m2); nextStick(); }
        }
      }
    }
    function tick(dt) {
      S.t += dt;
      if (S.phase === 'night' || S.phase === 'gone') {
        for (const o of S.others) { o.x += o.v * dt; if (o.x > 1250) o.x = -250; }
        if (S.praying && S.phase === 'night') {
          S.pray = Math.min(1, S.pray + dt / 2.5);
          if (S.pray >= 1) {
            S.phase = 'gone'; api.steps(5, 5); api.buttons([]);
            api.caption(L.n1, true); api.sayChain([L.n1, L.n2, L.win]);
            setTimeout(() => { api.win(); api.buttons([{ id: 'redo', label: '🔄 ทำอีกใบ', alt: true }]); }, 4000);
          }
        }
        if (S.phase === 'gone') { S.drift = Math.min(1, S.drift + dt / 14); S.ripple += dt; }
      }
    }
    function drawDay(c, now) {
      c.fillStyle = '#fdf1dc'; c.fillRect(-1000, -1500, 3000, 3200);
      c.fillStyle = '#c8955a'; c.fillRect(-1000, 470, 3000, 1200);
      krathong(c, X, Y, 1, K, now);
      if (S.phase === 'fold') {
        const pulse = 0.5 + 0.5 * Math.sin(now / 200);
        c.strokeStyle = `rgba(255,107,157,${pulse})`; c.lineWidth = 4; c.setLineDash([8, 8]);
        for (let k = 0; k < NF; k++) if (!K.folds[k]) { const q = foldPos(k, X, Y); c.beginPath(); c.arc(q.x, q.y, 28, 0, 7); c.stroke(); }
        c.setLineDash([]);
      }
      if (S.phase === 'flower') { c.fillStyle = '#2d3436'; c.font = '600 22px Mitr'; c.textAlign = 'center'; c.fillText('ดอกไม้ ' + K.flowers.length + ' / 6', X, 150); }
    }
    function drawNight(c, now) {
      const g = c.createLinearGradient(0, -300, 0, 300); g.addColorStop(0, '#060d24'); g.addColorStop(1, '#1d3466');
      c.fillStyle = g; c.fillRect(-1000, -1500, 3000, 1800);
      c.fillStyle = 'rgba(255,255,255,0.8)';
      for (let i = 0; i < 40; i++) { const x = (i * 211) % 1400 - 200, y = (i * 97) % 260; c.beginPath(); c.arc(x, y, i % 3 ? 1.5 : 2.5, 0, 7); c.fill(); }
      // full moon + its reflection
      const MX = 760, MY = 110;
      const mg = c.createRadialGradient(MX, MY, 40, MX, MY, 160); mg.addColorStop(0, 'rgba(255,248,214,0.5)'); mg.addColorStop(1, 'rgba(255,248,214,0)');
      c.fillStyle = mg; c.beginPath(); c.arc(MX, MY, 160, 0, 7); c.fill();
      c.fillStyle = '#fff8d6'; c.beginPath(); c.arc(MX, MY, 58, 0, 7); c.fill();
      c.fillStyle = 'rgba(200,190,150,0.45)'; for (const [dx, dy, r] of [[-18, -10, 12], [14, 8, 9], [-4, 22, 7], [20, -18, 6]]) { c.beginPath(); c.arc(MX + dx, MY + dy, r, 0, 7); c.fill(); }
      // river
      const rg = c.createLinearGradient(0, 300, 0, 700); rg.addColorStop(0, '#16305e'); rg.addColorStop(1, '#0b1a3a');
      c.fillStyle = rg; c.fillRect(-1000, 300, 3000, 1400);
      c.fillStyle = '#0a1430'; c.beginPath(); c.moveTo(-1000, 300); for (let x = -1000; x <= 2000; x += 80) c.lineTo(x, 300 - 30 - Math.abs(Math.sin(x / 140)) * 40); c.lineTo(2000, 300); c.fill();   // far bank trees
      for (let k = 0; k < 14; k++) { const y = 320 + k * 26, w = 30 + k * 6 + Math.sin(now / 400 + k) * 10; c.fillStyle = `rgba(255,248,214,${0.32 - k * 0.018})`; c.fillRect(MX - w / 2 + Math.sin(now / 300 + k * 1.7) * 8, y, w, 5); }
      for (const o of S.others) krathong(c, o.x, o.y, o.s, { folds: Array(NF).fill(true), flowers: [{ e: '🌼', x: -40, y: -10 }, { e: '🌸', x: 40, y: 0 }], candle: true, incense: true, lit: true }, now);
      // the near bank (stone steps) + ours
      c.fillStyle = '#4b4b5a'; c.fillRect(-1000, 640, 3000, 300);
      const d = S.drift, kx = 500 + d * 380, ky = 560 - d * 190, ks = 0.62 - d * 0.36;
      if (S.ripple > 0) for (let r = 0; r < 3; r++) { const u = ((S.ripple * 0.6) + r / 3) % 1; c.strokeStyle = `rgba(255,255,255,${0.35 * (1 - u)})`; c.lineWidth = 2; c.beginPath(); c.ellipse(kx, ky + 30 * ks, 120 * ks * (1 + u), 30 * ks * (1 + u), 0, 0, 7); c.stroke(); }
      krathong(c, kx, ky + Math.sin(now / 600) * 3, ks, K, now);
      if (S.phase === 'night' && S.pray > 0) {
        c.strokeStyle = '#ffd93d'; c.lineWidth = 10; c.lineCap = 'round';
        c.beginPath(); c.arc(500, 560, 150, -Math.PI / 2, -Math.PI / 2 + S.pray * Math.PI * 2); c.stroke();
      }
    }
    const scene = {
      bg: '#fdf1dc', focus: [270, 730], tick, down, action,
      draw(c, now) { if (S.phase === 'night' || S.phase === 'gone') drawNight(c, now); else drawDay(c, now); },
    };
    return scene;
  }

  // =====================================================================
  // 2) WHICH KRATHONG IS KIND TO THE RIVER?
  // =====================================================================
  function eco(api) {
    const S = { day: 0, fish: [], bread: 1, banana: 1, t: 0 };
    for (let i = 0; i < 5; i++) S.fish.push({ x: rnd(100, 900), y: rnd(470, 640), v: rnd(30, 70) * (Math.random() < 0.5 ? -1 : 1) });
    api.steps(0, 3); api.caption(L.e0);
    const btn = () => api.buttons(S.day === 0 ? [{ id: 'd', label: '⏩ ผ่านไป 1 วัน' }] : S.day === 1 ? [{ id: 'd', label: '⏩ ผ่านไป 2 สัปดาห์' }] : S.day === 2 ? [{ id: 'd', label: '⏩ ผ่านไป 100 ปี' }] : []);
    btn();
    function action(id) {
      if (id !== 'd' || S.day >= 3) return;
      S.day++; api.steps(S.day, 3); api.tone(600 + S.day * 120, 0.15, 'triangle', 0.1);
      if (S.day === 1) api.caption(L.e1);
      if (S.day === 2) api.caption(L.e2);
      if (S.day === 3) { api.caption(L.e3, true); api.sayChain([L.e3, L.e4, L.win]); setTimeout(() => api.win(), 3000); }
      btn();
    }
    function tick(dt) {
      S.t += dt;
      if (S.day >= 1) S.bread = Math.max(0, S.bread - dt * 0.6);
      if (S.day >= 2) S.banana = Math.max(0, S.banana - dt * 0.4);
      for (const f of S.fish) {
        const tx = S.day >= 1 && S.bread > 0 ? 200 : null;
        if (tx !== null) { f.v = (tx - f.x) * 1.2; f.y += (420 - f.y) * dt; }
        f.x += f.v * dt; if (tx === null && (f.x < 40 || f.x > 960)) f.v = -f.v;
        if (tx === null) f.y += (500 + Math.sin(S.t + f.x / 50) * 60 - f.y) * dt * 0.5;
      }
    }
    function mini(c, x, y, kind, k, now) {
      const b = Math.sin(now / 700 + x) * 4;
      if (kind === 'bread') {
        if (k <= 0) return;
        c.fillStyle = '#e0a458'; c.strokeStyle = '#a8642a'; c.lineWidth = 3;
        c.beginPath(); c.ellipse(x, y + b, 90 * k, 28 * k, 0, 0, 7); c.fill(); c.stroke();
        c.fillStyle = '#f3cf8f'; c.beginPath(); c.ellipse(x, y + b - 6 * k, 70 * k, 18 * k, 0, 0, 7); c.fill();
      } else if (kind === 'banana') {
        if (k <= 0.02) return;
        c.globalAlpha = Math.min(1, k * 1.5);
        c.fillStyle = k > 0.6 ? '#d9e8b8' : '#a99a6a'; c.beginPath(); c.ellipse(x, y + b + (1 - k) * 30, 90, 26, 0, 0, 7); c.fill();
        c.fillStyle = k > 0.6 ? '#3f9b4b' : '#7a6a3a';
        for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2, fx = x + Math.cos(a) * 88, fy = y + b + Math.sin(a) * 25 + (1 - k) * 30; c.beginPath(); c.moveTo(fx - 14, fy + 12); c.lineTo(fx, fy - 30 * k); c.lineTo(fx + 14, fy + 12); c.fill(); }
        c.globalAlpha = 1;
      } else {
        c.fillStyle = '#fbfbfb'; c.strokeStyle = '#c8d6e5'; c.lineWidth = 3;
        c.beginPath(); c.ellipse(x, y + b, 90, 26, 0, 0, 7); c.fill(); c.stroke();
        c.beginPath(); c.moveTo(x - 90, y + b); c.lineTo(x - 70, y + b - 34); c.lineTo(x + 70, y + b - 34); c.lineTo(x + 90, y + b); c.fill(); c.stroke();
        if (S.day >= 3) { c.fillStyle = '#9aa7b3'; c.font = '30px serif'; c.textAlign = 'center'; c.fillText('🥤', x + 120, y + b + 10); c.fillText('🛍️', x - 130, y + b + 14); }
      }
    }
    function draw(c, now) {
      c.fillStyle = '#9fdcff'; c.fillRect(-1000, -1500, 3000, 1900);
      c.fillStyle = '#7ed957'; c.fillRect(-1000, 330, 3000, 40);
      const g = c.createLinearGradient(0, 360, 0, 700); g.addColorStop(0, '#5aa9d6'); g.addColorStop(1, '#2d6f9e');
      c.fillStyle = g; c.fillRect(-1000, 360, 3000, 1400);
      c.font = '40px serif'; c.textAlign = 'center';
      for (const f of S.fish) { c.save(); c.translate(f.x, f.y); if (f.v > 0) c.scale(-1, 1); c.fillText('🐟', 0, 0); c.restore(); }
      mini(c, 200, 380, 'bread', S.bread, now);
      mini(c, 500, 380, 'banana', S.banana, now);
      mini(c, 800, 380, 'foam', 1, now);
      c.fillStyle = '#2d3436'; c.font = '700 24px Mitr';
      c.fillText('🍞 ขนมปัง', 200, 290); c.fillText('🍌 ต้นกล้วย', 500, 290); c.fillText('⬜ โฟม', 800, 290);
      const lbl = ['วันลอยกระทง', 'ผ่านไป 1 วัน', 'ผ่านไป 2 สัปดาห์', 'ผ่านไป 100 ปี'][S.day];
      c.fillStyle = 'rgba(255,255,255,0.92)'; c.beginPath(); c.roundRect(350, 40, 300, 60, 30); c.fill();
      c.fillStyle = '#e54b82'; c.font = '700 28px Mitr'; c.fillText('🗓️ ' + lbl, 500, 82);
      if (S.day >= 1) { c.font = '34px serif'; c.fillText(S.bread > 0 ? '😋' : '✅', 200, 230); }
      if (S.day >= 2) { c.fillText('✅', 500, 230); }
      if (S.day >= 3) { c.fillText('❌', 800, 230); }
    }
    return { bg: '#9fdcff', focus: [80, 920], tick, draw, action };
  }

  window.TOPICS.push({
    id: 'krathong', emoji: '🪷', title: 'ลอยกระทง', desc: 'ทำกระทงจากต้นกล้วย ใบตอง ดอกไม้ แล้วลอยใต้พระจันทร์เต็มดวง',
    warn: L.warn,
    items: [
      { id: 'make', emoji: '🪷', title: 'ทำกระทงแล้วลอย' },
      { id: 'eco', emoji: '🐟', title: 'กระทงแบบไหนดี' },
    ],
    lines: () => [...Object.values(L), ...FLOWERS.map(([e, th]) => th)],
    create(api, itemId) { return itemId === 'eco' ? eco(api) : make(api); },
  });
})();
