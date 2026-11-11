#!/usr/bin/env python3
"""Centre-line strokes for the tracing game, taken from a looped Thai font.

  python3 tools/gen_trace_glyphs.py            # → trace-letters/glyphs-th.js (+ a review sheet)

Each glyph is rendered with TH Sarabun (free Thai government font), thinned to a 1-px
skeleton, turned into a graph and walked the way Thai is written: start at the head
loop, go round it, then follow the line; every other small loop is gone round as the
pen reaches it. Leftover branches become further strokes. `FIX` holds per-glyph
corrections (reverse / reorder / drop strokes). Needs only Pillow.
"""
import json, math, os, sys
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT = os.path.expanduser('~/Library/Fonts/THSarabun.ttf')
S = 400                                   # render size (px per em)
Z = 1                                     # extra render scale for small marks (thresholds follow)
CONS = 'กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรลวศษสหฬอฮ'
VOW_SOLO = 'ะาเแโใไ'                    # stand on the line by themselves
VOW_MARK = ['ั', 'ิ', 'ี', 'ึ', 'ื', 'ุ', 'ู', 'ำ']   # drawn on a ghost อ
DIGITS = '๐๑๒๓๔๕๖๗๘๙'

# per-glyph corrections, applied after the automatic walk:
#   'rev': [i…] reverse those strokes · 'order': [i…] new order (missing = dropped)
#   'start': 'bl'|'tl'|'tr'|'br'|'top'|'left' pick the first stroke's starting end when there is no head
FIX = {}
FIX_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'trace_fix.json')
if os.path.exists(FIX_FILE):
    FIX = json.load(open(FIX_FILE, encoding='utf-8'))

N8 = [(-1, -1), (0, -1), (1, -1), (1, 0), (1, 1), (0, 1), (-1, 1), (-1, 0)]


def render(text, sub=None):
    """Black-pixel set of `text` (minus the pixels of `sub`, drawn at the same origin)."""
    font = ImageFont.truetype(FONT, S * Z)
    def px(t):
        im = Image.new('L', (S * Z * 3, S * Z * 2), 0)
        ImageDraw.Draw(im).text((S * Z, S * Z // 3), t, font=font, fill=255)
        d = im.load()
        return {(x, y) for y in range(im.height) for x in range(im.width) if d[x, y] > 110}
    p = px(text)
    if sub:
        q = px(sub)
        grow = {(x + dx, y + dy) for (x, y) in q for dx in (-1, 0, 1) for dy in (-1, 0, 1)}
        return p - grow, q
    return p, None


def thin(pix):
    """Zhang–Suen thinning on a set of pixels."""
    pix = set(pix)
    def nb(x, y):
        return [(x, y - 1) in pix, (x + 1, y - 1) in pix, (x + 1, y) in pix, (x + 1, y + 1) in pix,
                (x, y + 1) in pix, (x - 1, y + 1) in pix, (x - 1, y) in pix, (x - 1, y - 1) in pix]
    changed = True
    while changed:
        changed = False
        for step in (0, 1):
            kill = []
            for (x, y) in pix:
                n = nb(x, y); b = sum(n)
                if b < 2 or b > 6: continue
                a = sum((not n[i]) and n[(i + 1) % 8] for i in range(8))
                if a != 1: continue
                if step == 0:
                    if (n[0] and n[2] and n[4]) or (n[2] and n[4] and n[6]): continue
                else:
                    if (n[0] and n[2] and n[6]) or (n[0] and n[4] and n[6]): continue
                kill.append((x, y))
            if kill:
                changed = True
                pix.difference_update(kill)
    # drop staircase corners so every line is strictly 1 px (8-connected)
    for (x, y) in sorted(pix):
        N, E, So, W = (x, y - 1) in pix, (x + 1, y) in pix, (x, y + 1) in pix, (x - 1, y) in pix
        if (N and E and not ((x - 1, y + 1) in pix or So or W)) or (E and So and not ((x - 1, y - 1) in pix or N or W)) or \
           (So and W and not ((x + 1, y - 1) in pix or N or E)) or (W and N and not ((x + 1, y + 1) in pix or So or E)):
            pix.discard((x, y))
    return pix


def graph(sk):
    """skeleton pixels → nodes {id: (x, y)} and edges [{a, b, pts}] (pts run a → b)."""
    def nbs(p):
        return [(p[0] + dx, p[1] + dy) for dx, dy in N8 if (p[0] + dx, p[1] + dy) in sk]
    deg = {p: len(nbs(p)) for p in sk}
    special = {p for p in sk if deg[p] != 2}
    # cluster touching junction pixels into one node
    node_of, nodes = {}, {}
    for p in special:
        if p in node_of: continue
        nid = len(nodes); stack = [p]; grp = []
        while stack:
            q = stack.pop()
            if q in node_of: continue
            node_of[q] = nid; grp.append(q)
            if deg[q] >= 3:
                stack += [r for r in nbs(q) if r in special and deg[r] >= 3 and r not in node_of]
        nodes[nid] = (sum(g[0] for g in grp) / len(grp), sum(g[1] for g in grp) / len(grp))
    edges, seen = [], set()
    for p in special:
        for q in nbs(p):
            if q in node_of:
                if node_of[q] != node_of[p] and (q, p) not in seen:
                    seen.add((p, q)); edges.append({'a': node_of[p], 'b': node_of[q], 'pts': [p, q]})
                continue
            if q in seen: continue
            chain, prev, cur = [p], p, q
            while True:
                chain.append(cur); seen.add(cur)
                nx = [r for r in nbs(cur) if r != prev and r not in chain[-3:]]
                hit = [r for r in nx if r in node_of and not (len(chain) == 2 and r == p)]
                if hit: chain.append(hit[0]); break
                nx = [r for r in nx if r not in seen]
                if not nx: break
                prev, cur = cur, nx[0]
            end = chain[-1]
            if end in node_of:
                edges.append({'a': node_of[p], 'b': node_of[end], 'pts': chain})
    # pure rings (no junction at all)
    left = {p for p in sk if p not in seen and p not in node_of}
    while left:
        p = min(left, key=lambda t: (t[1], t[0])); chain = [p]; left.discard(p); cur = p
        while True:
            nx = [r for r in nbs(cur) if r in left]
            if not nx: break
            cur = nx[0]; chain.append(cur); left.discard(cur)
        if len(chain) > 20:
            nid = len(nodes); nodes[nid] = p
            edges.append({'a': nid, 'b': nid, 'pts': chain + [p]})
    return nodes, edges


def elen(e):
    return sum(math.dist(e['pts'][i], e['pts'][i + 1]) for i in range(len(e['pts']) - 1))


def tidy(nodes, edges, spur=26, bridge=17, speck=50, twin=48):
    spur, bridge, speck, twin = spur * (Z if Z == 1 else 1.1), bridge * Z, speck * Z, twin * Z
    """Prune spurs, contract the tiny bridges thinning leaves at crossings, merge pass-through nodes."""
    def degree():
        d = {}
        for e in edges:
            d[e['a']] = d.get(e['a'], 0) + 1; d[e['b']] = d.get(e['b'], 0) + 1
        return d
    while True:
        d = degree(); changed = False
        for e in list(edges):                                  # specks: tiny rings where thick lines meet
            if e['a'] == e['b'] and elen(e) < speck and d.get(e['a'], 0) > 2:
                edges.remove(e); changed = True; break
        if changed: continue
        for e in list(edges):                                  # spurs
            if e['a'] == e['b']: continue
            for free, other in ((e['a'], e['b']), (e['b'], e['a'])):
                if d.get(free) == 1 and d.get(other, 0) >= 3 and elen(e) < spur:
                    edges.remove(e); changed = True; break
            if changed: break
        if changed: continue
        for e in list(edges):                                  # bridges between two junctions
            if e['a'] != e['b'] and d[e['a']] >= 3 and d[e['b']] >= 3 and elen(e) < bridge:
                a, b = e['a'], e['b']; edges.remove(e)
                nodes[a] = ((nodes[a][0] + nodes[b][0]) / 2, (nodes[a][1] + nodes[b][1]) / 2)
                for f in edges:
                    if f['a'] == b: f['a'] = a
                    if f['b'] == b: f['b'] = a
                changed = True; break
        if changed: continue
        for e in list(edges):                                  # a crossing loop whose crossing thinned into two nodes
            if e['a'] == e['b'] or elen(e) >= twin: continue
            if any(f is not e and {f['a'], f['b']} == {e['a'], e['b']} for f in edges):
                a, b = e['a'], e['b']; edges.remove(e)
                nodes[a] = ((nodes[a][0] + nodes[b][0]) / 2, (nodes[a][1] + nodes[b][1]) / 2)
                for f in edges:
                    if f['a'] == b: f['a'] = a
                    if f['b'] == b: f['b'] = a
                changed = True; break
        if changed: continue
        for n, k in d.items():                                 # pass-through nodes
            if k != 2: continue
            inc = [e for e in edges if e['a'] == n or e['b'] == n]
            if len(inc) != 2: continue                         # a ring on its own node
            e1, e2 = inc
            p1 = e1['pts'] if e1['b'] == n else e1['pts'][::-1]
            p2 = e2['pts'] if e2['a'] == n else e2['pts'][::-1]
            a = e1['a'] if e1['b'] == n else e1['b']; b = e2['b'] if e2['a'] == n else e2['a']
            edges.remove(e1); edges.remove(e2); edges.append({'a': a, 'b': b, 'pts': p1 + p2[1:]})
            changed = True; break
        if not changed: return nodes, edges


def tangent(pts, k=None):
    k = k or 9 * Z
    """Unit direction of travel at the START of pts."""
    a, b = pts[0], pts[min(k, len(pts) - 1)]
    d = math.dist(a, b) or 1
    return ((b[0] - a[0]) / d, (b[1] - a[1]) / d)


def walk(nodes, edges, start_hint=None, retrace=0, stop_t=False, from_end=False, route=None):
    """Split the graph into pen strokes (lists of points)."""
    HEAD = 150 * Z; retrace *= Z                                                  # a loop shorter than this is a head / curl
    unused = list(range(len(edges)))
    def inc(n):
        return [i for i in unused if edges[i]['a'] == n or edges[i]['b'] == n]
    def out(i, n, flip=False):
        e = edges[i]
        if e['a'] == e['b']: return e['pts'][::-1] if flip else e['pts']
        return e['pts'] if e['a'] == n else e['pts'][::-1]
    def other(i, n):
        e = edges[i]; return e['b'] if e['a'] == n else e['a']
    def deg_all(n):
        return sum((e['a'] == n) + (e['b'] == n) for e in edges)
    strokes = []
    if route:                                                   # hand-routed glyph: each stroke = waypoints near nodes
        near = lambda q: min((n for n in nodes if deg_all(n)), key=lambda n: math.dist(nodes[n], q))
        for way in route:
            ns = [near(q) for q in way]; pts = [nodes[ns[0]]]
            for a, b in zip(ns, ns[1:]):
                js = [i for i in unused if {edges[i]['a'], edges[i]['b']} == {a, b}]
                j = min(js, key=lambda i: elen(edges[i])); unused.remove(j)
                seg = out(j, a)
                if a == b and len(pts) > 1:                     # leave the ring the smooth way
                    pass
                pts += list(seg[1:])
            strokes.append(pts)
        return strokes
    while unused:
        # --- where does this stroke start? a head (small ring on a node with one way out) first
        heads = [i for i in unused if edges[i]['a'] == edges[i]['b'] and elen(edges[i]) < HEAD]
        true_heads = [i for i in heads if deg_all(edges[i]['a']) == 3]
        cand = true_heads or heads
        if cand and not (start_hint and not strokes):
            i = min(cand, key=lambda i: (elen(edges[i]) > HEAD, nodes[edges[i]['a']][1] + nodes[edges[i]['a']][0] * 0.3))
            n = edges[i]['a']
        else:
            ends = [n for n in nodes if len(inc(n)) == 1 and deg_all(n) == 1]
            attach = [n for n in nodes if len(inc(n)) >= 1 and deg_all(n) > len(inc(n))]   # touching an earlier stroke
            pool = ends or attach or [edges[unused[0]]['a']]
            if strokes and attach and not (from_end and ends and len(strokes) == 1): pool = attach
            key = {'bl': lambda n: nodes[n][0] - nodes[n][1], 'tl': lambda n: nodes[n][0] + nodes[n][1],
                   'tr': lambda n: -nodes[n][0] + nodes[n][1], 'br': lambda n: -nodes[n][0] - nodes[n][1],
                   'top': lambda n: nodes[n][1], 'left': lambda n: nodes[n][0], 'bottom': lambda n: -nodes[n][1],
                   'right': lambda n: -nodes[n][0]}[(start_hint if not strokes else None) or 'tl']
            n = min(pool, key=key); i = None
        pts, direction, met = [nodes[n]], None, 0
        while True:
            options = inc(n)
            if not options: break
            if stop_t and not strokes and len(pts) > 1 and deg_all(n) >= 3 and not any(e['a'] == e['b'] == n for e in edges):
                met += 1
            if met and met >= int(stop_t):
                break                                           # this glyph's first stroke ends where it meets another line
            rings = [j for j in options if edges[j]['a'] == edges[j]['b']]
            best = None
            # rings first (shortest), in the direction that keeps the pen moving smoothly
            pick = sorted(rings, key=lambda j: elen(edges[j]))[:1] if rings else options
            for j in pick:
                for flip in ((False, True) if edges[j]['a'] == edges[j]['b'] else (False,)):
                    seg = out(j, n, flip)
                    t = tangent(seg)
                    score = 0 if direction is None else -(t[0] * direction[0] + t[1] * direction[1])
                    if j in rings:                              # leaving the ring should also be smooth
                        rest = [k for k in options if k != j]
                        if rest:
                            tin = tangent(seg[::-1]); tin = (-tin[0], -tin[1])
                            score += min(-(tangent(out(k, n))[0] * tin[0] + tangent(out(k, n))[1] * tin[1]) for k in rest)
                    if best is None or score < best[0]: best = (score, j, seg)
            _, j, seg = best
            unused.remove(j); pts += list(seg[1:])
            tin = tangent(seg[::-1]); direction = (-tin[0], -tin[1])
            m = other(j, n) if edges[j]['a'] != edges[j]['b'] else n
            # a short dead end with more line waiting behind it: the pen goes back up the same line
            if retrace and m != n and not inc(m) and inc(n) and elen(edges[j]) < retrace:
                pts += list(seg[::-1][1:]); direction = (-direction[0], -direction[1])
            else:
                n = m
        if len(pts) > 1: strokes.append(pts)
        else: break
    return strokes


def smooth(pts, step=7, win=2):
    step *= Z
    closed = math.dist(pts[0], pts[-1]) < 2 and len(pts) > 20
    out, acc = [pts[0]], 0
    for i in range(1, len(pts)):
        acc += math.dist(pts[i - 1], pts[i])
        if acc >= step: out.append(pts[i]); acc = 0
    if out[-1] != pts[-1]: out.append(pts[-1])
    n = len(out); sm = []
    for i in range(n):
        if not closed and (i == 0 or i == n - 1): sm.append(out[i]); continue
        idx = [(i + k) % (n - 1) if closed else max(0, min(n - 1, i + k)) for k in range(-win, win + 1)]
        sm.append((sum(out[j][0] for j in idx) / len(idx), sum(out[j][1] for j in idx) / len(idx)))
    if closed: sm[-1] = sm[0]
    return sm


def rdp(pts, eps):
    if len(pts) < 3: return pts
    a, b = pts[0], pts[-1]; dx, dy = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dy) or 1e-9
    dmax, idx = 0, 0
    for i in range(1, len(pts) - 1):
        d = abs(dy * (pts[i][0] - a[0]) - dx * (pts[i][1] - a[1])) / L if L > 1e-6 else math.dist(pts[i], a)
        if d > dmax: dmax, idx = d, i
    if dmax <= eps: return [a, b]
    return rdp(pts[:idx + 1], eps)[:-1] + rdp(pts[idx:], eps)


def to_path(pts):
    """Catmull-Rom through the points → cubic Béziers."""
    r = lambda v: str(int(round(v)))
    d = f'M{r(pts[0][0])} {r(pts[0][1])}'
    n = len(pts); closed = math.dist(pts[0], pts[-1]) < 1.5 and n > 3
    for i in range(n - 1):
        p0 = pts[i - 1] if i > 0 else (pts[n - 2] if closed else pts[0])
        p1, p2 = pts[i], pts[i + 1]
        p3 = pts[i + 2] if i + 2 < n else (pts[1] if closed else pts[n - 1])
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += f'C{r(c1[0])} {r(c1[1])} {r(c2[0])} {r(c2[1])} {r(p2[0])} {r(p2[1])}'
    return d


def strokes_of(pix, fix={}):
    nodes, edges = graph(thin(pix))
    nodes, edges = tidy(nodes, edges)
    return walk(nodes, edges, fix.get('start'), fix.get('retrace', 0), fix.get('stop_t', False), fix.get('from_end', False), fix.get('route'))


def build(ch, base=None):
    global Z
    Z = 2 if base else 1
    fix = FIX.get(ch, {})
    src = 'ี' if ch == 'ื' else ch                              # ื = ี plus a second tick (too fine to thin cleanly)
    pix, basepix = render((base or '') + src, base)
    st = strokes_of(pix, FIX.get(src, {}) if src != ch else fix)
    if ch == 'ื':
        x, y = st[0][0]; tick = [q for q in st[0][:400] if abs(q[0] - x) < 5 * Z]
        yb = max(q[1] for q in tick); d = 0.07 * S * Z
        st.append([(x - d, y + (yb - y) * t / 20) for t in range(0, 15)])
    st = [s for s in st if sum(math.dist(s[i], s[i + 1]) for i in range(len(s) - 1)) > 12 * Z]
    if 'order' in fix: st = [st[i] for i in fix['order']]
    for i in fix.get('rev', []): st[i] = st[i][::-1]
    ghost = strokes_of(basepix) if basepix else []
    allp = [p for s in st for p in s]
    x0, x1 = min(p[0] for p in allp), max(p[0] for p in allp); y0, y1 = min(p[1] for p in allp), max(p[1] for p in allp)
    k = min(3.3 / Z, 640 / max(1, y1 - y0), 600 / max(1, x1 - x0))
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    if ghost:                                # a vowel mark: big enough to trace, the ghost อ may run off the box
        gy = [p[1] for s in ghost for p in s]
        k = min(4.4 / Z, 300 / max(1, y1 - y0), 440 / max(1, x1 - x0))
        cy += (210 if cy < sum(gy) / len(gy) else -210) / k
        if ch == 'ำ': k = 3.0 / Z; cy = (min(gy + [y0]) + max(gy)) / 2; cx = (min(p[0] for s in ghost for p in s) + x1) / 2
    def conv(s):
        s = rdp(smooth(s), 1.1 * Z)
        return to_path([(500 + (p[0] - cx) * k, 500 + (p[1] - cy) * k) for p in s])
    return [conv(s) for s in st], [conv(s) for s in ghost]


def main():
    only = sys.argv[1:] or None
    out_path = os.path.join(ROOT, 'trace-letters', 'glyphs-th.js'); cache = os.path.join(ROOT, 'tools', '_trace_glyphs.json')
    data, ghosts = {}, {}
    if only and os.path.exists(cache):
        saved = json.load(open(cache, encoding='utf-8')); data, ghosts = saved['g'], saved['ghost']
    todo = [(c, None) for c in CONS + VOW_SOLO + DIGITS] + [(c, 'อ') for c in VOW_MARK]
    for ch, base in todo:
        if only and ch not in only: continue
        try:
            data[ch], g = build(ch, base)
            if g: ghosts[ch] = g
            print(ch, len(data[ch]), 'strokes')
        except Exception as e:
            print(ch, 'FAILED', e)
    json.dump({'g': data, 'ghost': ghosts}, open(cache, 'w', encoding='utf-8'), ensure_ascii=False)
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write('// generated by tools/gen_trace_glyphs.py from TH Sarabun centre lines — do not edit\n')
        f.write('window.TH_GLYPHS = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
        f.write('window.TH_GHOST = ' + json.dumps(ghosts, ensure_ascii=False, separators=(',', ':')) + ';\n')
    print(len(data), 'glyphs →', out_path, os.path.getsize(out_path) // 1024, 'KB')


if __name__ == '__main__':
    main()
