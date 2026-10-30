  // Rechner: Grundumsatz (Mifflin-St Jeor) × Alltagsfaktor + Trainingszuschlag + Ziel-Tempo + Korrektur aus dem Gewichtsverlauf
  var GOS = [['bulk', 'Aufbau', 0.25], ['keep', 'Halten', 0], ['cut', 'Definition', -0.5]], RATES = [-0.75, -0.5, -0.25, 0, 0.25, 0.5];
  function palOf(pr) { return pr.pal || { 1.2: 1.25, 1.375: 1.35, 1.55: 1.45, 1.725: 1.55 }[pr.act] || 1.4; }
  function rateOf(pr) { return isFinite(pr.rt) ? pr.rt : (GOS.filter(function (g) { return g[0] === pr.go; })[0] || GOS[0])[2]; }
  function wAt(di) { var w = foodState().w, r = null; w.forEach(function (x) { if (dayIdx(x.t) <= di) r = x; }); r = r || w[0]; return r ? r.kg : 0; }
  var durM = null, durN = -1;
  function trainKcal(di, kg) {
    // Trainingszuschlag: Dauer × Gewicht × MET (Kraft 5, Ausdauer 7). Vergangene Tage nach dem, was trainiert wurde; heute/künftig nach Plan
    if (durN !== state.logs.length) { durM = durEst(); durN = state.logs.length; }
    var today = dayIdx(Date.now()), sec = 0, did = false, cardio = false;
    state.logs.forEach(function (l) { if (dayIdx(l.t) !== di) return; if (l.e === 'sess') sec += l.s[0]; else if (EXB[l.e]) { did = true; if (EXB[l.e].g === 'cardio') cardio = true; } });
    if (!sec && did) sec = 2700;
    if (!sec && di >= today) schedFor(di).forEach(function (x) { sec += (durM[x.id] || 45) * 60; if (domGroup(x) === 'cardio') cardio = true; });
    return Math.round((cardio ? 7 : 5) * kg * sec / 3600);
  }
  function calcWith(pr, w, di) {
    if (!pr || !pr.h || !pr.a || !w) return null;
    var bmr = 10 * w + 6.25 * pr.h - 5 * pr.a + (pr.s === 'f' ? -161 : 5), pal = palOf(pr), tb = pr.tb === 0 ? 0 : trainKcal(di, w);
    var maint = bmr * pal + tb, rt = rateOf(pr), k = Math.round((maint + rt * 1100 + (pr.adj || 0)) / 10) * 10;
    var p = Math.round(w * (pr.pkg || (rt < 0 ? 2.2 : 2))), f = Math.round(k * (pr.fp || 25) / 900), c = Math.max(0, Math.round((k - 4 * p - 9 * f) / 4));
    return { k: k, p: p, f: f, c: c, fb: Math.round(k * 0.014), su: Math.round(k * 0.025), bmr: bmr, pal: pal, tb: tb, maint: maint, rt: rt, w: w };
  }
  function calcFor(di) { return calcWith(foodState().pr, wAt(di), di); }
  function foodGoal(di) {
    // Automatisch: Rechner je Tag (Trainingstage mehr). Eigene Werte: fehlende Makros aus den kcal ableiten (Fett 25 %, Ballaststoffe 14 g/1000 kcal, Zucker ≤ 10 %)
    var g = foodState().g, c;
    if (!g || g.a) { c = calcFor(di == null ? dayIdx(Date.now()) : di); if (c) return c; }
    var b = g && !g.a ? g : { k: 2500, p: 140 }, f = b.f || Math.round(b.k * 0.25 / 9);
    return { k: b.k, p: b.p, f: f, c: b.c || Math.max(0, Math.round((b.k - 4 * b.p - 9 * f) / 4)), fb: b.fb || Math.round(b.k * 0.014), su: b.su || Math.round(b.k * 0.025) };
  }
  function tdeeEst(pr) {
    // Echter Bedarf aus 28 Tagen: Ø gegessen − Gewichtstrend × 7700 kcal/kg. Verglichen mit der Formel ohne Korrektur ergibt das die Korrektur
    var today = dayIdx(Date.now()), n = 0, kc = 0, mt = 0, pts = [];
    for (var di = today - 28; di < today; di++) { var s = foodSum(di), c = calcWith(pr, wAt(di), di); if (s.k >= 800 && c) { n++; kc += s.k; mt += c.maint; } }
    foodState().w.forEach(function (x) { var d = dayIdx(x.t); if (d >= today - 28 && d <= today) pts.push([d, x.kg]); });
    var span = pts.length ? pts[pts.length - 1][0] - pts[0][0] : 0;
    if (n < 10 || pts.length < 3 || span < 10) return { n: n, wn: pts.length, span: span };
    var mx = pts.reduce(function (a, q) { return a + q[0]; }, 0) / pts.length, my = pts.reduce(function (a, q) { return a + q[1]; }, 0) / pts.length, sxy = 0, sxx = 0;
    pts.forEach(function (q) { sxy += (q[0] - mx) * (q[1] - my); sxx += (q[0] - mx) * (q[0] - mx); });
    var slope = sxx ? sxy / sxx : 0, est = kc / n - slope * 7700, maint = mt / n;
    if (est < maint * 0.7 || est > maint * 1.3) return { off: 1, n: n, wn: pts.length, est: Math.round(est), maint: Math.round(maint) };
    return { ok: 1, n: n, wn: pts.length, est: Math.round(est), maint: Math.round(maint), adj: Math.round((est - maint) / 50) * 50, wk: slope * 7 };
  }

  // Kacheln (8): 2 zuletzt gegessen (q: 'r'), 3 am häufigsten in den letzten 3 Wochen ('f'), 3 typisch für die aktuelle Mahlzeit ('m', 6 Wochen),
  // je gleiche Quelle und Menge; aufgefüllt mit Vorschlägen (übernehmen die Gruppe des Platzes); jedes Lebensmittel nur einmal
  function fTiles() {
    var m = {}, mm = {}, arr = [], ml = [], out = [], now = Date.now(), since = now - 21 * 864e5, cur = mealOf(now)[1];
    foodState().e.forEach(function (x) {
      if (x.t < now - 42 * 864e5 || !x.r || !fItem(x.r.i)) return;
      var key = x.r.i + '|' + x.r.g;
      if (mealOfE(x)[1] === cur) { if (!mm[key]) { mm[key] = { i: x.r.i, g: x.r.g, c: 0, t: 0 }; ml.push(mm[key]); } mm[key].c++; mm[key].t = Math.max(mm[key].t, x.t); }
      if (x.t < since) return;
      if (!m[key]) { m[key] = { i: x.r.i, g: x.r.g, c: 0, t: 0 }; arr.push(m[key]); } m[key].c++; m[key].t = Math.max(m[key].t, x.t);
    });
    function add(x, q, n) { if (out.length < n && !out.some(function (y) { return y.i === x.i; })) out.push({ i: x.i, g: x.g, q: q }); }
    arr.slice().sort(function (a, b) { return b.t - a.t; }).forEach(function (x) { add(x, 'r', 2); });
    arr.sort(function (a, b) { return b.c - a.c || b.t - a.t; }).forEach(function (x) { add(x, 'f', 5); });
    ml.sort(function (a, b) { return b.c - a.c || b.t - a.t; }).forEach(function (x) { add(x, 'm', 8); });
    TILEDEF.forEach(function (d) { add({ i: d[0], g: d[1] }, '', 8); });
    // Noch kein Verlauf: nur eine ruhige Reihe mit 4 Vorschlägen zur Mahlzeit
    if (!arr.length && !ml.length) return out.slice(0, 4).map(function (x) { return { i: x.i, g: x.g, q: 'm' }; });
    // Raster 4×2: oben 3 häufig, unten 3 zur Uhrzeit, rechts oben und unten die 2 zuletzt; fehlende Plätze aus dem Rest, die gelten als Vorschlag zur Mahlzeit
    // (ohne Verlauf sind so alle 8 ruhig in der Farbe der Mahlzeit statt mit erfundenem „zuletzt“/„häufig“)
    var rest = out.filter(function (x) { return !x.q; });
    function grp(q, n) { var l = out.filter(function (x) { return x.q === q; }); while (l.length < n && rest.length) l.push(Object.assign({}, rest.shift(), { q: 'm' })); return l; }
    var R = grp('r', 2), F = grp('f', 3), M = grp('m', 3);
    return F.concat(R.slice(0, 1), M, R.slice(1)).filter(Boolean);
  }
  function fbar(k, v, g, ex, pw) {
    // Mini-Balken: hit = im Ziel, over = über der Grenze (FLIM: Fett/Kohlenhydrate 110 %, Zucker 100 %, Protein 140 %, Ballaststoffe 160 % als gesundes Maximum)
    // low = orange: Protein/Ballaststoffe weit hinter dem, was zur Tageszeit zu erwarten ist (ex = erwarteter Anteil, fExp)
    var su = k === 'su', p = g ? v / g : 0, lim = FLIM[k], bad = p > lim, hit = !bad && (k === 'p' || k === 'fb' ? p >= 0.9 : !su && p >= 0.85), low = !bad && !hit && (k === 'p' || k === 'fb') && ex >= 0.3 && p < ex * 0.6;
    return '<div class="fmb ' + k + (bad ? ' over' : hit ? ' hit' : low ? ' low' : '') + fAnim(k, bad ? 'over' : hit ? 'hit' : '', v) + '" data-fnut="' + k + '" role="button" tabindex="0"><span aria-label="' + NSH[k] + '">' + ic(NIC[k]) + '<b>' + Math.round(v) + '</b><small>/' + (su ? '≤' : '') + g + '</small></span><i class="fbt"><i' + pv('fm' + k, Math.min(1, p)) + '></i>' + fGh(p, g ? (pw || 0) / g : 0) + fOv(p, lim) + '</i></div>';
  }
  // Grenzen als Anteil vom Ziel: darüber = zu viel (k = kcal, wa = Wasser)
  var FLIM = { k: 1.1, p: 1.4, f: 1.1, c: 1.1, fb: 1.6, su: 1, wa: 1.5 };
  // Zu viel: roter Balken füllt sich über der eigenen Farbe neu, je 1/3 über der Grenze ein voller Balken
  // Geplant (noch nicht gegessen): schraffiertes Stück ab der Füllung a, Breite w (Anteile vom Ziel)
  function fGh(a, w) { a = Math.min(1, a); return w > 0 && a < 1 ? '<i class="gh" style="--a:' + a.toFixed(3) + ';--w:' + Math.min(w, 1 - a).toFixed(3) + '"></i>' : ''; }
  function fOv(p, lim) { return p > lim ? '<i class="ov" style="--o:' + Math.min(1, (p / lim - 1) * 3).toFixed(3) + '"></i>' : ''; }
  // Einmal-Animation seit dem letzten Zeichnen (gleicher Tag): ins Ziel = fa-hit; über die Grenze oder weiter darüber (jeder neue Eintrag) = fa-bad
  function fAnim(k, st, v) {
    var sd = fSd(); if (ui.fstd !== sd) { ui.fstd = sd; ui.fst = {}; ui.fsv = {}; }
    var was = ui.fst[k], v0 = ui.fsv[k]; ui.fst[k] = st; ui.fsv[k] = v;
    if (was === undefined) return '';
    if (st === 'over') return was !== 'over' || v > v0 ? ' fa-bad' : '';
    return st === 'hit' && was !== 'hit' ? ' fa-hit' : '';
  }
  function dishTot(dd) {
    var o = {}; NK.forEach(function (k) { o[k] = 0; });
    dd.ing.forEach(function (q) { NK.forEach(function (k) { o[k] += (+q.a || 0) * (+q[k] || 0) / 100; }); });
    var n = Math.max(1, +dd.por || 1);
    return { k: o.k, p: o.p, f: o.f, c: o.c, fb: o.fb, su: o.su, pk: o.k / n, pp: o.p / n, pf: o.f / n, pc: o.c / n, pfb: o.fb / n, psu: o.su / n };
  }
  function fN(x) { return String(Math.round(x * 10) / 10).replace('.', ','); }
  // Kreis um eine Tageszahl (Essen-Tagesleiste und Planen-Kalender): q = Anteil vom kcal-Ziel als dünner Ring; geplant (fu) kühl und blasser; st = ok/over/low
  // Essen-Ring eines Tages (Essen-Leiste und Kalender gleich): grün = Protein fast erreicht und kcal im Rahmen, orange = deutlich zu wenig, rot = über 110 %, künftig = geplant kühl
  function dayFood(di, today) {
    var fu = di > today, sm = fu ? planSum(di) : foodSum(di), gd = foodGoal(di), kq = sm.k / gd.k;
    var st = fu || !sm.items.length ? '' : kq > 1.1 ? ' over' : sm.p >= gd.p * 0.9 && kq >= 0.85 ? ' ok' : di < today && (sm.p < gd.p * 0.6 || kq < 0.6) ? ' low' : '';
    return dayRing(sm.items.length ? kq : 0, fu, st);
  }
  function dayRing(q, fu, st) { return q ? '<i class="dr' + (fu ? ' pl' : '') + (st || '') + '" style="--p:' + Math.min(1, q).toFixed(3) + '" aria-hidden="true"></i>' : ''; }
  // Gewählter Tag (Leiste oben, letzte 7 Tage); Wasserziel 35 ml je kg in 250-ml-Schritten
  function fExp(di) {
    // Erwarteter Anteil des Tagesziels: vergangene Tage 1, heute von 8 bis 20 Uhr linear 0 → 1
    var t = dayIdx(Date.now()); if (di < t) return 1; if (di > t) return 0; var n = new Date(); return Math.max(0, Math.min(1, (n.getHours() + n.getMinutes() / 60 - 8) / 12));
  }
  function fSd() { var t = dayIdx(Date.now()); return ui.fsd != null && ui.fsd <= t + 60 && ui.fsd > t - 366 ? ui.fsd : t; }
  // Tage zurück für neue Einträge: künftige Tage sind nur Ansicht, eingetragen wird dann heute
  function fBack() { return Math.max(0, dayIdx(Date.now()) - fSd()); }
  function fMon(di) { var q = new Date(di * 864e5); return q.toLocaleDateString('de-DE', q.getUTCFullYear() === new Date().getFullYear() ? { month: 'long', timeZone: 'UTC' } : { month: 'long', year: 'numeric', timeZone: 'UTC' }); }
  // Seite der Tagesleiste: 0 = heute in der Mitte, positiv = Wochen zurück, negativ = Wochen voraus (ui.fpg, sonst aus dem gewählten Tag)
  function fPg() { var t = dayIdx(Date.now()); return ui.fpg != null ? ui.fpg : Math.floor((t - fSd() + 3) / 7); }
  function fdsMove(dir) {
    // Tagesleiste wischen: 7 Tage zurück/vor (ein Jahr zurück, 8 Wochen voraus; künftige Tage nur Ansicht); der gewählte Tag wandert mit.
    // Neuer Monat wird kurz eingeblendet
    var t = dayIdx(Date.now()), pg = fPg(), np = pg - dir, e0 = t + 3 - pg * 7, e1 = t + 3 - np * 7;
    if (np < -8 || e1 - 6 <= t - 366) return false;
    var a = dir < 0 ? e0 - 6 : e0, b = dir < 0 ? e1 - 6 : e1; if (fMon(a) !== fMon(b)) ui.fmon = fMon(b);
    var s0 = fSd(); if (s0 < e1 - 6 || s0 > e1) ui.fsd = Math.max(e1 - 6, Math.min(e1, s0 + dir * 7));
    ui.fpg = np; ui.fdir = dir; ui.fresh = false; buzz(4); render(); return true;
  }
  function waGoal(di) { var kg = wAt(di) || 75; return Math.max(1500, Math.min(4000, Math.round(kg * 35 / 250) * 250)); }
  // Wasser-Regler im Fenster (Skala) in 50-ml-Schritten: Antippen/Ziehen setzt den Wert direkt, Loslassen speichert
  var wsl = null;
  function waShow(v) {
    // Wasser-Wert live in Zahl, Feld und Fenster-Regler zeigen (ohne Speichern)
    document.querySelectorAll('[data-wav]').forEach(function (e) { e.textContent = fN2(v / 1000); });
    var f = $('wa-v'), r = $('wa-r'); if (f && f !== document.activeElement) f.value = fN2(v / 1000);
    if (r) { r.firstElementChild.style.setProperty('--p', Math.min(1, v / +r.dataset.max).toFixed(3)); r.classList.toggle('over', v > +r.dataset.lim); }
  }
  // Roter Überlauf wie bei den Nährwerten: je 1/3 über der Grenze ein voller Balken (0–1)
  function waOv(v, lim) { return v > lim ? Math.min(1, (v / lim - 1) * 3).toFixed(3) : 0; }
  function wslSet(x) {
    var r = wsl.el.getBoundingClientRect(), mx = +wsl.el.dataset.max, gl = +wsl.el.dataset.goal || 0;
    // Bilanz-Balken (data-goal): voll = Ziel, rechts über den Rand hinaus weiter (20 ml je Pixel); Fenster-Regler: bis data-max
    var v = gl && x > r.right ? gl + (x - r.right) * 20 : Math.max(0, Math.min(1, (x - r.left) / r.width)) * mx;
    v = Math.max(0, Math.min(8000, Math.round(v / 50) * 50)); if (v === wsl.v) return;
    wsl.v = v; buzz(3); waShow(v);
    wsl.el.firstElementChild.style.setProperty('--p', Math.min(1, v / mx).toFixed(4));
    if (gl) { wsl.el.classList.toggle('hi', v > gl); var ov = wsl.el.querySelector('.wov'); if (ov) ov.style.setProperty('--o', waOv(v, +wsl.el.dataset.lim)); }
  }
  function wslEnd() {
    if (!wsl) return; var w = wsl; wsl = null;
    // Balken in der Bilanz nur angetippt (nicht gezogen): Wasser-Fenster öffnen
    if (w.tap) { ui.sheet = { wa: true }; sheetOpen(waHtml()); return; }
    if (w.v !== w.v0) waSet(w.v);
    if (ui.sheet && ui.sheet.wa) $('sheet').innerHTML = waHtml();
  }
  document.addEventListener('pointerdown', function (ev) {
    var el = ev.target.closest && ev.target.closest('.wsl'); if (!el) return;
    // Mit data-tap (Bilanz) zählt erst Ziehen ab 6 px, sonst setzt schon das Antippen den Wert (Fenster-Regler)
    wsl = { el: el, x: ev.clientX, v0: +el.dataset.v, v: +el.dataset.v, tap: !!el.dataset.tap }; if (!wsl.tap) wslSet(ev.clientX);
  });
  document.addEventListener('pointermove', function (ev) { if (!wsl) return; if (wsl.tap) { if (Math.abs(ev.clientX - wsl.x) < 6) return; wsl.tap = false; } wslSet(ev.clientX); });
  document.addEventListener('pointerup', wslEnd);
  document.addEventListener('pointercancel', wslEnd);
  function waSet(v) {
    // Wasser des gewählten Tags setzen (ml), Seite neu zeichnen; gibt den gespeicherten Wert zurück
    var wd = fSd(), fs = foodState(); v = Math.max(0, Math.min(8000, Math.round(v || 0)));
    if (v) fs.wa[wd] = v; else delete fs.wa[wd]; persist(); ui.fresh = false; render(); return v;
  }
  function waHtml() {
    // Wasser genau: Zahl (tippen oder wischen) mit ±50 ml, breiter Regler mit Skala (Striche je 250 ml, Ziel-Marke, rot über dem Höchstwert), Schnellwerte
    var sd = fSd(), wa = foodState().wa[sd] || 0, wg = waGoal(sd), lim = wg * FLIM.wa, mx = Math.max(Math.ceil(lim / 500) * 500, Math.ceil(wa / 500) * 500), lb = '';
    for (var l = 0; l * 1000 <= mx; l++) lb += '<span style="--x:' + (l * 1000 / mx).toFixed(4) + '">' + l + '</span>';
    return shHead('drop', 'Wasser', (sd === dayIdx(Date.now()) ? 'Heute' : fmtDayL(sd))) +
      '<div class="wahd"><button class="sb" data-fwa="-50" aria-label="50 ml weniger"' + (wa ? '' : ' disabled') + '>' + ic('minus') + '</button>' +
      '<label class="wnum"><span><input id="wa-v" type="text" inputmode="decimal" value="' + fN2(wa / 1000) + '" aria-label="Wasser in Litern"><em>l</em></span><small>von ' + fN(wg / 1000) + ' l</small></label>' +
      '<button class="sb" data-fwa="50" aria-label="50 ml mehr">' + ic('plus') + '</button></div>' +
      '<div class="wsc" data-noswipe="1"><i id="wa-r" class="wsl wbig' + (wa > lim ? ' over' : '') + '" data-max="' + mx + '" data-lim="' + lim + '" data-v="' + wa + '" role="slider" aria-label="Wasser">' +
      '<i style="--p:' + Math.min(1, wa / mx).toFixed(3) + '"></i><em style="--x:' + (wg / mx).toFixed(4) + '"></em></i><div class="wsx" style="--n:' + mx / 250 + '">' + lb + '</div></div>' +
      '<div class="wqk">' + [['glass', 250], ['bottle', 500], ['bottle', 750]].map(function (q) { return '<button data-fwa="' + q[1] + '">' + ic(q[0]) + '<b>+' + q[1] + '</b></button>'; }).join('') +
      '<button data-fwaz="1" aria-label="Auf 0 setzen"' + (wa ? '' : ' disabled') + '>' + ic('undo') + '<b>0</b></button></div>';
  }
  function viewFood(d, now) {
    var today = dayIdx(now), sd = fSd(), ex = fExp(sd), g = foodGoal(sd), s = foodSum(sd), sf = sd > today, pq = sd >= today ? planSum(sd) : planSum(-1), tl = fTiles(), kp = s.k / g.k, wa = foodState().wa[sd] || 0, wg = waGoal(sd);
    ui.ftiles = tl;
    // Keine Überschrift (wie in Spielen ergibt sich der Bereich aus der unteren Leiste); Ziele/Rechner im Profil
    var h = '';
    // Tagesleiste: 7 Tage, heute in der Mitte (wischen = 7 Tage zurück/vor). Dünner Ring um die Zahl = kcal vom Ziel (wie im Kalender, dayRing; grün = Protein
    // fast erreicht und kcal im Rahmen, orange = deutlich zu wenig, rot = über 110 %), geplant kühl. Künftige Tage nur zur Ansicht (Geplantes, eintragen erst am Tag)
    var ds = '', pe = today + 3 - fPg() * 7; for (var i = 6; i >= 0; i--) {
      var di = pe - i, fu = di > today, sm = fu ? planSum(di) : foodSum(di);
      var gc = di < today ? ' past' : di === today ? ' today' : ' fut';
      ds += '<button class="fdd' + (di === sd ? ' sel' : '') + gc + (fu && sm.items.length ? ' pl' : '') + '" data-fsd="' + di + '" aria-label="' + esc(fmtDayL(di)) + '"><small>' + WDN[wdOf(di)].slice(0, 2) + '</small><b>' + dayFood(di, today) + new Date(di * 864e5).getUTCDate() + '</b></button>';
    }
    h += '<div class="fdw rise" style="--i:0">' + (ui.fmon ? '<b class="fmo">' + esc(ui.fmon) + '</b>' : '') + '<nav class="fds' + (ui.fdir ? (ui.fdir > 0 ? ' in-r' : ' in-l') : '') + '">' + ds + '</nav></div>';
    ui.fmon = ''; ui.fdir = 0;
    // Bilanz: kcal groß mit Balken, darunter Protein, Fett, Kohlenhydrate, Ballaststoffe, Zucker
    h += '<section class="fbal dkc rise" style="--i:1;--fsd:-' + (Date.now() % 9000) + 'ms"><div class="fbk' + (kp > FLIM.k ? ' over' : kp >= 0.9 ? ' hit' : ex >= 0.3 && kp < ex * 0.6 ? ' low' : '') + fAnim('k', kp > FLIM.k ? 'over' : kp >= 0.9 ? 'hit' : '', s.k) + '" data-fnut="k" role="button" tabindex="0"><b data-n="' + s.k + '" data-nk="fkv">' + s.k + '</b><span>/ ' + g.k + ' kcal</span>' +
      '<em><b>' + Math.abs(g.k - s.k) + '</b>' + (g.k - s.k >= 0 ? 'offen' : 'drüber') + '</em><i class="fbt"><i' + pv('fkb', Math.min(1, kp)) + '></i>' + fGh(kp, pq.k / g.k) + fOv(kp, FLIM.k) + '</i></div>' +
      '<div class="fbm">' + ['p', 'f', 'c', 'fb', 'su'].map(function (k) { return fbar(k, s[k], g[k], ex, pq[k]); }).join('') + '</div>' +
      (sf ? '</section>' : '<div class="fwa' + (wa > wg * FLIM.wa ? ' over' : wa >= wg ? ' hit' : '') + fAnim('wa', wa > wg * FLIM.wa ? 'over' : wa >= wg ? 'hit' : '', wa) + '">' + ic('drop') +
      // Balken = Regler bis zur Grenze (1,5 × Ziel, Strich = Ziel): wischen setzt den Wert live, Loslassen speichert; antippen öffnet das Wasser-Fenster.
      // Über dem Ziel dunkler, über der Grenze rot
      // Voll = Ziel; über das Ziel hinaus über den rechten Rand ziehen (20 ml je Pixel), Füllung läuft dunkelblau aus; über der Grenze füllt vorne ein roter Balken nach (.wov)
      '<i class="fbt wsl' + (wa > wg ? ' hi' : '') + '" data-max="' + wg + '" data-goal="' + wg + '" data-lim="' + Math.round(wg * FLIM.wa) + '" data-v="' + wa + '" data-tap="1" data-noswipe="1" role="slider" aria-label="Wasser">' +
      '<i style="--p:' + Math.min(1, wa / wg).toFixed(4) + '"></i><span class="wov" style="--o:' + waOv(wa, wg * FLIM.wa) + '"></span></i>' +
      '<button class="fwv" data-fwao="1" aria-label="Wasser genau eintragen"><b><span data-wav="1">' + fN2(wa / 1000) + '</span><small>/' + fN(wg / 1000) + ' l</small></b></button>' +
      '</div></section>');
    // Gegessen in einer Zeile (immer gleich hoch): je Mahlzeit in fester Reihenfolge eine Karte (kcal, Kategorien überlappend), fehlende als leerer Platzhalter
    // (antippen = Suche, Vorschlag hineinziehen = in diese Mahlzeit). Karte antippen = diese Mahlzeit in derselben Zeile (Kategorie-Stapel, Einträge). Leer: „Wie gestern“ klein in der Kopfzeile
    var cp = !sf && !s.items.length && foodSum(sd - 1).items.length, gs = fGroups(s.items), gm = gs.filter(function (q) { return ui.fmeal === sd + q.m; })[0];
    h += '<section class="fdl rise" style="--i:2"><h2 class="sec-h">' + esc(dayHead(sd)) + (cp ? '<button class="fcpy" data-fcopy="1">' + ic('swap') + 'Wie gestern</button>' : '') +
      (ui.undo && ui.undo.charAt(0) === '#' ? '<button class="fcpy fund" data-undo="1" aria-label="Rückgängig">' + ic('undo') + '</button>' : '') + '</h2><div class="fchips' + (gm ? '' : ' fem') + (ui.fmx ? ' chg' : '') + '" data-noswipe="1">' + (gm ? fMeal(gm) : MEALS.map(function (m) {
        var q = gs.filter(function (x) { return x.m === m[1]; })[0], pi = pq.items.filter(function (o) { return o.x.mk === m[1]; });
        if (q) return fMealCard(q, pi.length);
        if (pi.length) return '<button class="fmc fpm m-' + m[1] + '"' + (sf ? ' aria-label="' + m[2] + ' geplant"' : ' data-fpe="' + m[1] + '" aria-label="' + m[2] + ' geplant, antippen = gegessen"') + '><span class="fmt">' + ic(MEALI[m[1]]) + (sf ? '' : ic('check')) + '</span><b>' + Math.round(pi.reduce(function (a, o) { return a + o.x.k; }, 0)) + '<em>kcal</em></b><small>' + pi.length + ' geplant</small></button>';
        return '<button class="fmc fme m-' + m[1] + '"' + (sf ? ' aria-label="' + m[2] + '"' : ' data-fsearch="1" aria-label="' + m[2] + ' eintragen"') + '>' + ic(MEALI[m[1]]) + '</button>';
      }).join('')) + '</div></section>';
    if (sf) return h;
    // Suchen als Feld-Optik (Lupe, blasser Text, Scan rechts), Gerichte als Icon-Knopf daneben
    // Suchfeld-Optik: links Suchen, rechts im Feld direkt der Barcode-Scanner
    h += '<div class="fact2 rise" style="--i:3"><div class="fsrb"><button class="fsrq" data-fsearch="1">' + ic('search') + '<span>Suchen …</span></button><button class="fsrs" data-fscan="go" aria-label="Barcode scannen">' + ic('scan') + '</button></div>' +
      '<button class="fdsb" data-fdishes="1" aria-label="Gerichte">' + ic('pot') + '</button></div>';
    // Vorschläge 4×2: zuletzt, häufig, typisch für die Uhrzeit (antippen = Menge wählen, nach oben ziehen = sofort eintragen)
    h += '<section class="ftl rise" style="--i:4" data-noswipe="1">' + tl.map(function (x, j) { return fTile(x, 'data-ftile="' + j + '"', ui.ftok === j ? ' done' : ''); }).join('') + '</section>';
    ui.ftok = null;
    return h;
  }
  // Vorschlag-Kachel: Name (lange Wörter kleiner, fitCls), unten kcal groß und Protein; Gruppe als Farbkante oben und Symbol oben rechts
  function fTile(x, attr, cls) {
    var it = fItem(x.i), v = fNut(it, x.g), mk = mealOf(Date.now())[1], q = { r: ['clock', 'zuletzt'], f: ['star', 'häufig'], m: [MEALI[mk], 'zur Uhrzeit'] }[x.q], nm = fEn(it);
    // Ohne Herkunft: Kante, Verlauf und Symbol im Ton der Art (wie die Kategorie-Farben in Essen)
    var ck = it.dish ? 'dish' : it.cat || (/^u/.test(x.i) ? 'u' : 'x'), tn = q ? '' : fTone(x.i, ck);
    return '<button class="fti' + (x.q ? ' q-' + x.q : '') + (x.q === 'm' ? ' m-' + mk : '') + (cls || '') + '" ' + attr + (tn ? ' style="--tq:' + tn + '"' : '') + ' aria-label="' + esc(nm + ', ' + fAmt(it, x.g) + (q ? ', ' + q[1] : ''))
      + '"><i class="ftq"' + (q ? '' : ' style="color:' + tn + '"') + '>' + ic(q ? q[0] : it.dish ? 'pot' : fIco(x.i, ck)) + '</i>' +
      '<b class="' + fitCls(nm, 8) + '">' + esc(nm) + '</b><span class="ftv"><span>' + Math.round(v.k) + '</span><small style="--nc:var(' + NCOL.p + ')">' + ic(NIC.p) + Math.round(v.p) + '</small></span></button>';
  }
  // Kategorien: Icon und kurzer Name (Suche, Gegessen); Schlüssel wie FCATS, dazu Eigene, Gerichte, Schnell, Sonstiges
  var CATI = { g: ['bread', 'Brot'], m: ['milk', 'Milch'], e: ['steak', 'Fleisch'], h: ['bean', 'Bohnen'], v: ['carrot', 'Gemüse'], o: ['snack', 'Obst'], n: ['nut', 'Nüsse'], s: ['candy', 'Süßes'], d: ['glass', 'Getränke'],
    f: ['burger', 'Fast Food'], r: ['food', 'Restaurant'], u: ['user', 'Eigene'], dish: ['pot', 'Gerichte'], q: ['bolt', 'Schnell'], x: ['food', 'Sonstiges'] };
  // Icon je Lebensmittel: eigenes, wo die Unterart nicht genau passt, sonst das der Unterart (FSUB), sonst der Kategorie
  var FICO = { apfel: 'apple', karotte: 'carrot', trauben: 'grapes', erdb: 'straw', beeren: 'berry', kiwi: 'kiwi', brok: 'broc', papr: 'pepper', gurke: 'cucum', zucch: 'cucum', zwieb: 'onion', champ: 'mush', mais: 'corn', erbsen: 'peas',
    salat: 'lettuce', spinat: 'leaf', vaneis: 'icecr', olivoel: 'oil', rapsoel: 'oil', ei: 'egg', eiklar: 'egg', honig: 'jar', marm: 'jar', nusscr: 'jar', bowl: 'bowl', lachs: 'fish', seela: 'fish', thun: 'can',
    garnel: 'shrimp', sushi: 'fish', orange: 'citrus', ernmus: 'jar', avoc: 'avo', toast: 'sandw', cwurst: 'sausage', ppudd: 'cup', mc_pom: 'fries', pommes: 'fries' };
  function fSb(id) { var it = id && (FOODB[id] || (/^u/.test(id) ? fOwn(id) : null)); return it && it.sb && FSUBK[it.sb] ? FSUBK[it.sb] : null; }
  function fIco(id, ck) { var s = fSb(id); return FICO[id] || (s ? s[3] : (CATI[ck] || CATI.x)[0]); }
  // Farbton der Unterart: Kategoriefarbe abwechselnd heller/dunkler gemischt (je Index in der Kategorie), damit Abschnitte unterscheidbar bleiben
  function sbTone(s) {
    var i = FSUB.filter(function (q) { return q[0] === s[0]; }).indexOf(s), m = [0, 22, -22, 40, -38, 55][i] || 0, b = CCOL[s[0]] || CCOL.x;
    return m ? 'color-mix(in srgb, ' + b + ' ' + (100 - Math.abs(m)) + '%, ' + (m > 0 ? 'var(--ink)' : 'var(--bg)') + ')' : b;
  }
  function fTone(id, ck) { var s = fSb(id); return s ? sbTone(s) : CCOL[ck] || (ck === 'dish' ? 'var(--ac)' : CCOL.x); }
  // Kategorie eines Eintrags: Schlüssel aus FCATS, sonst Eigene, Gerichte oder Schnell
  function fCat(x) {
    var id = x.r && x.r.i, it = id && FOODB[id];
    if (!id) return 'q'; if (/^d/.test(id)) return 'dish'; if (/^u/.test(id)) { var o = fOwn(id); return o && o.cat ? o.cat : 'u'; }
    return it && CATI[it.cat] ? it.cat : 'x';
  }
  function fCats(g) {
    // Einträge einer Mahlzeit nach Kategorie: [{c, l}], Reihenfolge nach dem ersten Eintrag
    var cs = [], cm = {};
    g.l.forEach(function (o) { var c = fCat(o.x); if (!cm[c]) { cm[c] = { c: c, l: [] }; cs.push(cm[c]); } cm[c].l.push(o); });
    return cs;
  }
  function fKc(l) { return Math.round(l.reduce(function (a, o) { return a + (o.x.k || 0); }, 0)); }
  function fMealCard(g, np) {
    // Mahlzeit-Karte: Symbol und Anzahl, kcal groß (auch 4-stellig), darunter die Kategorien als überlappende Kreise (höchstens 3)
    var cs = fCats(g);
    return '<button class="fmc m-' + g.m + '" data-fml="' + g.m + '" aria-label="' + mealOfE(g.l[0].x)[2] + ', ' + g.l.length + ' Einträge, ' + fKc(g.l) + ' kcal"><span class="fmt">' + ic(MEALI[g.m]) + '<small>×' + g.l.length + (np ? ' <i>+' + np + '</i>' : '') + '</small></span><b>' + fKc(g.l) + '<em>kcal</em></b>' +
      '<span class="fcs">' + cs.slice(0, 3).map(function (q) { return '<i>' + ic(CATI[q.c][0]) + '</i>'; }).join('') + '</span></button>';
  }
  function fMeal(g) {
    // Eine Mahlzeit in der Zeile: Zurück-Knopf (Symbol, Uhrzeit), Einträge gleicher Kategorie ab 2 als Stapel mit Anzahl (antippen = aufklappen)
    var pi = fSd() === dayIdx(Date.now()) ? planSum(fSd()).items.filter(function (o) { return o.x.mk === g.m; }) : [];
    return '<button class="fmz m-' + g.m + '" data-fml="" aria-label="Zurück zu allen Mahlzeiten">' + ic('back') + ic(MEALI[g.m]) + '<small>' + hmOf(g.t0) + '</small></button>' +
      (pi.length ? '<button class="fcpi fpm m-' + g.m + '" data-fpe="' + g.m + '"><b>' + ic('check') + 'Geplant</b><small>' + pi.map(function (o) { return esc(o.x.n || 'Mahlzeit'); }).join(', ') + '</small><em>' + Math.round(pi.reduce(function (a, o) { return a + o.x.k; }, 0)) + '<i>kcal</i></em></button>' : '') + fCats(g).map(function (q) {
      if (q.l.length < 2) return fChip(q.l[0]);
      var key = fSd() + g.m + q.c;
      if (ui.fstk[key]) return '<div class="fgrp m-' + g.m + '"><button class="fgx" data-fstk="' + key + '" aria-label="' + CATI[q.c][1] + ' zuklappen">' + ic(CATI[q.c][0]) + '<small>×' + q.l.length + '</small>' + ic('close') + '</button>' + q.l.map(fChip).join('') + '</div>';
      return '<button class="fcpi fstk m-' + g.m + '" data-fstk="' + key + '" data-fdelg="' + q.l.map(function (o) { return o.i; }).join(',') + '"><b>' + ic(CATI[q.c][0]) + esc(CATI[q.c][1]) + '</b><small>' + q.l.length + '× · ' + q.l.map(function (o) { return esc(o.x.n || 'Mahlzeit'); }).join(', ') + '</small><em>' + fKc(q.l) + '<i>kcal</i></em></button>';
    }).join('');
  }


  // Sheets: Suche → Menge, Schnell, eigenes Lebensmittel, Gerichte, Ziele/Rechner
  function shHead(icn, title, sub, back) {
    return '<div class="grab"></div><div class="sh-h">' + (back ? '<button class="x" data-fback="1" aria-label="Zurück">' + ic('back') + '</button>' : '<span class="gi">' + ic(icn) + '</span>') + '<div class="nm"><b>' + esc(title) + '</b><small>' + esc(sub) + '</small></div><button class="x" data-sheet-close aria-label="Schließen">' + ic('close') + '</button></div>';
  }
  // Ein anderes Fenster macht die offene Mahlzeit überflüssig (außer Menge eines ihrer Einträge ändern): sie klappt beim nächsten Zeichnen zu
  function sheetOpen(html, tall) {
    // Offene Mahlzeit sofort zuklappen (auch unter dem Fenster sichtbar), außer beim Ändern eines ihrer Einträge
    if (ui.fmeal && !(ui.sheet && (ui.sheet.fpick || (ui.sheet.food && ui.sheet.idx != null)))) { ui.fmeal = null; if (ui.tab === 'food') { ui.fresh = false; render(); } } if (!$('sheet').classList.contains('open')) shMorph.h = 0; $('sheet').className = 'sheet' + (tall ? ' tall' : ''); $('sheet').style.height = ''; $('sheet').style.minHeight = ''; $('sheet').innerHTML = html; $('shade').classList.add('open'); $('sheet').classList.add('open'); }
  // Alle Fenster: ändert sich die Höhe eines offenen Fensters (anderer Inhalt, auf-/zuklappen), gleitet sie von der alten zur neuen (ResizeObserver misst vor dem Zeichnen);
  // wechselt das Fenster selbst (anderer Titel), blendet der neue Inhalt ein. Frisch geöffnete Fenster gleiten nur hoch (shMorph.h = 0)
  var shMorph = { h: 0, busy: 0, ms: 340, tm: null };
  // Laufendes Gleiten sofort beenden (Schließen, Fenster ziehen): Inline-Höhe und -Übergang weg, damit die CSS-Übergänge wieder gelten
  function shMorphStop() { var s = $('sheet'); clearTimeout(shMorph.tm); if (shMorph.busy) { s.style.height = ''; s.style.transition = ''; } shMorph.busy = 0; shMorph.ms = 340; s.style.minHeight = ''; }
  (function () {
    var s = $('sheet'); if (!s || !window.ResizeObserver) return;
    new ResizeObserver(function () {
      var n = s.offsetHeight, open = s.classList.contains('open');
      if (shMorph.busy) return;
      if (!open || !shMorph.h || Math.abs(n - shMorph.h) < 4 || matchMedia('(prefers-reduced-motion: reduce)').matches) { shMorph.h = open ? n : 0; shMorph.ms = 340; return; }
      shMorph.busy = 1; s.style.height = shMorph.h + 'px'; void s.offsetHeight;
      s.style.transition = 'height ' + shMorph.ms + 'ms var(--drawer), transform .34s var(--drawer)'; s.style.height = n + 'px';
      shMorph.tm = setTimeout(function () { s.style.height = ''; s.style.transition = ''; shMorph.h = s.offsetHeight; shMorph.busy = 0; shMorph.ms = 340; }, shMorph.ms + 20);
    }).observe(s);
    new MutationObserver(function (ms) {
      if (!s.classList.contains('open')) return;
      var old = null; ms.forEach(function (m) { [].forEach.call(m.removedNodes, function (x) { if (x.classList && x.classList.contains('sh-h')) old = x.textContent; }); });
      var cur = s.querySelector('.sh-h'); if (old == null || !cur || cur.textContent === old) return;
      s.classList.remove('sw'); void s.offsetWidth; s.classList.add('sw'); clearTimeout(shMorph.t); shMorph.t = setTimeout(function () { s.classList.remove('sw'); }, 300);
    }).observe(s, { childList: true });
  })();
  function fresSet() { $('fres').innerHTML = fresHtml(); fresFit(); }
  // Zuletzt: bis zu 8, aber nur so viele, wie ohne Scrollen ins Fenster passen
  function fresFit() {
    var s = $('sheet'), r = $('fres'); if (!r || ui.fq.trim() || (ui.ftab || 'r') !== 'r') return;
    // Gerade gleitende Höhe (shMorph) kurz lösen, damit die Endhöhe zählt
    var hs = s.style.height, l = r.querySelectorAll('.fsi'), n = l.length; s.style.height = '';
    while (n > 1 && s.scrollHeight > s.clientHeight + 1) l[--n].remove();
    s.style.height = hs;
  }
  function openFsearch(keep) {
    ui.sheet = { fsearch: true }; ui.fq = ''; ui.fcat = keep ? ui.fcat : ''; if (!keep) ui.ftab = 'c'; ui.fpick = null; if (!ui.fplan) ui.fday = fBack();
    sheetOpen(shHead('search', ui.ingm ? 'Zutat' : 'Eintragen', ui.ingm ? 'Für das Gericht' : 'Lebensmittel oder Gericht suchen', !!ui.ingm) + '<div class="fqw"><input id="fq" class="fnm fq" type="search" placeholder="Suchen, z. B. Skyr" autocomplete="off" aria-label="Suchen"><button class="x" data-fscan="1" aria-label="Barcode scannen">' + ic('scan') + '</button></div><div id="fres" class="fsr">' + fresHtml() + '</div>', true);
    $('sheet').classList.add('fs'); fresFit();
    setTimeout(function () { var i = $('fq'); if (i && !('ontouchstart' in window)) i.focus(); }, 350);
  }
  function fRow(id) {
    // Treffer-Zeile: Kategorie-Icon, Name, übliche Menge (Stück/Portion statt 100 g, Getränke 250 ml) mit allen nennenswerten Nährwerten (≥ 0,5 g), kcal dieser Menge
    var it = fItem(id), uu = !it.dish && !it.pc && it.u.length ? it.u[it.ub && it.u[1] ? 1 : 0] : null, pa = it.dish ? 1 : it.pc ? it.d || it.u[it.ub ? 1 : 0][1] : uu ? uu[1] : it.ml ? 250 : 100, v = fNut(it, pa), ck = it.dish ? 'dish' : CATI[it.cat] ? it.cat : /^u/.test(id) ? 'u' : 'x';
    // Darunter klein die Werte je 100 g (bei Gerichten je Portion) in festen Spalten: die drei, die für die Kategorie zählen (NREL, z. B. Zucker bei Süßem)
    var h100 = it.dish ? v : it, nr = NREL[ck] || NREL.x;
    return '<button class="fsi" data-fpick="' + id + '" style="--cc:' + fTone(id, ck) + '"><i class="fsc">' + ic(fIco(id, ck)) + '</i><span><b>' + esc(fName(it)) + (it.b ? ' <small>' + esc(it.b) + '</small>' : '') + '</b>' +
      '<small class="f100">' + nr.map(function (k) { return '<i style="--nc:var(' + NCOL[k] + ')" aria-label="' + NSH[k] + '">' + ic(NIC[k]) + fN(h100[k] || 0) + '</i>'; }).join('') + '<em>' + (it.dish ? '/Port.' : it.ml ? '/100 ml' : '/100 g') + '</em></small></span>' +
      '<i class="fsk"><b>' + Math.round(v.k) + '<small>kcal</small></b><small>' + (uu ? '1 ' + esc(uu[0]) : fAmt(it, pa)) + '</small></i></button>';
  }
  // Je Kategorie die drei Nährwerte, die beim Auswählen zählen (Suche, Treffer-Zeile)
  var NREL = { g: ['c', 'fb', 'p'], m: ['p', 'f', 'su'], e: ['p', 'f', 'c'], h: ['p', 'fb', 'c'], v: ['c', 'fb', 'su'], o: ['su', 'fb', 'c'], n: ['f', 'p', 'fb'], s: ['su', 'f', 'c'], d: ['su', 'c', 'p'], f: ['f', 'p', 'c'], r: ['p', 'f', 'c'], x: ['p', 'f', 'c'] };
  // Farbe je Hauptkategorie (Gerichte-Karten)
  var CCOL = { g: '#c9a227', m: '#5b8fd6', e: '#c0573e', h: '#9a7b4f', v: 'var(--ac)', o: '#e0a24a', n: '#a0703c', s: 'var(--g-core)', d: 'var(--g-cardio)', f: 'var(--g-push)', r: 'var(--g-mob)', x: 'var(--line)' };
  function fDishCard(x, attr) {
    // Gericht-Karte: Farbe und Icon der Zutat-Kategorie mit den meisten kcal, dazu die Symbole seiner Mahlzeiten; kcal und Makro-Leiste je Portion.
    // Antippen = Menge wählen (dort auch bearbeiten), nach rechts wischen = 1 Portion sofort
    var t = dishTot(x), ck = {}, top = 'x', ms = dishMeals(x);
    x.ing.forEach(function (q) { var it = q.i && FOODB[q.i], c = it ? it.cat : 'x'; ck[c] = (ck[c] || 0) + (+q.a || 0) * (+q.k || 0) / 100; if (c !== 'x' && (top === 'x' || ck[c] > ck[top])) top = c; });
    return '<div class="fdc" style="--dc:' + (CCOL[top] || CCOL.x) + '"><button class="fdcb" ' + (typeof attr === 'string' ? attr : 'data-fpick="' + x.id + '" data-fdsw="' + x.id + '"') + '><i class="fdci">' + ic((CATI[top] || CATI.x)[0]) + ms.map(function (m) { return ic(MEALI[m]); }).join('') + '</i><b>' + esc(x.n) + '</b>' +
      '<i class="fdck">' + Math.round(t.pk) + '<small>kcal</small></i><small class="f100">'
        + [['p', t.pp], ['f', t.pf], ['c', t.pc]].map(function (q) { return '<i style="--nc:var(' + NCOL[q[0]] + ')" aria-label="' + NSH[q[0]] + '">' + ic(NIC[q[0]]) + Math.round(q[1]) + '</i>'; }).join('') + (dishG(x.id) ? '<i class="fdcg">' + Math.round(dishG(x.id) / 5) * 5 + ' g</i>' : '') + '</small></button></div>';
  }
  function dishMeals(x) {
    // Mahlzeiten eines Gerichts: fest gewählt (x.m), sonst die, zu der es meist gegessen wird
    if (x.m && x.m.length) return x.m;
    var mc = {}, ml = null;
    foodState().e.forEach(function (e) { if (e.r && e.r.i === x.id) { var m = mealOfE(e)[1]; mc[m] = (mc[m] || 0) + 1; if (!ml || mc[m] > mc[ml]) ml = m; } });
    return ml ? [ml] : [];
  }
  function fresHtml() {
    // Ohne Suchtext drei Reiter: Zuletzt, Kategorien (antippen = Liste, Zurück oben), Meins (Schnell / Lebensmittel anlegen / Gericht anlegen, Gerichte als Karten, eigene Lebensmittel);
    // mit Suchtext nur die Treffer
    var q = fnorm(ui.fq.trim()), st = foodState(), tab = ui.ftab || 'r', list = [], h = '';
    if (q) {
      var sc = [];
      st.o.map(function (x) { return x.id; }).concat((ui.ingm ? [] : st.d).map(function (x) { return x.id; }), FOODS.filter(function (x) { return !x.vh; }).map(function (x) { return x.id; })).forEach(function (id) {
        var it0 = fItem(id), n = fnorm(fHay(it0)), i = n.indexOf(q); if (i >= 0) sc.push([id, i === 0 ? 0 : n.indexOf(' ' + q) >= 0 ? 1 : 2]);
      });
      sc.sort(function (a, b) { return a[1] - b[1]; });
      // Immer möglich: über den Treffern den Suchtext als Schnell-Eintrag, leicht abgehoben wie ein Vorschlag (nicht beim Zutat fürs Gericht)
      h = (ui.ingm ? '' : '<button class="fsi fqk" data-fquick="1"><i class="fsc">' + ic('bolt') + '</i><span><b>„' + esc(ui.fq.trim().slice(0, 30)) + '“</b><small>Schnell ' + (ui.fplan ? 'einplanen' : 'eintragen') + ' · Werte selbst</small></span>' + ic('chev') + '</button>') +
        (sc.length ? sc.slice(0, 30).map(function (x) { return fRow(x[0]); }).join('') : '<p class="muted">Hier nichts gefunden.</p>');
      h += '<div id="fon">' + fonHtml() + '</div>';
    } else {
      // Schnell gibt es nur noch als Zeile unter den Treffern (Suchtext = Name)
      if (tab === 'q') tab = 'r';
      h = '<div class="seg fst">' + [['r', 'Zuletzt'], ['c', 'Kategorien']].map(function (x) { return '<button data-ftab="' + x[0] + '" aria-pressed="' + (tab === x[0]) + '">' + x[1] + '</button>'; }).join('') + '</div>';
      if (tab === 'r') st.e.slice().sort(function (a, b) { return b.t - a.t; }).forEach(function (x) { if (list.length < 8 && x.r && fItem(x.r.i) && list.indexOf(x.r.i) < 0 && !(ui.ingm && /^d/.test(x.r.i))) list.push(x.r.i); });
      else if (ui.fcat) {
        h += '<button class="fcb" data-fcat="">' + ic('back') + ic(CATI[ui.fcat][0]) + '<b>' + (ui.fcat === 'u' ? 'Eigene' : FCATS.filter(function (c) { return c[0] === ui.fcat; })[0][1]) + '</b></button>';
        // Eigene mit Kategorie (gemerkt) stehen in ihrer Kategorie: mit Unterart in deren Abschnitt, sonst vorn unter „Eigene“.
        // Leiste der Unterarten filtert (ui.fsub), bei „Alle“ Abschnitte mit kleinem Kopf in Icon und Ton der Unterart
        if (ui.fcat === 'u') list = st.o.map(function (x) { return x.id; });
        else {
          var all = st.o.concat(FOODS).filter(function (x) { return x.cat === ui.fcat && !x.vh; }), subs = FSUB.filter(function (s) { return s[0] === ui.fcat; }), fs = ui.fsub && FSUBK[ui.fsub] && FSUBK[ui.fsub][0] === ui.fcat ? ui.fsub : '';
          var secs = [['', 'Eigene', 'user', all.filter(function (x) { return !FSUBK[x.sb]; })]].concat(subs.map(function (s) { return [s[1], s[2], s[3], all.filter(function (x) { return x.sb === s[1]; }), s]; })).filter(function (q) { return q[3].length; });
          if (secs.length > 1) h += '<div class="fsbb" data-noswipe="1"><button data-fsub="" aria-pressed="' + !fs + '">Alle</button>' + secs.filter(function (q) { return q[0]; }).map(function (q) {
            return '<button data-fsub="' + q[0] + '" style="--cc:' + sbTone(q[4]) + '" aria-pressed="' + (fs === q[0]) + '">' + ic(q[2]) + esc(q[1]) + '</button>'; }).join('') + '</div>';
          secs.forEach(function (q) {
            if (fs && q[0] !== fs) return;
            if (!fs && secs.length > 1) h += '<h3 class="fsbh" style="--cc:' + (q[4] ? sbTone(q[4]) : 'var(--ink3)') + '">' + ic(q[2]) + esc(q[1]) + '</h3>';
            h += q[3].map(function (x) { return fRow(x.id); }).join('');
          });
        }
      } else {
        // Kategorien alphabetisch in zwei Spalten, eigene Lebensmittel als eigene Kategorie
        var cl = FCATS.map(function (c) { return [c[0], c[1], st.o.concat(FOODS).filter(function (x) { return x.cat === c[0] && !x.vh; }).length]; }).concat(st.o.length ? [['u', 'Eigene', st.o.length]] : []);
        // Nach Farbe sortiert (warm → kühl), damit das Raster ruhig wirkt
        var CORD = 'e o f g h n r v s m d x';
        h += '<div class="fcl">' + cl.sort(function (a, b) { return CORD.indexOf(a[0]) - CORD.indexOf(b[0]); }).map(function (c) {
          return '<button data-fcat="' + c[0] + '" style="--cc:' + (CCOL[c[0]] || CCOL.x) + '"><i class="fsc">' + ic(CATI[c[0]][0]) + '</i><b>' + c[1] + '</b><small>' + c[2] + '</small>' +
            '<span class="fcsb">' + FSUB.filter(function (s) { return s[0] === c[0]; }).map(function (s) { return '<i style="color:' + sbTone(s) + '">' + ic(s[3]) + '</i>'; }).join('') + '</span></button>';
        }).join('') + '</div>';
      }
      h += list.map(fRow).join('') + (tab === 'r' && !list.length ? '<p class="muted">Noch nichts eingetragen.</p>' : '');
    }
    return h;
  }
