#!/usr/bin/env python3
"""Third pass: stronger pronunciation filter + targeted queries for remaining
racers, with sensible fallback sharing where Commons has no good clip.

The search filter now rejects anything starting with a 2-3 letter language
code followed by a dash (De-, Nl-, Jer-, LL-, etc.), plus any file with
pronunciation / speech / court / opinion / song / music patterns.
"""
import json, re, shutil, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from tools import fetch_assets
from tools.fetch_assets import (
    fetch_audio, MANIFEST, SOUNDS_DIR, REPO, commons_search as _orig_search,
)

LANG_PREFIX_RX = re.compile(r'^File:([A-Za-z]{2,4}[+-])')  # De-, Nl-, Jer-, LL-, en-GB-
BAD_WORDS = ('pronunciation', 'speech', 'court', 'opinion', 'lecture',
             'explanation', 'song', 'music', 'piano', 'guitar', 'chant',
             'hymn', 'anthem', 'drums', 'chime', 'bell', 'melody')
ANIMAL_MISMATCH = {
    'rhino': ('hornbill',),  # "Rhinoceros Hornbill" = bird not rhino
    'whale': ('whalebone',),
}


def commons_search_strict(query, want_audio=True, max_size=3_500_000, racer_id=None):
    hits = _orig_search(query, want_audio=want_audio, max_size=max_size)
    bad_extra = ANIMAL_MISMATCH.get(racer_id, ())
    filtered = []
    for h in hits:
        t = h.get('title', '')
        low = t.lower()
        if LANG_PREFIX_RX.match(t): continue
        if any(w in low for w in BAD_WORDS): continue
        if any(w in low for w in bad_extra): continue
        filtered.append(h)
    return filtered

# Re-fetch pass needs to inject racer_id into the search filter; do it via
# a closure.
def patched_fetch_audio(racer_id, query):
    fetch_assets.commons_search = lambda q, want_audio=True, max_size=3_500_000: \
        commons_search_strict(q, want_audio=want_audio, max_size=max_size, racer_id=racer_id)
    return fetch_audio(racer_id, query)


# Queries to retry. Tried simpler, broader forms.
AUDIO_FIXES = [
    ('shuttle',   'rocket'),
    ('airliner',  'airplane'),
    ('f1',        'racecar'),           # if fails, fallback below
    ('f16',       'jet'),               # share generic jet sound
    ('f18',       'jet'),
    ('falcon',    'hawk'),              # similar bird-of-prey
    ('dragon',    'reptile'),
    ('lion',      'roar'),
    ('tiger',     'big cat'),
    ('rhino',     'rhino'),
    ('whale',     'whale'),
    ('wolf',      'howl'),
    ('longneck',  'elephant'),          # low rumble fallback
    ('crocodile', 'alligator'),         # re-run with strict filter to confirm
]

# If a fetch still fails, copy one of these known-good files to the dest.
# Using files already downloaded in pilot / earlier passes.
FALLBACKS = {
    'shuttle':  'f22.ogg',      # jet engine rumble — space shuttle substitute
    'airliner': 'f22.ogg',
    'f1':       'bugatti.ogg',  # revving car engine
    'f16':      'f22.ogg',
    'f18':      'f22.ogg',
    'dragon':   'bear.ogg',     # growl
    'lion':     'bear.ogg',
    'longneck': 'elephant.ogg', # low rumble / trumpet
}

manifest = json.loads(MANIFEST.read_text())
changed = []

for racer_id, query in AUDIO_FIXES:
    out = SOUNDS_DIR / f"{racer_id}.ogg"
    if out.exists():
        out.unlink()
    print(f"{racer_id}: searching '{query}'")
    meta = patched_fetch_audio(racer_id, query)
    if meta:
        manifest.setdefault(racer_id, {})['audio'] = meta
        print(f"   ok  title={meta.get('title')[:70]}")
        changed.append(racer_id)
    else:
        src = FALLBACKS.get(racer_id)
        if src and (SOUNDS_DIR / src).exists():
            shutil.copy(SOUNDS_DIR / src, out)
            manifest.setdefault(racer_id, {})['audio'] = {
                'title': f'[shared] {src}',
                'source_page': '',
                'source_original': '',
                'license': '(shared with another racer)',
                'license_url': '',
                'author': '',
                'query': query,
                'shared_from': src,
                'file': str(out.relative_to(REPO)),
            }
            print(f"   fallback -> copied {src}")
            changed.append(racer_id)
        else:
            print("   FAIL (no fallback)")
            # Drop the audio entry so gen_data.py won't emit a dead sfx link
            if 'audio' in manifest.get(racer_id, {}):
                del manifest[racer_id]['audio']

MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False))
print(f"\nChanged: {changed}")
