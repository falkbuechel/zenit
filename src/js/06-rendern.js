  // ---------- Rendern
  function snapshot() {
    var m = { p: {}, n: {} };
    document.querySelectorAll('[data-k]').forEach(function (el) { m.p[el.dataset.k] = +el.dataset.p; });
    document.querySelectorAll('[data-nk]').forEach(function (el) { m.n[el.dataset.nk] = +el.dataset.n; });
    return m;
  }
  function countUp(el, from, to) {
    var t0 = performance.now(), dur = 650;
    (function f(t) {
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (k < 1) requestAnimationFrame(f);
    })(t0);
  }
  function hydrate(snap, fresh) {
    document.querySelectorAll('[data-k]').forEach(function (el) {
      var to = +el.dataset.p, from = fresh ? 0 : snap.p[el.dataset.k];
      if (from === undefined || from === to) return;
      el.style.setProperty('--p', from);
      requestAnimationFrame(function () { requestAnimationFrame(function () { el.style.setProperty('--p', to); }); });
    });
    document.querySelectorAll('[data-nk]').forEach(function (el) {
      var to = +el.dataset.n, from = fresh && el.dataset.nk !== 'xp' ? 0 : snap.n[el.dataset.nk];
      if (from === undefined || from === to) return;
      el.textContent = from; countUp(el, from, to);
    });
  }
  var seenUx = null;
  try { seenUx = JSON.parse(localStorage.getItem(DEMO ? 'zenit.seenUx.demo' : 'zenit.seenUx')); } catch (err) { seenUx = null; }
  function saveSeen(a) { seenUx = a; try { localStorage.setItem(DEMO ? 'zenit.seenUx.demo' : 'zenit.seenUx', JSON.stringify(a)); } catch (err) { /* egal */ } }
  function notices(d, now) {
    var out = [], today = dayIdx(now), hr = new Date(now).getHours(), ss = streakInfo(now), td = d.byDay[today], n = td ? Object.keys(td.ex).length : 0, sc = schedFor(today);
    var lw = lastW(), wds = lw ? daysSince(lw.t) : null;
    if (wds === null || wds >= 7) out.push({ k: 'wg', i: 'scale', t: wds === null ? 'Gewicht eintragen' : 'Zuletzt vor ' + wds + ' Tagen gewogen', s: 'Jetzt wiegen', tab: 'profil' });
    if (ss.mode === 'last') out.push({ k: 'st', i: 'clock', hot: 1, t: 'Letzte Chance für heute', s: 'Serie ' + ss.n + ' sichern', tab: 'heute' });
    else if (hr >= 17 && n < DAILY && sc.length) out.push({ k: 'tr', i: 'dumb', t: 'Training heute offen', s: sc.map(function (x) { return x.n; }).join(' + ') + ' · ' + n + '/' + DAILY, tab: 'heute' });
    var fs = foodSum(today), fg = foodGoal();
    if (hr >= 13 && !fs.items.length) out.push({ k: 'f0', i: 'food', t: 'Noch nichts gegessen eingetragen', s: 'Mahlzeit erfassen', tab: 'food' });
    else if (hr >= 19 && fs.p < fg.p) out.push({ k: 'fp', i: 'food', t: 'Protein: noch ' + (fg.p - fs.p) + ' g', s: fs.p + ' / ' + fg.p + ' g heute', tab: 'food' });
    var wn = d.wkc[wkOf(today)] || 0, wl = 7 - wdOf(today) - (td ? 1 : 0);
    if (wn < WK_GOAL && WK_GOAL - wn === wl && wl > 0) out.push({ k: 'wk', i: 'cal', hot: 1, t: 'Wochenziel wackelt', s: 'Noch ' + wl + ' Tage, jeder zählt', tab: 'heute' });
    var un = EX.filter(function (e) { return d.unlocked[e.id]; }).map(function (e) { return e.id; });
    if (!seenUx) saveSeen(un);
    else {
      var nw = un.filter(function (id) { return seenUx.indexOf(id) < 0; });
      if (nw.length) out.push({ k: 'ux', i: 'lock', gold: 1, t: nw.length + (nw.length === 1 ? ' neue Übung frei' : ' neue Übungen frei'), s: nw.slice(0, 2).map(function (id) { return EXB[id].n; }).join(', ') + (nw.length > 2 ? ' …' : ''), tab: 'fort' });
    }
    return out;
  }
  function badges(NT) {
    Array.prototype.forEach.call($('tabs').querySelectorAll('button'), function (bt) {
      var k = bt.dataset.tab, c = k === 'tage' ? NT.length : NT.filter(function (x) { return x.tab === k; }).length, b = bt.querySelector('.bdg');
      if (!c || ui.tab === k) { if (b) b.remove(); return; }
      var hot = NT.some(function (x) { return (k === 'tage' || x.tab === k) && (x.hot || x.gold); });
      if (!b) { b = document.createElement('b'); bt.appendChild(b); }
      b.className = 'bdg' + (hot ? ' hot' : ''); b.textContent = c > 1 || k === 'tage' ? c : '';
    });
  }
  function placeInd() {
    var tb = $('tabs'), ind = tb.querySelector('.ind'), a = tb.querySelector('[aria-current]'); if (!ind || !a) return;
    // Anzeige = kleiner Punkt unter dem aktiven Symbol, gleitet beim Wechsel mit
    var r = a.getBoundingClientRect(), r0 = tb.getBoundingClientRect(), x = r.left - r0.left + r.width / 2 - 2.5, y = r.top - r0.top + r.height - 9;
    ind.style.transform = 'translate(' + x + 'px,' + y + 'px)'; ind.style.setProperty('--bc', a.style.getPropertyValue('--bc'));
    if (!ind.classList.contains('on')) requestAnimationFrame(function () { requestAnimationFrame(function () { ind.classList.add('on'); }); });
  }
  window.addEventListener('resize', placeInd);
  window.addEventListener('pageshow', placeInd);
  if (window.visualViewport) visualViewport.addEventListener('resize', placeInd);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeInd);
  function render() {
    var now = Date.now(), d = derive(state.logs), fresh = ui.fresh;
    ui.fresh = false;
    var snap = snapshot();
    var tr = tierOfLevel(level(d.xp));
    document.documentElement.setAttribute('data-tier', tr);
    $('hudw').classList.add('nohud');
    // Jeder Bereich hat seine Farbe (--bc): aktives Symbol und Punkt leuchten darin
    var T = [['tage', 'Plan', 'cal', '--g-cardio'], ['food', 'Essen', 'food', '--g-push'], ['heute', 'Heute', 'dumb', '--ac'], ['fort', 'Sammlung', 'gem', '--gold'], ['profil', 'Profil', 'user', '--g-kh']];
    var tb = $('tabs');
    if (!tb.querySelector('.ind')) tb.innerHTML = '<i class="ind" aria-hidden="true"></i>' + T.map(function (t) { return '<button data-tab="' + t[0] + '" aria-label="' + t[1] + '" style="--bc:var(' + t[3] + ')">' + ic(t[2]) + '</button>'; }).join('');
    Array.prototype.forEach.call(tb.querySelectorAll('button'), function (bt) { if (bt.dataset.tab === ui.tab) bt.setAttribute('aria-current', 'page'); else bt.removeAttribute('aria-current'); });
    placeInd();
    var NT = notices(d, now); ui.nts = NT; badges(NT);
    var v = $('view');
    v.className = 'page gut' + (fresh ? ' fresh' : '') + (ui.sw ? (ui.sw > 0 ? ' sw-l' : ' sw-r') : '');
    ui.sw = 0;
    v.innerHTML = ui.tab === 'heute' ? viewToday(d, now) : ui.tab === 'tage' ? viewPlan(d, now) : ui.tab === 'food' ? viewFood(d, now) : ui.tab === 'fort' ? viewProgress(d, now) : viewProfile(d, now);
    document.body.classList.toggle('arm', ui.tab === 'heute' && !!ui.arena);
    stApply();
    if (ui.tab === 'fort' && (ui.col || 'ka') === 'ka') { var un0 = EX.filter(function (e) { return d.unlocked[e.id]; }).map(function (e) { return e.id; }); if (!seenUx || un0.length !== seenUx.length) { saveSeen(un0); badges(notices(d, now)); } }
    if (ui.sheet && ui.sheet.settings && $('sheet').classList.contains('open')) $('sheet').innerHTML = setHtml();
    if ((ui.sheet && ui.sheet.plan) || ui.pman || ui.pe) planSheet(d, now);
    hydrate(snap, fresh);
    if (ui.scroll) { var sc = ui.scroll; ui.scroll = null; setTimeout(function () { scrollToEl(sc); }, 60); }
    jumpMode = ''; updJump();
    // Gesammelte Belohnungen zeigen, sobald Heute ohne Arena sichtbar ist (rwPlay prüft Tab, Arena, offenes Fenster)
    if (rwq.length && !rwOn) setTimeout(rwPlay, 600);
  }
  function cardProg(d, e) {
    // gewählte Karte: nächstes Level braucht Leistung (Satzziel in einer Einheit) und Fleiß (KP)
    var c = cardOf(d, e), cc = cCost(e, c.lv);
    if (c.lv >= CMAX) return '<div class="cpg"><b>Lv 10 · Zenit</b><span>' + ic('target') + rxText(e, rx(e, CMAX)) + '</span></div>';
    if (cardReady(d, e)) return '<div class="cpg prf"><b>' + ic('up') + 'Aufstiegsprüfung</b><span>' + ic('target') + rxText(e, rx(e, c.lv + 1)) + ' schaffen → Lv ' + (c.lv + 1) + '</span></div>';
    return '<div class="cpg"><b>Lv ' + c.lv + '</b><span>' + ic('target') + rxText(e, rx(e, c.lv)) + '</span><span>' + ic('bolt') + c.kp + ' / ' + cc + ' KP</span></div>';
  }
