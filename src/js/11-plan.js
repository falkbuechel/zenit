  // ---------- Plan-Tab
  function lockPct(e, d) {
    // Fortschritt zum Freischalten: Mittel über alle Bedingungen (jede auf 100 % gedeckelt)
    var r = e.req || []; if (!r.length) return 100;
    return Math.round(r.reduce(function (s, q) { return s + reqLine(q, d).pct; }, 0) / r.length);
  }
  function ring(p) {
    return '<span class="ring" aria-label="' + p + ' %"><svg viewBox="0 0 36 36" aria-hidden="true"><circle class="rb" cx="18" cy="18" r="15"/><circle class="rf" cx="18" cy="18" r="15" pathLength="100" style="stroke-dasharray:' + p + ' 100"/></svg><b>' + p + '</b></span>';
  }
  function peList(d, day) {
    // Verfügbare Übungen je Gruppe mit Schalter; gesperrte immer ganz unten, ohne Schalter, mit Fortschrittsring. Antippen zeigt, was fehlt
    var q = ui.pq.trim().toLowerCase(), h = '', locked = [];
    function hit(e) { return (ui.pf === 'all' || e.g === ui.pf) && (!q || (e.n + ' ' + e.mu).toLowerCase().indexOf(q) >= 0); }
    GORDER.forEach(function (g) {
      var list = EX.filter(function (e) { return e.g === g && hit(e); });
      locked = locked.concat(list.filter(function (e) { return !d.unlocked[e.id]; }));
      list = list.filter(function (e) { return d.unlocked[e.id]; });
      if (!list.length) return;
      var on = list.filter(function (e) { return day.ex.indexOf(e.id) >= 0; }).length;
      h += '<section class="exg g' + g + '"><h3 class="xg">' + ic(gOf(g).i) + gOf(g).n + '<small>' + on + ' von ' + list.length + '</small></h3><div class="exl">' + list.map(function (e) {
        return '<button class="exr" data-ptog="' + e.id + '" aria-pressed="' + (day.ex.indexOf(e.id) >= 0) + '"><span><b class="' + fitCls(e.n, 16) + '">' + esc(e.n) + '</b><small>' + esc(e.mu) + '</small></span><i>' + ic('check') + '</i></button>';
      }).join('') + '</div></section>';
    });
    if (locked.length) {
      locked.sort(function (x, y) { return lockPct(y, d) - lockPct(x, d); });
      h += '<section class="exg"><h3 class="xg lkh">' + ic('lock') + 'Gesperrt<small>' + locked.length + '</small></h3><div class="exl">' + locked.map(function (e) {
        var open = ui.plk === e.id;
        return '<div class="exk g' + e.g + (open ? ' open' : '') + '"><button class="exr lk" data-plk="' + e.id + '" aria-expanded="' + open + '"><span><b class="' + fitCls(e.n, 12) + '">' + ic(gOf(e.g).i) + esc(e.n) + '</b><small>' + esc(e.mu) + '</small></span>' + ring(lockPct(e, d)) + '</button>' +
          '<div class="agx"><div><div class="lkd">' + e.req.map(function (r) {
            var x = reqLine(r, d);
            return '<div class="lkr' + (x.ok ? ' ok' : '') + '"><span>' + ic(x.ok ? 'check' : 'target') + esc(x.name) + '</span><small>' + Math.min(x.cur, x.need) + ' / ' + x.need + ' ' + esc(x.u) + '</small><i class="pdp"><i style="width:' + x.pct + '%"></i></i></div>';
          }).join('') + (day.ex.indexOf(e.id) >= 0 ? '<p class="agp">' + ic('check') + 'Kommt automatisch in diesen Plan, sobald frei.</p>' : '') + '</div></div></div></div>';
      }).join('') + '</div></section>';
    }
    return h || '<p class="muted">Nichts gefunden.</p>';
  }
  function durEst() {
    // Geschätzte Minuten je Trainingstag: Mittel der letzten Einheiten, an denen genau dieser Tag geplant war
    var m = {}, o = {};
    state.logs.forEach(function (l) {
      if (l.e !== 'sess') return;
      var sc = schedFor(dayIdx(l.t));
      if (sc.length === 1) (m[sc[0].id] = m[sc[0].id] || []).push(l.s[0]);
    });
    Object.keys(m).forEach(function (k) {
      var a = m[k].slice(-6); if (a.length < 2) return;
      o[k] = Math.max(5, Math.round(a.reduce(function (s, x) { return s + x; }, 0) / a.length / 300) * 5);
    });
    return o;
  }
  function calMove(dir) {
    // Woche: 7 Tage weiter, 3 Wochen: 3 Wochen, 5 Wochen: 4 Wochen. Grenzen: 6 Monate zurück, 6 voraus
    var today = dayIdx(Date.now()), a = ui.ca == null ? today : ui.ca;
    var n = a + dir * [7, 21, 28][ui.cm || 0];
    if (n < today - 183 || n > today + 183) return false;
    ui.ca = n; ui.cdir = dir; ui.fresh = false; render(); return true;
  }
  function calMon(lv) {
    // 0 = Woche, 1 = 3 Wochen, 2 = 5 Wochen; der Kalender gleitet von der alten zur neuen Höhe
    var c0 = document.querySelector('.pcal2'), h0 = c0 ? c0.offsetHeight : 0;
    ui.cm = Math.max(0, Math.min(2, lv)); ui.ca = ui.pd == null ? dayIdx(Date.now()) : ui.pd; ui.cmx = true; ui.fresh = false; render(); buzz(4);
    var c = document.querySelector('.pcal2'); if (!c || !h0 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var h1 = c.offsetHeight; c.style.height = h0 + 'px'; c.style.overflow = 'hidden'; void c.offsetHeight;
    c.style.transition = 'height .38s var(--drawer)'; c.style.height = h1 + 'px';
    setTimeout(function () { c.style.height = ''; c.style.overflow = ''; c.style.transition = ''; }, 400);
  }
  function lastBest(e, before) {
    var l = lastBefore(e.id, before); if (!l) return '';
    return Math.max.apply(null, l.s) + (e.u === 'Wdh.' ? '' : e.u === 'Sek.' ? 's' : ' ' + e.u);
  }
  function defIds(di) { return plan().days.filter(function (x) { return onDay(x, di); }).map(function (x) { return x.id; }); }
  function ovF(di) {
    // Ausnahme eines Datums als Bausteine: s = ausgesetzt, w/b = getauscht mit Tag w (übernimmt dessen Training b), r = ersetzt durch, a = zusätzlich
    var P = plan(), o = P.ovk && P.ovk[di];
    if (o && typeof o === 'object') return JSON.parse(JSON.stringify(o));
    return P.ov && P.ov[di] !== undefined ? (P.ov[di].length ? { r: P.ov[di].slice() } : { s: 1 }) : {};
  }
  function ovSetF(di, f) {
    // Bausteine speichern und daraus die Trainingstage berechnen; ohne Bausteine gilt wieder der Plan
    var P = plan(); P.ov = P.ov || {}; P.ovk = P.ovk || {};
    if (f.a && !f.a.length) delete f.a; if (f.r && !f.r.length) delete f.r;
    if (!f.s && f.w === undefined && !f.r && !f.a) { delete P.ov[di]; delete P.ovk[di]; return; }
    var base = f.s ? [] : f.w !== undefined ? f.b : f.r || defIds(di);
    P.ov[di] = f.s ? [] : base.concat((f.a || []).filter(function (id) { return base.indexOf(id) < 0; }));
    P.ovk[di] = f;
  }
  function swapClear(di) {
    var f = ovF(di); if (f.w === undefined) return;
    var t = f.w, g = ovF(t); delete f.w; delete f.b; ovSetF(di, f);
    if (g.w === di) { delete g.w; delete g.b; ovSetF(t, g); }
  }
  function swapOk(sd, t, today) {
    // Tauschpartner: ab heute, kein Urlaub/Krank, nicht derselbe Tag und nicht dasselbe Training
    return t !== sd && t >= today && !offAt(t) && schedFor(t).map(function (x) { return x.id; }).sort().join() !== schedFor(sd).map(function (x) { return x.id; }).sort().join();
  }
  function dayEdit(P, sd, sc, today) {
    // Tag ändern: jede Aktion schaltet sich beim zweiten Tippen wieder aus, daher kein Zurücksetzen
    var m = ui.pmode, f = ovF(sd), off = offAt(sd), cur = sc.map(function (x) { return x.id; }), h;
    var fon = { swap: f.w !== undefined, skip: !!f.s, repl: !!f.r, add: !!f.a };
    // Tag ändern (Knopf im Kalender): Training ändern ab heute und außerhalb von Urlaub/Krank, Urlaub/Krank immer
    // Kacheln mit Farbkante wie Gerichte/Workouts: oben Training (vier schmale), darunter Abwesend (Urlaub gold, Krank rot, breit); aktiv = Ton der Farbe, gewählt = kräftiger
    var tra = sd >= today && !off ? [['swap', 'swap', 'Tauschen', '--g-kh'], ['skip', 'skip', 'Aussetzen', '--ink3'], ['repl', 'repl', 'Ersetzen', '--g-pull'], ['add', 'plus', 'Dazu', '--ac']] : [];
    function tile(a) {
      var on = a[0] === 'vac' || a[0] === 'sick' ? off && off.k === a[0] : fon[a[0]];
      return '<button data-pmode="' + a[0] + '" style="--ec:var(' + a[3] + ')" aria-pressed="' + (m === a[0]) + '"' + (on ? ' class="act"' : '') + '>' + ic(a[1]) + '<span>' + a[2] + '</span>' + (on ? ic('check', 'pdk') : '') + '</button>';
    }
    h = (tra.length ? '<div class="pda">' + tra.map(tile).join('') + '</div>' : '') + '<div class="pda pdo">' + [['vac', 'beach', 'Urlaub', '--gold'], ['sick', 'sick', 'Krank', '--danger']].map(tile).join('') + '</div>';
    function dchip(attr, x) { return '<button ' + attr + ' style="--pc:var(' + PCOL[x.c] + ')">' + ic(dIcon(x)) + esc(x.n) + '</button>'; }
    if (m === 'swap') h += '<p class="pdh">' + ic('swap') + 'Tag im Kalender wählen</p>';
    if (m === 'repl') h += '<div class="pdm ptg">' + P.days.filter(function (x) { return cur.indexOf(x.id) < 0; }).map(function (x) { return dchip('data-preplx="' + x.id + '"', x); }).join('') + '</div>';
    // Zusätzlich: alle, die nicht schon regulär dran sind; schon zugefügte sind gewählt (antippen = wieder weg), beliebig viele
    if (m === 'add') h += '<div class="pdm ptg">' + P.days.filter(function (x) { return cur.indexOf(x.id) < 0 || (f.a || []).indexOf(x.id) >= 0; }).map(function (x) { return dchip('data-paddx="' + x.id + '" aria-pressed="' + ((f.a || []).indexOf(x.id) >= 0) + '"', x); }).join('') + '</div>';
    if (m === 'vac' || m === 'sick') h += '<div class="pdm pdur">' + [1, 2, 3, 5, 7, 14].map(function (n) { return '<button data-poff="' + n + '"><b>' + n + '</b><span>' + (n === 1 ? 'Tag' : 'Tage') + '</span></button>'; }).join('') + '</div>';
    return h;
  }
  function viewPlan(d, now) {
    var today = dayIdx(now), P = plan();
    var NT = ui.nts || [], dur = durEst(), sd = ui.pd == null ? today : ui.pd, a = ui.ca == null ? today : ui.ca, k;
    function nt(x) { return NT.filter(function (n) { return n.k === x; })[0]; }
    // Hinweise (auch neue Übungen frei) stehen gesammelt hinter der Glocke, nicht unten auf der Seite
    var todo = ['st', 'tr', 'wg', 'f0', 'fp', 'ux'].map(nt).filter(Boolean), wk = nt('wk');
    // Kein Titel (wie Essen): der Bereich ergibt sich aus der unteren Leiste
    var h = '';

    // Kalender: Woche Mo–So, 3 oder 5 Wochen (Woche des Tags in der Mitte). Bedeutung über Füllung und Kontur statt Zeichen, nichts liegt übereinander:
    // Kachel gefüllt = Serie (Trainingstage mit höchstens einem Ruhetag dazwischen, Urlaub/Krank zählt nicht; volle Woche gold), Kontur um die Kacheln = Urlaub/Krank;
    // Kreis voll = an dem Tag trainiert, hell in Workout-Farbe = geplant (+n mehrere), Ring außen = Essen (dayFood), Punkt oben rechts = Tausch (Farbe des Paars)
    var q = new Date(a * 864e5), w0 = a - wdOf(a), from = w0 - [0, 7, 14][ui.cm || 0], to = from + [7, 21, 35][ui.cm || 0] - 1;
    var title = q.toLocaleDateString('de-DE', { month: 'long', timeZone: 'UTC' });
    var rows = '', swp = ui.pmode === 'swap', pairs = [];
    for (k = from; k <= to; k++) { var fw = ovF(k).w; if (fw !== undefined && pairs.indexOf(Math.min(k, fw)) < 0) pairs.push(Math.min(k, fw)); }
    pairs.sort(function (x, y) { return x - y; });
    function offK(x) { return (P.off || []).filter(function (o) { return o.a <= x && o.b >= x; }).map(function (o) { return o.k; }).filter(function (v, i, r) { return r.indexOf(v) === i; }).sort().join(' '); }
    var band = {}, tds = [], i0, j0;
    for (k = from - 14; k <= to; k++) if (d.byDay[k]) tds.push(k);
    for (i0 = 0; i0 < tds.length; i0 = j0 + 1) {
      j0 = i0; while (j0 + 1 < tds.length && tds[j0 + 1] - tds[j0] - offCount(tds[j0] + 1, tds[j0 + 1] - 1) <= 2) j0++;
      if (j0 > i0) for (k = tds[i0]; k <= tds[j0]; k++) band[k] = 1;
    }
    for (var r0 = from; r0 <= to; r0 += 7) {
      var cells = '', due = 0, hit = 0;
      for (k = r0; k < r0 + 7; k++) if (schedFor(k).length) { due++; if (d.byDay[k]) hit++; }
      for (k = r0; k < r0 + 7; k++) {
        var ds = schedFor(k), tr = d.byDay[k], fk = ovF(k), pk = swp ? (swapOk(sd, k, today) ? ' pick' : ' nop') : '', dk = offK(k);
        var pi = fk.w !== undefined ? pairs.indexOf(Math.min(k, fk.w)) : -1, pl = !tr && !fk.s && ds.length && k >= today;
        var sb = band[k] ? ' pser' + (due && hit === due ? ' gold' : '') + (k > r0 && band[k - 1] ? ' pjl' : '') + (k < r0 + 6 && band[k + 1] ? ' pjr' : '') : '';
        var so = dk ? ' off ' + dk + (k === r0 || offK(k - 1) !== dk ? ' os' : '') + (k === r0 + 6 || offK(k + 1) !== dk ? ' oe' : '') : '';
        cells += '<button class="pc2' + pk + (k === today ? ' today' : k < today ? ' past' : ' fut') + (k === sd ? ' sel' : '') + sb + so + '" data-cday="' + k + '"' + (pl ? ' style="--pc:var(' + PCOL[ds[0].c] + ')"' : '') +
          ' aria-label="' + fmtDayL(k) + (tr ? ', trainiert' : pl ? ', ' + esc(ds.map(function (x) { return x.n; }).join(', ')) : '') + (dk === 'vac' ? ', Urlaub' : dk ? ', krank' : '') + '">' +
          (ui.cm ? '' : '<small>' + WDN[wdOf(k)].slice(0, 2) + '</small>') + '<b' + (tr ? ' class="dn"' : pl ? ' class="pl"' : '') + '>' + dayFood(k, today) + new Date(k * 864e5).getUTCDate() + '</b>' +
          (pi >= 0 ? '<i class="pcx" style="--sc:var(' + ['--g-cardio', '--g-core', '--g-pull', '--g-kh'][pi % 4] + ')"></i>' : '') + (pl && ds.length > 1 ? '<i class="pcn">+' + (ds.length - 1) + '</i>' : '') + '</button>';
      }
      rows += '<div class="pc2-r"><div class="pc2-c">' + cells + '</div></div>';
    }
    // Kopf: Monat links (antippen = 3/5 Wochen/Woche), rechts die Serie und die Glocke (Zu tun). Tag ändern sitzt an der Überschrift des Tags
    var nts0 = todo.length, srk = streakInfo(now);
    h += '<section class="pcal2 rise' + (ui.cm ? ' mon' : '') + '" style="--i:1"><div class="pc2-h">' +
      '<button class="pc2-t" data-cmode="1" aria-expanded="' + (ui.cm === 2) + '" aria-label="' + ['3 Wochen zeigen', '5 Wochen zeigen', 'Woche zeigen'][ui.cm || 0] + '"><b>' + title + '</b><small>' + q.getUTCFullYear() + '</small>' + ic('chev') + '</button>' +
      (srk.n >= 2 ? '<span class="pc2-s" aria-label="Serie: ' + srk.n + ' Trainingstage">' + FL + srk.n + '</span>' : '') +
      (nts0 ? '<button class="x pd-n" data-pnts="1" aria-label="' + nts0 + ' Hinweise">' + ic('bell') + '<i>' + nts0 + '</i></button>' : '') + '</div>' +
      (ui.cm ? '<div class="pc2-w">' + WDN.map(function (n) { return '<span>' + n + '</span>'; }).join('') + '</div>' : '') +
      '<div class="pc2-g' + (swp ? ' swp' : '') + (ui.cdir ? (ui.cdir > 0 ? ' in-r' : ' in-l') : '') + (ui.cmx ? ' in-m' : '') + '">' + rows + '</div>' +
      (wk ? '<p class="pc2-n">' + ic('cal') + esc(wk.t) + ' · ' + esc(wk.s) + '</p>' : '') + '</section>';
    ui.cdir = 0; ui.cmx = false;

    // Der gewählte Tag wie in Essen: Karte = Bilanz des Tags (Training führt, kcal als schmale Zeile), darunter Überschrift des Tags und die vier Mahlzeiten
    var sc = schedFor(sd), st = d.byDay[sd], off = offAt(sd), fd = ovF(sd), kd = fd.s ? 'skip' : fd.w !== undefined ? 'swap' : fd.r ? 'repl' : '', c = '', shown = {};
    if (swp) c += '<p class="pdh">' + ic('swap') + 'Tag im Kalender wählen<button class="x" data-pmode="swap" aria-label="Tauschen abbrechen">' + ic('close') + '</button></p>';
    if (kd && !off) {
      var was = P.days.filter(function (x) { return onDay(x, sd); }), pt = fd.w !== undefined ? fd.w : null;
      c += '<div class="pwas">' + ic(kd === 'skip' ? 'skip' : kd === 'swap' ? 'swap' : 'repl') + '<span>' + (kd === 'skip' ? 'Ausgesetzt' : kd === 'swap' ? 'Getauscht' + (pt !== null ? ' mit ' + WDN[wdOf(pt)] + ' ' + fmtShort(pt) : '') : 'Statt') + '</span>' +
        (was.length ? was.map(function (x) { return '<s style="--pc:var(' + PCOL[x.c] + ')">' + ic(dIcon(x)) + esc(x.n) + '</s>'; }).join('') : '<s>' + ic('snow') + 'Frei</s>') + '</div>';
    }
    if (off) c += '<div class="pdb off"><div class="pdb-h"><span class="pdi">' + ic(off.k === 'vac' ? 'beach' : 'sick') + '</span><span class="nm"><b>' + (off.k === 'vac' ? 'Urlaub' : 'Krank') + '</b><small>' + fmtShort(off.a) + ' – ' + fmtShort(off.b) + ' · Serie geschützt</small></span></div></div>';
    // Workout als Zeile: Symbol, Name groß, Übungen (bis heute mit Haken und Fortschritt), Minuten; antippen = Übungsliste auf/zu
    sc.forEach(function (x) {
      var ids = sortIds(x.ex.filter(function (id) { return d.unlocked[id]; })), dn = ids.filter(function (id) { return st && st.ex[id]; }).length, key = sd + ':' + x.id, open = !!ui.pdo[key];
      ids.forEach(function (id) { shown[id] = 1; });
      c += '<div class="pdb' + (open ? ' open' : '') + '" style="--pc:var(' + PCOL[x.c] + ')"><button class="pdb-h" data-pdb="' + key + '" aria-expanded="' + open + '"><span class="pdi">' + ic(dIcon(x)) + '</span><span class="nm"><b>' + esc(x.n) + '</b><small>' +
        (sd <= today ? dn + '/' : '') + ids.length + ' Übungen</small>' + (sd <= today && ids.length ? '<i class="pdp"><i style="width:' + Math.round(dn / ids.length * 100) + '%"></i></i>' : '') + '</span>' +
        (dur[x.id] ? '<em class="pdmn">' + dur[x.id] + '′</em>' : '') + ic('chev', 'chv') + '</button>' +
        '<div class="agx"><div><div class="pdl">' + ids.map(function (id) {
          var e = EXB[id], ok = !!(st && st.ex[id]), lb = lastBest(e, sd);
          return '<div class="pdr' + (ok ? ' ok' : '') + '">' + ic(ok ? 'check' : 'dash') + '<span>' + esc(e.n) + '</span><small>' + esc(goalText(e)) + (lb ? '<br>zul. ' + esc(lb) : '') + '</small></div>';
        }).join('') + '</div></div></div></div>';
    });
    if (!sc.length && !off) c += '<div class="pdb rest"><div class="pdb-h"><span class="pdi">' + ic('snow') + '</span><span class="nm"><b>Frei</b><small>' + (kd === 'skip' ? 'Training ausgesetzt' : sd >= today ? 'Erholung' : 'Kein Training geplant') + '</small></span></div></div>';
    var extra = st ? Object.keys(st.ex).filter(function (id) { return !shown[id]; }) : [];
    if (extra.length) c += '<p class="agp">Außerdem: ' + extra.map(function (id) { return esc(EXB[id].n); }).join(' · ') + '</p>';
    h +='<section class="pday dkc rise' + (ui.pfl === sd ? ' fl' : '') + (ui.pdx ? ' in-d' : '') + '" style="--i:2">' + c + '</section>';
    // Überschrift des Tags (wie „Freitag · Heute“ in Essen): Rückgängig, Workout dazu, Tag ändern (Urlaub, Krank, Tauschen, Aussetzen …). Essen planen liegt in Essen
    var evS = off || fd.s || fd.w !== undefined || fd.r || fd.a, canX = sd >= today && !off && P.days.some(function (x) { return !sc.some(function (y) { return y.id === x.id; }); });
    h += '<section class="pdm2 rise' + (ui.pdx ? ' in-d' : '') + '" style="--i:3"><h2 class="sec-h">' + esc(dayHead(sd)) + '<span class="pdhk">' +
      (ui.undo && ui.undo.charAt(0) === '#' ? '<button class="x" data-undo="1" aria-label="Rückgängig">' + ic('undo') + '</button>' : '') +
      (canX ? '<button class="x" data-padd="1" aria-label="Workout an diesem Tag">' + ic('plus') + '</button>' : '') +
      '<button class="x pc2-ev' + (evS ? ' on' : '') + '" data-pdedit="1" aria-label="Tag ändern: Urlaub, Krank, Tauschen, Aussetzen">' + ic('calev') + '</button></span></h2></section>';
    ui.pfl = null; ui.pdx = false;

    // Ablage: Workouts. Antippen = bearbeiten (Wochentage, Rhythmus, Übungen), hochziehen auf Kalendertag oder Tageskarte = nur an diesem Datum
    var tl = P.days.map(function (x) {
      var n = x.ex.filter(function (id) { return d.unlocked[id]; }).length;
      return '<button class="ptv" data-pedit="' + x.id + '" data-ptd="' + x.id + '" style="--pc:var(' + PCOL[x.c] + ')" aria-label="' + esc(x.n) + ' bearbeiten, hochziehen auf einen Tag = zusätzlich"><i class="ptvi">' + ic(dIcon(x)) + '</i>' +
        '<b class="' + fitCls(x.n, 8) + '">' + esc(x.n) + '</b><small>' + n + (dur[x.id] ? ' · ' + dur[x.id] + '′' : ' Üb.') + '</small></button>';
    }).join('') + (P.days.length < 8 ? '<button class="fti tplnew" data-pnew="1" aria-label="Neues Workout">' + ic('plus') + '<small>Neues<br>Workout</small></button>' : '');
    h += '<section class="pwks rise" style="--i:4"><div class="ftl ptl2" data-noswipe="1">' + tl + '</div></section>';

    return h;
  }
  // ---------- Essen-Vorlagen (food.tp): [{id, n, k: 'm' (Mahlzeit, mk) | 'd' (Tag), it: [{i, g, mk?}]}]
  function tplKcal(t) { return Math.round(t.it.reduce(function (a, q) { var it = fItem(q.i); return a + (it ? fNut(it, q.g).k || 0 : 0); }, 0)); }
  function tplTiles(sd) {
    // Kacheln: Mahlzeit-Vorlagen in der Farbe ihrer Mahlzeit, Tages-Vorlagen neutral mit Kalender-Symbol; dazu gestrichelt „Tag als Vorlage“ (wenn der Tag geplant ist).
    // Im Löschmodus (Mülleimer-Kachel) löscht Antippen eine Vorlage
    var tp = foodState().tp, del = ui.tpdel, dayHas = planSum(sd).items.some(function (o) { return o.x.r; });
    // Getrennt in „Ganze Tage“ und „Mahlzeiten“; Tages-Kachel zeigt die enthaltenen Mahlzeiten als Symbole, Mahlzeit-Kachel den Namen der Mahlzeit
    function tile(t) {
      var mks = t.k === 'd' ? MEALS.filter(function (m) { return t.it.some(function (q) { return q.mk === m[1]; }); }) : [];
      return '<button class="fti q-m tpl' + (t.k === 'm' ? ' m-' + t.mk : ' tpd') + (del ? ' tdel' : '') + '" data-ptp="' + t.id + '" aria-label="' + (t.k === 'd' ? 'Tages' : 'Mahlzeit') + '-Vorlage ' + esc(t.n) + (del ? ' löschen' : '') + '"><i class="ftq">' + ic(del ? 'close' : t.k === 'm' ? MEALI[t.mk] : 'cal') + '</i>' +
        '<small class="tpk">' + (t.k === 'd' ? mks.map(function (m) { return ic(MEALI[m[1]]); }).join('') : MEALS.filter(function (m) { return m[1] === t.mk; })[0][2]) + '</small>' +
        '<b class="' + fitCls(t.n, 8) + '">' + esc(t.n) + '</b><span class="ftv"><span>' + tplKcal(t) + '</span><small>' + t.it.length + '×</small></span></button>';
    }
    var td = tp.filter(function (t) { return t.k === 'd'; }), tm = tp.filter(function (t) { return t.k !== 'd'; });
    return (td.length ? '<p class="tplg">' + ic('cal') + 'Ganze Tage</p>' + td.map(tile).join('') : '') + (tm.length ? '<p class="tplg">' + ic('food') + 'Mahlzeiten</p>' + tm.map(tile).join('') : '') + (dayHas && !del ? '<button class="fti tplnew" data-ptpms="1" aria-label="Eine geplante Mahlzeit als Vorlage speichern">' + ic('plus') + '<small>Mahlzeit<br>speichern</small></button>' +
        '<button class="fti tplnew" data-ptpd="1" aria-label="Diesen Tag als Vorlage speichern">' + ic('plus') + '<small>Tag<br>speichern</small></button>' : '') +
      (tp.length ? '<button class="fti tplnew" data-ptpx="1" aria-label="' + (del ? 'Fertig' : 'Vorlagen löschen') + '">' + ic(del ? 'check' : 'trash') + '</button>' : '') +
      (!tp.length && !dayHas ? '<p class="muted tplh">' + ic('cards') + 'Vorlagen sind ganze Mahlzeiten oder Tage zum Wiederholen (Gerichte sind Rezepte). Plane zuerst eine Mahlzeit, dann „Als Vorlage speichern“.</p>' : '');
  }
  function tplAdd(t, di, mk) {
    // Vorlage einplanen: Mahlzeit-Vorlage in Mahlzeit mk (sonst ihre eigene), Tages-Vorlage mit den gespeicherten Mahlzeiten
    var pl = foodState().pl; fUndo();
    t.it.forEach(function (q) {
      var it = fItem(q.i); if (!it) return; var v = fNut(it, q.g), x = { d: di, mk: t.k === 'm' ? (mk || t.mk) : q.mk, n: fEn(it).slice(0, 30) };
      NK.forEach(function (k) { if (v[k] != null) x[k] = k === 'k' ? Math.round(v.k) : Math.round(v[k] * 10) / 10; }); x.r = { i: q.i, g: q.g }; pl.push(x);
    });
    persist(); ui.fresh = false; render(); buzz([10, 30, 10]); toast('Vorlage geplant · ' + tplKcal(t) + ' kcal', 'cal', true);
  }
  function tplSave(k, di, mk, nm) {
    // Geplantes eines Tags (k = 'd') oder einer Mahlzeit (k = 'm') als Vorlage speichern; Name selbst gewählt, sonst aus den ersten Einträgen. Gibt den Namen zurück
    // Grenzen wie in cleanFood (40 Vorlagen, 30 Einträge), sonst ginge Überzähliges beim nächsten Laden still verloren
    var l = planSum(di).items.filter(function (o) { return o.x.r && (k === 'd' || o.x.mk === mk); }).slice(0, 30); if (!l.length) return '';
    if (foodState().tp.length >= 40) { toast('Höchstens 40 Vorlagen', 'bolt'); return ''; }
    var n = String(nm || '').trim() || (k === 'd' ? 'Tag ' + WDN[wdOf(di)] : l[0].x.n.split(' ')[0] + (l.length > 1 ? ' +' + (l.length - 1) : ''));
    foodState().tp.push({ id: 't' + Date.now().toString(36), n: n.slice(0, 24), k: k, mk: k === 'm' ? mk : undefined, it: l.map(function (o) { var q = { i: o.x.r.i, g: o.x.r.g }; if (k === 'd') q.mk = o.x.mk; return q; }) });
    persist(); buzz([10, 30, 10]); return n.slice(0, 24);
  }
  function openTplDay(di, keep) {
    // Tag als Vorlage: je Mahlzeit kurz, was geplant ist, darunter Name + Speichern (gleich offen)
    var ps = planSum(di).items, kc = Math.round(ps.reduce(function (a, o) { return a + (o.x.k || 0); }, 0));
    if (!keep) { ui.tpnm = true; ui.tpok = ''; } ui.sheet = { tpday: di };
    sheetOpen(shHead('cal', 'Tag als Vorlage', dayHead(di)) + '<div class="tpdl">' + MEALS.map(function (m) {
      var l = ps.filter(function (o) { return o.x.mk === m[1]; }); if (!l.length) return '';
      return '<div class="m-' + m[1] + '">' + ic(MEALI[m[1]]) + '<span>' + l.map(function (o) { return esc(o.x.n); }).join(', ') + '</span><em>' + Math.round(l.reduce(function (a, o) { return a + o.x.k; }, 0)) + '</em></div>';
    }).join('') + '</div>' + tplRowHtml('d', ps, kc, 'Tag ' + WDN[wdOf(di)]));
  }
  function planSheet(d) {
    // Tag-Editor als Fenster über Planen (wie Gerichte); render() zeichnet es mit, Scroll bleibt; ohne Editor zu
    var day = ui.tab === 'tage' && ui.pe ? pDay(ui.pe) : null, sh = $('sheet');
    if (!day) { ui.pe = null; if (ui.sheet && ui.sheet.plan) closeSheet(true); return; }
    var top = ui.sheet && ui.sheet.plan ? sh.scrollTop : 0;
    ui.sheet = { plan: 'pe' }; sh.className = 'sheet tall pmx open'; $('shade').classList.add('open');
    sh.innerHTML = '<div class="grab"></div>' + viewPlanEdit(d, day); sh.scrollTop = top;
  }
  function pdayHtml() {
    // Tag ändern als Fenster: Aktionen (Tauschen schließt es und wählt im Kalender), darunter die Auswahl der gewählten Aktion
    var today = dayIdx(Date.now()), sd = ui.pd == null ? today : ui.pd;
    return shHead('calev', 'Tag ändern', dayHead(sd)) + dayEdit(plan(), sd, schedFor(sd), today);
  }
  function openNts() {
    var today = dayIdx(Date.now()), NT = ui.nts || [], lw = lastW(), todo = ['st', 'tr', 'wg', 'f0', 'fp', 'ux'].map(function (x) { return NT.filter(function (n) { return n.k === x; })[0]; }).filter(Boolean), sd = ui.pd == null ? today : ui.pd;
    ui.sheet = { pnts: true };
    // Glocke sitzt im Kalenderkopf und zählt die Aufgaben von heute, also immer heute zeigen
    sheetOpen(shHead('bell', 'Zu tun', dayHead(today)) + '<div class="todo open"><div class="agx"><div>' +
      todo.map(function (n) { return '<button class="tdo" data-nt="' + n.k + '">' + ic(n.i) + '<span><b>' + esc(n.t) + '</b><small>' + esc(n.s) + '</small></span>' + ic('chev', 'chv') + '</button>'; }).join('') + '</div></div></div>' +
      (lw && dayIdx(lw.t) + 7 <= today + 1 ?'<button class="pup" data-wgnow="1">' + ic('scale') + '<span><b>Wiegen fällig</b><small>Passt es schon heute? Dann jetzt eintragen.</small></span>' + ic('chev', 'chv') + '</button>' : ''));
  }
  function pdDone() { if (ui.sheet && ui.sheet.pday) closeSheet(true); ui.fresh = false; render(); }
  // ---------- Wochenpläne: mehrere gespeicherte Pläne (plan.wp), welcher gilt, legt der Zeitstrahl plan.act fest ([{a: ab Tag, p: Plan-id}])
  function wpOf(id) { return (plan().wp || []).filter(function (q) { return q.id === id; })[0]; }
  function actAt(di) {
    var r = null; (plan().act || []).forEach(function (x) { if (x.a <= di && (!r || x.a >= r.a) && wpOf(x.p)) r = x; });
    return r;
  }
  function wdAt(x, di) { var r = actAt(di); return r ? (wpOf(r.p).m[x.id] || []) : x.wd; }
  // Wochentage des heute aktiven Plans ({tagId: [wd]}); Änderungen direkt daran (wie früher Speichern im Planer, gilt also auch rückwirkend für diesen Plan)
  function weekM() { var r = actAt(dayIdx(Date.now())), q = (r && wpOf(r.p)) || plan().wp[0]; return q ? q.m : null; }
  function weekSet(fn) { var m = weekM(); if (!m) return; fn(m); plan().cu = true; syncWd(); persist(); ui.fresh = false; render(); buzz([10, 30, 10]); }
  function weekAdd(m, id, w) { var a = m[id] || (m[id] = []); if (a.indexOf(w) < 0) { a.push(w); a.sort(); } }
  function weekDel(m, id, w) { var a = m[id] || []; if (a.indexOf(w) >= 0) a.splice(a.indexOf(w), 1); }
  function syncWd() { var t = dayIdx(Date.now()); plan().days.forEach(function (x) { x.wd = wdAt(x, t).slice(); }); }
  function viewPlanEdit(d, day) {
    // Kopf in einer Zeile: Zurück, Aussehen (Icon in der Tagesfarbe, antippen = Icon/Farbe klappen auf), Name, Löschen
    var h = '<div class="pe-top rise" style="--i:0;--pc:var(' + PCOL[day.c] + ')"><button class="x" data-pback="1" aria-label="Zurück">' + ic('back') + '</button>' +
      '<button class="pe-ap" data-peap="1" aria-expanded="' + !!ui.peap + '" aria-label="Icon und Farbe">' + ic(dIcon(day)) + '</button><input id="pe-n" class="pe-n" type="text" maxlength="18" value="' + esc(day.n) + '" aria-label="Name"><button class="x" data-pdel="' + day.id + '" aria-label="Tag löschen"' + (ui.pdel ? ' style="color:var(--danger)"' : '') + '>' + (ui.pdel ? '<b class="sure">Sicher?</b>' : ic('trash')) + '</button></div>';
    // Aussehen und Rhythmus: Icon, Farbe, Wochentage, Wiederholung (jede / alle 2 / alle 3 Wochen / einmalig ab Startwoche)
    var rp = dRp(day), st = dSt(day), a = new Date(st * 864e5), b = new Date((st + 6) * 864e5);
    h += '<section class="pe-set rise" style="--i:1;--pc:var(' + PCOL[day.c] + ')">' + (ui.peap ? '<div class="pe-apx"><div class="pe-ic" role="group" aria-label="Icon">' + DAYI.map(function (k) { return '<button data-pic="' + k + '" aria-pressed="' + (dIcon(day) === k) + '" aria-label="Icon ' + k + '">' + ic(k) + '</button>'; }).join('') + '</div>' +
      '<div class="pe-c">' + PCOL.map(function (c, j) { return '<button data-pc="' + j + '" style="--pc:var(' + c + ')" aria-pressed="' + (day.c === j) + '" aria-label="Farbe ' + (j + 1) + '"><i class="pdot big"></i></button>'; }).join('') + '</div></div>' : '') +
      // Wochentage des heute aktiven Plans (ersetzt das frühere Wochenraster in Planen)
      '<div class="pe-wd" role="group" aria-label="Wochentage">' + WDN.map(function (n, w) { return '<button data-pwd="' + w + '" aria-pressed="' + ((weekM() || {})[day.id] || []).includes(w) + '" aria-label="' + n + '">' + n.slice(0, 2) + '</button>'; }).join('') + '</div>' +
      '<div class="pe-rp" role="group" aria-label="Wiederholung">' + [[1, 'Jede Woche'], [2, 'Alle 2 Wo.'], [3, 'Alle 3 Wo.'], [0, 'Einmalig']].map(function (o) { return '<button data-prp="' + o[0] + '" aria-pressed="' + (rp === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</div>' +
      (rp !== 1 ? '<div class="pe-st"><button class="x" data-pst="-1" aria-label="Woche früher">' + ic('back') + '</button><span>' + (rp ? 'Ab ' : 'Nur ') + a.getUTCDate() + '.' + (a.getUTCMonth() + 1) + '. – ' + b.getUTCDate() + '.' + (b.getUTCMonth() + 1) + '.</span><button class="x" data-pst="1" aria-label="Woche später">' + ic('chev') + '</button></div>' : '') + '</section>';
    // Übungen: Filter (Zahl = im Plan), Suche, Liste
    var inP = day.ex.filter(function (id) { return d.unlocked[id]; });
    h += '<section class="sec rise" style="--i:2"><h2 class="sec-h">' + ic('dumb') + 'Übungen<small>' + inP.length + ' im Plan</small></h2><div class="pgf pgf2" role="group"><button class="pg" data-pef="all" aria-pressed="' + (ui.pf === 'all') + '">Alle</button>' +
      GORDER.map(function (k) { var g = gOf(k), n = inP.filter(function (id) { return EXB[id].g === k; }).length; return '<button class="pg g' + k + '" data-pef="' + k + '" aria-pressed="' + (ui.pf === k) + '" aria-label="' + g.n + ': ' + n + ' im Plan">' + ic(g.i) + (n ? '<sup>' + n + '</sup>' : '') + '</button>'; }).join('') + '</div>' +
      '<input id="pe-q" class="pe-q" type="search" placeholder="Suchen" value="' + esc(ui.pq) + '" aria-label="Übung suchen"><div id="pe-list">' + peList(d, day) + '</div></section>';
    return h;
  }
  // Planen: Workout-Kachel hochziehen wie in Essen (gläsern) auf einen Kalendertag (ab heute, nicht im Urlaub) oder die Tageskarte = dort zusätzlich.
  // Ziel = nächstes im Umkreis von 48 px, es leuchtet
  var pdg = null;
  document.addEventListener('pointerdown', function (ev) {
    var el = ui.tab === 'tage' && !ui.sheet && ev.target.closest && ev.target.closest('.ptv[data-ptd]');
    pdg = el ? { el: el, x: ev.clientX, y: ev.clientY, on: false, tg: null } : null;
  });
  document.addEventListener('pointermove', function (ev) {
    if (!pdg) return; var dx = ev.clientX - pdg.x, dy = ev.clientY - pdg.y;
    // Start nach 8 px; Kacheln nicht nach unten (schräg zu einem Ziel geht auch)
    if (!pdg.on) { if (Math.sqrt(dx * dx + dy * dy) < 8) return; if (dy > 4) { pdg = null; return; } pdg.on = true; pdg.el.classList.add('glass'); pdg.el.style.pointerEvents = 'none'; }
    pdg.el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    var today = dayIdx(Date.now()), best = 48, tg = null;
    document.querySelectorAll('.pc2[data-cday]').forEach(function (e) {
      if (+e.dataset.cday < today || offAt(+e.dataset.cday)) return;
      var r = e.getBoundingClientRect(), ax = Math.max(r.left - ev.clientX, 0, ev.clientX - r.right), ay = Math.max(r.top - ev.clientY, 0, ev.clientY - r.bottom), dd = Math.sqrt(ax * ax + ay * ay);
      if (dd < best) { best = dd; tg = e; }
    });
    if (!tg) { var pd = document.querySelector('.pday'), r2 = pd && pd.getBoundingClientRect(); if (r2 && ev.clientY > r2.top && ev.clientY < r2.bottom && pDaySel() >= today && !offAt(pDaySel())) tg = pd; }
    if (tg !== pdg.tg) { if (pdg.tg) pdg.tg.classList.remove('drop'); if (tg) { tg.classList.add('drop'); buzz(4); } pdg.tg = tg; }
    pdg.el.classList.toggle('arm', !!tg);
  });
  function pdgEnd(ev) {
    if (!pdg) return; var p = pdg; pdg = null; if (!p.on) return;
    ui.pnoclick = Date.now(); p.el.style.pointerEvents = ''; p.el.classList.remove('glass', 'arm'); if (p.tg) p.tg.classList.remove('drop');
    // Abgebrochene Geste (iOS-Systemgeste, Anruf): nur zurück, nie eintragen
    if (ev && ev.type === 'pointercancel') p.tg = null;
    if (p.tg) { planExtra(p.el.dataset.ptd, p.tg.dataset.cday != null ? +p.tg.dataset.cday : pDaySel()); return; }
    p.el.style.transition = 'transform .22s var(--ease)'; p.el.style.transform = '';
    setTimeout(function () { p.el.style.transition = ''; }, 230);
  }
  document.addEventListener('pointerup', pdgEnd);
  document.addEventListener('pointercancel', pdgEnd);
  function pDaySel() { return ui.pd == null ? dayIdx(Date.now()) : ui.pd; }
  function planExtra(id, di) {
    // Trainingstag an einem Tag zusätzlich (ovk.a), der Tag wird gewählt und blinkt kurz
    var fx = ovF(di), pa = pDay(id); if (!pa) return;
    if (schedFor(di).some(function (x) { return x.id === id; })) { toast(pa.n + ' ist dort schon geplant', 'check'); return; }
    delete fx.s; fx.a = (fx.a || []).concat([id]); ovSetF(di, fx); ui.pd = di; ui.pfl = di;
    persist(); ui.fresh = false; render(); buzz([10, 30, 10]); toast(pa.n + ' zusätzlich · ' + fmtShort(di), 'plus');
  }
  function mealFor(id) {
    // Übliche Mahlzeit eines Lebensmittels/Gerichts: feste Mahlzeit des Gerichts, sonst die häufigste im Verlauf, sonst nach der Uhrzeit
    var dd = /^d/.test(id) && fDish(id); if (dd && dishMeals(dd).length) return dishMeals(dd)[0];
    var c = {}, b = null; foodState().e.forEach(function (x) { if (x.r && x.r.i === id) { var m = mealOfE(x)[1]; c[m] = (c[m] || 0) + 1; if (!b || c[m] > c[b]) b = m; } });
    return b || mealOf(Date.now())[1];
  }
  function calClick(t) {
    var el, today = dayIdx(Date.now());
    if (ui.pnoclick && Date.now() - ui.pnoclick < 350 && t.closest('.ptv, .fti')) return true;
    if ((el = t.closest('[data-cday]'))) {
      var cd = +el.dataset.cday, s0 = ui.pd == null ? today : ui.pd;
      if (ui.pmode === 'swap') {
        // Tauschen: zweiter Tag im Kalender; gleiche Tage und Urlaub/Krank gehen nicht
        if (!swapOk(s0, cd, today)) { buzz(20); return true; }
        // Getauscht wird das geplante Training (ohne Zusätzliches); ein früherer Tausch der beiden Tage wird vorher gelöst
        swapClear(s0); swapClear(cd); var fa = ovF(s0), fb = ovF(cd), a1 = defIds(s0), a2 = defIds(cd); delete fa.s; delete fa.r; delete fb.s; delete fb.r;
        fa.w = cd; fa.b = a2; fb.w = s0; fb.b = a1; ovSetF(s0, fa); ovSetF(cd, fb);
        ui.pmode = null; ui.pfl = s0; persist(); ui.fresh = false; render(); toast('Getauscht mit ' + WDN[wdOf(cd)] + ' ' + fmtShort(cd), 'swap'); return true;
      }
      // Monat bleibt beim Wählen offen (zu über den Monatsnamen oder nach oben wischen)
      if (cd !== s0) { ui.pd = cd; ui.pdx = true; ui.pmode = null; } ui.fresh = false; render(); return true;
    }
    if (t.closest('[data-cmode]')) { calMon(((ui.cm || 0) + 1) % 3); return true; }
    if (t.closest('[data-pdedit]')) { ui.pmode = null; ui.sheet = { pday: true }; sheetOpen(pdayHtml()); return true; }
    if (t.closest('[data-pnts]')) { openNts(); return true; }
    if (t.closest('[data-pnew]')) {
      // Neues Workout: leer (Eigener Tag) zuerst, dann die Vorlagen
      var pl0 = PRESETS.length - 1, po = [pl0].concat(PRESETS.slice(0, pl0).map(function (x, j) { return j; }));
      ui.sheet = { pnew: true }; sheetOpen(shHead('dumbbell', 'Neues Workout', 'Leer oder aus Vorlage') + '<div class="ftl">' + po.map(function (j) { var pr = PRESETS[j];
        return '<button class="ptv" data-ppre="' + j + '" style="--pc:var(' + PCOL[pr.c] + ')"><i class="ptvi">' + ic(j === pl0 ? 'plus' : pr.i) + '</i><b class="' + fitCls(pr.n, 8) + '">' + (j === pl0 ? 'Leer' : esc(pr.n)) + '</b><small>' + (j === pl0 ? 'eigene' : 'Vorlage') + '</small></button>'; }).join('') + '</div>');
      return true;
    }
    if (t.closest('[data-padd]')) {
      // Workout nur an diesem Datum zusätzlich (wie Hochziehen auf die Tageskarte)
      var sc0 = schedFor(pDaySel());
      ui.sheet = { padd: true }; sheetOpen(shHead('dumbbell', 'Workout an diesem Tag', fmtDayL(pDaySel())) + '<div class="ftl">' + plan().days.filter(function (x) { return !sc0.some(function (y) { return y.id === x.id; }); }).map(function (x) {
        return '<button class="ptv" data-pxa="' + x.id + '" style="--pc:var(' + PCOL[x.c] + ')"><i class="ptvi">' + ic(dIcon(x)) + '</i><b class="' + fitCls(x.n, 8) + '">' + esc(x.n) + '</b><small>' + x.ex.length + ' Üb.</small></button>'; }).join('') + '</div>');
      return true;
    }
    if ((el = t.closest('[data-pxa]'))) { closeSheet(true); planExtra(el.dataset.pxa, pDaySel()); return true; }
    if ((el = t.closest('[data-pdb]'))) { var pk = el.dataset.pdb; ui.pdo[pk] = !ui.pdo[pk]; el.setAttribute('aria-expanded', ui.pdo[pk]); el.parentNode.classList.toggle('open', ui.pdo[pk]); return true; }
    if ((el = t.closest('[data-gotab]'))) { goTab(el.dataset.gotab); return true; }
    if ((el = t.closest('[data-rm]'))) { ui.rm = Math.max(-11, Math.min(0, ui.rm + (+el.dataset.rm))); ui.fresh = false; render(); return true; }
    if ((el = t.closest('[data-wr]'))) { ui.wr = el.dataset.wr; ui.fresh = false; render(); return true; }
    var sd = ui.pd == null ? today : ui.pd, ids = function (di) { return schedFor(di).map(function (x) { return x.id; }); };
    if ((el = t.closest('[data-pmode]'))) {
      var pm = el.dataset.pmode, of0 = offAt(sd), f0 = ovF(sd), P3 = plan(), on0 = { swap: f0.w !== undefined, skip: !!f0.s, repl: !!f0.r, add: !!f0.a }[pm];
      if (pm === 'swap' && ui.pmode === 'swap') { ui.pmode = null; ui.fresh = false; render(); return true; }
      if ((pm === 'vac' || pm === 'sick') && of0 && of0.k === pm) { P3.off.splice(of0.i, 1); ui.pmode = null; persist(); pdDone(); toast('Zeitraum gelöscht', pm === 'vac' ? 'beach' : 'sick'); return true; }
      if (on0 && pm !== 'add') { if (pm === 'swap') swapClear(sd); else { delete f0[{ skip: 's', repl: 'r', add: 'a' }[pm]]; ovSetF(sd, f0); } ui.pmode = null; ui.pfl = sd; persist(); pdDone(); return true; }
      if (pm === 'skip') { swapClear(sd); ovSetF(sd, { s: 1 }); ui.pmode = null; ui.pfl = sd; persist(); pdDone(); toast('Ausgesetzt', 'skip'); return true; }
      // Tauschen: Fenster zu, zweiter Tag im Kalender; übrige Aktionen zeigen ihre Auswahl im Fenster
      if (pm === 'swap') { ui.pmode = 'swap'; if (ui.sheet) closeSheet(true); ui.fresh = false; render(); return true; }
      ui.pmode = ui.pmode === pm ? null : pm; if (ui.sheet && ui.sheet.pday) $('sheet').innerHTML = pdayHtml(); else { ui.fresh = false; render(); } return true;
    }
    if ((el = t.closest('[data-preplx]'))) { swapClear(sd); var fr = ovF(sd); delete fr.s; fr.r = [el.dataset.preplx]; ovSetF(sd, fr); ui.pmode = null; ui.pfl = sd; persist(); pdDone(); return true; }
    if ((el = t.closest('[data-paddx]'))) {
      // Umschalten: zufügen oder wieder entfernen; das Fenster bleibt offen, damit mehrere gehen
      var fx = ovF(sd), xid = el.dataset.paddx, xa = fx.a || [], xi = xa.indexOf(xid); delete fx.s;
      if (xi >= 0) xa.splice(xi, 1); else xa.push(xid); fx.a = xa; ovSetF(sd, fx); ui.pfl = sd; buzz(8); persist(); ui.fresh = false; render();
      if (ui.sheet && ui.sheet.pday) $('sheet').innerHTML = pdayHtml(); return true;
    }
    if (t.closest('[data-wgnow]')) { openWeight(); return true; }
    if ((el = t.closest('[data-poff]'))) { var P0 = plan(), n = +el.dataset.poff; P0.off = (P0.off || []).concat([{ a: sd, b: sd + n - 1, k: ui.pmode === 'sick' ? 'sick' : 'vac' }]); toast(ui.pmode === 'sick' ? 'Krank eingetragen' : 'Urlaub eingetragen', ui.pmode === 'sick' ? 'sick' : 'beach'); ui.pmode = null; persist(); pdDone(); return true; }
    return false;
  }
  function planClick(t) {
    if (calClick(t)) return true;
    var el, P = plan(), day, a;
    function done(keepScroll) { persist(); ui.fresh = false; render(); }
    if ((el = t.closest('[data-pedit]'))) { ui.pe = el.dataset.pedit; ui.pdel = 0; ui.peap = false; ui.pf = domGroup(pDay(ui.pe)) || 'all'; ui.pq = ''; ui.fresh = true; render(); $('app').scrollTo(0, 0); return true; }
    if (t.closest('[data-pback]')) { ui.pe = null; ui.pdel = 0; ui.fresh = true; render(); $('app').scrollTo(0, 0); return true; }
    if ((el = t.closest('[data-ppre]'))) {
      if (ui.sheet && ui.sheet.pnew) closeSheet(true);
      var pr = PRESETS[+el.dataset.ppre], ids = pr.ids ? pr.ids.slice() : EX.filter(function (e) { return pr.f.indexOf(e.g) >= 0; }).map(function (e) { return e.id; });
      var nd = { id: 'p' + Date.now().toString(36), n: pr.n === 'Eigener Tag' ? 'Tag ' + (P.days.length + 1) : pr.n, c: pr.c, i: pr.i, wd: [], ex: ids };
      P.cu = true; P.days.push(nd); ui.pe = nd.id; ui.peap = true; ui.pf = 'all'; ui.pq = ''; ui.fresh = true; persist(); render(); $('app').scrollTo(0, 0); return true;
    }
    if (t.closest('[data-peap]')) { ui.peap = !ui.peap; ui.fresh = false; render(); return true; }
    if ((el = t.closest('[data-pc]')) && ui.pe) { day = pDay(ui.pe); if (day) { P.cu = true; day.c = +el.dataset.pc; done(); } return true; }
    if ((el = t.closest('[data-ptog]')) && ui.pe) { day = pDay(ui.pe); if (day) { P.cu = true; var xi = day.ex.indexOf(el.dataset.ptog); if (xi >= 0) day.ex.splice(xi, 1); else day.ex = sortIds(day.ex.concat([el.dataset.ptog])); done(); } return true; }
    if ((el = t.closest('[data-pic]')) && ui.pe) { day = pDay(ui.pe); if (day) { P.cu = true; day.i = el.dataset.pic; done(); } return true; }
    if ((el = t.closest('[data-prp]')) && ui.pe) { day = pDay(ui.pe); if (day) { P.cu = true; var rp = +el.dataset.prp; if (rp === 1) { delete day.rp; delete day.st; } else { day.rp = rp; day.st = dSt(day); } done(); } return true; }
    if ((el = t.closest('[data-pwd]')) && ui.pe) { var pid = ui.pe, pw = +el.dataset.pwd; weekSet(function (m) { if ((m[pid] || []).indexOf(pw) >= 0) weekDel(m, pid, pw); else weekAdd(m, pid, pw); }); return true; }
    if ((el = t.closest('[data-pst]')) && ui.pe) { day = pDay(ui.pe); if (day) { P.cu = true; day.st = dSt(day) + 7 * (+el.dataset.pst); done(); } return true; }
    if ((el = t.closest('[data-plk]'))) { var lk = el.dataset.plk; ui.plk = ui.plk === lk ? null : lk; document.querySelectorAll('[data-plk]').forEach(function (b) { var on = b.dataset.plk === ui.plk; b.setAttribute('aria-expanded', on); b.parentNode.classList.toggle('open', on); }); return true; }
    if ((el = t.closest('[data-pef]'))) { ui.pf = el.dataset.pef; ui.fresh = false; render(); return true; }
    if ((el = t.closest('[data-pdel]'))) {
      if (!ui.pdel) { ui.pdel = Date.now(); ui.fresh = false; render(); setTimeout(function () { if (ui.pdel && Date.now() - ui.pdel > 2900) { ui.pdel = 0; if (ui.pe) { ui.fresh = false; render(); } } }, 3000); return true; }
      P.cu = true; P.days = P.days.filter(function (x) { return x.id !== el.dataset.pdel; }); ui.pe = null; ui.pdel = 0; ui.fresh = true; persist(); render(); $('app').scrollTo(0, 0); return true;
    }
    return false;
  }
  document.addEventListener('input', function (ev) {
    var t = ev.target;
    if (t.id === 'pe-q') { ui.pq = t.value; var day = pDay(ui.pe); if (day) $('pe-list').innerHTML = peList(derive(state.logs), day); }
    else if (t.id === 'pe-n') { var dd = pDay(ui.pe); if (dd) { plan().cu = true; dd.n = t.value.slice(0, 18) || dd.n; clearTimeout(planT); planT = setTimeout(persist, 500); } }
  });
  var planT = null;
