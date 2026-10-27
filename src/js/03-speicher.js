  // ---------- Zustand und Speicher
  var DEMO = false; try { DEMO = localStorage.getItem('zenit.mode') === 'demo'; } catch (e) { /* egal */ }
  var KEY = DEMO ? 'stufenbuch.demo' : 'stufenbuch.v1';
  var state = { logs: [], u: 0, plan: null, food: null };
  var ui = { tab: 'heute', scroll: null, mo: 0, undo: null, rest: null, sel: null, seg: 'ov', range: '30', met: 'sets', gf: 'all', bk: null, xr: 'all', xm: 'best', pt: null, hd: null, del: null, io: '', sheet: null, fresh: true, sm: 'swap', fd: null, rm: 0, wr: '90', sw: 0, fdrawn: false, pfd: null, fq: '', fcat: '', fpick: null, ftiles: null, ftok: null, cpr: null, gmode: 'a', nts: [], pd: null, pfl: null, ca: null, cm: false, cdir: 0, cmx: false, pdx: false, pman: false, pdo: {}, plk: null, pmode: null, draft: null, psel: null, pnt: null, pdisc: 0, pwe: null, pact: null, pnoclick: 0, dd: null, xo: {}, gx: {}, pg: 'all', pe: null, pnew: false, pf: 'all', pq: '', pdel: 0, fstk: {} };
  var store = 'local', sync = '', ref = null, timer = null, writing = false, dirty = false;

  var EQUIP = [['bar', 'Klimmzugstange'], ['board', 'Push-up-Board'], ['db', 'Kurzhanteln'], ['mat', 'Matte'], ['roll', 'Blackroll'], ['ball', 'Faszienball'], ['bike', 'Homebike'], ['band', 'Widerstandsband']];
  function cleanFood(f) {
    if (!f || !Array.isArray(f.e)) return null;
    function nv(v, mx) { return Math.max(0, Math.min(mx, Math.round((+v || 0) * 10) / 10)); }
    var NX = ['f', 'c', 'fb', 'su'], g = f.g && f.g.a ? { a: 1 } : f.g && isFinite(f.g.k) && isFinite(f.g.p) && f.g.k > 0 && f.g.p > 0 ? { k: Math.round(f.g.k), p: Math.round(f.g.p) } : null;
    if (g && !g.a) NX.forEach(function (k) { if (+f.g[k] > 0) g[k] = Math.round(f.g[k]); });
    var e = f.e.filter(function (x) { return x && isFinite(x.t) && isFinite(x.k) && isFinite(x.p) && x.k >= 0 && x.p >= 0 && x.k <= 20000 && x.p <= 1000; }).map(function (x) {
      var o = { t: x.t, n: String(x.n || '').slice(0, 30), k: Math.round(x.k), p: nv(x.p, 1000) };
      NX.forEach(function (k) { if (x[k] != null && isFinite(x[k])) o[k] = nv(x[k], 2000); });
      if (x.r && typeof x.r.i === 'string' && isFinite(x.r.g) && x.r.g > 0) o.r = { i: x.r.i.slice(0, 24), g: nv(x.r.g, 5000) };
      if (/^(fr|mi|sn|ab)$/.test(x.mk)) o.mk = x.mk;
      return o;
    });
    var o = (Array.isArray(f.o) ? f.o : []).filter(function (x) { return x && typeof x.id === 'string' && /^u/.test(x.id) && typeof x.n === 'string'; }).slice(0, 600).map(function (x) {
      var r = { id: x.id.slice(0, 24), n: x.n.slice(0, 30), k: nv(x.k, 1000), p: nv(x.p, 100), f: nv(x.f, 100), c: nv(x.c, 100), fb: nv(x.fb, 100), su: nv(x.su, 100), u: [] };
      if (Array.isArray(x.u)) x.u.slice(0, 4).forEach(function (q) { if (Array.isArray(q) && typeof q[0] === 'string' && +q[1] > 0) r.u.push([q[0].slice(0, 12), nv(q[1], 5000)]); });
      if (typeof x.b === 'string' && x.b) r.b = x.b.slice(0, 24);
      if (typeof x.bc === 'string' && /^\d{6,14}$/.test(x.bc)) r.bc = x.bc;
      if (x.ml) r.ml = 1;
      return r;
    });
    var d = (Array.isArray(f.d) ? f.d : []).filter(function (x) { return x && typeof x.id === 'string' && typeof x.n === 'string' && Array.isArray(x.ing); }).slice(0, 60).map(function (x) {
      return { id: x.id, n: x.n.slice(0, 30), por: Math.max(1, Math.min(50, +x.por || 1)), ing: x.ing.slice(0, 40).map(function (q) { var r = { n: String(q.n || '').slice(0, 30), a: Math.max(0, +q.a || 0), k: Math.max(0, +q.k || 0), p: Math.max(0, +q.p || 0) }; NX.forEach(function (k) { if (q[k] != null && isFinite(q[k])) r[k] = nv(q[k], 1000); }); if (typeof q.i === 'string') r.i = q.i.slice(0, 24); return r; }),
        // m: fest gewählte Mahlzeiten (fehlt = automatisch)
        m: Array.isArray(x.m) ? x.m.filter(function (k) { return /^(fr|mi|sn|ab)$/.test(k); }).slice(0, 4) : undefined };
    });
    var w = (Array.isArray(f.w) ? f.w : []).filter(function (x) { return x && isFinite(x.t) && isFinite(x.kg) && x.kg >= 20 && x.kg <= 400; }).slice(-1500).map(function (x) { return { t: x.t, kg: Math.round(x.kg * 10) / 10 }; }).sort(function (a, b) { return a.t - b.t; });
    var EQK = EQUIP.map(function (x) { return x[0]; });
    var q = f.pr && typeof f.pr === 'object' ? { h: Math.max(120, Math.min(230, +f.pr.h || 0)) || 0, a: Math.max(14, Math.min(100, +f.pr.a || 0)) || 0, s: f.pr.s === 'f' ? 'f' : 'm', act: [1.2, 1.375, 1.55, 1.725].indexOf(+f.pr.act) >= 0 ? +f.pr.act : 1.375, go: ['bulk', 'keep', 'cut'].indexOf(f.pr.go) >= 0 ? f.pr.go : 'bulk',
      tw: Math.max(0, Math.min(300, Math.round((+f.pr.tw || 0) * 10) / 10)), ex: ['new', 'mid', 'adv'].indexOf(f.pr.ex) >= 0 ? f.pr.ex : '', inj: String(f.pr.inj || '').slice(0, 160), eq: Array.isArray(f.pr.eq) ? f.pr.eq.filter(function (k) { return EQK.indexOf(k) >= 0; }) : null } : null;
    // Rechner: Alltagsfaktor, Tempo kg/Woche, Protein g/kg, Fett %, Trainingszuschlag an/aus, Korrektur aus dem Verlauf
    if (q) [['pal', 1.1, 2.2], ['rt', -1, 1], ['pkg', 1, 3.5], ['fp', 10, 50], ['adj', -1500, 1500]].forEach(function (r) { var v = +f.pr[r[0]]; if (f.pr[r[0]] != null && isFinite(v)) q[r[0]] = Math.max(r[1], Math.min(r[2], Math.round(v * 100) / 100)); });
    if (q && (f.pr.tb === 0 || f.pr.tb === 1)) q.tb = f.pr.tb;
    function mv(v) { return Math.max(0, Math.min(250, Math.round((+v || 0) * 10) / 10)); }
    var m = (Array.isArray(f.m) ? f.m : []).filter(function (x) { return x && isFinite(x.t); }).slice(-400).map(function (x) { return { t: x.t, w: mv(x.w), c: mv(x.c), a: mv(x.a), th: mv(x.th), sh: mv(x.sh) }; });
    // Wasser: {Tagesindex: ml}
    var wa = {}; if (f.wa && typeof f.wa === 'object') Object.keys(f.wa).forEach(function (k) { var v = +f.wa[k]; if (/^\d+$/.test(k) && v > 0) wa[k] = Math.min(8000, Math.round(v)); });
    return { g: g, e: e, d: d, w: w, pr: q, m: m, o: o, wa: wa };
  }
  function cleanPlan(p) {
    if (!p || !Array.isArray(p.days)) return null;
    var days = p.days.filter(function (x) { return x && typeof x.id === 'string' && typeof x.n === 'string' && Array.isArray(x.wd) && Array.isArray(x.ex); }).slice(0, 8).map(function (x) {
      var o = { id: x.id, n: x.n.slice(0, 18), c: Math.max(0, Math.min(6, x.c | 0)), wd: x.wd.filter(function (w) { return w >= 0 && w <= 6; }).filter(function (w, i, a) { return a.indexOf(w) === i; }), ex: x.ex.filter(function (id) { return EXB[id]; }).filter(function (w, i, a) { return a.indexOf(w) === i; }) };
      if (DAYI.indexOf(x.i) >= 0) o.i = x.i;
      if ([0, 2, 3].indexOf(x.rp) >= 0) { o.rp = x.rp; o.st = isFinite(x.st) ? Math.round(x.st) : wkOf(dayIdx(Date.now())); }
      return o;
    });
    var ov = {}, ovl = {}, lim = dayIdx(Date.now()) - 3;
    if (p.ov && typeof p.ov === 'object') Object.keys(p.ov).forEach(function (k) { if (+k >= lim && Array.isArray(p.ov[k])) ov[k] = p.ov[k].filter(function (x) { return typeof x === 'string'; }); });
    if (p.ovl && typeof p.ovl === 'object') Object.keys(p.ovl).forEach(function (k) { if (+k >= lim && isFinite(p.ovl[k])) ovl[k] = +p.ovl[k]; });
    var off = (Array.isArray(p.off) ? p.off : []).filter(function (o) { return o && isFinite(o.a) && isFinite(o.b) && o.b >= o.a && o.b - o.a < 120 && (o.k === 'vac' || o.k === 'sick'); }).slice(-60).map(function (o) { return { a: Math.round(o.a), b: Math.round(o.b), k: o.k }; });
    var wp = (Array.isArray(p.wp) ? p.wp : []).filter(function (q) { return q && typeof q.n === 'string' && q.m && typeof q.m === 'object'; }).slice(0, 12).map(function (q, i) {
      var m = {}; Object.keys(q.m).forEach(function (k) { if (Array.isArray(q.m[k])) m[k] = q.m[k].filter(function (w) { return w >= 0 && w <= 6; }); });
      return { id: typeof q.id === 'string' ? q.id.slice(0, 20) : 'w' + (i + 2), n: q.n.slice(0, 18), m: m };
    });
    var act = (Array.isArray(p.act) ? p.act : []).filter(function (x) { return x && isFinite(x.a) && typeof x.p === 'string'; }).slice(-100).map(function (x) { return { a: Math.round(x.a), p: x.p }; });
    var ovk = {}, ids = function (x) { return Array.isArray(x) ? x.filter(function (y) { return typeof y === 'string'; }) : undefined; };
    if (p.ovk && typeof p.ovk === 'object') Object.keys(p.ovk).forEach(function (k) {
      var o = p.ovk[k]; if (!ov[k] || !o || typeof o !== 'object') return;
      var f = {}; if (o.s) f.s = 1; if (isFinite(o.w) && ids(o.b)) { f.w = +o.w; f.b = ids(o.b); } if (ids(o.r)) f.r = ids(o.r); if (ids(o.a)) f.a = ids(o.a); ovk[k] = f;
    });
    return { days: days, v: p.v | 0, ev: p.ev | 0, cu: !!p.cu, ov: ov, ovl: ovl, off: off, wp: wp, act: act, ovk: ovk };
  }
  function clean(arr) {
    if (!Array.isArray(arr)) return [];
    return arr.filter(function (l) {
      return l && (EXB[l.e] || l.e === 'warm' || l.e === 'sess') && isFinite(l.t) && Array.isArray(l.s) && l.s.length > 0 && l.s.length <= 8 &&
        l.s.every(function (x) { return typeof x === 'number' && isFinite(x) && x >= 0; });
    }).map(function (l) {
      var o = { t: l.t, e: l.e, s: l.s.slice() };
      if (typeof l.k === 'number' && isFinite(l.k) && l.k > 0) o.k = l.k;
      return o;
    });
  }

