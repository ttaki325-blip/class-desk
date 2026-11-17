/* 우리반 바탕화면 앱판 — 화면 (GAS판 index.html 의 스크립트). 만든 사람 김맨 https://kimman.kr · CC BY-SA 4.0 */
  var APPURL = (window.GS && GS.appUrl) || "";
  var D = null, CODE = "", TPW = "", SYNC = null, NEWF = false, MODE = "milk", EDIT = null, DTAB = "today", TD = null, TIMEOUT = null;
  var $ = function (id) { return document.getElementById(id); };
  var REDUCE = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }
  CODE = ls("classdesk-code") || "";
  try { TPW = sessionStorage.getItem("classdesk-tpw") || ""; } catch (e) {}
  // 선생님 서랍 창(팝업)인지: 바탕화면에서 [선생님]을 누르면 따로 열린다. 아이들이 보는 칠판에는 서랍이 뜨지 않는다
  var TWIN = /[?&]teacher\b/.test(location.search), TW = null, TOP = window.TEACHER_OPENER || null;
  if (TWIN && TOP) { try { TPW = TOP.TPW || TPW; CODE = TOP.CODE || CODE; } catch (e) {} }

  // ── 선 아이콘 (이모지 대신) ──
  var IC = {
    spark: '<path d="M12 3l1.9 5.2L19 10l-5.1 1.8L12 17l-1.9-5.2L5 10l5.1-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
    book: '<path d="M3 5.5C5 4.5 8 4.4 12 6c4-1.6 7-1.5 9-.5V19c-2-1-5-1.1-9 .5-4-1.6-7-1.5-9-.5z"/><path d="M12 6v13.5"/>',
    print: '<path d="M7 9V3.5h10V9"/><rect x="3.5" y="9" width="17" height="8.5" rx="2"/><path d="M7 14h10v6.5H7z"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
    unlock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 7.6-1.7"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17"/>',
    thermo: '<path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z"/><path d="M12 9v7"/>',
    timer: '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 10v3.5l2.3 1.6M9.5 2.8h5"/>',
    dice: '<rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="9" cy="9" r="1.2" fill="currentColor"/><circle cx="15" cy="15" r="1.2" fill="currentColor"/><circle cx="15" cy="9" r="1.2" fill="currentColor"/><circle cx="9" cy="15" r="1.2" fill="currentColor"/>',
    list: '<rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><path d="M8 12.3l2.8 2.8L16.5 9"/>',
    chat: '<path d="M4 5.5h16v10H9l-4 3.5v-3.5H4z"/><path d="M8 9.5h8M8 12.5h5"/>',
    mail: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3.5 7l8.5 6 8.5-6"/>',
    milk: '<path d="M8 3h8v3l2 3v12H6V9l2-3z"/><path d="M6 9h12M10 13.5c1.2-1 2.8-1 4 0"/>',
    done: '<circle cx="12" cy="12" r="9"/><path d="M8 12.4l2.7 2.7L16.3 9.5"/>',
    role: '<path d="M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.4 7.2 17.9l.9-5.4-3.9-3.8 5.4-.8z"/>',
    hand: '<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11M11 10V4a1.5 1.5 0 0 1 3 0v7M14 10.5V6a1.5 1.5 0 0 1 3 0v8c0 4-2.5 7-6.5 7-3 0-4.5-1.8-6-4.5L3 13.5a1.5 1.5 0 0 1 2.5-1.6L8 15"/>',
    meal: '<path d="M3.5 11.5h17a8.5 8.5 0 0 1-17 0z"/><path d="M8.5 8c0-1.3 1-1.7 1-3M12 8c0-1.3 1-1.7 1-3M15.5 8c0-1.3 1-1.7 1-3"/><path d="M9 20.5h6"/>',
    shield: '<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6z"/><path d="M8.8 12.2l2.2 2.2 4.4-4.6"/>',
    key: '<circle cx="8" cy="15" r="4.5"/><path d="M11.2 11.8L20 3M16.5 6.5l2.5 2.5M14 9l2 2"/>',
    up: '<path d="M6 15l6-6 6 6"/>', down: '<path d="M6 9l6 6 6-6"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>', sound: '<path d="M4 9.5h4L13 5v14l-5-4.5H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
    mute: '<path d="M4 9.5h4L13 5v14l-5-4.5H4z"/><path d="M17 9.5l4.5 5M21.5 9.5l-4.5 5"/>',
    sheet: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M4 10h16M10 4v16"/>',
    play: '<path d="M7 4.5v15l12-7.5z"/>', pause: '<path d="M8 5v14M16 5v14"/>', music: '<path d="M9 18V6l11-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>', note: '<path d="M5 3.5h10l4 4v13H5z"/><path d="M9 12h6M9 16h4"/>', grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2.5 12h3M18.5 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    game: '<path d="M7 8h10a4.5 4.5 0 0 1 4.3 5.8l-1 3.4a2.4 2.4 0 0 1-4 1L14 16h-4l-2.3 2.2a2.4 2.4 0 0 1-4-1l-1-3.4A4.5 4.5 0 0 1 7 8z"/><path d="M8 11v3M6.5 12.5h3"/><circle cx="15.5" cy="12" r=".9" fill="currentColor"/><circle cx="17.3" cy="13.6" r=".9" fill="currentColor"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/>',
    pin: '<path d="M8 3h8l-1.5 6.5L19 14H5l4.5-4.5z"/><path d="M12 14v7"/>',
    shuffle: '<path d="M3 7h3.5c2.5 0 4 1.3 5.5 5s3 5 5.5 5H21M3 17h3.5c1.4 0 2.5-.4 3.4-1.3M14.1 8.3c.9-.9 2-1.3 3.4-1.3H21"/><path d="M18.5 4.5L21 7l-2.5 2.5M18.5 14.5L21 17l-2.5 2.5"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><circle cx="17" cy="9" r="2.6"/><path d="M17 14.5c2.4.2 4 1.8 4.5 4.5"/>',
    ladder: '<path d="M6 3v18M18 3v18M6 7h12M6 12h12M6 17h12"/>',
    wheel: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4"/>',
    back: '<path d="M15 5l-7 7 7 7"/>', heart: '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>',
    seat: '<rect x="4" y="5" width="16" height="9" rx="2.5"/><path d="M7 14v6M17 14v6M4 9.5h16"/>',
    order: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 5l1.5-1v5M3.5 13.5c.5-1 2.5-1 2.5.4 0 1-2.5 2.1-2.5 3.1H6M3.5 21h0"/>',
    crown: '<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/>', save: '<path d="M5 3.5h11l3.5 3.5v13.5H5z"/><path d="M8 3.5v5h7v-5M8 20.5v-6h8v6"/>',
    cake: '<path d="M4 20.5h16v-6.5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2z"/><path d="M4 16c2.7 1.6 5.3 1.6 8 0s5.3-1.6 8 0M12 12V8.5"/><path d="M12 4.2c.9.9.9 2.2 0 2.8-.9-.6-.9-1.9 0-2.8z"/>',
    dicei: '<rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="8.5" cy="8.5" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.3" fill="currentColor"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20.5h7M10 17h4"/>',
    map: '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
  };
  function ico(n) { return '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">' + (IC[n] || "") + "</svg>"; }
  function paintIcons(root) { (root || document).querySelectorAll("[data-i]").forEach(function (el) { if (!el.firstChild || !el.querySelector("svg")) el.insertAdjacentHTML("afterbegin", ico(el.dataset.i)); }); }
  paintIcons();

  // ── 작은 도구 ──
  function pad(n) { return String(n).padStart(2, "0"); }
  function hm(d) { return pad(d.getHours()) + ":" + pad(d.getMinutes()); }
  function esc(x) { return String(x == null ? "" : x).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function nowStamp() { var d = new Date(); return D.today + " " + hm(d); }
  function toMin(t) { var p = String(t).split(":"); return Number(p[0]) * 60 + Number(p[1] || 0); }
  var SUBC = { "국어": "#c9636d", "도덕": "#bd7440", "수학": "#2e77c8", "사회": "#b3831f", "과학": "#35915a", "음악": "#7566c0", "미술": "#e0884f",
    "실과": "#2b968f", "체육": "#3f8fd8", "영어": "#d0609e", "창체": "#8a6fd1" };
  var PAL = ["#2e77c8", "#c9636d", "#b3831f", "#35915a", "#bd7440", "#5a7390", "#7566c0", "#2b968f"];
  function subColor(s) { if (SUBC[s]) return SUBC[s]; var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 997; return PAL[h % PAL.length]; }

  // ── 효과 ──
  document.addEventListener("pointerdown", function (e) {
    var b = e.target.closest(".btn,.chip,.ptab,.nb,.pill,.tile,.light,.ck,.vl,.sbtn,.die-box"); if (!b || REDUCE || b.disabled || EDIT) return;
    var r = b.getBoundingClientRect(), s = Math.max(r.width, r.height), sp = document.createElement("span");
    sp.className = "rp"; sp.style.cssText = "width:" + s + "px;height:" + s + "px;left:" + (e.clientX - r.left - s / 2) + "px;top:" + (e.clientY - r.top - s / 2) + "px";
    b.appendChild(sp); setTimeout(function () { sp.remove(); }, 650);
    burst(e.clientX, e.clientY, b.classList.contains("nb") ? 12 : 8);
  });
  // 누른 자리에서 작은 꽃 · 별 · 하트가 톡 터진다
  function burst(x, y, n) {
    if (REDUCE) return;
    var start = !PARTS.length; if (start) { FX.width = innerWidth; FX.height = innerHeight; }
    var kinds = ["star", "flower", "heart", "flower", "star", "dot"], cols = ["#f6a5b4", "#fbbf24", "#a78bfa", "#7dd3fc", "#86efac", "#fda4af", "#fdba74"];
    for (var i = 0; i < n; i++) {
      var a = Math.PI * 2 * i / n + Math.random() * .6, sp = 2.4 + Math.random() * 3;
      PARTS.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1.4, r: Math.random() * 6, s: 5 + Math.random() * 6, c: cols[Math.floor(Math.random() * cols.length)], life: 0, max: 44, k: kinds[i % kinds.length], g: .09 });
    }
    if (start) requestAnimationFrame(step);
  }
  function shape(p) {
    var s = p.s; CTX.beginPath();
    if (p.k === "star") { for (var i = 0; i < 10; i++) { var rr = i % 2 ? s * .45 : s, a = i * Math.PI / 5 - Math.PI / 2; CTX.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } CTX.closePath(); CTX.fill(); }
    else if (p.k === "heart") { CTX.moveTo(0, s * .45); CTX.bezierCurveTo(-s * 1.1, -s * .3, -s * .5, -s * 1.1, 0, -s * .35); CTX.bezierCurveTo(s * .5, -s * 1.1, s * 1.1, -s * .3, 0, s * .45); CTX.fill(); }
    else if (p.k === "flower") { for (var j = 0; j < 5; j++) { var b = j * Math.PI * 2 / 5; CTX.beginPath(); CTX.arc(Math.cos(b) * s * .55, Math.sin(b) * s * .55, s * .45, 0, 6.3); CTX.fill(); } CTX.fillStyle = "#fff6c8"; CTX.beginPath(); CTX.arc(0, 0, s * .32, 0, 6.3); CTX.fill(); }
    else { CTX.arc(0, 0, s * .4, 0, 6.3); CTX.fill(); }
  }
  var FX = $("fx"), CTX = FX.getContext("2d"), PARTS = [];
  function confetti(x, y, n, cols) {
    if (REDUCE) return;
    var start = !PARTS.length; FX.width = innerWidth; FX.height = innerHeight;
    cols = cols || ["#7566c0", "#c9636d", "#e0884f", "#35915a", "#2e77c8", "#e0b341"];
    for (var i = 0; i < n; i++) PARTS.push({ x: x, y: y, vx: (Math.random() - .5) * 12, vy: -Math.random() * 12 - 4, r: Math.random() * 6, w: 6 + Math.random() * 6, h: 9 + Math.random() * 7, c: cols[i % cols.length], life: 0 });
    if (start) requestAnimationFrame(step);
  }
  function step() {
    CTX.clearRect(0, 0, FX.width, FX.height);
    PARTS = PARTS.filter(function (p) { return p.life < (p.max || 140) && p.y < FX.height + 20; });
    PARTS.forEach(function (p) { p.life++; p.vy += p.g || .3; p.vx *= .98; p.x += p.vx; p.y += p.vy; p.r += .12;
      CTX.save(); CTX.translate(p.x, p.y); CTX.globalAlpha = Math.max(0, 1 - p.life / (p.max || 140)); CTX.fillStyle = p.c;
      if (p.k) { CTX.rotate(p.r * .25); var sc = 1 - p.life / p.max * .4; CTX.scale(sc, sc); shape(p); }
      else { CTX.rotate(p.r); CTX.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r))); }
      CTX.restore(); });
    if (PARTS.length) requestAnimationFrame(step); else CTX.clearRect(0, 0, FX.width, FX.height);
  }
  function center(el) { var r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }
  function party(text) {
    $("partyTxt").textContent = text; var p = $("party"); p.classList.remove("on"); void p.offsetWidth; p.classList.add("on");
    confetti(innerWidth / 2, innerHeight * .4, 160); setTimeout(function () { confetti(innerWidth * .25, innerHeight * .5, 60); confetti(innerWidth * .75, innerHeight * .5, 60); }, 350);
    clearTimeout(p._h); p._h = setTimeout(function () { p.classList.remove("on"); }, 2700);
    if (D && D.settings["타이머 소리"] !== "아니오") chime([523, 659, 784, 1047]);
  }
  // 소리: 한 오디오 판 + 압축기로 크게 (교실 뒤까지 들리게)
  var SNDC = null;
  function sndOut() {
    if (!SNDC) { var a = new (window.AudioContext || window.webkitAudioContext)(), cp = a.createDynamicsCompressor(), mg = a.createGain(); cp.threshold.value = -18; cp.knee.value = 10; cp.ratio.value = 6; mg.gain.value = 1.6; cp.connect(mg); mg.connect(a.destination); SNDC = { a: a, out: cp }; }
    if (SNDC.a.state === "suspended") SNDC.a.resume();
    return SNDC;
  }
  function chime(freqs, loud) {
    try { var S = sndOut(), a = S.a, peak = loud ? .95 : .5; (freqs || [659, 784, 988, 1319]).forEach(function (f, i) {
      [["triangle", 1], ["sine", 2]].forEach(function (w) {
        var o = a.createOscillator(), g = a.createGain(), t = a.currentTime + i * (loud ? .26 : .2); o.type = w[0]; o.frequency.value = f * w[1]; o.connect(g); g.connect(S.out);
        var pk = w[1] === 1 ? peak : peak * .3; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(pk, t + .015); g.gain.exponentialRampToValueAtTime(.0001, t + (loud ? 1.1 : .7)); o.start(t); o.stop(t + (loud ? 1.15 : .75)); }); }); } catch (e) {}
  }
  // 말로 알려 주기 (한국어 목소리, 가장 크게)
  function say(text) {
    try {
      var ss = window.speechSynthesis; if (!ss) return; ss.cancel();
      var u = new SpeechSynthesisUtterance(text); u.lang = "ko-KR"; u.volume = 1; u.rate = .95; u.pitch = 1.05;
      var v = ss.getVoices().filter(function (x) { return /^ko/i.test(x.lang); }); if (v.length) u.voice = v.filter(function (x) { return /Google|Heami|SunHi|Yuna/i.test(x.name); })[0] || v[0];
      ss.speak(u);
    } catch (e) {}
  }
  try { if (window.speechSynthesis) speechSynthesis.getVoices(); } catch (e) {}

  // ── 저장 중 표시: 1초쯤 빙글빙글 → 시트에 적히면 체크 → 스르륵 (화면을 막지 않는다) ──
  var FL = null, FLT = null, BHIDE = null;
  function busy(msg, sub) {
    clearInterval(FL); FLT = null; clearTimeout(BHIDE); var b = $("busy");
    b.classList.remove("ok", "bad", "out", "quick"); $("busyMsg").className = "dots"; $("busyMsg").textContent = msg; $("busySub").textContent = sub || "";
    b.classList.add("on");
  }
  function busyEnd(ok, msg, sub) {
    var b = $("busy"); b.classList.add(ok ? "ok" : "bad"); $("busyMsg").className = ""; $("busyMsg").textContent = msg; $("busySub").textContent = sub || "";
    clearTimeout(BHIDE); BHIDE = setTimeout(function () { b.classList.add("out"); b.classList.remove("on"); }, ok ? 380 : 1800);
  }
  function flash(msg) {
    var b = $("busy"), me = { t0: Date.now(), saved: false };
    FLT = me; clearInterval(FL); clearTimeout(BHIDE);
    b.classList.remove("ok", "bad", "out"); b.classList.add("on", "quick");
    $("busyMsg").className = "dots"; $("busyMsg").textContent = msg || "저장하는 중"; $("busySub").textContent = "시트에 쓰는 중이에요";
    FL = setInterval(function () {
      if (FLT !== me) { clearInterval(FL); return; }
      var t = Date.now() - me.t0;
      if ((me.saved && t >= 450) || t >= 1100) {
        clearInterval(FL);
        busyEnd(true, me.saved ? "시트에 저장했어요" : "바로 반영했어요", me.saved ? "화면과 시트 모두 반영됐어요" : "시트에는 뒤에서 차례로 저장하는 중");
      }
    }, 80);
    return me;
  }

  // ── 주방(Code.gs)과 주고받기: 화면은 바로, 시트는 줄을 세워 뒤에서 ──
  var Q = [], RUN = 0, VER = 0, SAVED = "", SYNC_OFF = false;
  function busyNow() { return RUN || Q.length > 0; }
  function call(fn, args, ok, quiet, noCode) {
    var v = VER;
    var r = google.script.run
      .withSuccessHandler(function (res) { SYNC_OFF = false; if (res && res.settings && !busyNow() && v === VER) { D = res; draw(); cacheSave(); } ok && ok(res); syncState(); })
      .withFailureHandler(function (e) { if (!/비밀번호|잠금 코드/.test((e && e.message) || "")) { SYNC_OFF = true; syncState(); } fail(e, quiet); });
    r[fn].apply(r, noCode ? (args || []) : [CODE].concat(args || []));
  }
  function write(fn, args, o) {
    if (!D) return;
    VER++; o.mut && o.mut(D); draw(); cacheSave();
    var fl = o.big ? flash(o.busy) : null;
    if (o.msg || o.undo) setTimeout(function () { toast(o.msg || "반영했어요", o.undo); }, fl ? 500 : 0);
    if (o.fx) setTimeout(o.fx, 200);
    Q.push({ fn: fn, args: args, o: o, fl: fl }); pump();
  }
  function pump() {
    while (Q.length) (function (job) {
      RUN++;
      var r = google.script.run
        .withSuccessHandler(function (res) { RUN--; if (job.fl) job.fl.saved = true; job.o.after && job.o.after(res); if (!RUN && !Q.length) { SAVED = hm(new Date()); scheduleSync(); } syncState(); })
        .withFailureHandler(function (e) { RUN--; SAVING = {}; syncState(); fail(e); VER++; if (!RUN) call("getAll", [], function () { syncState(); }, true); });
      r[job.fn].apply(r, [CODE].concat(job.args || []));
    })(Q.shift());
    syncState();
  }
  function scheduleSync() { clearTimeout(SYNC); SYNC = setTimeout(function () { if (!busyNow()) call("sync", [], function () { syncState(); }, true); }, 1500); }
  function fail(e, quiet) {
    var m = (e && e.message) || String(e);
    if (/화면 잠금 코드/.test(m)) { $("busy").classList.remove("on"); openModal("lock"); setTimeout(function () { $("codeIn").focus(); }, 60); return; }
    if (/선생님 비밀번호/.test(m)) { teacherOff(); toast("선생님 비밀번호가 맞지 않아요"); return; }
    var b = $("busy");
    if (b.classList.contains("on") && !FLT) { busyEnd(false, "불러오지 못했어요", m.slice(0, 60)); return; }
    if (!quiet) toast(/[요다]\.?$/.test(m) ? m : "시트에 저장하지 못했어요: " + m);
  }
  function syncState() {
    var n = Q.length + RUN;
    var off = SYNC_OFF || window.NET_OFF, p = $("syncPill");
    p.classList.toggle("busy", n > 0 && !off); p.classList.toggle("off", !!off);
    $("syncTxt").textContent = p.title = off ? "시트와 연결이 끊겼어요" + (n > 0 ? " · 저장할 것 " + n + "개를 모아 두었어요" : "") : n > 0 ? "시트에 저장하는 중 · " + n : "시트에 저장됨 " + (SAVED || hm(new Date()));
  }
  function cacheSave() { if (CODE || (D && D.settings["화면 잠금 코드"])) return; ls("classdesk-cache", JSON.stringify(D)); }
  function load(first) {
    if (first && !D) busy("우리반 바탕화면을 여는 중", "시트에서 우리반 기록을 가져오고 있어요");
    call("getAll", [], function () {
      syncState();
      if (first && TWIN) { $("busy").classList.remove("on"); twinStart(); return; }
      if (first) { if ($("busy").classList.contains("on") && !FLT) busyEnd(true, "좋은 하루예요!", D.settings["학급 닉네임"] || ""); call("getWeather", [], showWeather, true); tmResume(); }
    });
  }
  $("codeGo").onclick = function () { CODE = $("codeIn").value.trim(); ls("classdesk-code", CODE); ls("classdesk-cache", null); closeModal("lock"); load(true); };
  $("codeIn").addEventListener("keydown", function (e) { if (e.key === "Enter") $("codeGo").click(); });

  function toast(m, undo, label, ms) {
    var t = $("toast"), u = $("toastUndo");
    $("toastMsg").textContent = m; u.hidden = !undo; u.textContent = label || "되돌리기"; u.onclick = function () { t.classList.remove("on"); undo(); };
    t.classList.add("on"); clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove("on"); }, ms || (undo ? 5000 : 2600));
  }
  function openModal(id) { $(id).classList.add("on"); }
  function closeModal(id) { $(id).classList.remove("on"); if (id === "tlock") { TGO = ""; $("tlock").classList.remove("over-lock"); } }
  document.addEventListener("click", function (e) { var c = e.target.closest("[data-close]"); if (c) closeModal(c.dataset.close); });

  // ── 시계 · 날짜 · 배경 (1초마다) ──
  var PALETTE = { morning: ["#ffe1d1", "#fff1c4", "#d5eeff", "#fff8f2"], day: ["#cfe6ff", "#e2dbff", "#d2f3e6", "#f5f8ff"], after: ["#ffd6e2", "#e1d6ff", "#ffe2c8", "#fff4f7"], night: ["#c9c5f0", "#b9d5f0", "#dccbf0", "#eef0fb"] };
  function drawAnalogBase() {
    var s = '<defs><radialGradient id="cf" cx="45%" cy="38%"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#f3efff"/></radialGradient></defs>' +
      '<circle cx="100" cy="100" r="94" fill="#fff" stroke="#e7e1fb" stroke-width="6"/><circle cx="100" cy="100" r="86" fill="url(#cf)"/>';
    var cols = ["#c9636d", "#e0884f", "#b3831f", "#35915a", "#2b968f", "#2e77c8", "#7566c0", "#d0609e", "#c9636d", "#e0884f", "#35915a", "#2e77c8"];
    for (var i = 1; i <= 12; i++) {
      var a = i * Math.PI / 6, x = 100 + Math.sin(a) * 67, y = 100 - Math.cos(a) * 67, big = i % 3 === 0;
      s += '<text x="' + x.toFixed(1) + '" y="' + (y + (big ? 11 : 9)).toFixed(1) + '" text-anchor="middle" font-family="Jua, sans-serif" font-size="' + (big ? 32 : 25) + '" fill="' + cols[i - 1] + '">' + i + "</text>";
    }
    for (var m = 0; m < 60; m++) if (m % 5) { var b = m * Math.PI / 30; s += '<circle cx="' + (100 + Math.sin(b) * 87).toFixed(1) + '" cy="' + (100 - Math.cos(b) * 87).toFixed(1) + '" r="1.1" fill="#d6d0ee"/>'; }
    s += '<g class="hand" id="hH"><line x1="100" y1="104" x2="100" y2="58" stroke="#46336e" stroke-width="8" stroke-linecap="round"/></g>' +
      '<g class="hand" id="hM"><line x1="100" y1="106" x2="100" y2="34" stroke="#7566c0" stroke-width="5.5" stroke-linecap="round"/></g>' +
      '<g class="hand" id="hS"><line x1="100" y1="112" x2="100" y2="28" stroke="#c9636d" stroke-width="2.4" stroke-linecap="round"/><circle cx="100" cy="28" r="5" fill="#f6a5b4"/></g>' +
      '<circle cx="100" cy="100" r="7" fill="#46336e"/><circle cx="100" cy="100" r="3" fill="#fff"/>';
    $("analog").innerHTML = s;
  }
  drawAnalogBase();
  $("analogB").innerHTML = $("analog").innerHTML.replace(/id="(hH|hM|hS|cf)"/g, 'id="$1B"').replace("url(#cf)", "url(#cfB)");
  var LASTS = -1;
  function tickClock() {
    var d = new Date(), h = d.getHours(), m = d.getMinutes(), s = d.getSeconds();
    $("hh").textContent = pad(h % 12 || 12); $("mm").textContent = pad(m); $("ap").textContent = h < 12 ? "오전" : "오후";
    $("dateTxt").textContent = (d.getMonth() + 1) + "월 " + d.getDate() + "일 " + "일월화수목금토"[d.getDay()] + "요일";
    $("today").textContent = d.getFullYear() + "년 " + (d.getMonth() + 1) + "월 " + d.getDate() + "일 " + "일월화수목금토"[d.getDay()] + "요일";
    var turnS = s === 0 && LASTS === 59; LASTS = s;
    var rot = function (el, deg, noAnim) { if (noAnim) { el.style.transition = "none"; el.style.transform = "rotate(" + deg + "deg)"; void el.offsetWidth; el.style.transition = ""; } else el.style.transform = "rotate(" + deg + "deg)"; };
    ["", "B"].forEach(function (x) { rot($("hS" + x), s * 6, turnS); rot($("hM" + x), m * 6 + s * .1, s === 0 && m === 0); rot($("hH" + x), (h % 12) * 30 + m * .5, false); });
    if ($("bigClock").classList.contains("on")) { $("bH").textContent = pad(h % 12 || 12); $("bM").textContent = pad(m); $("bAp").textContent = h < 12 ? "오전" : "오후"; $("bDate").textContent = $("today").textContent; }
    var p = PALETTE[h < 9 ? "morning" : h < 13 ? "day" : h < 17 ? "after" : "night"], st = document.documentElement.style;
    st.setProperty("--a1", p[0]); st.setProperty("--a2", p[1]); st.setProperty("--a3", p[2]); st.setProperty("--base", p[3]);
    if (D && s === 0) { drawTT(); }
    if (D && s % 20 === 0) nowPeriod();
  }
  setInterval(tickClock, 1000);

  // 날씨 · 미세먼지 (환경부 기준: 미세먼지 30/80/150, 초미세먼지 15/35/75)
  var WX = null;
  var AIRG = [["좋음", "#1f5fa6", "#e3efff"], ["보통", "#24703f", "#e1f5e8"], ["나쁨", "#97561f", "#fdeedd"], ["매우 나쁨", "#a8283b", "#fde2e5"]];
  function airLv(v, cut) { return v == null ? -1 : v <= cut[0] ? 0 : v <= cut[1] ? 1 : v <= cut[2] ? 2 : 3; }
  function showWeather(w) {
    if (w) WX = w;
    w = WX;
    if (!w) { $("wx").innerHTML = '<p class="muted">날씨를 가져오지 못했어요. 잠시 뒤에 다시 해 볼게요.</p>'; return; }
    var a10 = airLv(w.pm10, [30, 80, 150]), a25 = airLv(w.pm25, [15, 35, 75]), worst = Math.max(a10, a25);
    var adv = worst < 0 ? "" : worst <= 1 ? (/비|눈|소나기|뇌우/.test(w.text) ? "우산 챙겨요 · 실내 활동 추천" : "바깥 활동 좋아요") : worst === 2 ? "실내 활동 추천 · 마스크 챙겨요" : "바깥 활동은 쉬어요";
    var box = function (lab, v, lv) { var g = AIRG[lv] || ["정보 없음", "#77748c", "#f1f0f6"]; return '<div style="--ab:' + g[2] + "; --ac:" + g[1] + '"><small>' + lab + "</small><b>" + g[0] + "</b> <small style='display:inline'>" + (v == null ? "" : v + "㎍") + "</small></div>"; };
    $("wPlace").textContent = String(w.place || "").split(" ").slice(-1)[0];
    $("wx").innerHTML = '<div class="wx-now">' + wIcon(w.text || "구름") + '<div class="wx-t jua num">' + (w.temp == null ? "-" : w.temp) + '<small>°</small></div><div class="wx-d"><b>' + esc(w.text || "") + "</b>" +
      (w.max != null ? "<span>최고 " + w.max + "° · 최저 " + w.min + "°" + (w.rain != null ? "<br>비 올 확률 " + w.rain + "%" : "") + "</span>" : "") + "</div></div>" +
      '<div class="advice" style="--ac:' + (AIRG[worst] || AIRG[1])[1] + '"><i></i>' + esc(adv) + "</div>" +
      '<div class="air">' + box("미세먼지", w.pm10, a10) + box("초미세먼지", w.pm25, a25) + "</div>";
    var hid = LAY.hidden.indexOf("weather") >= 0;
    $("wPill").hidden = !hid;
    if (hid) $("wPill").innerHTML = wIcon(w.text) + "<b>" + w.temp + "°</b><span style='color:var(--sub)'>" + esc(w.text) + (a10 >= 0 ? " · 미세먼지 " + AIRG[a10][0] : "") + "</span>"; fitTitle();
  }
  setInterval(function () { if (D && !document.hidden) call("getWeather", [], showWeather, true); }, 15 * 60 * 1000);
  function wIcon(t) {
    var sun = '<circle cx="12" cy="12" r="4.5" fill="#f5b941" stroke="#e0a020"/>' + [0, 45, 90, 135, 180, 225, 270, 315].map(function (a) { var r = a * Math.PI / 180; return '<line x1="' + (12 + Math.cos(r) * 7) + '" y1="' + (12 + Math.sin(r) * 7) + '" x2="' + (12 + Math.cos(r) * 9.5) + '" y2="' + (12 + Math.sin(r) * 9.5) + '" stroke="#e0a020" stroke-width="1.8" stroke-linecap="round"/>'; }).join("");
    var cloud = '<path d="M7 18h10a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.4 1.8A3.2 3.2 0 0 0 7 18z" fill="#fff" stroke="#9fb3cc" stroke-width="1.4"/>';
    var body = t === "맑음" ? sun : t === "구름" ? '<g transform="translate(-3,-3) scale(.75)">' + sun + "</g>" + cloud : /비|소나기|뇌우/.test(t) ? cloud + '<path d="M9 20l-1 2M13 20l-1 2M17 20l-1 2" stroke="#2e77c8" stroke-width="1.6" stroke-linecap="round"/>' : cloud;
    if (t === "눈") body = cloud + '<path d="M9 21h.01M13 21.5h.01M17 21h.01" stroke="#7aa7d8" stroke-width="2.4" stroke-linecap="round"/>';
    return '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' + body + "</svg>";
  }

  // ── 카드 배치 (선생님이 화면 꾸미기에서 바꾸고, 시트 '설정 > 배치'에 저장) ──
  // 기본은 9장만 보이게(복잡하지 않게). 발표 뽑기는 숨겨 두고 선생님이 꺼내 쓴다
  var DEF = { v: 2, order: ["clock", "tt", "weather", "thermo", "timer", "meal", "cal", "todo", "notice", "memo", "pick"],
    size: { clock: [4, 1], tt: [5, 1], weather: [3, 1], thermo: [3, 2], timer: [3, 1], meal: [3, 1], cal: [3, 1], todo: [3, 1], notice: [4, 1], memo: [3, 1], pick: [3, 1] }, hidden: ["pick"] };
  var NAMES = { clock: "시계", tt: "시간표", weather: "날씨 · 미세먼지", thermo: "학급 온도계", timer: "타이머", cal: "달력", pick: "발표 뽑기", todo: "오늘 할 일", notice: "알림장", memo: "선생님께 남겨요", meal: "오늘 급식" };
  var LAY = JSON.parse(JSON.stringify(DEF));
  function readLayout() {
    try { var l = JSON.parse(D.layout || "null"); if (l && l.order && l.v >= 2) { l.hidden = l.hidden || []; DEF.order.forEach(function (id) { if (l.order.indexOf(id) < 0) { l.order.push(id); if (DEF.hidden.indexOf(id) >= 0) l.hidden.push(id); } }); l.size = l.size || {}; DEF.order.forEach(function (id) { if (!l.size[id]) l.size[id] = DEF.size[id]; }); return l; } } catch (e) {}
    return JSON.parse(JSON.stringify(DEF));
  }
  // 카드를 순서대로 앉히고(빈 곳 먼저 채우기), 그래도 남는 빈칸은 옆 · 위 카드가 늘어나 메운다
  function pack(L, C) {
    var grid = [], items = {}, ids = L.order.filter(function (id) { return L.hidden.indexOf(id) < 0 && document.querySelector('.card[data-id="' + id + '"]'); });
    var at = function (r, c) { return grid[r] && grid[r][c]; };
    var free = function (r, c, w, h) { for (var i = r; i < r + h; i++) for (var j = c; j < c + w; j++) if (j >= C || at(i, j)) return false; return true; };
    var mark = function (id, r, c, w, h) { for (var i = r; i < r + h; i++) { grid[i] = grid[i] || []; for (var j = c; j < c + w; j++) grid[i][j] = id; } };
    ids.forEach(function (id) {
      var sz = L.size[id] || DEF.size[id], w = Math.min(C, C === 12 ? sz[0] : Math.max(2, Math.round(sz[0] / 2))), h = sz[1];
      for (var r = 0; r < 60; r++) for (var c = 0; c + w <= C; c++) if (free(r, c, w, h)) { mark(id, r, c, w, h); items[id] = { r: r, c: c, w: w, h: h }; return; }
    });
    var R = grid.length, area = function (id) { return items[id].w * items[id].h; };
    var colFree = function (it, c) { for (var i = it.r; i < it.r + it.h; i++) if (i >= R || at(i, c)) return false; return true; };
    var rowFree = function (it, r) { if (r >= R) return false; for (var j = it.c; j < it.c + it.w; j++) if (at(r, j)) return false; return true; };
    for (var loop = 0, changed = true; changed && loop < 300; loop++) {
      changed = false;
      for (var r = 0; r < R && !changed; r++) for (var c = 0; c < C && !changed; c++) {
        if (at(r, c)) continue;
        var cand = [], L1 = at(r, c - 1), R1 = at(r, c + 1), U = at(r - 1, c);
        if (L1 && colFree(items[L1], c)) cand.push([L1, "r"]);
        if (R1 && colFree(items[R1], c)) cand.push([R1, "l"]);
        if (U && rowFree(items[U], r)) cand.push([U, "d"]);
        if (!cand.length) continue;
        cand.sort(function (a, b) { return area(a[0]) - area(b[0]); });
        var id = cand[0][0], it = items[id];
        if (cand[0][1] === "r") { mark(id, it.r, c, 1, it.h); it.w++; }
        else if (cand[0][1] === "l") { mark(id, it.r, c, 1, it.h); it.c--; it.w++; }
        else { mark(id, r, it.c, it.w, 1); it.h++; }
        changed = true;
      }
    }
    return items;
  }
  function doLayout() {
    var L = EDIT || LAY, items = pack(L, innerWidth <= 1100 ? 6 : 12);
    L.order.forEach(function (id, i) {
      var c = document.querySelector('.card[data-id="' + id + '"]'); if (!c) return;
      var it = items[id];
      c.style.order = i; c.classList.toggle("hide", !it);
      if (it) { c.style.gridColumn = (it.c + 1) + " / span " + it.w; c.style.gridRow = (it.r + 1) + " / span " + it.h; }
    });
    fitRows();
  }
  // 카드가 자리를 옮기거나 크기가 바뀔 때 스르륵 미끄러지게 (FLIP)
  function applyLayout(anim) {
    if (!anim || REDUCE || !Element.prototype.animate) return doLayout();
    var before = new Map();
    document.querySelectorAll(".card:not(.hide)").forEach(function (c) { before.set(c, c.getBoundingClientRect()); });
    doLayout();
    document.querySelectorAll(".card:not(.hide)").forEach(function (c) {
      var a = before.get(c), b = c.getBoundingClientRect();
      if (!a) { c.animate([{ opacity: 0, transform: "scale(.92)" }, { opacity: 1, transform: "none" }], { duration: 380, easing: "cubic-bezier(.22,.61,.36,1)" }); return; }
      var dx = a.left - b.left, dy = a.top - b.top, sx = a.width / b.width, sy = a.height / b.height;
      if (Math.abs(dx) + Math.abs(dy) < 1 && Math.abs(sx - 1) < .01 && Math.abs(sy - 1) < .01) return;
      c.animate([{ transformOrigin: "top left", transform: "translate(" + dx + "px," + dy + "px) scale(" + sx + "," + sy + ")" }, { transformOrigin: "top left", transform: "none" }],
        { duration: 440, easing: "cubic-bezier(.22,.61,.36,1)" });
    });
  }
  function fitRows() {
    var g = $("grid");
    if (innerWidth <= 700) { g.style.removeProperty("--rowh"); return; }
    var rows = getComputedStyle(g).gridTemplateRows.split(" ").filter(Boolean).length || 3;
    var avail = innerHeight - $("grid").getBoundingClientRect().top - $("panel").offsetHeight - 12 - 24 - (rows - 1) * 14;
    document.documentElement.style.setProperty("--rowh", Math.max(150, Math.floor(avail / rows)) + "px");
  }
  addEventListener("resize", function () { clearTimeout(fitRows._t); fitRows._t = setTimeout(fitRows, 120); });

  // ── 그리기 ──
  function draw() {
    var s = D.settings;
    if (/^#[0-9a-fA-F]{6}$/.test(s["대표 색"] || "")) document.documentElement.style.setProperty("--main", s["대표 색"]);
    $("nick").textContent = s["학급 닉네임"] || "우리반";
    if (!EDIT) LAY = readLayout();
    document.body.classList.toggle("night", s["화면 테마"] === "별밤 네온");
    $("toolBtn").hidden = isOff("놀이 · 도구"); $("readBtn").hidden = isOff("독서 · 명상");
    drawBday(); drawDday(); drawNotice(); drawTT(); nowPeriod(); drawThermo(); drawTodos(); drawMemos(); drawPanel(); drawPick(); drawSound(); drawCal(); drawMonthNote();
    applyLayout(); tickClock(); if (WX) showWeather();
    if (MEAL.at !== D.today) mealLoad(true); else drawMeal();
    if (TD && $("drawer").classList.contains("on")) drawDrawer();
  }
  // 생일: 학생 탭 '생일' 칸이 오늘이면 머리띠에 알약 + 그날 처음 한 번 축하
  function drawBday() {
    var list = (D.birthday || []).map(function (no) { return label(student(no)); });
    $("bdayPill").hidden = !list.length;
    if (!list.length) return;
    $("bdayPill").innerHTML = ico("cake") + "오늘 생일 · <b>" + esc(list.join(", ")) + "</b>";
    var k = "classdesk-bday-" + D.today;
    if (!ls(k)) { ls(k, "1"); setTimeout(function () { party("생일 축하해요, " + list.join(", ") + "!"); }, 900); }
  }
  function upcoming() {
    var t = new Date(D.today + "T00:00:00");
    return (D.events || []).map(function (r) { return { n: r.t, k: r.k, date: r.d, d: Math.round((new Date(r.d + "T00:00:00") - t) / 86400000) }; })
      .filter(function (x) { return x.d >= 0 && x.n; }).sort(function (a, b) { return a.d - b.d; });
  }
  function drawDday() {
    var up = upcoming()[0];
    $("ddayPill").hidden = !up; if (up) $("ddayPill").innerHTML = ico("cal") + esc(up.n) + " <b>" + (up.d ? "D-" + up.d : "D-DAY") + "</b>";
    fitTitle();
  }
  // 달력: 이번 달 + 일정 점(종류별 색)
  var EVC = { "행사": "#2e77c8", "시험": "#c9636d", "휴일": "#35915a", "기타": "#7566c0" };
  function drawCal() {
    var t = new Date(D.today + "T00:00:00"), y = t.getFullYear(), m = t.getMonth(), first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate();
    var ev = {}; (D.events || []).forEach(function (e) { ev[e.d] = ev[e.d] || e; });
    $("calTitle").textContent = (m + 1) + "월 달력";
    var h = "일월화수목금토".split("").map(function (d) { return "<b>" + d + "</b>"; }).join(""), weeks = Math.ceil((first + days) / 7);
    for (var i = 0; i < weeks * 7; i++) {
      var dt = new Date(y, m, 1 + i - first), key = dt.getFullYear() + "-" + pad(dt.getMonth() + 1) + "-" + pad(dt.getDate()), e = ev[key], wd = dt.getDay();
      h += '<span class="' + (dt.getMonth() !== m ? "o " : "") + (wd === 0 ? "sun " : wd === 6 ? "sat " : "") + (key === D.today ? "today " : "") + (e ? "ev" : "") + '"' +
        (e ? ' style="--ec:' + (EVC[e.k] || "#c9636d") + '" title="' + esc(e.t) + '"' : "") + ">" + dt.getDate() + "</span>";
    }
    $("cal").innerHTML = h;
    $("cal").style.gridTemplateRows = "auto repeat(" + weeks + ",minmax(0,1fr))";
    var up = upcoming().slice(0, 1).map(function (x) { return esc(x.n) + "<em>" + (x.d ? "D-" + x.d : "오늘") + "</em>"; });
    $("nextEv").innerHTML = up.length ? "다음 일정 · " + up[0] : "";
  }
  function drawQuote() {
    var q = D.quote || { text: "오늘도 서로에게 고운 말을 해요", who: "우리반 다짐" };
    $("quote").querySelector("span").textContent = q.text; $("quoteWho").textContent = q.who ? "— " + q.who : "";
  }
  function periodNow() {
    var now = new Date(), m = now.getHours() * 60 + now.getMinutes(), cur = null, next = null;
    D.tt.periods.forEach(function (p) { var t = String(p.time).split("-"), a = toMin(t[0]), b = toMin(t[1] || t[0]);
      if (m >= a && m < b) cur = { p: p, a: a, b: b, m: m }; else if (!next && a > m) next = { p: p, a: a, m: m }; });
    return { cur: cur, next: next };
  }
  function drawTT() {
    var w = D.weekday, pn = periodNow(), mnow = new Date().getHours() * 60 + new Date().getMinutes();
    $("ttDay").textContent = w + "요일"; $("ttChanged").hidden = !D.tt.changed;
    var ps = D.tt.periods;
    if (w === "토" || w === "일") { $("blocks").innerHTML = '<div class="muted" style="align-self:center">오늘은 쉬는 날이에요</div>'; return; }
    $("blocks").innerHTML = ps.map(function (p) {
      var t = String(p.time).split("-"), a = toMin(t[0]), b = toMin(t[1] || t[0]), cls = (!p.subj ? "empty " : "") + (mnow >= b ? "past" : mnow >= a && p.subj ? "now" : "");
      var col = p.subj ? subColor(p.subj) : "#b8b5c8";
      return '<div class="blk ' + cls + '" style="--sc:' + col + '"><span class="p">' + p.n + '교시</span><span class="s jua">' + esc(p.subj || "비어 있음") + '</span><span class="tm num">' + esc(t[0]) + "</span>" +
        (/now/.test(cls) ? '<span class="bar" style="width:' + Math.round((mnow - a) / Math.max(1, b - a) * 100) + '%"></span>' : "") + "</div>";
    }).join("");
  }
  function nowPeriod() {
    if (!D) return;
    var pn = periodNow(), el = $("nowTxt");
    if (pn.cur && pn.cur.p.subj) { el.hidden = false; el.style.setProperty("--nc", subColor(pn.cur.p.subj)); el.querySelector("span").textContent = "지금은 " + pn.cur.p.n + "교시 " + pn.cur.p.subj; }
    else if (pn.next && pn.next.p.subj) { var gap = pn.next.a - pn.next.m; el.hidden = false; el.style.setProperty("--nc", subColor(pn.next.p.subj));
      el.querySelector("span").textContent = "다음은 " + pn.next.p.n + "교시 " + pn.next.p.subj + " · " + (gap < 60 ? gap + "분 뒤" : String(pn.next.p.time).split("-")[0] + " 시작"); }
    else el.hidden = true;
    var bn = $("bNow"); bn.hidden = el.hidden; bn.querySelector("span").textContent = el.querySelector("span").textContent; bn.style.setProperty("--nc", el.style.getPropertyValue("--nc"));
  }

  // 온도계
  var REASON = "";
  var THLAST = null;
  function drawThermo() {
    var T = D.thermo, pct = Math.max(0, Math.min(1, T.total / Math.max(1, T.goal))), RW = T.rewards || [];
    var nx = RW.filter(function (r) { return r.at > T.total; })[0];
    $("temp").innerHTML = T.total + "<small>도</small>";
    $("goal").textContent = nx ? "'" + nx.name + "'까지 " + (nx.at - T.total) + "도 남았어요" : RW.length ? "모든 보상 달성! 정말 멋져요" : "목표 " + T.goal + "도까지 " + Math.max(0, T.goal - T.total) + "도 남았어요";
    // 보상 단계: 받은 것 ✓ · 다음 것 강조
    $("trw").innerHTML = RW.map(function (r) { var st = T.total >= r.at ? "ok" : r === nx ? "next" : ""; return '<li class="' + st + '"><b class="num">' + r.at + "°</b><span>" + esc(r.name) + "</span>" + (st === "ok" ? ico("check") : "") + "</li>"; }).join("");
    var w = T.week, R = T.rules || {}, nm = Object.keys(D.marks.name || {}).length, nd = D.marks.nameDay || 0, au = [];
    if (R.noName) au.push('<span class="' + (nd ? "bad" : "good") + '">' + (nd ? "오늘 수업방해 " + nd + "번" + (nm ? " · 쉬는 시간 −" + nm + "분" : "") : "수업방해 0번 · " + esc(R.cut) + " +" + R.noName + "°") + "</span>");
    if (R.role && w) au.push('<span class="' + (w.days && w.pct >= w.need ? "good" : "") + '">이번 주 1인 1역 <b class="num">' + (w.days ? w.pct : 0) + "%</b>/" + w.need + "%</span>");
    $("tauto").innerHTML = au.join("");
    if (THLAST != null && !TWIN && T.total > THLAST) { var got = RW.filter(function (r) { return THLAST < r.at && T.total >= r.at; }); if (got.length) { var g = got[got.length - 1]; setTimeout(function () { party(g.at + "도 달성! 🎁 " + g.name); }, 700); } }
    THLAST = T.total;
    $("thGoalB").textContent = Math.round(pct * 100) + "%";
    var top = 22, bot = 230, y = bot - (bot - top) * pct, ticks = "";
    for (var i = 0; i <= 10; i++) { var ty = bot - (bot - top) * i / 10; ticks += '<line x1="58" x2="' + (i % 5 ? 64 : 70) + '" y1="' + ty + '" y2="' + ty + '" stroke="#d9b9bf" stroke-width="2" stroke-linecap="round"/>'; }
    $("tsvg").innerHTML = '<defs><linearGradient id="mg" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#f4a261"/><stop offset=".5" stop-color="#e76f7f"/><stop offset="1" stop-color="#c9364b"/></linearGradient></defs>' +
      '<rect x="30" y="12" width="24" height="232" rx="12" fill="#fff" stroke="#f0d3d8" stroke-width="3"/>' + ticks +
      '<rect id="merc" x="35" y="' + y + '" width="14" height="' + (bot + 16 - y) + '" rx="7" fill="url(#mg)" style="transition:all 1s cubic-bezier(.22,.61,.36,1)"/>' +
      '<circle cx="42" cy="262" r="28" fill="url(#mg)" stroke="#fff" stroke-width="4"/><circle cx="34" cy="254" r="7" fill="rgba(255,255,255,.5)"/>' +
      RW.map(function (r) { var ry = bot - (bot - top) * Math.min(1, r.at / Math.max(1, T.goal)), ok = T.total >= r.at; return '<g><line x1="12" x2="30" y1="' + ry + '" y2="' + ry + '" stroke="' + (ok ? "#e0b341" : "#d9b9bf") + '" stroke-width="3" stroke-linecap="round"/><circle cx="10" cy="' + ry + '" r="6" fill="' + (ok ? "#e0b341" : "#fff") + '" stroke="' + (ok ? "#c99a22" : "#d9b9bf") + '" stroke-width="2"/></g>'; }).join("");
    $("reasons").innerHTML = D.praise.map(function (r) { return '<button class="chip' + (r === REASON ? " on" : "") + '" data-rs="' + esc(r) + '">' + esc(r) + "</button>"; }).join("");
    $("tlog").innerHTML = T.recent.slice(0, 2).map(function (r) { return '<li><b class="' + (r.d >= 0 ? "pl" : "mi") + '">' + (r.d > 0 ? "+" : "") + r.d + "</b><span>" + esc(r.why || "") + "</span></li>"; }).join("");
  }

  function drawTodos() {
    var list = D.todos;
    $("todoLeft").textContent = list.filter(function (t) { return t["완료"] !== "예"; }).length + "개 남음";
    $("todos").innerHTML = list.map(function (t) {
      var done = t["완료"] === "예";
      return '<li class="todo' + (done ? " done" : "") + '"><button class="ck" data-tg="' + esc(t["번호"]) + '" aria-label="완료 표시">' + ico("check") + '</button><span class="tx">' + esc(t["할 일"]) + "</span>" +
        '<button class="x tonly" data-td="' + esc(t["번호"]) + '" aria-label="지우기">×</button></li>';
    }).join("") || '<li class="muted">오늘 할 일이 없어요</li>';
  }
  function drawMemos() {
    var td = D.memos.filter(function (m) { return String(m["시각"]).slice(0, 10) === D.today; }).length;
    $("memoCard").classList.toggle("has", td > 0); $("memoNew").hidden = !td; $("memoNew").textContent = "오늘 " + td + "개";
    $("memos").innerHTML = D.memos.map(function (m) {
      return '<li class="memo"><span class="who">' + esc(m["누가"] || "누군가") + "</span><span>" + esc(m["내용"]) + '</span><span class="tm num">' + esc(String(m["시각"]).slice(11)) +
        ' <button class="x tonly" data-md="' + esc(m["번호"]) + '" aria-label="지우기">×</button></span></li>';
    }).join("") || '<li class="muted">선생님이 안 계실 때 여기에 남겨요</li>';
  }

  // ── 아래 번호판 ──
  var MODES = [
    { id: "milk", name: "우유 다 먹었어요", ic: "milk", c: "#2e77c8" }, { id: "done", name: "다 했어요", ic: "done", c: "#35915a" },
    { id: "role", name: "1인 1역", ic: "role", c: "#b3831f" }, { id: "talk", name: "발표", ic: "hand", c: "#7566c0" },
    { id: "name", name: "수업방해", ic: "x", c: "#c9364b" },
    { id: "acct", name: "내 계정", ic: "key", c: "#2b968f" } ];
  // 이름 보이기: 번호와 이름 / 이름과 번호 / 번호만 / 이름만
  var NAMEOPT = ["번호와 이름", "이름과 번호", "번호만", "이름만"];
  function showMode() { var v = D && D.settings["이름 보이기"]; return v === "번호만" ? "no" : v === "이름만" ? "name" : v === "이름과 번호" ? "nb" : "both"; }
  function nameBig(s) { var m = showMode(); return (m === "name" || m === "nb") && s && s.name; }
  function label(s) { var m = showMode(); return m === "no" || !s.name ? s.no + "번" : m === "name" ? s.name : m === "nb" ? s.name + " " + s.no + "번" : s.no + "번 " + s.name; }
  function numHTML(s) {
    var m = showMode();
    if (nameBig(s)) return '<span class="nm nmbig jua" style="margin-top:0; font-size:min(52cqh,32cqw)">' + esc(s.name) + "</span>" + (m === "nb" ? '<span class="n2 jua num">' + s.no + "</span>" : "");
    if (m === "both" && s.name) return '<span class="n2 jua num">' + s.no + '</span><span class="nm nmbig jua">' + esc(s.name) + "</span>";
    return '<span class="n jua num">' + s.no + "</span>";
  }
  function drawPanel() {
    var modes = MODES.filter(function (m) { return (m.id !== "acct" || D.settings["계정 확인"] !== "아니오") && !isOff(m.name); });
    $("panel").hidden = !modes.length; if (!modes.length) return;
    if (!modes.some(function (m) { return m.id === MODE; })) MODE = modes[0].id;   // 고른 탭을 껐으면 남은 첫 탭으로
    var M = modes.filter(function (m) { return m.id === MODE; })[0], mk = D.marks, n = D.students.length;
    $("panel").style.setProperty("--pc", M.c);
    var TWD = "일월화수목금토".charAt(new Date(D.today + "T12:00:00").getDay());
    var dueToday = function (s) { return !s.days || s.days.indexOf(TWD) >= 0; };
    var roleDue = D.students.filter(function (s) { return dueToday(s) && (s.role || !D.students.some(function (x) { return x.role; })); });
    var cnt = MODE === "milk" ? Object.keys(mk.milk).length : MODE === "done" ? Object.keys(mk.done).length : MODE === "role" ? roleDue.filter(function (s) { return mk.role[s.no]; }).length : 0;
    var talkTotal = Object.keys(mk.talk).reduce(function (a, k) { return a + mk.talk[k]; }, 0);
    var stat = MODE === "milk" ? '<span>마신 친구 <b class="num">' + cnt + "</b> / " + n + '</span><span class="pbar"><i style="width:' + Math.round(cnt / n * 100) + '%"></i></span>' :
      MODE === "done" ? (TPW ? '<input class="act-in" id="actIn" maxlength="40" value="' + esc(mk.act || "") + '" placeholder="지금 활동 이름" aria-label="지금 활동 이름 (고치고 Enter)" title="고치고 Enter를 누르면 바뀌어요">' :
        '<span class="act">' + ico("note") + esc(mk.act || "지금 활동") + "</span>") + '<span>다 한 친구 <b class="num">' + cnt + "</b> / " + n + '</span><span class="pbar"><i style="width:' + Math.round(cnt / n * 100) + '%"></i></span>' :
      MODE === "role" ? '<span>오늘 역할 있는 친구 <b class="num">' + cnt + "</b> / " + roleDue.length + '</span><span class="pbar"><i style="width:' + Math.round(cnt / Math.max(1, roleDue.length) * 100) + '%"></i></span>' + (roleDue.length < n ? '<span class="nmhint" style="color:var(--sub)">흐린 칸은 오늘 쉬는 날</span>' : "") :
      MODE === "name" ? (function () { var k = Object.keys(mk.name || {}).length, day = mk.nameDay || 0, R = D.thermo.rules || {};
        return '<span>지금 수업방해 <b class="num">' + k + "</b>명" + (k ? ' · 쉬는 시간 <b class="num">−' + k + "</b>분" : "") + "</span>" +
          (R.noName ? '<span class="nmhint">' + (day ? "오늘 " + day + "번 · 온도계가 오르지 않아요" : "이대로 " + esc(R.cut || "14:30") + "까지 가면 온도계 +" + R.noName + "도") + "</span>" : "") +
          (k ? '<span class="nmhint">교시가 끝나면 저절로 리셋돼요</span>' : "") +
          (TPW ? "" : '<span class="nmhint">선택 · 취소는 선생님만</span>'); })() :
      MODE === "talk" ? '<span>오늘 발표 <b class="num">' + talkTotal + "</b>번 · 손 든 친구 <b class='num'>" + Object.keys(mk.talk).length + "</b>명</span>" :
      MODE === "feel" ? '<span>내 번호를 누르고 마음 색을 골라요 · 마음 나눈 친구 <b class="num">' + Object.keys(mk.feel || {}).length + "</b> / " + n + "</span>" :
      "<span>내 번호를 누르면 아이디와 비밀번호 힌트가 30초 동안 보여요</span>";
    var ae = document.activeElement; if (!(ae && ae.id === "actIn"))
    $("ptabs").innerHTML = modes.map(function (m) { return '<button class="ptab jua' + (m.id === MODE ? " on" : "") + '" style="--tc:' + m.c + '" data-mode="' + m.id + '">' + ico(m.ic) + m.name + "</button>"; }).join("") +
      '<div class="pstat">' + stat + "</div>";
    var rows = n <= 10 ? 1 : n > 26 ? 3 : 2;
    $("panel").style.height = rows === 1 && innerWidth > 700 ? "clamp(170px,22vh,240px)" : "";
    $("nums").style.gridTemplateColumns = "repeat(" + Math.ceil(n / rows) + ",minmax(0,1fr))";
    $("nums").innerHTML = D.students.map(function (s) {
      var on = MODE === "milk" ? mk.milk[s.no] : MODE === "done" ? mk.done[s.no] : MODE === "role" ? mk.role[s.no] : MODE === "name" ? (mk.name || {})[s.no] : MODE === "feel" ? (mk.feel || {})[s.no] : 0, talk = mk.talk[s.no] || 0;
      var rest = MODE === "role" && !dueToday(s) && !on;
      return '<button class="nb' + (on ? " on" : "") + (rest ? " rest" : "") + '" data-no="' + s.no + '" aria-label="' + esc(label(s)) + '">' + numHTML(s) +
        (MODE === "role" && s.role ? '<span class="rl">' + esc(rest ? s.role + " · " + s.days.join("·") : s.role) + "</span>" : "") +
        (MODE === "talk" ? '<span class="stars num' + (talk ? " has" : "") + '">' + talk + "</span>" : '<span class="mark">' + ico(MODE === "feel" ? "heart" : MODE === "name" ? "x" : "check") + "</span>") + "</button>";
    }).join("");
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-mode]"); if (t) { MODE = t.dataset.mode; drawPanel(); return; }
    var b = e.target.closest(".nb"); if (b && D) { tapNo(Number(b.dataset.no), b); return; }
  });
  function saveAct(el) {
    var v = el.value.trim(); if (!v || !D || v === D.marks.act) { el.value = D ? D.marks.act : ""; return; }
    el.blur();
    write("saveSetting", [TPW, "지금 활동", v], { busy: "지금 활동 바꾸는 중", msg: "지금 활동: " + v, mut: function (d) { d.settings["지금 활동"] = v; d.marks.act = v; d.marks.done = {}; if (TD) TD.settings["지금 활동"] = v; } });
  }
  document.addEventListener("keydown", function (e) { if (e.target.id === "actIn" && e.key === "Enter" && !e.isComposing) saveAct(e.target); if (e.target.id === "actIn" && e.key === "Escape") { e.target.value = D.marks.act; e.target.blur(); } });
  document.addEventListener("focusout", function (e) { if (e.target.id === "actIn") setTimeout(function () { if (document.activeElement !== e.target) saveAct(e.target); }, 0); });
  function student(no) { return D.students.filter(function (s) { return s.no === no; })[0] || { no: no, name: "", role: "" }; }
  function tapNo(no, el) {
    var s = student(no), who = no + "번" + (s.name ? " " + s.name : ""), mk = D.marks, n = D.students.length;
    el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop");
    if (MODE === "acct") return showAccount(no);
    if (MODE === "name") {
      if (needTeacher()) return;
      var onN = !(mk.name || {})[no], pl = periodNow(), lab = pl.cur ? pl.cur.p.n + "교시" : (function () { var last = null, m = new Date().getHours() * 60 + new Date().getMinutes(); D.tt.periods.forEach(function (p) { if (toMin(String(p.time).split("-")[0]) <= m) last = p; }); return last ? last.n + "교시 뒤" : "수업 전"; })();
      // 다시 누르면 취소: 기록까지 지운다 (교시 끝 리셋은 저절로 되고, 그때는 기록이 남음)
      if (!onN) {
        write("nameUndo", [TPW, no], { msg: who + " 수업방해 취소 · 기록도 지웠어요",
          mut: function (d) { if (d.marks.name) delete d.marks.name[no]; d.marks.nameDay = Math.max(0, (d.marks.nameDay || 1) - 1); },
          after: function () { thermoTick(true); } });
        return;
      }
      toast(who + " 수업방해");
      write("nameMark", [TPW, no, lab], {
        mut: function (d) { d.marks.name = d.marks.name || {}; if (onN) { d.marks.name[no] = 1; d.marks.nameDay = (d.marks.nameDay || 0) + 1; } else delete d.marks.name[no]; },
        after: function (r) { if (r && r.undone) { toast("오늘 '수업방해 없는 날' +" + r.undone + "도를 되돌렸어요"); call("getAll", [], function () { syncState(); }, true); } } });
      return;
    }
    if (MODE === "talk") {
      write("present", [no], { busy: who + " 발표 기록 중", mut: function (d) { d.marks.talk[no] = (d.marks.talk[no] || 0) + 1; }, msg: who + " 발표 +1",
        undo: function () { write("undoPresent", [no], { busy: "되돌리는 중", mut: function (d) { d.marks.talk[no] = Math.max(0, (d.marks.talk[no] || 0) - 1); if (!d.marks.talk[no]) delete d.marks.talk[no]; }, msg: "되돌렸어요" }); } });
      var p = center(el); confetti(p[0], p[1], 18, ["#7566c0", "#e0b341", "#fff"]); return;
    }
    var key = MODE === "milk" ? "milk" : MODE === "done" ? "done" : "role", kind = MODE === "milk" ? "우유" : MODE === "done" ? "다했어요" : "1인1역";
    var on = !mk[key][no], label = MODE === "milk" ? "우유 다 먹었어요" : MODE === "done" ? "다 했어요" : (s.role || "1인 1역") + " 했어요";
    write("tap", [kind, no], { busy: on ? who + " · " + label : who + " 취소하는 중",
      mut: function (d) { if (on) d.marks[key][no] = 1; else delete d.marks[key][no]; },
      fx: function () {
        if (on) { var p = center(el); confetti(p[0], p[1], 22, [MODES.filter(function (m) { return m.id === MODE; })[0].c, "#fff", "#e0b341"]); }
        if (on && Object.keys(D.marks[key]).length === n) party(MODE === "milk" ? "우리반 모두 우유 다 먹었어요!" : MODE === "done" ? "모두 다 했어요! 최고!" : "오늘 1인 1역 모두 완료!");
      } });
  }
  function showAccount(no) {
    var s = student(no);
    busy(no + "번 계정을 찾는 중", "");
    call("getAccount", [no], function (list) {
      busyEnd(true, "찾았어요", "");
      $("acctNo").textContent = no + "번"; $("acctName").textContent = s.name || "";
      $("acctList").innerHTML = (list || []).map(function (a) { return "<div><b>" + esc(a.service) + " 아이디</b><span class='num'>" + esc(a.id || "아직 없어요") + "</span>" + (a.hint ? "<em><i>비밀번호 힌트</i>" + esc(a.hint) + "</em>" : "") + "</div>"; }).join("") || "<div><b>등록된 계정이 없어요</b><em>선생님께 물어보세요</em></div>";
      openModal("acctM");
      var ALL = 30, left = ALL, bar = $("acctBar"); $("acctCount").textContent = left + "초 뒤에 저절로 닫혀요";
      bar.style.transition = "none"; bar.style.width = "100%"; void bar.offsetWidth; bar.style.transition = "";
      clearInterval(showAccount._t); showAccount._t = setInterval(function () { left--; $("acctCount").textContent = left + "초 뒤에 저절로 닫혀요"; bar.style.width = (left / ALL * 100) + "%"; if (left <= 0) { clearInterval(showAccount._t); closeModal("acctM"); } }, 1000);
    });
  }

  // 온도계 · 할 일 · 쪽지 클릭
  document.addEventListener("click", function (e) {
    var t = e.target.closest("button"); if (!t || !D) return;
    if (t.dataset.rs != null) { REASON = REASON === t.dataset.rs ? "" : t.dataset.rs; drawThermo(); }
    if (t.id === "thGo") { var tv = Math.round(Number($("thIn").value)); if (!tv || Math.abs(tv) > 50) { toast("-50 ~ 50 사이 숫자를 적어 주세요 (예: 5, -2)"); $("thIn").focus(); return; } $("thIn").value = ""; thermoAdd(tv); }
    if (t.dataset.th) thermoAdd(Number(t.dataset.th));
  });
  $("thIn").addEventListener("keydown", function (e) { if (e.key === "Enter") $("thGo").click(); });
  function thermoAdd(dlt) {
    {
      var why = REASON || (dlt > 0 ? "칭찬" : ""), before = D.thermo.total, goal = D.thermo.goal;
      write("thermo", [dlt, why], { busy: "온도계 " + (dlt > 0 ? "+" : "") + dlt + "도" + (why ? " · " + why : ""),
        mut: function (d) { d.thermo.total = Math.max(0, d.thermo.total + dlt); d.thermo.recent.unshift({ t: nowStamp(), d: dlt, why: why }); },
        fx: function () { var p = center($("tsvg")); if (dlt > 0) confetti(p[0], p[1] - 40, 24, ["#e76f7f", "#f4a261", "#fff"]); } });
      REASON = "";
    }
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest("button"); if (!t || !D) return;
    if (t.dataset.tg) {
      var no = t.dataset.tg; write("toggleTodo", [no], { busy: "할 일 체크", mut: function (d) { d.todos.forEach(function (x) { if (String(x["번호"]) === no) x["완료"] = x["완료"] === "예" ? "아니오" : "예"; }); } });
    }
    if (t.dataset.td) { var tn = t.dataset.td; write("delTodo", [TPW, tn], { busy: "할 일 지우는 중", mut: function (d) { d.todos = d.todos.filter(function (x) { return String(x["번호"]) !== tn; }); } }); }
    if (t.dataset.md) { var mn = t.dataset.md; write("delMemo", [TPW, mn], { busy: "쪽지 지우는 중", mut: function (d) { d.memos = d.memos.filter(function (x) { return String(x["번호"]) !== mn; }); } }); }
    if (t.id === "ttEdit") openDrawer("tt");
    if (t.id === "calEdit") openDrawer("ev");
    if (t.id === "mboxBtn") { if (!EDIT) $("memoText").focus(); }
  });
  function onEnter(id, fn) { $(id).addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.isComposing && this.value.trim() && D) fn(this); }); }
  onEnter("memoText", function (el) {
    var who = $("memoWho").value.trim(), text = el.value.trim(), tmp = "tmp" + Date.now(); el.value = "";
    write("addMemo", [who, text], { busy: "선생님께 남기는 중", mut: function (d) { d.memos.unshift({ "번호": tmp, "시각": nowStamp(), "누가": who, "내용": text }); d.memos = d.memos.slice(0, 6); },
      after: function (r) { D.memos.forEach(function (m) { if (m["번호"] === tmp && r && r.no) m["번호"] = r.no; }); }, msg: "선생님께 남겼어요",
      fx: function () { var c = $("memoCard"); c.classList.remove("got"); void c.offsetWidth; c.classList.add("got"); setTimeout(function () { c.classList.remove("got"); }, 1000); } });
  });
  onEnter("todoText", function (el) {
    var text = el.value.trim(), tmp = "tmp" + Date.now(); el.value = "";
    write("addTodo", [TPW, text], { busy: "할 일 추가", mut: function (d) { d.todos.push({ "번호": tmp, "날짜": d.today, "할 일": text, "완료": "아니오" }); },
      after: function (r) { D.todos.forEach(function (m) { if (m["번호"] === tmp && r && r.no) m["번호"] = r.no; }); } });
  });

  // ── 발표 뽑기 (오늘 뽑힌 번호는 이 컴퓨터에 기억) ──
  function pickKey() { return "classdesk-picked-" + (D ? D.today : ""); }
  function picked() { try { return JSON.parse(ls(pickKey()) || "[]"); } catch (e) { return []; } }
  var PEX = ls("classdesk-pickex") !== "0";
  function drawPick() {
    var left = D.students.length - (PEX ? picked().length : 0);
    $("pickLeft").textContent = PEX ? left + "명 남음" : "모두 중에서"; $("pickEx").classList.toggle("on", PEX);
  }
  $("pickEx").onclick = function () { PEX = !PEX; ls("classdesk-pickex", PEX ? "1" : "0"); drawPick(); };
  $("pickReset").onclick = function () { ls(pickKey(), "[]"); $("pickN").textContent = "?"; $("pickName").textContent = "누가 뽑힐까요?"; drawPick(); };
  $("pickGo").onclick = function () {
    if (!D) return;
    var all = D.students.map(function (s) { return s.no; }), done = picked(), pool = PEX ? all.filter(function (n) { return done.indexOf(n) < 0; }) : all;
    if (!pool.length) { toast("모두 한 번씩 뽑혔어요. [처음부터]를 눌러요"); return; }
    var final = pool[Math.floor(Math.random() * pool.length)], el = $("pickN"), k = 0, steps = REDUCE ? 1 : 22;
    el.classList.add("roll"); $("pickName").textContent = "두근두근...";
    (function spinN() {
      k++; el.textContent = k >= steps ? final : all[Math.floor(Math.random() * all.length)];
      if (k < steps) setTimeout(spinN, 40 + k * k * .55);
      else { el.classList.remove("roll"); $("pickName").textContent = label(student(final)); var p = center(el); confetti(p[0], p[1], 50, ["#e0b341", "#b3831f", "#fff", "#c9636d"]);
        chimeOn() && chime([784, 988, 1175]); if (PEX) { done.push(final); ls(pickKey(), JSON.stringify(done)); } drawPick(); }
    })();
  };

  // ── 타이머: 분 · 초 화살표, 1/3/5/10분, 소리 켜고 끄기, 크게 보기 ──
  var TM = { total: 300, left: 300, end: 0, run: false };
  try { var sv = JSON.parse(ls("classdesk-timer") || "null"); if (sv && sv.total && !TWIN) TM = sv; } catch (e) {}
  var SND = ls("classdesk-sound");
  function chimeOn() { return SND != null ? SND === "1" : !(D && D.settings["타이머 소리"] === "아니오"); }
  function drawSound() { $("bSnd").innerHTML = ico(chimeOn() ? "sound" : "mute") + (chimeOn() ? " 소리 켬" : " 소리 끔"); $("sndBtn").innerHTML = ico(chimeOn() ? "sound" : "mute") + (chimeOn() ? " 소리 켬" : " 소리 끔"); $("sndBtn").classList.toggle("on", chimeOn()); $("sndBtn").style.setProperty("--cc", "#7566c0"); }
  $("sndBtn").onclick = function () { SND = chimeOn() ? "0" : "1"; ls("classdesk-sound", SND); drawSound(); };
  function tmSave() { if (!TWIN) ls("classdesk-timer", JSON.stringify(TM)); }
  function tmSet(sec) { if (TM.run) return; TM.total = TM.left = Math.max(5, Math.min(180 * 60, Math.round(sec))); tmDraw(); tmSave(); }
  function tmDraw() {
    if (document.activeElement !== $("tMin")) $("tMin").value = pad(Math.floor(TM.left / 60));
    if (document.activeElement !== $("tSec")) $("tSec").value = pad(TM.left % 60);
    var off = String(540.4 * (1 - TM.left / TM.total));
    $("arc").setAttribute("stroke-dashoffset", off);
    $("timerCard").classList.toggle("run", TM.run);
    $("tGo").textContent = TM.run ? "멈춤" : TM.left < TM.total ? "이어서" : "시작";
    $("tState").textContent = TM.run ? hm(new Date(TM.end)) + "에 끝나요" : TM.left < TM.total ? "잠깐 멈춤" : "화살표로 분 · 초를 맞추고 시작";
    document.querySelectorAll("[data-pre]").forEach(function (b) { b.classList.toggle("on", Number(b.dataset.pre) === TM.total); });
    $("bigT").textContent = pad(Math.floor(TM.left / 60)) + ":" + pad(TM.left % 60); $("bigBar").style.width = (TM.left / TM.total * 100) + "%";
    $("bigS").textContent = TM.run ? hm(new Date(TM.end)) + "에 끝나요" : TM.left < TM.total ? "잠깐 멈춤" : "멈춰 있어요";
    $("bGo").textContent = $("tGo").textContent; document.querySelectorAll("[data-bstep]").forEach(function (b) { b.disabled = TM.run; b.style.opacity = TM.run ? .45 : ""; });
  }
  setInterval(function () {
    if (!TM.run) return; TM.left = Math.max(0, Math.ceil((TM.end - Date.now()) / 1000)); tmDraw();
    if (TM.total > 75 && TM.left <= 60 && TM.left > 50 && !TM.warned) { TM.warned = true; tmSave(); if (chimeOn()) { chime([880, 1175], true); setTimeout(function () { say("1분 남았습니다."); }, 700); } toast("1분 남았어요"); }
    if (TM.left <= 0) tmDone();
  }, 250);
  $("tGo").onclick = function () { sndOut(); if (TM.left > 60) TM.warned = false; if (TM.run) { TM.left = Math.max(1, Math.ceil((TM.end - Date.now()) / 1000)); TM.run = false; } else { TM.end = Date.now() + TM.left * 1000; TM.run = true; } tmSave(); tmDraw(); };
  $("tReset").onclick = function () { TM.run = false; TM.left = TM.total; TM.warned = false; tmSave(); tmDraw(); };
  function openClock() { if (EDIT) return; $("bigClock").classList.add("on"); tickClock(); nowPeriod(); }
  $("clockBig").onclick = function (e) { e.stopPropagation(); openClock(); };
  document.querySelector(".c-clock").addEventListener("click", function (e) { if (!EDIT && !e.target.closest(".tools")) openClock(); });
  $("bcClose").onclick = function () { $("bigClock").classList.remove("on"); };
  addEventListener("keydown", function (e) { if (e.key === "Escape") ["bigClock", "bigTimer"].forEach(function (id) { $(id).classList.remove("on"); }); });
  $("tBig").onclick = function () { $("bigTimer").classList.add("on"); tmDraw(); };
  $("bGo").onclick = function () { $("tGo").click(); };
  $("bReset").onclick = function () { $("tReset").click(); };
  $("bSnd").onclick = function () { $("sndBtn").click(); };
  document.addEventListener("click", function (e) { var b = e.target.closest("[data-bstep]"); if (b && !TM.run) tmSet(TM.total + Number(b.dataset.bstep)); });
  $("bigClose").onclick = function () { $("bigTimer").classList.remove("on"); };
  function tmDone() {
    TM.run = false; TM.left = TM.total; TM.warned = false; tmSave(); tmDraw();
    if (chimeOn()) { var al = [1047, 1319, 1568, 2093]; chime(al, true); setTimeout(function () { chime(al, true); }, 1300); setTimeout(function () { chime(al, true); }, 2600); setTimeout(function () { say("시간이 다 됐습니다."); }, 3900); }
    party("시간이 다 됐어요!");
  }
  function tmResume() { if (TM.run && Date.now() >= TM.end) { TM.run = false; TM.left = TM.total; tmSave(); } tmDraw(); }
  function typed() { var m = Number($("tMin").value.replace(/[^0-9]/g, "")) || 0, s = Number($("tSec").value.replace(/[^0-9]/g, "")) || 0; tmSet(m * 60 + Math.min(59, s)); }
  ["tMin", "tSec"].forEach(function (id) {
    $(id).addEventListener("change", typed); $(id).addEventListener("focus", function () { this.select(); }); $(id).addEventListener("blur", tmDraw);
    $(id).addEventListener("keydown", function (e) { if (e.key === "Enter") { typed(); this.blur(); } if (e.key === "ArrowUp" || e.key === "ArrowDown") { e.preventDefault(); tmSet(TM.total + (e.key === "ArrowUp" ? 1 : -1) * (id === "tMin" ? 60 : 10)); } });
    $(id).addEventListener("wheel", function (e) { if (TM.run) return; e.preventDefault(); tmSet(TM.total + (e.deltaY < 0 ? 1 : -1) * (id === "tMin" ? 60 : 10)); }, { passive: false });
  });
  document.addEventListener("click", function (e) { var b = e.target.closest("[data-pre]"); if (b) tmSet(Number(b.dataset.pre)); });
  (function holdArrows() {
    document.addEventListener("pointerdown", function (e) {
      var b = e.target.closest(".arr"); if (!b) return;
      var r = null, h = setTimeout(function () { b._held = true; r = setInterval(function () { tmSet(TM.total + Number(b.dataset.step)); }, 70); }, 380);
      var stop = function () { clearTimeout(h); clearInterval(r); ["pointerup", "pointerleave", "pointercancel"].forEach(function (ev) { b.removeEventListener(ev, stop); }); };
      ["pointerup", "pointerleave", "pointercancel"].forEach(function (ev) { b.addEventListener(ev, stop); });
    });
    document.addEventListener("click", function (e) { var b = e.target.closest(".arr"); if (!b) return; if (b._held) { b._held = false; return; } tmSet(TM.total + Number(b.dataset.step)); });
  })();

  // ── 끌어 옮기기 (손가락 · 마우스 모두) ──
  function dragStart(e, src, type, onDrop, onOver) {
    var sx = e.clientX, sy = e.clientY, ghost = null, over = null, r0 = src.getBoundingClientRect(), ox = sx - r0.left, oy = sy - r0.top;
    function move(ev) {
      if (!ghost) {
        if (Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) < 8) return;
        ghost = src.cloneNode(true); ghost.classList.remove("over", "land", "dragging"); ghost.classList.add("dragghost");
        ghost.style.width = r0.width + "px"; ghost.style.height = r0.height + "px"; ghost.style.gridRow = ghost.style.gridColumn = "";
        document.body.appendChild(ghost); src.classList.add("dragging");
      }
      ghost.style.left = (ev.clientX - ox) + "px"; ghost.style.top = (ev.clientY - oy) + "px";
      var el = document.elementFromPoint(ev.clientX, ev.clientY), tg = el && el.closest('[data-drop="' + type + '"]');
      if (over && over !== tg) over.classList.remove("over"); over = tg; if (tg && tg !== src && !onOver) tg.classList.add("over");
      if (onOver) onOver(tg && tg !== src ? tg : null);
    }
    function up(ev) {
      removeEventListener("pointermove", move); removeEventListener("pointerup", up); removeEventListener("pointercancel", up);
      if (over) over.classList.remove("over");
      src.classList.remove("dragging");
      if (ghost) { ghost.remove(); onDrop(over && over !== src ? over : null, ev, true); } else onDrop(null, ev, false);
    }
    addEventListener("pointermove", move); addEventListener("pointerup", up); addEventListener("pointercancel", up);
  }

  // ── 화면 꾸미기 (선생님 모드) ──
  function editOn() { EDIT = JSON.parse(JSON.stringify(LAY)); EDIT.v = 2; document.body.classList.add("edit"); closeDrawer(); drawTools(); applyLayout(true); }
  function editOff(save) {
    if (save && EDIT) { var json = JSON.stringify(EDIT); LAY = EDIT; D.layout = json; write("saveLayout", [TPW, json], { busy: "화면 배치를 저장하는 중", msg: "화면 배치를 저장했어요", big: true }); }
    EDIT = null; document.body.classList.remove("edit"); applyLayout(true);
  }
  function drawTools() {
    document.querySelectorAll(".card").forEach(function (c) {
      var id = c.dataset.id; c.dataset.drop = "card";
      c.querySelector(".tools").innerHTML = '<button data-sz="w-">가로 −</button><button data-sz="w+">가로 +</button><button data-sz="h-">세로 −</button><button data-sz="h+">세로 +</button><button data-sz="hide">숨기기</button>';
    });
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-sz]"); if (!b || !EDIT) return;
    var id = b.closest(".card").dataset.id, sz = EDIT.size[id], k = b.dataset.sz;
    if (k === "w-") sz[0] = Math.max(2, sz[0] - 1); if (k === "w+") sz[0] = Math.min(12, sz[0] + 1);
    if (k === "h-") sz[1] = Math.max(1, sz[1] - 1); if (k === "h+") sz[1] = Math.min(3, sz[1] + 1);
    if (k === "hide") { EDIT.hidden.push(id); toast("'" + NAMES[id] + "' 카드를 숨겼어요. 선생님 서랍 > 화면 꾸미기에서 다시 보여요"); }
    applyLayout(true);
  });
  document.addEventListener("pointerdown", function (e) {
    if (!EDIT) return;
    var c = e.target.closest(".card"); if (!c || e.target.closest(".tools")) return;
    e.preventDefault();
    var lastId = "", lastT = 0;
    // 끄는 동안 다른 카드 위에 오면 그 자리로 들어가고, 나머지 카드는 스르륵 비켜난다
    dragStart(e, c, "card", function () { applyLayout(true); }, function (tg) {
      if (!tg || !EDIT) return;
      var id = tg.dataset.id, now = Date.now();
      if (id === lastId && now - lastT < 700) return;
      if (now - lastT < 260) return;
      var o = EDIT.order, a = o.indexOf(c.dataset.id), b = o.indexOf(id);
      o.splice(a, 1); o.splice(b, 0, c.dataset.id); lastId = id; lastT = now; applyLayout(true);
    });
  });
  $("edSave").onclick = function () { editOff(true); };
  $("edCancel").onclick = function () { editOff(false); };
  $("edDefault").onclick = function () { EDIT = JSON.parse(JSON.stringify(DEF)); applyLayout(true); };

  // ── 선생님 모드 ──
  $("tchBtn").onclick = function () { if (TPW && document.body.classList.contains("teacher")) openDrawer(DTAB); else { openModal("tlock"); setTimeout(function () { $("tpw").focus(); }, 60); } };
  $("tpw").addEventListener("keydown", function (e) { if (e.key === "Enter") $("tpwGo").click(); });
  $("tpwGo").onclick = function () {
    var pw = $("tpw").value.trim(); if (!pw) { toast("선생님 비밀번호를 적어 주세요"); $("tpw").focus(); return; }
    busy("선생님 비밀번호 확인 중", "");
    google.script.run.withSuccessHandler(function () { busyEnd(true, "어서 오세요, 선생님", ""); TPW = pw; try { sessionStorage.setItem("classdesk-tpw", pw); } catch (e) {} $("tpw").value = ""; var go = TGO; closeModal("tlock"); teacherOn(); if (go === "unlock") { kidLock(false); toast("잠금을 풀었어요"); } else if (go === "notice") ntEditOn(); else openDrawer(go === "month" ? "month" : "today"); })
      .withFailureHandler(function (e) { busyEnd(false, "비밀번호가 맞지 않아요", "시트 '설정' 탭의 선생님 비밀번호"); }).checkTeacher(CODE, pw);
  };
  $("pwFind").onclick = function () { $("pwFindBox").hidden = !$("pwFindBox").hidden; };
  $("pwMail").onclick = function () {
    var b = this; b.disabled = true; busy("선생님 메일로 보내는 중", "시트 주인 구글 계정으로만 가요");
    google.script.run.withSuccessHandler(function (r) { b.disabled = false; busyEnd(true, "메일을 보냈어요", (r && r.to ? r.to + " · " : "") + "받은편지함(없으면 스팸함)을 확인해 주세요"); $("pwFindBox").hidden = true; })
      .withFailureHandler(function (e) { b.disabled = false; busyEnd(false, "보내지 못했어요", ((e && e.message) || "").slice(0, 70)); }).mailPw(CODE);
  };
  function teacherOn() { document.body.classList.add("teacher"); $("tchTxt").textContent = "선생님 서랍"; $("tchBtn").querySelector("svg").outerHTML = ico("unlock"); poke(); if (D) drawPanel(); }
  function teacherOff() { if (typeof NTE !== "undefined" && NTE.on) ntEditOff();
    TPW = ""; try { sessionStorage.removeItem("classdesk-tpw"); } catch (e) {}
    document.body.classList.remove("teacher"); closeDrawer(); if (EDIT) editOff(false); if (D) drawPanel();
    if (TW && !TW.closed) { try { TW.close(); } catch (e) {} } TW = null;
    $("tchTxt").textContent = "선생님"; var sv2 = $("tchBtn").querySelector("svg"); if (sv2) sv2.outerHTML = ico("lock");
  }
  function poke() { clearTimeout(TIMEOUT); if (TPW) TIMEOUT = setTimeout(function () { teacherOff(); toast("15분 동안 쓰지 않아 선생님 모드를 닫았어요"); }, 15 * 60 * 1000); }
  document.addEventListener("pointerdown", function () { if (TPW) poke(); });
  if (TPW) teacherOn();

  var DTABS = [["today", "오늘 한눈에", "eye"], ["note", "선생님 노트", "note"], ["lesson", "수업계획", "book"], ["notice", "알림장", "list"], ["thermo", "온도계", "thermo"], ["tt", "시간표", "cal"], ["ev", "일정", "spark"], ["att", "출결", "check"], ["month", "월별 기록", "print"], ["layout", "화면 꾸미기", "grid"], ["feat", "기능 켜고 끄기", "eye"], ["set", "설정", "gear"], ["sheet", "시트 관리", "sheet"], ["safe", "보안 · 심의", "shield"]];
  function openDrawer(tab) {
    DTAB = tab || DTAB; $("drawer").classList.add("on"); $("dback").classList.add("on"); var vv = (D && D.version) || ""; $("verTxt").textContent = (vv.match(/v[\d.]+$/) || [vv])[0]; $("verTxt").title = vv;
    $("dbody").innerHTML = '<p class="muted">시트에서 가져오는 중...</p>';
    drawDrawer();
    google.script.run.withSuccessHandler(function (res) { TD = res; drawDrawer(); }).withFailureHandler(function (e) { fail(e); }).teacher(CODE, TPW);
  }
  function closeDrawer() { $("drawer").classList.remove("on"); $("dback").classList.remove("on"); }
  $("dback").onclick = closeDrawer;
  $("dGuide").onclick = function () { window.open("https://kimman.kr/desk/guide", "_blank", "noopener"); };
  $("dSheet").onclick = function () { if (D && D.sheetUrl) { window.open(D.sheetUrl, "_blank"); toast("시트는 선생님만 보는 곳이에요. 학생에게 공유하지 마세요"); } };
  // 창 바깥(어두운 바탕)을 누르면 닫기 — 화면 잠금 코드 창은 빼고
  document.querySelectorAll(".modal").forEach(function (m) { m.addEventListener("click", function (e) { if (e.target === m && m.id !== "lock") { closeModal(m.id); if (m.id === "acctM") clearInterval(showAccount._t); } }); });
  ["bigClock", "bigTimer"].forEach(function (id) { $(id).addEventListener("click", function (e) { if (e.target === $(id) || e.target.classList.contains("bclock")) $(id).classList.remove("on"); }); });
  $("dClose").onclick = closeDrawer;
  $("dMsg").onclick = function () { DTAB = "msg"; drawDrawer(); };

  // ── 선생님 서랍은 새 창으로 ──
  function openTW(tab) {
    DTAB = tab || DTAB || "today";
    if (TW && !TW.closed) { try { TW.focus(); if (TW.DESKAPP) TW.DESKAPP.show(DTAB); } catch (e) {} return; }
    var w = Math.min(1280, screen.availWidth || 1280), h = Math.min(900, screen.availHeight || 900);
    TW = window.open(location.pathname + "?teacher=1&tab=" + encodeURIComponent(DTAB), "deskTeacher", "popup=yes,width=" + w + ",height=" + h);
    if (!TW) toast("새 창이 막혔어요. 주소창 오른쪽의 팝업 차단 표시를 눌러 이 사이트를 '항상 허용'으로 바꿔 주세요");
  }
  if (!TWIN) {
    openDrawer = openTW;
    window.DESKAPP = {
      refresh: function () { clearTimeout(DESKAPP._r); DESKAPP._r = setTimeout(function () { if (!D) return; if (busyNow()) return DESKAPP.refresh(); call("getAll", [], function () { syncState(); }, true); }, 500); },
      editOn: function () { try { window.focus(); } catch (e) {} if (!EDIT) editOn(); },
      teacherOff: function () { if (TPW) { teacherOff(); toast("선생님 모드를 닫았어요"); } },
      poke: function () { poke(); },
      acct: function (k) { if (window.DESK_ACCT) DESK_ACCT(k); },
      layout: function () { if (!EDIT && D) { LAY = readLayout(); applyLayout(true); } }
    };
    addEventListener("pagehide", function () { if (TW && !TW.closed) { try { TW.close(); } catch (e) {} } });
  } else {
    closeDrawer = function () {};
    $("dClose").onclick = function () { window.close(); };
    $("dClose").title = "창 닫기";
    teacherOff = function () { try { if (TOP && !TOP.closed) TOP.DESKAPP.teacherOff(); } catch (e) {} window.close(); };
    poke = function () { clearTimeout(TIMEOUT); try { if (TOP && !TOP.closed) TOP.DESKAPP.poke(); } catch (e) {} };
    editOn = function () { try { TOP.DESKAPP.editOn(); toast("바탕화면 창에서 카드를 끌어 옮기고 [저장]을 눌러 주세요"); } catch (e) { toast("바탕화면 창이 닫혀 있어요"); } };
    document.addEventListener("keydown", function () { poke(); });
    window.DESKAPP = { show: function (tab) { if (tab && tab !== DTAB) { DTAB = tab; drawDrawer(); } try { window.focus(); } catch (e) {} } };
    // 바탕화면 창이 닫히면 이 창도 닫는다
    setInterval(function () { try { if (!TOP || TOP.closed) window.close(); } catch (e) { window.close(); } }, 3000);
    // 이 창으로 돌아올 때: 오늘 한눈에 · 노트는 새로 가져오기 (쓰던 글이 있는 탭은 건드리지 않음)
    addEventListener("focus", function () {
      if (!TPW || !TD || (DTAB !== "today" && DTAB !== "note")) return;
      var ae = document.activeElement; if (ae && /INPUT|TEXTAREA|SELECT/.test(ae.tagName) && ae.value) return;
      google.script.run.withSuccessHandler(function (res) { TD = res; drawDrawer(); }).teacher(CODE, TPW);
    });
  }

  // ── 선생님 서랍 > 수업계획: 한 주 시간표 칸마다 수업 계획 · 활동 계획을 적고 본다 (시트 '수업계획' 탭) ──
  var LP = { mon: "", weeks: {}, loading: {}, sel: "", drafts: {}, q: "", found: null };
  var LPF = [["과목", "input", "예: 수학", 20], ["단원 · 차시", "input", "예: 6단원 원기둥, 원뿔, 구 (3/9차시)", 80], ["학습 목표", "area2", "이 시간에 아이들이 할 수 있게 될 것", 300],
    ["수업 계획", "area6", "도입 (5분) –\n전개 (30분) –\n정리 (5분) –", 3000], ["활동 계획", "area6", "활동 1 –\n활동 2 –\n모둠 · 놀이 · 학습지 등", 3000],
    ["준비물", "input", "예: 학습지 25장, 원기둥 모형, 가위", 300], ["메모", "area2", "수업 뒤 돌아보기 · 다음 시간에 이어서 할 것", 1000]];
  function lpMd(ymd) { var d = new Date(ymd + "T12:00:00"); return (d.getMonth() + 1) + "/" + d.getDate(); }
  function lpPlan(week, ymd, n) { return (week && week.plans || []).filter(function (p) { return p.d === ymd && Number(p.n) === Number(n); })[0] || null; }
  function lessonLoad(mon, force) {
    if (LP.loading[mon] || (LP.weeks[mon] && !force)) return;
    LP.loading[mon] = 1;
    google.script.run.withSuccessHandler(function (r) { delete LP.loading[mon]; LP.weeks[mon] = r; if (DTAB === "lesson" || DTAB === "today") drawDrawer(); })
      .withFailureHandler(function (e) { delete LP.loading[mon]; fail(e); }).lessonWeek(CODE, TPW, mon);
  }
  function lessonTodayHTML() {
    var mon = monOf(D.today), wk = LP.weeks[mon];
    if (!wk) { lessonLoad(mon); return '<div class="dsec"><h4>' + ico("book") + '오늘 수업계획</h4><p class="muted">가져오는 중...</p></div>'; }
    var day = wk.days.filter(function (x) { return x.ymd === D.today; })[0];
    if (!day) return "";
    var rows = day.periods.filter(function (p) { return p.subj || lpPlan(wk, D.today, p.n); }).map(function (p) {
      var pl = lpPlan(wk, D.today, p.n), sj = (pl && pl["과목"]) || p.subj;
      return '<button class="lp-today" data-lpgo="' + D.today + "|" + p.n + '"><b class="num">' + p.n + '</b><span class="sj" style="--sc:' + subColor(sj || "·") + '">' + esc(sj || "-") + "</span><span>" +
        (pl ? esc(pl["단원 · 차시"] || pl["학습 목표"] || "계획 있음") : '<em class="muted">아직 계획이 없어요</em>') + "</span></button>";
    }).join("");
    return '<div class="dsec"><h4>' + ico("book") + '오늘 수업계획</h4>' + (rows || '<p class="muted">오늘은 수업이 없어요</p>') + "</div>";
  }
  function lessonPane() {
    if (!LP.mon) LP.mon = monOf(D.today);
    var wk = LP.weeks[LP.mon];
    if (!wk) { lessonLoad(LP.mon); return '<p class="muted">수업계획을 가져오는 중...</p>'; }
    if (!LP.sel) { var td = wk.days.filter(function (x) { return x.ymd === D.today; })[0]; if (td) { var fp = td.periods.filter(function (p) { return p.subj; })[0]; if (fp) LP.sel = D.today + "|" + fp.n; } }
    var n = Math.max(wk.count || 6, 1), head = '<tr><th></th>' + wk.days.map(function (d) { return '<th class="' + (d.ymd === D.today ? "lp-now" : "") + '">' + d.wd + ' <small>' + lpMd(d.ymd) + "</small>" + (d.changed ? '<i title="바뀐 시간표">변경</i>' : "") + "</th>"; }).join("") + "</tr>";
    var body = "";
    for (var i = 1; i <= n; i++) {
      body += '<tr><th class="num">' + i + "교시</th>" + wk.days.map(function (d) {
        var p = d.periods[i - 1] || { subj: "" }, k = d.ymd + "|" + i, pl = lpPlan(wk, d.ymd, i), sj = (pl && pl["과목"]) || p.subj, dr = LP.drafts[k];
        return '<td><button class="lp-cell' + (pl ? " has" : "") + (LP.sel === k ? " sel" : "") + (d.ymd === D.today ? " now" : "") + '" data-lpc="' + k + '"' + (sj ? ' style="--sc:' + subColor(sj) + '"' : "") + ">" +
          '<b>' + esc(sj || "·") + "</b><span>" + (pl ? esc(pl["단원 · 차시"] || pl["학습 목표"] || "계획 있음") : dr ? "적는 중..." : "+") + "</span></button></td>";
      }).join("") + "</tr>";
    }
    var monTxt = (function () { var a = new Date(LP.mon + "T12:00:00"), b = new Date(ymdAdd(LP.mon, 4) + "T12:00:00"); return (a.getMonth() + 1) + "월 " + a.getDate() + "일 ~ " + (b.getMonth() + 1) + "월 " + b.getDate() + "일"; })();
    var h = '<div class="dsec"><h4>' + ico("cal") + '한 주 수업계획 <span class="lp-nav"><button class="btn ghost sm" data-lpw="-7">◀ 지난주</button><b>' + monTxt + '</b><button class="btn ghost sm" data-lpw="7">다음 주 ▶</button>' +
      (LP.mon !== monOf(D.today) ? '<button class="btn ghost sm" data-lpw="0">이번 주</button>' : "") + '<button class="btn ghost sm" id="lpPrint">' + ico("print") + ' 인쇄</button></span></h4>' +
      '<div class="lp-wrap"><table class="lp-grid">' + head + body + "</table></div><p class=\"muted\" style=\"margin-top:6px\">칸을 누르면 아래에 그 수업의 계획을 적을 수 있어요. 과목은 시간표에서 저절로 들어와요.</p></div>";
    if (LP.sel) {
      var sp = LP.sel.split("|"), ymd = sp[0], pn = Number(sp[1]);
      if (ymd >= LP.mon && ymd <= ymdAdd(LP.mon, 4)) {
        var dd = wk.days.filter(function (x) { return x.ymd === ymd; })[0] || { periods: [] }, per = dd.periods[pn - 1] || { subj: "", time: "" }, pl = lpPlan(wk, ymd, pn), dr = LP.drafts[LP.sel] || {};
        var val = function (k) { return dr[k] != null ? dr[k] : pl ? pl[k] || "" : k === "과목" ? per.subj || "" : ""; };
        h += '<div class="dsec lp-ed"><h4>' + ico("note") + mdText(ymd) + " " + pn + "교시" + (per.time ? ' <small class="muted">' + esc(per.time) + "</small>" : "") + (pl && pl.at ? '<span class="muted" style="margin-left:auto; font-weight:600; font-size:12px">저장 ' + esc(String(pl.at).slice(5)) + "</span>" : "") + "</h4>" +
          LPF.map(function (f) {
            var id = "lp-" + f[0].replace(/\W/g, ""), v = esc(val(f[0]));
            var inp = f[1] === "input" ? '<input class="field" data-lpf="' + f[0] + '" maxlength="' + f[3] + '" value="' + v + '" placeholder="' + esc(f[2]) + '">'
              : '<textarea class="field" data-lpf="' + f[0] + '" maxlength="' + f[3] + '" rows="' + (f[1] === "area6" ? 6 : 2) + '" placeholder="' + esc(f[2]) + '">' + v + "</textarea>";
            return '<label class="lp-f' + (f[1] === "area6" ? " lp-big" : "") + '"><span>' + f[0] + "</span>" + inp + "</label>";
          }).join("") +
          '<div class="frow" style="margin-top:6px"><button class="btn" id="lpSave">저장</button>' + (LP.drafts[LP.sel] ? '<button class="btn ghost" id="lpUndo">고친 것 버리기</button>' : "") + (pl ? '<button class="btn ghost" id="lpDel" style="margin-left:auto">이 계획 지우기</button>' : "") + "</div></div>";
      }
    }
    h += '<div class="dsec"><h4>' + ico("list") + '지난 수업계획 찾기</h4><div class="frow"><input class="field" id="lpQ" value="' + esc(LP.q) + '" placeholder="과목 · 단원 · 활동 이름 (비우면 최근 것부터)" style="flex:1"><button class="btn sm" id="lpFind">찾기</button></div>' +
      (LP.found ? (LP.found.list.length ? '<div class="lp-found">' + LP.found.list.map(function (o) {
        return '<button data-lpgo="' + o.d + "|" + o.n + '"><span class="num">' + esc(o.d.slice(2).replace(/-/g, ".")) + " " + o.n + '교시</span><b style="--sc:' + subColor(o["과목"] || "·") + '">' + esc(o["과목"] || "-") + "</b><span>" + esc(o["단원 · 차시"] || o["학습 목표"] || "") + "</span></button>";
      }).join("") + "</div>" + (LP.found.total > LP.found.list.length ? '<p class="muted">' + LP.found.total + "개 중 최근 " + LP.found.list.length + "개만 보여요</p>" : "") : '<p class="muted">찾는 수업계획이 없어요</p>') : "") + "</div>";
    return h;
  }
  function lpDraft(el) {
    if (!LP.sel) return; var d = LP.drafts[LP.sel] || (LP.drafts[LP.sel] = {});
    document.querySelectorAll("[data-lpf]").forEach(function (x) { d[x.dataset.lpf] = x.value; });
  }
  $("dbody").addEventListener("input", function (e) { if (e.target.dataset && e.target.dataset.lpf) lpDraft(e.target); });
  $("dbody").addEventListener("keydown", function (e) { if (e.target.id === "lpQ" && e.key === "Enter" && !e.isComposing) $("lpFind").click(); });
  $("dbody").addEventListener("click", function (e) {
    var t = e.target.closest("button"); if (!t) return;
    if (t.dataset.lpgo) { var g = t.dataset.lpgo.split("|"); LP.mon = monOf(g[0]); LP.sel = t.dataset.lpgo; DTAB = "lesson"; drawDrawer(); setTimeout(function () { var ed = document.querySelector(".lp-ed"); if (ed) ed.scrollIntoView({ behavior: "smooth", block: "start" }); }, 80); return; }
    if (t.dataset.lpc) { LP.sel = t.dataset.lpc; drawDrawer(); setTimeout(function () { var ed = document.querySelector(".lp-ed"); if (ed) { ed.scrollIntoView({ behavior: "smooth", block: "nearest" }); var f = ed.querySelector('[data-lpf="단원 · 차시"]'); if (f && !f.value) f.focus(); } }, 60); return; }
    if (t.dataset.lpw != null) { var w = Number(t.dataset.lpw); LP.mon = w ? ymdAdd(LP.mon, w) : monOf(D.today); drawDrawer(); return; }
    if (t.id === "lpUndo") { delete LP.drafts[LP.sel]; drawDrawer(); return; }
    if (t.id === "lpFind") {
      LP.q = $("lpQ").value.trim(); t.disabled = true;
      google.script.run.withSuccessHandler(function (r) { LP.found = r; drawDrawer(); }).withFailureHandler(function (er) { t.disabled = false; fail(er); }).lessonFind(CODE, TPW, LP.q);
      return;
    }
    if (t.id === "lpSave" || t.id === "lpDel") {
      var sp = LP.sel.split("|"), ymd = sp[0], pn = Number(sp[1]), mon = monOf(ymd), wk = LP.weeks[mon];
      if (t.id === "lpDel") {
        if (!t.classList.contains("sure")) { t.classList.add("sure"); t.textContent = "한 번 더 누르면 지워요"; setTimeout(function () { if (t.isConnected) { t.classList.remove("sure"); t.textContent = "이 계획 지우기"; } }, 4000); return; }
        write("lessonDel", [TPW, ymd, pn], { busy: "수업계획 지우는 중", msg: "수업계획을 지웠어요", mut: function () { if (wk) wk.plans = wk.plans.filter(function (p) { return !(p.d === ymd && Number(p.n) === pn); }); delete LP.drafts[LP.sel]; LP.found = null; } });
        drawDrawer(); return;
      }
      var data = {}; document.querySelectorAll("[data-lpf]").forEach(function (x) { data[x.dataset.lpf] = x.value.trim(); });
      if (!LPF.slice(1).some(function (f) { return data[f[0]]; })) { toast("단원 · 목표 · 계획 중 하나는 적어 주세요"); return; }
      write("lessonSave", [TPW, ymd, pn, data], { busy: "수업계획 저장 중", msg: mdText(ymd) + " " + pn + "교시 계획을 저장했어요",
        mut: function () {
          if (wk) { wk.plans = wk.plans.filter(function (p) { return !(p.d === ymd && Number(p.n) === pn); }); var o = { d: ymd, n: pn, at: nowStamp() }; LPF.forEach(function (f) { o[f[0]] = data[f[0]] || ""; }); wk.plans.push(o); }
          delete LP.drafts[ymd + "|" + pn]; LP.found = null;
        },
        after: function (r) { if (wk && r && r.at) { var p = lpPlan(wk, ymd, pn); if (p) p.at = r.at; } } });
      drawDrawer(); return;
    }
    if (t.id === "lpPrint") lessonPrint();
  });
  function lessonPrint() {
    var wk = LP.weeks[LP.mon]; if (!wk) return;
    var rows = [];
    wk.days.forEach(function (d) { d.periods.forEach(function (p) { var pl = lpPlan(wk, d.ymd, p.n); if (pl || p.subj) rows.push([d, p, pl]); }); });
    wk.plans.forEach(function (pl) { if (!rows.some(function (r) { return r[0].ymd === pl.d && r[1].n === Number(pl.n); })) { var d = wk.days.filter(function (x) { return x.ymd === pl.d; })[0]; if (d) rows.push([d, { n: Number(pl.n), subj: "" }, pl]); } });
    rows.sort(function (a, b) { return a[0].ymd < b[0].ymd ? -1 : a[0].ymd > b[0].ymd ? 1 : a[1].n - b[1].n; });
    var br = function (x) { return esc(x || "").replace(/\n/g, "<br>"); };
    var html = '<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>수업계획 ' + LP.mon + '</title><style>body{font-family:"Pretendard","Malgun Gothic",sans-serif;margin:18mm 12mm;color:#222;font-size:11pt}h1{font-size:16pt;margin:0 0 10px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #999;padding:5px 7px;vertical-align:top;text-align:left}th{background:#f1eef8;white-space:nowrap}td.c{white-space:nowrap;text-align:center}tr{page-break-inside:avoid}.m{color:#888}@page{size:A4 landscape}</style></head><body>' +
      "<h1>" + esc((D.settings["학급 닉네임"] || "우리반") + " 수업계획 · " + LP.mon + " 주") + "</h1><table><tr><th>날짜</th><th>교시</th><th>과목</th><th>단원 · 차시</th><th>학습 목표</th><th>수업 계획</th><th>활동 계획</th><th>준비물</th></tr>" +
      rows.map(function (r) { var pl = r[2] || {}; return '<tr><td class="c">' + r[0].wd + " " + lpMd(r[0].ymd) + '</td><td class="c">' + r[1].n + '</td><td class="c">' + esc(pl["과목"] || r[1].subj) + "</td><td>" + br(pl["단원 · 차시"]) + "</td><td>" + br(pl["학습 목표"]) + "</td><td>" + br(pl["수업 계획"]) + "</td><td>" + br(pl["활동 계획"]) + "</td><td>" + br(pl["준비물"]) + "</td></tr>"; }).join("") +
      "</table></body></html>";
    var w = window.open("", "_blank"); if (!w) { toast("새 창이 막혔어요. 팝업을 허용해 주세요"); return; }
    w.document.write(html); w.document.close(); setTimeout(function () { w.focus(); w.print(); }, 300);
  }

  // ── 알림장: 칠판 카드(오늘 것) + 크게 보기 + 서랍 '알림장' 탭에서 날짜별로 쓰기 ──
  // 꾸밈 표시: [[y:글자]] 노랑 · [[p:]] 분홍 · [[b:]] 하늘 · [[h:]] 형광펜 · [[u:]] 밑줄 · [[o:]] 동그라미 (겹쳐 쓰면 [[y,h:글자]])
  function ntFmt(line) { return esc(line).replace(/\[\[([ypbhuo](?:,[ypbhuo])*):(.*?)\]\]/g, function (m, k, t) { return '<span class="' + k.split(",").map(function (x) { return "nk-" + x; }).join(" ") + '">' + t + "</span>"; }); }
  function ntPlain(line) { return String(line).replace(/\[\[[ypbhuo,]+:(.*?)\]\]/g, "$1"); }
  function ntLines(t) { return String(t || "").split("\n").map(function (x) { return x.replace(/^\s*(\d+[.)]|[①-⑳]|[-•·])\s*/, "").trim(); }).filter(String); }
  function drawNotice() {
    if (!$("noticeList")) return;
    var n = D.notice, li = n ? ntLines(n.text) : [];
    $("noticeDay").textContent = mdText(D.today).replace(/^\d+월 /, "");
    $("noticeList").innerHTML = li.length ? li.map(function (x) { return "<li>" + ntFmt(x) + "</li>"; }).join("") : '<li class="mempty">오늘 알림장이 아직 없어요</li>';
    if ($("noticeBig").classList.contains("on")) noticeBigDraw();
  }
  function noticeBigDraw() {
    if (NTE.on) return;
    var li = D.notice ? ntLines(D.notice.text) : [];
    $("ntbTitle").textContent = mdText(D.today) + " 알림장";
    $("ntbList").innerHTML = li.length ? li.map(function (x) { return "<li>" + ntFmt(x) + "</li>"; }).join("") : '<li style="list-style:none">오늘 알림장이 아직 없어요</li>';
  }
  $("noticeCard").addEventListener("click", function (e) { if (EDIT || e.target.closest(".tools") || !D) return; ntFontsLoad(); noticeBigDraw(); $("noticeBig").classList.add("on"); });
  $("noticeCard").addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && !EDIT) { e.preventDefault(); $("noticeCard").click(); } });
  // 칠판 크게 보기에서 바로 쓰기 (선생님 모드에서만). 쓰는 대로 칠판에 보이고, 손을 멈추면 저절로 저장
  var NTE = { on: false, t: null, last: "" };
  function ntBigClose() { if (NTE.on) ntEditOff(); $("noticeBig").classList.remove("on"); }
  function ntKinds(el) { var k = []; for (var n = el; n && n.id !== "ntbList"; n = n.parentNode) if (n.dataset && n.dataset.nk) n.dataset.nk.split(",").forEach(function (x) { if (k.indexOf(x) < 0) k.push(x); }); return k.sort(); }
  function ntLineOf(li) {
    var out = [], walk = function (node) {
      node.childNodes.forEach(function (c) {
        if (c.nodeType === 3) { var t = c.nodeValue.replace(/\[\[|\]\]/g, ""); if (!t) return; var k = ntKinds(c.parentNode), last = out[out.length - 1]; if (last && last.k === k.join(",")) last.t += t; else out.push({ k: k.join(","), t: t }); }
        else if (c.nodeType === 1 && c.tagName !== "BR") walk(c);
      });
    };
    walk(li);
    return out.map(function (o) { return o.k ? "[[" + o.k + ":" + o.t + "]]" : o.t; }).join("").replace(/\s+$/, "");
  }
  function ntText() {
    var ol = $("ntbList"), lis = ol.querySelectorAll(":scope > li");
    var lines = lis.length ? [].map.call(lis, ntLineOf) : ol.innerText.split("\n");
    return lines.map(function (x) { return x.replace(/^\s*(\d+[.)]|[①-⑳]|[-•·])\s*/, "").trim(); }).filter(function (x) { return ntPlain(x).trim(); }).join("\n");
  }
  // 고른 글자에 분필 색 · 형광펜 · 밑줄 · 동그라미 (줄이 여러 개여도 줄마다)
  function ntApply(k) {
    var ol = $("ntbList"), sel = getSelection();
    if (!sel.rangeCount || sel.isCollapsed || !ol.contains(sel.anchorNode)) { toast("꾸밀 글자를 먼저 끌어서 골라 주세요"); return; }
    var R = sel.getRangeAt(0), made = [];
    var COL = ["y", "p", "b"];
    ol.querySelectorAll(":scope > li").forEach(function (li) {
      if (!R.intersectsNode(li)) return;
      var r = document.createRange(); r.selectNodeContents(li);
      if (li.contains(R.startContainer)) r.setStart(R.startContainer, R.startOffset);
      if (li.contains(R.endContainer)) r.setEnd(R.endContainer, R.endOffset);
      if (r.collapsed) return;
      // 고른 부분의 글자 조각마다 지금 꾸밈을 읽어 새 꾸밈을 더하거나 빼서 다시 감싼다
      var spanOf = function (n) { var e = n.nodeType === 3 ? n.parentNode : n; return e && e.closest && li.contains(e) ? e.closest("span[data-nk]") : null; };
      var hs = spanOf(r.startContainer), he = spanOf(r.endContainer), inherit = hs && hs === he ? ntKinds(hs) : [];
      var frag = r.extractContents(), pieces = [];
      (function walk(node, inh) {
        node.childNodes.forEach(function (c) {
          var kk = inh.slice(); if (c.nodeType === 1 && c.dataset && c.dataset.nk) c.dataset.nk.split(",").forEach(function (x) { if (kk.indexOf(x) < 0) kk.push(x); });
          if (c.nodeType === 3) { if (c.nodeValue) pieces.push({ t: c.nodeValue, k: kk }); } else if (c.nodeType === 1 && c.tagName !== "BR") walk(c, kk);
        });
      })(frag, inherit);
      var all = pieces.length && pieces.every(function (pc) { return pc.k.indexOf(k) >= 0; });
      var out = document.createDocumentFragment();
      pieces.forEach(function (pc) {
        var kk = pc.k.slice();
        if (k === "x") kk = [];
        else if (k === "w") kk = kk.filter(function (x) { return COL.indexOf(x) < 0; });
        else if (all) kk = kk.filter(function (x) { return x !== k; });
        else { if (COL.indexOf(k) >= 0) kk = kk.filter(function (x) { return COL.indexOf(x) < 0; }); if (kk.indexOf(k) < 0) kk.push(k); }
        kk.sort();
        var tn = document.createTextNode(pc.t);
        if (!kk.length) { out.appendChild(tn); made.push(tn); return; }
        var sp = document.createElement("span"); sp.dataset.nk = kk.join(","); sp.className = kk.map(function (x) { return "nk-" + x; }).join(" "); sp.appendChild(tn); out.appendChild(sp); made.push(sp);
      });
      // 넣을 자리가 꾸밈 span 안이면 그 span을 둘로 쪼개고 사이에 넣는다
      var host = spanOf(r.startContainer);
      if (host) {
        var rest = document.createRange(); rest.setStart(r.startContainer, r.startOffset); rest.setEnd(host, host.childNodes.length);
        var after = host.cloneNode(false); after.appendChild(rest.extractContents());
        host.parentNode.insertBefore(after, host.nextSibling);
        host.parentNode.insertBefore(out, after);
      } else r.insertNode(out);
      li.querySelectorAll("span[data-nk]").forEach(function (x) { if (!x.textContent) x.remove(); });
    });
    if (made.length) { var nr = document.createRange(); nr.setStartBefore(made[0]); nr.setEndAfter(made[made.length - 1]); sel.removeAllRanges(); sel.addRange(nr); }
    $("ntbList").dispatchEvent(new Event("input"));
  }
  // 글씨 크기 · 글씨체 (이 컴퓨터에 기억)
  var NTFONTS = [   // [id, 이름, 글꼴, 크기 보정, 굵기]
    ["gaegu", "분필 글씨", "Gaegu", 1, "700"], ["pen", "나눔손글씨 펜", "Nanum Pen Script", 1.22, "400"], ["jua", "또박또박 (주아)", "Jua", 1, "400"],
    ["gamja", "감자꽃", "Gamja Flower", 1.05, "400"], ["melody", "하이멜로디", "Hi Melody", 1.12, "400"], ["story", "푸어스토리", "Poor Story", 1, "400"],
    ["single", "싱글데이", "Single Day", 1.05, "400"], ["dongle", "동글", "Dongle", 1.45, "700"], ["yeon", "연성", "Yeon Sung", 1, "400"],
    ["dokdo", "동해독도 (붓글씨)", "East Sea Dokdo", 1.3, "400"], ["dohyeon", "도현 (굵게)", "Do Hyeon", 1, "400"], ["gowun", "고운돋움", "Gowun Dodum", 1, "400"]];
  var NTS = Number(ls("classdesk-ntsize")) || 1, NTF = ls("classdesk-ntfont") || "gaegu", NTFL = false;
  function ntFontsLoad() {
    if (NTFL) return; NTFL = true;
    var l = document.createElement("link"); l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?" + NTFONTS.filter(function (f) { return f[2] !== "Jua"; }).map(function (f) { return "family=" + f[2].replace(/ /g, "+") + (f[2] === "Gaegu" || f[2] === "Dongle" ? ":wght@400;700" : ""); }).join("&") + "&display=swap";
    document.head.appendChild(l);
  }
  function ntView() {
    var f = NTFONTS.filter(function (x) { return x[0] === NTF; })[0] || NTFONTS[0], b = $("cbBoard");
    b.style.setProperty("--nts", NTS); b.style.setProperty("--ntf", "'" + f[2] + "'"); b.style.setProperty("--ntz", f[3]);
    $("ntbList").style.fontWeight = f[4]; $("ntbTitle").style.fontWeight = f[4];
  }
  ntView();
  $("ntSmaller").onclick = function () { NTS = Math.max(0.6, Math.round((NTS - 0.1) * 10) / 10); ls("classdesk-ntsize", String(NTS)); ntView(); };
  $("ntBigger").onclick = function () { NTS = Math.min(2.2, Math.round((NTS + 0.1) * 10) / 10); ls("classdesk-ntsize", String(NTS)); ntView(); };
  $("ntFont").onclick = function (e) {
    e.stopPropagation(); ntFontsLoad();
    var box = $("ntFonts");
    if (box.classList.contains("on")) { box.classList.remove("on"); return; }
    box.innerHTML = NTFONTS.map(function (f) { return '<button class="' + (f[0] === NTF ? "on" : "") + '" data-ntf="' + f[0] + '"><b style="font-family:\'' + f[2] + '\'; font-weight:' + f[4] + "; font-size:" + Math.round(26 * f[3]) + 'px">내일 준비물 123</b><small>' + f[1] + "</small></button>"; }).join("");
    box.classList.add("on");
  };
  $("ntFonts").addEventListener("mousedown", function (e) { e.preventDefault(); });
  $("ntFonts").addEventListener("click", function (e) {
    var b = e.target.closest("[data-ntf]"); if (!b) return; e.stopPropagation();
    NTF = b.dataset.ntf; ls("classdesk-ntfont", NTF); ntView();
    $("ntFonts").querySelectorAll("button").forEach(function (x) { x.classList.toggle("on", x === b); });
  });
  document.addEventListener("click", function (e) { if (!e.target.closest("#ntFonts") && e.target.id !== "ntFont") $("ntFonts").classList.remove("on"); });
  $("cbTray").addEventListener("pointerdown", function (e) { if (e.target.closest("button")) e.preventDefault(); });
  $("cbTray").addEventListener("mousedown", function (e) { if (e.target.closest("button")) e.preventDefault(); });
  $("cbTray").addEventListener("click", function (e) {
    var b = e.target.closest("[data-nk]"); if (!b) return;
    if (!NTE.on) { toast("✏️ 쓰기를 누른 뒤에 쓸 수 있어요"); return; }
    ntApply(b.dataset.nk);
  });
  function ntEditOn() {
    if (!D) return;
    if (!TPW) { TGO = "notice"; $("tlock").classList.add("over-lock"); openModal("tlock"); setTimeout(function () { $("tpw").focus(); }, 60); return; }
    ntFontsLoad(); noticeBigDraw(); $("noticeBig").classList.add("on");
    NTE.on = true; NTE.last = D.notice ? ntLines(D.notice.text).join("\n") : "";
    var ol = $("ntbList");
    if (!NTE.last) ol.innerHTML = "<li><br></li>";
    ol.contentEditable = "true"; $("cbBoard").classList.add("editing"); $("ntEdit").hidden = true; $("ntDone").hidden = false; $("ntbHelp").hidden = false; $("ntbState").textContent = "";
    ol.focus();
    var r = document.createRange(); r.selectNodeContents(ol.lastElementChild || ol); r.collapse(false); var sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
  }
  function ntEditOff() {
    clearTimeout(NTE.t); ntAutoSave(true);
    NTE.on = false; $("ntbList").contentEditable = "false"; $("cbBoard").classList.remove("editing"); $("ntEdit").hidden = false; $("ntDone").hidden = true; $("ntbHelp").hidden = true;
    noticeBigDraw(); drawNotice();
  }
  function ntAutoSave(now) {
    if (!NTE.on || !TPW) return;
    var text = ntText(); if (text === NTE.last) { if (now) $("ntbState").textContent = ""; return; }
    NTE.last = text; var d = D.today;
    $("ntbState").textContent = "저장 중…";
    write("noticeSave", [TPW, d, text], {
      mut: function (dd) { dd.notice = text ? { d: d, text: text } : null; if (typeof NT !== "undefined" && NT.months) delete NT.months[d.slice(0, 7)]; },
      after: function () { $("ntbState").textContent = "저장됨 " + hm(new Date()); try { if (TW && !TW.closed && TW.NT) { TW.NT.months = {}; if (TW.DTAB === "notice") TW.drawDrawer(); } } catch (x) {} } });
  }
  $("ntbList").addEventListener("input", function () { if (!NTE.on) return; poke(); $("ntbState").textContent = "쓰는 중…"; clearTimeout(NTE.t); NTE.t = setTimeout(ntAutoSave, 1800); });
  $("ntbList").addEventListener("paste", function (e) { if (!NTE.on) return; e.preventDefault(); var t = (e.clipboardData || window.clipboardData).getData("text/plain"); document.execCommand("insertText", false, t); });
  $("ntbList").addEventListener("keydown", function (e) { if (NTE.on && !$("ntbList").querySelector("li")) { $("ntbList").innerHTML = "<li><br></li>"; } });
  $("ntEdit").onclick = ntEditOn;
  $("ntDone").onclick = function () { ntEditOff(); toast("알림장을 저장했어요"); };
  $("ntClose").onclick = ntBigClose;
  $("noticeBig").addEventListener("click", function (e) { if (e.target === $("noticeBig") && !NTE.on) ntBigClose(); });
  addEventListener("keydown", function (e) { if (e.key === "Escape" && $("noticeBig").classList.contains("on")) ntBigClose(); });

  var NT = { d: "", months: {}, loading: {}, drafts: {} };
  function ntNextDay(ymd) { var x = ymdAdd(ymd, 1), w = new Date(x + "T12:00:00").getDay(); return w === 6 ? ymdAdd(x, 2) : w === 0 ? ymdAdd(x, 1) : x; }
  function ntLoad(m, force) {
    if (NT.loading[m] || (NT.months[m] && !force)) return; NT.loading[m] = 1;
    google.script.run.withSuccessHandler(function (r) { delete NT.loading[m]; NT.months[m] = r.list || []; if (DTAB === "notice") drawDrawer(); })
      .withFailureHandler(function (e) { delete NT.loading[m]; fail(e); }).noticeList(CODE, TPW, m);
  }
  function ntFind(ymd) { return (NT.months[ymd.slice(0, 7)] || []).filter(function (x) { return x.d === ymd; })[0] || null; }
  function noticePane() {
    if (!NT.d) NT.d = D.today;
    var m = NT.d.slice(0, 7);
    if (!NT.months[m]) { ntLoad(m); return '<p class="muted">알림장을 가져오는 중...</p>'; }
    var cur = ntFind(NT.d), dr = NT.drafts[NT.d], val = dr != null ? dr : cur ? cur.text : "", nx = ntNextDay(D.today);
    var h = '<div class="dsec"><h4>' + ico("list") + mdText(NT.d) + ' 알림장' + (NT.d === D.today ? ' <span class="muted" style="font-weight:600">· 오늘 칠판에 보여요</span>' : "") +
      (cur && cur.at ? '<span class="muted" style="margin-left:auto; font-weight:600; font-size:12px">저장 ' + esc(String(cur.at).slice(5)) + "</span>" : "") + "</h4>" +
      '<div class="nt-days"><button class="chip' + (NT.d === D.today ? " on" : "") + '" data-ntd="' + D.today + '">오늘</button><button class="chip' + (NT.d === nx ? " on" : "") + '" data-ntd="' + nx + '">다음 날 (' + mdText(nx).replace(/^\d+월 /, "") + ')</button>' +
      '<input class="field" type="date" id="ntDate" value="' + NT.d + '"></div>' +
      '<textarea class="field" id="ntText" maxlength="1500" placeholder="한 줄에 하나씩 적어요. 번호는 저절로 붙어요. ([[y:글자]]처럼 보이는 건 칠판에서 넣은 꾸밈이에요)\n예)\n수학 익힘책 54~55쪽\n내일 체육복 입고 오기\n가정통신문(현장체험학습) 회신">' + esc(val) + "</textarea>" +
      '<div class="frow" style="margin-top:8px"><button class="btn" id="ntSave">저장</button>' + (dr != null ? '<button class="btn ghost" id="ntUndo">고친 것 버리기</button>' : "") +
      (NT.d === D.today ? '<button class="btn ghost" id="ntBig">칠판에 크게 띄우기</button>' : "") + (cur ? '<button class="btn ghost" id="ntDel" style="margin-left:auto">이 날 알림장 지우기</button>' : "") + "</div></div>";
    var list = NT.months[m];
    h += '<div class="dsec"><h4>' + ico("cal") + Number(m.slice(5)) + "월 알림장" + '<span class="lp-nav"><button class="btn ghost sm" data-ntm="-1">◀ 지난달</button><button class="btn ghost sm" data-ntm="1">다음 달 ▶</button></span></h4>' +
      (list.length ? '<div class="nt-old">' + list.map(function (x) {
        return '<button data-ntd="' + x.d + '"' + (x.d === NT.d ? ' class="sel"' : "") + "><b>" + esc(mdText(x.d).replace(/^\d+월 /, "")) + "</b><span>" + ntLines(x.text).map(function (l, i) { return (i + 1) + ". " + ntFmt(l); }).join("<br>") + "</span></button>";
      }).join("") + "</div>" : '<p class="muted">이 달에 적은 알림장이 없어요</p>') + "</div>";
    return h;
  }
  $("dbody").addEventListener("input", function (e) { if (e.target.id === "ntText") NT.drafts[NT.d] = e.target.value; });
  $("dbody").addEventListener("change", function (e) { if (e.target.id === "ntDate" && /^\d{4}-\d{2}-\d{2}$/.test(e.target.value)) { NT.d = e.target.value; drawDrawer(); } });
  $("dbody").addEventListener("click", function (e) {
    var t = e.target.closest("button"); if (!t || DTAB !== "notice") return;
    if (t.dataset.ntd) { NT.d = t.dataset.ntd; drawDrawer(); return; }
    if (t.dataset.ntm) { var a = new Date(NT.d.slice(0, 7) + "-15T12:00:00"); a.setMonth(a.getMonth() + Number(t.dataset.ntm)); NT.d = a.getFullYear() + "-" + pad(a.getMonth() + 1) + "-01"; drawDrawer(); return; }
    if (t.id === "ntUndo") { delete NT.drafts[NT.d]; drawDrawer(); return; }
    if (t.id === "ntBig") { try { if (TOP && !TOP.closed) { TOP.ntFontsLoad(); TOP.noticeBigDraw(); TOP.$("noticeBig").classList.add("on"); toast("칠판에 알림장을 크게 띄웠어요"); return; } } catch (x) {} noticeBigDraw(); $("noticeBig").classList.add("on"); return; }
    if (t.id === "ntSave" || t.id === "ntDel") {
      var d = NT.d, m = d.slice(0, 7), text = t.id === "ntDel" ? "" : ntLines($("ntText").value).join("\n");
      if (t.id === "ntDel" && !t.classList.contains("sure")) { t.classList.add("sure"); t.textContent = "한 번 더 누르면 지워요"; setTimeout(function () { if (t.isConnected) { t.classList.remove("sure"); t.textContent = "이 날 알림장 지우기"; } }, 4000); return; }
      if (t.id === "ntSave" && !text && !ntFind(d)) { toast("알림장 내용을 먼저 적어 주세요"); $("ntText").focus(); return; }
      write("noticeSave", [TPW, d, text], { busy: text ? "알림장 저장 중" : "알림장 지우는 중", msg: text ? mdText(d) + " 알림장을 저장했어요" + (d === D.today ? " · 칠판에 보여요" : "") : "알림장을 지웠어요",
        mut: function (dd) {
          var l = (NT.months[m] || []).filter(function (x) { return x.d !== d; }); if (text) l.push({ d: d, text: text, at: nowStamp() }); l.sort(function (a, b) { return a.d < b.d ? 1 : -1; }); NT.months[m] = l;
          if (d === dd.today) dd.notice = text ? { d: d, text: text } : null; delete NT.drafts[d];
        } });
      drawDrawer(); return;
    }
  });

  // ── 선생님 서랍 > 온도계: 자동 규칙 · 보상 단계 고치기 ──
  var THE = null;   // 고치는 중인 값
  function thermoPane() {
    var T = D.thermo, R = T.rules || { noName: 5, cut: "14:30", rolePct: 80, role: 5 };
    if (!THE) THE = { noName: R.noName, cut: R.cut, rolePct: R.rolePct, role: R.role, rewards: (T.rewards || []).map(function (x) { return { at: x.at, name: x.name }; }) };
    var E = THE, w = T.week || {};
    var rows = E.rewards.map(function (r, i) {
      return '<div class="frow thr-row"><input class="field num" type="number" min="1" max="999" data-thr="at" data-i="' + i + '" value="' + esc(r.at) + '" style="width:84px"><span class="muted">도</span>' +
        '<input class="field" data-thr="name" data-i="' + i + '" maxlength="30" value="' + esc(r.name) + '" placeholder="보상 이름" style="flex:1">' +
        (T.total >= r.at ? '<span class="thr-ok">' + ico("check") + "받음</span>" : "") + '<button class="btn ghost sm" data-thrdel="' + i + '" aria-label="이 보상 빼기">×</button></div>';
    }).join("");
    return '<div class="dsec"><h4>' + ico("thermo") + '지금 ' + T.total + '도</h4><p class="muted">아래 규칙대로 저절로 오르고, 칠판 온도계의 +1 · +3 단추로 직접 올릴 수도 있어요.</p></div>' +
      '<div class="dsec"><h4>' + ico("spark") + '저절로 오르는 규칙</h4>' +
      '<div class="thr-rule"><b>수업방해 없는 날</b><span>번호판 <b>수업방해</b>에 그날 한 명도 선택하지 않으면</span><span class="frow"><input class="field num" type="number" min="0" max="50" id="thNo" value="' + E.noName + '" style="width:70px"><span>도 오르기</span></span>' +
      '<span class="frow"><span class="muted">하루 정산 시각</span><input class="field num" type="time" id="thCut" value="' + esc(E.cut) + '" style="width:120px"></span></div>' +
      '<div class="thr-rule"><b>1인 1역 주간</b><span>한 주(월~금) 1인 1역 다 한 비율이</span><span class="frow"><input class="field num" type="number" min="1" max="100" id="thPct" value="' + E.rolePct + '" style="width:70px"><span>% 이상이면</span><input class="field num" type="number" min="0" max="50" id="thRole" value="' + E.role + '" style="width:70px"><span>도 오르기</span></span>' +
      '<span class="muted">이번 주 지금까지 ' + (w.days ? w.pct + "% (" + w.days + "일)" : "기록 없음") + " · 금요일 정산 시각에 반영돼요</span></div>" +
      '<p class="muted" style="margin-top:6px">0으로 적으면 그 규칙은 꺼져요. 번호판 기록이 하나도 없는 날(쉬는 날)은 세지 않아요. 정산 뒤에 수업방해를 선택하면 그날 오른 온도는 다시 내려가요.</p></div>' +
      nameLogHTML() +
      '<div class="dsec"><h4>' + ico("trophy") + '보상 단계</h4>' + rows +
      '<div class="frow" style="margin-top:6px"><button class="btn ghost sm" id="thrAdd">+ 보상 더하기</button><span class="muted">가장 높은 보상 온도가 온도계 끝(목표)이 돼요</span></div></div>' +
      '<div class="frow"><button class="btn" id="thrSave">규칙 · 보상 저장</button><button class="btn ghost" id="thrUndo">고친 것 버리기</button><button class="btn ghost" id="thReset" style="margin-left:auto">온도계 0도로 새 출발</button></div>';
  }
  $("dbody").addEventListener("input", function (e) {
    if (DTAB !== "thermo" || !THE) return; var t = e.target;
    if (t.dataset.thr) { var r = THE.rewards[Number(t.dataset.i)]; if (r) r[t.dataset.thr] = t.dataset.thr === "at" ? Number(t.value) : t.value; return; }
    if (t.id === "thNo") THE.noName = Number(t.value); if (t.id === "thCut") THE.cut = t.value; if (t.id === "thPct") THE.rolePct = Number(t.value); if (t.id === "thRole") THE.role = Number(t.value);
  });
  $("dbody").addEventListener("click", function (e) {
    if (DTAB !== "thermo") return; var t = e.target.closest("button"); if (!t) return;
    if (t.dataset.thrdel != null) { THE.rewards.splice(Number(t.dataset.thrdel), 1); drawDrawer(); return; }
    if (t.id === "thrAdd") { var last = THE.rewards[THE.rewards.length - 1]; THE.rewards.push({ at: (last ? last.at : 0) + 25, name: "" }); drawDrawer(); var ins = document.querySelectorAll('[data-thr="name"]'); if (ins.length) ins[ins.length - 1].focus(); return; }
    if (t.id === "thrUndo") { THE = null; drawDrawer(); return; }
    if (t.id === "thrSave") {
      var rw = THE.rewards.filter(function (r) { return r.at > 0 && String(r.name).trim(); }).sort(function (a, b) { return a.at - b.at; });
      if (!rw.length) { toast("보상을 한 개 이상 적어 주세요"); return; }
      if (!/^\d{1,2}:\d{2}$/.test(THE.cut)) { toast("정산 시각을 골라 주세요"); return; }
      var o = { noName: THE.noName || 0, cut: THE.cut, rolePct: THE.rolePct || 80, role: THE.role || 0, rewards: rw };
      write("thermoRulesSave", [TPW, o], { busy: "온도계 규칙 저장 중", msg: "온도계 규칙 · 보상을 저장했어요",
        mut: function (d) { d.thermo.rewards = rw.map(function (r) { return { at: r.at, name: String(r.name).trim() }; }); d.thermo.goal = rw[rw.length - 1].at; d.thermo.rules = { noName: o.noName, cut: o.cut, rolePct: o.rolePct, role: o.role }; if (d.thermo.week) d.thermo.week.need = o.rolePct; THE = null; } });
      drawDrawer(); return;
    }
  });


  // 서랍 > 온도계: 그날 수업방해 기록 (취소해도 남아 있음 · 실수만 지우기)
  var NL = { d: "", data: null, loading: false };
  function nameLogLoad(force) {
    if (NL.loading || (NL.data && NL.data.d === NL.d && !force)) return; NL.loading = true;
    google.script.run.withSuccessHandler(function (r) { NL.loading = false; NL.data = r; if (DTAB === "thermo") drawDrawer(); }).withFailureHandler(function (e) { NL.loading = false; fail(e); }).nameList(CODE, TPW, NL.d);
  }
  function nameLogHTML() {
    if (!NL.d) NL.d = D.today;
    var head = '<div class="dsec"><h4>' + ico("x") + mdText(NL.d) + ' 수업방해 기록<span class="lp-nav"><button class="btn ghost sm" data-nld="-1">◀</button>' + (NL.d !== D.today ? '<button class="btn ghost sm" data-nld="0">오늘</button>' : "") + '<button class="btn ghost sm" data-nld="1">▶</button></span></h4>';
    if (!NL.data || NL.data.d !== NL.d) { nameLogLoad(); return head + '<p class="muted">가져오는 중...</p></div>'; }
    var L = NL.data.list;
    return head + (L.length ? '<div class="nl-list">' + L.map(function (x) {
      return '<div class="nl-row' + (x.off ? " off" : "") + '"><span class="num">' + esc(x.t) + "</span><b>" + esc(x.label || "") + "</b><span>" + x.no + "번 " + esc(x.name || "") + "</span><em>" + (x.off ? "리셋됨" : "지금 선택") + '</em><button class="btn ghost sm" data-nldel="' + esc(x.at) + '|' + x.no + '">기록 지우기</button></div>';
    }).join("") + '</div><p class="muted" style="margin-top:6px">번호판에서 다시 누르면 기록도 지워져요. 교시가 끝나 저절로 리셋된 기록은 남아 있으니, 잘못 남은 기록은 여기서 [기록 지우기]로 지워 주세요. 기록이 하나라도 있으면 그날은 온도계가 오르지 않아요.</p>' : '<p class="muted">이날은 수업방해 기록이 없어요</p>') + "</div>";
  }
  $("dbody").addEventListener("click", function (e) {
    if (DTAB !== "thermo") return; var t = e.target.closest("button"); if (!t) return;
    if (t.dataset.nld != null) { var n = Number(t.dataset.nld); NL.d = n ? ymdAdd(NL.d, n) : D.today; NL.data = null; drawDrawer(); return; }
    if (t.dataset.nldel) {
      if (!t.classList.contains("sure")) { t.classList.add("sure"); t.textContent = "한 번 더"; setTimeout(function () { if (t.isConnected) { t.classList.remove("sure"); t.textContent = "기록 지우기"; } }, 4000); return; }
      var a = t.dataset.nldel.split("|");
      write("nameDel", [TPW, a[0], Number(a[1])], { busy: "기록 지우는 중", msg: "수업방해 기록을 지웠어요",
        mut: function (d) { if (NL.data) NL.data.list = NL.data.list.filter(function (x) { return !(String(x.at) === a[0] && x.no === Number(a[1])); }); if (NL.d === d.today) { d.marks.nameDay = Math.max(0, (d.marks.nameDay || 1) - 1); } },
        after: function () { NL.data = null; nameLogLoad(true); try { if (TOP && !TOP.closed) { TOP.DESKAPP.refresh(); setTimeout(function () { try { TOP.thermoTick(true); } catch (y) {} }, 1500); } } catch (x) {} } });
      drawDrawer(); return;
    }
  });


  // ── 아침 온도계 소식: 평일 아침 8시(그 뒤 처음 켤 때)에 어제 결과를 크게 보여 준다 ──
  var MORN_MSG = "";
  function morningCheck(force) {
    if (!D || TWIN) return;
    var now = new Date(), m = now.getHours() * 60 + now.getMinutes(), wd = now.getDay();
    if (!force && (wd === 0 || wd === 6 || m < 8 * 60 || m >= 13 * 60 || ls("classdesk-morning") === D.today)) return;
    ls("classdesk-morning", D.today);
    thermoTick(true);
    setTimeout(function () { call("morningReport", [], showMorning, true); }, 1500);
  }
  function showMorning(r) {
    if (!r || !r.day) return;
    var when = r.yesterday ? "어제" : "지난 " + r.wd + "요일", items = [], speak = [];
    if (r.noName) {
      if (!r.disrupt && r.award > 0) { items.push(["up", "🌟", when + " 수업방해가 없어서 <b>" + r.award + "도</b> 올랐어요!"]); speak.push(when + " 수업방해가 없어서 학급 온도계가 " + r.award + "도 올랐습니다."); }
      else if (r.disrupt) { items.push(["", "💪", (r.yesterday ? "어제는" : when + "은") + " 수업방해가 <b>" + r.disrupt + "번</b> 있어서 온도계가 오르지 않았어요. 오늘은 0번에 도전!"]); speak.push((r.yesterday ? "어제는" : when + "은") + " 수업방해가 " + r.disrupt + "번 있어서 온도계가 오르지 않았습니다. 오늘은 0번에 도전해 봐요."); }
    }
    r.weekly.forEach(function (w) { var pc = (/(\d+)%/.exec(w.why) || [])[1]; items.push(["up", "🧹", "1인 1역을 " + (pc ? pc + "%" : "") + " 해내서 <b>" + w.d + "도</b> 올랐어요!"]); speak.push("한 주 동안 1인 1역을 " + (pc ? pc + "퍼센트 " : "") + "해내서 " + w.d + "도 올랐습니다."); });
    if (r.manual > 0) { items.push(["up", "👏", when + " 칭찬으로 <b>" + r.manual + "도</b> 올랐어요"]); speak.push("칭찬으로 " + r.manual + "도 올랐습니다."); }
    r.got.forEach(function (g) { items.push(["gift", "🎁", "<b>" + g.at + "도 달성!</b> '" + esc(g.name) + "' 보상을 받아요!"]); speak.push(g.at + "도를 달성해서 " + g.name + " 보상을 받습니다!"); });
    if (!items.length) return;
    $("mornSub").textContent = mdText(D.today) + " · 학급 온도계 소식";
    $("mornList").innerHTML = items.map(function (x) { return '<li class="' + x[0] + '"><i>' + x[1] + "</i><span>" + x[2] + "</span></li>"; }).join("");
    $("mornTotal").textContent = r.total + "도";
    $("mornNext").textContent = r.next ? "'" + r.next.name + "'까지 " + (r.next.at - r.total) + "도" : "";
    MORN_MSG = "좋은 아침입니다. " + speak.join(" ") + " 지금 학급 온도계는 " + r.total + "도입니다." + (r.next ? " " + r.next.name + "까지 " + (r.next.at - r.total) + "도 남았습니다." : "");
    openModal("mornM");
    var p = center($("mornList")); if (items.some(function (x) { return x[0]; })) confetti(p[0], p[1], 40, ["#e76f7f", "#f4a261", "#e0b341", "#fff"]);
    if (chimeOn()) chime([659, 784, 988]);
  }
  $("mornSay").onclick = function () { say(MORN_MSG); };
  setInterval(function () { morningCheck(false); }, 30 * 1000);
  setTimeout(function () { morningCheck(false); }, 9000);

  // 온도계 자동 규칙: 바탕화면 창이 몇 분마다 서버에 정산을 부탁한다 (같은 날 · 같은 주는 한 번만 오름)
  var THAUTO = 0;
  function thermoTick(force) {
    if (!D || TWIN || (!force && Date.now() - THAUTO < 4 * 60 * 1000)) return; THAUTO = Date.now();
    var R = D.thermo && D.thermo.rules; if (R && !R.noName && !R.role) return;
    write("thermoAuto", [], { mut: function () {}, after: function (r) {
      if (!r || !r.added || !r.added.length) return;
      call("getAll", [], function () { syncState(); var tot = r.added.reduce(function (a, x) { return a + x.d; }, 0); toast("학급 온도계 +" + tot + "도 · " + r.added.map(function (x) { return x.why; }).join(", ")); var p = center($("tsvg")); confetti(p[0], p[1] - 40, 30, ["#e76f7f", "#f4a261", "#fff"]); }, true);
    } });
  }
  setTimeout(function () { thermoTick(true); }, 6000);
  setInterval(function () { thermoTick(false); }, 60 * 1000);

  function twinStart() {
    document.body.classList.add("twin");
    document.title = "선생님 서랍 · " + ((D && D.settings["학급 닉네임"]) || "우리반 바탕화면");
    var m = /[?&]tab=([^&]+)/.exec(location.search), tab = m ? decodeURIComponent(m[1]) : "today";
    if (!TPW) { openModal("tlock"); setTimeout(function () { $("tpw").focus(); }, 60); return; }
    teacherOn(); openDrawer(tab);
  }
  $("dtabs").addEventListener("click", function (e) { var b = e.target.closest("[data-dt]"); if (b) { DTAB = b.dataset.dt; drawDrawer(); $("dbody").scrollTop = 0; if (DTAB === "att") { closeDrawer(); openAtt(); } } });
  function drawDrawer() {
    $("dtabs").innerHTML = DTABS.map(function (t) { var c = DTC[t[0]] || DTC.set; return '<button class="chip' + (t[0] === DTAB ? " on" : "") + '" data-dt="' + t[0] + '" style="--tb:' + c[0] + '; --tc:' + c[1] + '">' + ico(t[2]) + t[1] + "</button>"; }).join("");
    var h = "";
    if (DTAB === "layout") h = layoutPane();
    else if (DTAB === "sheet") h = DESK.sheetPane();
    else if (!TD) h = '<p class="muted">시트에서 가져오는 중...</p>';
    else if (DTAB === "today") h = todayPane();
    else if (DTAB === "note") h = notePane();
    else if (DTAB === "safe") h = safePane();
    else if (DTAB === "tt") h = ttPane();
    else if (DTAB === "set") h = setPane();
    else if (DTAB === "ev") h = evPane();
    else if (DTAB === "msg") h = msgPane();
    else if (DTAB === "att") h = attPane();
    else if (DTAB === "feat") h = featPane();
    else if (DTAB === "month") h = monthPane();
    else if (DTAB === "lesson") h = lessonPane();
    else if (DTAB === "notice") h = noticePane();
    else if (DTAB === "thermo") h = thermoPane();
    $("dbody").innerHTML = h;
    if (DTAB === "tt") ttBind();
    if (DTAB === "month") monthBind();
    if (DTAB === "safe") safeBind();
  }
  function todayPane() {
    var rows = TD.today.map(function (s) {
      var y = function (v) { return v ? '<span class="yes">' + ico("check") + "</span>" : '<span class="no">·</span>'; };
      return "<tr><td class='num'>" + s.no + "</td><td>" + esc(s.name) + "</td><td>" + y(s.milk) + "</td><td>" + y(s.done) + "</td><td>" + y(s.role) + "</td><td class='num'>" + (s.talk || "") + "</td></tr>";
    }).join("");
    return lessonTodayHTML() +
      '<div class="dsec"><h4>' + ico("eye") + '오늘 우리반 (' + esc(D.today) + ')</h4><table class="tbl"><tr><th>번호</th><th>이름</th><th>우유</th><th>다 했어요</th><th>1인 1역</th><th>발표</th></tr>' + rows + "</table></div>" +
      '<div class="dsec"><h4>' + ico("thermo") + '학급 온도계 · 지금 ' + D.thermo.total + '도</h4><p class="muted" style="margin-bottom:8px">목표에 닿아 보상을 했다면 0도부터 새로 시작해요.</p><button class="btn ghost sm" id="thReset">온도계 0도로 새 출발</button></div>' +
      '<div class="dsec"><h4>' + ico("sheet") + '시트에서 자세히</h4><p class="muted" style="margin-bottom:8px">학생별 누적(이번 달 우유 · 다 했어요 · 1인 1역 · 발표)은 시트의 <b>학생별</b> 탭, 날짜별 흐름과 그래프는 <b>날짜별</b> 탭, 수업계획은 <b>수업계획</b> 탭에 있어요.</p><button class="btn ghost sm" id="openSheet">시트 열기</button> <button class="btn ghost sm" id="tOff">선생님 모드 끝내기</button></div>';
  }
  var NCAT = ["칭찬", "관찰", "상담", "생활", "학습"], NFILTER = "";
  function notePane() {
    var opts = '<option value="">학급 전체</option>' + D.students.map(function (s) { return '<option value="' + s.no + '">' + s.no + "번 " + esc(s.name) + "</option>"; }).join("");
    var list = TD.notes.filter(function (n) { return !NFILTER || String(n["번호"]) === NFILTER; });
    return '<div class="dsec"><h4>' + ico("note") + '새 노트 (아이들 화면에는 보이지 않아요)</h4>' +
      '<div class="frow"><select class="field" id="nNo" style="flex:1">' + opts + '</select></div>' +
      '<div class="frow" id="nCats">' + NCAT.map(function (c, i) { return '<button class="chip' + (i === 1 ? " on" : "") + '" data-nc="' + c + '">' + c + "</button>"; }).join("") + "</div>" +
      '<textarea class="field" id="nText" maxlength="300" placeholder="예: 모둠 활동에서 친구 의견을 먼저 들어 줌"></textarea><div style="margin-top:8px"><button class="btn" id="nSave">노트 남기기</button></div></div>' +
      '<div class="dsec"><h4>' + ico("list") + '지난 노트 <select class="field" id="nFilter" style="width:auto; margin-left:auto; font-size:12.5px; padding:4px 8px">' + opts.replace('value="">학급 전체', 'value="">모두 보기').replace('value="' + NFILTER + '"', 'value="' + NFILTER + '" selected') + "</select></h4>" +
      (list.map(function (n) { return '<div class="note"><div class="meta"><span>' + esc(String(n["시각"]).slice(5)) + "</span><span>" + (n["번호"] ? esc(n["번호"]) + "번 " + esc(n["이름"]) : "학급") + '</span><span class="catc">' + esc(n["분류"]) + "</span></div>" + esc(n["내용"]) + "</div>"; }).join("") || '<p class="muted">아직 노트가 없어요</p>') + "</div>";
  }
  function setPane() {
    var s = TD.settings, f = function (k, ph, type) {
      if (type === "yn") return '<div class="frow"><label>' + k + '</label><button class="sw' + (s[k] !== "아니오" ? " on" : "") + (SAVING[k] ? " saving" : "") + '" data-sw="' + k + '" aria-label="' + k + '"></button></div>';
      return '<div class="frow"><label for="s-' + k + '">' + k + '</label><input class="field" id="s-' + k + '" value="' + esc(s[k] || "") + '" placeholder="' + esc(ph || "") + '"><button class="btn sm" data-ss="' + k + '">저장</button></div>';
    };
    var nm = s["이름 보이기"] || "번호와 이름";
    return '<div class="dsec"><h4>' + ico("eye") + '사용법 보기</h4><div class="frow">' +
      '<a class="btn sm" href="https://youtu.be/iLkx44GilMA" target="_blank" rel="noopener" style="text-decoration:none"><svg class="yt-ico" style="width:17px;height:12px;vertical-align:-2px;margin-right:5px" viewBox="0 0 28 20" aria-hidden="true"><rect width="28" height="20" rx="5" fill="#ff0033"/><path d="M11.2 5.6v8.8l7.6-4.4z" fill="#fff"/></svg>사용법 영상 (유튜브)</a>' +
      '<button class="btn sm ghost" data-guide="1">그림으로 보는 사용법</button></div></div>' +
      '<div class="dsec"><h4>' + ico("users") + '학생 이름 보이기</h4><div class="frow">' + NAMEOPT.map(function (v) { return '<button class="chip' + (nm === v ? " on" : "") + '" data-nm="' + v + '">' + v + "</button>"; }).join("") + "</div></div>" +
      '<div class="dsec"><h4>' + ico("spark") + '화면 테마</h4><div class="frow">' + ["밝은 파스텔", "별밤 네온"].map(function (v) { return '<button class="chip' + ((s["화면 테마"] || "밝은 파스텔") === v ? " on" : "") + '" data-theme="' + v + '">' + v + "</button>"; }).join("") + "</div></div>" +
      '<div class="dsec"><h4>' + ico("map") + '날씨 · 미세먼지 위치 <span class="muted" style="font-weight:600">지금: ' + esc(s["날씨 지역"] || "") + "</span></h4>" + regionHTML() +
      "</div>" +
      '<div class="dsec"><h4>' + ico("gear") + '자주 바꾸는 설정</h4>' + f("학급 닉네임") + f("지금 활동", "예: 국어 활동 3쪽") + f("학생 수", "1~40") + f("온도계 목표") + f("칭찬 이유", "쉼표로") + f("독서 · 명상 시간", "분") + f("독서 음악 주소", "mp3 파일 주소 (비우면 앱 속 클래식)") +
      f("계정 종류", "쉼표로 (예: 구글,아이톡톡,e학습터)") + f("타이머 소리", "", "yn") + f("계정 확인", "", "yn") + '</div>' +
      '<div class="dsec"><h4>' + ico("meal") + '우리 학교 급식 <span class="muted" style="font-weight:600">지금: ' + esc(s["급식 학교"] || "아직 안 골랐어요") + '</span></h4>' +
      '<div class="frow"><select class="field" id="scOff" style="flex:0 0 120px" aria-label="지역">' + '<option value="">지역 전체</option>' + OFFICES.map(function (o) { return '<option value="' + o[0] + '"' + ((s["급식 학교 코드"] || "").indexOf(o[0] + "|") === 0 ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select>" +
      '<input class="field" id="scName" maxlength="30" placeholder="학교 이름 (예: 마산고운초)" style="flex:1"><button class="btn sm" id="scFind">찾기</button></div><div class="sclist" id="scList"></div>' +
      '<p class="muted">나이스 교육정보 개방 포털의 공개 급식 자료예요. 학교 코드와 날짜만 보내고 학생 정보는 보내지 않아요. 날마다 저절로 그날 메뉴로 바뀌어요.</p></div>' +
      '<div class="dsec"><h4>' + ico("lock") + '선생님 비밀번호 바꾸기</h4><div class="frow"><input class="field" id="pwOld" type="password" placeholder="지금 비밀번호" autocomplete="current-password" style="flex:1"><input class="field" id="pwNew" type="password" placeholder="새 비밀번호 (4~20자)" autocomplete="new-password" style="flex:1"><button class="btn sm" id="pwSave">바꾸기</button></div>' +
      '<p class="muted">처음 비밀번호 1234는 꼭 바꿔 두세요. 잊으면 [선생님] 창의 <b>비밀번호를 잊었어요</b>로 선생님 구글 메일로 받을 수 있어요.</p></div>' +
      '<p class="muted">학생 이름 · 1인 1역은 시트 <b>학생</b> 탭, 아이디 · 비밀번호 · 힌트는 <b>계정</b> 탭(비밀번호 칸은 화면에 나오지 않아요), 명언은 <b>명언</b> 탭, 화면 잠금 코드는 <b>설정</b> 탭에서 바꿔요.</p>';
  }
  var OFFICES = [["B10", "서울"], ["C10", "부산"], ["D10", "대구"], ["E10", "인천"], ["F10", "광주"], ["G10", "대전"], ["H10", "울산"], ["I10", "세종"], ["J10", "경기"], ["K10", "강원"], ["M10", "충북"], ["N10", "충남"], ["P10", "전북"], ["Q10", "전남"], ["R10", "경북"], ["S10", "경남"], ["T10", "제주"]];
  // ── 오늘 급식 (나이스 공개 자료). 오늘 급식이 없으면(주말 · 휴일) 다음 급식 날을 보여 준다 ──
  var ALG = ["", "난류", "우유", "메밀", "땅콩", "대두", "밀", "고등어", "게", "새우", "돼지고기", "복숭아", "토마토", "아황산류", "호두", "닭고기", "쇠고기", "오징어", "조개류", "잣"];
  var MEAL = { weeks: {}, at: "", busy: false, school: "", none: false, err: false }, ML = { ymd: "" };
  function ymdAdd(ymd, n) { var d = new Date(ymd + "T12:00:00"); d.setDate(d.getDate() + n); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function monOf(ymd) { var wd = new Date(ymd + "T12:00:00").getDay(); return ymdAdd(ymd, -(wd === 0 ? 6 : wd - 1)); }
  function mdText(ymd) { var d = new Date(ymd + "T12:00:00"); return (d.getMonth() + 1) + "월 " + d.getDate() + "일 (" + "일월화수목금토"[d.getDay()] + ")"; }
  function mealWeek(ymd, cb) {
    var mon = monOf(ymd); if (MEAL.weeks[mon]) return cb(MEAL.weeks[mon]);
    call("getMeal", [ymd], function (r) { r = r || {}; MEAL.none = !!r.none; MEAL.err = !!r.error; MEAL.school = r.school || ""; if (r.days) MEAL.weeks[mon] = r.days; cb(r.days || null); }, true);
  }
  function mealLoad(force) {
    if (!D || (MEAL.busy && !force)) return; if (force) MEAL.weeks = {};
    MEAL.busy = true; MEAL.at = D.today;
    mealWeek(D.today, function (days) {
      var t = D.today, keys = Object.keys(days || {}).sort().filter(function (k) { return k >= t; });
      if (days && !keys.length && !MEAL.none && !MEAL.err) mealWeek(ymdAdd(monOf(t), 7), function () { MEAL.busy = false; drawMeal(); });
      else { MEAL.busy = false; drawMeal(); }
    });
  }
  function mealShowDay() {
    var t = D.today, all = {}; Object.keys(MEAL.weeks).forEach(function (m) { Object.keys(MEAL.weeks[m] || {}).forEach(function (k) { all[k] = MEAL.weeks[m][k]; }); });
    var k = Object.keys(all).sort().filter(function (x) { return x >= t; })[0]; return k ? { ymd: k, m: all[k] } : null;
  }
  function alsHTML(a, big) { return a && a.length ? '<span class="als" aria-label="알레르기 ' + a.map(function (n) { return ALG[n]; }).join(", ") + '">' + a.map(function (n) { return '<i title="' + n + ". " + ALG[n] + '">' + n + "</i>"; }).join("") + "</span>" : ""; }
  function drawMeal() {
    if (!D || !$("meal")) return;
    var box = $("meal"), cal = $("mealCal"), tt = $("mealTitle");
    if (MEAL.none) { cal.hidden = true; tt.textContent = "오늘 급식";
      box.innerHTML = '<div class="mempty">우리 학교를 고르면 날마다 급식이 나와요' + (TPW ? '<br><button class="btn sm" id="mealPick">학교 고르기</button>' : "<br><small>선생님 서랍 → 설정 → 우리 학교 급식</small>") + "</div>"; return; }
    if (MEAL.err) { box.innerHTML = '<div class="mempty">급식을 가져오지 못했어요.<br><small>잠시 뒤에 다시 해 볼게요</small></div>'; return; }
    var day = mealShowDay();
    if (!day) { cal.hidden = true; tt.textContent = "오늘 급식"; box.innerHTML = '<div class="mempty">' + (MEAL.busy || !MEAL.at ? "급식을 가져오는 중..." : "이번 주에는 급식 정보가 없어요") + "</div>"; return; }
    var tom = ymdAdd(D.today, 1);
    tt.textContent = day.ymd === D.today ? "오늘 급식" : day.ymd === tom ? "내일 급식" : mdText(day.ymd).replace(/^\d+월 /, "") + " 급식";
    cal.hidden = !day.m.cal; cal.textContent = day.m.cal ? Math.round(Number(day.m.cal)) + " kcal" : "";
    box.innerHTML = '<ul class="mlist">' + day.m.dishes.map(function (d) { return "<li><span>" + esc(d.n) + "</span></li>"; }).join("") + "</ul>" +
      (day.ymd === D.today ? "" : '<div class="mfoot"><span>' + esc(mdText(day.ymd) + " · 오늘은 급식이 없어요") + '</span></div>');
    mealFit();
  }
  // 메뉴가 몇 개든 칸 안에: 1단 · 2단마다 '다 들어가는 가장 큰 글씨'를 찾고, 낱말이 칸보다 길면 더 작게. 비슷하면 1단(읽기 쉬움)
  function mealFit() {
    var ul = $("meal").querySelector(".mlist"); if (!ul || !ul.clientHeight) return;
    var old = ul.querySelector(".more"); if (old) old.remove();
    var lis = [].slice.call(ul.children); lis.forEach(function (li) { li.hidden = false; });
    var ok = function () { if (ul.scrollHeight > ul.clientHeight + 1) return false; return lis.every(function (li) { var sp = li.lastElementChild; return li.hidden || sp.scrollWidth <= sp.clientWidth + 1; }); };
    var best = function (cols) { ul.style.gridTemplateColumns = "repeat(" + cols + ",minmax(0,1fr))"; for (var fs = 24; fs >= 10; fs -= .5) { ul.style.fontSize = fs + "px"; if (ok()) return fs; } return 0; };
    var max = lis.length <= 3 ? 1 : Math.max(1, Math.min(lis.length > 8 ? 3 : 2, Math.floor(ul.clientWidth / 95))), pick = 1, pf = 0;
    for (var c = 1; c <= max; c++) { var f = best(c); if (f > pf * 1.18) { pick = c; pf = f; } }   // 단을 늘려 글씨가 18% 넘게 커질 때만 단을 늘린다
    if (!pf) {   // 카드가 아주 작아 다 못 들어가면: 가장 많은 단 · 가장 작은 글씨로 넣고, 넘치는 메뉴는 '+N개 더'로
      var more = document.createElement("li"); more.className = "more"; ul.appendChild(more); ul.style.fontSize = "11px";
      var show = function (c) { ul.style.gridTemplateColumns = "repeat(" + c + ",minmax(0,1fr))"; lis.forEach(function (li) { li.hidden = false; }); more.innerHTML = "";
        var k = lis.length; while (k > 1 && !ok()) { k--; lis[k].hidden = true; more.innerHTML = "<span>+ " + (lis.length - k) + "개 더 · 눌러서 보기</span>"; } return k; };
      var bc = 1, bn = 0; for (var c2 = 1; c2 <= max; c2++) { var nn = show(c2); if (nn > bn) { bn = nn; bc = c2; } }
      show(bc); return;
    }
    ul.style.gridTemplateColumns = "repeat(" + pick + ",minmax(0,1fr))"; ul.style.fontSize = pf + "px";
  }
  if (window.ResizeObserver) new ResizeObserver(function () { mealFit(); }).observe($("mealCard"));
  function mealOpen(ymd) { ML.ymd = ymd; openModal("mealM"); mealDrawBig(); }
  function mealDrawBig() {
    var y = ML.ymd; $("mlDate").textContent = mdText(y) + (y === D.today ? " · 오늘" : ""); $("mlSchool").textContent = MEAL.school || D.settings["급식 학교"] || "";
    $("mlList").innerHTML = '<li class="muted" style="font-size:15px">가져오는 중...</li>';
    mealWeek(y, function (days) {
      if (ML.ymd !== y) return;
      var m = days && days[y];
      if (!m) { $("mlList").innerHTML = '<li class="muted" style="font-size:16px">이 날은 급식이 없어요 (주말 · 휴일 · 방학)</li>'; $("mlInfo").innerHTML = ""; $("mlAlg").innerHTML = ALG.slice(1).map(function (n, i) { return "<span><b>" + (i + 1) + "</b>" + n + "</span>"; }).join(""); $("mlOrg").hidden = true; return; }
      var used = {}; m.dishes.forEach(function (d) { d.a.forEach(function (n) { used[n] = 1; }); });
      $("mlList").innerHTML = m.dishes.map(function (d) { return "<li><span>" + esc(d.n) + "</span>" + alsHTML(d.a, true) + "</li>"; }).join("");
      $("mlInfo").innerHTML = (m.cal ? "<span>열량 " + esc(m.cal) + " kcal</span>" : "") + m.ntr.slice(0, 3).map(function (x) { return "<span>" + esc(x.replace(/\s*:\s*/, " ")) + "</span>"; }).join("");
      $("mlAlg").innerHTML = ALG.slice(1).map(function (n, i) { return '<span class="' + (used[i + 1] ? "on" : "") + '"><b>' + (i + 1) + "</b>" + n + "</span>"; }).join("");
      $("mlOrg").hidden = !m.origin.length; $("mlOrgTxt").innerHTML = m.origin.map(esc).join("<br>");
    });
  }
  $("mlPrev").onclick = function () { ML.ymd = ymdAdd(ML.ymd, -1); mealDrawBig(); };
  $("mlNext").onclick = function () { ML.ymd = ymdAdd(ML.ymd, 1); mealDrawBig(); };
  $("mealCard").addEventListener("click", function (e) {
    if (EDIT) return;
    if (e.target.closest("#mealPick")) { e.stopPropagation(); DTAB = "set"; openDrawer("set"); return; }
    if (MEAL.none || MEAL.err) return; var d = mealShowDay(); mealOpen(d ? d.ymd : D.today);
  });
  $("mealCard").addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && !EDIT) { e.preventDefault(); $("mealCard").click(); } });
  setInterval(function () { if (D && !document.hidden && !MEAL.busy) mealLoad(true); }, 60 * 60 * 1000);
  // ── 서랍 > 보안 · 심의: 시트 공유 확인 · 지킬 것 · 개인정보 · 학운위 · 에듀집 근거 ──
  var LEGAL = { privacy: "https://kimman.kr/desk/privacy", terms: "https://kimman.kr/desk/terms", checklist: "https://kimman.kr/desk/docs/checklist.pdf",
    committee: "https://kimman.kr/desk/docs/committee.pdf", edzip: "https://edzip.kr/learning-sw/6ad6b0f5d10f07cea12da7c9", mail: "rlaalscjswo1@gmail.com" };
  var SAFE = null;
  function safePane() {
    var a = function (u, t, sub) { return '<a href="' + u + '" target="_blank" rel="noopener">' + ico("shield") + "<span>" + t + (sub ? "<small>" + sub + "</small>" : "") + "</span></a>"; };
    var share = !SAFE ? '<div class="safe-box" style="background:#f3f1f8">시트 공유 상태를 확인하는 중...</div>' :
      SAFE.err ? '<div class="safe-box safe-warn">공유 상태를 확인하지 못했어요. 시트 오른쪽 위 [공유]에서 직접 확인해 주세요.</div>' :
      (SAFE.link || (SAFE.people || []).length) ? '<div class="safe-box safe-warn">시트가 다른 사람과 공유되어 있어요!<br>' +
        (SAFE.link ? "· 링크가 있는 사람 누구나 볼 수 있음 (" + esc(SAFE.link) + ")<br>" : "") + ((SAFE.people || []).length ? "· 공유된 사람: " + SAFE.people.map(esc).join(", ") + "<br>" : "") +
        "시트 오른쪽 위 [공유] → 사람을 빼고 '일반 액세스'를 <b>제한됨</b>으로 바꿔 주세요.</div>" :
      '<div class="safe-box safe-ok">' + ico("check") + " 시트가 선생님만 볼 수 있게 되어 있어요" + (SAFE.link === null ? " (사람 단위 공유 기준)" : "") + "</div>";
    return '<div class="dsec"><h4>' + ico("shield") + '시트 공유 확인</h4>' + share + '<button class="btn sm ghost" id="safeCheck">' + ico("check") + ' 다시 확인</button></div>' +
      '<div class="dsec"><h4>' + ico("lock") + '꼭 지킬 것</h4><ul style="padding-left:18px; display:grid; gap:4px; color:var(--ink2); font-size:14px">' +
      "<li><b>시트는 학생 · 학부모 · 다른 사람에게 절대 공유하지 않아요.</b> 학생 이름 · 출결 사유 · 마음 기록 · 계정 비밀번호가 들어 있어요.</li>" +
      "<li>학생들은 칠판 화면에서 자기 <b>아이디와 비밀번호 힌트만 30초</b> 봐요. 계정 탭의 비밀번호 칸은 화면에 나오지 않아요.</li>" +
      "<li>선생님 비밀번호는 1234에서 꼭 바꿔요 (설정 탭 &gt; 선생님 비밀번호 바꾸기).</li>" +
      "<li>교실을 비울 때는 머리띠 <b>[잠금]</b>, 하루가 끝나면 구글 로그아웃.</li>" +
      "<li>웹 앱 · 시트 주소는 학생에게 알려 주지 않아요. 학생 기기로 들어오는 기능은 없어요.</li></ul></div>" +
      '<div class="dsec"><h4>' + ico("note") + '개인정보 · 학운위 · 에듀집 근거</h4><div class="lglist">' +
      a(LEGAL.privacy, "개인정보처리방침", "교육부 필수기준 9개 항목 = 방침 제1~11조 · 학생 정보는 선생님 시트에만") +
      a(LEGAL.checklist, "필수기준 체크리스트 (교육부 [서식 2])", "9개 항목 모두 충족 · 에듀집 제출본") +
      a(LEGAL.committee, "학운위 심의자료(안)", "학교 담당자에게 드리면 돼요 · 의견수렴 → 기준 확인 → 심의 → 학교장 확정") +
      a(LEGAL.terms, "이용약관", "무료 · 광고 없음 · 회원가입 없음") +
      a(LEGAL.edzip, "에듀집 필수기준 점검결과 — 확인완료", "2026. 10. 20. 교육부 · KERIS 에듀집 등록") +
      '</div><p class="muted" style="margin-top:10px">문의 · 열람 · 삭제 요청: ' + LEGAL.mail + " · 제작자는 학운위원이더라도 이 소프트웨어 심의에 참여하지 않아요.</p></div>";
  }
  function safeBind(force) {
    if (SAFE && !force) return;
    if (force) { SAFE = null; if (DTAB === "safe") drawDrawer(); }
    google.script.run.withSuccessHandler(function (r) { SAFE = r || { err: 1 }; if (DTAB === "safe" && $("drawer").classList.contains("on")) drawDrawer(); })
      .withFailureHandler(function () { SAFE = { err: 1 }; if (DTAB === "safe") drawDrawer(); }).shareInfo(CODE, TPW);
  }
  var FBC = "기능 추가";
  function msgPane() {
    var cats = ["기능 추가", "오류", "칭찬", "기타"];
    return '<div class="dsec"><h4>' + ico("chat") + '제작자에게 메시지 보내기</h4><p class="muted" style="margin-bottom:10px">있었으면 하는 기능, 잘 안 되는 곳, 좋았던 점을 적어 주세요. 제작자의 요청함에 바로 도착해요. 학생 이름 같은 개인정보는 적지 말아 주세요.</p>' +
      (D.feedback ? "" : '<p class="note" style="background:#fff7e0">아직 제작자 요청함이 연결되지 않은 사본이에요.</p>') +
      '<div class="fbk">' + cats.map(function (c) { return '<button class="chip' + (c === FBC ? " on" : "") + '" data-fbc="' + c + '">' + c + "</button>"; }).join("") + "</div>" +
      '<textarea class="field" id="fbText" maxlength="2000" placeholder="예: 모둠 점수판을 시트에도 저장하고 싶어요 / 6교시가 시간표에 안 나와요"></textarea>' +
      '<div class="frow" style="margin-top:8px"><input class="field" id="fbWho" maxlength="80" placeholder="답장 받을 연락처 (안 써도 돼요)"></div>' +
      '<button class="btn" id="fbGo"' + (D.feedback ? "" : " disabled style='opacity:.5'") + '>' + ico("mail") + " 제작자에게 보내기</button></div>" +
      '<p class="muted">버전: ' + esc(D.version || "") + "</p>";
  }
  function evPane() {
    var list = (D.events || []).slice().sort(function (a, b) { return a.d < b.d ? -1 : 1; }).filter(function (e) { return e.d >= D.today; });
    return '<div class="dsec"><h4>' + ico("spark") + '일정 넣기</h4><div class="frow"><input class="field" id="evDate" type="date" value="' + esc(D.today) + '" style="flex:0 0 160px"><input class="field" id="evText" maxlength="30" placeholder="예: 현장체험학습"></div>' +
      '<div class="frow" id="evKinds">' + Object.keys(EVC).map(function (k, i) { return '<button class="chip' + (i ? "" : " on") + '" style="--cc:' + EVC[k] + '" data-ek="' + k + '">' + k + "</button>"; }).join("") +
      '<button class="btn sm" id="evSave" style="margin-left:auto">일정 넣기</button></div><p class="muted">달력에 점으로, 머리띠에 가장 가까운 일정이 D-day로 보여요. 지우거나 고치려면 시트 <b>일정</b> 탭에서.</p></div>' +
      '<div class="dsec"><h4>' + ico("cal") + "다가오는 일정</h4>" + (list.map(function (e) { return '<div class="note"><div class="meta"><span class="ldot" style="--lc:' + (EVC[e.k] || "#c9636d") + '"></span><span>' + esc(e.d) + "</span><span class='catc'>" + esc(e.k || "") + "</span></div>" + esc(e.t) + "</div>"; }).join("") || '<p class="muted">다가오는 일정이 없어요</p>') + "</div>";
  }
  function layoutPane() {
    var hid = (LAY.hidden || []).map(function (id) { return '<button class="chip" data-show="' + id + '">' + ico("eye") + " " + NAMES[id] + " 다시 보이기</button>"; }).join(" ");
    return '<div class="dsec"><h4>' + ico("grid") + '화면 꾸미기</h4><p class="muted" style="margin-bottom:10px">[꾸미기 시작]을 누르면 카드가 살짝 흔들려요. 카드를 끌어 다른 카드 위에 놓으면 자리가 바뀌고, 카드 아래 단추로 가로 · 세로 크기를 바꿔요. 줄 높이는 화면에 맞춰 저절로 늘었다 줄었다 해요.</p>' +
      '<button class="btn" id="edStart">꾸미기 시작</button> <button class="btn ghost" id="edReset">기본 배치로 되돌리기</button></div>' +
      '<div class="dsec"><h4>' + ico("eye") + '숨긴 카드</h4>' + (hid || '<p class="muted">숨긴 카드가 없어요</p>') + "</div>";
  }
  // 서랍 안 클릭
  $("dbody").addEventListener("click", function (e) {
    var t = e.target.closest("button"); if (!t) return;
    if (t.id === "openSheet") window.open(D.sheetUrl, "_blank");
    if (t.id === "tOff") { teacherOff(); toast("선생님 모드를 닫았어요"); }
    if (t.id === "thReset") write("thermoReset", [TPW], { busy: "온도계 새 출발", mut: function (d) { d.thermo.total = 0; d.thermo.recent.unshift({ t: nowStamp(), d: 0, why: "새 출발" }); }, msg: "온도계를 0도로 새로 시작해요" });
    if (t.dataset.nc) { document.querySelectorAll("[data-nc]").forEach(function (b) { b.classList.toggle("on", b === t); }); }
    if (t.id === "nSave") {
      var no = $("nNo").value, cat = (document.querySelector("[data-nc].on") || {}).dataset ? document.querySelector("[data-nc].on").dataset.nc : "관찰", text = $("nText").value.trim();
      if (!text) { toast("노트에 남길 내용을 먼저 적어 주세요"); $("nText").focus(); return; }
      var s = no ? student(Number(no)) : { name: "" };
      write("addNote", [TPW, no, cat, text], { busy: "선생님 노트 저장 중", msg: "노트를 남겼어요", mut: function () { TD.notes.unshift({ "시각": nowStamp(), "번호": no, "이름": s.name, "분류": cat, "내용": text }); } });
      $("nText").value = "";
    }
    if (t.id === "pwSave") {
      var po = $("pwOld").value.trim(), pn = $("pwNew").value.trim();
      if (!po || !pn) { toast("지금 비밀번호와 새 비밀번호를 적어 주세요"); return; }
      busy("선생님 비밀번호 바꾸는 중", "");
      google.script.run.withSuccessHandler(function () { TPW = pn; try { sessionStorage.setItem("classdesk-tpw", pn); } catch (e) {} if (TD) TD.settings["선생님 비밀번호"] = pn; busyEnd(true, "비밀번호를 바꿨어요", "다음부터 새 비밀번호로 열어요"); $("pwOld").value = ""; $("pwNew").value = ""; })
        .withFailureHandler(function (e) { busyEnd(false, "바꾸지 못했어요", ((e && e.message) || "").slice(0, 70)); }).changePw(CODE, po, pn);
    }
    if (t.id === "safeCheck") safeBind(true);
    if (t.id === "scFind") {
      var nm2 = $("scName").value.trim(); if (nm2.length < 2) { $("scName").focus(); toast("학교 이름을 두 글자 이상 적어 주세요"); return; }
      $("scList").innerHTML = '<p class="muted">찾는 중...</p>';
      google.script.run.withSuccessHandler(function (r) {
        r = r || { list: [] };
        $("scList").innerHTML = (r.list.length ? r.list.map(function (x) { return '<button type="button" data-sc="' + esc(x.office + "|" + x.code) + '" data-scn="' + esc(x.name) + '">' + esc(x.name) + "<small>" + esc([x.kind, x.found, x.addr || x.officeName].filter(String).join(" · ")) + "</small></button>"; }).join("") : '<p class="muted">찾는 학교가 없어요. 이름을 줄이거나(예: 고운초) 지역을 바꿔 보세요.</p>') +
          (r.total > r.list.length ? '<p class="muted">' + r.total + "곳 중 " + r.list.length + "곳만 보여요. 지역을 고르거나 이름을 더 정확히 적어 주세요.</p>" : "");
      }).withFailureHandler(function (e) { $("scList").innerHTML = '<p class="muted">' + esc((e && e.message) || "찾지 못했어요") + "</p>"; }).searchSchool(CODE, TPW, nm2, $("scOff").value);
    }
    if (t.dataset.sc) { var scv = t.dataset.sc.split("|"), scn = t.dataset.scn;
      write("saveSchool", [TPW, scv[0], scv[1], scn], { busy: scn + " 급식 연결 중", msg: scn + " 급식을 보여 줄게요",
        mut: function (d) { d.settings["급식 학교"] = scn; d.settings["급식 학교 코드"] = t.dataset.sc; if (TD) { TD.settings["급식 학교"] = scn; TD.settings["급식 학교 코드"] = t.dataset.sc; } MEAL.none = false; MEAL.weeks = {}; },
        after: function () { mealLoad(true); } }); }
    if (t.dataset.guide) $("dGuide").click();
    if (t.dataset.ss) { var k = t.dataset.ss, v = $("s-" + k).value.trim();
      write("saveSetting", [TPW, k, v], { busy: k + " 저장 중", msg: k === "계정 종류" ? "계정 종류를 바꿨어요. 시트 '계정' 탭에 칸이 생겼어요" : k + "을(를) 바꿨어요", mut: function (d) { d.settings[k] = v; TD.settings[k] = v; if (k === "지금 활동") { d.marks.act = v; d.marks.done = {}; } if (k === "학생 수") scheduleSync(); },
        after: function (r) { if (k !== "날씨 지역") return; if (r && r.place) { TD.settings["위도"] = String(r.place.lat); TD.settings["경도"] = String(r.place.lon); } call("getWeather", [], showWeather, true); } }); }
    if (t.dataset.sw) { var k2 = t.dataset.sw, v2 = TD.settings[k2] === "아니오" ? "예" : "아니오"; SAVING[k2] = 1;
      write("saveSetting", [TPW, k2, v2], { busy: k2 + " " + (v2 === "예" ? "켜는 중" : "끄는 중"), mut: function (d) { d.settings[k2] = v2; TD.settings[k2] = v2; if (k2 === "타이머 소리") { SND = null; ls("classdesk-sound", null); } }, after: function () { delete SAVING[k2]; savedSw(); } }); }
    if (t.dataset.theme) { var tv2 = t.dataset.theme;
      write("saveSetting", [TPW, "화면 테마", tv2], { busy: "화면 테마 바꾸는 중", msg: tv2 + " 테마로 바꿨어요", mut: function (d) { d.settings["화면 테마"] = tv2; TD.settings["화면 테마"] = tv2; } }); }
    if (t.id === "rgSave") { var rn = [$("rg1").value, $("rg2").value, $("rg3") ? $("rg3").value : ""].filter(String).join(" ");
      if (!$("rg2").value) { toast("시 · 구까지 골라 주세요"); return; }
      write("saveSetting", [TPW, "날씨 지역", rn], { big: true, busy: rn + " 날씨 찾는 중", msg: "날씨 위치: " + rn, mut: function (d) { d.settings["날씨 지역"] = rn; TD.settings["날씨 지역"] = rn; },
        after: function (rr) { if (rr && rr.place) { TD.settings["위도"] = String(rr.place.lat); TD.settings["경도"] = String(rr.place.lon); } call("getWeather", [], showWeather, true); } }); }
    if (t.dataset.ft) { var ft = t.dataset.ft, lst = offList(), on = lst.indexOf(ft) < 0;
      if (on) lst.push(ft); else lst = lst.filter(function (x) { return x !== ft; }); var lv = lst.join(",");
      SAVING[ft] = 1;
      write("saveSetting", [TPW, "꺼 둔 기능", lv], { busy: ft + (on ? " 끄는 중" : " 켜는 중"), msg: "'" + ft + "' " + (on ? "껐어요" : "켰어요") + " · 시트에 저장 중", after: function () { delete SAVING[ft]; savedSw(); }, mut: function (d) { d.settings["꺼 둔 기능"] = lv; TD.settings["꺼 둔 기능"] = lv; } }); }
    if (t.dataset.fc) { var fc = t.dataset.fc, hid = LAY.hidden.indexOf(fc) >= 0;
      LAY.hidden = hid ? LAY.hidden.filter(function (x) { return x !== fc; }) : LAY.hidden.concat([fc]); LAY.v = 2; D.layout = JSON.stringify(LAY); applyLayout(true);
      SAVING[fc] = 1; drawDrawer();
      write("saveLayout", [TPW, D.layout], { busy: "카드 " + (hid ? "켜는 중" : "끄는 중"), msg: NAMES[fc] + " 카드를 " + (hid ? "켰어요" : "껐어요") + " · 시트에 저장 중", after: function () { delete SAVING[fc]; savedSw(); } }); }
    if (t.id === "atOpen") { closeDrawer(); openAtt(); }
    if (t.dataset.nm) { var nv = t.dataset.nm;
      write("saveSetting", [TPW, "이름 보이기", nv], { busy: "이름 보이기 · " + nv, mut: function (d) { d.settings["이름 보이기"] = nv; TD.settings["이름 보이기"] = nv; } }); }
    if (t.id === "geoBtn") {
      if (!navigator.geolocation) { toast("이 브라우저는 위치를 알려 주지 않아요. 지역 이름으로 적어 주세요"); return; }
      toast("위치를 찾는 중이에요. 허용을 눌러 주세요");
      navigator.geolocation.getCurrentPosition(function (p) {
        var la = p.coords.latitude, lo = p.coords.longitude;
        whereAmI(la, lo, function (nm) {
        write("saveLocation", [TPW, la, lo, nm], { busy: "우리 학교 위치로 바꾸는 중", msg: "날씨 위치를 바꿨어요", mut: function (d) { TD.settings["위도"] = la.toFixed(2); TD.settings["경도"] = lo.toFixed(2); TD.settings["날씨 지역"] = d.settings["날씨 지역"] = nm; },
          after: function () { call("getWeather", [], showWeather, true); } });
        });
      }, function () { toast("위치를 알 수 없어요. 위에서 시 · 구를 골라 주세요"); }, { timeout: 10000 });
    }
    if (t.dataset.ek) document.querySelectorAll("[data-ek]").forEach(function (b) { b.classList.toggle("on", b === t); });
    if (t.id === "evSave") {
      var ed = $("evDate").value, et = $("evText").value.trim(), ek = (document.querySelector("[data-ek].on") || { dataset: { ek: "행사" } }).dataset.ek;
      if (!ed || !et) { toast(!ed ? "날짜를 먼저 골라 주세요" : "일정 이름을 먼저 적어 주세요"); $(!ed ? "evDate" : "evText").focus(); return; }
      write("addEvent", [TPW, ed, et, ek], { busy: "일정 넣는 중", msg: "'" + et + "' 일정을 넣었어요", mut: function (d) { d.events.push({ d: ed, t: et, k: ek }); } });
    }
    if (t.dataset.fbc) { FBC = t.dataset.fbc; document.querySelectorAll("[data-fbc]").forEach(function (b) { b.classList.toggle("on", b === t); }); }
    if (t.id === "fbGo") {
      var fx = $("fbText").value.trim(); if (fx.length < 4) { $("fbText").focus(); toast("내용을 조금 더 적어 주세요"); return; }
      busy("제작자에게 보내는 중", "");
      google.script.run.withSuccessHandler(function () { busyEnd(true, "보냈어요. 고맙습니다!", "제작자가 꼼꼼히 읽어 볼게요"); $("fbText").value = ""; })
        .withFailureHandler(function (er) { busyEnd(false, "보내지 못했어요", ((er && er.message) || "").slice(0, 60)); }).sendFeedback(CODE, TPW, FBC, fx, $("fbWho").value.trim());
    }
    if (t.id === "edStart") editOn();
    if (t.id === "edReset") { LAY = JSON.parse(JSON.stringify(DEF)); applyLayout(); write("saveLayout", [TPW, JSON.stringify(LAY)], { busy: "기본 배치로 되돌리는 중", msg: "기본 배치로 돌아왔어요" }); drawDrawer(); }
    if (t.dataset.show) { LAY.hidden = LAY.hidden.filter(function (x) { return x !== t.dataset.show; }); applyLayout(); write("saveLayout", [TPW, JSON.stringify(LAY)], { busy: "카드를 다시 보이게", msg: NAMES[t.dataset.show] + " 카드를 다시 보여요" }); drawDrawer(); }
  });
  $("dbody").addEventListener("keydown", function (e) { if (e.target.id === "scName" && e.key === "Enter" && !e.isComposing) $("scFind").click(); });
  $("dbody").addEventListener("change", function (e) { if (e.target.id === "rg1" || e.target.id === "rg2") { regionFill(e.target.id); return; } if (e.target.id === "nFilter") { NFILTER = e.target.value; drawDrawer(); } });

  // ── 시간표 스티커 편집 ──
  var TT = null, SEL = null;
  function ttPane() {
    if (!TT) { var today = D.tt.periods.map(function (p) { return p.subj; }); var base = {}; ["월", "화", "수", "목", "금"].forEach(function (d) { base[d] = (TD.base[d] || []).slice(0, 7); while (base[d].length < 7) base[d].push(""); }); TT = { today: today, base: base, subjects: D.subjects.slice() }; }
    var n = D.tt.count || 6;
    var slot = function (where, i, v) { return '<div class="slot' + (v ? " fill" : "") + (SEL && SEL[0] === where && SEL[1] === i ? " sel" : "") + '" data-drop="slot" data-w="' + where + '" data-i="' + i + '"' + (v ? ' style="--sc:' + subColor(v) + '"' : "") + ">" + (v ? '<span class="jua">' + esc(v) + "</span>" : (i + 1) + "교시") + "</div>"; };
    var row = function (label, where, list) { var h = '<div class="srow" style="--pc2:' + n + '"><b>' + label + "</b>"; for (var i = 0; i < n; i++) h += slot(where, i, list[i]); return h + "</div>"; };
    var wd = D.weekday;
    return '<div class="dsec"><h4>' + ico("spark") + '과목 스티커</h4><div class="stks" id="stks">' + TT.subjects.map(function (s) { return '<span class="stk jua" style="--sc:' + subColor(s) + '" data-subj="' + esc(s) + '">' + esc(s) + "</span>"; }).join("") +
      '</div><div class="frow" style="margin-top:8px"><input class="field" id="newSubj" maxlength="8" placeholder="새 과목 이름 (예: 독서, 영재, 동아리)"><button class="btn sm" id="addSubj">스티커 만들기</button></div>' +
      '<p class="muted">스티커를 칸에 끌어다 놓아요. 칸의 과목을 밖으로 끌어내면 빠져요. 끌기가 어려우면 칸을 누르고 스티커를 눌러도 돼요.</p></div>' +
      '<div class="dsec"><h4>' + ico("cal") + "오늘만 바꾸기 (" + wd + "요일)</h4>" + '<div class="slots">' + row(wd, "today", TT.today) + "</div>" +
      '<div style="margin-top:10px; display:flex; gap:8px; flex-wrap:wrap"><button class="btn" id="ttToday">오늘 시간표 저장</button><button class="btn ghost" id="ttUndo">오늘 바꾼 것 되돌리기</button></div></div>' +
      '<div class="dsec"><h4>' + ico("grid") + '기초시간표 (매주 똑같이)</h4><div class="slots">' + ["월", "화", "수", "목", "금"].map(function (d) { return row(d, d, TT.base[d]); }).join("") + "</div>" +
      '<div style="margin-top:10px"><button class="btn" id="ttBase">기초시간표 저장</button></div></div>';
  }
  function ttList(where) { return where === "today" ? TT.today : TT.base[where]; }
  function ttBind() {
    $("dbody").onpointerdown = function (e) {
      var stk = e.target.closest(".stk"), sl = e.target.closest(".slot.fill");
      if (stk) { e.preventDefault(); dragStart(e, stk, "slot", function (tg, ev, moved) {
        if (!moved) { if (SEL) { ttList(SEL[0])[SEL[1]] = stk.dataset.subj; SEL = null; drawDrawer(); } else { document.querySelectorAll(".stk").forEach(function (x) { x.classList.toggle("sel", x === stk); }); } return; }
        if (tg) { ttList(tg.dataset.w)[Number(tg.dataset.i)] = stk.dataset.subj; drawDrawer(); } }); return; }
      if (sl) { e.preventDefault(); dragStart(e, sl, "slot", function (tg, ev, moved) {
        var from = ttList(sl.dataset.w), fi = Number(sl.dataset.i), v = from[fi];
        if (!moved) { SEL = SEL && SEL[0] === sl.dataset.w && SEL[1] === fi ? null : [sl.dataset.w, fi]; drawDrawer(); return; }
        if (tg) { var to = ttList(tg.dataset.w), ti = Number(tg.dataset.i), old = to[ti]; to[ti] = v; from[fi] = tg.dataset.w === sl.dataset.w ? old : from[fi]; if (tg.dataset.w === sl.dataset.w) {} }
        else from[fi] = "";
        drawDrawer(); }); return; }
    };
    $("dbody").onclick = function (e) {
      var sl = e.target.closest(".slot:not(.fill)");
      if (sl) { var sel = document.querySelector(".stk.sel"); if (sel) { ttList(sl.dataset.w)[Number(sl.dataset.i)] = sel.dataset.subj; drawDrawer(); } else { SEL = [sl.dataset.w, Number(sl.dataset.i)]; drawDrawer(); } return; }
      var t = e.target.closest("button"); if (!t) return;
      if (t.id === "addSubj") { var v = $("newSubj").value.trim(); if (!v) { toast("더할 과목 이름을 먼저 적어 주세요"); $("newSubj").focus(); return; } if (TT.subjects.indexOf(v) < 0) TT.subjects.push(v); var list = TT.subjects.join(",");
        write("saveSetting", [TPW, "과목", list], { busy: "'" + v + "' 스티커 만드는 중", msg: "'" + v + "' 스티커가 생겼어요", mut: function (d) { d.subjects = TT.subjects.slice(); d.settings["과목"] = list; } }); drawDrawer(); }
      if (t.id === "ttToday") { var td = TT.today.slice(); write("saveTimetable", [TPW, "today", td], { big: true, busy: "오늘 시간표 저장 중", msg: "오늘 시간표를 바꿨어요", mut: function (d) { d.tt.periods.forEach(function (p, i) { p.subj = td[i] || ""; }); d.tt.changed = true; } }); }
      if (t.id === "ttUndo") { write("saveTimetable", [TPW, "reset", []], { busy: "기초시간표로 되돌리는 중", msg: "오늘도 기초시간표대로예요", mut: function (d) { var b = TT.base[d.weekday] || []; d.tt.periods.forEach(function (p, i) { p.subj = b[i] || ""; }); d.tt.changed = false; TT.today = d.tt.periods.map(function (p) { return p.subj; }); } }); drawDrawer(); }
      if (t.id === "ttBase") { var base = JSON.parse(JSON.stringify(TT.base)); write("saveTimetable", [TPW, "base", base], { big: true, busy: "기초시간표 저장 중", msg: "기초시간표를 저장했어요", mut: function (d) { TD.base = base; d.tt.base = base; if (!d.tt.changed && base[d.weekday]) d.tt.periods.forEach(function (p, i) { p.subj = base[d.weekday][i] || ""; }); } }); }
    };
  }
  // 서랍을 다른 탭으로 바꾸면 시간표 이벤트를 걷어 낸다
  var _dd = drawDrawer; drawDrawer = function () { if (DTAB !== "tt") { $("dbody").onpointerdown = null; $("dbody").onclick = null; } _dd(); };

  // ── 기능 켜고 끄기: 설정 '꺼 둔 기능'(이름을 쉼표로) ──
  // 스위치를 누르면 바로 바뀌고, 시트에 저장되는 동안 옆에서 작은 표시가 돈다
  var SAVING = {};
  function savedSw() { if ($("drawer").classList.contains("on") && TD) drawDrawer(); }
  function offList() { return String((D && D.settings["꺼 둔 기능"]) || "").split(",").map(function (x) { x = x.trim(); return x === "아침 독서" ? "독서 · 명상" : x; }).filter(String); }
  // 학급 이름이 길어도 오른쪽 단추와 겹치지 않게 글자 크기를 저절로 줄인다 (가장 작게 16px, 그래도 길면 …)
  function fitTitle() {
    var h = $("nick"); if (!h) return;
    h.style.fontSize = "";
    var size = parseFloat(getComputedStyle(h).fontSize);
    while (h.scrollWidth > h.clientWidth + 1 && size > 16) { size -= 1; h.style.fontSize = size + "px"; }
  }
  addEventListener("resize", function () { clearTimeout(fitTitle._t); fitTitle._t = setTimeout(fitTitle, 120); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitTitle);
  function isOff(name) { return offList().indexOf(name) >= 0; }
  function featPane() {
    var sw = function (name, on, attr) { return '<div class="ftrow"><span>' + esc(name) + '</span><button class="sw' + (on ? " on" : "") + (SAVING[name] ? " saving" : "") + '" ' + attr + '="' + esc(name) + '" aria-label="' + esc(name) + ' 켜고 끄기"></button></div>'; };
    var grp = function (title, names) { return '<div class="dsec"><h4>' + title + "</h4>" + names.map(function (n) { return sw(n, !isOff(n), "data-ft"); }).join("") + "</div>"; };
    return '<p class="muted" style="margin-bottom:10px">쓰지 않는 기능은 꺼 두면 화면에서 빠져요. 시트 설정 탭의 <b>꺼 둔 기능</b>에도 이름이 적혀요.</p>' +
      grp("아래 번호판", MODES.map(function (m) { return m.name; })) + grp("머리띠 단추", ["놀이 · 도구", "독서 · 명상"]) +
      '<div class="dsec"><h4>바탕화면 카드</h4>' + Object.keys(NAMES).map(function (id) { return '<div class="ftrow"><span>' + NAMES[id] + '</span><button class="sw' + (LAY.hidden.indexOf(id) < 0 ? " on" : "") + (SAVING[id] ? " saving" : "") + '" data-fc="' + id + '" aria-label="' + NAMES[id] + ' 카드 켜고 끄기"></button></div>'; }).join("") + "</div>" +
      grp("놀이 · 도구함", TOOLS.map(function (t) { return t[1]; }));
  }

  // ── 날씨 지역 고르기: 시 · 도 → 시 · 구 → 구 (군은 뺌) ──
  var REGION = {
    "서울특별시": "종로구 중구 용산구 성동구 광진구 동대문구 중랑구 성북구 강북구 도봉구 노원구 은평구 서대문구 마포구 양천구 강서구 구로구 금천구 영등포구 동작구 관악구 서초구 강남구 송파구 강동구",
    "부산광역시": "중구 서구 동구 영도구 부산진구 동래구 남구 북구 해운대구 사하구 금정구 강서구 연제구 수영구 사상구",
    "대구광역시": "중구 동구 서구 남구 북구 수성구 달서구", "인천광역시": "중구 동구 미추홀구 연수구 남동구 부평구 계양구 서구",
    "광주광역시": "동구 서구 남구 북구 광산구", "대전광역시": "동구 중구 서구 유성구 대덕구", "울산광역시": "중구 남구 동구 북구", "세종특별자치시": "세종시",
    "경기도": "수원시(장안구,권선구,팔달구,영통구) 성남시(수정구,중원구,분당구) 의정부시 안양시(만안구,동안구) 부천시(원미구,소사구,오정구) 광명시 평택시 동두천시 안산시(상록구,단원구) 고양시(덕양구,일산동구,일산서구) 과천시 구리시 남양주시 오산시 시흥시 군포시 의왕시 하남시 용인시(처인구,기흥구,수지구) 파주시 이천시 안성시 김포시 화성시 광주시 양주시 포천시 여주시",
    "강원특별자치도": "춘천시 원주시 강릉시 동해시 태백시 속초시 삼척시", "충청북도": "청주시(상당구,서원구,흥덕구,청원구) 충주시 제천시",
    "충청남도": "천안시(동남구,서북구) 공주시 보령시 아산시 서산시 논산시 계룡시 당진시", "전북특별자치도": "전주시(완산구,덕진구) 군산시 익산시 정읍시 남원시 김제시",
    "전라남도": "목포시 여수시 순천시 나주시 광양시", "경상북도": "포항시(남구,북구) 경주시 김천시 안동시 구미시 영주시 영천시 상주시 문경시 경산시",
    "경상남도": "창원시(의창구,성산구,마산합포구,마산회원구,진해구) 진주시 통영시 사천시 김해시 밀양시 거제시 양산시", "제주특별자치도": "제주시 서귀포시" };
  function regionParse(p) { return REGION[p].split(" ").map(function (x) { var m = /^(.+?)\((.+)\)$/.exec(x); return m ? { n: m[1], g: m[2].split(",") } : { n: x, g: [] }; }); }
  function regionHTML() {
    var cur = String((TD && TD.settings["날씨 지역"]) || "").split(/\s+/);
    if (!REGION[cur[0]]) { var hit = Object.keys(REGION).filter(function (k) { return regionParse(k).some(function (x) { return x.n === cur[0]; }); })[0]; if (hit) cur = [hit].concat(cur); }   // '창원시 마산합포구' → 경상남도부터
    var p = REGION[cur[0]] ? cur[0] : "";
    var opt = function (list, sel, ph) { return '<option value="">' + ph + "</option>" + list.map(function (x) { return '<option' + (x === sel ? " selected" : "") + ">" + x + "</option>"; }).join(""); };
    var cities = p ? regionParse(p) : [], c = cities.filter(function (x) { return x.n === cur[1]; })[0];
    return '<div class="rgsel"><select class="field" id="rg1" aria-label="시 · 도">' + opt(Object.keys(REGION), p, "시 · 도") + '</select><select class="field" id="rg2" aria-label="시 · 구">' + opt(cities.map(function (x) { return x.n; }), c ? c.n : "", "시 · 구") + "</select>" +
      '<select class="field" id="rg3" aria-label="구"' + (c && c.g.length ? "" : " hidden") + ">" + opt(c ? c.g : [], cur[2] || "", "구") + '</select><button class="btn sm" id="rgSave">이 지역으로</button></div>' +
      '<div class="frow"><button class="btn ghost sm" id="geoBtn">' + ico("map") + ' 지금 위치로 지정</button><span class="muted">위치: ' + esc((TD && TD.settings["위도"]) || "") + ", " + esc((TD && TD.settings["경도"]) || "") + "</span></div>";
  }
  function regionFill(which) {
    var p = $("rg1").value, cities = p ? regionParse(p) : [];
    if (which === "rg1") { $("rg2").innerHTML = '<option value="">시 · 구</option>' + cities.map(function (x) { return "<option>" + x.n + "</option>"; }).join(""); $("rg3").hidden = true; $("rg3").innerHTML = ""; return; }
    var c = cities.filter(function (x) { return x.n === $("rg2").value; })[0];
    $("rg3").hidden = !(c && c.g.length); $("rg3").innerHTML = c && c.g.length ? '<option value="">구</option>' + c.g.map(function (x) { return "<option>" + x + "</option>"; }).join("") : "";
  }
  // 위도 · 경도 → '경상남도 창원시 의창구' (구까지). 실패하면 '현재 위치'
  function whereAmI(la, lo, cb) {
    var done = false, end = function (nm) { if (!done) { done = true; cb(nm || "현재 위치"); } };
    setTimeout(function () { end(""); }, 6000);
    try {
      fetch("https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=ko&latitude=" + la + "&longitude=" + lo).then(function (r) { return r.json(); }).then(function (j) {
        var adm = ((j.localityInfo || {}).administrative || []).map(function (a) { return a.name; });
        var gu = adm.filter(function (n) { return /구$/.test(n) && n !== j.city; })[0] || "";
        end([j.principalSubdivision, j.city, gu].filter(String).join(" ").replace(/\s+/g, " ").trim());
      }).catch(function () { end(""); });
    } catch (e) { end(""); }
  }

  // ── 출결 관리 (선생님): 나이스처럼 종류 × 구분 기호, 일일 · 연속 입력, 사유. 시트 '출결' · '출결 2026-10' ──
  var ASYM = { "결석": { "질병": "♡", "미인정": "♥", "기타": "▲", "출석인정": "△" }, "지각": { "질병": "#", "미인정": "X", "기타": "≠", "출석인정": "◁" },
    "조퇴": { "질병": "@", "미인정": "◎", "기타": "∽", "출석인정": "▷" }, "결과": { "질병": "☆", "미인정": "◇", "기타": "=", "출석인정": "▽" } };
  var AKIND = ["결석", "지각", "조퇴", "결과"], ASUB = ["질병", "미인정", "기타", "출석인정"];
  var AT = { month: "", mode: "day", kind: "결석", sub: "질병", data: null, cell: null };
  function attPane() {
    return '<div class="dsec"><h4>' + ico("check") + '출결 관리</h4><p class="muted" style="margin-bottom:10px">월별 출결부를 열어 날짜 칸을 누르면 결석 · 지각 · 조퇴 · 결과와 질병 · 미인정 · 기타 · 출석인정, 사유를 적을 수 있어요. 여러 날은 [연속출결입력]. 시트 <b>출결</b>(원본)과 <b>출결 2026-10</b>(월별 표) 탭에 저장돼요.</p>' +
      '<button class="btn" id="atOpen">' + ico("cal") + " 출결부 열기</button></div>";
  }
  function openAtt(month) { $("att").classList.add("on"); AT.month = month || AT.month || D.today.slice(0, 7); attLoad(); }
  function attLoad() {
    $("atMonth").textContent = AT.month.slice(0, 4) + "년 " + Number(AT.month.slice(5)) + "월"; $("atBody").innerHTML = '<p class="muted">시트에서 가져오는 중...</p>';
    google.script.run.withSuccessHandler(function (r) { AT.data = r; attDraw(); }).withFailureHandler(function (e) { fail(e); }).attendGet(CODE, TPW, AT.month);
  }
  function attDraw() {
    var A = AT.data, kinds = '<div class="atkinds">' + AKIND.map(function (k) { return "<b>" + k + "</b>" + ASUB.map(function (sb) {
      return '<button class="chip' + (AT.kind === k && AT.sub === sb ? " on" : "") + '" data-ak="' + k + '" data-as="' + sb + '" style="--cc:#c9636d">' + ASYM[k][sb] + " " + sb + "</button>"; }).join(""); }).join("") + "</div>";
    var bar = '<div class="atbar"><button class="chip' + (AT.mode === "day" ? " on" : "") + '" data-am="day">일일출결입력</button><button class="chip' + (AT.mode === "range" ? " on" : "") + '" data-am="range">연속출결입력</button>' +
      '<span class="hint">종류를 고르고 날짜 칸을 눌러요</span></div>' + kinds;
    var head = '<tr><th class="nm">번호 · 이름</th>' + A.days.map(function (d) { var w = d.wd === "토" ? " sat" : d.wd === "일" ? " sun" : ""; return '<th class="' + w + (d.hol ? " hol" : "") + (d.d === A.today ? " today" : "") + '"' + (d.hol ? ' title="' + esc(d.hol) + '"' : "") + ">" + Number(d.d.slice(8)) + "<br>" + d.wd + "</th>"; }).join("") +
      AKIND.map(function (k) { return "<th>" + k + "</th>"; }).join("") + "</tr>";
    var body = A.students.map(function (st) {
      var cnt = {};
      return '<tr><td class="nm">' + st.no + " " + esc(st.name || "") + "</td>" + A.days.map(function (d) {
        if (d.off || d.hol) return '<td class="off"></td>';
        var r2 = A.recs[st.no + "|" + d.d]; if (r2) cnt[r2.kind] = (cnt[r2.kind] || 0) + 1;
        return '<td class="c' + (r2 ? " k" + (AKIND.indexOf(r2.kind) + 1) : "") + '" data-no="' + st.no + '" data-d="' + d.d + '"' + (r2 ? ' title="' + esc(r2.kind + " " + r2.sub + (r2.reason ? " · " + r2.reason : "")) + '"' : "") + ">" + (r2 ? esc(r2.sym) : "") + "</td>";
      }).join("") + AKIND.map(function (k) { return '<td class="sum">' + (cnt[k] || "") + "</td>"; }).join("") + "</tr>";
    }).join("");
    var school = A.days.filter(function (d) { return !d.off && !d.hol; }).length;
    $("atBody").innerHTML = bar + '<div class="atwrap" style="margin-top:10px"><table class="atbl"><thead>' + head + "</thead><tbody>" + body + "</tbody></table></div>" +
      '<p class="atleg">수업일수 ' + school + "일 (주말 · 일정 탭의 '휴일'은 회색). " + AKIND.map(function (k) { return k + " " + ASUB.map(function (sb) { return sb + ASYM[k][sb]; }).join(" "); }).join(" · ") + "</p>";
  }
  $("atBody").addEventListener("click", function (e) {
    var k = e.target.closest("[data-ak]"); if (k) { AT.kind = k.dataset.ak; AT.sub = k.dataset.as; attDraw(); return; }
    var m = e.target.closest("[data-am]"); if (m) { AT.mode = m.dataset.am; attDraw(); return; }
    var c = e.target.closest("td.c"); if (c) attOpen(Number(c.dataset.no), c.dataset.d);
  });
  function attOpen(no, date) {
    var A = AT.data, r2 = A.recs[no + "|" + date], st = A.students.filter(function (x) { return x.no === no; })[0] || { no: no, name: "" };
    var kind = r2 ? r2.kind : AT.kind, sub = r2 ? r2.sub : AT.sub, wd = "일월화수목금토"[new Date(date + "T12:00:00").getDay()];
    AT.cell = { no: no, date: date };
    $("atBox").innerHTML = '<h3 class="jua">' + (AT.mode === "range" ? "연속출결입력" : "일일출결입력") + '</h3><p>' + date.replace(/-/g, ".") + " (" + wd + ") · " + no + "번 " + esc(st.name || "") + "</p>" +
      (AT.mode === "range" ? '<div class="atrange"><span class="lab">끝나는 날</span><input class="field" type="date" id="atEnd" value="' + date + '" min="' + date + '" style="width:auto"><span class="hint">주말 · 휴일은 빼고 넣어요</span></div>' : "") +
      '<div class="atgrid">' + AKIND.map(function (k) { return "<b>" + k + "</b>" + ASUB.map(function (sb) { return '<label><input type="radio" name="atk" value="' + k + "|" + sb + '"' + (k === kind && sb === sub ? " checked" : "") + '><span class="sym">' + ASYM[k][sb] + "</span>" + sb + "</label>"; }).join(""); }).join("") + "</div>" +
      '<textarea class="field" id="atWhy" maxlength="200" placeholder="사유 (예: 병원 진료, 체험학습)">' + esc(r2 ? r2.reason : "") + "</textarea>" +
      '<div style="display:flex; gap:8px; margin-top:12px; flex-wrap:wrap"><button class="btn" id="atSave" style="flex:1">저장</button>' + (r2 ? '<button class="btn ghost" id="atDel">이 날 출결 지우기</button>' : "") + '<button class="btn ghost" data-close="atM">닫기</button></div>';
    openModal("atM");
  }
  $("atBox").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    var A = AT.data, cell = AT.cell;
    if (b.id === "atSave") {
      var ch = document.querySelector('input[name="atk"]:checked'); if (!ch) { toast("출결 종류를 골라 주세요"); return; }
      var ks = ch.value.split("|"), why = $("atWhy").value.trim(), list = [];
      if (AT.mode === "range") {
        var end = $("atEnd").value || cell.date;
        A.days.forEach(function (d) { if (d.d >= cell.date && d.d <= end && !d.off && !d.hol) list.push({ no: cell.no, date: d.d, kind: ks[0], sub: ks[1], reason: why }); });
        if (end.slice(0, 7) !== AT.month) toast("다음 달 날짜는 그 달 출결부에서 넣어 주세요");
      } else list.push({ no: cell.no, date: cell.date, kind: ks[0], sub: ks[1], reason: why });
      if (!list.length) { toast("넣을 수 있는 날(평일)이 없어요"); return; }
      AT.kind = ks[0]; AT.sub = ks[1];
      list.forEach(function (x) { A.recs[x.no + "|" + x.date] = { kind: x.kind, sub: x.sub, sym: ASYM[x.kind][x.sub], reason: x.reason }; });
      closeModal("atM"); attDraw();
      write("attendSave", [TPW, list, false], { big: true, busy: "출결 저장 중 · " + list.length + "일", msg: cell.no + "번 " + ks[0] + " " + ks[1] + (list.length > 1 ? " · " + list.length + "일" : "") + " 저장했어요" });
    }
    if (b.id === "atDel") {
      delete A.recs[cell.no + "|" + cell.date]; closeModal("atM"); attDraw();
      write("attendSave", [TPW, [{ no: cell.no, date: cell.date }], true], { big: true, busy: "출결 지우는 중", msg: "출결을 지웠어요" });
    }
  });
  $("atClose").onclick = function () { $("att").classList.remove("on"); };
  $("atSheet").onclick = function () { if (D && D.sheetUrl) window.open(D.sheetUrl, "_blank"); };
  $("atPrev").onclick = function () { var d = new Date(AT.month + "-15T12:00:00"); d.setMonth(d.getMonth() - 1); AT.month = d.getFullYear() + "-" + pad(d.getMonth() + 1); attLoad(); };
  $("atNext").onclick = function () { var d = new Date(AT.month + "-15T12:00:00"); d.setMonth(d.getMonth() + 1); AT.month = d.getFullYear() + "-" + pad(d.getMonth() + 1); attLoad(); };

  // ── 놀이 · 도구함: 시트가 없어도 되는 교실 놀이 · 도구. 자리 · 모둠은 원하면 시트에 저장 ──
  var TOOLS = [
    ["seat", "자리 뽑기", "seat", "#2e77c8", "짝 분단 · 모둠 모양으로. 끌어서 바꾸고, 누르면 고정, 나머지는 랜덤"],
    ["group", "모둠 나누기", "users", "#35915a", "원하는 모둠 수로 고르게 섞고 모둠장도 뽑아요"],
    ["ladder", "사다리 타기", "ladder", "#b3831f", "이름과 결과를 적고 사다리를 따라 내려가요"],
    ["wheel", "돌림판", "wheel", "#2b968f", "우리반 이름이나 직접 적은 칸으로 빙글빙글"],
    ["pick", "발표 뽑기", "dice", "#c9636d", "한 번에 1~5명. 뽑힌 친구 발표 기록까지 한 번에"],
    ["order", "순서 정하기", "order", "#7566c0", "발표 · 급식 · 놀이 순서를 무작위로"],
    ["score", "모둠 점수판", "trophy", "#bd7440", "모둠마다 점수를 크게. 1등 모둠엔 왕관"],
    ["dice", "주사위", "dicei", "#7566c0", "1~3개를 데굴데굴. 합계까지"],
    ["voice", "목소리 크기", "sound", "#2e77c8", "0 조용히 ~ 4 발표 목소리. 활동마다 크게 띄워요"],
    ["read", "독서 · 명상", "book", "#5a7390", "숨쉬기 빛과 잔잔한 소리로 마음을 가라앉혀요"],
    ["timer", "큰 타이머", "timer", "#c9636d", "화면 가득 남은 시간. 끝나면 소리로 알려요"],
    ["clock", "큰 시계", "timer", "#35915a", "멀리서도 보이는 큰 시계와 지금 교시"]];
  var TOOL = "";
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function stepper(id, val) { return '<span class="step"><button data-st="' + id + '" data-d="-1" aria-label="줄이기">−</button><b class="num">' + val + '</b><button data-st="' + id + '" data-d="1" aria-label="늘리기">+</button></span>'; }
  function needTeacher() { if (TPW) return false; toast("시트에 저장은 선생님 모드에서 할 수 있어요"); openModal("tlock"); setTimeout(function () { $("tpw").focus(); }, 60); return true; }
  function openTools(id) { if (!D) return; $("tbx").classList.add("on"); showTool(id || ""); }
  function closeTools() { $("tbx").classList.remove("on"); TOOL = ""; cancelAnimationFrame(WH.raf); micStop(); }
  function showTool(id) {
    if (id !== "voice") micStop();
    TOOL = id; $("tbBack").hidden = !id; $("tbTools").innerHTML = "";
    var t = TOOLS.filter(function (x) { return x[0] === id; })[0];
    $("tbTitle").textContent = t ? t[1] : "놀이 · 도구함";
    if (id === "timer") { closeTools(); $("tBig").click(); return; }
    if (id === "read") { closeTools(); $("readBtn").click(); return; }
    if (id === "clock") { closeTools(); openClock(); return; }
    if (!t) { $("tbb").innerHTML = '<div class="tiles">' + TOOLS.filter(function (x) { return !isOff(x[1]); }).map(function (x) { return '<button class="tile" style="--tc:' + x[3] + '" data-tool="' + x[0] + '"><span class="ti">' + ico(x[2]) + '</span><b class="jua">' + x[1] + "</b><small>" + x[4] + "</small></button>"; }).join("") + "</div>"; return; }
    ({ seat: seatTool, group: groupTool, ladder: ladderTool, wheel: wheelTool, pick: pickTool, order: orderTool, score: scoreTool, dice: diceTool, voice: voiceTool })[id]();
  }
  $("toolBtn").onclick = function () { openTools(""); };
  $("tbClose").onclick = closeTools;
  $("tbBack").onclick = function () { showTool(""); };
  addEventListener("keydown", function (e) { if (e.key === "Escape" && $("tbx").classList.contains("on")) closeTools(); });

  var onC = function (id) { var e = $(id); return !!e && e.classList.contains("on"); };
  var LAYERS = [   // 위에 뜬 것부터
    [function () { return onC("tlock"); }, function () { closeModal("tlock"); }],
    [function () { return onC("acctM"); }, function () { closeModal("acctM"); }],
    [function () { return onC("mealM"); }, function () { closeModal("mealM"); }],
    [function () { return onC("mornM"); }, function () { closeModal("mornM"); }],
    [function () { return onC("atM"); }, function () { closeModal("atM"); }],
    [function () { return onC("bigClock"); }, function () { $("bigClock").classList.remove("on"); }],
    [function () { return onC("bigTimer"); }, function () { $("bigTimer").classList.remove("on"); }],
    [function () { return onC("reading"); }, function () { $("rdClose").click(); }],
    [function () { return onC("att"); }, function () { $("atClose").click(); }],
    [function () { return onC("tbx"); }, function () { if (TOOL) showTool(""); else closeTools(); }],
    [function () { return onC("drawer"); }, function () { closeDrawer(); }],
    [function () { var p = $("mdPanel"); return !!p && !p.hidden; }, function () { $("mdPanel").hidden = true; }],
  ];

  // ── 서랍 탭 색 (연한 바탕 · 진한 글자) ──
  var DTC = { today: ["#e3f1fd", "#1d6fb8"], lesson: ["#fde9e1", "#b4502a"], thermo: ["#fde4e7", "#b8323f"], notice: ["#e3effc", "#1d5a99"], note: ["#fdf3d8", "#956506"], safe: ["#fde7ef", "#b8336a"], tt: ["#e2f6e8", "#1f7a4a"], ev: ["#efe9fd", "#6d4fd0"],
    att: ["#fde4e4", "#b8323f"], month: ["#ffeedd", "#c0601a"], layout: ["#e6e9fd", "#4450c9"], feat: ["#ddf5f2", "#0f7a6e"], set: ["#eef1f5", "#3d4a5c"], sheet: ["#ddf4e6", "#178a55"] };

  // ── 잠금: 아이들이 화면을 누르지 못하게 (시계 · 타이머 · 날씨는 그대로 돈다). 풀 때는 선생님 비밀번호 ──
  var TGO = "";
  function placeUnlock() {
    var b = $("lockBtn"), u = $("kidUnlock"); if (!b || !u) return;
    var r = b.getBoundingClientRect();
    u.innerHTML = ico("lock") + "잠금 풀기";
    if (!r.width) { u.style.top = "12px"; u.style.right = "12px"; u.style.height = "36px"; return; }
    u.style.top = r.top + "px"; u.style.right = Math.max(8, innerWidth - r.right) + "px"; u.style.height = Math.max(34, r.height) + "px";
  }
  function kidLock(on) {
    if (TWIN) return;
    document.body.classList.toggle("locked", on); ls("classdesk-kidlock", on ? "1" : null);
    var b = $("lockBtn"); b.classList.toggle("on", on); b.setAttribute("aria-pressed", on ? "true" : "false");
    $("lockTxt").textContent = on ? "잠금 중" : "잠금"; b.setAttribute("aria-label", on ? "잠금 중" : "잠금"); var sv = b.querySelector("svg"); if (sv) sv.outerHTML = ico(on ? "lock" : "unlock");
    $("kidLock").setAttribute("aria-hidden", on ? "false" : "true");
    if (on) { closeDrawer(); if (TPW) teacherOff(); setTimeout(placeUnlock, 30); }
  }
  $("lockBtn").onclick = function () { kidLock(true); toast("잠갔어요 · 풀 때는 같은 자리 [잠금 풀기] → 선생님 비밀번호"); };
  $("kidUnlock").onclick = function (e) { e.stopPropagation(); TGO = "unlock"; $("tlock").classList.add("over-lock"); openModal("tlock"); setTimeout(function () { $("tpw").focus(); }, 60); };
  $("kidLock").addEventListener("pointerdown", function (e) {
    if (e.target.closest("#kidUnlock")) return;
    e.preventDefault(); var k = $("kidLock"); k.classList.add("poke"); clearTimeout(k._t); k._t = setTimeout(function () { k.classList.remove("poke"); }, 1600);
  });
  ["click", "dblclick", "contextmenu", "wheel"].forEach(function (ev) { $("kidLock").addEventListener(ev, function (e) { if (!e.target.closest("#kidUnlock")) e.preventDefault(); }, { passive: false }); });
  addEventListener("keydown", function (e) {
    if (!document.body.classList.contains("locked")) return;
    if ($("tlock").classList.contains("on") && $("tlock").contains(e.target)) return;   // 비밀번호 칸만 쓸 수 있다
    e.preventDefault(); e.stopImmediatePropagation();
  }, true);
  addEventListener("resize", function () { if (document.body.classList.contains("locked")) placeUnlock(); });
  if (ls("classdesk-kidlock") === "1" && !TWIN) { kidLock(true); setTimeout(placeUnlock, 400); if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeUnlock); }

  // ── 매달 1일부터: 지난달 기록 받기 (제목 옆 알림 + 그날 처음 한 번 안내) ──
  function prevMonth(ym) { var d = new Date(ym + "-15T12:00:00"); d.setMonth(d.getMonth() - 1); return d.getFullYear() + "-" + pad(d.getMonth() + 1); }
  function drawMonthNote() {
    var el = $("monNote"); if (!el || !D || !D.today) return;
    var prev = prevMonth(D.today.slice(0, 7)), since = String((D.settings || {})["설치한 날"] || "");
    var show = !!since && since < D.today.slice(0, 7) + "-01" && ls("classdesk-mr-done") !== prev && ls("classdesk-mr-skip") !== prev;
    var was = !el.hidden; el.hidden = !show;
    if (show) {
      $("monGo").innerHTML = ico("print") + "<span>" + Number(prev.slice(5)) + "월 기록 받기</span>";
      $("monGo").title = "새 달이에요. 지난달(" + prev + ") 출결 · 우유 · 마음 · 노트를 [선생님 → 월별 기록]에서 인쇄하거나 PDF로 받아 두세요";
      if (ls("classdesk-mr-told") !== D.today) { ls("classdesk-mr-told", D.today); setTimeout(function () { toast("새 달이에요 · 지난달 기록은 [선생님 → 월별 기록]에서 인쇄 · PDF로 받아 두세요"); }, 1800); }
    }
    if (was !== show) fitTitle();
  }
  $("monGo").onclick = function () {
    MR.month = prevMonth(D.today.slice(0, 7));
    if (TPW && document.body.classList.contains("teacher")) openDrawer("month");
    else { TGO = "month"; openModal("tlock"); setTimeout(function () { $("tpw").focus(); }, 60); }
  };
  $("monX").onclick = function () { ls("classdesk-mr-skip", prevMonth(D.today.slice(0, 7))); drawMonthNote(); };

  // ── 선생님 서랍 > 월별 기록: 한 달 치를 표로 모아 인쇄 · PDF로 저장 ──
  var MR = { month: "", secs: { att: 1, milk: 1, done: 1, role: 1, talk: 1, feel: 0, notes: 1, thermo: 1 } };
  var MRS = [["att", "출결부"], ["milk", "우유"], ["done", "다 했어요"], ["role", "1인 1역"], ["talk", "발표"], ["notes", "선생님 노트"], ["thermo", "학급 온도계"]];
  function ymText(m) { return m.slice(0, 4) + "년 " + Number(m.slice(5)) + "월"; }
  function monthPane() {
    var cur = D.today.slice(0, 7);
    if (!MR.month) MR.month = Number(D.today.slice(8)) <= 10 ? prevMonth(cur) : cur;
    var opts = "", m = cur;
    for (var i = 0; i < 12; i++) { opts += '<option value="' + m + '"' + (m === MR.month ? " selected" : "") + ">" + ymText(m) + (m === cur ? " (이번 달)" : i === 1 ? " (지난달)" : "") + "</option>"; m = prevMonth(m); }
    return '<div class="dsec"><h4>' + ico("print") + '월별 기록 — 인쇄 · PDF로 저장</h4>' +
      '<p class="muted" style="margin-bottom:10px">한 달 치 기록을 표로 모아 한 번에 인쇄해요. 인쇄 창의 <b>대상</b>을 <b>PDF로 저장</b>으로 고르면 파일로 남아요. 매달 초에 지난달 것을 받아 두면 좋아요.</p>' +
      '<div class="frow"><label for="mrMonth">달</label><select class="field" id="mrMonth" style="flex:1">' + opts + "</select></div>" +
      '<div class="mrsecs" id="mrSecs">' + MRS.map(function (x) { return '<label><input type="checkbox" data-mr="' + x[0] + '"' + (MR.secs[x[0]] ? " checked" : "") + ">" + x[1] + "</label>"; }).join("") + "</div>" +
      '<button class="btn" id="mrPrint">' + ico("print") + " 인쇄 · PDF로 저장</button>" +
      '<p class="muted" style="margin-top:12px">한 종류가 한 장(A4 가로)씩 나와요. 시트에서는 <b>월별 보기</b> 탭의 노란 칸을 눌러 달 · 기록을 골라 볼 수 있어요.</p></div>';
  }
  function monthBind() {
    if (!$("mrMonth")) return;   // 시트에서 가져오는 중이면 아직 그릴 것이 없다
    $("mrMonth").onchange = function () { MR.month = this.value; };
    $("mrSecs").onchange = function (e) { var c = e.target.closest("[data-mr]"); if (c) MR.secs[c.dataset.mr] = c.checked ? 1 : 0; };
    $("mrPrint").onclick = function () { printMonth(MR.month, MR.secs); };
  }
  function printMonth(month, secs) {
    if (!Object.keys(secs).some(function (k) { return secs[k]; })) return toast("인쇄할 기록을 하나 이상 골라 주세요");
    busy("한 달 치 기록을 모으는 중", ymText(month));
    google.script.run.withSuccessHandler(function (R) {
      busyEnd(true, "인쇄 창을 열어요", "대상에서 'PDF로 저장'을 고르면 파일로 남아요");
      var box = $("mreport"); if (!box) { box = document.createElement("div"); box.id = "mreport"; document.body.appendChild(box); }
      box.innerHTML = reportHTML(R, secs);
      var done = function () { document.body.classList.remove("mr-printing"); removeEventListener("afterprint", done); };
      addEventListener("afterprint", done);
      document.body.classList.add("mr-printing");
      if (month === prevMonth(D.today.slice(0, 7))) { ls("classdesk-mr-done", month); drawMonthNote(); }
      setTimeout(function () { window.print(); }, 350);
    }).withFailureHandler(function (e) { fail(e); }).monthData(CODE, TPW, month);
  }
  function reportHTML(R, secs) {
    var days = R.days, title = ymText(R.month), school = days.filter(function (d) { return !d.off && !d.hol; }).length;
    var isOffD = function (i) { return days[i].off || days[i].hol; };
    var head = function (name, sub) { return '<div class="mr-h"><b>' + esc(R.nick) + " · " + title + " · " + name + "</b><span>" + (sub || "") + '</span><span class="r">수업일 ' + school + "일 · 뽑은 날 " + esc(R.today) + "</span></div>"; };
    var thead = function (tail) { return '<thead><tr><th class="mno">번호</th><th class="nm">이름</th>' + days.map(function (d, i) { return '<th class="' + (isOffD(i) ? "off" : "") + '">' + Number(d.d.slice(8)) + "<br><small>" + d.wd + "</small></th>"; }).join("") + tail + "</tr></thead>"; };
    // cell(no, day) → [보이는 글자, 칸 class, 셈 값]
    var grid = function (name, sub, cell, legend, sumName) {
      var col = {}, all = 0;
      var body = R.students.map(function (st) {
        var tot = 0;
        var tds = days.map(function (d, i) { var c = cell(st.no, i + 1); if (c && c[2]) { tot += c[2]; col[i] = (col[i] || 0) + c[2]; } return '<td class="' + (c && c[1] ? c[1] : isOffD(i) ? "off" : "") + '">' + (c ? c[0] : "") + "</td>"; }).join("");
        all += tot;
        return '<tr><td class="mno">' + st.no + '</td><td class="nm">' + esc(st.name || "") + "</td>" + tds + '<td class="sum">' + (tot || "") + "</td></tr>";
      }).join("");
      var foot = '<tr class="ft"><td colspan="2">하루 합계</td>' + days.map(function (d, i) { return '<td class="' + (isOffD(i) ? "off" : "") + '">' + (col[i] || "") + "</td>"; }).join("") + '<td class="sum">' + (all || "") + "</td></tr>";
      return '<section class="mr-page">' + head(name, sub) + '<table class="mr-g">' + thead('<th class="sum">' + (sumName || "합계") + "</th>") + "<tbody>" + body + foot + "</tbody></table>" + (legend ? '<p class="mr-leg">' + legend + "</p>" : "") + "</section>";
    };
    var rec = function (k) { return function (no, d) { var n = ((R.rec[k] || {})[no] || {})[d]; if (!n) return null; return k === "발표" ? [n, "cnt", n] : [n > 1 && k === "다했어요" ? "✓" + n : "✓", "ok", 1]; }; };
    var out = [];
    if (secs.att) {
      var KS = Object.keys(R.sym), cnt = {}, why = [];
      var attCell = function (no, d) { var a = (R.att[no] || {})[d]; if (!a) return null; cnt[no] = cnt[no] || {}; cnt[no][a.k] = (cnt[no][a.k] || 0) + 1; if (a.why) why.push([d, no, a]); return [esc(String(a.sym || "").replace(/^'/, "")), "at", 1]; };
      var g = grid("출결부", "나이스 기호", attCell, KS.map(function (k) { return "<b>" + k + "</b> " + Object.keys(R.sym[k]).map(function (s) { return s + " " + R.sym[k][s]; }).join(" · "); }).join("   |   "), "출결");
      var per = '<table class="mr-list" style="margin-top:8px"><thead><tr><th style="width:70px">번호 · 이름</th>' + KS.map(function (k) { return "<th>" + k + "</th>"; }).join("") + "</tr></thead><tbody>" +
        R.students.filter(function (st) { return cnt[st.no]; }).map(function (st) { return "<tr><td>" + st.no + " " + esc(st.name || "") + "</td>" + KS.map(function (k) { return "<td>" + ((cnt[st.no] || {})[k] || "") + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table>";
      var whyT = why.length ? '<table class="mr-list" style="margin-top:8px"><thead><tr><th style="width:60px">날짜</th><th style="width:90px">번호 · 이름</th><th style="width:110px">종류</th><th>사유</th></tr></thead><tbody>' +
        why.sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; }).map(function (w) { var st = R.students[w[1] - 1] || {}; return "<tr><td>" + Number(R.month.slice(5)) + "/" + w[0] + "</td><td>" + w[1] + " " + esc(st.name || "") + "</td><td>" + esc(w[2].k + " · " + w[2].s) + "</td><td>" + esc(w[2].why) + "</td></tr>"; }).join("") + "</tbody></table>" : "";
      out.push(g.replace("</section>", (Object.keys(cnt).length ? per : '<p class="mr-empty">이 달 출결 기록이 없어요.</p>') + whyT + "</section>"));
    }
    if (secs.milk) out.push(grid("우유 다 먹었어요", "✓ = 그날 마심", rec("우유"), "", "날 수"));
    if (secs.done) out.push(grid("다 했어요", "✓ = 그날 활동을 끝냄 (✓2 = 두 번)", rec("다했어요"), "", "날 수"));
    if (secs.role) out.push(grid("1인 1역", "✓ = 그날 내 역할을 함", rec("1인1역"), "", "날 수"));
    if (secs.talk) out.push(grid("발표", "숫자 = 그날 발표한 횟수", rec("발표"), "", "횟수"));
    if (secs.feel) out.push(grid("오늘 내 마음", "그날 가장 힘든 색 하나 (초 · 노 · 빨)", function (no, d) {
      var f = (R.feel[no] || {})[d]; if (!f) return null; var m = { "초록": ["초", "lg"], "노랑": ["노", "ly"], "빨강": ["빨", "lr"] }[f.l] || ["·", ""]; return [m[0], m[1], 1];
    }, "초 = 초록(좋아요) · 노 = 노랑(그저 그래요) · 빨 = 빨강(힘들어요) — 아이들 화면에는 보이지 않는, 선생님만 보는 기록이에요.", "남긴 날"));
    var list = function (name, heads, rows, widths) {
      return '<section class="mr-page">' + head(name, rows.length + "건") + (rows.length ? '<table class="mr-list"><thead><tr>' + heads.map(function (h, i) { return '<th style="width:' + (widths[i] || "auto") + '">' + h + "</th>"; }).join("") + "</tr></thead><tbody>" +
        rows.map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + esc(c == null ? "" : String(c)) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table>" : '<p class="mr-empty">이 달 기록이 없어요.</p>') + "</section>";
    };
    if (secs.notes) out.push(list("선생님 노트", ["날짜", "번호 · 이름", "분류", "내용"], R.notes.map(function (n) { return [n.d, n.no ? n.no + " " + (n.name || "") : "학급", n.cat, n.text]; }), ["80px", "100px", "60px"]));
    if (secs.thermo) out.push(list("학급 온도계", ["시각", "변화", "이유", "누적"], R.thermo.map(function (t) { return [t.t, (Number(t.d) > 0 ? "+" : "") + t.d, t.why, t.total + "도"]; }), ["110px", "50px", "", "60px"]));
    return out.join("");
  }
  $("atPrint").onclick = function () { printMonth(AT.month || D.today.slice(0, 7), { att: 1 }); };

  // ── 오늘 할 일: 넘칠 때만 아래를 흐리게 ──
  (function () {
    var f = drawTodos;
    function more() {
      var l = document.querySelector(".c-todo .list"); if (!l) return;
      l.style.maxHeight = "";
      var row = l.querySelector(".todo"), h = row ? row.offsetHeight : 0;
      // 넘치면 보이는 높이를 줄 높이의 배수로 — 체크 칸이 반쯤 잘린 채 보이지 않게
      if (h && l.scrollHeight > l.clientHeight + 2) l.style.maxHeight = Math.max(h, Math.floor(l.clientHeight / h) * h) + "px";
      l.classList.toggle("more", l.scrollHeight > l.clientHeight + 2);
    }
    function fit() { var c = document.querySelector(".c-todo"); if (c) c.classList.toggle("roomy", c.clientHeight >= 214); more(); }
    drawTodos = function () { f.apply(this, arguments); fit(); };
    addEventListener("resize", function () { clearTimeout(fit._t); fit._t = setTimeout(fit, 150); });
    // 카드 크기는 배치 · 글꼴이 늦게 정해지면 바뀐다 → 카드가 커지거나 작아질 때마다 다시 맞춘다
    try { var lastH = 0; new ResizeObserver(function () { var c = document.querySelector(".c-todo"); if (c && Math.abs(c.clientHeight - lastH) > 1) { lastH = c.clientHeight; clearTimeout(fit._r); fit._r = setTimeout(fit, 60); } }).observe(document.querySelector(".c-todo")); } catch (e) {}
    $("todoPlus").onclick = function () {
      var a = document.querySelector(".c-todo .add"), on = !a.classList.contains("open");
      a.classList.toggle("open", on); this.setAttribute("aria-expanded", on ? "true" : "false"); this.textContent = on ? "접기" : "+ 추가";
      if (on) setTimeout(function () { $("todoText").focus(); }, 30); more();
    };
  })();

  // ── 뒤로가기 · Esc: 맨 위 창 하나만 닫는다. 아무 창도 없으면 뒤로가기를 한 번 더 눌러야 바탕화면을 나간다 ──
  //   앱스 스크립트판은 google.script.history, 앱판(kimman.kr)은 브라우저 history. 기록 칸은 사용자가 누를 때 하나만 걸어 둔다
  (function () {
    var GH = window.google && google.script && google.script.history, armed = false, warned = 0;
    function top() { for (var i = 0; i < LAYERS.length; i++) if (LAYERS[i][0]()) return LAYERS[i]; return null; }
    function arm() { if (armed) return; try { if (GH) GH.push({ desk: 1 }, {}, ""); else history.pushState({ desk: 1 }, ""); armed = true; } catch (e) {} }
    function pop() {
      armed = false; var t = top();
      if (document.body.classList.contains("locked") && !onC("tlock")) { arm(); return; }
      if (t) { t[1](); arm(); return; }   // 닫고 바로 다시 걸어 둔다 (연달아 눌러도 한 겹씩)
      if (Date.now() - warned > 4000) { warned = Date.now(); toast("뒤로 가기를 한 번 더 누르면 바탕화면을 나가요"); }
    }
    addEventListener("keydown", function (e) { if (e.key !== "Escape") return; var t = top(); if (!t) return; e.preventDefault(); e.stopImmediatePropagation(); t[1](); }, true);
    ["pointerdown", "keydown"].forEach(function (ev) { addEventListener(ev, arm, true); });
    try { if (GH) GH.setChangeHandler(pop); else addEventListener("popstate", pop); } catch (e) {}
  })();
  $("tbx").addEventListener("click", function (e) {
    var t = e.target.closest("[data-tool]"); if (t) return showTool(t.dataset.tool);
    var st = e.target.closest("[data-st]"); if (st) return stepTool(st.dataset.st, Number(st.dataset.d));
    var b = e.target.closest("button"); if (b && b.id && TOOLACT[b.id]) TOOLACT[b.id](b);
  });
  var TOOLACT = {};
  function stepTool(id, d) {
    if (["scol", "srow", "sgrp"].indexOf(id) >= 0) { var pp = seatPeople();
      if (id === "scol") SEAT.cols = Math.max(2, Math.min(10, SEAT.cols + d));
      if (id === "srow") SEAT.rows = Math.max(1, Math.min(8, SEAT.rows + d));
      if (id === "sgrp") SEAT.groups = Math.max(2, Math.min(12, SEAT.groups + d));
      seatRebuild(pp); }
    if (id === "gk") { GRP.k = Math.max(2, Math.min(12, GRP.k + d)); grpDeal(); grpDraw(); }
    if (id === "ln") { LAD.n = Math.max(2, Math.min(40, LAD.n + d)); ladFit(); ladDraw(); }
    if (id === "pk") { PK.k = Math.max(1, Math.min(5, PK.k + d)); pickDraw(); }
    if (id === "sc") { SC.n = Math.max(2, Math.min(8, SC.n + d)); scFit(); scoreTool(); }
    if (id === "dn") { DI.n = Math.max(1, Math.min(3, DI.n + d)); DI.v = DI.v.slice(0, DI.n); while (DI.v.length < DI.n) DI.v.push(1 + Math.floor(Math.random() * 6)); diceTool(); }
  }

  // 자리 뽑기 ------------------------------------------------------------
  var SEAT = null, SMODES = { pair: ["짝 분단", 2, 0, 0], one: ["한 줄씩", 1, 0, 0], g4: ["모둠 4명", 2, 2, 4], g6: ["모둠 6명", 2, 3, 6] };
  function seatCfg() { var m = SMODES[SEAT.mode]; return { pair: m[1], rp: m[2], gs: m[3], across: Math.max(1, SEAT.cols / 2) }; }
  function seatNew(mode, keep) {
    var n = D.students.length, m = SMODES[mode];
    SEAT = { mode: mode, cols: 6, rows: Math.ceil(n / 6), groups: Math.ceil(n / (m[3] || 4)), desks: [] };
    seatRebuild(keep || D.students.map(function (s) { return { no: s.no, fixed: false }; }));
  }
  function seatOrder() {   // 학생을 채우는 순서: 분단은 앞줄부터, 모둠은 모둠마다 돌아가며 (빈자리가 한 모둠에 몰리지 않게)
    var c = seatCfg(), out = [];
    if (!c.rp) { for (var r = 0; r < SEAT.rows; r++) for (var k = 0; k < SEAT.cols; k++) if (!SEAT.desks[r][k].off) out.push([r, k]); return out; }
    var list = [];
    for (var g = 0; g < SEAT.groups; g++) { var gr = Math.floor(g / c.across) * c.rp, gc = (g % c.across) * 2, cells = [];
      for (var i = 0; i < c.rp; i++) for (var j = 0; j < 2; j++) if (SEAT.desks[gr + i] && !SEAT.desks[gr + i][gc + j].off) cells.push([gr + i, gc + j]); list.push(cells); }
    for (var s = 0; s < 6; s++) list.forEach(function (cells) { if (cells[s]) out.push(cells[s]); });
    return out;
  }
  function seatPeople() { var out = []; seatOrder().forEach(function (p) { var d = SEAT.desks[p[0]][p[1]]; if (d.no) out.push({ no: d.no, fixed: d.fixed }); }); return out; }
  function seatRebuild(people) {
    people = people || seatPeople();
    var c = seatCfg();
    if (c.rp) { SEAT.cols = Math.min(SEAT.groups, 4) * 2; SEAT.rows = Math.ceil(SEAT.groups / (SEAT.cols / 2)) * c.rp; c = seatCfg(); }
    SEAT.desks = [];
    for (var r = 0; r < SEAT.rows; r++) { var row = []; for (var k = 0; k < SEAT.cols; k++) {
      var g = c.rp ? Math.floor(r / c.rp) * c.across + Math.floor(k / 2) : 0; row.push(c.rp && g >= SEAT.groups ? { off: true } : {}); } SEAT.desks.push(row); }
    var known = {}; D.students.forEach(function (s) { known[s.no] = 1; });
    var placed = {};
    people = people.filter(function (p) { return known[p.no]; });
    D.students.forEach(function (s) { if (!people.some(function (p) { return p.no === s.no; })) people.push({ no: s.no, fixed: false }); });
    seatOrder().forEach(function (p, i) { var who = people[i]; if (who && !placed[who.no]) { SEAT.desks[p[0]][p[1]] = { no: who.no, fixed: who.fixed }; placed[who.no] = 1; } });
    var left = people.filter(function (p) { return !placed[p.no]; }).length;
    seatSave(); seatDraw(left);
  }
  function seatSave() { ls("classdesk-seat", JSON.stringify(SEAT)); }
  function seatTool() {
    if (!SEAT) { try { SEAT = JSON.parse(ls("classdesk-seat") || "null"); } catch (e) {} }
    if (!SEAT) { try { var sv = JSON.parse(D.seats || "null"); SEAT = sv && sv.state; } catch (e) {} }
    if (!SEAT || !SEAT.desks || !SMODES[SEAT.mode]) seatNew("pair"); else seatRebuild(seatPeople());
  }
  function seatDraw(left, anim) {
    var c = seatCfg(), cols = [], rows = [], h = "";
    for (var k = 0; k < SEAT.cols; k++) { cols.push("minmax(0,1fr)"); if ((k + 1) % c.pair === 0 && k < SEAT.cols - 1) cols.push("clamp(10px,2.2vw,34px)"); }
    for (var r = 0; r < SEAT.rows; r++) { rows.push("minmax(0,1fr)"); if (c.rp && (r + 1) % c.rp === 0 && r < SEAT.rows - 1) rows.push("clamp(12px,2.4vh,30px)"); }
    var i = 0;
    SEAT.desks.forEach(function (row, r) { row.forEach(function (d, k) {
      var gc = k + (c.pair ? Math.floor(k / c.pair) : 0) + 1, gr = r + (c.rp ? Math.floor(r / c.rp) : 0) + 1, blk = c.rp ? (Math.floor(r / c.rp) + Math.floor(k / 2)) % 2 : Math.floor(k / c.pair) % 2;
      var s = d.no ? student(d.no) : null, cls = d.off ? "off" : !d.no ? "empty" : (d.fixed ? "fixed " : "") + "g" + blk + (showMode() !== "no" && s.name ? " big" : "");
      var body = d.off ? "" : !d.no ? '<span class="n">빈자리</span>' : nameBig(s) ? '<span class="nm jua" style="font-size:min(30cqh,20cqw); color:#46336e">' + esc(s.name) + "</span>" + (showMode() === "nb" ? '<span class="nm">' + s.no + "번</span>" : "") : numHTML(s);
      h += '<div class="desk ' + cls + (anim && d.no && !d.fixed ? " land" : "") + '" data-drop="seat" data-r="' + r + '" data-c="' + k + '" style="grid-row:' + gr + "; grid-column:" + gc + (anim ? "; animation-delay:" + (i++ * 22) + "ms" : "") + '">' + body + "</div>";
    }); });
    var modeChips = Object.keys(SMODES).map(function (m) { return '<button class="chip' + (SEAT.mode === m ? " on" : "") + '" data-smode="' + m + '">' + SMODES[m][0] + "</button>"; }).join("");
    var size = c.rp ? '<span class="lab">모둠 수</span>' + stepper("sgrp", SEAT.groups) : '<span class="lab">가로</span>' + stepper("scol", SEAT.cols) + '<span class="lab">세로</span>' + stepper("srow", SEAT.rows);
    var seats = 0; SEAT.desks.forEach(function (row) { row.forEach(function (d) { if (!d.off) seats++; }); });
    $("tbb").innerHTML = '<div class="tbar">' + modeChips + '<span style="width:8px"></span>' + size +
      '<span class="sp" style="margin-left:auto"></span><button class="btn" id="sShuffle">' + ico("shuffle") + "랜덤 섞기</button><button class=\"btn ghost\" id=\"sOrder\">번호순</button><button class=\"btn ghost\" id=\"sUnfix\">고정 모두 풀기</button><button class=\"btn ghost\" id=\"sSave\">" + ico("save") + "시트에 저장</button></div>" +
      '<p class="hint" style="margin-bottom:10px">책상을 끌어 다른 책상에 놓으면 자리가 바뀌어요. 학생 책상을 누르면 <b>고정</b>(랜덤 섞기에서 그대로), 빈 책상을 누르면 쓰지 않는 자리가 돼요. 자리 ' + seats + '개 · 학생 ' + D.students.length + "명" +
      (left ? ' · <b style="color:#c9636d">자리가 ' + left + "개 모자라요</b>" : "") + "</p>" +
      '<div class="room"><div class="board jua">칠판</div><div class="desks" id="desks" style="grid-template-columns:' + cols.join(" ") + "; grid-template-rows:" + rows.join(" ") + '">' + h + "</div></div>";
  }
  $("tbb").addEventListener("click", function (e) { var m = e.target.closest("[data-smode]"); if (m && SEAT) { var people = seatPeople(); SEAT.mode = m.dataset.smode; var n = D.students.length;
    SEAT.groups = Math.ceil(n / (SMODES[SEAT.mode][3] || 4)); if (!SMODES[SEAT.mode][2]) { SEAT.cols = 6; SEAT.rows = Math.ceil(n / 6); } seatRebuild(people); } });
  TOOLACT.sShuffle = function () {
    var free = seatOrder().filter(function (p) { var d = SEAT.desks[p[0]][p[1]]; return !(d.no && d.fixed); });
    var fixed = {}; SEAT.desks.forEach(function (row) { row.forEach(function (d) { if (d.no && d.fixed) fixed[d.no] = 1; }); });
    var pool = shuffle(D.students.filter(function (s) { return !fixed[s.no]; }).map(function (s) { return s.no; }));
    var k = 0, steps = REDUCE ? 0 : 7;
    (function roll() {
      free.forEach(function (p, i) { SEAT.desks[p[0]][p[1]] = k < steps ? { no: pool[Math.floor(Math.random() * pool.length)] } : pool[i] ? { no: pool[i] } : {}; });
      if (k < steps) { k++; seatDraw(0); setTimeout(roll, 70); return; }
      seatSave(); seatDraw(Math.max(0, pool.length - free.length), true);
      var p = center($("desks")); confetti(p[0], p[1] - 60, 70); chimeOn() && chime([659, 784, 988]);
    })();
  };
  TOOLACT.sOrder = function () { var fixed = {}; SEAT.desks.forEach(function (row) { row.forEach(function (d) { if (d.no && d.fixed) fixed[d.no] = 1; }); });
    var pool = D.students.filter(function (s) { return !fixed[s.no]; }).map(function (s) { return s.no; });
    seatOrder().filter(function (p) { var d = SEAT.desks[p[0]][p[1]]; return !(d.no && d.fixed); }).forEach(function (p, i) { SEAT.desks[p[0]][p[1]] = pool[i] ? { no: pool[i] } : {}; });
    seatSave(); seatDraw(0, true); };
  TOOLACT.sUnfix = function () { SEAT.desks.forEach(function (row) { row.forEach(function (d) { d.fixed = false; }); }); seatSave(); seatDraw(); };
  TOOLACT.sSave = function () {
    if (needTeacher()) return;
    var c = seatCfg(), out = [];
    SEAT.desks.forEach(function (row, r) {
      out.push(row.map(function (d) { return d.off ? { off: true } : d.no ? { no: d.no, name: student(d.no).name, fixed: !!d.fixed } : {}; }));
      if (c.rp && (r + 1) % c.rp === 0 && r < SEAT.rows - 1) out.push(row.map(function () { return null; }));
    });
    var json = JSON.stringify({ title: "우리반 자리 (" + SMODES[SEAT.mode][0] + ")", rows: out.length, cols: SEAT.cols, pair: c.pair, desks: out, state: SEAT });
    D.seats = json;
    write("saveSeats", [TPW, json], { big: true, busy: "자리를 시트에 그리는 중", msg: "시트 '자리배치' 탭에 교실 모양으로 저장했어요" });
  };
  $("tbb").addEventListener("pointerdown", function (e) {
    var dk = e.target.closest(".desk"); if (!dk || TOOL !== "seat") return;
    e.preventDefault();
    dragStart(e, dk, "seat", function (tg, ev, moved) {
      var a = SEAT.desks[dk.dataset.r][dk.dataset.c];
      if (!moved) { if (a.no) a.fixed = !a.fixed; else a.off = !a.off; if (!a.off) delete a.off; seatSave(); seatDraw(); return; }
      if (!tg || a.off) return;
      var b = SEAT.desks[tg.dataset.r][tg.dataset.c]; if (b.off) return;
      SEAT.desks[tg.dataset.r][tg.dataset.c] = a; SEAT.desks[dk.dataset.r][dk.dataset.c] = b; seatSave(); seatDraw();
    });
  });

  // 모둠 나누기 ------------------------------------------------------------
  var GRP = null, GCOL = ["#2e77c8", "#c9636d", "#b3831f", "#35915a", "#bd7440", "#5a7390", "#7566c0", "#2b968f"];
  function groupTool() { if (!GRP || GRP.n !== D.students.length) { GRP = { n: D.students.length, k: Math.max(2, Math.ceil(D.students.length / 4)), groups: [], fixed: {}, lead: {} }; grpDeal(true); } grpDraw(); }
  function grpDeal(inOrder) {   // 고정한 친구는 제자리, 나머지는 인원이 고르게
    var keep = []; for (var g = 0; g < GRP.k; g++) keep.push((GRP.groups[g] || []).filter(function (no) { return GRP.fixed[no]; }));
    var placed = {}; keep.forEach(function (g) { g.forEach(function (no) { placed[no] = 1; }); });
    Object.keys(GRP.fixed).forEach(function (no) { if (!placed[no]) delete GRP.fixed[no]; });
    var pool = D.students.map(function (s) { return s.no; }).filter(function (no) { return !placed[no]; });
    if (!inOrder) pool = shuffle(pool);
    pool.forEach(function (no) { var min = 0; keep.forEach(function (g, i) { if (g.length < keep[min].length) min = i; }); keep[min].push(no); });
    GRP.groups = keep; GRP.lead = {};
  }
  function grpDraw(anim) {
    $("tbb").innerHTML = '<div class="tbar"><span class="lab">모둠 수</span>' + stepper("gk", GRP.k) + '<span class="sp" style="margin-left:auto"></span><button class="btn" id="gShuffle">' + ico("shuffle") + '섞기</button><button class="btn ghost" id="gLead">' + ico("crown") + '모둠장 뽑기</button><button class="btn ghost" id="gUnfix">고정 모두 풀기</button><button class="btn ghost" id="gSave">' + ico("save") + "시트에 저장</button></div>" +
      '<p class="hint" style="margin-bottom:12px">이름을 끌어 다른 모둠에 놓으면 옮겨져요. 이름을 누르면 <b>고정</b>(섞어도 그 모둠에 그대로).</p><div class="groups">' +
      GRP.groups.map(function (g, i) { return '<div class="grp" data-drop="grp" data-g="' + i + '" style="--gc:' + GCOL[i % GCOL.length] + '"><h3 class="jua">' + (i + 1) + '모둠 <small class="muted" style="font-family:inherit">' + g.length + "명</small></h3><div class=\"mem\">" +
        g.map(function (no, j) { return '<span class="mc' + (GRP.fixed[no] ? " fixed" : "") + (GRP.lead[i] === no ? " lead" : "") + (anim ? " land" : "") + '" data-no="' + no + '" data-g="' + i + '"' + (anim ? ' style="animation-delay:' + (j * 60 + i * 30) + 'ms"' : "") + ">" +
          (GRP.lead[i] === no ? ico("crown") : GRP.fixed[no] ? ico("pin") : "") + esc(label(student(no))) + "</span>"; }).join("") + "</div></div>"; }).join("") + "</div>";
  }
  TOOLACT.gShuffle = function () { grpDeal(); grpDraw(true); var p = center($("tbb")); confetti(p[0], p[1] - 100, 60); chimeOn() && chime([659, 784, 988]); };
  TOOLACT.gLead = function () { GRP.groups.forEach(function (g, i) { if (g.length) GRP.lead[i] = g[Math.floor(Math.random() * g.length)]; }); grpDraw(); chimeOn() && chime([784, 988, 1175]); };
  TOOLACT.gUnfix = function () { GRP.fixed = {}; grpDraw(); };
  TOOLACT.gSave = function () { if (needTeacher()) return; var g = GRP.groups.map(function (x) { return x.slice(); }); write("saveGroups", [TPW, g], { big: true, busy: "모둠을 시트에 저장하는 중", msg: "시트 '모둠' 탭에 저장했어요" }); };
  $("tbb").addEventListener("pointerdown", function (e) {
    var mc = e.target.closest(".mc"); if (!mc || TOOL !== "group") return;
    e.preventDefault();
    dragStart(e, mc, "grp", function (tg, ev, moved) {
      var no = Number(mc.dataset.no), from = Number(mc.dataset.g);
      if (!moved) { if (GRP.fixed[no]) delete GRP.fixed[no]; else GRP.fixed[no] = 1; grpDraw(); return; }
      if (!tg) return;
      var target = Number(tg.dataset.g); if (target === from) return;
      GRP.groups[from] = GRP.groups[from].filter(function (x) { return x !== no; }); GRP.groups[target].push(no); grpDraw();
    });
  });

  // 학생 고르기 (사다리 · 돌림판이 같이 씀) ------------------------------------------------------------
  function pickerHTML(sel, scope, extra) {
    var n = D.students.filter(function (x) { return sel[x.no]; }).length;
    return '<div class="picker"><div class="pk-bar"><b>학생 고르기</b><button class="chip" data-pka="all" data-sc="' + scope + '">전체 선택</button><button class="chip" data-pka="none" data-sc="' + scope + '">모두 해제</button>' +
      '<span class="hint">' + n + "명 골랐어요</span>" + (extra || "") + '</div><div class="pk-list">' +
      D.students.map(function (x) { return '<button class="chip' + (sel[x.no] ? " on" : "") + '" data-pk="' + x.no + '" data-sc="' + scope + '">' + esc(label(x)) + "</button>"; }).join("") + "</div></div>";
  }
  $("tbb").addEventListener("click", function (e) {
    var b = e.target.closest("[data-pk],[data-pka]"); if (!b) return;
    var sel = b.dataset.sc === "lad" ? LAD.sel : WH.sel;
    if (b.dataset.pk) { var no = Number(b.dataset.pk); if (sel[no]) delete sel[no]; else sel[no] = 1; }
    if (b.dataset.pka) D.students.forEach(function (x) { if (b.dataset.pka === "all") sel[x.no] = 1; else delete sel[x.no]; });
    if (b.dataset.sc === "lad") ladDraw(); else { WH.out = {}; wheelTool(); }
  });

  // 사다리 타기: 위 · 아래 칸 수는 같게(사다리 규칙), 칸 이름은 학생 고르기 · 직접 적기 · 빠른 채우기 --------------------------
  var LAD = null;
  function ladderTool() { if (!LAD) { LAD = { n: 4, top: [], bottom: [], rungs: null, done: {}, pick: "", sel: {} }; ladFit(true); } ladDraw(); }
  function ladFit(fresh) {
    var pool = shuffle(D.students);
    for (var i = 0; i < LAD.n; i++) {
      if (fresh || LAD.top[i] == null) LAD.top[i] = fresh ? (pool[i] ? label(pool[i]) : (i + 1) + "번") : "";
      if (fresh || LAD.bottom[i] == null) LAD.bottom[i] = fresh ? (i ? "통과" : "당첨") : "";
    }
    LAD.top.length = LAD.bottom.length = LAD.n; LAD.rungs = null; LAD.done = {};
  }
  function ladDraw() {
    var n = LAD.n, play = !!LAD.rungs, fs = Math.max(11, Math.min(17, Math.floor(1500 / n / 5.2))), W = "min(100%," + Math.max(960, n * 96) + "px)";
    var cols = "repeat(" + n + ",minmax(0,1fr))", gap = n > 14 ? 4 : 8;
    var bar = '<div class="tbar"><span class="lab">칸 수</span>' + stepper("ln", n) +
      (play ? '<span class="sp" style="margin-left:auto"></span><button class="btn" id="lAll">' + ico("eye") + '모두 결과 보기</button><button class="btn ghost" id="lEdit">다시 적기</button>'
        : '<button class="chip' + (LAD.pick === "top" ? " on" : "") + '" id="lPickTop">위에 학생 넣기</button><button class="chip' + (LAD.pick === "bottom" ? " on" : "") + '" id="lPickBot">아래에 학생 넣기</button>' +
          '<button class="chip" id="lFill">위: 우리반 무작위</button><span class="lab" style="margin-left:6px">아래 빠르게</span><button class="chip" id="lWin">당첨 1 · 나머지 통과</button>' +
          '<button class="chip" id="lNum">1등 ~ ' + n + '등</button><button class="chip" id="lClr">아래 비우기</button><span class="sp" style="margin-left:auto"></span><button class="btn" id="lGo">' + ico("ladder") + "사다리 만들기</button>") + "</div>";
    var pk = !play && LAD.pick ? pickerHTML(LAD.sel, "lad", '<button class="btn sm" id="lPut">고른 학생을 ' + (LAD.pick === "top" ? "위" : "아래") + '에 넣기</button><button class="chip" id="lPickX">닫기</button>') : "";
    var row = function (arr, side) {
      return '<div class="lrow" style="grid-template-columns:' + cols + "; gap:" + gap + "px; width:" + W + '">' + arr.map(function (t, i) {
        if (!play) return '<input data-li="' + side + i + '" value="' + esc(t) + '" maxlength="12" placeholder="' + (side === "t" ? "이름" : "결과") + '" aria-label="' + (side === "t" ? "위 " : "아래 ") + (i + 1) + '">';
        if (side === "t") return '<button style="--lc:' + PAL[i % 8] + '" data-lt="' + i + '">' + esc(t || "?") + "</button>";
        var who = LAD.done["w" + i]; return '<button class="res' + (LAD.done["b" + i] ? " show" : "") + '" style="--lc:' + (LAD.done["b" + i] || "#c9636d") + '" data-lb="' + i + '"' + (who ? ' title="' + esc(who) + '"' : "") + ">" + esc((who && n <= 8 ? who + " → " : "") + (t || "")) + "</button>";
      }).join("") + "</div>";
    };
    $("tbb").innerHTML = bar + pk + '<p class="hint" style="margin-bottom:6px">' + (play ? "위의 이름을 누르면 사다리를 따라 내려가요." : "위 · 아래 칸을 눌러 직접 적거나, 학생을 골라 넣어요. 위와 아래 칸 수는 같아요(사다리 규칙).") + "</p>" +
      '<div class="ladder" style="--lfs:' + fs + 'px">' + row(LAD.top, "t") + '<svg class="lsvg" id="lsvg" style="width:' + W + '"></svg>' + row(LAD.bottom, "b") + "</div>";
    ladSvg();
  }
  $("tbb").addEventListener("input", function (e) { var li = e.target.dataset && e.target.dataset.li; if (!li || !LAD) return; (li[0] === "t" ? LAD.top : LAD.bottom)[Number(li.slice(1))] = e.target.value; });
  TOOLACT.lPickTop = function () { LAD.pick = LAD.pick === "top" ? "" : "top"; ladDraw(); };
  TOOLACT.lPickBot = function () { LAD.pick = LAD.pick === "bottom" ? "" : "bottom"; ladDraw(); };
  TOOLACT.lPickX = function () { LAD.pick = ""; ladDraw(); };
  TOOLACT.lPut = function () {
    var names = D.students.filter(function (x) { return LAD.sel[x.no]; }).map(label);
    if (names.length < 2) { toast("두 명 이상 골라 주세요"); return; }
    var other = LAD.pick === "top" ? LAD.bottom : LAD.top;
    LAD.n = names.length; if (LAD.pick === "top") LAD.top = shuffle(names); else LAD.bottom = shuffle(names);
    other.length = LAD.n; for (var i = 0; i < LAD.n; i++) if (other[i] == null) other[i] = LAD.pick === "top" ? "통과" : "";
    LAD.pick = ""; LAD.rungs = null; LAD.done = {}; ladDraw();
  };
  TOOLACT.lFill = function () { var pool = shuffle(D.students); LAD.top = LAD.top.map(function (t, i) { return pool[i] ? label(pool[i]) : t; }); LAD.rungs = null; LAD.done = {}; ladDraw(); };
  TOOLACT.lWin = function () { LAD.bottom = LAD.bottom.map(function (_, i) { return i ? "통과" : "당첨"; }); ladDraw(); };
  TOOLACT.lNum = function () { LAD.bottom = LAD.bottom.map(function (_, i) { return (i + 1) + "등"; }); ladDraw(); };
  TOOLACT.lClr = function () { LAD.bottom = LAD.bottom.map(function () { return ""; }); ladDraw(); };
  TOOLACT.lGo = function () {
    var L = Math.max(10, Math.min(30, LAD.n + 6)), r = [];
    for (var j = 0; j < L; j++) { var row = []; for (var i = 0; i < LAD.n - 1; i++) row.push(!row[i - 1] && Math.random() < .5); r.push(row); }
    for (var g = 0; g < LAD.n - 1; g++) if (!r.some(function (row) { return row[g]; })) { var jj = Math.floor(Math.random() * L); r[jj][g] = true; if (r[jj][g - 1]) r[jj][g - 1] = false; if (r[jj][g + 1]) r[jj][g + 1] = false; }
    LAD.rungs = r; LAD.done = {}; LAD.pick = ""; ladDraw();
  };
  TOOLACT.lEdit = function () { LAD.rungs = null; LAD.done = {}; ladDraw(); };
  TOOLACT.lAll = function () { var i = 0; (function next() { if (i >= LAD.n || TOOL !== "ladder") return; ladTrace(i++); setTimeout(next, REDUCE ? 50 : LAD.n > 12 ? 450 : 900); })(); };
  function ladGeo() { var sv = $("lsvg"), W = sv.clientWidth, H = sv.clientHeight, L = LAD.rungs ? LAD.rungs.length : 10;
    return { W: W, H: H, x: function (i) { return (i + .5) * W / LAD.n; }, y: function (j) { return 14 + (j + 1) * (H - 28) / (L + 1); } }; }
  function ladSvg() {
    var sv = $("lsvg"); if (!sv) return; var G = ladGeo(), h = "", sw = LAD.n > 16 ? 4 : 6;
    sv.setAttribute("viewBox", "0 0 " + G.W + " " + G.H);
    for (var i = 0; i < LAD.n; i++) h += '<line x1="' + G.x(i) + '" y1="0" x2="' + G.x(i) + '" y2="' + G.H + '" stroke="#d9d4ea" stroke-width="' + sw + '" stroke-linecap="round"/>';
    if (LAD.rungs) LAD.rungs.forEach(function (row, j) { row.forEach(function (on, g) { if (on) h += '<line x1="' + G.x(g) + '" y1="' + G.y(j) + '" x2="' + G.x(g + 1) + '" y2="' + G.y(j) + '" stroke="#d9d4ea" stroke-width="' + sw + '" stroke-linecap="round"/>'; }); });
    else h += '<rect x="0" y="' + (G.H * .18) + '" width="' + G.W + '" height="' + (G.H * .64) + '" rx="20" fill="rgba(117,102,192,.08)"/><text x="' + G.W / 2 + '" y="' + G.H / 2 + '" text-anchor="middle" font-family="Jua, sans-serif" font-size="22" fill="#9a93c0">가로줄은 [사다리 만들기]를 누르면 생겨요</text>';
    sv.innerHTML = h + '<g id="ltrace"></g>';
  }
  function ladTrace(start) {
    if (!LAD.rungs || LAD.done["t" + start]) return;
    var G = ladGeo(), c = start, pts = [[G.x(c), 0]];
    LAD.rungs.forEach(function (row, j) { var y = G.y(j); if (row[c]) { pts.push([G.x(c), y]); c++; pts.push([G.x(c), y]); } else if (row[c - 1]) { pts.push([G.x(c), y]); c--; pts.push([G.x(c), y]); } });
    pts.push([G.x(c), G.H]);
    var len = 0; for (var i = 1; i < pts.length; i++) len += Math.abs(pts[i][0] - pts[i - 1][0]) + Math.abs(pts[i][1] - pts[i - 1][1]);
    var col = PAL[start % 8], p = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    p.setAttribute("points", pts.map(function (q) { return q.join(","); }).join(" ")); p.setAttribute("fill", "none"); p.setAttribute("stroke", col); p.setAttribute("stroke-width", LAD.n > 16 ? "5" : "7");
    p.setAttribute("stroke-linecap", "round"); p.setAttribute("stroke-linejoin", "round"); p.style.strokeDasharray = len; p.style.strokeDashoffset = len; p.style.transition = "stroke-dashoffset " + (REDUCE ? 0 : 1.8) + "s cubic-bezier(.45,0,.55,1)";
    $("ltrace").appendChild(p); void p.getBoundingClientRect(); p.style.strokeDashoffset = 0;
    LAD.done["t" + start] = 1;
    setTimeout(function () { LAD.done["b" + c] = col; LAD.done["w" + c] = LAD.top[start]; var b = document.querySelector('[data-lb="' + c + '"]');
      if (b) { b.classList.add("show"); b.style.setProperty("--lc", col); b.title = LAD.top[start]; b.textContent = (LAD.n <= 8 ? LAD.top[start] + " → " : "") + LAD.bottom[c]; var q = center(b); confetti(q[0], q[1], 26, [col, "#fff", "#e0b341"]); }
      var tb = document.querySelector('[data-lt="' + start + '"]'); if (tb) { tb.style.background = col; tb.style.color = "#fff"; }
      chimeOn() && chime([784, 988]); }, REDUCE ? 0 : 1800);
  }
  $("tbb").addEventListener("click", function (e) { var t = e.target.closest("[data-lt]"); if (t && TOOL === "ladder") ladTrace(Number(t.dataset.lt)); });
  addEventListener("resize", function () { if (TOOL === "ladder") ladDraw(); if (TOOL === "wheel") whDraw(); });

  // 돌림판: 우리반 모두 / 골라서 / 직접 적기. 같은 말을 여러 번 적으면 그만큼 칸이 커진다 ------------------------------
  var WH = { src: "class", sel: {}, text: "청소 당번\n칭찬 스티커\n노래 한 소절\n통과\n박수 세 번\n선생님 퀴즈", angle: 0, raf: 0, spin: false, drop: false, res: "", out: {}, outT: {} };
  function whRaw() {
    if (WH.src === "custom") {
      var seen = {};
      return WH.text.split(/[\n,]/).map(function (x) { return x.trim(); }).filter(String).filter(function (x) { seen[x] = (seen[x] || 0) + 1; return seen[x] > (WH.outT[x] || 0); });
    }
    return D.students.filter(function (x) { return !WH.out[x.no] && (WH.src === "class" || (WH.src === "boy" && x.sex === "남") || (WH.src === "girl" && x.sex === "여") || (WH.src === "pick" && WH.sel[x.no])); }).map(label);
  }
  function sexCount(sx) { return D.students.filter(function (x) { return x.sex === sx; }).length; }
  function whSegs() { var segs = [], at = {}; whRaw().forEach(function (x) { if (at[x] == null) { at[x] = segs.length; segs.push({ t: x, w: 0 }); } segs[at[x]].w++; }); return segs; }
  function wheelTool() {
    var pick = WH.src === "pick";
    $("tbb").innerHTML = '<div class="wheelbox"><div class="wheelwrap"><canvas id="whCv"></canvas><span class="ptr"></span></div><div>' +
      '<div class="tbar">' + [["class", "우리반 모두"], ["boy", "남학생"], ["girl", "여학생"], ["pick", "골라서"], ["custom", "직접 적기"]].map(function (x) { return '<button class="chip' + (WH.src === x[0] ? " on" : "") + '" data-wsrc="' + x[0] + '">' + x[1] + (x[0] === "boy" || x[0] === "girl" ? ' <small class="num">' + sexCount(x[0] === "boy" ? "남" : "여") + "</small>" : "") + "</button>"; }).join("") + "</div>" +
      ((WH.src === "boy" || WH.src === "girl") && !sexCount(WH.src === "boy" ? "남" : "여") ? '<p class="hint" style="margin-top:6px">시트 <b>학생</b> 탭의 <b>성별</b> 칸에 남 · 여를 적으면 따로 돌릴 수 있어요.</p>' : "") +
      (pick ? pickerHTML(WH.sel, "wh") : "") +
      (WH.src === "custom" ? '<textarea class="field" id="whText" placeholder="한 줄에 하나씩">' + esc(WH.text) + '</textarea><p class="hint" style="margin-top:4px">같은 말을 여러 번 적으면 그만큼 칸이 커져요 (예: 야호 2번 → 2칸)</p>' : "") +
      '<div class="tbar" style="margin-top:10px"><button class="chip' + (WH.drop ? " on" : "") + '" id="whDrop">뽑힌 칸 빼기</button><button class="chip" id="whReset">처음부터</button></div>' +
      '<button class="btn jua" id="whGo" style="width:100%; padding:16px; font-size:24px; margin-top:6px; background:linear-gradient(135deg,#e0884f,#c9636d)">돌리기</button>' +
      '<div class="wres jua" id="whRes">' + esc(WH.res) + "</div></div></div>";
    whDraw();
  }
  function whDraw() {
    var cv = $("whCv"); if (!cv) return; var segs = whSegs(), total = segs.reduce(function (a, x) { return a + x.w; }, 0), dpr = window.devicePixelRatio || 1, S = cv.clientWidth;
    cv.width = cv.height = S * dpr; var x = cv.getContext("2d"); x.scale(dpr, dpr);
    var R = S / 2 - 6, a = WH.angle; x.translate(S / 2, S / 2);
    segs.forEach(function (sg, i) {
      var seg = Math.PI * 2 * sg.w / total;
      x.beginPath(); x.moveTo(0, 0); x.arc(0, 0, R, a, a + seg); x.closePath();
      x.fillStyle = PAL[i % 8]; x.globalAlpha = i % 2 ? .8 : 1; x.fill(); x.globalAlpha = 1; x.strokeStyle = "#fff"; x.lineWidth = 2; x.stroke();
      x.save(); x.rotate(a + seg / 2); x.fillStyle = "#fff"; x.textAlign = "right"; x.textBaseline = "middle";
      x.font = "700 " + Math.max(11, Math.min(30, R * seg * .5, R / Math.max(4, sg.t.length) * 1.4)) + "px Pretendard Variable, sans-serif"; x.fillText(sg.t + (sg.w > 1 ? " ×" + sg.w : ""), R - 14, 0); x.restore();
      a += seg;
    });
    if (!segs.length) { x.fillStyle = "#9a93c0"; x.textAlign = "center"; x.font = "700 18px sans-serif"; x.fillText(WH.src === "pick" ? "학생을 골라 주세요" : (WH.src === "boy" || WH.src === "girl") && !sexCount(WH.src === "boy" ? "남" : "여") ? "성별을 먼저 적어 주세요" : "칸이 없어요", 0, 0); }
    x.beginPath(); x.arc(0, 0, R * .13, 0, Math.PI * 2); x.fillStyle = "#fff"; x.fill(); x.lineWidth = 5; x.strokeStyle = "#46336e"; x.stroke();
  }
  $("tbb").addEventListener("click", function (e) {
    if (TOOL !== "wheel") return;
    var s2 = e.target.closest("[data-wsrc]"); if (s2 && !WH.spin) { WH.src = s2.dataset.wsrc; WH.res = ""; WH.out = {}; WH.outT = {}; wheelTool(); }
  });
  $("tbb").addEventListener("input", function (e) { if (e.target.id === "whText") { WH.text = e.target.value; WH.outT = {}; whDraw(); } });
  TOOLACT.whDrop = function (b) { WH.drop = !WH.drop; b.classList.toggle("on", WH.drop); };
  TOOLACT.whReset = function () { WH.out = {}; WH.outT = {}; WH.res = ""; wheelTool(); };
  TOOLACT.whGo = function () {
    var raw = whRaw(), segs = whSegs(); if (WH.spin || !raw.length) { if (!raw.length) toast(WH.src === "pick" ? "돌림판에 넣을 학생을 골라 주세요" : "남은 칸이 없어요. [처음부터]를 눌러요"); return; }
    var total = raw.length, win = raw[Math.floor(Math.random() * total)], cum = 0, j = 0;
    for (; j < segs.length && segs[j].t !== win; j++) cum += segs[j].w;
    var size = Math.PI * 2 * segs[j].w / total, startA = Math.PI * 2 * cum / total;
    var target = -Math.PI / 2 - (startA + (.2 + Math.random() * .6) * size), start = WH.angle, turns = Math.PI * 2 * (5 + Math.floor(Math.random() * 3));
    var end = start + turns + (((target - start) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    var t0 = performance.now(), dur = REDUCE ? 1 : 4800; WH.spin = true; $("whRes").textContent = "";
    (function frame(t) {
      var k = Math.min(1, (t - t0) / dur), ez = 1 - Math.pow(1 - k, 4); WH.angle = start + (end - start) * ez; whDraw();
      if (k < 1) { WH.raf = requestAnimationFrame(frame); return; }
      WH.spin = false; WH.res = win; $("whRes").textContent = win;
      var p = center($("whRes")); confetti(p[0], p[1], 70); chimeOn() && chime([784, 988, 1175]);
      if (WH.drop) { if (WH.src !== "custom") { var st = D.students.filter(function (x) { return label(x) === win; })[0]; if (st) WH.out[st.no] = 1; } else WH.outT[win] = (WH.outT[win] || 0) + 1; setTimeout(whDraw, 900); }
    })(t0);
  };

  // 발표 뽑기 (크게) ------------------------------------------------------------
  var PK = { k: 1, last: [], sex: "" };
  // 교시가 끝나면 선택된 친구를 저절로 리셋 (바탕화면 창에서 30초마다 확인, 기록은 남음)
  setInterval(function () {
    if (TWIN || !D || !Object.keys((D.marks && D.marks.name) || {}).length || busyNow()) return;
    write("nameAutoReset", [], { mut: function () {}, after: function (r) { if (r && r.n) { call("getAll", [], function () { syncState(); toast("교시가 끝나서 수업방해를 리셋했어요 · 기록은 남아요"); }, true); } } });
  }, 30 * 1000);
  function pickTool() { pickDraw(); }
  function pickDraw() {
    var left = D.students.length - (PEX ? picked().length : 0);
    $("tbb").innerHTML = '<div class="tbar"><span class="lab">누구 중에서</span>' + [["", "모두"], ["남", "남학생"], ["여", "여학생"]].map(function (x) { return '<button class="chip' + (PK.sex === x[0] ? " on" : "") + '" data-pksex="' + x[0] + '">' + x[1] + "</button>"; }).join("") + '</div><div class="tbar"><span class="lab">한 번에</span>' + stepper("pk", PK.k + "명") + '<button class="chip' + (PEX ? " on" : "") + '" id="pkEx">뽑힌 번호 빼기</button><button class="chip" id="pkReset">처음부터</button><span class="hint">' + (PEX ? left + "명 남음" : "모두 중에서") + "</span></div>" +
      '<div class="bigpick"><div class="slots3" id="pkSlots">' + Array.apply(null, Array(PK.k)).map(function (_, i) { var s = PK.last[i] ? student(PK.last[i]) : null;
        return '<div class="slotc' + (s ? " win" : "") + '"><span class="n jua num">' + (s ? (nameBig(s) ? "" : s.no) : "?") + '</span><span class="nm"' + (s && nameBig(s) ? ' style="font-size:clamp(34px,4.4vw,64px)"' : "") + ">" + (s ? esc(showMode() === "no" ? "" : s.name) + (showMode() === "nb" ? "<br><small>" + s.no + "번</small>" : "") : "") + "</span></div>"; }).join("") + "</div>" +
      '<div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:center"><button class="btn jua" id="pkGo" style="padding:16px 46px; font-size:26px; background:linear-gradient(135deg,#e0b341,#b3831f)">뽑기</button>' +
      (PK.last.length ? '<button class="btn ghost" id="pkTalk">' + ico("hand") + "뽑힌 친구 발표 +1</button>" : "") + "</div></div>";
  }
  $("tbb").addEventListener("click", function (e) { if (TOOL !== "pick") return; var px = e.target.closest("[data-pksex]"); if (px) { PK.sex = px.dataset.pksex; PK.last = []; pickDraw(); } });
  TOOLACT.pkEx = function () { PEX = !PEX; ls("classdesk-pickex", PEX ? "1" : "0"); pickDraw(); drawPick(); };
  TOOLACT.pkReset = function () { ls(pickKey(), "[]"); PK.last = []; pickDraw(); drawPick(); };
  TOOLACT.pkGo = function () {
    if (PK.sex && !sexCount(PK.sex)) { toast("시트 학생 탭의 성별 칸에 남 · 여를 먼저 적어 주세요"); return; }
    var all = D.students.filter(function (s) { return !PK.sex || s.sex === PK.sex; }).map(function (s) { return s.no; }), done = picked(), pool = shuffle(PEX ? all.filter(function (n) { return done.indexOf(n) < 0; }) : all);
    if (!pool.length) { toast((PK.sex ? PK.sex + "학생은 " : "") + "모두 한 번씩 뽑혔어요. [처음부터]를 눌러요"); return; }
    var win = pool.slice(0, PK.k), k = 0, steps = REDUCE ? 1 : 20;
    PK.last = []; pickDraw();
    var cards = document.querySelectorAll("#pkSlots .slotc"); cards.forEach(function (c) { c.classList.add("roll"); });
    (function spinN() {
      k++; cards.forEach(function (c) { c.querySelector(".n").textContent = all[Math.floor(Math.random() * all.length)]; });
      if (k < steps) { setTimeout(spinN, 40 + k * k * .6); return; }
      PK.last = win; if (PEX) ls(pickKey(), JSON.stringify(done.concat(win))); pickDraw(); drawPick();
      var p = center($("pkSlots")); confetti(p[0], p[1], 80, ["#e0b341", "#b3831f", "#fff", "#c9636d"]); chimeOn() && chime([784, 988, 1175]);
    })();
  };
  TOOLACT.pkTalk = function (b) { b.disabled = true; b.style.opacity = .5; PK.last.forEach(function (no) {
    write("present", [no], { busy: label(student(no)) + " 발표 기록 중", mut: function (d) { d.marks.talk[no] = (d.marks.talk[no] || 0) + 1; } }); }); toast("발표 기록을 남겼어요"); };

  // 모둠 점수판 (이 컴퓨터에 기억) ------------------------------------------------------------
  var SC = { n: 4, names: [], pts: [] };
  try { var sc0 = JSON.parse(ls("classdesk-score") || "null"); if (sc0 && sc0.n) SC = sc0; } catch (e) {}
  function scFit() { for (var i = 0; i < SC.n; i++) { if (SC.names[i] == null) SC.names[i] = (i + 1) + "모둠"; if (SC.pts[i] == null) SC.pts[i] = 0; } SC.names.length = SC.pts.length = SC.n; ls("classdesk-score", JSON.stringify(SC)); }
  function scoreTool() {
    scFit();
    var top = Math.max.apply(null, SC.pts), tie = SC.pts.filter(function (p) { return p === top; }).length;
    $("tbb").innerHTML = '<div class="tbar"><span class="lab">모둠 수</span>' + stepper("sc", SC.n) + '<span class="hint">모둠 이름을 눌러 바꿀 수 있어요</span><span class="sp" style="margin-left:auto"></span><button class="btn ghost" id="scReset">모두 0점으로</button></div>' +
      '<div class="scores">' + SC.pts.map(function (p, i) { var lead = top > 0 && p === top && tie < SC.n;
        return '<div class="team' + (lead ? " lead" : "") + '" style="--gc:' + GCOL[i % GCOL.length] + '">' + (lead ? '<span class="crown">' + ico("crown") + "</span>" : "") +
          '<input class="jua" data-scn="' + i + '" value="' + esc(SC.names[i]) + '" maxlength="10" aria-label="' + (i + 1) + '번째 모둠 이름">' +
          '<div class="pts jua num" id="scp' + i + '">' + p + '</div><div class="sbtns"><button class="sbtn m" data-sca="' + i + '" data-v="-1" aria-label="1점 빼기">−1</button><button class="sbtn jua" data-sca="' + i + '" data-v="1">+1</button><button class="sbtn jua" data-sca="' + i + '" data-v="5">+5</button></div></div>'; }).join("") + "</div>";
  }
  $("tbb").addEventListener("click", function (e) {
    var b = e.target.closest("[data-sca]"); if (!b || TOOL !== "score") return;
    var i = Number(b.dataset.sca), v = Number(b.dataset.v); SC.pts[i] = Math.max(0, SC.pts[i] + v); scFit(); scoreTool();
    var el = $("scp" + i); el.classList.add("pop"); if (v > 0) { var p = center(el); confetti(p[0], p[1], v > 1 ? 40 : 16, [GCOL[i % GCOL.length], "#fde68a", "#fff"]); chimeOn() && chime(v > 1 ? [659, 784, 988] : [784]); }
  });
  $("tbb").addEventListener("change", function (e) { var i = e.target.dataset && e.target.dataset.scn; if (i == null) return; SC.names[Number(i)] = e.target.value.trim() || (Number(i) + 1) + "모둠"; scFit(); });
  TOOLACT.scReset = function () { SC.pts = SC.pts.map(function () { return 0; }); scFit(); scoreTool(); };

  // 주사위: 진짜 굴리듯 데굴데굴 → 점점 느려지다 멈춤 ------------------------------------------------------------
  var DI = { n: 2, v: [3, 5], rolling: false }, PIPS = { 1: [[50, 50]], 2: [[27, 27], [73, 73]], 3: [[25, 25], [50, 50], [75, 75]], 4: [[27, 27], [73, 27], [27, 73], [73, 73]],
    5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]], 6: [[27, 22], [73, 22], [27, 50], [73, 50], [27, 78], [73, 78]] };
  function pips(v) { return PIPS[v].map(function (p) { return '<i style="left:' + p[0] + "%; top:" + p[1] + '%"></i>'; }).join(""); }
  function diceTool() {
    var sum = DI.v.reduce(function (a, b) { return a + b; }, 0);
    $("tbb").innerHTML = '<div class="tbar"><span class="lab">주사위</span>' + stepper("dn", DI.n + "개") + '<span class="hint">주사위를 눌러도 굴러가요</span></div>' +
      '<div class="dice"><div class="die-row" id="dieRow">' + DI.v.map(function (v, i) { return '<div class="die' + (v === 1 ? " one" : "") + '" role="button" tabindex="0" aria-label="주사위 ' + v + '" style="animation-delay:' + (-i * .13) + 's">' + pips(v) + "</div>"; }).join("") + "</div>" +
      '<div class="dsum jua" id="dSum">' + (DI.n > 1 ? "합계 " + sum : "") + '</div><button class="btn jua" id="dGo" style="padding:16px 50px; font-size:26px">굴리기</button></div>';
  }
  var AC = null;
  function tok() { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); var o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime;
    o.type = "triangle"; o.frequency.value = 520 + Math.random() * 260; g.gain.setValueAtTime(.05, t); g.gain.exponentialRampToValueAtTime(.0001, t + .07); o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + .08); } catch (e) {} }
  TOOLACT.dGo = function () {
    if (DI.rolling) return; DI.rolling = true;
    var delays = REDUCE ? [0] : [70, 70, 75, 80, 90, 100, 115, 130, 150, 175, 210, 250, 300], k = 0;
    diceTool(); document.querySelectorAll(".die").forEach(function (d) { d.classList.add("roll"); }); $("dSum").textContent = "데굴데굴...";
    (function spin() {
      DI.v = DI.v.map(function () { return 1 + Math.floor(Math.random() * 6); });
      document.querySelectorAll(".die").forEach(function (d, i) { d.innerHTML = pips(DI.v[i]); d.classList.toggle("one", DI.v[i] === 1); });
      if (chimeOn()) tok();
      if (k < delays.length) { setTimeout(spin, delays[k++]); return; }
      DI.rolling = false; diceTool(); document.querySelectorAll(".die").forEach(function (d) { d.classList.add("landed"); });
      var p = center($("dieRow")); confetti(p[0], p[1], 40); chimeOn() && chime([659, 880]);
    })();
  };
  $("tbb").addEventListener("click", function (e) { if (TOOL === "dice" && e.target.closest(".die")) TOOLACT.dGo(); });

  // 목소리 크기 + 소음 측정기 (마이크가 있는 교실에서만) ------------------------------------------------------------
  var VOICES = [["0", "쉿, 조용히", "혼자 생각하고 읽는 시간", "#5a7390"], ["1", "속삭이기", "짝에게만 들리게", "#2b968f"], ["2", "짝과 이야기", "옆 친구와 보통 목소리", "#35915a"],
    ["3", "모둠 이야기", "우리 모둠에게만 들리게", "#b3831f"], ["4", "발표 목소리", "교실 모두에게 또렷하게", "#c9636d"]];
  var VLIM = [42, 52, 62, 72, 85];   // 단계별 기준 (대략 dB)
  var VL = Number(ls("classdesk-voice") || 0);
  var MIC = { on: false, stream: null, ctx: null, an: null, raf: 0, db: 30, over: 0, last: 0, warnAt: 0, off: Number(ls("classdesk-micoff") || 0) };
  function voiceTool() {
    var v = VOICES[VL], lim = VLIM[VL];
    $("tbb").innerHTML = '<div class="voice"><div class="vbig" id="vBig" style="--vc:' + v[3] + '"><b class="jua">' + v[0] + '</b><span class="jua">' + v[1] + "</span><small>" + v[2] + "</small></div>" +
      '<div class="vrow">' + VOICES.map(function (x, i) { return '<button class="vl' + (i === VL ? " on" : "") + '" style="--vc:' + x[3] + '" data-vl="' + i + '"><i class="jua">' + x[0] + "</i>" + x[1] + "</button>"; }).join("") + "</div>" +
      '<div class="meter"><div class="mrow"><button class="btn" id="micGo">' + ico(MIC.on ? "mute" : "sound") + (MIC.on ? " 소음 측정 끄기" : " 소음 측정 켜기") + '</button>' +
      '<span class="mdb jua num" id="mDb">' + (MIC.on ? Math.round(MIC.db) : "--") + '</span><span class="hint">dB · 기준 ' + lim + ' dB</span><span class="sp" style="margin-left:auto"></span>' +
      '<label class="lab" for="micOff">민감도</label><input type="range" id="micOff" min="-20" max="20" value="' + MIC.off + '" aria-label="민감도"></div>' +
      '<div class="mbar"><i id="mFill"></i><b style="left:' + dbPct(lim) + '%"></b></div>' +
      '<p class="hint" id="mMsg">' + (MIC.on ? "기준을 1초 넘게 넘으면 '쉿!'이 떠요. 너무 자주 뜨면 민감도를 낮춰요." : "마이크가 있는 교실에서만 돼요. 켜면 마이크 사용을 허락할지 물어봐요. 숫자는 대략이에요.") + "</p></div></div>";
  }
  function dbPct(db) { return Math.max(0, Math.min(100, (db - 30) / 70 * 100)); }
  $("tbb").addEventListener("click", function (e) { var b = e.target.closest("[data-vl]"); if (!b || TOOL !== "voice") return; VL = Number(b.dataset.vl); ls("classdesk-voice", String(VL)); voiceTool(); $("vBig").classList.add("pop"); });
  $("tbb").addEventListener("input", function (e) { if (e.target.id === "micOff") { MIC.off = Number(e.target.value); ls("classdesk-micoff", String(MIC.off)); } });
  TOOLACT.micGo = function () { if (MIC.on) { micStop(); voiceTool(); } else micStart(); };
  function micStart() {
    var fail2 = function (er) { MIC.on = false; voiceTool(); var m = $("mMsg");
      // 앱스 스크립트 화면은 구글이 칸(iframe) 안에 띄우며 마이크를 막는다 → 로그인 없이 쓰는 소음 측정기를 새 창으로
      if (window.top !== window && er && (er.name === "NotAllowedError" || er.name === "SecurityError")) {
        m.textContent = "앱스 스크립트 화면에서는 구글이 마이크를 막아 두었어요. 새 창의 소음 측정기를 쓰세요 (로그인 없이 바로). ";
        var a = document.createElement("a"); a.className = "btn sm"; a.href = "https://kimman.kr/desk/noise.html?lv=" + VL; a.target = "_blank"; a.rel = "noopener"; a.textContent = "새 창에서 소음 측정기 열기"; m.appendChild(a); return; }
      m.textContent = "마이크를 쓸 수 없어요. 마이크가 없거나, 허용을 누르지 않았거나, 이 화면에서 마이크가 막혀 있어요. 주소창 왼쪽 자물쇠 → 마이크 허용을 확인해 보세요." + (er && er.name ? " (" + er.name + ")" : ""); };
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return fail2();
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }).then(function (st) {
      MIC.stream = st; MIC.ctx = new (window.AudioContext || window.webkitAudioContext)(); MIC.an = MIC.ctx.createAnalyser(); MIC.an.fftSize = 2048;
      MIC.ctx.createMediaStreamSource(st).connect(MIC.an); MIC.on = true; MIC.last = performance.now(); voiceTool();
      var buf = new Float32Array(MIC.an.fftSize);
      (function loop(t) {
        if (!MIC.on) return;
        MIC.an.getFloatTimeDomainData(buf); var sum = 0; for (var i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
        var db = 20 * Math.log10(Math.sqrt(sum / buf.length) + 1e-7) + 94 + MIC.off, dt = (t - MIC.last) / 1000; MIC.last = t;
        MIC.db = Math.max(25, MIC.db * .85 + db * .15);
        var lim = VLIM[VL];
        MIC.over = MIC.db > lim ? MIC.over + dt : Math.max(0, MIC.over - dt * 2);
        var el = $("mDb"); if (el) { el.textContent = Math.round(MIC.db); el.style.color = MIC.db > lim ? "#e5566a" : "#46336e"; $("mFill").style.width = (100 - dbPct(MIC.db)) + "%"; }
        if (MIC.over > 1.1 && Date.now() - MIC.warnAt > 3500) voiceWarn();
        MIC.raf = requestAnimationFrame(loop);
      })(MIC.last);
    }).catch(fail2);
  }
  function micStop() {
    if (!MIC.on && !MIC.stream) return;
    MIC.on = false; cancelAnimationFrame(MIC.raf);
    if (MIC.stream) MIC.stream.getTracks().forEach(function (t) { t.stop(); });
    if (MIC.ctx) try { MIC.ctx.close(); } catch (e) {}
    MIC.stream = MIC.ctx = MIC.an = null; MIC.over = 0;
  }
  function voiceWarn() {
    MIC.warnAt = Date.now(); MIC.over = 0;
    var w = $("vWarn"); w.querySelector("b").textContent = VL <= 1 ? "쉿! 목소리가 커요" : "조금만 작게 말해요"; w.classList.add("on");
    var v = $("vBig"); if (v) { v.classList.remove("alarm"); void v.offsetWidth; v.classList.add("alarm"); }
    if (chimeOn()) chime([880, 660]);
    setTimeout(function () { w.classList.remove("on"); }, 1800);
  }

  // 순서 정하기: 1번부터 줄 서듯 위에서 아래로. [하나씩 공개]로 한 명씩 보여 주기 ------------------------------------------------------------
  var ORD = { list: [], step: -1 };
  function orderTool(again) {
    if (again !== false || !ORD.list.length) { ORD.list = shuffle(D.students); ORD.step = -1; }
    var n = ORD.list.length, per = Math.max(5, Math.ceil(n / Math.max(1, Math.ceil(n / 9))));
    $("tbb").innerHTML = '<div class="tbar"><span class="hint">무작위로 정한 순서예요. 1번부터 위에서 아래로 읽어요.</span><span class="sp" style="margin-left:auto"></span>' +
      '<button class="btn ghost" id="oStep">' + (ORD.step < 0 ? "하나씩 공개" : ORD.step >= n - 1 ? "모두 보였어요" : "다음 →") + '</button><button class="btn" id="oAgain">' + ico("shuffle") + "다시 섞기</button></div>" +
      '<div class="queue" style="grid-template-rows:repeat(' + Math.min(per, n) + ',auto)">' + ORD.list.map(function (x, i) {
        var hid = ORD.step >= 0 && i > ORD.step, cur = i === ORD.step, big = showMode() === "no" || !x.name ? x.no + "번" : x.name;
        return '<div class="qi land' + (hid ? " hid" : "") + (cur ? " cur" : "") + '" style="animation-delay:' + i * 40 + 'ms"><span class="qk jua num' + (i < 3 ? " top" + i : "") + '">' + (i + 1) + '</span><span class="qn"><b class="jua">' + esc(hid ? "?" : big) + "</b>" +
          (!hid && x.name && showMode() !== "name" && showMode() !== "no" ? "<small>" + x.no + "번</small>" : "") + "</span></div>"; }).join("") + "</div>";
  }
  TOOLACT.oAgain = function () { orderTool(true); };
  TOOLACT.oStep = function () { if (ORD.step >= ORD.list.length - 1) return; ORD.step++; orderTool(false); var el = document.querySelector(".qi.cur"); if (el) { var p = center(el); confetti(p[0], p[1], 20); } };

  // ── 독서 · 명상 ──
  var RD = { left: 0, total: 0, run: false, end: 0, snd: null, raf: 0, parts: [] };
  $("readBtn").onclick = function () {
    var m = Number(D && (D.settings["독서 · 명상 시간"] || D.settings["아침 독서 시간"])) || 20;
    RD.total = RD.left = m * 60; RD.run = false; $("reading").classList.add("on");
    $("rdQuote").textContent = D && D.quote ? "“" + D.quote.text + "”" : ""; rdDraw(); rdBreath(); rdParticles();
  };
  $("rdClose").onclick = function () { $("reading").classList.remove("on"); RD.run = false; cancelAnimationFrame(RD.raf); clearTimeout(RD.bt); muStop(); };
  $("rdGo").onclick = function () { if (RD.run) { RD.left = Math.max(1, Math.ceil((RD.end - Date.now()) / 1000)); RD.run = false; } else { RD.end = Date.now() + RD.left * 1000; RD.run = true; } rdDraw(); };
  function rdDraw() {
    $("rdTime").textContent = pad(Math.floor(RD.left / 60)) + ":" + pad(RD.left % 60); $("rdBar").style.width = (100 - RD.left / RD.total * 100) + "%";
    $("rdGo").innerHTML = ico(RD.run ? "pause" : "play") + "<span>" + (RD.run ? "잠깐 멈춤" : RD.left < RD.total ? "이어서" : "시작") + "</span>";
    var list = TRACKS.slice();
    if (D && D.settings["독서 음악 주소"]) list.push(["file", "내 음악"]);
    $("rdMusic").innerHTML = list.map(function (m) { var on = MU.track === m[0];
      return '<button class="' + (on ? "on" : "") + '" data-mu="' + m[0] + '">' + (on && m[0] ? '<span class="eq"><i></i><i></i><i></i></span>' : m[0] ? ico("music") : ico("mute")) + esc(m[1]) + "</button>"; }).join("");
  }
  setInterval(function () { if (!RD.run) return; RD.left = Math.max(0, Math.ceil((RD.end - Date.now()) / 1000)); rdDraw();
    if (RD.left <= 0) { RD.run = false; chime([523, 659, 784]); $("breath").textContent = "독서 시간이 끝났어요. 책갈피를 꽂아요"; } }, 500);
  function rdBreath() {
    var orb = $("orb"), br = $("breath"), steps = [["in", "천천히 숨을 들이마셔요", 4000], ["hold", "잠깐 멈춰요", 2000], ["out", "후 — 천천히 내쉬어요", 6000]], i = 0;
    clearTimeout(RD.bt);
    (function next() { if (!$("reading").classList.contains("on")) return; var s = steps[i % 3]; i++;
      orb.classList.remove("in", "out"); if (s[0] !== "hold") orb.classList.add(s[0] === "in" ? "in" : "out"); else orb.classList.add("in");
      if (!(RD.left <= 0 && !RD.run && RD.left !== RD.total)) { br.style.opacity = 0; setTimeout(function () { br.textContent = s[1]; br.style.opacity = .92; }, 300); }
      RD.bt = setTimeout(next, s[2]); })();
  }
  function rdParticles() {
    var cv = $("rdCv"), cx = cv.getContext("2d"); cv.width = innerWidth; cv.height = innerHeight;
    RD.parts = []; for (var i = 0; i < 70; i++) RD.parts.push({ x: Math.random() * cv.width, y: Math.random() * cv.height, r: .8 + Math.random() * 2.6, vy: .12 + Math.random() * .35, ph: Math.random() * 6.3, a: .25 + Math.random() * .6 });
    cancelAnimationFrame(RD.raf);
    (function frame(t) {
      cx.clearRect(0, 0, cv.width, cv.height);
      RD.parts.forEach(function (p) { p.y -= p.vy; p.x += Math.sin(t / 2600 + p.ph) * .25; if (p.y < -10) { p.y = cv.height + 10; p.x = Math.random() * cv.width; }
        var g = cx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4); var al = p.a * (.6 + .4 * Math.sin(t / 900 + p.ph));
        g.addColorStop(0, "rgba(255,245,230," + al + ")"); g.addColorStop(1, "rgba(255,245,230,0)"); cx.fillStyle = g; cx.beginPath(); cx.arc(p.x, p.y, p.r * 4, 0, 6.3); cx.fill(); });
      if (!REDUCE) RD.raf = requestAnimationFrame(frame);
    })(0);
  }
  $("reading").addEventListener("pointerdown", function (e) {
    if (e.target.closest("button")) return;
    var r = document.createElement("span"); r.className = "ripple"; r.style.left = e.clientX - 130 + "px"; r.style.top = e.clientY - 130 + "px";
    r.style.width = r.style.height = "10px"; r.style.marginLeft = "125px"; r.style.marginTop = "125px"; $("reading").appendChild(r); setTimeout(function () { r.remove(); }, 2400);
    for (var i = 0; i < 6; i++) RD.parts.push({ x: e.clientX + (Math.random() - .5) * 40, y: e.clientY, r: 1.5 + Math.random() * 2, vy: .6 + Math.random() * .8, ph: Math.random() * 6, a: .9 });
  });
  // ── 독서 음악 ──
  // 곡은 모두 저작권이 끝난 옛 음악(바흐 1722, 파헬벨 1680년대, 베토벤 1824, 그린슬리브스 16세기 영국 민요)을 악보대로 적어 두고
  // 브라우저가 부드러운 하프 · 플루트 소리로 직접 연주한다. 음원 파일 · 인터넷 · 저작권 걱정이 없다.
  // 자연 소리(파도 · 바람 · 빗소리)는 멜로디 없이 그때그때 만들어 내는 소리.
  var MU = { ctx: null, track: "", timer: 0, idx: 0, start: 0, piece: null, out: null, rev: null, audio: null, nodes: [], vol: Number(ls("classdesk-muvol") || 60) };
  function NOTE(x) { var m = /^([A-G])(#|b)?(\d)$/.exec(x); return 12 * (Number(m[3]) + 1) + { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0); }
  // 가락 적기: "E4:1 F4:.5 ..." (박자) → [시작 박, 음, 길이]
  function line(str, at) { var t = at || 0, out = []; str.trim().split(/\s+/).forEach(function (tok) { var p = tok.split(":"), d = Number(p[1]); if (p[0] !== "r") out.push([t, NOTE(p[0]), d]); t += d; }); return { notes: out, end: t }; }
  var PIECES = {
    // J. S. 바흐, 평균율 1권 전주곡 1번 C장조 BWV 846 — 하프처럼 부드럽게
    bach: function () {
      var M = ["C4 E4 G4 C5 E5", "C4 D4 A4 D5 F5", "B3 D4 G4 D5 F5", "C4 E4 G4 C5 E5", "C4 E4 A4 E5 A5", "C4 D4 F#4 A4 D5", "B3 D4 G4 D5 G5", "B3 C4 E4 G4 C5",
        "A3 C4 E4 G4 C5", "D3 A3 D4 F#4 C5", "G3 B3 D4 G4 B4", "G3 Bb3 E4 G4 C#5", "F3 A3 D4 A4 D5", "F3 Ab3 D4 F4 B4", "E3 G3 C4 G4 C5", "E3 F3 A3 C4 F4",
        "D3 F3 A3 C4 F4", "G2 D3 G3 B3 F4", "C3 E3 G3 C4 E4", "C3 G3 Bb3 C4 E4", "F2 F3 A3 C4 E4", "F#2 C3 A3 C4 Eb4", "Ab2 F3 B3 C4 D4", "G2 F3 G3 B3 D4",
        "G2 E3 G3 C4 E4", "G2 D3 G3 C4 F4", "G2 D3 G3 B3 F4", "G2 Eb3 A3 C4 F#4", "G2 E3 G3 C4 G4", "G2 D3 G3 C4 F4", "G2 D3 G3 B3 F4", "C2 C3 G3 Bb3 E4",
        "C2 C3 F3 A3 F4", "C2 B2 G3 D4 F4"], notes = [];
      M.forEach(function (m, i) { var c = m.split(" ").map(NOTE);
        [0, 2].forEach(function (h) { var o = i * 4 + h;
          notes.push([o, c[0], 2, .45, "h"]); notes.push([o + .25, c[1], 1.75, .36, "h"]);
          [2, 3, 4, 2, 3, 4].forEach(function (k, j) { notes.push([o + .5 + j * .25, c[k], .5, j % 3 === 0 ? .4 : .32, "h"]); }); }); });
      var e = M.length * 4; ["C2", "C3", "E3", "G3", "C4", "E4"].forEach(function (x, j) { notes.push([e + j * .16, NOTE(x), 6, .4, "h"]); });
      return { bpm: 50, notes: notes, len: e + 10 };
    },
    // J. 파헬벨, 캐논 D장조 — 여덟 음 베이스(하프) 위에 플루트 가락
    canon: function () {
      var bass = ["D3", "A2", "B2", "F#2", "G2", "D2", "G2", "A2"], ch = [["D4", "F#4", "A4"], ["C#4", "E4", "A4"], ["B3", "D4", "F#4"], ["A3", "C#4", "F#4"], ["B3", "D4", "G4"], ["A3", "D4", "F#4"], ["B3", "D4", "G4"], ["C#4", "E4", "A4"]];
      var mel = [[], ["F#5", "E5", "D5", "C#5", "B4", "A4", "B4", "C#5"], ["D5", "C#5", "B4", "A4", "G4", "F#4", "G4", "E4"], ["F#5", "E5", "D5", "C#5", "B4", "A4", "B4", "C#5"], ["D5", "C#5", "B4", "A4", "G4", "F#4", "G4", "E4"]], notes = [];
      mel.forEach(function (ln, cy) { for (var i = 0; i < 8; i++) { var b = (cy * 8 + i) * 2;
        notes.push([b, NOTE(bass[i]), 2.2, .42, "h"]); if (ln[i]) notes.push([b, NOTE(ln[i]) - 12, 2, .5, "f"]);
        ch[i].forEach(function (x, j) { notes.push([b + .5 + j * .5, NOTE(x), .9, .24, "h"]); }); } });
      notes.sort(function (a, b) { return a[0] - b[0]; });
      return { bpm: 60, notes: notes, len: mel.length * 16 };
    },
    // 그린슬리브스 (16세기 영국 옛 노래) — 6/8박, 플루트 가락 + 하프 화음
    green: function () {
      var A = "A4:1 C5:2 D5:1 E5:1.5 F5:.5 E5:1 D5:2 B4:1 G4:1.5 A4:.5 B4:1 C5:2 A4:1 A4:1.5 G#4:.5 A4:1 B4:2 G#4:1 E4:2 A4:1 C5:2 D5:1 E5:1.5 F5:.5 E5:1 D5:2 B4:1 G4:1.5 A4:.5 B4:1 C5:1.5 B4:.5 A4:1 G#4:1.5 F#4:.5 G#4:1 A4:3 A4:2";
      var B = "r:1 G5:3 G5:1.5 F#5:.5 E5:1 D5:2 B4:1 G4:1.5 A4:.5 B4:1 C5:2 A4:1 A4:1.5 G#4:.5 A4:1 B4:2 G#4:1 E4:3 G5:3 G5:1.5 F#5:.5 E5:1 D5:2 B4:1 G4:1.5 A4:.5 B4:1 C5:1.5 B4:.5 A4:1 G#4:1.5 F#4:.5 G#4:1 A4:3 A4:2";
      var m1 = line(A), m2 = line(B, m1.end), notes = m1.notes.concat(m2.notes).map(function (n) { return [n[0], n[1], n[2], .46, "f"]; });
      var chords = ["A2 E3 A3", "G2 D3 G3", "A2 E3 A3", "E2 B2 E3", "A2 E3 A3", "G2 D3 G3", "A2 E3 A3", "A2 E3 A3", "C3 G3 C4", "G2 D3 G3", "A2 E3 A3", "E2 B2 E3", "C3 G3 C4", "G2 D3 G3", "A2 E3 A3", "A2 E3 A3"];
      chords.forEach(function (c, i) { var b = 1 + i * 6; if (b >= m2.end) return; c.split(" ").forEach(function (x, j) { notes.push([b + j * .5, NOTE(x), 5, .26, "h"]); notes.push([b + 3 + j * .5, NOTE(x), 3, .2, "h"]); }); });
      notes.sort(function (a, b) { return a[0] - b[0]; });
      return { bpm: 92, notes: notes, len: m2.end + 3 };
    },
    // 베토벤, 환희의 송가 (교향곡 9번) — 아주 느리게, 오르골 같은 하프와 플루트
    joy: function () {
      var P1 = "E4:1 E4:1 F4:1 G4:1 G4:1 F4:1 E4:1 D4:1 C4:1 C4:1 D4:1 E4:1 E4:1.5 D4:.5 D4:2", P2 = "E4:1 E4:1 F4:1 G4:1 G4:1 F4:1 E4:1 D4:1 C4:1 C4:1 D4:1 E4:1 D4:1.5 C4:.5 C4:2";
      var P3 = "D4:1 D4:1 E4:1 C4:1 D4:1 E4:.5 F4:.5 E4:1 C4:1 D4:1 E4:.5 F4:.5 E4:1 D4:1 C4:1 D4:1 G3:2";
      var a = line(P1), b = line(P2, a.end), c = line(P3, b.end), d = line(P2, c.end);
      var notes = [].concat(a.notes, b.notes, c.notes, d.notes).map(function (n) { return [n[0], n[1] + 12, n[2], .44, "f"]; });
      var ch = ["C3 G3 E4", "G2 D3 B3", "C3 G3 E4", "G2 D3 B3", "C3 G3 E4", "G2 D3 B3", "C3 G3 E4", "G2 G3 C4", "G2 D3 B3", "C3 G3 E4", "G2 D3 B3", "C3 G3 E4", "C3 G3 E4", "G2 D3 B3", "C3 G3 E4", "G2 G3 C4"];
      ch.forEach(function (x, i) { x.split(" ").forEach(function (y, j) { notes.push([i * 4 + j * .66, NOTE(y), 3.5, .22, "h"]); }); });
      notes.sort(function (p, q) { return p[0] - q[0]; });
      return { bpm: 62, notes: notes, len: d.end + 2 };
    },
  };
  var TRACKS = [["", "음악 끄기"], ["bach", "바흐 · 전주곡 C장조"], ["canon", "파헬벨 · 캐논"], ["green", "그린슬리브스"], ["joy", "베토벤 · 환희의 송가"],
    ["waves", "파도 소리"], ["wind", "숲속 바람"], ["rain", "잔잔한 빗소리"]];
  function muVol() { return Math.pow(MU.vol / 100, 1.4) * 1.1; }
  function muStop() {
    clearInterval(MU.timer); MU.timer = 0;
    if (MU.audio) { MU.audio.pause(); MU.audio = null; }
    if (MU.ctx) { var c = MU.ctx; try { MU.out.gain.setTargetAtTime(0, c.currentTime, .35); } catch (e) {} setTimeout(function () { try { c.close(); } catch (e) {} }, 1600); }
    MU.ctx = null; MU.track = ""; if ($("reading").classList.contains("on")) rdDraw();
  }
  function muStart(id) {
    muStop(); MU.track = id;
    if (!id) return rdDraw();
    if (id === "file") {
      MU.audio = new Audio(D.settings["독서 음악 주소"]); MU.audio.loop = true; MU.audio.volume = Math.min(1, muVol());
      MU.audio.play().catch(function () { toast("음악 파일을 열 수 없어요. 설정의 '독서 음악 주소'를 확인해 주세요"); MU.track = ""; rdDraw(); });
      return rdDraw();
    }
    try {
      var c = new (window.AudioContext || window.webkitAudioContext)(); MU.ctx = c;
      var out = c.createGain(), soft = c.createBiquadFilter(), comp = c.createDynamicsCompressor();
      soft.type = "lowpass"; soft.frequency.value = 2600;                 // 귀가 편하게 높은 소리를 한 번 더 깎는다
      out.gain.value = 0; out.gain.linearRampToValueAtTime(muVol(), c.currentTime + 3);
      out.connect(soft); soft.connect(comp); comp.connect(c.destination);
      var rev = c.createConvolver(), len = Math.floor(c.sampleRate * 3.6), ir = c.createBuffer(2, len, c.sampleRate);
      for (var ch = 0; ch < 2; ch++) { var d = ir.getChannelData(ch); for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
      rev.buffer = ir; var wet = c.createGain(); wet.gain.value = .55; rev.connect(wet); wet.connect(out);
      MU.out = out; MU.rev = rev;
      if (id === "waves" || id === "wind" || id === "rain") { nature(c, id); return rdDraw(); }
      MU.piece = PIECES[id](); MU.idx = 0; MU.start = c.currentTime + .4;
      MU.timer = setInterval(muTick, 100); muTick();
    } catch (e) { toast("이 브라우저에서는 소리를 낼 수 없어요"); MU.track = ""; }
    rdDraw();
  }
  function muTick() {
    var c = MU.ctx, p = MU.piece; if (!c || !p) return;
    var spb = 60 / p.bpm;
    for (var guard = 0; guard < 200; guard++) {
      var nt = p.notes[MU.idx], t = MU.start + nt[0] * spb;
      if (t > c.currentTime + .5) break;
      if (t >= c.currentTime - .05) (nt[4] === "f" ? flute : harp)(c, nt[1], t, nt[2] * spb, nt[3]);
      MU.idx++;
      if (MU.idx >= p.notes.length) { MU.idx = 0; MU.start += p.len * spb; }
    }
  }
  // 하프: 동그란 소리(사인파 위주) + 느린 타건 + 긴 여운. 높은 배음은 거의 없앰
  function harp(c, midi, t, dur, vel) {
    var f = 440 * Math.pow(2, (midi - 69) / 12), g = c.createGain(), lp = c.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 700 + vel * 900;
    [[1, 1, "sine"], [2, .12, "sine"], [3, .03, "sine"]].forEach(function (h) {
      var o = c.createOscillator(), og = c.createGain(); o.type = h[2]; o.frequency.value = f * h[0]; o.detune.value = (Math.random() - .5) * 4;
      og.gain.value = h[1]; o.connect(og); og.connect(lp); o.start(t); o.stop(t + dur + 3.2);
    });
    var peak = .12 * vel * Math.min(1.25, 300 / f + .5);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + .03);
    g.gain.exponentialRampToValueAtTime(peak * .45, t + .5); g.gain.exponentialRampToValueAtTime(.0002, t + dur + 3);
    lp.connect(g); g.connect(MU.out); g.connect(MU.rev);
  }
  // 플루트: 천천히 차오르고 살짝 떨리는 숨결 같은 소리
  function flute(c, midi, t, dur, vel) {
    var f = 440 * Math.pow(2, (midi - 69) / 12), o = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain(), lp = c.createBiquadFilter(), vib = c.createOscillator(), vg = c.createGain();
    o.type = "sine"; o.frequency.value = f; o2.type = "triangle"; o2.frequency.value = f; var g2 = c.createGain(); g2.gain.value = .12;
    vib.frequency.value = 4.6; vg.gain.value = f * .004; vib.connect(vg); vg.connect(o.frequency);
    lp.type = "lowpass"; lp.frequency.value = 1600;
    var peak = .085 * vel, end = t + Math.max(.25, dur * .95);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + .14); g.gain.setValueAtTime(peak * .9, end); g.gain.exponentialRampToValueAtTime(.0002, end + .7);
    o.connect(g); o2.connect(g2); g2.connect(g); g.connect(lp); lp.connect(MU.out); lp.connect(MU.rev);
    [o, o2, vib].forEach(function (x) { x.start(t); x.stop(end + .8); });
  }
  // 자연 소리: 갈색 잡음을 거르고 천천히 출렁이게 (멜로디 없음)
  function noiseBuf(c, brown) {
    var buf = c.createBuffer(1, c.sampleRate * 6, c.sampleRate), d = buf.getChannelData(0), last = 0;
    for (var i = 0; i < d.length; i++) { var w = Math.random() * 2 - 1; if (brown) { last = (last + .02 * w) / 1.02; d[i] = last * 3.4; } else d[i] = w * .5; }
    var src = c.createBufferSource(); src.buffer = buf; src.loop = true; src.start(); return src;
  }
  function lfo(c, freq, depth, param, base) { var o = c.createOscillator(), g = c.createGain(); o.frequency.value = freq; g.gain.value = depth; o.connect(g); g.connect(param); param.value = base; o.start(); return o; }
  function nature(c, kind) {
    var chain = function (src, type, f, q, gain) { var fl = c.createBiquadFilter(), g = c.createGain(); fl.type = type; fl.frequency.value = f; if (q) fl.Q.value = q; g.gain.value = gain; src.connect(fl); fl.connect(g); g.connect(MU.out); return { f: fl, g: g }; };
    if (kind === "waves") {   // 밀려왔다 빠지는 파도 (8~11초 주기) + 거품 소리
      var a = chain(noiseBuf(c, true), "lowpass", 600, 0, .5); lfo(c, .11, .32, a.g.gain, .42); lfo(c, .11, 380, a.f.frequency, 620);
      var b = chain(noiseBuf(c, false), "highpass", 2400, 0, .05); lfo(c, .11, .045, b.g.gain, .05);
      var deep = chain(noiseBuf(c, true), "lowpass", 160, 0, .35); lfo(c, .07, .12, deep.g.gain, .3);
    } else if (kind === "wind") {   // 나뭇잎 사이로 부는 바람: 소리 높이와 세기가 천천히 바뀜
      var w1 = chain(noiseBuf(c, false), "bandpass", 700, .7, .14); lfo(c, .06, 380, w1.f.frequency, 760); lfo(c, .045, .08, w1.g.gain, .13);
      var w2 = chain(noiseBuf(c, true), "lowpass", 380, 0, .28); lfo(c, .03, .12, w2.g.gain, .26);
      var leaf = chain(noiseBuf(c, false), "highpass", 4200, 0, .018); lfo(c, .09, .014, leaf.g.gain, .018);
    } else {   // 빗소리: 고른 빗줄기 + 톡톡 물방울 + 멀리 낮은 소리
      chain(noiseBuf(c, false), "bandpass", 3000, .35, .07);
      chain(noiseBuf(c, true), "lowpass", 280, 0, .2);
      MU.timer = setInterval(function () { if (!MU.ctx) return; var t = c.currentTime;
        for (var i = 0; i < 6; i++) { var at = t + Math.random() * .12, src = c.createBufferSource(), len = Math.floor(c.sampleRate * .02), bf = c.createBuffer(1, len, c.sampleRate), d = bf.getChannelData(0);
          for (var j = 0; j < len; j++) d[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / len, 4);
          var fl = c.createBiquadFilter(), g = c.createGain(); src.buffer = bf; fl.type = "bandpass"; fl.frequency.value = 1800 + Math.random() * 3600; fl.Q.value = 2; g.gain.value = .02 + Math.random() * .05;
          src.connect(fl); fl.connect(g); g.connect(MU.out); src.start(at); }
      }, 120);
    }
  }
  $("rdMusic").addEventListener("click", function (e) { var b = e.target.closest("[data-mu]"); if (b) muStart(b.dataset.mu); });
  $("muVol").value = MU.vol;
  $("muVol").addEventListener("input", function () { MU.vol = Number(this.value); ls("classdesk-muvol", String(MU.vol)); if (MU.ctx && MU.out) MU.out.gain.setTargetAtTime(muVol(), MU.ctx.currentTime, .1); if (MU.audio) MU.audio.volume = Math.min(1, muVol()); });

  // ── 시작 ──
  setInterval(function () { if (!document.hidden && !busyNow() && D) call("getAll", [], function () { syncState(); }, true); }, 3 * 60 * 1000);
  document.addEventListener("visibilitychange", function () { if (!document.hidden && D && !busyNow()) call("getAll", [], function () { syncState(); }, true); });
  tickClock(); tmDraw();
  try { var c = JSON.parse(ls("classdesk-cache") || "null"), d0 = new Date(); if (c && c.today === d0.getFullYear() + "-" + pad(d0.getMonth() + 1) + "-" + pad(d0.getDate()) && c.marks && !c.letters) { D = c; draw(); } } catch (e) {}
  load(true);
