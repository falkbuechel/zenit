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
    var reached = n >= DAILY, fx = function (x) { return String(x).replace('.', ','); };
    var sel = todaySel(today);
    function vis0(e) { return (d.unlocked[e.id] && (!sel.set || sel.set[e.id])) || !!todayLog(e.id, today); }
    var gAv = {}; EX.forEach(function (e) { if (vis0(e)) gAv[e.g] = 1; });
    if (ui.pg !== 'all' && !gAv[ui.pg]) ui.pg = 'all';
    function vis(e) { return (ui.pg === 'all' || e.g === ui.pg) && vis0(e); }
    var tname = sel.key === 'all' ? 'Alle' : sel.days.length ? sel.days.map(function (x) { return x.n; }).join(' + ') : 'Frei';
    todayVis = 0;
    var L = []; GORDER.forEach(function (k) { EX.forEach(function (e) { if (e.g === k && vis(e)) L.push(e); }); });
    function dn(e) { var tl = todayLog(e.id, today); return !!tl && tl.s.length >= rxNow(d, e).s; }
    var cur = L.filter(function (e) { return e.id === ui.hsel; })[0] || L.filter(function (e) { return !dn(e); })[0] || L[0], nd = L.filter(dn).length, hz = ui.hz; ui.hz = false;
    // Herausgezoomt: Bergpfad zum Zenit
    if (ui.hpath) return pathHtml(d, hz);
    if (ui.arena && cur) return arenaHtml(d, today, L, cur, dn, tname, nd);
    ui.arena = false;
    // Startseite (wie ein Spiel-Hauptbildschirm): oben Level und Serie, links/rechts runde Knöpfe, Mitte Bühne mit Maskottchen (Antippen = Training im Vollbild), unten Plan und Start
    var dm = durEst(), mins = sel.days.reduce(function (a, x) { return a + (dm[x.id] || 45); }, 0), lv = level(d.xp), c0 = lvXp(lv), c1 = lvXp(lv + 1), tr = tierOfLevel(lv), all = cur && nd === L.length;
    var rest = !cur && sel.key === 'rest', mood = rest ? 'sleep' : all || reached ? 'happy' : 'idle', nx = rest ? nextDayText(today) : '';
    var cd = ss.mode === 'open' || ss.mode === 'last' ? '<small id="cd">' + cdText(msToMidnight(now)) + '</small>' : ss.mode === 'safe' ? '<small>' + ic('check') + '</small>' : '';
    return '<section class="hm' + (rest ? ' rest' : '') + '">' +
      '<div class="hm-top"><div class="hm-lv" data-zoom="1" role="button" tabindex="0" aria-label="Level ' + lv + ', Bergpfad"><i>' + lv + '</i><span><b>' + TIERS[tr] + '</b><i class="hm-xp"><i style="--p:' + ((d.xp - c0) / (c1 - c0)).toFixed(3) + '"></i></i></span></div>' +
      '<div class="hm-st go ' + ss.mode + '" data-go="cal" role="button" tabindex="0" aria-label="Serie ' + ss.n + ' Tage">' + FL + '<b>' + ss.n + '</b>' + (mu > 1 ? '<em>×' + fx(mu) + '</em>' : '') + cd + '</div></div>' +
      '<div class="hm-bg" aria-hidden="true" data-tag="' + (rest ? 'Ruht' : all ? 'Erledigt' : nd ? 'Läuft' : 'Bereit') + '"><i class="hm-glow"></i><svg viewBox="0 0 360 120" preserveAspectRatio="none"><path class="m1" d="M0 120 0 70 60 38 110 64 175 18 240 58 300 34 360 62 360 120z"/><path class="m2" d="M0 120 0 92 80 72 150 90 230 70 300 88 360 76 360 120z"/></svg></div>' +
      '<div class="hm-side l"><div class="hm-b' + (reached ? ' got' : '') + '"><i class="dg-r" style="--p:' + Math.min(n / DAILY, 1).toFixed(3) + '"><b>' + Math.min(n, DAILY) + '/' + DAILY + '</b></i><small>Ziel</small></div>' +
      '<div class="hm-b' + (d.warm[today] ? ' got' : '') + '" data-warm="1" role="button" tabindex="0" aria-label="Aufwärmen"><i>' + ic(d.warm[today] ? 'check' : 'sun') + '</i><small>Warm</small></div></div>' +
      '<div class="hm-side r"><div class="hm-b" data-zoom="1" role="button" tabindex="0" aria-label="Bergpfad"><i>' + ic('peak') + '</i><small>Pfad</small></div>' +
      '<button class="hm-b" data-swap="1" aria-label="Heute ändern"><i>' + ic('swap') + '</i><small>Ändern</small></button></div>' +
      '<div class="hm-hero"' + (cur ? ' data-arena="1" role="button" tabindex="0" aria-label="Training öffnen"' : '') + '>' + mascot(mood, tr) + '</div>' +
      '<div class="hm-plan"><b>' + esc(rest ? 'Heute frei' : tname) + '</b><small>' + (cur ? L.length + ' Übungen' + (mins ? ' · ~' + mins + ' Min' : '') : rest ? (nx ? 'Weiter: ' + esc(nx) : 'Erholung zählt') : 'Heute keine Übungen') + '</small>' +
      (cur ? '<i class="hm-pb"><i style="--p:' + (nd / L.length).toFixed(3) + '"></i></i>' : '') + '</div>' +
      (cur ? '<button class="btn primary big hm-go" data-arena="1">' + ic(all ? 'check' : 'play') + (all ? 'Erledigt · ansehen' : nd ? 'Weiter trainieren · ' + nd + '/' + L.length : 'Training starten') + '</button>'
        : '<button class="btn big hm-go" data-swap="1">' + ic('swap') + (rest ? 'Trotzdem trainieren' : 'Training wählen') + '</button>') + '</section>';
  }
  // Maskottchen (Platzhalter bis zur Illustration): Stimmung idle | happy | sleep | cheer, Stirnband in der Farbe der Titel-Stufe, wird mit der Stufe etwas größer
  var MTC = ['#8fa39a', '#8fa39a', '#5b8fd6', '#a374d8', '#ffc94a', '#57c7b8'];
  function mascot(mood, tr) {
    var eyes = mood === 'sleep' ? '<path d="M40 63q6 4 12 0M68 63q6 4 12 0" class="ln"/>' : mood === 'happy' || mood === 'cheer' ? '<path d="M40 65q6-8 12 0M68 65q6-8 12 0" class="ln"/>' :
      '<circle cx="46" cy="62" r="5.5" class="ey"/><circle cx="74" cy="62" r="5.5" class="ey"/><circle cx="48" cy="60" r="1.8" fill="#fff"/><circle cx="76" cy="60" r="1.8" fill="#fff"/>';
    var mouth = mood === 'sleep' ? '<ellipse cx="60" cy="80" rx="3" ry="2.5" class="ey"/>' : mood === 'idle' ? '<path d="M53 78q7 6 14 0" class="ln"/>' : '<path d="M49 75q11 16 22 0z" class="ey"/>';
    var arms = mood === 'cheer' ? '<path d="M22 70 8 44M98 70l14-26" class="ar"/>' : '<path d="M20 82 10 96M100 82l10 14" class="ar"/>';
    return '<svg class="masc ' + mood + '" viewBox="0 0 120 130" style="--mt:' + MTC[tr] + ';--ms:' + (0.86 + tr * 0.04).toFixed(2) + '" aria-hidden="true">' +
      '<defs><linearGradient id="zmg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9c793"/><stop offset="1" stop-color="#4f7338"/></linearGradient></defs>' +
      '<ellipse cx="60" cy="123" rx="34" ry="5" class="sh"/><g class="bd">' + arms +
      '<path d="M60 18c32 0 44 28 44 58s-18 42-44 42-44-12-44-42 12-58 44-58z" fill="url(#zmg)"/><ellipse cx="60" cy="90" rx="26" ry="19" fill="#fff" opacity=".18"/>' +
      '<rect x="19" y="38" width="82" height="9" rx="4.5" fill="var(--mt)"/><path d="M98 42l12-6-2 12z" fill="var(--mt)"/>' + eyes + mouth +
      (mood === 'sleep' ? '<text x="92" y="24" class="zz">z</text><text x="102" y="12" class="zz">z</text>' : '') + '</g></svg>';
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
      cardProg(d, cur) + mid + (pills ? '<div class="ar-pills">' + pills + '</div>' : '') +
      '<i class="ar-masc">' + mascot(done ? 'cheer' : ui.arv.v >= q.r ? 'happy' : 'idle', tierOfLevel(level(d.xp))) + '</i></section>';
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
