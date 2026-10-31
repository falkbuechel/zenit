  // Online (Open Food Facts, frei, ohne Schlüssel): Suche ab 3 Zeichen kurz nach dem Tippen, Barcode über die Kamera.
  // Gewählte Produkte werden eigene Lebensmittel (mit Marke b und Barcode bc) und sind danach offline da.
  var OFF = 'https://de.openfoodfacts.org/', OFF_F = 'code,product_name,product_name_de,brands,quantity,product_quantity,serving_quantity,nutriments', fonT = null;
  function offMap(p) {
    var nu = p && p.nutriments || {}, k = nu['energy-kcal_100g'];
    if (k == null && nu.energy_100g != null) k = nu.energy_100g / 4.184;
    var n = String(p && (p.product_name_de || p.product_name) || '').trim();
    if (!n || !(+k >= 0) || !p.code) return null;
    function v(key) { var x = nu[key + '_100g']; return x == null || !isFinite(+x) ? null : Math.round(+x * 10) / 10; }
    var u = [], sq = +p.serving_quantity, pq = +p.product_quantity;
    if (sq > 0 && sq <= 2000) u.push(['Portion', Math.round(sq)]);
    if (pq > 0 && pq <= 3000 && Math.round(pq) !== Math.round(sq)) u.push(['Packung', Math.round(pq)]);
    return { bc: String(p.code), n: n.slice(0, 30), b: String(p.brands || '').split(',')[0].trim().slice(0, 24), qt: String(p.quantity || '').slice(0, 16), k: Math.round(+k), p: v('proteins'), f: v('fat'), c: v('carbohydrates'), fb: v('fiber'), su: v('sugars'), u: u, ml: /\d\s*(ml|cl|l)\b/i.test(String(p.quantity || '')) ? 1 : 0 };
  }
  function offSave(x) {
    var st = foodState(), ex = st.o.filter(function (o) { return o.bc === x.bc; })[0]; if (ex) return ex.id;
    var o = { id: 'u' + Date.now().toString(36), n: x.n, b: x.b, bc: x.bc, u: x.u.slice(0, 4) }; if (x.ml) o.ml = 1;
    NK.forEach(function (k) { o[k] = x[k] || 0; }); st.o.push(o); persist(); return o.id;
  }
  function fonHtml() {
    var o = ui.fon, q = ui.fq.trim(), w = '<p class="muted fon">' + ic('globe');
    if (q.length < 3) return '';
    if (!navigator.onLine && !(o && o.q === q && o.st === 'ok')) return w + 'Offline</p>';
    if (!o || o.q !== q || o.st === 'load') return w + 'Suche online …</p>';
    if (o.st === 'err') return w + 'Open Food Facts antwortet nicht<button class="btn small fre" data-fonr="1">' + ic('undo') + 'Nochmal</button></p>';
    if (!o.r.length) return w + 'Auch online nicht gefunden. Barcode scannen (oben) oder unten selbst anlegen.</p>';
    return '<h3 class="xg">' + ic('globe') + 'Online</h3>' + o.r.map(function (x, i) {
      return '<button class="fsi web" data-foff="' + i + '"><span><b>' + esc(x.n) + '</b><small>' + esc([x.b, x.qt].filter(Boolean).join(' · ')) + '</small></span><em>' + x.k + '</em></button>';
    }).join('');
  }
  function fonUpd() { var e = $('fon'); if (e) e.innerHTML = fonHtml(); }
  // Treffer je Suchwort zwischengespeichert (zuletzt 30 Suchen, 7 Tage): Wiederholen kommt sofort, auch offline
  var OFFC = {};
  try { OFFC = JSON.parse(localStorage.getItem('zenit.offc') || '{}') || {}; } catch (err) { OFFC = {}; }
  function offCache(q, r) {
    var k = fnorm(q);
    if (r === undefined) { var c = OFFC[k]; return c && Date.now() - c.t < 7 * 864e5 ? c.r : null; }
    OFFC[k] = { t: Date.now(), r: r };
    var ks = Object.keys(OFFC).sort(function (a, b) { return OFFC[b].t - OFFC[a].t; }); ks.slice(30).forEach(function (x) { delete OFFC[x]; });
    try { localStorage.setItem('zenit.offc', JSON.stringify(OFFC)); } catch (err) { /* voll: nur im Speicher */ }
  }
  function offSearch(q, done) {
    // Die Suche von Open Food Facts antwortet oft langsam oder mit 503 (ohne CORS = „Failed to fetch“): de und world gleichzeitig, je 8 s Zeitlimit, 12 Treffer (kleinere Antwort).
    // de mit Treffern gewinnt sofort, sonst world; beide fehlgeschlagen = null (search.openfoodfacts.org wäre schneller, erlaubt aber kein CORS).
    // Gibt eine Abbruch-Funktion zurück (weitergetippt: alte Anfragen nicht weiterladen)
    var hit = offCache(q); if (hit) { done(hit); return function () {}; }
    var res = {}, n = 0, fin = false, acs = [];
    function end(k, r) {
      res[k] = r; n++; if (fin) return;
      if (k === 'de' && r && r.length) { fin = true; offCache(q, r); done(r); return; }
      if (n === 2) { fin = true; var b = res.de && res.de.length ? res.de : res.w && res.w.length ? res.w : res.de || res.w || null; if (b && b.length) offCache(q, b); done(b); }
    }
    [['de', OFF], ['w', 'https://world.openfoodfacts.org/']].forEach(function (b) {
      var ac = window.AbortController ? new AbortController() : null, tm = setTimeout(function () { if (ac) ac.abort(); }, 8000); if (ac) acs.push(ac);
      fetch(b[1] + 'cgi/search.pl?search_terms=' + encodeURIComponent(q) + '&search_simple=1&json=1&page_size=12&sort_by=unique_scans_n&fields=' + OFF_F, ac ? { signal: ac.signal } : {})
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (d) { clearTimeout(tm); end(b[0], (d.products || []).map(offMap).filter(Boolean)); }, function () { clearTimeout(tm); end(b[0], null); });
    });
    return function () { fin = true; acs.forEach(function (a) { a.abort(); }); };
  }
  var fonAb = null;
  function fonSearch() {
    var q = ui.fq.trim(); if (q.length < 3 || (ui.fon && ui.fon.q === q && ui.fon.st !== 'err')) return;
    if (!navigator.onLine && !offCache(q)) return;
    if (fonAb) fonAb();
    ui.fon = { q: q, st: 'load', r: [] }; fonUpd();
    fonAb = offSearch(q, function (r) {
      if (!ui.fon || ui.fon.q !== q) return;
      if (!r) { ui.fon.st = 'err'; fonUpd(); return; }
      var have = {}; foodState().o.forEach(function (x) { if (x.bc) have[x.bc] = 1; });
      ui.fon.r = r.filter(function (x) { return !have[x.bc]; }).slice(0, 12); ui.fon.st = 'ok'; fonUpd();
    });
  }
  // Barcode: eingebauter BarcodeDetector, sonst (iOS) zxing über jsDelivr, erst beim ersten Scan geladen und danach vom Service Worker gecacht
  var scan = null, BCLIB = 'https://cdn.jsdelivr.net/npm/barcode-detector@3.2.2/dist/iife/ponyfill.js';
  function bcDet() {
    var F = { formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] };
    if (window.BarcodeDetector) return Promise.resolve(new window.BarcodeDetector(F));
    if (window.BarcodeDetectionAPI) return Promise.resolve(new window.BarcodeDetectionAPI.BarcodeDetector(F));
    return new Promise(function (ok, no) { var sc = document.createElement('script'); sc.src = BCLIB; sc.onload = function () { if (window.BarcodeDetectionAPI) ok(new window.BarcodeDetectionAPI.BarcodeDetector(F)); else no(); }; sc.onerror = no; document.head.appendChild(sc); });
  }
  function scanEnd(me) { me.on = false; if (me.s) me.s.getTracks().forEach(function (tr) { tr.stop(); }); if (scan === me) { scan = null; document.body.classList.remove('scan'); } }
  function scanStop() { if (scan) scanEnd(scan); }
  function openScan(mode) {
    scanStop(); ui.sheet = { fscan: true, from: mode === 'own' ? 'o' : 's', mode: mode };
    sheetOpen(shHead('scan', 'Barcode', 'In den Rahmen halten, egal wie herum', true) + '<div class="fscan"><video id="fsv" playsinline muted autoplay></video><i></i></div><p class="muted fon" id="fsm">…</p>', true);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { $('fsm').textContent = 'Keine Kamera'; return; }
    var me = scan = { on: true, s: null }; document.body.classList.add('scan');
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false }).then(function (str) {
      me.s = str; if (!me.on || !$('fsv')) { scanEnd(me); return; }
      $('fsv').srcObject = str; $('fsm').textContent = '';
      bcDet().then(function (det) {
        (function tick() {
          var v = $('fsv'); if (!me.on || !v) { scanEnd(me); return; }
          (v.readyState >= 2 ? det.detect(v) : Promise.resolve([])).then(function (c) { if (!me.on) return; if (c && c[0]) { scanEnd(me); scanHit(String(c[0].rawValue)); } else setTimeout(tick, 200); }, function () { setTimeout(tick, 400); });
        })();
      }, function () { var m = $('fsm'); if (m) m.textContent = 'Scanner nicht geladen (offline?)'; });
    }).catch(function () { var m = $('fsm'); if (m) m.textContent = 'Kamera nicht erlaubt'; });
  }
  function pickFrom(id) { openPick(id); ui.sheet.from = 's'; fpPaint(); }
  function scanHit(code) {
    if (ui.sheet && ui.sheet.mode === 'own') { buzz(20); openOwn(ui.odraft.id, code, ui.odraft); toast('Barcode erkannt', 'check'); return; }
    buzz(20); var ex = foodState().o.filter(function (o) { return o.bc === code; })[0];
    if (ex) { pickFrom(ex.id); return; }
    if (!navigator.onLine) { openOwn('new', code); toast('Offline · einmal selbst eintragen', 'bolt'); return; }
    $('fsm').textContent = code + ' …';
    fetch(OFF + 'api/v2/product/' + code + '?fields=' + OFF_F).then(function (r) { return r.json(); }).then(function (d) {
      if (!ui.sheet || !ui.sheet.fscan) return;
      var x = d && d.status === 1 ? offMap(Object.assign({ code: code }, d.product)) : null;
      if (x) pickFrom(offSave(x)); else { openOwn('new', code); toast('Unbekannt · einmal eintragen, dann kennt Zenit es', 'bolt'); }
    }).catch(function () { if (ui.sheet && ui.sheet.fscan) { openOwn('new', code); toast('Nicht erreichbar · selbst eintragen', 'bolt'); } });
  }
  function fvarHtml(it, id) {
    if (!it.vg) return '';
    return '<div class="seg fvs" style="grid-template-columns: repeat(' + it.vg.length + ', 1fr)">' + it.vg.map(function (v) { return '<button data-fvar="' + v[0] + '" aria-pressed="' + (v[0] === id) + '">' + v[1] + '</button>'; }).join('') + '</div>';
  }
  function openPick(id, a, edit) {
    ui.fingx = null;
    var it = fItem(id); if (!it) return;
    ui.sheet = { fpick: true }; ui.fstpo = false; ui.fpick = { i: id, a: a != null ? a : it.dish ? 1 : it.d || (it.u.length ? it.u[it.ub && it.u[1] ? 1 : 0][1] : 100), edit: edit };
    sheetOpen(fpickHtml(), true); $('sheet').classList.add('fp'); if (it.dish && ui.fingo) fpPaint(); fplnSync();
  }
  function fpPaint() {
    // Mengen-Fenster neu zeichnen; Zutaten-Ansicht eines Gerichts ist mindestens so hoch wie die normale (kein Springen beim Umschalten)
    var s = $('sheet'), pk = ui.fpick, it = pk && fItem(pk.i), hs = s.style.height; s.style.minHeight = '';
    if (it && it.dish && ui.fingo && !ui.fstpo) { s.style.height = ''; ui.fingo = false; s.innerHTML = fpickHtml(); var mh = s.offsetHeight; ui.fingo = true; s.innerHTML = fpickHtml(); s.style.minHeight = mh + 'px'; s.style.height = hs; }
    else s.innerHTML = fpickHtml();
    fplnSync();
  }
  function fpickHtml() {
    var pk = ui.fpick, it = fItem(pk.i), back = !!(ui.sheet && ui.sheet.from), un = it.ml ? 'ml' : 'g', b0 = it.u[0], cu = fUnit(it);
    // Schnellmengen passend zur Einheit, aufsteigend, mindestens 15 % auseinander: Stück/Portionen als 1×–3× (ein Ei wiegt keiner), Getränke in Glas-/Flaschengrößen,
    // sonst runde Mengen um die übliche; Gericht halbe Portionen, Fast Food Verkaufsportionen. Letzte Pille = zuletzt eingetragene Menge (Uhr), sonst eine fünfte Stufe
    var d0 = it.d || (b0 ? b0[1] : 100), r5 = function (x) { return Math.max(5, Math.round(x / 5) * 5); }, ch, last = null;
    foodState().e.forEach(function (x) { if (x.r && x.r.i === pk.i && (!last || x.t > last.t)) last = { t: x.t, g: x.r.g }; });
    if (it.dish) ch = [[0.5], [0.75], [1], [1.5], [2]];
    else if (it.pc) ch = (it.u.length > 1 ? it.u.slice(it.ub ? 1 : 0).map(function (u) { return [u[1]]; }) : []).concat([1, 2, 3, 4].map(function (n) { return [b0[1] * n]; }));
    // Zählbar (Stück, Glas, EL …): Vielfache der Einheit, kleine Einheiten ab 1, sonst ab ½
    // Getränke: ½ · 1 · 2 Glas, dann ½ Liter und die Packung (Tüte, Flasche)
    else if (cu && it.ml) ch = [[cu[1] / 2], [cu[1]], [cu[1] * 2]].concat(cu[1] * 2 === 500 ? [] : [[500]], it.u.filter(function (u) { return u[1] > 400 && u[1] !== 500 && u[1] !== cu[1] * 2; }).map(function (u) { return [u[1]]; }));
    else if (cu) ch = (cu[1] <= 30 ? [1, 2, 3, 4, 5] : [0.5, 1, 2, 3, 4]).map(function (n) { return [cu[1] * n]; });
    else if (it.u.length) ch = it.u.map(function (u) { return [u[1]]; }).concat([[b0[1] * 2], [b0[1] * 3]], it.u[1] ? [[it.u[1][1] * 2]] : [], [[b0[1] * 4]]);
    else if (it.ml) ch = [[200, 1], [250, 1], [330, 1], [500, 1], [750, 1]];
    else ch = [[r5(d0 / 2), 1], [d0, 1], [r5(d0 * 1.5), 1], [d0 * 2, 1], [d0 * 3, 1]];
    for (var cn = 5; ch.length < 12 && !it.dish; cn++) ch.push([(b0 && !it.ml ? b0[1] : d0) * cn, !b0 || it.ml ? 1 : 0]);
    ch = ch.filter(function (x, i, a) { return !a.slice(0, i).some(function (y) { return Math.abs(y[0] - x[0]) < Math.max(y[0], x[0]) * 0.15; }); });
    if (last && !ch.slice(0, 4).some(function (y) { return y[0] === last.g; })) ch = ch.slice(0, 4).sort(function (a, b) { return a[0] - b[0]; }).concat([[last.g, 0, 1]]);
    else ch = ch.slice(0, 5).sort(function (a, b) { return a[0] - b[0]; });
    var dg = it.dish ? dishG(pk.i) : 0;
    var sub = it.dish ? 'Gericht' + (dg ? ' · 1 Portion ≈ ' + Math.round(dg / 5) * 5 + ' g' : ' · je Portion') : (it.b ? it.b + ' · ' : '') + (cu ? '1 ' + cu[0] + (it.pc ? '' : ' · ' + cu[1] + ' ' + un) + ' = ' + Math.round(it.k * cu[1] / 100) + ' kcal' : '100 ' + un + ' = ' + Math.round(it.k) + ' kcal');
    // Zählbar: groß die Einheit („2 Stück“, wischbar), darunter klein die Gramm zum Tippen; Fast Food nur die Einheit; Gericht: Portionen, darunter das Gewicht aus den Zutaten
    // Gericht gewogen: Gramm darunter sind eintippbar und rechnen in Portionen um (Werte folgen)
    var amt = dg ? '<div class="fpcn fpcu"><b id="fpcn">' + fAmt(it, pk.a) + '</b><label class="fag"><input id="fdg" type="number" inputmode="numeric" min="0" step="10" value="' + Math.round(dg * pk.a / 5) * 5 + '" aria-label="Gewogen in g"><span>g</span></label></div>'
      : it.pc ? '<label class="fpcn"><b id="fpcn">' + fAmt(it, pk.a) + '</b></label>' : cu ? '<div class="fpcn fpcu"><b id="fpcn">' + fAmt(it, pk.a) + '</b><label class="fag"><input id="fa" type="number" inputmode="decimal" min="0" step="' + fStep(it) + '" value="' + pk.a + '" aria-label="Menge in ' + un + '"><span>' + un + '</span></label></div>' :
      '<label><input id="fa" type="number" inputmode="decimal" min="0" step="' + fStep(it) + '" value="' + pk.a + '" aria-label="Menge"><span>' + (it.dish ? 'Port.' : un) + '</span></label>';
    // Kopf: Marke wählen (eingebaute Lebensmittel) und Barcode direkt neben dem Schließen
    // Gericht: statt Barcode (hat keinen) der Zutaten-Knopf; an = Zutaten für die gewählte Portion statt der Nährwert-Kacheln
    var hasIng = it.dish && fDish(pk.i) && fDish(pk.i).ing.length, ingOn = hasIng && ui.fingo;
    // Gericht bearbeiten nur aus dem Gerichte-Menü (nicht beim Ändern eines Eintrags): Stift in der Zeile von Eintragen, in der Zutaten-Ansicht oben im Kopf
    var dEd = /^d/.test(pk.i) && !ui.ingm && pk.edit == null && ui.sheet && ui.sheet.from === 'd';
    var hd = shHead('food', fName(it), sub, back), hb = (FOODB[pk.i] && !it.pc && it.cat !== 'r' ? '<button class="x' + (ui.fbr && ui.fbr.i === pk.i ? ' on' : '') + '" data-fbr="1" aria-label="Marke wählen">' + ic('tag') + '</button>' : '') +
      (ingOn && dEd ? '<button class="x" data-fde="' + pk.i + '" aria-label="Gericht bearbeiten">' + ic('edit') + '</button>' : '') +
      (it.dish ? (hasIng ? '<button class="x' + (ingOn ? ' on' : '') + '" data-fingo="1" aria-pressed="' + !!ingOn + '" aria-label="Zutaten">' + ic('ing') + '</button>' : '') : '<button class="x" data-fscan="1" aria-label="Barcode scannen">' + ic('scan') + '</button>');
    hd = hd.replace('<button class="x" data-sheet-close', hb + '<button class="x" data-sheet-close');
    // Kompakt, ohne Scrollen: Menge (± und wischbar), 4 Schnellmengen, Nährwert-Icons mit Tagesbalken, Tag/Mahlzeit/Uhrzeit in einer Zeile, Eintragen mit „danach frei“
    var ex = /^u/.test(pk.i) ? '<button class="btn ghost small" data-fown="' + pk.i + '">' + ic('edit') + 'Lebensmittel bearbeiten</button>' : '';
    return hd + '<div id="fbr">' + fbrHtml() + '</div>' + fvarHtml(it, pk.i) +
      '<div class="fstep"><button class="sb" data-fstep="-1" aria-label="Weniger">' + ic('minus') + '</button>' + amt + '<button class="sb" data-fstep="1" aria-label="Mehr">' + ic('plus') + '</button></div>' +
      // Gericht: keine Schnellmengen (Portion über ± bzw. Wischen in Vierteln), dafür die Zutaten als aufklappbare Zeile (zu: Vorschau der Namen, auf: Liste mit Mengen)
      (it.dish ? '' : '<div class="fpc">' + ch.map(function (c) { return '<button data-famt="' + c[0] + '" aria-pressed="' + (c[0] === pk.a) + '"' + (c[2] ? ' aria-label="Zuletzt: ' + fAmt(it, c[0]) + '">' + ic('clock') : '>') + fAmt(it, c[0], c[1]) + '</button>'; }).join('') + '</div>') +
      // Zutaten an: Zutaten als Chips (zwei je Zeile), Nährwerte der Portionen in einer Zeile, darunter der Griff zu den Schritten; kein Tag/Mahlzeit/Uhrzeit und kein Eintragen
      (ingOn ? '<div class="fing" id="fing">' + fingHtml(pk.i, pk.a) + '</div>' + fstpHtml(pk.i, dEd) :
      '<div class="ftot" id="ftot">' + ftotHtml(fNut(it, pk.a)) + '</div>' + (ui.ingm ? '' : ui.fplan ? whenRow(0, false, fplMk(pk.i), true) : whenFor(pk.edit)) +
      // Eintragen und (beim Ändern) Löschen teilen sich die Zeile: Löschen klein, rot, nur Mülleimer
      '<div class="fpgo"><button class="btn primary big" data-fpadd="1">' + ic('check') + '<span>' + (ui.ingm ? 'Hinzufügen' : ui.fplan ? (ui.plEdit != null ? 'Ändern' : 'Einplanen') : pk.edit != null ? 'Ändern' : 'Eintragen') + (ui.ingm ? '' : '<small id="ffit">' + ffitHtml() + '</small>') + '</span></button>' +
      (pk.edit != null ? '<button class="btn big fpdel" data-fdel="' + pk.edit + '" aria-label="Eintrag löschen">' + ic('trash') + '</button>' : '') +
      (ui.fplan && ui.plEdit != null ? '<button class="btn big fpdel" data-plx="' + ui.plEdit + '" aria-label="Geplantes entfernen">' + ic('trash') + '</button>' : '') +
      (dEd ? '<button class="btn big fped" data-fde="' + pk.i + '" aria-label="Gericht bearbeiten">' + ic('edit') + '</button>' : '') + '</div>') +
      (ex ? '<div class="fsb fpx">' + ex + '</div>' : '');
  }
  function fDaySum() {
    // Tagessumme des Ziel-Tags ohne den Eintrag, der gerade geändert wird, dazu das Tagesziel
    var pk = ui.fpick, di = dayIdx(Date.now()) - (ui.fday || 0), s = foodSum(di), ox = pk && pk.edit != null ? foodState().e[pk.edit] : null;
    if (ox) NK.forEach(function (k) { s[k] -= ox[k] || 0; });
    // Beim Planen zählt das schon Geplante mit
    if (ui.fplan) { var q = planSum(di), po = ui.plEdit != null ? foodState().pl[ui.plEdit] : null; NK.forEach(function (k) { s[k] += (q[k] || 0) - (po && po[k] || 0); }); }
    return { s: s, g: foodGoal(di) };
  }
  function ffitHtml() {
    // Passt das noch? kcal danach frei bzw. drüber (Grenzen der übrigen Werte zeigen die Kacheln rot)
    var pk = ui.fpick, v = fNut(fItem(pk.i), pk.a), d = fDaySum(), rest = Math.round(d.g.k - d.s.k - (v.k || 0));
    return rest >= 0 ? rest + ' kcal danach frei' : -rest + ' kcal über dem Ziel';
  }
  function fbrLoad() {
    var bi = ui.fpick.i, bit = fItem(bi), bw = fnorm(fName(bit)).split(' ')[0]; ui.fbr = { i: bi, st: 'load', r: [] }; $('fbr').innerHTML = fbrHtml(); document.querySelector('[data-fbr]').classList.add('on');
    offSearch(fEn(bit), function (r) { if (!ui.fbr || ui.fbr.i !== bi) return; ui.fbr.st = r ? 'ok' : 'err'; ui.fbr.r = r ? r.filter(function (x) { return fnorm(x.n).indexOf(bw) >= 0; }).slice(0, 10) : []; var e = $('fbr'); if (e) e.innerHTML = fbrHtml(); });
  }
  function fbrHtml() {
    // Marke wählen: Open-Food-Facts-Produkte zum Grundnamen (nur eingebaute Lebensmittel, nicht Restaurant/Fast Food)
    var b = ui.fbr, pk = ui.fpick, it = pk && FOODB[pk.i];
    if (!it || it.pc || it.cat === 'r') return '';
    if (!b || b.i !== pk.i) return '';
    var foot = '<button class="btn fanl" data-fownb="1">' + ic('plus') + 'Fehlt? Selbst anlegen</button>';
    if (b.st === 'load') return '<p class="muted fon">' + ic('globe') + 'Suche Marken …</p>';
    if (!b.r.length) return '<p class="muted fon">' + ic('globe') + (b.st === 'err' ? 'Open Food Facts antwortet nicht<button class="btn small fre" data-fbrr="1">' + ic('undo') + 'Nochmal</button>' : 'Keine Marke gefunden. Barcode scannen oder selbst anlegen.') + '</p>' + foot;
    return '<h3 class="xg">' + ic('globe') + 'Marken</h3>' + b.r.map(function (x, i) { return '<button class="fsi web" data-fbrp="' + i + '"><span><b>' + esc(x.n) + '</b><small>' + esc([x.b, x.qt].filter(Boolean).join(' · ')) + '</small></span><em>' + x.k + '</em></button>'; }).join('') + foot;
  }
  function ftotHtml(v) {
    // Nährwert-Kacheln in den Nährwertfarben: Wert dieser Menge; Balken + Prozent = Anteil dieser Menge am Tagesziel, rot wenn der Tag damit über die Grenze geht.
    // Beim Gericht-Zutat ohne Balken
    var d = ui.ingm ? null : fDaySum();
    return NK.map(function (k) {
      var bar = '';
      if (d) { var gk = d.g[k] || 1, a = (v[k] || 0) / gk; bar = '<em' + ((d.s[k] || 0) + (v[k] || 0) > gk * FLIM[k] ? ' class="over"' : '') + '><i><i style="width:' + Math.min(100, a * 100).toFixed(1) + '%"></i></i>' + Math.round(a * 100) + '%</em>'; }
      return '<div style="--nc:var(' + NCOL[k] + ')" aria-label="' + (k === 'k' ? 'kcal' : NSH[k]) + '"><span>' + ic(NIC[k]) + '<b>' + fNv(k, v[k]) + '</b></span>' + bar + '</div>';
    }).join('');
  }
  function fpickUpd() {
    var pk = ui.fpick, it = fItem(pk.i); if (!it) return;
    if ($('ftot')) $('ftot').innerHTML = ftotHtml(fNut(it, pk.a)); if ($('ffit')) $('ffit').textContent = ffitHtml();
    var pc = $('fpcn'); if (pc) pc.textContent = fAmt(it, pk.a);
    var pg = $('fdg'); if (pg && document.activeElement !== pg) pg.value = Math.round(dishG(pk.i) * pk.a / 5) * 5;
    document.querySelectorAll('[data-famt]').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.dataset.famt === pk.a)); });
    if ($('fing')) $('fing').innerHTML = fingHtml(pk.i, pk.a);
  }
  // Gewicht einer Portion eines Gerichts (Summe der Zutatenmengen / Portionen), 0 = unbekannt
  function dishG(id) { var dd = fDish(id); var g = dd ? dd.ing.reduce(function (a, q) { return a + (+q.a || 0); }, 0) / Math.max(1, +dd.por || 1) : 0; return g >= 5 ? g : 0; }
  function fingHtml(id, por) {
    // Zutaten eines Gerichts für die gewählte Portionenzahl (zum Kochen) als Chips in der Farbe ihrer Kategorie: Icon, Name, Menge (gerundet auf 5 g); darunter die Nährwerte
    var dd = fDish(id); if (!dd || !dd.ing.length) return '';
    var f = por / Math.max(1, +dd.por || 1), v = fNut(fItem(id), por);
    return dd.ing.filter(function (q) { return q.n || +q.a > 0; }).map(function (q, qi) {
      // Ohne Menge (Gewürze, „nach Belieben“): n. B. statt Gramm
      var g = (+q.a || 0) * f, src = q.i && (FOODB[q.i] || fOwn(q.i)), ck = src && src.cat ? src.cat : q.i && /^u/.test(q.i) ? 'u' : 'x';
      // Zählbare Zutat in ihrer Einheit („2 Stück“), wenn es auf ½ Einheit ungefähr aufgeht
      // Name links (lang = kleiner), Menge rechts; mit Menge antippbar = Kurzübersicht der Werte dieser Zutat in der Zeile darunter (volle Breite)
      var cu = src && fUnit(src), cn = cu ? Math.round(g / cu[1] * 2) / 2 : 0, gr = g < 20 ? Math.round(g) : Math.round(g / 5) * 5;
      var am = cn && Math.abs(cn * cu[1] - g) <= g * 0.15 ? fAmt(src, cn * cu[1]) : gr + (src && src.ml ? ' ml' : ' g'), tap = g > 0, op = tap && ui.fingx === qi;
      return '<' + (tap ? 'button data-fing="' + qi + '" aria-expanded="' + op + '"' : 'span') + ' style="--cc:' + fTone(q.i, ck) + '">' + ic(fIco(q.i, ck)) + '<b class="' + fitCls(q.n || 'Zutat', 12) + '">' + esc(q.n || 'Zutat') + '</b>' +
        (g > 0 ? '<em>' + am + '</em>' : '<em class="nb">n. B.</em>') + '</' + (tap ? 'button' : 'span') + '>' +
        (op ? '<div class="dgp fiq" style="--cc:' + fTone(q.i, ck) + '">' + ['k', 'p', 'f', 'c'].map(function (k) { return '<span style="--nc:var(' + NCOL[k] + ')">' + ic(NIC[k]) + '<b>' + Math.round((+q[k] || 0) * g / 100) + '</b></span>'; }).join('') + '</div>' : '');
    }).join('') + '<div class="dgp">' + ['k', 'p', 'f', 'c'].map(function (k) { return '<span style="--nc:var(' + NCOL[k] + ')">' + ic(NIC[k]) + '<b>' + Math.round(v[k] || 0) + '</b></span>'; }).join('') + '</div>';
  }
  function fstpHtml(id, ed) {
    // Schritte: zu = der Anfang blendet nach unten aus (Fade deutet an, dass es weitergeht), Tippen oder nach oben Wischen öffnet; auf = Fenster gleitet ganz hoch.
    // Ohne Schritte nichts zum Öffnen, nur ein klarer Hinweis (Hinzufügen über den Stift im Kopf)
    var dd = fDish(id), st = dd && dd.st || [], on = !!ui.fstpo;
    if (!st.length) return '<p class="muted fstn">Keine Schritte hinterlegt' + (ed ? ' · über den Stift hinzufügen' : '') + '</p>';
    return '<div class="fsts' + (on ? '' : ' peek') + '" data-fstp="1" role="button" aria-expanded="' + on + '" aria-label="' + st.length + (st.length === 1 ? ' Schritt' : ' Schritte') + (on ? ' zuklappen' : ' anzeigen') + '">' +
      '<b class="fsth">' + st.length + (st.length === 1 ? ' Schritt' : ' Schritte') + '</b><ol>' + st.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol></div>';
  }
  function nTile(id, k, v, big, u) {
    // Nährwert-Eingabe als Kachel wie im Mengen-Fenster (Farbkante oben, Icon + Einheit, Zahl groß); in .ntg: big = halbe Breite, sonst Viertel
    return '<label class="ntl' + (big ? ' big' : '') + '" style="--nc:var(' + NCOL[k] + ')"><i>' + ic(NIC[k]) + '<small>' + (u || (k === 'k' ? 'kcal' : 'g')) + '</small></i>' +
      '<input id="' + id + '" type="number" inputmode="decimal" min="0" value="' + (v == null ? '' : v) + '" placeholder="0" aria-label="' + (k === 'k' ? 'Kalorien' : NSH[k]) + '"></label>';
  }
  // Schnell: Einheiten (Name, kurz, übliche Bezugsmenge)
  var QU = [['g', 'g', 100], ['ml', 'ml', 100], ['st', 'Stück', 1], ['po', 'Portion', 1]];
  function quDef(u) { return (QU.filter(function (x) { return x[0] === u; })[0] || QU[0])[2]; }
  function quickHtml(idx) {
    // Schnell eintragen, ob es das Lebensmittel gibt oder nicht: oben „gegessen“ (± und wischbar), darunter Nährwerte je Bezugsmenge wie auf der Packung (je 100 g, je Stück …),
    // darunter live, was eingetragen wird. Gibt es den Namen schon, ein Hinweis zum Übernehmen. Eintragen bleibt grau, bis kcal und Mengen da sind
    var x = idx != null ? foodState().e[idx] : null, q = ui.fqd, u = QU.filter(function (y) { return y[0] === q.u; })[0];
    return '<div id="fqh">' + fqhHtml() + '</div><input id="f-n" class="fnm" type="text" maxlength="30" placeholder="Name, z. B. Döner" value="' + esc(q.n) + '" aria-label="Name">' +
      '<div class="fstep"><button class="sb" data-fqst="-1" aria-label="Weniger">' + ic('minus') + '</button><label><input id="f-e" type="number" inputmode="decimal" min="0" value="' + (q.a || '') + '" placeholder="0" aria-label="Gegessen"><span id="fqeu">' + u[1] + '</span></label><button class="sb" data-fqst="1" aria-label="Mehr">' + ic('plus') + '</button></div>' +
      '<div class="fqa"><small>Nährwerte je</small><input id="f-r" class="fnm" type="number" inputmode="decimal" min="0" value="' + (q.r || '') + '" aria-label="Bezugsmenge">' +
      '<div class="seg">' + QU.map(function (y) { return '<button data-fqu="' + y[0] + '" aria-pressed="' + (q.u === y[0]) + '">' + y[1] + '</button>'; }).join('') + '</div></div>' +
      '<div class="ntg">' + NK.map(function (k) { return nTile('f-' + k, k, q.v ? q.v[k] : null, k === 'k' || k === 'p'); }).join('') + '</div><p class="fqr" id="fqr"></p>' + (ui.fplan ? '' : whenFor(idx)) +
      '<div class="fpgo"><button class="btn primary big" data-fsave="1">' + ic('check') + (x ? 'Ändern' : ui.fplan ? 'Einplanen' : 'Eintragen') + '</button>' + (x ? '<button class="btn big fpdel" data-fdel="' + idx + '" aria-label="Eintrag löschen">' + ic('trash') + '</button>' : '') + '</div>';
  }
  function fqhHtml() {
    // Gibt es das schon (eigenes oder eingebautes Lebensmittel zum Namen)? Dann bequem übernehmen statt abtippen
    var n = (ui.fqd.n || '').trim(), it = n.length >= 3 && ui.sheet && ui.sheet.idx == null ? ingMatch(n) : null; if (!it) return '';
    return '<button class="fsi fqx" data-fqx="' + it.id + '" style="--cc:' + fTone(it.id, it.cat || 'u') + '"><i class="fsc">' + ic(fIco(it.id, it.cat || 'u')) + '</i><span><b>Gibt es schon: ' + esc(fName(it)) + '</b><small>' + Math.round(it.k) + ' kcal je 100 ' + (it.ml ? 'ml' : 'g') + ' · übernehmen</small></span>' + ic('chev') + '</button>';
  }
  function quickRead() {
    // Felder lesen: Werte je Bezugsmenge r, eingetragen wird gegessen a / r davon (q.t); fehlt Pflichtiges, ist Eintragen gesperrt (grau)
    var q = ui.fqd, v = function (k) { var e = $('f-' + k), f = e ? parseFloat(e.value) : NaN; return isFinite(f) && f >= 0 ? f : null; };
    if (!$('f-n')) return null;
    q.n = $('f-n').value; q.a = (v('e') || 0) >= 0.1 ? v('e') : 0; q.r = (v('r') || 0) >= 0.1 ? v('r') : 0; q.v = {}; q.t = {};
    NK.forEach(function (k) { q.v[k] = v(k); q.t[k] = q.v[k] == null || !q.r ? null : q.v[k] * q.a / q.r; });
    q.ok = (q.v.k || 0) > 0 && q.a > 0 && q.r > 0 && q.t.k <= 20000 && (q.t.p || 0) <= 1000;
    var b = document.querySelector('[data-fsave]'); if (b) b.classList.toggle('off', !q.ok);
    var r = $('fqr'); if (r) r.innerHTML = q.ok ? ic('check') + Math.round(q.t.k) + ' kcal · ' + fN(q.t.p || 0) + ' g Protein' : !(q.v.k > 0) ? 'kcal eintragen' : 'Mengen eintragen';
    var h = $('fqh'); if (h) h.innerHTML = fqhHtml();
    return q;
  }
  function openQuick(idx, name, from) {
    // Ändern: die Werte des Eintrags gelten für die eingetragene Menge (ohne Menge als 1 Portion)
    var x = idx != null ? foodState().e[idx] : null, qa = x && x.qa ? x.qa : x ? [1, 'po'] : null, v = {};
    if (x) NK.forEach(function (k) { v[k] = x[k] != null ? x[k] : null; });
    ui.fqd = { n: x ? x.n : name || '', a: qa ? qa[0] : 100, r: qa ? qa[0] : 100, u: qa ? qa[1] : 'g', v: x ? v : null };
    ui.sheet = { food: true, idx: idx, from: from || null }; if (!ui.fplan) ui.fday = fBack();
    sheetOpen(shHead('bolt', idx != null ? 'Eintrag ändern' : ui.fplan ? 'Schnell einplanen' : 'Schnell eintragen', 'Gegessen, Werte laut Packung', !!from) + quickHtml(idx), true);
    quickRead();
  }
  function qsvHtml() {
    // Nach dem Schnell-Eintrag merken: Kategorie mit Namen, dann Unterart; Speichern legt das Lebensmittel an und verbindet den Eintrag
    var s = ui.qsv, subs = FSUB.filter(function (q) { return q[0] === s.cat; });
    return shHead('star', 'Als Lebensmittel merken', s.n) + '<div class="fcl qsc">' + FCATS.map(function (c) { return '<button data-qsc="' + c[0] + '" style="--cc:' + (CCOL[c[0]] || CCOL.x) + '" aria-pressed="' + (s.cat === c[0]) + '"><i class="fsc">' + ic(CATI[c[0]][0]) + '</i><b>' + c[1] + '</b></button>'; }).join('') + '</div>' +
      (subs.length ? '<div class="fsbb qss">' + subs.map(function (q) { return '<button data-qss="' + q[1] + '" style="--cc:' + sbTone(q) + '" aria-pressed="' + (s.sb === q[1]) + '">' + ic(q[3]) + esc(q[2]) + '</button>'; }).join('') + '</div>' : '') +
      '<button class="btn primary big' + (s.cat ? '' : ' off') + '" data-qsok="1">' + ic('check') + 'Merken</button>';
  }
  function openOwn(id, bc, dr) {
    // dr: Entwurf aus dem Formular (zurück vom Barcode-Scan)
    var o = id && id !== 'new' ? fOwn(id) : null, src = dr || o || {}, code = bc || (dr && dr.bc) || (o && o.bc) || '';
    ui.sheet = { fown: o ? o.id : 'new', bc: code, ml: src.ml ? 1 : 0 };
    var un = dr ? dr.un : o && o.u[0] ? o.u[0][0] : '', ug = dr ? dr.ug : o && o.u[0] ? o.u[0][1] : '';
    sheetOpen(shHead('plus', o ? 'Lebensmittel' : 'Eigenes Lebensmittel', 'Werte je 100 g bzw. 100 ml, z. B. von der Packung') +
      '<input id="o-n" class="fnm" type="text" maxlength="30" placeholder="Name, z. B. Proteinbrot" value="' + esc(src.n || '') + '" aria-label="Name">' +
      '<div class="own2"><input id="o-b" class="fnm" type="text" maxlength="24" placeholder="Marke (optional)" value="' + esc(src.b || '') + '" aria-label="Marke">' +
      '<div class="fqw"><input id="o-bc" class="fnm" type="text" inputmode="numeric" maxlength="14" placeholder="Barcode (optional)" value="' + esc(code) + '" aria-label="Barcode"><button class="x" data-fscan="own" aria-label="Barcode scannen">' + ic('scan') + '</button></div></div>' +
      '<div class="seg fvs"><button data-oml="0" aria-pressed="' + !ui.sheet.ml + '">g</button><button data-oml="1" aria-pressed="' + !!ui.sheet.ml + '">ml</button></div>' +
      '<div class="ntg">' + NK.map(function (k) { return nTile('o-' + k, k, src[k], k === 'k' || k === 'p'); }).join('') + '</div>' +
      // Portion: Name und Gramm in einer Zeile, ohne Überschriften
      '<div class="fqn"><input id="o-un" class="fnm" type="text" maxlength="12" placeholder="Portion, z. B. Scheibe" value="' + esc(String(un)) + '" aria-label="Portion">' +
      '<label class="ogm"><input id="o-ug" class="fnm" type="number" inputmode="decimal" min="0" placeholder="Menge" value="' + ug + '" aria-label="Menge der Portion"><span>g</span></label></div>' +
      '<button class="btn primary big" data-fownsave="1">' + ic('check') + 'Speichern</button>' + (o ? '<button class="btn ghost small" data-fowndel="1">' + ic('trash') + 'Löschen</button>' : ''), true);
  }
  function ownDraft() { var d = { n: $('o-n').value, b: $('o-b').value, un: $('o-un').value, ug: $('o-ug').value, ml: ui.sheet.ml, bc: $('o-bc').value }; NK.forEach(function (k) { d[k] = $('o-' + k).value; }); return d; }
  function openDishes() {
    ui.sheet = { fdishes: true }; if (!ui.fplan) ui.fday = fBack(); sheetOpen(dishesHtml(), true);
  }
  function dishesHtml() {
    // Gespeichertes: Reiter Gerichte (Rezepte) | Menüs (ganze Mahlzeiten/Tage aus food.tp, ui.dtab 'm'); beide nach Mahlzeit in 4er-Kacheln, + im Kopf legt neu an.
    // Gerichte: Filter nach Mahlzeit (fest gewählt oder meist gegessen, dishMeals; ohne = „Sonstige“); Kachel antippen = Menge wählen und bearbeiten,
    // nach rechts wischen = 1 Portion sofort, halten und ziehen = auf eine Mahlzeit; zuletzt gegessene zuerst
    var st = foodState(), lt = {}, f = ui.dmf || '', mt = ui.dtab === 'm';
    var tabs = '<div class="seg fdtb">' + [['d', 'pot', 'Gerichte'], ['m', 'cards', 'Menüs']].map(function (q) { return '<button data-dtab="' + q[0] + '" aria-pressed="' + (mt === (q[0] === 'm')) + '">' + ic(q[1]) + q[2] + '</button>'; }).join('') + '</div>';
    var hb = function (h, x) { return h.replace('<button class="x" data-sheet-close', x + '<button class="x" data-sheet-close'); };
    if (mt) {
      var di = fTplDay(), tp = st.tp.length;
      return hb(shHead('cards', 'Menüs', 'Einplanen für ' + dayHead(di)), (tp ? '<button class="x' + (ui.tpdel ? ' on' : '') + '" data-ptpx="1" aria-pressed="' + !!ui.tpdel + '" aria-label="Menüs löschen">' + ic(ui.tpdel ? 'check' : 'trash') + '</button>' : '') +
        '<button class="x" data-tpadd="1" aria-label="Neues Menü">' + ic('plus') + '</button>') + tabs + tplTiles(di);
    }
    st.e.forEach(function (x) { if (x.r && /^d/.test(x.r.i)) lt[x.r.i] = Math.max(lt[x.r.i] || 0, x.t); });
    var l = st.d.slice().sort(function (a, b) { return (lt[b.id] || 0) - (lt[a.id] || 0); });
    var tile = function (x) { var t = dishTot(x), ms = dishMeals(x); return savedTile(x.n, t.pk, t.pp, f || ms[0] || '', 'pot', 'data-fpick="' + x.id + '" data-fdsw="' + x.id + '"'); };
    var sec = function (icn, nm, g) { return g.length ? '<p class="tplg">' + ic(icn) + nm + '</p><div class="ftl" data-noswipe="1">' + g.map(tile).join('') + '</div>' : ''; }, h = '';
    MEALS.forEach(function (m) { if (!f || f === m[1]) h += sec(MEALI[m[1]], m[2], l.filter(function (x) { var ms = dishMeals(x); return f ? ms.indexOf(f) >= 0 : ms[0] === m[1]; })); });
    if (!f) h += sec('pot', 'Sonstige', l.filter(function (x) { return !dishMeals(x).length; }));
    return hb(shHead('pot', 'Gerichte', st.d.length + (st.d.length === 1 ? ' Gericht' : ' Gerichte') + ' · je Portion'), '<button class="x" data-fde="new" aria-label="Neues Gericht">' + ic('plus') + '</button>') + tabs +
      (st.d.length ? '<div class="seg fdm">' + [['', 'Alle']].concat(MEALS.map(function (m) { return [m[1], m[2]]; })).map(function (m) {
        return '<button data-dmf="' + m[0] + '" aria-pressed="' + (f === m[0]) + '" aria-label="' + m[1] + '">' + (m[0] ? ic(MEALI[m[0]]) : 'Alle') + '</button>'; }).join('') + '</div>' + (h || '<p class="muted">Hier noch keine Gerichte.</p>')
        : '<p class="muted tplh">' + ic('pot') + 'Gerichte sind Rezepte mit Zutaten und Portionen. Über + oben anlegen oder ein Rezept einfügen.</p>');
  }
  // Gericht bearbeiten: Zutaten aus der Datenbank füllen alle Nährwerte, sonst kcal und Protein von Hand
  function libFind(name) {
    var q = fnorm(name.trim()); if (!q) return null;
    var all = foodState().o.concat(FOODS); for (var i = 0; i < all.length; i++) if (fnorm(all[i].n) === q) return all[i];
    return null;
  }
  // Zutat fürs Gericht: Suche, Marke und Barcode im Zutat-Modus (ui.ingm); „Hinzufügen“ trägt Menge und Werte je 100 g ein
  function ingBack() { ui.ingm = false; ui.sheet = { dishEdit: true }; sheetOpen(dishEditHtml(), true); }
  function ingAdd(id, a) {
    var it = fItem(id), dd = ui.dd; if (!it || !dd) return;
    var r = { n: fEn(it).slice(0, 30), a: Math.round(a * 10) / 10, k: it.k, p: it.p, i: id }; ['f', 'c', 'fb', 'su'].forEach(function (k) { if (it[k] != null) r[k] = it[k]; });
    var last = dd.ing[dd.ing.length - 1]; if (last && !last.n && last.a === '') dd.ing.pop();
    dd.ing.push(r); ingBack();
  }
  function dishEditHtml() {
    // Gericht anlegen: Name, darunter je Portion live (Nährwert-Icons) mit Portionen ±; Zutaten kompakt (Name, Gramm, entfernen) – aus der Datenbank mit Nährwerten je 100 g,
    // von Hand mit kcal und Protein je 100 g; Zutat suchen (Suche hat Barcode) oder von Hand; Speichern und Löschen teilen sich die Zeile
    var dd = ui.dd, t = dishTot(dd);
    return shHead('pot', dd.id ? 'Gericht' : 'Neues Gericht', 'Zutaten eintragen, durch Portionen teilen') +
      '<input id="dd-n" class="fnm" type="text" maxlength="30" placeholder="Name, z. B. Chili" value="' + esc(dd.n) + '" aria-label="Name">' +
      // Mahlzeiten: keine gewählt = automatisch (wann es meist gegessen wird), sonst eine oder mehrere
      '<div class="seg fdm ddm">' + MEALS.map(function (m) { return '<button data-ddm="' + m[1] + '" aria-pressed="' + ((dd.m || []).indexOf(m[1]) >= 0) + '" aria-label="' + m[2] + '">' + ic(MEALI[m[1]]) + '</button>'; }).join('') + '</div>' +
      '<datalist id="ing-lib">' + foodState().o.concat(FOODS).map(function (x) { return '<option value="' + esc(x.n) + '">'; }).join('') + '</datalist>' +
      '<div class="dgt"><div id="dd-tot">' + dishTotHtml(t) + '</div><div class="dgpor"><button class="sb" data-dpor="-1" aria-label="Eine Portion weniger">' + ic('minus') + '</button>' +
      '<label><input id="dd-por" type="number" inputmode="decimal" min="1" step="1" value="' + dd.por + '" aria-label="Portionen"><span>Port.</span></label><button class="sb" data-dpor="1" aria-label="Eine Portion mehr">' + ic('plus') + '</button></div></div>' +
      dd.ing.map(function (q, i) {
        return '<div class="dg"><div class="dg-h"><input id="di-n-' + i + '" type="text" list="ing-lib" maxlength="30" placeholder="Zutat" value="' + esc(q.n) + '" aria-label="Zutat">' +
          '<label class="dgam"><input id="di-a-' + i + '" type="number" inputmode="decimal" min="0" value="' + (q.a === '' ? '' : q.a) + '" placeholder="0" aria-label="Menge in g"><span>g</span></label>' +
          '<button class="xs2" data-dgx="' + i + '" aria-label="Zutat entfernen">' + ic('close') + '</button></div>' +
          (q.i ? '<small class="dgl">' + ['k', 'p', 'f', 'c'].map(function (k) { return '<span style="--nc:var(' + NCOL[k] + ')">' + ic(NIC[k]) + fNv(k, q[k]) + '</span>'; }).join('') + 'je 100 g</small>' :
            '<div class="ntg two">' + nTile('di-k-' + i, 'k', q.k, false, 'kcal / 100 g') + nTile('di-p-' + i, 'p', q.p, false, 'g / 100 g') + '</div>') + '</div>';
      }).join('') +
      '<div class="fsb dga"><button class="btn small" data-dgs="1">' + ic('search') + 'Zutat suchen</button><button class="btn small" data-dga="1">' + ic('plus') + 'Von Hand</button></div>' +
      // Schritte: nummeriert, frei als Text; Rezept einfügen füllt Zutaten und Schritte aus kopiertem Text
      '<h3 class="xg">' + ic('ing') + 'Schritte</h3>' + (dd.st || []).map(function (s, i) {
        return '<div class="dst"><b>' + (i + 1) + '</b><textarea id="ds-' + i + '" class="fnm" rows="2" maxlength="400" placeholder="Was ist zu tun?" aria-label="Schritt ' + (i + 1) + '">' + esc(s) + '</textarea><button class="xs2" data-dsx="' + i + '" aria-label="Schritt entfernen">' + ic('close') + '</button></div>';
      }).join('') +
      '<div class="fsb dga"><button class="btn small" data-dsa="1">' + ic('plus') + 'Schritt</button><button class="btn small" data-dimp="1">' + ic('paste') + 'Rezept einfügen</button></div>' +
      '<div class="fpgo"><button class="btn primary big" data-dsave="1">' + ic('check') + 'Speichern</button>' + (dd.id ? '<button class="btn big fpdup" data-ddup="1" aria-label="Als Kopie anlegen">' + ic('cards') + '</button><button class="btn big fpdel" data-ddel="1" aria-label="Gericht löschen">' + ic('trash') + '</button>' : '') + '</div>';
  }
  function dishTotHtml(t) {
    // Gericht: je Portion als Nährwert-Icons, darunter die Summe
    return '<div class="dgp">' + [['k', t.pk], ['p', t.pp], ['f', t.pf], ['c', t.pc]].map(function (q) { return '<span style="--nc:var(' + NCOL[q[0]] + ')">' + ic(NIC[q[0]]) + '<b>' + Math.round(q[1]) + '</b></span>'; }).join('') + '</div><small>je Portion · gesamt ' + Math.round(t.k) + ' kcal</small>';
  }
  function openDishEdit(id) {
    var x = id && id !== 'new' ? fDish(id) : null;
    ui.dd = x ? JSON.parse(JSON.stringify(x)) : { id: null, n: '', por: 1, ing: [{ n: '', a: '', k: '', p: '' }] };
    ui.ddel = 0; ui.sheet = { dishEdit: true }; sheetOpen(dishEditHtml(), true);
  }
  function readDraft() {
    var dd = ui.dd; if (!dd || !$('dd-n')) return;
    dd.n = $('dd-n').value; dd.por = Math.max(1, parseFloat($('dd-por').value) || 1);
    dd.ing.forEach(function (q, i) {
      // Fehlt das Feld (Zutat aus der Datenbank: kcal/Protein nicht editierbar), bleibt der bisherige Wert
      function v(k) { var e = $('di-' + k + '-' + i); if (!e) return q[k]; var f = parseFloat(e.value); return isFinite(f) ? f : ''; }
      q.n = $('di-n-' + i).value; q.a = v('a'); q.k = v('k'); q.p = v('p');
    });
    dd.st = (dd.st || []).map(function (s, i) { var e = $('ds-' + i); return e ? e.value : s; });
  }
  function openDishImp() {
    readDraft(); ui.sheet = { dishImp: true };
    sheetOpen(shHead('paste', 'Rezept einfügen', 'Auf der Rezeptseite markieren, kopieren, hier einfügen', true) +
      '<textarea id="dimp-t" class="fnm dimp" rows="12" placeholder="Zutaten&#10;500 g Rinderhack&#10;1 Dose Kidneybohnen&#10;2 Zwiebeln&#10;&#10;Zubereitung&#10;Zwiebeln würfeln und anbraten …" aria-label="Rezepttext"></textarea>' +
      '<button class="btn primary big" data-dimpok="1">' + ic('check') + 'Übernehmen</button>', true);
  }
  // Rezepttext lesen: Abschnitte „Zutaten“ / „Zubereitung“, Zeilen mit Menge vorn („200 g …“, „1 EL …“, „½ Dose …“) oder hinten („… 200 g“) sind Zutaten,
  // lange Zeilen und alles nach „Zubereitung“ sind Schritte, „für 4 Portionen“ setzt die Portionen. Gramm aus der Einheit, Stück aus der Portion des passenden Lebensmittels
  var RU = { g: 1, gr: 1, gramm: 1, kg: 1000, ml: 1, l: 1000, liter: 1000, cl: 10, el: 15, essloffel: 15, tl: 5, teeloffel: 5, prise: 1, prisen: 1, msp: 1, becher: 200, dose: 400, dosen: 400, glas: 300,
    pck: 10, pack: 10, packung: 200, paeckchen: 10, packchen: 10, bund: 30, zehe: 4, zehen: 4, scheibe: 25, scheiben: 25, tasse: 150, tassen: 150, handvoll: 30, stuck: 0, stk: 0, st: 0 };
  function rNum(s) { s = s.replace(',', '.'); var fr = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 0.33, '⅔': 0.67 }; if (fr[s]) return fr[s]; var m = /^(\d+)\s*\/\s*(\d+)$/.exec(s); return m ? +m[1] / +m[2] : parseFloat(s); }
  function ingMatch(name) {
    // Passendes Lebensmittel: ganzer Name im Text, sonst gleicher Wortanfang (ab 4 Buchstaben, z. B. „Zwiebeln“ → Zwiebel); längster Treffer gewinnt
    var q = fnorm(name), ws = q.split(/[^a-z0-9]+/).filter(function (w) { return w.length >= 4; }), best = null, bs = 0;
    foodState().o.concat(FOODS.filter(function (x) { return !x.vh; })).forEach(function (x) {
      var fn = fnorm(fName(x)), t0 = fn.split(/[^a-z0-9]+/)[0], s = q.indexOf(fn) >= 0 ? fn.length * 2 : t0.length >= 4 && ws.some(function (w) { return w.indexOf(t0) === 0 || t0.indexOf(w) === 0; }) ? t0.length : 0;
      if (s > bs) { bs = s; best = x; }
    });
    return best;
  }
  function ingLine(l) {
    var m = /^(\d+(?:[.,]\d+)?(?:\s*\/\s*\d+)?|[½¼¾⅓⅔])(?:\s*(?:-|–|bis)\s*\d+(?:[.,]\d+)?)?\s*([A-Za-zÄÖÜäöüß.]+)?\s*(.*)$/.exec(l), a, u = null, n;
    if (m) { a = rNum(m[1]); var uw = fnorm((m[2] || '').replace(/\.$/, '')); if (m[2] && RU[uw] != null) { u = uw; n = m[3]; } else n = ((m[2] || '') + ' ' + m[3]).trim(); }
    else { m = /^(.+?)\s+(\d+(?:[.,]\d+)?)\s*(g|kg|ml|l)\.?$/i.exec(l); if (!m) return null; n = m[1]; a = rNum(m[2]); u = m[3].toLowerCase(); }
    n = n.replace(/\(.*?\)/g, '').split(/,|\boder\b/)[0].replace(/\s+/g, ' ').trim(); if (!n || !(a > 0)) return null;
    // Ohne bekannte Einheit nur mit passendem Lebensmittel („10 Minuten backen“ ist keine Zutat)
    var it = ingMatch(n); if (!u && !it) return null;
    var g =u && RU[u] ? a * RU[u] : a * (it && it.u[0] ? it.u[0][1] : 100);
    var r = { n: n.slice(0, 30), a: Math.round(g), k: '', p: '' };
    if (it) { r.k = it.k; r.p = it.p; r.i = it.id; ['f', 'c', 'fb', 'su'].forEach(function (k) { if (it[k] != null) r[k] = it[k]; }); }
    return r;
  }
  function rcpParse(txt) {
    var mode = '', o = { n: '', por: 0, ing: [], st: [] };
    txt.split(/\r?\n/).map(function (s) { return s.replace(/^[\s•·*▢□☐✓-]+/, '').replace(/\s+/g, ' ').trim(); }).filter(Boolean).forEach(function (l) {
      var lw = fnorm(l), pm = /(\d+)\s*(portion|person)/.exec(lw);
      if (/^(zutaten|einkaufsliste)\b/.test(lw)) { mode = 'i'; if (pm) o.por = +pm[1]; return; }
      if (/^(zubereitung|anleitung|schritte|so geht|arbeitsschritte|zubereitungsschritte)\b/.test(lw)) { mode = 's'; return; }
      if (/^schritt \d+$/.test(lw)) return;
      if (/^\d+[.)]\s+\S/.test(l)) { o.st.push(l.replace(/^\d+[.)]\s*/, '').slice(0, 400)); return; }
      if (pm && l.length < 40 && /\b(fur|zutaten|ergibt|reicht)\b|^\d+ (portionen|personen)$/.test(lw)) { o.por = +pm[1]; return; }
      var ig = mode !== 's' && l.length <= 70 ? ingLine(l) : null;
      if (ig) { o.ing.push(ig); return; }
      if (mode === 'i' && l.length <= 40) { o.ing.push({ n: l.slice(0, 30), a: '', k: '', p: '' }); return; }
      if (mode === 's' || l.length > 45) { o.st.push(l.replace(/^(schritt\s*)?\d+[.):]\s*/i, '').slice(0, 400)); return; }
      if (!o.n && !mode && !/\d/.test(l)) o.n = l.slice(0, 30);
    });
    return o;
  }
  function dishImp() {
    var r = rcpParse($('dimp-t').value), dd = ui.dd;
    if (!r.ing.length && !r.st.length) { toast('Keine Zutaten erkannt', 'bolt'); return; }
    dd.ing = dd.ing.filter(function (q) { return q.n || q.a !== ''; }).concat(r.ing); if (!dd.ing.length) dd.ing.push({ n: '', a: '', k: '', p: '' });
    dd.st = (dd.st || []).concat(r.st); if (!dd.n && r.n) dd.n = r.n; if (r.por) dd.por = Math.min(50, r.por);
    var miss = r.ing.filter(function (q) { return !q.i; }).length;
    ui.sheet = { dishEdit: true }; sheetOpen(dishEditHtml(), true);
    toast(r.ing.length + ' Zutaten, ' + r.st.length + ' Schritte' + (miss ? ' · ' + miss + ' ohne Werte (zählen 0 kcal)' : ''), miss ? 'bolt' : 'check');
  }
  function saveDish() {
    // Zutaten mit Namen bleiben auch ohne Menge oder Werte (Gewürze, „nach Belieben“, zählen 0 kcal); mindestens eine braucht Menge und Werte
    readDraft(); var dd = ui.dd, val = function (q) { return (+q.a || 0) > 0 && ((+q.k || 0) > 0 || (+q.p || 0) > 0); }, ing = dd.ing.filter(function (q) { return val(q) || String(q.n || '').trim(); });
    if (!dd.n.trim()) { toast('Name fehlt', 'bolt'); return; }
    if (!ing.some(val)) { toast('Zutat mit Menge eintragen', 'bolt'); return; }
    var st = foodState(), o = { id: dd.id || 'd' + Date.now().toString(36), n: dd.n.trim().slice(0, 30), por: dd.por, ing: ing.map(function (q) {
      var r = { n: (q.n || '').trim().slice(0, 30), a: +q.a || 0, k: +q.k || 0, p: +q.p || 0 }; ['f', 'c', 'fb', 'su'].forEach(function (k) { if (q[k] != null) r[k] = +q[k] || 0; }); if (q.i) r.i = q.i; return r;
    }) };
    if (dd.m && dd.m.length) o.m = dd.m.slice();
    var sts = (dd.st || []).map(function (s) { return s.trim(); }).filter(Boolean); if (sts.length) o.st = sts;
    var ix = st.d.map(function (y) { return y.id; }).indexOf(o.id); if (ix >= 0) st.d[ix] = o; else st.d.push(o);
    persist(); ui.fresh = false; render(); toast('Gericht gespeichert', 'check'); dishBack(o.id);
  }
  // Aus dem Editor zurück in die Übersicht des Gerichts (wie aus dem Gerichte-Menü geöffnet); neues, nicht gespeichertes Gericht → Gerichte-Menü
  function dishBack(id) { if (!id || !fDish(id)) { openDishes(); return; } openPick(id); ui.sheet.from = 'd'; fpPaint(); }
