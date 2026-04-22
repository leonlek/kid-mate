#!/usr/bin/env python3
"""Regenerate the ANIMALS array in animal-race/index.html.

Merges three sources:
  - Base racer table (id, emoji, name, speed, cat) — kept here in one place
  - English names (for TTS) from the full racer mapping
  - Image + sound file existence under animal-race/assets/

Outputs the formatted JS array to stdout (or writes in-place if --inplace).
"""
import json, sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
INDEX = REPO / "animal-race" / "index.html"
IMAGES_DIR = REPO / "animal-race" / "assets" / "images"
SOUNDS_DIR = REPO / "animal-race" / "assets" / "sounds"

# Base racer table: (id, emoji, name, speed, cat, en).
# Kept in-sync with the original array in index.html, sorted fastest → slowest.
RACERS = [
  ('shuttle',     '🚀',  'กระสวยอวกาศ',     28000,   'aircraft', 'Space shuttle'),
  ('f22',         '🛩️',  'F-22 แร็พเตอร์',  2410,    'aircraft', 'F-22 Raptor'),
  ('f16',         '🛩️',  'F-16',            2180,    'aircraft', 'F-16'),
  ('f18',         '🛩️',  'F-18 ฮอร์เน็ต',   1915,    'aircraft', 'F-18 Hornet'),
  ('airliner',    '✈️',  'เครื่องบินโดยสาร', 920,    'aircraft', 'Airliner'),
  ('bugatti',     '🏎️',  'บูกัตติ',          490,     'vehicle',  'Bugatti'),
  ('f1',          '🏎️',  'รถ F1',           375,     'vehicle',  'Formula 1'),
  ('lambo',       '🏎️',  'ลัมโบร์กินี',     355,     'vehicle',  'Lamborghini'),
  ('ferrari',     '🏎️',  'เฟอร์รารี่',      340,     'vehicle',  'Ferrari'),
  ('ducati',      '🏍️',  'ดูคาติ',          300,     'vehicle',  'Ducati motorcycle'),
  ('falcon',      '🦅',  'เหยี่ยวเพเรกริน', 240,     'bird',     'Peregrine falcon'),
  ('eagle',       '🦅',  'นกอินทรี',        160,     'bird',     'Eagle'),
  ('dragon',      '🐉',  'มังกร',           130,     'fantasy',  'Dragon'),
  ('cheetah',     '🐆',  'เสือชีตาห์',      120,     'wild',     'Cheetah'),
  ('sailfish',    '🐟',  'ปลาเซลฟิช',       110,     'water',    'Sailfish'),
  ('unicorn',     '🦄',  'ยูนิคอร์น',       95,      'fantasy',  'Unicorn'),
  ('pterodactyl', '🦇',  'เทอโรแด็กทิล',    80,      'dino',     'Pterodactyl'),
  ('swan',        '🦢',  'หงส์',            80,      'bird',     'Swan'),
  ('deer',        '🦌',  'กวาง',            80,      'wild',     'Deer'),
  ('lion',        '🦁',  'สิงโต',           80,      'wild',     'Lion'),
  ('wolf',        '🐺',  'หมาป่า',          75,      'wild',     'Wolf'),
  ('horse',       '🐎',  'ม้า',             70,      'farm',     'Horse'),
  ('kangaroo',    '🦘',  'จิงโจ้',          70,      'wild',     'Kangaroo'),
  ('crow',        '🐦',  'นกกา',            70,      'bird',     'Crow'),
  ('zebra',       '🦓',  'ม้าลาย',          65,      'wild',     'Zebra'),
  ('tiger',       '🐅',  'เสือโคร่ง',       65,      'wild',     'Tiger'),
  ('owl',         '🦉',  'นกฮูก',           65,      'bird',     'Owl'),
  ('giraffe',     '🦒',  'ยีราฟ',           60,      'wild',     'Giraffe'),
  ('flamingo',    '🦩',  'ฟลามิงโก',        60,      'bird',     'Flamingo'),
  ('rabbit',      '🐰',  'กระต่าย',         56,      'farm',     'Rabbit'),
  ('shark',       '🦈',  'ฉลาม',            56,      'water',    'Shark'),
  ('orca',        '🐳',  'วาฬออก้า',        56,      'water',    'Orca'),
  ('rhino',       '🦏',  'แรด',             55,      'wild',     'Rhinoceros'),
  ('fox',         '🦊',  'จิ้งจอก',         50,      'wild',     'Fox'),
  ('bear',        '🐻',  'หมี',             50,      'wild',     'Bear'),
  ('whale',       '🐋',  'วาฬสีน้ำเงิน',    50,      'water',    'Blue whale'),
  ('cat',         '🐈',  'แมว',             48,      'farm',     'Cat'),
  ('dog',         '🐕',  'สุนัข',            45,      'farm',     'Dog'),
  ('raptor',      '🦖',  'แรพเตอร์',         40,      'dino',     'Velociraptor'),
  ('elephant',    '🐘',  'ช้าง',            40,      'wild',     'Elephant'),
  ('polarbear',   '🐻‍❄️', 'หมีขาว',         40,      'wild',     'Polar bear'),
  ('octopus',     '🐙',  'ปลาหมึก',         40,      'water',    'Octopus'),
  ('human',       '🏃',  'คน',              37,      'other',    'Human'),
  ('dolphin',     '🐬',  'โลมา',            37,      'water',    'Dolphin'),
  ('cow',         '🐮',  'วัว',             35,      'farm',     'Cow'),
  ('seal',        '🦭',  'แมวน้ำ',          35,      'water',    'Seal'),
  ('hippo',       '🦛',  'ฮิปโป',           30,      'wild',     'Hippopotamus'),
  ('trex',        '🦖',  'ทีเร็กซ์',         27,      'dino',     'Tyrannosaurus Rex'),
  ('monkey',      '🐒',  'ลิง',             24,      'wild',     'Monkey'),
  ('bee',         '🐝',  'ผึ้ง',            24,      'other',    'Bee'),
  ('parrot',      '🦜',  'นกแก้ว',          24,      'bird',     'Parrot'),
  ('hornet',      '🐝',  'แตน',             22,      'other',    'Hornet'),
  ('crocodile',   '🐊',  'จระเข้',           20,      'other',    'Crocodile'),
  ('squirrel',    '🐿️',  'กระรอก',          20,      'wild',     'Squirrel'),
  ('supercroc',   '🐊',  'ซูเปอร์คร็อค',    18,      'dino',     'Sarcosuchus'),
  ('pig',         '🐖',  'หมู',             17,      'farm',     'Pig'),
  ('chicken',     '🐔',  'ไก่',             14,      'bird',     'Chicken'),
  ('duck',        '🦆',  'เป็ด',            10,      'bird',     'Duck'),
  ('longneck',    '🦕',  'ไดโนคอยาว',       8,       'dino',     'Brachiosaurus'),
  ('penguin',     '🐧',  'เพนกวิน',         6,       'bird',     'Penguin'),
  ('crab',        '🦀',  'ปู',              1.6,     'water',    'Crab'),
  ('turtle',      '🐢',  'เต่า',            1,       'other',    'Turtle'),
  ('sloth',       '🦥',  'สลอท',            0.27,    'wild',     'Sloth'),
  ('snail',       '🐌',  'หอยทาก',          0.05,    'other',    'Snail'),
]


def js_str(s: str) -> str:
    return "'" + s.replace("\\", "\\\\").replace("'", "\\'") + "'"


def format_array() -> str:
    lines = ["  const ANIMALS = ["]
    for racer_id, emoji, name, speed, cat, en in RACERS:
        img_path = IMAGES_DIR / f"{racer_id}.jpg"
        sfx_path = SOUNDS_DIR / f"{racer_id}.ogg"
        parts = [
            f"id: {js_str(racer_id)}",
            f"emoji: {js_str(emoji)}",
            f"name: {js_str(name)}",
            f"speed: {speed}",
            f"cat: {js_str(cat)}",
            f"en: {js_str(en)}",
        ]
        if img_path.exists():
            parts.append(f"img: {js_str(f'assets/images/{racer_id}.jpg')}")
        if sfx_path.exists():
            parts.append(f"sfx: {js_str(f'assets/sounds/{racer_id}.ogg')}")
        lines.append("    { " + ", ".join(parts) + " },")
    lines.append("  ];")
    return "\n".join(lines)


def apply_inplace() -> None:
    """Replace the ANIMALS = [ ... ]; block in animal-race/index.html."""
    content = INDEX.read_text()
    import re
    # Match from `const ANIMALS = [` through the matching `];` on its own line.
    pattern = re.compile(r"  const ANIMALS = \[.*?\n  \];", re.DOTALL)
    new_block = format_array()
    if not pattern.search(content):
        raise SystemExit("Could not locate ANIMALS block in index.html")
    new_content = pattern.sub(lambda m: new_block, content, count=1)
    INDEX.write_text(new_content)
    print(f"Updated {INDEX.relative_to(REPO)} — {len(RACERS)} racers.")


if __name__ == '__main__':
    if '--inplace' in sys.argv:
        apply_inplace()
    else:
        print(format_array())
