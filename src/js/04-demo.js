  // ---------- Demo-Modus: eigene Testdaten, getrennt von den echten
  function demoData(kind) {
    var N = { mid: 150, gold: 40, broken: 90, fresh: 3, empty: 0 }[kind] || 0, seed = 7;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    var now = Date.now(), today = dayIdx(now), pl = defaultPlan(), best = {}, cnt = {}, logs = [], food = { g: { a: 1 }, e: [], d: [], w: [], m: [], pr: { h: 181, a: 31, s: 'm', act: 1.55, go: 'bulk', tw: 82, ex: 'mid', inj: '', eq: ['bar', 'board', 'db', 'mat', 'roll', 'ball', 'bike'] } }, k;
    function at(back, h, m) { var d = new Date(now); d.setDate(d.getDate() - back); d.setHours(h, m, 0, 0); return d.getTime(); }
    function met(e) { return !e.req || e.req.every(function (r) { return (best[r[0]] || 0) >= r[1]; }); }
    for (k = N; k >= (kind === 'fresh' ? 1 : 1); k--) {
      var di = today - k, wd = wdOf(di), prog = N > 3 ? (N - k) / N : 0.1, train;
      var day = pl.days.filter(function (x) { return x.wd.indexOf(wd) >= 0; })[0];
      if (kind === 'gold') train = true;
      else if (kind === 'broken') train = k > 5 && rnd() > 0.12;
      else if (kind === 'fresh') train = true;
      else train = rnd() > 0.13 && !(k > 45 && k < 52);
      if (!day || !train) continue;
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
    // Essen
    // Essen: Lebensmittel mit Menge (vorne = häufiger), damit Kacheln, Suche und Rechner Verlauf haben
    var DM = [['skyr', 150], ['hafer', 80], ['ei', 180], ['haehn', 150], ['reis_g', 200], ['banane', 120], ['whey', 30], ['brok', 150], ['vkbrot', 100], ['mandeln', 25], ['milch15', 200], ['lachs', 125], ['kart', 250], ['apfel', 150], ['nud_g', 250], ['mquark', 250], ['beeren', 125], ['rhack', 125]], fd = kind === 'mid' ? 70 : kind === 'empty' ? 0 : Math.min(N, 21);
    // Leer: wirklich nichts eingetragen, damit die Hinweise (Gewicht, Essen) im Plan sichtbar werden
    for (k = fd; k >= 0 && kind !== 'empty'; k--) {
      if (k > 0 && rnd() < 0.1) continue;
      var c = 3 + Math.round(rnd() * 1.5), j2;
      if (k === 0) c = kind === 'fresh' ? 0 : 2;
      for (j2 = 0; j2 < c * 4; j2++) { var m0 = DM[Math.floor(Math.pow(rnd(), 1.7) * DM.length)], it0 = FOODB[m0[0]], v0 = fNut(it0, m0[1]), x0 = { t: at(k, 7 + j2, 10), n: it0.n, r: { i: m0[0], g: m0[1] } }; NK.forEach(function (q) { x0[q] = q === 'k' ? Math.round(v0.k) : Math.round(v0[q] * 10) / 10; }); food.e.push(x0); }
    }
    function ing(id, a) { var f0 = FOODB[id], q = { n: f0.n, a: a, i: id }; NK.forEach(function (k) { q[k] = f0[k]; }); return q; }
    food.d = [{ id: 'dm1', n: 'Overnight Oats', por: 1, ing: [ing('hafer', 80), ing('skyr', 200), ing('banane', 120)] }, { id: 'dm2', n: 'Hähnchen-Reis-Pfanne', por: 3, ing: [ing('haehn', 600), ing('reis_r', 300), ing('papr', 300), ing('rapsoel', 20)] }];
    // Gewicht und Maße
    var wk = kind === 'mid' ? 120 : kind === 'empty' || kind === 'fresh' ? 0 : 30;
    for (k = wk; k >= 0 && kind !== 'empty'; k -= (k > 30 ? 3 : 2)) food.w.push({ t: at(k, 7, 30), kg: Math.round((78 + 2.4 * (wk - k) / Math.max(1, wk) + (rnd() - 0.5) * 0.9) * 10) / 10 });
    if (kind === 'mid') [[100, 83, 101, 33.5, 56, 112], [70, 83.5, 102, 34, 57, 113], [40, 84, 103, 34.5, 57.5, 114], [10, 84.5, 104, 35, 58, 115]].forEach(function (r) { food.m.push({ t: at(r[0], 7, 45), w: r[1], c: r[2], a: r[3], th: r[4], sh: r[5] }); });
    if (kind === 'empty' || kind === 'fresh') { food.g = null; food.pr = null; }
    return { u: Date.now(), logs: logs, plan: null, food: food };
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

