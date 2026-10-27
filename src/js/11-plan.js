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
        return '<button class="exr" data-ptog="' + e.id + '" aria-pressed="' + (day.ex.indexOf(e.id) >= 0) + '"><span><b>' + esc(e.n) + '</b><small>' + esc(e.mu) + '</small></span><i></i></button>';
      }).join('') + '</div></section>';
    });
    if (locked.length) {
      locked.sort(function (x, y) { return lockPct(y, d) - lockPct(x, d); });
      h += '<section class="exg"><h3 class="xg lkh">' + ic('lock') + 'Gesperrt<small>' + locked.length + '</small></h3><div class="exl">' + locked.map(function (e) {
        var open = ui.plk === e.id;
        return '<div class="exk g' + e.g + (open ? ' open' : '') + '"><button class="exr lk" data-plk="' + e.id + '" aria-expanded="' + open + '"><span><b>' + ic(gOf(e.g).i) + esc(e.n) + '</b><small>' + esc(e.mu) + '</small></span>' + ring(lockPct(e, d)) + '</button>' +
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
  function dayGroups(days, d) {
    var gc = {};
    days.forEach(function (x) { x.ex.forEach(function (id) { if (d.unlocked[id]) gc[EXB[id].g] = (gc[EXB[id].g] || 0) + 1; }); });
    return gc;
  }
  function calMove(dir) {
    // Woche: 7 Tage weiter, Monat: auf den 1. des nächsten/vorigen Monats. Grenzen: 6 Monate zurück, 6 voraus
    var today = dayIdx(Date.now()), a = ui.ca == null ? today : ui.ca, q = new Date(a * 864e5);
    var n = ui.cm ? Date.UTC(q.getUTCFullYear(), q.getUTCMonth() + dir, 1) / 864e5 : a + dir * 7;
    if (n < today - 183 || n > today + 183) return false;
    ui.ca = n; ui.cdir = dir; ui.fresh = false; render(); return true;
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
    var acts = sd >= today ? [['swap', 'swap', 'Tauschen'], ['skip', 'skip', 'Aussetzen'], ['repl', 'repl', 'Ersetzen'], ['add', 'plus', 'Zusätzlich'], ['vac', 'sun', 'Urlaub'], ['sick', 'sick', 'Krank']] : [['vac', 'sun', 'Urlaub'], ['sick', 'sick', 'Krank']];
    h = '<div class="pda">' + acts.map(function (a) {
      var on = a[0] === 'vac' || a[0] === 'sick' ? off && off.k === a[0] : fon[a[0]];
      return '<button data-pmode="' + a[0] + '" aria-pressed="' + !!(on || m === a[0]) + '"' + (on ? ' class="act"' : '') + '>' + ic(a[1]) + '<span>' + a[2] + '</span></button>';
    }).join('') + '</div>';
    function dchip(attr, x) { return '<button ' + attr + ' style="--pc:var(' + PCOL[x.c] + ')">' + ic(dIcon(x)) + esc(x.n) + '</button>'; }
    if (m === 'swap') h += '<p class="pdh">' + ic('swap') + 'Tag im Kalender wählen</p>';
    if (m === 'repl' || m === 'add') h += '<div class="pdm ptg">' + P.days.filter(function (x) { return cur.indexOf(x.id) < 0; }).map(function (x) { return dchip('data-p' + m + 'x="' + x.id + '"', x); }).join('') + '</div>';
    if (m === 'vac' || m === 'sick') h += '<div class="pdm pdur">' + [1, 2, 3, 5, 7, 14].map(function (n) { return '<button data-poff="' + n + '"><b>' + n + '</b><span>' + (n === 1 ? 'Tag' : 'Tage') + '</span></button>'; }).join('') + '</div>';
    return h;
  }
  function viewPlan(d, now) {
    var today = dayIdx(now), P = plan();
    var NT = ui.nts || [], dur = durEst(), sd = ui.pd == null ? today : ui.pd, a = ui.ca == null ? today : ui.ca, k, ft = ui.pft || 't';
    function nt(x) { return NT.filter(function (n) { return n.k === x; })[0]; }
    var todo = ['st', 'tr', 'wg', 'f0', 'fp'].map(nt).filter(Boolean), wk = nt('wk'), ux = nt('ux');
    var h = '<div class="pt-h rise" style="--i:0"><h2>Plan</h2></div>';

    // Kalender: Wochenleiste mit dem gewählten Tag in der Mitte (wischen = 7 Tage), Monatsname klappt den Monat aus.
    // Zellen: Icon des Trainingstags, Haken = trainiert, Ring um die Zahl = Essen (Anteil vom kcal-Ziel; grün im Rahmen, rot drüber), Glocke/Waage = Meldungen
    var q = new Date(a * 864e5), from, to, lead = 0;
    if (ui.cm) { from = Date.UTC(q.getUTCFullYear(), q.getUTCMonth(), 1) / 864e5; to = Date.UTC(q.getUTCFullYear(), q.getUTCMonth() + 1, 0) / 864e5; lead = wdOf(from); }
    else { from = a - 3; to = a + 3; }
    var tq = new Date((ui.cm ? from : a) * 864e5), title = tq.toLocaleDateString('de-DE', { month: 'long', timeZone: 'UTC' });
    var cells = '', swp = ui.pmode === 'swap', lw = lastW(), wdue = lw ? dayIdx(lw.t) + 7 : today;
    for (k = 0; k < lead; k++) cells += '<i></i>';
    for (k = from; k <= to; k++) {
      var ds = schedFor(k), tr = d.byDay[k], of = offAt(k), skp = ovF(k).s ? P.days.filter(function (x) { return onDay(x, k); }) : [], pk = swp ? (swapOk(sd, k, today) ? ' pick' : ' nop') : '';
      var fs = k <= today ? foodSum(k) : planSum(k), fq = fs.items.length ? fs.k / foodGoal(k).k : 0;
      var fr = fq ? '<i class="pfr' + (k > today ? ' pl' : fq > 1.1 ? ' over' : fq >= 0.85 ? ' ok' : '') + '" style="--p:' + Math.min(1, fq).toFixed(2) + '"></i>' : '';
      cells += '<button class="pc2' + pk + (skp.length ? ' skp' : '') + (k === today ? ' today' : '') + (k === sd ? ' sel' : '') + (k < today ? ' past' : '') + (tr ? ' done' : '') + '" data-cday="' + k + '" aria-label="' + fmtDayL(k) + '">' +
        (ui.cm ? '' : '<small>' + WDN[wdOf(k)].slice(0, 2) + '</small>') + '<b>' + fr + new Date(k * 864e5).getUTCDate() + '</b><span class="ics">' +
        skp.slice(0, 2).map(function (x) { return '<em class="sk" style="--pc:var(' + PCOL[x.c] + ')">' + ic(dIcon(x)) + '</em>'; }).join('') + (of ? '<em class="off">' + ic(of.k === 'vac' ? 'sun' : 'sick') + '</em>' : '') +
        ds.slice(0, 2).map(function (x) { return '<em style="--pc:var(' + PCOL[x.c] + ')">' + ic(dIcon(x)) + '</em>'; }).join('') + (ds.length > 2 ? '<small>+</small>' : '') + '</span>' +
        (tr ? ic('check', 'dn') : '') + (k === today && todo.length ? ic('bell', 'nd') : k === wdue && k > today ? ic('scale', 'nf') : '') + '</button>';
    }
    var showNow = sd !== today || today < from || today > to;
    h += '<section class="pcal2 rise' + (ui.cm ? ' mon' : '') + '" style="--i:1"><div class="pc2-h"><button class="x" data-cnav="-1" aria-label="Zurück">' + ic('back') + '</button>' +
      '<button class="pc2-t" data-cmode="1" aria-expanded="' + !!ui.cm + '" aria-label="' + (ui.cm ? 'Woche zeigen' : 'Monat zeigen') + '"><b>' + title + '</b><small>' + tq.getUTCFullYear() + '</small>' + ic('chev') + '</button>' +
      '<button class="x pc2-now" data-cnow="1" aria-label="Heute"' + (showNow ? '' : ' hidden') + '>' + ic('caltd') + '</button><button class="x" data-cnav="1" aria-label="Weiter">' + ic('chev') + '</button></div>' +
      (ui.cm ? '<div class="pc2-w">' + WDN.map(function (n) { return '<span>' + n + '</span>'; }).join('') + '</div>' : '') +
      '<div class="pc2-g' + (swp ? ' swp' : '') + (ui.cdir ? (ui.cdir > 0 ? ' in-r' : ' in-l') : '') + (ui.cmx ? ' in-m' : '') + '">' + cells + '</div>' +
      (wk ? '<p class="pc2-n">' + ic('cal') + esc(wk.t) + ' · ' + esc(wk.s) + '</p>' : '') + '</section>';
    ui.cdir = 0; ui.cmx = false;

    // Fokus: der gewählte Tag mit Umschalter Training / Essen. Kopf: Glocke (Zu tun, Wiegen fällig) und „Tag ändern“ (Ausnahmen, Urlaub/Krank) öffnen je ein Fenster
    var sc = schedFor(sd), st = d.byDay[sd], off = offAt(sd), fd = ovF(sd), kd = fd.s ? 'skip' : fd.w !== undefined ? 'swap' : fd.r ? 'repl' : '', c = '';
    var nts = (sd === today ? todo.length : 0) + (sd === wdue && sd > today ? 1 : 0), edt = sd >= today - 14;
    if (ft === 'd') ft = 't';
    c += '<div class="pd-h"><b>' + dayHead(sd) + '</b>' + (nts ? '<button class="x pd-n" data-pnts="1" aria-label="' + nts + ' Hinweise">' + ic('bell') + '<i>' + nts + '</i></button>' : '') +
      (edt ? '<button class="x pd-e' + (kd || off || fd.a ? ' on' : '') + '" data-pdedit="1" aria-label="Tag ändern">' + ic('edit') + '</button>' : '') + '</div>' +
      '<div class="seg pft">' + [['t', 'dumb', 'Training'], ['e', 'food', 'Essen']].map(function (x) { return '<button data-pft="' + x[0] + '" aria-pressed="' + (ft === x[0]) + '">' + ic(x[1]) + x[2] + '</button>'; }).join('') + '</div>';
    if (swp) c += '<p class="pdh">' + ic('swap') + 'Tag im Kalender wählen<button class="x" data-pmode="swap" aria-label="Tauschen abbrechen">' + ic('close') + '</button></p>';
    if (ft === 't') {
      var shown = {};
      if (kd && !off) {
        var was = P.days.filter(function (x) { return onDay(x, sd); }), pt = fd.w !== undefined ? fd.w : null;
        c += '<div class="pwas">' + ic(kd === 'skip' ? 'skip' : kd === 'swap' ? 'swap' : 'repl') + '<span>' + (kd === 'skip' ? 'Ausgesetzt' : kd === 'swap' ? 'Getauscht' + (pt !== null ? ' mit ' + WDN[wdOf(pt)] + ' ' + fmtShort(pt) : '') : 'Statt') + '</span>' +
          (was.length ? was.map(function (x) { return '<s style="--pc:var(' + PCOL[x.c] + ')">' + ic(dIcon(x)) + esc(x.n) + '</s>'; }).join('') : '<s>' + ic('snow') + 'Frei</s>') + '</div>';
      }
      if (off) c += '<div class="pdb off"><div class="pdb-h"><span class="pdi">' + ic(off.k === 'vac' ? 'sun' : 'sick') + '</span><span class="nm"><b>' + (off.k === 'vac' ? 'Urlaub' : 'Krank') + '</b><small>' + fmtShort(off.a) + ' – ' + fmtShort(off.b) + ' · Serie geschützt</small></span></div></div>';
      sc.forEach(function (x) {
        var ids = sortIds(x.ex.filter(function (id) { return d.unlocked[id]; })), dn = ids.filter(function (id) { return st && st.ex[id]; }).length, key = sd + ':' + x.id, open = !!ui.pdo[key];
        var sub = [ids.length + ' Übungen']; if (dur[x.id] && sd >= today) sub.push('~' + dur[x.id] + '′'); if (sd <= today) sub.push(dn + '/' + ids.length + ' ✓');
        ids.forEach(function (id) { shown[id] = 1; });
        c += '<div class="pdb' + (open ? ' open' : '') + '" style="--pc:var(' + PCOL[x.c] + ')"><button class="pdb-h" data-pdb="' + key + '" aria-expanded="' + open + '"><span class="pdi">' + ic(dIcon(x)) + '</span><span class="nm"><b>' + esc(x.n) + '</b><small>' + sub.join(' · ') + '</small>' +
          (sd <= today && ids.length ? '<i class="pdp"><i style="width:' + Math.round(dn / ids.length * 100) + '%"></i></i>' : '') + '</span>' + ic('chev', 'chv') + '</button>' +
          '<div class="agx"><div><div class="pdl">' + ids.map(function (id) {
            var e = EXB[id], ok = !!(st && st.ex[id]), lb = lastBest(e, sd);
            return '<div class="pdr' + (ok ? ' ok' : '') + '">' + ic(ok ? 'check' : 'dash') + '<span>' + esc(e.n) + '</span><small>' + esc(goalText(e)) + (lb ? '<br>zul. ' + esc(lb) : '') + '</small></div>';
          }).join('') + '</div></div></div></div>';
      });
      if (!sc.length && !off) c += '<div class="pdb rest"><div class="pdb-h"><span class="pdi">' + ic('snow') + '</span><span class="nm"><b>Frei</b><small>' + (kd === 'skip' ? 'Training ausgesetzt' : sd >= today ? 'Erholung' : 'Kein Training geplant') + '</small></span></div></div>';
      var extra = st ? Object.keys(st.ex).filter(function (id) { return !shown[id]; }) : [];
      if (extra.length) c += '<p class="agp">Außerdem: ' + extra.map(function (id) { return esc(EXB[id].n); }).join(' · ') + '</p>';
      if (sd === today && sc.length) c += '<button class="btn primary pd-go" data-gotab="heute">' + ic('play') + 'Training starten</button>';
    } else if (ft === 'e') {
      // Essen des Tages: Balken = gegessen (voll) + geplant (schraffiert), darunter die vier Mahlzeiten (gegessen gefüllt, nur geplant im Umriss).
      // Ab heute: Mahlzeit antippen = planen (Fenster); vergangene Tage nur ansehen
      var es = foodSum(sd), ps = planSum(sd), eg = foodGoal(sd), canP = sd >= today;
      c += '<div class="pfs">' + [['k', 'kcal'], ['p', 'g Protein']].map(function (x) {
        var v = es[x[0]] || 0, w = ps[x[0]] || 0, gv = eg[x[0]] || 1, pr = (v + w) / gv;
        return '<div class="pfr2' + (pr > FLIM[x[0]] ? ' over' : pr >= 0.9 ? ' hit' : '') + '" style="--fc:var(' + NCOL[x[0]] + ')"><span><b>' + Math.round(v + w) + '</b><small>/ ' + gv + ' ' + x[1] + (w ? ' · ' + Math.round(w) + ' geplant' : '') + '</small></span>' +
          '<i class="fbt"><i style="--p:' + Math.min(1, v / gv).toFixed(3) + '"></i>' + fGh(v / gv, w / gv) + '</i></div>';
      }).join('') + '</div><div class="pml">' + MEALS.map(function (m) {
        var ei = es.items.filter(function (o) { return mealOfE(o.x)[1] === m[1]; }), pi = ps.items.filter(function (o) { return o.x.mk === m[1]; }), kc = Math.round(ei.concat(pi).reduce(function (a, o) { return a + (o.x.k || 0); }, 0));
        var cls = ei.length ? '' : pi.length ? ' fpm' : ' fme';
        return '<button class="fmc m-' + m[1] + cls + '"' + (canP ? ' data-pml="' + m[1] + '"' : ' disabled') + ' aria-label="' + m[2] + (canP ? ' planen' : '') + '">' +
          (ei.length || pi.length ? '<span class="fmt">' + ic(MEALI[m[1]]) + '<small>' + (ei.length ? '×' + ei.length : '') + (pi.length ? ' <i>+' + pi.length + '</i>' : '') + '</small></span><b>' + kc + '<em>kcal</em></b>' : ic(canP ? 'plus' : MEALI[m[1]])) + '</button>';
      }).join('') + '</div>';
      if (sd <= today) c += '<button class="btn small pfo" data-pfo="' + sd + '">' + ic('food') + 'In Essen öffnen</button>';
    }
    h += '<section class="pday rise' + (ui.pfl === sd ? ' fl' : '') + (ui.pdx ? ' in-d' : '') + '" style="--i:2">' + c + '</section>';
    ui.pfl = null; ui.pdx = false;

    // Darunter wie in Essen: zwei Knöpfe (Vorlagen als Fenster, Wochenplan), dann Vorlagen, die heute/künftig noch nicht dran sind (antippen = zusätzlich an diesem Tag)
    // Trainingstage = Bausteine (Fächer der farbigen Karten), Wochenplan = Anordnung (Mo–So mit den Farben des aktiven Plans)
    var fan = P.days.slice(0, 5).map(function (x, j, l) { return '<i style="--pc:var(' + PCOL[x.c] + ');--j:' + (j - (l.length - 1) / 2).toFixed(1) + '">' + ic(dIcon(x)) + '</i>'; }).join('');
    var mw = WDN.map(function (n, w) { var x = P.days.filter(function (y) { return wdAt(y, today + w - wdOf(today)).indexOf(w) >= 0; })[0]; return '<i' + (x ? ' style="--pc:var(' + PCOL[x.c] + ')"' : '') + (w === wdOf(today) ? ' class="t"' : '') + '></i>'; }).join('');
    h += '<div class="pfx rise" style="--i:3"><button class="btn pfx-d" data-pdays="1" aria-label="Trainingstage"><span class="pfan">' + fan + '</span><b>Trainingstage</b></button>' +
      '<button class="btn pfx-w" data-pman="1" aria-label="Wochenplan"><span class="pmw">' + mw + '</span><b>Wochenplan</b></button></div>';
    var cur0 = sc.map(function (x) { return x.id; }), add = sd >= today && !off ? P.days.filter(function (x) { return cur0.indexOf(x.id) < 0; }).slice(0, 4) : [];
    if (add.length) h += '<section class="pvl rise" style="--i:4">' + add.map(function (x) {
      var n = x.ex.filter(function (id) { return d.unlocked[id]; }).length;
      return '<button class="ptv" data-paddx="' + x.id + '" style="--pc:var(' + PCOL[x.c] + ')" aria-label="' + esc(x.n) + ' zusätzlich am ' + fmtDayL(sd) + '">' + ic(dIcon(x)) + '<b>' + esc(x.n) + '</b><small>' + n + ' Üb.' + (dur[x.id] ? ' · ~' + dur[x.id] + '′' : '') + '</small></button>';
    }).join('') + '</section>';

    if (ux) h += '<button class="agn gold pux rise" style="--i:5" data-nt="ux">' + ic('lock') + '<span>' + esc(ux.t) + '</span></button>';
    return h;
  }
  function planSheet(d, now) {
    // Wochenplaner und Tag-Editor als Fenster über Planen (wie Gerichte); render() zeichnet es mit, Scroll bleibt; ohne beides zu
    var day = ui.tab === 'tage' && ui.pe ? pDay(ui.pe) : null, k = day ? 'pe' : ui.tab === 'tage' && ui.pman ? 'pm' : '', sh = $('sheet');
    if (!k) { ui.pe = null; if (ui.sheet && ui.sheet.plan) closeSheet(true); return; }
    var top = ui.sheet && ui.sheet.plan === k ? sh.scrollTop : 0;
    ui.sheet = { plan: k }; sh.className = 'sheet tall pmx open'; $('shade').classList.add('open');
    sh.innerHTML = '<div class="grab"></div>' + (k === 'pe' ? viewPlanEdit(d, day) : viewPlanner(d, now)); sh.scrollTop = top;
  }
  function pSheetBack() {
    // Schließen im Planer/Editor: Editor geht zurück in den Planer (falls von dort), ungespeicherte Woche fragt erst
    if (!ui.sheet || !ui.sheet.plan) return false;
    if (ui.pe && ui.pman) { ui.pe = null; ui.pdel = 0; ui.fresh = false; render(); return true; }
    if (!ui.pe && ui.draft && ui.draft.dirty && !ui.pdisc) { ui.pdisc = 1; ui.fresh = false; render(); $('sheet').scrollTop = 0; return true; }
    return false;
  }
  function pdayHtml() {
    // Tag ändern als Fenster: Aktionen (Tauschen schließt es und wählt im Kalender), darunter die Auswahl der gewählten Aktion
    var today = dayIdx(Date.now()), sd = ui.pd == null ? today : ui.pd;
    return shHead('edit', 'Tag ändern', dayHead(sd)) + dayEdit(plan(), sd, schedFor(sd), today);
  }
  function openNts() {
    var today = dayIdx(Date.now()), NT = ui.nts || [], lw = lastW(), todo = ['st', 'tr', 'wg', 'f0', 'fp'].map(function (x) { return NT.filter(function (n) { return n.k === x; })[0]; }).filter(Boolean), sd = ui.pd == null ? today : ui.pd;
    ui.sheet = { pnts: true };
    sheetOpen(shHead('bell', 'Zu tun', dayHead(sd)) + '<div class="todo open"><div class="agx"><div>' +
      (sd === today ? todo.map(function (n) { return '<button class="tdo" data-nt="' + n.k + '">' + ic(n.i) + '<span><b>' + esc(n.t) + '</b><small>' + esc(n.s) + '</small></span>' + ic('chev', 'chv') + '</button>'; }).join('') : '') + '</div></div></div>' +
      (lw && sd === dayIdx(lw.t) + 7 && sd > today ? '<button class="pup" data-wgnow="1">' + ic('scale') + '<span><b>Wiegen fällig</b><small>Passt es schon heute? Dann jetzt eintragen.</small></span>' + ic('chev', 'chv') + '</button>' : ''));
  }
  function pdDone() { if (ui.sheet && ui.sheet.pday) closeSheet(true); ui.fresh = false; render(); }
  function openDays() {
    // Trainingstage als Fenster (wie Gerichte): Karten antippen = bearbeiten, darunter neu aus Vorlage
    var P = plan(), d = derive(state.logs); ui.sheet = { pdays: true };
    sheetOpen(shHead('dumb', 'Trainingstage', P.days.length + (P.days.length === 1 ? ' Tag' : ' Tage')) +
      '<div class="pdg">' + P.days.map(function (x) {
        var n = x.ex.filter(function (id) { return d.unlocked[id]; }).length;
        return '<button class="pdc2" data-pedit="' + x.id + '" style="--pc:var(' + PCOL[x.c] + ')"><i>' + ic(dIcon(x)) + '</i><b>' + esc(x.n) + '</b><small>' + n + ' Übungen' + (rpText(x) ? ' · ' + esc(rpText(x)) : '') + '</small></button>';
      }).join('') + '</div>' +
      (P.days.length < 8 ? '<h3 class="xg">' + ic('plus') + 'Neuer Tag aus Vorlage</h3><div class="ppre">' + PRESETS.map(function (pr, j) { return '<button data-ppre="' + j + '" style="--pc:var(' + PCOL[pr.c] + ')">' + ic(pr.i) + pr.n + '</button>'; }).join('') + '</div>' : ''), true);
  }
  // ---------- Wochenpläne: mehrere gespeicherte Pläne (plan.wp), welcher gilt, legt der Zeitstrahl plan.act fest ([{a: ab Tag, p: Plan-id}])
  var LIM = { pull: 3, push: 3, kh: 3, core: 3, skill: 3, cardio: 4, mob: 7 };
  function wpName(except) {
    // Standardname „Plan n“: kleinste Zahl, die noch kein anderer Plan trägt
    var used = (plan().wp || []).filter(function (q) { return q.id !== except; }).map(function (q) { return q.n; }), n = 1;
    while (used.indexOf('Plan ' + n) >= 0) n++;
    return 'Plan ' + n;
  }
  function wpOf(id) { return (plan().wp || []).filter(function (q) { return q.id === id; })[0]; }
  function actAt(di) {
    var r = null; (plan().act || []).forEach(function (x) { if (x.a <= di && (!r || x.a >= r.a) && wpOf(x.p)) r = x; });
    return r;
  }
  function wdAt(x, di) { var r = actAt(di); return r ? (wpOf(r.p).m[x.id] || []) : x.wd; }
  function syncWd() { var t = dayIdx(Date.now()); plan().days.forEach(function (x) { x.wd = wdAt(x, t).slice(); }); }
  function draft() {
    if (!ui.draft) { var r = actAt(dayIdx(Date.now())), q = wpOf(ui.pwe) || (r && wpOf(r.p)) || plan().wp[0]; ui.draft = { id: q.id, m: JSON.parse(JSON.stringify(q.m)), dirty: false }; }
    return ui.draft;
  }
  function draftWd(id) { var D = draft(); return D.m[id] || (D.m[id] = []); }
  function dLim(x) { return LIM[domGroup(x)] || 7; }
  function planCheck(P) {
    // Zu oft (über dem Limit) und Doppelbelastung (Pull/Push an zwei Tagen hintereinander, auch So → Mo)
    var used = {}, slotG = [], clash = {}, cclash = {};
    P.days.forEach(function (x) { used[x.id] = draftWd(x.id).length; });
    // Belastung je Tag: Pull bzw. Push, wenn der Trainingstag mindestens 3 Übungen dieser Gruppe hat (die Hauptgruppe allein reicht nicht, Druck-Tage sind oft hantellastig)
    function load(x) { return ['pull', 'push'].filter(function (g) { return x.ex.filter(function (id) { return EXB[id] && EXB[id].g === g; }).length >= 3; }); }
    for (var w = 0; w < 7; w++) slotG.push([].concat.apply([], P.days.filter(function (x) { return draftWd(x.id).indexOf(w) >= 0; }).map(function (x) { return load(x).map(function (g) { return { id: x.id, g: g }; }); })));
    for (w = 0; w < 7; w++) {
      var nx = (w + 1) % 7;
      slotG[w].forEach(function (a) {
        slotG[nx].forEach(function (b) { if (b.g === a.g) { clash[w] = clash[nx] = 1; cclash[a.id] = cclash[b.id] = 1; } });
      });
    }
    return { used: used, clash: clash, cclash: cclash };
  }
  function miniWeek(P, m) {
    return WDN.map(function (n, w) {
      var xs = P.days.filter(function (x) { return (m[x.id] || []).indexOf(w) >= 0; });
      return '<span><small>' + n.charAt(0) + '</small>' + (xs.length ? xs.slice(0, 2).map(function (x) { return '<em style="--pc:var(' + PCOL[x.c] + ')">' + ic(dIcon(x)) + '</em>'; }).join('') : '<em class="r">·</em>') + '</span>';
    }).join('');
  }
  function viewPlanner(d, now) {
    var today = dayIdx(now), P = plan(), D = draft(), cur = wpOf(D.id), chk = planCheck(P), ra = actAt(today), w;
    var h = '<div class="pe-top rise" style="--i:0"><button class="x" data-pmanx="1" aria-label="Zurück">' + ic('back') + '</button><h2 class="pm-t">' + esc(cur.n) + '</h2></div>';
    if (D.dirty) h += '<div class="pdc' + (ui.pdisc ? ' warn' : '') + '">' + ic('edit') + '<span>Nicht gespeichert</span><button class="btn small ghost" data-pdiscok="1">Verwerfen</button><button class="btn small primary" data-psave="1">Speichern</button></div>';
    ui.pdisc = 0;
    // Woche Mo–So: Ablageplätze mit den gelegten Karten
    var slots = '';
    for (w = 0; w < 7; w++) {
      var here = P.days.filter(function (x) { return draftWd(x.id).indexOf(w) >= 0; });
      slots += '<div class="psl' + (w === wdOf(today) ? ' today' : '') + (chk.clash[w] ? ' clash' : '') + '" data-pslot="' + w + '" role="button" aria-label="' + WDN[w] + '"><b>' + WDN[w] + '</b><div class="pst">' +
        here.map(function (x) { var k = x.id + ':' + w; return '<span class="ptl' + (ui.pnt === k ? ' nw' : '') + (chk.used[x.id] > dLim(x) ? ' over' : '') + '" style="--pc:var(' + PCOL[x.c] + ')">' + ic(dIcon(x)) + '<span>' + esc(x.n) + '</span>' + (rpText(x) ? '<em>' + (dRp(x) ? dRp(x) + 'W' : '1×') + '</em>' : '') + '<button data-punset="' + k + '" aria-label="Entfernen">' + ic('close') + '</button></span>'; }).join('') +
        (here.length ? '' : '<i class="pdrop">' + ic('plus') + '</i>') + '</div>' + (chk.clash[w] ? ic('bolt', 'pwarn') : '') + '</div>';
    }
    ui.pnt = null;
    var gw = {}; for (w = 0; w < 7; w++) GORDER.forEach(function (g) { if (dayGroups(P.days.filter(function (x) { return draftWd(x.id).indexOf(w) >= 0; }), d)[g]) gw[g] = (gw[g] || 0) + 1; });
    h += '<section class="pwkl rise" style="--i:1">' + slots + '</section><div class="pgc wvb rise" style="--i:2">' + GORDER.filter(function (g) { return gw[g] || ['pull', 'push', 'core'].indexOf(g) >= 0; }).map(function (g) {
      return '<span class="g' + g + (gw[g] ? '' : ' z') + '" aria-label="' + gOf(g).n + ': ' + (gw[g] || 0) + ' Tage">' + ic(gOf(g).i) + (gw[g] || 0) + '×</span>'; }).join('') + '</div>';
    // Karten-Hand: alle Karten passen auf den Bildschirm (Überlappung wächst mit der Anzahl). Wischen hebt eine Karte hervor, nach oben ziehen legt sie
    var n = P.days.length + (P.days.length < 8 ? 1 : 0), cw = 96, W = Math.min(innerWidth, 680) - 44, step = n > 1 ? Math.min(cw + 10, (W - cw) / (n - 1)) : 0;
    h += '<section class="pkh rise" style="--i:3;--ov:' + (step - cw).toFixed(1) + 'px" data-noswipe="1">' + P.days.map(function (x, j) {
      var u = chk.used[x.id], lim = dLim(x), st = u > lim ? ' over' : u === lim ? ' full' : '';
      return '<div class="pk' + st + (chk.cclash[x.id] ? ' clash' : '') + (ui.psel === x.id ? ' sel' : '') + '" data-pkid="' + x.id + '" role="button" aria-label="' + esc(x.n) + '" style="--pc:var(' + PCOL[x.c] + ');--j:' + (j - (n - 1) / 2).toFixed(1) + '">' +
        '<span class="pki">' + ic(dIcon(x)) + '</span><b>' + esc(x.n) + '</b><span class="pkd" aria-label="' + u + ' von ' + lim + '">' + Array.apply(null, Array(Math.max(lim, u))).map(function (z, k) { return '<i' + (k < u ? ' class="on' + (k >= lim ? ' x' : '') + '"' : '') + '></i>'; }).join('') + '</span>' +
        ((st === ' over' || chk.cclash[x.id]) ? ic('bolt', 'pkw') : '') + '<button class="pke" data-pedit="' + x.id + '" aria-label="' + esc(x.n) + ' bearbeiten">' + ic('edit') + '</button></div>';
    }).join('') + (P.days.length < 8 ? '<button class="pk add" data-pnew="1" aria-label="Neuer Trainingstag">' + ic(ui.pnew ? 'close' : 'plus') + '</button>' : '') + '</section>';
    if (ui.pnew) h += '<div class="ppre">' + PRESETS.map(function (pr, j) { return '<button data-ppre="' + j + '" style="--pc:var(' + PCOL[pr.c] + ')">' + ic(pr.i) + pr.n + '</button>'; }).join('') + '</div>';
    // Meine Pläne: Name ändern, Mini-Woche, Status, Bearbeiten, Aktivieren (ab heute / Montag / Datum), Löschen
    var mon = today + 7 - wdOf(today);
    h += '<section class="sec wpl rise" style="--i:4"><h2 class="sec-h">' + ic('cards') + 'Meine Pläne</h2>' + P.wp.map(function (q) {
      var on = ra && ra.p === q.id, fut = (P.act || []).filter(function (x) { return x.p === q.id && x.a > today; }).sort(function (a, b) { return a.a - b.a; });
      var st = on ? '<span class="wps on">' + ic('check') + (ra.a > 0 ? 'aktiv seit ' + fmtShort(ra.a) : 'aktiv') + '</span>' : fut.length ? '' : '<span class="wps">gespeichert</span>';
      return '<div class="wpc' + (q.id === D.id ? ' cur' : '') + (on ? ' on' : '') + '"><div class="wpc-h"><input class="wpn" data-wpn="' + q.id + '" value="' + esc(q.n) + '" maxlength="18" aria-label="Name des Plans">' + st +
        fut.map(function (x) { return '<span class="wps fut">ab ' + fmtShort(x.a) + '<button data-actdel="' + x.a + '" aria-label="Wechsel entfernen">' + ic('close') + '</button></span>'; }).join('') + '</div>' +
        '<div class="wpm">' + miniWeek(P, q.id === D.id ? D.m : q.m) + '</div><div class="wpb">' +
        (q.id !== D.id ? '<button class="btn small" data-wpopen="' + q.id + '">' + ic('edit') + 'Bearbeiten</button>' : '<span class="wpe">' + ic('edit') + 'wird bearbeitet</span>') +
        '<button class="btn small' + (ui.pact === q.id ? ' primary' : '') + '" data-wpact="' + q.id + '">' + ic('play') + 'Aktivieren</button>' + (on ? '' : '<button class="x" data-wpdel="' + q.id + '" aria-label="Plan löschen">' + ic('trash') + '</button>') + '</div>' +
        (ui.pact === q.id ? '<div class="wpa"><button data-wpon="' + today + '">Ab heute</button><button data-wpon="' + mon + '">Ab Mo ' + fmtShort(mon) + '</button><label>' + ic('cal') + '<input type="date" data-wpdate="' + q.id + '" min="' + new Date(today * 864e5).toISOString().slice(0, 10) + '" aria-label="Ab Datum"></label></div>' : '') + '</div>';
    }).join('') + '<button class="wpc new" data-wpnew="1">' + ic('plus') + 'Neuer Plan</button></section>';
    return h;
  }
  function plannerPlace(id, w) {
    var a = draftWd(id); if (a.indexOf(w) >= 0) return;
    a.push(w); a.sort(); draft().dirty = true; ui.pnt = id + ':' + w; ui.fresh = false; render(); buzz(8);
  }
  function planSave() {
    var D = draft(), q = wpOf(D.id); q.m = JSON.parse(JSON.stringify(D.m)); D.dirty = false; ui.pdisc = 0;
    plan().cu = true; syncWd(); persist();
  }
  function planActivate(id, a) {
    var P = plan(); if (ui.draft && ui.draft.id === id && ui.draft.dirty) planSave();
    P.act = (P.act || []).filter(function (x) { return x.a !== a; }).concat([{ a: a, p: id }]).sort(function (x, y) { return x.a - y.a; });
    P.cu = true; ui.pact = null; syncWd(); persist(); ui.fresh = false; render(); toast(wpOf(id).n + ' aktiv ab ' + fmtShort(a), 'check');
  }
  function pkFocus(id) {
    if (ui.psel === id) return;
    ui.psel = id; buzz(4);
    document.querySelectorAll('.pk[data-pkid]').forEach(function (c) { c.classList.toggle('sel', c.dataset.pkid === id); });
  }
  // Hand: seitlich wischen = Karte hervorheben, nach oben ziehen = Geisterkarte folgt dem Finger, Ablage auf einem Tag
  var pdrag = null;
  document.addEventListener('pointerdown', function (e) {
    var hand = e.target.closest && e.target.closest('.pkh');
    if (!hand || e.target.closest('[data-pedit]') || e.target.closest('.pk.add')) return;
    var c = e.target.closest('.pk[data-pkid]');
    pdrag = { id: c ? c.dataset.pkid : null, el: c, x: e.clientX, y: e.clientY, mode: '', pid: e.pointerId, g: null, hov: null, hy: hand.getBoundingClientRect().top + hand.offsetHeight * 0.65 };
  });
  document.addEventListener('pointermove', function (e) {
    if (!pdrag || e.pointerId !== pdrag.pid) return;
    var dx = e.clientX - pdrag.x, dy = e.clientY - pdrag.y;
    if (!pdrag.mode) {
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) pdrag.mode = 'focus';
      else if (dy < -10 && pdrag.el) {
        var r = pdrag.el.getBoundingClientRect(), g = pdrag.el.cloneNode(true);
        g.className += ' ghost'; g.style.width = r.width + 'px'; g.style.height = r.height + 'px'; g.style.left = r.left + 'px'; g.style.top = r.top + 'px';
        document.body.appendChild(g); pdrag.g = g; pdrag.mode = 'drag'; pdrag.el.classList.add('lift'); pkFocus(pdrag.id); buzz(6);
      } else return;
    }
    e.preventDefault();
    if (pdrag.mode === 'focus') {
      var u = document.elementFromPoint(e.clientX, pdrag.hy), c = u && u.closest ? u.closest('.pk[data-pkid]') : null;
      if (c) pkFocus(c.dataset.pkid);
      return;
    }
    pdrag.g.style.transform = 'translate(' + dx + 'px,' + dy + 'px) rotate(' + Math.max(-8, Math.min(8, dx / 20)) + 'deg) scale(1.06)';
    var t = document.elementFromPoint(e.clientX, e.clientY), s = t && t.closest ? t.closest('[data-pslot]') : null;
    if (s !== pdrag.hov) { if (pdrag.hov) pdrag.hov.classList.remove('hov'); if (s) s.classList.add('hov'); pdrag.hov = s; }
  }, { passive: false });
  function pdragEnd(e) {
    if (!pdrag || (e && e.pointerId !== pdrag.pid)) return;
    var p = pdrag; pdrag = null;
    if (p.mode === 'focus') { ui.pnoclick = Date.now(); return; }
    if (p.mode !== 'drag') return;
    ui.pnoclick = Date.now(); p.el.classList.remove('lift');
    // Neuaufbau erst nach dem touchend: verschwindet die berührte Karte vorher aus dem DOM, schluckt der Browser den nächsten Tipp
    if (p.hov) { p.g.remove(); var w = +p.hov.dataset.pslot; setTimeout(function () { plannerPlace(p.id, w); }, 40); return; }
    // Kein Tag getroffen: Karte fliegt zurück in die Hand
    p.g.style.transition = 'transform .22s var(--ease)'; p.g.style.transform = 'none';
    setTimeout(function () { p.g.remove(); }, 230);
  }
  document.addEventListener('pointerup', pdragEnd);
  document.addEventListener('pointercancel', pdragEnd);
  function plannerClick(t) {
    var el, P = plan(), D, today = dayIdx(Date.now());
    if (t.closest('.pk.ghost')) return true;
    if (ui.pnoclick && Date.now() - ui.pnoclick < 350 && t.closest('.pkh')) return true;
    if ((el = t.closest('[data-punset]'))) { var a = el.dataset.punset.split(':'), wd = draftWd(a[0]), i = wd.indexOf(+a[1]); if (i >= 0) wd.splice(i, 1); draft().dirty = true; ui.fresh = false; render(); return true; }
    if ((el = t.closest('[data-pslot]')) && ui.psel) { plannerPlace(ui.psel, +el.dataset.pslot); return true; }
    if ((el = t.closest('.pk[data-pkid]')) && !t.closest('[data-pedit]')) { if (ui.psel === el.dataset.pkid) { ui.psel = null; el.classList.remove('sel'); } else pkFocus(el.dataset.pkid); return true; }
    if (t.closest('[data-psave]')) { planSave(); ui.fresh = false; render(); toast('Plan gespeichert', 'check'); return true; }
    if (t.closest('[data-pdiscok]')) { ui.pwe = draft().id; ui.draft = null; ui.pdisc = 0; ui.fresh = false; render(); toast('Verworfen', 'undo'); return true; }
    if (t.closest('[data-pmanx]')) {
      if (ui.draft && ui.draft.dirty) { ui.pdisc = 1; ui.fresh = false; render(); $('app').scrollTo({ top: 0, behavior: 'smooth' }); return true; }
      ui.pman = false; ui.pnew = false; ui.draft = null; ui.psel = null; ui.pact = null; ui.fresh = true; render(); $('app').scrollTo(0, 0); return true;
    }
    if ((el = t.closest('[data-wpopen]'))) {
      if (ui.draft && ui.draft.dirty) { ui.pdisc = 1; ui.fresh = false; render(); $('app').scrollTo({ top: 0, behavior: 'smooth' }); return true; }
      ui.pwe = el.dataset.wpopen; ui.draft = null; ui.psel = null; ui.fresh = true; render(); $('app').scrollTo(0, 0); return true;
    }
    if ((el = t.closest('[data-wpact]'))) { ui.pact = ui.pact === el.dataset.wpact ? null : el.dataset.wpact; ui.fresh = false; render(); return true; }
    if ((el = t.closest('[data-wpon]'))) { planActivate(ui.pact, +el.dataset.wpon); return true; }
    if ((el = t.closest('[data-actdel]'))) { var aa = +el.dataset.actdel; P.act = P.act.filter(function (x) { return x.a !== aa; }); P.cu = true; syncWd(); persist(); ui.fresh = false; render(); return true; }
    if ((el = t.closest('[data-wpdel]'))) {
      var id = el.dataset.wpdel; P.wp = P.wp.filter(function (q) { return q.id !== id; }); P.act = P.act.filter(function (x) { return x.p !== id; });
      if (ui.draft && ui.draft.id === id) { ui.draft = null; ui.pwe = null; }
      P.cu = true; syncWd(); persist(); ui.fresh = false; render(); toast('Plan gelöscht', 'trash'); return true;
    }
    if (t.closest('[data-wpnew]')) {
      if (ui.draft && ui.draft.dirty) { ui.pdisc = 1; ui.fresh = false; render(); return true; }
      var nq = { id: 'w' + Date.now().toString(36), n: wpName(), m: {} }; P.wp.push(nq); P.cu = true; persist();
      ui.pwe = nq.id; ui.draft = null; ui.psel = null; ui.fresh = true; render(); $('app').scrollTo(0, 0); return true;
    }
    return false;
  }
  document.addEventListener('change', function (ev) {
    var t = ev.target;
    if (t.dataset && t.dataset.wpn && !t.value.trim()) { var qn = wpOf(t.dataset.wpn); if (qn) { qn.n = wpName(qn.id); persist(); ui.fresh = false; render(); } return; }
    if (t.dataset && t.dataset.wpdate && t.value) { var q = t.value.split('-'); planActivate(t.dataset.wpdate, Math.round(Date.UTC(+q[0], +q[1] - 1, +q[2]) / 864e5)); }
  });
  document.addEventListener('input', function (ev) {
    var t = ev.target;
    if (t.dataset && t.dataset.wpn) { var q = wpOf(t.dataset.wpn); if (q) { if (t.value.trim()) q.n = t.value.slice(0, 18); plan().cu = true; clearTimeout(planT); planT = setTimeout(persist, 500); var h2 = document.querySelector('.pm-t'); if (h2 && ui.draft && ui.draft.id === q.id) h2.textContent = q.n; } }
  });
  function viewPlanEdit(d, day) {
    var h = '<div class="pe-top rise" style="--i:0"><button class="x" data-pback="1" aria-label="Zurück">' + ic('back') + '</button><input id="pe-n" class="pe-n" type="text" maxlength="18" value="' + esc(day.n) + '" aria-label="Name"><button class="x" data-pdel="' + day.id + '" aria-label="Tag löschen"' + (ui.pdel ? ' style="color:var(--danger)"' : '') + '>' + (ui.pdel ? '<b class="sure">Sicher?</b>' : ic('trash')) + '</button></div>';
    // Aussehen und Rhythmus: Icon, Farbe, Wochentage, Wiederholung (jede / alle 2 / alle 3 Wochen / einmalig ab Startwoche)
    var rp = dRp(day), st = dSt(day), a = new Date(st * 864e5), b = new Date((st + 6) * 864e5);
    h += '<section class="pe-set rise" style="--i:1;--pc:var(' + PCOL[day.c] + ')"><div class="pe-ic" role="group" aria-label="Icon">' + DAYI.map(function (k) { return '<button data-pic="' + k + '" aria-pressed="' + (dIcon(day) === k) + '" aria-label="Icon ' + k + '">' + ic(k) + '</button>'; }).join('') + '</div>' +
      '<div class="pe-c">' + PCOL.map(function (c, j) { return '<button data-pc="' + j + '" style="--pc:var(' + c + ')" aria-pressed="' + (day.c === j) + '" aria-label="Farbe ' + (j + 1) + '"><i class="pdot big"></i></button>'; }).join('') + '</div>' +
      '<div class="pe-rp" role="group" aria-label="Wiederholung">' + [[1, 'Jede Woche'], [2, 'Alle 2 Wo.'], [3, 'Alle 3 Wo.'], [0, 'Einmalig']].map(function (o) { return '<button data-prp="' + o[0] + '" aria-pressed="' + (rp === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</div>' +
      (rp !== 1 ? '<div class="pe-st"><button class="x" data-pst="-1" aria-label="Woche früher">' + ic('back') + '</button><span>' + (rp ? 'Ab ' : 'Nur ') + a.getUTCDate() + '.' + (a.getUTCMonth() + 1) + '. – ' + b.getUTCDate() + '.' + (b.getUTCMonth() + 1) + '.</span><button class="x" data-pst="1" aria-label="Woche später">' + ic('chev') + '</button></div>' : '') + '</section>';
    // Übungen: Filter (Zahl = im Plan), Suche, Liste
    var inP = day.ex.filter(function (id) { return d.unlocked[id]; });
    h += '<section class="sec rise" style="--i:2"><h2 class="sec-h">' + ic('dumb') + 'Übungen<small>' + inP.length + ' im Plan</small></h2><div class="pgf pgf2" role="group"><button class="pg" data-pef="all" aria-pressed="' + (ui.pf === 'all') + '">Alle</button>' +
      GORDER.map(function (k) { var g = gOf(k), n = inP.filter(function (id) { return EXB[id].g === k; }).length; return '<button class="pg g' + k + '" data-pef="' + k + '" aria-pressed="' + (ui.pf === k) + '" aria-label="' + g.n + ': ' + n + ' im Plan">' + ic(g.i) + (n ? '<sup>' + n + '</sup>' : '') + '</button>'; }).join('') + '</div>' +
      '<input id="pe-q" class="pe-q" type="search" placeholder="Suchen" value="' + esc(ui.pq) + '" aria-label="Übung suchen"><div id="pe-list">' + peList(d, day) + '</div></section>';
    return h;
  }
  function calClick(t) {
    var el, today = dayIdx(Date.now());
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
      if (cd !== s0) { ui.pd = cd; ui.pdx = true; ui.pmode = null; } ui.fresh = false; render(); return true;
    }
    if ((el = t.closest('[data-cnav]'))) { calMove(+el.dataset.cnav); return true; }
    if (t.closest('[data-cmode]')) { ui.cm = !ui.cm; ui.ca = ui.pd == null ? today : ui.pd; ui.cmx = true; ui.fresh = false; render(); return true; }
    if (t.closest('[data-cnow]')) { ui.pd = today; ui.ca = today; ui.pdx = true; ui.fresh = false; render(); return true; }
    if ((el = t.closest('[data-pft]'))) { ui.pft = el.dataset.pft; ui.fresh = false; render(); buzz(4); return true; }
    if (t.closest('[data-pdedit]')) { ui.pmode = null; ui.sheet = { pday: true }; sheetOpen(pdayHtml()); return true; }
    if (t.closest('[data-pnts]')) { openNts(); return true; }
    if ((el = t.closest('[data-pfo]'))) { ui.fsd = +el.dataset.pfo; goTab('food'); return true; }
    if (t.closest('[data-pdays]')) { openDays(); return true; }
    if ((el = t.closest('[data-pdb]'))) { var pk = el.dataset.pdb; ui.pdo[pk] = !ui.pdo[pk]; el.setAttribute('aria-expanded', ui.pdo[pk]); el.parentNode.classList.toggle('open', ui.pdo[pk]); return true; }
    if ((el = t.closest('[data-pman]'))) { ui.pman = true; ui.draft = null; ui.psel = null; ui.pdisc = 0; ui.pnew = el.dataset.pman === 'new'; ui.fresh = true; render(); $('app').scrollTo(0, 0); return true; }
    if ((el = t.closest('[data-gotab]'))) { goTab(el.dataset.gotab); return true; }
    if ((el = t.closest('[data-rm]'))) { ui.rm = Math.max(-11, Math.min(0, ui.rm + (+el.dataset.rm))); ui.fresh = false; render(); return true; }
    if ((el = t.closest('[data-wr]'))) { ui.wr = el.dataset.wr; ui.fresh = false; render(); return true; }
    var sd = ui.pd == null ? today : ui.pd, ids = function (di) { return schedFor(di).map(function (x) { return x.id; }); };
    if ((el = t.closest('[data-pmode]'))) {
      var pm = el.dataset.pmode, of0 = offAt(sd), f0 = ovF(sd), P3 = plan(), on0 = { swap: f0.w !== undefined, skip: !!f0.s, repl: !!f0.r, add: !!f0.a }[pm];
      if (pm === 'swap' && ui.pmode === 'swap') { ui.pmode = null; ui.fresh = false; render(); return true; }
      if ((pm === 'vac' || pm === 'sick') && of0 && of0.k === pm) { P3.off.splice(of0.i, 1); ui.pmode = null; persist(); pdDone(); toast('Zeitraum gelöscht', pm === 'vac' ? 'sun' : 'sick'); return true; }
      if (on0) { if (pm === 'swap') swapClear(sd); else { delete f0[{ skip: 's', repl: 'r', add: 'a' }[pm]]; ovSetF(sd, f0); } ui.pmode = null; ui.pfl = sd; persist(); pdDone(); return true; }
      if (pm === 'skip') { swapClear(sd); ovSetF(sd, { s: 1 }); ui.pmode = null; ui.pfl = sd; persist(); pdDone(); toast('Ausgesetzt', 'skip'); return true; }
      // Tauschen: Fenster zu, zweiter Tag im Kalender; übrige Aktionen zeigen ihre Auswahl im Fenster
      if (pm === 'swap') { ui.pmode = 'swap'; ui.pft = 't'; if (ui.sheet) closeSheet(true); ui.fresh = false; render(); return true; }
      ui.pmode = ui.pmode === pm ? null : pm; if (ui.sheet && ui.sheet.pday) $('sheet').innerHTML = pdayHtml(); else { ui.fresh = false; render(); } return true;
    }
    if ((el = t.closest('[data-preplx]'))) { swapClear(sd); var fr = ovF(sd); delete fr.s; fr.r = [el.dataset.preplx]; ovSetF(sd, fr); ui.pmode = null; ui.pfl = sd; persist(); pdDone(); return true; }
    if ((el = t.closest('[data-paddx]'))) { var fx = ovF(sd), pa = pDay(el.dataset.paddx); delete fx.s; fx.a = (fx.a || []).concat([el.dataset.paddx]); ovSetF(sd, fx); ui.pmode = null; ui.pfl = sd; ui.pft = 't'; if (pa) toast(pa.n + ' zusätzlich', 'plus'); buzz(8); persist(); pdDone(); return true; }
    if (t.closest('[data-wgnow]')) { openWeight(); return true; }
    if ((el = t.closest('[data-poff]'))) { var P0 = plan(), n = +el.dataset.poff; P0.off = (P0.off || []).concat([{ a: sd, b: sd + n - 1, k: ui.pmode === 'sick' ? 'sick' : 'vac' }]); toast(ui.pmode === 'sick' ? 'Krank eingetragen' : 'Urlaub eingetragen', ui.pmode === 'sick' ? 'sick' : 'sun'); ui.pmode = null; persist(); pdDone(); return true; }
    return false;
  }
  function planClick(t) {
    if (ui.tab === 'tage' && ui.pman && !ui.pe && plannerClick(t)) return true;
    if (calClick(t)) return true;
    var el, P = plan(), day, a;
    function done(keepScroll) { persist(); ui.fresh = false; render(); }
    if ((el = t.closest('[data-pedit]'))) { if (ui.sheet && ui.sheet.pdays) { closeSheet(true); ui.sheet = null; } ui.pe = el.dataset.pedit; ui.pdel = 0; ui.pf = domGroup(pDay(ui.pe)) || 'all'; ui.pq = ''; ui.fresh = true; render(); $('app').scrollTo(0, 0); return true; }
    if (t.closest('[data-pback]')) { ui.pe = null; ui.pdel = 0; ui.fresh = true; render(); $('app').scrollTo(0, 0); return true; }
    if (t.closest('[data-pnew]')) { ui.pnew = !ui.pnew; ui.fresh = false; render(); return true; }
    if ((el = t.closest('[data-ppre]'))) {
      if (ui.sheet && ui.sheet.pdays) closeSheet(true); var pr = PRESETS[+el.dataset.ppre], ids = pr.ids ? pr.ids.slice() : EX.filter(function (e) { return pr.f.indexOf(e.g) >= 0; }).map(function (e) { return e.id; });
      var nd = { id: 'p' + Date.now().toString(36), n: pr.n === 'Eigener Tag' ? 'Tag ' + (P.days.length + 1) : pr.n, c: pr.c, i: pr.i, wd: [], ex: ids };
      P.cu = true; P.days.push(nd); ui.pnew = false; ui.pe = nd.id; ui.pf = 'all'; ui.pq = ''; ui.fresh = true; persist(); render(); $('app').scrollTo(0, 0); return true;
    }
    if ((el = t.closest('[data-pc]')) && ui.pe) { day = pDay(ui.pe); if (day) { P.cu = true; day.c = +el.dataset.pc; done(); } return true; }
    if ((el = t.closest('[data-ptog]')) && ui.pe) { day = pDay(ui.pe); if (day) { P.cu = true; var xi = day.ex.indexOf(el.dataset.ptog); if (xi >= 0) day.ex.splice(xi, 1); else day.ex = sortIds(day.ex.concat([el.dataset.ptog])); done(); } return true; }
    if ((el = t.closest('[data-pic]')) && ui.pe) { day = pDay(ui.pe); if (day) { P.cu = true; day.i = el.dataset.pic; done(); } return true; }
    if ((el = t.closest('[data-prp]')) && ui.pe) { day = pDay(ui.pe); if (day) { P.cu = true; var rp = +el.dataset.prp; if (rp === 1) { delete day.rp; delete day.st; } else { day.rp = rp; day.st = dSt(day); } done(); } return true; }
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
