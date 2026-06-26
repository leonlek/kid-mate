#!/usr/bin/env python3
"""
Regenerate the CHARS stroke-data block for write-cjk/index.html.

Stroke paths come from KanjiVG (http://kanjivg.tagaini.net), CC BY-SA 3.0.
Each KanjiVG file is named by the 5-digit zero-padded Unicode codepoint and
contains one <path> per stroke, in canonical stroke order, in a 109x109 viewBox.

To add a character: append a row to CHARS below (codepoint is hex, no "0x"),
run `python3 tools/fetch_kanjivg.py`, and paste the printed block over the
`const CHARS = [ ... ];` array in write-cjk/index.html. Keep the CC BY-SA
attribution in CREDITS.md and the file header.

Fields: (codepoint, id, char, grp, emoji, th_meaning, pinyin, pinyin_th, romaji, romaji_th)
  grp ∈ {number, picture, hiragana}.  Leave cn/cnTh empty ("") for kana.
"""
import urllib.request, re, sys, time, json

CHARS = [
  # ---- Numbers (shared CN/JP kanji) ----
  ("4e00","n1","一","number","1️⃣","หนึ่ง","yī","อี","ichi","อิจิ"),
  ("4e8c","n2","二","number","2️⃣","สอง","èr","เอ้อ","ni","นิ"),
  ("4e09","n3","三","number","3️⃣","สาม","sān","ซาน","san","ซัง"),
  ("56db","n4","四","number","4️⃣","สี่","sì","ซื่อ","shi","ชิ"),
  ("4e94","n5","五","number","5️⃣","ห้า","wǔ","อู่","go","โกะ"),
  ("516d","n6","六","number","6️⃣","หก","liù","ลิ่ว","roku","โรขุ"),
  ("4e03","n7","七","number","7️⃣","เจ็ด","qī","ชี","shichi","ชิจิ"),
  ("516b","n8","八","number","8️⃣","แปด","bā","ปา","hachi","ฮาจิ"),
  ("4e5d","n9","九","number","9️⃣","เก้า","jiǔ","จิ่ว","kyuu","คิว"),
  ("5341","n10","十","number","🔟","สิบ","shí","สือ","juu","จู"),
  # ---- Pictographs (shared CN/JP kanji) ----
  ("5c71","p_shan","山","picture","⛰️","ภูเขา","shān","ซาน","yama","ยามะ"),
  ("6728","p_mu","木","picture","🌳","ต้นไม้","mù","มู่","ki","คิ"),
  ("706b","p_huo","火","picture","🔥","ไฟ","huǒ","หั่ว","hi","ฮิ"),
  ("6c34","p_shui","水","picture","💧","น้ำ","shuǐ","สุ่ย","mizu","มิซุ"),
  ("65e5","p_ri","日","picture","☀️","พระอาทิตย์ / วัน","rì","ยื่อ","hi","ฮิ"),
  ("6708","p_yue","月","picture","🌙","พระจันทร์ / เดือน","yuè","เยฺว่","tsuki","สึกิ"),
  ("53e3","p_kou","口","picture","👄","ปาก","kǒu","โข่ว","kuchi","คุจิ"),
  ("4eba","p_ren","人","picture","🧍","คน","rén","เหริน","hito","ฮิโตะ"),
  ("5927","p_da","大","picture","🙆","ใหญ่","dà","ต้า","oo","โอ"),
  ("5c0f","p_xiao","小","picture","🤏","เล็ก","xiǎo","เสี่ยว","chii","จี"),
  ("4e2d","p_zhong","中","picture","🎯","กลาง","zhōng","จง","naka","นากะ"),
  ("7530","p_tian","田","picture","🌾","ทุ่งนา","tián","เถียน","ta","ทะ"),
  # ---- Hiragana (JP only) ----
  ("3042","h_a","あ","hiragana","","เสียง a","","","a","อะ"),
  ("3044","h_i","い","hiragana","","เสียง i","","","i","อิ"),
  ("3046","h_u","う","hiragana","","เสียง u","","","u","อุ"),
  ("3048","h_e","え","hiragana","","เสียง e","","","e","เอะ"),
  ("304a","h_o","お","hiragana","","เสียง o","","","o","โอะ"),
  ("304b","h_ka","か","hiragana","","เสียง ka","","","ka","คะ"),
  ("304d","h_ki","き","hiragana","","เสียง ki","","","ki","คิ"),
  ("304f","h_ku","く","hiragana","","เสียง ku","","","ku","คุ"),
  ("3051","h_ke","け","hiragana","","เสียง ke","","","ke","เคะ"),
  ("3053","h_ko","こ","hiragana","","เสียง ko","","","ko","โคะ"),
]

PATH_RE = re.compile(r'<path[^>]*\bid="kvg:[0-9a-f]+-s\d+"[^>]*\bd="([^"]+)"', re.I)

def fetch(cp):
    url = f"https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/{cp.zfill(5)}.svg"
    for _ in range(3):
        try:
            with urllib.request.urlopen(url, timeout=20) as r:
                return r.read().decode("utf-8")
        except Exception as e:
            sys.stderr.write(f"retry {cp}: {e}\n"); time.sleep(1)
    raise RuntimeError(f"failed {cp}")

def q(s):  # JSON string keeping Thai/CJK readable
    return json.dumps(s, ensure_ascii=False)

print("const CHARS = [")
for cp, cid, ch, grp, emoji, th, cn, cnTh, jp, jpTh in CHARS:
    ds = [re.sub(r'\s+', ' ', d).strip() for d in PATH_RE.findall(fetch(cp))]
    if not ds:
        sys.stderr.write(f"NO STROKES for {ch} ({cp})\n"); continue
    body = ",\n    ".join("'" + d + "'" for d in ds)
    print("  { id:%s, char:%s, grp:%s, emoji:%s, th:%s, cn:%s, cnTh:%s, jp:%s, jpTh:%s, strokes:[\n    %s\n  ]},"
          % (q(cid), q(ch), q(grp), q(emoji), q(th), q(cn), q(cnTh), q(jp), q(jpTh), body))
    sys.stderr.write(f"ok {ch} {len(ds)} strokes\n")
print("];")
