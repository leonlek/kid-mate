#!/usr/bin/env python3
"""Fetch images + audio for every racer from Wikimedia Commons / Wikipedia.

Why one big script:
- We want a single-source-of-truth mapping (id -> wiki slug, audio query, en name).
- Every asset needs a license captured for CREDITS.md — doing it as a standalone
  step avoids hand-tracking 64 files.
- Audio needs a consistent trim + loudness-normalise pipeline; doing it inline
  keeps the knobs in one place.

Run:  python3 tools/fetch_assets.py

Outputs:
- animal-race/assets/images/<id>.jpg   (512px Wikipedia lead image)
- animal-race/assets/sounds/<id>.ogg   (~3s trimmed Opus clip)
- tools/_raw_audio/<id>.<ext>          (untrimmed original, gitignored)
- tools/asset_manifest.json            (licenses, authors, source URLs)
"""
import json, os, subprocess, sys, time, urllib.parse, urllib.request
from pathlib import Path

UA = "kid-mate-dev/1.0 (contact: leonlek@hotmail.com; https://github.com/leonlek/kid-mate)"

REPO = Path(__file__).resolve().parent.parent
IMAGES_DIR = REPO / "animal-race" / "assets" / "images"
SOUNDS_DIR = REPO / "animal-race" / "assets" / "sounds"
RAW_DIR    = REPO / "tools" / "_raw_audio"
MANIFEST   = REPO / "tools" / "asset_manifest.json"

for d in (IMAGES_DIR, SOUNDS_DIR, RAW_DIR):
    d.mkdir(parents=True, exist_ok=True)

# Racers already done in pilot — the script preserves their files untouched.
ALREADY_DONE = {'cheetah', 'dog', 'snail', 'bugatti', 'f22'}

# (id, wiki_slug, audio_query_or_None, en_name, audio_size_range_bytes)
# audio_query=None → no sfx (speech-only on tap)
# Some entries use a "similar" sound since the racer has no natural vocalisation.
RACERS = [
  # Aircraft
  ('shuttle',     'Space_Shuttle',                           'rocket launch',              'Space shuttle'),
  ('f16',         'General_Dynamics_F-16_Fighting_Falcon',   'fighter jet',                'F-16'),
  ('f18',         'McDonnell_Douglas_F/A-18_Hornet',         'fighter jet',                'F-18 Hornet'),
  ('airliner',    'Airliner',                                 'airliner takeoff',           'Airliner'),
  # Vehicles
  ('f1',          'Formula_One',                              'Formula One race car',       'Formula 1'),
  ('lambo',       'Lamborghini',                              'lamborghini engine',         'Lamborghini'),
  ('ferrari',     'Ferrari',                                  'ferrari engine',             'Ferrari'),
  ('ducati',      'Ducati',                                   'motorcycle engine',          'Ducati motorcycle'),
  # Birds
  ('falcon',      'Peregrine_falcon',                         'peregrine falcon call',      'Peregrine falcon'),
  ('eagle',       'Eagle',                                    'eagle call',                 'Eagle'),
  ('swan',        'Swan',                                     'swan call',                  'Swan'),
  ('crow',        'Crow',                                     'crow caw',                   'Crow'),
  ('owl',         'Owl',                                      'owl hoot',                   'Owl'),
  ('flamingo',    'Flamingo',                                 'flamingo call',              'Flamingo'),
  ('parrot',      'Parrot',                                   'parrot',                     'Parrot'),
  ('chicken',     'Chicken',                                  'rooster crow',               'Chicken'),
  ('duck',        'Duck',                                     'duck quack',                 'Duck'),
  ('penguin',     'Penguin',                                  'penguin call',               'Penguin'),
  # Fantasy
  ('dragon',      'European_dragon',                          'komodo dragon hiss',         'Dragon'),
  ('unicorn',     'Unicorn',                                  'horse neigh',                'Unicorn'),
  # Wild
  ('deer',        'Deer',                                     'deer call',                  'Deer'),
  ('lion',        'Lion',                                     'lion roar',                  'Lion'),
  ('wolf',        'Wolf',                                     'wolf howl',                  'Wolf'),
  ('kangaroo',    'Kangaroo',                                 None,                          'Kangaroo'),
  ('zebra',       'Zebra',                                    'zebra bark',                 'Zebra'),
  ('tiger',       'Tiger',                                    'tiger roar',                 'Tiger'),
  ('giraffe',     'Giraffe',                                  None,                          'Giraffe'),
  ('rhino',       'Rhinoceros',                               'rhinoceros grunt',           'Rhinoceros'),
  ('fox',         'Red_fox',                                  'red fox call',               'Fox'),
  ('bear',        'Brown_bear',                               'bear growl',                 'Bear'),
  ('elephant',    'Elephant',                                 'elephant trumpet',           'Elephant'),
  ('polarbear',   'Polar_bear',                               None,                          'Polar bear'),
  ('monkey',      'Monkey',                                   'monkey call',                'Monkey'),
  ('squirrel',    'Squirrel',                                 'squirrel chatter',           'Squirrel'),
  ('sloth',       'Sloth',                                    None,                          'Sloth'),
  # Farm / pets
  ('horse',       'Horse',                                    'horse whinny',               'Horse'),
  ('rabbit',      'Rabbit',                                   None,                          'Rabbit'),
  ('cat',         'Cat',                                      'cat meow',                   'Cat'),
  ('cow',         'Cattle',                                   'cow moo',                    'Cow'),
  ('pig',         'Pig',                                      'pig oink',                   'Pig'),
  # Water
  ('sailfish',    'Sailfish',                                 None,                          'Sailfish'),
  ('shark',       'Shark',                                    None,                          'Shark'),
  ('orca',        'Killer_whale',                             'orca whale call',            'Orca'),
  ('whale',       'Blue_whale',                               'blue whale call',            'Blue whale'),
  ('octopus',     'Octopus',                                  None,                          'Octopus'),
  ('dolphin',     'Dolphin',                                  'dolphin click',              'Dolphin'),
  ('seal',        'Pinniped',                                 'seal bark',                  'Seal'),
  ('crab',        'Crab',                                     None,                          'Crab'),
  # Dino
  ('pterodactyl', 'Pteranodon',                               'hawk screech',               'Pterodactyl'),
  ('raptor',      'Velociraptor',                             'bird screech',               'Velociraptor'),
  ('trex',        'Tyrannosaurus',                            'alligator bellow',           'Tyrannosaurus Rex'),
  ('supercroc',   'Sarcosuchus',                              'crocodile growl',            'Sarcosuchus'),
  ('longneck',    'Brachiosaurus',                            'elephant low rumble',        'Brachiosaurus'),
  # Other
  ('human',       'Human',                                    None,                          'Human'),
  ('bee',         'Honey_bee',                                'bee buzz',                   'Bee'),
  ('hornet',      'Hornet',                                   'wasp buzz',                  'Hornet'),
  ('crocodile',   'Nile_crocodile',                           'crocodile bellow',           'Crocodile'),
  ('turtle',      'Sea_turtle',                               None,                          'Turtle'),
]


def fetch_json(url: str, timeout: int = 20) -> dict | None:
    """GET and decode JSON. Returns None on failure."""
    try:
        req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept': 'application/json'})
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.load(r)
    except Exception as e:
        print(f"   !! fetch_json failed: {e}", file=sys.stderr)
        return None


def fetch_bytes(url: str, timeout: int = 30) -> bytes | None:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': UA})
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.read()
    except Exception as e:
        print(f"   !! fetch_bytes failed: {e}", file=sys.stderr)
        return None


def commons_to_thumb(url: str, width: int = 512) -> str:
    """Convert a Wikimedia upload URL to a thumbnail URL at the given width."""
    base = "https://upload.wikimedia.org/wikipedia/commons/"
    if not url.startswith(base):
        return url
    rel = url[len(base):]  # e.g. 9/92/Male_cheetah.jpg
    fname = rel.rsplit('/', 1)[-1]
    return f"{base}thumb/{rel}/{width}px-{fname}"


def image_metadata(commons_filename: str) -> dict:
    """Look up license + author for a File: title on Commons."""
    params = {
        'action': 'query', 'format': 'json',
        'titles': commons_filename,
        'prop': 'imageinfo',
        'iiprop': 'url|extmetadata',
        'iiextmetadatafilter': 'LicenseShortName|Artist|Credit|LicenseUrl',
    }
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(params)
    d = fetch_json(url)
    if not d:
        return {}
    pages = d.get('query', {}).get('pages', {})
    if not pages:
        return {}
    info = next(iter(pages.values())).get('imageinfo', [{}])[0]
    ext = info.get('extmetadata', {})
    def _v(k):
        return (ext.get(k) or {}).get('value', '')
    return {
        'license': _v('LicenseShortName'),
        'license_url': _v('LicenseUrl'),
        'author': _v('Artist') or _v('Credit'),
        'source_page': f"https://commons.wikimedia.org/wiki/{urllib.parse.quote(commons_filename)}",
    }


def fetch_image(racer_id: str, slug: str) -> dict | None:
    """Grab the lead image for a Wikipedia article, downsize to 512px."""
    out = IMAGES_DIR / f"{racer_id}.jpg"
    summary = fetch_json(f"https://en.wikipedia.org/api/rest_v1/page/summary/{urllib.parse.quote(slug, safe='_/')}")
    if not summary:
        return None
    orig = summary.get('originalimage', {}).get('source')
    if not orig:
        print(f"   !! no lead image for {slug}")
        return None
    thumb_url = commons_to_thumb(orig, 512)
    blob = fetch_bytes(thumb_url)
    if not blob:
        # thumb failed, try original
        blob = fetch_bytes(orig)
        if not blob:
            return None
    out.write_bytes(blob)
    # Try to get license — Wikipedia summary tells us the File:title indirectly
    # via titles in imageinfo; simplest is to use the filename at end of URL.
    fname = "File:" + urllib.parse.unquote(orig.rsplit('/', 1)[-1])
    meta = image_metadata(fname)
    meta['file'] = str(out.relative_to(REPO))
    meta['source_original'] = orig
    return meta


def commons_search(query: str, want_audio: bool = True, max_size: int = 2_500_000) -> list[dict]:
    """Search Commons for files. Returns list of {title, url, size, mime}."""
    params = {
        'action': 'query', 'format': 'json',
        'generator': 'search', 'gsrnamespace': 6, 'gsrlimit': 10,
        'gsrsearch': query + (' filetype:audio' if want_audio else ''),
        'prop': 'imageinfo', 'iiprop': 'url|size|mime|extmetadata',
        'iiextmetadatafilter': 'LicenseShortName|Artist|Credit|LicenseUrl',
    }
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(params)
    d = fetch_json(url)
    if not d:
        return []
    pages = d.get('query', {}).get('pages', {})
    out = []
    for p in pages.values():
        info = (p.get('imageinfo') or [{}])[0]
        size = info.get('size') or 0
        mime = info.get('mime') or ''
        if want_audio and not (mime.startswith('audio/') or mime == 'application/ogg' or mime == 'audio/webm'):
            continue
        if size > max_size:
            continue
        if size < 10_000:  # probably not real audio
            continue
        ext = info.get('extmetadata', {}) or {}
        def _v(k):
            return (ext.get(k) or {}).get('value', '')
        out.append({
            'title': p.get('title', ''),
            'url': info.get('url', ''),
            'size': size,
            'mime': mime,
            'license': _v('LicenseShortName'),
            'license_url': _v('LicenseUrl'),
            'author': _v('Artist') or _v('Credit'),
        })
    # Sort: prefer smaller/shorter, then by position
    out.sort(key=lambda x: x['size'])
    return out


def find_loud_zone(path: Path, clip_len: float = 3.0) -> float:
    """Return a start time (seconds) that lands inside a non-silent zone.

    Falls back to 0 if no non-silent zone >= clip_len is found.
    """
    try:
        cmd = ['ffmpeg', '-hide_banner', '-i', str(path),
               '-af', 'silencedetect=noise=-35dB:d=0.3', '-f', 'null', '-']
        out = subprocess.run(cmd, capture_output=True, text=True, timeout=60).stderr
    except Exception:
        return 0.0
    starts, ends = [], []
    for line in out.splitlines():
        if 'silence_start' in line:
            try: starts.append(float(line.split('silence_start:')[1].strip()))
            except: pass
        elif 'silence_end' in line:
            try:
                val = line.split('silence_end:')[1].split('|')[0].strip()
                ends.append(float(val))
            except: pass
    # Build non-silent intervals: from the end of one silence to the start of the next.
    # Also cover the region before first silence_start and after last silence_end.
    try:
        duration = float(subprocess.check_output(
            ['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
             '-of', 'default=noprint_wrappers=1:nokey=1', str(path)]
        ).decode().strip())
    except Exception:
        duration = 0.0
    non_silent: list[tuple[float, float]] = []
    cursor = 0.0
    for i, s in enumerate(starts):
        if s > cursor:
            non_silent.append((cursor, s))
        cursor = ends[i] if i < len(ends) else duration
    if cursor < duration:
        non_silent.append((cursor, duration))
    # Pick the longest interval and start early enough to fit clip_len.
    non_silent = [iv for iv in non_silent if iv[1] - iv[0] >= 0.5]
    if not non_silent:
        return 0.0
    non_silent.sort(key=lambda iv: -(iv[1] - iv[0]))
    st, en = non_silent[0]
    if en - st >= clip_len:
        # Shift a bit into the interval (skip 10% prelude) but leave clip_len inside.
        shift = min(0.2, (en - st - clip_len) * 0.2)
        return round(st + shift, 2)
    return round(st, 2)


def process_audio(src: Path, dst: Path, clip_len: float = 3.0) -> bool:
    """Trim ~3s from a loud zone, loudness-normalise, re-encode Opus."""
    start = find_loud_zone(src, clip_len)
    fade_out = round(clip_len - 0.25, 2)
    cmd = [
        'ffmpeg', '-y', '-loglevel', 'error',
        '-ss', str(start), '-t', str(clip_len), '-i', str(src),
        '-af', f"loudnorm=I=-18:TP=-1.5:LRA=11,afade=t=in:st=0:d=0.08,afade=t=out:st={fade_out}:d=0.25",
        '-c:a', 'libopus', '-b:a', '64k',
        str(dst),
    ]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(f"   !! ffmpeg failed for {src.name}: {r.stderr.strip()}")
        return False
    # Sanity: file must be > 5 KB (opus silence is ~500 B for 3s)
    if dst.stat().st_size < 5000:
        print(f"   !! suspiciously small output for {src.name} ({dst.stat().st_size}B) — likely silent zone")
        return False
    return True


def fetch_audio(racer_id: str, query: str) -> dict | None:
    """Find a Commons audio clip for the query, download, and process."""
    hits = commons_search(query, want_audio=True)
    if not hits:
        print(f"   !! no audio results for '{query}'")
        return None
    # Try each hit until one produces a good processed clip
    for hit in hits[:5]:
        ext_guess = '.ogg'
        if hit['mime'] == 'audio/webm': ext_guess = '.webm'
        elif hit['mime'] == 'audio/mpeg': ext_guess = '.mp3'
        elif hit['mime'] == 'audio/wav' or hit['mime'] == 'audio/x-wav': ext_guess = '.wav'
        raw = RAW_DIR / f"{racer_id}{ext_guess}"
        blob = fetch_bytes(hit['url'])
        if not blob:
            continue
        raw.write_bytes(blob)
        dst = SOUNDS_DIR / f"{racer_id}.ogg"
        ok = process_audio(raw, dst)
        if ok:
            return {
                'title': hit['title'],
                'source_page': f"https://commons.wikimedia.org/wiki/{urllib.parse.quote(hit['title'])}",
                'source_original': hit['url'],
                'license': hit['license'],
                'license_url': hit['license_url'],
                'author': hit['author'],
                'query': query,
                'file': str(dst.relative_to(REPO)),
            }
    return None


def main():
    manifest = {}
    if MANIFEST.exists():
        try:
            manifest = json.loads(MANIFEST.read_text())
        except Exception:
            manifest = {}

    pending = [r for r in RACERS if r[0] not in ALREADY_DONE]
    print(f"Processing {len(pending)} racers (skipping {len(ALREADY_DONE)} pilot)...\n")

    for i, (racer_id, slug, query, en) in enumerate(pending, 1):
        print(f"[{i}/{len(pending)}] {racer_id}  slug={slug}  audio={query!r}")
        entry = manifest.get(racer_id, {})
        entry['en'] = en

        # Image
        if slug and not (IMAGES_DIR / f"{racer_id}.jpg").exists():
            img_meta = fetch_image(racer_id, slug)
            if img_meta:
                entry['image'] = img_meta
                print(f"   img ok ({(IMAGES_DIR / f'{racer_id}.jpg').stat().st_size}B)")
            else:
                print(f"   img FAIL")
        elif slug:
            print(f"   img already exists, skipping download")
        else:
            print(f"   img skipped (no slug)")

        # Audio
        if query and not (SOUNDS_DIR / f"{racer_id}.ogg").exists():
            aud_meta = fetch_audio(racer_id, query)
            if aud_meta:
                entry['audio'] = aud_meta
                print(f"   sfx ok ({(SOUNDS_DIR / f'{racer_id}.ogg').stat().st_size}B)")
            else:
                print(f"   sfx FAIL")
        elif query:
            print(f"   sfx already exists, skipping download")
        else:
            print(f"   sfx skipped (silent racer)")

        manifest[racer_id] = entry

        # Snapshot manifest every few iterations so a mid-run crash doesn't lose progress.
        if i % 5 == 0:
            MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False))
        time.sleep(0.3)  # be polite to Wikimedia

    MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False))
    print(f"\nDone. Manifest: {MANIFEST}")


if __name__ == '__main__':
    main()
