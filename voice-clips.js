/* Pre-recorded Thai voice clips with a device-TTS fallback — shared by games.
   A game loads its own `voice/map.js` (window.VOICE_MAP = { "sentence": "clipid" },
   written by tools/gen_voice.py) and calls VoiceClips.say(text, audioCtx, fallback).
   Any sentence without a clip — or a clip that fails to load (offline, not cached
   yet) — goes to `fallback(text)`, so the game never goes silent. */
window.VoiceClips = (function () {
  const bufs = {};
  let src = null, token = 0;
  const key = (t) => String(t).replace(/\s+/g, ' ').trim();
  function stop() {
    token++;
    if (src) { try { src.stop(); } catch (e) {} src = null; }
  }
  function say(text, ac, fallback) {
    stop();
    const my = token, id = (window.VOICE_MAP || {})[key(text)];
    if (!id || !ac) { fallback(text); return; }
    const p = bufs[id] || (bufs[id] = fetch('voice/' + id + '.mp3')
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
      .then((b) => new Promise((ok, no) => ac.decodeAudioData(b, ok, no))));
    p.then((buf) => {
      if (my !== token) return;                 // a newer line was asked for meanwhile
      src = ac.createBufferSource(); src.buffer = buf; src.connect(ac.destination); src.start();
    }).catch(() => { delete bufs[id]; if (my === token) fallback(text); });
  }
  return { say, stop, key };
})();
