window.LG_EDI = (function () {
  const LS_URL = "loop-guard-edi-url";
  const LS_MUTE = "loop-guard-edi-mute";
  const DEFAULT_URL = "http://localhost:5000";

  let url = localStorage.getItem(LS_URL) || DEFAULT_URL;
  let muted = localStorage.getItem(LS_MUTE) === "1";
  let current = "idle";
  let lastIntensity = -1;
  let lastIntensityAt = 0;

  function base() {
    return (url || DEFAULT_URL).replace(/\/$/, "");
  }

  function fire(path) {
    if (muted) return Promise.resolve();
    const href = base() + path;
    return fetch(href, { method: "POST", mode: "no-cors" }).catch(() => {
      return fetch(href, { method: "GET", mode: "no-cors" }).catch(() => {});
    });
  }

  function play(name, seekMs) {
    if (!name) return;
    if (muted) return;
    current = name;
    const q = seekMs ? ("?seek=" + Math.max(0, Math.floor(seekMs))) : "";
    fire("/Edi/Play/" + encodeURIComponent(name) + q);
  }

  function stop() {
    current = null;
    fire("/Edi/Stop");
  }

  function idle() {
    if (muted) {
      stop();
      return;
    }
    play("idle");
  }

  function intensity(pct) {
    if (muted) return;
    const n = Math.max(0, Math.min(100, Math.round(pct)));
    const now = performance.now();
    if (n === lastIntensity && now - lastIntensityAt < 120) return;
    if (now - lastIntensityAt < 70) return;
    lastIntensity = n;
    lastIntensityAt = now;
    fire("/Edi/Intensity/" + n);
  }

  function setMuted(on) {
    muted = !!on;
    localStorage.setItem(LS_MUTE, muted ? "1" : "0");
    if (muted) stop();
    else idle();
  }

  function setUrl(next) {
    url = next || DEFAULT_URL;
    localStorage.setItem(LS_URL, url);
  }

  return {
    DEFAULT_URL,
    play,
    stop,
    idle,
    intensity,
    setMuted,
    setUrl,
    isMuted: () => muted,
    url: () => url,
    current: () => current
  };
})();
