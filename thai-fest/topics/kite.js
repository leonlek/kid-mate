/* ประเพณีไทย — 🪁 ว่าวไทย
   ว่าวปักเป้า: small diamond kite with a long tail (the tail keeps it from spinning), the "female";
   ว่าวจุฬา: big five-pointed star kite, the "male". Old kite contests at สนามหลวง: the จุฬา tries
   to hook the ปักเป้า down. Thai children fly kites in the early hot season (about Feb–Apr) when
   the steady "kite wind" (ลมว่าว) blows. Never near power lines or on a roof.
   1) make a ปักเป้า: bamboo sticks → string frame → paper → tail → bridle line.
   2) fly it (or a จุฬา): hold to pull the line in the wind, drag to steer, reach 90 m. */
(function () {
  const L = {
    k0: 'มาทำว่าวปักเป้ากัน เริ่มจากไม้ไผ่สองอัน',
    k1: 'ผูกเชือกรอบโครง ให้เป็นรูปข้าวหลามตัด',
    k2: 'เลือกสีกระดาษ แปะบนโครงว่าว',
    k3: 'ติดหางยาวๆ หางช่วยให้ว่าวไม่หมุนติ้ว',
    k4: 'ผูกสายป่าน แล้วพร้อมเล่นแล้ว',
    k5: 'ว่าวปักเป้าเสร็จแล้ว! ไปเล่นว่าวกัน',
    fwarn: 'อย่าเล่นว่าวใกล้สายไฟฟ้า หรือบนหลังคา อันตรายมาก',
    f0: 'แตะค้างที่ปุ่มดึงสาย ให้ว่าวกินลม แล้วลากนิ้วบนฟ้าเพื่อบังคับว่าว',
    pakpao: 'ว่าวปักเป้า ตัวเล็ก รูปข้าวหลามตัด มีหางยาว เป็นว่าวตัวเมีย',
    chula: 'ว่าวจุฬา ตัวใหญ่ รูปดาวห้าแฉก เป็นว่าวตัวผู้',
    wire: 'ว่าวติดสายไฟ! ห้ามดึงหรือปีนไปเอาเด็ดขาด อันตรายมาก ให้ผู้ใหญ่โทรแจ้งการไฟฟ้า',
    f1: 'ว่าวขึ้นสูงแล้ว เก่งมาก!',
    f2: 'สมัยก่อนมีการแข่งว่าวที่สนามหลวง ว่าวจุฬาพยายามคว้าว่าวปักเป้าลงมา',
    f3: 'เด็กไทยเล่นว่าวช่วงต้นหน้าร้อน ราวเดือนกุมภาพันธ์ถึงเมษายน ช่วงที่มีลมดี เรียกกันว่าลมว่าว',
    win: 'เก่งมาก!',
  };
  const COLS = [['#e8322b', 'แดง'], ['#ffd21f', 'เหลือง'], ['#2e6fd8', 'น้ำเงิน'], ['#ff6b9d', 'ชมพู']];
  let myCol = '#e8322b';
  const rnd = (a, b) => a + Math.random() * (b - a);

  function pakpao(c, x, y, s, col, st, now) {      // st: {sticks, frame, paper, tail, bridle}
    c.save(); c.translate(x, y); c.scale(s, s);
    const P = [[0, -110], [80, -10], [0, 130], [-80, -10]];
    if (st.tail) {
      for (const side of [-1, 1]) {
        c.strokeStyle = col; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 130);
        for (let k = 1; k <= 12; k++) c.lineTo(side * 14 + Math.sin(now / 250 + k * 0.7) * 16 * side, 130 + k * 22);
        c.stroke();
      }
    }
    if (st.paper) { c.fillStyle = col; c.beginPath(); P.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.closePath(); c.fill(); c.fillStyle = 'rgba(255,255,255,0.25)'; c.beginPath(); c.moveTo(0, -110); c.lineTo(80, -10); c.lineTo(0, -10); c.fill(); }
    if (st.frame) { c.strokeStyle = '#555'; c.lineWidth = 3; c.beginPath(); P.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.closePath(); c.stroke(); }
    if (st.sticks) { c.strokeStyle = '#c8a25a'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, -112); c.lineTo(0, 132); c.moveTo(-82, -10); c.quadraticCurveTo(0, -40, 82, -10); c.stroke(); }
    if (st.bridle) { c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -60); c.lineTo(30, 30); c.lineTo(0, 90); c.stroke(); }
    c.restore();
  }
  function chula(c, x, y, s, now) {
    c.save(); c.translate(x, y); c.scale(s, s); c.rotate(Math.sin(now / 900) * 0.05);
    const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 60 : 140; pts.push([Math.cos(a) * r, Math.sin(a) * r]); }
    c.fillStyle = '#e8322b'; c.strokeStyle = '#7a1a14'; c.lineWidth = 4;
    c.beginPath(); pts.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#ffd21f'; c.beginPath(); c.arc(0, 0, 40, 0, 7); c.fill();
    c.strokeStyle = '#c8a25a'; c.lineWidth = 5; c.beginPath();
    for (let i = 0; i < 10; i += 2) { c.moveTo(0, 0); c.lineTo(pts[i][0], pts[i][1]); } c.stroke();
    c.restore();
  }

  // =====================================================================
  // 1) MAKE A ปักเป้า
  // =====================================================================
  function make(api) {
    const st = { sticks: false, frame: false, paper: false, tail: false, bridle: false };
    let col = myCol, step = 0;
    api.steps(0, 5); api.caption(L.k0);
    const set = () => {
      if (step === 0) api.buttons([{ id: 'sticks', label: '🎋 ไม้ไผ่ 2 อัน' }]);
      else if (step === 1) api.buttons([{ id: 'frame', label: '🧵 ผูกเชือก' }]);
      else if (step === 2) api.buttons(COLS.map(([h, th], i) => ({ id: 'c' + i, label: '🎨 ' + th })));
      else if (step === 3) api.buttons([{ id: 'tail', label: '🎀 ติดหาง' }]);
      else if (step === 4) api.buttons([{ id: 'bridle', label: '🪢 ผูกสายป่าน' }]);
      else api.buttons([]);
    };
    set();
    function action(id) {
      const ding = () => { api.tone(600 + step * 100, 0.12, 'triangle', 0.1); api.buzz(10); };
      if (id === 'sticks' && step === 0) { st.sticks = true; step = 1; ding(); api.caption(L.k1); }
      else if (id === 'frame' && step === 1) { st.frame = true; step = 2; ding(); api.caption(L.k2); }
      else if (id[0] === 'c' && step === 2) { col = myCol = COLS[+id.slice(1)][0]; st.paper = true; step = 3; ding(); api.say(COLS[+id.slice(1)][1]); setTimeout(() => api.caption(L.k3), 900); }
      else if (id === 'tail' && step === 3) { st.tail = true; step = 4; ding(); api.caption(L.k4); }
      else if (id === 'bridle' && step === 4) { st.bridle = true; step = 5; ding(); api.caption(L.k5, true); api.sayChain([L.k5, L.pakpao]); api.win(); }
      api.steps(step, 5); set();
    }
    function draw(c, now) {
      c.fillStyle = '#fdf1dc'; c.fillRect(-1000, -1500, 3000, 3200);
      c.fillStyle = '#c8955a'; c.fillRect(-1000, 600, 3000, 1200);
      pakpao(c, 500, 250, 1.3, col, st, now);
    }
    return { bg: '#fdf1dc', focus: [300, 700], draw, action };
  }

  // =====================================================================
  // 2) FLY IT
  // =====================================================================
  function fly(api) {
    const GY = 600, HX = 220, HY = GY - 150, GOAL = 150, POLE = 880;
    const S = { kind: 'pakpao', x: 330, y: GY - 40, pull: false, vx: 0, vy: 0, tx: 330, wind: 1, t: 0, stuck: 0, won: false, said: false };
    api.steps(0, 1); api.caption(L.f0);
    const btns = () => api.buttons([{ id: 'pull', label: '✊ ดึงสาย (แตะค้าง)', hold: true }, { id: S.kind === 'pakpao' ? 'chula' : 'pakpao', label: S.kind === 'pakpao' ? '⭐ ว่าวจุฬา' : '🔷 ว่าวปักเป้า', alt: true }]);
    btns();
    function action(id, holding) {
      if (id === 'pull') { S.pull = !!holding; return; }
      if (id === 'pakpao' || id === 'chula') { S.kind = id; S.x = 330; S.y = GY - 40; S.tx = 330; S.stuck = 0; api.caption(L[id]); btns(); }
    }
    function down(p) { if (!S.stuck) S.tx = Math.max(260, Math.min(980, p.x)); }
    function move(p) { down(p); }
    function tick(dt, now) {
      S.t += dt;
      S.wind = 0.75 + 0.35 * Math.sin(S.t * 0.7) + 0.15 * Math.sin(S.t * 2.3);
      if (S.stuck) { S.stuck -= dt; if (S.stuck <= 0) { S.stuck = 0; S.x = 330; S.y = GY - 40; S.tx = 330; } return; }
      const big = S.kind === 'chula' ? 0.75 : 1;   // the big จุฬา climbs a bit slower
      const lift = S.pull ? 230 * S.wind * big : -70;
      S.vy += ((-lift) - S.vy) * Math.min(1, dt * 3);
      S.y = Math.max(70, Math.min(GY - 40, S.y + S.vy * dt));
      S.x += (S.tx - S.x) * Math.min(1, dt * 1.6) + Math.sin(S.t * 1.7) * 12 * dt;
      if (S.x > POLE - 70 && S.y > 230 && S.y < 420) {         // caught on the wires
        S.stuck = 6; S.pull = false; api.caption(L.wire); api.tone(220, 0.4, 'sawtooth', 0.06); return;
      }
      const h = Math.round((GY - S.y) / 5);
      if (h >= 90 && !S.won) {
        S.won = true; api.steps(1, 1); api.caption(L.f1, true); api.sayChain([L.f1, L.f2, L.f3]); api.win();
      }
    }
    function draw(c, now) {
      const g = c.createLinearGradient(0, -300, 0, GY); g.addColorStop(0, '#58b9f5'); g.addColorStop(1, '#cdeeff');
      c.fillStyle = g; c.fillRect(-1000, -1500, 3000, GY + 1500);
      c.fillStyle = '#ffd93d'; c.beginPath(); c.arc(120, 90, 46, 0, 7); c.fill();
      // wind streaks
      c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 4; c.lineCap = 'round';
      for (let k = 0; k < 7; k++) { const u = ((now / 1000) * 0.4 * S.wind + k / 7) % 1, x = -100 + u * 1200, y = 100 + (k * 71) % 380; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 70 * S.wind, y); c.stroke(); }
      // goal line
      c.strokeStyle = 'rgba(229,75,130,0.6)'; c.setLineDash([12, 10]); c.lineWidth = 3; c.beginPath(); c.moveTo(-200, GOAL); c.lineTo(1200, GOAL); c.stroke(); c.setLineDash([]);
      c.fillStyle = '#e54b82'; c.font = '700 20px Mitr'; c.textAlign = 'left'; c.fillText('🏁 90 เมตร', 270, GOAL - 10);
      // power pole + wires (keep away!)
      c.fillStyle = '#7a6a5a'; c.fillRect(POLE - 8, 220, 16, GY - 220);
      c.fillRect(POLE - 60, 240, 120, 10);
      c.strokeStyle = '#333'; c.lineWidth = 3;
      for (const dx of [-55, 0, 55]) { c.beginPath(); c.moveTo(POLE + dx, 245); c.quadraticCurveTo(POLE + dx + 200, 320, POLE + dx + 520, 250); c.stroke(); }
      c.fillStyle = '#e1552a'; c.font = '30px serif'; c.textAlign = 'center'; c.fillText('⚡', POLE, 210);
      // field + kid
      c.fillStyle = '#7ed957'; c.fillRect(-1000, GY, 3000, 1400);
      c.fillStyle = '#2e86de'; c.fillRect(HX - 16, GY - 70, 14, 70); c.fillRect(HX + 2, GY - 70, 14, 70);
      c.fillStyle = '#ff6b9d'; c.beginPath(); c.roundRect(HX - 26, GY - 150, 52, 86, 16); c.fill();
      c.fillStyle = '#f2c29b'; c.beginPath(); c.arc(HX, GY - 180, 30, 0, 7); c.fill();
      c.fillStyle = '#2d3436'; c.beginPath(); c.arc(HX, GY - 188, 31, Math.PI, 0); c.fill();
      c.strokeStyle = '#f2c29b'; c.lineWidth = 14; c.beginPath(); c.moveTo(HX + 20, GY - 130); c.lineTo(HX + 50, S.pull ? GY - 140 : GY - 120); c.stroke();
      // line
      c.strokeStyle = 'rgba(255,255,255,0.95)'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(HX + 54, HY + (S.pull ? -8 : 12)); c.quadraticCurveTo((HX + S.x) / 2, Math.max(S.y, HY) + (S.pull ? 10 : 60), S.x, S.y + 20); c.stroke();
      if (S.kind === 'chula') chula(c, S.x, S.y, 0.55, now);
      else pakpao(c, S.x, S.y, 0.45, myCol, { sticks: true, frame: true, paper: true, tail: true, bridle: true }, now);
      // height
      const h = Math.max(0, Math.round((GY - S.y) / 5));
      c.fillStyle = 'rgba(255,255,255,0.92)'; c.beginPath(); c.roundRect(700, 30, 250, 56, 28); c.fill();
      c.fillStyle = '#2d3436'; c.font = '700 26px Mitr'; c.textAlign = 'center'; c.fillText('🪁 สูง ' + h + ' เมตร', 825, 68);
    }
    return { bg: '#58b9f5', focus: [180, 960], tick, draw, down, move, action };
  }

  window.TOPICS.push({
    id: 'kite', emoji: '🪁', title: 'ว่าวไทย', desc: 'ทำว่าวปักเป้า แล้วไปเล่นว่าวกับลมว่าวหน้าร้อน',
    items: [
      { id: 'make', emoji: '🛠️', title: 'ทำว่าว' },
      { id: 'fly', emoji: '🪁', title: 'เล่นว่าว', warn: L.fwarn },
    ],
    lines: () => [...Object.values(L), ...COLS.map(([, th]) => th)],
    create(api, itemId) { return itemId === 'fly' ? fly(api) : make(api); },
  });
})();
