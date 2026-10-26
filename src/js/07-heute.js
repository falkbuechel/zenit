  // ---------- Heute
  var STG = {};
  function stageOf(e) {
    if (STG[e.id] !== undefined) return STG[e.id];
    var st = 0;
    if (e.req) st = 1 + Math.max.apply(null, e.req.map(function (q) { return stageOf(EXB[q[0]]); }));
    return (STG[e.id] = st);
  }
  function viewToday(d, now) {
    var today = dayIdx(now), td = d.byDay[today], n = td ? Object.keys(td.ex).length : 0, ss = streakInfo(now);
    todayN = n;
    var eff = ss.mode === 'safe' ? ss.n : (ss.mode === 'none' || ss.mode === 'lost') ? 1 : ss.n + 1, mu = mult(eff);
    var nextM = MILES.filter(function (m) { return m > eff; })[0];
    var extra = td ? td.extra : 0, reached = n >= DAILY, status;
    var fx = function (x) { return String(x).replace('.', ','); };
    if (ss.mode === 'safe') status = '<div class="status safe">' + ic('check') + 'Heute gesichert · Tag ' + ss.n + '</div>';
    else if (ss.mode === 'last') status = '<div class="status last">' + ic('clock') + 'Letzte Chance · <span id="cd">' + cdText(msToMidnight(now)) + '</span></div>';
    else if (ss.mode === 'open') status = '<div class="status">' + ic('clock') + 'Heute noch offen · <span id="cd">' + cdText(msToMidnight(now)) + '</span></div>';
    else if (ss.mode === 'lost') status = '<div class="status">' + ic('bolt') + 'Neue Serie starten</div>';
    else status = '<div class="status">' + ic('bolt') + 'Erster Satz startet deine Serie</div>';
    var ringP = Math.min(n / DAILY, 1);
    var w0 = today - (new Date(now).getDay() + 6) % 7, wx = 0, lw = 0, wd = '';
    d.days.forEach(function (x) { if (x.d >= w0) wx += x.all; else if (x.d >= w0 - 7) lw += x.all; });
    var tgt = Math.max(lw, 150), beat = wx >= tgt;
    for (var wi = 0; wi < 7; wi++) { var di = w0 + wi; wd += '<i class="' + (ss.set[di] ? 'on' : ss.set[di - 1] && ss.set[di + 1] && di < today ? 'rs' : '') + (di === today ? ' td' : '') + '"></i>'; }
    var ser = '<div class="hrow hser go" data-go="cal" role="button" tabindex="0" aria-label="Serie ' + ss.n + ' Tage, Kalender öffnen"><div class="hsf">' + FL + '<b>' + ss.n + '</b></div><div class="hsw">' + wd + '</div>' +
      '<em class="hsm' + (mu > 1 ? ' on' : '') + '">×' + fx(mu) + '</em><i class="hsb' + (beat ? ' gold' : '') + '"><i style="--p:' + Math.min(1, wx / tgt).toFixed(3) + '"></i></i><small class="hsv">' + (beat ? ic('trophy') + 'Vorwoche besiegt · ' : 'Vorwoche · ') + wx + ' / ' + tgt + ' XP' + (nextM ? ' · ×' + fx(mult(nextM)) + ' ab Tag ' + nextM : '') + '</small></div>';
    var h = ss.mode === 'open' || ss.mode === 'last' ? status : '';
    var tot = 0, doneS = 0, sel = todaySel(today);
    function vis0(e) { return (d.unlocked[e.id] && (!sel.set || sel.set[e.id])) || !!todayLog(e.id, today); }
    var gAv = {}; EX.forEach(function (e) { if (vis0(e)) gAv[e.g] = 1; });
    if (ui.pg !== 'all' && !gAv[ui.pg]) ui.pg = 'all';
    function vis(e) { return (ui.pg === 'all' || e.g === ui.pg) && vis0(e); }
    EX.forEach(function (e) { if (!vis(e)) return; tot += e.sets; var tl = todayLog(e.id, today); doneS += tl ? Math.min(tl.s.length, e.sets) : 0; });
    var tname = sel.key === 'all' ? 'Alle' : sel.days.length ? sel.days.map(function (x) { return x.n; }).join(' + ') : 'Frei';
    todayVis = 0;
    var L = []; GORDER.forEach(function (k) { EX.forEach(function (e) { if (e.g === k && vis(e)) L.push(e); }); });
    function dn(e) { var tl = todayLog(e.id, today); return !!tl && tl.s.length >= rxNow(d, e).s; }
    var cur = L.filter(function (e) { return e.id === ui.hsel; })[0] || L.filter(function (e) { return !dn(e); })[0] || L[0], nd = L.filter(dn).length, hz = ui.hz; ui.hz = false;
    // Herausgezoomt: Bergpfad zum Zenit
    if (ui.hpath) return h + pathHtml(d, hz);
    if (ui.arena && cur) return arenaHtml(d, today, L, cur, dn, tname, nd);
    ui.arena = false;
    // Übersicht: Training mit einem Start-Knopf (öffnet die Arena), darunter Tagesziel, Bergpfad und Serie als ruhige Zeilen
    var dm = durEst(), mins = sel.days.reduce(function (a, x) { return a + (dm[x.id] || 45); }, 0), lv = level(d.xp), all = cur && nd === L.length;
    h += '<section class="tov rise" style="--i:1"><div class="tov-h"><div><small>' + ic('cal') + 'Training heute</small><b>' + esc(tname) + '</b></div><button class="x" data-swap="1" aria-label="Heute ändern">' + ic('swap') + '</button></div>';
    if (!cur) h += sel.key === 'rest' ? restCard(today) : '<p class="muted">Heute keine Übungen</p>';
    else h += '<p class="tov-m">' + L.length + ' Übungen' + (mins ? ' · ~' + mins + ' Min' : '') + '</p><div class="tov-b"><i style="--p:' + (nd / L.length).toFixed(3) + '"></i></div><span class="tov-n">' + nd + ' / ' + L.length + '</span>' +
      '<button class="btn primary big tov-go" data-arena="1">' + ic(all ? 'check' : 'play') + (all ? 'Erledigt · ansehen' : nd ? 'Weiter trainieren' : 'Training starten') + '</button>';
    h += '</section><div class="hrows rise" style="--i:2">' +
      '<div class="hrow' + (reached ? ' got' : '') + '"><i class="dg-r" style="--p:' + ringP.toFixed(3) + '"><b>' + Math.min(n, DAILY) + '/' + DAILY + '</b></i><span><b>Tagesziel</b><small>' + (reached ? 'Geschafft · +40 XP' + (extra ? ' · +' + extra * 30 + ' Bonus' : '') : 'Noch ' + (DAILY - n) + (DAILY - n === 1 ? ' Übung' : ' Übungen') + ' bis +40 XP') + '</small></span></div>' +
      '<div class="hrow' + (d.warm[today] ? ' got' : '') + '" data-warm="1" role="button" tabindex="0">' + ic('sun') + '<span><b>Aufwärmen</b><small>' + (d.warm[today] ? 'Erledigt · +' + WARM_XP + ' XP' : '3 Min · +' + WARM_XP + ' XP') + '</small></span>' + ic(d.warm[today] ? 'check' : 'plus') + '</div>' +
      '<div class="hrow" data-zoom="1" role="button" tabindex="0">' + ic('peak') + '<span><b>Bergpfad</b><small>Lv ' + lv + ' · ' + TIERS[tierOfLevel(lv)] + '</small></span>' + ic('chev') + '</div>' +
      ser + '</div>';
    return h;
  }
  function arenaHtml(d, today, L, cur, dn, tname, nd) {
    // Arena (Vollbild beim Trainieren): kleine Karte oben (wischen = andere Übung), darunter der Zähler für den nächsten Satz.
    // Ein Knopf trägt ein und startet die Pause (Vollbild-Ring), danach geht es von selbst zum nächsten Satz. Erledigte Sätze antippen = ändern
    var c = cardOf(d, cur), r = rarOf(cur), q = rxNow(d, cur), tl = todayLog(cur.id, today), s = tl ? tl.s : [], ex2 = Object.assign({}, cur, { sets: q.s, goal: q.r }), cc = cCost(cur, c.lv), pills = '', dir = ui.hdir || 0, done = dn(cur);
    ui.hdir = 0; ui.harr = L.map(function (e) { return e.id; }); ui.hcur = cur.id;
    for (var i = 0; i < s.length; i++) pills += pill(ex2, i, s, tl);
    var nxE = L.slice(L.indexOf(cur) + 1).concat(L).filter(function (e) { return e !== cur && !dn(e); })[0], key = cur.id + ':' + s.length, mid;
    if (!ui.arv || ui.arv.k !== key) ui.arv = { k: key, v: setPrefill(ex2, s.length, s, lastBefore(cur.id, today), today) };
    if (!done) {
      var pg = progFor(cur, today), kg = cur.kg ? (tl && tl.k) || (pg && pg.kg) || (lastBefore(cur.id, today) || {}).k : 0;
      mid = '<p class="ar-set">Satz ' + (s.length + 1) + ' / ' + q.s + ' · Ziel ' + q.r + (cur.u === 'Sek.' ? ' s' : '') + (kg ? ' · <button class="ar-kg" data-pill="' + key + '">' + kg + ' kg</button>' : '') + '</p>' +
        '<div class="ar-cnt"><button class="sb" data-arv="-1" aria-label="Weniger">' + ic('minus') + '</button><b id="arn" class="' + (ui.arv.v >= q.r ? 'hit' : '') + '">' + ui.arv.v + '</b><button class="sb" data-arv="1" aria-label="Mehr">' + ic('plus') + '</button></div>' +
        '<div class="ar-act"><button class="btn primary big ar-go" data-arsave="1">' + ic('check') + 'Satz eintragen</button>' + (cur.u === 'Sek.' ? '<button class="x ar-tm" data-timer="' + cur.id + '" aria-label="Stoppuhr">' + ic('play') + '</button>' : '') + '</div>';
    } else mid = '<p class="ar-set ok">' + ic('check') + 'Erledigt</p><div class="ar-act">' + (nxE ? '<button class="btn primary big ar-go" data-hsel="' + nxE.id + '">Weiter: ' + esc(nxE.n) + ic('chev') + '</button>' : '<button class="btn big ar-go" data-arx="1">' + ic('check') + 'Training fertig</button>') + '</div>';
    return '<section class="arm-v" data-noswipe="1"><div class="arm-h"><button class="x" data-arx="1" aria-label="Arena verlassen">' + ic('close') + '</button><div><b>' + esc(tname) + '</b><small>' + nd + ' / ' + L.length + ' Übungen</small></div>' +
      (sess ? '<span></span>' : '<button class="x" data-sess="start" aria-label="Zeit starten">' + ic('clock') + '</button>') + '</div>' +
      '<div class="arm-s" id="arm-s"><button class="hc arc ' + RAR[r][2] + ' l' + lookOf(c.lv) + (cardReady(d, cur) ? ' rdy' : '') + (dir ? (dir > 0 ? ' inr' : ' inl') : '') + '" data-cardo="' + cur.id + '"><small>' + RAR[r][0] + '</small><b>' + esc(cur.n) + '</b><span>' + Math.min(s.length, q.s) + '/' + q.s + '</span>' +
      '<em>Lv ' + c.lv + '</em><i class="hcb"><i style="--p:' + (cc ? Math.min(1, c.kp / cc) : 1).toFixed(3) + '"></i></i></button></div>' +
      '<div class="ar-dots">' + L.map(function (e) { return '<button class="' + (dn(e) ? 'd' : '') + (e === cur ? ' c' : '') + '" data-hsel="' + e.id + '" aria-label="' + esc(e.n) + '"></button>'; }).join('') + '</div>' +
      cardProg(d, cur) + mid + (pills ? '<div class="ar-pills">' + pills + '</div>' : '') + '</section>';
  }
  function pathHtml(d, hz) {
    // Bergpfad zum Zenit: Konto-Level als Stationen (unten Vergangenheit, oben Zukunft), Titel-Stufen als Meilensteine
    var lv = level(d.xp), c0 = lvXp(lv), c1 = lvXp(lv + 1), top = Math.max(lv + 7, 12), lo = Math.max(1, lv - 4), h = '';
    for (var k = top; k >= lo; k--) {
      var tr = tierOfLevel(k), ms = k > 1 && tierOfLevel(k - 1) !== tr, st = k < lv ? ' ok' : k === lv ? ' cur' : '';
      h += '<div class="bp-n' + st + (ms ? ' ms' : '') + '" style="--x:' + Math.round(Math.sin(k * 1.3) * 34) + 'px"><i>' + (k < lv ? ic('check') : ms && k > lv ? ic('trophy') : k) + '</i>' +
        (k === lv ? '<span><b>Du · Lv ' + lv + '</b> ' + (d.xp - c0) + ' / ' + (c1 - c0) + ' XP</span>' : ms ? '<span>Lv ' + k + ' · Titel ' + TIERS[tr] + '</span>' : '') + '</div>';
    }
    return '<section class="bp' + (hz ? ' zout' : '') + '" data-zoom="1"><div class="bp-sky"><svg viewBox="0 0 360 90" preserveAspectRatio="none" aria-hidden="true"><path d="M0 90 70 44 108 62 180 8 250 56 292 36 360 90z"/><path class="sn" d="M164 22 180 8 197 24 186 20 180 26 172 19z"/></svg><b class="bp-peak">' + ic('peak') + 'Zenit</b></div>' +
      '<div class="bp-path">' + h + '</div><p class="bp-hint">Antippen: zurück zum Training</p></section>';
  }
