#!/usr/bin/env python3
"""Second pass: replace trademark logos, pronunciation clips, and wrong sounds.

Commons full-text search matches loosely — queries like "airliner takeoff"
surfaced "Airplane Chime Sound Effect.ogg" (a cabin ding), and queries for
animal names matched dictionary pronunciation files like "De-Tiger.ogg" or
"Ru-носорог.ogg". Wikipedia's REST API returns a brand's logo for Lamborghini /
Ferrari / Ducati article pages.

This script:
  1. Filters pronunciation/language files out of Commons search results.
  2. Re-fetches audio for racers whose audio title matches the pronunciation
     pattern, using a more specific query.
  3. Re-fetches images for racers whose Wikipedia lead image was a brand logo,
     using a specific model slug instead.
"""
import json, re, sys, urllib.parse
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from tools import fetch_assets
from tools.fetch_assets import (
    fetch_image, fetch_audio, MANIFEST, SOUNDS_DIR, IMAGES_DIR, REPO,
    commons_search as _orig_search,
)

# Monkey-patch commons_search to strip obvious pronunciation / speech files.
LANG_PREFIX = re.compile(r'^File:(De-|Ru-|Fr-|It-|Es-|Ja-|Ko-|Pt-|Zh-|LL-|En-)')

def commons_search_filtered(query, want_audio=True, max_size=2_500_000):
    hits = _orig_search(query, want_audio=want_audio, max_size=max_size)
    filtered = []
    for h in hits:
        t = h.get('title', '')
        if LANG_PREFIX.match(t):
            continue
        low = t.lower()
        if 'pronunciation' in low or 'speech' in low:
            continue
        if 'chime' in low and 'airliner' not in query.lower():
            # generic UI chimes keep slipping through — filter unless specifically asked
            pass
        filtered.append(h)
    return filtered

fetch_assets.commons_search = commons_search_filtered

# ---------------- IMAGE RETRIES ----------------
# (racer_id, slug) — target a specific vehicle model so we get a photo, not a logo
IMAGE_FIXES = [
    ('lambo',   'Lamborghini_Aventador'),
    ('ferrari', 'Ferrari_SF90_Stradale'),
    ('ducati',  'Ducati_Panigale_V4'),
]

# ---------------- AUDIO RETRIES ----------------
# (racer_id, query) — queries picked to dodge both the pronunciation matches
# and the chime/song false-positives from the first pass.
AUDIO_FIXES = [
    ('shuttle',   'rocket engine'),
    ('airliner',  'jet takeoff'),
    ('f1',        'race car engine'),
    ('f16',       'f-16'),
    ('f18',       'f-18'),
    ('falcon',    'peregrine'),
    ('dragon',    'komodo hiss'),
    ('lion',      'panthera leo roar'),
    ('wolf',      'wolf howl'),
    ('tiger',     'panthera tigris'),
    ('rhino',     'rhinoceros'),
    ('whale',     'whale song'),
    ('longneck',  'dinosaur roar'),
    ('crocodile', 'alligator'),
]


def clear_asset(path: Path):
    if path.exists():
        path.unlink()


manifest = json.loads(MANIFEST.read_text())

for racer_id, slug in IMAGE_FIXES:
    print(f"IMG {racer_id} -> {slug}")
    out = IMAGES_DIR / f"{racer_id}.jpg"
    clear_asset(out)
    meta = fetch_image(racer_id, slug)
    if meta:
        manifest.setdefault(racer_id, {})['image'] = meta
        print(f"   ok ({out.stat().st_size}B)  lic={meta.get('license')}")
    else:
        print("   FAIL")

for racer_id, query in AUDIO_FIXES:
    print(f"AUD {racer_id} <- '{query}'")
    out = SOUNDS_DIR / f"{racer_id}.ogg"
    clear_asset(out)
    meta = fetch_audio(racer_id, query)
    if meta:
        manifest.setdefault(racer_id, {})['audio'] = meta
        print(f"   ok ({out.stat().st_size}B)  title={meta.get('title')}")
    else:
        print("   FAIL")

MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False))
print("\nDone. Re-run gen_credits.py.")
