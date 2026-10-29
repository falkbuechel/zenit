  function foodPush(x, editIdx) {
    if (ui.fplan && editIdx == null) {
      // Planen: als geplanter Eintrag (Tag, Mahlzeit) speichern, zurück zur Mahlzeit
      // Geplanten Eintrag ändern (ui.plEdit = Index in food.pl) oder neu einplanen
      var fp = ui.fplan, pe = ui.plEdit, pl = foodState().pl; fUndo(); x.d = fp.d; x.mk = fp.mk; if (pe != null && pl[pe]) pl[pe] = x; else pl.push(x);
      persist(); ui.fresh = false; render(); toast((pe != null ? 'Geändert · ' : 'Geplant · ') + Math.round(x.k) + ' kcal', 'cal', true); openPlanMeal(fp.d, fp.mk); return;
    }
    var st = foodState(), today = dayIdx(Date.now()), before = foodSum(today).p, goal = foodGoal(today).p;
    // Uhrzeit aus dem Fenster (falls vorhanden) auf den Tag des Eintrags setzen
    var old = editIdx != null ? st.e[editIdx] : null, base = old ? old.t : Date.now() - (ui.fday || 0) * 864e5, tm = $('ftm') && $('sheet').classList.contains('open') ? $('ftm').value : '';
    if (/^\d\d:\d\d$/.test(tm)) { var q = new Date(base); q.setHours(+tm.slice(0, 2), +tm.slice(3), 0, 0); base = q.getTime(); }
    // In eine andere Mahlzeit gezogen (ui.fdmk): deren übliche Uhrzeit, wenn sie schon vorbei ist (sonst jetzt, nur als diese Mahlzeit markiert)
    if (ui.fdmk && !tm && ui.fdmk !== mealOf(base)[1]) { var mt = MEALS.filter(function (m) { return m[1] === ui.fdmk; })[0][3], qm = new Date(base); qm.setHours(Math.floor(mt), Math.round(mt % 1 * 60), 0, 0); if (qm.getTime() < Date.now()) base = qm.getTime(); }
    // Mahlzeit aus dem Fenster, sonst aus dem Ablegen eines Vorschlags auf eine Mahlzeit (ui.fdmk)
    x.t = base; var mk = $('fmk') && $('sheet').classList.contains('open') ? $('fmk').value : ui.fdmk || ''; ui.fdmk = null; if (mk && mk !== mealOf(base)[1]) x.mk = mk;
    fUndo(); if (old) st.e[editIdx] = x; else st.e.push(x);
    persist(); closeSheet(true); ui.fresh = false; render();
    var after = foodSum(today).p;
    if (editIdx == null && before < goal && after >= goal) { toast('Proteinziel erreicht', 'trophy', true); sparks(90); buzz([40, 30, 40]); }
    else toast((editIdx != null ? 'Geändert · ' : '+') + Math.round(x.k) + ' kcal · ' + fN(x.p) + ' g Protein' + (ui.fday ? ' · ' + (ui.fday === 1 ? 'gestern' : fmtDayL(dayIdx(Date.now()) - ui.fday)) : ''), 'check', true);
    ui.fday = 0;
  }
  function foodRef(id, a, editIdx) {
    var it = fItem(id); if (!it || !(a > 0)) return;
    var v = fNut(it, a), x = { n: fEn(it).slice(0, 30) };
    NK.forEach(function (k) { if (v[k] != null) x[k] = k === 'k' ? Math.round(v.k) : Math.round(v[k] * 10) / 10; });
    x.r = { i: id, g: Math.round(a * 100) / 100 }; foodPush(x, editIdx);
  }
  function openPlanMeal(d, mk) {
    // Mahlzeit planen (aus Planen): Geplantes mit Entfernen, darunter Gerichte dieser Mahlzeit und häufige Lebensmittel (antippen = einplanen), Suchen und Schnell im Plan-Modus
    var m = MEALS.filter(function (x) { return x[1] === mk; })[0], st = foodState(), ps = planSum(d).items.filter(function (o) { return o.x.mk === mk; }), seen = {};
    var tl = st.d.slice().sort(function (a, b) { return (dishMeals(b).indexOf(mk) >= 0) - (dishMeals(a).indexOf(mk) >= 0); }).slice(0, 4).map(function (x) { return { i: x.id, g: 1 }; }).concat(fTiles())
      .filter(function (x) { if (seen[x.i] || !fItem(x.i)) return false; seen[x.i] = 1; return true; }).slice(0, 8);
    ui.fplan = { d: d, mk: mk }; ui.fday = dayIdx(Date.now()) - d; ui.sheet = { plmeal: true }; ui.plEdit = null;
    sheetOpen(shHead(MEALI[mk], m[2] + ' planen', dayHead(d) + (ps.length ? ' · ' + Math.round(ps.reduce(function (a, o) { return a + o.x.k; }, 0)) + ' kcal' : '')) +
      (ps.length ? '<div class="fpl">' + ps.map(function (o) {
        var it = o.x.r && fItem(o.x.r.i);
        // Antippen = Menge ändern (nur mit Quelle), Kreuz = entfernen
        return '<div class="fplr m-' + mk + '"><span' + (it ? ' data-ple="' + o.i + '" role="button"' : '') + '><b>' + esc(o.x.n || 'Mahlzeit') + '</b><small>' + (it ? fAmt(it, o.x.r.g) : 'Schnell') + '</small></span><em>' + Math.round(o.x.k) + '<i>kcal</i></em><button class="x" data-plx="' + o.i + '" aria-label="Entfernen">' + ic('close') + '</button></div>';
      }).join('') + (ps.some(function (o) { return o.x.r; }) ? '<button class="btn ghost small fptp" data-ptpm="1">' + ic('cards') + 'Als Vorlage</button>' : '') + '</div>' : '') +
      '<div class="ftl fplt">' + tl.map(function (x) { return fTile({ i: x.i, g: x.g }, 'data-pla="' + x.i + '|' + x.g + '"'); }).join('') + '</div>' +
      '<div class="fact2"><div class="fsrb"><button class="fsrq" data-plsr="1">' + ic('search') + '<span>Suchen …</span></button></div><button class="fdsb" data-plq="1" aria-label="Schnell">' + ic('bolt') + '</button></div>', true);
  }
  // Einkaufsliste aus dem Geplanten (food.pl) ab heute für n Tage: Gerichte in Zutaten zerlegt, gleiche Lebensmittel zusammengezählt,
  // Menge aufgerundet auf Packung/Stück (Portionen der Liste), sonst auf 50 g/ml; nach Kategorie, abgehakt (food.sh) grau unten
  function shopList(n) {
    var st = foodState(), t = dayIdx(Date.now()), m = {}, l = [];
    function put(id, nm, g) {
      var it = id && fItem(id), key = it ? id : ('n:' + fnorm(nm)).slice(0, 40); if (!(g > 0)) return;
      if (!m[key]) { m[key] = { key: key, it: it, n: it ? fEn(it) : nm, g: 0, c: it && !it.dish ? (/^u/.test(id) ? 'u' : CATI[it.cat] ? it.cat : 'x') : 'x' }; l.push(m[key]); }
      m[key].g += g;
    }
    st.pl.forEach(function (x) {
      if (x.d < t || x.d >= t + n || !x.r) return;
      var dd = /^d/.test(x.r.i) && fDish(x.r.i);
      if (/^d/.test(x.r.i) && !dd) return;
      if (dd) dd.ing.forEach(function (q) { put(q.i, q.n || 'Zutat', (+q.a || 0) * x.r.g / Math.max(1, +dd.por || 1)); });
      else put(x.r.i, x.n, x.r.g);
    });
    l.forEach(function (o) {
      // Packung: größte Portion der Liste (Becher, Dose …), außer Stück/Scheibe → Stück zählen; sonst Gramm
      var u = o.it && o.it.u || [], pk = u.filter(function (q) { return /Becher|Dose|Packung|Flasche|Glas|Beutel|Tafel|Netz|Bund|Kopf/.test(q[0]); }).sort(function (a, b) { return b[1] - a[1]; })[0], pc = u.filter(function (q) { return /Stück/.test(q[0]); })[0];
      var q = pk || pc; o.a = q ? Math.max(1, Math.ceil(o.g / q[1] - 0.05)) +(pk ? ' × ' + q[0] + ' (' + q[1] + (o.it.ml ? ' ml' : ' g') + ')' : ' ' + q[0]) :Math.ceil(o.g / 50) * 50 + (o.it && o.it.ml ? ' ml' : ' g');
      o.ok = st.sh[o.key] != null;
    });
    return l;
  }
  function shopHtml() {
    var n = ui.shn || 7, l = shopList(n), co = Object.keys(CATI), h = '';
    var open = l.filter(function (o) { return !o.ok; }), done = l.filter(function (o) { return o.ok; });
    function row(o) { return '<button class="shr' + (o.ok ? ' ok' : '') + '" data-shk="' + esc(o.key) + '" aria-pressed="' + o.ok + '"><i>' + (o.ok ? ic('check') : '') + '</i><b>' + esc(o.n) + '</b><small>' + esc(o.a) + '</small></button>'; }
    co.forEach(function (c) {
      var g = open.filter(function (o) { return o.c === c; }); if (!g.length) return;
      h += '<h3 class="shh">' + ic(CATI[c][0]) + esc(CATI[c][1]) + '</h3>' + g.map(row).join('');
    });
    if (done.length) h += '<h3 class="shh">' + ic('check') + 'Im Wagen</h3>' + done.map(row).join('');
    return shHead('cart', 'Einkauf', open.length + ' offen · ' + (n === 3 ? 'nächste 3 Tage' : 'nächste 7 Tage')) +
      '<div class="seg"><button data-shn="3" aria-pressed="' + (n === 3) + '">3 Tage</button><button data-shn="7" aria-pressed="' + (n === 7) + '">7 Tage</button></div>' +
      '<div class="shl">' + (h || '<p class="muted">Nichts geplant. In Planen › Essen Mahlzeiten einplanen.</p>') + '</div>';
  }
  function openShop() { ui.sheet = { shop: true }; sheetOpen(shopHtml(), true); }
  function planEat(mk) {
    // Heute Geplantes einer Mahlzeit als gegessen eintragen: jetzt, oder zur üblichen Uhrzeit, wenn die Mahlzeit schon vorbei ist
    var st = foodState(), today = dayIdx(Date.now()), l = st.pl.filter(function (x) { return x.d === today && x.mk === mk; }); if (!l.length) return;
    var base = Date.now(), cur = mealOf(base)[1];
    if (mk !== cur) { var mt = MEALS.filter(function (m) { return m[1] === mk; })[0][3], q = new Date(base); q.setHours(Math.floor(mt), Math.round(mt % 1 * 60), 0, 0); if (q.getTime() < base) base = q.getTime(); }
    fUndo();
    l.forEach(function (o, j) { var x = JSON.parse(JSON.stringify(o)); delete x.d; delete x.mk; x.t = base + j; if (mk !== mealOf(x.t)[1]) x.mk = mk; st.e.push(x); });
    st.pl = st.pl.filter(function (x) { return !(x.d === today && x.mk === mk); });
    persist(); ui.fresh = false; render(); toast('Gegessen · ' + Math.round(l.reduce(function (a, o) { return a + o.k; }, 0)) + ' kcal', 'check', true); buzz([10, 30, 10]);
  }
  function fSheetBack() {
    // Kreuz in Essen-Fenstern geht eine Ebene zurück (wie der Zurück-Pfeil), erst auf der obersten Ebene schließt es
    if (!ui.sheet) return false;
    var fb = document.querySelector('#sheet [data-fback]'); if (fb) return foodClick(fb);
    if (ui.sheet.fsearch && ui.fcat && !ui.fq) { ui.fcat = ''; $('fres').innerHTML = fresHtml(); return true; }
    if (ui.sheet.dishEdit) { openDishes(); return true; }
    if (ui.fplan && !ui.sheet.plmeal) { openPlanMeal(ui.fplan.d, ui.fplan.mk); return true; }
    return false;
  }
  function foodClick(t) {
    var el, st = foodState();
    if ((el = t.closest('[data-ddm]'))) {
      readDraft(); var dm = ui.dd.m || [], on = dm.indexOf(el.dataset.ddm) < 0;
      ui.dd.m = MEALS.map(function (m) { return m[1]; }).filter(function (k) { return k === el.dataset.ddm ? on : dm.indexOf(k) >= 0; }); el.setAttribute('aria-pressed', String(on)); buzz(4); return true;
    }
    if ((el = t.closest('[data-pml]'))) { var pd0 = ui.pd == null ? dayIdx(Date.now()) : ui.pd; openPlanMeal(pd0, el.dataset.pml); return true; }
    if ((el = t.closest('[data-pla]'))) { var pa = el.dataset.pla.split('|'); buzz(8); foodRef(pa[0], +pa[1]); return true; }
    if ((el = t.closest('[data-plx]'))) { fUndo(); foodState().pl.splice(+el.dataset.plx, 1); persist(); ui.fresh = false; render(); openPlanMeal(ui.fplan.d, ui.fplan.mk); buzz(6); return true; }
    if (t.closest('[data-pshop]')) { openShop(); return true; }
    if ((el = t.closest('[data-shn]'))) { ui.shn = +el.dataset.shn; $('sheet').innerHTML = shopHtml(); buzz(4); return true; }
    if ((el = t.closest('[data-shk]'))) { var shk = el.dataset.shk; if (st.sh[shk] != null) delete st.sh[shk]; else st.sh[shk] = dayIdx(Date.now()); persist(); $('sheet').innerHTML = shopHtml(); buzz(6); return true; }
    if (t.closest('[data-fingo]')) { ui.fingo = !ui.fingo; $('sheet').innerHTML = fpickHtml(); buzz(4); return true; }
    // Nach dem Speichern verschwindet der Knopf (kein zweites, gleiches Speichern)
    if ((el = t.closest('[data-ptpm]'))) { if (tplSave('m', ui.fplan.d, ui.fplan.mk)) el.remove(); return true; }
    if ((el = t.closest('[data-ple]'))) { var po = foodState().pl[+el.dataset.ple]; if (po && po.r && fItem(po.r.i)) { var pfp = ui.fplan; openPick(po.r.i, po.r.g); ui.fplan = pfp; ui.plEdit = +el.dataset.ple; $('sheet').innerHTML = fpickHtml(); } return true; }
    if (t.closest('[data-plsr]')) { openFsearch(); return true; }
    if (t.closest('[data-plq]')) { openQuick(null); return true; }
    if ((el = t.closest('[data-fpe]'))) { if (fswMoved) { fswMoved = false; return true; } planEat(el.dataset.fpe); return true; }
    if ((el = t.closest('[data-pgo]'))) { ui.pd = +el.dataset.pgo; ui.ca = ui.pd; ui.pft = 'e'; goTab('tage'); return true; }
    if ((el = t.closest('[data-fqm]'))) { ui.fqm = !ui.fqm; el.setAttribute('aria-pressed', String(ui.fqm)); buzz(4); return true; }
    if (t.closest('[data-fdsw]') && fdswMoved) { fdswMoved = false; return true; }
    if ((el = t.closest('[data-fdel]'))) { foodDel(+el.dataset.fdel); return true; }
    if ((el = t.closest('[data-fmk]'))) { fmkSet(el.dataset.fmk); $('fmk').dataset.man = '1'; buzz(4); return true; }
    if ((el = t.closest('[data-fml], [data-fstk]')) && fswMoved) { fswMoved = false; return true; }
    // Auf-/Zuklappen (Mahlzeit, Gruppe): ui.fmx lässt die Zeile beim nächsten Zeichnen weich einblenden (.chg)
    if ((el = t.closest('[data-fml]'))) { ui.fmeal = el.dataset.fml ? fSd() + el.dataset.fml : null; ui.fstk = {}; ui.fmx = 1; ui.fresh = false; render(); ui.fmx = 0; buzz(4); return true; }
    if ((el = t.closest('[data-fstk]'))) { var sk = el.dataset.fstk, son = !ui.fstk[sk]; ui.fstk = {}; if (son) ui.fstk[sk] = 1; ui.fmx = 1; ui.fresh = false; render(); ui.fmx = 0; buzz(4);
      // Geöffnete Gruppe an den linken Rand der Zeile holen (die Zeile ist neu gezeichnet und stünde sonst wieder am Anfang)
      var gp = document.querySelector('.fgrp'), gsc = gp && gp.parentNode;
      if (gsc) gsc.scrollTo({ left: gp.getBoundingClientRect().left - gsc.getBoundingClientRect().left - 20, behavior: 'smooth' });
      return true;
    }
    if ((el = t.closest('[data-fedit]'))) { if (fswMoved) { fswMoved = false; return true; } var x = st.e[+el.dataset.fedit]; if (x && x.r && fItem(x.r.i)) openPick(x.r.i, x.r.g, +el.dataset.fedit); else openQuick(+el.dataset.fedit); return true; }
    if ((el = t.closest('[data-ftile]'))) { if (fswMoved) { fswMoved = false; return true; } var tl = (ui.ftiles || [])[+el.dataset.ftile]; if (tl) { ui.fday = dayIdx(Date.now()) - fSd(); buzz(8); openPick(tl.i, tl.g); } return true; }
    if (t.closest('[data-fsearch]')) { openFsearch(); return true; }
    if (t.closest('[data-fdishes]')) { openDishes(); return true; }
    if ((el = t.closest('[data-fpick]'))) { if (ui.fdgno && Date.now() - ui.fdgno < 400) return true; var from =ui.sheet && (ui.sheet.fsearch || ui.sheet.fdishes) ? (ui.sheet.fsearch ? 's' : 'd') : null; openPick(el.dataset.fpick); ui.sheet.from = from; $('sheet').innerHTML = fpickHtml(); return true; }
    if (t.closest('[data-fback]')) { if (ui.sheet && ui.sheet.fsearch && ui.ingm) ingBack(); else if (ui.sheet && ui.sheet.from === 'o') openOwn(ui.odraft.id, null, ui.odraft); else if (ui.sheet && ui.sheet.from === 'd') openDishes(); else { var q0 = ui.fq; openFsearch(true); ui.fq = q0 || ''; $('fq').value = ui.fq; $('fres').innerHTML = fresHtml(); } return true; }
    if ((el = t.closest('[data-fvar]'))) { ui.fpick.i = el.dataset.fvar; $('sheet').innerHTML = fpickHtml(); return true; }
    if ((el = t.closest('[data-foff]'))) { var ox = ui.fon && ui.fon.r[+el.dataset.foff]; if (ox) pickFrom(offSave(ox)); return true; }
    if ((el = t.closest('[data-fscan]'))) { if (el.dataset.fscan === 'own') { ui.odraft = ownDraft(); ui.odraft.id = ui.sheet.fown; openScan('own'); } else { if (el.dataset.fscan === 'go') openFsearch(); openScan(); } return true; }
    if ((el = t.closest('[data-oml]'))) { ui.sheet.ml = +el.dataset.oml; document.querySelectorAll('[data-oml]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === el)); }); return true; }
    if ((el = t.closest('[data-fsd]'))) { ui.fsd = +el.dataset.fsd; ui.fresh = false; render(); return true; }
    if ((el = t.closest('[data-fwa], [data-fwaz]'))) {
      var rc = el.getBoundingClientRect(), wq = +el.dataset.fwa || 0; waSet(el.dataset.fwaz ? 0 : (st.wa[fSd()] || 0) + wq); buzz(6);
      if (ui.sheet && ui.sheet.wa) $('sheet').innerHTML = waHtml(); if (wq > 50) floaty('+' + wq + ' ml', rc);
      return true;
    }
    if (t.closest('[data-fgoal]')) { openGoals(); return true; }
    if ((el = t.closest('[data-fnut]'))) { openNut(el.dataset.fnut); return true; }
    if ((el = t.closest('[data-fnx]'))) { el.setAttribute('aria-expanded', String(el.getAttribute('aria-expanded') !== 'true')); buzz(4); return true; }
    if (t.closest('[data-fwao]')) { ui.sheet = { wa: true }; sheetOpen(waHtml()); return true; }
    if (t.closest('[data-dgs]')) { readDraft(); ui.ingm = true; openFsearch(); return true; }
    if (t.closest('[data-fownb]')) { var bt0 = fItem(ui.fpick.i), dr0 = { n: fName(bt0), un: bt0.u[0] ? bt0.u[0][0] : '', ug: bt0.u[0] ? bt0.u[0][1] : '', ml: bt0.ml ? 1 : 0 }; NK.forEach(function (k) { dr0[k] = bt0[k] != null ? bt0[k] : ''; }); openOwn('new', null, dr0); return true; }
    if (t.closest('[data-fbr]')) {
      if (ui.fbr && ui.fbr.i === ui.fpick.i) { ui.fbr = null; $('fbr').innerHTML = ''; document.querySelector('[data-fbr]').classList.remove('on'); return true; }
      fbrLoad(); return true;
    }
    if (t.closest('[data-fbrr]')) { fbrLoad(); return true; }
    if (t.closest('[data-fonr]')) { ui.fon = null; fonSearch(); return true; }
    if ((el = t.closest('[data-fbrp]'))) { var bx = ui.fbr && ui.fbr.r[+el.dataset.fbrp]; if (bx) pickFrom(offSave(bx)); return true; }
    if ((el = t.closest('[data-fcat]'))) { ui.fcat = el.dataset.fcat; $('fres').innerHTML = fresHtml(); $('sheet').scrollTop = 0; return true; }
    if ((el = t.closest('[data-ftab]'))) { ui.ftab = el.dataset.ftab; ui.fcat = ''; $('fres').innerHTML = fresHtml(); buzz(4); return true; }
    if ((el = t.closest('[data-famt]'))) { ui.fpick.a = +el.dataset.famt; if ($('fa')) $('fa').value = ui.fpick.a; fpickUpd(); return true; }
    if ((el = t.closest('[data-fstep]'))) { var it0 = fItem(ui.fpick.i), stp = it0.dish ? 0.25 : it0.pc ? it0.u[0][1] : 10; ui.fpick.a = Math.max(stp, Math.round((ui.fpick.a + stp * (+el.dataset.fstep)) * 100) / 100); if ($('fa')) $('fa').value = ui.fpick.a; fpickUpd(); buzz(4); return true; }
    if (t.closest('[data-fpadd]')) { var pk = ui.fpick; if (ui.ingm) ingAdd(pk.i, pk.a); else foodRef(pk.i, pk.a, pk.edit); return true; }
    if ((el = t.closest('[data-fown]'))) { openOwn(el.dataset.fown); return true; }
    if (t.closest('[data-fownsave]')) {
      var ov = function (k) { var f = parseFloat($('o-' + k).value); return isFinite(f) && f >= 0 ? Math.round(f * 10) / 10 : 0; };
      var nm = $('o-n').value.trim(); if (!nm) { toast('Name fehlt', 'bolt'); return true; }
      if (!ov('k')) { toast('kcal je 100 g eintragen', 'bolt'); return true; }
      var oid = ui.sheet.fown !== 'new' ? ui.sheet.fown : 'u' + Date.now().toString(36), o = { id: oid, n: nm.slice(0, 30), u: [] };
      NK.forEach(function (k) { o[k] = ov(k); }); var un = $('o-un').value.trim(), ug = ov('ug'); if (un && ug) o.u.push([un.slice(0, 12), ug]);
      var o0 = fOwn(oid); if (o0) { if (o0.b) o.b = o0.b; if (o0.bc) o.bc = o0.bc; o.u = o.u.concat(o0.u.slice(1)); } if (ui.sheet.bc) o.bc = ui.sheet.bc; if (ui.sheet.ml) o.ml = 1; else delete o.ml;
      var bv = $('o-b').value.trim(), bcv = $('o-bc').value.replace(/\D/g, ''); if (bv) o.b = bv.slice(0, 24); else delete o.b; if (/^\d{6,14}$/.test(bcv)) o.bc = bcv; else delete o.bc;
      if (o.bc) st.o.forEach(function (y) { if (y.id !== oid && y.bc === o.bc) delete y.bc; });
      var oi = st.o.map(function (y) { return y.id; }).indexOf(oid); if (oi >= 0) st.o[oi] = o; else st.o.push(o);
      persist(); ui.fresh = false; render(); toast('Gespeichert', 'check'); openPick(oid); return true;
    }
    if (t.closest('[data-fowndel]')) { st.o = st.o.filter(function (y) { return y.id !== ui.sheet.fown; }); persist(); closeSheet(true); ui.fresh = false; render(); toast('Lebensmittel gelöscht', 'close'); return true; }
    if (t.closest('[data-wgt]')) { openWeight(); return true; }
    if (t.closest('[data-set]')) { openSettings(); return true; }
    if (t.closest('[data-wsave]')) {
      var kg = Math.round(parseFloat($('w-v').value) * 10) / 10;
      if (!(kg >= 20 && kg <= 400)) { toast('Gewicht eintragen', 'bolt'); return true; }
      var lw = lastW(), nw = Date.now(); if (lw && daysSince(lw.t) === 0) { lw.kg = kg; lw.t = nw; } else st.w.push({ t: nw, kg: kg });
      persist(); closeSheet(true); ui.fresh = false; render(); toast(fN(kg) + ' kg', 'check'); return true;
    }
    if ((el = t.closest('[data-wdel]'))) { st.w = st.w.filter(function (y) { return y.t !== +el.dataset.wdel; }); persist(); openWeight(); ui.fresh = false; render(); return true; }
    if (t.closest('[data-fcopy]')) {
      // Uhrzeit und Mahlzeit von gestern behalten (Datum um einen Tag weiter, auch über die Zeitumstellung); nie in der Zukunft, die Mahlzeit bleibt über mk
      var ys = foodSum(fSd() - 1).items, now1 = Date.now();
      fUndo(); ys.forEach(function (o, j) { var c = JSON.parse(JSON.stringify(o.x)), q = new Date(o.x.t); c.mk = mealOfE(o.x)[1]; q.setDate(q.getDate() + 1); c.t = Math.min(q.getTime(), now1 - ys.length + j); st.e.push(c); });
      persist(); ui.fresh = false; render(); toast(ys.length + ' Einträge wie gestern', 'check', true); return true;
    }
    if ((el = t.closest('[data-fday]'))) { ui.fday = +el.dataset.fday; el.outerHTML = dayTog(); if ($('ftot')) fpickUpd(); buzz(4); return true; }
    if ((el = t.closest('[data-gmode]'))) { calcRead(); ui.gmode = el.dataset.gmode; $('sheet').innerHTML = goalsHtml(); calcUpd(); return true; }
    if ((el = t.closest('[data-csx]'))) { ui.cpr.s = el.dataset.csx; document.querySelectorAll('[data-csx]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === el)); }); calcUpd(); return true; }
    if ((el = t.closest('[data-crt]'))) { ui.cpr.rt = +el.dataset.crt; document.querySelectorAll('[data-crt]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === el)); }); calcUpd(); return true; }
    if ((el = t.closest('[data-ctb]'))) { ui.cpr.tb = ui.cpr.tb ? 0 : 1; el.setAttribute('aria-pressed', String(!!ui.cpr.tb)); calcUpd(); return true; }
    if ((el = t.closest('[data-cadj]'))) { ui.cpr.adj = +el.dataset.cadj; calcUpd(); toast((ui.cpr.adj ? 'Angepasst' : 'Entfernt') + ', mit „Übernehmen“ speichern', 'check'); return true; }
    if (t.closest('[data-cuse]')) { goalsSave(); return true; }
    if ((el = t.closest('[data-fde]'))) { openDishEdit(el.dataset.fde); return true; }
    if (t.closest('[data-dga]')) { readDraft(); ui.dd.ing.push({ n: '', a: '', k: '', p: '' }); $('sheet').innerHTML = dishEditHtml(); var ni = $('di-n-' + (ui.dd.ing.length - 1)); if (ni && !('ontouchstart' in window)) ni.focus(); return true; }
    if ((el = t.closest('[data-dgx]'))) { readDraft(); ui.dd.ing.splice(+el.dataset.dgx, 1); if (!ui.dd.ing.length) ui.dd.ing.push({ n: '', a: '', k: '', p: '' }); $('sheet').innerHTML = dishEditHtml(); return true; }
    if (t.closest('[data-dsave]')) { saveDish(); return true; }
    if ((el = t.closest('[data-dmf]'))) { ui.dmf = el.dataset.dmf; $('sheet').innerHTML = dishesHtml(); buzz(4); return true; }
    if (t.closest('[data-ddup]')) { readDraft(); ui.dd = JSON.parse(JSON.stringify(ui.dd)); ui.dd.id = null; ui.dd.n = (ui.dd.n + ' (Kopie)').slice(0, 30); ui.ddel = 0; $('sheet').innerHTML = dishEditHtml(); toast('Kopie – anpassen und speichern', 'cards'); return true; }
    if ((el = t.closest('[data-dpor]'))) { readDraft(); ui.dd.por = Math.max(1, ui.dd.por + +el.dataset.dpor); $('dd-por').value = ui.dd.por; $('dd-tot').innerHTML = dishTotHtml(dishTot(ui.dd)); buzz(4); return true; }
    if ((el = t.closest('[data-ddel]'))) {
      if (!ui.ddel) { ui.ddel = 1; el.innerHTML = '<small>Sicher?</small>'; el.setAttribute('aria-label', 'Wirklich löschen?'); return true; }
      st.d = st.d.filter(function (y) { return y.id !== ui.dd.id; }); persist(); ui.fresh = false; render(); toast('Gericht gelöscht', 'close'); openDishes(); return true;
    }
    if (t.closest('[data-fsave]')) {
      var qv = function (k) { var f = parseFloat($('f-' + k).value); return isFinite(f) && f >= 0 ? f : null; };
      var xq = { n: $('f-n').value.trim().slice(0, 30), k: Math.round(qv('k') || 0), p: Math.round((qv('p') || 0) * 10) / 10 };
      ['f', 'c', 'fb', 'su'].forEach(function (k) { var v = qv(k); if (v != null) xq[k] = Math.round(v * 10) / 10; });
      if (xq.k > 20000 || xq.p > 1000 || (!xq.k && !xq.p)) { toast('Wert eintragen', 'bolt'); return true; }
      var qi = ui.sheet && ui.sheet.idx != null ? ui.sheet.idx : null;
      if (ui.fqm && qi == null) {
        // Merken: eigenes Lebensmittel, dessen Portion (100 g) genau die eingetragenen Werte hat; erscheint danach in Eigene und den Vorschlägen
        if (!xq.n) { toast('Name zum Merken eintragen', 'bolt'); return true; }
        // Der Eintrag behält seine Werte (nicht eingetragene bleiben unbekannt) und verweist auf das neue Lebensmittel
        var qo = { id: 'u' + Date.now().toString(36), n: xq.n, u: [['Portion', 100]] }; NK.forEach(function (k) { qo[k] = xq[k] || 0; }); st.o.push(qo); ui.fqm = false;
        xq.r = { i: qo.id, g: 100 }; foodPush(xq, null); return true;
      }
      foodPush(xq, qi); return true;
    }
    if (t.closest('[data-fgsave]')) {
      var gg = {}; NK.forEach(function (k) { var f = Math.round(parseFloat($('g-' + k).value) || 0); if (f > 0) gg[k] = f; });
      if (!gg.k || !gg.p) { toast('kcal und Protein eintragen', 'bolt'); return true; }
      st.g = gg; persist(); closeSheet(true); ui.fresh = false; render(); toast('Ziele gespeichert', 'check'); return true;
    }
    return false;
  }
