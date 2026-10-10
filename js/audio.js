window.LG_AUDIO = (function () {
  const LS = "lg-audio-mute";
  const VOL = {
    "sfx/apartment_ambience.mp3": 0.025,
    "sfx/outdoor_ambience.mp3": 0.05,
    "sfx/indoor_ambience.mp3": 0.06,
    "sfx/warehouse_day.mp3": 0.06
  };
  const AMB_FALLBACK = 0.05;
  const STAT_VOL = 0.22;
  const CLIP_VOL = 0.28;
  let muted = localStorage.getItem(LS) === "1";
  let amb = null;
  let ambSrc = "";
  let bed = null;
  let one = null;

  function ambVol(src) {
    return VOL[src] != null ? VOL[src] : AMB_FALLBACK;
  }

  function make(src, loop, vol) {
    const a = new Audio(src);
    a.loop = !!loop;
    a.volume = muted ? 0 : vol;
    a.preload = "auto";
    return a;
  }

  function applyVol() {
    if (amb) amb.volume = muted ? 0 : ambVol(ambSrc);
    if (bed) bed.volume = muted ? 0 : CLIP_VOL;
    if (one) one.volume = muted ? 0 : STAT_VOL;
  }

  function bedFor(room, night) {
    if (!room) return "sfx/outdoor_ambience.mp3";
    if (room === "home_living" || room === "home_bed" || room === "sota_out" || room === "sota_apt") return "sfx/apartment_ambience.mp3";
    if (room === "her_warehouse") return night ? "sfx/indoor_ambience.mp3" : "sfx/warehouse_day.mp3";
    if (room === "library" || room === "work" || room === "her_office" || room === "gym_hall" || room === "gym_men" || room === "gym_locker" || room === "cafe") {
      return "sfx/indoor_ambience.mp3";
    }
    return "sfx/outdoor_ambience.mp3";
  }

  function startAmbient(room, night) {
    const src = bedFor(room, night);
    if (amb && ambSrc === src) {
      applyVol();
      amb.play().catch(function () {});
      return;
    }
    if (amb) {
      amb.pause();
      amb.removeAttribute("src");
    }
    ambSrc = src;
    amb = make(src, true, ambVol(src));
    amb.play().catch(function () {});
  }

  function playStat() {
    if (one) {
      one.pause();
      one.removeAttribute("src");
    }
    one = make("sfx/stat_success.wav", false, STAT_VOL);
    one.play().catch(function () {});
  }

  function playClip(file) {
    stopClip();
    if (!file) return;
    bed = make("sfx/" + file, true, CLIP_VOL);
    bed.play().catch(function () {});
  }

  function stopClip() {
    if (!bed) return;
    bed.pause();
    bed.removeAttribute("src");
    bed = null;
  }

  function setMuted(on) {
    muted = !!on;
    localStorage.setItem(LS, muted ? "1" : "0");
    applyVol();
  }

  function toggle() {
    setMuted(!muted);
    return muted;
  }

  function isMuted() {
    return muted;
  }

  return { startAmbient, playStat, playClip, stopClip, toggle, isMuted, setMuted };
})();
