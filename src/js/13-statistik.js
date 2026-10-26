  // ---------- Statistik im Profil: Kachel-Dashboard je Bereich (Zeitraum 7/30/90), Antippen einer Kachel zeigt oben die große Ansicht
  function dSeries(n, f) { var t = dayIdx(Date.now()), a = []; for (var i = n - 1; i >= 0; i--) a.push(f(t - i)); return a; }
  function sumA(a) { return a.reduce(function (x, y) { return x + (y || 0); }, 0); }
  function avgA(a) { var v = a.filter(function (x) { return x; }); return v.length ? sumA(v) / v.length : 0; }
  // Liniendiagramm (spitz, je Tag ein Punkt). Antippen oder Ziehen über das Diagramm zeigt den Tag – ohne neu zu zeichnen, damit das Ziehen nicht abreißt
  var LCD = {}, lcId = null;
  function lineChart(id, n, ser, shared) {
    var W = 360, H = 130, T = 14, B = 18, t0 = dayIdx(Date.now()) - n + 1, all = [], s = '', ys = [], one = shared || ser.length === 1;
    function X(i) { return n === 1 ? W / 2 : 8 + (W - 16) * i / (n - 1); }
    ser.forEach(function (q) { q.v.forEach(function (x) { if (x != null) all.push(x); }); if (q.goal) all.push(q.goal); });
    var grid = null;
    ser.forEach(function (q, k) {
      var vs = shared ? all : q.v.filter(function (x) { return x != null; }).concat(q.goal ? [q.goal] : []);
      var mx = Math.max.apply(null, vs.concat([q.min0 === false ? -1e9 : 0])), mn = q.min0 === false ? Math.min.apply(null, vs) : 0;
      if (!(mx > mn)) mx = mn + 1; var pad = (mx - mn) * 0.08;
      function Y(v) { return T + (H - T - B) * (1 - (v - mn + pad) / (mx - mn + 2 * pad)); }
      if (k === 0) grid = { mn: mn, mx: mx, Y: Y };
      var pts = [], yy = q.v.map(function (x, i) { if (x == null) return null; var y = Y(x); pts.push([X(i), y]); return y; });
      ys.push(yy);
      if (q.goal) s += '<line class="lgl" x1="0" x2="' + W + '" y1="' + Y(q.goal).toFixed(1) + '" y2="' + Y(q.goal).toFixed(1) + '"/><text class="lgt" x="' + (W - 4) + '" y="' + (Y(q.goal) - 4).toFixed(1) + '" text-anchor="end">Ziel ' + (q.goal % 1 ? fN(q.goal) : q.goal) + '</text>';
      if (!pts.length) return;
      var d = 'M' + pts.map(function (q2) { return q2[0].toFixed(1) + ',' + q2[1].toFixed(1); }).join('L');
      if (q.area) s += '<path class="lar" data-k="' + k + '" d="' + d + 'L' + pts[pts.length - 1][0].toFixed(1) + ',' + (H - B) + 'L' + pts[0][0].toFixed(1) + ',' + (H - B) + 'Z" style="fill:' + q.c + '"/>';
      s += '<path class="lln' + (q.dash ? ' ds' : '') + '" data-k="' + k + '" d="' + d + '" style="stroke:' + q.c + '"/>';
      var lp = pts[pts.length - 1], lv = null; for (var li = q.v.length - 1; li >= 0; li--) if (q.v[li] != null) { lv = q.v[li]; break; }
      if (!q.dash) s += '<text class="lev" data-k="' + k + '" x="' + Math.min(W - 4, lp[0] + 2).toFixed(1) + '" y="' + (lp[1] - 7).toFixed(1) + '" text-anchor="end" style="fill:' + q.c + '">' + (lv % 1 ? fN(lv) : lv) + '</text>';
    });
    // Wertlinien (0, Mitte, oben) mit Zahlen der ersten Kurve
    if (grid) [0, 0.5, 1].forEach(function (f) { var v = grid.mn + (grid.mx - grid.mn) * f, y = grid.Y(v); s = '<line class="lgr" x1="0" x2="' + W + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '"/><text class="lgx" x="2" y="' + (y - 3).toFixed(1) + '">' + (v % 1 && grid.mx - grid.mn < 10 ? fN(Math.round(v * 10) / 10) : Math.round(v)) + '</text>' + s; });
    // Takt im Hintergrund: Wochenanfänge (ab 14 Tagen) bzw. Monatsanfänge (ab 120 Tagen), damit man Zeiträume ohne Antippen abschätzen kann
    if (n >= 14) for (var wi = 1; wi < n; wi++) { var wq = new Date((t0 + wi) * 864e5); if (n >= 120 ? wq.getUTCDate() === 1 : wq.getUTCDay() === 1) s = '<line class="lwk" x1="' + X(wi).toFixed(1) + '" x2="' + X(wi).toFixed(1) + '" y1="' + T + '" y2="' + (H - B) + '"/>' + s; }
    s += '<g class="lmk" id="lmk-' + id + '"><line class="lsl" x1="0" x2="0" y1="' + T + '" y2="' + (H - B) + '"/>' + ser.map(function (q) { return '<circle class="ldt" r="4.5" cx="-20" cy="-20" style="fill:' + q.c + '"/>'; }).join('') + '</g>';
    s += '<text x="8" y="' + (H - 4) + '">' + fmtShort(t0) + '</text><text x="' + (W - 8) + '" y="' + (H - 4) + '" text-anchor="end">heute</text>';
    LCD[id] = { n: n, t0: t0, x: dSeries(n, function () { return 0; }).map(function (z, i) { return X(i); }), ys: ys, ser: ser };
    function lastV(q) { for (var k = q.v.length - 1; k >= 0; k--) if (q.v[k] != null) return q.v[k]; return null; }
    var lg = ser.map(function (q, k) { return '<button data-lcf="' + id + ':' + k + '" aria-pressed="false"><i style="background:' + q.c + '"></i>' + q.n + '<b id="lv-' + id + '-' + k + '">' + lcFmt(lastV(q), q) + '</b></button>'; }).join('');
    return '<div class="lcc" data-noswipe="1"><div class="lch">' + lg + '<em id="ld-' + id + '">zuletzt</em></div><svg class="lcs" data-lcid="' + id + '" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img" aria-label="Verlauf">' + s + '</svg></div>';
  }
  function lcFmt(v, q) { return v == null ? '–' : (v % 1 ? fN(v) : v) + (q.u || ''); }
  function lcPick(id, i) {
    var c = LCD[id], g = $('lmk-' + id); if (!c || !g) return;
    i = Math.max(0, Math.min(c.n - 1, i)); if (c.sel === i) return; c.sel = i;
    g.classList.add('on'); var x = c.x[i].toFixed(1), ln = g.querySelector('line'); ln.setAttribute('x1', x); ln.setAttribute('x2', x);
    g.querySelectorAll('circle').forEach(function (ci, k) { var y = c.ys[k][i]; ci.setAttribute('cx', y == null ? -20 : x); ci.setAttribute('cy', y == null ? -20 : y.toFixed(1)); });
    c.ser.forEach(function (q, k) { var b = $('lv-' + id + '-' + k); if (b) b.textContent = lcFmt(q.v[i], q); });
    var dl = $('ld-' + id); if (dl) dl.textContent = fmtDayL(c.t0 + i); buzz(3);
  }
  function lcAt(ev) { var sv = document.querySelector('[data-lcid="' + lcId + '"]'), c = LCD[lcId]; if (!sv || !c) return; var r = sv.getBoundingClientRect(); lcPick(lcId, Math.round((ev.clientX - r.left) / r.width * (c.n - 1))); }
  document.addEventListener('pointerdown', function (ev) { var sv = ev.target.closest && ev.target.closest('.lcs'); if (!sv) return; lcId = sv.dataset.lcid; lcAt(ev); });
  document.addEventListener('pointermove', function (ev) { if (lcId) lcAt(ev); });
  document.addEventListener('pointerup', function () { lcId = null; });
  document.addEventListener('pointercancel', function () { lcId = null; });
  function kpis(a) { return '<div class="kpi rise" style="--i:2">' + a.map(function (x) { return '<div><b>' + x[0] + '</b><span>' + x[1] + '</span></div>'; }).join('') + '</div>'; }
  function statPage(d, now) {
    // Statistik eines Bereichs auf einer Seite: Zeitraum, 3 Kennzahlen, Kurven (zusammengehörige teilen sich ein Diagramm), kompakte Listen
    var n = +(ui.srng || 30), today = dayIdx(now), st = foodState(), pr = st.pr || {}, i = 3;
    function card(t, x) { return '<section class="scd rise" style="--i:' + (i++) + '"><h3>' + t + '</h3>' + x + '</section>'; }
    var h = '<div class="seg three srng rise" style="--i:1">' + [7, 30, 90].map(function (r) { return '<button data-srng="' + r + '" aria-pressed="' + (n === r) + '">' + r + ' Tage</button>'; }).join('') + '</div>';
    if (ui.pstat === 'tr') {
      var sets = dSeries(n, function (di) { var x = d.byDay[di]; return x ? x.sets || 0 : 0; }), xp = dSeries(n, function (di) { var x = d.byDay[di]; return x ? x.all || 0 : 0; }), ss = streakInfo(now), gs = {};
      d.days.forEach(function (x) { if (x.d > today - n) Object.keys(x.g).forEach(function (k) { gs[k] = (gs[k] || 0) + x.g[k]; }); });
      h += kpis([[sets.filter(Boolean).length + '<small>/' + n + '</small>', 'Tage aktiv'], [Math.round(avgA(sets)), 'Ø Sätze'], [ss.n + '<small>/' + d.longest + '</small>', 'Serie / Rekord']]);
      h += card('Sätze und XP', lineChart('tr', n, [{ n: 'Sätze', v: sets, c: 'var(--ac)', area: 1 }, { n: 'XP', v: xp, c: 'var(--gold)', dash: 1 }]));
      var mx = Math.max.apply(null, Object.keys(gs).map(function (k) { return gs[k]; }).concat([1]));
      if (Object.keys(gs).length) h += card('Gruppen', '<div class="sgrp">' + GORDER.filter(function (k) { return gs[k]; }).sort(function (a, b) { return gs[b] - gs[a]; }).map(function (k) { return '<div><span>' + ic(gOf(k).i) + gOf(k).n + '</span><i><i style="--p:' + (gs[k] / mx).toFixed(3) + '"></i></i><b>' + gs[k] + '</b></div>'; }).join('') + '</div>');
      // Übungen: eine Zeile je Übung (zuletzt trainierte zuerst), Mini-Kurve der Bestwerte, Trend im Zeitraum
      var ex = EX.map(function (e) { return { e: e, ss: sessions(e).filter(function (o) { return o.d > today - n; }) }; }).filter(function (o) { return o.ss.length; }).sort(function (a, b) { return b.ss[b.ss.length - 1].d - a.ss[a.ss.length - 1].d; });
      var show = ui.sall ? ex : ex.slice(0, 6);
      if (ex.length) h += card('Übungen<small>' + ex.length + '</small>', '<div class="sexl">' + show.map(function (o) {
        var v = o.ss.map(function (q) { return q.v; }), a = v[0], b = v[v.length - 1];
        return '<button class="sex" data-open="' + o.e.id + '"><b>' + esc(o.e.n) + '</b>' + mspk(v, 1) + '<span>' + b + ' ' + esc(o.e.u) + '</span><em class="' + (b > a ? 'up' : b < a ? 'dn' : '') + '">' + (b > a ? '▲' : b < a ? '▼' : '·') + '</em></button>';
      }).join('') + '</div>' + (ex.length > 6 ? '<button class="btn small sexm" data-sall="1">' + (ui.sall ? 'Weniger' : 'Alle ' + ex.length + ' anzeigen') + '</button>' : ''));
      return h;
    }
    if (ui.pstat === 'kp') {
      var lw = lastW(), wd = dSeries(n, function (di) { var r = null; st.w.forEach(function (q) { if (dayIdx(q.t) === di) r = q.kg; }); return r; }), wv = wd.filter(function (x) { return x != null; });
      h += kpis([[lw ? fN(lw.kg) + '<small> kg</small>' : '–', 'Aktuell'], [wv.length > 1 ? (wv[wv.length - 1] - wv[0] >= 0 ? '+' : '−') + fN(Math.abs(wv[wv.length - 1] - wv[0])) + '<small> kg</small>' : '–', 'Im Zeitraum'], [pr.tw && lw ? fN(Math.abs(lw.kg - pr.tw)) + '<small> kg</small>' : '–', pr.tw ? 'bis Ziel ' + fN(pr.tw) : 'kein Zielgewicht']]);
      h += card('Gewicht', wv.length ? lineChart('kg', n, [{ n: 'Gewicht', v: wd, c: 'var(--ac)', u: ' kg', min0: false, goal: pr.tw || 0 }]) : '<p class="muted">Keine Messung im Zeitraum.</p>');
      var MC = ['#e0a24a', '#5b8fd6', '#a374d8', 'var(--ac)', '#e0533d'], ms = MEAS.map(function (m, k) { return { n: m[1], u: ' cm', c: MC[k], min0: false, v: dSeries(Math.max(n, 90), function (di) { var r = null; st.m.forEach(function (q) { if (q[m[0]] && dayIdx(q.t) === di) r = q[m[0]]; }); return r; }) }; }).filter(function (q) { return q.v.some(function (x) { return x != null; }); });
      if (ms.length) h += card('Maße<small>' + Math.max(n, 90) + ' Tage</small>', lineChart('ms', Math.max(n, 90), ms, true));
      h += '<button class="btn small sexm rise" data-kmon="1">' + ic('cal') + (ui.kmon ? 'Monatsrückblick ausblenden' : 'Monatsrückblick') + '</button>' + (ui.kmon ? viewBody(d, now) : '');
      return h;
    }
    var kc = [], gk = [], pp = [], gp = [], fat = [], su = [], wa = [], inz = 0;
    dSeries(n, function (di) { var fs = foodSum(di), g = foodGoal(di), on = fs.items.length > 0; kc.push(on ? fs.k : null); gk.push(g.k); pp.push(on ? fs.p : null); gp.push(g.p); fat.push(on ? Math.round(fs.f) : null); su.push(on ? Math.round(fs.su) : null); wa.push(st.wa[di] ? st.wa[di] / 1000 : null); if (on && fs.k >= g.k * 0.9 && fs.k <= g.k * 1.1) inz++; return 0; });
    h += kpis([[inz + '<small>/' + n + '</small>', 'Tage im Ziel'], [Math.round(avgA(kc)) + '<small> kcal</small>', 'Ø Kalorien'], [Math.round(avgA(pp)) + '<small> g</small>', 'Ø Protein']]);
    h += card('Kalorien', lineChart('kc', n, [{ n: 'kcal', v: kc, c: 'var(--g-push)', area: 1 }, { n: 'Ziel', v: gk, c: 'var(--gold)', dash: 1 }], true));
    h += card('Protein', lineChart('pp', n, [{ n: 'Protein', v: pp, c: 'var(--ac)', u: ' g', area: 1 }, { n: 'Ziel', v: gp, c: 'var(--gold)', u: ' g', dash: 1 }], true));
    h += card('Fett und Zucker', lineChart('fs', n, [{ n: 'Fett', v: fat, c: 'var(--g-mob)', u: ' g' }, { n: 'Zucker', v: su, c: 'var(--danger)', u: ' g' }], true));
    if (wa.some(function (x) { return x != null; })) h += card('Wasser', lineChart('wa', n, [{ n: 'Wasser', v: wa, c: '#6f9fbf', u: ' l', area: 1 }]));
    return h;
  }
  function mspk(vals, line) {
    // Mini-Diagramm: Balken (Training, Ernährung) oder Linie (Gewicht)
    if (!vals.length) return '';
    var mx = Math.max.apply(null, vals.concat([line ? -1e9 : 1])), mn = line ? Math.min.apply(null, vals) : 0, rg = (mx - mn) || 1, bw = 100 / vals.length;
    if (line) return '<svg class="msk ln" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><polyline points="' + vals.map(function (v, k) { return (vals.length === 1 ? 50 : k * 100 / (vals.length - 1)).toFixed(1) + ',' + (27 - (v - mn) / rg * 24).toFixed(1); }).join(' ') + '"/></svg>';
    return '<svg class="msk" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">' + vals.map(function (v, k) { var hh = v ? Math.max(2, v / mx * 30) : 0.8; return '<rect x="' + (k * bw + bw * 0.15).toFixed(1) + '" y="' + (30 - hh).toFixed(1) + '" width="' + (bw * 0.7).toFixed(1) + '" height="' + hh.toFixed(1) + '" rx="1"/>'; }).join('') + '</svg>';
  }
  function pbList() {
    // Rekorde: jeder neue Bestwert (vollständige Einheit) mit Datum und Vorwert
    var best = {}, out = [];
    state.logs.slice().sort(function (a, b) { return a.t - b.t; }).forEach(function (l) {
      var e = EXB[l.e]; if (!e) return; var r = metric(e, l.s); if (!r.full) return;
      if (best[e.id] === undefined || r.val > best[e.id]) { if (best[e.id] !== undefined) out.push({ t: l.t, e: e, v: r.val, p: best[e.id] }); best[e.id] = r.val; }
    });
    return out;
  }
  function recHtml() {
    // Rekorde je Übung (neueste zuerst): Bestwert, Plus seit dem ersten Wert, Anzahl; oben 3 Kennzahlen
    var pb = pbList(), by = {}, now = Date.now();
    pb.forEach(function (x) { var o = by[x.e.id] || (by[x.e.id] = { e: x.e, n: 0, first: x.p, v: 0, t: 0 }); o.n++; o.v = x.v; o.t = x.t; });
    var L = Object.keys(by).map(function (k) { return by[k]; }).sort(function (a, b) { return b.t - a.t; });
    if (!L.length) return '<div class="empty rise">' + ic('trophy') + '<b>Noch keine Rekorde</b></div>';
    return kpis([[pb.length, 'Rekorde'], [pb.filter(function (x) { return x.t >= now - 30 * 864e5; }).length, 'in 30 Tagen'], [L.length, 'Übungen']]) +
      '<div class="recl rise" style="--i:3">' + L.map(function (o) { var g = o.v - o.first;
        return '<button class="recr' + (o.t >= now - 7 * 864e5 ? ' new' : '') + '" data-open="' + o.e.id + '">' + ic('trophy') + '<span><b>' + esc(o.e.n) + '</b><small>' + fmtDayL(dayIdx(o.t)) + '</small></span><em>' + o.v + '<i>' + esc(o.e.u) + '</i><small>+' + (g % 1 ? fN(g) : g) + ' · ' + o.n + '×</small></em></button>'; }).join('') + '</div>';
  }
  function prof() { var o = foodState().pr || {}; return { h: o.h || 0, a: o.a || 0, s: o.s || 'm', act: o.act || 1.375, go: o.go || 'bulk', tw: o.tw || 0, ex: o.ex || '', inj: o.inj || '', eq: o.eq || ['bar', 'board', 'db', 'mat', 'roll', 'ball', 'bike'] }; }
  var MEAS = [['w', 'Taille'], ['c', 'Brust'], ['sh', 'Schultern'], ['a', 'Oberarm'], ['th', 'Oberschenkel']], GOLAB = { bulk: 'Aufbau', keep: 'Halten', cut: 'Definition' }, EXLAB = { new: 'Einsteiger', mid: 'Fortgeschritten', adv: 'Profi' };
  function lastM() { var m = foodState().m; return m.length ? m[m.length - 1] : null; }
  function profSheet(kind) {
    var p = prof(), st = foodState(), lm = lastM(), h = '<div class="grab"></div><div class="sh-h"><span class="gi">' + ic({ body: 'user', goal: 'target', meas: 'scale', train: 'dumb' }[kind]) + '</span><div class="nm"><b>' + { body: 'Körper', goal: 'Ziel', meas: 'Maße', train: 'Training' }[kind] + '</b><small>' + { body: 'Für den Rechner', goal: 'Was willst du erreichen?', meas: 'Umfang in cm', train: 'Erfahrung, Geräte, Hinweise' }[kind] + '</small></div><button class="x" data-sheet-close aria-label="Schließen">' + ic('close') + '</button></div>';
    ui.pfd = { s: p.s, go: p.go, ex: p.ex, eq: p.eq.slice() };
    if (kind === 'body') h += '<div class="dg3"><label>Größe cm<input id="pf-h" type="number" inputmode="numeric" value="' + (p.h || '') + '"></label><label>Alter<input id="pf-a" type="number" inputmode="numeric" value="' + (p.a || '') + '"></label><label>Gewicht kg<input id="pf-w" type="number" inputmode="decimal" step="0.1" value="' + (lastW() ? lastW().kg : '') + '"></label></div><div class="seg"><button data-pfs="m" aria-pressed="' + (p.s !== 'f') + '">Mann</button><button data-pfs="f" aria-pressed="' + (p.s === 'f') + '">Frau</button></div>';
    if (kind === 'goal') h += '<div class="seg three">' + ['bulk', 'keep', 'cut'].map(function (g) { return '<button data-pfgo="' + g + '" aria-pressed="' + (p.go === g) + '">' + GOLAB[g] + '</button>'; }).join('') + '</div><div class="finp one"><label>Zielgewicht<input id="pf-tw" type="number" inputmode="decimal" step="0.1" value="' + (p.tw || '') + '" placeholder="optional"><span>kg</span></label></div>';
    if (kind === 'meas') h += '<div class="dg3 mg3">' + MEAS.map(function (m) { return '<label>' + m[1] + '<input id="pf-m-' + m[0] + '" type="number" inputmode="decimal" step="0.1" value="' + (lm && lm[m[0]] ? lm[m[0]] : '') + '"></label>'; }).join('') + '</div>' + (lm ? '<p class="muted fnote">Zuletzt vor ' + daysSince(lm.t) + ' Tagen. Alle 2 bis 4 Wochen reicht.</p>' : '');
    if (kind === 'train') h += '<div class="seg three">' + ['new', 'mid', 'adv'].map(function (x) { return '<button data-pfex="' + x + '" aria-pressed="' + (p.ex === x) + '">' + EXLAB[x] + '</button>'; }).join('') + '</div><div class="eqs">' + EQUIP.map(function (q) { return '<button data-pfeq="' + q[0] + '" aria-pressed="' + (p.eq.indexOf(q[0]) >= 0) + '">' + q[1] + '</button>'; }).join('') + '</div><textarea id="pf-inj" class="pf-t" maxlength="160" placeholder="Einschränkungen oder Schmerzen, z. B. linke Schulter" aria-label="Hinweise">' + esc(p.inj) + '</textarea>';
    return h + '<button class="btn primary big" data-pfsave="' + kind + '">' + ic('check') + 'Speichern</button>';
  }
  function profClick(t) {
    var el, st = foodState();
    if ((el = t.closest('[data-pf]'))) { ui.sheet = { prof: el.dataset.pf }; $('sheet').className = 'sheet tall'; $('sheet').innerHTML = profSheet(el.dataset.pf); $('shade').classList.add('open'); $('sheet').classList.add('open'); return true; }
    function tog(attr, key, val) { document.querySelectorAll('[' + attr + ']').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute(attr) === val)); }); ui.pfd[key] = val; }
    if ((el = t.closest('[data-pfs]'))) { tog('data-pfs', 's', el.dataset.pfs); return true; }
    if ((el = t.closest('[data-pfgo]'))) { tog('data-pfgo', 'go', el.dataset.pfgo); return true; }
    if ((el = t.closest('[data-pfex]'))) { tog('data-pfex', 'ex', ui.pfd.ex === el.dataset.pfex ? '' : el.dataset.pfex); document.querySelectorAll('[data-pfex]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.pfex === ui.pfd.ex)); }); return true; }
    if ((el = t.closest('[data-pfeq]'))) { var k = el.dataset.pfeq, i = ui.pfd.eq.indexOf(k); if (i >= 0) ui.pfd.eq.splice(i, 1); else ui.pfd.eq.push(k); el.setAttribute('aria-pressed', String(i < 0)); return true; }
    if ((el = t.closest('[data-pfsave]'))) {
      var kind = el.dataset.pfsave, o = Object.assign({}, prof(), st.pr || {}), p = ui.pfd || {};
      function num(id) { var e = $(id); var f = e ? parseFloat(e.value) : NaN; return isFinite(f) ? f : 0; }
      if (kind === 'body') { o.h = Math.max(0, Math.min(230, Math.round(num('pf-h')))); o.a = Math.max(0, Math.min(100, Math.round(num('pf-a')))); o.s = p.s || 'm'; var kg = Math.round(num('pf-w') * 10) / 10; if (kg >= 20 && kg <= 400) { var lw = lastW(), nw = Date.now(); if (lw && daysSince(lw.t) === 0) { lw.kg = kg; lw.t = nw; } else st.w.push({ t: nw, kg: kg }); } }
      if (kind === 'goal') { if (o.go !== (p.go || 'bulk')) delete o.rt; o.go = p.go || 'bulk'; o.tw = Math.max(0, num('pf-tw')); }
      if (kind === 'train') { o.ex = p.ex || ''; o.eq = p.eq || []; o.inj = $('pf-inj').value.trim().slice(0, 160); }
      if (kind === 'meas') {
        var en = { t: Date.now() }, any = false; MEAS.forEach(function (m) { en[m[0]] = Math.max(0, num('pf-m-' + m[0])); if (en[m[0]]) any = true; });
        if (!any) { toast('Wert eintragen', 'bolt'); return true; }
        var lm = lastM(); if (lm && daysSince(lm.t) === 0) { Object.assign(lm, en); } else st.m.push(en);
      } else st.pr = o;
      persist(); closeSheet(true); ui.fresh = false; render(); toast('Gespeichert', 'check'); return true;
    }
    return false;
  }
  function setHtml() {
    var h = '<div class="grab"></div><div class="sh-h"><span class="gi">' + ic('gear') + '</span><div class="nm"><b>Einstellungen</b><small>Timer und Daten</small></div><button class="x" data-sheet-close aria-label="Schließen">' + ic('close') + '</button></div>';
    h += '<section class="sec"><h2 class="sec-h">' + ic('clock') + 'Einstellungen</h2><button class="sw" data-act="resttoggle" aria-pressed="' + restOn + '"><span>Pausen-Timer</span><i></i></button></section>';
    h += '<section class="sec"><h2 class="sec-h">' + ic('data') + 'Daten<small>' + (store === 'cloud' ? 'im Artifact gespeichert' : 'nur in diesem Browser') + '</small></h2>';
    if (sync) h += '<p class="hint">' + esc(sync) + '</p>';
    if (!window.claude && !DEMO) { var lb = 0; try { lb = +localStorage.getItem('zenit.lastBackup') || 0; } catch (e) { /* egal */ } h += '<p class="hint">' + (lb ? 'Letztes Backup: ' + (daysSince(lb) === 0 ? 'heute' : 'vor ' + daysSince(lb) + ' Tagen') : 'Noch kein Backup. Sichere die Datei in „Dateien“ oder iCloud.') + '</p>'; }
    h += '<div class="row"><button class="btn small" data-act="export">Backup</button><button class="btn small" data-act="import">Einlesen</button><button class="btn small' + (ui.del === 'all' ? ' danger' : '') + '" data-act="wipe">' + (ui.del === 'all' ? 'Wirklich alles löschen?' : 'Alles löschen') + '</button></div>';
    if (ui.io !== '') h += '<div style="display:grid;gap:8px;margin-top:10px"><textarea id="io" spellcheck="false" aria-label="Backup-Daten">' + esc(ui.io === ' ' ? '' : ui.io) + '</textarea><div class="row"><button class="btn small primary" data-act="doimport">Einlesen und zusammenführen</button><button class="btn small ghost" data-act="ioclose">Schließen</button></div></div>';
    h += '</section><section class="sec"><h2 class="sec-h">' + ic('play') + 'Testdaten<small>' + (DEMO ? 'Demo aktiv, echte Daten sicher' : 'getrennt von deinen Daten') + '</small></h2><div class="row demo-r">' +
      [['mid', 'Seit 5 Monaten'], ['gold', 'Goldene Serie'], ['broken', 'Serie gerissen'], ['fresh', 'Neu dabei'], ['empty', 'Leer']].map(function (o) { return '<button class="btn small" data-demo="' + o[0] + '">' + o[1] + '</button>'; }).join('') +
      (DEMO ? '<button class="btn small primary" data-demo="off">Demo beenden</button>' : '') + '</div>';
    return h + '</section>' + (window.ZENIT_V ? '<p class="hint mono">Version ' + esc(window.ZENIT_V) + '</p>' : '');
  }
  function openSettings() { ui.sheet = { settings: true }; $('sheet').className = 'sheet tall'; $('sheet').innerHTML = setHtml(); $('shade').classList.add('open'); $('sheet').classList.add('open'); }

