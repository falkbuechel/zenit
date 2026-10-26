  // ---------- Karten (Übungen) und Muskelgruppen: alles aus den Logs berechnet, nichts gespeichert
  // Seltenheit (fest, wie schwer die Übung ist) bestimmt das Startlevel; der Look (Rahmen) hängt am Level. Max 10, später Kraftstufen.
  // Level-Up: genug KP (Fleiß) macht die Karte bereit, dann in einer Einheit das Satzziel des nächsten Levels schaffen (Aufstiegsprüfung).
  // KP je Satz = 10 × Leistung / Ziel des aktuellen Levels (max 15). Muskeln bekommen KP × Anteil (Hauptmuskel 1, weitere 0,5)
  var RAR = [['Gewöhnlich', 1, 'r0'], ['Selten', 3, 'r1'], ['Episch', 5, 'r2'], ['Legendär', 7, 'r3'], ['Mythisch', 8, 'r4'], ['Zenit', 9, 'r5']], CMAX = 10, MMAX = 20;
  var LOOK = ['Gewöhnlich', 'Selten', 'Episch', 'Legendär', 'Mythisch', 'Zenit'];
  function lookOf(lv) { return lv >= 10 ? 5 : lv >= 9 ? 4 : lv >= 7 ? 3 : lv >= 5 ? 2 : lv >= 3 ? 1 : 0; }
  // Einheiten am Ziel bis zum nächsten Level, je Seltenheit ab ihrem Startlevel (bei 2× pro Woche je Übung etwa 1,5 bis 2+ Jahre bis Level 10)
  var CSES = [[4, 6, 8, 10, 14, 18, 24, 30, 40], [8, 10, 14, 18, 24, 30, 40], [16, 22, 30, 40, 55], [50, 70, 90], [90, 130], [220]];
  // Skills: feste Seltenheit (Episch bis Zenit) nach Lernzeit
  var SKR = { crow: 2, lsit: 2, lever: 2, hand: 2, wallw: 2, advfl: 3, psplan: 3, hspu: 3, planl: 3, mun: 3, pistol: 3, blever: 4, archpu: 4, hsfree: 4, mu: 4, tplan: 5, sfl: 5, oap: 5 };
  // Stufen-Leiter (10 Stufen): Sätze, Anteil am Grundziel, Tempo (3 s ab), Pause. Erst Wiederholungen, dann ein Satz mehr (max 4), dann Tempo, dann Pause
  var LAD = [[2, .3], [2, .45], [3, .45], [3, .6], [3, .8], [4, .8], [4, 1], [4, 1, 1], [4, 1, 1, 1], [4, 1.25, 1, 1]];
  // Halteübungen: statt Tempo/Pause länger halten
  var LADH = [[2, .3], [2, .45], [3, .45], [3, .6], [3, .8], [4, .8], [4, 1], [4, 1.1], [4, 1.25], [4, 1.4]];
  var MUS = [['ru', 'Rücken'], ['br', 'Brust'], ['sh', 'Schultern'], ['ar', 'Arme'], ['co', 'Core'], ['be', 'Beine'], ['gr', 'Griff'], ['mo', 'Beweglichkeit'], ['au', 'Ausdauer']];
  var MUW = { 'Rücken': 'ru', 'Latissimus': 'ru', 'Breite': 'ru', 'unterer Rücken': 'ru', 'Unterer Rücken': 'ru', 'Trapez': 'ru', 'Nacken': 'ru', 'Schulterblätter': 'ru',
    'Schulter': 'sh', 'Schulter vorn': 'sh', 'Schulter hinten': 'sh', 'Brust': 'br', 'Obere Brust': 'br', 'Bizeps': 'ar', 'Trizeps': 'ar', 'Arme': 'ar',
    'Griff': 'gr', 'Unterarme': 'gr', 'Unterarm': 'gr', 'Handgelenke': 'gr', 'Core': 'co', 'tiefer Bauch': 'co', 'Seitliche Core': 'co', 'Schräge Bauchmuskeln': 'co', 'Unterer Bauch': 'co', 'Hüftbeuger': 'co',
    'Beine': 'be', 'Po': 'be', 'Waden': 'be', 'Quadrizeps': 'be', 'Beinbeuger': 'be', 'Oberschenkel vorn': 'be', 'Oberschenkel hinten': 'be', 'Beine innen': 'be', 'Hintere Kette': 'be', 'hintere Kette': 'be', 'Hüfte': 'be',
    'Kondition': 'au', 'Ausdauer': 'au', 'Ganzkörper': 'au', 'Explosivkraft': 'au', 'Balance': 'mo', 'Beweglichkeit': 'mo', 'Brustwirbelsäule': 'mo', 'Hüftrotation': 'mo' };
  function musOf(e) {
    if (e._mw) return e._mw;
    var w = {}, first = true;
    if (e.g === 'mob') { w.mo = 1; first = false; }
    if (e.g === 'cardio') { w.au = 1; first = false; }
    e.mu.split(/ · | \(|\) ?|: /).forEach(function (t) { var k = MUW[t.trim()]; if (k && !w[k]) { w[k] = first ? 1 : 0.5; first = false; } });
    return (e._mw = w);
  }
  // Einzelmuskeln (für die Figur, eigene Level): Gruppe bleibt Oberbegriff (Skill-Voraussetzungen, Balance). Wörter aus e.mu werden auf Einzelmuskeln verteilt
  var SUBM = [['la', 'Latissimus', 'ru'], ['tz', 'Nacken & Trapez', 'ru'], ['ur', 'Unterer Rücken', 'ru'], ['br', 'Brust', 'br'], ['so', 'Vordere Schulter', 'sh'], ['sb', 'Hintere Schulter', 'sh'],
    ['bi', 'Bizeps', 'ar'], ['tr', 'Trizeps', 'ar'], ['ua', 'Unterarme & Griff', 'gr'], ['ab', 'Bauch', 'co'], ['ob', 'Seitlicher Bauch', 'co'], ['qu', 'Quadrizeps', 'be'], ['hb', 'Beinbeuger', 'be'], ['gs', 'Gesäß', 'be'], ['wa', 'Waden', 'be']], SUBB = {};
  SUBM.forEach(function (m) { SUBB[m[0]] = m; });
  var SUBW = { 'Rücken': { la: .6, tz: .2, ur: .2 }, 'Latissimus': { la: 1 }, 'Breite': { la: 1 }, 'unterer Rücken': { ur: 1 }, 'Unterer Rücken': { ur: 1 }, 'Trapez': { tz: 1 }, 'Nacken': { tz: 1 }, 'Schulterblätter': { tz: 1 },
    'Schulter': { so: .5, sb: .5 }, 'Schulter vorn': { so: 1 }, 'Schulter hinten': { sb: 1 }, 'Brust': { br: 1 }, 'Obere Brust': { br: 1 }, 'Bizeps': { bi: 1 }, 'Trizeps': { tr: 1 }, 'Arme': { bi: .5, tr: .5 },
    'Griff': { ua: 1 }, 'Unterarme': { ua: 1 }, 'Unterarm': { ua: 1 }, 'Handgelenke': { ua: 1 }, 'Core': { ab: .7, ob: .3 }, 'tiefer Bauch': { ab: 1 }, 'Unterer Bauch': { ab: 1 }, 'Hüftbeuger': { ab: 1 }, 'Seitliche Core': { ob: 1 }, 'Schräge Bauchmuskeln': { ob: 1 },
    'Beine': { qu: .4, hb: .2, gs: .25, wa: .15 }, 'Po': { gs: 1 }, 'Waden': { wa: 1 }, 'Quadrizeps': { qu: 1 }, 'Oberschenkel vorn': { qu: 1 }, 'Beine innen': { qu: 1 }, 'Beinbeuger': { hb: 1 }, 'Oberschenkel hinten': { hb: 1 }, 'Hintere Kette': { hb: .5, gs: .5 }, 'hintere Kette': { hb: .5, gs: .5 }, 'Hüfte': { gs: 1 } };
  function subOf(e) {
    if (e._sw) return e._sw;
    var w = {}, first = !(e.g === 'mob' || e.g === 'cardio');
    e.mu.split(/ · | \(|\) ?|: /).forEach(function (t) { var m = SUBW[t.trim()]; if (!m) { if (MUW[t.trim()]) first = false; return; } var f = first ? 1 : 0.5; first = false; Object.keys(m).forEach(function (k) { w[k] = Math.max(w[k] || 0, m[k] * f); }); });
    return (e._sw = w);
  }
  // Einzelmuskel-Level: halbe Kosten der Gruppe (bekommt nur einen Teil der Punkte)
  function sLevel(mp) { var lv = 1; while (lv < MMAX && mp >= mCost(lv) / 2) { mp -= mCost(lv) / 2; lv++; } return { lv: lv, mp: Math.round(mp), need: lv < MMAX ? Math.round(mCost(lv) / 2) : 0 }; }
  function rarOf(e) {
    // nach Tiefe im Freischalt-Pfad; Hanteln, Mobilität und Cardio eine Stufe milder, Skills mindestens episch
    var st = stageOf(e);
    if (e.g === 'mob' || e.g === 'cardio') return st ? 1 : 0;
    if (e.g === 'kh') return st <= 1 ? 0 : st === 2 ? 1 : 2;
    if (e.g === 'skill') return SKR[e.id] != null ? SKR[e.id] : 2;
    return st === 0 ? 0 : st === 1 ? 1 : st <= 3 ? 2 : 3;
  }
  function rx(e, lv) {
    // Vorgabe eines Levels: seltene Karten laufen dieselbe Leiter in weniger, größeren Schritten
    var l0 = RAR[rarOf(e)][1], i = Math.round((Math.min(lv, CMAX) - l0) / Math.max(1, CMAX - l0) * 9), q = (e.u === 'Sek.' ? LADH : LAD)[Math.max(0, Math.min(9, i))], u = e.u === 'Sek.' ? 5 : 1;
    return { s: e.sets === 1 ? 1 : q[0], r: Math.max(u, Math.round(e.goal * q[1] / u) * u), t: !!q[2], p: !!q[3] };
  }
  function rxText(e, q) { return q.s + '×' + q.r + (e.u === 'Sek.' ? ' s' : '') + (q.t ? ' · 3 s ab' : '') + (q.p ? ' · Pause' : ''); }
  function cCost(e, lv) { var r = rarOf(e); return lv >= CMAX ? 0 : CSES[r][lv - RAR[r][1]] * 10 * e.sets; }
  // Muskel-Level: 250 × 1,17^(L−1) MP; Level 20 nach etwa 2,5–4 Jahren regelmäßigem Training
  function mCost(lv) { return Math.round(250 * Math.pow(1.17, lv - 1)); }
  function mLevel(mp) { var lv = 1; while (lv < MMAX && mp >= mCost(lv)) { mp -= mCost(lv); lv++; } return { lv: lv, mp: Math.round(mp), need: lv < MMAX ? mCost(lv) : 0 }; }
  // Skills brauchen zusätzlich Muskel-Level (Kraftniveau)
  var SKQ = { lever: { ru: 4, co: 4 }, advfl: { ru: 6, co: 6 }, sfl: { ru: 9, co: 8 }, blever: { sh: 5, ar: 5, co: 4 }, wallw: { sh: 3, co: 3 }, hand: { sh: 4, co: 3 }, hsfree: { sh: 6, co: 5 }, hspu: { sh: 8, ar: 6 },
    psplan: { sh: 4, br: 4 }, planl: { sh: 6, gr: 4 }, tplan: { sh: 9, co: 7, gr: 6 }, mun: { ru: 6, ar: 5 }, mu: { ru: 8, br: 6, ar: 7 }, oap: { br: 8, co: 7, ar: 6 }, archpu: { ru: 9, ar: 7, gr: 6 }, lsit: { co: 5, ar: 3 }, crow: { co: 3, ar: 3 }, pistol: { be: 6, co: 4 } };
  function skqOk(e, mp) { var q = SKQ[e.id]; return !q || Object.keys(q).every(function (k) { return mLevel(mp[k] || 0).lv >= q[k]; }); }
  function cardOf(d, e) { return d.cards[e.id] || { lv: RAR[rarOf(e)][1], kp: 0, n: 0 }; }
  function cardReady(d, e) { var c = cardOf(d, e); return c.lv < CMAX && c.kp >= cCost(e, c.lv); }
  // heutige Vorgabe: bereit = Aufstiegsprüfung mit dem Ziel des nächsten Levels
  function rxNow(d, e) { var c = cardOf(d, e); return rx(e, cardReady(d, e) ? c.lv + 1 : c.lv); }
  function derive(logs) {
    var sorted = logs.slice().sort(function (a, b) { return a.t - b.t; });
    var best = {}, bestRaw = {}, unlocked = {}, goalHit = {}, xp = 0, tl = [], days = [], byDay = {};
    var cur = null, streak = 0, prev = null, longest = 0, wkc = {}, moc = {}, wkHit = {}, moHit = {}, warm = {}, cards = {}, mp = {}, smp = {};
    EX.forEach(function (e) { if (!e.req) unlocked[e.id] = 1; });
    function add(v) { xp += v; if (cur) cur.all += v; }
    function close() {
      if (!cur) return;
      var n = Object.keys(cur.ex).length, b = 0;
      if (n >= DAILY) { b += 40; cur.goal = true; }
      cur.extra = Math.max(0, n - DAILY); b += 30 * cur.extra;
      streak = (prev !== null && cur.d - prev - offCount(prev + 1, cur.d - 1) <= 2) ? streak + 1 : 1;
      prev = cur.d; longest = Math.max(longest, streak);
      cur.streak = streak; cur.mult = mult(streak);
      cur.mx = Math.round((cur.sx + b) * (cur.mult - 1)); cur.bonus = b;
      add(b + cur.mx);
      var wk = wkOf(cur.d), mo = moOf(cur.d);
      wkc[wk] = (wkc[wk] || 0) + 1; moc[mo] = (moc[mo] || 0) + 1;
      if (wkc[wk] === WK_GOAL) { add(WK_XP); wkHit[wk] = cur.d; cur.wkb = WK_XP; }
      if (moc[mo] === MO_GOAL) { add(MO_XP); moHit[mo] = cur.d; cur.mob = MO_XP; }
      tl.push({ t: cur.t, d: cur.d, v: xp });
      days.push(cur); byDay[cur.d] = cur; cur = null;
    }
    sorted.forEach(function (l) {
      if (l.e === 'warm') { var wd = dayIdx(l.t); if (cur && cur.d !== wd) close(); if (!warm[wd]) { warm[wd] = 1; xp += WARM_XP; } return; }
      var e = EXB[l.e];
      if (!e) return;
      var di = dayIdx(l.t);
      if (cur && cur.d !== di) close();
      if (!cur) cur = { d: di, t: l.t, sx: 0, all: 0, ex: {}, sets: 0, g: {}, gx: {}, goal: false, extra: 0 };
      l.s.forEach(function (x, idx) {
        var sx = setXp(e, x, idx);
        cur.sx += sx; add(sx); cur.sets++;
        cur.g[e.g] = (cur.g[e.g] || 0) + 1;
        cur.gx[e.g] = (cur.gx[e.g] || 0) + sx;
      });
      cur.ex[e.id] = 1;
      // Karte: KP gegen das Ziel des aktuellen Levels, Level-Up bei Leistung (diese Einheit) + genug KP; Muskeln bekommen KP × Anteil
      var cd = cards[e.id] || (cards[e.id] = { lv: RAR[rarOf(e)][1], kp: 0, n: 0 }), ctg = rx(e, cd.lv).r, kp = 0, mw = musOf(e), nx = cd.lv < CMAX ? rx(e, cd.lv + 1) : null;
      l.s.forEach(function (x) { kp += Math.round(10 * Math.min(x / ctg, 1.5)); });
      // Aufstiegsprüfung: KP reichten schon vor dieser Einheit und die Vorgabe des nächsten Levels ist geschafft (ein Level pro Einheit)
      var rdy = nx && cd.kp >= cCost(e, cd.lv);
      cd.kp += kp; cd.n++; Object.keys(mw).forEach(function (k) { mp[k] = (mp[k] || 0) + kp * mw[k]; });
      var sw = subOf(e); Object.keys(sw).forEach(function (k) { smp[k] = (smp[k] || 0) + kp * sw[k]; });
      if (rdy && l.s.filter(function (x) { return x >= nx.r; }).length >= nx.s) { cd.kp -= cCost(e, cd.lv); cd.lv++; cd.up = l.t; }
      if (l.s.length >= e.sets && l.s.slice(0, e.sets).every(function (x) { return x >= e.goal; })) { cur.sx += 10; add(10); }
      var r = metric(e, l.s);
      if (r.full) {
        var pb = bestRaw[e.id];
        if (pb !== undefined && r.val > pb) add(25);
        if (pb === undefined || r.val > pb) bestRaw[e.id] = r.val;
        if (best[e.id] === undefined || r.val > best[e.id]) best[e.id] = r.val;
        if (r.val >= e.goal && !goalHit[e.id]) { goalHit[e.id] = l.t; add(100); }
        EX.forEach(function (x) {
          if (!unlocked[x.id] && x.req.every(function (q) { return best[q[0]] >= q[1]; }) && skqOk(x, mp)) { unlocked[x.id] = l.t; add(150); }
        });
      }
    });
    close();
    return { best: best, bestRaw: bestRaw, unlocked: unlocked, goalHit: goalHit, xp: xp, tl: tl, days: days, byDay: byDay, longest: longest, wkc: wkc, moc: moc, wkHit: wkHit, moHit: moHit, warm: warm, cards: cards, mp: mp, smp: smp };
  }
  function level(xp) { return Math.floor(Math.sqrt(xp / 120)) + 1; }
  function lvXp(lv) { return 120 * (lv - 1) * (lv - 1); }
  function tierOfRatio(r, e) { var x = r * SW[Math.min(3, stageOf(e))], k = 0; while (k < 4 && x >= TH[k + 1]) k++; return TCLS[k]; }
  function tierOfLevel(lv) { return lv <= 4 ? 0 : lv <= 9 ? 2 : lv <= 16 ? 3 : lv <= 25 ? 4 : 5; }
  function exTier(d, e) { var r = d.bestRaw[e.id]; return r === undefined ? 0 : tierOfRatio(r / e.goal, e); }
  function streakCalc(logs, now) {
    var set = {};
    logs.forEach(function (l) { if (EXB[l.e]) set[dayIdx(l.t)] = 1; });
    var ds = Object.keys(set).map(Number).sort(function (a, b) { return b - a; });
    if (!ds.length) return { n: 0, mode: 'none', set: set };
    var diff = dayIdx(now) - ds[0] - offCount(ds[0] + 1, dayIdx(now));
    if (diff > 2) return { n: 0, mode: 'lost', set: set };
    var n = 1;
    for (var i = 1; i < ds.length; i++) { if (ds[i - 1] - ds[i] - offCount(ds[i] + 1, ds[i - 1] - 1) <= 2) n++; else break; }
    return { n: n, mode: diff === 0 ? 'safe' : diff === 1 ? 'open' : 'last', set: set };
  }
  function nice(v) {
    if (!(v > 0)) return 1;
    var mag = Math.pow(10, Math.floor(Math.log10(v))), m = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
    for (var i = 0; i < m.length; i++) if (m[i] * mag >= v - 1e-9) return m[i] * mag;
    return 10 * mag;
  }
  /*ENDPURE*/

