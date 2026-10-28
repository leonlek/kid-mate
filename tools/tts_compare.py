#!/usr/bin/env python3
"""Thai TTS comparison: render test sentences with every provider that has a key
in tools/.tts-keys, then build ONE self-contained page (mp3s inlined as data URIs)
to listen side by side — open it on the iPad and tap 👍 on the voice you like.

  python3 tools/tts_compare.py      →  tools/_tts_compare/compare.html

Providers without a key are skipped. The page also has a "เสียงเครื่อง" button
(speechSynthesis) so the current device voice is the baseline.
Output is git-ignored; nothing here ships with the games.
"""
import base64, json, os, sys, time, urllib.request, urllib.error
from xml.sax.saxutils import escape

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '_tts_compare')

# Hard cases on purpose: tones, loanwords, decimals, numbers, letter names.
SENTENCES = [
    'สวัสดีจ้ะ มาเล่นกันเถอะ',
    'สามเหลี่ยม',
    'ก ไก่ … ฮ นกฮูก',
    'เสือชีตาห์ วิ่งเร็วที่สุด',
    'ดาวพฤหัสบดี เป็นดาวเคราะห์ที่ใหญ่ที่สุด',
    'บนดาวอังคาร หนูจะหนัก 7.6 กิโลกรัม',
    'ถ้าอยู่บนดาวพุธ หนูจะอายุ 20 ปี',
    'กระโดดได้สูง 79 เซนติเมตร',
    'ดวงจันทร์ข้างขึ้น สว่างครึ่งดวง',
    'เก่งมาก! ถูกต้องแล้ว',
]
# Played back to back — tests whether pre-made pieces can be glued for numbers.
STITCH = ['บนดาวอังคาร หนูจะหนัก', '7.6', 'กิโลกรัม']


def load_keys():
    keys = {}
    with open(os.path.join(HERE, '.tts-keys'), encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1)
                keys[k.strip()] = v.strip()
    return keys


def post(url, headers, body):
    for attempt in range(6):
        req = urllib.request.Request(url, data=body, headers=headers, method='POST')
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code != 429 or attempt == 5:    # free tiers rate-limit per minute
                raise
            time.sleep(5 * (attempt + 1))


def azure(keys):
    key, region = keys.get('AZURE_SPEECH_KEY'), keys.get('AZURE_SPEECH_REGION')
    if not key or not region:
        return []
    url = f'https://{region}.tts.speech.microsoft.com/cognitiveservices/v1'
    hdr = {'Ocp-Apim-Subscription-Key': key, 'Content-Type': 'application/ssml+xml',
           'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3', 'User-Agent': 'kidslen-tts'}

    def make(voice):
        def say(text):
            ssml = (f"<speak version='1.0' xml:lang='th-TH'><voice name='{voice}'>"
                    f"<prosody rate='-8%'>{escape(text)}</prosody></voice></speak>")
            return post(url, hdr, ssml.encode('utf-8'))
        return say
    return [(f'Azure {v.split("-")[2].replace("Neural", "")}', make(v))
            for v in ('th-TH-PremwadeeNeural', 'th-TH-AcharaNeural', 'th-TH-NiwatNeural')]


def elevenlabs(keys):
    key = keys.get('ELEVENLABS_API_KEY')
    if not key:
        return []
    # Comma-separated voice ids from the Voice Library (pick Thai-native voices).
    ids = [v for v in keys.get('ELEVENLABS_VOICE_IDS', '').split(',') if v.strip()]
    if not ids:
        print('  ElevenLabs: no ELEVENLABS_VOICE_IDS — skipped')
        return []

    def make(vid):
        def say(text):
            body = json.dumps({'text': text, 'model_id': keys.get('ELEVENLABS_MODEL', 'eleven_v3'),
                               'language_code': 'th'}).encode('utf-8')
            return post(f'https://api.elevenlabs.io/v1/text-to-speech/{vid.strip()}?output_format=mp3_44100_64',
                        {'xi-api-key': key, 'Content-Type': 'application/json'}, body)
        return say
    return [(f'ElevenLabs {i + 1}', make(v)) for i, v in enumerate(ids)]


def google(keys):
    key = keys.get('GOOGLE_TTS_API_KEY')
    if not key:
        return []

    def make(name):
        def say(text):
            body = json.dumps({'input': {'text': text}, 'voice': {'languageCode': 'th-TH', 'name': name},
                               'audioConfig': {'audioEncoding': 'MP3', 'speakingRate': 0.92}}).encode('utf-8')
            r = post(f'https://texttospeech.googleapis.com/v1/text:synthesize?key={key}',
                     {'Content-Type': 'application/json'}, body)
            return base64.b64decode(json.loads(r)['audioContent'])
        return say
    return [(f'Google {n.split("-", 2)[2]}', make(n)) for n in ('th-TH-Neural2-C', 'th-TH-Chirp3-HD-Aoede')]


def main():
    keys = load_keys()
    voices = azure(keys) + elevenlabs(keys) + google(keys)
    if not voices:
        sys.exit('no keys in tools/.tts-keys')
    os.makedirs(OUT, exist_ok=True)
    texts = SENTENCES + STITCH
    clips = {}                                   # voice → [data-uri or None per text]
    for name, say in voices:
        print(name)
        row = []
        for t in texts:
            try:
                row.append('data:audio/mpeg;base64,' + base64.b64encode(say(t)).decode())
            except (urllib.error.HTTPError, urllib.error.URLError, KeyError) as e:
                print(f'  ✗ {t[:20]}… {getattr(e, "code", e)}')
                row.append(None)
        if any(row):
            clips[name] = row
    data = {'sentences': SENTENCES, 'stitch': STITCH, 'voices': list(clips), 'clips': clips}
    with open(os.path.join(HERE, 'tts_compare_page.html'), encoding='utf-8') as f:
        page = f.read().replace('/*DATA*/null', json.dumps(data, ensure_ascii=False))
    path = os.path.join(OUT, 'compare.html')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(page)
    print(f'→ {path}  ({os.path.getsize(path) // 1024} KB)')


if __name__ == '__main__':
    main()
