  // ---------- Sheet
  // Vorschlag für Satz i: letzte Einheit (bzw. heutiger Fortschritts-Wert), sonst der vorige Satz, sonst das Ziel
  function setPrefill(e, i, s, last, today) {
    if (last && last.s[i] !== undefined) { var q = progFor(e, today); return q && !q.up ? q.t : last.s[i]; }
    if (i > 0 && s[i - 1] !== undefined) return s[i - 1];
    return last ? last.s[last.s.length - 1] : e.goal;
  }
  function openSheet(id, i) {
    var q0 = rxNow(derive(state.logs), EXB[id]), e = Object.assign({}, EXB[id], { sets: q0.s, goal: q0.r }), today = dayIdx(Date.now()), tl = todayLog(id, today), last = lastBefore(id, today);
    var s = tl ? tl.s : [];
    if (i > s.length) i = s.length;
    var editing = s[i] !== undefined, prefill = editing ? s[i] : setPrefill(e, i, s, last, today);
    var pgs = progFor(e, today), lastKg = (tl && tl.k) || (pgs && pgs.kg) || (last && last.k) || '';
    ui.sheet = { ex: id, i: i, editing: editing, step: e.u === 'Sek.' ? 5 : 1 };
    var presets = '<button class="fchip" data-preset="' + e.goal + '">' + ic('target') + 'Ziel ' + e.goal + '</button>';
    if (pgs && pgs.t !== e.goal) presets += '<button class="fchip hot" data-preset="' + pgs.t + '">' + ic('up') + 'Heute ' + pgs.t + '</button>';
    if (last && last.s[i] !== undefined && last.s[i] !== prefill) presets += '<button class="fchip" data-preset="' + last.s[i] + '">' + ic('undo') + 'Zuletzt ' + last.s[i] + '</button>';
    var bst = bestOf(id);
    if (bst && bst !== e.goal && bst !== prefill) presets += '<button class="fchip" data-preset="' + bst + '">' + ic('trophy') + 'Rekord ' + bst + '</button>';
    $('sheet').className = 'sheet g' + e.g;
    $('sheet').innerHTML = '<div class="grab"></div><div class="sh-h"><span class="gi">' + ic(gOf(e.g).i) + '</span><div class="nm"><b>' + esc(e.n) + '</b><small>Satz ' + (i + 1) + (i >= e.sets ? ' extra' : '/' + e.sets) + ' · Ziel ' + e.goal + '</small></div><a class="ref" href="' + e.url + '" target="_blank" rel="noopener" aria-label="Technik ansehen">' + ic('out') + '</a><button class="x" data-sheet-close aria-label="Schließen">' + ic('close') + '</button></div>' +
      '<div class="step"><button class="sb" data-step="-1" aria-label="Weniger">' + ic('minus') + '</button><div class="sv-w"><input id="sv" type="number" inputmode="numeric" min="0" step="1" value="' + prefill + '"><small>' + e.u + '</small></div><button class="sb" data-step="1" aria-label="Mehr">' + ic('plus') + '</button></div>' +
      (e.u === 'Sek.' && !editing ? '<button class="btn ghost hold" data-timer="' + e.id + '">' + ic('clock') + 'Stoppuhr' + '</button>' : '') +
      '<div class="presets">' + presets + '</div>' +
      (e.kg ? '<div class="kgrow">Gewicht je Hantel<input id="skg" type="number" inputmode="decimal" min="0" step="0.5" value="' + lastKg + '" placeholder="kg"><span>kg</span></div>' : '') +
      '<button class="btn primary big" data-sheet-save>' + ic('check') + (editing ? 'Ändern' : 'Speichern') + '</button>' +
      (editing ? '<button class="btn ghost small" data-sheet-del>' + ic('close') + 'Satz löschen</button>' : '') +
      '<p class="sh-note">Pause ' + fmtMS(restOf(e)) + (e.hint ? ' · ' + esc(e.hint) : '') + '</p>';
    $('shade').classList.add('open'); $('sheet').classList.add('open');
  }
  // ---------- Stoppuhr (Halte-Übungen)
  var tm = null, tmT = null, TMC = 603.2;
  function tmFmt(sec) { sec = Math.floor(sec); return Math.floor(sec / 60) + ':' + ('0' + sec % 60).slice(-2); }
  function openTimer(id) {
    var e = EXB[id], today = dayIdx(Date.now()), tl = todayLog(id, today), i = tl ? tl.s.length : 0;
    if (i >= 8) { toast('Maximal 8 Sätze', 'bolt'); return; }
    clearInterval(tmT); tm = { id: id, phase: 'ready', t0: 0, sec: 0, g: false };
    ui.sheet = { ex: id, i: i, editing: false, step: 5, timer: true };
    $('sheet').className = 'sheet g' + e.g;
    $('sheet').innerHTML = '<div class="grab"></div><div class="sh-h"><span class="gi">' + ic(gOf(e.g).i) + '</span><div class="nm"><b>' + esc(e.n) + '</b><small>Satz ' + (i + 1) + (i >= e.sets ? ' extra' : '/' + e.sets) + ' · Ziel ' + e.goal + ' Sek.</small></div><button class="x" data-sheet-close aria-label="Schließen">' + ic('close') + '</button></div>' +
      '<div class="tmw" id="tmw"><svg viewBox="0 0 220 220" aria-hidden="true"><circle class="tr" cx="110" cy="110" r="96"/><circle class="tf" id="tm-f" cx="110" cy="110" r="96"/><circle class="tf2" id="tm-f2" cx="110" cy="110" r="80"/></svg><div class="tmc"><b id="tm-t">0:00</b><small id="tm-s"></small></div></div>' +
      '<input id="sv" type="hidden" value="0"><div id="tm-b" class="tmb2"></div>';
    tmDraw();
    $('shade').classList.add('open'); $('sheet').classList.add('open');
  }
  function tmDraw() {
    if (!tm) return;
    var e = EXB[tm.id], w = $('tmw'), now = Date.now(), f = $('tm-f'), f2 = $('tm-f2'), t = $('tm-t'), sm = $('tm-s'), bx = $('tm-b');
    if (!w) return;
    var ph = tm.phase, p1 = 0, p2 = 0;
    if (ph === 'cd') { var rem = (tm.t0 - now) / 1000; p1 = Math.max(0, rem / 5); t.textContent = Math.ceil(rem); sm.textContent = 'Gleich geht’s los'; }
    else if (ph === 'run' || ph === 'done') {
      var sec = ph === 'run' ? (now - tm.t0) / 1000 : tm.sec; if (ph === 'run') tm.sec = sec;
      p1 = Math.min(sec / e.goal, 1); p2 = Math.max(0, Math.min((sec - e.goal) / e.goal, 1));
      t.textContent = tmFmt(sec);
      sm.textContent = sec >= e.goal ? 'Ziel erreicht · +' + Math.floor(sec - e.goal) + ' Sek.' : 'Ziel ' + e.goal + ' Sek.';
    } else { t.textContent = tmFmt(0); sm.textContent = 'Ziel ' + e.goal + ' Sek.'; }
    f.style.strokeDashoffset = TMC * (1 - p1); f2.style.strokeDashoffset = 502.7 * (1 - p2);
    w.className = 'tmw ' + ph + (ph !== 'cd' && p1 >= 1 ? ' hit' : '');
    var key = ph;
    if (bx.dataset.k !== key) {
      bx.dataset.k = key;
      bx.innerHTML = ph === 'ready' ? '<button class="btn primary big" data-tm="start">' + ic('clock') + 'Start</button>' :
        ph === 'cd' ? '<button class="btn ghost big" data-tm="cancel">Abbrechen</button>' :
        ph === 'run' ? '<button class="btn primary big stop" data-tm="stop">Stopp</button>' :
        '<button class="btn primary big" data-sheet-save>' + ic('check') + 'Speichern · ' + Math.round(tm.sec) + ' Sek.</button><button class="btn ghost small" data-tm="reset">' + ic('undo') + 'Nochmal</button>';
    }
  }
  function tmTick() {
    if (!tm) return;
    if (tm.phase === 'cd' && Date.now() >= tm.t0) { tm.phase = 'run'; tm.t0 = Date.now(); buzz(60); }
    if (tm.phase === 'run' && !tm.g && (Date.now() - tm.t0) / 1000 >= EXB[tm.id].goal) { tm.g = true; buzz([70, 40, 70]); }
    tmDraw();
  }
  function tmAct(a) {
    if (!tm) return;
    if (a === 'start') { tm.phase = 'cd'; tm.t0 = Date.now() + 5000; tm.g = false; clearInterval(tmT); tmT = setInterval(tmTick, 80); }
    else if (a === 'cancel' || a === 'reset') { clearInterval(tmT); tm.phase = 'ready'; tm.sec = 0; tm.g = false; }
    else if (a === 'stop') {
      clearInterval(tmT); tm.sec = (Date.now() - tm.t0) / 1000; tm.phase = 'done'; buzz(30);
      $('sv').value = Math.max(1, Math.round(tm.sec));
    }
    tmDraw();
  }
  function bestOf(id) {
    var m = 0;
    logsOf(id).forEach(function (l) { l.s.forEach(function (x) { if (x > m) m = x; }); });
    return m;
  }
  function closeSheet(force) { ui.dd = null; ui.ingm = false; ui.fplan = null; ui.pe = null; scanStop(); if (tm && (tm.phase === 'cd' || tm.phase === 'run') && !force) return; clearInterval(tmT); tm = null; ui.sheet = null; shMorphStop(); shMorph.h = 0; $('shade').classList.remove('open'); $('sheet').classList.remove('open'); }
  function sheetVal() { var v = parseFloat($('sv').value); return isFinite(v) && v >= 0 ? Math.round(v) : 0; }
  function updSheetXp() { /* XP hängt vom ganzen Übungsblock ab, keine Satz-Vorschau */ }
  function saveSheet() {
    var sh = ui.sheet; if (!sh) return;
    var e = EXB[sh.ex], v = sheetVal();
    if (v < 1) { toast('Mindestens 1', 'bolt'); return; }
    var kg = 0;
    if (e.kg) { var kv = parseFloat($('skg').value); if (isFinite(kv) && kv > 0) kg = kv; }
    var pe = document.querySelector('[data-pill="' + sh.ex + ':' + sh.i + '"]');
    logSet(e, sh.i, v, kg, pe ? pe.getBoundingClientRect() : null, sh.editing, e.sets);
  }
  function logSet(e, i, v, kg, rect, editing, sets) {
    var before = derive(state.logs), today = dayIdx(Date.now()), tl = todayLog(e.id, today);
    ui.undo = JSON.stringify(state.logs);
    if (!tl) { tl = { t: Date.now(), e: e.id, s: [] }; state.logs.push(tl); }
    if (i < tl.s.length) tl.s[i] = v; else tl.s.push(v);
    if (kg) tl.k = kg;
    persist(); closeSheet();
    sessAuto();
    var after = derive(state.logs);
    afterSave(before, after, e, rect, v);
    if (restOn && !editing && tl.s.length < sets) startRest(e, 'Satz ' + (tl.s.length + 1) + ' von ' + sets); else if (tl.s.length >= sets && !editing) stopRest();
  }
  // Arena: Satz direkt aus dem Zähler eintragen (Gewicht wie zuletzt; ändern über das Fenster am Satz)
  function arSave() {
    var e = EXB[ui.hcur], av = ui.arv; if (!e || !av || av.v < 1) return;
    var d = derive(state.logs), q = rxNow(d, e), today = dayIdx(Date.now()), tl = todayLog(e.id, today), last = lastBefore(e.id, today), pg = progFor(e, today);
    var kg = e.kg ? (tl && tl.k) || (pg && pg.kg) || (last && last.k) || 0 : 0, el = $('arn');
    ui.arv = null; logSet(e, tl ? tl.s.length : 0, av.v, kg, el ? el.getBoundingClientRect() : null, false, q.s);
  }
  function delSet() {
    var sh = ui.sheet; if (!sh) return;
    var today = dayIdx(Date.now()), tl = todayLog(sh.ex, today);
    if (tl && sh.i < tl.s.length) {
      ui.undo = JSON.stringify(state.logs);
      tl.s.splice(sh.i, 1);
      if (!tl.s.length) state.logs.splice(state.logs.indexOf(tl), 1);
      persist();
      closeSheet(); render();
      toast('Satz gelöscht', 'close', true);
      return;
    }
    closeSheet();
  }
  function undo() {
    if (!ui.undo) return;
    try { if (ui.undo.charAt(0) === '#') state.food = cleanFood(JSON.parse(ui.undo.slice(1))) || state.food; else state.logs = clean(JSON.parse(ui.undo)); } catch (err) { return; }
    ui.undo = null; persist(); stopRest();
    $('toast').className = 'toast';
    render();
    // Offenes „Mahlzeit planen“ neu aufbauen, sonst zeigen die Zeilen alte Indizes in food.pl
    if (ui.fplan && ui.sheet && ui.sheet.plmeal) openPlanMeal(ui.fplan.d, ui.fplan.mk);
  }
  // ---------- Gesamtuhr
  var SKEY = DEMO ? 'zenit.sess.demo' : 'zenit.sess', sess = null, sessI = null, sessArm = 0;
  function sessSave() { try { if (sess) localStorage.setItem(SKEY, JSON.stringify(sess)); else localStorage.removeItem(SKEY); } catch (err) { /* egal */ } }
  function sessLoad() {
    try { var o = JSON.parse(localStorage.getItem(SKEY)); if (o && o.t0 && o.act) { sess = o; if (Date.now() - o.act > 25 * 60e3) sessEnd(true, true); } } catch (err) { sess = null; }
  }
  function sessStart() { if (sess) return; sess = { t0: Date.now(), act: Date.now() }; sessSave(); sessArm = 0; sessUi(); render(); }
  function sessAuto() {
    if (sess) { sess.act = Date.now(); sessSave(); return; }
    if (!sessToday(dayIdx(Date.now()))) { sess = { t0: Date.now(), act: Date.now() }; sessSave(); sessUi(); }
  }
  function sessEnd(auto, quiet) {
    if (!sess) return;
    var end = auto ? sess.act + 60e3 : Date.now(), sec = Math.round((end - sess.t0) / 1000), t0 = sess.t0;
    sess = null; sessArm = 0; sessSave();
    if (sec >= 60 && sec < 6 * 3600) { state.logs.push({ t: t0, e: 'sess', s: [sec] }); persist(); }
    sessUi();
    if (!quiet) { render(); toast((auto ? 'Training beendet · ' : 'Training: ') + Math.max(1, Math.round(sec / 60)) + ' Min', 'check'); }
  }
  function sessUi() {
    var el = $('sess'); if (!el) return;
    clearInterval(sessI);
    if (!sess) { el.hidden = true; return; }
    el.hidden = false;
    el.innerHTML = '<i class="dot"></i><b id="sess-t">0:00</b><span>Training</span><button data-sess="end">Beenden</button>';
    sessTick(); sessI = setInterval(sessTick, 1000);
  }
  function sessTick() {
    if (!sess) return;
    if (Date.now() - sess.act > 25 * 60e3) { sessEnd(true); return; }
    var sec = Math.floor((Date.now() - sess.t0) / 1000), t = $('sess-t');
    if (t) t.textContent = sec >= 3600 ? Math.floor(sec / 3600) + ':' + ('0' + Math.floor(sec % 3600 / 60)).slice(-2) + ':' + ('0' + sec % 60).slice(-2) : Math.floor(sec / 60) + ':' + ('0' + sec % 60).slice(-2);
    var b = document.querySelector('[data-sess="end"]');
    if (b && sessArm && Date.now() - sessArm > 3000) { sessArm = 0; b.className = ''; b.textContent = 'Beenden'; }
  }
  function sessEndTap() {
    var b = document.querySelector('[data-sess="end"]');
    if (sessArm && Date.now() - sessArm <= 3000) { sessEnd(false); return; }
    sessArm = Date.now(); if (b) { b.className = 'warn'; b.textContent = 'Sicher?'; }
  }
  function warmToggle() {
    var today = dayIdx(Date.now()), mine = state.logs.filter(function (l) { return l.e === 'warm' && dayIdx(l.t) === today; });
    ui.undo = JSON.stringify(state.logs);
    if (mine.length) { mine.forEach(function (l) { state.logs.splice(state.logs.indexOf(l), 1); }); persist(); render(); toast('Aufwärmen zurückgenommen', 'undo', true); return; }
    state.logs.push({ t: Date.now(), e: 'warm', s: [1] }); persist(); sessAuto(); ui.fresh = false; render(); buzz(12); toast('Aufgewärmt · +' + WARM_XP + ' XP', 'check', true);
  }
  // ---------- Pausen-Timer
  var restT = null;
  function restOf(e) { return RESTX[e.id] || REST[e.g]; }
  function fmtMS(sec) { sec = Math.max(0, Math.ceil(sec)); return Math.floor(sec / 60) + ':' + (sec % 60 < 10 ? '0' : '') + (sec % 60); }
  function startRest(e, nx) {
    var tot = restOf(e);
    ui.rest = { end: Date.now() + tot * 1000, total: tot, name: e.n, nx: nx || '', done: false, hideAt: 0 };
    $('rest').className = 'rest on'; document.body.classList.add('resting');
    clearInterval(restT); restT = setInterval(tickRest, 250); tickRest();
  }
  function stopRest() { ui.rest = null; clearInterval(restT); $('rest').className = 'rest'; document.body.classList.remove('resting'); }
  function tickRest() {
    var r = ui.rest; if (!r) return;
    var rem = (r.end - Date.now()) / 1000;
    if (rem <= 0) {
      if (!r.done) {
        r.done = true; r.hideAt = Date.now() + (ui.arena ? 1200 : 7000);
        $('rest').className = 'rest on go'; $('rest-t').textContent = 'Los!'; $('rest-n').textContent = 'Nächster Satz';
        $('rest-fill').style.setProperty('--p', 0); buzz([80, 50, 80]);
      } else if (Date.now() > r.hideAt) stopRest();
      return;
    }
    $('rest-t').textContent = fmtMS(rem); $('rest-n').textContent = 'Pause · ' + r.name; $('rest-x').textContent = r.nx;
    $('rest-fill').style.setProperty('--p', Math.min(1, rem / r.total)); $('rest').style.setProperty('--p', Math.min(1, rem / r.total).toFixed(4));
  }
  function addRest(sec) {
    var r = ui.rest; if (!r) return;
    if (sec < 0) { if (!r.done) { r.end = Math.max(Date.now() + 1000, r.end + sec * 1000); tickRest(); } return; }
    if (r.done) { r.done = false; r.end = Date.now() + 15000; r.total = 15; $('rest').className = 'rest on'; }
    else { r.end += 15000; r.total += 15; }
    tickRest();
  }

  // ---------- Rückmeldung
  var toastT;
  function toast(msg, icon, withUndo, act) {
    var t = $('toast');
    // Essen: Rückgängig steht als Knopf in der Kopfzeile, daher keine Einblendung (außer Erfolgen wie dem Proteinziel); bei offenem Fenster ist der Knopf verdeckt, dann bleibt sie
    if (withUndo && ui.tab === 'food' && !ui.sheet && ui.undo && ui.undo.charAt(0) === '#') { if (icon !== 'trophy') return; withUndo = false; }
    // Planen: Bestätigungen ohne Einblendung (Aufleuchten/Vibration, Rückgängig als Knopf im Kopf der Tageskarte); Fehler und Hinweise (close, bolt, check) bleiben
    if (ui.tab === 'tage' && !ui.sheet && ['trophy', 'close', 'bolt', 'check'].indexOf(icon) < 0) { buzz(6); return; }
    // act: [data-Attribut, Icon, Beschriftung] = ein Knopf für einen Folgeschritt (z. B. Schnell-Eintrag merken)
    t.innerHTML = ic(icon || 'bolt') + '<span>' + esc(msg) + '</span>' + (withUndo ? '<button class="tundo" data-undo aria-label="Rückgängig">' + ic('undo') + '</button>' : '') +
      (act ? '<button class="tundo tact" data-' + act[0] + '="1" aria-label="' + esc(act[2]) + '">' + ic(act[1]) + '</button>' : '');
    t.className = 'toast on' + (withUndo || act ? ' act' : '');
    clearTimeout(toastT);
    toastT = setTimeout(function () { t.className = 'toast'; }, withUndo || act ? 6000 : 2800);
  }
  function floaty(txt, rect) {
    var el = document.createElement('span');
    el.className = 'fly'; el.textContent = txt;
    el.style.left = (rect ? rect.left + rect.width / 2 : innerWidth / 2) + 'px';
    el.style.top = (rect ? rect.top : innerHeight / 2) + 'px';
    $('fl').appendChild(el);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1000);
  }
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function sparks(n) {
    // Zenit-Effekt statt Konfetti: Lichtschein von unten und aufsteigende Funken (Gold, Weiß, Akzent), additiv gemischt
    if (reduce) return;
    var cv = $('fx'), ctx = cv.getContext('2d'), dpr = window.devicePixelRatio || 1, W = innerWidth, H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    var cs = getComputedStyle(document.documentElement), cols = [cs.getPropertyValue('--gold').trim() || '#ffc94a', '#ffffff', cs.getPropertyValue('--ac').trim() || '#3fd0b6'];
    var ps = [], N = Math.min(n || 70, 110);
    for (var i = 0; i < N; i++) ps.push({ x: W / 2 + (Math.random() - .5) * W * .9, y: H * (.72 + Math.random() * .35), vy: -(1.4 + Math.random() * 3.4), sw: Math.random() * 6.28, r: .8 + Math.random() * 2.2, c: cols[i % 3], d: Math.random() * .35 });
    var t0 = performance.now();
    (function frame(t) {
      var k = (t - t0) / 2200;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      if (k >= 1) return;
      ctx.globalCompositeOperation = 'lighter';
      var g = ctx.createRadialGradient(W / 2, H * 1.05, 0, W / 2, H * 1.05, H * .8), a = Math.max(0, .32 * (1 - k * 1.6));
      g.addColorStop(0, 'rgba(255,201,74,' + a.toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,201,74,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ps.forEach(function (p) {
        if (k < p.d) return;
        p.y += p.vy; p.sw += .05;
        ctx.globalAlpha = Math.max(0, 1 - (k - p.d) / (1 - p.d)); ctx.fillStyle = p.c; ctx.shadowColor = p.c; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(p.x + Math.sin(p.sw) * 8, p.y, p.r, 0, 6.29); ctx.fill();
      });
      ctx.globalAlpha = 1; ctx.shadowBlur = 0; ctx.globalCompositeOperation = 'source-over';
      requestAnimationFrame(frame);
    })(t0);
  }
  // Belohnungs-Moment (Vollbild): Kopfzeile mit Art und Zähler, Inhalt erscheint, nach ~1 s Aufstieg (Strahlen, Funken, swap setzt den neuen Stand); Antippen danach = weiter
  var LOOKC = ['#8fa39a', '#5b8fd6', '#a374d8', '#ffc94a', '#e0533d', '#57c7b8'], MATC = ['#8a6a4a', '#8d9399', '#b07a4a', '#b9c1cb', '#d9a82e', '#8fd8d2', '#6aa8ff', '#57c7b8'];
  function fxShow(f) {
    var o = document.createElement('div'), done = false, t1, t2;
    o.className = 'lvfx ' + f.cls; o.style.setProperty('--fxc', f.col); o.setAttribute('role', 'status');
    o.innerHTML = '<i class="lvfx-r"></i><p class="lvfx-h">' + f.head + (f.step ? '<em>' + f.step + '</em>' : '') + '</p><div class="lvfx-c">' + f.inner + '</div>' +
      '<p class="lvfx-t"><b>' + f.title + '</b>' + (f.sub ? '<small>' + f.sub + '</small>' : '') + '</p>' + (f.more || '') + '<small class="lvfx-n">Antippen</small>';
    document.body.appendChild(o); buzz([20, 40, 20]);
    function close() { if (done) return; done = true; clearTimeout(t1); clearTimeout(t2); o.classList.add('out'); setTimeout(function () { o.remove(); f.done(); }, 320); }
    t1 = setTimeout(function () { o.classList.add('up'); if (f.swap) f.swap(o); buzz([60, 40, 90]); sparks(f.big ? 220 : 70); }, reduce ? 0 : 950);
    t2 = setTimeout(close, 7000);
    o.addEventListener('click', function (ev) { ev.stopPropagation(); if (o.classList.contains('up')) close(); });
  }
  // Belohnungen sammeln statt mitten im Training zeigen: erst im Heute-Tab außerhalb der Arena (nach dem Training bzw. nach dem Eintragen), einzeln nacheinander.
  // Reihenfolge: Freischaltungen, Karten, Muskeln, Ziele, Konto-Level als Finale. Die Schlange übersteht Neuladen (localStorage, Demo getrennt).
  // Einträge: {t: 'un'|'card'|'mus'|'goal'|'acc', id, lv0?, lv?, tier0?, tier?}; mehrere Aufstiege derselben Karte/Gruppe werden zu einem (lv0 → lv)
  var RWK = DEMO ? 'zenit.rwq.demo' : 'zenit.rwq', RWO = { un: 0, card: 1, mus: 2, goal: 3, acc: 4 }, rwq = [], rwOn = false;
  try { rwq = JSON.parse(localStorage.getItem(RWK)) || []; } catch (e) { rwq = []; }
  function rwSave() { try { if (rwq.length) localStorage.setItem(RWK, JSON.stringify(rwq)); else localStorage.removeItem(RWK); } catch (e) { /* egal */ } }
  function rwAdd(x) {
    var same = rwq.filter(function (y) { return y.t === x.t && y.id === x.id; })[0];
    if (same) { same.lv = x.lv; same.tier = x.tier; } else rwq.push(x);
    rwq.sort(function (a, b) { return RWO[a.t] - RWO[b.t]; }); rwSave();
  }
  function rwPlay() {
    if (rwOn || !rwq.length || ui.tab !== 'heute' || ui.arena || ui.sheet) return;
    var d = derive(state.logs), n = rwq.length, i = 0; rwOn = true;
    rwq.sort(function (a, b) { return RWO[a.t] - RWO[b.t]; });
    (function next() {
      var x = rwq.shift(); rwSave();
      if (!x) { rwOn = false; return; }
      i++; fxShow(rwFx(x, d, n > 1 ? i + ' / ' + n : '', next));
    })();
  }
  function rwFx(x, d, step, next) {
    var f = { step: step, done: next };
    if (x.t === 'un') {
      // Freigeschaltet: gesperrte Karte (gestrichelt, Schloss) bricht auf und zeigt sich; darunter die erfüllten Voraussetzungen
      var e = EXB[x.id], r = rarOf(e), c = cardOf(d, e);
      f.cls = 'un'; f.col = LOOKC[r]; f.head = ic('lock') + 'Freigeschaltet'; f.title = esc(e.n); f.sub = 'Neu in Sammlung, Skilltree und Plan';
      f.inner = '<div class="hc big lk ' + RAR[r][2] + '"><small>' + RAR[r][0] + '</small><b>' + esc(e.n) + '</b><em>' + ic('lock') + '</em></div>';
      f.more = '<div class="lvfx-q">' + (e.req || []).map(function (q) { var rl = reqLine(q, d); return '<span>' + ic('check') + esc(rl.name) + ' ' + rl.need + ' ' + esc(rl.u) + '</span>'; }).join('') + '</div>';
      f.swap = function (o) { var h = o.querySelector('.hc'); h.className = h.className.replace(' lk', ' l' + lookOf(c.lv)); h.querySelector('em').textContent = 'Lv ' + c.lv; };
    } else if (x.t === 'card') {
      var e2 = EXB[x.id], r2 = rarOf(e2), l0 = lookOf(x.lv0), l1 = lookOf(x.lv);
      f.cls = 'card'; f.col = LOOKC[l1]; f.head = ic('up') + 'Karte aufgestiegen'; f.title = 'Lv ' + x.lv0 + ' → ' + x.lv; f.sub = l1 !== l0 ? 'Neuer Look: ' + LOOK[l1] : esc(e2.n);
      f.inner = '<div class="hc big ' + RAR[r2][2] + ' l' + l0 + '"><small>' + RAR[r2][0] + '</small><b>' + esc(e2.n) + '</b><em>Lv <i>' + x.lv0 + '</i></em></div>';
      f.swap = function (o) { var h = o.querySelector('.hc'); h.className = h.className.replace(/ l\d/, ' l' + l1); h.querySelector('em i').textContent = x.lv; };
    } else if (x.t === 'mus') {
      var m0 = matOf(x.lv0), m1 = matOf(x.lv);
      f.cls = 'mus'; f.col = MATC[m1]; f.head = ic(MUSI[x.id]) + (m1 !== m0 ? 'Neues Material' : 'Muskel gestärkt'); f.title = MUSN[x.id] + ' Lv ' + x.lv; f.sub = m1 !== m0 ? MAT[m0][1] + ' → ' + MAT[m1][1] : MAT[m1][1];
      f.inner = '<i class="emb-i big m' + m0 + '">' + ic(MUSI[x.id]) + '</i>';
      f.swap = function (o) { var h = o.querySelector('.emb-i'); h.className = h.className.replace(/ m\d/, ' m' + m1); };
    } else if (x.t === 'goal') {
      var mo = x.id === 'mo';
      f.cls = 'goal'; f.col = mo ? '#f2c14e' : '#86b06e'; f.head = ic(mo ? 'trophy' : 'cal') + (mo ? 'Monatsziel' : 'Wochenziel'); f.title = (mo ? MO_GOAL : WK_GOAL) + ' Trainingstage'; f.sub = '+' + (mo ? MO_XP : WK_XP) + ' XP';
      f.inner = '<i class="lvgoal">' + ic(mo ? 'trophy' : 'cal') + '</i>'; f.big = mo;
    } else {
      // Konto-Level: Gold, Doppelring, Zahl zählt hoch; neue Stufe (Titel) als eigener Hinweis
      var nt = x.tier > x.tier0;
      f.cls = 'acc'; f.col = '#ffc94a'; f.big = true; f.head = ic('peak') + (nt ? 'Neue Stufe' : 'Konto-Level'); f.title = nt ? TIERS[x.tier] : 'Level ' + x.lv; f.sub = nt ? 'Level ' + x.lv + ' · neuer Titel' : TIERS[x.tier];
      f.inner = '<div class="lvacc"><small>Level</small><b>' + x.lv0 + '</b></div>';
      f.swap = function (o) { var b = o.querySelector('.lvacc b'), v = x.lv0; (function up() { b.textContent = v; if (v++ < x.lv) setTimeout(up, 180); })(); };
    }
    return f;
  }
  var hapEl = null;
  function buzz(ms) {
    try { if (navigator.vibrate) { navigator.vibrate(ms); return; } } catch (e) { /* egal */ }
    // iPhone: Safari kann nicht vibrieren; ab iOS 18 löst das Umschalten eines versteckten Schalters ein kurzes Haptik-Signal aus
    try {
      if (!hapEl) { hapEl = document.createElement('label'); hapEl.setAttribute('aria-hidden', 'true'); hapEl.style.cssText = 'position:fixed;left:-99px;top:0;opacity:0;pointer-events:none'; hapEl.innerHTML = '<input type="checkbox" switch tabindex="-1">'; hapEl.addEventListener('click', function (ev) { ev.stopPropagation(); }); document.body.appendChild(hapEl); }
      var n = Array.isArray(ms) ? Math.ceil(ms.length / 2) : 1;
      for (var i = 0; i < n; i++) setTimeout(function () { hapEl.click(); }, i * 90);
    } catch (e) { /* egal */ }
  }
  function afterSave(before, after, e, rect, v) {
    var today = dayIdx(Date.now()), bt = before.byDay[today], at = after.byDay[today];
    var gain = after.xp - before.xp;
    var lvB = level(before.xp), lvA = level(after.xp), n0 = rwq.length;
    EX.forEach(function (x) { if (after.unlocked[x.id] && !before.unlocked[x.id]) rwAdd({ t: 'un', id: x.id }); });
    if (lvA > lvB) rwAdd({ t: 'acc', id: 'acc', lv0: lvB, lv: lvA, tier0: tierOfLevel(lvB), tier: tierOfLevel(lvA) });
    if (after.wkHit[wkOf(today)] && !before.wkHit[wkOf(today)]) rwAdd({ t: 'goal', id: 'wk' });
    if (after.moHit[moOf(today)] && !before.moHit[moOf(today)]) rwAdd({ t: 'goal', id: 'mo' });
    var c0 = cardOf(before, e).lv, c1 = cardOf(after, e).lv;
    if (c1 > c0) rwAdd({ t: 'card', id: e.id, lv0: c0, lv: c1 });
    Object.keys(musOf(e)).forEach(function (k) { var a0 = mLevel(before.mp[k] || 0).lv, a1 = mLevel(after.mp[k] || 0).lv; if (a1 > a0) rwAdd({ t: 'mus', id: k, lv0: a0, lv: a1 }); });
    var goalNow = at && at.goal && !(bt && bt.goal);
    var extraNow = at && bt && at.extra > bt.extra;
    var exT = exTier(after, e) > exTier(before, e);
    var pb = before.bestRaw[e.id] !== undefined && after.bestRaw[e.id] > before.bestRaw[e.id];
    var goalEx = after.goalHit[e.id] && !before.goalHit[e.id];
    ui.fresh = false;
    render();
    if (gain > 0) floaty('+' + gain + ' XP', rect);
    buzz(12);
    // Neue Belohnung: in der Arena nur ein kurzer Hinweis, gezeigt wird sie nach dem Training (rwPlay aus render)
    if (rwq.length > n0) { toast(ui.arena ? 'Belohnung gesammelt · nach dem Training' : 'Belohnung!', 'trophy', true); sparks(40); }
    else if (goalNow) { toast('Tagesziel erreicht · +40 XP', 'target', true); sparks(90); }
    else if (extraNow) toast('Bonus-Übung · +30 XP', 'bolt', true);
    else if (goalEx) { toast('Ziel erreicht: ' + e.n, 'trophy', true); sparks(90); }
    else if (exT) toast(e.n + ' ist jetzt ' + TIERS[exTier(after, e)], 'up', true);
    else if (pb) toast('Neuer Rekord: ' + after.bestRaw[e.id], 'trophy', true);
    else toast('+' + gain + ' XP', 'check', true);
  }

