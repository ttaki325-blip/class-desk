/*
 * 우리반 바탕화면 앱판 — 시트 연결 부품 (만든 사람 김맨 https://kimman.kr · CC BY-SA 4.0)
 * Apps Script의 SpreadsheetApp 을 브라우저에서 흉내 낸다.
 *   읽기: 시트 전체를 한 번에 메모리로 가져와 그 위에서 바로 계산한다 (Code.gs 를 그대로 돌리려고).
 *   쓰기: 메모리를 바로 고치고, 같은 일을 Sheets API 요청으로 쌓아 두었다가 몇 초씩 모아 한 번에 보낸다.
 *   값은 글자 그대로(RAW) 쓴다. 날짜 '2026-10-08'이 시트 언어 설정에 따라 '2026. 10. 8'로 바뀌어 다시 못 읽는 일이 없게.
 */
(function (G) {
  'use strict';
  var API = 'https://sheets.googleapis.com/v4/spreadsheets/';
  var WB = null;                       // { id, title, sheets:[], active, reqs:[], loadedAt }
  var BACKEND = null;                  // { fetch(url, opt) } — 없으면 체험판(메모리만)

  // ── 작은 도구 ──
  function rid() { return Math.floor(Math.random() * 2e9) + 1; }
  function rgb(hex) { var n = parseInt(String(hex).replace('#', ''), 16); return { red: (n >> 16 & 255) / 255, green: (n >> 8 & 255) / 255, blue: (n & 255) / 255 }; }
  function colNum(s) { var n = 0; for (var i = 0; i < s.length; i++) n = n * 26 + s.charCodeAt(i) - 64; return n; }
  function q(name) { return "'" + String(name).replace(/'/g, "''") + "'"; }
  function push(r) { WB.reqs.push(r); return r; }
  var NEWPROT = [];   // [요청, 탭] — 이번 묶음에서 새로 건 보호 (보낸 뒤 번호를 받아 적는다)
  function blank(v) { return v === '' || v === null || v === undefined; }
  // 시트에 쓴 값이 다시 읽을 때와 같은 모양이 되게 (수식 막이 ' 는 RAW 로 쓰면 필요 없다)
  function norm(v) {
    if (v instanceof Date) return G.Utilities.formatDate(v, '', 'yyyy-MM-dd HH:mm');
    if (blank(v)) return '';
    if (typeof v === 'string' && /^'[=+\-@]/.test(v)) return v.slice(1);
    return v;
  }
  function cellData(v, formula) {
    v = norm(v);
    if (v === '') return {};
    if (formula) return { userEnteredValue: { formulaValue: String(v) } };
    if (typeof v === 'number' && isFinite(v)) return { userEnteredValue: { numberValue: v } };
    if (typeof v === 'boolean') return { userEnteredValue: { boolValue: v } };
    return { userEnteredValue: { stringValue: String(v) } };
  }

  // ── 시트 한 장 ──
  function Sheet(p) {
    this.id = p.sheetId; this.name = p.title; this.hidden = !!p.hidden;
    this.maxR = (p.gridProperties && p.gridProperties.rowCount) || 1000;
    this.maxC = (p.gridProperties && p.gridProperties.columnCount) || 26;
    this.rows = []; this.cf = 0; this.bands = []; this.charts = []; this.prot = [];
  }
  Sheet.prototype.grow = function (r, c) {   // 범위가 칸 밖으로 나가면 시트를 늘린다
    if (r > this.maxR) { push({ appendDimension: { sheetId: this.id, dimension: 'ROWS', length: r - this.maxR } }); this.maxR = r; }
    if (c > this.maxC) { push({ appendDimension: { sheetId: this.id, dimension: 'COLUMNS', length: c - this.maxC } }); this.maxC = c; }
  };
  Sheet.prototype.cell = function (r, c) { var row = this.rows[r - 1]; var v = row ? row[c - 1] : ''; return blank(v) ? '' : v; };
  Sheet.prototype.put = function (r, c, v) { var rows = this.rows; while (rows.length < r) rows.push([]); var row = rows[r - 1]; while (row.length < c - 1) row.push(''); row[c - 1] = norm(v); };
  Sheet.prototype.getName = function () { return this.name; };
  Sheet.prototype.getSheetId = function () { return this.id; };
  Sheet.prototype.getIndex = function () { return WB.sheets.indexOf(this) + 1; };
  Sheet.prototype.getMaxRows = function () { return this.maxR; };
  Sheet.prototype.getMaxColumns = function () { return this.maxC; };
  Sheet.prototype.getLastRow = function () { var n = this.rows.length; while (n && !(this.rows[n - 1] || []).some(function (v) { return !blank(v); })) n--; return n; };
  Sheet.prototype.getLastColumn = function () { var m = 0; for (var i = 0; i < this.rows.length; i++) { var r = this.rows[i] || []; for (var j = r.length; j > m; j--) if (!blank(r[j - 1])) { m = j; break; } } return m; };
  Sheet.prototype.getRange = function (row, col, nr, nc) {
    if (typeof row === 'string') return a1(this, row);
    return new Range(this, row, col, nr || 1, nc || 1);
  };
  Sheet.prototype.getDataRange = function () { return new Range(this, 1, 1, Math.max(1, this.getLastRow()), Math.max(1, this.getLastColumn())); };
  Sheet.prototype.getRangeList = function (list) {
    var sh = this, rs = list.map(function (s) { return a1(sh, s); });
    return { setBorder: function () { var a = arguments; rs.forEach(function (r) { r.setBorder.apply(r, a); }); return this; } };
  };
  Sheet.prototype.appendRow = function (vals) { var r = this.getLastRow() + 1; new Range(this, r, 1, 1, vals.length).setValues([vals]); return this; };
  Sheet.prototype.deleteRow = function (n) {
    push({ deleteDimension: { range: { sheetId: this.id, dimension: 'ROWS', startIndex: n - 1, endIndex: n } } });
    this.rows.splice(n - 1, 1); this.maxR--; return this;
  };
  Sheet.prototype.deleteColumns = function (c, n) {
    push({ deleteDimension: { range: { sheetId: this.id, dimension: 'COLUMNS', startIndex: c - 1, endIndex: c - 1 + n } } });
    this.rows.forEach(function (r) { r.splice(c - 1, n); }); this.maxC -= n; return this;
  };
  Sheet.prototype.insertColumnsAfter = function (c, n) {
    push({ insertDimension: { range: { sheetId: this.id, dimension: 'COLUMNS', startIndex: c, endIndex: c + n }, inheritFromBefore: true } });
    this.rows.forEach(function (r) { if (r.length > c) r.splice.apply(r, [c, 0].concat(new Array(n).fill(''))); }); this.maxC += n; return this;
  };
  Sheet.prototype.clear = function () { push({ updateCells: { range: { sheetId: this.id }, fields: '*' } }); this.rows = []; return this; };
  function dim(sh, d, start, n, px) { push({ updateDimensionProperties: { range: { sheetId: sh.id, dimension: d, startIndex: start - 1, endIndex: start - 1 + n }, properties: { pixelSize: px }, fields: 'pixelSize' } }); return sh; }
  Sheet.prototype.setColumnWidth = function (c, w) { this.grow(0, c); return dim(this, 'COLUMNS', c, 1, w); };
  Sheet.prototype.setColumnWidths = function (c, n, w) { this.grow(0, c + n - 1); return dim(this, 'COLUMNS', c, n, w); };
  Sheet.prototype.setRowHeight = function (r, h) { this.grow(r, 0); return dim(this, 'ROWS', r, 1, h); };
  Sheet.prototype.setRowHeights = function (r, n, h) { this.grow(r + n - 1, 0); return dim(this, 'ROWS', r, n, h); };
  function props(sh, p, fields) { p.sheetId = sh.id; push({ updateSheetProperties: { properties: p, fields: fields } }); return sh; }
  Sheet.prototype.setFrozenRows = function (n) { return props(this, { gridProperties: { frozenRowCount: n } }, 'gridProperties.frozenRowCount'); };
  Sheet.prototype.setFrozenColumns = function (n) { return props(this, { gridProperties: { frozenColumnCount: n } }, 'gridProperties.frozenColumnCount'); };
  Sheet.prototype.setHiddenGridlines = function (h) { return props(this, { gridProperties: { hideGridlines: !!h } }, 'gridProperties.hideGridlines'); };
  Sheet.prototype.setTabColor = function (hex) { return props(this, { tabColorStyle: { rgbColor: rgb(hex) } }, 'tabColorStyle'); };
  Sheet.prototype.hideSheet = function () { this.hidden = true; return props(this, { hidden: true }, 'hidden'); };
  Sheet.prototype.showSheet = function () { this.hidden = false; return props(this, { hidden: false }, 'hidden'); };
  Sheet.prototype.isSheetHidden = function () { return this.hidden; };
  Sheet.prototype.hideColumns = function (c, n) { this.grow(0, c + (n || 1) - 1); push({ updateDimensionProperties: { range: { sheetId: this.id, dimension: 'COLUMNS', startIndex: c - 1, endIndex: c - 1 + (n || 1) }, properties: { hiddenByUser: true }, fields: 'hiddenByUser' } }); return this; };
  Sheet.prototype.getBandings = function () {
    var sh = this;
    return sh.bands.map(function (id) { return { remove: function () { push({ deleteBanding: { bandedRangeId: id } }); sh.bands = sh.bands.filter(function (x) { return x !== id; }); } }; });
  };
  Sheet.prototype.setConditionalFormatRules = function (rules) {
    for (var i = this.cf - 1; i >= 0; i--) push({ deleteConditionalFormatRule: { sheetId: this.id, index: i } });
    var sh = this;
    rules.forEach(function (r, i) { push({ addConditionalFormatRule: { index: i, rule: r } }); });
    sh.cf = rules.length; return this;
  };
  // 보호 (경고만): protect() 는 바로 요청을 넣고, 뒤따르는 setWarningOnly 등은 보내기 전에 그 요청을 고친다
  Sheet.prototype.protect = function () {
    var pr = this._np, o = {};   // 이번 묶음에서 이미 건 보호가 있으면 그걸 고쳐 쓴다 (한 탭에 두 번 걸면 시트가 받아 주지 않는다)
    if (pr) { pr.warningOnly = false; delete pr.description; delete pr.unprotectedRanges; }
    else { pr = this._np = { range: { sheetId: this.id }, warningOnly: false }; var req = push({ addProtectedRange: { protectedRange: pr } }); NEWPROT.push([req, this]); }
    o.setWarningOnly = function (w) { pr.warningOnly = !!w; return o; };
    o.setDescription = function (d) { pr.description = String(d); return o; };
    o.setUnprotectedRanges = function (rs) { pr.unprotectedRanges = rs.map(function (r) { return r.grid(); }); return o; };
    return o;
  };
  Sheet.prototype.getProtections = function () {
    var sh = this;
    return sh.prot.map(function (id) { return { remove: function () { push({ deleteProtectedRange: { protectedRangeId: id } }); sh.prot = sh.prot.filter(function (x) { return x !== id; }); } }; });
  };
  Sheet.prototype.getCharts = function () { return this.charts.slice(); };
  Sheet.prototype.newChart = function () { return new ChartBuilder(this); };
  Sheet.prototype.insertChart = function (c) { push({ addChart: { chart: c } }); this.charts.push(c.chartId); return this; };

  // 'A2:B' 'C2:C' 'A1:A26' (끝 줄이 없으면 맨 아래까지)
  function a1(sh, s) {
    var m = /^([A-Z]+)(\d+)?(?::([A-Z]+)(\d+)?)?$/.exec(String(s).replace(/\$/g, ''));
    if (!m) throw new Error('알 수 없는 칸 주소: ' + s);
    var c1 = colNum(m[1]), r1 = Number(m[2] || 1), c2 = m[3] ? colNum(m[3]) : c1, r2 = m[3] ? (m[4] ? Number(m[4]) : sh.maxR) : r1;
    return new Range(sh, r1, c1, r2 - r1 + 1, c2 - c1 + 1);
  }

  // ── 칸 묶음 ──
  function Range(sh, r, c, nr, nc) { this.sh = sh; this.r = r; this.c = c; this.nr = nr; this.nc = nc; }
  Range.prototype.grid = function () { return { sheetId: this.sh.id, startRowIndex: this.r - 1, endRowIndex: this.r - 1 + this.nr, startColumnIndex: this.c - 1, endColumnIndex: this.c - 1 + this.nc }; };
  Range.prototype.getValues = function () {
    var out = [];
    for (var i = 0; i < this.nr; i++) { var row = []; for (var j = 0; j < this.nc; j++) row.push(this.sh.cell(this.r + i, this.c + j)); out.push(row); }
    return out;
  };
  Range.prototype.getValue = function () { return this.sh.cell(this.r, this.c); };
  Range.prototype.write = function (vals, formula) {
    if (vals.length !== this.nr || vals.some(function (row) { return row.length !== this.nc; }, this))
      throw new Error('칸 수가 맞지 않아요 (' + this.nr + '×' + this.nc + ')');
    this.sh.grow(this.r + this.nr - 1, this.c + this.nc - 1);
    var sh = this.sh, r = this.r, c = this.c;
    push({ updateCells: { start: { sheetId: sh.id, rowIndex: r - 1, columnIndex: c - 1 }, fields: 'userEnteredValue',
      rows: vals.map(function (row) { return { values: row.map(function (v) { return cellData(v, formula); }) }; }) } });
    vals.forEach(function (row, i) { row.forEach(function (v, j) { sh.put(r + i, c + j, v); }); });
    return this;
  };
  Range.prototype.setValues = function (v) { return this.write(v); };
  // 합친 칸에는 왼쪽 위 칸에만 (시트도 그렇게 보여 준다)
  Range.prototype.setValue = function (v) { return this.merged ? new Range(this.sh, this.r, this.c, 1, 1).write([[v]]) : this.write(this.fill(v)); };
  Range.prototype.setFormula = function (f) { return this.merged ? new Range(this.sh, this.r, this.c, 1, 1).write([[f]], true) : this.write(this.fill(f), true); };   // 합친 칸은 왼쪽 위에만
  Range.prototype.setFormulas = function (f) { return this.write(f, true); };
  Range.prototype.fill = function (v) { var out = []; for (var i = 0; i < this.nr; i++) { out.push(new Array(this.nc).fill(v)); } return out; };
  Range.prototype.clear = function () {   // 값 · 서식 · 고르기 목록까지
    this.sh.grow(this.r + this.nr - 1, this.c + this.nc - 1);
    push({ updateCells: { range: this.grid(), fields: '*' } });
    for (var i = 0; i < this.nr; i++) for (var j = 0; j < this.nc; j++) if (this.sh.rows[this.r - 1 + i]) this.sh.put(this.r + i, this.c + j, '');
    return this;
  };
  Range.prototype.clearContent = function () {
    push({ updateCells: { range: this.grid(), fields: 'userEnteredValue' } });
    for (var i = 0; i < this.nr; i++) for (var j = 0; j < this.nc; j++) if (this.sh.rows[this.r - 1 + i]) this.sh.put(this.r + i, this.c + j, '');
    return this;
  };
  Range.prototype.fmt = function (f, fields) { this.sh.grow(this.r + this.nr - 1, this.c + this.nc - 1); push({ repeatCell: { range: this.grid(), cell: { userEnteredFormat: f }, fields: fields } }); return this; };
  Range.prototype.setNumberFormat = function (p) {
    var type = p === '@' ? 'TEXT' : /h/.test(p) ? 'DATE_TIME' : /y|d/.test(p) ? 'DATE' : 'NUMBER';
    return this.fmt({ numberFormat: { type: type, pattern: p } }, 'userEnteredFormat.numberFormat');
  };
  Range.prototype.setFontFamily = function (f) { return this.fmt({ textFormat: { fontFamily: f } }, 'userEnteredFormat.textFormat.fontFamily'); };
  Range.prototype.setFontSize = function (n) { return this.fmt({ textFormat: { fontSize: n } }, 'userEnteredFormat.textFormat.fontSize'); };
  Range.prototype.setFontWeight = function (w) { return this.fmt({ textFormat: { bold: w === 'bold' } }, 'userEnteredFormat.textFormat.bold'); };
  Range.prototype.setFontColor = function (c) { return this.fmt({ textFormat: { foregroundColorStyle: { rgbColor: rgb(c) } } }, 'userEnteredFormat.textFormat.foregroundColorStyle'); };
  Range.prototype.setBackground = function (c) { return this.fmt({ backgroundColorStyle: { rgbColor: rgb(c) } }, 'userEnteredFormat.backgroundColorStyle'); };
  Range.prototype.setHorizontalAlignment = function (a) { return this.fmt({ horizontalAlignment: String(a).toUpperCase() }, 'userEnteredFormat.horizontalAlignment'); };
  Range.prototype.setVerticalAlignment = function (a) { return this.fmt({ verticalAlignment: String(a).toUpperCase() }, 'userEnteredFormat.verticalAlignment'); };
  Range.prototype.setWrapStrategy = function (w) { return this.fmt({ wrapStrategy: w }, 'userEnteredFormat.wrapStrategy'); };
  Range.prototype.setWrap = function (w) { return this.fmt({ wrapStrategy: w ? 'WRAP' : 'OVERFLOW_CELL' }, 'userEnteredFormat.wrapStrategy'); };
  Range.prototype.setBackgrounds = function (bg) {
    this.sh.grow(this.r + this.nr - 1, this.c + this.nc - 1);
    push({ updateCells: { start: { sheetId: this.sh.id, rowIndex: this.r - 1, columnIndex: this.c - 1 }, fields: 'userEnteredFormat.backgroundColorStyle',
      rows: bg.map(function (row) { return { values: row.map(function (c) { return { userEnteredFormat: { backgroundColorStyle: { rgbColor: rgb(c) } } }; }) }; }) } });
    return this;
  };
  Range.prototype.setDataValidation = function (rule) {   // null 이면 지우기
    this.sh.grow(this.r + this.nr - 1, this.c + this.nc - 1);
    push({ setDataValidation: rule ? { range: this.grid(), rule: rule } : { range: this.grid() } }); return this; };
  Range.prototype.merge = function () { push({ mergeCells: { range: this.grid(), mergeType: 'MERGE_ALL' } }); this.merged = true; return this; };
  Range.prototype.breakApart = function () { push({ unmergeCells: { range: this.grid() } }); return this; };
  Range.prototype.setBorder = function (top, left, bottom, right, vert, horiz, color) {
    var side = function (on) { return on === null || on === undefined ? undefined : on ? { style: 'SOLID', colorStyle: { rgbColor: rgb(color || '#000000') } } : { style: 'NONE' }; };
    var b = { range: this.grid() }, map = { top: top, left: left, bottom: bottom, right: right, innerVertical: vert, innerHorizontal: horiz };
    Object.keys(map).forEach(function (k) { var s = side(map[k]); if (s) b[k] = s; });
    push({ updateBorders: b }); return this;
  };
  Range.prototype.sort = function (spec) {
    spec = [].concat(spec).map(function (s) { return typeof s === 'number' ? { column: s, ascending: true } : s; });
    push({ sortRange: { range: this.grid(), sortSpecs: spec.map(function (s) { return { dimensionIndex: s.column - 1, sortOrder: s.ascending === false ? 'DESCENDING' : 'ASCENDING' }; }) } });
    var vals = this.getValues(), c0 = this.c;
    var cmp = function (a, b) {
      if (a === '' || b === '') return a === b ? 0 : a === '' ? 1 : -1;   // 빈칸은 늘 아래로
      var na = Number(a), nb = Number(b);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0;
    };
    vals.sort(function (x, y) {
      for (var i = 0; i < spec.length; i++) { var j = spec[i].column - c0, d = cmp(x[j], y[j]); if (x[j] !== '' && y[j] !== '' && spec[i].ascending === false) d = -d; if (d) return d; }
      return 0;
    });
    var sh = this.sh, r = this.r, c = this.c;
    vals.forEach(function (row, i) { row.forEach(function (v, j) { sh.put(r + i, c + j, v); }); });
    return this;
  };
  Range.prototype.applyRowBanding = function () {
    var id = rid(), req = push({ addBanding: { bandedRange: { bandedRangeId: id, range: this.grid(), rowProperties: { firstBandColorStyle: { rgbColor: rgb('#ffffff') }, secondBandColorStyle: { rgbColor: rgb('#f3f4f6') } } } } });
    this.sh.bands.push(id);
    var rp = req.addBanding.bandedRange.rowProperties;
    var b = { setFirstRowColor: function (c) { rp.firstBandColorStyle = { rgbColor: rgb(c) }; return b; }, setSecondRowColor: function (c) { rp.secondBandColorStyle = { rgbColor: rgb(c) }; return b; } };
    return b;
  };

  // ── 규칙 만들기 (입력 목록 · 조건부 색) ──
  function DV() { this.rule = { condition: { type: 'ONE_OF_LIST', values: [] }, showCustomUi: true, strict: false }; }
  DV.prototype.requireValueInList = function (list, show) { this.rule.condition.values = list.map(function (x) { return { userEnteredValue: String(x) }; }); this.rule.showCustomUi = show !== false; return this; };
  DV.prototype.setAllowInvalid = function (b) { this.rule.strict = !b; return this; };
  DV.prototype.build = function () { return this.rule; };
  function CF() { this.r = { ranges: [] }; this.fmt = {}; }
  CF.prototype.cond = function (type, v) { this.r.booleanRule = { condition: { type: type, values: [{ userEnteredValue: String(v) }] }, format: this.fmt }; return this; };
  CF.prototype.whenTextEqualTo = function (t) { return this.cond('TEXT_EQ', t); };
  CF.prototype.whenNumberGreaterThan = function (n) { return this.cond('NUMBER_GREATER', n); };
  CF.prototype.whenFormulaSatisfied = function (f) { return this.cond('CUSTOM_FORMULA', f); };
  CF.prototype.setBackground = function (c) { this.fmt.backgroundColorStyle = { rgbColor: rgb(c) }; return this; };
  CF.prototype.setFontColor = function (c) { this.fmt.textFormat = { foregroundColorStyle: { rgbColor: rgb(c) } }; return this; };
  CF.prototype.setGradientMinpoint = function (c) { this.r.gradientRule = this.r.gradientRule || {}; this.r.gradientRule.minpoint = { colorStyle: { rgbColor: rgb(c) }, type: 'MIN' }; return this; };
  CF.prototype.setGradientMaxpoint = function (c) { this.r.gradientRule = this.r.gradientRule || {}; this.r.gradientRule.maxpoint = { colorStyle: { rgbColor: rgb(c) }, type: 'MAX' }; return this; };
  CF.prototype.setRanges = function (rs) { this.r.ranges = rs.map(function (x) { return x.grid(); }); return this; };
  CF.prototype.build = function () { return this.r; };

  // ── 그래프 ──
  function ChartBuilder(sh) { this.sh = sh; this.type = 'COLUMN'; this.ranges = []; this.pos = [1, 1]; this.o = {}; }
  ChartBuilder.prototype.setChartType = function (t) { this.type = t; return this; };
  ChartBuilder.prototype.addRange = function (r) { this.ranges.push(r); return this; };
  ChartBuilder.prototype.setPosition = function (r, c) { this.pos = [r, c]; return this; };
  ChartBuilder.prototype.setOption = function (k, v) { this.o[k] = v; return this; };
  ChartBuilder.prototype.build = function () {
    var sh = this.sh, o = this.o, type = this.type, colors = o.colors || [];
    // Apps Script 처럼: 모든 범위를 한 열씩 펼쳐 첫 열 = 가로축, 나머지 열 = 계열.
    // (진짜 Sheets API 는 한 소스가 한 열 · 한 줄이어야 받는다 — addRange('A1:B61') 한 번만 써도 되게)
    var all = [];
    this.ranges.forEach(function (r) { for (var j = 0; j < r.nc; j++) all.push(new Range(sh, r.r, r.c + j, r.nr, 1)); });
    var dom = all[0], cols = all.slice(1);
    var src = function (r) { return { sourceRange: { sources: [r.grid()] } }; };
    var legend = { top: 'TOP_LEGEND', bottom: 'BOTTOM_LEGEND', right: 'RIGHT_LEGEND', left: 'LEFT_LEGEND', none: 'NO_LEGEND' }[(o.legend || {}).position] || 'BOTTOM_LEGEND';
    var basic = { chartType: type, legendPosition: legend, headerCount: 1, stackedType: o.isStacked ? 'STACKED' : 'NOT_STACKED',
      domains: [{ domain: src(dom) }],
      series: cols.map(function (r, i) { var s = { series: src(r), targetAxis: type === 'BAR' ? 'BOTTOM_AXIS' : 'LEFT_AXIS' }; if (colors[i]) s.colorStyle = { rgbColor: rgb(colors[i]) }; return s; }) };
    if (type === 'LINE') delete basic.stackedType;
    return { chartId: rid(), spec: { title: o.title || '', basicChart: basic },
      position: { overlayPosition: { anchorCell: { sheetId: sh.id, rowIndex: this.pos[0] - 1, columnIndex: this.pos[1] - 1 }, widthPixels: o.width || 600, heightPixels: o.height || 300 } } };
  };

  // ── 파일(스프레드시트) ──
  var SS = {
    getSheetByName: function (n) { for (var i = 0; i < WB.sheets.length; i++) if (WB.sheets[i].name === n) return WB.sheets[i]; return null; },
    getSheets: function () { return WB.sheets.slice(); },
    insertSheet: function (name, index) {
      if (SS.getSheetByName(name)) throw new Error("이름이 '" + name + "'인 시트가 이미 있습니다.");
      var at = index === undefined ? WB.sheets.length : Math.max(0, Math.min(WB.sheets.length, index));
      var sh = new Sheet({ sheetId: rid(), title: name, gridProperties: { rowCount: 1000, columnCount: 26 } });
      push({ addSheet: { properties: { sheetId: sh.id, title: name, index: at, gridProperties: { rowCount: 1000, columnCount: 26 } } } });
      WB.sheets.splice(at, 0, sh); WB.active = sh; return sh;
    },
    deleteSheet: function (sh) {
      if (WB.sheets.indexOf(sh) < 0) throw new Error("ID가 '" + (sh && sh.id) + "'인 시트가 존재하지 않습니다.");
      push({ deleteSheet: { sheetId: sh.id } });
      WB.sheets.splice(WB.sheets.indexOf(sh), 1); if (WB.active === sh) WB.active = WB.sheets[0];
    },
    setActiveSheet: function (sh) { if (sh) WB.active = sh; return sh; },
    getActiveSheet: function () { return WB.active || WB.sheets[0]; },
    // 시트 순서 바꾸기. Sheets API 는 '옮기기 전' 번호로 센다 → 뒤로 옮길 때는 하나 더
    moveActiveSheet: function (pos) {
      var sh = SS.getActiveSheet(), from = WB.sheets.indexOf(sh), to = Math.max(0, Math.min(WB.sheets.length - 1, pos - 1));
      if (from === to) return;
      push({ updateSheetProperties: { properties: { sheetId: sh.id, index: to > from ? to + 1 : to }, fields: 'index' } });
      WB.sheets.splice(from, 1); WB.sheets.splice(to, 0, sh);
    },
    toast: function (msg) { if (G.GS.onToast) G.GS.onToast(String(msg)); },
    getUrl: function () { return WB.id ? 'https://docs.google.com/spreadsheets/d/' + WB.id + '/edit' : ''; },
    getName: function () { return WB.title; },
  };

  // ── Apps Script 이름들 ──
  var ALERTS = [];
  G.SpreadsheetApp = {
    getActiveSpreadsheet: function () { return SS; },
    BandingTheme: { LIGHT_GREY: 'LIGHT_GREY' }, WrapStrategy: { WRAP: 'WRAP', OVERFLOW: 'OVERFLOW_CELL', CLIP: 'CLIP' }, BorderStyle: { SOLID: 'SOLID' }, ProtectionType: { SHEET: 'SHEET', RANGE: 'RANGE' },
    newDataValidation: function () { return new DV(); },
    newConditionalFormatRule: function () { return new CF(); },
    // 확인 창은 앱 화면에서 먼저 묻는다. 여기서는 '예'로 넘기고 안내 글만 모아 둔다
    getUi: function () { return { ButtonSet: { YES_NO: 1, OK: 0 }, Button: { YES: 'YES' }, alert: function () { var a = [].slice.call(arguments).filter(function (x) { return typeof x === 'string'; }); ALERTS.push(a.length > 1 ? a[1] : a[0]); return 'YES'; } }; },
  };
  G.Charts = { ChartType: { COLUMN: 'COLUMN', LINE: 'LINE', BAR: 'BAR' } };
  G.LockService = { getScriptLock: function () { return { waitLock: function () {}, tryLock: function () { return true; }, releaseLock: function () {} }; } };
  G.Session = { getScriptTimeZone: function () { return ''; } };
  var CACHE = {};
  G.CacheService = { getScriptCache: function () { return {
    get: function (k) { var e = CACHE[k]; return e && e.until > Date.now() ? e.v : null; },
    put: function (k, v, sec) { CACHE[k] = { v: String(v), until: Date.now() + (sec || 600) * 1000 }; },
    remove: function (k) { delete CACHE[k]; } }; } };
  G.PropertiesService = { getScriptProperties: function () { return {
    getProperty: function (k) { try { return localStorage.getItem('desk-prop-' + WB.id + '-' + k); } catch (e) { return null; } },
    setProperty: function (k, v) { try { localStorage.setItem('desk-prop-' + WB.id + '-' + k, v); } catch (e) {} } }; } };
  // 이 기기 시각으로 (Code.gs 는 'yyyy-MM-dd HH:mm' 꼴만 쓴다)
  G.Utilities = {
    formatDate: function (d, tz, f) {
      var p = function (n) { return ('0' + n).slice(-2); };
      return f.replace('yyyy', d.getFullYear()).replace('MM', p(d.getMonth() + 1)).replace('dd', p(d.getDate())).replace('HH', p(d.getHours())).replace('mm', p(d.getMinutes()));
    },
    getUuid: function () { return (G.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now(); },
  };
  G.ScriptApp = { getService: function () { return { getUrl: function () { return G.GS.appUrl || ''; } }; } };

  // ── 시트와 주고받기 ──
  async function api(url, opt) {
    var res = await BACKEND.fetch(url, opt || {});
    if (!res.ok) {
      var msg = ''; try { msg = (await res.json()).error.message; } catch (e) {}
      var err = new Error(msg || ('시트 연결 오류 ' + res.status)); err.status = res.status; throw err;
    }
    return res.json();
  }
  // 숫자는 숫자로(앱스 스크립트 getValues 와 같게 — '5,500원' 처럼 서식 붙은 글자로 받으면 합계가 0이 된다), 날짜 · 시각은 시트에 보이는 글자 그대로
  function fill(sh, values) { sh.rows = (values || []).map(function (r) { return r.map(function (v) { return blank(v) ? '' : v; }); }); }
  async function loadAll(id) {
    var meta = await api(API + id + '?fields=' + encodeURIComponent('properties.title,sheets(properties(sheetId,title,index,hidden,gridProperties(rowCount,columnCount)),conditionalFormats(ranges(sheetId)),bandedRanges(bandedRangeId),charts(chartId),protectedRanges(protectedRangeId))'));
    var sheets = meta.sheets.map(function (s) {
      var sh = new Sheet(s.properties);
      sh.cf = (s.conditionalFormats || []).length; sh.bands = (s.bandedRanges || []).map(function (b) { return b.bandedRangeId; }); sh.charts = (s.charts || []).map(function (c) { return c.chartId; }); sh.prot = (s.protectedRanges || []).map(function (x) { return x.protectedRangeId; });
      return sh;
    });
    var vals = sheets.length ? await api(API + id + '/values:batchGet?valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING&' + sheets.map(function (s) { return 'ranges=' + encodeURIComponent(q(s.name)); }).join('&')) : { valueRanges: [] };
    sheets.forEach(function (sh, i) { fill(sh, (vals.valueRanges[i] || {}).values); });
    var keepActive = WB && WB.id === id && WB.active ? WB.active.name : '';
    WB = { id: id, title: meta.properties.title, sheets: sheets, active: null, reqs: [], loadedAt: Date.now() };
    WB.active = SS.getSheetByName(keepActive) || sheets[0];
  }
  // 선생님이 시트에서 직접 고치는 탭만 다시 읽는다 (앱이 다 지우고 새로 그리는 탭 · 아주 긴 기록 탭은 건너뛴다)
  async function refresh(names) {
    if (!BACKEND || WB.reqs.length) return;
    var list = WB.sheets.filter(function (s) { return names.indexOf(s.name) >= 0; });
    if (!list.length) return;
    var vals = await api(API + WB.id + '/values:batchGet?valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING&' + list.map(function (s) { return 'ranges=' + encodeURIComponent(q(s.name)); }).join('&'));
    if (WB.reqs.length) return;   // 읽는 사이에 새로 바뀐 게 있으면 이번 것은 버린다
    list.forEach(function (sh, i) { fill(sh, (vals.valueRanges[i] || {}).values); });
  }
  async function flush() {
    if (!WB || !WB.reqs.length) return 0;
    var reqs = WB.reqs, np = NEWPROT; WB.reqs = []; NEWPROT = [];
    np.forEach(function (x) { x[1]._np = null; });
    if (!BACKEND) return reqs.length;   // 체험판: 메모리에만
    try {
      // ponytail: 끊긴 응답(보냈는지 모름)도 다시 보낸다. 값 쓰기는 같은 자리에 덮어써서 괜찮지만 줄 지우기가 두 번 될 수 있다 — 드물어서 그대로 둔다
      for (var i = 0; i < reqs.length; i += 4000) {
        var part = reqs.slice(i, i + 4000), res = await api(API + WB.id + ':batchUpdate', { method: 'POST', body: JSON.stringify({ requests: part }) });
        (res && res.replies || []).forEach(function (r, j) {   // 새로 건 보호의 번호를 기억해 두어야 다음에 풀 수 있다
          var hit = np.filter(function (x) { return x[0] === part[j]; })[0];
          if (hit && r && r.addProtectedRange) hit[1].prot.push(r.addProtectedRange.protectedRange.protectedRangeId);
        });
      }
    } catch (e) {
      if (!e.status || e.status === 429 || e.status >= 500 || e.status === 401) { WB.reqs = reqs.concat(WB.reqs); NEWPROT = np.concat(NEWPROT); np.forEach(function (x) { x[1]._np = x[0].addProtectedRange.protectedRange; }); }   // 다시 보낼 수 있는 실패
      throw e;
    }
    return reqs.length;
  }

  G.GS = {
    appUrl: '', onToast: null,
    useBackend: function (b) { BACKEND = b; },
    hasBackend: function () { return !!BACKEND; },
    open: loadAll,
    blank: function (id, title) { WB = { id: id || '', title: title || '우리반 바탕화면', sheets: [], active: null, reqs: [], loadedAt: Date.now() }; SS.insertSheet('시트1'); WB.reqs = []; },
    refresh: refresh, flush: flush,
    pending: function () { return WB ? WB.reqs.length : 0; },
    takePending: function () { var r = WB ? WB.reqs : []; if (WB) WB.reqs = []; return r; },
    putPending: function (r) { if (WB) WB.reqs = r.concat(WB.reqs); },
    info: function () { return WB ? { id: WB.id, title: WB.title, loadedAt: WB.loadedAt, sheets: WB.sheets.map(function (s) { return s.name; }) } : null; },
    alerts: function () { var a = ALERTS; ALERTS = []; return a; },
    api: api, API: API,
    _wb: function () { return WB; },
  };
})(window);
