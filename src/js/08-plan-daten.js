  // ---------- Plan
  // SWC: Farben für Tauschpaare im Kalender (beide Tage eines Tauschs gleich)
  var SWC = ['--g-kh', '--g-cardio', '--g-core', '--g-pull'];
  var GORDER = ['skill', 'pull', 'push', 'kh', 'core', 'cardio', 'mob'], GRANK = {}, EXI = {}, PCOL = ['--g-pull', '--g-push', '--g-core', '--g-kh', '--g-skill', '--g-cardio', '--g-mob'], WDN = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  GORDER.forEach(function (k, i) { GRANK[k] = i; });
  EX.forEach(function (e, i) { EXI[e.id] = i; });
  var PRESETS = [
    { n: 'Zug', c: 0, i: 'pull', f: ['pull'] }, { n: 'Druck', c: 1, i: 'push', f: ['push'] }, { n: 'Core', c: 2, i: 'core', f: ['core'] },
    { n: 'Hantel', c: 3, i: 'dumbbell', f: ['kh'] }, { n: 'Skills', c: 4, i: 'star', f: ['skill'] }, { n: 'Bike', c: 5, i: 'bike', f: ['cardio'] }, { n: 'Blackroll', c: 6, i: 'roll', f: ['mob'] },
    { n: 'Ganzkörper', c: 0, i: 'bolt', ids: ['chin', 'hang', 'push', 'plank', 'goblet', 'row', 'hollow'] }, { n: 'Eigener Tag', c: 1, i: 'target', f: [] }
  ];
  function sortIds(ids) {
    return ids.filter(function (id) { return EXB[id]; }).sort(function (x, y) { return GRANK[EXB[x].g] - GRANK[EXB[y].g] || EXI[x] - EXI[y]; });
  }
  function defaultPlan() {
    function ids(f) { return EX.filter(f).map(function (e) { return e.id; }); }
    return { days: [
      { id: 'p1', n: 'Zug', c: 0, i: 'pull', wd: [0, 3], ex: ids(function (e) { return dayOf(e) === 'a'; }) },
      { id: 'p2', n: 'Druck', c: 1, i: 'push', wd: [1, 4], ex: ids(function (e) { return dayOf(e) === 'b'; }) },
      { id: 'p3', n: 'Bike', c: 5, i: 'bike', wd: [5], ex: ids(function (e) { return e.g === 'cardio'; }) },
      { id: 'p4', n: 'Blackroll', c: 6, i: 'roll', wd: [2, 6], ex: ids(function (e) { return e.g === 'mob'; }) }
    ] };
  }
  var PV = 4, EV = 2, NEWX = ['expl', 'c2b', 'toes', 'vup', 'bicy', 'twist', 'bird', 'flut', 'dia', 'hindu', 'bulg', 'step', 'hipt', 'arnold', 'pullo', 'rrow', 'sumo', 'thr', 'wallw', 'hsfree', 'planl', 'tplan', 'blever', 'sfl', 'mun', 'mu', 'pistol', 'oap', 'burp', 'bikel', 'st_hip', 'st_ham', 'st_thor', 'st_door', 'st_child', 'st_90', 'st_wgs'];
  function plan() {
    if (!state.plan || (!state.plan.cu && state.plan.v !== PV)) { state.plan = defaultPlan(); state.plan.v = PV; state.plan.ev = EV; }
    var P = state.plan;
    if (!P.act || !P.act.length || !P.wp || !P.wp.length) {
      var m0 = {}; P.days.forEach(function (x) { m0[x.id] = x.wd.slice(); });
      P.wp = (P.wp || []).map(function (q, i) { return { id: q.id || 'w' + (i + 2), n: q.n, m: q.m }; });
      P.wp.unshift({ id: 'w1', n: 'Mein Plan', m: m0 }); P.act = [{ a: 0, p: 'w1' }]; setTimeout(persist, 0);
    }
    if ((P.ev | 0) < EV) {
      P.ev = EV;
      NEWX.forEach(function (id) {
        var e = EXB[id]; if (!e) return;
        var tid = e.g === 'cardio' ? 'p3' : e.g === 'mob' ? 'p4' : dayOf(e) === 'b' ? 'p2' : 'p1', day = P.days.filter(function (x) { return x.id === tid; })[0];
        if (day && day.ex.indexOf(id) < 0) day.ex.push(id);
      });
      setTimeout(persist, 0);
    }
    return P;
  }
  function pDay(id) { return plan().days.filter(function (x) { return x.id === id; })[0]; }
  var DAYI = ['pull', 'push', 'core', 'dumbbell', 'star', 'bike', 'roll', 'bolt', 'sun', 'target', 'peak', 'trophy'];
  function domGroup(x) {
    // Gruppe mit den meisten Übungen eines Trainingstags (für Icon und Startfilter im Editor)
    var cn = {}, best = null;
    if (x) x.ex.forEach(function (id) { var e = EXB[id]; if (!e) return; cn[e.g] = (cn[e.g] || 0) + 1; if (!best || cn[e.g] > cn[best]) best = e.g; });
    return best;
  }
  function dIcon(x) {
    // Icon eines Trainingstags: selbst gewählt, sonst das der Gruppe mit den meisten Übungen
    if (x.i && DAYI.indexOf(x.i) >= 0) return x.i;
    var best = domGroup(x);
    return best ? gOf(best).i : 'cal';
  }
  function wdOf(di) { return (di + 3) % 7; }
  var PCI = { pull: 0, push: 1, core: 2, kh: 3, skill: 4, cardio: 5, mob: 6 };
  function dayObj(id) {
    if (id.indexOf('g:') === 0) { var k = id.slice(2), g = gOf(k); return g ? { id: id, n: g.n, c: PCI[k], i: g.i, wd: [], ex: EX.filter(function (e) { return e.g === k; }).map(function (e) { return e.id; }) } : null; }
    return pDay(id);
  }
  function schedFor(di) {
    if (offAt(di)) return [];
    var o = plan().ov && plan().ov[di];
    if (o) return o.map(dayObj).filter(Boolean);
    return plan().days.filter(function (x) { return onDay(x, di); });
  }
  function dRp(x) { return [0, 2, 3].indexOf(x.rp) >= 0 ? x.rp : 1; }
  function dSt(x) { return isFinite(x.st) ? x.st : wkOf(dayIdx(Date.now())); }
  function onDay(x, di) {
    // Trainingstag an diesem Datum? Wochentag passt und die Woche liegt im Rhythmus
    if (wdAt(x, di).indexOf(wdOf(di)) < 0) return false;
    var rp = dRp(x), n = Math.round((wkOf(di) - dSt(x)) / 7);
    return rp === 1 || (rp === 0 ? n === 0 : ((n % rp) + rp) % rp === 0);
  }
  function offAt(di) {
    // Urlaub/Krank-Zeitraum an diesem Tag (plan.off: [{a, b, k: 'vac'|'sick'}])
    var o = (state.plan && state.plan.off) || [];
    for (var i = 0; i < o.length; i++) if (di >= o[i].a && di <= o[i].b) return { i: i, a: o[i].a, b: o[i].b, k: o[i].k };
    return null;
  }
  function offCount(a, b) { var n = 0; for (var x = a; x <= b; x++) if (offAt(x)) n++; return n; }
  function rpText(x) { var rp = dRp(x); return rp === 1 ? '' : rp ? 'alle ' + rp + ' Wo.' : 'einmalig'; }
  function nextDayText(today) {
    for (var i = 1; i <= 7; i++) { var f = schedFor(today + i)[0]; if (f) return WDN[wdOf(today + i)] + ' · ' + f.n; }
    return '';
  }
  var dsel = null;
  try { var dj = JSON.parse(localStorage.getItem('zenit.day')); if (dj && dj.d === dayIdx(Date.now()) && typeof dj.v === 'string') dsel = dj.v; } catch (err) { /* egal */ }
  function todaySel(today) {
    var days = plan().days;
    if (!days.length) return { key: 'all', set: null, days: [] };
    if (dsel === 'all') return { key: 'all', set: null, days: days };
    var one = dsel && pDay(dsel);
    var use = one ? [one] : schedFor(today);
    var set = {}; use.forEach(function (x) { x.ex.forEach(function (id) { set[id] = 1; }); });
    return { key: one ? one.id : use.length ? 'sched' : 'rest', set: set, days: use };
  }
  function swapHtml() {
    var today = dayIdx(Date.now()), cur = schedFor(today), curIds = cur.map(function (x) { return x.id; }), P = plan(), rep = ui.sm === 'rep' || !cur.length;
    var h = '<div class="grab"></div><div class="sh-h"><span class="gi">' + ic('swap') + '</span><div class="nm"><b>Heute ändern</b><small>' + (cur.length ? 'Geplant: ' + esc(cur.map(function (x) { return x.n; }).join(' + ')) : 'Heute frei') + '</small></div><button class="x" data-sheet-close aria-label="Schließen">' + ic('close') + '</button></div>';
    if (cur.length) h += '<div class="seg2" role="group"><button data-sm="swap" aria-pressed="' + !rep + '">' + ic('swap') + 'Tauschen</button><button data-sm="rep" aria-pressed="' + rep + '">' + ic('close') + 'Ersetzen</button></div><p class="sh-note">' + (rep ? 'Der geplante Tag fällt heute aus.' : 'Der andere Tag rückt auf den heutigen Platz.') + '</p>';
    h += '<div class="swl">' + P.days.filter(function (x) { return curIds.indexOf(x.id) < 0; }).map(function (x) { return '<button data-sw="' + x.id + '" style="--pc:var(' + PCOL[x.c] + ')"><i class="pdot"></i>' + esc(x.n) + '</button>'; }).join('') + '</div>';
    if (rep) h += '<div class="swg">' + GORDER.filter(function (k) { return curIds.indexOf('g:' + k) < 0; }).map(function (k) { var g = gOf(k); return '<button class="g' + k + '" data-sw="g:' + k + '">' + ic(g.i) + g.n + '</button>'; }).join('') + '<button data-sw="all">Alle</button></div>';
    if (P.ov && P.ov[today]) h += '<button class="btn ghost small" data-sw-reset="1">' + ic('undo') + 'Zurücksetzen</button>';
    return h;
  }
  function openSwap() {
    ui.sheet = { swap: true }; $('sheet').className = 'sheet'; $('sheet').innerHTML = swapHtml();
    $('shade').classList.add('open'); $('sheet').classList.add('open');
  }
  function applySwap(id) {
    var P = plan(), today = dayIdx(Date.now()), orig = schedFor(today).map(function (x) { return x.id; });
    P.ov = P.ov || {}; P.ovl = P.ovl || {};
    if (id === 'all') { delete P.ov[today]; dsel = 'all'; try { localStorage.setItem('zenit.day', JSON.stringify({ d: today, v: 'all' })); } catch (err) { /* egal */ } }
    else {
      if (ui.sm !== 'rep' && id.indexOf('g:') !== 0 && orig.length) {
        for (var i = 1; i <= 14; i++) {
          var eff = schedFor(today + i).map(function (x) { return x.id; });
          if (eff.indexOf(id) >= 0) { P.ov[today + i] = eff.filter(function (x) { return x !== id; }).concat(orig); P.ovl[today] = today + i; break; }
        }
      }
      P.ov[today] = [id]; dsel = null; try { localStorage.removeItem('zenit.day'); } catch (err) { /* egal */ }
    }
    ui.pg = 'all'; ui.fresh = false; persist(); closeSheet(true); render(); toast('Heute: ' + (id === 'all' ? 'Alle' : dayObj(id).n), 'check');
  }
  function resetSwap() {
    var P = plan(), today = dayIdx(Date.now());
    if (P.ovl && P.ovl[today]) { delete P.ov[P.ovl[today]]; delete P.ovl[today]; }
    delete P.ov[today]; dsel = null; try { localStorage.removeItem('zenit.day'); } catch (err) { /* egal */ }
    ui.pg = 'all'; persist(); closeSheet(true); render();
  }
  function sessToday(today) {
    var t = 0; state.logs.forEach(function (l) { if (l.e === 'sess' && dayIdx(l.t) === today) t += l.s[0]; }); return t;
  }
  function reqLine(q, d) {
    var re = EXB[q[0]], cur = d.best[q[0]] || 0;
    return { name: re.n, cur: cur, need: q[1], u: re.u, ok: cur >= q[1], pct: Math.min(100, Math.round(100 * cur / q[1])) };
  }
  function card(e, d, today, idx) {
    var tl = todayLog(e.id, today), last = lastBefore(e.id, today), s = tl ? tl.s : [], t = exTier(d, e);
    var done = s.length >= e.sets && s.slice(0, e.sets).every(function (x) { return x >= e.goal; });
    var xpT = s.reduce(function (a, x, i) { return a + setXp(e, x, i); }, 0) + (done ? 10 : 0), xpP = planXp(e);
    var pills = '';
    for (var i = 0; i < e.sets; i++) pills += pill(e, i, s, tl);
    for (var j = e.sets; j < s.length; j++) pills += pill(e, j, s, tl);
    if (s.length >= e.sets && s.length < 8) pills += '<button class="pill add" data-pill="' + e.id + ':' + s.length + '" aria-label="Zusatzsatz"><b>+</b><small>extra</small></button>';
    var coll = done && !ui.xo[e.id], sub = done ? s.join('·') + (tl && tl.k ? ' · ' + tl.k + ' kg' : '') : goalText(e) + (last ? ' · zuletzt ' + last.s.join('·') + (function () { var q = progFor(e, today); return q ? ' → ' + (q.kg ? q.kg + ' kg' : q.txt && q.up ? q.txt : q.t) : ''; })() : '');
    return '<article class="ex t' + t + ' g' + e.g + (done ? ' complete' : '') + (coll ? ' collapsed' : '') + ' rise" style="--i:' + idx + '"><div class="ex-h"' + (done ? ' data-xt="' + e.id + '"' : '') + '><span class="gi">' + ic(gOf(e.g).i) + '</span><div class="nm"><b>' + esc(e.n) + (done ? ic('check') : '') + '</b><small>' + esc(sub) + '</small></div>' +
      '' + (e.u === 'Sek.' ? '<button class="tmbtn" data-timer="' + e.id + '" aria-label="Stoppuhr">' + ic('play') + '</button>' : '') + '<div class="cnt"><b>' + Math.min(s.length, e.sets) + '<i>/' + e.sets + '</i></b><span class="xpd">' + (done ? '+' + xpT + ' XP' : xpT ? '+' + xpT + ' / ' + xpP : '+' + xpP + ' XP') + '</span></div></div>' + (coll ? '' : '<div class="pills">' + pills + '</div>') + '</article>';
  }
  var pg0 = null;
  function progFor(e, today) {
    var last = lastBefore(e.id, today); if (!last || !last.s.length) return null;
    var st = e.u === 'Sek.' ? 5 : 1, ss = last.s.slice(0, e.mode === 'all' ? e.sets : last.s.length), mn = Math.min.apply(null, ss), mx = Math.max.apply(null, last.s), r;
    if (e.mode === 'all') {
      if (ss.length >= e.sets && mn >= e.goal) {
        if (e.kg) r = (+last.k || 0) < 15 ? { t: e.goal, kg: Math.round(((+last.k || 0) + 2.5) * 10) / 10, txt: '+2,5 kg' } : { t: e.goal, txt: 'langsamer' };
        else r = { t: e.goal, txt: 'Ziel halten' };
        r.up = 1;
      } else r = { t: Math.min(e.goal, Math.max(mn, ss.length < e.sets ? mn : mn) + st), txt: '' };
    } else r = { t: mx >= e.goal ? mx + st : Math.min(e.goal, mx + st), txt: mx >= e.goal ? 'Rekord' : '' };
    return r;
  }
  function pill(e, i, s, tl) {
    var has = s[i] !== undefined, key = e.id + ':' + i;
    if (!has) {
      var nxt = i === s.length;
      return '<button class="pill ' + (nxt ? 'next' : '') + '" data-pill="' + key + '" aria-label="Satz ' + (i + 1) + '"' + pv('pf-' + key, 0) + '><b>' + (nxt ? ic('plus') : '–') + '</b><small>' + ((pg0 = progFor(e, dayIdx(Date.now()))) && pg0.t !== e.goal && e.mode === 'all' ? '<em>' + pg0.t + '</em>' : e.goal) + '</small></button>';
    }
    var r = s[i], f = Math.min(r / e.goal, 1), cls = 'done' + (r >= e.goal ? ' over' : '');
    return '<button class="pill ' + cls + '" data-pill="' + key + '" aria-label="Satz ' + (i + 1) + ': ' + r + '"' + pv('pf-' + key, Math.max(f, 0.14)) + '><b>' + r + '</b><small>' + e.goal + '</small></button>';
  }

