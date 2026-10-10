(function () {
  const SAVE = "loop-guard-sota-v1";
  window.LG_PHONE = window.LG_PHONE || {};
  window.LG_PHONE.phoneShellLive = true;
  const DEFAULT_MEDIA = "media_flat/";
  const emptyPeeks = () => ({ d3: false, d5: false, d7: false, b4: false, b5: false, b6: false, b7: false, b8: false, e1: false, e2: false, e3: false, sota1: false, sota2: false, sota3: false, bf1: false, good: false, ntr: false, nts: false, cold: false, gr1: false, gr2: false, other: false });
  const weekLen = () => (window.LG_DATA && window.LG_DATA.WEEK_LEN) || 28;
  const EDI = () => window.LG_EDI;
  const ART = {
    idle: "art/sprite/gf_idle.png",
    talk: "art/sprite/gf_talk.png",
    worried: "art/sprite/gf_worried.png",
    ashamed: "art/sprite/gf_ashamed.png",
    home_idle: "art/sprite/gf_home_idle.png",
    home_talk: "art/sprite/gf_home_talk.png",
    home_worried: "art/sprite/gf_home_worried.png",
    home_ashamed: "art/sprite/gf_home_ashamed.png",
    smile: "art/sprite/gf_smile.png",
    annoyed: "art/sprite/gf_annoyed.png",
    home_smile: "art/sprite/gf_home_smile.png",
    home_annoyed: "art/sprite/gf_home_annoyed.png",
    tired: "art/sprite/gf_tired.png",
    soft: "art/sprite/gf_soft.png",
    distant: "art/sprite/gf_distant.png",
    tight: "art/sprite/gf_tight.png",
    plead: "art/sprite/gf_plead.png",
    home_tired: "art/sprite/gf_home_tired.png",
    home_soft: "art/sprite/gf_home_soft.png",
    home_distant: "art/sprite/gf_home_distant.png",
    home_tight: "art/sprite/gf_home_tight.png",
    home_plead: "art/sprite/gf_home_plead.png",
    boss: "art/sprite/boss.png",
    boss_threat: "art/sprite/boss_threat.png",
    boss_smug: "art/sprite/boss_smug.png",
    boss_bored: "art/sprite/boss_bored.png",
    // SOTA WIRE 2026-10-09: hallway meet sprite (wider canvas -> .sprite.sota CSS keeps his height = Himari's)
    sota_idle: "art/sprite/sota_idle.png",
    sota_laugh: "art/sprite/sota_laugh.png",
    sota_smirk: "art/sprite/sota_smirk.png",
    sota_concern: "art/sprite/sota_concern.png"
  };
  const D = () => window.LG_DATA;
  const L = () => window.LG_LINES;

  function Lpath(path) {
    if (window.LG_LINE) return window.LG_LINE(path) || "";
    const lines = L() || {};
    if (Object.prototype.hasOwnProperty.call(lines, path)) {
      const v = lines[path];
      if (typeof v === "string") return v;
      if (v && typeof v.text === "string") return v.text;
    }
    // DESKTOP HOTFIX 2026-10-06 (#1): nightly.tied/peekA/accuse/huntset/peekB + sms.himari.bleed.nightly.*
    // keys sit inside window.LG_RAILS in dialogue.js. Fallback only when LG_LINES lacks the key (no collisions).
    const rails = window.LG_RAILS || {};
    if (Object.prototype.hasOwnProperty.call(rails, path)) {
      const r = rails[path];
      if (typeof r === "string") return r;
      if (r && !Array.isArray(r) && typeof r.text === "string") return r.text;
    }
    return "";
  }

  function tipBandFromLifetime(gbp) {
    const n = gbp | 0;
    if (n >= 1350) return "high";
    if (n >= 700) return "mid";
    return "early";
  }

  function huntItemKey(spec) {
    if (!spec) return "";
    if (spec.itemKey) return spec.itemKey;
    return String(spec.id || "").replace(/^hunt_/, "");
  }

  function ensureNightlyDlgState() {
    if (!S.nightlyDms) S.nightlyDms = [];
    if (!S.nightlyPublicPosts) S.nightlyPublicPosts = [];
    if (!S.nightlyTierTold) S.nightlyTierTold = {};
    if (!S.nightlyHuntTeased) S.nightlyHuntTeased = {};
    if (S.nightlyFollowWelcomeDone == null) S.nightlyFollowWelcomeDone = false;
    if (S.nightlyFirstTipThanksDone == null) S.nightlyFirstTipThanksDone = false;
  }

  function pushMikaDm(key, opts) {
    ensureNightlyDlgState();
    const text = Lpath(key);
    if (!text) return "";
    S.nightlyDms.push({ key: key, text: text, who: "Mika", day: S.day | 0 });
    if (S.nightlyDms.length > 200) S.nightlyDms = S.nightlyDms.slice(-200);
    // M-BATCH 2026-10-06 (#4): Nightly notifications like Himari texts (unread + app/HUD badge + toast).
    const open = nightlyDmsOpen();
    if (!open) S.nightlyUnread = (S.nightlyUnread | 0) + 1;
    persist();
    if (!open && !(opts && opts.silent)) toast("Nightly \u00B7 Mika: " + text);
    refreshPhoneBadges();
    return text;
  }

  function nightlyDmsOpen() {
    const layer = $("phone-layer");
    return !!(layer && layer.classList.contains("on") && phoneApp === "nightly" && nightlyView !== "player" && nightlyTab === "dms");
  }

  function refreshPhoneBadges() {
    try { hud(); } catch (e) {}
    const layer = $("phone-layer");
    if (!layer || !layer.classList.contains("on")) return;
    if (phoneApp === "home") paintHome();
    else if (phoneApp === "messages" && smsView === "list") paintMessagesList();
  }

  function pushPublicPost(key, kind) {
    ensureNightlyDlgState();
    if (S.nightlyPublicPosts.some((p) => p.key === key)) return Lpath(key);
    const text = Lpath(key);
    if (!text) return "";
    S.nightlyPublicPosts.push({ key: key, text: text, kind: kind || "post", day: S.day | 0 });
    return text;
  }

  function classifyFanTone(text) {
    const t = String(text || "").toLowerCase();
    if (/\b(cock|dick|fuck|sex|horny|tit|ass|pussy|cum|stroke|suck|ride|naked|nude|hard|wet|boob|blow)\b/.test(t)) return "thirsty";
    if (/\?|\bjealous\b|\bwho is he\b|\bwhere\b|\bboyfriend\b|\breal name\b|\bwho are you\b|\bwhere do you\b|\bmeet\b|\baddress\b|\bwarehouse\b|\bhimari\b/.test(t)) return "probing";
    if (/\b(love|cute|pretty|beautiful|sweet|kind|thank|gorgeous|hot)\b/.test(t)) return "sweet";
    if (t.indexOf("?") >= 0) return "probing";
    return "sweet";
  }

  function dayPostHtml() {
    const day = S.day | 0;
    if (day < 6) return "";
    const last = Math.min(day, 26);
    let html = '<div class="nightly-sec">Posts</div>';
    for (let d = 6; d <= last; d++) {
      const key = "nightly.mika.d" + String(d).padStart(2, "0") + ".post";
      const cap = Lpath(key);
      if (!cap) continue;
      const img = "art/nightly_mika_d" + String(d).padStart(2, "0") + "_post.png";
      html += '<div class="nightly-post">' +
        '<div class="nightly-photo"><img src="' + img + '" alt=""></div>' +
        '<div class="nightly-cap">' + cap.replace(/</g, "<") + "</div></div>";
    }
    return html;
  }

  function teasePostHtml() {
    ensureNightlyDlgState();
    const posts = (S.nightlyPublicPosts || []).filter((p) => p.kind === "tease");
    if (!posts.length) return "";
    let html = '<div class="nightly-sec">Hunt posts</div>';
    posts.forEach((p) => {
      html += '<div class="nightly-im">' + String(p.text || "").replace(/</g, "<") + "</div>";
    });
    return html;
  }

  function escHtml(s) {
    return String(s || "").replace(/</g, "<");
  }

  function creatorAvatar(c) {
    const colors = { cityglow_yuki: "#5e5ce6", neon_nami: "#0a84ff", afterhours_aiko: "#30d158", mika: "#ff2d55" };
    const name = (c && (c.name || c.id)) || "?";
    const initial = String(name).charAt(0).toUpperCase();
    const col = (c && colors[c.id]) || "#8e8e93";
    return '<span class="ny-avatar" data-initial="' + initial + '" style="--ny-av:' + col + '">' + initial + "</span>";
  }

  function creatorRowHtml(c, extraSmall) {
    return '<span class="ny-row">' + creatorAvatar(c) + '<span class="ny-meta"><b>' + escHtml(c.name) + "</b><small>" + escHtml(extraSmall || c.handle || "") + "</small></span></span>";
  }

  function dmThreadBubblesHtml() {
    ensureNightlyDlgState();
    const dms = S.nightlyDms || [];
    if (!dms.length) return '<div class="nightly-im">No messages yet.</div>';
    let html = "";
    dms.forEach((m) => { // M-BATCH #5: whole thread
      const me = !!(m.me || m.who === "You" || m.who === "Kaito");
      html += '<div class="sms-bubble ' + (me ? "me" : "her") + '"><small>' + (me ? "You" : "Mika") + "</small>" + escHtml(m.text) + "</div>";
    });
    return html;
  }

  function dmThreadHtml() {
    return dmThreadBubblesHtml();
  }

  function teaserUnlocked(h) {
    if (!h) return false;
    return !!(S.followedMika && (S.nightlyTier | 0) >= (h.nightlyTier | 0));
  }

  // ART+LINES 2026-10-09: debug "Unlock all scenes". S.galleryAll is meta (carried like S.gallery);
  // it only opens gallery/Videos playback. It never touches hunts, endings claimed, days, money or route flags.
  function galleryAllOn() { return !!(S && S.galleryAll); }
  function nyFullOn(h) {
    return !!(h && (galleryAllOn() || (S.nightlyClipUnlocks && S.nightlyClipUnlocks[h.full] && S.nightlyClipUnlocks[h.full].unlocked)));
  }
  function nyEndOn(e) {
    return !!(e && (galleryAllOn() || (S.nightlyEndingsClaimed && S.nightlyEndingsClaimed[e.id])));
  }
  function debugUnlockAllScenes() {
    ensureGallery();
    const rows = [].concat(D().GALLERY_BOSS || D().GALLERY || [], D().GALLERY_SOTA || []);
    rows.forEach((g) => { if (g && g.kind) S.gallery[g.kind] = true; });
    S.galleryAll = true;
    persist();
  }

  function fanToneLabel(tone) {
    if (tone === "thirsty") return "Thirsty";
    if (tone === "probing") return "Probing";
    return "Sweet";
  }


  function fireFollowWelcome() {
    ensureNightlyDlgState();
    if (S.nightlyFollowWelcomeDone) return;
    pushMikaDm("nightly.mika.d06.followWelcome");
    S.nightlyFollowWelcomeDone = true;
    persist();
  }

  function fireFirstTipThanks() {
    ensureNightlyDlgState();
    if (S.nightlyFirstTipThanksDone) return;
    pushMikaDm("nightly.mika.d06.firstTipThanks");
    S.nightlyFirstTipThanksDone = true;
  }

  function fireTipFork(kind) {
    const band = tipBandFromLifetime(S.lifetimeTips | 0);
    const key = "nightly.mika.tip." + kind + "." + band;
    pushMikaDm(key);
  }

  function fireTierOneShots(prev, next) {
    ensureNightlyDlgState();
    for (let t = (prev | 0) + 1; t <= (next | 0); t++) {
      if (t < 1 || t > 7) continue;
      if (S.nightlyTierTold[t]) continue;
      S.nightlyTierTold[t] = true;
      pushMikaDm("nightly.mika.tip.t" + t);
    }
  }

  function fireHuntTease(spec) {
    ensureNightlyDlgState();
    const item = huntItemKey(spec);
    if (!item) return;
    if (S.nightlyHuntTeased[item]) return;
    const key = "nightly.hunt." + item + ".tease";
    const text = pushPublicPost(key, "tease");
    S.nightlyHuntTeased[item] = true;
    persist();
    if (text) toast("Nightly · Mika posted: " + text);
  }

  function anyHuntFound() {
    const hunts = (S && S.nightlyHunts) || {};
    return Object.keys(hunts).some((id) => hunts[id] && (hunts[id].status === "found" || hunts[id].status === "held")); // M-BATCH #2: held counts as evidence
  }

  function accuseReady() {
    if (!S) return false;
    if (!S.followedMika || !S.nightlyRouteStarted) return false;
    if (S.accusedRobert || S.nightlyAccuseDone) return false;
    if (typeof endingClaimed === "function" && endingClaimed()) return false;
    return anyHuntFound() || ((S.nightlyTier | 0) >= 1);
  }

  function queueHimariSms(key) {
    const text = Lpath(key);
    if (!text) return "";
    // M-BATCH 2026-10-06 (#6): incoming texts land straight in the persistent chat log (S.smsLog).
    ensureSmsState();
    if (S.smsLog.some((m) => m.key === key)) return text;
    deliverHimari([{ who: "Himari", text: text, key: key }]);
    return text;
  }

  function fireBleedOnce(band) {
    if (!S.nightlyBleedTold) S.nightlyBleedTold = {};
    if (S.nightlyBleedTold[band]) return "";
    const key = "sms.himari.bleed.nightly." + band;
    const text = Lpath(key);
    if (!text) return "";
    S.nightlyBleedTold[band] = true;
    queueHimariSms(key);
    persist();
    return text;
  }

  function tickNightlyBleed() {
    if (!S) return;
    if (!S.followedMika && !S.nightlyRouteStarted) return;
    const t = S.nightlyTier | 0;
    if (t <= 2) fireBleedOnce("early");
    if (t >= 3 && t <= 4) fireBleedOnce("mid");
    if (t >= 5) fireBleedOnce("hot");
    if ((S.day | 0) >= 24 && !(typeof endingClaimed === "function" && endingClaimed())) fireBleedOnce("nearD26");
  }

  function spokenLine(key, who, face) {
    const text = Lpath(key);
    if (!text) return null;
    return { who: who || "Himari", face: face || "talk", text: text };
  }

  function nightlyPlayerCaption(spec, teaser, i) {
    if (teaser || !spec) return [];
    const out = [];
    const id = spec.id || "";
    const kind = spec.kind || "";
    if (kind === "tied" || id === "ending_robert_tied") {
      let fam = "";
      let stage = "";
      if (i <= 3) { fam = "suck"; stage = ["slow", "mid", "fast", "cum"][i]; }
      else if (i <= 7) { fam = "ride"; stage = ["slow", "mid", "fast", "cum"][i - 4]; }
      else {
        fam = "doggy";
        stage = ["slow", "mid", "cum"][i - 8];
      }
      if (!fam || !stage) return out;
      for (let n = 1; n <= 4; n++) {
        const t = Lpath("nightly.tied." + fam + "." + stage + "." + n);
        if (t) out.push(t);
      }
      return out;
    }
    if (id === "ending_robert_peek_electrical") {
      const clip = i + 1;
      for (let n = 1; n <= 4; n++) {
        const t = Lpath("nightly.peekA.clip" + clip + "." + n);
        if (t) out.push(t);
      }
      return out;
    }
    if (id === "ending_robert_peek_workarea") {
      const clip = i + 1;
      for (let n = 1; n <= 3; n++) {
        const t = Lpath("nightly.peekB.clip" + clip + "." + n);
        if (t) out.push(t);
      }
      return out;
    }
    const item = huntItemKey(spec);
    if (!item) return out;
    const stage = ["slow", "mid", "fast", "cum"][i];
    if (!stage) return out;
    for (let n = 1; n <= 3; n++) {
      const t = Lpath("nightly.huntset." + item + "." + stage + "." + n);
      if (t) out.push(t);
    }
    return out;
  }

  const $ = (id) => document.getElementById(id);

  let S = null;
  let queue = [];
  let afterQueue = null;
  let peek = null;
  let barRaf = 0;
  let talking = false;

  function job() {
    return D().JOBS[S.jobIndex || 0] || D().JOBS[0];
  }

  function nextJob() {
    return D().JOBS[(S.jobIndex || 0) + 1] || null;
  }

  function dueNow() {
    return S.due != null ? S.due : D().DEBT;
  }

  function slotName() {
    return D().SLOTS[S.slot] || "night";
  }

  function isNight() {
    return slotName() === "night";
  }

  function slotsLeft() {
    return D().SLOTS.length - S.slot;
  }

  function paidTonight() {
    return S.paidDay === S.day;
  }

  function endingPath() {
    ensureSotaState();
    if (S.encouragedGoRound) return "nts";
    if ((S.goRoundDone || 0) >= 1) return "ntr";
    if (moodWord() === "Loving") return "good";
    return "cold";
  }

  function goRoundsUnlocked() {
    ensureSotaState();
    return (S.sotaIdx || 0) >= 1 || (S.realPeeks || 0) >= 1;
  }

  function isGoRoundDay(day) {
    const d = day == null ? S.day : day;
    return d === 22 || d === 24;
  }

  function goRoundAskPending() {
    if (nightsWouldStack(S.day)) {
      /* consult: keep Himari go-round; Boss peek suppressed in spyKind */
    }
    return isGoRoundDay() && goRoundsUnlocked() && !(S.goRoundAsked && S.goRoundAsked[S.day]);
  }

  function goRoundKind() {
    ensureSotaState();
    if (!S.goRoundTonight) return null;
    if (slotName() !== "night") return null;
    const k = S.goRoundTonight;
    if (S.sceneDone && S.sceneDone[k]) return null;
    return k;
  }

  function sotaDoorLive() {
    return !!(sotaPeekKind() || goRoundKind());
  }

  function sotaQueue() {
    return ["sota1", "sota2", "sota3"];
  }

  function sotaPeekKind() {
    ensureSotaState();
    if (!S.nightPeekTonight) return null;
    if (slotName() !== "night") return null;
    const q = sotaQueue();
    const i = S.sotaIdx || 0;
    if (i >= q.length) return null;
    const k = q[i];
    if (S.sceneDone && S.sceneDone[k]) return null;
    return k;
  }

  function spyKind() {
    const sota = sotaPeekKind();
    if (sota) return sota;
    const gr = goRoundKind();
    if (gr) return gr;
    if (S.day === 25) return d25EndingKind();
    if (nightsWouldStack(S.day)) {
      /* prefer Himari night-ask; suppress Boss peek arm for this day */
      return null;
    }
    const after = { 9: "b4", 11: "b5", 17: "b6", 19: "b7", 21: "b8" };
    // DESKTOP HOTFIX 2026-10-06 (#14): hired Himari -> no more mid-route Boss peeks (b6/b7/b8). D25 ending above unchanged.
    if (after[S.day] && !S.hiredHimari) return after[S.day];
    if (after[S.day]) return null;
    if (S.paidDay != null) return null;
    const debt = { 3: "d3", 5: "d5", 7: "d7" };
    return debt[S.day] || null;
  }

  function peekHappened(kind) {
    return !!(kind && S.sceneDone && S.sceneDone[kind]);
  }

  function ensureBossTalkState() {
    if (!S.talkSpent) S.talkSpent = {};
    if (S.hireAsked == null) S.hireAsked = false;
    if (S.afterPayLifeDone == null) S.afterPayLifeDone = false;
    if (!S.peekWatched) S.peekWatched = {};
  }

  function peekWatched(kind) {
    ensureBossTalkState();
    return !!(kind && S.peekWatched && S.peekWatched[kind]);
  }

  function himariBossBand() {
    if (typeof moodWarmBand === "function" && moodWarmBand()) return "warm";
    const w = typeof moodWord === "function" ? moodWord() : "";
    if ((typeof debtDistant === "function" && debtDistant()) || w === "Cold" || w === "Gone") return "rough";
    return "cool";
  }

  function bossLine(key) {
    const v = (L() || {})[key];
    if (!v) return null;
    if (typeof v === "string") return { who: "Himari", face: "talk", text: v };
    if (!v.text) return null;
    return { who: v.who || "Himari", face: v.face || "talk", text: v.text };
  }

  function bossBandLine(base) {
    return bossLine(base + "." + himariBossBand());
  }

  function bossEndingPath() {
    if (S.hiredHimari) return "e1";
    if (S.paidDay != null) return "e2";
    if (S.e3Accused) return "e3";
    return "e2";
  }

  function isHomeRoom(room) {
    return room === "home_living" || room === "home_bed";
  }

  function bossQueueFor(room) {
    ensureBossTalkState();
    const spent = S.talkSpent || {};
    const q = [];
    const home = isHomeRoom(room);
    const work = room === "her_warehouse";
    const day = S.day | 0;
    const unpaid = S.paidDay == null;
    const band = himariBossBand();
    if (home && day >= 12 && day <= 24 && !S.hireAsked) {
      q.push({ id: "hire.once", key: "boss.hire.once." + (unpaid ? "unpaid" : "paid") + "." + band, onPlay: "hireAsked" });
    }
    if (home && S.paidDay != null && !S.afterPayLifeDone && !(day >= 12 && day <= 24 && !S.hireAsked)) {
      q.push({ id: "life.afterPay", key: "boss.life.afterPay.once." + band, onPlay: "afterPay" });
    }
    if (home && unpaid) {
      if (day === 2) q.push({ id: "home.d02", key: "boss.money.home.d02." + band });
      if (day === 3) q.push({ id: "home.d03", key: "boss.money.home.d03.prePeek." + band });
      if (day === 5) q.push({ id: "home.d05", key: "boss.money.home.d05." + band });
      if (day === 6) q.push({ id: "home.d06", key: "boss.money.home.d06." + band });
      if (day === 7) q.push({ id: "home.d07", key: "boss.money.home.d07." + band });
    }
    if (work && day >= 1 && day <= 7) {
      if (unpaid) {
        if (day === 1) q.push({ id: "work.d01", key: "boss.money.work.d01." + band });
        if (day === 2) q.push({ id: "work.d02", key: "boss.money.work.d02." + band });
        if (day === 3) q.push({ id: "work.d03", key: "boss.money.work.d03." + band });
        if (day === 4 || day === 5) q.push({ id: "work.midWeek.d" + day, key: "boss.money.work.midWeek." + band });
        if (day === 6 || day === 7) q.push({ id: "work.sundayEve.d" + day, key: "boss.money.work.sundayEve." + band });
      } else if (!spent["workPaid.generic"]) {
        q.push({ id: "workPaid.generic", key: "boss.money.workPaid.generic." + band });
      }
    }
    return q.filter((b) => b && !spent[b.id]);
  }

  function talkQueueFor(room) {
    const q = bossQueueFor(room);
    if (isHomeRoom(room) && typeof accuseReady === "function" && accuseReady()) {
      q.push({ id: "nightly.accuse", kind: "nightlyAccuse" });
    }
    if (typeof canTalkStrand === "function" && canTalkStrand()) {
      q.push({ id: "sota.strand", kind: "sotaStrand" });
    }
    return q;
  }

  function peekSlotIndex(kind) {
    if (kind === "sota1" || kind === "sota2" || kind === "sota3") return 3;
    if (kind === "good" || kind === "ntr" || kind === "nts" || kind === "gr1" || kind === "gr2") return 3;
    if (kind === "e2") return 1;
    if (kind === "b7" || kind === "e3") return 2;
    return 3;
  }

  function peekSlotActive() {
    const k = spyKind();
    if (!k || (S.sceneDone && S.sceneDone[k])) return false;
    return S.slot === peekSlotIndex(k);
  }

  function d25EndingKind() {
    // Greg lock 2026-10-05: Sota good/ntr/nts claim D25; otherwise the Boss ending always plays
    // (hired E1 > paid E2 > accused E3 > no flags E2). Sota "cold" never claims the day.
    const end = endingPath();
    if (end && end !== "cold") return end;
    return bossEndingPath();
  }

  function canSpend(n) {
    if (S.day !== 25) return true;
    const end = d25EndingKind();
    if (!end || (S.sceneDone && S.sceneDone[end])) return true;
    const live = peekSlotIndex(end);
    const next = Math.min(3, (S.slot || 0) + (n || 1));
    if ((S.slot || 0) < live && next > live) return false;
    if ((S.slot || 0) === live && peekSlotActive()) return false;
    return true;
  }

  function dateWouldSkipPeek() {
    if (peekSlotActive()) return true;
    if (!canSpend(2)) return true;
    const k = spyKind();
    if (!k || (S.sceneDone && S.sceneDone[k])) return false;
    const next = Math.min(3, (S.slot || 0) + 2);
    const live = peekSlotIndex(k);
    return (S.slot || 0) < live && next > live;
  }

  function canHireHimari() {
    const jobs = D().JOBS || [];
    const job = jobs[S.jobIndex] || jobs[0];
    return !!(job && job.id === "ops");
  }


  // SOTA WIRE 2026-10-09 (Greg lock): first night out moved D2 -> D6 (D6 Path A iff mood < 65 at the ask).
  const NIGHT_OUT_DAYS = [6, 10, 18];
  // Never stack Boss peek nights with Himari night-out / go-round asks.
  const HIMARI_NIGHT_ASK_DAYS = [6, 10, 18, 22, 24];
  const BOSS_PEEK_NIGHT_DAYS = [3, 5, 7, 9, 11, 17, 19, 21];
  const BOSS_COVER_TALKHOME_DAYS = [4, 5, 6, 10, 12, 17, 18, 19, 20];
  // SOTA WIRE 2026-10-09: Talk strands T1-T7 play inside day windows [open, last]. Lowest open strand first,
  // one per day, expired strands are skipped. T1 also needs the Boss debt unpaid (this loop).
  const TALK_WINDOWS = [[1, 7], [4, 10], [8, 14], [11, 18], [15, 21], [19, 24], [23, 24]];
  const TALK_UNLOCK = TALK_WINDOWS.map((w) => w[0]);
  const MOOD_DELTA = {
    giftFlowers: 3,
    giftChocoMood: 1,
    talkWarm: 4,
    talkCold: -8,
    sex: 8,
    dateMeh: 2,
    dateNice: 10,
    dateAmazing: 15,
    declineDate: -12,
    neglect: -2,
    goOut: -3,
    stayFail: -6,
    talkC1: { listen: 2, half: 0, miss: -4 },
    talkC2: { listen: 2, half: 1, miss: -4 }
  };

  function moodWord(n) {
    const v = n == null ? (S.mood == null ? 70 : S.mood) : n;
    if (v >= 80) return "Loving";
    if (v >= 60) return "Warm";
    if (v >= 40) return "Distant";
    if (v >= 20) return "Cold";
    return "Gone";
  }

  function moodWarmBand() {
    const w = moodWord();
    return w === "Loving" || w === "Warm";
  }

  function bumpMood(n) {
    ensureSotaState();
    S.mood = Math.max(0, Math.min(100, (S.mood == null ? 70 : S.mood) + (n || 0)));
  }

  function markCared() {
    S.caredToday = true;
    S.lastCareDay = S.day;
  }

  function hornHint() {
    const h = S.horn || 0;
    if (h >= 4) return "needy";
    if (h >= 2) return "restless";
    return "";
  }

  function isNightOutDay(day) {
    return NIGHT_OUT_DAYS.indexOf(day == null ? S.day : day) >= 0;
  }

  function himariNightAskDay(day) {
    return HIMARI_NIGHT_ASK_DAYS.indexOf(day == null ? S.day : day) >= 0;
  }

  function bossPeekNightDay(day) {
    return BOSS_PEEK_NIGHT_DAYS.indexOf(day == null ? S.day : day) >= 0;
  }

  function nightsWouldStack(day) {
    const d = day == null ? S.day : day;
    return himariNightAskDay(d) && bossPeekNightDay(d);
  }

  function isBossPeekKind(kind) {
    return !!(kind && /^(d3|d5|d7|b[4-8]|e[123])$/.test(kind));
  }

  function isSotaPeekKind(kind) {
    return !!(kind && /^(sota[123]|gr[12])$/.test(kind));
  }

  function debtOpen() {
    return S.paidDay == null && !S.paidOnce;
  }


  function knowsBossSex() {
    ensureSotaState();
    const done = S.sceneDone || {};
    return !!(done.d3 || done.d5 || done.d7 || done.b4 || done.b5 || done.b6 || done.b7 || done.b8 || done.e1 || done.e2 || done.e3);
  }
  function lineBand(pack, band) {
    if (pack == null) return pack;
    if (typeof pack === "string" || Array.isArray(pack)) return pack;
    if (band && pack[band] != null) return pack[band];
    if (pack.clean != null) return pack.clean;
    return pack;
  }
  function kaitoLine(pack) {
    return lineBand(pack, knowsBossSex() ? "knows" : "clean");
  }
  function bossCoverMorningPlayed() {
    // True only after livingAutoplay already ran a Boss morning pack today (sets S.autoSeen[day]).
    // Cover/aftermath calendar only — not the D1 tutorial.
    if (!S.autoSeen || !S.autoSeen[S.day]) return false;
    const d = S.day | 0;
    return d === 4 || d === 6 || d === 8 || d === 10 || d === 12 || d === 18 || d === 20 || d === 22;
  }
  function weekOneDebt() {
    // SOTA WIRE 2026-10-09: week1Debt rows only in week 1 with this loop's debt still open (fixes the homeBleedPressure leak past D7).
    return (S.day | 0) <= 7 && S.paidDay == null;
  }
  function soreCoverArmed() {
    // D6 night only; watched d5; afterD5 morning pack already played. Missed D5 does not arm.
    return (S.day | 0) === 6 && peekWatched("d5") && !!(S.autoSeen && S.autoSeen[6]);
  }
  function anySotaWatched() {
    const w = S.peekWatched || {};
    return !!(w.sota1 || w.sota2 || w.sota3 || w.gr1 || w.gr2);
  }
  function cuddleLine() {
    // sota.bed.* : knows (Boss or Sota peek watched) > suspects (she was out tonight / Sota peek last night) > clean
    // She came home from a clean night out tonight -> suspects ("smells like the night out") beats knows.
    // knows = he actually WATCHED a rival scene to the end (peekWatched), not just a missed/sceneDone peek
    // (sceneDone.d3 is set on every route by D4, which made suspects/clean unreachable).
    if (S.nightOutPath === "b" && S.nightOutDay === S.day) return sl("sota.bed.suspects");
    const w = S.peekWatched || {};
    const watchedBoss = ["d3", "d5", "d7", "b4", "b5", "b6", "b7", "b8", "e1", "e2", "e3"].some((k) => w[k]);
    if (watchedBoss || anySotaWatched()) return sl("sota.bed.knows");
    if (S.sotaPeekLastNight || residueTrustTalk()) return sl("sota.bed.suspects");
    return sl("sota.bed.clean");
  }

  function pathARung() {
    ensureSotaState();
    const n = (S.pathANightCount | 0) + (S.goRoundDone | 0);
    if (n >= 3) return 3;
    if (n >= 2) return 2;
    return 1;
  }
  function voicesLineFor(room) {
    if (room === "warehouse_elec") return kaitoLine(L().voicesElectrical) || kaitoLine(L().voices);
    if (room === "gym_locker" || room === "gym_hall") return kaitoLine(L().voicesGym) || kaitoLine(L().voices);
    if (room === "work" || room === "her_office") return kaitoLine(L().voicesOffice) || kaitoLine(L().voices);
    if (room === "warehouse_office") return kaitoLine(L().voicesWarehouseOffice) || kaitoLine(L().voices);
    return kaitoLine(L().voices);
  }
  function morningPathAPack() {
    const r = pathARung();
    const b = band3();
    const watched = !!S.sotaPeekLastNight && !S.sotaPeekSkippedLastNight;
    const base = "sota.morning.r" + r + ".";
    if (!watched) return [slBand(base + "skipped.1", b)].filter(Boolean);
    return [slBand(base + "watched.1", b), slBand(base + "watched.2", b)].filter(Boolean);
  }

  function pathBHomePack() {
    const b = moodWarmBand() ? "warm" : "cool";
    const sf = S.nightOutLastOutcome === "stayFail";
    return [
      sl("sota.home.1." + b),
      sf ? sl("sota.home.afterStayFail.1") : null,
      sf ? sl("sota.home.afterStayFail.2") : null,
      sl("sota.home.2." + b)
    ].filter(Boolean);
  }


  function debtDistant() {
    return debtOpen() && (S.mood | 0) < 60;
  }
  function phoneShellLive() {
    return !!(window.LG_PHONE && window.LG_PHONE.phoneShellLive);
  }
  function residueSkipped() {
    return !!S.sotaPeekSkippedLastNight;
  }
  function pathAOut() {
    // DESKTOP HOTFIX 2026-10-05: only on the night-out night itself (nightOutPath was never cleared).
    return S.nightOutPath === "a" && S.nightOutDay === S.day;
  }
  function residuePeek() {
    return !!S.sotaPeekLastNight;
  }
  function residueTrustTalk() {
    return !!(S.sotaPeekLastNight || (S.sotaIdx | 0) >= 1);
  }

  function bleedFlags() {
    ensureSotaState();
    return {
      bossPeekLastNight: !!S.bossPeekLastNight,
      sotaPeekLastNight: !!S.sotaPeekLastNight,
      debtOpen: debtOpen()
    };
  }

  function talkHomeAllowed(day) {
    if (BOSS_COVER_TALKHOME_DAYS.indexOf(day) < 0) return true;
    return !!S.bossPeekLastNight;
  }

  function nightOutPendingTell() {
    if (nightsWouldStack(S.day)) {
      /* consult: keep Himari D2/10/18 night-out */
    }
    return isNightOutDay() && !S.nightOutResolved && S.slot < 3;
  }

  function dateOnCooldown() {
    return S.lastDateDay != null && S.day < S.lastDateDay + 3;
  }

  function sheWantsDate() {
    if (dateOnCooldown()) return false;
    if (S.dateAskDone === S.day) return false;
    if (S.lastCareDay == null) return S.day >= 4;
    return S.day - S.lastCareDay >= 3;
  }



  function talkStrandOpen(i) {
    const w = TALK_WINDOWS[i];
    if (!w) return false;
    const d = S.day | 0;
    if (d < w[0] || d > w[1]) return false;
    if (i === 0 && S.paidDay != null) return false; // T1 is about the Boss debt
    return true;
  }

  function nextTalkStrand() {
    ensureSotaState();
    for (let i = 0; i < TALK_WINDOWS.length; i++) {
      if (S.talkDone[i]) continue;
      if (talkStrandOpen(i)) return i;
    }
    return -1;
  }


  function canTalkStrand() {
    if (!isHomeRoom(S.room)) return false;
    if ((S.lastTalkDay || 0) === S.day) return false;
    return nextTalkStrand() >= 0;
  }



  // ===== SOTA WIRE 2026-10-09: line lookup + bands =====
  function traceKey(k) {
    if (window.LG_TRACE && k) window.LG_TRACE[k] = (window.LG_TRACE[k] | 0) + 1;
  }
  function slRaw(key) {
    const v = (L() || {})[key];
    return v == null ? null : v;
  }
  function sl(key) {
    const v = slRaw(key);
    if (v == null) return null;
    traceKey(key);
    if (typeof v === "string") return { who: "**", text: v };
    return v;
  }
  function slText(key, fb, keepStars) {
    const v = sl(key);
    if (!v || !v.text) return fb || "";
    return keepStars ? v.text : String(v.text).replace(/^\*\*/, "").replace(/\*\*$/, "");
  }
  function promptOf(key) {
    return { who: "**", text: slText(key, "") };
  }
  function band5() {
    return moodWord().toLowerCase();
  }
  function band3() {
    const w = moodWord();
    if (w === "Loving" || w === "Warm") return "warm";
    return w === "Distant" ? "cool" : "rough";
  }
  const BAND_CHAIN = {
    loving: ["loving", "warm"], warm: ["warm", "loving"], distant: ["distant", "cool", "cold"],
    cold: ["cold", "rough", "distant", "gone"], gone: ["gone", "cold", "rough"],
    cool: ["cool", "rough", "warm"], rough: ["rough", "cool"]
  };
  function slBand(base, band) {
    const chain = BAND_CHAIN[band] || [band];
    for (let i = 0; i < chain.length; i++) {
      if (slRaw(base + "." + chain[i]) != null) return sl(base + "." + chain[i]);
    }
    return sl(base);
  }

  // Hallway meet (sota.meet.*): first non-night entry to the apartment block from D3; guaranteed before the D6 ask
  // for anyone who leaves the flat on D3-D5. Plays once.
  function sotaMeetDue() {
    ensureSotaState();
    return !S.sotaMet && (S.day | 0) >= 3 && (S.day | 0) <= 21 && !isNight();
  }
  function runSotaMeet() {
    S.sotaMet = true;
    S.sotaMetDay = S.day;
    persist();
    const bg = $("bg");
    if (bg) { bg.src = "art/bg_sota_hall.jpg"; bg.style.display = "block"; }
    setSprite("sota_idle");
    const M = "sota.meet.";
    playLines([M + "narr.1", M + "sota.1", M + "kaito.1", M + "sota.2", M + "kaito.2", M + "sota.3", M + "narr.2"].map(sl).filter(Boolean), renderRoom);
  }

  // Mentions: Himari brings Sota up more as mood drops (Loving: never; Warm every 4 days, Distant 2, Cold/Gone daily).
  const MENTION_GAP = { Warm: 4, Distant: 2, Cold: 1, Gone: 1 };
  function mentionDue() {
    ensureSotaState();
    if (!S.sotaMet || (S.day | 0) < 4 || (S.day | 0) > 24) return null;
    if (S.lastMentionDay === S.day) return null;
    const w = moodWord();
    const gap = MENTION_GAP[w];
    if (!gap) return null;
    if (S.lastMentionDay != null && S.day - S.lastMentionDay < gap) return null;
    const band = w.toLowerCase();
    const key = "sota.mention." + band + "." + ((S.mentionIdx[band] | 0) + 1);
    return slRaw(key) != null ? key : null;
  }

  // NTS epilogue text (sota.end.nts.sms): lands on the first night after the NTS ending night.
  function smellDue() {
    return S.sotaSmellDay === S.day && !!S.residueHomeSeen && S.room === "home_living";
  }
  function playSmell() {
    S.sotaSmellDay = null;
    persist();
    playLines([sl("sota.smell.narr"), slBand("sota.smell.himari", band3())].filter(Boolean), renderRoom);
  }

  function deliverNtsEpilogue(fromSleep) {
    if (S.ntsSmsDay == null) return;
    if ((S.day | 0) <= S.ntsSmsDay) return;
    if (!fromSleep && !isNight()) return;
    S.ntsSmsDay = null;
    const m = sl("sota.end.nts.sms");
    if (m) deliverHimari([{ who: "Himari", text: m.text, key: "sota.end.nts.sms" }]);
  }

  function ensureSotaState() {
    if (S.horn == null) S.horn = 0;
    if (S.lastSexDay === undefined) S.lastSexDay = null;
    if (S.savedForYou == null) S.savedForYou = false;
    if (S.sotaArmed == null) S.sotaArmed = false;
    if (S.sotaSeenTouch == null) S.sotaSeenTouch = false;
    if (S.sotaIdx == null) S.sotaIdx = 0;
    if (S.emilyOutTonight == null) S.emilyOutTonight = false;
    if (S.mood == null) S.mood = 70; // DESKTOP HOTFIX 2026-10-06 (#13): start Warm
    if (S.str == null) S.str = 3;
    if (S.lastCareDay === undefined) S.lastCareDay = 1;
    if (S.lastDateDay === undefined) S.lastDateDay = null;
    if (S.lastTalkDay === undefined) S.lastTalkDay = null;
    if (S.talkIdx == null) S.talkIdx = 0;
    if (!S.talkLog) S.talkLog = [];
    if (S.caredToday == null) S.caredToday = false;
    if (S.nightOutResolved == null) S.nightOutResolved = false;
    if (S.nightPeekTonight == null) S.nightPeekTonight = false;
    if (S.realPeeks == null) S.realPeeks = 0;
    if (S.trainedToday == null) S.trainedToday = false;
    if (S.goRoundDone == null) S.goRoundDone = 0;
    if (S.encouragedGoRound == null) S.encouragedGoRound = false;
    if (S.goRoundTonight == null) S.goRoundTonight = null;
    if (S.goRoundAsked == null) S.goRoundAsked = {};
    if (S.bossPeekLastNight == null) S.bossPeekLastNight = false;
    if (S.sotaPeekLastNight == null) S.sotaPeekLastNight = false;
    if (S.bossPeekTonight == null) S.bossPeekTonight = false;
    if (S.sotaPeekTonight == null) S.sotaPeekTonight = false;
    if (S.smsAfterPeekMorningPending == null) S.smsAfterPeekMorningPending = false;
    if (S.smsNightOutPending == null) S.smsNightOutPending = false;
    if (S.nightOutLastOutcome == null) S.nightOutLastOutcome = null;
    if (S.pathANightCount == null) S.pathANightCount = 0;
    if (!S.nightlyFollows) S.nightlyFollows = {};
    if (S.followedMika == null) S.followedMika = !!(S.nightlyFollows && S.nightlyFollows.mika);
    if (S.nightlyRouteStarted == null) S.nightlyRouteStarted = !!S.followedMika;
    S.nightlySuggestedMika = (S.day | 0) >= 6 && !S.followedMika;
    if (S.nightlyTier == null) S.nightlyTier = 0;
    if (!S.nightlyHunts) S.nightlyHunts = {};
    if (!S.nightlyClipUnlocks) S.nightlyClipUnlocks = {};
    if (!S.nightlyToyUnlocks) S.nightlyToyUnlocks = { tip: !!S.followedMika, bump: (S.nightlyTier|0) >= 1, stroke: (S.nightlyTier|0) >= 2 };
    if (S.lifetimeTips == null) {
      const th = tipThresholds();
      const t = S.nightlyTier | 0;
      S.lifetimeTips = t >= 1 ? (th[t] | 0) : 0;
    }
    if (S.accusedRobert == null) S.accusedRobert = false;
    if (S.nightlyInvitePending == null) S.nightlyInvitePending = false;
    if (S.nightlyInviteAccepted == null) S.nightlyInviteAccepted = false;
    if (S.nightlyShowedUp == null) S.nightlyShowedUp = false;
    if (S.nightlyTiedPresent == null) S.nightlyTiedPresent = false;
    if (S.nightlyMisdirectPending == null) S.nightlyMisdirectPending = false;
    if (S.nightlyMisdirectTold == null) S.nightlyMisdirectTold = false;
    if (S.nightlyInviteTold == null) S.nightlyInviteTold = false;
    if (S.nightlyEnding == null) S.nightlyEnding = null;
    if (S.robertEndingId == null) S.robertEndingId = null;
    if (!S.nightlyEndingsClaimed) S.nightlyEndingsClaimed = {};
    if (!S.nightlyDms) S.nightlyDms = [];
    if (!S.nightlyPublicPosts) S.nightlyPublicPosts = [];
    if (!S.nightlyTierTold) S.nightlyTierTold = {};
    if (!S.nightlyHuntTeased) S.nightlyHuntTeased = {};
    if (S.nightlyFollowWelcomeDone == null) S.nightlyFollowWelcomeDone = false;
    if (S.nightlyFirstTipThanksDone == null) S.nightlyFirstTipThanksDone = false;
    if (!S.nightlyBleedTold) S.nightlyBleedTold = {};
    if (!S.pendingBleedSms) S.pendingBleedSms = [];
    if (S.nightlyAccuseDone == null) S.nightlyAccuseDone = false;
    if (S.nightlyAccuseGood == null) S.nightlyAccuseGood = false;
    if (S.nightlyPeekBArmed == null) S.nightlyPeekBArmed = false;
    if (!S.nightlyFanReplySpent) S.nightlyFanReplySpent = {};
    syncNightlyTierFromTips();
    if (S.residueHomeSeen == null) S.residueHomeSeen = false;
    if (S.sotaPeekSkippedTonight == null) S.sotaPeekSkippedTonight = false;
    if (S.sotaPeekSkippedLastNight == null) S.sotaPeekSkippedLastNight = false;
    // SOTA WIRE 2026-10-09
    if (S.sotaMet == null) S.sotaMet = false;
    if (!S.goRoundChoice) S.goRoundChoice = {};
    if (!S.talkDone) S.talkDone = {};
    if (!S.talkListened) S.talkListened = {};
    if (!S.mentionIdx) S.mentionIdx = {};
    if (S.lastMentionDay === undefined) S.lastMentionDay = null;
    if (S.nightOutLastPath === undefined) S.nightOutLastPath = null;
    if (S.sotaSmellDay === undefined) S.sotaSmellDay = null;
    if (S.grMorningSeen === undefined) S.grMorningSeen = null;
    if (S.ntrLeft == null) S.ntrLeft = false;
    if (S.ntsSmsDay === undefined) S.ntsSmsDay = null;
    if (S.sexAskBand === undefined) S.sexAskBand = null;
    ensureSmsState(); // M-BATCH #6
  }

  function bumpHorn(n) {
    ensureSotaState();
    S.horn = Math.max(0, Math.min(5, (S.horn || 0) + (n == null ? 1 : n)));
    if (S.horn >= 3) S.savedForYou = true;
  }

  function markSexNight() {
    ensureSotaState();
    S.lastSexDay = S.day;
  }

  function sexOnCooldown() {
    ensureSotaState();
    return S.lastSexDay != null && S.day === S.lastSexDay + 1;
  }

  const GIFT_COST = { flowers: 15, chocolate: 8 };

  function armSota() {
    ensureSotaState();
    if (S.sotaArmed) return false;
    S.sotaArmed = true;
    S.sotaArmedTell = true;
    persist();
    return true;
  }

  function clearNightSotaPeek() {
    ensureSotaState();
    S.nightPeekTonight = false;
    if (S.peekResume && String(S.peekResume.kind || "").indexOf("sota") === 0) S.peekResume = null;
    persist();
  }

  function skipSotaPeek(kind) {
    const k = kind || sotaPeekKind() || ((spyKind() || "").indexOf("sota") === 0 ? spyKind() : null);
    if (!k || String(k).indexOf("sota") !== 0) return false;
    if (S.sceneDone && S.sceneDone[k]) return false;
    S.sceneDone[k] = true;
    S.peekResume = null;
    S.sotaIdx = (S.sotaIdx || 0) + 1;
    S.realPeeks = (S.realPeeks || 0) + 1;
    S.sotaPeekTonight = true;
    S.sotaPeekSkippedTonight = true;
    persist();
    return true;
  }


  function isRivalSexKind(kind) {
    return !!(kind && /^(d3|d5|d7|b[4-8]|e[123]|sota[123]|bf1|good|ntr|nts|gr[12])$/.test(kind));
  }

  function markPeekMissed(kind) {
    if (!kind || (S.sceneDone && S.sceneDone[kind])) return;
    S.sceneDone[kind] = true;
    S.peekResume = null;
    S.missTell = kind;
    S.needCuddle = false;
    if (kind === "d3") S.seedTakumi = true;
    if (kind === "d5") S.seedNightly = true;
    if (isNight() || slotName() === "evening") S.emilyOutTonight = true;
    bumpHorn(1);
  }

  function emilyRoom() {
    if (S.ntrLeft) return null; // SOTA WIRE: NTR ending - she moved in next door
    if (S.emilyOutTonight) return null;
    if (paidTonight() && isNight()) return null;
    if (peekSlotActive()) return null;
    if (S.day === 25) {
      const end = d25EndingKind();
      if (end && S.sceneDone && S.sceneDone[end]) return null;
    }
    if (S.day === 26 && robertPeekBLive()) return null;
    if (isNightOutDay() && !S.nightOutResolved && (slotName() === "evening" || isNight())) return "home_living";
    if (goRoundAskPending() && (slotName() === "evening" || isNight())) return "home_living";
    if (isNight()) return "home_living";
    if (slotName() === "morning") return "home_living";
    // DESKTOP HOTFIX 2026-10-06 (#14): hired -> not at her old warehouse; home by default (Greg may relocate).
    if (S.hiredHimari) return "home_living";
    return "her_warehouse";
  }

  function millerHere() {
    return !isNight() && S.room === "her_office";
  }

  function atHome() {
    return S.room === "home_living" || S.room === "home_bed";
  }

  function emilyFace(face) {
    const f = face || "idle";
    if ((atHome() || S.room === "cafe") && ART["home_" + f]) return "home_" + f;
    return ART[f] ? f : "idle";
  }

  function millerFace() {
    if (S.paidDay) return "boss_smug";
    if (spyKind() || S.day === 3 || S.day === 5 || S.day === 7 || S.day === 9 || S.day === 11) return "boss_threat";
    if (S.day >= 4) return "boss_smug";
    return "boss";
  }

  function warehouseOpen() {
    if (!isNight()) return true;
    const k = spyKind();
    return k === "d3" || k === "b4" || k === "b5";
  }

  function peekSet() {
    const kind = spyKind();
    return kind ? D().SETS[kind] : null;
  }

  function buildingOpen(interior) {
    if (!isNight()) return true;
    if (interior === "her_warehouse" || interior === "warehouse_elec") return warehouseOpen();
    if (interior === "gym_hall") return spyKind() === "d5" || spyKind() === "b6";
    if (interior === "work") return spyKind() === "e1";
    if (interior === "home_living" || interior === "home_bed") return true;
    return false;
  }

  function hideBox() {
    $("textbox").style.display = "none";
    $("advance").style.display = "none";
  }

  function showBox() {
    $("textbox").style.display = "block";
  }

  function endNightAfter() {
    doSleep(false);
  }

  function persist() {
    localStorage.setItem(SAVE, JSON.stringify(S));
    window.LG_BLEED = bleedFlags();
  }

  function metaCarry() {
    return {
      loop: S.loop,
      int: S.int,
      str: S.str, // DESKTOP HOTFIX 2026-10-06 (#11): STR survives rewind
      money: S.money,
      mediaRoot: S.mediaRoot,
      paidOnce: S.paidOnce,
      roster: S.roster,
      watchedPayNight: S.watchedPayNight,
      jobIndex: S.jobIndex || 0,
      gallery: Object.assign(emptyPeeks(), S.gallery || {}),
      galleryAll: !!S.galleryAll, // ART+LINES debug unlock-all (meta)
      seedTakumi: !!S.seedTakumi,
      seedNightly: !!S.seedNightly,
      debug: !!S.debug,
      nightlyFollows: Object.assign({}, S.nightlyFollows || {}),
      followedMika: !!S.followedMika,
      nightlyRouteStarted: !!S.nightlyRouteStarted,
      nightlyTier: S.nightlyTier|0,
      lifetimeTips: S.lifetimeTips|0,
      nightlyToyUnlocks: Object.assign({}, S.nightlyToyUnlocks || {})
    };
  }

  function newWeek(carry) {
    const half = carry.money != null ? Math.floor(carry.money / 2) : D().START_CASH;
    const startCash = carry.loop > 1 ? half : D().START_CASH;
    return {
      loop: carry.loop || 1,
      day: 1,
      slot: 0,
      room: "home_bed",
      money: startCash,
      int: carry.int || 0,
      ate: false,
      talked: false,
      datedToday: false,
      paidDay: null,
      paidOnce: !!carry.paidOnce,
      roster: !!carry.roster,
      watchedPayNight: !!carry.watchedPayNight,
      jobIndex: carry.jobIndex || 0,
      due: D().DEBT,
      debtCut: false,
      debtCutPending: false,
      peekResume: null,
      autoSeen: {},
      sceneDone: emptyPeeks(),
      seedTakumi: !!carry.seedTakumi,
      seedNightly: !!carry.seedNightly,
      nightlyFollows: Object.assign({}, carry.nightlyFollows || {}),
      followedMika: !!carry.followedMika,
      nightlyRouteStarted: !!carry.nightlyRouteStarted,
      nightlyTier: carry.nightlyTier|0,
      lifetimeTips: carry.lifetimeTips|0,
      nightlyHunts: {},
      nightlyClipUnlocks: {},
      nightlyToyUnlocks: Object.assign({ tip: !!carry.followedMika, bump: false, stroke: false }, carry.nightlyToyUnlocks || {}),
      accusedRobert: false,
      nightlyInvitePending: false,
      nightlyInviteAccepted: false,
      nightlyShowedUp: false,
      nightlyTiedPresent: false,
      nightlyMisdirectPending: false,
      nightlyMisdirectTold: false,
      nightlyInviteTold: false,
      nightlyEnding: null,
      robertEndingId: null,
      nightlyEndingsClaimed: {},
      nightlyBleedTold: {},
      pendingBleedSms: [],
      nightlyAccuseDone: false,
      nightlyAccuseGood: false,
      nightlyPeekBArmed: false,
      nightlyFanReplySpent: {},
      hiredHimari: false,
      e3Accused: false,
      hireAsked: false,
      afterPayLifeDone: false,
      talkSpent: {},
      peekWatched: {},
      hungryTomorrow: false,
      emilyOutTonight: false,
      mediaRoot: carry.mediaRoot || DEFAULT_MEDIA,
      introDay: false,
      seenGone: false,
      workedToday: false,
      needCuddle: false,
      heardVoices: false,
      missTell: null,
      missHintShown: false,
      sleepSkipWarned: false,
      gallery: Object.assign(emptyPeeks(), carry.gallery || {}),
      galleryAll: !!carry.galleryAll, // ART+LINES debug unlock-all (meta)
      debug: !!carry.debug,
      horn: 0,
      lastSexDay: null,
      savedForYou: false,
      sotaArmed: false,
      sotaSeenTouch: false,
      sotaIdx: 0,
      giftedToday: false,
      mood: 70, // DESKTOP HOTFIX 2026-10-06 (#13): start Warm
      str: carry.str != null ? carry.str : 3,
      lastCareDay: 1,
      lastDateDay: null,
      lastTalkDay: null,
      talkIdx: 0,
      talkLog: [],
      caredToday: false,
      nightOutResolved: false,
      nightPeekTonight: false,
      realPeeks: 0,
      trainedToday: false,
      dateAskDone: null,
      bossPeekLastNight: false,
      sotaPeekLastNight: false,
      bossPeekTonight: false,
      sotaPeekTonight: false,
      // SOTA WIRE 2026-10-09
      sotaMet: false,
      goRoundChoice: {},
      talkDone: {},
      talkListened: {},
      mentionIdx: {},
      lastMentionDay: null,
      nightOutLastPath: null,
      sotaSmellDay: null,
      grMorningSeen: null,
      ntrLeft: false,
      ntsSmsDay: null,
      sexAskBand: null
    };
  }

  function showScreen(name) {
    document.querySelectorAll(".app > .screen[data-screen]").forEach((el) => {
      el.classList.toggle("active", el.dataset.screen === name);
    });
  }

  let toastQ = [];
  let toastBusy = false;
  function toast(msg) {
    // M-BATCH 2026-10-06 (#6): queued toasts, each auto-dismisses (length-scaled); click dismisses early.
    if (msg == null || msg === "") return;
    toastQ.push(String(msg));
    if (toastQ.length > 4) toastQ = toastQ.slice(-4);
    if (!toastBusy) nextToast();
  }

  function nextToast() {
    const el = $("toast");
    if (!el) { toastQ = []; toastBusy = false; return; }
    const msg = toastQ.shift();
    clearTimeout(el._t);
    if (msg == null) {
      toastBusy = false;
      el.classList.remove("on");
      return;
    }
    toastBusy = true;
    el.textContent = msg;
    el.classList.add("on");
    const done = () => {
      clearTimeout(el._t);
      el.onclick = null;
      el.classList.remove("on");
      el._t = setTimeout(nextToast, 160);
    };
    el.onclick = done;
    el._t = setTimeout(done, Math.min(4800, 1900 + msg.length * 28));
  }

  function setSprite(face) {
    const spr = $("sprite");
    if (!face) {
      spr.style.display = "none";
      return;
    }
    spr.style.display = "block";
    spr.classList.remove("boss", "king", "sota");
    if (String(face).indexOf("sota_") === 0) {
      spr.src = ART[face] || ART.sota_idle;
      spr.classList.add("sota");
    } else if (face === "boss" || face === "boss_threat" || face === "boss_smug" || face === "boss_bored") {
      spr.src = ART[face];
      spr.classList.add("boss");
    } else {
      spr.src = ART[face] || ART.idle;
    }
  }

  function slotPlate(path) {
    if (!path) return path;
    const timed = /bg_city\.jpg$/.test(path) || /_out\.jpg$/.test(path);
    if (!timed) return path;
    const sl = isNight() ? "night" : (slotName() === "morning" ? "morning" : slotName() === "evening" ? "evening" : "afternoon");
    return path.replace(/\.jpg$/, "_" + sl + ".jpg");
  }

  function setBg() {
    const room = D().ROOMS[S.room];
    const stage = $("stage");
    const bg = $("bg");
    stage.classList.toggle("hub-mode", S.room === "hub");
    if (bg) {
      if (room && room.bg) {
        // SOTA WIRE 2026-10-09: after the NTR ending she's gone; the living room uses the empty-windowsill plate.
        bg.src = (S.room === "home_living" && S.ntrLeft) ? "art/bg_apartment_ntr.jpg" : slotPlate(room.bg);
        bg.style.display = "block";
      } else {
        bg.removeAttribute("src");
        bg.style.display = "none";
      }
    }
    stage.style.backgroundImage = "none";
  }

  function renderLine(line) {
    $("who").textContent = line.sfx ? "SFX" : (line.who === "**" ? "" : (line.who || ""));
    const box = $("line");
    const t = line.text || "";
    if (line.who === "**" || /^\*\*/.test(t)) {
      box.innerHTML = `<em>${t.replace(/^\*\*/, "").replace(/\*\*$/, "").replace(/\*\*/g, "")}</em>`;
    } else if (line.sfx) {
      box.innerHTML = `<span class="sfx">${t}</span>`;
    } else {
      box.textContent = t;
    }
    showBox();
    if (line.who === "Kurosawa") {
      const f = line.face;
      setSprite(f === "smug" ? "boss_smug" : f === "threat" ? "boss_threat" : f === "bored" ? "boss_bored" : f === "neutral" ? "boss" : millerFace());
    }
    else if (line.who === "???") setSprite(null);
    else if (line.who === "Sota") setSprite("sota_" + (line.face || "idle"));
    else if (line.who === "Kaito" || line.who === "Stranger") { /* keep current sprite */ }
    else if (line.face) setSprite(emilyFace(line.face));
    else if (line.who === "Himari") setSprite(emilyFace("talk"));
  }

  function playLines(lines, then) {
    const pack = (lines || []).map((x) => {
      if (typeof x === "string") return { who: "**", text: x };
      return x;
    }).filter(Boolean);
    queue = pack.slice();
    afterQueue = then || renderRoom;
    talking = true;
    const box = $("textbox");
    clearTimeout(box._flashT);
    box._flashT = null;
    const step = (ev) => {
      if (ev) ev.stopPropagation();
      if (!queue.length) {
        talking = false;
        box.onclick = null;
        $("advance").onclick = null;
        $("advance").style.display = "none";
        hideBox();
        const done = afterQueue;
        afterQueue = null;
        if (done) done();
        return;
      }
      $("advance").style.display = "inline-block";
      $("advance").onclick = step;
      renderLine(queue.shift());
    };
    box.onclick = null;
    showBox();
    step();
    setTimeout(() => {
      if (talking) box.onclick = step;
    }, 80);
  }

  function say(text, then) {
    playLines([{ who: "**", text }], then);
  }

  function flash(text) {
    if (!text) {
      renderRoom();
      return;
    }
    if (talking) return;
    renderRoom();
    renderLine({ who: "**", text });
    $("advance").style.display = "none";
    const box = $("textbox");
    const clear = () => {
      clearTimeout(box._flashT);
      box._flashT = null;
      box.onclick = null;
      // Never tear down an active dialogue / choice (Wait flash can outlive go->livingAutoplay).
      if (talking) return;
      hideBox();
    };
    clearTimeout(box._flashT);
    box.onclick = clear;
    box._flashT = setTimeout(clear, 2200);
  }

  function hud() {
    $("stat-loop").innerHTML = `LOOP <b>${S.loop}</b>`;
    $("stat-day").innerHTML = `DAY <b>${S.day}</b>/${weekLen()}`;
    $("stat-slot").innerHTML = slotName().toUpperCase();
    $("stat-money").innerHTML = `\u00A3 <b>${S.money}</b>`;
    ["stat-debt", "stat-job", "stat-himari"].forEach((id) => {
      const el = $(id);
      if (el) el.style.display = "none";
    });
    const si = $("stat-int");
    if (si) { si.style.display = ""; si.innerHTML = `INT <b>${S.int || 0}</b>`; }
    const ss = $("stat-str");
    if (ss) { ss.style.display = ""; ss.innerHTML = `STR <b>${S.str || 3}</b>`; }
    const due = $("route-due");
    if (due) due.innerHTML = `DUE <b>${dueNow()}</b>`;
    const moodEl = $("route-mood");
    if (moodEl) moodEl.textContent = moodWord();
    const hintEl = $("route-hint");
    if (hintEl) {
      const hint = hornHint();
      const pend = (nightOutPendingTell() || goRoundAskPending() && slotName() !== "night") ? slText("sota.ui.hud.friendsTonight", "Out with friends tonight") : "";
      hintEl.textContent = [hint, pend].filter(Boolean).join("  -  ");
    }
    const food = $("stat-food");
    if (food) {
      food.style.display = "none";
      food.textContent = "";
    }
    const badge = $("hud-phone-badge");
    if (badge) {
      const n = pendingSmsCount() + (S.nightlyUnread | 0); // M-BATCH #4: Nightly unread too
      badge.hidden = n < 1;
      badge.textContent = n > 0 ? String(n) : "";
    }
    const pips = $("pips");
    pips.innerHTML = "";
    D().SLOTS.forEach((name, i) => {
      const el = document.createElement("div");
      el.className = "pip";
      if (i < S.slot) el.classList.add("done");
      if (i === S.slot) el.classList.add("now");
      if (name === "evening" && isNightOutDay() && !S.nightOutResolved) el.classList.add("event");
      if (name === "evening" && goRoundAskPending()) el.classList.add("event");
      if (name === "night" && ((spyKind() && peekSlotIndex(spyKind()) === 3) || S.nightPeekTonight || sotaPeekKind() || S.goRoundTonight)) el.classList.add("bad");
      if (name === "evening" && spyKind() && peekSlotIndex(spyKind()) === 2) el.classList.add("bad");
      if (name === "afternoon" && spyKind() === "e2") el.classList.add("bad");
      pips.appendChild(el);
    });
  }

  function renderHub() {
    $("hub-map").style.display = "block";
    $("sprite").style.display = "none";
    $("hub-map").innerHTML = D().HUB_PINS.map((p) => {
      let sub = p.sub;
      if (p.room === "apt_block" && nightOutPendingTell()) sub = slText("sota.ui.map.goingOut", "She's going out later");
      if (p.room === "apt_block" && goRoundAskPending() && slotName() !== "night") sub = slText("sota.ui.map.mightGoOut", "She might go out later");
      return `<button class="pin" style="left:${p.x}%;top:${p.y}%" data-room="${p.room}"><b>${p.label}</b><span>${sub}</span></button>`;
    }).join("");
    $("hub-map").querySelectorAll(".pin").forEach((btn) => {
      btn.onclick = () => go(btn.dataset.room);
    });
  }

  function emilyHere() {
    if (S.room === "cafe") return true;
    if (emilyRoom() === S.room) return true;
    return false;
  }

  function careGood() {
    return moodWarmBand();
  }

  function canAskSex() {
    // SOTA WIRE 2026-10-09: she's in the living room at night (emilyRoom), so the old home_bed-only check
    // made the ask unreachable. Ask from wherever she is at home at night.
    return !!(isNight() && isHomeRoom(S.room) && emilyHere() && S.lastSexDay !== S.day);
  }

  function canPeekHere() {
    if (!peekSlotActive()) return false;
    const kind = spyKind();
    const set = D().SETS[kind];
    return !!(set && S.room === set.where);
  }

  function exitLabel(ex) {
    if (ex === "hub") return "City map";
    if (S.room === "home_bed" && ex === "home_living") return "Downstairs";
    if (S.room === "home_living" && ex === "home_bed") return "Upstairs";
    if (ex === "apt_block") return S.room === "hub" ? "Apartment block" : "Building";
    if (ex === "home_living" && S.room === "apt_block") return "Your apartment";
    if (ex === "sota_out") return S.room === "sota_apt" ? "Neighbor hall" : "Sota's door";
    if (ex === "warehouse_elec") return "Electrical room";
    if (S.room === "warehouse_elec" && ex === "her_warehouse") return "Warehouse floor";
    if (ex === "sota_apt") return "Sota's apartment";
    if (S.room === "her_office" && ex === "her_warehouse") return "Warehouse";
    if (ex === "her_warehouse") return "Go inside";
    if (ex === "gym_hall") return "Go inside";
    if (ex === "work") return "Go inside";
    if (ex === "library") return "Go inside";
    if (ex === "gym_men") return "Men's lockers";
    if (ex === "gym_locker") return "Women's lockers";
    return D().ROOMS[ex].name;
  }

  function actions() {
    const room = D().ROOMS[S.room];
    const night = isNight();
    const left = slotsLeft();
    const dateLock = false;
    const btns = [];
    const add = (id, label, extra, disabled) => {
      btns.push(`<button data-act="${id}" class="${extra || ""}"${disabled ? " disabled" : ""}>${label}</button>`);
    };

    const set = peekSet();
    const exits = (room.exits || []).slice();
    // Sota door only after night home absence beat (seenGone)
    // SOTA WIRE 2026-10-09: Sota's door shows at night while he has her (checkHome flash until you've checked the flat)
    // and on later nights once he's had her (notTonight flash). Never before the first Sota night.
    const sotaDoorBtn = S.room === "apt_block" && isNight() && (sotaDoorLive() || (S.sotaIdx | 0) >= 1);
    if (sotaDoorBtn && exits.indexOf("sota_out") < 0) exits.push("sota_out");

    const ROOM_DEPTH = {
      hub: 0,
      cafe: 1,
      apt_block: 1, warehouse_out: 1, gym_out: 1, work_out: 1, library_out: 1,
      home_living: 2, her_warehouse: 2, gym_hall: 2, work: 2, library: 2, sota_out: 2,
      home_bed: 3, her_office: 3, warehouse_elec: 3, gym_men: 3, gym_locker: 3, sota_apt: 3
    };
    const hereDepth = ROOM_DEPTH[S.room] != null ? ROOM_DEPTH[S.room] : 0;
    const inward = [];
    const outward = [];
    exits.forEach((ex) => {
      if (ex === "sota_out" && !sotaDoorBtn) return;
      if (set && peekSlotActive() && ex === set.where && S.room === set.from) return; // Crack handles where
      const d = ROOM_DEPTH[ex] != null ? ROOM_DEPTH[ex] : hereDepth;
      if (d < hereDepth) outward.push(ex);
      else inward.push(ex);
    });

    let crackAdded = false;
    if (set && peekSlotActive() && S.room === set.from) {
      add("peek", "Crack " + set.door + " open", "danger");
      crackAdded = true;
    }
    inward.forEach((ex) => {
      if (crackAdded && set && ex === set.where) return;
      add("go:" + ex, exitLabel(ex));
    });

    if (!dateLock && room.work && !night && left >= 2 && !S.workedToday) add("work", "Work shift (2 slots)", "primary");
    if (room.work && !night) {
      const nxt = nextJob();
      if (nxt) {
        const ready = S.int >= nxt.minInt;
        add("promote", ready ? "Ask for promotion" : "Ask for promotion (INT " + nxt.minInt + ")", ready ? "primary" : "", !ready);
      }
    }
    if (!dateLock && room.study && !night) add("study", "Study");
    if (S.room === "home_bed" && !night && S.slot < 2) add("nap", "Nap (skip slot)");
    /* STEP_PHONE_NIGHTLY_SHELL: bedroom "Her phone" dropped; HUD icon only */
    if (canAskSex()) add("sex", (sexOnCooldown() || soreCoverArmed() || moodWord() === "Gone") ? "Ask for sex (not tonight)" : "Ask for sex", "primary");
    if (S.room === "home_bed") add("sleep", "Sleep until morning", "danger");
    if ((S.room === "hub" || S.room === "apt_block") && slotsLeft() > 0) add("wait", "Wait (skip slot)");
    if (S.room === "gym_hall" && !night && left > 0) add("train", "Train (1 slot)"); // M-BATCH #10: bar minigame, replayable

    const huntAct = armedHunt();
    if (huntAct && S.room === huntAct.room) {
      add("hunt:" + huntAct.id, "Pick up " + huntAct.label);
    }
    armRobertEndings();
    // M-BATCH 2026-10-06 (#4): no bedroom button. Tied ending starts when you enter / sleep in the bedroom at night after Mika's invite DM.
    if (peekAReady() && S.room === "warehouse_elec") {
      add("ending:peek_electrical", "Peek the electrical set");
    }
    if (peekBReady() && S.room === "her_warehouse") {
      add("ending:peek_workarea", "Peek the warehouse set");
    }

    outward.forEach((ex) => add("go:" + ex, exitLabel(ex)));

    $("actions").innerHTML = btns.join("");
    $("actions").querySelectorAll("button").forEach((b) => {
      b.onclick = () => act(b.dataset.act);
    });
    if ($("note")) $("note").textContent = "";
  }

  function renderRoom() {
    persist();
    hud();
    setBg();
    $("hub-map").style.display = S.room === "hub" ? "block" : "none";
    if (!peek) $("peek-layer").classList.remove("on");
    $("bar-layer").classList.remove("on");
    hideMenu();
    if (S.room === "hub") renderHub();
    if (talking) return;
    if (emilyHere()) {
      let mood = S.day >= 11 ? "ashamed" : S.day >= 7 ? "worried" : S.day >= 5 ? "ashamed" : S.day >= 3 ? "worried" : "idle";
      // DESKTOP HOTFIX 2026-10-06 (#17): at home the idle face follows mood (dialogue faces still override).
      if (atHome()) mood = ({ Loving: "smile", Warm: "soft", Distant: "distant", Cold: "tight", Gone: "tired" })[moodWord()] || mood;
      setSprite(emilyFace(mood));
    } else if (millerHere()) setSprite(millerFace());
    else setSprite(null);

    $("who").textContent = "";
    $("line").textContent = "";
    hideBox();
    actions();
    if (window.LG_AUDIO) window.LG_AUDIO.startAmbient(S.room, isNight());
  }

  function go(room) {
    if (talking) return;
    const dest = D().ROOMS[room];
    if (!dest) return;

    if (room === "gym_locker" && !((spyKind() === "d5" || spyKind() === "b6" || spyKind() === "b7") && peekSlotActive())) {
      flash(kaitoLine(L().girlsLocker));
      return;
    }

    const set = peekSet();
    if (set && peekSlotActive() && room === set.where) {
      flash(kaitoLine(L().doorSound));
      return;
    }

    if (dest.closed && isNight() && !buildingOpen(room)) {
      S.room = room.indexOf("_out") >= 0 ? room : S.room;
      if (["her_warehouse", "warehouse_elec", "gym_hall", "work", "library"].indexOf(room) >= 0) {
        const ext = room === "her_warehouse" || room === "warehouse_elec" ? "warehouse_out"
          : room === "gym_hall" ? "gym_out"
          : room === "work" ? "work_out" : "library_out";
        S.room = ext;
        renderRoom();
        flash("**" + D().ROOMS[ext].closed + "**");
        return;
      }
    }

    if (["her_warehouse", "warehouse_elec", "gym_hall", "work", "library"].indexOf(room) >= 0 && !buildingOpen(room)) {
      const ext = room === "her_warehouse" || room === "warehouse_elec" ? "warehouse_out"
        : room === "gym_hall" ? "gym_out"
        : room === "work" ? "work_out" : "library_out";
      S.room = ext;
      renderRoom();
      flash("**" + D().ROOMS[ext].closed + "**");
      return;
    }

    if (room === "sota_out" && !((sotaDoorLive() && S.seenGone)) && S.room !== "sota_apt" && S.room !== "sota_out") {
      flash(sotaDoorLive() ? slText("sota.alone.flash.checkHome", "**Check home first.**", true) : slText("sota.alone.flash.notTonight", "**Not tonight.**", true));
      return;
    }
    if (room === "sota_apt" && !sotaDoorLive()) {
      S.room = "apt_block";
      renderRoom();
      return;
    }
    const leavingSota = (S.room === "sota_out" || S.room === "sota_apt") && room !== "sota_out" && room !== "sota_apt";
    const sotaLiveLeave = leavingSota && slotName() === "night" && (!!S.nightPeekTonight || !!S.goRoundTonight);
    const enteringFloor = room === "her_warehouse" && S.room !== "her_warehouse";
    S.room = room;
    renderRoom();
    if (sotaLiveLeave) {
      if (S.goRoundTonight) {
        const gk = S.goRoundTonight;
        if (gk && !(S.sceneDone && S.sceneDone[gk])) S.sceneDone[gk] = true;
        S.goRoundTonight = null;
      } else {
        skipSotaPeek();
        clearNightSotaPeek();
      }
      persist();
      hud();
      actions();
      return;
    }
    if (room === "apt_block" && sotaMeetDue()) {
      runSotaMeet();
      return;
    }
    if (room === "home_bed" && isNight() && tiedShowUpReady()) {
      startRobertEnding("tied"); // M-BATCH #4: Mika's DM named our bedroom, tonight
      return;
    }
    if (livingAutoplay()) return;
    if (room === "home_living" && peekSlotActive() && !S.seenGone) {
      S.seenGone = true;
      flash(goneLine());
      return;
    }
    if (room === "home_living" && isNight() && (S.nightPeekTonight || sotaPeekKind()) && !S.seenGone) {
      S.seenGone = true;
      flash(goneLine());
      return;
    }
    if (room === "home_living" && isNight() && paidTonight() && !S.seenGone) {
      S.seenGone = true;
      flash(L().findPaid || L().findEmilyPaid || goneLine());
      return;
    }
    if (isNight() && !S.heardVoices && (
      (room === "her_warehouse" && (spyKind() === "d3" || spyKind() === "b4" || spyKind() === "b5")) ||
      (room === "warehouse_elec") ||
      (room === "gym_locker" || room === "gym_hall") ||
      (room === "work" || room === "her_office")
    ) && peekSlotActive()) {
      S.heardVoices = true;
      flash(voicesLineFor(room));
    }
  }

  function kickOutAtNight() {
    const map = {
      library: "library_out",
      work: "work_out",
      gym_hall: "gym_out",
      gym_men: "gym_out",
      gym_locker: "gym_out",
      her_warehouse: "warehouse_out",
      her_office: "warehouse_out",
      warehouse_elec: "warehouse_out",
      cafe: "hub"
    };
    const ext = map[S.room];
    if (!ext) return;
    S.room = ext;
  }

  function spend(n) {
    if (!canSpend(n)) {
      flash(kaitoLine(L().sleepWaitEnding) || "**Not yet. I've still got something to do today.**");
      return false;
    }
    const before = S.slot;
    const sotaPending = sotaPeekKind();
    for (let i = 0; i < n; i++) {
      if (S.slot < 3) S.slot += 1;
    }
    if (sotaPending && before === 0 && S.slot > 0) skipSotaPeek(sotaPending);
    armRobertEndings();
    if (spyKind() === "b7" && before <= 2 && S.slot > 2) markPeekMissed("b7");
    if (spyKind() === "e2" && before <= 1 && S.slot > 1) markPeekMissed("e2");
    if (spyKind() === "e3" && before <= 2 && S.slot > 2) markPeekMissed("e3");
    const liveSet = peekSet();
    if (liveSet && peekSlotActive() && S.room === liveSet.where && liveSet.from) {
      S.room = liveSet.from;
    }
    if (before < 3 && S.slot >= 3) {
      kickOutAtNight();
      resolveNightOutNight();
      deliverNtsEpilogue();
      if ((S.room === "home_living" || S.room === "home_bed") && spyKind() && !S.seenGone) {
        S._goneNow = true;
      }
    }
    if (S.room === "home_living" && isNightOutDay() && !S.nightOutResolved && (slotName() === "evening" || isNight())) {
      S._askAfterSpend = true;
    }
    if (S.room === "home_living" && goRoundAskPending() && (slotName() === "evening" || isNight())) {
      S._askAfterSpend = true;
    }
    return true;
  }

  function flushGoneThen(next) {
    if (!S._goneNow) {
      if (next) next();
      return;
    }
    S._goneNow = false;
    playLines([{ who: "**", text: goneLine() }], next || renderRoom);
  }

  function sendToBed() {
    S.room = "home_bed";
    renderRoom();
    flash(kaitoLine(L().timeForBed));
  }

  function goneLine() {
    if (sotaPeekKind() || S.nightPeekTonight) return slText("sota.alone.sleepOver", "She said she'd sleep at a friend's. Where?", true);
    if (S.day === 9 && L().goneB4) return kaitoLine(L().goneB4);
    if (S.day === 11 && L().goneB5) return kaitoLine(L().goneB5);
    if (S.day === 17 && L().goneB6) return kaitoLine(L().goneB6);
    if (S.day === 19 && L().goneB7) return kaitoLine(L().goneB7);
    if (S.day === 21 && L().goneB8) return kaitoLine(L().goneB8);
    if (S.day === 25) {
      const end = endingPath();
      if (end === "ntr" || end === "nts" || end === "good") {
        const g = slText("sota.end." + end + ".gone", "", true);
        if (g) return g;
      }
      const bossEnd = bossEndingPath();
      if (bossEnd === "e3" && L().goneE3) return L().goneE3;
      if (bossEnd === "e1" && L().goneE1) return L().goneE1;
      if (bossEnd === "e2" && L().goneE2) return L().goneE2;
    }
    if (S.goRoundTonight) return slText("sota.alone.absent", "**She's not here.**", true);
    if (paidTonight() && (L().findPaid || L().findEmilyPaid)) return kaitoLine(L().findPaid) || kaitoLine(L().findEmilyPaid);
    return S.day === 7 ? kaitoLine(L().emilyGoneD7) : kaitoLine(L().emilyGone);
  }

  function livingAutoplay() {
    if (S.room !== "home_living") return false;
    if (!S.autoSeen) S.autoSeen = {};
    if (isNightOutDay() && !S.nightOutResolved && emilyHere() && (slotName() === "evening" || isNight())) {
      runNightOutAsk();
      return true;
    }
    if (goRoundAskPending() && emilyHere() && (slotName() === "evening" || isNight())) {
      runGoRoundAsk();
      return true;
    }
    if (isNight() && S.nightOutPath === "b" && S.nightOutResolved && !S.homecomingSeen && emilyHere()) {
      S.homecomingSeen = true;
      S.needCuddle = true; // SOTA WIRE: homecoming -> bed.suspects at sleep
      persist();
      playLines(pathBHomePack(), renderRoom);
      return true;
    }
    if ((sotaPeekKind() || S.nightPeekTonight) && !S.goRoundTonight && !S.seenGone) {
      S.seenGone = true;
      persist();
      playLines([sl("sota.alone.sleepOver") || { who: "**", text: "**She said she'd sleep at a friend's. Where?**" }], renderRoom);
      return true;
    }
    // DESKTOP HOTFIX 3: Boss morning covers/aftermath only when Himari is in this room.
    // Runs before the isNight early-return so a pack delayed past morning (she was out / at work)
    // can still fire when she is home at night. autoSeen stays unset until it plays.
    // D4 silent debt-half in doSleep still runs if the pack never played today.
    if (emilyHere()) {
      const pack = bossMorningPack();
      if (pack.length) {
        S.autoSeen[S.day] = true;
        persist();
        playLines(pack, () => {
          if (S.debtCutPending && S.day === 4) {
            S.due = Math.floor(dueNow() / 2);
            S.debtCutPending = false;
            S.debtCut = true;
          }
          renderRoom();
        });
        return true;
      }
    }
    if (emilyHere() && smellDue()) {
      playSmell();
      return true;
    }
    if (isNight()) return false;
    // SOTA WIRE 2026-10-09: Path A morning-after (sota.morning.r{rung}.watched|skipped). Smell beat later the same day.
    if (emilyHere() && slotName() === "morning" && S.nightOutPath === "a" && S.nightOutDay === S.day - 1 && !S.residueHomeSeen) {
      S.residueHomeSeen = true;
      S.sotaSmellDay = S.day;
      persist();
      playLines(morningPathAPack(), renderRoom);
      return true;
    }
    // Go-round morning-after (D23 / D25): she comes back from Sota's.
    const grPrev = S.goRoundChoice && S.goRoundChoice[S.day - 1];
    if (emilyHere() && slotName() === "morning" && (grPrev === "agree" || grPrev === "encourage") && S.grMorningSeen !== S.day) {
      S.grMorningSeen = S.day;
      persist();
      const kind = grPrev === "encourage" ? "encouraged" : "agreed";
      const b = band3();
      playLines([slBand("sota.gr.morning." + kind + ".1", b), slBand("sota.gr.morning." + kind + ".2", b)].filter(Boolean), renderRoom);
      return true;
    }
    // Her date ask: morning or evening (she's at the warehouse every other daytime slot, so evening-only was unreachable).
    if (sheWantsDate() && (slotName() === "morning" || slotName() === "evening") && emilyHere() && !isNightOutDay()) {
      runHerDateAsk();
      return true;
    }
    const mention = mentionDue();
    if (emilyHere() && mention && (slotName() === "morning" || slotName() === "evening")) {
      const band = moodWord().toLowerCase();
      S.mentionIdx[band] = (S.mentionIdx[band] | 0) + 1;
      S.lastMentionDay = S.day;
      persist();
      playLines([sl(mention)].filter(Boolean), renderRoom);
      return true;
    }
    return false;
  }

  function pushBoss(pack, base) {
    const line = bossBandLine(base);
    if (line) pack.push(line);
  }

  function bossMorningPack() {
    const pack = [];
    const day = S.day | 0;
    if (S.autoSeen[day]) return pack;
    if (day === 1) {
      pushBoss(pack, "boss.tutorial.d01.clientLoss");
      pushBoss(pack, "boss.tutorial.d01.debtThreat");
      pushBoss(pack, "boss.tutorial.d01.askHelp");
      const k = bossLine("boss.tutorial.d01.kaitoShort");
      if (k) pack.push(k);
      return pack;
    }
    if (day === 4) {
      if (peekWatched("d3")) pushBoss(pack, "boss.aftermath.d04.afterD3");
      else if (S.paidDay == null) pushBoss(pack, "boss.aftermath.d04.missedD3");
      if (pack.length && S.debtCutPending) pushBoss(pack, "boss.aftermath.d04.debtHalf");
      S.missTell = null;
      return pack;
    }
    if (day === 6) {
      if (peekWatched("d5")) pushBoss(pack, "boss.aftermath.d06.afterD5");
      else if (S.paidDay == null) pushBoss(pack, "boss.aftermath.d06.missedD5");
      S.missTell = null;
      return pack;
    }
    if (day === 8 && !sotaPeekKind()) {
      if (S.paidDay == null) {
        if (peekWatched("d7")) pushBoss(pack, "boss.aftermath.d08.afterD7");
        else pushBoss(pack, "boss.aftermath.d08.missedD7");
        pushBoss(pack, "boss.money.sunday.unpaid");
      } else {
        pushBoss(pack, "boss.money.sunday.paid");
      }
      return pack;
    }
    if (day === 10 && peekWatched("b4")) { pushBoss(pack, "boss.cover.afterB4"); S.missTell = null; return pack; }
    if (day === 12 && peekWatched("b5")) { pushBoss(pack, "boss.cover.afterB5"); S.missTell = null; return pack; }
    if (day === 18 && peekWatched("b6")) { pushBoss(pack, "boss.cover.afterB6"); S.missTell = null; return pack; }
    if (day === 20 && peekWatched("b7")) { pushBoss(pack, "boss.cover.afterB7"); S.missTell = null; return pack; }
    if (day === 22 && peekWatched("b8")) { pushBoss(pack, "boss.cover.afterB8"); S.missTell = null; return pack; }
    return pack;
  }

  function mustFindEmily() {
    const kind = spyKind();
    return peekSlotActive();
  }

  function act(id) {
    if (talking) return;
    if (id.startsWith("go:")) {
      go(id.slice(3));
      return;
    }
    if (id.startsWith("gift:")) {
      gift(id.slice(5));
      return;
    }
    if (id.startsWith("hunt:")) {
      findHunt(id.slice(5));
      return;
    }
    if (id.startsWith("ending:")) {
      startRobertEnding(id.slice(7));
      return;
    }
    const map = {
      talk, offer, hire, accuse, talkMiller, work, study, nap, sleep, date, wait, peek: startPeek,
      phone: openPhone, promote, sex, train
    };
    if (mustFindEmily() && ["nap", "wait", "work", "study", "date"].indexOf(id) >= 0 && !S.missHintShown) {
      S.missHintShown = true;
      persist();
      playLines([{ who: "**", text: kaitoLine(L().findEmily) }], () => { if (map[id]) map[id](); });
      return;
    }
    if (map[id]) map[id]();
  }

  function gift(kind) {
    if (!emilyHere()) return;
    kind = kind === "chocolate" ? "chocolate" : "flowers";
    const cost = GIFT_COST[kind];
    if (S.giftedToday) {
      flash(slText("sota.gift.already", "**I already got her something today.**", true));
      return;
    }
    if (S.money < cost) {
      playLines([slBand("sota.gift.broke", band3())].filter(Boolean), renderRoom);
      return;
    }
    const b5 = band5(); // her reaction reads the mood she was in when you handed it over
    const week1 = weekOneDebt() && (b5 === "loving" || b5 === "warm");
    S.money -= cost;
    S.giftedToday = true;
    S.talked = true;
    markCared();
    if (kind === "chocolate") {
      bumpHorn(1);
      bumpMood(MOOD_DELTA.giftChocoMood);
    } else bumpMood(MOOD_DELTA.giftFlowers);
    persist();
    hud();
    const line = (week1 && sl("sota.gift." + kind + ".week1Debt")) || sl("sota.gift." + kind + "." + b5);
    playLines([line].filter(Boolean), renderRoom);
  }

  function interrogate() { flash("**Not in this slice.**"); }
  function sex() {
    if (!canAskSex()) return;
    // SOTA WIRE 2026-10-09 priority: D6 sore cover (if armed) > next-day cooldown > Gone refusal > ask.
    if (soreCoverArmed()) {
      playLines([slBand("sota.sex.soreCover", band3())].filter(Boolean), renderRoom);
      return;
    }
    if (sexOnCooldown()) {
      playLines([slBand("sota.sex.cooldown", band3())].filter(Boolean), renderRoom);
      return;
    }
    const b5 = band5();
    if (b5 === "gone") {
      playLines([sl("sota.sex.ask.gone")].filter(Boolean), renderRoom);
      return;
    }
    S.sexAskBand = b5;
    const good = b5 === "loving" || b5 === "warm"; // Distant / Cold: reluctant yes -> bf1Bad
    playLines([sl("sota.sex.ask." + b5)].filter(Boolean), () => startBfSex(good));
  }


  function startBfSex(good) {
    const rails = window.LG_RAILS || {};
    startPeek("bf1", {
      homeSex: true,
      careGood: good,
      clipSeq: good ? [0, 1, 2, 3, 4, 5] : [0, 5],
      rail: good ? rails.bf1 : (rails.bf1Bad || rails.bf1)
    });
  }

  let galleryView = "routes";
  let phoneApp = "home";
  let nightlyView = "feed";
  let nightlyWho = null;
  let nightlyTab = "feed";
  let nightlyFromView = "feed";
  let nightlyFromWho = null;

  function pendingSmsCount() {
    if (!S) return 0;
    ensureSmsState();
    // M-BATCH #6: unread texts; an unanswered reply keeps the badge at >= 1 until answered (or the day ends).
    return Math.max(S.smsUnread | 0, S.smsReply ? 1 : 0);
  }

  let smsView = "list";
  let smsCalling = false;

  function smsThreadOpen() {
    const layer = $("phone-layer");
    return !!(layer && layer.classList.contains("on") && phoneApp === "messages" && smsView === "thread");
  }

  function ensureSmsState() {
    if (!S || S._smsMigrating) return;
    S._smsMigrating = true;
    try {
      if (!Array.isArray(S.smsLog)) S.smsLog = [];
      if (S.smsUnread == null) S.smsUnread = 0;
      if (S.smsReply === undefined) S.smsReply = null;
      if (S.nightlyUnread == null) S.nightlyUnread = 0;
      // Migrate pre-M-batch saves: old pending queues / in-flight S._sms become chat history.
      if (S.pendingBleedSms && S.pendingBleedSms.length) {
        const q = S.pendingBleedSms;
        S.pendingBleedSms = [];
        q.forEach((m) => {
          if (!m || !m.text) return;
          if (m.key && S.smsLog.some((x) => x.key === m.key)) return;
          S.smsLog.push({ who: "Himari", text: m.text, key: m.key || null, day: S.day | 0, slot: S.slot | 0 });
          S.smsUnread += 1;
        });
      }
      if (S._sms && Array.isArray(S._sms.msgs)) {
        S._sms.msgs.forEach((m) => {
          if (!m || !m.text) return;
          const me = m.who === "Kaito" || !!m.me;
          S.smsLog.push({ who: me ? "You" : "Himari", me: me, text: m.text, day: S.day | 0, slot: S.slot | 0 });
        });
        if (!S._smsIdle) {
          S.smsUnread += 1;
          if (!S.smsReply) S.smsReply = { kind: S._smsMorningReply ? "morning" : "nightOut", day: S.day | 0 };
        }
      }
      if (S._sms !== undefined) { S._sms = null; S._smsIdle = false; S._smsMorningReply = false; }
      if (S.smsNightOutPending) {
        S.smsNightOutPending = false;
        S.smsReply = { kind: "nightOut", day: S.day | 0 };
        (smsPack() || []).forEach((m) => { if (m && m.text) { S.smsLog.push({ who: "Himari", text: m.text, day: S.day | 0, slot: S.slot | 0 }); S.smsUnread += 1; } });
      }
      if (S.smsAfterPeekMorningPending) {
        S.smsAfterPeekMorningPending = false;
        S.smsReply = { kind: "morning", day: S.day | 0 };
        (morningSmsPack() || []).forEach((m) => { if (m && m.text) { S.smsLog.push({ who: "Himari", text: m.text, day: S.day | 0, slot: S.slot | 0 }); S.smsUnread += 1; } });
      }
      if (S.smsLog.length > 300) S.smsLog = S.smsLog.slice(-300);
    } finally {
      S._smsMigrating = false;
    }
  }

  function deliverHimari(msgs, opts) {
    opts = opts || {};
    ensureSmsState();
    const open = smsThreadOpen();
    let n = 0;
    let first = "";
    (msgs || []).forEach((m) => {
      const text = typeof m === "string" ? m : (m && m.text);
      if (!text) return;
      const me = !!(m && (m.me || m.who === "Kaito"));
      S.smsLog.push({ who: me ? "You" : "Himari", me: me, text: text, key: (m && m.key) || null, day: S.day | 0, slot: S.slot | 0 });
      if (!me) { n += 1; if (!first) first = text; }
    });
    if (!n) { persist(); return 0; }
    if (!open) S.smsUnread = (S.smsUnread | 0) + n;
    persist();
    if (!open && !opts.silent) toast("Himari" + (n > 1 ? " (" + n + ")" : "") + ": " + first);
    if (open) paintSmsPhone();
    refreshPhoneBadges();
    return n;
  }

  function smsWhen(m) {
    const slots = (D() && D().SLOTS) || ["morning", "afternoon", "evening", "night"];
    const sl = String(slots[(m && m.slot) | 0] || "");
    return "Day " + ((m && m.day) | 0) + (sl ? " \u00B7 " + sl.charAt(0).toUpperCase() + sl.slice(1) : "");
  }

  function smsReplyLabel() {
    const r = S.smsReply;
    if (!r) return "";
    if (r.kind === "morning") return "OK.";
    return S.nightOutPath === "a" ? slText("sota.sms.pathA.reply", "OK.") : slText("sota.sms.pathB.reply", "See you.");
  }

  function sendSmsReply() {
    const r = S.smsReply;
    if (!r) return;
    const label = smsReplyLabel();
    S.smsLog.push({ who: "You", me: true, text: label, day: S.day | 0, slot: S.slot | 0 });
    S.smsReply = null;
    const morningOnly = r.kind === "morning";
    S.nightSmsDone = true;
    if (!morningOnly && S.nightOutPath === "a") {
      S.nightPeekTonight = true;
      S.emilyOutTonight = true;
    }
    if (!morningOnly && isNight()) resolveNightOutNight();
    persist();
    hud();
    paintSmsPhone();
    if (!talking && !peek) renderRoom();
    if (morningOnly) toast("She's home-ish. Don't push.");
    else toast(S.nightOutPath === "a" ? slText("sota.toast.pathA", "She's staying out.") : slText("sota.toast.pathB", "She's coming home later."));
  }

  function peekCallLive() {
    // M-BATCH #9: Call button only while a peek is live (flavour; she never answers).
    try { return !!(peekSlotActive() || sotaPeekKind()); } catch (e) { return false; }
  }

  function callHimari() {
    if (smsCalling || !peekCallLive()) return;
    smsCalling = true;
    paintSmsPhone();
    setTimeout(() => {
      smsCalling = false;
      if (!S) return;
      ensureSmsState();
      S.smsLog.push({ sys: true, text: "Call \u00B7 No answer", day: S.day | 0, slot: S.slot | 0 });
      persist();
      if (smsThreadOpen()) paintSmsPhone();
      else toast("No answer.");
    }, 2600);
  }

  function ensureGallery() {
    if (!S.gallery) S.gallery = emptyPeeks();
    return S.gallery;
  }

  function unlockGallery(kind) {
    ensureGallery();
    if (kind) S.gallery[kind] = true;
    persist();
  }

  function ensureFollows() {
    if (!S.nightlyFollows) S.nightlyFollows = {};
    return S.nightlyFollows;
  }

  function closePhone() {
    if (phoneApp === "nightly" && nightlyView === "player") {
      clearNightlyPhoneVideo();
      resumeNightlyEdiIdle();
      nightlyTab = "videos";
      nightlyView = "feed";
      nightlyWho = null;
    }
    const el = $("phone-layer");
    if (el) el.classList.remove("on");
    phoneApp = "home";
  }

  function phoneShow(app) {
    phoneApp = app || "home";
    document.querySelectorAll(".phone-frame .screen").forEach((el) => {
      el.classList.toggle("active", el.getAttribute("data-ph") === phoneApp);
    });
    const back = $("phone-back");
    if (back) back.style.visibility = phoneApp === "home" ? "hidden" : "visible";
    const clock = $("phone-clock");
    if (clock) clock.textContent = slotName() === "night" ? "21:07" : (slotName() === "morning" ? "09:14" : "15:40");
  }

  function paintHome() {
    const el = $("ph-home");
    if (!el) return;
    const smsN = pendingSmsCount();
    const badge = smsN > 0
      ? '<span class="app-badge">' + smsN + "</span>"
      : '<span class="app-badge" hidden>0</span>';
    const nyN = (S && S.nightlyUnread) | 0; // M-BATCH #4: Nightly app badge
    const nyBadge = nyN > 0
      ? '<span class="app-badge">' + nyN + "</span>"
      : '<span class="app-badge" hidden>0</span>';
    const bubble = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8A2.5 2.5 0 0 1 17.5 16H9l-4.2 3.2A.8.8 0 0 1 3.5 18.6V5.5Z"/></svg>';
    const photos = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M5 4.5A1.5 1.5 0 0 0 3.5 6v12A1.5 1.5 0 0 0 5 19.5h14a1.5 1.5 0 0 0 1.5-1.5V6A1.5 1.5 0 0 0 19 4.5H5Zm1.6 11.2 3.1-3.7 2.2 2.5 3-3.8 3.6 5H6.6ZM8.2 8.2a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8Z"/></svg>';
    const moon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M14.2 3.4a8.8 8.8 0 1 0 6.4 13.7A7.2 7.2 0 0 1 14.2 3.4Z"/></svg>';
    const gear = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M10.2 2.6h3.6l.4 2.2a7 7 0 0 1 1.8.8l2.1-1 1.8 3.1-1.7 1.5a7 7 0 0 1 0 1.6l1.7 1.5-1.8 3.1-2.1-1a7 7 0 0 1-1.8.8l-.4 2.2h-3.6l-.4-2.2a7 7 0 0 1-1.8-.8l-2.1 1-1.8-3.1 1.7-1.5a7 7 0 0 1 0-1.6L4.1 7.7l1.8-3.1 2.1 1a7 7 0 0 1 1.8-.8l.4-2.2ZM12 9.2A2.8 2.8 0 1 0 12 14.8 2.8 2.8 0 0 0 12 9.2Z"/></svg>';
    el.innerHTML = `<div class="home-apps">
        <button class="app-icon" data-app="messages" type="button">
          <div class="app-icon-bg messages-bg">${bubble}${badge}</div>
          <span>Messages</span>
        </button>
        <button class="app-icon" data-app="gallery" type="button">
          <div class="app-icon-bg gallery-bg">${photos}</div>
          <span>Gallery</span>
        </button>
        <button class="app-icon" data-app="nightly" type="button">
          <div class="app-icon-bg nightly-bg">${moon}${nyBadge}</div>
          <span>Nightly</span>
        </button>
        <button class="app-icon" data-app="settings" type="button">
          <div class="app-icon-bg settings-bg">${gear}</div>
          <span>Settings</span>
        </button>
      </div>`;
    el.querySelectorAll("[data-app]").forEach((b) => {
      b.onclick = () => openPhoneApp(b.dataset.app);
    });
  }

  function galleryListEl() {
    return $("gallery-list") || $("phone-list");
  }

  function paintPhone() {
    paintGallery();
  }

  function paintGallery() {
    ensureGallery();
    const list = galleryListEl();
    if (!list) return;
    const title = $("phone-title");
    const routes = D().GALLERY_ROUTES || [];
    if (galleryView === "nightly") {
      if (title) title.textContent = "Nightly";
      const hunts = S.nightlyHunts || {};
      list.innerHTML = `<button class="phone-item" id="gal-back"><b>Routes</b><small>back</small></button>` + huntTable().map((h) => {
        const fullOn = nyFullOn(h);
        const miss = (hunts[h.id] || {}).status === "missed";
        if (fullOn) return `<button class="phone-item" data-nyclip="${h.full}"><b>${h.label}</b><small>full - ${h.stageCount || 4} - Mika</small></button>`;
        return `<button class="phone-item locked" disabled><b>${h.label}</b><small>${miss ? "missed / gone this loop" : "locked"}</small></button>`;
      }).join("") + endingTable().map((e) => {
        if (nyEndOn(e)) return `<button class="phone-item" data-nyclip="${e.id}"><b>${escHtml(e.label)}</b><small>ending - Mika</small></button>`;
        return `<button class="phone-item locked" disabled><b>${escHtml(e.label)}</b><small>ending locked</small></button>`;
      }).join("");
      const back = $("gal-back");
      if (back) back.onclick = () => { galleryView = "routes"; paintGallery(); };
      list.querySelectorAll("[data-nyclip]").forEach((b) => {
        b.onclick = () => { closePhone(); openPhoneApp("nightly"); playNightlyClip(b.dataset.nyclip, "full"); };
      });
      return;
    }
    const rowSets = {
      boss: D().GALLERY_BOSS || D().GALLERY || [],
      jake: D().GALLERY_SOTA || []
    };
    const rowTitles = { boss: "Kurosawa", jake: "Sota" };
    if (rowSets[galleryView]) {
      const rows = rowSets[galleryView];
      if (title) title.textContent = rowTitles[galleryView] || galleryView;
      list.innerHTML = `<button class="phone-item" id="gal-back"><b>Routes</b><small>back</small></button>` + rows.map((g) => {
        const on = !!S.gallery[g.kind];
        if (on) return `<button class="phone-item" data-kind="${g.kind}"><b>${g.title}</b><small>${g.sub}</small></button>`;
        return `<button class="phone-item locked" disabled><b>Locked</b><small>${g.sub}</small></button>`;
      }).join("");
      const back = $("gal-back");
      if (back) back.onclick = () => { galleryView = "routes"; paintGallery(); };
      list.querySelectorAll("button[data-kind]").forEach((b) => {
        b.onclick = () => startPeek(b.dataset.kind, { gallery: true });
      });
    } else {
      if (title) title.textContent = "Routes";
      list.innerHTML = routes.map((r) => {
        if (r.live) return `<button class="phone-item" data-route="${r.id}"><b>${r.title}</b><small>${r.sub}</small></button>`;
        return `<button class="phone-item locked" disabled><b>${r.title}</b><small>Locked</small></button>`;
      }).join("");
      list.querySelectorAll("button[data-route]").forEach((b) => {
        b.onclick = () => { galleryView = b.dataset.route; paintGallery(); };
      });
    }
  }

  function paintMessagesList() {
    ensureSmsState();
    smsView = "list";
    const el = $("ph-messages");
    if (!el) return;
    const log = S.smsLog || [];
    const last = log[log.length - 1];
    const n = pendingSmsCount();
    const preview = last ? (last.sys ? last.text : ((last.me ? "You: " : "") + last.text)) : "No messages yet";
    el.innerHTML = '<div class="msg-head"><div class="msg-head-title">Messages</div></div>' +
      '<div class="phone-scroll"><div class="msg-list">' +
      '<button type="button" class="msg-conv' + (n ? " unread" : "") + '" id="sms-himari">' +
      '<img class="msg-av" src="art/sprite/gf_home_idle.png" alt="">' +
      '<span class="msg-conv-meta"><span class="msg-conv-top"><b>Himari</b><small>' + escHtml(last ? smsWhen(last) : "") + "</small></span>" +
      '<span class="msg-conv-prev">' + escHtml(preview) + "</span></span>" +
      (n ? '<span class="msg-unread">' + n + "</span>" : "") +
      "</button></div></div>";
    const row = $("sms-himari");
    if (row) row.onclick = () => openHimariThread({ fromList: true });
  }

  function morningSmsPack() {
    // Legacy-save migration only (smsAfterPeekMorningPending is never set now).
    return morningPathAPack();
  }

  function openHimariThread() {
    // M-BATCH #6: no more one-shot S._sms; the thread is the persistent log.
    ensureSmsState();
    phoneShow("messages");
    paintSmsPhone();
  }

  function nightlyCreators() {
    return D().NIGHTLY_CREATORS || [];
  }

  function isMika(c) {
    return !!(c && (c.id === "mika" || c.handle === "@mika"));
  }

  function showMikaSuggested() {
    ensureSotaState();
    return (S.day | 0) >= 6 && !S.followedMika;
  }

  function syncMikaFlags() {
    ensureSotaState();
    S.followedMika = !!(ensureFollows().mika);
    S.nightlySuggestedMika = showMikaSuggested();
  }

  function placeholderCreators() {
    return nightlyCreators().filter((c) => !isMika(c));
  }

  function mikaCreator() {
    return nightlyCreators().find(isMika) || { id: "mika", handle: "@mika", name: "Mika", blurb: "Soft light. Late posts." };
  }

  function followNightly(c) {
    c = c || mikaCreator();
    if (!c || !isMika(c)) return;
    const follows = ensureFollows();
    if (follows[c.id]) { paintNightly(); return; }
    follows[c.id] = true;
    S.followedMika = true;
    S.nightlyRouteStarted = true;
    S.nightlyToyUnlocks = S.nightlyToyUnlocks || {};
    S.nightlyToyUnlocks.tip = true;
    toast("Following " + (c.handle || "@mika"));
    fireFollowWelcome();
    armNextHunt();
    tickNightlyBleed();
    S.nightlySuggestedMika = showMikaSuggested();
    persist();
    paintNightly();
  }

  function sendMikaFanTone(tone) {
    if (!S.followedMika) {
      toast("Follow first.");
      return;
    }
    if (tone !== "thirsty" && tone !== "sweet" && tone !== "probing") return;
    const band = tipBandFromLifetime(S.lifetimeTips | 0);
    const spentKey = tone + "." + band;
    S.nightlyFanReplySpent = S.nightlyFanReplySpent || {};
    if (S.nightlyFanReplySpent[spentKey]) {
      toast("Already sent.");
      return;
    }
    S.nightlyDms = S.nightlyDms || [];
    S.nightlyDms.push({ key: "fan." + spentKey, text: fanToneLabel(tone), who: "You", me: true, day: S.day | 0 });
    const key = "nightly.mika.fanReply." + tone + "." + band;
    const reply = pushMikaDm(key);
    S.nightlyFanReplySpent[spentKey] = true;
    S.nightlyMikaDelivered = true;
    persist();
    if (!reply) toast("Delivered");
    paintNightly();
  }

  function sendMikaFan() {
    toast("Pick a reply.");
  }

  function huntTable() {
    return D().NIGHTLY_HUNTS || [];
  }

  function huntById(id) {
    return huntTable().find((h) => h.id === id) || null;
  }

  function toysLive() {
    return !!S.followedMika;
  }

  function syncToyUnlocks() {
    const tier = S.nightlyTier | 0;
    S.nightlyToyUnlocks = {
      tip: toysLive(),
      bump: toysLive() && tier >= 1,
      stroke: toysLive() && tier >= 2
    };
    return S.nightlyToyUnlocks;
  }

  function tipThresholds() {
    const raw = (D() && D().NIGHTLY_TIP_THRESHOLDS) || { 1: 50, 2: 375, 3: 700, 4: 1025, 5: 1350, 6: 1675, 7: 2000 };
    return raw;
  }

  function tierFromLifetime(gbp) {
    const th = tipThresholds();
    const n = gbp | 0;
    let tier = 0;
    for (let i = 1; i <= 7; i++) {
      if (n >= (th[i] | 0)) tier = i;
    }
    return tier;
  }

  function syncNightlyTierFromTips(opts) {
    const next = tierFromLifetime(S.lifetimeTips | 0);
    const prev = S.nightlyTier | 0;
    S.nightlyTier = next;
    syncToyUnlocks();
    if (opts && opts.announce && next > prev) {
      fireTierOneShots(prev, next);
    }
    tickNightlyBleed();
    return next;
  }

  function isTopFan() {
    return (S.nightlyTier | 0) >= 7 && (S.lifetimeTips | 0) >= 2000;
  }

  function endingClaimed() {
    return !!(S.nightlyEnding || S.robertEndingId);
  }

  function endingTable() {
    return (D() && D().NIGHTLY_ENDINGS) || [];
  }

  function endingById(id) {
    return endingTable().find((e) => e.id === id) || null;
  }

  function claimRobertEnding(id) {
    if (endingClaimed() && S.nightlyEnding !== id && S.robertEndingId !== id) return false;
    S.nightlyEnding = id;
    S.robertEndingId = id;
    if (!S.nightlyEndingsClaimed) S.nightlyEndingsClaimed = {};
    S.nightlyEndingsClaimed[id] = true;
    persist();
    return true;
  }

  function robertPeekBLive() {
    return S.day === 26 && !S.followedMika && !S.nightlyRouteStarted && !endingClaimed() &&
      (slotName() === "evening" || isNight());
  }

  function tiedGatesOk() {
    return S.day === 26 &&
      !!S.followedMika && !!S.nightlyRouteStarted &&
      isTopFan() &&
      !S.accusedRobert &&
      !endingClaimed();
  }

  function peekAGatesOk() {
    return S.day === 26 &&
      !!S.followedMika && !!S.nightlyRouteStarted &&
      !isTopFan() &&
      !S.accusedRobert &&
      !endingClaimed();
  }

  function peekBGatesOk() {
    return S.day === 26 &&
      !S.followedMika && !S.nightlyRouteStarted &&
      !endingClaimed();
  }

  function tiedShowUpReady() {
    return tiedGatesOk() && !!S.nightlyInvitePending;
  }

  function peekAReady() {
    return peekAGatesOk() && !!S.nightlyMisdirectPending && slotName() === "afternoon";
  }

  function peekBReady() {
    return peekBGatesOk() && slotName() === "evening";
  }

  function armRobertEndings() {
    if (!S) return;
    tickNightlyBleed();
    if (S.day !== 26 || endingClaimed()) return;
    if (tiedGatesOk()) {
      if (!S.nightlyInvitePending) {
        S.nightlyInvitePending = true;
        persist();
      }
      if (!S.nightlyInviteTold) {
        S.nightlyInviteTold = true;
        pushMikaDm("nightly.tied.invite.app");
        // M-BATCH #4: follow-up naming the place (our bedroom, tonight). TODO(Dialogue): key is empty until written.
        pushMikaDm("nightly.tied.invite.where");
        persist();
      }
    } else if (peekAGatesOk()) {
      if (!S.nightlyMisdirectPending) {
        S.nightlyMisdirectPending = true;
        persist();
      }
      if (!S.nightlyMisdirectTold) {
        S.nightlyMisdirectTold = true;
        queueHimariSms("nightly.peekA.misdirect");
        queueHimariSms("nightly.peekA.misdirect.followup");
        persist();
      }
    } else if (peekBGatesOk() && (slotName() === "evening" || isNight())) {
      S.emilyOutTonight = true;
      if (!S.nightlyPeekBArmed) {
        S.nightlyPeekBArmed = true;
        fireBleedOnce("afterPeekB");
        persist();
      }
    }
  }

  function startRobertEnding(kind) {
    let spec = null;
    if (kind === "tied") {
      if (!tiedShowUpReady()) { toast("No invite."); return; }
      S.nightlyInviteAccepted = true;
      S.nightlyShowedUp = true;
      S.nightlyTiedPresent = true;
      persist();
      spec = endingById("ending_robert_tied");
    } else if (kind === "peek_electrical") {
      if (!peekAReady()) { toast("Not now."); return; }
      spec = endingById("ending_robert_peek_electrical");
    } else if (kind === "peek_workarea") {
      if (!peekBReady()) { toast("Not now."); return; }
      spec = endingById("ending_robert_peek_workarea");
    }
    if (!spec) { toast("Ending locked."); return; }
    if (!claimRobertEnding(spec.id)) { toast("Ending already claimed this loop."); return; }
    if (kind === "tied") {
      const pack = [
        spokenLine("nightly.tied.showup", "Mika", "talk"),
        spokenLine("nightly.tied.tiesYou", "Mika", "talk"),
        spokenLine("nightly.tied.player.recognize", "Kaito", "talk"),
        spokenLine("nightly.tied.fantasy.setup", "Mika", "talk"),
        spokenLine("nightly.tied.fantasy.cheatOnBf", "Mika", "talk")
      ].filter(Boolean);
      playLines(pack, () => playRobertEnding(spec));
      return;
    }
    if (kind === "peek_electrical") fireBleedOnce("afterPeekA");
    if (kind === "peek_workarea") fireBleedOnce("afterPeekB");
    playRobertEnding(spec);
  }

  function playRobertEnding(spec) {
    nightlyWho = spec.id;
    startNightlyFullPeek(spec);
  }

  function raiseNightlyTier() {
    syncNightlyTierFromTips({ announce: true });
  }

  function spendNightly(amount, label, after, tipKind) {
    amount = amount | 0;
    if (S.money < amount) {
      toast("Not enough GBP - need GBP " + amount + ".");
      return false;
    }
    S.money -= amount;
    S.lifetimeTips = (S.lifetimeTips | 0) + amount;
    persist();
    hud();
    if (tipKind === "tip5" || tipKind === "tip20" || tipKind === "tip50") {
      fireFirstTipThanks();
      fireTipFork(tipKind);
    } else if (tipKind === "bump" || tipKind === "stroke") {
      fireTipFork(tipKind);
    } else {
      toast((label || "Paid") + " GBP " + amount);
    }
    raiseNightlyTier();
    if (after) after();
    return true;
  }

  function huntResolved(st) {
    return !!(st && (st.status === "found" || st.status === "missed"));
  }

  function huntStages(spec) {
    if (!spec) return [];
    if (spec.chain && spec.chain.length) {
      const out = [];
      spec.chain.forEach((c) => {
        const n = c.stageCount | 0;
        const stem = c.sourceStem;
        if (!stem || !n) return;
        for (let i = 0; i < n; i++) {
          out.push({
            file: stem + "_" + (i + 1) + ".mp4",
            funscript: stem + "_" + (i + 1) + ".funscript"
          });
        }
      });
      return out;
    }
    if (spec.stages && spec.stages.length) return spec.stages;
    const n = spec.stageCount || 0;
    const stem = spec.sourceStem;
    if (stem && n) {
      const out = [];
      for (let i = 0; i < n; i++) {
        out.push({
          file: stem + "_" + (i + 1) + ".mp4",
          funscript: stem + "_" + (i + 1) + ".funscript"
        });
      }
      return out;
    }
    if (spec.file) return [{ file: spec.file, funscript: spec.funscript }];
    return [];
  }

  function mediaRootPath() {
    const root = S.mediaRoot || DEFAULT_MEDIA;
    return root.endsWith("/") ? root : root + "/";
  }

  function ediBasename(file) {
    if (!file) return "";
    return String(file).split("/").pop().replace(/(\.simple)?\.funscript$/i, "").replace(/\.mp4$/i, "");
  }

  function playNightlyEdi(stage) {
    if (!stage || !stage.funscript) return;
    const name = ediBasename(stage.funscript);
    if (!name) return;
    if (window.LG_EDI && window.LG_EDI.play) {
      try { window.LG_EDI.play(name); } catch (e) {}
    }
  }

  function stopNightlyEdi() {
    if (window.LG_EDI && window.LG_EDI.stop) {
      try { window.LG_EDI.stop(); } catch (e) {}
    }
  }

  function resumeNightlyEdiIdle() {
    if (EDI()) {
      try { EDI().idle(); } catch (e) {}
      return;
    }
    if (window.LG_EDI && window.LG_EDI.idle) {
      try { window.LG_EDI.idle(); } catch (e) {}
    }
  }

  function clearNightlyPhoneVideo() {
    const vid = $("ny-clip-vid");
    if (!vid) return;
    try { vid.pause(); } catch (e) {}
    vid.onended = null;
    vid.onerror = null;
    vid.onloadeddata = null;
    vid.removeAttribute("src");
    try { vid.load(); } catch (e) {}
  }

  function buildNightlyPeekRail(spec, stages) {
    const rail = [];
    const n = (stages && stages.length) || 0;
    for (let i = 0; i < n; i++) {
      const caps = nightlyPlayerCaption(spec, false, i);
      if (caps && caps.length) {
        rail.push(caps.map((t) => ({ who: "Mika", text: t })));
      } else {
        // Stage with no keyed lines: blank beat so Continue still advances clips (no invented dialogue).
        rail.push([{ who: "", text: "" }]);
      }
    }
    return rail;
  }

  function startNightlyFullPeek(spec) {
    if (!spec) return;
    const stages = huntStages(spec);
    if (!stages.length) {
      toast("Missing media - no stages.");
      return;
    }
    const rail = buildNightlyPeekRail(spec, stages);
    const stem = spec.sourceStem || (stages[0] && stages[0].file
      ? String(stages[0].file).replace(/_\d+\.mp4$/i, "")
      : "nightly");
    nightlyFromView = nightlyView === "player" ? (nightlyFromView || "feed") : (nightlyView || "feed");
    nightlyFromWho = nightlyView === "player" ? nightlyFromWho : nightlyWho;
    nightlyTab = "videos";
    nightlyView = "feed";
    startPeek(spec.id || "nightly", {
      gallery: true,
      nightlyReturn: true,
      set: { id: stem, from: S.room, stub: false },
      rail: rail,
      stages: stages
    });
  }

  function armedHunt() {
    ensureSotaState();
    const hunts = S.nightlyHunts || {};
    for (const spec of huntTable()) {
      const st = hunts[spec.id];
      if (st && st.status === "armed") return spec;
    }
    return null;
  }

  /* Gate: arm hunt T when nightlyTier >= T and all hunts with tier < T are found|missed.
     One hunt armed per calendar day (after Follow Mika). */
  function armNextHunt() {
    if (!S.followedMika || !S.nightlyRouteStarted) return null;
    if (armedHunt()) return armedHunt();
    const hunts = S.nightlyHunts || {};
    for (const spec of huntTable()) {
      const st = hunts[spec.id];
      if (st && st.dayArmed === S.day && (st.status === "armed" || huntResolved(st))) {
        return st.status === "armed" ? spec : null;
      }
    }
    const tier = S.nightlyTier | 0;
    for (const spec of huntTable()) {
      const T = spec.nightlyTier | 0;
      if (tier < T) continue;
      const priorsOk = huntTable()
        .filter((h) => (h.nightlyTier | 0) < T)
        .every((h) => huntResolved(hunts[h.id]));
      if (!priorsOk) continue;
      const st = hunts[spec.id] || { status: "idle" };
      if (st.status === "idle") {
        hunts[spec.id] = { status: "armed", dayArmed: S.day };
        S.nightlyHunts = hunts;
        persist();
        fireHuntTease(spec);
        return spec;
      }
    }
    return null;
  }

  function missArmedHunts() {
    const hunts = S.nightlyHunts || {};
    let missed = [];
    huntTable().forEach((spec) => {
      const st = hunts[spec.id];
      if (st && st.status === "armed" && st.dayArmed === S.day) {
        hunts[spec.id] = { status: "missed", dayArmed: S.day };
        missed.push(spec);
      }
    });
    if (missed.length) {
      S.nightlyHunts = hunts;
      persist();
      toast("Hunt missed  -  clip gone this loop.");
    }
  }

  function findHunt(id) {
    const spec = huntById(id);
    if (!spec) return;
    const hunts = S.nightlyHunts || {};
    const st = hunts[spec.id];
    if (!st || st.status !== "armed") {
      toast("Nothing here.");
      return;
    }
    // M-BATCH 2026-10-06 (#2): pick-up = held. No auto unlock; report it in Mika's DMs ("I found it") any day this loop.
    hunts[spec.id] = { status: "held", dayArmed: st.dayArmed != null ? st.dayArmed : S.day, dayFound: S.day };
    S.nightlyHunts = hunts;
    persist();
    const item = huntItemKey(spec);
    const findLine = Lpath("nightly.hunt." + item + ".find") || ("You found the " + item.replace(/_/g, " ") + ".");
    toast(findLine);
    toast("Report it to Mika: Nightly \u2192 DMs \u2192 I found it.");
    renderRoom();
  }

  function heldHunts() {
    const hunts = (S && S.nightlyHunts) || {};
    return huntTable().filter((h) => hunts[h.id] && hunts[h.id].status === "held");
  }

  function reportHunt(id) {
    const spec = huntById(id);
    if (!spec) return;
    const hunts = S.nightlyHunts || {};
    const st = hunts[spec.id];
    if (!st || st.status !== "held") {
      toast("Nothing to report.");
      return;
    }
    hunts[spec.id] = { status: "found", dayArmed: st.dayArmed, dayFound: st.dayFound, dayReported: S.day };
    S.nightlyHunts = hunts;
    if (!S.nightlyClipUnlocks) S.nightlyClipUnlocks = {};
    const stages = huntStages(spec);
    S.nightlyClipUnlocks[spec.full] = {
      unlocked: true,
      kind: "full",
      huntId: spec.id,
      stageCount: spec.stageCount || stages.length || 4,
      sourceStem: spec.sourceStem || ""
    };
    ensureNightlyDlgState();
    const item = huntItemKey(spec);
    // TODO(Dialogue): nightly.hunt.report.player is empty; UI falls back to the button label.
    const mine = Lpath("nightly.hunt.report.player") || "I found it";
    S.nightlyDms.push({ key: "report." + item, text: mine, who: "You", me: true, day: S.day | 0 });
    persist();
    pushMikaDm("nightly.hunt." + item + ".unlock");
    toast("Full set unlocked \u2014 Nightly \u2192 Videos.");
    armNextHunt(); // gate: next hunt only arms once this one is reported (held is not "resolved")
    persist();
    hud();
    paintNightly();
  }

  function huntStatusLine() {
    const hunts = S.nightlyHunts || {};
    const parts = huntTable().map((spec) => {
      const st = (hunts[spec.id] || {}).status || "idle";
      if (st === "armed") return spec.label + ": hunt today";
      if (st === "held") return spec.label + ": found \u2014 report it in DMs";
      if (st === "found") return spec.label + ": found";
      if (st === "missed") return spec.label + ": missed / gone this loop";
      return "";
    }).filter(Boolean);
    return parts.join("  -  ");
  }

  function playNightlyClip(clipId, kind) {
    const spec = huntTable().find((h) => h.full === clipId || h.teaser === clipId);
    const end = endingById(clipId);
    if (end) {
      nightlyWho = end.id;
      startNightlyFullPeek(end);
      return;
    }
    const teaser = kind === "teaser" || !!(spec && spec.teaser === clipId);
    if (!spec) {
      toast("Clip locked.");
      return;
    }
    if (teaser && !teaserUnlocked(spec)) {
      toast("Teaser locked - raise tier.");
      return;
    }
    if (!teaser) {
      if (!nyFullOn(spec)) {
        toast("Clip locked.");
        return;
      }
    }
    nightlyFromView = nightlyView === "player" ? (nightlyFromView || "feed") : nightlyView;
    nightlyFromWho = nightlyView === "player" ? nightlyFromWho : nightlyWho;
    nightlyTab = "videos";
    nightlyWho = teaser ? spec.teaser : spec.full;
    if (teaser) {
      nightlyView = "player";
      paintNightlyPlayer(spec, true);
    } else {
      startNightlyFullPeek(spec);
    }
  }

  function paintNightlyPlayer(spec, teaser) {
    const el = $("ph-nightly");
    if (!el) return;
    const root = mediaRootPath();
    const stages = huntStages(spec);
    const list = teaser ? stages.slice(0, 1) : stages.slice();
    let idx = 0;
    const title = teaser ? "Teaser - locked peek" : ((spec && spec.label) || "Nightly") + " - full set";
    el.innerHTML = `<div class="phone-title">Nightly player</div>
      <div class="phone-scroll nightly-player">
        <div class="nightly-im" id="ny-clip-card">Missing media</div>
        <video id="ny-clip-vid" class="nightly-vid" controls playsinline style="display:none;width:100%;max-height:280px;background:#000"></video>
        <div class="nightly-im nightly-stage" id="ny-clip-meta"></div>
      </div>`;
    const vid = $("ny-clip-vid");
    const card = $("ny-clip-card");
    const meta = $("ny-clip-meta");

    function showMissing(file) {
      resumeNightlyEdiIdle();
      if (vid) {
        vid.removeAttribute("src");
        vid.style.display = "none";
      }
      if (card) {
        card.style.display = "block";
        card.textContent = "Missing media - " + (file || "no stage file");
      }
    }

    function loadStage(i) {
      idx = i;
      const stage = list[i];
      const file = stage && stage.file ? stage.file : "";
      const src = file ? root + file : "";
      const total = list.length;
      const hook = teaser ? "no funscript" : (stage && stage.funscript ? ediBasename(stage.funscript) : "silent");
      const spoken = nightlyPlayerCaption(spec, teaser, i);
      if (meta) {
        const head = (teaser ? "Stage 1 peek" : ("Stage " + (i + 1) + " / " + total)) +
          " - " + (file || "-") +
          " - EDI: " + hook;
        meta.textContent = spoken.length ? (head + "\n" + spoken.join(" / ")) : head;
      }
      if (!vid || !src) {
        showMissing(file);
        return;
      }
      vid.onended = null;
      vid.onerror = () => showMissing(file);
      vid.onloadeddata = () => {
        vid.style.display = "block";
        if (card) card.style.display = "none";
      };
      vid.src = src;
      vid.play().catch(() => {});
      if (teaser) {
        stopNightlyEdi();
        vid.onended = () => { resumeNightlyEdiIdle(); };
      } else {
        playNightlyEdi(stage);
        vid.onended = () => {
          if (idx + 1 < total) loadStage(idx + 1);
          else resumeNightlyEdiIdle();
        };
      }
    }

    if (!list.length) showMissing((spec && spec.sourceStem) || "");
    else loadStage(0);

  }

  function leaveNightlyPlayer() {
    clearNightlyPhoneVideo();
    resumeNightlyEdiIdle();
    nightlyTab = "videos";
    nightlyView = "feed";
    nightlyWho = null;
    paintNightly();
  }

  function nightlyTabsHtml() {
    if (!["feed", "dms", "videos"].includes(nightlyTab)) nightlyTab = "feed";
    const un = S.nightlyUnread | 0;
    const dmBadge = un > 0 && nightlyTab !== "dms" ? ' <span class="ny-tab-badge">' + un + "</span>" : "";
    return '<div class="ny-tabs">' +
      '<button class="ny-tab' + (nightlyTab === "feed" ? " on" : "") + '" data-nytab="feed">Feed</button>' +
      '<button class="ny-tab' + (nightlyTab === "dms" ? " on" : "") + '" data-nytab="dms">DMs' + dmBadge + "</button>" +
      '<button class="ny-tab' + (nightlyTab === "videos" ? " on" : "") + '" data-nytab="videos">Videos</button>' +
      "</div>";
  }

  function nightlyHeaderHtml() {
    const mika = mikaCreator();
    const sub = S.followedMika
      ? ("Following \u00B7 Tier " + (S.nightlyTier | 0) + " \u00B7 \u00A3" + (S.lifetimeTips | 0) + (isTopFan() ? " \u00B7 #1 fan" : ""))
      : (mika.handle || "@mika");
    return '<div class="ny-head">' + creatorAvatar(mika) + '<div class="ny-meta"><div class="phone-title" style="padding:0">' +
      escHtml(mika.name || "Mika") + "</div><small>" + escHtml(sub) + "</small></div></div>";
  }

  function nightlyFeedPostsHtml() {
    ensureNightlyDlgState();
    const items = [];
    const day = S.day | 0;
    if (day >= 6) {
      for (let d = 6; d <= Math.min(day, 26); d++) {
        const dd = String(d).padStart(2, "0");
        const cap = Lpath("nightly.mika.d" + dd + ".post");
        if (!cap) continue;
        items.push({ day: d, ord: 0, html: '<div class="nightly-post"><div class="nightly-photo"><img src="art/nightly_mika_d' + dd + '_post.png" alt=""></div>' +
          '<div class="nightly-cap"><small class="ny-post-day">Day ' + d + "</small>" + escHtml(cap) + "</div></div>" });
      }
    }
    (S.nightlyPublicPosts || []).forEach((p, i) => {
      items.push({ day: p.day | 0, ord: 1 + i, html: '<div class="nightly-post ny-tease"><div class="nightly-cap"><small class="ny-post-day">Day ' + (p.day | 0) + " \u00B7 hunt</small>" + escHtml(p.text) + "</div></div>" });
    });
    items.sort((a, b) => (b.day - a.day) || (b.ord - a.ord));
    return items.map((x) => x.html).join("");
  }

  function nightlyFeedBodyHtml() {
    const mika = mikaCreator();
    let top = "";
    if (!S.followedMika) {
      if (showMikaSuggested()) {
        top = '<div class="ny-follow-card">' + creatorRowHtml(mika, mika.handle) +
          '<div class="ny-follow-blurb">' + escHtml(mika.blurb || "") + "</div>" +
          '<button type="button" class="ny-follow-btn" id="ny-follow">Follow</button></div>';
      } else {
        top = '<div class="nightly-im">Nothing here yet.</div>';
      }
    }
    const armed = S.followedMika ? armedHunt() : null;
    const clue = armed ? '<div class="nightly-im nightly-clue">' + escHtml(armed.clue) + "</div>" : "";
    const held = heldHunts();
    const heldNote = held.length ? '<div class="nightly-im nightly-clue">' + escHtml("Found: " + held.map((h) => h.label).join(", ") + " \u2014 report it in DMs.") + "</div>" : "";
    const posts = nightlyFeedPostsHtml();
    const empty = (!posts && S.followedMika) ? '<div class="nightly-im">No posts yet.</div>' : "";
    return '<div class="phone-scroll"><div class="phone-list">' + top + clue + heldNote + posts + empty + "</div></div>";
  }

  function nightlyDmsBodyHtml() {
    ensureNightlyDlgState();
    const followed = !!S.followedMika;
    let pins = "";
    if (S.nightlyInvitePending && !endingClaimed()) pins += '<div class="ny-sys">Meet: your bedroom \u00B7 tonight</div>';
    let composer = "";
    if (!followed) {
      composer = '<div class="nightly-im">Follow Mika to message her.</div>';
    } else {
      const band = tipBandFromLifetime(S.lifetimeTips | 0);
      const spent = S.nightlyFanReplySpent || {};
      const chips = ["thirsty", "sweet", "probing"].map((tone) => {
        const used = !!spent[tone + "." + band];
        return '<button class="ny-choice' + (used ? " spent" : "") + '" data-tone="' + tone + '"' + (used ? " disabled" : "") + ">" + (used ? fanToneLabel(tone) + " (seen)" : fanToneLabel(tone)) + "</button>";
      }).join("");
      const held = heldHunts().map((h) => '<button type="button" class="ny-choice ny-found" data-report="' + h.id + '">I found it <small>' + escHtml(h.label) + "</small></button>").join("");
      const toys = syncToyUnlocks();
      const tips = '<div class="nightly-tip">' +
        '<button data-tip="5">Tip \u00A35</button>' +
        '<button data-tip="20">Tip \u00A320</button>' +
        '<button data-tip="50">Tip \u00A350</button>' +
        (toys.bump ? '<button data-toy="bump">Bump \u00A310</button>' : '<button disabled>Bump (tier 1)</button>') +
        (toys.stroke ? '<button data-toy="stroke">Stroke \u00A325</button>' : '<button disabled>Stroke (tier 2)</button>') +
        "</div>";
      composer = (held ? '<div class="ny-btn-row">' + held + "</div>" : "") +
        '<div class="ny-btn-row">' + chips + "</div>" + tips;
    }
    return '<div class="ny-thread">' +
      '<div class="ny-bubbles phone-scroll" id="ny-bubbles">' + dmThreadBubblesHtml() + pins + "</div>" +
      '<div class="ny-composer col">' + composer + "</div></div>";
  }

  function nightlyVideosBodyHtml() {
    const hunts = S.nightlyHunts || {};
    const armed = armedHunt();
    const clue = S.nightlyEnding ? ("Ending claimed - " + S.nightlyEnding) : (S.nightlyInvitePending ? "Mika: meet tonight — your bedroom." : (S.nightlyMisdirectPending ? "Misdirect: meet electrical this afternoon." : (armed ? "Hunt: " + armed.clue : (huntStatusLine() || "No hunt today."))));
    let clips = '<div class="phone-scroll"><div class="phone-list"><div class="nightly-im">' + escHtml(clue) + '</div><div class="nightly-sec">Clips</div>';
    huntTable().forEach((h) => {
      const fullOn = nyFullOn(h);
      const miss = (hunts[h.id] || {}).status === "missed";
      const held = (hunts[h.id] || {}).status === "held";
      const teaOn = teaserUnlocked(h);
      // DESKTOP HOTFIX 2026-10-06 (#3): full set unlocked -> teaser row hidden.
      if (fullOn) { /* teaser superseded */ }
      else if (teaOn) clips += '<button class="phone-item" data-clip="' + h.teaser + '" data-kind="teaser"><b>Teaser</b><small>' + escHtml(h.label) + " - stage 1 peek</small></button>";
      else clips += '<button class="phone-item locked" disabled><b>Teaser</b><small>' + escHtml(h.label) + " - tier " + (h.nightlyTier|0) + "</small></button>";
      if (fullOn) clips += '<button class="phone-item" data-clip="' + h.full + '" data-kind="full"><b>Full set</b><small>' + escHtml(h.label) + " - " + (h.stageCount || huntStages(h).length || 4) + " stages</small></button>";
      else clips += '<button class="phone-item locked" disabled><b>Full set</b><small>' + (miss ? "missed / gone this loop" : (held ? "found — report it in DMs" : "hunt to unlock")) + "</small></button>";
    });
    endingTable().forEach((e) => {
      const onEnd = nyEndOn(e);
      if (onEnd) clips += '<button class="phone-item" data-clip="' + e.id + '" data-kind="full"><b>' + escHtml(e.label) + "</b><small>ending replay</small></button>";
      else clips += '<button class="phone-item locked" disabled><b>' + escHtml(e.label) + "</b><small>ending locked</small></button>";
    });
    clips += "</div></div>";
    return clips;
  }

  function nightlyCreatorsShellHtml() {
    return ""; // M-BATCH #5: one-screen Nightly (Mika only). Suggested bar / placeholder creators removed.
  }

  function nightlyTabBodyHtml() {
    if (nightlyTab === "dms") return nightlyDmsBodyHtml();
    if (nightlyTab === "videos") return nightlyVideosBodyHtml();
    return nightlyFeedBodyHtml();
  }

  function bindNightlyChrome(el) {
    el.querySelectorAll("[data-nytab]").forEach((b) => {
      b.onclick = () => { nightlyTab = b.dataset.nytab; paintNightly(); };
    });
    el.querySelectorAll("[data-tip]").forEach((b) => {
      b.onclick = () => tipNightly(mikaCreator(), parseInt(b.dataset.tip, 10));
    });
    el.querySelectorAll("[data-toy]").forEach((b) => {
      b.onclick = () => useNightlyToy(b.dataset.toy);
    });
    el.querySelectorAll("[data-clip]").forEach((b) => {
      b.onclick = () => playNightlyClip(b.dataset.clip, b.dataset.kind);
    });
    el.querySelectorAll("[data-tone]").forEach((b) => {
      b.onclick = () => sendMikaFanTone(b.dataset.tone);
    });
    el.querySelectorAll("[data-report]").forEach((b) => {
      b.onclick = () => reportHunt(b.dataset.report);
    });
    const f = el.querySelector("#ny-follow");
    if (f) f.onclick = () => followNightly(mikaCreator());
  }

  function paintNightly() {
    armNextHunt();
    armRobertEndings();
    const el = $("ph-nightly");
    if (!el) return;
    if (nightlyView === "player") {
      const spec = huntTable().find((h) => h.full === nightlyWho || h.teaser === nightlyWho) || endingById(nightlyWho);
      if (spec) {
        paintNightlyPlayer(spec, !!(spec.teaser && spec.teaser === nightlyWho));
        return;
      }
      leaveNightlyPlayer();
      return;
    }
    // M-BATCH 2026-10-06 (#5): one screen = Mika's page. Tabs Feed / DMs / Videos. No profile / follow screen.
    ensureFollows();
    syncMikaFlags();
    ensureSmsState();
    nightlyView = "feed";
    nightlyWho = null;
    if (!["feed", "dms", "videos"].includes(nightlyTab)) nightlyTab = "feed";
    const wasUnread = S.nightlyUnread | 0;
    if (nightlyTab === "dms") S.nightlyUnread = 0;
    el.innerHTML = nightlyHeaderHtml() + nightlyTabsHtml() + nightlyTabBodyHtml();
    bindNightlyChrome(el);
    const bub = $("ny-bubbles");
    if (bub) bub.scrollTop = bub.scrollHeight;
    if (wasUnread !== (S.nightlyUnread | 0)) { persist(); hud(); }
  }

  function tipNightly(creator, amount) {
    const mika = isMika(creator);
    if (mika) {
      const kind = amount === 50 ? "tip50" : amount === 20 ? "tip20" : "tip5";
      if (!spendNightly(amount, "Tipped " + ((creator && creator.handle) || ""), null, kind)) return;
      paintNightly();
      return;
    }
    amount = amount | 0;
    if (S.money < amount) {
      toast("Not enough GBP - need GBP " + amount + ".");
      return;
    }
    S.money -= amount;
    persist();
    hud();
    toast("Tipped " + ((creator && creator.handle) || "") + " GBP " + amount);
  }

  function useNightlyToy(kind) {
    const prices = (D().NIGHTLY_TOYS) || { bump: 10, stroke: 25 };
    const cost = kind === "stroke" ? (prices.stroke || 25) : (prices.bump || 10);
    const toys = syncToyUnlocks();
    if (kind === "bump" && !toys.bump) { toast("Bump locked - raise tier."); return; }
    if (kind === "stroke" && !toys.stroke) { toast("Stroke locked - raise tier."); return; }
    const ok = spendNightly(cost, kind === "stroke" ? "Stroke" : "Bump", () => paintNightly(), kind === "stroke" ? "stroke" : "bump");
    if (ok) playToyScript(kind);
  }

  // M-BATCH 2026-10-06 (#7): Greg lock - bump = grey victory (work_hit_grey), stroke = blue victory (work_hit_blue).
  // Then back to EDI idle (only if nothing else took the device meanwhile).
  let toyTimer = 0;
  function playToyScript(kind) {
    const name = kind === "stroke" ? "work_hit_blue" : "work_hit_grey";
    const ms = kind === "stroke" ? 2000 : 1400;
    if (!EDI()) return;
    try { EDI().play(name); } catch (e) { return; }
    clearTimeout(toyTimer);
    toyTimer = setTimeout(() => {
      if (!EDI() || peek) return;
      if (EDI().current && EDI().current() !== name) return;
      try { EDI().idle(); } catch (e) {}
    }, ms);
  }

  function paintSettings() {
    const el = $("ph-settings");
    if (!el) return;
    el.innerHTML = `<div class="phone-title">Settings</div>
      <div class="phone-scroll"><div class="phone-list">
        <div class="phone-item"><b>Debug</b><small>always visible</small></div>
        <button class="phone-item" id="dbg-cash"><b>Add \u00A35000</b><small>debug</small></button>
        <button class="phone-item" id="dbg-int"><b>Add 50 intelligence</b><small>debug</small></button>
        <button class="phone-item" id="dbg-day"><b>Skip to day</b><small>morning of that day</small></button>
        <button class="phone-item" id="dbg-horn"><b>Horn +1</b><small>now ${(S.horn || 0)}/5</small></button>
        <button class="phone-item" id="dbg-sexcd"><b>Mark sex tonight</b><small>cooldown = next day</small></button>
        <button class="phone-item" id="dbg-arm"><b>Arm Sota</b><small>${S.sotaArmed ? "armed" : "not armed"}</small></button>
        <button class="phone-item" id="dbg-unlockall"><b>Unlock all scenes</b><small>${S.galleryAll ? "unlocked - Gallery + Nightly Videos" : "Gallery only, no story change"}</small></button>
      </div></div>`;
    const cash = $("dbg-cash");
    const intel = $("dbg-int");
    const dayBtn = $("dbg-day");
    if (cash) cash.onclick = () => { S.money += 5000; persist(); hud(); toast("+\u00A35000"); };
    if (intel) intel.onclick = () => { S.int += 50; persist(); hud(); toast("+50 INT"); };
    if (dayBtn) dayBtn.onclick = () => {
      const raw = window.prompt("Skip to day (1-" + weekLen() + "). Morning.", String(S.day));
      const n = parseInt(raw, 10);
      if (!n || n < 1 || n > weekLen()) return;
      const keep = window.confirm("Keep pay and peek state?\\nOK = keep\\nCancel = reset this week's pay and peeks");
      skipToDay(n, keep);
    };
    const hornBtn = $("dbg-horn");
    const sexBtn = $("dbg-sexcd");
    if (hornBtn) hornBtn.onclick = () => { bumpHorn(1); persist(); paintSettings(); toast("horn " + S.horn); };
    if (sexBtn) sexBtn.onclick = () => { markSexNight(); persist(); toast("lastSexDay " + S.lastSexDay); };
    const allBtn = $("dbg-unlockall");
    if (allBtn) allBtn.onclick = () => {
      if (!window.confirm("Unlock every scene in the Gallery? Story, days and money are not changed.")) return;
      debugUnlockAllScenes(); paintSettings(); toast("All scenes unlocked");
    };
    const armBtn = $("dbg-arm");
    if (armBtn) armBtn.onclick = () => { armSota(); persist(); paintSettings(); toast(S.sotaArmed ? "Sota armed" : "arm failed"); };
  }

  function openPhoneApp(app) {
    if (app === "messages") {
      phoneShow("messages");
      if (pendingSmsCount()) openHimariThread();
      else paintMessagesList();
      return;
    }
    if (app === "gallery") {
      galleryView = galleryView || "routes";
      phoneShow("gallery");
      paintGallery();
      return;
    }
    if (app === "nightly") {
      nightlyView = "feed";
      nightlyWho = null;
      nightlyTab = (S && (S.nightlyUnread | 0) > 0) ? "dms" : "feed"; // M-BATCH #4: unread DMs open on DMs
      phoneShow("nightly");
      paintNightly();
      return;
    }
    if (app === "settings") {
      phoneShow("settings");
      paintSettings();
      return;
    }
    phoneShow("home");
    paintHome();
  }

  function fitPhoneFrame() {
    const layer = $("phone-layer");
    const frame = $("phone-frame");
    const fit = $("phone-fit");
    if (!layer || !frame) return;
    const pad = 28;
    const s = Math.min(1, (layer.clientWidth - pad) / 390, (layer.clientHeight - pad) / 800);
    if (fit) {
      fit.style.width = Math.round(390 * s) + "px";
      fit.style.height = Math.round(800 * s) + "px";
    }
    frame.style.transform = "scale(" + s + ")";
    frame.style.transformOrigin = "top left";
  }

  if (typeof window !== "undefined" && !window.__lgPhoneFitBound) {
    window.__lgPhoneFitBound = true;
    window.addEventListener("resize", () => { if ($("phone-layer") && $("phone-layer").classList.contains("on")) fitPhoneFrame(); });
  }

  function openPhone() {
    const deep = pendingSmsCount() > 0;
    $("phone-layer").classList.add("on");
    fitPhoneFrame();
    if (deep) {
      openHimariThread();
      return;
    }
    if ((S.nightlyUnread | 0) > 0) { // M-BATCH #4: deep-link unread Nightly DMs
      openPhoneApp("nightly");
      return;
    }
    phoneShow("home");
    paintHome();
  }

  function skipToDay(n, keepState) {
    S.emilyOutTonight = false;
    S.day = n;
    S.slot = 0;
    S.room = "home_bed";
    S.ate = false;
    S.talked = false;
    S.datedToday = false;
    S.workedToday = false;
    S.seenGone = false;
    S.heardVoices = false;
    S.needCuddle = false;
    S.missHintShown = false;
    S.caredToday = false;
    S.nightPeekTonight = false;
    S.nightOutResolved = false;
    S.nightOutPath = null;
    S.nightOutNightDone = null;
    S.homecomingSeen = false;
    S.trainedToday = false;
    S.sleepSkipWarned = false;
    S.peekResume = null;
    S.introDay = false;
    S.bossPeekTonight = false;
    S.sotaPeekTonight = false;
    S.bossPeekLastNight = false;
    S.sotaPeekLastNight = false;
    if (!keepState) {
      S.paidDay = null;
      S.missTell = null;
      S.sceneDone = emptyPeeks();
      S.autoSeen = {};
      S.hireAsked = false;
      S.afterPayLifeDone = false;
      S.talkSpent = {};
      S.peekWatched = {};
      S.horn = 0;
      S.lastSexDay = null;
      S.savedForYou = false;
      S.sotaArmed = false;
      S.sotaSeenTouch = false;
      S.sotaIdx = 0;
      S.goRoundDone = 0;
      S.encouragedGoRound = false;
      S.goRoundTonight = null;
      S.goRoundAsked = {};
      S.goRoundChoice = {};
      S.talkDone = {};
      S.talkListened = {};
      S.mentionIdx = {};
      S.lastMentionDay = null;
      S.sotaMet = false;
      S.nightOutLastPath = null;
      S.sotaSmellDay = null;
      S.grMorningSeen = null;
      S.ntrLeft = false;
      S.ntsSmsDay = null;
      S.hiredHimari = false;
      S.e3Accused = false;
      S.mood = 70; // DESKTOP HOTFIX 2026-10-06 (#13)
      S.talkIdx = 0;
      S.talkLog = [];
      S.lastCareDay = n;
      S.lastDateDay = null;
      S.lastTalkDay = null;
      S.realPeeks = 0;
      S.nightPeekTonight = false;
      S.nightlyFollows = {};
      S.followedMika = false;
      S.nightlyRouteStarted = false;
      S.nightlySuggestedMika = (n | 0) >= 6;
      S.nightlyTier = 0;
      S.lifetimeTips = 0;
      S.nightlyHunts = {};
      S.nightlyClipUnlocks = {};
      S.nightlyToyUnlocks = { tip: false, bump: false, stroke: false };
      S.accusedRobert = false;
      S.nightlyInvitePending = false;
      S.nightlyInviteAccepted = false;
      S.nightlyShowedUp = false;
      S.nightlyTiedPresent = false;
      S.nightlyMisdirectPending = false;
      S.nightlyMisdirectTold = false;
      S.nightlyInviteTold = false;
      S.nightlyEnding = null;
      S.robertEndingId = null;
      S.nightlyEndingsClaimed = {};
      S.nightlyDms = [];
      S.nightlyPublicPosts = [];
      S.nightlyTierTold = {};
      S.nightlyHuntTeased = {};
      S.nightlyFollowWelcomeDone = false;
      S.nightlyFirstTipThanksDone = false;
      S.nightlyBleedTold = {};
      S.pendingBleedSms = [];
      S.nightlyAccuseDone = false;
      S.nightlyAccuseGood = false;
      S.nightlyPeekBArmed = false;
      S.nightlyFanReplySpent = {};
      S.smsLog = [];
      S.smsUnread = 0;
      S.smsReply = null;
      S.nightlyUnread = 0;
    }
    S.smsReply = null; // M-BATCH #6: a night-out reply never carries across a day skip
    S.nightlySuggestedMika = (S.day | 0) >= 6 && !S.followedMika;
    armRobertEndings();
    persist();
    hud();
    closePhone();
    renderRoom();
    toast("Day " + n + " morning. Play to night for the peek. Himari is home until then.");
  }

  function hideMenu() {
    const m = $("char-menu");
    if (m) m.classList.remove("on");
  }

  function openMenu() {
    if (!emilyHere() && !millerHere()) return;
    if (emilyHere() && smellDue() && !talking) { playSmell(); return; } // she leans past you for the kettle
    const m = $("char-menu");
    if (!m) return;
    const items = [];
    if (emilyHere()) {
      const talkOn = talkQueueFor(S.room).length > 0;
      items.push(["talk", "Talk", !talkOn]);
      const canHireNow = S.hireAsked && !S.hiredHimari && !S.e3Accused && canHireHimari() && S.day >= 12 && S.day <= 24;
      if (canHireNow) items.push(["hire", "Hire her"]);
      else if (!isNight() && S.day < 8) items.push(["offer", "Give money"]);
      if (S.day === 24 && !S.hiredHimari && S.paidDay == null && !S.e3Accused) items.push(["accuse", "Accuse her"]);
      items.push(["gift:flowers", "Gift flowers (\u00A315)"]);
      items.push(["gift:chocolate", "Gift chocolate (\u00A38)"]);
      if (!isNight() && slotsLeft() >= 2) {
        items.push(["date", dateOnCooldown() ? "Date (cooldown)" : "Date (2 slots)"]);
      }
      if (canAskSex()) items.push(["sex", (sexOnCooldown() || soreCoverArmed() || moodWord() === "Gone") ? "Ask for sex (not tonight)" : "Ask for sex"]);
    } else if (millerHere()) {
      items.push(["talkMiller", "Talk"]);
    }
    m.innerHTML = items.map(([id, lab, disabled]) => `<button data-act="${id}"${disabled ? " disabled" : ""}>${lab}</button>`).join("");
    m.querySelectorAll("button").forEach((b) => {
      b.onclick = (e) => { e.stopPropagation(); hideMenu(); act(b.dataset.act); };
    });
    m.classList.add("on");
  }

  function showChoices(prompt, options, then) {
    talking = true;
    const box = $("textbox");
    const adv = $("advance");
    if (adv) adv.style.display = "none";
    showBox();
    const pwho = prompt && prompt.who;
    // SOTA WIRE 2026-10-09: narration prompts ("**") get the empty narration nameplate, never Himari's.
    $("who").textContent = pwho === "**" ? "" : (pwho || "Himari");
    const line = $("line");
    const ptext = prompt && prompt.text ? String(prompt.text) : "";
    const head = !ptext ? "" : (pwho === "**" || /^\*\*/.test(ptext))
      ? `<div class="choice-prompt"><em>${ptext.replace(/\*\*/g, "")}</em></div>`
      : `<div class="choice-prompt">${ptext}</div>`;
    line.innerHTML = head + options.map((o, i) => `<button class="choice" data-i="${i}">${o.label}</button>`).join("");
    line.querySelectorAll("button.choice").forEach((b) => {
      b.onclick = (ev) => {
        ev.stopPropagation();
        talking = false;
        hideBox();
        const opt = options[+b.dataset.i];
        if (then) then(opt);
      };
    });
    box.onclick = null;
  }

  function goRoundDayKey() {
    return S.day === 24 ? "d24" : "d22";
  }

  function runGoRoundAsk() {
    ensureSotaState();
    if (!S.goRoundAsked) S.goRoundAsked = {};
    S.goRoundAsked[S.day] = true;
    persist();
    const G = "sota.gr." + goRoundDayKey();
    const b = band3();
    const afterYes = goRoundDayKey() === "d24" && (S.goRoundDone | 0) >= 1;
    const l1 = (afterYes && sl(G + ".ask.1.afterYes." + b)) || slBand(G + ".ask.1", b);
    playLines([l1, slBand(G + ".ask.2", b)].filter(Boolean), () => {
      showChoices(promptOf(G + ".prompt"), [
        { id: "agree", label: slText(G + ".choice.agree", "Agree") },
        { id: "encourage", label: slText(G + ".choice.encourage", "Encourage her") },
        { id: "refuse", label: slText(G + ".choice.refuse", "Refuse") }
      ], resolveGoRoundAsk);
    });
  }

  function resolveGoRoundAsk(opt) {
    ensureSotaState();
    const id = (opt && opt.id) || "refuse";
    const dk = goRoundDayKey();
    const G = "sota.gr." + dk;
    const b = band3();
    // afterYes gates read the state BEFORE tonight's choice lands
    const yesBefore = (S.goRoundDone | 0) >= 1;
    const encD22 = S.goRoundChoice[22] === "encourage";
    S.goRoundChoice[S.day] = id;
    let r1 = null;
    if (dk === "d24" && id === "encourage" && encD22) r1 = sl(G + ".reply.encourage.1.afterYes." + b);
    if (dk === "d24" && id === "agree" && yesBefore) r1 = sl(G + ".reply.agree.1.afterYes." + b);
    if (!r1) r1 = slBand(G + ".reply." + id + ".1", b);
    const r2 = slBand(G + ".reply." + id + ".2", b);
    if (id === "refuse") {
      persist();
      playLines([r1, r2].filter(Boolean), renderRoom);
      return;
    }
    if (id === "encourage") S.encouragedGoRound = true;
    S.goRoundDone = (S.goRoundDone || 0) + 1;
    S.goRoundTonight = S.goRoundDone === 1 ? "gr1" : "gr2";
    S.emilyOutTonight = true;
    persist();
    playLines([r1, r2].filter(Boolean), () => {
      S.slot = 3;
      S.seenGone = true;
      persist();
      flash(slText("sota.alone.absent", "**She's not here.**", true));
    });
  }

  function runNightOutAsk() {
    S.nightOutResolved = true;
    S.nightOutAskMood = S.mood == null ? 70 : S.mood; // D6 Path A reads the mood at the ask (before the stay-ask penalty)
    persist();
    const b5 = band5();
    const d = S.day | 0;
    const lines = [];
    if (d === 6) {
      lines.push(sl("sota.d06.ask." + b5));
    } else {
      lines.push(sl("sota.d" + (d < 10 ? "0" + d : d) + ".ask." + b5));
      const last = S.nightOutLastPath;
      const cbk = last === "stayOk" ? "stayedLastTime" : last === "a" ? "neverCameHome" : last === "b" ? "wentLastTime" : null;
      if (cbk) lines.push(sl("sota.nightout.callback." + cbk));
    }
    playLines(lines.filter(Boolean), () => {
      showChoices(promptOf(d === 6 ? "sota.d06.prompt" : "sota.nightout.prompt"), [
        { id: "stay", label: slText("sota.d06.choice.stay", "Stay in with me tonight?") },
        { id: "go", label: slText("sota.d06.choice.go", "Go on, have fun.") }
      ], (opt) => resolveNightOut(opt.id === "stay"));
    });
  }

  function resolveNightOut(askedStay) {
    const warm = moodWarmBand();
    const d6 = S.day === 6; // D6: asking her to stay always fails
    const b5 = band5();
    if (askedStay && warm && !d6) {
      S.nightOutLastOutcome = "stayOk";
      S.nightOutLastPath = "stayOk";
      playLines([slBand("sota.nightout.stayOk", b5)].filter(Boolean), () => {
        S.nightPeekTonight = false;
        persist();
        renderRoom();
      });
      return;
    }
    if (askedStay) {
      S.nightOutLastOutcome = "stayFail";
      const line = d6 ? sl("sota.d06.stayFail." + b5) : slBand("sota.nightout.stayFail", b5);
      bumpMood(MOOD_DELTA.stayFail);
      playLines([line].filter(Boolean), sendHerOut);
      return;
    }
    S.nightOutLastOutcome = "go";
    playLines([d6 ? sl("sota.d06.go." + b5) : sl("sota.nightout.go." + b5)].filter(Boolean), sendHerOut);
  }

  function nightOutGoesPathA() {
    // D6 (Greg lock 2026-10-09): Path A iff mood < 65 at the ask, checked before the stay-ask -6.
    if (S.day === 6) return (S.nightOutAskMood == null ? (S.mood == null ? 70 : S.mood) : S.nightOutAskMood) < 65;
    // D10 / D18 keep the old rule: Cold/Gone or horn >= 4.
    const cold = moodWord() === "Cold" || moodWord() === "Gone";
    return cold || (S.horn || 0) >= 4;
  }

  function sendHerOut() {
    const pathA = nightOutGoesPathA();
    S.nightOutPath = pathA ? "a" : "b";
    S.nightOutLastPath = S.nightOutPath;
    S.nightOutDay = S.day;
    if (pathA) S.pathANightCount = (S.pathANightCount | 0) + 1;
    S.emilyOutTonight = true;
    S.nightPeekTonight = false;
    S.nightSmsDone = false;
    S.homecomingSeen = false;
    bumpMood(MOOD_DELTA.goOut);
    S.moodDrainedTonight = true;
    persist();
    queueNightOutSms();
    if (isNight()) {
      resolveNightOutNight();
      if (pathA) S.seenGone = true; // SOTA WIRE: Kaito watched her walk out tonight - no "check home first" at Sota's door
    }
    renderRoom(); // DESKTOP HOTFIX 2026-10-06 (#16): she leaves the room now, not after the texts
  }

  function smsPack() {
    if (S.nightOutPath === "a") {
      const r = pathARung();
      return [1, 2, 3].map((n) => sl("sota.sms.pathA.r" + r + "." + n)).filter(Boolean);
    }
    const b = moodWarmBand() ? "warm" : "cool";
    return [1, 2, 3].map((n) => sl("sota.sms.pathB." + n + "." + b)).filter(Boolean);
  }


  function queueNightOutSms() {
    // M-BATCH #6: night-out texts land in the chat now; reply stays pending until answered (back never drops it).
    ensureSmsState();
    S.smsNightOutPending = false;
    S.smsReply = { kind: "nightOut", day: S.day | 0 };
    const pack = smsPack() || [];
    if (!deliverHimari(pack)) { persist(); hud(); }
  }

  function runNightOutSms() {
    queueNightOutSms();
  }

  function paintSmsPhone() {
    ensureSmsState();
    smsView = "thread";
    const el = $("ph-messages");
    if (!el) return;
    const hadUnread = S.smsUnread | 0;
    S.smsUnread = 0;
    const log = S.smsLog || [];
    let body = "";
    let stamp = "";
    log.forEach((m) => {
      const w = smsWhen(m);
      if (w !== stamp) { body += '<div class="msg-stamp">' + escHtml(w) + "</div>"; stamp = w; }
      if (m.sys) body += '<div class="msg-sys">' + escHtml(m.text) + "</div>";
      else body += '<div class="msg-row ' + (m.me ? "me" : "her") + '"><div class="msg-bubble">' + escHtml(m.text) + "</div></div>";
    });
    if (!log.length) body = '<div class="msg-sys">No messages yet.</div>';
    if (smsCalling) body += '<div class="msg-sys msg-calling">Calling Himari\u2026</div>';
    const callBtn = peekCallLive()
      ? '<button type="button" class="msg-call" id="sms-call"' + (smsCalling ? " disabled" : "") + ">" + (smsCalling ? "Calling\u2026" : "Call") + "</button>"
      : "";
    const reply = S.smsReply
      ? '<button type="button" class="msg-reply" id="sms-reply">' + escHtml(smsReplyLabel()) + "</button>"
      : '<div class="msg-input-ghost">Text Message</div>';
    el.innerHTML = '<div class="msg-head thread"><img class="msg-av sm" src="art/sprite/gf_home_idle.png" alt="">' +
      '<div class="msg-head-title">Himari</div>' + callBtn + "</div>" +
      '<div class="phone-scroll msg-thread" id="sms-thread">' + body + "</div>" +
      '<div class="msg-composer">' + reply + "</div>";
    const th = $("sms-thread");
    if (th) th.scrollTop = th.scrollHeight;
    const rb = $("sms-reply");
    if (rb) rb.onclick = sendSmsReply;
    const cb = $("sms-call");
    if (cb) cb.onclick = callHimari;
    if (hadUnread) { persist(); hud(); }
  }

  function resolveNightOutNight() {
    if (!S.nightOutResolved || !S.nightOutPath) return;
    if (S.nightOutNightDone === S.day) return;
    if (nightsWouldStack(S.day)) {
      /* consult: keep Himari night-out resolution */
    }
    S.nightOutNightDone = S.day;
    if (S.nightOutPath === "a") {
      S.nightPeekTonight = true;
      S.emilyOutTonight = true;
      persist();
    } else {
      S.nightPeekTonight = false;
      S.emilyOutTonight = false;
      persist();
    }
  }

  function runHerDateAsk() {
    S.dateAskDone = S.day;
    persist();
    const b5 = band5();
    playLines([sl("sota.date.herAsk." + b5)].filter(Boolean), () => {
      showChoices(promptOf("sota.date.herAsk.prompt"), [
        { id: "yes", label: slText("sota.date.herAsk.choice.yes", "Okay. Date.") },
        { id: "no", label: slText("sota.date.herAsk.choice.no", "Not today.") }
      ], (opt) => {
        if (opt.id === "no") {
          bumpMood(MOOD_DELTA.declineDate);
          playLines([sl("sota.date.herAskNo." + b5)].filter(Boolean), renderRoom);
          return;
        }
        startDateFlow();
      });
    });
  }


  function runNightlyAccuse() {
    const pack = [
      spokenLine("nightly.accuse.open", "Kaito", "talk"),
      spokenLine("nightly.accuse.her.deny", "Himari", "worried"),
      spokenLine("nightly.accuse.her.deflect", "Himari", "distant"),
      spokenLine("nightly.accuse.player.push", "Kaito", "talk"),
      spokenLine("nightly.accuse.her.crack", "Himari", "ashamed")
    ].filter(Boolean);
    playLines(pack, () => {
      showChoices({ who: "Kaito", text: Lpath("nightly.accuse.her.crack") || "She waits." }, [
        { id: "soft", label: "Let her stop." },
        { id: "hard", label: "Don't let her off." }
      ], (opt) => {
        const good = !(opt && opt.id === "hard");
        S.accusedRobert = true;
        S.nightlyAccuseDone = true;
        S.nightlyAccuseGood = good;
        S.nightlyInvitePending = false;
        persist();
        const fallKey = good ? "nightly.accuse.fallout.good" : "nightly.accuse.fallout.bad";
        playLines([spokenLine(fallKey, "Himari", good ? "plead" : "tight")].filter(Boolean), () => {
          if (good) {
            const after = Lpath("nightly.accuse.sms.after");
            if (after) queueHimariSms("nightly.accuse.sms.after");
            fireBleedOnce("afterAccuse");
            persist();
          }
          renderRoom();
        });
      });
    });
  }

  function talk() {
    if (!emilyHere()) return;
    const q = talkQueueFor(S.room);
    if (!q.length) return;
    const beat = q[0];
    S.talked = true;
    if (beat.kind === "nightlyAccuse") {
      persist();
      runNightlyAccuse();
      return;
    }
    if (beat.kind === "sotaStrand") {
      persist();
      runTalkStrand();
      return;
    }
    ensureBossTalkState();
    S.talkSpent[beat.id] = true;
    if (beat.onPlay === "hireAsked") {
      S.hireAsked = true;
      S.afterPayLifeDone = true;
    }
    if (beat.onPlay === "afterPay") S.afterPayLifeDone = true;
    persist();
    const line = bossLine(beat.key);
    const nightHome = isNight() && isHomeRoom(S.room);
    playLines(line ? [line] : [], () => {
      if (nightHome) sendToBed();
      else renderRoom();
    });
  }

  function hire() {
    if (!emilyHere()) return;
    if (!(S.hireAsked && !S.hiredHimari && !S.e3Accused && canHireHimari() && S.day >= 12 && S.day <= 24)) return;
    S.hiredHimari = true;
    S.talked = true;
    persist();
    const fork = S.paidDay != null ? "paid" : "unpaid";
    playLines([bossLine("boss.hire.accept." + fork + "." + himariBossBand())].filter(Boolean), renderRoom);
  }

  function accuse() {
    if (!emilyHere()) return;
    if (!(S.day === 24 && !S.hiredHimari && S.paidDay == null && !S.e3Accused)) return;
    S.e3Accused = true;
    S.talked = true;
    persist();
    const band = himariBossBand();
    playLines([
      bossLine("boss.end.e3.accuse.open"),
      bossLine("boss.end.e3.accuse.himari1." + band),
      bossLine("boss.end.e3.accuse.kaito2"),
      bossLine("boss.end.e3.accuse.himari2." + band)
    ].filter(Boolean), renderRoom);
  }

  function talkCallback(i, b3) {
    // T4 calls back to T2 (gyoza night), T7 to T6 (the guesthouse). Only if that strand actually played.
    const src = i === 3 ? 1 : i === 6 ? 5 : -1;
    if (src < 0 || !S.talkDone[src]) return null;
    return slBand("sota.talk.T" + (i + 1) + ".callback." + (S.talkListened[src] ? "kept" : "forgot"), b3);
  }

  function runTalkStrand() {
    const i = nextTalkStrand();
    if (i < 0) { renderRoom(); return; }
    const T = "sota.talk.T" + (i + 1);
    const w = moodWord();
    const b5 = band5();
    const b3 = band3();
    const kaitoOpens = w === "Cold" || w === "Gone"; // at Cold/Gone Kaito starts the conversation
    const afterSota = (S.sotaIdx | 0) >= 1 && !!slRaw(T + ".open.afterSota.warm");
    const afterGr = i === 6 && b3 === "warm" && (S.goRoundDone | 0) >= 1;
    const cb = talkCallback(i, b3);
    const open = [];
    if (afterSota) {
      if (kaitoOpens) open.push(sl(T + ".open.kaito"));
      open.push(slBand(T + ".open.afterSota", b3));
      if (cb) open.push(cb);
    } else if (kaitoOpens) {
      open.push(sl(T + ".open.kaito"), sl(T + ".open." + b5));
      if (cb) open.push(cb);
    } else {
      if (cb) open.push(cb);
      open.push(sl(T + ".open." + b5));
    }
    const ids = ["listen", "half", "miss"];
    const rot = i % 3; // rotate so "listen" isn't always the top option
    const order = ids.slice(rot).concat(ids.slice(0, rot));
    const opts = (c) => order.map((id) => ({ id, label: slText(T + "." + c + "." + id, id) }));
    playLines(open.filter(Boolean), () => {
      showChoices(promptOf(T + ".prompt1"), opts("c1"), (a) => {
        const mid = (afterGr && a.id === "listen" && sl(T + ".mid.listen.afterGoRound.warm")) || slBand(T + ".mid." + a.id, b3);
        playLines([mid].filter(Boolean), () => {
          showChoices(promptOf(T + ".prompt2"), opts("c2"), (b) => {
            const listened = b.id !== "miss";
            const end = (afterGr && listened && sl(T + ".end.listened.afterGoRound.warm")) || slBand(T + ".end." + (listened ? "listened" : "missed"), b3);
            playLines([end].filter(Boolean), () => {
              S.talked = true;
              S.lastTalkDay = S.day;
              S.talkLog = (S.talkLog || []).concat([S.day]);
              S.talkDone[i] = true;
              S.talkListened[i] = b.id === "listen"; // .kept / .forgot callbacks read this
              S.talkIdx = Object.keys(S.talkDone).length;
              markCared();
              bumpMood((MOOD_DELTA.talkC1[a.id] | 0) + (MOOD_DELTA.talkC2[b.id] | 0));
              persist();
              hud();
              renderRoom();
            });
          });
        });
      });
    });
  }


  function promote() {
    const nxt = nextJob();
    if (!nxt) return;
    if (S.int < nxt.minInt) {
      flash("**Need INT " + nxt.minInt + ".**");
      return;
    }
    S.jobIndex = (S.jobIndex || 0) + 1;
    persist();
    flash(L().promoted);
  }

  function millerPack() {
    if (S.day >= 6) return L().millerLate;
    if (S.day >= 4) return L().millerMid;
    return L().millerEarly;
  }

  function talkMiller() {
    if (!millerHere()) return;
    playLines(millerPack(), renderRoom);
  }

  function offer() {
    if (!emilyHere()) return;
    if (S.day >= 8) {
      flash(L().offerLate || "**Too late. That ship sailed.**");
      return;
    }
    if (isNight()) {
      flash(L().offerNight);
      return;
    }
    S.talked = true;
    if (S.paidDay) {
      flash(L().offerAlready);
      return;
    }
    if (S.money < dueNow()) {
      playLines([bossLine("boss.money.offer.short.kaito"), bossBandLine("boss.money.offer.short")].filter(Boolean), renderRoom);
      return;
    }
    S.money -= dueNow();
    S.paidDay = S.day;
    S.paidOnce = true;
    S.afterPayLifeDone = false;
    playLines([bossLine("boss.money.offer.ok.kaito"), bossBandLine("boss.money.offer.ok")].filter(Boolean), renderRoom);
  }

  function study() {
    if (isNight()) return;
    if (!canSpend(1)) { flash(kaitoLine(L().sleepWaitEnding) || "**Not yet. I've still got something to do today.**"); return; }
    startBar("study");
  }

  function eat() { /* removed Ã¢â‚¬â€ hunger system retired */ }

  function nap() {
    if (S.room !== "home_bed" || isNight() || S.slot >= 2) return;
    if (!canSpend(1)) { flash(kaitoLine(L().sleepWaitEnding) || "**Not yet. I've still got something to do today.**"); return; }
    spend(1);
    flash(kaitoLine(L().nap));
  }

  function wait() {
    if ((S.room !== "hub" && S.room !== "apt_block") || isNight()) return;
    if (!canSpend(1)) { flash(kaitoLine(L().sleepWaitEnding) || "**Not yet. I've still got something to do today.**"); return; }
    spend(1);
    flash(L().wait);
  }

  function datePack() {
    if (S.day <= 3) return L().dateEarly;
    if (S.day <= 5) return L().dateMid;
    return L().dateLate;
  }

  function date() {
    if (!emilyHere()) return;
    if (isNight()) { flash("**Too late for a date.**"); return; }
    if (dateOnCooldown()) { flash(slText("dateCooldown", "**She just went out with you. Give it a few days.**", true)); return; }
    if (slotsLeft() < 2) { flash("**Not enough day left.**"); return; }
    if (dateWouldSkipPeek()) {
      flash(kaitoLine(L().dateWaitPeek) || "**Not now. I need to be around later.**");
      return;
    }
    startDateFlow();
  }

  function dateMoodBand() {
    if (moodWarmBand()) return "warm";
    const w = moodWord();
    if (w === "Cold" || w === "Gone") return "rough"; // SOTA WIRE: no debtDistant bleed into the date
    return "cool";
  }
  function dateFace() {
    const b = dateMoodBand();
    return b === "warm" ? "soft" : b === "rough" ? "tight" : "talk";
  }
  function dateLine(key) {
    traceKey(key);
    const v = L()[key];
    if (v == null) return [{ who: "**", text: String(key) }];
    if (typeof v === "string") return [{ who: "**", text: v }];
    if (Array.isArray(v)) return v;
    return [v];
  }
  function dateLabel(key) {
    traceKey(key);
    const v = L()[key];
    if (typeof v === "string") return v;
    if (Array.isArray(v) && v[0]) return v[0].text || String(v[0]);
    if (v && v.text) return v.text;
    return String(key);
  }
  const DATE_STR_HIGH = 5;
  const DATE_STR_MID = 3;

  function startDateFlow() {
    if (slotsLeft() < 2 && S.slot > 1) {
      flash("**Not enough day left.**");
      return;
    }
    S._dateScore = 0;
    S._dateChatUpDone = false;
    S.room = "cafe";
    renderRoom();
    const band = dateMoodBand();
    let key = band === "warm" ? "date.opener.warm" : band === "rough" ? "date.opener.rough" : "date.opener.cool";
    if (band === "warm" && weekOneDebt() && L()["date.opener.week1Debt"]) key = "date.opener.week1Debt";
    playLines(dateLine(key), datePick1);
  }

  function datePick1() {
    showChoices({ who: "**", text: dateLabel("date.pick1.prompt") }, [
      { id: "river", label: dateLabel("date.pick1.walkRiver"), score: 1 },
      { id: "cafe", label: dateLabel("date.pick1.cafeTable"), score: 2, cost: 12 },
      { id: "bar", label: dateLabel("date.pick1.barBooth"), score: 2, cost: 20 }
    ], dateAfterPick1);
  }

  function dateAfterPick1(opt) {
    // SOTA WIRE 2026-10-09: the stuck door (datePick2) only happens at the cafe / bar. River walk skips it;
    // can't-afford also skips it (no venue, no door, no pick1 score).
    if (opt && opt.cost && S.money < opt.cost) {
      playLines(dateLine("date.broke.cantCover"), datePick3);
      return;
    }
    if (opt && opt.cost) S.money -= opt.cost;
    S._dateScore = (S._dateScore || 0) + ((opt && opt.score) || 0);
    if (opt && opt.id === "river") { datePick3(); return; }
    datePick2();
  }

  function datePick2() {
    showChoices({ who: "**", text: dateLabel("date.pick2.prompt") }, [
      { id: "snap", label: dateLabel("date.door.snap"), kind: "snap" },
      { id: "yank", label: dateLabel("date.door.yank"), kind: "yank" },
      { id: "shoulder", label: dateLabel("date.door.shoulder"), kind: "shoulder" }
    ], dateAfterDoor);
  }

  function dateAfterDoor(opt) {
    const str = S.str || 0;
    const kind = opt && opt.kind;
    let ok = false;
    let score = 0;
    if (kind === "snap") { ok = str >= DATE_STR_HIGH; score = ok ? 2 : 0; }
    else if (kind === "yank") { ok = str >= DATE_STR_MID; score = ok ? 1 : 0; }
    else { ok = false; score = -1; }
    if (!ok) {
      const failKey = moodWarmBand() ? "date.door.fail.warm" : "date.door.fail.cold";
      playLines(dateLine(failKey), () => {
        S._dateScore = (S._dateScore || 0) + score;
        datePick3();
      });
      return;
    }
    S._dateScore = (S._dateScore || 0) + score;
    datePick3();
  }

  function datePick3() {
    const band = dateMoodBand();
    showChoices({ who: "Himari", face: dateFace(), text: dateLabel("date.smallTalk." + band) }, [
      { id: "long", label: dateLabel("date.reply.longWeek"), score: 2 },
      { id: "pick", label: dateLabel("date.reply.youPick"), score: 1 },
      { id: "tired", label: dateLabel("date.reply.youLookTired"), score: 0 }
    ], dateAfterPick3);
  }

  function dateAfterPick3(opt) {
    S._dateScore = (S._dateScore || 0) + ((opt && opt.score) || 0);
    datePick4();
  }

  function datePick4() {
    showChoices({ who: "**", text: dateLabel("date.pick4.prompt") }, [
      { id: "long", label: dateLabel("date.pick4.longWay"), score: 1 },
      { id: "kiss", label: dateLabel("date.pick4.kissCorner"), score: 2 },
      { id: "drink", label: dateLabel("date.pick4.oneMoreDrink"), score: 1, cost: 8 }
    ], dateAfterPick4);
  }

  function dateAfterPick4(opt) {
    if (opt && opt.cost && S.money < opt.cost) {
      playLines(dateLine("date.broke.cantCover"), dateChatUp);
      return;
    }
    if (opt && opt.cost) S.money -= opt.cost;
    S._dateScore = (S._dateScore || 0) + ((opt && opt.score) || 0);
    dateChatUp();
  }

  function dateChatUp() {
    if (S._dateChatUpDone) { finishDate(); return; }
    S._dateChatUpDone = true;
    const band = dateMoodBand();
    playLines(
      dateLine("date.chatUp.narration").concat(dateLine("date.chatUp.guy")).concat(dateLine("date.chatUp.himari." + band)),
      dateChatUpChoices
    );
  }

  function dateChatUpChoices() {
    showChoices({ who: "Stranger", text: dateLabel("date.chatUp.guy") }, [
      { id: "shut", label: dateLabel("date.opt.shutDown") },
      { id: "punch", label: dateLabel("date.opt.punch") },
      { id: "walk", label: dateLabel("date.opt.walkAway") }
    ], dateChatUpResolve);
  }

  function datePunchResolve() {
    const win = (S.str || 0) >= DATE_STR_HIGH;
    const band = dateMoodBand();
    const key = win ? ("date.after.punchWin." + band) : ("date.after.punchLose." + band);
    playLines(dateLine(key), () => {
      if (win) finishDate();
      else dateKoThenFinish();
    });
  }

  function dateKoThenFinish() {
    const band = dateMoodBand();
    playLines(dateLine("date.ko.narration").concat(dateLine("date.ko." + band)), finishDate);
  }

  function dateChatUpResolve(opt) {
    const band = dateMoodBand();
    const id = opt && opt.id;
    if (id === "punch") {
      datePunchResolve();
      return;
    }
    if (id === "shut") {
      playLines(dateLine("date.after.shut." + band), () => {
        if (band === "rough") datePunchResolve();
        else finishDate();
      });
      return;
    }
    playLines(dateLine("date.after.walk." + band), () => {
      if (band === "rough") datePunchResolve();
      else finishDate();
    });
  }

  function finishDate() {
    const sc = S._dateScore || 0;
    let tier = "meh";
    if (sc >= 7) tier = "amazing";
    else if (sc >= 4) tier = "nice";
    const lines = dateLine(tier === "amazing" ? "dateAmazing" : tier === "nice" ? "dateNice" : "dateMeh");
    playLines(lines, () => {
      S.datedToday = true;
      S.lastDateDay = S.day;
      S.talked = true;
      markCared();
      bumpMood(tier === "amazing" ? MOOD_DELTA.dateAmazing : tier === "nice" ? MOOD_DELTA.dateNice : MOOD_DELTA.dateMeh);
      spend(2);
      persist();
      hud();
      if (tier === "amazing") {
        S.room = "home_bed";
        renderRoom();
        startBfSex(true);
        return;
      }
      S.room = "home_living";
      renderRoom();
    });
  }

  function train() {
    // M-BATCH 2026-10-06 (#10): bar minigame like work/study; 1 slot; replayable (no trainedToday gate).
    if (S.room !== "gym_hall" || isNight()) return;
    if (!canSpend(1)) { flash(kaitoLine(L().sleepWaitEnding) || "**Not yet. I've still got something to do today.**"); return; }
    startBar("gym");
  }

  function work() {
    if (isNight() || slotsLeft() < 2 || S.workedToday) return;
    if (!canSpend(2)) { flash(kaitoLine(L().sleepWaitEnding) || "**Not yet. I've still got something to do today.**"); return; }
    startBar("work");
  }

  function startBar(mode) {
    mode = mode === "study" ? "study" : (mode === "gym" ? "gym" : "work");
    // gym reuses work_* scripts (Greg lock); study has its own study_* set
    const prefix = mode === "study" ? "study_" : "work_";
    if (EDI()) EDI().play(prefix + "bar");
    const layer = $("bar-layer");
    const title = layer ? layer.querySelector(".bar-card .who") : null;
    if (title) title.textContent = ({ work: "SHIFT", study: "STUDY", gym: "GYM" })[mode];
    layer.classList.add("on");
    const fill = $("bar-fill");
    let dir = 1;
    let pos = 0;
    const tick = () => {
      pos += dir * 1.15;
      if (pos >= 100) { pos = 100; dir = -1; }
      if (pos <= 0) { pos = 0; dir = 1; }
      fill.style.left = pos + "%";
      barRaf = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(barRaf);
      $("bar-hit").onclick = null;
      document.removeEventListener("keydown", onKey);
      const p = pos;
      let zone = "grey";
      if (p >= 42 && p <= 62) zone = "green";
      if (p >= 50 && p <= 54) zone = "blue";
      const slots = mode === "work" ? 2 : 1;
      if (!canSpend(slots)) {
        layer.classList.remove("on");
        if (EDI()) EDI().idle();
        flash(kaitoLine(L().sleepWaitEnding) || "**Not yet. I've still got something to do today.**");
        return;
      }
      layer.classList.remove("on");
      const hitName = prefix + "hit_" + zone;
      if (EDI()) {
        EDI().play(hitName);
        setTimeout(() => { if (EDI() && !peek) EDI().idle(); }, 1400);
      }
      if (window.LG_AUDIO) window.LG_AUDIO.playStat();
      const gain = { grey: 1, green: 2, blue: 3 }[zone] || 1;
      if (mode === "study") {
        S.int += gain;
        spend(1);
        const done = (L().studyDone && L().studyDone[zone]) || "";
        flash(`INT +${gain} \u2192 ${S.int} (${zone}). ${done}`);
      } else if (mode === "gym") {
        S.str = (S.str || 3) + gain;
        spend(1);
        const done = Lpath("gym.done." + zone); // TODO(Dialogue): empty until written
        flash(`STR +${gain} \u2192 ${S.str} (${zone}).${done ? " " + done : ""}`);
      } else {
        const pay = job()[zone];
        S.money += pay;
        S.workedToday = true;
        spend(2);
        flash(`+\u00A3${pay} (${zone}). ${L().workDone[zone]}`);
      }
    };
    const onKey = (e) => { if (e.code === "Space") { e.preventDefault(); stop(); } };
    $("bar-hit").onclick = stop;
    document.addEventListener("keydown", onKey);
    barRaf = requestAnimationFrame(tick);
  }

  function mediaUrl(setId, n) {
    const root = S.mediaRoot.endsWith("/") ? S.mediaRoot : S.mediaRoot + "/";
    return root + `${setId}_${n}.mp4`;
  }

  function ediClipName(setId, n) {
    return setId + "_" + n;
  }

  function playPeekScript() {
    if (!EDI() || !peek || !peek.set || peek.set.stub) return;
    const v = $("peek-vid");
    const ms = v && v.currentTime ? Math.floor(v.currentTime * 1000) : 0;
    if (peek.stages && peek.stages[peek.clip]) {
      const stage = peek.stages[peek.clip];
      const name = ediBasename(stage.funscript || stage.file);
      if (!name) return;
      EDI().play(name, ms);
      return;
    }
    EDI().play(ediClipName(peek.set.id, peek.clip + 1), ms);
  }

  function peekLastClip() {
    if (!peek) return 0;
    if (peek.clipSeq && peek.clipSeq.length) return peek.clipSeq[peek.clipSeq.length - 1];
    if (peek.stages && peek.stages.length) return peek.stages.length - 1;
    return peek.rail.length - 1;
  }

  function startPeek(kind, opts) {
    opts = opts || {};
    kind = kind || spyKind();
    const nightlyReturn = !!opts.nightlyReturn;
    const gallery = !!opts.gallery || nightlyReturn;
    const homeSex = !!opts.homeSex;
    if (!kind && !opts.set) return;
    if (!gallery && !homeSex && kind && S.sceneDone[kind]) return;
    const set = opts.set || D().SETS[kind];
    const encRail = (kind === "gr1" || kind === "gr2") && !gallery && S.goRoundChoice && S.goRoundChoice[S.day] === "encourage"
      ? window.LG_RAILS[kind + "_enc"] : null; // gr1/gr2 .encouraged lines = he encouraged tonight
    const rail = opts.rail || encRail || window.LG_RAILS[kind];
    if (!set || !rail) return;
    let clip = 0;
    if (!gallery && !homeSex && S.peekResume && S.peekResume.kind === kind) clip = S.peekResume.clip || 0;
    const clipSeq = opts.clipSeq || null;
    if (clipSeq && clipSeq.length) clip = clipSeq[0];
    peek = {
      kind,
      set,
      rail,
      clip,
      line: 0,
      width: (gallery || homeSex) ? 3 : 1,
      gallery,
      homeSex,
      clipSeq,
      careGood: !!opts.careGood,
      stages: opts.stages || null,
      nightlyReturn
    };
    hideBox();
    closePhone();
    $("peek-layer").classList.add("on");
    $("peek-door").style.setProperty("--crack", (gallery || homeSex) ? "100%" : "18%");
    $("peek-more").disabled = gallery || homeSex;
    $("peek-more").style.display = (gallery || homeSex) ? "none" : "";
    $("peek-leave").disabled = false;
    loadPeekClip();
    showPeekLine();
  }

  function loadPeekClip() {
    const v = $("peek-vid");
    const miss = $("peek-miss");
    if (peek.set.stub) {
      v.style.display = "none";
      miss.style.display = "flex";
      $("peek-miss-path").textContent = peek.set.id + " (stub - no file yet)";
      return;
    }
    let src;
    if (peek.stages && peek.stages[peek.clip]) {
      const stage = peek.stages[peek.clip];
      src = mediaRootPath() + (stage.file || "");
    } else {
      src = mediaUrl(peek.set.id, peek.clip + 1);
    }
    $("peek-miss-path").textContent = src;
    v.style.display = "block";
    miss.style.display = "none";
    v.src = src;
    v.loop = true;
    v.onerror = () => {
      miss.style.display = "flex";
    };
    v.onloadeddata = () => {
      miss.style.display = "none";
      v.style.display = "block";
    };
    v.onplay = playPeekScript;
    v.onseeked = () => {
      if (v.currentTime < 0.2) playPeekScript();
    };
    v.muted = true;
    v.play().catch(() => {});
    playPeekScript();
    const map = D().CLIP_SFX && D().CLIP_SFX[peek.kind];
    if (window.LG_AUDIO) window.LG_AUDIO.playClip(map && map[peek.clip]);
  }

  function showPeekLine() {
    const lines = peek.rail[peek.clip];
    const line = lines[peek.line];
    traceKey("rail:" + (peek.rail === window.LG_RAILS[peek.kind] ? peek.kind : peek.kind + (peek.rail === window.LG_RAILS[peek.kind + "_enc"] ? "_enc" : peek.rail === window.LG_RAILS.bf1Bad ? "Bad" : "?")) + ":" + peek.clip + ":" + peek.line);
    $("peek-who").textContent = line.sfx ? "SFX" : (line.who === "**" ? "" : line.who || "");
    const box = $("peek-line");
    if (line.who === "**" || /^\*\*/.test(line.text)) {
      box.innerHTML = `<em>${line.text.replace(/\*\*/g, "")}</em>`;
    } else if (line.sfx) {
      box.innerHTML = `<span class="sfx">${line.text}</span>`;
    } else box.textContent = line.text;
    const last = peek.clip >= peekLastClip() && peek.line >= lines.length - 1;
    const more = peek.clip < peekLastClip() || peek.line < lines.length - 1;
    const btn = $("peek-next");
    if (peek.nightlyReturn && last) {
      btn.textContent = "Done";
      btn.style.display = "inline-block";
    } else if (peek.gallery && last) {
      btn.textContent = "Restart";
      btn.style.display = "inline-block";
    } else {
      btn.textContent = "Continue";
      btn.style.display = more ? "inline-block" : "none";
    }
    if (last && !peek.gallery) unlockGallery(peek.kind);
  }

  function peekAdvance() {
    if (!peek) return;
    const lines = peek.rail[peek.clip];
    const last = peek.clip >= peekLastClip() && peek.line >= lines.length - 1;
    if (peek.nightlyReturn && last) {
      finishPeek(true);
      return;
    }
    if (peek.gallery && last) {
      peek.clip = (peek.clipSeq && peek.clipSeq[0]) || 0;
      peek.line = 0;
      loadPeekClip();
      showPeekLine();
      return;
    }
    peek.line += 1;
    if (peek.line >= lines.length) {
      if (peek.clip >= peekLastClip()) {
        peek.line = lines.length - 1;
        showPeekLine();
        return;
      }
      if (peek.clipSeq && peek.clipSeq.length) {
        const i = peek.clipSeq.indexOf(peek.clip);
        peek.clip = peek.clipSeq[Math.min(i + 1, peek.clipSeq.length - 1)];
      } else {
        peek.clip += 1;
      }
      peek.line = 0;
      loadPeekClip();
    }
    showPeekLine();
  }

  function widenPeek() {
    if (!peek) return;
    peek.width = Math.min(3, peek.width + 1);
    const w = peek.width === 1 ? "18%" : peek.width === 2 ? "42%" : "100%";
    $("peek-door").style.setProperty("--crack", w);
    if (peek.width >= 3) $("peek-more").disabled = true;
  }

  function finishPeek(watchedEnd) {
    if (!peek) return;
    const kind = peek.kind;
    const gallery = peek.gallery;
    const peekNightlyReturn = !!peek.nightlyReturn;
    const peekCare = !!peek.careGood;
    const back = peek.homeSex ? "home_bed" : (peek.set.from || S.room);
    if (!gallery && !peek.homeSex) S.emilyOutTonight = true;
    if (!gallery) {
      if (watchedEnd) {
        if (kind !== "bf1") S.sceneDone[kind] = true;
        S.peekResume = null;
        S.needCuddle = true;
        unlockGallery(kind);
        S.peekWatched = S.peekWatched || {};
        S.peekWatched[kind] = true;
        if (kind === "d3") { S.debtCutPending = true; S.seedTakumi = true; }
        if (kind === "d5") { S.seedNightly = true; }
        if (kind === "b4" || kind === "b5") { /* continuation */ }
        if (kind === "other") S.watchedPayNight = true;
        if (S.paidOnce && S.watchedPayNight) S.roster = true;
        if (isRivalSexKind(kind)) markSexNight();
        if (String(kind).indexOf("sota") === 0) {
          const q = sotaQueue();
          const want = q.indexOf(kind);
          if (want >= 0 && (S.sotaIdx || 0) === want) {
            S.sotaIdx = want + 1;
            S.realPeeks = (S.realPeeks || 0) + 1;
          }
          clearNightSotaPeek();
        }
        if (kind === "gr1" || kind === "gr2") {
          S.goRoundTonight = null;
        }
        if (kind === "good" || kind === "ntr" || kind === "nts") {
          S.endingPlayed = kind;
        }
        if (isBossPeekKind(kind)) S.bossPeekTonight = true;
        if (isSotaPeekKind(kind)) {
          S.sotaPeekTonight = true;
          S.sotaPeekSkippedTonight = false;
        }
        if (kind === "bf1") {
          bumpHorn(-2);
          bumpMood(MOOD_DELTA.sex);
          markCared();
          S.talked = true;
          S.datedToday = true;
        }
      } else if (String(kind).indexOf("sota") === 0) {
        skipSotaPeek(kind);
        clearNightSotaPeek();
      } else if (kind === "gr1" || kind === "gr2") {
        if (!(S.sceneDone && S.sceneDone[kind])) S.sceneDone[kind] = true;
        S.goRoundTonight = null;
      } else if (!peek.homeSex) {
        S.peekResume = { kind, clip: peek.clip };
      }
    }
    const v = $("peek-vid");
    v.pause();
    v.removeAttribute("src");
    peek = null;
    $("peek-layer").classList.remove("on");
    $("peek-more").style.display = "";
    const nightlyReturn = !!peekNightlyReturn;
    if (EDI()) EDI().idle();
    if (window.LG_AUDIO) window.LG_AUDIO.stopClip();
    if (!gallery) S.room = back;
    if (nightlyReturn) {
      nightlyTab = "videos";
      nightlyView = "feed";
      nightlyWho = null;
      renderRoom();
      const layer = $("phone-layer");
      if (layer) layer.classList.add("on");
      phoneShow("nightly");
      paintNightly();
      return;
    }
    if (!gallery && kind === "bf1" && watchedEnd) {
      let b = S.sexAskBand || band5();
      if (b === "gone") b = "cold"; // sex.after.gone is cut; Gone never reaches bf1 via the ask
      S.sexAskBand = null;
      renderRoom();
      playLines([sl("sota.sex.after." + b)].filter(Boolean), renderRoom);
      return;
    }
    if (!gallery && watchedEnd && /^(sota[123]|gr[12])$/.test(kind)) {
      renderRoom();
      playLines([sl("sota." + kind + ".after")].filter(Boolean), renderRoom);
      return;
    }
    if (!gallery && watchedEnd && (kind === "good" || kind === "ntr" || kind === "nts")) {
      const pos = kind === "good" || peekCare || moodWarmBand();
      const b = pos ? "warm" : "rough";
      const E = "sota.end." + kind + ".after.";
      const after = [sl(E + "1." + b), sl(E + "2." + b), sl(E + "3." + b)];
      if (kind === "ntr") after.push(sl("sota.end.ntr.leave"));
      renderRoom();
      playLines(after.filter(Boolean), () => {
        if (kind === "ntr") S.ntrLeft = true; // living room -> bg_apartment_ntr.jpg from now on
        if (kind === "nts") S.ntsSmsDay = S.day; // epilogue text lands on a later night
        persist();
        renderRoom();
      });
      return;
    }
    renderRoom();
  }

  function leavePeek() {
    const watchedEnd = peek && peek.clip >= peekLastClip();
    finishPeek(watchedEnd);
  }

  function doSleep(fromPeekEnd) {
    ensureBossTalkState();
    if (isNightOutDay() && !S.nightOutResolved) {
      // She went out without Kaito ever seeing the ask: same Path A/B rule, counted as a skipped peek.
      S.nightOutResolved = true;
      S.nightOutAskMood = S.mood == null ? 70 : S.mood;
      const doPeek = nightOutGoesPathA();
      S.nightOutPath = doPeek ? "a" : "b";
      S.nightOutLastPath = S.nightOutPath;
      S.nightOutDay = S.day;
      if (doPeek) S.pathANightCount = (S.pathANightCount | 0) + 1;
      S.emilyOutTonight = true;
      S.nightPeekTonight = !!doPeek;
      bumpMood(MOOD_DELTA.goOut);
      S.moodDrainedTonight = true;
      if (doPeek) {
        const q = sotaQueue();
        skipSotaPeek(q[S.sotaIdx || 0]);
      }
    }
    deliverNtsEpilogue(true);
    if (S.moodDrainedTonight) {
      if (S.lastSexDay !== S.day && !S.caredToday) bumpHorn(1);
    } else if (!S.caredToday) {
      bumpMood(MOOD_DELTA.neglect);
      if (S.lastSexDay !== S.day) bumpHorn(1);
    }
    if (S.day === 4 && S.debtCutPending) {
      // DESKTOP HOTFIX 2026-10-05: D4 morning pack never played (e.g. never entered the living room by day) - still halve the debt once, silently.
      S.due = Math.floor(dueNow() / 2);
      S.debtCutPending = false;
      S.debtCut = true;
    }
    S.giftedToday = false;
    S.caredToday = false;
    S.moodDrainedTonight = false;
    S.nightPeekTonight = false;
    S.nightOutResolved = false;
    S.trainedToday = false;
    S.smsReply = null; // M-BATCH #6: unanswered night-out text expires with the day (history kept)
    missArmedHunts();
    if (S.day >= weekLen()) {
      openRewind();
      persist();
      return;
    }
    S.day += 1;
    S.slot = 0;
    S.ate = false;
    S.hungryTomorrow = false;
    S.emilyOutTonight = false;
    S.talked = false;
    S.datedToday = false;
    S.introDay = false;
    S.heardVoices = false;
    S.seenGone = false;
    S.workedToday = false;
    S.needCuddle = false;
    S.missHintShown = false;
    S.sleepSkipWarned = false;
    S.room = "home_bed";
    S.bossPeekLastNight = !!S.bossPeekTonight;
    S.sotaPeekLastNight = !!S.sotaPeekTonight;
    S.bossPeekTonight = false;
    S.sotaPeekTonight = false;
    S.residueHomeSeen = false;
    S.sotaPeekSkippedLastNight = !!S.sotaPeekSkippedTonight;
    S.sotaPeekSkippedTonight = false;
    if (S.followedMika && S.nightlyRouteStarted) armNextHunt();
    armRobertEndings();
    // Queue Path A after-peek SMS for when phone shell ships. Do not auto-open.
    if (S.nightOutPath === "a") {
      S.smsAfterPeekMorningPending = false;
    }
    persist();
    renderRoom();
    const grLast = S.goRoundChoice && S.goRoundChoice[S.day - 1];
    if ((S.nightOutPath === "a" && S.nightOutDay === S.day - 1) || grLast === "agree" || grLast === "encourage") {
      flash(slText("sota.alone.neverCameHome", "", true));
    }
  }

  function sleep() {
    if (S.room !== "home_bed") return;
    if (isNight() && tiedShowUpReady()) { // M-BATCH #4: bedroom at night after Mika's invite = the meet
      startRobertEnding("tied");
      return;
    }
    const sota = sotaPeekKind();
    if (sota) {
      if (!S.sleepSkipWarned) {
        S.sleepSkipWarned = true;
        persist();
        flash(kaitoLine(L().sleepSota) || "**If I sleep now I won't go look.**");
        return;
      }
      // Confirmed sleep-through-live-peek: mark skip, then fall through so Path A
      // never-home (and cuddle cancel) still run  -  same as leave-hall then Sleep.
      skipSotaPeek(sota);
      clearNightSotaPeek();
    }
    if (S.day === 25) {
      const end = d25EndingKind();
      if (end && !(S.sceneDone && S.sceneDone[end]) && S.slot < peekSlotIndex(end)) {
        flash(kaitoLine(L().sleepWaitEnding) || "**Not yet. I've still got something to do today.**");
        return;
      }
    }
    const kind = spyKind();
    if (!isNight() && kind && !S.sceneDone[kind]) {
      if (!S.sleepSkipWarned) {
        S.sleepSkipWarned = true;
        persist();
        flash(kaitoLine(L().sleepImportant) || "**I shouldn't sleep yet. The day's not finished.**");
        return;
      }
      markPeekMissed(kind);
    }
    if (isNight() && kind && !S.sceneDone[kind]) {
      markPeekMissed(kind);
    }
    const grTonight = S.goRoundChoice && (S.goRoundChoice[S.day] === "agree" || S.goRoundChoice[S.day] === "encourage");
    if ((pathAOut() && (isNight() || S.emilyOutTonight)) || grTonight) {
      S.needCuddle = false;
      const alone = sl(anySotaWatched() || grTonight ? "sota.alone.sleep.knows" : "sota.alone.sleep.clean");
      playLines([alone || { who: "**", text: "**She said she was staying at a friend's. I'm sleeping alone.**" }], () => doSleep(false));
      return;
    }
    if (S.needCuddle && isHomeRoom(emilyRoom() || "")) { // she's home tonight (she sits in the living room at night)
      S.needCuddle = false;
      playLines([cuddleLine()].filter(Boolean), () => doSleep(false));
      return;
    }
    doSleep(false);
  }

  function openRewind() {
    showScreen("rewind");
    $("rewind-body").textContent = S.hiredHimari
      ? (L().rewindHired || L().rewindPaid)
      : (S.paidDay || S.paidOnce) ? L().rewindPaid : L().rewindUnpaid;
    $("rewind-ask").textContent = L().rewindAsk;
    $("rewind-yes").onclick = rewind;
    $("rewind-no").onclick = () => toast("The week is already over. Rewind is the only door.");
  }

  function rewind() {
    const carry = metaCarry();
    carry.loop = S.loop + 1;
    S = newWeek(carry);
    showScreen("play");
    playLines([{
      who: "**",
      text: `**Monday again. INT ${S.int}. Pocket \u00A3${S.money}.**`
    }], renderRoom);
  }

  function startNew() {
    S = newWeek({ loop: 1, int: 0, money: D().START_CASH, mediaRoot: (S && S.mediaRoot) || DEFAULT_MEDIA });
    showScreen("play");
    S.room = "home_bed";
    if (EDI()) EDI().idle();
    if (window.LG_AUDIO) window.LG_AUDIO.startAmbient();
    renderRoom();
  }

  function continueSave() {
    const raw = localStorage.getItem(SAVE);
    if (!raw) { startNew(); return; }
    S = JSON.parse(raw);
    ensureGallery();
    if (S.due == null) S.due = D().DEBT;
    if (S.jobIndex == null) S.jobIndex = 0;
    if (!S.autoSeen) S.autoSeen = {};
    ensureSotaState();
    showScreen("play");
    if (EDI()) EDI().idle();
    if (window.LG_AUDIO) window.LG_AUDIO.startAmbient();
    renderRoom();
  }

  function paintMute() {
    const b = $("btn-edi-mute");
    if (!b || !EDI()) return;
    const off = EDI().isMuted();
    b.textContent = off ? "SCRIPT OFF" : "SCRIPT ON";
    b.classList.toggle("off", off);
  }

  function bind() {
    $("btn-new").onclick = startNew;
    $("btn-continue").onclick = continueSave;
    $("btn-continue").disabled = !localStorage.getItem(SAVE);
    $("btn-settings").onclick = () => {
      $("media-root").value = (S && S.mediaRoot) || DEFAULT_MEDIA;
      if ($("edi-url") && EDI()) $("edi-url").value = EDI().url();
      $("settings").classList.add("on");
    };
    $("btn-settings-2").onclick = $("btn-settings").onclick;
    $("set-save").onclick = () => {
      if (!S) S = newWeek({ loop: 1 });
      S.mediaRoot = $("media-root").value.trim() || DEFAULT_MEDIA;
      if ($("edi-url") && EDI()) EDI().setUrl($("edi-url").value.trim() || EDI().DEFAULT_URL);
      persist();
      $("settings").classList.remove("on");
      toast("Media root saved.");
    };
    $("set-cancel").onclick = () => $("settings").classList.remove("on");
    $("btn-title").onclick = () => showScreen("title");
    if ($("btn-full")) {
      $("btn-full").onclick = () => {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
        else document.exitFullscreen().catch(() => {});
      };
    }
    $("peek-next").onclick = peekAdvance;
    $("peek-more").onclick = widenPeek;
    $("peek-leave").onclick = leavePeek;
    if ($("phone-close")) $("phone-close").onclick = closePhone;
    if ($("phone-back")) $("phone-back").onclick = () => {
      if (phoneApp === "nightly" && nightlyView === "player") {
        leaveNightlyPlayer(); return;
      }

      if (phoneApp === "gallery" && galleryView !== "routes") {
        galleryView = "routes"; paintGallery(); return;
      }
      if (phoneApp === "messages" && smsView === "thread") {
        paintMessagesList(); return; // M-BATCH #6: back keeps pending replies in state
      }
      phoneShow("home");
      paintHome();
    };
    if ($("hud-phone")) $("hud-phone").onclick = () => openPhone();
    if ($("sprite")) $("sprite").onclick = openMenu;
    if ($("btn-edi-mute")) {
      $("btn-edi-mute").onclick = () => {
        if (!EDI()) return;
        EDI().setMuted(!EDI().isMuted());
        paintMute();
      };
      paintMute();
    }
    if ($("btn-sound-mute") && window.LG_AUDIO) {
      const paintSound = () => {
        const off = window.LG_AUDIO.isMuted();
        $("btn-sound-mute").textContent = off ? "SOUND OFF" : "SOUND ON";
        $("btn-sound-mute").classList.toggle("off", off);
      };
      $("btn-sound-mute").onclick = () => {
        window.LG_AUDIO.toggle();
        paintSound();
      };
      paintSound();
    }
    document.body.addEventListener("pointerdown", function once() {
      if (window.LG_AUDIO) window.LG_AUDIO.startAmbient();
      document.body.removeEventListener("pointerdown", once);
    });
  }

  document.addEventListener("DOMContentLoaded", bind);
})();
