  // ---------- Demo-Modus: eigene Testdaten, getrennt von den echten
  // Zwei Szenarien: 'mid' = Voll (5 Monate, alle Datenformen: Wochenpläne mit Zeitstrahl, Rhythmus, Ausnahmen, Urlaub/Krank, Geplantes, Vorlagen, Gerichte, Eigene, Wasser, Einkauf), 'empty' = Leer
  function demoData(kind) {
    var full = kind === 'mid', N = full ? 150 : 0, seed = 7;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    var now = Date.now(), today = dayIdx(now), best = {}, cnt = {}, logs = [], k;
    var food = { g: { a: 1 }, e: [], d: [], w: [], m: [], o: [], pl: [], tp: [], wa: {}, sh: {}, pr: { h: 181, a: 31, s: 'm', go: 'bulk', tw: 82, ex: 'mid', inj: '', eq: ['bar', 'board', 'db', 'mat', 'roll', 'ball', 'bike'], pal: 1.4, rt: 0.25, pkg: 2, fp: 25, tb: 1 } };
    if (!full) { food.g = null; food.pr = null; return { u: now, logs: logs, plan: null, food: food }; }
    function at(back, h, m) { var d = new Date(now); d.setDate(d.getDate() - back); d.setHours(h, m, 0, 0); return d.getTime(); }
    function met(e) { return !e.req || e.req.every(function (r) { return (best[r[0]] || 0) >= r[1]; }); }
    // Plan: 4 Tage + Lauf alle 2 Wochen + einmaliger Test-Tag; Wochenpläne „Mein Plan“ und „Urlaub leicht“ im Zeitstrahl; Urlaub (vorbei, kommend), Krank, Ausnahmen (Tausch, ausgesetzt, ersetzt + zusätzlich)
    var pl = defaultPlan(), wk0 = wkOf(today);
    pl.days.push({ id: 'p5', n: 'Lauf', c: 5, i: 'bolt', rp: 2, st: wk0, wd: [], ex: pl.days[2].ex.slice(0, 3) }, { id: 'p6', n: 'Test', c: 4, i: 'target', rp: 0, st: wk0 + 7, wd: [], ex: pl.days[0].ex.slice(0, 4) });
    pl.wp = [{ id: 'w1', n: 'Mein Plan', m: { p1: [0, 3], p2: [1, 4], p3: [5], p4: [2, 6], p5: [5], p6: [3] } }, { id: 'w2', n: 'Urlaub leicht', m: { p3: [1, 4], p4: [0, 2, 5] } }];
    pl.act = [{ a: 0, p: 'w1' }, { a: today - 52, p: 'w2' }, { a: today - 44, p: 'w1' }];
    pl.off = [{ a: today - 51, b: today - 45, k: 'vac' }, { a: today - 12, b: today - 10, k: 'sick' }, { a: today + 20, b: today + 26, k: 'vac' }];
    pl.ovk = {}; pl.ov = {}; pl.ovl = {};
    [[today + 1, { s: 1 }, []], [today + 2, { w: today + 3, b: ['p4'] }, ['p4']], [today + 3, { w: today + 2, b: ['p2'] }, ['p2']], [today + 5, { r: ['p3'], a: ['p4'] }, ['p3', 'p4']]]
      .forEach(function (x) { pl.ovk[x[0]] = x[1]; pl.ov[x[0]] = x[2]; });
    pl.v = PV; pl.ev = EV; pl.cu = true;
    function off(di) { return pl.off.some(function (o) { return di >= o.a && di <= o.b; }); }
    for (k = N; k >= 1; k--) {
      var di = today - k, wd = wdOf(di), prog = (N - k) / N;
      var day = pl.days.filter(function (x) { return x.wd.indexOf(wd) >= 0; })[0];
      if (!day || off(di) || rnd() < 0.13) continue;
      var ids = day.ex.map(function (id) { return EXB[id]; }).filter(function (e) { return e && met(e); });
      ids.sort(function (a, b) { return (cnt[a.id] || 0) - (cnt[b.id] || 0) + (rnd() - 0.5) * 3; });
      if (rnd() > 0.5) logs.push({ t: at(k, 17, 30), e: 'warm', s: [1] });
      ids.slice(0, 5 + (rnd() > 0.6 ? 1 : 0)).forEach(function (e, j) {
        var f = Math.min(1.25, 0.45 + 0.7 * prog + (rnd() - 0.5) * 0.12), n = e.mode === 'all' ? Math.min(e.sets, 8) : 2 + (rnd() > 0.5 ? 1 : 0), ss = [], i, v;
        for (i = 0; i < n; i++) { v = Math.max(1, Math.round(e.goal * f * (1 - i * 0.04 * (e.mode === 'all' ? 1 : 0)))); if (e.u === 'Sek.' || e.u === 'Min.') v = Math.max(5, Math.round(v / 5) * 5); ss.push(v); }
        var l = { t: at(k, 18, 5 + j * 4), e: e.id, s: ss };
        if (e.kg) l.k = Math.min(15, Math.round((8 + 7 * prog) / 2.5) * 2.5);
        logs.push(l); best[e.id] = Math.max(best[e.id] || 0, Math.max.apply(null, ss)); cnt[e.id] = (cnt[e.id] || 0) + 1;
      });
      logs.push({ t: at(k, 18, 50), e: 'sess', s: [(30 + Math.round(rnd() * 25)) * 60] });
    }
    // Essen: Gerichte (mit Schritten, fester Mahlzeit, Gewürz ohne Menge), eigenes Lebensmittel mit Marke/Barcode, Verlauf 70 Tage (vorne = häufiger), heute Frühstück + Mittag, Schnell-Eintrag ohne Quelle
    function ing(id, a) { var f0 = FOODB[id], q = { n: f0.n, a: a, i: id }; NK.forEach(function (k) { q[k] = f0[k]; }); return q; }
    food.d = [{ id: 'dm1', n: 'Overnight Oats', por: 1, m: ['fr'], ing: [ing('hafer', 80), ing('skyr', 200), ing('banane', 120)], st: 'Alles verrühren.\nÜber Nacht kalt stellen.' },
      { id: 'dm2', n: 'Hähnchen-Reis-Pfanne', por: 3, ing: [ing('haehn', 600), ing('reis_r', 300), ing('papr', 300), ing('rapsoel', 20), { n: 'Salz', a: 0, k: 0, p: 0 }], st: 'Reis kochen.\nHähnchen anbraten, Paprika dazu.\nMit Reis mischen, würzen.' }];
    food.o = [{ id: 'u1', n: 'Proteinriegel Schoko', b: 'Demo', bc: '4000000000017', cat: 's', k: 360, p: 33, f: 12, c: 30, fb: 5, su: 4, u: [['Riegel', 60]] }];
    function src(id) { return id === 'u1' ? food.o[0] : FOODB[id]; }
    // Eintrag mit Werten: Lebensmittel je Gramm (fNut), Gericht je Portion aus den Zutaten
    function entry(id, g, x) {
      var d = food.d.filter(function (q) { return q.id === id; })[0], v = {};
      if (d) NK.forEach(function (q) { v[q] = d.ing.reduce(function (a, z) { return a + (z[q] || 0) * z.a / 100; }, 0) / d.por * g; }); else v = fNut(src(id), g);
      x.n = d ? d.n : src(id).n; x.r = { i: id, g: g }; NK.forEach(function (q) { x[q] = q === 'k' ? Math.round(v.k) : Math.round(v[q] * 10) / 10; }); return x;
    }
    var DM = [['skyr', 150], ['hafer', 80], ['ei', 180], ['haehn', 150], ['reis_g', 200], ['banane', 120], ['whey', 30], ['brok', 150], ['vkbrot', 100], ['mandeln', 25], ['milch15', 200], ['lachs', 125], ['kart', 250], ['apfel', 150], ['nud_g', 250], ['mquark', 250], ['beeren', 125], ['rhack', 125], ['dm1', 1], ['u1', 60], ['dm2', 1]];
    for (k = 70; k >= 0; k--) {
      if (k > 0 && rnd() < 0.1) continue;
      var c = k === 0 ? 2 : 3 + Math.round(rnd() * 1.5), j2;
      for (j2 = 0; j2 < c * 4; j2++) { var m0 = DM[Math.floor(Math.pow(rnd(), 1.7) * DM.length)]; food.e.push(entry(m0[0], m0[1], { t: at(k, 7 + j2, 10) })); }
      if (k < 21) food.wa[today - k] = k === 0 ? 1250 : 1500 + Math.round(rnd() * 6) * 250;
    }
    food.e.push({ t: at(3, 20, 0), n: 'Döner', k: 650, p: 32, f: 28, c: 62, qa: [1, 'st'] });
    // Geplant: heute Snack + Abend, die nächsten 6 Tage je 3–4 Mahlzeiten (Lebensmittel, Gerichte, Eigenes gemischt)
    var PLN = { fr: [['dm1', 1], ['hafer', 80], ['ei', 120]], mi: [['dm2', 1], ['haehn', 150], ['nud_g', 250]], sn: [['mquark', 250], ['apfel', 150], ['u1', 60]], ab: [['lachs', 125], ['kart', 250], ['brok', 150], ['vkbrot', 100]] };
    [['sn', 'ab']].concat([1, 2, 3, 4, 5, 6].map(function (d) { return d === 4 ? ['fr', 'ab'] : ['fr', 'mi', 'sn', 'ab']; })).forEach(function (ms, d) {
      ms.forEach(function (mk) { var L = PLN[mk]; [L[(d + mk.length) % L.length]].concat(mk === 'ab' ? [L[(d + 1) % L.length]] : []).forEach(function (q) { food.pl.push(entry(q[0], q[1], { d: today + d, mk: mk })); }); });
    });
    food.tp = [{ id: 't1', n: 'Frühstück Standard', k: 'm', mk: 'fr', it: [{ i: 'hafer', g: 80 }, { i: 'skyr', g: 150 }, { i: 'beeren', g: 125 }] },
      { id: 't2', n: 'Trainingstag', k: 'd', it: [{ i: 'dm1', g: 1, mk: 'fr' }, { i: 'dm2', g: 1, mk: 'mi' }, { i: 'mquark', g: 250, mk: 'sn' }, { i: 'lachs', g: 125, mk: 'ab' }, { i: 'kart', g: 250, mk: 'ab' }] }];
    food.sh = { hafer: today, skyr: today };
    // Gewicht (120 Tage, leicht steigend) und Maße
    for (k = 120; k >= 0; k -= (k > 30 ? 3 : 2)) food.w.push({ t: at(k, 7, 30), kg: Math.round((78 + 2.4 * (120 - k) / 120 + (rnd() - 0.5) * 0.9) * 10) / 10 });
    [[100, 83, 101, 33.5, 56, 112], [70, 83.5, 102, 34, 57, 113], [40, 84, 103, 34.5, 57.5, 114], [10, 84.5, 104, 35, 58, 115]].forEach(function (r) { food.m.push({ t: at(r[0], 7, 45), w: r[1], c: r[2], a: r[3], th: r[4], sh: r[5] }); });
    return { u: now, logs: logs, plan: pl, food: food };
  }
  function demoSwitch(kind) {
    try {
      if (kind === 'off') localStorage.setItem('zenit.mode', 'live');
      else { localStorage.setItem('zenit.mode', 'demo'); localStorage.setItem('stufenbuch.demo', JSON.stringify(demoData(kind))); localStorage.removeItem('zenit.sess.demo'); localStorage.removeItem('zenit.seenUx.demo'); }
    } catch (e) { toast('Speicher nicht verfügbar', 'close'); return; }
    location.reload();
  }
  function loadLocal() {
    try { var raw = localStorage.getItem(KEY); if (!raw && DEMO) { raw = JSON.stringify(demoData('mid')); localStorage.setItem(KEY, raw); } if (raw) { var d = JSON.parse(raw); state.logs = clean(d.logs); state.u = d.u || 0; state.plan = cleanPlan(d.plan); state.food = cleanFood(d.food); } } catch (e) { /* kein Speicher */ }
  }
  function saveLocal() { try { localStorage.setItem(KEY, JSON.stringify({ u: state.u, logs: state.logs, plan: state.plan, food: state.food })); } catch (e) { /* egal */ } }
  function persist() {
    state.u = Date.now(); saveLocal();
    if (!ref) return;
    dirty = true; clearTimeout(timer); timer = setTimeout(flush, 400);
  }
  function flush() {
    if (writing) { timer = setTimeout(flush, 300); return; }
    if (!dirty) return;
    writing = true; dirty = false;
    ref.set({ v: 1, u: state.u, logs: state.logs, plan: state.plan || null, food: state.food || null }).then(function () { sync = ''; }, function () { sync = 'Speichern im Artifact fehlgeschlagen. Die Daten liegen nur in diesem Browser.'; render(); })
      .then(function () { writing = false; if (dirty) flush(); });
  }
  function adopt(d) { state.logs = clean(d.logs); state.u = d.u || 0; state.plan = cleanPlan(d.plan) || state.plan; state.food = cleanFood(d.food) || state.food; saveLocal(); }
  function initStore() {
    if (DEMO) { store = 'demo'; return; }
    if (!(window.claude && window.claude.use)) return;
    window.claude.use('db').then(function (db) {
      if (!db) return;
      var r = db.doc('tracker/state');
      return r.get().then(function (snap) {
        ref = r; store = 'cloud';
        if (snap.exists) { var d = snap.data(); if ((d.u || 0) >= state.u) adopt(d); else { dirty = true; flush(); } }
        else if (state.logs.length) { dirty = true; flush(); }
        render();
        r.onSnapshot(function (s) {
          if (!s.exists || s.metadata.hasPendingWrites) return;
          var d2 = s.data();
          if ((d2.u || 0) > state.u) { adopt(d2); render(); }
        }, function () {});
      });
    }).catch(function () { ref = null; store = 'local'; render(); });
  }

