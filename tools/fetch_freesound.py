#!/usr/bin/env python3
"""Fetch sounds from Freesound.org for racers that Wikimedia Commons
couldn't cover (or covered wrong). Freesound is a curated sound library,
so queries match real SFX instead of language pronunciation recordings.

Uses Freesound's `previews.preview-hq-mp3` URL — served without OAuth, just
the API token as a query parameter. Still good quality (128 kbps MP3).

Token lives in tools/.freesound_token (gitignored).
"""
import json, os, subprocess, sys, time, urllib.parse, urllib.request
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from tools.fetch_assets import (
    UA, REPO, SOUNDS_DIR, RAW_DIR, MANIFEST, find_loud_zone,
)

TOKEN_FILE = Path(__file__).parent / '.freesound_token'
TOKEN = TOKEN_FILE.read_text().strip()

# Target racers: 16 that had no good Commons audio, plus F1 (wrong Aston Martin).
# Preferred licenses: CC0 (ideal), CC-BY (acceptable with attribution).
FS_LICENSES = '("Creative Commons 0" OR "Attribution" OR "Attribution NonCommercial")'

TARGETS = [
    ('horse',    'horse neigh whinny'),
    ('cow',      'cow moo'),
    ('pig',      'pig oink'),
    ('duck',     'duck quack'),
    ('bee',      'bee buzz'),
    ('hornet',   'wasp buzz'),
    ('parrot',   'parrot squawk'),
    ('monkey',   'monkey howl'),
    ('fox',      'fox scream'),
    ('squirrel', 'squirrel chatter'),
    ('seal',     'seal bark'),
    ('hippo',    'hippo grunt'),
    ('dolphin',  'dolphin click'),
    ('eagle',    'eagle cry'),
    ('crocodile','alligator growl'),
    ('human',    'footsteps running sprint'),
    # F1: Aston Martin DB3 was a 1950s sports car — replace with real F1 engine
    ('f1',       'formula 1 race car'),
]


def fs_search(query: str, limit: int = 10) -> list[dict]:
    """Return Freesound search hits matching our filters."""
    params = {
        'query': query,
        'filter': f'duration:[1 TO 15] license:{FS_LICENSES}',
        'fields': 'id,name,username,license,duration,previews',
        'sort': 'rating_desc',
        'page_size': limit,
        'token': TOKEN,
    }
    url = 'https://freesound.org/apiv2/search/text/?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    try:
        with urllib.request.urlopen(req, timeout=25) as r:
            data = json.load(r)
    except Exception as e:
        print(f"   !! search failed: {e}")
        return []
    return data.get('results', [])


def fs_download_preview(hit: dict, out: Path) -> bool:
    """Download the HQ preview MP3 for a search result."""
    previews = hit.get('previews') or {}
    url = previews.get('preview-hq-mp3') or previews.get('preview-lq-mp3')
    if not url:
        return False
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    try:
        with urllib.request.urlopen(req, timeout=30) as r, open(out, 'wb') as f:
            f.write(r.read())
        return True
    except Exception as e:
        print(f"   !! download failed: {e}")
        return False


def process_audio(src: Path, dst: Path, clip_len: float = 3.0, boost_db: float = 0.0) -> bool:
    start = find_loud_zone(src, clip_len)
    fade_out = round(clip_len - 0.25, 2)
    af = f"loudnorm=I=-18:TP=-1.5:LRA=11,afade=t=in:st=0:d=0.08,afade=t=out:st={fade_out}:d=0.25"
    if boost_db:
        af = f"volume={boost_db}dB,{af}"
    cmd = [
        'ffmpeg', '-y', '-loglevel', 'error',
        '-ss', str(start), '-t', str(clip_len), '-i', str(src),
        '-af', af, '-c:a', 'libopus', '-b:a', '64k',
        str(dst),
    ]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0 or dst.stat().st_size < 5000:
        return False
    return True


def fs_license_short(url: str) -> str:
    # Freesound returns license as a URL — map back to a short name.
    if 'publicdomain/zero' in url: return 'CC0'
    if 'by-nc-sa' in url: return 'CC BY-NC-SA'
    if 'by-nc-nd' in url: return 'CC BY-NC-ND'
    if 'by-nc' in url: return 'CC BY-NC'
    if 'by-sa' in url: return 'CC BY-SA'
    if 'by-nd' in url: return 'CC BY-ND'
    if '/by/' in url: return 'CC BY'
    if 'sampling' in url: return 'Sampling+'
    return url


def main() -> None:
    manifest = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {}

    for racer_id, query in TARGETS:
        print(f"\n[{racer_id}] query={query!r}")
        hits = fs_search(query)
        if not hits:
            print(f"   !! no hits")
            continue

        # Try each hit until processing succeeds (some previews 404 etc.)
        picked = None
        for h in hits:
            raw = RAW_DIR / f"fs_{racer_id}_{h['id']}.mp3"
            if not fs_download_preview(h, raw):
                continue
            dst = SOUNDS_DIR / f"{racer_id}.ogg"
            if process_audio(raw, dst):
                picked = h
                break
            else:
                print(f"   (skipped hit {h['id']} — process_audio failed)")

        if not picked:
            print(f"   !! could not process any candidate")
            continue

        manifest.setdefault(racer_id, {}).setdefault('en', racer_id.capitalize())
        manifest[racer_id]['audio'] = {
            'title': f"Freesound #{picked['id']} — {picked['name']}",
            'source_page': f"https://freesound.org/s/{picked['id']}/",
            'source_original': picked.get('previews', {}).get('preview-hq-mp3', ''),
            'license': fs_license_short(picked.get('license', '')),
            'license_url': picked.get('license', ''),
            'author': picked.get('username', ''),
            'query': query,
            'duration': picked.get('duration'),
            'file': str((SOUNDS_DIR / f"{racer_id}.ogg").relative_to(REPO)),
        }
        print(f"   ok  #{picked['id']} by {picked.get('username','?')}  "
              f"{picked.get('duration','?'):.1f}s  {fs_license_short(picked.get('license',''))}")
        time.sleep(0.5)  # polite rate limit

    MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False))
    print("\nDone.")


if __name__ == '__main__':
    main()
