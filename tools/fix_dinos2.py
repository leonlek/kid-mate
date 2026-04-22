#!/usr/bin/env python3
"""Hand-pick specific Commons files for dinosaurs where the previous pass
picked a weak match (Chicxulub impact for Pteranodon, a head-only crop for
T. rex, nothing at all for Sarcosuchus).
"""
import json, sys, urllib.parse
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from tools.fetch_assets import (
    commons_to_thumb, fetch_bytes, fetch_json, image_metadata,
    MANIFEST, IMAGES_DIR, REPO,
)

# Specific file picks — direct Commons File: titles.
PICKS = {
    'pterodactyl': 'File:Pteranodontians and mosasaur.jpg',
    'trex':        'File:Rjpalmer tyrannosaurusrex (white background).jpg',
    'supercroc':   'File:Sarcosuchus Illustration.jpg',
}


def file_url(title: str) -> tuple[str, dict] | None:
    params = {
        'action': 'query', 'format': 'json',
        'titles': title,
        'prop': 'imageinfo',
        'iiprop': 'url|size|mime|extmetadata',
        'iiextmetadatafilter': 'LicenseShortName|Artist|Credit|LicenseUrl',
    }
    url = 'https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(params)
    d = fetch_json(url)
    if not d: return None
    pages = d.get('query', {}).get('pages', {})
    if not pages: return None
    info = (next(iter(pages.values())).get('imageinfo') or [{}])[0]
    return info.get('url'), info


manifest = json.loads(MANIFEST.read_text())

for racer_id, title in PICKS.items():
    print(f"\n{racer_id} <- {title}")
    got = file_url(title)
    if not got:
        print("   lookup FAIL")
        continue
    src_url, info = got
    thumb_url = commons_to_thumb(src_url, 512)
    blob = fetch_bytes(thumb_url) or fetch_bytes(src_url)
    if not blob:
        print("   download FAIL")
        continue
    out = IMAGES_DIR / f"{racer_id}.jpg"
    out.write_bytes(blob)

    ext = info.get('extmetadata', {}) or {}
    def _v(k): return (ext.get(k) or {}).get('value', '')
    manifest.setdefault(racer_id, {})['image'] = {
        'title': title,
        'source_page': f"https://commons.wikimedia.org/wiki/{urllib.parse.quote(title)}",
        'source_original': src_url,
        'license': _v('LicenseShortName'),
        'license_url': _v('LicenseUrl'),
        'author': _v('Artist') or _v('Credit'),
        'file': str(out.relative_to(REPO)),
    }
    print(f"   ok ({out.stat().st_size}B)  lic={_v('LicenseShortName')}")

MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False))
print("\nDone. Re-run gen_credits.py.")
