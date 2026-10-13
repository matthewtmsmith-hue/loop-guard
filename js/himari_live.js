/* Himari live sprite. Ports the approved v2 demo (breath, bang sway, lagging back hair, 3-step blink).
   No mouth animation. Expression swap changes textures; the ticker is not restarted.
   Fallback: the static <img id="sprite"> if WebGL fails or layers 404. */
(function () {
  const W = 696, H = 900, TAU = Math.PI * 2;
  const KEY = "lg-himari-live";
  const sm = (a, b, x) => { x = Math.min(1, Math.max(0, (x - a) / (b - a))); return x * x * (3 - 2 * x); };
  function enabled() {
    const v = localStorage.getItem(KEY);
    return v == null || v === "1";
  }
  function setEnabled(on) { localStorage.setItem(KEY, on ? "1" : "0"); }
  let app = null, root = null, WT = null, ready = false, failed = false;
  let back = null, body = null, front = null, eh = null, ec = null;
  let face = null, paused = true, blinkAt = 1, blinkT = -1, t0 = 0;
  const cache = {};

  function deform(x, y, t, w, layer) {
    const br = Math.sin(t * TAU / 3.8), head = 1 - sm(395, 475, y);
    let dy = -(H - Math.max(y, 430)) * 0.0055 * br;
    let dx = (x - 348) * 0.006 * br * Math.exp(-(((y - 660) / 140) ** 2));
    const th = (0.013 * Math.sin(t * TAU / 6.1) + 0.005 * Math.sin(t * TAU / 2.9 + 1)) * head;
    const px = 345, py = 450, rx = x - px, ry = y - py;
    dx += rx * Math.cos(th) - ry * Math.sin(th) - rx;
    dy += rx * Math.sin(th) + ry * Math.cos(th) - ry;
    dy += head * 1.1 * Math.sin(t * TAU / 6.1 + .7);
    const turn = 1.3 * Math.sin(t * TAU / 8.3 + 2) * head * sm(130, 230, y);
    dx += turn * (layer === "front" ? 1.25 : layer === "back" ? -0.35 : 1);
    if (w) {
      if (layer === "front") dx += w * (1.7 * Math.sin(t * TAU / 2.7 - y * .01) + 0.7 * Math.sin(t * TAU / 1.9 + x * .02));
      else dx += w * (2.4 * Math.sin(t * TAU / 2.7 - y * .01 - 0.55) + 0.8 * Math.sin(t * TAU / 1.9 + x * .02 - 0.5));
    }
    return [x + dx, y + dy, th];
  }
  function upd(M, t) {
    const d = M.b.data, b = M.base;
    for (let i = 0, k = 0; k < d.length; i++, k += 2) {
      const p = deform(b[k], b[k + 1], t, M.w ? M.w[i] : 0, M.key || "body");
      d[k] = p[0]; d[k + 1] = p[1];
    }
    M.b.update();
  }
  function mesh(tex, wkey) {
    const m = new PIXI.SimplePlane(tex, WT.gx, WT.gy);
    const b = m.geometry.getBuffer("aVertexPosition");
    return { m, b, base: Float32Array.from(b.data), w: wkey ? WT[wkey].flat() : null, key: wkey };
  }
  function canvas() { return document.getElementById("himari-live"); }
  function img() { return document.getElementById("sprite"); }
  function layout() {
    const c = canvas();
    if (!app || !c) return;
    const r = c.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    app.renderer.resize(r.width, r.height);
    const s = Math.min(r.height / H * 1.02, r.width / W * 1.15);
    root.scale.set(s);
    root.x = (r.width - W * s) / 2;
    root.y = r.height - H * s + H * s * .02;
  }
  async function boot() {
    if (ready || failed) return ready;
    if (!window.PIXI) { failed = true; return false; }
    const c = canvas();
    if (!c) { failed = true; return false; }
    try {
      WT = await (await fetch("art/himari_live/weights.json")).json();
      app = new PIXI.Application({
        view: c, backgroundAlpha: 0, antialias: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2), autoDensity: true
      });
      root = new PIXI.Container();
      app.stage.addChild(root);
      t0 = performance.now();
      app.ticker.add(() => {
        if (paused || !back) return;
        const t = (performance.now() - t0) / 1000;
        upd(back, t); upd(body, t); upd(front, t);
        for (const s of [eh, ec]) {
          const p = deform(s.home.x, s.home.y, t, 0, "body");
          s.position.set(p[0], p[1]); s.rotation = p[2];
        }
        if (t > blinkAt && blinkT < 0) blinkT = t;
        let e = 0;
        if (blinkT >= 0) {
          const u = t - blinkT;
          e = u < .035 ? 1 : u < .105 ? 2 : u < .14 ? 1 : 0;
          if (u >= .14) { blinkT = -1; blinkAt = t + (Math.random() < .18 ? .22 : 2.2 + Math.random() * 3.5); }
        }
        eh.visible = e === 1; ec.visible = e === 2;
      });
      app.ticker.stop();
      window.addEventListener("resize", layout);
      ready = true;
      return true;
    } catch (e) { failed = true; return false; }
  }
  async function loadFace(name) {
    if (cache[name]) return cache[name];
    const base = "art/himari_live/" + name + "/";
    const T = {};
    for (const n of ["back", "body", "front", "eyes_half", "eyes_closed"]) {
      T[n] = await PIXI.Assets.load(base + n + ".png");
    }
    const an = await (await fetch(base + "anchors.json")).json();
    cache[name] = { T, an };
    return cache[name];
  }
  function showStatic() {
    const c = canvas(), i = img();
    if (c) c.classList.remove("on");
    if (i) i.style.visibility = "";
    paused = true;
    if (app) app.ticker.stop();
  }
  async function show(faceKey) {
    if (!enabled() || failed) { showStatic(); return false; }
    const folder = "gf_" + faceKey;
    if (!(await boot())) { showStatic(); return false; }
    let pack;
    try { pack = await loadFace(folder); }
    catch (e) { showStatic(); return false; }
    if (!back) {
      back = mesh(pack.T.back, "back");
      body = mesh(pack.T.body, null);
      front = mesh(pack.T.front, "front");
      const spr = (tex, a) => {
        const s = new PIXI.Sprite(tex); s.anchor.set(.5); s.visible = false;
        s.home = { x: a[0] + tex.width / 2, y: a[1] + tex.height / 2 }; return s;
      };
      eh = spr(pack.T.eyes_half, pack.an.eyes);
      ec = spr(pack.T.eyes_closed, pack.an.eyes);
      root.addChild(back.m, body.m, eh, ec, front.m);
    } else {
      back.m.texture = pack.T.back;
      body.m.texture = pack.T.body;
      front.m.texture = pack.T.front;
      eh.texture = pack.T.eyes_half; ec.texture = pack.T.eyes_closed;
      const a = pack.an.eyes;
      eh.home = { x: a[0] + eh.texture.width / 2, y: a[1] + eh.texture.height / 2 };
      ec.home = { x: a[0] + ec.texture.width / 2, y: a[1] + ec.texture.height / 2 };
    }
    face = faceKey;
    const c = canvas(), i = img();
    if (c) c.classList.add("on");
    if (i) i.style.visibility = "hidden";
    layout();
    const peek = document.getElementById("peek-layer");
    const hidden = document.hidden || (peek && peek.classList.contains("on"));
    if (hidden) { paused = true; app.ticker.stop(); }
    else { paused = false; app.ticker.start(); }
    return true;
  }
  function hide() { face = null; showStatic(); }
  function pause() { paused = true; if (app) app.ticker.stop(); }
  function resume() {
    if (!face || !enabled()) return;
    if (document.hidden) return;
    const peek = document.getElementById("peek-layer");
    if (peek && peek.classList.contains("on")) return;
    paused = false; if (app) app.ticker.start();
  }
  document.addEventListener("visibilitychange", () => { if (document.hidden) pause(); else resume(); });
  window.LG_HIMARI_LIVE = { show, hide, pause, resume, enabled, setEnabled, layout };
})();
