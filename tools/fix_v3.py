#!/usr/bin/env python3
"""Final pass: stop trusting Commons full-text search for edge cases.

For racers where three search passes failed to find a real-matching sound,
share an already-good sound from a similar racer. Commons' search matches
too loosely for words like "roar" (which hit a lemur) and "jet" (which hit
a Dutch woman's voice recording). Sharing is honest — credits flag it.
"""
import json, shutil, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from tools.fetch_assets import MANIFEST, SOUNDS_DIR, REPO

# Replacements: (target_id, share_from_id)
# Each "share_from" has a correctly-licensed audio already on disk.
SHARES = [
    ('shuttle', 'f22'),          # deep jet rumble substitutes for rocket
    ('f16',     'f22'),          # same jet sound for all 3 fighters
    ('f18',     'f22'),
    ('lion',    'bear'),         # bear growl beats a lemur's roar
    ('wolf',    'bear'),         # the lemur howl we got is misleading
    ('dragon',  'bear'),         # similar growl — user approved "similar sounds"
    ('crocodile', 'supercroc'),  # supercroc already has a crocodile growl clip
]

# Racers where we couldn't find any usable sound — drop sfx entirely so the
# game just speaks the English name on tap.
DROP_SFX = ['rhino']

manifest = json.loads(MANIFEST.read_text())

for tgt, src in SHARES:
    src_path = SOUNDS_DIR / f"{src}.ogg"
    tgt_path = SOUNDS_DIR / f"{tgt}.ogg"
    if not src_path.exists():
        print(f"skip {tgt}: source {src} missing")
        continue
    shutil.copy(src_path, tgt_path)
    src_entry = manifest.get(src, {}).get('audio', {})
    manifest.setdefault(tgt, {})['audio'] = {
        'title': f'[shared] {src_entry.get("title","")}',
        'source_page': src_entry.get('source_page', ''),
        'source_original': src_entry.get('source_original', ''),
        'license': src_entry.get('license', ''),
        'license_url': src_entry.get('license_url', ''),
        'author': src_entry.get('author', ''),
        'shared_from': src,
        'file': str(tgt_path.relative_to(REPO)),
    }
    print(f"{tgt} <- shared from {src}  ({tgt_path.stat().st_size}B)")

for rid in DROP_SFX:
    p = SOUNDS_DIR / f"{rid}.ogg"
    if p.exists(): p.unlink()
    if rid in manifest and 'audio' in manifest[rid]:
        del manifest[rid]['audio']
    print(f"{rid}: sfx dropped — speech-only")

MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False))
print("\nDone.")
