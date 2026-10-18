/* Shared Web Audio unlock for iPhone/iPad Safari — loaded first by every game.
   Why: Safari can leave an AudioContext 'suspended' or 'interrupted' (screen lock, app
   switch, call, new tab…) and only a user gesture can resume it; games that resume just
   once, or only when 'suspended', then stay silent. This wraps AudioContext so that
   (1) every context is resumed right after creation and on every tap/touch/key, and
   (2) the page asks for the 'playback' audio session, so sound is not swallowed by the
       iPad's silent/mute mode (Safari 16.4+; ignored elsewhere). */
(function () {
  var AC0 = window.AudioContext || window.webkitAudioContext;
  if (!AC0 || AC0.__kmWrapped) return;
  var ctxs = [];
  function resume(c) {
    if (c.state === 'running') return;
    try { var p = c.resume(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
  }
  function Wrapped(opts) {
    var c = opts ? new AC0(opts) : new AC0();
    ctxs.push(c);
    resume(c);                      // created inside a gesture → resume in the same gesture
    return c;
  }
  Wrapped.prototype = AC0.prototype;
  Wrapped.__kmWrapped = true;
  window.AudioContext = Wrapped;
  if (window.webkitAudioContext) window.webkitAudioContext = Wrapped;
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
  function wake() { for (var i = 0; i < ctxs.length; i++) resume(ctxs[i]); }
  ['touchstart', 'touchend', 'pointerdown', 'pointerup', 'mousedown', 'click', 'keydown'].forEach(function (t) {
    document.addEventListener(t, wake, { capture: true, passive: true });
  });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) wake(); });
  window.addEventListener('pageshow', wake);
  window.addEventListener('focus', wake);
})();
