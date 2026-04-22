#!/usr/bin/env python3
"""Replace taxonomic-overview collages + the generic 'Human' portrait.

Wikipedia articles for broad clades (Eagle, Deer, Rhinoceros, Squirrel,
Pinniped) show a grid of member species as their lead image. For a kids'
game we want a single recognisable animal. Switching to a specific species
article (Bald_eagle, White-tailed_deer, etc.) gives us a clean photo.

Same idea for 'Human' — the article lead is a portrait, but the racer
in the game represents a sprinter at 37 km/h, so swap to a running shot.
"""
import json, sys, urllib.parse
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from tools.fetch_assets import fetch_image, MANIFEST, IMAGES_DIR, REPO

# (racer_id, preferred_slug, fallback_slug)
REPLACEMENTS = [
    ('seal',     'Harbor_seal',           'Common_seal'),
    ('deer',     'White-tailed_deer',     'Red_deer'),
    ('rhino',    'White_rhinoceros',      'Indian_rhinoceros'),
    ('squirrel', 'Eastern_gray_squirrel', 'Red_squirrel'),
    ('eagle',    'Bald_eagle',            'Golden_eagle'),
    ('human',    'Usain_Bolt',            'Sprint_(running)'),
]

manifest = json.loads(MANIFEST.read_text())

for racer_id, slug, fallback in REPLACEMENTS:
    print(f"\n{racer_id} -> {slug}")
    # Clear existing so fetch_image re-downloads
    (IMAGES_DIR / f"{racer_id}.jpg").unlink(missing_ok=True)
    meta = fetch_image(racer_id, slug)
    if not meta and fallback:
        print(f"   trying fallback {fallback}")
        meta = fetch_image(racer_id, fallback)
    if meta:
        manifest.setdefault(racer_id, {})['image'] = meta
        size = (IMAGES_DIR / f"{racer_id}.jpg").stat().st_size
        print(f"   ok ({size}B)  lic={meta.get('license')}  src={meta.get('source_original','').rsplit('/',1)[-1]}")
    else:
        print("   FAIL — keep whatever the dir has")

MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False))
print("\nDone. Re-run gen_credits.py.")
