/* LG_WEB phone/web layer. Loaded after edi.js, before game.js. Desktop build never loads this file. */
(function () {
  window.LG_WEB = true;
  // 1) EDI: silent no-op with the same API (no network, no toasts).
  var real = window.LG_EDI || {};
  var stub = {};
  Object.keys(real).forEach(function (k) { stub[k] = typeof real[k] === "function" ? function () {} : real[k]; });
  stub.play = stub.stop = stub.idle = stub.intensity = stub.setMuted = stub.setUrl = function () {};
  stub.url = function () { return ""; };
  stub.current = function () { return null; };
  stub.muted = function () { return true; };
  stub.isMuted = function () { return true; };
  window.LG_EDI = stub;
  // 2) Video: never fetch clips. Setting a video src fires 'error' so the game shows its placeholder and the rail runs.
  var desc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, "src");
  Object.defineProperty(HTMLMediaElement.prototype, "src", {
    configurable: true,
    get: function () { return this instanceof HTMLVideoElement ? (this.getAttribute("data-websrc") || "") : desc.get.call(this); },
    set: function (v) {
      if (!(this instanceof HTMLVideoElement)) return desc.set.call(this, v);
      this.setAttribute("data-websrc", String(v || ""));
      var el = this;
      setTimeout(function () { el.dispatchEvent(new Event("error")); }, 0);
    }
  });
  var realPlay = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () {
    if (this instanceof HTMLVideoElement) return Promise.resolve();
    return realPlay.apply(this, arguments);
  };
  // 3) Page tweaks once DOM is ready.
  function ready() {
    // sex-scene SFX are not shipped in the web build: clip audio is a silent no-op (ambience + UI sounds still play)
    if (window.LG_AUDIO && window.LG_AUDIO.playClip) window.LG_AUDIO.playClip = function () {};
    document.documentElement.classList.add("lg-web");
    var ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (ios || !document.fullscreenEnabled) document.documentElement.classList.add("lg-nofs");
    var miss = document.querySelector("#peek-miss > div");
    if (miss) miss.innerHTML = "<b>Scene clip</b><br>Not included in the web build.<br>Lines and choices below carry on as normal.";
    var stamp = window.LG_WEB_STAMP || "";
    var wrap = document.querySelector(".title-wrap");
    if (wrap && stamp) {
      var d = document.createElement("div");
      d.className = "web-stamp"; d.id = "web-stamp"; d.textContent = "Build: " + stamp;
      wrap.appendChild(d);
    }
    // Nightly player card text
    new MutationObserver(function () {
      var c = document.getElementById("ny-clip-card");
      if (c && /^Missing media/.test(c.textContent)) c.textContent = "Scene clip - not included in the web build.";
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready); else ready();
})();
