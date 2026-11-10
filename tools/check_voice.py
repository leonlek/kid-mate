#!/usr/bin/env python3
"""Listen back to every recorded voice clip with Azure speech-to-text and flag the
ones whose transcript doesn't match the text we meant — catches TTS misreadings
(lone Thai letters, odd spellings, numbers, English inside Thai…).

  python3 tools/check_voice.py [game …]        (no game = every game with voice/map.js)
  → prints the worst matches; full report in tools/_voice_check/<game>.json

Transcripts are cached by clip id, so re-runs only send new clips. Needs
AZURE_SPEECH_* in tools/.tts-keys (STT free tier: 5 audio hours / month).
A low score is a lead, not proof: STT writes numbers as digits, may spell a lone
letter differently, etc. — listen to the flagged clips before changing anything.
"""
import json, os, re, subprocess, sys, tempfile, time, urllib.request, urllib.error, difflib
from concurrent.futures import ThreadPoolExecutor

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tts_compare import load_keys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'tools', '_voice_check')
LANG = {'th': 'th-TH', 'en': 'en-US', 'zh': 'zh-CN', 'ja': 'ja-JP'}
TAGGED = re.compile(r'^[a-z]{2,3}(-[a-z]{2})?\|')   # "en|A", "ko-kr|안녕하세요"; Thai keys carry no tag
THAI_DIGIT =dict(zip('0123456789', ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า']))


def read_map(game):
    src = open(os.path.join(ROOT, game, 'voice', 'map.js'), encoding='utf-8').read()
    return json.loads(src[src.index('{'):src.rindex('}') + 1])


_tok = {'t': None, 'at': 0}
def token(keys):                       # bearer token, valid 10 min
    if not _tok['t'] or time.time() - _tok['at'] > 480:
        for i in range(8):
            try:
                req = urllib.request.Request(f"https://{keys['AZURE_SPEECH_REGION']}.api.cognitive.microsoft.com/sts/v1.0/issueToken",
                                             data=b'', method='POST', headers={'Ocp-Apim-Subscription-Key': keys['AZURE_SPEECH_KEY']})
                _tok['t'] = urllib.request.urlopen(req, timeout=30).read().decode(); _tok['at'] = time.time(); break
            except urllib.error.HTTPError as e:
                if e.code != 429: raise
                time.sleep(10 * (i + 1))
    return _tok['t']


def stt(keys, wav, lang):
    url = (f"https://{keys['AZURE_SPEECH_REGION']}.stt.speech.microsoft.com/speech/recognition/conversation/"
           f"cognitiveservices/v1?language={lang}&format=simple")
    body = open(wav, 'rb').read()
    for i in range(8):                  # the free tier rate-limits hard: back off and retry
        req = urllib.request.Request(url, data=body, method='POST', headers={
            'Authorization': 'Bearer ' + token(keys), 'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000'})
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.loads(r.read()).get('DisplayText', '')
        except urllib.error.HTTPError as e:
            if e.code == 401: _tok['t'] = None
            elif e.code != 429: return f'!{e.code}'   # e.g. a language STT doesn't support
            time.sleep(5 * (i + 1))
        except (TimeoutError, OSError):
            time.sleep(5 * (i + 1))
    return '?'


def pad(wav):
    """Short clips get their tail cut off by STT end-pointing — add silence around them."""
    import wave
    r = wave.open(wav); fr = r.readframes(r.getnframes()); r.close()
    sil = b'\x00\x00' * 16000
    w = wave.open(wav, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(16000); w.writeframes(sil + fr + sil); w.close()


def norm(t):
    t = re.sub(r'(\d),(\d)', r'\1\2', t)
    t = re.sub(r'[\s.,!?;:·\'"“”‘’()\-–—…]', '', t.lower())
    return t


def digits_to_thai(t):
    # crude: STT writes "16" where the text says สิบหก (or vice versa) — compare both ways
    return re.sub(r'\d', lambda m: THAI_DIGIT[m.group()], t)


EN_NUM = {w: str(i) for i, w in enumerate('zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split())}
EN_NUM.update({w: str(10 * i) for i, w in enumerate('_ _ twenty thirty forty fifty sixty seventy eighty ninety'.split()) if i > 1})


def en_words_to_digits(t):
    def one(m):
        p = m.group().lower().split('-')
        return str(sum(int(EN_NUM[x]) for x in p)) if all(x in EN_NUM for x in p) else m.group()
    return re.sub(r"[A-Za-z]+(?:-[A-Za-z]+)?", one, t)


def score(want, got):
    want = en_words_to_digits(want)
    a, b = norm(want), norm(got)
    s = difflib.SequenceMatcher(None, a, b).ratio()
    s2 = difflib.SequenceMatcher(None, digits_to_thai(a), digits_to_thai(b)).ratio()
    return max(s, s2)


def check(game, keys):
    os.makedirs(OUT, exist_ok=True)
    cache_f = os.path.join(OUT, game + '.json')
    cache = json.load(open(cache_f, encoding='utf-8')) if os.path.exists(cache_f) else {}
    vmap = read_map(game)

    def one(item):
        key, cid = item
        if cid in cache:
            return key, cid, cache[cid]
        lang, text = (key.split('|', 1) if TAGGED.match(key) else ('th', key))
        mp3 = os.path.join(ROOT, game, 'voice', cid + '.mp3')
        with tempfile.TemporaryDirectory() as d:
            wav = os.path.join(d, 'a.wav')
            subprocess.run(['afconvert', '-f', 'WAVE', '-d', 'LEI16@16000', '-c', '1', mp3, wav], check=True, capture_output=True)
            pad(wav)
            got = stt(keys, wav, LANG.get(lang) or lang.split('-')[0] + '-' + lang.split('-')[1].upper())
        return key, cid, got

    with ThreadPoolExecutor(2) as ex:
        res = list(ex.map(one, vmap.items()))
    rows = []
    for key, cid, got in res:
        if got != '?':
            cache[cid] = got
        want = key.split('|', 1)[1] if TAGGED.match(key) else key
        if got == '?':
            cache.pop(cid, None)        # failed after retries — try again next run
        rows.append({'text': key, 'heard': got, 'score': round(score(want, got), 2), 'clip': cid})
    json.dump(cache, open(cache_f, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    rows.sort(key=lambda r: r['score'])
    json.dump(rows, open(os.path.join(OUT, game + '.report.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    return rows


def main():
    keys = load_keys()
    games = sys.argv[1:] or sorted(g for g in os.listdir(ROOT) if os.path.exists(os.path.join(ROOT, g, 'voice', 'map.js')))
    for g in games:
        rows = check(g, keys)
        bad = [r for r in rows if r['score'] < 0.75]
        print(f'== {g}: {len(rows)} clips, {len(bad)} below 0.75')
        for r in bad[:40]:
            print(f"  {r['score']:.2f}  want: {r['text']}\n        heard: {r['heard']}")


if __name__ == '__main__':
    main()
