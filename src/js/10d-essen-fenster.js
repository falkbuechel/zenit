  function daysSince(t) { return dayIdx(Date.now()) - dayIdx(t); }
  function openWeight() {
    var st = foodState(), lw = lastW(), td = lw && daysSince(lw.t) === 0;
    ui.sheet = { weight: true };
    sheetOpen(shHead('scale', 'Gewicht', td ? 'Heutigen Wert ändern' : 'Heute wiegen') +
      '<div class="finp one"><label>Gewicht<input id="w-v" type="number" inputmode="decimal" step="0.1" min="20" max="400" value="' + (lw ? lw.kg : '') + '" placeholder="0"><span>kg</span></label></div>' +
      '<button class="btn primary big" data-wsave="1">' + ic('check') + 'Speichern</button>' +
      (st.w.length ? '<div class="wl">' + st.w.slice(-6).reverse().map(function (x) { return '<div><span>' + fmtDayL(dayIdx(x.t)) + '</span><b>' + fN(x.kg) + ' kg</b><button class="xs2" data-wdel="' + x.t + '" aria-label="Löschen">' + ic('close') + '</button></div>'; }).join('') + '</div>' : ''));
    setTimeout(function () { var i = $('w-v'); if (i && !('ontouchstart' in window)) { i.focus(); i.select(); } }, 350);
  }
  // Mahlzeit aus der Uhrzeit: bis 10:30 Frühstück, bis 14:30 Mittag, bis 17:30 Snack, danach Abend; nachts bis 5 Uhr noch Abend
  // Mahlzeiten: [bis Uhrzeit, Schlüssel, Name, übliche Uhrzeit (beim Hineinziehen in eine andere Mahlzeit)]
  var MEALS = [[10.5, 'fr', 'Frühstück', 8], [14.5, 'mi', 'Mittag', 12.5], [17.5, 'sn', 'Snack', 16], [24, 'ab', 'Abend', 19]], MEALI = { fr: 'sun', mi: 'food', sn: 'snack', ab: 'moon' };
  function mealOf(t) { var q = new Date(t), h = q.getHours() + q.getMinutes() / 60; return h < 5 ? MEALS[3] : MEALS.filter(function (m) { return h < m[0]; })[0]; }
  function hmOf(t) { var q = new Date(t); return ('0' + q.getHours()).slice(-2) + ':' + ('0' + q.getMinutes()).slice(-2); }
  function whenRow(t, withDay, mk) {
    // Tag (nur neue Einträge) oben, darunter eine Zeile: Mahlzeit als Symbol-Leiste + Uhrzeit-Pille; die Mahlzeit folgt der Uhrzeit, bis man sie wählt
    var ml = mk || mealOf(t || Date.now())[1];
    return '<div class="fwh">' + (withDay ? dayTog() : '') + '<div class="seg fmk" role="group" aria-label="Mahlzeit"><input type="hidden" id="fmk" value="' + ml + '"' + (mk ? ' data-man="1"' : '') + '>' +
      MEALS.map(function (m) { return '<button type="button" data-fmk="' + m[1] + '" aria-pressed="' + (m[1] === ml) + '" aria-label="' + m[2] + '">' + ic(MEALI[m[1]]) + '</button>'; }).join('') + '</div>' +
      '<label class="ftm">' + ic('clock') + '<b id="ftmv">' + hmOf(t || Date.now()) + '</b><input id="ftm" type="time" value="' + hmOf(t || Date.now()) + '" aria-label="Uhrzeit"></label></div>';
  }
  function whenFor(idx) { var x = idx != null ? foodState().e[idx] : null; return whenRow(x ? x.t : 0, !x, x ? x.mk : ''); }
  function mealOfE(x) { return x.mk ? MEALS.filter(function (m) { return m[1] === x.mk; })[0] || mealOf(x.t) : mealOf(x.t); }
  function dayTog() {
    // Tag als ein Knopf: antippen wechselt Heute → Gestern → (älterer gewählter Tag) → Heute
    var t = dayIdx(Date.now()), b = t - fSd(), o = [0, 1], cur = ui.fday || 0; if (b > 1) o.push(b);
    return '<button type="button" class="fdt" data-fday="' + o[(o.indexOf(cur) + 1) % o.length] + '" aria-label="Tag wechseln">' + ic('cal') + '<b>' + (cur === 0 ? 'Heute' : cur === 1 ? 'Gestern' : esc(fmtDayL(t - cur))) + '</b></button>';
  }
  function lastW() { var w = foodState().w; return w.length ? w[w.length - 1] : null; }

  // Ziele: automatisch (Rechner) oder eigene Werte
  function openGoals() {
    var st = foodState(), pr = st.pr || {}, lw = lastW();
    ui.sheet = { goals: true }; ui.gmode = st.g && !st.g.a ? 'm' : 'a';
    ui.cpr = { h: pr.h || '', a: pr.a || '', s: pr.s || 'm', pal: palOf(pr), rt: rateOf(pr), pkg: pr.pkg || (rateOf(pr) < 0 ? 2.2 : 2), fp: pr.fp || 25, tb: pr.tb === 0 ? 0 : 1, adj: pr.adj || 0, w: lw ? lw.kg : '' };
    sheetOpen(goalsHtml(), true); $('sheet').classList.add('fp'); calcUpd();
  }
  function fN2(x) { return String(Math.round(x * 100) / 100).replace('.', ','); }
  function rateText(r) { return r === 0 ? 'Halten' : (r > 0 ? '+' : '−') + fN2(Math.abs(r)); }
  function goalsHtml() {
    // Ziele im Stil der übrigen Fenster: Nährwert-Icons und -Farben statt Namen, Übernehmen/Speichern unten fixiert
    var c = ui.cpr, g = foodGoal(), h = shHead('calc', 'Rechner', 'Tagesziel für kcal und Nährwerte') + '<div class="seg"><button data-gmode="a" aria-pressed="' + (ui.gmode === 'a') + '">Automatisch</button><button data-gmode="m" aria-pressed="' + (ui.gmode === 'm') + '">Eigene Werte</button></div>';
    if (ui.gmode === 'm') {
      return h + '<div class="ntg">' + NK.map(function (k) { return nTile('g-' + k, k, g[k], k === 'k' || k === 'p'); }).join('') + '</div>' +
        '<p class="muted fnote">Leere Felder rechnet die App aus den kcal (Fett 25 %, Ballaststoffe 14 g je 1000 kcal, Zucker höchstens 10 %).</p><div class="fpgo"><button class="btn primary big" data-fgsave="1">' + ic('check') + 'Speichern</button></div>';
    }
    function crg(id, lab, v, min, max, st, lo, hi, k) { return '<label class="crg"' + (k ? ' style="--nc:var(' + NCOL[k] + ')"' : '') + '><span><i class="crn">' + (k ? ic(NIC[k]) : '') + lab + '</i><b id="c-' + id + 'v"></b></span><input id="c-' + id + '" type="range" min="' + min + '" max="' + max + '" step="' + st + '" value="' + v + '">' + (lo ? '<i class="crl"><em>' + lo + '</em><em>' + hi + '</em></i>' : '') + '</label>'; }
    return h + '<div class="cres" id="c-res"></div>' +
      '<div class="cin"><label>cm<input id="c-h" type="number" inputmode="numeric" value="' + c.h + '"></label><label>Jahre<input id="c-a" type="number" inputmode="numeric" value="' + c.a + '"></label><label>kg<input id="c-w" type="number" inputmode="decimal" step="0.1" value="' + c.w + '"></label>' +
      '<div class="seg"><button data-csx="m" aria-pressed="' + (c.s !== 'f') + '">M</button><button data-csx="f" aria-pressed="' + (c.s === 'f') + '">W</button></div></div>' +
      '<div class="crg"><span>Tempo<b>kg / Woche</b></span><div class="seg six">' + RATES.map(function (r) { return '<button data-crt="' + r + '" aria-pressed="' + (r === c.rt) + '">' + rateText(r) + '</button>'; }).join('') + '</div></div>' +
      crg('pal', 'Alltag', c.pal, 1.2, 1.9, 0.05, 'sitzend', 'körperlich') + crg('pkg', 'Protein', c.pkg, 1.4, 2.6, 0.1, '', '', 'p') + crg('fp', 'Fett', c.fp, 20, 40, 5, '', '', 'f') +
      '<div class="clearn" id="c-learn"></div><details class="cway"><summary>' + ic('chev') + 'Rechenweg</summary><div id="c-way"></div></details>' +
      '<div class="fpgo"><button class="btn primary big" data-cuse="1" id="c-use">' + ic('check') + 'Übernehmen</button></div>';
  }
  function calcRead() {
    var c = ui.cpr; function v(id) { var e = $(id); return e ? parseFloat(e.value) || 0 : 0; }
    if ($('c-h')) { c.h = v('c-h'); c.a = v('c-a'); c.w = v('c-w'); c.pal = v('c-pal') || c.pal; c.pkg = v('c-pkg') || c.pkg; c.fp = v('c-fp') || c.fp; }
    return c;
  }
  function calcUpd() {
    var r = $('c-res'); if (!r) return;
    var c = calcRead(), today = dayIdx(Date.now()), ok = c.h >= 120 && c.a >= 14 && c.w >= 20;
    $('c-palv').textContent = fN2(c.pal); $('c-pkgv').textContent = fN(c.pkg) + ' g/kg'; $('c-fpv').textContent = c.fp + ' %';
    if (!ok) { r.innerHTML = '<p class="muted">Größe, Alter und Gewicht eintragen.</p>'; $('c-learn').innerHTML = ''; $('c-way').innerHTML = ''; $('c-use').disabled = true; return; }
    $('c-use').disabled = false;
    var pr = { h: c.h, a: c.a, s: c.s, pal: c.pal, rt: c.rt, pkg: c.pkg, fp: c.fp, tb: c.tb, adj: c.adj }, rest = calcWith(Object.assign({}, pr, { tb: 0 }), c.w, today);
    var tday = null, tdi = 0; for (var i = 0; i < 8 && !tday; i++) if (schedFor(today + i).length) { tdi = today + i; tday = calcWith(Object.assign({}, pr, { tb: 1 }), c.w, tdi); }
    function sg(v) { return (v >= 0 ? '+' : '−') + Math.abs(Math.round(v)); }
    // Oben (sticky): Ruhetag, Trainingstag mit Kästchen (Zuschlag an/aus), Makros des Ruhetags
    var on = !!(c.tb && tday);
    r.innerHTML = '<div class="ctop"><div class="cday"><small>' + ic('moon') + 'Ruhetag</small><b>' + rest.k + '<em>kcal</em></b></div>' +
      '<button class="cday" data-ctb="1" aria-pressed="' + on + '"' + ' aria-label="Zuschlag an Trainingstagen"><small>' + ic('dumbbell') + 'Training<i class="ctg">' + (on ? ic('check') : '') + '</i></small><b>' + (on ? tday.k : rest.k) + '<em>' + (on ? sg(tday.tb) : 'kcal') + '</em></b></button></div>' +
      '<div class="cmac">' + ['p', 'f', 'c', 'fb', 'su'].map(function (k) { return '<div style="--nc:var(' + NCOL[k] + ')" aria-label="' + NSH[k] + '">' + ic(NIC[k]) + '<b>' + (k === 'su' ? '≤' : '') + rest[k] + '<small>g</small></b></div>'; }).join('') + '</div>';
    // Rechenweg (aufklappbar)
    function row(lab, v, cls) { return '<div' + (cls ? ' class="' + cls + '"' : '') + '><span>' + lab + '</span><b>' + v + '</b></div>'; }
    $('c-way').innerHTML = row('Grundumsatz', Math.round(rest.bmr)) + row('× Alltag ' + fN2(c.pal), Math.round(rest.bmr * c.pal)) +
      (c.rt ? row('Tempo ' + rateText(c.rt) + ' kg/Woche', sg(c.rt * 1100)) : '') + (c.adj ? row('Anpassung aus Verlauf', sg(c.adj)) : '') + row('Ruhetag (gerundet)', rest.k + ' kcal', 'tot') +
      (on ? row('Training ' + esc(fmtDayL(tdi)), sg(tday.tb)) + row('Trainingstag', tday.k + ' kcal', 'tot') : '') +
      row('Protein ' + fN(c.pkg) + ' g × ' + fN(c.w) + ' kg', rest.p + ' g', 'sub') + row('Fett ' + c.fp + ' % der kcal', rest.f + ' g', 'sub') + row('Kohlenhydrate = Rest', rest.c + ' g', 'sub') +
      row('Ballaststoffe 14 g je 1000 kcal', rest.fb + ' g', 'sub') + row('Zucker höchstens 10 %', '≤ ' + rest.su + ' g', 'sub');
    // Echter Bedarf aus Essen + Gewicht (tdeeEst): Abweichung zur Formel wird als Anpassung ins Ziel übernommen
    var e = tdeeEst(pr), L = $('c-learn');
    if (e.off) L.innerHTML = '<div>' + ic('chart') + '<span><b>Echter Bedarf: noch unklar</b><small>Essen und Gewicht passen nicht zusammen (' + e.est + ' statt ' + e.maint + ' kcal). Meist fehlen Einträge.</small></span></div>';
    else if (!e.ok) L.innerHTML = '<div>' + ic('chart') + '<span><b>Echter Bedarf: lernt noch</b><small>aus Essen und Gewicht der letzten 4 Wochen</small><span class="cprg"><i style="--p:' + Math.min(1, e.n / 10).toFixed(2) + '"></i>Tage ' + Math.min(e.n, 10) + '/10</span><span class="cprg"><i style="--p:' + Math.min(1, e.wn / 3).toFixed(2) + '"></i>Wiegen ' + Math.min(e.wn, 3) + '/3</span></span></div>';
    else {
      var diff = e.adj - c.adj;
      L.innerHTML = '<div>' + ic('chart') + '<span><b>Echter Bedarf ≈ ' + e.est + ' kcal</b><small>Formel sagt ' + e.maint + ' kcal. Gemessen aus ' + e.n + ' Tagen Essen und Gewicht (' + (e.wk >= 0 ? '+' : '−') + fN(Math.abs(e.wk)) + ' kg/Woche).</small></span></div>' +
        (Math.abs(diff) >= 50 ? '<button class="btn small" data-cadj="' + e.adj + '">' + ic('check') + 'Ziel um ' + sg(e.adj) + ' kcal anpassen</button>' :
          '<small class="ok">' + ic('check') + (c.adj ? 'Ziel angepasst (' + sg(c.adj) + ' kcal)' : 'Formel passt') + '</small>' + (c.adj ? '<button class="btn ghost small" data-cadj="0">Anpassung entfernen</button>' : ''));
    }
  }
  function goalsSave() {
    var st = foodState(), c = calcRead(), o = Object.assign({}, st.pr || {}, { h: Math.round(c.h), a: Math.round(c.a), s: c.s, pal: c.pal, rt: c.rt, pkg: c.pkg, fp: c.fp, tb: c.tb, adj: c.adj });
    o.go = c.rt > 0 ? 'bulk' : c.rt < 0 ? 'cut' : 'keep'; st.pr = o;
    var kg = Math.round(c.w * 10) / 10, lw = lastW(); if (kg >= 20 && kg <= 400 && (!lw || lw.kg !== kg)) { if (lw && daysSince(lw.t) === 0) lw.kg = kg; else st.w.push({ t: Date.now(), kg: kg }); }
    st.g = { a: 1 }; persist(); closeSheet(true); ui.fresh = false; render(); toast('Ziele: ' + foodGoal().k + ' kcal heute', 'check');
  }

  function fmkSet(v) { $('fmk').value = v; document.querySelectorAll('[data-fmk]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.fmk === v)); }); }
  // Gegessenes gruppieren: je Mahlzeit eine Gruppe (Reihenfolge und Uhrzeit nach dem ersten Eintrag)
  function fGroups(items) {
    var gs = [], gm = {};
    items.slice().sort(function (a, b) { return a.x.t - b.x.t; }).forEach(function (o) { var m = mealOfE(o.x)[1]; if (!gm[m]) { gm[m] = { m: m, t0: o.x.t, l: [] }; gs.push(gm[m]); } gm[m].l.push(o); });
    return gs;
  }
  // Nährwertfarben (wie in der Bilanz) und -Icons statt Namen (Name bleibt als aria-label)
  var NCOL = { k: '--g-push', p: '--g-kh', f: '--g-mob', c: '--g-cardio', fb: '--g-pull', su: '--g-core' }, NIC = { k: 'nk', p: 'np', f: 'nf', c: 'nc', fb: 'nfb', su: 'nsu' };  function fNv(k, v) { return v == null ? '–' : k === 'k' ? String(Math.round(v)) : fN(v); }
  // Nährwert antippen: gleiche Lebensmittel zusammengefasst (×n, gestapelt), sortiert nach diesem Wert, Anteil am Tag als Balken; antippen = übrige Nährwerte darunter (nur ansehen)
  function openNut(k) {
    var sd = fSd(), s = foodSum(sd), g = foodGoal(sd), u = k === 'k' ? ' kcal' : ' g', tot = s[k] || 0, gm = {}, gl = [], unk = 0;
    s.items.forEach(function (o) {
      var x = o.x, key = x.r ? x.r.i : 'n:' + (x.n || ''); if (x[k] == null) unk++;
      if (!gm[key]) { gm[key] = { n: x.n || 'Mahlzeit', c: 0, v: {} }; gl.push(gm[key]); }
      gm[key].c++; NK.forEach(function (j) { if (x[j] != null) gm[key].v[j] = (gm[key].v[j] || 0) + x[j]; });
    });
    var rows = gl.filter(function (q) { return q.v[k] > 0; }).sort(function (a, b) { return b.v[k] - a.v[k]; }).map(function (q) {
      var sh = tot ? q.v[k] / tot : 0;
      // Ring links = Anteil am Tag (Prozent darin), Name mit „n× gegessen“, rechts der Wert
      return '<div class="fnr' + (q.c > 1 ? ' fnrs' : '') + '" data-fnx="1" role="button" tabindex="0" aria-expanded="false"><div class="fnh"><i class="fnp" style="--p:' + sh.toFixed(3) + '" aria-label="' + Math.round(sh * 100) + ' Prozent des Tages">' + Math.round(sh * 100) + '</i>' +
        '<span><b>' + esc(q.n) + '</b>' + (q.c > 1 ? '<small>' + q.c + '× gegessen</small>' : '') + '</span><em>' + fNv(k, q.v[k]) + u + '</em></div>' +
        '<div class="fnd">' + NK.filter(function (j) { return j !== k; }).map(function (j) { return '<span style="--nc:var(' + NCOL[j] + ')" aria-label="' + (j === 'k' ? 'kcal' : NSH[j]) + '">' + ic(NIC[j]) + '<b>' + fNv(j, q.v[j]) + '</b></span>'; }).join('') + '</div></div>';
    }).join('');
    ui.sheet = { nut: k };
    sheetOpen(shHead(NIC[k], (k === 'k' ? 'Kalorien' : NSH[k]) + (sd === dayIdx(Date.now()) ? ' heute' : ''), (k === 'k' ? Math.round(tot) : fN(tot)) + ' / ' + (k === 'su' ? '≤' : '') + g[k] + u) +
      '<div class="fnl" style="--fc:var(' + NCOL[k] + ')"><i class="fnb" style="--p:' + Math.min(1, tot / (g[k] || 1)).toFixed(3) + '"></i>' + (rows || '<p class="muted">Noch nichts mit ' + (k === 'k' ? 'Kalorien' : NSH[k]) + '.</p>') + '</div>' +
      (unk ? '<p class="sh-note">' + unk + (unk === 1 ? ' Eintrag' : ' Einträge') + ' ohne Angabe</p>' : ''), true);
  }
  function fChip(o) {
    // Eintrag-Chip in der Mahlzeit-Zeile: Name, Menge (sonst Uhrzeit), kcal
    var ml = mealOfE(o.x), it = o.x.r && fItem(o.x.r.i);
    return '<button class="fcpi m-' + ml[1] + '" data-fedit="' + o.i + '"><b>' + esc(o.x.n || 'Mahlzeit') + '</b><small>' + (it ? fAmt(it, o.x.r.g) : hmOf(o.x.t)) + '</small><em>' + Math.round(o.x.k) + '<i>kcal</i></em></button>';
  }
  function foodDel(i) {
    // Ein Eintrag (Zahl) oder eine ganze Gruppe (Liste von Indizes, absteigend gelöscht, damit die Indizes stimmen)
    var st = foodState(), l = [].concat(i).filter(function (j) { return j >= 0 && j < st.e.length; }).sort(function (a, b) { return b - a; }); if (!l.length) return; fUndo(); l.forEach(function (j) { st.e.splice(j, 1); });
    persist(); closeSheet(true); ui.fresh = false; render(); toast(l.length > 1 ? l.length + ' Einträge gelöscht' : 'Gelöscht', 'close', true); buzz(10);
  }
  // Rückgängig fürs Essen: Stand vor der Änderung merken (Pfeil im Hinweis, solange er steht)
  function fUndo() { ui.undo = '#' + JSON.stringify(state.food); }
  // Wischen: Vorschlag nach oben ziehen = sofort eintragen (Menge wie angezeigt), Eintrag nach unten ziehen = löschen (mit Rückgängig).
  // Waagerecht bleibt Scrollen der Reihe; ein Wischen löst kein Antippen aus
  var fsw = null, fswMoved = false;
  document.addEventListener('pointerdown', function (ev) { var el = ev.target.closest && ev.target.closest('.fti[data-ftile], .fcpi:not(.fpm)'); fswMoved = false; fsw = el ? { el: el, x: ev.clientX, y: ev.clientY, dy: 0, add: el.classList.contains('fti') } : null; });
  document.addEventListener('pointermove', function (ev) {
    if (!fsw) return; var dx = ev.clientX - fsw.x, dy = ev.clientY - fsw.y;
    // Einträge: waagerecht = Reihe scrollen (Abbruch); Vorschläge dürfen auch schräg gezogen werden
    if (!fswMoved && !fsw.add && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) { fsw = null; return; }
    if (Math.abs(dy) > 6 || (fsw.add && Math.abs(dx) > 8)) fswMoved = true; if (!fswMoved) return;
    // Vorschlag folgt dem Finger frei nach oben; liegt der Finger über einer Mahlzeit (Karte, Platzhalter, Gruppe), wird sie markiert und ist das Ziel
    // Vorschläge folgen dem Finger in jede Richtung (scharf erst ab 44 px nach oben), Einträge nur nach unten (löschen)
    var v = fsw.add ? dy : Math.max(0, Math.min(70, dy)); fsw.dy = v;
    fsw.el.style.transform = fsw.add ? 'translate(' + dx + 'px,' + v + 'px)' : 'translateY(' + v + 'px)'; fsw.armd = fsw.add ? v < -44 : v > 44; fsw.el.classList.toggle('arm', fsw.armd);
    // Eintrag nach unten (löschen): wird gläsern und blendet mit dem Weg aus
    if (!fsw.add) { fsw.el.classList.add('glass'); fsw.el.style.opacity = Math.max(0.25, 1 - v / 90).toFixed(2); }
    if (fsw.add) {
      fsw.el.style.pointerEvents = 'none'; fsw.el.classList.add('glass');
      var open = document.querySelector('.fdl .fmz'), tg;
      if (open) {
        // Eine Mahlzeit ist offen: sie ist das Ziel; sobald scharf, zeigt ein Vorschau-Eintrag hinter dem Zurück-Knopf, was dazukommt
        if (fsw.armd) { if (!fsw.pv) fsw.pv = fPrev(fsw.el, open); tg = fsw.pv; } else { if (fsw.pv) fsw.pv.remove(); fsw.pv = null; tg = null; }
      } else {
        // Ziel = nächste Mahlzeit im Umkreis von 56 px um den Finger (leichter zu treffen); sonst leuchtet die Mahlzeit zur Uhrzeit (dort landet der Vorschlag)
        var best = 56; tg = null;
        document.querySelectorAll('.fdl .fmc, .fdl .fgrp, .fdl .fcpi').forEach(function (e) {
          var r = e.getBoundingClientRect(), ddx = Math.max(r.left - ev.clientX, 0, ev.clientX - r.right), ddy = Math.max(r.top - ev.clientY, 0, ev.clientY - r.bottom), dd = Math.sqrt(ddx * ddx + ddy * ddy);
          if (dd < best) { best = dd; tg = e; }
        });
        if (!tg) tg = document.querySelector('.fdl .fmc.m-' + mealOf(Date.now())[1]);
      }
      if (tg !== fsw.tg) { if (fsw.tg) fsw.tg.classList.remove('drop'); if (tg) tg.classList.add('drop'); fsw.tg = tg; }
    }
  });
  function fPrev(tile, open) {
    // Vorschau-Eintrag (wie ein Chip der Mahlzeit, gestrichelt) direkt hinter dem Zurück-Knopf
    var tl = (ui.ftiles || [])[+tile.dataset.ftile], it = tl && fItem(tl.i); if (!it) return null;
    var el = document.createElement('div'), mm = /\bm-(fr|mi|sn|ab)\b/.exec(open.className);
    el.className = 'fcpi fprev m-' + (mm ? mm[1] : 'fr');
    el.innerHTML = '<b>' + esc(fEn(it)) + '</b><small>' + esc(fAmt(it, tl.g)) + '</small><em>' + Math.round(fNut(it, tl.g).k) + '<i>kcal</i></em>';
    open.parentNode.insertBefore(el, open.nextSibling); buzz(4); return el;
  }
  function fswEnd() {
    if (!fsw) return; var f = fsw; fsw = null; f.el.style.pointerEvents = ''; f.el.classList.remove('glass'); if (f.tg) f.tg.classList.remove('drop'); if (f.pv) f.pv.remove();
    if (f.armd) {
      if (f.add) {
        // Eintragen: abgelegt auf einer Mahlzeit = diese Mahlzeit, sonst nach der aktuellen Uhrzeit
        var j = +f.el.dataset.ftile, tl = (ui.ftiles || [])[j], mm = f.tg && /\bm-(fr|mi|sn|ab)\b/.exec(f.tg.className);
        if (tl) { ui.fday = fBack(); ui.ftok = j; ui.fdmk = mm ? mm[1] : null; buzz([10, 30, 10]); foodRef(tl.i, tl.g); return; }
      } else { f.el.classList.add('gone'); setTimeout(function () { foodDel(f.el.dataset.fdelg ? f.el.dataset.fdelg.split(',').map(Number) : +f.el.dataset.fedit); }, 160); return; }
    }
    f.el.style.transform = ''; f.el.style.opacity = ''; f.el.classList.remove('arm', 'glass');
  }
  // Gerichte-Menü: Karte nach rechts wischen = 1 Portion sofort eintragen
  var fdsw = null, fdswMoved = false;
  document.addEventListener('pointerdown', function (ev) { var el = ev.target.closest && ev.target.closest('[data-fdsw]'); fdswMoved = false; fdsw = el ? { el: el, x: ev.clientX, y: ev.clientY } : null; });
  document.addEventListener('pointermove', function (ev) {
    if (!fdsw) return; var dx = ev.clientX - fdsw.x, dy = ev.clientY - fdsw.y;
    if (!fdswMoved && Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) { fdsw = null; return; }
    if (dx > 14) fdswMoved = true; if (!fdswMoved) return;
    var v = Math.max(0, Math.min(90, dx)); fdsw.dx = v; fdsw.el.style.transform = 'translateX(' + v + 'px)'; fdsw.el.classList.toggle('arm', v > 60);
  });
  document.addEventListener('pointerup', function () {
    if (!fdsw) return; var f = fdsw; fdsw = null; f.el.style.transform = ''; f.el.classList.remove('arm');
    if (f.dx > 60) { ui.fday = fBack(); buzz([10, 30, 10]); closeSheet(true); foodRef(f.el.dataset.fdsw, 1); }
  });
  document.addEventListener('pointercancel', function () { if (fdsw) { fdsw.el.style.transform = ''; fdsw.el.classList.remove('arm'); fdsw = null; } });
  // Gerichte-Fenster: Karte kurz halten (0,17 s), dann ziehen. Das Fenster gleitet nach unten weg (Kante bleibt), die Mahlzeiten oben leuchten;
  // ablegen = 1 Portion in diese Mahlzeit, danach gleitet das Fenster wieder hoch. Vorher bewegt = normales Scrollen/Wischen
  var fdg = null;
  document.addEventListener('pointerdown', function (ev) {
    var el = ui.tab === 'food' && ui.sheet && ui.sheet.fdishes && ev.target.closest && ev.target.closest('[data-fdsw]'); if (!el) { fdg = null; return; }
    var g0 = fdg = { el: el, x: ev.clientX, y: ev.clientY, on: false, tg: null };
    g0.t = setTimeout(function () {
      if (fdg !== g0) return; g0.on = true; fdsw = null; buzz(8);
      var r = el.getBoundingClientRect(), gh = el.cloneNode(true); gh.className = 'fdcb fdgh'; gh.removeAttribute('data-fpick'); gh.removeAttribute('data-fdsw');
      // Farbe der Karte (Hauptzutat) roh übernehmen (z. B. „var(--g-pull)“), damit das Glas getönt ist
      gh.style.cssText = 'left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;height:' + r.height + 'px;--dc:' + (el.parentNode.style.getPropertyValue('--dc') || 'var(--ac)');
      document.body.appendChild(gh); g0.gh = gh; $('sheet').classList.add('peek'); $('shade').classList.add('peek');
    }, 170);
  });
  document.addEventListener('pointermove', function (ev) {
    if (!fdg) return; var dx = ev.clientX - fdg.x, dy = ev.clientY - fdg.y;
    if (!fdg.on) { if (Math.abs(dx) > 8 || Math.abs(dy) > 8) { clearTimeout(fdg.t); fdg = null; } return; }
    fdg.gh.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(1.04)';
    var best = 56, tg = null;
    document.querySelectorAll('.fdl .fmc').forEach(function (e) {
      var r = e.getBoundingClientRect(), ax = Math.max(r.left - ev.clientX, 0, ev.clientX - r.right), ay = Math.max(r.top - ev.clientY, 0, ev.clientY - r.bottom), dd = Math.sqrt(ax * ax + ay * ay);
      if (dd < best) { best = dd; tg = e; }
    });
    if (tg !== fdg.tg) { if (fdg.tg) fdg.tg.classList.remove('drop'); if (tg) { tg.classList.add('drop'); buzz(4); } fdg.tg = tg; }
  });
  function fdgEnd(ev) {
    if (!fdg) return; var g = fdg; fdg = null; clearTimeout(g.t); if (!g.on) return;
    ui.fdgno = Date.now(); if (g.gh) g.gh.remove(); if (g.tg) g.tg.classList.remove('drop');
    $('sheet').classList.remove('peek'); $('shade').classList.remove('peek');
    var mm = g.tg && ev.type !== 'pointercancel' && /\bm-(fr|mi|sn|ab)\b/.exec(g.tg.className); if (!mm) return;
    ui.fday = fBack(); ui.fdmk = mm[1]; buzz([10, 30, 10]); foodRef(g.el.dataset.fdsw, 1);
    setTimeout(function () { if (!ui.sheet && ui.tab === 'food') openDishes(); }, 260);
  }
  document.addEventListener('pointerup', fdgEnd);
  document.addEventListener('pointercancel', fdgEnd);
  document.addEventListener('touchmove', function (ev) { if (fdg && fdg.on) ev.preventDefault(); }, { passive: false });
  var fsT = null;
  // iOS: beim Ziehen nicht scrollen. Kacheln (Essen-Vorschläge, Planen-Kacheln) in jede Richtung, Einträge nur senkrecht
  document.addEventListener('touchstart', function (ev) {
    var el = ev.target.closest && ev.target.closest('.fti[data-ftile], .fcpi:not(.fpm)' + (ui.sheet ? '' : ', .ptv[data-ptd], .fti[data-pfd], .fti[data-ptp]'));
    fsT = el ? { x: ev.touches[0].clientX, y: ev.touches[0].clientY, v: null, tile: !el.classList.contains('fcpi') } : null;
  }, { passive: true });
  document.addEventListener('touchmove', function (ev) {
    if (!fsT) return; var dx = ev.touches[0].clientX - fsT.x, dy = ev.touches[0].clientY - fsT.y;
    if (fsT.v === null && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) fsT.v = Math.abs(dy) > Math.abs(dx);
    if (fsT.v || (fsT.tile && fsT.v !== null)) ev.preventDefault();
  }, { passive: false });
  document.addEventListener('pointerup', fswEnd);
  // Abgebrochene Geste (iOS-Systemgeste, Anruf): nur zurücksetzen, nie löschen oder eintragen
  document.addEventListener('pointercancel', function () { if (fsw) { fsw.el.style.transform = ''; fsw.el.style.pointerEvents = ''; fsw.el.style.opacity = ''; fsw.el.classList.remove('arm', 'glass'); if (fsw.tg) fsw.tg.classList.remove('drop'); if (fsw.pv) fsw.pv.remove(); fsw = null; } });
