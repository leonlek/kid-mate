/* Pre-recorded voice clips with a device-TTS fallback — shared by games.
   A game loads its own `voice/map.js` (window.VOICE_MAP = { "sentence": "clipid" },
   written by tools/gen_voice.py) and calls VoiceClips.say(text, audioCtx, fallback, lang).
   Thai lines are keyed by text; other languages by "en|A", "zh|大", "ja|大".
   Any line without a clip — or a clip that fails to load (offline, not cached
   yet) — goes to `fallback(text)`, so the game never goes silent.
   VoiceClips.lines(fn): the game's list of every line it can say; `index.html?lines`
   prints it for tools/gen_voice.py (entries: "thai text" or ["en", "A"]). */
window.VoiceClips = (function () {
  const bufs = {};
  let src = null, token = 0;
  const norm = (t) => String(t).replace(/\s+/g, ' ').trim();
  const key = (t, lang) => {
    const l = (lang || 'th').slice(0, 2).toLowerCase();
    return l === 'th' ? norm(t) : l + '|' + norm(t);
  };
  function stop() {
    token++;
    if (src) { try { src.stop(); } catch (e) {} src = null; }
  }
  let own = null;      // for games without a Web Audio context of their own (audio-unlock resumes it)
  function ctx() {
    if (!own) { try { own = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
    return own;
  }
  // Resolves true once the clip has played to the end (and nothing newer was asked for)
  // — lets a game chain lines; false if it fell back to TTS or was cut off.
  function say(text, ac, fallback, lang) {
    stop();
    ac = ac || ctx();
    const my = token, id = (window.VOICE_MAP || {})[key(text, lang)];
    if (!id || !ac) { fallback(text); return Promise.resolve(false); }
    const p = bufs[id] || (bufs[id] = fetch('voice/' + id + '.mp3')
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
      .then((b) => new Promise((ok, no) => ac.decodeAudioData(b, ok, no))));
    return p.then((buf) => new Promise((done) => {
      if (my !== token) { done(false); return; }   // a newer line was asked for meanwhile
      const s = src = ac.createBufferSource(); s.buffer = buf; s.connect(ac.destination);
      s.onended = () => done(my === token && src === s);
      s.start();
    }), () => { delete bufs[id]; if (my === token) fallback(text); return false; });
  }
  function lines(fn) {
    if (location.search !== '?lines') return;
    const seen = new Set(), out = [];
    for (const l of fn()) {
      const [lang, t] = Array.isArray(l) ? l : ['th', l];
      const k = key(t, lang), l2 = lang.slice(0, 2).toLowerCase();
      if (!seen.has(k)) { seen.add(k); out.push(l2 === 'th' ? norm(t) : [l2, norm(t)]); }
    }
    const pre = document.createElement('pre'); pre.id = 'voice-lines';
    pre.textContent = JSON.stringify(out); document.body.appendChild(pre);
  }
  return { say, stop, key, lines };
})();
