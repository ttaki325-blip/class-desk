/*
 * 우리반 바탕화면 앱판 — 다리 (만든 사람 김맨 https://kimman.kr · CC BY-SA 4.0)
 * 화면(index)이 부르는 google.script.run 을 받아 브라우저 안의 Code.gs(CORE)에 넘긴다.
 *   - 구글 로그인: 이 앱이 만든 시트만 볼 수 있는 권한(drive.file)만 받는다.
 *   - 쓰기는 메모리에 바로, 시트에는 몇 초씩 모아서 한 번에 (Sheets API 는 분당 요청 수가 정해져 있다).
 *   - 인터넷이 끊기면 모아 둔 것을 이 기기에 적어 두었다가 다시 이어지면 보낸다.
 */
(function (G) {
  'use strict';
  var CFG = G.DESK_CONFIG || {};
  var SCOPE = 'https://www.googleapis.com/auth/drive.file';
  var DRIVE = 'https://www.googleapis.com/drive/v3/files';
  var BASE = location.origin + location.pathname.replace(/index\.html$/, '');
  G.GS.appUrl = BASE.replace(/\/$/, '') + '/';
  var $ = function (id) { return document.getElementById(id); };
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }
  function esc(x) { return String(x == null ? '' : x).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function clone(x) { return x === undefined ? undefined : JSON.parse(JSON.stringify(x)); }
  var wait = function (ms) { return new Promise(function (ok) { setTimeout(ok, ms); }); };

  // ── 선생님 창(팝업): 시트 연결은 바탕화면 창의 것을 빌려 쓴다 (기록이 한곳에만 있게) ──
  if (/[?&]teacher\b/.test(location.search)) { teacherWindow(); return; }
  function teacherWindow() {
    var O = null; try { O = G.opener && G.opener.DESK && G.opener.DESKAPP ? G.opener : null; } catch (e) { O = null; }
    var READ = { noticeList: 1, getAll: 1, sync: 1, teacher: 1, attendGet: 1, monthData: 1, getAccount: 1, checkTeacher: 1, getWeather: 1, shareInfo: 1, getMeal: 1, searchSchool: 1, lessonWeek: 1, lessonFind: 1 };
    var poked = null;
    function boardRefresh() { clearTimeout(poked); poked = setTimeout(function () { try { O.DESKAPP.refresh(); } catch (e) {} }, 400); }
    function pcall(fn, args) {
      if (!O || O.closed) return Promise.reject(new Error('바탕화면 창이 닫혀 있어요. 바탕화면에서 [선생님]을 다시 눌러 주세요.'));
      var a; try { a = O.JSON.parse(JSON.stringify(args || [])); } catch (e) { a = args || []; }
      var p = O.DESK.call(fn, a);
      if (!READ[fn]) boardRefresh();
      return new Promise(function (ok, no) {
        p.then(function (r) { if (!READ[fn]) boardRefresh(); ok(r === undefined ? r : JSON.parse(JSON.stringify(r))); },
          function (e) { no(new Error((e && e.message) || String(e))); });
      });
    }
    function Runner(ok, no) { this._ok = ok; this._no = no; }
    Runner.prototype.withSuccessHandler = function (f) { return runner(f, this._no); };
    Runner.prototype.withFailureHandler = function (f) { return runner(this._ok, f); };
    function runner(ok, no) {
      return new Proxy(new Runner(ok, no), { get: function (t, k) {
        if (k in t || typeof k !== 'string') return t[k];
        return function () { pcall(k, [].slice.call(arguments)).then(function (r) { t._ok && t._ok(r); }, function (e) { t._no && t._no(e); }); };
      } });
    }
    G.google = G.google || {};
    G.google.script = { run: runner(null, null) };
    G.DESK = { call: pcall, mode: function () { try { return O.DESK.mode(); } catch (e) { return ''; } },
      sheetPane: function () { try { return O.DESK.sheetPane(); } catch (e) { return '<p class="muted">바탕화면 창이 닫혀 있어요.</p>'; } } };
    G.TEACHER_OPENER = O;
    if (!O) {
      var st = document.getElementById('deskStart');
      if (st) { st.hidden = false; st.innerHTML = '<div class="ds-card"><h2 class="jua">선생님 서랍</h2><p class="ds-lead">이 창은 바탕화면에서 [선생님] 단추를 눌러 열어요.<br>바탕화면 창을 열고 [선생님]을 눌러 주세요.</p><button type="button" class="ds-btn" onclick="window.close()">창 닫기</button></div>'; }
      return;
    }
    // '시트 관리' 탭의 단추 (바탕화면 창의 시트에 대고)
    document.addEventListener('click', function (e) {
      var a = e.target.closest('[data-acct]');
      if (a) {
        var k = a.dataset.acct;
        if (k === 'open') { try { window.open(O.SpreadsheetApp.getActiveSpreadsheet().getUrl(), '_blank', 'noopener'); } catch (x) {} }
        else { try { O.DESKAPP.acct(k); } catch (x) {} window.close(); }
        return;
      }
      var b = e.target.closest('[data-tool]'); if (!b || b.disabled) return;
      var name = b.dataset.tool;
      if (b.classList.contains('warn') && !b.classList.contains('sure')) {
        b.classList.add('sure'); b.querySelector('b').dataset.t = b.querySelector('b').textContent; b.querySelector('b').textContent = '한 번 더 누르면 실행해요';
        setTimeout(function () { if (!b.isConnected) return; b.classList.remove('sure'); b.querySelector('b').textContent = b.querySelector('b').dataset.t; }, 4000);
        return;
      }
      b.disabled = true; b.classList.add('run');
      pcall('sheetTool', [O.CODE || '', O.TPW || '', name]).then(function (r) {
        b.disabled = false; b.classList.remove('run', 'sure');
        var m = (r && r.msgs && r.msgs.length) ? r.msgs[r.msgs.length - 1] : '시트에 반영했어요';
        if (G.toast) G.toast(String(m).replace(/웹 앱을 열어 둔 창은 새로고침하세요\.?/, '').split('\n\n')[0] || '시트에 반영했어요');
        if (/resetAll|removeSamples|clearRecords|applySettings/.test(name)) { try { O.localStorage.removeItem('classdesk-cache'); } catch (x) {} setTimeout(function () { try { O.location.reload(); } catch (x) {} window.close(); }, 1200); }
      }, function (err) { b.disabled = false; b.classList.remove('run', 'sure'); if (G.toast) G.toast(err.message); });
    });
  }

  // ── 구글 로그인 (토큰은 1시간짜리. 다 되면 화면을 한 번 누를 때 조용히 새로 받는다) ──
  var TOK = { t: '', exp: 0 }, TC = null, ASK = null, MODE = '';   // MODE: 'google' | 'demo'
  try { TOK = JSON.parse(sessionStorage.getItem('desk-tok') || 'null') || TOK; } catch (e) {}
  function tokenOk() { return TOK.t && Date.now() < TOK.exp - 120000; }
  function gis() {
    return new Promise(function (ok, no) {
      var n = 0; (function chk() { if (G.google && google.accounts && google.accounts.oauth2) return ok(); if (++n > 100) return no(new Error('구글 로그인 창을 불러오지 못했어요. 인터넷을 확인해 주세요.')); setTimeout(chk, 100); })();
    });
  }
  async function askToken(prompt) {
    if (ASK) return ASK;
    await gis();
    if (!TC) TC = google.accounts.oauth2.initTokenClient({ client_id: CFG.clientId, scope: SCOPE, callback: function () {} });
    ASK = new Promise(function (ok, no) {
      TC.callback = function (r) {
        ASK = null;
        if (r.error || !google.accounts.oauth2.hasGrantedAllScopes(r, SCOPE)) return no(new Error(r.error === 'access_denied' || !r.error ? '시트 권한을 허락해야 쓸 수 있어요.' : '로그인하지 못했어요: ' + r.error));
        TOK = { t: r.access_token, exp: Date.now() + (Number(r.expires_in) || 3600) * 1000 };
        try { sessionStorage.setItem('desk-tok', JSON.stringify(TOK)); } catch (e) {}
        linkState(); ok(TOK.t); kick();
      };
      TC.error_callback = function (e) { ASK = null; no(new Error(e && e.type === 'popup_closed' ? '로그인 창이 닫혔어요.' : '로그인 창을 열지 못했어요. 팝업 차단을 풀어 주세요.')); };
      TC.requestAccessToken({ prompt: prompt == null ? '' : prompt });
    });
    return ASK;
  }
  // 토큰이 곧 끝나면, 누군가 화면을 누르는 순간(팝업이 허락되는 때)에 미리 새로 받는다
  document.addEventListener('click', function () { if (MODE === 'google' && !tokenOk() && !ASK) askToken('').catch(function () {}); }, true);
  var backend = {
    fetch: async function (url, opt) {
      if (!tokenOk()) { var e = new Error('구글 연결이 잠시 쉬고 있어요. 화면을 한 번 누르면 이어져요.'); e.status = 401; throw e; }
      opt = Object.assign({}, opt); opt.headers = Object.assign({ Authorization: 'Bearer ' + TOK.t, 'Content-Type': 'application/json' }, opt.headers || {});
      var res = await fetch(url, opt);
      if (res.status === 401) { TOK.exp = 0; linkState(); }
      return res;
    },
  };
  async function gapi(url, opt) { var r = await backend.fetch(url, opt); if (!r.ok) { var m = ''; try { m = (await r.json()).error.message; } catch (e) {} var er = new Error(m || '구글 연결 오류 ' + r.status); er.status = r.status; throw er; } return r.json(); }

  // ── 부르기 줄 세우기 ──
  var READY = null, READY_OK = null; READY = new Promise(function (ok) { READY_OK = ok; });
  var CHAIN = Promise.resolve();
  function inChain(job) { var p = CHAIN.then(job); CHAIN = p.catch(function () {}); return p; }
  var READS = { getAll: 1, sync: 1, teacher: 1, attendGet: 1, monthData: 1, getAccount: 1, checkTeacher: 1, getWeather: 1, shareInfo: 1, mailPw: 1, getMeal: 1, searchSchool: 1, lessonWeek: 1, lessonFind: 1, noticeList: 1 };
  var LOGS = { tap: 1, present: 1, undoPresent: 1, feel: 1, thermo: 1, thermoReset: 1 };   // 앱만 쓰는 기록 탭 → 다시 읽을 필요 없음
  var EDITABLE = ['설정', '월별 보기', '학생', '계정', '기초시간표', '시간표변경', '일정', '명언', '할일', '쪽지', '선생님노트', '모둠', '출결', '수업계획', '알림장'];
  var LAST_FULL = 0, LAST_FRESH = 0, TICKETS = [], DIRTY = false, FT = null, FIRST_UNSENT = 0, FAILS = 0, STATE = 'ok';
  async function exec(fn, args) {
    await READY;
    if (!G.CORE[fn]) throw new Error('앱판에 없는 기능이에요: ' + fn);
    if (MODE === 'google') {
      if (READS[fn] && Date.now() - LAST_FULL > 170000 && !G.GS.pending()) { await reload(); }
      else if (!READS[fn] && !LOGS[fn] && Date.now() - LAST_FRESH > 20000) { await sendNow(); await G.GS.refresh(EDITABLE); LAST_FRESH = Date.now(); }
    }
    var res = await G.CORE[fn].apply(null, clone(args || []));
    var msgs = G.GS.alerts();
    if (msgs.length && res && typeof res === 'object') res.msgs = msgs;
    if (READS[fn]) return clone(res);
    DIRTY = true;
    // 줄은 바로 비켜 주고(다음 부르기가 기다리지 않게), 화면에는 시트에 저장된 뒤에 '됐어요'를 알린다
    return { ticket: new Promise(function (ok, no) { TICKETS.push({ ok: function () { ok(clone(res)); }, no: no }); schedule(); }) };
  }
  function call(fn, args) { return inChain(function () { return exec(fn, args); }).then(function (x) { return READS[fn] ? x : x.ticket; }); }
  async function reload() {
    await sendNow();
    if (G.GS.pending()) return;
    await G.GS.open(G.GS.info().id);
    LAST_FULL = LAST_FRESH = Date.now();
    G.CacheService.getScriptCache().remove('setup-v6');   // 시트에서 학생 수 · 계정 종류를 고쳤으면 다음 읽기에서 탭을 맞춘다
  }
  // 마지막으로 누른 뒤 2.5초, 길어도 8초 안에는 보낸다
  function schedule() {
    if (!FIRST_UNSENT) FIRST_UNSENT = Date.now();
    clearTimeout(FT);
    FT = setTimeout(function () { inChain(sendNow).catch(function () {}); }, Math.max(0, Math.min(2500, FIRST_UNSENT + 8000 - Date.now())));
    linkState();
  }
  function kick() { if (G.GS.pending() || TICKETS.length) { clearTimeout(FT); FT = setTimeout(function () { inChain(sendNow).catch(function () {}); }, 300); } }
  async function sendNow() {
    clearTimeout(FT);
    if (DIRTY) { DIRTY = false; try { G.CORE.updateSummary(); } catch (e) { console.warn(e); } }
    var tickets = TICKETS; TICKETS = [];
    if (!G.GS.pending()) { FIRST_UNSENT = 0; tickets.forEach(function (t) { t.ok(); }); return; }
    try {
      await G.GS.flush();
      FIRST_UNSENT = 0; FAILS = 0; STATE = 'ok'; ls(pendKey(), null);
      tickets.forEach(function (t) { t.ok(); });
    } catch (e) {
      if (G.GS.pending()) {   // 다시 보낼 수 있는 실패 (인터넷 · 로그인 · 너무 많이)
        TICKETS = tickets.concat(TICKETS); FAILS++; STATE = e.status === 401 ? 'auth' : 'offline';
        savePending();
        clearTimeout(FT); FT = setTimeout(function () { inChain(sendNow).catch(function () {}); }, Math.min(60000, 4000 * FAILS));
      } else {               // 시트가 받아 주지 않은 요청 → 시트를 다시 읽어 화면을 맞춘다
        STATE = 'ok'; tickets.forEach(function (t) { t.no(new Error('시트에 저장하지 못했어요. 시트를 다시 불러올게요. (' + e.message + ')')); });
        try { await G.GS.open(G.GS.info().id); LAST_FULL = Date.now(); } catch (x) {}
      }
    }
    linkState();
  }
  function pendKey() { return 'desk-pending-' + ((G.GS.info() || {}).id || ''); }
  function savePending() { if (MODE !== 'google') return; try { var w = G.GS._wb(); var s = JSON.stringify(w.reqs); if (s.length < 3e6) localStorage.setItem(pendKey(), s); } catch (e) {} }
  // 새로고침 · 창을 닫기 전에 못 보낸 것을 적어 둔다
  addEventListener('pagehide', function () { if (G.GS.pending()) { try { if (DIRTY) { DIRTY = false; G.CORE.updateSummary(); } } catch (e) {} savePending(); } });
  addEventListener('online', kick);

  // ── 화면 오른쪽 위 작은 알림 (연결 상태) ──
  function linkState() {
    var el = $('deskLink'); if (!el) return;
    var off = MODE === 'google' && (STATE !== 'ok' || !tokenOk());
    G.NET_OFF = off; if (G.syncState && G.D) G.syncState();   // 머리띠 불빛: 빨강
    el.hidden = !off && MODE !== 'demo';
    el.className = 'desk-link' + (MODE === 'demo' ? ' demo' : '');
    el.innerHTML = MODE === 'demo' ? '체험판 · 시트에 저장되지 않아요 <button type="button" id="deskGo">구글로 시작하기</button>'
      : STATE === 'offline' ? '인터넷이 잠시 끊겼어요 · 이 기기에 모아 두었다가 이어지면 시트에 보내요'
      : '구글 연결이 잠시 쉬고 있어요 · <button type="button" id="deskRe">다시 잇기</button>';
    var go = $('deskGo'); if (go) go.onclick = function () { ls('desk-sheet', null); location.href = BASE; };
    var re = $('deskRe'); if (re) re.onclick = function () { askToken('').catch(function (e) { toast(e.message); }); };
  }
  function toast(m) { if (G.toast) G.toast(m); else alert(m); }

  // ── google.script.run 흉내 ──
  function Runner(ok, no) { this._ok = ok; this._no = no; }
  Runner.prototype.withSuccessHandler = function (f) { return runner(f, this._no); };
  Runner.prototype.withFailureHandler = function (f) { return runner(this._ok, f); };
  function runner(ok, no) {
    return new Proxy(new Runner(ok, no), { get: function (t, k) {
      if (k in t || typeof k !== 'string') return t[k];
      return function () {
        var p = call(k, [].slice.call(arguments));
        p.then(function (r) { t._ok && t._ok(r); }, function (e) { console.warn(k, e); t._no && t._no(e instanceof Error ? e : new Error(String(e))); });
      };
    } });
  }
  G.google = G.google || {};
  G.google.script = { run: runner(null, null) };
  // ── 시작 화면 ──
  function shell(inner) {
    var el = $('deskStart');
    el.innerHTML = '<div class="ds-card">' + inner + '</div><p class="ds-foot">만든 사람 <a href="https://kimman.kr" target="_blank" rel="noopener">김맨 (kimman.kr)</a> · '
      + '<a href="https://creativecommons.org/licenses/by-sa/4.0/deed.ko" target="_blank" rel="noopener">CC BY-SA 4.0</a> · 학생 개인정보는 선생님 구글 드라이브에만 저장돼요. 시트는 학생 · 학부모에게 절대 공유하지 마세요. 시트 공유 범위는 선생님이 관리해 주세요. · <a href="https://kimman.kr/desk/privacy" target="_blank" rel="noopener">개인정보처리방침</a> · <a href="https://kimman.kr/desk/terms" target="_blank" rel="noopener">이용약관</a> · 문의 <a href="mailto:rlaalscjswo1@gmail.com">rlaalscjswo1@gmail.com</a></p>';
    el.hidden = false; document.body.classList.add('desk-starting');
    [].forEach.call(document.body.children, function (c) { if (c !== el) c.inert = true; });   // 뒤쪽 화면은 손 · 화면 읽기 프로그램이 못 닿게
    return el;
  }
  function hideStart() { $('deskStart').hidden = true; document.body.classList.remove('desk-starting'); [].forEach.call(document.body.children, function (c) { c.inert = false; }); }
  function welcome(msg) {
    var el = shell('<div class="ds-logo" aria-hidden="true"></div><h1 class="jua">우리반 바탕화면</h1>'
      + '<p class="ds-lead">전자칠판에 하루 종일 띄워 두는 학급 바탕화면이에요.<br>기록은 모두 선생님 구글 시트에 쌓여요.</p>'
      + '<ul class="ds-points"><li><b>설치할 것 없어요</b>구글로 시작하면 시트를 저절로 만들고 꾸며 줘요.</li>'
      + '<li><b>시트는 선생님 것</b>선생님 구글 드라이브에 저장되고, 이 앱은 자기가 만든 시트만 열 수 있어요.</li>'
      + '<li><b>아이들 화면엔 필요한 것만</b>마음 신호등 색 · 노트 · 출결은 선생님 서랍에만 보여요.</li></ul>'
      + (msg ? '<p class="ds-err" role="alert">' + esc(msg) + '</p>' : '')
      + '<button type="button" class="ds-btn" id="dsGoogle"><span class="g" aria-hidden="true"></span>구글 계정으로 시작하기</button>'
      + '<button type="button" class="ds-btn ghost" id="dsDemo">로그인 없이 먼저 둘러보기</button>'
      + '<p class="ds-small">처음 로그인하면 구글이 "이 앱이 만든 파일만 보기" 권한을 물어봐요. 허락해야 시트에 저장할 수 있어요.</p>');
    $('dsGoogle').onclick = function () {
      if (!CFG.clientId) { welcome('아직 구글 로그인 열쇠(클라이언트 ID)가 설정되지 않은 사본이에요. config.js 를 확인해 주세요.'); return; }
      this.disabled = true; this.textContent = '구글 창이 열려요…';
      askToken('consent').then(chooser).catch(function (e) { welcome(e.message); });
    };
    $('dsDemo').onclick = demo;
    el.querySelector('button').focus();
  }
  async function chooser() {
    MODE = 'google';
    shell('<h2 class="jua">어느 학급을 열까요?</h2><p class="ds-lead">찾는 중…</p>');
    var files = [];
    try {
      var j = await gapi(DRIVE + '?pageSize=30&orderBy=modifiedTime%20desc&fields=files(id,name,modifiedTime,appProperties)&q=' + encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false"));
      // 같은 로그인 열쇠를 쓰는 MY DESK(kimman.kr/mydesk) 시트는 빼고
      files = (j.files || []).filter(function (f) { return !(f.appProperties && f.appProperties.app === 'mydesk'); });
    } catch (e) { console.warn(e); }
    var list = files.map(function (f) { return '<button type="button" class="ds-file" data-id="' + esc(f.id) + '"><b>' + esc(f.name.replace(/^우리반 바탕화면 · /, '')) + '</b><small>' + esc(f.modifiedTime ? new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(new Date(f.modifiedTime)) : '') + ' 고침</small></button>'; }).join('');
    shell('<h2 class="jua">' + (files.length ? '어느 학급을 열까요?' : '우리 학급을 만들어요') + '</h2>'
      + (files.length ? '<div class="ds-files">' + list + '</div><p class="ds-or">또는 새 학급 만들기</p>' : '<p class="ds-lead">학급 이름을 적으면 구글 드라이브에 시트를 만들고, 예시 학생 · 시간표로 채워 둬요. 나중에 시트에서 바꾸면 돼요.</p>')
      + '<label class="ds-lab" for="dsNick">학급 이름</label><input class="ds-in" id="dsNick" maxlength="30" name="nick" placeholder="예: 꿈을 키우는 6학년 2반…" autocomplete="off">'
      + '<button type="button" class="ds-btn" id="dsMake">이 이름으로 시트 만들기</button>'
      + '<button type="button" class="ds-btn ghost sm" id="dsOut">다른 구글 계정으로</button>');
    [].forEach.call(document.querySelectorAll('.ds-file'), function (b) { b.onclick = function () { start(b.dataset.id); }; });
    $('dsMake').onclick = function () { make($('dsNick').value.trim()); };
    $('dsNick').addEventListener('keydown', function (e) { if (e.key === 'Enter') $('dsMake').click(); });
    $('dsOut').onclick = signOut;
  }
  async function make(nick) {
    shell('<h2 class="jua">시트를 만드는 중이에요</h2><p class="ds-lead" id="dsStep">구글 드라이브에 새 시트를 만들어요…</p><div class="ds-bar"><i></i></div>');
    try {
      var s = await gapi(G.GS.API.replace(/\/$/, ''), { method: 'POST', body: JSON.stringify({ properties: { title: '우리반 바탕화면 · ' + (nick || '우리반'), locale: 'ko_KR', timeZone: 'Asia/Seoul' } }) });
      $('dsStep').textContent = '탭 24개를 만들고 색 · 표 · 그래프로 꾸며요 (10초쯤)…';
      await G.GS.open(s.spreadsheetId);
      G.CORE.setup_();
      if (nick) G.CORE.setSetting_('학급 닉네임', nick);
      G.CORE.updateSummary(true);
      await G.GS.flush();
      ls('classdesk-cache', null);
      await start(s.spreadsheetId, true);
    } catch (e) { console.warn(e); chooserError(e); }
  }
  function chooserError(e) {
    shell('<h2 class="jua">잘 안 됐어요</h2><p class="ds-err" role="alert">' + esc(e.message) + '</p><button type="button" class="ds-btn" id="dsBack">다시 해 보기</button>');
    $('dsBack').onclick = function () { tokenOk() ? chooser() : welcome(); };
  }
  async function start(id, fresh) {
    MODE = 'google';
    if (!fresh) shell('<h2 class="jua">학급을 여는 중이에요</h2><p class="ds-lead">시트에서 우리반 기록을 가져와요…</p><div class="ds-bar"><i></i></div>');
    try {
      if (ls('desk-sheet') !== id) ls('classdesk-cache', null);
      var pend = ls('desk-pending-' + id);
      if (!fresh) {
        if (pend) { await gapi(G.GS.API + id + ':batchUpdate', { method: 'POST', body: JSON.stringify({ requests: JSON.parse(pend) }) }).catch(function (e) { if (e.status && e.status < 500 && e.status !== 429 && e.status !== 401) return; throw e; }); ls('desk-pending-' + id, null); }
        await G.GS.open(id);
      }
      ls('desk-sheet', id);
      LAST_FULL = LAST_FRESH = Date.now();
      hideStart(); linkState(); READY_OK();
    } catch (e) {
      console.warn(e);
      if (e.status === 404 || e.status === 403) { ls('desk-sheet', null); chooserError(new Error('그 시트를 열 수 없어요. 지워졌거나 다른 계정의 시트예요.')); }
      else chooserError(e);
    }
  }
  function demo() {
    MODE = 'demo'; G.GS.useBackend(null);
    G.GS.blank('', '체험판');
    G.CORE.setup_();
    G.GS.takePending();
    hideStart(); linkState(); READY_OK();
  }
  function signOut() {
    try { if (TOK.t && G.google.accounts) google.accounts.oauth2.revoke(TOK.t, function () {}); } catch (e) {}
    TOK = { t: '', exp: 0 }; try { sessionStorage.removeItem('desk-tok'); } catch (e) {}
    ls('desk-sheet', null); ls('classdesk-cache', null); ls('classdesk-tpw', null);
    location.href = BASE;
  }

  // ── 선생님 서랍 '시트 관리' 탭 ──
  var TOOLS = [
    ['시트 정리', [['refreshAll', '체크표 · 학생별 · 그래프 새로 그리기', '시트에서 직접 기록을 고쳤을 때'], ['applySettings', '설정 반영하기', '시트에서 학생 수 · 계정 종류를 바꿨을 때 학생 · 계정 탭을 맞춰요'],
      ['monthReport', '이번 달 보고서 탭 만들기', '학생마다 한 달 동안 한 일을 한 장으로 (상담 · 생활기록 참고)'], ['toggleRaw', '원본 기록 탭 보이기 / 숨기기', '앱이 쓰는 기록 · 감정 · 온도계 탭'], ['restyle', '시트 다시 꾸미기', '탭 색 · 순서 · 머리글을 처음 모양으로']]],
    ['정렬', [['sortStudents', '학생 · 계정 번호순'], ['sortNotes', '선생님 노트 학생별로 모으기'], ['sortEvents', '일정 날짜순']]],
    ['처음으로', [['removeSamples', '예시 데이터만 지우기', '예시 학생 이름 · 기록 · 노트를 지워요. 선생님이 넣은 것은 그대로', 1],
      ['clearRecords', '기록 모두 비우기 (새 학기)', '기록 · 감정 · 온도계 · 쪽지 · 노트 · 모둠을 지워요. 학생 · 시간표 · 설정은 그대로', 1],
      ['resetAll', '처음 상태로 다시 만들기', '모든 탭을 지우고 예시로 새로 만들어요. 되돌릴 수 없어요', 1]]],
  ];
  function sheetPane() {
    var info = G.GS.info() || {};
    return '<div class="dsec"><h4>지금 열린 시트</h4><p class="muted" style="margin-bottom:8px">' + (MODE === 'demo' ? '체험판이에요. 여기서 누른 것은 시트에 저장되지 않아요.' : esc(info.title || '')) + '</p><div class="frow">'
      + (MODE === 'demo' ? '<button class="btn sm" data-acct="go">구글로 시작하기</button>' : '<button class="btn sm" data-acct="open">시트 열기</button><button class="btn ghost sm" data-acct="switch">다른 학급 열기 · 새 학급</button><button class="btn ghost sm" data-acct="out">로그아웃</button>')
      + '</div></div>'
      + TOOLS.map(function (g, gi) {
        return '<div class="dsec"><h4>' + g[0] + '</h4><div class="desk-tools g' + gi + '">' + g[1].map(function (t) {
          return '<button type="button" class="desk-tool' + (t[3] ? ' warn' : '') + '" data-tool="' + t[0] + '"><b>' + t[1] + '</b>' + (t[2] ? '<small>' + t[2] + '</small>' : '') + '</button>';
        }).join('') + '</div></div>';
      }).join('')
      + '<p class="muted">GAS판(앱스 스크립트)의 시트 메뉴 \'앱 설정\'과 같은 기능이에요. 앱판에서는 여기서 눌러요.</p>';
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-acct]');
    if (a) {
      var k = a.dataset.acct;
      if (k === 'go') { ls('desk-sheet', null); location.href = BASE; }
      if (k === 'open') window.open(G.SpreadsheetApp.getActiveSpreadsheet().getUrl(), '_blank', 'noopener');
      if (k === 'switch') { ls('desk-sheet', null); ls('classdesk-cache', null); location.href = BASE + '?choose=1'; }
      if (k === 'out') signOut();
      return;
    }
    var b = e.target.closest('[data-tool]'); if (!b || b.disabled) return;
    var name = b.dataset.tool;
    if (b.classList.contains('warn') && !b.classList.contains('sure')) {   // 지우는 단추는 한 번 더 눌러야
      b.classList.add('sure'); b.querySelector('b').dataset.t = b.querySelector('b').textContent; b.querySelector('b').textContent = '한 번 더 누르면 실행해요';
      setTimeout(function () { if (!b.isConnected) return; b.classList.remove('sure'); b.querySelector('b').textContent = b.querySelector('b').dataset.t; }, 4000);
      return;
    }
    b.disabled = true; b.classList.add('run');
    call('sheetTool', [G.CODE || '', G.TPW || '', name]).then(function (r) {
      b.disabled = false; b.classList.remove('run', 'sure');
      var m = (r && r.msgs && r.msgs.length) ? r.msgs[r.msgs.length - 1] : '시트에 반영했어요';
      toast(String(m).replace(/웹 앱을 열어 둔 창은 새로고침하세요\.?/, '').split('\n\n')[0] || '시트에 반영했어요');
      if (/resetAll|removeSamples|clearRecords|applySettings/.test(name)) { ls('classdesk-cache', null); setTimeout(function () { location.reload(); }, 1200); }
    }, function (err) { b.disabled = false; b.classList.remove('run', 'sure'); toast(err.message); });
  });

  // ── 전체 화면 ──
  function fsSync() { var b = $('fsBtn'); if (b) b.classList.toggle('on', !!document.fullscreenElement); }
  document.addEventListener('fullscreenchange', fsSync);
  document.addEventListener('click', function (e) {
    if (!e.target.closest('#fsBtn')) return;
    if (document.fullscreenElement) document.exitFullscreen(); else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(function () {});
  });

  G.DESK_ACCT = function (k) {
    if (k === 'go') { ls('desk-sheet', null); location.href = BASE; }
    if (k === 'switch') { ls('desk-sheet', null); ls('classdesk-cache', null); location.href = BASE + '?choose=1'; }
    if (k === 'out') signOut();
  };
  G.DESK = {
    call: call, sheetPane: sheetPane, mode: function () { return MODE; },
    // 앱판 주방(overrides.js)이 Drive API 를 부를 때 (공유 확인 · 시트 주인 메일)
    drive: function (path) { return gapi(DRIVE + path); },
    // 시험용: 끝까지 보내기
    drain: function () { return inChain(sendNow); },
  };

  // ── 시작 ──
  G.GS.useBackend(backend);
  var saved = ls('desk-sheet');
  if (/[?&]demo/.test(location.search)) demo();
  else if (saved && !/[?&]choose/.test(location.search)) {
    MODE = 'google';
    if (tokenOk()) start(saved);
    else {   // 새로 연 창: 토큰이 없으니 한 번 눌러 이어 달라고
      shell('<h2 class="jua">우리반 바탕화면</h2><p class="ds-lead">지난번에 쓰던 학급 시트로 이어서 열어요.</p><button type="button" class="ds-btn" id="dsCont"><span class="g" aria-hidden="true"></span>구글로 이어서 열기</button><button type="button" class="ds-btn ghost sm" id="dsOther">다른 학급 · 다른 계정</button>');
      $('dsCont').onclick = function () { this.disabled = true; askToken('').then(function () { start(saved); }).catch(function (e) { welcome(e.message); }); };
      $('dsOther').onclick = function () { ls('desk-sheet', null); welcome(); };
      $('dsCont').focus();
    }
  } else if (/[?&]choose/.test(location.search) && tokenOk()) chooser();
  else welcome();
})(window);
