#!/usr/bin/env python3
"""Retry the racers whose image or audio failed on the first pass.

Commons full-text search requires every word to match — multi-word queries
like 'airliner takeoff' had zero hits. Shorter/broader queries perform better.
"""
import json, sys
sys.path.insert(0, '.')
from tools.fetch_assets import (
    fetch_image, fetch_audio, MANIFEST, IMAGES_DIR, SOUNDS_DIR, REPO
)

# Broader queries for audio fetches that failed; for f1 we pick a different
# slug (the generic Formula_One article has no lead image).
IMAGE_RETRIES = [
    ('f1', 'Formula_One_car'),
]
AUDIO_RETRIES = [
    ('airliner',   'airplane'),
    ('falcon',     'falcon'),
    ('dragon',     'komodo'),
    ('lion',       'lion'),
    ('tiger',      'tiger'),
    ('rhino',      'rhinoceros'),
    ('squirrel',   'squirrel'),
    ('whale',      'whale'),
    ('seal',       'seal'),
    ('supercroc',  'crocodile'),
    ('longneck',   'dinosaur'),
    ('crocodile',  'alligator'),
]

manifest = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {}

for racer_id, slug in IMAGE_RETRIES:
    out = IMAGES_DIR / f"{racer_id}.jpg"
    if out.exists() and out.stat().st_size > 0:
        print(f"{racer_id}: image already present, skipping")
        continue
    print(f"{racer_id}: retry image slug={slug}")
    meta = fetch_image(racer_id, slug)
    if meta:
        manifest.setdefault(racer_id, {})['image'] = meta
        print(f"   ok ({out.stat().st_size}B)")
    else:
        print(f"   still FAIL")

for racer_id, query in AUDIO_RETRIES:
    out = SOUNDS_DIR / f"{racer_id}.ogg"
    if out.exists() and out.stat().st_size > 0:
        print(f"{racer_id}: sound already present, skipping")
        continue
    print(f"{racer_id}: retry audio query={query!r}")
    meta = fetch_audio(racer_id, query)
    if meta:
        manifest.setdefault(racer_id, {})['audio'] = meta
        print(f"   ok ({out.stat().st_size}B)")
    else:
        print(f"   still FAIL")

MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False))
print("\nDone.")
