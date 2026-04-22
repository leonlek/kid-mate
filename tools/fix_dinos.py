#!/usr/bin/env python3
"""Replace the dinosaur photos (skeletons / museum mounts) with life
restorations from Commons' 'Life restorations of X' categories.

The Wikipedia REST API returns the article lead image, which for dinosaurs
is almost always a skeleton or mount — understandable for an encyclopedia
but wrong for a kids' game where they expect to see a living animal.
"""
import json, sys, urllib.parse
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from tools.fetch_assets import (
    UA, commons_to_thumb, fetch_bytes, fetch_json, image_metadata,
    MANIFEST, IMAGES_DIR, REPO,
)

# (racer_id, commons_category) — Commons naming is "<Genus> life restorations"
TARGETS = [
    ('pterodactyl', 'Category:Pteranodon life restorations'),
    ('raptor',      'Category:Velociraptor life restorations'),
    ('trex',        'Category:Tyrannosaurus life restorations'),
    ('supercroc',   'Category:Sarcosuchus life restorations'),
    ('longneck',    'Category:Brachiosaurus life restorations'),
]


def find_in_category(category: str) -> list[dict]:
    """Return file entries in a Commons category, with URL + metadata."""
    params = {
        'action': 'query', 'format': 'json',
        'generator': 'categorymembers',
        'gcmtitle': category,
        'gcmtype': 'file',
        'gcmlimit': 20,
        'prop': 'imageinfo',
        'iiprop': 'url|size|mime|extmetadata',
        'iiextmetadatafilter': 'LicenseShortName|Artist|Credit|LicenseUrl',
    }
    url = 'https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(params)
    d = fetch_json(url)
    if not d: return []
    pages = d.get('query', {}).get('pages', {})
    out = []
    for p in pages.values():
        info = (p.get('imageinfo') or [{}])[0]
        mime = info.get('mime', '')
        if mime not in ('image/jpeg', 'image/png'):
            continue
        size = info.get('size', 0)
        if size < 40_000 or size > 3_000_000:  # avoid tiny thumbs and huge originals
            continue
        ext = info.get('extmetadata', {}) or {}
        def _v(k): return (ext.get(k) or {}).get('value', '')
        out.append({
            'title': p.get('title', ''),
            'url': info.get('url', ''),
            'size': size,
            'mime': mime,
            'license': _v('LicenseShortName'),
            'license_url': _v('LicenseUrl'),
            'author': _v('Artist') or _v('Credit'),
        })
    return out


manifest = json.loads(MANIFEST.read_text())

for racer_id, category in TARGETS:
    print(f"\n{racer_id}: looking in '{category}'")
    hits = find_in_category(category)
    if not hits:
        # Try search-based fallback: "<name> restoration"
        print(f"   no hits in category, trying broader search")
        from tools.fetch_assets import commons_search as _search
        # search expects audio or not — here we want images, so we need to adapt.
        # Use MediaWiki search API directly.
        species_map = {
            'pterodactyl': 'Pteranodon',
            'raptor':      'Velociraptor',
            'trex':        'Tyrannosaurus',
            'supercroc':   'Sarcosuchus',
            'longneck':    'Brachiosaurus',
        }
        q = f"{species_map[racer_id]} restoration"
        params = {
            'action': 'query', 'format': 'json',
            'generator': 'search',
            'gsrsearch': q + ' filemime:image/jpeg|image/png',
            'gsrnamespace': 6, 'gsrlimit': 20,
            'prop': 'imageinfo',
            'iiprop': 'url|size|mime|extmetadata',
            'iiextmetadatafilter': 'LicenseShortName|Artist|Credit|LicenseUrl',
        }
        d = fetch_json('https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(params)) or {}
        pages = d.get('query', {}).get('pages', {})
        for p in pages.values():
            info = (p.get('imageinfo') or [{}])[0]
            mime = info.get('mime', '')
            if mime in ('image/jpeg', 'image/png'):
                size = info.get('size', 0)
                if 40_000 <= size <= 3_000_000:
                    ext = info.get('extmetadata', {}) or {}
                    def _v(k): return (ext.get(k) or {}).get('value', '')
                    hits.append({
                        'title': p.get('title', ''),
                        'url': info.get('url', ''),
                        'size': size, 'mime': mime,
                        'license': _v('LicenseShortName'),
                        'license_url': _v('LicenseUrl'),
                        'author': _v('Artist') or _v('Credit'),
                    })

    if not hits:
        print(f"   no candidates found — keeping old image")
        continue

    # Prefer images with "life restoration" or artist drawing signals in title.
    def score(h):
        t = h['title'].lower()
        s = 0
        for kw in ('life', 'restoration', 'reconstruction', 'art'):
            if kw in t: s += 2
        for kw in ('skeleton', 'skull', 'mount', 'fossil', 'specimen', 'holotype', 'bone'):
            if kw in t: s -= 3
        return -s  # sort ascending by -score => highest score first
    hits.sort(key=score)
    pick = hits[0]
    print(f"   -> {pick['title']} ({pick['size']}B, {pick['license']})")

    # Download as 512px thumb
    thumb_url = commons_to_thumb(pick['url'], 512)
    blob = fetch_bytes(thumb_url) or fetch_bytes(pick['url'])
    if not blob:
        print("   download FAIL, keeping old image")
        continue

    out = IMAGES_DIR / f"{racer_id}.jpg"
    out.write_bytes(blob)
    manifest.setdefault(racer_id, {})['image'] = {
        'title': pick['title'],
        'source_page': f"https://commons.wikimedia.org/wiki/{urllib.parse.quote(pick['title'])}",
        'source_original': pick['url'],
        'license': pick['license'],
        'license_url': pick['license_url'],
        'author': pick['author'],
        'file': str(out.relative_to(REPO)),
    }
    print(f"   ok ({out.stat().st_size}B)")

MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False))
print("\nDone. Re-run gen_credits.py.")
