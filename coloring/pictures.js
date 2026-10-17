// ============================================================================
// PICTURES — 80 drawings for the coloring game (แตะเติมสี).
// Each picture = list of regions drawn back→front on an 800×800 canvas. A later
// region covers the outline of an earlier one, so overlapping shapes read as one
// drawing. Clickable regions are painted by tapping; decor (eyes, lines) is not.
// lv: 1 = age 3-4 (few big regions) · 2 = age 5-6 · 3 = age 7-8 (many regions)
// ============================================================================
const W = '#fff', INK = '#2d3436';
const PICTURES = [];
const PICTURE_META = {};
const CATEGORIES = [
  { id: 'animals',  label: '🐾 สัตว์น่ารัก' },
  { id: 'wild',     label: '🦁 สัตว์ป่า' },
  { id: 'sea',      label: '🌊 ใต้ทะเล' },
  { id: 'nature',   label: '🌈 ธรรมชาติ' },
  { id: 'food',     label: '🍎 อาหารอร่อย' },
  { id: 'vehicles', label: '🚗 ยานพาหนะ' },
  { id: 'thai',     label: '🪷 ไทยๆ' },
  { id: 'jobs',     label: '👷 อาชีพ' },
  { id: 'sport',    label: '⚽ กีฬา' },
  { id: 'misc',     label: '🏠 อื่นๆ' },
];
function add(id, name, category, anim, level, regions) {
  PICTURES.push({ id, name, regions });
  PICTURE_META[id] = { category, anim, level };
}
// Region builders
const c = (id, cx, cy, r) => ({ id, shape: 'circle', cx, cy, r, fill: W });
const e = (id, cx, cy, rx, ry) => ({ id, shape: 'ellipse', cx, cy, rx, ry, fill: W });
const rc = (id, x, y, w, h, rx = 0) => ({ id, shape: 'rect', x, y, w, h, rx, fill: W });
const p = (id, d) => ({ id, shape: 'path', d, fill: W });
const poly = (id, pts) => p(id, 'M ' + pts.map(q => q.join(' ')).join(' L ') + ' Z');
// Decor (not paintable): dot, filled shape, stroked line
let _dn = 0;
const dot = (cx, cy, r) => ({ id: 'd' + (++_dn), shape: 'circle', cx, cy, r, fill: INK, noClick: true });
const dk = (d) => ({ id: 'd' + (++_dn), shape: 'path', d, fill: INK, noClick: true });
const ln = (d, w = 6) => ({ id: 'd' + (++_dn), shape: 'path', d, fill: 'none', stroke: INK, strokeWidth: w, noClick: true });
// Star split into a centre + N tips
function starParts(id, cx, cy, R, r, n = 5) {
  const pt = (rad, i) => { const a = -Math.PI / 2 + i * Math.PI / n; return [Math.round(cx + rad * Math.cos(a)), Math.round(cy + rad * Math.sin(a))]; };
  const out = [poly(id + '-mid', Array.from({ length: n }, (_, i) => pt(r, 2 * i + 1)))];
  for (let i = 0; i < n; i++) out.push(poly(id + '-tip' + i, [pt(r, 2 * i - 1), pt(R, 2 * i), pt(r, 2 * i + 1)]));
  return out;
}
function starShape(id, cx, cy, R, r, n = 5) {
  const pts = [];
  for (let i = 0; i < 2 * n; i++) { const a = -Math.PI / 2 + i * Math.PI / n, rad = i % 2 ? r : R; pts.push([Math.round(cx + rad * Math.cos(a)), Math.round(cy + rad * Math.sin(a))]); }
  return poly(id, pts);
}
// Heart centred on (cx,cy), s = scale (1 ≈ 560 wide)
function heart(id, cx, cy, s) {
  const X = x => Math.round(cx + (x - 400) * s), Y = y => Math.round(cy + (y - 420) * s);
  return p(id, `M ${X(400)} ${Y(700)} C ${X(150)} ${Y(520)} ${X(80)} ${Y(380)} ${X(130)} ${Y(280)} C ${X(190)} ${Y(170)} ${X(340)} ${Y(180)} ${X(400)} ${Y(290)} C ${X(460)} ${Y(180)} ${X(610)} ${Y(170)} ${X(670)} ${Y(280)} C ${X(720)} ${Y(380)} ${X(650)} ${Y(520)} ${X(400)} ${Y(700)} Z`);
}
// Round face eyes+smile decor
const eyes = (x1, x2, y, r = 12) => [dot(x1, y, r), dot(x2, y, r)];
const smile = (cx, cy, w = 50) => ln(`M ${cx - w} ${cy} Q ${cx} ${cy + w * 0.8} ${cx + w} ${cy}`, 6);

const ringd = (cx, cy, r) => ({ id: 'd' + (++_dn), shape: 'circle', cx, cy, r, fill: W, noClick: true });
function pie(id, cx, cy, R, a0, a1) {
  const f = a => [Math.round(cx + R * Math.cos(a * Math.PI / 180)), Math.round(cy + R * Math.sin(a * Math.PI / 180))];
  const A = f(a0), B = f(a1);
  return p(id, `M ${cx} ${cy} L ${A[0]} ${A[1]} A ${R} ${R} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${B[0]} ${B[1]} Z`);
}
const drop = (id, x, y) => p(id, `M ${x} ${y - 75} C ${x + 55} ${y - 5} ${x + 60} ${y + 35} ${x} ${y + 70} C ${x - 60} ${y + 35} ${x - 55} ${y - 5} ${x} ${y - 75} Z`);
const drop0 = (id, x, y) => p(id, `M ${x} ${y - 55} C ${x + 40} ${y - 5} ${x + 45} ${y + 25} ${x} ${y + 50} C ${x - 45} ${y + 25} ${x - 40} ${y - 5} ${x} ${y - 55} Z`);

// Vertical band of an ellipse between x1..x2 (stripes on bodies)
function band(id, cx, cy, rx, ry, x1, x2) {
  const yt = x => Math.round(cy - ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2)));
  const yb = x => Math.round(cy + ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2)));
  return p(id, `M ${x1} ${yt(x1)} A ${rx} ${ry} 0 0 1 ${x2} ${yt(x2)} L ${x2} ${yb(x2)} A ${rx} ${ry} 0 0 1 ${x1} ${yb(x1)} Z`);
}
const ed = (cx, cy, rx, ry) => ({ id: 'd' + (++_dn), shape: 'ellipse', cx, cy, rx, ry, fill: INK, noClick: true });
const wheel = (id, cx, cy, r) => [c(id, cx, cy, r), ringd(cx, cy, Math.round(r * 0.42))];
add('butterfly', '🦋 ผีเสื้อ', 'animals', 'fly', 2, [
      { id: 'body',      shape: 'ellipse', cx: 400, cy: 400, rx: 30, ry: 130, fill: '#fff' },
      { id: 'left-up',   shape: 'path',
        d: 'M 380 320 C 240 220 120 240 120 360 C 120 470 250 470 380 380 Z', fill: '#fff' },
      { id: 'right-up',  shape: 'path',
        d: 'M 420 320 C 560 220 680 240 680 360 C 680 470 550 470 420 380 Z', fill: '#fff' },
      { id: 'left-low',  shape: 'path',
        d: 'M 380 410 C 280 460 200 540 240 620 C 280 680 380 620 380 510 Z', fill: '#fff' },
      { id: 'right-low', shape: 'path',
        d: 'M 420 410 C 520 460 600 540 560 620 C 520 680 420 620 420 510 Z', fill: '#fff' },
      { id: 'antenna-l', shape: 'path',
        d: 'M 388 290 Q 360 240 340 220', fill: 'none', stroke: '#2d3436', strokeWidth: 6, noFill: true, noClick: true },
      { id: 'antenna-r', shape: 'path',
        d: 'M 412 290 Q 440 240 460 220', fill: 'none', stroke: '#2d3436', strokeWidth: 6, noFill: true, noClick: true },
    ]);
add('car', '🚗 รถยนต์', 'vehicles', 'drive', 2, [
      { id: 'body',  shape: 'path', d: 'M 120 480 L 180 380 L 280 360 L 520 360 L 620 380 L 680 480 L 680 560 L 120 560 Z', fill: '#fff' },
      { id: 'window-l', shape: 'path', d: 'M 200 380 L 270 380 L 290 460 L 200 460 Z', fill: '#fff' },
      { id: 'window-r', shape: 'path', d: 'M 600 380 L 530 380 L 510 460 L 600 460 Z', fill: '#fff' },
      { id: 'window-c', shape: 'path', d: 'M 290 380 L 510 380 L 510 460 L 290 460 Z', fill: '#fff' },
      { id: 'wheel-l', shape: 'circle', cx: 220, cy: 580, r: 60, fill: '#fff' },
      { id: 'wheel-r', shape: 'circle', cx: 580, cy: 580, r: 60, fill: '#fff' },
      { id: 'hub-l',  shape: 'circle', cx: 220, cy: 580, r: 24, fill: '#fff' },
      { id: 'hub-r',  shape: 'circle', cx: 580, cy: 580, r: 24, fill: '#fff' },
      { id: 'headlight', shape: 'circle', cx: 670, cy: 500, r: 14, fill: '#fff' },
    ]);
add('icecream', '🍦 ไอติม', 'food', 'wiggle', 2, [
      { id: 'cone', shape: 'path', d: 'M 320 460 L 480 460 L 400 740 Z', fill: '#fff' },
      { id: 'scoop-top', shape: 'circle', cx: 400, cy: 320, r: 130, fill: '#fff' },
      { id: 'scoop-l', shape: 'circle', cx: 330, cy: 420, r: 90, fill: '#fff' },
      { id: 'scoop-r', shape: 'circle', cx: 470, cy: 420, r: 90, fill: '#fff' },
      { id: 'cherry', shape: 'circle', cx: 400, cy: 190, r: 40, fill: '#fff' },
      { id: 'cherry-stem', shape: 'path', d: 'M 400 150 Q 430 100 470 80', fill: 'none', stroke: '#2d3436', strokeWidth: 6, noFill: true, noClick: true },
    ]);
add('cake', '🎂 เค้ก', 'food', 'glow', 3, [
      { id: 'plate', shape: 'ellipse', cx: 400, cy: 700, rx: 280, ry: 30, fill: '#fff' },
      { id: 'tier-bottom', shape: 'path', d: 'M 200 540 L 600 540 L 600 700 L 200 700 Z', fill: '#fff' },
      { id: 'tier-top', shape: 'path', d: 'M 270 420 L 530 420 L 530 540 L 270 540 Z', fill: '#fff' },
      { id: 'frosting-bottom', shape: 'path', d: 'M 200 540 Q 250 510 300 540 Q 350 510 400 540 Q 450 510 500 540 Q 550 510 600 540 L 600 560 L 200 560 Z', fill: '#fff' },
      { id: 'frosting-top', shape: 'path', d: 'M 270 420 Q 320 395 370 420 Q 420 395 470 420 Q 510 395 530 420 L 530 440 L 270 440 Z', fill: '#fff' },
      { id: 'candle-l', shape: 'path', d: 'M 348 330 L 348 420 L 372 420 L 372 330 Z', fill: '#fff' },
      { id: 'candle-c', shape: 'path', d: 'M 388 310 L 388 420 L 412 420 L 412 310 Z', fill: '#fff' },
      { id: 'candle-r', shape: 'path', d: 'M 428 330 L 428 420 L 452 420 L 452 330 Z', fill: '#fff' },
      { id: 'flame-l', shape: 'ellipse', cx: 360, cy: 310, rx: 12, ry: 22, fill: '#fff' },
      { id: 'flame-c', shape: 'ellipse', cx: 400, cy: 290, rx: 12, ry: 22, fill: '#fff' },
      { id: 'flame-r', shape: 'ellipse', cx: 440, cy: 310, rx: 12, ry: 22, fill: '#fff' },
    ]);
add('pizza', '🍕 พิซซ่า', 'food', 'spin', 2, [
      { id: 'crust', shape: 'path', d: 'M 400 160 L 680 660 L 120 660 Z', fill: '#fff' },
      { id: 'sauce', shape: 'path', d: 'M 400 230 L 630 630 L 170 630 Z', fill: '#fff' },
      { id: 'cheese-top', shape: 'circle', cx: 400, cy: 320, r: 32, fill: '#fff' },
      { id: 'pepper-1', shape: 'circle', cx: 350, cy: 420, r: 40, fill: '#fff' },
      { id: 'pepper-2', shape: 'circle', cx: 450, cy: 420, r: 40, fill: '#fff' },
      { id: 'mushroom-1', shape: 'circle', cx: 310, cy: 540, r: 38, fill: '#fff' },
      { id: 'mushroom-2', shape: 'circle', cx: 400, cy: 540, r: 38, fill: '#fff' },
      { id: 'mushroom-3', shape: 'circle', cx: 490, cy: 540, r: 38, fill: '#fff' },
    ]);
add('train', '🚂 รถไฟ', 'vehicles', 'drive', 2, [
      { id: 'engine-body', shape: 'path', d: 'M 140 360 L 440 360 L 440 540 L 140 540 Z', fill: '#fff' },
      { id: 'cab', shape: 'path', d: 'M 440 280 L 660 280 L 660 540 L 440 540 Z', fill: '#fff' },
      { id: 'cab-window', shape: 'path', d: 'M 480 320 L 620 320 L 620 420 L 480 420 Z', fill: '#fff' },
      { id: 'chimney', shape: 'path', d: 'M 220 260 L 290 260 L 290 360 L 220 360 Z', fill: '#fff' },
      { id: 'smoke-1', shape: 'circle', cx: 240, cy: 200, r: 35, fill: '#fff' },
      { id: 'smoke-2', shape: 'circle', cx: 310, cy: 160, r: 45, fill: '#fff' },
      { id: 'smoke-3', shape: 'circle', cx: 400, cy: 130, r: 50, fill: '#fff' },
      { id: 'wheel-1', shape: 'circle', cx: 220, cy: 600, r: 55, fill: '#fff' },
      { id: 'wheel-2', shape: 'circle', cx: 380, cy: 600, r: 55, fill: '#fff' },
      { id: 'wheel-3', shape: 'circle', cx: 560, cy: 600, r: 55, fill: '#fff' },
      { id: 'headlight', shape: 'circle', cx: 165, cy: 460, r: 22, fill: '#fff' },
    ]);
add('rocket', '🚀 จรวด', 'vehicles', 'launch', 2, [
      { id: 'nose', shape: 'path', d: 'M 400 100 L 480 280 L 320 280 Z', fill: '#fff' },
      { id: 'body', shape: 'path', d: 'M 320 280 L 480 280 L 480 580 L 320 580 Z', fill: '#fff' },
      { id: 'window', shape: 'circle', cx: 400, cy: 360, r: 50, fill: '#fff' },
      { id: 'fin-l', shape: 'path', d: 'M 320 480 L 240 600 L 320 600 Z', fill: '#fff' },
      { id: 'fin-r', shape: 'path', d: 'M 480 480 L 560 600 L 480 600 Z', fill: '#fff' },
      { id: 'engine', shape: 'path', d: 'M 350 580 L 450 580 L 450 660 L 350 660 Z', fill: '#fff' },
      { id: 'flame-out', shape: 'path', d: 'M 350 660 Q 350 740 400 760 Q 450 740 450 660 Z', fill: '#fff' },
      { id: 'flame-in', shape: 'path', d: 'M 380 700 Q 380 750 400 770 Q 420 750 420 700 Z', fill: '#fff' },
      { id: 'star-1', shape: 'circle', cx: 160, cy: 200, r: 14, fill: '#fff' },
      { id: 'star-2', shape: 'circle', cx: 640, cy: 280, r: 18, fill: '#fff' },
      { id: 'star-3', shape: 'circle', cx: 700, cy: 480, r: 14, fill: '#fff' },
    ]);
add('boat', '⛵ เรือใบ', 'vehicles', 'sway', 2, [
      { id: 'hull', shape: 'path', d: 'M 120 540 L 680 540 L 600 660 L 200 660 Z', fill: '#fff' },
      { id: 'mast', shape: 'path', d: 'M 393 180 L 407 180 L 407 540 L 393 540 Z', fill: '#fff' },
      { id: 'sail-big', shape: 'path', d: 'M 407 180 L 407 520 L 600 520 Z', fill: '#fff' },
      { id: 'sail-small', shape: 'path', d: 'M 393 220 L 393 520 L 230 520 Z', fill: '#fff' },
      { id: 'flag', shape: 'path', d: 'M 407 180 L 470 200 L 407 220 Z', fill: '#fff' },
      { id: 'wave', shape: 'path', d: 'M 60 700 Q 140 670 220 700 Q 300 730 380 700 Q 460 670 540 700 Q 620 730 700 700 L 740 700 L 740 740 L 60 740 Z', fill: '#fff' },
      { id: 'sun', shape: 'circle', cx: 660, cy: 160, r: 50, fill: '#fff' },
    ]);
add('penguin', '🐧 เพนกวิน', 'animals', 'waddle', 2, [
      { id: 'body', shape: 'ellipse', cx: 400, cy: 440, rx: 180, ry: 240, fill: '#fff' },
      { id: 'belly', shape: 'ellipse', cx: 400, cy: 470, rx: 110, ry: 180, fill: '#fff' },
      { id: 'eye-l', shape: 'circle', cx: 360, cy: 280, r: 16, fill: '#fff' },
      { id: 'eye-r', shape: 'circle', cx: 440, cy: 280, r: 16, fill: '#fff' },
      { id: 'beak', shape: 'path', d: 'M 380 320 L 420 320 L 400 360 Z', fill: '#fff' },
      { id: 'wing-l', shape: 'ellipse', cx: 230, cy: 480, rx: 40, ry: 100, fill: '#fff' },
      { id: 'wing-r', shape: 'ellipse', cx: 570, cy: 480, rx: 40, ry: 100, fill: '#fff' },
      { id: 'foot-l', shape: 'ellipse', cx: 340, cy: 700, rx: 50, ry: 20, fill: '#fff' },
      { id: 'foot-r', shape: 'ellipse', cx: 460, cy: 700, rx: 50, ry: 20, fill: '#fff' },
    ]);
add('robot', '🤖 หุ่นยนต์', 'misc', 'wiggle', 3, [
      { id: 'antenna', shape: 'path', d: 'M 395 70 L 405 70 L 405 170 L 395 170 Z', fill: '#fff' },
      { id: 'antenna-ball', shape: 'circle', cx: 400, cy: 55, r: 22, fill: '#fff' },
      { id: 'head', shape: 'path', d: 'M 280 180 L 520 180 L 520 380 L 280 380 Z', fill: '#fff' },
      { id: 'eye-l', shape: 'circle', cx: 340, cy: 260, r: 28, fill: '#fff' },
      { id: 'eye-r', shape: 'circle', cx: 460, cy: 260, r: 28, fill: '#fff' },
      { id: 'mouth', shape: 'path', d: 'M 340 320 L 460 320 L 460 350 L 340 350 Z', fill: '#fff' },
      { id: 'body', shape: 'path', d: 'M 240 400 L 560 400 L 560 600 L 240 600 Z', fill: '#fff' },
      { id: 'btn-1', shape: 'circle', cx: 340, cy: 470, r: 22, fill: '#fff' },
      { id: 'btn-2', shape: 'circle', cx: 400, cy: 470, r: 22, fill: '#fff' },
      { id: 'btn-3', shape: 'circle', cx: 460, cy: 470, r: 22, fill: '#fff' },
      { id: 'arm-l', shape: 'path', d: 'M 240 420 L 130 420 L 130 540 L 240 540 Z', fill: '#fff' },
      { id: 'arm-r', shape: 'path', d: 'M 560 420 L 670 420 L 670 540 L 560 540 Z', fill: '#fff' },
      { id: 'leg-l', shape: 'path', d: 'M 280 600 L 280 740 L 360 740 L 360 600 Z', fill: '#fff' },
      { id: 'leg-r', shape: 'path', d: 'M 440 600 L 440 740 L 520 740 L 520 600 Z', fill: '#fff' },
    ]);
add('sun', '☀️ ดวงอาทิตย์', 'nature', 'spin', 2, [
      { id: 'disc', shape: 'circle', cx: 400, cy: 400, r: 160, fill: '#fff' },
      { id: 'ray-n', shape: 'path', d: 'M 400 100 L 380 200 L 420 200 Z', fill: '#fff' },
      { id: 'ray-s', shape: 'path', d: 'M 400 700 L 380 600 L 420 600 Z', fill: '#fff' },
      { id: 'ray-w', shape: 'path', d: 'M 100 400 L 200 380 L 200 420 Z', fill: '#fff' },
      { id: 'ray-e', shape: 'path', d: 'M 700 400 L 600 380 L 600 420 Z', fill: '#fff' },
      { id: 'ray-nw', shape: 'path', d: 'M 180 180 L 250 240 L 220 270 Z', fill: '#fff' },
      { id: 'ray-ne', shape: 'path', d: 'M 620 180 L 550 240 L 580 270 Z', fill: '#fff' },
      { id: 'ray-sw', shape: 'path', d: 'M 180 620 L 250 560 L 220 530 Z', fill: '#fff' },
      { id: 'ray-se', shape: 'path', d: 'M 620 620 L 550 560 L 580 530 Z', fill: '#fff' },
      { id: 'eye-l', shape: 'circle', cx: 350, cy: 370, r: 16, fill: '#fff' },
      { id: 'eye-r', shape: 'circle', cx: 450, cy: 370, r: 16, fill: '#fff' },
      { id: 'smile', shape: 'path', d: 'M 340 440 Q 400 500 460 440 L 460 460 Q 400 525 340 460 Z', fill: '#fff' },
    ]);
add('rainbow', '🌈 สายรุ้ง', 'nature', 'shimmer', 2, [
      { id: 'arc-1', shape: 'path', d: 'M 100 600 A 300 300 0 0 1 700 600 L 660 600 A 260 260 0 0 0 140 600 Z', fill: '#fff' },
      { id: 'arc-2', shape: 'path', d: 'M 140 600 A 260 260 0 0 1 660 600 L 620 600 A 220 220 0 0 0 180 600 Z', fill: '#fff' },
      { id: 'arc-3', shape: 'path', d: 'M 180 600 A 220 220 0 0 1 620 600 L 580 600 A 180 180 0 0 0 220 600 Z', fill: '#fff' },
      { id: 'arc-4', shape: 'path', d: 'M 220 600 A 180 180 0 0 1 580 600 L 540 600 A 140 140 0 0 0 260 600 Z', fill: '#fff' },
      { id: 'arc-5', shape: 'path', d: 'M 260 600 A 140 140 0 0 1 540 600 L 500 600 A 100 100 0 0 0 300 600 Z', fill: '#fff' },
      { id: 'cloud-l-a', shape: 'circle', cx: 120, cy: 620, r: 40, fill: '#fff' },
      { id: 'cloud-l-b', shape: 'circle', cx: 170, cy: 600, r: 50, fill: '#fff' },
      { id: 'cloud-l-c', shape: 'circle', cx: 80, cy: 640, r: 30, fill: '#fff' },
      { id: 'cloud-r-a', shape: 'circle', cx: 680, cy: 620, r: 40, fill: '#fff' },
      { id: 'cloud-r-b', shape: 'circle', cx: 630, cy: 600, r: 50, fill: '#fff' },
      { id: 'cloud-r-c', shape: 'circle', cx: 720, cy: 640, r: 30, fill: '#fff' },
    ]);

// Tiny details of the older drawings → decor (too small for a child's finger)
function decorize(pid, ids) {
  const pic = PICTURES.find(x => x.id === pid);
  for (const r of pic.regions) if (ids.includes(r.id)) r.noClick = true;
}
decorize('car', ['headlight']);
decorize('cake', ['candle-l', 'candle-c', 'candle-r', 'flame-l', 'flame-c', 'flame-r']);
decorize('rocket', ['star-1', 'star-2', 'star-3']);
decorize('boat', ['mast']);
decorize('robot', ['antenna', 'mouth']);
decorize('sun', ['eye-l', 'eye-r']);
decorize('penguin', ['eye-l', 'eye-r']);
// ===================== LEVEL 1 — age 3-4 (few, big regions) =====================
add('apple', '🍎 แอปเปิล', 'food', 'bounce', 1, [
  p('body', 'M 400 290 C 300 220 150 270 160 430 C 170 590 290 710 400 665 C 510 710 630 590 640 430 C 650 270 500 220 400 290 Z'),
  p('stem', 'M 385 295 C 385 240 395 195 425 150 L 470 170 C 445 205 435 245 435 290 Z'),
  p('leaf', 'M 450 215 C 480 135 575 125 635 160 C 610 235 510 265 450 215 Z'),
  ln('M 225 410 Q 230 340 290 310', 10),
]);
add('star', '⭐ ดาว', 'nature', 'spin', 1, [
  ...starParts('s', 400, 430, 340, 150),
  ...eyes(350, 450, 420, 14), smile(400, 470, 45),
]);
add('heart', '❤️ หัวใจ', 'misc', 'glow', 1, [
  heart('big', 400, 440, 1.0),
  heart('inner', 400, 430, 0.5),
  heart('h-l', 130, 130, 0.3),
  heart('h-r', 670, 130, 0.3),
]);
add('balloons', '🎈 ลูกโป่ง', 'misc', 'sway', 1, [
  ln('M 180 585 Q 200 700 395 775', 5), ln('M 620 585 Q 600 700 405 775', 5), ln('M 400 565 Q 380 660 400 775', 5),
  e('b-l', 180, 410, 125, 165), e('b-r', 620, 410, 125, 165), e('b-c', 400, 330, 165, 215),
  dk('M 168 575 L 192 575 L 180 595 Z'), dk('M 608 575 L 632 575 L 620 595 Z'), dk('M 387 545 L 413 545 L 400 568 Z'),
  ln('M 330 220 Q 300 270 310 320', 10),
]);
add('umbrella', '☂️ ร่ม', 'misc', 'sway', 1, [
  ln('M 400 400 L 400 650 Q 400 720 340 720 Q 295 720 295 665', 22),
  p('u1', 'M 400 120 Q 140 160 110 420 Q 182 380 255 420 Z'),
  p('u2', 'M 400 120 L 255 420 Q 328 380 400 420 Z'),
  p('u3', 'M 400 120 L 400 420 Q 472 380 545 420 Z'),
  p('u4', 'M 400 120 L 545 420 Q 618 380 690 420 Q 660 160 400 120 Z'),
  drop('rain1', 160, 590), drop('rain2', 640, 580), drop('rain3', 540, 710),
]);
add('goldfish', '🐠 ปลาทอง', 'sea', 'swim', 1, [
  p('tail', 'M 560 400 C 640 330 710 300 740 240 C 770 350 770 450 740 560 C 710 490 640 470 560 400 Z'),
  p('fin-top', 'M 320 260 C 340 170 440 140 520 200 C 450 215 400 240 370 280 Z'),
  e('body', 400, 410, 215, 170),
  e('belly', 420, 480, 130, 60),
  p('fin-side', 'M 380 400 C 450 380 520 420 540 470 C 480 500 420 470 380 400 Z'),
  dot(270, 370, 16), ln('M 330 320 Q 305 400 330 480', 6), ln('M 195 430 Q 215 445 240 435', 5),
]);
add('pig', '🐷 หมู', 'animals', 'wiggle', 1, [
  p('ear-l', 'M 230 270 L 180 110 C 270 110 350 170 370 235 Z'),
  p('ear-r', 'M 570 270 L 620 110 C 530 110 450 170 430 235 Z'),
  c('head', 400, 420, 240),
  e('snout', 400, 500, 105, 80),
  dot(375, 500, 14), dot(425, 500, 14), ...eyes(310, 490, 380, 16),
]);
add('duck', '🦆 เป็ด', 'animals', 'waddle', 1, [
  e('pond', 400, 700, 340, 70),
  p('tail', 'M 200 480 L 90 390 C 80 470 100 560 170 600 Z'),
  e('body', 390, 540, 230, 165),
  e('wing', 370, 540, 120, 75),
  c('head', 520, 310, 125),
  p('beak', 'M 620 290 L 770 335 L 620 385 Z'),
  dot(555, 285, 14),
]);
add('beachball', '🏖️ ลูกบอลชายหาด', 'sport', 'bounce', 1, [
  pie('w1', 400, 400, 320, -90, -30), pie('w2', 400, 400, 320, -30, 30), pie('w3', 400, 400, 320, 30, 90),
  pie('w4', 400, 400, 320, 90, 150), pie('w5', 400, 400, 320, 150, 210), pie('w6', 400, 400, 320, 210, 270),
  c('hub', 400, 400, 55),
]);
add('tree', '🌳 ต้นไม้', 'nature', 'sway', 1, [
  e('ground', 400, 735, 360, 55),
  p('trunk', 'M 345 740 C 360 650 355 560 335 460 L 465 460 C 445 560 440 650 455 740 Z'),
  c('crown-l', 235, 360, 140), c('crown-r', 565, 360, 140), c('crown', 400, 260, 185),
  ln('M 330 560 Q 360 500 370 470', 5),
]);
add('snowman', '⛄ มนุษย์หิมะ', 'nature', 'wiggle', 1, [
  ln('M 285 400 L 150 330', 12), ln('M 515 400 L 650 330', 12),
  c('bottom', 400, 625, 160), c('middle', 400, 415, 125), c('head', 400, 245, 90),
  p('scarf', 'M 305 325 Q 400 360 495 325 L 505 375 Q 400 410 295 375 Z'),
  p('hat', 'M 295 170 L 335 160 L 340 50 L 460 50 L 465 160 L 505 170 Q 400 195 295 170 Z'),
  ...eyes(365, 435, 230, 11), dk('M 400 250 L 400 275 L 470 268 Z'), dot(400, 440, 12), dot(400, 490, 12), dot(400, 540, 12),
]);
add('lolly', '🍭 ไอติมแท่ง', 'food', 'wiggle', 1, [
  rc('stick', 365, 480, 70, 270, 30),
  p('pop', 'M 240 500 L 240 260 C 240 100 560 100 560 260 L 560 500 Q 400 540 240 500 Z'),
  p('dip', 'M 240 340 L 240 260 C 240 100 560 100 560 260 L 560 340 Q 530 390 490 345 Q 450 400 405 345 Q 360 400 320 345 Q 280 390 240 340 Z'),
  ln('M 330 190 l 25 -15', 8), ln('M 440 170 l 25 12', 8), ln('M 380 260 l 5 25', 8), ln('M 480 250 l -20 20', 8),
]);
add('cupcake', '🧁 คัพเค้ก', 'food', 'glow', 1, [
  p('wrapper', 'M 215 450 L 585 450 L 525 705 L 275 705 Z'),
  p('frost', 'M 195 460 C 150 380 270 365 285 320 C 300 270 345 260 400 190 C 455 260 500 270 515 320 C 530 365 650 380 605 460 Q 400 510 195 460 Z'),
  c('cherry', 400, 160, 55),
  ln('M 330 470 L 345 690', 5), ln('M 400 475 L 400 695', 5), ln('M 470 470 L 455 690', 5),
]);
add('chick', '🐥 ลูกเจี๊ยบ', 'animals', 'hop', 1, [
  c('sun', 670, 130, 75), e('grass', 400, 750, 400, 45),
  c('chick', 400, 400, 170),
  p('shell', 'M 205 560 L 255 500 L 310 565 L 360 500 L 410 565 L 460 500 L 515 565 L 555 500 L 600 560 C 625 690 520 750 400 750 C 280 750 175 690 205 560 Z'),
  ...eyes(345, 455, 345, 14), dk('M 375 385 L 425 385 L 400 425 Z'), ln('M 400 230 Q 380 190 410 170', 8),
]);
add('mushroom', '🍄 เห็ด', 'nature', 'glow', 1, [
  e('ground', 400, 745, 330, 45),
  p('stem', 'M 320 440 L 310 705 Q 400 745 490 705 L 480 440 Z'),
  p('cap', 'M 100 450 C 100 230 260 100 400 100 C 540 100 700 230 700 450 Q 400 505 100 450 Z'),
  c('s1', 290, 290, 62), c('s2', 480, 230, 55), c('s3', 580, 370, 50),
  ...eyes(365, 435, 570, 11), smile(400, 610, 28),
]);
// ===================== LEVEL 2 — age 5-6 =====================
add('cat', '🐱 แมว', 'animals', 'wiggle', 2, [
  p('tail', 'M 560 650 C 700 660 730 540 690 470 C 760 520 770 700 600 735 Z'),
  e('body', 400, 635, 185, 150),
  p('ear-l', 'M 235 290 L 205 100 L 365 195 Z'), p('ear-r', 'M 565 290 L 595 100 L 435 195 Z'),
  c('head', 400, 375, 200),
  e('muzzle', 400, 450, 85, 60),
  e('paw-l', 320, 745, 70, 38), e('paw-r', 480, 745, 70, 38),
  ...eyes(325, 475, 350, 17), dk('M 380 420 L 420 420 L 400 445 Z'),
  ln('M 400 445 Q 380 475 355 465', 5), ln('M 400 445 Q 420 475 445 465', 5),
  ln('M 270 440 L 150 420', 5), ln('M 270 465 L 150 480', 5), ln('M 530 440 L 650 420', 5), ln('M 530 465 L 650 480', 5),
  ln('M 360 200 L 365 240', 8), ln('M 400 190 L 400 235', 8), ln('M 440 200 L 435 240', 8),
]);
add('dog', '🐶 หมา', 'animals', 'wiggle', 2, [
  e('body', 400, 650, 175, 140),
  p('ear-l', 'M 240 240 C 120 230 100 400 150 500 C 240 490 285 390 290 290 Z'),
  p('ear-r', 'M 560 240 C 680 230 700 400 650 500 C 560 490 515 390 510 290 Z'),
  e('head', 400, 365, 175, 165),
  c('patch', 485, 320, 55),
  e('muzzle', 400, 450, 105, 80),
  p('tongue', 'M 365 505 L 435 505 L 435 580 Q 400 620 365 580 Z'),
  e('paw-l', 330, 765, 65, 30), e('paw-r', 470, 765, 65, 30),
  ...eyes(330, 470, 345, 17), ed(400, 440, 34, 24), ln('M 400 460 L 400 505', 5),
  ln('M 400 505 Q 370 520 345 495', 5), ln('M 400 505 Q 430 520 455 495', 5),
]);
add('rabbit', '🐰 กระต่าย', 'animals', 'hop', 2, [
  e('ear-l', 320, 170, 68, 160), e('ear-r', 480, 170, 68, 160),
  e('in-l', 320, 185, 34, 105), e('in-r', 480, 185, 34, 105),
  c('tail', 625, 680, 55),
  e('body', 400, 620, 195, 160),
  e('belly', 400, 640, 115, 105),
  e('head', 400, 395, 165, 140),
  e('foot-l', 290, 750, 90, 38), e('foot-r', 510, 750, 90, 38),
  ...eyes(335, 465, 380, 16), dk('M 380 425 L 420 425 L 400 450 Z'), ln('M 400 450 L 400 470', 5),
  ln('M 400 470 Q 375 490 355 470', 5), ln('M 400 470 Q 425 490 445 470', 5),
]);
add('dino', '🦕 ไดโนเสาร์คอยาว', 'wild', 'bounce', 3, [
  p('tail', 'M 580 500 C 660 510 730 480 775 420 C 775 530 700 610 585 610 Z'),
  rc('leg-1', 250, 590, 90, 170, 38), rc('leg-2', 350, 600, 90, 160, 38), rc('leg-3', 470, 600, 90, 160, 38), rc('leg-4', 570, 590, 90, 170, 38),
  poly('plate-1', [[330, 350], [375, 260], [420, 345]]), poly('plate-2', [[420, 340], [470, 255], [515, 345]]), poly('plate-3', [[510, 350], [555, 275], [595, 360]]),
  e('body', 420, 500, 250, 150),
  p('neck', 'M 230 500 C 180 380 170 280 190 190 L 300 185 C 290 290 320 380 370 450 Z'),
  e('head', 235, 150, 110, 70),
  dot(200, 135, 14), ln('M 150 170 Q 180 190 215 175', 5),
  c('spot-1', 400, 500, 38), c('spot-2', 500, 540, 34),
]);
add('unicorn', '🦄 ยูนิคอร์น', 'animals', 'glow', 2, [
  p('tail', 'M 640 440 C 740 450 790 560 730 700 C 690 640 710 560 635 520 Z'),
  rc('leg-1', 280, 570, 62, 185, 28), rc('leg-2', 370, 580, 62, 175, 28), rc('leg-3', 500, 580, 62, 175, 28), rc('leg-4', 590, 570, 62, 185, 28),
  e('body', 450, 490, 230, 135),
  p('mane', 'M 300 150 C 200 200 190 330 230 470 L 330 470 C 300 360 320 260 370 200 Z'),
  p('neck', 'M 270 480 C 250 370 255 280 290 200 L 400 240 C 380 310 400 400 440 480 Z'),
  p('head', 'M 150 190 C 150 120 240 100 320 125 C 380 150 390 230 340 270 C 290 300 190 290 150 230 Z'),
  poly('horn', [[215, 125], [255, 15], [295, 120]]),
  poly('ear', [[300, 125], [345, 65], [365, 145]]),
  dot(255, 180, 13), ln('M 160 235 Q 190 255 225 245', 5),
]);
add('elephant', '🐘 ช้าง', 'wild', 'bounce', 2, [
  rc('leg-1', 290, 570, 100, 190, 40), rc('leg-2', 400, 585, 100, 175, 40), rc('leg-3', 520, 585, 100, 175, 40), rc('leg-4', 620, 570, 100, 190, 40),
  e('body', 480, 470, 250, 180),
  c('head', 220, 380, 135),
  p('trunk', 'M 125 430 C 70 520 60 620 100 710 C 135 740 185 715 170 675 C 140 600 160 530 205 480 Z'),
  e('ear', 315, 365, 90, 135),
  p('tusk', 'M 160 500 C 105 520 85 560 100 600 C 130 565 165 545 195 520 Z'),
  dot(215, 345, 14), ln('M 725 420 Q 780 470 760 560', 8),
]);
add('turtle', '🐢 เต่า', 'animals', 'bounce', 2, [
  e('leg-1', 340, 610, 65, 55), e('leg-2', 590, 610, 65, 55), p('tail', 'M 730 540 L 790 600 L 715 580 Z'),
  p('neck', 'M 230 480 L 150 380 L 270 400 Z'),
  c('head', 150, 400, 85),
  p('shell', 'M 200 540 C 190 290 320 210 470 210 C 620 210 740 300 730 540 Z'),
  c('hex-c', 465, 380, 80), c('hex-l', 320, 440, 62), c('hex-r', 615, 440, 62), c('hex-t', 465, 255, 38),
  rc('rim', 190, 530, 560, 70, 35),
  dot(125, 385, 12), smile(150, 435, 22),
]);
add('lotus', '🪷 ดอกบัว', 'thai', 'glow', 2, [
  e('pond', 400, 715, 360, 60),
  p('out-l', 'M 400 600 C 220 630 90 530 60 420 C 170 440 330 490 400 600 Z'),
  p('out-r', 'M 400 600 C 580 630 710 530 740 420 C 630 440 470 490 400 600 Z'),
  p('mid-l', 'M 400 590 C 250 570 130 420 170 270 C 280 320 360 430 400 590 Z'),
  p('mid-r', 'M 400 590 C 550 570 670 420 630 270 C 520 320 440 430 400 590 Z'),
  p('mid', 'M 400 150 C 285 290 285 450 400 590 C 515 450 515 290 400 150 Z'),
  e('pad-l', 130, 700, 100, 36), e('pad-r', 670, 700, 100, 36),
]);
add('fruits', '🍇 ผลไม้', 'food', 'bounce', 2, [
  c('apple', 150, 290, 105), p('apple-leaf', 'M 150 190 C 170 130 230 120 255 145 C 230 195 190 205 150 190 Z'),
  c('orange', 650, 290, 105),
  c('g1', 350, 200, 45), c('g2', 450, 200, 45), c('g3', 300, 290, 45), c('g4', 400, 290, 45), c('g5', 500, 290, 45), c('g6', 350, 380, 45), c('g7', 450, 380, 45), c('g8', 400, 465, 45),
  ln('M 400 160 Q 410 100 450 80', 10),
  p('banana', 'M 100 570 C 180 730 440 790 700 610 C 725 570 705 540 690 535 C 560 640 340 640 190 505 C 140 505 95 530 100 570 Z'),
  ln('M 150 295 L 150 260', 5),
]);
add('firetruck', '🚒 รถดับเพลิง', 'vehicles', 'drive', 2, [
  rc('box', 80, 390, 400, 170, 15),
  rc('ladder', 100, 300, 350, 68, 12),
  rc('cab', 480, 340, 230, 220, 30),
  rc('cab-win', 520, 370, 150, 95, 14),
  rc('siren', 570, 285, 90, 50, 20),
  ...wheel('wheel-1', 210, 590, 80), ...wheel('wheel-2', 590, 590, 80),
  ln('M 150 300 L 150 368', 6), ln('M 220 300 L 220 368', 6), ln('M 290 300 L 290 368', 6), ln('M 360 300 L 360 368', 6),
  rc('bumper', 690, 520, 50, 40, 10),
]);
add('tuktuk', '🛺 ตุ๊กตุ๊ก', 'thai', 'drive', 2, [
  ln('M 230 350 L 230 290', 10), ln('M 590 350 L 590 290', 10),
  p('roof', 'M 170 300 Q 400 210 630 300 L 610 355 L 190 355 Z'),
  rc('cabin', 210, 355, 390, 150, 10),
  rc('windshield', 235, 380, 150, 100, 10), rc('seat', 415, 385, 160, 105, 18),
  p('body', 'M 160 500 L 620 500 L 645 565 L 150 565 Z'),
  c('light', 175, 535, 34),
  ...wheel('wheel-f', 235, 625, 72), ...wheel('wheel-b', 525, 625, 72),
  poly('flag', [[400, 215], [480, 170], [480, 250]]),
]);
add('lambo', '🏎️ รถแลมโบ', 'vehicles', 'drive', 2, [
  p('body', 'M 60 560 C 60 510 90 495 150 485 L 330 425 C 400 395 500 395 570 425 L 720 480 C 765 495 775 530 765 565 L 60 570 Z'),
  p('window', 'M 345 440 C 410 405 480 405 545 440 L 490 485 L 335 485 Z'),
  p('door', 'M 320 495 L 510 495 L 520 555 L 310 555 Z'),
  p('spoiler', 'M 55 440 L 130 440 L 120 480 L 55 485 Z'),
  ...wheel('wheel-f', 205, 590, 72), ...wheel('wheel-r', 610, 590, 72),
  dk('M 700 500 L 745 505 L 740 525 L 695 520 Z'),
]);
add('ferrari', '🏎️ รถเฟอร์รารี่', 'vehicles', 'drive', 2, [
  p('body', 'M 65 565 C 60 500 130 480 205 470 C 265 410 340 395 420 400 C 520 405 580 445 620 475 C 710 485 765 510 760 565 Z'),
  p('window', 'M 285 465 C 320 425 380 415 430 420 C 490 425 535 445 565 475 Z'),
  ln('M 95 535 L 745 535', 12), ln('M 440 495 L 520 495', 10), ln('M 440 515 L 520 515', 10),
  ...wheel('wheel-f', 215, 590, 72), ...wheel('wheel-r', 610, 590, 72),
  dk('M 690 500 L 745 515 L 735 535 L 685 525 Z'),
]);
add('f1car', '🏁 รถแข่งเอฟวัน', 'vehicles', 'drive', 2, [
  p('rwing', 'M 650 380 L 770 380 L 770 450 L 650 450 Z'),
  rc('rpost', 690, 450, 40, 80, 8),
  p('nose', 'M 40 545 L 260 505 L 260 575 L 40 578 Z'),
  p('body', 'M 230 470 L 560 450 L 650 520 L 650 585 L 230 585 Z'),
  p('cover', 'M 440 455 L 580 450 L 640 520 L 440 520 Z'),
  c('helmet', 400, 440, 48),
  p('fwing', 'M 20 575 L 150 575 L 150 620 L 20 620 Z'),
  ...wheel('wheel-f', 195, 600, 78), ...wheel('wheel-r', 575, 590, 98),
  ln('M 345 440 L 455 440', 6),
]);
add('porsche', '🚗 รถกลม', 'vehicles', 'drive', 2, [
  p('body', 'M 75 565 C 55 485 130 465 180 455 C 230 360 340 340 440 345 C 545 350 605 405 645 455 C 725 465 755 510 745 565 Z'),
  p('window', 'M 250 455 C 285 390 355 375 430 380 C 505 385 540 425 575 455 Z'),
  p('door', 'M 400 470 L 560 470 L 560 540 L 400 540 Z'),
  rc('bumper', 70, 530, 85, 40, 14),
  ...wheel('wheel-f', 205, 590, 72), ...wheel('wheel-r', 610, 590, 72),
  dk('M 655 485 L 705 490 L 700 515 L 650 510 Z'), ln('M 395 470 L 395 560', 5),
]);
add('fish', '🐟 ปลา', 'sea', 'swim', 2, [
  p('tail', 'M 580 400 C 650 320 720 300 745 235 C 775 350 775 450 745 565 C 715 490 650 470 580 400 Z'),
  p('fin-top', 'M 280 270 C 300 170 430 140 520 210 C 450 215 390 240 340 285 Z'),
  p('fin-bot', 'M 330 540 C 340 610 410 650 470 640 C 450 600 430 570 410 540 Z'),
  e('body', 380, 410, 225, 160),
  band('stripe-1', 380, 410, 225, 160, 330, 380), band('stripe-2', 380, 410, 225, 160, 430, 480),
  p('gill', 'M 250 330 C 220 380 220 440 250 490 C 285 440 285 380 250 330 Z'),
  ringd(195, 370, 26), dot(195, 370, 11),
  c('bub-1', 130, 250, 42), c('bub-2', 80, 160, 30),
]);
add('house', '🏠 บ้าน', 'misc', 'bounce', 2, [
  c('sun', 690, 130, 70), e('ground', 400, 740, 400, 55),
  rc('chimney', 495, 220, 75, 150),
  rc('wall', 220, 380, 360, 310),
  poly('roof', [[170, 395], [400, 190], [630, 395]]),
  rc('door', 350, 520, 100, 170, 12), dot(425, 610, 9),
  rc('win-l', 255, 430, 85, 85, 8), rc('win-r', 465, 430, 85, 85, 8),
  ln('M 297 430 L 297 515', 5), ln('M 255 472 L 340 472', 5), ln('M 507 430 L 507 515', 5), ln('M 465 472 L 550 472', 5),
  c('bush-l', 160, 690, 50), c('bush-r', 650, 690, 50),
]);
add('flower', '🌼 ดอกไม้', 'nature', 'glow', 2, [
  e('ground', 400, 755, 330, 38),
  p('stem', 'M 380 450 Q 380 600 380 750 L 420 750 Q 420 600 420 450 Z'),
  p('leaf-l', 'M 380 600 Q 250 570 215 670 Q 320 680 380 640 Z'),
  p('leaf-r', 'M 420 620 Q 550 590 585 690 Q 480 700 420 660 Z'),
  c('petal-1', 400, 230, 90), c('petal-2', 515, 305, 90), c('petal-3', 515, 440, 90),
  c('petal-4', 400, 515, 90), c('petal-5', 285, 440, 90), c('petal-6', 285, 305, 90),
  c('center', 400, 372, 78),
  ...eyes(375, 425, 360, 9), smile(400, 392, 20),
]);
add('lion', '🦁 สิงโต', 'wild', 'wiggle', 1, [
  c('ear-l', 240, 175, 65), c('ear-r', 560, 175, 65),
  c('mane', 400, 410, 290),
  e('face', 400, 440, 175, 165),
  e('muzzle', 400, 520, 100, 70),
  ...eyes(335, 465, 400, 17), dk('M 370 470 L 430 470 L 400 505 Z'),
  ln('M 400 505 L 400 530', 5), ln('M 400 530 Q 370 560 345 540', 5), ln('M 400 530 Q 430 560 455 540', 5),
]);
add('monkey', '🐵 ลิง', 'wild', 'bounce', 2, [
  p('tail', 'M 560 690 C 700 690 760 600 710 510 C 790 560 800 730 590 770 Z'),
  e('body', 400, 690, 170, 100),
  c('ear-l', 190, 400, 75), c('ear-r', 610, 400, 75),
  c('head', 400, 380, 195),
  e('face', 400, 435, 140, 120),
  e('muzzle', 400, 500, 80, 55),
  p('banana', 'M 600 640 C 640 700 720 720 780 690 C 790 670 780 660 770 660 C 720 685 665 670 635 620 Z'),
  ...eyes(340, 460, 410, 15), ed(400, 490, 18, 12), smile(400, 520, 30),
]);
add('owl', '🦉 นกฮูก', 'animals', 'wiggle', 2, [
  rc('branch', 50, 705, 700, 55, 27),
  p('tuft-l', 'M 240 210 L 210 100 L 330 160 Z'), p('tuft-r', 'M 560 210 L 590 100 L 470 160 Z'),
  e('body', 400, 450, 200, 270),
  p('wing-l', 'M 215 380 C 110 440 120 640 205 710 C 260 630 270 500 250 410 Z'),
  p('wing-r', 'M 585 380 C 690 440 680 640 595 710 C 540 630 530 500 550 410 Z'),
  e('belly', 400, 560, 125, 150),
  c('eye-l', 320, 340, 82), c('eye-r', 480, 340, 82),
  dot(320, 340, 30), dot(480, 340, 30),
  p('beak', 'M 365 395 L 435 395 L 400 475 Z'),
  e('foot-l', 330, 710, 55, 25), e('foot-r', 470, 710, 55, 25),
]);
add('bee', '🐝 ผึ้ง', 'animals', 'fly', 2, [
  p('wing-1', 'M 330 320 C 250 190 320 70 400 110 C 430 190 410 260 380 330 Z'),
  p('wing-2', 'M 410 320 C 440 200 540 130 600 170 C 600 260 500 320 430 340 Z'),
  poly('sting', [[110, 470], [20, 500], [110, 520]]),
  e('body', 330, 480, 230, 165),
  band('stripe-1', 330, 480, 230, 165, 250, 320), band('stripe-2', 330, 480, 230, 165, 390, 460),
  c('head', 600, 470, 100),
  dot(630, 445, 14), smile(615, 505, 28),
  ln('M 560 385 Q 540 330 500 320', 6), ln('M 640 385 Q 660 330 700 330', 6),
]);
add('ladybug', '🐞 เต่าทอง', 'animals', 'hop', 2, [
  e('head', 400, 190, 125, 90),
  p('shell-l', 'M 400 190 C 250 190 150 300 150 440 C 150 580 250 700 400 700 Z'),
  p('shell-r', 'M 400 190 C 550 190 650 300 650 440 C 650 580 550 700 400 700 Z'),
  c('spot-1', 280, 340, 48), c('spot-2', 520, 340, 48), c('spot-3', 270, 520, 52), c('spot-4', 530, 520, 52),
  ...eyes(360, 440, 175, 14), ln('M 350 110 Q 320 60 280 60', 6), ln('M 450 110 Q 480 60 520 60', 6),
]);
add('frog', '🐸 กบ', 'animals', 'hop', 2, [
  e('pad', 400, 745, 340, 42),
  e('foot-l', 175, 700, 95, 42), e('foot-r', 625, 700, 95, 42),
  e('body', 400, 570, 240, 180),
  e('belly', 400, 630, 130, 90),
  e('head', 400, 400, 225, 155),
  c('eye-l', 290, 270, 82), c('eye-r', 510, 270, 82),
  dot(290, 275, 28), dot(510, 275, 28),
  ln('M 215 440 Q 400 560 585 440', 7), dot(370, 380, 7), dot(430, 380, 7),
]);
add('cow', '🐮 วัว', 'animals', 'wiggle', 2, [
  p('horn-l', 'M 285 250 C 235 210 215 150 235 100 C 290 135 330 190 340 245 Z'),
  p('horn-r', 'M 515 250 C 565 210 585 150 565 100 C 510 135 470 190 460 245 Z'),
  e('ear-l', 175, 340, 95, 50), e('ear-r', 625, 340, 95, 50),
  e('head', 400, 400, 190, 215),
  c('patch-l', 300, 310, 60), c('patch-r', 520, 280, 55),
  e('muzzle', 400, 570, 140, 95),
  ...eyes(325, 475, 380, 16), ed(355, 570, 17, 24), ed(445, 570, 17, 24),
]);
add('bear', '🐻 หมี', 'wild', 'wiggle', 2, [
  e('body', 400, 690, 235, 105),
  c('ear-l', 235, 195, 80), c('ear-r', 565, 195, 80),
  c('in-l', 235, 200, 40), c('in-r', 565, 200, 40),
  c('head', 400, 400, 215),
  e('muzzle', 400, 480, 115, 90),
  e('belly', 400, 710, 135, 75),
  ...eyes(325, 475, 360, 17), ed(400, 450, 38, 26), ln('M 400 475 L 400 510', 5),
  ln('M 400 510 Q 365 535 340 510', 5), ln('M 400 510 Q 435 535 460 510', 5),
]);
add('crab', '🦀 ปู', 'sea', 'waddle', 2, [
  ln('M 220 540 L 120 600 L 100 690', 16), ln('M 250 590 L 170 670 L 160 750', 16), ln('M 580 540 L 680 600 L 700 690', 16), ln('M 550 590 L 630 670 L 640 750', 16),
  ln('M 270 430 Q 170 380 150 300', 22), ln('M 530 430 Q 630 380 650 300', 22),
  c('claw-l', 140, 235, 100), c('claw-r', 660, 235, 100),
  dk('M 80 120 L 135 215 L 40 205 Z'), dk('M 720 120 L 665 215 L 760 205 Z'),
  e('body', 400, 500, 235, 160),
  ln('M 340 360 L 335 300', 8), ln('M 460 360 L 465 300', 8),
  c('eye-l', 335, 270, 38), c('eye-r', 465, 270, 38), dot(335, 272, 14), dot(465, 272, 14),
  smile(400, 480, 55),
]);
add('octopus', '🐙 หมึกยักษ์', 'sea', 'sway', 2, [
  p('t1', 'M 230 400 C 130 500 100 620 150 710 C 200 775 280 735 260 655 C 245 580 290 500 330 430 Z'),
  p('t2', 'M 330 430 C 300 550 320 650 350 720 C 390 780 470 750 450 690 C 425 620 430 540 450 430 Z'),
  p('t3', 'M 470 430 C 490 550 480 650 455 720 C 480 780 560 780 560 700 C 550 620 560 540 570 430 Z'),
  p('t4', 'M 570 400 C 670 500 700 620 650 710 C 600 775 520 735 540 655 C 555 580 510 500 470 430 Z'),
  e('head', 400, 300, 215, 215),
  ringd(325, 300, 38), ringd(475, 300, 38), dot(325, 305, 18), dot(475, 305, 18),
  smile(400, 400, 45), c('cheek-l', 235, 380, 36), c('cheek-r', 565, 380, 36),
]);
add('whale', '🐳 วาฬ', 'sea', 'swim', 2, [
  p('tail', 'M 600 450 C 690 430 740 370 725 280 C 790 320 795 420 745 480 C 795 530 785 610 715 650 C 735 570 685 510 600 500 Z'),
  e('body', 370, 480, 305, 195),
  e('belly', 360, 575, 235, 85),
  p('fin', 'M 330 560 C 360 650 440 690 500 670 C 480 615 430 570 390 540 Z'),
  dot(185, 430, 15), ln('M 110 520 Q 180 570 260 540', 7),
  ln('M 330 285 L 330 195', 12), drop('spray-1', 255, 140), drop('spray-2', 330, 95), drop('spray-3', 405, 140),
  p('sea', 'M 20 725 Q 120 690 220 725 Q 320 760 420 725 Q 520 690 620 725 Q 700 750 780 725 L 780 790 L 20 790 Z'),
]);
add('jellyfish', '🪼 แมงกะพรุน', 'sea', 'swim', 1, [
  ln('M 270 410 Q 230 500 280 570 Q 320 640 270 720', 14), ln('M 350 430 Q 320 520 360 590 Q 395 660 350 750', 14),
  ln('M 450 430 Q 480 520 440 590 Q 405 660 450 750', 14), ln('M 530 410 Q 570 500 520 570 Q 480 640 530 720', 14),
  p('dome', 'M 150 420 C 150 100 650 100 650 420 Q 590 465 525 420 Q 462 470 400 420 Q 338 470 275 420 Q 210 465 150 420 Z'),
  c('spot-1', 300, 270, 55), c('spot-2', 500, 270, 55), c('spot-3', 400, 190, 45),
  ...eyes(340, 460, 340, 12), smile(400, 365, 28),
]);
// ===================== LEVEL 3 + more scenes =====================
add('castle', '🏰 ปราสาท', 'misc', 'glow', 3, [
  c('sun', 690, 110, 65), e('ground', 400, 752, 390, 42),
  rc('wall', 220, 450, 360, 250),
  rc('tower-l', 120, 330, 140, 370), rc('tower-r', 540, 330, 140, 370),
  rc('keep', 300, 250, 200, 450),
  poly('roof-l', [[105, 335], [190, 190], [275, 335]]), poly('roof-r', [[525, 335], [610, 190], [695, 335]]),
  poly('roof-c', [[285, 255], [400, 100], [515, 255]]),
  p('gate', 'M 340 700 L 340 570 Q 400 490 460 570 L 460 700 Z'),
  rc('win-c', 365, 330, 70, 100, 35), rc('win-l', 165, 420, 55, 90, 27), rc('win-r', 580, 420, 55, 90, 27),
  ln('M 400 100 L 400 30', 6), poly('flag', [[403, 30], [490, 58], [403, 86]]),
  ln('M 250 480 L 250 520', 6), ln('M 550 480 L 550 520', 6),
]);
add('farm', '🚜 ฟาร์ม', 'misc', 'bounce', 3, [
  c('sun', 690, 110, 65), e('cloud', 400, 130, 110, 42),
  rc('field', 0, 600, 800, 200),
  rc('barn', 90, 380, 310, 230),
  p('barn-roof', 'M 70 395 L 150 270 L 340 270 L 420 395 Z'),
  rc('door', 195, 470, 100, 140, 6), ln('M 195 470 L 295 610', 6), ln('M 295 470 L 195 610', 6),
  rc('silo', 440, 310, 110, 300), p('silo-top', 'M 440 315 C 440 220 550 220 550 315 Z'),
  rc('trunk', 640, 440, 44, 170), c('crown', 662, 380, 95),
  rc('fence-1', 40, 640, 60, 110, 8), rc('fence-2', 140, 640, 60, 110, 8), rc('fence-3', 240, 640, 60, 110, 8),
  c('hay', 560, 700, 55),
]);
add('undersea', '🌊 ใต้ทะเล', 'sea', 'swim', 3, [
  e('sand', 400, 758, 390, 40),
  p('weed-1', 'M 110 790 C 60 690 160 610 110 510 C 80 450 130 390 120 330 L 175 340 C 185 400 135 450 165 510 C 215 600 115 700 175 790 Z'),
  p('weed-2', 'M 640 790 C 590 690 690 610 640 510 C 610 450 660 390 650 330 L 705 340 C 715 400 665 450 695 510 C 745 600 645 700 705 790 Z'),
  poly('tail-1', [[370, 260], [450, 200], [450, 320]]), e('fish-1', 275, 260, 100, 65),
  poly('tail-2', [[440, 460], [370, 400], [370, 520]]), e('fish-2', 530, 460, 90, 58),
  starShape('starfish', 400, 690, 95, 40),
  c('shell', 540, 725, 48),
  c('bub-1', 150, 190, 36), c('bub-2', 215, 105, 30), c('bub-3', 640, 220, 34),
  dot(225, 245, 11), dot(575, 445, 10), ln('M 235 230 Q 220 260 235 290', 5),
  p('coral', 'M 260 790 C 250 720 290 700 280 640 C 300 620 320 640 310 690 C 340 660 370 680 340 720 C 330 750 340 770 340 790 Z'),
]);
add('space', '🚀 อวกาศ', 'nature', 'spin', 2, [
  starShape('star-1', 420, 90, 55, 24), starShape('star-2', 710, 520, 55, 24), starShape('star-3', 80, 450, 55, 24),
  c('moon', 160, 230, 95),
  c('planet', 570, 250, 125),
  { id: 'ring', shape: 'ellipse', cx: 570, cy: 250, rx: 210, ry: 46, fill: 'none', stroke: INK, strokeWidth: 8, noClick: true },
  c('earth', 270, 640, 130),
  e('saucer', 600, 610, 130, 42), p('dome', 'M 520 600 C 520 520 680 520 680 600 Z'), dot(600, 565, 20),
  dot(130, 200, 10), dot(190, 270, 8), dot(240, 590, 12), dot(320, 690, 10),
]);
add('pavilion', '🛖 ศาลาไทย', 'thai', 'glow', 3, [
  e('pond', 400, 750, 380, 40),
  rc('floor', 110, 660, 580, 60, 6),
  rc('wall', 230, 470, 340, 190),
  rc('post-1', 140, 470, 48, 195), rc('post-2', 235, 470, 48, 195), rc('post-3', 517, 470, 48, 195), rc('post-4', 612, 470, 48, 195),
  p('roof-main', 'M 70 430 C 230 425 330 360 400 240 C 470 360 570 425 730 430 L 690 485 L 110 485 Z'),
  p('roof-top', 'M 290 270 C 350 250 385 190 400 80 C 415 190 450 250 510 270 L 490 310 L 310 310 Z'),
  poly('gable', [[330, 400], [470, 400], [400, 300]]),
  rc('step-1', 340, 715, 120, 40, 8),
  c('lotus', 130, 760, 28),
  ln('M 70 430 Q 40 400 60 370', 8), ln('M 730 430 Q 760 400 740 370', 8),
]);
add('krathong', '🪷 กระทงลอยน้ำ', 'thai', 'sway', 2, [
  c('moon', 650, 140, 72),
  e('water', 400, 735, 390, 48),
  e('base', 400, 625, 310, 105),
  p('pl-l', 'M 400 570 C 270 570 170 480 200 370 C 290 410 360 470 400 570 Z'),
  p('pl-r', 'M 400 570 C 530 570 630 480 600 370 C 510 410 440 470 400 570 Z'),
  p('pl-c', 'M 400 570 C 330 480 330 350 400 250 C 470 350 470 480 400 570 Z'),
  rc('candle', 375, 175, 50, 110, 8), p('flame', 'M 400 40 C 450 100 450 150 400 172 C 350 150 350 100 400 40 Z'),
  ln('M 250 640 L 250 700', 6), ln('M 550 640 L 550 700', 6),
]);
add('kite', '🪁 ว่าว', 'thai', 'fly', 1, [
  poly('k1', [[400, 60], [620, 330], [400, 330]]), poly('k2', [[620, 330], [400, 600], [400, 330]]),
  poly('k3', [[400, 600], [180, 330], [400, 330]]), poly('k4', [[180, 330], [400, 60], [400, 330]]),
  ln('M 400 600 Q 330 650 400 690 Q 470 730 400 790', 6),
  dk('M 365 655 L 365 690 L 395 672 Z'), dk('M 435 700 L 435 735 L 405 717 Z'),
]);
add('police', '🚓 รถตำรวจ', 'jobs', 'drive', 2, [
  p('body', 'M 70 570 L 70 490 Q 80 450 150 440 L 250 400 Q 300 350 370 350 L 500 350 Q 570 360 610 430 L 690 450 Q 740 470 740 520 L 740 570 Z'),
  rc('win-1', 290, 385, 100, 62, 8), rc('win-2', 410, 385, 100, 62, 8),
  rc('siren', 380, 295, 90, 56, 20),
  rc('door', 300, 470, 200, 80, 10),
  ...wheel('wheel-1', 210, 590, 75), ...wheel('wheel-2', 590, 590, 75),
  ln('M 70 520 L 740 520', 10), dot(715, 500, 14),
]);
add('ambulance', '🚑 รถพยาบาล', 'jobs', 'drive', 2, [
  rc('box', 80, 320, 410, 250, 25),
  p('cab', 'M 490 380 L 600 380 Q 650 400 690 470 L 715 570 L 490 570 Z'),
  p('cab-win', 'M 520 405 L 595 405 Q 630 420 655 470 L 520 470 Z'),
  poly('cross', [[255, 365], [325, 365], [325, 405], [365, 405], [365, 475], [325, 475], [325, 515], [255, 515], [255, 475], [215, 475], [215, 405], [255, 405]]),
  rc('siren', 250, 275, 90, 50, 20),
  ...wheel('wheel-1', 200, 590, 78), ...wheel('wheel-2', 590, 590, 78),
]);
add('airplane', '✈️ เครื่องบิน', 'vehicles', 'fly', 2, [
  e('cloud-1', 150, 650, 120, 48), e('cloud-2', 640, 160, 130, 52),
  p('wing-b', 'M 430 380 L 520 380 L 480 250 L 410 250 Z'),
  p('tail', 'M 130 395 L 80 240 L 190 240 L 240 395 Z'),
  rc('body', 80, 370, 640, 110, 55),
  p('cockpit', 'M 610 385 Q 690 380 705 425 L 610 425 Z'),
  p('wing', 'M 310 440 L 480 440 L 400 640 L 290 640 Z'),
  ringd(220, 425, 26), ringd(300, 425, 26), ringd(380, 425, 26), ringd(460, 425, 26), ringd(540, 425, 26),
  ln('M 100 455 L 700 455', 8),
]);
add('helicopter', '🚁 เฮลิคอปเตอร์', 'vehicles', 'fly', 2, [
  e('cloud-1', 130, 650, 110, 42), e('cloud-2', 660, 200, 110, 42),
  ln('M 110 290 L 610 290', 14), ln('M 360 290 L 360 340', 14),
  p('tail', 'M 520 440 L 730 400 L 755 450 L 520 520 Z'),
  poly('fin', [[690, 405], [735, 310], [790, 325], [750, 445]]),
  e('body', 350, 470, 205, 135),
  p('window', 'M 200 430 Q 230 380 310 390 L 310 480 L 180 490 Z'),
  ln('M 150 640 L 560 640', 14), ln('M 270 590 L 270 640', 12), ln('M 450 590 L 450 640', 12),
  c('door', 430, 470, 55),
]);
add('tractor', '🚜 รถแทรกเตอร์', 'jobs', 'drive', 2, [
  c('sun', 670, 120, 65), e('ground', 400, 755, 390, 38),
  rc('hood', 430, 400, 280, 135, 22),
  rc('cab', 170, 250, 270, 310, 28),
  rc('cab-win', 205, 285, 200, 150, 15),
  ln('M 660 400 L 660 290', 22),
  ...wheel('wheel-b', 270, 590, 150), ...wheel('wheel-f', 630, 640, 95),
]);
{
  const pent = (cx, cy, R, rot) => Array.from({ length: 5 }, (_, i) => { const a = (rot + i * 72) * Math.PI / 180; return [Math.round(cx + R * Math.cos(a)), Math.round(cy + R * Math.sin(a))]; });
  const parts = [c('ball', 400, 400, 300), poly('mid', pent(400, 400, 105, -90))];
  const lines = [];
  for (let i = 0; i < 5; i++) {
    const a = (-90 + i * 72) * Math.PI / 180;
    parts.push(poly('p' + i, pent(Math.round(400 + 215 * Math.cos(a)), Math.round(400 + 215 * Math.sin(a)), 62, -90 + i * 72)));
    const x0 = Math.round(400 + 105 * Math.cos(a)), y0 = Math.round(400 + 105 * Math.sin(a));
    const x1 = Math.round(400 + 152 * Math.cos(a)), y1 = Math.round(400 + 152 * Math.sin(a));
    lines.push(ln(`M ${x0} ${y0} L ${x1} ${y1}`, 6));
  }
  add('soccer', '⚽ ฟุตบอล', 'sport', 'bounce', 2, [...parts, ...lines]);
}
add('trophy', '🏆 ถ้วยรางวัล', 'sport', 'glow', 1, [
  p('handle-l', 'M 235 190 C 90 190 90 400 270 420 L 280 365 C 180 350 175 260 245 255 Z'),
  p('handle-r', 'M 565 190 C 710 190 710 400 530 420 L 520 365 C 620 350 625 260 555 255 Z'),
  p('cup', 'M 220 130 L 580 130 C 580 350 520 500 400 530 C 280 500 220 350 220 130 Z'),
  rc('stem', 355, 520, 90, 120, 6), rc('base', 260, 640, 280, 90, 14),
  starShape('star', 400, 290, 100, 44),
]);
add('bicycle', '🚲 จักรยาน', 'sport', 'drive', 2, [
  c('tire-b', 205, 540, 160), c('rim-b', 205, 540, 125),
  c('tire-f', 595, 540, 160), c('rim-f', 595, 540, 125),
  ln('M 205 540 L 315 310 L 400 540 L 205 540', 14), ln('M 315 310 L 535 330 L 400 540', 14), ln('M 535 330 L 595 540', 14),
  ln('M 535 330 L 515 265 L 575 250', 14), ln('M 315 310 L 310 270', 14),
  p('seat', 'M 255 255 L 365 255 L 350 295 L 270 295 Z'),
  rc('basket', 590, 215, 130, 85, 12),
  dot(205, 540, 14), dot(595, 540, 14), dot(400, 540, 16),
]);
add('gift', '🎁 ของขวัญ', 'misc', 'bounce', 1, [
  rc('box', 170, 380, 460, 330, 14), rc('lid', 140, 290, 520, 110, 14),
  rc('ribbon', 360, 290, 80, 420, 6),
  e('loop-l', 300, 215, 105, 62), e('loop-r', 500, 215, 105, 62), c('knot', 400, 255, 48),
]);
add('crown', '👑 มงกุฎ', 'misc', 'glow', 1, [
  p('crown', 'M 130 640 L 90 250 L 270 400 L 400 160 L 530 400 L 710 250 L 670 640 Z'),
  rc('band', 115, 590, 570, 115, 14),
  c('jewel-c', 400, 420, 58), c('jewel-l', 235, 510, 46), c('jewel-r', 565, 510, 46),
  ringd(90, 235, 34), ringd(400, 150, 34), ringd(710, 235, 34),
]);
add('tent', '⛺ เต็นท์ตั้งแคมป์', 'nature', 'wiggle', 2, [
  c('moon', 640, 120, 62), starShape('star-1', 140, 130, 48, 21), starShape('star-2', 330, 90, 42, 18), starShape('star-3', 490, 190, 42, 18),
  e('ground', 400, 750, 390, 42),
  p('tent', 'M 140 700 L 380 220 L 620 700 Z'),
  poly('door', [[380, 400], [305, 700], [455, 700]]),
  ln('M 640 720 L 720 690', 14), ln('M 720 720 L 640 690', 14),
  p('flame', 'M 680 670 C 640 620 650 570 690 520 C 700 570 750 580 735 640 C 730 660 710 670 680 670 Z'),
]);
add('lighthouse', '🗼 ประภาคาร', 'misc', 'shimmer', 2, [
  poly('beam-l', [[345, 245], [30, 150], [30, 340]]), poly('beam-r', [[455, 245], [770, 150], [770, 340]]),
  e('rock', 400, 745, 320, 55),
  p('tower', 'M 320 740 L 350 280 L 450 280 L 480 740 Z'),
  poly('stripe-1', [[339, 440], [461, 440], [466, 520], [334, 520]]), poly('stripe-2', [[328, 600], [472, 600], [477, 680], [323, 680]]),
  rc('lamp', 340, 195, 120, 85, 10), poly('roof', [[325, 200], [400, 115], [475, 200]]),
  ln('M 330 285 L 470 285', 12),
  p('wave', 'M 20 740 Q 90 710 160 740 Q 230 770 300 740 L 300 790 L 20 790 Z'),
  rc('window', 375, 340, 50, 70, 25),
]);
add('hotair', '🎈 บอลลูนลอยฟ้า', 'vehicles', 'launch', 1, [
  e('cloud-1', 130, 680, 115, 44), e('cloud-2', 680, 720, 105, 40),
  p('balloon', 'M 400 55 C 130 55 130 410 320 530 L 480 530 C 670 410 670 55 400 55 Z'),
  p('panel', 'M 400 55 C 290 120 285 430 335 530 L 465 530 C 515 430 510 120 400 55 Z'),
  rc('basket', 335, 650, 130, 95, 14),
  ln('M 320 530 L 345 650', 6), ln('M 480 530 L 455 650', 6), ln('M 400 530 L 400 650', 6),
]);
add('watermelon', '🍉 แตงโม', 'food', 'wiggle', 1, [
  e('plate', 400, 700, 340, 48),
  p('rind', 'M 70 330 A 330 330 0 0 0 730 330 Z'),
  p('flesh', 'M 120 330 A 280 280 0 0 0 680 330 Z'),
  ed(260, 420, 16, 26), ed(400, 470, 16, 26), ed(540, 420, 16, 26), ed(330, 540, 16, 26), ed(470, 560, 16, 26), ed(190, 360, 14, 22), ed(610, 360, 14, 22),
]);
add('strawberry', '🍓 สตรอว์เบอร์รี', 'food', 'bounce', 1, [
  p('body', 'M 400 710 C 250 660 150 510 150 370 C 150 285 270 255 400 275 C 530 255 650 285 650 370 C 650 510 550 660 400 710 Z'),
  poly('leaves', [[400, 235], [330, 165], [320, 255], [225, 225], [310, 315], [400, 295], [490, 315], [575, 225], [480, 255], [470, 165]]),
  ln('M 400 245 L 400 105', 34),
  ed(300, 400, 11, 17), ed(400, 380, 11, 17), ed(500, 400, 11, 17), ed(350, 480, 11, 17), ed(450, 480, 11, 17), ed(300, 540, 11, 17), ed(500, 540, 11, 17), ed(400, 590, 11, 17),
]);
add('pumpkin', '🎃 ฟักทอง', 'food', 'wiggle', 1, [
  e('rib-l', 250, 480, 150, 215), e('rib-r', 550, 480, 150, 215), e('rib-c', 400, 470, 150, 235),
  p('stem', 'M 365 255 L 375 135 Q 400 100 440 125 L 435 255 Z'),
  p('leaf', 'M 450 215 C 530 130 640 145 665 205 C 600 255 520 255 450 215 Z'),
  dk('M 320 410 L 370 410 L 345 460 Z'), dk('M 430 410 L 480 410 L 455 460 Z'),
  ln('M 310 540 Q 400 610 490 540', 8),
]);
