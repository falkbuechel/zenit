  // ---------- Ereignisse
  function scrollToEl(el) {
    if (typeof el === 'string') el = document.querySelector(el);
    if (!el) return;
    var y = el.getBoundingClientRect().top + $('app').scrollTop - $('hud').offsetHeight - 10;
    $('app').scrollTo({ top: Math.max(0, y), behavior: reduce ? 'auto' : 'smooth' });
  }
  function go(k) {
    if (k === 'plan') { scrollToEl('.plan-h'); return; }
    ui.sel = null; ui.del = null; ui.fresh = true; ui.hd = null;
    if (k === 'cal') { ui.tab = 'profil'; ui.pstat = 'tr'; }
    else if (k === 'xp') { ui.tab = 'profil'; ui.pstat = 'tr'; ui.met = 'xp'; ui.scroll = null; $('app').scrollTo(0, 0); }
    else if (k === 'pfad') { ui.tab = 'fort'; ui.col = 'ka'; ui.sel = null; ui.scroll = null; $('app').scrollTo(0, 0); }
    render();
  }
  var jumpMode = '', todayN = 0, todayVis = 0;
  function updJump() {
    var j = $('jump'), ph = ui.tab === 'heute' && todayN < DAILY && todayVis > 0 ? document.querySelector('.plan-h') : null, m = '';
    if (ph) {
      var top = ph.getBoundingClientRect().top, hb = $('hudw').getBoundingClientRect().bottom;
      if (top > innerHeight * 0.72) m = 'plan'; else if (top < hb - 40 && $('app').scrollTop > 300) m = 'top';
    }
    if (m !== jumpMode) {
      jumpMode = m;
      if (m === 'plan') j.innerHTML = ic('down') + 'Heute';
      else if (m === 'top') j.innerHTML = ic('up') + 'Dashboard';
    }
    j.classList.toggle('on', !!m);
  }
  $('app').addEventListener('scroll', updJump, { passive: true });
  // iOS: Pinch-Zoom sperren (Safari ignoriert user-scalable=no)
  document.addEventListener('gesturestart', function (ev) { ev.preventDefault(); });
  window.addEventListener('resize', updJump);
  document.addEventListener('keydown', function (ev) {
    if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.dataset && ev.target.dataset.go) { ev.preventDefault(); go(ev.target.dataset.go); }
  });
  document.addEventListener('click', function (ev) {
    var t = ev.target, el;
    if (t.closest('[data-swap]')) { openSwap(); return; }
    if ((el = t.closest('[data-sm]'))) { ui.sm = el.dataset.sm; $('sheet').innerHTML = swapHtml(); return; }
    if ((el = t.closest('[data-sw]'))) { applySwap(el.dataset.sw); return; }
    if (t.closest('[data-sw-reset]')) { resetSwap(); return; }
    if ((el = t.closest('[data-xt]'))) { ui.xo[el.dataset.xt] = !ui.xo[el.dataset.xt]; ui.fresh = false; render(); return; }
    if ((el = t.closest('[data-zoom]')) && !t.closest('button, input, a, summary')) { ui.hpath = !ui.hpath; ui.hz = true; ui.fresh = false; if (ui.tab !== 'heute') ui.tab = 'heute'; ui.scroll = ui.hpath ? '.bp-n.cur' : null; render(); if (!ui.hpath) $('app').scrollTo(0, 0); buzz(6); return; }
    if (t.closest('[data-arena]')) { ui.arena = true; ui.hpath = false; ui.fresh = true; if (!sess) sessStart(); else render(); $('app').scrollTo(0, 0); return; }
    if ((el = t.closest('[data-arv]'))) { var ae = EXB[ui.hcur]; if (ui.arv && ae) { arvSet(ui.arv.v + +el.dataset.arv * (ae.u === 'Sek.' ? 5 : 1)); buzz(3); } return; }
    if (t.closest('[data-arsave]')) { arSave(); return; }
    if (t.closest('[data-arx]')) { ui.arena = false; ui.fresh = true; render(); $('app').scrollTo(0, 0); return; }
    if ((el = t.closest('[data-hsel]'))) { ui.hsel = el.dataset.hsel; ui.fresh = false; render(); buzz(4); return; }
    if (foodClick(t)) return;
    if (profClick(t)) return;
    if (planClick(t)) return;
    if ((el = t.closest('[data-timer]'))) { openTimer(el.dataset.timer); return; }
    if ((el = t.closest('[data-tm]'))) { tmAct(el.dataset.tm); return; }
    if ((el = t.closest('[data-sess]'))) { if (el.dataset.sess === 'start') sessStart(); else sessEndTap(); return; }
    if (t.closest('[data-warm]')) { warmToggle(); return; }
    if (t.closest('[data-jump]')) { if (jumpMode === 'plan') scrollToEl('.plan-h'); else $('app').scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
    if ((el = t.closest('[data-go]')) && !t.closest('a')) { go(el.dataset.go); return; }
    if ((el = t.closest('[data-nt]'))) {
      var nt = ui.nts.filter(function (x) { return x.k === el.dataset.nt; })[0]; if (!nt) return;
      ui.tab = nt.tab; ui.sel = null; ui.pe = null; if (nt.k === 'ux') ui.col = 'ka'; ui.fresh = true; closeSheet(); render(); $('app').scrollTo(0, 0);
      if (nt.k === 'wg') openWeight();
      return;
    }
    // Offenen Tab erneut antippen: nicht neu laden, nur sanft nach oben
    if ((el = t.closest('[data-tab]')) && el.dataset.tab === ui.tab && !ui.sel && !ui.pe && !ui.pman) { if (ui.sheet) closeSheet(); else $('app').scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (el) { ui.sw = TABS.indexOf(el.dataset.tab) - TABS.indexOf(ui.tab); ui.fdrawn = false; ui.tab = el.dataset.tab; ui.sel = null; ui.del = null; ui.pe = null; ui.pman = false; ui.pnew = false; ui.fresh = true; closeSheet(); render(); $('app').scrollTo(0, 0); return; }
    if ((el = t.closest('[data-pill]'))) { var pr = el.dataset.pill.split(':'); openSheet(pr[0], +pr[1]); return; }
    if (t.closest('[data-sheet-close]') || t.id === 'shade') { if ((t.id !== 'shade' && fSheetBack()) || pSheetBack()) return; closeSheet(); return; }
    if ((el = t.closest('[data-step]'))) { var inp = $('sv'), nv = Math.max(0, sheetVal() + (+el.dataset.step) * ui.sheet.step); inp.value = nv; updSheetXp(); buzz(6); return; }
    if ((el = t.closest('[data-preset]'))) { $('sv').value = el.dataset.preset; updSheetXp(); return; }
    if (t.closest('[data-sheet-save]')) { saveSheet(); return; }
    if (t.closest('[data-sheet-del]')) { delSet(); return; }
    if (t.closest('[data-sall]')) { ui.sall = !ui.sall; ui.fresh = false; render(); return; }
    if (t.closest('[data-kmon]')) { ui.kmon = !ui.kmon; ui.fresh = false; render(); return; }
    if ((el = t.closest('[data-srng]'))) { ui.srng = el.dataset.srng; ui.fresh = false; render(); return; }
    if ((el = t.closest('[data-lcf]'))) { var lf = el.dataset.lcf.split(':'), lsv = document.querySelector('[data-lcid="' + lf[0] + '"]'); if (lsv) { if (lsv.dataset.f === lf[1]) delete lsv.dataset.f; else lsv.dataset.f = lf[1]; el.parentNode.querySelectorAll('[data-lcf]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lcf.split(':')[1] === lsv.dataset.f)); }); buzz(4); } return; }
    if ((el = t.closest('[data-pstat]'))) { ui.pstat = el.dataset.pstat || null; ui.sel = null; ui.fresh = true; render(); $('app').scrollTo(0, 0); return; }
    if ((el = t.closest('[data-col]'))) { ui.col = el.dataset.col; ui.sel = null; ui.fresh = true; render(); return; }
    if ((el = t.closest('[data-cf2]'))) { ui.cf2 = el.dataset.cf2; ui.fresh = false; render(); return; }
    if ((el = t.closest('[data-cg]'))) { ui.cgo = ui.cgo || {}; ui.cgo[el.dataset.cg] = !ui.cgo[el.dataset.cg]; ui.fresh = false; render(); return; }
    if ((el = t.closest('[data-cardo]'))) { var ce = EXB[el.dataset.cardo]; if (ce) { ui.sheet = { card: ce.id }; sheetOpen(cardSheet(derive(state.logs), ce), true); } return; }
    if ((el = t.closest('[data-stn]'))) { if (stMoved) { stMoved = false; return; } ui.stsel = ui.stsel === el.dataset.stn ? null : el.dataset.stn; ui.fresh = false; render(); buzz(4); return; }
    if ((el = t.closest('[data-msel]'))) { if (mfMoved) { mfMoved = false; return; } ui.msel = el.dataset.msel; ui.fresh = false; render(); buzz(4); return; }
    if ((el = t.closest('[data-muso]'))) { ui.sheet = { mus: el.dataset.muso }; sheetOpen(musSheet(derive(state.logs), el.dataset.muso), true); return; }
    if ((el = t.closest('[data-cdet]'))) { closeSheet(); ui.tab = 'fort'; ui.sel = el.dataset.cdet; ui.fresh = true; render(); $('app').scrollTo(0, 0); return; }
    if (t.closest('[data-undo]')) { undo(); return; }
    if ((el = t.closest('[data-rest]'))) { if (el.dataset.rest === 'skip') stopRest(); else addRest(el.dataset.rest === 'sub' ? -15 : 15); return; }
    if ((el = t.closest('[data-xr]'))) { ui.xr = el.dataset.xr; ui.pt = null; ui.fresh = true; render(); return; }
    if ((el = t.closest('[data-xm]'))) { ui.xm = el.dataset.xm; ui.fresh = true; render(); return; }
    if ((el = t.closest('[data-pt]'))) { ui.pt = +el.dataset.pt; render(); return; }
    if ((el = t.closest('[data-open]'))) { ui.sel = el.dataset.open; ui.pt = null; ui.del = null; ui.fresh = true; render(); $('app').scrollTo(0, 0); return; }
    if (t.closest('[data-back]')) { ui.sel = null; ui.del = null; ui.fresh = true; render(); return; }
    if ((el = t.closest('[data-demo]'))) { demoSwitch(el.dataset.demo); return; }
    var b = t.closest('[data-act]');
    if (!b) return;
    var act = b.dataset.act;
    if (act === 'del') {
      var i = +b.dataset.i;
      if (ui.del === i) { state.logs.splice(i, 1); ui.del = null; persist(); toast('Gelöscht', 'close'); } else ui.del = i;
      render();
    } else if (act === 'wipe') {
      if (ui.del === 'all') { state.logs = []; state.food = null; ui.del = null; persist(); toast('Alles gelöscht', 'close'); } else ui.del = 'all';
      render();
    } else if (act === 'resttoggle') {
      restOn = !restOn; try { localStorage.setItem('zenit.rest', restOn ? '1' : '0'); } catch (err) { /* egal */ }
      if (!restOn) stopRest();
      render();
    } else if (act === 'export') exportData();
    else if (act === 'opensettings') openSettings();
    else if (act === 'import') { ui.io = ' '; render(); }
    else if (act === 'ioclose') { ui.io = ''; render(); }
    else if (act === 'doimport') importData();
  });
  document.addEventListener('input', function (ev) {
    var t = ev.target;
    if (t.id === 'sv') updSheetXp();
    if (/^c-/.test(t.id || '') && $('c-res')) calcUpd();
    // Wasser-Feld in Litern (Komma erlaubt); Zahlen über 20 gelten als ml
    if (t.id === 'wa-v') { var wl = parseFloat(t.value.replace(',', '.')) || 0, wv = waSet(wl > 20 ? wl : wl * 1000); $('wa-r').dataset.v = wv; waShow(wv); }
    if (t.id === 'ftm' && /^\d\d:\d\d/.test(t.value)) $('ftmv').textContent = t.value.slice(0, 5);
    if (t.id === 'ftm' && $('fmk') && !$('fmk').dataset.man && /^\d\d:\d\d$/.test(t.value)) { var qd = new Date(); qd.setHours(+t.value.slice(0, 2), +t.value.slice(3), 0, 0); fmkSet(mealOf(qd.getTime())[1]); }
    if (t.id === 'fq') { ui.fq = t.value; $('fres').innerHTML = fresHtml(); clearTimeout(fonT); fonT = setTimeout(fonSearch, 450); }
    if (t.id === 'fa' && ui.fpick) { var fa = parseFloat(t.value); if (fa > 0) { ui.fpick.a = fa; fpickUpd(); } }
    if (ui.dd && /^(dd|di)-/.test(t.id)) { readDraft(); var tt = $('dd-tot'); if (tt) tt.innerHTML = dishTotHtml(dishTot(ui.dd)); }
  });
  function arvSet(v) {
    var e = EXB[ui.hcur], n = $('arn'); if (!ui.arv || !e) return; v = Math.max(e.u === 'Sek.' ? 5 : 1, Math.min(999, v)); ui.arv.v = v;
    if (n) { n.textContent = v; n.className = v >= rxNow(derive(state.logs), e).r ? 'hit' : ''; }
  }
  // Zahl wischen (auch der Arena-Zähler #arn, 16 px je Schritt): ab 8 px waagerecht wird aus dem Tippen ein Ziehen; je 10 px ein Schritt (Menge: 5 g, ½ Portion oder eine Grundeinheit; Wasser: 50 ml)
  var nsw = null;
  document.addEventListener('pointerdown', function (ev) {
    var el = ev.target.closest && ev.target.closest('#fa, #fpcn, #wa-v, #arn'); if (!el) return;
    nsw = { el: el, x: ev.clientX, on: false, wa: /^wa-/.test(el.id), ar: el.id === 'arn', v0: el.id === 'arn' ? ui.arv && ui.arv.v : /^wa-/.test(el.id) ? foodState().wa[fSd()] || 0 : ui.fpick ? ui.fpick.a : 0 };
  });
  document.addEventListener('pointermove', function (ev) {
    if (!nsw) return; var dx = ev.clientX - nsw.x;
    if (!nsw.on) { if (Math.abs(dx) < 8) return; nsw.on = true; if (document.activeElement === nsw.el) nsw.el.blur(); }
    ev.preventDefault(); var n = Math.round(dx / 10);
    if (nsw.ar) { var ae = EXB[ui.hcur], av = nsw.v0 + Math.round(dx / 16) * (ae && ae.u === 'Sek.' ? 5 : 1); if (ui.arv && av !== ui.arv.v) { arvSet(av); buzz(3); } }
    else if (nsw.wa) {
      var v = Math.max(0, Math.min(8000, nsw.v0 + n * 50)); if (v === nsw.v) return; nsw.v = v; buzz(3); waShow(v);
    } else if (ui.fpick) {
      var it = fItem(ui.fpick.i), stp = it.dish ? 0.5 : it.pc ? it.u[0][1] : 5, a = Math.max(stp, Math.round((nsw.v0 + n * stp) * 10) / 10);
      if (a !== ui.fpick.a) { ui.fpick.a = a; if ($('fa')) $('fa').value = a; fpickUpd(); buzz(3); }
    }
  }, { passive: false });
  function numEnd() { if (nsw && nsw.on && nsw.wa && nsw.v != null) { waSet(nsw.v); $('sheet').innerHTML = waHtml(); } nsw = null; }
  document.addEventListener('pointerup', numEnd);
  document.addEventListener('pointercancel', numEnd);
  document.addEventListener('change', function (ev) {
    var t = ev.target, m = /^di-n-(\d+)$/.exec(t.id || '');
    if (m && ui.dd) {
      // Zutat aus der Datenbank gewählt: alle Nährwerte je 100 g übernehmen
      var hit = libFind(t.value), i = +m[1];
      if (hit) { readDraft(); var q = ui.dd.ing[i]; NK.forEach(function (k) { q[k] = hit[k]; }); q.i = hit.id; q.n = hit.n; if (q.a === '') q.a = hit.u.length ? hit.u[0][1] : 100; $('sheet').innerHTML = dishEditHtml(); }
    }
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && !pSheetBack()) closeSheet();
    if (ev.key === 'Enter' && ev.target.id === 'sv') saveSheet();
    if (ev.key === 'Enter' && (ev.target.id === 'f-p' || ev.target.id === 'f-k' || ev.target.id === 'f-n')) { var fb = document.querySelector('[data-fsave],[data-fgsave]'); if (fb) fb.click(); }
  });

  function saveFile(text) {
    var name = 'zenit-backup-' + new Date().toISOString().slice(0, 10) + '.json', done = function () { try { localStorage.setItem('zenit.lastBackup', String(Date.now())); } catch (e) { /* egal */ } toast('Backup gespeichert', 'check'); };
    try {
      var f = new File([text], name, { type: 'application/json' });
      if (navigator.canShare && navigator.canShare({ files: [f] })) { navigator.share({ files: [f], title: 'Zenit Backup' }).then(done, function (err) { if (!err || err.name !== 'AbortError') { ui.io = text; render(); } }); return; }
      var a = document.createElement('a'); a.href = URL.createObjectURL(f); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000); done();
    } catch (err) { ui.io = text; render(); }
  }
  function exportData() {
    var text = JSON.stringify({ app: 'zenit', v: 2, logs: state.logs, plan: state.plan, food: state.food }, null, 1);
    if (!(window.claude && window.claude.use)) { saveFile(text); return; }
    window.claude.use('downloads').then(function (dl) {
      if (!dl) { ui.io = text; render(); return; }
      return dl.save({ filename: 'zenit-backup.json', data: text }).then(function () { toast('Backup gespeichert', 'check'); }, function (err) {
        if (err && err.code === 'declined') return;
        ui.io = text; render();
      });
    });
  }
  function importData() {
    var ta = $('io');
    try {
      var dd = JSON.parse(ta.value), add = clean(dd.logs || dd), have = {}, n = 0;
      state.logs.forEach(function (l) { have[l.t + '|' + l.e] = 1; });
      add.forEach(function (l) { if (!have[l.t + '|' + l.e]) { state.logs.push(l); n++; } });
      var fd = cleanFood(dd.food);
      if (fd) { var fs = foodState(), fh = {}; fs.e.forEach(function (x) { fh[x.t + '|' + x.n] = 1; }); fd.e.forEach(function (x) { if (!fh[x.t + '|' + x.n]) { fs.e.push(x); n++; } }); if (!fs.g && fd.g) fs.g = fd.g; fd.d.forEach(function (x) { if (!fs.d.some(function (y) { return y.id === x.id; })) fs.d.push(x); }); fd.w.forEach(function (x) { if (!fs.w.some(function (y) { return y.t === x.t; })) fs.w.push(x); }); fs.w.sort(function (a, b) { return a.t - b.t; }); if (!fs.pr && fd.pr) fs.pr = fd.pr; fd.m.forEach(function (x) { if (!fs.m.some(function (y) { return y.t === x.t; })) fs.m.push(x); }); fs.m.sort(function (a, b) { return a.t - b.t; }); }
      var pl = cleanPlan(dd.plan); if (pl && pl.days.length && !(state.plan && state.plan.cu)) state.plan = pl;
      ui.io = ''; persist(); render();
      toast(n + ' übernommen', 'check');
    } catch (e) { toast('Daten nicht lesbar', 'close'); }
  }

