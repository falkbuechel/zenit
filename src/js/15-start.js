  // ---------- Slide-Steuerung
  var TABS = ['tage', 'food', 'heute', 'fort', 'profil'];
  var armX = null;
  document.addEventListener('touchstart', function (ev) { armX = ev.target.closest && ev.target.closest('#arm-s') ? ev.touches[0].clientX : null; }, { passive: true });
  document.addEventListener('touchend', function (ev) {
    if (armX == null) return;
    var dx = ev.changedTouches[0].clientX - armX; armX = null;
    if (Math.abs(dx) < 50 || !ui.harr) return;
    var j = ui.harr.indexOf(ui.hcur) + (dx < 0 ? 1 : -1); if (j < 0 || j >= ui.harr.length) return;
    ui.hsel = ui.harr[j]; ui.hdir = dx < 0 ? 1 : -1; ui.fresh = false; render(); buzz(4);
  });
  function goTab(k, dir) { if (k === ui.tab || TABS.indexOf(k) < 0) return; ui.sw = dir || (TABS.indexOf(k) - TABS.indexOf(ui.tab)); ui.fdrawn = false; ui.fw0 = null; ui.fmeal = null; ui.cm = 0; if (ui.undo && ui.undo.charAt(0) === '#') ui.undo = null; ui.tab = k; ui.sel = null; ui.del = null; ui.pe = null; ui.fresh = true; closeSheet(); render(); $('app').scrollTo(0, 0); }
  var sx = 0, sy = 0, st0 = 0, sEl = null, sMode = '', sheetDy = 0, calLock = '';
  document.addEventListener('touchstart', function (e) {
    sMode = ''; if (e.touches.length !== 1) return;
    var t = e.touches[0], tg = e.target; sx = t.clientX; sy = t.clientY; st0 = Date.now(); sEl = tg; sheetDy = 0;
    if (tg.closest('#tabs')) sMode = 'bar';
    else if (tg.closest('#sheet .grab, #sheet .sh-h') && document.documentElement.dataset.sz !== 'e') { sMode = 'sheet'; if (shMorph.busy) { var mh = $('sheet').style.minHeight; shMorphStop(); $('sheet').style.minHeight = mh; } }
    else if (!ui.sheet && tg.closest('.pcal2')) { sMode = 'cal'; calLock = ''; }
    else if (!ui.sheet && tg.closest('.fds')) { sMode = 'fds'; calLock = ''; }
    else if (!ui.sheet && tg.closest('#view') && !tg.closest('input,textarea,select,.wsp,[data-noswipe]')) sMode = 'page';
  }, { passive: true });
  document.addEventListener('touchmove', function (e) {
    var t = e.touches[0];
    if (sMode === 'bar') { var el = document.elementFromPoint(t.clientX, t.clientY), b = el && el.closest ? el.closest('#tabs [data-tab]') : null; if (b && b.dataset.tab !== ui.tab) { goTab(b.dataset.tab); buzz(5); } }
    else if (sMode === 'sheet') { sheetDy = Math.max(0, t.clientY - sy); var sh = $('sheet'); sh.style.transition = 'none'; sh.style.transform = 'translateY(' + sheetDy + 'px)'; }
    else if (sMode === 'cal' || sMode === 'fds') {
      // Richtung nach 8 px festlegen; seitlich: Kalender bzw. Essen-Tagesleiste folgt gedämpft dem Finger, Seite scrollt nicht mit
      var cdx = t.clientX - sx, cdy = t.clientY - sy, cg = document.querySelector(sMode === 'cal' ? '.pc2-g' : '.fds');
      if (!calLock && (Math.abs(cdx) > 8 || Math.abs(cdy) > 8)) calLock = Math.abs(cdx) > Math.abs(cdy) ? 'x' : 'y';
      if (calLock === 'x') { e.preventDefault(); if (cg) { cg.style.transition = 'none'; cg.style.transform = 'translateX(' + cdx * 0.55 + 'px)'; cg.style.opacity = Math.max(0.4, 1 - Math.abs(cdx) / 500); } }
    }
  }, { passive: false });
  document.addEventListener('touchend', function (e) {
    var t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy, m = sMode; sMode = '';
    if (m === 'sheet') { var sh = $('sheet'); sh.style.transition = ''; sh.style.transform = ''; if (sheetDy > 90) closeSheet(); return; }
    if (m === 'cal' || m === 'fds') {
      // Kalender senkrecht: nach unten = eine Stufe mehr (Woche → 3 → 5 Wochen), nach oben = eine weniger. Aufklappen nur, wenn die Seite oben steht (sonst war es ein Scrollen)
      var lv = ui.cm || 0;
      if (m === 'cal' && calLock === 'y' && Math.abs(dy) > 40 && (dy > 0 ? lv < 2 && $('app').scrollTop <= 0 : lv > 0)) { calMon(lv + (dy > 0 ? 1 : -1)); return; }
      // Essen-Tagesleiste: nach unten = zweite Woche auf, nach oben = zu
      if (m === 'fds' && calLock === 'y' && Math.abs(dy) > 40 && (dy > 0 ? !ui.fdx && $('app').scrollTop <= 0 : ui.fdx)) { fdxSet(dy > 0); return; }
      if (calLock !== 'x') return;
      var fast = Math.abs(dx) / Math.max(1, Date.now() - st0) > 0.35, cg = document.querySelector(m === 'cal' ? '.pc2-g' : '.fds');
      if ((Math.abs(dx) > 50 || fast) && (m === 'cal' ? calMove : fdsMove)(dx < 0 ? 1 : -1)) return;
      if (cg) { cg.style.transition = 'transform .25s var(--ease), opacity .25s var(--ease)'; cg.style.transform = ''; cg.style.opacity = ''; }
      return;
    }
    if (m !== 'page') return;
    if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy) * 1.6 || Date.now() - st0 > 700) return;
    var dir = dx < 0 ? 1 : -1;
    var i = TABS.indexOf(ui.tab) + dir; if (i >= 0 && i < TABS.length) goTab(TABS[i], dir);
  }, { passive: true });
  var lastDay = dayIdx(Date.now());
  setInterval(function () {
    var now = Date.now();
    if (dayIdx(now) !== lastDay) { lastDay = dayIdx(now); ui.fresh = true; render(); return; }
    var cd = $('cd'); if (cd) cd.textContent = cdText(msToMidnight(now));
  }, 30000);

  $('rot').innerHTML = ic('rot') + '<b>Hochkant halten</b>';
  $('brand').innerHTML = ic('peak') + '<span>Zenit</span>' + (DEMO ? '<button class="demo-b" data-act="opensettings">Demo</button>' : '');
  if (themeGet()) themeSet(themeGet());
  expSet(EXPV || '0');
  loadLocal();
  sessLoad();
  render();
  // Fenster werden an vielen Stellen neu gefüllt: Namen dort nach jeder Änderung einpassen
  // Die eigenen Änderungen von fitNames (Messelement, Leerzeichen) danach verwerfen, sonst ruft der Beobachter sich selbst auf
  // gebündelt (120 ms), damit Tippen in der Suche nicht bei jedem Zeichen misst
  if (window.MutationObserver) { var fitT, fitMo = new MutationObserver(function () { clearTimeout(fitT); fitT = setTimeout(function () { fitNames($('sheet')); fitMo.takeRecords(); }, 120); }); fitMo.observe($('sheet'), { childList: true, subtree: true }); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fitNames($('view')); });
  sessUi();
  initStore();
