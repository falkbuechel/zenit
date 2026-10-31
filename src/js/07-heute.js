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
      '<div class="hm-hero"' + (cur ? ' data-arena="1" role="button" tabindex="0" aria-label="Training öffnen"' : '') + '>' + '<p class="hm-say">' + esc(mSay(today, rest ? 'rest' : all ? 'done' : nd ? 'run' : ss.mode === 'last' ? 'risk' : 'go', nd, L.length, nx)) + '</p>' + mascot(mood, tr) + '</div>' +
      '<div class="hm-plan"><b>' + esc(rest ? 'Heute frei' : tname) + '</b><small>' + (cur ? L.length + ' Übungen' + (mins ? ' · ~' + mins + ' Min' : '') : rest ? (nx ? 'Weiter: ' + esc(nx) : 'Erholung zählt') : 'Heute keine Übungen') + '</small>' +
      (cur ? '<i class="hm-pb"><i style="--p:' + (nd / L.length).toFixed(3) + '"></i></i>' : '') + '</div>' +
      (cur ? '<button class="btn primary big hm-go" data-arena="1">' + ic(all ? 'check' : 'play') + (all ? 'Erledigt · ansehen' : nd ? 'Weiter trainieren · ' + nd + '/' + L.length : 'Training starten') + '</button>'
        : '<button class="btn big hm-go" data-swap="1">' + ic('swap') + (rest ? 'Trotzdem trainieren' : 'Training wählen') + '</button>') + '</section>';
  }
  // Versuch: Partner-Spruch über dem Maskottchen, je Zustand ein paar Varianten, wechselt täglich
  var MSAY = {
    go: ['Ich zähl mit. Los.', 'Heute holen wir uns XP.', 'Bereit, wenn du es bist.', 'Ein Satz, dann rollt es.'],
    run: ['Weiter. Noch {r}.', 'Gut drin. {r} fehlen.', 'Nicht abreißen lassen: {r} noch.'],
    done: ['Stark. Das war es für heute.', 'Erledigt. Ich bin stolz.', 'Sauber. Jetzt essen und schlafen.'],
    risk: ['Serie wackelt. Ein Satz rettet sie.', 'Kurz rein, Serie halten.'],
    rest: ['Ruhetag. Muskeln wachsen jetzt.', 'Heute Pause. {n} wartet.']
  };
  function mSay(today, k, nd, n, nx) { var o = MSAY[k]; return o[today % o.length].replace('{r}', n - nd).replace('{n}', nx || 'Morgen'); }
  // Maskottchen (Platzhalter bis zu den Renders): Berg-Gorilla, kantig und cel-shaded. Linke Körperhälfte als Punkte, rechte gespiegelt.
  // Stimmung idle | happy | sleep | cheer, Stirnband in der Farbe der Titel-Stufe, wird mit der Stufe etwas größer
  // Stufen: ab 2 Handbandagen, ab 3 Silber an den Schultern, ab 4 leuchtende Muskelnähte, ab 5 Aura
  var MTC = ['#8fa39a', '#8fa39a', '#5b8fd6', '#a374d8', '#ffc94a', '#57c7b8'];
  function mascot(mood, tr) {
    function P(a, c) { return '<polygon class="' + c + '" points="' + a.map(function (p) { return p.join(','); }).join(' ') + '"/>'; }
    function M(a) { return a.map(function (p) { return [200 - p[0], p[1]]; }); }
    function B(a, c) { return P(a, c) + P(M(a), c); }
    var up = mood === 'cheer', h = '';
    if (tr >= 5) h += '<g class="g-au">' + [0, 1, 2, 3, 4, 5, 6, 7].map(function (k) { return '<polygon points="100,104 ' + (100 + 120 * Math.cos(k * .785 - .2)).toFixed(0) + ',' + (104 + 120 * Math.sin(k * .785 - .2)).toFixed(0) + ' ' + (100 + 120 * Math.cos(k * .785 + .12)).toFixed(0) + ',' + (104 + 120 * Math.sin(k * .785 + .12)).toFixed(0) + '"/>'; }).join('') + '</g>';
    h += '<ellipse cx="100" cy="207" rx="72" ry="7" class="sh"/><g class="bd">';
    // Beine, Füße
    h += B([[68, 148], [96, 150], [94, 182], [90, 199], [64, 201], [60, 184]], 'g-f') + B([[85, 152], [96, 150], [94, 182], [90, 199], [84, 199]], 'g-fs') +
      B([[54, 195], [92, 195], [97, 207], [49, 208]], 'g-s');
    // Rumpf, Nacken
    h += P([[38, 66], [100, 58], [162, 66], [152, 108], [138, 150], [62, 150], [48, 108]], 'g-f') + P([[126, 112], [152, 108], [138, 150], [108, 150]], 'g-fs') +
      P([[54, 66], [78, 38], [122, 38], [146, 66], [100, 60]], 'g-f');
    // Brust, Bauch
    h += B([[66, 72], [99, 76], [99, 100], [84, 108], [64, 98], [60, 82]], 'g-sp') + B([[64, 98], [84, 108], [99, 100], [99, 105], [84, 113], [66, 104]], 'g-ss') +
      P([[83, 112], [117, 112], [113, 146], [87, 146]], 'g-sp') + P([[106, 112], [117, 112], [113, 146], [104, 146]], 'g-ss') +
      '<path class="g-ln" d="M100 113V145M85 124H115M86 135H114"/>';
    // Arme: hängend (Fäuste fast am Boden) oder beim Jubeln hochgerissen
    var arm = up ? [[[36, 62], [40, 88], [8, 86], [0, 66]], [[0, 72], [24, 76], [28, 40], [20, 24], [-2, 28], [-8, 52]], [[-8, 4], [26, 4], [32, 22], [24, 30], [-4, 30], [-12, 18]], [[-5, 30], [27, 30], [27, 35], [-5, 35]]]
      : [[[22, 92], [50, 96], [46, 128], [24, 128]], [[14, 122], [50, 122], [58, 156], [48, 174], [16, 172], [8, 150]], [[10, 170], [52, 170], [58, 190], [48, 202], [16, 202], [6, 188]], [[12, 164], [54, 164], [55, 169], [11, 169]]];
    h += B(arm[0], 'g-f') + B(arm[1], 'g-f') + B(up ? [[14, 74], [24, 76], [28, 40], [20, 24], [16, 30]] : [[40, 124], [50, 122], [58, 156], [48, 174], [42, 172]], 'g-fs') +
      B(up ? [[-8, 52], [-16, 44], [-6, 42]] : [[8, 140], [-1, 134], [6, 150]], 'g-f') + B(arm[2], 'g-s') + B(up ? [[-8, 8], [10, 6], [4, 18], [-10, 16]] : [[10, 176], [30, 172], [24, 186], [8, 186]], 'g-ch') +
      (up ? '' : '<path class="g-ln" d="M14 184H54M146 184H186"/>') + (tr >= 2 ? B(arm[3], 'g-wr') : '');
    // Schultern
    h += B([[18, 74], [36, 54], [64, 58], [66, 80], [52, 98], [30, 100]], 'g-fl') + B([[18, 74], [6, 68], [14, 84]], 'g-fl') +
      (tr >= 3 ? B([[24, 70], [38, 57], [60, 61], [50, 70], [34, 77]], 'g-ag') : '');
    if (tr >= 4) h += '<path class="g-sm" d="M60 82 66 72 99 76M99 76 134 72 140 82M64 98 84 108 99 100 116 108 136 98M83 112 87 146M117 112 113 146M30 100 52 98 66 80M170 100 148 98 134 80"/>';
    // Kopf: kleiner Scheitelkamm, Ohren (rechts gekerbt), Gesicht, Brauenwulst, Narbe durch die linke Braue
    h += P([[72, 38], [80, 18], [92, 10], [100, 0], [108, 10], [120, 18], [128, 38], [128, 54], [114, 66], [86, 66], [72, 54]], 'g-f') +
      P([[68, 40], [74, 36], [76, 50], [70, 50]], 'g-s') + P([[132, 40], [126, 36], [124, 50], [130, 50], [131, 46], [128, 44]], 'g-s') +
      P([[80, 34], [120, 34], [124, 48], [114, 63], [86, 63], [76, 48]], 'g-s') + P([[110, 48], [124, 48], [114, 63], [104, 63]], 'g-ss');
    var hp = mood === 'happy' || up, sl = mood === 'sleep';
    h += P(hp ? [[76, 30], [124, 30], [122, 36], [110, 34], [100, 37], [90, 34], [78, 36]] : [[76, 30], [124, 30], [122, 40], [110, 37], [100, 41], [90, 37], [78, 40]], 'g-fs');
    h += sl ? '<path class="g-ln" d="M86 45q5 3 10 0M104 45q5 3 10 0"/>' : hp ? '<path class="g-ln b" d="M86 46q5-5 10 0M104 46q5-5 10 0"/>' :
      '<ellipse cx="91" cy="44.5" rx="4.6" ry="3.8" class="g-ey"/><ellipse cx="109" cy="44.5" rx="4.6" ry="3.8" class="g-ey"/><circle cx="92" cy="45" r="2.3" class="g-pu"/><circle cx="110" cy="45" r="2.3" class="g-pu"/><circle cx="92.8" cy="44" r=".8" fill="#fff"/><circle cx="110.8" cy="44" r=".8" fill="#fff"/>';
    h += '<path class="g-sc" d="M107 31 113 43"/>' + P([[93, 48], [107, 48], [105, 54], [95, 54]], 'g-ss') + '<path class="g-ln" d="M97 52h.1M103 52h.1"/>';
    h += sl ? '<ellipse cx="100" cy="59" rx="3" ry="2" class="g-pu"/>' : hp ? P([[88, 56], [112, 56], [107, 63], [93, 63]], 'g-mo') + '<rect x="91" y="56" width="18" height="2.6" fill="#f1f3ee"/>' : '<path class="g-ln" d="M90 58q10 3 20-2"/>';
    // Stirnband in Stufenfarbe, Enden wehen
    h += '<g class="g-hb">' + P([[73, 24], [127, 24], [128, 31], [72, 31]], 'g-band') + '<polygon class="g-band g-tail" points="126,25 156,13 150,23 168,21 147,31 126,31"/></g>';
    if (up) h += '<g class="g-dust">' + B([[-18, 0], [-10, -8], [-4, -2], [-12, 4]], 'g-ch') + B([[30, -6], [38, -12], [40, -2]], 'g-ch') + B([[6, -12], [12, -20], [16, -12]], 'g-ch') + '</g>';
    if (sl) h += '<text x="140" y="14" class="zz">z</text><text x="154" y="0" class="zz">z</text>';
    return '<svg class="masc gor ' + mood + '" viewBox="-26 -24 252 240" style="--mt:' + MTC[tr] + ';--ms:' + (0.9 + tr * 0.03).toFixed(2) + '" aria-hidden="true">' + h + '</g></svg>';
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
