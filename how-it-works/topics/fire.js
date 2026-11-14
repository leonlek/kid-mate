/* ทำไมนะ? — 🔥 จุดไฟแบบโบราณ
   Five real ways people made fire before matches. Every method ends the same way:
   ember → tinder nest → blow gently → add small, then bigger wood → put it out properly.
   Facts: friction fire (hand drill, bow drill), bamboo fire saw (Southeast Asia),
   fire piston (Southeast Asia & Pacific), flint and steel (hot steel shavings + char cloth),
   fire triangle (fuel, heat, oxygen). */
(function () {
  const L = {
    handIntro: 'สว่านมือ ลากนิ้วซ้ายขวาเร็วๆ ให้ไม้หมุนถูกับแผ่นไม้',
    handFact: 'วิธีนี้ยากที่สุด ต้องถูให้เร็วและนานมาก มือจะเหนื่อย',
    bowIntro: 'ธนูสีไฟ ลากนิ้วซ้ายขวา ดึงคันธนูไปมา ให้ไม้หมุน',
    bowFact: 'เชือกของคันธนูพันรอบไม้ ช่วยให้ไม้หมุนเร็ว และไม่เหนื่อยเท่าสว่านมือ',
    sawIntro: 'เลื่อยไฟไม้ไผ่ ลากนิ้วซ้ายขวา ถูไม้ไผ่ไปมาเหมือนเลื่อย',
    sawFact: 'คนในแถบเอเชียตะวันออกเฉียงใต้ ใช้ไม้ไผ่จุดไฟแบบนี้ ขุยไม้ไผ่ที่ขูดออกมาเป็นเชื้อไฟอย่างดี',
    heat: 'ถูไม้เร็วๆ ทำให้เกิดความร้อน เหมือนเวลาเราถูมือแล้วมืออุ่น',
    smoke: 'มีควันแล้ว ผงไม้ร้อนจัดกำลังกลายเป็นถ่านแดง ถูต่ออีก',
    ember: 'ได้ถ่านแดงแล้ว!',
    pistonIntro: 'ลูกสูบไฟ ลากด้ามลงเร็วๆ ให้สุดในทีเดียว',
    pistonSlow: 'ช้าไปนิด ดึงขึ้นแล้วกดลงให้เร็วกว่านี้นะ',
    pistonHot: 'อัดอากาศเร็วๆ อากาศข้างในร้อนจัด จนเชื้อไฟติดเป็นถ่านแดง ดึงด้ามขึ้นมาดูสิ',
    pistonFact: 'ลูกสูบไฟเป็นเครื่องมือของคนในแถบเอเชียตะวันออกเฉียงใต้มาแต่โบราณ',
    flintIntro: 'ตีเหล็กไฟ ปัดนิ้วลงเร็วๆ ให้เหล็กตีกับหิน',
    sparks: 'เศษเหล็กเล็กๆ ที่ถูกหินขูดออกมา ร้อนจนลุกเป็นประกายไฟ',
    charcloth: 'ประกายไฟตกบนผ้าถ่าน ผ้าถ่านติดไฟง่ายมาก ได้ถ่านแดงแล้ว!',
    move: 'ย้ายถ่านแดงไปใส่รังเชื้อไฟ ที่ทำจากหญ้าแห้งกับขุยมะพร้าว',
    blow: 'แตะค้างที่ปุ่มเป่า เป่าลมเบาๆ ไฟต้องการอากาศ',
    flame: 'ติดเป็นเปลวไฟแล้ว! ใส่ไม้ให้ไฟโตขึ้น เลือกไม้ขนาดไหนก่อนดี',
    wrongBig: 'ไม้ใหญ่เกินไป ไฟยังเล็กอยู่ ลองใส่กิ่งไม้เล็กก่อนนะ',
    biggerNow: 'ไฟโตพอแล้ว ใส่ไม้ที่ใหญ่ขึ้นได้เลย',
    smallOk: 'กิ่งไม้เล็กติดไฟง่าย ไฟเริ่มโตแล้ว',
    medOk: 'ไฟโตขึ้นอีก ใส่ท่อนไม้ใหญ่ได้แล้ว',
    largeOk: 'กองไฟใหญ่แล้ว!',
    triangle: 'ไฟต้องมีสามอย่าง คือ เชื้อเพลิง ความร้อน และอากาศ ขาดอย่างใดอย่างหนึ่ง ไฟก็ดับ',
    out: 'เลิกใช้ไฟแล้ว ต้องดับให้สนิท กดราดน้ำเลย',
    stir: 'คนให้ทั่ว ไม่ให้มีถ่านร้อนซ่อนอยู่ข้างใต้',
    again: 'ราดน้ำอีกครั้ง จนไม่มีควันเลย',
    done: 'ดับไฟเรียบร้อย เก่งมาก!',
    safety: 'ไฟอันตรายมาก ห้ามลองจุดไฟเองนะ ต้องมีผู้ใหญ่อยู่ด้วยเสมอ',
  };
  const METHODS = [
    { id: 'hand', e: '🪵', t: 'สว่านมือ', rate: 1.0e-4, intro: L.handIntro, fact: L.handFact },
    { id: 'bow', e: '🏹', t: 'ธนูสีไฟ', rate: 1.7e-4, intro: L.bowIntro, fact: L.bowFact },
    { id: 'saw', e: '🎋', t: 'เลื่อยไม้ไผ่', rate: 1.35e-4, intro: L.sawIntro, fact: L.sawFact },
    { id: 'piston', e: '💨', t: 'ลูกสูบไฟ', intro: L.pistonIntro, fact: L.pistonFact },
    { id: 'flint', e: '🪨', t: 'ตีเหล็กไฟ', intro: L.flintIntro, fact: L.sparks },
  ];
  const GY = 560, NEST = { x: 760, y: GY - 14 };
  const SPOT = { hand: { x: 400, y: GY - 34 }, bow: { x: 400, y: GY - 34 }, saw: { x: 400, y: GY - 52 }, piston: { x: 430, y: 300 }, flint: { x: 452, y: 404 } };
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  window.TOPICS.push({
    id: 'fire', emoji: '🔥', title: 'จุดไฟแบบโบราณ', desc: '5 วิธีที่คนโบราณใช้ ไม่มีไม้ขีด ไม่มีไฟแช็ก',
    warn: L.safety,
    items: METHODS.map(m => ({ id: m.id, emoji: m.e, title: m.t })),
    lines: () => Object.values(L),
    create(api, itemId) {
      const m = METHODS.find(x => x.id === itemId);
      const S = {
        phase: 'make', heat: 0, smoke: [], sparks: [], steam: [], ember: null, glow: 0, fire: 0, wood: 0,
        lastX: null, lastT: 0, spin: 0, rubX: 0, said: {}, blowing: false, drag: null,
        plY: 260, plStart: null, lit: false, strikes: 0, steel: { x: 560, y: 300 }, outStep: 0, wet: 0, flick: 0,
      };
      const spot = SPOT[m.id];
      const rub = api.noiseLoop(m.id === 'saw' ? 1400 : 900, 'bandpass', 0.8);
      const blowS = api.noiseLoop(500, 'lowpass');
      const crackle = { t: 0 };
      api.steps(0, 5);
      api.buttons([]);
      api.caption(m.intro);
      const setPhase = (p, step) => { S.phase = p; api.steps(step, 5); };
      function gotEmber() {
        S.ember = { x: spot.x, y: spot.y, home: { x: spot.x, y: spot.y } };
        api.tone(880, 0.15, 'triangle', 0.12); api.tone(1320, 0.2, 'triangle', 0.1);
        api.buzz([20, 30, 20]);
        setPhase('move', 1);
        api.sayChain(m.id === 'flint' ? [L.charcloth, L.move] : m.id === 'piston' ? [L.ember, L.pistonFact, L.move] : [L.ember, L.move]);
        api.caption(L.move, true);
      }

      // ---------------- input ----------------
      function down(p) {
        if (S.phase === 'make') {
          if (m.id === 'piston') { if (p.y < S.plY + 140 && Math.abs(p.x - 430) < 200) S.drag = { kind: 'pl', dy: S.plY - p.y }; return; }
          if (m.id === 'flint') { S.drag = { kind: 'steel' }; S.steel = { x: p.x, y: p.y }; S.lastY = p.y; S.lastT = p.t; return; }
          S.drag = { kind: 'rub' }; S.lastX = p.x; S.lastT = p.t; S.rub0 = p.x - S.rubX;
          if (!S.said.intro) { S.said.intro = 1; }
          return;
        }
        if (S.phase === 'move' && S.ember && dist(p, S.ember) < 90) S.drag = { kind: 'ember', dx: S.ember.x - p.x, dy: S.ember.y - p.y };
      }
      function move(p) {
        const d = S.drag; if (!d) return;
        if (d.kind === 'rub') {
          const dx = p.x - S.lastX, dt = Math.max(1, p.t - S.lastT) / 1000;
          S.lastX = p.x; S.lastT = p.t;
          S.heat = clamp(S.heat + Math.abs(dx) * m.rate * (Math.abs(dx) / dt > 250 ? 1 : 0.2), 0, 1);
          S.spin += dx * 0.06; S.rubX = clamp(p.x - S.rub0, -120, 120);
          S.speed = Math.abs(dx) / dt;
          if (S.heat >= 1 && S.phase === 'make') { rub.set(0); gotEmber(); S.drag = null; }
        } else if (d.kind === 'pl') {
          const y = clamp(p.y + d.dy, 260, 500);
          if (y < 300) S.plStart = { t: p.t };
          if (S.lit && y < 290 && S.plY >= 290) { S.plY = y; gotEmber(); S.drag = null; return; }
          if (!S.lit && y >= 498 && S.plY < 498) {
            const fast = S.plStart && p.t - S.plStart.t < 350;
            if (fast) { S.lit = true; S.flash = 1; api.noise(0.15, 300, 0.5, 'lowpass'); api.buzz(40); api.caption(L.pistonHot); }
            else { api.tone(200, 0.15, 'triangle', 0.08); if (!S.said.slow || Math.random() < 0.5) { S.said.slow = 1; api.caption(L.pistonSlow); } }
            S.plStart = null;
          }
          S.plY = y;
        } else if (d.kind === 'steel') {
          const vy = (p.y - S.lastY) / Math.max(1, p.t - S.lastT) * 1000;
          if (S.lastY < 395 && p.y >= 395 && vy > 900 && Math.abs(p.x - 470) < 140) strike();
          S.steel = { x: p.x, y: p.y }; S.lastY = p.y; S.lastT = p.t;
        } else if (d.kind === 'ember') {
          S.ember.x = p.x + d.dx; S.ember.y = p.y + d.dy;
        }
      }
      function up() {
        const d = S.drag; S.drag = null;
        if (d && d.kind === 'ember') {
          if (dist(S.ember, NEST) < 110) {
            S.ember.x = NEST.x; S.ember.y = NEST.y - 6; S.inNest = true;
            api.tone(660, 0.12); setPhase('blow', 2);
            api.buttons([{ id: 'blow', label: '💨 เป่า (แตะค้าง)', hold: true }]);
            api.caption(L.blow);
          } else { S.ember.x = S.ember.home.x; S.ember.y = S.ember.home.y; }
        }
        if (d && d.kind === 'pl' && !S.lit && S.plY > 300) S.plY = S.plY;   // stays where it is: pull up and try again
      }
      function strike() {
        S.strikes++;
        api.noise(0.06, 3500, 0.5); api.tone(2400, 0.04, 'square', 0.03); api.buzz(12);
        for (let i = 0; i < 26; i++) S.sparks.push({ x: 470 + (Math.random() - 0.5) * 30, y: 400, vx: (Math.random() - 0.3) * 520, vy: -Math.random() * 300, life: 0.4 + Math.random() * 0.5 });
        if (S.strikes === 1) api.caption(L.sparks);
        if (S.strikes >= 2 && (Math.random() < 0.4 || S.strikes >= 4)) { S.clothLit = true; setTimeout(gotEmber, 500); S.phase = 'wait'; }
      }
      function action(id, holding) {
        if (id === 'blow') { S.blowing = !!holding; return; }
        if (S.phase === 'build') {
          const want = ['small', 'med', 'large'][S.wood];
          if (id === want) {
            S.wood++; api.tone(500 + S.wood * 120, 0.15, 'triangle', 0.1);
            if (S.wood === 1) api.caption(L.smallOk);
            if (S.wood === 2) api.caption(L.medOk);
            if (S.wood === 3) {
              setPhase('burn', 4);
              api.buttons([]);
              api.sayChain([L.largeOk, L.triangle, L.out]).then(() => {});
              api.caption(L.triangle, true);
              setTimeout(() => { if (S.phase === 'burn') { api.buttons([{ id: 'water', label: '🪣 ราดน้ำ' }]); api.caption(L.out, true); } }, 2500);
            }
          } else if (['small', 'med', 'large'].indexOf(id) > S.wood) { S.smother = 1.2; api.tone(180, 0.2, 'triangle', 0.08); api.caption(L.wrongBig); }
          else api.caption(L.biggerNow);
          return;
        }
        if (S.phase !== 'burn' && id !== 'redo') return;
        if (id === 'water' && S.outStep === 0) { S.outStep = 1; douse(); api.buttons([{ id: 'stir', label: '🥢 คนให้ทั่ว' }]); api.caption(L.stir); return; }
        if (id === 'stir' && S.outStep === 1) { S.outStep = 2; S.stir = 1.2; api.noise(0.5, 300, 0.25); api.buttons([{ id: 'water', label: '🪣 ราดน้ำอีกครั้ง' }]); api.caption(L.again); return; }
        if (id === 'water' && S.outStep === 2) {
          S.outStep = 3; douse();
          api.buttons([{ id: 'redo', label: '🔄 ทำอีกครั้ง', alt: true }]);
          setPhase('done', 5);
          api.win();
          api.caption(L.done, true); api.sayChain([L.done, L.safety]);
          return;
        }
        if (id === 'redo') {
          Object.assign(S, { phase: 'make', heat: 0, ember: null, glow: 0, fire: 0, wood: 0, said: {}, inNest: false, plY: 260, lit: false, strikes: 0, clothLit: false, outStep: 0, wet: 0 });
          api.steps(0, 5); api.buttons([]); api.caption(m.intro);
        }
      }
      function douse() {
        S.wet++; S.fire = S.outStep >= 3 ? 0 : 0.25;
        api.noise(1.2, 2500, 0.35, 'highpass'); api.buzz(30);
        for (let i = 0; i < 40; i++) S.steam.push({ x: NEST.x + (Math.random() - 0.5) * 120, y: NEST.y - 20, vx: (Math.random() - 0.5) * 30, vy: -60 - Math.random() * 80, r: 10 + Math.random() * 14, a: 0.7 });
      }

      // ---------------- update ----------------
      function tick(dt, now) {
        if (S.phase === 'make' && (m.id === 'hand' || m.id === 'bow' || m.id === 'saw')) {
          const moving = S.drag && now - S.lastT < 120;
          if (!moving) S.speed = (S.speed || 0) * Math.pow(0.02, dt);
          S.heat = Math.max(0, S.heat - dt * 0.06);
          rub.set(Math.min(0.3, (S.speed || 0) / 6000));
          if (S.heat > 0.15 && !S.said.heat) { S.said.heat = 1; api.sayChain([L.heat, m.fact]); }
          if (S.heat > 0.45 && !S.said.smoke) { S.said.smoke = 1; api.caption(L.smoke); }
          if (S.heat > 0.3 && Math.random() < S.heat * dt * 30) S.smoke.push({ x: spot.x + (Math.random() - 0.5) * 16, y: spot.y, vx: (Math.random() - 0.5) * 20, vy: -30 - Math.random() * 30, r: 5, a: 0.25 + S.heat * 0.35 });
        } else rub.set(0);
        if (m.id === 'piston' && S.phase === 'make' && S.plStart && performance.now() - S.plStart.t > 1500) S.plStart = null;
        if (S.phase === 'blow') {
          if (S.blowing) S.glow = Math.min(1, S.glow + dt * 0.28); else S.glow = Math.max(0, S.glow - dt * 0.04);
          blowS.set(S.blowing ? 0.12 : 0);
          if (Math.random() < (0.3 + S.glow) * dt * 20) S.smoke.push({ x: NEST.x + (Math.random() - 0.5) * 40, y: NEST.y - 16, vx: (Math.random() - 0.5) * 20 + (S.blowing ? 25 : 0), vy: -30 - Math.random() * 40, r: 6, a: 0.3 + S.glow * 0.3 });
          if (S.glow >= 1) {
            S.blowing = false; blowS.set(0); S.fire = 0.25;
            setPhase('build', 3);
            api.noise(0.6, 600, 0.3, 'lowpass'); api.buzz([20, 20, 40]);
            api.buttons([{ id: 'small', label: '🌿 กิ่งเล็ก' }, { id: 'med', label: '🪵 ไม้กลาง' }, { id: 'large', label: '🪵 ท่อนใหญ่' }]);
            api.caption(L.flame);
          }
        } else blowS.set(0);
        if (S.phase === 'build' || S.phase === 'burn') {
          const target = [0.25, 0.45, 0.7, 1][S.wood];
          S.fire += (target - S.fire) * Math.min(1, dt * 1.5);
        }
        if (S.smother > 0) S.smother -= dt;
        if (S.stir > 0) S.stir -= dt;
        if (S.fire > 0.05 && S.outStep === 0) {
          crackle.t -= dt;
          if (crackle.t <= 0) { crackle.t = 0.05 + Math.random() * 0.4 / S.fire; api.noise(0.03, 2000 + Math.random() * 2000, 0.08 * S.fire); }
        }
        for (const s of S.smoke) { s.x += s.vx * dt; s.y += s.vy * dt; s.r += dt * 14; s.a -= dt * 0.18; }
        S.smoke = S.smoke.filter(s => s.a > 0);
        for (const s of S.steam) { s.x += s.vx * dt; s.y += s.vy * dt; s.r += dt * 20; s.a -= dt * 0.35; }
        S.steam = S.steam.filter(s => s.a > 0);
        for (const s of S.sparks) { s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 900 * dt; s.life -= dt; }
        S.sparks = S.sparks.filter(s => s.life > 0);
        if (S.flash > 0) S.flash -= dt * 2;
        S.flick = now;
      }

      // ---------------- drawing ----------------
      function emberDot(c, x, y, r, now) {
        const p = 0.75 + 0.25 * Math.sin(now / 140);
        const g = c.createRadialGradient(x, y, 0, x, y, r * 3);
        g.addColorStop(0, 'rgba(255,200,80,' + 0.9 * p + ')'); g.addColorStop(0.35, 'rgba(255,90,20,' + 0.6 * p + ')'); g.addColorStop(1, 'rgba(255,60,0,0)');
        c.fillStyle = g; c.beginPath(); c.arc(x, y, r * 3, 0, 7); c.fill();
        c.fillStyle = '#3a1a0a'; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
        c.fillStyle = `rgba(255,${120 + 80 * p | 0},40,0.95)`; c.beginPath(); c.arc(x, y, r * 0.7, 0, 7); c.fill();
      }
      function flames(c, x, y, size, now) {
        if (size <= 0.02) return;
        const H = 60 + size * 230, Wd = 30 + size * 110;
        const g = c.createRadialGradient(x, y - H * 0.2, 0, x, y - H * 0.3, H);
        g.addColorStop(0, 'rgba(255,220,120,0.5)'); g.addColorStop(1, 'rgba(255,140,40,0)');
        c.fillStyle = g; c.beginPath(); c.arc(x, y - H * 0.3, H, 0, 7); c.fill();
        for (const [col, k] of [['#ff6b1a', 1], ['#ffb02e', 0.72], ['#fff2a8', 0.42]]) {
          c.fillStyle = col; c.beginPath();
          const n = 5;
          c.moveTo(x - Wd * k / 2, y);
          for (let i = 0; i < n; i++) {
            const u = (i + 0.5) / n, fx = x - Wd * k / 2 + u * Wd * k;
            const fh = H * k * (0.55 + 0.45 * Math.sin(i * 2.1 + 1)) * (0.85 + 0.15 * Math.sin(now / 90 + i * 3));
            c.quadraticCurveTo(fx - Wd * k / n * 0.5, y - fh * 0.5, fx, y - fh);
            c.quadraticCurveTo(fx + Wd * k / n * 0.5, y - fh * 0.5, x - Wd * k / 2 + (i + 1) / n * Wd * k, y - 4);
          }
          c.closePath(); c.fill();
        }
      }
      function nest(c, now) {
        const x = NEST.x, y = NEST.y;
        c.fillStyle = '#8b5a2b'; c.beginPath(); c.ellipse(x, y + 6, 70, 18, 0, 0, 7); c.fill();       // coconut husk fibre
        c.strokeStyle = '#d9b44a'; c.lineWidth = 3;
        for (let i = 0; i < 26; i++) { const a = i / 26 * 6.283; c.beginPath(); c.moveTo(x + Math.cos(a) * 30, y + Math.sin(a) * 8 - 4); c.quadraticCurveTo(x + Math.cos(a + 0.6) * 66, y - 22 + Math.sin(a) * 10, x + Math.cos(a + 1.1) * 52, y + Math.sin(a + 1) * 12); c.stroke(); }
        c.fillStyle = '#5a3a1a'; c.font = '600 20px Mitr'; c.textAlign = 'center';
        if (S.phase === 'make' || S.phase === 'move' || S.phase === 'wait') c.fillText('รังเชื้อไฟ', x, y + 52);
        if (S.phase === 'move') { c.strokeStyle = 'rgba(255,107,157,' + (0.5 + 0.5 * Math.sin(now / 200)) + ')'; c.lineWidth = 5; c.setLineDash([12, 10]); c.beginPath(); c.ellipse(x, y - 4, 96, 40, 0, 0, 7); c.stroke(); c.setLineDash([]); }
      }
      function woodPile(c) {
        const x = NEST.x, y = NEST.y + 8;
        c.lineCap = 'round';
        if (S.wood >= 1) { c.strokeStyle = '#7a5230'; c.lineWidth = 6; for (const a of [-0.5, -0.2, 0.2, 0.5]) { c.beginPath(); c.moveTo(x + Math.sin(a) * 70, y); c.lineTo(x + Math.sin(a) * 10, y - 70); c.stroke(); } }
        if (S.wood >= 2) { c.strokeStyle = '#6b4423'; c.lineWidth = 14; for (const a of [-0.7, 0.7, -0.35, 0.35]) { c.beginPath(); c.moveTo(x + Math.sin(a) * 120, y + 4); c.lineTo(x + Math.sin(a) * 18, y - 110); c.stroke(); } }
        if (S.wood >= 3) { c.strokeStyle = '#5a3a1e'; c.lineWidth = 26; for (const a of [-0.9, 0.9]) { c.beginPath(); c.moveTo(x + Math.sin(a) * 170, y + 8); c.lineTo(x + Math.sin(a) * 30, y - 150); c.stroke(); } }
      }
      function tools(c, now) {
        const sx = spot.x;
        if (m.id === 'hand' || m.id === 'bow') {
          // fireboard with a notch; spindle standing in the notch
          c.fillStyle = '#c8955a'; c.strokeStyle = '#6b4423'; c.lineWidth = 3;
          c.beginPath(); c.roundRect(250, GY - 30, 300, 26, 6); c.fill(); c.stroke();
          c.fillStyle = '#3a2412'; c.beginPath(); c.moveTo(sx - 10, GY - 30); c.lineTo(sx + 10, GY - 30); c.lineTo(sx, GY - 6); c.fill();
          const top = m.id === 'hand' ? 200 : 300;
          c.fillStyle = '#d9a86c'; c.fillRect(sx - 9, top, 18, GY - 30 - top);
          c.strokeStyle = '#8a5a2b'; c.lineWidth = 3;
          for (let k = 0; k < 8; k++) { const yy = top + ((k * 40 + S.spin * 10) % (GY - 30 - top)); c.beginPath(); c.moveTo(sx - 9, yy); c.lineTo(sx + 9, yy + 8); c.stroke(); }
          if (m.id === 'hand') {
            // two hands rubbing the spindle back and forth
            const o = Math.sin(S.spin * 0.6) * 10;
            for (const s of [-1, 1]) {
              c.fillStyle = '#f2c09b'; c.strokeStyle = '#b07d58'; c.lineWidth = 3;
              c.beginPath(); c.roundRect(sx + s * 12 - (s < 0 ? 46 : 0) + o * s, 280 + (s < 0 ? 0 : 20), 46, 90, 18); c.fill(); c.stroke();
            }
          } else {
            // socket on top, bow string wrapped round the spindle
            c.fillStyle = '#8a8a8a'; c.beginPath(); c.roundRect(sx - 40, 280, 80, 22, 8); c.fill();
            const bx = sx + S.rubX;
            c.strokeStyle = '#7a5230'; c.lineWidth = 9; c.beginPath(); c.moveTo(bx - 200, 420); c.quadraticCurveTo(bx, 360, bx + 200, 420); c.stroke();
            c.strokeStyle = '#e8e0cc'; c.lineWidth = 3; c.beginPath(); c.moveTo(bx - 196, 420); c.lineTo(sx - 9, 405); c.lineTo(sx + 9, 410); c.lineTo(bx + 196, 420); c.stroke();
          }
        } else if (m.id === 'saw') {
          // split bamboo on the ground, a bamboo blade sawing across it
          c.fillStyle = '#9cc46a'; c.strokeStyle = '#5c7f33'; c.lineWidth = 3;
          c.beginPath(); c.roundRect(200, GY - 46, 420, 40, 20); c.fill(); c.stroke();
          c.strokeStyle = '#5c7f33'; for (const k of [300, 520]) { c.beginPath(); c.moveTo(k, GY - 46); c.lineTo(k, GY - 6); c.stroke(); }
          c.fillStyle = '#3a2412'; c.fillRect(sx - 14, GY - 50, 28, 10);
          const bx = sx + S.rubX;
          c.save(); c.translate(bx, GY - 60); c.rotate(-0.08);
          c.fillStyle = '#b8d98a'; c.strokeStyle = '#5c7f33'; c.beginPath(); c.roundRect(-150, -18, 300, 22, 10); c.fill(); c.stroke();
          c.restore();
        } else if (m.id === 'piston') {
          // cut-away view: a closed tube, plunger with tinder in its tip
          c.fillStyle = '#c9a26b'; c.fillRect(380, GY - 70, 100, 70);
          c.fillStyle = 'rgba(255,255,255,0.35)'; c.strokeStyle = '#6b4423'; c.lineWidth = 6;
          c.beginPath(); c.roundRect(400, 250, 60, 270, 10); c.fill(); c.stroke();
          const hot = S.flash > 0 ? S.flash : 0;
          if (hot > 0) { c.fillStyle = `rgba(255,120,30,${hot * 0.8})`; c.fillRect(404, S.plY, 52, 516 - S.plY); }
          c.fillStyle = '#8a5a2b'; c.fillRect(424, S.plY - 160, 12, 160);
          c.fillStyle = '#6b4423'; c.beginPath(); c.roundRect(370, S.plY - 190, 120, 34, 14); c.fill();
          c.fillStyle = '#4a3020'; c.fillRect(406, S.plY - 4, 48, 14);
          if (S.lit) emberDot(c, 430, S.plY + 14, 7, now);
          else { c.fillStyle = '#d9c9a0'; c.beginPath(); c.arc(430, S.plY + 14, 6, 0, 7); c.fill(); }
          if (!S.lit && S.plY < 300) { c.fillStyle = '#e54b82'; c.font = '700 40px Mitr'; c.textAlign = 'center'; c.fillText('⬇', 540, 330 + Math.sin(now / 180) * 10); }
          if (S.lit) { c.fillStyle = '#e54b82'; c.font = '700 40px Mitr'; c.textAlign = 'center'; c.fillText('⬆', 540, 330 - Math.sin(now / 180) * 10); }
        } else if (m.id === 'flint') {
          // flint on a stump with char cloth on top; the steel striker follows the finger
          c.fillStyle = '#8a5a2b'; c.beginPath(); c.roundRect(390, 430, 160, GY - 430, 10); c.fill();
          c.fillStyle = '#7d8590'; c.strokeStyle = '#4a5058'; c.lineWidth = 3;
          c.beginPath(); c.moveTo(400, 432); c.lineTo(430, 395); c.lineTo(500, 388); c.lineTo(540, 432); c.closePath(); c.fill(); c.stroke();
          c.fillStyle = '#1f1f1f'; c.fillRect(436, 392, 34, 12);
          if (S.clothLit && !S.ember) emberDot(c, 452, 398, 7, now);
          const st = S.steel;
          c.strokeStyle = '#6d747c'; c.lineWidth = 12; c.lineCap = 'round';
          c.beginPath(); c.moveTo(st.x - 60, st.y); c.quadraticCurveTo(st.x - 70, st.y - 40, st.x - 30, st.y - 44); c.lineTo(st.x + 30, st.y - 44); c.quadraticCurveTo(st.x + 70, st.y - 40, st.x + 60, st.y); c.stroke();
          c.strokeStyle = '#aab2bb'; c.lineWidth = 6; c.beginPath(); c.moveTo(st.x - 60, st.y); c.lineTo(st.x + 60, st.y); c.stroke();
          if (S.phase === 'make' && S.strikes === 0) { c.fillStyle = '#e54b82'; c.font = '700 40px Mitr'; c.textAlign = 'center'; c.fillText('⬇', 640, 330 + Math.sin(now / 180) * 10); }
        }
        // heat bar for friction methods
        if ((m.id === 'hand' || m.id === 'bow' || m.id === 'saw') && S.phase === 'make') {
          c.fillStyle = 'rgba(255,255,255,0.85)'; c.beginPath(); c.roundRect(200, 120, 40, 220, 20); c.fill();
          const h = 212 * S.heat, g = c.createLinearGradient(0, 336, 0, 124);
          g.addColorStop(0, '#ffd93d'); g.addColorStop(1, '#ff4d1a');
          c.fillStyle = g; c.beginPath(); c.roundRect(204, 336 - h, 32, h, 16); c.fill();
          c.font = '30px sans-serif'; c.textAlign = 'center'; c.fillText('🌡️', 220, 110);
          if (S.heat < 0.05) { c.fillStyle = '#e54b82'; c.font = '700 44px Mitr'; c.fillText('⬅ ➡', sx, 170 + Math.sin(now / 200) * 6); }
        }
      }
      function draw(c, now) {
        // sky + ground
        const sky = c.createLinearGradient(0, 0, 0, GY);
        sky.addColorStop(0, '#b5e8ff'); sky.addColorStop(1, '#e8f6d8');
        c.fillStyle = sky; c.fillRect(-500, -300, 2000, GY + 300);
        c.fillStyle = '#8fce5a'; c.fillRect(-500, GY, 2000, 600);
        c.fillStyle = '#7ab94a'; c.fillRect(-500, GY, 2000, 10);
        nest(c, now);
        woodPile(c);
        if (S.stir > 0) { c.strokeStyle = '#7a5230'; c.lineWidth = 8; const a = now / 120; c.beginPath(); c.moveTo(NEST.x + Math.cos(a) * 40, NEST.y + Math.sin(a) * 10); c.lineTo(NEST.x + 120, NEST.y - 140); c.stroke(); }
        if (S.wet) { c.fillStyle = 'rgba(80,120,170,0.35)'; c.beginPath(); c.ellipse(NEST.x, NEST.y + 12, 150, 22, 0, 0, 7); c.fill(); }
        if (S.inNest && S.phase === 'blow') emberDot(c, NEST.x, NEST.y - 8, 6 + S.glow * 10, now);
        const f = S.fire * (S.smother > 0 ? 0.6 : 1);
        if (f > 0) flames(c, NEST.x, NEST.y + 4, f, now);
        tools(c, now);
        for (const s of S.smoke) { c.fillStyle = `rgba(120,120,120,${Math.max(0, s.a)})`; c.beginPath(); c.arc(s.x, s.y, s.r, 0, 7); c.fill(); }
        for (const s of S.steam) { c.fillStyle = `rgba(240,245,250,${Math.max(0, s.a)})`; c.beginPath(); c.arc(s.x, s.y, s.r, 0, 7); c.fill(); }
        for (const s of S.sparks) { c.fillStyle = `rgba(255,${180 + Math.random() * 70 | 0},60,${Math.min(1, s.life * 2)})`; c.fillRect(s.x, s.y, 4, 4); }
        if (S.ember && S.phase === 'move') emberDot(c, S.ember.x, S.ember.y, 9, now);
        if (S.phase === 'move' && !S.drag) { c.fillStyle = '#e54b82'; c.font = '700 40px Mitr'; c.textAlign = 'center'; c.fillText('➜', (S.ember.x + NEST.x) / 2, Math.min(S.ember.y, NEST.y) - 40 + Math.sin(now / 200) * 6); }
        if (S.phase === 'blow') {
          c.fillStyle = 'rgba(255,255,255,0.85)'; c.beginPath(); c.roundRect(NEST.x - 100, NEST.y - 150, 200, 22, 11); c.fill();
          c.fillStyle = '#ff7a1a'; c.beginPath(); c.roundRect(NEST.x - 97, NEST.y - 147, 194 * S.glow, 16, 8); c.fill();
          if (S.blowing) { c.strokeStyle = 'rgba(160,200,255,0.8)'; c.lineWidth = 4; for (let k = 0; k < 3; k++) { const o = (now / 6 + k * 40) % 120; c.beginPath(); c.moveTo(NEST.x - 230 + o, NEST.y - 60 + k * 14); c.lineTo(NEST.x - 190 + o, NEST.y - 52 + k * 14); c.stroke(); } }
        }
      }
      return {
        bg: '#cfeeff', focus: [185, 945], tick, draw, down, move, up, action,
        destroy() { rub.stop(); blowS.stop(); },
      };
    },
  });
})();
