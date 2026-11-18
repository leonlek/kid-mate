/* ทำไมนะ? — 💡 หลอดไฟติดได้ยังไง
   1) a torch circuit: AA battery (1.5 V) → wire → bulb → wire → switch → back to the battery.
      Electricity only flows round a closed loop; the switch opens/closes the loop.
   2) inside an incandescent bulb: a very thin tungsten filament gets so hot (~2,500 °C) that it
      glows; the glass has no air in it (vacuum or an inert gas) so the hot filament can't burn.
      Only a small part of the electricity becomes light (well under 10 %), the rest is heat.
      Edison's long-lasting carbon-filament bulb: 1879. An LED gives the same light with several
      times less electricity and far less heat.
   3) which things let electricity through: metals do (spoon, key, paper clip); dry wood, wax
      crayon and a rubber balloon don't. A wire is copper inside, plastic outside. */
(function () {
  const L = {
    warn: 'ถ่านไฟฉายเล่นได้ แต่ไฟฟ้าจากปลั๊กที่บ้านแรงมาก อันตรายถึงชีวิต ห้ามแหย่ปลั๊กไฟนะ',
    a0: 'ลากปลายสายไฟสีแดง ไปต่อที่หลอดไฟ',
    a1: 'ดีมาก ต่อสายไฟสีน้ำเงินไปที่สวิตช์',
    a2: 'กดสวิตช์ให้ต่อกัน',
    a3: 'ไฟติดแล้ว! ไฟฟ้าไหลออกจากถ่าน ผ่านสายไฟ ผ่านหลอดไฟ แล้ววนกลับเข้าถ่าน เป็นวงไม่ขาดเลย เรียกว่าวงจรปิด',
    a4: 'ลองกดสวิตช์อีกทีสิ',
    a5: 'สวิตช์แยกออก ทางเดินของไฟฟ้าขาด ไฟฟ้าไหลไม่ได้ หลอดไฟจึงดับ สวิตช์ไฟที่บ้านก็ทำงานแบบนี้',
    a6: 'ถ่านไฟฉายก้อนนี้มีไฟฟ้าแค่หนึ่งจุดห้าโวลต์ จึงปลอดภัย',
    b0: 'แตะค้างที่ปุ่มฟ้าผ่า ส่งไฟฟ้าเข้าไปในหลอดไฟ',
    b1: 'ไส้หลอดร้อนขึ้น เริ่มเป็นสีแดง',
    b2: 'ร้อนขึ้นอีก เป็นสีส้ม',
    b3: 'ร้อนราวสองพันห้าร้อยองศา จนสว่างจ้า ไส้หลอดเป็นลวดทังสเตนเส้นเล็กมาก ไฟฟ้าผ่านได้ยาก เลยร้อนจนเปล่งแสงออกมา',
    b4: 'ในหลอดแก้วไม่มีอากาศ ถ้ามีอากาศ ไส้หลอดที่ร้อนขนาดนี้จะไหม้ขาดทันที',
    b5: 'โทมัส เอดิสัน ทำหลอดไฟที่ใช้ได้นานสำเร็จ เมื่อปีหนึ่งพันแปดร้อยเจ็ดสิบเก้า',
    b6: 'แตะปุ่มเปลี่ยนเป็นหลอดแอลอีดี',
    b7: 'หลอดไส้เปลี่ยนไฟฟ้าเป็นแสงได้นิดเดียว ที่เหลือกลายเป็นความร้อน หลอดแอลอีดีสว่างเท่ากัน แต่ใช้ไฟฟ้าน้อยกว่าหลายเท่า และร้อนน้อยกว่ามาก',
    b8: 'หลอดไฟที่เปิดอยู่ร้อนมาก อย่าจับนะ',
    c0: 'ลากของไปวางตรงช่องว่าง ดูซิว่าหลอดไฟติดไหม',
    cdone: 'โลหะนำไฟฟ้า ส่วนไม้ ยาง ขี้ผึ้ง ไม่นำไฟฟ้า สายไฟจึงมีลวดทองแดงอยู่ข้างใน แล้วหุ้มด้วยพลาสติก จับแล้วไม่โดนไฟ',
    win: 'เก่งมาก!',
  };
  const THINGS = [
    { id: 'spoon', em: '🥄', ok: true, say: 'ช้อนทำจากโลหะ ไฟฟ้าไหลผ่านได้ หลอดไฟติด' },
    { id: 'key', em: '🔑', ok: true, say: 'กุญแจทำจากโลหะ ไฟฟ้าไหลผ่านได้ หลอดไฟติด' },
    { id: 'clip', em: '📎', ok: true, say: 'คลิปหนีบกระดาษทำจากโลหะ ไฟฟ้าไหลผ่านได้ หลอดไฟติด' },
    { id: 'wood', em: '🪵', ok: false, say: 'ไม้แห้ง ไฟฟ้าไหลผ่านไม่ได้ หลอดไฟไม่ติด' },
    { id: 'crayon', em: '🖍️', ok: false, say: 'สีเทียนทำจากขี้ผึ้ง ไฟฟ้าไหลผ่านไม่ได้ หลอดไฟไม่ติด' },
    { id: 'balloon', em: '🎈', ok: false, say: 'ลูกโป่งทำจากยาง ไฟฟ้าไหลผ่านไม่ได้ หลอดไฟไม่ติด' },
  ];
  const near = (p, q, r) => Math.hypot(p.x - q.x, p.y - q.y) < r;

  // ---------------- shared drawing ----------------
  function battery(c, x, y) {               // AA cell standing up, + on top; (x, y) = top terminal
    c.fillStyle = '#c9ced6'; c.fillRect(x - 16, y, 32, 16);
    c.fillStyle = '#2d3436'; c.beginPath(); c.roundRect(x - 52, y + 14, 104, 220, 14); c.fill();
    c.fillStyle = '#e1552a'; c.beginPath(); c.roundRect(x - 52, y + 14, 104, 70, [14, 14, 0, 0]); c.fill();
    c.fillStyle = '#c9ced6'; c.fillRect(x - 50, y + 232, 100, 10);
    c.fillStyle = '#fff'; c.font = '700 40px Mitr'; c.textAlign = 'center';
    c.fillText('+', x, y + 64); c.font = '700 26px Mitr'; c.fillText('1.5V', x, y + 150); c.fillText('−', x, y + 222);
  }
  function smallBulb(c, x, y, on, now) {    // torch bulb on a holder; terminals at (x∓40, y+110)
    if (on) {
      const g = c.createRadialGradient(x, y, 10, x, y, 190);
      g.addColorStop(0, 'rgba(255,240,150,0.85)'); g.addColorStop(1, 'rgba(255,240,150,0)');
      c.fillStyle = g; c.beginPath(); c.arc(x, y, 190, 0, 7); c.fill();
    }
    c.fillStyle = on ? '#fff6b0' : 'rgba(230,245,255,0.8)'; c.strokeStyle = '#7fa8c9'; c.lineWidth = 5;
    c.beginPath(); c.arc(x, y, 62, 0, 7); c.fill(); c.stroke();
    c.strokeStyle = on ? '#ffb703' : '#6b6b6b'; c.lineWidth = on ? 6 : 4;
    c.beginPath(); c.moveTo(x - 18, y + 50); c.lineTo(x - 18, y); for (let k = 0; k <= 6; k++) c.lineTo(x - 18 + k * 6, y + (k % 2 ? -10 : 0)); c.lineTo(x + 18, y + 50); c.stroke();
    c.fillStyle = '#b8bec7'; c.fillRect(x - 32, y + 55, 64, 40);
    c.fillStyle = '#8a5a2b'; c.fillRect(x - 70, y + 95, 140, 26);
    c.fillStyle = '#c9ced6'; for (const dx of [-40, 40]) { c.beginPath(); c.arc(x + dx, y + 108, 9, 0, 7); c.fill(); }
  }
  function wire(c, a, b, col, lift) {
    c.strokeStyle = col; c.lineWidth = 12; c.lineCap = 'round';
    c.beginPath(); c.moveTo(a.x, a.y); c.quadraticCurveTo((a.x + b.x) / 2, Math.min(a.y, b.y) - lift, b.x, b.y); c.stroke();
    c.fillStyle = '#c87533'; c.beginPath(); c.arc(b.x, b.y, 9, 0, 7); c.fill();   // bare copper end
  }
  const bez = (a, b, lift, t) => { const cx = (a.x + b.x) / 2, cy = Math.min(a.y, b.y) - lift, u = 1 - t; return { x: u * u * a.x + 2 * u * t * cx + t * t * b.x, y: u * u * a.y + 2 * u * t * cy + t * t * b.y }; };
  function pathOf(segs) {                   // [[a, b, lift] | [a, b]] → evenly spaced points for the flow dots
    const pts = [];
    for (const [a, b, lift] of segs) for (let k = 0; k < 24; k++) pts.push(lift == null ? { x: a.x + (b.x - a.x) * k / 24, y: a.y + (b.y - a.y) * k / 24 } : bez(a, b, lift, k / 24));
    const out = [pts[0]]; let acc = 0;
    for (let i = 1; i < pts.length; i++) { acc += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); out.push({ ...pts[i], s: acc }); }
    out[0].s = 0; out.total = acc; return out;
  }
  function flow(c, path, now) {
    c.fillStyle = '#ffd93d';
    for (let d = (now / 6) % 40; d < path.total; d += 40) {
      let i = 1; while (i < path.length - 1 && path[i].s < d) i++;
      c.beginPath(); c.arc(path[i].x, path[i].y, 6, 0, 7); c.fill();
    }
  }
  function bench(c) {
    c.fillStyle = '#fdf1dc'; c.fillRect(-1000, -1500, 3000, 3200);
    c.fillStyle = '#e2c79b'; c.fillRect(-1000, 600, 3000, 1200);
  }

  // =====================================================================
  // 1) THE CIRCUIT
  // =====================================================================
  function circuit(api) {
    const TP = { x: 200, y: 200 }, TN = { x: 200, y: 446 };   // battery terminals
    const BX = 500, BY = 150, BL = { x: 460, y: 258 }, BR = { x: 540, y: 258 };
    const SL = { x: 420, y: 520 }, SR = { x: 600, y: 520 };
    const S = { step: 0, a: { x: 300, y: 380 }, b: { x: 800, y: 330 }, aOk: false, bOk: false, closed: false, drag: null, toggles: 0 };
    api.steps(0, 4); api.buttons([]); api.caption(L.a0);
    let path = null;
    const on = () => S.aOk && S.bOk && S.closed;
    function down(p) {
      if (!S.aOk && near(p, S.a, 70)) S.drag = 'a';
      else if (S.aOk && !S.bOk && near(p, S.b, 70)) S.drag = 'b';
      else if (S.aOk && S.bOk && p.x > 380 && p.x < 640 && p.y > 440 && p.y < 580) {
        S.closed = !S.closed; api.tone(S.closed ? 520 : 380, 0.08, 'square', 0.08); api.buzz(12);
        if (on() && !path) path = pathOf([[TP, BL, 120], [BL, BR], [BR, SR, -60], [SR, SL], [SL, TN, -40], [TN, TP]]);
        if (S.step === 2 && S.closed) { S.step = 3; api.steps(3, 4); api.caption(L.a3, true); api.sayChain([L.a3, L.a4]); setTimeout(() => { if (S.step === 3) api.caption(L.a4, true); }, 9000); }
        else if (S.step === 3 && !S.closed) {
          S.step = 4; api.steps(4, 4); api.caption(L.a5, true); api.sayChain([L.a5, L.a6, L.win]); api.win();
          api.buttons([{ id: 'redo', label: '🔄 ทำอีกครั้ง', alt: true }]);
        }
      }
    }
    function move(p) {
      if (S.drag === 'a') { S.a = { x: p.x, y: p.y }; if (near(S.a, BL, 50)) { S.a = { ...BL }; S.aOk = true; S.drag = null; S.step = 1; api.steps(1, 4); api.tone(880, 0.1, 'triangle', 0.1); api.caption(L.a1); } }
      if (S.drag === 'b') { S.b = { x: p.x, y: p.y }; if (near(S.b, SR, 50)) { S.b = { ...SR }; S.bOk = true; S.drag = null; S.step = 2; api.steps(2, 4); api.tone(990, 0.1, 'triangle', 0.1); api.caption(L.a2); } }
    }
    function up() { S.drag = null; }
    function draw(c, now) {
      bench(c);
      battery(c, TP.x, TP.y - 16);
      smallBulb(c, BX, BY, on(), now);
      // switch: two posts and a lever
      c.fillStyle = '#8a5a2b'; c.fillRect(SL.x - 30, SL.y + 6, SR.x - SL.x + 60, 30);
      c.fillStyle = '#c9ced6'; for (const q of [SL, SR]) { c.beginPath(); c.arc(q.x, q.y, 11, 0, 7); c.fill(); }
      const ang = S.closed ? 0 : -0.55;
      c.strokeStyle = '#9aa7b3'; c.lineWidth = 12; c.lineCap = 'round';
      c.beginPath(); c.moveTo(SL.x, SL.y); c.lineTo(SL.x + Math.cos(ang) * (SR.x - SL.x), SL.y + Math.sin(ang) * (SR.x - SL.x)); c.stroke();
      c.fillStyle = '#e54b82'; c.beginPath(); c.arc(SL.x + Math.cos(ang) * 150, SL.y + Math.sin(ang) * 150, 16, 0, 7); c.fill();
      c.fillStyle = '#2d3436'; c.font = '600 22px Mitr'; c.textAlign = 'center'; c.fillText('สวิตช์', (SL.x + SR.x) / 2, SL.y + 70);
      // wires: black one already joins the switch to the battery's − end
      wire(c, SL, TN, '#2d3436', -40);
      wire(c, TP, S.a, '#e1552a', 120);
      wire(c, BR, S.b, '#2e86de', -60);
      // targets
      const pulse = 0.5 + 0.5 * Math.sin(now / 200);
      c.strokeStyle = `rgba(255,107,157,${pulse})`; c.lineWidth = 5;
      if (!S.aOk) { c.beginPath(); c.arc(BL.x, BL.y, 30, 0, 7); c.stroke(); c.beginPath(); c.arc(S.a.x, S.a.y, 34, 0, 7); c.stroke(); }
      else if (!S.bOk) { c.beginPath(); c.arc(SR.x, SR.y, 30, 0, 7); c.stroke(); c.beginPath(); c.arc(S.b.x, S.b.y, 34, 0, 7); c.stroke(); }
      else if (S.step === 2 || S.step === 3) { c.beginPath(); c.arc(SL.x + Math.cos(ang) * 150, SL.y + Math.sin(ang) * 150, 30, 0, 7); c.stroke(); }
      if (on() && path) flow(c, path, now);
    }
    const scene = { bg: '#fdf1dc', focus: [120, 880], draw, down, move, up };
    scene.action = (id) => { if (id === 'redo') Object.assign(scene, circuit(api)); };
    return scene;
  }

  // =====================================================================
  // 2) INSIDE THE BULB
  // =====================================================================
  function inside(api) {
    const S = { I: 0, hold: false, said: {}, led: false, step: 0, done: false };
    api.steps(0, 3); api.caption(L.b0);
    api.buttons([{ id: 'zap', label: '⚡ ส่งไฟฟ้า (แตะค้าง)', hold: true }]);
    let hum = null;
    function action(id, holding) {
      if (id === 'zap') {
        S.hold = !!holding;
        if (holding && !hum) hum = api.noiseLoop(120, 'bandpass', 4);
        if (!holding && hum) { hum.stop(); hum = null; }
        return;
      }
      if (id === 'led' && !S.led) {
        S.led = true; S.step = 3; api.steps(3, 3); api.caption(L.b7, true); api.sayChain([L.b7, L.b8, L.win]); api.win();
        api.buttons([{ id: 'zap', label: '⚡ ส่งไฟฟ้า (แตะค้าง)', hold: true }, { id: 'old', label: '💡 หลอดไส้', alt: true }]);
      }
      if (id === 'old') { S.led = false; api.buttons([{ id: 'zap', label: '⚡ ส่งไฟฟ้า (แตะค้าง)', hold: true }, { id: 'led', label: '🔆 หลอดแอลอีดี', alt: true }]); S.led = false; }
    }
    const temp = () => Math.round(25 + S.I * 2475);
    function tick(dt) {
      S.I = S.hold ? Math.min(1, S.I + dt * 0.35) : Math.max(0, S.I - dt * 0.8);
      if (hum) hum.set(0.04 + S.I * 0.06, 100 + S.I * 80);
      if (S.led) return;
      const T = temp();
      if (T > 700 && !S.said.red) { S.said.red = 1; api.caption(L.b1); }
      if (T > 1500 && !S.said.or) { S.said.or = 1; api.caption(L.b2); }
      if (T >= 2450 && !S.said.hot) {
        S.said.hot = 1; S.step = 1; api.steps(1, 3); api.caption(L.b3, true); api.sayChain([L.b3, L.b4, L.b5]);
        setTimeout(() => { if (S.step === 1) { S.step = 2; api.steps(2, 3); api.caption(L.b6, true); api.say(L.b6); api.buttons([{ id: 'zap', label: '⚡ ส่งไฟฟ้า (แตะค้าง)', hold: true }, { id: 'led', label: '🔆 หลอดแอลอีดี' }]); } }, 24000);
      }
    }
    function glowCol(T) {
      if (T < 600) return null;
      if (T < 1100) return [190, 30, 20];
      if (T < 1700) return [255, 110, 20];
      if (T < 2200) return [255, 190, 60];
      return [255, 245, 200];
    }
    function draw(c, now) {
      c.fillStyle = '#26303d'; c.fillRect(-1000, -1500, 3000, 3200);
      const X = 500, Y = 280, R = 190, I = S.I;
      if (I > 0.05) {
        const g = c.createRadialGradient(X, Y, 20, X, Y, 480);
        g.addColorStop(0, `rgba(255,236,170,${S.led ? I * 0.8 : Math.max(0, I - 0.3) * 1.1})`); g.addColorStop(1, 'rgba(255,236,170,0)');
        c.fillStyle = g; c.fillRect(0, -200, 1000, 1000);
      }
      // glass
      c.fillStyle = 'rgba(220,240,255,0.18)'; c.strokeStyle = 'rgba(200,225,245,0.9)'; c.lineWidth = 6;
      c.beginPath(); c.arc(X, Y, R, Math.PI * 0.72, Math.PI * 2.28); c.lineTo(X + 80, Y + R + 60); c.lineTo(X - 80, Y + R + 60); c.closePath(); c.fill(); c.stroke();
      // screw base
      c.fillStyle = '#b8bec7'; for (let k = 0; k < 4; k++) { c.beginPath(); c.roundRect(X - 82, Y + R + 60 + k * 26, 164, 24, 10); c.fill(); }
      c.fillStyle = '#2d3436'; c.beginPath(); c.arc(X, Y + R + 172, 22, 0, Math.PI); c.fill();
      if (S.led) {
        // LED bulb: a plate of small chips
        c.fillStyle = '#f1f2f6'; c.beginPath(); c.roundRect(X - 90, Y + 40, 180, 40, 10); c.fill();
        for (let k = 0; k < 6; k++) {
          const x = X - 75 + k * 30;
          c.fillStyle = I > 0.05 ? `rgba(255,250,${200 + 55 * I | 0},1)` : '#ffe9a8'; c.fillRect(x - 10, Y + 48, 20, 20);
          if (I > 0.05) { c.fillStyle = `rgba(255,255,230,${I * 0.6})`; c.beginPath(); c.arc(x, Y + 58, 26, 0, 7); c.fill(); }
        }
      } else {
        // support wires + coiled tungsten filament
        c.strokeStyle = '#9aa7b3'; c.lineWidth = 5;
        c.beginPath(); c.moveTo(X - 40, Y + R + 50); c.lineTo(X - 70, Y - 10); c.moveTo(X + 40, Y + R + 50); c.lineTo(X + 70, Y - 10); c.stroke();
        const col = glowCol(temp());
        if (col) { c.shadowColor = `rgb(${col})`; c.shadowBlur = 30 + I * 40; }
        c.strokeStyle = col ? `rgb(${col})` : '#555'; c.lineWidth = 4;
        c.beginPath(); c.moveTo(X - 70, Y - 10);
        for (let x = -70; x <= 70; x += 2) c.lineTo(X + x, Y - 10 + Math.sin(x * 0.55) * 12);
        c.stroke(); c.shadowBlur = 0;
        c.fillStyle = 'rgba(255,255,255,0.75)'; c.font = '600 20px Mitr'; c.textAlign = 'left';
        c.fillText('← ไส้หลอด (ลวดทังสเตน)', X + 90, Y - 60);
        c.fillText('ไม่มีอากาศข้างใน', X + 60, Y + 90);
      }
      // thermometer + "light vs heat" bar
      const T = S.led ? Math.round(25 + I * 35) : temp();
      c.fillStyle = 'rgba(255,255,255,0.92)'; c.beginPath(); c.roundRect(40, 40, 260, 64, 24); c.fill();
      c.fillStyle = T > 1000 ? '#e1552a' : '#2d3436'; c.font = '700 30px Mitr'; c.textAlign = 'center';
      c.fillText('🌡️ ' + T.toLocaleString('en-US') + ' °C', 170, 84);
      if (I > 0.3 && (S.led || temp() > 2000)) {
        const light = S.led ? 0.45 : 0.06;   // share of the electricity that leaves as light (rough, for the bar)
        c.fillStyle = 'rgba(255,255,255,0.92)'; c.beginPath(); c.roundRect(700, 40, 260, 100, 22); c.fill();
        c.fillStyle = '#2d3436'; c.font = '600 18px Mitr'; c.textAlign = 'left'; c.fillText('ไฟฟ้าที่ใช้ กลายเป็น…', 716, 68);
        c.fillStyle = '#ffd93d'; c.fillRect(716, 84, 228 * light, 30);
        c.fillStyle = '#e1552a'; c.fillRect(716 + 228 * light, 84, 228 * (1 - light), 30);
        c.fillStyle = '#2d3436'; c.font = '600 16px Mitr'; c.fillText('💡 แสง', 716, 132); c.textAlign = 'right'; c.fillText('ความร้อน 🔥', 944, 132);
      }
      c.fillStyle = 'rgba(255,255,255,0.85)'; c.font = '700 26px Mitr'; c.textAlign = 'center';
      c.fillText(S.led ? '🔆 หลอดแอลอีดี' : '💡 หลอดไส้', X, 40);
    }
    return { bg: '#26303d', focus: [60, 940], tick, draw, action, destroy() { if (hum) hum.stop(); } };
  }

  // =====================================================================
  // 3) WHAT LETS ELECTRICITY THROUGH?
  // =====================================================================
  function conduct(api) {
    const TP = { x: 200, y: 110 }, TN = { x: 200, y: 356 };
    const BX = 500, BY = 80, BL = { x: 460, y: 188 }, BR = { x: 540, y: 188 };
    const GL = { x: 420, y: 400 }, GR = { x: 580, y: 400 }, GAP = { x: 500, y: 400 };
    const tray = THINGS.map((t, i) => ({ ...t, hx: 170 + i * 132, hy: 545, x: 170 + i * 132, y: 545, tested: null }));
    const S = { in: null, drag: null, tested: 0, done: false };
    let path = null;
    api.steps(0, THINGS.length); api.buttons([]); api.caption(L.c0);
    const lit = () => S.in && S.in.ok;
    function down(p) {
      for (const t of tray) if (near(p, t, 56)) { S.drag = t; if (S.in === t) S.in = null; return; }
    }
    function move(p) { if (S.drag) { S.drag.x = p.x; S.drag.y = p.y; } }
    function up() {
      const t = S.drag; S.drag = null; if (!t) return;
      if (near(t, GAP, 110)) {
        if (S.in && S.in !== t) { S.in.x = S.in.hx; S.in.y = S.in.hy; }
        S.in = t; t.x = GAP.x; t.y = GAP.y - 6;
        if (t.ok && !path) path = pathOf([[TP, BL, 100], [BL, BR], [BR, GR, -40], [GR, GL], [GL, TN, -30], [TN, TP]]);
        api.tone(t.ok ? 880 : 220, 0.15, t.ok ? 'triangle' : 'sine', 0.12); api.buzz(t.ok ? 20 : 8);
        if (t.tested === null) { t.tested = t.ok; S.tested++; api.steps(S.tested, THINGS.length); }
        api.caption(t.say);
        if (S.tested === THINGS.length && !S.done) {
          S.done = true;
          setTimeout(() => { api.caption(L.cdone, true); api.sayChain([L.cdone, L.win]); api.win(); }, 4500);
        }
      } else { t.x = t.hx; t.y = t.hy; }
    }
    function draw(c, now) {
      bench(c);
      battery(c, TP.x, TP.y - 16);
      smallBulb(c, BX, BY, lit(), now);
      wire(c, TP, BL, '#e1552a', 100);
      wire(c, BR, GR, '#2e86de', -40);
      wire(c, GL, TN, '#2d3436', -30);
      // crocodile clips either side of the gap
      c.fillStyle = '#9aa7b3';
      for (const [q, s] of [[GL, 1], [GR, -1]]) { c.beginPath(); c.moveTo(q.x, q.y - 14); c.lineTo(q.x + s * 46, q.y - 4); c.lineTo(q.x + s * 46, q.y + 4); c.lineTo(q.x, q.y + 14); c.fill(); }
      if (!S.in) {
        c.strokeStyle = `rgba(255,107,157,${0.5 + 0.5 * Math.sin(now / 200)})`; c.lineWidth = 4; c.setLineDash([10, 8]);
        c.beginPath(); c.roundRect(GAP.x - 50, GAP.y - 50, 100, 100, 18); c.stroke(); c.setLineDash([]);
        c.fillStyle = '#2d3436'; c.font = '600 20px Mitr'; c.textAlign = 'center'; c.fillText('วางตรงนี้', GAP.x, GAP.y - 62);
      }
      if (lit() && path) flow(c, path, now);
      // tray
      c.fillStyle = 'rgba(255,255,255,0.7)'; c.beginPath(); c.roundRect(90, 490, 820, 110, 30); c.fill();
      c.textAlign = 'center'; c.textBaseline = 'middle';
      for (const t of tray) {
        if (t === S.drag) continue;
        c.font = '70px serif'; c.fillText(t.em, t.x, t.y);
        if (t.tested !== null && t !== S.in) { c.font = '30px serif'; c.fillText(t.tested ? '✅' : '❌', t.hx + 38, t.hy - 36); }
      }
      if (S.drag) { c.font = '84px serif'; c.fillText(S.drag.em, S.drag.x, S.drag.y); }
      c.textBaseline = 'alphabetic';
    }
    return { bg: '#fdf1dc', focus: [90, 910], draw, down, move, up, action() {} };
  }

  window.TOPICS.push({
    id: 'bulb', emoji: '💡', title: 'หลอดไฟติดได้ยังไง', desc: 'ต่อวงจรไฟฟ้า ดูข้างในหลอดไฟ และอะไรนำไฟฟ้าได้บ้าง',
    warn: L.warn,
    items: [
      { id: 'circuit', emoji: '🔋', title: 'ต่อวงจร' },
      { id: 'inside', emoji: '💡', title: 'ข้างในหลอดไฟ' },
      { id: 'conduct', emoji: '🥄', title: 'อะไรนำไฟฟ้า' },
    ],
    lines: () => [...Object.values(L), ...THINGS.map(t => t.say)],
    create(api, itemId) { return itemId === 'inside' ? inside(api) : itemId === 'conduct' ? conduct(api) : circuit(api); },
  });
})();
